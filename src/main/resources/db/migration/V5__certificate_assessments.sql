CREATE TABLE assessment_attempts (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_code VARCHAR(80) NOT NULL,
  attempt_number SMALLINT NOT NULL CHECK (attempt_number BETWEEN 1 AND 3),
  status VARCHAR(16) NOT NULL CHECK (status IN ('IN_PROGRESS', 'PASSED', 'FAILED', 'VOID')),
  started_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  submitted_at TIMESTAMPTZ,
  score SMALLINT,
  warning_count SMALLINT NOT NULL DEFAULT 0 CHECK (warning_count BETWEEN 0 AND 3),
  UNIQUE (user_id, course_code, attempt_number)
);

CREATE INDEX assessment_attempts_user_course_idx
  ON assessment_attempts(user_id, course_code, started_at DESC);

CREATE UNIQUE INDEX assessment_attempts_one_active_idx
  ON assessment_attempts(user_id, course_code)
  WHERE status = 'IN_PROGRESS';

CREATE TABLE assessment_questions (
  attempt_id UUID NOT NULL REFERENCES assessment_attempts(id) ON DELETE CASCADE,
  position SMALLINT NOT NULL CHECK (position BETWEEN 1 AND 15),
  chunk_key CHAR(64) NOT NULL,
  module_id SMALLINT NOT NULL,
  module_title TEXT NOT NULL,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_option SMALLINT NOT NULL CHECK (correct_option BETWEEN 0 AND 3),
  selected_option SMALLINT CHECK (selected_option BETWEEN 0 AND 3),
  PRIMARY KEY (attempt_id, position)
);

CREATE INDEX assessment_questions_chunk_idx ON assessment_questions(chunk_key);
