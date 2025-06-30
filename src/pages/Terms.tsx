import { motion } from 'framer-motion';
import { FileText, Scale, AlertTriangle, Shield, Users, Gavel } from 'lucide-react';

export default function Terms() {
  const sections = [
    {
      id: 'acceptance',
      title: 'Acceptance of Terms',
      icon: FileText,
      content: [
        {
          subtitle: 'Agreement to Terms',
          text: 'By accessing and using AI Nexus, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.'
        },
        {
          subtitle: 'Modifications',
          text: 'We reserve the right to modify these terms at any time. Your continued use of the platform after any such changes constitutes your acceptance of the new terms.'
        }
      ]
    },
    {
      id: 'platform-description',
      title: 'Platform Description',
      icon: Users,
      content: [
        {
          subtitle: 'Service Overview',
          text: 'AI Nexus is a decentralized marketplace for artificial intelligence models, enabling developers to buy, sell, and trade AI models using blockchain technology.'
        },
        {
          subtitle: 'Blockchain Integration',
          text: 'Our platform utilizes smart contracts on the Ethereum blockchain to facilitate secure, transparent transactions between users.'
        }
      ]
    },
    {
      id: 'user-obligations',
      title: 'User Obligations',
      icon: Scale,
      content: [
        {
          subtitle: 'Account Responsibility',
          text: 'You are responsible for maintaining the confidentiality of your account and wallet information. You agree to accept responsibility for all activities that occur under your account.'
        },
        {
          subtitle: 'Prohibited Activities',
          text: 'You may not use our platform for any illegal activities, to infringe on intellectual property rights, or to distribute malicious software or harmful content.'
        },
        {
          subtitle: 'Content Standards',
          text: 'All AI models and content uploaded to our platform must comply with our content guidelines and applicable laws. You are solely responsible for the content you upload.'
        }
      ]
    },
    {
      id: 'intellectual-property',
      title: 'Intellectual Property',
      icon: Shield,
      content: [
        {
          subtitle: 'Your Content',
          text: 'You retain ownership of any AI models or content you upload to our platform. By uploading content, you grant us a license to display and distribute it through our platform.'
        },
        {
          subtitle: 'Platform Rights',
          text: 'The AI Nexus platform, including its design, features, and underlying technology, is protected by intellectual property laws and remains our property.'
        },
        {
          subtitle: 'Respect for Others',
          text: 'You agree to respect the intellectual property rights of other users and third parties. Any infringement may result in account termination.'
        }
      ]
    },
    {
      id: 'transactions',
      title: 'Transactions and Payments',
      icon: Gavel,
      content: [
        {
          subtitle: 'Blockchain Transactions',
          text: 'All transactions on our platform are processed through blockchain smart contracts. These transactions are irreversible once confirmed on the blockchain.'
        },
        {
          subtitle: 'Platform Fees',
          text: 'We charge a platform fee for each transaction. Fee structures are clearly displayed and may vary based on your subscription plan.'
        },
        {
          subtitle: 'Gas Fees',
          text: 'Users are responsible for paying blockchain gas fees associated with their transactions. These fees are paid directly to the blockchain network.'
        }
      ]
    },
    {
      id: 'disclaimers',
      title: 'Disclaimers and Limitations',
      icon: AlertTriangle,
      content: [
        {
          subtitle: 'Service Availability',
          text: 'We strive to maintain platform availability but cannot guarantee uninterrupted service. The platform may be unavailable due to maintenance, updates, or technical issues.'
        },
        {
          subtitle: 'Content Disclaimer',
          text: 'We do not verify the accuracy, completeness, or quality of AI models listed on our platform. Users purchase models at their own risk.'
        },
        {
          subtitle: 'Limitation of Liability',
          text: 'Our liability is limited to the maximum extent permitted by law. We are not liable for any indirect, incidental, or consequential damages.'
        }
      ]
    }
  ];

  const lastUpdated = 'January 15, 2025';

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
            <Scale className="h-16 w-16 text-blue-600 mx-auto mb-6" />
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="text-gray-900">Terms of </span>
              <span className="gradient-text">Service</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto">
              Please read these terms carefully before using our platform. They govern your use of AI Nexus.
            </p>
            <div className="text-gray-600">
              Last updated: {lastUpdated}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Terms Content */}
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
              Welcome to AI Nexus. These Terms of Service ("Terms") govern your use of our decentralized AI marketplace platform operated by AI Nexus Inc. ("Company," "we," "our," or "us").
            </p>
            <p className="text-gray-600">
              By accessing or using our platform, you agree to be bound by these Terms. If you disagree with any part of these terms, then you may not access the platform.
            </p>
          </motion.div>

          {/* Terms Sections */}
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

          {/* Termination */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="card p-8 mt-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Termination</h2>
            <p className="text-gray-600 mb-4">
              We may terminate or suspend your account and bar access to the platform immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including without limitation if you breach the Terms.
            </p>
            <p className="text-gray-600">
              Upon termination, your right to use the platform will cease immediately. If you wish to terminate your account, you may simply discontinue using the platform.
            </p>
          </motion.div>

          {/* Governing Law */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="card p-8 mt-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Governing Law</h2>
            <p className="text-gray-600 mb-4">
              These Terms shall be interpreted and governed by the laws of the State of Delaware, United States, without regard to its conflict of law provisions.
            </p>
            <p className="text-gray-600">
              Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
            </p>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="card p-8 mt-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
            <p className="text-gray-600 mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="space-y-2 text-gray-600">
              <p>Email: legal@ainexus.com</p>
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
            className="card p-8 mt-8 bg-amber-50 border-amber-200"
          >
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-6 w-6 text-amber-600 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-amber-900 mb-2">Changes to Terms</h3>
                <p className="text-amber-800">
                  We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}