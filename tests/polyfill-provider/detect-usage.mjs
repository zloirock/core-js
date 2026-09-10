// Cross-parser tests for `detect-usage` helpers. Each helper accepts raw AST nodes
// + a minimal `adapter` contract (`getStringValue`, `hasBinding`); both parsers must
// produce identical results because the plugin-side adapters consume the same helpers
import {
  getEntrySource,
  mayBeEntryStatement,
  scanExistingCoreJSImports,
} from '../../packages/core-js-polyfill-provider/detect-usage/entries.js';
import {
  isKnownGlobalName,
  KNOWN_FUNCTION_GLOBALS,
  KNOWN_NAMESPACE_GLOBALS,
  staticReceiverHint,
  SYMBOL_STATIC_KEYS,
} from '../../packages/core-js-polyfill-provider/detect-usage/globals.js';
import {
  asSymbolRef,
  bindingSymbolKey,
  chainReadsThroughSeal,
  bindsModuleDefault,
  descendToChainRoot,
  foldableRealmHop,
  isStaticPlacement,
  isTransparentWrapper,
  keySideEffectsOnly,
  mutationGuardKeepingHop,
  ownChainOptionalCount,
  proxyGlobalMemberCtorPureSwap,
  PROXY_HOP_VALUE_CARRIERS,
  probeRenderedReceiver,
  receiverSideEffectsOnly,
  resolveKey,
  returnedReceiverHasEffects,
  unwrapParensCollectingEffects,
  unwrapTransparentSeq,
} from '../../packages/core-js-polyfill-provider/detect-usage/resolve.js';
import {
  computedPropKeyHostsMachinery,
  isSourcedSymbolIteratorMeta,
  landRunOnDeepestBackedSpan,
  planClaimlessCallRootedNav,
  proxyRunLandingPure,
  resolveSymbolIteratorEntry,
  tagSymbolSourcedMeta,
} from '../../packages/core-js-polyfill-provider/detect-usage/members.js';
import {
  buildDestructuringInitMeta,
  collectDestructureUnionCandidates,
  prepareDestructureUnion,
  destructureAssignmentValueIsCaptured,
  destructurePatternHostPath,
  attachMemberUnionExtras,
  collectMemberUnionCandidates,
  flattenFallbackBranches,
  isConstantLiteralReceiver,
  isReReferenceableReceiver,
  isSeFreeBranchingReceiver,
  isSeFreeMemberReceiver,
  resolvePositionalElementSlot,
  staticContainerReceiverName,
} from '../../packages/core-js-polyfill-provider/detect-usage/destructure.js';
import { createClassHelpers } from '../../packages/core-js-polyfill-provider/helpers/class-walk.js';
import { hopNamesMissingAbleCtor, peelArrayWrapperPair } from '../../packages/core-js-polyfill-provider/detect-usage/destructure-plan.js';
import {
  checkTypeAnnotations,
  isTypeAnnotationNodeType,
  mutatedStaticLandingVerdict,
  annotationNameIsGlobal,
  typeOnlyImportShadows,
  walkTypeAnnotationGlobals,
} from '../../packages/core-js-polyfill-provider/detect-usage/annotations.js';
import {
  bareAssignmentPatternLeafPath,
  bindingInvisibleFromUseRegion,
  BRACE_STATEMENT_HOST_TYPES,
  catchPropRewriteObservable,
  enclosingParameterDecoratorOwner,
  enclosingParameterListOwner,
  findFunctionScopeVarDeclaratorInPath,
  findFunctionScopeVarInPath,
  findVarOwnerDeclaring,
  synthHoistedBinding,
  isForXWriteTarget,
  LET_SCOPE_HOST_TYPES,
  noReassignmentReachesUsage,
  reassignmentDominatesUsage,
  RUNTIME_BLOCK_TYPES,
  SOURCE_ORDER_STATEMENT_HOST_TYPES,
  STATEMENT_LIST_HOST_TYPES,
  TS_EXPR_WRAPPERS,
  collectFileCensus,
  ESCAPED_CTOR_REFS,
  reachingReassignmentValueNode,
  reassignmentValueEnumeration,
  varInitDominatesUsage,
} from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import {
  callPairing,
  escapedCtorReferencesReducer,
  mutationShapesReducer,
} from '../../packages/core-js-polyfill-provider/detect-usage/mutations.js';
import { parse as babelParse } from '@babel/parser';
import * as babelTypes from '@babel/types';
import { types as estreeTypes } from '../../packages/core-js-unplugin/internals/estree-compat.js';
import { babelAdapter, createChecker, findTypeNode } from './harness.mjs';

const { check, checkDeep, checkTruthy, finish, runBoth } = createChecker('detect-usage');

// collect the globals a type annotation surfaces, reaching the TS node by raw-AST descent so the
// oxc leg actually runs: estree-toolkit does not visit TS type-annotation nodes, so the old
// `pickPath('TS...') ?? return` made the oxc leg a silent no-op. a missing node throws (loud fail
// via runBoth's catch), never a vacuous skip
function annotationGlobals(prog, type) {
  const node = findTypeNode(prog.node ?? prog, type);
  if (!node) throw new Error(`no ${ type } node found`);
  const found = [];
  walkTypeAnnotationGlobals(node, name => found.push(name), annotationWalkCtx(prog));
  return found;
}

// the walk resolves a qualified chain's ROOT through the adapter (a proxy-global NAME is only the
// realm when nothing local shadows it), so the harness supplies the same two lookups the plugins'
// adapters do. a raw-AST caller (the Flow leg) passes no scope and every name reads as unbound
const annotationWalkAdapter = {
  hasBinding(scope, name) { return !!scope?.getBinding?.(name); },
  getBinding(scope, name) { return scope?.getBinding?.(name) ?? null; },
};
function annotationWalkCtx(prog) {
  return { scope: prog?.scope ?? null, adapter: annotationWalkAdapter, path: prog?.scope ? prog : null };
}

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

// `mayBeEntryStatement` is the ONE definition of the accepted-statement set, and a caller that
// pre-filters a body walk asks it instead of re-listing the types. the coupling that makes that
// safe is asserted here: whatever the predicate rejects, the resolver rejects too - so a new
// accepting arm added without widening the set fails closed in ONE place instead of reaching
// one emitter's detector and not the other's
runBoth('mayBeEntryStatement/rejected types resolve to null',
  'label: 0;\nclass C {}\nfunction f() {}\nlet v = require("core-js");\nexport const e = 1;',
  (adapter, prog, lbl) => {
    for (const type of ['LabeledStatement', 'ClassDeclaration', 'FunctionDeclaration',
      'VariableDeclaration', 'ExportNamedDeclaration']) {
      const path = adapter.pickPath(prog, type);
      if (!path) continue;
      check(`${ lbl } ${ type } predicate`, mayBeEntryStatement(path.node), false);
      check(`${ lbl } ${ type } resolver`, getEntrySource(path.node, minimalAdapter, null), null);
    }
    // and the two accepted types are exactly the ones the predicate admits
    check(`${ lbl } accepted set`, ['ImportDeclaration', 'ExpressionStatement'].every(type => mayBeEntryStatement({ type })), true);
    check(`${ lbl } nullish node`, mayBeEntryStatement(null), false);
  });

// TS `import X = require('core-js/...')` binds a value like `import X from` and `const X = require()`
// do - a binding import, never a side-effect entry: neither the predicate nor the resolver admits it
runBoth('mayBeEntryStatement/TS import-equals is a binding import, not an entry', 'x;', (adapter, prog, lbl) => {
  const [decl] = adapter.parseAndScope('import X = require("core-js/actual/array/at");', 'module', ['typescript']).node.body;
  check(`${ lbl } predicate`, mayBeEntryStatement(decl), false);
  check(`${ lbl } resolver`, getEntrySource(decl, minimalAdapter, null), null);
});

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

