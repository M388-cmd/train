/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCw, Settings, Info, MessageSquare, X, Send, Bot, Mic, MicOff } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

// Constantes para la API de TMB (Transports Metropolitans de Barcelona)
// Ahora se manejan en el servidor.
// Si deseas probar sin keys, activa el modo demo.

interface Prediction {
  id: string;
  routeId: string;
  destination: string;
  timeInMin: number;
  arrivalMs: number | null;
}

export default function App() {
  const [line, setLine] = useState('L1');
  const [stationQuery, setStationQuery] = useState('Fondo');
  
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [stationName, setStationName] = useState<string | null>(null);
  const [incidentText, setIncidentText] = useState<string | null>(null);

  /**
   * Obtiene los datos de la API de TMB (iTransit)
   */
  const fetchPredictions = useCallback(async () => {
    setLoading(true);
    setError(null);
    setCountdown(30);
    
    try {
      const response = await fetch(`/api/predictions?line=${encodeURIComponent(line)}&stationQuery=${encodeURIComponent(stationQuery)}`);
      
      if (!response.ok) {
         let errMessage = `Error del servidor: ${response.status}`;
         try {
             const errData = await response.json();
             errMessage = errData.error || errMessage;
         } catch(e) {}
         throw new Error(errMessage);
      }
      
      const { data: json, stationName: foundStationName, resolvedStationIds } = await response.json();
      
      // Búsqueda profunda de cualquier array de trenes/predicciones
      const findArrays = (obj: any, arraysFound: any[] = []) => {
         if (!obj) return arraysFound;
         if (Array.isArray(obj)) {
             arraysFound.push(obj);
             obj.forEach(item => findArrays(item, arraysFound));
         } else if (typeof obj === 'object') {
             Object.values(obj).forEach(val => findArrays(val, arraysFound));
         }
         return arraysFound;
      };

      const arrays = findArrays(json);
      
      // Combinar todos los arrays encontrados
      let parseableFeatures: any[] = [];
      arrays.forEach(arr => {
         arr.forEach((item: any) => {
             if (item && typeof item === 'object') {
                 parseableFeatures.push(item);
             }
         });
      });

      if (Object.keys(json).length > 0 && parseableFeatures.length === 0) {
          parseableFeatures = [json]; // Si no hay arrays, tratamos el root como feature
      }

      if (parseableFeatures.length > 0) {
         let stationNameFallback = foundStationName ? foundStationName.toUpperCase() : `ESTACIÓN ${stationQuery || resolvedStationIds}`;
         let allMapped: Prediction[] = [];
         
         for (const feature of parseableFeatures) {
             const properties = feature.properties || feature || {};
             
             // Actualizar nombre de la estación
             const name = properties.NOM_ESTACIO || properties.nom_estacio || properties.name || properties.nomEstacio;
             if (name && stationNameFallback === `ESTACIÓN ${stationQuery || resolvedStationIds}`) {
                 stationNameFallback = name.toUpperCase();
             }
             
             let featureTrains: any[] = [];
             
             // Estructura L9/L10: linies_trajectes[].propers_trens[]
             if (properties.linies_trajectes && Array.isArray(properties.linies_trajectes)) {
               properties.linies_trajectes.forEach((lt: any) => {
                 if (lt.propers_trens && Array.isArray(lt.propers_trens)) {
                   featureTrains = featureTrains.concat(lt.propers_trens.map((t: any) => ({
                     ...t,
                     linia: lt.nom_linia || lt.linia,
                     destinacio: lt.desti_trajecte || lt.desti,
                     temps_arribada: t.temps_arribada || t.temps_en_minuts
                   })));
                 }
               });
             }
             
             // Estructura estándar
             if (featureTrains.length === 0) {
               const possibleTrainKeys = ['trens', 'propers_trens', 'proper_tren', 'trains', 'predictions', 'PI', 'pi', 'trens_arribada'];
               for (const key of possibleTrainKeys) {
                 if (Array.isArray(properties[key])) {
                   featureTrains = properties[key];
                   break;
                 }
               }
             }
             
             if (featureTrains.length > 0) {
                 const mapped = featureTrains.map((item: any) => {
                   let timeVal = item.temps_arribada || item.temps_en_minuts || item['t-in-min'] || item.tempsEsperat || item.timeInMin || item.min || 0;
                   let calculatedMin = 0;
                   let arrivalMs: number | null = null;
                   
                   if (timeVal > 1000000000000) {
                     arrivalMs = timeVal;
                     const diffMs = timeVal - Date.now();
                     calculatedMin = Math.max(0, Math.round(diffMs / 60000));
                   } else {
                     calculatedMin = parseInt(timeVal, 10) || 0;
                   }
                   
                   return {
                     id: Math.random().toString(36).substring(7),
                     routeId: item.linia || item.routeId || item.line || item.nomLinia || properties.nom_linia || line,
                     destination: (item.destinacio || item.desti || item.destination || item.destino || 'DESTINO NO DISPONIBLE').toUpperCase(),
                     timeInMin: calculatedMin,
                     arrivalMs
                   };
                 });
                 allMapped = allMapped.concat(mapped);
             }
         }
         
         setStationName(stationNameFallback);
         allMapped.sort((a, b) => a.timeInMin - b.timeInMin);
         setPredictions(allMapped);
         
      } else {
                       // Standard structure
                       timeVal = item.temps_en_minuts || item.temps_arribada || item['t-in-min'] || item.tempsEsperat || item.timeInMin || item.min || 0;
                       if (timeVal > 1000000000000) {
                         arrivalMs = timeVal;
                         const diffMs = timeVal - Date.now();
                         timeVal = Math.max(0, Math.round(diffMs / 60000));
                       } else {
                         timeVal = parseInt(timeVal, 10) || 0;
                       }
                     }
                     
                     return {
                         id: Math.random().toString(36).substring(7),
                         routeId: item.linia || item.routeId || item.line || item.nomLinia || properties.nom_linia || line,
                         destination: (item.destinacio || item.desti || item.destination || item.destino || item.desti_trajecte || 'DESTINO NO DISPONIBLE').toUpperCase(),
                         timeInMin: timeVal,
                         arrivalMs
                     };
                 });
                 allMapped = allMapped.concat(mapped);
               }
         }
         
         setStationName(stationNameFallback);
         allMapped.sort((a, b) => a.timeInMin - b.timeInMin);
         setPredictions(allMapped);
         
      } else {
                      calculatedMin = parseInt(timeVal, 10) || 0;
                    }
                    return {
                      id: Math.random().toString(36).substring(7),
                      routeId: item.linia || item.routeId || item.line || item.nomLinia || properties.nom_linia || line,
                      destination: (item.destinacio || item.desti || item.destination || item.destino || tren.linies_trajectes?.[0]?.desti_trajecte || 'DESTINO NO DISPONIBLE').toUpperCase(),
                      timeInMin: calculatedMin,
                      arrivalMs
                    };
                  });
                }
              } else {
                // Los trenes ya están en mapped (estructura L9/L10)
                mapped = mapped.map((item: any) => {
                  let timeVal = item.temps_en_minuts || item.temps_arribada || item['t-in-min'] || item.tempsEsperat || item.timeInMin || item.min || 0;
                  let calculatedMin = 0;
                  let arrivalMs: number | null = null;
                  if (timeVal > 1000000000000) {
                    arrivalMs = timeVal;
                    const diffMs = timeVal - Date.now();
                    calculatedMin = Math.max(0, Math.round(diffMs / 60000));
                  } else {
                    calculatedMin = parseInt(timeVal, 10) || 0;
                  }
                  return {
                    id: Math.random().toString(36).substring(7),
                    routeId: item.linia || item.routeId || item.line || item.nomLinia || properties.nom_linia || line,
                    destination: (item.destinacio || item.desti || item.destination || item.destino || 'DESTINO NO DISPONIBLE').toUpperCase(),
                    timeInMin: calculatedMin,
                    arrivalMs
                  };
                });
              }
             }

             if (foundTrains.length > 0) {
                 mapped = foundTrains.map((item: any) => {
                     let timeVal = item.temps_en_minuts || item.temps_arribada || item['t-in-min'] || item.tempsEsperat || item.timeInMin || item.min || 0;
                     let calculatedMin = 0;
                     let arrivalMs: number | null = null;
                     // Si es un timestamp (en milisegundos)
                     if (timeVal > 1000000000000) {
                        arrivalMs = timeVal;
                        // Hacemos el cálculo inicial para ordenarlos correctamente antes de the react hook loop:
                        const diffMs = timeVal - Date.now();
                        calculatedMin = Math.max(0, Math.round(diffMs / 60000));
                     } else {
                        calculatedMin = parseInt(timeVal, 10) || 0;
                     }

                     return {
                         id: Math.random().toString(36).substring(7),
                         routeId: item.linia || item.routeId || item.line || item.nomLinia || properties.nom_linia || line,
                         destination: (item.destinacio || item.desti || item.destination || item.destino || properties.desti_trajecte || 'DESTINO NO DISPONIBLE').toUpperCase(),
                         timeInMin: calculatedMin,
                         arrivalMs
                     };
                 });
             } else {
                 for (const key of Object.keys(properties)) {
                     const value = properties[key];
                     if (typeof value === 'string' && (value.toLowerCase().includes('min') || !isNaN(parseInt(value, 10)))) {
                         const match = value.match(/(.*?)(?:-|\s)?\s(\d+)\s*(?:min|')/i);
                         if (match && match.length >= 3) {
                             const time = parseInt(match[2], 10);
                             let dest = match[1].trim();
                             dest = dest.replace(new RegExp(`^${line}\\s+`, 'i'), '').trim();
                             
                             if (dest.length > 0) {
                               mapped.push({
                                  id: Math.random().toString(36).substring(7),
                                  routeId: line,
                                  destination: dest.toUpperCase(),
                                  timeInMin: time,
                                  arrivalMs: Date.now() + time * 60000
                               });
                             }
                         }
                     }
                 }
             }
             allMapped = [...allMapped, ...mapped];
         }
         
         setStationName(stationNameFallback);
         
         // Ordenar todas las predicciones por tiempo ascendente
         allMapped.sort((a, b) => a.timeInMin - b.timeInMin);
         
         // Filtramos asegurando que mostramos valores coherentes
         setPredictions(allMapped);
         
      } else {
         throw new Error(`La API no devolvió información para esta estación. Data: ${JSON.stringify(json).slice(0, 150)}`);
      }
    } catch (err: any) {
      console.error(err);
      
      let finalErrorMessage = err.message || 'Ocurrió un error obteniendo los datos de los trenes próximos.';
      if (finalErrorMessage === 'Failed to fetch') {
         finalErrorMessage = 'Error de red: No se pudo conectar al servidor de TMB.';
      }
      
      setError(finalErrorMessage);
      
      setPredictions((prev) => {
         // Si es un error 404 (estación no encontrada), borramos pantalla
         if (finalErrorMessage.includes('404')) return [];
         // Si es falla de red pero ya teníamos datos, los mantenemos en pantalla
         return prev;
      });
    } finally {
      setLoading(false);
    }
  }, [line, stationQuery]);

  useEffect(() => {
    fetchPredictions();
    
    const interval = setInterval(fetchPredictions, 30000);
    const tick = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 30));
        
        // Recalcular minutos en tiempo real basado en el timestamp de llegada
        setPredictions(prev => prev.map(p => {
           if (p.arrivalMs) {
             const diffMs = p.arrivalMs - Date.now();
             const newMin = Math.max(0, Math.round(diffMs / 60000));
             if (newMin !== p.timeInMin && newMin >= 0) {
                return { ...p, timeInMin: newMin };
             }
           }
           return p;
        }));
    }, 1000);

    return () => {
        clearInterval(interval);
        clearInterval(tick);
    }
  }, [fetchPredictions]);

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white font-mono flex flex-col items-center py-6 px-4 md:px-8">
      
      <div className="w-full max-w-5xl flex flex-col flex-1">
        
        {/* Header Section: App Brand & Controls */}
        <header className="flex flex-col sm:flex-row justify-between items-center sm:items-start md:items-center gap-6 mb-8 border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-4 shrink-0">
            <div className="w-10 h-10 bg-[#FF3131] rounded-sm flex items-center justify-center font-bold text-black text-xl shrink-0">M</div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tighter text-zinc-100 uppercase">Miguel Train Times</h1>
          </div>
          <div className="flex gap-4 md:gap-6 items-center text-[10px] md:text-xs uppercase tracking-widest text-zinc-500 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex flex-col gap-1 items-start">
              <span>Estado</span>
              <span className="text-green-500 flex items-center gap-2">
                 <span className={`w-2 h-2 rounded-full bg-green-500 ${loading ? '' : 'animate-pulse'}`}></span> 
                 {loading ? 'Consultando' : 'Sistema Online'}
              </span>
            </div>
            <div className="flex flex-col gap-1 items-start">
              <span>Ubicación</span>
              <span className="text-zinc-200">{stationName || stationQuery} ({line.toUpperCase()})</span>
            </div>
            <div className="flex flex-col gap-1 items-start min-w-[60px]">
              <span>Actualiza en</span>
              <span className="text-zinc-200">{countdown}s</span>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsAIChatOpen(true)}
                className="p-2 rounded transition-colors text-zinc-500 hover:text-white hover:bg-zinc-800"
                title="Asistente IA"
              >
                <MessageSquare className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setShowConfig(!showConfig)}
                className={`p-2 rounded transition-colors ${showConfig ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
                title="Authentication Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Authentication Config Menu */}
        {showConfig && (
          <div className="w-full bg-zinc-900 border border-zinc-800 rounded p-6 mb-8 shadow-inner relative animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-zinc-500 text-xs uppercase tracking-widest">Configuración e Incidencias</span>
            </div>
            <p className="text-sm text-zinc-400 mb-4">Usa este panel para simular avisos e incidencias operativas en el teleindicador.</p>
            <div className="flex flex-col gap-2 relative w-full">
               <label className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Mensaje de Incidencia (Simulador)</label>
               <input 
                  value={incidentText || ''} 
                  onChange={(e) => setIncidentText(e.target.value.length > 0 ? e.target.value : null)}
                  className="px-4 py-3 bg-zinc-950 border border-zinc-800 text-white font-bold text-sm lg:text-base rounded-md focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 font-mono transition-all placeholder:text-zinc-700"
                  placeholder="Ej: L1 funciona fora del seu horari habitual per incidència tècnica"
               />
               <div className="flex gap-2 flex-wrap mt-2">
                 <button onClick={() => setIncidentText("L1 FUNCIONA DE FORMA PARCIAL PER INCIDÈNCIA TÈCNICA. DISCULPIN LES MOLÈSTIES.")} className="px-3 py-1 bg-zinc-800 text-xs text-zinc-300 rounded hover:bg-zinc-700">Incidencia L1</button>
                 <button onClick={() => setIncidentText("SERVEI ALTERNATIU AMB AUTOBÚS ENTRE LES ESTACIONS DE FONDO I LA SAGRERA.")} className="px-3 py-1 bg-zinc-800 text-xs text-zinc-300 rounded hover:bg-zinc-700">Aviso Bus</button>
                 <button onClick={() => setIncidentText(null)} className="px-3 py-1 bg-red-900/40 text-red-400 text-xs rounded hover:bg-red-900/60">Limpiar Incidencia</button>
               </div>
            </div>
          </div>
        )}

        {/* Interaction Bar: Station & Line Selection */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 md:p-6 mb-8 shadow-2xl flex flex-col gap-4">
           <div className="flex flex-col lg:flex-row gap-4 items-end">
              <div className="flex-1 flex flex-col gap-2 relative w-full">
                <label className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Línea</label>
                <input 
                   value={line} 
                   onChange={(e) => setLine(e.target.value.toUpperCase())}
                   className="px-4 py-3 bg-zinc-950 border border-zinc-800 text-yellow-400 font-bold text-lg rounded-md focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 font-mono uppercase transition-all placeholder:text-zinc-700"
                   placeholder="L1"
                />
              </div>
              <div className="flex-[3] flex flex-col gap-2 relative w-full">
                <label className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Nombre Estación de Tren</label>
                <input 
                   value={stationQuery} 
                   onChange={(e) => setStationQuery(e.target.value)}
                   className="px-4 py-3 bg-zinc-950 border border-zinc-800 text-white font-bold text-lg rounded-md focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 font-mono transition-all placeholder:text-zinc-700"
                   placeholder="Fondo"
                />
              </div>
              <button 
                 onClick={fetchPredictions}
                 disabled={loading}
                 className="w-full lg:w-auto px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-black rounded-md text-sm uppercase tracking-widest transition-all font-bold flex items-center justify-center gap-2 group h-[52px] shadow-[0_0_15px_rgba(234,179,8,0.15)] hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                 <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                 {loading ? 'Buscando...' : 'Refrescar'}
              </button>
           </div>
        </div>

        {error && !loading && (
          <div className="w-full bg-red-900/20 border border-red-900 text-red-400 p-4 rounded mb-8 flex items-start gap-3 shadow-inner">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm uppercase tracking-wider mb-1">System Error</p>
              <p className="text-xs opacity-90">{error}</p>
            </div>
          </div>
        )}

        {/* Main Display Area: Simulated Metro de Madrid LED Hardware */}
        <main className="w-full flex-1 relative flex items-center justify-center min-h-[300px] mb-8">
          {/* Hardware Casing */}
          <div className="w-full max-w-4xl bg-[#1a1a1a] rounded-xl border-[4px] border-[#2a2a2a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative p-1.5 flex flex-col aspect-[16/9] sm:aspect-auto sm:h-[400px]">
            {/* Corner Screws */}
            <div className="absolute top-3 left-3 w-3 h-3 bg-zinc-600 rounded-full border-b border-zinc-400 shadow-sm z-10 hidden sm:block"></div>
            <div className="absolute top-3 right-3 w-3 h-3 bg-zinc-600 rounded-full border-b border-zinc-400 shadow-sm z-10 hidden sm:block"></div>
            <div className="absolute bottom-3 left-3 w-3 h-3 bg-zinc-600 rounded-full border-b border-zinc-400 shadow-sm z-10 hidden sm:block"></div>
            <div className="absolute bottom-3 right-3 w-3 h-3 bg-zinc-600 rounded-full border-b border-zinc-400 shadow-sm z-10 hidden sm:block"></div>

            {/* The LED Panel */}
            <div className="w-full h-full bg-black rounded-lg overflow-hidden flex flex-col p-4 sm:p-6 md:p-8 relative shadow-inner">
              {/* Scanline / Dot Grid Overlay Effect */}
              <div className="absolute inset-0 pointer-events-none opacity-20 z-20" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '3px 3px' }}></div>
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/30 z-20 pointer-events-none mix-blend-overlay" />
              
              <div className="relative z-10 flex flex-col w-full h-full">
                 {loading && predictions.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                       <span className="text-[#00FF41] text-4xl md:text-5xl lg:text-6xl font-bold tracking-[0.2em] drop-shadow-[0_0_10px_rgba(0,255,65,0.4)] opacity-80 uppercase">
                         CARGANDO...
                       </span>
                    </div>
                 ) : predictions.length === 0 && !error ? (
                    <div className="flex-1 flex items-center justify-center text-center">
                       <span className="text-[#FF3131] text-4xl md:text-5xl lg:text-6xl font-bold tracking-[0.2em] drop-shadow-[0_0_10px_rgba(255,49,49,0.4)] uppercase">
                         NO HAY TRENES PROGRAMADOS
                       </span>
                    </div>
                 ) : (
                    <TeleindicadorDisplay predictions={predictions} incidentText={incidentText} />
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Footer Bar: Technical Data */}
        <footer className="w-full flex flex-col md:flex-row gap-4 justify-between items-center text-[10px] text-zinc-600 font-mono tracking-[0.2em] uppercase border-t border-zinc-900 pt-6 pb-2">
          <div className="flex gap-4 md:gap-8 flex-wrap justify-center text-center md:text-left">
            <span>Endpoint: /v1/itransit/metro/estacions + search</span>
            <span className="hidden sm:inline">Protocol: HTTPS/TLS 1.3</span>
          </div>
          <div className="flex gap-4 flex-wrap justify-center text-center md:text-right">
            <span className="text-zinc-500">
              TMB DEVELOPER PORTAL AUTH: ACTIVE
            </span>
            <span className="hidden sm:inline">© {new Date().getFullYear()} MIGUEL DEV TRAIN SYSTEMS</span>
          </div>
        </footer>

      </div>
      <AIChatModal isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />
    </div>
  );
}

/**
 * Lógica del teleindicador de andén replicando los mensajes de Metro.
 */
function TeleindicadorDisplay({ predictions, incidentText }: { predictions: Prediction[], incidentText?: string | null }) {
  const [displayState, setDisplayState] = useState(0);
  const [activeDestIndex, setActiveDestIndex] = useState(0);

  const destinations = Array.from(new Set(predictions.map(p => p.destination)));

  useEffect(() => {
    // Alternar constantemente entre destino y tiempos de llegada, y luego cambiar de andén
    const interval = setInterval(() => {
      setDisplayState(prev => {
         if (prev === 0) {
            return 1;
         } else {
            setActiveDestIndex(d => (d + 1) % destinations.length);
            return 0;
         }
      });
    }, 4000); // Cambia cada 4 segundos
    return () => clearInterval(interval);
  }, [destinations.length]);

  // Si las predicciones cambian y el índice actual queda fuera de rango, resetear
  useEffect(() => {
     if (activeDestIndex >= destinations.length) {
       setActiveDestIndex(0);
     }
  }, [destinations.length, activeDestIndex]);

  if (predictions.length === 0 || destinations.length === 0) return null;

  const currentDest = destinations[activeDestIndex];
  const destTrains = predictions.filter(p => p.destination === currentDest);

  const firstTrain = destTrains[0];
  const secondTrain = destTrains.length > 1 ? destTrains[1] : null;

  if (firstTrain.timeInMin <= 0) {
    // Cuando el tren está en la estación o a punto de abrir puertas
    return (
      <div className="flex-1 flex flex-col justify-center w-full h-full text-[#FF9900] text-3xl sm:text-4xl md:text-5xl font-bold tracking-widest drop-shadow-[0_0_8px_rgba(255,153,0,0.8)] uppercase leading-relaxed py-4 relative">
        <div className="absolute top-2 left-2 text-sm opacity-50 z-10 hidden sm:block">SENTIDO: {currentDest}</div>
        <div className="flex-1 flex items-center justify-center">PROXIMO TREN</div>
        <div className="flex-1 flex items-center justify-center">VA A EFECTUAR SU</div>
        <div className="flex-1 flex items-center justify-center mb-2">ENTRADA EN LA ESTACION</div>
        <div className="flex-1 flex items-center overflow-hidden w-full relative pt-2">
           <div className="animate-marquee whitespace-nowrap pl-[100%] text-[#FF3131] text-4xl md:text-6xl drop-shadow-[0_0_10px_rgba(255,49,49,0.8)]">
             DEJEN SALIR ANTES DE ENTRAR
           </div>
        </div>
      </div>
    );
  }

  // Interfaz iterante: Destino -> Próximo Tren
  return (
    <div className="flex-1 flex flex-col justify-center items-center w-full h-full text-[#FF9900] font-bold tracking-widest drop-shadow-[0_0_8px_rgba(255,153,0,0.8)] uppercase relative">
      <div className="flex-1 relative w-full flex items-center justify-center pt-8">
        {/* 1. Destino */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500 ${displayState === 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="text-4xl sm:text-5xl md:text-6xl text-center leading-snug">
             ANDEN SENTIDO<br/><span className="mt-4 block">{currentDest}</span>
          </div>
        </div>
        
        {/* 2. Próximos Trenes */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500 ${displayState === 1 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="absolute top-2 left-2 text-sm opacity-50 z-10 hidden sm:block">SENTIDO: {currentDest}</div>
          <div className="text-3xl sm:text-4xl md:text-5xl text-center leading-snug">
             PROXIMO TREN LLEGARA EN:<br/>
             <span className="mt-4 block text-[#FF3131] text-5xl md:text-7xl drop-shadow-[0_0_12px_rgba(255,49,49,0.8)]">
                {firstTrain.timeInMin.toString().padStart(2, '0')} MIN
             </span>
             {secondTrain && (
                <span className="mt-6 block text-[#FF9900] text-xl sm:text-2xl md:text-3xl drop-shadow-[0_0_8px_rgba(255,153,0,0.8)] opacity-90">
                   SIGUIENTE TREN: {secondTrain.timeInMin.toString().padStart(2, '0')} MIN
                </span>
             )}
          </div>
        </div>
      </div>

      {/* 3. Incidencias Marquee (si existe) */}
      {incidentText && (
         <div className="w-full flex-shrink-0 h-16 sm:h-20 lg:h-24 bg-[#FF3131]/10 border-t-2 border-[#FF3131]/30 flex items-center overflow-hidden relative">
            <div className="animate-marquee whitespace-nowrap pl-[100%] text-[#FF3131] text-3xl sm:text-4xl lg:text-5xl font-bold drop-shadow-[0_0_12px_rgba(255,49,49,0.9)]">
              AVISO: {incidentText}
            </div>
         </div>
      )}
    </div>
  );
}

function AIChatModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [inputText, setInputText] = useState('');
  
  const [liveSession, setLiveSession] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const playbackQueueRef = useRef<Float32Array[]>([]);
  const isPlayingRef = useRef(false);
  const playbackContextRef = useRef<AudioContext | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !liveSession) {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const sessionPromise = ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        callbacks: {
          onopen: () => {
             setIsConnected(true);
             setMessages([{ role: 'model', text: '¡Hola! Estoy conectado en modo Voz (Gemini Live). Puedes escribirme o usar el micrófono para hablarme. ¿En qué te ayudo?' }]);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
               playAudio(base64Audio);
            }
          },
          onclose: () => setIsConnected(false)
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
             voiceConfig: { prebuiltVoiceConfig: { voiceName: "Puck" } }
          },
          systemInstruction: "Eres un asistente amable, útil y experto en el sistema de Metro. Responde a preguntas de manera conversacional y concisa. Estás hablando de viva voz."
        }
      });
      setLiveSession(sessionPromise);
    } else if (!isOpen) {
       stopRecording();
       if (liveSession) {
           liveSession.then((s: any) => s.close());
       }
       setLiveSession(null);
       setIsConnected(false);
       setMessages([]);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isConnected, isRecording]);

  const playAudioQueue = async () => {
    if (isPlayingRef.current || playbackQueueRef.current.length === 0) return;
    isPlayingRef.current = true;
    
    if (!playbackContextRef.current) {
        playbackContextRef.current = new AudioContext({ sampleRate: 24000 });
    }
    
    while (playbackQueueRef.current.length > 0) {
        const pcm = playbackQueueRef.current.shift()!;
        const audioBuffer = playbackContextRef.current.createBuffer(1, pcm.length, 24000);
        audioBuffer.getChannelData(0).set(pcm);
        
        const source = playbackContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(playbackContextRef.current.destination);
        source.start();
        
        await new Promise(resolve => { source.onended = resolve; });
    }
    
    isPlayingRef.current = false;
  };

  const playAudio = (b64: string) => {
      const binary = atob(b64);
      const pcmBytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
         pcmBytes[i] = binary.charCodeAt(i);
      }
      const pcm16 = new Int16Array(pcmBytes.buffer);
      const pcmFloat = new Float32Array(pcm16.length);
      for (let i = 0; i < pcm16.length; i++) {
         pcmFloat[i] = pcm16[i] / 32768;
      }
      
      playbackQueueRef.current.push(pcmFloat);
      playAudioQueue();
  };

  const startRecording = async () => {
     try {
       const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
       mediaStreamRef.current = stream;
       audioContextRef.current = new AudioContext({ sampleRate: 16000 });
       const source = audioContextRef.current.createMediaStreamSource(stream);
       const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
       
       processor.onaudioprocess = (e) => {
         const inputData = e.inputBuffer.getChannelData(0);
         const pcm16 = new Int16Array(inputData.length);
         for (let i = 0; i < inputData.length; i++) {
            let s = Math.max(-1, Math.min(1, inputData[i]));
            pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
         }
         const buffer = new Uint8Array(pcm16.buffer);
         let binary = "";
         for (let i = 0; i < buffer.byteLength; i++) {
            binary += String.fromCharCode(buffer[i]);
         }
         const base64 = btoa(binary);
         
         if (liveSession) {
            liveSession.then((s: any) => s.sendRealtimeInput([{ audio: { mimeType: "audio/pcm;rate=16000", data: base64 } }]));
         }
       };
       
       source.connect(processor);
       processor.connect(audioContextRef.current.destination);
       processorRef.current = processor;
       setIsRecording(true);
     } catch (err) {
       console.error("Mic error", err);
       alert("No se pudo acceder al micrófono. Por favor, asegúrate de haber concedido los permisos en tu navegador.");
     }
  };

  const stopRecording = () => {
      setIsRecording(false);
      if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current = null;
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
        mediaStreamRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
  }
  
  const toggleRecording = () => {
      if (isRecording) stopRecording();
      else startRecording();
  };

  const handleSendText = () => {
      if (!inputText.trim() || !liveSession) return;
      const text = inputText.trim();
      setMessages(prev => [...prev, { role: 'user', text }]);
      liveSession.then((s: any) => s.sendClientContent({ turns: [{ role: "user", parts: [{ text }] }], turnComplete: true }));
      setInputText('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full sm:max-w-lg h-full mt-4 sm:mt-0 sm:h-[600px] max-h-[calc(100vh-1rem)] sm:max-h-[85vh] bg-zinc-900 border border-zinc-800 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {/* Header */}
        <div className="p-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FF3131] rounded-full flex items-center justify-center text-white">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-white uppercase tracking-wider text-sm">Gemini Live ({isConnected ? 'Conectado' : 'Conectando...'})</h2>
              <p className="text-xs text-zinc-500 font-mono tracking-widest">{isRecording ? 'Escuchando Voz 🔴' : 'Modo Texto / Esperando'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-[#0c0c0c] font-sans scroll-smooth">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                m.role === 'user' 
                  ? 'bg-[#FF9900] text-black rounded-tr-none' 
                  : 'bg-zinc-800 text-zinc-100 rounded-tl-none border border-zinc-700'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>
              </div>
            </div>
          ))}
          {!isConnected && (
            <div className="flex justify-start">
              <div className="bg-zinc-800 text-zinc-400 rounded-2xl rounded-tl-none px-4 py-3 border border-zinc-700 flex gap-1 items-center">
                <span className="w-2 h-2 bg-zinc-500 rounded-full animate-pulse"></span>
                <span className="w-2 h-2 bg-zinc-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></span>
                <span className="w-2 h-2 bg-zinc-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 font-sans">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendText(); }}
            className="flex items-center gap-2"
          >
            <button
               type="button"
               onClick={toggleRecording}
               disabled={!isConnected}
               className={`p-3 rounded-full transition-colors flex shrink-0 items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${
                 isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
               }`}
            >
               {isRecording ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>
            <input 
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Escribe algo..."
              disabled={!isConnected}
              className="flex-1 bg-zinc-900 border border-zinc-700 rounded-full px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] disabled:opacity-50"
            />
            <button 
              type="submit"
              disabled={!isConnected || !inputText.trim()}
              className="p-3 bg-[#FF3131] hover:bg-red-500 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

