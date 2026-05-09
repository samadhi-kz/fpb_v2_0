const SVG_NS = 'http://www.w3.org/2000/svg';
const STORAGE_KEY = 'fpb-v2-playbook-empty-v2';
const DEFAULT_BOOK_URL = 'plays/KS-playcall.json';
const DEFAULT_BOOK_NAME = 'New Playbook';
const SAMPLE_BOOK_NAME = 'KSプレーコール2026春__UCオレ';

const field = {
  left: 250,
  right: 750,
  top: 60,
  bottom: 660,
  scrimmageY: 460,
  yard: 20
};

const PLAYER_SIZE = { min: 12, max: 44, default: 25 };
const END_CAP_SIZE = { min: 0.5, max: 2, default: 0.9 };
const ROUTE_WIDTH = { min: 2, max: 16, default: 6 };
const MARKS = new Set(['circle', 'ring', 'star', 'diamond', 'square']);
const ROUTE_ENDS = new Set(['arrow', 't', 'dot', 'none']);
const DRAW_TOOLS = new Set(['route', 'motion', 'block', 'pass']);

function fieldX(yardsFromLeft) {
  return field.left + (yardsFromLeft / 25) * (field.right - field.left);
}

function fieldY(yardsFromScrimmage) {
  return field.scrimmageY + yardsFromScrimmage * field.yard;
}

const formations = {
  singleBack: { 1: [fieldX(12.5), fieldY(0)], 2: [fieldX(12.5), fieldY(5)], 3: [fieldX(12.5), fieldY(8)], 4: [fieldX(19), fieldY(0)], 5: [fieldX(23), fieldY(0)] },
  spread: { 1: [fieldX(12.5), fieldY(0)], 2: [fieldX(12.5), fieldY(5)], 3: [fieldX(9), fieldY(0)], 4: [fieldX(3), fieldY(0)], 5: [fieldX(22), fieldY(0)] },
  twins: { 1: [fieldX(12.5), fieldY(0)], 2: [fieldX(12.5), fieldY(5)], 3: [fieldX(9.5), fieldY(0)], 4: [fieldX(20), fieldY(0)], 5: [fieldX(23), fieldY(0)] },
  twinsStack: { 1: [fieldX(12.5), fieldY(0)], 2: [fieldX(12.5), fieldY(5)], 3: [fieldX(9.5), fieldY(0)], 4: [fieldX(22), fieldY(0)], 5: [fieldX(22), fieldY(2.5)] },
  trips: { 1: [fieldX(12.5), fieldY(0)], 2: [fieldX(12.5), fieldY(5)], 3: [fieldX(16), fieldY(0)], 4: [fieldX(20), fieldY(0)], 5: [fieldX(24), fieldY(0)] },
  bunch: { 1: [fieldX(12.5), fieldY(0)], 2: [fieldX(12.5), fieldY(5)], 3: [fieldX(20), fieldY(2.5)], 4: [fieldX(18.5), fieldY(0)], 5: [fieldX(21.5), fieldY(0)] },
  tight: { 1: [fieldX(12.5), fieldY(0)], 2: [fieldX(12.5), fieldY(5)], 3: [fieldX(9.5), fieldY(0)], 4: [fieldX(11), fieldY(0)], 5: [fieldX(14), fieldY(0)] },
  doubleBack: { 1: [fieldX(12.5), fieldY(0)], 2: [fieldX(12.5), fieldY(5)], 3: [fieldX(10), fieldY(7)], 4: [fieldX(15), fieldY(7)], 5: [fieldX(3), fieldY(0)] },
  iFormation: { 1: [fieldX(12.5), fieldY(0)], 2: [fieldX(12.5), fieldY(4)], 3: [fieldX(12.5), fieldY(7)], 4: [fieldX(12.5), fieldY(10)], 5: [fieldX(23), fieldY(0)] }
};

const defenseFormations = {
  normal: [[5, -7], [10, -5], [12.5, -10], [15, -5], [20, -7]],
  man0: [[4, -3], [9, -3], [12.5, -6], [16, -3], [21, -3]],
  oneDeep: [[4, -4], [9, -4], [12.5, -10], [16, -4], [21, -4]],
  cover2: [[5, -4], [12.5, -4], [20, -4], [7, -10], [18, -10]],
  cover3: [[8, -4], [17, -4], [4, -12], [12.5, -12], [21, -12]],
  boxZone: [[6, -4], [19, -4], [8, -8], [17, -8], [12.5, -12]],
  goalLine: [[4, -2], [8.5, -2], [12.5, -3], [16.5, -2], [21, -2]],
  prevent: [[3.5, -13], [8, -16], [12.5, -18], [17, -16], [21.5, -13]]
};

const state = {
  book: null,
  activeFolderId: '',
  activePlayId: '',
  folderFilterId: 'all',
  tool: 'select',
  toolPanel: 'draw',
  selected: null,
  dragging: null,
  draftRoute: null,
  homeDrag: null,
  importMode: 'load',
  routeDefaults: {
    end: 'arrow',
    color: '#101010',
    width: ROUTE_WIDTH.default
  },
  history: [],
  redoHistory: [],
  locked: false,
  lockPressTimer: null,
  lockPressFired: false,
  selectionPopoverDismissedKey: ''
};

const els = {
  homeView: document.querySelector('#homeView'),
  editorView: document.querySelector('#editorView'),
  playGrid: document.querySelector('#playGrid'),
  categorySheet: document.querySelector('#categorySheet'),
  categoryList: document.querySelector('#categoryList'),
  categoryHandle: document.querySelector('#categoryHandle'),
  sheetHandle: document.querySelector('#sheetHandle'),
  activeFolderBtn: document.querySelector('#activeFolderBtn'),
  bookTitleBtn: document.querySelector('#bookTitleBtn'),
  fieldSvg: document.querySelector('#fieldSvg'),
  gridLayer: document.querySelector('#gridLayer'),
  routeLayer: document.querySelector('#routeLayer'),
  defenseLayer: document.querySelector('#defenseLayer'),
  playerLayer: document.querySelector('#playerLayer'),
  annotationLayer: document.querySelector('#annotationLayer'),
  handleLayer: document.querySelector('#handleLayer'),
  playNameInput: document.querySelector('#playNameInput'),
  notesInput: document.querySelector('#notesInput'),
  editorTools: document.querySelector('#editorTools'),
  editorHandle: document.querySelector('#editorHandle'),
  selectionPopover: document.querySelector('#selectionPopover'),
  selectionPopoverTitle: document.querySelector('#selectionPopoverTitle'),
  routeInspector: document.querySelector('#routeInspector'),
  playerInspector: document.querySelector('#playerInspector'),
  annotationInspector: document.querySelector('#annotationInspector'),
  homeExportSheet: document.querySelector('#homeExportSheet'),
  jsonInput: document.querySelector('#jsonInput'),
  selectionLabel: document.querySelector('#selectionLabel'),
  defenseToggleBtn: document.querySelector('#defenseToggleBtn'),
  playerSizeRange: document.querySelector('#playerSizeRange'),
  endCapRange: document.querySelector('#endCapRange'),
  lineWidthRange: document.querySelector('#lineWidthRange'),
  lineColorInput: document.querySelector('#lineColorInput'),
  lockBtn: document.querySelector('#lockBtn'),
  lockLabel: document.querySelector('#lockLabel'),
  undoBtn: document.querySelector('#undoBtn'),
  redoBtn: document.querySelector('#redoBtn'),
  drawToolsBtn: document.querySelector('#drawToolsBtn'),
  formationBtn: document.querySelector('#formationBtn'),
  editActionsBtn: document.querySelector('#editActionsBtn'),
  exportActionsBtn: document.querySelector('#exportActionsBtn')
};

