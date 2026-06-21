// detect polyfillable usage patterns (usage-global and usage-pure modes)
import {
  buildDestructuringInitMeta,
  isInnerDestructureDefault,
  resolveArrayWrapperedDestructureReceiver as sharedResolveArrayWrapperedDestructureReceiver,
  resolveNestedDestructureReceiver as sharedResolveNestedDestructureReceiver,
} from '@core-js/polyfill-provider/detect-usage/destructure';
import {
  checkLogicalAssignLhsGlobal,
  checkLogicalAssignLhsMember,
  isKnownGlobalName,
} from '@core-js/polyfill-provider/detect-usage/globals';
import { checkTypeAnnotations, walkTypeAnnotationGlobals } from '@core-js/polyfill-provider/detect-usage/annotations';
import {
  createMutationSiteHandler,
  hasMutationCandidateShapes,
} from '@core-js/polyfill-provider/detect-usage/mutation-prepass';
import {
  createSelfRefVarGuard,
  resolveKey as sharedResolveKey,
  unwrapParens,
} from '@core-js/polyfill-provider/detect-usage/resolve';
import { handleBinaryIn, handleMemberExpressionNode } from '@core-js/polyfill-provider/detect-usage/members';
import { createSyntaxRules } from '@core-js/polyfill-provider/detect-syntax';
import {
  collectFunctionScopeVarReassignments,
  collectScopeLetReassignments,
  findFunctionScopeVarDeclaratorInPath,
  findFunctionScopeVarInPath,
  findIifeArgForParam,
  findIifeCallSite,
  findTSRuntimeBindingInPath,
  getTypeArgs,
  isASTNode,
  isAmbientBindingShape,
  isFunctionParamDestructureParent,
  isInUpdateOperand,
  isMemberWriteOnlyContext,
  isTSTypeOnlyIdentifierPath,
  namespaceScopedBindingBlock,
  peelTransparentExprAncestorPath,
  resolveCallArgument,
  synthVarHoistBinding,
  unwrapSafeSequenceTail,
  walkPatternIdentifiers,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import { isClassifiableReceiverArg, isPolyfillAliasBinding } from '@core-js/polyfill-provider/helpers/class-walk';
import { is as estreeIs, traverse } from 'estree-toolkit';

// --- isReferenced ---

const IMPORT_SPECIFIER_TYPES = new Set([
  'ImportSpecifier',
  'ImportDefaultSpecifier',
  'ImportNamespaceSpecifier',
]);

const DECLARATION_ID_TYPES = new Set([
  'FunctionDeclaration',
  'FunctionExpression',
  'ClassDeclaration',
  'ClassExpression',
  'VariableDeclarator',
  // enum member name (`enum E { Promise }`) is a member key on the runtime enum object, not a
  // reference to a same-named global - babel's isReferencedIdentifier already excludes it
  'TSEnumMember',
]);

const CLASS_MEMBER_TYPES = new Set([
  'MethodDefinition',
  'PropertyDefinition',
  'AccessorProperty',
]);

const LABEL_TYPES = new Set([
  'LabeledStatement',
  'BreakStatement',
  'ContinueStatement',
]);

// check if an identifier is referenced (not a declaration, property key, or export alias).
// `skipUpdateTargets` (usage-pure only) additionally rejects UpdateExpression operands, since
// the polyfill rewrite would produce `_Map++` on a frozen import binding. usage-global must
// pass `false` here or `Map++` wouldn't inject its polyfill and would ReferenceError in IE 11
function isReferenced({ path, skipUpdateTargets }) {
  const { node } = path;
  if (!path.parentPath?.node) return true;
  // a transparent expression wrapper (`Map!`, `(Map)`, `Map as any`, `<any>Map`, `Map satisfies T`,
  // `Map<T>`, Flow `(Map: T)`) occupies the identifier's syntactic position, so its EFFECTIVE parent
  // decides read-vs-write. peel the full TS_EXPR_WRAPPERS + paren set via the shared helper (matching
  // babel-plugin's isAssignOrForXWriteTargetPath) - else a cast-wrapped write-LHS (`(Map as any) = x`),
  // for-x head, or logical-assign misses the write-LHS reject below and usage-pure over-substitutes a
  // frozen import (TypeError at the write). `path` is the single source for the effective parent context
  const anchor = peelTransparentExprAncestorPath(path);
  const { parentPath } = anchor;
  const parent = parentPath?.node;
  const parentKey = anchor.key;
  if (!parent) return true;
  // TS type-only positions: `type X = ...` ids, `export { type X }` specifiers
  if (isTSTypeOnlyIdentifierPath({ parent, key: parentKey, parentPath })) return false;
  // property key positions
  if (parent.type === 'Property' && parentKey === 'key' && !parent.computed) return false;
  if (parent.type === 'MemberExpression' && parentKey === 'property' && !parent.computed) return false;
  if (CLASS_MEMBER_TYPES.has(parent.type) && parentKey === 'key' && !parent.computed) return false;
  if (parent.type === 'ImportAttribute' && parentKey === 'key') return false;
  // declaration id positions
  if (DECLARATION_ID_TYPES.has(parent.type) && parentKey === 'id') return false;
  if (LABEL_TYPES.has(parent.type) && parentKey === 'label') return false;
  // `IMPORT_SPECIFIER_TYPES` skips all import positions regardless of `importKind`, so
  // `import { type X, foo }` / `import type { X }` are already covered here
  if (IMPORT_SPECIFIER_TYPES.has(parent.type)) return false;
  // export-alias position: both `export { X } from "mod"` (ExportSpecifier) and
  // `export * as X from "mod"` (oxc's ExportAllDeclaration with `exported` slot) put the
  // local name in a re-export alias - not a runtime reference to the polyfilled global
  if ((parent.type === 'ExportSpecifier' || parent.type === 'ExportAllDeclaration')
    && parentKey === 'exported') return false;
  // bare-Identifier LHS that reads the binding before writing it: assignment (`Map = X` /
  // `Map ||= X` / `Map += X`) and for-in/of head (`for (Map of arr)`). module / strict-mode
  // reads the global first, so global mode needs the polyfill (else IE 11 ReferenceError);
  // pure-mode rewrite to a frozen `_Map` import would TypeError at the write, so reject. checked
  // BEFORE the member write-only filter, which matches Identifier LHS / the for-x head too and
  // would otherwise drop them. a destructuring pattern head reaches its inner Identifiers through
  // the pattern, never here
  if (node.type === 'Identifier' && parentKey === 'left'
    && (parent.type === 'AssignmentExpression' || parent.type === 'ForInStatement' || parent.type === 'ForOfStatement')) {
    return !skipUpdateTargets;
  }
  // member-write-only / destructure-LHS / AssignmentPattern.left for non-Identifier shapes
  if (isMemberWriteOnlyContext(node, parent, parentPath?.parent)) return false;
  if (parent.type === 'CatchClause' && parentKey === 'param') return false;
  if (parent.type === 'ArrayPattern' || (parent.type === 'RestElement' && parentKey === 'argument')) return false;
  // UpdateExpression operand, peeling transparent wrappers - gate see `skipUpdateTargets`
  if (skipUpdateTargets && isInUpdateOperand(parentPath)) return false;
  return true;
}

// --- ESTree scope adapter ---

// estree-toolkit's scope tracker doesn't recognise TS-specific runtime declarations
// (TSImportEqualsDeclaration, TSEnumDeclaration, TSModuleDeclaration). walk path's
// ancestor chain (Program / BlockStatement / TSModuleBlock / StaticBlock) so both
// `function f() { enum Map {} new Map() }` and `namespace Outer { namespace Map {} new Map() }`
// correctly identify the shadow. anchor preference: explicit `path` (the identifier path,
// reaches inner anchors) > `scope.path` (the scope owner, may anchor at Program only)
function hasTSRuntimeBinding(scope, name, path = null) {
  const anchor = path ?? scope?.path ?? null;
  return anchor ? findTSRuntimeBindingInPath(anchor, name) : false;
}

// estree-toolkit's scope tracker registers `declare class X` / `declare const X` / `interface X`
// / `import type X` as bindings even though they're tsc-elided. consult the binding before
// declaring a shadow so ambient/type-only declarations don't suppress polyfill emission.
// shared `isAmbientBindingShape` covers all tsc-elided binding forms uniformly with babel
function isAmbientBinding(binding) {
  return isAmbientBindingShape(binding?.path?.node, binding?.path?.parent);
}

// is `path` contained within `node` - i.e. does `node` sit on `path`'s ancestor chain (inclusive)?
// tests whether a use-site is inside a given namespace block
export function pathContainedBy(path, node) {
  for (let cur = path; cur; cur = cur.parentPath) {
    if (cur.node === node) return true;
  }
  return false;
}

// estree-toolkit over-hoists a binding declared inside `namespace N {}` / `declare global {}` (a
// TSModuleBlock) - var/let/const, class, function alike - to the enclosing function / program
// scope, so `scope.getBinding` surfaces it for a use OUTSIDE the namespace body. true when `native`
// is such a binding and `path` does NOT sit inside its block, so the namespace-local declaration
// must not shadow the real global used outside. hasRuntimeBinding + getBinding + getBindingNodeType
// share this so they stay consistent - matching babel, which scopes namespaces correctly
function isOverHoistedNamespaceBinding(native, path) {
  if (!native || !path) return false;
  const block = namespaceScopedBindingBlock(native);
  return !!block && !pathContainedBy(path, block);
}

// estree-toolkit FALSELY records a DECLARATION as a constant-violation babel never does: a
// same-named `namespace N {}` / `declare global {}` twin (over-hoisted onto the real binding), and a
// for-init `let`/`const` recording its own declarator. both surface as an Identifier that is the
// `id` of a declaration node (any kind: VariableDeclarator / FunctionDeclaration / ClassDeclaration /
// enum ...), never a write. drop exactly those PATH-PRESERVING (a real reassignment's parent is an
// Assignment/Update/for-x head, and `findPrecedingBlockAssignment` still reads the real write paths),
// so the resolver's reassignment gates stop bailing on a phantom. estree-only - babel's default hook
// keeps the raw list (babel scopes namespaces correctly). a declaration's name-id is phantom iff it
// is EITHER the binding's own declaration (for-init self) OR over-hoisted from a namespace block; a
// same-scope `function`/`class` redeclaration is neither, so its real last-wins shadow is kept
// (a same-scope `var` redecl records no violation; a `let`/`const` one is a SyntaxError)
function isPhantomDeclarationViolation(violation, binding) {
  const declPath = violation?.parentPath;
  const decl = declPath?.node;
  if (!decl || decl.id !== violation.node) return false;
  return decl === binding?.path?.node || !!namespaceScopedBindingBlock({ path: declPath });
}
export function withoutPhantomDeclarationViolations(binding) {
  const violations = binding.constantViolations;
  if (!violations?.length) return binding;
  const real = violations.filter(v => !isPhantomDeclarationViolation(v, binding));
  if (real.length === violations.length) return binding;
  // spread (own props), NOT Object.create: a resolver consumer re-spreads the binding
  // (`{ ...binding, constantViolations: combined }`) and would lose a prototype-inherited
  // `path` / `scope` / `kind`. carry `constant` explicitly too - it is a prototype getter on the
  // estree Binding (not copied by spread) and `constantBindingPath` reads it
  return { ...binding, constantViolations: real, constant: real.length === 0 };
}

function hasRuntimeBinding(scope, name, path = null) {
  // pass `path` through to `scope.hasBinding` / `scope.getBinding`: native estree-toolkit
  // scopes ignore the extra arg (their signature is name-only), but `makeFrameScope` uses
  // it for position-aware block-scope shadow checks - the inner `let`/`const`/`catch.param`
  // binding only matches when the lookup site sits inside its containing block
  if (!(scope?.hasBinding?.(name, path) ?? false)) {
    if (hasTSRuntimeBinding(scope, name, path)) return true;
    // estree-toolkit doesn't hoist `var` declarations from nested non-function blocks to
    // the enclosing function scope (babel's tracker does). without this fallback,
    // `function () { if (cond) { var globalThis = ...; } return globalThis; }` reports
    // no binding at the inner reference, the Identifier visitor queues
    // `globalThis -> _globalThis`, and `polyfillSiblingReceiverRefs`'s OWN var-walker
    // disagrees - the resulting nth-occurrence mismatch fails compose with "could not
    // locate inner needle". walking `path` ancestors for var-scope owners closes the gap
    return path ? findFunctionScopeVarInPath(path, name) : false;
  }
  // hasBinding=true; for real scopes where getBinding is also available, filter out ambient
  // TS-only declarations. stub scopes (`detectEntries` shadowScope) don't expose getBinding -
  // their hasBinding=true is authoritative
  const native = scope?.getBinding?.(name, path);
  if (!native) return true;
  if (isAmbientBinding(native)) {
    // an ambient shape alone is NOT authoritative: a declaration-merged runtime namespace
    // (`declare const Map: any; namespace Map {}`) still emits a real `var` after the TS
    // transform, so the use MUST stay on the user binding. fall through to the TS-runtime
    // scan and the function-scope var walk - matching the babel adapter's ordering
    if (hasTSRuntimeBinding(scope, name, path)) return true;
    return path ? findFunctionScopeVarInPath(path, name) : false;
  }
  // a namespace-local binding over-hoisted by estree-toolkit doesn't shadow a use OUTSIDE the block
  if (isOverHoistedNamespaceBinding(native, path)) return false;
  return true;
}

// factory: per-plugin-instance adapter closed over a getInjector callback. babel-plugin
// uses the same shape (`createBabelAdapter(getInjector)`) - keeps unplugin's adapter
// contract symmetric without leaning on module-level state. `getInjector()` returns the
// active per-transform injector or null between transforms; both consumers
// (adapter.getBinding's polyfillHint AND typeResolvers' getPolyfillBindingEntry) read
// through the same callback so user-imported polyfill UIDs (`import _Promise from
// '@core-js/pure/.../promise/constructor'; _Promise.resolve(1)`) get recognised as
// proxy-globals. re-entrancy is the caller's contract: plugin.js save/restore is the
// runTransform try/finally - early-returns before the save leave the outer injector intact.
// scoped mutation pre-pass (estree side): the cheap shape gate first; only files that
// actually monkey-patch pay for the scoped toolkit traverse + canonical receiver resolution.
// shares every resolution step with the read side via `mutation-prepass` (provider)
export function collectMutationPrePass(ast, adapter) {
  const mutated = new Set();
  if (!hasMutationCandidateShapes(ast)) return { mutated };
  const handleSite = createMutationSiteHandler({ adapter, mutated });
  // member visits classify destructure-LHS / for-x contexts; the HOST visits classify
  // delete / update / assignment with a downward wrapper peel (stacked parens / TS casts)
  const siteVisitors = {
    MemberExpression: handleSite,
    CallExpression: handleSite,
    AssignmentExpression: handleSite,
    UpdateExpression: handleSite,
    UnaryExpression: handleSite,
  };
  // estree-toolkit omits `decorators` from the visitor keys of the DEFINED class / member node
  // types, so a monkey-patch hidden inside a `@decorator(...)` expression escapes the traverse and
  // the static stays wrongly substitutable (the read side already compensates via walkDecorators).
  // run the same site classifier over decorator subtrees; the guard inside walkDecorators skips any
  // owner estree-toolkit already auto-walks, so no node is double-visited
  function visitDecoratorSites(path) { walkDecorators(path, siteVisitors); }
  traverse(ast, {
    $: { scope: true },
    ...siteVisitors,
    ClassDeclaration: visitDecoratorSites,
    ClassExpression: visitDecoratorSites,
    MethodDefinition: visitDecoratorSites,
    PropertyDefinition: visitDecoratorSites,
    AccessorProperty: visitDecoratorSites,
    TSAbstractPropertyDefinition: visitDecoratorSites,
    TSAbstractAccessorProperty: visitDecoratorSites,
  });
  return { mutated };
}

export function createEstreeAdapter(getInjector = () => null, method = null, getMutatedStatics = () => null) {
  const adapter = {
    // the provider mode this adapter serves. only `usage-pure` rewrites a proxy-global alias to
    // a receiver-less helper (dropping the receiver), so the shared resolver gates the
    // assignment-dominates-use soundness check on it; global / entry modes keep the call site and
    // inject side-effect imports, which is sound regardless of where the alias was assigned
    method,
    // a static the user monkey-patches is not a polyfillable static (pure only): detection
    // leaves its receiver to the identifier machinery so the patch and the reads share the
    // injected constructor object
    isMutatedStatic(object, key) {
      return method === 'usage-pure' && !!getMutatedStatics()?.has(`${ object }.${ key }`);
    },
    // user-resolved package prefixes (`pkg` + `additionalPackages`) for symbol-import
    // detection in `bindingSymbolKey`. null between transforms (no injector active)
    get packages() { return getInjector()?.packages ?? null; },
    hasBinding(scope, name, path = null) {
      return hasRuntimeBinding(scope, name, path);
    },
    getBinding(scope, name, path = null) {
      let b = scope?.getBinding?.(name);
      // a namespace-local binding over-hoisted by estree-toolkit doesn't reach an out-of-namespace
      // use: drop it so the boundary-respecting var-hoist fallback governs (matches babel)
      if (isOverHoistedNamespaceBinding(b, path)) b = null;
      // var-hoist fallback (mirrors hasRuntimeBinding): estree-toolkit doesn't hoist a `var` from a
      // nested non-function block to its function scope, so `function f(){ if (c) { var g =
      // globalThis } g.Map.groupBy(...) }` finds no native binding and the proxy-global alias is
      // lost (babel hoists the var natively, so the two pipelines diverge here). surface a synthetic
      // binding off the declarator + its reassignment sites so alias resolution reads its `.init`
      // and the resolver's reassignment guard fires for a REASSIGNED nested-block var
      if (!b) return synthVarHoistBinding(path, name);
      // `importSource` is part of the adapter contract: `resolveKey` in polyfill-provider
      // needs it to recognise `import X from '.../symbol/<name>'` as Symbol.X. exposing the
      // raw module source at this interface is deliberate - not a leak, just the minimum
      // parser-agnostic info the provider requires to infer well-known symbol imports.
      // `polyfillHint` enables proxy-global recognition for user-imported polyfill UIDs
      // (`_Promise` -> 'Promise') so `_Promise.resolve(1)` rewrites to `_Promise$resolve(1)`
      // matching babel-plugin's behavior - constructor module typically doesn't expose
      // statics, so the rewrite avoids a runtime undefined-call crash.
      // shadow guard (shared with babel-plugin via the provider): `info.source !== null` means a
      // registered pure import - only attach `polyfillHint` when the actual scope binding IS an import
      // too. `info.source === null` is a destructure-alias from `registerGlobalAlias`; the shared
      // predicate identifies the real alias binding (init resolves to the destructured global, any
      // declaration kind) and rejects user-declared shadows of the same name
      const info = getInjector()?.getBindingInfo?.(name) ?? null;
      const isImportBinding = IMPORT_SPECIFIER_TYPES.has(b.path.node?.type);
      const importSource = isImportBinding ? b.path.parent?.source?.value ?? null : null;
      const isAliasBindingShape = isPolyfillAliasBinding({ info, binding: b, scope, adapter, injector: getInjector() });
      const polyfillHint = info && (isAliasBindingShape || isImportBinding) ? info.hint : null;
      // estree-toolkit's `constantViolations` for a function-scoped `var` are unreliable: it MISSES
      // a nested-block re-declaration (`var x = []; { var x = 'hello' }`) and FALSELY attributes a
      // same-named namespace/declare-global var twin as a violation. recompute from the AST via the
      // same walk the synthetic var-hoist binding uses (which respects the TSModuleBlock boundary
      // and records every write shape) so a real reassignment narrows / bails and a phantom
      // namespace twin doesn't - both matching babel. path-less callers keep estree's list
      // estree-toolkit also omits a cross-boundary `let` reassignment (a use in a nested closure does
      // not observe the outer-scope write `let K='a'; K='b'; const f=()=>X[K]()`), so a polyfillable
      // reaching value is dropped while babel's native binding carries it. recompute by the same AST
      // scan, anchored at the binding's own lexical scope (climb the declarator to its block /
      // program). `const` shares the lexical-scope recompute with `let`: a const cannot be reassigned,
      // so the only violations estree records for it are PHANTOM (an over-hoisted `namespace N {}`
      // twin's declarator, or a for-init `const` self) - the boundary-respecting scan excludes them,
      // matching babel; without this a const shadowed by a namespace twin keeps the phantom and a
      // resolvable use (e.g. a computed key `obj[K]`) wrongly bails
      const constantViolations = !path ? b.constantViolations
        : b.kind === 'var' ? collectFunctionScopeVarReassignments(path, name)
          : b.kind === 'let' || b.kind === 'const' ? collectScopeLetReassignments(b.path, name)
            : b.constantViolations;
      return {
        node: b.path.node,
        kind: b.kind,
        constantViolations,
        importSource,
        polyfillHint,
      };
    },
    getBindingNodeType(scope, name, path = null) {
      const nativeBinding = scope?.getBinding?.(name);
      // stay consistent with getBinding: an over-hoisted namespace binding doesn't reach an
      // outside use, so don't report its declarator type (else the resolver type-gates into
      // resolveVariableBindingToGlobal with the null binding getBinding returned)
      if (nativeBinding && !isOverHoistedNamespaceBinding(nativeBinding, path)) return nativeBinding.path?.node?.type;
      // var-hoist fallback parity with getBinding: a nested-block `var` surfaces as a declarator
      return path && findFunctionScopeVarDeclaratorInPath(path, name) ? 'VariableDeclarator' : null;
    },
    // shared `unwrapParens` peels paren / TS expression wrappers / safe SequenceExpression
    // so `require('core-js/...' as any)` / `require((0, 'core-js/...'))` / `require(('core-js/...'))`
    // all reach the underlying string literal. SE prefix that carries observable side-effects
    // stops further peeling - entry-detection doesn't rewrite the call, so unsafe SE stays
    isStringLiteral(node) {
      return isLiteralString(unwrapParens(node));
    },
    getStringValue(node) {
      const inner = unwrapParens(node);
      return isLiteralString(inner) ? inner.value : null;
    },
  };
  return adapter;
}

function isLiteralString(node) {
  return node?.type === 'Literal' && typeof node.value === 'string';
}

// --- Decorator sub-traversal ---

// estree-toolkit's visitor keys skip `decorators` - walk them manually with
// synthetic Babel-shaped paths so resolve-node-type can read typeAnnotations

const FUNCTION_NODE_TYPES = new Set(['FunctionExpression', 'FunctionDeclaration', 'ArrowFunctionExpression']);

// `isASTNode` drops parent back-pointers, location objects, and primitives without listing
// them by name; tolerates parsers adding new metadata fields (e.g. `typeArguments`).
// `visit(child, key, listKey, container)` matches babel NodePath shape: for array children
// `key` = index, `listKey` = property name; for non-array `key` = property name, `listKey` = null
function forEachChildNode(node, visit) {
  for (const key of Object.keys(node)) {
    const value = node[key];
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) if (isASTNode(value[i])) visit(value[i], i, key, value);
    } else if (isASTNode(value)) visit(value, key, null, node);
  }
}

