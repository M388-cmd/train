import 'dotenv/config';
import fetch from 'node-fetch';

const appId = process.env.TMB_APP_ID || "eba925f8";
const appKey = process.env.TMB_APP_KEY || "2464f8dbaaa79d87a408b049a5340f60";

async function test() {
  try {
    // Fetch all metro lines data
    console.log('Fetching metro data...\n');
    const res = await fetch(`https://api.tmb.cat/v1/itransit/metro/estacions?app_id=${appId}&app_key=${appKey}`);
    const data = await res.json();
    
    // Find L9 and L10
    const l9 = data.linies.find(l => l.codi_linia === 9 || l.nom_linia === 'L9');
    const l10 = data.linies.find(l => l.codi_linia === 10 || l.nom_linia === 'L10');
    
    if (l9) {
      console.log('L9 Line found:', l9.nom_linia);
      console.log('Stations:', l9.estacions?.length || 0);
      if (l9.estacions && l9.estacions.length > 0) {
        console.log('First 3 stations:');
        l9.estacions.slice(0, 3).forEach(est => {
          console.log(`  - Codi: ${est.codi_estacio}, Via: ${est.codi_via}`);
        });
      }
    }
    
    if (l10) {
      console.log('\nL10 Line found:', l10.nom_linia);
      console.log('Stations:', l10.estacions?.length || 0);
      if (l10.estacions && l10.estacions.length > 0) {
        console.log('First 3 stations:');
        l10.estacions.slice(0, 3).forEach(est => {
          console.log(`  - Codi: ${est.codi_estacio}, Via: ${est.codi_via}`);
        });
      }
    }
    
    // Try searching for a known L9 station
    console.log('\n\nTrying to fetch specific station data...');
    const stationRes = await fetch(`https://api.tmb.cat/v1/itransit/metro/estacions?estacions=122&app_id=${appId}&app_key=${appKey}`);
    const stationData = await stationRes.json();
    console.log('Station 122 data:', JSON.stringify(stationData).slice(0, 500));
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test().catch(console.error);
