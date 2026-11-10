const { fetchWithRetry } = require('./resilientFetch');
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const YAML = require('yamljs');
const swaggerUi = require('swagger-ui-express');
const db = require('./db');
const { monitor, statsHandler } = require('./monitoring');
require('dotenv').config();


// Middleware: Body Parsers & Static Files
const app = express();

// WEEK 12: REQUEST LOGGING (MUST BE REGISTERED FIRST)
app.use(monitor);

// Middleware: Body Parsers & Static Files
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

// Serve Interactive Swagger Documentation at /docs
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


// WEEK 9: API SECURITY & RATE LIMITING

const VALID_KEYS = (process.env.API_KEYS || '')
    .split(',')
    .map(k => k.trim())
    .filter(Boolean);

// 1. API Key Auth Middleware
function requireApiKey(req, res, next) {
    // Exempt Swagger documentation, public health check, and internal frontend app APIs
    const isPublicOrInternal = 
        req.path.startsWith('/docs') || 
        req.path === '/' ||
        req.path.startsWith('/api/workouts') ||
        req.path.startsWith('/api/login') ||
        req.path.startsWith('/login') ||
        req.path.startsWith('/api/gym-reports') ||
        req.path.match(/^\/api\/users\/\d+$/); 

    if (isPublicOrInternal) {
        return next();
    }

    const key = req.get('X-API-Key');
    if (!key || !VALID_KEYS.includes(key)) {
        return res.status(401).json({ error: "Missing or invalid API key. Pass 'X-API-Key' in headers." });
    }

    req.apiKey = key;
    next();
}

// 2. In-Memory Rate Limiter Middleware (Week 9)
function rateLimit({ windowMs, max }) {
    const hits = new Map();

    return (req, res, next) => {
        // Exempt Swagger docs, root, and internal frontend routes
        const isExempt = 
            req.path.startsWith('/docs') || 
            req.path === '/' ||
            req.path.startsWith('/api/login') ||
            req.path.startsWith('/login') ||
            req.path.startsWith('/api/workouts') ||
            req.path.startsWith('/api/gym-reports') ||
            req.path.match(/^\/api\/users\/\d+$/);

        if (isExempt) return next();

        const id = req.apiKey || req.ip;
        const now = Date.now();
        let entry = hits.get(id);

        if (!entry || now >= entry.resetAt) {
            entry = { count: 0, resetAt: now + windowMs };
            hits.set(id, entry);
        }

        entry.count += 1;
        if (entry.count > max) {
            const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
            res.set('Retry-After', String(retryAfter));
            return res.status(429).json({
                error: "Too many requests. Rate limit exceeded.",
                retryAfterSeconds: retryAfter
            });
        }

        next();
    };
}

// Register security middleware (100 requests per minute)
app.use(requireApiKey);
app.use(rateLimit({ windowMs: 60000, max: 100 }));

app.get(['/stats', '/api/stats'], statsHandler);


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


// SIGNUP & USER REGISTRATION

// INSERT: Register a new user
app.post(['/users', '/api/users'], async (req, res) => {
    const { fullName, email, phone, tier, password } = req.body;

    if (!fullName || !email || !tier || !password) {
        return res.status(400).json({ 
            error: "Missing required fields: fullName, email, tier, and password are required." 
        });
    }

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

        res.status(201).json({ 
            message: 'User created successfully', 
            id: result.insertId,
            user: {
                id: result.insertId,
                fullName: trimmedName,
                email: trimmedEmail,
                phone: phone || null,
                tier: tier
            }
        });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Email already exists' });
        }
        console.error(err);
        res.status(500).json({ error: 'Failed to register user' });
    }
});


// AUTHENTICATION & PROFILE MANAGEMENT

// POST /api/login: Verify credentials and return session data
app.post(['/login', '/api/login'], async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
    }

    try {
        const [rows] = await db.query(
            'SELECT id, full_name, email, phone, membership_tier FROM users WHERE email = ? AND password = ?',
            [email.trim(), password.trim()]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        const user = rows[0];
        res.status(200).json({
            message: "Login successful",
            user: {
                id: user.id,
                fullName: user.full_name,
                email: user.email,
                phone: user.phone,
                tier: user.membership_tier
            }
        });
    } catch (err) {
        console.error('[LOGIN ERROR]', err);
        res.status(500).json({ error: "Failed to login. Please try again." });
    }
});

