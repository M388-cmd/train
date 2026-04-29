// Script para desplegar en Render con nombre train-times3
// Ejecutar: node deploy-render.mjs

import fetch from 'node-fetch';

const RENDER_API_KEY = 'rnd_wHv6CZqt9VNJAXrBUelPMsENpx4M';
const OWNER_ID = 'tea-ctdhfg5umphs7383c6c0';
const GITHUB_REPO = 'M388-cmd/train';

async function deploy() {
  console.log('Creando servicio en Render...');
  
  try {
    // Estructura: repo fuera, runtime dentro de serviceDetails con envSpecificDetails
    const payload = {
      type: 'web_service',
      name: 'train-times3-miguel',
      ownerId: OWNER_ID,
      repo: 'https://github.com/M388-cmd/train',
      serviceDetails: {
        runtime: 'node',
        envSpecificDetails: {
          buildCommand: 'npm install && npm run build',
          startCommand: 'npm start'
        },
        branch: 'main',
        plan: 'free',
        envVars: [
          { key: 'NODE_ENV', value: 'production' },
          { key: 'TMB_APP_ID', value: 'eba925f8' },
          { key: 'TMB_APP_KEY', value: '2464f8dbaaa79d87a408b049a5340f60' },
          { key: 'GEMINI_API_KEY', value: 'AIzaSyBKp14bKUiDk7KZhdw97QmNWf2pW5k0VUc' }
        ],
        autoDeploy: 'yes'
      }
    };
    
    console.log('Enviando petición...');
    console.log('Payload:', JSON.stringify(payload, null, 2));
    
    const response = await fetch('https://api.render.com/v1/services', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RENDER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Servicio creado exitosamente!');
      console.log('Service details:', JSON.stringify(data, null, 2));
      console.log('URL: https://train-times3.onrender.com');
      console.log('Dashboard: https://dashboard.render.com');
    } else {
      console.error('Error:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

deploy();
