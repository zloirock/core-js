import { isValidIdentifierName, markRenderedStoredValue, unwrapRuntimeExpr } from './helpers/ast-patterns.js';
// the render canon's node factory - the one place emitted nodes take shape, in the
// canonical ESTree dialect. unplugin inserts these nodes as is; the babel binding converts
// them at the insertion boundary (its `internals/estree-to-babel.js`, total over exactly
// this vocabulary). names mirror @babel/types so the mapping reads at a glance;
// estree-toolkit's builders are not used here because they carry validation weight and no
// `raw` control (quote spelling parity)
import { polyfillOrderComparator, sortByPolyfillOrder } from './plugin-options/inject.js';

export function identifier(name) {
  return { type: 'Identifier', name };
}

// `raw` is the printer's PREFERRED spelling, and only a string needs one from us: esrap
// quotes with `'` by default and babel prints `"`, so a path / key spells its own; every
// other value the printer derives itself, correctly - `JSON.stringify` would not (it THROWS
// on a bigint and answers `null` for NaN / Infinity, a different value than the node holds).
// the domain is what a PARSER can put in a `Literal`:
// negatives never parse into one (`-5` is a unary minus over `5`) and are spelled by
// composition, never smuggled through a Literal - and `-0` both printers would derive from
// the value as `"0"`, a wrong VALUE, so minting any of them throws
export function literal(value) {
  if (typeof value === 'string') return { type: 'Literal', value, raw: JSON.stringify(value) };
  if (typeof value === 'number' && (value < 0 || Object.is(value, -0))) {
    throw new TypeError(`[builders] negative number outside the canonical Literal domain: ${ value }`);
  }
  if (typeof value === 'bigint' && value < 0n) {
    throw new TypeError(`[builders] negative bigint outside the canonical Literal domain: ${ value }n`);
  }
  if (typeof value === 'number' || typeof value === 'bigint' || typeof value === 'boolean' || value === null) {
    return { type: 'Literal', value };
  }
  throw new TypeError(`[builders] value outside the canonical Literal domain: ${ typeof value }`);
}

export function expressionStatement(expression) {
  return { type: 'ExpressionStatement', expression };
}

export function callExpression(callee, args, { optional = false } = {}) {
  return { type: 'CallExpression', callee, arguments: args, optional };
}

export function memberExpression(object, property, { computed = false, optional = false } = {}) {
  return { type: 'MemberExpression', object, property, computed, optional };
}

// a sequence of ONE is that one expression, and building the node anyway leaves a pair of printer
// parens the next pass reparses away - a transform that is not a fixed point over its own output.
// The vocabulary answers it here so no render has to remember: every caller splicing a list it
// cannot count ahead of time (a guard wrapping the writes a prop produced, a prefix lift keeping
// only what is observable) gets the same shape whether the list held one member or several
export function sequenceExpression(expressions) {
  return expressions.length === 1 ? expressions[0] : { type: 'SequenceExpression', expressions };
}

export function variableDeclaration(kind, declarations) {
  return { type: 'VariableDeclaration', kind, declarations };
}

export function variableDeclarator(id, init = null) {
  return { type: 'VariableDeclarator', id, init };
}

export function binaryExpression(operator, left, right) {
  return { type: 'BinaryExpression', operator, left, right };
}

export function logicalExpression(operator, left, right) {
  return { type: 'LogicalExpression', operator, left, right };
}

export function conditionalExpression(test, consequent, alternate) {
  return { type: 'ConditionalExpression', test, consequent, alternate };
}

export function unaryExpression(operator, argument) {
  return { type: 'UnaryExpression', operator, argument, prefix: true };
}

export function chainExpression(expression) {
  return { type: 'ChainExpression', expression };
}

export function voidZero() {
  return unaryExpression('void', literal(0));
}

export function assignmentExpression(operator, left, right) {
  return { type: 'AssignmentExpression', operator, left, right };
}

export function objectExpression(properties) {
  return { type: 'ObjectExpression', properties };
}

export function objectProperty(key, value, { computed = false } = {}) {
  return { type: 'Property', kind: 'init', method: false, shorthand: false, computed, key, value };
}

