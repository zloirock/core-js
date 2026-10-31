import {
  isValidIdentifierName,
  PRIMITIVE_LITERAL_TYPES,
  markGeneratedMemoDeclarator,
  markRenderedStoredValue,
  markRenderedProbeRead,
  callArgumentMayBeObserved,
  callResultIsChainBase,
  classifyReceiverSE,
  isReusableReceiver,
  isMemberAccessNode,
  mayHaveSideEffects,
  optionalCallReceiverGuard,
  observableSequenceElements,
  peelNestedSequenceExpressions,
  subtreeContainsNode,
  noteRenderRetiredWrites,
  unwrapRuntimeExpr,
} from './helpers/ast-patterns.js';
import { symbolStaticMeta } from './detect-usage/globals.js';
import { polyfillOrderComparator, sortByPolyfillOrder } from './plugin-options/inject.js';

// the render canon's node factory - the one place emitted nodes take shape, in the
// canonical ESTree dialect. unplugin inserts these nodes as is; the babel binding converts
// them at the insertion boundary (its `internals/estree-to-babel.js`, total over exactly
// this vocabulary). names mirror @babel/types so the mapping reads at a glance;
// estree-toolkit's builders are not used here because they carry validation weight and no
// `raw` control (quote spelling parity)
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

export function blockStatement(body) {
  return { type: 'BlockStatement', body };
}

export function callExpression(callee, args, { optional = false } = {}) {
  return { type: 'CallExpression', callee, arguments: args, optional };
}

export function memberExpression(object, property, { computed = false, optional = false } = {}) {
  return { type: 'MemberExpression', object, property, computed, optional };
}

// The served read is the condition; only the source fallback writes the native target.
// Receiver and computed key run before dispatch, once, and a failed lookup reuses the
// captured receiver with the proven key. The live target wrappers and RHS move unchanged.
// Bindings install receiver/property in that target before inserting the expression.
export function renderLogicalSlotPatch({ host, operator, receiverMemo, pure, key, computed, keyNode }, {
  injectImport, cloneReceiver, mintRef, embed = node => node,
}) {
  const helper = identifier(injectImport(pure.entry, pure.hintName));
  const memo = renderReceiverMemo(receiverMemo, {
    mintRef,
    embed: (node, role) => embed(role === 'receiver' ? cloneReceiver(node) : node),
  });
  const read = computed ? sequenceExpression([memo.firstRead, embed(keyNode), memo.makeBase()]) : memo.firstRead;
  return {
    receiver: memo.makeBase(),
    property: computed ? literal(key) : embed(keyNode),
    expression: logicalExpression(operator, callExpression(helper, [read]), assignmentExpression('=', embed(host.left), embed(host.right))),
  };
}

// A selected extraction receiver has one root (source or pure binding) followed by named keys.
// Source embedding and import allocation belong to the binding; neither chooses a different read.
export function renderNestedExtractionReceiver({ node, pure, keys }, { embed, importPure }) {
  return keys.reduce(memberFromKeyName, pure ? importPure(pure) : embed(node));
}

// One ordinary method invocation, after entry selection and any enclosing guard. The first
// receiver owns its source prefix; harvested effects outside it precede that read, and key
// effects follow it. Only a stable tail can be read again for lookup / this. A capture with
// no intervening key lives in the lookup argument; otherwise it precedes the key effects.
// `prepared` means an upstream lookup already owns the receiver capture (identity / symbol
// branches); `methodGuarded` means that enclosing code has already excluded a nullish method.
// This query never clones, imports, allocates refs or marks claims. Its source
// slots and ctx belong to this synchronous question; apply must retain the read's frame and
// register a newly allocated ref before asking any subsequent scope question about it.
export function planMethodCall({
  receiver, sourceReceiver = receiver, sideEffects = [], receiverEffectCount = 0,
  prepared = false, methodGuarded = false, args = [], optional = false, callPath = null, ctx = null,
}) {
  const effects = sideEffects ?? [];
  const keyEffects = effects.slice(receiverEffectCount);
  const memo = !prepared && planReceiverMemo(receiver, { interveningEffects: keyEffects.length > 0, ctx });
  const tail = memo ? memo.receiver : receiver;
  const reusable = !memo?.capture;
  return {
    firstReceiver: receiver,
    receiver: tail,
    lookupReceiver: reusable && keyEffects.length ? tail : receiver,
    capture: reusable ? null : keyEffects.length ? 'before-key' : 'lookup',
    prefixEffects: classifyReceiverSE(sourceReceiver, false, effects) === 'peel' ? []
      : effects.slice(0, receiverEffectCount).filter(effect => !subtreeContainsNode(sourceReceiver, effect)),
    firstReadEffects: reusable && keyEffects.length
      ? observableSequenceElements([receiver], ctx, { preserveSourceReads: true }) : [],
    keyEffects,
    args,
    optional,
    continues: optional && callResultIsChainBase(callPath),
    methodGuarded,
    ctx,
  };
}

// The optional method's receiver is tested either at its value, at an earlier live
// link, or only by the method read itself. Sealed links keep their native throw.
// Ask after applying any proven receiver substitution, before allocating its capture.
// A stable tail needs no capture, but its prefix still runs in the first receiver read.
// Key effects can invalidate an otherwise adjacent reread; super reads its home object
// but invokes on this and can never be captured as a value. An adjacent optional result
// can carry a served method's optional invocation; raw lookups keep their own guard.
// These are source-local facts: no imports, refs, claims or tree changes on a query.
// The host retains the source slots and applies this answer synchronously in their frame.
export function planOptionalMethodCall({ callee, receiver = callee.object, call = null, continuation = null, ctx = null }) {
  const interveningEffects = !!callee.computed && mayHaveSideEffects(callee.property, ctx);
  const memo = planReceiverMemo(receiver, { interveningEffects, ctx });
  const superReceiver = unwrapRuntimeExpr(memo.receiver)?.type === 'Super';
  return {
    ...memo,
    receiverGuard: optionalCallReceiverGuard(callee),
    capture: !superReceiver && memo.capture,
    superReceiver,
    interveningEffects,
    compactMethod: !!call?.optional && isMemberAccessNode(continuation) && !!continuation.optional
      && unwrapRuntimeExpr(continuation.object) === call,
  };
}

// A missing method must reject the CALL after its arguments, not the preceding `.call` read.
// Zero boxes without throwing and has no call method; falsy non-callables reject at the same point.
// Optional calls retain the nullish short-circuit. Quiet arguments need no timing repair.
function renderMethodCallMember(method, { optional = false, methodGuarded = false, args = [], ctx = null } = {}) {
  const base = !optional && !methodGuarded && args.some(argument => callArgumentMayBeObserved(hostSlotNode(argument), ctx))
    ? logicalExpression('||', method, literal(0)) : method;
  // The argument's own claim may later replace an observable lookup with a pure import.
  if (base !== method) base.extra = { corejsMethodCallGuard: true };
  return memberExpression(base, identifier('call'), { optional });
}

