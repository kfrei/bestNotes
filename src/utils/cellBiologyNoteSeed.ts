import { Notebook, StrokeObject, TextObject, ImageObject } from "../types/note";
import { CUTOUTS } from "./scienceNotesSeed";

export const CELL_BIOLOGY_NOTEBOOK_ID = "nb-cell-biology-v1";

export function buildCellBiologyNotebook(folder = "Γενικά"): Notebook {
  const images: ImageObject[] = [
  {
    "id": "img-cell-leaf-left",
    "layerId": "layer-1",
    "x": 138,
    "y": 34,
    "width": 52,
    "height": 76,
    "rotation": 0,
    "dataUrl": "/mind_maps/premium_pdf/premium_cell_leaf_left.png",
    "zOrder": 12,
    "naturalWidth": 45,
    "naturalHeight": 71
  },
  {
    "id": "img-cell-leaf-right",
    "layerId": "layer-1",
    "x": 752,
    "y": 34,
    "width": 56,
    "height": 76,
    "rotation": 0,
    "dataUrl": "/mind_maps/premium_pdf/premium_cell_leaf_right.png",
    "zOrder": 13,
    "naturalWidth": 55,
    "naturalHeight": 71
  },
  {
    "id": "img-cell-scientists",
    "layerId": "layer-1",
    "x": 18,
    "y": 256,
    "width": 56,
    "height": 332,
    "rotation": 0,
    "dataUrl": "/mind_maps/premium_pdf/premium_cell_scientists_hooke_schleiden_schwann_virchow.png",
    "zOrder": 14,
    "naturalWidth": 83,
    "naturalHeight": 440
  },
  {
    "id": "img-cell-prokaryote",
    "layerId": "layer-1",
    "x": 322,
    "y": 442,
    "width": 96,
    "height": 176,
    "rotation": 0,
    "dataUrl": "/mind_maps/premium_pdf/premium_cell_prokaryotic_clean.png",
    "zOrder": 15,
    "naturalWidth": 236,
    "naturalHeight": 436
  },
  {
    "id": "img-cell-eukaryote-small",
    "layerId": "layer-1",
    "x": 500,
    "y": 446,
    "width": 136,
    "height": 160,
    "rotation": 0,
    "dataUrl": "/mind_maps/premium_pdf/premium_cell_eukaryotic_small_clean.png",
    "zOrder": 16,
    "naturalWidth": 372,
    "naturalHeight": 436
  },
  {
    "id": "img-cell-theory-circles",
    "layerId": "layer-1",
    "x": 660,
    "y": 274,
    "width": 68,
    "height": 292,
    "rotation": 0,
    "dataUrl": "/mind_maps/premium_pdf/premium_cell_theory_3circles.png",
    "zOrder": 17,
    "naturalWidth": 114,
    "naturalHeight": 440
  },
  {
    "id": "img-cell-plant",
    "layerId": "layer-1",
    "x": 132,
    "y": 682,
    "width": 196,
    "height": 342,
    "rotation": 0,
    "dataUrl": "/mind_maps/premium_pdf/premium_cell_plant_eukaryotic_isolated.png",
    "zOrder": 18,
    "naturalWidth": 364,
    "naturalHeight": 604
  },
  {
    "id": "img-cell-organelles-col",
    "layerId": "layer-1",
    "x": 354,
    "y": 696,
    "width": 42,
    "height": 328,
    "rotation": 0,
    "dataUrl": "/mind_maps/premium_pdf/premium_cell_organelles_8icons_full.png",
    "zOrder": 19,
    "naturalWidth": 71,
    "naturalHeight": 504
  },
  {
    "id": "img-cell-animal",
    "layerId": "layer-1",
    "x": 592,
    "y": 686,
    "width": 206,
    "height": 334,
    "rotation": 0,
    "dataUrl": "/mind_maps/premium_pdf/premium_cell_animal_eukaryotic_isolated.png",
    "zOrder": 20,
    "naturalWidth": 392,
    "naturalHeight": 604
  },
  {
    "id": "img-cell-size-icons",
    "layerId": "layer-1",
    "x": 18,
    "y": 1188,
    "width": 242,
    "height": 76,
    "rotation": 0,
    "dataUrl": "/mind_maps/premium_pdf/premium_cell_size_3icons_clean.png",
    "zOrder": 21,
    "naturalWidth": 440,
    "naturalHeight": 148
  },
  {
    "id": "img-cell-microscope",
    "layerId": "layer-1",
    "x": 536,
    "y": 1108,
    "width": 96,
    "height": 178,
    "rotation": 0,
    "dataUrl": "/mind_maps/premium_pdf/premium_cell_optical_microscope.png",
    "zOrder": 22,
    "naturalWidth": 238,
    "naturalHeight": 440
  },
  {
    "id": "img-cell-bulb",
    "layerId": "layer-1",
    "x": 694,
    "y": 1054,
    "width": 28,
    "height": 36,
    "rotation": 0,
    "dataUrl": CUTOUTS["bases_bulb"],
    "zOrder": 23,
    "naturalWidth": 38,
    "naturalHeight": 50
  },
  {
    "id": "img-cell-neuron",
    "layerId": "layer-1",
    "x": 672,
    "y": 1196,
    "width": 244,
    "height": 102,
    "rotation": 0,
    "dataUrl": "/mind_maps/premium_pdf/premium_cell_neuron_clean.png",
    "zOrder": 24,
    "naturalWidth": 440,
    "naturalHeight": 204
  }
];

  const strokes: StrokeObject[] = [
  {
    "id": "st-cell-banner",
    "layerId": "layer-1",
    "tool": "pen",
    "penType": "ballpoint",
    "isShape": true,
    "shapeType": "rectangle",
    "color": "#334155",
    "width": 2.2,
    "opacity": 1,
    "points": [
      {
        "x": 92,
        "y": 166,
        "pressure": 0.8
      },
      {
        "x": 848,
        "y": 166,
        "pressure": 0.8
      },
      {
        "x": 848,
        "y": 204,
        "pressure": 0.8
      },
      {
        "x": 92,
        "y": 204,
        "pressure": 0.8
      },
      {
        "x": 92,
        "y": 166,
        "pressure": 0.8
      }
    ],
    "zOrder": 1,
    "fillStyle": "solid",
    "fillColor": "#dcfce7",
    "fillTransparency": 75
  },
  {
    "id": "st-cell-card-r1c1",
    "layerId": "layer-1",
    "tool": "pen",
    "penType": "ballpoint",
    "isShape": true,
    "shapeType": "rectangle",
    "color": "#3b5998",
    "width": 2.2,
    "opacity": 1,
    "points": [
      {
        "x": 10,
        "y": 216,
        "pressure": 0.8
      },
      {
        "x": 306,
        "y": 216,
        "pressure": 0.8
      },
      {
        "x": 306,
        "y": 628,
        "pressure": 0.8
      },
      {
        "x": 10,
        "y": 628,
        "pressure": 0.8
      },
      {
        "x": 10,
        "y": 216,
        "pressure": 0.8
      }
    ],
    "zOrder": 1,
    "fillStyle": "solid",
    "fillColor": "#f8fafc",
    "fillTransparency": 95
  },
  {
    "id": "st-cell-card-r1c2",
    "layerId": "layer-1",
    "tool": "pen",
    "penType": "ballpoint",
    "isShape": true,
    "shapeType": "rectangle",
    "color": "#3b5998",
    "width": 2.2,
    "opacity": 1,
    "points": [
      {
        "x": 316,
        "y": 216,
        "pressure": 0.8
      },
      {
        "x": 642,
        "y": 216,
        "pressure": 0.8
      },
      {
        "x": 642,
        "y": 628,
        "pressure": 0.8
      },
      {
        "x": 316,
        "y": 628,
        "pressure": 0.8
      },
      {
        "x": 316,
        "y": 216,
        "pressure": 0.8
      }
    ],
    "zOrder": 1,
    "fillStyle": "solid",
    "fillColor": "#f8fafc",
    "fillTransparency": 95
  },
  {
    "id": "st-cell-card-r1c3",
    "layerId": "layer-1",
    "tool": "pen",
    "penType": "ballpoint",
    "isShape": true,
    "shapeType": "rectangle",
    "color": "#3b5998",
    "width": 2.2,
    "opacity": 1,
    "points": [
      {
        "x": 652,
        "y": 216,
        "pressure": 0.8
      },
      {
        "x": 930,
        "y": 216,
        "pressure": 0.8
      },
      {
        "x": 930,
        "y": 628,
        "pressure": 0.8
      },
      {
        "x": 652,
        "y": 628,
        "pressure": 0.8
      },
      {
        "x": 652,
        "y": 216,
        "pressure": 0.8
      }
    ],
    "zOrder": 1,
    "fillStyle": "solid",
    "fillColor": "#f8fafc",
    "fillTransparency": 95
  },
  {
    "id": "st-cell-r1c2-div",
    "layerId": "layer-1",
    "tool": "pen",
    "penType": "ballpoint",
    "isShape": true,
    "shapeType": "line",
    "color": "#94a3b8",
    "width": 1.6,
    "opacity": 1,
    "points": [
      {
        "x": 482,
        "y": 254,
        "pressure": 0.8
      },
      {
        "x": 482,
        "y": 616,
        "pressure": 0.8
      }
    ],
    "zOrder": 3
  },
  {
    "id": "st-cell-card-r2c1",
    "layerId": "layer-1",
    "tool": "pen",
    "penType": "ballpoint",
    "isShape": true,
    "shapeType": "rectangle",
    "color": "#3b5998",
    "width": 2.2,
    "opacity": 1,
    "points": [
      {
        "x": 10,
        "y": 642,
        "pressure": 0.8
      },
      {
        "x": 336,
        "y": 642,
        "pressure": 0.8
      },
      {
        "x": 336,
        "y": 1038,
        "pressure": 0.8
      },
      {
        "x": 10,
        "y": 1038,
        "pressure": 0.8
      },
      {
        "x": 10,
        "y": 642,
        "pressure": 0.8
      }
    ],
    "zOrder": 1,
    "fillStyle": "solid",
    "fillColor": "#f8fafc",
    "fillTransparency": 95
  },
  {
    "id": "st-cell-card-r2c2",
    "layerId": "layer-1",
    "tool": "pen",
    "penType": "ballpoint",
    "isShape": true,
    "shapeType": "rectangle",
    "color": "#3b5998",
    "width": 2.2,
    "opacity": 1,
    "points": [
      {
        "x": 346,
        "y": 642,
        "pressure": 0.8
      },
      {
        "x": 578,
        "y": 642,
        "pressure": 0.8
      },
      {
        "x": 578,
        "y": 1038,
        "pressure": 0.8
      },
      {
        "x": 346,
        "y": 1038,
        "pressure": 0.8
      },
      {
        "x": 346,
        "y": 642,
        "pressure": 0.8
      }
    ],
    "zOrder": 1,
    "fillStyle": "solid",
    "fillColor": "#f8fafc",
    "fillTransparency": 95
  },
  {
    "id": "st-cell-card-r2c3",
    "layerId": "layer-1",
    "tool": "pen",
    "penType": "ballpoint",
    "isShape": true,
    "shapeType": "rectangle",
    "color": "#3b5998",
    "width": 2.2,
    "opacity": 1,
    "points": [
      {
        "x": 588,
        "y": 642,
        "pressure": 0.8
      },
      {
        "x": 930,
        "y": 642,
        "pressure": 0.8
      },
      {
        "x": 930,
        "y": 1038,
        "pressure": 0.8
      },
      {
        "x": 588,
        "y": 1038,
        "pressure": 0.8
      },
      {
        "x": 588,
        "y": 642,
        "pressure": 0.8
      }
    ],
    "zOrder": 1,
    "fillStyle": "solid",
    "fillColor": "#f8fafc",
    "fillTransparency": 95
  },
  {
    "id": "st-cell-card-r3c1",
    "layerId": "layer-1",
    "tool": "pen",
    "penType": "ballpoint",
    "isShape": true,
    "shapeType": "rectangle",
    "color": "#3b5998",
    "width": 2.2,
    "opacity": 1,
    "points": [
      {
        "x": 10,
        "y": 1050,
        "pressure": 0.8
      },
      {
        "x": 270,
        "y": 1050,
        "pressure": 0.8
      },
      {
        "x": 270,
        "y": 1304,
        "pressure": 0.8
      },
      {
        "x": 10,
        "y": 1304,
        "pressure": 0.8
      },
      {
        "x": 10,
        "y": 1050,
        "pressure": 0.8
      }
    ],
    "zOrder": 1,
    "fillStyle": "solid",
    "fillColor": "#f8fafc",
    "fillTransparency": 95
  },
  {
    "id": "st-cell-card-r3c2",
    "layerId": "layer-1",
    "tool": "pen",
    "penType": "ballpoint",
    "isShape": true,
    "shapeType": "rectangle",
    "color": "#3b5998",
    "width": 2.2,
    "opacity": 1,
    "points": [
      {
        "x": 280,
        "y": 1050,
        "pressure": 0.8
      },
      {
        "x": 642,
        "y": 1050,
        "pressure": 0.8
      },
      {
        "x": 642,
        "y": 1304,
        "pressure": 0.8
      },
      {
        "x": 280,
        "y": 1304,
        "pressure": 0.8
      },
      {
        "x": 280,
        "y": 1050,
        "pressure": 0.8
      }
    ],
    "zOrder": 1,
    "fillStyle": "solid",
    "fillColor": "#f8fafc",
    "fillTransparency": 95
  },
  {
    "id": "st-cell-card-r3c3",
    "layerId": "layer-1",
    "tool": "pen",
    "penType": "ballpoint",
    "isShape": true,
    "shapeType": "rectangle",
    "color": "#3b5998",
    "width": 2.2,
    "opacity": 1,
    "points": [
      {
        "x": 652,
        "y": 1050,
        "pressure": 0.8
      },
      {
        "x": 930,
        "y": 1050,
        "pressure": 0.8
      },
      {
        "x": 930,
        "y": 1304,
        "pressure": 0.8
      },
      {
        "x": 652,
        "y": 1304,
        "pressure": 0.8
      },
      {
        "x": 652,
        "y": 1050,
        "pressure": 0.8
      }
    ],
    "zOrder": 1,
    "fillStyle": "solid",
    "fillColor": "#f8fafc",
    "fillTransparency": 95
  },
  {
    "id": "st-cell-scale-main",
    "layerId": "layer-1",
    "tool": "pen",
    "penType": "ballpoint",
    "isShape": true,
    "shapeType": "line",
    "color": "#334155",
    "width": 2,
    "opacity": 1,
    "points": [
      {
        "x": 26,
        "y": 1286,
        "pressure": 0.8
      },
      {
        "x": 252,
        "y": 1286,
        "pressure": 0.8
      }
    ],
    "zOrder": 5
  },
  {
    "id": "st-cell-scale-t1",
    "layerId": "layer-1",
    "tool": "pen",
    "penType": "ballpoint",
    "isShape": true,
    "shapeType": "line",
    "color": "#334155",
    "width": 2,
    "opacity": 1,
    "points": [
      {
        "x": 26,
        "y": 1281,
        "pressure": 0.8
      },
      {
        "x": 26,
        "y": 1291,
        "pressure": 0.8
      }
    ],
    "zOrder": 5
  },
  {
    "id": "st-cell-scale-t2",
    "layerId": "layer-1",
    "tool": "pen",
    "penType": "ballpoint",
    "isShape": true,
    "shapeType": "line",
    "color": "#334155",
    "width": 2,
    "opacity": 1,
    "points": [
      {
        "x": 136,
        "y": 1281,
        "pressure": 0.8
      },
      {
        "x": 136,
        "y": 1291,
        "pressure": 0.8
      }
    ],
    "zOrder": 5
  },
  {
    "id": "st-cell-scale-t3",
    "layerId": "layer-1",
    "tool": "pen",
    "penType": "ballpoint",
    "isShape": true,
    "shapeType": "line",
    "color": "#334155",
    "width": 2,
    "opacity": 1,
    "points": [
      {
        "x": 252,
        "y": 1281,
        "pressure": 0.8
      },
      {
        "x": 252,
        "y": 1291,
        "pressure": 0.8
      }
    ],
    "zOrder": 5
  }
];

  const texts: TextObject[] = [
  {
    "id": "txt-cell-top-tag",
    "layerId": "layer-2",
    "x": 180,
    "y": 4,
    "boxWidth": 580,
    "text": "ΤΟ ΠΙΟ ΒΑΣΙΚΟ ΘΕΜΑ ΣΤΗ ΒΙΟΛΟΓΙΑ",
    "fontSize": 23,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#1e3a8a",
    "textAlign": "center"
  },
  {
    "id": "txt-cell-main-title",
    "layerId": "layer-2",
    "x": 190,
    "y": 34,
    "boxWidth": 560,
    "text": "ΤΟ ΚΥΤΤΑΡΟ",
    "fontSize": 66,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#2e5a27",
    "textAlign": "center"
  },
  {
    "id": "txt-cell-sub-title",
    "layerId": "layer-2",
    "x": 190,
    "y": 116,
    "boxWidth": 560,
    "text": "Η ΜΟΝΑΔΑ ΤΗΣ ΖΩΗΣ",
    "fontSize": 34,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#1e3a8a",
    "textAlign": "center"
  },
  {
    "id": "txt-cell-banner-text",
    "layerId": "layer-2",
    "x": 100,
    "y": 172,
    "boxWidth": 740,
    "text": "Το κύτταρο είναι η βασική δομική και λειτουργική μονάδα όλων των ζωντανών οργανισμών.",
    "fontSize": 18.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "center"
  },
  {
    "id": "txt-cell-c1-title",
    "layerId": "layer-2",
    "x": 18,
    "y": 224,
    "boxWidth": 280,
    "text": "ΑΝΑΚΑΛΥΨΗ ΤΟΥ ΚΥΤΤΑΡΟΥ",
    "fontSize": 18.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#1e3a8a",
    "textAlign": "center"
  },
  {
    "id": "txt-cell-sci-1",
    "layerId": "layer-2",
    "x": 78,
    "y": 256,
    "boxWidth": 224,
    "text": "1665 – Ρόμπερτ Χουκ: παρατήρησε\nμια τομή φελλού στο μικροσκόπιο\nκαι ονόμασε τους μικρούς θαλάμους\n«κύτταρα» (cells).",
    "fontSize": 13.8,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "left",
    "spans": [
      {
        "start": 0,
        "end": 4,
        "color": "#1d4ed8"
      }
    ]
  },
  {
    "id": "txt-cell-sci-2",
    "layerId": "layer-2",
    "x": 78,
    "y": 346,
    "boxWidth": 224,
    "text": "1838 – Ματθίας Σλάιντεν: πρότεινε\nότι όλα τα φυτά αποτελούνται\nαπό κύτταρα.",
    "fontSize": 13.8,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "left",
    "spans": [
      {
        "start": 0,
        "end": 4,
        "color": "#1d4ed8"
      }
    ]
  },
  {
    "id": "txt-cell-sci-3",
    "layerId": "layer-2",
    "x": 78,
    "y": 428,
    "boxWidth": 224,
    "text": "1839 – Θεόδωρος Σβαν: πρότεινε\nότι όλα τα ζώα αποτελούνται\nαπό κύτταρα.",
    "fontSize": 13.8,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "left",
    "spans": [
      {
        "start": 0,
        "end": 4,
        "color": "#1d4ed8"
      }
    ]
  },
  {
    "id": "txt-cell-sci-4",
    "layerId": "layer-2",
    "x": 78,
    "y": 510,
    "boxWidth": 224,
    "text": "1855 – Ρούντολφ Βίρχοφ: διατύπωσε\nτην αρχή «Omnis cellula e cellula»\n(Κάθε κύτταρο προέρχεται από\nπροϋπάρχον κύτταρο).",
    "fontSize": 13.8,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "left",
    "spans": [
      {
        "start": 0,
        "end": 4,
        "color": "#1d4ed8"
      }
    ]
  },
  {
    "id": "txt-cell-c2-title",
    "layerId": "layer-2",
    "x": 326,
    "y": 224,
    "boxWidth": 306,
    "text": "ΕΙΔΗ ΚΥΤΤΑΡΩΝ",
    "fontSize": 18.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#1e3a8a",
    "textAlign": "center"
  },
  {
    "id": "txt-cell-prok-hdr",
    "layerId": "layer-2",
    "x": 322,
    "y": 256,
    "boxWidth": 156,
    "text": "Προκαρυωτικό Κύτταρο",
    "fontSize": 15,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#3f6212",
    "textAlign": "left"
  },
  {
    "id": "txt-cell-prok-bullets",
    "layerId": "layer-2",
    "x": 322,
    "y": 282,
    "boxWidth": 156,
    "text": "• Δεν έχει αληθή πυρήνα.\n• Δεν έχει μεμβρανώδη\n  οργανίδια.\n• Μικρότερο σε μέγεθος\n  (1–10 μm).\n• Παράδειγμα: Βακτήρια",
    "fontSize": 13.2,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "left"
  },
  {
    "id": "txt-cell-euk-hdr",
    "layerId": "layer-2",
    "x": 490,
    "y": 256,
    "boxWidth": 148,
    "text": "Ευκαρυωτικό Κύτταρο",
    "fontSize": 15,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#15803d",
    "textAlign": "left"
  },
  {
    "id": "txt-cell-euk-bullets",
    "layerId": "layer-2",
    "x": 490,
    "y": 282,
    "boxWidth": 148,
    "text": "• Έχει αληθή πυρήνα.\n• Έχει μεμβρανώδη\n  οργανίδια.\n• Μεγαλύτερο σε μέγεθος\n  (10–100 μm).\n• Παραδείγματα: Φυτικά &\n  Ζωικά κύτταρα",
    "fontSize": 13.2,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "left"
  },
  {
    "id": "txt-cell-prok-lbl-1",
    "layerId": "layer-2",
    "x": 418,
    "y": 462,
    "text": "Νουκλεοειδές",
    "fontSize": 12.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "left"
  },
  {
    "id": "txt-cell-prok-lbl-2",
    "layerId": "layer-2",
    "x": 418,
    "y": 494,
    "text": "Ριβοσώματα",
    "fontSize": 12.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "left"
  },
  {
    "id": "txt-cell-prok-lbl-3",
    "layerId": "layer-2",
    "x": 418,
    "y": 522,
    "text": "Κυτταρική\nΜεμβράνη",
    "fontSize": 12,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "left"
  },
  {
    "id": "txt-cell-prok-lbl-4",
    "layerId": "layer-2",
    "x": 418,
    "y": 566,
    "text": "Κυτταρικό Τείχος",
    "fontSize": 12,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "left"
  },
  {
    "id": "txt-cell-prok-lbl-5",
    "layerId": "layer-2",
    "x": 418,
    "y": 598,
    "text": "Μαστίγιο",
    "fontSize": 12.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "left"
  },
  {
    "id": "txt-cell-c3-title",
    "layerId": "layer-2",
    "x": 660,
    "y": 224,
    "boxWidth": 262,
    "text": "ΚΥΤΤΑΡΙΚΗ ΘΕΩΡΙΑ",
    "fontSize": 18.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#1e3a8a",
    "textAlign": "center"
  },
  {
    "id": "txt-cell-th-1",
    "layerId": "layer-2",
    "x": 734,
    "y": 280,
    "boxWidth": 190,
    "text": "1. Όλοι οι ζωντανοί οργανισμοί\n   αποτελούνται από ένα ή\n   περισσότερα κύτταρα.",
    "fontSize": 14.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "left",
    "spans": [
      {
        "start": 0,
        "end": 2,
        "color": "#b91c1c"
      }
    ]
  },
  {
    "id": "txt-cell-th-2",
    "layerId": "layer-2",
    "x": 734,
    "y": 392,
    "boxWidth": 190,
    "text": "2. Το κύτταρο είναι η βασική\n   μονάδα δομής και λειτουργίας\n   των ζωντανών οργανισμών.",
    "fontSize": 14.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "left",
    "spans": [
      {
        "start": 0,
        "end": 2,
        "color": "#b91c1c"
      }
    ]
  },
  {
    "id": "txt-cell-th-3",
    "layerId": "layer-2",
    "x": 734,
    "y": 508,
    "boxWidth": 190,
    "text": "3. Όλα τα κύτταρα προέρχονται\n   από προϋπάρχοντα κύτταρα.",
    "fontSize": 14.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "left",
    "spans": [
      {
        "start": 0,
        "end": 2,
        "color": "#b91c1c"
      }
    ]
  },
  {
    "id": "txt-cell-c4-title",
    "layerId": "layer-2",
    "x": 16,
    "y": 650,
    "boxWidth": 314,
    "text": "ΦΥΤΙΚΟ ΚΥΤΤΑΡΟ (ΕΥΚΑΡΥΩΤΙΚΟ)",
    "fontSize": 17.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#15803d",
    "textAlign": "center"
  },
  {
    "id": "txt-cell-plant-lbl-1",
    "layerId": "layer-2",
    "x": 16,
    "y": 706,
    "text": "Κυτταρικό Τείχος",
    "fontSize": 13.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "left"
  },
  {
    "id": "txt-cell-plant-lbl-2",
    "layerId": "layer-2",
    "x": 16,
    "y": 730,
    "text": "Κυτταρική Μεμβράνη",
    "fontSize": 13.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "left"
  },
  {
    "id": "txt-cell-plant-lbl-3",
    "layerId": "layer-2",
    "x": 16,
    "y": 754,
    "text": "Κυτταρόπλασμα",
    "fontSize": 13.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "left"
  },
  {
    "id": "txt-cell-plant-lbl-4",
    "layerId": "layer-2",
    "x": 16,
    "y": 779,
    "text": "Πυρήνας",
    "fontSize": 13.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "left"
  },
  {
    "id": "txt-cell-plant-lbl-5",
    "layerId": "layer-2",
    "x": 16,
    "y": 803,
    "text": "Πυρηνίσκος",
    "fontSize": 13.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "left"
  },
  {
    "id": "txt-cell-plant-lbl-6",
    "layerId": "layer-2",
    "x": 16,
    "y": 827,
    "text": "Αδρό ΕΔ",
    "fontSize": 13.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "left"
  },
  {
    "id": "txt-cell-plant-lbl-7",
    "layerId": "layer-2",
    "x": 16,
    "y": 851,
    "text": "Λείο ΕΔ",
    "fontSize": 13.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "left"
  },
  {
    "id": "txt-cell-plant-lbl-8",
    "layerId": "layer-2",
    "x": 16,
    "y": 875,
    "text": "Ριβοσώματα",
    "fontSize": 13.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "left"
  },
  {
    "id": "txt-cell-plant-lbl-9",
    "layerId": "layer-2",
    "x": 16,
    "y": 900,
    "text": "Σύμπλεγμα Golgi",
    "fontSize": 13.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "left"
  },
  {
    "id": "txt-cell-plant-lbl-10",
    "layerId": "layer-2",
    "x": 16,
    "y": 924,
    "text": "Χλωροπλάστης",
    "fontSize": 13.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "left"
  },
  {
    "id": "txt-cell-plant-lbl-11",
    "layerId": "layer-2",
    "x": 16,
    "y": 948,
    "text": "Χυμοτόπιο",
    "fontSize": 13.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "left"
  },
  {
    "id": "txt-cell-plant-lbl-12",
    "layerId": "layer-2",
    "x": 16,
    "y": 972,
    "text": "Μιτοχόνδριο",
    "fontSize": 13.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "left"
  },
  {
    "id": "txt-cell-plant-lbl-13",
    "layerId": "layer-2",
    "x": 16,
    "y": 996,
    "text": "Πλασμοδέσματα",
    "fontSize": 13.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "left"
  },
  {
    "id": "txt-cell-c5-title",
    "layerId": "layer-2",
    "x": 352,
    "y": 648,
    "boxWidth": 220,
    "text": "ΚΥΤΤΑΡΙΚΑ ΟΡΓΑΝΙΔΙΑ\nΚΑΙ ΟΙ ΛΕΙΤΟΥΡΓΙΕΣ ΤΟΥΣ",
    "fontSize": 15.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#1e3a8a",
    "textAlign": "center"
  },
  {
    "id": "txt-cell-org-1",
    "layerId": "layer-2",
    "x": 400,
    "y": 696,
    "boxWidth": 174,
    "text": "Πυρήνας: Κέντρο ελέγχου,\nπεριέχει γενετικό υλικό (DNA).",
    "fontSize": 12.8,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "left",
    "spans": [
      {
        "start": 0,
        "end": 8,
        "color": "#4338ca"
      }
    ]
  },
  {
    "id": "txt-cell-org-2",
    "layerId": "layer-2",
    "x": 400,
    "y": 738,
    "boxWidth": 174,
    "text": "Μιτοχόνδριο: Θέση παραγωγής\nενέργειας (παραγωγή ATP).",
    "fontSize": 12.8,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "left",
    "spans": [
      {
        "start": 0,
        "end": 12,
        "color": "#b45309"
      }
    ]
  },
  {
    "id": "txt-cell-org-3",
    "layerId": "layer-2",
    "x": 400,
    "y": 780,
    "boxWidth": 174,
    "text": "Ριβοσώματα: Θέση σύνθεσης\nπρωτεϊνών.",
    "fontSize": 12.8,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "left",
    "spans": [
      {
        "start": 0,
        "end": 11,
        "color": "#1d4ed8"
      }
    ]
  },
  {
    "id": "txt-cell-org-4",
    "layerId": "layer-2",
    "x": 400,
    "y": 820,
    "boxWidth": 174,
    "text": "Ενδοπλασματικό Δίκτυο:\nΒοηθά στη μεταφορά υλικών.",
    "fontSize": 12.8,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "left",
    "spans": [
      {
        "start": 0,
        "end": 22,
        "color": "#1e40af"
      }
    ]
  },
  {
    "id": "txt-cell-org-5",
    "layerId": "layer-2",
    "x": 400,
    "y": 862,
    "boxWidth": 174,
    "text": "Σύμπλεγμα Golgi: Τροποποιεί,\nσυσκευάζει & εκκρίνει ουσίες.",
    "fontSize": 12.8,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "left",
    "spans": [
      {
        "start": 0,
        "end": 16,
        "color": "#9d174d"
      }
    ]
  },
  {
    "id": "txt-cell-org-6",
    "layerId": "layer-2",
    "x": 400,
    "y": 904,
    "boxWidth": 174,
    "text": "Λυσοσώματα: Περιέχουν\nπεπτικά ένζυμα.",
    "fontSize": 12.8,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "left",
    "spans": [
      {
        "start": 0,
        "end": 11,
        "color": "#b45309"
      }
    ]
  },
  {
    "id": "txt-cell-org-7",
    "layerId": "layer-2",
    "x": 400,
    "y": 944,
    "boxWidth": 174,
    "text": "Χυμοτόπιο: Αποθηκεύει νερό,\nουσίες & διατηρεί τη σπαργή.",
    "fontSize": 12.8,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "left",
    "spans": [
      {
        "start": 0,
        "end": 10,
        "color": "#0369a1"
      }
    ]
  },
  {
    "id": "txt-cell-org-8",
    "layerId": "layer-2",
    "x": 400,
    "y": 988,
    "boxWidth": 174,
    "text": "Χλωροπλάστης: Θέση της\nφωτοσύνθεσης (στα φυτά).",
    "fontSize": 12.8,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "left",
    "spans": [
      {
        "start": 0,
        "end": 13,
        "color": "#15803d"
      }
    ]
  },
  {
    "id": "txt-cell-c6-title",
    "layerId": "layer-2",
    "x": 594,
    "y": 650,
    "boxWidth": 330,
    "text": "ΖΩΙΚΟ ΚΥΤΤΑΡΟ (ΕΥΚΑΡΥΩΤΙΚΟ)",
    "fontSize": 17.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#1e3a8a",
    "textAlign": "center"
  },
  {
    "id": "txt-cell-animal-lbl-1",
    "layerId": "layer-2",
    "x": 802,
    "y": 692,
    "text": "Κυτταρική Μεμβράνη",
    "fontSize": 13.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "left"
  },
  {
    "id": "txt-cell-animal-lbl-2",
    "layerId": "layer-2",
    "x": 802,
    "y": 719,
    "text": "Κυτταρόπλασμα",
    "fontSize": 13.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "left"
  },
  {
    "id": "txt-cell-animal-lbl-3",
    "layerId": "layer-2",
    "x": 802,
    "y": 746,
    "text": "Πυρήνας",
    "fontSize": 13.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "left"
  },
  {
    "id": "txt-cell-animal-lbl-4",
    "layerId": "layer-2",
    "x": 802,
    "y": 774,
    "text": "Πυρηνίσκος",
    "fontSize": 13.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "left"
  },
  {
    "id": "txt-cell-animal-lbl-5",
    "layerId": "layer-2",
    "x": 802,
    "y": 801,
    "text": "Αδρό ΕΔ",
    "fontSize": 13.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "left"
  },
  {
    "id": "txt-cell-animal-lbl-6",
    "layerId": "layer-2",
    "x": 802,
    "y": 828,
    "text": "Λείο ΕΔ",
    "fontSize": 13.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "left"
  },
  {
    "id": "txt-cell-animal-lbl-7",
    "layerId": "layer-2",
    "x": 802,
    "y": 855,
    "text": "Ριβοσώματα",
    "fontSize": 13.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "left"
  },
  {
    "id": "txt-cell-animal-lbl-8",
    "layerId": "layer-2",
    "x": 802,
    "y": 882,
    "text": "Σύμπλεγμα Golgi",
    "fontSize": 13.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "left"
  },
  {
    "id": "txt-cell-animal-lbl-9",
    "layerId": "layer-2",
    "x": 802,
    "y": 910,
    "text": "Μιτοχόνδριο",
    "fontSize": 13.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "left"
  },
  {
    "id": "txt-cell-animal-lbl-10",
    "layerId": "layer-2",
    "x": 802,
    "y": 937,
    "text": "Λυσοσώματα",
    "fontSize": 13.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "left"
  },
  {
    "id": "txt-cell-animal-lbl-11",
    "layerId": "layer-2",
    "x": 802,
    "y": 964,
    "text": "Κεντριόλια",
    "fontSize": 13.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "left"
  },
  {
    "id": "txt-cell-animal-lbl-12",
    "layerId": "layer-2",
    "x": 802,
    "y": 991,
    "text": "Κυστίδια",
    "fontSize": 13.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "left"
  },
  {
    "id": "txt-cell-c7-title",
    "layerId": "layer-2",
    "x": 16,
    "y": 1058,
    "boxWidth": 248,
    "text": "ΣΥΓΚΡΙΣΗ ΜΕΓΕΘΟΥΣ",
    "fontSize": 17.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#1e3a8a",
    "textAlign": "center"
  },
  {
    "id": "txt-cell-c7-bullets",
    "layerId": "layer-2",
    "x": 18,
    "y": 1086,
    "boxWidth": 246,
    "text": "• Προκαρυωτικό Κύτταρο: 1 – 10 μm\n  (π.χ. Βακτήρια)\n• Ευκαρυωτικό Κύτταρο: 10 – 100 μm\n  (Φυτικά & Ζωικά κύτταρα)",
    "fontSize": 14,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "left"
  },
  {
    "id": "txt-cell-sz-1",
    "layerId": "layer-2",
    "x": 24,
    "y": 1262,
    "boxWidth": 54,
    "text": "1 μm",
    "fontSize": 14,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "center"
  },
  {
    "id": "txt-cell-sz-10",
    "layerId": "layer-2",
    "x": 108,
    "y": 1262,
    "boxWidth": 60,
    "text": "10 μm",
    "fontSize": 14,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "center"
  },
  {
    "id": "txt-cell-sz-100",
    "layerId": "layer-2",
    "x": 194,
    "y": 1262,
    "boxWidth": 68,
    "text": "100 μm",
    "fontSize": 14,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "center"
  },
  {
    "id": "txt-cell-c8-title",
    "layerId": "layer-2",
    "x": 288,
    "y": 1058,
    "boxWidth": 346,
    "text": "ΣΗΜΑΣΙΑ ΤΟΥ ΚΥΤΤΑΡΟΥ",
    "fontSize": 17.5,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#1e3a8a",
    "textAlign": "center"
  },
  {
    "id": "txt-cell-c8-bullets",
    "layerId": "layer-2",
    "x": 288,
    "y": 1086,
    "boxWidth": 252,
    "text": "✓ Είναι η βασική μονάδα της ζωής.\n✓ Επιτελεί όλες τις ζωτικές λειτουργίες.\n✓ Υπεύθυνο για την ανάπτυξη, την εξέλιξη\n  και την αναπαραγωγή.\n✓ Κύτταρα που συνεργάζονται σχηματίζουν\n  ιστούς, όργανα & συστήματα οργάνων.\n✓ Βάση της κληρονομικότητας και\n  της ποικιλομορφίας.",
    "fontSize": 13.8,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "left"
  },
  {
    "id": "txt-cell-c9-title",
    "layerId": "layer-2",
    "x": 726,
    "y": 1060,
    "boxWidth": 160,
    "text": "ΗΞΕΡΕΣ ΟΤΙ;",
    "fontSize": 18,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#1e3a8a",
    "textAlign": "left"
  },
  {
    "id": "txt-cell-c9-bullets",
    "layerId": "layer-2",
    "x": 660,
    "y": 1092,
    "boxWidth": 264,
    "text": "• Το ανθρώπινο σώμα αποτελείται\n  από περίπου 37 τρισεκατομμύρια\n  κύτταρα!\n• Τα νευρικά κύτταρα μπορεί να είναι\n  πιο μακριά από 1 μέτρο!",
    "fontSize": 14,
    "fontFamily": "calligraphic",
    "bold": true,
    "color": "#0f172a",
    "textAlign": "left"
  }
];

  return {
    id: CELL_BIOLOGY_NOTEBOOK_ID,
    title: "Το Κύτταρο",
    folder: folder || "Γενικά",
    tags: [
      "βιολογία",
      "κύτταρο",
      "ευκαρυωτικό",
      "προκαρυωτικό",
      "οργανίδια",
      "φυτικό κύτταρο",
      "ζωικό κύτταρο",
      "κυτταρική θεωρία",
    ],
    coverColor: "#15803d",
    updatedAt: "2026-11-09T15:02:00.000Z",
    sourceFormat: ".bestNotes",
    pages: [
      {
        id: "page-cell-biology-1",
        title: "Το Κύτταρο — Η Μονάδα της Ζωής",
        tags: ["βιολογία", "κύτταρο", "οργανίδια", "φυτικό", "ζωικό"],
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
