import type { StickerCatalogItem } from './stickersCatalog';

/**
 * 20 Minimalist Stick Figures (Ανθρωπάκια / Stickmen) — 5–6 clean rounded lines + head circle
 * Designed so students can easily copy them by hand in Physics & STEM notebooks.
 * Supports live color & stroke-width customization in the Σκίτσα panel.
 */

export function buildStickFigureSvgMarkup(
  shapeKind: string,
  color: string,
  strokeWidth = 10
): string | null {
  if (!shapeKind.startsWith('stickman-')) return null;
  const sw = Math.max(5, Math.min(20, Math.round(strokeWidth)));
  const c = color || '#16a34a';
  const common = `fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"`;
  let body = '';

  switch (shapeKind) {
    case 'stickman-standing':
      body = `
        <circle cx="110" cy="46" r="18" fill="${c}"/>
        <path ${common} d="M110,64 L110,132 M110,82 L76,118 M110,82 L144,118 M110,132 L86,196 M110,132 L134,196"/>
      `;
      break;
    case 'stickman-walking':
      body = `
        <circle cx="114" cy="44" r="18" fill="${c}"/>
        <path ${common} d="M112,62 L106,128 M110,80 L144,108 M110,80 L76,112 M106,128 L138,162 L146,196 M106,128 L82,162 L66,196"/>
      `;
      break;
    case 'stickman-running':
      body = `
        <circle cx="134" cy="44" r="18" fill="${c}"/>
        <path ${common} d="M126,62 L102,122 M118,80 L156,94 L168,78 M118,80 L80,96 L64,116 M102,122 L142,144 L158,188 M102,122 L70,152 L44,142"/>
      `;
      break;
    case 'stickman-pushing':
      body = `
        <circle cx="138" cy="52" r="18" fill="${c}"/>
        <path ${common} d="M126,68 L94,132 M116,86 L168,90 M112,96 L168,104 M94,132 L132,162 L136,196 M94,132 L64,164 L44,196"/>
      `;
      break;
    case 'stickman-pulling':
      body = `
        <circle cx="80" cy="52" r="18" fill="${c}"/>
        <path ${common} d="M90,68 L116,132 M98,86 L156,102 M102,98 L156,108 M116,132 L144,164 L164,196 M116,132 L88,164 L78,196"/>
      `;
      break;
    case 'stickman-lifting':
      body = `
        <circle cx="110" cy="64" r="17" fill="${c}"/>
        <path ${common} d="M110,81 L110,136 M110,96 L74,76 L74,40 M110,96 L146,76 L146,40 M110,136 L82,164 L82,196 M110,136 L138,164 L138,196"/>
      `;
      break;
    case 'stickman-carrying':
      body = `
        <circle cx="110" cy="46" r="17" fill="${c}"/>
        <path ${common} d="M108,63 L102,130 M106,82 L138,106 L160,96 M106,90 L132,116 L154,108 M102,130 L132,164 L138,196 M102,130 L78,164 L68,196"/>
      `;
      break;
    case 'stickman-sitting':
      body = `
        <circle cx="92" cy="54" r="18" fill="${c}"/>
        <path ${common} d="M92,72 L92,136 M92,92 L126,118 M92,136 L146,136 L152,194"/>
      `;
      break;
    case 'stickman-hanging':
      body = `
        <line x1="44" y1="30" x2="176" y2="30" stroke="${c}" stroke-width="${Math.max(4, Math.round(sw * 0.7))}" stroke-linecap="round"/>
        <circle cx="110" cy="76" r="17" fill="${c}"/>
        <path ${common} d="M110,93 L110,152 M110,104 L82,66 L82,30 M110,104 L138,66 L138,30 M110,152 L96,196 M110,152 L126,192"/>
      `;
      break;
    case 'stickman-jumping':
      body = `
        <circle cx="110" cy="38" r="17" fill="${c}"/>
        <path ${common} d="M110,55 L110,116 M110,72 L72,46 M110,72 L148,46 M110,116 L80,148 L92,178 M110,116 L140,144 L152,172"/>
      `;
      break;
    case 'stickman-falling':
      body = `
        <circle cx="122" cy="60" r="17" fill="${c}"/>
        <path ${common} d="M114,76 L94,132 M106,92 L66,68 M108,92 L152,78 M94,132 L64,162 L52,188 M94,132 L124,158 L146,178"/>
      `;
      break;
    case 'stickman-throwing':
      body = `
        <circle cx="106" cy="46" r="17" fill="${c}"/>
        <path ${common} d="M104,63 L100,130 M102,82 L144,64 L162,48 M102,82 L68,104 M100,130 L134,162 L144,196 M100,130 L74,164 L60,196"/>
        <circle cx="174" cy="40" r="8" fill="${c}"/>
      `;
      break;
    case 'stickman-kicking':
      body = `
        <circle cx="96" cy="46" r="17" fill="${c}"/>
        <path ${common} d="M98,63 L104,130 M100,82 L68,108 M100,82 L134,104 M104,130 L84,196 M104,130 L146,154 L166,138"/>
        <circle cx="182" cy="128" r="9" fill="${c}"/>
      `;
      break;
    case 'stickman-climbing':
      body = `
        <circle cx="114" cy="44" r="17" fill="${c}"/>
        <path ${common} d="M112,61 L104,126 M110,78 L142,48 M110,82 L76,98 M104,126 L138,140 L134,178 M104,126 L78,162 L84,198"/>
      `;
      break;
    case 'stickman-waving':
      body = `
        <circle cx="110" cy="46" r="18" fill="${c}"/>
        <path ${common} d="M110,64 L110,132 M110,82 L148,54 L164,38 M110,82 L76,118 M110,132 L86,196 M110,132 L134,196"/>
      `;
      break;
    case 'stickman-thinking':
      body = `
        <circle cx="106" cy="48" r="18" fill="${c}"/>
        <path ${common} d="M106,66 L106,134 M106,86 L138,94 L126,64 M106,86 L74,114 L92,130 M106,134 L86,196 M106,134 L126,196"/>
      `;
      break;
    case 'stickman-balancing':
      body = `
        <circle cx="110" cy="44" r="17" fill="${c}"/>
        <path ${common} d="M110,61 L110,126 M110,80 L44,72 M110,80 L176,88 M110,126 L110,196 M110,126 L146,144 L156,168"/>
      `;
      break;
    case 'stickman-sliding':
      body = `
        <circle cx="128" cy="54" r="17" fill="${c}"/>
        <path ${common} d="M120,70 L98,124 M112,86 L152,102 M112,86 L74,98 M98,124 L132,148 L120,182 M98,124 L76,154 L94,186"/>
        <line x1="48" y1="186" x2="176" y2="198" stroke="${c}" stroke-width="${Math.max(4, Math.round(sw * 0.65))}" stroke-linecap="round"/>
      `;
      break;
    case 'stickman-cycling':
      body = `
        <circle cx="122" cy="48" r="15" fill="${c}"/>
        <path ${common} d="M116,62 L94,114 M110,78 L148,96 M94,114 L122,136 L112,162 M94,114 L82,148"/>
        <circle cx="66" cy="166" r="24" fill="none" stroke="${c}" stroke-width="${Math.max(4, Math.round(sw * 0.65))}"/>
        <circle cx="158" cy="166" r="24" fill="none" stroke="${c}" stroke-width="${Math.max(4, Math.round(sw * 0.65))}"/>
        <path fill="none" stroke="${c}" stroke-width="${Math.max(4, Math.round(sw * 0.6))}" stroke-linecap="round" stroke-linejoin="round" d="M66,166 L108,166 L146,104 L158,166 M108,166 L94,114"/>
      `;
      break;
    case 'stickman-celebrating':
      body = `
        <circle cx="110" cy="46" r="18" fill="${c}"/>
        <path ${common} d="M110,64 L110,130 M110,84 L74,56 L62,36 M110,84 L146,56 L158,36 M110,130 L84,196 M110,130 L136,196"/>
      `;
      break;
    default:
      return null;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 220" width="220" height="220">${body}</svg>`;
}

const STICK_COMMON_TAGS = ['stickman', 'stick figure', 'ανθρωπάκι', 'ανθρωπάκια', 'φιγούρα', 'vector'];

export const STICK_FIGURES_STICKERS: StickerCatalogItem[] = [
  {
    id: 'sk-stickman-standing',
    title: 'Stickman — Όρθιο Ανθρωπάκι',
    iconifyId: 'custom-svg:stickman-standing:#16a34a:10',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: [...STICK_COMMON_TAGS, 'όρθιος', 'στάση', 'ηρεμία', 'άνθρωπος'],
  },
  {
    id: 'sk-stickman-walking',
    title: 'Stickman — Περπατάει',
    iconifyId: 'custom-svg:stickman-walking:#16a34a:10',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: [...STICK_COMMON_TAGS, 'περπατάω', 'περπάτημα', 'βάδισμα', 'κίνηση'],
  },
  {
    id: 'sk-stickman-running',
    title: 'Stickman — Τρέχει',
    iconifyId: 'custom-svg:stickman-running:#16a34a:10',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: [...STICK_COMMON_TAGS, 'τρέχω', 'τρέξιμο', 'ταχύτητα', 'sprint', 'κίνηση'],
  },
  {
    id: 'sk-stickman-pushing',
    title: 'Stickman — Σπρώχνει (Δύναμη)',
    iconifyId: 'custom-svg:stickman-pushing:#16a34a:10',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: [...STICK_COMMON_TAGS, 'σπρώχνω', 'ώθηση', 'δύναμη', 'κιβώτιο', 'τριβή'],
  },
  {
    id: 'sk-stickman-pulling',
    title: 'Stickman — Τραβάει (Έλξη / Σχοινί)',
    iconifyId: 'custom-svg:stickman-pulling:#16a34a:10',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: [...STICK_COMMON_TAGS, 'τραβάω', 'έλξη', 'σχοινί', 'τάση', 'δύναμη'],
  },
  {
    id: 'sk-stickman-lifting',
    title: 'Stickman — Σηκώνει Βάρος',
    iconifyId: 'custom-svg:stickman-lifting:#16a34a:10',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: [...STICK_COMMON_TAGS, 'σηκώνω', 'ανύψωση', 'βάρος', 'έργο', 'δύναμη'],
  },
  {
    id: 'sk-stickman-carrying',
    title: 'Stickman — Κουβαλάει Φορτίο',
    iconifyId: 'custom-svg:stickman-carrying:#16a34a:10',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: [...STICK_COMMON_TAGS, 'κουβαλάω', 'μεταφέρω', 'φορτίο', 'έργο'],
  },
  {
    id: 'sk-stickman-sitting',
    title: 'Stickman — Κάθεται',
    iconifyId: 'custom-svg:stickman-sitting:#16a34a:10',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: [...STICK_COMMON_TAGS, 'κάθομαι', 'καθιστός', 'καρέκλα', 'ισορροπία'],
  },
  {
    id: 'sk-stickman-hanging',
    title: 'Stickman — Κρέμεται',
    iconifyId: 'custom-svg:stickman-hanging:#16a34a:10',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: [...STICK_COMMON_TAGS, 'κρέμομαι', 'μονόζυγο', 'τάση', 'βάρος', 'ισορροπία'],
  },
  {
    id: 'sk-stickman-jumping',
    title: 'Stickman — Πηδάει (Άλμα)',
    iconifyId: 'custom-svg:stickman-jumping:#16a34a:10',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: [...STICK_COMMON_TAGS, 'πηδάω', 'άλμα', 'βαρύτητα', 'ενέργεια'],
  },
  {
    id: 'sk-stickman-falling',
    title: 'Stickman — Πέφτει (Πτώση)',
    iconifyId: 'custom-svg:stickman-falling:#16a34a:10',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: [...STICK_COMMON_TAGS, 'πέφτω', 'πτώση', 'ελεύθερη πτώση', 'βαρύτητα'],
  },
  {
    id: 'sk-stickman-throwing',
    title: 'Stickman — Πετάει Μπάλα (Βολή)',
    iconifyId: 'custom-svg:stickman-throwing:#16a34a:10',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: [...STICK_COMMON_TAGS, 'πετάω', 'βολή', 'μπάλα', 'οριζόντια βολή', 'πλάγια βολή'],
  },
  {
    id: 'sk-stickman-kicking',
    title: 'Stickman — Κλωτσάει Μπάλα',
    iconifyId: 'custom-svg:stickman-kicking:#16a34a:10',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: [...STICK_COMMON_TAGS, 'κλωτσάω', 'μπάλα', 'κρούση', 'ώθηση', 'ποδόσφαιρο'],
  },
  {
    id: 'sk-stickman-climbing',
    title: 'Stickman — Σκαρφαλώνει',
    iconifyId: 'custom-svg:stickman-climbing:#16a34a:10',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: [...STICK_COMMON_TAGS, 'σκαρφαλώνω', 'ανάβαση', 'σκάλα', 'δυναμική ενέργεια'],
  },
  {
    id: 'sk-stickman-waving',
    title: 'Stickman — Χαιρετάει / Δείχνει',
    iconifyId: 'custom-svg:stickman-waving:#16a34a:10',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: [...STICK_COMMON_TAGS, 'χαιρετάω', 'δείχνω', 'χέρι', 'παρουσίαση'],
  },
  {
    id: 'sk-stickman-thinking',
    title: 'Stickman — Σκέφτεται (Απορία)',
    iconifyId: 'custom-svg:stickman-thinking:#16a34a:10',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: [...STICK_COMMON_TAGS, 'σκέφτομαι', 'απορία', 'ερώτηση', 'ιδέα'],
  },
  {
    id: 'sk-stickman-balancing',
    title: 'Stickman — Ισορροπεί',
    iconifyId: 'custom-svg:stickman-balancing:#16a34a:10',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: [...STICK_COMMON_TAGS, 'ισορροπώ', 'ισορροπία', 'κέντρο μάζας', 'ροπή'],
  },
  {
    id: 'sk-stickman-sliding',
    title: 'Stickman — Γλιστράει / Σκι',
    iconifyId: 'custom-svg:stickman-sliding:#16a34a:10',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: [...STICK_COMMON_TAGS, 'γλιστράω', 'ολίσθηση', 'σκι', 'τριβή', 'κεκλιμένο'],
  },
  {
    id: 'sk-stickman-cycling',
    title: 'Stickman — Ποδήλατο',
    iconifyId: 'custom-svg:stickman-cycling:#16a34a:10',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: [...STICK_COMMON_TAGS, 'ποδήλατο', 'ποδηλάτης', 'κίνηση', 'ταχύτητα', 'κύλιση'],
  },
  {
    id: 'sk-stickman-celebrating',
    title: 'Stickman — Πανηγυρίζει (Χέρια Ψηλά)',
    iconifyId: 'custom-svg:stickman-celebrating:#16a34a:10',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: [...STICK_COMMON_TAGS, 'πανηγυρίζω', 'επιτυχία', 'νίκη', 'χαρά'],
  },
];
