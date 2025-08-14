const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/shows - Get all shows (public)
router.get('/', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        
        try {
            const [shows] = await connection.query(
                'SELECT * FROM shows ORDER BY show_date ASC'
            );
            
            res.json(shows);
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error fetching shows:', error.message);
        console.error('Full error:', error);
        res.status(500).json({
            error: 'Failed to fetch shows',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// GET /api/shows/upcoming - Get upcoming shows and count (public)
router.get('/upcoming', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        
        try {
            const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
            
            // Get upcoming shows (on or after current date)
            const [upcomingShows] = await connection.query(
                'SELECT * FROM shows WHERE show_date >= ? ORDER BY show_date ASC',
                [currentDate]
            );
            
            // Get count of upcoming shows
            const [countResult] = await connection.query(
                'SELECT COUNT(*) as count FROM shows WHERE show_date >= ?',
                [currentDate]
            );
            
            res.json({
                shows: upcomingShows,
                count: countResult[0].count,
                hasUpcomingShows: countResult[0].count > 0
            });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error fetching upcoming shows:', error.message);
        console.error('Full error:', error);
        res.status(500).json({
            error: 'Failed to fetch upcoming shows',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// GET /api/shows/:id - Get specific show (public)
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();
        
        try {
            const [shows] = await connection.query(
                'SELECT * FROM shows WHERE id = ?',
                [id]
            );
            
            if (shows.length === 0) {
                return res.status(404).json({
                    error: 'Show not found'
                });
            }
            
            res.json(shows[0]);
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error fetching show:', error);
        res.status(500).json({
            error: 'Failed to fetch show'
        });
    }
});

// POST /api/shows - Create new show (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { venue, city, state_province, country, ticket_link, show_date } = req.body;
        
        // Manual validation
        if (!venue || typeof venue !== 'string' || venue.trim().length === 0) {
            return res.status(400).json({
                error: 'Venue is required and must be a non-empty string'
            });
        }
        
        if (!city || typeof city !== 'string' || city.trim().length === 0) {
            return res.status(400).json({
                error: 'City is required and must be a non-empty string'
            });
        }
        
        if (!state_province || typeof state_province !== 'string' || state_province.trim().length === 0) {
            return res.status(400).json({
                error: 'State/province is required and must be a non-empty string'
            });
        }
        
        if (!country || typeof country !== 'string' || country.trim().length === 0) {
            return res.status(400).json({
                error: 'Country is required and must be a non-empty string'
            });
        }
        
        if (!show_date || !Date.parse(show_date)) {
            return res.status(400).json({
                error: 'Show date is required and must be a valid date'
            });
        }
        
        // Validate field lengths
        if (venue.length > 200) {
            return res.status(400).json({
                error: 'Venue must be 200 characters or less'
            });
        }
        
        if (city.length > 100) {
            return res.status(400).json({
                error: 'City must be 100 characters or less'
            });
        }
        
        if (state_province.length > 100) {
            return res.status(400).json({
                error: 'State/province must be 100 characters or less'
            });
        }
        
        if (country.length > 100) {
            return res.status(400).json({
                error: 'Country must be 100 characters or less'
            });
        }
        
        // Validate ticket link if provided
        if (ticket_link && (typeof ticket_link !== 'string' || ticket_link.length > 500)) {
            return res.status(400).json({
                error: 'Ticket link must be a string and 500 characters or less'
            });
        }
        
        const connection = await pool.getConnection();
        
        try {
            const [result] = await connection.query(
                'INSERT INTO shows (venue, city, state_province, country, ticket_link, show_date) VALUES (?, ?, ?, ?, ?, ?)',
                [venue, city, state_province, country, ticket_link || null, show_date]
            );
            
            // Fetch the created show
            const [shows] = await connection.query(
                'SELECT * FROM shows WHERE id = ?',
                [result.insertId]
            );
            
            res.status(201).json(shows[0]);
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error creating show:', error);
        res.status(500).json({
            error: 'Failed to create show'
        });
    }
});

// PUT /api/shows/:id - Update show (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { venue, city, state_province, country, ticket_link, show_date } = req.body;
        
        // Manual validation (same as POST)
        if (!venue || typeof venue !== 'string' || venue.trim().length === 0) {
            return res.status(400).json({
                error: 'Venue is required and must be a non-empty string'
            });
        }
        
        if (!city || typeof city !== 'string' || city.trim().length === 0) {
            return res.status(400).json({
                error: 'City is required and must be a non-empty string'
            });
        }
        
        if (!state_province || typeof state_province !== 'string' || state_province.trim().length === 0) {
            return res.status(400).json({
                error: 'State/province is required and must be a non-empty string'
            });
        }
        
        if (!country || typeof country !== 'string' || country.trim().length === 0) {
            return res.status(400).json({
                error: 'Country is required and must be a non-empty string'
            });
        }
        
        if (!show_date || !Date.parse(show_date)) {
            return res.status(400).json({
                error: 'Show date is required and must be a valid date'
            });
        }
        
        // Validate field lengths
        if (venue.length > 200) {
            return res.status(400).json({
                error: 'Venue must be 200 characters or less'
            });
        }
        
        if (city.length > 100) {
            return res.status(400).json({
                error: 'City must be 100 characters or less'
            });
        }
        
        if (state_province.length > 100) {
            return res.status(400).json({
                error: 'State/province must be 100 characters or less'
            });
        }
        
        if (country.length > 100) {
            return res.status(400).json({
                error: 'Country must be 100 characters or less'
            });
        }
        
        // Validate ticket link if provided
        if (ticket_link && (typeof ticket_link !== 'string' || ticket_link.length > 500)) {
            return res.status(400).json({
                error: 'Ticket link must be a string and 500 characters or less'
            });
        }
        

        
        const connection = await pool.getConnection();
        
        try {
            // Check if show exists
            const [existingShows] = await connection.query(
                'SELECT * FROM shows WHERE id = ?',
                [id]
            );
            
            if (existingShows.length === 0) {
                return res.status(404).json({
                    error: 'Show not found'
                });
            }
            
            // Update the show
            await connection.query(
                'UPDATE shows SET venue = ?, city = ?, state_province = ?, country = ?, ticket_link = ?, show_date = ? WHERE id = ?',
                [venue, city, state_province, country, ticket_link || null, show_date, id]
            );
            
            // Fetch the updated show
            const [shows] = await connection.query(
                'SELECT * FROM shows WHERE id = ?',
                [id]
            );
            
            res.json(shows[0]);
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error updating show:', error);
        res.status(500).json({
            error: 'Failed to update show'
        });
    }
});

// DELETE /api/shows/:id - Delete show (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();
        
        try {
            // Check if show exists
            const [existingShows] = await connection.query(
                'SELECT * FROM shows WHERE id = ?',
                [id]
            );
            
            if (existingShows.length === 0) {
                return res.status(404).json({
                    error: 'Show not found'
                });
            }
            
            // Delete the show
            await connection.query(
                'DELETE FROM shows WHERE id = ?',
                [id]
            );
            
            res.json({
                message: 'Show deleted successfully'
            });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error deleting show:', error);
        res.status(500).json({
            error: 'Failed to delete show'
        });
    }
});

module.exports = router; 