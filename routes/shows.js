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
        const { title, date, venue, city, ticket_url, description } = req.body;
        
        // Validate required fields
        if (!venue || !city || !state_province || !country || !show_date) {
            return res.status(400).json({
                error: 'Venue, city, state/province, country, and show date are required'
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
        
        // Validate required fields
        if (!venue || !city || !state_province || !country || !show_date) {
            return res.status(400).json({
                error: 'Venue, city, state/province, country, and show date are required'
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