// babel NodePath parity: for array-indexed children `key` = numeric index, `listKey` =
// property name, `container` = the array; for non-array children `key` = property name,
// `listKey` = null, `container` = parent node. consumers like `getStatementSiblings` rely
// on numeric key + listKey to recognise statement-in-block position
function makeSynthPath({ node, parent, parentKey, parentPath, scope, listKey = null, container = null }) {
  // cache `.get(key)` results per synth-path so repeated `path.get('object')` calls within
  // one traversal return the same wrapper. downstream consumers that identity-check
  // descendants (scope lookups, handled-object Sets) see stable paths. array branches cached
  // as-a-whole; same key always returns the same array of child paths
  const childCache = new Map();
  const self = {
    node,
    parent,
    parentPath,
    key: parentKey,
    listKey,
    container: container ?? parent,
    scope,
    get(key) {
      if (childCache.has(key)) return childCache.get(key);
      const value = node?.[key];
      const result = Array.isArray(value)
        ? value.map((el, i) => makeSynthPath({
          node: el, parent: node, parentKey: i, parentPath: self, scope, listKey: key, container: value,
        }))
        : makeSynthPath({
          node: value ?? null, parent: node, parentKey: key, parentPath: self, scope, container: node,
        });
      childCache.set(key, result);
      return result;
    },
  };
  return self;
}

