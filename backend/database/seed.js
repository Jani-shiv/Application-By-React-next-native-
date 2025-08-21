const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: 'reiki_healing_platform'
};

const seedDatabase = async () => {
  let connection;
  
  try {
    console.log('🔗 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('🌱 Seeding sample data...');
    
    // Hash passwords
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Sample users (clients)
    const clients = [
      {
        email: 'sarah.client@example.com',
        password_hash: hashedPassword,
        first_name: 'Sarah',
        last_name: 'Johnson',
        phone: '+1-555-0101',
        role: 'client',
        is_verified: true
      },
      {
        email: 'mike.wellness@example.com', 
        password_hash: hashedPassword,
        first_name: 'Mike',
        last_name: 'Chen',
        phone: '+1-555-0102',
        role: 'client',
        is_verified: true
      },
      {
        email: 'emma.seeker@example.com',
        password_hash: hashedPassword,
        first_name: 'Emma',
        last_name: 'Rodriguez',
        phone: '+1-555-0103',
        role: 'client',
        is_verified: true
      }
    ];
    
    // Sample therapists
    const therapists = [
      {
        email: 'master.akiko@reikihealing.com',
        password_hash: hashedPassword,
        first_name: 'Akiko',
        last_name: 'Tanaka',
        phone: '+1-555-0201',
        role: 'therapist',
        is_verified: true
      },
      {
        email: 'healer.david@reikihealing.com',
        password_hash: hashedPassword,
        first_name: 'David',
        last_name: 'Williams',
        phone: '+1-555-0202',
        role: 'therapist',
        is_verified: true
      },
      {
        email: 'crystal.reiki@reikihealing.com',
        password_hash: hashedPassword,
        first_name: 'Crystal',
        last_name: 'Martinez',
        phone: '+1-555-0203',
        role: 'therapist',
        is_verified: true
      }
    ];
    
    // Insert clients
    for (const client of clients) {
      await connection.execute(
        'INSERT IGNORE INTO users (email, password_hash, first_name, last_name, phone, role, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [client.email, client.password_hash, client.first_name, client.last_name, client.phone, client.role, client.is_verified]
      );
    }
    
    // Insert therapists
    const therapistIds = [];
    for (const therapist of therapists) {
      const [result] = await connection.execute(
        'INSERT IGNORE INTO users (email, password_hash, first_name, last_name, phone, role, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [therapist.email, therapist.password_hash, therapist.first_name, therapist.last_name, therapist.phone, therapist.role, therapist.is_verified]
      );
      
      // Get the therapist ID (either newly inserted or existing)
      const [existingUser] = await connection.execute(
        'SELECT id FROM users WHERE email = ?',
        [therapist.email]
      );
      therapistIds.push(existingUser[0].id);
    }
    
    // Sample therapist profiles
    const profiles = [
      {
        user_id: therapistIds[0],
        bio: 'Certified Reiki Master with over 15 years of experience. Specializing in traditional Japanese Reiki techniques and chakra balancing.',
        certifications: 'Reiki Master Teacher, Usui Reiki Level III, Crystal Healing Certification',
        experience_years: 15,
        specializations: JSON.stringify(['Traditional Reiki', 'Chakra Balancing', 'Crystal Healing', 'Meditation']),
        hourly_rate: 85.00,
        is_approved: true,
        rating: 4.9,
        total_sessions: 347,
        total_reviews: 89
      },
      {
        user_id: therapistIds[1],
        bio: 'Holistic healer combining Reiki with sound therapy and aromatherapy. Creating peaceful healing experiences for stress relief and wellness.',
        certifications: 'Reiki Level II, Sound Therapy Certification, Aromatherapy Practitioner',
        experience_years: 8,
        specializations: JSON.stringify(['Reiki Healing', 'Sound Therapy', 'Aromatherapy', 'Stress Relief']),
        hourly_rate: 75.00,
        is_approved: true,
        rating: 4.7,
        total_sessions: 156,
        total_reviews: 42
      },
      {
        user_id: therapistIds[2],
        bio: 'Intuitive Reiki practitioner focused on emotional healing and spiritual guidance. Gentle approach perfect for beginners.',
        certifications: 'Reiki Level II, Intuitive Healing Certificate, Emotional Freedom Technique',
        experience_years: 5,
        specializations: JSON.stringify(['Emotional Healing', 'Spiritual Guidance', 'Beginner-Friendly', 'Intuitive Reiki']),
        hourly_rate: 65.00,
        is_approved: true,
        rating: 4.8,
        total_sessions: 89,
        total_reviews: 24
      }
    ];
    
    // Insert therapist profiles
    for (const profile of profiles) {
      await connection.execute(
        'INSERT IGNORE INTO therapist_profiles (user_id, bio, certifications, experience_years, specializations, hourly_rate, is_approved, rating, total_sessions, total_reviews) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [profile.user_id, profile.bio, profile.certifications, profile.experience_years, profile.specializations, profile.hourly_rate, profile.is_approved, profile.rating, profile.total_sessions, profile.total_reviews]
      );
    }
    
    // Sample therapist availability (Monday to Friday, 9 AM to 5 PM)
    const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    for (const therapistId of therapistIds) {
      for (const day of weekdays) {
        await connection.execute(
          'INSERT IGNORE INTO therapist_availability (therapist_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?)',
          [therapistId, day, '09:00:00', '17:00:00']
        );
      }
    }
    
    console.log('✅ Sample data seeded successfully!');
    console.log(`
🎯 Sample Data Created:

👥 Users:
- 3 sample clients (password: password123)
- 3 sample therapists (password: password123)
- 1 admin user (email: admin@reikihealing.com, password: admin123)

🧘 Therapists:
- Akiko Tanaka - Reiki Master (15 years, $85/hour)
- David Williams - Holistic Healer (8 years, $75/hour)  
- Crystal Martinez - Intuitive Practitioner (5 years, $65/hour)

📅 Availability:
- All therapists available Monday-Friday, 9 AM - 5 PM

🔐 Test Credentials:
Client: sarah.client@example.com / password123
Therapist: master.akiko@reikihealing.com / password123
Admin: admin@reikihealing.com / admin123
    `);
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

// Run if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
