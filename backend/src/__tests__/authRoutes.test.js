const request = require('supertest');

// We are now testing against the live server running at http://localhost:3000
const API_URL = 'http://localhost:3000';

describe('Auth Endpoints (Integration)', () => {

  // No beforeEach to clear database, assuming a clean state for integration tests
  // You would manually ensure your database is in a known state before running these tests

  it('should register a new user', async () => {
    // Note: This test will attempt to register a user. If the email already exists in your real DB,
    // this test might fail with a 409, or if the server crashes, it will fail.
    // Ensure the test data does not conflict with existing data, or clear your database manually.
    const uniqueEmail = `integration.test.${Date.now()}@example.com`;
    const res = await request(API_URL)
      .post('/api/auth/register')
      .send({
        name: 'Integration Test User',
        email: uniqueEmail,
        password: 'password123',
        role: 'applicant',
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body.user).toHaveProperty('userId');
    expect(res.body.user.name).toBe('Integration Test User');
  });

  it('should not register a user with an existing email', async () => {
    const existingUserEmail = `existing.user.${Date.now()}@example.com`;

    // First, register a user
    await request(API_URL)
      .post('/api/auth/register')
      .send({
        name: 'Existing User',
        email: existingUserEmail,
        password: 'password123',
        role: 'applicant',
      });

    // Then, attempt to register another user with the same email
    const res = await request(API_URL)
      .post('/api/auth/register')
      .send({
        name: 'Another Integration User',
        email: existingUserEmail,
        password: 'password456',
        role: 'applicant',
      });

    expect(res.statusCode).toEqual(409);
    expect(res.body.message).toBe('An account with that email already exists');
  });

  it('should log in an existing user', async () => {
    const loginUserEmail = `login.user.${Date.now()}@example.com`;
    const loginUserPassword = 'loginpassword123';

    // First, register a user to log in with
    await request(API_URL)
      .post('/api/auth/register')
      .send({
        name: 'Login Test User',
        email: loginUserEmail,
        password: loginUserPassword,
        role: 'applicant',
      });

    // Then, attempt to log in with those credentials
    const res = await request(API_URL)
      .post('/api/auth/login')
      .send({
        email: loginUserEmail,
        password: loginUserPassword,
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.user).toHaveProperty('userId');
    expect(res.body.user.name).toBe('Login Test User');
  });

  it('should not log in with incorrect credentials', async () => {
    const res = await request(API_URL)
      .post('/api/auth/login')
      .send({
        email: 'integration.test@example.com',
        password: 'wrongpassword',
      });

    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toBe('Invalid credentials');
  });
});