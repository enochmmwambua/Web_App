    // server/v2.js - The new API shape
const express = require('express');
const router = express.Router();

const rawMemberships = [
    { tier: 'Daily Drop-In', price: '500 KES', details: 'Full facility access for 24 hours.' },
    { tier: 'Monthly Standard', price: '5,000 KES', details: 'Unlimited access + GymBuddy App.' },
    { tier: 'Student', price: '4,500 KES', details: 'All features of Monthly Standard (Valid university ID required.)' }
];

// Transformer for v2 shape: renames price -> rate
const toV2 = m => ({
    tier: m.tier,
    rate: m.price, // Renamed field
    details: m.details
});

router.get('/memberships', (req, res) => {
    const formatted = rawMemberships.map(toV2);
    res.status(200).json({
        data: formatted,
        count: formatted.length
    });
});

router.get('/trainers', (req, res) => {
    const trainers = [
        { name: 'Coach Marcus', specialty: 'Strength & Powerlifting' },
        { name: 'Coach Sarah', specialty: 'HIIT & Conditioning' },
        { name: 'Coach David', specialty: 'Hypertrophy & Aesthetics' }
    ];
    res.status(200).json({ data: trainers, count: trainers.length });
});

module.exports = router;