// frame scope for an inline function inside a decorator - locals shadow parentScope.
// position-aware: `localDecls` carries Map<name, Array<{constant, node, blockStart,
// blockEnd}>> so block-scoped bindings (`let`/`const`/`catch.param`/block-level
// FunctionDeclaration / ClassDeclaration) only shadow the parent when the lookup site
// sits inside their containing block. fn-scoped bindings (`var`, params, fn.id, hoisted
// FunctionDeclaration at fn body top level) use the whole fn body range and shadow uniformly
function findLocalAt(localDecls, name, path) {
  const entries = localDecls.get(name);
  if (!entries) return null;
  const pos = path?.node?.start;
  // no position context (e.g. caller used the legacy `hasBinding(name)` signature) -
  // return the most-recently-added entry which corresponds to the innermost binding
  // walked. matches the pre-position "last write wins" overwrite semantics
  if (typeof pos !== 'number') return entries[0];
  // pick the most-specific (smallest containing block) shadow whose range covers `pos`.
  // ties broken by insertion order (most recent first - same as no-position fallback)
  let best = null;
  let bestSpan = Infinity;
  for (const entry of entries) {
    if (entry.blockStart <= pos && pos <= entry.blockEnd) {
      const span = entry.blockEnd - entry.blockStart;
      if (span < bestSpan) {
        best = entry;
        bestSpan = span;
      }
    }
  }
  return best;
}

