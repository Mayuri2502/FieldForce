# Deployment Guide
# FieldForce Pro - Field Sales Employee Tracking & Workforce Management SaaS Platform

**Version:** 1.0  
**Date:** December 2024  
**Environment:** Production

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Infrastructure Setup](#infrastructure-setup)
3. [Database Setup](#database-setup)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [Mobile App Deployment](#mobile-app-deployment)
7. [Monitoring & Logging](#monitoring--logging)
8. [Security Configuration](#security-configuration)
9. [Backup & Disaster Recovery](#backup--disaster-recovery)
10. [Troubleshooting](#troubleshooting)

---

## 1. Prerequisites

### 1.1 Software Requirements
- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **PostgreSQL**: 14.x or higher
- **Redis**: 7.x or higher
- **Git**: Latest version
- **Docker**: Latest version (optional)
- **Docker Compose**: Latest version (optional)

### 1.2 Cloud Provider Accounts
- **AWS/GCP/Azure**: For cloud infrastructure
- **Domain Name**: For custom domain
- **SSL Certificate**: For HTTPS
- **Twilio Account**: For SMS notifications
- **Firebase Project**: For push notifications
- **Stripe Account**: For payment processing
- **SendGrid Account**: For email notifications
- **Google Maps API Key**: For map functionality

### 1.3 Environment Variables
Create a `.env` file in the backend directory with the following variables:

```env
# Server Configuration
NODE_ENV=production
PORT=5000
API_URL=https://api.fieldforcepro.com
FRONTEND_URL=https://app.fieldforcepro.com

# Database Configuration
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=fieldforce_pro
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_DIALECT=postgres

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_REFRESH_EXPIRE=30d

# Redis Configuration
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# Email Configuration
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=your-sendgrid-username
SMTP_PASSWORD=your-sendgrid-password
SMTP_FROM=noreply@fieldforcepro.com

# SMS Configuration
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-phone

# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_CLIENT_EMAIL=your-firebase-client-email

# Google Maps Configuration
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Stripe Configuration
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# File Upload Configuration
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/jpg,image/png,application/pdf

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Geofence Configuration
DEFAULT_GEOFENCE_RADIUS=100
GEOFENCE_CHECK_INTERVAL=30000

# Attendance Configuration
ALLOWED_LATENESS_MINUTES=15
MIN_WORK_HOURS=8
SELFIE_VERIFICATION_ENABLED=true

# AI Configuration
FACE_RECOGNITION_API_KEY=your-face-recognition-api-key
AI_PRODUCTIVITY_ENABLED=true

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=/var/log/fieldforce-pro
```

---

## 2. Infrastructure Setup

### 2.1 AWS Deployment (Recommended)

#### 2.1.1 VPC Setup
```bash
# Create VPC
aws ec2 create-vpc --cidr-block 10.0.0.0/16 --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=fieldforce-pro-vpc}]'

# Create subnets
aws ec2 create-subnet --vpc-id <vpc-id> --cidr-block 10.0.1.0/24 --availability-zone us-east-1a
aws ec2 create-subnet --vpc-id <vpc-id> --cidr-block 10.0.2.0/24 --availability-zone us-east-1b

# Create internet gateway
aws ec2 create-internet-gateway --tag-specifications 'ResourceType=internet-gateway,Tags=[{Key=Name,Value=fieldforce-pro-igw}]'

# Attach internet gateway to VPC
aws ec2 attach-internet-gateway --vpc-id <vpc-id> --internet-gateway-id <igw-id>

# Create route table
aws ec2 create-route-table --vpc-id <vpc-id>

# Add route to internet gateway
aws ec2 create-route --route-table-id <route-table-id> --destination-cidr-block 0.0.0.0/0 --gateway-id <igw-id>
```

#### 2.1.2 RDS PostgreSQL Setup
```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier fieldforce-pro-db \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --engine-version 14.9 \
  --allocated-storage 100 \
  --master-username admin \
  --master-user-password <password> \
  --vpc-security-group-ids <sg-id> \
  --db-subnet-group-name <subnet-group> \
  --backup-retention-period 30 \
  --multi-az \
  --publicly-accessible false
```

#### 2.1.3 ElastiCache Redis Setup
```bash
# Create Redis cluster
aws elasticache create-replication-group \
  --replication-group-id fieldforce-pro-redis \
  --replication-group-description "FieldForce Pro Redis" \
  --cache-node-type cache.t3.medium \
  --engine redis \
  --engine-version 7.0 \
  --num-cache-clusters 2 \
  --automatic-failover-enabled \
  --security-group-ids <sg-id>
```

#### 2.1.4 EC2 Application Servers
```bash
# Create EC2 instances
aws ec2 run-instances \
  --image-id ami-0abcdef1234567890 \
  --instance-type t3.medium \
  --key-name fieldforce-pro-key \
  --security-group-ids <sg-id> \
  --subnet-id <subnet-id> \
  --user-data file://user-data.sh \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=fieldforce-pro-app}]'
```

#### 2.1.5 Load Balancer Setup
```bash
# Create Application Load Balancer
aws elbv2 create-load-balancer \
  --name fieldforce-pro-alb \
  --subnets <subnet-id-1> <subnet-id-2> \
  --security-groups <sg-id>

# Create target group
aws elbv2 create-target-group \
  --name fieldforce-pro-tg \
  --protocol HTTP \
  --port 5000 \
  --vpc-id <vpc-id>

# Register targets
aws elbv2 register-targets \
  --target-group-arn <tg-arn> \
  --targets Id=<instance-id-1>,Port=5000 Id=<instance-id-2>,Port=5000

# Create listener
aws elbv2 create-listener \
  --load-balancer-arn <alb-arn> \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=<cert-arn> \
  --default-actions Type=forward,TargetGroupArn=<tg-arn>
```

### 2.2 Docker Deployment (Alternative)

#### 2.2.1 Docker Compose Setup
Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - REDIS_HOST=redis
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
    restart: unless-stopped

  postgres:
    image: postgres:14-alpine
    environment:
      - POSTGRES_DB=fieldforce_pro
      - POSTGRES_USER=admin
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass password
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend
      - frontend
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

---

## 3. Database Setup

### 3.1 Database Initialization
```bash
# Connect to PostgreSQL
psql -h <db-host> -U <db-user> -d postgres

# Create database
CREATE DATABASE fieldforce_pro;

# Connect to database
\c fieldforce_pro

# Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

# Run schema
psql -h <db-host> -U <db-user> -d fieldforce_pro -f database/schema.sql
```

### 3.2 Database Migration
```bash
cd backend
npm run migrate
```

### 3.3 Database Seeding (Optional)
```bash
cd backend
npm run seed
```

---

## 4. Backend Deployment

### 4.1 Build Process
```bash
cd backend

# Install dependencies
npm ci --production

# Build TypeScript (if using TypeScript)
npm run build

# Run migrations
npm run migrate
```

### 4.2 PM2 Setup
```bash
# Install PM2 globally
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'fieldforce-pro-backend',
    script: './src/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G'
  }]
};
EOF

# Start application
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Setup PM2 startup script
pm2 startup
```

### 4.3 Nginx Configuration
```nginx
server {
    listen 80;
    server_name api.fieldforcepro.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.fieldforcepro.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

---

## 5. Frontend Deployment

### 5.1 Build Process
```bash
cd frontend

# Install dependencies
npm ci --production

# Build for production
npm run build

# The build output will be in the dist directory
```

### 5.2 Static File Serving with Nginx
```nginx
server {
    listen 80;
    server_name app.fieldforcepro.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name app.fieldforcepro.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    root /var/www/fieldforce-pro/frontend/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass https://api.fieldforcepro.com;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 5.3 CDN Setup (Optional)
```bash
# Upload build to S3
aws s3 sync dist/ s3://fieldforce-pro-frontend/ --delete

# Configure CloudFront distribution
aws cloudfront create-distribution \
  --default-cache-behavior TargetOriginId=S3-FieldForce-Pro,ViewerProtocolPolicy=redirect-to-https \
  --origins Id=S3-FieldForce-Pro,DomainName=fieldforce-pro-frontend.s3.amazonaws.com,CustomOriginConfig={HTTPPort=80,HTTPSPort=443,OriginProtocolPolicy=https-only}
```

---

## 6. Mobile App Deployment

### 6.1 iOS Deployment

#### 6.1.1 Build Configuration
Update `ios/FieldForcePro/Info.plist` with production settings:
- Bundle Identifier: `com.fieldforcepro.app`
- App Name: FieldForce Pro
- Version: 1.0.0

#### 6.1.2 Build for Production
```bash
cd mobile/ios

# Install dependencies
npm install

# Build for production
npx react-native run-ios --configuration Release

# Or use Xcode to archive and upload to App Store Connect
```

#### 6.1.3 App Store Submission
1. Create App Store Connect account
2. Create new app in App Store Connect
3. Upload build via Xcode or Transporter
4. Complete app information
5. Submit for review

### 6.2 Android Deployment

#### 6.2.1 Build Configuration
Update `android/app/build.gradle` with production settings:
- applicationId: `com.fieldforcepro.app`
- versionCode: 1
- versionName: "1.0.0"

#### 6.2.2 Build for Production
```bash
cd mobile/android

# Install dependencies
npm install

# Build APK for testing
./gradlew assembleRelease

# Build AAB for Play Store
./gradlew bundleRelease
```

#### 6.2.3 Play Store Submission
1. Create Google Play Console account
2. Create new app in Play Console
3. Upload AAB file
4. Complete store listing
5. Submit for review

---

## 7. Monitoring & Logging

### 7.1 Application Logging
```javascript
// Winston configuration for production
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: '/var/log/fieldforce-pro/error.log', level: 'error' }),
    new winston.transports.File({ filename: '/var/log/fieldforce-pro/combined.log' }),
    new winston.transports.Console({ format: winston.format.simple() })
  ]
});
```

### 7.2 CloudWatch Integration (AWS)
```bash
# Install CloudWatch agent
yum install amazon-cloudwatch-agent

# Configure CloudWatch
/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config \
  -m ec2 \
  -s \
  -c s3://fieldforce-pro-cloudwatch-config/amazon-cloudwatch-agent.json

# Start CloudWatch agent
/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -m ec2 -a start
```

### 7.3 New Relic / Datadog Integration (Optional)
```bash
# Install New Relic agent
npm install newrelic

# Configure newrelic.js
newrelic homeDir="/var/log/fieldforce-pro" license_key="your-license-key" app_name="FieldForce Pro"
```

### 7.4 Uptime Monitoring
- Use UptimeRobot or Pingdom for external monitoring
- Configure alerts for:
  - API endpoint availability
  - Response time thresholds
  - SSL certificate expiration
  - Domain expiration

---

## 8. Security Configuration

### 8.1 SSL/TLS Configuration
```bash
# Generate self-signed certificate (for testing)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/key.pem \
  -out /etc/nginx/ssl/cert.pem

# Use Let's Encrypt for production
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d api.fieldforcepro.com -d app.fieldforcepro.com
```

### 8.2 Firewall Configuration
```bash
# Configure security groups (AWS)
# Allow HTTP (80) from anywhere
aws ec2 authorize-security-group-ingress \
  --group-id <sg-id> \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0

# Allow HTTPS (443) from anywhere
aws ec2 authorize-security-group-ingress \
  --group-id <sg-id> \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0

# Allow SSH (22) from specific IP
aws ec2 authorize-security-group-ingress \
  --group-id <sg-id> \
  --protocol tcp \
  --port 22 \
  --cidr <your-ip>/32
```

### 8.3 Security Headers
```nginx
# Add to Nginx configuration
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' https:; img-src 'self' https: data:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:;" always;
```

### 8.4 Rate Limiting
```javascript
// Already configured in backend/src/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});
```

---

## 9. Backup & Disaster Recovery

### 9.1 Database Backups
```bash
# Automated daily backups (AWS RDS)
aws rds modify-db-instance \
  --db-instance-identifier fieldforce-pro-db \
  --backup-retention-period 30 \
  --backup-window 03:00-04:00

# Manual backup
aws rds create-db-snapshot \
  --db-instance-identifier fieldforce-pro-db \
  --db-snapshot-identifier fieldforce-pro-snapshot-$(date +%Y%m%d)
```

### 9.2 File Storage Backups
```bash
# Enable S3 versioning
aws s3api put-bucket-versioning \
  --bucket fieldforce-pro-uploads \
  --versioning-configuration Status=Enabled

# Enable S3 cross-region replication
aws s3api put-bucket-replication \
  --bucket fieldforce-pro-uploads \
  --replication-configuration file://replication-config.json
```

### 9.3 Disaster Recovery Plan
1. **RDS Multi-AZ**: Automatic failover in case of primary DB failure
2. **ElasticCache Multi-AZ**: Automatic failover for Redis
3. **Application Servers**: Use Auto Scaling Group with multiple instances
4. **Load Balancer**: Health checks to route traffic to healthy instances
5. **Backups**: Daily automated backups with 30-day retention
6. **Recovery Time Objective (RTO)**: 1 hour
7. **Recovery Point Objective (RPO)**: 15 minutes

---

## 10. Troubleshooting

### 10.1 Common Issues

#### Issue: Database Connection Failed
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection
psql -h <db-host> -U <db-user> -d fieldforce_pro

# Check logs
tail -f /var/log/postgresql/postgresql-14-main.log
```

#### Issue: High Memory Usage
```bash
# Check memory usage
free -h

# Check process memory
ps aux --sort=-%mem | head

# Restart application
pm2 restart fieldforce-pro-backend
```

#### Issue: Slow API Response
```bash
# Check database query performance
psql -d fieldforce_pro -c "SELECT * FROM pg_stat_activity WHERE state = 'active';"

# Kill long-running queries
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'active' AND query_start < now() - interval '5 minutes';
```

#### Issue: WebSocket Connection Failed
```bash
# Check Socket.IO configuration
# Ensure Socket.IO is running on the same port as Express
# Check firewall rules for WebSocket connections
```

### 10.2 Log Locations
- **Application logs**: `/var/log/fieldforce-pro/`
- **Nginx logs**: `/var/log/nginx/`
- **PostgreSQL logs**: `/var/log/postgresql/`
- **System logs**: `/var/log/syslog`

### 10.3 Health Checks
```bash
# API health check
curl https://api.fieldforcepro.com/health

# Database health check
psql -h <db-host> -U <db-user> -d fieldforce_pro -c "SELECT 1;"

# Redis health check
redis-cli -h <redis-host> -a <password> ping
```

---

## 11. Maintenance

### 11.1 Regular Maintenance Tasks
- **Daily**: Monitor logs, check error rates
- **Weekly**: Review performance metrics, check disk space
- **Monthly**: Review security updates, update dependencies
- **Quarterly**: Review backup strategy, disaster recovery testing

### 11.2 Dependency Updates
```bash
# Check for outdated packages
npm outdated

# Update packages
npm update

# Security audit
npm audit
npm audit fix
```

### 11.3 Database Maintenance
```sql
-- Vacuum and analyze tables
VACUUM ANALYZE users;
VACUUM ANALYZE attendance;
VACUUM ANALYZE tasks;

-- Reindex tables
REINDEX TABLE users;
REINDEX TABLE attendance;
```

---

## 12. Rollback Procedure

### 12.1 Application Rollback
```bash
# Rollback to previous version
pm2 deploy rollback

# Or manually
git checkout <previous-commit>
npm ci --production
npm run build
pm2 restart fieldforce-pro-backend
```

### 12.2 Database Rollback
```bash
# Restore from snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier fieldforce-pro-db-restored \
  --db-snapshot-identifier fieldforce-pro-snapshot-<date>
```

---

## 13. Performance Optimization

### 13.1 Database Optimization
```sql
-- Create indexes
CREATE INDEX idx_attendance_employee_date ON attendance(employee_id, date);
CREATE INDEX idx_tasks_assigned_status ON tasks(assigned_to, status);
CREATE INDEX idx_visits_employee_date ON visits(employee_id, scheduled_date);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM attendance WHERE employee_id = 'uuid' AND date = '2024-12-31';
```

### 13.2 Application Optimization
```javascript
// Enable caching
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 }); // 10 minutes

// Use connection pooling
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});
```

---

## 14. Support Contacts

### 14.1 Technical Support
- **Email**: support@fieldforcepro.com
- **Phone**: +1-800-FIELD-FORCE (Enterprise only)
- **Chat**: Available in app (Professional and Enterprise)

### 14.2 Emergency Contacts
- **On-Call Engineer**: oncall@fieldforcepro.com
- **Critical Issues**: critical@fieldforcepro.com

---

**Document Control**
- **Document Owner**: DevOps Team
- **Approval**: Pending
- **Distribution**: DevOps Team, Engineering Team
