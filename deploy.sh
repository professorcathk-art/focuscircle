#!/bin/bash

# FocusCircle Deployment Script
echo "🚀 FocusCircle Deployment Script"
echo "================================="

# Check if user is logged into Vercel
if ! npx vercel whoami > /dev/null 2>&1; then
    echo "⚠️  You need to login to Vercel first:"
    echo "   npx vercel login"
    echo ""
    echo "Then run this script again."
    exit 1
fi

echo "✅ Vercel authentication confirmed"

# Deploy backend
echo ""
echo "📦 Deploying Backend..."
cd backend
npx vercel --prod --yes
BACKEND_URL=$(npx vercel ls | grep focuscircle-backend | head -1 | awk '{print $2}')
echo "Backend deployed to: $BACKEND_URL"

# Deploy frontend
echo ""
echo "📦 Deploying Frontend..."
cd ../frontend
npx vercel --prod --yes
FRONTEND_URL=$(npx vercel ls | grep focuscircle-frontend | head -1 | awk '{print $2}')
echo "Frontend deployed to: $FRONTEND_URL"

echo ""
echo "🎉 Deployment Complete!"
echo "======================="
echo "Frontend: $FRONTEND_URL"
echo "Backend:  $BACKEND_URL"
echo ""
echo "📝 Next Steps:"
echo "1. Update environment variables in Vercel dashboard"
echo "2. Set up MongoDB Atlas and Redis Cloud"
echo "3. Configure CORS settings"
echo "4. Test your application"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"
