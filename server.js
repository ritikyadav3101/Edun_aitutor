const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/register', (req, res) => res.json({token: 'mock', user: {name: "Demo", email: req.body.email, plan: 'free'}}));
app.post('/api/login', (req, res) => res.json({token: 'mock', user: {name: "Demo Student", email: req.body.email, plan: 'free'}}));
app.post('/api/ask', (req, res) => res.json({reply: "✅ AI is working!"}));

app.listen(3000, () => console.log('🚀 Backend running on http://localhost:3000'));
