export interface ITodo {
  id: string;
  title: string;
  synced: number; // Offline-First
  deleted: number; //Offline-First
}

export interface ITodoRepository {
  init(): Promise<void>;
  insert(todo: ITodo): Promise<void>;
  getAll(): Promise<ITodo[]>;
  getPendingSync(): Promise<ITodo[]>;
  markAsSynced(ids: string[]): Promise<void>;
  delete(id: string): Promise<void>;
}
