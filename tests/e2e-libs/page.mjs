// The artifact page of a cell, and the per-cell data both page programs read. The programs themselves
// are hand-written ES5 under `harness/` - real files, so eslint reads them - and the two rules that
// bind them are in `AGENTS.md`, next to what puts them under eslint at all.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ARTIFACTS, HERE } from './paths.mjs';

const HARNESS = join(HERE, 'harness');

const PAGE = {
  banner: 'banner',
  table: 'tbl',
  pass: 'green',
  fail: 'red',
};

const RUN_TIMEOUT_MS = 20_000;

// `expected` is the pre-flight's label SEQUENCE, not its count: a branch that stopped executing and
// another that started cancel out in a count.
function cellScript(label, expectedLabels) {
  // `</` is escaped because this same text is inlined into a `<script>` on the artifact page, where
  // a label carrying one would close the element; inside a string literal the two spellings are equal
  return `window.E2E_CELL = ${ JSON.stringify({
    label, expected: expectedLabels, page: PAGE, timeout: RUN_TIMEOUT_MS,
  }).replaceAll('</', '<\\/') };\n`;
}

// every page inlines the same program, only the cell script above it differs
const BANNER = (await Promise.all(['shared.js', 'banner.js']
  .map(name => readFile(join(HARNESS, name), 'utf8')))).join('\n');

// the class and the table's keys are one set; `entities.escapeUTF8` next door is the same five
// characters, but it is a SUBJECT of this suite - `escape_utf8` is one of htmlparser2's checks
const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
function esc(value) {
  return String(value).replaceAll(/["&'<>]/g, char => HTML_ESCAPES[char]);
}

// self-contained but for `bundle.js` beside it, which is what makes it uploadable as it stands
function html(cell, checks, bannerProgram) {
  const title = cell.lib.name;
  const subtitle = [cell.provider, cell.method, ...cell.phase ? [cell.phase] : []].join(' / ');
  const rows = checks.map(check => `<tr class="${ check.pass ? 'ok' : 'bad' }"><td>${ esc(check.label) }</td><td>${ check.pass ? 'PASS' : 'FAIL' }</td></tr>`).join('');
  const failing = checks.filter(check => !check.pass).length;
  // the banner's text is white unconditionally, so a state class this stylesheet does not define
  // paints white on white; the state rules carry the id, since a class alone loses to it on specificity
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>e2e-libs ${ esc(title) }/${ esc(subtitle) }</title>
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
  <script src="bundle.js"></script>
  <script>${ cellScript(cell.label, checks.map(check => check.label)) }</script>
  <script>${ bannerProgram }</script>
</body></html>
`;
}

// three files describing ONE build, written together and only on the success path - which is why a
// run clears what it is about to rebuild before it starts
export async function writeCell(cell, code, checks) {
  const dir = join(ARTIFACTS, ...cell.segments);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, 'bundle.js'), code);
  await writeFile(join(dir, 'cell.js'), cellScript(cell.label, checks.map(check => check.label)));
  await writeFile(join(dir, 'index.html'), html(cell, checks, BANNER));
}
