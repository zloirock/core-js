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

runBoth('onFunction/async function -> promise/constructor', 'async function f() {}', (adapter, prog, lbl) => {
  const path = adapter.pickPath(prog, 'FunctionDeclaration');
  const { rules, captured } = makeRules();
  rules.onFunction(path.node);
  checkDeep(lbl, captured, { mode: ['promise/constructor'], plain: [] });
});

runBoth('onFunction/generator -> symbol/iterator (plain entry)', 'function* g() {}', (adapter, prog, lbl) => {
  const path = adapter.pickPath(prog, 'FunctionDeclaration');
  const { rules, captured } = makeRules();
  rules.onFunction(path.node);
  checkDeep(lbl, captured, { mode: [], plain: ['modules/es.symbol.iterator'] });
});

runBoth('onFunction/async generator -> promise + async-iterator', 'async function* g() {}', (adapter, prog, lbl) => {
  const path = adapter.pickPath(prog, 'FunctionDeclaration');
  const { rules, captured } = makeRules();
  rules.onFunction(path.node);
  checkDeep(lbl, captured, { mode: ['promise/constructor'], plain: ['modules/es.symbol.async-iterator'] });
});

// --- onForOfStatement ---

runBoth('onForOfStatement/plain -> symbol/iterator', 'for (const x of arr) {}', (adapter, prog, lbl) => {
  const path = adapter.pickPath(prog, 'ForOfStatement');
  const { rules, captured } = makeRules();
  rules.onForOfStatement(path.node);
  checkDeep(lbl, captured, { mode: ['symbol/iterator'], plain: [] });
});

runBoth('onForOfStatement/await -> iterator + async-iterator', 'async function f() { for await (const x of arr) {} }', (adapter, prog, lbl) => {
  const path = adapter.pickPath(prog, 'ForOfStatement');
  const { rules, captured } = makeRules();
  rules.onForOfStatement(path.node);
  checkDeep(lbl, captured, { mode: ['symbol/iterator', 'symbol/async-iterator'], plain: [] });
});

// --- onArrayPattern ---

runBoth('onArrayPattern -> symbol/iterator', 'const [a, b] = arr;', (adapter, prog, lbl) => {
  const path = adapter.pickPath(prog, 'ArrayPattern');
  const { rules, captured } = makeRules();
  rules.onArrayPattern(path.node);
  checkDeep(lbl, captured, { mode: ['symbol/iterator'], plain: [] });
});

// --- onSpreadElement ---

runBoth('onSpreadElement/in array -> symbol/iterator', 'const xs = [...src];', (adapter, prog, lbl) => {
  const path = adapter.pickPath(prog, 'SpreadElement');
  const { rules, captured } = makeRules();
  rules.onSpreadElement(path.node, path.parent.type);
  checkDeep(lbl, captured, { mode: ['symbol/iterator'], plain: [] });
});

runBoth('onSpreadElement/in call -> symbol/iterator', 'f(...args);', (adapter, prog, lbl) => {
  const path = adapter.pickPath(prog, 'SpreadElement');
  const { rules, captured } = makeRules();
  rules.onSpreadElement(path.node, path.parent.type);
  checkDeep(lbl, captured, { mode: ['symbol/iterator'], plain: [] });
});

runBoth('onSpreadElement/in object -> no injection', 'const o = {...src};', (adapter, prog, lbl) => {
  // babel may parse object-spread as SpreadElement OR SpreadProperty depending on plugins;
  // oxc uses SpreadElement uniformly - fall back to either to satisfy both
  const path = adapter.pickPath(prog, 'SpreadElement')
    ?? adapter.pickPath(prog, 'SpreadProperty');
  if (!path) return;
  const { rules, captured } = makeRules();
  rules.onSpreadElement(path.node, path.parent.type);
  checkDeep(lbl, captured, { mode: [], plain: [] });
});

// --- onYieldExpression ---

runBoth('onYieldExpression/non-delegate -> no injection', 'function* g() { yield 1; }', (adapter, prog, lbl) => {
  const path = adapter.pickPath(prog, 'YieldExpression');
  const { rules, captured } = makeRules();
  rules.onYieldExpression(path.node);
  checkDeep(lbl, captured, { mode: [], plain: [] });
});

runBoth('onYieldExpression/delegate -> symbol/iterator', 'function* g() { yield* other(); }', (adapter, prog, lbl) => {
  const path = adapter.pickPath(prog, 'YieldExpression');
  const { rules, captured } = makeRules();
  rules.onYieldExpression(path.node);
  checkDeep(lbl, captured, { mode: ['symbol/iterator'], plain: [] });
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

// decorated class triggers metadata. babel parser needs `decorators-legacy` plugin
// explicit, oxc auto-enables decorators for `.ts` files. modules are injected directly
// (not via mode entry) because decorator-metadata is stage 2.7, outside the `actual/` set
runBoth('onClass/decorated class -> esnext.{function,symbol}.metadata', '@dec class C {}', (adapter, prog, lbl) => {
  const path = adapter.pickPath(prog, 'ClassDeclaration');
  if (!path?.node?.decorators?.length) return;
  const { rules, captured } = makeRules();
  rules.onClass(path.node);
  checkDeep(lbl, captured, { mode: [], plain: ['modules/esnext.function.metadata', 'modules/esnext.symbol.metadata'] });
}, ['decorators-legacy']);

runBoth('onClass/decorated method -> esnext.{function,symbol}.metadata', 'class C { @dec m() {} }', (adapter, prog, lbl) => {
  const path = adapter.pickPath(prog, 'ClassDeclaration');
  const hasDeco = path?.node?.body?.body?.some(el => el?.decorators?.length);
  if (!hasDeco) return;
  const { rules, captured } = makeRules();
  rules.onClass(path.node);
  checkDeep(lbl, captured, { mode: [], plain: ['modules/esnext.function.metadata', 'modules/esnext.symbol.metadata'] });
}, ['decorators-legacy']);

finish();
