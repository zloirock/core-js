// the parser-agnostic halves of the emitters' usage visitors. each plugin keeps its own
// referenced-position gating, JSX / TS dialect filters and destructure host classification -
// everything its parser spells differently - and funnels every usage it accepts through the
// handlers here, so the emission decisions stay single-sourced. spans several sibling modules'
// domains (members, destructure, globals, annotations) on purpose: homing it in any one of them
// would add a cross-import between siblings, and the emitters are its only consumers
import {
  annotationNameIsGlobal,
  checkTypeAnnotations,
  isTypeAnnotationNodeType,
  typeOnlyImportShadows,
  walkTypeAnnotationGlobals,
} from './annotations.js';
import { collectDestructureUnionCandidates, prepareDestructureUnion } from './destructure.js';
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
  // the type layer's own key-name resolver, so a computed member key (`E.A` off a TS enum) is
  // named by the one resolver that already folds it instead of a second copy living here
  resolveStaticKey = null,
  suppressProxyGlobals = false,
  keptProxyHops = null,
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
    // a TYPE reference reaches this lane rather than the annotation walk - both parsers report it
    // as a referenced identifier - so the type-space shadow question belongs here, where every
    // binding's identifier visitor already funnels. `hasBinding` below answers the VALUE question
    // and deliberately ignores a type-only import, which in a type position IS the shadow
    if (isTypeAnnotationNodeType(path.parent?.type)
      && typeOnlyImportShadows({ adapter, scope: path.scope, name: node.name, path, hostType: path.parent.type })) return;
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
  // gates: a hop marked handled emits no meta - the marking keeps a rewrite from landing
  // inside the outer span, while a hop recorded as still-live gets
  // its render driven through `onSuppressedProxyHop`
  function memberAlreadyHandled(path) {
    if (!handledObjects.has(path.node)) return false;
    if (keptProxyHops?.has(path.node)) onSuppressedProxyHop?.(path);
    return true;
  }

  function emitMemberUsage(path) {
    const meta = handleMemberExpressionNode({
      node: path.node, scope: path.scope, adapter, handledObjects, suppressProxyGlobals, path, resolveMeta, isEntryAvailable,
      resolvePure, keptProxyHops, resolveStaticKey,
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
      resolveStaticKey,
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
    const tagged = meta ? tagSymbolSourcedMeta({ meta, keyNode, computed, scope, adapter, path }) : null;
    // usage-global reachable receiver / key union, in the member twin's order: its verdict phase
    // runs BEFORE the primary dispatch (it is what stamps `receiverInstanceFree`, and the primary
    // has to see it - otherwise the resolver's placement-agnostic instance fallback fabricates rows
    // the receiver provably never dispatches), its ENUMERATION after, where it always ran
    const union = prepareDestructureUnion({
      meta: tagged,
      keyNode,
      computed,
      scope,
      adapter,
      path,
      resolvePure,
      containerWalkObjects,
    });
    // extras ATTACH to the meta, the way `attachMemberUnionExtras` does for the member twin: the
    // callback's fallback-branch backstop skips a meta the choke already served, and reading the
    // extras off the meta is what tells it this producer did route through one
    const extras = collectDestructureUnionCandidates(union);
    if (tagged && extras.length) tagged.extraCandidates = extras;
    if (tagged) onUsage(tagged, path);
    for (const extra of extras) onUsage(extra, path);
  }

  // a name in `T` of `let x: T` is a polyfill candidate only if no local binding shadows it
  // (`class Map {}; let x: Map = ...` must NOT pull in es.map.constructor). route through
  // the adapter's `hasBinding` so the same filters apply as for the identifier tail: ambient
  // declarations (`declare const Map`) DON'T shadow (binding is tsc-elided); TS-runtime
  // declarations (`enum Map`, `namespace Map`) DO shadow (resolved via path ancestor walk)
  function annotationGlobal(path) {
    return (name, hostType) => {
      if (annotationNameIsGlobal({ ...annotationCtx(path), name, hostType })) onUsage({ kind: 'global', name }, path);
    };
  }

  // what the walk resolves a qualified chain's ROOT against, and what the sink filters each name by
  function annotationCtx(path) {
    return { scope: path.scope, adapter, path };
  }

  function checkTypeAnnotation(path) {
    checkTypeAnnotations(path.node, annotationGlobal(path), annotationCtx(path));
  }

  // the annotation hosts both parsers spell identically; the dialect-specific host lists
  // (babel's split method / field node types, oxc's TS signature shapes) stay on the plugins
  const annotationDeclVisitors = {
    VariableDeclarator(path) {
      if (path.node.id?.typeAnnotation) {
        walkTypeAnnotationGlobals(path.node.id.typeAnnotation, annotationGlobal(path), annotationCtx(path));
      }
    },
    CatchClause(path) {
      if (path.node.param?.typeAnnotation) {
        walkTypeAnnotationGlobals(path.node.param.typeAnnotation, annotationGlobal(path), annotationCtx(path));
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
    annotationCtx,
    checkTypeAnnotation,
    annotationDeclVisitors,
    isHandled: node => handledObjects.has(node),
    // the marking's premise is that the claim's render OWNS the receiver's hops. an emitter that
    // re-emits the receiver by node identity keeps that premise from holding, and only it knows -
    // so it releases the marks and the hops claim for themselves on the re-visit
    releaseHandled: node => handledObjects.delete(node),
    reset,
  };
}
