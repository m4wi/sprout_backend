import express from 'express'
import cors from 'cors';
import 'dotenv/config';

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

//middlewares
import { authenticateToken } from './src/middlewares/auth.js';

// routes
import userRoutes from './src/routes/user.routes.js'
import greenpointRoutes from './src/routes/greenpoint.routes.js'
import reservationRoutes from './src/routes/greenpointReservation.routes.js'
import authRoutes from './src/routes/auth.routes.js'
import notificationRoutes from './src/routes/notification.routes.js'


const app = express();
app.use(cors({
  origin: "*",     // cualquiera
  methods: "GET,POST,PUT,DELETE,PATCH",
  allowedHeaders: "Content-Type, Authorization"
}));

app.use(express.json());

app.use(express.urlencoded({ extended: true })); // Opcional si envías forms





app.get("/", (req, res) => {
  res.send("Hello desde backend")
})


app.use('/users', userRoutes);
app.use('/greenpoints', greenpointRoutes);
app.use('/api', reservationRoutes);
app.use('/auth', authRoutes);
app.use('/notifications', notificationRoutes);
import reportRoutes from './src/routes/greenpointReport.routes.js';
app.use('/reports', reportRoutes);
import adminRoutes from './src/routes/admin.routes.js';
app.use('/api/admin', adminRoutes);

import upload from './src/middlewares/upload.js'

//app.post('/create', upload, UserController.updateProfilePhoto)

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use('/profile_photo', express.static(join(__dirname, 'src', 'storage', 'profile_photo')));
app.use('/greenpoint_photo', express.static(join(__dirname, 'src', 'storage', 'greenpoint_photo')));



import { createServer } from 'http';
import { Server } from 'socket.io';
import { initChatSocket } from './src/sockets/chat.socket.js';

const PORT = process.env.PORT || 3000;

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
  }
});

initChatSocket(io);

httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

export default app;

