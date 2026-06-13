declare global {
  interface CloudflareEnv {
    DB: D1Database;
    ASSETS_BUCKET: R2Bucket;
  }
}

export {};