function makeId(prefix) {
  if (window.crypto?.randomUUID) return `${prefix}-${window.crypto.randomUUID()}`;
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function defaultDefenders() {
  return defenseFormations.normal.map(([x, y], index) => ({
    id: `d${index + 1}`,
    label: 'X',
    x: fieldX(x),
    y: fieldY(y)
  }));
}

function defaultPlay(name = 'New Offensive Play') {
  return {
    id: makeId('play'),
    name,
    notes: '',
    playerMarks: { p1: 'square', p2: 'circle', p3: 'star', p4: 'circle', p5: 'circle' },
    playerSize: PLAYER_SIZE.default,
    endCapSize: END_CAP_SIZE.default,
    defenseVisible: true,
    defenseFormation: 'normal',
    routeStyle: clone(state.routeDefaults),
    players: Object.entries(formations.spread).map(([label, [x, y]]) => ({
      id: `p${label}`,
      label,
      x,
      y,
      role: label === '1' ? 'center' : label === '2' ? 'qb' : 'skill'
    })),
    defenders: defaultDefenders(),
    routes: [],
    annotations: []
  };
}

function seedBook() {
  return {
    formatVersion: 2,
    name: DEFAULT_BOOK_NAME,
    activeFolderId: 'folder-empty',
    activePlayId: '',
    folders: [
      { id: 'folder-empty', name: 'New Folder', plays: [] }
    ]
  };
}

function samplePlay(name, index) {
  const play = defaultPlay(name);
  play.notes = '①ブロック\n②フェイクラン\n③ラン\n④ブロック\n⑤ブロック';
  const sets = [
    [
      route('p5', 'route', [[fieldX(3), fieldY(0)], [fieldX(3), fieldY(-12)], [fieldX(3.5), fieldY(-15)]], 'arrow'),
      route('p3', 'motion', [[fieldX(22), fieldY(0)], [fieldX(20), fieldY(2)], [fieldX(10), fieldY(2)]], 'none', '#f00'),
      route('p4', 'block', [[fieldX(9), fieldY(0)], [fieldX(7.5), fieldY(-4)]], 't'),
      route('p1', 'block', [[fieldX(12.5), fieldY(0)], [fieldX(12.5), fieldY(-3)]], 't')
    ],
    [
      route('p2', 'route', [[fieldX(12.5), fieldY(5)], [fieldX(10), fieldY(0)], [fieldX(8), fieldY(-5)]], 'arrow'),
      route('p4', 'block', [[fieldX(3), fieldY(0)], [fieldX(7), fieldY(-5)]], 't')
    ],
    [
      route('p3', 'route', [[fieldX(22), fieldY(0)], [fieldX(24), fieldY(-5)], [fieldX(24.5), fieldY(-10)]], 'arrow'),
      route('p2', 'motion', [[fieldX(12.5), fieldY(5)], [fieldX(17), fieldY(5)], [fieldX(22), fieldY(1)]], 'none', '#f00')
    ],
    [
      route('p5', 'route', [[fieldX(22), fieldY(0)], [fieldX(20), fieldY(-7)], [fieldX(17), fieldY(-13)]], 'arrow'),
      route('p4', 'route', [[fieldX(3), fieldY(0)], [fieldX(5), fieldY(-7)], [fieldX(8), fieldY(-13)]], 'arrow'),
      route('p1', 'pass', [[fieldX(12.5), fieldY(0)], [fieldX(17), fieldY(-13)]], 'arrow')
    ],
    [
      route('p3', 'route', [[fieldX(9), fieldY(0)], [fieldX(9), fieldY(-5)], [fieldX(7), fieldY(-5)]], 'arrow'),
      route('p5', 'route', [[fieldX(22), fieldY(0)], [fieldX(22), fieldY(-5)], [fieldX(24), fieldY(-5)]], 'arrow')
    ]
  ];
  play.routes = sets[index] || [];
  return play;
}

function route(playerId, type, points, end = 'arrow', color = '#101010') {
  return {
    id: makeId('route'),
    playerId,
    type,
    mode: 'straight',
    points,
    end,
    color,
    width: ROUTE_WIDTH.default,
    opacity: 1
  };
}

async function boot() {
  bindEvents();
  drawGrid();

  const shared = sharedBookFromHash();
  if (shared) {
    state.book = normalizeBook(shared.book);
    if (shared.playId) state.activePlayId = shared.playId;
  } else if (new URLSearchParams(location.search).get('load') === 'sample') {
    state.book = await loadSampleBook();
  } else {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        state.book = normalizeBook(JSON.parse(saved));
      } catch {
        state.book = seedBook();
      }
    } else {
      state.book = seedBook();
    }
  }

  initializeActiveIds();
  renderAll();

  if (shared?.kind === 'play' && state.activePlayId) openPlay(state.activePlayId);
  if (location.hash === '#editor' && state.activePlayId) openPlay(state.activePlayId);
  if (location.hash === '#categories') openCategorySheet();
  if (location.hash === '#export') openHomeExportSheet();
}

async function loadDefaultBook() {
  return seedBook();
}

async function loadSampleBook() {
  if (window.FPB_DEFAULT_BOOK) {
    const book = normalizeBook(clone(window.FPB_DEFAULT_BOOK));
    book.name = window.FPB_DEFAULT_BOOK.name || SAMPLE_BOOK_NAME;
    return book;
  }
  try {
    const response = await fetch(DEFAULT_BOOK_URL, { cache: 'no-store' });
    if (response.ok) {
      const source = await response.json();
      const book = normalizeBook(source);
      book.name = source.name || SAMPLE_BOOK_NAME;
      return book;
    }
  } catch {
    // Opening index.html directly cannot fetch a sibling JSON file in some browsers.
  }
  return seedBook();
}

function initializeActiveIds() {
  const first = allPlays()[0];
  state.activeFolderId = state.book.activeFolderId || first?.folder.id || state.book.folders[0]?.id || '';
  state.activePlayId = state.activePlayId || state.book.activePlayId || first?.play.id || '';
  state.folderFilterId = state.folderFilterId || 'all';
  persist();
}

function normalizeBook(source) {
  const folders = Array.isArray(source?.folders) ? source.folders : [];
  const book = {
    formatVersion: 2,
    name: source?.name || DEFAULT_BOOK_NAME,
    activeFolderId: source?.activeFolderId || '',
    activePlayId: source?.activePlayId || '',
    playOrder: Array.isArray(source?.playOrder) ? source.playOrder : [],
    folders: folders.map((folder) => ({
      id: folder.id || makeId('folder'),
      name: folder.name || 'Folder',
      plays: Array.isArray(folder.plays) ? folder.plays.map(normalizePlay) : []
    }))
  };
  return book.folders.length ? book : seedBook();
}

function normalizePlay(play) {
  const fallback = defaultPlay(play?.name || 'Untitled');
  const players = Array.isArray(play?.players) && play.players.length
    ? play.players.map((player, index) => normalizePlayer(player, fallback.players[index], index))
    : fallback.players;
  const defenders = Array.isArray(play?.defenders) && play.defenders.length
    ? play.defenders.map((defender, index) => normalizeDefender(defender, index))
    : fallback.defenders;

  return {
    id: play?.id || makeId('play'),
    name: play?.name || fallback.name,
    notes: play?.notes || '',
    playerMarks: normalizePlayerMarks(play?.playerMarks, players),
    playerSize: normalizeNumber(play?.playerSize, PLAYER_SIZE.default, PLAYER_SIZE.min, PLAYER_SIZE.max),
    endCapSize: normalizeNumber(play?.endCapSize, END_CAP_SIZE.default, END_CAP_SIZE.min, END_CAP_SIZE.max),
    defenseVisible: play?.defenseVisible === false ? false : true,
    defenseFormation: play?.defenseFormation || 'normal',
    routeStyle: normalizeRouteStyle(play?.routeStyle),
    sourceImage: play?.sourceImage || '',
    routeMode: play?.routeMode || 'straight',
    updatedAt: play?.updatedAt || '',
    players,
    defenders,
    routes: Array.isArray(play?.routes) ? play.routes.map(normalizeRoute).filter((item) => item.points.length >= 2) : [],
    annotations: Array.isArray(play?.annotations) ? play.annotations.map(normalizeAnnotation) : []
  };
}

function normalizePlayer(player, fallback, index) {
  const label = String(player?.label || fallback?.label || index + 1);
  return {
    id: player?.id || `p${label}`,
    label,
    x: normalizeNumber(player?.x, fallback?.x || fieldX(12.5), 0, 1000),
    y: normalizeNumber(player?.y, fallback?.y || fieldY(0), 0, 760),
    role: player?.role || (label === '1' ? 'center' : label === '2' ? 'qb' : 'skill')
  };
}

function normalizeDefender(defender, index) {
  const fallback = defaultDefenders()[index] || { x: fieldX(12.5), y: fieldY(-6) };
  return {
    id: defender?.id || `d${index + 1}`,
    label: defender?.label || 'X',
    x: normalizeNumber(defender?.x, fallback.x, 0, 1000),
    y: normalizeNumber(defender?.y, fallback.y, 0, 760)
  };
}

function normalizeRoute(item) {
  return {
    id: item?.id || makeId('route'),
    playerId: item?.playerId || '',
    type: ['route', 'motion', 'block', 'pass'].includes(item?.type) ? item.type : 'route',
    mode: item?.mode || 'straight',
    points: Array.isArray(item?.points)
      ? item.points.map((point) => [normalizeNumber(point?.[0], fieldX(12.5), 0, 1000), normalizeNumber(point?.[1], fieldY(0), 0, 760)])
      : [],
    end: ROUTE_ENDS.has(item?.end) ? item.end : 'arrow',
    color: isCssColor(item?.color) ? item.color : '#101010',
    width: normalizeNumber(item?.width, ROUTE_WIDTH.default, ROUTE_WIDTH.min, ROUTE_WIDTH.max),
    opacity: normalizeNumber(item?.opacity, 1, 0.2, 1)
  };
}

function normalizeAnnotation(item) {
  return {
    id: item?.id || makeId('note'),
    text: item?.text || '',
    x: normalizeNumber(item?.x, fieldX(12.5), 0, 1000),
    y: normalizeNumber(item?.y, fieldY(-4), 0, 760)
  };
}

function normalizePlayerMarks(marks, players) {
  const normalized = {};
  players.forEach((player) => {
    const value = marks?.[player.id] || marks?.[`p${player.label}`] || 'circle';
    normalized[player.id] = MARKS.has(value) ? value : 'circle';
  });
  return normalized;
}

function normalizeRouteStyle(style) {
  return {
    end: ROUTE_ENDS.has(style?.end) ? style.end : 'arrow',
    color: isCssColor(style?.color) ? style.color : '#101010',
    width: normalizeNumber(style?.width, ROUTE_WIDTH.default, ROUTE_WIDTH.min, ROUTE_WIDTH.max)
  };
}

function normalizeNumber(value, fallback, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return clamp(number, min, max);
}

function isCssColor(value) {
  return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);
}

function allPlays() {
  const items = state.book?.folders.flatMap((folder) => folder.plays.map((play) => ({ folder, play }))) || [];
  const order = state.book?.playOrder || [];
  if (!order.length) return items;
  const rank = new Map(order.map((id, index) => [id, index]));
  return [...items].sort((a, b) => {
    const ai = rank.has(a.play.id) ? rank.get(a.play.id) : Number.MAX_SAFE_INTEGER;
    const bi = rank.has(b.play.id) ? rank.get(b.play.id) : Number.MAX_SAFE_INTEGER;
    return ai - bi;
  });
}

function activePlay() {
  return allPlays().find((item) => item.play.id === state.activePlayId)?.play || allPlays()[0]?.play || null;
}

function activeFolder() {
  if (!state.book) return { id: 'all', name: 'All Offensive Plays', plays: [] };
  if (state.folderFilterId === 'all') return { id: 'all', name: 'All Offensive Plays', plays: allPlays().map((item) => item.play) };
  return state.book.folders.find((folder) => folder.id === state.folderFilterId) || state.book.folders[0];
}

function folderForPlay(playId) {
  return allPlays().find((item) => item.play.id === playId)?.folder || state.book.folders[0];
}

