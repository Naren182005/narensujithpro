/**
 * Local Database Setup Script
 * This script sets up a local MongoDB connection for testing
 */

const mongoose = require('mongoose');
require('dotenv').config();

console.log('🗄️ Setting up local database for testing...\n');

// Mock database connection for testing
const mockDB = {
  users: new Map(),
  nextId: 1
};

// Create a simple in-memory database for testing
class MockDatabase {
  constructor() {
    this.users = new Map();
    this.nextId = 1;
  }

  async connect() {
    console.log('✅ Connected to mock database (in-memory)');
    return true;
  }

  async createUser(userData) {
    const user = {
      _id: this.nextId++,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(user._id, user);
    console.log(`✅ Created user: ${user.email}`);
    return user;
  }

  async findUserByEmail(email) {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async findUserByGoogleId(googleId) {
    for (const user of this.users.values()) {
      if (user.googleId === googleId) {
        return user;
      }
    }
    return null;
  }

  async updateUser(id, updates) {
    const user = this.users.get(id);
    if (user) {
      Object.assign(user, updates, { updatedAt: new Date() });
      this.users.set(id, user);
      return user;
    }
    return null;
  }

  async listUsers() {
    return Array.from(this.users.values());
  }
}

// Test the mock database
async function testMockDatabase() {
  const db = new MockDatabase();
  
  console.log('🧪 Testing mock database...');
  
  // Test connection
  await db.connect();
  
  // Test user creation
  const testUser = await db.createUser({
    name: 'Test User',
    email: 'test@example.com',
    loginMethod: 'email'
  });
  
  // Test Google user creation
  const googleUser = await db.createUser({
    name: 'Google User',
    email: 'google@example.com',
    googleId: 'google123',
    loginMethod: 'google',
    profilePicture: 'https://example.com/avatar.jpg'
  });
  
  // Test finding users
  const foundUser = await db.findUserByEmail('test@example.com');
  console.log(`✅ Found user by email: ${foundUser ? foundUser.name : 'Not found'}`);
  
  const foundGoogleUser = await db.findUserByGoogleId('google123');
  console.log(`✅ Found Google user: ${foundGoogleUser ? foundGoogleUser.name : 'Not found'}`);
  
  // List all users
  const allUsers = await db.listUsers();
  console.log(`✅ Total users in database: ${allUsers.length}`);
  
  console.log('\n✅ Mock database test completed successfully!');
  return true;
}

// Try to connect to real MongoDB, fallback to mock
async function setupDatabase() {
  console.log('Attempting to connect to MongoDB...');
  
  try {
    // Try to connect to local MongoDB
    await mongoose.connect('mongodb://localhost:27017/socialmuse', {
      serverSelectionTimeoutMS: 3000
    });
    console.log('✅ Connected to local MongoDB');
    await mongoose.connection.close();
    return 'local';
  } catch (error) {
    console.log('❌ Local MongoDB not available');
  }

  try {
    // Try to connect to Atlas if URI is provided
    if (process.env.MONGODB_URI && process.env.MONGODB_URI.includes('mongodb+srv')) {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 3000
      });
      console.log('✅ Connected to MongoDB Atlas');
      await mongoose.connection.close();
      return 'atlas';
    }
  } catch (error) {
    console.log('❌ MongoDB Atlas not available');
  }

  console.log('⚠️ No MongoDB available, will use mock database for testing');
  await testMockDatabase();
  return 'mock';
}

// Main setup function
async function main() {
  const dbType = await setupDatabase();
  
  console.log('\n📋 Database Setup Summary:');
  console.log(`   Database Type: ${dbType}`);
  console.log(`   Status: ${dbType === 'mock' ? 'Mock (in-memory)' : 'Real database'}`);
  
  if (dbType === 'mock') {
    console.log('\n⚠️ Important Notes:');
    console.log('   - Using in-memory database for testing');
    console.log('   - Data will be lost when server restarts');
    console.log('   - For production, set up a real MongoDB database');
  }
  
  console.log('\n🚀 Next Steps:');
  console.log('1. Complete Google Cloud Console setup (see instructions above)');
  console.log('2. Update VITE_GOOGLE_CLIENT_ID in .env file');
  console.log('3. Start the server: npm run server:dev');
  console.log('4. Start the frontend: npm run dev');
  console.log('5. Test at: http://localhost:5173/login');
}

main().catch(console.error);