// the exported spelling registers the same binding: neither the wrapper nor the modifier changes
// what the name holds
runBoth('scanExistingCoreJSImports/exported pure TSImportEquals require registers', 'export import promise = require("core-js-pure/actual/promise");', (adapter, prog, lbl) => {
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

// a NON-pure `import X = require('<pkg>/modules/...')` is a binding import like `import X from
// '<pkg>/modules/...'`: not an existing global import to remove and re-emit, so it never reaches
// onGlobalImport and stays where the author wrote it, binding intact
runBoth('scanExistingCoreJSImports/global TSImportEquals require is a binding import', 'import X = require("core-js/modules/es.array.at");', (adapter, prog, lbl) => {
  const globals = [];
  scanExistingCoreJSImports(prog.node, {
    packages: ['core-js'],
    pkg: 'core-js',
    mode: 'usage-global',
    adapter: minimalAdapter,
    onGlobalImport: mod => globals.push(mod),
  });
  check(lbl, globals.length, 0);
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

// --- unwrapTransparentSeq ---

// babel: `(x)` produces ParenthesizedExpression around Identifier (with `createParenthesizedExpressions`)
// oxc: drops parens at parse time - tests below feed already-parsed nodes from each parser
runBoth('unwrapTransparentSeq/Identifier passes through', 'x;', (adapter, prog, lbl) => {
  const path = adapter.pickPath(prog, 'Identifier');
  check(lbl, unwrapTransparentSeq(path.node).type, 'Identifier');
});

// TSAsExpression wrapper - both parsers surface the cast node in the runtime tree, so a missing
// node is a loud failure (via runBoth's catch), never a silent skip
runBoth('unwrapTransparentSeq/TSAsExpression peeled', 'x as number;', (adapter, prog, lbl) => {
  const path = adapter.pickPath(prog, 'TSAsExpression');
  check(lbl, unwrapTransparentSeq(path.node).type, 'Identifier');
});

// TSNonNullExpression wrapper
runBoth('unwrapTransparentSeq/TSNonNullExpression peeled', 'x!;', (adapter, prog, lbl) => {
  const path = adapter.pickPath(prog, 'TSNonNullExpression');
  check(lbl, unwrapTransparentSeq(path.node).type, 'Identifier');
});

// TSSatisfiesExpression wrapper
runBoth('unwrapTransparentSeq/TSSatisfiesExpression peeled', 'x satisfies number;', (adapter, prog, lbl) => {
  const path = adapter.pickPath(prog, 'TSSatisfiesExpression');
  check(lbl, unwrapTransparentSeq(path.node).type, 'Identifier');
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
  check(lbl, isTransparentWrapper(path.node), true);
});

runBoth('isTransparentWrapper/Identifier (not wrapper)', 'x;', (adapter, prog, lbl) => {
  const path = adapter.pickPath(prog, 'Identifier');
  check(lbl, isTransparentWrapper(path.node), false);
});

// --- PROXY_HOP_VALUE_CARRIERS ---

// both emitters' proxy-hop collapse gates spell no carrier type of their own any more - they ask
// this set and nothing else. a type dropped here turns a value-OBSERVING carrier into a collapse
// boundary, and `{ x } = globalThis.self.Array || Set` stops throwing on a realm without `self`
// exactly where the source does. enumerate the domain member by member: a size check would pass
// any substitution
check('PROXY_HOP_VALUE_CARRIERS/SequenceExpression', PROXY_HOP_VALUE_CARRIERS.has('SequenceExpression'), true);
check('PROXY_HOP_VALUE_CARRIERS/LogicalExpression', PROXY_HOP_VALUE_CARRIERS.has('LogicalExpression'), true);
check('PROXY_HOP_VALUE_CARRIERS/ConditionalExpression', PROXY_HOP_VALUE_CARRIERS.has('ConditionalExpression'), true);
check('PROXY_HOP_VALUE_CARRIERS/ParenthesizedExpression', PROXY_HOP_VALUE_CARRIERS.has('ParenthesizedExpression'), true);
check('PROXY_HOP_VALUE_CARRIERS/ChainExpression', PROXY_HOP_VALUE_CARRIERS.has('ChainExpression'), true);
// the TS / Flow wrappers ride in through the spread, so a cast source stays gated by one list
for (const type of TS_EXPR_WRAPPERS) {
  check(`PROXY_HOP_VALUE_CARRIERS/${ type }`, PROXY_HOP_VALUE_CARRIERS.has(type), true);
}
// a member read is NOT a carrier: the gates test it on its own edge (the read must hang off the
// collapsing chain), and folding it in here would make any enclosing member look transparent
check('PROXY_HOP_VALUE_CARRIERS/MemberExpression', PROXY_HOP_VALUE_CARRIERS.has('MemberExpression'), false);
check('PROXY_HOP_VALUE_CARRIERS/CallExpression', PROXY_HOP_VALUE_CARRIERS.has('CallExpression'), false);

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
// a FOLDED computed key reaches here as an arbitrary string, and the answer licenses the name to be
// spelled as a bare member tail - so a capitalised NON-identifier is not a placement. `$` and the
// Unicode identifier classes stay accepted: the gate is identifier validity, not an ASCII word test
check('isStaticPlacement/folded well-known symbol', isStaticPlacement('Symbol.iterator'), null);
check('isStaticPlacement/dashed string key', isStaticPlacement('App-Key'), null);
check('isStaticPlacement/dotted string key', isStaticPlacement('A.b'), null);
check('isStaticPlacement/spaced string key', isStaticPlacement('A b'), null);
check('isStaticPlacement/quote in string key', isStaticPlacement("A'b"), null);
check('isStaticPlacement/newline in string key', isStaticPlacement('A\nb'), null);
check('isStaticPlacement/empty string key', isStaticPlacement(''), null);
check('isStaticPlacement/dollar in ident', isStaticPlacement('A$b'), 'static');
check('isStaticPlacement/digits in ident', isStaticPlacement('A1'), 'static');
check('isStaticPlacement/unicode continue', isStaticPlacement('Abé'), 'static');

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

// --- walkTypeAnnotationGlobals: the Flow member/param slots of the child-key table ---

// Flow is a babel-only dialect (oxc parses TS-ESTree), so these run on the babel parser alone.
// the walk must reach a global named ONLY inside a Flow object-type member or a function-type
// rest slot: babel's natural traverse covers those positions end-to-end, so a gap here is latent
// until a caller relies on the shared walk instead - which entry-global and unplugin both do
for (const [label, code, pick, expected] of [
  ['object type member', 'function f(x: { m: Map<number> }) {}',
    ast => ast.program.body[0].params[0].typeAnnotation, ['Map']],
  ['object type indexer', 'let o: { [k: string]: WeakMap<number> };',
    ast => ast.program.body[0].declarations[0].id.typeAnnotation, ['WeakMap']],
  ['object type call property', 'let o: { (a: Set<number>): void };',
    ast => ast.program.body[0].declarations[0].id.typeAnnotation, ['Set']],
  ['function type rest param', 'let h: (...args: Array<Set<number>>) => void;',
    ast => ast.program.body[0].declarations[0].id.typeAnnotation, ['Array', 'Set']],
  ['function type plain param', 'let h: (a: Set<number>) => void;',
    ast => ast.program.body[0].declarations[0].id.typeAnnotation, ['Set']],
  ['plain generic (control)', 'let h: Map<number>;',
    ast => ast.program.body[0].declarations[0].id.typeAnnotation, ['Map']],
]) {
  const found = [];
  walkTypeAnnotationGlobals(pick(babelParse(code, { sourceType: 'module', plugins: ['flow'] })),
    name => found.push(name), annotationWalkCtx(null));
  checkDeep(`walkTypeAnnotationGlobals/flow ${ label }`, found.sort(), [...expected].sort());
}

// --- reassignment enumeration: the bound name comes from the BINDING, not from the caller ---

// pattern-LHS pairing (`[K] = ['of']`) needs the declarator's bound name. two sibling resolvers used
// to spell that recovery by hand over DISJOINT binding shapes - the adapter wrap (`.node`) and the
// raw parser binding (`.path` only) - so each was blind exactly where the other saw, and the
// enumeration only worked because every production caller happened to pass `name`. omit it here: the
// pattern value must still be enumerated, on both parsers
runBoth('reachingReassignmentValueNode/pattern-LHS over a raw binding',
  "let K = 'at'; [K] = ['of']; Array[K]([1]);", (adapter, prog, lbl) => {
    const declarator = adapter.pickPath(prog, 'VariableDeclarator');
    const usage = adapter.pickPath(prog, 'MemberExpression');
    const binding = declarator.scope?.getBinding?.('K');
    if (!binding) throw new Error('no binding for K');
    check(lbl, reachingReassignmentValueNode({ binding, usagePath: usage })?.value, 'of');
  });
runBoth('reassignmentValueEnumeration/pattern-LHS without a caller-supplied name',
  "let K = 'at'; [K] = ['of']; Array[K]([1]);", (adapter, prog, lbl) => {
    const declarator = adapter.pickPath(prog, 'VariableDeclarator');
    const usage = adapter.pickPath(prog, 'MemberExpression');
    const binding = declarator.scope?.getBinding?.('K');
    if (!binding) throw new Error('no binding for K');
    const { nodes } = reassignmentValueEnumeration({ binding, usagePath: usage });
    check(lbl, nodes.map(n => n?.value).join(','), 'of');
  });

// --- receiver/key side-effect split (the `meta.sideEffects` companion field) ---

// the two accessors partition ONE list at `meta.receiverEffectCount`. the closed domain of the
// split point is {recorded, absent}: an absent count means "the producer recorded no receiver-SE",
// so the receiver half must be empty and the key half must be the whole list. a bare
// `slice(0, undefined)` inverts the receiver half into the full list and double-runs every key-SE
// at a receiver-only swap, where the surviving computed `[key]` re-evaluates them itself
const seA = { type: 'CallExpression', tag: 'a' };
const seB = { type: 'CallExpression', tag: 'b' };
checkDeep('receiverSideEffectsOnly/recorded split', receiverSideEffectsOnly(1, [seA, seB]), [seA]);
checkDeep('keySideEffectsOnly/recorded split', keySideEffectsOnly(1, [seA, seB]), [seB]);
checkDeep('receiverSideEffectsOnly/zero split', receiverSideEffectsOnly(0, [seA, seB]), []);
checkDeep('keySideEffectsOnly/zero split', keySideEffectsOnly(0, [seA, seB]), [seA, seB]);
checkDeep('receiverSideEffectsOnly/absent split', receiverSideEffectsOnly(undefined, [seA, seB]), []);
checkDeep('keySideEffectsOnly/absent split', keySideEffectsOnly(undefined, [seA, seB]), [seA, seB]);
// an empty / absent list passes through untouched on both halves
check('receiverSideEffectsOnly/no effects', receiverSideEffectsOnly(undefined, null), null);
check('keySideEffectsOnly/no effects', keySideEffectsOnly(undefined, null), null);

// --- bindingSymbolKey: only `symbol/` leaves naming a real `Symbol.<key>` static fold ---

// the catalogue path shape alone does not decide it: `symbol/constructor` default-exports the
// Symbol constructor, `symbol/description` is a side-effect-only module and `symbol/index` is the
// whole namespace, so none of the three is a `Symbol.<key>` VALUE
for (const [source, expected] of [
  ['@core-js/pure/actual/symbol/iterator', 'Symbol.iterator'],
  ['actual/symbol/async-iterator', 'Symbol.asyncIterator'],
  ['core-js-pure/es/symbol/to-string-tag.js', 'Symbol.toStringTag'],
  // statics that are methods, not well-known symbols, still hold the named static as their value
  ['actual/symbol/for', 'Symbol.for'],
  ['actual/symbol/key-for', 'Symbol.keyFor'],
  ['actual/symbol/constructor', null],
  ['actual/symbol/description', null],
  ['actual/symbol/index', null],
  // a coincidental third-party path is rejected by the package-prefix gate
  ['my-lib/symbol/iterator', null],
]) {
  check(`bindingSymbolKey/${ source }`,
    bindingSymbolKey({ node: { type: 'ImportDefaultSpecifier' }, importSource: source }), expected);
}
// every entry the statics table names is spelled kebab-case under `symbol/`; the allowlist is that
// table, so a new Symbol static becomes recognized by data, not by editing the regex
checkTruthy('SYMBOL_STATIC_KEYS covers iterator', SYMBOL_STATIC_KEYS.has('iterator'));
check('SYMBOL_STATIC_KEYS excludes constructor', SYMBOL_STATIC_KEYS.has('constructor'), false);
check('SYMBOL_STATIC_KEYS excludes description', SYMBOL_STATIC_KEYS.has('description'), false);

// --- isTypeAnnotationNodeType ---

check('isTypeAnnotationNodeType/TSNumberKeyword', isTypeAnnotationNodeType('TSNumberKeyword'), true);
check('isTypeAnnotationNodeType/TSStringKeyword', isTypeAnnotationNodeType('TSStringKeyword'), true);
check('isTypeAnnotationNodeType/TSTypeReference', isTypeAnnotationNodeType('TSTypeReference'), true);
check('isTypeAnnotationNodeType/Identifier (not type)', isTypeAnnotationNodeType('Identifier'), false);
check('isTypeAnnotationNodeType/CallExpression (not type)', isTypeAnnotationNodeType('CallExpression'), false);
// the heritage clause has three spellings across the dialects this stack parses, and a name in one
// is as much a type reference as in the others. the babel 7 spelling is the one that went missing,
// and its absence read as "an expression written inside an interface" - which erases the reference
check('isTypeAnnotationNodeType/TSInterfaceHeritage', isTypeAnnotationNodeType('TSInterfaceHeritage'), true);
check('isTypeAnnotationNodeType/TSClassImplements', isTypeAnnotationNodeType('TSClassImplements'), true);
check('isTypeAnnotationNodeType/TSExpressionWithTypeArguments', isTypeAnnotationNodeType('TSExpressionWithTypeArguments'), true);
// Flow spells the same two clauses its own way, and the census owes them the same answer
check('isTypeAnnotationNodeType/InterfaceExtends', isTypeAnnotationNodeType('InterfaceExtends'), true);
check('isTypeAnnotationNodeType/ClassImplements', isTypeAnnotationNodeType('ClassImplements'), true);

// --- walkTypeAnnotationGlobals ---

// walks `Promise<number>` reference, calls onGlobal with 'Promise' once
runBoth('walkTypeAnnotationGlobals/Promise<number>', 'const x: Promise<number> = null!;', (adapter, prog, lbl) => {
  checkDeep(lbl, annotationGlobals(prog, 'TSTypeReference'), ['Promise']);
});

// nested type references: Map<string, Set<number>> walks both Map and Set. the outermost
// TSTypeReference (Map) is reached first, and its walk descends into the inner Set
runBoth('walkTypeAnnotationGlobals/nested generic', 'const x: Map<string, Set<number>> = null!;', (adapter, prog, lbl) => {
  const found = annotationGlobals(prog, 'TSTypeReference');
  checkTruthy(lbl, found.includes('Map') && found.includes('Set'),
    `expected Map+Set in [${ found.join(',') }]`);
});

// Non-reference annotation (primitive): no global emitted
runBoth('walkTypeAnnotationGlobals/primitive (no global)', 'const x: number = 1;', (adapter, prog, lbl) => {
  checkDeep(lbl, annotationGlobals(prog, 'TSNumberKeyword'), []);
});

// qualified `typeof` chain through an ALL-proxy root surfaces every link: each proxy member resolves
// back to a global (`globalThis.self.Map` references globalThis AND self AND Map)
runBoth('walkTypeAnnotationGlobals/typeof all-proxy chain surfaces every link',
  'let x: typeof globalThis.self.Map;', (adapter, prog, lbl) => {
    const found = annotationGlobals(prog, 'TSTypeQuery');
    checkTruthy(lbl, found.includes('globalThis') && found.includes('self') && found.includes('Map'),
      `expected globalThis+self+Map, got [${ found.join(',') }]`);
  });

// qualified `typeof` chain stops at the first NON-proxy segment: in `globalThis.Array.Map`, `Map` is a
// property of the non-proxy `Array`, NOT the global Map - intentionally more precise than babel-plugin's
// ReferencedIdentifier (which over-surfaces every segment). surfaces globalThis + Array, never Map
runBoth('walkTypeAnnotationGlobals/typeof non-proxy mid-chain stops at non-proxy',
  'let x: typeof globalThis.Array.Map;', (adapter, prog, lbl) => {
    const found = annotationGlobals(prog, 'TSTypeQuery');
    checkTruthy(lbl, found.includes('globalThis') && found.includes('Array') && !found.includes('Map'),
      `expected [globalThis, Array] without Map, got [${ found.join(',') }]`);
  });

// a plain qualified TSTypeReference rooted at a proxy-global names the real global TYPE: `globalThis.Set`
// is the global Set, so surface globalThis (the proxy root) AND Set (the member it qualifies), matching
// babel's es.set.* + es.global-this. same proxy-chain precision as the typeof cases, on a type annotation
runBoth('walkTypeAnnotationGlobals/qualified proxy-global root surfaces member',
  'let x: globalThis.Set<number>;', (adapter, prog, lbl) => {
    const found = annotationGlobals(prog, 'TSTypeReference');
    checkTruthy(lbl, found.includes('globalThis') && found.includes('Set'),
      `expected globalThis+Set, got [${ found.join(',') }]`);
  });

// a qualified TSTypeReference over a NON-proxy root is type-only: `NS.Foo` names a type inside the
// namespace NS, so neither NS nor Foo is a runtime global - stays silent (unlike a typeof query, whose
// root IS a runtime binding). guards the proxy-root gate against over-surfacing type-only namespaces
runBoth('walkTypeAnnotationGlobals/qualified type-only namespace stays silent',
  'let x: NS.Foo;', (adapter, prog, lbl) => {
    checkDeep(lbl, annotationGlobals(prog, 'TSTypeReference'), []);
  });

// the proxy-chain precision applies to a plain qualified TSTypeReference too: in `globalThis.Array.Map`
// the chain breaks at the non-proxy `Array`, so `Map` is its property type - surface globalThis + Array
// but never the global Map (same precision as the typeof variant, on a type annotation)
runBoth('walkTypeAnnotationGlobals/qualified non-proxy mid-chain stops at non-proxy',
  'let x: globalThis.Array.Map<string, number>;', (adapter, prog, lbl) => {
    const found = annotationGlobals(prog, 'TSTypeReference');
    checkTruthy(lbl, found.includes('globalThis') && found.includes('Array') && !found.includes('Map'),
      `expected [globalThis, Array] without Map, got [${ found.join(',') }]`);
  });

// a LOCAL binding named like a proxy global owns the qualified chain: `const self = {...}` makes
// `self.Reflect` a member of the user's object, so no segment of it is a global. the sink's own
// per-name filter cannot answer this - it is handed the promoted segment with no chain to judge
runBoth('walkTypeAnnotationGlobals/shadowed proxy root surfaces nothing',
  'const self = { Reflect: 1 };\nlet x: self.Reflect;', (adapter, prog, lbl) => {
    checkDeep(lbl, annotationGlobals(prog, 'TSTypeReference'), []);
  });

// ... and the same shadow answers for a `typeof` query, whose root is a runtime binding: the
// promotion is off, so only the root reaches the sink (which drops it as bound)
runBoth('walkTypeAnnotationGlobals/shadowed proxy root in typeof surfaces only the root',
  'const self = { Reflect: 1 };\nlet x: typeof self.Reflect;', (adapter, prog, lbl) => {
    checkDeep(lbl, annotationGlobals(prog, 'TSTypeQuery'), ['self']);
  });

// fn-type signature param: `(items: Set<number>) => void` keeps its params under babel's
// `parameters` key (oxc uses `params`). a global referenced ONLY in a fn-type param must
// surface on both parsers - babel-side regression guard for the `parameters` child key
runBoth('walkTypeAnnotationGlobals/fn-type param', 'let handler: (items: Set<number>) => void;', (adapter, prog, lbl) => {
  const found = annotationGlobals(prog, 'TSFunctionType');
  checkTruthy(lbl, found.includes('Set'), `expected Set in [${ found.join(',') }]`);
});

// method-signature param inside a type literal: walks members -> method signature -> its
// `parameters`. structurally distinct host from TSFunctionType, same babel `parameters` key
runBoth('walkTypeAnnotationGlobals/method-sig param', 'let o: { run(items: Set<number>): void };', (adapter, prog, lbl) => {
  const found = annotationGlobals(prog, 'TSTypeLiteral');
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

// a for-loop UPDATE-clause reassignment is textually before the body use but runs AFTER it each
// iteration (and on the back-edge), so iteration 1's body read sees the init - it does NOT dominate.
// pins the loop-back-edge guard directly (a fixture's union recovery could mask a regressed predicate)
runBoth('reassignmentDominatesUsage/for-update clause, use in body -> false',
  'function f(c){ var M = Map; for (var i = 0; c; M = Set) { M.foo(); } }', (adapter, prog, lbl) => {
    const { reassignmentNodes, usagePath } = pickReassignUse(adapter, prog, 'AssignmentExpression');
    check(lbl, reassignmentDominatesUsage({ reassignmentNodes, usagePath }), false);
  });

// a logical-assignment writes M only on the short-circuit path, so the init stays live on the other
// (every-path-here) branch - the conditional write does NOT dominate. enumerate the WHOLE operator set
// element-by-element: a regression dropping one of the trio from the recognized set would silently
// re-dominate that operator while the others still pass
for (const op of ['||=', '&&=', '??=']) {
  runBoth(`reassignmentDominatesUsage/logical-assign ${ op } reassign -> false`,
    `function f(){ var M = Map; M ${ op } Set; M.foo(); }`, (adapter, prog, lbl) => {
      const { reassignmentNodes, usagePath } = pickReassignUse(adapter, prog, 'AssignmentExpression');
      check(lbl, reassignmentDominatesUsage({ reassignmentNodes, usagePath }), false);
    });
}

// --- bareAssignmentPatternLeafPath: the write-position policy split both emitters consult ---
// an ASSIGNMENT-position bare pattern leaf writes the global name (usage-global injects the
// slot's polyfill, usage-pure treats it as a write target); a BINDING pattern never matches -
// its host is a declarator / param / catch, not an assignment or for-x head
// shorthand properties surface the name twice (key + value nodes); the WRITE lives on the
// VALUE, so skip non-computed key positions - the same filter the real visitors apply
function namedIdentPath(adapter, prog, name) {
  return adapter.collectPaths(prog, 'Identifier', p => p.node.name === name
    && (!((p.parentPath?.node?.type === 'Property' || p.parentPath?.node?.type === 'ObjectProperty')
      && p.parentPath.node.key === p.node && !p.parentPath.node.computed) || p.parentPath.node.value === p.node))[0];
}
for (const [id, src, expected] of [
  ['array element', '[Promise] = arr;', true],
  ['object shorthand', '({ Promise } = obj);', true],
  ['object renamed value', '({ p: Promise } = obj);', true],
  ['rest element', '[...Promise] = arr;', true],
  ['pattern default', '[Promise = shim] = arr;', true],
  ['nested element', '[[Promise]] = deep;', true],
  // the climb ends on the TREE, not on a hop budget: 36 levels used to answer a silent `false`,
  // indistinguishable from "not a write position", and usage-global lost the slot's rescue there
  ['nesting past the retired hop budget', `${ '['.repeat(36) }Promise${ ']'.repeat(36) } = deep;`, true],
  ['for-of pattern head', 'for ([Promise] of xs);', true],
  ['flat LHS is not a pattern leaf', 'Promise = shim;', false],
  ['declaration pattern', 'const [Promise] = arr;', false],
  ['param pattern', 'function f([Promise]) { return Promise; }', false],
  ['catch pattern', 'try { g(); } catch ({ Promise }) { h(Promise); }', false],
  ['for-of declaration pattern', 'for (const [Promise] of xs) use(Promise);', false],
  ['object literal value is a read', 'use({ p: Promise });', false],
]) {
  runBoth(`bareAssignmentPatternLeafPath/${ id } ${ expected ? 'matches' : 'silent' }`, src,
    (adapter, prog, lbl) => {
      const path = namedIdentPath(adapter, prog, 'Promise');
      check(lbl, bareAssignmentPatternLeafPath(path), expected);
    });
}

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
// lexical-scope hosts carry the TS namespace body too, so consumers compose the set instead of
// re-adding `TSModuleBlock` by hand next to it
checkTruthy('LET_SCOPE_HOST_TYPES carries TSModuleBlock', LET_SCOPE_HOST_TYPES.has('TSModuleBlock'));
// the same subsumption on the type-walk side: both node types a hand-written walk clause used to
// re-add are members of the type-only catalogue, so the catalogue answers first
checkTruthy('isTypeAnnotationNodeType/TSInterfaceBody', isTypeAnnotationNodeType('TSInterfaceBody'));
checkTruthy('isTypeAnnotationNodeType/TSTypeParameter', isTypeAnnotationNodeType('TSTypeParameter'));

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

// --- tagSymbolSourcedPropMeta / computedPropKeyHostsMachinery (symbol-key provenance) ---

// a folded 'Symbol.X' key is tagged symbolSourced ONLY when the source is a real well-known-
// symbol reference; string spellings (literal / template / `+`-concat) stay untagged so
// symbol-routed consumers leave them as plain property reads
const provenanceAdapter = {
  isStringLiteral(n) { return n.type === 'StringLiteral' || (n.type === 'Literal' && typeof n.value === 'string'); },
  getStringValue(n) { return n.value; },
  hasBinding(scope, name) { return !!scope?.getBinding?.(name); },
  method: 'usage-pure',
};
// babel exposes destructure props as ObjectProperty, oxc as Property
function pickProp(adapter, prog) {
  return adapter.pickPath(prog, 'ObjectProperty') ?? adapter.pickPath(prog, 'Property');
}
const PROVENANCE_CASES = [
  ['real symbol ref', 'const { [Symbol.iterator]: it } = arr;', true],
  ['SE-prefixed real symbol ref', 'const { [(eff(), Symbol.iterator)]: it } = arr;', true],
  ['string literal spelling', "const { ['Symbol.iterator']: it } = arr;", false],
  ['template spelling', 'const { [`Symbol.iterator`]: it } = arr;', false],
  ['concat spelling', "const { ['Symbol.' + 'iterator']: it } = arr;", false],
];
for (const [name, code, expected] of PROVENANCE_CASES) {
  runBoth(`tagSymbolSourcedMeta/${ name }`, code, (adapter, prog, lbl) => {
    const prop = pickProp(adapter, prog);
    const meta = tagSymbolSourcedMeta({
      meta: { kind: 'property', object: null, key: 'Symbol.iterator', placement: null },
      keyNode: prop.node.key, computed: prop.node.computed,
      scope: prop.scope, adapter: provenanceAdapter, path: prop,
    });
    check(lbl, !!meta.symbolSourced, expected);
    // the consumer-side predicate mirrors the tag: provenance + the iterator key
    check(`${ lbl }/consumer predicate`, isSourcedSymbolIteratorMeta(meta), expected);
  });
}

// machinery gate: real symbol / resolvable fold (incl. through an SE prefix) restructure a
// catch pattern; a string spelling of a symbol or an unresolvable fold hosts nothing and the
// pattern stays verbatim (key evaluation, incl. its SE, runs in place exactly once)
const MACHINERY_CASES = [
  ['real symbol ref', 'const { [Symbol.iterator]: it } = arr;', () => null, true],
  ['string spelling of a symbol', "const { ['Symbol.iterator']: it } = arr;", () => null, false],
  ['SE-prefixed resolvable key', "const { [(eff(), 'at')]: it } = arr;", () => ({ kind: 'instance' }), true],
  ['SE-prefixed unresolvable key', "const { [(eff(), 'zzz')]: it } = arr;", () => null, false],
  ['resolvable fold', "const { ['a' + 't']: it } = arr;", () => ({ kind: 'instance' }), true],
  ['unresolvable fold', "const { ['some.key']: it } = arr;", () => null, false],
  ['non-computed key', 'const { at: it } = arr;', () => ({ kind: 'instance' }), false],
];
for (const [name, code, resolvePure, expected] of MACHINERY_CASES) {
  runBoth(`computedPropKeyHostsMachinery/${ name }`, code, (adapter, prog, lbl) => {
    const prop = pickProp(adapter, prog);
    check(lbl, computedPropKeyHostsMachinery({
      propNode: prop.node, scope: prop.scope, adapter: provenanceAdapter, path: prop, resolvePure,
    }), expected);
  });
}

// --- collectMemberUnionCandidates (usage-global reachable-key union) ---

// an UNRESOLVED receiver still unions its reachable keys as typeless prototype metas; a static
// receiver keeps static-placement extras; no reassignment yields no extras. cross-parser so the
// binding-violation enumeration agrees between babel and estree scopes
const unionAdapter = {
  ...provenanceAdapter,
  method: 'usage-global',
  getBinding(scope, name) { return scope?.getBinding?.(name); },
  // the branch-objects axis probes the receiver's declarator through the full scope-adapter
  // surface; a null node-type makes the indirection resolver bail, keeping these units on the
  // reachable-reassignment axis they lock
  getBindingNodeType() { return null; },
  hasBinding(scope, name) { return !!scope?.getBinding?.(name); },
};
function unionExtras(adapter, prog, receiverIsStatic) {
  const member = adapter.pickPath(prog, 'MemberExpression', p => p.node.computed);
  return collectMemberUnionCandidates({
    objectNode: member.node.object, computedKeyNode: member.node.property,
    primaryObject: receiverIsStatic ? 'Array' : null, primaryKey: 'at',
    scope: member.scope, adapter: unionAdapter, path: member,
  });
}
runBoth('collectMemberUnionCandidates/unresolved receiver unions reachable key',
  'let k = "at"; if (c) k = "flat"; const arr = [1]; arr[k];', (adapter, prog, lbl) => {
    const extras = unionExtras(adapter, prog, false);
    checkDeep(lbl, extras, [{ kind: 'property', object: null, key: 'flat', placement: 'prototype', receiverHint: null }]);
  });
runBoth('collectMemberUnionCandidates/static receiver keeps static extras',
  'let k = "at"; if (c) k = "flat"; Array[k];', (adapter, prog, lbl) => {
    const extras = unionExtras(adapter, prog, true);
    checkDeep(lbl, extras, [{ kind: 'property', object: 'Array', key: 'flat', placement: 'static', receiverHint: 'function' }]);
  });
runBoth('collectMemberUnionCandidates/no reassignment yields no extras',
  'const k = "at"; const arr = [1]; arr[k];', (adapter, prog, lbl) => {
    checkDeep(lbl, unionExtras(adapter, prog, false), []);
  });
// the prototype-navigated producer forces prototype placement: a reachable ctor value read
// through `.prototype` dispatches the key as ITS prototype method, never as a static
runBoth('collectMemberUnionCandidates/placement override types the reachable ctor as prototype',
  'let C = Array; if (c) C = String; C.prototype.includes;', (adapter, prog, lbl) => {
    const proto = adapter.pickPath(prog, 'MemberExpression', p => p.node.property?.name === 'prototype');
    const extras = collectMemberUnionCandidates({
      objectNode: proto.node.object, computedKeyNode: null, primaryObject: null, primaryKey: 'includes',
      placement: 'prototype', scope: proto.scope, adapter: unionAdapter, path: proto,
    });
    checkDeep(lbl, extras, [{ kind: 'property', object: 'String', key: 'includes', placement: 'prototype', receiverHint: null }]);
  });

// --- the `extends` base as a union receiver (helpers/class-walk) ---

// `super.<static>` in a static method reads the base's static surface, so an AMBIGUOUS base owes
// the same reachable union a member read off the same slot owes - and how the base is SPELLED is
// no part of that question. an Identifier-only admission enumerated nothing for a hop, and a base
// naming no value at all built no meta to hang the enumeration on.
// the binding view is the plugin-shaped one the value walks consult: the declarator NODE, its own
// scope and its writes - a raw parser binding answers none of those and every alias hop bails
const superBaseAdapter = {
  method: 'usage-global',
  isStringLiteral(node) { return node.type === 'StringLiteral' || (node.type === 'Literal' && typeof node.value === 'string'); },
  getStringValue(node) { return node.value; },
  hasBinding(scope, name) { return !!scope?.getBinding?.(name); },
  getBindingNodeType(scope, name) { return scope?.getBinding?.(name)?.path?.node?.type ?? null; },
  isMutatedStatic() { return false; },
  getBinding(scope, name) {
    const binding = scope?.getBinding?.(name);
    return binding ? {
      node: binding.path?.node ?? null,
      kind: binding.kind,
      name,
      constantViolations: binding.constantViolations ?? [],
      scope: binding.path?.scope ?? scope,
      declarationPath: binding.path ?? null,
      path: binding.path ?? null,
    } : null;
  },
};
function superStaticMeta(adapter, prog, method = 'usage-global') {
  const { resolveStaticInheritedMember } = createClassHelpers({
    t: adapter.name === 'babel' ? babelTypes : estreeTypes,
    adapter: { ...superBaseAdapter, method },
    resolveKey,
    attachUnionExtras: attachMemberUnionExtras,
    containerReceiverName: staticContainerReceiverName,
  });
  const read = adapter.pickPath(prog, 'MemberExpression', p => p.node.object?.type === 'Super');
  return resolveStaticInheritedMember(read);
}
function staticExtra(object) {
  return { kind: 'property', object, key: 'from', placement: 'static', receiverHint: 'function' };
}
// one class shape throughout, so a row differs only in how its base is spelled
function staticRead(base) {
  return `class X extends ${ base } { static go() { return super.from("ab"); } }`;
}
const AMBIGUOUS_SLOT = 'let N = { Base: Boolean }; if (c) N = { Base: Array }; ';
const AMBIGUOUS_ALIAS = 'let B = Boolean; if (c) B = Array; ';
const REACHES_ARRAY = [staticExtra('Array')];
const REACHES_BOTH = [staticExtra('Boolean'), staticExtra('Array')];
const SUPER_BASE_SPELLINGS = [
  ['bare reassigned alias', AMBIGUOUS_ALIAS + staticRead('B'), REACHES_ARRAY],
  // a branching INIT decides nothing either, so no arm is the primary and BOTH enumerate
  ['bare branching init', `let B = c ? Boolean : Array; ${ staticRead('B') }`, [staticExtra('Boolean'), staticExtra('Array')]],
  ['container hop', AMBIGUOUS_SLOT + staticRead('N.Base'), REACHES_ARRAY],
  ['nested container hop', `${ AMBIGUOUS_SLOT }const NN = { inner: N }; ${ staticRead('NN.inner.Base') }`, REACHES_ARRAY],
  ['alias of the container', `${ AMBIGUOUS_SLOT }const M = N; ${ staticRead('M.Base') }`, REACHES_ARRAY],
  ['optional hop', AMBIGUOUS_SLOT + staticRead('N?.Base'), REACHES_ARRAY],
  ['class-static slot',
    `class S0 { static Base = Boolean; } class S1 { static Base = Array; } let S = S0; if (c) S = S1; ${ staticRead('S.Base') }`,
    REACHES_ARRAY],
  ['iife over the alias', AMBIGUOUS_ALIAS + staticRead('(() => B)()'), REACHES_ARRAY],
  // ... and the branching spellings of the same reachability: what the arms are is one question
  // (the fallback-branch canon), and a hop spelling must answer it exactly as the bare alias does
  ['branching slot', `const N = { Base: c ? Boolean : Array }; ${ staticRead('N.Base') }`, REACHES_BOTH],
  ['branching container', `const N = c ? { Base: Boolean } : { Base: Array }; ${ staticRead('N.Base') }`, REACHES_BOTH],
  ['branching container alias',
    `const NL = { Base: Boolean }; const NR = { Base: Array }; const N = c ? NL : NR; ${ staticRead('N.Base') }`,
    REACHES_BOTH],
  ['branching array element', `const N = [c ? Boolean : Array]; ${ staticRead('N[0]') }`, REACHES_BOTH],
  ['branching nested slot', `const N = { inner: { Base: c ? Boolean : Array } }; ${ staticRead('N.inner.Base') }`, REACHES_BOTH],
  ['logical-defaulted slot', `const N = { Base: Boolean ?? Array }; ${ staticRead('N.Base') }`, REACHES_BOTH],
];
for (const [name, code, extras] of SUPER_BASE_SPELLINGS) {
  runBoth(`resolveStaticInheritedMember/union survives the ${ name }`, code, (adapter, prog, lbl) => {
    checkDeep(lbl, superStaticMeta(adapter, prog)?.extraCandidates ?? null, extras);
  });
  // pure substitutes a base it can PROVE and never enumerates: the choke is usage-global-only, so
  // the carrier these spellings ride is dropped again and the read stays native
  runBoth(`resolveStaticInheritedMember/pure keeps the ${ name } native`, code, (adapter, prog, lbl) => {
    check(lbl, superStaticMeta(adapter, prog, 'usage-pure')?.object ?? null, null);
  });
}
// the boundaries: an unambiguous base names its own constructor and enumerates nothing beside it,
// a base no walk can name builds no carrier at all, and a USER class among the arms is no global -
// only the global arm becomes a candidate, and a candidate whose constructor has no such static
// resolves to no module (the fixtures record the empty import set that follows)
const SUPER_BASE_BOUNDARIES = [
  ['unambiguous hop base', `const N = { Base: Array }; ${ staticRead('N.Base') }`, 'Array', null],
  ['unambiguous bare base', `const B = Array; ${ staticRead('B') }`, 'Array', null],
  ['parameter base', `function h(P) { ${ staticRead('P') } return X; }`, null, null],
  ['opaque call base', staticRead('mk()'), null, null],
  ['user class among the arms',
    `class L {} let N = { Base: L }; if (c) N = { Base: Boolean }; ${ staticRead('N.Base') }`,
    null, [staticExtra('Boolean')]],
  // the arms are answered by the canonical branch enumeration, so a value naming no global -
  // a user class, a local, a literal - contributes nothing here either
  ['branching arms naming no global', `class L {} class R {} const N = { Base: c ? L : R }; ${ staticRead('N.Base') }`, null, null],
  ['branching arms with one user class',
    `class L {} const N = { Base: c ? L : Array }; ${ staticRead('N.Base') }`, null, REACHES_ARRAY],
  ['branching arms that are not constructors', `const N = { Base: c ? 1 : "s" }; ${ staticRead('N.Base') }`, null, null],
  ['branching arm that is a bare local', `const N = { Base: (c && Boolean) || Array }; ${ staticRead('N.Base') }`, null, REACHES_BOTH],
];
for (const [name, code, object, extras] of SUPER_BASE_BOUNDARIES) {
  runBoth(`resolveStaticInheritedMember/${ name }`, code, (adapter, prog, lbl) => {
    const meta = superStaticMeta(adapter, prog);
    check(`${ lbl }/object`, meta?.object ?? null, object);
    checkDeep(`${ lbl }/extras`, meta?.extraCandidates ?? null, extras);
  });
}

// the destructure twin anchors at the ObjectProperty: the declarator host supplies the receiver
// alias, the prop key supplies the key alias; a non-global method or a fallback meta yields none
function destructureExtras(adapter, prog, meta, method = 'usage-global') {
  const prop = pickProp(adapter, prog);
  // the funnel runs in two phases so the meta's instance-free verdict reaches the PRIMARY dispatch
  // (`prepare` stamps it, `collect` enumerates) - the production caller orders them the same way
  return collectDestructureUnionCandidates(prepareDestructureUnion({
    meta, keyNode: prop.node.key, computed: prop.node.computed,
    scope: prop.scope, adapter: { ...unionAdapter, method }, path: prop,
  }));
}
runBoth('collectDestructureUnionCandidates/reassigned key on unresolved receiver',
  'let k = "at"; if (c) k = "flat"; const arr = [1]; const { [k]: v } = arr;', (adapter, prog, lbl) => {
    checkDeep(lbl, destructureExtras(adapter, prog, { kind: 'property', object: null, key: 'at', placement: null }),
      [{ kind: 'property', object: null, key: 'flat', placement: 'prototype', receiverHint: null }]);
  });
runBoth('collectDestructureUnionCandidates/receiver alias reaching a constructor',
  'var M = [1]; if (c) M = Iterator; const { from } = M;', (adapter, prog, lbl) => {
    checkDeep(lbl, destructureExtras(adapter, prog, { kind: 'property', object: null, key: 'from', placement: null }),
      [{ kind: 'property', object: 'Iterator', key: 'from', placement: 'static', receiverHint: null }]);
  });
runBoth('collectDestructureUnionCandidates/usage-pure yields none',
  'let k = "at"; if (c) k = "flat"; const arr = [1]; const { [k]: v } = arr;', (adapter, prog, lbl) => {
    checkDeep(lbl, destructureExtras(adapter, prog, { kind: 'property', object: null, key: 'at', placement: null }, 'usage-pure'), []);
  });
// a param-default host supplies the receiver alias like a declarator init does
runBoth('collectDestructureUnionCandidates/param-default host supplies the receiver alias',
  'var M = [1]; if (c) M = Iterator; function f({ from } = M) { return from; }', (adapter, prog, lbl) => {
    checkDeep(lbl, destructureExtras(adapter, prog, { kind: 'property', object: null, key: 'from', placement: null }),
      [{ kind: 'property', object: 'Iterator', key: 'from', placement: 'static', receiverHint: null }]);
  });

// the array-wrapper peel COLLECTS the sequence prefixes of every CONSUMED wrapper level
// (source order) - the flatten discards those levels, so both emitters re-emit effects from
// this list; a bail keeps the original init and commits nothing
runBoth('peelArrayWrapperPair/collects consumed wrapper-level SE prefixes in order',
  'const [[{ x }]] = (o(), [(m(), [(i(), globalThis)])]);', (adapter, prog, lbl) => {
    const decl = adapter.pickPath(prog, 'VariableDeclarator');
    const { init, peeledPrefixes } = peelArrayWrapperPair({ pattern: decl.node.id, init: decl.node.init });
    const names = peeledPrefixes.map(e => e.callee?.name);
    checkDeep(lbl, names, ['o', 'm']);
    // babel strips the paren node, oxc keeps it around the leaf's sequence - both carry the prefix
    check(`${ lbl } leaf keeps its own prefix`, /^(?:Parenthesized|Sequence)Expression$/.test(init?.type), true);
  });
// a pattern hop names a MISSING-ABLE ctor when the pure flavor ships that ctor as an entry of its own:
// a sentinel or a raw residual read under such a hop would read the native ctor off the realm. an
// always-present hop, a proxy-global name and a computed key never do
runBoth('hopNamesMissingAbleCtor/asks the pure entry of a hop that spells a slot',
  'const { Map: { groupBy }, Iterator: { from }, Object: { keys }, globalThis: { self }, [k]: { at }, ["Map"]: { has } } = globalThis;',
  (adapter, prog, lbl) => {
    const decl = adapter.pickPath(prog, 'VariableDeclarator');
    function resolve(name) {
      return name === 'Map' || name === 'Iterator' ? { entry: `actual/${ name.toLowerCase() }/constructor` } : null;
    }
    const verdicts = decl.node.id.properties.map(hop => hopNamesMissingAbleCtor(hop, resolve));
    checkDeep(lbl, verdicts, [true, true, false, false, false, true]);
  });
// the OBJECT level of the same peel: a sole-key hop pairs with the slot it names - a GETTER too,
// where its body is one pure return. what the literal still OWES does not keep the claim native: an
// effect-bearing sibling (and a spread ahead of the key) pairs and leaves the literal ALIVE, the way
// a spread-bearing array wrapper does. what keeps the level whole is what makes the KEY unsure or the
// read itself an effect: a spread that could override it, an unnameable key that could BE it at
// runtime, a getter body that runs an effect, and a paired value whose own `?.` belongs to the probe
// channel
runBoth('peelArrayWrapperPair/object hop pairs the slot its sole key names',
  'const { w: { Map: m } } = { z: 1, w: globalThis };', (adapter, prog, lbl) => {
    const decl = adapter.pickPath(prog, 'VariableDeclarator');
    const { pattern, init } = peelArrayWrapperPair({ pattern: decl.node.id, init: decl.node.init });
    check(lbl, init?.type === 'Identifier' && init.name === 'globalThis', true);
    check(`${ lbl } pattern descends`, pattern?.properties?.[0]?.key?.name, 'Map');
  });
runBoth('peelArrayWrapperPair/object hop keeps the level whole on every hazard',
  `const a = { w: globalThis, z: eff() };
   const b = { w: globalThis, ...extra };
   const c = { Q: globalThis, [k]: other };
   const d = { get w() { eff(); return globalThis; } };
   const e = { w: globalThis.window?.Array };`, (adapter, prog, lbl) => {
    const peeled = adapter.collectPaths(prog, 'VariableDeclarator').map(decl => {
      const pattern = { type: 'ObjectPattern', properties: [{
        type: 'ObjectProperty',
        key: { type: 'Identifier', name: decl.node.init.properties[0].key?.name ?? 'w' },
        computed: false,
        value: { type: 'ObjectPattern', properties: [] },
      }] };
      return peelArrayWrapperPair({ pattern, init: decl.node.init });
    });
    // the sibling effect pairs and keeps its literal alive; every other hazard leaves the level whole
    checkDeep(lbl, peeled.map((result, at) => result.init === adapter
      .collectPaths(prog, 'VariableDeclarator')[at].node.init), [false, true, true, true, true]);
    check(`${ lbl } sibling effect keeps the literal alive`, peeled[0].wrapperSurvives, true);
  });
runBoth('peelArrayWrapperPair/bail commits no prefixes',
  'const [{ y }] = (o(), notAnArray);', (adapter, prog, lbl) => {
    const decl = adapter.pickPath(prog, 'VariableDeclarator');
    const { init, peeledPrefixes } = peelArrayWrapperPair({ pattern: decl.node.id, init: decl.node.init });
    checkDeep(lbl, peeledPrefixes, []);
    check(`${ lbl } init unchanged`, init, decl.node.init);
  });
// an SE-bearing element the pattern does not bind keeps the level whole by default (its effect would
// vanish with the consumed wrapper); a host that lifts statements takes it HARVESTED instead -
// innermost level first, the order native runs them after the element - and a pure extra is never
// harvested. a SPREAD is never harvested either (no statement re-emits an iteration): a lifting host
// consumes the level and keeps its ARRAY alive instead, any other host bails
runBoth('peelArrayWrapperPair/trailing effect bails unless the host lifts',
  'const [[{ x }]] = [[(i(), globalThis), a(), 7], b()];', (adapter, prog, lbl) => {
    const decl = adapter.pickPath(prog, 'VariableDeclarator');
    const kept = peelArrayWrapperPair({ pattern: decl.node.id, init: decl.node.init });
    check(`${ lbl } keeps the init`, kept.init, decl.node.init);
    checkDeep(`${ lbl } harvests nothing`, kept.trailingEffects, []);
    const lifted = peelArrayWrapperPair({ pattern: decl.node.id, init: decl.node.init, liftTrailing: true });
    check(`${ lbl } reaches the leaf`, /^(?:Parenthesized|Sequence)Expression$/.test(lifted.init?.type), true);
    checkDeep(`${ lbl } innermost first`, lifted.trailingEffects.map(e => e.callee?.name), ['a', 'b']);
    check(`${ lbl } two levels consumed`, lifted.consumedLevels.length, 2);
  });
runBoth('peelArrayWrapperPair/spread extra keeps the wrapper alive for a lifting host, bails otherwise',
  'const [{ x }] = [(e(), globalThis), a(), ...rest];', (adapter, prog, lbl) => {
    const decl = adapter.pickPath(prog, 'VariableDeclarator');
    const kept = peelArrayWrapperPair({ pattern: decl.node.id, init: decl.node.init });
    check(`${ lbl } keeps the init`, kept.init, decl.node.init);
    check(`${ lbl } no survivor flagged`, kept.wrapperSurvives, false);
    const lifted = peelArrayWrapperPair({ pattern: decl.node.id, init: decl.node.init, liftTrailing: true });
    check(`${ lbl } reaches the leaf`, /^(?:Parenthesized|Sequence)Expression$/.test(lifted.init?.type), true);
    check(`${ lbl } wrapper survives`, lifted.wrapperSurvives, true);
    checkDeep(`${ lbl } harvests nothing off that level`, lifted.trailingEffects, []);
  });
// a level reached through a const ALIAS lives in the alias's own declaration: its extras run there
// and are never harvested, while an INLINE level above it still is
runBoth('peelArrayWrapperPair/aliased level harvests nothing, the inline level above it does',
  'const w = [globalThis, a()]; const [[{ x }]] = [w, b()];', (adapter, prog, lbl) => {
    const decl = adapter.pickPath(prog, 'VariableDeclarator', p => p.node.id.type === 'ArrayPattern');
    const { init, trailingEffects } = peelArrayWrapperPair({
      pattern: decl.node.id, init: decl.node.init, scope: decl.scope, adapter: unionAdapter, path: decl, liftTrailing: true,
    });
    check(`${ lbl } reaches the aliased element`, init?.type === 'Identifier' && init.name === 'globalThis', true);
    checkDeep(`${ lbl } inline extra only`, trailingEffects.map(e => e.callee?.name), ['b']);
  });
// a PATTERN-bound wrapper alias derefs through its slot's unique pairing, like the plain-const
// spelling - the walk lands on the aliased literal's element
runBoth('peelArrayWrapperPair/pattern-bound alias derefs its unique slot',
  'const [wrapper] = [[globalThis]]; const [{ x }] = wrapper;', (adapter, prog, lbl) => {
    const decl = adapter.pickPath(prog, 'VariableDeclarator',
      p => p.node.id?.elements?.[0]?.type === 'ObjectPattern');
    const { pattern, init } = peelArrayWrapperPair({
      pattern: decl.node.id, init: decl.node.init, scope: decl.scope, adapter: unionAdapter, path: decl,
    });
    check(lbl, init?.name, 'globalThis');
    check(`${ lbl } pattern peeled`, pattern?.type, 'ObjectPattern');
  });
// ... but a spread at the alias's own declarator makes the slot's union INCOMPLETE - the lone
// enumerable candidate is not what the runtime may hand the slot, so the pure-precision walk
// declines and the pair stays whole
runBoth('peelArrayWrapperPair/spread-shifted alias slot declines',
  'const xs = []; const [wrapper] = [...xs, [globalThis]]; const [{ x }] = wrapper;', (adapter, prog, lbl) => {
    const decl = adapter.pickPath(prog, 'VariableDeclarator',
      p => p.node.id?.elements?.[0]?.type === 'ObjectPattern');
    const { pattern, init } = peelArrayWrapperPair({
      pattern: decl.node.id, init: decl.node.init, scope: decl.scope, adapter: unionAdapter, path: decl,
    });
    check(lbl, init, decl.node.init);
    check(`${ lbl } pattern unchanged`, pattern, decl.node.id);
  });
// ... and so does a slot whose union is a LONE DEFAULT: the pairing is an over-approximation (a
// pair the enumerator cannot read - here the object spread - contributes nothing), so the default
// is not certain to fire and pure precision must not read it as the value
runBoth('peelArrayWrapperPair/lone-default alias slot declines',
  'const { wrapper = [globalThis] } = { ...src }; const [{ x }] = wrapper;', (adapter, prog, lbl) => {
    const decl = adapter.pickPath(prog, 'VariableDeclarator',
      p => p.node.id?.elements?.[0]?.type === 'ObjectPattern');
    const { pattern, init } = peelArrayWrapperPair({
      pattern: decl.node.id, init: decl.node.init, scope: decl.scope, adapter: unionAdapter, path: decl,
    });
    check(lbl, init, decl.node.init);
    check(`${ lbl } pattern unchanged`, pattern, decl.node.id);
  });
// the WRAPPED spellings of the alias's init hand the same runtime value: a paren (an oxc NODE)
// and a sequence tail follow like the bare literal - judging the raw spelling split the parsers
runBoth('peelArrayWrapperPair/paren-wrapped alias init derefs like the bare one',
  'const [wrapper] = ([[globalThis]]); const [{ x }] = wrapper;', (adapter, prog, lbl) => {
    const decl = adapter.pickPath(prog, 'VariableDeclarator',
      p => p.node.id?.elements?.[0]?.type === 'ObjectPattern');
    const { init } = peelArrayWrapperPair({
      pattern: decl.node.id, init: decl.node.init, scope: decl.scope, adapter: unionAdapter, path: decl,
    });
    check(lbl, init?.name, 'globalThis');
  });
// the wrap can sit on the slot VALUE itself: the pairing hands the element as written, and the
// deref judges it effective before descending (`[([globalThis])]` holds an array, not a paren)
runBoth('peelArrayWrapperPair/paren-wrapped slot element derefs like the bare one',
  'const [wrapper] = [([globalThis])]; const [{ x }] = wrapper;', (adapter, prog, lbl) => {
    const decl = adapter.pickPath(prog, 'VariableDeclarator',
      p => p.node.id?.elements?.[0]?.type === 'ObjectPattern');
    const { init } = peelArrayWrapperPair({
      pattern: decl.node.id, init: decl.node.init, scope: decl.scope, adapter: unionAdapter, path: decl,
    });
    check(lbl, init?.name, 'globalThis');
  });
runBoth('peelArrayWrapperPair/sequence-tail alias init derefs to its value',
  'let e = 0; const [wrapper] = (e++, [[globalThis]]); const [{ x }] = wrapper;', (adapter, prog, lbl) => {
    const decl = adapter.pickPath(prog, 'VariableDeclarator',
      p => p.node.id?.elements?.[0]?.type === 'ObjectPattern');
    const { init } = peelArrayWrapperPair({
      pattern: decl.node.id, init: decl.node.init, scope: decl.scope, adapter: unionAdapter, path: decl,
    });
    check(lbl, init?.name, 'globalThis');
  });
// ... and the completeness gate reads the SAME normalized value: a spread reached through a
// SECOND alias hop (or hidden by a paren) still declines - values enumerated through the follow
// with completeness judged on the raw spelling would read the lone candidate as certain
runBoth('peelArrayWrapperPair/spread through a second alias declines',
  'const xs = []; const src = [...xs, [globalThis]]; const [wrapper] = src; const [{ x }] = wrapper;', (adapter, prog, lbl) => {
    const decl = adapter.pickPath(prog, 'VariableDeclarator',
      p => p.node.id?.elements?.[0]?.type === 'ObjectPattern');
    const { pattern, init } = peelArrayWrapperPair({
      pattern: decl.node.id, init: decl.node.init, scope: decl.scope, adapter: unionAdapter, path: decl,
    });
    check(lbl, init, decl.node.init);
    check(`${ lbl } pattern unchanged`, pattern, decl.node.id);
  });
// a cycle spelled ACROSS two pattern declarators re-enters the follow through the slot pairing
// without spinning any single loop - only the threaded depth budget stops it, and this row is
// the termination proof (a regression hangs the suite instead of failing an assert)
runBoth('peelArrayWrapperPair/cross-pattern declarator cycle terminates',
  'const [a] = b; const [b] = a; const [{ x }] = a;', (adapter, prog, lbl) => {
    const decl = adapter.pickPath(prog, 'VariableDeclarator',
      p => p.node.id?.elements?.[0]?.type === 'ObjectPattern');
    const { init } = peelArrayWrapperPair({
      pattern: decl.node.id, init: decl.node.init, scope: decl.scope, adapter: unionAdapter, path: decl,
    });
    check(lbl, init, decl.node.init);
  });

runBoth('destructure init meta resolves this-in-static through the adapter hook',
  'class C extends Array { static m() { const { from } = this; return from; } }', (adapter, prog, lbl) => {
    const prop = adapter.pickPath(prog, 'Property') ?? adapter.pickPath(prog, 'ObjectProperty');
    const meta = buildDestructuringInitMeta({
      initNode: prop.parentPath.parent.init ?? { type: 'ThisExpression' },
      key: 'from', scope: prop.scope, path: prop,
      adapter: {
        ...adapter,
        resolveThisStaticHost: () => ({ kind: 'property', object: 'Array', key: 'from', placement: 'static', inheritedStatic: true }),
      },
    });
    check(lbl, meta?.object, 'Array');
    check(`${ lbl } placement`, meta?.placement, 'static');
  });
runBoth('destructure init meta keeps this untyped without the hook',
  'class C extends Array { static m() { const { from } = this; return from; } }', (adapter, prog, lbl) => {
    const prop = adapter.pickPath(prog, 'Property') ?? adapter.pickPath(prog, 'ObjectProperty');
    const meta = buildDestructuringInitMeta({
      initNode: { type: 'ThisExpression' }, key: 'from', scope: prop.scope, path: prop,
      adapter: { ...adapter, isStringLiteral: () => false },
    });
    check(lbl, meta?.object, null);
  });

runBoth('proxyGlobalMemberCtorPureSwap/harvests buried key SE with the pure-ctor leaf',
  'let e = 0; const r = globalThis.self[(e++, "Map")];', (adapter, prog, lbl) => {
    const member = adapter.pickPath(prog, 'MemberExpression');
    const swap = proxyGlobalMemberCtorPureSwap({
      receiver: member.node,
      aliasCtx: { scope: member.scope, adapter: { ...adapter, getBinding: () => null }, path: member },
      resolvePure: g => g.name === 'Map' ? { entry: 'actual/map/constructor', hintName: 'Map', kind: 'global' } : null,
    });
    check(lbl, swap?.pure?.entry, 'actual/map/constructor');
    checkDeep(`${ lbl } se`, swap?.se.map(n => n.type), ['UpdateExpression']);
  });
runBoth('proxyGlobalMemberCtorPureSwap/keeps the SE-bearing chain-root call in the rescue plan',
  'let n = 0; const r = (() => (n++, globalThis))().Map;', (adapter, prog, lbl) => {
    const member = adapter.pickPath(prog, 'MemberExpression');
    const swap = proxyGlobalMemberCtorPureSwap({
      receiver: member.node,
      aliasCtx: { scope: member.scope, adapter: { ...adapter, getBinding: () => null }, path: member },
      resolvePure: g => g.name === 'Map' ? { entry: 'actual/map/constructor', hintName: 'Map', kind: 'global' } : null,
    });
    check(lbl, swap?.pure?.entry, 'actual/map/constructor');
    checkDeep(`${ lbl } se`, swap?.se.map(node => node.type), ['CallExpression']);
  });
runBoth('proxyGlobalMemberCtorPureSwap/non-pure leaf resolves nothing',
  'const r = globalThis.self.Math;', (adapter, prog, lbl) => {
    const member = adapter.pickPath(prog, 'MemberExpression');
    const swap = proxyGlobalMemberCtorPureSwap({
      receiver: member.node,
      aliasCtx: { scope: member.scope, adapter: { ...adapter, getBinding: () => null }, path: member },
      resolvePure: () => null,
    });
    check(lbl, swap, null);
  });

// WHERE a kept-spelled realm run lands, and the THREE answers its callers have to tell apart: a
// node when the swap spells the run, `false` when the guard-lowering collapse owns it instead, and
// `null` when the run carries no backed span at all. Reading the second as the third is what froze
// a native `self` read inside a guarded claim's test, in exactly the realms the ponyfill serves
function landStoredRun(adapter, prog, pure = null) {
  const path = adapter.pickPath(prog, 'AssignmentExpression');
  const PURE = pure ?? {
    self: { entry: 'actual/self', hintName: 'self', kind: 'global' },
    globalThis: { entry: 'actual/global-this', hintName: 'globalThis', kind: 'global' },
  };
  const landed = landRunOnDeepestBackedSpan({
    navNode: path.node,
    ctx: { scope: path.scope, adapter: { ...adapter, getBinding: () => null }, path },
    resolvePure: global => PURE[global.name] ?? null,
    mintPure: minting => ({ type: 'Identifier', name: `_${ minting.hintName }` }),
  });
  // the swap mutates in place, so the minted binding is looked for in the tree it landed in -
  // and so is the probe hop, whose survival is the second half of the landing's verdict. a `?.`
  // left over the LANDED binding is the third: the landing is what made it dead text
  let minted = false;
  let probeHops = 0;
  let optionalOverTheLanding = false;
  (function walk(node) {
    if (!node || typeof node !== 'object') return;
    if (node.type === 'Identifier' && node.name.startsWith('_')) minted = true;
    if (node.type === 'MemberExpression' || node.type === 'OptionalMemberExpression') {
      if (node.property?.name === 'window') probeHops += 1;
      if (node.optional && node.object?.type === 'Identifier' && node.object.name.startsWith('_')) {
        optionalOverTheLanding = true;
      }
    }
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) value.forEach(walk);
      else if (value && typeof value === 'object' && typeof value.type === 'string') walk(value);
    }
  })(path.node);
  return {
    verdict: landed === null ? 'null' : landed === false ? 'collapse' : 'node',
    minted,
    keptProbe: probeHops > 0,
    probeHops,
    optionalOverTheLanding,
  };
}

runBoth('landRunOnDeepestBackedSpan/a probe above the span swaps the span in place',
  'let w; w = globalThis.self.window?.Array;', (adapter, prog, lbl) => {
    const landed = landStoredRun(adapter, prog);
    check(lbl, landed.verdict, 'node');
    check(`${ lbl } minted`, landed.minted, true);
  });
runBoth('landRunOnDeepestBackedSpan/the source `?.` over a probe keeps its slot above the landing',
  'let w; w = globalThis.self.window?.Array;', (adapter, prog, lbl) => {
    check(lbl, landStoredRun(adapter, prog).keptProbe, true);
  });
// ... and the other half of the same rule: a probe nothing branches on, with a member READING
// THROUGH it, is not a value the source reads - the read-through fold owns it here exactly as it
// owns it under a plain claim, so the landing may not leave it standing
runBoth('landRunOnDeepestBackedSpan/a read-through probe above the landing folds onto it',
  'let w; w = globalThis.self.window.Number;', (adapter, prog, lbl) => {
    const landed = landStoredRun(adapter, prog);
    check(lbl, landed.verdict, 'node');
    check(`${ lbl } minted`, landed.minted, true);
    check(`${ lbl } folded`, landed.keptProbe, false);
  });
runBoth('landRunOnDeepestBackedSpan/a TERMINAL probe keeps its slot over the landing',
  'let w; w = globalThis.self.window;', (adapter, prog, lbl) => {
    const landed = landStoredRun(adapter, prog);
    check(lbl, landed.verdict, 'node');
    check(`${ lbl } kept`, landed.keptProbe, true);
  });
runBoth('landRunOnDeepestBackedSpan/a probe INSIDE the span hands the run to the collapse',
  'let w; w = globalThis.window?.self.Number;', (adapter, prog, lbl) => {
    const landed = landStoredRun(adapter, prog);
    check(lbl, landed.verdict, 'collapse');
    check(`${ lbl } spells nothing itself`, landed.minted, false);
  });
// the run's own ROOT is a span like any other: a backed name spelled BARE is the deepest thing pure
// can back, so the landing reaches it and every rule it carries reaches the run - read as "no span
// exists", one source got two landings, and the fold moved with a `?.` standing over the CLAIM
runBoth('landRunOnDeepestBackedSpan/the run lands its bare ROOT when nothing above it is backed',
  'let w; w = globalThis.window?.Array;', (adapter, prog, lbl) => {
    const landed = landStoredRun(adapter, prog);
    check(lbl, landed.verdict, 'node');
    check(`${ lbl } minted`, landed.minted, true);
    check(`${ lbl } the source branch keeps the probe`, landed.keptProbe, true);
  });
runBoth('landRunOnDeepestBackedSpan/a read-through probe over a bare ROOT folds onto it',
  'let w; w = self.window.Number;', (adapter, prog, lbl) => {
    const landed = landStoredRun(adapter, prog);
    check(lbl, landed.verdict, 'node');
    check(`${ lbl } folded`, landed.keptProbe, false);
  });
runBoth('landRunOnDeepestBackedSpan/the `?.` the ROOT landing makes vestigial drops with it',
  'let w; w = self?.window;', (adapter, prog, lbl) => {
    const landed = landStoredRun(adapter, prog);
    check(lbl, landed.verdict, 'node');
    check(`${ lbl } the terminal probe stands`, landed.keptProbe, true);
    check(`${ lbl } no optional over the landing`, landed.optionalOverTheLanding, false);
  });
// ... and the same boundary drawn by a `?.` ABOVE the landing: the value it OBSERVES is the
// environment probe just as a terminal realm hop is, so the run under it keeps every slot it spells.
// folded only up to the `?.`, the run came out one hop shorter than the source wrote it and answered
// `undefined` where the read it stands for throws
runBoth('landRunOnDeepestBackedSpan/an observing `?.` keeps every hop under it',
  'let w; w = globalThis.window.window?.Array;', (adapter, prog, lbl) => {
    const landed = landStoredRun(adapter, prog);
    check(lbl, landed.verdict, 'node');
    check(`${ lbl } both hops stand`, landed.probeHops, 2);
  });
runBoth('landRunOnDeepestBackedSpan/... however deep the run runs',
  'let w; w = globalThis.window.window.window?.Array;', (adapter, prog, lbl) => {
    check(lbl, landStoredRun(adapter, prog).probeHops, 3);
  });
// NEGATIVE: with no `?.` observing it, a PLAIN member reads THROUGH the same hops and the
// read-through fold owns them - the rule above moves no boundary that one already draws
runBoth('landRunOnDeepestBackedSpan/a plain reader over the same hops still folds them',
  'let w; w = globalThis.window.window.Array;', (adapter, prog, lbl) => {
    const landed = landStoredRun(adapter, prog);
    check(lbl, landed.verdict, 'node');
    check(`${ lbl } folded`, landed.probeHops, 0);
  });

// ... and the boundary of that fold: a run whose own TERMINAL is a realm hop THIS BUILD leaves raw
// is the environment probe the source reads, so every slot it spells stays - what the hop's name
// says about core-js having an entry for it answers a different question
runBoth('landRunOnDeepestBackedSpan/a terminal hop this build leaves raw keeps the run whole',
  'let w; w = globalThis.window.self;', (adapter, prog, lbl) => {
    const landed = landStoredRun(adapter, prog,
      { globalThis: { entry: 'actual/global-this', hintName: 'globalThis', kind: 'global' } });
    check(lbl, landed.verdict, 'node');
    check(`${ lbl } keeps the read-through probe`, landed.keptProbe, true);
  });
// ... and the run whose own TERMINAL is that probe: it IS the value the source reads, so every slot
// it spells stays over the landing rather than one of them riding the ponyfill
runBoth('landRunOnDeepestBackedSpan/a run TERMINATING in the probe keeps every slot it spells',
  'let w; w = self.window.window;', (adapter, prog, lbl) => {
    const landed = landStoredRun(adapter, prog);
    check(lbl, landed.verdict, 'node');
    check(`${ lbl } keeps both hops`, landed.probeHops, 2);
  });
runBoth('landRunOnDeepestBackedSpan/no backed span and no spellable root leaves the run alone',
  'let w; w = window.window?.Array;', (adapter, prog, lbl) => {
    const landed = landStoredRun(adapter, prog);
    check(lbl, landed.verdict, 'null');
    check(`${ lbl } spells nothing itself`, landed.minted, false);
  });
runBoth('landRunOnDeepestBackedSpan/a DEAD `?.` inside the span still swaps in place',
  'let w; w = globalThis?.self.window?.Array;', (adapter, prog, lbl) => {
    const landed = landStoredRun(adapter, prog);
    check(lbl, landed.verdict, 'node');
    check(`${ lbl } minted`, landed.minted, true);
  });
runBoth('landRunOnDeepestBackedSpan/a `?.` over a STORED probe inside the span still collapses',
  'let w, d; w = (d = globalThis.window)?.self.Number;', (adapter, prog, lbl) => {
    const landed = landStoredRun(adapter, prog);
    check(lbl, landed.verdict, 'collapse');
    check(`${ lbl } spells nothing itself`, landed.minted, false);
  });

// the `delete` fold's BASE. the operator names a slot rather than reading a value, so the run's own
// ROOT binding answers - and where this build can spell no root, the deepest span pure can back
// does, because what the root spells gates nothing above it. read as "no landing exists" instead,
// the run stood down and left a native realm read standing in pure output
function deleteFoldLanding(adapter, prog, rootName, pure) {
  const path = adapter.pickPath(prog, 'AssignmentExpression');
  return proxyRunLandingPure({
    navNode: path.node.right,
    ctx: { scope: path.scope, adapter: { ...adapter, getBinding: () => null }, path },
    resolvePure: global => pure[global.name] ?? null,
    rootName,
    deleteFold: true,
  })?.hintName ?? null;
}

const SELF_PURE = { entry: 'actual/self', hintName: 'self', kind: 'global' };
const GLOBAL_THIS_PURE = { entry: 'actual/global-this', hintName: 'globalThis', kind: 'global' };

runBoth('proxyRunLandingPure/a delete fold keeps the ROOT binding over every hop above it',
  'let w; w = globalThis.self.window;', (adapter, prog, lbl) => {
    check(lbl, deleteFoldLanding(adapter, prog, 'globalThis',
      { self: SELF_PURE, globalThis: GLOBAL_THIS_PURE }), 'globalThis');
  });
runBoth('proxyRunLandingPure/a delete fold on an UNSPELLABLE root rides the deepest backed span',
  'let w; w = window.self;', (adapter, prog, lbl) => {
    check(lbl, deleteFoldLanding(adapter, prog, 'window', { self: SELF_PURE }), 'self');
  });
runBoth('proxyRunLandingPure/a delete fold with neither a root nor a backed span lands nothing',
  'let w; w = window.window;', (adapter, prog, lbl) => {
    check(lbl, deleteFoldLanding(adapter, prog, 'window',
      { self: SELF_PURE, globalThis: GLOBAL_THIS_PURE }), null);
  });

// WHICH name a realm hop has is the name canon's question and never the fold's: the dotted key, the
// string-literal computed key and one BOUND to a constant string all name the same slot, so a fold
// gating on the node's own SHAPE answered for one spelling and left the other two standing in a run
// their dotted twin folds whole - one hop with two names, which is the one thing the proxy alias
// may never have. an EFFECT-bearing key is the real boundary: it names the slot too, but the fold
// would take its effects with it and this verdict carries no slot to replay them in
// the scope surface these two ask for is the one every emitter hands the provider - a key BOUND to a
// constant string is reached through it, and a ctx without it answers the node-only half
function realmScopeAdapter(adapter) {
  return {
    ...adapter,
    method: 'usage-pure',
    isStringLiteral(node) { return node.type === 'StringLiteral' || (node.type === 'Literal' && typeof node.value === 'string'); },
    getStringValue(node) { return node.value; },
    hasBinding(scope, name) { return !!scope?.getBinding?.(name); },
    getBinding(scope, name) { return scope?.getBinding?.(name) ?? null; },
    getBindingNodeType(scope, name) { return scope?.getBinding?.(name)?.path?.node?.type ?? null; },
    isMutatedStatic() { return false; },
  };
}

function realmPure(global) {
  return global.name === 'self' ? SELF_PURE : global.name === 'globalThis' ? GLOBAL_THIS_PURE : null;
}

function hopFolds(adapter, prog) {
  const path = adapter.pickPath(prog, 'AssignmentExpression');
  return foldableRealmHop(path.node.right, {
    adapter: realmScopeAdapter(adapter),
    resolvePure: global => global.name === 'self' ? SELF_PURE : null,
    scope: path.scope,
    path,
  });
}

runBoth('foldableRealmHop/a dotted unbacked hop folds', 'let w; w = globalThis.self.window;',
  (adapter, prog, lbl) => check(lbl, hopFolds(adapter, prog), true));
runBoth('foldableRealmHop/a STRING-LITERAL key names the same hop', "let w; w = globalThis.self['window'];",
  (adapter, prog, lbl) => check(lbl, hopFolds(adapter, prog), true));
runBoth('foldableRealmHop/a key BOUND to a constant string names it too',
  "const k = 'window'; let w; w = globalThis.self[k];",
  (adapter, prog, lbl) => check(lbl, hopFolds(adapter, prog), true));
runBoth('foldableRealmHop/an EFFECT-bearing key is a hop no fold may take',
  "let c = 0, w; w = globalThis.self[(c++, 'window')];",
  (adapter, prog, lbl) => check(lbl, hopFolds(adapter, prog), false));
runBoth('foldableRealmHop/a BACKED hop is not this fold\'s either', 'let w; w = globalThis.window.self;',
  (adapter, prog, lbl) => check(lbl, hopFolds(adapter, prog), false));

// the claimless CALL-rooted plan reads the same canon for the hops it walks and for the run's own
// TERMINAL: read off the node alone a computed key named nothing, the plan declined the whole shape,
// and the fallback claim then stopped mid-run - a raw realm hop left standing off the ponyfill
// the anchor is the MEMBER path a binding's claim stands on, never the consumer above it: the plan
// climbs from that path to the run's end and asks the STORE question there, so handing it the
// assignment instead measured the plan at an anchor no binding uses
function callRootedVerdict(adapter, prog, { deleteFold = false, loweredGuardTest = false, end = 'customQ' } = {}) {
  const path = adapter.pickPath(prog, 'MemberExpression', p => p.node.property?.name === end);
  return planClaimlessCallRootedNav({
    deleteFold,
    loweredGuardTest,
    scope: path.scope,
    adapter: realmScopeAdapter(adapter),
    path,
    resolvePure: realmPure,
  })?.verdict ?? null;
}

const CALL_ROOT = 'const dh = () => globalThis;';
runBoth('planClaimlessCallRootedNav/a dotted hop run folds whole',
  `${ CALL_ROOT } const r = dh().self.window.customQ;`,
  (adapter, prog, lbl) => check(lbl, callRootedVerdict(adapter, prog), 'fold-whole'));
runBoth('planClaimlessCallRootedNav/a STRING-LITERAL hop key folds with it',
  `${ CALL_ROOT } const r = dh().self['window'].customQ;`,
  (adapter, prog, lbl) => check(lbl, callRootedVerdict(adapter, prog), 'fold-whole'));
runBoth('planClaimlessCallRootedNav/a key BOUND to a constant string folds with it',
  `const k = 'window'; ${ CALL_ROOT } const r = dh().self[k].customQ;`,
  (adapter, prog, lbl) => check(lbl, callRootedVerdict(adapter, prog), 'fold-whole'));
runBoth('planClaimlessCallRootedNav/an EFFECT-bearing hop key declines the shape',
  `let c = 0; ${ CALL_ROOT } const r = dh().self[(c++, 'window')].customQ;`,
  (adapter, prog, lbl) => check(lbl, callRootedVerdict(adapter, prog), null));
runBoth('planClaimlessCallRootedNav/a BOUND-key TERMINAL hop is the value the source reads',
  `const k = 'window'; ${ CALL_ROOT } let w; w = dh().self[k];`,
  (adapter, prog, lbl) => check(lbl, callRootedVerdict(adapter, prog, { end: 'k' }), 'kept-value'));
// ... and the `delete` fold is handed the member ENDING the run like every other consumer: walked to
// the chain TOP instead it carries plain members the plan declines outright, and the run then fell
// back to a hop claim that stopped mid-run
runBoth('planClaimlessCallRootedNav/the delete fold reaches past a PLAIN tail',
  `${ CALL_ROOT } const r = dh().self.window.a.customQ;`,
  (adapter, prog, lbl) => check(lbl, callRootedVerdict(adapter, prog, { deleteFold: true, end: 'a' }), 'fold-whole'));
runBoth('planClaimlessCallRootedNav/... and declines the chain TOP, which is not that member',
  `${ CALL_ROOT } const r = dh().self.window.a.customQ;`,
  (adapter, prog, lbl) => check(lbl, callRootedVerdict(adapter, prog, { deleteFold: true }), null));
// the guard that decides whether the delete HAPPENS spans the whole deleted RUN, so it is asked at
// the chain END: read off the anchored member alone, a `?.` on the tail ABOVE it went unseen and
// the fold then performed a delete on exactly the branch the source short-circuits past
runBoth('planClaimlessCallRootedNav/the delete-deciding guard is asked at the chain END',
  `${ CALL_ROOT } delete dh().self.window?.a.customQ;`,
  (adapter, prog, lbl) => check(lbl, callRootedVerdict(adapter, prog, { deleteFold: true, end: 'window' }), 'stand-down'));
// an already-LOWERED guard test carries no `?.` for these rules to reach - the branch it spells was
// the source's own, consumed by the test - so only a run landing on its own ROOT has nothing left
// above that landing for the test to read, and there the fold spells the identifier twin's bytes
runBoth('planClaimlessCallRootedNav/inside a lowered guard test a BACKED landing stands down',
  `${ CALL_ROOT } const r = dh().self.window.customQ;`,
  (adapter, prog, lbl) => check(lbl, callRootedVerdict(adapter, prog, { loweredGuardTest: true }), 'stand-down'));
runBoth('planClaimlessCallRootedNav/... and a ROOT landing folds there like its identifier twin',
  `${ CALL_ROOT } const r = dh().window.customQ;`,
  (adapter, prog, lbl) => check(lbl, callRootedVerdict(adapter, prog, { loweredGuardTest: true }), 'fold-whole'));

// the run's own END is the PLAN's to find, climbed from the anchor it is handed: a claim fires one
// hop short of that end whenever navigation continues above, and the climb spelled out at each
// binding instead asked the hop through a canon of its own, stopping a hop apart. the three anchors
// of one run answer alike, and the chain TOP - which is not that member - still declines
runBoth('planClaimlessCallRootedNav/the plan climbs to the run END from a claim one hop short',
  `${ CALL_ROOT } const r = dh().self.window.customQ;`,
  (adapter, prog, lbl) => check(lbl, callRootedVerdict(adapter, prog, { end: 'self' }), 'fold-whole'));
runBoth('planClaimlessCallRootedNav/... and stops where the realm run itself stops',
  `${ CALL_ROOT } const r = dh().self.window.a.customQ;`,
  (adapter, prog, lbl) => check(lbl, callRootedVerdict(adapter, prog, { end: 'self' }), 'fold-whole'));
runBoth('planClaimlessCallRootedNav/... reaching the same verdict from the run END itself',
  `${ CALL_ROOT } const r = dh().self.window.a.customQ;`,
  (adapter, prog, lbl) => check(lbl, callRootedVerdict(adapter, prog, { end: 'a' }), 'fold-whole'));

// the exported fallback-branch walker: the member / `in` producers enumerate a BRANCHING
// static receiver through the same walk the destructure form uses - lock the flattened
// per-branch metas (nested conditionals flatten; a shadowed branch drops)
runBoth('flattenFallbackBranches/nested conditional flattens static branches',
  'const r = (c ? Array : (d ? Iterator : Map)).from;', (adapter, prog, lbl) => {
    const cond = adapter.pickPath(prog, 'ConditionalExpression', p => p.parentPath?.node?.type !== 'ConditionalExpression');
    const metas = flattenFallbackBranches({ node: cond.node, key: 'from', scope: cond.scope, adapter: unionAdapter, path: cond });
    checkDeep(lbl, metas.map(m => ({ object: m.object, placement: m.placement })), [
      { object: 'Array', placement: 'static' },
      { object: 'Iterator', placement: 'static' },
      { object: 'Map', placement: 'static' },
    ]);
  });

// the `in`-branch and prototype-branch ATTACH sites are exercised through the fixture pipeline
// (real emitter adapters): their PRIMARY key resolution needs the full binding-wrapper contract
// (reaching-value walk) a minimal test adapter cannot supply, so a unit here would only fake it.
// the enumeration primitive itself is unit-locked above; the attach wiring is locked by the
// union fixtures' import-sets

// --- ownChainOptionalCount (the provider-decided optional-access flag) ---

// the symbol-iterator droppedSe routing reads `ownChainOptionalCount > 0` computed ONCE at
// detection instead of per-emitter probes: babel's node TYPES promote the whole chain while
// estree flags only the introducing hop, so any emitter-local re-derivation diverges on a
// mid-chain `?.`. SEALING wrappers (parens - a NODE in estree, `extra.parenthesized` in babel -
// plus casts and sequences) terminate the chain: a sealed `?.` is not live for this access and
// must classify NON-optional (the emitters' flat route is the one preserving its hop SE);
// the postfix `!` continues the chain in both grammars
for (const [variant, code, expected, parserPlugins] of [
  ['non-optional multi-hop', 'globalThis[k1].window[key];', 0],
  ['optional on the access itself', 'globalThis[k1]?.[key];', 1],
  ['optional one hop below', 'globalThis[k1]?.window[key];', 1],
  ['optional two hops below', 'globalThis?.[k1].window[key];', 1],
  ['optional three hops below', 'globalThis?.[k1].window.self[key];', 1],
  ['two optional hops', 'globalThis?.[k1]?.window[key];', 2],
  ['optional call hop', 'globalThis[k1]?.().window[key];', 1],
  ['paren-terminated optional seals', '(globalThis?.[k1]).window[key];', 0],
  ['sequence-buried optional seals', '(eff(), globalThis?.[k1]).window[key];', 0],
  ['cast-sealed optional', '(globalThis?.[k1] as any).window[key];', 0, ['typescript']],
  ['non-null postfix continues the chain', 'globalThis?.[k1]!.window[key];', 1, ['typescript']],
  // a `?.` inside a computed KEY belongs to the key's own chain, not the receiver's
  ['optional inside a computed key does not count', 'globalThis[k1?.x].window[key];', 0],
  // an outer live `?.` over a paren-sealed inner chain: only the outer one is live
  ['live outer over sealed inner', '(globalThis?.[k1])?.window[key];', 1],
]) {
  runBoth(`ownChainOptionalCount/${ variant }`, code, (adapter, prog, lbl) => {
    // babel promotes every member of an optional chain to OptionalMemberExpression - pick both types
    function isKeyAccess(p) {
      return p.node.property?.name === 'key';
    }
    const top = adapter.pickPath(prog, 'MemberExpression', isKeyAccess)
      ?? adapter.pickPath(prog, 'OptionalMemberExpression', isKeyAccess);
    check(lbl, ownChainOptionalCount(top.node), expected);
  }, parserPlugins);
}
// the sealed value asked about ITSELF, not through a read above it: a caller holding the callee of
// `(nav?.hop)(1)` holds the parenthesized node in the estree spelling and the flagged inner node in
// babel's. the value short-circuits either way, and answering 0 for the node spelling told the
// invoke gate the call was part of the chain - it folded the call into the guard's alternate, so a
// nullish root returned undefined where the source calls undefined and throws
runBoth('ownChainOptionalCount/the sealed value itself, as a callee', '(globalThis?.[k1])(1);', (adapter, prog, lbl) => {
  const call = adapter.pickPath(prog, 'CallExpression', () => true);
  check(lbl, ownChainOptionalCount(call.node.callee), 1);
});

// --- chainReadsThroughSeal (does a PLAIN read observe a sealed, short-circuitable value?) ---

// every render that folds chain steps into a guarded alternate, re-hangs a `?.` above one, or
// erases a claim asks this: a seal whose consumer read is PLAIN turns the source's short-circuit
// into a throw, so the guard may not answer `void 0` there. an OPTIONAL consumer performs no such
// read, and a seal over an always-defined value (the parens grouping an assignment) reads nothing
// that can throw. both parser spellings of the seal - the estree node and babel's flag - count
function sealReadPure(name) {
  return name === 'globalThis' || name === 'self'
    ? { entry: `actual/${ name === 'self' ? 'self' : 'global-this' }`, hintName: name, kind: 'global' } : null;
}
for (const [variant, code, expected, parserPlugins] of [
  ['seal below a plain read', '(globalThis.window?.self).self.box;', true],
  ['seal directly below the read', '(globalThis.window?.self).box;', true],
  ['seal below an OPTIONAL read', '(globalThis.window?.self)?.box;', false],
  ['seal over an always-defined value', '(q = globalThis).window?.self.box;', false],
  ['no seal at all', 'globalThis.window?.self.box;', false],
  ['cast-sealed plain read', '(globalThis.window?.self as any).self.box;', true, ['typescript']],
  ['bare non-null keeps the chain open', 'globalThis.window?.self!.box;', false, ['typescript']],
  // the write hands its value on, so the seal observes exactly what the nav produced - the value
  // question reads THROUGH the assignment. the routing verdict deliberately does not: flipping it
  // globally strands a raw root in a guard memo, so the through-write reading is opt-in
  ['chain-assign under the `?.`', '((q = globalThis.window)?.self).self.box;', true],
]) {
  runBoth(`chainReadsThroughSeal/${ variant }`, `let q; ${ code }`, (adapter, prog, lbl) => {
    function isBoxRead(p) {
      return p.node.property?.name === 'box';
    }
    const top = adapter.pickPath(prog, 'MemberExpression', isBoxRead)
      ?? adapter.pickPath(prog, 'OptionalMemberExpression', isBoxRead);
    check(lbl, chainReadsThroughSeal(top.node, ({ name }) => sealReadPure(name),
      { scope: top.scope, adapter, path: top }), expected);
  }, parserPlugins);
}

// contrast: the ROOT-finding walk aggregates across sealed boundaries by design - consumers
// keying emit ROUTES on it would over-report (the reason the flag uses the own-chain walk)
runBoth('descendToChainRoot/optionalCount aggregates across a paren seal', '(globalThis?.[k1]).window[key];', (adapter, prog, lbl) => {
  const top = adapter.pickPath(prog, 'MemberExpression', p => p.node.property?.name === 'key');
  check(lbl, descendToChainRoot(top.node).optionalCount, 1);
});

// --- mutationGuardKeepingHop (does a MUTATING consumer keep the `?.` over the environment probe?) ---

// the value canon's accepted answer for a probe is `undefined` where the source throws - a price
// only a READ can take. a write slot, an update and a `delete` PERFORM the act the nav leads to, so
// the branch the source wrote over the probe decides whether it lands, whatever spells the run
// below that probe. the rows below run the whole write-host enumeration against the same shape and
// pin the boundary with the negatives: a probe the value canon already calls absent-able, a probe
// read off ANOTHER probe (absent there, the read throws before the `?.` runs) and a hop naming no
// realm at all
function mutationHopPure(name) {
  return name === 'globalThis' || name === 'self'
    ? { entry: `actual/${ name === 'self' ? 'self' : 'global-this' }`, hintName: name, kind: 'global' } : null;
}
for (const [variant, code, expected] of [
  ['write slot keeps it', 'function w(v) { (globalThis.self.window?.self).Box = v; }', true],
  ['delete keeps it', 'const d = () => delete (globalThis.self.window?.self).Box;', true],
  ['delete without the seal keeps it', 'const d = () => delete globalThis.self.window?.self.Box;', true],
  ['update slot keeps it', 'function u() { (globalThis.self.window?.self).Box++; }', true],
  ['destructuring slot keeps it', 'function p(a) { [(globalThis.self.window?.self).Box] = a; }', true],
  ['for-of head keeps it', 'function f(a) { for ((globalThis.self.window?.self).Box of a); }', true],
  ['a store between the run and the delete keeps it',
    'let s; const d = () => delete (s = globalThis.self?.window?.self).Box;', true],
  // NEGATIVE: nothing is written, so the collapse answers a VALUE and the accepted price applies
  ['a plain read takes the accepted price', 'const r = (globalThis.self.window?.self).Box;', false],
  // NEGATIVE: the value canon already sees this branch - the ordinary channels build the guard
  ['a probe off the bare root is the value canon\'s own',
    'function w(v) { (globalThis.window?.self).Box = v; }', false],
  // NEGATIVE: the base under the probe is absent-able itself, so the read THROWS rather than
  // answering undefined and the `?.` above it is dead by throw
  ['a probe read off another probe is dead by throw',
    'function w(v) { (globalThis.window.window?.self).Box = v; }', false],
  // NEGATIVE: a hop naming no realm holds the user's own object - no environment probe here
  ['a non-realm hop below the probe is no realm span',
    'function w(v) { (globalThis.foo.window?.self).Box = v; }', false],
]) {
  runBoth(`mutationGuardKeepingHop/${ variant }`, code, (adapter, prog, lbl) => {
    // the `?.` hop is the claim's own path, which is what both emitters hand in; the two parsers
    // spell it as different node TYPES and agree only on the flag
    const [hop] = [...adapter.collectPaths(prog, 'MemberExpression', p => p.node.optional),
      ...adapter.collectPaths(prog, 'OptionalMemberExpression', p => p.node.optional)];
    check(lbl, !!mutationGuardKeepingHop(hop.node, ({ name }) => mutationHopPure(name),
      { scope: hop.scope, adapter, path: hop }), expected);
  });
}

// --- receiver re-reference classification (side-effect-key destructure plan) ---
// cross-parser: babel spells an object getter as ObjectMethod(kind get), estree as Property(kind get) -
// both must classify identically. an accessor re-fires on READ, so a literal bearing one is NOT safe to
// reference twice even though `mayHaveSideEffects` proves its CREATION pure - re-emitting the literal beside
// the residual would double-evaluate the getter. a side-effect-free MEMBER / BRANCHING receiver is
// memoize-only for the same reason (a second read re-fires the getter / re-selects the branch)
function receiverInit(adapter, prog) {
  return adapter.pickPath(prog, 'VariableDeclarator').node.init;
}
for (const [predicate, name, rows] of [
  [isReReferenceableReceiver, 'isReReferenceableReceiver', [
    ['identifier', 'const x = holder;', true],
    ['this', 'const x = this;', true],
    ['plain object', 'const x = { a: 1 };', true],
    ['object with identifier values', 'const x = { a: b };', true],
    ['plain array', 'const x = [1, 2];', true],
    ['method is not an accessor', 'const x = { m() {} };', true],
    ['constant template', 'const x = `abc`;', true],
    ['getter object', 'const x = { get z() { return 1; } };', false],
    ['setter object', 'const x = { set z(v) {} };', false],
    ['getter nested in an array', 'const x = [{ get z() { return 1; } }];', false],
    ['getter nested in an object', 'const x = { a: { get z() { return 1; } } };', false],
    ['call receiver', 'const x = make();', false],
    ['spread literal', 'const x = [...a];', false],
    // eslint-disable-next-line no-template-curly-in-string -- source string under test IS an interpolated template
    ['interpolated template', 'const x = `a${ y }`;', false],
  ]],
  [isSeFreeBranchingReceiver, 'isSeFreeBranchingReceiver', [
    ['pure ternary', 'const x = c ? [7] : [];', true],
    ['pure logical or', 'const x = a || b;', true],
    ['nullish', 'const x = a ?? b;', true],
    ['effectful ternary', 'const x = c ? f() : [];', false],
    ['effectful logical', 'const x = a || f();', false],
    ['non-branching literal', 'const x = [1, 2];', false],
    ['member is not branching', 'const x = holder.p;', false],
  ]],
  [isSeFreeMemberReceiver, 'isSeFreeMemberReceiver', [
    ['pure member', 'const x = holder.p;', true],
    ['effectful member object', 'const x = make().p;', false],
    ['non-member literal', 'const x = [1];', false],
  ]],
  [isConstantLiteralReceiver, 'isConstantLiteralReceiver', [
    ['constant array', 'const x = [1, 2, 3];', true],
    ['constant nested object', 'const x = { a: 1, b: { c: "s" } };', true],
    ['object with identifier bails', 'const x = { a: b };', false],
    ['getter object bails', 'const x = { get z() { return 1; } };', false],
    ['primitive is not extensible', 'const x = 5;', false],
  ]],
]) {
  for (const [variant, code, expected] of rows) {
    runBoth(`${ name }/${ variant }`, code, (adapter, prog, lbl) => check(lbl, predicate(receiverInit(adapter, prog)), expected));
  }
}

// --- isForXWriteTarget: transparent-wrapper matching ---
// a for-of head member write aliases same-slot body reads, so neither may polyfill. TS casts
// survive both parsers and parens survive the oxc parse - a wrapper on the read receiver or
// on the head object must not break the slot match. the babel leg parses paren forms flat
// (parens stripped at parse), so it asserts the bare shape while the oxc leg carries the node
function pickCalleeMember(adapter, prog) {
  // babel promotes optional reads to OptionalMemberExpression/OptionalCallExpression node
  // TYPES; estree keeps plain types with optional flags - probe both spellings
  for (const type of ['MemberExpression', 'OptionalMemberExpression']) {
    const found = adapter.pickPath(prog, type, p => {
      const parentType = p.parentPath?.node?.type;
      return parentType === 'CallExpression' || parentType === 'OptionalCallExpression';
    });
    if (found) return found;
  }
  return null;
}
for (const [variant, code, expected] of [
  ['bare control', 'for (o.at of fns) { o.at(0); }', true],
  ['cast-wrapped body read', 'for (o.at of fns) { (o as any).at(0); }', true],
  ['paren-wrapped body read', 'for (o.at of fns) { (o).at(0); }', true],
  ['cast-wrapped head object', 'for ((o as any).includes of fns) { o.includes(1); }', true],
  ['paren-wrapped head target', 'for ((o.flat) of fns) { o.flat(); }', true],
  // optionality reads the SAME slot: babel spells the read OptionalMemberExpression while
  // estree keeps MemberExpression under a ChainExpression - both must match the write
  ['optional body read', 'for (o.at of fns) { o?.at(0); }', true],
  ['deep optional chain read', 'for (o.x.at of fns) { o?.x?.at(0); }', true],
  ['bracket key with cast-wrapped head', "for ((o as any)['at'] of fns) { o.at(0); }", true],
  ['different receiver same key', 'for (a.map of fns) { b.map(f); }', false],
  ['optional read of a different receiver', 'for (a.flat of fns) { b?.flat(); }', false],
  ['optional call of the written member', 'for (o.at of fns) { o.at?.(0); }', true],
  ['labeled loop cast head', 'outer: for ((o as any).at of fns) { o.at(0); }', true],
  // pattern-nested write targets exercise the pattern branches of the write collection
  // (array element / default left / property value), each with its own wrapper peel
  ['array-pattern cast target', 'for ([(o as any).at] of fns) { o.at(0); }', true],
  ['array-pattern default target', 'for ([o.at = dflt] of fns) { o.at(0); }', true],
  ['object-pattern paren value target', 'for ({ x: (o.at) } of fns) { o.at(0); }', true],
  ['for-await cast head', 'async function f(gen) { for await ((o as any).at of gen) { o.at(0); } }', true],
  ['bracket key + optional read combo', "for (o['at'] of fns) { o?.['at'](0); }", true],
  // dynamic computed keys have no static name - structural compare pairs same-name key
  // reads with the write and rejects a different key variable
  ['dynamic computed key optional read', 'for (o[k] of fns) { o?.[k](0); }', true],
  ['dynamic computed key different var', 'for (o[k] of fns) { o[j]?.(0); }', false],
]) {
  runBoth(`isForXWriteTarget/${ variant }`, code, (adapter, prog, lbl) => {
    check(lbl, isForXWriteTarget(pickCalleeMember(adapter, prog)), expected);
  }, ['typescript']);
}
// the wrapped head member itself stays a write target through the identity route
runBoth('isForXWriteTarget/cast-wrapped head target itself',
  'for ((o as any).values of fns) { use(o); }', (adapter, prog, lbl) => {
    const head = adapter.pickPath(prog, 'MemberExpression', () => true);
    checkTruthy(lbl, isForXWriteTarget(head));
  }, ['typescript']);

// --- destructurePatternHostPath / destructureAssignmentValueIsCaptured ---

// a destructuring ASSIGNMENT yields its right side, so a receiver rewritten into a synth mirror
// literal changes what a consumer of that value captures. the predicate answers per LEAF, off the
// node its own pattern chain climbs out into - a declarator, parameter or catch host never captures
// an assignment value and answers false whatever its shape
const CAPTURED_VALUE_CASES = [
  ['declarator captures', 'const host = ({ assign: a } = shim || Object);', 'AssignmentExpression', true],
  ['assignment captures', 'host = ({ assign: a } = shim || Object);', 'AssignmentExpression', true],
  ['return captures', 'function f() { return ({ assign: a } = Object); }', 'AssignmentExpression', true],
  ['call argument captures', 'use(({ assign: a } = Object));', 'AssignmentExpression', true],
  ['nested pattern still captures', 'const host = ({ inner: { assign: a } } = src);', 'AssignmentExpression', true],
  ['array-wrapped pattern still captures', 'const host = ([{ assign: a }] = src);', 'AssignmentExpression', true],
  ['statement position discards', '({ assign: a } = Object);', 'AssignmentExpression', false],
  ['parenthesized statement discards', '(({ assign: a } = Object));', 'AssignmentExpression', false],
  ['declarator host is not an assignment', 'const { assign: a } = Object;', 'VariableDeclarator', false],
  ['parameter host is not an assignment', 'function f({ assign: a }) { return a; }', 'FunctionDeclaration', false],
  ['catch host is not an assignment', 'try { risky(); } catch ({ assign: a }) { use(a); }', 'CatchClause', false],
];
for (const [variant, code, hostType, expected] of CAPTURED_VALUE_CASES) {
  runBoth(`destructureAssignmentValueIsCaptured/${ variant }`, code, (adapter, prog, lbl) => {
    const leaf = pickProp(adapter, prog);
    check(`${ lbl }/host`, destructurePatternHostPath(leaf)?.node?.type, hostType);
    check(lbl, destructureAssignmentValueIsCaptured(leaf), expected);
  });
}

// --- catchPropRewriteObservable ---

// whether a catch-hosted prop earns its `_ref`-bound rewrite is a PER-PROP question: the body reads
// the binding, the prop reads through the receiver itself, or a rest sibling makes the residual
// exclusion-bearing. a sibling that forced the pattern's relocation says nothing about this prop
function walkNodes(root, visit, parent = null) {
  if (!root || typeof root.type !== 'string') return;
  visit(root, parent);
  for (const value of Object.values(root)) {
    if (Array.isArray(value)) for (const child of value) walkNodes(child, visit, root);
    else if (value && typeof value.type === 'string') walkNodes(value, visit, root);
  }
}
const CATCH_PROP_CASES = [
  ['body reads the binding', 'try { r(); } catch ({ at }) { use(at); }', 'at', true],
  ['body never reads it', 'try { r(); } catch ({ at }) { use(other); }', 'at', false],
  ['machinery sibling does not make it observable', 'try { r(); } catch ({ [Symbol.iterator]: it, at }) { use(it); }', 'at', false],
  ['rest sibling makes it observable', 'try { r(); } catch ({ at, ...rest }) { use(rest); }', 'at', true],
  ['own default makes it observable', 'try { r(); } catch ({ at = 1 }) { use(other); }', 'at', true],
  ['a member tail is not a read', 'try { r(); } catch ({ at }) { use(host.at); }', 'at', false],
  ['a shadowing function id is not a read', 'try { r(); } catch ({ at }) { use(function at() {}); }', 'at', false],
  ['an object key is not a read', 'try { r(); } catch ({ at }) { use({ at: 1 }); }', 'at', false],
];
for (const [variant, code, localName, expected] of CATCH_PROP_CASES) {
  runBoth(`catchPropRewriteObservable/${ variant }`, code, (adapter, prog, lbl) => {
    const clause = adapter.pickPath(prog, 'CatchClause', () => true);
    const propNode = clause.node.param.properties.find(p => p.value?.name === localName
      || p.value?.left?.name === localName);
    check(lbl, catchPropRewriteObservable({
      propNode, patternNode: clause.node.param, bodyNode: clause.node.body, localName, walkNode: walkNodes,
    }), expected);
  });
}

// --- asSymbolRef: the polyfillHint side-channel outranks the capitalisation probe ---

// the capitalisation probe bounds the const-alias walk for USER names. a binding the plugin minted
// in place carries its original global in `polyfillHint` and is NOT capitalised, so gating the hint
// behind the convention makes the plugin fail to recognise its own rewrite
// both detect-usage adapters attach the hint to the binding record they hand back, which is the
// spelling the binding walk reads; the hook is the resolve-node-type adapter's spelling
function hintAdapter(hints) {
  return {
    ...minimalAdapter,
    method: 'usage-pure',
    getBinding(scope, name) {
      const binding = scope?.getBinding?.(name);
      return binding && hints[name] ? { ...binding, polyfillHint: hints[name] } : binding;
    },
    getBindingNodeType() { return null; },
  };
}
const SYMBOL_REF_CASES = [
  ['minted lowercase alias with a Symbol hint', 'const _Symbol = 1; use(_Symbol.iterator);', { _Symbol: 'Symbol' }, true],
  ['minted alias hinted at another global', 'const _Symbol = 1; use(_Symbol.iterator);', { _Symbol: 'Map' }, false],
  ['uncapitalised alias with no hint', 'const sym = 1; use(sym.iterator);', {}, false],
  ['capitalised alias with no hint stays on the walk', 'const Sym = 1; use(Sym.iterator);', {}, false],
];
for (const [variant, code, hints, expected] of SYMBOL_REF_CASES) {
  runBoth(`asSymbolRef/${ variant }`, code, (adapter, prog, lbl) => {
    const member = adapter.pickPath(prog, 'MemberExpression', p => p.node.object?.type === 'Identifier');
    check(lbl, !!asSymbolRef({
      node: member.node.object, scope: member.scope, adapter: hintAdapter(hints), path: member,
    }), expected);
  });
}

// --- probeRenderedReceiver: our probe render in RECEIVER position survives a re-parse ---

// a second pass's receiver swap over `(held.X, _Ponyfill).member` would eat the throw probe the
// first pass kept; the recognition is the polyfillHint tail - the same side-channel the claim
// twin (claimAlreadyRendered) reads - so a re-parsed probe still declines the swap, and a plain
// user sequence keeps its ordinary route
const PROBE_RECEIVER_CASES = [
  ['probe sequence with a hinted tail', 'const _Promise = 1; use((held.Promise, _Promise).noSuchStatic);', { _Promise: 'Promise' }, true],
  ['sequence with an unhinted tail', 'const plain = 1; use((held.Promise, plain).noSuchStatic);', {}, false],
  ['plain member receiver', 'const _Promise = 1; use(_Promise.noSuchStatic);', { _Promise: 'Promise' }, false],
  ['paren-wrapped probe sequence', 'const _Promise = 1; use(((held.Promise, _Promise)).noSuchStatic);', { _Promise: 'Promise' }, true],
];
for (const [variant, code, hints, expected] of PROBE_RECEIVER_CASES) {
  runBoth(`probeRenderedReceiver/${ variant }`, `const held = globalThis.window; ${ code }`, (adapter, prog, lbl) => {
    const member = adapter.pickPath(prog, 'MemberExpression', p => p.node.property?.name === 'noSuchStatic');
    check(lbl, probeRenderedReceiver(member.node.object, {
      scope: member.scope, adapter: hintAdapter(hints), path: member,
    }), expected);
  });
}

// --- enclosingParameterListOwner / bindingInvisibleFromUseRegion ---

// a parameter list is its own lexical region. both scope trackers hoist body declarations onto the
// function scope, so without this rule `function f(x = Map) { var Map = 1 }` reads the body binding
// where the language reads the OUTER one. the declaration is located STRUCTURALLY, not through a
// tracker - the rule is what is under test, not either tracker's view of it
const DECLARATION_ID_PARENTS = new Set(['VariableDeclarator', 'FunctionDeclaration', 'ClassDeclaration']);
// oxc reports an object method as a FunctionExpression; both are the same parameter owner
const PARAM_FRAME_CASES = [
  ['default of a function declaration', 'function f(x = Map) { var Map = 1; }', ['FunctionDeclaration'], true],
  ['default of an arrow', 'const f = (x = Map) => { let Map = 1; };', ['ArrowFunctionExpression'], true],
  ['default of a method', 'const o = { m(x = Map) { const Map = 1; } };', ['ObjectMethod', 'FunctionExpression'], true],
  ['second parameter default', 'function f(a, x = Map) { class Map {} }', ['FunctionDeclaration'], true],
  ['destructured parameter default', 'function f({ y } = Map) { function Map() {} }', ['FunctionDeclaration'], true],
  ['body declaration is nested in a block', 'function f(x = Map) { { var Map = 1; } }', ['FunctionDeclaration'], true],
  ['a use in the BODY is not in the frame', 'function g(a) { var Map = 1; return Map; }', [], false],
  ['an outer declaration is not the body', 'var Map = 1; function f(x = Map) { }', ['FunctionDeclaration'], false],
];
for (const [variant, code, ownerTypes, invisible] of PARAM_FRAME_CASES) {
  runBoth(`parameterFrame/${ variant }`, code, (adapter, prog, lbl) => {
    const named = adapter.collectPaths(prog, 'Identifier', p => p.node.name === 'Map');
    const declId = named.find(p => DECLARATION_ID_PARENTS.has(p.parentPath?.node?.type)
      && p.parentPath.node.id === p.node);
    const use = named.find(p => p !== declId && p.parentPath?.node?.type !== 'VariableDeclarator');
    const owner = enclosingParameterListOwner(use)?.node?.type ?? null;
    check(`${ lbl }/owner`, owner === null ? 0 : ownerTypes.includes(owner) ? 1 : owner, ownerTypes.length ? 1 : 0);
    check(lbl, bindingInvisibleFromUseRegion(declId?.parentPath ?? null, use), invisible);
  });
}

// --- enclosingParameterDecoratorOwner ---

// a parameter decorator is evaluated where the CLASS is defined, so nothing the decorated function
// declares - parameters included - shadows a name it reads. only the parameter-property arm of this
// fact had a carve-out; the ordinary parameter and the body are the same rule.
// BABEL ONLY, and not by preference: estree-toolkit's visitor keys for `Identifier` do not include
// `decorators`, so no path exists inside a plain parameter's decorator on that side and the
// predicate can never be asked there. unplugin reaches the expression through its own subtree
// walker and already resolves these reads to the global, so nothing depends on it
const PARAM_DECORATOR_CASES = [
  ['decorator over a parameter of that name', 'class C { constructor(@dec(Map) Map) {} }', true, true],
  ['decorator over a parameter, body declares it', 'class C { constructor(@dec(Map) x) { let Map = 1; } }', true, true],
  ['decorator on a method, not a parameter', 'class C { @dec(Map) m() { let Map = 1; } }', false, false],
  ['decorator on a class', '@dec(Map) class C { }', false, false],
  ['a parameter DEFAULT is not a decorator', 'class C { constructor(x = Map) { let Map = 1; } }', false, true],
  // the carve-out is about what the DECORATED function declares. a binding written inside the
  // decorator sits in the same subtree as the use and covers it - reporting it invisible makes
  // usage-pure rewrite the user's own name
  ['decorator argument declares the name itself', 'class C { constructor(@dec((Map) => f(Map)) x) {} }', true, false],
];
for (const [variant, code, isDecorator, invisible] of PARAM_DECORATOR_CASES) {
  const label = `parameterDecorator/${ variant } [babel]`;
  const prog = babelAdapter.parseAndScope(code, 'module', ['decorators-legacy']);
  // the READ, located structurally: the decorator call's argument, or a parameter default's right.
  // a positional pick would land on the same-named PARAMETER instead
  const [use] = babelAdapter.collectPaths(prog, 'Identifier', p => p.node.name === 'Map'
    && (p.parentPath?.node?.arguments?.includes(p.node) || p.parentPath?.node?.right === p.node));
  check(`${ label }/owner`, !!enclosingParameterDecoratorOwner(use), isDecorator);
  const [decl] = babelAdapter.collectPaths(prog, 'Identifier', p => p.node.name === 'Map'
    && p.parentPath?.node?.type === 'VariableDeclarator' && p.parentPath.node.id === p.node);
  // in the first row the same-named PARAMETER is the declaration
  const [param] = babelAdapter.collectPaths(prog, 'Identifier', p => p.node.name === 'Map'
    && p.parentPath?.node?.params?.includes(p.node));
  check(label, bindingInvisibleFromUseRegion(decl?.parentPath ?? param ?? null, use), invisible);
}

// the var gate has to answer the decorator question too, and `var` is where the two gates could
// drift: it is not a REGION case, so the first gate ignores it, while a body `var` genuinely does
// not reach a decorator - TypeScript emits the decorator expression outside the class. only the
// decorated function's OWN frame is exempt. babel-only for the reason given above
// the read is nested in a CLOSURE inside the decorator: read directly in the decorator argument
// the parameter-list carve-out already answers, because the parameter is then the climb's own child
const DECORATOR_VAR_CASES = [
  ['the decorated function body', 'class C { constructor(@dec(() => f(Map)) x) { var Map = 1; } }', false],
  ['a frame further out', 'function g() { var Map = 1; class C { constructor(@dec(() => f(Map)) x) {} } }', true],
  ['read directly in the decorator argument', 'class C { constructor(@dec(Map) x) { var Map = 1; } }', false],
];
for (const [variant, code, covered] of DECORATOR_VAR_CASES) {
  const prog = babelAdapter.parseAndScope(code, 'module', ['decorators-legacy']);
  const [use] = babelAdapter.collectPaths(prog, 'Identifier', p => p.node.name === 'Map'
    && p.parentPath?.node?.arguments?.includes(p.node));
  check(`decoratorVarFrame/${ variant } [babel]`, !!findFunctionScopeVarInPath(use, 'Map'), covered);
  // the same climb feeds the two RESOLVER-side readers; asked here directly rather than through the
  // emitted helper, which cannot tell them apart
  check(`decoratorVarFrame/${ variant } declarator [babel]`,
    !!findFunctionScopeVarDeclaratorInPath(use, 'Map'), covered);
  check(`decoratorVarFrame/${ variant } synth twin [babel]`, !!synthHoistedBinding(use, 'Map'), covered);
  check(`decoratorVarFrame/${ variant } var owner [babel]`, !!findVarOwnerDeclaring(use, 'Map'), covered);
}

// --- bindingInvisibleFromUseRegion: the statement-head region ---

// the third region of the same rule: a statement HEAD is outside the statement's BODY, so a body
// `let` does not cover a use in the head. `var` is the boundary - it hoists to the function scope
// and covers the head, which is why the region is asked about the DECLARATION's position rather
// than about the loop form
const STATEMENT_HEAD_CASES = [
  ['for-init', 'for (let i = Map; false;) { let Map = 1; }', true, true],
  ['for-test', 'for (let i = 0; i < Map;) { let Map = 1; }', true, true],
  ['for-update', 'for (let i = 0; false; Map) { let Map = 1; }', true, true],
  ['for-of right', 'for (const x of Map) { let Map = 1; }', true, true],
  ['for-in right', 'for (const k in Map) { let Map = 1; }', true, true],
  ['while test', 'while (Map) { let Map = 1; }', true, true],
  ['do-while test', 'do { let Map = 1; } while (Map);', true, true],
  ['if test', 'if (Map) { let Map = 1; }', true, true],
  ['if test, declaration in the alternate', 'if (Map) { x(); } else { let Map = 1; }', true, true],
  ['a use in the BODY is not a head', 'for (let i = 0; false;) { let Map = 1; y(Map); }', false, false],
  ['an outer declaration is not the body', 'let Map = 1; for (let i = Map; false;) { }', true, false],
  ['a body declaration nested in a block', 'while (Map) { { let Map = 1; } }', true, true],
  ['no enclosing statement', 'const f = () => Map; let Map = 1;', false, false],
];
for (const [variant, code, , invisible] of STATEMENT_HEAD_CASES) {
  runBoth(`statementHead/${ variant }`, code, (adapter, prog, lbl) => {
    const named = adapter.collectPaths(prog, 'Identifier', p => p.node.name === 'Map');
    const declId = named.find(p => DECLARATION_ID_PARENTS.has(p.parentPath?.node?.type)
      && p.parentPath.node.id === p.node);
    const use = named.find(p => p !== declId && p.parentPath?.node?.id !== p.node);
    check(lbl, bindingInvisibleFromUseRegion(declId?.parentPath ?? null, use), invisible);
  });
}

// --- type space vs value space for the same name ---
// a type-only import is elided by tsc, so the VALUE of that name is the global and must still be
// polyfilled - but in a TYPE position the same import IS the shadow. the walker reports which host
// a name came from so the two questions stay apart
function annotationHosts(prog, type) {
  const node = findTypeNode(prog.node ?? prog, type);
  if (!node) throw new Error(`no ${ type } node found`);
  const found = [];
  walkTypeAnnotationGlobals(node, (name, hostType) => found.push(`${ name }@${ hostType }`), annotationWalkCtx(prog));
  return found;
}

runBoth('walkTypeAnnotationGlobals/reports a plain type reference host',
  'let x: Set<number>;', (adapter, prog, lbl) => {
    checkDeep(lbl, annotationHosts(prog, 'TSTypeReference'), ['Set@TSTypeReference']);
  });

runBoth('walkTypeAnnotationGlobals/reports a typeof query host apart',
  'let x: typeof Set;', (adapter, prog, lbl) => {
    checkDeep(lbl, annotationHosts(prog, 'TSTypeQuery'), ['Set@TSTypeQuery']);
  });

{
  // the predicate reads the binding through the adapter view, so a stub adapter states the case
  // exactly: one name, one import kind, one host
  function adapterFor(importKind) {
    return { getBinding: () => ({ importKind }) };
  }
  function ask(importKind, hostType) {
    return typeOnlyImportShadows({
      adapter: adapterFor(importKind), scope: null, name: 'Set', path: null, hostType,
    });
  }
  check('typeOnlyImportShadows/type import shadows a type reference', ask('type', 'TSTypeReference'), true);
  check('typeOnlyImportShadows/flow typeof import shadows too', ask('typeof', 'TSTypeReference'), true);
  check('typeOnlyImportShadows/value import does not shadow', ask('value', 'TSTypeReference'), false);
  check('typeOnlyImportShadows/no import kind does not shadow', ask(null, 'TSTypeReference'), false);
  // `typeof X` names the runtime binding the import never provides - the global stays exposed
  check('typeOnlyImportShadows/typeof query is value space', ask('type', 'TSTypeQuery'), false);
  // a binding-less name view must not read as a shadow either
  check('typeOnlyImportShadows/no binding at all', typeOnlyImportShadows({
    adapter: { getBinding: () => null }, scope: null, name: 'Set', path: null, hostType: 'TSTypeReference',
  }), false);
}

// --- mutatedStaticLandingVerdict: three-valued, because its consumers owe `unknown` opposite defaults ---

// the walk climbs from an optional proxy hop to the static it lands on and reports whether THAT static
// is one the file replaced. a key it cannot name is no landing verdict at all: read as "no mutated
// landing" it told the deopt to drop a guard over a value that can be undefined, and told the
// render-anchor arm to keep its own path - the same bit standing for two opposite defaults
{
  const landingAdapter = {
    isStringLiteral(node) { return node.type === 'StringLiteral' || (node.type === 'Literal' && typeof node.value === 'string'); },
    getStringValue(node) { return node.value; },
    hasBinding(scope, name) { return !!scope?.getBinding?.(name); },
    getBinding(scope, name) { return scope?.getBinding?.(name) ?? null; },
  };
  // the walk anchors at the hop whose key names the global, and climbs to the static above it
  function landingVerdict(adapter, prog, mutated) {
    const hop = adapter.pickPath(prog, 'MemberExpression', p => p.node.object?.type === 'Identifier'
      && p.node.object.name === 'g');
    return mutatedStaticLandingVerdict({
      path: hop, scope: hop.scope, adapter: landingAdapter, mutatedSet: new Set(mutated),
    });
  }
  runBoth('mutatedStaticLandingVerdict/replaced landing answers yes',
    'const g = globalThis;\nexport const r = g.Array.of(1);', (adapter, prog, lbl) => {
      check(lbl, landingVerdict(adapter, prog, ['Array.of']), 'yes');
    });
  runBoth('mutatedStaticLandingVerdict/untouched landing answers no',
    'const g = globalThis;\nexport const r = g.Array.of(1);', (adapter, prog, lbl) => {
      check(lbl, landingVerdict(adapter, prog, ['Array.from']), 'no');
    });
  // an unnameable key is the case the boolean could not express: the landing may or may not be the
  // replaced one, and every consumer has to hear that rather than a verdict
  runBoth('mutatedStaticLandingVerdict/unnameable landing key answers unknown',
    'const g = globalThis;\nconst k = String(Math.random());\nexport const r = g.Array[k](1);', (adapter, prog, lbl) => {
      check(lbl, landingVerdict(adapter, prog, ['Array.of']), 'unknown');
    });
  // ... and a file that replaced nothing answers before any walk happens
  runBoth('mutatedStaticLandingVerdict/no mutation at all answers no',
    'const g = globalThis;\nconst k = String(Math.random());\nexport const r = g.Array[k](1);', (adapter, prog, lbl) => {
      check(lbl, landingVerdict(adapter, prog, []), 'no');
    });
}

// --- checkTypeAnnotations: the class / function annotation slots, descended by the walk's own table ---

// the helper opens the walk on a node that is not itself an annotation; every slot such a node
// carries is a child key the walk descends, so the peels a parameter list needs - a parameter
// PROPERTY wrapping the annotated binding, a defaulted parameter carrying it on the pattern's left -
// are table entries, not a loop beside the walk. these rows are what keeps them there
{
  function slotGlobals(adapter, prog, type) {
    const host = adapter.pickPath(prog, type);
    if (!host) throw new Error(`no ${ type } node found`);
    const found = [];
    checkTypeAnnotations(host.node, name => found.push(name), annotationWalkCtx(prog));
    return [...new Set(found)].sort();
  }
  // babel spells a class method `ClassMethod`, oxc `MethodDefinition` over a FunctionExpression -
  // the annotated parameter list is the same node either way
  runBoth('checkTypeAnnotations/parameter property', 'class C { constructor(public m: Map<number>) {} }',
    (adapter, prog, lbl) => {
      checkDeep(lbl, slotGlobals(adapter, prog, adapter.name === 'babel' ? 'ClassMethod' : 'FunctionExpression'), ['Map']);
    });
  runBoth('checkTypeAnnotations/defaulted parameter', 'declare function f(x: Set<number>): void;',
    (adapter, prog, lbl) => {
      checkDeep(lbl, slotGlobals(adapter, prog, 'TSDeclareFunction'), ['Set']);
    });
  runBoth('checkTypeAnnotations/return type and type parameters',
    'declare function h<T extends Promise<number>>(): Reflect;', (adapter, prog, lbl) => {
      checkDeep(lbl, slotGlobals(adapter, prog, 'TSDeclareFunction'), ['Promise', 'Reflect']);
    });
}

// --- the annotation lane's shadow question: a type parameter in scope, an infer in its branch ---
{
  function slotGlobals(adapter, prog, type) {
    const host = adapter.pickPath(prog, type);
    if (!host) throw new Error(`no ${ type } node found`);
    const found = [];
    checkTypeAnnotations(host.node, name => found.push(name), annotationWalkCtx(prog));
    return [...new Set(found)].sort();
  }
  // the walk hands every reference to the sink, the alias's own parameter `T` included - the
  // sink is where a parameter in scope is filtered; the infer's name never reaches it at all
  runBoth('walkTypeAnnotationGlobals/an infer covers the true branch', 'type U<T> = T extends Array<infer Set> ? Set : never;',
    (adapter, prog, lbl) => {
      checkDeep(lbl, slotGlobals(adapter, prog, 'TSTypeAliasDeclaration'), ['Array', 'T']);
    });
  runBoth('walkTypeAnnotationGlobals/the false branch reads the global', 'type U<T> = T extends Array<infer Set> ? 1 : Set<T>;',
    (adapter, prog, lbl) => {
      checkDeep(lbl, slotGlobals(adapter, prog, 'TSTypeAliasDeclaration'), ['Array', 'Set', 'T']);
    });
  runBoth('annotationNameIsGlobal/a type parameter of the host shadows', 'interface Box<Set> { v: Set }',
    (adapter, prog, lbl) => {
      const host = adapter.pickPath(prog, 'TSInterfaceDeclaration');
      check(lbl, annotationNameIsGlobal({ ...annotationWalkCtx(prog), path: host, name: 'Set', hostType: 'TSTypeReference' }), false);
    });
  runBoth('annotationNameIsGlobal/an enclosing class parameter shadows the method annotation', 'class C<WeakMap> { m(v: WeakMap): void {} }',
    (adapter, prog, lbl) => {
      const method = adapter.pickPath(prog, adapter.name === 'babel' ? 'ClassMethod' : 'FunctionExpression');
      check(lbl, annotationNameIsGlobal({ ...annotationWalkCtx(prog), path: method, name: 'WeakMap', hostType: 'TSTypeReference' }), false);
    });
  runBoth('annotationNameIsGlobal/no parameter, the global', 'interface Plain { v: Reflect }',
    (adapter, prog, lbl) => {
      const host = adapter.pickPath(prog, 'TSInterfaceDeclaration');
      check(lbl, annotationNameIsGlobal({ ...annotationWalkCtx(prog), path: host, name: 'Reflect', hostType: 'TSTypeReference' }), true);
    });
}

// the positional element slot pairs a reading claim beside a SPREAD (the wrapper survives whole
// there), and never a computed key carrying an EFFECT: the rename drops the pattern that spells
// the key, and with it the effect the source runs
runBoth('resolvePositionalElementSlot/spread-bearing init takes the plain leaf',
  'const [{ y: { at: v } }] = [{ y: arr }, ...rest];', (adapter, prog, lbl) => {
    const leaf = adapter.pickPath(prog, 'Property', p => p.node.key?.name === 'at')
      ?? adapter.pickPath(prog, 'ObjectProperty', p => p.node.key?.name === 'at');
    const slot = resolvePositionalElementSlot(leaf);
    check(lbl, slot?.declarator?.node?.type, 'VariableDeclarator');
    checkDeep(`${ lbl } keys`, slot?.keys, ['y']);
  });
runBoth('resolvePositionalElementSlot/effectful computed key declines even when sole',
  'const [{ [(k(), "at")]: v }] = [arr, ...rest];', (adapter, prog, lbl) => {
    const leaf = adapter.pickPath(prog, 'Property', p => p.node.computed)
      ?? adapter.pickPath(prog, 'ObjectProperty', p => p.node.computed);
    check(lbl, resolvePositionalElementSlot(leaf), null);
  });

// --- the escaping-constructor census over the slots a source can leave ABSENT ---

function censusStamps(programNode) {
  collectFileCensus(programNode, [escapedCtorReferencesReducer()]);
  return ESCAPED_CTOR_REFS.get(programNode).size;
}

// an array literal's element slot can be a HOLE, and a hole redefines nothing: the container is
// handed out whole only where a SPREAD may have filled the slot the read names
runBoth('escaped-ctor census/an array hole is no spread', 'const NS = [, Map];\nsink(NS[9]);',
  (adapter, prog, lbl) => check(lbl, censusStamps(prog.node), 0));
runBoth('escaped-ctor census/a spread hands the container out whole', 'const NS = [...s, Map];\nsink(NS[9]);',
  (adapter, prog, lbl) => check(lbl, censusStamps(prog.node), 2));

// a class DECLARATION can bind no name at all - `export default class {}` - and a container nothing
// names is reachable through no chain the census can follow. the export hands the class itself out,
// which stamps its own static either way, so the pair is what isolates the claim: the READ adds
// nothing, where a slot wrongly resolved off the nameless class would make it two
runBoth('escaped-ctor census/a nameless class declaration is stamped by its export alone',
  'const x = {};\nexport default class { static Base = Map; }',
  (adapter, prog, lbl) => check(lbl, censusStamps(prog.node), 1));
runBoth('escaped-ctor census/a nameless class declaration binds no container name',
  'const x = {};\nexport default class { static Base = Map; }\nsink(x.Base);',
  (adapter, prog, lbl) => check(lbl, censusStamps(prog.node), 1));
runBoth('escaped-ctor census/a named class declaration binds its statics',
  'class NS { static Base = Map; }\nsink(NS.Base);',
  (adapter, prog, lbl) => check(lbl, censusStamps(prog.node), 1));

// `bind` invoked on the spot carries the arguments it captured ahead of the call's - and it may
// have captured NONE, in which case there is no leading argument to read a spread off
runBoth('callPairing/a bind with no captured arguments', 'f.bind()();', (adapter, prog, lbl) => {
  const pairing = callPairing(adapter.pickPath(prog, 'CallExpression', p => p.node.callee.type === 'CallExpression').node);
  checkDeep(lbl, [pairing.args.length, pairing.argsUnknown], [0, false]);
});
runBoth('callPairing/a bind capturing a spread cannot place the arguments', 'f.bind(...s)();', (adapter, prog, lbl) => {
  const pairing = callPairing(adapter.pickPath(prog, 'CallExpression', p => p.node.callee.type === 'CallExpression').node);
  checkDeep(lbl, [pairing.args.length, pairing.argsUnknown], [0, true]);
});

// --- the container slot an ESCAPE names: the whole key path, not the hop above it ---

// the census records what a value handed out of the file re-homes. the slot that leaks is the one
// the read LANDS on, so a multi-hop member escape (`f(ns.g.Map)`) owes `ns.g.Map` - recording the
// `ns.g` it navigates through poisons the very container slot the receiver walk descends, and every
// value read through a container then stopped resolving while `new` / `extends` (no escape) kept
// working. one spelling serves the write recorder and this one
function censusSlots(programNode) {
  const { writtenContainerSlots } = collectFileCensus(programNode, [mutationShapesReducer(null)]);
  // the record key qualifies a name by its DECLARATION (`ns#1`); the path under it is what is asserted
  return writtenContainerSlots.keys().map(key => key.replaceAll(/#\d+/g, '')).toArray().sort();
}
for (const [label, code, expected] of [
  ['a member escape names its own slot', 'const ns = { g: globalThis }; f(ns.g.Map);', ['ns.g.Map']],
  ['a deeper chain keeps every hop', 'const ns = { a: { g: globalThis } }; f(ns.a.g.Map);', ['ns.a.g.Map']],
  ['an element index is a key like any other', 'const arr = [{ g: globalThis }]; f(arr[0].g.Map);', ['arr.0.g.Map']],
  ['a single hop is unchanged', 'const w = { k: Map }; f(w.k);', ['w.k']],
  ['an unreadable hop ends the path in the wildcard', 'const w = { a: { b: Map } }; f(w.a[k]);', ['w.a.*']],
  ['a bare container escapes whole', 'const w = { a: { b: Map } }; f(w);', ['w.*']],
  ['a write spells the same path', 'const w = { a: { b: Map } }; w.a.b = Map;', ['w.a.b']],
  ['a chain root no binding names descends', 'const w = { k: Map }; f([w][0].k);', ['w.*']],
]) {
  runBoth(`escape slot path/${ label }`, code, (adapter, prog, lbl) => {
    checkDeep(lbl, censusSlots(prog.node), expected);
  });
}

// --- an inline CALL standing where a container is due ---

// a container reached through a call resolves like the literal that call returns, wherever the call
// stands: as the chain ROOT (`plain().window.Array`) or as the container binding's INIT (`const ns =
// (() => ({ g: globalThis }))(); ns.g.Map`), which the dereference loop hands to the walk verbatim.
// so the peel is the WALK's, taken on its own hop through the shared inline-call canon - written as a
// root-only special case it left every bound spelling unresolved in every position and both flavors.
// the callee shapes whose body does not run at the call, and the ones no proof reaches, pin the boundary
function inlineCallContainerReceiver(adapter, prog, extraAdapter = {}) {
  const read = adapter.pickPath(prog, 'MemberExpression', p => p.node.property?.name === 'Map');
  const object = read.get('object');
  return staticContainerReceiverName({
    node: object.node, scope: object.scope, adapter: { ...superBaseAdapter, ...extraAdapter }, path: read,
  }) ?? null;
}
for (const [label, init, expected] of [
  ['arrow IIFE', 'const ns = (() => ({ g: globalThis }))();', 'globalThis'],
  ['function-expression IIFE', 'const ns = (function () { return { g: globalThis }; })();', 'globalThis'],
  ['call inside the parens', 'const ns = (function () { return { g: globalThis }; }());', 'globalThis'],
  ['effect prefix in the body', 'const ns = (() => { side(); return { g: globalThis }; })();', 'globalThis'],
  ['nested IIFE', 'const ns = (() => (() => ({ g: globalThis }))())();', 'globalThis'],
  ['function declaration callee', 'function make() { return { g: globalThis }; }\nconst ns = make();', 'globalThis'],
  ['const-bound arrow callee', 'const make = () => ({ g: globalThis });\nconst ns = make();', 'globalThis'],
  ['optional call', 'const make = () => ({ g: globalThis });\nconst ns = make?.();', 'globalThis'],
  ['identity call over the container', 'const ns = (x => x)({ g: globalThis });', 'globalThis'],
  ['the call forwards a bound container', 'const box = { g: globalThis };\nconst ns = (() => box)();', 'globalThis'],
  // the callee's body does not run at the call: the value is a promise / an iterator, never the container
  ['async body', 'const ns = (async () => ({ g: globalThis }))();', null],
  ['generator body', 'const ns = (function * () { return { g: globalThis }; })();', null],
  ['`new` over the callee', 'const ns = new (function () { return { g: globalThis }; })();', null],
  ['tagged template', 'const ns = make`x`;', null],
  // an argument the body only PLACES IN A SLOT is what that slot holds: the call yields the literal
  // and the read through the slot lands on the argument, exactly as the identity call above resolves
  ['parameter placed in a slot', 'const ns = (x => ({ g: x }))(globalThis);', 'globalThis'],
  // ... and the shapes no proof reaches: a parameter read anywhere BUT a slot, a callee OTHER call
  // sites can reach, a value only one path assigns, a callee with no binding, a body binding of its
  // own, and a container the source replaces
  ['parameter read beside its slot', 'const ns = (x => (use(x), { g: x }))(globalThis);', null],
  ['named callee fills the slot', 'function make(x) { return { g: x }; }\nconst ns = make(globalThis);', null],
  ['conditionally assigned callee', 'let make;\nif (c) make = () => ({ g: globalThis });\nconst ns = make();', null],
  ['unbound callee', 'const ns = make();', null],
  ['body binding of its own', 'const ns = (() => { const box = { g: globalThis }; return box; })();', null],
  ['container reassigned before the read', 'let ns = (() => ({ g: globalThis }))();\nns = {};', null],
]) {
  runBoth(`inline-call container/${ label }`, `${ init }\nf(ns.g.Map);`, (adapter, prog, lbl) => {
    check(lbl, inlineCallContainerReceiver(adapter, prog), expected);
  });
}

const INLINE_CALL_CONTAINER = 'const ns = (() => ({ g: globalThis }))();\nf(ns.g.Map);';

// the returned expression resolves where the CALLEE was declared, never at the call: a use site that
// shadows a name the body reads must not capture it
const SHADOWED_CALLEE_BODY = 'const realm = globalThis;\nconst make = () => ({ g: realm });\n'
  + 'function use() {\n  const realm = { g: 1 };\n  const ns = make();\n  return ns.g.Map;\n}';
runBoth('inline-call container/the body resolves in its own declaration scope', SHADOWED_CALLEE_BODY, (adapter, prog, lbl) => {
  check(lbl, inlineCallContainerReceiver(adapter, prog), 'globalThis');
});

// the value was captured where the call RAN, so a write after that cannot replace it - the walk keeps
// the capture site as its dominance anchor across the peel
runBoth('inline-call container/a write after the capture leaves it standing',
  'let box = { g: globalThis };\nconst ns = (() => box)();\nbox = {};\nf(ns.g.Map);', (adapter, prog, lbl) => {
    check(lbl, inlineCallContainerReceiver(adapter, prog), 'globalThis');
  });

// a call with nothing left to descend belongs to the NAME channel - this walk answers about the
// container a call forwards, and forwards nothing of its own
runBoth('inline-call container/a call with no keys left is not this walk\'s',
  'f((() => globalThis)().Map);', (adapter, prog, lbl) => {
    check(lbl, inlineCallContainerReceiver(adapter, prog), null);
  });

// the usage-global slot union rides through the peel like the primary value does: an alternative
// recorded for the slot walks the SAME remaining path
runBoth('inline-call container/the slot union rides through the call', INLINE_CALL_CONTAINER, (adapter, prog, lbl) => {
  const read = adapter.pickPath(prog, 'MemberExpression', p => p.node.property?.name === 'Map');
  const object = read.get('object');
  const unionSink = [];
  staticContainerReceiverName({
    node: object.node,
    scope: object.scope,
    path: read,
    unionSink,
    adapter: {
      ...superBaseAdapter,
      writtenContainerSlotValues(name, slot) {
        return name === 'ns' && slot.join('.') === 'g' ? [{ type: 'Identifier', name: 'Map' }] : [];
      },
    },
  });
  checkDeep(lbl, unionSink, ['Map']);
});

// the peel keeps the walk INSIDE the container it entered, so a slot the source WRITES is consulted
// against the binding that spells it - the same decline a literal container owes, on the same slot
runBoth('inline-call container/a written slot declines in pure', INLINE_CALL_CONTAINER, (adapter, prog, lbl) => {
  check(lbl, inlineCallContainerReceiver(adapter, prog, {
    method: 'usage-pure',
    isWrittenContainerSlot(name, slot) { return name === 'ns' && slot.join('.') === 'g'; },
  }), null);
});
runBoth('inline-call container/another slot leaves it resolving', INLINE_CALL_CONTAINER, (adapter, prog, lbl) => {
  check(lbl, inlineCallContainerReceiver(adapter, prog, {
    method: 'usage-pure',
    isWrittenContainerSlot(name, slot) { return name === 'ns' && slot.join('.') === 'other'; },
  }), 'globalThis');
});

// --- a container LITERAL standing where the chain ROOT is due ---

// the twin of the call peel above, for the nav whose chain starts at the container itself
// (`({ h: { g: globalThis } }).h`): the keys in front of the container are part of the walk's path,
// not a reason to stop, so the fold takes any root the walk can STAND on rather than a NAME alone.
// written as a name-only gate it stranded every such spelling in both flavors while the bound and
// call-forwarded spellings of the same reachability resolved
for (const [label, init, expected] of [
  ['object literal root', 'const ns = ({ h: { g: globalThis } }).h;', 'globalThis'],
  ['array literal root', 'const ns = ([{ g: globalThis }])[0];', 'globalThis'],
  ['two literal hops', 'const ns = ({ a: { h: { g: globalThis } } }).a.h;', 'globalThis'],
  ['three literal hops', 'const ns = ({ a: { b: { h: { g: globalThis } } } }).a.b.h;', 'globalThis'],
  ['array inside the object', 'const ns = ({ h: [{ g: globalThis }] }).h[0];', 'globalThis'],
  ['object inside the array', 'const ns = ([{ h: { g: globalThis } }])[0].h;', 'globalThis'],
  ['class expression statics', 'const ns = (class { static h = { g: globalThis }; }).h;', 'globalThis'],
  ['parens around the literal', 'const ns = ((({ h: { g: globalThis } }))).h;', 'globalThis'],
  ['transparent sequence', 'const ns = (0, { h: { g: globalThis } }).h;', 'globalThis'],
  ['an alias of the literal-rooted nav', 'const first = ({ h: { g: globalThis } }).h;\nconst ns = first;', 'globalThis'],
  // ... and a prefix that may RUN is transparent to THIS question: it decides when the container is
  // built, never which one the nav stands on. the peel that refuses such a prefix answers for a
  // caller about to rewrite through the node; standing down here dropped the injection whole
  ['effect in front of the sequence', 'const ns = (eff(), { h: { g: globalThis } }).h;', 'globalThis'],
  // the boundary: a key the walk cannot fold names no slot, and a root that hands out no literal of
  // this file has nothing to descend
  ['dynamic key off the literal', 'const ns = ({ h: { g: globalThis } })[k];', null],
  ['key the literal does not spell', 'const ns = ({ h: { q: globalThis } }).h;', null],
  ['slot holding no built-in', 'const ns = ({ h: { g: 1 } }).h;', null],
  ['call with arguments as root', 'const ns = mk(1).h;', null],
  ['container reassigned before the read', 'let ns = ({ h: { g: globalThis } }).h;\nns = {};', null],
]) {
  runBoth(`literal-rooted container/${ label }`, `${ init }\nf(ns.g.Map);`, (adapter, prog, lbl) => {
    check(lbl, inlineCallContainerReceiver(adapter, prog), expected);
  });
}

// the same chain with NO binding between the literal and the read: the entry classifies the root it
// stands on exactly as the fold does, so the two spellings of one reachability answer alike
runBoth('literal-rooted container/no binding between the literal and the read',
  'f(({ h: { g: globalThis } }).h.g.Map);', (adapter, prog, lbl) => {
    check(lbl, inlineCallContainerReceiver(adapter, prog), 'globalThis');
  });

const LITERAL_ROOTED_CONTAINER = 'const ns = ({ h: { g: globalThis } }).h;\nf(ns.g.Map);';

// re-rooting at a literal LEAVES the named container - the loop's container entry is what normally
// re-establishes that bookkeeping and it does not run here, so carrying the name past the re-root
// would offset every later slot consult by exactly the fold's keys. pure asks the write question
// once at the fold instead, against the whole path still to be read under that name
runBoth('literal-rooted container/a written slot declines in pure', LITERAL_ROOTED_CONTAINER, (adapter, prog, lbl) => {
  check(lbl, inlineCallContainerReceiver(adapter, prog, {
    method: 'usage-pure',
    isWrittenContainerSlot(name, slot) { return name === 'ns' && slot.join('.') === 'g'; },
  }), null);
});
// the question carries the WHOLE path still to be read under that name, so a write anywhere along a
// multi-key descent is seen at the one place the fold can still ask it
const LITERAL_ROOTED_TWO_KEYS = 'const ns = ({ h: { g: { r: globalThis } } }).h;\nf(ns.g.r.Map);';
runBoth('literal-rooted container/a write deeper on the path declines too', LITERAL_ROOTED_TWO_KEYS, (adapter, prog, lbl) => {
  check(lbl, inlineCallContainerReceiver(adapter, prog, {
    method: 'usage-pure',
    isWrittenContainerSlot(name, slot) { return name === 'ns' && slot.join('.') === 'g.r'; },
  }), null);
});
runBoth('literal-rooted container/two keys under the name resolve', LITERAL_ROOTED_TWO_KEYS, (adapter, prog, lbl) => {
  check(lbl, inlineCallContainerReceiver(adapter, prog), 'globalThis');
});
runBoth('literal-rooted container/another slot leaves it resolving', LITERAL_ROOTED_CONTAINER, (adapter, prog, lbl) => {
  check(lbl, inlineCallContainerReceiver(adapter, prog, {
    method: 'usage-pure',
    isWrittenContainerSlot(name, slot) { return name === 'ns' && slot.join('.') === 'other'; },
  }), 'globalThis');
});
// the consult is pure's: global over-injects for a written slot rather than losing the read
runBoth('literal-rooted container/a written slot keeps resolving in global', LITERAL_ROOTED_CONTAINER, (adapter, prog, lbl) => {
  check(lbl, inlineCallContainerReceiver(adapter, prog, {
    method: 'usage-global',
    isWrittenContainerSlot(name, slot) { return name === 'ns' && slot.join('.') === 'g'; },
  }), 'globalThis');
});
// the keys the LITERAL spells are not the name's: `ns` stands at the fold's keys, so a write to the
// slot ABOVE it (`ns.h`, which the read never goes through) leaves the read resolving. carrying the
// container name past the re-root would ask about `h` under `ns` and decline on exactly this
runBoth('literal-rooted container/a write to the literal\'s own key is not the name\'s slot',
  LITERAL_ROOTED_CONTAINER, (adapter, prog, lbl) => {
    check(lbl, inlineCallContainerReceiver(adapter, prog, {
      method: 'usage-pure',
      isWrittenContainerSlot(name, slot) { return name === 'ns' && slot.join('.') === 'h'; },
    }), 'globalThis');
  });

// the entry classifies the root it stands on, and the binding gate still owns a NAME: a read the
// declaration does not reach resolves nothing, whichever spelling the init uses
for (const [label, code] of [
  ['a bare container', 'f(ns.g.Map);\nvar ns = { g: globalThis };'],
  ['a literal-rooted nav', 'f(ns.g.Map);\nvar ns = ({ h: { g: globalThis } }).h;'],
]) {
  runBoth(`literal-rooted container/the init must reach the read/${ label }`, code, (adapter, prog, lbl) => {
    check(lbl, inlineCallContainerReceiver(adapter, prog), null);
  });
}

// the other two roots the entry stands up with no binding to look up, at the USE site: a call
// forwarding the container, and a transparent sequence around a bound one
runBoth('literal-rooted container/a call is still a root the entry stands on',
  'const mk = () => ({ h: { g: globalThis } });\nf(mk().h.g.Map);', (adapter, prog, lbl) => {
    check(lbl, inlineCallContainerReceiver(adapter, prog), 'globalThis');
  });
runBoth('literal-rooted container/a transparent sequence at the use site peels',
  'const w = { h: { g: globalThis } };\nf((0, w).h.g.Map);', (adapter, prog, lbl) => {
    check(lbl, inlineCallContainerReceiver(adapter, prog), 'globalThis');
  });

// --- the union sink of the container walk ---

// the sink both producers hand this walk is an array allocated whatever the flavor, so a row takes
// it off `staticContainerReceiverName` - the entry the member producer calls - and pins it beside
// the primary answer, one walk and both halves
function containerWalkUnion({ adapter, prog, unionSink = null, extraAdapter = {}, key = 'get' }) {
  const read = adapter.pickPath(prog, 'MemberExpression', p => p.node.property?.name === key);
  const object = read.get('object');
  return staticContainerReceiverName({
    node: object.node, scope: object.scope, adapter: { ...superBaseAdapter, ...extraAdapter }, path: read, unionSink,
  }) ?? null;
}

const BRANCHING_HOP = 'const w1 = { k: Map };\nconst w2 = { k: Set };\nconst box = c ? w1 : w2;\nf(box.k.get);';

// a branching hop names NO single container, so the primary answers nothing while each arm walks the
// remaining path into the sink
runBoth('container union/both arms of a branching hop reach the sink', BRANCHING_HOP, (adapter, prog, lbl) => {
  const unionSink = [];
  check(`${ lbl } primary`, containerWalkUnion({ adapter, prog, unionSink }), null);
  checkDeep(`${ lbl } sink`, unionSink, ['Map', 'Set']);
});

// ... and with no sink the arms are not enumerated at all: every `buildDestructuringInitMeta` caller
// that passes none (a fallback branch's leaf, a per-branch meta) reaches this same walk in global,
// and an enumeration there has nowhere to put its answers
runBoth('container union/a sink-less walk leaves the arms alone', BRANCHING_HOP, (adapter, prog, lbl) => {
  check(lbl, containerWalkUnion({ adapter, prog }), null);
});

// the sink holds receiver NAMES: an arm the walk resolves nothing for contributes nothing, or the
// union axis crosses a nameless entry with every reachable key
const UNRESOLVED_ARM = 'const w1 = { k: Map };\nconst w2 = { q: 1 };\nconst box = c ? w1 : w2;\nf(box.k.get);';
runBoth('container union/an arm that names nothing stays out', UNRESOLVED_ARM, (adapter, prog, lbl) => {
  const unionSink = [];
  containerWalkUnion({ adapter, prog, unionSink });
  checkDeep(lbl, unionSink, ['Map']);
});

// ... and arms that agree name ONE receiver - the sink is a set, and a repeated name would carry the
// same module twice through the axis
const AGREEING_ARMS = 'const w1 = { k: Map };\nconst w2 = { k: Map };\nconst box = c ? w1 : w2;\nf(box.k.get);';
runBoth('container union/arms naming the same receiver dedupe', AGREEING_ARMS, (adapter, prog, lbl) => {
  const unionSink = [];
  containerWalkUnion({ adapter, prog, unionSink });
  checkDeep(lbl, unionSink, ['Map']);
});

// an alternative replaces a SLOT, so it walks the rest of the path under that slot: the key it
// consumed rides with it, or its own deeper write (`ns.g.k` beneath the replaced `ns.g`) is looked
// up one level too high and the value that reaches the read is lost
const NESTED_SLOT_WRITE = 'const ns = { q: 1 };\nns.g = { k: Map };\nns.g.k = Set;\nf(ns.g.k.get);';
runBoth('container union/an alternative carries the key it replaced', NESTED_SLOT_WRITE, (adapter, prog, lbl) => {
  const written = adapter.pickPath(prog, 'ObjectExpression', p => p.node.properties[0]?.key?.name === 'k');
  const unionSink = [];
  check(`${ lbl } primary`, containerWalkUnion({
    adapter,
    prog,
    unionSink,
    extraAdapter: {
      writtenContainerSlotValues(name, slot) {
        if (name !== 'ns') return [];
        if (slot.join('.') === 'g') return [written.node];
        return slot.join('.') === 'g.k' ? [{ type: 'Identifier', name: 'Set' }] : [];
      },
    },
  }), null);
  checkDeep(`${ lbl } sink`, unionSink, ['Set', 'Map']);
});

// the flavors part on a BRANCHING array slot: enumerating arms is the union axis's own move, so the
// slot resolves for global, which only over-injects, and stays unresolved for pure, which would
// rewrite the read off a value the slot need not hold. the sink cannot decide it - both producers
// allocate one whatever the flavor
const BRANCHING_SLOT = 'const box = [globalThis ?? {}];\nf(box[0].Map);';
runBoth('container union/a branching array slot resolves in global', BRANCHING_SLOT, (adapter, prog, lbl) => {
  check(lbl, containerWalkUnion({ adapter, prog, unionSink: [], key: 'Map' }), 'globalThis');
});
runBoth('container union/a branching array slot declines in pure', BRANCHING_SLOT, (adapter, prog, lbl) => {
  check(`${ lbl } with a sink`, containerWalkUnion({
    adapter, prog, unionSink: [], key: 'Map', extraAdapter: { method: 'usage-pure' },
  }), null);
  check(`${ lbl } without`, containerWalkUnion({
    adapter, prog, key: 'Map', extraAdapter: { method: 'usage-pure' },
  }), null);
});

finish();
