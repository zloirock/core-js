// Cross-parser tests for `scanExistingCoreJSImports`, the pre-pass that recognises core-js imports
// the source already carries. Everything it misses is injected a second time, so the interesting
// cases are the SPELLINGS: a bare specifier, the same one with its `.js`, and the resolved file path
// the injector itself emits under `absoluteImports` - a re-scan blind to that last one duplicates
// every import it wrote.
import { scanExistingCoreJSImports } from '../../packages/core-js-polyfill-provider/detect-usage/entries.js';
import { createChecker } from './harness.mjs';

const { check, finish, runBoth } = createChecker('existing-imports');

// the scanner asks its adapter one thing on this path - the literal behind a specifier - and the
// two dialects spell that literal differently, so the stub answers for BOTH: the parse under test
// is still the real one from each parser
const literalAdapter = {
  packages: ['core-js'],
  getStringValue: node => (node?.type === 'StringLiteral' || node?.type === 'Literal')
    && typeof node.value === 'string' ? node.value : null,
  isStringLiteral: node => (node?.type === 'StringLiteral' || node?.type === 'Literal')
    && typeof node.value === 'string',
  hasBinding: () => false,
  getBindingIdentifier: () => null,
};

function scanGlobals(adapter, programPath) {
  const found = [];
  scanExistingCoreJSImports(programPath.node, {
    packages: ['core-js'],
    pkg: 'core-js',
    mode: 'actual',
    adapter: literalAdapter,
    onGlobalImport: entry => found.push(entry),
  });
  return found;
}

runBoth('bare module specifier', 'import "core-js/modules/es.array.at";', (adapter, prog, lbl) => {
  check(lbl, scanGlobals(adapter, prog).join(','), 'es.array.at');
});

runBoth('module specifier with its extension', 'import "core-js/modules/es.array.at.js";', (adapter, prog, lbl) => {
  check(lbl, scanGlobals(adapter, prog).join(','), 'es.array.at');
});

// the shape `absoluteImports` emits: the package is a path SEGMENT, not the start of the specifier
runBoth('resolved absolute path', 'import "/home/u/app/node_modules/core-js/modules/es.array.at.js";',
  (adapter, prog, lbl) => {
    check(lbl, scanGlobals(adapter, prog).join(','), 'es.array.at');
  });

runBoth('resolved absolute path, require style',
  'require("/home/u/app/node_modules/core-js/modules/es.array.at.js");', (adapter, prog, lbl) => {
    check(lbl, scanGlobals(adapter, prog).join(','), 'es.array.at');
  });

// a WINDOWS path normalizes to forward slashes before the match
runBoth('resolved windows path', 'import "C:/app/node_modules/core-js/modules/es.array.at.js";',
  (adapter, prog, lbl) => {
    check(lbl, scanGlobals(adapter, prog).join(','), 'es.array.at');
  });

// NEGATIVE: a path segment that only LOOKS like the package keeps its own sub-path rules - the
// entry still has to sit under `modules/`
runBoth('absolute path outside modules', 'import "/home/u/app/node_modules/core-js/internals/an-object.js";',
  (adapter, prog, lbl) => {
    check(lbl, scanGlobals(adapter, prog).join(','), '');
  });

// NEGATIVE: another package that merely ends with the same segment name
runBoth('foreign package with a core-js-shaped tail', 'import "/home/u/app/not-core-js/modules/es.array.at.js";',
  (adapter, prog, lbl) => {
    check(lbl, scanGlobals(adapter, prog).join(','), '');
  });

// the PURE half of the same scan: a default-import binding maps to its entry, and the same
// absolute spelling the injector emits under `absoluteImports` has to map to it too
function scanPure(adapter, programPath) {
  const found = [];
  scanExistingCoreJSImports(programPath.node, {
    packages: ['@core-js/pure'],
    pkg: '@core-js/pure',
    mode: 'actual',
    adapter: literalAdapter,
    onPureImport: (entry, name) => found.push(`${ entry }=${ name }`),
  });
  return found;
}

runBoth('pure default import, bare specifier',
  'import _at from "@core-js/pure/actual/array/instance/at";', (adapter, prog, lbl) => {
    check(lbl, scanPure(adapter, prog).join(','), 'array/instance/at=_at');
  });

runBoth('pure default import, resolved absolute path',
  'import _at from "/home/u/app/node_modules/@core-js/pure/actual/array/instance/at.js";', (adapter, prog, lbl) => {
    check(lbl, scanPure(adapter, prog).join(','), 'array/instance/at=_at');
  });

runBoth('pure require binding, resolved absolute path',
  'var _at = require("/home/u/app/node_modules/@core-js/pure/actual/array/instance/at.js");', (adapter, prog, lbl) => {
    check(lbl, scanPure(adapter, prog).join(','), 'array/instance/at=_at');
  });

// the TS `import X = require(...)` shape tsc / esbuild emit for the same pure import
runBoth('pure TS import-equals, resolved absolute path',
  'import _at = require("/home/u/app/node_modules/@core-js/pure/actual/array/instance/at.js");',
  (adapter, prog, lbl) => {
    check(lbl, scanPure(adapter, prog).join(','), 'array/instance/at=_at');
  }, ['typescript']);

finish();
