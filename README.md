# What's Your Lucky Capsule?

A digital gashapon game for DOST-SEI examination weekend. Press one button, watch the machine, and open a surprise capsule. No accounts, no backend, no saved data: reloading resets everything.

## Structure
```
lucky-capsule/
├── index.html
├── css/styles.css
├── js/
│   ├── main.js       state machine (IDLE / DISPENSING / REVEALED), animation, share
│   ├── capsules.js   30 capsules: 17 Common, 7 Uncommon, 4 Rare, 2 Legendary
│   ├── draw.js       weighted rarity (60/25/12/3), then random capsule in that tier
│   └── sound.js      Web Audio sound effects (off by default)
├── assets/logos/     official DOST, NEUST-ADS, DOST-SEI (header) and START (footer) logos
└── README.md
```
All machine and capsule graphics are CSS/inline SVG. The only images are the four official logos, resized proportionally without any color or shape changes.

## Run locally
ES modules need HTTP, not `file://`:
```
cd lucky-capsule
python3 -m http.server 8000
```
Open http://localhost:8000.

## Deploy on GitHub Pages
1. Push the folder contents to a GitHub repository.
2. Settings → Pages → Source: "Deploy from a branch", branch `main`, folder `/ (root)`.
3. Visit `https://<user>.github.io/<repo>/`. All paths are relative, so the repository subpath works. Use that URL for the booth QR code.

## Notes
- Poppins loads from Google Fonts; a sans-serif fallback applies if offline.
- Sharing uses the Web Share API, then the clipboard, with a visible message if neither is available.
