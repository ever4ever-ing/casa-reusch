declare global {
  interface CloudflareEnv {
    DB: D1Database;
    ASSETS_BUCKET: R2Bucket;
    ADMIN_PASSWORD?: string;
    ADMIN_SECRET?: string;
  }
}

export {};
