import {
  buildDestructuringInitMeta,
  chooseFallbackReceiverNode,
  collectDestructureUnionCandidates,
  isInnerDestructureDefault,
  resolveArrayWrapperedDestructureReceiver as sharedResolveArrayWrapperedDestructureReceiver,
  resolveNestedDestructureReceiver as sharedResolveNestedDestructureReceiver,
} from '@core-js/polyfill-provider/detect-usage/destructure';
import {
  isKnownGlobalName,
} from '@core-js/polyfill-provider/detect-usage/globals';
import { checkTypeAnnotations, walkTypeAnnotationGlobals } from '@core-js/polyfill-provider/detect-usage/annotations';
import {
  createSelfRefVarGuard,
  resolveKey as sharedResolveKey,
  unwrapTransparentSeq,
} from '@core-js/polyfill-provider/detect-usage/resolve';
import { handleBinaryIn, handleMemberExpressionNode, tagSymbolSourcedMeta } from '@core-js/polyfill-provider/detect-usage/members';
import {
  createMutationSiteHandler,
  hasMutationCandidateShapes,
} from '@core-js/polyfill-provider/detect-usage/mutations';
import { createSyntaxRules } from '@core-js/polyfill-provider/detect-syntax';
import {
  collectFunctionScopeVarReassignments,
  collectScopeLetReassignments,
  findFunctionScopeVarInPath,
  findIifeCallSite,
  resolveFallbackReceiver,
  findTSRuntimeBindingInPath,
  isAmbientBindingShape,
  bareAssignmentPatternLeafPath,
  isAssignOrForXWriteTargetPath,
  isFunctionParamDestructureParent,
  isInUpdateOperand,
  isMemberWriteOnlyContext,
  isNonReferencePosition,
  isTSTypeOnlyIdentifierPath,
  buildOwnerWritePathIndex,
  buildScopeReassignmentIndex,
  findVarOwnerDeclaring,
  isMutatedStaticPair,
  resolveCallArgument,
  unwrapSafeSequenceTail,
  walkPatternIdentifiers,
  withoutValuelessDeclarationViolations,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import {
  aliasSpanDominatesUse, assignmentAliasWriteTrusted, isPolyfillAliasBinding, isSymbolDestructureAliasBinding, soleAliasWrite,
} from '@core-js/polyfill-provider/helpers/class-walk';

const IMPORT_SPECIFIER_TYPES = new Set([
  'ImportDefaultSpecifier',
  'ImportSpecifier',
  'ImportNamespaceSpecifier',
]);

// shared `unwrapTransparentSeq` peels paren / TS expression wrappers / safe SequenceExpression so
// `require('core-js/...' as any)` / `require((0, 'core-js/...'))` / `require(('core-js/...'))`
// all reach the underlying StringLiteral. parity with unplugin's adapter which routes the
// arg through the same helper before the type check
function isStringLiteral(node) {
  return unwrapTransparentSeq(node)?.type === 'StringLiteral';
}

function stringLiteralValue(node) {
  const inner = unwrapTransparentSeq(node);
  return inner?.type === 'StringLiteral' ? inner.value : null;
}

// factory for a Babel scope adapter bound to a specific plugin-instance injector.
// the closure over `getInjector` avoids module-level mutable state, which would race
// under parallel transforms (Vite/Rollup/thread-loader)
// scoped mutation pre-pass: the cheap shape gate runs first; only files that actually
// monkey-patch pay for the path traverse + canonical receiver resolution. shares every
// resolution step with the read side via `mutations` (provider)
export function collectMutationPrePass(programPath, adapter, census = null) {
  const mutated = new Set();
  if (!(census ? census.hasMutationShapes : hasMutationCandidateShapes(programPath.node, adapter.packages))) return { mutated };
  const { handleSite, finalizeMutationSet } = createMutationSiteHandler({ adapter, mutated });
  programPath.traverse({
    // member visits classify destructure-LHS / for-x contexts; the HOST visits classify
    // delete / update / assignment with a downward wrapper peel (stacked parens / TS casts)
    MemberExpression: handleSite,
    OptionalMemberExpression: handleSite,
    CallExpression: handleSite,
    // `Object?.assign(Array, {...})` is an OptionalCallExpression - without this visitor the
    // optional-call mutation escapes detection and usage-pure substitutes over the user patch
    OptionalCallExpression: handleSite,
    AssignmentExpression: handleSite,
    UpdateExpression: handleSite,
    UnaryExpression: handleSite,
    // a bare-identifier for-x LHS assigns a global slot per iteration - no member/assignment
    // node exists for it, so the statement itself is the classification site
    ForOfStatement: handleSite,
    ForInStatement: handleSite,
    // @babel/types omits `decorators` from TSParameterProperty's visitor keys, so this scoped
    // traverse never descends into a constructor parameter-property's legacy decorator and a
    // monkey-patch hidden there escapes detection - usage-pure would then substitute over the
    // user patch. requeue each decorator so the mutation-site visitors fire on it, mirroring
    // the read-side requeue in createUsageVisitors
    TSParameterProperty(path) {
      if (!path.node.decorators?.length) return;
      for (const decoratorPath of path.get('decorators')) path.requeue(decoratorPath);
    },
  });
  finalizeMutationSet();
  return { mutated };
}

export function createBabelAdapter({
  getInjector = () => null, method = null, getMutatedStatics = () => null, getPackages = () => null,
  isTypingMutatedSlot = null,
} = {}) {
  // the injector's declarator registry serves plugin-minted memo refs whose scope model
  // misrepresents the binding: scope-invisible on the memo-dense append path, or param-landed
  // by babel's `scope.push` on a callable scope (binding node = bare Identifier until the
  // post-pass normalizer materializes the `var`). identity on the minted id node keeps
  // same-named user bindings out
  function scopedMemoDeclarator(scope, name) {
    const memoDecl = getInjector?.()?.getMemoDeclarator?.(name);
    if (!memoDecl) return null;
    const bindingId = scope.getBindingIdentifier(name);
    return !bindingId || bindingId === memoDecl.id ? memoDecl : null;
  }
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
      return method === 'usage-pure' && isMutatedStaticPair(object, key, getMutatedStatics());
    },
    // the TYPE layer asks a DIFFERENT question than the injection policy above: a patched static no
    // longer returns what its declaration says, so its result type is unknown in EVERY method - a
    // global-flavor narrow taken off the declaration silently drops the polyfill the replacement
    // actually needs. the pure-only gate belongs to the injection skip, not to typing
    isMutatedStaticSlot(object, key) {
      return isTypingMutatedSlot ? isTypingMutatedSlot(object, key)
        : isMutatedStaticPair(object, key, getMutatedStatics());
    },
    // user-resolved package prefixes (`pkg` + `additionalPackages`) for symbol-import /
    // proxy-import detection. plugin-supplied, NOT injector-published: the plugin knows the
    // resolved array before ANY injector exists, and the mutation pre-pass runs in exactly
    // that window (injector-only sourcing left the pre-pass packages-blind there)
    get packages() { return getPackages(); },
    hasBinding(scope, name, path = null) {
      // a plugin-minted memo ref appended on the memo-dense fast path is scope-invisible
      // until the programExit re-crawl - the injector's declarator registry is authoritative
      if (getInjector?.()?.getMemoDeclarator?.(name)) return true;
      // user-declared runtime bindings (var/let/const/function/class/import/TSImportEquals).
      // `getBindingIdentifier` is narrow - `scope.hasBinding` would also fire for free-variable
      // globals just by being seen (`const x = Map` makes `Map` "bound" globally), too coarse.
      // type-only TSImportEquals is elided by tsc - references resolve to the global, so it
      // doesn't shadow for polyfill purposes; fall through to runtime / injector checks
      if (scope.getBindingIdentifier(name)) {
        const b = scope.getBinding?.(name);
        // shared `isAmbientBindingShape` covers all tsc-elided binding forms (declare,
        // type-only imports in 3 ESM variants, type-only TSImportEquals). without filtering
        // these, the binding would shadow the polyfill even though it doesn't exist at runtime
        if (!b || !isAmbientBindingShape(b.path.node, b.path.parent)) return true;
      }
      // TS-runtime declarations babel scope doesn't expose via getBindingIdentifier:
      // regular `enum`/`namespace`, `const enum`. walk path's ancestor chain (Program,
      // BlockStatement, TSModuleBlock, StaticBlock) so nested `function f() { enum Map }`
      // and `namespace Outer { namespace Map }` correctly shadow. anchor preference: explicit
      // `path` (reaches inner anchors) > scope's path (anchors at scope owner only). helper
      // excludes `declare X` (ambient - runtime supplied externally; polyfill should fire)
      const anchor = path ?? scope.path ?? null;
      if (anchor && findTSRuntimeBindingInPath(anchor, name)) return true;
      // sloppy Annex-B block-level function (`{ function Array() {} }` in a script) hoists a
      // var-binding to the enclosing function / script scope which babel's tracker keeps
      // block-scoped - an OUTSIDE use would read the polyfill while the runtime reads the
      // user function (wrong value in pure). the walk also recovers nested-block `var`
      // declarations. mirrors the unplugin adapter and the resolver-side binding adapter
      if (anchor && findFunctionScopeVarInPath(anchor, name)) return true;
      // plugin-managed pure-import alias / user destructure aliases: presence only - trust and
      // disambiguation happen at the `getBinding` lookup; scope-bound so a same-named local
      // alias in ANOTHER function doesn't shadow a direct global use here
      return !!getInjector()?.hasAliasName?.(name, path?.node?.start ?? null);
    },
    getBinding(scope, name, path = null) {
      // a plugin-minted memo ref the scope misrepresents (append-path scope-invisible /
      // param-landed) - serve a synthetic binding view off the injector's declarator
      // registry (init-less var declarator, no violations). a call-root memo carries a
      // registered proxy-global alias hint (the natural static collapse recognizes the ref
      // through it) - surface it exactly like the binding-less name view below; an
      // assign-root memo has no registration and resolves through the trusted-write follow
      const memoDecl = scopedMemoDeclarator(scope, name);
      if (memoDecl) {
        const memoUseStart = path?.node?.start ?? null;
        const memoInfo = getInjector()?.getBindingInfo(name, memoUseStart) ?? null;
        const memoTrusted = memoInfo
          && (memoInfo.source !== null || memoInfo.aliasTrusted || !!memoInfo.aliasWrite || !!memoInfo.aliasVerified);
        const memoHint = memoTrusted && aliasSpanDominatesUse({ info: memoInfo, useStart: memoUseStart })
          ? memoInfo.hint : null;
        return {
          node: memoDecl, kind: 'var', constantViolations: [], importSource: null, scope,
          polyfillHint: memoHint, aliasSymbolSource: null, aliasWrite: memoInfo?.aliasWrite ?? null,
          guardedAliasHint: !memoHint ? memoInfo?.hint ?? null : null,
        };
      }
      // use anchor for the trusted-span dominance gate: a use textually BEFORE its alias write /
      // declaration must not narrow statically (it runs pre-assignment); callers without a path
      // keep the registration-only behavior
      const useStart = path?.node?.start ?? null;
      // `polyfillHint` lets `resolveBindingToGlobal` walk back to the source global through:
      // (a) injector's pure-import table - `_Symbol` / `_globalThis` after in-place AST
      // rewrite; (b) globalAlias table - user destructure aliases (`{Symbol: S} = globalThis`
      // -> `S`) whose mutated binding shape `resolveBindingToGlobal` can't walk on its own.
      // hint-only fallback handles babel scope-tracker lag after `replaceWith` during
      // traversal (scope.getBinding empty even though the AST has the declaration).
      // shadow guard: only attach the injector's `polyfillHint` when the scope binding is
      // itself the polyfill import (or a destructure-alias from `registerGlobalAlias`).
      // a user-side declaration with a matching name (`function MyPromise() {}` shadowing
      // an `import MyPromise from "@core-js/pure/.../promise"` in an outer scope) would
      // otherwise pick up `polyfillHint='Promise'` cross-shadow, and downstream
      // `resolveBindingToGlobal` would dispatch `super.try` on `class extends MyPromise`
      // as the Promise polyfill - silently miswiring user code
      // scope-lag recovery: babel drops a binding from its registry after the destructure-
      // assignment alias rewrite while the declaration survives in the AST; rebuild it so the
      // per-binding registry (identity route) stays reachable. adopted ONLY on an identity hit:
      // a plugin-minted memo (`_ref`) has no per-binding entry and must keep the hint-only
      // BLIND fallback below - a rebuilt binding would strand it on the shape/dominance gates
      let b = scope.getBinding(name);
      if (!b && path) {
        const rebuilt = rebuildLaggedScopeBinding(path, name);
        if (rebuilt && getInjector()?.getBindingAliasInfo?.(rebuilt.path.node, name)) b = rebuilt;
      }
      // binding-first: the per-binding registry is exact (same-name aliases in sibling scopes
      // never collide); the NAME view serves the scope-lag fallback below and the
      // replaced-declarator re-anchor, disambiguated positionally by the use anchor
      const identityInfo = b ? getInjector()?.getBindingAliasInfo?.(b.path.node, name) ?? null : null;
      const info = identityInfo ?? getInjector()?.getBindingInfo(name, useStart) ?? null;
      if (b) {
        const isImportBinding = IMPORT_SPECIFIER_TYPES.has(b.path.node?.type);
        const importSource = isImportBinding ? b.path.parent?.source?.value ?? null : null;
        // `info.source !== null` means a registered pure import - only attach the hint when the
        // actual scope binding IS that import. `info.source === null` is a destructure-alias from
        // `registerGlobalAlias`; the shared predicate identifies the real alias binding (init resolves
        // to the destructured global, any declaration kind) and rejects user-declared shadows
        // babel's scope model places the whole SwitchStatement - discriminant included - inside
        // the case-block scope, so a discriminant write of a name that a case-level lexical
        // shadows is attributed to the INNER binding and the outer binding's set misses it (per
        // spec the discriminant evaluates in the OUTER env). recompute through the canonical AST
        // scan per binding kind - the same recovery the unplugin adapter applies to estree scope
        const constantViolations = withoutValuelessDeclarationViolations(
          path && b.kind === 'var' ? collectFunctionScopeVarReassignments(path, name)
            : path && (b.kind === 'let' || b.kind === 'const') ? collectScopeLetReassignments(b.path, name)
              : b.constantViolations);
        // a VERIFIED identity hit needs no live shape verification: the registration judged the
        // binding's COMPLETE original write set at pre-pass time, and any violation appearing
        // since is our own mutation (the value swap), not user flow. decl-form entries stay
        // live-checked (their gate judged placement only - a redeclaration write must be caught)
        const isAliasBindingShape = !!identityInfo?.aliasVerified || isPolyfillAliasBinding({
          info, binding: { path: b.path, constantViolations }, scope, adapter, injector: getInjector(), boundName: name,
        });
        // a GUARDED registration means flow-trust was REFUSED - the hint must never drive a
        // direct narrow (babel's mutated `var M = _Map` declarator is indistinguishable from a
        // clean alias here); the member read stays native. the dominance gate keeps a use
        // textually BEFORE its trusted write / declaration native too
        // a plugin-MINTED memo (`_ref = (() => globalThis)()` from an optional-chain deopt) carries a
        // `var _ref` scope binding that is NOT an alias-init shape, so the shape checks above miss it -
        // but it is allocator-owned (no user rebind) and its hint was set from a resolved proxy-global
        // root, so trust it directly. the dominance gate still bounds a use textually before the write
        const polyfillHint = info && !info.aliasGuarded && (isAliasBindingShape || isImportBinding || info.minted)
          && aliasSpanDominatesUse({ info, useStart }) ? info.hint : null;
        // a destructured Symbol.X alias (`const { iterator } = Symbol`) is a PATTERN binding, so it
        // carries no `importSource` and its hint is the UID (`iterator`); surface the registered module
        // source so `bindingSymbolKey` can fold `obj[iterator]`. the shadow gate rejects a nested
        // same-name binding whose RHS is not Symbol (the name-keyed injector info is flat)
        const aliasSymbolSource = isSymbolDestructureAliasBinding({
          info, binding: b, scope, adapter, injector: getInjector(), boundName: name, keyCtx: { resolveKey: sharedResolveKey, path },
        }) ? info.source : null;
        return {
          node: b.path.node, kind: b.kind, constantViolations, importSource,
          // the scope the DECLARATOR is written in - the const-alias walkers advance to it per hop
          // so a later hop reading an outer-declared name resolves it there, not against the
          // receiver-use scope where an inner shadow of that name would swallow the value.
          // deliberately NOT `b.scope`: babel hoists a `var` and reports the FUNCTION scope there,
          // which reads past a shadow local to the block the declarator sits in
          scope: b.path.scope,
          polyfillHint, aliasSymbolSource, aliasWrite: polyfillHint ? info?.aliasWrite ?? null : null,
          // the hint of a registration whose static narrow did NOT apply at this use - a REFUSED
          // (guarded) registration or a use textually before its trusted write (dominance).
          // IDENTITY view first: a resolved binding with no per-binding entry is provably a
          // USER binding (a shadow), which must not pick up the alias's guard. EXCEPTION: the
          // plugin's own decl-form swap REPLACES the declarator node (identity dies with it,
          // positions cloned) - the replacement still sits INSIDE the registration's declSpan,
          // where no user shadow can live, so declSpan containment recovers the hint. drives
          // the RUNTIME ctor guard; the guard reads the live value, so it self-corrects
          guardedAliasHint: (identityInfo ?? replacedDeclSlotInfo(b.path.node, info)) && !polyfillHint
            ? (identityInfo ?? info).hint : null,
        };
      }
      if (!info) return null;
      // hint-only fallback (no scope binding - babel scope-tracker lag after `replaceWith`): trust the
      // hint only for a real pure import (`_Map`), a TRUSTED alias (a plugin-minted `_ref` memo /
      // a binding-less global write - nothing user-rebindable), or a checked assignment-form write.
      // a plain USER-binding alias here is a binding whose writes we cannot see without a scope
      // binding - it would pick up the hint past a reassignment and narrow the member over the
      // user's own value. usage-pure bails on any reassignment, so the blind user-alias hint bails too
      // a VERIFIED registration (complete original write set examined at pre-pass) may serve
      // the lag fallback too - the declSpan/write dominance gate below still bounds the use.
      // a USER-named source record already arrives span-gated: `getBindingInfo` serves it only
      // inside its hosting scope, so an out-of-scope unbound read never reaches this fallback
      const blindTrusted = info.source !== null || info.aliasTrusted || !!info.aliasWrite || !!info.aliasVerified;
      const blindHint = blindTrusted && aliasSpanDominatesUse({ info, useStart }) ? info.hint : null;
      return {
        node: null, constantViolations: null, importSource: info.source,
        polyfillHint: blindHint,
        aliasWrite: info.aliasWrite ?? null,
        // no scope binding at all - a user shadow would HAVE one, so the positional name view
        // safely serves the runtime-guard hint when the static narrow did not apply
        guardedAliasHint: !blindHint ? info.hint ?? null : null,
      };
    },
    // lazy lookup for the resolver's assignment-form alias branch: the single TRUSTED write
    // (clean, unconditionally placed in the binding's own scope) of an init-less binding, as its
    // AssignmentExpression node - or null. computed on demand (only init-less Identifier-pattern
    // bindings reach the resolver branch), so ordinary getBinding calls pay nothing
    findTrustedAliasWrite(scope, name, { requirePlacement = true } = {}) {
      const b = scope.getBinding(name);
      // the plugin's OWN memo write (`_ref = <expr>`): synthesized on a prior rewrite, never a
      // scope constantViolation - and the ref itself may be scope-invisible on the memo-dense
      // append path or param-landed on a callable scope. the injector registry is the
      // provenance proof of the single write.
      // STRUCTURAL consumers only (a positional caller has no anchor on synthetic nodes)
      if (!requirePlacement && (!b?.constantViolations?.length || scopedMemoDeclarator(scope, name))) {
        const memoAssign = getInjector?.()?.getMemoWrite?.(name);
        if (memoAssign) return memoAssign;
      }
      if (!b || b.path.node?.type !== 'VariableDeclarator' || b.path.node.init) return null;
      const violations = withoutValuelessDeclarationViolations(b.constantViolations);
      const first = violations?.[0];
      let assignPath = first?.isAssignmentExpression?.() ? first : first?.findParent?.(pp => pp.isAssignmentExpression());
      const assignNode = assignPath?.node;
      if (!assignNode) return null;
      // an in-place SE-split (`(0, ({X}=g))` -> `0; ({X}=g);`) hoists the write to statement level
      // yet leaves the constantViolation path pointing into the DETACHED SequenceExpression (a stale
      // ancestor whose node is null), so the placement walk climbs a dead chain and misreads the
      // real placement (spuriously refusing a hoisted-to-statement write, or missing a real
      // conditional above it). re-anchor to the write's FRESH path so the walk judges the live tree,
      // matching the estree side which resolves on the pristine AST
      if (ancestorChainDetached(assignPath)) assignPath = freshPathOfNode(b.scope?.path, assignNode) ?? assignPath;
      // the ASSIGNMENT path itself: the placement walk judges every edge up to the statement,
      // so a conditional expression container between them refuses flow-trust. a STRUCTURAL
      // consumer skips placement - its branch-after-test proof carries execution evidence
      return (requirePlacement
        ? assignmentAliasWriteTrusted({ binding: { ...b, constantViolations: violations }, assignNode, stmtPath: assignPath })
        : soleAliasWrite({ binding: { ...b, constantViolations: violations }, assignNode }))
        ? assignNode : null;
    },
    getBindingNodeType(scope, name) {
      // `?.path` defense - virtual bindings (plugin-injected pure imports before scope.crawl)
      // may have `.path` undefined; without `?.` the inner `.node` access throws TypeError.
      // unplug-side adapter already had this defense; aligning shape across adapters.
      // registry-backed memo refs (append-path scope-invisible / param-landed) report their
      // registered declarator over the scope's misrepresented shape
      if (scopedMemoDeclarator(scope, name)) return 'VariableDeclarator';
      return scope.getBinding(name)?.path?.node?.type ?? null;
    },
    isStringLiteral,
    getStringValue: stringLiteralValue,
  };
  return adapter;
}

