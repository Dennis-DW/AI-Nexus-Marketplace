require('dotenv').config();
const mongoose = require('mongoose');
const Model = require('../models/Model');
const User = require('../models/User');
const Purchase = require('../models/Purchase');
const Blog = require('../models/Blog');
const Contact = require('../models/Contact');
const Newsletter = require('../models/Newsletter');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-nexus-marketplace');
    console.log('📦 MongoDB Connected for seeding');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const sampleUsers = [
  {
    walletAddress: '0x742d35cc6bf8c4c2b8b8b8b8b8b8b8b8b8b8b8b8',
    username: 'AIResearcher',
    email: 'researcher@example.com',
    bio: 'AI researcher specializing in natural language processing and machine learning.',
    reputation: 95,
    isVerified: true
  },
  {
    walletAddress: '0x123d35cc6bf8c4c2b8b8b8b8b8b8b8b8b8b8b8b8',
    username: 'MLEngineer',
    email: 'engineer@example.com',
    bio: 'Machine learning engineer with 5+ years of experience in computer vision.',
    reputation: 87,
    isVerified: true
  },
  {
    walletAddress: '0x456d35cc6bf8c4c2b8b8b8b8b8b8b8b8b8b8b8b8',
    username: 'DataScientist',
    email: 'scientist@example.com',
    bio: 'Data scientist passionate about AI ethics and responsible AI development.',
    reputation: 92,
    isVerified: false
  }
];

const sampleModels = [
  {
    name: 'Advanced Language Model GPT-4 Clone',
    type: 'NLP',
    description: 'A powerful language model capable of understanding and generating human-like text with high accuracy and contextual awareness.',
    price: '0.5',
    fileHash: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    sellerAddress: '0x742d35cc6bf8c4c2b8b8b8b8b8b8b8b8b8b8b8b8',
    tags: ['nlp', 'language-model', 'gpt', 'text-generation'],
    category: 'NLP',
    downloads: 1247,
    rating: 4.8,
    totalRatings: 156
  },
  {
    name: 'Real-time Object Detection YOLO v8',
    type: 'Computer Vision',
    description: 'State-of-the-art object detection model optimized for real-time applications with high accuracy and low latency.',
    price: '0.3',
    fileHash: 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    sellerAddress: '0x123d35cc6bf8c4c2b8b8b8b8b8b8b8b8b8b8b8b8',
    tags: ['computer-vision', 'object-detection', 'yolo', 'real-time'],
    category: 'Computer Vision',
    downloads: 892,
    rating: 4.6,
    totalRatings: 98
  },
  {
    name: 'Music Generation AI Composer',
    type: 'Audio',
    description: 'AI model that generates original music compositions in various genres and styles with professional quality.',
    price: '0.4',
    fileHash: '567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234',
    sellerAddress: '0x456d35cc6bf8c4c2b8b8b8b8b8b8b8b8b8b8b8b8',
    tags: ['audio', 'music-generation', 'composer', 'ai-music'],
    category: 'Audio',
    downloads: 634,
    rating: 4.7,
    totalRatings: 73
  }
];

const samplePurchases = [
  {
    walletAddress: '0x789d35cc6bf8c4c2b8b8b8b8b8b8b8b8b8b8b8b8',
    sellerAddress: '0x742d35cc6bf8c4c2b8b8b8b8b8b8b8b8b8b8b8b8',
    contractModelId: 1,
    txHash: '0xabc123def456789abc123def456789abc123def456789abc123def456789abc1',
    priceInETH: '0.5',
    priceInUSD: 1250.50,
    blockNumber: 18500000,
    gasUsed: '21000',
    gasPrice: '20000000000',
    network: 'ethereum',
    transactionType: 'eth_purchase',
    status: 'confirmed'
  },
  {
    walletAddress: '0x987d35cc6bf8c4c2b8b8b8b8b8b8b8b8b8b8b8b8',
    sellerAddress: '0x123d35cc6bf8c4c2b8b8b8b8b8b8b8b8b8b8b8b8',
    contractModelId: 2,
    txHash: '0xdef456789abc123def456789abc123def456789abc123def456789abc123def2',
    priceInETH: '0.3',
    priceInUSD: 750.30,
    blockNumber: 18500001,
    gasUsed: '21000',
    gasPrice: '20000000000',
    network: 'ethereum',
    transactionType: 'eth_purchase',
    status: 'confirmed'
  }
];

