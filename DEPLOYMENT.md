# AI Nexus Marketplace - Deployment Guide

This guide provides step-by-step instructions for deploying the AI Nexus Marketplace to production environments.

## 🚀 Prerequisites

### System Requirements
- **Node.js**: v18+ (LTS recommended)
- **MongoDB**: v5.0+ (local or cloud)
- **Git**: Latest version
- **PM2** (optional): For process management
- **Nginx** (optional): For reverse proxy

### Environment Setup
- **Domain**: Configured with SSL certificate
- **Environment Variables**: Properly configured
- **Database**: MongoDB instance ready
- **Blockchain**: Network RPC endpoints

## 📋 Pre-deployment Checklist

### Frontend
- [ ] Environment variables configured
- [ ] Build optimization completed
- [ ] Static assets optimized
- [ ] API endpoints updated
- [ ] Contract addresses verified

### Backend
- [ ] Environment variables set
- [ ] Database connection tested
- [ ] API endpoints secured
- [ ] CORS configuration updated
- [ ] Error handling implemented

### Smart Contracts
- [ ] Contracts compiled and tested
- [ ] Deployment scripts ready
- [ ] Contract addresses documented
- [ ] Verification completed
- [ ] Security audit passed

## 🌐 Frontend Deployment

### 1. Build for Production

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Test the build locally
npm run preview
```

### 2. Environment Configuration

Create `.env.production`:
```env
VITE_API_URL=https://api.ainexus.com
VITE_CONTRACT_ADDRESS=0x...
VITE_TOKEN_ADDRESS=0x...
VITE_CHAIN_ID=1
VITE_NETWORK=ethereum
```

### 3. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### 4. Deploy to Netlify

```bash
# Build the project
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=dist
```

### 5. Deploy to AWS S3 + CloudFront

```bash
# Build the project
npm run build

# Sync to S3
aws s3 sync dist/ s3://your-bucket-name

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

## 🔧 Backend Deployment

### 1. Environment Setup

Create `.env.production`:
```env
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-nexus-marketplace
FRONTEND_URL=https://ainexus.com
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGINS=https://ainexus.com,https://www.ainexus.com
```

### 2. Deploy to Heroku

```bash
# Install Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Login to Heroku
heroku login

# Create app
heroku create ainexus-backend

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set FRONTEND_URL=https://ainexus.com

# Deploy
git push heroku main
```

### 3. Deploy to DigitalOcean App Platform

```bash
# Create app specification
cat > .do/app.yaml << EOF
name: ainexus-backend
services:
- name: backend
  source_dir: /backend
  github:
    repo: username/ai-nexus-marketplace
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NODE_ENV
    value: production
  - key: MONGODB_URI
    value: your-mongodb-uri
  - key: FRONTEND_URL
    value: https://ainexus.com
EOF

# Deploy
doctl apps create --spec .do/app.yaml
```

### 4. Deploy to AWS EC2

```bash
# Connect to EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install Node.js and PM2
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install -g pm2

# Clone repository
git clone https://github.com/username/ai-nexus-marketplace.git
cd ai-nexus-marketplace/backend

# Install dependencies
npm install --production

# Set environment variables
cp .env.example .env
# Edit .env with production values

# Start with PM2
pm2 start index.js --name "ai-nexus-backend"
pm2 startup
pm2 save
```

## 🔗 Smart Contract Deployment

### 1. Deploy to Ethereum Mainnet

```bash
# Set environment variables
export PRIVATE_KEY=your-private-key
export ETHERSCAN_API_KEY=your-etherscan-key
export MAINNET_RPC_URL=your-mainnet-rpc

# Deploy contracts
npx hardhat run scripts/deploy-token-marketplace.js --network mainnet

# Verify contracts
npx hardhat verify --network mainnet DEPLOYED_CONTRACT_ADDRESS
```

### 2. Deploy to Polygon

