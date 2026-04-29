import 'dotenv/config';
import fetch from 'node-fetch';

const RENDER_API_KEY = 'rnd_wHv6CZqt9VNJAXrBUelPMsENpx4M';

async function getOwnerId() {
  try {
    const response = await fetch('https://api.render.com/v1/owners', {
      headers: {
        'Authorization': `Bearer ${RENDER_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('Owners:', JSON.stringify(data, null, 2));
    
    if (data && data.length > 0) {
      return data[0].ownerId || data[0].id;
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

getOwnerId();
