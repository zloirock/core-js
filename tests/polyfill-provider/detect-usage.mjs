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
  staticReceiverHint,
} from '../../packages/core-js-polyfill-provider/detect-usage/globals.js';
import {
  bindsModuleDefault,
  isStaticPlacement,
  isTransparentWrapper,
  resolveKey,
  returnedReceiverHasEffects,
  unwrapParens,
  unwrapParensCollectingEffects,
} from '../../packages/core-js-polyfill-provider/detect-usage/resolve.js';
import { resolveSymbolIteratorEntry } from '../../packages/core-js-polyfill-provider/detect-usage/members.js';
import {
  isTypeAnnotationNodeType,
  walkTypeAnnotationGlobals,
} from '../../packages/core-js-polyfill-provider/detect-usage/annotations.js';
import {
  BRACE_STATEMENT_HOST_TYPES,
  findFunctionScopeVarInPath,
  noReassignmentReachesUsage,
  reassignmentDominatesUsage,
  RUNTIME_BLOCK_TYPES,
  SOURCE_ORDER_STATEMENT_HOST_TYPES,
  STATEMENT_LIST_HOST_TYPES,
  varInitDominatesUsage,
} from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
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
// the injectable-globals catalogue is keyed off built-in-definitions, so newer constructor
// globals (Iterator / AsyncIterator) are recognized too - not just the legacy hardcoded sets
check('isKnownGlobalName/Iterator', isKnownGlobalName('Iterator'), true);
check('isKnownGlobalName/AsyncIterator', isKnownGlobalName('AsyncIterator'), true);

// --- staticReceiverHint (instance-method-on-static gate) ---
// constructors -> 'function': lets the resolver bail Array.prototype methods read off the
// constructor (`Array.concat`) while resolving genuine Function.prototype methods (`Array.name`)
check('staticReceiverHint/constructor', staticReceiverHint('static', 'Array'), 'function');
check('staticReceiverHint/constructor Map', staticReceiverHint('static', 'Map'), 'function');
// namespaces / proxy globals -> 'object'
check('staticReceiverHint/namespace', staticReceiverHint('static', 'Math'), 'object');
check('staticReceiverHint/proxy-global', staticReceiverHint('static', 'globalThis'), 'object');
// non-static placement carries no hint - prototype dispatch narrows by the real receiver type
check('staticReceiverHint/prototype placement', staticReceiverHint('prototype', 'Array'), null);
// value globals are not in the catalogues -> null, so `NaN.toFixed` keeps the default fold
check('staticReceiverHint/value global', staticReceiverHint('static', 'NaN'), null);
check('staticReceiverHint/unknown name', staticReceiverHint('static', 'notAGlobal_xyz'), null);
check('staticReceiverHint/missing object', staticReceiverHint('static', null), null);

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

// TS `import X = require('<pure>/<mode>/...')` - the require-style pure import tsc/esbuild emit.
// without recognising it, the `phase: 'pre+post'` post re-scan misses it and re-emits a duplicate
runBoth('scanExistingCoreJSImports/finds pure TSImportEquals require', 'import promise = require("core-js-pure/actual/promise"); const x = promise;', (adapter, prog, lbl) => {
  const pures = [];
  scanExistingCoreJSImports(prog.node, {
    packages: ['core-js-pure'],
    pkg: 'core-js-pure',
    mode: 'actual',
    adapter: minimalAdapter,
    onPureImport: (entry, name) => pures.push({ entry, name }),
  });
  checkTruthy(lbl, pures.length === 1 && pures[0].entry === 'promise' && pures[0].name === 'promise',
    `expected entry='promise' name='promise', got ${ JSON.stringify(pures) }`);
});