// a NodePath whose ancestor chain hits a detached node (`.node` null) before reaching the Program
// root: a constantViolation path into a subtree an in-place rewrite has already re-parented, so its
// placement walk is unreliable
function ancestorChainDetached(path) {
  for (let cur = path?.parentPath; cur; cur = cur.parentPath) {
    if (cur.node === null || cur.node === undefined) return true;
    if (cur.node.type === 'Program') return false;
  }
  return false;
}

// the LIVE path of `targetNode` in `scopeOwnerPath`'s subtree (node identity), or null. re-anchors a
// stale constantViolation path after an in-place split moved its statement. memoized per node -
// an unmemoized subtree traverse per detached lookup is O(uses x file size); a LATER mutation can
// detach the memo too, so a hit re-validates and falls back to a fresh traverse
const freshPathMemo = new WeakMap();
export function freshPathOfNode(scopeOwnerPath, targetNode) {
  if (!scopeOwnerPath || !targetNode) return null;
  const memo = freshPathMemo.get(targetNode);
  if (memo && memo.node === targetNode && !ancestorChainDetached(memo)) return memo;
  let found = null;
  scopeOwnerPath.traverse({
    enter(p) {
      if (p.node === targetNode) {
        found = p;
        p.stop();
      }
    },
  });
  if (found) freshPathMemo.set(targetNode, found);
  return found;
}

