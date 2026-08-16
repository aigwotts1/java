CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  name VARCHAR(60) NOT NULL,
  email VARCHAR(254) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash CHAR(64) PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);
CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS learning_progress (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_code VARCHAR(80) NOT NULL DEFAULT 'java-basecamp-complete',
  module_id SMALLINT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, course_code, module_id)
);

ALTER TABLE learning_progress
  ADD COLUMN IF NOT EXISTS course_code VARCHAR(80) NOT NULL DEFAULT 'java-basecamp-complete';

ALTER TABLE learning_progress DROP CONSTRAINT IF EXISTS learning_progress_pkey;
ALTER TABLE learning_progress ADD PRIMARY KEY (user_id, course_code, module_id);

ALTER TABLE learning_progress DROP CONSTRAINT IF EXISTS learning_progress_module_id_check;
ALTER TABLE learning_progress ADD CONSTRAINT learning_progress_module_id_check CHECK (module_id BETWEEN 1 AND 18);

CREATE INDEX IF NOT EXISTS learning_progress_user_course_idx ON learning_progress(user_id, course_code);

CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY,
  public_id VARCHAR(32) NOT NULL UNIQUE,
  verification_hash CHAR(64) NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_code VARCHAR(80) NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  unpublished_at TIMESTAMPTZ,
  consented_at TIMESTAMPTZ,
  consent_version VARCHAR(24),
  UNIQUE (user_id, course_code)
);

ALTER TABLE certificates ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS unpublished_at TIMESTAMPTZ;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS consented_at TIMESTAMPTZ;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS consent_version VARCHAR(24);

CREATE INDEX IF NOT EXISTS certificates_user_id_idx ON certificates(user_id);
CREATE INDEX IF NOT EXISTS certificates_issued_at_idx ON certificates(issued_at);

DELETE FROM sessions WHERE expires_at <= NOW();
