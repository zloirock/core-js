import { subsume } from './subsumption.js';
import { isKnownGlobalName } from '../detect-usage/globals.js';
import { matchSelfDefaultTernarySlot } from '../resolve-node-type/value-ops.js';
import {
  LET_SCOPE_HOST_TYPES,
  FUNCTION_LIKE_NODE_TYPES,
  isMutatedGlobalSlot,
  isPristineProxyGlobal,
  POSSIBLE_GLOBAL_OBJECTS,
  arrayWrapSlotBindsName,
  isVarScopeBoundary,
  memberKeyName,
  objectPatternLiteralKeyPath,
  pairedArrayWrapInitElement,
  peelArrayWrapBindingLayers,
  peelZeroArgIifeReturn,
  reassignmentBlocksGlobalResolve,
  SKIPPABLE_WRAPPER_TYPES,
  staticMemberKeyName,
  collectFileCensus,
  isGuardedAliasingWrite,
  propertyKeyName,
  unwrapRuntimeExpr,
  varInitDominatesUsage,
  isDeclaratorSelfViolation,
  withoutValuelessDeclarationViolations,
  walkPatternIdentifiers,
} from './ast-patterns.js';

// re-export so existing consumers (`global-resolve.js`, `member-resolve.js`) keep their
// import path; canonical definitions live in `ast-patterns.js` next to `singleQuasiString`
export { memberKeyName, staticMemberKeyName };

// peel parens / TS wrappers AND SequenceExpression tail (`(se(), X)` -> `X` at runtime)
// to a fixpoint; covers mixed-wrapper cases like `((se(), X) as any)`. exported so the unplugin
// destructure emitter can tell a buried receiver effect (in the member - survives) from a liftable
// top-level prefix (peeled away here)
export function unwrapInitForResolution(node) {
  while (node) {
    const peeled = unwrapRuntimeExpr(node);
    if (peeled?.type === 'SequenceExpression') node = peeled.expressions.at(-1);
    else return peeled;
  }
  return node;
}

// classify a root that `findProxyGlobal(node, aliasCtx)` matched: true when it resolved through a
// const-alias (`g` in `const g = globalThis; g.X`) rather than by a direct global NAME. the emit-side
// collapse KEEPS an alias root verbatim (its own declaration already rewrote it to the pure global)
// and drops only the hops, whereas a direct root swaps to its pure binding. shared by both emitters
// so the keep-vs-swap decision lives in one place
export function isAliasProxyRoot(rootNode, aliasCtx) {
  return !!aliasCtx && !!rootNode && !POSSIBLE_GLOBAL_OBJECTS.has(rootNode.name);
}

// direct proxy-global (`globalThis`) or plugin-managed alias (`_globalThis` via polyfillHint).
// scope+adapter optional. shadow check (`function f(globalThis) {}`) bails unless polyfillHint
// is set. `path` anchors TS-runtime shadow detection (`enum globalThis {}`).
// const aliases (`const g = globalThis`) pass through via init-peel
export function proxyGlobalRootName({ node, scope, adapter, path, seen, binding = null, usageNode = null, readNode = null }) {
  if (node?.type !== 'Identifier') return null;
  if (!scope || !adapter) return POSSIBLE_GLOBAL_OBJECTS.has(node.name) ? node.name : null;
  binding ??= adapter.getBinding(scope, node.name, path);
  // hint side-channel runs FIRST and independently of scope binding presence: post-rewrite
  // aliases like `_globalThis` are tracked by the injector's global-alias map but may have
  // no entry in babel's scope chain, so the init-follow path never observes them
  const hint = binding?.polyfillHint ?? adapter.getBindingPolyfillHint?.(scope, node.name);
  // a mutated proxy SLOT (`window = fake`) is the user's replacement, not the global surface -
  // neither the direct name nor a hint/alias resolving to it recognises as a proxy root (what
  // an alias holds depends on capture order, which no span model covers). an assignment-form
  // hint additionally needs its write to END before the read anchor - an alias hop captured
  // pre-write holds undefined, and a hint narrow there would un-throw the native failure
  if (hint) {
    // `readNode` carries an alias hop's declarator NODE (babel bindings surface no path for it)
    if (!assignmentAliasHintSoundAtRead({ binding, adapter, readNode: readNode ?? (usageNode ?? path)?.node ?? null })) return null;
    return isPristineProxyGlobal(adapter, hint) ? hint : null;
  }
  // cycle guard keyed by the binding's DECLARATION node: a const-alias cycle (`const a = b; const
  // b = a`) or a self-referential init (`var Map = Map`) would otherwise recurse forever through
  // followLocalBindingToProxyGlobal. keying by `binding` directly fails for the detect-usage adapter,
  // which returns a FRESH binding wrapper object per `getBinding` call - identity never matches; the
  // declaration node is stable across calls. virtual (hint) bindings never reach here (handled above).
  // on a cycle, fall back to the node NAME so a self-referential PROXY name (`var self = self`) stays a
  // proxy - matching the node-only natural-global rewrite that already turns it into `_self`, so the hop
  // collapse fires consistently in both emitters (unplugin has no AST re-visit to recover it otherwise);
  // a non-proxy self-cycle (`var Map = Map`) stays false. avoids recursion either way (returns here)
  if (binding) return seen?.has(binding.node ?? binding)
    ? (POSSIBLE_GLOBAL_OBJECTS.has(node.name) ? node.name : null)
    : followLocalBindingToProxyGlobal({ binding, name: node.name, scope, adapter, path, seen, usageNode });
  if (adapter.hasBinding?.(scope, node.name, path)) return null;
  return isPristineProxyGlobal(adapter, node.name) ? node.name : null;
}

// boolean view for the call sites that only ask "is it a proxy root", not "which one"
export function isProxyGlobalIdentifierNode(args) {
  return proxyGlobalRootName(args) !== null;
}

// const-alias chain: `const g = globalThis` -> recurse into the init. reassigned bindings
// bail (the init-time global identity is no longer guaranteed at the use site). two binding
// shapes flow in: (a) detect-usage adapter pre-unwraps the VariableDeclarator onto
// `binding.node`; (b) babelBindingAdapter (in resolve-node-type) passes the raw babel
// binding where `.node` is the bound Identifier and the declarator lives at `.path.node`.
// branch on `node.type` so a single predicate covers both shapes
function followLocalBindingToProxyGlobal({ binding, name = null, scope, adapter, path, seen, usageNode = null }) {
  // dominance-aware - ONE reassignment policy with the extends-target gate: a reassignment
  // that cannot reach the binding's READ does not block (the flat `constantViolations` bail
  // dropped a const-captured alias whose upstream source is reassigned only after the capture)
  if (reassignmentBlocksGlobalResolve({ binding, adapter, path: usageNode ?? path })) return null;
  const decl = binding.node?.type === 'VariableDeclarator' ? binding.node : binding.path?.node;
  // a hoisted-var declarator assigned on ONE path (`if (c) { var g = globalThis }`) binds the
  // name everywhere but holds the global only through that branch. the pure rewrites this follow
  // feeds (proxy-hop collapse, receiver substitution, type narrows) would rescue the
  // skipped-branch throw the source guarantees, so require the init to dominate the use - the
  // same gate the detection-side follow (`resolveVariableBindingToGlobal`) applies. global /
  // entry modes keep the call site and stay sound regardless
  if (adapter?.method === 'usage-pure'
    && !varInitDominatesUsage({ declaratorNode: decl, usagePath: usageNode ?? path, kind: binding.kind })) return null;
  // a PATTERN id binds `name` to a KEY of the init, not the init itself: following the whole
  // init would classify a plain slot as the proxy surface (`const { x } = globalThis; x.Array`
  // reads `globalThis.x`, likely undefined - collapsing it un-throws the native failure).
  // resolve through the literal key-path instead: proxy-global root, pristine proxy hops, and
  // the LEAF itself must name a pristine proxy global (`{ self: s } = globalThis` re-enters)
  if (decl?.id && decl.id.type !== 'Identifier') {
    if (!name) return null;
    const peeled = peelArrayWrapBindingLayers(decl.id, decl.init, name);
    if (peeled?.id?.type !== 'ObjectPattern') return null;
    const keyPath = objectPatternLiteralKeyPath(peeled.id, name);
    const leaf = destructuredGlobalKeyPathLeaf(peeled.init, keyPath, binding.path?.scope ?? scope, adapter,
      new Set(seen).add(binding.node ?? binding));
    return leaf !== null && isPristineProxyGlobal(adapter, leaf) ? leaf : null;
  }
  const init = unwrapInitForResolution(decl?.init);
  // a root captured through a MEMBER read (`const s = globalThis.self`) names the proxy surface just
  // as a bare alias does - the chain recogniser below already walks exactly that shape, so hand it
  // over instead of bailing. only a chain whose LEAF is itself a proxy global is a root
  if (init?.type === 'MemberExpression' || init?.type === 'OptionalMemberExpression') {
    const leaf = globalProxyMemberName({
      node: init, scope: binding.path?.scope ?? scope, adapter, path: binding.path ?? path,
      seen: new Set(seen).add(binding.node ?? binding),
    });
    return isPristineProxyGlobal(adapter, leaf) ? leaf : null;
  }
  if (init?.type !== 'Identifier') return null;
  // the NEXT hop's value is read at THIS declarator - anchor its reassignment and hint
  // order proofs there, not at the outer use the caller carried (`readNode` rides the
  // declarator NODE for adapters whose bindings surface no path)
  return proxyGlobalRootName({
    node: init, scope: binding.path?.scope ?? scope, adapter, path: binding.path ?? path,
    seen: new Set(seen).add(binding.node ?? binding), usageNode: binding.path ?? usageNode, readNode: decl,
  });
}

// a BRANCHING init (ternary / logical) is value-sound only when every completing path
// yields the built-in. ternary: both branches resolve, or the SELF-DEFAULT shape
// (`X === void 0 ? d : X`, `typeof X === 'undefined' ? d : X` - the shared desugar canon)
// where the resolving branch is the tested reference: the fallback then only runs where
// the built-in is absent. logical: `X || d` / `X ?? d` keep the defaulted direction only
// (the left operand is the built-in); `&&` yields its LEFT operand on the falsy path, so
// only both-resolving operands are sound. either-branch acceptance registered aliases for
// values that are never the built-in and drove unguarded folds masking the native
// TypeError (`fake || globalThis`), plus wrong-value folds through the flat name-keyed
// alias info (`c ? Symbol : shim`)
function branchingInitResolves(node, scope, adapter, resolvesBranch) {
  if (node.type === 'ConditionalExpression') {
    const consequent = resolvesBranch(node.consequent);
    const alternate = resolvesBranch(node.alternate);
    if (consequent && alternate) return true;
    if (!consequent && !alternate) return false;
    const defaultSlot = matchSelfDefaultTernarySlot(node, {
      isLocalUndefinedName: () => !!adapter?.getBinding?.(scope, 'undefined'),
    });
    if (!defaultSlot) return false;
    return defaultSlot === 'consequent' ? alternate : consequent;
  }
  if (node.operator === '&&') return resolvesBranch(node.left) && resolvesBranch(node.right);
  return resolvesBranch(node.left);
}

