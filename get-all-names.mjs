import 'dotenv/config';
import fetch from 'node-fetch';

const appId = process.env.TMB_APP_ID || "eba925f8";
const appKey = process.env.TMB_APP_KEY || "2464f8dbaaa79d87a408b049a5340f60";

async function test() {
  // Get all unique station codes
  const allCodes = [
    // L9S
    903, 910, 918, 901, 904, 905, 907, 909, 911, 912, 913, 914, 915, 916, 906,
    // L10N  
    932, 933, 930, 934, 935, 936
  ].join(',');
  
  console.log('Fetching station data for codes:', allCodes);
  const res = await fetch(`https://api.tmb.cat/v1/itransit/metro/estacions?estacions=${allCodes}&app_id=${appId}&app_key=${appKey}`);
  const data = await res.json();
  
  // Try to extract station names from responses
  const stationNames = new Map();
  
  if (data.linies) {
    data.linies.forEach(l => {
      if (l.estacions) {
        l.estacions.forEach(est => {
          if (!stationNames.has(est.codi_estacio)) {
            let name = `Station ${est.codi_estacio}`;
            // Try to find destination which might be the station name
            if (est.linies_trajectes) {
              est.linies_trajectes.forEach(lt => {
                if (lt.desti_trajecte) {
                  name = lt.desti_trajecte;
                }
              });
            }
            stationNames.set(est.codi_estacio, name);
          }
        });
      }
    });
  }
  
  console.log('\n=== Station Names ===');
  stationNames.forEach((name, code) => {
    console.log(`  ${code}: ${name}`);
  });
}

test().catch(console.error);
