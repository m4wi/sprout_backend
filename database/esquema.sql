-- Active: 1758927386793@@127.0.0.1@5432@rygreen@public
DROP DATABASE IF EXISTS rygreen;
CREATE DATABASE  rygreen;


-- Habilitar extensión espacial
-- CREATE EXTENSION IF NOT EXISTS postgis;

-- Tabla de usuarios
DROP TABLE IF EXISTS usuarios;
CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    tipo VARCHAR(20) CHECK (tipo IN ('ciudadano', 'recolector', 'centro')),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE usuarios
ADD COLUMN correo VARCHAR(100) UNIQUE;

-- Tabla de materiales
DROP TABLE IF EXISTS materiales;
CREATE TABLE materiales (
    id_material SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(50),
    descripcion TEXT
);

-- Tabla de puntos de recolección (GreenPoints)
DROP TABLE IF EXISTS greenpoints;
CREATE TABLE greenpoints (
    id_greenpoint SERIAL PRIMARY KEY,
    coordenada POINT, -- usa lat/long
    descripcion TEXT,
    qr_code VARCHAR(255),
    id_ciudadano INT NOT NULL REFERENCES usuarios(id_usuario),
    id_recolector INT REFERENCES usuarios(id_usuario),
    fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) CHECK (estado IN ('pendiente', 'en_proceso', 'finalizado')) DEFAULT 'pendiente'
);

UPDATE greenpoints SET id_recolector = NULL WHERE id_greenpoint = 8;

-- Tabla intermedia GreenPoint-Materiales
DROP TABLE IF EXISTS greenpoint_materiales;
CREATE TABLE greenpoint_materiales (
    id_greenpoint_material SERIAL PRIMARY KEY,
    id_greenpoint INT NOT NULL REFERENCES greenpoints(id_greenpoint) ON DELETE CASCADE,
    id_material INT NOT NULL REFERENCES materiales(id_material),
    cantidad VARCHAR(50),
    descripcion_extra TEXT
);


INSERT INTO materiales (nombre, tipo, descripcion) VALUES
('Plástico', 'Plástico', 'Botellas, envases, bolsas.'),
('Vidrio', 'Vidrio', 'Botellas, frascos.'),
('Papel', 'Papel', 'Hojas, periódicos, cuadernos.'),
('Cartón', 'Cartón', 'Cajas, embalajes.'),
('Aluminio', 'Metal', 'Latas de bebidas y alimentos.'),
('Hierro', 'Metal', 'Clavos, herramientas, chatarra.'),
('Cobre', 'Metal', 'Cables eléctricos, tuberías.'),
('Orgánico', 'Orgánico', 'Restos de comida, cáscaras, hojas.'),
('Textiles', 'Textil', 'Ropa, telas.'),
('Electrónicos', 'E-Waste', 'Celulares, computadoras, cargadores.');


INSERT INTO usuarios (username, password, tipo) VALUES
('juanperez', '1234seguro', 'ciudadano'),
('mariagonzales', 'clave5678', 'ciudadano'),
('recolector1', 'rec0pass!', 'recolector'),
('recolector2', 'passReco22', 'recolector'),
('centroverde', 'centro2025', 'centro'),
('eco_tacna', 'tacnaeco', 'centro');


SELECT * FROM usuarios;

SELECT * FROM materiales;

SELECT * FROM greenpoints;


SELECT 
    g.id_greenpoint,
    g.coordenada,
    g.descripcion,
    g.estado,
    COALESCE(
        json_agg(
            json_build_object(
                'id', m.id_material,
                'nombre', m.nombre,
                'cantidad', gm.cantidad,
                'descripcion_extra', gm.descripcion_extra
            )
        ) FILTER (WHERE m.id_material IS NOT NULL), '[]'
    ) AS materials
FROM greenpoints g
LEFT JOIN greenpoint_materiales gm ON g.id_greenpoint = gm.id_greenpoint
LEFT JOIN materiales m ON gm.id_material = m.id_material
WHERE g.id_ciudadano = 1
GROUP BY g.id_greenpoint
ORDER BY g.fecha_publicacion DESC;