// does this alias-binding init reference the destructured global? the proxy-global predicate resolves the
// proxy-global object case (`= globalThis`, including `_globalThis` via polyfillHint and `const g =
// globalThis` alias chains); the injector's import table resolves the injected-import case an in-place
// rewrite leaves behind (`= _Promise`, or the defaulted `_Symbol === void 0 ? d : _Symbol` whose guard
// ternary is walked). a user binding of the same name resolves to neither - uniqueName keeps injected
// UIDs collision-free
function aliasInitResolvesToGlobal(node, scope, adapter, injector) {
  if (!node) return false;
  if (node.type === 'Identifier') {
    if (isProxyGlobalIdentifierNode({ node, scope, adapter, path: null })) return true;
    // plugin-minted UIDs only: a USER-named body-extract record shares the import table but is
    // scope-bound user code - serving it here would verify an alias shape against a coincident
    // name from another scope
    const imp = injector?.getPureImport?.(node.name);
    return !!imp && !imp.userNamed;
  }
  if (node.type === 'ConditionalExpression' || node.type === 'LogicalExpression') {
    return branchingInitResolves(node, scope, adapter, branch => aliasInitResolvesToGlobal(branch, scope, adapter, injector));
  }
  // an array-wrapped alias (`const [{ Map: M }] = [globalThis]`) leaves an ArrayExpression init; an
  // element resolving to a global keeps the guard's established bar (receiver-is-global, key-blind).
  // needed post-consumption: babel's flatten empties the pattern slot before the member visit, so this
  // stale init is the only walkable evidence that the registered alias is THIS binding, not a shadow
  if (node.type === 'ArrayExpression') {
    return node.elements.some(el => el && el.type !== 'SpreadElement'
      && aliasInitResolvesToGlobal(el, scope, adapter, injector));
  }
  return false;
}

// shared shadow guard for a `registerGlobalAlias` destructure-alias (`info.source === null`): the binding
// must be an un-reassigned VariableDeclarator whose init resolves to the destructured global. used by both
// plugin adapters (babel mutates the init in place, unplugin keeps the source init) so a proxy-global alias
// re-polyfills its member reads regardless of declaration kind - a const-only gate dropped `let` / for-init
// aliases. callers pass their parser-specific binding (`.path.node` declarator + `.constantViolations`).
// an ASSIGNMENT-form alias (`let M; ({ Map: M } = globalThis)`) is accepted only through its REGISTERED
// trusted write (`info.aliasWrite`, recorded when the registration verified cleanliness + unconditional
// placement with the binding alive): the init-less declarator carries the global in that single write,
// so every violation must fall inside its span - any OTHER write makes the value flow-dependent -> native
// the init node the alias judge must resolve for a binding named `boundName`: an array-wrap
// (`const [{ Set: A }, { Map: M }] = [userObj, globalThis]`) binds each ObjectPattern element to
// the init element at the SAME index, so `A` reads `userObj.Set`, NOT the whole array. return that
// POSITIONAL element (`null` on an absent or spread-shifted pairing - bail); a non-array-wrap shape
// returns the init verbatim (`undefined` sentinel means "not an array-wrap, use init as-is").
// deeper array-wrap layers (`[[{ Map: M }]] = [[globalThis]]`) recurse positionally, mirroring the
// receiver resolver's `resolveArrayWrappedProxyGlobalAlias` - the two paths must agree on nesting
function positionalArrayWrapInit(idPattern, init, boundName) {
  if (idPattern?.type !== 'ArrayPattern' || init?.type !== 'ArrayExpression') return undefined;
  const elements = idPattern.elements ?? [];
  for (let i = 0; i < elements.length; i++) {
    const slot = elements[i]?.type === 'AssignmentPattern' ? elements[i].left : elements[i];
    if (slot?.type === 'ObjectPattern' && (slot.properties ?? []).some(prop => {
      const value = prop.value?.type === 'AssignmentPattern' ? prop.value.left : prop.value;
      return value?.type === 'Identifier' && value.name === boundName;
    })) return pairedArrayWrapInitElement(init.elements, i);
    if (slot?.type === 'ArrayPattern' && arrayWrapSlotBindsName(slot, boundName)) {
      // recurse only into the nested wrapper that BINDS the name - a non-binding sibling's
      // "not found" answer is not terminal and must not abort the scan of later elements
      // (aligns with the mirror walk, which scans past non-binding siblings). a binding
      // subtree's answer IS terminal: `undefined` from an unpairable init means
      // found-but-unresolvable, so it bails as `null`
      return positionalArrayWrapInit(slot, pairedArrayWrapInitElement(init.elements, i), boundName) ?? null;
    }
  }
  return null;
}

// judge ONE declarator (id pattern + init) as the alias source for `boundName`:
//   - an array-wrap judges the POSITIONALLY-paired element, never the whole array - a `.some()`
//     over all elements wrongly confirms a user-object slot (`{ Set: A } = userObj`)
//   - a genuinely NESTED binding of the name rejects: it inherits the flat name-keyed alias
//     registration but reads a different key path off the global (`globalThis.constructor.Map`,
//     not `globalThis.Map`)
//   - an ABSENT name (an SE-key extraction leaves a `_unused` residual whose pattern no longer
//     binds the name) still folds through the init
// shared by the init arm and the duplicate-var split anchor of `isPolyfillAliasBinding`, which
// must apply IDENTICAL pattern rejections (the anchor judging `write.init` wholesale folded a
// mispaired / nested shadow the init arm correctly rejected)
function declaratorInitResolvesForName({ id, init, boundName, scope, adapter, injector }) {
  if (!init) return false;
  const positional = positionalArrayWrapInit(id, init, boundName);
  if (positional !== undefined) return !!positional && aliasInitResolvesToGlobal(positional, scope, adapter, injector);
  if (id?.type === 'ObjectPattern' && patternBindsNameNested(id, boundName)) return false;
  return aliasInitResolvesToGlobal(init, scope, adapter, injector);
}

export function isPolyfillAliasBinding({ info, binding, scope, adapter, injector, boundName = null }) {
  if (info?.source !== null || binding?.path?.node?.type !== 'VariableDeclarator') return false;
  const { id, init } = binding.path.node;
  const violations = binding.constantViolations ?? [];
  if (init) {
    return !violations.length && declaratorInitResolvesForName({ id, init, boundName, scope, adapter, injector });
  }
  // duplicate-var SPLIT ANCHOR (`var M; var { Map: M } = g;`): the binding hangs off the bare
  // declarator while the value-writing same-name redeclaration carries the global - accept
  // exactly one writing declarator, judged with the SAME pattern rejections as the init arm,
  // with no other real writes
  if (!info.aliasWrite && violations.length === 1) {
    const write = violations[0]?.node ?? violations[0];
    if (write?.type === 'VariableDeclarator') {
      return declaratorInitResolvesForName({ id: write.id, init: write.init, boundName, scope, adapter, injector });
    }
  }
  if (!info.aliasWrite || !violations.length) return false;
  return violations.every(v => {
    const node = v?.node ?? v;
    return node?.start >= info.aliasWrite.start && node?.end <= info.aliasWrite.end;
  });
}

// registration-time gate for an ASSIGNMENT-form ctor alias (`let M; ({ Map: M } = globalThis)`): register
// the alias hint ONLY when, with the binding still alive, the write is provably the binding's sole value
// source on every path reaching later reads:
//   - the declarator is init-less (an initialized `var M = x; ({ Map: M } = globalThis)` has a second
//     value source - flow-dependent)
//   - every recorded write falls inside THIS assignment's span (cleanliness)
//   - the host statement's placement is unconditional (a conditional write - `if (c) ({Map:M} = gt)` -
//     leaves the native undefined on the untaken path; narrowing a later member read would un-throw it)
// a rejected registration keeps the destructure swap itself (value-correct in write order) but leaves
// member reads native. the recorded write span is what `isPolyfillAliasBinding` matches violations against
export function maybeRegisterAssignmentAliasWrite({ injector, adapter = null, binding, localName, hint, assignNode, stmtPath }) {
  // the hint asserts "this alias holds the pristine global" - with the hint's own SLOT
  // recorded mutated the capture order decides what the alias holds, which no span model
  // covers; decline like the binding-less form so reads stay on the live-value channels
  if (isMutatedGlobalSlot(adapter, hint)) return false;
  const bindingNode = binding?.node ?? binding?.path?.node ?? null;
  const scopeSpan = enclosingFunctionSpan(stmtPath);
  if (!assignmentAliasWriteTrusted({ binding, assignNode, stmtPath })) {
    // refused flow-trust: register the binding as GUARDED - its member reads get the runtime
    // ctor guard instead of a static narrow (the guard self-corrects on any actual flow).
    // `srcPos` keys the multi-write merge: the LAST write's hint drives the guard
    injector.registerGlobalAlias(localName, hint, { bindingNode, guarded: true, scopeSpan, srcPos: assignNode.start });
    return false;
  }
  // `verified`: the trust predicate examined the binding's COMPLETE original write set - a
  // use-site identity hit may skip the live shape check (any later violation is our own swap).
  // decl-form registrations stay UNVERIFIED: their gate judges placement only, so a same-name
  // redeclaration write must still be caught live
  injector.registerGlobalAlias(localName, hint, {
    bindingNode, write: { start: assignNode.start, end: assignNode.end }, scopeSpan, verified: true,
  });
  return true;
}

// the trust predicate behind the checked registration AND the resolver's lazy write lookup: the
// binding must be an init-less declarator whose EVERY write falls inside THIS assignment (sole value
// source), placed unconditionally in the binding's own function/module scope (a nested-function or
// control-guarded write may never run - see `unconditionalStatementPlacement`). accepts either an
// adapter-normalized binding (`.node`) or a raw scope binding (`.path.node`)
export function assignmentAliasWriteTrusted({ binding, assignNode, stmtPath }) {
  const declarator = binding?.node ?? binding?.path?.node;
  if (declarator?.type !== 'VariableDeclarator' || declarator.init) return false;
  const violations = binding.constantViolations ?? [];
  if (!violations.length || !violations.every(v => {
    const node = v?.node ?? v;
    return node?.start >= assignNode.start && node?.end <= assignNode.end;
  })) return false;
  return unconditionalStatementPlacement(stmtPath, declarator);
}

// plan-level trust registration for ctor-alias extractions (`kind: 'global'`): run the checked
// registration once per plan (assignment host -> single trusted write; declaration host -> `var`-
// placement rule; a BINDING-LESS name - `({ Promise } = globalThis)` writing the global itself -
// registers trusted, there is no user binding whose writes could contradict the hint). a REFUSED
// registration only withholds the member-narrow HINT: the value swap itself stays - it is value-
// correct on every path (the polyfill lands exactly when the native write would run), and dropping
// it would strip the polyfill from conditional forms (`while (c) var { Promise } = globalThis`).
// registrations happen HERE (render sites must not re-register - a plain re-register would erase a
// trusted write span); `aliasGated` makes the cached-plan re-entry a no-op
// trusted registration for a BINDING-LESS ctor-alias name (`({ Promise } = globalThis)` -
// writing the global itself, no user binding to contradict the hint). the hint asserts "this
// name IS the pristine global"; once the name's own slot is recorded mutated, the assertion
// is false - the name is DEOPTED and its reads stay verbatim, so a pristine hint would
// contradict the emit. ALL binding-less registration sites route through here
export function registerBindinglessCtorAlias({ injector, adapter, localName, hint }) {
  if (!isMutatedGlobalSlot(adapter, localName)) injector.registerGlobalAlias(localName, hint, { trusted: true });
}

