import express from 'express'
import cors from 'cors';
import pool from './database/db.js'; // importa la conexión

import { Router } from 'express';
import { authenticateToken } from './middlewares/auth.js';
import userRoutes from './routes/user.routes.js'
import commentRoutes from './routes/greenpointComment.routes.js'
import reservationRoutes from './routes/greenpointReservation.routes.js'

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import jwt from "jsonwebtoken";
const SECRET_KEY = "ingweb1"; // mejor usar .env


const app = express();
app.use(cors({
  origin: "*",     // cualquiera
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type, Authorization"
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Opcional si envías forms

app.get("/", (req, res) => {
  res.send("Hello desde backend")
})



// 🧩 Registro de usuario
/* app.post("/api/usuarios", async (req, res) => {
  const { username, password, tipo } = req.body;
  if (!username || !password || !tipo) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  try {
    const existe = await pool.query("SELECT * FROM usuarios WHERE username=$1", [username]);
    if (existe.rows.length > 0) {
      return res.status(409).json({ error: "El usuario ya existe" });
    }

    const result = await pool.query(
      "INSERT INTO usuarios (username, password, tipo) VALUES ($1, $2, $3) RETURNING *",
      [username, password, tipo]
    );

    const user = result.rows[0];

    // ✅ Crear token JWT
    const token = jwt.sign(
      { id: user.id_usuario, username: user.username, tipo: user.tipo },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      mensaje: "Usuario registrado correctamente",
      usuario: user,
      token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al registrar usuario" });
  }
}); */


// 🔐 Login de usuario
/* app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  try {
    console.log({ username, password })
    const result = await pool.query("SELECT * FROM usuarios WHERE username=$1 AND password=$2", [
      username,
      password,
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }
    const user = result.rows[0];

    // ✅ Crear token JWT
    const token = jwt.sign(
      { id: user.id_usuario, username: user.username, tipo: user.tipo },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.json({
      mensaje: "Inicio de sesión exitoso",
      usuario: { id: user.id_usuario, username: user.username, tipo: user.tipo },
      token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
}); */




// Endpoint para guardar un GreenPoint
/* app.post("/greenpoints", async (req, res) => {
  const { name, coord, materials, descripcion } = req.body;

  // Extraer token del header
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "No autorizado" });

  const token = authHeader.split(" ")[1]; // "Bearer <token>"
  let userId;
  try {
    const payload = jwt.verify(token, SECRET_KEY); // la misma que usaste al crear el token
    userId = payload.id;
  } catch (err) {
    return res.status(401).json({ error: "Token inválido" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Insertar GreenPoint
    const insertGPText = `
      INSERT INTO greenpoints (coordenada, descripcion, id_ciudadano)
      VALUES (POINT($1, $2), $3, $4)
      RETURNING id_greenpoint
    `;
    const result = await client.query(insertGPText, [
      coord[0],
      coord[1],
      descripcion || "",
      userId,
    ]);
    const greenpointId = result.rows[0].id_greenpoint;

    // Insertar materiales asociados
    for (const mat of materials) {
      const insertMatText = `
        INSERT INTO greenpoint_materiales (id_greenpoint, id_material, cantidad, descripcion_extra)
        VALUES ($1, $2, $3, $4)
      `;
      await client.query(insertMatText, [
        greenpointId,
        mat.id,
        mat.cantidad,
        mat.nombre
      ]);
    }

    await client.query("COMMIT");
    res.json({ success: true, greenpointId });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "No se pudo guardar el GreenPoint" });
  } finally {
    client.release();
  }
}); */



// GET /greenpoints - Devuelve todos los GreenPoints sin materiales
/* app.get("/greenpoints", async (req, res) => {
  const client = await pool.connect();
  try {
    const query = `
    SELECT 
        id_greenpoint,
        coordenada[0] AS lat,
        coordenada[1] AS lng,
        descripcion,
        id_ciudadano,
        id_recolector,
        estado
    FROM greenpoints
    WHERE estado IN ('pendiente', 'en_proceso')
    ORDER BY fecha_publicacion DESC;
    `;
    const result = await client.query(query);

    const greenpoints = result.rows.map(gp => ({
      id: gp.id_greenpoint,
      coord: [parseFloat(gp.lat), parseFloat(gp.lng)],
      descripcion: gp.descripcion,
      estado: gp.estado,
      ciudadano: gp.id_ciudadano
    }));

    res.json(greenpoints);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudieron obtener los GreenPoints" });
  } finally {
    client.release();
  }
});
 */


// app.get("/greenpoints/mine", authenticateToken, async (req, res) => {
//   const client = await pool.connect();
//   try {
//     const query = `
//       SELECT 
//         g.id_greenpoint,
//         g.coordenada as coord, 
//         g.descripcion,
//         g.estado,
//         g.fecha_publicacion,
//         COALESCE(
//             json_agg(
//                 json_build_object(
//                     'id', m.id_material,
//                     'nombre', m.nombre,
//                     'cantidad', gm.cantidad,
//                     'descripcion_extra', gm.descripcion_extra
//                 )
//             ) FILTER (WHERE m.id_material IS NOT NULL), '[]'
//         ) AS materials
//       FROM greenpoints g
//       LEFT JOIN greenpoint_materiales gm ON g.id_greenpoint = gm.id_greenpoint
//       LEFT JOIN materiales m ON gm.id_material = m.id_material
//       WHERE g.id_ciudadano = $1
//       GROUP BY g.id_greenpoint
//       ORDER BY g.fecha_publicacion DESC;
//     `;

//     const result = await client.query(query, [req.userId]);
//     res.json(result.rows);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "No se pudieron obtener tus GreenPoints" });
//   } finally {
//     client.release();
//   }
// });

// DELETE GreenPoint propio
/* app.delete("/greenpoints/:id", authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    const query = `
      DELETE FROM greenpoints
      WHERE id_greenpoint = $1 AND id_ciudadano = $2
      RETURNING *
    `;
    const result = await client.query(query, [id, req.userId]);

    if (result.rowCount === 0) return res.status(404).json({ error: "GreenPoint no encontrado o no autorizado" });

    res.json({ message: "GreenPoint eliminado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudo eliminar el GreenPoint" });
  } finally {
    client.release();
  }
});
 */
/* app.patch("/greenpoints/:id", authenticateToken, async (req, res) => {
  const client = await pool.connect();
  const { id } = req.params;
  const { descripcion, coord, materials } = req.body; // ahora también recibimos coord

  try {
    // Verificar que el GreenPoint pertenece al usuario
    const check = await client.query(
      "SELECT * FROM greenpoints WHERE id_greenpoint = $1 AND id_ciudadano = $2",
      [id, req.userId]
    );
    if (check.rowCount === 0) {
      return res.status(403).json({ error: "No puedes editar este GreenPoint" });
    }

    // Actualizar descripción si viene
    if (descripcion !== undefined) {
      await client.query(
        "UPDATE greenpoints SET descripcion = $1 WHERE id_greenpoint = $2",
        [descripcion, id]
      );
    }

    // Actualizar coordenadas si vienen
    if (coord && Array.isArray(coord) && coord.length === 2) {
      // coord = [lat, lng]
      await client.query(
        "UPDATE greenpoints SET coordenada = POINT($1, $2) WHERE id_greenpoint = $3",
        [coord[0], coord[1], id]
      );
    }

    // Actualizar materiales si vienen
    if (materials && Array.isArray(materials)) {
      for (let m of materials) {
        if (m.id_greenpoint_material) {
          // Actualizar un material existente
          await client.query(
            "UPDATE greenpoint_materiales SET cantidad = $1, descripcion_extra = $2 WHERE id_greenpoint_material = $3 AND id_greenpoint = $4",
            [m.cantidad, m.descripcion_extra || null, m.id_greenpoint_material, id]
          );
        } else if (m.id) {
          // Agregar nuevo material
          await client.query(
            "INSERT INTO greenpoint_materiales (id_greenpoint, id_material, cantidad, descripcion_extra) VALUES ($1, $2, $3, $4)",
            [id, m.id, m.cantidad, m.descripcion_extra || null]
          );
        }
      }
    }

    res.json({ message: "GreenPoint actualizado correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error actualizando GreenPoint" });
  } finally {
    client.release();
  }
}); */





// app.patch('/greenpoints/:id/estado', authenticateToken, async (req, res) => {
//   const { id } = req.params;
//   const { estado } = req.body;
//   const usuarioId = req.userId; // viene del middleware de JWT

//   if (!['pendiente', 'en_proceso', 'finalizado'].includes(estado)) {
//     return res.status(400).json({ error: 'Estado inválido' });
//   }

//   try {
//     // Solo se permite cambiar si el GreenPoint pertenece al usuario
//     const result = await pool.query(
//       `UPDATE greenpoints 
//        SET estado = $1 
//        WHERE id_greenpoint = $2
//        RETURNING *`,
//       [estado, id]
//     );

//     if (result.rowCount === 0) {
//       return res.status(404).json({ error: 'GreenPoint no encontrado o no autorizado' });
//     }

//     res.json({ message: 'Estado actualizado', greenpoint: result.rows[0] });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Error del servidor' });
//   }
// });






/* app.patch('/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  const { username, password, tipo, correo } = req.body;

  try {
    const db = await pool.connect(); // o Database.getConnection() si usas tu clase
    const fields = [];
    const values = [];
    let index = 1;

    // ✅ Construimos dinámicamente solo los campos que vienen en el body
    if (username) {
      fields.push(`username = $${index++}`);
      values.push(username);
    }
    if (password) {
      fields.push(`password = $${index++}`);
      values.push(password);
    }
    if (tipo) {
      fields.push(`tipo = $${index++}`);
      values.push(password);
    }
    if (correo) {
      fields.push(`correo = $${index++}`);
      values.push(correo);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No se enviaron campos para actualizar.' });
    }

    values.push(id);

    const query = `
      UPDATE usuarios 
      SET ${fields.join(', ')}
      WHERE id_usuario = $${index}
      RETURNING *;
    `;

    const result = await db.query(query, values);
    db.release();

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});
 */


// PATCH /greenpoints/:id/recolector
// app.patch('/greenpoints/:id/recolector', async (req, res) => {
//   const { id } = req.params; // ID del greenpoint
//   const { id_recolector } = req.body; // Nuevo ID del recolector

//   if (!id_recolector) {
//     return res.status(400).json({ error: "El campo id_recolector es obligatorio." });
//   }

//   try {
//     const db = await pool.connect();

//     const query = `
//       UPDATE greenpoints 
//       SET id_recolector = $1,
//           estado = 'en_proceso' 
//       WHERE id_greenpoint = $2
//       RETURNING *;
//     `;

//     const result = await db.query(query, [id_recolector, id]);

//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: "Greenpoint no encontrado." });
//     }

//     res.json({
//       message: "Recolector asignado correctamente.",
//       greenpoint: result.rows[0]
//     });
//   } catch (error) {
//     console.error("Error actualizando id_recolector:", error);
//     res.status(500).json({ error: "Error interno del servidor." });
//   }
// });



const router = Router();
app.use('/users', userRoutes);
app.use('/api', commentRoutes);
app.use('/api', reservationRoutes);


import upload  from './middlewares/upload.js'
import { GreenPointController } from './controllers/greenpoint.controller.js';
import { AuthController } from './controllers/auth.controller.js';
//app.post('/create', upload, UserController.updateProfilePhoto)


// ✅ Obtén __dirname correctamente en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use('/profile_photo', express.static(join(__dirname, 'storage', 'profile_photo')));

app.post('/auth/login', AuthController.login )

const PORT = 3000
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})

