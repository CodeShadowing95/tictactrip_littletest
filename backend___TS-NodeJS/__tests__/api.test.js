import request from 'supertest'
import jwt from 'jsonwebtoken';
import cors from "cors";
import bodyParser from "body-parser";
import crypto from "crypto";
import {describe, expect} from '@jest/globals';

import app from '../index'

app.use(express.text())
app.use(bodyParser.json({ limit: "30mb" }))
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }))
app.use(cors())
app.use(express.json())


const SECRET_KEY = crypto.randomBytes(64).toString('hex');

describe('API Endpoints', () => {
  it('should generate a token for a valid email', async () => {
    const email = 'test@example.com';

    const response = await request(app)
      .post('/api/token')
      .send({ emailUser: email });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('email');
    expect(response.body).toHaveProperty('tokenID');

    // Verify the token
    const { email: decodedEmail } = jwt.verify(response.body.tokenID, SECRET_KEY);
    expect(decodedEmail).toBe(email);
  });

  it('should return a 400 error for missing email', async () => {
    const response = await request(app)
      .post('/api/token')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Email obligatoire!');
  });
});


describe('POST /api/justify', () => {
  it('should justify the provided text', async () => {
    // Ensure you have a token to use for authentication
    const tokenResponse = await request(app)
      .post('/api/token')
      .send({ email: 'test@example.com' });
    const token = tokenResponse.body.token;

    // Make a request to /api/justify with valid authentication token
    const response = await request(app)
      .post('/api/justify')
      .set('Authorization', `Bearer ${token}`)
      .send('Your text to be justified.');

    expect(response.status).toBe(200);
    expect(response.text).toEqual('Justified text here...');
  });
});