function persist() {
  if (!state.book) return;
  state.book.activeFolderId = state.activeFolderId;
  state.book.activePlayId = state.activePlayId;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.book));
}

function renderAll() {
  renderHome();
  renderEditor();
  syncControls();
}

function renderHome() {
  if (!state.book) return;
  els.bookTitleBtn.textContent = state.book.name;
  const folder = activeFolder();
  els.activeFolderBtn.textContent = folder.name;
  els.playGrid.innerHTML = '';

  const newCard = document.createElement('button');
  newCard.className = 'new-card';
  newCard.type = 'button';
  newCard.innerHTML = '<span><span class="plus">+</span><span class="new-title">New Offensive Play</span></span>';
  newCard.addEventListener('click', createPlay);
  els.playGrid.append(newCard);

  folder.plays.forEach((play, index) => {
    const card = document.createElement('button');
    card.className = 'play-card';
    card.type = 'button';
    card.dataset.playId = play.id;
    card.append(renderThumb(play, index + 1));
    const title = document.createElement('div');
    title.className = 'card-title';
    title.textContent = play.name;
    card.append(title);
    card.addEventListener('click', (event) => {
      if (state.homeDrag?.suppressClick) {
        event.preventDefault();
        state.homeDrag.suppressClick = false;
        return;
      }
      openPlay(play.id);
    });
    card.addEventListener('pointerdown', (event) => startHomeCardPress(event, play.id));
    els.playGrid.append(card);
  });

  renderCategories();
}

function renderCategories() {
  const total = allPlays().length;
  const items = [
    { id: 'all', name: 'All Offensive Plays', count: total },
    ...state.book.folders.map((folder) => ({
      id: folder.id,
      name: folder.name,
      count: folder.plays.length
    }))
  ];

  els.categoryList.innerHTML = '';
  items.forEach((item) => {
    const button = document.createElement('button');
    button.className = `category-item${item.id === state.folderFilterId ? ' is-active' : ''}`;
    button.type = 'button';
    button.innerHTML = `<span>${escapeHtml(item.name)}</span><span>${item.count}</span>`;
    button.addEventListener('click', () => {
      state.folderFilterId = item.id;
      if (item.id !== 'all') state.activeFolderId = item.id;
      closeCategorySheet();
      renderHome();
      persist();
    });
    els.categoryList.append(button);
  });
}

function startHomeCardPress(event, playId) {
  if (event.button !== undefined && event.button !== 0) return;
  const card = event.currentTarget;
  const startX = event.clientX;
  const startY = event.clientY;
  const timer = window.setTimeout(() => {
    state.homeDrag.started = true;
    state.homeDrag.suppressClick = true;
    card.classList.add('is-dragging');
  }, 320);
  state.homeDrag = {
    playId,
    card,
    pointerId: event.pointerId,
    startX,
    startY,
    timer,
    started: false,
    suppressClick: false
  };
  card.setPointerCapture?.(event.pointerId);
  card.addEventListener('pointermove', handleHomeCardMove);
  card.addEventListener('pointerup', finishHomeCardDrag);
  card.addEventListener('pointercancel', cancelHomeCardDrag);
}

function handleHomeCardMove(event) {
  const drag = state.homeDrag;
  if (!drag) return;
  const moved = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY);
  if (!drag.started && moved > 10) {
    clearTimeout(drag.timer);
    cancelHomeCardDrag(event);
    return;
  }
  if (!drag.started) return;
  event.preventDefault();
  const target = document.elementFromPoint(event.clientX, event.clientY)?.closest?.('.play-card[data-play-id]');
  if (!target || target === drag.card || !els.playGrid.contains(target)) return;
  const cards = [...els.playGrid.querySelectorAll('.play-card')];
  const from = cards.indexOf(drag.card);
  const to = cards.indexOf(target);
  if (from < to) els.playGrid.insertBefore(drag.card, target.nextSibling);
  else els.playGrid.insertBefore(drag.card, target);
}

function finishHomeCardDrag(event) {
  const drag = state.homeDrag;
  if (!drag) return;
  clearTimeout(drag.timer);
  cleanupHomeDragListeners(drag.card, event?.pointerId);
  if (drag.started) {
    pushHistory();
    const order = [...els.playGrid.querySelectorAll('.play-card[data-play-id]')].map((card) => card.dataset.playId);
    applyHomeOrder(order);
    persist();
    renderHome();
  }
  state.homeDrag = { suppressClick: drag.suppressClick };
}

function cancelHomeCardDrag(event) {
  const drag = state.homeDrag;
  if (!drag) return;
  clearTimeout(drag.timer);
  cleanupHomeDragListeners(drag.card, event?.pointerId);
  drag.card.classList.remove('is-dragging');
  state.homeDrag = null;
}

function cleanupHomeDragListeners(card, pointerId) {
  card.releasePointerCapture?.(pointerId);
  card.removeEventListener('pointermove', handleHomeCardMove);
  card.removeEventListener('pointerup', finishHomeCardDrag);
  card.removeEventListener('pointercancel', cancelHomeCardDrag);
}

function applyHomeOrder(order) {
  if (state.folderFilterId === 'all') {
    state.book.playOrder = order;
    return;
  }
  const folder = state.book.folders.find((item) => item.id === state.folderFilterId);
  if (!folder) return;
  const byId = new Map(folder.plays.map((play) => [play.id, play]));
  folder.plays = order.map((id) => byId.get(id)).filter(Boolean);
  const fullOrder = state.book.playOrder?.length ? state.book.playOrder : allPlays().map(({ play }) => play.id);
  const orderedSet = new Set(order);
  const inserted = [];
  state.book.playOrder = fullOrder.flatMap((id) => {
    if (!orderedSet.has(id)) return [id];
    if (inserted.length) return [];
    inserted.push(...order);
    return order;
  });
}

function renderThumb(play, number) {
  const svg = svgEl('svg', { class: 'thumb', viewBox: '190 42 620 638' });
  svg.append(...fieldGridNodes(true));
  const badge = svgEl('rect', { x: 198, y: 50, width: 76, height: 62, fill: '#eeeeee', opacity: '0.92' });
  const num = svgEl('text', { x: 236, y: 96, 'text-anchor': 'middle', fill: '#4f565b', 'font-size': 52, 'font-weight': 900 });
  num.textContent = number;
  svg.append(badge, num);
  play.routes.forEach((item) => svg.append(routeNode(item, play, 0.72, false)));
  if (play.defenseVisible !== false) play.defenders.forEach((item) => svg.append(defenderNode(item, play, 0.75, false)));
  play.players.forEach((item) => svg.append(playerNode(item, play, 0.9, false)));
  return svg;
}

function renderEditor() {
  const play = activePlay();
  if (!play) {
    syncLockUI();
    if (els.selectionPopover) els.selectionPopover.hidden = true;
    return;
  }
  els.playNameInput.value = play.name;
  els.notesInput.value = play.notes || '';
  drawRoutes(play);
  drawDefense(play);
  drawPlayers(play);
  drawAnnotations(play);
  drawSelectionHandles(play);
  syncControls();
  syncLockUI();
  syncSelectionPopover(play);
}

function drawGrid() {
  els.gridLayer.innerHTML = '';
  els.gridLayer.append(...fieldGridNodes(false));
  [
    ['Front 20yd', -20],
    ['Front 15yd', -15],
    ['Front 10yd', -10],
    ['Front 5yd', -5],
    ['Scrimmage', 0],
    ['Back 5yd', 5],
    ['Back 10yd', 10]
  ].forEach(([text, yards]) => {
    const y = fieldY(yards);
    const label = svgEl('text', {
      x: field.left - 20,
      y: yards === 0 ? y - 14 : y - 8,
      fill: '#7b8794',
      'font-size': 18,
      'font-weight': 700,
      'text-anchor': 'end'
    });
    label.textContent = text;
    els.gridLayer.append(label);
  });
  [
    ['Left', 0],
    ['Out 5', 5],
    ['In 2.5', 10],
    ['In 2.5', 15],
    ['Out 5', 20],
    ['Right', 25]
  ].forEach(([text, yards]) => {
    const isLeft = yards === 0;
    const isRight = yards === 25;
    const label = svgEl('text', {
      x: fieldX(yards) + (isLeft ? -10 : isRight ? 10 : 4),
      y: isLeft || isRight ? field.top + 22 : field.top - 10,
      fill: '#7b8794',
      'font-size': 16,
      'font-weight': 700,
      'text-anchor': isLeft ? 'end' : 'start'
    });
    label.textContent = text;
    els.gridLayer.append(label);
  });
}

function fieldGridNodes(small) {
  const nodes = [];
  const stroke = small ? '#d6d6d6' : '#d9d9d9';
  const sw = small ? 5 : 3;
  for (let x = field.left; x <= field.right; x += field.yard * 5) {
    nodes.push(svgEl('line', { x1: x, y1: field.top, x2: x, y2: field.bottom, stroke, 'stroke-width': sw }));
  }
  for (let y = field.top; y <= field.bottom; y += field.yard * 5) {
    nodes.push(svgEl('line', { x1: field.left, y1: y, x2: field.right, y2: y, stroke, 'stroke-width': sw }));
  }
  nodes.push(svgEl('line', { x1: field.left, y1: field.scrimmageY, x2: field.right, y2: field.scrimmageY, stroke: '#aeb6bd', 'stroke-width': small ? 12 : 10 }));
  nodes.push(svgEl('rect', { x: field.left, y: field.top, width: field.right - field.left, height: field.bottom - field.top, fill: 'none', stroke, 'stroke-width': sw }));
  return nodes;
}

function drawRoutes(play) {
  els.routeLayer.innerHTML = '';
  play.routes.forEach((item) => els.routeLayer.append(routeNode(item, play, 1, true)));
}

