# Screamer

An original retro-style 2D browser soccer game inspired by classic arcade football. Angled pitch, procedural pixel players, blue-and-red club menus, and a playable club season. No external assets, libraries, build step, or network connection required.

## Play

Download `index.html` and open it in a modern desktop or mobile browser. Or serve this directory with any static web server. It can also be hosted with GitHub Pages from the root directory.

## Controls

| Action | Keyboard | Mouse / touch |
| --- | --- | --- |
| Run | WASD or arrows | Tap empty grass |
| Aim and kick | Space shoots toward goal | Drag backward; release to kick opposite the drag |
| Pass / tackle | X | Tap a teammate or use PASS / TACKLE |
| Switch player | C | SWITCH button |
| Sprint | Hold Shift while moving | — |
| Chip | Hold Shift when shooting | Enable CHIP SHOT |
| Pause | P or Escape | Pause button |

Always attack the right goal. Matches last 90 real seconds; drag aiming slows time. Computer players move, pass, shoot, tackle and keep goal. Throw-ins and goal kicks restart automatically. This is an arcade ruleset: no fouls, cards, offside or corners yet. Quitting a match discards its result.

## Club mode

- Eleven players, ratings, condition, and original pixel portraits.
- 4-3-3, 4-4-2, and 3-5-2 formations affect player positioning.
- Eight fictional clubs, a 14-match double round-robin season, results and standings.
- Transfers replace your lowest-rated player in the purchased position.
- Squad training, stadium income, training-ground recovery, and academy development.
- Local browser saves and JSON import/export through the club office.
- Season prizes and player development before the next season.

Saves belong to the browser and origin used to play. Export a backup before clearing browser data or moving the game.

## Validation

Run `node test.cjs` (Node 18+). The dependency-free test harness exercises the simulation, scoring/misses, pause, a full match, season progression, screens, transfers, and save validation with mocked DOM/canvas APIs. It is not a visual or real-browser playtest.

## Source

`index.html` contains the UI, rendering, simulation, and save logic. `test.cjs` contains simulation checks. All artwork is drawn in code. This project does not contain Retro Goal assets or code and is not affiliated with its creators.
