import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";

import tmb from "tmb.js/src/tmb.js";
import { findStationCode } from "./station-mapping.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  const server = http.createServer(app);

  app.use(express.json());

  // API route for TMB predictions
  app.get("/api/predictions", async (req, res) => {
    const { line, stationQuery } = req.query;
    
    if (!line || !stationQuery) {
      return res.status(400).json({ error: "Missing line or stationQuery parameters" });
    }

    const tmbAppId = process.env.TMB_APP_ID || 'eba925f8';
    const tmbAppKey = process.env.TMB_APP_KEY || '2464f8dbaaa79d87a408b049a5340f60';

    if (!tmbAppId || !tmbAppKey) {
      return res.status(500).json({ error: "TMB API keys not configured on server" });
    }

    try {
      
      const api = tmb(tmbAppId, tmbAppKey);
      
      let resolvedStationIds = '122'; // fallback original
      let foundStationName = '';
      
      // Check if it's L9 or L10 (lines with different search behavior)
      const isL9orL10 = String(line).toUpperCase().includes('L9') || String(line).toUpperCase().includes('L10');
      
      if (isL9orL10) {
        // Use station mapping for L9 Nord and L10 Sud
        const stationCode = findStationCode(String(line), String(stationQuery));
        if (stationCode) {
          resolvedStationIds = String(stationCode);
          foundStationName = String(stationQuery);
        } else {
          return res.status(404).json({ error: `No se encontró la estación "${stationQuery}" para la línea ${line}` });
        }
      } else {
        // Use search API for other lines
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
            resolvedStationIds = searchItems[0].codi; // fallback
            foundStationName = searchItems[0].nom || String(stationQuery);
          }
        } else {
          return res.status(404).json({ error: `No se encontró la estación "${stationQuery}"` });
        }
      }

const json = await api.http.get(`itransit/metro/estacions`, {
          params: {
              estacions: resolvedStationIds
          }
      });

      console.log('API response:', JSON.stringify(json).slice(0, 500));

      res.json({
        data: json,
        stationName: foundStationName,
        resolvedStationIds
      });
    } catch (error: any) {
      console.error("Error fetching TMB data:", error);
      res.status(500).json({ error: error.message || "Error procesando petición TMB" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
