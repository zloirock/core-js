// Unit tests for `@core-js/babel-plugin/internals/import-injector.js`
// `reorderRefsAfterImports`. transpiler fixtures run core-js in ISOLATION, so they cannot
// express a SIBLING plugin's `scope.push` sharing Babel's reused per-block `var` node with
// our memoize `_ref`. this suite drives a full @babel/core transform alongside such a
// sibling so the import/first ordering contract is exercised directly.
// BABEL_REQUIRE_FROM mirrors the fixture runner's hook so the suite runs under babel@8
// (default) and babel@7 (with BABEL_REQUIRE_FROM=../babel-plugin-v7) alike.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { runInNewContext } from 'node:vm';
import ImportInjector from '../../packages/core-js-babel-plugin/internals/import-injector.js';
import estreeToBabel from '../../packages/core-js-babel-plugin/internals/estree-to-babel.js';
import { hostSlot, renderMemoActivation } from '../../packages/core-js-polyfill-provider/render.js';
import { createChecker, findNode } from '../polyfill-provider/harness.mjs';

const { BABEL_REQUIRE_FROM } = process.env;
const requireBabel = BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { transformAsync } = requireBabel('@babel/core');
const t = requireBabel('@babel/types');

const { check, checkDeep, checkTruthy, finish } = createChecker('import-injector');

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

// A scope-pushed trailing ref may become a var, while an argument-fed capture keeps
// its actual parameter. The distinction survives a sibling cloning either activation.
for (const clone of [false, true]) {
  let pushedName;
  let capturedName;
  const { ast, code } = await transformAsync('(function () { return 7; })();', {
    ast: true,
    configFile: false,
    babelrc: false,
    plugins: [() => ({
      visitor: {
        Program(programPath) {
          const injector = new ImportInjector({ t, programPath, pkg: '@core-js/pure', mode: 'actual', importStyle: 'import' });
          const pushedCall = programPath.get('body.0.expression');
          const pushedFunction = pushedCall.get('callee');
          const pushedRef = injector.generateDeclaredRef(pushedFunction.scope);
          pushedName = pushedRef.name;
          pushedFunction.node.body.body.at(-1).argument = t.assignmentExpression('=', t.cloneNode(pushedRef), t.numericLiteral(7));
          const capturedRef = injector.generateLocalRef(programPath.scope);
          capturedName = capturedRef.name;
          const capturedCall = estreeToBabel(renderMemoActivation(hostSlot(t.cloneNode(capturedRef)), [capturedName],
            [hostSlot(t.numericLiteral(9))]));
          if (clone) pushedCall.replaceWith(t.cloneNode(pushedCall.node, true));
          programPath.pushContainer('body', t.expressionStatement(t.assignmentExpression('=',
            t.memberExpression(t.identifier('module'), t.identifier('exports')),
            clone ? t.cloneNode(capturedCall, true) : capturedCall)));
          injector.normalizeArrowRefParams();
        },
      },
    })],
  });
  const capturedFunction = findNode(ast, node => node.type === 'ArrowFunctionExpression');
  check(`normalizeArrowRefParams/argument-fed capture keeps its parameter/clone=${ clone }`,
    capturedFunction.params[0]?.name, capturedName);
  const pushedFunction = findNode(ast, node => node.type === 'FunctionExpression');
  check(`normalizeArrowRefParams/scope-pushed ref leaves the parameter list/clone=${ clone }`, pushedFunction.params.length, 0);
  checkTruthy(`normalizeArrowRefParams/scope-pushed ref owns a body var/clone=${ clone }`,
    !!findNode(pushedFunction.body, node => node.type === 'VariableDeclarator' && node.id.name === pushedName));
  const module = { exports: null };
  runInNewContext(code, { module });
  check(`normalizeArrowRefParams/argument-fed capture retains its value/clone=${ clone }`, module.exports, 9);
}

// --- generateDeclaredRef: a TS parameter-property default owns its receiver memo in a lexical
// activation. A constructor-body var is invisible from the default, and an outer var is shared
// across reentrant construction. Check the actual parameter/body slots rather than printed text. ---
{
  const { ast } = await transformAsync('class C { constructor(public x = [1, 2].flat()) {} }\nnew C();', {
    ast: true,
    configFile: false,
    babelrc: false,
    parserOpts: { plugins: ['typescript'] },
    plugins: [['@core-js', { method: 'usage-pure', version: '4.0', targets: { ie: 11 } }]],
  });
  const constructor = findNode(ast, node => node.type === 'ClassMethod' && node.kind === 'constructor');
  const activation = constructor.params[0].parameter.right;
  checkTruthy('generateDeclaredRef/param-property default owns a lexical activation',
    activation.type === 'CallExpression' && activation.callee.type === 'ArrowFunctionExpression');
  const { body } = activation.callee;
  check('generateDeclaredRef/param-property default ref declared inside its activation',
    body.body[0].declarations[0].id.name, '_ref');
  checkTruthy('generateDeclaredRef/param-property default uses its local ref',
    findNode(body.body[1], node => node.type === 'Identifier' && node.name === '_ref'));
  checkTruthy('generateDeclaredRef/param-property default has no outer live ref',
    !findNode(ast.program, node => node.type === 'VariableDeclarator' && node.id.name === '_ref' && node !== body.body[0].declarations[0]));
  checkTruthy('generateDeclaredRef/param-property default ref absent from constructor body',
    !findNode(constructor.body, node => node.type === 'VariableDeclarator' && node.id.name === '_ref'));
}

