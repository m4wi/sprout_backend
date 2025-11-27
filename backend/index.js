import express from 'express'
import cors from 'cors';
import 'dotenv/config';

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

//middlewares
import { authenticateToken } from './middlewares/auth.js';

// routes
import userRoutes from './routes/user.routes.js'
import greenpointRoutes from './routes/greenpoint.routes.js'
import reservationRoutes from './routes/greenpointReservation.routes.js'
import authRoutes from './routes/auth.routes.js'


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

import upload from './middlewares/upload.js'

//app.post('/create', upload, UserController.updateProfilePhoto)

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use('/profile_photo', express.static(join(__dirname, 'storage', 'profile_photo')));
app.use('/greenpoint_photo', express.static(join(__dirname, 'storage', 'greenpoint_photo')));



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})

