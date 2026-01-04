const http = require('http');
const paths = [
  '/inventory-management-system/',
  '/inventory-management-system/assets/index-sPOr7Ye5.js'
];

function fetchPath(p){
  const options = {
    hostname: '127.0.0.1',
    port: 4173,
    path: p,
    method: 'GET',
    timeout: 5000
  };
  const req = http.request(options, (res) => {
    console.log('\n===', p, 'STATUS', res.statusCode, '===');
    console.log('headers:', res.headers);
    let body = '';
    res.setEncoding('utf8');
    res.on('data', chunk => { if (body.length < 2000) body += chunk; });
    res.on('end', () => {
      console.log('\n--- body preview (first 400 chars) ---');
      console.log(body.slice(0,400));
      console.log('\n--- end ---\n');
    });
  });
  req.on('error', (e) => { console.error('request error for', p, e.message); });
  req.on('timeout', () => { console.error('timeout for', p); req.abort(); });
  req.end();
}

paths.forEach(fetchPath);
