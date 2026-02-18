import mongoose from 'mongoose';

const issuedBookSchema = mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  issueDate: { type: Date, required: true },
  dueDate: { type: Date, required: true },
  returnDate: { type: Date },
  status: { type: String, enum: ['Issued', 'Returned'], default: 'Issued' },
  fineAmount: { type: Number, default: 0 },
}, { timestamps: true });

const IssuedBook = mongoose.model('IssuedBook', issuedBookSchema);
export default IssuedBook;
