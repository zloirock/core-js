// The artifact page of a cell, its frame for the browser leg, and the per-cell data both read. The
// programs are hand-written ES5 under `harness/` - real files, so eslint reads them - and the two
// rules that bind them are in `AGENTS.md`, next to what puts them under eslint at all.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { RUN_TIMEOUT_MS } from './cells.mjs';
import { ARTIFACTS, HERE } from './paths.mjs';

const HARNESS = join(HERE, 'harness');

const PAGE = {
  banner: 'banner',
  table: 'tbl',
  pass: 'green',
  fail: 'red',
};

// `expected` is the raw exercise's label SEQUENCE, not its count: a branch that stopped executing and
// another that started cancel out in a count.
export function cellScript(label, expectedLabels) {
  // The HTML parser must never see the start of a tag or comment inside an inline script.
  const data = JSON.stringify({ label, expected: expectedLabels, page: PAGE, timeout: RUN_TIMEOUT_MS })
    .replaceAll('<', '\\u003C')
    .replaceAll('\u2028', '\\u2028')
    .replaceAll('\u2029', '\\u2029');
  return `window.E2E_CELL = ${ data };\n`;
}

// every page inlines the same program, only the cell script above it differs
const TRAP = await readFile(join(HARNESS, 'trap.js'), 'utf8');
const BANNER = (await Promise.all(['shared.js', 'banner.js']
  .map(name => readFile(join(HARNESS, name), 'utf8')))).join('\n');

// the class and the table's keys are one set; `entities.escapeUTF8` next door is the same five
// characters, but it is a SUBJECT of this suite - `escape_utf8` is one of htmlparser2's checks
const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
function esc(value) {
  return String(value).replaceAll(/["&'<>]/g, char => HTML_ESCAPES[char]);
}

// self-contained but for `bundle.js` beside it, which is what makes it uploadable as it stands
function html(cell, checks, script) {
  const title = cell.lib.name;
  const subtitle = [cell.provider, cell.method, ...cell.phase ? [cell.phase] : []].join(' / ');
  const rows = checks.map(check => `<tr class="${ check.pass ? 'ok' : 'bad' }"><td>${ esc(check.label) }</td><td>${ check.pass ? 'PASS' : 'FAIL' }</td></tr>`).join('');
  const failing = checks.filter(check => !check.pass).length;
  // the banner's text is white unconditionally, so a state class this stylesheet does not define
  // paints white on white; the state rules carry the id, since a class alone loses to it on specificity
  return `<!doctype html>
<html><head><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta charset="utf-8"><title>e2e-libs ${ esc(title) }/${ esc(subtitle) }</title>
<style>
  body{font:14px/1.5 system-ui,sans-serif;margin:2rem;max-width:720px}
  #${ PAGE.banner }{padding:1rem;border-radius:8px;font-weight:700;font-size:18px;color:#fff;background:#525252}
  #${ PAGE.banner }.${ PAGE.pass }{background:#166534}#${ PAGE.banner }.${ PAGE.fail }{background:#991b1b}
  table{border-collapse:collapse;margin-top:1rem;width:100%}
  td{border:1px solid #ccc;padding:4px 8px}
  tr.ok td:nth-child(2){color:#166534;font-weight:700}
  tr.bad td:nth-child(2){color:#991b1b;font-weight:700}
</style></head>
<body>
  <h1>${ esc(title) } - <code>${ esc(subtitle) }</code></h1>
  <div id="${ PAGE.banner }">running...</div>
  <p>Pre-flight in node recorded ${ checks.length - failing }/${ checks.length } passing. This page reruns the same checks in <em>this</em> browser.</p>
  <table id="${ PAGE.table }"><thead><tr><th>check</th><th>result</th></tr></thead><tbody>${ rows }</tbody></table>
  <script>${ TRAP }</script>
  <script src="bundle.js"></script>
  <script>${ script }</script>
  <script>${ BANNER }</script>
</body></html>
`;
}

// The browser leg's page of a cell: its bundle alone in a realm of its own, which the driver
// (`harness/qunit.js`) loads into an iframe and reads the verdict of. `trap.js` comes first, so a
// bundle that throws while it loads is reported by what it threw. The harness is reached RELATIVELY -
// up through the cell's segments to `artifacts/`, then one more - because karma serves a file outside
// its basePath under a path that differs by platform.
function frameHtml(segments) {
  const harness = `${ '../'.repeat(segments.length + 1) }harness`;
  return `<!doctype html>
<html><head><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta charset="utf-8"></head><body>
  <script src="${ harness }/trap.js"></script>
  <script src="bundle.js"></script>
  <script src="cell.js"></script>
  <script src="${ harness }/shared.js"></script>
  <script src="${ harness }/frame.js"></script>
</body></html>
`;
}

// four files describing ONE build, written together and only on the success path - which is why a
// run clears what it is about to rebuild before it starts
export async function writeCell(cell, code, checks, expectedLabels) {
  const dir = join(ARTIFACTS, ...cell.segments);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, 'bundle.js'), code);
  const script = cellScript(cell.label, expectedLabels);
  await writeFile(join(dir, 'cell.js'), script);
  await writeFile(join(dir, 'index.html'), html(cell, checks, script));
  await writeFile(join(dir, 'frame.html'), frameHtml(cell.segments));
}
