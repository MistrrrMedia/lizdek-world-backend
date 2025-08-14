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
        
        // Manual validation
        if (!title || typeof title !== 'string' || title.trim().length === 0) {
            return res.status(400).json({
                error: 'Title is required and must be a non-empty string'
            });
        }
        
        if (!url_title || typeof url_title !== 'string' || url_title.trim().length === 0) {
            return res.status(400).json({
                error: 'URL title is required and must be a non-empty string'
            });
        }
        
        if (!soundcloud_url || typeof soundcloud_url !== 'string' || !soundcloud_url.includes('soundcloud.com')) {
            return res.status(400).json({
                error: 'SoundCloud URL is required and must be a valid SoundCloud URL'
            });
        }
        
        if (!release_date || !Date.parse(release_date)) {
            return res.status(400).json({
                error: 'Release date is required and must be a valid date'
            });
        }
        
        // Validate title length
        if (title.length > 200) {
            return res.status(400).json({
                error: 'Title must be 200 characters or less'
            });
        }
        
        // Validate URL title format (alphanumeric and hyphens only)
        if (!/^[a-z0-9-]+$/.test(url_title)) {
            return res.status(400).json({
                error: 'URL title must contain only lowercase letters, numbers, and hyphens'
            });
        }
        
        const connection = await pool.getConnection();
        
        try {
            // Check for duplicate title
            const [existingByTitle] = await connection.query(
                'SELECT id FROM releases WHERE title = ?',
                [title]
            );
            
            if (existingByTitle.length > 0) {
                return res.status(409).json({
                    error: 'A release with this title already exists'
                });
            }
            
            // Check for duplicate URL title
            const [existingByUrlTitle] = await connection.query(
                'SELECT id FROM releases WHERE url_title = ?',
                [url_title]
            );
            
            if (existingByUrlTitle.length > 0) {
                return res.status(409).json({
                    error: 'A release with this URL title already exists'
                });
            }
            
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
                    // Validate link object structure
                    if (!link.platform || !link.url) {
                        throw new Error('Each link must have both platform and url properties');
                    }
                    
                    // Validate platform enum values
                    const validPlatforms = ['spotify', 'soundcloud', 'apple_music', 'youtube', 'free_download'];
                    if (!validPlatforms.includes(link.platform)) {
                        throw new Error(`Invalid platform: ${link.platform}. Must be one of: ${validPlatforms.join(', ')}`);
                    }
                    
                    // Validate URL format
                    if (typeof link.url !== 'string' || link.url.trim().length === 0) {
                        throw new Error('Link URL must be a non-empty string');
                    }
                    
                    // Validate URL length
                    if (link.url.length > 500) {
                        throw new Error('Link URL must be 500 characters or less');
                    }
                    
                    await connection.query(
                        'INSERT INTO release_links (release_id, platform, url) VALUES (?, ?, ?)',
                        [releaseId, link.platform, link.url]
                    );
                }
            }
            
            // Commit transaction
            await connection.commit();
            
            // Fetch the created release with links
            const [releases] = await connection.query(
                'SELECT * FROM releases WHERE id = ?',
                [releaseId]
            );
            
            const [releaseLinks] = await connection.query(
                'SELECT * FROM release_links WHERE release_id = ?',
                [releaseId]
            );
            
            res.status(201).json({
                ...releases[0],
                links: releaseLinks
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