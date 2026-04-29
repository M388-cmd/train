import "dotenv/config";
import type { VercelRequest, VercelResponse } from '@vercel/node';
import tmb from "tmb.js/src/tmb.js";
import { findStationCode } from "../station-mapping.ts";

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const { line = 'L1', stationQuery = 'Fondo' } = request.query;
  
  try {
    const tmbAppId = process.env.TMB_APP_ID || 'eba925f8';
    const tmbAppKey = process.env.TMB_APP_KEY || '2464f8dbaaa79d87a408b049a5340f60';

    const api = tmb(tmbAppId, tmbAppKey);
    
    let resolvedStationIds = '122';
    let foundStationName = '';
    
    // Check if it's L9 or L10
    const isL9orL10 = String(line).toUpperCase().includes('L9') || String(line).toUpperCase().includes('L10');
    
    if (isL9orL10) {
      const stationCode = findStationCode(String(line), String(stationQuery));
      if (stationCode) {
        resolvedStationIds = String(stationCode);
        foundStationName = String(stationQuery);
      } else {
        return response.status(404).json({ error: `No se encontró la estación "${stationQuery}" para la línea ${line}` });
      }
    } else {
      const searchRes = await api.search.query(String(stationQuery), { entitats: api.search.ENTITATS.ESTACIONS, detail: true });
      const searchItems = searchRes?.docs || searchRes?.items || [];
      
      if (searchItems.length > 0) {
        const matchedItems = searchItems.filter((item: any) => 
          item.icona && item.icona.includes(String(line))
        );
        if (matchedItems.length > 0) {
          resolvedStationIds = matchedItems.map((st: any) => st.codi).join(',');
          foundStationName = matchedItems[0].nom || String(stationQuery);
        } else {
          resolvedStationIds = searchItems[0].codi;
          foundStationName = searchItems[0].nom || String(stationQuery);
        }
      } else {
        return response.status(404).json({ error: `No se encontró la estación "${stationQuery}"` });
      }
    }

    const json = await api.http.get(`itransit/metro/estacions`, {
      params: {
        estacions: resolvedStationIds
      }
    });

    response.json({
      data: json,
      stationName: foundStationName,
      resolvedStationIds
    });
  } catch (error: any) {
    response.status(500).json({ error: error.message });
  }
}