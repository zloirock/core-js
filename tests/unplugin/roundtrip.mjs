// the AST-engine roundtrip gate: every transpiler fixture input parses with oxc, prints
// through the esrap adapter with ZERO mutations, and the print must change nothing that
// means anything - the reparse is structurally identical, every comment survives with its
// line association (a trailing `core-js-disable-line` that moves to its own line changes
// what it disables), and a second print of the reparse is byte-identical (idempotency).
// files oxc cannot parse (error fixtures, flow) are out of the printer's contract - they
// are counted and skipped, with a canary so a skip-everything regression cannot read green
import { parseSync } from 'oxc-parser';
import { printProgram } from '../../packages/core-js-unplugin/internals/ast/print.js';
import { isLineBoundDisableDirective } from '../../packages/core-js-polyfill-provider/helpers/source-scan.js';
import { liftSfcLangSuffix } from '../../packages/core-js-unplugin/internals/plugin-helpers.js';
import { inferTestId, loadBabelOptions } from './fixture-lang.mjs';
import { strip } from './structural.mjs';

const { readdir, readFile, stat } = fs;
const { join } = path;
const { cyan, green, red } = chalk;

const UTF8 = { encoding: 'utf8' };
const fixturesDir = path.resolve('../transpiler-fixtures');

const counts = { compared: 0, skippedParse: 0, skippedOptions: 0, failed: 0 };
const failures = [];

function fail(directory, detail) {
  counts.failed++;
  if (failures.length < 20) failures.push(`${ directory }: ${ detail }`);
}

// structural identity: the shared comparator (`structural.mjs`)

// a comment is "own-line" when nothing but whitespace precedes it on its line. only
// LINE-BOUND DIRECTIVES pin that association - a plain comment may legally re-flow with
// the formatting (a single-line body expanding to multiline moves its comment exactly
// like the babel leg would). a trailing `-line` directive that turns own-line stops
// covering its statement; a `-next-line` one merging into a code line covers the wrong one
function isOwnLine(source, offset) {
  for (let i = offset - 1; i >= 0; i--) {
    const ch = source[i];
    if (ch === '\n' || ch === '\r' || ch === '\u2028' || ch === '\u2029') return true;
    if (ch !== ' ' && ch !== '\t') return false;
  }
  return true;
}

function parseFixture(testId, source) {
  // eslint-disable-next-line node/no-sync -- oxc-parser only provides sync API
  const parsed = parseSync(testId, source, { sourceType: 'module' });
  return parsed.errors?.some(error => error.severity === 'Error') ? null : parsed;
}

function checkFixture(directory, testId, rawSource) {
  const source = rawSource.charCodeAt(0) === 0xFEFF ? rawSource.slice(1) : rawSource;
  const parsed = parseFixture(testId, source);
  if (!parsed) {
    counts.skippedParse++;
    return;
  }
  counts.compared++;
  const jsx = /\.[jt]sx$/.test(testId);
  let printed;
  try {
    printed = printProgram({ program: parsed.program, comments: parsed.comments, source, id: testId, jsx });
  } catch (error) {
    return fail(directory, `print threw: ${ error.message }`);
  }
  const reparsed = parseFixture(testId, printed.code);
  if (!reparsed) return fail(directory, 'printed output does not reparse');
  if (JSON.stringify(strip(parsed.program)) !== JSON.stringify(strip(reparsed.program))) {
    return fail(directory, 'reparse is structurally different');
  }
  if ((parsed.program.hashbang?.value ?? null) !== (reparsed.program.hashbang?.value ?? null)) {
    return fail(directory, 'hashbang lost or changed');
  }
  const sourceComments = parsed.comments.map(c => `${ c.type }:${ c.value }`);
  const printedComments = reparsed.comments.map(c => `${ c.type }:${ c.value }`);
  if (sourceComments.join('\n') !== printedComments.join('\n')) {
    return fail(directory, `comments diverge: ${ sourceComments.length } in, ${ printedComments.length } out`);
  }
  for (let i = 0; i < parsed.comments.length; i++) {
    if (!isLineBoundDisableDirective(parsed.comments[i].value)) continue;
    const wasOwnLine = isOwnLine(source, parsed.comments[i].start);
    const isNowOwnLine = isOwnLine(printed.code, reparsed.comments[i].start);
    if (wasOwnLine !== isNowOwnLine) {
      return fail(directory, `directive #${ i } (${ parsed.comments[i].value.trim() }) moved ${ wasOwnLine ? 'off' : 'onto' } its own line`);
    }
  }
  // the print must reach a FIXED POINT by the second pass: a first reprint may legally
  // normalize one-shot artifacts (a pad space after a multiline block comment prints from
  // locs the first output no longer has), but a divergence that never converges - paren
  // accretion was one - grows again on every pass and fails here
  const reprint = printProgram({ program: reparsed.program, comments: reparsed.comments, source: printed.code, id: testId, jsx });
  if (reprint.code !== printed.code) {
    const reparse2 = parseFixture(testId, reprint.code);
    if (!reparse2) return fail(directory, 'second print does not reparse');
    const reprint2 = printProgram({ program: reparse2.program, comments: reparse2.comments, source: reprint.code, id: testId, jsx });
    if (reprint2.code !== reprint.code) return fail(directory, 'print never reaches a fixed point over its own output');
  }
}

async function walk(directory) {
  const entries = await readdir(directory);
  if (entries.includes('input.mjs')) {
    const babelOptions = await loadBabelOptions(directory);
    if (!babelOptions) {
      counts.skippedOptions++;
      return;
    }
    const source = await readFile(join(directory, 'input.mjs'), UTF8);
    // SFC virtual ids carry the parser dialect in their query - the same lift the plugin
    // and the fixture runner share; without it every SFC fixture parse-skips silently
    checkFixture(path.relative(fixturesDir, directory), liftSfcLangSuffix(inferTestId(babelOptions)), source);
    return;
  }
  for (const entry of entries) {
    const full = join(directory, entry);
    if ((await stat(full)).isDirectory()) await walk(full);
  }
}

await walk(fixturesDir);

for (const line of failures) echo`${ red('FAIL') } ${ line }`;
if (counts.failed > failures.length) echo`${ red(`... and ${ counts.failed - failures.length } more failures`) }`;
echo`\nRoundtrip: ${ green(counts.compared) } compared, ${ cyan(counts.skippedParse) } unparsable skipped, ${ cyan(counts.skippedOptions) } optionless skipped, ${ counts.failed ? red(counts.failed) : green(0) } failed`;
// corpus-presence canary: a walk or parse regression that skips the corpus must not read green
if (counts.compared < 8000) throw new Error(`roundtrip corpus collapsed: only ${ counts.compared } fixtures compared`);
if (counts.failed) throw new Error('Some roundtrips have failed');