// Apply one call decision, including its first receiver, capture, key effects and invocation.
// `lookup` is an already prepared method value; otherwise `helper` reads the chosen receiver.
// A sealed lookup may carry its enclosing guard in `lookupGuard`, without guarding the arguments.
// Host hooks only embed source slots, allocate/register refs and register the generated write.
// `embed` roles distinguish a moved capture from repeated receiver reads, effects and arguments:
// Babel must not retire a source write merely because its first receiver moves into a memo.
// All slots are read at apply time; nested claims stay live. `chain` seals a callee-optional
// invocation only where the host has no continuing chain around it.
export function renderMethodCall(plan, {
  helper, lookup = null, lookupGuard = null, chain = true, leadingEffects = [],
  mintRef, embed = node => node, recordCapture = node => node,
}) {
  // A stable whole receiver under the lookup guard needs no duplicate pre-key read.
  // A prefixed first read still owns work that its stable tail does not perform.
  const firstReadEffects = lookupGuard && plan.firstReceiver === plan.receiver ? [] : plan.firstReadEffects;
  const effects = [...leadingEffects ?? [], ...plan.prefixEffects, ...firstReadEffects].map(node => embed(node, 'effect'));
  let receiver;
  if (lookup) {
    receiver = embed(plan.receiver, 'receiver');
  } else {
    let lookupArg;
    if (plan.capture) {
      const ref = mintRef();
      receiver = identifier(ref);
      const capture = recordCapture(assignmentExpression('=', identifier(ref), embed(plan.firstReceiver, 'capture')));
      if (plan.capture === 'lookup') lookupArg = capture;
      else {
        effects.push(capture);
        lookupArg = identifier(ref);
      }
    } else {
      lookupArg = embed(plan.lookupReceiver, 'lookup');
      receiver = embed(plan.receiver, 'receiver');
    }
    lookup = callExpression(helper, [lookupArg]);
  }
  effects.push(...plan.keyEffects.map(node => embed(node, 'effect')));
  if (lookupGuard) {
    lookup = renderShortCircuitGuard(lookupGuard, effects.length ? sequenceExpression([...effects, lookup]) : lookup);
    effects.length = 0;
  }
  // Keep an optional call connected to its source continuation after lifting key effects.
  if (plan.continues && effects.length) {
    lookup = sequenceExpression([...effects, lookup]);
    effects.length = 0;
  }
  const args = [receiver, ...plan.args.map(node => embed(node, 'argument'))];
  const call = callExpression(renderMethodCallMember(lookup, plan), args);
  const result = plan.optional && chain ? chainExpression(call) : call;
  return effects.length ? sequenceExpression([...effects, result]) : result;
}

// Apply a symbol-root decision without losing source effect identities in the
// existing harvest. Only newly embedded slots are cloned by the host; nested
// claims in the kept receiver remain available to its native traversal.
export function renderSymbolReceiverRoot(plan, { injectImport, embed = node => node }) {
  const root = plan.pure ? identifier(injectImport(plan.pure.entry, plan.pure.hintName)) : embed(plan.receiver);
  return {
    receiver: plan.receiverEffects.length
      ? sequenceExpression([...plan.receiverEffects.map(embed), root]) : root,
    sideEffects: plan.prefixEffects.length
      ? [...plan.prefixEffects.map(embed), ...plan.sideEffects] : plan.sideEffects,
    receiverEffectCount: plan.receiverEffectCount,
    optional: plan.optional,
  };
}

// Apply an effect-order decision. A native preparation may already supply the
// receiver memo; otherwise the shared capture renderer allocates it here. Effects
// outside the captured source precede it, and key effects always follow that read.
// `leadingCapture` borrows the first effect when that minted write can move into a
// guard. Prepared checks own the guard instead; the write stays in their live branch.
// The role is valid for this synchronous apply only; moving it removes that effect,
// while cloning the product must clone the role and its effect as the same node.
export function renderReceiverEffects(plan, { memo = null, ...hooks } = {}) {
  const embed = hooks.embed ?? (node => node);
  if (!plan.ordered && !plan.capture) {
    return {
      receiver: embed(plan.receiver, 'receiver'),
      effects: plan.effects?.map(node => embed(node, 'effect')),
      leadingCapture: null,
    };
  }
  memo ??= renderReceiverMemo(plan, hooks);
  const { prefix, tail } = peelNestedSequenceExpressions(hostSlotNode(memo.firstRead));
  const firstRead = prefix.length ? [...prefix, tail].map(node => embed(node, 'effect')) : [memo.firstRead];
  return {
    receiver: memo.makeBase(),
    effects: [
      ...plan.prefixEffects.map(node => embed(node, 'effect')),
      ...firstRead,
      ...plan.keyEffects.map(node => embed(node, 'effect')),
    ],
    leadingCapture: plan.prefixEffects.length || plan.disjuncts ? null : memo.capture ?? null,
  };
}

// The first receiver read owns its prefix and optional capture; later reads use only
// the captured value or the proven stable tail. The host registers a capture before
// any subsequent scope query; embedding gives repeated base reads distinct identities.
// `capture` names the allocated write itself, or null; it borrows `firstRead` identity.
export function renderReceiverMemo({ firstReceiver, receiver = firstReceiver, capture }, {
  mintRef, embed = node => node, recordCapture = node => node,
}) {
  const name = capture ? mintRef() : null;
  const firstRead = name
    ? recordCapture(assignmentExpression('=', identifier(name), embed(firstReceiver, 'capture')))
    : embed(firstReceiver, 'lookup');
  return {
    firstRead,
    capture: name ? firstRead : null,
    makeBase: () => embed(name ? identifier(name) : receiver, 'receiver'),
  };
}

// Decide the first and repeated reads of a prepared receiver. Only its sequence tail
// is repeated; the prefix remains in the first read even when no capture is needed.
// This query retains source identity and never allocates refs or changes the tree.
export function planReceiverMemo(receiver, { interveningEffects = false, directCallee = false, ctx = null } = {}) {
  const { prefix, tail } = peelNestedSequenceExpressions(receiver);
  const value = prefix.length ? tail : receiver;
  return { firstReceiver: receiver, receiver: value,
    capture: !isReusableReceiver(value, { interveningEffects, directCallee, ctx }) };
}