export function registerCtorAliasExtractions({ plan, declarator, scope, adapter, injector, path }) {
  if (!plan || plan.aliasGated) return plan;
  plan.aliasGated = true;
  const isAssignmentHost = declarator?.type !== 'VariableDeclarator';
  for (const node of plan.outerProps) {
    for (const e of node.extractions ?? []) {
      if (e.kind !== 'global') continue;
      const binding = adapter.getBinding(scope, e.localName, path);
      if (!binding?.node && !binding?.path) {
        registerBindinglessCtorAlias({ injector, adapter, localName: e.localName, hint: e.hint });
      } else if (isAssignmentHost) {
        maybeRegisterAssignmentAliasWrite({
          injector, adapter, binding, localName: e.localName, hint: e.hint,
          assignNode: { start: declarator.id.start, end: declarator.init.end }, stmtPath: path,
        });
      } else {
        registerDeclAliasIfSound({
          injector, adapter, kind: binding?.kind, localName: e.localName, hint: e.hint, stmtPath: path,
          bindingNode: binding?.node ?? binding?.path?.node ?? null, binding,
        });
      }
    }
  }
  return plan;
}

// enumerate TOP-LEVEL `{ GlobalCtor: local }` pairs of a destructure whose source resolves to a
// proxy global - the registerable ctor-alias surface. nested OBJECT-pattern values and defaults are
// not ctor aliases (their value is not the global member on every path), so they don't register; a
// computed key registers only as a STATIC STRING (`{ ['Map']: M }` - as deterministic as the plain
// form); the array-wrapped form pairs each ObjectPattern element positionally and RECURSES into
// deeper array-wrap layers (`[[{ Map: M }], y] = [[globalThis], 0]`) - the registration walk must
// agree on nesting with the alias judge and the receiver mirror, else a deep alias never gets its
// hint and its static reads stay raw in babel only (unplugin's text visitor re-derives them)
function collectCtorAliasPairs({ pattern, init, scope, adapter, injector }) {
  if (!init || !aliasInitResolvesToGlobal(unwrapInitForResolution(init), scope, adapter, injector)) return [];
  const pairs = [];
  function collectFromObjectPattern(pat) {
    for (const prop of pat.properties ?? []) {
      if (prop.type !== 'Property' && prop.type !== 'ObjectProperty') continue;
      const key = propertyKeyName(prop);
      if (key && prop.value?.type === 'Identifier') pairs.push({ localName: prop.value.name, hint: key });
    }
  }
  if (pattern?.type === 'ObjectPattern') collectFromObjectPattern(pattern);
  else if (pattern?.type === 'ArrayPattern') {
    // POSITIONAL match: an array-wrap binds each ObjectPattern element to the init element at the
    // SAME index, so a `{ Set: A }` element paired with a non-global init element (`[userObj, ...]`)
    // reads `userObj.Set` and must stay native. the top gate's `.some()` passes once ANY element is
    // a global; register a pattern element ONLY when its positional init element resolves to a global
    const initEls = unwrapInitForResolution(init)?.type === 'ArrayExpression'
      ? unwrapInitForResolution(init).elements : null;
    (pattern.elements ?? []).forEach((el, i) => {
      // a slot default (`[{ Set: C } = f]`) unwraps like the alias judge's positional walk:
      // registration fires only off a known-global pair (always defined), so the default is dead
      const slot = el?.type === 'AssignmentPattern' ? el.left : el;
      const initEl = initEls && pairedArrayWrapInitElement(initEls, i);
      if (slot?.type === 'ArrayPattern') {
        // deeper layer: recurse with the POSITIONALLY-paired init element (the top gate re-judges
        // it); no sound pairing (spread-shifted / absent / non-array init) registers nothing
        if (initEl) pairs.push(...collectCtorAliasPairs({ pattern: slot, init: initEl, scope, adapter, injector }));
        return;
      }
      if (slot?.type !== 'ObjectPattern') return;
      // no positional init evidence (a non-array / babel-emptied init) keeps the established
      // whole-init bar so a post-consumption confirmation still recognises the alias
      if (!initEls || (initEl && aliasInitResolvesToGlobal(initEl, scope, adapter, injector))) collectFromObjectPattern(slot);
    });
  }
  return pairs;
}

// pre-pass registration of one destructure-of-global site (assignment or declaration form),
// through the SAME trust gates the render-time registration used - but BEFORE any member visit,
// so a use textually earlier than its write (a hoisted-var read, an earlier-defined closure)
// still resolves the alias table instead of silently missing a registration that happens later
// in visit order. `isKnownGlobalName` keeps the table's bar: only known global names register
export function registerAliasPrePassSite({ pattern, init, declKind, assignNode, scope, adapter, injector, path }) {
  for (const { localName, hint } of collectCtorAliasPairs({ pattern, init, scope, adapter, injector })) {
    // the NAME domain, not "has a whole-ctor pure entry": statics-only globals (Object / Array /
    // Math) carry no global-kind entry, but their aliases register just the same - without the
    // hint a split-anchor / hoisted-var alias never resolves (pure keeps the static raw,
    // usage-global drops the injection - the unsafe direction)
    if (!isKnownGlobalName(hint)) continue;
    const binding = adapter.getBinding(scope, localName, path);
    if (!binding?.node && !binding?.path) {
      registerBindinglessCtorAlias({ injector, adapter, localName, hint });
    } else if (assignNode) {
      maybeRegisterAssignmentAliasWrite({ injector, adapter, binding, localName, hint, assignNode, stmtPath: path });
    } else {
      registerDeclAliasIfSound({
        injector, adapter, kind: declKind, localName, hint, stmtPath: path,
        bindingNode: binding?.node ?? binding?.path?.node ?? null, binding,
      });
    }
  }
}

// cheap scope-less gate for the alias pre-pass: does the file contain any destructure whose
// source COULD be a proxy global (assignment with a pattern LHS, or an initialized declarator
// with a pattern id)? most files have neither and skip the scoped traverse entirely.
// census-reducer form - the per-node predicate latches from the shared file-census walk
export function ctorAliasShapesReducer() {
  let hasCtorAliasShapes = false;
  return {
    visit(node) {
      if (hasCtorAliasShapes) return;
      const pattern = node.type === 'AssignmentExpression' && node.operator === '=' ? node.left
        : node.type === 'VariableDeclarator' && node.init ? node.id : null;
      if (pattern?.type === 'ObjectPattern' || pattern?.type === 'ArrayPattern') hasCtorAliasShapes = true;
    },
    result() { return { hasCtorAliasShapes }; },
  };
}

export function hasCtorAliasCandidateShapes(programNode) {
  return collectFileCensus(programNode, [ctorAliasShapesReducer()]).hasCtorAliasShapes;
}

// a statement placement that provably executes whenever its enclosing function (or module body) runs:
// only plain blocks between the statement and the function/program boundary. any control structure on
// the way (if / loops / try / switch / labeled bodies) makes execution path-dependent -> false.
// the walk starts at the statement's PARENT (the statement node itself - ExpressionStatement /
// VariableDeclaration - is not judged)
// does the member/call chain contain an optional hop AT `node` or on its spine BELOW it (toward
// the chain root)? guards non-spine slot evaluation. both parser spellings covered: babel names
// every post-`?.` node Optional* with per-hop `optional` flags; estree keeps plain Member/Call
// with `optional: true` on the hop itself under a ChainExpression wrapper
function spineHasOptionalHop(node) {
  for (let cur = node; cur;) {
    if (cur.optional === true) return true;
    if (cur.type === 'MemberExpression' || cur.type === 'OptionalMemberExpression') cur = cur.object;
    else if (cur.type === 'CallExpression' || cur.type === 'OptionalCallExpression') cur = cur.callee;
    else break;
  }
  return false;
}

const STATEMENT_HOST_TYPES = new Set(['ExpressionStatement', 'VariableDeclaration']);
function unconditionalStatementPlacement(stmtPath, withinNode = null) {
  // callers pass paths at different depths (a declarator, the assignment, its statement) -
  // normalize by climbing to the hosting statement first, judging every EDGE on the way: a
  // conditional expression container (`c ? ({ Map: M } = g) : 0`, `c && ({ Map: M } = g)`) or a
  // function boundary (an expression-body arrow `() => ({ Map: M } = g)`) makes the write run on
  // one branch / an unknown call even though the statement placement itself is unconditional.
  // sequence / call-argument / object- and array-literal / await positions evaluate whenever the
  // statement runs, so they pass through; then judge the statement's ancestors.
  // an OPTIONAL chain short-circuits everything right of its `?.` hop: a write sitting in a
  // non-spine slot (call argument / member key) is conditional exactly when an optional hop
  // sits AT or BELOW its host (`host?.doThing(WRITE)`, `a?.[WRITE]`) - a hop RIGHT of the host
  // (`a[WRITE].b?.c`) cuts only after the slot already evaluated, so it passes. the spine head
  // (leftmost object/callee) always evaluates and passes
  let stmt = stmtPath;
  while (stmt && !STATEMENT_HOST_TYPES.has(stmt.node?.type)) {
    const parent = stmt.parentPath;
    const parentType = parent?.node?.type;
    if (parentType && !STATEMENT_HOST_TYPES.has(parentType)) {
      if (FUNCTION_LIKE_NODE_TYPES.has(parentType)) return false;
      if (parentType === 'ConditionalExpression' && parent.node.test !== stmt.node) return false;
      if (parentType === 'LogicalExpression' && parent.node.left !== stmt.node) return false;
      const isMemberOrCall = parentType === 'OptionalMemberExpression' || parentType === 'OptionalCallExpression'
        || parentType === 'MemberExpression' || parentType === 'CallExpression';
      if (isMemberOrCall) {
        const spineSlot = parent.node.object === stmt.node || parent.node.callee === stmt.node;
        if (!spineSlot && spineHasOptionalHop(parent.node)) return false;
      }
    }
    stmt = parent;
  }
  for (let cur = stmt?.parentPath; cur; cur = cur.parentPath) {
    const type = cur.node?.type;
    // terminate on any VAR-SCOPE OWNER (function-likes, class static block, TS namespace body,
    // program): a statement placed directly in one executes whenever that unit runs
    if (isVarScopeBoundary(type)) {
      // `withinNode` (the alias declarator) must live in THIS terminator's span - else the
      // statement sits in a nested function relative to the binding and may never execute
      return !withinNode || type === 'Program'
        || (withinNode.start >= cur.node.start && withinNode.end <= cur.node.end);
    }
    if (type !== 'BlockStatement') return false;
  }
  return false;
}

