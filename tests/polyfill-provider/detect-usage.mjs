// Cross-parser tests for `detect-usage` helpers. Each helper accepts raw AST nodes
// + a minimal `adapter` contract (`getStringValue`, `hasBinding`); both parsers must
// produce identical results because the plugin-side adapters consume the same helpers
import {
  getEntrySource,
  scanExistingCoreJSImports,
} from '../../packages/core-js-polyfill-provider/detect-usage/entries.js';
import {
  isKnownGlobalName,
  KNOWN_FUNCTION_GLOBALS,
  KNOWN_NAMESPACE_GLOBALS,
} from '../../packages/core-js-polyfill-provider/detect-usage/globals.js';
import {
  bindsModuleDefault,
  isStaticPlacement,
  isTransparentWrapper,
  unwrapParens,
  unwrapParensCollectingEffects,
} from '../../packages/core-js-polyfill-provider/detect-usage/resolve.js';
import { resolveSymbolIteratorEntry } from '../../packages/core-js-polyfill-provider/detect-usage/members.js';
import {
  isTypeAnnotationNodeType,
  walkTypeAnnotationGlobals,
} from '../../packages/core-js-polyfill-provider/detect-usage/annotations.js';
import { createChecker } from './harness.mjs';

const { check, checkDeep, checkTruthy, finish, runBoth } = createChecker('detect-usage');

// minimal adapter contract for entries helpers - both parsers store the literal value
// on `node.value` (babel's StringLiteral, oxc's Literal both work)
const minimalAdapter = {
  isStringLiteral(node) {
    return node?.type === 'StringLiteral'
      || node?.type === 'Literal' && typeof node.value === 'string';
  },
  getStringValue(node) {
    return this.isStringLiteral(node) ? node.value : null;
  },
  hasBinding(scope, name) {
    return !!scope?.getBinding?.(name);
  },
};

// --- KNOWN_FUNCTION_GLOBALS / KNOWN_NAMESPACE_GLOBALS / isKnownGlobalName ---

check('KNOWN_FUNCTION_GLOBALS is a Set', KNOWN_FUNCTION_GLOBALS instanceof Set, true);
check('KNOWN_NAMESPACE_GLOBALS is a Set', KNOWN_NAMESPACE_GLOBALS instanceof Set, true);
check('isKnownGlobalName/Promise', isKnownGlobalName('Promise'), true);
check('isKnownGlobalName/Symbol', isKnownGlobalName('Symbol'), true);
check('isKnownGlobalName/Math', isKnownGlobalName('Math'), true);
check('isKnownGlobalName/notAGlobal', isKnownGlobalName('notAGlobal_xyz'), false);

// --- getEntrySource ---

// bare side-effect import: `import 'core-js'`
runBoth('getEntrySource/bare ImportDeclaration', 'import "core-js";', (adapter, prog, lbl) => {
  const path = adapter.pickPath(prog, 'ImportDeclaration');
  check(lbl, getEntrySource(path.node, minimalAdapter, null), 'core-js');
});

// ImportDeclaration with named specifiers is NOT an entry (entry == side-effect import)
runBoth('getEntrySource/ImportDeclaration with specifiers returns null', 'import x from "core-js";', (adapter, prog, lbl) => {
  const path = adapter.pickPath(prog, 'ImportDeclaration');
  check(lbl, getEntrySource(path.node, minimalAdapter, null), null);
});

// require call: `require('core-js/actual/promise')`
runBoth('getEntrySource/require call', 'require("core-js/actual/promise");', (adapter, prog, lbl) => {
  const path = adapter.pickPath(prog, 'ExpressionStatement');
  check(lbl, getEntrySource(path.node, minimalAdapter, null), 'core-js/actual/promise');
});

// shadowed require should return null when scope binding exists
runBoth('getEntrySource/shadowed require returns null', 'function f(require) { require("core-js"); }', (adapter, prog, lbl) => {
  // pick the inner ExpressionStatement (require call inside function)
  const path = adapter.pickPath(prog, 'ExpressionStatement');
  // use the function scope's view - call expression's containing scope sees the param
  const callScope = path.scope ?? null;
  check(lbl, getEntrySource(path.node, minimalAdapter, callScope), null);
});

