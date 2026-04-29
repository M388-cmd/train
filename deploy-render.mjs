// Script para desplegar en Render con nombre train-times3
// Ejecutar: node deploy-render.mjs

import 'dotenv/config';
import fetch from 'node-fetch';

const RENDER_API_KEY = process.env.RENDER_API_KEY; // Pon tu API key aquí
const GITHUB_REPO = 'https://github.com/M388-cmd/train';

async function deploy() {
  if (!RENDER_API_KEY) {
    console.error('ERROR: Necesitas configurar RENDER_API_KEY en .env');
    console.log('Obtenla de: https://dashboard.render.com/u/settings');
    process.exit(1);
  }

  console.log('Creando servicio en Render...');
  
  try {
    const response = await fetch('https://api.render.com/v1/services', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RENDER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'web_service',
        name: 'train-times3',
        repo: GITHUB_REPO,
        branch: 'main',
        buildCommand: 'npm install && npm run build',
        startCommand: 'npm start',
        envVars: [
          { key: 'NODE_ENV', value: 'production' },
          { key: 'TMB_APP_ID', value: 'eba925f8' },
          { key: 'TMB_APP_KEY', value: '2464f8dbaaa79d87a408b049a5340f60' },
          { key: 'GEMINI_API_KEY', value: 'AIzaSyBKp14bKUiDk7KZhdw97QmNWf2pW5k0VUc' }
        ],
        plan: 'free'
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Servicio creado exitosamente!');
      console.log('URL: https://train-times3.onrender.com');
      console.log('Dashboard: https://dashboard.render.com');
    } else {
      console.error('Error:', data);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

deploy();
