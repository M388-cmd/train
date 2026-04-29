# Miguel Train Times

Aplicación web para consultar tiempos reales del metro de Barcelona (TMB).

## Características

- ✅ Soporte para todas las líneas de metro (L1-L5, L9 Nord, L9 Sur, L10 Nord, L10 Sud, L11)
- ✅ Organización por zonas tarifarias
- ✅ Búsqueda por nombre de estación
- ✅ Interfaz tipo teleindicador LED
- ✅ Chat con IA integrado (Gemini Live)
- ✅ Despliegue listo para Render

## Configuración

1. Clona el repositorio
2. Copia `.env.example` a `.env` (ya incluye las API keys)
3. Ejecuta `npm install`
4. Ejecuta `npm run dev` para desarrollo

## Despliegue en Render

1. Ve a [Render.com](https://render.com)
2. Conecta tu cuenta de GitHub
3. Crea un nuevo "Web Service"
4. Selecciona el repositorio `M388-cmd/train`
5. Render detectará automáticamente el archivo `render.yaml`
6. Haz clic en "Create Web Service"

## Líneas soportadas

### Zona 1 (Centro)
- L1: Hospitalet ↔ Fondo
- L2: Paral·lel ↔ Sant Adrià  
- L3: Zona Universitària ↔ El Maresme
- L4: Trinitat Nova ↔ Poblenou
- L5: Cornellà ↔ Vall d'Hebron
- L9 Nord: Can Zam ↔ La Sagrera
- L10 Sud: Zona Universitària ↔ Gorg

### Zona 2 (Periferia)
- L9 Sur: Aeroport T1 ↔ Collblanc
- L10 Norte: Gorg ↔ Sant Pau | Dos de Maig
- L11: Trinitat Nova ↔ Can Peguera

## Tecnologías

- Frontend: React + TypeScript + Vite
- Backend: Express + TypeScript (tsx)
- API: TMB API v1
- IA: Google Gemini Live
- Despliegue: Render.com