// template literal source: `require(`core-js/actual/promise`)` (single-quasi)
runBoth('getEntrySource/template literal source', 'require(`core-js/actual/promise`);', (adapter, prog, lbl) => {
  const path = adapter.pickPath(prog, 'ExpressionStatement');
  check(lbl, getEntrySource(path.node, minimalAdapter, null), 'core-js/actual/promise');
});

// top-level await: `await import('core-js')`
runBoth('getEntrySource/await import', 'await import("core-js");', (adapter, prog, lbl) => {
  const path = adapter.pickPath(prog, 'ExpressionStatement');
  check(lbl, getEntrySource(path.node, minimalAdapter, null), 'core-js');
});

// bare dynamic import (not awaited) returns null - intentionally ignored
runBoth('getEntrySource/bare dynamic import returns null', 'import("core-js");', (adapter, prog, lbl) => {
  const path = adapter.pickPath(prog, 'ExpressionStatement');
  check(lbl, getEntrySource(path.node, minimalAdapter, null), null);
});

// --- scanExistingCoreJSImports ---

// scans the program body for existing `core-js/modules/...` and `core-js-pure/...` imports
runBoth('scanExistingCoreJSImports/finds global module import', 'import "core-js/modules/es.array.at"; const x = 1;', (adapter, prog, lbl) => {
  const globals = [];
  scanExistingCoreJSImports(prog.node, {
    packages: ['core-js'],
    pkg: 'core-js',
    mode: 'usage-global',
    adapter: minimalAdapter,
    onGlobalImport: name => globals.push(name),
  });
  checkDeep(lbl, globals, ['es.array.at']);
});

// `mode` is the entry namespace (`actual` / `stable` / `es` / `full` / `proposals`),
// not the method name. `core-js-pure/actual/promise` matches mode=`actual`
runBoth('scanExistingCoreJSImports/finds pure import (named binding)', 'import promise from "core-js-pure/actual/promise"; const x = promise;', (adapter, prog, lbl) => {
  const pures = [];
  scanExistingCoreJSImports(prog.node, {
    packages: ['core-js-pure'],
    pkg: 'core-js-pure',
    mode: 'actual',
    adapter: minimalAdapter,
    onPureImport: (entry, name) => pures.push({ entry, name }),
  });
  checkTruthy(lbl, pures.length === 1 && pures[0].entry === 'promise',
    `expected entry='promise', got ${ JSON.stringify(pures) }`);
});

// no matches: ignores user imports unrelated to core-js
runBoth('scanExistingCoreJSImports/ignores foreign import', 'import "lodash";', (adapter, prog, lbl) => {
  const globals = [];
  const pures = [];
  scanExistingCoreJSImports(prog.node, {
    packages: ['core-js'],
    pkg: 'core-js',
    mode: 'usage-global',
    adapter: minimalAdapter,
    onGlobalImport: name => globals.push(name),
    onPureImport: name => pures.push(name),
  });
  checkTruthy(lbl, globals.length === 0 && pures.length === 0);
});

// --- unwrapParens ---

// babel: `(x)` produces ParenthesizedExpression around Identifier (with `createParenthesizedExpressions`)
// oxc: drops parens at parse time - tests below feed already-parsed nodes from each parser
runBoth('unwrapParens/Identifier passes through', 'x;', (adapter, prog, lbl) => {
  const path = adapter.pickPath(prog, 'Identifier');
  check(lbl, unwrapParens(path.node).type, 'Identifier');
});

// TSAsExpression wrapper (TS-AST only)
runBoth('unwrapParens/TSAsExpression peeled', 'x as number;', (adapter, prog, lbl) => {
  const path = adapter.pickPath(prog, 'TSAsExpression');
  if (!path) return; // oxc may emit differently for ts cast
  check(lbl, unwrapParens(path.node).type, 'Identifier');
});

