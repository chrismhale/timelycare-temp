import React from 'react';

const Footer: React.FC = () => (
  <footer className="bg-gray-100 mt-12 py-6 border-t">
    <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-sm text-gray-600 space-y-3 md:space-y-0">
      <span>&copy; {new Date().getFullYear()} ProperView. All rights reserved.</span>
    </div>
  </footer>
);

export default Footer; 