function routeNode(item, play, scale = 1, interactive = true) {
  const points = item.points || [];
  const g = svgEl('g', { class: selectedClass('route', item.id) });
  if (points.length < 2) return g;

  const displayPoints = item.type === 'motion' ? motionPoints(points) : points;
  const visible = svgEl('polyline', {
    class: 'route-visible',
    points: displayPoints.map((point) => point.join(',')).join(' '),
    fill: 'none',
    stroke: item.color || '#101010',
    'stroke-width': (item.width || ROUTE_WIDTH.default) * scale,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    opacity: item.opacity ?? 1
  });
  if (item.type === 'pass') visible.setAttribute('stroke-dasharray', `${16 * scale} ${14 * scale}`);
  g.append(visible);

  if (item.end === 'arrow') g.append(arrowEndNode(points, item, play, scale));
  if (item.end === 't') g.append(tEndNode(points, item, play, scale));
  if (item.end === 'dot') g.append(dotEndNode(points, item, play, scale));

  if (interactive) {
    const hit = svgEl('polyline', {
      class: 'route-hit',
      points: displayPoints.map((point) => point.join(',')).join(' '),
      fill: 'none',
      stroke: 'transparent',
      'stroke-width': Math.max(24, (item.width || ROUTE_WIDTH.default) + 18),
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      'data-type': 'route',
      'data-id': item.id
    });
    g.append(hit);
  }
  return g;
}

function arrowEndNode(points, item, play, scale) {
  const [prev, end] = lastSegment(points);
  const angle = Math.atan2(end[1] - prev[1], end[0] - prev[0]);
  const capScale = normalizeNumber(play.endCapSize, END_CAP_SIZE.default, END_CAP_SIZE.min, END_CAP_SIZE.max) * 2 * scale;
  const length = 20 * capScale;
  const spread = 10 * capScale;
  const x1 = end[0] - Math.cos(angle) * length + Math.cos(angle + Math.PI / 2) * spread;
  const y1 = end[1] - Math.sin(angle) * length + Math.sin(angle + Math.PI / 2) * spread;
  const x2 = end[0] - Math.cos(angle) * length - Math.cos(angle + Math.PI / 2) * spread;
  const y2 = end[1] - Math.sin(angle) * length - Math.sin(angle + Math.PI / 2) * spread;
  return svgEl('path', {
    class: 'end-arrow',
    d: `M ${x1} ${y1} L ${end[0]} ${end[1]} L ${x2} ${y2}`,
    fill: 'none',
    stroke: item.color || '#101010',
    'stroke-width': (item.width || ROUTE_WIDTH.default) * scale,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    opacity: item.opacity ?? 1
  });
}

function tEndNode(points, item, play, scale) {
  const [a, b] = lastSegment(points);
  const angle = Math.atan2(b[1] - a[1], b[0] - a[0]) + Math.PI / 2;
  const length = 34 * normalizeNumber(play.endCapSize, END_CAP_SIZE.default, END_CAP_SIZE.min, END_CAP_SIZE.max) * scale;
  return svgEl('line', {
    x1: b[0] + Math.cos(angle) * length,
    y1: b[1] + Math.sin(angle) * length,
    x2: b[0] - Math.cos(angle) * length,
    y2: b[1] - Math.sin(angle) * length,
    stroke: item.color || '#101010',
    'stroke-width': (item.width || ROUTE_WIDTH.default) * scale,
    'stroke-linecap': 'round',
    opacity: item.opacity ?? 1
  });
}

function dotEndNode(points, item, play, scale) {
  const end = points[points.length - 1];
  return svgEl('circle', {
    cx: end[0],
    cy: end[1],
    r: 8 * normalizeNumber(play.endCapSize, END_CAP_SIZE.default, END_CAP_SIZE.min, END_CAP_SIZE.max) * scale,
    fill: item.color || '#101010',
    opacity: item.opacity ?? 1
  });
}

function lastSegment(points) {
  return [points[points.length - 2], points[points.length - 1]];
}

function motionPoints(points) {
  const result = [];
  points.forEach((point, index) => {
    if (index === 0) {
      result.push(point);
      return;
    }
    const start = points[index - 1];
    const end = point;
    const dx = end[0] - start[0];
    const dy = end[1] - start[1];
    const length = Math.hypot(dx, dy);
    if (!length) return;
    const nx = -dy / length;
    const ny = dx / length;
    const steps = Math.max(2, Math.floor(length / 18));
    for (let step = 1; step <= steps; step += 1) {
      const t = step / steps;
      const offset = step === steps ? 0 : (step % 2 === 0 ? 8 : -8);
      result.push([start[0] + dx * t + nx * offset, start[1] + dy * t + ny * offset]);
    }
  });
  return result;
}

function drawDefense(play) {
  els.defenseLayer.innerHTML = '';
  if (play.defenseVisible === false) return;
  play.defenders.forEach((item) => els.defenseLayer.append(defenderNode(item, play, 1, true)));
}

function defenderNode(item, play, scale = 1, interactive = true) {
  const g = svgEl('g', { class: `defender-node ${selectedClass('defender', item.id)}` });
  if (interactive) {
    g.dataset.type = 'defender';
    g.dataset.id = item.id;
  }
  const r = 35 * scale;
  g.append(svgEl('circle', { cx: item.x, cy: item.y, r, fill: '#d9d9d9' }));
  const t = svgEl('text', { x: item.x, y: item.y + 13 * scale, 'text-anchor': 'middle', fill: '#50555a', 'font-size': 46 * scale, 'font-weight': 800 });
  t.textContent = item.label || 'X';
  g.append(t);
  if (state.selected?.type === 'defender' && state.selected.id === item.id && interactive) {
    g.append(svgEl('circle', { cx: item.x, cy: item.y, r: r + 6, fill: 'none', stroke: '#1da1f2', 'stroke-width': 5 }));
  }
  return g;
}

function drawPlayers(play) {
  els.playerLayer.innerHTML = '';
  play.players.forEach((item) => els.playerLayer.append(playerNode(item, play, 1, true)));
}

function playerNode(item, play, scale = 1, interactive = true) {
  const g = svgEl('g', { class: `player-node ${selectedClass('player', item.id)}` });
  if (interactive) {
    g.dataset.type = 'player';
    g.dataset.id = item.id;
  }
  const r = normalizeNumber(play.playerSize, PLAYER_SIZE.default, PLAYER_SIZE.min, PLAYER_SIZE.max) * 1.32 * scale;
  const mark = play.playerMarks?.[item.id] || 'circle';
  if (mark === 'star') {
    g.append(svgEl('path', { d: starPath(item.x, item.y, r * 1.35, r * 0.62), fill: '#ef1432' }));
  } else if (mark === 'diamond') {
    g.append(svgEl('rect', { x: item.x - r * 0.85, y: item.y - r * 0.85, width: r * 1.7, height: r * 1.7, fill: '#f2c230', transform: `rotate(45 ${item.x} ${item.y})` }));
  } else if (mark === 'square') {
    g.append(svgEl('rect', { x: item.x - r, y: item.y - r, width: r * 2, height: r * 2, fill: '#008577' }));
  } else {
    g.append(svgEl('circle', { cx: item.x, cy: item.y, r, fill: '#1187f2' }));
  }
  const t = svgEl('text', { x: item.x, y: item.y + 13 * scale, 'text-anchor': 'middle', fill: '#fff', 'font-size': 42 * scale, 'font-weight': 900 });
  t.textContent = item.label;
  g.append(t);
  if (state.selected?.type === 'player' && state.selected.id === item.id && interactive) {
    g.append(svgEl('circle', { cx: item.x, cy: item.y, r: r + 7, fill: 'none', stroke: '#1da1f2', 'stroke-width': 5 }));
  }
  return g;
}

function drawAnnotations(play) {
  els.annotationLayer.innerHTML = '';
  play.annotations.forEach((item) => {
    const g = svgEl('g', { class: `annotation-node ${selectedClass('annotation', item.id)}`, 'data-type': 'annotation', 'data-id': item.id });
    const text = svgEl('text', { x: item.x, y: item.y, fill: '#101010', 'font-size': 26, 'font-weight': 800 });
    splitLines(item.text).forEach((line, index) => {
      const tspan = svgEl('tspan', { x: item.x, dy: index === 0 ? 0 : 30 });
      tspan.textContent = line;
      text.append(tspan);
    });
    g.append(text);
    if (state.selected?.type === 'annotation' && state.selected.id === item.id) {
      g.append(svgEl('circle', { cx: item.x, cy: item.y - 8, r: 12, fill: '#1da1f2' }));
    }
    els.annotationLayer.append(g);
  });
}

function drawSelectionHandles(play) {
  els.handleLayer.innerHTML = '';
  if (isEditorLocked()) return;
  if (state.selected?.type !== 'route') return;
  const item = play.routes.find((routeItem) => routeItem.id === state.selected.id);
  if (!item) return;
  item.points.forEach((point, index) => {
    els.handleLayer.append(svgEl('circle', {
      class: 'route-handle',
      cx: point[0],
      cy: point[1],
      r: 13,
      fill: index === item.points.length - 1 ? '#1da1f2' : '#fff',
      stroke: '#1da1f2',
      'stroke-width': 5,
      'data-type': 'route-point',
      'data-id': item.id,
      'data-index': index
    }));
  });
}

function selectedClass(type, id) {
  return state.selected?.type === type && state.selected.id === id ? 'is-selected' : '';
}

function starPath(cx, cy, outer, inner) {
  const points = [];
  for (let i = 0; i < 10; i += 1) {
    const angle = -Math.PI / 2 + i * Math.PI / 5;
    const radius = i % 2 === 0 ? outer : inner;
    points.push([cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius]);
  }
  return `M ${points.map((point) => point.join(' ')).join(' L ')} Z`;
}

