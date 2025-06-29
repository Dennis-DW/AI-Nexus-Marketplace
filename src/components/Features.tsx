import { motion } from 'framer-motion';
import { Shield, Coins, Globe, Code, Zap, Users } from 'lucide-react';

export default function Features() {
  const features = [
    {
      icon: Shield,
      title: 'Decentralized Security',
      description: 'Your AI models are secured by blockchain technology with immutable ownership records.',
    },
    {
      icon: Coins,
      title: 'Crypto Payments',
      description: 'Seamless transactions using ETH and other cryptocurrencies with low fees.',
    },
    {
      icon: Globe,
      title: 'Global Marketplace',
      description: 'Access AI models from developers worldwide without geographical restrictions.',
    },
    {
      icon: Code,
      title: 'Easy Integration',
      description: 'Simple APIs and SDKs to integrate purchased models into your applications.',
    },
    {
      icon: Zap,
      title: 'Instant Deployment',
      description: 'Deploy and test AI models instantly with our cloud infrastructure.',
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Join a thriving community of AI developers and researchers.',
    },
  ];

  return (
    <section id="features" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="gradient-text">Why Choose</span>
            <span className="text-zinc-800"> AI Nexus?</span>
          </h2>
          <p className="text-xl text-gray-500 max-w-3xl mx-auto">
            Experience the future of AI model trading with cutting-edge Web3 technology
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="glass rounded-xl p-6 hover:bg-white/20 transition-all duration-300"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg mb-4">
                <feature.icon className="h-6 w-6 text-zinc-800" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-800 mb-3">{feature.title}</h3>
              <p className="text-gray-500">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}