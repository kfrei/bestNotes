import { Notebook, StrokeObject, TextObject, ImageObject } from '../../types/note';
import { CUTOUTS } from './scienceNotesSeed';

export const WATER_CHEMISTRY_NOTEBOOK_ID = 'nb-water-chemistry-b-gym-v1';

export function buildWaterChemistryNotebook(folder = 'Γενικά'): Notebook {
  const images: ImageObject[] = [
  {
    "id": "img-wchem-hero",
    "layerId": "layer-1",
    "x": 392,
    "y": 12,
    "width": 314,
    "height": 263,
    "rotation": 0,
    "dataUrl": "/mind_maps/chemistry_b_gymnasio/2_1/01_life_water.png",
    "zOrder": 13,
    "naturalWidth": 309,
    "naturalHeight": 259
  },
  {
    "id": "img-wchem-logo",
    "layerId": "layer-1",
    "x": 776,
    "y": 2,
    "width": 134,
    "height": 134,
    "rotation": 0,
    "dataUrl": CUTOUTS['bases_logo'],
    "zOrder": 14,
    "naturalWidth": 1254,
    "naturalHeight": 1254
  },
  {
    "id": "img-wchem-bulb",
    "layerId": "layer-1",
    "x": 737,
    "y": 233,
    "width": 36,
    "height": 47,
    "rotation": 0,
    "dataUrl": CUTOUTS['bases_bulb'],
    "zOrder": 15,
    "naturalWidth": 38,
    "naturalHeight": 50
  },
  {
    "id": "img-wchem-earth",
    "layerId": "layer-1",
    "x": 748,
    "y": 456,
    "width": 80,
    "height": 70,
    "rotation": 0,
    "dataUrl": "/mind_maps/chemistry_b_gymnasio/2_1/02_earth_water.png",
    "zOrder": 16,
    "naturalWidth": 291,
    "naturalHeight": 255
  },
  {
    "id": "img-wchem-excl",
    "layerId": "layer-1",
    "x": 880,
    "y": 476,
    "width": 31,
    "height": 44,
    "rotation": 0,
    "dataUrl": CUTOUTS['bases_excl'],
    "zOrder": 17,
    "naturalWidth": 24,
    "naturalHeight": 33
  },
  {
    "id": "img-wchem-molecule",
    "layerId": "layer-1",
    "x": 236,
    "y": 210,
    "width": 122,
    "height": 96,
    "rotation": 0,
    "dataUrl": "/mind_maps/chemistry_b_gymnasio/2_2/water_molecule.png",
    "zOrder": 18,
    "naturalWidth": 400,
    "naturalHeight": 315
  },
  {
    "id": "img-wchem-prop-cycle",
    "layerId": "layer-1",
    "x": 32,
    "y": 726,
    "width": 98,
    "height": 81,
    "rotation": 0,
    "dataUrl": "/mind_maps/chemistry_b_gymnasio/2_1/03_water_cycle.png",
    "zOrder": 19,
    "naturalWidth": 347,
    "naturalHeight": 287
  },
  {
    "id": "img-wchem-prop-plant",
    "layerId": "layer-1",
    "x": 148,
    "y": 724,
    "width": 82,
    "height": 84,
    "rotation": 0,
    "dataUrl": "/mind_maps/chemistry_b_gymnasio/2_1/04_plant_water.png",
    "zOrder": 20,
    "naturalWidth": 341,
    "naturalHeight": 350
  },
  {
    "id": "img-wchem-prop-body",
    "layerId": "layer-1",
    "x": 252,
    "y": 722,
    "width": 52,
    "height": 88,
    "rotation": 0,
    "dataUrl": "/mind_maps/chemistry_b_gymnasio/2_1/05_body_water_1.png",
    "zOrder": 21,
    "naturalWidth": 209,
    "naturalHeight": 355
  },
  {
    "id": "img-wchem-prop-solvent",
    "layerId": "layer-1",
    "x": 332,
    "y": 722,
    "width": 73,
    "height": 88,
    "rotation": 0,
    "dataUrl": "/mind_maps/chemistry_b_gymnasio/2_2/solvent_solute.png",
    "zOrder": 22,
    "naturalWidth": 347,
    "naturalHeight": 420
  },
  {
    "id": "img-wchem-life-irrig",
    "layerId": "layer-1",
    "x": 192,
    "y": 906,
    "width": 90,
    "height": 78,
    "rotation": 0,
    "dataUrl": "/mind_maps/chemistry_b_gymnasio/2_1/06_irrigation.png",
    "zOrder": 23,
    "naturalWidth": 208,
    "naturalHeight": 181
  },
  {
    "id": "img-wchem-life-city",
    "layerId": "layer-1",
    "x": 186,
    "y": 1022,
    "width": 100,
    "height": 44,
    "rotation": 0,
    "dataUrl": "/mind_maps/chemistry_b_gymnasio/2_1/07_city_water.png",
    "zOrder": 24,
    "naturalWidth": 400,
    "naturalHeight": 176
  },
  {
    "id": "img-wchem-life-tap",
    "layerId": "layer-1",
    "x": 194,
    "y": 1118,
    "width": 90,
    "height": 65,
    "rotation": 0,
    "dataUrl": "/mind_maps/chemistry_b_gymnasio/2_1/08_conservation_1.png",
    "zOrder": 25,
    "naturalWidth": 211,
    "naturalHeight": 153
  },
  {
    "id": "img-wchem-life-river",
    "layerId": "layer-1",
    "x": 194,
    "y": 1212,
    "width": 90,
    "height": 66,
    "rotation": 0,
    "dataUrl": "/mind_maps/chemistry_b_gymnasio/2_1/08_conservation_2.png",
    "zOrder": 26,
    "naturalWidth": 215,
    "naturalHeight": 157
  },
  {
    "id": "img-wchem-hofmann",
    "layerId": "layer-1",
    "x": 562,
    "y": 1084,
    "width": 92,
    "height": 201,
    "rotation": 0,
    "dataUrl": "/mind_maps/chemistry_b_gymnasio/2_4/01_water_electrolysis_hofmann.png",
    "zOrder": 27,
    "naturalWidth": 256,
    "naturalHeight": 560
  }
];

  const strokes: StrokeObject[] = [
  {
    "id": "st-wchem-card-top-left",
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
    "id": "st-wchem-card-didyouknow",
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
    "id": "st-wchem-card-props",
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
    "id": "st-wchem-table-box",
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
    "id": "st-wchem-table-h1",
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
    "id": "st-wchem-table-h2",
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
    "id": "st-wchem-table-h3",
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
    "id": "st-wchem-table-v1",
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
    "id": "st-wchem-table-v2",
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
    "id": "st-wchem-table-v3",
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
    "id": "st-wchem-card-life",
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
    "id": "st-wchem-card-electrolysis",
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
    "id": "st-wchem-dot-1",
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
    "id": "st-wchem-dot-2",
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
    "id": "st-wchem-dot-3",
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
    "id": "st-wchem-dot-4",
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
    "id": "st-wchem-dot-5",
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
    "id": "st-wchem-ptr-h2",
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
    "id": "st-wchem-ptr-o2",
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
    "id": "st-wchem-ptr-bat",
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
    "id": "txt-wchem-title-1",
    "layerId": "layer-2",
    "x": 19,
    "y": 11,
    "text": "ΤΟ",
    "fontSize": 76.16,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "left"
  },
  {
    "id": "txt-wchem-title-2",
    "layerId": "layer-2",
    "x": 134,
    "y": 12,
    "text": "ΝΕΡΟ",
    "fontSize": 76.16,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0284c7",
    "textAlign": "left"
  },
  {
    "id": "txt-wchem-subtitle",
    "layerId": "layer-2",
    "x": 19,
    "y": 104,
    "text": "Το πολυτιμότερο αγαθό της φύσης και της ζωής!",
    "fontSize": 22,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#1e3a8a",
    "textAlign": "left"
  },
  {
    "id": "txt-wchem-intro",
    "layerId": "layer-2",
    "x": 386,
    "y": 284,
    "boxWidth": 326,
    "boxHeight": 205,
    "text": "Το νερό (H₂O) είναι η πιο διαδεδομένη\nχημική ένωση στην επιφάνεια της Γης.\nΚαλύπτει το 70% του πλανήτη, αποτελεί\nτο 60-70% του ανθρώπινου σώματος και\nείναι ο σημαντικότερος φυσικός διαλύτης.",
    "fontSize": 20.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#1e293b",
    "textAlign": "left"
  },
  {
    "id": "txt-wchem-sig",
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
    "id": "txt-wchem-dyk-title",
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
    "id": "txt-wchem-dyk-body",
    "layerId": "layer-2",
    "x": 738,
    "y": 274,
    "boxWidth": 184,
    "boxHeight": 185,
    "text": "Αν και το 70% της Γης\nκαλύπτεται από νερό,\nτο 97% είναι αλμυρό!\nΜόνο το 3% είναι γλυκό\nκαι λιγότερο από το 1%\nείναι άμεσα διαθέσιμο\nπόσιμο νερό!",
    "fontSize": 18.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#1e293b",
    "textAlign": "left"
  },
  {
    "id": "txt-wchem-s1-title",
    "layerId": "layer-2",
    "x": 60,
    "y": 177,
    "text": "ΧΗΜΙΚΗ ΣΥΣΤΑΣΗ & ΔΟΜΗ (H₂O)",
    "fontSize": 21,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#c2410c",
    "textAlign": "left"
  },
  {
    "id": "txt-wchem-s1-b1",
    "layerId": "layer-2",
    "x": 29,
    "y": 212,
    "boxWidth": 215,
    "text": "Μοριακός τύπος: H₂O\n• 2 άτομα Υδρογόνου (H)\n• 1 άτομο Οξυγόνου (O)",
    "fontSize": 19,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "left"
  },
  {
    "id": "txt-wchem-s1-b2",
    "layerId": "layer-2",
    "x": 29,
    "y": 308,
    "boxWidth": 330,
    "text": "Σύνθεση του νερού (καύση H₂):\n• 2H₂(g) + O₂(g)  →  2H₂O(l) + ενέργεια",
    "fontSize": 18.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "left"
  },
  {
    "id": "txt-wchem-s1-b3",
    "layerId": "layer-2",
    "x": 29,
    "y": 384,
    "boxWidth": 330,
    "text": "Παγκόσμιος Διαλύτης:\nΔιαλύει στερεά, υγρά & αέρια (O₂, CO₂)\nσχηματίζοντας υδατικά διαλύματα.",
    "fontSize": 18.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#1e293b",
    "textAlign": "left"
  },
  {
    "id": "txt-wchem-s2-title",
    "layerId": "layer-2",
    "x": 66,
    "y": 527,
    "text": "ΙΔΙΟΤΗΤΕΣ & ΡΟΛΟΣ ΤΟΥ ΝΕΡΟΥ",
    "fontSize": 24,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#c2410c",
    "textAlign": "left"
  },
  {
    "id": "txt-wchem-s2-bullets",
    "layerId": "layer-2",
    "x": 27,
    "y": 566,
    "boxWidth": 412,
    "text": "• Καθαρό νερό: άχρωμο, άοσμο και άγευστο υγρό.\n• Σημείο τήξης: 0 °C  |  Σημείο βρασμού: 100 °C.\n• Ανώμαλη διαστολή: μέγιστη πυκνότητα στους 4 °C\n  (ο πάγος επιπλέει στο υγρό νερό!).\n• Απαραίτητο στη φωτοσύνθεση & στον μεταβολισμό.\n• Ανακυκλώνεται διαρκώς με τον Κύκλο του Νερού.",
    "fontSize": 18,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#1e293b",
    "textAlign": "left"
  },
  {
    "id": "txt-wchem-s3-title",
    "layerId": "layer-2",
    "x": 508,
    "y": 561,
    "text": "ΚΑΤΑΝΟΜΗ & ΧΡΗΣΕΙΣ ΤΟΥ ΝΕΡΟΥ",
    "fontSize": 23,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#c2410c",
    "textAlign": "left"
  },
  {
    "id": "txt-wchem-th-1",
    "layerId": "layer-2",
    "x": 480,
    "y": 608,
    "boxWidth": 108,
    "text": "ΤΟΜΕΑΣ",
    "fontSize": 14.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "center"
  },
  {
    "id": "txt-wchem-th-2",
    "layerId": "layer-2",
    "x": 595,
    "y": 601,
    "boxWidth": 100,
    "text": "ΠΟΣΟΣΤΟ\nΚΑΤΑΝΑΛΩΣΗΣ",
    "fontSize": 13.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "center"
  },
  {
    "id": "txt-wchem-th-3",
    "layerId": "layer-2",
    "x": 701,
    "y": 608,
    "boxWidth": 100,
    "text": "ΚΥΡΙΑ ΧΡΗΣΗ",
    "fontSize": 14,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "center"
  },
  {
    "id": "txt-wchem-th-4",
    "layerId": "layer-2",
    "x": 808,
    "y": 608,
    "boxWidth": 98,
    "text": "ΕΞΟΙΚΟΝΟΜΗΣΗ",
    "fontSize": 13.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "center"
  },
  {
    "id": "txt-wchem-tr1-1",
    "layerId": "layer-2",
    "x": 480,
    "y": 654,
    "boxWidth": 108,
    "text": "ΓΕΩΡΓΙΑ",
    "fontSize": 14.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "center"
  },
  {
    "id": "txt-wchem-tr1-2",
    "layerId": "layer-2",
    "x": 595,
    "y": 653,
    "boxWidth": 100,
    "text": "~ 70 %",
    "fontSize": 15.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#15803d",
    "textAlign": "center"
  },
  {
    "id": "txt-wchem-tr1-3",
    "layerId": "layer-2",
    "x": 701,
    "y": 647,
    "boxWidth": 100,
    "text": "Άρδευση\nκαλλιεργειών",
    "fontSize": 13.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#1e293b",
    "textAlign": "center"
  },
  {
    "id": "txt-wchem-tr1-4",
    "layerId": "layer-2",
    "x": 808,
    "y": 647,
    "boxWidth": 98,
    "text": "Στάγδην\nάρδευση",
    "fontSize": 13.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#1d4ed8",
    "textAlign": "center"
  },
  {
    "id": "txt-wchem-tr2-1",
    "layerId": "layer-2",
    "x": 480,
    "y": 698,
    "boxWidth": 108,
    "text": "ΒΙΟΜΗΧΑΝΙΑ",
    "fontSize": 14,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "center"
  },
  {
    "id": "txt-wchem-tr2-2",
    "layerId": "layer-2",
    "x": 595,
    "y": 698,
    "boxWidth": 100,
    "text": "~ 20 %",
    "fontSize": 15.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#ea580c",
    "textAlign": "center"
  },
  {
    "id": "txt-wchem-tr2-3",
    "layerId": "layer-2",
    "x": 701,
    "y": 692,
    "boxWidth": 100,
    "text": "Ψύξη, διαλύτης\n& παραγωγή",
    "fontSize": 13.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#1e293b",
    "textAlign": "center"
  },
  {
    "id": "txt-wchem-tr2-4",
    "layerId": "layer-2",
    "x": 808,
    "y": 692,
    "boxWidth": 98,
    "text": "Ανακύκλωση\n& βιολ. καθαρ.",
    "fontSize": 13.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#7e22ce",
    "textAlign": "center"
  },
  {
    "id": "txt-wchem-tr3-1",
    "layerId": "layer-2",
    "x": 480,
    "y": 737,
    "boxWidth": 108,
    "text": "ΟΙΚΙΑΚΗ\n(ΥΔΡΕΥΣΗ)",
    "fontSize": 13.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "center"
  },
  {
    "id": "txt-wchem-tr3-2",
    "layerId": "layer-2",
    "x": 595,
    "y": 742,
    "boxWidth": 100,
    "text": "~ 10 %",
    "fontSize": 15.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0284c7",
    "textAlign": "center"
  },
  {
    "id": "txt-wchem-tr3-3",
    "layerId": "layer-2",
    "x": 701,
    "y": 737,
    "boxWidth": 100,
    "text": "Πόσιμο νερό\n& καθαριότητα",
    "fontSize": 13.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#1e293b",
    "textAlign": "center"
  },
  {
    "id": "txt-wchem-tr3-4",
    "layerId": "layer-2",
    "x": 808,
    "y": 737,
    "boxWidth": 98,
    "text": "Κλείνουμε\nτη βρύση!",
    "fontSize": 13.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#dc2626",
    "textAlign": "center"
  },
  {
    "id": "txt-wchem-table-foot",
    "layerId": "layer-2",
    "x": 476,
    "y": 784,
    "boxWidth": 434,
    "text": "Η ορθολογική διαχείριση του νερού προστατεύει το μέλλον μας!",
    "fontSize": 17,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "center"
  },
  {
    "id": "txt-wchem-s4-title",
    "layerId": "layer-2",
    "x": 64,
    "y": 861,
    "text": "ΤΟ ΝΕΡΟ ΣΤΗ ΖΩΗ",
    "fontSize": 24,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#c2410c",
    "textAlign": "left"
  },
  {
    "id": "txt-wchem-s4-1",
    "layerId": "layer-2",
    "x": 24,
    "y": 906,
    "text": "ΑΡΔΕΥΣΗ & ΓΕΩΡΓΙΑ\nΑνάπτυξη φυτών\nκαι παραγωγή τροφής",
    "fontSize": 15.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#14532d",
    "textAlign": "left"
  },
  {
    "id": "txt-wchem-s4-2",
    "layerId": "layer-2",
    "x": 24,
    "y": 1012,
    "text": "ΔΙΚΤΥΟ ΥΔΡΕΥΣΗΣ\nΦίλτρανση, χλωρίωση\n& μεταφορά στα σπίτια",
    "fontSize": 15.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#1e3a8a",
    "textAlign": "left"
  },
  {
    "id": "txt-wchem-s4-3",
    "layerId": "layer-2",
    "x": 24,
    "y": 1118,
    "text": "ΕΞΟΙΚΟΝΟΜΗΣΗ\nΚλείνουμε τη βρύση,\nεπισκευάζουμε διαρροές",
    "fontSize": 15.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#581c87",
    "textAlign": "left"
  },
  {
    "id": "txt-wchem-s4-4",
    "layerId": "layer-2",
    "x": 24,
    "y": 1214,
    "text": "ΠΡΟΣΤΑΣΙΑ ΥΔΑΤΩΝ\nΔεν ρυπαίνουμε ποτάμια,\nλίμνες και θάλασσες",
    "fontSize": 15.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#1e293b",
    "textAlign": "left"
  },
  {
    "id": "txt-wchem-s5-title",
    "layerId": "layer-2",
    "x": 399,
    "y": 858,
    "text": "ΗΛΕΚΤΡΟΛΥΣΗ ΤΟΥ ΝΕΡΟΥ",
    "fontSize": 29,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#c2410c",
    "textAlign": "left"
  },
  {
    "id": "txt-wchem-s5-desc",
    "layerId": "layer-2",
    "x": 362,
    "y": 903,
    "text": "Με ηλεκτρικό ρεύμα (συσκευή Hofmann) το νερό διασπάται στα στοιχεία του.",
    "fontSize": 17.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#111827",
    "textAlign": "left"
  },
  {
    "id": "txt-wchem-s5-wordeq",
    "layerId": "layer-2",
    "x": 362,
    "y": 948,
    "text": "Γενική μορφή:\nΝερό  →  Υδρογόνο (H₂)↑  +  Οξυγόνο (O₂)↑",
    "fontSize": 20,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "left",
    "spans": [
      {
        "start": 14,
        "end": 55,
        "color": "#dc2626"
      }
    ]
  },
  {
    "id": "txt-wchem-s5-chemeq",
    "layerId": "layer-2",
    "x": 362,
    "y": 1018,
    "text": "Χημική εξίσωση:\n2H₂O(l)  →  2H₂(g)↑  +  O₂(g)↑   (αναλογία όγκων 2 : 1)",
    "fontSize": 21,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "left",
    "spans": [
      {
        "start": 16,
        "end": 46,
        "color": "#b61c1c"
      }
    ]
  },
  {
    "id": "txt-wchem-s5-lbl-h2",
    "layerId": "layer-2",
    "x": 366,
    "y": 1126,
    "boxWidth": 154,
    "text": "Κάθοδος (-)\nΑέριο Υδρογόνο (H₂)\nΔιπλάσιος όγκος (2V)",
    "fontSize": 18,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#1e293b",
    "textAlign": "center"
  },
  {
    "id": "txt-wchem-s5-lbl-o2",
    "layerId": "layer-2",
    "x": 702,
    "y": 1126,
    "boxWidth": 165,
    "text": "Άνοδος (+)\nΑέριο Οξυγόνο (O₂)\nΜισός όγκος (1V)",
    "fontSize": 18,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#1e293b",
    "textAlign": "center"
  },
  {
    "id": "txt-wchem-s5-lbl-bat",
    "layerId": "layer-2",
    "x": 702,
    "y": 1232,
    "boxWidth": 165,
    "text": "Πηγή συνεχούς\nρεύματος (μπαταρία)",
    "fontSize": 17.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#1e293b",
    "textAlign": "center"
  }
];

  return {
    id: WATER_CHEMISTRY_NOTEBOOK_ID,
    title: 'Το Νερό',
    folder: folder || 'Γενικά',
    tags: ['χημεία', 'νερό', 'β γυμνασίου', 'ηλεκτρόλυση', 'διαλύτης', 'κύκλος νερού'],
    coverColor: '#0284c7',
    updatedAt: '2026-11-09T14:20:00.000Z',
    sourceFormat: '.bestNotes',
    pages: [
      {
        id: 'page-water-chemistry-b-gym-1',
        title: 'Το Νερό',
        tags: ['χημεία', 'νερό', 'β γυμνασίου', 'ηλεκτρόλυση', 'διαλύτης'],
        template: 'grid',
        orientation: 'portrait',
        layers: [
          { id: 'layer-2', name: 'Κειμενα', visible: true, locked: false, opacity: 1 },
          { id: 'layer-1', name: 'Σχηματα', visible: true, locked: false, opacity: 1 },
        ],
        strokes,
        texts,
        images,
        tapes: [],
      },
    ],
  };
}
