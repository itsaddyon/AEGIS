-- CAST — Cyber Awareness Simulation Trainer
-- SQLite schema. Local-first; user_id/synced_at columns are pre-added
-- so a future cloud-sync layer does not require a migration.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS user_profile (
    id              INTEGER PRIMARY KEY CHECK (id = 1), -- single local profile
    user_id         TEXT,                                -- future cloud sync id
    display_name    TEXT NOT NULL DEFAULT 'Learner',
    theme           TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('dark','light')),
    xp              INTEGER NOT NULL DEFAULT 0,
    level           INTEGER NOT NULL DEFAULT 1,
    cyber_rank      TEXT NOT NULL DEFAULT 'Novice',
    safety_score    INTEGER NOT NULL DEFAULT 0,
    streak_days     INTEGER NOT NULL DEFAULT 0,
    last_active_on  TEXT,                                 -- ISO date
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    synced_at       TEXT
);

CREATE TABLE IF NOT EXISTS missions (
    id              TEXT PRIMARY KEY,   -- e.g. 'mission-3-phishing'
    title           TEXT NOT NULL,
    order_index     INTEGER NOT NULL,
    xp_reward       INTEGER NOT NULL DEFAULT 100
);

CREATE TABLE IF NOT EXISTS mission_progress (
    mission_id      TEXT NOT NULL REFERENCES missions(id),
    status          TEXT NOT NULL DEFAULT 'locked'
                        CHECK (status IN ('locked','available','in_progress','completed')),
    quiz_score      INTEGER,
    completed_at    TEXT,
    PRIMARY KEY (mission_id)
);

CREATE TABLE IF NOT EXISTS simulations (
    id              TEXT PRIMARY KEY,   -- e.g. 'fake-inbox'
    title           TEXT NOT NULL,
    category        TEXT NOT NULL,      -- 'email','web','qr','otp','call','usb','social','browser','password'
    difficulty      TEXT NOT NULL DEFAULT 'beginner',
    xp_reward       INTEGER NOT NULL DEFAULT 50,
    is_available    INTEGER NOT NULL DEFAULT 1  -- 0 = "coming soon" stub
);

CREATE TABLE IF NOT EXISTS simulation_attempts (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    simulation_id   TEXT NOT NULL REFERENCES simulations(id),
    correct_count   INTEGER NOT NULL,
    total_count     INTEGER NOT NULL,
    xp_earned       INTEGER NOT NULL,
    attempted_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS achievements (
    id              TEXT PRIMARY KEY,   -- e.g. 'first-mission-complete'
    title           TEXT NOT NULL,
    description     TEXT NOT NULL,
    icon            TEXT NOT NULL DEFAULT 'award'
);

CREATE TABLE IF NOT EXISTS user_achievements (
    achievement_id  TEXT NOT NULL REFERENCES achievements(id),
    earned_at       TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (achievement_id)
);

CREATE TABLE IF NOT EXISTS daily_challenges (
    challenge_date  TEXT PRIMARY KEY,   -- ISO date, one challenge per day
    simulation_id   TEXT NOT NULL REFERENCES simulations(id),
    completed       INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS certificates (
    id              TEXT PRIMARY KEY,   -- unique certificate id (uuid)
    display_name    TEXT NOT NULL,
    final_score     INTEGER NOT NULL,
    issued_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS activity_log (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    kind            TEXT NOT NULL,      -- 'mission_complete','simulation_attempt','badge_earned', etc.
    label           TEXT NOT NULL,
    xp_delta        INTEGER NOT NULL DEFAULT 0,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Seed the 8 missions in order. Idempotent.
INSERT OR IGNORE INTO missions (id, title, order_index, xp_reward) VALUES
    ('m1-intro',            'Introduction to Cybersecurity', 1, 80),
    ('m2-passwords',        'Passwords',                     2, 100),
    ('m3-phishing',         'Phishing',                      3, 150),
    ('m4-email-safety',     'Email Safety',                  4, 100),
    ('m5-safe-browsing',    'Safe Browsing',                 5, 100),
    ('m6-social-engineering','Social Engineering',           6, 120),
    ('m7-mobile-security',  'Mobile Security',                7, 100),
    ('m8-final-assessment', 'Final Assessment',               8, 200);

INSERT OR REPLACE INTO simulations (id, title, category, difficulty, xp_reward, is_available) VALUES
    ('fake-inbox',        'Fake Email Inbox',            'email',    'beginner',     60, 1),
    ('real-vs-fake-site', 'Real Website vs Fake Website', 'web',      'beginner',     60, 1),
    ('qr-scanner',        'QR Code Scanner',              'qr',       'beginner',     40, 1),
    ('otp-scam',          'OTP Scam Simulation',          'otp',      'intermediate', 50, 1),
    ('phone-call',        'Phone Call (Vishing) Simulation','call',   'intermediate', 50, 1),
    ('usb-attack',        'USB Attack Simulation',        'usb',      'intermediate', 50, 1),
    ('social-chat',       'Social Engineering Conversation','social', 'advanced',     70, 1),
    ('browser-warning',   'Browser Warning Simulator',    'browser',  'beginner',     40, 1),
    ('password-lab',      'Password Strength Lab',        'password', 'beginner',     40, 1);


INSERT OR IGNORE INTO achievements (id, title, description, icon) VALUES
    ('first-steps',        'First Steps',        'Completed your first Mission.',             'footprints'),
    ('phish-spotter',      'Phish Spotter',       'Correctly identified 10 phishing emails.',   'fish-off'),
    ('perfect-inbox',      'Perfect Inbox',       'Scored 100% on the Fake Inbox simulation.',  'inbox'),
    ('week-streak',        'Consistent Learner',  'Kept a 7-day learning streak.',              'flame'),
    ('cyber-graduate',     'Cyber Graduate',      'Completed the Final Assessment.',            'graduation-cap');

INSERT OR IGNORE INTO user_profile (id, display_name) VALUES (1, 'Learner');
