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
    
    // Find propers_trens
    if (data.linies) {
      data.linies.forEach(l => {
        if (l.estacions) {
          l.estacions.forEach(est => {
            if (est.linies_trajectes) {
              est.linies_trajectes.forEach(lt => {
                if (lt.propers_trens && lt.propers_trens.length > 0) {
                  console.log(`Found ${lt.propers_trens.length} trains for ${lt.nom_linia} to ${lt.desti_trajecte}`);
                  console.log('First train:', JSON.stringify(lt.propers_trens[0]));
                }
              });
            }
          });
        }
      });
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test().catch(console.error);
