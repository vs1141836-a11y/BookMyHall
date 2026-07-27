import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 print:hidden">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <span className="text-2xl font-extrabold text-white tracking-tight">
              BookMyHall
            </span>
            <p className="mt-4 max-w-xs text-sm leading-6">
              India's premium multi-venue event booking & management platform. Explore, compare, customize, and secure your perfect venue instantly.
            </p>
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Features</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link to="/halls" className="hover:text-white transition-colors">Search Halls</Link>
              </li>
              <li>
                <Link to="/compare" className="hover:text-white transition-colors">Compare Venues</Link>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">Custom Packages</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Partners</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link to="/register?role=owner" className="hover:text-white transition-colors">List Your Hall</Link>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">Vendor Program</span>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">Resources</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-slate-800 pt-8 flex items-center justify-between text-xs">
          <p>&copy; {new Date().getFullYear()} BookMyHall. Built with clean code & premium design.</p>
          <div className="flex space-x-6">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
