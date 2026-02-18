import Book from '../models/Book.js';

// @desc    Get all books
// @route   GET /api/books
// @access  Public
const getBooks = async (req, res) => {
  const books = await Book.find({});
  res.json(books);
};

// @desc    Add a book
// @route   POST /api/books
// @access  Private/Admin
const addBook = async (req, res) => {
  const { name, author, category, totalCopies } = req.body;

  const book = new Book({
    name,
    author,
    category,
    totalCopies: totalCopies || 1,
    availableCopies: totalCopies || 1,
  });

  const createdBook = await book.save();
  res.status(201).json(createdBook);
};

// @desc    Update a book
// @route   PUT /api/books/:id
// @access  Private/Admin
const updateBook = async (req, res) => {
  const { name, author, category, totalCopies } = req.body;

  const book = await Book.findById(req.params.id);

  if (book) {
    book.name = name || book.name;
    book.author = author || book.author;
    book.category = category || book.category;
    
    if (totalCopies !== undefined) {
      const difference = totalCopies - book.totalCopies;
      book.totalCopies = totalCopies;
      book.availableCopies = book.availableCopies + difference;
    }

    const updatedBook = await book.save();
    res.json(updatedBook);
  } else {
    res.status(404).json({ message: 'Book not found' });
  }
};

// @desc    Delete a book
// @route   DELETE /api/books/:id
// @access  Private/Admin
const deleteBook = async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (book) {
    await book.deleteOne();
    res.json({ message: 'Book removed' });
  } else {
    res.status(404).json({ message: 'Book not found' });
  }
};

export { getBooks, addBook, updateBook, deleteBook };