// babel drops a binding from its scope registry after the destructure-assignment alias rewrite
// (`({ Map: M } = globalThis)` -> `M = _Map`): the declaration survives in the AST while
// `scope.getBinding` turns null, so the resolver's reassignment follow silently degrades to
// generic (the estree side, resolving on the pristine AST, keeps the narrow - a parity gap).
// rebuild the minimal binding shape the resolver reads ({ path, identifier, scope, kind,
// constantViolations }) from the AST via the canonical scan (see `rebuildLaggedScopeBinding`)
// the positional twin of the identity view for a REPLACED declarator: our decl-form swap
// replaces the declarator node (identity dies, positions cloned), but the replacement stays
// inside the registration's declaration span - a place no user shadow can occupy
function replacedDeclSlotInfo(bindingNode, info) {
  const span = info?.aliasDeclSpan;
  return span && bindingNode?.start >= span.start && bindingNode?.end <= span.end ? info : null;
}

const laggedBindingCache = new WeakMap();
// name -> first declaring declarator for a block-like container's OWN statement level, built
// once per container: the flat per-call scan this replaces re-walked every statement of the
// container (a several-thousand-statement Program body) on every lagged lookup - quadratic on
// large flat scopes. export wrappers unwrap the same way the scan did; first declaration wins
const lexicalDeclIndexCache = new WeakMap();
function lexicalDeclIndex(containerNode) {
  let index = lexicalDeclIndexCache.get(containerNode);
  if (index) return index;
  index = new Map();
  for (const stmt of containerNode.body ?? []) {
    const decl = stmt?.type === 'ExportNamedDeclaration' ? stmt.declaration : stmt;
    if (decl?.type !== 'VariableDeclaration') continue;
    for (const d of decl.declarations) {
      walkPatternIdentifiers(d.id, id => {
        if (!index.has(id.name)) index.set(id.name, d);
      });
    }
  }
  lexicalDeclIndexCache.set(containerNode, index);
  return index;
}

