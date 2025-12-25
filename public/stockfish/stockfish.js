// Stockfish.js Web Worker
// This is a minimal wrapper - for production, download the full stockfish.js
// from https://github.com/nicfisher/stockfish.js or similar

// For local development, this provides a fallback that makes random moves
// Replace with actual stockfish.js for full engine support

let initialized = false;

self.onmessage = function(e) {
  const message = e.data;
  
  if (message === 'uci') {
    self.postMessage('id name Stockfish (Fallback)');
    self.postMessage('id author RoyalGambit');
    self.postMessage('uciok');
    return;
  }
  
  if (message === 'isready') {
    initialized = true;
    self.postMessage('readyok');
    return;
  }
  
  if (message.startsWith('position')) {
    // Store position - would be used by real engine
    return;
  }
  
  if (message.startsWith('setoption')) {
    // Handle options - would be used by real engine
    return;
  }
  
  if (message.startsWith('go')) {
    // For fallback mode, we'll just return a random delay
    // The actual move generation happens in the hook
    setTimeout(() => {
      self.postMessage('bestmove 0000'); // Invalid move - triggers fallback
    }, 500);
    return;
  }
  
  if (message === 'stop') {
    return;
  }
  
  if (message === 'quit') {
    self.close();
    return;
  }
};

// Note: For production, replace this file with the actual stockfish.js
// You can download it from:
// 1. npm install stockfish.js, then copy from node_modules
// 2. https://github.com/nicfisher/stockfish.js/releases
// 3. Build from source: https://github.com/nicfisher/stockfish.wasm