// registration gate for a DECLARATION-form ctor alias: a hoisted `var` alias declared under a
// conditional (`if (c) { var { Map: M } = globalThis }`) binds everywhere but assigns on one path -
// a member narrow through the hint would un-throw the untaken path, so it stays native. `let` /
// `const` are block-scoped (an out-of-block use never resolves the binding), so only `var` pays
// the placement walk
// a TRUSTED write / declaration supports a STATIC narrow only for a use textually AFTER its
// span end: a hoisted-var read or an earlier-defined closure body runs pre-assignment, and a
// static narrow there would un-throw it - those uses stay NATIVE. textually-later uses keep the
// static narrow (the locked decl canon: a later closure hoisted above its own definition and
// called pre-write is the accepted TDZ-class edge). callers without a use position keep the
// registration-only behavior
// span of the function (or program) hosting the registration statement: the name-fallback view
// disambiguates same-name entries positionally - a use belongs to an entry whose hosting scope
// contains it. spans, not scope objects: the fallback runs exactly when the live scope is
// unavailable (babel scope-tracker lag after `replaceWith`)
export function enclosingFunctionSpan(stmtPath) {
  for (let cur = stmtPath; cur; cur = cur.parentPath) {
    if (isVarScopeBoundary(cur.node?.type)) {
      return { start: cur.node.start, end: cur.node.end };
    }
  }
  return null;
}

// the LEXICAL hosting span for a block-scoped (`let` / `const`) alias: the nearest block-like
// host, not the enclosing function - a function-wide span would serve the registration to a
// same-named read OUTSIDE the block, where the binding does not exist (a runtime
// ReferenceError a narrow would mask)
function enclosingLexicalSpan(stmtPath) {
  for (let cur = stmtPath?.parentPath; cur; cur = cur.parentPath) {
    // a TS namespace body compiles to an IIFE: its consts are namespace-scoped, so it hosts
    // like a block (the statement lattice lists it as an ADDITION, not a runtime block)
    if (LET_SCOPE_HOST_TYPES.has(cur.node?.type) || cur.node?.type === 'TSModuleBlock') {
      return { start: cur.node.start, end: cur.node.end };
    }
  }
  return null;
}

export function aliasSpanDominatesUse({ info, useStart }) {
  const span = info?.aliasWrite ?? info?.aliasDeclSpan;
  return !span || useStart === null || useStart > span.end;
}

// pure only: an assignment-form alias hint is flow-sound at a read only when its registered
// write ENDS before the read begins. registration verified the write's shape and placement,
// not its order against every read - an alias hop captures its source at the hop declarator,
// so a source written after that capture must not narrow it (`const S = T; ({ Symbol: T } =
// globalThis)` captures undefined; the span gate at the OUTER use admits it). unknown positions
// bail - pure resolves on proof. global / entry modes stay hint-sound regardless (side-effect
// imports only, over-inject-safe)
export function assignmentAliasHintSoundAtRead({ binding, adapter, readNode }) {
  if (adapter?.method !== 'usage-pure' || !binding?.aliasWrite) return true;
  const readStart = readNode?.start ?? null;
  return readStart !== null && readStart > binding.aliasWrite.end;
}

export function registerDeclAliasIfSound({
  injector, adapter = null, kind, localName, hint, stmtPath, bindingNode = null, binding = null,
}) {
  // mutated-slot hint: same decline as the assignment form - see maybeRegisterAssignmentAliasWrite
  if (isMutatedGlobalSlot(adapter, hint)) return false;
  let stmt = stmtPath;
  while (stmt && !STATEMENT_HOST_TYPES.has(stmt.node?.type)) stmt = stmt.parentPath;
  const declSpan = stmt?.node ? { start: stmt.node.start, end: stmt.node.end } : null;
  const scopeSpan = kind === 'var' ? enclosingFunctionSpan(stmtPath) : enclosingLexicalSpan(stmt ?? stmtPath);
  // the scope binding may resolve a use to a DIFFERENT declarator of the same `var` slot than
  // the registering one: a redeclaration merges into ONE runtime binding, but estree block-scopes
  // the inner `var` (registration sees it) while the read resolves the outer - and babel the
  // reverse. key the entry under EVERY same-name `var` declarator of the enclosing var scope
  const extraBindingNodes = [binding?.path?.node ?? binding?.node ?? null];
  if (kind === 'var') {
    let owner = stmtPath;
    while (owner && !isVarScopeBoundary(owner.node?.type)) owner = owner.parentPath;
    if (owner?.node) {
      (function collect(node) {
        if (!node || typeof node !== 'object' || typeof node.type !== 'string') return;
        if (node !== owner.node && isVarScopeBoundary(node.type)) return;
        if (node.type === 'VariableDeclaration' && node.kind === 'var') {
          for (const d of node.declarations) {
            let binds = false;
            walkPatternIdentifiers(d.id, id => { if (id.name === localName) binds = true; });
            if (binds) extraBindingNodes.push(d);
          }
        }
        for (const value of Object.values(node)) {
          if (Array.isArray(value)) for (const item of value) collect(item);
          else collect(value);
        }
      })(owner.node);
    }
  }
  if (kind === 'var' && !unconditionalStatementPlacement(stmtPath)) {
    // refused flow-trust (conditional hoisted `var`): the member reads get the runtime ctor
    // guard. `srcPos` keys the multi-write merge positionally, same as the assignment form -
    // a MIXED decl+assignment dirty binding then deterministically guards on the LAST source
    injector.registerGlobalAlias(localName, hint, {
      bindingNode, guarded: true, scopeSpan, declSpan, extraBindingNodes, srcPos: declSpan?.start ?? null,
    });
    return false;
  }
  // `verified`: the registration examined the binding's COMPLETE original write set - no real
  // write beyond the registering declaration itself (a same-name redeclaration write / a later
  // assignment refuses). a verified entry may serve the scope-lag NAME fallback: any violation
  // appearing after registration is our own swap, and the declSpan dominance gate still applies
  const violations = withoutValuelessDeclarationViolations(binding?.constantViolations) ?? [];
  const verified = violations.every(violation => {
    const node = violation?.node ?? violation;
    return node === bindingNode || (declSpan && node?.start >= declSpan.start && node?.end <= declSpan.end);
  });
  injector.registerGlobalAlias(localName, hint, { bindingNode, declSpan, scopeSpan, verified, extraBindingNodes });
  return true;
}

// does the destructure RHS resolve to the Symbol constructor SPECIFICALLY? `aliasInitResolvesToGlobal`
// pinned to Symbol - accepts a bare `Symbol`, a proxy-global `globalThis.Symbol`, babel's rewritten
// `_Symbol`, and the defaulted-ternary form; rejects any other object
function aliasInitResolvesToSymbol(node, scope, adapter, injector, seen, followDestructured, keyCtx = null) {
  if (!node) return false;
  if (node.type === 'ConditionalExpression' || node.type === 'LogicalExpression') {
    return branchingInitResolves(node, scope, adapter,
      branch => aliasInitResolvesToSymbol(branch, scope, adapter, injector, seen, followDestructured, keyCtx));
  }
  const peeled = peelProxyGlobalObject(node);
  if (peeled?.type === 'Identifier') {
    // a bare `Symbol` counts only while unshadowed - a user binding (`const Symbol = Array`)
    // redirects the read to the user object, and folding its keys as well-known symbols
    // would substitute the wrong VALUE
    if (peeled.name === 'Symbol') return !adapter?.hasBinding?.(scope, 'Symbol');
    // plugin-minted imports only (`_Symbol` after an in-place rewrite): a USER-named
    // body-extract record carries its binding NAME as the fallback hint, so a user binding
    // that happens to be NAMED `Symbol` (`const { iterator: Symbol } = ...`) would masquerade
    // as the constructor and fold keys off the VALUE it actually holds
    const imp = injector?.getPureImport?.(peeled.name);
    if (imp && !imp.userNamed && imp.hint === 'Symbol') return true;
    // an intermediate user alias of the constructor (`const S = Symbol`, `= globalThis.self.Symbol`,
    // or a destructured `const { self: { Symbol: S } } = globalThis`) - babel's member-injection
    // resolves such chains in place and folds the well-known-symbol read, so the mutation-free estree
    // side must follow the same chain to keep the fold decision identical
    return userAliasBindingResolvesToSymbol(peeled, scope, adapter, injector, seen, followDestructured, keyCtx);
  }
  return globalProxyMemberName({ node: peeled, scope, adapter, path: null }) === 'Symbol';
}

// follow a user alias binding to Symbol and re-resolve through this same conservative predicate.
// two binding shapes: a SIMPLE alias (`const S = Symbol` / `= globalThis.self.Symbol`) recurses on
// its init; a DESTRUCTURED alias (`const { self: { Symbol: S } } = globalThis`) resolves the pattern's
// literal key-path off the proxy-global init. re-resolving preserves the shadow guard (`const S = Array`
// lands on Array -> stays native). cycle-guarded by declaration node (const-alias cycles), reassignment bails.
// `followDestructured` gates the destructured shape: babel's member-injection resolves a destructured
// constructor alias ONLY when the CONSUMING destructure is defaulted (the default drives an in-place
// inline); a non-defaulted consumer leaves it native, so the estree side follows only under the same
// condition (a simple const-alias, which babel's hint propagation crosses regardless, is unconditional)
// re-anchor a key ctx at the binding's declarator: an alias hop READS its source there, so
// the flow gates riding ctx.path (hint span-dominance, key dominance / reaching-value) must
// judge that position, not the outer use the ctx was built at
function hopAnchoredCtx(keyCtx, binding) {
  return keyCtx && binding.path ? { ...keyCtx, path: binding.path } : keyCtx;
}

function userAliasBindingResolvesToSymbol(node, scope, adapter, injector, seen, followDestructured, keyCtx = null) {
  const binding = adapter?.getBinding?.(scope, node.name, keyCtx?.path ?? null);
  // an assignment-form ctor alias (`let S; ({ Symbol: S } = globalThis)`) carries an init-less
  // declarator, but the adapter's hint machinery already verified its write shape AND that the
  // write span dominates the read anchored at `keyCtx.path` - the surfaced hint IS the
  // resolution. babel reaches the same fold through its in-place inline of the defaulted
  // consumer, a rewrite the text emitter never performs, so this walker must accept the hint
  // or the two emitters desync on every assignment-form host
  if (binding?.polyfillHint === 'Symbol') return true;
  const declarator = binding?.node?.type === 'VariableDeclarator' ? binding.node : binding?.path?.node;
  if (declarator?.type !== 'VariableDeclarator' || !declarator.init) return false;
  const declNode = binding.node ?? declarator;
  if (seen?.has(declNode) || reassignmentBlocksGlobalResolve({ binding, adapter, path: null })) return false;
  const next = new Set(seen).add(declNode);
  const nextScope = binding.path?.scope ?? scope;
  const hopCtx = hopAnchoredCtx(keyCtx, binding);
  if (declarator.id?.type === 'Identifier') {
    return aliasInitResolvesToSymbol(declarator.init, nextScope, adapter, injector, next, followDestructured, hopCtx);
  }
  if (!followDestructured && !keyCtx) return false;
  // peel array-wrap layers positionally (`const [{ Symbol: S }] = [globalThis]`) to the inner
  // ObjectPattern + init element (shared with resolveDestructuredGlobalName; spread-shifted
  // pairing bails inside the peel) before resolving the key-path off the proxy-global
  const peeled = peelArrayWrapBindingLayers(declarator.id, declarator.init, node.name);
  if (!peeled) return false;
  // a LITERAL-key hop honors `followDestructured` (babel inlines it only for a defaulted
  // consumer); a CONSTANT-RESOLVED computed hop collapses to a simple alias on babel
  // (`{ [k]: S }` -> `S = _Symbol`), whose hint propagation crosses UNCONDITIONALLY - the
  // estree side follows it likewise or the non-defaulted consumer desyncs
  const literalPath = objectPatternLiteralKeyPath(peeled.id, node.name);
  if (literalPath) {
    return followDestructured && destructuredGlobalKeyPathNamesSymbol(peeled.init, literalPath, nextScope, adapter, next);
  }
  if (!keyCtx) return false;
  // the computed key EVALUATES at the alias declarator, not at the eventual use: anchor the
  // key canon's dominance / reaching-value analysis there via `usageNode`, or a key reassigned
  // AFTER the capture would resolve to the post-capture value - a wrong-value fold
  return destructuredGlobalKeyPathNamesSymbol(peeled.init,
    objectPatternLiteralKeyPath(peeled.id, node.name,
      { resolveKey: keyCtx.resolveKey, scope: nextScope, adapter, path: binding.path ?? keyCtx.path ?? null, usageNode: declarator }),
    nextScope, adapter, next);
}

