const { authenticateJWT } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');

describe('Middleware', () => {
  test('authenticateJWT with valid token', () => {
    const token = jwt.sign({ username: 'testuser' }, SECRET_KEY);
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = { locals: {} };
    const next = jest.fn();

    authenticateJWT(req, res, next);
    
    expect(next).toHaveBeenCalled();
    expect(res.locals.user).toHaveProperty('username', 'testuser');
  });

  test('authenticateJWT with invalid token', () => {
    const req = { headers: { authorization: 'Bearer invalidtoken' } };
    const res = { locals: {} };
    const next = jest.fn();

    authenticateJWT(req, res, next);
    
    expect(next).toHaveBeenCalled();
    expect(res.locals.user).toBeUndefined();
  });

  test('authenticateJWT without token', () => {
    const req = { headers: {} };
    const res = { locals: {} };
    const next = jest.fn();

    authenticateJWT(req, res, next);
    
    expect(next).toHaveBeenCalled();
    expect(res.locals.user).toBeUndefined();
  });

  test('authenticateJWT with malformed token', () => {
    const req = { headers: { authorization: 'Bearer malformed.token.here' } };
    const res = { locals: {} };
    const next = jest.fn();

    authenticateJWT(req, res, next);
    
    expect(next).toHaveBeenCalled();
    expect(res.locals.user).toBeUndefined();
  });
});