// Cross-parser tests for `detect-syntax`. The rules accept raw AST nodes - shapes must
// agree across `@babel/parser` and `oxc-parser` so plugins produce identical polyfill
// injections regardless of parser. Each rule is exercised by parsing a snippet that
// triggers it, feeding the relevant node to the rule, and asserting the recorded
// `injectModulesForModeEntry` / `injectModulesForEntry` calls match the expected set
import { createSyntaxRules } from '../../packages/core-js-polyfill-provider/detect-syntax.js';
import { createChecker } from './harness.mjs';

const { checkDeep, finish, runBoth } = createChecker('detect-syntax');

// build a rule factory with capture sinks - returns `[rules, captured]` so each scenario
// can inspect the actual injections. `isDisabled` always false so all rules fire
function makeRules({ isWebpack = false } = {}) {
  const captured = { mode: [], plain: [] };
  const rules = createSyntaxRules({
    injectModulesForModeEntry: name => captured.mode.push(name),
    injectModulesForEntry: name => captured.plain.push(name),
    isDisabled: () => false,
    isWebpack,
  });
  return { rules, captured };
}

// the sets the rules request, named as the rules name them. spelling them here rather than
// per-row is the point of the table: a row asserts WHICH shape a form resolves to, and the set
// itself is asserted once
const ITERABLE = ['symbol/constructor', 'symbol/iterator', 'array/from'];
const OBJECT_SPREAD = [
  'symbol/constructor',
  'object/get-own-property-symbols',
  'object/assign',
];
const ASYNC = ['promise/constructor', 'promise/resolve'];
const ASYNC_ITERATION = [...ASYNC, 'promise/reject', 'symbol/async-iterator'];

// --- onImportExpression ---

// babel produces `CallExpression(callee=Import)`, oxc produces `ImportExpression` -
// pick whichever the parser surfaces; the rule's behaviour doesn't depend on shape
function pickImportExpression(adapter, prog) {
  return adapter.pickPath(prog, 'ImportExpression')
    ?? adapter.pickPath(prog, 'CallExpression', p => p.node.callee?.type === 'Import');
}

runBoth('onImportExpression/non-webpack -> promise/constructor', 'import("./m");', (adapter, prog, lbl) => {
  const path = pickImportExpression(adapter, prog);
  const { rules, captured } = makeRules();
  rules.onImportExpression(path.node);
  checkDeep(lbl, captured, { mode: ['promise/constructor'], plain: [] });
});

runBoth('onImportExpression/webpack -> promise/all', 'import("./m");', (adapter, prog, lbl) => {
  const path = pickImportExpression(adapter, prog);
  const { rules, captured } = makeRules({ isWebpack: true });
  rules.onImportExpression(path.node);
  checkDeep(lbl, captured, { mode: ['promise/all'], plain: [] });
});

// --- onFunction ---

runBoth('onFunction/plain function -> no injection', 'function f() {}', (adapter, prog, lbl) => {
  const path = adapter.pickPath(prog, 'FunctionDeclaration');
  const { rules, captured } = makeRules();
  rules.onFunction(path.node);
  checkDeep(lbl, captured, { mode: [], plain: [] });
});

// an async function owes the promise even with no `await` in it: the lowering wraps the body in
// `new Promise` and resolves each step through `Promise.resolve`
runBoth('onFunction/async function -> promise', 'async function f() {}', (adapter, prog, lbl) => {
  const path = adapter.pickPath(prog, 'FunctionDeclaration');
  const { rules, captured } = makeRules();
  rules.onFunction(path.node);
  checkDeep(lbl, captured, { mode: ASYNC, plain: [] });
});

runBoth('onFunction/generator -> the iterable set', 'function* g() {}', (adapter, prog, lbl) => {
  const path = adapter.pickPath(prog, 'FunctionDeclaration');
  const { rules, captured } = makeRules();
  rules.onFunction(path.node);
  checkDeep(lbl, captured, { mode: ITERABLE, plain: [] });
});

