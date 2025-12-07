export function isAdmin(req, res, next) {
    if (!req.user || req.user.tipo !== 'admin') {
        return res.status(403).json({
            error: "Acceso denegado",
            message: "Se requieren privilegios de administrador para realizar esta acción"
        });
    }
    next();
}
