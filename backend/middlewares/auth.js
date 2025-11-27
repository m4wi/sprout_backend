import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.SECRET_KEY;
if (!SECRET_KEY) {
  throw new Error('SECRET_KEY no está definida en las variables de entorno');
}

/**
 * Middleware para verificar si el usuario está autenticado mediante JWT
 * Verifica el token JWT en el header Authorization y agrega la información del usuario al request
 * 
 * Uso: app.get('/ruta', authenticateToken, (req, res) => { ... })
 * 
 * El middleware agrega al request:
 * - req.userId: ID del usuario
 * - req.user: Objeto completo con información del usuario (id, username, tipo)
 */
export function authenticateToken(req, res, next) {
  // Obtener el token del header Authorization
  const authHeader = req.headers['authorization'];
  
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"
  // Si no hay token, retornar error 401 (No autorizado)
  if (!token) {
    return res.status(401).json({ 
      error: "Token requerido",
      message: "Debes proporcionar un token de autenticación en el header Authorization"
    });
  }

  // Verificar el token JWT
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    // Si hay error al verificar el token (expirado, inválido, etc.)
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          error: "Token expirado",
          message: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente"
        });
      }
      if (err.name === 'JsonWebTokenError') {
        return res.status(403).json({ 
          error: "Token inválido",
          message: "El token proporcionado no es válido"
        });
      }
      return res.status(403).json({ 
        error: "Error al verificar token",
        message: err.message
      });
    }

    // Si el token es válido, agregar información del usuario al request
    req.userId = decoded.id; // ID del usuario
    req.user = {
      id: decoded.id,
      username: decoded.username,
      tipo: decoded.tipo
    };
    console.log(decoded, SECRET_KEY)
    // Continuar con el siguiente middleware o ruta
    next();
  });
}