// Two defaults own independent frames: each returned expression reads only the ref it declares.
{
  const { ast } = await transformAsync('class C { constructor(public a = [1].flat(), public b = [3, 1].at(0)) {} }\nnew C();', {
    ast: true,
    configFile: false,
    babelrc: false,
    parserOpts: { plugins: ['typescript'] },
    plugins: [['@core-js', { method: 'usage-pure', version: '4.0', targets: { ie: 11 } }]],
  });
  const constructor = findNode(ast, node => node.type === 'ClassMethod' && node.kind === 'constructor');
  const declarations = new Set();
  for (const [index, parameter] of constructor.params.entries()) {
    const activation = parameter.parameter.right;
    checkTruthy(`generateDeclaredRef/parameter ${ index }: owns a lexical activation`,
      activation.type === 'CallExpression' && activation.callee.type === 'ArrowFunctionExpression');
    const [declaration, returned] = activation.callee.body.body;
    const [ref] = declaration.declarations;
    declarations.add(ref);
    check(`generateDeclaredRef/parameter ${ index }: declares its own ref`, ref.id.name, index ? '_ref2' : '_ref');
    const references = new Set();
    t.traverseFast(returned, node => { if (node.type === 'Identifier' && /^_ref\d*$/.test(node.name)) references.add(node.name); });
    check(`generateDeclaredRef/parameter ${ index }: returned expression reads only its own ref`, [...references].join(','), ref.id.name);
  }
  checkTruthy('generateDeclaredRef/multiple param-property refs have no outer live declaration',
    !findNode(ast.program, node => node.type === 'VariableDeclarator' && /^_ref\d*$/.test(node.id.name) && !declarations.has(node)));
  checkTruthy('generateDeclaredRef/multiple param-property refs absent from constructor body',
    !findNode(constructor.body, node => node.type === 'VariableDeclarator' && /^_ref\d*$/.test(node.id.name)));
}

// An immutable receiver needs no memo; localization must not wrap a default with no live refs.
{
  const { ast } = await transformAsync('const items = [1]; class C { constructor(public x = items.flat()) {} }\nnew C();', {
    ast: true,
    configFile: false,
    babelrc: false,
    parserOpts: { plugins: ['typescript'] },
    plugins: [['@core-js', { method: 'usage-pure', version: '4.0', targets: { ie: 11 } }]],
  });
  const constructor = findNode(ast, node => node.type === 'ClassMethod' && node.kind === 'constructor');
  checkTruthy('generateDeclaredRef/immutable parameter receiver keeps its default expression',
    !findNode(constructor.params[0], node => node.type === 'ArrowFunctionExpression'));
  checkTruthy('generateDeclaredRef/immutable parameter receiver allocates no ref',
    !findNode(ast.program, node => node.type === 'VariableDeclarator' && /^_ref\d*$/.test(node.id.name)));
}

// --- pruneUnusedRefs: a receiver memo the emission ORPHANED (every reader re-spelled the receiver)
// leaves with its declarator when its init is inert. An effectful receiver still evaluates once,
// either in its memo or as the prefix of a mirror that no longer needs that memo ---
{
  const code = await transform(`const ev = [];
const { Array: { [(ev.push('k'), 'from')]: f },
  Object: { keys: { [(ev.push('a'.at(0)), 'bind')]: b } } } = globalThis;
use(f, b, ev);`, { siblingNames: [] });
  checkTruthy('pruneUnusedRefs/orphaned inert receiver memo dropped', !/_ref\d*\s*=\s*_globalThis\s*;/u.test(code));
}
{
  const code = await transform(`const ev = [];
const getG = () => globalThis;
const { Array: { [(ev.push('k'), 'from')]: f },
  Object: { keys: { [(ev.push('a'.at(0)), 'bind')]: b } } } = getG();
use(f, b, ev);`, { siblingNames: [] });
  checkTruthy('pruneUnusedRefs/orphaned effectful receiver evaluated once', code.match(/\bgetG\(\)/gu)?.length === 1);
}

