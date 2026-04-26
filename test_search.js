require('dotenv').config({ path: '.env' });
const tmb = require('tmb.js/src/tmb.js');
// replace with actual env vars if needed
const api = tmb(process.env.VITE_TMB_APP_ID || "c57d76a2", process.env.VITE_TMB_APP_KEY || "562fb38de28fb7c4fc9b1ccf772baeea");
api.search.query("Sagrada Familia", { entitats: api.search.ENTITATS.ESTACIONS, detail: true }).then(res => {
  console.log(JSON.stringify(res.docs, null, 2));
}).catch(console.error);
