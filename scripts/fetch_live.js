const https = require('https');
const urls = [
  'https://fanaticop.github.io/inventory-management-system/',
  'https://fanaticop.github.io/inventory-management-system/assets/index-sPOr7Ye5.js'
];

function fetchUrl(u){
  https.get(u, (res) => {
    console.log('\n===', u, 'STATUS', res.statusCode, '===');
    console.log('headers:', res.headers);
    let body = '';
    res.setEncoding('utf8');
    res.on('data', chunk => { if (body.length < 4000) body += chunk; });
    res.on('end', () => {
      console.log('\n--- body preview (first 800 chars) ---');
      console.log(body.slice(0,800));
      console.log('\n--- end ---\n');
    });
  }).on('error', (e) => { console.error('error fetching', u, e.message); });
}

urls.forEach(fetchUrl);
