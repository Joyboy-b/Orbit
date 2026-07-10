declare module "node:sqlite" {
  export class StatementSync {
    run(...parameters: unknown[]): { changes: number; lastInsertRowid: number | bigint };
    get<T = unknown>(...parameters: unknown[]): T | undefined;
    all<T = unknown>(...parameters: unknown[]): T[];
  }

  export class DatabaseSync {
    constructor(location: string);
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
  }
}
