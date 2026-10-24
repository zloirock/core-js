// Shared cross-parser harness for polyfill-provider tests. The adapter abstraction
// normalises babel (`@babel/parser` + `@babel/traverse`) and oxc (`oxc-parser` +
// `estree-toolkit`) into the same `{ parseAndScope, collectPaths, pickPath,
// makeResolver }` shape so each test scenario runs through BOTH parsers and
// dispatch-shape regressions in either adapter surface immediately
import { parse as babelParse } from '@babel/parser';
import _babelTraverse from '@babel/traverse';
import * as babelTypes from '@babel/types';
import { parseSync as oxcParseSync } from 'oxc-parser';
import { traverse as estreeTraverse } from 'estree-toolkit';
import { createResolveNodeType } from '../../packages/core-js-polyfill-provider/resolve-node-type.js';
import { nodeType as estreeNodeType, types as estreeTypes } from '../../packages/core-js-unplugin/internals/estree-compat.js';
import { neutralizeUnwalkedParamPatterns } from '../../packages/core-js-unplugin/internals/plugin.js';

// `@babel/traverse` is a CJS module re-exported as default under ESM consumption
const babelTraverse = _babelTraverse.default ?? _babelTraverse;

export const babelAdapter = {
  name: 'babel',
  parseAndScope(code, sourceType = 'module', extraPlugins = []) {
    scenarioSource(code, { extraPlugins });
    // flow and typescript are mutually exclusive at the parser level - a flow scenario
    // supplies its own plugin set instead of extending the typescript default
    const plugins = extraPlugins.includes('flow') ? extraPlugins : ['typescript', ...extraPlugins];
    const ast = babelParse(code, {
      sourceType,
      plugins,
      allowReturnOutsideFunction: true,
      allowAwaitOutsideFunction: true,
    });
    let programPath = null;
    babelTraverse(ast, { Program(path) { programPath = path; } });
    return programPath;
  },
  collectPaths(programPath, type, predicate = () => true) {
    const found = [];
    programPath.traverse({
      [type](path) {
        if (predicate(path)) found.push(path);
      },
    });
    return found;
  },
  pickPath(programPath, type, predicate) {
    return this.collectPaths(programPath, type, predicate)[0] ?? null;
  },
  makeResolver(opts = {}) {
    return createResolveNodeType(node => node?.type, babelTypes, opts);
  },
};

// oxc-parser produces ESTree shape with `Literal` for all literal kinds; `estreeNodeType`
// from unplugin's estree-compat normalises that to the Babel dispatch name. `estreeTypes`
// shims the `t.isXxx` predicate API. estree-toolkit traverse populates `.scope` on each
// path - matches babel-traverse closely enough that `path.scope.getBinding(...)` works
const oxcAdapter = {
  name: 'oxc',
  // oxc auto-detects features by file extension (no extraPlugins arg - callers' plugin list is
  // babel-only). a 'script' sourceType parses sloppy-mode (Annex-B block-function hoisting); use
  // a `.js` name so oxc doesn't apply TS module rules
  parseAndScope(code, sourceType = 'module', extraPlugins = []) {
    scenarioSource(code, { extraPlugins });
    // oxc keys the language off the FILENAME: a `.ts` name parses `<X ... />` as a type
    // assertion, so a JSX scenario must ask for the `.tsx` grammar the same way the babel
    // adapter asks for its `jsx` plugin
    const filename = sourceType === 'script' ? 'test.js' : extraPlugins.includes('jsx') ? 'test.tsx' : 'test.ts';
    // eslint-disable-next-line node/no-sync -- oxc-parser only provides sync API
    const { program } = oxcParseSync(filename, code, { sourceType });
    // the same pass the real unplugin pipeline runs before ANY scope traverse: estree-toolkit
    // aborts its crawl on a bodyless signature whose parameter is a pattern (`declare function
    // f(...a: T[])`, an overload head, an interface call or construct signature) - reported
    // upstream in https://github.com/sarsamurmu/estree-toolkit/issues/12. without this the shape
    // is not one a scenario here could use at all; sharing the plugin's neutraliser keeps the
    // harness on the same footing as the pipeline instead of testing a narrower language
    neutralizeUnwalkedParamPatterns(program);
    let programPath = null;
    estreeTraverse(program, {
      $: { scope: true },
      Program(path) { programPath = path; },
    });
    return programPath;
  },
  collectPaths(programPath, type, predicate = () => true) {
    const found = [];
    estreeTraverse(programPath.node, {
      $: { scope: true },
      [type](path) {
        if (predicate(path)) found.push(path);
      },
    });
    return found;
  },
  pickPath(programPath, type, predicate) {
    return this.collectPaths(programPath, type, predicate)[0] ?? null;
  },
  makeResolver(opts = {}) {
    return createResolveNodeType(estreeNodeType, estreeTypes, opts);
  },
};

