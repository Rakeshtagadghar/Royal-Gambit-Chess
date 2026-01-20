// Supabase Edge Function: analyze-game
// Uses Lichess Cloud Eval API for chess analysis (free, no auth required)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

// =============================================================================
// TYPES
// =============================================================================

type EvalType = "cp" | "mate";
type MoveClassification = "best" | "good" | "inaccuracy" | "mistake" | "blunder";

interface Evaluation {
  type: EvalType;
  value: number;
}

interface MoveData {
  ply: number;
  uci: string;
  san: string;
  fen_after: string;
}

interface AnalysisResult {
  ply: number;
  played_move_uci: string;
  played_move_san: string;
  best_move_uci: string;
  best_move_san: string;
  eval_before: Evaluation;
  eval_after: Evaluation;
  eval_loss_cp: number;
  classification: MoveClassification;
  pv_uci: string;
}

interface PlayerSummary {
  accuracy: number;
  acpl: number;
  blunders: number;
  mistakes: number;
  inaccuracies: number;
}

interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: {
    game_id: string;
    status: string;
  };
  schema: string;
  old_record: null | Record<string, unknown>;
}

interface LichessCloudEval {
  fen: string;
  knodes: number;
  depth: number;
  pvs: Array<{
    moves: string;
    cp?: number;
    mate?: number;
  }>;
}

// =============================================================================
// UTILS
// =============================================================================

const THRESHOLDS = {
  best: 20,
  good: 50,
  inaccuracy: 150,
  mistake: 300,
};

function classifyMove(evalLossCp: number): MoveClassification {
  const loss = Math.abs(evalLossCp);
  if (loss <= THRESHOLDS.best) return "best";
  if (loss <= THRESHOLDS.good) return "good";
  if (loss <= THRESHOLDS.inaccuracy) return "inaccuracy";
  if (loss <= THRESHOLDS.mistake) return "mistake";
  return "blunder";
}

function calculateAccuracy(acpl: number): number {
  if (acpl < 0) return 100;
  const accuracy = 103.1668 * Math.exp(-0.04354 * acpl) - 3.1669;
  return Math.max(0, Math.min(100, accuracy));
}

function evalToCentipawns(eval_: Evaluation): number {
  const MATE_SCORE = 10000;
  if (eval_.type === "mate") {
    if (eval_.value > 0) {
      return MATE_SCORE - Math.abs(eval_.value) * 10;
    } else {
      return -MATE_SCORE + Math.abs(eval_.value) * 10;
    }
  }
  return eval_.value;
}

function calculateEvalLoss(
  evalBefore: Evaluation,
  evalAfter: Evaluation,
  isWhiteMove: boolean
): number {
  const beforeCp = evalToCentipawns(evalBefore);
  const afterCp = evalToCentipawns(evalAfter);

  if (isWhiteMove) {
    // White wants high eval, loss = how much it dropped
    return beforeCp - afterCp;
  } else {
    // Black wants low eval, loss = how much it increased
    return afterCp - beforeCp;
  }
}

// =============================================================================
// LICHESS CLOUD EVAL API
// =============================================================================

const LICHESS_API_BASE = "https://lichess.org/api/cloud-eval";
const REQUEST_DELAY_MS = 100; // Rate limiting: ~10 requests per second

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getCloudEval(fen: string, multiPv = 1): Promise<{ eval: Evaluation; bestMove: string; pv: string[] } | null> {
  try {
    const url = `${LICHESS_API_BASE}?fen=${encodeURIComponent(fen)}&multiPv=${multiPv}`;
    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
      },
    });

    if (response.status === 404) {
      // Position not in cloud database
      return null;
    }

    if (!response.ok) {
      console.error(`Lichess API error: ${response.status}`);
      return null;
    }

    const data: LichessCloudEval = await response.json();

    if (!data.pvs || data.pvs.length === 0) {
      return null;
    }

    const pv = data.pvs[0];
    const moves = pv.moves ? pv.moves.split(" ") : [];

    let evaluation: Evaluation;
    if (pv.mate !== undefined) {
      evaluation = { type: "mate", value: pv.mate };
    } else if (pv.cp !== undefined) {
      evaluation = { type: "cp", value: pv.cp };
    } else {
      evaluation = { type: "cp", value: 0 };
    }

    return {
      eval: evaluation,
      bestMove: moves[0] || "",
      pv: moves,
    };
  } catch (error) {
    console.error("Cloud eval fetch error:", error);
    return null;
  }
}

