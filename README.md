# Live Polling System

Implemented a live polling system where a teacher can create polls and students can join and vote in real time. The system keeps state across the refreshes and late joins and will also ensure that single vote per student per poll is made and uses the server as the source of truth for timers and vote counts.

## Features

### Teacher (Admin)
- Create polls with multiple options and configurable timer (up to 60s).
- Live dashboard with real-time vote percentages and counts.
- Poll history in DB with final results.
- Kick a student from the session (``optional feature``).
- Real-time chat with students (``bonus feature`` ).
- Can only ask a new question if none is active or all students answered the previous one.

### Student (User)
-   Enter a unique name on first visit and unique per browser tab/session.
-   Receive questions instantly when teacher creates a poll.
-   Late join starts timer from remaining time.
-   Submit vote within time limit (max 60s).
-   Can View live results after submitting.
-   Chat with teacher &students .

### System Behavior 
-   State recovery after page refresh (fetches current poll state from backend and resumes UI).
-   Race condition prevented.
-   Database persistence for polls, options, votes, students and chat messages.


## Tech Stack

- *Frontend*: React.js + TypeScript, Vite, Zustand (state management)
- *Backend*: Node.js, Express, TypeScript
- *Real-time*: Socket.io
- *Database*: MongoDB with Mongoose

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
### Teacher flow
1.  Open the app and choose Teacher.
2.  Create a poll by providing Question text, Options (2+) , Duration (seconds, max 60).
3.  Press Start Poll. The server starts the authoritative timer and broadcasts poll:new.
4.  Watch the live dashboard update as students vote.
5.  After the timer ends or all students answer, results are finalized and stored in DB.
6.  Access poll history page for list of past polls and final aggregates.
### Student flow
1.  Open and choose Student.
2.  Enter a unique display name for that browser tab/session.
3.  Wait for teacher to start a poll. When poll:new arrives, the UI shows the question and a synchronized timer.
4.  Submit vote once. The client prevents multiple votes UI-side, and server enforces single-vote server-side.
5.  After voting or when time expires, see the live results view.


## Architecture

### Backend
- *Separation of Concerns*: Socket handlers delegate to services
- *Services*: Business logic in PollService, VoteService, etc.
- *Models*: Mongoose schemas for data persistence
- *Error Handling*: Graceful handling of database errors

### Frontend
- *Custom Hooks*: useSocket for socket operations, usePollTimer for timer logic
- *State Management*: Zustand with persistence for user data
- *Component Architecture*: Reusable components in common/ folder

## API Events (Socket.io)

### Teacher Events
- poll:create - Create a new poll
- poll:history - Get poll history
- student:kick - Remove a student

### Student Events
- student:register - Register with name
- vote:submit - Submit a vote

### Common Events
- poll:getCurrent - Get current poll state (for recovery)
- chat:send - Send a chat message

### Server Events
- poll:new - New poll created
- poll:results - Updated results
- poll:ended - Poll has ended
- timer:update - Timer tick
- students:list - Updated student list
- chat:message - New chat message



## Manual Tests Done
1.  `Single teacher, multiple students:` one teacher and multiple student tabs; created poll; verified votes update in real-time and final result is correct.
2.  `Late join:` started poll with 60s; Started a student tab after 10s; verified student timer shows ~50s.
3.  `Refresh recovery:` refreshed teacher or student tab mid-poll; verified UI recovers to current state and timer resumes.
4.  `Double-vote prevention:` attempted to vote twice from same session and from different tools; server rejected duplicate. Verified DB has single vote per { pollId, studentId }.
5.  `DB outage:` stopped MongoDB and attempt operations; verified that error handling is done correctly.

## Deployment

### Backend
Deploy to any Node.js hosting (Heroku, Railway, Render, etc.)

### Frontend
Deploy to any static hosting (Vercel, Netlify, etc.)

Update environment variables accordingly.


## Design Reference
•   Figma design: https://www.figma.com/design/uhinheFgWssbxvlI7wtf59/Intervue-Assigment--Poll-system?node-id=0-1&t=Y5

## License & Contact
-   License: MIT
-   Author / Maintainer: `Manjeet Kumar`
-   Contact Info:- +91-9140705127 |  manjeetkumar369423@gmail.com
