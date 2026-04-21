import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  HomeIcon, 
  CalendarIcon, 
  UserGroupIcon,
  CurrencyDollarIcon, 
  BeakerIcon, QueueListIcon, MicroscopeIcon, MagnifyingGlassIcon,
  ChartBarIcon,
  ClockIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItems = () => {
    switch (user?.role) {
      case 'PATIENT':
        return [
          { name: 'Dashboard', path: '/patient', icon: HomeIcon },
          { name: 'Find Doctors', path: '/patient/search', icon: MagnifyingGlassIcon },
          { name: 'My Appointments', path: '/patient/appointments', icon: CalendarIcon },
        ];
      case 'DOCTOR':
        return [
          { name: 'Dashboard', path: '/doctor', icon: HomeIcon },
          { name: 'Availability', path: '/doctor/availability', icon: ClockIcon },
          { name: 'Appointments', path: '/doctor/appointments', icon: CalendarIcon },
        ];
      case 'ADMIN':
        return [
          { name: 'Dashboard', path: '/admin', icon: HomeIcon },
          { name: 'Create Doctor', path: '/admin/create-doctor', icon: UserGroupIcon },
          { name: 'Reports', path: '/admin/reports', icon: ChartBarIcon },
        ];
        case 'RECEPTIONIST':
  return [
    { name: 'Dashboard', path: '/receptionist', icon: HomeIcon },
    { name: 'Walk-in Reg', path: '/receptionist/register', icon: UserPlusIcon },
    { name: 'Book Appt', path: '/receptionist/book-appointment', icon: CalendarIcon },
    { name: 'Billing', path: '/receptionist/billing', icon: CurrencyDollarIcon },
    { name: 'Prescriptions', path: '/receptionist/prescriptions', icon: BeakerIcon },
    { name: 'Queue', path: '/receptionist/queue', icon: QueueListIcon },
    { name: 'Lab Tests', path: '/receptionist/lab-tests', icon: MicroscopeIcon },
    { name: 'Patient Search', path: '/receptionist/patients', icon: MagnifyingGlassIcon },
  ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and desktop navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-primary-600">
                Hospital App
              </h1>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition duration-200 ${
                    isActive(item.path)
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-2" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          
          {/* User info and logout - Desktop */}
          <div className="hidden sm:flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition duration-200"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-100 focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="sm:hidden bg-white border-t border-gray-200">
          <div className="pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center px-4 py-3 text-base font-medium ${
                  isActive(item.path)
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            ))}
            <div className="border-t border-gray-200 pt-4 pb-3">
              <div className="px-4">
                <p className="text-base font-medium text-gray-900">{user?.name}</p>
                <p className="text-sm font-medium text-gray-500">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="mt-3 w-full flex items-center px-4 py-3 text-base font-medium text-red-600 hover:text-red-800 hover:bg-red-50"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;