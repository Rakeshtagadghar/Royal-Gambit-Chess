/**
 * Analytics Event Functions
 *
 * All events use the dataLayer push mechanism for GTM.
 * Page views are handled by RouteTracker component.
 */

import { pushEvent } from "./datalayer";

// --- Auth Events ---

export function trackSignUp(method: "email" | "google") {
  pushEvent("sign_up", { method });
}

export function trackLogin(method: "email" | "google") {
  pushEvent("login", { method });
}

export function trackLogout() {
  pushEvent("logout", {});
}

// --- Game Events ---

export function trackGameStart(params: {
  gameId: string;
  mode: "bot" | "pvp" | "friend" | "online";
  timeControlInitialSec: number;
  timeControlIncrementSec: number;
  opponentType: "bot" | "human";
  isRanked?: boolean;
  isLoggedIn?: boolean;
}) {
  pushEvent(
    "game_start",
    {
      game_id: params.gameId,
      mode: params.mode,
      time_control_initial_sec: params.timeControlInitialSec,
      time_control_increment_sec: params.timeControlIncrementSec,
      opponent_type: params.opponentType,
      is_ranked: params.isRanked ?? false,
    },
    { isLoggedIn: params.isLoggedIn }
  );
}

export function trackGameEnd(params: {
  gameId: string;
  endReason:
    | "checkmate"
    | "stalemate"
    | "timeout"
    | "resign"
    | "draw"
    | "abandon"
    | "unknown";
  result: "1-0" | "0-1" | "1/2-1/2" | "win" | "loss" | "draw";
  movesCount: number;
  durationSec: number;
  isLoggedIn?: boolean;
}) {
  pushEvent(
    "game_end",
    {
      game_id: params.gameId,
      end_reason: params.endReason,
      result: params.result,
      moves_count: params.movesCount,
      duration_sec: params.durationSec,
    },
    { isLoggedIn: params.isLoggedIn }
  );
}

export function trackMoveSummary(params: {
  gameId: string;
  movesBucketSize: number;
  bucketIndex: number;
  playerColor: "white" | "black";
  timeSpentSecBucket: string;
}) {
  pushEvent("move_summary", {
    game_id: params.gameId,
    moves_bucket_size: params.movesBucketSize,
    bucket_index: params.bucketIndex,
    player_color: params.playerColor,
    time_spent_sec_bucket: params.timeSpentSecBucket,
  });
}

export function trackChatMessageSend(params: {
  gameId: string;
  chatContext: string;
  messageLengthBucket: string;
}) {
  pushEvent("chat_message_send", {
    game_id: params.gameId,
    chat_context: params.chatContext,
    message_length_bucket: params.messageLengthBucket,
  });
}

// --- Invitation Events ---

export function trackInviteCreate(params: {
  timeControlInitialSec: number;
  timeControlIncrementSec: number;
  preferredColor: "white" | "black" | "random";
  hasMessage: boolean;
}) {
  pushEvent("invite_create", {
    time_control_initial_sec: params.timeControlInitialSec,
    time_control_increment_sec: params.timeControlIncrementSec,
    preferred_color: params.preferredColor,
    has_message: params.hasMessage,
  });
}

export function trackInviteRespond(params: {
  action: "accept" | "decline";
  timeControlInitialSec: number;
  timeControlIncrementSec: number;
}) {
  pushEvent("invite_respond", {
    action: params.action,
    time_control_initial_sec: params.timeControlInitialSec,
    time_control_increment_sec: params.timeControlIncrementSec,
  });
}

// --- Matchmaking Events ---

export function trackMatchmakingJoin(params: {
  mode: string;
  timeControlInitialSec: number;
  timeControlIncrementSec: number;
}) {
  pushEvent("matchmaking_join", {
    mode: params.mode,
    time_control_initial_sec: params.timeControlInitialSec,
    time_control_increment_sec: params.timeControlIncrementSec,
  });
}

export function trackMatchmakingLeave(mode: string) {
  pushEvent("matchmaking_leave", { mode });
}

// --- Learn Events ---

export function trackTutorialBegin(params: {
  trackSlug: string;
  lessonSlug: string;
  level: string;
  isLoggedIn?: boolean;
}) {
  pushEvent(
    "tutorial_begin",
    {
      track_slug: params.trackSlug,
      lesson_slug: params.lessonSlug,
      level: params.level,
    },
    { isLoggedIn: params.isLoggedIn }
  );
}

export function trackTutorialComplete(params: {
  trackSlug: string;
  lessonSlug: string;
  level: string;
  attempts: number;
  hintsUsed: number;
  timeSpentSec: number;
  isLoggedIn?: boolean;
}) {
  pushEvent(
    "tutorial_complete",
    {
      track_slug: params.trackSlug,
      lesson_slug: params.lessonSlug,
      level: params.level,
      attempts: params.attempts,
      hints_used: params.hintsUsed,
      time_spent_sec: params.timeSpentSec,
    },
    { isLoggedIn: params.isLoggedIn }
  );
}

export function trackLevelStart(params: {
  practiceSlug: string;
  topic: string;
  levelName: string;
}) {
  pushEvent("level_start", {
    practice_slug: params.practiceSlug,
    topic: params.topic,
    level_name: params.levelName,
  });
}

export function trackLevelEnd(params: {
  practiceSlug: string;
  topic: string;
  levelName: string;
  score: number;
  timeSpentSec: number;
}) {
  pushEvent("level_end", {
    practice_slug: params.practiceSlug,
    topic: params.topic,
    level_name: params.levelName,
    score: params.score,
    time_spent_sec: params.timeSpentSec,
  });
}

// Legacy function names for backward compatibility
export function trackLessonComplete(lessonSlug: string) {
  pushEvent("tutorial_complete", { lesson_slug: lessonSlug });
}

export function trackPuzzleSolved(puzzleId: string, correct: boolean) {
  pushEvent("level_end", {
    practice_slug: puzzleId,
    score: correct ? 1 : 0,
  });
}

// --- Content Selection ---

export function trackSelectContent(contentType: string, itemId: string) {
  pushEvent("select_content", {
    content_type: contentType,
    item_id: itemId,
  });
}

// --- Settings Events ---

export function trackSettingsChange(settingKey: string, valueBucket: string) {
  pushEvent("settings_change", {
    setting_key: settingKey,
    setting_value_bucket: valueBucket,
  });
}

// --- Error & Performance Events ---

export function trackException(params: {
  errorCode: string;
  errorArea: string;
  isFatal: boolean;
}) {
  pushEvent("exception", {
    error_code: params.errorCode,
    error_area: params.errorArea,
    is_fatal: params.isFatal,
  });
}

export function trackWebVitals(params: {
  metricName: string;
  metricValue: number;
  metricRating: "good" | "needs-improvement" | "poor";
  navigationType: string;
}) {
  pushEvent("web_vitals", {
    metric_name: params.metricName,
    metric_value: params.metricValue,
    metric_rating: params.metricRating,
    navigation_type: params.navigationType,
  });
}
