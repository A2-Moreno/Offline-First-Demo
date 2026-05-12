import React, { useEffect, useState, useRef } from "react";
import { FlatList, View, StyleSheet } from "react-native";
import {
  Surface,
  Text,
  TextInput,
  Button,
  List,
  IconButton,
  Divider,
} from "react-native-paper";
import { SQLiteTodoRepository } from "../db/SQLiteRepository";
import { ITodo } from "../todo/ITodoRepository";
import { SyncService } from "../db/SyncService";
import NetInfo from "@react-native-community/netinfo";

export default function HomeScreen() {
  const [taskTitle, setTaskTitle] = useState("");
  const [todos, setTodos] = useState<ITodo[]>([]);

  const repository = SQLiteTodoRepository.getInstance();

  const [isSyncing, setIsSyncing] = useState(false);

  const wasOffline = useRef(false);

  const handleSync = async () => {
    if (isSyncing) return; //Evitar varias sincronizaciones

    const netState = await NetInfo.fetch();
    //Verificar conexión antes de sincronizar
    if (netState.isConnected && netState.isInternetReachable) {
      setIsSyncing(true);

      try {
        const token = await SyncService.login();

        const success = await SyncService.syncTodos(token);

        if (success) {
          await loadData();
        }
      } catch (error) {
        console.log("Error:", error);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  useEffect(() => {
    const prepare = async () => {
      await repository.init();
      await loadData();
    };
    prepare();

    //Sincronizar al restaurar conexión
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isConnected = state.isConnected && state.isInternetReachable;
      if (wasOffline.current && isConnected) {
        handleSync();
      }
      wasOffline.current = !isConnected;
    });

    return () => unsubscribe(); //Limpiar el listener
  }, []);

  const loadData = async () => {
    const data = await repository.getAll();
    setTodos(data);
  };

  const handleAddTodo = async () => {
    if (!taskTitle.trim()) return;

    const newTodo: ITodo = {
      id: Date.now().toString(),
      title: taskTitle,
      synced: 0,
      deleted: 0,
    };
    await repository.insert(newTodo);
    setTaskTitle("");
    await loadData();
    handleSync();
  };

  const handleDelete = async (id: string) => {
    await repository.delete(id);
    await loadData();
    handleSync();
  };

  return (
    <Surface style={styles.container}>
      {/* Header de la App */}
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Mis Tareas
        </Text>
      </View>

      {/* Formulario de Entrada */}
      <Surface style={styles.inputContainer} elevation={1}>
        <TextInput
          label="¿Qué hay que hacer?"
          value={taskTitle}
          onChangeText={setTaskTitle}
          mode="outlined"
          style={styles.input}
          theme={{
            colors: {
              primary: "#000",
              outline: "#000",
            },
          }}
        />
        <Button
          mode="contained"
          onPress={handleAddTodo}
          icon="plus"
          style={styles.button}
        >
          Agregar Tarea
        </Button>

        {/*Botón de sincronización*/}
        <Button
          mode="contained"
          onPress={handleSync}
          icon="sync"
          style={styles.syncButton}
          loading={isSyncing}
          disabled={isSyncing}
        >
          Sincronizar Datos
        </Button>
      </Surface>

      {/* Lista de Tareas*/}
      <FlatList
        data={todos}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <Divider />}
        renderItem={({ item }) => (
          <List.Item
            title={item.title}
            description={item.synced ? "Sincronizado" : "Solo local"}
            left={(props) => (
              <IconButton
                {...props}
                icon={item.synced ? "cloud-check" : "cloud-alert"}
                iconColor={item.synced ? "#4CAF50" : "#FFA000"}
              />
            )}
            right={(props) => (
              <IconButton
                {...props}
                icon="trash-can-outline"
                iconColor="#FF5252"
                onPress={() => handleDelete(item.id)}
              />
            )}
          />
        )}
        contentContainerStyle={styles.listContent}
      />
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontWeight: "bold",
    color: "#000",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  inputContainer: {
    padding: 20,
    gap: 10,
    marginHorizontal: 16,
    borderRadius: 15,
    marginBottom: 20,
    backgroundColor: "#f5f5f5",
  },
  input: {
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#FFA000",
    borderRadius: 10,
  },
  syncButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 10,
  },
  listContent: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
});
