require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const AWS = require('aws-sdk');

const app = express();
const PORT = 3001;

// CORS configuration
app.use(cors({
  origin: ['http://localhost:4200', 'http://127.0.0.1:4200'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'bodyf1rst-db.c4rsccauwjin.us-east-1.rds.amazonaws.com',
  user: process.env.DB_USER || 'dbadmin',
  password: process.env.DB_PASSWORD || 'adminbodyf1rst2023',
  database: process.env.DB_NAME || 'bodyf1rst_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// AWS S3 configuration
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'AKIAZI4NO3NXWHOWXDCT',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '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',
  region: process.env.AWS_REGION || 'us-east-1'
});

const S3_BUCKET = 'bodyf1rst-workout-video-storage';

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get all videos with clean titles (no resolution suffixes)
app.get('/get-videos', async (req, res) => {
  try {
    const [videos] = await pool.query(`
      SELECT
        id,
        video_title,
        video_url,
        thumbnail_url,
        transcription,
        tags,
        duration,
        category,
        created_at,
        updated_at
      FROM video_library
      ORDER BY created_at DESC
    `);

    // Clean up video titles by removing resolution suffixes like (360p), (720p), etc.
    const cleanedVideos = videos.map(video => {
      // Remove patterns like " (360p)", " (720p)", " (360p) 2", etc.
      const cleanTitle = video.video_title.replace(/\s*\(\d+p\)\s*\d*\s*$/i, '');

      // Fix thumbnail URLs - remove resolution suffix from S3 key
      let thumbnailUrl = video.thumbnail_url;
      if (thumbnailUrl) {
        // Extract the S3 key and clean it
        const s3Key = thumbnailUrl.split('.com/')[1];
        if (s3Key) {
          const cleanKey = s3Key.replace(/\s*\(\d+p\)\s*\d*/, '');
          thumbnailUrl = `https://${S3_BUCKET}.s3.amazonaws.com/${cleanKey}`;
        }
      }

      return {
        ...video,
        video_title: cleanTitle,
        thumbnail_url: thumbnailUrl,
        tags: video.tags ? video.tags.split(',').map(t => t.trim()) : []
      };
    });

    res.json({
      success: true,
      count: cleanedVideos.length,
      videos: cleanedVideos
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching videos',
      error: error.message
    });
  }
});

// Get dashboard stats
app.get('/get-dashboard-stats', async (req, res) => {
  try {
    const [videoCount] = await pool.query('SELECT COUNT(*) as count FROM video_library');
    const [exerciseCount] = await pool.query('SELECT COUNT(*) as count FROM exercises WHERE 1');

    res.json({
      success: true,
      stats: {
        totalVideos: videoCount[0].count,
        totalExercises: exerciseCount[0].count || 0,
        activeUsers: 0,
        recentUploads: 0
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats'
    });
  }
});

// Get user profile (mock data for now)
app.get('/get-my-profile', (req, res) => {
  res.json({
    success: true,
    profile: {
      id: 1,
      name: 'Admin User',
      email: 'admin@bodyf1rst.com',
      role: 'admin',
      profile_image: null
    }
  });
});

// Get exercises
app.get('/get-exercises', async (req, res) => {
  try {
    const [exercises] = await pool.query(`
      SELECT
        id,
        exercise_name as name,
        description,
        category,
        difficulty_level,
        equipment_needed,
        created_at
      FROM exercises
      ORDER BY created_at DESC
      LIMIT 100
    `);

    res.json({
      success: true,
      count: exercises.length,
      exercises: exercises
    });
  } catch (error) {
    console.error('Error fetching exercises:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching exercises',
      error: error.message
    });
  }
});

// Get video by ID
app.get('/get-video/:id', async (req, res) => {
  try {
    const [videos] = await pool.query(
      'SELECT * FROM video_library WHERE id = ?',
      [req.params.id]
    );

    if (videos.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    const video = videos[0];
    // Clean title
    video.video_title = video.video_title.replace(/\s*\(\d+p\)\s*\d*\s*$/i, '');
    video.tags = video.tags ? video.tags.split(',').map(t => t.trim()) : [];

    res.json({
      success: true,
      video: video
    });
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching video',
      error: error.message
    });
  }
});

// Search videos
app.get('/search-videos', async (req, res) => {
  try {
    const { q, tag, category } = req.query;
    let query = 'SELECT * FROM video_library WHERE 1=1';
    const params = [];

    if (q) {
      query += ' AND video_title LIKE ?';
      params.push(`%${q}%`);
    }

    if (tag) {
      query += ' AND tags LIKE ?';
      params.push(`%${tag}%`);
    }

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY created_at DESC LIMIT 100';

    const [videos] = await pool.query(query, params);

    // Clean titles
    const cleanedVideos = videos.map(video => ({
      ...video,
      video_title: video.video_title.replace(/\s*\(\d+p\)\s*\d*\s*$/i, ''),
      tags: video.tags ? video.tags.split(',').map(t => t.trim()) : []
    }));

    res.json({
      success: true,
      count: cleanedVideos.length,
      videos: cleanedVideos
    });
  } catch (error) {
    console.error('Error searching videos:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching videos',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: error.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 BodyF1rst API Server running on http://localhost:${PORT}`);
  console.log(`📊 Database: ${process.env.DB_HOST || 'bodyf1rst-db.c4rsccauwjin.us-east-1.rds.amazonaws.com'}`);
  console.log(`☁️  S3 Bucket: ${S3_BUCKET}`);
  console.log(`✅ Ready to accept requests from http://localhost:4200\n`);
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server...');
  await pool.end();
  process.exit(0);
});
