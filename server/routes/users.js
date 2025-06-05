const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const dataFile = path.join(__dirname, '../data.json');
let data = JSON.parse(fs.readFileSync(dataFile));

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = data.users.find(u => u.email === email);
  if (!user) {
    return res.status(400).json({ message: 'Email não encontrado' });
  }
  if (password !== user.password) {
    return res.status(400).json({ message: 'Senha incorreta' });
  }
  res.json({ user: { id: user.id, username: user.username, email: user.email, role: user.role } });
});

// Cadastro
router.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  if (data.users.find(u => u.email === email)) {
    return res.status(400).json({ message: 'Email já cadastrado' });
  }
  const newUser = {
    id: data.users.length + 1,
    username,
    email,
    password, // Armazena senha em texto puro
    role: 'user'
  };
  data.users.push(newUser);
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
  res.json({ user: { id: newUser.id, username, email, role: newUser.role } });
});

module.exports = router;