// resolve a destructure key-path (`['self','Symbol']`) off a proxy-global init to the Symbol leaf,
// mirroring globalProxyMemberName's chain walk: the root must be a proxy-global, every intermediate
// hop must stay on the proxy-global surface (and be un-mutated), the leaf must name Symbol
function destructuredGlobalKeyPathNamesSymbol(init, keyPath, scope, adapter, seen) {
  const leaf = destructuredGlobalKeyPathLeaf(init, keyPath, scope, adapter, seen);
  return leaf === 'Symbol' && !isMutatedGlobalSlot(adapter, leaf);
}

// resolve a destructure key-path off a proxy-global init to its LEAF name, mirroring
// globalProxyMemberName's chain walk: the root must resolve to a proxy global and every
// intermediate hop must stay on the pristine proxy-global surface. the LEAF's own semantics
// (Symbol ctor / proxy-global re-entry / anything else) are the caller's judgment
function destructuredGlobalKeyPathLeaf(init, keyPath, scope, adapter, seen) {
  // thread the caller's cycle guard: a cyclic destructure chain (`{ x: a } = b; { y: b } = a`)
  // re-enters this walk through the init's own proxy-root resolution
  if (!keyPath?.length) return null;
  if (!isProxyGlobalIdentifierNode({ node: peelProxyGlobalObject(init), scope, adapter, path: null, seen })) return null;
  for (let i = 0; i < keyPath.length - 1; i++) {
    if (!isPristineProxyGlobal(adapter, keyPath[i])) return null;
  }
  return keyPath.at(-1);
}

// shadow guard for a body-extract Symbol.X destructure alias (`const { iterator } = Symbol`). the
// injector's binding-info is name-keyed (flat), so a NESTED same-name binding queries the outer
// alias's registered source; confirming THIS binding is an un-reassigned ObjectPattern destructure
// whose RHS resolves to Symbol rejects a shadow off another object (`= { iterator: 5 }` / `= Array`)
// does `pattern` bind `name` as a DIRECT top-level `{ key: name }` / shorthand value? a nested
// binding (`{ constructor: { iterator } }`) reads `<init>.constructor.iterator`, NOT the top-level
// well-known key `<init>.iterator`, so the flat name-keyed symbol fold would substitute the wrong
// value (`Symbol.constructor.iterator === undefined`). peels an `= default` wrapper on the value slot.
// an EMPTY ObjectPattern is a babel post-fold artifact: babel rewrites a valid top-level symbol
// destructure in-place (emptying its properties) BEFORE the use is judged, while it never folds a
// NESTED shadow (that pattern stays pristine + non-empty), so empty <=> a consumed top-level alias
function patternBindsNameAtTopLevel(pattern, name) {
  if (pattern?.type !== 'ObjectPattern' || !name) return false;
  const props = pattern.properties ?? [];
  if (!props.length) return true;
  return props.some(prop => {
    if (prop.type !== 'Property' && prop.type !== 'ObjectProperty') return false;
    const value = prop.value?.type === 'AssignmentPattern' ? prop.value.left : prop.value;
    return value?.type === 'Identifier' && value.name === name;
  });
}

// does `pattern` bind `name` BELOW its top level (`{ constructor: { iterator } }` /
// `{ a: [Map] }`)? a top-level value (`{ Map }`) and an ABSENT name (an extracted / residual
// slot) both return false - only a genuinely nested binding, which reads a different key path
// off the init, must be barred from inheriting the flat name-keyed alias fold
function patternBindsNameNested(pattern, name) {
  if (!name) return false;
  function walk(node, depth) {
    if (node?.type === 'ObjectPattern') {
      return (node.properties ?? []).some(prop => {
        if (prop.type === 'RestElement') return walk(prop.argument, depth + 1);
        if (prop.type !== 'Property' && prop.type !== 'ObjectProperty') return false;
        const value = prop.value?.type === 'AssignmentPattern' ? prop.value.left : prop.value;
        return value?.type === 'Identifier' ? depth > 0 && value.name === name : walk(value, depth + 1);
      });
    }
    if (node?.type === 'ArrayPattern') {
      return (node.elements ?? []).some(el => {
        const slot = el?.type === 'AssignmentPattern' ? el.left : el;
        if (slot?.type === 'RestElement') return walk(slot.argument, depth + 1);
        return slot?.type === 'Identifier' ? depth > 0 && slot.name === name : walk(slot, depth + 1);
      });
    }
    return false;
  }
  return walk(pattern, 0);
}

export function isSymbolDestructureAliasBinding({
  info, binding, scope, adapter, injector, boundName: passedName = null, keyCtx = null,
}) {
  // a synthetic var-hoist binding (estree nested-block `var`) carries `.node` without `.path`
  const declarator = binding?.path?.node ?? binding?.node;
  if (!info?.source || declarator?.type !== 'VariableDeclarator') return false;
  // the flat name-keyed info can belong to an OUTER same-name alias, so THIS binding's
  // write must be judged here: a conditionally-executed write (hoisted `var` in a branch,
  // guarded assignment) reads undefined on the untaken path - the registration refusal
  // poisoned ITS entry, but the positional name view still surfaces the outer one
  if (isGuardedAliasingWrite(binding)) return false;
  // the loop-reinit declarator-self (a for-init const records its own per-iteration rebind as a
  // violation on estree, a destructured one via the bound identifier INSIDE the pattern) is the
  // declaration, not a write - exclude it via the shared canon or a for-init-hosted alias never
  // judges clean while the block-hosted twin does (emitter desync). filter on the RAW violation
  // entries: the valueless-redecl filter reads their paths, so mapping to nodes first blinds it
  const writes = (withoutValuelessDeclarationViolations(binding.constantViolations) ?? [])
    .filter(v => !isDeclaratorSelfViolation(v, declarator));
  // babel exposes the bound identifier at `binding.identifier`; estree-toolkit at `binding.name`;
  // a synthetic var-hoist binding carries neither, so the caller passes the name explicitly
  const boundName = passedName ?? binding.identifier?.name ?? binding.name
    ?? (binding.node?.type === 'Identifier' ? binding.node.name : null);
  // declarator form: `const { X } = Symbol` - no real write beyond the declaration itself. the
  // bound name must be a DIRECT top-level value of the pattern (a nested shadow reads a different
  // key path off the init and must not inherit the flat well-known-symbol fold)
  if (declarator.id?.type === 'ObjectPattern') {
    const followCtx = hopAnchoredCtx(keyCtx, binding);
    return !writes.length && patternBindsNameAtTopLevel(declarator.id, boundName)
      && aliasInitResolvesToSymbol(declarator.init, scope, adapter, injector, undefined,
        topLevelPropertyDefaulted(declarator.id, boundName), followCtx);
  }
  // babel INLINES a DEFAULTED symbol destructure (`const { iterator = fb } = Symbol`) to a plain
  // `const iterator = _Symbol$iterator === void 0 ? fb : _Symbol$iterator` guard-ternary BEFORE this
  // judge runs, so the ObjectPattern arm never sees it. the guarded value is the SPECIFIC well-known
  // symbol import (not the Symbol ctor), so resolve the self-default guard down to that import and
  // confirm its module is the source the registration already recorded - else the use stays native
  // (missed polyfill on ie:11) while the mutation-free estree side folds
  if (declarator.id?.type === 'Identifier' && declarator.id.name === boundName && declarator.init && !writes.length) {
    const guardSlot = declarator.init.type === 'ConditionalExpression'
      ? matchSelfDefaultTernarySlot(declarator.init, { isLocalUndefinedName: () => !!adapter?.getBinding?.(scope, 'undefined') })
      : null;
    const guarded = guardSlot === 'consequent' ? declarator.init.alternate
      : guardSlot === 'alternate' ? declarator.init.consequent : declarator.init;
    return guarded?.type === 'Identifier' && injector?.getPureImport?.(guarded.name)?.source === info.source;
  }
  // assignment form: `var X; ({ iterator: X } = Symbol)` - a bare declarator whose ONLY real
  // write is the aliasing destructure; resolving the write's RHS keeps the two parsers'
  // fold decisions identical (babel otherwise folds via its in-place polyfillHint while the
  // mutation-free estree side stayed native)
  if (declarator.init || writes.length !== 1) return false;
  const assign = assignmentAliasWriteAssign(writes[0], boundName);
  // an assignment-destructure alias follows the chain UNCONDITIONALLY: babel's hint propagation
  // folds a well-known-symbol read off an assignment-destructured constructor regardless of a slot
  // default, unlike a const-destructure (which babel resolves only when defaulted-inlined - the
  // declarator arm above gates on that). matching babel keeps the two emitters' fold decisions identical
  return !!assign && aliasInitResolvesToSymbol(assign.right, scope, adapter, injector, undefined, true, keyCtx);
}

// does `pattern` bind `name` at its top level through an `= default` wrapper (`{ key: name = d }`)?
// gates the destructured-alias chain-follow: babel resolves a destructured constructor alias only
// when the CONSUMING slot is defaulted (see userAliasBindingResolvesToSymbol)
function topLevelPropertyDefaulted(pattern, name) {
  if (pattern?.type !== 'ObjectPattern') return false;
  return (pattern.properties ?? []).some(prop => (prop.type === 'Property' || prop.type === 'ObjectProperty')
    && prop.value?.type === 'AssignmentPattern' && prop.value.left?.type === 'Identifier' && prop.value.left.name === name);
}

// the aliasing-destructure WRITE assignment from either parser's violation shape: babel records the
// AssignmentExpression itself, estree records the bound identifier inside the LHS pattern - climb to
// the assignment. anything but a plain `=` into an object pattern (a for-x head rebind, a nested array
// wrap) stays null. `boundName` must be a DIRECT top-level value of the LHS pattern - a nested binding
// reads a different key path off the RHS, so inheriting the flat well-known-symbol fold would substitute
// a wrong value. caller reads `.right` (the RHS to resolve) and `.left` (defaulted-slot gate)
function assignmentAliasWriteAssign(violation, boundName) {
  function assignIfTopLevel(assign) {
    return assign.operator === '=' && assign.left?.type === 'ObjectPattern'
      && patternBindsNameAtTopLevel(assign.left, boundName) ? assign : null;
  }
  const node = violation?.node ?? violation;
  if (node?.type === 'AssignmentExpression') return assignIfTopLevel(node);
  if (node?.type !== 'Identifier') return null;
  // climb through the pattern layers estree records around the bound identifier; an
  // AssignmentPattern is the `= default` wrapper on a defaulted slot (`{ iterator: X = fb } = S`)
  // and must be crossed too, else the defaulted assignment-alias never reaches the assignment
  for (let p = violation?.parentPath; p; p = p.parentPath) {
    const type = p.node?.type;
    if (type === 'AssignmentExpression') return assignIfTopLevel(p.node);
    if (type !== 'Property' && type !== 'ObjectProperty' && type !== 'ObjectPattern' && type !== 'AssignmentPattern') return null;
  }
  return null;
}

