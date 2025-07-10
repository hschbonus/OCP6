const Book = require('../models/Book');

exports.createBook = (req, res) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  const book = new Book({
    ...bookObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });
  book.save()
    .then(() => res.status(201).json({ message: 'Livre enregistré !' }))
    .catch(error => res.status(400).json({ error }));
}

exports.getAllBooks = (req, res) => {
  Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
}

exports.getOneBook = (req, res) => {
  Book.findOne({ _id: req.params.id })
    .then(book => {
      res.status(200).json(book);
    })
    .catch(error => res.status(404).json({ error }));
};

exports.deleteBook = (req, res) => {
  Book.deleteOne({ _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Livre supprimé !' }))
    .catch(error => res.status(400).json({ error }));
}

exports.addGrade = (req, res) => {
  const newGrade = {
    userId: req.body.userId,
    grade: req.body.rating
  };

  Book.updateOne(
    { _id: req.params.id },
    { $push: { ratings: newGrade } },
  )
    .then(async () => {
      const updatedBook = await Book.findOne({ _id: req.params.id });
      if (!updatedBook) {
        return res.status(404).json({ message: 'Livre non trouvé.' });
      }

      const bookObject = updatedBook.toObject();
      bookObject.id = bookObject._id;

      res.status(201).json(bookObject);
    })
    .catch(error => res.status(400).json({ error }));
};