export const adapters = [babelAdapter, oxcAdapter];

// raw-AST descent: walk own object / array properties directly (parser-visitor-independent) and
// return the first NODE satisfying `predicate`, or null. skips parent / scope back-references and
// `loc`; `seen` bounds any cycles. arrays are traversed but never tested (they carry no `.type`)
export function findNode(root, predicate) {
  const seen = new WeakSet();
  const stack = [root];
  while (stack.length) {
    const node = stack.pop();
    if (!node || typeof node !== 'object' || seen.has(node)) continue;
    seen.add(node);
    if (!Array.isArray(node) && predicate(node)) return node;
    for (const key in node) {
      if (key === 'parent' || key === '_scope' || key === 'loc') continue;
      const value = node[key];
      if (value && typeof value === 'object') stack.push(value);
    }
  }
  return null;
}

// find the first node of `type`. `pickPath` / `collectPaths` rely on the parser's VISITOR keys, and
// estree-toolkit (the oxc adapter) does not descend into TS type-annotation nodes - they live
// outside the runtime tree - so `pickPath('TS...')` returns null on oxc and a cross-parser
// type-annotation test's oxc leg silently no-ops. the raw descent reaches them on both parsers
// (both emit identical TS node-type names), keeping type-annotation suites genuinely cross-parser
export function findTypeNode(root, type) {
  return findNode(root, node => node.type === type);
}

// every scenario source the suites hand to a parser, once per source and dialect, with the suite's own
// word on what `tsc` makes of its sources (`tsc-validity.mjs` reads both once the suites have run).
// `runBoth` / `runBothAndAgree` record a source with its label and suite, an adapter records whatever
// a suite parses through it directly, and a source a suite writes and hands to an emitter or a parser
// of its own in a TS dialect is recorded at that call by `scenarioSource` (a JS-only channel cannot
// parse a TS row at all)
export const scenarioSources = [];
export const suiteTscIntents = new Map();
const suiteFiles = new Map();
const recordedSources = new Map();
const STACK_FRAME = /(?<url>file:\/\/[^\s)]+?):(?<line>\d+):\d+/g;

// record a source once per dialect and text, and hand it back, so a call wraps the literal it passes
// on. a record without its suite keeps the stack of the call, which names the suite and the line
export function scenarioSource(code, { extraPlugins = [], label = null, suite = null } = {}) {
  const dialect = extraPlugins.includes('flow') ? 'flow' : extraPlugins.includes('jsx') ? 'tsx' : 'ts';
  if (!recordedSources.has(dialect)) recordedSources.set(dialect, new Set());
  const recorded = recordedSources.get(dialect);
  if (recorded.has(code)) return code;
  recorded.add(code);
  scenarioSources.push({ code, dialect, label, suite, site: suite === null ? new Error('scenario source') : null });
  return code;
}

// the suite a source recorded without one came from, and the line of the call that handed it over
export function scenarioOrigin({ suite, site }) {
  for (const { groups: { url, line } } of site?.stack.matchAll(STACK_FRAME) ?? []) {
    if (suiteFiles.has(url)) return { suite: suite ?? suiteFiles.get(url), where: `${ url.slice(url.lastIndexOf('/') + 1) }:${ line }` };
  }
  return { suite, where: null };
}

// the marker line a generated row puts above the line `tsc` rejects on purpose; a row `tsc` accepts
// passes no reason and gets no line, so one template serves both
export function expectError(why) {
  return why ? `// @ts-expect-error ${ why }\n` : '';
}

