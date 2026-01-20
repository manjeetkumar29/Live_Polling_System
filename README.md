# Live Polling System

A resilient real-time polling system with two personas: Teacher and Student. Built with React, Node.js, Socket.io, and MongoDB.

## Features

### Teacher (Admin)
- ✅ Create polls with multiple options and configurable timer duration
- ✅ View real-time voting results as students submit
- ✅ View poll history from database
- ✅ Kick students from the polling session
- ✅ Real-time chat with students

### Student (User)
- ✅ Register with a unique name per session
- ✅ Receive questions in real-time when teacher creates a poll
- ✅ Timer synchronization (join late = see remaining time, not full time)
- ✅ Submit answers within time limit
- ✅ View live results after voting
- ✅ Chat with teacher and other students

### System Behavior (Resilience)
- ✅ State recovery on page refresh
- ✅ Race condition prevention (one vote per student per poll)
- ✅ Server-side timer as source of truth
- ✅ Database persistence for polls, votes, and chat

## Tech Stack

- **Frontend**: React.js with TypeScript, Vite, Zustand (state management)
- **Backend**: Node.js, Express, TypeScript
- **Real-time**: Socket.io
- **Database**: MongoDB with Mongoose

## Project Structure

```
Live_Polling_System/
├── Backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts
│   │   ├── models/
│   │   │   ├── Poll.ts
│   │   │   ├── Vote.ts
│   │   │   ├── Student.ts
│   │   │   ├── Message.ts
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   ├── PollService.ts
│   │   │   ├── VoteService.ts
│   │   │   ├── StudentService.ts
│   │   │   ├── ChatService.ts
│   │   │   └── index.ts
│   │   ├── socket/
│   │   │   ├── pollSocketHandler.ts
│   │   │   └── index.ts
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
│
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── poll/
│   │   │   ├── chat/
│   │   │   └── teacher/
│   │   ├── hooks/
│   │   │   ├── useSocket.ts
│   │   │   └── usePollTimer.ts
│   │   ├── pages/
│   │   │   ├── Welcome/
│   │   │   ├── TeacherDashboard/
│   │   │   ├── StudentRegister/
│   │   │   ├── StudentDashboard/
│   │   │   └── Kicked/
│   │   ├── services/
│   │   │   └── socketService.ts
│   │   ├── store/
│   │   │   └── useAppStore.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or MongoDB Atlas)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Live_Polling_System
   ```

2. **Install Backend Dependencies**
   ```bash
   cd Backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../Frontend
   npm install
   ```

4. **Configure Environment Variables**

   Backend (`.env`):
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/live_polling_system
   NODE_ENV=development
   ```

   Frontend (`.env`):
   ```
   VITE_SOCKET_URL=http://localhost:5000
   ```

### Running the Application

1. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

2. **Start Backend Server**
   ```bash
   cd Backend
   npm run dev
   ```

3. **Start Frontend Development Server**
   ```bash
   cd Frontend
   npm run dev
   ```

4. **Open the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## Usage

### As a Teacher
1. Go to the welcome page and select "I'm a Teacher"
2. Create a poll with a question, options, and duration
3. Watch real-time results as students vote
4. Use the chat feature to communicate with students
5. View poll history to see past results

### As a Student
1. Go to the welcome page and select "I'm a Student"
2. Enter your name to register
3. Wait for the teacher to create a poll
4. Answer the question within the time limit
5. View results after submitting
6. Use the chat feature to communicate

## Architecture

### Backend
- **Separation of Concerns**: Socket handlers delegate to services
- **Services**: Business logic in PollService, VoteService, etc.
- **Models**: Mongoose schemas for data persistence
- **Error Handling**: Graceful handling of database errors

### Frontend
- **Custom Hooks**: useSocket for socket operations, usePollTimer for timer logic
- **State Management**: Zustand with persistence for user data
- **Component Architecture**: Reusable components in common/ folder

## API Events (Socket.io)

### Teacher Events
- `poll:create` - Create a new poll
- `poll:history` - Get poll history
- `student:kick` - Remove a student

### Student Events
- `student:register` - Register with name
- `vote:submit` - Submit a vote

### Common Events
- `poll:getCurrent` - Get current poll state (for recovery)
- `chat:send` - Send a chat message

### Server Events
- `poll:new` - New poll created
- `poll:results` - Updated results
- `poll:ended` - Poll has ended
- `timer:update` - Timer tick
- `students:list` - Updated student list
- `chat:message` - New chat message

## Deployment

### Backend
Deploy to any Node.js hosting (Heroku, Railway, Render, etc.)

### Frontend
Deploy to any static hosting (Vercel, Netlify, etc.)

Update environment variables accordingly.

## License

MIT
