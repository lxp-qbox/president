import React from 'react';
import { Shield, LogOut } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { adminLogout, checkAdminAuth } from '../../services/supabase';

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ title = 'The Presidential Agency' }) => {
  const navigate = useNavigate();
  const isAdmin = checkAdminAuth();

  const handleLogout = () => {
    adminLogout();
    navigate('/login');
  };

  return (
    <header className="bg-gradient-to-r from-blue-800 to-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <Shield className="w-8 h-8" />
          <h1 className="text-2xl font-bold">{title}</h1>
        </Link>
        
        {isAdmin && (
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-md transition-colors duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;