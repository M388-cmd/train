import "dotenv/config";
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const { line, stationQuery } = request.query;
  
  if (!line || !stationQuery) {
    return response.status(400).json({ error: "Missing line or stationQuery parameters" });
  }

  const tmbAppId = process.env.TMB_APP_ID || 'eba925f8';
  const tmbAppKey = process.env.TMB_APP_KEY || '2464f8dbaaa79d87a408b049a5340f60';

  try {
    const tmb = (await import('tmb.js')).default;
    const api = tmb(tmbAppId, tmbAppKey);
    
    let resolvedStationIds = '122';
    let foundStationName = '';
    
    const searchRes = await api.search.query(String(stationQuery), { entitats: api.search.ENTITATS.ESTACIONS, detail: true });
    
    if (searchRes && searchRes.items && searchRes.items.length > 0) {
      const matchedItems = searchRes.items.filter((item: any) => 
        item.icona && item.icona.includes(String(line))
      );
      if (matchedItems.length > 0) {
        resolvedStationIds = matchedItems.map((st: any) => st.codi).join(',');
        foundStationName = matchedItems[0].nom || String(stationQuery);
      } else {
        resolvedStationIds = searchRes.items[0].codi;
        foundStationName = searchRes.items[0].nom || String(stationQuery);
      }
    } else {
      return response.status(404).json({ error: `No se encontró la estación "${stationQuery}"` });
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
    console.error("Error:", error);
    response.status(500).json({ error: error.message || "Error" });
  }
}