const { User } = require('../models');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const testUser = async () => {
  try {
    console.log('Testing user authentication...');
    
    // Find admin user
    const user = await User.findOne({
      where: { email: 'admin@fieldforcepro.com' }
    });
    
    if (!user) {
      console.log('❌ User not found in database');
      return;
    }
    
    console.log('✅ User found:', {
      email: user.email,
      role: user.role,
      is_active: user.is_active,
      email_verified: user.email_verified,
      is_deleted: user.is_deleted
    });
    
    // Test password comparison
    const isPasswordValid = await user.comparePassword('admin123');
    console.log('✅ Password validation result:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ Password validation failed');
      // Try to hash and compare again
      const testHash = await bcrypt.hash('admin123', 10);
      const testCompare = await bcrypt.compare('admin123', testHash);
      console.log('Test hash comparison:', testCompare);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing user:', error);
    process.exit(1);
  }
};

testUser();
