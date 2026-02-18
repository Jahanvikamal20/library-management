import IssuedBook from '../models/IssuedBook.js';
import Book from '../models/Book.js';
import User from '../models/User.js';

// @desc    Get all issued books
// @route   GET /api/issued-books
// @access  Private/Admin
const getIssuedBooks = async (req, res) => {
  try {
    let query = {};
    // If not admin, only show own issued books
    if (req.user.role !== 'Admin') {
      query = { userId: req.user._id };
    }

    const issuedBooks = await IssuedBook.find(query)
      .populate('bookId', 'name author')
      .populate('userId', 'name email');
    
    console.log('Issued Books Data:', JSON.stringify(issuedBooks, null, 2));
    res.json(issuedBooks);
  } catch (error) {
    console.error('Error fetching issued books:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Issue a book
// @route   POST /api/issued-books
// @access  Private/Admin
const issueBook = async (req, res) => {
  const { bookId, userId, dueDate } = req.body;

  const book = await Book.findById(bookId);

  if (!book) {
    res.status(404).json({ message: 'Book not found' });
    return;
  }

  if (book.availableCopies < 1) {
    res.status(400).json({ message: 'Book is not available' });
    return;
  }

  const issuedBook = new IssuedBook({
    bookId,
    userId,
    issueDate: Date.now(),
    dueDate,
    status: 'Issued',
  });

  const createdIssuedBook = await issuedBook.save();

  // Populate the returned object
  await createdIssuedBook.populate('bookId', 'name author');
  await createdIssuedBook.populate('userId', 'name email');

  // Update book availability
  book.availableCopies = book.availableCopies - 1;
  await book.save();

  res.status(201).json(createdIssuedBook);
};

// @desc    Return a book
// @route   PUT /api/issued-books/:id/return
// @access  Private/Admin
const returnBook = async (req, res) => {
  const issuedBook = await IssuedBook.findById(req.params.id);

  if (issuedBook) {
    issuedBook.returnDate = Date.now();
    issuedBook.status = 'Returned';

    // Calculate fine
    const dueDate = new Date(issuedBook.dueDate);
    const returnDate = new Date(issuedBook.returnDate);
    
    if (returnDate > dueDate) {
      const diffTime = Math.abs(returnDate - dueDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      issuedBook.fineAmount = diffDays * 5; // $5 per day fine
    }

    await issuedBook.save();

    // Update book availability
    const book = await Book.findById(issuedBook.bookId);
    if (book) {
      book.availableCopies = book.availableCopies + 1;
      await book.save();
    }

    res.json(issuedBook);
  } else {
    res.status(404).json({ message: 'Issued book record not found' });
  }
};

export { getIssuedBooks, issueBook, returnBook };
