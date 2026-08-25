CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE knowledge_chunks (
  chunk_key CHAR(64) PRIMARY KEY,
  course_key VARCHAR(40) NOT NULL,
  course_name VARCHAR(100) NOT NULL,
  module_id SMALLINT NOT NULL CHECK (module_id > 0),
  module_title VARCHAR(160) NOT NULL,
  topic VARCHAR(240) NOT NULL,
  content TEXT NOT NULL,
  lesson_path VARCHAR(700) NOT NULL,
  official_url VARCHAR(700) NOT NULL,
  source_label VARCHAR(180) NOT NULL,
  content_hash CHAR(64) NOT NULL,
  embedding_model VARCHAR(80),
  embedding vector(768),
  search_vector TSVECTOR GENERATED ALWAYS AS (
    setweight(to_tsvector('english', course_name), 'A') ||
    setweight(to_tsvector('english', module_title), 'A') ||
    setweight(to_tsvector('english', topic), 'A') ||
    setweight(to_tsvector('english', content), 'B')
  ) STORED,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX knowledge_chunks_course_module_idx ON knowledge_chunks(course_key, module_id);
CREATE INDEX knowledge_chunks_search_idx ON knowledge_chunks USING GIN(search_vector);
