import { Category } from '../models/category.model.js';
import pool from '../database/db.js';

export class CategoryController {
    static async getAllCategories(req, res) {
        try {
            // Admin might want to see all, including non-recyclable if that's a thing?
            // Existing model has getAll filtering by recyclable=true.
            // Let's use a new query for admin or reuse existing if fine.
            // For admin, let's see everything.
            const result = await pool.query('SELECT * FROM categories ORDER BY name');
            res.json(result.rows);
        } catch (error) {
            console.error('Error getting categories:', error);
            res.status(500).json({ error: 'Error al obtener categorías' });
        }
    }

    static async createCategory(req, res) {
        try {
            const { name, description, icon_url, color_hex } = req.body;
            if (!name) return res.status(400).json({ error: 'Nombre es requerido' });

            const result = await pool.query(
                `INSERT INTO categories (name, description, icon_url, color_hex) 
                 VALUES ($1, $2, $3, $4) RETURNING *`,
                [name, description, icon_url, color_hex]
            );
            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Error creating category:', error);
            res.status(500).json({ error: 'Error al crear categoría' });
        }
    }

    static async updateCategory(req, res) {
        try {
            const { id } = req.params;
            const { name, description, icon_url, color_hex } = req.body;

            const result = await pool.query(
                `UPDATE categories 
                 SET name = COALESCE($1, name), 
                     description = COALESCE($2, description),
                     icon_url = COALESCE($3, icon_url),
                     color_hex = COALESCE($4, color_hex)
                 WHERE id_category = $5 RETURNING *`,
                [name, description, icon_url, color_hex, id]
            );

            if (result.rows.length === 0) return res.status(404).json({ error: 'Categoría no encontrada' });
            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error updating category:', error);
            res.status(500).json({ error: 'Error al actualizar categoría' });
        }
    }

    static async deleteCategory(req, res) {
        try {
            const { id } = req.params;
            // Check if used? Maybe soft delete?
            // For now hard delete.
            const result = await pool.query('DELETE FROM categories WHERE id_category = $1 RETURNING *', [id]);
            if (result.rows.length === 0) return res.status(404).json({ error: 'Categoría no encontrada' });
            res.json({ message: 'Categoría eliminada' });
        } catch (error) {
            console.error('Error deleting category:', error);
            res.status(500).json({ error: 'Error al eliminar categoría' });
        }
    }
}
