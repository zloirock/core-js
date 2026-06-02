// Unit tests for `@core-js/babel-plugin/internals/import-injector.js`
// `reorderRefsAfterImports`. transpiler fixtures run core-js in ISOLATION, so they cannot
// express a SIBLING plugin's `scope.push` sharing Babel's reused per-block `var` node with
// our memoize `_ref`. this suite drives a full @babel/core transform alongside such a
// sibling so the import/first ordering contract is exercised directly.
// BABEL_REQUIRE_FROM mirrors the fixture runner's hook so the suite runs under babel@7
// (default) and babel@8 (with BABEL_REQUIRE_FROM=../babel-plugin-v8) alike.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import * as nodePath from 'node:path';
import { createChecker } from '../polyfill-provider/harness.mjs';

const { BABEL_REQUIRE_FROM } = process.env;
const requireBabel = BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ nodePath.resolve(BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { transformAsync } = requireBabel('@babel/core');
const t = requireBabel('@babel/types');

const { checkTruthy, finish } = createChecker('import-injector');

// sibling plugin: pushes initless helper var(s) into the program scope during traversal.
// Babel reuses one `declaration:var:N` node per block, so these helpers land in the SAME
// `var` node core-js's memoize `_ref` occupies - the shared-node shape that
// `reorderRefsAfterImports` must migrate past the import header
function makeSiblingScopePush(names) {
  return () => ({
    visitor: {
      Program(path) {
        for (const name of names) path.scope.push({ id: t.identifier(name) });
      },
    },
  });
}

async function transform(source, { siblingNames = ['_helperVar'] } = {}) {
  const plugins = [];
  if (siblingNames.length) plugins.push(makeSiblingScopePush(siblingNames));
  plugins.push(['@core-js', { method: 'usage-pure', version: '4.0', targets: { ie: 11 } }]);
  return (await transformAsync(source, { configFile: false, babelrc: false, plugins })).code;
}

// line index of the last `import` and the first non-import `var`
function ordering(lines) {
  let lastImport = -1;
  let firstVar = -1;
  lines.forEach((line, i) => {
    if (/^\s*import\b/.test(line)) lastImport = i;
    if (firstVar === -1 && /^\s*var\b/.test(line)) firstVar = i;
  });
  return { lastImport, firstVar };
}

// --- reorderRefsAfterImports: sibling scope.push shares the ref var node ---

// the `getItems()` receiver can't be reused inline, so the `includes` rewrite memoizes it
// into a `_ref`; scope.push merges the sibling's `_helperVar` into that same reused `var`
// node, which carries `_blockHoist: 2`. the merged declaration must land AFTER the injected
// import (import/first), not above it
{
  const code = await transform("const x = getItems().includes('y');\nconst TRIGGER = 1;");
  const lines = code.split('\n');
  const { lastImport, firstVar } = ordering(lines);
  const varLine = lines.find(line => /^\s*var\b/.test(line)) ?? '';
  checkTruthy('reorderRefsAfterImports/import precedes shared ref+helper var',
    lastImport !== -1 && firstVar !== -1 && lastImport < firstVar);
  checkTruthy('reorderRefsAfterImports/our _ref survives the migration',
    varLine.includes('_ref'));
  checkTruthy('reorderRefsAfterImports/sibling _helperVar survives the migration',
    varLine.includes('_helperVar'));
}

// MULTIPLE foreign helpers merged into the shared node: every declarator stays initless and
// at least one is our ref, so the whole node migrates - all foreign helpers ride along past
// the import (the relaxed predicate is `every initless && some ref`, not exactly-one-foreign)
{
  const code = await transform("const x = getItems().includes('y');\nconst TRIGGER = 1;",
    { siblingNames: ['_helperA', '_helperB'] });
  const lines = code.split('\n');
  const { lastImport, firstVar } = ordering(lines);
  const varLine = lines.find(line => /^\s*var\b/.test(line)) ?? '';
  checkTruthy('reorderRefsAfterImports/import precedes multi-helper shared var',
    lastImport !== -1 && firstVar !== -1 && lastImport < firstVar);
  checkTruthy('reorderRefsAfterImports/both foreign helpers survive the migration',
    varLine.includes('_helperA') && varLine.includes('_helperB'));
}

// control without the sibling: the pure-ref `var _ref;` node still lands after the import
// (the shared-node relaxation must not regress the isolated shape)
{
  const code = await transform("const x = getItems().includes('y');", { siblingNames: [] });
  const { lastImport, firstVar } = ordering(code.split('\n'));
  checkTruthy('reorderRefsAfterImports/pure-ref node still lands after import',
    lastImport !== -1 && (firstVar === -1 || lastImport < firstVar));
}

finish();
