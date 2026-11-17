// server/v1.js - FROZEN. Do not change response shapes here.
const express = require('express');
const deprecated = require('./deprecate');
const router = express.Router();

const old = deprecated({ 
    sunset: '2026-11-13', 
    successor: '/v2/memberships' 
});

router.get('/memberships', old, (req, res) => {
    res.status(200).json([
        { tier: 'Daily Drop-In', price: '500 KES', details: 'Full facility access for 24 hours.' },
        { tier: 'Monthly Standard', price: '5,000 KES', details: 'Unlimited access + GymBuddy App.' },
        { tier: 'Student', price: '4,500 KES', details: 'All features of Monthly Standard (Valid university ID required.)' }
    ]);
});

router.get('/trainers', old, (req, res) => {
    res.status(200).json([
        { name: 'Coach Marcus', specialty: 'Strength & Powerlifting' },
        { name: 'Coach Sarah', specialty: 'HIIT & Conditioning' },
        { name: 'Coach David', specialty: 'Hypertrophy & Aesthetics' }
    ]);
});

router.get('/testimonials', old, (req, res) => {
    res.status(200).json([
        { member: 'James K.', story: "The GymBuddy app feature is a gamechanger." },
        { member: 'Michelle W.', story: "Best facility near Strathmore hands down." },
        { member: 'Anita M.', story: "The Gym's cardio and HIIT sessions completely transformed my lifestyle." }
    ]);
});

router.get('/schedules', old, (req, res) => {
    res.status(200).json([
        { class: 'HIIT & Conditioning', coach: 'Sarah', day: 'Monday', time: '17:30' },
        { class: 'Powerlifting Fundamentals', coach: 'Marcus', day: 'Wednesday', time: '18:00' }
    ]);
});

router.get('/hours', old, (req, res) => {
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

module.exports = router;