export function rebuildLaggedScopeBinding(path, name) {
  // hoisted `var` (any nesting depth, pattern-aware): the canonical var-scope walker - the
  // same lookup the estree side's synthetic var-hoist binding uses, so the recovery shapes
  // stay in lockstep across substrates
  const varOwner = findVarOwnerDeclaring(path, name);
  let declaratorNode = varOwner?.declarator ?? null;
  let ownerPath = varOwner?.owner ?? null;
  if (!declaratorNode) {
    // block-scoped `let` / `const`: by definition body-level of an enclosing block, so the
    // per-container lexical index answers each level in one lookup - no descent. the climb
    // starts AT `path`: a scope-host anchor (the guard machinery asks with the block / Program
    // path itself) must see its OWN body-level declarations, not only enclosing ones
    for (let p = path; p && !declaratorNode; p = p.parentPath) {
      if (!p.isProgram() && !p.isBlockStatement() && !p.isStaticBlock()) continue;
      declaratorNode = lexicalDeclIndex(p.node).get(name) ?? null;
      if (declaratorNode) ownerPath = p;
    }
  }
  if (!declaratorNode || !ownerPath) return null;
  // memoized per (owner PATH, name): the recovery is re-asked for the same lagged binding at
  // every use site. keyed on the traversal-scoped path object, so the cache dies with the
  // traversal; member rewrites do not add or remove the USER writes this collects
  let ownerCache = laggedBindingCache.get(ownerPath);
  if (!ownerCache) laggedBindingCache.set(ownerPath, ownerCache = { byName: new Map(), reassignIndex: null, writeIndex: null });
  if (ownerCache.byName.has(name)) return ownerCache.byName.get(name);
  // canonical write set mapped onto live paths - the same scan / owner index the estree
  // twin (`synthVarHoistBinding`) reads, so the recovery mirrors a NATIVE binding's shape:
  // for-x head writes and redecl-with-init declarators included, shadow boundaries scoped by
  // the canonical rules (a bare redecl carries no value and stays unrecorded - the phantom
  // filter would drop it anyway).
  // ONE index PAIR per owner, shared by every lagged name in it - a fresh per-name build
  // re-walked the whole owner twice per name, quadratic on alias-dense scopes. the recovery
  // runs after the plugin's own alias rewrite, so every path handed out is revalidated
  // against the LIVE tree below: a babel path is a container-slot view, so an in-place
  // rewrite leaves the indexed path pointing at the replacement (re-vouched when it still
  // writes `name`), while a replaced-statement write detaches its subtree and fails the
  // attachment climb. any failed vouch rebuilds the pair once; a second failure declines
  // the recovery - generic degrade beats handing the flow gates an unvouched write list
  function attempt() {
    if (!ownerCache.writeIndex) {
      ownerCache.reassignIndex = buildScopeReassignmentIndex(ownerPath.node);
      ownerCache.writeIndex = buildOwnerWritePathIndex(ownerPath);
    }
    const declaratorPath = ownerCache.writeIndex.get(declaratorNode);
    // the declarator slot must be EXACT: a swapped declarator means the (cached) discovery
    // node is itself stale and the write attribution cannot be vouched
    if (declaratorPath?.node !== declaratorNode || !pathAttachedTo(declaratorPath, ownerPath)) return null;
    const violations = [];
    for (const node of ownerCache.reassignIndex.get(name) ?? []) {
      if (node === declaratorNode) continue;
      const violationPath = ownerCache.writeIndex.get(node);
      if (!violationPath || !pathAttachedTo(violationPath, ownerPath)
        || (violationPath.node !== node && !writesLaggedName(violationPath.node, name))) return null;
      violations.push(violationPath);
    }
    return {
      path: declaratorPath,
      identifier: declaratorNode.id,
      scope: ownerPath.scope,
      kind: declaratorPath.parentPath?.node?.kind ?? 'let',
      constantViolations: violations,
    };
  }
  let rebuilt = attempt();
  if (!rebuilt) {
    ownerCache.reassignIndex = null;
    ownerCache.writeIndex = null;
    rebuilt = attempt();
  }
  ownerCache.byName.set(name, rebuilt);
  return rebuilt;
}