function bindEvents() {
  els.categoryHandle.addEventListener('click', openCategorySheet);
  els.sheetHandle.addEventListener('click', closeCategorySheet);
  els.activeFolderBtn.addEventListener('click', openCategorySheet);
  els.bookTitleBtn.addEventListener('click', renameBook);
  document.querySelector('#editCategoriesBtn').addEventListener('click', editCategories);
  document.querySelector('#allGridBtn').addEventListener('click', () => {
    state.folderFilterId = 'all';
    renderHome();
    persist();
  });
  document.querySelector('#backToBookBtn').addEventListener('click', showHome);
  document.querySelector('#exportBtn').addEventListener('click', openHomeExportSheet);
  document.querySelector('#closeHomeExportSheet').addEventListener('click', closeHomeExportSheet);
  document.querySelector('#duplicateBtn').addEventListener('click', duplicatePlay);
  document.querySelector('#deleteBtn').addEventListener('click', deleteSelectedOrPlay);
  els.undoBtn.addEventListener('click', undo);
  els.redoBtn.addEventListener('click', redo);
  els.drawToolsBtn.addEventListener('click', () => openToolPanel('draw'));
  els.formationBtn.addEventListener('click', () => openToolPanel('formation'));
  els.editActionsBtn.addEventListener('click', () => openToolPanel('edit'));
  els.exportActionsBtn.addEventListener('click', () => openToolPanel('export'));
  document.querySelector('#flipQuickBtn').addEventListener('click', flipPlay);
  els.lockBtn.addEventListener('pointerdown', startLockPress);
  els.lockBtn.addEventListener('pointerup', finishLockPress);
  els.lockBtn.addEventListener('pointerleave', finishLockPress);
  els.lockBtn.addEventListener('pointercancel', finishLockPress);
  els.lockBtn.addEventListener('click', handleLockClick);
  document.querySelector('#newPlayBtn').addEventListener('click', createPlay);
  document.querySelector('#newFolderBtn').addEventListener('click', createFolder);
  document.querySelector('#movePlayBtn').addEventListener('click', moveActivePlay);
  document.querySelector('#renameFolderBtn').addEventListener('click', renameActiveFolder);
  document.querySelector('#loadJsonBtn').addEventListener('click', () => openJsonInput('load'));
  document.querySelector('#openJsonHomeBtn').addEventListener('click', () => openJsonInput('load'));
  document.querySelector('#addJsonBtn').addEventListener('click', () => openJsonInput('add'));
  document.querySelector('#saveJsonBtn').addEventListener('click', exportJson);
  document.querySelector('#sharePlayBtn').addEventListener('click', sharePlayLink);
  document.querySelector('#shareBookBtn').addEventListener('click', shareBookLink);
  document.querySelector('#printPlayBtn').addEventListener('click', () => window.print());
  document.querySelector('#printBookBtn').addEventListener('click', printBook);
  document.querySelector('#savePhotoBtn').addEventListener('click', savePhoto);
  document.querySelector('#clearLinesBtn').addEventListener('click', clearLines);
  document.querySelector('#resetPlayBtn').addEventListener('click', resetPlayDiagram);
  document.querySelector('#defenseToggleBtn').addEventListener('click', toggleDefense);
  document.querySelector('#closeSelectionPopover').addEventListener('click', closeSelectionPopover);
  document.querySelector('#editNoteBtn').addEventListener('click', editSelectedText);
  document.querySelectorAll('[data-selection-delete]').forEach((button) => button.addEventListener('click', deleteSelectedOnly));
  els.jsonInput.addEventListener('change', importJson);
  els.editorHandle.addEventListener('click', toggleToolSheet);
  els.playNameInput.addEventListener('input', updatePlayName);
  els.notesInput.addEventListener('input', updatePlayNotes);
  els.playerSizeRange.addEventListener('input', updatePlayerSize);
  els.endCapRange.addEventListener('input', updateEndCapSize);
  els.lineWidthRange.addEventListener('input', updateLineWidth);
  els.lineColorInput.addEventListener('input', updateLineColor);
  document.querySelectorAll('[data-tool]').forEach((button) => {
    button.addEventListener('click', () => setTool(button.dataset.tool));
  });
  document.querySelectorAll('[data-formation]').forEach((button) => {
    button.addEventListener('click', () => applyFormation(button.dataset.formation));
  });
  document.querySelectorAll('[data-defense-formation]').forEach((button) => {
    button.addEventListener('click', () => applyDefenseFormation(button.dataset.defenseFormation));
  });
  document.querySelectorAll('[data-action="qb-setback"]').forEach((button) => button.addEventListener('click', () => setQbDepth(2.5)));
  document.querySelectorAll('[data-action="qb-shotgun"]').forEach((button) => button.addEventListener('click', () => setQbDepth(5)));
  document.querySelectorAll('[data-mark]').forEach((button) => button.addEventListener('click', () => setSelectedMark(button.dataset.mark)));
  document.querySelectorAll('[data-end]').forEach((button) => button.addEventListener('click', () => setSelectedEnd(button.dataset.end)));
  document.querySelectorAll('[data-route-type]').forEach((button) => button.addEventListener('click', () => setSelectedRouteType(button.dataset.routeType)));
  document.querySelectorAll('[data-route-width]').forEach((button) => button.addEventListener('click', () => setSelectedRouteWidth(button.dataset.routeWidth)));
  document.querySelectorAll('[data-route-color]').forEach((button) => button.addEventListener('click', () => setSelectedRouteColor(button.dataset.routeColor)));
  document.querySelectorAll('[data-player-label]').forEach((button) => button.addEventListener('click', () => setSelectedPlayerLabel(button.dataset.playerLabel)));
  document.querySelectorAll('[data-home-export]').forEach((button) => {
    button.addEventListener('click', () => handleHomeExport(button.dataset.homeExport));
  });
  document.addEventListener('keydown', handleKeyDown);
  els.fieldSvg.addEventListener('pointerdown', pointerDown);
  els.fieldSvg.addEventListener('pointermove', pointerMove);
  els.fieldSvg.addEventListener('pointerup', pointerUp);
  els.fieldSvg.addEventListener('pointercancel', pointerUp);
  els.fieldSvg.addEventListener('dblclick', editSelectedText);
}

function openCategorySheet() {
  els.categorySheet.classList.add('is-open');
  els.categoryHandle.setAttribute('aria-expanded', 'true');
}

function closeCategorySheet() {
  els.categorySheet.classList.remove('is-open');
  els.categoryHandle.setAttribute('aria-expanded', 'false');
}

function toggleToolSheet() {
  if (isEditorLocked()) return;
  els.editorTools.classList.toggle('is-open');
  els.editorHandle.setAttribute('aria-expanded', String(els.editorTools.classList.contains('is-open')));
}

function openToolPanel(panel) {
  if (isEditorLocked()) return;
  const wasOpen = els.editorTools.classList.contains('is-open');
  const samePanel = state.toolPanel === panel;
  state.toolPanel = panel;
  document.querySelectorAll('[data-tool-panel]').forEach((section) => {
    section.hidden = section.dataset.toolPanel !== panel;
  });
  document.querySelectorAll('.editor-bottom button').forEach((button) => {
    const map = {
      drawToolsBtn: 'draw',
      formationBtn: 'formation',
      editActionsBtn: 'edit',
      exportActionsBtn: 'export'
    };
    button.classList.toggle('is-active', map[button.id] === panel && (!wasOpen || !samePanel));
  });
  els.editorTools.classList.toggle('is-open', !wasOpen || !samePanel);
  els.editorHandle.setAttribute('aria-expanded', String(els.editorTools.classList.contains('is-open')));
}

function startLockPress() {
  state.lockPressFired = false;
  clearTimeout(state.lockPressTimer);
  state.lockPressTimer = window.setTimeout(() => {
    state.lockPressFired = true;
    toggleLockMode();
  }, 620);
}

function finishLockPress() {
  clearTimeout(state.lockPressTimer);
  state.lockPressTimer = null;
}

function handleLockClick(event) {
  if (state.lockPressFired) {
    event.preventDefault();
    state.lockPressFired = false;
    return;
  }
  els.lockBtn.animate?.([
    { transform: 'scale(1)' },
    { transform: 'scale(0.94)' },
    { transform: 'scale(1)' }
  ], { duration: 180 });
}

function toggleLockMode() {
  state.locked = !state.locked;
  state.selected = null;
  state.dragging = null;
  state.draftRoute = null;
  state.selectionPopoverDismissedKey = '';
  els.editorTools.classList.remove('is-open');
  els.editorHandle.setAttribute('aria-expanded', 'false');
  renderEditor();
}

function isEditorLocked() {
  return state.locked && els.editorView.classList.contains('is-active');
}

function ensureEditable() {
  return !isEditorLocked();
}

function syncLockUI() {
  const locked = isEditorLocked();
  els.editorView.classList.toggle('is-locked', locked);
  els.playNameInput.readOnly = locked;
  els.notesInput.readOnly = locked;
  els.lockBtn.classList.toggle('is-active', locked);
  els.lockLabel.textContent = locked ? 'View' : 'Lock';
  [els.undoBtn, els.redoBtn, els.drawToolsBtn, els.formationBtn, els.editActionsBtn, els.exportActionsBtn].forEach((button) => {
    button.disabled = locked;
  });
  if (locked) {
    els.editorTools.classList.remove('is-open');
    els.editorHandle.setAttribute('aria-expanded', 'false');
    if (els.selectionPopover) els.selectionPopover.hidden = true;
  }
}

function showHome() {
  updateActivePlay();
  els.editorView.classList.remove('is-active');
  els.homeView.classList.add('is-active');
  renderHome();
}

function openPlay(playId) {
  state.activePlayId = playId;
  const folder = folderForPlay(playId);
  state.activeFolderId = folder?.id || state.activeFolderId;
  state.selected = null;
  els.homeView.classList.remove('is-active');
  els.editorView.classList.add('is-active');
  persist();
  renderEditor();
}

function createPlay() {
  if (!ensureEditable()) return;
  const folder = state.book.folders.find((item) => item.id === state.activeFolderId) || state.book.folders[0];
  const play = defaultPlay('New Offensive Play');
  pushHistory();
  folder.plays.unshift(play);
  state.activeFolderId = folder.id;
  state.folderFilterId = folder.id;
  state.activePlayId = play.id;
  persist();
  openPlay(play.id);
}