// GET /api/users/:id: Retrieve profile details
app.get(['/users/:id', '/api/users/:id'], async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT id, full_name, email, phone, membership_tier FROM users WHERE id = ?',
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "User account not found." });
        }

        const user = rows[0];
        res.status(200).json({
            id: user.id,
            fullName: user.full_name,
            email: user.email,
            phone: user.phone,
            tier: user.membership_tier
        });
    } catch (err) {
        console.error('[PROFILE GET ERROR]', err);
        res.status(500).json({ error: "Could not fetch user profile." });
    }
});

// PUT /api/users/:id: Update member information
app.put(['/users/:id', '/api/users/:id'], async (req, res) => {
    const userId = req.params.id;
    const { fullName, phone, tier, password } = req.body;

    if (!fullName || !tier) {
        return res.status(400).json({ error: "Full Name and Membership Tier are required." });
    }

    try {
        if (password && password.trim().length >= 6) {
            await db.query(
                'UPDATE users SET full_name = ?, phone = ?, membership_tier = ?, password = ? WHERE id = ?',
                [fullName.trim(), phone || null, tier, password.trim(), userId]
            );
        } else {
            await db.query(
                'UPDATE users SET full_name = ?, phone = ?, membership_tier = ? WHERE id = ?',
                [fullName.trim(), phone || null, tier, userId]
            );
        }

        const [rows] = await db.query(
            'SELECT id, full_name, email, phone, membership_tier FROM users WHERE id = ?',
            [userId]
        );

        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                id: rows[0].id,
                fullName: rows[0].full_name,
                email: rows[0].email,
                phone: rows[0].phone,
                tier: rows[0].membership_tier
            }
        });
    } catch (err) {
        console.error('[PROFILE UPDATE ERROR]', err);
        res.status(500).json({ error: "Failed to update profile information." });
    }
});


// UPSTREAM INTEGRATION: Group 8 (ShieldBox)

const SHIELDBOX_URL = process.env.SHIELDBOX_BASE_URL;
const SHIELDBOX_KEY = process.env.SHIELDBOX_API_KEY;

// POST /api/gym-reports (Submit a new maintenance report to ShieldBox)
app.post('/api/gym-reports', async (req, res) => {
    const { category, description } = req.body;
    if (!category || !description) {
        return res.status(400).json({ error: "Category and description are required." });
    }

    if (!SHIELDBOX_URL || !SHIELDBOX_KEY) {
        return res.status(502).json({ error: "ShieldBox service configuration missing in server environment." });
    }

    try {
        const response = await fetch(`${SHIELDBOX_URL}/reports`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': SHIELDBOX_KEY
            },
            body: JSON.stringify({ category, description })
        });

        const data = await response.json();
        if (!response.ok) {
            return res.status(response.status).json({ error: data.message || data.error || "ShieldBox rejected submission." });
        }
        res.status(201).json(data);
    } catch (err) {
        console.error('[SHIELDBOX POST FAILED]', err.cause?.code || err.message);
        res.status(502).json({ error: "Maintenance reporting service is temporarily offline." });
    }
});

const lastGoodReports = new Map(); // caseCode -> { data, asof }
// GET /api/gym-reports/:caseCode (Retrieve a maintenance report by Case Code from ShieldBox)
app.get('/api/gym-reports/:caseCode', async (req, res) => {
    const { caseCode } = req.params;
    const upperCode = caseCode.toUpperCase();

    if (!SHIELDBOX_URL || !SHIELDBOX_KEY) {
        return res.status(502).json({ error: "ShieldBox service configuration missing in server environment." });
    }

    try {
        const response = await fetchWithRetry(
            `${SHIELDBOX_URL}/reports/${encodeURIComponent(upperCode)}`,
            {
                method: 'GET',
                headers: {
                    'X-API-Key': SHIELDBOX_KEY,
                    'Accept': 'application/json'
                }
            },
            { timeoutMs: 1500, retries: 2, delayMs: 200 }
        );

        if (!response.ok) {
            if (response.status === 404) {
                return res.status(404).json({ error: "No report found matching that Case Code." });
            }
            throw new Error(`ShieldBox returned HTTP ${response.status}`);
        }

        const data = await response.json();
        const asof = new Date().toISOString();

        // Save last known good copy in memory
        lastGoodReports.set(upperCode, { data, asof });

        return res.status(200).json({
            ...data,
            stale: false,
            asof
        });
    } catch (err) {
        const reason = err.name === 'TimeoutError' ? 'timeout' : (err.cause?.code || err.message);
        console.error(`[SHIELDBOX GET FAILED] ${upperCode}: ${reason}`);

        // Graceful Fallback: Serve cached report if available
        if (lastGoodReports.has(upperCode)) {
            const cached = lastGoodReports.get(upperCode);
            return res.status(200).json({
                ...cached.data,
                stale: true,
                asof: cached.asof
            });
        }

        return res.status(502).json({ error: "Maintenance reporting service is temporarily offline." });
    }
});

