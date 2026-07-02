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

// `@babel/traverse` is a CJS module re-exported as default under ESM consumption
const babelTraverse = _babelTraverse.default ?? _babelTraverse;

export const babelAdapter = {
  name: 'babel',
  parseAndScope(code, sourceType = 'module', extraPlugins = []) {
    const ast = babelParse(code, {
      sourceType,
      plugins: ['typescript', ...extraPlugins],
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
export const oxcAdapter = {
  name: 'oxc',
  // oxc auto-detects features by file extension (no extraPlugins arg - callers' plugin list is
  // babel-only). a 'script' sourceType parses sloppy-mode (Annex-B block-function hoisting); use
  // a `.js` name so oxc doesn't apply TS module rules
  parseAndScope(code, sourceType = 'module') {
    const filename = sourceType === 'script' ? 'test.js' : 'test.ts';
    // eslint-disable-next-line node/no-sync -- oxc-parser only provides sync API
    const { program } = oxcParseSync(filename, code, { sourceType });
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

// suite factory. `name` is used by `finish()` for the summary line + Error message;
// counts are per-suite so each file reports independently. `echo` / `chalk` are zx
// globals - imported modules see them on `globalThis` via the bare identifier
export function createChecker(name) {
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
    for (const adapter of adapters) {
      try {
        const programPath = adapter.parseAndScope(code, sourceType, extraPlugins);
        scenario(adapter, programPath, `${ label } [${ adapter.name }]`);
      } catch (error) {
        fail(`${ label } [${ adapter.name }]`, `threw: ${ error.message }`);
      }
    }
  }

  // run `extract(adapter, programPath)` against both parsers AND assert results agree
  // across adapters. `extract` returns the value to compare (deep-equal via
  // JSON.stringify - sufficient for the resolver's `{primitive, type, ctor, inner}`
  // Type shape and for primitives / null). designed for tolerant smoke tests where
  // per-adapter `runBoth` would let one adapter return null while the other returns a
  // Type, hiding cross-parser regressions. throws inside `extract` are caught and
  // reported as failures - same contract as runBoth
  function runBothAndAgree(label, code, extract, extraPlugins) {
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
    echo(`\n${ name }: ${ green(counts.passed) } passed, ${ counts.failed ? red(counts.failed) : green(counts.failed) } failed`);
    if (counts.failed) throw new Error(`${ name }: ${ counts.failed } failed`);
  }

  return { check, checkDeep, checkTruthy, doesNotThrow, fail, finish, pass, runBoth, runBothAndAgree, throwsWith };
}
