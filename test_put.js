const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/submissions/24', // The ID from screenshot is 24
  method: 'PUT',
  headers: {
    'token': 'test_token',
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk}`);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write('{"title": "Test"}');
req.end();