function createFolder() {
  if (!ensureEditable()) return;
  const name = prompt('Folder name', 'New Folder');
  if (!name) return;
  pushHistory();
  const folder = { id: makeId('folder'), name: name.trim(), plays: [] };
  state.book.folders.push(folder);
  state.activeFolderId = folder.id;
  state.folderFilterId = folder.id;
  persist();
  renderHome();
}

function duplicatePlay() {
  if (!ensureEditable()) return;
  const source = activePlay();
  if (!source) return;
  const folder = folderForPlay(source.id);
  const copy = clone(source);
  copy.id = makeId('play');
  copy.name = `${source.name} Copy`;
  pushHistory();
  folder.plays.unshift(copy);
  state.activeFolderId = folder.id;
  state.activePlayId = copy.id;
  persist();
  renderAll();
}

function deleteSelectedOrPlay() {
  if (!ensureEditable()) return;
  const play = activePlay();
  if (!play) return;
  if (state.selected?.type === 'route') {
    pushHistory();
    play.routes = play.routes.filter((item) => item.id !== state.selected.id);
    state.selected = null;
    persist();
    renderEditor();
    return;
  }
  if (state.selected?.type === 'annotation') {
    pushHistory();
    play.annotations = play.annotations.filter((item) => item.id !== state.selected.id);
    state.selected = null;
    persist();
    renderEditor();
    return;
  }
  if (!confirm(`Delete "${play.name}"?`)) return;
  pushHistory();
  state.book.folders.forEach((folder) => {
    folder.plays = folder.plays.filter((item) => item.id !== play.id);
  });
  state.activePlayId = allPlays()[0]?.play.id || '';
  persist();
  showHome();
}

function moveActivePlay() {
  if (!ensureEditable()) return;
  const play = activePlay();
  if (!play) return;
  const folders = state.book.folders.map((folder, index) => `${index + 1}: ${folder.name}`).join('\n');
  const input = prompt(`Move to folder number:\n${folders}`, '1');
  const index = Number(input) - 1;
  const target = state.book.folders[index];
  if (!target) return;
  const current = folderForPlay(play.id);
  if (current.id === target.id) return;
  pushHistory();
  current.plays = current.plays.filter((item) => item.id !== play.id);
  target.plays.unshift(play);
  state.activeFolderId = target.id;
  state.folderFilterId = target.id;
  persist();
  renderAll();
}

function renameBook() {
  if (!ensureEditable()) return;
  const name = prompt('Book name', state.book.name);
  if (!name) return;
  pushHistory();
  state.book.name = name.trim();
  persist();
  renderHome();
}

function renameActiveFolder() {
  if (!ensureEditable()) return;
  const folder = state.book.folders.find((item) => item.id === state.activeFolderId);
  if (!folder) return;
  const name = prompt('Folder name', folder.name);
  if (!name) return;
  pushHistory();
  folder.name = name.trim();
  persist();
  renderHome();
}

function editCategories() {
  if (!ensureEditable()) return;
  const action = prompt('Category command: new / rename / delete', 'rename');
  if (!action) return;
  const normalized = action.trim().toLowerCase();
  if (normalized === 'new') createFolder();
  if (normalized === 'rename') renameActiveFolder();
  if (normalized === 'delete') deleteActiveFolder();
}

function deleteActiveFolder() {
  if (!ensureEditable()) return;
  const folder = state.book.folders.find((item) => item.id === state.activeFolderId);
  if (!folder || state.book.folders.length <= 1) return;
  if (!confirm(`Delete folder "${folder.name}" and its plays?`)) return;
  pushHistory();
  state.book.folders = state.book.folders.filter((item) => item.id !== folder.id);
  state.activeFolderId = state.book.folders[0].id;
  state.folderFilterId = 'all';
  state.activePlayId = allPlays()[0]?.play.id || '';
  persist();
  renderAll();
}

async function loadBundledSample() {
  if (!ensureEditable()) return;
  if (!confirm('Load the bundled sample playbook? Current unsaved changes will be replaced.')) return;
  pushHistory();
  state.book = await loadSampleBook();
  state.selected = null;
  initializeActiveIds();
  renderAll();
}

function applyFormation(name) {
  if (!ensureEditable()) return;
  const positions = formations[name];
  const play = activePlay();
  if (!positions || !play) return;
  pushHistory();
  play.players.forEach((player) => {
    const position = positions[player.label];
    if (position) [player.x, player.y] = position;
  });
  persist();
  renderEditor();
}

function applyDefenseFormation(name) {
  if (!ensureEditable()) return;
  const positions = defenseFormations[name];
  const play = activePlay();
  if (!positions || !play) return;
  pushHistory();
  play.defenseFormation = name;
  play.defenders = positions.map(([x, y], index) => ({
    id: play.defenders[index]?.id || `d${index + 1}`,
    label: 'X',
    x: fieldX(x),
    y: fieldY(y)
  }));
  play.defenseVisible = true;
  persist();
  renderEditor();
}

function flipPlay() {
  const play = activePlay();
  if (!play) return;
  pushHistory();
  const flipX = (x) => field.left + field.right - x;
  play.players.forEach((player) => { player.x = flipX(player.x); });
  play.defenders.forEach((defender) => { defender.x = flipX(defender.x); });
  play.routes.forEach((item) => {
    item.points = item.points.map(([x, y]) => [flipX(x), y]);
  });
  play.annotations.forEach((item) => { item.x = flipX(item.x); });
  persist();
  renderEditor();
}

function setQbDepth(yards) {
  if (!ensureEditable()) return;
  const play = activePlay();
  if (!play) return;
  const qb = play.players.find((player) => player.label === '2');
  if (!qb) return;
  pushHistory();
  qb.y = fieldY(yards);
  persist();
  renderEditor();
}

function toggleDefense() {
  if (!ensureEditable()) return;
  const play = activePlay();
  if (!play) return;
  pushHistory();
  play.defenseVisible = play.defenseVisible === false;
  persist();
  renderEditor();
}

function clearLines() {
  if (!ensureEditable()) return;
  const play = activePlay();
  if (!play || !play.routes.length) return;
  if (!confirm('Clear all lines in this play?')) return;
  pushHistory();
  play.routes = [];
  state.selected = null;
  persist();
  renderEditor();
}

function resetPlayDiagram() {
  if (!ensureEditable()) return;
  const play = activePlay();
  if (!play) return;
  if (!confirm('Reset players, defense, lines, and comments for this play?')) return;
  const fresh = defaultPlay(play.name);
  pushHistory();
  play.players = fresh.players;
  play.defenders = fresh.defenders;
  play.routes = [];
  play.annotations = [];
  play.playerMarks = fresh.playerMarks;
  play.playerSize = fresh.playerSize;
  play.endCapSize = fresh.endCapSize;
  play.defenseVisible = true;
  state.selected = null;
  persist();
  renderEditor();
}

function setTool(tool) {
  if (!ensureEditable()) return;
  state.tool = tool;
  state.draftRoute = null;
  document.querySelectorAll('[data-tool]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.tool === tool);
  });
  syncControls();
}

function pointerDown(event) {
  if (isEditorLocked()) return;
  const play = activePlay();
  if (!play) return;
  if (document.activeElement?.matches?.('input, textarea')) document.activeElement.blur();
  const point = svgPoint(event);
  const target = event.target.closest?.('[data-type]');
  const type = target?.dataset.type;
  state.selectionPopoverDismissedKey = '';

  if (type === 'route-point') {
    state.selected = { type: 'route', id: target.dataset.id };
    state.dragging = { type: 'route-point', id: target.dataset.id, index: Number(target.dataset.index) };
    pushHistory();
    els.fieldSvg.setPointerCapture(event.pointerId);
    renderEditor();
    return;
  }

  if (DRAW_TOOLS.has(state.tool)) {
    const explicitPlayer = type === 'player' ? play.players.find((item) => item.id === target.dataset.id) : null;
    const nearest = nearestPlayer(play, point);
    const player = explicitPlayer || (nearest && distance(nearest, point) < 85 ? nearest : null);
    const start = player ? [player.x, player.y] : [point.x, point.y];
    const end = [clamp(point.x, field.left, field.right), clamp(point.y, field.top, field.bottom)];
    pushHistory();
    state.draftRoute = {
      id: makeId('route'),
      playerId: player?.id || '',
      type: state.tool,
      mode: 'straight',
      points: [start, end],
      end: state.tool === 'motion' ? 'none' : state.tool === 'block' ? 't' : state.routeDefaults.end,
      color: state.tool === 'motion' ? '#ef0000' : state.routeDefaults.color,
      width: state.routeDefaults.width,
      opacity: 1
    };
    play.routes.push(state.draftRoute);
    state.selected = { type: 'route', id: state.draftRoute.id };
    els.fieldSvg.setPointerCapture(event.pointerId);
    renderEditor();
    return;
  }

  if (type === 'player' || type === 'defender' || type === 'annotation') {
    state.selected = { type, id: target.dataset.id };
    state.dragging = { type, id: target.dataset.id };
    pushHistory();
    els.fieldSvg.setPointerCapture(event.pointerId);
    renderEditor();
    return;
  }

  if (type === 'route') {
    state.selected = { type: 'route', id: target.dataset.id };
    renderEditor();
    return;
  }

  if (state.tool === 'text') {
    const text = prompt('Comment', 'Comment');
    if (!text) return;
    pushHistory();
    play.annotations.push({ id: makeId('note'), text, x: point.x, y: point.y });
    state.selected = { type: 'annotation', id: play.annotations[play.annotations.length - 1].id };
    persist();
    renderEditor();
    return;
  }

  state.selected = null;
  renderEditor();
}

