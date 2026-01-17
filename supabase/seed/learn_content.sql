-- Seed file for Learn/Tutorial content
-- Run this after the migration to populate sample lessons and puzzles

-- ============================================
-- CLEAN UP EXISTING DATA (optional - uncomment to reset)
-- ============================================
-- DELETE FROM learn_lesson_steps;
-- DELETE FROM learn_lessons;
-- DELETE FROM learn_pack_items;
-- DELETE FROM learn_puzzles;
-- DELETE FROM learn_practice_packs;
-- DELETE FROM learn_tracks;

-- ============================================
-- LEARNING TRACKS
-- ============================================
INSERT INTO learn_tracks (slug, title, level, description, order_index, estimated_hours, is_published) VALUES
  ('beginner-basics', 'Chess Basics', 'beginner', 'Learn how the pieces move, basic rules, and your first checkmate patterns.', 0, 2.0, true),
  ('beginner-tactics', 'Basic Tactics', 'beginner', 'Master the fundamental tactical patterns: forks, pins, and skewers.', 1, 2.5, true),
  ('intermediate-openings', 'Opening Principles', 'intermediate', 'Learn the key principles to start every game with confidence.', 2, 3.0, true),
  ('intermediate-endgames', 'Essential Endgames', 'intermediate', 'Master the endgame positions every player must know.', 3, 3.5, true),
  ('advanced-strategy', 'Strategic Thinking', 'advanced', 'Develop deep positional understanding and long-term planning.', 4, 4.0, true),
  ('expert-mastery', 'Master Class', 'expert', 'Advanced concepts and techniques for serious tournament players.', 5, 5.0, true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- BEGINNER LESSONS - Chess Basics Track
-- ============================================

-- Get track ID
DO $$
DECLARE
  v_track_id UUID;
  v_lesson_id UUID;
BEGIN
  SELECT id INTO v_track_id FROM learn_tracks WHERE slug = 'beginner-basics';

  -- Lesson 1: How the Pawn Moves
  INSERT INTO learn_lessons (track_id, slug, title, topic, level, description, estimated_minutes, order_index, is_published)
  VALUES (v_track_id, 'how-pawn-moves', 'How the Pawn Moves', 'rules', 'beginner', 'Learn how pawns move, capture, and promote.', 5, 0, true)
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_lesson_id;

  -- Steps for Pawn lesson (only insert if lesson was newly created)
  IF v_lesson_id IS NOT NULL THEN
    INSERT INTO learn_lesson_steps (lesson_id, step_index, type, title, body_md, initial_fen, meta) VALUES
    (v_lesson_id, 0, 'explain', 'The Humble Pawn', 'Pawns are the soul of chess! They may be small, but they''re mighty important.

**Key facts about pawns:**
- Each side starts with 8 pawns
- Pawns can only move forward, never backward
- They''re the only piece that captures differently than it moves', 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', '{"highlights": ["a2", "b2", "c2", "d2", "e2", "f2", "g2", "h2"]}'),

    (v_lesson_id, 1, 'explain', 'Moving Forward', 'Pawns move **straight forward** one square at a time.

But there''s a special rule: from their starting position, pawns can move **two squares** forward on their first move!', '4k3/8/8/8/8/8/4P3/4K3 w - - 0 1', '{"arrows": [{"from": "e2", "to": "e3", "color": "green"}, {"from": "e2", "to": "e4", "color": "blue"}]}'),

    (v_lesson_id, 2, 'move_task', 'Your Turn!', 'Move the pawn forward two squares to e4.', '4k3/8/8/8/8/8/4P3/4K3 w - - 0 1', '{"pieceToMove": "e2"}');

  UPDATE learn_lesson_steps SET required_move_uci = 'e2e4', explain_correct_md = 'Perfect! Moving two squares on the first move is called a "double pawn push."', explain_wrong_md = 'Try moving the pawn from e2 to e4 (two squares forward).', hints = '["Look at the pawn on e2", "Pawns can move two squares on their first move"]' WHERE lesson_id = v_lesson_id AND step_index = 2;

  INSERT INTO learn_lesson_steps (lesson_id, step_index, type, title, body_md, initial_fen, meta) VALUES
    (v_lesson_id, 3, 'explain', 'Capturing Diagonally', 'Here''s the tricky part: pawns **capture diagonally**, not straight ahead!

If a piece is directly in front of a pawn, the pawn is blocked and cannot move.', '4k3/8/8/3p4/4P3/8/8/4K3 w - - 0 1', '{"arrows": [{"from": "e4", "to": "d5", "color": "red"}], "highlights": ["d5"]}'),

    (v_lesson_id, 4, 'move_task', 'Capture the Pawn', 'Use your pawn to capture the black pawn diagonally.', '4k3/8/8/3p4/4P3/8/8/4K3 w - - 0 1', '{"pieceToMove": "e4"}');

  UPDATE learn_lesson_steps SET required_move_uci = 'e4d5', explain_correct_md = 'Excellent! Pawns always capture diagonally, one square forward.', explain_wrong_md = 'Capture the black pawn by moving diagonally to d5.', hints = '["Pawns capture diagonally", "Move from e4 to d5"]' WHERE lesson_id = v_lesson_id AND step_index = 4;

  INSERT INTO learn_lesson_steps (lesson_id, step_index, type, title, body_md, initial_fen, meta) VALUES
    (v_lesson_id, 5, 'explain', 'Pawn Promotion', 'When a pawn reaches the opposite end of the board, it **promotes** to any piece you choose (except a king).

Most players promote to a queen since it''s the most powerful piece!', '4k3/4P3/8/8/8/8/8/4K3 w - - 0 1', '{"highlights": ["e7"], "arrows": [{"from": "e7", "to": "e8", "color": "gold"}]}'),

    (v_lesson_id, 6, 'quiz', 'Quick Quiz!', 'Test your knowledge about pawns.', NULL, '{"quiz": {"question": "How do pawns capture enemy pieces?", "options": [{"id": "a", "text": "Straight forward"}, {"id": "b", "text": "Diagonally forward"}, {"id": "c", "text": "In any direction"}, {"id": "d", "text": "Sideways"}], "correctOptionId": "b", "explainMd": "Pawns are unique because they move straight but capture diagonally!"}}');
  END IF;

  -- Lesson 2: The Knight
  INSERT INTO learn_lessons (track_id, slug, title, topic, level, description, estimated_minutes, order_index, is_published)
  VALUES (v_track_id, 'the-knight', 'The Tricky Knight', 'rules', 'beginner', 'Master the unique L-shaped movement of the knight.', 5, 1, true)
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_lesson_id;

  IF v_lesson_id IS NOT NULL THEN
    INSERT INTO learn_lesson_steps (lesson_id, step_index, type, title, body_md, initial_fen, meta) VALUES
    (v_lesson_id, 0, 'explain', 'Meet the Knight', 'The knight is the trickiest piece on the board. It moves in an **L-shape**:
- Two squares in one direction
- Then one square perpendicular

Knights are special: they''re the only piece that can **jump over** other pieces!', '4k3/8/8/8/4N3/8/8/4K3 w - - 0 1', '{"highlights": ["e4"]}'),

    (v_lesson_id, 1, 'explain', 'The L-Shape', 'From the center, a knight can reach up to 8 different squares.

Think of it as: "two squares like a rook, then one square to the side."', '4k3/8/8/8/4N3/8/8/4K3 w - - 0 1', '{"highlights": ["d6", "f6", "c5", "g5", "c3", "g3", "d2", "f2"]}'),

    (v_lesson_id, 2, 'move_task', 'Knight Jump!', 'Move the knight to capture the black pawn on f6.', '4k3/8/5p2/8/4N3/8/8/4K3 w - - 0 1', '{"pieceToMove": "e4"}');

  UPDATE learn_lesson_steps SET required_move_uci = 'e4f6', explain_correct_md = 'Great job! The knight jumped in its L-shape pattern.', explain_wrong_md = 'Move the knight in an L-shape: two squares up and one to the right.', hints = '["Knights move in an L-shape", "Two squares up, one to the right gets you to f6"]' WHERE lesson_id = v_lesson_id AND step_index = 2;

  INSERT INTO learn_lesson_steps (lesson_id, step_index, type, title, body_md, initial_fen, meta) VALUES
    (v_lesson_id, 3, 'explain', 'Jumping Over Pieces', 'Unlike any other piece, knights can jump over both friendly and enemy pieces.

This makes them perfect for crowded positions!', 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3', '{"arrows": [{"from": "f3", "to": "g5", "color": "green"}]}'),

    (v_lesson_id, 4, 'quiz', 'Knight Quiz', 'Test your understanding of the knight.', NULL, '{"quiz": {"question": "What makes the knight unique compared to other pieces?", "options": [{"id": "a", "text": "It can move backwards"}, {"id": "b", "text": "It can jump over other pieces"}, {"id": "c", "text": "It can capture multiple pieces at once"}, {"id": "d", "text": "It can move unlimited squares"}], "correctOptionId": "b", "explainMd": "The knight is the only piece that can jump over other pieces on the board!"}}');
  END IF;

  -- Lesson 3: Checkmate with Rook
  INSERT INTO learn_lessons (track_id, slug, title, topic, level, description, estimated_minutes, order_index, prerequisite_lesson_ids, is_published)
  VALUES (v_track_id, 'back-rank-mate', 'Back Rank Checkmate', 'tactics', 'beginner', 'Learn the most common checkmate pattern in chess.', 4, 2, '[]', true)
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_lesson_id;

  IF v_lesson_id IS NOT NULL THEN
    INSERT INTO learn_lesson_steps (lesson_id, step_index, type, title, body_md, initial_fen, meta) VALUES
    (v_lesson_id, 0, 'explain', 'The Back Rank', 'The **back rank** is the row where the king starts (rank 1 for White, rank 8 for Black).

When a king is trapped on the back rank by its own pawns, it''s vulnerable to checkmate!', '6k1/5ppp/8/8/8/8/8/R3K3 w - - 0 1', '{"highlights": ["g8", "f7", "g7", "h7"]}'),

    (v_lesson_id, 1, 'explain', 'Setting Up the Mate', 'Look at this position. The black king is stuck behind its own pawns.

Your rook can deliver checkmate by attacking the back rank!', '6k1/5ppp/8/8/8/8/8/R3K3 w - - 0 1', '{"arrows": [{"from": "a1", "to": "a8", "color": "red"}]}'),

    (v_lesson_id, 2, 'move_task', 'Deliver Checkmate!', 'Use your rook to checkmate the black king.', '6k1/5ppp/8/8/8/8/8/R3K3 w - - 0 1', '{"pieceToMove": "a1"}');

  UPDATE learn_lesson_steps SET required_move_uci = 'a1a8', explain_correct_md = 'Checkmate! The king has nowhere to escape because its own pawns block it.', explain_wrong_md = 'Move the rook to the 8th rank to deliver checkmate.', hints = '["The back rank is row 8", "Move the rook straight up the a-file"]' WHERE lesson_id = v_lesson_id AND step_index = 2;

  INSERT INTO learn_lesson_steps (lesson_id, step_index, type, title, body_md, initial_fen, meta) VALUES
    (v_lesson_id, 3, 'explain', 'Key Takeaway', 'The back rank mate is one of the most common checkmates in chess.

**Remember:** Always give your king an escape square (called "luft" in chess) by moving a pawn!', '6k1/5pp1/7p/8/8/8/8/R3K3 w - - 0 1', '{"highlights": ["h6"], "arrows": [{"from": "g8", "to": "h7", "color": "green"}]}');
  END IF;

  -- Lesson 4: Board Coordinates
  INSERT INTO learn_lessons (track_id, slug, title, topic, level, description, estimated_minutes, order_index, is_published)
  VALUES (v_track_id, 'board-coordinates', 'Board Coordinates', 'rules', 'beginner', 'Learn to read and identify squares on the chess board using coordinates like a1, e4, h8.', 4, 3, true)
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_lesson_id;

  IF v_lesson_id IS NOT NULL THEN
    INSERT INTO learn_lesson_steps (lesson_id, step_index, type, title, body_md, initial_fen, meta) VALUES
      (v_lesson_id, 0, 'explain', 'The Chess Grid', 'Every square on the chess board has a unique name made of a **letter** and a **number**.

- **Files** (columns) are labeled **a** through **h** from left to right
- **Ranks** (rows) are labeled **1** through **8** from bottom to top

Together they create coordinates like **e4** or **a1**!', 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', '{}'),

      (v_lesson_id, 1, 'explain', 'Files: a to h', 'The vertical columns are called **files**. They are labeled with letters from **a** to **h**.

- The **a-file** is on the left (where the rooks start)
- The **h-file** is on the right
- The **e-file** and **d-file** are the center files', 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', '{"highlights": ["a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8"]}'),

      (v_lesson_id, 2, 'explain', 'Ranks: 1 to 8', 'The horizontal rows are called **ranks**. They are labeled with numbers from **1** to **8**.

- **Rank 1** is where White''s pieces start
- **Rank 8** is where Black''s pieces start
- **Rank 4** and **Rank 5** are the center of the board', 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', '{"highlights": ["a1", "b1", "c1", "d1", "e1", "f1", "g1", "h1"]}'),

      (v_lesson_id, 3, 'explain', 'Combining Files and Ranks', 'To name any square, combine the **file letter** + **rank number**.

For example:
- **e4** = e-file, 4th rank (a famous opening square!)
- **a1** = bottom-left corner (White''s queenside rook)
- **h8** = top-right corner (Black''s kingside rook)', 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1', '{"highlights": ["e4", "a1", "h8"]}'),

      (v_lesson_id, 4, 'quiz', 'Find the Corner!', 'Test your knowledge of board coordinates.', NULL, '{"quiz": {"question": "Which square is in the bottom-left corner of the board (from White''s perspective)?", "options": [{"id": "a", "text": "a1"}, {"id": "b", "text": "h1"}, {"id": "c", "text": "a8"}, {"id": "d", "text": "h8"}], "correctOptionId": "a", "explainMd": "a1 is the bottom-left corner. Remember: files go a-h left to right, ranks go 1-8 bottom to top!"}}'),

      (v_lesson_id, 5, 'quiz', 'Center Square', 'Where is e4?', NULL, '{"quiz": {"question": "The square e4 is one of the most important central squares. Where is it located?", "options": [{"id": "a", "text": "Center of the board"}, {"id": "b", "text": "Top-right corner"}, {"id": "c", "text": "Bottom row"}, {"id": "d", "text": "Left edge"}], "correctOptionId": "a", "explainMd": "e4 is in the center of the board (e-file, 4th rank). Controlling the center is crucial in chess!"}}'),

      (v_lesson_id, 6, 'quiz', 'King''s Starting Square', 'Where does the White king start?', NULL, '{"quiz": {"question": "On which square does the White king begin the game?", "options": [{"id": "a", "text": "e1"}, {"id": "b", "text": "d1"}, {"id": "c", "text": "e8"}, {"id": "d", "text": "f1"}], "correctOptionId": "a", "explainMd": "The White king starts on e1. The Black king starts on e8. Kings always start on the e-file!"}}'),

      (v_lesson_id, 7, 'quiz', 'Opposite Corners', 'Test your coordinate knowledge!', NULL, '{"quiz": {"question": "If a1 is the bottom-left corner, which square is the opposite corner (top-right)?", "options": [{"id": "a", "text": "h8"}, {"id": "b", "text": "a8"}, {"id": "c", "text": "h1"}, {"id": "d", "text": "g7"}], "correctOptionId": "a", "explainMd": "h8 is the top-right corner, directly opposite from a1. a1 to h8 is the longest diagonal on the board!"}}');
  END IF;

END $$;

-- ============================================
-- BEGINNER TACTICS TRACK
-- ============================================

DO $$
DECLARE
  v_track_id UUID;
  v_lesson_id UUID;
BEGIN
  SELECT id INTO v_track_id FROM learn_tracks WHERE slug = 'beginner-tactics';

  -- Lesson: The Fork
  INSERT INTO learn_lessons (track_id, slug, title, topic, level, description, estimated_minutes, order_index, is_published)
  VALUES (v_track_id, 'knight-fork', 'The Knight Fork', 'tactics', 'beginner', 'Learn how to attack two pieces at once with your knight.', 5, 0, true)
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_lesson_id;

  IF v_lesson_id IS NOT NULL THEN
    INSERT INTO learn_lesson_steps (lesson_id, step_index, type, title, body_md, initial_fen, meta) VALUES
      (v_lesson_id, 0, 'explain', 'What is a Fork?', 'A **fork** is when one piece attacks two or more enemy pieces at the same time.

The knight is the best piece for forks because of its unique L-shaped movement!', 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', '{}'),

      (v_lesson_id, 1, 'explain', 'The Royal Fork', 'The most devastating fork attacks the king AND queen simultaneously.

Since the king must move out of check, the queen gets captured!', 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4', '{"highlights": ["d8", "e8"]}'),

      (v_lesson_id, 2, 'move_task', 'Find the Fork!', 'Move your knight to fork the king and queen.', 'r2qk2r/ppp2ppp/2n2n2/2bNp3/2B1P3/8/PPPP1PPP/RNBQK2R b KQkq - 5 5', '{"pieceToMove": "d5", "boardPrefs": {"orientation": "black"}}');

    UPDATE learn_lesson_steps SET required_move_uci = 'd5c7', initial_fen = 'r2qk2r/ppp2ppp/2n2n2/2bNp1b1/2B1P3/8/PPPP1PPP/RNBQK2R w KQkq - 0 1', explain_correct_md = 'Brilliant! The knight on c7 attacks both the king on e8 and the rook on a8.', explain_wrong_md = 'Look for a square where the knight can attack the king and rook at once.', hints = '["Knights attack in an L-shape", "Find a square that reaches both the king and rook"]' WHERE lesson_id = v_lesson_id AND step_index = 2;

    INSERT INTO learn_lesson_steps (lesson_id, step_index, type, title, body_md, initial_fen, meta) VALUES
      (v_lesson_id, 3, 'puzzle', 'Fork Practice', 'Find the winning knight fork!', 'r1q1r1k1/ppp2ppp/2n5/3N4/1bBn4/8/PPP2PPP/RNBQ1RK1 w - - 0 1', '{}');

    UPDATE learn_lesson_steps SET solution_line_uci = '["d5e7"]', explain_correct_md = 'Excellent! Ne7+ forks the king and queen!', explain_wrong_md = 'Look for a knight move that gives check and attacks another piece.', hints = '["The knight can give check", "Look for a double attack"]' WHERE lesson_id = v_lesson_id AND step_index = 3;
  END IF;

  -- Lesson: The Pin
  INSERT INTO learn_lessons (track_id, slug, title, topic, level, description, estimated_minutes, order_index, is_published)
  VALUES (v_track_id, 'the-pin', 'The Deadly Pin', 'tactics', 'beginner', 'Learn how to immobilize pieces with pins.', 5, 1, true)
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_lesson_id;

  IF v_lesson_id IS NOT NULL THEN
    INSERT INTO learn_lesson_steps (lesson_id, step_index, type, title, body_md, initial_fen, meta) VALUES
      (v_lesson_id, 0, 'explain', 'What is a Pin?', 'A **pin** occurs when a piece cannot move because moving it would expose a more valuable piece behind it.

Pins are incredibly powerful because they restrict your opponent''s options!', 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', '{}'),

      (v_lesson_id, 1, 'explain', 'Absolute Pin', 'An **absolute pin** is against the king - the pinned piece CANNOT legally move.

Here, the knight is pinned to the king by the bishop. Moving the knight would be illegal!', 'r1bqk2r/pppp1ppp/2n5/4p3/1b2n3/2N2N2/PPPPBPPP/R1BQK2R w KQkq - 0 1', '{"arrows": [{"from": "b4", "to": "e1", "color": "red"}], "highlights": ["c3"]}'),

      (v_lesson_id, 2, 'move_task', 'Create a Pin', 'Move your bishop to pin the knight to the king.', 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4', '{"pieceToMove": "c1"}');

    UPDATE learn_lesson_steps SET required_move_uci = 'c1g5', explain_correct_md = 'Perfect! The bishop on g5 pins the knight on f6 to the queen on d8.', explain_wrong_md = 'Move the bishop to a square where it attacks the knight and threatens the queen behind it.', hints = '["Look at the diagonal from c1", "The knight on f6 is in front of a valuable piece"]' WHERE lesson_id = v_lesson_id AND step_index = 2;
  END IF;

END $$;

-- ============================================
-- PRACTICE PACKS
-- ============================================

INSERT INTO learn_practice_packs (slug, title, level, topic, description, is_published) VALUES
  ('fork-practice-beginner', 'Fork Fundamentals', 'beginner', 'tactics', 'Practice finding knight forks and double attacks.', true),
  ('mate-in-one', 'Mate in One', 'beginner', 'tactics', 'Find the checkmate in one move.', true),
  ('pin-practice', 'Pin Practice', 'beginner', 'tactics', 'Learn to spot and exploit pins.', true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- PUZZLES
-- ============================================

-- Fork puzzles
INSERT INTO learn_puzzles (level, topic, initial_fen, solution_line_uci, explanation_md, rating) VALUES
  ('beginner', 'fork', 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4', '["h5f7"]', 'Qxf7+ forks the king and rook!', 800),
  ('beginner', 'fork', '6k1/5ppp/8/8/2n5/8/5PPP/4R1K1 b - - 0 1', '["c4e3"]', 'Ne3 forks the king and rook.', 850),
  ('beginner', 'fork', 'r2qkb1r/ppp2ppp/2n1bn2/3Np3/2B1P3/8/PPPP1PPP/RNBQK2R w KQkq - 0 1', '["d5c7"]', 'Nc7+ is a royal fork winning the rook!', 900),
  ('beginner', 'fork', 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R b KQkq - 0 5', '["c5f2"]', 'Bxf2+ forks king and rook.', 850)
ON CONFLICT DO NOTHING;

-- Mate in one puzzles
INSERT INTO learn_puzzles (level, topic, initial_fen, solution_line_uci, explanation_md, rating) VALUES
  ('beginner', 'mate', '6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1', '["e1e8"]', 'Back rank mate! The king is trapped by its own pawns.', 600),
  ('beginner', 'mate', 'r1bqkb1r/pppp1Qpp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4', '["f7f8"]', 'Scholar''s mate - Qxf7#', 500),
  ('beginner', 'mate', '5rk1/5ppp/8/8/1Q6/8/5PPP/6K1 w - - 0 1', '["b4g4"]', 'Qg4 with checkmate - the queen delivers mate supported by the diagonal.', 700),
  ('beginner', 'mate', 'r1b1k2r/ppppqppp/2n2n2/2b1p3/2B1P3/3P1Q2/PPP2PPP/RNB1K1NR w KQkq - 0 1', '["f3f7"]', 'Qxf7#! The queen checkmates with support from the bishop.', 750)
ON CONFLICT DO NOTHING;

-- Pin puzzles
INSERT INTO learn_puzzles (level, topic, initial_fen, solution_line_uci, explanation_md, rating) VALUES
  ('beginner', 'pin', 'r1bqk2r/pppp1ppp/2n2n2/4p3/1b2P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 4 4', '["f1b5"]', 'Bb5 pins the knight to the king!', 800),
  ('beginner', 'pin', 'r2qkb1r/ppp2ppp/2n1bn2/3pp3/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 0 5', '["c1g5"]', 'Bg5 pins the knight to the queen.', 850),
  ('beginner', 'pin', 'r1bqk2r/ppppbppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4', '["f3g5"]', 'Ng5 pins the f7 pawn and threatens Nxf7.', 900)
ON CONFLICT DO NOTHING;

-- ============================================
-- LINK PUZZLES TO PACKS
-- ============================================

DO $$
DECLARE
  v_pack_id UUID;
  v_puzzle_ids UUID[];
  v_puzzle_id UUID;
  v_order INT;
BEGIN
  -- Fork practice pack
  SELECT id INTO v_pack_id FROM learn_practice_packs WHERE slug = 'fork-practice-beginner';
  SELECT array_agg(id) INTO v_puzzle_ids FROM learn_puzzles WHERE topic = 'fork' AND level = 'beginner';

  v_order := 0;
  FOREACH v_puzzle_id IN ARRAY v_puzzle_ids LOOP
    INSERT INTO learn_pack_items (pack_id, puzzle_id, order_index)
    VALUES (v_pack_id, v_puzzle_id, v_order)
    ON CONFLICT (pack_id, puzzle_id) DO NOTHING;
    v_order := v_order + 1;
  END LOOP;

  -- Mate in one pack
  SELECT id INTO v_pack_id FROM learn_practice_packs WHERE slug = 'mate-in-one';
  SELECT array_agg(id) INTO v_puzzle_ids FROM learn_puzzles WHERE topic = 'mate' AND level = 'beginner';

  v_order := 0;
  FOREACH v_puzzle_id IN ARRAY v_puzzle_ids LOOP
    INSERT INTO learn_pack_items (pack_id, puzzle_id, order_index)
    VALUES (v_pack_id, v_puzzle_id, v_order)
    ON CONFLICT (pack_id, puzzle_id) DO NOTHING;
    v_order := v_order + 1;
  END LOOP;

  -- Pin practice pack
  SELECT id INTO v_pack_id FROM learn_practice_packs WHERE slug = 'pin-practice';
  SELECT array_agg(id) INTO v_puzzle_ids FROM learn_puzzles WHERE topic = 'pin' AND level = 'beginner';

  v_order := 0;
  FOREACH v_puzzle_id IN ARRAY v_puzzle_ids LOOP
    INSERT INTO learn_pack_items (pack_id, puzzle_id, order_index)
    VALUES (v_pack_id, v_puzzle_id, v_order)
    ON CONFLICT (pack_id, puzzle_id) DO NOTHING;
    v_order := v_order + 1;
  END LOOP;
END $$;

-- ============================================
-- INTERMEDIATE-OPENINGS TRACK: Opening Principles
-- ============================================

DO $$
DECLARE
  v_track_id UUID;
  v_lesson_id UUID;
BEGIN
  SELECT id INTO v_track_id FROM learn_tracks WHERE slug = 'intermediate-openings';

  -- Lesson 1: The 3 Goals of the Opening
  INSERT INTO learn_lessons (track_id, slug, title, topic, level, description, estimated_minutes, order_index, prerequisite_lesson_ids, is_published)
  VALUES (v_track_id, 'opening-goals-3-principles', 'The 3 Goals of the Opening', 'openings', 'intermediate', 'Development, center control, king safety — and why they matter.', 25, 0, '[]', true)
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_lesson_id;

  -- Only insert steps if we got a lesson_id (lesson was newly created)
  IF v_lesson_id IS NOT NULL THEN
    INSERT INTO learn_lesson_steps (lesson_id, step_index, type, title, body_md, initial_fen, meta) VALUES
      (v_lesson_id, 0, 'explain', 'What the opening is for', 'The opening is the first phase of the chess game. Your primary goals are:

**1. Develop your pieces** — Get your knights and bishops off the back rank so they can control squares and attack.

**2. Control the center** — The squares e4, d4, e5, and d5 are the most important. Pieces in the center have maximum mobility.

**3. King safety** — Castle early to protect your king and connect your rooks.

Master these three principles and you''ll start every game with a strong position!', 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', '{"highlights": ["e4", "d4", "e5", "d5"]}'),

      (v_lesson_id, 1, 'model_line', 'Good development example', 'Watch how White develops pieces efficiently while controlling the center:

1. **e4** — Claims the center
2. **e5** — Black responds symmetrically
3. **Nf3** — Develops knight, attacks e5
4. **Nc6** — Black defends
5. **Bc4** — Develops bishop to active square

This is the Italian Game opening — a perfect example of the 3 principles!', 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', '{"solution_line_uci_example": ["e2e4", "e7e5", "g1f3", "b8c6", "f1c4"]}'),

      (v_lesson_id, 2, 'move_task', 'Choose the best developing move', 'It''s White to move. Black just played 1...e5.

What''s the best developing move that also fights for the center?', 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2', '{"pieceToMove": "g1"}');

    UPDATE learn_lesson_steps SET
      required_move_uci = 'g1f3',
      hints = '["Develop a knight toward the center", "Nf3 is better than random pawn pushes", "The knight attacks the e5 pawn"]',
      explain_correct_md = 'Excellent! Nf3 is the best move. It develops a piece, controls the center (d4 and e5), and prepares castling.',
      explain_wrong_md = 'Try Nf3 — it develops the knight to an ideal square while attacking Black''s e5 pawn.'
    WHERE lesson_id = v_lesson_id AND step_index = 2;

    INSERT INTO learn_lesson_steps (lesson_id, step_index, type, title, body_md, initial_fen, meta) VALUES
      (v_lesson_id, 3, 'explain', 'Common traps: ignoring king safety', 'Many beginners make these opening mistakes:

**Early queen adventures** — Moving the queen out early (like Qh5) usually wastes time. The queen gets chased by enemy pieces, losing tempo.

**Neglecting castling** — If you develop all your pieces but forget to castle, your king stays in the center where it''s vulnerable to attack.

**Moving the same piece twice** — Each piece should ideally move once in the opening. Moving the same piece twice lets your opponent get ahead in development.

Remember: **Develop, Control Center, Castle!**', 'r1bqkbnr/pppp1ppp/2n5/4p2Q/4P3/8/PPPP1PPP/RNB1KBNR b KQkq - 1 2', '{"arrows": [{"from": "h5", "to": "a5", "color": "red"}, {"from": "h5", "to": "h1", "color": "red"}]}'),

      (v_lesson_id, 4, 'quiz', 'Quick check', 'Test your understanding of opening principles.', NULL, '{"quiz": {"question": "Which is NOT a main opening goal?", "options": [{"id": "a", "text": "Develop pieces quickly"}, {"id": "b", "text": "Control the center"}, {"id": "c", "text": "Move the queen out early"}, {"id": "d", "text": "Make the king safe"}], "correctOptionId": "c", "explainMd": "Moving the queen out early often loses tempo because it can be attacked by minor pieces. Focus on developing knights and bishops first, then castle!"}}');
  END IF;

  -- Lesson 2: Development: Don't Waste Tempos
  INSERT INTO learn_lessons (track_id, slug, title, topic, level, description, estimated_minutes, order_index, prerequisite_lesson_ids, is_published)
  VALUES (v_track_id, 'developing-pieces-efficiently', 'Development: Don''t Waste Tempos', 'openings', 'intermediate', 'How to develop pieces efficiently and avoid repeated moves.', 30, 1, '[]', true)
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_lesson_id;

  IF v_lesson_id IS NOT NULL THEN
    INSERT INTO learn_lesson_steps (lesson_id, step_index, type, title, body_md, initial_fen, meta) VALUES
      (v_lesson_id, 0, 'explain', 'Tempo explained', 'A **tempo** is essentially one move of time.

In the opening, every move counts. If you move the same piece twice, you''ve "lost a tempo" — your opponent gets to develop two pieces while you only developed one.

**Gaining tempo** means forcing your opponent to waste a move. The most common way is to attack a piece that has to retreat.

Example: If White plays Qh5 early and Black plays Nc6, the knight develops while threatening the queen. White must move the queen again, losing tempo.', 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', '{}'),

      (v_lesson_id, 1, 'puzzle', 'Punish wasted queen moves', 'White played Qe4 too early. How can Black develop with tempo?', 'rnbqkbnr/pppp1ppp/8/4p3/3PQ3/8/PPP2PPP/RNB1KBNR b KQkq - 0 2', '{}');

    UPDATE learn_lesson_steps SET
      solution_line_uci = '["g8f6"]',
      hints = '["Develop a piece while attacking the queen", "Knights love to attack queens"]',
      explain_correct_md = 'Nf6 is perfect! The knight develops to a great square while attacking the queen. White must waste a move retreating.',
      explain_wrong_md = 'Look for a developing move that also attacks the queen.'
    WHERE lesson_id = v_lesson_id AND step_index = 1;

    INSERT INTO learn_lesson_steps (lesson_id, step_index, type, title, body_md, initial_fen, meta) VALUES
      (v_lesson_id, 2, 'move_task', 'Develop with tempo', 'The queen retreated. Now continue developing while maintaining pressure.

Find the best developing move for the bishop.', 'r1bqkbnr/pppp1ppp/2n5/4p3/3PQ3/8/PPP2PPP/RNB1KBNR w KQkq - 1 3', '{"pieceToMove": "f1"}');

    UPDATE learn_lesson_steps SET
      required_move_uci = 'f1c4',
      hints = '["Develop the bishop to an active square", "Aim at the weak f7 pawn"]',
      explain_correct_md = 'Bc4 develops the bishop to its most aggressive square, aiming at f7 — the weakest point in Black''s position.',
      explain_wrong_md = 'Try Bc4 — it develops the bishop to attack f7.'
    WHERE lesson_id = v_lesson_id AND step_index = 2;

    INSERT INTO learn_lesson_steps (lesson_id, step_index, type, title, body_md, initial_fen, meta) VALUES
      (v_lesson_id, 3, 'quiz', 'Tempo quiz', 'Test your understanding of tempo.', NULL, '{"quiz": {"question": "Which move usually wastes tempo in the opening?", "options": [{"id": "a", "text": "Developing a knight"}, {"id": "b", "text": "Castling"}, {"id": "c", "text": "Moving the same piece twice without reason"}, {"id": "d", "text": "Controlling the center"}], "correctOptionId": "c", "explainMd": "Moving the same piece twice without a good reason loses tempo. Each wasted move lets your opponent get further ahead in development."}}');
  END IF;

  -- Lesson 3: Center Control
  INSERT INTO learn_lessons (track_id, slug, title, topic, level, description, estimated_minutes, order_index, prerequisite_lesson_ids, is_published)
  VALUES (v_track_id, 'center-control-e4-d4', 'Center Control: e4/d4 & Counterplay', 'openings', 'intermediate', 'Why the center matters and how to attack/undermine it.', 30, 2, '[]', true)
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_lesson_id;

  IF v_lesson_id IS NOT NULL THEN
    INSERT INTO learn_lesson_steps (lesson_id, step_index, type, title, body_md, initial_fen, meta) VALUES
      (v_lesson_id, 0, 'explain', 'The center squares', 'The **center squares** — e4, d4, e5, d5 — are the most important squares on the board.

**Why the center matters:**
- Pieces in the center control more squares
- Central pawns limit enemy piece mobility
- Controlling the center gives you more space to maneuver

There are two ways to fight for the center:
1. **Classical** — Occupy it with pawns (e4, d4)
2. **Hypermodern** — Control it with pieces, then undermine opponent''s center', 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', '{"highlights": ["e4", "d4", "e5", "d5"]}'),

      (v_lesson_id, 1, 'model_line', 'Undermining the center', 'When your opponent has a strong pawn center, look for ways to challenge it with pawn breaks.

Here, after 1.e4 e5 2.d4, Black can challenge the center immediately:', 'rnbqkbnr/pppp1ppp/8/4p3/3PP3/8/PPP2PPP/RNBQKBNR b KQkq - 0 2', '{"solution_line_uci_example": ["d7d5"]}'),

      (v_lesson_id, 2, 'move_task', 'Challenge the center', 'White has a strong pawn center with pawns on e4 and d4.

Find the best way to challenge this center as Black.', 'rnbqkbnr/pppp1ppp/8/4p3/3PP3/8/PPP2PPP/RNBQKBNR b KQkq - 0 2', '{"pieceToMove": "d7", "boardPrefs": {"orientation": "black"}}');

    UPDATE learn_lesson_steps SET
      required_move_uci = 'd7d5',
      hints = '["Strike at the center with a pawn", "d5 challenges both e4 and d4"]',
      explain_correct_md = 'd5! This central break challenges White''s pawn center immediately. After exd5, Black gets open lines for development.',
      explain_wrong_md = 'Play d5 to challenge White''s center. This is the most direct way to fight for central control.'
    WHERE lesson_id = v_lesson_id AND step_index = 2;

    INSERT INTO learn_lesson_steps (lesson_id, step_index, type, title, body_md, initial_fen, meta) VALUES
      (v_lesson_id, 3, 'quiz', 'Center quiz', 'Test your knowledge about center control.', NULL, '{"quiz": {"question": "What is a common way to fight a strong pawn center?", "options": [{"id": "a", "text": "Ignore it"}, {"id": "b", "text": "Undermine with pawn breaks"}, {"id": "c", "text": "Move the queen early"}, {"id": "d", "text": "Only move rook pawns"}], "correctOptionId": "b", "explainMd": "Pawn breaks (like ...d5 or ...c5) challenge and dissolve the opponent''s central control. This is a key strategic concept!"}}');
  END IF;

  -- Lesson 4: King Safety and Castling
  INSERT INTO learn_lessons (track_id, slug, title, topic, level, description, estimated_minutes, order_index, prerequisite_lesson_ids, is_published)
  VALUES (v_track_id, 'king-safety-and-castling', 'King Safety: Castling & When Not To', 'openings', 'intermediate', 'Castling patterns, common attacks, and when to delay castling.', 25, 3, '[]', true)
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_lesson_id;

  IF v_lesson_id IS NOT NULL THEN
    INSERT INTO learn_lesson_steps (lesson_id, step_index, type, title, body_md, initial_fen, meta) VALUES
      (v_lesson_id, 0, 'explain', 'Why castling matters', 'Castling is a special move that accomplishes two things:

1. **King Safety** — Moves the king away from the center where it''s most vulnerable
2. **Rook Activation** — Brings the rook toward the center where it can be more active

**General rule:** Castle early! Usually within the first 10 moves.

There are two types of castling:
- **Kingside (O-O)** — Shorter, faster, keeps king behind pawns
- **Queenside (O-O-O)** — Takes longer but can be more aggressive', 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 2 3', '{"arrows": [{"from": "e1", "to": "g1", "color": "green"}]}'),

      (v_lesson_id, 1, 'move_task', 'Castle at the right time', 'White has developed the knight and bishop. Now it''s time to castle!

Castle kingside to safety.', 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 2 3', '{"pieceToMove": "e1"}');

    UPDATE learn_lesson_steps SET
      required_move_uci = 'e1g1',
      hints = '["Move the king two squares toward the rook", "This is kingside castling (O-O)"]',
      explain_correct_md = 'Perfect! Castling kingside brings the king to safety behind the pawns and activates the rook. This is often the best third move in the Italian Game.',
      explain_wrong_md = 'Castle kingside by moving the king to g1. The rook will automatically move to f1.'
    WHERE lesson_id = v_lesson_id AND step_index = 1;

    INSERT INTO learn_lesson_steps (lesson_id, step_index, type, title, body_md, initial_fen, meta) VALUES
      (v_lesson_id, 2, 'quiz', 'Castling quiz', 'When might you delay castling?', NULL, '{"quiz": {"question": "Which is usually a reason to delay castling?", "options": [{"id": "a", "text": "You can win material immediately with a tactic"}, {"id": "b", "text": "You like moving pawns"}, {"id": "c", "text": "Castling is always bad"}, {"id": "d", "text": "You must castle on move 3"}], "correctOptionId": "a", "explainMd": "If you can win material with an immediate tactic, it may be worth delaying castling. But don''t delay too long — king safety is crucial!"}}');
  END IF;

  -- Lesson 5: Common Opening Mistakes and Punishments
  INSERT INTO learn_lessons (track_id, slug, title, topic, level, description, estimated_minutes, order_index, prerequisite_lesson_ids, is_published)
  VALUES (v_track_id, 'opening-mistakes-and-punishments', 'Common Opening Mistakes & Punishments', 'openings', 'intermediate', 'How to respond to early queen moves, pawn grabbing, and weak squares.', 35, 4, '[]', true)
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_lesson_id;

  IF v_lesson_id IS NOT NULL THEN
    INSERT INTO learn_lesson_steps (lesson_id, step_index, type, title, body_md, initial_fen, meta) VALUES
      (v_lesson_id, 0, 'explain', 'Mistakes to watch for', 'Watch for these common opening mistakes — both in your games and your opponent''s:

**1. Early Queen Adventures**
Bringing the queen out before developing minor pieces usually loses tempo.

**2. Neglecting Development**
Moving the same piece multiple times or pushing too many pawns early.

**3. Greedy Pawn Grabbing**
Taking pawns at the cost of development can be dangerous — the opponent gets a lead in development for attack.

**4. Ignoring Center Control**
Playing only on the wings while opponent controls the center.', 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', '{}'),

      (v_lesson_id, 1, 'puzzle', 'Win tempo vs queen', 'Black played ...Qd5?! too early. How should White respond?', 'rnb1kbnr/pppp1ppp/8/3qp3/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3', '{}');

    UPDATE learn_lesson_steps SET
      solution_line_uci = '["b1c3"]',
      hints = '["Develop a piece while attacking the queen", "The knight can attack from c3"]',
      explain_correct_md = 'Nc3! The knight develops to a great square while attacking the queen. Black must retreat, and White gains a tempo.',
      explain_wrong_md = 'Develop Nc3 to attack the queen while developing.'
    WHERE lesson_id = v_lesson_id AND step_index = 1;

    INSERT INTO learn_lesson_steps (lesson_id, step_index, type, title, body_md, initial_fen, meta) VALUES
      (v_lesson_id, 2, 'puzzle', 'Punish ignoring development', 'Black played ...e5 but isn''t developing pieces. Claim the center!', 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2', '{}');

    UPDATE learn_lesson_steps SET
      solution_line_uci = '["d2d4"]',
      hints = '["Strike in the center", "d4 attacks e5"]',
      explain_correct_md = 'd4! This claims the center and attacks Black''s e5 pawn. White gets a strong central presence.',
      explain_wrong_md = 'Play d4 to claim the center and challenge Black''s pawn.'
    WHERE lesson_id = v_lesson_id AND step_index = 2;
  END IF;

  -- Lesson 6: Build a Simple Repertoire
  INSERT INTO learn_lessons (track_id, slug, title, topic, level, description, estimated_minutes, order_index, prerequisite_lesson_ids, is_published)
  VALUES (v_track_id, 'build-a-simple-repertoire', 'Build a Simple Repertoire (Principles → Plan)', 'openings', 'intermediate', 'Pick 1–2 openings and learn plans, not memorization.', 25, 5, '[]', true)
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_lesson_id;

  IF v_lesson_id IS NOT NULL THEN
    INSERT INTO learn_lesson_steps (lesson_id, step_index, type, title, body_md, initial_fen, meta) VALUES
      (v_lesson_id, 0, 'explain', 'Repertoire idea', 'You don''t need to memorize 20 moves of opening theory! Instead:

**Build a simple repertoire based on principles:**

**As White, choose one:**
- **1.e4** — Open games, tactical, good for attackers
- **1.d4** — Closed games, strategic, good for positional players

**As Black, have responses ready:**
- vs 1.e4 → 1...e5 (classical) or 1...c5 (Sicilian)
- vs 1.d4 → 1...d5 (classical) or 1...Nf6 (Indian setups)

**Focus on plans, not moves!** Understanding typical piece placements and pawn structures is more important than memorizing lines.', 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', '{}'),

      (v_lesson_id, 1, 'model_line', 'Sample plan-based line', 'Here''s a simple line in the Sicilian Defense where White plays for central control and kingside attack:

1. e4 c5 2. Nf3 d6 3. d4

White''s plan: Control center, develop pieces, attack the kingside. No deep theory needed!', 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', '{"solution_line_uci_example": ["e2e4", "c7c5", "g1f3", "d7d6", "d2d4"]}'),

      (v_lesson_id, 2, 'quiz', 'Repertoire quiz', 'What should you prioritize when learning an opening?', NULL, '{"quiz": {"question": "What should you learn first in an opening?", "options": [{"id": "a", "text": "20-move engine lines"}, {"id": "b", "text": "Plans + typical piece placement"}, {"id": "c", "text": "Random gambits only"}, {"id": "d", "text": "Only endgames"}], "correctOptionId": "b", "explainMd": "Understanding plans and typical piece placements is much more practical than memorizing long theoretical lines. You''ll know what to do even when your opponent deviates!"}}');
  END IF;

END $$;

-- ============================================
-- INTERMEDIATE-ENDGAMES TRACK: Essential Endgames
-- ============================================

DO $$
DECLARE
  v_track_id UUID;
  v_lesson_id UUID;
BEGIN
  SELECT id INTO v_track_id FROM learn_tracks WHERE slug = 'intermediate-endgames';

  -- Lesson 1: King Activity & Opposition
  INSERT INTO learn_lessons (track_id, slug, title, topic, level, description, estimated_minutes, order_index, prerequisite_lesson_ids, is_published)
  VALUES (v_track_id, 'king-activity-and-opposition', 'King Activity & Opposition', 'endgames', 'intermediate', 'The king becomes a fighting piece in the endgame.', 35, 0, '[]', true)
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_lesson_id;

  IF v_lesson_id IS NOT NULL THEN
    INSERT INTO learn_lesson_steps (lesson_id, step_index, type, title, body_md, initial_fen, meta) VALUES
      (v_lesson_id, 0, 'explain', 'King activity', 'In the endgame, the king transforms from a piece needing protection to a **powerful fighting piece**.

**Key concepts:**
- **Centralize the king** — In the endgame, the king should march toward the center
- **Opposition** — Standing directly facing the enemy king with one square between
- **Shouldering** — Using your king to block the enemy king''s path
- **Zugzwang** — Forcing the opponent to move when any move worsens their position

The king is roughly worth 4 points in the endgame (between bishop/knight and rook)!', '8/8/8/4k3/8/8/4K3/8 w - - 0 1', '{"highlights": ["e2", "e5"]}'),

      (v_lesson_id, 1, 'move_task', 'Take the opposition', 'Take the opposition by moving your king directly in front of Black''s king with one square between.', '8/8/8/4k3/8/8/4K3/8 w - - 0 1', '{"pieceToMove": "e2"}');

    UPDATE learn_lesson_steps SET
      required_move_uci = 'e2e3',
      hints = '["Stand directly in front of the enemy king", "Leave exactly one square between the kings"]',
      explain_correct_md = 'Ke3! You have the opposition. Now if it''s Black''s turn, they must give ground.',
      explain_wrong_md = 'Move Ke3 to take the opposition — stand one square in front of Black''s king.'
    WHERE lesson_id = v_lesson_id AND step_index = 1;

    INSERT INTO learn_lesson_steps (lesson_id, step_index, type, title, body_md, initial_fen, meta) VALUES
      (v_lesson_id, 2, 'quiz', 'Opposition quiz', 'Why is opposition important?', NULL, '{"quiz": {"question": "Opposition usually helps you…", "options": [{"id": "a", "text": "Trade queens"}, {"id": "b", "text": "Win key squares and create zugzwang"}, {"id": "c", "text": "Avoid development"}, {"id": "d", "text": "Pin pieces"}], "correctOptionId": "b", "explainMd": "When you have the opposition, the enemy king must move away, letting you advance or occupy key squares. This is crucial in king and pawn endgames!"}}');
  END IF;

  -- Lesson 2: K+P vs K: The Key Squares
  INSERT INTO learn_lessons (track_id, slug, title, topic, level, description, estimated_minutes, order_index, prerequisite_lesson_ids, is_published)
  VALUES (v_track_id, 'kp-vs-k-basic-wins', 'K+P vs K: The Key Squares', 'endgames', 'intermediate', 'How to know if a pawn endgame is winning.', 35, 1, '[]', true)
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_lesson_id;

  IF v_lesson_id IS NOT NULL THEN
    INSERT INTO learn_lesson_steps (lesson_id, step_index, type, title, body_md, initial_fen, meta) VALUES
      (v_lesson_id, 0, 'explain', 'Key squares', 'Every pawn has **key squares** — if your king reaches these squares in front of the pawn, the pawn will promote!

For a pawn on the 2nd-4th ranks, the key squares are:
- **Two squares ahead** of the pawn, plus squares on either side

For example, a pawn on e4 has key squares: **d6, e6, f6**

**Rule:** If your king can reach a key square, you win. If the enemy king controls all key squares, it''s a draw.

The **opposition** helps you reach key squares by forcing the enemy king to give way.', '8/8/8/8/4P3/8/8/4K2k w - - 0 1', '{"highlights": ["d6", "e6", "f6"]}'),

      (v_lesson_id, 1, 'puzzle', 'Reach the key square', 'White has a pawn on e2. Find the best king move to support pawn promotion.', '8/8/8/8/8/4k3/4P3/4K3 w - - 0 1', '{}');

    UPDATE learn_lesson_steps SET
      solution_line_uci = '["e1d2"]',
      hints = '["Support the pawn from the side", "Don''t block the pawn"]',
      explain_correct_md = 'Kd2! The king supports the pawn from the side. This allows the pawn to advance while the king escorts it.',
      explain_wrong_md = 'Try Kd2 — the king should support from the side, not block the pawn.'
    WHERE lesson_id = v_lesson_id AND step_index = 1;
  END IF;

  -- Lesson 3: Basic Checkmates: K+Q and K+R
  INSERT INTO learn_lessons (track_id, slug, title, topic, level, description, estimated_minutes, order_index, prerequisite_lesson_ids, is_published)
  VALUES (v_track_id, 'basic-mates-qr', 'Basic Checkmates: K+Q and K+R', 'endgames', 'intermediate', 'Learn the simplest mating patterns with major pieces.', 30, 2, '[]', true)
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_lesson_id;

  IF v_lesson_id IS NOT NULL THEN
    INSERT INTO learn_lesson_steps (lesson_id, step_index, type, title, body_md, initial_fen, meta) VALUES
      (v_lesson_id, 0, 'explain', 'Boxing in the king', 'To checkmate with major pieces, use the **boxing method**:

**Step 1:** Restrict the enemy king''s squares with your rook or queen
**Step 2:** Drive the king toward the edge (or corner for K+R)
**Step 3:** Bring your king closer to help
**Step 4:** Deliver checkmate

**K+Q vs K:** Can mate on any edge in about 10 moves
**K+R vs K:** Must drive king to corner, takes about 16 moves

Key technique: Use your major piece to cut off ranks or files!', '6k1/8/8/8/8/8/8/5KQ1 w - - 0 1', '{"arrows": [{"from": "g1", "to": "g8", "color": "red"}]}'),

      (v_lesson_id, 1, 'model_line', 'K+Q vs K method', 'Watch how the queen restricts the king and forces it to the edge:', '6k1/8/8/8/8/8/8/5KQ1 w - - 0 1', '{"solution_line_uci_example": ["g1g7"]}'),

      (v_lesson_id, 2, 'puzzle', 'Mate with queen', 'It''s checkmate in one! Find the winning move.', '6k1/8/8/8/8/8/5K2/6Q1 w - - 0 1', '{}');

    UPDATE learn_lesson_steps SET
      solution_line_uci = '["g1g7"]',
      hints = '["The queen can checkmate on the edge", "Restrict the king completely"]',
      explain_correct_md = 'Qg7#! The queen delivers checkmate. The king has no escape squares.',
      explain_wrong_md = 'Qg7 is checkmate — the king is trapped on the back rank.'
    WHERE lesson_id = v_lesson_id AND step_index = 2;
  END IF;

  -- Lesson 4: Rook Endgames: Activity & Cutting Off
  INSERT INTO learn_lessons (track_id, slug, title, topic, level, description, estimated_minutes, order_index, prerequisite_lesson_ids, is_published)
  VALUES (v_track_id, 'rook-endgames-activity', 'Rook Endgames: Activity & Cutting Off', 'endgames', 'intermediate', 'Active rooks win. Learn cutting off the king and checking from behind.', 45, 3, '[]', true)
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_lesson_id;

  IF v_lesson_id IS NOT NULL THEN
    INSERT INTO learn_lesson_steps (lesson_id, step_index, type, title, body_md, initial_fen, meta) VALUES
      (v_lesson_id, 0, 'explain', 'Rook activity', 'Rook endgames are the most common endgame type. Key principles:

**1. Rooks belong behind passed pawns**
- Behind your own: pushes the pawn, rook stays active
- Behind enemy''s: stops the pawn, rook stays active

**2. Cut off the enemy king**
Using the rook to create a barrier prevents the king from stopping your pawns.

**3. Active rook beats passive rook**
A rook attacking is worth more than a rook defending.

**4. Check from behind**
When the king advances with a pawn, check from behind to push it back.', '8/8/8/8/4k3/8/4P3/4KR2 w - - 0 1', '{"arrows": [{"from": "f1", "to": "f4", "color": "green"}]}'),

      (v_lesson_id, 1, 'puzzle', 'Cut off the king', 'Use your rook to cut off the Black king from stopping the pawn.', '8/8/8/8/4k3/8/4P3/4KR2 w - - 0 1', '{}');

    UPDATE learn_lesson_steps SET
      solution_line_uci = '["f1f4"]',
      hints = '["Create a barrier with the rook", "The rook can cut off the king on the 4th rank"]',
      explain_correct_md = 'Rf4! The rook cuts off the Black king, preventing it from approaching the pawn. Now White can advance the pawn.',
      explain_wrong_md = 'Rf4 creates a barrier — the Black king cannot cross the 4th rank.'
    WHERE lesson_id = v_lesson_id AND step_index = 1;
  END IF;

  -- Lesson 5: Pawn Races & Outside Passed Pawn
  INSERT INTO learn_lessons (track_id, slug, title, topic, level, description, estimated_minutes, order_index, prerequisite_lesson_ids, is_published)
  VALUES (v_track_id, 'pawn-races-and-outside-passer', 'Pawn Races & Outside Passed Pawn', 'endgames', 'intermediate', 'Calculate pawn races and learn why outside passers win games.', 35, 4, '[]', true)
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_lesson_id;

  IF v_lesson_id IS NOT NULL THEN
    INSERT INTO learn_lesson_steps (lesson_id, step_index, type, title, body_md, initial_fen, meta) VALUES
      (v_lesson_id, 0, 'explain', 'Pawn race basics', 'In pure pawn endgames, **counting tempos** decides who wins.

**Pawn race rules:**
1. Count squares to promotion for each pawn
2. Consider whose turn it is
3. Check if kings can intercept

**Outside passed pawn:**
A passed pawn far from the enemy king is extremely powerful because:
- The enemy king must chase it
- Your king can then capture central pawns
- It acts as a "decoy" to win material

The outside passed pawn is one of the most important endgame concepts!', '8/p7/8/8/8/8/6P1/8 w - - 0 1', '{"highlights": ["a7", "g2"]}'),

      (v_lesson_id, 1, 'quiz', 'Pawn race quiz', 'Why is the outside passed pawn powerful?', NULL, '{"quiz": {"question": "Why is an outside passed pawn powerful?", "options": [{"id": "a", "text": "It looks nice"}, {"id": "b", "text": "It deflects the king away from the center"}, {"id": "c", "text": "It pins a queen"}, {"id": "d", "text": "It always mates"}], "correctOptionId": "b", "explainMd": "The outside passed pawn forces the enemy king to chase it, leaving your king free to capture other pawns or escort your central pawns."}}');
  END IF;

  -- Lesson 6: Endgame Checklist
  INSERT INTO learn_lessons (track_id, slug, title, topic, level, description, estimated_minutes, order_index, prerequisite_lesson_ids, is_published)
  VALUES (v_track_id, 'endgame-checklist', 'Endgame Checklist: What To Do First', 'endgames', 'intermediate', 'A simple decision framework for practical endgames.', 20, 5, '[]', true)
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_lesson_id;

  IF v_lesson_id IS NOT NULL THEN
    INSERT INTO learn_lesson_steps (lesson_id, step_index, type, title, body_md, initial_fen, meta) VALUES
      (v_lesson_id, 0, 'explain', 'Checklist', 'When you reach an endgame, follow this checklist:

**1. Activate your king**
Move it toward the center or toward the action.

**2. Improve your worst piece**
If you have a passive rook or bad bishop, fix it.

**3. Create a passed pawn**
Trade pawns on one side to create a passer on the other.

**4. Target weaknesses**
Attack isolated, doubled, or backward pawns.

**5. Control key squares**
Occupy outposts and blockade passed pawns.

Following this checklist will improve your endgame play dramatically!', '8/8/8/8/8/8/8/4K3 w - - 0 1', '{}'),

      (v_lesson_id, 1, 'quiz', 'Checklist quiz', 'What''s usually the first priority in an endgame?', NULL, '{"quiz": {"question": "In most endgames, your first priority is…", "options": [{"id": "a", "text": "Trade pawns randomly"}, {"id": "b", "text": "Activate the king"}, {"id": "c", "text": "Move queen early"}, {"id": "d", "text": "Sacrifice material"}], "correctOptionId": "b", "explainMd": "Activating the king is almost always the first priority. In the endgame, the king is a powerful fighting piece worth about 4 points!"}}');
  END IF;

END $$;

-- ============================================
-- ADVANCED-STRATEGY TRACK: Strategic Thinking
-- ============================================

DO $$
DECLARE
  v_track_id UUID;
  v_lesson_id UUID;
BEGIN
  SELECT id INTO v_track_id FROM learn_tracks WHERE slug = 'advanced-strategy';

  -- Lesson 1: How to Evaluate a Position
  INSERT INTO learn_lessons (track_id, slug, title, topic, level, description, estimated_minutes, order_index, prerequisite_lesson_ids, is_published)
  VALUES (v_track_id, 'how-to-evaluate-a-position', 'How to Evaluate a Position (Imbalances)', 'strategy', 'advanced', 'Material, king safety, structure, activity — build a clear evaluation.', 40, 0, '[]', true)
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_lesson_id;

  IF v_lesson_id IS NOT NULL THEN
    INSERT INTO learn_lesson_steps (lesson_id, step_index, type, title, body_md, initial_fen, meta) VALUES
      (v_lesson_id, 0, 'explain', 'Imbalances', 'Strong players evaluate positions by comparing **imbalances** — differences between the two sides:

**Material:** Who has more pieces/pawns?
**King Safety:** Whose king is safer?
**Pawn Structure:** Isolated pawns? Passed pawns? Weak squares?
**Piece Activity:** Which pieces are more active?
**Space:** Who controls more squares?
**Development:** Who is further along in development?

Each imbalance suggests a plan. For example:
- Better pawn structure → play for endgame
- Better king safety → avoid trades, attack
- Space advantage → maneuver, avoid exchanges', 'r1bq1rk1/pp3ppp/2n1pn2/2bp4/3P4/2P1PN2/PP1N1PPP/R1BQ1RK1 w - - 0 1', '{}'),

      (v_lesson_id, 1, 'quiz', 'Evaluation quiz', 'What usually matters most in quiet positions?', NULL, '{"quiz": {"question": "Which factor often matters most in quiet positions?", "options": [{"id": "a", "text": "Random sacrifices"}, {"id": "b", "text": "Piece activity and pawn structure"}, {"id": "c", "text": "Early queen moves"}, {"id": "d", "text": "Avoiding castling"}], "correctOptionId": "b", "explainMd": "In quiet, strategic positions, piece activity and pawn structure are usually the most important factors. Tactics come from good positions!"}}');
  END IF;

  -- Lesson 2: Pawn Structures & Typical Plans
  INSERT INTO learn_lessons (track_id, slug, title, topic, level, description, estimated_minutes, order_index, prerequisite_lesson_ids, is_published)
  VALUES (v_track_id, 'pawn-structures-and-plans', 'Pawn Structures & Typical Plans', 'strategy', 'advanced', 'Isolated pawn, doubled pawns, pawn chains, weak squares.', 45, 1, '[]', true)
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_lesson_id;

  IF v_lesson_id IS NOT NULL THEN
    INSERT INTO learn_lesson_steps (lesson_id, step_index, type, title, body_md, initial_fen, meta) VALUES
      (v_lesson_id, 0, 'explain', 'Structures', 'Pawn structure determines strategy. Learn these key structures:

**Isolated Pawn (IQP):**
- Weakness: Can''t be defended by pawns
- Strength: Controls squares, open files for rooks
- Plan WITH: Attack before endgame
- Plan AGAINST: Trade pieces, target in endgame

**Doubled Pawns:**
- Weakness: Immobile, hard to defend
- Strength: Open file for rook
- Plan AGAINST: Target the weak pawn

**Pawn Chains:**
- Attack the base of the chain
- The chain points toward attacking side

**Weak Squares:**
- Squares that can''t be defended by pawns become outposts for pieces', 'r1bq1rk1/pp3ppp/2n1pn2/2bp4/3P4/2P1PN2/PP1N1PPP/R1BQ1RK1 w - - 0 1', '{}'),

      (v_lesson_id, 1, 'model_line', 'Create a pawn break', 'In this position, White can improve with a pawn break:', 'r1bq1rk1/pp3ppp/2n1pn2/2bp4/3P4/2P1PN2/PP1N1PPP/R1BQ1RK1 w - - 0 1', '{"solution_line_uci_example": ["d4c5"]}'),

      (v_lesson_id, 2, 'puzzle', 'Find the pawn break', 'White needs to open the position. Find the best pawn move.', 'r1bq1rk1/pp3ppp/2n1pn2/2bp4/3P4/2P1PN2/PP1N1PPP/R1BQ1RK1 w - - 0 1', '{}');

    UPDATE learn_lesson_steps SET
      solution_line_uci = '["d4c5"]',
      hints = '["Change the pawn structure", "Open lines for your pieces"]',
      explain_correct_md = 'dxc5! This releases the tension and opens the d-file for White''s pieces. It also fixes Black''s pawn structure.',
      explain_wrong_md = 'Take on c5 to open the position and change the pawn structure.'
    WHERE lesson_id = v_lesson_id AND step_index = 2;
  END IF;

  -- Lesson 3: Outposts & Good vs Bad Bishop
  INSERT INTO learn_lessons (track_id, slug, title, topic, level, description, estimated_minutes, order_index, prerequisite_lesson_ids, is_published)
  VALUES (v_track_id, 'outposts-and-good-vs-bad-bishop', 'Outposts & Good vs Bad Bishop', 'strategy', 'advanced', 'How to place pieces on strong squares and improve minor pieces.', 35, 2, '[]', true)
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_lesson_id;

  IF v_lesson_id IS NOT NULL THEN
    INSERT INTO learn_lesson_steps (lesson_id, step_index, type, title, body_md, initial_fen, meta) VALUES
      (v_lesson_id, 0, 'explain', 'Outpost definition', 'An **outpost** is a square where your piece (usually a knight) cannot be attacked by enemy pawns.

**What makes a great outpost:**
- Protected by your own pawn
- Cannot be attacked by enemy pawns
- In the opponent''s territory (ranks 4-6)
- Controls important squares

**Good vs Bad Bishop:**
- **Good bishop:** Not blocked by its own pawns, controls open diagonals
- **Bad bishop:** Blocked by its own pawns, limited mobility

**Tip:** Trade bad bishops for good ones, or free them by advancing pawns.', 'r1bq1rk1/pp3ppp/2n1pn2/2bp4/3P4/2P1PN2/PP1N1PPP/R1BQ1RK1 w - - 0 1', '{}'),

      (v_lesson_id, 1, 'quiz', 'Piece improvement', 'What makes a square an outpost?', NULL, '{"quiz": {"question": "What makes a square an outpost for a knight?", "options": [{"id": "a", "text": "It is on the edge"}, {"id": "b", "text": "It is protected by a pawn and cannot be attacked by enemy pawns"}, {"id": "c", "text": "It is near your king"}, {"id": "d", "text": "It is any empty square"}], "correctOptionId": "b", "explainMd": "An outpost is a square protected by your pawn where the enemy cannot challenge your piece with their pawns. Knights love outposts!"}}');
  END IF;

  -- Lesson 4: Prophylaxis
  INSERT INTO learn_lessons (track_id, slug, title, topic, level, description, estimated_minutes, order_index, prerequisite_lesson_ids, is_published)
  VALUES (v_track_id, 'prophylaxis-and-preventing-counterplay', 'Prophylaxis: Stop Their Plan', 'strategy', 'advanced', 'Prevent counterplay, restrict pieces, improve safety.', 40, 3, '[]', true)
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_lesson_id;

  IF v_lesson_id IS NOT NULL THEN
    INSERT INTO learn_lesson_steps (lesson_id, step_index, type, title, body_md, initial_fen, meta) VALUES
      (v_lesson_id, 0, 'explain', 'Think like your opponent', '**Prophylaxis** means preventing your opponent''s plan.

Before making a move, ask yourself:
- What does my opponent want to do?
- What is their best plan?
- How can I stop it?

**Prophylactic thinking examples:**
- Playing h3 to prevent Bg4 pin
- Playing a3 to stop Bb4 pressure
- Restricting a knight''s best square

World Champion Anatoly Karpov was the master of prophylaxis — he would stop every opponent''s idea before it started!', 'r2q1rk1/pp2bppp/2n1pn2/2bp4/3P4/2P1PN2/PP1N1PPP/R1BQ1RK1 w - - 0 1', '{}'),

      (v_lesson_id, 1, 'puzzle', 'Find the preventive move', 'Improve your position while limiting Black''s options.', 'r2q1rk1/pp2bppp/2n1pn2/2bp4/3P4/2P1PN2/PP1N1PPP/R1BQ1RK1 w - - 0 1', '{}');

    UPDATE learn_lesson_steps SET
      solution_line_uci = '["d2b3"]',
      hints = '["Improve a piece", "Threaten the bishop on c5"]',
      explain_correct_md = 'Nb3! This develops the knight to a better square while attacking the bishop. Black must react.',
      explain_wrong_md = 'Nb3 improves the knight and creates threats against the c5 bishop.'
    WHERE lesson_id = v_lesson_id AND step_index = 1;
  END IF;

  -- Lesson 5: Converting Small Advantages
  INSERT INTO learn_lessons (track_id, slug, title, topic, level, description, estimated_minutes, order_index, prerequisite_lesson_ids, is_published)
  VALUES (v_track_id, 'convert-small-advantages', 'Converting Small Advantages', 'strategy', 'advanced', 'Trade correctly, simplify, create targets, improve worst piece.', 35, 4, '[]', true)
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_lesson_id;

  IF v_lesson_id IS NOT NULL THEN
    INSERT INTO learn_lesson_steps (lesson_id, step_index, type, title, body_md, initial_fen, meta) VALUES
      (v_lesson_id, 0, 'explain', 'Conversion rules', 'When you have a small advantage, follow these principles:

**When ahead in material:**
- Trade pieces, not pawns
- Reduce tactical chances for opponent
- Head toward a winning endgame

**When positionally better:**
- Improve your worst piece
- Create multiple weaknesses
- Don''t rush — squeeze slowly

**Trading rules:**
- Trade when ahead in material
- Trade active pieces for passive ones
- Keep your good pieces, trade your bad ones

**Don''t let the opponent escape!** Small advantages can evaporate if you play carelessly.', 'r1bq1rk1/pp3ppp/2n1pn2/2bp4/3P4/2P1PN2/PP1N1PPP/R1BQ1RK1 w - - 0 1', '{}'),

      (v_lesson_id, 1, 'quiz', 'Conversion quiz', 'When up material, what should you do?', NULL, '{"quiz": {"question": "When you are up material, you usually want to…", "options": [{"id": "a", "text": "Trade queens and minor pieces when safe"}, {"id": "b", "text": "Avoid any exchanges"}, {"id": "c", "text": "Push random pawns"}, {"id": "d", "text": "Sacrifice back the material"}], "correctOptionId": "a", "explainMd": "When up material, trading pieces (not pawns) reduces counterplay and makes your extra material more decisive in the endgame."}}');
  END IF;

  -- Lesson 6: Strategic Mini-Test
  INSERT INTO learn_lessons (track_id, slug, title, topic, level, description, estimated_minutes, order_index, prerequisite_lesson_ids, is_published)
  VALUES (v_track_id, 'strategic-mini-test', 'Strategic Mini-Test (Mixed Positions)', 'strategy', 'advanced', 'A checkpoint lesson with mixed evaluation + best-plan puzzles.', 35, 5, '[]', true)
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_lesson_id;

  IF v_lesson_id IS NOT NULL THEN
    INSERT INTO learn_lesson_steps (lesson_id, step_index, type, title, body_md, initial_fen, meta) VALUES
      (v_lesson_id, 0, 'puzzle', 'Find best plan move 1', 'Find the best strategic move for White.', 'r1bq1rk1/pp3ppp/2n1pn2/2bp4/3P4/2P1PN2/PP1N1PPP/R1BQ1RK1 w - - 0 1', '{}');

    UPDATE learn_lesson_steps SET
      solution_line_uci = '["d4c5"]',
      hints = '["Change the pawn structure", "Open the position"]',
      explain_correct_md = 'dxc5! Opening the position when you have better development is correct strategy.',
      explain_wrong_md = 'dxc5 opens lines and changes the pawn structure in White''s favor.'
    WHERE lesson_id = v_lesson_id AND step_index = 0;

    INSERT INTO learn_lesson_steps (lesson_id, step_index, type, title, body_md, initial_fen, meta) VALUES
      (v_lesson_id, 1, 'puzzle', 'Find best plan move 2', 'Improve your pieces strategically.', 'r2q1rk1/pp2bppp/2n1pn2/2bp4/3P4/2P1PN2/PP1N1PPP/R1BQ1RK1 w - - 0 1', '{}');

    UPDATE learn_lesson_steps SET
      solution_line_uci = '["d2b3"]',
      hints = '["Improve your knight", "Attack the bishop"]',
      explain_correct_md = 'Nb3 improves the knight and creates threats.',
      explain_wrong_md = 'Nb3 is the best way to improve your position.'
    WHERE lesson_id = v_lesson_id AND step_index = 1;

    INSERT INTO learn_lesson_steps (lesson_id, step_index, type, title, body_md, initial_fen, meta) VALUES
      (v_lesson_id, 2, 'quiz', 'Mini-test quiz', 'Strategic thinking summary.', NULL, '{"quiz": {"question": "Strategic thinking starts with…", "options": [{"id": "a", "text": "Random attacks"}, {"id": "b", "text": "Evaluating imbalances and making a plan"}, {"id": "c", "text": "Memorizing openings only"}, {"id": "d", "text": "Avoiding endgames"}], "correctOptionId": "b", "explainMd": "Strategic chess follows the loop: Evaluate the position → Identify imbalances → Make a plan → Execute. This is the foundation of strong play!"}}');
  END IF;

END $$;

-- ============================================
-- EXPERT-MASTERY TRACK: Master Class
-- ============================================

DO $$
DECLARE
  v_track_id UUID;
  v_lesson_id UUID;
BEGIN
  SELECT id INTO v_track_id FROM learn_tracks WHERE slug = 'expert-mastery';

  -- Lesson 1: Candidate Moves & Calculation
  INSERT INTO learn_lessons (track_id, slug, title, topic, level, description, estimated_minutes, order_index, prerequisite_lesson_ids, is_published)
  VALUES (v_track_id, 'candidate-moves-and-calculation', 'Candidate Moves & Calculation Tree', 'calculation', 'expert', 'How strong players calculate: candidates, forcing moves, pruning.', 50, 0, '[]', true)
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_lesson_id;

  IF v_lesson_id IS NOT NULL THEN
    INSERT INTO learn_lesson_steps (lesson_id, step_index, type, title, body_md, initial_fen, meta) VALUES
      (v_lesson_id, 0, 'explain', 'Candidate move method', 'The **candidate move method** is how masters calculate:

**Step 1: Generate candidates**
List 3-5 promising moves. Don''t analyze yet!

**Step 2: Prioritize forcing moves**
Look at checks, captures, and threats first. These limit opponent''s responses.

**Step 3: Calculate critical lines**
For each candidate, calculate the main response and your reply.

**Step 4: Prune weak branches**
Once you find a refutation, stop analyzing that line.

**Step 5: Compare and choose**
After analyzing all candidates, pick the best one.

Key insight: Calculate **forcing moves** first because they have fewer possible responses!', 'r2q1rk1/ppp2ppp/2n2n2/3pp3/2B1P3/2N2N2/PPPP1PPP/R1BQ1RK1 w - - 0 1', '{}'),

      (v_lesson_id, 1, 'puzzle', 'Forcing line puzzle', 'Find the best forcing move.', 'r2q1rk1/ppp2ppp/2n2n2/3pp3/2B1P3/2N2N2/PPPP1PPP/R1BQ1RK1 w - - 0 1', '{}');

    UPDATE learn_lesson_steps SET
      solution_line_uci = '["c4d5"]',
      hints = '["Look for forcing captures", "Attack the center"]',
      explain_correct_md = 'Bxd5! This forcing capture wins a central pawn and opens lines.',
      explain_wrong_md = 'Bxd5 captures a pawn and opens the position favorably.'
    WHERE lesson_id = v_lesson_id AND step_index = 1;

    INSERT INTO learn_lesson_steps (lesson_id, step_index, type, title, body_md, initial_fen, meta) VALUES
      (v_lesson_id, 2, 'quiz', 'Calculation quiz', 'What should you calculate first?', NULL, '{"quiz": {"question": "What should you calculate first?", "options": [{"id": "a", "text": "Quiet pawn moves"}, {"id": "b", "text": "Forcing moves: checks, captures, threats"}, {"id": "c", "text": "Random rook moves"}, {"id": "d", "text": "Only endgames"}], "correctOptionId": "b", "explainMd": "Forcing moves (checks, captures, threats) limit your opponent''s options, making them easier to calculate. Start with these!"}}');
  END IF;

  -- Lesson 2: Positional Sacrifices
  INSERT INTO learn_lessons (track_id, slug, title, topic, level, description, estimated_minutes, order_index, prerequisite_lesson_ids, is_published)
  VALUES (v_track_id, 'positional-sacrifices', 'Positional Sacrifices (When Material Doesn''t Matter)', 'strategy', 'expert', 'Exchange sacs, initiative, domination, and practical compensation.', 45, 1, '[]', true)
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_lesson_id;

  IF v_lesson_id IS NOT NULL THEN
    INSERT INTO learn_lesson_steps (lesson_id, step_index, type, title, body_md, initial_fen, meta) VALUES
      (v_lesson_id, 0, 'explain', 'Compensation checklist', 'A **positional sacrifice** gives up material for long-term advantages.

**Common compensation factors:**
- **King safety** — Exposed enemy king
- **Activity** — All your pieces are active, opponent''s are passive
- **Pawn structure** — Weak pawns in opponent''s camp
- **Space** — Cramped position for opponent
- **Development** — Lead in development

**The Exchange Sacrifice (Rook for Knight/Bishop):**
Most common positional sacrifice. Worth it when:
- You get a strong knight outpost
- You destroy opponent''s pawn structure
- You dominate light or dark squares

Trust your intuition — if it looks dominant, calculate to confirm!', 'r1bq1rk1/ppp2ppp/2n2n2/3pp3/2B1P3/2N2N2/PPPP1PPP/R1BQ1RK1 w - - 0 1', '{}'),

      (v_lesson_id, 1, 'puzzle', 'Exchange sac motif', 'Find the strong tactical move.', 'r1bq1rk1/ppp2ppp/2n2n2/3pp3/2B1P3/2N2N2/PPPP1PPP/R1BQ1RK1 w - - 0 1', '{}');

    UPDATE learn_lesson_steps SET
      solution_line_uci = '["c4d5"]',
      hints = '["Central capture", "Open lines"]',
      explain_correct_md = 'Bxd5 wins a pawn and opens the position for White''s pieces.',
      explain_wrong_md = 'Bxd5 is the tactical shot in this position.'
    WHERE lesson_id = v_lesson_id AND step_index = 1;
  END IF;

  -- Lesson 3: Advanced Rook Endgames
  INSERT INTO learn_lessons (track_id, slug, title, topic, level, description, estimated_minutes, order_index, prerequisite_lesson_ids, is_published)
  VALUES (v_track_id, 'advanced-rook-endgames', 'Advanced Rook Endgames (Lucena/Philidor Intro)', 'endgames', 'expert', 'Key theoretical positions that decide real games.', 55, 2, '[]', true)
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_lesson_id;

  IF v_lesson_id IS NOT NULL THEN
    INSERT INTO learn_lesson_steps (lesson_id, step_index, type, title, body_md, initial_fen, meta) VALUES
      (v_lesson_id, 0, 'explain', 'Lucena idea', 'The **Lucena Position** is the most important winning technique in rook endgames.

**Key elements:**
- Your pawn is on the 7th rank
- Your king is in front of the pawn
- Your rook will "build a bridge"

**The Bridge Technique:**
1. Push the enemy king away with rook checks
2. Move your rook to the 4th rank
3. "Bridge" by blocking checks when your king emerges

**Philidor Position:**
The key *drawing* technique. Keep your rook on the 6th rank until the pawn advances, then check from behind.

These two positions decide most rook endgames!', '1K1k4/1P6/8/8/8/r7/8/4R3 w - - 0 1', '{}'),

      (v_lesson_id, 1, 'model_line', 'Lucena sample', 'The bridge technique in action:', '1K1k4/1P6/8/8/8/r7/8/4R3 w - - 0 1', '{"solution_line_uci_example": ["e1e4"]}'),

      (v_lesson_id, 2, 'quiz', 'Theory quiz', 'What does rook activity mean in endgames?', NULL, '{"quiz": {"question": "In rook endgames, activity usually means…", "options": [{"id": "a", "text": "Passive defense behind pawns"}, {"id": "b", "text": "Rook behind passed pawns and checking from behind"}, {"id": "c", "text": "Never checking"}, {"id": "d", "text": "Trading rooks immediately"}], "correctOptionId": "b", "explainMd": "Active rooks belong behind passed pawns (yours or opponent''s) and check from behind to stop pawn advances or push kings back."}}');
  END IF;

  -- Lesson 4: Transition Decisions
  INSERT INTO learn_lessons (track_id, slug, title, topic, level, description, estimated_minutes, order_index, prerequisite_lesson_ids, is_published)
  VALUES (v_track_id, 'transition-decisions', 'Middlegame → Endgame Transitions', 'strategy', 'expert', 'When to trade pieces, simplify, and choose the right endgame.', 45, 3, '[]', true)
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_lesson_id;

  IF v_lesson_id IS NOT NULL THEN
    INSERT INTO learn_lesson_steps (lesson_id, step_index, type, title, body_md, initial_fen, meta) VALUES
      (v_lesson_id, 0, 'explain', 'Trade logic', 'Knowing **when to trade** into an endgame is a crucial skill.

**Trade into endgame when:**
- You have a material advantage
- Your pawn structure is better
- You have an outside passed pawn
- Your king is more active
- Opponent has attacking chances you want to neutralize

**Stay in middlegame when:**
- You have attacking chances
- Opponent''s king is weak
- You have the initiative
- Your pieces are more coordinated

**The right exchange:**
Trade pieces that favor your endgame. Keep pieces that control key squares or support your passed pawns.', 'r1bq1rk1/pp3ppp/2n1pn2/2bp4/3P4/2P1PN2/PP1N1PPP/R1BQ1RK1 w - - 0 1', '{}'),

      (v_lesson_id, 1, 'puzzle', 'Choose the right exchange', 'Find the best way to improve White''s position.', 'r1bq1rk1/pp3ppp/2n1pn2/2bp4/3P4/2P1PN2/PP1N1PPP/R1BQ1RK1 w - - 0 1', '{}');

    UPDATE learn_lesson_steps SET
      solution_line_uci = '["d4c5"]',
      hints = '["Change the structure", "Open the position"]',
      explain_correct_md = 'dxc5 opens the position favorably for White''s pieces.',
      explain_wrong_md = 'dxc5 is the right structural decision here.'
    WHERE lesson_id = v_lesson_id AND step_index = 1;
  END IF;

  -- Lesson 5: Model Game Annotated
  INSERT INTO learn_lessons (track_id, slug, title, topic, level, description, estimated_minutes, order_index, prerequisite_lesson_ids, is_published)
  VALUES (v_track_id, 'model-game-annotated-1', 'Model Game: Annotated Plan (Classic Example)', 'strategy', 'expert', 'Replay a classic game with key moments and plans explained.', 55, 4, '[]', true)
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_lesson_id;

  IF v_lesson_id IS NOT NULL THEN
    INSERT INTO learn_lesson_steps (lesson_id, step_index, type, title, body_md, initial_fen, meta) VALUES
      (v_lesson_id, 0, 'explain', 'What to look for', 'Studying master games teaches you to think like a strong player.

**What to observe:**
- **Plans** — What was each side trying to achieve?
- **Pawn breaks** — When and why did they change the structure?
- **Piece maneuvers** — How did pieces improve?
- **Transitions** — When did they enter the endgame?

**Study method:**
1. Play through without annotations first
2. At key moments, guess the move
3. Check annotations to understand the ideas
4. Replay focusing on plans, not moves

Let''s look at a classic Queen''s Gambit setup...', 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', '{}'),

      (v_lesson_id, 1, 'model_line', 'Key segment 1', 'The Queen''s Gambit opening: White fights for the center.', 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', '{"solution_line_uci_example": ["d2d4", "d7d5", "c2c4"]}'),

      (v_lesson_id, 2, 'model_line', 'Key segment 2', 'A different approach: developing with Nf3 and preparing to control the center.', 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', '{"solution_line_uci_example": ["g1f3", "g8f6", "c1g5"]}');
  END IF;

  -- Lesson 6: Master Class Checkpoint
  INSERT INTO learn_lessons (track_id, slug, title, topic, level, description, estimated_minutes, order_index, prerequisite_lesson_ids, is_published)
  VALUES (v_track_id, 'master-class-checkpoint', 'Master Class Checkpoint (Mixed Test)', 'calculation', 'expert', 'Mixed puzzles + quizzes combining calculation, strategy, and endgames.', 50, 5, '[]', true)
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_lesson_id;

  IF v_lesson_id IS NOT NULL THEN
    INSERT INTO learn_lesson_steps (lesson_id, step_index, type, title, body_md, initial_fen, meta) VALUES
      (v_lesson_id, 0, 'puzzle', 'Tactical calculation test', 'Find the best tactical continuation.', 'r2q1rk1/ppp2ppp/2n2n2/3pp3/2B1P3/2N2N2/PPPP1PPP/R1BQ1RK1 w - - 0 1', '{}');

    UPDATE learn_lesson_steps SET
      solution_line_uci = '["c4d5"]',
      hints = '["Look for captures", "Central tension"]',
      explain_correct_md = 'Bxd5 wins material and opens the position.',
      explain_wrong_md = 'Bxd5 is the tactical solution.'
    WHERE lesson_id = v_lesson_id AND step_index = 0;

    INSERT INTO learn_lesson_steps (lesson_id, step_index, type, title, body_md, initial_fen, meta) VALUES
      (v_lesson_id, 1, 'puzzle', 'Strategic best-plan test', 'Find the best strategic move.', 'r1bq1rk1/pp3ppp/2n1pn2/2bp4/3P4/2P1PN2/PP1N1PPP/R1BQ1RK1 w - - 0 1', '{}');

    UPDATE learn_lesson_steps SET
      solution_line_uci = '["d4c5"]',
      hints = '["Change the structure", "Open lines"]',
      explain_correct_md = 'dxc5 is the correct structural decision.',
      explain_wrong_md = 'dxc5 opens the position favorably.'
    WHERE lesson_id = v_lesson_id AND step_index = 1;

    INSERT INTO learn_lesson_steps (lesson_id, step_index, type, title, body_md, initial_fen, meta) VALUES
      (v_lesson_id, 2, 'quiz', 'Tournament habits', 'Practical chess wisdom for tournament play.', NULL, '{"quiz": {"question": "Under time pressure, the best practical approach is…", "options": [{"id": "a", "text": "Find the flashiest sacrifice"}, {"id": "b", "text": "Choose a solid candidate move and avoid blunders"}, {"id": "c", "text": "Resign early"}, {"id": "d", "text": "Move instantly without thinking"}], "correctOptionId": "b", "explainMd": "In time trouble, solid practical play wins more games than brilliance. Avoid blunders, make safe moves, and trust your instincts!"}}');
  END IF;

END $$;

-- ============================================
-- PRACTICE PACKS FOR INTERMEDIATE/ADVANCED/EXPERT
-- ============================================

INSERT INTO learn_practice_packs (slug, title, level, topic, description, is_published) VALUES
  ('opening-principles-drills', 'Opening Principles Drills', 'intermediate', 'openings', 'Quick scenarios: develop, win tempo, castle, punish mistakes.', true),
  ('essential-endgames-drills', 'Essential Endgames Drills', 'intermediate', 'endgames', 'Opposition, key squares, rook activity, basic mates.', true),
  ('strategy-planning-drills', 'Strategy Planning Drills', 'advanced', 'strategy', 'Best-plan puzzles: pawn breaks, outposts, prophylaxis, conversion.', true),
  ('master-class-mixed-drills', 'Master Class Mixed Drills', 'expert', 'calculation', 'Hard mixed positions: calculation, conversion, endgame theory.', true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- ADDITIONAL PUZZLES FOR NEW PACKS
-- ============================================

-- Opening puzzles
INSERT INTO learn_puzzles (level, topic, initial_fen, solution_line_uci, explanation_md, rating) VALUES
  ('intermediate', 'other', 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2', '["g1f3"]', 'Develop the knight toward the center, attacking e5.', 1000),
  ('intermediate', 'other', 'rnbqkbnr/pppp1ppp/8/4p3/3PP3/8/PPP2PPP/RNBQKBNR b KQkq - 0 2', '["e5d4"]', 'Capture in the center to challenge White''s pawns.', 1050),
  ('intermediate', 'other', 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 2 3', '["e1g1"]', 'Castle to safety! King safety is a top priority.', 950)
ON CONFLICT DO NOTHING;

-- Endgame puzzles
INSERT INTO learn_puzzles (level, topic, initial_fen, solution_line_uci, explanation_md, rating) VALUES
  ('intermediate', 'endgame', '8/8/8/8/4k3/8/4K3/8 w - - 0 1', '["e2e3"]', 'Take the opposition to control key squares.', 1100),
  ('intermediate', 'endgame', '8/8/8/8/8/4k3/4P3/4K3 w - - 0 1', '["e1d2"]', 'Support the pawn from the side, not in front.', 1150),
  ('intermediate', 'endgame', '6k1/8/8/8/8/8/5K2/6Q1 w - - 0 1', '["g1g7"]', 'Checkmate with queen on the edge.', 900)
ON CONFLICT DO NOTHING;

-- Strategy puzzles
INSERT INTO learn_puzzles (level, topic, initial_fen, solution_line_uci, explanation_md, rating) VALUES
  ('advanced', 'other', 'r1bq1rk1/pp3ppp/2n1pn2/2bp4/3P4/2P1PN2/PP1N1PPP/R1BQ1RK1 w - - 0 1', '["d4c5"]', 'Open the position with dxc5.', 1300),
  ('advanced', 'other', 'r2q1rk1/pp2bppp/2n1pn2/2bp4/3P4/2P1PN2/PP1N1PPP/R1BQ1RK1 w - - 0 1', '["d2b3"]', 'Improve the knight while attacking the bishop.', 1350),
  ('advanced', 'other', 'r1bqkb1r/pp3ppp/2n1pn2/2pp4/2PP4/2N1PN2/PP3PPP/R1BQKB1R w KQkq - 0 5', '["c4d5"]', 'Central pawn exchange to open lines.', 1400)
ON CONFLICT DO NOTHING;

-- Calculation puzzles
INSERT INTO learn_puzzles (level, topic, initial_fen, solution_line_uci, explanation_md, rating) VALUES
  ('expert', 'other', 'r2q1rk1/ppp2ppp/2n2n2/3pp3/2B1P3/2N2N2/PPPP1PPP/R1BQ1RK1 w - - 0 1', '["c4d5"]', 'Forcing capture wins material.', 1500),
  ('expert', 'other', '1K1k4/1P6/8/8/8/r7/8/4R3 w - - 0 1', '["e1e4"]', 'Building the bridge in Lucena position.', 1600),
  ('expert', 'other', 'r1bq1rk1/pp3ppp/2n2n2/2bpp3/2P5/2N1PN2/PP1PBPPP/R1BQ1RK1 w - - 0 1', '["c4d5"]', 'Central break when ready.', 1550)
ON CONFLICT DO NOTHING;

-- Link new puzzles to packs
DO $$
DECLARE
  v_pack_id UUID;
  v_puzzle_ids UUID[];
  v_puzzle_id UUID;
  v_order INT;
BEGIN
  -- Opening principles pack
  SELECT id INTO v_pack_id FROM learn_practice_packs WHERE slug = 'opening-principles-drills';
  IF v_pack_id IS NOT NULL THEN
    SELECT array_agg(id) INTO v_puzzle_ids FROM learn_puzzles WHERE level = 'intermediate' AND topic = 'other';
    v_order := 0;
    IF v_puzzle_ids IS NOT NULL THEN
      FOREACH v_puzzle_id IN ARRAY v_puzzle_ids LOOP
        INSERT INTO learn_pack_items (pack_id, puzzle_id, order_index)
        VALUES (v_pack_id, v_puzzle_id, v_order)
        ON CONFLICT (pack_id, puzzle_id) DO NOTHING;
        v_order := v_order + 1;
      END LOOP;
    END IF;
  END IF;

  -- Essential endgames pack
  SELECT id INTO v_pack_id FROM learn_practice_packs WHERE slug = 'essential-endgames-drills';
  IF v_pack_id IS NOT NULL THEN
    SELECT array_agg(id) INTO v_puzzle_ids FROM learn_puzzles WHERE topic = 'endgame' AND level = 'intermediate';
    v_order := 0;
    IF v_puzzle_ids IS NOT NULL THEN
      FOREACH v_puzzle_id IN ARRAY v_puzzle_ids LOOP
        INSERT INTO learn_pack_items (pack_id, puzzle_id, order_index)
        VALUES (v_pack_id, v_puzzle_id, v_order)
        ON CONFLICT (pack_id, puzzle_id) DO NOTHING;
        v_order := v_order + 1;
      END LOOP;
    END IF;
  END IF;

  -- Strategy planning pack
  SELECT id INTO v_pack_id FROM learn_practice_packs WHERE slug = 'strategy-planning-drills';
  IF v_pack_id IS NOT NULL THEN
    SELECT array_agg(id) INTO v_puzzle_ids FROM learn_puzzles WHERE level = 'advanced';
    v_order := 0;
    IF v_puzzle_ids IS NOT NULL THEN
      FOREACH v_puzzle_id IN ARRAY v_puzzle_ids LOOP
        INSERT INTO learn_pack_items (pack_id, puzzle_id, order_index)
        VALUES (v_pack_id, v_puzzle_id, v_order)
        ON CONFLICT (pack_id, puzzle_id) DO NOTHING;
        v_order := v_order + 1;
      END LOOP;
    END IF;
  END IF;

  -- Master class pack
  SELECT id INTO v_pack_id FROM learn_practice_packs WHERE slug = 'master-class-mixed-drills';
  IF v_pack_id IS NOT NULL THEN
    SELECT array_agg(id) INTO v_puzzle_ids FROM learn_puzzles WHERE level = 'expert';
    v_order := 0;
    IF v_puzzle_ids IS NOT NULL THEN
      FOREACH v_puzzle_id IN ARRAY v_puzzle_ids LOOP
        INSERT INTO learn_pack_items (pack_id, puzzle_id, order_index)
        VALUES (v_pack_id, v_puzzle_id, v_order)
        ON CONFLICT (pack_id, puzzle_id) DO NOTHING;
        v_order := v_order + 1;
      END LOOP;
    END IF;
  END IF;
END $$;

-- Success message
DO $$ BEGIN RAISE NOTICE 'Learn content seeded successfully!'; END $$;
