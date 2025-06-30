import { motion } from 'framer-motion';
import { Brain, Users, Target, Award, Globe, Shield } from 'lucide-react';

export default function About() {
  const teamMembers = [
    {
      name: 'Dr. Sarah Chen',
      role: 'CEO & Co-Founder',
      image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=300',
      bio: 'Former AI Research Director at Google with 15+ years in machine learning and blockchain technology.',
    },
    {
      name: 'Alex Rodriguez',
      role: 'CTO & Co-Founder',
      image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=300',
      bio: 'Blockchain architect and smart contract specialist with expertise in decentralized systems.',
    },
    {
      name: 'Dr. Maria Santos',
      role: 'Head of AI Ethics',
      image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=300',
      bio: 'AI ethics researcher and policy advisor focused on responsible AI development.',
    },
    {
      name: 'David Kim',
      role: 'Lead Developer',
      image: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=300',
      bio: 'Full-stack developer specializing in Web3 applications and decentralized marketplaces.',
    },
  ];

  const values = [
    {
      icon: Shield,
      title: 'Security First',
      description: 'We prioritize the security of your AI models and transactions through advanced blockchain technology.',
    },
    {
      icon: Globe,
      title: 'Global Access',
      description: 'Breaking down barriers to make AI technology accessible to developers worldwide.',
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Building a thriving ecosystem where AI developers can collaborate and innovate together.',
    },
    {
      icon: Award,
      title: 'Quality Assurance',
      description: 'Maintaining high standards through community validation and transparent rating systems.',
    },
  ];

  const milestones = [
    { year: '2023', title: 'Company Founded', description: 'AI Nexus was established with a vision to democratize AI.' },
    { year: '2023', title: 'MVP Launch', description: 'Released the first version of our decentralized marketplace.' },
    { year: '2025', title: 'Smart Contracts', description: 'Deployed secure smart contracts for transparent transactions.' },
    { year: '2025', title: 'Community Growth', description: 'Reached 10,000+ developers and 1,000+ AI models.' },
  ];

  return (
    <div className="pt-20 min-h-screen">
      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="text-zinc-800">About </span>
              <span className="gradient-text">AI Nexus</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-500 mb-8 max-w-4xl mx-auto">
              We're building the future of AI model distribution through blockchain technology, 
              creating a decentralized ecosystem where innovation thrives.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-6">
                <span className="gradient-text">Our Mission</span>
              </h2>
              <p className="text-lg text-gray-500 mb-6">
                To democratize access to artificial intelligence by creating the world's first 
                truly decentralized marketplace for AI models. We believe that AI should be 
                accessible to everyone, not just large corporations.
              </p>
              <p className="text-lg text-gray-500">
                Through blockchain technology, we ensure transparent, secure, and fair 
                transactions while protecting intellectual property rights and fostering 
                innovation in the AI community.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <img
                src="https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="AI Technology"
                className="rounded-xl shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6">
              <span className="text-zinc-800">Our </span>
              <span className="gradient-text">Values</span>
            </h2>
            <p className="text-xl text-gray-500 max-w-3xl mx-auto">
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass rounded-xl p-6 text-center hover:bg-white/20 transition-all duration-300"
              >
                <div className="flex justify-center mb-4">
                  <value.icon className="h-12 w-12 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-zinc-800 mb-3">{value.title}</h3>
                <p className="text-gray-500">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6">
              <span className="text-zinc-800">Meet Our </span>
              <span className="gradient-text">Team</span>
            </h2>
            <p className="text-xl text-gray-500 max-w-3xl mx-auto">
              The brilliant minds behind AI Nexus
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass rounded-xl p-6 text-center hover:bg-white/20 transition-all duration-300"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-semibold text-zinc-800 mb-2">{member.name}</h3>
                <p className="text-blue-400 mb-3">{member.role}</p>
                <p className="text-gray-500 text-sm">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6">
              <span className="text-zinc-800">Our </span>
              <span className="gradient-text">Journey</span>
            </h2>
            <p className="text-xl text-gray-500 max-w-3xl mx-auto">
              Key milestones in our mission to revolutionize AI
            </p>
          </motion.div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500"></div>
            
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className={`relative flex items-center mb-12 ${
                  index % 2 === 0 ? 'justify-start' : 'justify-end'
                }`}
              >
                <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8' : 'pl-8'}`}>
                  <div className="glass rounded-xl p-6">
                    <div className="text-2xl font-bold text-blue-400 mb-2">{milestone.year}</div>
                    <h3 className="text-xl font-semibold text-zinc-800 mb-2">{milestone.title}</h3>
                    <p className="text-gray-500">{milestone.description}</p>
                  </div>
                </div>
                
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full border-4 border-white"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}