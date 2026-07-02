import knownBuiltInReturnTypes from '@core-js/compat/known-built-in-return-types' with { type: 'json' };
import { subsume } from './subsumption.js';
import {
  FUNCTION_LIKE_NODE_TYPES,
  isVarScopeBoundary,
  memberKeyName,
  peelZeroArgIifeReturn,
  reassignmentBlocksGlobalResolve,
  SKIPPABLE_WRAPPER_TYPES,
  staticMemberKeyName,
  unwrapRuntimeExpr,
  walkAstChildren,
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

// `globalThis` / `self` / `window` etc.
export const POSSIBLE_GLOBAL_OBJECTS = new Set(knownBuiltInReturnTypes.globalProxies);

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
export function isProxyGlobalIdentifierNode({ node, scope, adapter, path, seen }) {
  if (node?.type !== 'Identifier') return false;
  if (!scope || !adapter) return POSSIBLE_GLOBAL_OBJECTS.has(node.name);
  const binding = adapter.getBinding(scope, node.name, path);
  // hint side-channel runs FIRST and independently of scope binding presence: post-rewrite
  // aliases like `_globalThis` are tracked by the injector's global-alias map but may have
  // no entry in babel's scope chain, so the init-follow path never observes them
  const hint = binding?.polyfillHint ?? adapter.getBindingPolyfillHint?.(scope, node.name);
  if (hint) return POSSIBLE_GLOBAL_OBJECTS.has(hint);
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
    ? POSSIBLE_GLOBAL_OBJECTS.has(node.name)
    : followLocalBindingToProxyGlobal(binding, scope, adapter, path, seen);
  if (adapter.hasBinding?.(scope, node.name, path)) return false;
  return POSSIBLE_GLOBAL_OBJECTS.has(node.name);
}

// const-alias chain: `const g = globalThis` -> recurse into the init. reassigned bindings
// bail (the init-time global identity is no longer guaranteed at the use site). two binding
// shapes flow in: (a) detect-usage adapter pre-unwraps the VariableDeclarator onto
// `binding.node`; (b) babelBindingAdapter (in resolve-node-type) passes the raw babel
// binding where `.node` is the bound Identifier and the declarator lives at `.path.node`.
// branch on `node.type` so a single predicate covers both shapes
function followLocalBindingToProxyGlobal(binding, scope, adapter, path, seen) {
  // dominance-aware - ONE reassignment policy with the extends-target gate: a reassignment
  // that cannot reach the binding's READ does not block (the flat `constantViolations` bail
  // dropped a const-captured alias whose upstream source is reassigned only after the capture)
  if (reassignmentBlocksGlobalResolve({ binding, adapter, path })) return false;
  const decl = binding.node?.type === 'VariableDeclarator' ? binding.node : binding.path?.node;
  const init = unwrapInitForResolution(decl?.init);
  if (init?.type !== 'Identifier') return false;
  // the NEXT hop's value is read at THIS declarator - anchor its reassignment proof there
  return isProxyGlobalIdentifierNode({
    node: init, scope: binding.path?.scope ?? scope, adapter, path: binding.path ?? path, seen: new Set(seen).add(binding.node ?? binding),
  });
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
    return isProxyGlobalIdentifierNode({ node, scope, adapter, path: null }) || !!injector?.getPureImport(node.name);
  }
  if (node.type === 'ConditionalExpression') {
    // only the value branches resolve to the alias's runtime value; the `test` is the condition,
    // never a value the alias takes, so it is not a resolution source
    return aliasInitResolvesToGlobal(node.alternate, scope, adapter, injector)
      || aliasInitResolvesToGlobal(node.consequent, scope, adapter, injector);
  }
  if (node.type === 'LogicalExpression' || node.type === 'BinaryExpression') {
    return aliasInitResolvesToGlobal(node.left, scope, adapter, injector)
      || aliasInitResolvesToGlobal(node.right, scope, adapter, injector);
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

// a bare same-name redeclaration (`var { Map: M } = g; var M;`) writes NO value, yet babel
// records its declarator as a constantViolation - a phantom for every value-flow consumer
// (the estree side's recomputed walk records only write shapes, so the emitters diverge).
// filter it so the alias binding-shape guard and the trust predicates see real writes only
export function withoutValuelessDeclarationViolations(violations) {
  if (!violations?.length) return violations;
  const filtered = violations.filter(v => {
    const node = v?.node ?? v;
    return !(node?.type === 'VariableDeclarator' && !node.init);
  });
  return filtered.length === violations.length ? violations : filtered;
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
export function isPolyfillAliasBinding({ info, binding, scope, adapter, injector }) {
  if (info?.source !== null || binding?.path?.node?.type !== 'VariableDeclarator') return false;
  const { init } = binding.path.node;
  const violations = binding.constantViolations ?? [];
  if (init) return !violations.length && aliasInitResolvesToGlobal(init, scope, adapter, injector);
  // duplicate-var SPLIT ANCHOR (`var M; var { Map: M } = g;`): the binding hangs off the bare
  // declarator while the value-writing same-name redeclaration carries the global - accept
  // exactly one writing declarator, alias-shaped (same key-blind receiver-is-global bar as the
  // init arm), with no other real writes
  if (!info.aliasWrite && violations.length === 1) {
    const write = violations[0]?.node ?? violations[0];
    if (write?.type === 'VariableDeclarator') {
      return !!write.init && aliasInitResolvesToGlobal(write.init, scope, adapter, injector);
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
export function maybeRegisterAssignmentAliasWrite({ injector, binding, localName, hint, assignNode, stmtPath }) {
  const bindingNode = binding?.node ?? binding?.path?.node ?? null;
  const scopeSpan = enclosingFunctionSpan(stmtPath);
  if (!assignmentAliasWriteTrusted({ binding, assignNode, stmtPath })) {
    // refused flow-trust: register the binding as GUARDED - its member reads stay native
    injector.registerGlobalAlias(localName, hint, { bindingNode, guarded: true, scopeSpan });
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
export function registerCtorAliasExtractions({ plan, declarator, scope, adapter, injector, path }) {
  if (!plan || plan.aliasGated) return plan;
  plan.aliasGated = true;
  const isAssignmentHost = declarator?.type !== 'VariableDeclarator';
  for (const node of plan.outerProps) {
    for (const e of node.extractions ?? []) {
      if (e.kind !== 'global') continue;
      const binding = adapter.getBinding(scope, e.localName, path);
      if (!binding?.node && !binding?.path) {
        injector.registerGlobalAlias(e.localName, e.hint, { trusted: true });
      } else if (isAssignmentHost) {
        maybeRegisterAssignmentAliasWrite({
          injector, binding, localName: e.localName, hint: e.hint,
          assignNode: { start: declarator.id.start, end: declarator.init.end }, stmtPath: path,
        });
      } else {
        registerDeclAliasIfSound({
          injector, kind: binding?.kind, localName: e.localName, hint: e.hint, stmtPath: path,
          bindingNode: binding?.node ?? binding?.path?.node ?? null, binding,
        });
      }
    }
  }
  return plan;
}

// enumerate TOP-LEVEL `{ GlobalCtor: local }` pairs of a destructure whose source resolves to a
// proxy global - the registerable ctor-alias surface. nested pattern values, defaults and computed
// keys are not ctor aliases (their value is not the global member on every path), so they don't
// register; the array-wrapped form walks one ObjectPattern level under an ArrayPattern
function collectCtorAliasPairs({ pattern, init, scope, adapter, injector }) {
  if (!init || !aliasInitResolvesToGlobal(unwrapInitForResolution(init), scope, adapter, injector)) return [];
  const pairs = [];
  function collectFromObjectPattern(pat) {
    for (const prop of pat.properties ?? []) {
      if ((prop.type !== 'Property' && prop.type !== 'ObjectProperty') || prop.computed) continue;
      const key = prop.key?.name ?? (typeof prop.key?.value === 'string' ? prop.key.value : null);
      if (key && prop.value?.type === 'Identifier') pairs.push({ localName: prop.value.name, hint: key });
    }
  }
  if (pattern?.type === 'ObjectPattern') collectFromObjectPattern(pattern);
  else if (pattern?.type === 'ArrayPattern') {
    for (const el of pattern.elements ?? []) if (el?.type === 'ObjectPattern') collectFromObjectPattern(el);
  }
  return pairs;
}

// pre-pass registration of one destructure-of-global site (assignment or declaration form),
// through the SAME trust gates the render-time registration used - but BEFORE any member visit,
// so a use textually earlier than its write (a hoisted-var read, an earlier-defined closure)
// still resolves the alias table instead of silently missing a registration that happens later
// in visit order. `isKnownGlobal` keeps the table's bar: only resolvable global ctor keys register
export function registerAliasPrePassSite({ pattern, init, declKind, assignNode, scope, adapter, injector, path, isKnownGlobal }) {
  for (const { localName, hint } of collectCtorAliasPairs({ pattern, init, scope, adapter, injector })) {
    if (!isKnownGlobal(hint)) continue;
    const binding = adapter.getBinding(scope, localName, path);
    if (!binding?.node && !binding?.path) {
      injector.registerGlobalAlias(localName, hint, { trusted: true });
    } else if (assignNode) {
      maybeRegisterAssignmentAliasWrite({ injector, binding, localName, hint, assignNode, stmtPath: path });
    } else {
      registerDeclAliasIfSound({
        injector, kind: declKind, localName, hint, stmtPath: path,
        bindingNode: binding?.node ?? binding?.path?.node ?? null, binding,
      });
    }
  }
}

// cheap scope-less gate for the alias pre-pass: does the file contain any destructure whose
// source COULD be a proxy global (assignment with a pattern LHS, or an initialized declarator
// with a pattern id)? most files have neither and skip the scoped traverse entirely
export function hasCtorAliasCandidateShapes(programNode) {
  let found = false;
  const work = [programNode];
  while (work.length && !found) {
    const node = work.pop();
    if (!node || typeof node !== 'object') continue;
    if (node.type === 'AssignmentExpression' && node.operator === '='
      && (node.left?.type === 'ObjectPattern' || node.left?.type === 'ArrayPattern')) found = true;
    else if (node.type === 'VariableDeclarator' && node.init
      && (node.id?.type === 'ObjectPattern' || node.id?.type === 'ArrayPattern')) found = true;
    else walkAstChildren(node, child => work.push(child));
  }
  return found;
}

// a statement placement that provably executes whenever its enclosing function (or module body) runs:
// only plain blocks between the statement and the function/program boundary. any control structure on
// the way (if / loops / try / switch / labeled bodies) makes execution path-dependent -> false.
// the walk starts at the statement's PARENT (the statement node itself - ExpressionStatement /
// VariableDeclaration - is not judged)
const STATEMENT_HOST_TYPES = new Set(['ExpressionStatement', 'VariableDeclaration']);
function unconditionalStatementPlacement(stmtPath, withinNode = null) {
  // callers pass paths at different depths (a declarator, the assignment, its statement) -
  // normalize by climbing to the hosting statement first, judging every EDGE on the way: a
  // conditional expression container (`c ? ({ Map: M } = g) : 0`, `c && ({ Map: M } = g)`) or a
  // function boundary (an expression-body arrow `() => ({ Map: M } = g)`) makes the write run on
  // one branch / an unknown call even though the statement placement itself is unconditional.
  // sequence / call-argument / object- and array-literal / await positions evaluate whenever the
  // statement runs, so they pass through; then judge the statement's ancestors
  let stmt = stmtPath;
  while (stmt && !STATEMENT_HOST_TYPES.has(stmt.node?.type)) {
    const parent = stmt.parentPath;
    const parentType = parent?.node?.type;
    if (parentType && !STATEMENT_HOST_TYPES.has(parentType)) {
      if (FUNCTION_LIKE_NODE_TYPES.has(parentType)) return false;
      if (parentType === 'ConditionalExpression' && parent.node.test !== stmt.node) return false;
      if (parentType === 'LogicalExpression' && parent.node.left !== stmt.node) return false;
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

export function aliasSpanDominatesUse({ info, useStart }) {
  const span = info?.aliasWrite ?? info?.aliasDeclSpan;
  return !span || useStart === null || useStart > span.end;
}

export function registerDeclAliasIfSound({ injector, kind, localName, hint, stmtPath, bindingNode = null, binding = null }) {
  let stmt = stmtPath;
  while (stmt && !STATEMENT_HOST_TYPES.has(stmt.node?.type)) stmt = stmt.parentPath;
  const declSpan = stmt?.node ? { start: stmt.node.start, end: stmt.node.end } : null;
  const scopeSpan = enclosingFunctionSpan(stmtPath);
  if (kind === 'var' && !unconditionalStatementPlacement(stmtPath)) {
    // refused flow-trust (conditional hoisted `var`): the binding's member reads stay native
    injector.registerGlobalAlias(localName, hint, { bindingNode, guarded: true, scopeSpan });
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
  injector.registerGlobalAlias(localName, hint, { bindingNode, declSpan, scopeSpan, verified });
  return true;
}

// does the destructure RHS resolve to the Symbol constructor SPECIFICALLY? `aliasInitResolvesToGlobal`
// pinned to Symbol - accepts a bare `Symbol`, a proxy-global `globalThis.Symbol`, babel's rewritten
// `_Symbol`, and the defaulted-ternary form; rejects any other object
function aliasInitResolvesToSymbol(node, scope, adapter, injector) {
  if (!node) return false;
  if (node.type === 'ConditionalExpression') {
    return aliasInitResolvesToSymbol(node.alternate, scope, adapter, injector)
      || aliasInitResolvesToSymbol(node.consequent, scope, adapter, injector);
  }
  if (node.type === 'LogicalExpression' || node.type === 'BinaryExpression') {
    return aliasInitResolvesToSymbol(node.left, scope, adapter, injector)
      || aliasInitResolvesToSymbol(node.right, scope, adapter, injector);
  }
  const peeled = peelProxyGlobalObject(node);
  if (peeled?.type === 'Identifier') return peeled.name === 'Symbol' || injector?.getPureImport(peeled.name)?.hint === 'Symbol';
  return globalProxyMemberName({ node: peeled, scope, adapter, path: null }) === 'Symbol';
}

// shadow guard for a body-extract Symbol.X destructure alias (`const { iterator } = Symbol`). the
// injector's binding-info is name-keyed (flat), so a NESTED same-name binding queries the outer
// alias's registered source; confirming THIS binding is an un-reassigned ObjectPattern destructure
// whose RHS resolves to Symbol rejects a shadow off another object (`= { iterator: 5 }` / `= Array`)
export function isSymbolDestructureAliasBinding({ info, binding, scope, adapter, injector }) {
  return !!info?.source
    && binding?.path?.node?.type === 'VariableDeclarator'
    && binding.path.node.id?.type === 'ObjectPattern'
    && !binding.constantViolations?.length
    && aliasInitResolvesToSymbol(binding.path.node.init, scope, adapter, injector);
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
export function globalProxyMemberName({ node, scope, adapter, path }) {
  node = unwrapRuntimeExpr(node);
  if (node?.type !== 'MemberExpression' && node?.type !== 'OptionalMemberExpression') return null;
  let object = peelProxyGlobalObject(node.object);
  while (object?.type === 'MemberExpression' || object?.type === 'OptionalMemberExpression') {
    const linkName = staticMemberKeyName(object);
    if (!linkName || !POSSIBLE_GLOBAL_OBJECTS.has(linkName)) return null;
    object = peelProxyGlobalObject(object.object);
  }
  if (!isProxyGlobalIdentifierNode({ node: object, scope, adapter, path })) return null;
  return staticMemberKeyName(node) || null;
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
export function remapInheritedStaticMeta(injector, originalMeta, inheritedMeta) {
  if (!inheritedMeta) return null;
  const remapped = resolveSuperImportName(injector, inheritedMeta);
  return remapped && originalMeta?.sideEffects?.length
    ? { ...remapped, sideEffects: originalMeta.sideEffects } : remapped;
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
        if (isProxyGlobalIdentifierNode({ node: init, scope, adapter, path: captureAnchor })
            || globalProxyMemberName({ node: init, scope, adapter, path: captureAnchor }) !== null) return keyName;
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

  // namespace container = class body (static properties) or object literal - anything we
  // can statically look up by name. methods / getters / static blocks skipped (runtime values)
  // iterate in REVERSE so the LAST member with the key wins, matching JS runtime semantics:
  // `{ Base: Promise, Base: Object }` evaluates `NS.Base` to Object. a method / getter / setter
  // that wins the key is a DYNAMIC value, not a static container, so bail on it - consistently on
  // both parsers (babel emits ObjectMethod / a non-field ClassMethod, oxc a Property/MethodDefinition
  // carrying `method` or a non-`init` kind), else a data+getter duplicate key resolved the earlier
  // data value on babel [ObjectMethod skipped] but bailed on oxc [Property matched] -> wrong sub +
  // cross-parser divergence. a forward scan returned the shadowed first value -> wrong global
  // resolve a container member's key with the SAME canonical `resolveKey` the access uses, so a
  // computed `[CONST]` / `["Promise"]` / `[Symbol.x]` resolves. verdict in this reverse scan:
  // 'match' - this member wins the key; 'bail' - a computed key we can NOT name statically may BE
  // propName at this (later) source position and would shadow an earlier literal (mirrors the
  // SpreadElement bail); 'skip' - a different named key, or a non-computed unresolvable key
  // (PrivateName) that can never collide with a public propName
  function memberKeyVerdict(key, computed, scope, propName) {
    const name = resolveKey({ node: key, computed, scope, adapter });
    if (name === propName) return 'match';
    return name === null && computed ? 'bail' : 'skip';
  }

  function findNamespaceMemberValue(container, propName, scope) {
    if (container?.type === 'ClassDeclaration' || container?.type === 'ClassExpression') {
      const members = container.body?.body ?? [];
      for (let i = members.length - 1; i >= 0; i--) {
        const m = members[i];
        if (!m.static) continue;
        const verdict = memberKeyVerdict(m.key, m.computed, scope, propName);
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
        const verdict = memberKeyVerdict(p.key, p.computed, scope, propName);
        if (verdict === 'bail') return null;
        if (verdict === 'skip') continue;
        // a method shorthand / getter / setter winning the key is dynamic - bail; data returns its value
        if (p.type === 'ObjectMethod' || (p.type === 'Property' && (p.method || p.kind !== 'init'))) return null;
        return p.value;
      }
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
    return findNamespaceMemberValue(outer, propName, scope);
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

  return {
    resolveStaticInheritedMember,
    isInStaticContext,
    isInheritedStaticLookup,
    isShadowedByClassOwnMember,
    reset,
  };
}

// `Symbol.hasInstance` -> `symbol/has-instance`. pure string transform - caller must
// validate the entry exists via the resolver. lowercase first char to filter malformed
// inputs (`Symbol.XYZ` -> `symbol/-x-y-z` would silently miss the lookup)
export function symbolKeyToEntry(key) {
  if (!key?.startsWith('Symbol.')) return null;
  const prop = key.slice(7);
  if (!prop || prop[0] < 'a' || prop[0] > 'z') return null;
  return `symbol/${ prop.replaceAll(/[A-Z]/g, c => `-${ c.toLowerCase() }`) }`;
}
