declare module "cloudflare:workers" {
  interface WorkerEnv {
    DB?: D1Database;
    ASSETS?: Fetcher;
    IMAGES?: {
      input(stream: ReadableStream): {
        transform(options: Record<string, unknown>): {
          output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
        };
      };
    };
  }
  export const env: WorkerEnv;
}

interface Fetcher {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

interface D1Database {
  prepare(query: string): unknown;
  dump(): Promise<ArrayBuffer>;
  batch<T = unknown>(statements: unknown[]): Promise<T[]>;
  exec<T = unknown>(query: string): Promise<T>;
}