const sampleBlogs = [
  {
    title: 'The Future of AI Model Marketplaces',
    slug: 'future-of-ai-model-marketplaces',
    excerpt: 'Exploring how decentralized marketplaces are revolutionizing the way AI models are shared and monetized.',
    content: `
# The Future of AI Model Marketplaces

The artificial intelligence landscape is rapidly evolving, and with it, the way we share, distribute, and monetize AI models. Decentralized marketplaces represent a paradigm shift that promises to democratize access to cutting-edge AI technology.

## The Current State

Traditional AI model distribution has been dominated by large tech companies and centralized platforms. This has created barriers for independent researchers and smaller organizations who want to share their innovations or access specialized models.

## Enter Decentralization

Blockchain technology and decentralized platforms are changing this dynamic by:

- **Removing intermediaries**: Direct peer-to-peer transactions
- **Ensuring ownership**: Immutable proof of model ownership
- **Global accessibility**: No geographical restrictions
- **Fair compensation**: Transparent revenue sharing

## Benefits for Developers

AI researchers and developers can now:
- Monetize their work directly
- Maintain intellectual property rights
- Reach a global audience
- Build reputation through transparent metrics

## The Road Ahead

As we look to the future, we can expect to see:
- More sophisticated model verification systems
- Integration with cloud computing platforms
- Advanced licensing mechanisms
- Community-driven quality assurance

The decentralized AI model marketplace is not just a technological advancement—it's a movement towards a more open, fair, and innovative AI ecosystem.
    `,
    author: {
      name: 'Dr. Sarah Chen',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
      bio: 'AI Research Director at TechForward Labs'
    },
    category: 'AI Technology',
    tags: ['blockchain', 'ai-marketplace', 'decentralization', 'future-tech'],
    featuredImage: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800',
    isPublished: true,
    isFeatured: true,
    views: 2847,
    likes: 156,
    readTime: 8,
    publishedAt: new Date('2024-01-15')
  },
  {
    title: 'Getting Started with Smart Contract Integration',
    slug: 'smart-contract-integration-guide',
    excerpt: 'A comprehensive guide to integrating smart contracts in your AI marketplace applications.',
    content: `
# Getting Started with Smart Contract Integration

Smart contracts are the backbone of decentralized applications, providing trustless execution of agreements between parties. In this guide, we'll explore how to integrate smart contracts into your AI marketplace applications.

## Prerequisites

Before diving into smart contract integration, ensure you have:
- Basic understanding of blockchain technology
- Familiarity with Solidity programming language
- Development environment set up (Hardhat, Truffle, or similar)
- Test network access (Sepolia, Goerli, etc.)

## Setting Up Your Environment

\`\`\`bash
npm install --save-dev hardhat
npx hardhat init
\`\`\`

## Writing Your First Contract

Here's a simple example of an AI model marketplace contract:

\`\`\`solidity
pragma solidity ^0.8.19;

contract AIModelMarketplace {
    struct Model {
        uint256 id;
        string name;
        uint256 price;
        address seller;
        bool active;
    }
    
    mapping(uint256 => Model) public models;
    uint256 public modelCount;
    
    function listModel(string memory _name, uint256 _price) public {
        modelCount++;
        models[modelCount] = Model(modelCount, _name, _price, msg.sender, true);
    }
}
\`\`\`

## Testing Your Contract

Always test your contracts thoroughly:

\`\`\`javascript
const { expect } = require("chai");

describe("AIModelMarketplace", function () {
  it("Should list a new model", async function () {
    const marketplace = await ethers.deployContract("AIModelMarketplace");
    await marketplace.listModel("Test Model", ethers.parseEther("0.1"));
    expect(await marketplace.modelCount()).to.equal(1);
  });
});
\`\`\`

## Deployment

Deploy your contract to a test network first:

\`\`\`bash
npx hardhat run scripts/deploy.js --network sepolia
\`\`\`

## Frontend Integration

Use libraries like ethers.js or web3.js to interact with your contract from the frontend:

\`\`\`javascript
const contract = new ethers.Contract(contractAddress, abi, signer);
const tx = await contract.listModel("My AI Model", ethers.parseEther("0.5"));
await tx.wait();
\`\`\`

## Best Practices

- Always use the latest Solidity version
- Implement proper access controls
- Add event logging for important actions
- Consider gas optimization
- Perform security audits

## Conclusion

Smart contract integration opens up new possibilities for decentralized AI marketplaces. Start with simple contracts and gradually add more complex features as you become more comfortable with the technology.
    `,
    author: {
      name: 'Alex Rodriguez',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
      bio: 'Blockchain Developer and Smart Contract Specialist'
    },
    category: 'Tutorials',
    tags: ['smart-contracts', 'solidity', 'blockchain', 'tutorial'],
    featuredImage: 'https://images.pexels.com/photos/5380664/pexels-photo-5380664.jpeg?auto=compress&cs=tinysrgb&w=800',
    isPublished: true,
    isFeatured: true,
    views: 1923,
    likes: 89,
    readTime: 12,
    publishedAt: new Date('2024-01-10')
  },
  {
    title: 'AI Ethics in Decentralized Marketplaces',
    slug: 'ai-ethics-decentralized-marketplaces',
    excerpt: 'Examining the ethical considerations and challenges in decentralized AI model marketplaces.',
    content: `
# AI Ethics in Decentralized Marketplaces

As AI technology becomes more accessible through decentralized marketplaces, we must carefully consider the ethical implications of democratizing artificial intelligence.

## The Double-Edged Sword

Decentralized AI marketplaces offer unprecedented access to AI technology, but this accessibility comes with both opportunities and risks:

### Opportunities
- **Democratization**: Smaller organizations can access advanced AI
- **Innovation**: Diverse perspectives drive creative solutions
- **Transparency**: Open-source models enable scrutiny
- **Competition**: Market forces drive quality improvements

### Risks
- **Misuse**: Malicious actors may exploit AI models
- **Bias**: Unvetted models may perpetuate harmful biases
- **Quality**: Lack of centralized oversight may compromise standards
- **Accountability**: Distributed responsibility complicates liability

## Ethical Frameworks

Several frameworks can guide ethical AI development in decentralized environments:

### 1. Transparency and Explainability
- Models should be documented with clear use cases
- Training data sources should be disclosed
- Limitations and biases should be acknowledged

### 2. Fairness and Non-discrimination
- Regular bias testing and mitigation
- Diverse training datasets
- Inclusive development teams

### 3. Privacy and Security
- Data protection by design
- Secure model distribution
- User consent and control

### 4. Accountability and Governance
- Clear responsibility chains
- Community-driven standards
- Dispute resolution mechanisms

## Community-Driven Solutions

The decentralized nature of these marketplaces enables community-driven ethical governance:

- **Reputation systems**: Track developer reliability
- **Peer review**: Community validation of models
- **Ethical guidelines**: Collectively developed standards
- **Reporting mechanisms**: Community-based oversight

## The Path Forward

Building ethical AI marketplaces requires:

1. **Multi-stakeholder collaboration**: Developers, users, ethicists, and regulators
2. **Continuous monitoring**: Ongoing assessment of ethical implications
3. **Adaptive governance**: Flexible frameworks that evolve with technology
4. **Education**: Raising awareness about ethical AI practices

## Conclusion

The future of AI depends on our ability to balance innovation with responsibility. Decentralized marketplaces offer a unique opportunity to build ethical AI systems from the ground up, with community involvement at every level.

By prioritizing ethics alongside innovation, we can create AI marketplaces that serve humanity's best interests while fostering technological advancement.
    `,
    author: {
      name: 'Dr. Maria Santos',
      avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150',
      bio: 'AI Ethics Researcher and Policy Advisor'
    },
    category: 'Research',
    tags: ['ai-ethics', 'decentralization', 'governance', 'responsibility'],
    featuredImage: 'https://images.pexels.com/photos/8439093/pexels-photo-8439093.jpeg?auto=compress&cs=tinysrgb&w=800',
    isPublished: true,
    isFeatured: false,
    views: 1456,
    likes: 78,
    readTime: 10,
    publishedAt: new Date('2024-01-08')
  }
];

