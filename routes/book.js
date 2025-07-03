const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
const multer = require('../middleware/multer-config');
const booksCtrl = require('../controllers/book');

router.post('/', multer, booksCtrl.createBook);
router.get('/', booksCtrl.getAllBooks);
router.get('/:id', booksCtrl.getOneBook);

module.exports = router;