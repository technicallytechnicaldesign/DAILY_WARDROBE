// The wardrobe database. Every real garment gets one entry here.
//
// To add a piece: photograph it front-on on a plain background, drop the file
// into ./assets/items/, then add a row below with image: './assets/items/<file>'.
// Until a piece has a photo, image stays null and the flipbook draws a
// colour-swatch card from `colors` instead, so the tool works before the
// camera does.
//
// section: which flipbook slot the piece fills (see SECTIONS below).
// styles: which style categories the piece is allowed to appear under.
//         A piece can carry several; it shows up whenever any of its
//         styles matches the selected filter.
// colors: 1-3 colour tags, most specific first. This wardrobe runs black,
//         so the colour FILTER (app.js) buckets pieces into black / accent
//         on black / wild rather than filtering on the literal tag: a solo
//         'black' piece is the black bucket, 'black' plus anything else is
//         accent, anything without black is wild. Keep tagging the real
//         colours anyway; the swatch card renders them, bucket or not.

export const SECTIONS = [
  { id: 'top', label: 'Top', short: 'TOP' },
  { id: 'bottom', label: 'Bottom', short: 'BTM' },
  { id: 'outerwear', label: 'Outerwear', short: 'LAYER' },
  { id: 'shoes', label: 'Shoes', short: 'SHOES' },
  { id: 'accessory', label: 'Accessory', short: 'EXTRA' },
];

export const STYLES = [
  { id: 'professional', label: 'Professional' },
  { id: 'fun', label: 'Fun' },
  { id: 'weekend', label: 'Weekend' },
  { id: 'going-out', label: 'Going out' },
  { id: 'chaos', label: 'Chaos' },
];

let n = 0;
const item = (section, name, colors, styles, notes = '') => ({
  id: `${section}-${n++}`, section, name, colors, styles, notes, image: null,
});

export const pieces = [
  item('top', 'Black crew tee', ['black'], ['weekend', 'fun', 'chaos'], 'The one that goes under everything.'),
  item('top', 'Black tee, red logo', ['black', 'red'], ['fun', 'chaos'], 'Small chest print, otherwise plain.'),
  item('top', 'Black silk shirt', ['black'], ['professional', 'going-out'], 'Drapes well, dry-clean only.'),
  item('top', 'Tie-dye graphic tee', ['purple', 'orange', 'yellow'], ['fun', 'chaos', 'weekend'], 'Loud on purpose, oversized fit.'),

  item('bottom', 'Black tailored trousers', ['black'], ['professional', 'going-out'], 'Straight leg, high waist.'),
  item('bottom', 'Black cargo pants', ['black'], ['weekend', 'chaos'], 'Too many pockets, exactly enough.'),
  item('bottom', 'Black jeans, green stitching', ['black', 'green'], ['weekend', 'fun'], 'Raw hem, contrast thread.'),
  item('bottom', 'Colour-block track pants', ['blue', 'red'], ['fun', 'chaos', 'weekend'], 'Retro panel stripe.'),

  item('outerwear', 'Black wool blazer', ['black'], ['professional', 'going-out'], 'Structured shoulder, single button.'),
  item('outerwear', 'Black bomber, orange lining', ['black', 'orange'], ['chaos', 'fun', 'weekend'], 'Flash of colour when it moves.'),
  item('outerwear', 'Black trench coat', ['black'], ['professional', 'weekend'], 'Belted, knee length.'),
  item('outerwear', 'Patchwork jacket', ['red', 'green', 'yellow'], ['chaos', 'fun'], 'No two panels match.'),

  item('shoes', 'Black leather loafers', ['black'], ['professional'], 'Polished, no laces.'),
  item('shoes', 'Black combat boots', ['black'], ['chaos', 'going-out', 'weekend'], 'Lug sole, laced high.'),
  item('shoes', 'Black sneakers, neon accent', ['black', 'yellow'], ['weekend', 'fun', 'chaos'], 'Clean, low-top.'),
  item('shoes', 'Multicolour sneakers', ['blue', 'red', 'yellow'], ['fun', 'going-out'], 'The pair that starts conversations.'),

  item('accessory', 'Black leather belt', ['black'], ['professional', 'weekend'], 'Slim, silver buckle.'),
  item('accessory', 'Black cap, red logo', ['black', 'red'], ['weekend', 'fun'], 'Curved brim, adjustable strap.'),
  item('accessory', 'Rainbow statement scarf', ['purple', 'green', 'orange'], ['fun', 'chaos', 'weekend'], 'Long enough to wrap twice.'),
  item('accessory', 'Structured black bag', ['black'], ['professional', 'going-out'], 'Top handle, fits a laptop.'),
];