// still mounted in the live tree under `ownerPath`? verifies the container-slot invariant at
// every hop - a write whose host statement was REPLACED keeps its own subtree intact (node
// identity still matches), and only the broken container link above reveals the detachment
function pathAttachedTo(path, ownerPath) {
  for (let p = path; p; p = p.parentPath) {
    if (p === ownerPath || p.node === ownerPath.node) return true;
    if (p.container && p.container[p.key] !== p.node) return false;
  }
  return false;
}

// does `node` (a write-shaped node in the owner index) write the binding `name`? re-vouches a
// container slot whose original write was swapped in place by the plugin's own alias rewrite
function writesLaggedName(node, name) {
  let writes = false;
  function check(patternNode) {
    walkPatternIdentifiers(patternNode, id => { if (id.name === name) writes = true; });
  }
  switch (node.type) {
    case 'AssignmentExpression': check(node.left); break;
    case 'UpdateExpression': writes = node.argument?.type === 'Identifier' && node.argument.name === name; break;
    case 'VariableDeclarator': check(node.id); break;
    case 'ForOfStatement':
    case 'ForInStatement': {
      const forHead = node.left;
      if (forHead?.type === 'VariableDeclaration') for (const d of forHead.declarations) check(d.id);
      else if (forHead) check(forHead);
    }
  }
  return writes;
}

// no-tracking adapter for detect-entry's `require('core-js/...')` literal check
export const babelAdapter = createBabelAdapter();

// babel visitor key for nodes whose `typeAnnotation` / `returnType` / params need walking:
// function-likes (param + return types), object-method shorthand, class-method shapes
// (`m(x: Foo): Bar`), AND class-field shapes (`x: Map<T>`, `accessor y: Set<T>`) whose
// typeAnnotation sits on the field-level node itself. babel splits these into distinct
// node types - listing them all in one `|`-pattern so they share one visitor body
const TYPE_ANNOTATION_HOSTS = [
  'FunctionDeclaration',
  'FunctionExpression',
  'ArrowFunctionExpression',
  'ClassMethod',
  'ClassPrivateMethod',
  'ObjectMethod',
  'ClassProperty',
  'ClassPrivateProperty',
  'ClassAccessorProperty',
].join('|');

// symbol-keyed per-file reset hook on the visitors object - symbol so babel's visitor
// enumerator (own string keys only) does not mistake it for a node-type visitor
export const USAGE_VISITORS_RESET = Symbol('core-js.usageVisitors.reset');
// symbol-keyed `handledObjects.has` so post-sweep can skip nodes that `handleBinaryIn`
// already covered (e.g. `Symbol` in `Symbol.iterator in obj`)
export const USAGE_VISITORS_IS_HANDLED = Symbol('core-js.usageVisitors.isHandled');

// @babel/generator drops the parens around a TS-cast callee under a type instantiation:
// `((M.groupBy as any)<any>)([1])` reprints as `M.groupBy as any<any>([1])`, which re-parses -
// and TS-strips - into a relational chain over a bare `any` identifier (runtime
// ReferenceError). the drop reproduces on a plain parse/print round-trip with no plugin, so
// restore an explicit paren node around the cast whenever this plugin's presence forces the
// reprint. EVERY babel mode reprints (entry-global included), so each mounts this handler in
// its OWN throwaway visitor map - babel's traverse/explode MUTATES visitor objects in place,
// so a shared map object must never cross plugin instances. the pure guard-narrow emit
// carries its own slot-local variant of the same restoration
export function restoreInstantiationParens(path) {
  const inner = path.node.expression;
  if (inner.type === 'TSAsExpression' || inner.type === 'TSSatisfiesExpression' || inner.type === 'TSTypeAssertion') {
    path.get('expression').replaceWith({ type: 'ParenthesizedExpression', expression: inner });
  }
}

