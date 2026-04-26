const tmb = require('tmb.js/src/tmb.js');
require('dotenv').config();
const api = tmb(process.env.TMB_APP_ID, process.env.TMB_APP_KEY);

api.http.get('transit/alertes').then(res => console.log('alertes', res)).catch(e => console.error('alertes err', e.message));
api.http.get('transit/linies/metro/estats').then(res => console.log('estats', res)).catch(e => console.error('estats', e.message));
api.http.get('transit/avisos').then(res => console.log('avisos', res)).catch(e => console.error('avisos', e.message));
api.http.get('transit/incidencies').then(res => console.log('incidencies', res)).catch(e => console.error('incidencies', e.message));
