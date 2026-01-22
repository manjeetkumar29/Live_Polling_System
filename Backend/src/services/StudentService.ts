import { Student, IStudent } from '../models';

interface RegisterStudentData {
  sessionId: string;
  name: string;
  socketId: string;
}

class StudentService {
  async registerStudent(data: RegisterStudentData): Promise<IStudent> {
    const existingStudent = await Student.findOne({ sessionId: data.sessionId });

    if (existingStudent) {
      if (existingStudent.isKicked) {
        throw new Error('You have been removed from the poll system');
      }

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

  async getStudentBySessionId(sessionId: string): Promise<IStudent | null> {
    return Student.findOne({ sessionId });
  }

  async getStudentBySocketId(socketId: string): Promise<IStudent | null> {
    return Student.findOne({ socketId });
  }

  async updateSocketId(sessionId: string, socketId: string): Promise<IStudent | null> {
    return Student.findOneAndUpdate(
      { sessionId },
      { socketId },
      { new: true }
    );
  }

  async getAllActiveStudents(): Promise<IStudent[]> {
    return Student.find({ isKicked: false });
  }

  async kickStudent(sessionId: string): Promise<IStudent | null> {
    return Student.findOneAndUpdate(
      { sessionId },
      { isKicked: true },
      { new: true }
    );
  }

  async isStudentKicked(sessionId: string): Promise<boolean> {
    const student = await Student.findOne({ sessionId });
    return student?.isKicked ?? false;
  }

  async removeStudent(socketId: string): Promise<void> {
    await Student.deleteOne({ socketId });
  }
}

export const studentService = new StudentService();
