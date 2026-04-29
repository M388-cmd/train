import 'dotenv/config';
import tmb from 'tmb.js/src/tmb.js';

const api = tmb(process.env.TMB_APP_ID || "eba925f8", process.env.TMB_APP_KEY || "2464f8dbaaa79d87a408b049a5340f60");

async function test() {
  const stations = ['Can Zam', 'Gorg', 'La Sagrera', 'Zona Universitaria', 'Can Tries | Gornal', 'Provençana', 'Europa | Fira'];
  
  for (const station of stations) {
    try {
      console.log(`\n=== Searching: ${station} ===`);
      const res = await api.search.query(station, { 
        entitats: api.search.ENTITATS.ESTACIONS, 
        detail: true 
      });
      
      if (res && res.docs) {
        res.docs.forEach((item, idx) => {
          console.log(`Station ${idx}: ${item.nom}`);
          console.log(`  Codi: ${item.codi}`);
          console.log(`  Icona: ${item.icona}`);
          console.log(`  Linia: ${item.linia}`);
        });
      } else {
        console.log('No results');
      }
    } catch (err) {
      console.error(`Error searching ${station}:`, err.message);
    }
  }
}

test().catch(console.error);