// Final binding facts retain effects, residual patterns and loop heads after the last reader
// disappears. Unrelated source bindings are never candidates for memo cleanup.
for (const [label, source, retained, expected] of [
  ['inert', 'var MEMO = 1;', false, []],
  ['effect', 'var MEMO = effect();', true, ['effect']],
  ['getter', 'var MEMO = holder.value;', true, ['get']],
  ['reader', 'var MEMO = 1; consume(MEMO);', true, ['read:1']],
  ['writer', 'var MEMO; MEMO = 1;', true, []],
  ['pattern', 'var { value: MEMO } = holder;', true, ['get']],
  ['for-of head', 'for (var MEMO of [1]) effect();', true, ['effect']],
  ['for-in head', 'for (var MEMO in { x: 1 }) effect();', true, ['effect']],
  ['sole for-init', 'for (var MEMO = 1; false;) effect();', false, []],
  ['shared for-init', 'for (var MEMO = 1, user = effect(); false;) effect();', false, ['effect']],
]) {
  let name;
  const { ast, code } = await transformAsync(`var untouched = 7; ${ source }`, {
    ast: true,
    configFile: false,
    babelrc: false,
    plugins: [() => ({ visitor: { Program(programPath) {
      const injector = new ImportInjector({ t, programPath, pkg: '@core-js/pure', mode: 'actual', importStyle: 'import' });
      name = injector.generateLocalRef(programPath.scope).name;
      programPath.scope.rename('MEMO', name);
      injector.pruneUnusedRefs();
      check(`terminal memo/${ label }/registry`, injector.isGeneratedFamilyName(name), retained);
    } } })],
  });
  check(`terminal memo/${ label }/binding`, !!findNode(ast, node => node.type === 'Identifier' && node.name === name), retained);
  checkTruthy(`terminal memo/${ label }/source binding`, findNode(ast, node => node.type === 'Identifier' && node.name === 'untouched'));
  const effects = [];
  runInNewContext(code, {
    effect() { effects.push('effect'); return 1; },
    consume(value) { effects.push(`read:${ value }`); },
    holder: { get value() { effects.push('get'); return 1; } },
  });
  checkDeep(`terminal memo/${ label }/evaluation`, effects, expected);
}

// Later guard composition can remove the reads after signature refs were localized. Only
// the allocator's now-empty lexical activation may disappear; source arrows stay source.
for (const siblingChange of [null, 'statement', 'directive', 'clone', 'parameter']) {
  const { ast, code } = await transformAsync('function read(x = (() => "held")()) { return x; } read();', {
    ast: true,
    configFile: false,
    babelrc: false,
    plugins: [
      () => ({
        visitor: {
          Program(programPath) {
            const injector = new ImportInjector({ t, programPath, pkg: '@core-js/pure', mode: 'actual', importStyle: 'import' });
            const defaultPath = programPath.get('body.0.params.0.right');
            const sourceArrow = defaultPath.node;
            const ref = injector.generateDeclaredRef(defaultPath.scope, sourceArrow);
            defaultPath.replaceWith(t.sequenceExpression([t.assignmentExpression('=', ref, sourceArrow), ref]));
            injector.localizeVarlessRefs();
            const activation = programPath.node.body[0].params[0].right;
            const { body } = activation.callee;
            body.body.at(-1).argument = sourceArrow;
            switch (siblingChange) {
              case 'statement': body.body.splice(1, 0, t.expressionStatement(t.callExpression(t.identifier('effect'), [])));
                break;
              case 'directive': body.directives.push(t.directive(t.directiveLiteral('use strict')));
                break;
              case 'clone': activation.callee = t.cloneNode(activation.callee, true);
                break;
              case 'parameter': activation.callee.params.push(t.identifier('unused'));
            }
            injector.pruneUnusedRefs();
          },
        },
      }),
    ],
  });
  const defaultValue = ast.program.body[0].params[0].right;
  checkTruthy(`pruneUnusedRefs/dead activation ${ siblingChange ?? 'unwrapped' }`,
    siblingChange ? defaultValue.callee.body.type === 'BlockStatement' : defaultValue.callee.body.type === 'StringLiteral');
  checkTruthy(`pruneUnusedRefs/source arrow survives ${ siblingChange }`,
    findNode(defaultValue, node => node.type === 'ArrowFunctionExpression' && node.body.type === 'StringLiteral'));
  checkTruthy(`pruneUnusedRefs/dead activation ref removed ${ siblingChange }`,
    !findNode(defaultValue, node => node.type === 'VariableDeclarator'));
  let effects = 0;
  check(`pruneUnusedRefs/returned value ${ siblingChange }`, runInNewContext(code, { effect() { effects++; } }), 'held');
  check(`pruneUnusedRefs/sibling effect count ${ siblingChange }`, effects, Number(siblingChange === 'statement'));
}

