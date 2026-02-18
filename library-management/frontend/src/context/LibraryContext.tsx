import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Book, User, IssuedBook } from '../types';
import api from '../services/api';
import { useAuth } from './AuthContext';

interface LibraryContextType {
  books: Book[];
  users: User[];
  issuedBooks: IssuedBook[];
  addBook: (book: Omit<Book, '_id'>) => Promise<void>;
  updateBook: (id: string, book: Omit<Book, '_id'>) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
  addUser: (user: any) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  issueBook: (bookId: string, userId: string, dueDate: string) => Promise<void>;
  returnBook: (id: string) => Promise<void>;
  fetchBooks: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchIssuedBooks: () => Promise<void>;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [books, setBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [issuedBooks, setIssuedBooks] = useState<IssuedBook[]>([]);
  const { user } = useAuth();

  const fetchBooks = async () => {
    try {
      const { data } = await api.get('/books');
      setBooks(data);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchIssuedBooks = async () => {
    try {
      const { data } = await api.get('/issued-books');
      setIssuedBooks(data);
    } catch (error) {
      console.error('Error fetching issued books:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBooks();
      fetchUsers();
      fetchIssuedBooks();
    }
  }, [user]);

  const addBook = async (book: Omit<Book, '_id'>) => {
    try {
      const { data } = await api.post('/books', book);
      setBooks([...books, data]);
    } catch (error) {
      console.error('Error adding book:', error);
    }
  };

  const updateBook = async (id: string, book: Omit<Book, '_id'>) => {
    try {
      const { data } = await api.put(`/books/${id}`, book);
      setBooks(books.map(b => b._id === id ? data : b));
    } catch (error) {
      console.error('Error updating book:', error);
    }
  };

  const deleteBook = async (id: string) => {
    try {
      await api.delete(`/books/${id}`);
      setBooks(books.filter(b => b._id !== id));
    } catch (error) {
      console.error('Error deleting book:', error);
    }
  };

  const addUser = async (user: any) => {
    try {
      const { data } = await api.post('/users/register', user);
      setUsers([...users, data]);
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await api.delete(`/users/${id}`);
      setUsers(users.filter(u => u._id !== id));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const issueBook = async (bookId: string, userId: string, dueDate: string) => {
    try {
      const { data } = await api.post('/issued-books', { bookId, userId, dueDate });
      setIssuedBooks([...issuedBooks, data]);
      
      // Update local book state: decrement available copies
      setBooks(books.map(b => 
        b._id === bookId 
          ? { ...b, availableCopies: b.availableCopies - 1 } 
          : b
      ));
    } catch (error) {
      console.error('Error issuing book:', error);
    }
  };

  const returnBook = async (id: string) => {
    try {
      const { data } = await api.put(`/issued-books/${id}/return`);
      
      // Update issued book in list
      setIssuedBooks(issuedBooks.map(ib => ib._id === id ? data : ib));
      
      // Update local book state: increment available copies
      // Handle both populated object and ID string
      const bookId = typeof data.bookId === 'object' ? data.bookId._id : data.bookId;
      
      setBooks(books.map(b => 
        b._id === bookId 
          ? { ...b, availableCopies: b.availableCopies + 1 } 
          : b
      ));
    } catch (error) {
      console.error('Error returning book:', error);
    }
  };

  return (
    <LibraryContext.Provider value={{
      books,
      users,
      issuedBooks,
      addBook,
      updateBook,
      deleteBook,
      addUser,
      deleteUser,
      issueBook,
      returnBook,
      fetchBooks,
      fetchUsers,
      fetchIssuedBooks,
    }}>
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within LibraryProvider');
  }
  return context;
}
