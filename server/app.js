const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const userRoutes = require('./routes/users');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Configurar multer para upload de imagens
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens JPEG, PNG ou GIF são permitidas'));
    }
  },
  limits: { fileSize:  10 * 1024 * 1024 } // Limite de 5MB
});

// Rastrear usuários online: { username: ws }
const onlineUsers = new Map();

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());

// Rotas
app.use('/api', userRoutes);

// Rota para upload de imagem
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Nenhuma imagem enviada ou formato inválido' });
  }
  const imagePath = `/uploads/${req.file.filename}`;
  res.json({ imagePath });
});

// Rota para listar todos os usuários
app.get('/api/users', (req, res) => {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data.json')));
  res.json(data.users.map(u => ({ id: u.id, username: u.username, email: u.email, role: u.role })));
});

// Rotas para artigos
app.get('/api/articles', (req, res) => {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data.json')));
  const category = req.query.category;
  const articles = category ? data.articles.filter(a => a.category === category) : data.articles;
  res.json(articles);
});

app.get('/api/articles/:id', (req, res) => {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data.json')));
  const article = data.articles.find(a => a.id === parseInt(req.params.id));
  if (!article) {
    return res.status(404).json({ message: 'Artigo não encontrado' });
  }
  res.json(article);
});

app.post('/api/articles', upload.single('image'), (req, res) => {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data.json')));
  const imagePath = req.file ? `/uploads/${req.file.filename}` : 'https://via.placeholder.com/150';
  const newArticle = {
    id: data.articles.length + 1,
    title: req.body.title,
    summary: req.body.summary,
    content: req.body.content,
    category: req.body.category,
    image: imagePath,
    createdAt: new Date().toISOString()
  };
  data.articles.push(newArticle);
  fs.writeFileSync(path.join(__dirname, 'data.json'), JSON.stringify(data, null, 2));
  res.json(newArticle);
});

app.put('/api/articles/:id', upload.single('image'), (req, res) => {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data.json')));
  const index = data.articles.findIndex(a => a.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ message: 'Artigo não encontrado' });
  }
  const imagePath = req.file ? `/uploads/${req.file.filename}` : data.articles[index].image;
  data.articles[index] = {
    id: parseInt(req.params.id),
    title: req.body.title,
    summary: req.body.summary,
    content: req.body.content,
    category: req.body.category,
    image: imagePath,
    createdAt: data.articles[index].createdAt
  };
  fs.writeFileSync(path.join(__dirname, 'data.json'), JSON.stringify(data, null, 2));
  res.json(data.articles[index]);
});

app.delete('/api/articles/:id', (req, res) => {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data.json')));
  const index = data.articles.findIndex(a => a.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ message: 'Artigo não encontrado' });
  }
  data.articles.splice(index, 1);
  fs.writeFileSync(path.join(__dirname, 'data.json'), JSON.stringify(data, null, 2));
  res.json({ message: 'Artigo excluído' });
});

// Rotas para mensagens
app.get('/api/messages', (req, res) => {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data.json')));
  res.json(data.messages);
});

app.delete('/api/messages/:id', (req, res) => {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data.json')));
  const index = data.messages.findIndex(m => m.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ message: 'Mensagem não encontrada' });
  }
  data.messages.splice(index, 1);
  fs.writeFileSync(path.join(__dirname, 'data.json'), JSON.stringify(data, null, 2));
  res.json({ message: 'Mensagem excluída' });
});

// WebSocket para chat
wss.on('connection', (ws) => {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data.json')));
  ws.on('message', (message) => {
    const msg = JSON.parse(message);
    if (msg.type === 'auth') {
      const user = data.users.find(u => u.username === msg.username);
      if (!user) {
        ws.send(JSON.stringify({ type: 'error', message: 'Usuário não encontrado' }));
        return;
      }
      onlineUsers.set(msg.username, ws);
      ws.username = msg.username;
      const userMessages = data.messages.filter(m => 
        !m.recipient || m.recipient === msg.username || m.sender === msg.username
      );
      ws.send(JSON.stringify({ type: 'history', messages: userMessages }));
      broadcastOnlineUsers();
    } else if (msg.type === 'message') {
      if (!ws.username) {
        ws.send(JSON.stringify({ type: 'error', message: 'Não autenticado' }));
        return;
      }
      const newMessage = {
        id: data.messages.length + 1,
        sender: ws.username,
        content: msg.content,
        timestamp: new Date().toISOString(),
        recipient: msg.recipient || null
      };
      data.messages.push(newMessage);
      fs.writeFileSync(path.join(__dirname, 'data.json'), JSON.stringify(data, null, 2));
      if (newMessage.recipient) {
        const recipientWs = onlineUsers.get(newMessage.recipient);
        if (recipientWs) {
          recipientWs.send(JSON.stringify({ type: 'message', ...newMessage }));
        }
        ws.send(JSON.stringify({ type: 'message', ...newMessage }));
      } else {
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'message', ...newMessage }));
          }
        });
      }
    }
  });

  ws.on('close', () => {
    if (ws.username) {
      let data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data.json')));
      data.messages = data.messages.filter(m => 
        m.sender !== ws.username && m.recipient !== ws.username
      );
      fs.writeFileSync(path.join(__dirname, 'data.json'), JSON.stringify(data, null, 2));
      onlineUsers.delete(ws.username);
      broadcastOnlineUsers();
    }
  });
});

function broadcastOnlineUsers() {
  const users = Array.from(onlineUsers.keys());
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'onlineUsers', users }));
    }
  });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});