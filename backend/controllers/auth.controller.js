import { UserModel } from "../models/user.model.js";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.SECRET_KEY;
if (!SECRET_KEY) {
  throw new Error('SECRET_KEY no está definida en las variables de entorno');
}

export class AuthController {
    static async login(req, res) {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Faltan datos: email y password' });
        }
        try {

            const user = await UserModel.findByCredentials(email, password);
            console.log(user);
            if (!user) {
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }

            const token = jwt.sign(
                { 
                    id: user.id_user,
                    tipo: user.user_type
                },
                SECRET_KEY,
                { expiresIn: "1h" }
            );

            res.json({
                message: 'Inicio de sesión exitoso',
                user: user,
                token
            });
        } catch (error) {
            res.status(500).json({ error: 'Error al iniciar sesión' });
        }

    }
}