// unwrap paren / TS / SE wrappers AND a zero-arg IIFE returning a proxy-global: at runtime
// `(function(){return globalThis})().Array` accesses `Array` on `globalThis` exactly like the
// bare `globalThis.Array` chain. owns the unwrap so callers pass the raw `.object` node;
// non-IIFE callees (`getGlobal().Array`) return unchanged and keep generic dispatch.
// `peelZeroArgIifeReturn` already bails on async / generator / spread / control-flow bodies,
// so only sound pass-through wrappers peel
export function peelProxyGlobalObject(node) {
  node = unwrapRuntimeExpr(node);
  // SE tails peel for CLASSIFICATION only (`(eff(), globalThis).Array` - the prefix stays in
  // the source and runs at evaluation), mirroring the detect-usage chain walks; without the
  // peel an SE-buried extends target dropped its super statics
  while (node?.type === 'SequenceExpression' && node.expressions.length) {
    node = unwrapRuntimeExpr(node.expressions.at(-1));
  }
  if (node?.type !== 'CallExpression' && node?.type !== 'OptionalCallExpression') return node;
  const ret = peelZeroArgIifeReturn(node);
  return ret ? unwrapRuntimeExpr(ret) : node;
}

// `globalThis.X` / `globalThis?.X` / `globalThis['X']` / `globalThis[(e++, 'X')]` / `globalThis.self.X`
// -> 'X', else null. `staticMemberKeyName` folds a side-effecting computed key to its static tail so a
// SE-bearing hop / leaf resolves the same as its plain form (the emitter replays / collapse-guards the SE).
// walks intermediate proxy-global links so deeper chains resolve to the leaf key; peels a
// zero-arg IIFE-return at each hop so `(()=>globalThis)().Array` resolves like `globalThis.Array`.
// empty-string key returns null - no real global has empty name; keeps callers' `!== null` sound
// `includeMutatedSlots` opts OUT of the mutated-slot gates for consumers that only NAME the
// slot rather than resolve reads through it - a logical-assign WRITE target is itself the
// mutation site, so gating its classification on the mutation would self-suppress the warn
export function globalProxyMemberName({ node, scope, adapter, path, seen, includeMutatedSlots = false }) {
  node = unwrapRuntimeExpr(node);
  if (node?.type !== 'MemberExpression' && node?.type !== 'OptionalMemberExpression') return null;
  let object = peelProxyGlobalObject(node.object);
  while (object?.type === 'MemberExpression' || object?.type === 'OptionalMemberExpression') {
    const linkName = staticMemberKeyName(object);
    // a mutated hop slot holds the user's replacement - the chain no longer re-enters the
    // global-object surface, so it must not resolve to the leaf global
    if (!linkName || !POSSIBLE_GLOBAL_OBJECTS.has(linkName)
      || (!includeMutatedSlots && isMutatedGlobalSlot(adapter, linkName))) return null;
    object = peelProxyGlobalObject(object.object);
  }
  if (!isProxyGlobalIdentifierNode({ node: object, scope, adapter, path, seen })) return null;
  // a mutated proxy ROOT (`window = fake; window.Promise`) reads through the user's
  // replacement, same as a mutated intermediate hop - the chain must not resolve. aliases
  // decline through the recognizers' own gates (capture order decides what an alias holds,
  // which no span model covers)
  if (!includeMutatedSlots && object?.type === 'Identifier'
    && isMutatedGlobalSlot(adapter, object.name)) return null;
  const leaf = staticMemberKeyName(node) || null;
  // a SLOT-mutated leaf (`globalThis.Map = Shim`) holds the user's replacement - the chain
  // does not name the pristine global, so every READ consumer (pure-ctor swaps, deopts,
  // typing) must fall back to its raw / generic path
  return !includeMutatedSlots && isMutatedGlobalSlot(adapter, leaf) ? null : leaf;
}

// strict: IIFE caller-arg overrides wrapper-default ONLY when it is a bare Identifier the
// static layer can actually CLASSIFY - a known proxy global, a constructor-shaped
// (capitalised) name, or a binding that follows to a proxy global. an UNRESOLVABLE arg
// (lowercase unbound name, local non-global binding) must NOT preempt: the wrapper default
// owns the undefined-arg path, so keeping IT as the synth target leaves the live arg native
// (caller value wins) while the no-arg / undefined-arg call still gets the polyfill -
// preempting with an unresolvable arg dropped the usage entirely.
// the GLOBAL `undefined` arg is special: it makes the runtime apply the parameter default, so
// it is NOT a classifiable receiver. but `undefined` is shadowable - a local binding named
// `undefined` is a real value, so the call-arg DOES override the default in that case. consult
// `adapter.hasBinding` (when scope/adapter are available) to tell global from shadowed; without
// them, treat `undefined` as the global sentinel. `void x` is a UnaryExpression and is
// rejected by the Identifier gate above
export function isClassifiableReceiverArg(node, scope, adapter) {
  if (node?.type !== 'Identifier') return false;
  if (node.name === 'undefined') {
    if (!scope || !adapter) return false;
    return adapter.hasBinding(scope, 'undefined');
  }
  if (POSSIBLE_GLOBAL_OBJECTS.has(node.name) || (node.name[0] >= 'A' && node.name[0] <= 'Z')) return true;
  return !!(scope && adapter) && isProxyGlobalIdentifierNode({ node, scope, adapter });
}

// a fallback-destructure receiver (IIFE call-arg / wrapper RHS) usable in place of the param default:
// a classifiable single receiver OR a CONDITIONAL / LOGICAL whose branches are enumerated per-branch
// downstream (`(({from}=Object) => ...)(c ? Array : Map)`). a non-receiver arg (notably the global
// `undefined`, where the runtime applies the default) is not usable and keeps the default. shared by
// every meta / synth receiver-choice so the call-arg-wins rule never drifts between sites
export function isUsableFallbackReceiverArg(node, scope, adapter) {
  return isClassifiableReceiverArg(node, scope, adapter)
    || node?.type === 'ConditionalExpression' || node?.type === 'LogicalExpression';
}

// permissive: no wrapper-default - accept bare Identifier OR proxy-global MemberExpression
// so `globalThis.X.key` resolves the same as the bare-Identifier IIFE path
export function isExpandedClassifiableReceiver({ node, scope, adapter, path }) {
  if (node?.type === 'Identifier') return true;
  return globalProxyMemberName({ node, scope, adapter, path }) !== null;
}

// mark a synth-swap receiver and all inner sub-nodes as owned by skippedNodes so the
// inner-Identifier visitor doesn't double-fire (orphan import / transform-queue overlap).
// walks through paren / chain / TS wrappers on each `.object` hop too
export function markSynthReceiverSkipped(receiver, skippedNodes) {
  for (const node of subsume(receiver, { form: 'kept-spine', skippableTypes: SKIPPABLE_WRAPPER_TYPES })) skippedNodes.add(node);
}

// skip a synth-swap receiver subtree the literal REPLACES (or DROPS, re-emitting only its harvested
// SE ahead). `markSynthReceiverSkipped` walks the `.object` spine only and stops at a SequenceExpression,
// leaving a prefix's dropped globals (`(gt.x, gt.self).Array`) to inject a dead import (babel) or orphan
// a rewrite into the dead span (text emitter). this skip-marks the WHOLE receiver, then UN-skips the
// harvested-SE subtrees so their own globals still polyfill (empty list = plain replace, nothing kept).
// `walkNode(root, visit)` is the emitter's full-subtree walker (babel `traverseFast`, estree `walkAstNodes`)
export function markReplacedReceiverSkipped({ receiver, keepSe = [], skippedNodes, walkNode }) {
  if (!receiver) return;
  for (const node of subsume(receiver, { form: 'replace', rescueRoots: keepSe, walkNode })) skippedNodes.add(node);
}

// rewire `superMeta.object` from binding name (`MyPromise`) to registered global hint
// (`Promise`) so resolver tables key by the global. pure - caller cache reuse stays safe
export function resolveSuperImportName(injector, superMeta) {
  if (!superMeta?.object || !injector) return superMeta;
  const imp = injector.getPureImport(superMeta.object);
  return imp ? { ...superMeta, object: imp.hint } : superMeta;
}

// remap inherited-static meta while preserving the computed-key sideEffects channel
// (`super[(fn(),'X')]` would otherwise lose `fn()` evaluation on static-dispatch retarget)
// and the symbol-key provenance (`this[Symbol.iterator]` in a static block keeps routing
// through the iterator-method helper after the static-dispatch retarget)
export function remapInheritedStaticMeta(injector, originalMeta, inheritedMeta) {
  if (!inheritedMeta) return null;
  let remapped = resolveSuperImportName(injector, inheritedMeta);
  if (remapped && originalMeta?.sideEffects?.length) remapped = { ...remapped, sideEffects: originalMeta.sideEffects };
  if (remapped && originalMeta?.symbolSourced) remapped = { ...remapped, symbolSourced: true };
  return remapped;
}

// `super.X` in a static method -> static meta on the parent class. peel parens + TS casts
// on the superClass node so `class C extends (Base as typeof Base)` resolves to Base
export function buildSuperStaticMeta(classNode, key, resolveSuperType) {
  if (classNode?.type !== 'ClassDeclaration' && classNode?.type !== 'ClassExpression') return null;
  const superClass = unwrapRuntimeExpr(classNode.superClass);
  if (!superClass) return null;
  const resolved = resolveSuperType(superClass);
  // `inheritedStatic` marks this as a SYNTHETIC static meta for `super.X()` / `this.X()` in a static
  // method - the key is assumed static against the super class. when resolution finds it is actually
  // an INSTANCE-only member (`super.at()` -> Array#at), the consumer bails rather than inject the
  // instance polyfill (over-injection); a real inherited static (`super.from()`) resolves and injects
  return resolved ? { kind: 'property', object: resolved, key, placement: 'static', inheritedStatic: true } : null;
}

// verdict for a container member's key in a REVERSE (last-wins) scan, resolved with the SAME
// canonical `resolveKey` the access uses (so a computed `[CONST]` / `["Promise"]` / `[Symbol.x]`
// resolves): 'match' - this member wins the key; 'bail' - a computed key we can NOT name statically
// may BE propName at this (later) source position and would shadow an earlier literal (mirrors the
// SpreadElement bail); 'skip' - a different named key, or a non-computed unresolvable key
// (PrivateName) that can never collide with a public propName
function memberKeyVerdict(key, computed, scope, propName, adapter, resolveKey) {
  const name = resolveKey({ node: key, computed, scope, adapter });
  if (name === propName) return 'match';
  return name === null && computed ? 'bail' : 'skip';
}

