const request = require('supertest');
const app = require('../app');
let token;

beforeAll(async () => {
  const response = await request(app)
    .post('/login')
    .send({ email: 'teste@teste.com', password: '123456' });

  token = response.body.token;
  console.log('Token recebido no teste:', token);
});