runBoth('onFunction/async generator -> the async-iteration set', 'async function* g() {}', (adapter, prog, lbl) => {
  const path = adapter.pickPath(prog, 'FunctionDeclaration');
  const { rules, captured } = makeRules();
  rules.onFunction(path.node);
  checkDeep(lbl, captured, { mode: ASYNC_ITERATION, plain: [] });
});

// --- onAwaitExpression ---

// the await is what owes the promise, not the function around it - which is how a TOP-LEVEL await
// gets an owner at all. it had none while the rule keyed on the function node
runBoth('onAwaitExpression/top level', 'const x = await f();', (adapter, prog, lbl) => {
  const path = adapter.pickPath(prog, 'AwaitExpression');
  const { rules, captured } = makeRules();
  rules.onAwaitExpression(path.node);
  checkDeep(lbl, captured, { mode: ASYNC, plain: [] });
});

// --- onForOfStatement ---

runBoth('onForOfStatement/plain -> symbol/iterator', 'for (const x of arr) {}', (adapter, prog, lbl) => {
  const path = adapter.pickPath(prog, 'ForOfStatement');
  const { rules, captured } = makeRules();
  rules.onForOfStatement(path.node);
  checkDeep(lbl, captured, { mode: ITERABLE, plain: [] });
});

runBoth('onForOfStatement/await -> iterator + async-iterator', 'async function f() { for await (const x of arr) {} }', (adapter, prog, lbl) => {
  const path = adapter.pickPath(prog, 'ForOfStatement');
  const { rules, captured } = makeRules();
  rules.onForOfStatement(path.node);
  checkDeep(lbl, captured, { mode: [...ITERABLE, ...ASYNC_ITERATION], plain: [] });
});

// --- onArrayPattern ---

runBoth('onArrayPattern -> the iterable set', 'const [a, b] = arr;', (adapter, prog, lbl) => {
  const path = adapter.pickPath(prog, 'ArrayPattern');
  const { rules, captured } = makeRules();
  rules.onArrayPattern(path.node);
  checkDeep(lbl, captured, { mode: ITERABLE, plain: [] });
});

// a REST element makes the helper materialise the whole iterable and slice it
runBoth('onArrayPattern/rest -> the iterable set plus the slice', 'const [a, ...r] = arr;', (adapter, prog, lbl) => {
  const path = adapter.pickPath(prog, 'ArrayPattern');
  const { rules, captured } = makeRules();
  rules.onArrayPattern(path.node);
  checkDeep(lbl, captured, { mode: [...ITERABLE, 'array/slice'], plain: [] });
});

// --- onObjectPattern ---

runBoth('onObjectPattern/no rest -> no injection', 'const { a } = obj;', (adapter, prog, lbl) => {
  const path = adapter.pickPath(prog, 'ObjectPattern');
  const { rules, captured } = makeRules();
  rules.onObjectPattern(path.node);
  checkDeep(lbl, captured, { mode: [], plain: [] });
});

runBoth('onObjectPattern/rest -> the object-spread set', 'const { a, ...r } = obj;', (adapter, prog, lbl) => {
  const path = adapter.pickPath(prog, 'ObjectPattern');
  const { rules, captured } = makeRules();
  rules.onObjectPattern(path.node);
  checkDeep(lbl, captured, { mode: OBJECT_SPREAD, plain: [] });
});

// --- onSpreadElement ---

runBoth('onSpreadElement/in array -> the iterable set', 'const xs = [...src];', (adapter, prog, lbl) => {
  const path = adapter.pickPath(prog, 'SpreadElement');
  const { rules, captured } = makeRules();
  rules.onSpreadElement(path.node, path.parent.type);
  checkDeep(lbl, captured, { mode: ITERABLE, plain: [] });
});

runBoth('onSpreadElement/in call -> the iterable set', 'f(...args);', (adapter, prog, lbl) => {
  const path = adapter.pickPath(prog, 'SpreadElement');
  const { rules, captured } = makeRules();
  rules.onSpreadElement(path.node, path.parent.type);
  checkDeep(lbl, captured, { mode: ITERABLE, plain: [] });
});

