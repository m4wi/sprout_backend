
import pool from '../database/db.js';

export class UserModel {


    static async findByCredentials(email, password_hash) {
        const result = await pool.query(
            'SELECT * FROM users WHERE email=$1 AND password_hash=$2',
            [ email, password_hash]);
        return result.rows[0] || null;
    }
    

    static async findById(id) {
        const result = await pool.query(
            'SELECT * FROM users WHERE id_user = $1',
        [id]
        );
        return result.rows[0] || null;
    }

    static async findByUsername(userName) {
        const result = await pool.query(
            'SELECT * FROM users WHERE username = $1',
        [userName]
        );
        return result.rows[0] || null;
    }


    static async create( userData ) {
        const {
            name,
            lastname,
            username,
            email,
            password_hash,
            phone,
            user_type
        } = userData;

        const result = await pool.query(
        `INSERT INTO users (name, lastname, username, email, password_hash, phone, user_type)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
        [name, lastname, username, email, password_hash, phone, user_type]
        );
        return result.rows[0];
    }

    static async update(id, filteredUpdates) {

        // Construir dinámicamente la cláusula SET
        const setClause = Object.keys(filteredUpdates)
        .map((key, i) => `"${key}" = $${i + 2}`)
        .join(', ');

        const values = [id, ...Object.values(filteredUpdates)];
        const query = `
        UPDATE users
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id_user = $1
        RETURNING *`;

        console.log(query);

        const result = await pool.query(query, values);

        return result.rows[0] || null;
    }
}