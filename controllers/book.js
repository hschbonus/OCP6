const Book = require('../models/Book');
const { ObjectId } = require('mongoose').Types;
const fs = require('fs');
const path = require('path');


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

exports.updateBook = (req, res) => {
  const bookObject = req.file ?
    {
      ...JSON.parse(req.body.book),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    }
  : { ...req.body };

  delete bookObject._id;
  delete bookObject._userId;
  delete bookObject.userId;
  delete bookObject.ratings;
  delete bookObject.averageRating;

  Book.findOne({ _id: req.params.id })
    .then(book => { 
      if (req.file) {
        const oldFilename = book.imageUrl.split('/images/')[1];
        fs.unlink(path.join('images', oldFilename), err => {
          if (err) {
            console.error('Erreur lors de la suppression de l\'ancienne image :', err);
          }
        });
      }

      Book.updateOne({ _id: req.params.id }, { $set: bookObject })
        .then(() => res.status(200).json({ message: 'Livre modifié !' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};

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
  Book.findOne({ _id: req.params.id })
    .then(book => {
      const filename = book.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Book.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Livre supprimé !' }))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};


exports.addGrade = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const grade = req.body.rating;

    if (grade < 0 || grade > 5) {
      return res.status(400).json({ error: 'La note doit être un nombre entre 0 et 5.' });
    }

    const book = await Book.findOne({ _id: req.params.id });
    if (!book) {
      return res.status(404).json({ error: 'Livre non trouvé.' });
    }

    const alreadyRated = book.ratings.some(rating => rating.userId === userId);
    if (alreadyRated) {
      return res.status(403).json({ error: 'Vous avez déjà noté ce livre.' });
    }

    const newGrade = {
      userId: userId,
      grade: grade
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

exports.getTop3Books = (req, res) => {
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};