export function bareImport(path) {
  return { type: 'ImportDeclaration', specifiers: [], source: literal(path), attributes: [] };
}

export function defaultImport(name, path) {
  return {
    type: 'ImportDeclaration',
    specifiers: [{ type: 'ImportDefaultSpecifier', local: identifier(name) }],
    source: literal(path),
    attributes: [],
  };
}

export function bareRequire(path) {
  return expressionStatement(callExpression(identifier('require'), [literal(path)]));
}

export function varRequire(name, path) {
  return variableDeclaration('var', [variableDeclarator(identifier(name), callExpression(identifier('require'), [literal(path)]))]);
}

// a deep clone for node REUSE (a receiver spliced into two slots must not share identity -
// the walkers and the printer's loc pass mutate in place); loc/start/end survive the copy
// so a cloned user node keeps its mapping
export function cloneNode(node) {
  if (Array.isArray(node)) return node.map(item => cloneNode(item));
  if (!node || typeof node !== 'object') return node;
  const out = {};
  // eslint-disable-next-line no-restricted-syntax -- perf: AST hot path, plain objects
  for (const key in node) out[key] = cloneNode(node[key]);
  return out;
}

// --- the injected import set, rendered ---

// the ONE spelling of the injected imports, in the one order both emitters print: globals
// as side-effect imports, pure entries as default-import bindings, the require dialect
// swapping both statement forms. returns { node, key } pairs - `key` is the canonical-order
// key the babel binding's late import-region reorder tracks per node
export function renderInjectedImportNodes({
  globalModules,
  pureEntries,
  importStyle,
  resolve,
  globalPackages = null,
}) {
  const isRequire = importStyle === 'require';
  const rendered = [];
  for (const moduleName of sortByPolyfillOrder(globalModules)) {
    // each global module resolves under the package it was recognised under - the emitter's own
    // for what it injected, the user's for what the scan adopted from the source
    const path = resolve(`modules/${ moduleName }`, globalPackages?.get(moduleName));
    rendered.push({ node: isRequire ? bareRequire(path) : bareImport(path), key: moduleName });
  }
  for (const [source, name] of [...pureEntries].sort(([a], [b]) => polyfillOrderComparator(a, b))) {
    const path = resolve(source);
    rendered.push({ node: isRequire ? varRequire(name, path) : defaultImport(name, path), key: source });
  }
  return rendered;
}

// `__proto__:` in an OBJECT LITERAL is the prototype-setter form, not an own property - a
// synth literal mirroring a `__proto__` pattern key must spell it COMPUTED
// (`['__proto__']:`) so the destructured read gets an OWN property and the literal keeps
// its own prototype; both legs' synth renders ask this one rule
export function synthKeyMustBeComputed(keyNode) {
  if (keyNode?.type === 'Identifier') return keyNode.name === '__proto__';
  const literalish = keyNode?.type === 'Literal' || keyNode?.type === 'StringLiteral';
  return literalish && keyNode.value === '__proto__';
}

// --- host slots: an already-host-dialect subtree riding inside a canonical shell ---

// the wrapper type a binding's own subtree travels under through the canonical renders
export const HOST_SLOT = 'CoreJsHostSlot';

// the unplugin leg's host dialect IS canonical ESTree, so it never mints this wrapper (its
// renders embed the subtree directly); the babel binding wraps each embedded babel subtree
// in a host slot, and its converter unwraps the slot at the insertion boundary, passing the
// subtree through unconverted. the wrapper NEVER survives into an inserted tree
export function hostSlot(node) {
  return { type: HOST_SLOT, node };
}

// --- destructure renders (growing per cluster demand) ---

