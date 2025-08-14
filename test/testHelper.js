const request = require('supertest');
const app = require('../server');

// Cache for admin token to avoid multiple login requests
let adminToken = null;

/**
 * Get admin token for testing admin endpoints
 * @returns {Promise<string>} JWT token
 */
async function getAdminToken() {
    if (adminToken) {
        return adminToken;
    }

    // For testing, we'll use a mock token approach
    // In a real test environment, you'd create a test user via database seeding
    const mockToken = 'mock-jwt-token-for-testing';
    adminToken = mockToken;
    return adminToken;
}

/**
 * Create test headers with admin authentication
 * @returns {Promise<Object>} Headers object with Authorization
 */
async function getAdminHeaders() {
    const token = await getAdminToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

module.exports = {
    getAdminToken,
    getAdminHeaders
}; 