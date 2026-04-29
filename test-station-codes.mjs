import 'dotenv/config';
import fetch from 'node-fetch';

const appId = process.env.TMB_APP_ID || "eba925f8";
const appKey = process.env.TMB_APP_KEY || "2464f8dbaaa79d87a408b049a5340f60";

async function test() {
  // Test with L9N station code 932 (Can Zam)
  console.log('Testing L9N - Station 932 (Can Zam)...');
  try {
    const res = await fetch(`https://api.tmb.cat/v1/itransit/metro/estacions?estacions=932&app_id=${appId}&app_key=${appKey}`);
    const data = await res.json();
    console.log('Response keys:', Object.keys(data));
    console.log('Linies count:', data.linies?.length || 0);
    
    if (data.linies) {
      data.linies.forEach(l => {
        console.log(`  Line: ${l.nom_linia} (${l.codi_linia})`);
        if (l.estacions && l.estacions.length > 0) {
          console.log(`    Stations: ${l.estacions.map(e => e.codi_estacio).join(', ')}`);
        }
      });
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
  
  console.log('\n---\n');
  
  // Test with L10S station code 914 (Zona Universitària)
  console.log('Testing L10S - Station 914 (Zona Universitària)...');
  try {
    const res = await fetch(`https://api.tmb.cat/v1/itransit/metro/estacions?estacions=914&app_id=${appId}&app_key=${appKey}`);
    const data = await res.json();
    console.log('Response keys:', Object.keys(data));
    
    if (data.linies) {
      data.linies.forEach(l => {
        console.log(`  Line: ${l.nom_linia} (${l.codi_linia})`);
        if (l.estacions && l.estacions.length > 0) {
          const est = l.estacions[0];
          console.log(`    Station code: ${est.codi_estacio}`);
          if (est.linies_trajectes) {
            est.linies_trajectes.forEach(lt => {
              console.log(`    Route: ${lt.nom_linia} to ${lt.desti_trajecte}`);
              if (lt.propers_trens) {
                console.log(`      Next trains: ${lt.propers_trens.length}`);
              }
            });
          }
        }
      });
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test().catch(console.error);
