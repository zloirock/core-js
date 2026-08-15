// the parser-agnostic halves of the emitters' usage visitors. each plugin keeps its own
// referenced-position gating, JSX / TS dialect filters and destructure host classification -
// everything its parser spells differently - and funnels every usage it accepts through the
// handlers here, so the emission decisions stay single-sourced. spans several sibling modules'
// domains (members, destructure, globals, annotations) on purpose: homing it in any one of them
// would add a cross-import between siblings, and the emitters are its only consumers
import { checkTypeAnnotations, typeOnlyImportShadows, walkTypeAnnotationGlobals } from './annotations.js';
import { collectDestructureUnionCandidates } from './destructure.js';
import { isKnownGlobalName } from './globals.js';
import { handleBinaryIn, handleMemberExpressionNode, tagSymbolSourcedMeta } from './members.js';
import { createSelfRefVarGuard } from './resolve.js';

export function createUsageHandlerCore({
  adapter,
  onUsage,
  method,
  isEntryAvailable,
  resolveMeta,
  resolvePure = null,
  suppressProxyGlobals = false,
  keptProxyHops = null,
  keptDeclinedProxyMetaHops = false,
  onSuppressedProxyHop = null,
  suppressKeptNavRoot = null,
  selfRefBindingKind,
}) {
  // only usage-pure rewrites global identifiers to named import bindings (which are frozen).
  // usage-global injects side-effect imports and leaves the identifier alone, so `Map++`
  // must polyfill - otherwise `Map` ReferenceError's in engines where the native is missing
  const skipUpdateTargets = method === 'usage-pure';
  let handledObjects = new WeakSet();
  let isSelfRefVarBinding = createSelfRefVarGuard(selfRefBindingKind, adapter);

  // the identifier tail every host runs after its own referenced-position gates
  function emitGlobalUsage(path) {
    const { node } = path;
    // the ROOT of a nav stored by a USER assignment renders the stored canon from the root's
    // visit - the one place a member-channel skip or a declined claim cannot hide (a claim
    // that declines leaves no render owning the value's hops). ungated by name: an ALIAS root
    // (`const galias = globalThis; (ntm = (se, galias).window.self)`) stores the same canon,
    // and the hook self-gates cheaply (a parent climb, then the plan's own proxy-root proof)
    if (suppressKeptNavRoot?.(path)) return;
    if (adapter.hasBinding(path.scope, node.name, path)) {
      // self-reference `var X = X` - hoisted var init references its own name, which at
      // runtime reads from the outer (global) scope before the local is assigned. narrow
      // path intentionally: ImportSpecifiers, class-decls, and const-to-identifier aliases
      // are excluded so user-owned pure imports (e.g. `const MyPromiseTry = ...`) don't get
      // re-routed through generic-global polyfill
      if (!isSelfRefVarBinding(path.scope?.getBinding?.(node.name), path)) return;
      // name equals the binding's own name (we looked up the binding by `node.name`), so
      // `isKnownGlobalName` is sufficient - `resolveBindingToGlobal` would walk a
      // now-mutated `init` and give an unreliable answer
      if (!isKnownGlobalName(node.name)) return;
      if (handledObjects.has(node)) return;
      onUsage({ kind: 'global', name: node.name }, path);
      return;
    }
    // see `handleBinaryIn` - only resolved polyfillable keys seed `handledObjects`
    if (handledObjects.has(node)) return;
    onUsage({ kind: 'global', name: node.name }, path);
  }

  // the handled/suppressed head both member visitors run BEFORE their host-specific write
  // gates: a hop marked handled emits no meta - the marking keeps the text emitter from
  // queueing a rewrite overlapping the outer span, while a hop recorded as still-live gets
  // its render driven through `onSuppressedProxyHop`
  function memberAlreadyHandled(path) {
    if (!handledObjects.has(path.node)) return false;
    if (keptProxyHops?.has(path.node)) onSuppressedProxyHop?.(path);
    return true;
  }

  function emitMemberUsage(path) {
    const meta = handleMemberExpressionNode({
      node: path.node, scope: path.scope, adapter, handledObjects, suppressProxyGlobals, path, resolveMeta, isEntryAvailable,
      resolvePure, keptProxyHops, keptDeclinedProxyMetaHops,
    });
    if (meta) {
      onUsage(meta, path);
      // usage-global union: extra reachable receiver / key targets each earn a side-effect import
      for (const extra of meta.extraCandidates ?? []) onUsage(extra, path);
    }
  }

  function emitBinaryInUsage(path) {
    const meta = handleBinaryIn({
      node: path.node, scope: path.scope, adapter, handledObjects, isEntryAvailable, suppressProxyGlobals, path,
    });
    if (!meta) return;
    onUsage(meta, path);
    // usage-global reachable union targets of a reassigned `in` key / receiver alias
    for (const extra of meta.extraCandidates ?? []) onUsage(extra, path);
  }

  // destructure-prop emit funnel: every prop meta gets its computed `Symbol.X` key provenance
  // checked once here, so a string spelling of the key stays untagged and the symbol-routed
  // emit paths leave it as a plain property read. hosts capture `keyNode` / `computed` BEFORE
  // their dispatch - a usage-pure emit may restructure the property, detaching the node.
  // `meta` may be null (an unresolvable - e.g. BRANCHING - computed key, or a mutated-static
  // receiver): the primary dispatch skips, but the union still runs - the provider synthesizes
  // its branch-key carrier there, so every producer bail keeps its reachable arm keys
  function emitDestructurePropUsage({ meta, path, keyNode, computed, containerWalkObjects = null }) {
    const { scope } = path;
    if (meta) onUsage(tagSymbolSourcedMeta({ meta, keyNode, computed, scope, adapter, path }), path);
    // usage-global reachable receiver / key union: each extra destructure target earns a
    // side-effect import beside the primary, mirroring the member funnel
    for (const extra of collectDestructureUnionCandidates({
      meta, keyNode, computed, scope, adapter, path, resolvePure, containerWalkObjects,
    })) onUsage(extra, path);
  }

  // a name in `T` of `let x: T` is a polyfill candidate only if no local binding shadows it
  // (`class Map {}; let x: Map = ...` must NOT pull in es.map.constructor). route through
  // the adapter's `hasBinding` so the same filters apply as for the identifier tail: ambient
  // declarations (`declare const Map`) DON'T shadow (binding is tsc-elided); TS-runtime
  // declarations (`enum Map`, `namespace Map`) DO shadow (resolved via path ancestor walk)
  function annotationGlobal(path) {
    return (name, hostType) => {
      if (adapter.hasBinding(path.scope, name, path)) return;
      // a TYPE position asks a different question than a value one, and `hasBinding` answers the
      // value one: it deliberately drops a type-only import because tsc elides it, so a VALUE of
      // that name really is the global. the same import is precisely what shadows the global as a
      // TYPE - `import type { Set } from 'immutable'` makes `x: Set<number>` name immutable's Set,
      // and pulling es.set.* in for it polyfills a global the annotation never named
      if (typeOnlyImportShadows({ adapter, scope: path.scope, name, path, hostType })) return;
      onUsage({ kind: 'global', name }, path);
    };
  }

  function checkTypeAnnotation(path) {
    checkTypeAnnotations(path.node, annotationGlobal(path));
  }

  // the annotation hosts both parsers spell identically; the dialect-specific host lists
  // (babel's split method / field node types, oxc's TS signature shapes) stay on the plugins
  const annotationDeclVisitors = {
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
  };

  // per-file state drop for the host that reuses one visitor object across files (babel)
  function reset() {
    handledObjects = new WeakSet();
    isSelfRefVarBinding = createSelfRefVarGuard(selfRefBindingKind, adapter);
  }

  return {
    skipUpdateTargets,
    emitGlobalUsage,
    memberAlreadyHandled,
    emitMemberUsage,
    emitBinaryInUsage,
    emitDestructurePropUsage,
    annotationGlobal,
    checkTypeAnnotation,
    annotationDeclVisitors,
    isHandled: node => handledObjects.has(node),
    reset,
  };
}
