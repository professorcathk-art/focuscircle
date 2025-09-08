# FocusCircle

AI-powered news and website tracking platform that helps users efficiently monitor multiple websites and receive personalized, summarized updates.

## Features

- 🔍 **Website Tracking**: Monitor multiple websites with customizable frequency
- 🤖 **AI Summarization**: Get intelligent summaries using OpenAI GPT-5
- 📊 **Personalized Dashboard**: Clean interface with Tier 1/Tier 2 content classification
- 🔐 **Secure Authentication**: JWT-based auth with email verification
- 📱 **Responsive Design**: Works seamlessly across desktop, tablet, and mobile
- 🔔 **Smart Notifications**: Email and in-app notifications
- 📈 **Learning Algorithm**: Improves recommendations based on user feedback

## Tech Stack

### Backend
- Node.js with Express.js
- MongoDB for data storage
- Redis for caching
- OpenAI GPT-5 API for summarization
- JWT for authentication

### Frontend
- React.js with TypeScript
- Tailwind CSS for styling
- React Query for state management
- React Router for navigation

## Quick Start

1. **Install dependencies**:
   ```bash
   npm run install:all
   ```

2. **Set up environment variables**:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

3. **Start development servers**:
   ```bash
   npm run dev
   ```

4. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Project Structure

```
focuscircle/
├── backend/          # Node.js/Express API server
├── frontend/         # React.js web application
├── shared/           # Shared utilities and types
├── docs/             # Documentation
└── package.json      # Root package configuration
```

## Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/focuscircle
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-jwt-secret
OPENAI_API_KEY=your-openai-api-key
SENDGRID_API_KEY=your-sendgrid-api-key
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

## Development

- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build frontend for production
- `npm run test` - Run all tests
- `npm run lint` - Run linting for both frontend and backend

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details
