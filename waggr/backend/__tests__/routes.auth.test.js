const request = require('supertest');
const app = require('../app');
const db = require('../db');
const User = require('../models/user');

describe('Auth Routes', () => {
  beforeEach(async () => {
    // Clean up any existing test users
    await db.query('DELETE FROM users WHERE username LIKE $1', ['testuser%']);
  });

  describe('POST /auth/token', () => {
    test('returns token with valid credentials', async () => {
      // First create a test user
      await User.register({
        username: 'testuser_auth',
        password: 'testpass123',
        firstName: 'Test',
        lastName: 'User',
        email: 'testauth@example.com',
        isAdmin: false  
      });

      const response = await request(app)
        .post('/auth/token')
        .send({ username: 'testuser_auth', password: 'testpass123' });
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(typeof response.body.token).toBe('string');
    });

    test('returns 401 with invalid credentials', async () => {
      const response = await request(app)
        .post('/auth/token')
        .send({ username: 'nonexistent', password: 'wrongpass' });
      
      expect(response.statusCode).toBe(401);
    });

    test('returns 400 with invalid request body', async () => {
      const response = await request(app)
        .post('/auth/token')
        .send({ username: 'test' }); // Missing password
      
      expect(response.statusCode).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    test('returns 400 with empty request body', async () => {
      const response = await request(app)
        .post('/auth/token')
        .send({});
      
      expect(response.statusCode).toBe(400);
    });
  });

  describe('POST /auth/register', () => {
    test('creates new user and returns token', async () => {
      const newUser = {
        username: 'newtestuser',
        password: 'newpass123',
        firstName: 'New',
        lastName: 'Test',
        email: 'newtest@example.com'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(newUser);
      
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(typeof response.body.token).toBe('string');

      // Verify user was actually created
      const user = await User.get('newtestuser');
      expect(user).toBeDefined();
      expect(user.email).toBe('newtest@example.com');
    });

    test('returns 400 with missing required fields', async () => {
      const incompleteUser = {
        username: 'incomplete',
        password: 'pass123',
        // Missing firstName, lastName, email
      };

      const response = await request(app)
        .post('/auth/register')
        .send(incompleteUser);
      
      expect(response.statusCode).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    test('returns 400 with invalid email format', async () => {
      const invalidUser = {
        username: 'invalidemail',
        password: 'pass123',
        firstName: 'Invalid',
        lastName: 'Email',
        email: 'not-an-email'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(invalidUser);
      
      expect(response.statusCode).toBe(400);
    });

    test('returns 400 with duplicate username', async () => {
      // First create a user
      await User.register({
        username: 'duplicateuser',
        password: 'pass123',
        firstName: 'Duplicate',
        lastName: 'User',
        email: 'dup1@example.com',
        isAdmin: false
      });

      // Try to create another user with same username
      const duplicateUser = {
        username: 'duplicateuser', // Same username
        password: 'pass123',
        firstName: 'Duplicate2',
        lastName: 'User2',
        email: 'dup2@example.com'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(duplicateUser);
      
      expect(response.statusCode).toBe(400);
    });
  });

  describe('Error handling', () => {
    test('returns proper error format for validation errors', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({}); // Empty object
      
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('status', 400); // status is inside error
      expect(response.body.error).toHaveProperty('message'); // message is also inside error
    });
  });
});

afterAll(async () => {
  // Clean up test users
  await db.query('DELETE FROM users WHERE username LIKE $1', ['testuser%']);
  await db.query('DELETE FROM users WHERE username = $1', ['newtestuser']);
  await db.query('DELETE FROM users WHERE username = $1', ['duplicateuser']);
  await db.end();
});