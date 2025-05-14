import React from 'react';

const Footer: React.FC = () => {
  const year = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-100 py-4 border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 text-center text-gray-600">
        <p>&copy; {year} The Presidential Agency. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;