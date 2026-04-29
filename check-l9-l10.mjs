import 'dotenv/config';
import fetch from 'node-fetch';

const appId = process.env.TMB_APP_ID || "eba925f8";
const appKey = process.env.TMB_APP_KEY || "2464f8dbaaa79d87a408b049a5340f60";

async function test() {
  try {
    const res = await fetch(`https://api.tmb.cat/v1/itransit/metro/estacions?app_id=${appId}&app_key=${appKey}`);
    const data = await res.json();
    
    console.log('Available lines:');
    data.linies.forEach(l => {
      console.log(`  - ${l.nom_linia} (codi: ${l.codi_linia}) - ${l.estacions?.length || 0} stations`);
    });
    
    // Find L9 and L10
    const l9 = data.linies.find(l => l.codi_linia === 9 || l.nom_linia === 'L9');
    const l10 = data.linies.find(l => l.codi_linia === 10 || l.nom_linia === 'L10');
    
    if (l9) {
      console.log('\nL9 Stations:');
      l9.estacions?.forEach(est => {
        console.log(`  codi_estacio: ${est.codi_estacio}, via: ${est.codi_via}`);
      });
    } else {
      console.log('\nL9 not found in API response');
    }
    
    if (l10) {
      console.log('\nL10 Stations:');
      l10.estacions?.forEach(est => {
        console.log(`  codi_estacio: ${est.codi_estacio}, via: ${est.codi_via}`);
      });
    } else {
      console.log('\nL10 not found in API response');
    }
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test().catch(console.error);
