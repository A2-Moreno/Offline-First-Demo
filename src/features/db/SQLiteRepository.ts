import * as SQLite from "expo-sqlite";
import { ITodo, ITodoRepository } from "../todo/ITodoRepository";

export class SQLiteTodoRepository implements ITodoRepository {
  private dbPromise: Promise<SQLite.SQLiteDatabase>;
  private static instance: SQLiteTodoRepository;

  private constructor() {
    this.dbPromise = SQLite.openDatabaseAsync("todos.db");
  }

  static getInstance(): SQLiteTodoRepository {
    if (!SQLiteTodoRepository.instance) {
      SQLiteTodoRepository.instance = new SQLiteTodoRepository();
    }
    return SQLiteTodoRepository.instance;
  }

  async init(): Promise<void> {
    const db = await this.dbPromise;
    await db.execAsync(`
            PRAGMA journal_mode = WAL;
            CREATE TABLE IF NOT EXISTS todos (
                id TEXT PRIMARY KEY NOT NULL,
                title TEXT NOT NULL,
                synced INTEGER DEFAULT 0,
                deleted INTEGER DEFAULT 0
            );
        `);
  }

  async insert(todo: ITodo): Promise<void> {
    const db = await this.dbPromise;
    await db.runAsync(
      "INSERT INTO todos (id, title, synced, deleted) VALUES (?, ?, ?, ?);",
      [todo.id, todo.title, todo.synced, todo.deleted],
    );
  }

  async getAll(): Promise<ITodo[]> {
    const db = await this.dbPromise;
    return await db.getAllAsync<ITodo>(
      "SELECT * FROM todos WHERE deleted = 0 ORDER BY id DESC;",
    );
  }

  async getPendingSync(): Promise<ITodo[]> {
    const db = await this.dbPromise;
    return await db.getAllAsync<ITodo>("SELECT * FROM todos WHERE synced = 0;");
  }

  async getPendingDelete(): Promise<ITodo[]> {
    const db = await this.dbPromise;
    return await db.getAllAsync<ITodo>(
      "SELECT * FROM todos WHERE deleted = 1;",
    );
  }

  async delete(id: string): Promise<void> {
    const db = await this.dbPromise;
    await db.runAsync("UPDATE todos SET deleted = 1 WHERE id = ?;", [id]);
  }

  async hardDelete(id: string): Promise<void> {
    const db = await this.dbPromise;
    await db.runAsync("DELETE FROM todos WHERE id = ?;", [id]);
  }

  async markAsSynced(ids: string[]): Promise<void> {
    const db = await this.dbPromise;
    const placeholders = ids.map(() => "?").join(",");
    await db.runAsync(
      `UPDATE todos SET synced = 1 WHERE id IN (${placeholders});`,
      ids,
    );
  }
}
