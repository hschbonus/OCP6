const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
const multer = require('../middleware/multer-config');
const convertImageToWebp = require('../middleware/convert');
const booksCtrl = require('../controllers/book');

router.post('/', auth, multer, convertImageToWebp, booksCtrl.createBook);
router.get('/', booksCtrl.getAllBooks);
router.get('/bestrating', booksCtrl.getTop3Books);
router.get('/:id', booksCtrl.getOneBook);
router.delete('/:id', auth, multer, booksCtrl.deleteBook);
router.post('/:id/rating', auth, booksCtrl.addGrade);
router.put('/:id', auth, multer, convertImageToWebp, booksCtrl.updateBook);


module.exports = router;