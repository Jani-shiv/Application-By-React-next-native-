// Jest setup file for backend tests
const { beforeAll, afterAll } = require('@jest/globals');

// Global test setup
beforeAll(async () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret-key';
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key';
  process.env.JWT_REFRESH_EXPIRES_IN = '7d';
  
  // Mock email service for tests
  process.env.EMAIL_HOST = 'test.smtp.com';
  process.env.EMAIL_PORT = '587';
  process.env.EMAIL_USER = 'test@test.com';
  process.env.EMAIL_PASS = 'testpass';
});

// Global test cleanup
afterAll(async () => {
  // Clean up any test resources
});

// Mock database connections for tests
jest.mock('../config/database', () => ({
  query: jest.fn(),
  execute: jest.fn(),
  end: jest.fn()
}));

// Suppress console.log during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};
