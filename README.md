# Screamer

An original retro-style 2D browser soccer game inspired by classic arcade football. Angled pitch, a smooth following camera, procedural pixel players, blue-and-red club menus, and a playable club season. No external assets, libraries, build step, or network connection required.

## Play

Download `index.html` and open it in a modern desktop or mobile browser. Or serve this directory with any static web server. It can also be hosted with GitHub Pages from the root directory.

## Controls

| Action | Keyboard | Mouse / touch |
| --- | --- | --- |
| Run | WASD or arrows | Tap empty grass to steer; auto run advances your player |
| Aim and kick | Space shoots toward goal | Drag backward; release to kick opposite the drag |
| Pass / tackle | X | Tap a teammate or use PASS / TACKLE |
| Through ball | Z | THROUGH button |
| Switch player | C | SWITCH button |
| Sprint | Hold Shift while moving | Hold SPRINT |
| Chip | Enable CHIP | Enable CHIP |
| Curl | Q / E while dragging a shot | — |
| Pause | P or Escape | Pause button |
| Skip goal replay | R | Tap the pitch |

Choose Casual, Normal or Hard, following or whole-pitch camera, and 90 or 150 seconds before kickoff. Turn auto run and replays on or off there. Settings are saved with your club. CAM switches the camera during play; the fullscreen button expands the match view when the browser supports it.

Always attack the right goal. Aiming slows time and holds the camera still. Players accelerate, turn and decelerate smoothly; sprinting consumes stamina, which recovers when released. The shot guide shows direction, power and curl. Teammates move into space; passes lead their runs, and through balls go farther ahead.

Computer players pass, dribble, tackle and shoot. Goalkeepers react to shots, dive, catch and parry. Fast shots use swept collisions to avoid skipping through players; posts and crossbars produce rebounds. Defender touches over their own goal line award corners. Throw-ins, corners and goal kicks restart automatically. Half time briefly stops play and restores some stamina. Match length measures active time, excluding pauses, restarts and replays.

Goals have skippable replays. Full time shows shots, shots on target, saves, completed passes, possession and scorers. Quitting discards that match's result. This remains an arcade ruleset without fouls, cards or offside.

## Club mode

- Eleven players, ratings, condition, season goals/assists and original pixel portraits. Their skin and hair also appear on the pitch, including transfers.
- 4-3-3, 4-4-2, and 3-5-2 formations affect player positioning.
- Eight fictional clubs, a 14-match double round-robin season, fixture list, results and standings.
- Transfers replace your lowest-rated player in the purchased position. The market refreshes once per matchday.
- Squad training, stadium income, training-ground recovery, and academy development.
- Local browser saves and JSON import/export through the club office.
- Season prizes and player development before the next season.

Saves belong to the browser and origin used to play. Export a backup before clearing browser data or moving the game. Saves from the first release remain compatible; missing new settings use defaults. Imports are validated before replacing the current club.

## Validation

Run `node test.cjs` (Node 18+). The dependency-free harness uses seeded randomness and mocked DOM/canvas APIs to check a complete match and season, screens, transfers, scoring/misses, keeper saves, corners, rebounds, curl, tackling, passing, camera/pointer mapping, pause/replay behavior and legacy saves. It is not a real-browser playtest.

## Source

`index.html` contains the UI, rendering, simulation, and save logic. `test.cjs` contains simulation checks. All artwork is drawn in code. This project does not contain Retro Goal assets or code and is not affiliated with its creators.
