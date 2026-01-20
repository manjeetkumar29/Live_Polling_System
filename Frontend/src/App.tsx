import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import {
  Welcome,
  TeacherDashboard,
  StudentRegister,
  StudentDashboard,
  Kicked,
} from './pages';
import './App.css';

function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/student/register" element={<StudentRegister />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/kicked" element={<Kicked />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