function pointerMove(event) {
  if (isEditorLocked()) return;
  const play = activePlay();
  if (!play) return;
  const point = svgPoint(event);
  const x = clamp(point.x, field.left, field.right);
  const y = clamp(point.y, field.top, field.bottom);

  if (state.dragging?.type === 'player') {
    const player = play.players.find((item) => item.id === state.dragging.id);
    if (player) {
      player.x = x;
      player.y = y;
      renderEditor();
    }
    return;
  }

  if (state.dragging?.type === 'defender') {
    const defender = play.defenders.find((item) => item.id === state.dragging.id);
    if (defender) {
      defender.x = x;
      defender.y = y;
      renderEditor();
    }
    return;
  }

  if (state.dragging?.type === 'annotation') {
    const note = play.annotations.find((item) => item.id === state.dragging.id);
    if (note) {
      note.x = x;
      note.y = y;
      renderEditor();
    }
    return;
  }

  if (state.dragging?.type === 'route-point') {
    const item = play.routes.find((routeItem) => routeItem.id === state.dragging.id);
    if (item?.points[state.dragging.index]) {
      item.points[state.dragging.index] = [x, y];
      renderEditor();
    }
    return;
  }

  if (state.draftRoute) {
    state.draftRoute.points[state.draftRoute.points.length - 1] = [x, y];
    renderEditor();
  }
}

function pointerUp() {
  if (isEditorLocked()) return;
  if (state.dragging || state.draftRoute) {
    state.dragging = null;
    state.draftRoute = null;
    persist();
    renderAll();
  }
}

function editSelectedText() {
  if (!ensureEditable()) return;
  const play = activePlay();
  if (!play || state.selected?.type !== 'annotation') return;
  const note = play.annotations.find((item) => item.id === state.selected.id);
  if (!note) return;
  const text = prompt('Comment', note.text);
  if (text === null) return;
  pushHistory();
  note.text = text;
  persist();
  renderEditor();
}

function setSelectedMark(mark) {
  if (!ensureEditable()) return;
  const play = activePlay();
  if (!play || state.selected?.type !== 'player' || !MARKS.has(mark)) return;
  pushHistory();
  play.playerMarks[state.selected.id] = mark;
  persist();
  renderEditor();
}

function setSelectedEnd(end) {
  if (!ensureEditable()) return;
  const play = activePlay();
  if (!ROUTE_ENDS.has(end)) return;
  state.routeDefaults.end = end;
  if (play && state.selected?.type === 'route') {
    const item = play.routes.find((routeItem) => routeItem.id === state.selected.id);
    if (item) {
      pushHistory();
      item.end = end;
      persist();
      renderEditor();
    }
  }
}

function setSelectedRouteType(type) {
  if (!ensureEditable()) return;
  if (!DRAW_TOOLS.has(type)) return;
  const play = activePlay();
  const item = play?.routes.find((routeItem) => routeItem.id === state.selected?.id);
  if (!item) return;
  pushHistory();
  item.type = type;
  if (type === 'motion') {
    item.end = 'none';
    item.color = '#ef0000';
  } else if (type === 'block') {
    item.end = 't';
    item.color = item.color || state.routeDefaults.color;
  } else if (item.end === 'none') {
    item.end = 'arrow';
  }
  persist();
  renderEditor();
}

function setSelectedRouteWidth(value) {
  if (!ensureEditable()) return;
  const width = normalizeNumber(value, ROUTE_WIDTH.default, ROUTE_WIDTH.min, ROUTE_WIDTH.max);
  state.routeDefaults.width = width;
  const play = activePlay();
  const item = play?.routes.find((routeItem) => routeItem.id === state.selected?.id);
  if (!item) return;
  pushHistory();
  item.width = width;
  persist();
  renderEditor();
}

function setSelectedRouteColor(color) {
  if (!ensureEditable()) return;
  if (!isCssColor(color)) return;
  state.routeDefaults.color = color;
  const play = activePlay();
  const item = play?.routes.find((routeItem) => routeItem.id === state.selected?.id);
  if (!item) return;
  pushHistory();
  item.color = color;
  persist();
  renderEditor();
}

function setSelectedPlayerLabel(label) {
  if (!ensureEditable()) return;
  const play = activePlay();
  const player = play?.players.find((item) => item.id === state.selected?.id);
  if (!player || !/^[1-9][0-9]?$/.test(String(label))) return;
  pushHistory();
  const other = play.players.find((item) => item.id !== player.id && item.label === String(label));
  if (other) other.label = player.label;
  player.label = String(label);
  persist();
  renderEditor();
}

function deleteSelectedOnly() {
  if (!ensureEditable()) return;
  const play = activePlay();
  if (!play || !state.selected) return;
  if (state.selected.type === 'route') {
    pushHistory();
    play.routes = play.routes.filter((item) => item.id !== state.selected.id);
  } else if (state.selected.type === 'annotation') {
    pushHistory();
    play.annotations = play.annotations.filter((item) => item.id !== state.selected.id);
  } else {
    return;
  }
  state.selected = null;
  state.selectionPopoverDismissedKey = '';
  persist();
  renderEditor();
}

function selectedKey() {
  return state.selected ? `${state.selected.type}:${state.selected.id}` : '';
}

function closeSelectionPopover() {
  state.selectionPopoverDismissedKey = selectedKey();
  if (els.selectionPopover) els.selectionPopover.hidden = true;
}

function syncSelectionPopover(play) {
  const key = selectedKey();
  const type = state.selected?.type;
  const show = Boolean(key && key !== state.selectionPopoverDismissedKey && !state.dragging && !state.draftRoute && !isEditorLocked() && ['route', 'player', 'annotation'].includes(type));
  if (!show) {
    els.selectionPopover.hidden = true;
    return;
  }

  const route = type === 'route' ? play.routes.find((item) => item.id === state.selected.id) : null;
  const player = type === 'player' ? play.players.find((item) => item.id === state.selected.id) : null;
  const annotation = type === 'annotation' ? play.annotations.find((item) => item.id === state.selected.id) : null;
  if ((type === 'route' && !route) || (type === 'player' && !player) || (type === 'annotation' && !annotation)) {
    els.selectionPopover.hidden = true;
    return;
  }

  els.selectionPopover.hidden = false;
  els.routeInspector.hidden = type !== 'route';
  els.playerInspector.hidden = type !== 'player';
  els.annotationInspector.hidden = type !== 'annotation';
  els.selectionPopoverTitle.textContent = type === 'route'
    ? 'Selected Line'
    : type === 'player'
      ? `Selected Player ${player.label}`
      : 'Selected Text';

  document.querySelectorAll('[data-route-type]').forEach((button) => {
    button.classList.toggle('is-active', Boolean(route && button.dataset.routeType === route.type));
  });
  document.querySelectorAll('[data-end]').forEach((button) => {
    const activeEnd = route?.end || state.routeDefaults.end;
    button.classList.toggle('is-active', button.dataset.end === activeEnd);
  });
  document.querySelectorAll('[data-route-width]').forEach((button) => {
    button.classList.toggle('is-active', Boolean(route && Number(button.dataset.routeWidth) === Math.round(route.width || ROUTE_WIDTH.default)));
  });
  document.querySelectorAll('[data-route-color]').forEach((button) => {
    button.classList.toggle('is-active', Boolean(route && button.dataset.routeColor.toLowerCase() === (route.color || '').toLowerCase()));
  });
  document.querySelectorAll('[data-player-label]').forEach((button) => {
    button.classList.toggle('is-active', Boolean(player && button.dataset.playerLabel === player.label));
  });
  document.querySelectorAll('[data-mark]').forEach((button) => {
    const mark = player ? play.playerMarks?.[player.id] || 'circle' : '';
    button.classList.toggle('is-active', button.dataset.mark === mark);
  });
}

function handleKeyDown(event) {
  const active = document.activeElement;
  const isTextInput = active?.tagName === 'INPUT' || active?.tagName === 'TEXTAREA' || active?.isContentEditable;
  const key = event.key.toLowerCase();

  if ((event.metaKey || event.ctrlKey) && key === 'z' && !isTextInput) {
    event.preventDefault();
    if (event.shiftKey) redo();
    else undo();
    return;
  }

  if ((event.metaKey || event.ctrlKey) && key === 'y' && !isTextInput) {
    event.preventDefault();
    redo();
    return;
  }

  if ((event.key === 'Delete' || event.key === 'Backspace') && !isTextInput) {
    event.preventDefault();
    deleteSelectedOnly();
    return;
  }

  if (event.key === 'Escape') {
    state.selected = null;
    state.draftRoute = null;
    state.dragging = null;
    state.selectionPopoverDismissedKey = '';
    renderEditor();
  }
}

function updatePlayName() {
  if (!ensureEditable()) return;
  const play = activePlay();
  if (!play) return;
  play.name = els.playNameInput.value.replace(/\s*\n\s*/g, ' ').trim() || 'Untitled';
  persist();
}

function updatePlayNotes() {
  if (!ensureEditable()) return;
  const play = activePlay();
  if (!play) return;
  play.notes = els.notesInput.value;
  persist();
}

function updatePlayerSize() {
  if (!ensureEditable()) return;
  const play = activePlay();
  if (!play) return;
  play.playerSize = normalizeNumber(els.playerSizeRange.value, PLAYER_SIZE.default, PLAYER_SIZE.min, PLAYER_SIZE.max);
  persist();
  drawPlayers(play);
}

function updateEndCapSize() {
  if (!ensureEditable()) return;
  const play = activePlay();
  if (!play) return;
  play.endCapSize = normalizeNumber(els.endCapRange.value, END_CAP_SIZE.default, END_CAP_SIZE.min, END_CAP_SIZE.max);
  persist();
  drawRoutes(play);
  drawSelectionHandles(play);
}

function updateLineWidth() {
  if (!ensureEditable()) return;
  const play = activePlay();
  const value = normalizeNumber(els.lineWidthRange.value, ROUTE_WIDTH.default, ROUTE_WIDTH.min, ROUTE_WIDTH.max);
  state.routeDefaults.width = value;
  if (play && state.selected?.type === 'route') {
    const item = play.routes.find((routeItem) => routeItem.id === state.selected.id);
    if (item) item.width = value;
    persist();
    renderEditor();
  }
}

