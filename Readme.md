# MessageApp

A real-time messaging application built with React Native, designed as a comprehensive learning project to explore modern mobile development technologies and patterns.

## 🎯 Project Goals

This project serves as a hands-on learning experience for several technologies:

- **Real-time Communication**: WebSocket integration with Elixir Phoenix
- **Authentication**: AWS Amplify with Cognito
- **Local Database**: WatermelonDB with RxJS Observables
- **State Management**: State Machines for predictable app behavior
- **Mobile Development**: React Native with TypeScript

## 🛠 Tech Stack

### Frontend
- **React Native** (0.74.5) - Cross-platform mobile development
- **TypeScript** - Type-safe JavaScript
- **Expo SDK** (~51.0.0) - Development platform and tools

### Real-time Communication
- **WebSockets** - Real-time bidirectional communication
- **Elixir Phoenix** - Backend WebSocket server
- **Phoenix Channels** - Real-time messaging infrastructure

### Authentication
- **AWS Amplify** - Cloud development platform
- **Amazon Cognito** - User authentication and authorization
- **JWT Tokens** - Secure authentication flow

### State Management
- **State Machines** - Predictable state transitions
- **XState** (planned) - State machine library
- **RxJS** - Reactive programming with Observables

### Local Database
- **WatermelonDB** - High-performance SQLite database
- **RxJS Observables** - Reactive data layer
- **Offline-first** - Local data persistence

## 🏗 Architecture Overview

```
┌─────────────────┐    WebSocket     ┌─────────────────┐
│                 │ ◄──────────────► │                 │
│  React Native   │                  │ Elixir Phoenix  │
│     Client      │                  │     Server      │
│                 │                  │                 │
└─────────────────┘                  └─────────────────┘
         │                                     │
         │ Authentication                      │
         ▼                                     │
┌─────────────────┐                           │
│                 │                           │
│  AWS Cognito    │ ◄─────────────────────────┘
│                 │      User Management
└─────────────────┘

Local Storage:
┌─────────────────┐    RxJS         ┌─────────────────┐
│                 │ ◄──────────────► │                 │
│  WatermelonDB   │   Observables   │  State Machine  │
│                 │                 │                 │
└─────────────────┘                 └─────────────────┘
```

## 🚀 Learning Objectives

### 1. WebSocket Communication
- Establish real-time connections with Phoenix Channels
- Handle connection states (connecting, connected, disconnected)
- Implement message sending/receiving
- Manage reconnection logic

### 2. AWS Amplify & Cognito
- User registration and login flows
- JWT token management
- Secure API calls with authentication headers
- User session persistence

### 3. WatermelonDB with RxJS
- Database schema design for messaging
- Reactive queries with Observables
- Offline-first data synchronization
- Performance optimization for large datasets

### 4. State Machines
- Model complex application states
- Handle authentication flows
- Manage WebSocket connection states
- Coordinate offline/online modes

## 📱 Features (Planned)

- [ ] User Authentication (Register/Login)
- [ ] Real-time messaging
- [ ] Message history persistence
- [ ] Offline message queuing
- [ ] User presence indicators
- [ ] Message delivery status
- [ ] Push notifications
- [ ] Message search functionality
- [ ] User profiles
- [ ] Chat rooms/channels

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator
- AWS Account (for Amplify/Cognito)
- Elixir/Phoenix backend (separate repository)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd MessageApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Add your AWS Amplify configuration
   ```

4. **Start the development server**
   ```bash
   npx expo start
   ```

### Backend Setup
This app requires an Elixir Phoenix backend with WebSocket support. See the backend repository for setup instructions.

## 🧪 Development Workflow

### State Machine Development
```bash
# Visualize state machines
npm run statemachine:visualize

# Test state transitions
npm run test:statemachine
```

### Database Management
```bash
# Reset WatermelonDB
npm run db:reset

# View database schema
npm run db:schema
```

### WebSocket Testing
```bash
# Test WebSocket connections
npm run test:websocket
```

## 📚 Learning Resources

### WebSockets & Phoenix
- [Phoenix Channels Guide](https://hexdocs.pm/phoenix/channels.html)
- [Real-time Communication Patterns](https://github.com/phoenixframework/phoenix)

### AWS Amplify & Cognito
- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [Amazon Cognito Developer Guide](https://docs.aws.amazon.com/cognito/)

### WatermelonDB & RxJS
- [WatermelonDB Documentation](https://watermelondb.dev/)
- [RxJS Operators Guide](https://rxjs.dev/guide/operators)

### State Machines
- [XState Documentation](https://xstate.js.org/)
- [State Machines in React](https://xstate.js.org/docs/recipes/react.html)

## 🗂 Project Structure

```
MessageApp/
├── src/
│   ├── components/           # Reusable UI components
│   ├── screens/             # App screens
│   ├── services/            # API and WebSocket services
│   ├── state/               # State machines and global state
│   ├── database/            # WatermelonDB models and schema
│   ├── utils/               # Utility functions
│   └── types/               # TypeScript type definitions
├── assets/                  # Images, fonts, etc.
├── docs/                    # Additional documentation
└── README.md
```

## 🤝 Contributing

This is a learning project, but contributions and suggestions are welcome! Please feel free to:

- Open issues for questions or discussion
- Submit PRs for improvements
- Share learning resources
- Provide feedback on architecture decisions

## 📝 Development Notes

### Current Status
- [x] Project setup with Expo and TypeScript
- [ ] WatermelonDB setup
- [ ] State machine design
- [ ] AWS Amplify configuration
- [ ] WebSocket service implementation
- [ ] UI/UX implementation

### Next Steps
1. Set up WatermelonDB schema 
2. Design and implement state machines
3. Set up AWS Amplify and Cognito
4. Implement WebSocket service
5. Build core messaging features

## 📄 License

This project is for educational purposes. Feel free to use and modify as needed for your own learning journey.

---

**Happy Learning! 🚀**

*This project represents a journey through modern mobile development technologies. Each commit is a step forward in understanding these tools and patterns.*