function makeFrameScope(parentScope, localDecls) {
  const bindingCache = new Map();
  const frame = {
    hasBinding(name, path) {
      return findLocalAt(localDecls, name, path) !== null
        || (parentScope?.hasBinding(name, path) ?? false);
    },
    getBinding(name, path) {
      const local = findLocalAt(localDecls, name, path);
      if (!local) return parentScope?.getBinding?.(name, path) ?? null;
      // cache keyed on the entry identity, not the name - distinct shadows of the same
      // name (`let X = 1; { let X = 2; }`) must produce distinct synthetic bindings
      let binding = bindingCache.get(local);
      if (!binding) {
        binding = {
          constant: local.constant,
          path: makeSynthPath({ node: local.node, parent: null, parentKey: null, parentPath: null, scope: frame }),
        };
        bindingCache.set(local, binding);
      }
      return binding;
    },
  };
  return frame;
}

// module-level cache: keyed on fn AST node identity. plugin instances each parse their own
// AST, so node-identity is per-instance and cache entries never leak across instances.
// only risks staleness if an external caller hands the same node to two configurations,
// which the unplugin / babel-plugin pipeline doesn't do
const LOCALS_CACHE = new WeakMap();

// nodes that open a fresh lexical block scope. each entry inside one of these scopes its
// `let`/`const` / class declarations / catch parameters to the block's source range so
// shadow detection at a use-site uses position-aware containment. `var` and hoisted
// FunctionDeclaration retain function-scope semantics (they get the fn body's range
// passed through directly, ignoring intermediate block boundaries)
const BLOCK_SCOPING_NODE_TYPES = new Set([
  'BlockStatement',
  'ForStatement',
  'ForInStatement',
  'ForOfStatement',
  'SwitchStatement',
]);

