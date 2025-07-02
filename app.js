const express = require('express');
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://user1:1234@mvg-db.nnfg1ki.mongodb.net/?retryWrites=true&w=majority&appName=MVG-db',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));


const app = express();


app.use(express.json());

app.post('/api/auth/signup', (req, res) => {
  res.json({ message: 'Signup route OK' });
});

app.post('/api/auth/login', (req, res) => {
  res.json({ token: 'fake-jwt-token', userId: '123456' });
});

app.get('/api/books', (req, res) => {
  res.json([]);
});

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

module.exports = app;
