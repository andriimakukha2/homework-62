const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const path = require("path");
const session = require("express-session");

// Ініціалізація
dotenv.config();
const app = express();
const router = express.Router(); // Ініціалізуємо router

// Імпортуємо маршрути для авторизації
const { router: authRouter } = require('./routes/auth'); // Шлях до файлу auth.js

// Налаштування EJS як шаблонізатора
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Для обробки form-data
app.use(morgan("dev"));
app.use(helmet());
app.use(cookieParser()); // Для доступу до кукі
app.use(express.static(path.join(__dirname, "public"))); // Вказуємо статичні файли

// Ліміт запитів для захисту
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 хвилин
    max: 100, // Ліміт 100 запитів з одного IP
    message: "Too many requests from this IP, please try again later.",
});

app.use("/api", limiter); // Обмеження для API маршруту

// Маршрут для головної сторінки
app.get("/", (req, res) => {
    const theme = req.cookies.theme || 'light'; // Якщо тема не встановлена в кукі, за замовчуванням "light"
    res.render("index", { title: "Home Page", theme });
});

// Маршрут для налаштувань
router.get('/', (req, res) => {
    res.render('settings', {
        title: 'Settings',
        theme: req.cookies.theme || 'light',
        body: 'Settings content here' // Передаємо контент сторінки як "body"
    });
});

// Маршрут для зміни теми
router.post('/set-theme', (req, res) => {
    const { theme } = req.body; // Отримуємо вибрану тему з тіла запиту
    if (!theme) {
        return res.status(400).json({ message: 'Theme is required' });
    }

    // Збереження вибраної теми в cookie
    res.cookie('theme', theme, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

    // Перенаправлення назад на сторінку налаштувань
    res.redirect('/settings');
});

// Маршрут для сторінки авторизації
router.get('/', (req, res) => {
    const error = req.query.error || null; // Отримуємо помилку з query параметра, якщо є
    res.render('auth', { title: 'Authorization', error });
});

// Підключаємо маршрути для налаштувань
app.use('/settings', router); // Використовуємо роутер для маршруту /settings

// Підключаємо маршрути для авторизації
app.use('/auth', authRouter); // Використовуємо роутер для маршруту /auth

// Обробка помилки 404
app.use((req, res, next) => {
    res.status(404).render("error", { message: "Page not found", status: 404 });
});

// Обробка помилки сервера
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render("error", { message: "Server error", status: 500 });
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));