// LIFO insertion: most-recently-added entry sits at index 0 so the no-position fallback
// returns the innermost shadow (last-write-wins). entries carry their own block range so
// position-aware lookup can pick the right shadow among same-name bindings in distinct scopes
function addLocal(locals, name, entry) {
  const list = locals.get(name);
  if (list) list.unshift(entry);
  else locals.set(name, [entry]);
}

function addPatternLocals(locals, pattern, entry) {
  walkPatternIdentifiers(pattern, id => addLocal(locals, id.name, entry));
}

function collectFunctionLocals(fnNode) {
  const cached = LOCALS_CACHE.get(fnNode);
  if (cached) return cached;
  const locals = new Map();
  // fn-scope range covers the WHOLE function node (signature + body) so param identifiers
  // themselves resolve to their own bindings - `fnNode.body.start` would leave params
  // outside the range and `findLocalAt` would miss them, letting the identifier visitor
  // rewrite `(Map) -> (_Map)` for a function-param shadow
  const fnStart = fnNode.start;
  const fnEnd = fnNode.end;
  for (const param of fnNode.params ?? []) {
    addPatternLocals(locals, param, { constant: true, node: param, blockStart: fnStart, blockEnd: fnEnd });
  }
  if (fnNode.id?.name) {
    addLocal(locals, fnNode.id.name, { constant: true, node: fnNode, blockStart: fnStart, blockEnd: fnEnd });
  }
  function walk(node, blockStart, blockEnd) {
    if (!node || typeof node !== 'object') return;
    // FunctionDeclaration is block-scoped per ES6+ strict mode; at fn body top level the
    // currentBlock IS the fn body so it naturally widens to fn-scope semantics. body opens
    // its own scope - stop descent regardless
    if (node.type === 'FunctionDeclaration') {
      if (node.id?.name) {
        addLocal(locals, node.id.name, { constant: true, node, blockStart, blockEnd });
      }
      return;
    }
    if (FUNCTION_NODE_TYPES.has(node.type)) return;
    if (node.type === 'VariableDeclaration') {
      // `var` hoists out of any enclosing block (fn-scoped); `let`/`const`/`using` /
      // `await using` are block-scoped. catch-bindings walk separately below
      const isVar = node.kind === 'var';
      const scopeStart = isVar ? fnStart : blockStart;
      const scopeEnd = isVar ? fnEnd : blockEnd;
      const constant = node.kind === 'const';
      for (const d of node.declarations) {
        addPatternLocals(locals, d.id, { constant, node: d, blockStart: scopeStart, blockEnd: scopeEnd });
      }
    } else if (node.type === 'ClassDeclaration' || node.type === 'ClassExpression') {
      // ClassDeclaration is block-scoped (strict mode); ClassExpression doesn't bind
      // in the enclosing scope. body opens its own scope - stop descent either way
      if (node.type === 'ClassDeclaration' && node.id?.name) {
        addLocal(locals, node.id.name, { constant: true, node, blockStart, blockEnd });
      }
      return;
    } else if (node.type === 'CatchClause' && node.param) {
      // catch-binding lives only inside the handler body. descend with the catch-body
      // context so `let`/`const` inside also get correct ranges
      const catchStart = node.body?.start ?? node.start;
      const catchEnd = node.body?.end ?? node.end;
      addPatternLocals(locals, node.param, {
        constant: false, node: node.param, blockStart: catchStart, blockEnd: catchEnd,
      });
      if (node.body) walk(node.body, catchStart, catchEnd);
      return;
    }
    // block-shape nodes push a new block context for their descendants
    const inBlock = BLOCK_SCOPING_NODE_TYPES.has(node.type);
    const childStart = inBlock ? node.start : blockStart;
    const childEnd = inBlock ? node.end : blockEnd;
    forEachChildNode(node, child => walk(child, childStart, childEnd));
  }
  if (fnNode.body) walk(fnNode.body, fnStart, fnEnd);
  LOCALS_CACHE.set(fnNode, locals);
  return locals;
}

function walkSubtree({ node, parent, parentKey, parentPath, scope, visitors, listKey = null, container = null }) {
  if (!node || typeof node !== 'object' || typeof node.type !== 'string') return;
  const childScope = FUNCTION_NODE_TYPES.has(node.type)
    ? makeFrameScope(scope, collectFunctionLocals(node))
    : scope;
  const synthPath = makeSynthPath({ node, parent, parentKey, parentPath, scope: childScope, listKey, container });
  visitors[node.type]?.(synthPath);
  forEachChildNode(node, (child, childKey, childListKey, childContainer) => {
    walkSubtree({
      node: child, parent: node, parentKey: childKey, parentPath: synthPath, scope: childScope, visitors,
      listKey: childListKey, container: childContainer,
    });
  });
}

function walkDecoratorList(decorators, parentPath, decoratorVisitors) {
  if (!decorators?.length) return;
  for (let i = 0; i < decorators.length; i++) {
    walkSubtree({
      node: decorators[i], parent: parentPath.node, parentKey: i, parentPath, scope: parentPath.scope,
      visitors: decoratorVisitors, listKey: 'decorators', container: decorators,
    });
  }
}

// estree-toolkit's traverse walks `visitorKeys[type] || Object.keys(node)`. for a node type it does
// NOT define (no `is.<type>` predicate, so the Object.keys fallback applies) it already walks the
// node's `decorators` array itself with the main visitor map; a manual walk then double-visits and
// queues two colliding rewrites for the same span (crash). for a DEFINED type, `decorators` is
// omitted from its visitor keys, so the manual walk is required. confirmed empirically: known
// PropertyDefinition / Identifier-param decorators take the manual path and emit a single rewrite,
// while unknown AccessorProperty / TSAbstract* / TSParameterProperty are reached by the auto-walk
function estreeAutoWalksDecorators(node) {
  const type = node?.type;
  return !!type && estreeIs[type[0].toLowerCase() + type.slice(1)] === undefined;
}

