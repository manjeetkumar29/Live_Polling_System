import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const clearPollHistory = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/live_polling_system';
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');

    // Get the database
    const db = mongoose.connection.db;
    
    if (!db) {
      throw new Error('Database connection not established');
    }

    // Delete all votes
    const votesResult = await db.collection('votes').deleteMany({});
    console.log(`Deleted ${votesResult.deletedCount} votes`);

    // Delete all polls
    const pollsResult = await db.collection('polls').deleteMany({});
    console.log(`Deleted ${pollsResult.deletedCount} polls`);

    console.log('\n✅ Poll history cleared successfully!');
    
  } catch (error) {
    console.error('Error clearing poll history:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
    process.exit(0);
  }
};

clearPollHistory();
