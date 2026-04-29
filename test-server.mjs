import fetch from 'node-fetch';

async function test() {
  const tests = [
    { line: 'L9', station: 'Can Zam' },
    { line: 'L9', station: 'Sant Adria de Besos' },
    { line: 'L10', station: 'Zona Universitària' },
    { line: 'L10', station: 'Collblanc' },
    { line: 'L1', station: 'Fondo' },
  ];
  
  for (const t of tests) {
    try {
      console.log(`\nTesting: line=${t.line}, station=${t.station}`);
      const url = `http://localhost:3000/api/predictions?line=${encodeURIComponent(t.line)}&stationQuery=${encodeURIComponent(t.station)}`;
      const res = await fetch(url);
      const data = await res.json();
      console.log('Status:', res.status);
      console.log('Station:', data.stationName);
      console.log('IDs:', data.resolvedStationIds);
    } catch (err) {
      console.error('Error:', err.message);
    }
  }
}

test().catch(console.error);