// a NON-pure (global side-effect) `import X = require('<pkg>/modules/...')` must still reach the
// global path - the pure-mode TSImportEquals arm only short-circuits on a pure-entry match, so a
// modules-style require falls through to `getEntrySource` -> onGlobalImport (not silently dropped)
runBoth('scanExistingCoreJSImports/global TSImportEquals require reaches onGlobalImport', 'import X = require("core-js/modules/es.array.at");', (adapter, prog, lbl) => {
  const globals = [];
  scanExistingCoreJSImports(prog.node, {
    packages: ['core-js'],
    pkg: 'core-js',
    mode: 'usage-global',
    adapter: minimalAdapter,
    onGlobalImport: mod => globals.push(mod),
  });
  checkTruthy(lbl, globals.length === 1 && globals[0] === 'es.array.at',
    `expected ['es.array.at'], got ${ JSON.stringify(globals) }`);
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

// matchEntrySubpath must `continue` (not bail) when an earlier package is a path-prefix that fails
// the sub-prefix: `core-js/` matches the source but `extra/...` isn't under `modules/`, so the later
// `core-js/extra` package - which IS a full match - must still be tried (order-independent)
runBoth('scanExistingCoreJSImports/later package matches after prefix-package sub-prefix miss', 'import "core-js/extra/modules/es.array.at";', (adapter, prog, lbl) => {
  const globals = [];
  scanExistingCoreJSImports(prog.node, {
    packages: ['core-js', 'core-js/extra'],
    pkg: 'core-js',
    mode: 'usage-global',
    adapter: minimalAdapter,
    onGlobalImport: name => globals.push(name),
  });
  checkDeep(lbl, globals, ['es.array.at']);
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

// qualified `typeof` chain through an ALL-proxy root surfaces every link: each proxy member resolves
// back to a global (`globalThis.self.Map` references globalThis AND self AND Map)
runBoth('walkTypeAnnotationGlobals/typeof all-proxy chain surfaces every link',
  'let x: typeof globalThis.self.Map;', (adapter, prog, lbl) => {
    const tq = adapter.pickPath(prog, 'TSTypeQuery');
    if (!tq) return;
    const found = [];
    walkTypeAnnotationGlobals(tq.node, name => found.push(name));
    checkTruthy(lbl, found.includes('globalThis') && found.includes('self') && found.includes('Map'),
      `expected globalThis+self+Map, got [${ found.join(',') }]`);
  });

// qualified `typeof` chain stops at the first NON-proxy segment: in `globalThis.Array.Map`, `Map` is a
// property of the non-proxy `Array`, NOT the global Map - intentionally more precise than babel-plugin's
// ReferencedIdentifier (which over-surfaces every segment). surfaces globalThis + Array, never Map
runBoth('walkTypeAnnotationGlobals/typeof non-proxy mid-chain stops at non-proxy',
  'let x: typeof globalThis.Array.Map;', (adapter, prog, lbl) => {
    const tq = adapter.pickPath(prog, 'TSTypeQuery');
    if (!tq) return;
    const found = [];
    walkTypeAnnotationGlobals(tq.node, name => found.push(name));
    checkTruthy(lbl, found.includes('globalThis') && found.includes('Array') && !found.includes('Map'),
      `expected [globalThis, Array] without Map, got [${ found.join(',') }]`);
  });

// a plain qualified TSTypeReference rooted at a proxy-global names the real global TYPE: `globalThis.Set`
// is the global Set, so surface globalThis (the proxy root) AND Set (the member it qualifies), matching
// babel's es.set.* + es.global-this. same proxy-chain precision as the typeof cases, on a type annotation
runBoth('walkTypeAnnotationGlobals/qualified proxy-global root surfaces member',
  'let x: globalThis.Set<number>;', (adapter, prog, lbl) => {
    const ref = adapter.pickPath(prog, 'TSTypeReference');
    if (!ref) return;
    const found = [];
    walkTypeAnnotationGlobals(ref.node, name => found.push(name));
    checkTruthy(lbl, found.includes('globalThis') && found.includes('Set'),
      `expected globalThis+Set, got [${ found.join(',') }]`);
  });

// a qualified TSTypeReference over a NON-proxy root is type-only: `NS.Foo` names a type inside the
// namespace NS, so neither NS nor Foo is a runtime global - stays silent (unlike a typeof query, whose
// root IS a runtime binding). guards the proxy-root gate against over-surfacing type-only namespaces
runBoth('walkTypeAnnotationGlobals/qualified type-only namespace stays silent',
  'let x: NS.Foo;', (adapter, prog, lbl) => {
    const ref = adapter.pickPath(prog, 'TSTypeReference');
    if (!ref) return;
    const found = [];
    walkTypeAnnotationGlobals(ref.node, name => found.push(name));
    checkDeep(lbl, found, []);
  });

// the proxy-chain precision applies to a plain qualified TSTypeReference too: in `globalThis.Array.Map`
// the chain breaks at the non-proxy `Array`, so `Map` is its property type - surface globalThis + Array
// but never the global Map (same precision as the typeof variant, on a type annotation)
runBoth('walkTypeAnnotationGlobals/qualified non-proxy mid-chain stops at non-proxy',
  'let x: globalThis.Array.Map<string, number>;', (adapter, prog, lbl) => {
    const ref = adapter.pickPath(prog, 'TSTypeReference');
    if (!ref) return;
    const found = [];
    walkTypeAnnotationGlobals(ref.node, name => found.push(name));
    checkTruthy(lbl, found.includes('globalThis') && found.includes('Array') && !found.includes('Map'),
      `expected [globalThis, Array] without Map, got [${ found.join(',') }]`);
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

// --- varInitDominatesUsage: usage-pure init-dominance gate, incl. outer-scope closure capture ---

// resolve the `M = <init>` declarator node + the `M.<method>` member use path from parsed source
function pickVarInit(adapter, prog, method) {
  const decl = adapter.pickPath(prog, 'VariableDeclarator', p => p.node.id?.name === 'M');
  const use = adapter.pickPath(prog, 'MemberExpression', p => p.node.property?.name === method);
  return { declaratorNode: decl?.node ?? null, usagePath: use };
}

// conditional `var` in an OUTER scope, read by a nested closure: holds the global only on the
// branch path, so it does NOT dominate - pure must bail
runBoth('varInitDominatesUsage/conditional outer var in closure -> false',
  'function f(c){ if (c) var M = Object; return () => M.fromEntries(); }', (adapter, prog, lbl) => {
    const { declaratorNode, usagePath } = pickVarInit(adapter, prog, 'fromEntries');
    check(lbl, varInitDominatesUsage({ declaratorNode, usagePath }), false);
  });

// unconditional outer var read by a closure: ran before the closure can be invoked -> dominates
runBoth('varInitDominatesUsage/unconditional outer var in closure -> true',
  'function f(){ var M = Object; return () => M.fromEntries(); }', (adapter, prog, lbl) => {
    const { declaratorNode, usagePath } = pickVarInit(adapter, prog, 'fromEntries');
    check(lbl, varInitDominatesUsage({ declaratorNode, usagePath }), true);
  });

// closure DEFINED before the outer var-init and invoked before it runs (`const g = () => M...; g();
// var M = Object`): the closure reads the hoisted-undefined value, so the init does NOT dominate -
// pure must bail (the native `undefined.fromEntries` would throw, and pure must not mask it)
runBoth('varInitDominatesUsage/closure invoked before outer var-init -> false',
  'function f(){ const g = () => M.fromEntries(); g(); var M = Object; }', (adapter, prog, lbl) => {
    const { declaratorNode, usagePath } = pickVarInit(adapter, prog, 'fromEntries');
    check(lbl, varInitDominatesUsage({ declaratorNode, usagePath }), false);
  });

// in-scope unconditional declarator preceding the use -> dominates
runBoth('varInitDominatesUsage/in-scope unconditional -> true',
  'function f(){ var M = Object; return M.fromEntries(); }', (adapter, prog, lbl) => {
    const { declaratorNode, usagePath } = pickVarInit(adapter, prog, 'fromEntries');
    check(lbl, varInitDominatesUsage({ declaratorNode, usagePath }), true);
  });

// in-scope conditional declarator, use OUTSIDE the branch -> does not dominate
runBoth('varInitDominatesUsage/in-scope conditional, use outside branch -> false',
  'function f(c){ if (c) var M = Object; M.fromEntries(); }', (adapter, prog, lbl) => {
    const { declaratorNode, usagePath } = pickVarInit(adapter, prog, 'fromEntries');
    check(lbl, varInitDominatesUsage({ declaratorNode, usagePath }), false);
  });

// in-scope conditional declarator, use INSIDE the same branch -> dominates
runBoth('varInitDominatesUsage/in-scope conditional, use inside branch -> true',
  'function f(c){ if (c) { var M = Object; M.fromEntries(); } }', (adapter, prog, lbl) => {
    const { declaratorNode, usagePath } = pickVarInit(adapter, prog, 'fromEntries');
    check(lbl, varInitDominatesUsage({ declaratorNode, usagePath }), true);
  });

// --- reassignmentDominatesUsage: usage-global reassignment-bail gate, incl. for-x head writes ---

// the reassignment site node(s) + the `M.foo()` member use path
function pickReassignUse(adapter, prog, reassignType) {
  const node = reassignType === 'AssignmentExpression'
    ? adapter.pickPath(prog, 'AssignmentExpression', p => p.node.left?.name === 'M')?.node
    : adapter.pickPath(prog, reassignType)?.node;
  const use = adapter.pickPath(prog, 'MemberExpression', p => p.node.property?.name === 'foo');
  return { reassignmentNodes: node ? [node] : [], usagePath: use };
}

// for-of head writes M only when the iterable yields, so it does NOT dominate a use after the loop
runBoth('reassignmentDominatesUsage/for-of head, use after loop -> false',
  'function f(arr){ var M = Map; for (M of arr) {} M.foo(); }', (adapter, prog, lbl) => {
    const { reassignmentNodes, usagePath } = pickReassignUse(adapter, prog, 'ForOfStatement');
    check(lbl, reassignmentDominatesUsage({ reassignmentNodes, usagePath }), false);
  });

// for-in head: same conditional-write reasoning as for-of
runBoth('reassignmentDominatesUsage/for-in head, use after loop -> false',
  'function f(o){ var M = Map; for (M in o) {} M.foo(); }', (adapter, prog, lbl) => {
    const { reassignmentNodes, usagePath } = pickReassignUse(adapter, prog, 'ForInStatement');
    check(lbl, reassignmentDominatesUsage({ reassignmentNodes, usagePath }), false);
  });

// unconditional straight-line reassignment before the use -> dominates
runBoth('reassignmentDominatesUsage/unconditional reassign -> true',
  'function f(){ var M = Map; M = Set; M.foo(); }', (adapter, prog, lbl) => {
    const { reassignmentNodes, usagePath } = pickReassignUse(adapter, prog, 'AssignmentExpression');
    check(lbl, reassignmentDominatesUsage({ reassignmentNodes, usagePath }), true);
  });

// conditional reassignment under an if -> does not dominate
runBoth('reassignmentDominatesUsage/conditional reassign -> false',
  'function f(c){ var M = Map; if (c) M = Set; M.foo(); }', (adapter, prog, lbl) => {
    const { reassignmentNodes, usagePath } = pickReassignUse(adapter, prog, 'AssignmentExpression');
    check(lbl, reassignmentDominatesUsage({ reassignmentNodes, usagePath }), false);
  });

// SHALLOW: a reassignment in an OUTER scope (the use sits in a nested closure) does NOT dominate via
// this gate, even though it unconditionally precedes the closure definition. bailing the usage-global
// init-FOLLOW on it would drop the primary key and under-inject; the dead init across a closure is
// instead pruned by preferring the reaching value in resolveKey (the climbing variant is exercised by
// the varInitDominatesUsage closure tests above)
runBoth('reassignmentDominatesUsage/cross-closure reassign stays shallow -> false',
  'function f(){ var M = Map; M = Set; return () => M.foo(); }', (adapter, prog, lbl) => {
    const { reassignmentNodes, usagePath } = pickReassignUse(adapter, prog, 'AssignmentExpression');
    check(lbl, reassignmentDominatesUsage({ reassignmentNodes, usagePath }), false);
  });

// X11: reassignmentDominatesUsage must stay SUB-CUBIC on a heavily-reassigned alias. without memoizing
// collectVarGuardsToDeclarator, every (use, write) pair re-walked the whole owner subtree -> O(U*R*N),
// seconds-to-tens-of-seconds at a few hundred reassigns/uses. this calls the helper over every use site
// and asserts a generous ceiling a cubic regression blows past (memoized is single-digit ms here; the
// un-memoized walk was ~6s at this size per the X11 measurement). also checks the decision stays correct
// at scale (every reassignment is conditional, so none dominates -> all false)
{
  const N = 250;
  let body = 'var M = Map;';
  for (let i = 0; i < N; i++) body += ` if (c${ i }) { M = G${ i }; }`;
  for (let i = 0; i < N; i++) body += ' M.foo();';
  runBoth('reassignmentDominatesUsage/heavy alias stays sub-cubic', `function f() {${ body } }`,
    (adapter, prog, lbl) => {
      const reassignmentNodes = adapter.collectPaths(prog, 'AssignmentExpression', p => p.node.left?.name === 'M')
        .map(p => p.node);
      const uses = adapter.collectPaths(prog, 'MemberExpression', p => p.node.property?.name === 'foo');
      const start = Date.now();
      let anyDominates = false;
      for (const usagePath of uses) {
        if (reassignmentDominatesUsage({ reassignmentNodes, usagePath })) anyDominates = true;
      }
      const elapsed = Date.now() - start;
      check(`${ lbl } (all conditional -> none dominates)`, anyDominates, false);
      checkTruthy(`${ lbl } (perf ${ elapsed }ms under 2500ms ceiling)`, elapsed < 2500);
    });
}

// --- noReassignmentReachesUsage: usage-pure substitute gate (mirror direction) ---

// a for-of head write before the use can run before the read -> init not provably live -> bail
runBoth('noReassignmentReachesUsage/for-of head before use -> false',
  'function f(arr){ var M = Map; for (M of arr) {} M.foo(); }', (adapter, prog, lbl) => {
    const { reassignmentNodes, usagePath } = pickReassignUse(adapter, prog, 'ForOfStatement');
    check(lbl, noReassignmentReachesUsage({ reassignmentNodes, usagePath }), false);
  });

// reassignment strictly AFTER the use can't change the read value -> init reaches unmodified
runBoth('noReassignmentReachesUsage/reassign after use -> true',
  'function f(){ var M = Map; M.foo(); M = Set; }', (adapter, prog, lbl) => {
    const { reassignmentNodes, usagePath } = pickReassignUse(adapter, prog, 'AssignmentExpression');
    check(lbl, noReassignmentReachesUsage({ reassignmentNodes, usagePath }), true);
  });

// --- returnedReceiverHasEffects: an inlined call's returned expr carries droppable side effects ---
// (the receiver value the caller resolves is excluded; only writes / SE-prefixes around it count)

// a chain-assignment return wraps the receiver in a binding write - observable, must be preserved
runBoth('returnedReceiverHasEffects/assignment -> true', 'a = Array;', (adapter, prog, lbl) => {
  check(lbl, returnedReceiverHasEffects(adapter.pickPath(prog, 'AssignmentExpression')?.node), true);
});

// an update expression (`a++`) writes its operand - observable
runBoth('returnedReceiverHasEffects/update -> true', 'a++;', (adapter, prog, lbl) => {
  check(lbl, returnedReceiverHasEffects(adapter.pickPath(prog, 'UpdateExpression')?.node), true);
});

// a sequence whose leading element has a side effect - observable
runBoth('returnedReceiverHasEffects/SE-prefixed sequence -> true', 'fn(), Array;', (adapter, prog, lbl) => {
  check(lbl, returnedReceiverHasEffects(adapter.pickPath(prog, 'SequenceExpression')?.node), true);
});

// a sequence with no side-effecting leading element (`0, Array`) bottoms out on the bare receiver
runBoth('returnedReceiverHasEffects/SE-free sequence -> false', '0, Array;', (adapter, prog, lbl) => {
  check(lbl, returnedReceiverHasEffects(adapter.pickPath(prog, 'SequenceExpression')?.node), false);
});

// a bare Identifier receiver has no own effect
runBoth('returnedReceiverHasEffects/bare identifier -> false', 'Array;', (adapter, prog, lbl) => {
  check(lbl, returnedReceiverHasEffects(adapter.pickPath(prog, 'Identifier')?.node), false);
});

// a proxy-global member receiver (`globalThis.Array`) is a read - no own effect
runBoth('returnedReceiverHasEffects/member receiver -> false', 'globalThis.Array;', (adapter, prog, lbl) => {
  check(lbl, returnedReceiverHasEffects(adapter.pickPath(prog, 'MemberExpression')?.node), false);
});

// --- findFunctionScopeVarInPath: sloppy-mode Annex-B block-function shadow ---

// pick the bare `Map` reference (the `var x = Map` init), not the block function's own id
function pickMapInit(adapter, prog) {
  return adapter.pickPath(prog, 'Identifier', p => p.node.name === 'Map'
    && p.parentPath?.node?.type === 'VariableDeclarator' && p.parentPath.node.init === p.node);
}

// sloppy script: a block-nested `function Map(){}` is function-scope-hoisted (Annex-B), so the
// outer `Map` resolves to the local function - the presence check must surface that shadow
runBoth('findFunctionScopeVarInPath/sloppy block-function shadow', '{ function Map() {} } var x = Map;', (adapter, prog, lbl) => {
  checkTruthy(lbl, findFunctionScopeVarInPath(pickMapInit(adapter, prog), 'Map'));
}, undefined, 'script');

// module (always strict): the same block function is block-scoped, so the outer `Map` IS the
// global - reporting a shadow here would suppress a legitimate polyfill (usage-global miss)
runBoth('findFunctionScopeVarInPath/strict module no shadow', '{ function Map() {} } var x = Map;', (adapter, prog, lbl) => {
  check(lbl, findFunctionScopeVarInPath(pickMapInit(adapter, prog), 'Map'), false);
});

// script with `"use strict"`: the directive restores block-scoping for the function, so the
// outer `Map` is the global again - no shadow
runBoth('findFunctionScopeVarInPath/use-strict script no shadow', '"use strict"; { function Map() {} } var x = Map;', (adapter, prog, lbl) => {
  check(lbl, findFunctionScopeVarInPath(pickMapInit(adapter, prog), 'Map'), false);
}, undefined, 'script');

// a function-SCOPED `function Map(){}` (direct child of an inner function) does NOT hoist to the
// outer scope, so an outer `Map` is still the global - the collector stops at the function boundary
runBoth('findFunctionScopeVarInPath/inner-function decl does not leak out', 'function f() { function Map() {} } var x = Map;', (adapter, prog, lbl) => {
  check(lbl, findFunctionScopeVarInPath(pickMapInit(adapter, prog), 'Map'), false);
}, undefined, 'script');

// Annex-B hoisting reaches through arbitrarily nested blocks to the function/program var scope
runBoth('findFunctionScopeVarInPath/deeply nested block-function shadow', '{ { function Map() {} } } var x = Map;', (adapter, prog, lbl) => {
  checkTruthy(lbl, findFunctionScopeVarInPath(pickMapInit(adapter, prog), 'Map'));
}, undefined, 'script');

// --- statement-host type-set lattice (canonical single source of truth, built by ADDITION) ---
check('RUNTIME_BLOCK_TYPES members (the atom)',
  [...RUNTIME_BLOCK_TYPES].sort().join(','), 'BlockStatement,StaticBlock');
// brace = runtime blocks + the TS namespace body
check('BRACE_STATEMENT_HOST_TYPES = runtime blocks + TSModuleBlock',
  [...BRACE_STATEMENT_HOST_TYPES].sort().join(','), 'BlockStatement,StaticBlock,TSModuleBlock');
// host = brace blocks + the unbraced Program
check('STATEMENT_LIST_HOST_TYPES = brace + Program',
  [...STATEMENT_LIST_HOST_TYPES].sort().join(','), 'BlockStatement,Program,StaticBlock,TSModuleBlock');
// source-order = runtime blocks + Program (the TS namespace body is excluded by intent)
check('SOURCE_ORDER_STATEMENT_HOST_TYPES = runtime blocks + Program',
  [...SOURCE_ORDER_STATEMENT_HOST_TYPES].sort().join(','), 'BlockStatement,Program,StaticBlock');

// resolveKey: a computed key whose prefix carries a side effect resolves to its tail by default
// (member-access captures the effect separately), but a caller WITHOUT an effects channel passes
// bailOnSideEffectKey to leave it unresolved - so the destructure is skipped rather than dropping
// the effect (babel) or feeding the text composer an unplaceable needle (unplugin). minimal
// resolveKey-adapter: only the string-literal contract is exercised here (both parser shapes)
const keyAdapter = {
  isStringLiteral(n) { return n.type === 'StringLiteral' || (n.type === 'Literal' && typeof n.value === 'string'); },
  getStringValue(n) { return n.value; },
  method: 'usage-pure',
};
runBoth('resolveKey/side-effecting computed key', '({ [(eff(), "from")]: x } = Array);', (adapter, prog, lbl) => {
  const seq = adapter.pickPath(prog, 'SequenceExpression').node;
  check(`${ lbl }/default peels tail`, resolveKey({ node: seq, computed: true, adapter: keyAdapter }), 'from');
  check(`${ lbl }/bailOnSideEffectKey returns null`, resolveKey({ node: seq, computed: true, adapter: keyAdapter, bailOnSideEffectKey: true }), null);
});

// a side-effect-FREE sequence key is droppable, so the flag does NOT bail it
runBoth('resolveKey/side-effect-free sequence key not bailed', '({ [(0, "from")]: x } = Array);', (adapter, prog, lbl) => {
  const seq = adapter.pickPath(prog, 'SequenceExpression').node;
  check(`${ lbl }/keeps tail under flag`, resolveKey({ node: seq, computed: true, adapter: keyAdapter, bailOnSideEffectKey: true }), 'from');
});

finish();