// walks the node's own decorators plus any param-level decorators (TS legacy `@dec arg`
// on class method / constructor params). `MethodDefinition.params` lives on `.value`. skip any
// owner whose decorators estree-toolkit already auto-walks (see estreeAutoWalksDecorators)
function walkDecorators(parentPath, decoratorVisitors) {
  const { node } = parentPath;
  if (!estreeAutoWalksDecorators(node)) walkDecoratorList(node?.decorators, parentPath, decoratorVisitors);
  const params = node?.params ?? node?.value?.params;
  if (!params) return;
  for (const param of params) {
    if (!estreeAutoWalksDecorators(param)) walkDecoratorList(param?.decorators, parentPath, decoratorVisitors);
  }
}

// JSXIdentifier sits at the opening tag-name slot (`<Map />`'s `Map` Identifier with
// parent=JSXOpeningElement, key='name'). only this position is a runtime reference;
// attribute names, closing-tag dupes, and member-property tails reach the visitor too
// but should be ignored
function isJsxOpeningTagName(path) {
  return path.parent?.type === 'JSXOpeningElement' && path.key === 'name';
}

// JSXMemberExpression root (`<Map.Provider.X />` -> `Map` Identifier sits at the bottom
// of an `object`-chain whose terminal `MemberExpression` is the opening tag-name).
// walks `.object` upward; arbitrary depth supported - returns true only when we land on
// a JSXOpeningElement.name slot AFTER traversing at least one JSXMemberExpression hop
function isJsxMemberRoot(path) {
  let cur = path;
  while (cur?.parent?.type === 'JSXMemberExpression' && cur.parent.object === cur.node) {
    cur = cur.parentPath;
  }
  return cur !== path && isJsxOpeningTagName(cur);
}

// --- Usage visitors ---

