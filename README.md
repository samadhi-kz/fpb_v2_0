# Flag Play Board v2

Flag Play Board v2 is a mobile-first static web app for making, viewing, editing, organizing, and sharing 5 vs 5 flag football playbooks.

[Live Demo](https://samadhi-kz.github.io/fpb_v2_0/) | [Sponsor this project](https://github.com/sponsors/samadhi-kz)

## Overview

v2 keeps the core workflow from the original `fpb` project, but rebuilds the UI around two main screens:

- **Home**: play thumbnails, JSON load, folder filter, tree view, and book export
- **Play**: field view, notes, route drawing, formation tools, edit actions, export, flip, and view lock

The first screen starts as an empty playbook with an empty folder. Load a JSON file when you want to work with existing data.

## Main Features

- Load and save playbook JSON
- Organize plays by folders
- View plays as thumbnail cards with large play numbers
- Switch Home to **Tree** view to drag folders/plays, rename items, delete items, and add plays
- Filter the Home list by folder from the **Folder** button
- Edit categories from tap choices: **New Folder**, **Rename**, and **Delete**
- Draw Route, Motion, Pass, Block, and Text items
- Use **Bend** drawing by default, with optional Straight and Free modes
- Move full routes, route points, inserted bend points, players, defenders, and text
- Select a route or player to edit line type, line end, color, width, player number, and player shape
- Apply offense and defense formations from the **Form** panel
- Show or hide defense markers while keeping their positions saved
- Flip the play horizontally with one tap
- Long-press **Lock** to switch between edit mode and view mode; Flip still works in view mode
- Export one play, the full book link, JSON, PNG, and PDF/print
- Export **PDF Book** with one play plus notes per A4-style page
- Reset the GitHub Pages app to an empty Home screen by tapping the app icon and confirming

## Usage

1. Open `index.html` locally, or open the GitHub Pages demo.
2. Tap **Load** and choose a JSON playbook, or start from the empty playbook.
3. To test with bundled data, load:

   ```text
   plays/KS-playcall.json
   ```

4. Tap a thumbnail to open the Play screen.
5. Use the bottom buttons:

   - **All**: return Home to the full thumbnail list
   - **Load**: load a JSON playbook
   - **Tree**: edit folder/play order and names
   - **Folder**: choose a folder filter and edit categories
   - **Export**: Book Link, Link TXT, Save JSON, and PDF Book
   - **Undo / Redo**: undo and redo edits in the Play screen
   - **Draw**: choose Select, Route, Motion, Block, Pass, Text, line shape, line end, and player shape
   - **Form**: choose offense formation, QB depth, defense formation, and Hide/Show D
   - **Edit**: duplicate, delete, clear lines, reset play, make new play/folder, move play, rename folder
   - **Flip**: mirror the play horizontally
   - **Lock**: long-press to switch view/edit mode

6. Tap a line or player to open the selection popup for detailed editing.
7. Edit notes directly below the field.
8. Save with **Export > Save JSON**.

## Drawing Notes

- **Bend** is the default line mode. Tap points to make a bent route, then tap **Finish** or double-tap the last point.
- **Straight** draws a one-segment line.
- **Free** draws a freehand route.
- In Select mode, drag the route itself to move the whole line.
- Drag blue handles to move route points.
- Drag yellow insert handles to add a bend point.
- `Delete` or `Backspace` removes the selected route or text note.

## Keyboard Shortcuts

- `Ctrl+Z` / `Cmd+Z`: undo
- `Ctrl+Shift+Z` / `Cmd+Shift+Z`: redo
- `Ctrl+Y` / `Cmd+Y`: redo
- `Delete` / `Backspace`: delete selected line or text
- `Esc`: clear selection

## File Format

FPB v2 reads and writes plain JSON playbooks. The format supports:

- folders and play order
- play names and notes
- offensive players and defensive markers
- routes, motions, passes, blocks, and text annotations
- player shapes and player size
- line end size, line width, color, and route mode
- defense visibility and defense formation

The bundled sample is copied from the original FPB style playbook data and contains 7 folders and 27 plays.

## GitHub Pages Cache

GitHub Pages and mobile browsers can keep old CSS, JavaScript, or browser-saved playbook data.

This repo uses version query strings on `styles.css`, `js/default-book.js`, and `js/app.js` so new pushes are easier to verify. If old playbook data still appears, tap the top-left app icon and confirm reset. The reset clears FPB v2 local storage and reloads:

```text
https://samadhi-kz.github.io/fpb_v2_0/
```

You can also add a temporary query string when checking a fresh deploy:

```text
https://samadhi-kz.github.io/fpb_v2_0/?v=manual-check
```

## Supported Environment

- Local desktop use: open `index.html` in a modern browser
- Static hosting: GitHub Pages or any static file host
- Mobile use: designed for iOS Safari and Android Chrome style viewports
- Export behavior depends on browser support for downloads, clipboard, share, and print

## Testing

Recommended syntax checks:

```sh
node --check js/default-book.js
node --check js/app.js
git diff --check
```

Recommended manual checks:

- Confirm the initial app opens as an empty playbook
- Load `plays/KS-playcall.json` and confirm 27 plays appear
- Open Home **Tree** and test drag order, rename, delete, and add
- Open **Folder > Edit Categories** and confirm New/Rename/Delete are tap choices
- Open a play and confirm players, defense, routes, and notes render
- Open **Draw** and confirm Bend is active by default
- Draw Bend, Straight, and Free routes
- Select and move a whole line, then edit its end from `T` to `Arrow`
- Select a player and change number/shape
- Use `Ctrl+Z`, redo, and `Delete`
- Long-press **Lock**, confirm editing is blocked, and confirm **Flip** still works
- Export **PDF Book** and confirm each play plus notes fits one A4-style page
- Save JSON, reload it, and confirm changes remain

## Privacy

FPB v2 is a static browser app. It has no backend, login, or app-specific remote API. Playbook data stays in the browser unless you export, download, print, or share a link.

Shared links store playbook data in the URL hash. Do not include private or sensitive information in notes if you plan to share links, JSON, images, or PDFs.

## License

This project follows the MIT license used by the original Flag Play Board project. See [LICENSE](./LICENSE).

## Support

Flag Play Board is free to use. If it helps your coaching, team planning, or flag football workflow, please consider sponsoring the project:

[Sponsor this project](https://github.com/sponsors/samadhi-kz)

Sponsorship helps support improvements to play sharing, mobile editing, PDF export, and the overall playbook experience.
