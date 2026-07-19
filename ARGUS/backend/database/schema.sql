-- ARGUS core schema (SQLite). Designed to be Postgres-portable later:
-- avoid SQLite-only pragmas in application code, keep types ANSI-standard.

CREATE TABLE IF NOT EXISTS case_files (
    id                  TEXT PRIMARY KEY,          -- e.g. "CASE #00017"
    threat_name         TEXT NOT NULL,
    detection_module    TEXT NOT NULL,
    severity            TEXT NOT NULL CHECK (severity IN ('low','medium','high','critical')),
    confidence          INTEGER NOT NULL CHECK (confidence BETWEEN 0 AND 100),
    status              TEXT NOT NULL DEFAULT 'new'
                        CHECK (status IN ('new','investigating','contained','resolved','dismissed')),
    opened_at           TEXT NOT NULL,
    updated_at           TEXT NOT NULL,
    source_ip           TEXT,
    destination_ip      TEXT,
    ports               TEXT,                      -- JSON array of ints
    protocol            TEXT,
    plain_english       TEXT,
    analogy             TEXT,
    how_it_works        TEXT,
    why_attackers_do_it TEXT,
    how_to_defend       TEXT,
    potential_impact    TEXT,
    recommended_response TEXT,                     -- JSON array of strings
    mitre_attack_id     TEXT,
    bookmarked          INTEGER NOT NULL DEFAULT 0,
    notes               TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS evidence (
    id             TEXT PRIMARY KEY,
    case_id        TEXT NOT NULL REFERENCES case_files(id) ON DELETE CASCADE,
    timestamp      TEXT NOT NULL,
    label          TEXT NOT NULL,
    detail         TEXT,
    source_ip      TEXT,
    destination_ip TEXT,
    port           INTEGER,
    protocol       TEXT
);

CREATE TABLE IF NOT EXISTS rules (
    id           TEXT PRIMARY KEY,
    name         TEXT NOT NULL,
    module       TEXT NOT NULL,       -- maps to a detection engine module id
    enabled      INTEGER NOT NULL DEFAULT 1,
    parameters   TEXT,                -- JSON blob of module-specific thresholds
    created_at   TEXT NOT NULL,
    updated_at   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS event_log (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp  TEXT NOT NULL,
    level      TEXT NOT NULL,          -- info | warning | error
    source     TEXT NOT NULL,          -- e.g. "engine.port_scan"
    message    TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_case_status ON case_files(status);
CREATE INDEX IF NOT EXISTS idx_case_severity ON case_files(severity);
CREATE INDEX IF NOT EXISTS idx_evidence_case ON evidence(case_id);
