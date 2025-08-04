const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/releases - Get all releases (public)
router.get('/', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        
        try {
            const [releases] = await connection.query(
                'SELECT * FROM releases ORDER BY release_date DESC'
            );
            
            res.json(releases);
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error fetching releases:', error.message);
        console.error('Full error:', error);
        res.status(500).json({
            error: 'Failed to fetch releases',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// GET /api/releases/:urlTitle - Get specific release by URL title (public)
router.get('/:urlTitle', async (req, res) => {
    try {
        const { urlTitle } = req.params;
        const connection = await pool.getConnection();
        
        try {
            // Get the release
            const [releases] = await connection.query(
                'SELECT * FROM releases WHERE url_title = ?',
                [urlTitle]
            );
            
            if (releases.length === 0) {
                return res.status(404).json({
                    error: 'Release not found'
                });
            }
            
            const release = releases[0];
            
            // Get the release links
            const [links] = await connection.query(
                'SELECT * FROM release_links WHERE release_id = ?',
                [release.id]
            );
            
            res.json({
                ...release,
                links
            });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error fetching release:', error.message);
        console.error('Full error:', error);
        res.status(500).json({
            error: 'Failed to fetch release',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// POST /api/releases - Create new release (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { 
            title, 
            url_title, 
            soundcloud_url, 
            collaborators, 
            release_date,
            links 
        } = req.body;
        
        // Validate required fields
        if (!title || !url_title || !soundcloud_url || !release_date) {
            return res.status(400).json({
                error: 'Title, URL title, SoundCloud URL, and release date are required'
            });
        }
        
        const connection = await pool.getConnection();
        
        try {
            // Start transaction
            await connection.beginTransaction();
            
            // Insert the release
            const [result] = await connection.query(
                'INSERT INTO releases (title, url_title, soundcloud_url, collaborators, release_date) VALUES (?, ?, ?, ?, ?)',
                [title, url_title, soundcloud_url, collaborators || null, release_date]
            );
            
            const releaseId = result.insertId;
            
            // Insert links if provided
            if (links && Array.isArray(links)) {
                for (const link of links) {
                    if (link.platform && link.url) {
                        // Validate platform enum values
                        const validPlatforms = ['spotify', 'soundcloud', 'apple_music', 'youtube'];
                        if (!validPlatforms.includes(link.platform)) {
                            throw new Error(`Invalid platform: ${link.platform}. Must be one of: ${validPlatforms.join(', ')}`);
                        }
                        
                        await connection.query(
                            'INSERT INTO release_links (release_id, platform, url) VALUES (?, ?, ?)',
                            [releaseId, link.platform, link.url]
                        );
                    }
                }
            }
            
            // Commit transaction
            await connection.commit();
            
            // Fetch the created release with links
            const [releases] = await connection.query(
                'SELECT * FROM releases WHERE id = ?',
                [releaseId]
            );
            
            const [links] = await connection.query(
                'SELECT * FROM release_links WHERE release_id = ?',
                [releaseId]
            );
            
            res.status(201).json({
                ...releases[0],
                links
            });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error creating release:', error.message);
        console.error('Full error:', error);
        res.status(500).json({
            error: 'Failed to create release',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// PUT /api/releases/:id - Update release (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            title, 
            url_title, 
            soundcloud_url, 
            collaborators, 
            release_date,
            links 
        } = req.body;
        
        // Validate required fields
        if (!title || !url_title || !soundcloud_url || !release_date) {
            return res.status(400).json({
                error: 'Title, URL title, SoundCloud URL, and release date are required'
            });
        }
        
        const connection = await pool.getConnection();
        
        try {
            // Check if release exists
            const [existingReleases] = await connection.query(
                'SELECT * FROM releases WHERE id = ?',
                [id]
            );
            
            if (existingReleases.length === 0) {
                return res.status(404).json({
                    error: 'Release not found'
                });
            }
            
            // Start transaction
            await connection.beginTransaction();
            
            // Update the release
            await connection.query(
                'UPDATE releases SET title = ?, url_title = ?, soundcloud_url = ?, collaborators = ?, release_date = ? WHERE id = ?',
                [title, url_title, soundcloud_url, collaborators || null, release_date, id]
            );
            
            // Update links if provided
            if (links && Array.isArray(links)) {
                // Delete existing links
                await connection.query(
                    'DELETE FROM release_links WHERE release_id = ?',
                    [id]
                );
                
                // Insert new links
                for (const link of links) {
                    if (link.platform && link.url) {
                        // Validate platform enum values
                        const validPlatforms = ['spotify', 'soundcloud', 'apple_music', 'youtube'];
                        if (!validPlatforms.includes(link.platform)) {
                            throw new Error(`Invalid platform: ${link.platform}. Must be one of: ${validPlatforms.join(', ')}`);
                        }
                        
                        await connection.query(
                            'INSERT INTO release_links (release_id, platform, url) VALUES (?, ?, ?)',
                            [id, link.platform, link.url]
                        );
                    }
                }
            }
            
            // Commit transaction
            await connection.commit();
            
            // Fetch the updated release with links
            const [releases] = await connection.query(
                'SELECT * FROM releases WHERE id = ?',
                [id]
            );
            
            const [links] = await connection.query(
                'SELECT * FROM release_links WHERE release_id = ?',
                [id]
            );
            
            res.json({
                ...releases[0],
                links
            });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error updating release:', error.message);
        console.error('Full error:', error);
        res.status(500).json({
            error: 'Failed to update release',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// DELETE /api/releases/:id - Delete release (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();
        
        try {
            // Check if release exists
            const [existingReleases] = await connection.query(
                'SELECT * FROM releases WHERE id = ?',
                [id]
            );
            
            if (existingReleases.length === 0) {
                return res.status(404).json({
                    error: 'Release not found'
                });
            }
            
            // Delete the release (links will be deleted automatically due to CASCADE)
            await connection.query(
                'DELETE FROM releases WHERE id = ?',
                [id]
            );
            
            res.json({
                message: 'Release deleted successfully'
            });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error deleting release:', error.message);
        console.error('Full error:', error);
        res.status(500).json({
            error: 'Failed to delete release',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router; 