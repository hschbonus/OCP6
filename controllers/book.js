const Book = require('../models/Book');
const { ObjectId } = require('mongoose').Types;


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

exports.addGrade = async (req, res) => {
  try {
    const newGrade = {
      userId: req.body.userId,
      grade: req.body.rating
    };

    await Book.updateOne(
      { _id: req.params.id },
      { $push: { ratings: newGrade } }
    );

    const avgResult = await Book.aggregate([
      { $match: { _id: new ObjectId(req.params.id) } },
      { $project: { averageRating: { $avg: '$ratings.grade' } } }
    ]);

    const rawAverage = avgResult[0]?.averageRating || 0;
    
    const averageRating = Math.round(rawAverage);

    const updatedBook = await Book.findOneAndUpdate(
      { _id: req.params.id },
      { averageRating: averageRating },
      { new: true }
    );

    res.status(201).json(updatedBook.toObject());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};