import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { initChatSocket } from './src/sockets/chat.socket.js';

const PORT = process.env.PORT || 3000;

// Crear servidor HTTP
const httpServer = createServer(app);

// Configurar Socket.IO
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization"]
    }
});

app.set('io', io); // Make io accessible in controllers


// Inicializar sockets
initChatSocket(io);

// Iniciar el servidor
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