// the literal spelling of one render-plan entry: the source key node when the prop was
// plain, the resolved plain name when a literal-computed spelling collapsed onto it, the
// computed identifier for a `[k]` slot
export function synthEntryKey({ keyNode, dedupKey, slotKey, lookupKey, computedKey = false }, { resolvedSpelling = false } = {}) {
  // the nested mirror spells the RESOLVED name (`{ Array: { from: _X } }`); the flat
  // literal keeps the source spelling (`['from']: _X` / `[k]: _X`), both the babel shapes
  if (resolvedSpelling) return { key: identifier(lookupKey), computed: false };
  if (keyNode) {
    // a NUMERIC source key respells as its string form in the synth literal (`0:` -> `"0":`,
    // the passthrough reading `Object["0"]`) - both dialects spell such a key their own way
    // (estree `Literal`, babel `NumericLiteral`), and the respelling is what erases that
    if (keyNode.type === 'NumericLiteral' || (keyNode.type === 'Literal' && typeof keyNode.value === 'number')) {
      return { key: literal(String(keyNode.value)), computed: computedKey };
    }
    // ... every other source key is CARRIED, not rebuilt: it is the caller's own node in the
    // caller's own dialect. `fromSource` marks it, and the caller MUST clone before embedding -
    // the node still sits in the source pattern, and one node in two tree positions aliases
    // every later mutation (a span stamp, a key swap, a skip mark) across both
    return { key: keyNode, computed: computedKey, fromSource: true };
  }
  const bracket = /^\[(?<name>[$a-z_][\w$]*)\]$/i.exec(slotKey);
  if (slotKey === dedupKey && bracket) return { key: identifier(bracket.groups.name), computed: true };
  // a FOLDED computed key (an SE prefix, a literal spelling) lands as its string literal,
  // and its passthrough reads back computed with the same literal - the babel spelling
  return { key: literal(lookupKey), computed: false };
}

// the collapsed spelling of a proxy-receiver plan (`planProxyReceiver` holds the decision -
// which hops drop, whether the root is swapped, kept or aliased, where harvested effects
// ride, whether an erased hop's guard re-hangs). `embed` wraps the plan's carried nodes,
// which are in the CALLER's dialect: identity where that dialect is canonical, `hostSlot`
// for the babel binding, whose converter passes such a subtree through unconverted.
// `carrySource`: a render whose caller REPLACES the source subtree embeds the carried nodes
// by IDENTITY instead of cloning - a kept user write (`g = globalThis` riding as harvested SE)
// is the node the scope tracker's violation records point at, and a clone in its place
// stranded those records on the detached original, so every later placement-gated trust ask
// about the alias failed and two identical sources in one file rendered differently. a caller
// whose source STAYS in the tree (a memo re-read target, a synth argument) keeps the clone -
// one node in two tree positions aliases every later mutation across both
export function renderProxyReceiverPlan(plan, { injectImport, embed = node => node, carrySource = false }) {
  const carry = carrySource ? node => node : cloneNode;
  if (plan.kind === 'member') {
    const inner = renderProxyReceiverPlan(plan.inner, { injectImport, embed, carrySource });
    return inner ? memberExpression(inner, embed(carry(plan.property)), { computed: plan.computed }) : null;
  }
  // a `keep` root is carried like an alias - the substrate re-visits it, so its own
  // proxy root still earns the pure rewrite there
  const keepOrAlias = plan.rootBinding.alias ?? plan.rootBinding.keep;
  const rootBinding = keepOrAlias ? embed(carry(keepOrAlias))
    : identifier(injectImport(plan.rootBinding.pure.entry, plan.rootBinding.pure.hintName));
  const rootNode = plan.harvestedSE.length
    ? sequenceExpression([...plan.harvestedSE.map(expr => embed(carry(expr))), rootBinding])
    : rootBinding;
  // dropped-hop KEY effects fold into the surviving leaf key - where the native order
  // evaluates them (after the root and its guard, before the read)
  const keyPrefix = plan.keyPrefixSE ?? [];
  const property = keyPrefix.length
    ? sequenceExpression([...keyPrefix.map(expr => embed(carry(expr))),
      plan.computed ? embed(carry(plan.property)) : literal(plan.property.name)])
    : embed(carry(plan.property));
  const computed = plan.computed || keyPrefix.length > 0;
  return memberExpression(rootNode, property, { computed, optional: !!plan.optional });
}

// a member hop spelled by KEY NAME: a valid identifier reads after a dot, anything else
// reads computed with its string (`_globalThis["App-Key"]`)
export function memberFromKeyName(object, keyName, options = {}) {
  return isValidIdentifierName(keyName)
    ? memberExpression(object, identifier(keyName), options)
    : memberExpression(object, literal(keyName), { ...options, computed: true });
}

