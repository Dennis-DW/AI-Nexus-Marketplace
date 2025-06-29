import { motion } from 'framer-motion';
import { Shield, Eye, Lock, Users, FileText, AlertCircle } from 'lucide-react';

export default function Privacy() {
  const sections = [
    {
      id: 'information-collection',
      title: 'Information We Collect',
      icon: Eye,
      content: [
        {
          subtitle: 'Personal Information',
          text: 'We collect information you provide directly to us, such as when you create an account, update your profile, or contact us for support. This may include your name, email address, wallet address, and any other information you choose to provide.'
        },
        {
          subtitle: 'Usage Information',
          text: 'We automatically collect certain information about your use of our platform, including your IP address, browser type, operating system, referring URLs, access times, and pages viewed.'
        },
        {
          subtitle: 'Blockchain Data',
          text: 'As a blockchain-based platform, certain information about your transactions is publicly available on the blockchain. This includes wallet addresses, transaction amounts, and smart contract interactions.'
        }
      ]
    },
    {
      id: 'information-use',
      title: 'How We Use Your Information',
      icon: Users,
      content: [
        {
          subtitle: 'Platform Operations',
          text: 'We use your information to provide, maintain, and improve our services, process transactions, and communicate with you about your account and our services.'
        },
        {
          subtitle: 'Security and Fraud Prevention',
          text: 'We use your information to detect, prevent, and address fraud, security issues, and other harmful or illegal activity.'
        },
        {
          subtitle: 'Analytics and Improvements',
          text: 'We analyze usage patterns to understand how our platform is used and to improve our services and user experience.'
        }
      ]
    },
    {
      id: 'information-sharing',
      title: 'Information Sharing',
      icon: FileText,
      content: [
        {
          subtitle: 'Service Providers',
          text: 'We may share your information with third-party service providers who perform services on our behalf, such as hosting, analytics, and customer support.'
        },
        {
          subtitle: 'Legal Requirements',
          text: 'We may disclose your information if required by law, regulation, legal process, or governmental request.'
        },
        {
          subtitle: 'Business Transfers',
          text: 'In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.'
        }
      ]
    },
    {
      id: 'data-security',
      title: 'Data Security',
      icon: Lock,
      content: [
        {
          subtitle: 'Security Measures',
          text: 'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.'
        },
        {
          subtitle: 'Encryption',
          text: 'We use industry-standard encryption to protect sensitive data both in transit and at rest.'
        },
        {
          subtitle: 'Access Controls',
          text: 'We limit access to your personal information to employees and contractors who need it to perform their job functions.'
        }
      ]
    },
    {
      id: 'your-rights',
      title: 'Your Rights',
      icon: Shield,
      content: [
        {
          subtitle: 'Access and Correction',
          text: 'You have the right to access, update, or correct your personal information. You can do this through your account settings or by contacting us.'
        },
        {
          subtitle: 'Data Portability',
          text: 'You have the right to request a copy of your personal information in a structured, machine-readable format.'
        },
        {
          subtitle: 'Deletion',
          text: 'You have the right to request deletion of your personal information, subject to certain legal and contractual obligations.'
        }
      ]
    },
    {
      id: 'cookies',
      title: 'Cookies and Tracking',
      icon: AlertCircle,
      content: [
        {
          subtitle: 'Cookie Usage',
          text: 'We use cookies and similar tracking technologies to collect information about your browsing activities and to provide personalized content and advertisements.'
        },
        {
          subtitle: 'Cookie Control',
          text: 'You can control cookies through your browser settings. However, disabling cookies may affect the functionality of our platform.'
        },
        {
          subtitle: 'Third-Party Tracking',
          text: 'We may use third-party analytics services that use cookies and similar technologies to collect information about your use of our platform.'
        }
      ]
    }
  ];

  const lastUpdated = 'January 15, 2024';

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
            <Shield className="h-16 w-16 text-blue-600 mx-auto mb-6" />
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="text-gray-900">Privacy </span>
              <span className="gradient-text">Policy</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto">
              Your privacy is important to us. This policy explains how we collect, use, and protect your information.
            </p>
            <div className="text-gray-600">
              Last updated: {lastUpdated}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Introduction */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="card p-8 mb-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
            <p className="text-gray-600 mb-4">
              AI Nexus ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our decentralized AI marketplace platform.
            </p>
            <p className="text-gray-600">
              By using our platform, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, do not use our platform.
            </p>
          </motion.div>

          {/* Policy Sections */}
          <div className="space-y-8">
            {sections.map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card p-8"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <section.icon className="h-8 w-8 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
                </div>
                
                <div className="space-y-6">
                  {section.content.map((item, itemIndex) => (
                    <div key={itemIndex}>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.subtitle}</h3>
                      <p className="text-gray-600 leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="card p-8 mt-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-600 mb-4">
              If you have any questions about this Privacy Policy or our privacy practices, please contact us:
            </p>
            <div className="space-y-2 text-gray-600">
              <p>Email: privacy@ainexus.com</p>
              <p>Address: 123 Blockchain Street, Crypto City, CC 12345</p>
              <p>Phone: +1 (555) 123-4567</p>
            </div>
          </motion.div>

          {/* Updates Notice */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="card p-8 mt-8 bg-blue-50 border-blue-200"
          >
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-6 w-6 text-blue-600 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Policy Updates</h3>
                <p className="text-blue-800">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}