const { PrismaClient } = require('@prisma/client');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const app = express();
const SECRET_KEY = 'your_secret_key'; // Nahraďte svým tajným klíčem

app.use(cors());
app.use(express.json());

// Načtení všech pilulek (chráněný endpoint)
app.get('/pills', authenticate, async (req, res) => {
    const pills = await prisma.pill.findMany();
    res.json(pills);
});

// Přidání nové pilulky (chráněný endpoint)
app.post('/pills', authenticate, async (req, res) => {
    const { name, time } = req.body;
    const newPill = await prisma.pill.create({
        data: { name, time },
    });
    res.json(newPill);
});

// Smazání pilulky (chráněný endpoint)
app.delete('/pills/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    await prisma.pill.delete({
        where: { id: parseInt(id) },
    });
    res.json({ message: 'Pill deleted' });
});

// Registrace uživatele
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    const existingUser = await prisma.user.findUnique({
        where: { username },
    });
    if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
        data: { username, password: hashedPassword },
    });

    res.json({ message: 'User registered', user: newUser });
});

// Přihlášení uživatele
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const user = await prisma.user.findUnique({
        where: { username },
    });

    if (!user) {
        return res.status(400).json({ message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid password' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, {
        expiresIn: '1h',
    });

    res.json({ message: 'Login successful', token });
});

// Middleware pro ověření tokenu
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
}

// Spuštění serveru
app.listen(3001, () => {
    console.log('Server running on http://localhost:3001');
});