// POST /api/gym-reports/:caseCode/notes (Add a note to an existing maintenance report)
app.post('/api/gym-reports/:caseCode/notes', async (req, res) => {
    const { caseCode } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
        return res.status(400).json({ error: "Note message is required." });
    }

    if (!SHIELDBOX_URL || !SHIELDBOX_KEY) {
        return res.status(502).json({ error: "ShieldBox service configuration missing in server environment." });
    }

    try {
        const response = await fetch(`${SHIELDBOX_URL}/reports/${encodeURIComponent(caseCode)}/notes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': SHIELDBOX_KEY
            },
            body: JSON.stringify({ message: message.trim() })
        });

        const data = await response.json();
        if (!response.ok) {
            return res.status(response.status).json({ error: data.message || data.error || "Failed to add note." });
        }

        res.status(201).json(data);
    } catch (err) {
        console.error('[SHIELDBOX NOTE POST FAILED]', err.cause?.code || err.message);
        res.status(502).json({ error: "Maintenance reporting service is temporarily offline." });
    }
});

// PATCH /api/gym-reports/:caseCode (Mark a maintenance report as resolved)
app.patch('/api/gym-reports/:caseCode', async (req, res) => {
    const { caseCode } = req.params;

    if (!SHIELDBOX_URL || !SHIELDBOX_KEY) {
        return res.status(502).json({ error: "ShieldBox service configuration missing in server environment." });
    }

    try {
        const response = await fetch(`${SHIELDBOX_URL}/reports/${encodeURIComponent(caseCode)}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': SHIELDBOX_KEY
            },
            body: JSON.stringify({ status: "Resolved" })
        });

        const data = await response.json();
        if (!response.ok) {
            return res.status(response.status).json({ error: data.message || data.error || "Failed to resolve report." });
        }

        res.status(200).json(data);
    } catch (err) {
        console.error('[SHIELDBOX RESOLVE PATCH FAILED]', err.cause?.code || err.message);
        res.status(502).json({ error: "Maintenance reporting service is temporarily offline." });
    }
});

// DELETE /api/gym-reports/:caseCode (Withdraw a maintenance report from ShieldBox)
app.delete('/api/gym-reports/:caseCode', async (req, res) => {
    const { caseCode } = req.params;

    if (!SHIELDBOX_URL || !SHIELDBOX_KEY) {
        return res.status(502).json({ error: "ShieldBox service configuration missing in server environment." });
    }

    try {
        const response = await fetch(`${SHIELDBOX_URL}/reports/${encodeURIComponent(caseCode)}`, {
            method: 'DELETE',
            headers: {
                'X-API-Key': SHIELDBOX_KEY,
                'Accept': 'application/json'
            }
        });

        if (response.status === 204) {
            return res.status(200).json({ 
                success: true, 
                message: `Report ${caseCode} was successfully withdrawn.` 
            });
        }

        const data = await response.json();
        if (!response.ok) {
            if (response.status === 404) {
                return res.status(404).json({ error: data.error || "No report found matching that Case Code." });
            }
            return res.status(response.status).json({ error: data.message || data.error || "Failed to withdraw report." });
        }

        res.status(200).json(data);
    } catch (err) {
        console.error('[SHIELDBOX DELETE FAILED]', err.cause?.code || err.message);
        res.status(502).json({ error: "Maintenance reporting service is temporarily offline." });
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


// START SERVER

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});