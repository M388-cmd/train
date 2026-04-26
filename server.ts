import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";

import tmb from "tmb.js/src/tmb.js";

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
      
      const searchRes = await api.search.query(String(stationQuery), { entitats: api.search.ENTITATS.ESTACIONS, detail: true });
      if (searchRes && searchRes.items && searchRes.items.length > 0) {
        const matchedItems = searchRes.items.filter((item: any) => 
          item.icona && item.icona.includes(String(line))
        );
        if (matchedItems.length > 0) {
          resolvedStationIds = matchedItems.map((st: any) => st.codi).join(',');
          foundStationName = matchedItems[0].nom || String(stationQuery);
        } else {
          resolvedStationIds = searchRes.items[0].codi; // fallback
          foundStationName = searchRes.items[0].nom || String(stationQuery);
        }
      } else {
        return res.status(404).json({ error: `No se encontró la estación "${stationQuery}"` });
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
