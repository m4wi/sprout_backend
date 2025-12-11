import request from 'supertest';
import app from '../app.js';

describe('Greenpoint Endpoints', () => {
    let authToken;
    let userId;
    let greenpointId;
    const uniqueId = Date.now();

    // Setup: Create user and login
    beforeAll(async () => {
        const userData = {
            name: 'GP',
            lastname: 'Owner',
            username: `gpowner_${uniqueId}`,
            email: `gpowner_${uniqueId}@example.com`,
            password_hash: 'password123',
            phone: '1234567890',
            user_type: 'recolector'
        };

        const createRes = await request(app).post('/users/create').send(userData);

        // Si falla la creación, no podremos hacer login
        if (createRes.statusCode !== 201) {
            console.error('Setup User Creation Failed:', createRes.body);
        }
        userId = createRes.body.usuario.id_user;

        const loginRes = await request(app).post('/auth/login').send({
            email: userData.email,
            password: userData.password_hash
        });

        if (loginRes.statusCode !== 200) {
            console.error('Setup Login Failed:', loginRes.body);
        }
        authToken = loginRes.body.token;
    });

    test('GET /greenpoints should return a list of greenpoints', async () => {
        const res = await request(app).get('/greenpoints');
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
    });

    test('POST /greenpoints should create a new greenpoint', async () => {
        const newPoint = {
            id_category: 1,
            coordinates: { longitude: -70.25, latitude: -18.01 },
            description: 'Punto de prueba integración',
            qr_code: `qr-${uniqueId}`,
            stars: 5,
            id_citizen: userId,
            hour: '10:00 AM',
            direction: 'Calle Prueba 123',
            date_collect: '2025-12-31'
        };

        const res = await request(app)
            .post('/greenpoints')
            .send(newPoint);

        if (res.statusCode !== 201) {
            console.error('Greenpoint creation failed:', res.body);
        }
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('id_greenpoint');
        greenpointId = res.body.id_greenpoint;
    });

    test('GET /greenpoints/:id should return the created greenpoint', async () => {
        if (!greenpointId) return;
        const res = await request(app).get(`/greenpoints/${greenpointId}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('description', 'Punto de prueba integración');
    });

    test('PATCH /greenpoints/:id should update the greenpoint', async () => {
        if (!greenpointId) return;

        // OJO: La ruta PATCH requiere token
        const res = await request(app)
            .patch(`/greenpoints/${greenpointId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                description: 'Descripción actualizada'
            });

        if (res.statusCode !== 200) {
            console.error('Update failed:', res.body);
        }
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('description', 'Descripción actualizada');
    });

    test('DELETE /greenpoints/:id should delete the greenpoint', async () => {
        if (!greenpointId) return;

        const res = await request(app)
            .delete(`/greenpoints/${greenpointId}`)
            // Probamos enviando token por si acaso, aunque la ruta no tenga middleware explícito en la def,
            // el controller podría estar validando req.user que depende de un middleware (que igual faltaría).
            // Si falta el middleware, esto fallará de alguna forma, pero el test nos lo dirá.
            .set('Authorization', `Bearer ${authToken}`);

        if (res.statusCode !== 200) {
            console.log('Delete status:', res.statusCode, res.body);
        }
        // Aceptamos 200 (OK) o 204 (No Content)
        expect(res.statusCode).toEqual(200);
    });
});
