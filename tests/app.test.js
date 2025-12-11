import request from 'supertest';
import app from '../app.js';

describe('GET /', () => {
    it('should return 200 and a friendly message', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toEqual(200);
        expect(res.text).toContain('Hello desde backend');
    });
});
