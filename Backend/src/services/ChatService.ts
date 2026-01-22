import { Message, IMessage } from '../models';

interface SendMessageData {
  senderId: string;
  senderName: string;
  senderRole: 'teacher' | 'student';
  content: string;
}

class ChatService {
  async sendMessage(data: SendMessageData): Promise<IMessage> {
    const message = new Message({
      senderId: data.senderId,
      senderName: data.senderName,
      senderRole: data.senderRole,
      content: data.content
    });

    await message.save();
    return message;
  }

  async getRecentMessages(limit: number = 50): Promise<IMessage[]> {
    return Message.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .then((messages) => messages.reverse());
  }

  async clearMessages(): Promise<void> {
    await Message.deleteMany({});
  }
}

export const chatService = new ChatService();
