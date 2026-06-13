CREATE TABLE IF NOT EXISTS model_photos (
  id TEXT PRIMARY KEY NOT NULL,
  model_id TEXT NOT NULL,
  image_key TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (model_id) REFERENCES models(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_model_photos_model ON model_photos(model_id, sort_order);

INSERT INTO model_photos (id, model_id, image_key, sort_order)
SELECT id || '-cover', id, image_key, 0
FROM models
WHERE image_key IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM model_photos mp WHERE mp.model_id = models.id
  );