export function createUsageVisitors({
  adapter,
  isEntryAvailable,
  method,
  onUsage,
  resolveMeta,
  resolvePure = null,
  resolvedType,
  suppressProxyGlobals = false,
  toHint,
  walkAnnotations = true,
}) {
  // only usage-pure rewrites global identifiers to named import bindings (which are frozen).
  // usage-global injects side-effect imports and leaves the identifier alone, so `Map++`
  // must polyfill - otherwise `Map` ReferenceError's in engines where the native is missing
  const skipUpdateTargets = method === 'usage-pure';
  let handledObjects = new WeakSet();
  let isSelfRefVarBinding = createSelfRefVarGuard(b => b.kind, adapter);

  // destructure-only wrapper (every caller is inside handleDestructuring): a side-effecting
  // computed key resolves to its tail for identity; the emitter keeps the key in the pattern (it
  // runs once) and adds an inline default `= _Array$from`, so the static is polyfilled, not bailed
  // threads the key's own path: the key EVALUATES there, so the canon's flow gates
  // (init-dominance, reaching-value) anchor at the capture instead of defaulting open
  function resolveKey(path, computed) {
    return sharedResolveKey({ node: path.node, computed, scope: path.scope, adapter, path });
  }

  // `skipReferencedCheck` bypasses babel's `isReferencedIdentifier` for callers that have
  // already established the read context (e.g., assignment LHS - strict-mode binding lookup)
  function handleIdentifier(path, skipReferencedCheck = false) {
    // orphaned node (parent removed by a sibling transform): `isReferencedIdentifier`
    // reads `parent.type` unconditionally and would crash. check BEFORE everything else
    if (!path.parent) return;
    if (!skipReferencedCheck && !path.isReferencedIdentifier()) return;
    // the logical-assign LHS polyfill injection lives on a dedicated `Identifier` visitor
    // (babel classifies `Map ||= X` LHS as non-reference, so it doesn't reach this path)
    // ReferencedIdentifier matches JSXIdentifier in too many positions. accept:
    //   `<Foo />` - direct opening-element name
    //   `<Foo.Bar.Baz />` - root of N-deep JSXMemberExpression chain at opening-element
    //     name slot. the root identifier IS a runtime reference; the .Bar.Baz chain
    //     accesses props on it. walks through the chain so deeper-than-2 still detects
    // reject everything else: attribute names, JSXNamespacedName parts, .property positions
    if (path.node.type === 'JSXIdentifier') {
      let cur = path;
      while (cur?.parent?.type === 'JSXMemberExpression' && cur.parent.object === cur.node) {
        cur = cur.parentPath;
      }
      if (cur?.parent?.type !== 'JSXOpeningElement' || cur.key !== 'name') return;
    }
    // TS type-only positions: `type X = ...` / `interface X {...}` / `import type X = require(...)`
    // ids and `export { type X }` / `import type { X }` specifiers. babel's
    // `isReferencedIdentifier` marks them as referenced, but no runtime binding exists -
    // polyfilling is pure over-injection (and breaks TS output for exports / duplicates the
    // import LHS for TSImportEquals)
    if (isTSTypeOnlyIdentifierPath(path)) return;
    // `isReferencedIdentifier` is permissive on a BODYLESS method-shaped member key (an overload
    // signature `Map(): void;`, `abstract Map(): void`): it reports the key as referenced, so a
    // global-shaped member NAME would pull in that global's polyfill. the key names a member, never
    // the global - reject through the shared member-name predicate. only the KEY slot needs asking:
    // the predicate's other member slot is a non-computed member tail, which `isReferencedIdentifier`
    // (and, for a JSX member tail, the JSX branch above) has already rejected by this point
    if (path.key === 'key' && isNonReferencePosition(path.parent, path.node)) return;
    // usage-pure cannot rewrite a global at a write position to a frozen import binding (the
    // write would TypeError): UpdateExpression operand (`Map++`, `--Map`, `(Map)++`), an
    // assignment LHS (`Map = x`, `Map ||= x`), or a for-of / for-in head bare-Identifier LHS
    // (`for (Map of arr)`). a TS-non-null / paren wrapper (`Map! ||= x`, `for (Map! of arr)`)
    // keeps `isReferencedIdentifier` true so the read reaches here; both checks peel transparent
    // ancestors before testing the write shapes
    if (skipUpdateTargets && (isInUpdateOperand(path.parentPath) || isAssignOrForXWriteTargetPath(path))) return;
    const { node } = path;
    // adapter.hasBinding folds in two filters: skips type-only TSImportEquals (elided by
    // tsc - runtime resolves to global) and recognises plugin-managed bindings (pure-import
    // aliases, global destructure aliases). single check, parity with unplugin's visitor
    if (adapter.hasBinding(path.scope, node.name, path)) {
      // self-reference `var X = X` - hoisted var init references its own name, which at
      // runtime reads from the outer (global) scope before the local is assigned. narrow
      // path intentionally: ImportSpecifiers, class-decls, and const-to-identifier aliases
      // are excluded so user-owned pure imports (e.g. `const MyPromiseTry = ...`) don't get
      // re-routed through generic-global polyfill
      if (!isSelfRefVarBinding(path.scope.getBinding(node.name), path)) return;
      // name equals the binding's own name (we looked up `binding` by `node.name`), so
      // `isKnownGlobalName(node.name)` is sufficient - `resolveBindingToGlobal` would
      // walk a now-mutated `init` and give an unreliable answer
      if (!isKnownGlobalName(node.name)) return;
      if (handledObjects.has(node)) return;
      onUsage({ kind: 'global', name: node.name }, path);
      return;
    }
    // see `handleBinaryIn` - only resolved polyfillable keys seed `handledObjects`
    if (handledObjects.has(node)) return;
    onUsage({ kind: 'global', name: node.name }, path);
  }

  function handleMemberExpression(path) {
    const { node, parent } = path;
    if (handledObjects.has(node)) return;
    if (isMemberWriteOnlyContext(node, parent, path.parentPath?.parent)) {
      // a guarded SHIM write stays fully native (its statement is ignored as polyfill
      // intent); a deliberate override's receiver follows the SAME identifier routing the
      // reads use, so the patch and the reads land on one object - no marking there
      // its receiver follows the SAME identifier routing the (always-mutated-by-definition)
      // reads use, so the patch and the reads land on one object - no marking
      return;
    }
    const meta = handleMemberExpressionNode({
      node, scope: path.scope, adapter, handledObjects, suppressProxyGlobals, path, resolveMeta, isEntryAvailable,
      resolvePure,
    });
    if (meta) {
      onUsage(meta, path);
      // usage-global union: extra reachable receiver / key targets each earn a side-effect import
      for (const extra of meta.extraCandidates ?? []) onUsage(extra, path);
    }
  }

  // destructure-prop emit funnel: every prop meta gets its computed `Symbol.X` key provenance
  // checked once here, so a string spelling of the key stays untagged and the symbol-routed
  // emit paths leave it as a plain property read
  function emitPropUsage(meta, path) {
    // capture the key slots BEFORE dispatch: a usage-pure emit may REPLACE the ObjectProperty
    // (extraction / rewrite), detaching `path.node` for the union pass below.
    // `meta` may be null (an unresolvable - e.g. BRANCHING - computed key, or a mutated-static
    // receiver): the primary dispatch skips, but the union still runs - the provider synthesizes
    // its branch-key carrier there, so every producer bail keeps its reachable arm keys
    const { key: keyNode, computed } = path.node;
    const { scope } = path;
    if (meta) onUsage(tagSymbolSourcedMeta({ meta, keyNode, computed, scope, adapter, path }), path);
    // usage-global reachable receiver / key union: each extra destructure target earns a
    // side-effect import beside the primary, mirroring the member funnel
    for (const extra of collectDestructureUnionCandidates({
      meta, keyNode, computed, scope, adapter, path, resolvePure,
    })) onUsage(extra, path);
  }

  // nested pattern `{ X: { y } } = Z` - inner ObjectPattern lives under an outer ObjectProperty.
  // N-deep: resolve the outer key chain to an effective receiver, emit meta accordingly
  function emitNestedDestructureMeta(path, outerProp) {
    // thread the key's own path so the flow gates anchor at the capture (a reassigned/hoisted key
    // alias reaches its dominating value), matching the `resolveKey` wrapper and the unplugin twin -
    // without it babel defaults to the declarator init and diverges on a reassigned key
    const innerKey = sharedResolveKey({
      node: path.node.key, computed: path.node.computed, scope: path.scope, adapter, path: path.get('key'),
    });
    const receiverKey = sharedResolveNestedDestructureReceiver(outerProp, adapter);
    // a BRANCHING inner key rides a null-key carrier that KEEPS the resolved nested receiver,
    // so the union pairs the arm keys with it as statics
    // (`{ Array: { [cond ? "from" : "of"]: f } } = globalThis` reaches both statics)
    if (!innerKey) {
      return emitPropUsage(receiverKey !== null
        ? { kind: 'property', object: receiverKey, key: null, placement: 'static' } : null, path);
    }
    // a monkey-patched static is NOT a polyfillable destructure source (the same gate the
    // provider's init-meta builder applies): emit NO meta at all - the typeless form would
    // fall to the instance dispatcher. the prop stays raw and the receiver routes through
    // the identifier machinery, so the patch and the read share one object
    if (receiverKey !== null && adapter.isMutatedStatic?.(receiverKey, innerKey)) return;
    emitPropUsage(receiverKey !== null
      ? { kind: 'property', object: receiverKey, key: innerKey, placement: 'static' }
      : { kind: 'property', object: null, key: innerKey, placement: null }, path);
  }

  // `function({ from } = Array)` - AssignmentPattern wraps the param; the default expression
  // is the receiver the destructure targets when the arg is omitted. for an IIFE with a
  // statically-classifiable caller-arg (`(({from} = Array) => ...)(Set)`) the wrapper-default
  // is dead code at runtime - resolve against the caller-arg instead; the shared chooser keeps
  // the default for non-receiver args (notably `undefined`). the winning call-arg evaluates
  // AT THE CALL SITE - resolve it against the call-site scope, not the invoked function's
  // inner scope (a param shadowing the arg's name would swallow the receiver)
  function emitIifeParamDefaultDestructure(path, parent) {
    const key = resolveKey(path.get('key'), path.node.computed);
    if (!key) return emitPropUsage(null, path);
    const desc = resolveFallbackReceiver(parent, parent.node);
    const argNode = desc?.callPath ? unwrapSafeSequenceTail(desc.rhsNode) : null;
    const receiverNode = chooseFallbackReceiverNode({
      argNode, defaultNode: parent.node.right, objectPattern: parent.node.left, scope: parent.scope, adapter, path, resolvePure,
    });
    // resolve the winning call-arg against the call-site scope AND path (like the unplugin twin) -
    // the fallback shadow walks anchor at `path`, so a stale ObjectProperty anchor inside the arrow
    // would find an inner same-name shadow and drop the meta. emit still targets the prop path
    const argWins = argNode && receiverNode === argNode;
    const receiverScope = argWins ? desc.callPath.scope : parent.scope;
    const receiverPath = argWins ? desc.callPath : path;
    const meta = buildDestructuringInitMeta({ initNode: receiverNode, key, scope: receiverScope, adapter, path: receiverPath });
    emitPropUsage(meta, path);
  }

  function handleDestructuring(path) {
    const objectPattern = path.parentPath;
    if (!objectPattern.isObjectPattern()) return;
    // ONE key resolution for every host branch below; the nested / iife-param funnels keep
    // their own resolution on purpose (they anchor flow gates differently)
    const key = resolveKey(path.get('key'), path.node.computed);
    const parent = objectPattern.parentPath;
    let initPath;
    if (parent.isVariableDeclarator()) {
      initPath = parent.get('init');
      if (!initPath?.node) {
        emitPropUsage(key ? { kind: 'property', object: null, key, placement: null } : null, path);
        return;
      }
    } else if (parent.isAssignmentExpression()) {
      initPath = parent.get('right');
    } else if (parent.isAssignmentPattern() && isFunctionParamDestructureParent(objectPattern)
      && !isInnerDestructureDefault(parent)) {
      return emitIifeParamDefaultDestructure(path, parent);
    } else if (parent.isAssignmentPattern() && parent.parentPath?.isObjectProperty()
      && parent.node.left === objectPattern.node) {
      // nested destructure with inner-default: `{ Array: { from } = {} } = X` - AssignmentPattern
      // wraps inner ObjectPattern and provides default `{}` if `X.Array` is undefined. for
      // proxy-global receivers `X.Array` is always defined, so default is dead code; treat
      // AssignmentPattern as transparent and resolve via the same nested chain as the bare
      // `{ Array: { from } } = X` shape
      emitNestedDestructureMeta(path, parent.parentPath);
      return;
    } else if (parent.isObjectProperty()) {
      emitNestedDestructureMeta(path, parent);
      return;
    } else if (parent.isArrayPattern()
      || (parent.isAssignmentPattern() && parent.node.left === objectPattern.node
        && parent.parentPath?.isArrayPattern())) {
      // ArrayPattern-rooted nested destructure `const [{from}] = wrapper` (or with a transparent
      // inner-default `const [{from} = {}] = wrapper`, where the AssignmentPattern wraps the
      // ObjectPattern as an ArrayPattern element) - walk up the ArrayPattern stack to the host
      // and descend Identifier-aliased ArrayExpression wrappers to find the leaf constructor;
      // the shared resolver peels the inner-default wrapper. fall through to typeless when none
      if (!key) return emitPropUsage(null, path);
      const constructor = sharedResolveArrayWrapperedDestructureReceiver(objectPattern, adapter);
      // mutated static: no meta at all (a typeless meta would dispatch the instance helper)
      if (constructor && adapter.isMutatedStatic?.(constructor, key)) return;
      emitPropUsage(constructor
        ? { kind: 'property', object: constructor, key, placement: 'static' }
        : { kind: 'property', object: null, key, placement: null }, path);
      return;
    } else if (parent.isAssignmentPattern()
      || parent.isForOfStatement()
      || parent.isForInStatement()
      || parent.isRestElement()
      || parent.isCatchClause()) {
      // for-of / catch: unknown receiver, emit typeless meta
      emitPropUsage(key ? { kind: 'property', object: null, key, placement: null } : null, path);
      return;
    } else if (parent.isFunction()) {
      // IIFE: `(({from}) => {})(Array)` / `!function({from}) {}(Array)`. shared
      // `findIifeCallSite` peels wrapper chain (Unary / Sequence / Paren / Chain / TS),
      // accepts CallExpression / NewExpression / OptionalCallExpression, AND enforces
      // the callee-identity gate (`peelIifeCallee(callee, fn) === fn`) so functions
      // PASSED AS ARGS to another call (`doStuff(Array, function({from}) {...})`) don't
      // get misclassified as IIFEs reading from the outer call's args
      const site = findIifeCallSite(parent, objectPattern.node);
      if (!site) return;
      if (!key) return emitPropUsage(null, path);
      const argNode = resolveCallArgument(site.callPath.node.arguments, site.paramIndex);
      // anchor BOTH scope AND path at the call site: the receiver arg lives there, and the adapter's
      // var-hoist / Annex-B / TS-runtime shadow fallback keys on `path` - leaving it at the USE path
      // (inside the IIFE body) stops the function-scope walk at the IIFE boundary, missing a call-site
      // shadow. matches the with-default sibling (8e18d8e0df) and the unplugin twin
      const meta = buildDestructuringInitMeta({
        initNode: argNode ?? null, key, scope: site.callPath.scope, adapter, path: site.callPath ?? path,
      });
      emitPropUsage(meta, path);
      return;
    } else return;
    if (!initPath?.node) return;
    if (!key) return emitPropUsage(null, path);
    let meta = buildDestructuringInitMeta({ initNode: initPath.node, key, scope: initPath.scope, adapter, path });
    // null = monkey-patched static: the prop stays raw, the receiver substitutes elsewhere
    // (the funnel's union no-ops on a resolved single key, so routing null through is inert)
    if (!meta) return emitPropUsage(null, path);
    // follow memoized reference type (e.g., const _ref = [1,2,3] after memoization).
    // spread instead of in-place mutation: contract with buildDestructuringInitMeta
    // doesn't promise mutable meta, and a fresh object is cheap here
    const cachedInitType = resolvedType?.get(initPath.node);
    if (!meta.placement && cachedInitType) {
      // cache stores the canonical Type object; convert to lowercase hint string for
      // `meta.object` dispatch (TYPE_HINTS keys are lowercase)
      const objectHint = toHint?.(cachedInitType);
      if (objectHint) meta = { ...meta, object: objectHint, placement: 'prototype' };
    }
    emitPropUsage(meta, path);
  }

  function handleBinaryExpression(path) {
    const meta = handleBinaryIn({
      node: path.node, scope: path.scope, adapter, handledObjects, isEntryAvailable, suppressProxyGlobals, path,
    });
    if (!meta) return;
    onUsage(meta, path);
    // usage-global reachable union targets of a reassigned `in` key / receiver alias
    for (const extra of meta.extraCandidates ?? []) onUsage(extra, path);
  }

  // a name in `T` of `let x: T` is a polyfill candidate only if no local binding shadows it
  // (`class Map {}; let x: Map = ...` must NOT pull in es.map.constructor). route through
  // the adapter's `hasBinding` so the same filters apply as for `handleIdentifier`: ambient
  // declarations (`declare const Map`) DON'T shadow (binding is tsc-elided); TS-runtime
  // declarations (`enum Map`, `namespace Map`) DO shadow (resolved via path ancestor walk).
  // a raw `getBindingIdentifier` here misses TS-runtime shadows entirely and conversely
  // over-skips on ambient declarations - both avoided by going through the adapter
  function annotationGlobal(path) {
    return name => {
      if (adapter.hasBinding(path.scope, name, path)) return;
      onUsage({ kind: 'global', name }, path);
    };
  }

  return {
    ...walkAnnotations ? {
      // babel exposes methods as distinct node types (not MethodDefinition wrappers), so
      // their params/returnType/typeAnnotation need explicit visitor entries. otherwise
      // `class C { m(x: Foo): Bar {} }` misses Foo/Bar on babel while unplugin catches them
      // through the underlying FunctionExpression - parser divergence.
      // class-field shapes (`class C { x: Map<T>; accessor y: Set<T> }`) carry their
      // typeAnnotation on the field-level node, NOT on a nested function, so they need
      // explicit dispatch too - without it the Map / Set polyfills miss on class-field
      // annotations even though the same annotation on a function param would emit
      [TYPE_ANNOTATION_HOSTS](path) {
        checkTypeAnnotations(path.node, annotationGlobal(path));
      },
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
    } : null,
    // ReferencedIdentifier covers all read positions for polyfill detection. a combined
    // `'ReferencedIdentifier|Identifier'` shape would register the handler twice via
    // `visitors.explode`, firing handleIdentifier twice per referenced Identifier
    // (the second pass guarded by `handledObjects` WeakSet, but parent / isReferenced
    // checks would run twice). two visitors instead: ReferencedIdentifier handles polyfill
    // detection; bare Identifier injects for the assignment / logical-assign LHS (babel
    // classifies `Map ||= X` LHS as non-reference, so ReferencedIdentifier never fires
    // for it - a separate visitor is needed to polyfill the written global)
    ReferencedIdentifier: handleIdentifier,
    Identifier(path) {
      if (!path.parent) return;
      const { parent } = path;
      // assignment LHS in global mode: strict-mode reads the binding before the write, so
      // `Map = X` / `Map ||= X` / `Map += 1` all need the polyfill. babel's
      // `isReferencedIdentifier` returns false for AssignmentExpression.left AND for bare
      // pattern leaves (`[Map] = arr`), so fire manually - a pattern-element write needs the
      // slot to exist exactly like the flat form
      if (method !== 'usage-pure'
        && ((parent.type === 'AssignmentExpression' && parent.left === path.node)
          || bareAssignmentPatternLeafPath(path))) return handleIdentifier(path, true);
    },
    'MemberExpression|OptionalMemberExpression': handleMemberExpression,
    ObjectProperty(path) {
      if (path.node.method) return;
      handleDestructuring(path);
    },
    BinaryExpression: handleBinaryExpression,
    TSInstantiationExpression: restoreInstantiationParens,
    // @babel/types omits `decorators` from TSParameterProperty's visitor keys, so @babel/traverse
    // never descends into a legacy param decorator's expression on a constructor parameter-property
    // (`constructor(@dec(Array.from([1])) private p) {}`) and its polyfillable globals go undetected.
    // requeue each decorator so the usage detectors run on it. plain Identifier params need no help -
    // their visitor keys keep `decorators`. (RestElement / ArrayPattern share the visitorKeys gap but
    // a decorator on a rest / destructured param is not parseable, so only this shape is reachable.)
    // guard on length so non-decorated parameter properties are untouched
    TSParameterProperty(path) {
      if (!path.node.decorators?.length) return;
      for (const decoratorPath of path.get('decorators')) path.requeue(decoratorPath);
    },
    // Program.enter calls this to drop per-file WeakSet state
    [USAGE_VISITORS_RESET]: () => {
      handledObjects = new WeakSet();
      isSelfRefVarBinding = createSelfRefVarGuard(b => b.kind, adapter);
    },
    [USAGE_VISITORS_IS_HANDLED]: node => handledObjects.has(node),
  };
}