// Simple evaluation estimation when cloud eval is not available
// This is a fallback that uses basic material counting
function estimateEval(fen: string): Evaluation {
  const pieces = fen.split(" ")[0];
  const values: Record<string, number> = {
    'P': 100, 'N': 320, 'B': 330, 'R': 500, 'Q': 900,
    'p': -100, 'n': -320, 'b': -330, 'r': -500, 'q': -900,
  };

  let score = 0;
  for (const char of pieces) {
    if (values[char]) {
      score += values[char];
    }
  }

  return { type: "cp", value: score };
}

// =============================================================================
// ANALYSIS
// =============================================================================

const PROGRESS_UPDATE_INTERVAL = 5;

async function analyzeGame(supabase: SupabaseClient, gameId: string): Promise<void> {
  try {
    // Check current status
    const { data: existing } = await supabase
      .from("game_analysis")
      .select("status")
      .eq("game_id", gameId)
      .single();

    if (existing?.status !== "pending") {
      console.log(`Skipping ${gameId} - status is ${existing?.status}`);
      return;
    }

    // Update status to processing
    await supabase
      .from("game_analysis")
      .update({
        status: "processing",
        started_at: new Date().toISOString(),
        engine_version: "lichess-cloud",
      })
      .eq("game_id", gameId);

    console.log(`Started processing game ${gameId}`);

    // Fetch game
    const { data: game, error: gameError } = await supabase
      .from("games")
      .select("id, initial_fen")
      .eq("id", gameId)
      .single();

    if (gameError || !game) {
      throw new Error(`Failed to fetch game: ${gameError?.message || "Not found"}`);
    }

    // Fetch moves
    const { data: moves, error: movesError } = await supabase
      .from("moves")
      .select("ply, uci, san, fen_after")
      .eq("game_id", gameId)
      .order("ply", { ascending: true });

    if (movesError || !moves?.length) {
      throw new Error(`Failed to fetch moves: ${movesError?.message || "No moves"}`);
    }

    console.log(`Analyzing ${moves.length} moves for game ${gameId}`);

    // Analyze each position
    const moveAnalyses: AnalysisResult[] = [];
    const initialFen = game.initial_fen || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

    // Get initial position evaluation
    let previousEval: Evaluation;
    const initialCloudEval = await getCloudEval(initialFen);
    if (initialCloudEval) {
      previousEval = initialCloudEval.eval;
    } else {
      previousEval = estimateEval(initialFen);
    }

    let cloudHits = 0;
    let cloudMisses = 0;

    for (let i = 0; i < moves.length; i++) {
      const move = moves[i] as MoveData;
      const isWhiteMove = move.ply % 2 === 1;
      const previousFen = i === 0 ? initialFen : (moves[i - 1] as MoveData).fen_after;

      // Get best move for position before this move
      let bestMove = move.uci; // Default to played move
      let pv: string[] = [move.uci];

      const beforeCloudEval = await getCloudEval(previousFen);
      if (beforeCloudEval) {
        bestMove = beforeCloudEval.bestMove || move.uci;
        pv = beforeCloudEval.pv;
        cloudHits++;
      } else {
        cloudMisses++;
      }

      await sleep(REQUEST_DELAY_MS);

      // Get evaluation after the played move
      const currentFen = move.fen_after;
      let evalAfter: Evaluation;

      const afterCloudEval = await getCloudEval(currentFen);
      if (afterCloudEval) {
        evalAfter = afterCloudEval.eval;
        cloudHits++;
      } else {
        evalAfter = estimateEval(currentFen);
        cloudMisses++;
      }

      await sleep(REQUEST_DELAY_MS);

      // Calculate centipawn loss
      const evalLossCp = calculateEvalLoss(previousEval, evalAfter, isWhiteMove);
      const clampedLoss = Math.max(0, evalLossCp);

      moveAnalyses.push({
        ply: move.ply,
        played_move_uci: move.uci,
        played_move_san: move.san,
        best_move_uci: bestMove,
        best_move_san: bestMove, // UCI format
        eval_before: previousEval,
        eval_after: evalAfter,
        eval_loss_cp: clampedLoss,
        classification: classifyMove(clampedLoss),
        pv_uci: pv.join(" "),
      });

      // Update progress
      if ((i + 1) % PROGRESS_UPDATE_INTERVAL === 0 || i === moves.length - 1) {
        await supabase
          .from("game_analysis")
          .update({ current_ply: i + 1 })
          .eq("game_id", gameId);
      }

      previousEval = evalAfter;
    }

    console.log(`Cloud eval stats: ${cloudHits} hits, ${cloudMisses} misses`);
    console.log(`Inserting ${moveAnalyses.length} move records`);

    // Insert move analyses
    const moveInserts = moveAnalyses.map((a) => ({
      game_id: gameId,
      ply: a.ply,
      played_move_uci: a.played_move_uci,
      played_move_san: a.played_move_san,
      best_move_uci: a.best_move_uci,
      best_move_san: a.best_move_san,
      eval_before_type: a.eval_before.type,
      eval_before_value: a.eval_before.value,
      eval_after_type: a.eval_after.type,
      eval_after_value: a.eval_after.value,
      eval_loss_cp: a.eval_loss_cp,
      classification: a.classification,
      pv_uci: a.pv_uci,
    }));

    const { error: insertError } = await supabase
      .from("move_analysis")
      .insert(moveInserts);

    if (insertError) {
      throw new Error(`Failed to insert move analyses: ${insertError.message}`);
    }

    // Calculate summaries
    const whiteMoves = moveAnalyses.filter((a) => a.ply % 2 === 1);
    const blackMoves = moveAnalyses.filter((a) => a.ply % 2 === 0);

    const whiteSummary = calculatePlayerSummary(whiteMoves);
    const blackSummary = calculatePlayerSummary(blackMoves);

    // Update with final results
    await supabase
      .from("game_analysis")
      .update({
        status: "done",
        completed_at: new Date().toISOString(),
        white_accuracy: whiteSummary.accuracy,
        white_acpl: whiteSummary.acpl,
        white_blunders: whiteSummary.blunders,
        white_mistakes: whiteSummary.mistakes,
        white_inaccuracies: whiteSummary.inaccuracies,
        black_accuracy: blackSummary.accuracy,
        black_acpl: blackSummary.acpl,
        black_blunders: blackSummary.blunders,
        black_mistakes: blackSummary.mistakes,
        black_inaccuracies: blackSummary.inaccuracies,
        current_ply: moves.length,
        total_plies: moves.length,
      })
      .eq("game_id", gameId);

    console.log(`Completed analysis for game ${gameId}`);
    console.log(`White: ${whiteSummary.accuracy.toFixed(1)}%, Black: ${blackSummary.accuracy.toFixed(1)}%`);

  } catch (error) {
    console.error(`Analysis failed for game ${gameId}:`, error);

    await supabase
      .from("game_analysis")
      .update({
        status: "failed",
        error_message: error instanceof Error ? error.message : "Unknown error",
      })
      .eq("game_id", gameId);
  }
}

