import fetch from 'node-fetch';

async function test() {
  const tests = [
    { line: 'L9', station: 'Can Zam' },
    { line: 'L10', station: 'Zona Universitària' },
    { line: 'L1', station: 'Fondo' },
  ];
  
  for (const t of tests) {
    try {
      console.log(`\nTesting: line=${t.line}, station=${t.station}`);
      const res = await fetch(`http://localhost:3000/api/predictions?line=${encodeURIComponent(t.line)}&stationQuery=${encodeURIComponent(t.station)}`);
      const data = await res.json();
      console.log('Status:', res.status);
      console.log('Station:', data.stationName);
      console.log('IDs:', data.resolvedStationIds);
      if (data.data && data.data.linies) {
        console.log('Lines returned:', data.data.linies.map(l => l.nom_linia).join(', '));
      }
    } catch (err) {
      console.error('Error:', err.message);
    }
  }
}

test().catch(console.error);