// TSNonNullExpression wrapper
runBoth('unwrapParens/TSNonNullExpression peeled', 'x!;', (adapter, prog, lbl) => {
  const path = adapter.pickPath(prog, 'TSNonNullExpression');
  if (!path) return;
  check(lbl, unwrapParens(path.node).type, 'Identifier');
});

// TSSatisfiesExpression wrapper
runBoth('unwrapParens/TSSatisfiesExpression peeled', 'x satisfies number;', (adapter, prog, lbl) => {
  const path = adapter.pickPath(prog, 'TSSatisfiesExpression');
  if (!path) return;
  check(lbl, unwrapParens(path.node).type, 'Identifier');
});

// --- unwrapParensCollectingEffects ---

// no wrappers: returns same node, no effects collected
runBoth('unwrapParensCollectingEffects/Identifier no effects', 'x;', (adapter, prog, lbl) => {
  const path = adapter.pickPath(prog, 'Identifier');
  const effects = [];
  const inner = unwrapParensCollectingEffects(path.node, effects);
  checkTruthy(lbl, inner.type === 'Identifier' && effects.length === 0);
});

// --- bindsModuleDefault ---

// default specifier: `import X from 'm'`
runBoth('bindsModuleDefault/default specifier', 'import X from "m";', (adapter, prog, lbl) => {
  const spec = adapter.pickPath(prog, 'ImportDefaultSpecifier');
  check(lbl, bindsModuleDefault(spec.node), true);
});

// named-as-default: `import { default as X } from 'm'`
runBoth('bindsModuleDefault/named default alias', 'import { default as X } from "m";', (adapter, prog, lbl) => {
  const spec = adapter.pickPath(prog, 'ImportSpecifier');
  check(lbl, bindsModuleDefault(spec.node), true);
});

// regular named: `import { x } from 'm'` is NOT default
runBoth('bindsModuleDefault/named non-default', 'import { x } from "m";', (adapter, prog, lbl) => {
  const spec = adapter.pickPath(prog, 'ImportSpecifier');
  check(lbl, bindsModuleDefault(spec.node), false);
});

// namespace specifier: `import * as X from 'm'` is NOT default
runBoth('bindsModuleDefault/namespace specifier', 'import * as X from "m";', (adapter, prog, lbl) => {
  const spec = adapter.pickPath(prog, 'ImportNamespaceSpecifier');
  check(lbl, bindsModuleDefault(spec.node), false);
});

// --- isTransparentWrapper ---

runBoth('isTransparentWrapper/TSAsExpression', 'x as number;', (adapter, prog, lbl) => {
  const path = adapter.pickPath(prog, 'TSAsExpression');
  if (!path) return;
  check(lbl, isTransparentWrapper(path.node), true);
});

runBoth('isTransparentWrapper/Identifier (not wrapper)', 'x;', (adapter, prog, lbl) => {
  const path = adapter.pickPath(prog, 'Identifier');
  check(lbl, isTransparentWrapper(path.node), false);
});

// --- isStaticPlacement ---

// returns the string 'static' for known globals / Capitalised idents, null otherwise -
// boolean coercion would lose the explicit-vs-fallback distinction the caller uses
check('isStaticPlacement/Array (built-in)', isStaticPlacement('Array'), 'static');
check('isStaticPlacement/Object (built-in)', isStaticPlacement('Object'), 'static');
check('isStaticPlacement/Math', isStaticPlacement('Math'), 'static');
check('isStaticPlacement/Promise', isStaticPlacement('Promise'), 'static');
// capitalised but unknown -> still 'static' (fallback heuristic for class-like names)
check('isStaticPlacement/Capitalised unknown', isStaticPlacement('SomeRandomClass_xyz'), 'static');
// lowercase starts -> null (not a static placement)
check('isStaticPlacement/lowercase', isStaticPlacement('someFunction_xyz'), null);

// --- resolveSymbolIteratorEntry ---