function updateLineColor() {
  if (!ensureEditable()) return;
  const play = activePlay();
  const value = els.lineColorInput.value;
  state.routeDefaults.color = value;
  if (play && state.selected?.type === 'route') {
    const item = play.routes.find((routeItem) => routeItem.id === state.selected.id);
    if (item) item.color = value;
    persist();
    renderEditor();
  }
}

function syncControls() {
  const play = activePlay();
  if (!play) return;
  const selectedRoute = state.selected?.type === 'route'
    ? play.routes.find((item) => item.id === state.selected.id)
    : null;
  els.playerSizeRange.value = normalizeNumber(play.playerSize, PLAYER_SIZE.default, PLAYER_SIZE.min, PLAYER_SIZE.max);
  els.endCapRange.value = normalizeNumber(play.endCapSize, END_CAP_SIZE.default, END_CAP_SIZE.min, END_CAP_SIZE.max);
  els.lineWidthRange.value = selectedRoute?.width || state.routeDefaults.width;
  els.lineColorInput.value = selectedRoute?.color || state.routeDefaults.color;
  els.defenseToggleBtn.textContent = play.defenseVisible === false ? 'Show D' : 'Hide D';
  els.selectionLabel.textContent = selectionText(play);
}

function selectionText(play) {
  if (!state.selected) return 'Select a player, route, defense, or note';
  if (state.selected.type === 'player') {
    const player = play.players.find((item) => item.id === state.selected.id);
    return player ? `Player ${player.label}: drag to move, choose a mark` : 'Player';
  }
  if (state.selected.type === 'defender') return 'Defense X: drag to move';
  if (state.selected.type === 'route') return 'Route: drag handles, choose type/end/color/width, Delete removes it';
  if (state.selected.type === 'annotation') return 'Text: drag to move, double-click to edit, Delete removes it';
  return 'Selected';
}

function updateActivePlay() {
  const play = activePlay();
  if (!play) return;
  if (!isEditorLocked()) {
    play.name = els.playNameInput.value.replace(/\s*\n\s*/g, ' ').trim() || play.name;
    play.notes = els.notesInput.value;
  }
  persist();
}

function pushHistory() {
  if (!state.book) return;
  state.history.push(clone(state.book));
  state.history = state.history.slice(-40);
  state.redoHistory = [];
}

function undo() {
  if (!ensureEditable()) return;
  const previous = state.history.pop();
  if (!previous) return;
  state.redoHistory.push(clone(state.book));
  restoreBook(previous);
}

function redo() {
  if (!ensureEditable()) return;
  const next = state.redoHistory.pop();
  if (!next) return;
  state.history.push(clone(state.book));
  state.history = state.history.slice(-40);
  restoreBook(next);
}

function restoreBook(snapshot) {
  state.book = normalizeBook(snapshot);
  state.activeFolderId = state.book.activeFolderId || state.book.folders[0]?.id || '';
  state.activePlayId = state.book.activePlayId || allPlays()[0]?.play.id || '';
  state.folderFilterId = state.folderFilterId === 'all'
    ? 'all'
    : state.book.folders.some((folder) => folder.id === state.folderFilterId)
      ? state.folderFilterId
      : 'all';
  state.selected = null;
  state.selectionPopoverDismissedKey = '';
  persist();
  renderAll();
}

function openJsonInput(mode) {
  if (!ensureEditable()) return;
  state.importMode = mode;
  els.jsonInput.click();
}

async function importJson() {
  if (!ensureEditable()) return;
  const [file] = els.jsonInput.files;
  els.jsonInput.value = '';
  if (!file) return;
  try {
    const source = JSON.parse(await file.text());
    const incoming = normalizeBook(source);
    if (!source.name) incoming.name = bookNameFromFile(file.name);
    pushHistory();
    if (state.importMode === 'add') {
      const existingIds = new Set(state.book.folders.map((folder) => folder.id));
      incoming.folders.forEach((folder) => {
        let targetId = folder.id;
        if (existingIds.has(targetId)) targetId = makeId('folder');
        existingIds.add(targetId);
        state.book.folders.push({ ...folder, id: targetId });
      });
    } else {
      state.book = incoming;
      state.activeFolderId = state.book.activeFolderId || state.book.folders[0]?.id || '';
      state.folderFilterId = 'all';
      state.activePlayId = state.book.activePlayId || allPlays()[0]?.play.id || '';
    }
    persist();
    renderAll();
  } catch (error) {
    alert(`JSON could not be loaded: ${error.message}`);
  }
}

function bookNameFromFile(fileName) {
  if (fileName === 'KS-playcall.json') return SAMPLE_BOOK_NAME;
  return fileName.replace(/\.[^.]+$/, '') || DEFAULT_BOOK_NAME;
}

function exportJson() {
  updateActivePlay();
  const blob = new Blob([JSON.stringify(state.book, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeFileName(state.book.name || 'fpb-v2-playbook')}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function openHomeExportSheet() {
  els.homeExportSheet.hidden = false;
}

function closeHomeExportSheet() {
  els.homeExportSheet.hidden = true;
}

function handleHomeExport(action) {
  closeHomeExportSheet();
  if (action === 'book-link') shareBookLink();
  if (action === 'link-txt') exportBookLinkText();
  if (action === 'json') exportJson();
  if (action === 'pdf-book') printBook();
}

function sharePlayLink() {
  const play = activePlay();
  if (!play) return;
  const folder = folderForPlay(play.id);
  const book = normalizeBook({ name: state.book.name, folders: [{ id: folder.id, name: folder.name, plays: [play] }] });
  copyShareLink('play', { book, playId: play.id });
}

function shareBookLink() {
  const url = shareUrl('book', { book: state.book, playId: state.activePlayId });
  if (url.length > 7000) {
    exportTextFile(`${safeFileName(state.book.name)}-book-link.txt`, url);
    alert('Book link is long, so it was saved as a text file.');
    return;
  }
  copyOrPromptLink(url);
}

async function copyShareLink(kind, payload) {
  const url = shareUrl(kind, payload);
  copyOrPromptLink(url);
}

function shareUrl(kind, payload) {
  const token = encodeShare(payload);
  return `${location.origin}${location.pathname}#${kind}=${token}`;
}

async function copyOrPromptLink(url) {
  try {
    await navigator.clipboard.writeText(url);
    alert('Link copied.');
  } catch {
    prompt('Copy link', url);
  }
}

function exportBookLinkText() {
  const url = shareUrl('book', { book: state.book, playId: state.activePlayId });
  exportTextFile(`${safeFileName(state.book.name)}-book-link.txt`, url);
}

function exportTextFile(fileName, text) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

function printBook() {
  updateActivePlay();
  const win = window.open('', '_blank');
  if (!win) {
    alert('Popup was blocked. Allow popups to print the book.');
    return;
  }
  const plays = allPlays();
  const pages = plays.map(({ folder, play }, index) => {
    const svg = renderThumb(play, index + 1);
    svg.setAttribute('viewBox', '0 0 1000 760');
    svg.classList.remove('thumb');
    const notes = escapeHtml(play.notes || '').replace(/\n/g, '<br>');
    return `<section class="page"><h1>${escapeHtml(play.name)}</h1><p class="folder">${escapeHtml(folder.name)}</p>${svg.outerHTML}<h2>Play Notes</h2><div class="notes">${notes}</div></section>`;
  }).join('');
  win.document.write(`<!doctype html><html lang="ja"><head><meta charset="utf-8"><title>${escapeHtml(state.book.name)}</title><style>
    body{font-family:-apple-system,BlinkMacSystemFont,"Helvetica Neue","Yu Gothic",sans-serif;margin:0;color:#30363b}
    .page{page-break-after:always;padding:24px}
    h1{margin:0 0 4px;font-size:28px}.folder{margin:0 0 16px;color:#6f7a84;font-weight:700}
    svg{width:100%;max-width:720px;display:block;margin:0 auto 16px}
    h2{font-size:16px;color:#6f7a84}.notes{font-size:18px;font-weight:700;line-height:1.5;white-space:normal}
  </style></head><body>${pages}</body></html>`);
  win.document.close();
  win.focus();
  win.print();
}

function savePhoto() {
  const play = activePlay();
  if (!play) return;
  const svg = els.fieldSvg.cloneNode(true);
  svg.setAttribute('xmlns', SVG_NS);
  svg.setAttribute('width', '1000');
  svg.setAttribute('height', '760');
  const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const image = new Image();
  image.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 760;
    const context = canvas.getContext('2d');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0);
    URL.revokeObjectURL(url);
    canvas.toBlob((png) => {
      if (!png) return;
      const pngUrl = URL.createObjectURL(png);
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = `${safeFileName(play.name)}.png`;
      a.click();
      URL.revokeObjectURL(pngUrl);
    }, 'image/png');
  };
  image.src = url;
}

function sharedBookFromHash() {
  const hash = location.hash || '';
  const match = hash.match(/^#(book|play)=(.+)$/);
  if (!match) return null;
  try {
    return { kind: match[1], ...decodeShare(match[2]) };
  } catch {
    return null;
  }
}

function encodeShare(value) {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

function decodeShare(token) {
  const padded = token.replaceAll('-', '+').replaceAll('_', '/').padEnd(Math.ceil(token.length / 4) * 4, '=');
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

function nearestPlayer(play, point) {
  return play.players
    .map((player) => ({ player, distance: distance(player, point) }))
    .sort((a, b) => a.distance - b.distance)[0]?.player;
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function svgPoint(event) {
  const pt = els.fieldSvg.createSVGPoint();
  pt.x = event.clientX;
  pt.y = event.clientY;
  const transformed = pt.matrixTransform(els.fieldSvg.getScreenCTM().inverse());
  return { x: transformed.x, y: transformed.y };
}

function splitLines(text) {
  return String(text || '').split(/\r?\n/).slice(0, 6);
}

function safeFileName(value) {
  return String(value).replace(/[\\/:*?"<>|]/g, '_').slice(0, 80) || 'fpb-v2-playbook';
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function svgEl(name, attrs = {}) {
  const el = document.createElementNS(SVG_NS, name);
  Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
  return el;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

boot();
