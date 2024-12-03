const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Inicializace Firebase
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

// Inicializace SQLite
const db = new sqlite3.Database(path.resolve(__dirname, './pilltracker.db'), (err) => {
    if (err) {
        console.error('Could not connect to SQLite database', err);
    } else {
        console.log('Connected to SQLite database');
    }
});

// Vytvoření tabulky pilulek (pokud neexistuje)
db.run(
    `CREATE TABLE IF NOT EXISTS pills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        time TEXT NOT NULL
    )`
);

const app = express();
const PORT = 3001;

app.use(cors({
    origin: ['http://localhost:3000', 'https://pilltracker.web.app'],
    methods: ['GET', 'POST', 'DELETE'],
    credentials: true,
}));
app.use(express.json());

// Middleware pro ověření Firebase tokenu
const verifyFirebaseToken = async (req, res, next) => {
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) return res.status(401).json({ message: 'Unauthorized - No token provided' });

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = decodedToken;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Unauthorized - Invalid token' });
    }
};

// Načíst všechny pilulky
app.get('/api/pills', verifyFirebaseToken, (req, res) => {
    db.all('SELECT * FROM pills', [], (err, rows) => {
        if (err) {
            console.error('Failed to fetch pills:', err);
            res.status(500).json({ message: 'Failed to fetch pills' });
        } else {
            res.json({ pills: rows });
        }
    });
});

// Přidat novou pilulku
app.post('/api/pills', verifyFirebaseToken, (req, res) => {
    const { name, time } = req.body;
    db.run('INSERT INTO pills (name, time) VALUES (?, ?)', [name, time], function (err) {
        if (err) {
            console.error('Failed to add pill:', err);
            res.status(500).json({ message: 'Failed to add pill' });
        } else {
            res.status(201).json({ id: this.lastID, name, time });
        }
    });
});

// Smazat pilulku
app.delete('/api/pills/:id', verifyFirebaseToken, (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM pills WHERE id = ?', [id], (err) => {
        if (err) {
            console.error('Failed to delete pill:', err);
            res.status(500).json({ message: 'Failed to delete pill' });
        } else {
            res.status(204).send();
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});