import mongoose from 'mongoose';

const bookSchema = mongoose.Schema({
  name: { type: String, required: true },
  author: { type: String, required: true },
  category: { type: String, required: true },
  totalCopies: { type: Number, required: true, default: 1 },
  availableCopies: { type: Number, required: true, default: 1 },
}, { timestamps: true });

const Book = mongoose.model('Book', bookSchema);
export default Book;
