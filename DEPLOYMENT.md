# FocusCircle Deployment Guide

This guide will help you deploy FocusCircle to Vercel with a full-stack setup.

## Architecture Overview

For production deployment, we'll use:
- **Frontend**: Vercel (React app)
- **Backend**: Vercel Serverless Functions (Node.js API)
- **Database**: MongoDB Atlas (cloud database)
- **Cache**: Redis Cloud (cloud Redis)
- **AI**: OpenAI API (external service)

## Prerequisites

1. **GitHub Account** ✅ (Already set up)
2. **Vercel Account** (Sign up at [vercel.com](https://vercel.com))
3. **MongoDB Atlas Account** (Sign up at [mongodb.com/atlas](https://mongodb.com/atlas))
4. **Redis Cloud Account** (Sign up at [redis.com/redis-enterprise-cloud](https://redis.com/redis-enterprise-cloud))
5. **OpenAI API Key** (Get from [platform.openai.com](https://platform.openai.com))

## Step 1: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://mongodb.com/atlas)
2. Create a new cluster (free tier available)
3. Create a database user
4. Whitelist your IP (use 0.0.0.0/0 for Vercel)
5. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/focuscircle`)

## Step 2: Set Up Redis Cloud

1. Go to [Redis Cloud](https://redis.com/redis-enterprise-cloud)
2. Create a new database (free tier available)
3. Get your connection string (looks like: `redis://username:password@host:port`)

## Step 3: Deploy Backend to Vercel

### Option A: Deploy Backend as Separate Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. **Important**: Set the root directory to `backend`
5. Configure environment variables:
   ```
   NODE_ENV=production
   MONGODB_URI=your_mongodb_atlas_connection_string
   REDIS_URL=your_redis_cloud_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   OPENAI_API_KEY=your_openai_api_key
   SENDGRID_API_KEY=your_sendgrid_api_key (optional)
   FROM_EMAIL=noreply@yourdomain.com
   FRONTEND_URL=https://your-frontend-domain.vercel.app
   ```
6. Deploy

### Option B: Deploy as Monorepo (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Set the root directory to the project root
5. Configure build settings:
   - **Build Command**: `cd frontend && npm run build`
   - **Output Directory**: `frontend/build`
   - **Install Command**: `npm run install:all`

## Step 4: Deploy Frontend to Vercel

1. Create a new Vercel project for the frontend
2. Set the root directory to `frontend`
3. Configure environment variables:
   ```
   REACT_APP_API_URL=https://your-backend-domain.vercel.app/api
   REACT_APP_ENV=production
   ```
4. Deploy

## Step 5: Configure Domain and CORS

1. Update your backend environment variables with the frontend URL
2. Update your frontend environment variables with the backend URL
3. Redeploy both projects

## Environment Variables Reference

### Backend (.env)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/focuscircle
REDIS_URL=redis://username:password@host:port
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
OPENAI_API_KEY=your-openai-api-key-here
SENDGRID_API_KEY=your-sendgrid-api-key-here
FROM_EMAIL=noreply@focuscircle.com
FRONTEND_URL=https://your-frontend-domain.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_CONTENT_LENGTH=50000
SUMMARY_MAX_LENGTH=500
```

### Frontend (.env)
```env
REACT_APP_API_URL=https://your-backend-domain.vercel.app/api
REACT_APP_ENV=production
```

## Quick Deploy Commands

### Deploy Backend Only
```bash
cd backend
vercel --prod
```

### Deploy Frontend Only
```bash
cd frontend
vercel --prod
```

### Deploy Both (from root)
```bash
vercel --prod
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure FRONTEND_URL in backend matches your frontend domain
2. **Database Connection**: Check MongoDB Atlas IP whitelist and connection string
3. **Redis Connection**: Verify Redis Cloud connection string
4. **Build Failures**: Check Node.js version compatibility (use 18.x)

### Vercel CLI Installation
```bash
npm i -g vercel
```

### Local Testing
```bash
# Test backend locally
cd backend
vercel dev

# Test frontend locally
cd frontend
vercel dev
```

## Production Checklist

- [ ] MongoDB Atlas cluster created and configured
- [ ] Redis Cloud database created
- [ ] OpenAI API key obtained
- [ ] Environment variables configured in Vercel
- [ ] CORS settings updated
- [ ] Domain configured (optional)
- [ ] SSL certificates working
- [ ] Error monitoring set up (optional)

## Monitoring and Analytics

Consider setting up:
- **Vercel Analytics**: Built-in performance monitoring
- **Sentry**: Error tracking
- **MongoDB Atlas Monitoring**: Database performance
- **OpenAI Usage Tracking**: API usage monitoring

## Cost Estimation

### Free Tier Limits
- **Vercel**: 100GB bandwidth, 100 serverless function executions
- **MongoDB Atlas**: 512MB storage, shared clusters
- **Redis Cloud**: 30MB storage
- **OpenAI**: Pay-per-use (very affordable for small apps)

### Scaling Considerations
- Monitor usage and upgrade plans as needed
- Consider implementing caching strategies
- Optimize AI API calls to reduce costs
- Use CDN for static assets

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test API endpoints manually
4. Check database connections
5. Review CORS configuration

For additional help, refer to:
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)
- [Redis Cloud Documentation](https://docs.redislabs.com)
