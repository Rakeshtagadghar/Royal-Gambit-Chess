# ♟ OpenChess

A modern, open-source chess platform built with Next.js. Play against bots, friends, or find opponents online.

![OpenChess Screenshot](./public/screenshot.png)

## Features

- 🤖 **Play vs Bot** - Challenge Stockfish at 5 difficulty levels
- 👥 **Play vs Friends** - Create a game and share the link
- 🎯 **Matchmaking** - Find opponents automatically
- ⏱️ **Time Controls** - Bullet, Blitz, Rapid, and Classical
- 🎨 **Beautiful UI** - Modern design with smooth animations
- 📱 **Responsive** - Play on desktop or mobile
- 🔒 **Secure** - Server-validated moves, no client-side cheating

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, TailwindCSS
- **UI Components**: shadcn/ui, Framer Motion
- **Chess**: react-chessboard, chess.js, Stockfish WASM
- **State**: Zustand, TanStack Query
- **Backend**: Supabase (Auth, Database, Realtime)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A [Supabase](https://supabase.com) account (free tier works)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/openchess.git
   cd openchess
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to SQL Editor and run the schema from `supabase/schema.sql`
   - Go to Settings > API and copy your project URL and anon key

4. **Configure environment**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

5. **Set up Stockfish (optional but recommended)**
   
   For full Stockfish engine support, download stockfish.js:
   ```bash
   # Option 1: Download from CDN
   curl -o public/stockfish/stockfish.js https://cdn.jsdelivr.net/npm/stockfish.js@10.0.2/stockfish.js
   
   # Option 2: Build from source (advanced)
   # See https://github.com/nicfisher/stockfish.wasm
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
openchess/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── api/            # API routes
│   │   ├── bot/            # Bot game page
│   │   ├── game/[id]/      # Live game room
│   │   ├── lobby/          # Create/join games
│   │   ├── login/          # Authentication
│   │   ├── play/           # Mode selection
│   │   ├── profile/        # User profiles
│   │   ├── archive/        # Game history
│   │   └── settings/       # User settings
│   ├── components/
│   │   ├── chess/          # Chess components
│   │   ├── layout/         # Layout components
│   │   ├── providers/      # Context providers
│   │   └── ui/             # shadcn/ui components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities and configs
│   ├── stores/             # Zustand stores
│   └── types/              # TypeScript types
├── public/
│   └── stockfish/          # Stockfish engine files
├── supabase/
│   └── schema.sql          # Database schema
└── ...config files
```

## Database Schema

The app uses 4 main tables:

- **profiles** - User profiles (extends Supabase auth)
- **games** - Game records with FEN, PGN, time control
- **moves** - Individual moves for replay
- **matchmaking_queue** - Players waiting for match

See `supabase/schema.sql` for the complete schema with RLS policies.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

### Self-hosted

```bash
npm run build
npm start
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Roadmap

- [ ] Ratings (Glicko/Elo system)
- [ ] Puzzles from lichess database
- [ ] Analysis board with engine evaluation
- [ ] Tournaments
- [ ] Opening explorer
- [ ] Mobile app (React Native)

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- [chess.js](https://github.com/jhlywa/chess.js) - Chess logic
- [react-chessboard](https://github.com/Clariity/react-chessboard) - Board UI
- [Stockfish](https://stockfishchess.org/) - Chess engine
- [Lichess](https://lichess.org) - Inspiration
- [shadcn/ui](https://ui.shadcn.com) - UI components
