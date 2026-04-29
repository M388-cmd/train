import 'dotenv/config';
import fetch from 'node-fetch';

const appId = process.env.TMB_APP_ID || "eba925f8";
const appKey = process.env.TMB_APP_KEY || "2464f8dbaaa79d87a408b049a5340f60";

async function test() {
  try {
    const res = await fetch(`https://api.tmb.cat/v1/itransit/metro/estacions?app_id=${appId}&app_key=${appKey}`);
    const data = await res.json();
    
    // Get L9N and L10S stations
    const l9n = data.linies.find(l => l.codi_linia === 94 || l.nom_linia === 'L9N');
    const l10s = data.linies.find(l => l.codi_linia === 101 || l.nom_linia === 'L10S');
    
    console.log('=== L9 NORD (L9N) Stations ===');
    if (l9n && l9n.estacions) {
      const stations = new Map();
      l9n.estacions.forEach(est => {
        if (!stations.has(est.codi_estacio)) {
          stations.set(est.codi_estacio, est);
        }
      });
      console.log(`Total unique stations: ${stations.size}`);
      // We need to get station names from another API call or use the search
      console.log('Station codes:', Array.from(stations.keys()).join(', '));
    }
    
    console.log('\n=== L10 SUD (L10S) Stations ===');
    if (l10s && l10s.estacions) {
      const stations = new Map();
      l10s.estacions.forEach(est => {
        if (!stations.has(est.codi_estacio)) {
          stations.set(est.codi_estacio, est);
        }
      });
      console.log(`Total unique stations: ${stations.size}`);
      console.log('Station codes:', Array.from(stations.keys()).join(', '));
    }
    
    // Now let's get station names by fetching data for all these stations
    console.log('\n=== Fetching station names ===');
    const allCodes = new Set();
    if (l9n) l9n.estacions?.forEach(e => allCodes.add(e.codi_estacio));
    if (l10s) l10s.estacions?.forEach(e => allCodes.add(e.codi_estacio));
    
    const codesStr = Array.from(allCodes).join(',');
    console.log(`Fetching data for stations: ${codesStr}`);
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test().catch(console.error);
