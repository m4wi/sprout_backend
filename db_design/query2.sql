-- Opción 1: Consulta directa usando subqueries (más limpio y evita duplicados por JOINs)
SELECT g.*,
    -- Subquery para obtener categorías como JSON
    (
        SELECT COALESCE(
                JSON_AGG(
                    json_build_object(
                        'id', c.id_category, 'name', c.name
                    )
                ), '[]'
            )
        FROM
            greenpoints_categories gc
            JOIN categories c ON gc.id_category = c.id_category
        WHERE
            gc.id_greenpoint = g.id_greenpoint
    ) AS categories,
    -- Subquery para obtener materiales como JSON
    (
        SELECT COALESCE(
                JSON_AGG(
                    json_build_object(
                        'id', gm.id_greenpoint_material, 'quantity', gm.quantity, 'unit', gm.unit, 'description', gm.description
                    )
                ), '[]'
            )
        FROM greenpoint_material gm
        WHERE
            gm.id_greenpoint = g.id_greenpoint
    ) AS materials
FROM greenpoints g
WHERE
    g.id_citizen = 1;

-- Opción 2: Crear una VISTA (VIEW) para tener esto siempre disponible
-- Esto permite hacer "SELECT * FROM view_greenpoints_details WHERE id_citizen = 1;"
CREATE OR REPLACE VIEW view_greenpoints_details AS
SELECT
    g.*,
    (
        SELECT COALESCE(
                JSON_AGG(
                    json_build_object(
                        'id', c.id_category, 'name', c.name, 'color', c.color_hex
                    )
                ), '[]'
            )
        FROM
            greenpoints_categories gc
            JOIN categories c ON gc.id_category = c.id_category
        WHERE
            gc.id_greenpoint = g.id_greenpoint
    ) AS categories,
    (
        SELECT COALESCE(
                JSON_AGG(
                    json_build_object(
                        'id', gm.id_greenpoint_material, 'quantity', gm.quantity, 'unit', gm.unit, 'description', gm.description
                    )
                ), '[]'
            )
        FROM greenpoint_material gm
        WHERE
            gm.id_greenpoint = g.id_greenpoint
    ) AS materials,
    -- Subquery para obtener fotos como JSON
    (
        SELECT COALESCE(
                JSON_AGG(
                    json_build_object(
                        'id', p.id_greenpoint_image, 'url', p.image_url
                    )
                ), '[]'
            )
        FROM greenpoint_images p
        WHERE
            p.id_greenpoint = g.id_greenpoint
    ) AS photos
FROM greenpoints g;

SELECT * FROM view_greenpoints_details WHERE id_greenpoint = 12;

-- [{"id" : 16, "quantity" : 9.300, "unit" : "kg", "description" : "Vidrio de colores"}, {"id" : 17, "quantity" : 1.700, "unit" : "kg", "description" : "Plástico film"}, {"id" : 18, "quantity" : 18.000, "unit" : "unit", "description" : "Envases de shampoo"}]
-- [{"id" : 1, "name" : "Plástico"}, {"id" : 2, "name" : "Cartón"}, {"id" : 3, "name" : "Metal"}, {"id" : 4, "name" : "Vidrio"}, {"id" : 5, "name" : "Papel"}]
-- [{"id" : 2, "url" : "123.webp"}, {"id" : 3, "url" : "124.webp"}, {"id" : 4, "url" : "125.webp"}, {"id" : 5, "url" : "126.webp"}]
-- [{"id" : 1, "url" : "c08197ec-cc4c-467d-a005-eb45ebb4f58a.webp"}, {"id" : 6, "url" : "6ddc6738-c692-4eb1-b311-47aaefce8bbd.webp"}, {"id" : 7, "url" : "0d7913be-616f-41ad-8dbd-0eb34ca1447d.webp"}]
SELECT *
FROM greenpoints g
WHERE
    g.id_citizen = 1
    AND g.status IN ('reserved', 'terminated');

CREATE OR REPLACE FUNCTION notify_greenpoint_creation()
RETURNS TRIGGER AS $$
BEGIN
    -- Insertar notificación para el ciudadano que creó el greenpoint
    INSERT INTO notifications (
        id_user,
        message,
        type,
        reference_id,
        priority,
        created_at,
        updated_at
    ) VALUES (
        NEW.id_citizen,
        'Has registrado un nuevo greenpoint en ' || COALESCE(NEW.direction, 'ubicación') || '. Estado: ' || NEW.status,
        'greenpoint_created',
        NEW.id_greenpoint,
        CASE 
            WHEN NEW.status = 'urgent' THEN 3
            ELSE 1
        END,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    );
    
    -- Opcional: También notificar a administradores/recolectores
    -- (Aquí puedes agregar lógica adicional si necesitas notificar a otros usuarios)
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_after_greenpoint_insert
AFTER INSERT ON greenpoints
FOR EACH ROW
EXECUTE FUNCTION notify_greenpoint_creation();