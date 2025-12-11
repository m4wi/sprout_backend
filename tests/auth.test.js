import request from 'supertest';
import app from '../app.js';

describe('Auth Endpoints', () => {
    // Nota: Estas pruebas dependen de la base de datos real.
    // Idealmente, deberíamos tener un usuario de prueba dedicado o mockear la DB,
    // pero para integración rápida usaremos credenciales que sabemos que podrían fallar 
    // o el flujo de error.

    it('should fail login with non-existent user', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({
                email: 'nonexistent@example.com',
                password: 'wrongpassword'
            });

        // Esperamos 401 o 404 dependiendo de la implementación. 
        // Revisando auth.controller, si no existe o pass mal -> 401 usualmente.
        // Ajustaremos según lo que devuelva el backend si falla.
        expect([400, 401, 404, 403]).toContain(res.statusCode);
    });

    it('should fail login with missing credentials', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({
                email: 'onlyemail@example.com'
            });

        expect(res.statusCode).toBeGreaterThanOrEqual(400);
    });

    it('should login successfully with valid credentials', async () => {
        const uniqueId = Date.now();
        const userData = {
            name: 'Auth',
            lastname: 'Test',
            username: `authtest_${uniqueId}`,
            email: `authtest_${uniqueId}@example.com`,
            password_hash: 'password123', // Raw password for login
            phone: '1234567890',
            user_type: 'recolector'
        };

        const createRes = await request(app).post('/users/create').send(userData);
        expect(createRes.statusCode).toBe(201);

        const res = await request(app)
            .post('/auth/login')
            .send({
                email: userData.email,
                password: userData.password_hash
            });

        if (res.statusCode !== 200) {
            console.error('Login failed:', res.body);
        }
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
    });
});