// `Symbol.iterator` access via MemberExpression - parent context drives the entry shape.
// `obj[Symbol.iterator]` is a computed member; the helper detects it from the parent
runBoth('resolveSymbolIteratorEntry/computed access', 'obj[Symbol.iterator];', (adapter, prog, lbl) => {
  const member = adapter.pickPath(prog, 'MemberExpression', p => p.node.computed && p.node.property?.object?.name === 'Symbol');
  if (!member) return;
  const inner = member.node.property; // Symbol.iterator member-expr
  // call resolveSymbolIteratorEntry with the inner Symbol.iterator node + its parent
  checkTruthy(lbl, resolveSymbolIteratorEntry(inner, member.node) !== null);
});

// --- isTypeAnnotationNodeType ---

check('isTypeAnnotationNodeType/TSNumberKeyword', isTypeAnnotationNodeType('TSNumberKeyword'), true);
check('isTypeAnnotationNodeType/TSStringKeyword', isTypeAnnotationNodeType('TSStringKeyword'), true);
check('isTypeAnnotationNodeType/TSTypeReference', isTypeAnnotationNodeType('TSTypeReference'), true);
check('isTypeAnnotationNodeType/Identifier (not type)', isTypeAnnotationNodeType('Identifier'), false);
check('isTypeAnnotationNodeType/CallExpression (not type)', isTypeAnnotationNodeType('CallExpression'), false);

// --- walkTypeAnnotationGlobals ---

// walks `Promise<number>` reference, calls onGlobal with 'Promise' once
runBoth('walkTypeAnnotationGlobals/Promise<number>', 'const x: Promise<number> = null!;', (adapter, prog, lbl) => {
  const tsAnnotation = adapter.pickPath(prog, 'TSTypeReference');
  if (!tsAnnotation) return;
  const found = [];
  walkTypeAnnotationGlobals(tsAnnotation.node, name => found.push(name));
  checkDeep(lbl, found, ['Promise']);
});

// nested type references: Map<string, Set<number>> walks both Map and Set
runBoth('walkTypeAnnotationGlobals/nested generic', 'const x: Map<string, Set<number>> = null!;', (adapter, prog, lbl) => {
  const annotations = adapter.collectPaths(prog, 'TSTypeReference');
  if (annotations.length === 0) return;
  const [outer] = annotations;
  const found = [];
  walkTypeAnnotationGlobals(outer.node, name => found.push(name));
  // expect at least Map and Set in some order
  checkTruthy(lbl, found.includes('Map') && found.includes('Set'),
    `expected Map+Set in [${ found.join(',') }]`);
});

// Non-reference annotation (primitive): no global emitted
runBoth('walkTypeAnnotationGlobals/primitive (no global)', 'const x: number = 1;', (adapter, prog, lbl) => {
  const annotation = adapter.pickPath(prog, 'TSNumberKeyword');
  if (!annotation) return;
  const found = [];
  walkTypeAnnotationGlobals(annotation.node, name => found.push(name));
  checkDeep(lbl, found, []);
});

// fn-type signature param: `(items: Set<number>) => void` keeps its params under babel's
// `parameters` key (oxc uses `params`). a global referenced ONLY in a fn-type param must
// surface on both parsers - babel-side regression guard for the `parameters` child key
runBoth('walkTypeAnnotationGlobals/fn-type param', 'let handler: (items: Set<number>) => void;', (adapter, prog, lbl) => {
  const fnType = adapter.pickPath(prog, 'TSFunctionType');
  if (!fnType) return;
  const found = [];
  walkTypeAnnotationGlobals(fnType.node, name => found.push(name));
  checkTruthy(lbl, found.includes('Set'), `expected Set in [${ found.join(',') }]`);
});

// method-signature param inside a type literal: walks members -> method signature -> its
// `parameters`. structurally distinct host from TSFunctionType, same babel `parameters` key
runBoth('walkTypeAnnotationGlobals/method-sig param', 'let o: { run(items: Set<number>): void };', (adapter, prog, lbl) => {
  const lit = adapter.pickPath(prog, 'TSTypeLiteral');
  if (!lit) return;
  const found = [];
  walkTypeAnnotationGlobals(lit.node, name => found.push(name));
  checkTruthy(lbl, found.includes('Set'), `expected Set in [${ found.join(',') }]`);
});

finish();
