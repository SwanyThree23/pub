-- SwanyThree Ultimate MVP Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  subscription_status VARCHAR(50) DEFAULT 'inactive',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Streams table
CREATE TABLE IF NOT EXISTS streams (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  evmux_id VARCHAR(255) UNIQUE,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'offline',
  created_at TIMESTAMP DEFAULT NOW(),
  started_at TIMESTAMP,
  ended_at TIMESTAMP
);

-- Chat messages table (for moderation tracking)
CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  stream_id INTEGER REFERENCES streams(id) ON DELETE CASCADE,
  username VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  toxicity_score FLOAT DEFAULT 0,
  ai_confidence FLOAT DEFAULT 0,
  human_reviewed BOOLEAN DEFAULT FALSE,
  final_decision VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- HITL reviews table
CREATE TABLE IF NOT EXISTS hitl_reviews (
  id SERIAL PRIMARY KEY,
  review_type VARCHAR(50) NOT NULL,
  data JSONB,
  status VARCHAR(50) DEFAULT 'pending',
  assigned_to INTEGER REFERENCES users(id),
  decision VARCHAR(50),
  feedback TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Model metrics table (for drift detection)
CREATE TABLE IF NOT EXISTS model_metrics (
  id SERIAL PRIMARY KEY,
  model_name VARCHAR(100) NOT NULL,
  prediction_input TEXT,
  prediction_output JSONB,
  confidence FLOAT,
  ground_truth VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- VDO.Ninja rooms table
CREATE TABLE IF NOT EXISTS vdo_rooms (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  room_id VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255),
  password VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_streams_user_id ON streams(user_id);
CREATE INDEX IF NOT EXISTS idx_streams_status ON streams(status);
CREATE INDEX IF NOT EXISTS idx_messages_stream ON chat_messages(stream_id);
CREATE INDEX IF NOT EXISTS idx_messages_reviewed ON chat_messages(human_reviewed);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON hitl_reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_assigned ON hitl_reviews(assigned_to);
CREATE INDEX IF NOT EXISTS idx_metrics_model ON model_metrics(model_name);
CREATE INDEX IF NOT EXISTS idx_metrics_created ON model_metrics(created_at);

-- Create a default admin user (password: admin123)
INSERT INTO users (username, email, password_hash, role)
VALUES ('admin', 'admin@swanythree.com', '$2b$10$rXKZ7JxGZGxGZGxGZGxGZOeKqZ7JxGZGxGZGxGZGxGZGxGZGxGZGx', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Add some sample data for testing
INSERT INTO users (username, email, password_hash, role)
VALUES
  ('streamer1', 'streamer1@test.com', '$2b$10$rXKZ7JxGZGxGZGxGZGxGZOeKqZ7JxGZGxGZGxGZGxGZGxGZGxGZGx', 'user'),
  ('moderator1', 'moderator1@test.com', '$2b$10$rXKZ7JxGZGxGZGxGZGxGZOeKqZ7JxGZGxGZGxGZGxGZGxGZGxGZGx', 'moderator')
ON CONFLICT (email) DO NOTHING;
