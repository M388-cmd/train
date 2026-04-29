import 'dotenv/config';
import fetch from 'node-fetch';

const appId = process.env.TMB_APP_ID || "eba925f8";
const appKey = process.env.TMB_APP_KEY || "2464f8dbaaa79d87a408b049a5340f60";

async function test() {
  try {
    // Try to get metro stations
    console.log('Fetching metro stations...');
    const res = await fetch(`https://api.tmb.cat/v1/itransit/metro/estacions?app_id=${appId}&app_key=${appKey}`);
    const data = await res.json();
    
    console.log('Response status:', res.status);
    console.log('Data keys:', Object.keys(data));
    
    if (data.items && data.items.length > 0) {
      console.log('\nFirst 3 stations:');
      data.items.slice(0, 3).forEach(station => {
        console.log(`- ${station.nom} (codi: ${station.codi}, linia: ${station.linia})`);
      });
      
      // Look for L9 or L10 stations
      const l9l10 = data.items.filter(s => s.linia === '9' || s.linia === '10');
      console.log(`\nFound ${l9l10.length} L9/L10 stations`);
      l9l10.slice(0, 5).forEach(station => {
        console.log(`- ${station.nom} (codi: ${station.codi}, linia: ${station.linia})`);
      });
    } else {
      console.log('Full response:', JSON.stringify(data, null, 2).slice(0, 1000));
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test().catch(console.error);
