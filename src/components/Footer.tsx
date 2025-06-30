import { Brain, Github, Twitter, Disc as Discord } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const footerLinks = {
    Product: [
      { name: 'Marketplace', href: '/marketplace' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'Documentation', href: '/docs' }
    ],
    Company: [
      { name: 'About', href: '/about' },
      { name: 'Blog', href: '/blog' },
      { name: 'Contact', href: '/contact' }
    ],
    Resources: [
      { name: 'Documentation', href: '/docs' },
      { name: 'API Reference', href: '/docs' }
    ],
    Legal: [
      { name: 'Privacy', href: '/privacy' },
      { name: 'Terms', href: '/terms' },
      { name: 'Security', href: '/security' },
      { name: 'Cookies', href: '/cookies' }
    ],
  };

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Brain className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold gradient-text">AI Nexus</span>
            </div>
            <p className="text-black mb-6">
              The world's first decentralized marketplace for AI models. Buy, sell, and trade 
              cutting-edge AI solutions with complete ownership and transparency.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-black hover:text-blue-600 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-black hover:text-blue-600 transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-black hover:text-blue-600 transition-colors">
                <Discord className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-gray-900 font-semibold mb-4">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-black text-sm">
            © 2025 AI Nexus. All rights reserved.
          </p>
          <p className="text-black text-sm mt-4 md:mt-0">
            Built with ❤️ for the decentralized AI community
          </p>
        </div>
      </div>
    </footer>
  );
}