// A single getter value can feed nested own helpers directly. Their callee bindings
// are immutable, so moving the value into the inner argument crosses no source read.
{
  const source = `let reads = 0;
class Source { static get A() { reads++; return [1]; } }
const { [Symbol.iterator]: { name } } = Source.A;
module.exports = [name, reads];`;
  const code = await transform(source, { siblingNames: [] });
  const original = { exports: null };
  const transformed = { exports: null };
  runInNewContext(source, { module: original });
  runInNewContext(code, { module: transformed, require: requireBabel });
  check('pruneUnusedRefs/nested helpers retain the method name', transformed.exports[0], original.exports[0]);
  check('pruneUnusedRefs/nested helpers read the source getter once', transformed.exports[1], 1);
  checkTruthy('pruneUnusedRefs/nested helpers need no receiver declaration', !/_ref\d*\s*=\s*Source\.A/u.test(code));
}

// Sibling lexical lowering changes the binding kind after the source indexes were read.
// Final memo cleanup must still see getter/key writes and writes in a pattern default.
for (const [label, source, expected] of [
  ['computed key', "let rows = [1]; module.exports = rows[(() => (rows = [2], 'at'))()](0);", 1],
  ['method getter', `let rows = ['held'];
Object.defineProperty(rows, 'at', { get() { rows = ['later']; return function (i) { return this[i]; }; } });
module.exports = rows.at(0);`, 'held'],
  ['pattern default', 'let source = { first: undefined, rows: [1] }; const { first = (source = {}, 0), rows: { at } } = source; module.exports = at.call([1], 0);', 1],
  ['completed write', "let rows = [1]; rows = [2]; function key() { return 'at'; } module.exports = rows[(key(), 'at')](0);", 2],
]) {
  const { code } = await transformAsync(source, {
    configFile: false,
    babelrc: false,
    plugins: [
      ['@core-js', { method: 'usage-pure', version: '4.0', targets: { ie: 11 } }],
      () => ({ visitor: { VariableDeclaration(path) {
        const { node, scope } = path;
        if (node.kind !== 'let') return;
        node.kind = 'var';
        for (const { id } of node.declarations) if (id.type === 'Identifier') scope.getBinding(id.name).kind = 'var';
      } } }),
    ],
  });
  const module = { exports: null };
  runInNewContext(code, { module, require: requireBabel });
  check(`sibling lexical lowering/${ label }`, module.exports, expected);
  if (label === 'completed write') checkTruthy('sibling lexical lowering/completed write needs no receiver copy', !/_ref\w*\s*=\s*rows/.test(code));
}

// Sloppy callbacks can escape through Function.caller without an explicit self reference.
// Memo cleanup must keep their receiver snapshot after the callback has already run.
for (const [label, invocation, captured = true] of [
  ['forEach function', '[0].forEach(function () { steal(); rows = ["changed"]; });'],
  ['forEach arrow', '[0].forEach(() => { steal(); rows = ["changed"]; });'],
  ['direct IIFE', '(function () { steal(); rows = ["changed"]; })();'],
  ['closed named call', 'function write() { steal(); rows = ["changed"]; } write();'],
  ['closed forwarder', '(fn => fn())(() => { steal(); rows = ["changed"]; });'],
  ['generator resume', '(function* () { steal(); rows = ["changed"]; })().next();'],
  ['discarded generator default', '(function* (value = steal()) { rows = ["changed"]; })();'],
  ['discarded async generator default', '(async function* (value = steal()) { rows = ["changed"]; })();'],
  ['strict callback', '[0].forEach(function () { "use strict"; steal(); rows = ["changed"]; });', false],
]) {
  const source = `let rows = ["held"], original = rows, saved;
function steal() { saved = steal.caller; }
${ invocation }
rows = original;
Object.defineProperty(original, "at", { get() {
  if (saved) { const value = saved(); if (value?.next) value.next(); }
  return function () { return this[0]; };
} });
module.exports = rows.at(0);`;
  const { code } = await transformAsync(source, {
    sourceType: 'script',
    configFile: false,
    babelrc: false,
    plugins: [['@core-js', { method: 'usage-pure', importStyle: 'require', version: '4.0', targets: { ie: 11 } }]],
  });
  const original = { exports: null };
  const transformed = { exports: null };
  runInNewContext(source, { module: original });
  runInNewContext(code, { module: transformed, require: requireBabel });
  check(`caller escape/${ label }/native held receiver`, original.exports, 'held');
  check(`caller escape/${ label }/transformed held receiver`, transformed.exports, original.exports);
  check(`caller escape/${ label }/receiver snapshot`, /_ref\w*\s*=\s*rows/u.test(code), captured);
}

