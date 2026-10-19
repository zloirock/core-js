// A source carrying TS syntax is TypeScript, and a conclusion read off it about types holds only where
// `tsc` accepts it. Two corpora carry such sources: the scenario sources the suites here ran, and the
// inputs of the shared transpiler fixtures whose options parse them as TypeScript. Each passes `tsc` in
// the context TypeScript itself gives the file - a module only where it imports or exports, a script
// otherwise, as the resolver models it (a top-level `this` is the realm, an `interface String` merges
// into the built-in) - over TypeScript's lib and the global `@core-js/types`, what a core-js user
// compiles against. Two allowances: the names and modules a source reads as opaque values, and what is
// marked deliberate. A source marks it by a `// @ts-expect-error <why>` line above the line `tsc`
// rejects, which `tsc` itself reports once the line no longer needs it; `@ts-ignore` and `@ts-nocheck`
// would go quiet instead, so the gate reads them as plain text. A suite whose TS syntax only wraps
// dynamic JavaScript says why in `createChecker(name, { tsc })`, and that reason fails as soon as no row
// of the suite needs it
import { API } from 'typescript/unstable/sync';
import { createVirtualFileSystem } from 'typescript/unstable/fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { parseSync } from 'oxc-parser';
import { createChecker, scenarioOrigin, scenarioSources, suiteTscIntents } from './harness.mjs';
import { loadBabelOptions } from '../unplugin/fixture-lang.mjs';

const { check, checkDeep, fail, finish, pass } = createChecker('tsc-validity');

// what a source reads as an opaque value: a name, a namespace, a module or a shorthand's value it never declares
const OPAQUE_PLACEHOLDER_CODES = new Set([2304, 2307, 2503, 2552, 2582, 2583, 2584, 2591, 2592, 2593, 2882, 18004]);

const OPTIONS = {
  target: 'esnext',
  module: 'preserve',
  moduleResolution: 'bundler',
  moduleDetection: 'auto',
  lib: ['esnext', 'dom', 'dom.iterable'],
  jsx: 'preserve',
  // the rows that decorate a parameter are written in the legacy dialect, the only one that has it
  experimentalDecorators: true,
  strict: false,
  allowUnreachableCode: true,
  allowUnusedLabels: true,
  noEmit: true,
  skipLibCheck: true,
  types: [],
};

// the build writes the package's entry points, so an unbuilt package resolves none of them
function resolveCoreJsTypes() {
  try {
    return createRequire(import.meta.url).resolve('@core-js/types/full');
  } catch (error) {
    throw new Error('tsc-validity: `@core-js/types` is not built, run `npm run build-types` first', { cause: error });
  }
}

const CORE_JS_TYPES = resolveCoreJsTypes();

// TS syntax is a `TS*` node or a flag TypeScript alone sets: `declare class C {}` is a plain class
// node, and `?.` sets `optional` on the chain nodes in JavaScript too
const JS_OPTIONAL_TYPES = new Set(['CallExpression', 'ChainExpression', 'MemberExpression']);
function isTSNode(node) {
  return node.type.startsWith('TS') || node.declare === true || node.abstract === true || !!node.accessibility
    || node.readonly === true || node.override === true || node.definite === true
    || (node.optional === true && !JS_OPTIONAL_TYPES.has(node.type)) || node.importKind === 'type' || node.exportKind === 'type';
}

function hasTSSyntax(program) {
  const stack = [program];
  while (stack.length) {
    const node = stack.pop();
    if (Array.isArray(node)) stack.push(...node);
    else if (node && typeof node === 'object') {
      if (typeof node.type === 'string' && isTSNode(node)) return true;
      for (const key in node) if (key !== 'parent') stack.push(node[key]);
    }
  }
  return false;
}