// A receiver guard owns the first read and leaves key effects in its live branch. A sealed
// method lookup leaves invocation arguments outside that branch; a whole-call helper instead
// receives the guarded value and keeps its own nullish rejection. Prepared navigation supplies
// its existing checks and receiver. All choices are shared; hooks only bind live source slots.
export function renderGuardedMethodCall(plan, {
  helper, guard = null, invoke = true, sealed = false, chain = true,
  mintRef, embed = node => node, recordCapture = node => node,
}) {
  const memo = !guard && renderReceiverMemo({ ...plan, capture: !!plan.capture }, { mintRef, embed, recordCapture });
  const prefix = !guard && plan.prefixEffects.map(node => embed(node, 'effect'));
  const checks = guard ? guard.checks : [prefix.length ? sequenceExpression([...prefix, memo.firstRead]) : memo.firstRead];
  const makeBase = guard ? () => embed(guard.receiver, 'receiver') : memo.makeBase;
  const effects = plan.keyEffects.map(node => embed(node, 'effect'));
  const test = sealed ? composeNullGuardTest(checks) : null;
  const value = sealed && !invoke && test ? sequenceExpression([...effects, makeBase()]) : makeBase();
  const lookup = callExpression(helper, [sealed && !invoke && test ? renderShortCircuitGuard(test, value) : value]);
  const lookupEffects = sealed && (invoke || test) || invoke && plan.continues;
  const built = invoke ? renderMethodCall({
    ...plan, receiver: makeBase(), prefixEffects: [], firstReadEffects: [],
    keyEffects: lookupEffects ? effects : [], args: plan.args.map(node => embed(node, 'argument')),
  }, { lookup, lookupGuard: sealed ? test : null, chain }) : lookup;
  // A proved-empty guard uses the ordinary effect prefix; only a live sealed guard
  // keeps a consumed lookup's effects inside the helper's receiver argument.
  return { checks: sealed ? [] : checks, built: !lookupEffects && effects.length ? sequenceExpression([...effects, built]) : built };
}

// Split an optional method invocation into ordered null checks and its live continuation.
// A served lookup folds an untested receiver capture into its argument; a raw lookup keeps
// the capture ahead of the member read, including that read's own optional receiver guard.
// An adjacent optional result can carry a served method's guard without a method memo.
// `guard` is an already rendered receiver guard (for navigation); `checks` are earlier links.
// Hooks only clone source slots, allocate/register refs and retain host provenance. Arguments
// are read here, after child rewrites, and the returned call uses the ordinary call canon.
export function renderOptionalMethodCall(plan, {
  callee, args, helper = null, guard = null, checks = [],
  mintRef, embed = node => node, recordCapture = node => node, recordLookup = node => node,
}) {
  const memo = !guard && renderReceiverMemo(plan, {
    mintRef: () => mintRef('receiver'), embed,
    recordCapture: node => recordCapture(node, 'receiver'),
  });
  const receiver = guard ? () => embed(guard.receiver, 'receiver')
    : plan.superReceiver ? () => ({ type: 'ThisExpression' }) : memo.makeBase;
  const firstRead = memo?.firstRead;
  const testsReceiver = !!helper && plan.receiverGuard === 'value';
  let lookup = helper
    ? callExpression(helper, [guard || testsReceiver ? receiver() : firstRead])
    : memberExpression(guard || plan.capture ? receiver() : firstRead, embed(callee.property, 'key'),
      { computed: callee.computed, optional: !guard && !!callee.optional });
  if (!helper && !guard && callee.optional) lookup = chainExpression(lookup);
  lookup = recordLookup(lookup);
  const disjuncts = [...checks, ...guard ? guard.checks : testsReceiver ? [firstRead] : []];
  const compact = !!helper && plan.compactMethod;
  let methodCheck = null;
  if (!compact) {
    const methodName = mintRef('method');
    methodCheck = recordCapture(assignmentExpression('=', identifier(methodName), lookup), 'method');
    if (!helper && !guard && plan.capture) methodCheck = sequenceExpression([firstRead, methodCheck]);
    disjuncts.push(methodCheck);
    lookup = embed(identifier(methodName), 'method');
  }
  const call = renderMethodCall(planMethodCall({
    receiver: receiver(), prepared: true, methodGuarded: !compact, optional: compact,
    args: args.map(node => embed(node, 'argument')),
  }), { lookup });
  return { disjuncts, receiver: call, methodCheck };
}

