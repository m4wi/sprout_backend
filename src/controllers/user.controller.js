import { UserModel } from '../models/user.model.js'
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.SECRET_KEY;
if (!SECRET_KEY) {
    throw new Error('SECRET_KEY no está definida en las variables de entorno');
}


export class UserController {
    static async getUserProfile(req, res) {
        try {
            const { id } = req.params;
            const user = await UserModel.findById(id); // ← await aquí
            if (!user) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            const { password_hash, ...safeUser } = user;
            res.json(safeUser);
        } catch (err) {
            console.error('Error al obtener el perfil:', err);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    static async createUser(req, res) {

        const { username, password_hash, user_type } = req.body;

        if (!username || !password_hash || !user_type) {
            res.status(400).json({ error: "Faltan datos obligatorios" });
        }

        try {
            const userExists = await UserModel.findByUsername(username);
            console.log(req.body)
            if (userExists) {
                res.status(409).json({ error: "El usuario ya existe" });
            }

            const createdUser = await UserModel.create(req.body);

            const token = jwt.sign(
                { id: createdUser.id_usuario, username: createdUser.username, tipo: createdUser.user_type },
                SECRET_KEY,
                { expiresIn: "1h" }
            );

            res.status(201).json({
                mensaje: "Usuario registrado correctamente",
                usuario: createdUser,
                token
            });

        } catch (err) {
            res.status(500).json({ error: "Error al registrar usuario" });
        }
    }

    static async updateUser(req, res) {
        const { id } = req.params;
        const updates = req.body;
        // Lista de campos que el cliente puede actualizar (¡protege campos sensibles!)
        const allowedFields = [
            'name', 'lastname', 'phone', 'avatar_url', 'profile_description', "email", "user_type", "username", "direction"
        ];

        // Filtrar solo campos permitidos y que estén presentes
        const filteredUpdates = {};
        for (const field of allowedFields) {
            if (updates[field] !== undefined) {
                filteredUpdates[field] = updates[field];
            }
        }
        if (Object.keys(filteredUpdates).length === 0) {
            return null; // Nada que actualizar
        }

        try {
            const updatedUser = await UserModel.update(id, filteredUpdates);

            if (!updatedUser) {
                res.status(404).json({ error: 'Usuario no encontrado' });
            }
            res.json(updatedUser);
        } catch (error) {
            res.status(500).json({ error: 'Error al actualizar usuario' });
        }
    }


    static async updateProfilePhoto(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No se proporcionó ninguna imagen' });
            }

            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ error: 'ID de usuario no proporcionado' });
            }

            // Guardamos el nombre del archivo completo (con extensión)
            const filename = req.file.filename;

            const updatedUser = await UserModel.update(id, { avatar_url: filename });

            if (!updatedUser) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            res.json({
                message: 'Avatar actualizado',
                avatar_url: filename
            });
        } catch (err) {
            console.error('Error al subir avatar:', err);
            res.status(500).json({ error: 'Error al subir la imagen' });
        }
    };


    static async getAllUsers(req, res) {
        try {
            const users = await UserModel.findAll();
            res.json(users);
        } catch (err) {
            console.error('Error al obtener usuarios:', err);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    static async toggleUserStatus(req, res) {
        try {
            const { id } = req.params;
            const { active } = req.body; // Expecting boolean

            if (typeof active !== 'boolean') {
                return res.status(400).json({ error: 'El estado debe ser un booleano' });
            }

            const updatedUser = await UserModel.updateStatus(id, active);

            if (!updatedUser) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            res.json(updatedUser);
        } catch (err) {
            console.error('Error al cambiar estado del usuario:', err);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
}

export const userProfile = async (req, res) => {
    res.json({ message: 'Perfil del usuario' });
}