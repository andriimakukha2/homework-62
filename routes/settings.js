const express = require('express');
const router = express.Router();

// Сторінка налаштувань
router.get('/', (req, res) => {
    res.render('settings', { title: 'Settings', theme: req.cookies.theme || 'light' });
});

// Збереження вибраної теми
router.post('/set-theme', (req, res) => {
    const { theme } = req.body;

    // Валідація: тільки "light" або "dark" дозволено
    if (!theme || !['light', 'dark'].includes(theme)) {
        return res.status(400).json({ message: 'Invalid theme. Please choose either "light" or "dark".' });
    }

    // Зберігаємо вибрану тему в cookie
    res.cookie('theme', theme, { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true }); // Тема зберігається на 7 днів
    res.redirect('/settings'); // Після зміни теми перенаправляємо на сторінку налаштувань
});

module.exports = router;