// the comment directives `tsc` itself reads, by its own patterns: a line comment opening with one right
// after its slashes, or the last line of a block comment - a mention further into a comment's text is no
// directive. `@ts-nocheck` is a pragma, which only a line comment carries
const LINE_DIRECTIVE = /^\/?\s*@(?<name>ts-expect-error|ts-ignore|ts-nocheck)(?<rest>.*)/s;
const BLOCK_DIRECTIVE = /^(?:\/|\*)*\s*@(?<name>ts-expect-error|ts-ignore)(?<rest>.*)/s;
const LINE_BREAK = /\r\n|[\n\r\u2028\u2029]/;

// whether the source is TypeScript, its markers that name no reason - a marker without its why says
// nothing a later reader can weigh - and the text `tsc` checks. `@ts-ignore` and `@ts-nocheck` silence
// a rejection and never report that they stopped needing to, so that text spells them as plain words:
// a source may carry one as data, never as an allowance. the respelling keeps every position in place
function readSource(code, file) {
  // eslint-disable-next-line node/no-sync -- oxc-parser only provides sync API
  const { program, comments } = parseSync(file, code, { sourceType: 'module' });
  const markersWithoutReason = [];
  let checked = code;
  for (const { type, value, start, end } of comments) {
    const line = type === 'Line' ? value : value.split(LINE_BREAK).at(-1).trimStart();
    const directive = (type === 'Line' ? LINE_DIRECTIVE : BLOCK_DIRECTIVE).exec(line)?.groups;
    if (!directive) continue;
    if (directive.name !== 'ts-expect-error') {
      checked = checked.slice(0, start) + code.slice(start, end).replaceAll('@ts-', '@ts_') + checked.slice(end);
    } else if (!/^\s+\S/.test(directive.rest)) markersWithoutReason.push(`@ts-expect-error${ directive.rest }`);
  }
  return { typescript: hasTSSyntax(program), markersWithoutReason, checked };
}

// The native API keeps the libraries warm across snapshots. Only one source belongs to the virtual
// project at a time, so script globals never leak between rows. Unhandled paths fall back to disk for
// TypeScript's lib and the built core-js types.
const VIRTUAL_ROOT = path.join(os.tmpdir(), 'core-js-tsc-validity').replaceAll('\\', '/');
const CONFIG = `${ VIRTUAL_ROOT }/tsconfig.json`;
const virtualFS = createVirtualFileSystem({});
const api = new API({
  fs: {
    ...virtualFS,
    fileExists: name => virtualFS.fileExists(name) || undefined,
    directoryExists: name => virtualFS.directoryExists(name) || undefined,
  },
});
let currentFile;
function diagnosticText({ text, messageChain = [] }) {
  return [text, ...messageChain.map(diagnosticText)].join(' ');
}

function rejections(code, file) {
  const source = `${ VIRTUAL_ROOT }${ file }`;
  const deleted = currentFile && currentFile !== source ? [currentFile] : [];
  for (const name of deleted) virtualFS.removeFile(name);
  virtualFS.writeFile(source, code);
  const changed = [source];
  if (currentFile !== source) {
    virtualFS.writeFile(CONFIG, JSON.stringify({ compilerOptions: OPTIONS, files: [CORE_JS_TYPES, source] }));
    changed.push(CONFIG);
  }
  const snapshot = api.updateSnapshot({
    openProjects: currentFile ? [] : [CONFIG],
    fileChanges: { changed, deleted },
  });
  currentFile = source;
  try {
    const { program } = snapshot.getProject(CONFIG);
    return [...program.getSyntacticDiagnostics(source), ...program.getSemanticDiagnostics(source)]
      .filter(diagnostic => !OPAQUE_PLACEHOLDER_CODES.has(diagnostic.code))
      .map(diagnostic => {
        const line = code.slice(0, Math.max(0, diagnostic.pos)).split(LINE_BREAK).length;
        return `TS${ diagnostic.code } on line ${ line }: ${ diagnosticText(diagnostic) }`;
      });
  } finally {
    snapshot.dispose();
  }
}

function reportMarkers(label, markers) {
  for (const marker of markers) fail(label, `a marker needs its reason, as \`@ts-expect-error <why>\`: ${ marker }`);
}

