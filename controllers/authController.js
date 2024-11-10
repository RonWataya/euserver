const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('./config/db');

const secretKey = process.env.SECRET_KEY || 'your-secret-key';

// Register user
const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO users SET ?';
        const user = await db.execute(query, { name, email, password: hashedPassword, role });
        res.json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user' });
    }
};
// Login user
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const query = 'SELECT * FROM users WHERE email = ?';
        const user = await db.execute(query, [email]);
        if (!user[0]) return res.status(401).json({ message: 'Invalid email or password' });
        const isValidPassword = await bcrypt.compare(password, user[0].password);
        if (!isValidPassword) return res.status(401).json({ message: 'Invalid email or password' });
        const token = jwt.sign({ userId: user[0].id, role: user[0].role }, process.env.SECRET_KEY, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in user' });
    }
};

// Verify token
const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization;
        if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });
        const decoded = jwt.verify(token, secretKey);
        req.userId = decoded.userId;
        req.role = decoded.role;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = { registerUser, loginUser, verifyToken };