// Discarded loop-header values need no binding, but their effects retain source order.
for (const [label, source, memberSnapshot = false] of [
  ['one claim', 'for (var { from } = (mark("init"), Array); once; once = false) trace.push(from([1])[0]);'],
  ['adjacent claims', 'for (const { from, of } = (mark("init"), Array), tail = mark("tail"); once; once = false) trace.push(from(of(1))[0]);'],
  ['two patterns', 'for (var { from } = (mark("first"), Array), { keys } = (mark("second"), Object); once; once = false) trace.push(from(keys({ x: 1 }))[0]);'],
  ['single nested leaf', 'const [{ y: { includes } }] = [holder]; trace.push(includes.call([1], 1));'],
  ['single object leaf', 'const { y: { includes } } = holder; trace.push(includes.call([1], 1));'],
  ['private defaulted slot', 'const box = { y: [1], keep: 2 }; const { y: { includes } = [], keep } = box; trace.push(includes.call([1], 1), keep);', true],
  ['private optional slot', 'const box = { y: [1] }; trace.push(box?.y.includes(1));', true],
  ['own constructor import', 'let gb, it; ({ Map: { groupBy: gb }, Symbol: { [Symbol.iterator]: it } } = globalThis.window ?? globalThis); trace.push(typeof gb, it);'],
  ['quiet optional call', 'trace.push(rows.flat?.().length);'],
]) {
  const { ast, code } = await transformAsync(source, {
    ast: true,
    configFile: false,
    babelrc: false,
    plugins: [['@core-js', { method: 'usage-pure', importStyle: 'require', version: '4.0', targets: { ie: 11 } }]],
  });
  const results = [];
  for (const program of [source, code]) {
    const trace = [];
    runInNewContext(program, {
      trace,
      once: true,
      rows: [1, [2]],
      holder: {
        get y() { trace.push('getter'); return [1]; },
      },
      mark(value) { trace.push(value); return value; },
      require: requireBabel,
    });
    results.push(JSON.stringify(trace));
  }
  check(`loop-header discarded store/${ label }/effects and values`, results[1], results[0]);
  let memberCapture = false;
  t.traverseFast(ast, node => {
    const read = node.type === 'AssignmentExpression' ? node.right : null;
    if ((read?.type === 'MemberExpression' || read?.type === 'OptionalMemberExpression')
      && read.object.name === 'box' && read.property.name === 'y') memberCapture = true;
  });
  check(`loop-header discarded store/${ label }/member snapshot`, memberCapture, memberSnapshot);
  if (memberSnapshot) {
    let reads = 0;
    t.traverseFast(ast, node => {
      if ((node.type === 'MemberExpression' || node.type === 'OptionalMemberExpression')
        && node.object.name === 'box' && node.property.name === 'y') reads++;
    });
    check(`loop-header discarded store/${ label }/one member read`, reads, 1);
  }
  checkTruthy(`loop-header discarded store/${ label }/polyfill retained`, code.includes('@core-js/pure/actual/'));
}

// A nested slot capture is already stable; later claims reuse it without copying the generated ref.
for (const [label, host, pattern, value] of [
  ['if', 'if (true)', 'other: { q }, at, includes', '[q, at.call([n], 0), includes.call([n], n)]'],
  ['while', 'while (count++ < 1)', 'more: { q }, flat, fill, find',
    '[q, flat.call([n, [n + 1]])[1], fill.call([0], n)[0], find.call([n], () => true)]'],
  ['for', 'for (let i = 0; i < 1; i++)', 'last: { q }, findLast = null, keys',
    '[q, findLast.call([n], () => true), keys.call([n]).next().value]'],
]) {
  const source = `const trace = [];
function run(n) {
  const rows = JSON.parse('[1]');
  rows.other = rows.more = rows.last = { q: n };
  const box = { get y() { trace.push(n); return rows; } };
  let count = 0;
  ${ host } var { y: { ${ pattern } } } = { y: box.y }, tail = 1;
  return [${ value }, tail];
}
module.exports = [run(4), run(9), trace];`;
  const { ast, code } = await transformAsync(source, {
    ast: true,
    configFile: false,
    babelrc: false,
    plugins: [['@core-js', { method: 'usage-pure', importStyle: 'require', version: '4.0', targets: { ie: 11 } }]],
  });
  let copies = 0;
  t.traverseFast(ast, node => {
    const left = node.type === 'VariableDeclarator' ? node.id : node.type === 'AssignmentExpression' ? node.left : null;
    const right = node.type === 'VariableDeclarator' ? node.init : node.type === 'AssignmentExpression' ? node.right : null;
    if (left?.type === 'Identifier' && right?.type === 'Identifier'
      && /^_ref\d*$/u.test(left.name) && /^_ref\d*$/u.test(right.name)) copies++;
  });
  check(`nested slot/${ label }/no copies of generated captures`, copies, 0);
  const original = { exports: null };
  const transformed = { exports: null };
  runInNewContext(source, { module: original });
  runInNewContext(code, { module: transformed, require: requireBabel });
  check(`nested slot/${ label }/values and activation-local reads`, JSON.stringify(transformed.exports), JSON.stringify(original.exports));
  checkDeep(`nested slot/${ label }/one slot read per activation`, transformed.exports[2], [4, 9]);
}

