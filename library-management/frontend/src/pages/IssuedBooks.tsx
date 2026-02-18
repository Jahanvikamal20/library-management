import { useState } from 'react';
import { useLibrary } from '../context/LibraryContext';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import { Plus, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export function IssuedBooks() {
  const { books, users, issuedBooks, issueBook, returnBook } = useLibrary();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    bookId: '',
    userId: '',
    dueDate: '',
  });

  const isAdmin = user?.role === 'Admin';
  const availableBooks = books.filter(b => b.availableCopies > 0);

  const handleOpenModal = () => {
    const today = new Date();
    const twoWeeksLater = new Date(today);
    twoWeeksLater.setDate(today.getDate() + 14);

    setFormData({
      bookId: '',
      userId: '',
      dueDate: twoWeeksLater.toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ bookId: '', userId: '', dueDate: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await issueBook(formData.bookId, formData.userId, formData.dueDate);
    handleCloseModal();
  };

  const handleReturn = async (id: string) => {
    if (confirm('Mark this book as returned?')) {
      await returnBook(id);
    }
  };

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'Returned') return false;
    const today = new Date();
    const due = new Date(dueDate);
    return due < today;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {isAdmin ? 'Issued Books' : 'My History'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isAdmin ? 'Track book issues and returns' : 'View your borrowing history'}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Issue Book
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Book Name
                </th>
                {isAdmin && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issue Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fine
                </th>
                {isAdmin && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {issuedBooks.map((issue) => {
                const book = issue.bookId;
                const issueUser = issue.userId;
                const overdue = isOverdue(issue.dueDate, issue.status);
                
                return (
                  <tr key={issue._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {book && typeof book === 'object' && 'name' in book ? book.name : 'Deleted Book'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {book && typeof book === 'object' && 'author' in book ? book.author : '-'}
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {issueUser && typeof issueUser === 'object' && 'name' in issueUser ? issueUser.name : 'Deleted User'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {issueUser && typeof issueUser === 'object' && 'email' in issueUser ? issueUser.email : '-'}
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">{new Date(issue.issueDate).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm flex items-center gap-1 ${overdue ? 'text-red-600' : 'text-gray-700'}`}>
                        {overdue && <AlertCircle size={16} />}
                        {new Date(issue.dueDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full ${
                          issue.status === 'Returned'
                            ? 'bg-green-100 text-green-800'
                            : overdue
                            ? 'bg-red-100 text-red-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {issue.status === 'Returned' ? (
                          <>
                            <CheckCircle size={14} />
                            Returned
                          </>
                        ) : overdue ? (
                          <>
                            <AlertCircle size={14} />
                            Overdue
                          </>
                        ) : (
                          <>
                            <Clock size={14} />
                            Issued
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">
                        {(issue.fineAmount || 0) > 0 ? `$${issue.fineAmount}` : '-'}
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {issue.status === 'Issued' && (
                          <button
                            onClick={() => handleReturn(issue._id)}
                            className="text-green-600 hover:text-green-900 px-3 py-1 rounded hover:bg-green-50 transition-colors"
                          >
                            Return
                          </button>
                        )}
                        {issue.status === 'Returned' && (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isAdmin && (
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Issue Book">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Book
              </label>
              <select
                required
                value={formData.bookId}
                onChange={(e) => setFormData({ ...formData, bookId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a book...</option>
                {availableBooks.map((book) => (
                  <option key={book._id} value={book._id}>
                    {book.name} - {book.author}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select User
              </label>
              <select
                required
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a user...</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} - {user.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleCloseModal}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Issue Book
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
