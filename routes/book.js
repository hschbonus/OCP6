const express = require('express');
const router = express.Router();

const booksCtrl = require('../controllers/book');

router.post('/', booksCtrl.createBook);

router.get('/', (req, res) => {
  res.json([]);
});

module.exports = router;