const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// PUT /api/edit/releases/:urlTitle - Update release (admin only)
router.put('/:urlTitle', authenticateToken, requireAdmin, async (req, res) => {
    try {
        console.log('PUT request received for URL title:', req.params.urlTitle);
        console.log('Full request URL:', req.originalUrl);
        console.log('Request method:', req.method);
        
        const { urlTitle } = req.params;
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
                'SELECT * FROM releases WHERE url_title = ?',
                [urlTitle]
            );
            
            if (existingReleases.length === 0) {
                return res.status(404).json({
                    error: 'Release not found'
                });
            }
            
            const releaseId = existingReleases[0].id;
            
            // Start transaction
            await connection.beginTransaction();
            
            // Update the release
            await connection.query(
                'UPDATE releases SET title = ?, url_title = ?, soundcloud_url = ?, collaborators = ?, release_date = ? WHERE id = ?',
                [title, url_title, soundcloud_url, collaborators || null, release_date, releaseId]
            );
            
            // Update links if provided
            if (links && Array.isArray(links)) {
                // Delete existing links
                await connection.query(
                    'DELETE FROM release_links WHERE release_id = ?',
                    [releaseId]
                );
                
                // Insert new links
                for (const link of links) {
                    if (link.platform && link.url) {
                        // Validate platform enum values
                        const validPlatforms = ['spotify', 'soundcloud', 'apple_music', 'youtube', 'free_download'];
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
            
            // Fetch the updated release with links
            const [releases] = await connection.query(
                'SELECT * FROM releases WHERE id = ?',
                [releaseId]
            );
            
            const [releaseLinks] = await connection.query(
                'SELECT * FROM release_links WHERE release_id = ?',
                [releaseId]
            );
            
            res.json({
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
        console.error('Error updating release:', error.message);
        console.error('Full error:', error);
        res.status(500).json({
            error: 'Failed to update release',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;
