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
  bindsModuleDefault,
  descendToChainRoot,
  isStaticPlacement,
  isTransparentWrapper,
  keySideEffectsOnly,
  ownChainOptionalCount,
  proxyGlobalMemberCtorPureSwap,
  PROXY_HOP_VALUE_CARRIERS,
  receiverSideEffectsOnly,
  resolveKey,
  returnedReceiverHasEffects,
  unwrapParensCollectingEffects,
  unwrapTransparentSeq,
} from '../../packages/core-js-polyfill-provider/detect-usage/resolve.js';
import {
  computedPropKeyHostsMachinery,
  isSourcedSymbolIteratorMeta,
  resolveSymbolIteratorEntry,
  tagSymbolSourcedMeta,
} from '../../packages/core-js-polyfill-provider/detect-usage/members.js';
import {
  buildDestructuringInitMeta,
  collectDestructureUnionCandidates,
  destructureAssignmentValueIsCaptured,
  destructurePatternHostPath,
  collectMemberUnionCandidates,
  flattenFallbackBranches,
  isConstantLiteralReceiver,
  isReReferenceableReceiver,
  isSeFreeBranchingReceiver,
  isSeFreeMemberReceiver,
} from '../../packages/core-js-polyfill-provider/detect-usage/destructure.js';
import { peelArrayWrapperPair } from '../../packages/core-js-polyfill-provider/detect-usage/destructure-plan.js';
import {
  isTypeAnnotationNodeType,
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
  synthVarHoistBinding,
  isForXWriteTarget,
  LET_SCOPE_HOST_TYPES,
  noReassignmentReachesUsage,
  reassignmentDominatesUsage,
  RUNTIME_BLOCK_TYPES,
  SOURCE_ORDER_STATEMENT_HOST_TYPES,
  STATEMENT_LIST_HOST_TYPES,
  TS_EXPR_WRAPPERS,
  reachingReassignmentValueNode,
  reassignmentValueEnumeration,
  varInitDominatesUsage,
} from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { parse as babelParse } from '@babel/parser';
import { babelAdapter, createChecker, findTypeNode } from './harness.mjs';

const { check, checkDeep, checkTruthy, finish, runBoth } = createChecker('detect-usage');

// collect the globals a type annotation surfaces, reaching the TS node by raw-AST descent so the
// oxc leg actually runs: estree-toolkit does not visit TS type-annotation nodes, so the old
// `pickPath('TS...') ?? return` made the oxc leg a silent no-op. a missing node throws (loud fail
// via runBoth's catch), never a vacuous skip
function annotationGlobals(programNode, type) {
  const node = findTypeNode(programNode, type);
  if (!node) throw new Error(`no ${ type } node found`);
  const found = [];
  walkTypeAnnotationGlobals(node, name => found.push(name));
  return found;
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
    // and the three accepted types are exactly the ones the predicate admits
    check(`${ lbl } accepted set`, ['ImportDeclaration', 'TSImportEqualsDeclaration', 'ExpressionStatement']
      .every(type => mayBeEntryStatement({ type })), true);
    check(`${ lbl } nullish node`, mayBeEntryStatement(null), false);
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
    name => found.push(name));
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

// --- walkTypeAnnotationGlobals ---

// walks `Promise<number>` reference, calls onGlobal with 'Promise' once
runBoth('walkTypeAnnotationGlobals/Promise<number>', 'const x: Promise<number> = null!;', (adapter, prog, lbl) => {
  checkDeep(lbl, annotationGlobals(prog.node, 'TSTypeReference'), ['Promise']);
});

// nested type references: Map<string, Set<number>> walks both Map and Set. the outermost
// TSTypeReference (Map) is reached first, and its walk descends into the inner Set
runBoth('walkTypeAnnotationGlobals/nested generic', 'const x: Map<string, Set<number>> = null!;', (adapter, prog, lbl) => {
  const found = annotationGlobals(prog.node, 'TSTypeReference');
  checkTruthy(lbl, found.includes('Map') && found.includes('Set'),
    `expected Map+Set in [${ found.join(',') }]`);
});

// Non-reference annotation (primitive): no global emitted
runBoth('walkTypeAnnotationGlobals/primitive (no global)', 'const x: number = 1;', (adapter, prog, lbl) => {
  checkDeep(lbl, annotationGlobals(prog.node, 'TSNumberKeyword'), []);
});

// qualified `typeof` chain through an ALL-proxy root surfaces every link: each proxy member resolves
// back to a global (`globalThis.self.Map` references globalThis AND self AND Map)
runBoth('walkTypeAnnotationGlobals/typeof all-proxy chain surfaces every link',
  'let x: typeof globalThis.self.Map;', (adapter, prog, lbl) => {
    const found = annotationGlobals(prog.node, 'TSTypeQuery');
    checkTruthy(lbl, found.includes('globalThis') && found.includes('self') && found.includes('Map'),
      `expected globalThis+self+Map, got [${ found.join(',') }]`);
  });

