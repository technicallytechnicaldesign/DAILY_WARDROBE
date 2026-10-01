# DAILY WARDROBE

A tagged wardrobe database and style-filtered outfit flipbook. Sibling project to KNIT_CHAOS, same flipbook mechanic, rebuilt for real clothes instead of one generated contact sheet.

## Run it locally

With Node.js installed, run `npm run dev` in this folder, then open http://127.0.0.1:8080.
No package installation or build is needed. Alternatively run `python -m http.server 8080 --bind 127.0.0.1` here.
Use an HTTP server; browser security prevents ES modules from working by double-clicking index.html.

## Host it yourself

Upload `index.html`, `style.css`, `app.js`, `catalog.js`, `favicon.svg`, and `assets/` to any static HTTP(S) host.
They work in a subdirectory as well as a domain root. No server-side app, database, or build service is involved.

## Explore

- Five sections: Top, Bottom, Outerwear, Shoes, Accessory.
- The **Style** filter row restricts every section to pieces tagged with that vibe (Professional, Fun, Weekend, Going out, Chaos).
- The **Colour** filter row further narrows by three buckets, not literal colour tags: Black (solo black), Accent on black (black plus one pop colour), Wild colour (anything without black). Tuned for a black-heavy wardrobe; edit `COLOUR_BUCKETS` in `app.js` if yours isn't.
- Both filters apply together, everywhere: the wardrobe grid, the flipbook, and the combo count.
- Click a wardrobe card to wear it and jump to the flipbook. Click a flipbook row, swipe it, or use its arrows to flip through the matching pieces.
- Shuffle picks a random piece per section, but only from what currently matches your filters.
- A section with nothing tagged for the current filter shows "No match" instead of guessing.

## Where to change things

- `catalog.js`: the wardrobe database itself. `SECTIONS` are the five flipbook slots, `STYLES` are the filter categories, `pieces` is the actual garment list.
- `style.css`: the black / white / red palette (`--ink`, `--paper`, `--red`), responsive layout, and the page-flip animation.
- `app.js`: filter state (including `COLOUR_BUCKETS` and how a piece's colours map to one), the flipbook and grid rendering, the page-turn animation, and routing.

## Adding a real piece

1. Photograph the garment front-on on a plain, contrasting background. Keep the original in this project's `00_INBOX/` (or wherever your photo library already lives) and export a web-sized copy (under ~800px on the long edge is plenty) into `assets/items/`.
2. Open `catalog.js` and add a row with `item(section, name, colors, styles, notes)`, setting `image: './assets/items/<file>.jpg'` on that entry (or edit the generated object directly).
3. Reload. Pieces without a photo automatically fall back to a colour swatch, so you can tag things faster than you can photograph them and backfill photos later.
4. Tag honestly rather than exhaustively: a piece can carry several `styles`, and the filters are a union within a section (any matching style shows it), not a strict rule.

There's no build step and no backend: `catalog.js` is the entire database, in plain sight and easy to script against later if the wardrobe outgrows hand-editing.
