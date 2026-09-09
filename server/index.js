const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors()); // Allows your HTML files to make requests to this server
app.use(express.json()); // Allows the server to read JSON data sent from the frontend

// WORKOUT TRACKER ENDPOINTS (index.html)

// SELECT: Get all workouts
app.get('/api/workouts', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM workouts');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch workouts' });
    }
});

// INSERT: Add a new exercise
app.post('/api/workouts', async (req, res) => {
    const { day, exercise } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO workouts (day, exercise) VALUES (?, ?)',
            [day, exercise]
        );
        res.status(201).json({ id: result.insertId, day, exercise, is_completed: 0 });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to add workout' });
    }
});

// UPDATE: Toggle the checkbox status
app.put('/api/workouts/:id', async (req, res) => {
    const { is_completed } = req.body;
    try {
        await db.query('UPDATE workouts SET is_completed = ? WHERE id = ?', [is_completed, req.params.id]);
        res.json({ message: 'Workout updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update workout' });
    }
});

// DELETE: Remove an exercise
app.delete('/api/workouts/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM workouts WHERE id = ?', [req.params.id]);
        res.json({ message: 'Workout deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete workout' });
    }
});

// SIGNUP ENDPOINTS (signup.html)

// INSERT: Register a new user
app.post('/api/users', async (req, res) => {
    const { fullName, email, phone, tier, password } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO users (full_name, email, phone, membership_tier, password) VALUES (?, ?, ?, ?, ?)',
            [fullName, email, phone, tier, password]
        );
        res.status(201).json({ message: 'User created successfully', id: result.insertId });
    } catch (err) {
        console.error(err);
        // If email already exists, MySQL throws a duplicate entry error
        if (err.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ error: 'Email already exists' });
        } else {
            res.status(500).json({ error: 'Failed to register user' });
        }
    }
});

// GET /api/memberships: Return active gym membership tiers
app.get('/api/memberships', (req, res) => {
    res.json([
        { tier: 'Daily Drop-In', price: '500 KES', details: 'Full facility access for 24 hours.' },
        { tier: 'Monthly Standard', price: '5,000 KES', details: 'Unlimited access + GymBuddy App.' },
        { tier: 'Student', price: '4,500 KES', details: 'All features of Monthly Standard (Valid university ID required.)' }
    ]);
});

// 2. GET /api/trainers: Return active personal trainers
app.get('/api/trainers', (req, res) => {
    res.json([
        { name: 'Coach Marcus', specialty: 'Strength & Powerlifting' },
        { name: 'Coach Sarah', specialty: 'HIIT & Conditioning' },
        { name: 'Coach David', specialty: 'Hypertrophy & Aesthetics' }
    ]);
});

// GET /api/testimonials: Return verified member success stories
app.get('/api/testimonials', (req, res) => {
    res.json([
        { member: 'James K.', story: 'The GymBuddy app feature is a gamechanger. I don\'t need to carry a notebook anymore, and I finally hit my 160kg deadlift target thanks to Coach Marcus.' },
        { member: 'Michelle W.', story: 'Best facility near Strathmore hands down. The coaches actually know what they\'re doing, the vibe is unmatched, and it\'s perfect for training between classes.' },
        { member: 'Anita M.', story: 'The Gym\'s cardio and HIIT sessions completely transformed my lifestyle. Switched from my old gym in South C and I\'m never looking back.' }
    ]);
});

// GET /api/schedules: Return group class schedules
app.get('/api/schedules', (req, res) => {
    res.json([
        { class: 'HIIT & Conditioning', coach: 'Sarah', day: 'Monday', time: '17:30' },
        { class: 'Powerlifting Fundamentals', coach: 'Marcus', day: 'Wednesday', time: '18:00' }
    ]);
});

// GET /api/hours: Return gym operating hours 
app.get('/api/hours', (req, res) => {
    const hours = {
        weekdays: '6:00 AM - 8:00 PM',
        saturday: '7:00 AM - 6:00 PM',
        sunday: '8:00 AM - 4:00 PM'
    };
    
    // Demonstrate handling the ?status=open query parameter to show if the gym is currently open
    if (req.query.status === 'open') {
        res.json({ currently_open: true, schedule: hours });
    } else {
        res.json(hours);
    }
});

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});