import "dotenv/config";
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const { line = 'L1', stationQuery = 'Fondo' } = request.query;
  
  try {
    const tmbAppId = process.env.TMB_APP_ID || 'eba925f8';
    const tmbAppKey = process.env.TMB_APP_KEY || '2464f8dbaaa79d87a408b049a5340f60';

    response.json({ 
      message: "API working",
      keys: {
        TMB_APP_ID: tmbAppId ? 'SET' : 'MISSING',
        TMB_APP_KEY: tmbAppKey ? 'SET' : 'MISSING'
      },
      params: { line, stationQuery }
    });
  } catch (error: any) {
    response.status(500).json({ error: error.message });
  }
}