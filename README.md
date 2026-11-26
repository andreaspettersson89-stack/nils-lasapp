# Ljuda ihop

En läsapp för paddan (liggande) i en egen blockvärld. Nils gräver fram block genom att lösa läsuppgifter och bygger ett slott av dem. Figuren heter Åsk-Monstret.

- Statiska filer utan byggsteg: `index.html`, `stil.css`, `grafik.js` (pixelgrafiken, ritad av koden), `ord.js` (innehållet i nivåerna), `app.js` (spelet).
- Allt sparas bara på paddan (localStorage `ljuda-ihop-v1`). Inga konton, ingen server, ingen AI, ingen reklam.
- Rösten är inspelade ljudfiler i `ljud/`, gjorda en gång med ElevenLabs (rösten Sanna Hartfield). Paddans inbyggda röst används inte.
- Speltid per dag och föräldrasidan ligger bakom en fyrsiffrig föräldrakod (kugghjulet på startsidan).

## Nivåerna

| Material | Övning | Öppnas |
|---|---|---|
| Trä | Stor och liten bokstav: "Hitta lilla a." | från början |
| Sten | Första ljudet: "Vilken bokstav börjar sol på?" | efter trä |
| Järn | Stavelser: hör "ma", välj bland ma / mo / sa | efter sten |
| Guld | Läsa ord: hör "sol", välj bland ord som liknar det | efter järn |
| Diamant | Meningar: hör meningen, välj rätt bland tre | efter guld |

Sex rundor per nivå ger sex block. Det som blev fel kommer tillbaka oftare tills det sitter. Stjärnor: 0–1 fel = 3, 2–3 fel = 2, annars 1. Blocken bygger slottet (120 block). När det är klart kommer flaggor och en knapp för ett nytt slott.

## Nya ljud

I `skisser/`: lägg orden i `ordbank.py`, kör `python3 ordbank.py`, slå ihop till `ljud/lista.json`, kör `python3 gor_ljud.py` (nyckeln ligger i Macens nyckelring) och sedan `python3 bygg_ljudtext.py`. `ljud/v2/`, `ljud/borttagna/` och provljuden `fon-*` följer inte med ut på nätet (`.gitignore`).

## Testa

    node test/innehall.test.js     # varje ljud appen kan spela finns som fil

`test/robot.mjs` provkör hela appen i en iPad-webbläsare (se första raden i filen).