// one property of a synthesized literal, keyed by the SLOT NOTATION the synth families use:
// a `[k]` bracket slot replays the binding computed, a plain identifier name reads as itself,
// anything else (a dashed / numeric / dotted name) spells its string
export function synthProperty(key, value) {
  const bracket = /^\[(?<name>[$a-z_][\w$]*)\]$/i.exec(key);
  if (bracket) return objectProperty(identifier(bracket.groups.name), value, { computed: true });
  if (/^[$a-z_][\w$]*$/i.test(key)) return objectProperty(identifier(key), value);
  return objectProperty(literal(key), value);
}

// the SLOT READ off a receiver base: a key the literal spelled as a STRING reads back computed
// with that same string (`"k": recv["k"]`, `"0": recv["0"]`) - a dot form would print different
// source text for the same read, and a numeric / string key has no identifier to spell after a
// dot at all; every other key reads through its resolved name
export function renderSynthSlotRead({ base, key, computed, lookupKey }) {
  // a host-slotted key is the caller's own node passing through - its SPELLING still decides
  const spelled = key.type === HOST_SLOT ? key.node : key;
  const literalKey = !computed && (spelled.type === 'Literal' || spelled.type === 'StringLiteral');
  return memberExpression(base, computed || literalKey ? cloneNode(key) : identifier(lookupKey),
    { computed: computed || literalKey });
}

// --- the short-circuit guard both bindings print ---

// a check safe as a STATEMENT-leading token. only an identifier or `this` can reach a test slot
// bare (a memo-free receiver admits nothing else, and `super` cannot head an optional chain)
function isLeadingIdentLike(node) {
  return node?.type === 'Identifier' || node?.type === 'ThisExpression';
}

// the ONE null-test spelling: an identifier-like check reads `x == null`, anything else puts the
// literal FIRST (`null == (_ref = x)`). the corpus holds both forms, so the rule is a spelling
// canon, not a preference - it was written twice, once per binding, and the two agreed by
// convention rather than by construction. `embed` wraps the carried check for a binding whose
// dialect is not canonical; the SHAPE question is asked of the raw node, so it is asked first
export function nullGuardTest(check, { embed = node => node } = {}) {
  return isLeadingIdentLike(check)
    ? binaryExpression('==', embed(check), literal(null))
    : binaryExpression('==', literal(null), embed(check));
}

// the LITERAL-FIRST spelling as a rule of its own, for a test that may be composed with others:
// a chain is ONE test, and mixing the two forms inside it printed two spellings for one rule. the
// nav-guard channels take this form for a single test too - their test is built to be joinable
export function nullFirstGuardTest(check, { embed = node => node } = {}) {
  return binaryExpression('==', literal(null), embed(check));
}

// a disjunct chain: one check keeps the shape rule, several spell literal-first and fold with `||`
export function composeNullGuardTest(checks, { embed = node => node } = {}) {
  if (!checks?.length) return null;
  if (checks.length === 1) return nullGuardTest(checks[0], { embed });
  return checks
    .map(check => nullFirstGuardTest(check, { embed }))
    .reduce((left, right) => logicalExpression('||', left, right));
}

// the short-circuit itself: a nullish test yields `void 0`, everything else the live branch.
// `test` arrives BUILT (the channels compose their own disjuncts and reuse rendered tests).
// every guard minted here is OUR render, never a user ternary, so the factory marks it: an
// alias whose init lands this shape classifies through the defined branch (the resolve arm
// consults the mark), where an unmarked user conditional of the same spelling must decline
export function renderShortCircuitGuard(test, alternate) {
  return markRenderedStoredValue(conditionalExpression(test, voidZero(), alternate));
}

// the synth value keeps its probe, each side of that probe's effects, and the source fallback.
// a memo spells only its parameter probe inside the body and carries the fallback around the call.
export function renderSynthReceiverGuard({ probe = null, ahead = [], after = [], fallback = null }, value,
  { embed = node => node } = {}) {
  let rendered = after.length ? sequenceExpression([...after.map(node => embed(cloneNode(node))), value]) : value;
  if (probe) rendered = renderShortCircuitGuard(nullFirstGuardTest(probe, { embed: node => embed(cloneNode(node)) }), rendered);
  if (ahead.length) rendered = sequenceExpression([...ahead.map(node => embed(cloneNode(node))), rendered]);
  return fallback ? logicalExpression(fallback.operator, rendered, embed(cloneNode(fallback.right))) : rendered;
}

