import { Student, IStudent } from '../models';

interface RegisterStudentData {
  sessionId: string;
  name: string;
  socketId: string;
}

class StudentService {
  // Register or update a student
  async registerStudent(data: RegisterStudentData): Promise<IStudent> {
    const existingStudent = await Student.findOne({ sessionId: data.sessionId });

    if (existingStudent) {
      // Check if student is kicked
      if (existingStudent.isKicked) {
        throw new Error('You have been removed from the poll system');
      }

      // Update socket ID
      existingStudent.socketId = data.socketId;
      existingStudent.name = data.name;
      await existingStudent.save();
      return existingStudent;
    }

    const student = new Student({
      sessionId: data.sessionId,
      name: data.name,
      socketId: data.socketId
    });

    await student.save();
    return student;
  }

  // Get student by session ID
  async getStudentBySessionId(sessionId: string): Promise<IStudent | null> {
    return Student.findOne({ sessionId });
  }

  // Get student by socket ID
  async getStudentBySocketId(socketId: string): Promise<IStudent | null> {
    return Student.findOne({ socketId });
  }

  // Update student's socket ID
  async updateSocketId(sessionId: string, socketId: string): Promise<IStudent | null> {
    return Student.findOneAndUpdate(
      { sessionId },
      { socketId },
      { new: true }
    );
  }

  // Get all active (non-kicked) students
  async getAllActiveStudents(): Promise<IStudent[]> {
    return Student.find({ isKicked: false });
  }

  // Kick a student
  async kickStudent(sessionId: string): Promise<IStudent | null> {
    return Student.findOneAndUpdate(
      { sessionId },
      { isKicked: true },
      { new: true }
    );
  }

  // Check if student is kicked
  async isStudentKicked(sessionId: string): Promise<boolean> {
    const student = await Student.findOne({ sessionId });
    return student?.isKicked ?? false;
  }

  // Remove student (for cleanup)
  async removeStudent(socketId: string): Promise<void> {
    await Student.deleteOne({ socketId });
  }
}

export const studentService = new StudentService();