try {
  // --- Scenario sources ---

  const counts = { checked: 0, suiteReasoned: 0, flow: 0, plain: 0 };
  const suitesNeedingReason = new Set();
  for (const row of scenarioSources) {
    if (row.dialect === 'flow') {
      counts.flow++;
      continue;
    }
    const file = `/rows/row.${ row.dialect }`;
    const { typescript, markersWithoutReason, checked } = readSource(row.code, file);
    if (!typescript) {
      counts.plain++;
      continue;
    }
    const { suite, where } = row.suite === null ? scenarioOrigin(row) : row;
    const label = row.label === null ? `${ where ?? suite }: ${ row.code.trim().split('\n', 1)[0].slice(0, 80) }` : `${ suite } / ${ row.label }`;
    reportMarkers(label, markersWithoutReason);
    const rejected = rejections(checked, file);
    if (suiteTscIntents.has(suite)) {
      counts.suiteReasoned++;
      if (rejected.length) suitesNeedingReason.add(suite);
      continue;
    }
    counts.checked++;
    if (rejected.length) fail(label, `tsc rejects the source:\n    ${ rejected.join('\n    ') }`);
    else pass();
  }
  for (const [suite, reason] of suiteTscIntents) {
    check(`${ suite }: the suite's tsc reason is still needed (${ reason })`, suitesNeedingReason.has(suite), true);
  }

  // --- Transpiler fixtures ---

  const FIXTURES = fileURLToPath(new URL('../transpiler-fixtures/', import.meta.url));

  // a directory holding `input.mjs` is a fixture, any other one groups fixtures
  async function collectFixtures(directory, found = []) {
    if (await fs.pathExists(path.join(directory, 'input.mjs'))) {
      found.push(directory);
      return found;
    }
    for (const name of (await fs.readdir(directory)).sort()) {
      const entry = path.join(directory, name);
      if ((await fs.stat(entry)).isDirectory()) await collectFixtures(entry, found);
    }
    return found;
  }

  // the file `tsc` reads a fixture as, from the options the babel leg parses it with: TypeScript only
  // through the `typescript` parser plugin, under the extension its filename names - a declaration file,
  // a CommonJS `.cts`, an SFC block's `lang` - or else `.ts`, and `.tsx` beside the `jsx` plugin. null for
  // a fixture babel reads as Flow or plain JavaScript
  function fixtureFile({ filename = '', parserOpts }) {
    const plugins = new Set((parserOpts?.plugins ?? []).map(plugin => Array.isArray(plugin) ? plugin[0] : plugin));
    if (!plugins.has('typescript')) return null;
    const lang = /[&?]lang=(?<lang>[cm]?tsx?)(?=[#&]|$)/.exec(filename)?.groups.lang;
    const named = /(?:\.d)?\.[cm]?tsx?$/.exec(filename.replace(/[#?].*/s, ''))?.[0] ?? (lang && `.${ lang }`);
    return `/fixtures/input${ named || (plugins.has('jsx') ? '.tsx' : '.ts') }`;
  }

  const fixtures = await collectFixtures(FIXTURES);
  const fixtureCounts = { checked: 0, plain: 0, other: 0 };
  for (const directory of fixtures) {
    const file = fixtureFile(await loadBabelOptions(directory) ?? {});
    if (!file) {
      fixtureCounts.other++;
      continue;
    }
    const { typescript, markersWithoutReason, checked } = readSource(await fs.readFile(path.join(directory, 'input.mjs'), 'utf8'), file);
    if (!typescript) {
      fixtureCounts.plain++;
      continue;
    }
    const label = `transpiler-fixtures/${ path.relative(FIXTURES, directory).replaceAll('\\', '/') }`;
    reportMarkers(label, markersWithoutReason);
    const rejected = rejections(checked, file);
    fixtureCounts.checked++;
    if (rejected.length) fail(label, `tsc rejects the input:\n    ${ rejected.join('\n    ') }`);
    else pass();
  }

  const { cyan } = chalk;
  echo(`tsc-validity: ${ cyan(counts.checked) } TS sources checked, ${ cyan(counts.suiteReasoned) } under a suite reason, ${
    cyan(counts.plain) } without TS syntax, ${ cyan(counts.flow) } Flow`);
  echo(`tsc-validity: ${ cyan(fixtureCounts.checked) } TS fixture inputs checked, ${ cyan(fixtureCounts.plain) } without TS syntax, ${
    cyan(fixtureCounts.other) } parsed as Flow or JavaScript`);
  check('tsc-validity: every scenario source is counted once', counts.checked + counts.suiteReasoned + counts.plain + counts.flow,
    scenarioSources.length);
  check('tsc-validity: every fixture is counted once', fixtureCounts.checked + fixtureCounts.plain + fixtureCounts.other, fixtures.length);

  // --- Leg controls ---
  // every leg shown to fire on a control rather than trusted to: a leg that died would pass every source

  const CONTROL = '/rows/row.ts';
  function typescriptOf(code) {
    return readSource(code, CONTROL).typescript;
  }
  function markersOf(code) {
    return readSource(code, CONTROL).markersWithoutReason;
  }
  function rejectionsOf(code) {
    return rejections(readSource(code, CONTROL).checked, CONTROL).length;
  }
  check('tsc-validity: the detector reads a TS node', typescriptOf('let x: number;'), true);
  check('tsc-validity: the detector reads a TS flag', typescriptOf('declare class C {}'), true);
  check('tsc-validity: the detector passes JavaScript by', typescriptOf('a?.b(); class C { m() {} }'), false);
  checkDeep('tsc-validity: a marker without its reason is caught, in either comment form',
    markersOf('// @ts-expect-error\nlet a;\n/* @ts-expect-error */\nlet b;\n// @ts-expect-error why\nlet c;\n'), ['@ts-expect-error', '@ts-expect-error ']);
  checkDeep('tsc-validity: a directive mentioned inside a comment is no marker',
    markersOf('// names `@ts-expect-error` in passing\n// /@ts-expect-error\n'), []);
  check('tsc-validity: tsc rejects', rejectionsOf('const x: number = "a";'), 1);
  check('tsc-validity: a marker answers for its line', rejectionsOf('// @ts-expect-error a control\nconst x: number = "a";'), 0);
  check('tsc-validity: a stale marker is reported', rejectionsOf('// @ts-expect-error a control\nconst x = 1;'), 1);
  check('tsc-validity: an undeclared name is opaque', rejectionsOf('foreign.read();'), 0);
  check('tsc-validity: a line `@ts-ignore` silences nothing', rejectionsOf('// @ts-ignore\nconst x: number = "a";'), 1);
  check('tsc-validity: a block `@ts-ignore` silences nothing', rejectionsOf('/* @ts-ignore */\nconst x: number = "a";'), 1);
  check('tsc-validity: `@ts-nocheck` silences nothing', rejectionsOf('// @ts-nocheck\nconst x: number = "a";'), 1);
  check('tsc-validity: a `@ts-ignore` over an accepted line passes', rejectionsOf('// @ts-ignore\nconst x = 1;'), 0);
  check('tsc-validity: a JSDoc-style `@ts-ignore` silences nothing', rejectionsOf('/** @ts-ignore */\nconst x: number = "a";'), 1);
  check('tsc-validity: a `@ts-ignore` behind code silences nothing', rejectionsOf('let y; // @ts-ignore\nconst x: number = "a";'), 1);
  check('tsc-validity: `@ts-ignore` spelled as a prefix silences nothing, as tsc honors it', rejectionsOf('// @ts-ignored\nconst x: number = "a";'), 1);
  checkDeep('tsc-validity: a directive inside a string is no marker', markersOf('const s = "// @ts-expect-error";\n'), []);
  checkDeep('tsc-validity: a reason opens after whitespace', markersOf('// @ts-expect-error: why\nconst x: number = "a";\n'), ['@ts-expect-error: why']);
  check('tsc-validity: the core-js types are read', rejectionsOf('Iterator.zip([[1], [2]]);'), 0);
  check('tsc-validity: ... and check a member they lack', rejectionsOf('Iterator.notAMember();'), 1);
  checkDeep('tsc-validity: syntactic diagnostics are checked', rejections('const x: = 1;', CONTROL),
    ['TS1110 on line 1: Type expected.']);
  checkDeep('tsc-validity: diagnostic positions count UTF-16 and CRLF lines',
    rejections('const text = "\u{1F642}";\r\nconst x: number = "a";', CONTROL),
    ["TS2322 on line 2: Type 'string' is not assignable to type 'number'."]);
  check('tsc-validity: chained diagnostics retain the underlying type mismatch',
    rejections('declare const value: { nested: { count: string } };\nconst result: { nested: { count: number } } = value;', CONTROL)
      .some(message => message.includes("Type 'string' is not assignable to type 'number'.")), true);
  check('tsc-validity: a new snapshot reads the corrected source', rejectionsOf('const x: number = 1;'), 0);
  check('tsc-validity: a script declaration is checked against the lib', rejectionsOf('let String: number;'), 1);
  check('tsc-validity: a module declaration shadows the lib', rejectionsOf('export {}; let String: number;'), 0);
  check('tsc-validity: a row declares a script global', rejectionsOf('declare const rowOnly: string;'), 0);
  check('tsc-validity: the following row does not inherit that global', rejectionsOf('const value: number = rowOnly;'), 0);
  check('tsc-validity: switching to TSX keeps JSX valid', rejections('const view = <div />;', '/rows/row.tsx').length, 0);
  check('tsc-validity: TSX is still type-checked', rejections('const x: number = "a";', '/rows/row.tsx').length, 1);
  for (const extension of ['ts', 'cts', 'mts']) {
    check(`tsc-validity: a .${ extension } file accepts a runtime declaration`,
      rejections('let value: string;', `/rows/row.${ extension }`).length, 0);
    check(`tsc-validity: a .d.${ extension } file retains skipLibCheck`,
      rejections('let value: string;', `/rows/row.d.${ extension }`).length, 0);
    check(`tsc-validity: a .d.${ extension } file still reports syntax errors`,
      rejections('let value: = 1;', `/rows/row.d.${ extension }`).length, 1);
  }
  const walkRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'core-js-tsc-validity-'));
  try {
    for (const fixture of ['flat', 'flat/inner', 'group/nested', 'group/deeper/nested']) await fs.outputFile(path.join(walkRoot, fixture, 'input.mjs'), '');
    checkDeep('tsc-validity: the walk collects a fixture at any depth and stops at one',
      (await collectFixtures(walkRoot)).map(directory => path.relative(walkRoot, directory).replaceAll('\\', '/')), ['flat', 'group/deeper/nested', 'group/nested']);
  } finally {
    await fs.remove(walkRoot);
  }
  for (const [options, expected] of [
    [{}, null],
    [{ parserOpts: { plugins: ['flow', 'jsx'] } }, null],
    [{ filename: 'input.ts' }, null],
    [{ parserOpts: { plugins: ['typescript'] } }, '/fixtures/input.ts'],
    [{ parserOpts: { plugins: [['typescript', {}], 'jsx'] } }, '/fixtures/input.tsx'],
    [{ filename: 'types.d.cts', parserOpts: { plugins: ['typescript'] } }, '/fixtures/input.d.cts'],
    [{ filename: 'Component.vue?vue&type=script&lang=tsx', parserOpts: { plugins: ['typescript'] } }, '/fixtures/input.tsx'],
    [{ filename: 'Component.vue?vue&type=script&lang=ts#L42', parserOpts: { plugins: ['typescript'] } }, '/fixtures/input.ts'],
  ]) {
    check(`tsc-validity: a fixture with ${ JSON.stringify(options) } is read as ${ expected }`, fixtureFile(options), expected);
  }
  finish();
} finally {
  api.close();
}
