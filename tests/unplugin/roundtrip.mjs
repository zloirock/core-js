// the AST-engine roundtrip gate: every transpiler fixture input parses with oxc, prints
// through the esrap adapter with ZERO mutations, and the print must change nothing that
// means anything - the reparse is structurally identical, every comment survives where it
// sat (between the same two nodes) and with its line association (a trailing
// `core-js-disable-line` that moves to its own line changes what it disables), and a second
// print of the reparse is byte-identical (idempotency). a trailing comma is not compared - ESTree
// does not carry it and neither print writes one - and the output's ES5 grammar is the e2e bundles'.
// files oxc cannot parse (error fixtures, flow) are out of the printer's contract - they
// are counted and skipped, with a canary so a skip-everything regression cannot read green
import { visitFixtures } from '../babel-plugin/fixture-shards.mjs';
import { parseSync } from 'oxc-parser';
import { printProgram } from '../../packages/core-js-unplugin/internals/print.js';
import { isLineBoundDisableDirective } from '../../packages/core-js-polyfill-provider/helpers/source-scan.js';
import { inferTestId, parseFixtureOrNull } from './fixture-lang.mjs';
import { commentPlacements, commentSignature, strip } from './structural.mjs';
import { liftSfcLangSuffix } from '../../packages/core-js-unplugin/internals/sfc-shapes.js';

const { cyan, green, red } = chalk;

const fixturesDir = path.resolve('../transpiler-fixtures');

const counts = { compared: 0, placed: 0, skippedParse: 0, failed: 0 };
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

function checkFixture(directory, testId, rawSource) {
  const source = rawSource.charCodeAt(0) === 0xFEFF ? rawSource.slice(1) : rawSource;
  const parsed = parseFixtureOrNull(testId, source);
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
  const reparsed = parseFixtureOrNull(testId, printed.code);
  if (!reparsed) return fail(directory, 'printed output does not reparse');
  if (JSON.stringify(strip(parsed.program)) !== JSON.stringify(strip(reparsed.program))) {
    return fail(directory, 'reparse is structurally different');
  }
  if ((parsed.program.hashbang?.value ?? null) !== (reparsed.program.hashbang?.value ?? null)) {
    return fail(directory, 'hashbang lost or changed');
  }
  const sourceComments = commentSignature(parsed.comments);
  const printedComments = commentSignature(reparsed.comments);
  if (JSON.stringify(sourceComments) !== JSON.stringify(printedComments)) {
    return fail(directory, `comments diverge: ${ sourceComments.length } in, ${ printedComments.length } out`);
  }
  // the signature keeps text, kind and order, and a comment flushed out of its list keeps all three
  const sourcePlacements = commentPlacements(parsed.program, source, parsed.comments);
  const printedPlacements = commentPlacements(reparsed.program, printed.code, reparsed.comments);
  for (let i = 0; i < sourcePlacements.length; i++) {
    if (sourcePlacements[i] !== printedPlacements[i]) {
      return fail(directory, `comment #${ i } moved: ${ sourcePlacements[i] } -> ${ printedPlacements[i] }`);
    }
  }
  counts.placed += sourcePlacements.length;
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
    const reparse2 = parseFixtureOrNull(testId, reprint.code);
    if (!reparse2) return fail(directory, 'second print does not reparse');
    const reprint2 = printProgram({ program: reparse2.program, comments: reparse2.comments, source: reprint.code, id: testId, jsx });
    if (reprint2.code !== reprint.code) return fail(directory, 'print never reaches a fixed point over its own output');
  }
}

await visitFixtures(fixturesDir, (directory, source, babelOptions) => {
  // Lift SFC virtual ids to the same dialect as the transform and fixture gates.
  checkFixture(path.relative(fixturesDir, directory), liftSfcLangSuffix(inferTestId(babelOptions)), source);
});

for (const line of failures) echo`${ red('FAIL') } ${ line }`;
if (counts.failed > failures.length) echo`${ red(`... and ${ counts.failed - failures.length } more failures`) }`;
echo`\nRoundtrip: ${ green(counts.compared) } compared, ${ green(counts.placed) } comments placed, ${ cyan(counts.skippedParse) } unparsable skipped, ${ counts.failed ? red(counts.failed) : green(0) } failed`;
// corpus-presence canary: a walk or parse regression that skips the corpus must not read green
if (counts.compared < 8000) throw new Error(`roundtrip corpus collapsed: only ${ counts.compared } fixtures compared`);
// ... and the placement compare is shown to see a move on a control rather than trusted to: a comment
// leaving an argument list for the statement after it keeps its text, kind and order
function controlPlacement(code) {
  // eslint-disable-next-line node/no-sync -- oxc-parser only provides sync API
  const parsed = parseSync('control.ts', code, { sourceType: 'module' });
  return commentPlacements(parsed.program, code, parsed.comments)[0];
}
if (controlPlacement('f(a, /* c */);\ng();') === controlPlacement('f(a);\n/* c */ g();')) {
  throw new Error('roundtrip placement compare reads a moved comment as placed');
}
if (counts.failed) throw new Error('Some roundtrips have failed');