// syntax visitors for Babel - thin wrapper over shared createSyntaxRules
export function createSyntaxVisitors({ injectModulesForModeEntry, injectModulesForEntry, isDisabled, isWebpack = false }) {
  const rules = createSyntaxRules({
    injectModulesForModeEntry, injectModulesForEntry, isDisabled, isWebpack,
  });
  return {
    // CallExpression path covers @babel/parser@7 where `import('mod')` is
    // CallExpression { callee: { type: 'Import' } }. @babel/parser@8 parses the same
    // source as a top-level ImportExpression node - hence the second visitor below
    CallExpression(path) {
      if (path.get('callee').isImport()) rules.onImportExpression(path.node);
    },
    ImportExpression(path) { rules.onImportExpression(path.node); },
    Function(path) { rules.onFunction(path.node); },
    'ForOfStatement|ArrayPattern'(path) {
      if (path.isForOfStatement()) rules.onForOfStatement(path.node);
      else rules.onArrayPattern(path.node);
    },
    SpreadElement(path) { rules.onSpreadElement(path.node, path.parentPath.node.type); },
    YieldExpression(path) { rules.onYieldExpression(path.node); },
    VariableDeclaration(path) { rules.onVariableDeclaration(path.node); },
    Class(path) { rules.onClass(path.node); },
  };
}
