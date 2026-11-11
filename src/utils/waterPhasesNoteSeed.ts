import { Notebook, StrokeObject, TextObject, ImageObject } from "../types/note";
import { CUTOUTS } from "./scienceNotesSeed";

export const WATER_PHASE_CHANGES_NOTEBOOK_ID = "nb-water-phase-changes-b-gym-v1";

export function buildWaterPhaseChangesNotebook(folder = "Γενικά"): Notebook {
  const images: ImageObject[] = [
  {
    "id": "img-wphases-hero",
    "layerId": "layer-1",
    "x": 382,
    "y": 18,
    "width": 326,
    "height": 184,
    "rotation": 0,
    "dataUrl": "/mind_maps/chemistry_b_gymnasio/1_2/01_states_conditions.png",
    "zOrder": 13,
    "naturalWidth": 393,
    "naturalHeight": 222
  },
  {
    "id": "img-wphases-temp-range",
    "layerId": "layer-1",
    "x": 396,
    "y": 358,
    "width": 300,
    "height": 118,
    "rotation": 0,
    "dataUrl": "/mind_maps/chemistry_b_gymnasio/1_2/12_temperature_ranges.png",
    "zOrder": 14,
    "naturalWidth": 346,
    "naturalHeight": 201
  },
  {
    "id": "img-wphases-logo",
    "layerId": "layer-1",
    "x": 776,
    "y": 2,
    "width": 134,
    "height": 134,
    "rotation": 0,
    "dataUrl": CUTOUTS["bases_logo"],
    "zOrder": 15,
    "naturalWidth": 1254,
    "naturalHeight": 1254
  },
  {
    "id": "img-wphases-bulb",
    "layerId": "layer-1",
    "x": 737,
    "y": 233,
    "width": 36,
    "height": 47,
    "rotation": 0,
    "dataUrl": CUTOUTS["bases_bulb"],
    "zOrder": 16,
    "naturalWidth": 38,
    "naturalHeight": 50
  },
  {
    "id": "img-wphases-dyk-therm",
    "layerId": "layer-1",
    "x": 758,
    "y": 442,
    "width": 60,
    "height": 90,
    "rotation": 0,
    "dataUrl": "/mind_maps/chemistry_b_gymnasio/1_3/melting_boiling.png",
    "zOrder": 17,
    "naturalWidth": 277,
    "naturalHeight": 420
  },
  {
    "id": "img-wphases-excl",
    "layerId": "layer-1",
    "x": 880,
    "y": 476,
    "width": 31,
    "height": 44,
    "rotation": 0,
    "dataUrl": CUTOUTS["bases_excl"],
    "zOrder": 18,
    "naturalWidth": 24,
    "naturalHeight": 33
  },
  {
    "id": "img-wphases-solid",
    "layerId": "layer-1",
    "x": 278,
    "y": 208,
    "width": 78,
    "height": 80,
    "rotation": 0,
    "dataUrl": "/mind_maps/chemistry_b_gymnasio/1_2/02_solid.png",
    "zOrder": 19,
    "naturalWidth": 227,
    "naturalHeight": 233
  },
  {
    "id": "img-wphases-liquid",
    "layerId": "layer-1",
    "x": 280,
    "y": 300,
    "width": 76,
    "height": 74,
    "rotation": 0,
    "dataUrl": "/mind_maps/chemistry_b_gymnasio/1_2/03_liquid_1.png",
    "zOrder": 20,
    "naturalWidth": 190,
    "naturalHeight": 186
  },
  {
    "id": "img-wphases-gas",
    "layerId": "layer-1",
    "x": 264,
    "y": 392,
    "width": 96,
    "height": 68,
    "rotation": 0,
    "dataUrl": "/mind_maps/chemistry_b_gymnasio/1_2/04_gas.png",
    "zOrder": 21,
    "naturalWidth": 350,
    "naturalHeight": 247
  },
  {
    "id": "img-wphases-mp",
    "layerId": "layer-1",
    "x": 34,
    "y": 724,
    "width": 76,
    "height": 83,
    "rotation": 0,
    "dataUrl": "/mind_maps/chemistry_b_gymnasio/1_2/10_melting_point.png",
    "zOrder": 22,
    "naturalWidth": 236,
    "naturalHeight": 258
  },
  {
    "id": "img-wphases-bp-beaker",
    "layerId": "layer-1",
    "x": 138,
    "y": 724,
    "width": 74,
    "height": 83,
    "rotation": 0,
    "dataUrl": "/mind_maps/chemistry_b_gymnasio/1_2/08_boiling.png",
    "zOrder": 23,
    "naturalWidth": 224,
    "naturalHeight": 252
  },
  {
    "id": "img-wphases-bp-steam",
    "layerId": "layer-1",
    "x": 238,
    "y": 722,
    "width": 58,
    "height": 86,
    "rotation": 0,
    "dataUrl": "/mind_maps/chemistry_b_gymnasio/1_2/11_boiling_point.png",
    "zOrder": 24,
    "naturalWidth": 133,
    "naturalHeight": 199
  },
  {
    "id": "img-wphases-therm-beaker",
    "layerId": "layer-1",
    "x": 324,
    "y": 720,
    "width": 56,
    "height": 88,
    "rotation": 0,
    "dataUrl": "/mind_maps/physics_a_gymnasio/1_4/02_thermometer_beaker.png",
    "zOrder": 25,
    "naturalWidth": 180,
    "naturalHeight": 298
  },
  {
    "id": "img-wphases-tr-melting",
    "layerId": "layer-1",
    "x": 188,
    "y": 904,
    "width": 112,
    "height": 67,
    "rotation": 0,
    "dataUrl": "/mind_maps/chemistry_b_gymnasio/1_2/06_melting.png",
    "zOrder": 26,
    "naturalWidth": 400,
    "naturalHeight": 239
  },
  {
    "id": "img-wphases-tr-freezing",
    "layerId": "layer-1",
    "x": 188,
    "y": 1006,
    "width": 110,
    "height": 69,
    "rotation": 0,
    "dataUrl": "/mind_maps/chemistry_b_gymnasio/1_2/07_freezing.png",
    "zOrder": 27,
    "naturalWidth": 380,
    "naturalHeight": 238
  },
  {
    "id": "img-wphases-tr-boiling",
    "layerId": "layer-1",
    "x": 204,
    "y": 1104,
    "width": 76,
    "height": 85,
    "rotation": 0,
    "dataUrl": "/mind_maps/chemistry_b_gymnasio/1_2/08_boiling.png",
    "zOrder": 28,
    "naturalWidth": 224,
    "naturalHeight": 252
  },
  {
    "id": "img-wphases-tr-condensation",
    "layerId": "layer-1",
    "x": 190,
    "y": 1206,
    "width": 106,
    "height": 78,
    "rotation": 0,
    "dataUrl": "/mind_maps/chemistry_b_gymnasio/1_2/09_condensation.png",
    "zOrder": 29,
    "naturalWidth": 351,
    "naturalHeight": 260
  },
  {
    "id": "img-wphases-molecular-symbols",
    "layerId": "layer-1",
    "x": 520,
    "y": 1094,
    "width": 216,
    "height": 144,
    "rotation": 0,
    "dataUrl": "/mind_maps/chemistry_b_gymnasio/1_2/05_phase_symbols.png",
    "zOrder": 30,
    "naturalWidth": 360,
    "naturalHeight": 239
  }
];

  const strokes: StrokeObject[] = [
  {
    "id": "st-wphases-card-top-left",
    "layerId": "layer-1",
    "tool": "pen",
    "penType": "ballpoint",
    "isShape": true,
    "shapeType": "rectangle",
    "color": "#a89c7a",
    "width": 2.5,
    "opacity": 1,
    "points": [
      {
        "x": 20,
        "y": 169,
        "pressure": 0.8
      },
      {
        "x": 368,
        "y": 169,
        "pressure": 0.8
      },
      {
        "x": 368,
        "y": 482,
        "pressure": 0.8
      },
      {
        "x": 20,
        "y": 482,
        "pressure": 0.8
      },
      {
        "x": 20,
        "y": 169,
        "pressure": 0.8
      }
    ],
    "zOrder": 1,
    "fillStyle": "solid",
    "fillColor": "#a89c7a",
    "fillTransparency": 96
  },
  {
    "id": "st-wphases-card-didyouknow",
    "layerId": "layer-1",
    "tool": "pen",
    "penType": "ballpoint",
    "isShape": true,
    "shapeType": "rectangle",
    "color": "#a89c7a",
    "width": 2.5,
    "opacity": 1,
    "points": [
      {
        "x": 727,
        "y": 228,
        "pressure": 0.8
      },
      {
        "x": 932,
        "y": 228,
        "pressure": 0.8
      },
      {
        "x": 932,
        "y": 536,
        "pressure": 0.8
      },
      {
        "x": 727,
        "y": 536,
        "pressure": 0.8
      },
      {
        "x": 727,
        "y": 228,
        "pressure": 0.8
      }
    ],
    "zOrder": 2
  },
  {
    "id": "st-wphases-card-props",
    "layerId": "layer-1",
    "tool": "pen",
    "penType": "ballpoint",
    "isShape": true,
    "shapeType": "rectangle",
    "color": "#a89c7a",
    "width": 2,
    "opacity": 1,
    "points": [
      {
        "x": 20,
        "y": 511,
        "pressure": 0.8
      },
      {
        "x": 446,
        "y": 511,
        "pressure": 0.8
      },
      {
        "x": 446,
        "y": 819,
        "pressure": 0.8
      },
      {
        "x": 20,
        "y": 819,
        "pressure": 0.8
      },
      {
        "x": 20,
        "y": 511,
        "pressure": 0.8
      }
    ],
    "zOrder": 3,
    "fillStyle": "solid",
    "fillColor": "#a89c7a",
    "fillTransparency": 95
  },
  {
    "id": "st-wphases-table-box",
    "layerId": "layer-1",
    "tool": "pen",
    "penType": "ballpoint",
    "isShape": true,
    "shapeType": "rectangle",
    "color": "#94a3b8",
    "width": 1.8,
    "opacity": 1,
    "points": [
      {
        "x": 476,
        "y": 598,
        "pressure": 0.8
      },
      {
        "x": 910,
        "y": 598,
        "pressure": 0.8
      },
      {
        "x": 910,
        "y": 776,
        "pressure": 0.8
      },
      {
        "x": 476,
        "y": 776,
        "pressure": 0.8
      },
      {
        "x": 476,
        "y": 598,
        "pressure": 0.8
      }
    ],
    "zOrder": 4,
    "fillStyle": "solid",
    "fillColor": "#94a3b8",
    "fillTransparency": 80
  },
  {
    "id": "st-wphases-table-h1",
    "layerId": "layer-1",
    "tool": "pen",
    "penType": "ballpoint",
    "isShape": true,
    "shapeType": "line",
    "color": "#94a3b8",
    "width": 1.5,
    "opacity": 1,
    "points": [
      {
        "x": 476,
        "y": 642,
        "pressure": 0.8
      },
      {
        "x": 910,
        "y": 642,
        "pressure": 0.8
      }
    ],
    "zOrder": 5
  },
  {
    "id": "st-wphases-table-h2",
    "layerId": "layer-1",
    "tool": "pen",
    "penType": "ballpoint",
    "isShape": true,
    "shapeType": "line",
    "color": "#94a3b8",
    "width": 1.5,
    "opacity": 1,
    "points": [
      {
        "x": 476,
        "y": 687,
        "pressure": 0.8
      },
      {
        "x": 910,
        "y": 687,
        "pressure": 0.8
      }
    ],
    "zOrder": 6
  },
  {
    "id": "st-wphases-table-h3",
    "layerId": "layer-1",
    "tool": "pen",
    "penType": "ballpoint",
    "isShape": true,
    "shapeType": "line",
    "color": "#94a3b8",
    "width": 1.5,
    "opacity": 1,
    "points": [
      {
        "x": 476,
        "y": 731,
        "pressure": 0.8
      },
      {
        "x": 910,
        "y": 731,
        "pressure": 0.8
      }
    ],
    "zOrder": 7
  },
  {
    "id": "st-wphases-table-v1",
    "layerId": "layer-1",
    "tool": "pen",
    "penType": "ballpoint",
    "isShape": true,
    "shapeType": "line",
    "color": "#94a3b8",
    "width": 1.5,
    "opacity": 1,
    "points": [
      {
        "x": 592,
        "y": 598,
        "pressure": 0.8
      },
      {
        "x": 592,
        "y": 776,
        "pressure": 0.8
      }
    ],
    "zOrder": 8
  },
  {
    "id": "st-wphases-table-v2",
    "layerId": "layer-1",
    "tool": "pen",
    "penType": "ballpoint",
    "isShape": true,
    "shapeType": "line",
    "color": "#94a3b8",
    "width": 1.5,
    "opacity": 1,
    "points": [
      {
        "x": 698,
        "y": 598,
        "pressure": 0.8
      },
      {
        "x": 698,
        "y": 776,
        "pressure": 0.8
      }
    ],
    "zOrder": 9
  },
  {
    "id": "st-wphases-table-v3",
    "layerId": "layer-1",
    "tool": "pen",
    "penType": "ballpoint",
    "isShape": true,
    "shapeType": "line",
    "color": "#94a3b8",
    "width": 1.5,
    "opacity": 1,
    "points": [
      {
        "x": 805,
        "y": 598,
        "pressure": 0.8
      },
      {
        "x": 805,
        "y": 776,
        "pressure": 0.8
      }
    ],
    "zOrder": 10
  },
  {
    "id": "st-wphases-card-life",
    "layerId": "layer-1",
    "tool": "pen",
    "penType": "ballpoint",
    "isShape": true,
    "shapeType": "rectangle",
    "color": "#94a3b8",
    "width": 2,
    "opacity": 1,
    "points": [
      {
        "x": 20,
        "y": 846,
        "pressure": 0.8
      },
      {
        "x": 293,
        "y": 846,
        "pressure": 0.8
      },
      {
        "x": 293,
        "y": 1293,
        "pressure": 0.8
      },
      {
        "x": 20,
        "y": 1293,
        "pressure": 0.8
      },
      {
        "x": 20,
        "y": 846,
        "pressure": 0.8
      }
    ],
    "zOrder": 11,
    "fillStyle": "solid",
    "fillColor": "#94a3b8",
    "fillTransparency": 90
  },
  {
    "id": "st-wphases-card-electrolysis",
    "layerId": "layer-1",
    "tool": "pen",
    "penType": "ballpoint",
    "isShape": true,
    "shapeType": "rectangle",
    "color": "#a99d79",
    "width": 2,
    "opacity": 1,
    "points": [
      {
        "x": 351,
        "y": 846,
        "pressure": 0.8
      },
      {
        "x": 910,
        "y": 846,
        "pressure": 0.8
      },
      {
        "x": 910,
        "y": 1293,
        "pressure": 0.8
      },
      {
        "x": 351,
        "y": 1293,
        "pressure": 0.8
      },
      {
        "x": 351,
        "y": 846,
        "pressure": 0.8
      }
    ],
    "zOrder": 12,
    "fillStyle": "solid",
    "fillColor": "#a99d79",
    "fillTransparency": 95
  },
  {
    "id": "st-wphases-dot-1",
    "layerId": "layer-1",
    "tool": "pen",
    "penType": "ballpoint",
    "isShape": true,
    "shapeType": "circle",
    "color": "#c2410c",
    "width": 3.5,
    "opacity": 1,
    "points": [
      {
        "x": 52.8,
        "y": 191.0,
        "pressure": 0.5
      },
      {
        "x": 52.7,
        "y": 192.22,
        "pressure": 0.5
      },
      {
        "x": 52.42,
        "y": 193.41,
        "pressure": 0.5
      },
      {
        "x": 51.95,
        "y": 194.54,
        "pressure": 0.5
      },
      {
        "x": 51.31,
        "y": 195.58,
        "pressure": 0.5
      },
      {
        "x": 50.52,
        "y": 196.52,
        "pressure": 0.5
      },
      {
        "x": 49.58,
        "y": 197.31,
        "pressure": 0.5
      },
      {
        "x": 48.54,
        "y": 197.95,
        "pressure": 0.5
      },
      {
        "x": 47.41,
        "y": 198.42,
        "pressure": 0.5
      },
      {
        "x": 46.22,
        "y": 198.7,
        "pressure": 0.5
      },
      {
        "x": 45.0,
        "y": 198.8,
        "pressure": 0.5
      },
      {
        "x": 43.78,
        "y": 198.7,
        "pressure": 0.5
      },
      {
        "x": 42.59,
        "y": 198.42,
        "pressure": 0.5
      },
      {
        "x": 41.46,
        "y": 197.95,
        "pressure": 0.5
      },
      {
        "x": 40.42,
        "y": 197.31,
        "pressure": 0.5
      },
      {
        "x": 39.48,
        "y": 196.52,
        "pressure": 0.5
      },
      {
        "x": 38.69,
        "y": 195.58,
        "pressure": 0.5
      },
      {
        "x": 38.05,
        "y": 194.54,
        "pressure": 0.5
      },
      {
        "x": 37.58,
        "y": 193.41,
        "pressure": 0.5
      },
      {
        "x": 37.3,
        "y": 192.22,
        "pressure": 0.5
      },
      {
        "x": 37.2,
        "y": 191.0,
        "pressure": 0.5
      },
      {
        "x": 37.3,
        "y": 189.78,
        "pressure": 0.5
      },
      {
        "x": 37.58,
        "y": 188.59,
        "pressure": 0.5
      },
      {
        "x": 38.05,
        "y": 187.46,
        "pressure": 0.5
      },
      {
        "x": 38.69,
        "y": 186.42,
        "pressure": 0.5
      },
      {
        "x": 39.48,
        "y": 185.48,
        "pressure": 0.5
      },
      {
        "x": 40.42,
        "y": 184.69,
        "pressure": 0.5
      },
      {
        "x": 41.46,
        "y": 184.05,
        "pressure": 0.5
      },
      {
        "x": 42.59,
        "y": 183.58,
        "pressure": 0.5
      },
      {
        "x": 43.78,
        "y": 183.3,
        "pressure": 0.5
      },
      {
        "x": 45.0,
        "y": 183.2,
        "pressure": 0.5
      },
      {
        "x": 46.22,
        "y": 183.3,
        "pressure": 0.5
      },
      {
        "x": 47.41,
        "y": 183.58,
        "pressure": 0.5
      },
      {
        "x": 48.54,
        "y": 184.05,
        "pressure": 0.5
      },
      {
        "x": 49.58,
        "y": 184.69,
        "pressure": 0.5
      },
      {
        "x": 50.52,
        "y": 185.48,
        "pressure": 0.5
      },
      {
        "x": 51.31,
        "y": 186.42,
        "pressure": 0.5
      },
      {
        "x": 51.95,
        "y": 187.46,
        "pressure": 0.5
      },
      {
        "x": 52.42,
        "y": 188.59,
        "pressure": 0.5
      },
      {
        "x": 52.7,
        "y": 189.78,
        "pressure": 0.5
      },
      {
        "x": 52.8,
        "y": 191.0,
        "pressure": 0.5
      }
    ],
    "zOrder": 25,
    "fillStyle": "solid",
    "fillColor": "#c2410c",
    "fillTransparency": 5
  },
  {
    "id": "st-wphases-dot-2",
    "layerId": "layer-1",
    "tool": "pen",
    "penType": "ballpoint",
    "isShape": true,
    "shapeType": "circle",
    "color": "#c2410c",
    "width": 3.5,
    "opacity": 1,
    "points": [
      {
        "x": 55.8,
        "y": 542.0,
        "pressure": 0.5
      },
      {
        "x": 55.7,
        "y": 543.22,
        "pressure": 0.5
      },
      {
        "x": 55.42,
        "y": 544.41,
        "pressure": 0.5
      },
      {
        "x": 54.95,
        "y": 545.54,
        "pressure": 0.5
      },
      {
        "x": 54.31,
        "y": 546.58,
        "pressure": 0.5
      },
      {
        "x": 53.52,
        "y": 547.52,
        "pressure": 0.5
      },
      {
        "x": 52.58,
        "y": 548.31,
        "pressure": 0.5
      },
      {
        "x": 51.54,
        "y": 548.95,
        "pressure": 0.5
      },
      {
        "x": 50.41,
        "y": 549.42,
        "pressure": 0.5
      },
      {
        "x": 49.22,
        "y": 549.7,
        "pressure": 0.5
      },
      {
        "x": 48.0,
        "y": 549.8,
        "pressure": 0.5
      },
      {
        "x": 46.78,
        "y": 549.7,
        "pressure": 0.5
      },
      {
        "x": 45.59,
        "y": 549.42,
        "pressure": 0.5
      },
      {
        "x": 44.46,
        "y": 548.95,
        "pressure": 0.5
      },
      {
        "x": 43.42,
        "y": 548.31,
        "pressure": 0.5
      },
      {
        "x": 42.48,
        "y": 547.52,
        "pressure": 0.5
      },
      {
        "x": 41.69,
        "y": 546.58,
        "pressure": 0.5
      },
      {
        "x": 41.05,
        "y": 545.54,
        "pressure": 0.5
      },
      {
        "x": 40.58,
        "y": 544.41,
        "pressure": 0.5
      },
      {
        "x": 40.3,
        "y": 543.22,
        "pressure": 0.5
      },
      {
        "x": 40.2,
        "y": 542.0,
        "pressure": 0.5
      },
      {
        "x": 40.3,
        "y": 540.78,
        "pressure": 0.5
      },
      {
        "x": 40.58,
        "y": 539.59,
        "pressure": 0.5
      },
      {
        "x": 41.05,
        "y": 538.46,
        "pressure": 0.5
      },
      {
        "x": 41.69,
        "y": 537.42,
        "pressure": 0.5
      },
      {
        "x": 42.48,
        "y": 536.48,
        "pressure": 0.5
      },
      {
        "x": 43.42,
        "y": 535.69,
        "pressure": 0.5
      },
      {
        "x": 44.46,
        "y": 535.05,
        "pressure": 0.5
      },
      {
        "x": 45.59,
        "y": 534.58,
        "pressure": 0.5
      },
      {
        "x": 46.78,
        "y": 534.3,
        "pressure": 0.5
      },
      {
        "x": 48.0,
        "y": 534.2,
        "pressure": 0.5
      },
      {
        "x": 49.22,
        "y": 534.3,
        "pressure": 0.5
      },
      {
        "x": 50.41,
        "y": 534.58,
        "pressure": 0.5
      },
      {
        "x": 51.54,
        "y": 535.05,
        "pressure": 0.5
      },
      {
        "x": 52.58,
        "y": 535.69,
        "pressure": 0.5
      },
      {
        "x": 53.52,
        "y": 536.48,
        "pressure": 0.5
      },
      {
        "x": 54.31,
        "y": 537.42,
        "pressure": 0.5
      },
      {
        "x": 54.95,
        "y": 538.46,
        "pressure": 0.5
      },
      {
        "x": 55.42,
        "y": 539.59,
        "pressure": 0.5
      },
      {
        "x": 55.7,
        "y": 540.78,
        "pressure": 0.5
      },
      {
        "x": 55.8,
        "y": 542.0,
        "pressure": 0.5
      }
    ],
    "zOrder": 25,
    "fillStyle": "solid",
    "fillColor": "#c2410c",
    "fillTransparency": 5
  },
  {
    "id": "st-wphases-dot-3",
    "layerId": "layer-1",
    "tool": "pen",
    "penType": "ballpoint",
    "isShape": true,
    "shapeType": "circle",
    "color": "#c2410c",
    "width": 3.5,
    "opacity": 1,
    "points": [
      {
        "x": 496.8,
        "y": 576.0,
        "pressure": 0.5
      },
      {
        "x": 496.7,
        "y": 577.22,
        "pressure": 0.5
      },
      {
        "x": 496.42,
        "y": 578.41,
        "pressure": 0.5
      },
      {
        "x": 495.95,
        "y": 579.54,
        "pressure": 0.5
      },
      {
        "x": 495.31,
        "y": 580.58,
        "pressure": 0.5
      },
      {
        "x": 494.52,
        "y": 581.52,
        "pressure": 0.5
      },
      {
        "x": 493.58,
        "y": 582.31,
        "pressure": 0.5
      },
      {
        "x": 492.54,
        "y": 582.95,
        "pressure": 0.5
      },
      {
        "x": 491.41,
        "y": 583.42,
        "pressure": 0.5
      },
      {
        "x": 490.22,
        "y": 583.7,
        "pressure": 0.5
      },
      {
        "x": 489.0,
        "y": 583.8,
        "pressure": 0.5
      },
      {
        "x": 487.78,
        "y": 583.7,
        "pressure": 0.5
      },
      {
        "x": 486.59,
        "y": 583.42,
        "pressure": 0.5
      },
      {
        "x": 485.46,
        "y": 582.95,
        "pressure": 0.5
      },
      {
        "x": 484.42,
        "y": 582.31,
        "pressure": 0.5
      },
      {
        "x": 483.48,
        "y": 581.52,
        "pressure": 0.5
      },
      {
        "x": 482.69,
        "y": 580.58,
        "pressure": 0.5
      },
      {
        "x": 482.05,
        "y": 579.54,
        "pressure": 0.5
      },
      {
        "x": 481.58,
        "y": 578.41,
        "pressure": 0.5
      },
      {
        "x": 481.3,
        "y": 577.22,
        "pressure": 0.5
      },
      {
        "x": 481.2,
        "y": 576.0,
        "pressure": 0.5
      },
      {
        "x": 481.3,
        "y": 574.78,
        "pressure": 0.5
      },
      {
        "x": 481.58,
        "y": 573.59,
        "pressure": 0.5
      },
      {
        "x": 482.05,
        "y": 572.46,
        "pressure": 0.5
      },
      {
        "x": 482.69,
        "y": 571.42,
        "pressure": 0.5
      },
      {
        "x": 483.48,
        "y": 570.48,
        "pressure": 0.5
      },
      {
        "x": 484.42,
        "y": 569.69,
        "pressure": 0.5
      },
      {
        "x": 485.46,
        "y": 569.05,
        "pressure": 0.5
      },
      {
        "x": 486.59,
        "y": 568.58,
        "pressure": 0.5
      },
      {
        "x": 487.78,
        "y": 568.3,
        "pressure": 0.5
      },
      {
        "x": 489.0,
        "y": 568.2,
        "pressure": 0.5
      },
      {
        "x": 490.22,
        "y": 568.3,
        "pressure": 0.5
      },
      {
        "x": 491.41,
        "y": 568.58,
        "pressure": 0.5
      },
      {
        "x": 492.54,
        "y": 569.05,
        "pressure": 0.5
      },
      {
        "x": 493.58,
        "y": 569.69,
        "pressure": 0.5
      },
      {
        "x": 494.52,
        "y": 570.48,
        "pressure": 0.5
      },
      {
        "x": 495.31,
        "y": 571.42,
        "pressure": 0.5
      },
      {
        "x": 495.95,
        "y": 572.46,
        "pressure": 0.5
      },
      {
        "x": 496.42,
        "y": 573.59,
        "pressure": 0.5
      },
      {
        "x": 496.7,
        "y": 574.78,
        "pressure": 0.5
      },
      {
        "x": 496.8,
        "y": 576.0,
        "pressure": 0.5
      }
    ],
    "zOrder": 25,
    "fillStyle": "solid",
    "fillColor": "#c2410c",
    "fillTransparency": 5
  },
  {
    "id": "st-wphases-dot-4",
    "layerId": "layer-1",
    "tool": "pen",
    "penType": "ballpoint",
    "isShape": true,
    "shapeType": "circle",
    "color": "#c2410c",
    "width": 3.5,
    "opacity": 1,
    "points": [
      {
        "x": 52.8,
        "y": 875.0,
        "pressure": 0.5
      },
      {
        "x": 52.7,
        "y": 876.22,
        "pressure": 0.5
      },
      {
        "x": 52.42,
        "y": 877.41,
        "pressure": 0.5
      },
      {
        "x": 51.95,
        "y": 878.54,
        "pressure": 0.5
      },
      {
        "x": 51.31,
        "y": 879.58,
        "pressure": 0.5
      },
      {
        "x": 50.52,
        "y": 880.52,
        "pressure": 0.5
      },
      {
        "x": 49.58,
        "y": 881.31,
        "pressure": 0.5
      },
      {
        "x": 48.54,
        "y": 881.95,
        "pressure": 0.5
      },
      {
        "x": 47.41,
        "y": 882.42,
        "pressure": 0.5
      },
      {
        "x": 46.22,
        "y": 882.7,
        "pressure": 0.5
      },
      {
        "x": 45.0,
        "y": 882.8,
        "pressure": 0.5
      },
      {
        "x": 43.78,
        "y": 882.7,
        "pressure": 0.5
      },
      {
        "x": 42.59,
        "y": 882.42,
        "pressure": 0.5
      },
      {
        "x": 41.46,
        "y": 881.95,
        "pressure": 0.5
      },
      {
        "x": 40.42,
        "y": 881.31,
        "pressure": 0.5
      },
      {
        "x": 39.48,
        "y": 880.52,
        "pressure": 0.5
      },
      {
        "x": 38.69,
        "y": 879.58,
        "pressure": 0.5
      },
      {
        "x": 38.05,
        "y": 878.54,
        "pressure": 0.5
      },
      {
        "x": 37.58,
        "y": 877.41,
        "pressure": 0.5
      },
      {
        "x": 37.3,
        "y": 876.22,
        "pressure": 0.5
      },
      {
        "x": 37.2,
        "y": 875.0,
        "pressure": 0.5
      },
      {
        "x": 37.3,
        "y": 873.78,
        "pressure": 0.5
      },
      {
        "x": 37.58,
        "y": 872.59,
        "pressure": 0.5
      },
      {
        "x": 38.05,
        "y": 871.46,
        "pressure": 0.5
      },
      {
        "x": 38.69,
        "y": 870.42,
        "pressure": 0.5
      },
      {
        "x": 39.48,
        "y": 869.48,
        "pressure": 0.5
      },
      {
        "x": 40.42,
        "y": 868.69,
        "pressure": 0.5
      },
      {
        "x": 41.46,
        "y": 868.05,
        "pressure": 0.5
      },
      {
        "x": 42.59,
        "y": 867.58,
        "pressure": 0.5
      },
      {
        "x": 43.78,
        "y": 867.3,
        "pressure": 0.5
      },
      {
        "x": 45.0,
        "y": 867.2,
        "pressure": 0.5
      },
      {
        "x": 46.22,
        "y": 867.3,
        "pressure": 0.5
      },
      {
        "x": 47.41,
        "y": 867.58,
        "pressure": 0.5
      },
      {
        "x": 48.54,
        "y": 868.05,
        "pressure": 0.5
      },
      {
        "x": 49.58,
        "y": 868.69,
        "pressure": 0.5
      },
      {
        "x": 50.52,
        "y": 869.48,
        "pressure": 0.5
      },
      {
        "x": 51.31,
        "y": 870.42,
        "pressure": 0.5
      },
      {
        "x": 51.95,
        "y": 871.46,
        "pressure": 0.5
      },
      {
        "x": 52.42,
        "y": 872.59,
        "pressure": 0.5
      },
      {
        "x": 52.7,
        "y": 873.78,
        "pressure": 0.5
      },
      {
        "x": 52.8,
        "y": 875.0,
        "pressure": 0.5
      }
    ],
    "zOrder": 25,
    "fillStyle": "solid",
    "fillColor": "#c2410c",
    "fillTransparency": 5
  },
  {
    "id": "st-wphases-dot-5",
    "layerId": "layer-1",
    "tool": "pen",
    "penType": "ballpoint",
    "isShape": true,
    "shapeType": "circle",
    "color": "#c2410c",
    "width": 3.5,
    "opacity": 1,
    "points": [
      {
        "x": 384.8,
        "y": 875.0,
        "pressure": 0.5
      },
      {
        "x": 384.7,
        "y": 876.22,
        "pressure": 0.5
      },
      {
        "x": 384.42,
        "y": 877.41,
        "pressure": 0.5
      },
      {
        "x": 383.95,
        "y": 878.54,
        "pressure": 0.5
      },
      {
        "x": 383.31,
        "y": 879.58,
        "pressure": 0.5
      },
      {
        "x": 382.52,
        "y": 880.52,
        "pressure": 0.5
      },
      {
        "x": 381.58,
        "y": 881.31,
        "pressure": 0.5
      },
      {
        "x": 380.54,
        "y": 881.95,
        "pressure": 0.5
      },
      {
        "x": 379.41,
        "y": 882.42,
        "pressure": 0.5
      },
      {
        "x": 378.22,
        "y": 882.7,
        "pressure": 0.5
      },
      {
        "x": 377.0,
        "y": 882.8,
        "pressure": 0.5
      },
      {
        "x": 375.78,
        "y": 882.7,
        "pressure": 0.5
      },
      {
        "x": 374.59,
        "y": 882.42,
        "pressure": 0.5
      },
      {
        "x": 373.46,
        "y": 881.95,
        "pressure": 0.5
      },
      {
        "x": 372.42,
        "y": 881.31,
        "pressure": 0.5
      },
      {
        "x": 371.48,
        "y": 880.52,
        "pressure": 0.5
      },
      {
        "x": 370.69,
        "y": 879.58,
        "pressure": 0.5
      },
      {
        "x": 370.05,
        "y": 878.54,
        "pressure": 0.5
      },
      {
        "x": 369.58,
        "y": 877.41,
        "pressure": 0.5
      },
      {
        "x": 369.3,
        "y": 876.22,
        "pressure": 0.5
      },
      {
        "x": 369.2,
        "y": 875.0,
        "pressure": 0.5
      },
      {
        "x": 369.3,
        "y": 873.78,
        "pressure": 0.5
      },
      {
        "x": 369.58,
        "y": 872.59,
        "pressure": 0.5
      },
      {
        "x": 370.05,
        "y": 871.46,
        "pressure": 0.5
      },
      {
        "x": 370.69,
        "y": 870.42,
        "pressure": 0.5
      },
      {
        "x": 371.48,
        "y": 869.48,
        "pressure": 0.5
      },
      {
        "x": 372.42,
        "y": 868.69,
        "pressure": 0.5
      },
      {
        "x": 373.46,
        "y": 868.05,
        "pressure": 0.5
      },
      {
        "x": 374.59,
        "y": 867.58,
        "pressure": 0.5
      },
      {
        "x": 375.78,
        "y": 867.3,
        "pressure": 0.5
      },
      {
        "x": 377.0,
        "y": 867.2,
        "pressure": 0.5
      },
      {
        "x": 378.22,
        "y": 867.3,
        "pressure": 0.5
      },
      {
        "x": 379.41,
        "y": 867.58,
        "pressure": 0.5
      },
      {
        "x": 380.54,
        "y": 868.05,
        "pressure": 0.5
      },
      {
        "x": 381.58,
        "y": 868.69,
        "pressure": 0.5
      },
      {
        "x": 382.52,
        "y": 869.48,
        "pressure": 0.5
      },
      {
        "x": 383.31,
        "y": 870.42,
        "pressure": 0.5
      },
      {
        "x": 383.95,
        "y": 871.46,
        "pressure": 0.5
      },
      {
        "x": 384.42,
        "y": 872.59,
        "pressure": 0.5
      },
      {
        "x": 384.7,
        "y": 873.78,
        "pressure": 0.5
      },
      {
        "x": 384.8,
        "y": 875.0,
        "pressure": 0.5
      }
    ],
    "zOrder": 25,
    "fillStyle": "solid",
    "fillColor": "#c2410c",
    "fillTransparency": 5
  },
  {
    "id": "st-wphases-ptr-h2",
    "layerId": "layer-1",
    "tool": "pen",
    "penType": "ballpoint",
    "isShape": true,
    "shapeType": "line",
    "color": "#64748b",
    "width": 2,
    "opacity": 1,
    "points": [
      {
        "x": 522,
        "y": 1168,
        "pressure": 0.8
      },
      {
        "x": 578,
        "y": 1182,
        "pressure": 0.8
      }
    ],
    "zOrder": 20
  },
  {
    "id": "st-wphases-ptr-o2",
    "layerId": "layer-1",
    "tool": "pen",
    "penType": "ballpoint",
    "isShape": true,
    "shapeType": "line",
    "color": "#64748b",
    "width": 2,
    "opacity": 1,
    "points": [
      {
        "x": 700,
        "y": 1168,
        "pressure": 0.8
      },
      {
        "x": 628,
        "y": 1184,
        "pressure": 0.8
      }
    ],
    "zOrder": 21
  },
  {
    "id": "st-wphases-ptr-bat",
    "layerId": "layer-1",
    "tool": "pen",
    "penType": "ballpoint",
    "isShape": true,
    "shapeType": "line",
    "color": "#64748b",
    "width": 2,
    "opacity": 1,
    "points": [
      {
        "x": 700,
        "y": 1258,
        "pressure": 0.8
      },
      {
        "x": 650,
        "y": 1268,
        "pressure": 0.8
      }
    ],
    "zOrder": 22
  }
];

  const texts: TextObject[] = [
  {
    "id": "txt-wphases-title-1",
    "layerId": "layer-2",
    "x": 19,
    "y": 14,
    "text": "ΦΑΣΕΙΣ",
    "fontSize": 64,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "left"
  },
  {
    "id": "txt-wphases-title-2",
    "layerId": "layer-2",
    "x": 232,
    "y": 14,
    "text": "ΝΕΡΟΥ",
    "fontSize": 64,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0284c7",
    "textAlign": "left"
  },
  {
    "id": "txt-wphases-subtitle",
    "layerId": "layer-2",
    "x": 19,
    "y": 100,
    "text": "Καταστάσεις της ύλης, Τήξη, Πήξη, Εξάτμιση, Βρασμός & Συμπύκνωση",
    "fontSize": 18.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#1e3a8a",
    "textAlign": "left"
  },
  {
    "id": "txt-wphases-intro",
    "layerId": "layer-2",
    "x": 386,
    "y": 208,
    "boxWidth": 326,
    "boxHeight": 145,
    "text": "Το νερό (H₂O) είναι η μοναδική ουσία στη\nφύση που συναντάται ταυτόχρονα και στις\nτρεις φυσικές καταστάσεις (φάσεις):\nστερεή (πάγος), υγρή (νερό) & αέρια (υδρατμοί),\nανάλογα με τη θερμοκρασία και την πίεση!",
    "fontSize": 18.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#1e293b",
    "textAlign": "left"
  },
  {
    "id": "txt-wphases-axis-0",
    "layerId": "layer-2",
    "x": 432,
    "y": 342,
    "text": "Σ.Τ. = 0 °C",
    "fontSize": 15,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0284c7",
    "textAlign": "center"
  },
  {
    "id": "txt-wphases-axis-100",
    "layerId": "layer-2",
    "x": 562,
    "y": 342,
    "text": "Σ.Β. = 100 °C",
    "fontSize": 15,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#dc2626",
    "textAlign": "center"
  },
  {
    "id": "txt-wphases-axis-labels",
    "layerId": "layer-2",
    "x": 388,
    "y": 476,
    "boxWidth": 316,
    "text": "< 0 °C: Πάγος (s)     |   0–100 °C: Νερό (l)   |   > 100 °C: Ατμός (g)",
    "fontSize": 14,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "center"
  },
  {
    "id": "txt-wphases-sig",
    "layerId": "layer-2",
    "x": 734,
    "y": 138,
    "boxWidth": 207,
    "boxHeight": 23,
    "text": "- Explain Science by FreiderikosK -",
    "fontSize": 15.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#1e3a8a",
    "textAlign": "center"
  },
  {
    "id": "txt-wphases-dyk-title",
    "layerId": "layer-2",
    "x": 772,
    "y": 236,
    "boxWidth": 145,
    "boxHeight": 34,
    "text": "ΗΞΕΡΕΣ ΟΤΙ;",
    "fontSize": 24,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#a89638",
    "textAlign": "center"
  },
  {
    "id": "txt-wphases-dyk-body",
    "layerId": "layer-2",
    "x": 738,
    "y": 272,
    "boxWidth": 184,
    "boxHeight": 175,
    "text": "Κατά την τήξη του πάγου\n(0 °C) και τον βρασμό του\nνερού (100 °C σε 1 atm),\nη θερμοκρασία παραμένει\nΑΠΟΛΥΤΑ ΣΤΑΘΕΡΗ\nμέχρι να αλλάξει φάση\nόλη η ποσότητα!",
    "fontSize": 17.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#1e293b",
    "textAlign": "left"
  },
  {
    "id": "txt-wphases-s1-title",
    "layerId": "layer-2",
    "x": 60,
    "y": 177,
    "text": "ΟΙ 3 ΦΥΣΙΚΕΣ ΚΑΤΑΣΤΑΣΕΙΣ (s, l, g)",
    "fontSize": 20,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#c2410c",
    "textAlign": "left"
  },
  {
    "id": "txt-wphases-s1-b1",
    "layerId": "layer-2",
    "x": 28,
    "y": 212,
    "boxWidth": 245,
    "text": "1. Στερεή — Πάγος H₂O(s):\n• Ορισμένη μάζα & όγκος\n• Ορισμένο (σταθερό) σχήμα",
    "fontSize": 17.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "left"
  },
  {
    "id": "txt-wphases-s1-b2",
    "layerId": "layer-2",
    "x": 28,
    "y": 302,
    "boxWidth": 245,
    "text": "2. Υγρή — Νερό H₂O(l):\n• Ορισμένη μάζα & όγκος\n• Μεταβλητό σχήμα (δοχείου)",
    "fontSize": 17.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "left"
  },
  {
    "id": "txt-wphases-s1-b3",
    "layerId": "layer-2",
    "x": 28,
    "y": 390,
    "boxWidth": 235,
    "text": "3. Αέρια — Υδρατμοί H₂O(g):\n• Μεταβλητός όγκος & σχήμα\n• Καταλαμβάνει όλο το δοχείο",
    "fontSize": 17.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#1e293b",
    "textAlign": "left"
  },
  {
    "id": "txt-wphases-s2-title",
    "layerId": "layer-2",
    "x": 64,
    "y": 527,
    "text": "ΣΗΜΕΙΟ ΤΗΞΗΣ & ΣΗΜΕΙΟ ΒΡΑΣΜΟΥ",
    "fontSize": 22.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#c2410c",
    "textAlign": "left"
  },
  {
    "id": "txt-wphases-s2-bullets",
    "layerId": "layer-2",
    "x": 27,
    "y": 564,
    "boxWidth": 416,
    "text": "• Σημείο Τήξης (Σ.Τ. = 0 °C): η θερμοκρασία όπου ο πάγος\n  λιώνει (ταυτίζεται με το Σημείο Πήξης = 0 °C σε 1 atm).\n• Σημείο Βρασμού (Σ.Β. = 100 °C): η θερμοκρασία όπου το\n  νερό βράζει σε πίεση 1 atm (Σημείο Υγροποίησης = 100 °C).\n• Εξάτμιση vs Βρασμός: η εξάτμιση γίνεται μόνο στην ελεύθερη\n  επιφάνεια σε κάθε θ, ενώ ο βρασμός σε όλη τη μάζα στους 100 °C!",
    "fontSize": 16.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#1e293b",
    "textAlign": "left"
  },
  {
    "id": "txt-wphases-s3-title",
    "layerId": "layer-2",
    "x": 508,
    "y": 561,
    "text": "ΣΥΓΚΡΙΣΗ ΤΩΝ 3 ΦΑΣΕΩΝ ΤΟΥ ΝΕΡΟΥ",
    "fontSize": 22,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#c2410c",
    "textAlign": "left"
  },
  {
    "id": "txt-wphases-th-1",
    "layerId": "layer-2",
    "x": 480,
    "y": 608,
    "boxWidth": 108,
    "text": "ΦΑΣΗ ΝΕΡΟΥ",
    "fontSize": 14,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "center"
  },
  {
    "id": "txt-wphases-th-2",
    "layerId": "layer-2",
    "x": 595,
    "y": 601,
    "boxWidth": 100,
    "text": "ΟΓΚΟΣ &\nΣΧΗΜΑ",
    "fontSize": 13.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "center"
  },
  {
    "id": "txt-wphases-th-3",
    "layerId": "layer-2",
    "x": 701,
    "y": 601,
    "boxWidth": 100,
    "text": "ΚΙΝΗΣΗ\nΜΟΡΙΩΝ H₂O",
    "fontSize": 13.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "center"
  },
  {
    "id": "txt-wphases-th-4",
    "layerId": "layer-2",
    "x": 808,
    "y": 601,
    "boxWidth": 98,
    "text": "ΘΕΡΜΟΚΡΑΣΙΑ\n(σε P = 1 atm)",
    "fontSize": 13,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "center"
  },
  {
    "id": "txt-wphases-tr1-1",
    "layerId": "layer-2",
    "x": 480,
    "y": 647,
    "boxWidth": 108,
    "text": "ΣΤΕΡΕΗ (s)\nΠάγος",
    "fontSize": 13.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "center"
  },
  {
    "id": "txt-wphases-tr1-2",
    "layerId": "layer-2",
    "x": 595,
    "y": 647,
    "boxWidth": 100,
    "text": "Σταθερός όγκος\nΣταθερό σχήμα",
    "fontSize": 13,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0284c7",
    "textAlign": "center"
  },
  {
    "id": "txt-wphases-tr1-3",
    "layerId": "layer-2",
    "x": 701,
    "y": 647,
    "boxWidth": 100,
    "text": "Ταλάντωση σε\nπλέγμα",
    "fontSize": 13,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#1e293b",
    "textAlign": "center"
  },
  {
    "id": "txt-wphases-tr1-4",
    "layerId": "layer-2",
    "x": 808,
    "y": 653,
    "boxWidth": 98,
    "text": "θ < 0 °C",
    "fontSize": 15,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#1d4ed8",
    "textAlign": "center"
  },
  {
    "id": "txt-wphases-tr2-1",
    "layerId": "layer-2",
    "x": 480,
    "y": 692,
    "boxWidth": 108,
    "text": "ΥΓΡΗ (l)\nΥγρό Νερό",
    "fontSize": 13.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "center"
  },
  {
    "id": "txt-wphases-tr2-2",
    "layerId": "layer-2",
    "x": 595,
    "y": 692,
    "boxWidth": 100,
    "text": "Σταθερός όγκος\nΜεταβλ. σχήμα",
    "fontSize": 13,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#15803d",
    "textAlign": "center"
  },
  {
    "id": "txt-wphases-tr2-3",
    "layerId": "layer-2",
    "x": 701,
    "y": 692,
    "boxWidth": 100,
    "text": "Ολισθαίνουν\nμεταξύ τους",
    "fontSize": 13,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#1e293b",
    "textAlign": "center"
  },
  {
    "id": "txt-wphases-tr2-4",
    "layerId": "layer-2",
    "x": 808,
    "y": 698,
    "boxWidth": 98,
    "text": "0 °C – 100 °C",
    "fontSize": 14.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#15803d",
    "textAlign": "center"
  },
  {
    "id": "txt-wphases-tr3-1",
    "layerId": "layer-2",
    "x": 480,
    "y": 737,
    "boxWidth": 108,
    "text": "ΑΕΡΙΑ (g)\nΥδρατμοί",
    "fontSize": 13.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "center"
  },
  {
    "id": "txt-wphases-tr3-2",
    "layerId": "layer-2",
    "x": 595,
    "y": 737,
    "boxWidth": 100,
    "text": "Μεταβλ. όγκος\nΜεταβλ. σχήμα",
    "fontSize": 13,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#ea580c",
    "textAlign": "center"
  },
  {
    "id": "txt-wphases-tr3-3",
    "layerId": "layer-2",
    "x": 701,
    "y": 737,
    "boxWidth": 100,
    "text": "Ελεύθερη &\nάτακτη κίνηση",
    "fontSize": 13,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#1e293b",
    "textAlign": "center"
  },
  {
    "id": "txt-wphases-tr3-4",
    "layerId": "layer-2",
    "x": 808,
    "y": 742,
    "boxWidth": 98,
    "text": "θ > 100 °C",
    "fontSize": 15,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#dc2626",
    "textAlign": "center"
  },
  {
    "id": "txt-wphases-table-foot",
    "layerId": "layer-2",
    "x": 476,
    "y": 784,
    "boxWidth": 434,
    "text": "Στις αλλαγές φάσης τα μόρια H₂O παραμένουν αναλλοίωτα (φυσικά φαινόμενα)!",
    "fontSize": 15.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "center"
  },
  {
    "id": "txt-wphases-s4-title",
    "layerId": "layer-2",
    "x": 64,
    "y": 861,
    "text": "ΜΕΤΑΒΟΛΕΣ ΦΑΣΕΩΝ",
    "fontSize": 23,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#c2410c",
    "textAlign": "left"
  },
  {
    "id": "txt-wphases-s4-1",
    "layerId": "layer-2",
    "x": 24,
    "y": 904,
    "text": "ΤΗΞΗ (s → l)\nΟ πάγος λιώνει σε νερό\nστους 0 °C (+Θερμότητα)",
    "fontSize": 15,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#1e3a8a",
    "textAlign": "left"
  },
  {
    "id": "txt-wphases-s4-2",
    "layerId": "layer-2",
    "x": 24,
    "y": 1008,
    "text": "ΠΗΞΗ (l → s)\nΤο νερό παγώνει στους\n0 °C (-Θερμότητα, +Όγκος)",
    "fontSize": 15,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0284c7",
    "textAlign": "left"
  },
  {
    "id": "txt-wphases-s4-3",
    "layerId": "layer-2",
    "x": 24,
    "y": 1112,
    "text": "ΕΞΑΕΡΩΣΗ (l → g)\nΕξάτμιση (κάθε θ) ή\nΒρασμός στους 100 °C (+Q)",
    "fontSize": 15,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#b91c1c",
    "textAlign": "left"
  },
  {
    "id": "txt-wphases-s4-4",
    "layerId": "layer-2",
    "x": 24,
    "y": 1212,
    "text": "ΣΥΜΠΥΚΝΩΣΗ (g → l)\nΥγροποίηση υδρατμών\nσε ψυχρή επιφάνεια (-Q)",
    "fontSize": 15,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#14532d",
    "textAlign": "left"
  },
  {
    "id": "txt-wphases-s5-title",
    "layerId": "layer-2",
    "x": 399,
    "y": 860,
    "text": "ΘΕΡΜΑΝΣΗ, ΨΥΞΗ & ΕΞΑΧΝΩΣΗ",
    "fontSize": 27,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#c2410c",
    "textAlign": "left"
  },
  {
    "id": "txt-wphases-s5-desc",
    "layerId": "layer-2",
    "x": 362,
    "y": 903,
    "text": "Η προσφορά ή αποβολή θερμότητας (Q) προκαλεί τις αλλαγές φάσης:",
    "fontSize": 17.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#111827",
    "textAlign": "left"
  },
  {
    "id": "txt-wphases-s5-wordeq",
    "layerId": "layer-2",
    "x": 362,
    "y": 944,
    "text": "Θέρμανση (+Q, ενδόθερμες):\nΠάγος (s)  —[Τήξη 0 °C]→  Νερό (l)  —[Βρασμός 100 °C]→  Υδρατμός (g)",
    "fontSize": 18,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "left",
    "spans": [
      {
        "start": 27,
        "end": 95,
        "color": "#dc2626"
      }
    ]
  },
  {
    "id": "txt-wphases-s5-chemeq",
    "layerId": "layer-2",
    "x": 362,
    "y": 1014,
    "text": "Ψύξη (-Q, εξώθερμες):\nΥδρατμός (g)  —[Συμπύκνωση 100 °C]→  Νερό (l)  —[Πήξη 0 °C]→  Πάγος (s)",
    "fontSize": 18,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "left",
    "spans": [
      {
        "start": 22,
        "end": 93,
        "color": "#0284c7"
      }
    ]
  },
  {
    "id": "txt-wphases-s5-lbl-h2",
    "layerId": "layer-2",
    "x": 358,
    "y": 1122,
    "boxWidth": 158,
    "text": "Εξάχνωση (s → g)\nΑπευθείας από πάγο\nσε υδρατμό (+Q)",
    "fontSize": 17,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#1e293b",
    "textAlign": "center"
  },
  {
    "id": "txt-wphases-s5-lbl-o2",
    "layerId": "layer-2",
    "x": 742,
    "y": 1122,
    "boxWidth": 175,
    "text": "Απόθεση (g → s)\nΑπευθείας από υδρατμό\nσε παγετό / χιόνι (-Q)",
    "fontSize": 17,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#1e293b",
    "textAlign": "center"
  },
  {
    "id": "txt-wphases-s5-lbl-bat",
    "layerId": "layer-2",
    "x": 716,
    "y": 1236,
    "boxWidth": 200,
    "text": "Στους 0 °C & 100 °C\nσυνυπάρχουν 2 φάσεις!",
    "fontSize": 16.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#b91c1c",
    "textAlign": "center"
  }
];

  return {
    id: WATER_PHASE_CHANGES_NOTEBOOK_ID,
    title: "Φάσεις & Μεταβολές του Νερού",
    folder: folder || "Γενικά",
    tags: [
      "χημεία",
      "φάσεις νερού",
      "τήξη",
      "πήξη",
      "εξάτμιση",
      "βρασμός",
      "συμπύκνωση",
      "εξάχνωση",
      "β γυμνασίου",
    ],
    coverColor: "#0369a1",
    updatedAt: "2026-11-09T14:52:00.000Z",
    sourceFormat: ".bestNotes",
    pages: [
      {
        id: "page-water-phase-changes-b-gym-1",
        title: "Φάσεις & Μεταβολές του Νερού",
        tags: ["χημεία", "φάσεις νερού", "τήξη", "πήξη", "εξάτμιση", "βρασμός", "συμπύκνωση"],
        template: "grid",
        orientation: "portrait",
        layers: [
          { id: "layer-2", name: "Κειμενα", visible: true, locked: false, opacity: 1 },
          { id: "layer-1", name: "Σχηματα", visible: true, locked: false, opacity: 1 },
        ],
        strokes,
        texts,
        images,
        tapes: [],
      },
    ],
  };
}
