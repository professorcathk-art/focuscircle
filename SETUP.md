# FocusCircle Setup Guide

This guide will help you set up and run the FocusCircle application on your local machine.

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v8 or higher)
- **MongoDB** (v5 or higher)
- **Redis** (v6 or higher)

### Installing Prerequisites

#### macOS (using Homebrew)
```bash
# Install Node.js
brew install node

# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Install Redis
brew install redis
brew services start redis
```

#### Ubuntu/Debian
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Install Redis
sudo apt-get install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

## Quick Start

1. **Clone and navigate to the project:**
   ```bash
   cd focuscircle
   ```

2. **Run the startup script:**
   ```bash
   ./start.sh
   ```

   This script will:
   - Check prerequisites
   - Install dependencies
   - Create environment files from templates
   - Start both backend and frontend servers

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Manual Setup

If you prefer to set up manually:

### 1. Install Dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Configuration

#### Backend Environment
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your configuration:
```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/focuscircle
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# OpenAI API (Required for AI summarization)
OPENAI_API_KEY=your-openai-api-key-here

# Email Service (Optional - for email notifications)
SENDGRID_API_KEY=your-sendgrid-api-key-here
FROM_EMAIL=noreply@focuscircle.com

# CORS
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Content Processing
MAX_CONTENT_LENGTH=50000
SUMMARY_MAX_LENGTH=500
```

#### Frontend Environment
```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

### 3. Start the Application

#### Option 1: Start both servers together
```bash
# From the root directory
npm run dev
```

#### Option 2: Start servers separately
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

## API Keys Setup

### OpenAI API Key (Required)
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account and get your API key
3. Add it to `backend/.env` as `OPENAI_API_KEY`

### SendGrid API Key (Optional)
1. Go to [SendGrid](https://sendgrid.com/)
2. Create an account and get your API key
3. Add it to `backend/.env` as `SENDGRID_API_KEY`

## Database Setup

The application will automatically create the necessary database collections when you first run it. No manual database setup is required.

## Testing the Setup

1. **Start the application** using one of the methods above
2. **Open your browser** to http://localhost:3000
3. **Create an account** by clicking "Create a new account"
4. **Add a website** to track from the dashboard
5. **Wait for summaries** to be generated (this may take a few minutes)

## Troubleshooting

### Common Issues

#### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Make sure MongoDB is running:
```bash
# macOS
brew services start mongodb-community

# Ubuntu/Debian
sudo systemctl start mongod
```

#### Redis Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```
**Solution:** Make sure Redis is running:
```bash
# macOS
brew services start redis

# Ubuntu/Debian
sudo systemctl start redis-server
```

#### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:** Kill the process using the port:
```bash
# Find the process
lsof -ti:5000

# Kill the process
kill -9 <PID>
```

#### OpenAI API Error
```
Error: Invalid API key
```
**Solution:** Make sure you have a valid OpenAI API key in your `.env` file.

### Logs and Debugging

- **Backend logs:** Check the terminal where you started the backend server
- **Frontend logs:** Check the browser console (F12)
- **Database logs:** Check MongoDB logs in `/var/log/mongodb/mongod.log` (Linux) or use `brew services list` (macOS)

## Development

### Project Structure
```
focuscircle/
├── backend/          # Node.js/Express API server
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── middleware/
│   └── package.json
├── frontend/         # React.js web application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── services/
│   └── package.json
├── shared/           # Shared utilities and types
├── docs/             # Documentation
└── package.json      # Root package configuration
```

### Available Scripts

#### Root Level
- `npm run dev` - Start both frontend and backend
- `npm run install:all` - Install all dependencies
- `npm run build` - Build frontend for production
- `npm run test` - Run all tests
- `npm run lint` - Run linting

#### Backend
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run backend tests
- `npm run lint` - Run backend linting

#### Frontend
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run frontend tests
- `npm run lint` - Run frontend linting

## Production Deployment

For production deployment, you'll need to:

1. Set up a production MongoDB instance
2. Set up a production Redis instance
3. Configure environment variables for production
4. Set up a reverse proxy (nginx)
5. Use a process manager (PM2)
6. Set up SSL certificates
7. Configure domain and DNS

See the main README.md for more deployment details.

## Support

If you encounter any issues:

1. Check this troubleshooting guide
2. Review the logs for error messages
3. Ensure all prerequisites are installed and running
4. Verify your environment configuration
5. Check that all required API keys are set

For additional help, please refer to the main project documentation or create an issue in the project repository.
