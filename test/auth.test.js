const request = require('supertest');
const { expect } = require('chai');
const app = require('../server');

describe('Auth Endpoints', () => {
    describe('POST /api/auth/login', () => {
        it('should return 400 for missing username', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ password: 'password123' });
            
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('error');
            expect(res.body.error).to.include('Username is required');
        });

        it('should return 400 for missing password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ username: 'admin' });
            
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('error');
            expect(res.body.error).to.include('Password is required');
        });

        it('should return 400 for empty username', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ username: '', password: 'password123' });
            
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('error');
            expect(res.body.error).to.include('Username is required');
        });

        it('should return 400 for empty password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ username: 'admin', password: '' });
            
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('error');
            expect(res.body.error).to.include('Password is required');
        });

        it('should return 400 for username too long', async () => {
            const longUsername = 'a'.repeat(51);
            const res = await request(app)
                .post('/api/auth/login')
                .send({ username: longUsername, password: 'password123' });
            
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('error');
            expect(res.body.error).to.include('Username must be 50 characters or less');
        });

        it('should return 400 for password too short', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ username: 'admin', password: '123' });
            
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('error');
            expect(res.body.error).to.include('Password must be at least 6 characters long');
        });

        it('should return 400 for non-string username', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ username: 123, password: 'password123' });
            
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('error');
            expect(res.body.error).to.include('Username is required');
        });

        it('should return 400 for non-string password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ username: 'admin', password: 123 });
            
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('error');
            expect(res.body.error).to.include('Password is required');
        });
    });

    describe('GET /api/auth/verify', () => {
        it('should return 401 for missing token', async () => {
            const res = await request(app)
                .get('/api/auth/verify');
            
            expect(res.status).to.equal(401);
            expect(res.body).to.have.property('error');
            expect(res.body.error).to.include('No token provided');
        });

        it('should return 401 for invalid token format', async () => {
            const res = await request(app)
                .get('/api/auth/verify')
                .set('Authorization', 'InvalidToken');
            
            expect(res.status).to.equal(401);
            expect(res.body).to.have.property('error');
            expect(res.body.error).to.include('No token provided');
        });
    });
}); 