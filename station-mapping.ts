// Station mapping for all Barcelona Metro lines organized by fare zone
// Station codes from TMB API

// Zone 1 - Core Barcelona
export const ZONE_1_STATIONS: Record<string, number> = {
  // L1
  'HOSPITALET': 101,
  'CAN TRIES': 102,
  'TORRASSA': 103,
  'SANTA EULALIA': 104,
  'CAN SERRA': 105,
  'FLORIDA': 106,
  'CATALUNYA': 107,
  'URQUINAONA': 108,
  'ARC DE TRIOMF': 109,
  'SAGRERA_L1': 110,
  'FABRA I PUIG_L1': 111,
  'VILAPICINA_L1': 112,
  'HORTA_L1': 113,
  'MONTCADA I REIXAC': 114,
  'FONDO': 115,
  // L2
  'PARALEL_L2': 201,
  'SANT ANTONI': 202,
  'TETUAN': 203,
  'URQUINAONA_L2': 204,
  'GLORES': 205,
  'CLOT_L2': 206,
  'BAC DE RODA': 207,
  'SANT MARTI': 208,
  'LA PAU': 209,
  'VERNEDA': 210,
  'ARTIGUES': 211,
  'SANT ADRIA DE BESOS_L2': 212,
  // L3
  'ZONA UNIVERSITARIA': 301,
  'PALAU REIAL_L3': 302,
  'MARIA CRISTINA': 303,
  'LES CORTS': 304,
  'PLACA DEL CENTRE': 305,
  'SANTS': 306,
  'TARRAGONA': 307,
  'ESPANYA': 308,
  'ROCABORNELA': 309,
  'POBLENOU_L3': 310,
  'CIUTADELLA': 311,
  'BOGATELL': 312,
  'LACUNA': 313,
  'SELVA DE MAR': 314,
  'EL MARESME_L3': 316,
  // L4
  'TRINITAT NOVA': 401,
  'VIA JULIA': 402,
  'LLEFIA_L4': 403,
  'MARAGALL_L4': 404,
  'GUINARDO': 405,
  'CONGRESS': 406,
  'LA SAGRERA_L4': 407,
  'CLOT_L4': 408,
  'BOGATELL_L4': 409,
  'CIUTADELLA_L4': 410,
  'BORN': 411,
  'JAUME I': 412,
  'BARCELONETA': 413,
  'CIUTAT VELLA': 414,
  'BORDERS': 415,
  'PARALEL_L4': 416,
  // L5
  'CORNELLA CENTRE': 501,
  'GAVA': 502,
  'SANT BOI': 503,
  'QUATRE CAMINS': 504,
  'SANTS_L5': 505,
  'ENTENCA': 506,
  'HOSPITAL CLINIC': 507,
  'DIAGONAL_L5': 508,
  'VERDAGUER_L5': 509,
  'SAGRERA_L5': 510,
  'CAMPO LLARGO': 511,
  'VILAPICINA_L5': 512,
  'HORTA_L5': 513,
  'EL CARMELO': 514,
  'HOSPITAL SANT PAU_L5': 515,
  'CAMP DE LARPA': 516,
  'CONGRES_L5': 518,
  'MARAGALL_L5': 519,
  'VIRREINA': 520,
  'JOANIC': 521,
  'SANT PAU DOS DE MAIG_L5': 522,
  'GUINARDO SANT PAU_L5': 523,
  'EL MARESME_L5': 524,
};

// L9 Nord stations (L9N = codi_linia 94)
export const L9_NORD_STATIONS: Record<string, number> = {
  'CAN ZAM': 932,
  'SANT ADRIA DE BESOS_L9N': 940,
  'ARTIGUES SANT ADRIA_L9N': 945,
  'LLEFIA_L9N': 944,
  'BON PASTOR_L9N': 933,
  'CAN PEGUERA_L9N': 941,
  'FABRA I PUIG_L9N': 930,
  'SANT PAU DOS DE MAIG_L9N': 942,
  'GUINARDO SANT PAU_L9N': 943,
  'EL MARESME_L9N': 945,
  'LA SAGRERA_L9N': 945,
};

