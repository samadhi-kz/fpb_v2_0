# Flag Play Board v2

A simplified mobile-first version of Flag Play Board for designing, viewing, organizing, and sharing 5 vs 5 flag football plays.

[Sponsor this project](https://github.com/sponsors/samadhi-kz)

## Overview

FPB v2 keeps the playbook workflow from `fpb` but uses a simpler two-screen UI:

- **Home**: play thumbnails and folder/category selection
- **Play**: field view, notes, drawing tools, formations, and export actions

The initial playbook is intentionally empty. Load a JSON playbook when you want to work with existing data. A bundled sample is available at:

```text
```

## Features

- Create and organize playbooks with folders
- Load, add, and save playbook JSON
- View plays as thumbnails on the Home screen
- Open categories by pulling up the bottom handle
- Draw routes, motions, passes, blocks, and text comments
- Move offensive players and defensive markers by dragging
- Select routes and drag route handles
- Edit selected route type, line end, color, and width from a tap popup
- Edit selected player number and shape from a tap popup
- Apply color-grouped offensive and defensive formations
- Flip the play horizontally with one tap
- Long-press **Lock** to switch between edit mode and view mode
- Change player marks, player size, end cap size, line width, and line color
- Share one-play links and full-book links
- Export long book links as text files
- Save diagrams as PNG
- Print one play or the full book as PDF through the browser print dialog

## Usage

1. Open `index.html` in a browser.
2. Start from the empty playbook, or tap **Load** and choose a JSON file.
3. To try the bundled sample, tap **Load** and choose `plays/KS-playcall.json`.
4. Tap a play card to open the Play screen.
5. Use the bottom buttons:
   - **↶ / ↷**: undo and redo edits
   - **Draw**: select, route, motion, block, pass, text, player shapes, and line ends
   - **Form**: offense formations, QB depth, defense formations, and defense visibility
   - **Edit**: duplicate, delete, clear, reset, and folder/play actions
   - **Export**: links, JSON, PNG, and PDF/print
   - **Flip**: mirror the play horizontally
   - **Lock**: long-press to switch view/edit mode
6. Tap a line or player to open the edit popup for that item.
7. Edit notes directly below the field.
8. Save your playbook with **Export > Save JSON**.

## Keyboard Shortcuts

- `Ctrl+Z` / `Cmd+Z`: undo
- `Ctrl+Shift+Z` / `Cmd+Shift+Z`: redo
- `Ctrl+Y` / `Cmd+Y`: redo
- `Delete` / `Backspace`: delete the selected line or text note
- `Esc`: clear the current selection

## Sample Data

The bundled sample file is copied from the original FPB playbook format:

```text
plays/KS-playcall.json
```

It contains 7 folders and 27 plays. Loading it should show the play list thumbnails and allow each play to open in the Play screen.

## File Format

FPB v2 reads the same folder/play JSON structure used by `fpb`, including:

- folders
- plays
- notes
- players
- defenders
- routes
- annotations
- player marks
- player size and end cap size

Saved files remain plain JSON so they can be backed up, edited, shared, or version controlled.

## Supported Environment

- Local desktop use: open `index.html` directly in a modern browser.
- Static hosting: GitHub Pages or any static file host is enough.
- Mobile use: designed for iOS Safari and Android Chrome style viewports.
- Export behavior depends on browser support for downloads, clipboard, and print.

## Testing

Recommended checks:

```sh
node --check js/default-book.js
node --check js/app.js
```

Manual checks:

- Open `index.html` directly with `file://`
- Confirm the initial playbook is empty
- Load `plays/KS-playcall.json`
- Confirm 27 plays appear across 7 folders
- Open a play and verify routes, players, defense, and notes render
- Draw a route, change its end from `T` to `Arrow`, and confirm the old `T` end disappears
- Select a route and confirm `Delete`, undo, and redo work
- Select a player and confirm number/shape changes work
- Long-press **Lock**, confirm editing is blocked, and confirm **Flip** still works
- Draw a route, use Flip, and save JSON
- Reopen the saved JSON and confirm the edits remain

## Privacy

FPB v2 is a static browser app. It has no backend, login, or app-specific remote API. Playbook data stays in the browser unless you export, download, print, or share a link.

Shared links store playbook data in the URL hash. Do not include private or sensitive information in notes if you plan to share links, JSON, images, or PDFs.

## License

This project follows the same MIT license as the original Flag Play Board project.

## Support

Flag Play Board is free to use. If it helps your coaching, team planning, or flag football workflow, please consider sponsoring the project:

[Sponsor this project](https://github.com/sponsors/samadhi-kz)

Sponsorship helps support improvements to play sharing, mobile editing, PDF export, and the overall playbook experience.
