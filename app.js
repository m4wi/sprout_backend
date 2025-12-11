// =============================
//         IMPORTS
// =============================
import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Middlewares
import upload from './src/middlewares/upload.js';

// Routes
import userRoutes from './src/routes/user.routes.js';
import greenpointRoutes from './src/routes/greenpoint.routes.js';
import reservationRoutes from './src/routes/greenpointReservation.routes.js';
import authRoutes from './src/routes/auth.routes.js';
import notificationRoutes from './src/routes/notification.routes.js';
import reportRoutes from './src/routes/greenpointReport.routes.js';
import adminRoutes from './src/routes/admin.routes.js';
import directChatRoutes from './src/routes/directChat.routes.js';


// =============================
//         INITIAL SETUP
// =============================
const app = express();

app.use(cors({
  origin: "*",
  methods: "GET,POST,PUT,DELETE,PATCH",
  allowedHeaders: "Content-Type, Authorization"
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// =============================
//        BASE ROUTE
// =============================
app.get("/", (req, res) => {
  res.send("Hello desde backend");
});


// =============================
//           ROUTES
// =============================
app.use('/users', userRoutes);
app.use('/greenpoints', greenpointRoutes);
app.use('/api', reservationRoutes);
app.use('/auth', authRoutes);
app.use('/notifications', notificationRoutes);
app.use('/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/direct-chats', directChatRoutes);


// =============================
//        STATIC FILES
// =============================
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use('/profile_photo',
  express.static(join(__dirname, 'src', 'storage', 'profile_photo'))
);

app.use('/greenpoint_photo',
  express.static(join(__dirname, 'src', 'storage', 'greenpoint_photo'))
);


// =============================
//        EXPORT APP
// =============================
export default app;
