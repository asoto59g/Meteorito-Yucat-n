/***************************************
 DETECCIÓN DE CENOTES CHICXULUB - SENTINEL 1 SAR
***************************************/

// ==========================
// 1. ÁREA Y GEOMETRÍA
// ==========================
var roi = ee.Geometry.Rectangle([-91.5, 19.5, -87.5, 22.5]);

var center = ee.Geometry.Point([-89.6, 21.3]);

var outer = center.buffer(90000);   // 90 km
var inner = center.buffer(80000);   // 80 km
var ring = outer.difference(inner);

// ==========================
// 2. CARGA SENTINEL-1
// ==========================
var s1 = ee.ImageCollection('COPERNICUS/S1_GRD')
  .filterBounds(roi)
  .filterDate('2023-01-01', '2023-12-31')
  .filter(ee.Filter.eq('instrumentMode', 'IW'))
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
  .filter(ee.Filter.eq('orbitProperties_pass', 'DESCENDING'))
  .select('VV');

// Composición (mediana reduce speckle)
var s1_median = s1.median().clip(roi);

// ==========================
// 3. SUAVIZADO (REDUCIR SPECKLE)
// ==========================
var smooth = s1_median.focal_mean(30, 'circle', 'meters');

// ==========================
// 4. DETECCIÓN DE AGUA (SAR)
// ==========================
// Agua = valores muy bajos (oscuro)
// Ajusta este umbral si es necesario
var water = smooth.lt(-17);  

// ==========================
// 5. LIMPIEZA Y FILTRO TIERRA
// ==========================
var waterClean = water.focal_max(1);

// Definir máscara de tierra (México) para excluir el mar
var mexico = ee.FeatureCollection("USDOS/LSIB_SIMPLE/2017")
  .filter(ee.Filter.eq('country_na', 'Mexico'));

// Agua solo en tierra
var waterLand = waterClean.updateMask(waterClean).clip(mexico);

// ==========================
// 5b. VECTORIZACIÓN (PARA VISIBILIDAD PERMANENTE)
// ==========================
// Convertir la imagen de agua (solo tierra) a vectores (polígonos)
var waterVectors = waterLand.reduceToVectors({
  geometry: roi,
  scale: 30, // Aumentado ligeramente para mejorar rendimiento
  geometryType: 'polygon',
  eightConnected: true,
  labelProperty: 'water',
  reducer: ee.Reducer.countEvery(),
  maxPixels: 1e9, // Aumentado para evitar errores en áreas grandes
  bestEffort: true // Ajuste automático si hay demasiados píxeles
});

// Filtrar polígonos muy pequeños (ruido del radar)
// Un cenote debe tener al menos unos ~1500 m2 (aprox. 4 píxeles de 20m)
var waterFiltered = waterVectors.filter(ee.Filter.gt('count', 3));

// Crear buffer de 1000 metros (1 km) a partir de los vectores
var waterBufferVector = waterFiltered.map(function(f) {
  return f.buffer(1000);
});

// ==========================
// 6. BORDES (OPCIONAL)
// ==========================
var edges = ee.Algorithms.CannyEdgeDetector({
  image: smooth,
  threshold: 1,
  sigma: 1
});

// ==========================
// 7. CENOTES EN EL ANILLO (TIERRA)
// ==========================
var cenotesRing = waterLand.clip(ring);

// ==========================
// 7b. VISIBILIDAD PERMANENTE (TRUCOS DE RENDERIZADO)
// ==========================
// 1. Cenotes como Puntos con Tamaño Fijo en Pantalla (Píxeles)
var cenotePoints = waterFiltered.map(function(f) {
  return f.centroid();
});
// "Dibujar" los puntos con un radio de 4 píxeles constante
var waterVisDots = cenotePoints.draw({
  color: '0000FF',
  pointRadius: 4 
});
// 2. Buffer de 1000m siempre visible con grosor de 2 píxeles
var waterBufferVis = waterBufferVector.style({
  color: '00FFFF66',
  fillColor: '00FFFF22',
  width: 1
}).focal_max(2, 'square', 'pixels');

// ==========================
// 8. VISUALIZACIÓN
// ==========================
// Configuración del fondo: Google Satellite Hybrid
Map.setOptions('HYBRID');

Map.centerObject(center, 8);


// Cenotes Detectados - Puntos Azules de tamaño constante
Map.addLayer(waterVisDots, {}, 'Cenotes Chicxulub');

Export.table.toDrive({
  collection: waterFiltered,
  description: 'Cenotes_Chicxulub_2023',
  folder: 'GEE_Exports',
  fileFormat: 'GeoJSON'
});




// ==========================
// DEBUG
// ==========================
print('Sentinel-1 colección:', s1);
print('Imagen SAR:', s1_median);