runBoth('onSpreadElement/in object -> the object-spread set', 'const o = {...src};', (adapter, prog, lbl) => {
  // babel may parse object-spread as SpreadElement OR SpreadProperty depending on plugins;
  // oxc uses SpreadElement uniformly - fall back to either to satisfy both
  const path = adapter.pickPath(prog, 'SpreadElement')
    ?? adapter.pickPath(prog, 'SpreadProperty');
  if (!path) return;
  const { rules, captured } = makeRules();
  rules.onSpreadElement(path.node, path.parent.type);
  checkDeep(lbl, captured, { mode: OBJECT_SPREAD, plain: [] });
});

// --- onYieldExpression ---

runBoth('onYieldExpression/non-delegate -> no injection', 'function* g() { yield 1; }', (adapter, prog, lbl) => {
  const path = adapter.pickPath(prog, 'YieldExpression');
  const { rules, captured } = makeRules();
  rules.onYieldExpression(path.node);
  checkDeep(lbl, captured, { mode: [], plain: [] });
});

runBoth('onYieldExpression/delegate -> the iterable set', 'function* g() { yield* other(); }', (adapter, prog, lbl) => {
  const path = adapter.pickPath(prog, 'YieldExpression');
  const { rules, captured } = makeRules();
  rules.onYieldExpression(path.node);
  checkDeep(lbl, captured, { mode: ITERABLE, plain: [] });
});

// --- onVariableDeclaration ---

runBoth('onVariableDeclaration/plain const -> no injection', 'const x = 1;', (adapter, prog, lbl) => {
  const path = adapter.pickPath(prog, 'VariableDeclaration');
  const { rules, captured } = makeRules();
  rules.onVariableDeclaration(path.node);
  checkDeep(lbl, captured, { mode: [], plain: [] });
});

runBoth('onVariableDeclaration/using -> dispose + suppressed-error', 'function f() { using r = res(); }', (adapter, prog, lbl) => {
  const path = adapter.pickPath(prog, 'VariableDeclaration', p => p.node.kind === 'using');
  if (!path) return;
  const { rules, captured } = makeRules();
  rules.onVariableDeclaration(path.node);
  checkDeep(lbl, captured, { mode: ['symbol/dispose', 'suppressed-error'], plain: [] });
});

runBoth('onVariableDeclaration/await using -> async + sync dispose + suppressed', 'async function f() { await using r = res(); }', (adapter, prog, lbl) => {
  const path = adapter.pickPath(prog, 'VariableDeclaration', p => p.node.kind === 'await using');
  if (!path) return;
  const { rules, captured } = makeRules();
  rules.onVariableDeclaration(path.node);
  checkDeep(lbl, captured, { mode: ['symbol/async-dispose', 'symbol/dispose', 'suppressed-error'], plain: [] });
});

// --- onClass ---

runBoth('onClass/plain class -> no injection', 'class C {}', (adapter, prog, lbl) => {
  const path = adapter.pickPath(prog, 'ClassDeclaration');
  const { rules, captured } = makeRules();
  rules.onClass(path.node);
  checkDeep(lbl, captured, { mode: [], plain: [] });
});

// a decorated class triggers metadata AND the union of what every known decorator lowering's
// runtime reads - the plugin cannot know which one will consume the decorators, and cannot verify
// an option that claimed one. babel's parser needs `decorators-legacy` named explicitly, oxc
// auto-enables decorators for `.ts`. the metadata pair goes in as MODULES rather than through a
// mode entry, because decorator-metadata is stage 2.7 and sits outside the `actual/` set
const METADATA = ['modules/esnext.function.metadata', 'modules/esnext.symbol.metadata'];
const DECORATOR_RUNTIME = [
  'symbol/for',
  'object/assign',
  'object/get-own-property-symbols',
  'map/constructor',
  'weak-map/constructor',
];

runBoth('onClass/decorated class -> metadata + the runtime union', '@dec class C {}', (adapter, prog, lbl) => {
  const path = adapter.pickPath(prog, 'ClassDeclaration');
  if (!path?.node?.decorators?.length) return;
  const { rules, captured } = makeRules();
  rules.onClass(path.node);
  checkDeep(lbl, captured, { mode: DECORATOR_RUNTIME, plain: METADATA });
}, ['decorators-legacy']);

