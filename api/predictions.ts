import "dotenv/config";
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const { line = 'L1', stationQuery = 'Fondo' } = request.query;
  
  response.json({ 
    message: "API working",
    params: { line, stationQuery },
    status: "ok"
  });
}