import 'dotenv/config';
import tmb from 'tmb.js/src/tmb.js';

const api = tmb(
  process.env.TMB_APP_ID || "eba925f8", 
  process.env.TMB_APP_KEY || "2464f8dbaaa79d87a408b049a5340f60"
);

async function test() {
  const searches = [
    'Can Zam', 'Sant Adrià', 'Artigues', 'Llefià', 'Bon Pastor', 
    'Can Peguera', 'Fabra i Puig', 'Sant Pau', 'Guinardó', 
    'El Maresme', 'La Sagrera',
    'Zona Universitària', 'Collblanc', 'Palau Reial', 'Maria Cristina',
    'Can Tries', 'Provençana', 'Europa Fira', 'Foc', 'Alfons X', 'Gorg'
  ];
  
  for (const query of searches) {
    try {
      const res = await api.search.query(query, { 
        entitats: api.search.ENTITATS.ESTACIONS, 
        detail: true 
      });
      
      if (res && res.docs && res.docs.length > 0) {
        console.log(`\n=== ${query} ===`);
        res.docs.slice(0, 3).forEach(doc => {
          console.log(`  ${doc.nom} - codi: ${doc.codi}, icona: ${doc.icona}, linia: ${doc.linia || 'N/A'}`);
        });
      }
    } catch (err) {
      // Ignore errors
    }
  }
}

test().catch(console.error);
