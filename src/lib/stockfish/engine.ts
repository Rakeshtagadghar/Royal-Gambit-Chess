import { BotDifficulty, BOT_DIFFICULTIES } from '@/types/chess';

type StockfishCallback = (bestMove: string) => void;

class StockfishEngine {
  private worker: Worker | null = null;
  private isReady = false;
  private callbacks: Map<string, StockfishCallback> = new Map();
  private currentCallback: StockfishCallback | null = null;

  async init(): Promise<void> {
    if (this.worker) return;

    return new Promise((resolve, reject) => {
      try {
        // Use stockfish.js from CDN
        this.worker = new Worker('/stockfish/stockfish.js');
        
        this.worker.onmessage = (e) => {
          const message = e.data;
          
          if (message === 'uciok') {
            this.isReady = true;
            this.worker?.postMessage('isready');
          }
          
          if (message === 'readyok') {
            resolve();
          }
          
          // Parse best move response
          if (typeof message === 'string' && message.startsWith('bestmove')) {
            const parts = message.split(' ');
            const bestMove = parts[1];
            if (bestMove && this.currentCallback) {
              this.currentCallback(bestMove);
              this.currentCallback = null;
            }
          }
        };

        this.worker.onerror = (error) => {
          console.error('Stockfish error:', error);
          reject(error);
        };

        // Initialize UCI protocol
        this.worker.postMessage('uci');
      } catch (error) {
        reject(error);
      }
    });
  }

  setPosition(fen: string): void {
    if (!this.worker || !this.isReady) return;
    this.worker.postMessage(`position fen ${fen}`);
  }

  async getBestMove(
    fen: string, 
    difficulty: BotDifficulty,
    onMove: StockfishCallback
  ): Promise<void> {
    if (!this.worker || !this.isReady) {
      await this.init();
    }

    this.currentCallback = onMove;
    this.setPosition(fen);
    
    // Set skill level based on difficulty (0-20 scale)
    const difficultyIndex = BOT_DIFFICULTIES.findIndex(d => d.label === difficulty.label);
    const skillLevel = Math.min(20, difficultyIndex * 4);
    
    this.worker?.postMessage(`setoption name Skill Level value ${skillLevel}`);
    this.worker?.postMessage(`go depth ${difficulty.depth} movetime ${difficulty.moveTimeMs}`);
  }

  stop(): void {
    if (this.worker) {
      this.worker.postMessage('stop');
    }
  }

  quit(): void {
    if (this.worker) {
      this.worker.postMessage('quit');
      this.worker.terminate();
      this.worker = null;
      this.isReady = false;
    }
  }
}

// Singleton instance
let engineInstance: StockfishEngine | null = null;

export function getStockfishEngine(): StockfishEngine {
  if (!engineInstance) {
    engineInstance = new StockfishEngine();
  }
  return engineInstance;
}

export { StockfishEngine };

