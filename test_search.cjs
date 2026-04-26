require('dotenv').config({ path: '.env' });
const tmb = require('tmb.js/src/tmb.js');
// replace with actual env vars if needed
const api = tmb(process.env.VITE_TMB_APP_ID || "c57d76a2", process.env.VITE_TMB_APP_KEY || "562fb38de28fb7c4fc9b1ccf772baeea");
api.http.get('itransit/metro/estacions', { params: { estacions: '216,523' } }).then(res => {
  console.log(Object.keys(res));
  if (Array.isArray(res.features) || res.features) console.log("features", res.features.length);
}).catch(console.error);
