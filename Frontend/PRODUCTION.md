# Timber CRM - Production Deployment Guide

## 🚀 Production Deployment Checklist

### 1. Environment Setup

#### Required Environment Variables
Create a `.env.production` file with the following variables:

```env
# API Configuration (using same backend for testing)
NEXT_PUBLIC_USE_MOCKS=false
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000

# Performance & Monitoring
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_ERROR_REPORTING=true

# Security (disabled for testing)
NEXT_PUBLIC_ENABLE_HTTPS=false
```

### 2. Pre-Deployment Steps

1. **Update API Configuration**
   - ✅ API URL is already configured for testing
   - Ensure your backend is running on `http://127.0.0.1:8000`
   - Verify all API endpoints are accessible

2. **Security Review**
   - Review and update CORS settings in your backend
   - Ensure authentication is working properly
   - Test all API endpoints

3. **Performance Optimization**
   - Run `npm run build` to check for any build issues
   - Review bundle size with `npm run analyze`
   - Optimize images and static assets

### 3. Deployment Options

#### Option A: Local Development (Current Setup)
```bash
# Start development server
npm run dev

# Or build and start production
npm run build
npm start
```

#### Option B: Docker (Recommended for Testing)
```bash
# Build and run with Docker
docker-compose up -d

# Or build manually
docker build -t timber-crm .
docker run -p 3000:3000 timber-crm
```

#### Option C: Vercel (For Production)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### 4. Server Configuration

#### Nginx Setup (Optional for Testing)
1. Copy `nginx.conf` to your server
2. Update the backend URL if needed
3. Restart nginx: `sudo systemctl restart nginx`

### 5. Testing Checklist

- [ ] All features work with current backend
- [ ] API endpoints respond correctly
- [ ] Authentication works properly
- [ ] Error handling works
- [ ] Loading states display correctly
- [ ] Mobile responsiveness tested
- [ ] Cross-browser compatibility verified

### 6. Current Configuration

#### Backend URL
- **Development**: `http://127.0.0.1:8000`
- **Testing**: `http://127.0.0.1:8000`
- **Production**: Update to your production API URL

#### Security Settings (Testing Mode)
- HTTPS: Disabled
- CSRF: Disabled
- CORS: Enabled
- Error Reporting: Optional

### 7. Quick Start for Testing

1. **Ensure Backend is Running**
   ```bash
   # Your backend should be running on port 8000
   curl http://127.0.0.1:8000/api/user/getusers
   ```

2. **Start Frontend**
   ```bash
   npm run dev
   # or
   npm run build && npm start
   ```

3. **Test Application**
   - Open `http://localhost:3000`
   - Test login functionality
   - Test lead management features
   - Verify error handling

### 8. Troubleshooting

#### Common Issues

**Backend Connection Issues**
```bash
# Check if backend is running
curl http://127.0.0.1:8000/api/user/getusers

# Check CORS settings in your backend
```

**Build Failures**
```bash
# Check for TypeScript errors
npm run type-check

# Check for linting errors
npm run lint

# Clear cache and rebuild
rm -rf .next
npm run build
```

**Docker Issues**
```bash
# Rebuild Docker image
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### 9. Next Steps for Production

When ready for production:

1. **Update API URL**
   ```env
   NEXT_PUBLIC_API_URL=https://your-production-api.com
   ```

2. **Enable Security Features**
   ```env
   NEXT_PUBLIC_ENABLE_HTTPS=true
   ```

3. **Set up SSL Certificates**
4. **Configure Domain**
5. **Set up Monitoring**

---

**Current Setup**: Testing with local backend
**Last Updated**: December 2024
**Version**: 1.0.0 