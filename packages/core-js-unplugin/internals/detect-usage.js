// detect polyfillable usage patterns (usage-global and usage-pure modes)
import { destructurePropLeafMeta } from '@core-js/polyfill-provider/detect-usage/destructure';
import { walkTypeAnnotationGlobals } from '@core-js/polyfill-provider/detect-usage/annotations';
import {
  beginMutationPrePass,
  createDetectionAdapter,
  mutationSiteVisitors,
} from '@core-js/polyfill-provider/detect-usage/mutations';
import { resolveKey as sharedResolveKey } from '@core-js/polyfill-provider/detect-usage/resolve';
import { createUsageHandlerCore } from '@core-js/polyfill-provider/detect-usage/visitors';
import { createSyntaxPathHandlers } from '@core-js/polyfill-provider/detect-syntax';
import { mergeVisitors } from '@core-js/polyfill-provider/helpers/source-scan';
import {
  aliasSpanDominatesUse,
  ancestorChainDetached,
  bareAssignmentPatternLeafPath,
  bindingInvisibleFromUseRegion,
  closestBindingVisibleAtUse,
  lookupReadPath,
  cleanDestructureAliasWrites,
  declaredIdentifierNodes,
  hoistedDeclarationInScope,
  findTSRuntimeBindingInPath,
  getDirectStatementBody,
  getTypeArgs,
  hoistedBindingVisibleInScope,
  IMPORT_SPECIFIER_TYPES,
  importBindingView,
  isAmbientBindingShape,
  isDestructurePattern,
  isInUpdateOperand,
  isMemberWriteOnlyContext,
  isNonReferencePosition,
  isTSTypeOnlyIdentifierPath,
  jsxTagRootReferencesBinding,
  memberContextPath,
  memoizeBindingLookup,
  pathContainedBy,
  pathOfNode,
  peelTransparentExprAncestorPath,
  POSSIBLE_GLOBAL_OBJECTS,
  liveBindingWrites,
  syntheticNodeAncestry,
  unwrapExportedDeclaration,
  usableAliasInfo,
  useAnchorStart,
  unwrapTransparentSeq,
  varScopeBlockOfBinding,
  wrapScopeBindingLookup,
  writesPastCeiling,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import {
  assignmentAliasWriteTrusted,
  hasCtorAliasCandidateShapes,
  isPolyfillAliasBinding,
  soleAliasWrite,
  isSymbolDestructureAliasBinding,
  registerAliasPrePassSite,
} from '@core-js/polyfill-provider/helpers/class-walk';
import { traverse } from 'estree-toolkit';

// --- isReferenced ---

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
  if (isTSTypeOnlyIdentifierPath({ node, parent, key: parentKey, parentPath })) return false;
  // member NAME slots - object-literal and class keys (property, accessor and method shapes alike, in
  // value space and in type space) plus a non-computed member tail. one shared predicate with the babel
  // emitter, so a global-shaped key (`abstract Map: number`) is never rewritten to the polyfill import
  if ((parentKey === 'key' || parentKey === 'property') && isNonReferencePosition(parent, node)) return false;
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
  // a bare pattern leaf of an ASSIGNMENT destructure writes the global name like the flat
  // LHS above: usage-global injects (the slot must exist for the strict-mode write), pure
  // rejects the write target. checked BEFORE the write-only filters, which match the same
  // shapes and would otherwise drop the global-mode injection
  if (node.type === 'Identifier' && bareAssignmentPatternLeafPath(path)) return !skipUpdateTargets;
  // member-write-only / destructure-LHS / AssignmentPattern.left for non-Identifier shapes.
  // tested on the ANCHOR: a wrapped pattern leaf (`({ p: Map! } = o)`) fills the slot with
  // the wrapper node, so the raw identifier would never match the slot identity
  if (isMemberWriteOnlyContext(anchor.node, parent, parentPath?.parent)) return false;
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

// the declaration NODE behind a TSImportEquals name - the existence walk above answers only
// a boolean, but the resolution canon must read the module reference off the declaration to
// recognize a pure global-proxy require import (`import g = require('.../global-this')`)
// Source declarations stay fixed during this pass, as in the TS-runtime binding index.
const tsImportEqualsDeclarations = new WeakMap();
function findTSImportEqualsDeclaration(path, name) {
  for (let cur = memberContextPath(path); cur; cur = memberContextPath(cur.parentPath)) {
    // the statement list of a scope anchor, through the one reader of that question - a loop's
    // block is that block's own, and reading it off the loop let a head see the body's declaration
    let declarations = tsImportEqualsDeclarations.get(cur.node);
    if (!declarations) {
      const body = getDirectStatementBody(cur.node);
      if (!body) continue;
      declarations = new Map();
      for (const stmt of body) {
        // Export wrappers carry the same declaration as the unexported spelling.
        const decl = unwrapExportedDeclaration(stmt);
        if (decl?.type === 'TSImportEqualsDeclaration' && !declarations.has(decl.id?.name)) {
          declarations.set(decl.id?.name, decl);
        }
      }
      tsImportEqualsDeclarations.set(cur.node, declarations);
    }
    const declaration = declarations.get(name);
    if (declaration) return declaration;
  }
  return null;
}

// estree-toolkit's scope tracker registers `declare class X` / `declare const X` / `interface X`
// / `import type X` as bindings even though they're tsc-elided. consult the binding before
// declaring a shadow so ambient/type-only declarations don't suppress polyfill emission.
// shared `isAmbientBindingShape` covers all tsc-elided binding forms uniformly with babel
function isAmbientBinding(binding) {
  return isAmbientBindingShape(binding?.path?.node, binding?.path?.parent);
}

// estree-toolkit over-hoists a binding declared inside `namespace N {}` / `declare global {}` (a
// TSModuleBlock) - var/let/const, class, function alike - to the enclosing function / program
// scope, and files one a class static block declares on the CLASS scope, so `scope.getBinding`
// surfaces it for a use OUTSIDE the block - a method reading the global past `static { let Promise;
// }`. true when `native` is such a binding and `path` does NOT sit inside its block, so the
// block-local declaration must not shadow the real global used outside. hasRuntimeBinding +
// getBinding + getBindingNodeType share this so they stay consistent - matching babel, which scopes
// both blocks correctly
function isOverHoistedBlockBinding(native, path) {
  if (!native || !path) return false;
  const block = varScopeBlockOfBinding(native);
  return !!block && !pathContainedBy(path, block);
}

const FUNCTION_NODE_TYPES = new Set(['FunctionExpression', 'FunctionDeclaration', 'ArrowFunctionExpression']);

// the switch a binding's case belongs to, or null: a fact of the binding, climbed once per binding object
const caseBlockSwitchCache = new WeakMap();
function caseBlockSwitchOf(native) {
  if (caseBlockSwitchCache.has(native)) return caseBlockSwitchCache.get(native);
  // above the declaration, as the namespace climb starts: a function declaration's binding path is
  // the declaration itself, which the boundary test below would stop at
  let p = native.path?.parentPath;
  while (p?.node && p.node.type !== 'SwitchCase') {
    if (FUNCTION_NODE_TYPES.has(p.node.type) || p.node.type === 'Program') break;
    p = p.parentPath;
  }
  const switchNode = p?.node?.type === 'SwitchCase' ? p.parentPath?.node : null;
  const result = switchNode?.type === 'SwitchStatement' ? switchNode : null;
  caseBlockSwitchCache.set(native, result);
  return result;
}
// estree-toolkit does not model the switch CaseBlock (the braces around the cases) as its own
// lexical scope: a case-body `let` (`case 1: let globalThis = ...`) reports as in scope at the
// DISCRIMINANT - a region the CaseBlock never covers. a raw global in the discriminant then loses
// its substitution (ReferenceError on targets without it). true when `native` is declared directly
// under a SwitchCase and `path` sits in that switch ahead of its cases. a `path` outside the switch
// anchors a lookup asked in the switch's own scope for code its cases hold - the initializer of a
// `var` declared there, read where the `var` is used - and that code reads the case-level binding.
// babel scopes the CaseBlock correctly, so this fires only on the estree side; a binding inside a
// nested block of a case is scoped by that block and never resolves out here
function isCaseBlockBindingOutsideCases(native, path) {
  if (!native?.path || !path?.node) return false;
  const switchNode = caseBlockSwitchOf(native);
  if (!switchNode) return false;
  const pos = path.node.start;
  const casesStart = switchNode.cases?.[0]?.start ?? switchNode.end;
  return typeof pos === 'number' && pos >= switchNode.start && pos < casesStart;
}

// the declaration estree-toolkit filed as a violation of a binding declares the violated Identifier: a
// declarator, through any pattern, or a class or function declaration - null for a write
const VIOLATION_DECLARATION_TYPES = new Set(['VariableDeclarator', 'ClassDeclaration', 'FunctionDeclaration']);
function violationDeclarationOf(violation) {
  for (let path = violation.parentPath; path?.node; path = path.parentPath) {
    if (VIOLATION_DECLARATION_TYPES.has(path.node.type)) return declaredIdentifierNodes(path.node)?.has(violation.node) ? path : null;
  }
  return null;
}

// the loop a binding's declaration heads and the lexical declaration its body block redeclares the name
// with (`{ region, twin, declared }`: the body, the declared Identifier and the declarator, class or
// function declaring it), or null. estree-toolkit gives a loop's body block no scope of its own
// (`shouldBlockStatementMakeScope`), so that declaration lands on the head's binding as a declaration
// violation, where the body block binds it apart and shadows the head inside it - a `var` head as well,
// whose own redeclaration in the body is the same binding and no twin. sloppy code may declare one
// function name twice there, and the last declaration is the binding. a fact of the binding, asked on
// every lookup: a binding no loop heads answers off its own nodes, and a head's is climbed once
const loopBodyTwinCache = new WeakMap();
function loopBodyTwinOf(native) {
  const declaration = native?.path?.parentPath?.node;
  const loop = native?.path?.parentPath?.parentPath?.node;
  if (declaration?.type !== 'VariableDeclaration' || loop?.body?.type !== 'BlockStatement'
    || (loop.left !== declaration && loop.init !== declaration)) return null;
  if (loopBodyTwinCache.has(native)) return loopBodyTwinCache.get(native);
  const twins = [];
  for (const violation of native.constantViolations ?? []) {
    const declared = bodyDeclarationOf(violation, loop.body);
    if (declared) twins.push({ region: loop.body, twin: violation, declared });
  }
  const result = twins.length === 1 || twins.every(({ declared }) => declared.node.type === 'FunctionDeclaration')
    ? twins.reduce((last, twin) => !last || twin.declared.node.start > last.declared.node.start ? twin : last, null) : null;
  loopBodyTwinCache.set(native, result);
  return result;
}

// ... the lexical declaration a statement of that body declares the violated Identifier with, or null
function bodyDeclarationOf(violation, body) {
  const declared = violationDeclarationOf(violation);
  if (declared?.node.type !== 'VariableDeclarator') return declared?.parentPath?.node === body ? declared : null;
  return declared.parent?.kind !== 'var' && declared.parentPath?.parentPath?.node === body ? declared : null;
}

// ... is the use inside that body, where the body's declaration answers instead of the head's binding
function isLoopHeadShadowedAtUse(native, path) {
  const shadow = loopBodyTwinOf(native);
  return !!shadow && pathContainedBy(path, shadow.region);
}

// the declarations namespace bodies and class static blocks make of a binding's name, by the block making each
// (`{ region, twin, declared }` as for a loop body): estree-toolkit gives neither block a scope of its own either,
// so a declaration there lands on a binding declared before it - outside the block, or in another such block of the
// same scope - as a declaration violation, where the block binds it apart and shadows that binding inside it
const blockTwinsCache = new WeakMap();
function blockTwinsOf(native) {
  if (!native?.constantViolations?.length) return null;
  if (blockTwinsCache.has(native)) return blockTwinsCache.get(native);
  const ownBlock = varScopeBlockOfBinding(native);
  let twins = null;
  for (const violation of native.constantViolations) {
    const declared = violationDeclarationOf(violation);
    const region = declared && varScopeBlockOfBinding({ path: declared });
    if (region && region !== ownBlock && !twins?.has(region)) (twins ??= new Map()).set(region, { region, twin: violation, declared });
  }
  blockTwinsCache.set(native, twins);
  return twins;
}

// ... the one whose block holds the use - the nearest, where the blocks nest. a lookup anchored at the block
// itself is in it: a guard's shadow check asks from the block hosting the statements it scans
function blockTwinAtUse(native, path) {
  const twins = path ? blockTwinsOf(native) : null;
  if (!twins) return null;
  for (let cur = path; cur?.node; cur = cur.parentPath) {
    const twin = twins.get(cur.node);
    if (twin) return twin;
  }
  return null;
}

// a native binding that does not actually cover the use site: a namespace-local or static-block
// declaration over-hoisted past its block, a case-block lexical binding consulted from outside the
// cases region, a loop head the loop's body redeclares, consulted inside the body, or a binding a
// namespace body or static block redeclares, consulted inside the block. callers fall through to the
// TS-runtime / var-hoist fallbacks - a nested-block `var` may still bind
function nativeBindingInvisibleAtUse(native, path) {
  return isOverHoistedBlockBinding(native, path) || isCaseBlockBindingOutsideCases(native, path)
    || isLoopHeadShadowedAtUse(native, path) || !!blockTwinAtUse(native, path)
    || bindingInvisibleFromUseRegion(native?.path, path);
}

// estree-toolkit FALSELY records a DECLARATION as a constant-violation babel never does: a
// same-named `namespace N {}` / `declare global {}` or class static block twin (filed onto the real
// binding's scope), and a for-init `let`/`const` recording its own declarator. both surface as an Identifier a declaration
// declares, through any pattern (`violationDeclarationOf`), never a write. drop exactly those
// PATH-PRESERVING (a real reassignment's parent is an Assignment/Update/for-x head, and
// `findPrecedingBlockAssignment` still reads the real write paths), so the resolver's reassignment
// gates stop bailing on a phantom. estree-only - babel's default hook keeps the raw list (babel scopes
// namespaces correctly). a declaration is phantom iff it is EITHER the binding's own declaration
// (for-init self) OR declared in a namespace body or a static block; a same-scope `function`/`class`
// redeclaration is neither, so its real last-wins shadow is kept (a same-scope `var` redecl records
// no violation; a `let`/`const` one is a SyntaxError)
function isPhantomDeclarationViolation(violation, binding) {
  const declPath = violationDeclarationOf(violation);
  return !!declPath && (declPath.node === binding?.path?.node || !!varScopeBlockOfBinding({ path: declPath }));
}

// ... and so is every violation inside a block the tracker gives no scope of its own that redeclares the
// name - a loop body (`loopBodyTwinOf`), a namespace body or static block (`blockTwinsOf`): the declaration
// and the writes there belong to the block's binding, which shadows this one inside it
function isTwinRegionViolation(violation, binding) {
  const loopTwin = loopBodyTwinOf(binding);
  if (loopTwin && pathContainedBy(violation, loopTwin.region)) return true;
  const twins = blockTwinsOf(binding);
  for (let cur = twins ? violation.parentPath : null; cur?.node; cur = cur.parentPath) {
    if (twins.has(cur.node)) return true;
  }
  return false;
}
// one FILTERED stand-in per native binding: every identity consumer downstream (the
// resolver's per-binding lookup cache, closure membership Sets, per-binding classification
// Maps) keys by object identity, so a fresh copy per call would silently miss them all -
// dropping recorded writes from the analyses those consumers feed. violations are stable
// after the scope crawl, so the memoized answer never goes stale within a file - the binding
// itself where nothing drops, which every lookup of it would otherwise scan its writes again for
const phantomFilteredBindings = new WeakMap();
export function withoutPhantomDeclarationViolations(binding) {
  const violations = binding.constantViolations;
  if (!violations?.length) return binding;
  const cached = phantomFilteredBindings.get(binding);
  if (cached) return cached;
  const real = violations.filter(v => !isPhantomDeclarationViolation(v, binding) && !isTwinRegionViolation(v, binding));
  // spread copies the binding's OWN props (`path` / `scope` / `kind`) so a resolver consumer can
  // re-spread (`{ ...binding, constantViolations: combined }`) without losing them. carry
  // `constant` explicitly - it is a prototype getter on the estree Binding (not copied by spread)
  // and `constantBindingPath` reads it
  const filtered = real.length === violations.length ? binding : { ...binding, constantViolations: real, constant: real.length === 0 };
  phantomFilteredBindings.set(binding, filtered);
  return filtered;
}

// shared tail of every "no authoritative native binding" branch below: a TS-runtime
// declaration (enum / namespace / import-equals) or a nested-block hoisted `var` may still
// bind the name even when the scope tracker reports nothing usable. a name read apart from the
// use (`read`) is climbed for from where it is read (`lookupReadPath`)
function tsOrVarHoistFallback(scope, name, path, read = null) {
  const anchor = lookupReadPath(path, read);
  if (hasTSRuntimeBinding(scope, name, anchor)) return true;
  // estree-toolkit doesn't hoist `var` declarations from nested non-function blocks to
  // the enclosing function scope (babel's tracker does). without this fallback,
  // `function () { if (cond) { var globalThis = ...; } return globalThis; }` reports
  // no binding at the inner reference, so the Identifier visitor substitutes a USER
  // binding (`globalThis -> _globalThis`). walking `path` ancestors for var-scope owners
  // closes the gap
  return !!anchor && !!hoistedDeclarationInScope(scope, anchor, name);
}

function hasRuntimeBinding(scope, name, path = null, read = null) {
  if (!(scope?.hasBinding?.(name, path) ?? false)) return tsOrVarHoistFallback(scope, name, path, read);
  // hasBinding=true; for real scopes where getBinding is also available, filter out ambient
  // TS-only declarations. stub scopes (`detectEntries` shadowScope) don't expose getBinding -
  // their hasBinding=true is authoritative
  const native = scope?.getBinding?.(name, path);
  if (!native) return true;
  // a use-invisible binding (over-hoisted namespace / case-block let outside the cases) doesn't
  // shadow, but an OUTER same-name declaration above it still does - continue the walk through
  // the shared visible-binding canon (`const globalThis = fake; switch (globalThis.X) { case 1:
  // let globalThis; }` stays shadowed by the outer const, matching babel's native scoping)
  const visible = nativeBindingInvisibleAtUse(native, path)
    ? closestVisibleNativeBinding(scope, name, path) : native;
  // an ambient shape alone is NOT authoritative: a declaration-merged runtime namespace
  // (`declare const Map: any; namespace Map {}`) still emits a real `var` after the TS
  // transform, so the use MUST stay on the user binding. no visible binding falls through to
  // the TS-runtime scan and the function-scope var walk, matching the babel adapter's ordering
  if (!visible || isAmbientBinding(visible)) return tsOrVarHoistFallback(scope, name, path, read);
  return true;
}

// the ONE scoped pre-pass walk (estree side): every registration that has to stand before the
// usage pass meets a use rides it, and each lane brings its own cheap census gate - a file that
// trips none pays no walk at all. The mutation lane classifies its sites in place; the held-read
// lane collects property paths for scoped settlement. The alias lane only COLLECTS, because
// registration reads an injector this walk runs ahead of and has to
// stay behind the mutated-static enrichment that feeds it. shares every resolution step with the
// read side via `mutations` (provider)
export function collectPrePassSites({
  ast,
  adapter,
  census = null,
  resolveStaticKey = null,
  collectMutations = false,
  isDisabled = null,
}) {
  const { mutated, handleSite, finalize } = collectMutations
    ? beginMutationPrePass({ resolveStaticKey, rootNode: ast, adapter, census })
    : { mutated: null, handleSite: null, finalize: null };
  const wantsAliases = !!isDisabled
    && (census ? census.hasCtorAliasShapes : hasCtorAliasCandidateShapes(ast));
  const aliasSites = [];
  if (!handleSite && !wantsAliases) return { mutated, aliasSites };
  const siteVisitors = wantsAliases
    ? mergeVisitors(handleSite ? mutationSiteVisitors(handleSite) : {}, aliasSiteVisitors(aliasSites, isDisabled))
    : handleSite ? mutationSiteVisitors(handleSite) : {};
  traverse(ast, {
    $: { scope: true },
    ...siteVisitors,
  });
  finalize?.();
  return { mutated, aliasSites };
}

// the ctor-alias lane's collectors: the destructure-of-global sites in document order, each
// carrying what registration cannot read later - the host's declaration kind and the site's own
// scope, both facts of where the walk stands
function aliasSiteVisitors(sites, isDisabled) {
  return {
    AssignmentExpression(path) {
      const { node } = path;
      if (node.operator !== '=' || isDisabled(node)
        || !isDestructurePattern(node.left)) return;
      sites.push({
        pattern: node.left,
        init: node.right,
        assignNode: node,
        scope: path.scope,
        path,
      });
    },
    VariableDeclarator(path) {
      const { node } = path;
      if (!node.init || isDisabled(node)
        || !isDestructurePattern(node.id)) return;
      sites.push({
        pattern: node.id,
        init: node.init,
        declKind: path.parent.kind,
        scope: path.scope,
        path,
      });
    },
  };
}

// early ctor-alias registration (estree side) - see the babel twin in the plugin's initFile:
// pre-register every destructure-of-global site through the shared trust gates so a member use
// textually BEFORE its alias write still reads a complete table when visited
export function registerAliasPrePassSites(sites, { adapter, injector }) {
  for (const site of sites) registerAliasPrePassSite({ ...site, adapter, injector });
}

// estree merges an over-hoisted namespace declaration with a REAL same-name declaration in the
// hoist-target scope into ONE binding. declared namespace-FIRST, the binding anchors on the
// namespace declarator and the real declaration survives only as a declaration-violation (the
// namespace-SECOND order is the mirrored shape the phantom filter already strips). re-anchor the
// binding onto that real declaration so a use outside the block keeps its narrow instead of
// degrading to generic. exactly one visible candidate re-anchors - ambiguity stays on the walk. a
// static block's binding passes the same gate, but all that can share its class scope is another
// block's twin, which no use outside that block sees.
// a use inside a loop body, a namespace body or a static block redeclaring the name re-anchors onto
// that declaration (`loopBodyTwinOf`, `blockTwinAtUse`), whose writes are the ones inside that
// region - the binding's own declarator and its writes outside it belong to the binding
// memoized per (binding, anchor): identity consumers downstream (per-binding resolver caches,
// closure membership Sets) key by object identity, so a fresh copy per call would miss them all
const reanchoredBindings = new WeakMap();
function visibleSameScopeDeclarationTwin(native, path) {
  const shadow = (isLoopHeadShadowedAtUse(native, path) ? loopBodyTwinOf(native) : null) ?? blockTwinAtUse(native, path);
  if (!shadow && !varScopeBlockOfBinding(native)) return null;
  const candidates = shadow ? [shadow.twin] : (native.constantViolations ?? []).filter(v => {
    const decl = v?.parentPath?.node;
    return decl && decl.id === v.node && decl !== native.path?.node
      && !nativeBindingInvisibleAtUse({ path: v.parentPath, scope: native.scope }, path);
  });
  if (candidates.length !== 1) return null;
  const [anchor] = candidates;
  const cached = reanchoredBindings.get(native)?.get(anchor);
  if (cached) return cached;
  const violations = native.constantViolations.filter(v => v !== anchor && (!shadow || pathContainedBy(v, shadow.region)));
  const declared = shadow ? shadow.declared : anchor.parentPath;
  const reanchored = {
    ...native,
    path: declared,
    // a region's class or function declaration binds as estree-toolkit files those: hoisted
    kind: declared.parent?.kind ?? (shadow ? 'hoisted' : native.kind),
    constantViolations: violations,
    // `constant` is a prototype getter on the estree Binding (not copied by spread) - carry it
    constant: violations.length === 0,
  };
  if (!reanchoredBindings.has(native)) reanchoredBindings.set(native, new Map());
  reanchoredBindings.get(native).set(anchor, reanchored);
  return reanchored;
}

// the nearest native binding that actually COVERS the use site. a binding invisible at the
// use (case-block let consulted from outside the cases, over-hoisted namespace local) does not
// end the lookup - per ECMA that region belongs to the OUTER declaration, so the walk first
// re-anchors onto a same-scope declaration twin, then continues in the invisible binding's
// enclosing scope: `const g = globalThis; switch (g.self.X) { case 1: let g; }` resolves the
// discriminant `g` to the outer const (babel scopes these regions natively, so dead-ending here
// desyncs the emitters - the alias-follow reports unbound and the proxy-hop collapse never fires).
// the walk is the shared one (`closestBindingVisibleAtUse`), with this tracker's own misplacements
// beside the region rule
export function closestVisibleNativeBinding(scope, name, path) {
  return closestBindingVisibleAtUse(scope?.getBinding?.(name, path) ?? null, path, {
    outer: native => visibleSameScopeDeclarationTwin(native, path) ?? native.scope?.parent?.getBinding?.(name, path) ?? null,
    invisible: nativeBindingInvisibleAtUse,
  });
}

// closest-binding resolution shared by getBinding / getBindingNodeType (hasRuntimeBinding
// shares the same primitives and branch order): forward `path` so the lookup stays position-aware;
// walk past a native binding invisible at the use (over-hoisted namespace /
// case-block let outside the cases); prefer the synthesized var-hoist binding when the visible
// native declaration lies OUTSIDE the var's hoist owner - the nested-block `var` is the NEARER
// binding there (estree-toolkit neither hoists it nor lets it shadow the outer name), while a
// declaration INSIDE the owner (a param, a nearer lexical shadow) keeps the native view. a
// native resolution of the SAME declarator keeps the native view too (richer info channel)
function resolveClosestBinding({ scope, name, path, getScopeBinding, read = null }) {
  return memoizeBindingLookup({
    scope,
    name,
    path,
    compute: () => resolveClosestBindingUncached({ scope, name, path, getScopeBinding, read }),
    read,
  });
}

// ... the resolution itself, run once per (scope, name, use node, read) through the memo above
function resolveClosestBindingUncached({ scope, name, path, getScopeBinding, read }) {
  const native = getScopeBinding({ scope, name, path, read });
  const synth = hoistedBindingVisibleInScope(scope, path, name);
  if (!synth) return { native, synth: null };
  if (native && (native.path?.node === synth.node || pathContainedBy(native.path, synth.ownerNode))) {
    return { native, synth: null };
  }
  return { native: null, synth };
}

// the estree half of the adapter mirror: `createBabelAdapter` (babel-plugin's internals/detect-usage.js)
// exposes the same surface, and a contract change to either must land in both. one member is
// asymmetric by construction and stays so: `getTSImportEqualsNode` exists only on the estree
// side, because estree-toolkit registers no binding for `import x = require(...)` while babel
// does - the two answer the SAME question, one through a dedicated lookup, one through its
// native binding (the provider's consumer branches on the member's presence) per-transform state
// lives in the instance closure - concurrent transforms each build their own
// factory: per-plugin-instance adapter closed over callbacks (an options bag mirroring the
// babel twin) - keeps unplugin's adapter contract symmetric without leaning on module-level
// state. `getInjector()` returns the active per-transform injector or null between
// transforms; both consumers
// (adapter.getBinding's polyfillHint AND typeResolvers' getPolyfillBindingEntry) read
// through the same callback so user-imported polyfill UIDs (`import _Promise from
// '@core-js/pure/.../promise/constructor'; _Promise.resolve(1)`) get recognised as
// proxy-globals. re-entrancy is the caller's contract: plugin.js save/restore is the
// runTransform try/finally - early-returns before the save leave the outer injector intact.
export function createEstreeAdapter(options = {}) {
  const { getInjector = () => null, nestedTSRuntimeDeclarations } = options;
  const getScopeBinding = wrapScopeBindingLookup(closestVisibleNativeBinding, nestedTSRuntimeDeclarations);
  // the read reaches the closest-binding resolution through the wrap's runtime-declaration climb alone,
  // which runs only in a file declaring one below its top level: anywhere else a read keys no answer of
  // its own, and the memo keeps one entry per use
  function climbedRead(read) {
    return nestedTSRuntimeDeclarations?.() ?? true ? read : null;
  }
  return createDetectionAdapter(options, adapter => ({
    hasBinding({ scope, name, path = null, read = null }) {
      // a MINTED pure-import name answers like the printed tree will (see getBinding below):
      // without this, `resolveObjectName`'s unbound-identifier branch reads the UID as a
      // would-be global (`_Promise` - not capitalised - resolves to nothing). the registry
      // view applies the span discipline; a USER-named record out of its span must not
      // serve (out there the name is a different binding or the real global)
      if (hasRuntimeBinding(scope, name, path, read)) return true;
      const minted = getInjector()?.getBindingInfo?.(name, useAnchorStart(path));
      // ... and so does a plugin-MINTED blind alias holding a CONSTRUCTOR (a guard memo ref): its
      // `var _ref` is real but the scope registry lags the mid-traversal insertion, and reading it as
      // unbound sent `resolveObjectName` down the would-be-global branch, where `_ref` names nothing -
      // the static claim rebuilt onto the ref then died into a raw read off the ponyfill.
      // a memo holding the SURFACE keeps the unbound reading: this leg's own surface routes resolve it
      // (`proxySurfaceNameOf`), and answering here folds an SE-keyed hop the reference emitter keeps
      return !!(minted?.hint
        && ((minted.minted && !POSSIBLE_GLOBAL_OBJECTS.has(minted.hint)) || (minted.source && !minted.userNamed)));
    },
    getBinding({ scope, name, path = null, read = null }) {
      const { native: b, synth } = resolveClosestBinding({ scope, name, path, getScopeBinding, read: climbedRead(read) });
      // var-hoist branch (mirrors hasRuntimeBinding): estree-toolkit doesn't hoist a `var` from a
      // nested non-function block to its function scope, so `function f(){ if (c) { var g =
      // globalThis } g.Map.groupBy(...) }` either finds no native binding or resolves to an OUTER
      // same-name binding the nested var actually shadows (babel hoists the var natively, so the
      // two pipelines diverge here). surface a synthetic binding off the declarator + its
      // reassignment sites so alias resolution reads its `.init` and the resolver's reassignment
      // guard fires for a REASSIGNED nested-block var
      if (synth || !b) {
        if (!synth) {
          // a MINTED pure-import name: the emitter swaps members to import bindings DURING
          // traversal while the ImportDeclarations only flush at the end, so a follow through
          // such a name (`const k = _Symbol$iterator; k in X`) finds no tree binding yet.
          // serve the injector's registry view (span-disciplined; a USER-named record out of
          // its span stays invisible - the name there is a different binding)
          const minted = getInjector()?.getBindingInfo?.(name, useAnchorStart(path));
          // a MINTED blind alias (a guard memo, `_ref = _globalThis.window`
          // registered as holding 'window') serves its hint the same way - the rebuilt
          // spine's claims resolve through the ref exactly like the source root
          if (minted?.hint && ((minted.source && !minted.userNamed) || minted.minted)) {
            return {
              node: null,
              kind: 'module',
              constantViolations: [],
              references: 1,
              scope,
              // the stored hint is the UID spelling (`Symbol$iterator`); the polyfillHint
              // contract is the source spelling (`Symbol.iterator`, `Promise`)
              importSource: minted.source,
              importKind: 'value',
              polyfillHint: minted.hint.replaceAll('$', '.'),
              mintedAlias: minted.minted === true,
            };
          }
          return null;
        }
        // the synthetic binding skips the hint machinery below (no `.path`); still surface the
        // registry's guard hint for it - IDENTITY view only, like the native-binding path (a
        // hoisted-var alias registers per-declarator in the pre-pass, so identity reaches it)
        const synthIdentity = getInjector()?.getBindingAliasInfo?.(synth.node, name) ?? null;
        // and the Symbol destructure fold source: an UNCONDITIONAL nested-block `var`
        // (a labeled block, a finally, a for-init) folds on babel through its native
        // hoist, so the shape-judged alias must surface here too or the emitters desync
        const synthInfo = synthIdentity ?? getInjector()?.getBindingInfo(name, useAnchorStart(path)) ?? null;
        const aliasSymbolSource = isSymbolDestructureAliasBinding({
          info: synthInfo, binding: synth, scope, adapter, injector: getInjector(), boundName: name,
          keyCtx: { resolveKey: sharedResolveKey, path },
        }) ? synthInfo.source : null;
        // babel hoists the nested-block `var` natively and reports the declarator's own scope for
        // it; opt the synthesized twin into the same key or the const-alias walkers would resolve
        // this binding's init at the USE site instead. lazily: only a walker that follows the init
        // reads it, and the lookup that never does must not pay for the search
        return {
          ...synth,
          name,
          get scope() { return synth.resolveDeclarationScope(); },
          aliasSymbolSource,
          guardedAliasHint: synthIdentity?.hint ?? null,
        };
      }
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
      // binding-first: the per-binding registry is exact - see the babel twin
      const identityInfo = getInjector()?.getBindingAliasInfo?.(b.path.node, name) ?? null;
      const info = identityInfo ?? getInjector()?.getBindingInfo?.(name, useAnchorStart(path)) ?? null;
      const { isImportBinding, isRequireBinding, importSource, importKind } =
        importBindingView(b.path.node, b.path.parent, { adapter, scope, path });
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
      // the shared recompute's branches are phantom-free by construction, and its raw-list
      // fallbacks (`!path`, a kind it does not cover) get the valueless-redeclaration
      // self-record (`var { Map: M } = g; var M;`) stripped inside it, so both adapters hand
      // the resolver the same violation list for identical source
      const constantViolations = liveBindingWrites({ binding: b, name, usePath: path });
      // the shared alias guard reads the RECOMPUTED violations (an assignment-form alias matches them
      // against its registered write span; the raw estree list carries phantoms) - so it runs after them
      // a VERIFIED identity hit needs no live shape verification - see the babel twin
      const isAliasBindingShape = !!identityInfo?.aliasVerified || isPolyfillAliasBinding({
        info, binding: { path: b.path, constantViolations }, scope, adapter, injector: getInjector(), boundName: name, path,
      });
      // guarded registration = flow-trust refused: the member read stays native. the dominance
      // gate keeps a use textually BEFORE its trusted write / declaration native too.
      // a plugin-MINTED memo (a guard ref) reaches here once its `var _ref` IS in the scope
      // registry - the synthetic branch above serves it only while that lags. the minted arm is
      // the babel twin's: the ref is allocator-owned (user code cannot rebind it) and its hint was
      // set from a resolved surface, so a claim rebuilt onto it resolves through the ref
      // an in-file `require` binding shadows the CJS import - the require-style arm only
      // fires for the real module function (the node-local view cannot see the shadow)
      // the shadow discipline already rode in through `importBindingView`'s shadowCtx
      const requireBindingLive = isRequireBinding;
      const polyfillHint = usableAliasInfo(info)
        && (isAliasBindingShape || isImportBinding || requireBindingLive || info.minted)
        && aliasSpanDominatesUse({ info, useStart: useAnchorStart(path), usagePath: path }) ? info.hint : null;
      // a destructured Symbol.X alias (`const { iterator } = Symbol`) is a PATTERN binding with no
      // `importSource` and a UID hint; surface the registered module source so `bindingSymbolKey`
      // folds `obj[iterator]` uniformly with babel. the shadow gate rejects a nested same-name binding
      // whose RHS is not Symbol (the name-keyed injector info is flat)
      const aliasSymbolSource = isSymbolDestructureAliasBinding({
        info, binding: b, scope, adapter, injector: getInjector(), boundName: name, keyCtx: { resolveKey: sharedResolveKey, path },
      }) ? info.source : null;
      return {
        node: b.path.node,
        kind: b.kind === 'hoisted' && b.path.node?.type === 'ClassDeclaration' ? 'let' : b.kind,
        name,
        constantViolations,
        importSource,
        importKind,
        // READ count of the binding - estree-toolkit keeps reference paths (writes excluded)
        references: b.references?.length ?? 0,
        // Initializers resolve in the declaration's scope. A canonical hoisted binding
        // carries its owner's scope separately; a class path opens the inner class-name scope.
        scope: b.path.node.type === 'ClassDeclaration' ? b.scope : b.path.scope ?? b.scope,
        // the declarator's own PATH - see the babel twin
        declarationPath: b.path,
        polyfillHint,
        aliasSymbolSource,
        aliasWrite: polyfillHint ? info?.aliasWrite ?? null : null,
        // the hint of a registration whose static narrow did NOT apply at this use - a REFUSED
        // (guarded) registration or a use textually before its trusted write (dominance).
        // IDENTITY view only: a resolved binding with no per-binding entry is provably a
        // USER binding (a shadow), which must not pick up the alias's guard. drives the
        // RUNTIME ctor guard on member reads of known separate statics - the guard compares
        // the live value against the swapped ctor, so it self-corrects on any actual flow
        guardedAliasHint: identityInfo && !polyfillHint ? identityInfo.hint : null,
        // every ctor the slot was written with - the babel twin carries the same list
        guardedAliasHints: identityInfo && !polyfillHint ? identityInfo.hints ?? null : null,
        guardedAliasWrite: identityInfo?.aliasWrite ?? identityInfo?.aliasDeclSpan ?? null,
      };
    },
    // lazy lookup for the resolver's assignment-form alias branch (mirror of the babel adapter):
    // raw estree violations are PATHS onto the written Identifier - climb to the enclosing
    // AssignmentExpression, then run the shared trust predicate
    findTrustedAliasWrite(scope, name, { requirePlacement = true, readNode = null } = {}) {
      const raw = scope?.getBinding?.(name);
      // a binding written past the ceiling holds no single trusted write (`writesPastCeiling`)
      if (!raw || raw.path?.node?.type !== 'VariableDeclarator' || raw.path.node.init
        || writesPastCeiling(raw.constantViolations)) return null;
      // mirror the babel twin: count the writes the alias canon counts BEFORE the first-violation
      // pick - a trailing `var X;` lands in the raw list, the assignment climb dead-ends on its
      // declarator, and the trust predicate's every-violation span check fails, dropping the
      // trusted write babel resolves (a usage-global under-inject); an identity self-assign is
      // no second value source either
      const violations = cleanDestructureAliasWrites(raw);
      const b = violations === raw.constantViolations ? raw : { ...raw, constantViolations: violations };
      let assignPath = violations?.[0];
      while (assignPath && assignPath.node?.type !== 'AssignmentExpression') assignPath = assignPath.parentPath;
      const assignNode = assignPath?.node;
      if (!assignNode) return null;
      // a render that replaced a subtree while CARRYING this write leaves the cached violation
      // path climbing edges that left the tree - re-anchor the placement judgment on the write's
      // LIVE ancestry (the babel adapter re-anchors through its own fresh-path lookup)
      if (ancestorChainDetached(assignPath)) {
        let top = scope;
        while (top?.parent) top = top.parent;
        const fresh = top?.path?.node ? syntheticNodeAncestry(top.path.node, assignNode) : null;
        assignPath = fresh ?? assignPath;
      }
      // the ASSIGNMENT path itself: the placement walk judges every edge up to the statement,
      // so a conditional expression container between them refuses flow-trust. a STRUCTURAL
      // consumer skips placement - its branch-after-test proof carries execution evidence
      return (requirePlacement
        ? assignmentAliasWriteTrusted({ binding: b, assignNode, stmtPath: assignPath, readNode })
        : soleAliasWrite({ binding: b, assignNode }))
        ? assignNode : null;
    },
    getBindingNodeType({ scope, name, path = null, read = null }) {
      // stay consistent with getBinding through the SAME closest-binding resolution: a
      // use-invisible native binding must not report its declarator type (else the resolver
      // type-gates into resolveVariableBindingToGlobal with the null binding getBinding
      // returned), and a nested-block `var` shadowing an outer binding reports as a declarator
      const { native, synth } = resolveClosestBinding({ scope, name, path, getScopeBinding, read: climbedRead(read) });
      return synth ? synth.node.type : native?.path?.node?.type ?? null;
    },
    // estree-toolkit registers no binding for TSImportEquals at all (see hasTSRuntimeBinding) -
    // surface the declaration node through a dedicated lookup so the resolution canon can read
    // its module reference. single-consumer, existing binding paths stay untouched; babel's
    // adapter resolves the same shape through its native binding and doesn't implement this
    getTSImportEqualsNode({ scope, name, path = null, read = null }) {
      const anchor = lookupReadPath(path, read) ?? scope?.path ?? null;
      return anchor ? findTSImportEqualsDeclaration(anchor, name) : null;
    },
    // shared `unwrapTransparentSeq` peels paren / TS expression wrappers / safe SequenceExpression
    // so `require('core-js/...' as any)` / `require((0, 'core-js/...'))` / `require(('core-js/...'))`
    // all reach the underlying string literal. SE prefix that carries observable side-effects
    // stops further peeling - entry-detection doesn't rewrite the call, so unsafe SE stays
    isStringLiteral(node) {
      return isLiteralString(unwrapTransparentSeq(node));
    },
    getStringValue(node) {
      const inner = unwrapTransparentSeq(node);
      return isLiteralString(inner) ? inner.value : null;
    },
  }));
}

function isLiteralString(node) {
  return node?.type === 'Literal' && typeof node.value === 'string';
}

// --- Usage visitors ---

// estree-toolkit descends into the children a replace or remove detached - its choice, not a contract. a pure
// walk acts through no path under a removed ancestor; what still needs a claim there fires first (`claimLive`).
// the mark decides, not the shape (`ancestorChainDetached`): a node a render moved by hand under a new parent is
// live, and the walk reaches it through its old chain only
export function rejectDetachedPaths(visitors) {
  return Object.fromEntries(Object.entries(visitors).map(([type, visit]) => [type, path => {
    for (let up = path; up?.node; up = up.parentPath) if (up.removed) return;
    visit(path);
  }]));
}

// fire the claims inside nodes a render re-reads off the pristine tree while their paths are still live. a node a
// second route hands again meets its own rendered output, which the visitors leave inert as they do on a requeue
export function claimLive(visitors, nodes, at) {
  for (const node of nodes) pathOfNode(at, node)?.traverse(visitors);
}

export function createUsageVisitors({
  adapter,
  onUsage,
  method,
  suppressProxyGlobals = false,
  walkAnnotations = true,
  isEntryAvailable,
  resolveMeta,
  resolvePure = null,
  parameterCallSites = null,
  resolveStaticKey = null,
  onSuppressedProxyHop = null,
  suppressKeptNavRoot = null,
  onDeadBranch = null,
  onDiscardedClaim = null,
}) {
  const core = createUsageHandlerCore({
    adapter,
    onUsage,
    method,
    isEntryAvailable,
    resolveMeta,
    resolvePure,
    resolveStaticKey,
    suppressProxyGlobals,
    onSuppressedProxyHop,
    suppressKeptNavRoot,
    onDiscardedClaim,
  });
  const { skipUpdateTargets } = core;

  // detached paths are rejected before detection builds their metadata
  function liveVisitors(visitors) {
    return method === 'usage-pure' ? rejectDetachedPaths(visitors) : visitors;
  }

  // build meta for destructuring property: const { from } = Array, ({ from } = Array) - the funnel
  // choke shared with the babel leg; the key is read at the pattern holding it, where it EVALUATES
  function buildDestructuringMeta(propNode, objectPattern, containerUnionSink = null) {
    if (!objectPattern?.parentPath) return null;
    return destructurePropLeafMeta({
      prop: propNode,
      objectPattern,
      scope: objectPattern.parentPath.scope || objectPattern.scope,
      path: objectPattern,
      adapter,
      resolvePure,
      resolveStaticKey,
      parameterCallSites,
      unionSink: containerUnionSink,
    }).meta;
  }

  function identifierVisitor(path) {
    // orphaned node (parent removed by sibling transform / pruning): downstream isReferenced
    // and parent-shape checks would crash on null. parity with babel-plugin's handleIdentifier
    if (!path.parent) return;
    const { parent, key: parentKey } = path;
    if (!isReferenced({ path, skipUpdateTargets })) return;
    // re-export: export { Promise } from 'foo' - local is not a reference when source is present
    if (parent?.type === 'ExportSpecifier' && parentKey === 'local'
      && path.parentPath?.parentPath?.node?.source) return;
    core.emitGlobalUsage(path);
  }

  function memberExpressionVisitor(path) {
    if (core.memberAlreadyHandled(path)) return;
    if (!isReferenced({ path, skipUpdateTargets })) {
      // a guarded SHIM write stays fully native (its statement is ignored as polyfill
      // intent); a deliberate override's receiver follows the SAME identifier routing the
      // reads use, so the patch and the reads land on one object - no marking there
      // its receiver follows the SAME identifier routing the (always-mutated-by-definition)
      // reads use, so the patch and the reads land on one object - no marking
      return;
    }
    core.emitMemberUsage(path);
  }

  // destructure bindings route polyfillable receivers through synth-swap (`buildDestructuringMeta`)
  function propertyVisitor(path) {
    if (path.node.method || path.parent?.type !== 'ObjectPattern') return;
    // the container walk collects the slot's OTHER reaching values (written / repositioned)
    // beside its primary answer - they join the usage-global union axis in the shared funnel
    const containerUnion = [];
    const meta = buildDestructuringMeta(path.node, path.parentPath, containerUnion);
    // capture the key slots BEFORE dispatch, mirroring babel: a pure emit may restructure the
    // property, so the shared funnel's union pass must not re-read the possibly-detached node
    const { key: keyNode, computed } = path.node;
    core.emitDestructurePropUsage({ meta, path, keyNode, computed, containerWalkObjects: containerUnion });
  }

  // JSX tag-name (`<Map />`) or N-deep member-root (`<Map.Provider.X />`).
  // `adapter.hasBinding` gets the path so `hasRuntimeBinding`'s var-hoisting fallback
  // detects a `var Tag` declaration inside a nested non-function block (estree-toolkit
  // registers var in the block's own scope rather than hoisting to enclosing function)
  function jsxIdentifierVisitor(path) {
    // which JSXIdentifier claims a runtime value - a bare tag not spelled as an intrinsic element,
    // the root of a member tag, and only under the OPENING element - is the tag-root canon's answer
    if (!jsxTagRootReferencesBinding(path)) return;
    if (adapter.hasBinding({ scope: path.scope, name: path.node.name, path })) return;
    onUsage({ kind: 'global', name: path.node.name }, path);
  }

  // a selection the build decides: the hook, where given, skips and folds it; without one the dead
  // branch is only skipped
  function deadBranchVisitor(path) {
    const dead = core.deadBranchOf(path);
    if (!dead) return;
    if (onDeadBranch) onDeadBranch(path, dead);
    else if (dead.skip) path.get(dead.skip).skip();
  }

  // explicit type arguments at a call / new site (`bar<Map<...>>()`, `new Foo<Map<...>>()`)
  // are a type-only instantiation hanging off the call node, not a runtime ref the call's own
  // visitor reads. there's no FunctionExpression body to drive the param / return walk, so sweep
  // them directly (babel reaches them via ReferencedIdentifier). most calls carry none, hence the
  // guard. `getTypeArgs` reads babel `typeParameters` / oxc `typeArguments` uniformly
  function checkCallTypeArguments(path) {
    const typeArgs = getTypeArgs(path.node);
    if (typeArgs) walkTypeAnnotationGlobals(typeArgs, core.annotationGlobal(path), core.annotationCtx(path));
  }

  return liveVisitors({
    ...walkAnnotations ? {
      FunctionDeclaration: core.checkTypeAnnotation,
      FunctionExpression: core.checkTypeAnnotation,
      ArrowFunctionExpression: core.checkTypeAnnotation,
      // bodyless function-signature types carry their global refs in params / return / type
      // params but have no FunctionExpression body to drive the param/return walk above, so
      // sweep them directly (babel reaches these via ReferencedIdentifier). covers interface
      // method / call / construct signatures, standalone function / constructor types (incl.
      // inside type aliases), and ambient overload declare-functions. abstract / declare-class /
      // overload METHODS surface in oxc as a TSEmptyBodyFunctionExpression `.value` (the params
      // live there, not on the method node), so sweep that node rather than babel's TSDeclareMethod
      TSMethodSignature: core.checkTypeAnnotation,
      TSCallSignatureDeclaration: core.checkTypeAnnotation,
      TSConstructSignatureDeclaration: core.checkTypeAnnotation,
      TSFunctionType: core.checkTypeAnnotation,
      TSConstructorType: core.checkTypeAnnotation,
      TSDeclareFunction: core.checkTypeAnnotation,
      TSEmptyBodyFunctionExpression: core.checkTypeAnnotation,
      ...core.annotationDeclVisitors,
      // call / new / tagged-template type arguments (covers the optional-call form too). babel reaches
      // a `tag<Set<number>>` instantiation via ReferencedIdentifier; oxc hangs it off the tag node, so
      // sweep it here too or the type-only globals drop in unplugin only
      CallExpression: checkCallTypeArguments,
      NewExpression: checkCallTypeArguments,
      OptionalCallExpression: checkCallTypeArguments,
      TaggedTemplateExpression: checkCallTypeArguments,
      // a class node and its field shapes carry type-only globals the FunctionExpression walk
      // (method param / return types) never reaches: the class's own `typeParameters` constraints /
      // defaults and `extends Base<...>` super-type-args, plus a field's `x: Map<T>` annotation.
      // `checkTypeAnnotations` already reads `typeParameters.params` + super-type-args, so one routine
      // covers both the class node and its members. abstract field variants are the same - their
      // type-only declarations are still signal
      ClassDeclaration: core.checkTypeAnnotation,
      ClassExpression: core.checkTypeAnnotation,
      PropertyDefinition: core.checkTypeAnnotation,
      AccessorProperty: core.checkTypeAnnotation,
      TSAbstractPropertyDefinition: core.checkTypeAnnotation,
      TSAbstractAccessorProperty: core.checkTypeAnnotation,
    } : null,
    Identifier: identifierVisitor,
    // `<Map />` tag-name is a runtime reference to a global constructor. skip attribute
    // names and closing-tag dupes. also accept root of `<Map.Provider.X/>` (N-deep
    // JSXMemberExpression chain) - walk the `.object` chain from path so deeper-than-2
    // namespace tags still polyfill the outer global
    JSXIdentifier: jsxIdentifierVisitor,
    MemberExpression: memberExpressionVisitor,
    BinaryExpression: core.emitBinaryInUsage,
    // the part of a selection the build never evaluates is no usage: the host skips and folds it
    LogicalExpression: deadBranchVisitor,
    ConditionalExpression: deadBranchVisitor,
    IfStatement: deadBranchVisitor,
    AssignmentPattern: deadBranchVisitor,
    Property: propertyVisitor,
  });
}

// --- Syntax visitors ---

// the shared path handlers mapped onto estree's enumerated node types (methods hold a nested
// FunctionExpression here, so the three named function types cover what babel's alias does)
export function createSyntaxVisitors({ injectModulesForModeEntry, injectModulesForEntry, isDisabled, isWebpack = false }) {
  const handlers = createSyntaxPathHandlers({ injectModulesForModeEntry, injectModulesForEntry, isDisabled, isWebpack });
  return {
    ImportExpression: handlers.onImportExpression,
    FunctionDeclaration: handlers.onFunction,
    FunctionExpression: handlers.onFunction,
    ArrowFunctionExpression: handlers.onFunction,
    AwaitExpression: handlers.onAwaitExpression,
    ForOfStatement: handlers.onForOfStatement,
    ArrayPattern: handlers.onArrayPattern,
    ObjectPattern: handlers.onObjectPattern,
    SpreadElement: handlers.onSpreadElement,
    JSXSpreadAttribute: handlers.onJsxSpreadAttribute,
    JSXSpreadChild: handlers.onJsxSpreadChild,
    YieldExpression: handlers.onYieldExpression,
    // estree hands a regexp literal as a `Literal` carrying a `regex` bag
    Literal: handlers.onRegExpLiteral,
    VariableDeclaration: handlers.onVariableDeclaration,
    // every class-member spelling this dialect has: the rule reads the KEY, so the list only has
    // to REACH each of them
    PropertyDefinition: handlers.onClassMember,
    MethodDefinition: handlers.onClassMember,
    AccessorProperty: handlers.onClassMember,
    ClassDeclaration: handlers.onClass,
    ClassExpression: handlers.onClass,
  };
}
