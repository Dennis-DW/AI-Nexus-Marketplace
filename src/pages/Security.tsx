import { motion } from 'framer-motion';
import { Shield, Lock, Eye, AlertTriangle, CheckCircle, Key, Server, Globe } from 'lucide-react';

export default function Security() {
  const securityFeatures = [
    {
      icon: Shield,
      title: 'Smart Contract Security',
      description: 'Our smart contracts are audited by leading security firms and implement industry best practices.',
      features: [
        'Multi-signature wallet integration',
        'Reentrancy protection',
        'Access control mechanisms',
        'Emergency pause functionality'
      ]
    },
    {
      icon: Lock,
      title: 'Data Encryption',
      description: 'All sensitive data is encrypted both in transit and at rest using industry-standard protocols.',
      features: [
        'AES-256 encryption for data at rest',
        'TLS 1.3 for data in transit',
        'End-to-end encryption for communications',
        'Secure key management'
      ]
    },
    {
      icon: Key,
      title: 'Authentication & Access',
      description: 'Multi-layered authentication ensures only authorized users can access your account.',
      features: [
        'Wallet-based authentication',
        'Two-factor authentication (2FA)',
        'Session management',
        'Role-based access control'
      ]
    },
    {
      icon: Server,
      title: 'Infrastructure Security',
      description: 'Our infrastructure is built with security-first principles and continuous monitoring.',
      features: [
        'DDoS protection',
        'Regular security updates',
        'Intrusion detection systems',
        'Automated backup systems'
      ]
    }
  ];

  const securityPractices = [
    {
      title: 'Regular Security Audits',
      description: 'We conduct comprehensive security audits quarterly with third-party security firms.',
      status: 'active'
    },
    {
      title: 'Bug Bounty Program',
      description: 'We reward security researchers who help us identify and fix vulnerabilities.',
      status: 'active'
    },
    {
      title: 'Incident Response Plan',
      description: 'We have a detailed incident response plan to quickly address any security issues.',
      status: 'active'
    },
    {
      title: 'Compliance Standards',
      description: 'We adhere to industry standards including SOC 2 Type II and ISO 27001.',
      status: 'active'
    }
  ];

  const securityTips = [
    {
      icon: Eye,
      title: 'Protect Your Wallet',
      tips: [
        'Never share your private keys or seed phrases',
        'Use hardware wallets for large amounts',
        'Verify transaction details before signing',
        'Keep your wallet software updated'
      ]
    },
    {
      icon: AlertTriangle,
      title: 'Recognize Phishing',
      tips: [
        'Always check the URL before connecting your wallet',
        'Be suspicious of urgent messages or offers',
        'Verify official communications through multiple channels',
        'Never enter your seed phrase on websites'
      ]
    },
    {
      icon: CheckCircle,
      title: 'Best Practices',
      tips: [
        'Enable two-factor authentication',
        'Use strong, unique passwords',
        'Regularly review your account activity',
        'Report suspicious activity immediately'
      ]
    }
  ];

  const certifications = [
    {
      name: 'SOC 2 Type II',
      description: 'Security, availability, and confidentiality controls',
      status: 'Certified'
    },
    {
      name: 'ISO 27001',
      description: 'Information security management system',
      status: 'In Progress'
    },
    {
      name: 'Smart Contract Audit',
      description: 'Third-party security audit by CertiK',
      status: 'Completed'
    },
    {
      name: 'Penetration Testing',
      description: 'Regular penetration testing by security experts',
      status: 'Quarterly'
    }
  ];

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
              <span className="text-gray-900">Security </span>
              <span className="gradient-text">First</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto">
              Your security is our top priority. Learn about the measures we take to protect your data and assets.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              <span className="gradient-text">Security</span> Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive security measures to protect your assets and data
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {securityFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card p-8"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <feature.icon className="h-8 w-8 text-blue-600" />
                  <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                </div>
                <p className="text-gray-600 mb-6">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.features.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Practices */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Security <span className="gradient-text">Practices</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our ongoing commitment to maintaining the highest security standards
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {securityPractices.map((practice, index) => (
              <motion.div
                key={practice.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{practice.title}</h3>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    {practice.status}
                  </span>
                </div>
                <p className="text-gray-600">{practice.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Tips */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Security <span className="gradient-text">Tips</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Best practices to keep your account and assets secure
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {securityTips.map((tip, index) => (
              <motion.div
                key={tip.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card p-6"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <tip.icon className="h-8 w-8 text-blue-600" />
                  <h3 className="text-xl font-semibold text-gray-900">{tip.title}</h3>
                </div>
                <ul className="space-y-3">
                  {tip.tips.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Certifications & <span className="gradient-text">Compliance</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We maintain industry-standard certifications and compliance
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {certifications.map((cert, index) => (
              <motion.div
                key={cert.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card p-6 text-center"
              >
                <Globe className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{cert.name}</h3>
                <p className="text-gray-600 text-sm mb-3">{cert.description}</p>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  cert.status === 'Certified' ? 'bg-green-100 text-green-800' :
                  cert.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {cert.status}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Security Team */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="card p-12 text-center"
          >
            <AlertTriangle className="h-16 w-16 text-amber-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Report Security Issues
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              If you discover a security vulnerability, please report it to our security team immediately.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-primary">
                Report Vulnerability
              </button>
              <button className="btn-secondary">
                Contact Security Team
              </button>
            </div>
            <div className="mt-6 text-gray-600">
              Email: security@ainexus.com | PGP Key Available
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}