// L10 Sud stations (L10S = codi_linia 101)
export const L10_SUD_STATIONS: Record<string, number> = {
  'ZONA UNIVERSITARIA_L10S': 914,
  'COLLBLANC_L10S': 958,
  'PALAU REIAL_L10S': 951,
  'MARIA CRISTINA_L10S': 953,
  'CAN TRIES GORNAL_L10S': 959,
  'PROVENCIANA': 952,
  'EUROPA FIRA': 957,
  'FOC': 956,
  'ALFONS X_L10S': 954,
  'GORG_L10S': 954,
};

// Zone 2 - Outer areas
// L9 Sur stations (L9S = codi_linia 91)
export const L9_SUR_STATIONS: Record<string, number> = {
  'AEROPORT T1': 916,
  'AEROPORT T2': 915,
  'MAS BLAU': 913,
  'POBLET': 912,
  'CENTRE LOGISTIC': 911,
  'MERCADONA': 909,
  'LA RIBA': 907,
  'SANT VICENC DE CALDERS': 906,
  'CAN TRIES GORNAL_L9S': 905,
  'TORRASA_L9S': 904,
  'COLLBLANC_L9S': 903,
};

// L10 Norte stations (L10N = codi_linia 104)
export const L10_NORTE_STATIONS: Record<string, number> = {
  'GORG_L10N': 932,
  'ALFONS X_L10N': 933,
  'BON PASTOR_L10N': 930,
  'CAN PEGUERA_L10N': 934,
  'FABRA I PUIG_L10N': 935,
  'SANT PAU DOS DE MAIG_L10N': 936,
};

// L11 stations
export const L11_STATIONS: Record<string, number> = {
  'TRINITAT NOVA_L11': 1101,
  'CAN CUIXET': 1102,
  'TORRE BARO VALLBONA': 1103,
  'CIUDAD MERCANTIL': 1104,
  'CAN PEGUERA_L11': 1105,
};

// Helper function to find station code
export function findStationCode(line: string, stationQuery: string): number | null {
  const query = stationQuery.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  
  // L9 Nord
  if (line.toUpperCase().includes('L9N') || 
      (line.toUpperCase().includes('L9') && !line.toUpperCase().includes('L10') && 
       !line.toUpperCase().includes('SUR') && !line.toUpperCase().includes('S'))) {
    const station = findInRecord(L9_NORD_STATIONS, query);
    if (station) return station;
  }
  
  // L9 Sur
  if (line.toUpperCase().includes('L9S') || 
      (line.toUpperCase().includes('L9') && (line.toUpperCase().includes('SUR') || line.toUpperCase().includes('S')))) {
    const station = findInRecord(L9_SUR_STATIONS, query);
    if (station) return station;
  }
  
  // L10 Sud
  if (line.toUpperCase().includes('L10S') || 
      (line.toUpperCase().includes('L10') && (line.toUpperCase().includes('SUD') || line.toUpperCase().includes('S')))) {
    const station = findInRecord(L10_SUD_STATIONS, query);
    if (station) return station;
  }
  
  // L10 Norte
  if (line.toUpperCase().includes('L10N') || 
      (line.toUpperCase().includes('L10') && (line.toUpperCase().includes('NOR') || line.toUpperCase().includes('N')))) {
    const station = findInRecord(L10_NORTE_STATIONS, query);
    if (station) return station;
  }
  
  // For other lines (L1-L5, L11), return null to use search API
  return null;
}

// Helper to search in a record
function findInRecord(record: Record<string, number>, query: string): number | null {
  // Direct match
  for (const [key, value] of Object.entries(record)) {
    const normalizedKey = key.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (normalizedKey === query || normalizedKey.includes(query) || query.includes(normalizedKey)) {
      return value;
    }
  }
  return null;
}
