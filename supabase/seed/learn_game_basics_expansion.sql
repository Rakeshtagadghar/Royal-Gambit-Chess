-- Seed file for expanding Chess Basics track with piece lessons
-- Adds: The Rook, The Bishop, The Queen, The King, Castling
-- Run after learn_content.sql

-- ============================================
-- UPDATE EXISTING LESSON ORDER INDEXES
-- ============================================
-- Move back-rank-mate and board-coordinates to make room for new lessons
UPDATE learn_lessons SET order_index = 7 WHERE slug = 'back-rank-mate';
UPDATE learn_lessons SET order_index = 8 WHERE slug = 'board-coordinates';

-- ============================================
-- ADD NEW PIECE LESSONS TO CHESS BASICS TRACK
-- ============================================

DO $$
DECLARE
  v_track_id UUID;
  v_lesson_id UUID;
BEGIN
  SELECT id INTO v_track_id FROM learn_tracks WHERE slug = 'beginner-basics';

  -- ============================================
  -- Lesson: The Rook (order_index = 2)
  -- ============================================
  INSERT INTO learn_lessons (track_id, slug, title, topic, level, description, estimated_minutes, order_index, is_published)
  VALUES (v_track_id, 'the-rook', 'The Rook', 'rules', 'beginner', 'Learn how rooks move in straight lines, how they capture, and why open files matter.', 5, 2, true)
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_lesson_id;

  IF v_lesson_id IS NOT NULL THEN
    INSERT INTO learn_lesson_steps (lesson_id, step_index, type, title, body_md, initial_fen, meta) VALUES
    (v_lesson_id, 0, 'explain', 'How the Rook Moves', 'Rooks move any number of squares **horizontally** or **vertically**.

**Key rules:**
- Rooks move in straight lines (files and ranks)
- They **cannot jump** over pieces
- Capturing works by landing on an enemy piece square', '4k3/8/8/8/8/8/8/4R1K1 w - - 0 1', '{"highlights": ["e1"], "arrows": [{"from": "e1", "to": "e8", "color": "green"}, {"from": "e1", "to": "a1", "color": "green"}, {"from": "e1", "to": "h1", "color": "green"}]}'),

    (v_lesson_id, 1, 'explain', 'Blocking', 'Sliding pieces (rook/bishop/queen) cannot move through other pieces.

If something is in the way, the rook must stop before it.', '4k3/8/8/8/8/8/4P3/4R1K1 w - - 0 1', '{"highlights": ["e2"], "arrows": [{"from": "e1", "to": "e2", "color": "red"}]}'),

    (v_lesson_id, 2, 'move_task', 'Capture with the Rook', 'Capture the black pawn on e7 with your rook.', '4k3/4p3/8/8/8/8/8/4R1K1 w - - 0 1', '{"pieceToMove": "e1"}');

    UPDATE learn_lesson_steps
    SET required_move_uci = 'e1e7',
        explain_correct_md = 'Nice! The rook captured by moving straight up the file.',
        explain_wrong_md = 'Move the rook from e1 to e7 in a straight line to capture the pawn.',
        hints = '["Rooks move in straight lines", "Capture by landing on the pawn''s square", "Try moving up the e-file"]'
    WHERE lesson_id = v_lesson_id AND step_index = 2;

    INSERT INTO learn_lesson_steps (lesson_id, step_index, type, title, body_md, initial_fen, meta) VALUES
    (v_lesson_id, 3, 'quiz', 'Rook Quiz', 'Quick check!', NULL, '{"quiz": {"question": "Which directions can a rook move?", "options": [{"id": "a", "text": "Diagonally"}, {"id": "b", "text": "Horizontally and vertically"}, {"id": "c", "text": "In an L-shape"}, {"id": "d", "text": "One square only"}], "correctOptionId": "b", "explainMd": "Rooks move any number of squares horizontally or vertically, but never diagonally."}}');
  END IF;

  -- ============================================
  -- Lesson: The Bishop (order_index = 3)
  -- ============================================
  INSERT INTO learn_lessons (track_id, slug, title, topic, level, description, estimated_minutes, order_index, is_published)
  VALUES (v_track_id, 'the-bishop', 'The Bishop', 'rules', 'beginner', 'Learn diagonal movement and why bishops stay on the same colour squares forever.', 5, 3, true)
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_lesson_id;

  IF v_lesson_id IS NOT NULL THEN
    INSERT INTO learn_lesson_steps (lesson_id, step_index, type, title, body_md, initial_fen, meta) VALUES
    (v_lesson_id, 0, 'explain', 'How the Bishop Moves', 'Bishops move any number of squares **diagonally**.

**Key rules:**
- Bishops move diagonally only
- They **cannot jump** over pieces
- A bishop always stays on the same colour square (light or dark)', '4k3/8/8/8/3B4/8/8/4K3 w - - 0 1', '{"highlights": ["d4"], "arrows": [{"from": "d4", "to": "a7", "color": "green"}, {"from": "d4", "to": "g7", "color": "green"}, {"from": "d4", "to": "a1", "color": "green"}, {"from": "d4", "to": "h8", "color": "green"}, {"from": "d4", "to": "g1", "color": "green"}]}'),

    (v_lesson_id, 1, 'explain', 'Same Colour Forever', 'This bishop is on a dark square, so it can only ever land on dark squares.

That''s why each side starts with **one light-square bishop** and **one dark-square bishop**.', '4k3/8/8/8/3B4/8/8/4K3 w - - 0 1', '{"highlights": ["d4"]}'),

    (v_lesson_id, 2, 'move_task', 'Capture Diagonally', 'Capture the black pawn on g7 with your bishop.', '4k3/6p1/8/8/3B4/8/8/4K3 w - - 0 1', '{"pieceToMove": "d4"}');

    UPDATE learn_lesson_steps
    SET required_move_uci = 'd4g7',
        explain_correct_md = 'Perfect! Bishops capture diagonally by landing on the target square.',
        explain_wrong_md = 'Move the bishop along the diagonal from d4 to g7.',
        hints = '["Bishops move diagonally", "Follow the diagonal line to g7", "Capture by landing on g7"]'
    WHERE lesson_id = v_lesson_id AND step_index = 2;

    INSERT INTO learn_lesson_steps (lesson_id, step_index, type, title, body_md, initial_fen, meta) VALUES
    (v_lesson_id, 3, 'quiz', 'Bishop Quiz', 'Quick check!', NULL, '{"quiz": {"question": "Can a bishop ever change the colour of square it sits on?", "options": [{"id": "a", "text": "Yes, if it captures"}, {"id": "b", "text": "Yes, if it moves far enough"}, {"id": "c", "text": "No, never"}, {"id": "d", "text": "Only in endgames"}], "correctOptionId": "c", "explainMd": "A bishop always stays on the same colour because diagonal moves preserve square colour."}}');
  END IF;

  -- ============================================
  -- Lesson: The Queen (order_index = 4)
  -- ============================================
  INSERT INTO learn_lessons (track_id, slug, title, topic, level, description, estimated_minutes, order_index, is_published)
  VALUES (v_track_id, 'the-queen', 'The Queen', 'rules', 'beginner', 'Learn the queen''s movement: like a rook and bishop combined.', 6, 4, true)
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_lesson_id;

  IF v_lesson_id IS NOT NULL THEN
    INSERT INTO learn_lesson_steps (lesson_id, step_index, type, title, body_md, initial_fen, meta) VALUES
    (v_lesson_id, 0, 'explain', 'Queen = Rook + Bishop', 'The queen is the most powerful piece.

She moves like a **rook** and a **bishop** combined:
- Any number of squares horizontally/vertically
- Any number of squares diagonally

Like other sliding pieces, she **cannot jump** over pieces.', '4k3/8/8/8/3Q4/8/8/4K3 w - - 0 1', '{"highlights": ["d4"], "arrows": [{"from": "d4", "to": "d8", "color": "green"}, {"from": "d4", "to": "a4", "color": "green"}, {"from": "d4", "to": "h4", "color": "green"}, {"from": "d4", "to": "h8", "color": "green"}]}'),

    (v_lesson_id, 1, 'move_task', 'Queen Capture', 'Capture the black pawn on d7 with your queen.', '4k3/3p4/8/8/3Q4/8/8/4K3 w - - 0 1', '{"pieceToMove": "d4"}');

    UPDATE learn_lesson_steps
    SET required_move_uci = 'd4d7',
        explain_correct_md = 'Great! The queen captured by moving straight up (like a rook).',
        explain_wrong_md = 'Move the queen from d4 to d7 (same file) to capture the pawn.',
        hints = '["Queen moves like a rook or bishop", "d4 to d7 is a straight vertical line", "Capture by landing on d7"]'
    WHERE lesson_id = v_lesson_id AND step_index = 1;

    INSERT INTO learn_lesson_steps (lesson_id, step_index, type, title, body_md, initial_fen, meta) VALUES
    (v_lesson_id, 2, 'quiz', 'Queen Quiz', 'Quick check!', NULL, '{"quiz": {"question": "The queen moves like which pieces combined?", "options": [{"id": "a", "text": "Knight + Bishop"}, {"id": "b", "text": "Rook + Bishop"}, {"id": "c", "text": "King + Rook"}, {"id": "d", "text": "Pawn + Knight"}], "correctOptionId": "b", "explainMd": "The queen combines rook movement (straight lines) and bishop movement (diagonals)."}}');
  END IF;

  -- ============================================
  -- Lesson: The King (order_index = 5)
  -- ============================================
  INSERT INTO learn_lessons (track_id, slug, title, topic, level, description, estimated_minutes, order_index, is_published)
  VALUES (v_track_id, 'the-king', 'The King', 'rules', 'beginner', 'Learn how the king moves, what check means, and what moves are illegal.', 6, 5, true)
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_lesson_id;

  IF v_lesson_id IS NOT NULL THEN
    INSERT INTO learn_lesson_steps (lesson_id, step_index, type, title, body_md, initial_fen, meta) VALUES
    (v_lesson_id, 0, 'explain', 'How the King Moves', 'The king moves **one square** in any direction.

**Key rule:** The king is not allowed to move into **check** (a square attacked by an enemy piece).', '4k3/8/8/8/8/8/4K3/8 w - - 0 1', '{"highlights": ["e2"], "arrows": [{"from": "e2", "to": "d3", "color": "green"}, {"from": "e2", "to": "e3", "color": "green"}, {"from": "e2", "to": "f3", "color": "green"}, {"from": "e2", "to": "d2", "color": "green"}, {"from": "e2", "to": "f2", "color": "green"}, {"from": "e2", "to": "d1", "color": "green"}, {"from": "e2", "to": "e1", "color": "green"}, {"from": "e2", "to": "f1", "color": "green"}]}'),

    (v_lesson_id, 1, 'explain', 'What is Check?', 'Your king is in **check** if an enemy piece attacks the king''s square.

When in check, you must respond immediately by:
- Moving the king
- Capturing the attacking piece
- Blocking the attack (if possible)', '4k3/8/8/8/8/8/4K3/4r3 w - - 0 1', '{"highlights": ["e2", "e1"]}'),

    (v_lesson_id, 2, 'move_task', 'Escape Check', 'Your king is in check from the rook. Move the king to a safe square.', '4k3/8/8/8/8/8/4K3/4r3 w - - 0 1', '{"pieceToMove": "e2"}');

    UPDATE learn_lesson_steps
    SET required_move_uci = 'e2f3',
        explain_correct_md = 'Well done! The king moved to a square not attacked by the rook.',
        explain_wrong_md = 'Move the king to a square that is not attacked by the rook on e1 (try f3).',
        hints = '["You must respond to check", "Avoid squares attacked by the rook", "Try moving diagonally away to f3"]'
    WHERE lesson_id = v_lesson_id AND step_index = 2;

    INSERT INTO learn_lesson_steps (lesson_id, step_index, type, title, body_md, initial_fen, meta) VALUES
    (v_lesson_id, 3, 'quiz', 'King Quiz', 'Quick check!', NULL, '{"quiz": {"question": "Is the king allowed to move into a square attacked by an enemy piece?", "options": [{"id": "a", "text": "Yes, if it captures"}, {"id": "b", "text": "Yes, if it is a good move"}, {"id": "c", "text": "No, never"}, {"id": "d", "text": "Only in the opening"}], "correctOptionId": "c", "explainMd": "The king cannot move into check. Any move that places the king on an attacked square is illegal."}}');
  END IF;

  -- ============================================
  -- Lesson: Castling (order_index = 6)
  -- ============================================
  INSERT INTO learn_lessons (track_id, slug, title, topic, level, description, estimated_minutes, order_index, is_published)
  VALUES (v_track_id, 'castling', 'Castling', 'rules', 'beginner', 'Learn the special king-and-rook move that improves king safety and activates a rook.', 5, 6, true)
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_lesson_id;

  IF v_lesson_id IS NOT NULL THEN
    INSERT INTO learn_lesson_steps (lesson_id, step_index, type, title, body_md, initial_fen, meta) VALUES
    (v_lesson_id, 0, 'explain', 'What is Castling?', 'Castling is a special move that moves the **king** and **rook** at the same time.

**Why castle?**
- Makes your king safer
- Activates your rook toward the center

Kingside castling (O-O): King moves **two squares** toward the rook, rook jumps over to the other side.', '4k3/8/8/8/8/8/8/R3K2R w KQ - 0 1', '{"highlights": ["e1", "h1"], "arrows": [{"from": "e1", "to": "g1", "color": "green"}, {"from": "h1", "to": "f1", "color": "green"}]}'),

    (v_lesson_id, 1, 'explain', 'When Castling is Legal', 'You can castle only if:
- The king and rook have **not moved**
- Squares between them are **empty**
- The king is **not in check**
- The king does **not pass through** check
- The king does **not land in** check', '4k3/8/8/8/8/8/8/R3K2R w KQ - 0 1', '{}'),

    (v_lesson_id, 2, 'move_task', 'Castle Kingside', 'Castle kingside (O-O).', '4k3/8/8/8/8/8/8/R3K2R w KQ - 0 1', '{"pieceToMove": "e1"}');

    UPDATE learn_lesson_steps
    SET required_move_uci = 'e1g1',
        explain_correct_md = 'Nice! You castled kingside: king to g1 and rook to f1.',
        explain_wrong_md = 'Castle kingside by moving your king from e1 to g1 (two squares).',
        hints = '["Castling is a king move", "Move king two squares toward the rook", "From e1 to g1 is kingside castling"]'
    WHERE lesson_id = v_lesson_id AND step_index = 2;

    INSERT INTO learn_lesson_steps (lesson_id, step_index, type, title, body_md, initial_fen, meta) VALUES
    (v_lesson_id, 3, 'quiz', 'Castling Quiz', 'Quick check!', NULL, '{"quiz": {"question": "Can you castle while your king is in check?", "options": [{"id": "a", "text": "Yes"}, {"id": "b", "text": "No"}], "correctOptionId": "b", "explainMd": "You cannot castle out of check. The king must not be in check before castling."}}');
  END IF;

END $$;
