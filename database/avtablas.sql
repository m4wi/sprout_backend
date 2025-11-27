-- Active: 1764120249245@@ep-fragrant-resonance-ac3k1ssp-pooler.sa-east-1.aws.neon.tech@5432@sprout

CREATE TABLE users (
    id_user SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    lastname VARCHAR(50) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- Clarified: should be a hash
    phone VARCHAR(15),
    user_type VARCHAR(20) NOT NULL,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    last_login TIMESTAMP WITHOUT TIME ZONE,
    avatar_url TEXT,
    profile_description TEXT,
    stars INT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE users ADD COLUMN direction TEXT;

CREATE TABLE greenpoint_chats (
    id_chat SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    id_greenpoint INTEGER NOT NULL UNIQUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users (id_user) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users (id_user) ON DELETE CASCADE,
    FOREIGN KEY (id_greenpoint) REFERENCES greenpoints (id_greenpoint) ON DELETE CASCADE
);

CREATE TABLE greenpoint_chat_messages (
    id_message SERIAL PRIMARY KEY,
    id_chat INTEGER NOT NULL,
    sender_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'sent' NOT NULL,
    FOREIGN KEY (id_chat) REFERENCES greenpoint_chats (id_chat) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users (id_user) ON DELETE CASCADE
)

CREATE TABLE greenpoints (
    id_greenpoint SERIAL PRIMARY KEY,
    id_category INTEGER NOT NULL, -- agregar otra tabla
    coordinates POINT,
    description TEXT,
    qr_code VARCHAR(255),
    stars INT,
    id_citizen INTEGER NOT NULL,
    id_collector INTEGER,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- publication_date
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- publication_date
    status VARCHAR(20) DEFAULT 'pending' NOT NULL,
    FOREIGN KEY (id_citizen) REFERENCES users (id_user) ON DELETE CASCADE,
    FOREIGN KEY (id_collector) REFERENCES users (id_user) ON DELETE CASCADE
)

ALTER TABLE greenpoints ADD COLUMN hour TEXT;

ALTER TABLE greenpoints ADD COLUMN direction TEXT;

CREATE TABLE greenpoint_material (
    id_greenpoint_material SERIAL PRIMARY KEY,
    id_greenpoint INTEGER NOT NULL,
    quantity NUMERIC(10, 3) NOT NULL,
    unit VARCHAR(10) NOT NULL DEFAULT 'unit',
    description TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
)

CREATE TABLE greenpoints_categories (
    id_greenpoint_category SERIAL PRIMARY KEY,
    id_greenpoint INTEGER NOT NULL,
    id_category INTEGER NOT NULL,
    CONSTRAINT uniq_greenpoint_category UNIQUE (id_greenpoint, id_category),
    FOREIGN KEY (id_greenpoint) REFERENCES greenpoints (id_greenpoint) ON DELETE CASCADE,
    FOREIGN KEY (id_category) REFERENCES categories (id_category) ON DELETE CASCADE
)

CREATE TABLE categories (
    id_category SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon_url TEXT,
    color_hex VARCHAR(7), -- Ej: #FF5733
    recyclable BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE direct_chats (
    id_chat SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users (id_user) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users (id_user) ON DELETE CASCADE
);

CREATE TABLE direct_chat_messages (
    id_message SERIAL PRIMARY KEY,
    id_chat INTEGER NOT NULL,
    sender_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'sent' NOT NULL,
    FOREIGN KEY (id_chat) REFERENCES direct_chats (id_chat) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users (id_user) ON DELETE CASCADE
);

CREATE TABLE greenpoints_report (
    id_report SERIAL PRIMARY KEY,
    id_user INTEGER NOT NULL,
    id_greenpoint INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'other',
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user) REFERENCES users (id_user) ON DELETE CASCADE,
    FOREIGN KEY (id_greenpoint) REFERENCES greenpoints (id_greenpoint) ON DELETE CASCADE
);

CREATE TABLE notifications (
    id_notification SERIAL PRIMARY KEY,
    id_user INTEGER NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'info',
    reference_id INTEGER,
    is_read BOOLEAN DEFAULT FALSE,
    priority INTEGER DEFAULT 0 CHECK (priority BETWEEN 0 AND 5),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user) REFERENCES users (id_user) ON DELETE CASCADE
);

CREATE TABLE greenpoint_comments (
    id_comment SERIAL PRIMARY KEY,
    id_greenpoint INTEGER NOT NULL,
    id_user INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Claves foráneas
    FOREIGN KEY (id_greenpoint) REFERENCES greenpoints (id_greenpoint) ON DELETE CASCADE,
    FOREIGN KEY (id_user) REFERENCES users (id_user) ON DELETE CASCADE
);

CREATE TABLE photos (
    id_photo SERIAL PRIMARY KEY,
    id_greenpoint INTEGER NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_greenpoint) REFERENCES greenpoints (id_greenpoint) ON DELETE CASCADE
);

CREATE TABLE greenpoint_reservations (
    id_reservation SERIAL PRIMARY KEY,
    id_greenpoint INTEGER NOT NULL,
    id_collector INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' NOT NULL CHECK (
        status IN (
            'pending',
            'accepted',
            'rejected',
            'cancelled'
        )
    ),
    message TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_greenpoint) REFERENCES greenpoints (id_greenpoint) ON DELETE CASCADE,
    FOREIGN KEY (id_collector) REFERENCES users (id_user) ON DELETE CASCADE
);

-- Evitar múltiples reservas pendientes del mismo recolector en el mismo greenpoint
CREATE UNIQUE INDEX unique_pending_greenpoint_collector ON greenpoint_reservations (id_greenpoint, id_collector)
WHERE
    status = 'pending';

-- Índice para búsquedas rápidas por greenpoint y estado
CREATE INDEX idx_greenpoint_reservations_greenpoint_status ON greenpoint_reservations (id_greenpoint, status);

CREATE INDEX idx_greenpoint_reservations_collector ON greenpoint_reservations (id_collector);

# crear una tabla comentarios de muchos a muchos con greenpoints

ALTER TABLE greenpoints 
ADD COLUMN longitude NUMERIC(10, 6),
ADD COLUMN latitude NUMERIC(10, 6);