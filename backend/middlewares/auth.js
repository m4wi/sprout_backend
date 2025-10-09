import jwt from 'jsonwebtoken';
const SECRET_KEY = "ingweb1"; // mejor usar .env


export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

  if (!token) return res.status(401).json({ error: "Token requerido" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: "Token inválido" });
    req.userId = user.id; // asumimos que el payload del token tiene id_usuario
    next();
  });
}