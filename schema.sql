CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  plan        VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free', 'premium', 'business')),
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS texts (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title       VARCHAR(200),
  content     TEXT NOT NULL,
  tone        VARCHAR(50),
  word_count  INTEGER DEFAULT 0,
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER REFERENCES users(id) ON DELETE CASCADE,
  plan          VARCHAR(20) NOT NULL CHECK (plan IN ('free', 'premium', 'business')),
  status        VARCHAR(20) DEFAULT 'active',
  started_at    TIMESTAMP DEFAULT NOW(),
  expires_at    TIMESTAMP,
  UNIQUE(user_id)
);
