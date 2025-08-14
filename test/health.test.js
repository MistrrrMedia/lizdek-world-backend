const request = require('supertest');
const { expect } = require('chai');
const app = require('../server');

describe('Health Endpoint', () => {
    describe('GET /api/health', () => {
        it('should return 200 with health status', async () => {
            const res = await request(app)
                .get('/api/health');
            
            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('status');
            expect(res.body).to.have.property('timestamp');
            expect(res.body).to.have.property('version');
            expect(res.body).to.have.property('database');
            expect(res.body).to.have.property('environment');
            
            expect(res.body.status).to.be.a('string');
            expect(res.body.timestamp).to.be.a('string');
            expect(res.body.version).to.be.a('string');
            expect(res.body.database).to.be.a('string');
            expect(res.body.environment).to.be.a('string');
        });

        it('should return valid timestamp format', async () => {
            const res = await request(app)
                .get('/api/health');
            
            expect(res.status).to.equal(200);
            
            // Check if timestamp is valid ISO string
            const timestamp = new Date(res.body.timestamp);
            expect(timestamp.getTime()).to.not.be.NaN;
        });

        it('should return database status', async () => {
            const res = await request(app)
                .get('/api/health');
            
            expect(res.status).to.equal(200);
            expect(['connected', 'disconnected']).to.include(res.body.database);
        });

        it('should return environment status', async () => {
            const res = await request(app)
                .get('/api/health');
            
            expect(res.status).to.equal(200);
            expect(['development', 'production', 'test']).to.include(res.body.environment);
        });
    });
}); 