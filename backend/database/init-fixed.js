const mysql = require('mysql2/promise');
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
    
    console.log('🗄️ Creating database...');
    await connection.query('CREATE DATABASE IF NOT EXISTS reiki_healing_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    await connection.query('USE reiki_healing_platform');
    
    console.log('📝 Creating tables...');
    
    // Users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        date_of_birth DATE,
        address TEXT,
        profile_image VARCHAR(255),
        role ENUM('client', 'therapist', 'admin') NOT NULL DEFAULT 'client',
        is_verified BOOLEAN DEFAULT FALSE,
        email_verification_token VARCHAR(255),
        password_reset_token VARCHAR(255),
        password_reset_expires DATETIME,
        last_login DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role),
        INDEX idx_verification_token (email_verification_token),
        INDEX idx_reset_token (password_reset_token)
      )
    `);
    
    // Therapist profiles table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS therapist_profiles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        bio TEXT,
        certifications TEXT,
        experience_years INT DEFAULT 0,
        specializations JSON,
        hourly_rate DECIMAL(8,2),
        availability_schedule JSON,
        is_approved BOOLEAN DEFAULT FALSE,
        approval_date DATETIME,
        rating DECIMAL(3,2) DEFAULT 0.00,
        total_sessions INT DEFAULT 0,
        total_reviews INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_approved (is_approved),
        INDEX idx_rating (rating)
      )
    `);
    
    // Appointments table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        client_id INT NOT NULL,
        therapist_id INT NOT NULL,
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        duration INT NOT NULL DEFAULT 60,
        session_type ENUM('in-person', 'remote') NOT NULL,
        status ENUM('pending', 'confirmed', 'completed', 'cancelled', 'no-show') DEFAULT 'pending',
        notes TEXT,
        price DECIMAL(8,2),
        payment_status ENUM('pending', 'paid', 'refunded', 'failed') DEFAULT 'pending',
        payment_method VARCHAR(50),
        payment_id VARCHAR(255),
        stripe_payment_intent_id VARCHAR(255),
        cancellation_reason TEXT,
        cancelled_by INT,
        cancelled_at DATETIME,
        reminder_sent BOOLEAN DEFAULT FALSE,
        session_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (therapist_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (cancelled_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_client_id (client_id),
        INDEX idx_therapist_id (therapist_id),
        INDEX idx_appointment_date (appointment_date),
        INDEX idx_status (status),
        INDEX idx_payment_status (payment_status),
        UNIQUE KEY unique_appointment (therapist_id, appointment_date, appointment_time)
      )
    `);
    
    // Reviews table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT PRIMARY KEY AUTO_INCREMENT,
        appointment_id INT NOT NULL,
        client_id INT NOT NULL,
        therapist_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        is_public BOOLEAN DEFAULT TRUE,
        is_verified BOOLEAN DEFAULT FALSE,
        helpful_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
        FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (therapist_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_appointment_id (appointment_id),
        INDEX idx_client_id (client_id),
        INDEX idx_therapist_id (therapist_id),
        INDEX idx_rating (rating),
        INDEX idx_public (is_public),
        UNIQUE KEY unique_review (appointment_id, client_id)
      )
    `);
    
    // Notifications table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type ENUM('appointment', 'payment', 'system', 'promotion', 'review') NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        action_url VARCHAR(500),
        metadata JSON,
        expires_at DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_type (type),
        INDEX idx_read (is_read),
        INDEX idx_created_at (created_at)
      )
    `);
    
    // Refresh tokens table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        token VARCHAR(500) NOT NULL,
        expires_at DATETIME NOT NULL,
        device_info VARCHAR(255),
        is_revoked BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_token (token),
        INDEX idx_expires_at (expires_at)
      )
    `);
    
    // System settings table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        setting_key VARCHAR(100) NOT NULL UNIQUE,
        setting_value TEXT,
        data_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
        description TEXT,
        is_public BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_setting_key (setting_key),
        INDEX idx_public (is_public)
      )
    `);
    
    console.log('👤 Creating default admin user...');
    
    // Insert default admin user (password: admin123)
    await connection.query(`
      INSERT IGNORE INTO users (email, password_hash, first_name, last_name, role, is_verified) 
      VALUES (
        'admin@reikihealing.com',
        '$2b$10$rZJWxTVbqbHtEKrY3Q4HfOjKl.GqkQj.lQ4WjQ.mO5.Lk4.V8.dKO',
        'Admin',
        'User',
        'admin',
        TRUE
      )
    `);
    
    console.log('⚙️ Adding system settings...');
    
    // Insert default system settings
    const settings = [
      ['site_name', 'Reiki Healing Platform', 'string', 'Name of the platform', true],
      ['site_description', 'Connect with certified Reiki practitioners for healing sessions', 'string', 'Platform description', true],
      ['default_session_duration', '60', 'number', 'Default session duration in minutes', true],
      ['platform_commission', '0.15', 'number', 'Platform commission rate (15%)', false],
      ['max_advance_booking_days', '90', 'number', 'Maximum days in advance for booking', true],
      ['min_cancellation_hours', '24', 'number', 'Minimum hours before cancellation', true]
    ];
    
    for (const [key, value, type, description, isPublic] of settings) {
      await connection.query(`
        INSERT IGNORE INTO system_settings (setting_key, setting_value, data_type, description, is_public) 
        VALUES (?, ?, ?, ?, ?)
      `, [key, value, type, description, isPublic]);
    }
    
    console.log('✅ Database initialized successfully!');
    console.log(`
🎉 Reiki Healing Platform Database Setup Complete!

Database: reiki_healing_platform
Tables created:
✅ users (clients, therapists, admins)
✅ therapist_profiles 
✅ appointments
✅ reviews
✅ notifications
✅ refresh_tokens
✅ system_settings

Default admin account created:
📧 Email: admin@reikihealing.com
🔑 Password: admin123

Next steps:
1. Run 'npm run db:seed' to add sample data
2. Start your backend server with 'npm run dev'
3. Test the API endpoints at http://localhost:3000
    `);
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
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
