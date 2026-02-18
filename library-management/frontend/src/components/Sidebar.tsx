import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Users, BookMarked, X, History } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'User'] },
    { path: '/books', label: 'Books', icon: BookOpen, roles: ['Admin', 'User'] },
    { path: '/users', label: 'Users', icon: Users, roles: ['Admin'] },
    { 
      path: '/issued-books', 
      label: user?.role === 'Admin' ? 'Issued Books' : 'My History', 
      icon: user?.role === 'Admin' ? BookMarked : History, 
      roles: ['Admin', 'User'] 
    },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(user?.role || ''));

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-gray-800 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {user?.role === 'Admin' ? 'Library Admin' : 'Student Portal'}
          </h1>
          <p className="text-sm text-gray-400 mt-1">Management System</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        )}
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="text-xs text-gray-400">
          © 2024 Library System
        </div>
      </div>
    </div>
  );
}
