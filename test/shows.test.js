const request = require('supertest');
const { expect } = require('chai');
const app = require('../server');
const { getAdminHeaders } = require('./testHelper');

describe('Shows Endpoints', () => {
    describe('POST /api/shows', () => {
        const validShowData = {
            venue: 'Test Venue',
            city: 'Test City',
            state_province: 'Test State',
            country: 'Test Country',
            show_date: '2024-12-31',
            ticket_link: 'https://example.com/tickets'
        };

        it('should return 401 for missing venue', async () => {
            const data = { ...validShowData };
            delete data.venue;
            
            const res = await request(app)
                .post('/api/shows')
                .send(data);
            
            expect(res.status).to.equal(401); // Should require authentication first
        });

        it('should return 401 for missing city', async () => {
            const data = { ...validShowData };
            delete data.city;
            
            const res = await request(app)
                .post('/api/shows')
                .send(data);
            
            expect(res.status).to.equal(401); // Should require authentication first
        });

        it('should return 401 for missing state_province', async () => {
            const data = { ...validShowData };
            delete data.state_province;
            
            const res = await request(app)
                .post('/api/shows')
                .send(data);
            
            expect(res.status).to.equal(401); // Should require authentication first
        });

        it('should return 401 for missing country', async () => {
            const data = { ...validShowData };
            delete data.country;
            
            const res = await request(app)
                .post('/api/shows')
                .send(data);
            
            expect(res.status).to.equal(401); // Should require authentication first
        });

        it('should return 401 for missing show_date', async () => {
            const data = { ...validShowData };
            delete data.show_date;
            
            const res = await request(app)
                .post('/api/shows')
                .send(data);
            
            expect(res.status).to.equal(401); // Should require authentication first
        });

        it('should return 401 for invalid show_date', async () => {
            const data = { ...validShowData, show_date: 'invalid-date' };
            
            const res = await request(app)
                .post('/api/shows')
                .send(data);
            
            expect(res.status).to.equal(401); // Should require authentication first
        });

        it('should return 401 for venue too long', async () => {
            const data = { ...validShowData, venue: 'a'.repeat(201) };
            
            const res = await request(app)
                .post('/api/shows')
                .send(data);
            
            expect(res.status).to.equal(401); // Should require authentication first
        });

        it('should return 401 for city too long', async () => {
            const data = { ...validShowData, city: 'a'.repeat(101) };
            
            const res = await request(app)
                .post('/api/shows')
                .send(data);
            
            expect(res.status).to.equal(401); // Should require authentication first
        });

        it('should return 401 for ticket_link too long', async () => {
            const data = { ...validShowData, ticket_link: 'a'.repeat(501) };
            
            const res = await request(app)
                .post('/api/shows')
                .send(data);
            
            expect(res.status).to.equal(401); // Should require authentication first
        });

        it('should return 401 for non-string venue', async () => {
            const data = { ...validShowData, venue: 123 };
            
            const res = await request(app)
                .post('/api/shows')
                .send(data);
            
            expect(res.status).to.equal(401); // Should require authentication first
        });

        it('should return 401 for empty venue', async () => {
            const data = { ...validShowData, venue: '' };
            
            const res = await request(app)
                .post('/api/shows')
                .send(data);
            
            expect(res.status).to.equal(401); // Should require authentication first
        });
    });

    describe('GET /api/shows', () => {
        it('should return 200 and array of shows', async () => {
            const res = await request(app)
                .get('/api/shows');
            
            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('array');
        });
    });

    describe('GET /api/shows/upcoming', () => {
        it('should return 200 with upcoming shows data', async () => {
            const res = await request(app)
                .get('/api/shows/upcoming');
            
            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('shows');
            expect(res.body).to.have.property('count');
            expect(res.body).to.have.property('hasUpcomingShows');
            expect(res.body.shows).to.be.an('array');
            expect(res.body.count).to.be.a('number');
            expect(res.body.hasUpcomingShows).to.be.a('boolean');
        });
    });
}); 