import { Link } from 'react-router-dom';
import { Mail, MapPin, Globe } from 'lucide-react';
import mwefLogo from '@/assets/mwef-logo.png';

export const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="section-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <img src={mwefLogo} alt="MWEF Logo" className="h-12 w-auto" />
              <span className="font-bold text-xl">MWEF</span>
            </Link>
            <p className="text-white/70 text-sm leading-relaxed">
              Model World Economic Forum — Dubai's premier economics competition where students design real-world economic solutions.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4 text-accent">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { name: 'About MWEF', path: '/about' },
                { name: 'Committees', path: '/committees' },
                { name: 'Conference Structure', path: '/conference' },
                { name: 'Register', path: '/register' },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-white/70 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-lg mb-4 text-accent">Resources</h4>
            <ul className="space-y-2">
              {[
                { name: 'Delegate Resources', path: '/resources' },
                { name: 'Countries & Institutions', path: '/countries' },
                { name: 'Get Involved', path: '/get-involved' },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-white/70 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-lg mb-4 text-accent">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-white/70 text-sm">
                <Mail size={16} className="text-accent" />
                <span>info@mwef.org</span>
              </li>
              <li className="flex items-center gap-3 text-white/70 text-sm">
                <MapPin size={16} className="text-accent" />
                <span>Dubai, UAE</span>
              </li>
              <li className="flex items-center gap-3 text-white/70 text-sm">
                <Globe size={16} className="text-accent" />
                <span>www.mwef.org</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6 text-sm">
            <Link to="/privacy" className="text-white/50 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-white/50 hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center">
          <p className="text-gray-400 text-xs sm:text-sm">
            © {new Date().getFullYear()} Model World Economic Forum. All rights reserved.
          </p>
          <p className="text-xs sm:text-sm">
            Made by <a href="https://anshgupta.site" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Ansh Gupta</a>
          </p>
        </div>
      </div>
    </footer>
  );
};