export function createUsageVisitors({
  adapter, onUsage, onWarning, method, suppressProxyGlobals = false, walkAnnotations = true, isEntryAvailable,
  resolveMeta,
}) {
  // only usage-pure rewrites global identifiers to named import bindings (which are frozen).
  // usage-global injects side-effect imports and leaves the identifier alone, so `Map++`
  // must polyfill - otherwise `Map` ReferenceError's in engines where the native is missing
  const skipUpdateTargets = method === 'usage-pure';
  const handledObjects = new WeakSet();
  // read `kind` off the parent VariableDeclaration via the binding path - works across
  // estree-toolkit shapes (`.path.parent` for one host, `.path.parentPath?.node` for
  // another). babel's `binding.kind` is read directly via the babel adapter's own getter
  const isSelfRefVarBinding = createSelfRefVarGuard(
    b => (b?.path?.parent ?? b?.path?.parentPath?.node)?.kind,
  );

  // destructure-only wrapper (sole caller is extractPropertyKey): a side-effecting computed key
  // resolves to its tail for identity; the emitter keeps the key in the pattern (it runs once) and
  // adds an inline default `= _Array$from`, so the static is polyfilled, not bailed
  function resolveKey(node, computed, scope) {
    return sharedResolveKey({ node, computed, scope, adapter });
  }

  function extractPropertyKey(propNode, scope) {
    if (!propNode.computed) {
      return propNode.key.type === 'Identifier' ? propNode.key.name
        : adapter.isStringLiteral(propNode.key) ? propNode.key.value
          : null;
    }
    return resolveKey(propNode.key, true, scope);
  }

  // build meta for destructuring property: const { from } = Array, ({ from } = Array)

  function buildDestructuringMeta(propNode, parentPath) {
    const objectPattern = parentPath;
    const parent = objectPattern?.parentPath;
    if (!parent) return null;

    let initNode;
    const scope = parent.scope || objectPattern.scope;
    // nested patterns leave `initNode` undefined -> typeless meta (`object: null`)
    switch (parent.node.type) {
      case 'VariableDeclarator': initNode = parent.node.init; break;
      case 'AssignmentExpression': initNode = parent.node.right; break;
      case 'AssignmentPattern':
        // `function({ from } = Array)` - AssignmentPattern wraps the param. Route `parent.right`
        // as the destructure receiver so `from` resolves to `Array.from`.
        // for IIFE with statically-classifiable caller-arg, the wrapper-default is dead code at
        // runtime: prefer caller-arg as receiver. peel SE-tail / paren / TS wrappers first
        // (`(0, Array)` / `(Array)` -> `Array`) so a wrapped bare global classifies - matches the
        // synth-swap emit path, which already peels via the same helper. genuinely non-Identifier
        // shapes (`(...)(globalThis.X)`, `(...)(call())`) stay un-classifiable, so wrapper-default
        // keeps the static context and the runtime fallback (`= Array` on undefined arg) carries it
        // only when THIS AssignmentPattern is the direct param default (`function f({from} = R)`); an
        // inner default (`f([{from}={}] = [R])`) carries `{}` in `.right`, not the receiver - it falls
        // through to the array/property inner-default cases below, which peel it to the real host
        if (isFunctionParamDestructureParent(objectPattern) && !isInnerDestructureDefault(parent)) {
          const argNode = unwrapSafeSequenceTail(findIifeArgForParam(parent.parentPath, parent.node));
          initNode = isClassifiableReceiverArg(argNode, scope, adapter) ? argNode : parent.node.right;
          break;
        }
        // nested destructure with inner-default: `{ Array: { from } = {} } = X` - peel the
        // AssignmentPattern wrapper and resolve via the same nested-chain classifier as the
        // bare `{ Array: { from } } = X` shape (proxy-global init guarantees default never
        // fires, so it's transparent under "polyfill always wins")
        if (parent.parentPath?.node?.type === 'Property' && parent.node.left === objectPattern.node) {
          const innerKey = extractPropertyKey(propNode, scope);
          const constructor = innerKey
            ? sharedResolveNestedDestructureReceiver(parent.parentPath, adapter) : null;
          if (constructor) {
            return { kind: 'property', object: constructor, key: innerKey, placement: 'static' };
          }
        }
        // inner-default inside an ArrayPattern wrapper (`[{ from } = {}]` / `[, { from } = {}]`):
        // the AssignmentPattern is transparent, resolve via the array-wrapper resolver (which peels
        // it). mirrors babel-plugin's detect-usage ArrayPattern branch
        if (parent.parentPath?.node?.type === 'ArrayPattern' && parent.node.left === objectPattern.node) {
          const innerKey = extractPropertyKey(propNode, scope);
          const constructor = innerKey
            ? sharedResolveArrayWrapperedDestructureReceiver(objectPattern, adapter) : null;
          if (constructor) {
            return { kind: 'property', object: constructor, key: innerKey, placement: 'static' };
          }
        }
        break;
      case 'Property': {
        // nested pattern - shared `resolveNestedDestructureReceiver` walks outer-prop chain
        // up to the destructure host and returns the constructor name across proxy-global
        // and static-object descent shapes (see helper docstring)
        const innerKey = extractPropertyKey(propNode, scope);
        const constructor = innerKey ? sharedResolveNestedDestructureReceiver(parent, adapter) : null;
        if (constructor) {
          return { kind: 'property', object: constructor, key: innerKey, placement: 'static' };
        }
        break;
      }
      case 'ForOfStatement':
      case 'ForInStatement':
      case 'RestElement':
      case 'CatchClause': break;
      case 'ArrayPattern': {
        // ArrayPattern-rooted nested destructure `const [{from}] = wrapper` - walk up the
        // ArrayPattern stack to the host and descend Identifier-aliased ArrayExpression
        // wrappers to find the leaf constructor
        const innerKey = extractPropertyKey(propNode, scope);
        if (!innerKey) break;
        const constructor = sharedResolveArrayWrapperedDestructureReceiver(objectPattern, adapter);
        if (constructor) {
          return { kind: 'property', object: constructor, key: innerKey, placement: 'static' };
        }
        break;
      }
      default: {
        // IIFE destructuring: `!function({entries}) {}(Object)`. shared `findIifeCallSite`
        // peels wrapper chain (Unary / Sequence / Paren / Chain / TS), accepts CallExpression /
        // NewExpression / OptionalCallExpression, AND enforces the callee-identity gate
        // (`peelIifeCallee(callee, fn) === fn`) so functions PASSED AS ARGS to another call
        // (`doStuff(Object, function({entries}) {...})`) don't get misclassified as IIFEs
        const site = findIifeCallSite(parent, objectPattern.node);
        if (!site) return null;
        initNode = resolveCallArgument(site.callPath.node.arguments ?? [], site.paramIndex);
        if (!initNode) return null;
      }
    }

    const key = extractPropertyKey(propNode, scope);
    if (!key) return null;
    return buildDestructuringInitMeta({ initNode, key, scope, adapter, path: parent });
  }

  function annotationGlobal(path) {
    return name => {
      // pass `path` so `hasRuntimeBinding`'s var-hoisting fallback can detect `var Name`
      // declarations buried inside nested non-function blocks (estree-toolkit registers them
      // in the block's own scope rather than hoisting to the enclosing function)
      if (adapter.hasBinding(path.scope, name, path)) return;
      onUsage({ kind: 'global', name }, path);
    };
  }

  function identifierVisitor(path) {
    // orphaned node (parent removed by sibling transform / pruning): downstream isReferenced
    // and parent-shape checks would crash on null. parity with babel-plugin's handleIdentifier
    if (!path.parent) return;
    const { node, parent, key: parentKey } = path;
    // `isReferenced` returns false for write-context leaves like `Map ||= X`; diagnose the
    // pattern before the early return so users see why nothing was polyfilled
    // usage-pure rewrites globals to read-only import bindings; `_Map ||= X` would TypeError
    // at write time, so emit the warning. usage-global leaves globals untouched - side-effect
    // imports populate the binding before module body runs, so `||=` no-ops without emitting
    // user-visible problem. skip warning in global mode to avoid false-positive noise
    if (onWarning && method === 'usage-pure') {
      const warning = checkLogicalAssignLhsGlobal(path, adapter.hasBinding(path.scope, node.name, path));
      if (warning) onWarning(warning);
    }
    if (!isReferenced({ path, skipUpdateTargets })) return;
    // re-export: export { Promise } from 'foo' - local is not a reference when source is present
    if (parent?.type === 'ExportSpecifier' && parentKey === 'local'
      && path.parentPath?.parentPath?.node?.source) return;
    if (adapter.hasBinding(path.scope, node.name, path)) {
      // self-reference `var X = X` - hoisted var init reads the outer (global) scope
      // before the local is assigned. narrow via cached binding check; exclude let/const
      // (TDZ error) and ImportSpecifiers. `node.name` equals binding's own name by lookup
      if (!isSelfRefVarBinding(path.scope?.getBinding?.(node.name))) return;
      if (!isKnownGlobalName(node.name)) return;
      if (handledObjects.has(node)) return;
      onUsage({ kind: 'global', name: node.name }, path);
      return;
    }
    // see `handleBinaryIn` - only resolved polyfillable keys seed `handledObjects`
    if (handledObjects.has(node)) return;
    onUsage({ kind: 'global', name: node.name }, path);
  }

  function memberExpressionVisitor(path) {
    const { node } = path;
    // `globalThis.Map ||= X` / `globalThis.self.Map ||= X` - check BEFORE `isReferenced`
    // rejects (write-context member) and before child-visitor rewrites `globalThis` ->
    // `_globalThis`. `globalProxyMemberName` (used inside the helper) walks chains and
    // gates on shadowing internally - no separate isBound check needed
    if (onWarning && method === 'usage-pure') {
      const warning = checkLogicalAssignLhsMember({ path, scope: path.scope, adapter });
      if (warning) onWarning(warning);
    }
    if (handledObjects.has(node)) return;
    if (!isReferenced({ path, skipUpdateTargets })) {
      // a guarded SHIM write stays fully native (its statement is ignored as polyfill
      // intent); a deliberate override's receiver follows the SAME identifier routing the
      // reads use, so the patch and the reads land on one object - no marking there
      // its receiver follows the SAME identifier routing the (always-mutated-by-definition)
      // reads use, so the patch and the reads land on one object - no marking
      return;
    }
    const meta = handleMemberExpressionNode({
      node, scope: path.scope, adapter, handledObjects, suppressProxyGlobals, path, resolveMeta,
    });
    if (meta) {
      onUsage(meta, path);
      // usage-global union: extra reachable receiver / key targets each earn a side-effect import
      for (const extra of meta.extraCandidates ?? []) onUsage(extra, path);
    }
  }

  function binaryExpressionVisitor(path) {
    const meta = handleBinaryIn({
      node: path.node, scope: path.scope, adapter, handledObjects, isEntryAvailable, suppressProxyGlobals, path,
    });
    if (meta) onUsage(meta, path);
  }

  // Property visitor is shared: top-level destructure bindings and decorator-arg patterns
  // both need `buildDestructuringMeta` to route polyfillable receivers through synth-swap.
  // decorator walk must include it explicitly - `walkSubtree`'s visitor lookup is keyed by
  // node type, and without the entry the decorator subtree never reaches destructure handling
  function propertyVisitor(path) {
    if (path.node.method || path.parent?.type !== 'ObjectPattern') return;
    const meta = buildDestructuringMeta(path.node, path.parentPath);
    if (meta) onUsage(meta, path);
  }

  // JSX tag-name (`<Map />`) or N-deep member-root (`<Map.Provider.X />`). shared between
  // the top-level visitor and `decoratorVisitors` so `@(<Map/>) class C {}` decorators
  // detect the global runtime reference (without it the decorator walk has no
  // JSXIdentifier entry, so the embedded JSX element never triggers polyfill emission).
  // `adapter.hasBinding` gets the path so `hasRuntimeBinding`'s var-hoisting fallback
  // detects a `var Tag` declaration inside a nested non-function block (estree-toolkit
  // registers var in the block's own scope rather than hoisting to enclosing function)
  function jsxIdentifierVisitor(path) {
    if (!isJsxOpeningTagName(path) && !isJsxMemberRoot(path)) return;
    if (adapter.hasBinding(path.scope, path.node.name, path)) return;
    onUsage({ kind: 'global', name: path.node.name }, path);
  }

  const decoratorVisitors = {
    Identifier: identifierVisitor,
    MemberExpression: memberExpressionVisitor,
    BinaryExpression: binaryExpressionVisitor,
    Property: propertyVisitor,
    JSXIdentifier: jsxIdentifierVisitor,
  };

  function visitDecorators(path) {
    walkDecorators(path, decoratorVisitors);
  }

  function checkTypeAnnotation(path) {
    checkTypeAnnotations(path.node, annotationGlobal(path));
  }

  // explicit type arguments at a call / new site (`bar<Map<...>>()`, `new Foo<Map<...>>()`)
  // are a type-only instantiation hanging off the call node, not a runtime ref the call's own
  // visitor reads. there's no FunctionExpression body to drive the param / return walk, so sweep
  // them directly (babel reaches them via ReferencedIdentifier). most calls carry none, hence the
  // guard. `getTypeArgs` reads babel `typeParameters` / oxc `typeArguments` uniformly
  function checkCallTypeArguments(path) {
    const typeArgs = getTypeArgs(path.node);
    if (typeArgs) walkTypeAnnotationGlobals(typeArgs, annotationGlobal(path));
  }

  // a class node and its field shapes carry type-only globals the FunctionExpression walk
  // (method param / return types) never reaches: the class's own `typeParameters` constraints /
  // defaults and `extends Base<...>` super-type-args, plus a field's `x: Map<T>` annotation.
  // `checkTypeAnnotations` already reads `typeParameters.params` + super-type-args, so one routine
  // covers both the class node and its members. pair it with the decorator walk so those globals
  // polyfill when annotation walking is on (usage-global). abstract field variants are the same -
  // their type-only declarations are still signal
  function visitDecoratorsAndAnnotation(path) {
    visitDecorators(path);
    if (walkAnnotations) checkTypeAnnotation(path);
  }

  return {
    ...walkAnnotations ? {
      FunctionDeclaration: checkTypeAnnotation,
      FunctionExpression: checkTypeAnnotation,
      ArrowFunctionExpression: checkTypeAnnotation,
      // bodyless function-signature types carry their global refs in params / return / type
      // params but have no FunctionExpression body to drive the param/return walk above, so
      // sweep them directly (babel reaches these via ReferencedIdentifier). covers interface
      // method / call / construct signatures, standalone function / constructor types (incl.
      // inside type aliases), and ambient overload declare-functions. abstract / declare-class /
      // overload METHODS surface in oxc as a TSEmptyBodyFunctionExpression `.value` (the params
      // live there, not on the method node), so sweep that node rather than babel's TSDeclareMethod
      TSMethodSignature: checkTypeAnnotation,
      TSCallSignatureDeclaration: checkTypeAnnotation,
      TSConstructSignatureDeclaration: checkTypeAnnotation,
      TSFunctionType: checkTypeAnnotation,
      TSConstructorType: checkTypeAnnotation,
      TSDeclareFunction: checkTypeAnnotation,
      TSEmptyBodyFunctionExpression: checkTypeAnnotation,
      VariableDeclarator(path) {
        if (path.node.id?.typeAnnotation) {
          walkTypeAnnotationGlobals(path.node.id.typeAnnotation, annotationGlobal(path));
        }
      },
      CatchClause(path) {
        if (path.node.param?.typeAnnotation) {
          walkTypeAnnotationGlobals(path.node.param.typeAnnotation, annotationGlobal(path));
        }
      },
      // call / new / tagged-template type arguments (covers the optional-call form too). babel reaches
      // a `tag<Set<number>>` instantiation via ReferencedIdentifier; oxc hangs it off the tag node, so
      // sweep it here too or the type-only globals drop in unplugin only
      CallExpression: checkCallTypeArguments,
      NewExpression: checkCallTypeArguments,
      OptionalCallExpression: checkCallTypeArguments,
      TaggedTemplateExpression: checkCallTypeArguments,
    } : null,
    Identifier: identifierVisitor,
    // `<Map />` tag-name is a runtime reference to a global constructor. skip attribute
    // names and closing-tag dupes. also accept root of `<Map.Provider.X/>` (N-deep
    // JSXMemberExpression chain) - walk the `.object` chain from path so deeper-than-2
    // namespace tags still polyfill the outer global. shared with `decoratorVisitors`
    // so JSX inside decorator expressions (`@(<Map/>) class C {}`) also triggers
    JSXIdentifier: jsxIdentifierVisitor,
    MemberExpression: memberExpressionVisitor,
    BinaryExpression: binaryExpressionVisitor,
    Property: propertyVisitor,
    // class node sweeps its own type params + `extends Base<...>` super-type-args
    ClassDeclaration: visitDecoratorsAndAnnotation,
    ClassExpression: visitDecoratorsAndAnnotation,
    MethodDefinition: visitDecorators,
    PropertyDefinition: visitDecoratorsAndAnnotation,
    AccessorProperty: visitDecoratorsAndAnnotation,
    TSAbstractPropertyDefinition: visitDecoratorsAndAnnotation,
    TSAbstractAccessorProperty: visitDecoratorsAndAnnotation,
  };
}

// --- Syntax visitors ---

export function createSyntaxVisitors({ injectModulesForModeEntry, injectModulesForEntry, isDisabled, isWebpack = false }) {
  const rules = createSyntaxRules({ injectModulesForModeEntry, injectModulesForEntry, isDisabled, isWebpack });
  const onFunction = path => rules.onFunction(path.node);
  const onClass = path => rules.onClass(path.node);
  return {
    ImportExpression(path) { rules.onImportExpression(path.node); },
    FunctionDeclaration: onFunction,
    FunctionExpression: onFunction,
    ArrowFunctionExpression: onFunction,
    ForOfStatement(path) { rules.onForOfStatement(path.node); },
    ArrayPattern(path) { rules.onArrayPattern(path.node); },
    SpreadElement(path) { rules.onSpreadElement(path.node, path.parent?.type); },
    YieldExpression(path) { rules.onYieldExpression(path.node); },
    VariableDeclaration(path) { rules.onVariableDeclaration(path.node); },
    ClassDeclaration: onClass,
    ClassExpression: onClass,
  };
}
