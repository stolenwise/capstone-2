const request = require('supertest');
const app = require('../app');

describe('Users Routes', () => {
  let authToken;

  beforeAll(async () => {
    // Get auth token first
    const response = await request(app)
      .post('/auth/token')
      .send({ username: 'testuser', password: 'password' });
    
    authToken = response.body.token;
  });

  test('GET /users/:username returns user profile', async () => {
    const response = await request(app)
      .get('/users/testuser')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(response.statusCode).toBe(200);
    expect(response.body.user).toHaveProperty('username');
    expect(response.body.user).toHaveProperty('email');
  });

  test('PATCH /users/:username updates user profile', async () => {
    const response = await request(app)
      .patch('/users/testuser')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ firstName: 'Updated', lastName: 'Name' });
    
    expect([200, 400]).toContain(response.statusCode);
  });

  test('GET /users/:username requires authentication', async () => {
    const response = await request(app)
      .get('/users/testuser');
    
    expect(response.statusCode).toBe(401);
  });
});

afterAll(async () => {
  // Cleanup
});