// the RENDER of an `in`-expression plan (`planInExpression` decides the kind): what each kind
// puts in place, with the leading effects the plan harvested riding ahead of it. the surgery
// stays with the binding - a `swapLeft` result replaces only the LHS, so the RHS keeps the
// visited state its own traversal gave it, and `leadingSe` then wraps what is left standing
export function renderInExpressionPlan(plan, { injectImport, embed = node => node, cloneSource = null }) {
  const leadingSe = plan.leadingSe.map(effect => embed(cloneNode(effect)));
  function withLeadingSe(core) {
    return leadingSe.length ? sequenceExpression([...leadingSe, core]) : core;
  }
  // the membership test stays LIVE (it carries the throw) and the answer follows it
  if (plan.kind === 'fold-after-test') return { replace: sequenceExpression([embed(cloneSource()), literal(true)]) };
  if (plan.kind === 'symbol') {
    const name = injectImport(plan.entry, plan.hint);
    if (!plan.call) return { swapLeft: identifier(name), leadingSe };
    function helperCall() {
      return callExpression(identifier(name), [embed(cloneNode(plan.right))]);
    }
    // the realm-guarded spelling: one identity branch per realm the receiver was written with
    // answers the helper, innermost-last, and the source test is what a receiver matching none of
    // them falls through to (`realm === _globalThis ? _isIterable(x) : realm.Symbol.iterator in x`).
    // the operand is spelled again in each branch - a bare identifier by the plan's own gate - and
    // the raw branch's own `Symbol` read stays a read off a written binding, which the member
    // census recognises as the alternate of an emitted guard and leaves alone
    if (plan.realmGuard) {
      const guarded = plan.realmGuard.realms.reduceRight((alternate, realm) => conditionalExpression(
        binaryExpression('===', embed(cloneNode(plan.realmGuard.receiver)), identifier(injectImport(realm.entry, realm.hintName))),
        helperCall(),
        alternate,
      ), embed(cloneSource()));
      return { replace: withLeadingSe(guarded) };
    }
    // the helper CONSUMES the operand the way `in` did - it throws on a nullish one, and that
    // CALL is the node that throws. it sits at the TAIL when leading effects wrap it: a
    // binding marking the whole replacement would mark the sequence, and the reader - which asks
    // the node it is about to lift a guard out of - would never see the mark
    return { replace: withLeadingSe(helperCall()), throwsAtTail: true };
  }
  // the polyfill is always defined, so the membership test is constantly true
  return { replace: withLeadingSe(literal(true)) };
}

// the alias-held claim PROBE read (`aliasHeldClaimProbe` decides there is one): the claim's own
// member spelled verbatim off the alias binding, the dotted run between them respelled with it -
// the source's own computed flag decides the spelling, not the key's validity, because the probe
// reproduces a read the source performs
export function renderAliasHeldProbeRead(probe, object) {
  const base = (probe.innerKeys ?? []).reduce((acc, key) => memberFromKeyName(acc, key), object);
  return probe.computed
    ? memberExpression(base, literal(probe.key), { computed: true })
    : memberExpression(base, identifier(probe.key));
}

// the render half of `planKeptSequenceTail`: the tail folds onto its outermost hop's own ponyfill,
// and a plan that keeps the environment PROBE wraps it in the short-circuit guard (`null == <probe>
// ? void 0 : _self`), so the test reads at most the probe hop and never dereferences past it
export function renderKeptSequenceTail(plan, { injectImport, embed = node => node }) {
  const value = identifier(injectImport(plan.pure.entry, plan.pure.hintName));
  return plan.probe ? renderShortCircuitGuard(nullFirstGuardTest(plan.probe, { embed }), value) : value;
}