// Ordered extraction keeps both claims and reads each receiver once without an extra copy.
{
  const source = 'const a2 = [3, [4]]; let m, n; ({ y: { flat: m }, z: { flat: n } } = { y: arr, z: a2 }); module.exports = [m === selected, n.call(a2)];';
  const { code } = await transformAsync(source, {
    configFile: false,
    babelrc: false,
    plugins: [['@core-js', { method: 'usage-pure', importStyle: 'require', version: '4.0', targets: { ie: 11 } }]],
  });
  const setup = 'const trace = []; const selected = function () {}; '
    + "Object.defineProperty(globalThis, 'arr', { get() { trace.push('arr'); "
    + "return { get flat() { trace.push('flat'); return selected; } }; } });";
  for (const [leg, program] of [['native', source], ['transformed', code]]) {
    const module = { exports: null };
    runInNewContext(`${ setup }\n${ program }\nmodule.exports.push(trace);`,
      { module, require: requireBabel });
    check(`ordered assignment/${ leg }/both claims and one receiver read`, JSON.stringify(module.exports),
      JSON.stringify([true, [3, 4], ['arr', 'flat']]));
  }
  check('ordered assignment/no extra receiver capture', code.match(/_ref\d*\s*=/gu)?.length ?? 0, 0);
  check('ordered assignment/both dispatches survive', code.match(/_flatMaybeArray\(/gu)?.length, 2);
}

// Delayed literal slots must preserve global reads, early throws and native defaults.
for (const [label, source, expectedTrace, expectedValue, expectedError = null] of [
  ['free sibling', 'let m, n; ({ y: { flat: m }, z: { flat: n } } = { y: arr, z: other }); module.exports = [m === selected, n === selectedOther];',
    ['arr', 'other', 'arr.flat', 'other.flat'], [true, true]],
  ['earlier claimed sibling', 'const a2 = other; let m, n; ({ z: { flat: n }, y: { flat: m } } = { y: arr, z: a2 }); module.exports = [m === selected, n === selectedOther];',
    ['other', 'arr', 'other.flat', 'arr.flat'], [true, true]],
  ['later lexical initializer', 'let m, n; ({ y: { flat: m }, z: { flat: n } } = { y: arr, z: a2 }); const a2 = [];',
    ['arr'], null, 'ReferenceError'],
  ['sibling default', 'let m, n; ({ y: { flat: m }, z: n = fallback() } = { y: arr, z: void 0 }); module.exports = [m === selected, n];',
    ['arr', 'arr.flat', 'default'], [true, 'fallback']],
  ['this before super', 'class Base {} class Derived extends Base { constructor() { const a2 = other; let m, n; '
    + '({ y: { flat: m }, z: n } = { y: a2, z: this }); super(); } } new Derived();',
  ['other'], null, 'ReferenceError'],
]) {
  const { code } = await transformAsync(source, {
    configFile: false,
    babelrc: false,
    plugins: [['@core-js', { method: 'usage-pure', importStyle: 'require', version: '4.0', targets: { ie: 11 } }]],
  });
  const setup = "Object.defineProperty(globalThis, 'arr', { get() { trace.push('arr'); "
    + "return { get flat() { trace.push('arr.flat'); return selected; } }; } });"
    + "Object.defineProperty(globalThis, 'other', { get() { trace.push('other'); "
    + "return { get flat() { trace.push('other.flat'); return selectedOther; } }; } });"
    + "function fallback() { trace.push('default'); return 'fallback'; }";
  for (const [leg, program] of [['native', source], ['transformed', code]]) {
    const module = { exports: null };
    const trace = [];
    let error = null;
    try {
      runInNewContext(`${ setup }\n${ program }`, {
        module, trace, selected: () => 1, selectedOther: () => 2, require: requireBabel,
      });
    } catch (error_) {
      error = error_.name;
    }
    check(`ordered literal/${ label }/${ leg }/read order`, JSON.stringify(trace), JSON.stringify(expectedTrace));
    check(`ordered literal/${ label }/${ leg }/value`, JSON.stringify(module.exports), JSON.stringify(expectedValue));
    check(`ordered literal/${ label }/${ leg }/error`, error, expectedError);
  }
  check(`ordered literal/${ label }/required capture`, code.match(/_ref\d*\s*=/gu)?.length ?? 0, 1);
}

// A discarded sequence tail owns its element, keeping earlier captures and assignments live.
for (const [label, source] of [
  ['mixed claims', 'const target = {}; let name; ({ from: target.method, name } = make()); module.exports = [target.method([2])[0], typeof name, trace];'],
  ['source prefix', 'let from; (trace.push("prefix"), ({ from } = make())); module.exports = [from([2])[0], trace];'],
]) {
  const program = `const trace = []; function make() { trace.push('make'); return Array; } ${ source }`;
  const { code } = await transformAsync(program, {
    configFile: false,
    babelrc: false,
    plugins: [['@core-js', { method: 'usage-pure', importStyle: 'require', version: '4.0', targets: { ie: 11 } }]],
  });
  const original = { exports: null };
  const transformed = { exports: null };
  runInNewContext(program, { module: original });
  runInNewContext(code, { module: transformed, require: requireBabel });
  check(`discarded sequence tail/${ label }`, JSON.stringify(transformed.exports), JSON.stringify(original.exports));
  checkTruthy(`discarded sequence tail/${ label }/static claim retained`, code.includes('/actual/array/from'));
  if (label === 'mixed claims') checkTruthy('discarded sequence tail/instance claim retained', code.includes('/actual/function/instance/name'));
}

// Removing a discarded memo read must keep a shared surviving tail in the rename census.
{
  const source = 'let from, rest; const source = { w: Array, extra: 1 }; '
    + 'const held = ({ w: { from }, ...rest } = ({ w: { from }, ...rest } = source)); '
    + 'use(held === source, from([1]), rest);';
  const { code } = await transformAsync(source, {
    configFile: false,
    babelrc: false,
    plugins: [['@core-js', { method: 'usage-pure', importStyle: 'require', version: '4.0', targets: { ie: 11 } }]],
  });
  for (const [leg, program] of [['native', source], ['transformed', code]]) {
    let result;
    runInNewContext(program, {
      require: requireBabel,
      use(identity, value, rest) { result = [identity, value[0], rest.extra]; },
    });
    check(`nested assignment tail/${ leg }/identity and values`, JSON.stringify(result), '[true,1,1]');
  }
}

// A wrapper's native sibling is bound in the capture and has no separate declaration.
for (const [label, pattern, neighbour] of [
  ['mixed properties', 'at, [(log.push("key"), "flat")]: flat, length', 'log.push("rhs")'],
  ['defaulted method', '[(log.push("key"), "flat")]: flat = (log.push("default"), 0)', '7'],
  ['sole method', '[(log.push("key"), "at")]: at', '7'],
]) {
  const source = `const log = []; const [{ ${ pattern } }, neighbour] = [Array.prototype, ${ neighbour }]; `
    + 'module.exports = [neighbour, log];';
  const { code } = await transformAsync(source, {
    configFile: false,
    babelrc: false,
    plugins: [['@core-js', { method: 'usage-pure', importStyle: 'require', version: '4.0', targets: { ie: 11 } }]],
  });
  const original = { exports: null };
  const transformed = { exports: null };
  runInNewContext(source, { module: original });
  runInNewContext(code, { module: transformed, require: requireBabel });
  check(`native captured sibling/${ label }/order and binding`, JSON.stringify(transformed.exports), JSON.stringify(original.exports));
  checkTruthy(`native captured sibling/${ label }/method polyfilled`, code.includes('/actual/array/instance/'));
}

// A capture keeps the earlier guarded static beside a later instance claim.
{
  const source = 'const log = []; const list = [4, 8]; '
    + 'const known = { get w() { log.push("w"); return Object; }, get y() { log.push("y"); return list; } }; '
    + 'const [{ w: { is }, y: { at } }] = [known, log.push("rhs")]; module.exports = [is(1, 1), at.call(list, -1), log];';
  const { code } = await transformAsync(source, {
    configFile: false,
    babelrc: false,
    plugins: [['@core-js', { method: 'usage-pure', importStyle: 'require', version: '4.0', targets: { ie: 11 } }]],
  });
  const transformed = { exports: null };
  runInNewContext(code, { module: transformed, require: requireBabel });
  checkDeep('captured guarded sibling/order and values', transformed.exports, [true, 8, ['rhs', 'w', 'y']]);
  checkTruthy('captured guarded sibling/static polyfilled', code.includes('/actual/object/is'));
}

// A declared rest-exclusion sentinel uses the same import-first layout as other refs.
// A source binding with the same spelling remains the author's initialized variable.
for (const collision of [false, true]) {
  const code = await transform(`${ collision ? 'var _unused = 7;' : '' }
    let from, rest; ({ Array: { from }, ...rest } = globalThis);`, { siblingNames: [] });
  const { lastImport, firstVar } = ordering(code.split('\n'));
  checkTruthy(`rest sentinel/import precedes declaration/${ collision }`,
    lastImport !== -1 && firstVar !== -1 && lastImport < firstVar);
  checkTruthy(`rest sentinel/declared exclusion survives/${ collision }`,
    /var _unused\d*;/.test(code));
  if (collision) checkTruthy('rest sentinel/source initializer survives', /var _unused = 7;/.test(code));
}

// A mirrored receiver still owes its native assignments and nested computed-key effects.
for (const [label, key, events] of [
  ['key write', "(trace.push('key'), text = 'k', 'at')", ['rhs', 'key']],
  ['read before write', "(trace.push(text.at(0)), text = 'k', 'at')", ['rhs', 3]],
]) {
  const source = `const trace = []; let text, from, first;
({ from, prototype: { [${ key }]: first } } = (trace.push('rhs'), text = [3], Array));
module.exports = [text.at(-1), from('ab')[0], first.call([4], 0), trace];`;
  const { code } = await transformAsync(source, {
    configFile: false,
    babelrc: false,
    plugins: [['@core-js', { method: 'usage-pure', importStyle: 'require', version: '4.0', targets: { ie: 11 } }]],
  });
  const original = { exports: null };
  const transformed = { exports: null };
  runInNewContext(source, { module: original });
  runInNewContext(code, { module: transformed, require: requireBabel });
  checkDeep(`mirrored assignment/${ label }/native values and order`, original.exports, ['k', 'a', 4, events]);
  checkDeep(`mirrored assignment/${ label }/bindings, values and order`, transformed.exports, original.exports);
}

// A closed named caller resolves an escaped container member at its actual source path.
for (const [label, parameter, argument] of [
  ['default', '{ flat } = held.y', ''],
  ['supplied argument', '{ flat }', 'held.y'],
]) {
  const source = `const held = { y: [3, [4]] };
const hold = () => held;
function read(${ parameter }) { return flat.call(held.y); }
module.exports = read(${ argument });`;
  const { code } = await transformAsync(source, {
    configFile: false,
    babelrc: false,
    plugins: [['@core-js', { method: 'usage-pure', importStyle: 'require', version: '4.0', targets: { ie: 11 } }]],
  });
  const original = { exports: null };
  const transformed = { exports: null };
  runInNewContext(source, { module: original });
  runInNewContext(code, { module: transformed, require: requireBabel });
  checkDeep(`closed member receiver/${ label }/native values`, original.exports, [3, 4]);
  checkDeep(`closed member receiver/${ label }/transformed values`, transformed.exports, original.exports);
  checkTruthy(`closed member receiver/${ label }/polyfill retained`, code.includes('/actual/array/instance/flat'));
}

// A later sibling can make an already-emitted constructor need its whole entry. Its
// same binding, metadata, clone/elision state and subsequent narrow requests stay together.
for (const importStyle of ['import', 'require']) for (const shape of ['live', 'clone', 'elided']) {
  const label = `promotePureImport/${ importStyle }/${ shape }`;
  const { code } = await transformAsync('', {
    configFile: false,
    babelrc: false,
    plugins: [() => ({
      visitor: {
        Program(programPath) {
          const injector = new ImportInjector({ t, programPath, pkg: '@core-js/pure', mode: 'actual', importStyle });
          const first = injector.addPureImport('promise/constructor', 'Promise');
          injector.flush();
          const emitted = programPath.get('body.0');
          if (shape === 'clone') emitted.replaceWith(t.cloneNode(emitted.node, true));
          else if (shape === 'elided') emitted.remove();
          check(`${ label }/same local`, injector.promotePureImport?.('promise/constructor', 'promise'), first.name);
          check(`${ label }/narrow repeat`, injector.addPureImport('promise/constructor', 'Promise').name, first.name);
          check(`${ label }/whole repeat`, injector.addPureImport('promise', 'Promise').name, first.name);
          checkDeep(`${ label }/one entry`, [...injector.pureImports], [['actual/promise', first.name]]);
          check(`${ label }/source metadata`, injector.getBindingInfo(first.name).source, 'actual/promise');
          check(`${ label }/entry metadata`, injector.getBindingInfo(first.name).entry, 'promise');
          checkDeep(`${ label }/debug entry`, injector.emittedPolyfills(), ['promise']);
          injector.flush();
        },
      },
    })],
  });
  check(`${ label }/whole emitted once`, code.match(/@core-js\/pure\/actual\/promise(?=["'])/gu)?.length, 1);
  checkTruthy(`${ label }/narrow no longer emitted`, !code.includes('/promise/constructor'));
}

// A source-owned narrow import is a distinct value; promotion owns only THIS-pass imports.
await transformAsync('', {
  configFile: false,
  babelrc: false,
  plugins: [() => ({
    visitor: {
      Program(programPath) {
        const injector = new ImportInjector({ t, programPath, pkg: '@core-js/pure', mode: 'actual', importStyle: 'import' });
        injector.registerUserPureImport('promise/constructor', 'Kept');
        check('promotePureImport/source import is not owned', injector.promotePureImport?.('promise/constructor', 'promise'), null);
        check('promotePureImport/source import remains narrow', injector.getBindingInfo('Kept').entry, 'promise/constructor');
        check('promotePureImport/source dedup remains', injector.addPureImport('promise/constructor', 'Promise').name, 'Kept');
        check('promotePureImport/source import not minted', injector.pureImports.size, 0);
      },
    },
  })],
});

finish();
