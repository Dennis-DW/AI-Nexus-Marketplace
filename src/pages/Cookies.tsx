import { motion } from 'framer-motion';
import { Cookie, Settings, Eye, Shield, ToggleLeft, ToggleRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { cookieAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function Cookies() {
  const { address } = useAccount();
  const [cookieSettings, setCookieSettings] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load cookie preferences on mount
  useEffect(() => {
    if (address) {
      loadCookiePreferences();
    }
  }, [address]);

  const loadCookiePreferences = async () => {
    if (!address) return;

    try {
      const response = await cookieAPI.getPreferences(address);
      if (response.success && response.data) {
        setCookieSettings({
          necessary: response.data.necessary,
          analytics: response.data.analytics,
          marketing: response.data.marketing,
          preferences: response.data.preferences,
        });
      }
    } catch (error) {
      console.error('Error loading cookie preferences:', error);
    }
  };

  const saveCookiePreferences = async (newSettings: typeof cookieSettings) => {
    if (!address) {
      toast.error('Please connect your wallet to save preferences');
      return;
    }

    setIsLoading(true);

    try {
      await cookieAPI.updatePreferences(address, newSettings);
      setCookieSettings(newSettings);
      toast.success('Cookie preferences saved successfully!');
    } catch (error) {
      console.error('Error saving cookie preferences:', error);
      toast.error('Failed to save cookie preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const cookieTypes = [
    {
      id: 'necessary',
      title: 'Necessary Cookies',
      description: 'These cookies are essential for the website to function properly. They enable core functionality such as security, network management, and accessibility.',
      examples: [
        'Authentication tokens',
        'Security tokens',
        'Load balancing',
        'Session management'
      ],
      required: true,
      icon: Shield
    },
    {
      id: 'analytics',
      title: 'Analytics Cookies',
      description: 'These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.',
      examples: [
        'Google Analytics',
        'Page view tracking',
        'User behavior analysis',
        'Performance monitoring'
      ],
      required: false,
      icon: Eye
    },
    {
      id: 'marketing',
      title: 'Marketing Cookies',
      description: 'These cookies are used to track visitors across websites to display relevant advertisements and marketing content.',
      examples: [
        'Advertisement targeting',
        'Social media integration',
        'Conversion tracking',
        'Retargeting pixels'
      ],
      required: false,
      icon: Cookie
    },
    {
      id: 'preferences',
      title: 'Preference Cookies',
      description: 'These cookies allow the website to remember choices you make and provide enhanced, more personal features.',
      examples: [
        'Language preferences',
        'Theme settings',
        'Layout preferences',
        'Accessibility settings'
      ],
      required: false,
      icon: Settings
    }
  ];

  const handleToggle = (cookieType: string) => {
    if (cookieType === 'necessary') return; // Can't disable necessary cookies
    
    const newSettings = {
      ...cookieSettings,
      [cookieType]: !cookieSettings[cookieType as keyof typeof cookieSettings]
    };
    
    setCookieSettings(newSettings);
  };

  const handleSaveSettings = () => {
    saveCookiePreferences(cookieSettings);
  };

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    saveCookiePreferences(allAccepted);
  };

  const handleRejectAll = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };
    saveCookiePreferences(onlyNecessary);
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Cookie className="h-16 w-16 text-blue-600 mx-auto mb-6" />
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="text-gray-900">Cookie </span>
              <span className="gradient-text">Settings</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto">
              Manage your cookie preferences to enhance your experience on AI Nexus.
            </p>
            {!address && (
              <p className="text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-2xl mx-auto">
                Connect your wallet to save your cookie preferences across devices.
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Cookie Information */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="card p-8 mb-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What Are Cookies?</h2>
            <p className="text-gray-600 mb-4">
              Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our platform.
            </p>
            <p className="text-gray-600">
              We use different types of cookies for various purposes, and you have control over which ones you want to accept. Below you can learn about each type and manage your preferences.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Cookie Types and Settings */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Cookie <span className="gradient-text">Preferences</span>
            </h2>
            <p className="text-gray-600">
              Customize your cookie preferences below. You can change these settings at any time.
            </p>
          </motion.div>

          <div className="space-y-6">
            {cookieTypes.map((cookie, index) => (
              <motion.div
                key={cookie.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <cookie.icon className="h-6 w-6 text-blue-600" />
                    <h3 className="text-xl font-semibold text-gray-900">{cookie.title}</h3>
                    {cookie.required && (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                        Required
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handleToggle(cookie.id)}
                    disabled={cookie.required}
                    className={`flex items-center ${cookie.required ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {cookieSettings[cookie.id as keyof typeof cookieSettings] ? (
                      <ToggleRight className="h-8 w-8 text-blue-600" />
                    ) : (
                      <ToggleLeft className="h-8 w-8 text-gray-400" />
                    )}
                  </button>
                </div>
                
                <p className="text-gray-600 mb-4">{cookie.description}</p>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Examples:</h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {cookie.examples.map((example, exampleIndex) => (
                      <li key={exampleIndex} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <span className="text-sm text-gray-600">{example}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center mt-12"
          >
            <button
              onClick={handleAcceptAll}
              disabled={isLoading}
              className="btn-primary disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Accept All Cookies'}
            </button>
            <button
              onClick={handleSaveSettings}
              disabled={isLoading}
              className="btn-secondary disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save My Settings'}
            </button>
            <button
              onClick={handleRejectAll}
              disabled={isLoading}
              className="btn-secondary disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Reject All (Except Necessary)'}
            </button>
          </motion.div>
        </div>
      </section>

      {/* Additional Information */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="card p-6"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Managing Cookies</h3>
              <p className="text-gray-600 mb-4">
                You can also manage cookies directly through your browser settings. Most browsers allow you to:
              </p>
              <ul className="space-y-2 text-gray-600">
                <li>• View and delete cookies</li>
                <li>• Block cookies from specific sites</li>
                <li>• Block third-party cookies</li>
                <li>• Clear all cookies when closing the browser</li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="card p-6"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Third-Party Cookies</h3>
              <p className="text-gray-600 mb-4">
                Some cookies are set by third-party services that appear on our pages:
              </p>
              <ul className="space-y-2 text-gray-600">
                <li>• Google Analytics for website analytics</li>
                <li>• Social media platforms for sharing</li>
                <li>• Payment processors for transactions</li>
                <li>• Customer support chat services</li>
              </ul>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="card p-8 mt-8"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Contact Us</h3>
            <p className="text-gray-600 mb-4">
              If you have any questions about our use of cookies or this Cookie Policy, please contact us:
            </p>
            <div className="space-y-2 text-gray-600">
              <p>Email: privacy@ainexus.com</p>
              <p>Address: 123 Blockchain Street, Crypto City, CC 12345</p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}