const sampleNewsletterSubscribers = [
  {
    email: 'user1@example.com',
    preferences: {
      weeklyDigest: true,
      productUpdates: true,
      marketingEmails: false
    },
    source: 'website'
  },
  {
    email: 'user2@example.com',
    preferences: {
      weeklyDigest: true,
      productUpdates: false,
      marketingEmails: true
    },
    source: 'blog'
  }
];

const seedData = async () => {
  try {
    console.log('🌱 Starting data seeding...');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Model.deleteMany({}),
      Purchase.deleteMany({}),
      Blog.deleteMany({}),
      Contact.deleteMany({}),
      Newsletter.deleteMany({})
    ]);
    console.log('🗑️  Cleared existing data');

    // Seed users
    const users = await User.insertMany(sampleUsers);
    console.log(`👥 Seeded ${users.length} users`);

    // Seed models
    const models = await Model.insertMany(sampleModels);
    console.log(`🤖 Seeded ${models.length} AI models`);

    // Update purchases with actual model IDs
    const updatedPurchases = samplePurchases.map((purchase, index) => ({
      ...purchase,
      modelId: models[index % models.length]._id
    }));

    const purchases = await Purchase.insertMany(updatedPurchases);
    console.log(`💰 Seeded ${purchases.length} purchases`);

    // Seed blog posts
    const blogs = await Blog.insertMany(sampleBlogs);
    console.log(`📝 Seeded ${blogs.length} blog posts`);

    // Seed newsletter subscribers
    const newsletters = await Newsletter.insertMany(sampleNewsletterSubscribers);
    console.log(`📧 Seeded ${newsletters.length} newsletter subscribers`);

    console.log('✅ Data seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   AI Models: ${models.length}`);
    console.log(`   Purchases: ${purchases.length}`);
    console.log(`   Blog Posts: ${blogs.length}`);
    console.log(`   Newsletter Subscribers: ${newsletters.length}`);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    mongoose.connection.close();
    console.log('📦 Database connection closed');
  }
};

// Run seeding
connectDB().then(() => {
  seedData();
});