// After claims settle, remove guards whose observable arguments became plain values.
export function settleMethodCallGuard(call) {
  const member = unwrapRuntimeExpr(call.callee);
  const guard = member?.object;
  if (!guard?.extra?.corejsMethodCallGuard || member.computed || member.property?.name !== 'call') return;
  if (call.arguments.slice(1).every(argument => !callArgumentMayBeObserved(argument))) {
    member.object = guard.left;
  }
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

export function arrowFunctionExpression(params, body) {
  return { type: 'ArrowFunctionExpression', params, body, generator: false, async: false, expression: body.type !== 'BlockStatement' };
}

// A lexical activation for memos in a parameter expression, field initializer or caller.
// Supplied values evaluate in the outer scope, preserving source await/yield and lexical reads.
// Every ref belongs to this evaluation; names without an argument keep their local var slot.
export function renderMemoActivation(expression, names, args = []) {
  const declarations = names.slice(args.length).map(name => markGeneratedMemoDeclarator(variableDeclarator(identifier(name))));
  return callExpression(arrowFunctionExpression(
    names.slice(0, args.length).map(identifier),
    blockStatement([
      ...declarations.length ? [variableDeclaration('var', declarations)] : [],
      { type: 'ReturnStatement', argument: expression },
    ]),
  ), args);
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

// `elements` may hold null for a hole
export function arrayExpression(elements) {
  return { type: 'ArrayExpression', elements };
}

export function assignmentPattern(left, right) {
  return { type: 'AssignmentPattern', left, right };
}

// Capture a pattern parameter once and let the ordinary declaration renderer serve its reads.
// An array keeps one native iterator; splitting it into per-position reads would repeat iteration.
// A trailing inert default preserves a bare pattern's length and unmapped arguments semantics.
export function renderParameterInstanceCapture(plan, { receiverName, unusedName, embed = node => node }) {
  return {
    head: plan.root.type === 'AssignmentPattern'
      ? assignmentPattern(identifier(receiverName), embed(plan.root.right)) : identifier(receiverName),
    padding: plan.paddingRequired ? assignmentPattern(identifier(unusedName), voidZero()) : null,
    declaration: variableDeclaration('let', renderDestructureDeclarators(
      plan.pattern.type === 'ArrayPattern'
        ? [{ id: plan.pattern, init: identifier(receiverName) }]
        : plan.pattern.properties.map(prop => ({ id: { ...plan.pattern, properties: [prop] }, init: identifier(receiverName) })),
      { embed },
    )),
  };
}

// A catch or for-x head captures the receiver in its own activation. The body keeps the
// source binding kind, or writes the original assignment targets; only the fresh head is const.
// Bindings allocate the refs and pass distinct read/write nodes where their trackers require it.
export function renderDestructureHeadCapture(pattern, {
  binding, receiver = binding, kind = 'let', assignment = false, embed = node => node,
}) {
  return {
    head: assignment ? variableDeclaration('const', [variableDeclarator(embed(binding))]) : embed(binding),
    statement: renderDestructureStatements([{ id: pattern, init: receiver }], { kind: assignment ? null : kind, embed })[0],
  };
}

export function objectPattern(properties) {
  return { type: 'ObjectPattern', properties };
}

// A data property in a rendered object or pattern.
export function objectProperty(key, value, { computed = false } = {}) {
  return { type: 'Property', kind: 'init', method: false, shorthand: false, computed, key, value };
}

// A getter delays one captured receiver read until the surviving pattern consumes its slot.
export function objectGetter(key, value, { computed = false } = {}) {
  return {
    ...objectProperty(key, {
      type: 'FunctionExpression', id: null, params: [],
      body: blockStatement([{ type: 'ReturnStatement', argument: value }]),
      generator: false, async: false, expression: false,
    }, { computed }),
    kind: 'get',
  };
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
// so a cloned user node keeps its mapping. a copy stands in for its original, so the writes the
// original holds may leave the tree with it - noted for the lookups to check
export function cloneNode(node) {
  for (const item of Array.isArray(node) ? node : [node]) noteRenderRetiredWrites(item);
  return copyNode(node);
}

function copyNode(node) {
  if (Array.isArray(node)) return node.map(item => copyNode(item));
  if (!node || typeof node !== 'object') return node;
  const out = {};
  // eslint-disable-next-line no-restricted-syntax -- perf: AST hot path, plain objects
  for (const key in node) out[key] = copyNode(node[key]);
  return out;
}

// --- the injected import set, rendered ---

// the ONE spelling of the injected imports, in the one order both emitters print: globals
// as side-effect imports, pure entries as default-import bindings, the require dialect
// swapping both statement forms. returns { node, key } pairs - `key` is the canonical-order
// key the babel binding's late import-region reorder tracks per node
// minted imports carry no source span, so the printer maps them nowhere
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
function synthKeyMustBeComputed(keyNode) {
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

// ... and the host node a slot carries, for a render that asks about its shape
export function hostSlotNode(node) {
  return node?.type === HOST_SLOT ? node.node : node;
}

// --- destructure renders (growing per cluster demand) ---

// the literal spelling of one render-plan entry: the source key node when the prop was
// plain, the resolved plain name when a literal-computed spelling collapsed onto it, the
// computed identifier for a `[k]` slot
export function synthEntryKey({ keyNode, dedupKey, slotKey, lookupKey, computedKey = false }, { resolvedSpelling = false } = {}) {
  // the nested mirror spells the RESOLVED name (`{ Array: { from: _X } }`); the flat
  // literal keeps the source spelling (`['from']: _X` / `[k]: _X`), both the babel shapes
  if (resolvedSpelling) {
    const key = isValidIdentifierName(lookupKey) && lookupKey !== '__proto__' ? identifier(lookupKey) : literal(lookupKey);
    return { key, computed: synthKeyMustBeComputed(key) };
  }
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

// Bind the saved slot spelling to its live source key or injected well-known symbol.
// A missing symbol entry has no safe synth spelling. Native key cloning may retain
// directive comments; the key's meaning and computed form belong to this renderer.
export function renderSynthEntryKey(entry, {
  resolvedSpelling = false, resolvePure, injectImport, cloneHost = cloneNode, embed = node => node,
}) {
  if (entry.wksSpelling) {
    const pure = resolvePure(symbolStaticMeta(entry.wksSpelling));
    return pure ? { key: identifier(injectImport(pure.entry, pure.hintName)), computed: true } : null;
  }
  const spelled = synthEntryKey(entry, { resolvedSpelling });
  return { ...spelled, key: spelled.fromSource ? embed(cloneHost(spelled.key)) : spelled.key };
}

// Bind a decided surface once: preserved source values keep their host dialect, while
// an imported surface uses the canonical identifier builder.
function renderProxyCollapseBase(base, { injectImport, embed, carry }) {
  const source = base.alias ?? base.keep;
  const value = source ? embed(carry(source)) : identifier(injectImport(base.pure.entry, base.pure.hintName));
  return base.read ? sequenceExpression([value, conditionalExpression(
    nullFirstGuardTest(embed(carry(base.read.object))),
    renderAliasHeldProbeRead(base.read, literal(null)), embed(carry(base.read.object)),
  )]) : value;
}

// A declined navigation owns one replacement base and the effects of its dropped span.
// Bindings choose source cloning/identity; they do not choose the landing or replay order.
export function renderDeclinedNavigation(plan, {
  injectImport, embed = node => node, cloneHost = cloneNode, carryEffect = cloneHost,
}) {
  const base = renderProxyCollapseBase(plan.base, { injectImport, embed, carry: cloneHost });
  return plan.effects.length
    ? sequenceExpression([...plan.effects.map(effect => embed(carryEffect(effect))), base]) : base;
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
export function renderProxyReceiverPlan(plan, { injectImport, embed = node => node, carrySource = false, cloneHost = cloneNode }) {
  const carry = carrySource ? node => node : cloneHost;
  if (plan.kind === 'member') {
    const inner = renderProxyReceiverPlan(plan.inner, { injectImport, embed, carrySource, cloneHost });
    return inner ? memberExpression(inner, embed(carry(plan.property)), { computed: plan.computed }) : null;
  }
  // a `keep` root is carried like an alias - the substrate re-visits it, so its own
  // proxy root still earns the pure rewrite there
  const rootBinding = renderProxyCollapseBase(plan.rootBinding, { injectImport, embed, carry });
  const rootNode = plan.harvestedSE.length
    ? sequenceExpression([...plan.harvestedSE.map(expr => embed(carry(expr))), rootBinding])
    : rootBinding;
  return memberExpression(rootNode, embed(carry(plan.property)), { computed: plan.computed, optional: !!plan.optional });
}

// Spell a decided outer collapse with the same base and retained-tail renderers as a
// receiver collapse. A store's value effects stay inside its RHS. Only an in-place write
// carries its outer prefix by identity: it replaces that source span, whose write-origin
// records must still point at the retained writes. Other source occurrences are cloned.
export function renderOuterCollapseValue(plan, { injectImport, cloneHost = cloneNode, embed = node => node }) {
  function bind(base) {
    return renderProxyCollapseBase(base, { injectImport, embed, carry: cloneHost });
  }
  function clone(node) {
    return embed(cloneHost(node));
  }
  function sequence(prefix, value) {
    return prefix.length ? sequenceExpression([...prefix.map(clone), value]) : value;
  }
  function tail(hops, base) {
    return renderNavCollapseTail({ hops, collapseIdx: -1 }, base, { cloneHost: clone });
  }
  if (plan.kind === 'write' || plan.kind === 'write-in-place') {
    const inner = tail(plan.innerTail, bind({ pure: plan.innerPure }));
    const write = assignmentExpression('=', clone(plan.write.left), sequence(plan.storedEffects, inner));
    if (plan.kind === 'write-in-place') return sequenceExpression([...plan.prefix.map(node => embed(node)), write]);
    // Resolve the outer base even when the retained tail reads the write: the caller's
    // import collector subsequently prunes an unused binding, as for ordinary collapses.
    const base = tail(plan.valuePosition ? plan.tail : [], bind(plan.base));
    return plan.readsOffWrite ? tail(plan.tail, sequence(plan.prefix, write))
      : sequenceExpression([...plan.prefix.map(clone), write, base]);
  }
  const base = sequence(plan.prefix, bind(plan.base));
  return plan.kind === 'store' ? base : tail(plan.tail, base);
}

// Render the saved memo landing through its live source slots. Prefixes and erased
// navigation effects run once before the target; no query reads the generated tree.
export function renderMemoReadTarget(plan, { injectImport, embed = node => node, cloneHost = cloneNode }) {
  if (!plan) return null;
  function clone(node) {
    return cloneHost(plan.readSource(node));
  }
  let target = plan.pure ? identifier(injectImport(plan.pure.entry, plan.pure.hintName))
    : renderProxyReceiverPlan(plan.plan, { injectImport, embed, cloneHost: clone });
  if (!target) return null;
  if (plan.plan?.kind === 'member' || plan.plan?.optional) target = chainExpression(target);
  const ahead = [...plan.prefix, ...plan.se].map(node => embed(clone(node)));
  return ahead.length ? sequenceExpression([...ahead, target]) : target;
}

// Synthesized properties always define own data slots. A plain __proto__ key
// would set the object's prototype; a computed identifier would read a binding.
export function renderSynthProperty(key, value, { computed = false } = {}) {
  return !computed && synthKeyMustBeComputed(hostSlotNode(key))
    ? objectProperty(literal('__proto__'), value, { computed: true })
    : objectProperty(key, value, { computed });
}

// a member hop spelled by KEY NAME: a valid identifier reads after a dot, anything else
// reads computed with its string (`_globalThis["App-Key"]`)
// a canonical array index reads as a number (`w[1]`), every other non-identifier key as its string
export function memberFromKeyName(object, keyName, options = {}) {
  if (isValidIdentifierName(keyName)) return memberExpression(object, identifier(keyName), options);
  const key = /^(?:0|[1-9]\d*)$/.test(keyName) ? Number(keyName) : keyName;
  return memberExpression(object, literal(key), { ...options, computed: true });
}

// the SLOT READ off a receiver base: a key the literal spelled as a STRING reads back computed
// with that same string (`"k": recv["k"]`, `"0": recv["0"]`) - a dot form would print different
// source text for the same read, and a numeric / string key has no identifier to spell after a
// dot at all; every other key reads through its resolved name
export function renderSynthSlotRead({ base, key, computed, lookupKey }) {
  // a host-slotted key is the caller's own node passing through - its SPELLING still decides
  const spelled = hostSlotNode(key);
  const literalKey = !computed && PRIMITIVE_LITERAL_TYPES.has(spelled.type);
  return memberExpression(base, computed || literalKey || spelled.name === lookupKey ? cloneNode(key) : identifier(lookupKey),
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
  return isLeadingIdentLike(hostSlotNode(check))
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

// ... and its twin for a `delete` the chain continues into: a delete of a short-circuited chain is
// `true` without evaluating any of it, anything else evaluates and deletes exactly as written. so the
// whole operator rides the alternate - a `?.` re-hung off the guard's value instead takes a claim
// that yields `undefined` for the short-circuit, and answers `true` where the source throws past it
export function renderDeleteShortCircuitGuard(test, operand) {
  return conditionalExpression(test, literal(true), unaryExpression('delete', operand));
}

// the synth value keeps its probe, each side of that probe's effects, and the source fallback.
// a memo spells only its parameter probe inside the body and carries the fallback around the call.
function renderSynthReceiverGuard({ probe = null, ahead = [], after = [], fallback = null }, value,
  { embed = node => node } = {}) {
  let rendered = after.length ? sequenceExpression([...after.map(node => embed(cloneNode(node))), value]) : value;
  if (probe) rendered = renderShortCircuitGuard(nullFirstGuardTest(probe, { embed: node => embed(cloneNode(node)) }), rendered);
  if (ahead.length) rendered = sequenceExpression([...ahead.map(node => embed(cloneNode(node))), rendered]);
  return fallback ? logicalExpression(fallback.operator, rendered, embed(cloneNode(fallback.right))) : rendered;
}

// A partial synth evaluates its receiver once, then reads unresolved slots through
// a stable tail or an activation parameter. The parameter's null rejection stays
// inside that activation; the source fallback stays outside it. A fully served
// synth has no memo and uses the original guard directly.
export function renderSynthActivation(value, { guard = null, memo = null, argument = null, reusable = false } = {},
  { embed = node => node } = {}) {
  if (!memo) return guard ? renderSynthReceiverGuard(guard, value, { embed }) : value;
  if (reusable) return sequenceExpression([embed(argument), value]);
  const body = guard ? renderSynthReceiverGuard({ probe: memo }, value, { embed }) : value;
  const call = callExpression({
    type: 'FunctionExpression', id: null, params: [embed(cloneNode(memo))], generator: false, async: false,
    body: blockStatement([{ type: 'ReturnStatement', argument: body }]),
  }, [embed(argument)]);
  return guard ? renderSynthReceiverGuard({ fallback: guard.fallback }, call, { embed }) : call;
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

// A decided probe read, off its alias holder or guarded pattern value. A live computed
// pattern key is supplied as a node; other keys retain their source computed spelling.
// Only the read is owned, so claims inside its receiver and key remain independent.
export function renderAliasHeldProbeRead(probe, object, own = markRenderedProbeRead) {
  const base = (probe.innerKeys ?? []).reduce((acc, key) => own(memberFromKeyName(acc, key)), object);
  return own(probe.property
    ? memberExpression(base, probe.property, { computed: true })
    : probe.computed ? memberExpression(base, literal(probe.key), { computed: true })
    : memberExpression(base, identifier(probe.key)));
}

// Apply source-spine facts without re-resolving a cloned or already rewritten tree.
function renderProbeSource(slot, { injectImport, cloneHost = cloneNode, embed = node => node, own = markRenderedProbeRead }) {
  const node = cloneHost(slot.source);
  function at(path) {
    return path.reduce((value, key) => value[key], node);
  }
  for (const path of slot.served) own(at(path));
  for (const path of slot.deopt) {
    const hop = at(path);
    if (hop.type === 'OptionalMemberExpression') hop.type = 'MemberExpression';
    hop.optional = false;
  }
  if (slot.root) at(slot.root.path).name = injectImport(slot.root.pure.entry, slot.root.pure.hintName);
  return embed(node);
}

// The common guard-test spelling. Hosts clone/embed source slots and own their traversal marks;
// base selection, prefix order, the retained tail and a kept write are already decided facts.
export function renderNavGuardTest(test, { injectImport, cloneHost = cloneNode, embed = node => node, own = markRenderedProbeRead }) {
  const context = { injectImport, cloneHost, embed, own };
  let probe = test.source ? renderProbeSource(test.source, context)
    : test.base ? own(renderNavGuardTestBase(test.base, {
      prefix: test.prefix.map(slot => renderProbeSource(slot, context)), injectImport,
    })) : renderNavCollapseValue({ hops: test.tail, collapseIdx: -1 },
      identifier(injectImport(test.pure.entry, test.pure.hintName)), {
        prefix: test.prefix.map(slot => renderProbeSource(slot, context)), cloneHost: node => embed(cloneHost(node)), own,
      });
  if (test.assign) {
    noteRenderRetiredWrites(test.assign);
    probe = assignmentExpression(test.assign.operator, embed(cloneHost(test.assign.left)), probe);
  }
  return probe;
}

// Compose the retained navigation tail over its leaf, with effects inside the receiver slot.
// A guarded caller places this whole value in the alternate, so an absent probe reads no tail.
export function renderNavCollapseValue(plan, base, { prefix = [], cloneHost = node => node, own = node => node } = {}) {
  const leaf = prefix.length ? sequenceExpression([...prefix, base]) : base;
  const built = renderNavCollapseTail(plan, leaf, { cloneHost, own });
  return plan.hops.slice(plan.collapseIdx + 1).some(hop => hop.liveOptional) ? chainExpression(built) : built;
}

// A direct read or guarded pattern value. Shared source facts preserve live child claims while
// served reads are marked individually, so requeue cannot erase the probe's own throw.
export function renderClaimProbe(plan, { injectImport, cloneHost = cloneNode, embed = node => node }) {
  const context = { injectImport, cloneHost, embed };
  function pure(entry) {
    return identifier(injectImport(entry.entry, entry.hintName));
  }
  function clone(node) {
    return embed(cloneHost(node));
  }
  function sequence(effects, value) {
    return effects.length ? sequenceExpression([...effects, value]) : value;
  }
  const own = markRenderedProbeRead;
  if (plan.kind === 'alias') {
    return renderAliasHeldProbeRead(plan.aliasProbe, renderProbeSource(plan.object, context), own);
  }
  const { test, navPlan, leafPlan } = plan;
  const probe = renderNavGuardTest(test, context);
  let alternate = plan.kind === 'nav' ? renderNavCollapseValue(navPlan, pure(navPlan.leafPure), { cloneHost: clone, own })
    : leafPlan.leafPure ? pure(leafPlan.leafPure)
    : leafPlan.leafBasePure ? (plan.foldLeafOntoBase ? pure(leafPlan.leafBasePure)
      : own(memberFromKeyName(pure(leafPlan.leafBasePure), leafPlan.leafName)))
    : leafPlan.leafIsProbe ? renderProbeSource(test.source, context) : identifier(leafPlan.leafName);
  if (plan.alternateEffects?.length) alternate = sequence(plan.alternateEffects.map(clone), alternate);
  const guarded = renderShortCircuitGuard(nullFirstGuardTest(probe), alternate);
  const read = plan.boundary.member ? own(plan.boundary.member.computed
    ? memberExpression(guarded, literal(plan.key), { computed: true }) : memberFromKeyName(guarded, plan.key)) : guarded;
  return sequence(plan.prefix.map(clone), read);
}

// Apply the fallback's decided receiver and ordered effects. Probe slots keep their
// own canonical render; every other slot is borrowed source in the host dialect.
export function renderStaticFallbackReceiver(plan, { injectImport, cloneHost = cloneNode, embed = node => node }) {
  const receiver = identifier(injectImport(plan.fallback.entry, plan.fallback.hintName));
  const effects = plan.effects.map(effect => effect === plan.probe
    ? renderClaimProbe(plan.probe, { injectImport, cloneHost, embed }) : embed(cloneHost(effect)));
  return effects.length ? sequenceExpression([...effects, receiver]) : receiver;
}

// A resolved value has already chosen its base and the probe's position among
// source effects. Bindings only supply imports, source cloning and dialect slots.
export function renderResolvedStaticClaim(plan, { injectImport, cloneHost = cloneNode, embed = node => node }) {
  const effects = plan.effects.map(effect => effect === plan.probe
    ? renderClaimProbe(plan.probe, { injectImport, cloneHost, embed }) : embed(cloneHost(effect)));
  effects.push(renderProxyCollapseBase(plan.base, { injectImport, embed, carry: cloneHost }));
  return effects.length === 1 ? effects[0] : sequenceExpression(effects);
}

// the render half of `planKeptSequenceTail`: the tail folds onto its outermost hop's own ponyfill,
// and a plan that keeps the environment PROBE wraps it in the short-circuit guard (`null == <probe>
// ? void 0 : _self`), so the test reads at most the probe hop and never dereferences past it
export function renderKeptSequenceTail(plan, { injectImport, embed = node => node }) {
  const value = identifier(injectImport(plan.pure.entry, plan.pure.hintName));
  return plan.probe ? renderShortCircuitGuard(nullFirstGuardTest(plan.probe, { embed }), value) : value;
}

// The tail the collapse did not absorb, hung back on in the source's own spelling: a
// computed hop stays computed, a named one takes the key-name spelling, and a live `?.` rides
// where the source wrote it. it hangs off the LEAF, never off a whole guard - there it would
// read the short-circuited `void 0` instead of the ponyfill
export function renderNavCollapseTail(plan, base, { cloneHost = node => node, own = node => node } = {}) {
  let built = base;
  for (const hop of plan.hops.slice(plan.collapseIdx + 1)) {
    built = own(hop.node.computed
      ? memberExpression(built, cloneHost(hop.node.property), { computed: true, optional: !!hop.liveOptional })
      : memberFromKeyName(built, hop.name, { optional: !!hop.liveOptional }));
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
export function renderNavGuardTestBase(base, { rootAssign = null, prefix = [], injectImport, embed = node => node }) {
  const pure = identifier(injectImport(base.basePure.entry, base.basePure.hintName));
  const effects = rootAssign ? [...prefix, embed(cloneNode(rootAssign))] : prefix;
  const root = effects.length ? sequenceExpression([...effects, pure]) : pure;
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
// Absorbed calls keep their optional guard only in the raw branch; a dispatched instance
// fallback invokes on its receiver through the ordinary method-call canon. `cloneCall` retains
// host call metadata around the already-decided callee, arguments and optional flag. Arguments
// remain live for later transformation; only one branch executes.
// `captureReceiver`, where the plan has one, is the receiver VALUE the branches read through: the
// memo is written first and the whole narrow rides inside that sequence.
// every branch is spelled by EITHER a pure entry or a name, and that is the plan's own invariant:
// `planGuardedStaticNarrow` builds candidates only from truthy names, so neither slot is ever
// empty here. a branch carrying neither would mint a nameless identifier and print `undefined`
// A scalar destructure default tests the raw read once; its source stays claim-live through `embed`.
export function renderCtorIdentityNarrow(plan, rawBranch, {
  injectImport, spellRecv, captureReceiver = null, call = null,
  cloneCall = (_source, callee, args, optional) => callExpression(callee, args, { optional }),
  mintRef, embed = node => node, ctx = null,
}) {
  function invoke(callee, raw, receiver = null) {
    if (!call) return callee;
    const optional = raw && !!call.optional;
    const args = call.arguments.map(argument => embed(argument, 'argument'));
    if (receiver) return renderMethodCall(planMethodCall({
      receiver, prepared: true, optional, args, ctx,
    }), { lookup: callee });
    const built = cloneCall(call, callee, args, optional);
    return optional ? chainExpression(built) : built;
  }
  let rawThis = null;
  if (plan.instanceFallback?.kind === 'instance') {
    const pure = plan.instanceFallback;
    rawBranch = callExpression(identifier(injectImport(pure.entry, pure.hintName)), [spellRecv()]);
    // an absorbed call invokes the dispatched method through `.call`, as the ordinary dispatch does: bound
    // first, any value but a function would throw ahead of the arguments, and an absorbed `?.()` would test
    // the bound function instead of the method
    if (plan.callInBranches) {
      rawThis = spellRecv();
    } else if (plan.isCallee) rawBranch = renderBoundRawBranch(rawBranch, spellRecv());
  }
  let fallback = invoke(rawBranch, true, rawThis);
  if (plan.destructureDefault) {
    const ref = mintRef();
    fallback = renderInstanceDefaultGuard({
      assignedRef: identifier(ref), call: fallback, reread: identifier(ref),
      defaultValue: embed(plan.destructureDefault.value), defaultName: plan.destructureDefault.name,
    });
  }
  const guard = plan.branches.reduceRight((alternate, branch) => conditionalExpression(
    binaryExpression('===', spellRecv(), branch.ctorRealmPure
      ? memberExpression(identifier(injectImport(branch.ctorRealmPure.entry, branch.ctorRealmPure.hintName)), identifier(branch.ctorName))
      : identifier(branch.ctorPure ? injectImport(branch.ctorPure.entry, branch.ctorPure.hintName) : branch.ctorName)),
    invoke(identifier(injectImport(branch.staticPure.entry, branch.staticPure.hintName)), false),
    alternate,
  ), fallback);
  return captureReceiver ? renderCapturedReceiver(spellRecv(), captureReceiver, guard) : guard;
}

// A destructure lookup over an injected binding declares its receiver when it is built, never by searching its output.
// `product` is optional, belongs to one value() call and is consumed before cloning or host conversion.
// Its call owns arguments[0]: moving the call or replacing that child keeps the slot live. A cloned
// value needs a fresh product; absent metadata carries no receiver role, even for a lookalike call.
export function renderDestructureDispatch(callee, receiver, product = null) {
  const call = callExpression(callee, [receiver]);
  if (product) product.receiver = call;
  return call;
}

// Apply an already-placed initializer prefix at the producer's receiver slot, including under a
// default guard. With no declared slot it precedes the value. The caller owns placement and supplies
// live, embedded effects; this operation neither searches the tree nor follows source spelling.
export function renderDestructurePrefix(value, prefix, receiver = null) {
  if (!prefix.length) return value;
  if (!receiver) return sequenceExpression([...prefix, value]);
  receiver.arguments[0] = sequenceExpression([...prefix, receiver.arguments[0]]);
  return value;
}

// A consumed header's source plan owns its effects and memo landing. A re-anchored
// pattern takes the planned prefix in its value; otherwise the remaining read gets a
// leading sink. The binding supplies native embedding and memo rendering.
// Return the sink role explicitly, before native conversion can erase its provenance.
export function renderForInitSink(plan, { init, value = null, prefix = [], receiver = null, renderMemo, embed = node => node }) {
  const effects = plan.effects?.map(embed);
  if (plan.placement === 'value' || plan.placement === 'none') {
    return { role: 'initializer', sink: null, value: sequenceExpression([
      ...prefix.map(embed), renderDestructurePrefix(embed(value), effects, receiver),
    ]) };
  }
  const slot = effects ? effects.length ? sequenceExpression(effects) : null
    : renderMemo(plan.memo) ?? embed(init);
  const residualPrefix = plan.residualPrefix && slot?.type === 'SequenceExpression' ? slot.expressions.slice(0, -1) : [];
  const sink = residualPrefix.length ? null : slot;
  return { role: 'initializer', sink: sink ? sequenceExpression([...prefix.map(embed), sink]) : null,
    value: sink ? embed(value) : sequenceExpression([...prefix.map(embed), ...residualPrefix, embed(value)]) };
}

// the `(ref = <dispatcher call>) === void 0 ? <default> : ref` guard for an instance
// extraction carrying a user default: the dispatcher may return undefined on a foreign
// receiver (its own-property read), so the default stays LIVE - polyfill-always-wins covers
// only always-defined static/global bindings. every operand arrives ALREADY embedded (the
// leg clones and wraps its host nodes); this spells the ONE guard shape both legs print
export function renderInstanceDefaultGuard({ assignedRef, call, defaultValue, reread, defaultName = null }) {
  const source = unwrapRuntimeExpr(hostSlotNode(defaultValue));
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

// A sole computed-key extraction evaluates the initializer before the key runs. The
// dispatch owns the single property read; keeping a sentinel would read that slot twice.
// A receiver nothing reads takes no binding: it arrives as `discarded`, what discarding
// it runs, spelled ahead of the keys (`keyedReadDiscardedReceiver`).
// Both bindings pass embedded source nodes and their already-built default guard.
export function renderKeyedDestructureRead({
  receiverName,
  receiver,
  binding,
  keys,
  read,
  storeReceiver = false,
  proven = false,
  reuseReceiver = false,
  discarded = null,
}) {
  const lead = [...discarded ?? [], ...keys];
  const keyed = lead.length ? sequenceExpression([...lead, read]) : read;
  const value = proven ? keyed : conditionalExpression(
    nullFirstGuardTest(identifier(receiverName)),
    memberExpression(identifier(receiverName), literal(''), { computed: true }),
    keyed,
  );
  return [
    ...reuseReceiver || storeReceiver || discarded ? [] : [variableDeclarator(identifier(receiverName), receiver)],
    variableDeclarator(binding, storeReceiver
      ? sequenceExpression([assignmentExpression('=', identifier(receiverName), receiver), value]) : value),
  ];
}

// Render a captured element's outer hops around its ordered leaf reads. Each hop is
// read once; surrounding native fragments retain their source order. The host supplies
// source embedding, local names and the already-planned leaf render.
export function renderPositionalDestructurePlan(plan, { kind, refName, mintRef, embed, renderLeaf }) {
  const { keys, outer, memoizeHop } = plan.positional;
  const hopName = memoizeHop ? mintRef() : null;
  const leading = [];
  const trailing = [];
  let receiver = keys.reduce(memberFromKeyName, identifier(refName));
  if (hopName && outer.some(level => level.before.length || level.after.length)) {
    let root = refName;
    for (const [index, level] of outer.entries()) {
      if (level.before.length) leading.push(variableDeclaration(kind, [variableDeclarator(
        objectPattern(level.before.map(embed)),
        identifier(root),
      )]));
      const next = index === outer.length - 1 ? hopName : mintRef();
      leading.push(variableDeclaration(kind, [variableDeclarator(identifier(next), memberFromKeyName(identifier(root), keys[index]))]));
      if (level.after.length) trailing.unshift(variableDeclaration(kind, [variableDeclarator(
        objectPattern(level.after.map(embed)),
        identifier(root),
      )]));
      root = next;
    }
  } else if (hopName) leading.push(variableDeclaration(kind, [variableDeclarator(identifier(hopName), receiver)]));
  if (hopName) receiver = identifier(hopName);
  return { leading, body: renderLeaf(receiver), trailing };
}

// Ordered destructure writes share one assignment sequence in both bindings. A detached
// guard keeps its native residual on the planned side; a value host yields the captured RHS.
// Values and residuals are already embedded by the host, while binding names are scalar targets.
export function renderDestructureAssignments(reads, { residual = null, detach = null, receiver = null } = {}) {
  const writes = reads.map(({ name, value }) => assignmentExpression('=', identifier(name), value));
  if (residual) writes.splice(detach === 'after' ? 0 : writes.length, 0, residual);
  if (receiver) writes.push(receiver);
  return sequenceExpression(writes);
}

// A split source declaration keeps its exports; private captures call this without the wrap.
// The statement may be a host slot, so no source subtree is rebuilt or inspected here.
export function exportDeclaration(statement, exported) {
  return exported
    ? { type: 'ExportNamedDeclaration', declaration: statement, specifiers: [], source: null, attributes: [] }
    : statement;
}

// Ordered declaration slots, also usable directly in a for-init head. Existing native
// declarators retain identity; read pairs build only their shell. A receiver capture precedes
// the reads and residual, whose position is already decided by the source plan.
export function renderDestructureDeclarators(reads, {
  capture = null, residual = null, residualAt = reads.length, embed = node => node,
} = {}) {
  const declarations = capture ? [variableDeclarator(embed(capture.id), embed(capture.init))] : [];
  for (let index = 0; index <= reads.length; index++) {
    if (residual && index === residualAt) declarations.push(embed(residual));
    if (index === reads.length) break;
    const read = reads[index];
    declarations.push(read.type === 'VariableDeclarator' ? embed(read)
      : variableDeclarator(embed(read.id), read.init ? embed(read.init) : null));
  }
  return declarations;
}

// Native pattern segments alternate with their already-decided extracted reads. Properties
// retain source identity; each residual gets its own receiver clone. This works for a whole
// deferred group and for the tail of an incremental split after a single live default.
export function renderDestructureKeySegments(segments, receiver, { read = null, embed = node => node, cloneSource = cloneNode } = {}) {
  return segments.flatMap(segment => [
    variableDeclarator(objectPattern(segment.properties.map(embed)), embed(cloneSource(receiver))),
    ...segment.claim && read ? renderDestructureDeclarators([read(segment.claim)], { embed }) : [],
  ]);
}

// Compose destructure statements from their ordered reads and residual slot. Declaration
// reads are native declarators or id/init pairs (or a group that must stay joined);
// assignment reads carry id/init pairs. A decorated read uses an explicit statement slot.
// Prefix effects precede the capture, which stays private even
// in an export. The residual keeps its planned position, including before the first read.
// `embed` carries native nodes without cloning them implicitly: the binding owns source
// identity, spans and live paths. No host insertion, pattern pruning or source query runs here.
export function renderDestructureStatements(reads, {
  kind = null, exported = false, prefix = [], capture = null,
  residual = null, residualAt = reads.length, embed = node => node,
} = {}) {
  const statements = prefix.map(node => expressionStatement(embed(node)));
  if (capture) statements.push(variableDeclaration(capture.kind ?? 'const', [
    variableDeclarator(identifier(capture.name), embed(capture.value)),
  ]));
  for (let index = 0; index <= reads.length; index++) {
    if (residual && index === residualAt) statements.push(embed(residual));
    if (index === reads.length) break;
    const read = reads[index];
    statements.push(read.statement ? embed(read.statement) : kind
      ? exportDeclaration(variableDeclaration(kind, renderDestructureDeclarators(Array.isArray(read) ? read : [read], { embed })), exported)
      : expressionStatement(assignmentExpression('=', embed(read.id), embed(read.init))));
  }
  return statements;
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