function calculatePlayerSummary(moves: AnalysisResult[]): PlayerSummary {
  if (moves.length === 0) {
    return { accuracy: 100, acpl: 0, blunders: 0, mistakes: 0, inaccuracies: 0 };
  }

  const totalCpLoss = moves.reduce((sum, m) => sum + m.eval_loss_cp, 0);
  const acpl = totalCpLoss / moves.length;
  const accuracy = calculateAccuracy(acpl);

  return {
    accuracy: Math.round(accuracy * 100) / 100,
    acpl: Math.round(acpl * 100) / 100,
    blunders: moves.filter((m) => m.classification === "blunder").length,
    mistakes: moves.filter((m) => m.classification === "mistake").length,
    inaccuracies: moves.filter((m) => m.classification === "inaccuracy").length,
  };
}

// =============================================================================
// MAIN HANDLER
// =============================================================================

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload: WebhookPayload = await req.json();
    console.log("Received webhook:", JSON.stringify(payload));

    if (payload.type !== "INSERT" || payload.record?.status !== "pending") {
      return new Response(
        JSON.stringify({ message: "Skipped" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const gameId = payload.record.game_id;
    if (!gameId) {
      return new Response(
        JSON.stringify({ error: "Missing game_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // @ts-expect-error - EdgeRuntime available in Supabase
    if (typeof EdgeRuntime !== "undefined" && EdgeRuntime.waitUntil) {
      // @ts-expect-error - EdgeRuntime available in Supabase
      EdgeRuntime.waitUntil(analyzeGame(supabase, gameId));
      return new Response(
        JSON.stringify({ message: "Analysis started", game_id: gameId }),
        { status: 202, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      await analyzeGame(supabase, gameId);
      return new Response(
        JSON.stringify({ message: "Analysis completed", game_id: gameId }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
