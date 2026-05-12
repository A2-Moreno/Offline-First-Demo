# Offline-First Demo

Esta es una aplicación React-Native sencilla desarrollada con Expo para llevar de nota tareas a realizar (To-Do list), con el fin de hacer una demostración práctica de las estrategias **Offline-First** en aplicaciones móviles.

Se implementó una base de datos SQLite local para garantizar el acceso a los datos a pesar de falta de conexión, que se integra con un sistema de sincronización automático que envía la información a Roble, un servicio remoto de base de datos.

## Ejecución

1. Instalar dependencias

   ```bash
   npm install
   ```

2. Iniciar la aplicación

   ```bash
   npx expo start
   ```