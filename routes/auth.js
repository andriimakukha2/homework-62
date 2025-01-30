const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const router = express.Router();

const SECRET_KEY = 'your_secret_key'; // Замініть на реальний секретний ключ

// Сторінка авторизації
router.get('/', (req, res) => {
    res.render('auth', { title: 'Authorization', theme: req.cookies.theme || 'light', error: null });
});

// Реєстрація користувача
router.post('/register', async (req, res) => {
    const { username, password, passwordConfirm } = req.body;

    if (!username || !password || !passwordConfirm) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    if (password !== passwordConfirm) {
        return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Хешуємо пароль перед збереженням
    const hashedPassword = await bcrypt.hash(password, 10);

    // Генерація токену з часом життя 1 година
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });

    // Збереження токену в cookie
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });

    res.redirect('/');
});

// Вхід користувача
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Для реального застосунку ви маєте порівнювати пароль із збереженим в базі даних хешем
    const storedHashedPassword = '...'; // Наприклад, з бази даних

    const isPasswordValid = await bcrypt.compare(password, storedHashedPassword);

    if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Генерація токену для користувача
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });

    // Збереження токену в cookie
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });

    res.redirect('/');
});

// Вихід з облікового запису
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
});

// Middleware для перевірки токену
function authenticateToken(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(403).json({ message: 'Access denied. No token provided.' });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }

        req.user = user;
        next();
    });
}

module.exports = { router, authenticateToken };