// qualified `typeof` chain stops at the first NON-proxy segment: in `globalThis.Array.Map`, `Map` is a
// property of the non-proxy `Array`, NOT the global Map - intentionally more precise than babel-plugin's
// ReferencedIdentifier (which over-surfaces every segment). surfaces globalThis + Array, never Map
runBoth('walkTypeAnnotationGlobals/typeof non-proxy mid-chain stops at non-proxy',
  'let x: typeof globalThis.Array.Map;', (adapter, prog, lbl) => {
    const found = annotationGlobals(prog.node, 'TSTypeQuery');
    checkTruthy(lbl, found.includes('globalThis') && found.includes('Array') && !found.includes('Map'),
      `expected [globalThis, Array] without Map, got [${ found.join(',') }]`);
  });

// a plain qualified TSTypeReference rooted at a proxy-global names the real global TYPE: `globalThis.Set`
// is the global Set, so surface globalThis (the proxy root) AND Set (the member it qualifies), matching
// babel's es.set.* + es.global-this. same proxy-chain precision as the typeof cases, on a type annotation
runBoth('walkTypeAnnotationGlobals/qualified proxy-global root surfaces member',
  'let x: globalThis.Set<number>;', (adapter, prog, lbl) => {
    const found = annotationGlobals(prog.node, 'TSTypeReference');
    checkTruthy(lbl, found.includes('globalThis') && found.includes('Set'),
      `expected globalThis+Set, got [${ found.join(',') }]`);
  });

// a qualified TSTypeReference over a NON-proxy root is type-only: `NS.Foo` names a type inside the
// namespace NS, so neither NS nor Foo is a runtime global - stays silent (unlike a typeof query, whose
// root IS a runtime binding). guards the proxy-root gate against over-surfacing type-only namespaces
runBoth('walkTypeAnnotationGlobals/qualified type-only namespace stays silent',
  'let x: NS.Foo;', (adapter, prog, lbl) => {
    checkDeep(lbl, annotationGlobals(prog.node, 'TSTypeReference'), []);
  });

// the proxy-chain precision applies to a plain qualified TSTypeReference too: in `globalThis.Array.Map`
// the chain breaks at the non-proxy `Array`, so `Map` is its property type - surface globalThis + Array
// but never the global Map (same precision as the typeof variant, on a type annotation)
runBoth('walkTypeAnnotationGlobals/qualified non-proxy mid-chain stops at non-proxy',
  'let x: globalThis.Array.Map<string, number>;', (adapter, prog, lbl) => {
    const found = annotationGlobals(prog.node, 'TSTypeReference');
    checkTruthy(lbl, found.includes('globalThis') && found.includes('Array') && !found.includes('Map'),
      `expected [globalThis, Array] without Map, got [${ found.join(',') }]`);
  });

// fn-type signature param: `(items: Set<number>) => void` keeps its params under babel's
// `parameters` key (oxc uses `params`). a global referenced ONLY in a fn-type param must
// surface on both parsers - babel-side regression guard for the `parameters` child key
runBoth('walkTypeAnnotationGlobals/fn-type param', 'let handler: (items: Set<number>) => void;', (adapter, prog, lbl) => {
  const found = annotationGlobals(prog.node, 'TSFunctionType');
  checkTruthy(lbl, found.includes('Set'), `expected Set in [${ found.join(',') }]`);
});

// method-signature param inside a type literal: walks members -> method signature -> its
// `parameters`. structurally distinct host from TSFunctionType, same babel `parameters` key
runBoth('walkTypeAnnotationGlobals/method-sig param', 'let o: { run(items: Set<number>): void };', (adapter, prog, lbl) => {
  const found = annotationGlobals(prog.node, 'TSTypeLiteral');
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

// the destructure twin anchors at the ObjectProperty: the declarator host supplies the receiver
// alias, the prop key supplies the key alias; a non-global method or a fallback meta yields none
function destructureExtras(adapter, prog, meta, method = 'usage-global') {
  const prop = pickProp(adapter, prog);
  return collectDestructureUnionCandidates({
    meta, keyNode: prop.node.key, computed: prop.node.computed,
    scope: prop.scope, adapter: { ...unionAdapter, method }, path: prop,
  });
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
runBoth('peelArrayWrapperPair/bail commits no prefixes',
  'const [{ y }] = (o(), notAnArray);', (adapter, prog, lbl) => {
    const decl = adapter.pickPath(prog, 'VariableDeclarator');
    const { init, peeledPrefixes } = peelArrayWrapperPair({ pattern: decl.node.id, init: decl.node.init });
    checkDeep(lbl, peeledPrefixes, []);
    check(`${ lbl } init unchanged`, init, decl.node.init);
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
// contrast: the ROOT-finding walk aggregates across sealed boundaries by design - consumers
// keying emit ROUTES on it would over-report (the reason the flag uses the own-chain walk)
runBoth('descendToChainRoot/optionalCount aggregates across a paren seal', '(globalThis?.[k1]).window[key];', (adapter, prog, lbl) => {
  const top = adapter.pickPath(prog, 'MemberExpression', p => p.node.property?.name === 'key');
  check(lbl, descendToChainRoot(top.node).optionalCount, 1);
});

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
  check(`decoratorVarFrame/${ variant } synth twin [babel]`, !!synthVarHoistBinding(use, 'Map'), covered);
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

finish();