// suite factory. `name` is used by `finish()` for the summary line + Error message;
// counts are per-suite so each file reports independently. `echo` / `chalk` are zx
// globals - imported modules see them on `globalThis` via the bare identifier.
// `tsc`: why the suite's sources are not held to `tsc` at all - a suite whose TS syntax only wraps
// dynamic JavaScript the checker cannot type. a single row's deliberate invalidity is marked in its
// source instead, by a `// @ts-expect-error <why>` line above the line `tsc` rejects
export function createChecker(name, { tsc } = {}) {
  if (tsc !== undefined) suiteTscIntents.set(name, tsc);
  const caller = new Error('suite').stack.matchAll(STACK_FRAME).find(({ groups }) => groups.url !== import.meta.url);
  if (caller) suiteFiles.set(caller.groups.url, name);
  const { cyan, green, red } = chalk;
  const counts = { passed: 0, failed: 0 };

  function fail(label, message) {
    counts.failed++;
    echo`${ red('FAIL') } ${ cyan(label) }${ message ? ` :: ${ message }` : '' }`;
  }

  function pass() {
    counts.passed++;
  }

  function check(label, actual, expected) {
    if (actual === expected) return pass();
    fail(label, `got ${ JSON.stringify(actual) }, want ${ JSON.stringify(expected) }`);
  }

  function checkTruthy(label, value, message = 'expected truthy') {
    if (value) return pass();
    fail(label, `${ message }, got ${ JSON.stringify(value) }`);
  }

  function checkDeep(label, actual, expected) {
    const a = JSON.stringify(actual);
    const e = JSON.stringify(expected);
    if (a === e) return pass();
    fail(label, `got ${ a }, want ${ e }`);
  }

  // asserts `fn` throws with message containing `expectedSubstring`. Substring match keeps
  // tests decoupled from full error-message minutiae (formatReceived rendering etc.)
  function throwsWith(label, fn, expectedSubstring) {
    try {
      fn();
    } catch (error) {
      if (typeof error.message === 'string' && error.message.includes(expectedSubstring)) return pass();
      return fail(label, `threw "${ error.message }", expected substring "${ expectedSubstring }"`);
    }
    fail(label, 'did not throw');
  }

  function doesNotThrow(label, fn) {
    try {
      fn();
      pass();
    } catch (error) {
      fail(label, `unexpected throw: ${ error.message }`);
    }
  }

  // run scenario against BOTH parsers; scenario is `(adapter, programPath, label) => void`.
  // `extraPlugins` is passed to babel's parser (oxc auto-enables based on file extension)
  function runBoth(label, code, scenario, extraPlugins, sourceType) {
    scenarioSource(code, { extraPlugins, label, suite: name });
    for (const adapter of adapters) {
      try {
        const programPath = adapter.parseAndScope(code, sourceType, extraPlugins);
        const before = counts.passed + counts.failed;
        scenario(adapter, programPath, `${ label } [${ adapter.name }]`);
        if (counts.passed + counts.failed === before) fail(`${ label } [${ adapter.name }]`, 'scenario made no assertions');
      } catch (error) {
        fail(`${ label } [${ adapter.name }]`, `threw: ${ error.message }`);
      }
    }
  }

  // run `extract(adapter, programPath)` against both parsers AND assert results agree
  // across adapters. `extract` returns the value to compare (deep-equal via
  // JSON.stringify - sufficient for the resolver's `{primitive, type, ctor, inner}`
  // descriptor shape and for primitives / null). This checks equality only: both
  // adapters returning null is still equal. A scenario requiring a concrete answer
  // must assert that separately. throws inside `extract` are caught and
  // reported as failures - same contract as runBoth
  function runBothAndAgree(label, code, extract, extraPlugins) {
    scenarioSource(code, { extraPlugins, label, suite: name });
    const results = [];
    for (const adapter of adapters) {
      try {
        const programPath = adapter.parseAndScope(code, undefined, extraPlugins);
        results.push({ adapter, value: extract(adapter, programPath) });
      } catch (error) {
        return fail(`${ label } [${ adapter.name }]`, `threw: ${ error.message }`);
      }
    }
    const [first, ...rest] = results;
    const firstSerialized = JSON.stringify(first.value);
    for (const { adapter, value } of rest) {
      const serialized = JSON.stringify(value);
      if (serialized !== firstSerialized) {
        return fail(label, `[${ first.adapter.name }] ${ firstSerialized } vs [${ adapter.name }] ${ serialized }`);
      }
    }
    pass();
  }

  // print summary; throw if any failures. consolidated boilerplate so suites don't repeat
  // the same `summary(name) + if (failed) throw new Error(...)` two-liner at every tail
  function finish() {
    if (counts.passed + counts.failed === 0) fail(name, 'suite made no assertions');
    echo(`${ cyan(name) }: ${ green(counts.passed) } passed, ${ counts.failed ? red(counts.failed) : green(counts.failed) } failed`);
    if (counts.failed) throw new Error(`${ name }: ${ counts.failed } failed`);
  }

  return { check, checkDeep, checkTruthy, doesNotThrow, fail, finish, pass, runBoth, runBothAndAgree, throwsWith };
}

// the `resolvePure` of a suite that asks the detection what it claims, not what it emits: every global and static
// the rows read is served by the build, as pure serves it
export function resolvePure(meta) {
  return { kind: meta.kind === 'global' ? 'global' : 'static' };
}