// the nav-collapse LEAF: the collapsed run answers with its pure binding, wrapped in the leaf's
// own live key effects - the share the guard test already spelled stays out of it, that prefix
// evaluated there (`(c++, _self)`). an already-embedded root prefix runs before those key effects
// in the SAME sequence. `cloneHost` lifts the source's key-effect nodes into the render.
export function renderNavCollapseLeaf(plan, pureId, { cloneHost = node => node, prefix = [] } = {}) {
  const keySe = plan.liveKeySeExprs().slice(plan.testKeySeCount).map(expr => cloneHost(expr));
  return prefix.length || keySe.length ? sequenceExpression([...prefix, ...keySe, pureId]) : pureId;
}

// ... and the TAIL the collapse did not absorb, hung back on in the SOURCE's own spelling: a
// computed hop stays computed, a named one takes the key-name spelling, and a live `?.` rides
// where the source wrote it. it hangs off the LEAF, never off a whole guard - there it would
// read the short-circuited `void 0` instead of the ponyfill
export function renderNavCollapseTail(plan, base, { cloneHost = node => node } = {}) {
  let built = base;
  for (const hop of plan.hops.slice(plan.collapseIdx + 1)) {
    built = hop.node.computed
      ? memberExpression(built, cloneHost(hop.node.property), { computed: true, optional: !!hop.liveOptional })
      : memberFromKeyName(built, hop.name, { optional: !!hop.liveOptional });
  }
  return built;
}

// the chain continuation a hoisted narrow guard absorbs, rebuilt over the guarded value. every step
// lands PLAIN except a call, which keeps the `?.` the source wrote on it - the guard answers the
// receiver's short-circuit, the call's own is still the source's. the host nodes are cloned by the
// leg (`cloneHost`); a call's ARGUMENTS ride by identity, so their own claims stay live
export function renderGuardedChainTail(tail, base, { cloneHost = node => node, cloneCall }) {
  let built = base;
  for (const step of tail) {
    built = step.type === 'CallExpression' || step.type === 'OptionalCallExpression'
      ? cloneCall(step, built)
      : memberExpression(built, cloneHost(step.property), { computed: step.computed });
  }
  return built;
}

// the guard TEST a resolvable base supplies (`navGuardTestBase` decides there IS one): the probe
// hop read off the ponyfilled base, with a kept root write riding ahead of it in a sequence
// (`(w = _globalThis, _self).window`) - the write is the source's own act and evaluates first
export function renderNavGuardTestBase(base, { rootAssign = null, injectImport, embed = node => node }) {
  const pure = identifier(injectImport(base.basePure.entry, base.basePure.hintName));
  const root = rootAssign ? sequenceExpression([embed(cloneNode(rootAssign)), pure]) : pure;
  return memberExpression(root, identifier(base.probeName));
}

// the RAW branch of that narrow where the read is a CALLEE: a conditional in callee position is
// invoked with `this === undefined`, so the raw arm rebinds the receiver it was read off. both
// operands arrive already embedded - the binding clones its own host nodes
export function renderBoundRawBranch(read, recv) {
  return callExpression(memberExpression(read, identifier('bind')), [recv]);
}

// the capture a guarded narrow reads its receiver through: the memo is written first and every branch
// above it reads that ONE value. spelled here rather than by each leg, because what it wraps is either
// the bare narrow or a whole hoisted short-circuit over it
export function renderCapturedReceiver(recv, value, built) {
  return sequenceExpression([assignmentExpression('=', recv, value), built]);
}