// namespace container = class body (static properties) or object literal - anything we can
// statically look up by name. methods / getters / static blocks skipped (runtime values). iterate
// in REVERSE so the LAST member with the key wins, matching JS runtime semantics: `{ Base: Promise,
// Base: Object }` evaluates `NS.Base` to Object. a method / getter / setter that wins the key is a
// DYNAMIC value, not a static container, so bail on it - consistently on both parsers (babel emits
// ObjectMethod / a non-field ClassMethod, oxc a Property/MethodDefinition carrying `method` or a
// non-`init` kind), else a data+getter duplicate key resolved the earlier data value on babel
// [ObjectMethod skipped] but bailed on oxc [Property matched] -> wrong sub + cross-parser divergence
export function findNamespaceMemberValue(container, propName, scope, adapter, resolveKey) {
  if (container?.type === 'ClassDeclaration' || container?.type === 'ClassExpression') {
    const members = container.body?.body ?? [];
    for (let i = members.length - 1; i >= 0; i--) {
      const m = members[i];
      // a static block runs in source order and may reassign any static via `NS.field = ...`; one at
      // a LATER position than the matched field could redefine its value (the class analog of a
      // trailing object spread) - bail. an earlier block is overridden by the field, so it is
      // reached only after the field already returned and stays irrelevant
      if (m.type === 'StaticBlock') return null;
      if (!m.static) continue;
      const verdict = memberKeyVerdict(m.key, m.computed, scope, propName, adapter, resolveKey);
      if (verdict === 'bail') return null;
      if (verdict === 'skip') continue;
      // a static method / accessor winning the key is dynamic - bail; a static field returns its init
      if (m.type !== 'ClassProperty' && m.type !== 'PropertyDefinition') return null;
      return m.value ?? null;
    }
  } else if (container?.type === 'ObjectExpression') {
    const props = container.properties ?? [];
    for (let i = props.length - 1; i >= 0; i--) {
      const p = props[i];
      // a spread (`{ X: V, ...rest }`) reached in this reverse scan sits AT OR AFTER the matched
      // key, so its statically-unknown contents may redefine the key at runtime - bail. a spread
      // BEFORE the key is reached only after the key already returned, so it stays irrelevant
      if (p.type === 'SpreadElement') return null;
      if (p.type !== 'Property' && p.type !== 'ObjectProperty' && p.type !== 'ObjectMethod') continue;
      const verdict = memberKeyVerdict(p.key, p.computed, scope, propName, adapter, resolveKey);
      if (verdict === 'bail') return null;
      if (verdict === 'skip') continue;
      // a method shorthand / getter / setter winning the key is dynamic - bail; data returns its value
      if (p.type === 'ObjectMethod' || (p.type === 'Property' && (p.method || p.kind !== 'init'))) return null;
      return p.value;
    }
  }
  return null;
}

