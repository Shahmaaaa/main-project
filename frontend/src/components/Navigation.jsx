import React from 'react';
import { Link } from 'react-router-dom';
import { FiMenu } from 'react-icons/fi';

export default function Navigation() {
  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          Block-Aid
        </Link>
        <div className="flex gap-6">
          <Link to="/" className="hover:text-blue-100 transition">
            Events
          </Link>
          <Link to="/create-event" className="hover:text-blue-100 transition">
            Report Event
          </Link>
        </div>
      </div>
    </nav>
  );
}
