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

// sibling plugin: pushes helper var(s) into the program scope during traversal. Babel reuses one
// `declaration:var:N` node per block, so these helpers land in the SAME `var` node core-js's memoize
// `_ref` occupies - the shared-node shape that `reorderRefsAfterImports` must migrate past the import
// header. a name present in `initMap` is pushed WITH an init (`scope.push({ id, init })`), making the
// shared node init-bearing (the SPLIT case: Babel keys the push slot on `declaration:kind:blockHoist`,
// so an init-bearing and an initless push at the same block/blockHoist still merge into one node)
function makeSiblingScopePush(names, initMap = {}) {
  return () => ({
    visitor: {
      Program(path) {
        for (const name of names) {
          path.scope.push(name in initMap
            ? { id: t.identifier(name), init: t.numericLiteral(initMap[name]) }
            : { id: t.identifier(name) });
        }
      },
    },
  });
}

async function transform(source, { siblingNames = ['_helperVar'], siblingInit = {} } = {}) {
  const plugins = [];
  if (siblingNames.length) plugins.push(makeSiblingScopePush(siblingNames, siblingInit));
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

// SPLIT case: a sibling scope.push WITH an init merges into our `_ref` node, so the shared
// `var _ref, _helperVar = 42;` carries an init-bearing declarator. the old `every initless`
// predicate refused to migrate the whole node, so Babel's block-hoist (`_blockHoist: 2`) lifted
// our `_ref` ABOVE the import (import/first violation). the fix SPLITS: the initless `_ref` migrates
// below the import, the init-bearing `_helperVar = 42` stays in its node (its `_blockHoist` is the
// sibling's concern). assert our ref ends up after the import header and the init is preserved
{
  const code = await transform("const x = getItems().includes('y');\nconst TRIGGER = 1;",
    { siblingInit: { _helperVar: 42 } });
  const lines = code.split('\n');
  const lastImport = lines.reduce((acc, line, i) => /^\s*import\b/.test(line) ? i : acc, -1);
  const refIdx = lines.findIndex(line => /^\s*var _ref\b/.test(line));
  checkTruthy('reorderRefsAfterImports/split: our _ref migrates below the import',
    lastImport !== -1 && refIdx > lastImport);
  checkTruthy('reorderRefsAfterImports/split: sibling init-bearing declarator preserved',
    /_helperVar\s*=\s*42/.test(code));
}

// SPLIT with MULTIPLE refs: two memoize sites allocate `_ref` + `_ref2`, both merged into the
// init-bearing shared node. the split must pull BOTH initless refs into the migrated node below the
// import while leaving the init-bearing `_helperVar = 42` behind - exercises the multi-ref pull filter
{
  const code = await transform("const x = getItems().includes('y');\nconst z = getOther().at(0);",
    { siblingInit: { _helperVar: 42 } });
  const lines = code.split('\n');
  const lastImport = lines.reduce((acc, line, i) => /^\s*import\b/.test(line) ? i : acc, -1);
  const refLineIdx = lines.findIndex(line => /^\s*var _ref\b/.test(line));
  const refLine = lines[refLineIdx] ?? '';
  checkTruthy('reorderRefsAfterImports/split-multi: both refs migrate below the import',
    lastImport !== -1 && refLineIdx > lastImport && refLine.includes('_ref') && refLine.includes('_ref2'));
  checkTruthy('reorderRefsAfterImports/split-multi: init-bearing declarator preserved',
    /_helperVar\s*=\s*42/.test(code));
}

// control without the sibling: the pure-ref `var _ref;` node still lands after the import
// (the shared-node relaxation must not regress the isolated shape)
{
  const code = await transform("const x = getItems().includes('y');", { siblingNames: [] });
  const { lastImport, firstVar } = ordering(code.split('\n'));
  checkTruthy('reorderRefsAfterImports/pure-ref node still lands after import',
    lastImport !== -1 && (firstVar === -1 || lastImport < firstVar));
}

// --- generateDeclaredRef: a memoize ref for a polyfill in a TS parameter-property default must
// hoist to an enclosing scope (visible from the parameter), NOT the constructor body. a body var is
// unreachable from a parameter default (defaults evaluate in the param scope) and ReferenceErrors
// once the parameter-property is desugared ---
{
  const { code } = await transformAsync('class C { constructor(public x = [1, 2].flat()) {} }\nnew C();', {
    configFile: false,
    babelrc: false,
    parserOpts: { plugins: ['typescript'] },
    plugins: [['@core-js', { method: 'usage-pure', version: '4.0', targets: { ie: 11 } }]],
  });
  const beforeClass = code.slice(0, code.indexOf('class C'));
  const ctorBody = code.slice(code.indexOf('constructor('));
  checkTruthy('generateDeclaredRef/param-property default ref hoists above the class', /\bvar _ref\b/.test(beforeClass));
  checkTruthy('generateDeclaredRef/param-property default ref absent from constructor body', !/\)\s*\{\s*var _ref\b/.test(ctorBody));
}

// two memoizing param-property defaults: EVERY ref must hoist above the class, none into the body
{
  const { code } = await transformAsync('class C { constructor(public a = [1].flat(), public b = [3, 1].at(0)) {} }\nnew C();', {
    configFile: false,
    babelrc: false,
    parserOpts: { plugins: ['typescript'] },
    plugins: [['@core-js', { method: 'usage-pure', version: '4.0', targets: { ie: 11 } }]],
  });
  const beforeClass = code.slice(0, code.indexOf('class C'));
  const ctorBody = code.slice(code.indexOf('constructor('));
  checkTruthy('generateDeclaredRef/multiple param-property refs all hoist above the class',
    /\b_ref\b/.test(beforeClass) && /\b_ref2\b/.test(beforeClass));
  checkTruthy('generateDeclaredRef/multiple param-property refs absent from constructor body', !/\bvar _ref/.test(ctorBody));
}

finish();
