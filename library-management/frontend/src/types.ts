export interface Book {
  _id: string;
  name: string;
  author: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'Admin' | 'User';
}

export interface AuthUser extends User {
  token: string;
}

export interface IssuedBook {
  _id: string;
  bookId: Book;
  userId: User;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'Issued' | 'Returned';
  fineAmount?: number;
}
