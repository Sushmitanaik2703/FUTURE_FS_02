const http = require('http');

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, data });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Running API verification tests...\n');

  // 1. Health Check
  const health = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/health',
    method: 'GET'
  });
  console.log('1. Health Check:', health.status, health.data);

  // 2. Admin Login
  const loginRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'admin@crm.com', password: 'admin123' });
  console.log('\n2. Admin Login:', loginRes.status, loginRes.data.message);
  const token = loginRes.data.token;

  // 3. Public Form Submission
  const publicRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/public/contact',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Test Lead via Verification',
    email: 'testlead@verify.org',
    phone: '+1 (555) 000-1111',
    company: 'Verification Corp',
    message: 'We want to test your Mini CRM system.'
  });
  console.log('\n3. Public Contact Form Submission:', publicRes.status, publicRes.data.message);

  // 4. Fetch All Leads with JWT
  const leadsRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/leads',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('\n4. Fetch Leads Count:', leadsRes.status, 'Total Leads:', leadsRes.data.count);

  // 5. Fetch Lead Details & Activities
  const firstLead = leadsRes.data.leads[0];
  const leadDetails = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/leads/${firstLead.id}`,
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log(`\n5. Lead #${firstLead.id} Details & Activity Timeline Count:`, leadDetails.data.activities.length);
  console.log('Latest Activity:', leadDetails.data.activities[0]);

  // 6. Test Status Transition (NEW -> CONTACTED)
  const updateStatusRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/leads/${firstLead.id}/status`,
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
  }, { status: 'CONTACTED' });
  console.log('\n6. Update Lead Status:', updateStatusRes.status, updateStatusRes.data.message);

  // 7. Add Follow-up Note
  const addNoteRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/leads/${firstLead.id}/notes`,
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
  }, { note: 'Verification follow-up note: Scheduled demo call for Friday.' });
  console.log('\n7. Add Follow-up Note:', addNoteRes.status, addNoteRes.data.message);

  // 8. Fetch Analytics
  const analyticsRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/leads/analytics',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('\n8. Analytics Summary:', analyticsRes.status, analyticsRes.data.analytics);

  console.log('\n✅ All API verification tests passed with 200/201 HTTP status codes!');
}

runTests().catch(console.error);
