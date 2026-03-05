-- =========================================
-- 토론 대결 플랫폼 PostgreSQL DDL
-- =========================================

CREATE TABLE IF NOT EXISTS users (
    id             BIGSERIAL PRIMARY KEY,
    nickname       VARCHAR(50)  NOT NULL,
    email          VARCHAR(100) NOT NULL UNIQUE,
    provider       VARCHAR(10)  NOT NULL CHECK (provider IN ('GOOGLE', 'KAKAO')),
    rating         INTEGER      NOT NULL DEFAULT 1000,
    total_debates  INTEGER      NOT NULL DEFAULT 0,
    wins           INTEGER      NOT NULL DEFAULT 0,
    created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rooms (
    id          BIGSERIAL PRIMARY KEY,
    type        VARCHAR(10)  NOT NULL CHECK (type IN ('RANDOM', 'TOPIC')),
    topic       VARCHAR(200),
    status      VARCHAR(10)  NOT NULL DEFAULT 'WAITING' CHECK (status IN ('WAITING', 'ACTIVE', 'ENDED')),
    pro_user_id BIGINT REFERENCES users(id),
    con_user_id BIGINT REFERENCES users(id),
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ended_at    TIMESTAMP
);

CREATE TABLE IF NOT EXISTS debate_messages (
    id         BIGSERIAL PRIMARY KEY,
    room_id    BIGINT       NOT NULL REFERENCES rooms(id),
    user_id    BIGINT       NOT NULL REFERENCES users(id),
    role       VARCHAR(5)   NOT NULL CHECK (role IN ('PRO', 'CON')),
    content    TEXT         NOT NULL,
    sent_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vote_records (
    id           BIGSERIAL PRIMARY KEY,
    room_id      BIGINT    NOT NULL REFERENCES rooms(id),
    spectator_id BIGINT    NOT NULL REFERENCES users(id),
    value        DOUBLE PRECISION NOT NULL CHECK (value >= 0.0 AND value <= 1.0),
    recorded_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS debate_results (
    id           BIGSERIAL PRIMARY KEY,
    room_id      BIGINT           NOT NULL UNIQUE REFERENCES rooms(id),
    winner       VARCHAR(5)       NOT NULL CHECK (winner IN ('PRO', 'CON', 'DRAW')),
    vote_average DOUBLE PRECISION,
    created_at   TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_rooms_status       ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_rooms_created_at   ON rooms(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_debate_messages_room_id ON debate_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_vote_records_room_id    ON vote_records(room_id);
CREATE INDEX IF NOT EXISTS idx_vote_records_room_spectator ON vote_records(room_id, spectator_id);