runBoth('onClass/decorated method -> metadata + the runtime union', 'class C { @dec m() {} }', (adapter, prog, lbl) => {
  const path = adapter.pickPath(prog, 'ClassDeclaration');
  const hasDeco = path?.node?.body?.body?.some(el => el?.decorators?.length);
  if (!hasDeco) return;
  const { rules, captured } = makeRules();
  rules.onClass(path.node);
  checkDeep(lbl, captured, { mode: DECORATOR_RUNTIME, plain: METADATA });
}, ['decorators-legacy']);

// --- onRegExpLiteral ---

// a NAMED capture group (or a back-reference to one) is lowered by rebuilding the RegExp around a
// groups object and re-dispatching `Symbol.replace`; a plain literal is lowered by nothing
const NAMED_GROUP = [
  'symbol/constructor',
  'symbol/replace',
  'weak-map/constructor',
  'regexp/exec',
  'string/replace',
];

for (const [label, source, expected] of [
  ['plain literal', 'const r = /\\d+/;', []],
  ['named group', 'const r = /(?<y>\\d{4})/;', NAMED_GROUP],
  ['back-reference', 'const r = /(?<y>a)\\k<y>/;', NAMED_GROUP],
  // a `(?<=` lookbehind and a `(?<!` negative one are NOT named groups
  ['lookbehind', 'const r = /(?<=a)b/;', []],
]) {
  runBoth(`onRegExpLiteral/${ label }`, source, (adapter, prog, lbl) => {
    const path = adapter.pickPath(prog, 'RegExpLiteral') ?? adapter.pickPath(prog, 'Literal', p => !!p.node.regex);
    const { rules, captured } = makeRules();
    rules.onRegExpLiteral(path.node);
    checkDeep(lbl, captured, { mode: expected, plain: [] });
  });
}

// --- onClassMember ---

// classified by the KEY, never by the node type: the private-member node types differ across
// parsers and the key does not. a STATIC private member is lowered with `Object.defineProperty`
// alone and owes nothing - the arm exists to keep the instance sets off it
for (const [label, source, expected] of [
  ['public field', 'class C { x = 1; }', []],
  ['private field', 'class C { #x = 1; }', ['weak-map/constructor']],
  ['private method', 'class C { #m() {} }', ['weak-set/constructor']],
  ['private getter', 'class C { get #x() { return 1; } }', ['weak-map/constructor']],
  ['static private field', 'class C { static #x = 1; }', []],
  ['static private method', 'class C { static #m() {} }', []],
]) {
  runBoth(`onClassMember/${ label }`, source, (adapter, prog, lbl) => {
    const path = adapter.pickPath(prog, 'ClassDeclaration');
    const [member] = path.node.body.body;
    const { rules, captured } = makeRules();
    rules.onClassMember(member);
    checkDeep(lbl, captured, { mode: expected, plain: [] });
  });
}

// --- the JSX spreads ---

// they are ALIASES of the two spread shapes, not rules of their own: a spread attribute lowers to
// the object helper, a spread child into the element call's argument list
runBoth('onJsxSpreadAttribute -> the object-spread set', 'const el = <Foo {...props} />;', (adapter, prog, lbl) => {
  const path = adapter.pickPath(prog, 'JSXSpreadAttribute');
  const { rules, captured } = makeRules();
  rules.onJsxSpreadAttribute(path.node);
  checkDeep(lbl, captured, { mode: OBJECT_SPREAD, plain: [] });
}, ['jsx']);

// ... and NOTHING beyond it: the element call's own lowering wraps the spread in a
// `[a].concat(...)` over two plain arrays, which native `concat` handles everywhere - `array/concat`
// is the `Symbol.isConcatSpreadable` and species fix, and the ordinary argument spread does not ask
// for it either
runBoth('onJsxSpreadChild -> the iterable set, and only it', 'const el = <Foo>{...items}</Foo>;', (adapter, prog, lbl) => {
  const path = adapter.pickPath(prog, 'JSXSpreadChild');
  if (!path) return;
  const { rules, captured } = makeRules();
  rules.onJsxSpreadChild(path.node);
  checkDeep(lbl, captured, { mode: ITERABLE, plain: [] });
}, ['jsx']);

finish();
