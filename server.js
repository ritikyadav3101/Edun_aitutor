const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const SECRET = process.env.JWT_SECRET || 'edun-secret-2024';
const GROQ_KEY = (process.env.GROQ_KEY || '').trim();

// Simple file-based database
const DB_FILE = 'users.json';
function loadDB() {
  try { return JSON.parse(fs.readFileSync(DB_FILE)); }
  catch { return { users: [] }; }
}
function saveDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// Auth middleware
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch { res.status(401).json({ error: 'Invalid token' }); }
}

// REGISTER
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: 'All fields required' });
  
  const db = loadDB();
  if (db.users.find(u => u.email === email))
    return res.status(400).json({ error: 'Email already exists' });
  
  const hashed = await bcrypt.hash(password, 10);
  const user = {
    id: Date.now().toString(),
    name,
    email,
    password: hashed,
    plan: 'free',
    createdAt: new Date().toISOString(),
    examsAccess: ['Bihar APO']
  };
  
  db.users.push(user);
  saveDB(db);
  
  const token = jwt.sign({ id: user.id, email, name, plan: user.plan }, SECRET);
  res.json({ token, user: { id: user.id, name, email, plan: user.plan } });
});

// LOGIN
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const db = loadDB();
  const user = db.users.find(u => u.email === email);
  
  if (!user) return res.status(400).json({ error: 'User not found' });
  
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: 'Wrong password' });
  
  const token = jwt.sign({ id: user.id, email, name: user.name, plan: user.plan }, SECRET);
  res.json({ token, user: { id: user.id, name: user.name, email, plan: user.plan } });
});

// GET USER
app.get('/api/user', auth, (req, res) => {
  const db = loadDB();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user.id, name: user.name, email: user.email, plan: user.plan });
});

// UPGRADE PLAN
app.post('/api/upgrade', auth, (req, res) => {
  const { plan } = req.body;
  const db = loadDB();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.plan = plan;
  saveDB(db);
  const token = jwt.sign({ id: user.id, email: user.email, name: user.name, plan }, SECRET);
  res.json({ token, plan });
});

// ASK AI
app.post('/api/ask', auth, async (req, res) => {
  const { messages, system } = req.body;
  
  const payload = JSON.stringify({
    model: 'llama-3.1-8b-instant',
    messages: [
      { role: 'system', content: system || 'You are a helpful exam preparation assistant.' },
      ...messages
    ],
    max_tokens: 1024
  });

  const options = {
    hostname: 'api.groq.com',
    path: '/openai/v1/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + GROQ_KEY,
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  const apiReq = https.request(options, apiRes => {
    let data = '';
    apiRes.on('data', d => data += d);
    apiRes.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        const text = parsed.choices[0].message.content;
        res.json({ reply: text });
      } catch(e) {
        res.status(500).json({ error: data });
      }
    });
  });

  apiReq.on('error', e => res.status(500).json({ error: e.message }));
  apiReq.write(payload);
  apiReq.end();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Edun running on port ' + PORT));
