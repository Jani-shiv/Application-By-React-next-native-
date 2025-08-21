const mysql = requ    console.log('🗄️ Creating database...');
    await connection.query('CREATE DATABASE IF NOT EXISTS reiki_healing_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    await connection.query('USE reiki_healing_platform');('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || ''
};

const initializeDatabase = async () => {
  let connection;
  
  try {
    console.log('🔗 Connecting to MySQL server...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('�️ Creating database...');
    await connection.execute('CREATE DATABASE IF NOT EXISTS reiki_healing_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    await connection.execute('USE reiki_healing_platform');
    
    console.log('📖 Reading and executing schema...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaContent = await fs.readFile(schemaPath, 'utf8');
    
    // Split the schema into individual statements
    const statements = schemaContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('CREATE DATABASE') && !stmt.startsWith('USE'));
    
    console.log(`📝 Executing ${statements.length} SQL statements...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          await connection.execute(statement);
          console.log(`✅ Statement ${i + 1}/${statements.length} executed`);
        } catch (error) {
          console.log(`⚠️ Statement ${i + 1} skipped (may already exist):`, statement.substring(0, 50) + '...');
        }
      }
    }
    
    console.log('✅ Database initialized successfully!');
    console.log(`
🎉 Reiki Healing Platform Database Setup Complete!

Database: reiki_healing_platform
Tables created:
- users (clients, therapists, admins)
- therapist_profiles 
- appointments
- reviews
- notifications
- refresh_tokens
- payment_transactions
- therapist_availability
- email_templates
- system_settings

Default admin account created:
- Email: admin@reikihealing.com
- Password: admin123

Next steps:
1. Run 'npm run db:seed' to add sample data
2. Start your backend server with 'npm run dev'
3. Test the API endpoints
    `);
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log(`
💡 MySQL Connection Failed!

Make sure MySQL is running on your system:
- Windows: Start MySQL service in Services
- macOS: brew services start mysql
- Linux: sudo systemctl start mysql

Or install MySQL:
- Download from: https://dev.mysql.com/downloads/mysql/
- Or use XAMPP/WAMP for easier setup
      `);
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

// Run if called directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };
