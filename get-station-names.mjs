import 'dotenv/config';
import fetch from 'node-fetch';

const appId = process.env.TMB_APP_ID || "eba925f8";
const appKey = process.env.TMB_APP_KEY || "2464f8dbaaa79d87a408b049a5340f60";

async function test() {
  try {
    // Fetch data for L9N stations
    const l9nCodes = '932,940,945,944,933,941,930,942,943';
    console.log('Fetching L9N station data...');
    const res9 = await fetch(`https://api.tmb.cat/v1/itransit/metro/estacions?estacions=${l9nCodes}&app_id=${appId}&app_key=${appKey}`);
    const data9 = await res9.json();
    
    console.log('\n=== L9 NORD Station Names ===');
    const l9nStations = new Map();
    
    if (data9.linies) {
      data9.linies.forEach(l => {
        if (l.estacions) {
          l.estacions.forEach(est => {
            if (!l9nStations.has(est.codi_estacio)) {
              // Try to find station name from linies_trajectes
              let name = `Station ${est.codi_estacio}`;
              if (est.linies_trajectes) {
                est.linies_trajectes.forEach(lt => {
                  if (lt.desti_trajecte) {
                    name = lt.desti_trajecte;
                  }
                });
              }
              l9nStations.set(est.codi_estacio, name);
            }
          });
        }
      });
    }
    
    l9nStations.forEach((name, code) => {
      console.log(`  ${code}: ${name}`);
    });
    
    // Fetch data for L10S stations  
    const l10sCodes = '958,951,953,954,956,957,959,914,915,916,952';
    console.log('\nFetching L10S station data...');
    const res10 = await fetch(`https://api.tmb.cat/v1/itransit/metro/estacions?estacions=${l10sCodes}&app_id=${appId}&app_key=${appKey}`);
    const data10 = await res10.json();
    
    console.log('\n=== L10 SUD Station Names ===');
    const l10sStations = new Map();
    
    if (data10.linies) {
      data10.linies.forEach(l => {
        if (l.estacions) {
          l.estacions.forEach(est => {
            if (!l10sStations.has(est.codi_estacio)) {
              let name = `Station ${est.codi_estacio}`;
              if (est.linies_trajectes) {
                est.linies_trajectes.forEach(lt => {
                  if (lt.desti_trajecte) {
                    name = lt.desti_trajecte;
                  }
                });
              }
              l10sStations.set(est.codi_estacio, name);
            }
          });
        }
      });
    }
    
    l10sStations.forEach((name, code) => {
      console.log(`  ${code}: ${name}`);
    });
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test().catch(console.error);
