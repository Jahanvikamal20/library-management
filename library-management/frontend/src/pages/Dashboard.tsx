import { useLibrary } from '../context/LibraryContext';
import { useAuth } from '../context/AuthContext';
import { BookOpen, BookMarked, BookCheck, Users, AlertCircle, DollarSign } from 'lucide-react';

export function Dashboard() {
  const { books, users, issuedBooks } = useLibrary();
  const { user } = useAuth();

  const isAdmin = user?.role === 'Admin';

  // Admin Stats
  const totalCopies = books.reduce((sum, book) => sum + (book.totalCopies || 0), 0);
  const availableCopies = books.reduce((sum, book) => sum + (book.availableCopies || 0), 0);
  const activeIssues = issuedBooks.filter(ib => ib.status === 'Issued').length;
  const totalUsers = users.length;

  // Student Stats
  // Note: For students, issuedBooks is already filtered by the backend to only show their own books
  const myIssuedBooks = issuedBooks; 
  const myActiveIssues = myIssuedBooks.filter(ib => ib.status === 'Issued').length;
  const myFines = myIssuedBooks.reduce((sum, ib) => sum + (ib.fineAmount || 0), 0);
  const dueSoon = myIssuedBooks.filter(ib => {
    if (ib.status !== 'Issued') return false;
    const dueDate = new Date(ib.dueDate);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  }).length;

  const stats = isAdmin ? [
    {
      title: 'Total Copies',
      value: totalCopies,
      icon: BookOpen,
      bgColor: 'bg-blue-500',
      iconColor: 'text-blue-500',
    },
    {
      title: 'Available Copies',
      value: availableCopies,
      icon: BookCheck,
      bgColor: 'bg-green-500',
      iconColor: 'text-green-500',
    },
    {
      title: 'Active Issues',
      value: activeIssues,
      icon: BookMarked,
      bgColor: 'bg-orange-500',
      iconColor: 'text-orange-500',
    },
    {
      title: 'Total Users',
      value: totalUsers,
      icon: Users,
      bgColor: 'bg-cyan-500',
      iconColor: 'text-cyan-500',
    },
  ] : [
    {
      title: 'My Active Issues',
      value: myActiveIssues,
      icon: BookMarked,
      bgColor: 'bg-blue-500',
      iconColor: 'text-blue-500',
    },
    {
      title: 'Due Soon',
      value: dueSoon,
      icon: AlertCircle,
      bgColor: 'bg-orange-500',
      iconColor: 'text-orange-500',
    },
    {
      title: 'My Fines',
      value: `$${myFines}`,
      icon: DollarSign,
      bgColor: 'bg-red-500',
      iconColor: 'text-red-500',
    },
    {
      title: 'Available Books',
      value: availableCopies,
      icon: BookCheck,
      bgColor: 'bg-green-500',
      iconColor: 'text-green-500',
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {isAdmin ? 'Admin Dashboard' : 'My Dashboard'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isAdmin ? 'Overview of library statistics' : 'Welcome back to your library portal'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} bg-opacity-10 p-3 rounded-lg`}>
                  <Icon className={stat.iconColor} size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            {isAdmin ? 'Recent Activity' : 'My Recent Activity'}
          </h2>
          <div className="space-y-3">
            {issuedBooks.slice(0, 5).map((issue) => {
              const book = issue.bookId;
              const issueUser = issue.userId;
              return (
                <div key={issue._id} className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{book?.name || 'Unknown Book'}</p>
                    {isAdmin && (
                      <p className="text-xs text-gray-500">Issued to {issueUser?.name || 'Unknown User'}</p>
                    )}
                    {!isAdmin && (
                      <p className="text-xs text-gray-500">Due: {new Date(issue.dueDate).toLocaleDateString()}</p>
                    )}
                  </div>
                  <span className={`px-3 py-1 text-xs rounded-full ${
                    issue.status === 'Issued'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {issue.status}
                  </span>
                </div>
              );
            })}
            {issuedBooks.length === 0 && (
              <p className="text-gray-500 text-sm">No recent activity found.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Book Categories</h2>
          <div className="space-y-3">
            {Array.from(new Set(books.map(b => b.category))).map((category) => {
              const count = books.filter(b => b.category === category).length;
              return (
                <div key={category} className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-700">{category}</span>
                  <span className="text-sm font-medium text-gray-800">{count} books</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
