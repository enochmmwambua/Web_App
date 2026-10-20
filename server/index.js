const express = require('express');
const cors = require('cors');
const path = require('path');
const YAML = require('yamljs');
const swaggerUi = require('swagger-ui-express');
const db = require('./db');
require('dotenv').config();

const app = express();


app.use(cors());
app.use(express.json());
const fs = require('fs');

const localYaml = path.join(__dirname, 'openapi.yaml');
const parentYaml = path.join(__dirname, '../openapi.yaml');
const yamlPath = fs.existsSync(localYaml) ? localYaml : (fs.existsSync(parentYaml) ? parentYaml : null);

if (yamlPath) {
    try {
        const swaggerDocument = YAML.load(yamlPath);
        app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
        console.log(`[SWAGGER] UI successfully mounted at /docs using ${yamlPath}`);
    } catch (err) {
        console.error('[SWAGGER ERROR] Failed to parse YAML file:', err.message);
    }
} else {
    console.error(`[SWAGGER ERROR] openapi.yaml not found at ${localYaml} or ${parentYaml}`);
}


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


// SIGNUP ENDPOINTS (signup.html & openapi.yaml)


// INSERT: Register a new user
app.post(['/users', '/api/users'], async (req, res) => {
    const { fullName, email, phone, tier, password } = req.body;

    // GATE 1: Presence Check
    if (!fullName || !email || !tier || !password) {
        return res.status(400).json({ 
            error: "Missing required fields: fullName, email, tier, and password are required." 
        });
    }

    // GATE 2: Type Safety Check
    if (
        typeof fullName !== 'string' || 
        typeof email !== 'string' || 
        typeof tier !== 'string' || 
        typeof password !== 'string'
    ) {
        return res.status(400).json({ 
            error: "Invalid data type: fullName, email, tier, and password must be strings." 
        });
    }

    // GATE 3: Usability & Format Check
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (trimmedName.length === 0) {
        return res.status(400).json({ error: "fullName cannot be empty or blank." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
        return res.status(400).json({ error: "Invalid email address format." });
    }

    if (trimmedPassword.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters long." });
    }

    if (phone && typeof phone !== 'string') {
        return res.status(400).json({ error: "phone must be a string." });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO users (full_name, email, phone, membership_tier, password) VALUES (?, ?, ?, ?, ?)',
            [trimmedName, trimmedEmail, phone || null, tier, trimmedPassword]
        );
        res.status(201).json({ message: 'User created successfully', id: result.insertId });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Email already exists' });
        }
        console.error(err);
        res.status(500).json({ error: 'Failed to register user' });
    }
});

// CONTRACT READ ENDPOINTS (Group 10 NyumbaHub)


// GET /memberships: Return active gym membership tiers
app.get(['/memberships', '/api/memberships'], (req, res) => {
    res.status(200).json([
        { tier: 'Daily Drop-In', price: '500 KES', details: 'Full facility access for 24 hours.' },
        { tier: 'Monthly Standard', price: '5,000 KES', details: 'Unlimited access + GymBuddy App.' },
        { tier: 'Student', price: '4,500 KES', details: 'All features of Monthly Standard (Valid university ID required.)' }
    ]);
});

// GET /trainers: Return active personal trainers
app.get(['/trainers', '/api/trainers'], (req, res) => {
    res.status(200).json([
        { name: 'Coach Marcus', specialty: 'Strength & Powerlifting' },
        { name: 'Coach Sarah', specialty: 'HIIT & Conditioning' },
        { name: 'Coach David', specialty: 'Hypertrophy & Aesthetics' }
    ]);
});

// GET /testimonials: Return verified member success stories
app.get(['/testimonials', '/api/testimonials'], (req, res) => {
    res.status(200).json([
        { member: 'James K.', story: "The GymBuddy app feature is a gamechanger. I don't need to carry a notebook anymore, and I finally hit my 160kg deadlift target thanks to Coach Marcus." },
        { member: 'Michelle W.', story: "Best facility near Strathmore hands down. The coaches actually know what they're doing, the vibe is unmatched, and it's perfect for training between classes." },
        { member: 'Anita M.', story: "The Gym's cardio and HIIT sessions completely transformed my lifestyle. Switched from my old gym in South C and I'm never looking back." }
    ]);
});

// GET /schedules: Return group class schedules
app.get(['/schedules', '/api/schedules'], (req, res) => {
    res.status(200).json([
        { class: 'HIIT & Conditioning', coach: 'Sarah', day: 'Monday', time: '17:30' },
        { class: 'Powerlifting Fundamentals', coach: 'Marcus', day: 'Wednesday', time: '18:00' }
    ]);
});

// GET /hours: Return gym operating hours
app.get(['/hours', '/api/hours'], (req, res) => {
    const hours = {
        weekdays: '6:00 AM - 8:00 PM',
        saturday: '7:00 AM - 6:00 PM',
        sunday: '8:00 AM - 4:00 PM'
    };
    
    if (req.query.status === 'open') {
        res.status(200).json({ currently_open: true, schedule: hours });
    } else {
        res.status(200).json({ schedule: hours });
    }
});

// Root check
app.get('/', (req, res) => {
    res.send('GymBuddy API is running. Access interactive docs at /docs');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});