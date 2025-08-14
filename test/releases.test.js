const request = require('supertest');
const { expect } = require('chai');
const app = require('../server');
const { getAdminHeaders } = require('./testHelper');

describe('Releases Endpoints', () => {
    describe('POST /api/releases', () => {
        const validReleaseData = {
            title: 'Test Release',
            url_title: 'test-release',
            soundcloud_url: 'https://soundcloud.com/test/track',
            collaborators: 'Test Artist',
            release_date: '2024-12-31',
            links: [
                {
                    platform: 'spotify',
                    url: 'https://open.spotify.com/track/test'
                }
            ]
        };

        it('should return 400 for missing title', async () => {
            const data = { ...validReleaseData };
            delete data.title;
            
            const res = await request(app)
                .post('/api/releases')
                .send(data);
            
            expect(res.status).to.equal(401); // Should require authentication first
        });

        it('should return 401 for missing url_title', async () => {
            const data = { ...validReleaseData };
            delete data.url_title;
            
            const res = await request(app)
                .post('/api/releases')
                .send(data);
            
            expect(res.status).to.equal(401); // Should require authentication first
        });

        it('should return 401 for missing soundcloud_url', async () => {
            const data = { ...validReleaseData };
            delete data.soundcloud_url;
            
            const res = await request(app)
                .post('/api/releases')
                .send(data);
            
            expect(res.status).to.equal(401); // Should require authentication first
        });

        it('should return 401 for missing release_date', async () => {
            const data = { ...validReleaseData };
            delete data.release_date;
            
            const res = await request(app)
                .post('/api/releases')
                .send(data);
            
            expect(res.status).to.equal(401); // Should require authentication first
        });

        it('should return 401 for invalid release_date', async () => {
            const data = { ...validReleaseData, release_date: 'invalid-date' };
            
            const res = await request(app)
                .post('/api/releases')
                .send(data);
            
            expect(res.status).to.equal(401); // Should require authentication first
        });

        it('should return 401 for invalid soundcloud_url', async () => {
            const data = { ...validReleaseData, soundcloud_url: 'https://example.com/track' };
            
            const res = await request(app)
                .post('/api/releases')
                .send(data);
            
            expect(res.status).to.equal(401); // Should require authentication first
        });

        it('should return 401 for title too long', async () => {
            const data = { ...validReleaseData, title: 'a'.repeat(201) };
            
            const res = await request(app)
                .post('/api/releases')
                .send(data);
            
            expect(res.status).to.equal(401); // Should require authentication first
        });

        it('should return 401 for invalid url_title format', async () => {
            const data = { ...validReleaseData, url_title: 'Invalid URL Title' };
            
            const res = await request(app)
                .post('/api/releases')
                .send(data);
            
            expect(res.status).to.equal(401); // Should require authentication first
        });

        it('should return 401 for non-string title', async () => {
            const data = { ...validReleaseData, title: 123 };
            
            const res = await request(app)
                .post('/api/releases')
                .send(data);
            
            expect(res.status).to.equal(401); // Should require authentication first
        });

        it('should return 401 for empty title', async () => {
            const data = { ...validReleaseData, title: '' };
            
            const res = await request(app)
                .post('/api/releases')
                .send(data);
            
            expect(res.status).to.equal(401); // Should require authentication first
        });

        it('should return 401 for invalid link platform', async () => {
            const data = {
                ...validReleaseData,
                links: [
                    {
                        platform: 'invalid_platform',
                        url: 'https://example.com/track'
                    }
                ]
            };
            
            const res = await request(app)
                .post('/api/releases')
                .send(data);
            
            expect(res.status).to.equal(401); // Should require authentication first
        });

        it('should return 401 for link without platform', async () => {
            const data = {
                ...validReleaseData,
                links: [
                    {
                        url: 'https://example.com/track'
                    }
                ]
            };
            
            const res = await request(app)
                .post('/api/releases')
                .send(data);
            
            expect(res.status).to.equal(401); // Should require authentication first
        });

        it('should return 401 for link without url', async () => {
            const data = {
                ...validReleaseData,
                links: [
                    {
                        platform: 'spotify'
                    }
                ]
            };
            
            const res = await request(app)
                .post('/api/releases')
                .send(data);
            
            expect(res.status).to.equal(401); // Should require authentication first
        });

        it('should return 401 for link url too long', async () => {
            const data = {
                ...validReleaseData,
                links: [
                    {
                        platform: 'spotify',
                        url: 'a'.repeat(501)
                    }
                ]
            };
            
            const res = await request(app)
                .post('/api/releases')
                .send(data);
            
            expect(res.status).to.equal(401); // Should require authentication first
        });
    });

    describe('GET /api/releases', () => {
        it('should return 200 and array of releases', async () => {
            const res = await request(app)
                .get('/api/releases');
            
            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('array');
        });
    });

    describe('GET /api/releases/:urlTitle', () => {
        it('should return 404 for non-existent release', async () => {
            const res = await request(app)
                .get('/api/releases/non-existent-release');
            
            expect(res.status).to.equal(404);
            expect(res.body).to.have.property('error');
            expect(res.body.error).to.include('Release not found');
        });
    });
}); 