import request from 'supertest';
import app from '../app.js';

describe('User Endpoints', () => {
    let createdUserId;
    const uniqueId = Date.now();
    const testUser = {
        name: 'Test',
        lastname: 'User',
        username: `testuser_${uniqueId}`,
        email: `testuser_${uniqueId}@example.com`,
        password_hash: 'password123',
        phone: '1234567890',
        user_type: 'recolector'
    };

    test('POST /users/create should register a new user', async () => {
        const res = await request(app)
            .post('/users/create')
            .send(testUser);

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('usuario');
        expect(res.body.usuario).toHaveProperty('id_user');

        createdUserId = res.body.usuario.id_user;
    });

    test('GET /users/:id should return user profile', async () => {
        // Si la creación falló, este test fallará o saltará
        if (!createdUserId) {
            console.warn('Skipping GET user test because creation failed');
            return;
        }

        const res = await request(app).get(`/users/${createdUserId}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('username', testUser.username);
    });
});
