const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ----------------------
// LINK SPS SECTION
// ----------------------
let linkData = [];
const linkFilePath = './links.json';

if (fs.existsSync(linkFilePath)) {
  linkData = JSON.parse(fs.readFileSync(linkFilePath));
}

app.get('/links', (req, res) => {
  res.json(linkData);
});

const upload = multer();
app.post('/add-link', upload.single('excel'), (req, res) => {
  const { title, link } = req.body;
  if (!title || !link) return res.status(400).send('Missing data');

  linkData.push({ title, url: link });
  fs.writeFileSync(linkFilePath, JSON.stringify(linkData, null, 2));
  res.sendStatus(200);
});

app.delete('/delete-link/:index', (req, res) => {
  const idx = parseInt(req.params.index);
  if (isNaN(idx) || idx < 0 || idx >= linkData.length) {
    return res.status(400).send('Invalid index');
  }

  linkData.splice(idx, 1);
  fs.writeFileSync(linkFilePath, JSON.stringify(linkData, null, 2));
  res.sendStatus(200);
});

app.get('/sps_links.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'sps_links.json'));
});

// ----------------------
// LOGIN SECTION
// ----------------------
const usersFilePath = './users.json';
let users = [];

// Load users from JSON
if (fs.existsSync(usersFilePath)) {
  users = JSON.parse(fs.readFileSync(usersFilePath));
} else {
  // Buat file default kalau belum ada
  users = [
    { username: 'admin', password: 'admin123' },
    { username: 'telkom', password: 'telkom123' },
  ];
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
}

// Endpoint login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    res.sendStatus(200);
  } else {
    res.sendStatus(401);
  }
});

// Endpoint tambah user baru
app.post('/add-user', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).send('Username dan password wajib diisi');

  const exists = users.some(u => u.username === username);
  if (exists) return res.status(400).send('Username sudah ada');

  users.push({ username, password });
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
