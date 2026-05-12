import axios from "axios";
import { SQLiteTodoRepository } from "../db/SQLiteRepository";

const ROBLE_DB_NAME = "offlinefirst_3569207f39";
const BASE_URL = `https://roble-api.openlab.uninorte.edu.co/database/${ROBLE_DB_NAME}`;

export const SyncService = {
  async login() {
    try {
      const res = await axios.post(
        `https://roble-api.openlab.uninorte.edu.co/auth/${ROBLE_DB_NAME}/login`,
        {
          email: "demo@uninorte.edu.co",
          password: "Demo-123",
        },
      );
      return res.data.accessToken;
    } catch (error) {}
  },

  async syncTodos(accessToken: string) {
    const repository = SQLiteTodoRepository.getInstance();

    //Obtener lo que no se ha sincronizado
    const pendingTodos = await repository.getPendingSync();
    if (pendingTodos.length > 0) {
      try {
        //Formatear
        const records = pendingTodos.map((todo) => ({
          local_id: todo.id,
          title: todo.title,
          synced: 1,
        }));

        //Enviar a Roble
        const res = await axios.post(
          `${BASE_URL}/insert`,
          {
            tableName: "todos",
            records: records,
          },
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        );

        //Marcar como sincronizados
        if (res.data.inserted.length > 0) {
          const syncedIds = pendingTodos.map((t) => t.id);
          await repository.markAsSynced(syncedIds);
        }
      } catch (error) {
        console.error("Error sincronizando:", error);
      }
    }

    const pendingDelete = await repository.getPendingDelete();
    for (const todo of pendingDelete) {
      try {
        await axios.delete(`${BASE_URL}/delete`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          data: {
            tableName: "todos",
            idColumn: "local_id",
            idValue: todo.id,
          },
        });
        await repository.hardDelete(todo.id);
      } catch (error) {
        console.error("Erro borrando:", error);
      }
    }

    return true;
  },
};
