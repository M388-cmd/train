import 'dotenv/config';
import fetch from 'node-fetch';

const appId = process.env.TMB_APP_ID || "eba925f8";
const appKey = process.env.TMB_APP_KEY || "2464f8dbaaa79d87a408b049a5340f60";

async function test() {
  try {
    const res = await fetch(`https://api.tmb.cat/v1/itransit/metro/estacions?app_id=${appId}&app_key=${appKey}`);
    const data = await res.json();
    
    // Get L9S and L10N stations
    const l9s = data.linies.find(l => l.codi_linia === 91 || l.nom_linia === 'L9S');
    const l10n = data.linies.find(l => l.codi_linia === 104 || l.nom_linia === 'L10N');
    
    console.log('=== L9 SUR (L9S) Stations ===');
    if (l9s && l9s.estacions) {
      const stations = new Set();
      l9s.estacions.forEach(est => stations.add(est.codi_estacio));
      console.log(`Unique stations: ${Array.from(stations).join(', ')}`);
    }
    
    console.log('\n=== L10 NORTE (L10N) Stations ===');
    if (l10n && l10n.estacions) {
      const stations = new Set();
      l10n.estacions.forEach(est => stations.add(est.codi_estacio));
      console.log(`Unique stations: ${Array.from(stations).join(', ')}`);
    }
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test().catch(console.error);