// shared `super.X` / `this.X` class-walking helpers.
// - `t`: babel/types or estree-compat types
// - `adapter`: scope/binding accessor (polyfillHint for plugin-managed imports)
// - `resolveKey`: provider's key resolver, injected to avoid circular deps via helpers barrel
// - `getInjector`: lazy accessor for the per-file ImportInjector (factory may run before pre())
// caches on the closure - call once per file
export function createClassHelpers({ t, adapter, resolveKey, getInjector = null }) {
  function isClassMember(node) {
    return t.isClassMethod(node) || t.isClassPrivateMethod(node)
      || t.isClassProperty(node) || t.isClassPrivateProperty(node) || t.isClassAccessorProperty(node);
  }

  // arrows are transparent (lexical super/this); non-arrow fns short-circuit except for the
  // ESTree `MethodDefinition.value = FunctionExpression` wrapper. back-fills visited ancestors
  // so sibling walks in the same subtree are amortized O(1)
  let enclosingCache = new WeakMap();

  function backfill(visited, value) {
    for (const n of visited) enclosingCache.set(n, value);
    return value;
  }

  function findEnclosingClassMember(path) {
    const visited = [];
    let prev = path;
    for (let cur = path.parentPath; cur; cur = cur.parentPath) {
      const { node } = cur;
      // a stale path from a replaced subtree has detached ancestors (node === null): no
      // enclosing member is derivable. bail WITHOUT backfilling - live nodes already in
      // `visited` may be reused in the rebuilt tree, and a cached null would poison
      // their fresh revisit
      if (!node) return null;
      if (enclosingCache.has(node)) return backfill(visited, enclosingCache.get(node));
      // computed-key slot AND member decorators evaluate at class-def time in the OUTER scope
      // (this !== the class) - skip the member when prev's node is the key or one of its
      // decorators so `class C { [this.X]() {} }` / `class C { @(this.X) m() {} }` don't resolve
      // `this` to C (mirrors resolveThisAnchor's Decorator bail). skip BEFORE the push so
      // body-side walks reaching the same node fresh resolve to the class context instead of
      // inheriting this walk's outer-null conclusion via the cache
      if (isClassMember(node) && prev
        && ((node.computed && node.key === prev.node) || node.decorators?.includes(prev.node))) {
        prev = cur;
        continue;
      }
      visited.push(node);
      if (isClassMember(node) || t.isStaticBlock(node)) {
        return backfill(visited, {
          classBodyNode: cur.parentPath?.node,
          classNode: cur.parentPath?.parentPath?.node,
          isStatic: !!node.static || t.isStaticBlock(node),
        });
      }
      if (t.isFunction(node) && !t.isArrowFunctionExpression(node)) {
        if (t.isClassMethod(cur.parentPath?.node)) { // ESTree wrapper
          prev = cur;
          continue;
        }
        return backfill(visited, null);
      }
      prev = cur;
    }
    return backfill(visited, null);
  }

  // the ancestor path (inclusive) whose node === `node`, walking up from `from`, or null. used to
  // anchor the usage-pure reassignment proof at the class node rather than the method-nested super site
  function ancestorPathOf(from, node) {
    for (let cur = from; cur; cur = cur.parentPath) if (cur.node === node) return cur;
    return null;
  }

  // find `{ key: binding }` / shorthand `{ key }` in ObjectPattern where value binds to
  // targetName. returns the property key via canonical resolveKey, so a computed `{ [CONST]: x }`
  // resolves too (not just Identifier / StringLiteral)
  function findDestructureKeyForBinding(objectPattern, targetName, scope) {
    for (const p of objectPattern.properties ?? []) {
      if (p.type !== 'Property' && p.type !== 'ObjectProperty') continue;
      const keyName = resolveKey({ node: p.key, computed: p.computed, scope, adapter });
      if (!keyName) continue;
      const value = p.value?.type === 'AssignmentPattern' ? p.value.left : p.value;
      if (value?.type !== 'Identifier' || value.name !== targetName) continue;
      return keyName;
    }
    return null;
  }

  // follow `const X = Y` aliases to the first unshadowed global; null on real local bindings.
  // ES imports pass through for `resolveSuperImportName` to remap via injector's `#byName`.
  // `seen` is shared with `resolveBindingToGlobalName` so namespace-cycle detection survives
  function resolveSuperClassName(startName, scope, seen = new Set(), path = null, classAnchor = null) {
    let name = startName;
    while (!seen.has(name)) {
      seen.add(name);
      // polyfillHint wins: `handleDestructuredProperty` rewrites destructure-with-default
      // shapes in-place, so `binding.path.init` is unrecoverable. plugin adapters expose
      // via binding object; resolver-tier adapter via side-channel
      const hint = adapter.getBinding?.(scope, name)?.polyfillHint
        ?? adapter.getBindingPolyfillHint?.(scope, name);
      if (hint) return hint;
      const binding = scope?.getBinding?.(name);
      // no binding: TS-runtime fallback (`enum X` / `namespace X` / `import X = require()`)
      // anchored on `path` - estree-toolkit's scope tracker misses these
      if (!binding) {
        if (path && adapter.hasBinding?.(scope, name, path)) return null;
        return name;
      }
      // method-aware reassignment bail: usage-global keeps resolving the super-class alias when the
      // reassignment does not dominate the CAPTURE point (init still live); usage-pure resolves only
      // when no reassignment reaches it. the super site is nested in a method, but `extends` evaluates
      // the base at class-definition time - so both modes anchor the proof at the class node
      // (`classAnchor`), letting a reassignment after capture (post-class OR in-method, before the
      // super call) still resolve. fall back to the super site (`path`) only when no anchor was supplied
      if (reassignmentBlocksGlobalResolve({ binding, adapter, path: classAnchor ?? path })) return null;
      const decl = binding.path?.node;
      if (decl?.type === 'ImportDefaultSpecifier' || decl?.type === 'ImportSpecifier'
        || decl?.type === 'ImportNamespaceSpecifier') {
        // pass-through ONLY for injector-registered core-js imports - otherwise `import
        // {fn as Promise} from './local'` would dispatch `super.X` as the global's polyfill
        const injector = getInjector?.();
        if (!injector) return name;
        return injector.getPureImport?.(name) ? name : null;
      }
      if (decl?.type !== 'VariableDeclarator') return null;
      // upstream hops anchor their reassignment proofs at THIS declarator: the capture reads
      // the next binding here, so a reassignment AFTER the capture must not block (one
      // dominance policy with followLocalBindingToProxyGlobal)
      const captureAnchor = binding.path ?? classAnchor ?? path;
      const init = unwrapInitForResolution(decl.init);
      // ObjectPattern: `const { Promise: MyP } = R` -> `const MyP = R.Promise`. unplugin
      // keeps raw destructure; babel-plugin already rewrites it
      if (decl.id?.type === 'ObjectPattern') {
        const keyName = findDestructureKeyForBinding(decl.id, name, scope);
        if (!keyName) return null;
        // a bare proxy-global init short-circuits to the key, and so does a member chain whose
        // LEAF is itself a proxy-global (`globalThis.self.window` re-enters the global surface).
        // any other leaf (`globalThis.Reflect`) names an arbitrary member - short-circuiting
        // there dispatched a vendor slot (`Reflect.Map`) as the pristine global - so it falls
        // to the synthesized-member walk, which applies the hop rules and bails
        if (isProxyGlobalIdentifierNode({ node: init, scope, adapter, path: captureAnchor })
          || POSSIBLE_GLOBAL_OBJECTS.has(globalProxyMemberName({ node: init, scope, adapter, path: captureAnchor }))) return keyName;
        return resolveBindingToGlobalName({
          type: 'MemberExpression',
          object: init,
          property: { type: 'Identifier', name: keyName },
          computed: false,
        }, scope, seen, captureAnchor, captureAnchor);
      }
      if (init?.type === 'Identifier') {
        name = init.name;
        classAnchor = captureAnchor;
        continue;
      }
      // delegate proxy-global / namespace-member chains; share `seen` so namespace-member
      // recursion can't loop
      return resolveBindingToGlobalName(init, scope, seen, captureAnchor, captureAnchor);
    }
    return null;
  }

  // Identifier -> reachable static container (ClassDeclaration / ClassExpression /
  // ObjectExpression via `const X = ...`). seen guards alias cycles
  function bindingContainerValue(name, scope, seen, classAnchor = null) {
    if (seen.has(name)) return null;
    seen.add(name);
    const binding = scope?.getBinding?.(name);
    // method-aware reassignment bail. usage-global resolves the static container regardless (over-
    // inject-safe; its anchor stays null, so dominance can't be proven and the inject-if-maybe-needed
    // bias wins). usage-pure resolves only when no reassignment reaches the class-definition capture
    // point - `classAnchor` (the class node) for the `class C extends NS.Base` path - else bails
    if (!binding || reassignmentBlocksGlobalResolve({ binding, adapter, path: classAnchor })) return null;
    const declNode = binding.path?.node;
    if (declNode?.type === 'ClassDeclaration' || declNode?.type === 'ClassExpression') return declNode;
    // destructured container: `const { sub: NS } = lib` -> NS is `lib.sub`. resolve that member
    // access to its container so a later `NS.X` indexes the inner object. mirrors
    // resolveSuperClassName's ObjectPattern branch, which maps to a global name instead of a container
    if (declNode?.type === 'VariableDeclarator' && declNode.id?.type === 'ObjectPattern') {
      const keyName = findDestructureKeyForBinding(declNode.id, name, scope);
      const init = unwrapInitForResolution(declNode.init);
      if (!keyName || !init) return null;
      return resolveToContainer({
        type: 'MemberExpression',
        object: init,
        property: { type: 'Identifier', name: keyName },
        computed: false,
      }, scope, seen, classAnchor);
    }
    return unwrapInitForResolution(declNode?.init);
  }

  // member-access value lookup: outer -> container, look up leaf property. shared by
  // resolveToContainer (recurses on value) and resolveBindingToGlobalName (maps to global)
  function resolveMemberAccess(memberNode, scope, seen, classAnchor = null) {
    const propName = resolveKey({ node: memberNode.property, computed: memberNode.computed, scope, adapter });
    if (!propName) return null;
    const outer = resolveToContainer(memberNode.object, scope, seen, classAnchor);
    if (!outer) return null;
    return findNamespaceMemberValue(outer, propName, scope, adapter, resolveKey);
  }

  // any expression -> namespace container that `findNamespaceMemberValue` can index by name.
  // handles bare Identifier (lookup), nested member chain (recurse + property lookup), direct
  // container literals. null when no static container is reachable
  function resolveToContainer(node, scope, seen, classAnchor = null) {
    const peeled = unwrapRuntimeExpr(node);
    if (peeled?.type === 'Identifier') return bindingContainerValue(peeled.name, scope, seen, classAnchor);
    if (peeled?.type === 'MemberExpression' || peeled?.type === 'OptionalMemberExpression') {
      const value = resolveMemberAccess(peeled, scope, seen, classAnchor);
      return value ? resolveToContainer(value, scope, seen, classAnchor) : null;
    }
    // direct container - inline `({Promise}).Promise`. rare but free via the same path
    if (peeled?.type === 'ClassExpression' || peeled?.type === 'ObjectExpression') return peeled;
    return null;
  }

  // unified "what global name does this expression resolve to?" primitive. covers Identifier
  // alias chains, proxy-global member chains, user-namespace object literals, static
  // class-as-namespace, and any N-level composition through them. shared `seen` enables
  // mutually-recursive alias cycle detection; `path` anchors TS-runtime shadow checks
  function resolveBindingToGlobalName(node, scope, seen = new Set(), path = null, classAnchor = null) {
    let peeled = unwrapRuntimeExpr(node);
    // a zero-arg IIFE returning the target resolves like the target itself (`class extends
    // (() => globalThis.Array)()`); the hop walk already peels the same shape mid-chain
    if (peeled?.type === 'CallExpression' || peeled?.type === 'OptionalCallExpression') {
      const ret = peelZeroArgIifeReturn(peeled);
      if (ret) peeled = unwrapRuntimeExpr(ret);
    }
    if (peeled?.type === 'Identifier') return resolveSuperClassName(peeled.name, scope, seen, path, classAnchor);
    if (peeled?.type !== 'MemberExpression' && peeled?.type !== 'OptionalMemberExpression') return null;
    const proxyKey = globalProxyMemberName({ node: peeled, scope, adapter, path });
    if (proxyKey !== null) return proxyKey;
    // namespace-member: feed leaf value back through self so deeper chains compose
    const value = resolveMemberAccess(peeled, scope, seen, classAnchor);
    return value ? resolveBindingToGlobalName(value, scope, seen, path, classAnchor) : null;
  }

  // `super.X` and `this.X`-in-static both look up `<SuperClass>.X` on the parent's static
  // surface. provider's `resolveKey` (not staticKeyName) so `super[CONST]` / aliased Symbol.X
  // still resolve
  // `explicitKey` lets a caller resolve `super.<key>` from a path that is INSIDE the static method
  // but is not the `super.<key>` member itself (e.g. the optional-chain deopt check anchors on the
  // trailing instance member's path, which shares the enclosing class + scope). when omitted the key
  // is read off `path.node.property` as usual
  function resolveStaticInheritedMember(path, explicitKey = null) {
    const key = explicitKey
      ?? resolveKey({ node: path.node.property, computed: path.node.computed, scope: path.scope, adapter });
    if (!key) return null;
    const info = findEnclosingClassMember(path);
    if (!info?.isStatic) return null;
    // anchor the reassignment proof at the class node (where `extends` captures the base), not the
    // method-nested super site. the extends clause is the sole evaluation point of the superclass
    // alias, so a reassignment after capture - even one textually before the super call inside a
    // method - cannot change super.X resolution. both modes anchor here: anchoring at the super
    // site instead would wrongly bail on an in-method pre-super reassign (missed polyfill)
    const classAnchor = ancestorPathOf(path, info.classNode);
    // resolve the `extends` superclass in the CLASS scope, not the method-body scope: the extends
    // clause is evaluated where the class is defined, so a method-local shadow (`static m() { const
    // Array = Object; super.from() }`) must not be seen - using the method scope follows the wrong
    // binding and drops the inherited-static polyfill (ie:11). classAnchor is the class node path
    const classScope = classAnchor?.scope ?? path.scope;
    return buildSuperStaticMeta(info.classNode, key,
      superClass => resolveBindingToGlobalName(superClass, classScope, new Set(), classAnchor ?? path, classAnchor));
  }

  let ownNamesCache = new WeakMap();
  function getOwnNames(classBodyNode, kind, scope) {
    let cached = ownNamesCache.get(classBodyNode);
    if (!cached) ownNamesCache.set(classBodyNode, cached = { instance: null, static: null });
    if (cached[kind]) return cached[kind];
    const names = new Set();
    const wantStatic = kind === 'static';
    for (const m of classBodyNode.body) {
      if (isClassMember(m) && !!m.static === wantStatic) {
        // canonical resolveKey (not staticKeyName) so a computed own member `static [CONST]`
        // resolves to its name and correctly shadows `this.<name>`. a well-known-symbol member
        // (key "Symbol.x") is EXCLUDED: its polyfill is self-referential (getIterator dispatches to
        // this[Symbol.iterator]) so an own symbol member is reached, not shadowed - only plain
        // string property names gate the this.X polyfill bail
        const name = resolveKey({ node: m.key, computed: m.computed, scope, adapter });
        if (name && !name.startsWith('Symbol.')) names.add(name);
      }
    }
    cached[kind] = names;
    return names;
  }

  // `this.X` shadowed when class declares own `X` of the matching kind (static / instance).
  // nested non-arrow fn rebinds `this` -> ownership can't be proven there
  function isShadowedByClassOwnMember(path, key) {
    if (typeof key !== 'string') return false;
    const info = findEnclosingClassMember(path);
    if (!info || !t.isClassBody(info.classBodyNode)) return false;
    // resolve computed keys in the CLASS-definition scope (where `[CONST]` is evaluated), not a
    // method-local shadow - mirrors the extends-clause scope choice in resolveStaticInheritedMember
    const classScope = ancestorPathOf(path, info.classNode)?.scope ?? path.scope;
    return getOwnNames(info.classBodyNode, info.isStatic ? 'static' : 'instance', classScope).has(key);
  }

  function reset() {
    enclosingCache = new WeakMap();
    ownNamesCache = new WeakMap();
  }

  // true when `path` lives inside a static method or static block - `this` there is the
  // constructor, so unshadowed `this.X` reads the super class's static surface
  function isInStaticContext(path) {
    return !!findEnclosingClassMember(path)?.isStatic;
  }

  // gates static-inheritance dispatch + instance-fallback bail. peel parens / TS casts on
  // the object so `(this as any).X` / `(super).X` still route to static dispatch. direct
  // type-string checks because estree-compat's `types` doesn't export `isSuper`
  function isInheritedStaticLookup(path) {
    const obj = unwrapRuntimeExpr(path.node.object);
    const objType = obj?.type;
    if (objType === 'Super') return true;
    return objType === 'ThisExpression' && isInStaticContext(path);
  }

  // `const { X } = this` in a static method reads the inherited static surface: the shared
  // destructure funnel resolves it through this hook (same gate + shadow rules as the
  // member remap). both emitters call this factory per file, so the hook re-attaches with
  // helpers closing over per-file state
  adapter.resolveThisStaticHost = function (path, key) {
    if (!isInStaticContext(path) || isShadowedByClassOwnMember(path, key)) return null;
    return resolveStaticInheritedMember(path, key);
  };

  return {
    resolveStaticInheritedMember,
    isInStaticContext,
    isInheritedStaticLookup,
    isShadowedByClassOwnMember,
    reset,
  };
}

// Symbol.iterator `in`-fold canon entry (`Symbol.iterator in x` -> `_isIterable(x)`)
export const IS_ITERABLE_ENTRY = 'is-iterable';
// direct-fetch iterator canon entry (`node[Symbol.iterator]()` -> `_getIterator(node)`)
export const GET_ITERATOR_ENTRY = 'get-iterator';

// the resolution of a symbol-sourced `[Symbol.iterator]` member meta. the pure package has no
// `symbol/instance/iterator` entry (the method form IS the canonical access, dispatched on its
// own), so this constant IS the resolution - both emitters consume it wherever a kind-driven
// gate or an extraction render needs the instance shape, instead of each synthesizing the
// triple locally
export const SYMBOL_ITERATOR_PURE_RESULT = { kind: 'instance', entry: 'get-iterator-method', hintName: 'getIteratorMethod' };

// the `$helper` entries of the pure package that detection resolves to as the EMIT CANON itself
// (`resolveSymbolIteratorEntry` / `resolveSymbolInEntry` + `SYMBOL_ITERATOR_PURE_RESULT`).
// `isEntryNeeded` exempts them from a user `exclude`: filtering the entry must not flip the
// canonical emit to a raw static-symbol read - the helper wraps native lookups and stays correct
// with its polyfill modules filtered. the other `$helper` entries of the package
// (`function/name`, `regexp/flags`) are NOT here: detection resolves those reads to the
// instance-wrapper entries instead, so the plugins never inject them
export const HELPER_CANON_ENTRIES = new Set([
  GET_ITERATOR_ENTRY,
  SYMBOL_ITERATOR_PURE_RESULT.entry,
  IS_ITERABLE_ENTRY,
]);

// `Symbol.hasInstance` -> `symbol/has-instance`. pure string transform - caller must
// validate the entry exists via the resolver. lowercase first char to filter malformed
// inputs (`Symbol.XYZ` -> `symbol/-x-y-z` would silently miss the lookup)
export function symbolKeyToEntry(key) {
  if (!key?.startsWith('Symbol.')) return null;
  const prop = key.slice(7);
  if (!prop || prop[0] < 'a' || prop[0] > 'z') return null;
  return `symbol/${ prop.replaceAll(/[A-Z]/g, c => `-${ c.toLowerCase() }`) }`;
}
