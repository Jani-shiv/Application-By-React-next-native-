const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = 'admin123';
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  console.log('Password:', password);
  console.log('Hash:', hash);
  
  // Test the hash
  const isValid = await bcrypt.compare(password, hash);
  console.log('Hash is valid:', isValid);
  
  // Test against existing hash
  const existingHash = '$2b$10$rZJWxTVbqbHtEKrY3Q4HfOjKl.GqkQj.lQ4WjQ.mO5.Lk4.V8.dKO';
  const isExistingValid = await bcrypt.compare(password, existingHash);
  console.log('Existing hash is valid:', isExistingValid);
}

generateHash().catch(console.error);