```bash
# Set environment variables
export POLYGON_RPC_URL=your-polygon-rpc
export POLYGONSCAN_API_KEY=your-polygonscan-key

# Deploy contracts
npx hardhat run scripts/deploy-token-marketplace.js --network polygon

# Verify contracts
npx hardhat verify --network polygon DEPLOYED_CONTRACT_ADDRESS
```

### 3. Deploy to Arbitrum

```bash
# Set environment variables
export ARBITRUM_RPC_URL=your-arbitrum-rpc
export ARBISCAN_API_KEY=your-arbiscan-key

# Deploy contracts
npx hardhat run scripts/deploy-token-marketplace.js --network arbitrum

# Verify contracts
npx hardhat verify --network arbitrum DEPLOYED_CONTRACT_ADDRESS
```

## 🔒 Security Configuration

### 1. SSL/TLS Setup

```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d ainexus.com -d www.ainexus.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 2. Nginx Configuration

```nginx
server {
    listen 80;
    server_name ainexus.com www.ainexus.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ainexus.com www.ainexus.com;

    ssl_certificate /etc/letsencrypt/live/ainexus.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ainexus.com/privkey.pem;

    # Frontend
    location / {
        root /var/www/ainexus-frontend;
        try_files $uri $uri/ /index.html;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Firewall Configuration

```bash
# Configure UFW
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## 📊 Monitoring & Analytics

### 1. Application Monitoring

```bash
# Install monitoring tools
npm install -g pm2
pm2 install pm2-logrotate
pm2 install pm2-server-monit

# Configure monitoring
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

### 2. Database Monitoring

```bash
# MongoDB monitoring
# Enable MongoDB monitoring in your cloud provider
# Set up alerts for:
# - Connection count
# - Query performance
# - Storage usage
# - Error rates
```

### 3. Blockchain Monitoring

```bash
# Set up blockchain monitoring
# Monitor:
# - Transaction success rates
# - Gas prices
# - Contract events
# - Network congestion
```

## 🔄 CI/CD Pipeline

### 1. GitHub Actions

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: '18'
    - run: npm install
    - run: npm run build
    - run: npm run deploy

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: '18'
    - run: cd backend && npm install
    - run: cd backend && npm test
    - run: cd backend && npm run deploy
```

### 2. Automated Testing

```bash
# Run tests before deployment
npm run test:all

# Test coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

## 🚨 Post-deployment Checklist

### Frontend
- [ ] All pages load correctly
- [ ] Wallet connection works
- [ ] Transactions execute properly
- [ ] Analytics display correctly
- [ ] Mobile responsiveness verified

### Backend
- [ ] API endpoints respond correctly
- [ ] Database connections stable
- [ ] Error handling works properly
- [ ] Logging configured correctly
- [ ] Health checks pass

### Smart Contracts
- [ ] Contracts verified on block explorer
- [ ] Functions execute correctly
- [ ] Events emit properly
- [ ] Gas optimization confirmed
- [ ] Security measures active

### Monitoring
- [ ] Application monitoring active
- [ ] Error tracking configured
- [ ] Performance monitoring enabled
- [ ] Alerting system tested
- [ ] Backup systems verified

## 🆘 Troubleshooting

### Common Issues

1. **CORS Errors**
   ```bash
   # Check CORS configuration in backend
   # Verify frontend URL in environment variables
   ```

2. **Database Connection Issues**
   ```bash
   # Check MongoDB connection string
   # Verify network access
   # Check authentication credentials
   ```

3. **Smart Contract Deployment Failures**
   ```bash
   # Check gas prices
   # Verify private key
   # Ensure sufficient ETH for deployment
   ```

4. **Performance Issues**
   ```bash
   # Check database indexes
   # Monitor API response times
   # Optimize frontend bundle size
   ```

## 📞 Support

For deployment support:
- **Documentation**: [docs.ainexus.com](https://docs.ainexus.com)
- **Discord**: [Join our community](https://discord.gg/ainexus)
- **Email**: support@ainexus.com
- **Issues**: [GitHub Issues](https://github.com/ainexus/marketplace/issues)

---

**Last Updated**: January 2024  
**Version**: 1.0.0 