// the runtime CTOR-IDENTITY narrow: one branch per candidate constructor, innermost-last, each
// testing the receiver against that ctor and yielding its static ponyfill; `rawBranch` is what a
// receiver matching none of them falls through to. the DECISION - which ctors are candidates and
// in what order - is the shared plan's; this spells it. `spellRecv` mints the test's receiver read
// per binding (the babel leg marks its clone handled on the way out).
// `invoke` clones the host invocation around each callee when the plan moves a call into
// its branches; its second argument says whether that callee is the RAW one, the only branch an
// absorbed `?.()` keeps its short-circuit in - the pure entry is always callable, so its branch
// spells a plain call. Arguments remain live for later transformation; only one branch executes.
// `captureReceiver`, where the plan has one, is the receiver VALUE the branches read through: the
// memo is written first and the whole narrow rides inside that sequence.
// every branch is spelled by EITHER a pure entry or a name, and that is the plan's own invariant:
// `planGuardedStaticNarrow` builds candidates only from truthy names, so neither slot is ever
// empty here. a branch carrying neither would mint a nameless identifier and print `undefined`
export function renderCtorIdentityNarrow(plan, rawBranch, { injectImport, spellRecv, captureReceiver = null, invoke = node => node }) {
  if (plan.instanceFallback?.kind === 'instance') {
    const pure = plan.instanceFallback;
    rawBranch = callExpression(identifier(injectImport(pure.entry, pure.hintName)), [spellRecv()]);
    if (plan.isCallee) rawBranch = renderBoundRawBranch(rawBranch, spellRecv());
  }
  const guard = plan.branches.reduceRight((alternate, branch) => conditionalExpression(
    binaryExpression('===', spellRecv(), branch.ctorRealmPure
      ? memberExpression(identifier(injectImport(branch.ctorRealmPure.entry, branch.ctorRealmPure.hintName)), identifier(branch.ctorName))
      : identifier(branch.ctorPure ? injectImport(branch.ctorPure.entry, branch.ctorPure.hintName) : branch.ctorName)),
    invoke(identifier(injectImport(branch.staticPure.entry, branch.staticPure.hintName)), false),
    alternate,
  ), invoke(rawBranch, true));
  return captureReceiver ? renderCapturedReceiver(spellRecv(), captureReceiver, guard) : guard;
}

// the `(ref = <dispatcher call>) === void 0 ? <default> : ref` guard for an instance
// extraction carrying a user default: the dispatcher may return undefined on a foreign
// receiver (its own-property read), so the default stays LIVE - polyfill-always-wins covers
// only always-defined static/global bindings. every operand arrives ALREADY embedded (the
// leg clones and wraps its host nodes); this spells the ONE guard shape both legs print
export function renderInstanceDefaultGuard({ assignedRef, call, defaultValue, reread, defaultName = null }) {
  const source = unwrapRuntimeExpr(defaultValue?.type === HOST_SLOT ? defaultValue.node : defaultValue);
  // Moving an anonymous default into a conditional must preserve the binding's inferred name.
  if (defaultName && (source?.type === 'ArrowFunctionExpression'
    || ((source?.type === 'FunctionExpression' || source?.type === 'ClassExpression') && !source.id))) {
    defaultValue = memberExpression(objectExpression([
      objectProperty(literal(defaultName), defaultValue, { computed: synthKeyMustBeComputed(literal(defaultName)) }),
    ]), literal(defaultName), { computed: true });
  }
  return conditionalExpression(
    binaryExpression('===', assignmentExpression('=', assignedRef, call), voidZero()),
    defaultValue,
    reread,
  );
}

// A sole computed-key extraction captures the initializer before the key runs. The
// dispatch owns the single property read; keeping a sentinel would read that slot twice.
// Both bindings pass embedded source nodes and their already-built default guard.
export function renderKeyedDestructureRead({ receiverName, receiver, binding, keys, read, storeReceiver = false }) {
  const value = conditionalExpression(
    nullFirstGuardTest(identifier(receiverName)),
    memberExpression(identifier(receiverName), literal(''), { computed: true }),
    keys.length ? sequenceExpression([...keys, read]) : read,
  );
  return [
    ...storeReceiver ? [] : [variableDeclarator(identifier(receiverName), receiver)],
    variableDeclarator(binding, storeReceiver
      ? sequenceExpression([assignmentExpression('=', identifier(receiverName), receiver), value]) : value),
  ];
}

// the static twin: the read needs no memo (an import binding or a plain ref re-reads for
// free), so the guard tests it directly - `<read> === void 0 ? <default> : <reread>`.
// `alwaysDefined`: the read is the polyfill's own import binding, which the guard can never see
// undefined - the user's default is dead text there and the value is the binding alone
// (`const { from: F = fb } = Array` -> `const F = _Array$from`), on both legs alike
export function renderStaticDefaultGuard({ read, defaultValue, reread, alwaysDefined = false }) {
  if (alwaysDefined) return reread;
  return conditionalExpression(binaryExpression('===', read, voidZero()), defaultValue, reread);
}
