<p align="center">
  <img src="logo.png" alt="ABC Geomática Agrícola SRL" width="280">
</p>

<h1 align="center">🌋 Detección de Cenotes — Cráter de Chicxulub</h1>

<p align="center">
  <strong>Análisis SAR con Sentinel-1 para identificar cenotes en el anillo del impacto de Chicxulub, Yucatán, México</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Google%20Earth%20Engine-4285F4?logo=google-earth&logoColor=white" alt="GEE">
  <img src="https://img.shields.io/badge/Sentinel--1%20SAR-003366?logo=european-space-agency&logoColor=white" alt="Sentinel-1">
  <img src="https://img.shields.io/badge/Google%20Colab-F9AB00?logo=google-colab&logoColor=white" alt="Colab">
  <img src="https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
</p>

---

## 📋 Descripción

Este proyecto utiliza imágenes de **Radar de Apertura Sintética (SAR)** del satélite **Sentinel-1** para detectar automáticamente **cenotes** (dolinas kársticas inundadas) a lo largo del **anillo del cráter de Chicxulub** en la Península de Yucatán, México.

El cráter de Chicxulub (~180 km de diámetro) fue formado por el impacto del asteroide que causó la extinción masiva del Cretácico-Paleógeno hace ~66 millones de años. Los cenotes se alinean de forma característica a lo largo del borde del cráter, formando un anillo semicircular visible desde el espacio.

### ¿Por qué SAR?

| Ventaja | Descripción |
|---------|-------------|
| 🌧️ **Independiente del clima** | SAR penetra nubes — ideal para el trópico húmedo de Yucatán |
| 🌙 **Día y noche** | No depende de la luz solar |
| 💧 **Sensible al agua** | Superficies de agua aparecen muy oscuras en SAR (baja retrodispersión) |
| 📏 **Resolución** | Sentinel-1 IW: ~10×10 m por píxel |

---

## 🔬 Metodología

```
Sentinel-1 GRD (VV, Descendente, 2023)
           │
           ▼
    Composición Mediana
    (reduce speckle temporal)
           │
           ▼
    Suavizado Focal
    (focal_mean 30m circular)
           │
           ▼
    Umbral de Agua (< -17 dB)
           │
           ▼
    Máscara de Tierra (México)
    (excluye océano)
           │
           ▼
    Vectorización + Filtro de Área
    (elimina ruido < 1500 m²)
           │
           ▼
    Detección de Bordes (Canny)
           │
           ▼
    Clip al Anillo del Cráter
    (80-90 km del centro)
           │
           ▼
    🗺️ Mapa Interactivo de Cenotes
```

### Parámetros Clave

| Parámetro | Valor | Justificación |
|-----------|-------|---------------|
| Polarización | VV | Mayor sensibilidad al agua |
| Órbita | Descendente | Cobertura consistente de Yucatán |
| Período | Ene–Dic 2023 | Año completo para composición robusta |
| Umbral de agua | < -17 dB | Separación agua/tierra en SAR |
| Radio del anillo | 80–90 km | Coincide con el anillo de cenotes de Chicxulub |
| Área mínima de cenote | ~1500 m² | Filtra ruido del radar (< 4 píxeles) |

---

## 📁 Estructura del Proyecto

```
Crater Chicxulub/
├── chicxulub.js            # Script original para GEE Code Editor (JavaScript)
├── chicxulub_colab.py      # Versión Python con marcadores de celda
├── chicxulub_colab.ipynb   # 📓 Notebook para Google Colab (listo para usar)
├── logo.png                # Logo de ABC Geomática Agrícola
└── README.md               # Este archivo
```

---

## 🚀 Inicio Rápido

### Opción 1: Google Colab (Recomendado)

1. Sube `chicxulub_colab.ipynb` a [Google Colab](https://colab.research.google.com/)
2. Configura tu Project ID de Google Cloud:
   ```python
   ee.Initialize(project='ee-tu-proyecto-id')
   ```
3. Ejecuta todas las celdas (`Runtime` → `Run all`)
4. Explora el mapa interactivo con las capas de cenotes 🗺️

### Opción 2: GEE Code Editor

1. Abre [Google Earth Engine Code Editor](https://code.earthengine.google.com/)
2. Crea un nuevo script y pega el contenido de `chicxulub.js`
3. Haz clic en **Run**

### Requisitos Previos

- ✅ Cuenta de Google
- ✅ Registro en [Google Earth Engine](https://signup.earthengine.google.com/)
- ✅ Proyecto de Google Cloud con la [API de Earth Engine habilitada](https://console.cloud.google.com/apis/library/earthengine.googleapis.com)

---

## 🗺️ Capas del Mapa

El notebook genera un mapa interactivo con las siguientes capas (activables/desactivables):

| Capa | Descripción | Visible por defecto |
|------|-------------|:-------------------:|
| **Cenotes Chicxulub** | Puntos azules de cenotes detectados | ✅ |
| **Anillo Chicxulub** | Contorno del anillo del cráter (80-90 km) | ✅ |
| **Cenotes en Anillo** | Cenotes dentro del anillo únicamente | ❌ |
| **Agua en Tierra** | Máscara completa de agua en tierra firme | ❌ |
| **Bordes Canny** | Detección de bordes del terreno | ❌ |
| **SAR Suavizado** | Imagen SAR después del filtro focal | ❌ |
| **Sentinel-1 VV** | Composición mediana original | ❌ |

---

## 📊 Exportación de Datos

El notebook incluye una celda opcional para exportar los cenotes detectados a Google Drive:

```python
task = ee.batch.Export.table.toDrive(
    collection=waterFiltered,
    description='Cenotes_Chicxulub_2023',
    folder='GEE_Exports',
    fileFormat='GeoJSON'
)
task.start()
```

Formatos disponibles: `GeoJSON`, `KML`, `CSV`, `SHP`

---

## 🛰️ Datos Utilizados

| Dataset | Fuente | ID en GEE |
|---------|--------|-----------|
| Sentinel-1 SAR GRD | ESA / Copernicus | `COPERNICUS/S1_GRD` |
| Límites internacionales | U.S. Dept. of State | `USDOS/LSIB_SIMPLE/2017` |

---

## 📖 Referencias

- Hildebrand, A. R., et al. (1991). *Chicxulub Crater: A possible Cretaceous/Tertiary boundary impact crater on the Yucatán Peninsula, Mexico.* Geology, 19(9), 867–871.
- Perry, E., et al. (1995). *Ring of Cenotes (sinkholes), northwest Yucatan, Mexico: Its hydrogeologic characteristics and possible association with the Chicxulub impact crater.* Geology, 23(1), 17–20.
- ESA. *Sentinel-1 SAR User Guide.* https://sentinels.copernicus.eu/web/sentinel/user-guides/sentinel-1-sar

---

## 📜 Licencia

Este proyecto está bajo la licencia [MIT](https://opensource.org/licenses/MIT). Libre para uso académico y comercial.

---

<p align="center">
  Desarrollado por <strong>ABC Geomática Agrícola SRL</strong> · 2026
</p>
