import 'dotenv/config';
import fetch from 'node-fetch';

const appId = process.env.TMB_APP_ID || "eba925f8";
const appKey = process.env.TMB_APP_KEY || "2464f8dbaaa79d87a408b049a5340f60";

async function test() {
  // Test L9 Nord - Can Zam (code 932)
  console.log('=== Testing L9 Nord - Can Zam (932) ===');
  try {
    const res = await fetch(`https://api.tmb.cat/v1/itransit/metro/estacions?estacions=932&app_id=${appId}&app_key=${appKey}`);
    const data = await res.json();
    console.log('Response:', JSON.stringify(data, null, 2).slice(0, 2000));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test().catch(console.error);
