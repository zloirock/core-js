// Monkey-patch detection: canonicalizes patched receivers through the SAME resolution canons the
// read side uses (`resolveObjectName` for names, `walkStaticReceiverChain` for static containers,
// `reassignmentValueNodes` for the alias value union), so the mutation set and the substitution
// decisions cannot diverge by construction. Replaces the former parallel node-only alias graph.
//
// Two consumers with different needs, and the split is what keeps the cost honest:
//   - SUBSTITUTION (usage-pure) needs the COMPLETE set before it rewrites anything, so it drives a
//     scoped per-site pass. The plugins own that traversal (each dialect collects sites with live
//     paths) and feed `resolveMutationSite`; this module owns every resolution step it takes.
//   - TYPING (both usage methods) asks a yes/no about ONE namespace, and answers it off the cheap
//     census reducer below - `mutationRoots` names every namespace a write in this file could
//     reach, a SUPERSET of what the scoped pass can attribute. No extra walk: the reducer rides
//     the shared per-file census. An over-report only degrades a narrow, which is the safe
//     direction; an under-report would drop a polyfill, so the roots must stay a superset.
import { entryToGlobalHint } from '../index.js';
import knownBuiltInReturnTypes from '@core-js/compat/known-built-in-return-types' with { type: 'json' };
import {
  CLASS_NODE_TYPES,
  FN_NODE_TYPES,
  FUNCTION_LIKE_NODE_TYPES,
  MUTATED_MEMBERS_UNKNOWN,
  MUTATED_STATIC_PINNED,
  positionalElements,
  POSSIBLE_GLOBAL_OBJECTS,
  PRIMITIVE_LITERAL_TYPES,
  resolveCallArgumentCoords,
  TS_EXPR_WRAPPERS,
  VALUE_FLOW_ASSIGN_OPS,
  arrayLiteralSlotValue,
  canHoldBuiltIn,
  collectFileCensus,
  computedKeyStaticName,
  createDeclaredNameIndex,
  declaredIdentifierNodes,
  declarationScopeIn,
  declarationScopesOf,
  definitionTimeSlotOf,
  escapeStampedName,
  findObjectKeyBeforeSpread,
  classStaticSlotValue,
  collectOwnReturns,
  foldedPropertyKeyName,
  inlineCallYieldedContainer,
  isMemberAccessNode,
  literalIdentifierSlots,
  getFallbackBranchSlots,
  forOfIterableElements,
  followConstLiteralAlias,
  identifierDeclaratorInit,
  installedWriteValue,
  isBindingPosition,
  identifierReferencedInSubtree,
  isCalleeReference,
  isDestructurePattern,
  jsxIdentifierReferencesBinding,
  isMemberMutationContext,
  isMutatedStaticPair,
  isNonReferencePosition,
  IMPORT_SPECIFIER_TYPES,
  isTopLevelThisContext,
  kebabToCamel,
  memberChainKeys,
  memberKeyName,
  mutatedStaticKey,
  nodePositionKey,
  patternReceiverSlotNodes,
  patternSlotTarget,
  patternSlotValues,
  referencesArgumentsObject,
  peelIifeReturnTarget,
  peelSequenceTail,
  plainSynthKeyName,
  propertyKeyName,
  pureImportEntryOf,
  pureImportEntryOfProgram,
  reassignmentValueNodes,
  resolveCallArgument,
  unwrapRuntimeExpr,
  walkAstChildren,
  walkPatternIdentifiers,
  ESCAPED_CONTAINER_NAMES,
  ESCAPED_CTOR_NAMES,
  ESCAPED_CTOR_REFS,
} from '../helpers/ast-patterns.js';
import {
  requireCallSource,
  interopDefaultProxyName,
  requireBoundProxyGlobalName,
  bindsModuleDefault,
  globalProxyNameFromImportSource,
  isStaticPlacement,
  resolveKey,
  resolveObjectName,
  tsImportEqualsProxyName,
} from './resolve.js';
import { isKnownGlobalName } from './globals.js';
import { canonicalArrayIndex } from '../resolve-node-type/base.js';
import { walkStaticReceiverChain } from './destructure.js';

// --- Stage 1: cheap shape gate ---
// one scope-less pass deciding whether the SCOPED site traverse can run at all. precision
// matters: property assignment (`this.x =`, `config.port =`) and `Object.keys()` are
// ubiquitous in real code - a shape-only gate fired on nearly every file and the "lazy"
// stage-2 traverse ran everywhere. the gate therefore classifies each mutation target's
// ROOT: a capitalized name, a proxy global, or a local bound to a non-literal value (alias
// candidate) fires; `this.*`, parameters, literal-bound locals and unknown lowercase names
// cannot canonicalize to a built-in downstream and stay silent. object / class containers
// fire only for CHAIN targets (`NS.M.of = 1`) - a bare `config.port = 1` on a literal-bound
// name resolves to nothing

// `Array.prototype` methods that mutate in place, read off the SAME `mutatesElements` flag the type
// tables already carry - the reason a method belongs here is a property of `Array.prototype`, not of
// this pass, so there is nothing to restate locally. that flag is WIDER than repositioning: `push`
// and `pop` change the length without moving any surviving index, so a container they touch loses
// its slots to the wildcard for nothing. an accepted over-report - narrowing it means a second flag
// in the compat data, and the derived set is the reason there is no local list to drift
const ARRAY_REPOSITIONING_METHODS = new Set(Object.entries(knownBuiltInReturnTypes.instanceMethods.Array)
  .filter(([, hint]) => (Array.isArray(hint) ? hint[0] : hint)?.mutatesElements)
  .map(([name]) => name));

// value shapes that cannot reach a built-in constructor through the resolver: primitives,
// derived expressions, fresh instances and function values. everything ELSE marks the bound
// name as a potential alias (over-fire is just one wasted traverse)
const INERT_VALUE_TYPES = new Set([
  ...PRIMITIVE_LITERAL_TYPES,
  'TemplateLiteral',
  'ArrayExpression',
  'ArrowFunctionExpression',
  'FunctionExpression',
  'NewExpression',
  'UnaryExpression',
  'BinaryExpression',
  'UpdateExpression',
]);

// a root the walk could not reach at all: it rules NOTHING out, so the point query opens on it
function unnameableRoot() {
  return { unnameable: true, keys: [] };
}

// collect every chain root reachable from a mutation target, FANNING value composites (ternary /
// logical / sequence-tail / assignment-RHS) at ANY position so a nested value-fan root
// (`(c ? globalThis : self).Array.of`) is caught - the cheap gate stays a SUPERSET of the scoped
// value fan stage 3 runs. `keys` is the member path off the root, root-nearest first (an unreadable
// hop contributes `null`): naming and the container-chain check both read it. inline chain-assign
// (`(h = globalThis).Array.of`) follows the RHS the same way the stage-3 value fan does
function collectGateRoots(node, out, keys = [], depth = 0) {
  // the ONE budget in this walk that guards a real recursion (nested value composites); the
  // caller cannot see what it dropped, so exhaustion reports the unnameable root instead of a
  // silent under-report - "the walk cannot say" is the channel the gate's soundness rides on
  if (depth > 16) {
    out.push(unnameableRoot());
    return out;
  }
  let root = node;
  while (root) {
    switch (root.type) {
      case 'MemberExpression':
      case 'OptionalMemberExpression':
        keys = [memberKeyName(root), ...keys];
        root = root.object;
        continue;
      case 'SequenceExpression':
        if (root.expressions.length) {
          root = root.expressions.at(-1);
          continue;
        }
        break;
      case 'AssignmentExpression':
        root = root.right;
        continue;
      case 'ConditionalExpression':
        collectGateRoots(root.consequent, out, keys, depth + 1);
        collectGateRoots(root.alternate, out, keys, depth + 1);
        return out;
      case 'LogicalExpression':
        collectGateRoots(root.left, out, keys, depth + 1);
        collectGateRoots(root.right, out, keys, depth + 1);
        return out;
      case 'ParenthesizedExpression':
      case 'ChainExpression':
        root = root.expression;
        continue;
      default:
        if (TS_EXPR_WRAPPERS.has(root.type)) {
          root = root.expression;
          continue;
        }
    }
    break;
  }
  switch (root?.type) {
    case 'Identifier':
      out.push({ name: root.name, keys });
      break;
    // a CALL-rooted target (`getArr().from = patch`) is opaque to the cheap name heuristics.
    // whether the scoped stage can name it is decided by the CALLEE - it inlines a call only
    // through one that resolves to a function LITERAL, inline or under a name this file binds -
    // so the callee is reported and the verdict left to the reader, which knows every binding
    case 'CallExpression':
    case 'OptionalCallExpression': {
      const callee = peelToBareExpr(root.callee);
      out.push({
        name: '', keys, callRooted: true,
        calleeName: callee?.type === 'Identifier' ? callee.name : null,
        calleeIsFunction: callee?.type === 'FunctionExpression' || callee?.type === 'ArrowFunctionExpression',
      });
      break;
    }
    // top-level `this` IS the global proxy on the scoped side (the read canon's pragmatic
    // assumption) - report the root so `result` can fire on built-in-shaped keys off it
    case 'ThisExpression':
      out.push({ name: '', keys, thisRooted: true });
      break;
    default:
  }
  return out;
}

// peel runtime wrappers + comma-sequence tail off a node so `(0, Object)` / `(eff(), Reflect)`
// reach the bare identifier
function peelToBareExpr(node) {
  return peelSequenceTail(unwrapRuntimeExpr(node), { step: unwrapRuntimeExpr });
}

// the namespace NAME of a mutator callee (`Object` / `Reflect`) through the ONE read-side canon
// for every namespace shape: a bare name (SHADOW-AWARE - a local `Object` binding resolves to its
// init, not the global namespace, which subsumes a separate shadow veto), a const alias
// (`const O = Object`), and proxy-global member chains - direct (`globalThis.Reflect.set`),
// aliased (`const g = globalThis; g.Reflect.set`), hopped (`globalThis.self.Reflect.set`) or
// computed (`globalThis["Object"]`). `(0, Object).assign` peels its sequence first
function peeledNamespaceName(node, ctx) {
  return resolveObjectName({ objectNode: peelToBareExpr(node), scope: ctx.scope, adapter: ctx.adapter, path: ctx.path });
}

// resolve a mutation-target key through the SAME binding-aware canon the read side uses, so a
// const-aliased (`const k = 'from'`) or comma-sequence (`[(eff(), 'from')]`) key tracks the
// same `name.key` the resolver would otherwise substitute - the gate stays symmetric per method
function mutationKeyName(keyNode, computed, ctx) {
  return resolveKey({
    node: keyNode, computed, scope: ctx.scope, adapter: ctx.adapter, path: ctx.path,
    resolveStaticKey: ctx.resolveStaticKey ?? null,
  });
}

// the value positions that hand a reference OUT of this file's own frames, where a write through
// it can never spell the container's name here: a return / yield to the caller, a module export, a
// class field the instance carries, a throw's catch binding. a concise arrow body IS its return
function handedOutValues(node) {
  switch (node.type) {
    case 'ArrowFunctionExpression':
      return node.body && node.body.type !== 'BlockStatement' ? [node.body] : [];
    case 'ExportDefaultDeclaration': return exportedValues(node.declaration);
    case 'ExportNamedDeclaration':
      return node.declaration ? exportedValues(node.declaration)
        : (node.specifiers ?? []).map(specifier => specifier.local);
    case 'PropertyDefinition': case 'ClassProperty': return [node.value];
    default: return [node.argument];
  }
}

// what an exported DECLARATION hands out: the NAMES it binds, whatever shape binds them. the
// `export { box }` spelling of the same fact arrives through a specifier, and enumerating only
// that one left `export const box = { ... }` handing its container out unrecorded
function exportedValues(declaration) {
  if (!declaration) return [];
  if (declaration.type === 'VariableDeclaration') {
    const names = [];
    for (const declarator of declaration.declarations ?? []) walkPatternIdentifiers(declarator.id, id => names.push(id));
    return names;
  }
  return declaration.id ? [declaration.id] : [declaration];
}

function gatherPatternMemberTargets(pattern, push) {
  const work = [pattern];
  while (work.length) {
    const node = work.pop();
    if (!node || typeof node !== 'object') continue;
    if (node.type === 'MemberExpression' || node.type === 'OptionalMemberExpression') {
      push(node);
      continue;
    }
    walkAstChildren(node, child => work.push(child));
  }
}

// census-reducer form: the per-node collection runs from the shared file-census walk, the
// verdict is computed once in `result` over everything collected. `packages` (main pkg +
// additionalPackages prefixes) keeps the import-alias recognition in lockstep with the scoped
// canon - without it a user-aliased global-proxy entry never fires the gate

// does this member READ make its receiver's element list untrustworthy? a key that folds to a
// repositioning method's name does; a key that folds to any OTHER name (or to a numeric SLOT - a
// plain element read) does not; and a key that folds to nothing is a read of an UNKNOWN member -
// `box[k]()` may invoke any mutator, so the cheap census can only admit the possibility, exactly
// like the container gate does for an unreadable chain key. publish-time filtering still keeps all
// of this to container bindings
function memberReadDetachesRepositioner(node) {
  if (!node.computed) return node.property?.type === 'Identifier' && ARRAY_REPOSITIONING_METHODS.has(node.property.name);
  // a computed IDENTIFIER key reads the slot named by its VALUE, which the scope-less census cannot
  // fold - that is an unreadable key, not the slot spelled by the variable's own name. a numeric
  // literal stays a plain slot read; a foldable spelling resolves like the plain form
  const prop = node.property;
  const name = computedKeyStaticName(prop) ?? (prop?.type === 'Identifier' ? null : plainSynthKeyName(prop));
  return name !== null ? ARRAY_REPOSITIONING_METHODS.has(name) : true;
}

// the VALUE arguments a mutator invocation installs, seen from the mutator MEMBER read's own
// frame: the direct call's arguments, or - for `Reflect.apply(b.push, b, [v])`, where the
// member rides the first argument slot - the args-array's elements. `[]` for a detached read
function directInvocationValues(memberNode, parent) {
  if (parent?.type !== 'CallExpression') return [];
  if (unwrapRuntimeExpr(parent.callee) === memberNode) return spreadInstallValues(parent.arguments);
  const outerCallee = unwrapRuntimeExpr(parent.callee);
  if (outerCallee?.type === 'MemberExpression' && !outerCallee.computed
    && unwrapRuntimeExpr(outerCallee.object)?.name === 'Reflect' && outerCallee.property?.name === 'apply'
    && unwrapRuntimeExpr(parent.arguments?.[0]) === memberNode) {
    const argsArray = unwrapRuntimeExpr(parent.arguments[2]);
    if (argsArray?.type === 'ArrayExpression') return argsArray.elements;
  }
  return [];
}

// a spread argument installs its LITERAL's elements (`b.push(...[v])`); other arguments
// install themselves
function spreadInstallValues(args) {
  const values = [];
  for (const argument of args) {
    if (argument?.type === 'SpreadElement') {
      const spreadee = unwrapRuntimeExpr(argument.argument);
      if (spreadee?.type === 'ArrayExpression') values.push(...spreadee.elements);
    } else values.push(argument);
  }
  return values;
}

// `Object.assign(w, { k: v })` installs literal values into the target's named slots - the one
// call spelling whose writes are statically attributable to keys; they ride the ordinary
// slot-write channel. TRUE when it took ownership of the target: every source is a readable
// literal, so the keys this call writes are exactly the ones recorded here and the escape channel
// owes no wildcard - the target is handed to a callee whose writes this census DOES spell, which
// is the one thing the generic "a container handed to any call escapes" rule cannot say
function recordAssignInstall(node, recordSlotWrite) {
  const callee = unwrapRuntimeExpr(node.callee);
  if (callee?.type !== 'MemberExpression' || callee.computed
    || unwrapRuntimeExpr(callee.object)?.name !== 'Object' || callee.property?.name !== 'assign') return false;
  const target = unwrapRuntimeExpr(node.arguments?.[0]);
  if (target?.type !== 'Identifier') return false;
  const sources = node.arguments.slice(1).map(source => unwrapRuntimeExpr(source));
  for (const literal of sources) {
    if (literal?.type !== 'ObjectExpression') continue;
    for (const prop of literal.properties) {
      if (prop?.type !== 'ObjectProperty' && prop?.type !== 'Property') continue;
      const key = foldedPropertyKeyName(prop);
      recordSlotWrite(target.name, [key ?? '*'], prop.value);
    }
  }
  // a source the walk cannot read carries keys it cannot name, and THEN the generic escape is the
  // only sound record; `Object.assign(w)` with no source at all writes nothing and owns the target
  return sources.every(literal => literal?.type === 'ObjectExpression');
}

// the `.call` / `.apply` hop spellings, recorded from the invocation itself (the member
// read's frame cannot see its grandparent): value args past the receiver for `.call`, the
// args-array's elements for `.apply`
function recordHopInvocation(node, recordRepositioned) {
  const hop = unwrapRuntimeExpr(node.callee);
  if ((hop?.type !== 'MemberExpression' && hop?.type !== 'OptionalMemberExpression') || hop.computed
    || (hop.property?.name !== 'call' && hop.property?.name !== 'apply')) return;
  const mutatorRead = unwrapRuntimeExpr(hop.object);
  if ((mutatorRead?.type !== 'MemberExpression' && mutatorRead?.type !== 'OptionalMemberExpression')
    || !memberReadDetachesRepositioner(mutatorRead)) return;
  const owner = unwrapRuntimeExpr(mutatorRead.object);
  if (owner?.type !== 'Identifier') return;
  let values = [];
  if (hop.property.name === 'call') values = node.arguments.slice(1);
  else {
    const argsArray = unwrapRuntimeExpr(node.arguments?.[1]);
    if (argsArray?.type === 'ArrayExpression') values = argsArray.elements;
  }
  recordRepositioned(owner.name, values);
}

// --- escaped bare-ctor references (source-anchored) ---
// a bare built-in-ctor reference whose VALUE escapes the resolver's tracked-read positions
// (an argument of any call or `new`, a spread, a member-slot write's RHS, an export, a
// throw - including through value-forwarding layers and temporary literals): reads through
// wherever it lands are unresolvable, so its pure claim must carry the ctor's statics with
// it (the NAMESPACE entry; both entries export the same object, so only the loaded module
// set differs). stamped over the PRISTINE tree by node identity, so the decision cannot
// depend on which emitter rewrites first - the whole reason this is a census and not a
// claim-time parent probe. tracked positions (a declarator init, a member object, a callee,
// a plain-identifier assignment, a literal chain ending in a declarator init, a bare value
// compare) never stamp: the reaching-value walks resolve reads through them, and the
// constructor entry suffices
// the position keys of that census live in `ESCAPED_CTOR_REFS`, beside its container-name half:
// both are read from layers this module imports, so neither index can live here.
// a bare leaf is stamped by POSITION whatever it resolves to - a position is read by the node that
// owns it - while the NAME half answers for the realm's value alone, so a leaf reaching a binding
// this file wrote contributes no name. the two halves part company exactly there

// a parameter pattern nests, and so do the defaults on its slots - the ceiling is the same one the
// census puts on every other descent
const PATTERN_DEFAULT_DEPTH = 8;

// the simple alias inits of one file, keyed by its program: an escape reaches the constructor
// reference through however many `const B = A` hops the source spells, and the hops may be written
// after the escape. filled during the walk, read by every stamper AFTER it - both reducers stamp
// from their own `result`, and the graph is complete for either order
const CTOR_ALIAS_INITS = new WeakMap();
// ... and the scope CHAIN each reference stands under, so the walk resolves a name the way the
// language does rather than by spelling alone
const REFERENCE_SCOPES = new WeakMap();
// ... and the names whose escape rests on a binding this census cannot ENUMERATE rather than on a
// reference it proved reaches the realm: usage-global owes those a family (it patches the one slot
// every read lands on, so a caller's value is covered too), usage-pure does not - it substitutes
// its minted binding only where the realm is proven, and a value a caller supplies is never it
const GLOBAL_ONLY_CTOR_NAMES = new WeakMap();

// ... and the same file's `reference -> is this the REALM's value` verdict, for the leaves the
// escape walk lands on. an escaping leaf spelling a name this file BOUND hands out the binding, not
// the constructor: the widening it obliges is owed by the realm's value alone. keyed by program and
// installed during the walk, read by every stamper after it - like the alias graph, the declarations
// it answers from are complete only once the walk is over, and either reducer may stamp first
const REALM_CTOR_REFS = new WeakMap();

// ... and the calls of one file that hand an ARGUMENT straight back, keyed by program: such a call
// IS its argument as a value, so every walk that reaches the call - the escape list, and the alias
// hops a stamp follows on its own - has to read the argument in its place. filled from the walk's
// `result`, like the escape list it feeds
const PASSTHROUGH_CALL_VALUES = new WeakMap();

// ... and the callee each call of one file stands on, where this file spells it. a call's RESULT is
// whatever that callee RETURNS, so a walk reaching the call reaches those returns - without the hop
// the value a call handed on was invisible, and the census paid for it by treating every
// param-bearing function's returns as escaped at the definition
const CALL_CALLEES = new WeakMap();

function peelPassthroughCalls(node, passthrough) {
  const seen = new Set();
  let current = node;
  while (passthrough?.has(current) && !seen.has(current)) {
    seen.add(current);
    current = passthrough.get(current);
  }
  return current;
}

// ... and what this file WROTE into a container's slots, keyed by program, then by the receiver's
// NAME and the key path under it. a write stores its value INSIDE the receiver rather than handing it
// out, so a READ of that slot is where it becomes reachable - what the literal spelled is not all
// such a read lands on. the container leaving is the other half, and it is answered where the write
// is filed rather than here: a name a walk can REACH is a name the source spelled bare, and a bare
// read hands the write to the escape list before any walk starts
const WRITTEN_SLOT_VALUES = new WeakMap();

function writtenSlotValues(written, name, path) {
  return written?.get(name)?.get(path) ?? [];
}

// the container shapes this census indexes by key: the literals a name can be bound to, plus the
// class whose own statics are the same named surface
const CENSUS_CONTAINER_TYPES = new Set([
  'ArrayExpression',
  'ClassDeclaration',
  'ClassExpression',
  'ObjectExpression',
]);

// the bindings on one node whose VALUES the escape census cannot enumerate FROM ITS SHAPE: every
// parameter of a function (a caller supplies it), a catch parameter (the throw does) and an import
// local (the other module does). a for-x head binding is the fourth and is recorded from its
// statement, which is where the head is reachable. a construct's OWN name is never one of them - it
// holds the function or class itself. the parameter row is the one with a second question behind it,
// asked once the walk can see WHICH callers exist - `decideParameterAccountability`
function isUnaccountableBinding(id, node) {
  if (FUNCTION_LIKE_NODE_TYPES.has(node.type)) return id !== node.id;
  return node.type === 'CatchClause' || IMPORT_SPECIFIER_TYPES.has(node.type);
}

// ... the half of that question a node's own SHAPE settles, which is every kind but the parameters:
// WHICH caller supplies a parameter is a question about all of this file's references to the
// function, and no node carries that answer. `decideParameterAccountability` gives it once the walk
// has seen them all
function isUnaccountableNonParameter(id, node) {
  return !FUNCTION_LIKE_NODE_TYPES.has(node.type) && isUnaccountableBinding(id, node);
}

// the values a NAME can be called through: a function, and a class whose constructor a `new` runs
function isLocalCallableValue(value) {
  return FUNCTION_LIKE_NODE_TYPES.has(value?.type)
    || value?.type === 'ClassDeclaration' || value?.type === 'ClassExpression';
}

// ... and the other way a construct reaches such a caller without being named: a decorator is handed
// what it hangs off - the class, for a class / member / parameter decorator alike - so whatever the
// decorator expression evaluates to can construct it with arguments of its own
function classCarriesDecorators(node) {
  return handedToDecorators(node);
}

function handedToDecorators(construct) {
  if (construct.decorators?.length) return true;
  if (construct.type !== 'ClassDeclaration' && construct.type !== 'ClassExpression') return false;
  for (const member of construct.body?.body ?? []) {
    if (member?.decorators?.length) return true;
    for (const param of member.params ?? member.value?.params ?? []) if (param?.decorators?.length) return true;
  }
  return false;
}

// what every call this file spells puts in each parameter, the DEFAULT a call omits included - the
// pairs a parameter binding takes its values from. null where a value cannot be named: a REST
// parameter takes a list rather than a value, a spread at or before a slot leaves no position to
// pair by, and a parameter property (`constructor(private x)`) binds through a wrapper of its own
function parameterValuePairs(host, calls) {
  const pairs = [];
  for (const [index, param] of (host.params ?? []).entries()) {
    if (param?.type === 'RestElement') return null;
    const bound = param?.type === 'AssignmentPattern' ? param.left : param;
    if (bound?.type !== 'Identifier' && !isDestructurePattern(bound)) return null;
    if (param.type === 'AssignmentPattern') pairs.push([bound, param.right]);
    for (const call of calls) {
      const args = call.arguments ?? [];
      if (args.some((argument, at) => at <= index && argument?.type === 'SpreadElement')) return null;
      if (args[index]) pairs.push([bound, args[index]]);
    }
  }
  return pairs;
}

// the escape walk's per-file state, keyed by the stamp set the file owns
const ESCAPE_WALK_STATE = new WeakMap();
const ESCAPE_WALK_STEPS = 1e6;

// how many escape walks this process truncated at that ceiling. zero on every corpus we gate, so a
// non-zero reading is a regression report, not a measurement - which is why the runners assert it
// beside their timing bounds: it costs nothing and it does not care how fast the machine is
let censusTruncations = 0;
export function censusWalkTruncations() {
  return censusTruncations;
}
const NO_CHAIN_SLOT = { expanded: true, indexable: false, values: [] };

// stamp every bare-identifier LEAF a value position forwards to, through the layers a value
// flows untouched: wrappers, conditional / logical arms, a sequence tail, literal
// elements / values, spreads, an assignment's stored value, and the call whose callee hands
// the argument straight back
// stamp every constructor reference a value hands out, following the alias hops between the escape
// and the reference. the ONE entry point for both reducers: the walk is over by the time either
// calls it, so the alias graph answers the same whichever runs first
// the walk state one file's stamps share, minted on first use (why it is shared, and why it keys by
// NAME, is the note at the call site)
function escapeWalkStateFor(stamps) {
  let state = ESCAPE_WALK_STATE.get(stamps);
  if (!state) ESCAPE_WALK_STATE.set(stamps, state = { names: new Set(), roots: new Map(), slots: new Map() });
  return state;
}

function stampEscapesFrom(programNode, node, sideChannel = null) {
  const stamps = ESCAPED_CTOR_REFS.get(programNode);
  if (!stamps) return;
  // the name half of the same stamp: every position recorded below contributes the name it spells,
  // so the entry a constructor resolves to is decided once per FILE instead of once per reference.
  // a SIDE CHANNEL takes a walk's names and memo somewhere else, for a caller answering one flavor
  // alone - the POSITION stamps stay in the one set either way
  const ctorNames = sideChannel?.names ?? ESCAPED_CTOR_NAMES.get(programNode);
  // a side channel answering ONE flavor carries no global-only half: the names it gathers are the
  // pure-only ones, and a leaf this census could not prove reaches the realm is not among them
  const globalOnlyNames = sideChannel ? null : GLOBAL_ONLY_CTOR_NAMES.get(programNode);
  const aliases = CTOR_ALIAS_INITS.get(programNode);
  // the walk feeds its own output back into the same generator, and that generator SYNTHESIZES the
  // member a destructure slot pairs with - a fresh node every pass, which identity dedup can never
  // fold. So the state is keyed by what a read NAMES (the root's position plus the key path) and it
  // is shared across every escape of one file: without sharing, one root is re-derived per slot,
  // which a minified bundle turns into hours
  const state = sideChannel?.state ?? escapeWalkStateFor(stamps);
  const written = WRITTEN_SLOT_VALUES.get(programNode);
  const refScopes = REFERENCE_SCOPES.get(programNode);
  const passthrough = PASSTHROUGH_CALL_VALUES.get(programNode);
  const callCallees = CALL_CALLEES.get(programNode);
  const work = [node];
  // a callee hands out the same returns every time the walk reaches it, and a call graph reaches one
  // helper from many places - re-expanding it re-walks the whole body and pushes the same nodes back
  // in, which on a vendor module ran the ceiling below to its end and cost a minute a file. the
  // callee is a SOURCE node, so identity folds it: the synthesized members this walk feeds itself
  // are the reason the state above is keyed by NAME instead, and they never come through here
  const expanded = new Set();
  // a ceiling under a walk that cannot converge: the census is an over-approximation already, so a
  // truncated answer is honest where a throw on user code is not - and a work list still standing
  // when the ceiling runs out is what the tail below counts, since a BACKSTOP carrying load is the
  // first sign an analysis stopped converging. The measured worst case over a
  // real corpus is 26713 steps, which this clears by a factor of 37
  let steps = 0;
  while (work.length && ++steps <= ESCAPE_WALK_STEPS) {
    const reached = new Set();
    const chains = [];
    const popped = peelPassthroughCalls(work.pop(), passthrough);
    const stands = callCallees?.get(unwrapRuntimeExpr(popped));
    if (stands) pushCalleeReturns(work, expanded, stands);
    else stampEscapingLeaves(popped, stamps, reached, chains);
    const names = ESCAPED_CONTAINER_NAMES.get(programNode);
    const classifyRealm = REALM_CTOR_REFS.get(programNode);
    for (const leaf of reached) {
      const { name } = leaf;
      // the CONTAINER half indexes what this FILE bound, so every leaf counts there. the ctor half
      // answers for the value the REALM holds under that name, and a leaf resolving to a binding of
      // this file's own is not it - a shadow hands out the local, whatever the spelling suggests
      names?.add(name);
      // the walk resolves the name in the leaf's OWN scope chain: two scopes may hold one name, and
      // an answer taken by spelling alone stands for whichever leaf arrived first
      const scopes = refScopes?.get(leaf) ?? null;
      // a MAYBE leaf is a binding this census cannot enumerate - unless it can: a slot with a value
      // the file itself spells (a parameter DEFAULT, a for-x head over a literal list) is one the
      // pure pass substitutes its minted binding into, so what escapes there IS that binding and the
      // family is owed. with no such value the binding holds whatever a caller supplies, which the
      // minted binding never is - only the flavor patching the one global slot is owed then
      const realm = classifyRealm ? classifyRealm(leaf) : 'proven';
      const substituted = realm === 'maybe' && aliasEntriesInScope(aliases?.get(name) ?? [], scopes).length > 0;
      if (realm === 'proven' || substituted) ctorNames.add(name);
      else if (realm === 'maybe') globalOnlyNames?.add(name);
      const bindingKey = `${ name }\u0000${ innermostBindingStart(aliases?.get(name), scopes) }`;
      if (state.names.has(bindingKey)) continue;
      state.names.add(bindingKey);
      const slots = new Set();
      work.push(...storedValues(aliases, name, new Set(), slots, scopes));
      for (const slot of slots) {
        const slotKey = nodePositionKey(slot);
        if (slotKey !== null) stamps.add(slotKey);
        const slotName = escapeStampedName(slot);
        if (slotName !== null) ctorNames.add(slotName);
      }
    }
    // a chain is followed by what it NAMES, not by node identity: two reads of the same slot are one
    // question, and the synthesized read a destructure slot pairs with is a new node each pass
    for (const chain of chains) {
      const answer = chainSlotValues(aliases, chain, state, written);
      if (answer.expanded) continue;
      answer.expanded = true;
      const { indexable, values } = answer;
      // ... and a read that lands on NO value of this file's own hands out something written
      // outside it - the proxy-global surface above all (`globalThis.Map`, and the same object
      // reached through an alias, an IIFE, a container slot or a proxy hop). the escaping
      // reference is then the MEMBER itself, which is where the claim stands.
      // a SYNTHESIZED read (the member a destructure slot pairs with) borrows its receiver's span,
      // so its position names the RECEIVER - a reference that may well stand in a tracked position,
      // and stamping it would move the escape onto that node
      const key = nodePositionKey(chain);
      if (!indexable && !values.length && key !== null && key !== nodePositionKey(chain.object)) {
        stamps.add(key);
        const chainName = escapeStampedName(chain);
        if (chainName !== null) ctorNames.add(chainName);
      }
      work.push(...values);
    }
  }
  if (work.length) censusTruncations++;
}

// the span of the innermost binding of a name a scope chain reaches, as a dedup key half: two leaves
// spelling one name under DIFFERENT bindings are two questions, and answering the second from the
// first's expansion hands one binding's values to the other
function innermostBindingStart(entries, scopes) {
  if (!scopes || !entries) return '';
  let depth = -1;
  let at = null;
  for (const entry of entries) {
    const found = entry.at === null ? -1 : scopes.lastIndexOf(entry.at);
    if (found > depth) {
      depth = found;
      at = entry.at;
    }
  }
  return at?.start ?? '';
}

// which of a name's recorded values a reference standing under `scopes` can actually reach: the
// INNERMOST binding of that name the chain reaches owns the name there, so a shadow's values are
// the only ones a leaf inside it sees and the outer binding's are the only ones a leaf outside it
// does. an entry with no binding scope of its own (a write into a name bound elsewhere) belongs to
// whatever resolves it, and a leaf whose scope chain this census never recorded rules nothing out -
// both keep every value, which is the widening side the census owes
function aliasEntriesInScope(entries, scopes) {
  if (!scopes) return entries;
  let depth = -1;
  for (const { at } of entries) {
    if (at === null) continue;
    const found = scopes.lastIndexOf(at);
    if (found > depth) depth = found;
  }
  return depth === -1 ? entries : entries.filter(({ at }) => at === null || scopes.lastIndexOf(at) === depth);
}

// every value this file stored into a NAME: the declarator init, a plain-identifier write, and the
// slot a destructure paired the binding with - that last one read by the canonical pattern reader
// against whatever container its source names
// what a NAME stores, held per name for the walk's own hot ask. the answer is a property of the
// name in the alias graph, and the graph is a per-program record - so the memo hangs off it. the
// `seen` a hit did NOT consult is the approximation this shares with `chainRootValues`, which keys
// its expansion the same way: what a hit replays is only the names the cached expansion itself
// visited, kept as the insertion-ordered TAIL of the set rather than a copy of the whole thing -
// copying it is what made the same memo cost more than it saved when it was tried over the slot
// level. the SLOT / SCOPE asks stay uncached: one carries an accumulator, the other a filter
const STORED_VALUES = new WeakMap();
function storedValues(aliases, name, seen, slots = null, scopes = null) {
  if (slots || scopes || !aliases) return computeStoredValues(aliases, name, seen, slots, scopes);
  let byName = STORED_VALUES.get(aliases);
  if (!byName) STORED_VALUES.set(aliases, byName = new Map());
  const memo = byName.get(name);
  if (memo) {
    for (const visited of memo.added) seen.add(visited);
    return memo.values;
  }
  const before = seen.size;
  const values = computeStoredValues(aliases, name, seen, null, null);
  const added = [];
  let index = 0;
  for (const visited of seen) if (index++ >= before) added.push(visited);
  byName.set(name, { values, added });
  return values;
}

function computeStoredValues(aliases, name, seen, slots, scopes) {
  const out = [];
  // the graph is a per-program record: a program this census never walked stores none
  for (const { value: entry } of aliasEntriesInScope(aliases?.get(name) ?? [], scopes)) {
    if (entry.type) out.push(entry);
    else for (const source of aliasedValues(aliases, entry.source, seen)) {
      // a CLASS source pairs like the two literal shapes - its own statics are the slots a pattern
      // selects, and the pairer reads them through the shared descent. handing the container out
      // WHOLE instead read every constructor under it as escaped, where the member spelling of the
      // very same read (`R.Slot.groupBy`) resolved the slot and stayed narrow
      out.push(...patternSlotValues(entry.pattern, source, name));
      // ... and the slots whose value is a receiver READ report themselves: that read is
      // synthesized over the receiver's span, so the slot is the only node naming the escape
      if (slots) for (const slot of patternReceiverSlotNodes(entry.pattern, source, name)) slots.add(slot);
    }
  }
  return out;
}

// the value positions a SELECTING expression can hand a CONSTRUCTOR out through - the shared branch
// slots, minus the one arm that cannot carry one: `&&` hands its LEFT on only where that operand is
// FALSY, and a constructor reference never is. null where the node selects nothing
function selectingValueArms(node) {
  const slots = getFallbackBranchSlots(node);
  return slots ? (node.operator === '&&' ? ['right'] : slots).map(slot => node[slot]) : null;
}

// ... and what a value POSITION stands for once those hops are followed: an alias of an alias
// answers what the far end holds, and a name this file never bound stands for itself
function aliasedValues(aliases, node, seen) {
  // the value canon answers NOTHING for a position the source left empty - an array hole
  const target = unwrapRuntimeExpr(node);
  if (target?.type !== 'Identifier' || seen.has(target.name)) return target ? [target] : [];
  seen.add(target.name);
  const stored = storedValues(aliases, target.name, seen);
  return stored.length ? stored.flatMap(value => aliasedValues(aliases, value, seen)) : [target];
}

// the value ONE key reads off a container this census can index - an object or array literal, or a
// class's own statics, the three shapes the container census itself indexes. a key this walk cannot
// fold, or a spread that may redefine the slot, hands back the container WHOLE (every leaf under it
// is reachable through that read, and this census owes the superset); a container that demonstrably
// holds no such slot hands back nothing. off anything ELSE the key reads a MEMBER, not a slot - the
// constructor it may sit on keeps its own entry, and the read resolves where it stands
function containerSlotValues(container, key) {
  // the container arrives off the alias graph, which carries whatever a slot held - a hole's
  // absent value included, and nothing is the answer for it
  if (!CENSUS_CONTAINER_TYPES.has(container?.type)) return [];
  if (key === null) return [container];
  if (container.type === 'ObjectExpression') {
    const match = findObjectKeyBeforeSpread(container.properties, prop => foldedPropertyKeyName(prop) === key);
    if (match) return memberSlotValues(match);
    return container.properties.some(prop => prop.type === 'SpreadElement') ? [container] : [];
  }
  if (container.type === 'ArrayExpression') {
    const slot = arrayLiteralSlotValue(container, key);
    if (slot) return [slot];
    return container.elements.some(element => element?.type === 'SpreadElement') ? [container] : [];
  }
  const slot = classStaticSlotValue(container, key);
  return slot ? [slot] : [];
}

// the value ONE member of such a container HOLDS. babel spells a method as the member node itself, a
// function node, where ESTree keeps that function under `value`: reading only `value` answered a HOLE
// for the babel spelling, and a chain landing on a hole reads as an escape. a member carrying no
// value at all (`static x;`) is the hole this really has
function memberSlotValues(member) {
  if (FUNCTION_LIKE_NODE_TYPES.has(member.type)) return [member];
  return member.value ? [member.value] : [];
}

// EVERY value position one container holds, the key-blind twin of `containerSlotValues`: what a walk
// that names no key - a container handed out WHOLE - reaches through it. A class's members are all of
// them, not the statics the keyed read is limited to: whoever holds the constructor reads a static
// off it and an instance slot off anything it constructs, and this census owes the superset either way
function containerSlotNodes(container) {
  if (CLASS_NODE_TYPES.has(container?.type)) return (container.body?.body ?? []).flatMap(memberSlotValues);
  // a METHOD is a slot like any other, and babel spells it as its own node with the function ON the
  // property - reading `.value` alone dropped every method an object literal holds
  if (container?.type === 'ObjectExpression') {
    return container.properties.map(prop => prop.value ?? prop.argument
      ?? (FUNCTION_LIKE_NODE_TYPES.has(prop.type) ? prop : null)).filter(Boolean);
  }
  if (container?.type === 'ArrayExpression') return container.elements.filter(Boolean);
  return [];
}

// the values of a level a key can descend INTO - the census's own container shapes, and nothing else
function censusContainersOf(values) {
  return values.filter(value => CENSUS_CONTAINER_TYPES.has(value?.type));
}

// ... and the same filter over a ROOT expansion, held beside the expansion the name cache already
// keeps: a name read through N key paths filtered its whole expansion N times, and that filter WAS
// the scan - the levels below a root are narrow, so only this one is worth holding
function rootContainerValues(root, values, cache) {
  const entry = root?.type === 'Identifier' ? cache.get(root.name) : null;
  if (!entry || entry.values !== values) return censusContainersOf(values);
  entry.containers ??= censusContainersOf(entry.values);
  return entry.containers;
}

// the values a member chain READS, through the same hops the resolvers walk to name the very same
// slot: the chain's root resolves to the containers its name holds, and each key descends one level
function chainSlotValues(aliases, node, state, written) {
  const { root, keys } = memberChainKeys(node);
  if (!keys.length) return NO_CHAIN_SLOT;
  const seen = new Set();
  // the slot a read NAMES: the root plus the key path. A synthesized member borrows its receiver's
  // span, so its own node is never a stable name for it - this pair is. an IDENTIFIER root is named
  // by its NAME, not its position: that is the unit its own expansion is already keyed by
  // (`chainRootValues`), and the values it stands for come out of the alias graph by name with no
  // scope of its own - so two reads of one name are ONE question, and telling them apart re-scanned
  // that whole expansion once per read site. the leading NUL keeps a name out of the positions'
  // number space
  const rootKey = root?.type === 'Identifier' ? `\u0000${ root.name }` : nodePositionKey(root);
  const slotKey = rootKey === null ? node : `${ rootKey }${ JSON.stringify(keys) }`;
  const memo = state.slots.get(slotKey);
  if (memo) return memo;
  let level = chainRootValues(aliases, root, seen, state.roots);
  // the ROOT level is filtered where its values are already cached - by NAME. one name is read
  // through many key paths, and its expansion is the wide one; every level below it is narrow
  // enough to filter as it is built
  let containers = rootContainerValues(root, level, state.roots);
  // landing nowhere means two different things, and only one of them is an escape: the LAST value the
  // walk read from decides which. A container of this file that has no such slot was read for a hole
  // or a key past the end, and hands nothing out; a value this census cannot index (`globalThis`, a
  // call's result) is read OUTSIDE the file, which is the escape. `aliasedValues` answers a bare name
  // with the name itself, so neither the root nor the fact of a descent tells the two apart
  let indexable = false;
  // the path a write would have been recorded under, followed key by key beside the descent - a
  // name this walk cannot spell, or a key it cannot fold, names no slot for a write to land in
  const path = root?.type === 'Identifier' ? [] : null;
  for (const key of keys) {
    // ONE pass over the level answers both questions the key asks of it - which values it can
    // descend INTO, and whether the level was containers throughout (`indexable`). asked separately,
    // a wide root expansion was walked twice per key, and a level is mostly values no key descends
    indexable = level.length > 0 && containers.length === level.length;
    level = containers.flatMap(value => containerSlotValues(value, key)
      .flatMap(slot => aliasedValues(aliases, slot, seen)));
    if (path !== null && key !== null) {
      path.push(key);
      // the slot's own written values: what the LITERAL spelled is not all a read of it lands on
      level = [...level, ...writtenSlotValues(written, root.name, JSON.stringify(path))];
    }
    containers = censusContainersOf(level);
  }
  const answer = { expanded: false, indexable, values: level };
  state.slots.set(slotKey, answer);
  return answer;
}

// the root of a chain resolves per NAME, not per slot: a minified bundle reads one container through
// thousands of slots, and re-deriving the root for each turned a 350ms census into minutes. A name
// that stands for itself is not cached - that answer is the absence of one
function chainRootValues(aliases, root, seen, cache) {
  const name = root?.type === 'Identifier' ? root.name : null;
  if (name === null) return aliasedValues(aliases, root, seen);
  const cached = cache.get(name);
  if (cached) {
    for (const visited of cached.seen) seen.add(visited);
    return cached.values;
  }
  const values = aliasedValues(aliases, root, seen);
  if (values.length !== 1 || values[0] !== root) cache.set(name, { seen: new Set(seen), values });
  return values;
}

// the identifier a JSX tag NAME is rooted in: `<Map />` names it directly, while `<Map.Provider />`
// reads props off the root, so only that root is a runtime reference to a binding
function jsxTagNameRoot(name) {
  let cur = name;
  while (cur?.type === 'JSXMemberExpression') cur = cur.object;
  return cur?.type === 'JSXIdentifier' ? cur : null;
}

// is this slot value held by a member NO holder of the class can read? a private name is spellable
// only inside the class body, so it leaves with nothing when the class itself is handed out
function isPrivateClassSlot(container, slot) {
  if (!CLASS_NODE_TYPES.has(container?.type)) return false;
  return (container.body?.body ?? []).some(member => (member.value === slot || member.body === slot)
    && (member.type?.startsWith('ClassPrivate') || member.key?.type === 'PrivateName'
      || member.key?.type === 'PrivateIdentifier'));
}

// what a call hands its caller: the expression an arrow yields, or every return the body spells.
// memoized per callee NODE: the answer is a property of the function, and a walk that reaches the
// same helper twice would otherwise re-walk its whole body for the same list
const CALLEE_RETURN_VALUES = new WeakMap();
function calleeReturnValues(callee) {
  const memo = CALLEE_RETURN_VALUES.get(callee);
  if (memo) return memo;
  const values = callee.body && callee.body.type !== 'BlockStatement' ? [callee.body]
    : collectOwnReturns(callee.body).map(ret => ret.argument).filter(Boolean);
  CALLEE_RETURN_VALUES.set(callee, values);
  return values;
}

// the callee arm of the escape walk: a call this census indexed STANDS for what its callee hands
// back, and one callee is reached from many calls - expanding it ONCE per walk is what keeps the
// step ceiling a backstop instead of a running time. the callee is a source node, so identity folds
// it; the synthesized members the walk feeds itself never arrive here
function pushCalleeReturns(work, expanded, stands) {
  if (expanded.has(stands)) return;
  expanded.add(stands);
  work.push(...calleeReturnValues(stands));
}

function stampEscapingLeaves(node, stamps, escapedLeaves = null, chains = null) {
  // a zero-arg IIFE hands out its RETURN value, and the same peel every value canon takes on the
  // way into a container / global resolution puts the escape on the reference the source forwards
  const target = peelIifeReturnTarget(unwrapRuntimeExpr(node));
  if (!target || typeof target !== 'object') return;
  // a CONTAINER forwards every slot it holds, and WHICH shapes are containers is this census's own
  // answer everywhere else: a hand-listed literal pair here left a class - a container to the keyed
  // read, to the write census and to the container index alike - handing out nothing at all
  if (CENSUS_CONTAINER_TYPES.has(target.type)) {
    for (const slot of containerSlotNodes(target)) {
      // a PRIVATE member is not a slot the receiver can read: handing the class out hands out
      // everything but that one, and counting it made an unreachable value owe its family
      if (!isPrivateClassSlot(target, slot)) stampEscapingLeaves(slot, stamps, escapedLeaves, chains);
    }
    // ... and a class hands out what it INHERITS along with what it declares: a static the base
    // holds answers off the subclass name, so the base leaves with the class. read HERE rather
    // than off the file's own reads - a class this file never reads a static from still gives
    // its consumer every one of them
    if (CLASS_NODE_TYPES.has(target.type)) stampEscapingLeaves(target.superClass, stamps, escapedLeaves, chains);
    return;
  }
  // a FUNCTION handed out hands its RETURNS on with it: whoever holds it calls it and reads what
  // comes back. reached here rather than assumed at the definition, so a function that leaves
  // nowhere owes nothing
  if (FUNCTION_LIKE_NODE_TYPES.has(target.type)) {
    if (target.body && target.body.type !== 'BlockStatement') stampEscapingLeaves(target.body, stamps, escapedLeaves, chains);
    else for (const ret of collectOwnReturns(target.body)) stampEscapingLeaves(ret.argument, stamps, escapedLeaves, chains);
    return;
  }
  switch (target.type) {
    // a JSX tag name is an identifier in every way this walk cares about - it holds a position and it
    // names a binding; only the node type differs between the two spellings of the same reference
    case 'JSXIdentifier':
    case 'Identifier': {
      const key = nodePositionKey(target);
      if (key) stamps.add(key);
      // the escaping value may be an ALIAS of the constructor rather than the reference itself
      // (`const B = Map; class C extends B`), and the reference sits in the alias's own init -
      // reported as the leaf NODE here and followed by its name once the whole file has been
      // walked. the node, not the name alone: whether it reaches the realm is a question about the
      // scope this one was spelled in, and two leaves of one name may answer it differently
      escapedLeaves?.add(target);
      return;
    }
    case 'ConditionalExpression':
    case 'LogicalExpression':
      for (const arm of selectingValueArms(target)) stampEscapingLeaves(arm, stamps, escapedLeaves, chains);
      return;
    case 'SequenceExpression': stampEscapingLeaves(target.expressions.at(-1), stamps, escapedLeaves, chains); return;
    // a value spelled as a container READ hands out whatever the slot holds, and the reference
    // sits wherever the container was written - recorded as a CHAIN here and followed once the
    // whole file has been walked, exactly like a bare alias name. the chain sink is optional: a
    // caller wanting only the direct stamps passes none
    case 'MemberExpression':
    case 'OptionalMemberExpression': chains?.push(target); return;
    case 'SpreadElement': stampEscapingLeaves(target.argument, stamps, escapedLeaves, chains); return;
    case 'AssignmentExpression': stampEscapingLeaves(target.right, stamps, escapedLeaves, chains);
  }
}

// the escape half's ANSWER, for the plugin slot that outlives the walk: built OUT here so what it
// closes over is the two name sets and nothing else. taken from inside the walk it would capture
// that scope's context - the escape list, the deferred writes, the alias graph, all of them holding
// the file's own nodes - and a plugin instance keeping the answer would keep the tree with it
function escapedNameAnswer(names, heldInSlot, globalOnly) {
  return {
    has: (name, held = false) => names.has(name) || (held ? heldInSlot.has(name) : globalOnly.has(name)),
  };
}

export function escapedCtorReferencesReducer() {
  let stamps = null;
  let programNode = null;
  // the NAMES half of the census, handed to the file census so the entry decision reads it without
  // holding the program: this set outlives the walk, the AST must not
  const ctorNames = new Set();
  const globalOnly = new Set();
  // the value POSITIONS that hand a reference out, collected during the walk and stamped from
  // `result` - only there is the alias graph complete
  const escaped = [];
  const aliasInit = new Map();
  const written = new Map();
  // the names this file reads BARE - anywhere but as the object a member chain navigates. that is
  // exactly where a container LEAVES: a read through a key takes a slot and never the container, so
  // a container no bare read names cannot reach any consumer this walk did not already follow, and
  // the values written into its slots stay as invisible as the container itself
  const readsBare = new Set();
  // ... and the names read THROUGH a key, which is what makes a written slot observable at all: the
  // receiver a write replaces is no read of one, so a container written and never looked at again
  // hands its value to nobody, on either flavor
  const readsThrough = new Set();
  const memberObjects = new Set();
  const writeTargetRoots = new Set();
  const localCallables = new Map();
  // how many bindings this file declares under each name, and how it READS each of them - a name
  // bound once and read only as a callee is one no outside caller can reach a construct through
  const bindingCounts = new Map();
  const nameUses = new Map();
  // the function-likes whose parameters wait for the whole-walk verdict below
  const parameterHosts = [];
  const passthrough = new Map();
  const callCallees = new Map();
  const callArguments = [];
  const callNodes = [];
  // the member-slot writes this file spells, recorded as the walk sees them and published under the
  // program straight away: both reducers stamp from a finished walk, and only a record that is
  // already whole answers the same to whichever of them runs first
  const slotWrites = [];
  // the declarations this file makes, and the scope chain each POLYFILLABLE-global reference was
  // spelled in - the pair answering, for one escaping leaf, whether it hands out the realm's value
  // or a binding of this file's own. narrowed to the names a widening can ever be asked about: a
  // name outside that set is never put to `isEscapedCtor`, so recording its references would buy
  // nothing and cost one entry per identifier of a bundle
  const declarations = createDeclaredNameIndex();
  // ... and the half of them whose VALUES this census cannot enumerate. a parameter holds whatever
  // the CALLER passed, a catch parameter whatever was thrown, an import local whatever the other
  // module exports, a for-x head binding whatever the iteration yielded: the alias graph records
  // none of them, so a leaf spelling one is no proof the realm's constructor stayed home -
  // `function f({ Map } = globalThis) { return Map }` hands the realm's value straight out through
  // a parameter. every OTHER binding is accountable, and accountable without a second walk: the
  // graph either holds the values it took - and the escape walk reaches whatever they name on its
  // own, stamping it where it stands - or the binding is a declaration whose value is the function
  // or class itself, which no realm constructor can be
  const unaccountableDeclarations = createDeclaredNameIndex();
  const referenceScopes = new Map();
  // ... and, for a reference standing in one, the node whose scope it is spelled INSIDE but
  // evaluated OUTSIDE. two such slots: a parameter list, its own lexical region, where a default and
  // a parameter decorator alike run before the body exists; and the definition-time slots, which run
  // where the class is defined. `function f(x = hand(Map)) { var Map = 1 }` and `class B {
  // [hand(Map)]() { var Map = 1 } }` both hand the realm's constructor out, and a census frame reads
  // neither: a body `var` lands on the FUNCTION node, which stands in the chain of these slots
  // exactly as it does in the body's. so the owner is recorded as its slots are visited and dropped
  // from the chain the lookup walks - an outer scope still shadows, and a closure written inside the
  // slot keeps every binding of its own. `enclosingParameterListOwner` /
  // `enclosingParameterDecoratorOwner` are the path-side home of the first half, unreachable from a
  // census that holds no paths; the second asks the canon predicate directly
  const outerEvaluatedOwners = new Map();
  function recordOuterEvaluatedRegion(node) {
    const roots = FUNCTION_LIKE_NODE_TYPES.has(node.type) ? [...node.params ?? []] : [];
    // the property gate the path-side climb uses: only a node HOLDING one of those slots can answer
    // the canon predicate, and the read is what keeps the walk off it on every other node
    if (node.decorators?.length || node.superClass || node.computed === true) {
      walkAstChildren(node, child => {
        if (definitionTimeSlotOf(node, child)) roots.push(child);
      });
    }
    while (roots.length) {
      const current = roots.pop();
      if (typeof current?.type !== 'string') continue;
      // every owner, not the outermost alone: a computed key written inside a parameter default
      // stands outside two scopes at once, and trimming one of them leaves the other shadowing
      if (current.type === 'Identifier' && isKnownGlobalName(current.name)) {
        let owners = outerEvaluatedOwners.get(current);
        if (!owners) outerEvaluatedOwners.set(current, owners = new Set());
        owners.add(node);
      }
      walkAstChildren(current, child => roots.push(child));
    }
  }
  // the parameter half of accountability, answered ONCE and late: a caller supplies a parameter, so
  // the question is which callers exist, and only the finished walk holds every reference and every
  // call. a construct this file binds under a name nothing but a CALL ever reads reaches no caller
  // the walk cannot see, so its parameters hold what those calls put there - recorded as the alias
  // hops they are, which every stamp already follows. anything else keeps the shape's own verdict.
  // both readers ask, since either reducer may stamp first and the answer must not move with that
  let parametersDecided = false;
  function decideParameterAccountability() {
    if (parametersDecided) return;
    parametersDecided = true;
    const callsTo = new Map();
    for (const { node } of callArguments) {
      const callee = unwrapRuntimeExpr(node.callee);
      if (callee?.type !== 'Identifier') continue;
      let calls = callsTo.get(callee.name);
      if (!calls) callsTo.set(callee.name, calls = new Set());
      calls.add(node);
    }
    const immediateCalls = immediateInvocationCalls();
    const owners = new Map();
    for (const [name, construct] of localCallables) {
      if (!construct || bindingCounts.get(name) !== 1 || nameUses.get(name)?.other || handedToDecorators(construct)) continue;
      const host = FUNCTION_LIKE_NODE_TYPES.has(construct.type) ? construct : classConstructorFunction(construct);
      if (host) owners.set(host, name);
    }
    for (const { node, frame } of parameterHosts) {
      const owner = owners.get(node);
      const pairs = owner === undefined || referencesArgumentsObject(node) ? null
        : parameterValuePairs(node, callsTo.get(owner) ?? []);
      if (!pairs) {
        unaccountableDeclarations.record(node, frame, isUnaccountableBinding);
        // ... but a parameter's own DEFAULT is a value this file spells, so the slots its pattern
        // takes pair with it whoever the caller is. without the pairing a RENAMED slot lost the
        // name it came from (`{ Set, Map: M } = globalThis` widened `Set` and left `M` narrow,
        // one escape answered two ways by spelling alone). at EVERY depth: a default one level down
        // (`([{ Set } = globalThis])`) is a value the file spells just as much as the parameter's own
        const paramsScope = declarationScopesOf(node, frame).own;
        for (const param of node.params ?? []) {
          for (const { left, right } of patternDefaultPairs(param)) recordPatternAlias(left, right, paramsScope);
        }
        // ... and a host the source INVOKES where it stands takes its arguments from that very call
        // and from nowhere else: the file spells them, so the slots pair with them however the
        // accountability question above was answered
        const invocation = immediateCalls.get(node);
        for (const [bound, value] of (invocation ? parameterValuePairs(node, [invocation]) : null) ?? []) {
          if (bound.type === 'Identifier') recordAliasInit(bound.name, value, paramsScope);
          else recordPatternAlias(bound, value, paramsScope);
        }
        continue;
      }
      const paramScope = declarationScopesOf(node, frame).own;
      for (const [bound, value] of pairs) {
        if (bound.type === 'Identifier') recordAliasInit(bound.name, value, paramScope);
        else recordPatternAlias(bound, value, paramScope);
      }
    }
  }
  // WHOSE value a reference stands for, in the three answers the two flavors read differently.
  // `proven`: no declaration of this file reaches it, so it IS the realm's - both flavors owe the
  // family. `maybe`: a declaration reaches it but this census cannot enumerate what that binding
  // holds (a parameter, a catch, an import local, a for-x head), so it MIGHT be the realm's - the
  // global flavor owes it (it patches the one slot every read lands on, a caller's value included)
  // while the pure flavor does not: pure substitutes its minted binding only where the realm is
  // proven, and a value a caller supplies is not a binding this pass ever wrote. `null`: the file's
  // own binding, which neither owes. an unrecorded reference is one this reducer never saw, and it
  // rules nothing out - the widening answer
  function classifyRealmReference(node) {
    decideParameterAccountability();
    const scopes = referenceScopes.get(node);
    if (scopes === undefined) return 'proven';
    const owners = outerEvaluatedOwners.get(node);
    const reaching = owners ? scopes.filter(scope => !owners.has(scope)) : scopes;
    if (!declarations.declares(node.name, reaching)) return 'proven';
    return unaccountableDeclarations.declares(node.name, reaching) ? 'maybe' : null;
  }
  // the head of a for-x statement declares in the STATEMENT's own lexical frame, and its declarator
  // carries no init for the graph to record - the census reaches it from the statement, where the
  // frame the declarator would have been visited with is still spellable
  function recordForXHead(node, frame) {
    if (node.left?.type !== 'VariableDeclaration') return;
    const headFrame = { parentNode: node.left, scopes: [...frame?.scopes ?? [], node] };
    for (const declarator of node.left.declarations ?? []) {
      unaccountableDeclarations.record(declarator, headFrame);
    }
  }
  // a write into a member slot, filed under the receiver it lands in. a receiver this census cannot
  // NAME - a `this` member, a call result, a key it cannot fold - names no slot, so the write is the
  // hand-out it always was
  function fileSlotWrite(target, value, scopes) {
    const { root, keys } = memberChainKeys(target);
    if (root?.type !== 'Identifier') return escaped.push(value);
    // a key this census cannot NAME still names a slot of THIS file's container: what the write
    // loses is which slot, not whose. filed under the wildcard the read side already asks with, it
    // takes the same released-or-kept verdict every named write takes - handing it out instead made
    // `c[dyn] = C` cost the whole namespace, exactly what `c.d = C` beside it does not
    const path = JSON.stringify(keys.includes(null) ? ['*'] : keys);
    // the receiver of a ONE-key write is replaced, not read - a deeper chain (`c.a.b = X`) does read
    // the level above the slot it replaces, and stays a read of the container
    if (keys.length === 1) writeTargetRoots.add(root);
    slotWrites.push({ name: root.name, value, scopes });
    let paths = written.get(root.name);
    if (!paths) written.set(root.name, paths = new Map());
    let values = paths.get(path);
    if (!values) paths.set(path, values = []);
    return values.push(value);
  }
  // the calls that invoke a function WHERE IT STANDS, keyed by that function. read from the CALL
  // side rather than from the invoked node's frame: one parser keeps a paren node between the two
  // and the other drops it, so a parent read answers differently per leg, while the callee slot
  // peels to the same function on both
  function immediateInvocationCalls() {
    const calls = new Map();
    for (const { node } of callArguments) {
      const callee = unwrapRuntimeExpr(node.callee);
      if (callee && FUNCTION_LIKE_NODE_TYPES.has(callee.type)) calls.set(callee, node);
    }
    return calls;
  }

  // every [destructure pattern, default value] pair a parameter spells, at any depth: the parameter's
  // own default, and one on a slot of the pattern below it. a pair whose left is not a pattern binds
  // one name and is the alias recorder's other arm, which the pairing loop already reaches
  function * patternDefaultPairs(node, depth = 0) {
    if (!node || depth > PATTERN_DEFAULT_DEPTH) return;
    if (node.type === 'AssignmentPattern') {
      if (isDestructurePattern(node.left)) yield { left: node.left, right: node.right };
      yield * patternDefaultPairs(node.left, depth + 1);
      return;
    }
    if (node.type === 'ArrayPattern') for (const element of node.elements ?? []) yield * patternDefaultPairs(element, depth + 1);
    else if (node.type === 'ObjectPattern') {
      for (const prop of node.properties ?? []) yield * patternDefaultPairs(prop.value ?? prop.argument, depth + 1);
    }
  }

  // `at` is the scope the name BINDS in, kept beside the value so a reference resolves the name the
  // way the language does: an inner shadow's value belongs to the inner scope alone, and answering
  // by spelling handed the outer binding's value to a leaf that never reaches it. a write into a
  // name already bound elsewhere carries no `at` - the value is one the name holds in whatever scope
  // resolves it, which is the widening answer
  function recordAliasInit(name, value, at = null) {
    let values = aliasInit.get(name);
    if (!values) aliasInit.set(name, values = []);
    values.push({ at, value });
  }
  // a DESTRUCTURED binding holds whatever its slot was paired with: recorded as the pattern plus
  // its source, so the canonical pattern reader answers the pairing once the source resolves
  function recordPatternAlias(pattern, source, at = null) {
    if (source) walkPatternIdentifiers(pattern, id => recordAliasInit(id.name, { pattern, source }, at));
  }
  // what a node's own SHAPE settles about the names under it, before the subtree is walked. the
  // WRITE-position patterns first: every identifier one of them holds names a slot being written,
  // which `walkPatternIdentifiers` enumerates exactly (a default's VALUE is a read and stays out)
  function recordNodeShapeFacts(node, frame) {
    const { type } = node;
    for (const id of declaredIdentifierNodes(node) ?? []) {
      bindingCounts.set(id.name, (bindingCounts.get(id.name) ?? 0) + 1);
    }
    if (FUNCTION_LIKE_NODE_TYPES.has(type)) parameterHosts.push({ node, frame });
    const patterns = type === 'VariableDeclarator' ? [node.id]
      : type === 'AssignmentExpression' || type === 'ForOfStatement' || type === 'ForInStatement' ? [node.left]
      : type === 'CatchClause' ? [node.param]
      : FUNCTION_LIKE_NODE_TYPES.has(type) ? node.params ?? [] : [];
    for (const pattern of patterns) {
      if (isDestructurePattern(pattern)) walkPatternIdentifiers(pattern, id => writeTargetRoots.add(id));
    }
    // ... the names it reads THROUGH rather than bare: a member reads through its owner, and so does
    // a destructuring SOURCE whenever the pattern NAMES every slot it takes - `const { k: { of } } = c`
    // selects the same slot `c.k.of` selects and is no less attributable, so counting it a BARE read
    // released every write into that container. the walk is top-down, so a chain's own node is seen
    // before the root it navigates
    if (type === 'MemberExpression' || type === 'OptionalMemberExpression') {
      const owner = unwrapRuntimeExpr(node.object);
      if (owner?.type === 'Identifier') memberObjects.add(owner);
    } else if (type === 'VariableDeclarator' || type === 'AssignmentExpression') {
      const pattern = type === 'VariableDeclarator' ? node.id : node.left;
      const source = unwrapRuntimeExpr(type === 'VariableDeclarator' ? node.init : node.right);
      if (source?.type === 'Identifier' && isDestructurePattern(pattern) && patternNamesEverySlot(pattern)) {
        memberObjects.add(source);
      }
    }
    // ... and the construct a name of this file's own stands for - the function a call arm reads the
    // parameters of, the class a `new` runs the constructor of. a name bound twice answers nothing,
    // since no call site can say which of the two values it stands on
    const bound = type === 'FunctionDeclaration' || type === 'ClassDeclaration' ? node.id
      : type === 'AssignmentExpression' ? unwrapRuntimeExpr(node.left)
      : type === 'VariableDeclarator' ? node.id : null;
    if (bound?.type !== 'Identifier') return;
    // ... and a FUNCTION declaration binds its name to the function the same way a class does: what
    // it returns leaves wherever the name does, and without the hop the escape walk stopped at the
    // name. the class arm of the switch spells its own; this shape has no declarator to carry it
    if (type === 'FunctionDeclaration') recordAliasInit(bound.name, node, declarationScopesOf(node, frame).named);
    const value = unwrapRuntimeExpr(type === 'FunctionDeclaration' || type === 'ClassDeclaration' ? node : node.right ?? node.init);
    // ... a name bound to another NAME is an alias of whatever that one stands for, and the call
    // arms follow the hop rather than stopping at the first name that holds no function
    const carried = isLocalCallableValue(value) || value?.type === 'Identifier' ? value : null;
    localCallables.set(bound.name, localCallables.has(bound.name) ? null : carried);
  }
  // ... and what a REFERENCE settles: a write TARGET spells its name without reading it, and the
  // release gate below reads exactly the bare-read flag, so counting a target a read handed out every
  // value the file put into that binding. the member root of a one-key write and a pattern SLOT are
  // the same position
  // ... and so does a `void` operand: the read happens and its value is DISCARDED on the spot, so it
  // reaches no one - as accounted for as a member read, and counted bare it let the whole family go
  function recordIdentifierReference(node, frame) {
    if (node.type !== 'Identifier' || isNonReferencePosition(frame?.parentNode, node)
      || isBindingPosition(frame?.parentNode, node)) return;
    const discarded = frame?.parentNode?.type === 'UnaryExpression' && frame.parentNode.operator === 'void';
    if (!writeTargetRoots.has(node) && !discarded) (memberObjects.has(node) ? readsThrough : readsBare).add(node.name);
    noteNameUse(node.name, isCalleeReference(frame?.parentNode, node));
    referenceScopes.set(node, frame?.scopes ?? []);
  }
  function noteExportedNames(declaration) {
    for (const id of exportedValues(declaration)) if (id?.type === 'Identifier') noteNameUse(id.name, false);
  }
  function noteNameUse(name, asCallee) {
    let uses = nameUses.get(name);
    if (!uses) nameUses.set(name, uses = { callee: 0, other: 0 });
    if (asCallee) uses.callee += 1;
    else uses.other += 1;
  }

  // the first visited node IS the program: every table this walk fills is keyed by it, so the whole
  // registration is one step of the visit rather than a dozen
  function registerProgramTables(node) {
    programNode = node;
    ESCAPED_CTOR_REFS.set(node, stamps = new Set());
    ESCAPED_CTOR_NAMES.set(node, ctorNames);
    CTOR_ALIAS_INITS.set(node, aliasInit);
    REFERENCE_SCOPES.set(node, referenceScopes);
    GLOBAL_ONLY_CTOR_NAMES.set(node, globalOnly);
    WRITTEN_SLOT_VALUES.set(node, written);
    ESCAPED_CONTAINER_NAMES.set(node, new Set());
    REALM_CTOR_REFS.set(node, classifyRealmReference);
    PASSTHROUGH_CALL_VALUES.set(node, passthrough);
    CALL_CALLEES.set(node, callCallees);
  }

  function visit(node, frame) {
    if (!stamps) registerProgramTables(node);
    if (frame?.underTypeAnnotation) return;
    declarations.record(node, frame);
    unaccountableDeclarations.record(node, frame, isUnaccountableNonParameter);
    recordOuterEvaluatedRegion(node);
    recordNodeShapeFacts(node, frame);
    recordIdentifierReference(node, frame);
    switch (node.type) {
      case 'CallExpression':
      case 'OptionalCallExpression':
      case 'NewExpression':
        // which arguments come straight back is a question about the CALLEE, and the callee may be
        // a name this file binds further down - a hoisted declaration, or the const a call inside
        // another function sits above. only the finished walk holds every binding
        callNodes.push(node);
        (node.arguments ?? []).forEach((argument, index) => callArguments.push({ node, index, argument }));
        break;
      case 'AssignmentExpression': {
        // a write into a NAME is one more value that name holds - the write itself stays a tracked
        // position, but a reference reaching the name later travels through it. the peel below
        // answers nothing where no runtime value stands, and no arm claims that
        const target = unwrapRuntimeExpr(node.left);
        if (target?.type === 'MemberExpression' || target?.type === 'OptionalMemberExpression') {
          fileSlotWrite(target, node.right, frame?.scopes ?? []);
        } else if (target?.type === 'Identifier') recordAliasInit(target.name, node.right);
        else if (isDestructurePattern(target)) recordPatternAlias(target, node.right);
        break;
      }
      // a DECORATOR is handed the construct it hangs off - the class for a class, member and
      // parameter decorator alike - so whatever the decorator expression evaluates to can read and
      // call it. the same standing a JSX tag gives its component
      case 'ClassDeclaration':
      case 'ClassExpression':
        if (node.id?.type === 'Identifier') recordAliasInit(node.id.name, node, declarationScopesOf(node, frame).named);
        if (classCarriesDecorators(node)) escaped.push(node);
        break;
      // a JSX ELEMENT hands its component to a renderer - a caller this file does not spell - exactly
      // as a call argument hands its value to a callee. the desugared `createElement(C, props)`
      // spelling already escaped through the call arm, so one source spelled two ways answered twice
      case 'JSXOpeningElement': {
        const tag = jsxTagNameRoot(node.name);
        // ... the COMPONENT, which a member tag does not name: `<Map.Provider />` hands out the value
        // of that member read, exactly as `createElement(Map.Provider, props)` does, and the root is
        // read on the way there like any other receiver. stamping the root for both spellings gave
        // one source two answers - the desugared twin's, and a whole family for the tag
        if (tag === node.name && jsxIdentifierReferencesBinding(tag, node)) escaped.push(tag);
        break;
      }
      // an exported NAME is read by importers this walk never sees, and a construct read that way is
      // one they can call with values of their own - the same standing a bare read gives a container
      case 'ExportDefaultDeclaration':
        noteExportedNames(node.declaration);
        escaped.push(node.declaration);
        break;
      // a NAMED export makes its bindings readable from OUTSIDE, which is the standing a bare read
      // gives a container here: whatever an importer navigates through it, this walk cannot follow.
      // a re-export (`export { x } from 'm'`) names no binding of this file at all
      case 'ExportNamedDeclaration':
        if (node.source) break;
        for (const specifier of node.specifiers ?? []) {
          if (specifier.local?.type !== 'Identifier') continue;
          readsBare.add(specifier.local.name);
          noteNameUse(specifier.local.name, false);
          // ... and the VALUE goes with the binding: an importer reads whatever this name holds, so a
          // constructor reaching it is handed out exactly as one handed to a call is. the walk follows
          // the alias hops itself, so the reference is what escapes, never a re-derived leaf
          escaped.push(specifier.local);
        }
        noteExportedNames(node.declaration);
        for (const declarator of node.declaration?.declarations ?? []) {
          walkPatternIdentifiers(declarator.id, id => readsBare.add(id.name));
          // ... but a DESTRUCTURING declarator hands out the SLOTS its pattern names, never the value
          // it took them from: `export const { k } = C` exports `C.k` and leaves `C` where it was.
          // the same export spelled through a specifier (`const { k } = C; export { k }`) already
          // answered that way, so counting the init here made one export answer two ways. a pattern
          // that cannot name every slot it takes - a rest element, a key it cannot fold - reaches
          // past the ones it spells and hands the container out after all
          if (declarator.init && !(isDestructurePattern(declarator.id) && patternNamesEverySlot(declarator.id))) {
            escaped.push(declarator.init);
          }
        }
        // ... and an exported FUNCTION hands out what it RETURNS, the way a method value does: an
        // importer calls it and reads the result, so the returns escape even though the function
        // itself is all this file spells
        if (node.declaration?.body) {
          for (const ret of collectOwnReturns(node.declaration.body)) escaped.push(ret.argument);
        }
        break;
      // the alias hops an escape may travel through, joined in `result`
      case 'VariableDeclarator':
        {
          const bindsIn = declarationScopesOf(node, frame).enclosing;
          if (node.id.type === 'Identifier' && node.init) recordAliasInit(node.id.name, node.init, bindsIn);
          else if (isDestructurePattern(node.id)) recordPatternAlias(node.id, node.init, bindsIn);
        }
        break;
      // a for-x HEAD binds its pattern against the ELEMENT the iterated literal spells: its
      // declarator carries no init, so the declarator case above records nothing for it, and an
      // escape reaching the binding would stop at a name this graph never heard of
      case 'ForOfStatement': {
        const head = node.left.type === 'VariableDeclaration' && node.left.declarations.length === 1
          ? node.left.declarations[0].id : node.left;
        if (isDestructurePattern(head)) {
          const headScope = declarationScopeIn(node.left?.kind ?? null, frame?.scopes ?? []);
          for (const element of forOfIterableElements(node) ?? []) recordPatternAlias(head, element, headScope);
        }
        recordForXHead(node, frame);
        break;
      }
      // a for-IN head binds the KEY, never a value the iterated object holds - but the head is the
      // same declaration shape, and the census reads it through the same arm
      case 'ForInStatement': recordForXHead(node, frame); break;
      // a class DECLARATION binds its own name to a container whose statics a chain reads
      // (`class NS { static Base = Map }` then `NS.Base`) - the same slot the container census
      // indexes, and the only container shape no declarator init records

      case 'ThrowStatement': escaped.push(node.argument); break;
      // a yield hands the value to the iterator's consumer, a tagged template passes its
      // expressions as call arguments - both escape exactly like a call argument does
      case 'YieldExpression': escaped.push(node.argument); break;
      case 'TaggedTemplateExpression':
        for (const [index, expression] of (node.quasi?.expressions ?? []).entries()) {
          if (!tagExpressionLandsInPattern(node, index)) escaped.push(expression);
        }
        break;
      // a PLAIN-IDENTIFIER default (`function f(M = Ctor)`) is one more value the binding it names
      // can hold - a WRITE into that binding, not a hand-out - so it takes the deferred verdict a
      // slot write takes: released where the binding is read BARE or cannot be accounted for, which
      // is every parameter (the caller decides whether the default is ever taken) and kept where the
      // file's own binding is only ever read THROUGH a member. a DESTRUCTURE default (`{ x } = Ctor`)
      // stays unstamped - the mirror / guarded-narrow channels own it and resolve their own entries
      // (stamping it double-resolved the same source position to two entries)
      case 'AssignmentPattern':
        if (node.left?.type === 'Identifier') {
          slotWrites.push({ name: node.left.name, value: node.right, scopes: frame?.scopes ?? [] });
        }
        break;
      // returns the reaching-value walk can FOLLOW stay unstamped: a zero-arg function whose
      // body yields a single return expression is the forwarder `inlineCallReturnExpression`
      // descends (`const F = (() => Ctor)()` - stamping it split that canon's resolution).
      // params or a second return put the value out of the walk's reach - those escape
      case 'FunctionDeclaration':
      case 'FunctionExpression':
      case 'ArrowFunctionExpression': {
        // ... and the identity forwarder is one of them now: its call resolves to the ARGUMENT, and
        // the call site carries whatever escape that argument raised. stamping the return here hands
        // out every value any call ever passed, which is the narrow the call site just answered
        if (paramReturnsTheValue(node, 0)) break;
        if (node.body && node.body.type !== 'BlockStatement') break;
        // a METHOD's returns are not an escape by themselves: the method is a SLOT of its host, and
        // a host handed out forwards that slot like any other - the walk reaches the function there
        // and reads its returns then. assuming the escape instead made a class nobody exports, reads
        // or passes anywhere owe its statics for a `return Map` in a static method
        const returns = collectOwnReturns(node.body);
        if (returns.length > 1) {
          for (const ret of returns) escaped.push(ret.argument);
        }
        break;
      }
      // babel spells methods as their own node types
      // ... and the same for the shapes babel spells as their own method types: what a method
      // returns leaves only where the method's HOST does
      case 'ObjectMethod':
      case 'ClassMethod':
      case 'ClassPrivateMethod':
        if (collectOwnReturns(node.body).length > 1) {
          for (const ret of collectOwnReturns(node.body)) escaped.push(ret.argument);
        }
        break;
    }
  }
  function result() {
    decideParameterAccountability();
    // ... and the receivers whose VALUE this census cannot enumerate - an undeclared `sink.slot`,
    // a parameter, an import local - hold whatever the outside put there, so a write into one of
    // them lands outside and hands its value out. the accountable ones KEEP it: the walks above
    // reach the written slot wherever the container itself is reachable, and nowhere else. what
    // stays home is asked again below, for the one flavor that cannot read it back
    // a call that hands its argument straight back IS that argument as a value: the argument leaves
    // exactly where the CALL does, so the question moves onto the call node and every escape
    // position - a throw, a return, an outer argument, a slot write - asks it once, below
    for (const node of callNodes) {
      const stands = calleeFunctionOf(node.callee, localCallables);
      if (stands) callCallees.set(node, stands);
    }
    const kept = [];
    for (const { node, index, argument } of callArguments) {
      switch (argumentKeptBy(node, index, localCallables)) {
        // an argument the pattern BINDS is the pairer's to answer for, and one the callee DROPS
        // reaches nothing at all: neither is let go, neither is held
        case 'bound': case 'dropped': break;
        case 'returned': passthrough.set(node, argument); break;
        case 'held': kept.push(argument); break;
        default: escaped.push(argument);
      }
    }
    // a container LITERAL with a slot this pass cannot NAME is read back through a member the pairing
    // could not fold - the very case the held half exists for, and one no slot WRITE files. pure
    // substitutes its minted binding into the named slots and then reads a static off one of them,
    // so the entry it picks there is the last chance to carry that static: the bare `<x>/constructor`
    // installs none and the read answers `undefined` on the floor. only an unnameable slot asks -
    // a literal the pairing folds keeps its narrow entry, which is what makes it worth folding
    for (const [name, values] of aliasInit) {
      if (!readsThrough.has(name)) continue;
      for (const entry of values) {
        const literal = unwrapRuntimeExpr(entry?.value ?? entry?.source ?? entry);
        if (CENSUS_CONTAINER_TYPES.has(literal?.type) && literalHasUnnameableSlot(literal)) kept.push(literal);
      }
    }
    for (const { name, value, scopes } of slotWrites) {
      const outside = !declarations.declares(name, scopes);
      if (outside || readsBare.has(name)) escaped.push(value);
      else if (readsThrough.has(name)) kept.push(value);
    }
    for (const node of escaped) stampEscapesFrom(programNode, node);
    // the escapes proper go on naming what usage-GLOBAL owes a family for: that flavor patches the
    // one global slot every read of the name lands on, so a constructor it can still see - one
    // stored in a container of this file - needs nothing extra. usage-PURE mints a BINDING instead,
    // and declines to read a written slot back at all, so the constructor it substitutes there is
    // read through a member the pass never resolves: the bare `<x>/constructor` entry installs no
    // statics, and that read then answers `undefined` where the native answers the member.
    // that half walks into names and a memo of its OWN, never into the shared set - the two bindings
    // list their census reducers in different orders, and an answer that moved with that order would
    // leave one leg narrower than the other. the POSITION stamps stay one set for both, so a slot the
    // value canon declined is still the reference a pure destructure plan reads back
    const heldInSlot = new Set();
    const heldState = { names: new Set(), roots: new Map(), slots: new Map() };
    for (const value of kept) stampEscapesFrom(programNode, value, { names: heldInSlot, state: heldState });
    // read at QUERY time, when every reducer of this census has stamped: ONE answer object rather
    // than two census fields, since the flavor doing the asking is what picks the half
    return {
      escapedCtorNames: escapedNameAnswer(ctorNames, heldInSlot, globalOnly),
    };
  }
  return { visit, result };
}

// the plain-alias family of the census (`aliasValues` in the reducer): a name that took ONE value
// this census can follow - a bound name or a member nav with readable keys - stands for that path.
// writes and escapes spelled through it canonicalize onto the path at publish time, so its own
// declaration escapes nothing (`const a = r.w`; `var _r$w = r.w`, the spelling a destructure lowering
// ahead of this plugin leaves) and the receiver walk keeps descending the literal for a read
// through it. a name that took a second value, or one the census cannot follow, is no plain alias:
// every followable value it held escapes as before
const ALIAS_CHAIN_DEPTH = 64;
// how many paths one name may stand for at once: a selection of selections multiplies, and past this
// the frontier stops following rather than squaring
const ALIAS_FRONTIER_WIDTH = 64;
// the path a value re-homes, or null where the census cannot follow it
function plainAliasTarget(rawValue) {
  const { root, keys } = memberChainKeys(rawValue);
  return root?.type === 'Identifier' && !keys.includes(null) ? { root: root.name, keys } : null;
}

// the container literal a nav rooted at ONE names (`({ h: { g: globalThis } }).h` -> `{ g: globalThis }`),
// or null where the descent leaves the shapes this census indexes. the write-side twin of the reader
// walk's literal-rooted fold: a binding initialized this way holds a container exactly as a bare
// literal does, and only a binding DECLARED a container here keeps its slot writes at publish time -
// without it pure went on rewriting a read whose slot the source had already replaced. an ambiguous
// descent (a spread that may redefine the slot hands the container back whole) names no single
// literal and is left to the alias family, as it was before
function literalRootedContainer(value) {
  const { root, keys } = memberChainKeys(value);
  if (!keys.length || keys.includes(null) || !CENSUS_CONTAINER_TYPES.has(root?.type)) return null;
  let level = [root];
  for (const key of keys) level = level.flatMap(container => containerSlotValues(container, key));
  return level.length === 1 && level[0] !== root && CENSUS_CONTAINER_TYPES.has(level[0]?.type) ? level[0] : null;
}

// does the argument at this position land in a DESTRUCTURING parameter of a callee spelled INLINE?
// then the pattern pairer owns the value, exactly as it owns a destructure DEFAULT (`{ x } = Ctor`):
// the function value never leaves the call, so what the body binds are the slots the pattern selects
// and nothing there hands the constructor itself on. a REST or plain-identifier parameter DOES hold
// it, a spread at or before the slot leaves no position to pair by, and an `arguments` reference
// anywhere under the callee reaches the whole argument past every pattern - each keeps the escape
function paramSelectsTheValue(callee, paramIndex) {
  // a PARAMETER LIST is what spells the callee inline: no other node a call can stand on carries one,
  // so reading for it is the same answer a node-type list gives and one fact fewer to keep in step
  if (!callee?.params) return false;
  const param = callee.params[paramIndex];
  const bound = param?.type === 'AssignmentPattern' ? param.left : param;
  return isDestructurePattern(bound) && patternNamesEverySlot(bound) && !referencesArgumentsObject(callee);
}

// ... and the same value never leaves where the callee hands it straight BACK: a lone Identifier
// parameter whose body is exactly that parameter returns the argument to the call site, which is
// this file. the body has to be the parameter and nothing else - a sequence prefix, a second read,
// any statement beside the return can pass the value on, and the census follows NAMES, so nothing
// downstream would see it leave through the parameter's own binding
// ... and the callee that DROPS the argument: a parameter list too short to reach the position, or a
// parameter whose name the body never reads, puts the value nowhere at all. who else calls the
// callee does not enter into it - this file's own value stops here either way, and an `arguments`
// read is the one way past the parameter list
function paramDropsTheValue(callee, paramIndex) {
  if (!callee?.body || referencesArgumentsObject(callee)) return false;
  const param = callee.params?.[paramIndex];
  if (param === undefined) return !!callee.params;
  const bound = param?.type === 'AssignmentPattern' ? param.left : param;
  return bound?.type === 'Identifier' && !identifierReferencedInSubtree(callee.body, bound.name);
}

function paramReturnsTheValue(callee, paramIndex) {
  if (paramIndex !== 0 || callee?.params?.length !== 1 || callee.params[0].type !== 'Identifier') return false;
  const { body } = callee;
  const returned = body?.type !== 'BlockStatement' ? body
    : body.body.length === 1 && body.body[0]?.type === 'ReturnStatement' ? body.body[0].argument : null;
  const value = unwrapRuntimeExpr(returned);
  const [{ name: paramName }] = callee.params;
  // a SEQUENCE hands its TAIL on, so a body spelled `(0, a)` returns the parameter exactly as the
  // bare `a` does. the PREFIX has to be clear of the parameter, though: a read there is a second
  // reference, and this answer exists to say the value went nowhere else
  const prefix = value?.type === 'SequenceExpression' ? value.expressions.slice(0, -1) : [];
  if (prefix.some(expr => identifierReferencedInSubtree(expr, paramName))) return false;
  const tail = value?.type === 'SequenceExpression' ? unwrapRuntimeExpr(value.expressions.at(-1)) : value;
  return tail?.type === 'Identifier' && tail.name === paramName && !referencesArgumentsObject(callee);
}

// the VALUE a callee position stands on, through the layers that hand one on: the transparent
// wrappers, and a SEQUENCE, whose tail IS the callee (`(0, fn)(x)` calls `fn`). reading the sequence
// itself as the callee answered "no function here" for a call that reaches the same body as its bare
// twin, and the argument then read as handed out of the file
function peelCalleeValue(node) {
  let cur = unwrapRuntimeExpr(node);
  while (cur?.type === 'SequenceExpression') cur = unwrapRuntimeExpr(cur.expressions.at(-1));
  return cur;
}

// HOW the callee keeps the argument at this position with the file that spelled it, where it does.
// the two answers are not interchangeable: a value the pattern BINDS reaches only the slots the
// pattern names, and the call returns whatever the body picked out of them; a value the callee
// RETURNS is the call's own value, so the call carries the escape question the argument raised.
// the callee is the one the call stands on - spelled inline, or named among this file's functions.
// a spread at or before the slot leaves no position to pair by, and answers for neither
// the function a call stands on, through however many name hops this file spells (`const g = f`):
// a name bound to another NAME is an alias of it, and the call reaches the same body either way
function calleeFunctionOf(calleeNode, localCallables) {
  let cur = peelCalleeValue(calleeNode);
  for (const seen = new Set(); cur?.type === 'Identifier' && !seen.has(cur.name); cur = peelCalleeValue(localCallables.get(cur.name))) {
    seen.add(cur.name);
  }
  if (FUNCTION_LIKE_NODE_TYPES.has(cur?.type)) return cur;
  // a `new C(...)` runs the class's CONSTRUCTOR, so that is the body its result comes from
  return CLASS_NODE_TYPES.has(cur?.type) ? classConstructorFunction(cur) : null;
}

// does the body reach this parameter ONLY through member reads? such a read names a static the
// census resolves on its own, so the value stays accounted for and the argument is held rather than
// let go. a BARE read is the hand-out (`hand(ns)`), and a member WRITE (`ns.entries = patch`) is the
// mutation the other census owes a family for - neither answers here. an inner binding of the same
// name reads as a bare use, which only keeps today's wider answer
function paramReadOnlyThroughMembers(callee, paramIndex) {
  const param = callee?.params?.[paramIndex];
  const bound = param?.type === 'AssignmentPattern' ? param.left : param;
  if (bound?.type !== 'Identifier' || !callee.body || referencesArgumentsObject(callee)) return false;
  const { name } = bound;
  let accounted = true;
  let seen = false;
  function walk(current, throughMember, writeTarget) {
    if (!accounted || !current || typeof current !== 'object' || typeof current.type !== 'string') return;
    if (current.type === 'Identifier') {
      if (current.name !== name) return;
      seen = true;
      accounted &&= throughMember;
      return;
    }
    // the member a WRITE names is the mutation census's business, not this one: its receiver is not
    // read for a value, and answering "accounted" here would take the family that census owes
    const readThrough = isMemberAccessNode(current) && !writeTarget;
    for (const [key, value] of Object.entries(current)) {
      if (key === 'type' || !value || typeof value !== 'object') continue;
      const writesBelow = (current.type === 'AssignmentExpression' && key === 'left')
        || (current.type === 'UpdateExpression' && key === 'argument');
      if (Array.isArray(value)) for (const item of value) walk(item, false, false);
      else walk(value, readThrough && key === 'object', writesBelow);
    }
  }
  walk(callee.body, false, false);
  return seen && accounted;
}

function argumentKeptBy(node, index, localCallables) {
  const args = node.arguments ?? [];
  if (args.some((argument, at) => at <= index && argument?.type === 'SpreadElement')) return null;
  const spelled = peelCalleeValue(node.callee);
  const named = spelled?.type === 'Identifier';
  const callee = named ? localCallables.get(spelled.name) : spelled;
  if (paramReturnsTheValue(callee, index)) return 'returned';
  if (paramDropsTheValue(callee, index)) return 'dropped';
  // ... and the identifier parameter the body only READS THROUGH: the file keeps the value in that
  // binding and names every static it takes off it, so nothing left. counted an escape, one member
  // read cost the argument's whole family
  if (paramReadOnlyThroughMembers(callee, index)) return named ? 'held' : 'bound';
  // ... and the argument a callee only puts in a CONTAINER it yields: the call's value holds it, the
  // binding that value lands in is a container of this file, and the slot filed beside it is where a
  // later escape of that binding still reaches the constructor - the receiver walk reads the same
  // fact off the same recognizer, so nothing is narrowed that cannot then be resolved
  if (inlineCallYieldedContainer(node, unwrapRuntimeExpr)?.slots.some(([, at]) => at === index)) return 'bound';
  if (!paramSelectsTheValue(callee, index)) return null;
  // ... and WHERE the callee is named, no pass rewrites the slot the pattern reads: the flavor that
  // patches the one global slot still sees the value there, the flavor that mints a BINDING reads a
  // static off what it minted, so the value is held rather than let go
  return named ? 'held' : 'bound';
}

// ... and the PATTERN half of that question under a TAG, whose parameter list starts with the strings
// array: the interpolation at index `i` pairs with parameter `i + 1`, and nothing else about the
// question moves. a tag takes no spread, so there is no position the pairing can lose
function tagExpressionLandsInPattern(node, index) {
  return paramSelectsTheValue(unwrapRuntimeExpr(node.tag), index + 1);
}

// does this pattern NAME every slot it reads? a computed key the census cannot fold reads a slot
// nothing here can name, and a REST element takes every own property in one binding - either way the
// value is read past what the pairing resolves, so the pattern stops standing for the whole of it
function patternNamesEverySlot(pattern) {
  const work = [pattern];
  while (work.length) {
    const current = work.pop();
    switch (current?.type) {
      // a REST element carries no key to fold, so the same read answers for it: it binds every own
      // property the pattern did not name, which is the whole of the value all over again
      case 'ObjectPattern':
        for (const property of current.properties) {
          if (foldedPropertyKeyName(property) === null) return false;
          work.push(property.value);
        }
        break;
      case 'ArrayPattern':
        for (const element of current.elements) if (element) work.push(element);
        break;
      case 'AssignmentPattern': work.push(current.left); break;
      default: break;
    }
  }
  return true;
}

// the record keys are DECLARATION-qualified names (`r#3`): a name spelled in a scope chain resolves
// to the innermost declaration the chain reaches, so records and containers pair by binding, never
// by spelling alone. `containers` maps each qualified container to its literals; `containerSlotIndex`
// is the reader's map from a declaring node (or a bare name, as the union of its declarations) to
// the key
function buildContainerIndex(declared, containerDeclarations) {
  const scopeIds = new Map([[null, 0]]);
  // a stable number per scope node, the module scope first
  function scopeId(scope) {
    if (!scopeIds.has(scope)) scopeIds.set(scope, scopeIds.size);
    return scopeIds.get(scope);
  }
  // the declaration key a name resolves to in a scope chain, or null for an undeclared (global) name
  function qualify(name, scopes) {
    const entries = declared.get(name);
    if (!entries) return null;
    for (let at = scopes.length - 1; at >= -1; at--) {
      const scope = at < 0 ? null : scopes[at];
      if (entries.some(entry => entry.scope === scope)) return `${ name }#${ scopeId(scope) }`;
    }
    return null;
  }
  const containers = new Map();
  const containerSlotIndex = { owners: new WeakMap(), byName: new Map() };
  for (const declaration of containerDeclarations) {
    const key = `${ declaration.name }#${ scopeId(declaration.scope) }`;
    let entry = containers.get(key);
    if (!entry) {
      entry = { name: declaration.name, scopes: declaration.scopes, literals: [], arrayLiteral: false, container: false };
      containers.set(key, entry);
    }
    entry.literals.push(declaration.literal);
    if (declaration.arrayLiteral) entry.arrayLiteral = true;
    else entry.container = true;
    if (declaration.node) containerSlotIndex.owners.set(declaration.node, key);
    let keys = containerSlotIndex.byName.get(declaration.name);
    if (!keys) containerSlotIndex.byName.set(declaration.name, keys = []);
    if (!keys.includes(key)) keys.push(key);
  }
  return { qualify, containers, containerSlotIndex };
}

// `qualify` resolves a name in its scope chain to its declaration key: the alias and its target
// root are both keyed that way, so an alias declared in one function never stands for a target
// declared in another under the same spelling
function publishPlainAliases(aliasValues, recordEscaped, qualify) {
  const plainAliases = new Map();
  const grouped = new Map();
  for (const [name, values] of aliasValues) {
    for (const item of values) {
      const key = qualify(name, item.scopes);
      if (!key) continue;
      let entries = grouped.get(key);
      if (!entries) grouped.set(key, entries = []);
      entries.push(item);
    }
  }
  for (const [key, values] of grouped) {
    // a name stands for EVERY value it took, so the alias is a LIST of roots - one entry is that list
    // at length one. a SELECTING init contributes one entry per arm, and reading the name then
    // reaches both containers instead of neither. only a value the walk cannot follow collapses the
    // whole name: it stands for that one too, and the file has genuinely lost track of it
    const targets = values.map(item => item.target
      ? { root: qualify(item.target.root, item.scopes), keys: item.target.keys } : null);
    if (targets.length && targets.every(target => target?.root)) plainAliases.set(key, targets);
    else recordEscaped(values.filter(item => item.target).map(item => item.rawValue));
  }
  return plainAliases;
}

// what a WRAPPER literal hands out beyond the containers it holds by name: a nested literal is
// walked the same way, and any other value position escapes (a spread, a member read, a call)
function wrapperLiteralEscapes(literal) {
  const escapes = [];
  const work = [literal];
  while (work.length) {
    const node = unwrapRuntimeExpr(work.pop());
    if (node?.type === 'ArrayExpression') {
      for (const element of node.elements) if (element && unwrapRuntimeExpr(element)?.type !== 'Identifier') work.push(element);
    } else if (node?.type === 'ObjectExpression') {
      for (const prop of node.properties) {
        const value = prop.type === 'SpreadElement' ? prop.argument : prop.value;
        if (unwrapRuntimeExpr(value)?.type !== 'Identifier') work.push(value);
      }
    } else if (node) escapes.push(node);
  }
  return escapes;
}

// does this container spell a slot the census cannot NAME - a computed key it cannot fold, a spread
// that may redefine one, an accessor whose value is a call? a pattern pairing against it folds
// nothing, so a read through it lands on a slot only the runtime knows
function literalHasUnnameableSlot(literal) {
  if (literal?.type === 'ArrayExpression') return literal.elements.some(element => element?.type === 'SpreadElement');
  if (literal?.type !== 'ObjectExpression') return false;
  return literal.properties.some(prop => prop.type === 'SpreadElement'
    || prop.kind === 'get' || prop.kind === 'set'
    || foldedPropertyKeyName(prop) === null);
}

// writes and escapes recorded against a WRAPPER reach the containers its slots hold by name
// (`const box = [r]; box[0].w = X` replaces `r.w`; `f(box)` hands `r` out too): every record under a
// wrapper slot re-homes onto the held container's own path, to a fixpoint through nested wrappers.
// a record ON the slot itself (`box[0] = other`) replaces the wrapper's slot and touches nothing inside
function propagateWrapperWrites(writtenContainerSlots, containers, writtenSlot, qualify) {
  for (let round = 0; round < ALIAS_CHAIN_DEPTH; round++) {
    let grew = false;
    for (const [name, { scopes, literals }] of containers) {
      for (const literal of literals) {
        for (const [keyPath, innerName] of literalIdentifierSlots(literal)) {
          // the held name is READ where the wrapper is declared: it resolves in that chain
          const inner = qualify(innerName, scopes);
          if (inner && containers.get(inner)?.container
            && rehomeWrapperRecords({ writtenContainerSlots, writtenSlot, name, keyPath, inner })) grew = true;
        }
      }
    }
    if (!grew) return;
  }
}

// the records under ONE wrapper slot, re-homed onto the container it holds; true when one landed
function rehomeWrapperRecords({ writtenContainerSlots, writtenSlot, name, keyPath, inner }) {
  const prefix = `${ [name, ...keyPath].join('.') }.`;
  const wildcards = new Set(keyPath.map((key, at) => `${ [name, ...keyPath.slice(0, at)].join('.') }.*`));
  let grew = false;
  const records = Array.from(writtenContainerSlots);
  for (const [record, values] of records) {
    const target = wildcards.has(record) ? `${ inner }.*`
      : record.startsWith(prefix) ? `${ inner }.${ record.slice(prefix.length) }` : null;
    if (!target || writtenContainerSlots.has(target)) continue;
    writtenSlot(target).push(...values);
    grew = true;
  }
  return grew;
}

// the aliased paths a name stands for, followed through alias-of-alias chains; a name that is no
// plain alias answers for itself. a SELECTING alias stands for every arm at once, so the walk carries
// a FRONTIER rather than one path - a single-root alias is that frontier at width one. the depth
// bound doubles as the cycle guard (`const a = b; const b = a`), and the width bound keeps a chain of
// selections from squaring: past it the name keeps whatever paths it has, which is the conservative
// half - a path not followed is a container this census still treats as its own
function canonicalSlotPaths(plainAliases, name, keys) {
  let frontier = [[name, keys]];
  for (let depth = 0; depth < ALIAS_CHAIN_DEPTH; depth++) {
    const next = [];
    let followed = false;
    for (const [root, path] of frontier) {
      const targets = plainAliases.get(root);
      if (!targets || next.length + targets.length > ALIAS_FRONTIER_WIDTH) {
        next.push([root, path]);
        continue;
      }
      followed = true;
      for (const target of targets) next.push([target.root, [...target.keys, ...path]]);
    }
    frontier = next;
    if (!followed) break;
  }
  return frontier;
}

// the census of what this file WRITES and lets ESCAPE, collected in one walk: mutated statics and
// instance slots, written container slots keyed by declaration, plain aliases and wrapper literals,
// the containers a call hands out, and the ctor-escape stamps. one record per shape it collects;
// the reader-side questions (`isWrittenContainerSlot`, `writtenContainerSlotValues`) are answered
// from the published result, never from the walk in progress
// eslint-disable-next-line max-statements -- the census hub: one record per shape it collects
export function mutationShapesReducer(packages = null) {
  // the program node, for the ctor-escape stamps this reducer contributes at publish time: it is
  // the same census walk and the same stamp set, and the fact that decides them - which containers
  // this file loses track of - is computed here and nowhere else
  let programNode = null;
  // containers READ through a key this pass cannot fold (`b[i].groupBy`): the read lands on
  // whatever the slot holds without resolving it, the same loss of track a write with an
  // unreadable key causes - and it is a READ, so it belongs beside the write record, not in it
  const opaquelyRead = new Set();
  // the arguments every call with a bare-Identifier callee passes, by that name. a write through a
  // PARAMETER patches whatever the call handed it (`function install(t) { t.groupBy = shim }`),
  // and this is the only place that pairing is visible - scope-blind on purpose: the map only ever
  // ADDS reachable values, so a same-named function in another scope over-records, never under
  const callArguments = new Map();
  const superCallArguments = [];
  const superClassNames = new Set();
  const closureMemo = new Map();
  // ... and the parameter list of each named function, the other half of that pairing
  const functionParams = new Map();
  // the KEYS read off each name. against a class binding it answers the one question the base's
  // entry choice turns on: does this file read a static off the subclass NAME that the subclass
  // does not declare itself - the only reads that land on the INHERITED member
  const memberReadKeys = new Map();
  function recordMemberRead(name, key) {
    let keys = memberReadKeys.get(name);
    if (!keys) memberReadKeys.set(name, keys = new Set());
    keys.add(key);
  }

  // ... asked of the class node: an own static of that name answers the read itself, and a key
  // neither side can name is the conservative case
  function readsInheritedStaticOf(classNode, name) {
    const read = memberReadKeys.get(name);
    if (!read) return false;
    const own = new Set();
    for (const member of classNode.body?.body ?? []) {
      if (!member.static) continue;
      const key = foldedPropertyKeyName(member);
      if (key === null) return true;
      own.add(key);
    }
    return [...read].some(key => key === null || !own.has(key));
  }
  // one record per mutation target: the node whose chain the naming walk reads, plus the facts
  // only the visit frame / the push site knows. `viaTopLevelThis` says a `this` root IS the
  // global object here; `installsUnknownKeys` marks a MUTATOR-CALL receiver, whose written keys
  // live in the call's source argument and never in the target's own chain; `bareCallee` names
  // the identifier such a call was made through, which decides whether it can be a mutator at all
  const targets = [];
  let markTopLevelThis = false;
  function pushTarget(node, { installsUnknownKeys = false, bareCallee = null } = {}) {
    if (!node) return;
    targets.push({ node, viaTopLevelThis: markTopLevelThis, installsUnknownKeys, bareCallee });
  }
  const valueBound = new Set();
  // names this file binds to a FUNCTION literal - the only callees the scoped stage's inline-call
  // canon can follow to a return value, so the only ones a call-rooted chain may not rule out
  const functionBound = new Set();
  // every name this file IMPORTS: the one binding shape whose value the census cannot read, so a
  // mutator could hide behind any of them (`import dp from '@core-js/pure/object/define-property'`)
  const importBound = new Set();
  // name -> container nodes: the gate checks the chain's FIRST key against the container's
  // static keys, so `config.foo.bar = v` over `const config = {}` stays silent while
  // `NS.M.of = v` over `const NS = { M: Map }` fires
  const containerBound = new Map();
  // raw `[rootName, key]` of every member WRITE, filtered at publish time to roots that are actually
  // bound to a container literal. a single-hop write to a local object is no built-in mutation - the
  // namespace gate rightly drops it - but it DOES replace what that container's slot holds, and the
  // receiver walk must stop trusting the literal's initial member. collected raw because the
  // declaration may be traversed after the write
  const rawSlotWrites = [];
  // receivers of an in-place array mutator: these REPOSITION existing indices, so the literal's
  // element list stops describing what a slot holds. `push` only appends and the `to*` / `with`
  // family returns copies, so neither disturbs an existing index
  const rawRepositioned = [];
  // every raw record carries the SCOPE CHAIN it was spelled in (`frame.scopes`, kept current by
  // `visit`): at publish time a name resolves to the declaration its chain reaches, so two
  // functions each declaring `r` never pool their records - one test's `f(r)` does not write the
  // other's container. a name no chain declares is a global, and no container of this file
  let currentScopes = [];
  // a slot write / escape record, stamped with the chain it was spelled in
  function recordSlotWrite(name, keys, value = null) {
    rawSlotWrites.push([name, keys, value, currentScopes]);
  }
  // a repositioning invocation's record, stamped the same way
  function recordRepositioned(name, values) {
    rawRepositioned.push([name, values, currentScopes]);
  }
  // the declarations this file makes, by name: each with the scope-rebinding node that owns it
  // (null for the module scope), the chain enclosing it, and the declaring node - the binding
  // identity the receiver walk hands back to ask about a container by DECLARATION, not by name
  const declared = new Map();
  // one declaration of `name`: in the innermost scope of the current chain unless the caller names it
  function declare(name, node, scope = declarationScopeIn(null, currentScopes)) {
    let entries = declared.get(name);
    if (!entries) declared.set(name, entries = []);
    entries.push({ scope, scopes: currentScopes, node });
  }
  const containerDeclarations = [];
  // a container declaration: the literal (or class) a name is bound to, and whether it is an ARRAY
  // literal - inert as data until a mutator installs a built-in, a container otherwise
  function declareContainer(name, node, literal, { arrayLiteral = false, kind = null } = {}) {
    containerDeclarations.push({
      name, scope: declarationScopeIn(kind, currentScopes), scopes: currentScopes, node, literal, arrayLiteral,
    });
  }
  // the bindings a node DECLARES: a parameter in the scope the function opens, a catch parameter
  // in its clause's, a function / class / import name in the scope around it (a class is a
  // container of statics too)
  function declareOwnBindings(node) {
    if (FUNCTION_LIKE_NODE_TYPES.has(node.type)) {
      for (const param of node.params ?? []) walkPatternIdentifiers(param, id => declare(id.name, node, node));
    } else if (node.type === 'CatchClause' && node.param) {
      walkPatternIdentifiers(node.param, id => declare(id.name, node, node));
    } else if (node.type === 'ImportDeclaration') {
      for (const specifier of node.specifiers ?? []) {
        if (!specifier.local?.name) continue;
        importBound.add(specifier.local.name);
        declare(specifier.local.name, node);
      }
    }
    if (node.id?.type !== 'Identifier') return;
    if (node.type === 'FunctionDeclaration') {
      functionBound.add(node.id.name);
      declare(node.id.name, node);
    } else if (node.type === 'ClassDeclaration') {
      let nodes = containerBound.get(node.id.name);
      if (!nodes) containerBound.set(node.id.name, nodes = []);
      nodes.push(node);
      declare(node.id.name, node);
      declareContainer(node.id.name, node, node);
    }
  }
  // a PLAIN ALIAS re-homes a value under a name this census can still follow: writes and escapes
  // spelled through the alias canonicalize onto the aliased path at publish time, so the alias's
  // own declaration is no escape of the slot (`const a = r.w`, and `var _r$w = r.w` - the spelling a
  // destructure lowering ahead of this plugin leaves), and the receiver walk keeps descending the
  // literal for a read through it. a name that takes a SECOND value is no plain alias: every value
  // it held escapes as before. `aliasValues` collects per name, `plainAliases` is the publish-time verdict
  const aliasValues = new Map();
  // the `Object.assign` targets whose written keys are recorded EXACTLY, so the generic
  // handed-to-a-call escape does not have to answer for them with its wildcard
  const assignInstallTargets = new Set();
  // an OBJECT PATTERN detaches a method exactly like a member read does (`const { reverse } = box`),
  // just without a MemberExpression node - record the source the same way. non-computed keys only:
  // a computed key resolves through the member-read guard when it is static, and a dynamic one
  // already deopts the read side
  // a container ESCAPES wherever this file hands its reference to a reader whose own writes never
  // spell the container's name at a member-write site. that is the RULE, and the visit arms below
  // are its enumeration, not a list of shapes met one by one: an argument of any call / new /
  // tagged template, a thrown value, a for-of iterable, a value RETURNED or yielded out of a
  // function, a module EXPORT, and every slot a re-home writes the reference into - another
  // binding, a member target, a class field. the container may sit INSIDE that value - an array /
  // object literal, a member read off one, a spread, a branch - so the walk descends value
  // positions recursively. one wildcard covers the family; publish-time filtering keeps it to
  // container bindings, and the global flavor stays untouched (the bail is method-aware at the
  // reader)
  // no step budget: every push is a strict SUB-NODE of what was popped, so the worklist drains in
  // the subtree's own size. the budget it used to carry guarded no cycle - it only dropped the
  // arguments pushed FIRST, and a dropped escape is an under-record the reader cannot see
  function recordEscapedContainers(argNodes) {
    const work = [...argNodes ?? []];
    while (work.length) {
      const node = unwrapRuntimeExpr(work.pop());
      if (!node) continue;
      switch (node.type) {
        case 'Identifier': recordSlotWrite(node.name, ['*']); break;
        case 'SpreadElement': case 'RestElement': work.push(node.argument); break;
        case 'ArrayExpression': work.push(...node.elements); break;
        case 'ObjectExpression':
          for (const prop of node.properties) {
            work.push(prop.type === 'SpreadElement' ? prop.argument : prop.value);
          }
          break;
        case 'MemberExpression': case 'OptionalMemberExpression': {
          // a member read re-homes the SLOT's value, not its owner: `const m = NS.M` leaks what
          // slot M holds (writes through `m` are invisible under `NS.M`), while NS itself stays
          // put - and the slot is the one the read LANDS on, named by its whole key path off the
          // root binding (`f(ns.g.Map)` leaks `ns.g.Map`, not the `ns.g` it navigates through).
          // a root no binding names descends instead
          const { root, keys } = memberSlotPath(node);
          if (keys) recordSlotWrite(root.name, keys);
          else work.push(root);
          break;
        }
        case 'ConditionalExpression': work.push(node.consequent, node.alternate); break;
        case 'LogicalExpression': work.push(node.left, node.right); break;
        case 'SequenceExpression': work.push(node.expressions.at(-1)); break;
        // any other shape (a call result, a literal, a class) is not a traced container leak
      }
    }
  }

  // a PATTERN over a LITERAL init re-homes exactly the members that land on an IDENTIFIER binding
  // (`const [a] = [box]` makes `a` the container itself), so those values escape. a NESTED pattern
  // keeps unpacking - a read - so it recurses only where its value is itself a literal; a nested
  // pattern over an Identifier is the plain container read and must stay live (the flatten fixtures
  // depend on it). a rest target swallows the untraversed remainder, so that remainder escapes
  function recordPatternLiteralReHomes(patternNode, initNode) {
    if (initNode?.type !== 'ArrayExpression' && initNode?.type !== 'ObjectExpression') return;
    const pairs = [];
    if (patternNode.type === 'ArrayPattern' && initNode.type === 'ArrayExpression') {
      // the init read at its runtime positions; where a spread of a binding leaves none, every
      // element from it on may land in any later slot, so the slot escapes them all
      const expanded = positionalElements(initNode.elements);
      const spreadAt = initNode.elements.findIndex(item => item?.type === 'SpreadElement');
      const shifted = spreadAt === -1 ? [] : initNode.elements.slice(spreadAt);
      patternNode.elements.forEach((target, index) => {
        if (!target) return;
        if (target.type === 'RestElement') pairs.push([target.argument, { rest: expanded ? expanded.slice(index) : initNode.elements }]);
        else if (resolveCallArgumentCoords(initNode.elements, index)) pairs.push([target, resolveCallArgument(initNode.elements, index)]);
        else pairs.push([target, { rest: shifted }]);
      });
    } else if (patternNode.type === 'ObjectPattern' && initNode.type === 'ObjectExpression') {
      for (const prop of patternNode.properties) {
        if (prop.type === 'RestElement') {
          pairs.push([prop.argument, { rest: initNode.properties }]);
          continue;
        }
        if (prop.type !== 'ObjectProperty' && prop.type !== 'Property') continue;
        const wanted = foldedPropertyKeyName(prop);
        // a duplicated key is LAST-wins, like the canonical pattern pairer reads it - taking the
        // first match re-homed a value the literal no longer holds
        const match = wanted === null ? null : initNode.properties.findLast(entry => (entry.type === 'ObjectProperty'
          || entry.type === 'Property') && !entry.computed && propertyKeyName(entry) === wanted);
        pairs.push([prop.value, wanted === null ? { rest: initNode.properties } : match?.value]);
      }
    } else return;
    for (const [rawTarget, value] of pairs) {
      // a slot DEFAULT is a second value the binding can hold (`var [a = registry] = []` binds
      // the registry), so it escapes like the paired one; peeling to the target dropped it
      if (rawTarget?.type === 'AssignmentPattern') recordEscapedContainers([rawTarget.right]);
      const target = patternSlotTarget(rawTarget);
      if (value && typeof value === 'object' && 'rest' in value) {
        for (const entry of value.rest) {
          recordEscapedContainers([entry?.type === 'ObjectProperty' || entry?.type === 'Property' ? entry.value : entry]);
        }
        continue;
      }
      if (!value) continue;
      if (target?.type === 'Identifier') recordEscapedContainers([value]);
      else if (isDestructurePattern(target)) {
        recordPatternLiteralReHomes(target, unwrapRuntimeExpr(value));
      }
    }
  }

  function recordPatternDetachedRepositioners(patternNode, sourceNode) {
    const source = unwrapRuntimeExpr(sourceNode);
    if (patternNode?.type !== 'ObjectPattern' || source?.type !== 'Identifier') return;
    for (const prop of patternNode.properties) {
      if (prop.type !== 'ObjectProperty' && prop.type !== 'Property') continue;
      const key = foldedPropertyKeyName(prop);
      // an unfoldable computed key detaches an UNKNOWN member - admit the possibility, like the
      // member-read guard does; a numeric key is a plain slot read and detaches nothing
      const detaches = key !== null ? ARRAY_REPOSITIONING_METHODS.has(key)
        : prop.computed && plainSynthKeyName(prop.key) === null;
      if (detaches) recordRepositioned(source.name, []);
    }
  }
  // the alias-source roots of a value: EVERY leaf of the composite, not just the first one
  // (`var O = c ? Object : Reflect` lost `Reflect` to a `[0]` read), stamped with the frame fact
  // only the visit can see - a `this` root is the global object where IT sits, not where a later
  // write does. the roots stay raw: naming them here would read a half-built alias map, so the
  // resolution is the reader's, at `result` time
  function sourceRoots(valueNode) {
    const roots = collectGateRoots(valueNode, []);
    for (const root of roots) if (root.thisRooted) root.viaTopLevelThis = markTopLevelThis;
    return roots;
  }

  // alias name -> what its source stands for: the source's own gate roots, a bare KEY name for a
  // pattern slot (`const { Object: O } = globalThis` makes O the `Object` namespace), or null
  // when the gate cannot tell and the point query must open
  const aliasSourceRoot = new Map();

  // the map is flat and scope-blind, so one name may be recorded from several declarations and
  // several writes (`a ||= box` keeps what `a` already held). those are ALTERNATIVES, not a
  // correction - last-write-wins dropped every earlier source without opening the query
  function recordAliasSource(name, sources) {
    const known = aliasSourceRoot.get(name);
    if (known === null) return;
    if (sources === null || known === undefined) aliasSourceRoot.set(name, sources);
    else aliasSourceRoot.set(name, [...known, ...sources]);
  }
  // bindings that ARE the global object (a proxy-entry import / require): a chain off one names the
  // namespace in its FIRST key exactly as `globalThis.Object` does
  const proxyGlobalBound = new Set();
  // the module source a `require('<entry>')` / `<interop>(require('<entry>'))` init names, or null.
  // the require shape itself comes from the shared canon (it also knows the optional-call, sequence
  // -callee and TS-wrapper spellings); this adds only the single interop-wrapper layer, matched by
  // SHAPE rather than by helper name so every bundler's spelling is covered
  function requiredSourceOfInit(value) {
    const node = unwrapRuntimeExpr(value);
    const direct = requireCallSource(node);
    if (direct) return direct;
    const inner = node?.type === 'CallExpression' && node.arguments?.length === 1 ? node.arguments[0] : null;
    return inner ? requireCallSource(inner) : null;
  }

  // the value a binding takes - a declarator's init, an assignment's right side, a for-of head's
  // sole element - classified once: alias, container, function, proxy-global; a pattern id re-homes
  // the literal's slots instead
  function recordValueSource(id, rawValue, declaratorNode = null, kind = null) {
    // a declarator without an init stores nothing yet: it is neither an alias nor a container, and
    // counting it as a value would make the for-of head's element a SECOND value of its binding
    if (!rawValue) return;
    // a value RE-HOMED under another name escapes like a call argument does: an alias
    // (`const a = box`) takes writes the container's own name never sees, and a wrapper literal
    // (`const w = { ref: box }`) hands the same reference out through its member chain. the walk
    // is the shared escape collector, so the two families cannot drift. a PATTERN id is a READ
    // (`const { k } = box` unpacks, it re-homes nothing) - escaping it would bail every clean
    // destructure in the file. an identity self-assign (`box = box`) re-homes nothing either -
    // the value stays under the ONE name the census already tracks
    // the value the binding HOLDS is the write-value canon's answer: an effect prefix ran at the
    // declaration and a chain assignment installed its tail (`const a = (se(), r.w)`) - the reader
    // walk follows the same value, so the two agree on what is an alias
    const held = installedWriteValue(rawValue);
    const identitySelfAssign = id?.type === 'Identifier' && held?.type === 'Identifier' && held.name === id.name;
    if (id?.type === 'Identifier' && !identitySelfAssign) {
      // a SELECTING init stands for each of its ARMS at once - the name reaches whichever container
      // the branch settles on - so it records one alias value per arm. read as a single value the
      // selection has no target at all, and every arm was filed as a container the file had lost
      // track of: both families then owed their whole namespace for one static read through the name
      const arms = selectingValueArms(unwrapRuntimeExpr(held));
      const armValues = arms?.map(arm => ({ rawValue: arm, target: plainAliasTarget(unwrapRuntimeExpr(arm)), scopes: currentScopes }));
      const recorded = armValues?.every(item => item.target)
        ? armValues : [{ rawValue: held, target: plainAliasTarget(held), scopes: currentScopes }];
      // a container LITERAL bound to a name is a WRAPPER: a container it holds by NAME stays followable
      // (writes through the wrapper reach it at publish time), everything else inside escapes
      if (recorded.length === 1 && !recorded[0].target) {
        recordEscapedContainers(wrapperLiteralEscapes(unwrapRuntimeExpr(held)));
      }
      aliasValues.set(id.name, [...aliasValues.get(id.name) ?? [], ...recorded]);
    } else if (isDestructurePattern(id)) {
      recordPatternLiteralReHomes(id, unwrapRuntimeExpr(held));
    }
    // classification reads the VALUE, not its wrapper: a TS cast / paren around a container init
    // (`const w = { k: Object } as T`) otherwise lands on the alias path and the binding never
    // registers as a container - the slot-write filter then drops its writes at publish time
    const value = unwrapRuntimeExpr(held);
    if (id?.type === 'Identifier'
      && (value?.type === 'FunctionExpression' || value?.type === 'ArrowFunctionExpression')) {
      functionBound.add(id.name);
    }
    if (id?.type === 'Identifier') {
      // module lowering turns a proxy-entry import into a require (bare, or behind an interop
      // wrapper whose `.default` is the global) - the gate must name those bindings too
      const required = requiredSourceOfInit(value);
      if (required && globalProxyNameFromImportSource(required, packages)) proxyGlobalBound.add(id.name);
      // an array literal is inert as DATA, but a container when a slot could hold a built-in: its
      // slots are index-keyed members the receiver walk descends, so a patch THROUGH one
      // (`box[0].from = shim`) has to reach the gate or the polyfill overrides the replacement.
      // a data-only array stays inert - marking every `[1, 2, 3]` deopts namespaces wholesale,
      // since a chain whose first key cannot be read keeps every bound container in play
      // the container the binding HOLDS: the init's own literal, or the one a nav rooted at a
      // literal names - the reader walk folds such a nav into its descent, so the write side has to
      // index the binding through the same literal. classification runs on that, escapes and the
      // alias family below still on the init the source spells
      // ... and the container an INLINE call yields: the binding holds that literal, and each slot the
      // body filled from a parameter holds the argument the call passed there. filed as the container
      // plus one slot write per such slot - the shapes this census already indexes
      const yielded = inlineCallYieldedContainer(value, unwrapRuntimeExpr);
      if (yielded) {
        declareContainer(id.name, declaratorNode, yielded.literal,
          { arrayLiteral: yielded.literal.type === 'ArrayExpression', kind });
        for (const [keyPath, at] of yielded.slots) {
          if (yielded.args[at]) recordSlotWrite(id.name, keyPath, yielded.args[at]);
        }
        return;
      }
      const container = literalRootedContainer(value) ?? value;
      const arrayContainer = container?.type === 'ArrayExpression' && container.elements.some(canHoldBuiltIn);
      // every array-literal binding, the inert ones included: a mutator invocation may INSTALL a
      // built-in into one later (`const b = []; b.push(Map)`), which promotes it at publish time
      if (container?.type === 'ArrayExpression') declareContainer(id.name, declaratorNode, container, { arrayLiteral: true, kind });
      if (!arrayContainer && (!value || INERT_VALUE_TYPES.has(value.type))) return;
      if (arrayContainer || container.type === 'ObjectExpression' || container.type === 'ClassExpression') {
        let nodes = containerBound.get(id.name);
        if (!nodes) containerBound.set(id.name, nodes = []);
        nodes.push(container);
        declareContainer(id.name, declaratorNode, container, { kind });
      } else {
        valueBound.add(id.name);
        // an alias stands for whatever its source value names (`const O = Object`, `const R =
        // globalThis.Reflect`); a source the naming rule cannot follow answers for itself, so
        // there is no shape to pre-filter here
        recordAliasSource(id.name, sourceRoots(value));
      }
    } else if (isDestructurePattern(id)) {
      // pattern slots pair positionally / by key downstream - flat over-approximation here
      recordPatternSlots(id, null, value);
    }
  }

  // an object-pattern slot extracts the property its KEY names, so that key is what the slot can
  // stand for (`const { Object: O } = globalThis` makes O the `Object` namespace). a positional or
  // computed slot names nothing the gate can follow, and keeps the point query open
  function recordPatternSlots(pattern, names, source) {
    if (!pattern || typeof pattern !== 'object') return;
    switch (pattern.type) {
      case 'Identifier':
        valueBound.add(pattern.name);
        recordAliasSource(pattern.name, names);
        return;
      case 'ObjectPattern':
        for (const prop of pattern.properties ?? []) {
          // a rest binding holds a FRESH object built from the remainder - it stands for no
          // namespace at all, which is an answer, not the "cannot tell" that opens the query
          if (prop.type === 'RestElement') {
            recordPatternSlots(prop.argument, [], null);
            continue;
          }
          const key = prop.computed ? null : propertyKeyName(prop);
          recordPatternSlots(prop.value, key === null ? null : [key], null);
        }
        return;
      case 'ArrayPattern': {
        // a positional slot takes the source's element: an array LITERAL names it exactly, and any
        // other source names whatever its own chain starts from - the resolver could only follow it
        // that far either. an unreadable source keeps those slots open
        const elements = unwrapRuntimeExpr(source)?.type === 'ArrayExpression'
          ? unwrapRuntimeExpr(source).elements : null;
        const fallback = source ? sourceRoots(source) : null;
        for (let i = 0; i < (pattern.elements?.length ?? 0); i++) {
          const slotSource = elements ? elements[i] : null;
          recordPatternSlots(pattern.elements[i], elements
            ? (slotSource ? sourceRoots(slotSource) : []) : fallback, null);
        }
        return;
      }
      case 'AssignmentPattern':
        recordPatternSlots(pattern.left, names, null);
        return;
      case 'RestElement':
        recordPatternSlots(pattern.argument, [], null);
        return;
      default: {
        // a MEMBER target inside a pattern (`({ a: obj.Map } = src)`) binds NOTHING - it is a
        // write target, and the generic child walker handed back its property NAME as a binding
        // that does not exist, opening the point query on an invented alias
        if (pattern.type === 'MemberExpression' || pattern.type === 'OptionalMemberExpression') return;
        // a wrapper around a target keeps the binding underneath it
        const peeled = unwrapRuntimeExpr(pattern);
        if (peeled !== pattern) recordPatternSlots(peeled, names, source);
      }
    }
  }
  // the container SLOT a member chain names, in the one spelling every record of this census owes:
  // the root binding plus the whole KEY PATH under it, not one key - a container nested inside
  // another (`const w = { a: { b: Object } }; w.a.b = Map`) has no name of its own, so a
  // single-key record could neither be written for it nor asked about it. an unreadable hop ends
  // the path in the wildcard - the access lands somewhere under the prefix that is readable.
  // `keys` is null where no root binding names the chain, and the root rides back for the caller
  // that descends it
  function memberSlotPath(member) {
    const { root, keys } = memberChainKeys(member);
    if (root?.type !== 'Identifier' || !keys.length) return { root, keys: null };
    const unreadable = keys.indexOf(null);
    return { root, keys: unreadable === -1 ? keys : [...keys.slice(0, unreadable), '*'] };
  }

  // the container-slot record every member WRITE owes, whatever statement hosts it: the write
  // replaces what the literal's member held, so the receiver walk must stop trusting it. `value`
  // is the installed one where a write spells it verbatim, and absent where it derives one
  function recordMemberSlotWrite(member, value = null) {
    const { root, keys } = memberSlotPath(member);
    if (keys) recordSlotWrite(root.name, keys, value);
  }

  function recordCallArguments(node) {
    const pairing = callPairing(node, programNode);
    if (!pairing?.args.length) return;
    const callee = peelToBareExpr(pairing.callee);
    // a `super(...)` names its function through the class it stands in, which the census's frame
    // cannot reach - so the arguments wait here and pair with every superclass this file names.
    // over-recording across classes is the direction this census owes, the same one its
    // scope-blind method keys already take
    if (callee?.type === 'Super') {
      superCallArguments.push({ args: pairing.args, atTopLevel: markTopLevelThis });
      return;
    }
    // a callee that IS the function literal needs no name on either side - the call and the
    // parameter list sit on the same node, so the pairing keys by that node. recording the
    // parameters HERE and not at the function's own visit is what keeps the shape parser-neutral:
    // the peel above already crossed the parenthesis one parser emits and the other does not
    const key = calleeOwnerName(callee) ?? (FN_NODE_TYPES.has(callee?.type) ? callee : null);
    if (key === null) return;
    if (typeof key !== 'string' && key.params?.length) functionParams.set(key, key.params);
    pushCallArguments(key, pairing.args);
  }

  // the frame flag rides along: a `this` argument is the realm object where the CALL sits, and
  // the pairing below runs after the walk, where no frame is left to ask
  function pushCallArguments(key, args, atTopLevel = markTopLevelThis) {
    let calls = callArguments.get(key);
    if (!calls) callArguments.set(key, calls = []);
    calls.push({ args, atTopLevel });
  }

  // the parameter lists of every function this file names, so the pairing below can put a call's
  // argument into the parameter it lands in. a METHOD is named by its KEY, and the call side names
  // the same way - the pairing is scope-blind either way, so an unrelated same-named method only
  // over-records, which is the direction this census owes
  function recordFunctionParams(node, frame) {
    // a CLASS names its constructor - `new Ctor(x)` is how the call spells the pairing, while the
    // method itself is keyed `constructor` on both parsers, which would put every class in the
    // file under one entry
    if (CLASS_NODE_TYPES.has(node.type)) {
      // the base's NAME on the same reading the CALL side takes: a bare base names itself, a
      // container-held one names its slot key - which is how the params of the class in that slot
      // were recorded, so a base reached through a hop pairs its super() arguments like a bare one
      const superName = calleeOwnerName(peelToBareExpr(node.superClass));
      if (superName !== null) superClassNames.add(superName);
      const name = node.id?.type === 'Identifier' ? node.id.name : null;
      if (name !== null) {
        const params = classConstructorParams(node);
        if (params?.length) functionParams.set(name, params);
      }
      return;
    }
    if (!FUNCTION_LIKE_NODE_TYPES.has(node.type) || !node.params?.length) return;
    const owner = functionOwnerName(node, frame?.parentNode);
    if (owner !== null) functionParams.set(owner, node.params);
  }

  // the write-TARGET ladder, one for every host that has one: a member, a destructure pattern or
  // a bare name are the three shapes a target takes, and the hosts differ only in what the RIGHT
  // side IS - an assignment stores it in the target, a for-x head ITERATES it and stores its
  // elements, which is why the value-source half is the caller's answer and not the shape's.
  // `installed` is the value the write spells verbatim, absent where it derives or iterates one
  function recordWriteTarget(left, right, { rightIsTheValue, installed = null }) {
    if (left?.type === 'MemberExpression' || left?.type === 'OptionalMemberExpression') {
      // an unreadable write key writes an UNKNOWN slot - the wildcard admits the possibility,
      // mirroring the read guard's rule for an unreadable member key
      recordMemberSlotWrite(left, installed);
      // ... and the value the write STORES is re-homed onto a member (`registry.ref = box`,
      // `exports.cache = box`, `this.store = box`), where a later write through the new path
      // spells nothing this census can see
      if (installed) recordEscapedContainers([installed]);
      pushTarget(left);
      return;
    }
    if (isDestructurePattern(left)) {
      // an assignment pattern detaches a repositioner exactly like its declaration twin -
      // `({ reverse } = box)` and `var { reverse } = box` take the same method off the same
      // container, so both arms owe the same record
      recordPatternDetachedRepositioners(left, right);
      gatherPatternMemberTargets(left, member => {
        recordMemberSlotWrite(member);
        pushTarget(member);
      });
      // bare identifier elements assign global slots like the flat form - gate on them too
      walkPatternIdentifiers(left, id => pushTarget(id));
      if (rightIsTheValue) recordValueSource(left, right);
      else recordPatternLiteralReHomes(left, unwrapRuntimeExpr(right));
      return;
    }
    if (rightIsTheValue) recordValueSource(left, right);
    // a bare reassignment of a global name writes the global slot - the Identifier itself gates
    // the scoped pass (bound / lowercase writes filter out there)
    if (left?.type === 'Identifier') pushTarget(left);
  }

  // iterating hands each VALUE to the loop binding - writes through it never spell the source's
  // name, so the iterable escapes like a call argument. a head binding a NAME over a LITERAL is the
  // exception the receiver walk reads through: with ONE element the binding stands for it exactly
  // as a declarator init would (`for (const item of [box])` re-homes `box` under `item`, `[{ w:
  // Object }]` makes `item` the container); with several, the head is a container over every
  // literal element - a write through it replaces a slot of each - while a named element escapes
  function recordForOfIterable(node) {
    const head = node.left.type === 'VariableDeclaration' && node.left.declarations.length === 1
      ? node.left.declarations[0] : null;
    const elements = forOfIterableElements(node);
    if (head?.id?.type !== 'Identifier' || !elements) {
      recordEscapedContainers([node.right]);
      return;
    }
    // the head binds INSIDE the loop's own scope, the frame its declarator is visited in - the
    // records made here, at the loop node, have to name that chain or the alias never pairs with
    // its declaration
    const outerScopes = currentScopes;
    currentScopes = [...currentScopes, node];
    if (elements.length === 1) recordValueSource(head.id, elements[0], head, node.left.kind);
    else {
      for (const element of elements) {
        const value = unwrapRuntimeExpr(element);
        if (value?.type === 'ObjectExpression' || value?.type === 'ArrayExpression') {
          declareContainer(head.id.name, head, value, { kind: node.left.kind });
        } else recordEscapedContainers([element]);
      }
    }
    currentScopes = outerScopes;
  }

  // a declarator binds its names in the scope its declaration's KIND lands in (the declaration is
  // the frame's parent node), and records the value it takes
  function recordDeclarator(node, frame) {
    const { kind = null } = frame?.parentNode ?? {};
    walkPatternIdentifiers(node.id, id => declare(id.name, node, declarationScopeIn(kind, currentScopes)));
    recordPatternDetachedRepositioners(node.id, node.init);
    recordValueSource(node.id, node.init, node, kind);
  }

  // a for-x head assigns its target once per iteration - the same write shapes the flat `=` form
  // has, so it is classified through the same peel (`(NS.M) of xs`, `(NS.M as any) of xs`) rather
  // than off the raw node type, which answered differently on the two parsers. what it iterates is
  // never the target's own value: the loop binds the ELEMENTS
  function recordForXHead(node) {
    recordWriteTarget(unwrapRuntimeExpr(node.left), node.right, { rightIsTheValue: false });
  }

  function recordAssignment(node) {
    // plain and logical assigns install the right operand verbatim, while an arithmetic compound
    // DERIVES its value, so no candidate is known for it
    recordWriteTarget(unwrapRuntimeExpr(node.left), node.right, {
      rightIsTheValue: true, installed: VALUE_FLOW_ASSIGN_OPS.has(node.operator) ? node.right : null,
    });
  }

  function visit(node, frame) {
    programNode ??= node;
    markTopLevelThis = !!frame?.atThisTopLevel;
    currentScopes = frame?.scopes ?? [];
    declareOwnBindings(node);
    if ((node.type === 'MemberExpression' || node.type === 'OptionalMemberExpression')
      && !frame?.underTypeAnnotation) {
      const owner = unwrapRuntimeExpr(node.object);
      if (owner?.type === 'Identifier') {
        const key = memberKeyName(node);
        recordMemberRead(owner.name, key);
        if (key === null) opaquelyRead.add(owner.name);
      }
    }
    // ANY read of an in-place array mutator off an identifier makes that receiver's element list
    // untrustworthy: the inline call, the detached `.call` / `.apply` / `Reflect.apply` spellings and
    // a method stored for later (`const m = box.reverse; m.call(box)`) all pass through this ONE
    // member read - once the method escapes, its invocation is not statically visible at all.
    // publish-time filtering keeps this to container bindings, so data arrays cost nothing
    if ((node.type === 'MemberExpression' || node.type === 'OptionalMemberExpression')
      && !frame?.underTypeAnnotation && memberReadDetachesRepositioner(node)) {
      const owner = unwrapRuntimeExpr(node.object);
      if (owner?.type === 'Identifier') {
        // an invocation's value arguments land in the container's slots - record them as
        // reaching candidates on the wildcard entry (`b.push(Map)` makes `Map` readable
        // through any slot). the direct call and the `Reflect.apply(b.push, b, [v])`
        // spelling are visible from this frame; the `.call` / `.apply` hop spellings are
        // recorded at their invocation's own visit below. a read detached into a variable
        // records the reposition alone - its invocation is not statically attributable
        recordRepositioned(owner.name, directInvocationValues(node, frame?.parentNode));
      }
    }
    // the `.call` / `.apply` hop spellings of a mutator invocation (`b.push.call(b, v)`,
    // `b.push.apply(b, [v])`): the whole shape is visible only from the invocation itself
    if (node.type === 'CallExpression') {
      recordHopInvocation(node, recordRepositioned);
      assignInstallTargets.add(recordAssignInstall(node, recordSlotWrite) ? node.arguments[0] : null);
    }
    recordCallArguments(node);
    recordFunctionParams(node, frame);
    switch (node.type) {
      case 'AssignmentExpression':
        recordAssignment(node);
        break;
      case 'UpdateExpression': {
        // a read-modify-WRITE of the same slot the plain `=` form writes, in either spelling -
        // the member (`box.M++`) or the bare global name (`Promise++`). the member spelling owes
        // the slot-write record too: it replaces what the literal's member held, and the value it
        // DERIVES is no reaching candidate
        const arg = unwrapRuntimeExpr(node.argument);
        if (arg?.type === 'MemberExpression' || arg?.type === 'OptionalMemberExpression') {
          recordMemberSlotWrite(arg);
          pushTarget(arg);
        } else if (arg?.type === 'Identifier') pushTarget(arg);
        break;
      }
      // `delete container.key` empties the slot the literal spells - the read after it must not
      // resolve the literal's member (native reads undefined / throws deeper). an unreadable key
      // deletes an UNKNOWN slot - the wildcard admits the possibility
      case 'UnaryExpression':
        if (node.operator === 'delete') {
          const target = unwrapRuntimeExpr(node.argument);
          if (target?.type === 'MemberExpression' || target?.type === 'OptionalMemberExpression') {
            recordMemberSlotWrite(target);
            pushTarget(target);
          }
        }
        break;
      case 'ForOfStatement':
        recordForOfIterable(node);
        recordForXHead(node);
        break;
      case 'ForInStatement':
        // `for-in` yields KEYS: the loop binding holds a string, never the container, so nothing
        // escapes here - reading `for (k in NS)` as a re-home deopted the whole container
        recordForXHead(node);
        break;
      case 'VariableDeclarator':
        recordDeclarator(node, frame);
        break;
      case 'ImportDeclaration':

        // a default OR namespace binding of a pure GLOBAL-PROXY entry (`import g from
        // '.../global-this'` / `import * as g` - bundler interop hangs the global on the
        // namespace's `.default`) is a mutation-host candidate exactly like `const g =
        // globalThis` - without it the gate never fires for `g.Map = shim` and the scoped
        // canon (which resolves the binding through the same import source) never runs.
        // `require`-style aliases already fire via the VariableDeclarator branch (a call
        // init is non-inert)
        if (globalProxyNameFromImportSource(node.source?.value, packages)) {
          for (const s of node.specifiers ?? []) {
            if ((bindsModuleDefault(s) || s.type === 'ImportNamespaceSpecifier') && s.local?.name) {
              valueBound.add(s.local.name);
              proxyGlobalBound.add(s.local.name);
            }
          }
        }
        break;
      case 'TSImportEqualsDeclaration':
        if (node.id?.name) importBound.add(node.id.name);
        // the TS require-import twin of the case above; adapter-less reducer reads the
        // module-reference string directly
        if (tsImportEqualsProxyName(node, null, packages)) {
          valueBound.add(node.id.name);
          proxyGlobalBound.add(node.id.name);
        }
        break;

      case 'ThrowStatement':
      case 'ReturnStatement':
      case 'YieldExpression':
      case 'ArrowFunctionExpression':
      case 'ExportDefaultDeclaration':
      case 'ExportNamedDeclaration':
      case 'PropertyDefinition':
      case 'ClassProperty':
        recordEscapedContainers(handedOutValues(node));
        break;
      case 'TaggedTemplateExpression':
        // the tag receives every interpolated value like a call receives its arguments
        recordEscapedContainers(node.quasi?.expressions);
        break;
      case 'NewExpression':
      case 'CallExpression':
      case 'OptionalCallExpression': {
        // ... except the target of an `Object.assign` whose sources are all readable: the keys it
        // writes are already recorded one by one, and the wildcard beside them would block every
        // OTHER slot of that container for a call whose writes this census can name
        recordEscapedContainers(node.arguments.filter(argument => !assignInstallTargets.has(argument)));
        // babel models `Object?.assign(Array, ...)` as OptionalCallExpression with an
        // OptionalMemberExpression callee; without these both an optional `Object.assign` /
        // `Reflect.defineProperty` mutation escapes the gate and usage-pure silently substitutes
        // over the user monkey-patch (oxc folds the optional into ChainExpression, so it is unaffected).
        // a wrapper-fronted (`(0, Object).assign`) or proxy-global-member / aliased (`globalThis.Reflect`,
        // `g.Reflect`) namespace fires the gate here too; the scoped stage verifies the proxy receiver
        const callee = peelToBareExpr(node.callee);
        const isMember = callee?.type === 'MemberExpression' || callee?.type === 'OptionalMemberExpression';
        const method = isMember && !callee.computed && callee.property?.type === 'Identifier' ? callee.property.name : null;
        // SUPERSET triggers, verified by the scoped stage: any member callee that is COMPUTED
        // (`Object[m]`, `O["defineProperty"]`) or carries a mutator-shaped NAME (a direct namespace,
        // a proxy-global chain, or an ALIASED receiver `const O = Object; O.defineProperty(...)`),
        // and any BARE identifier callee (an extracted / destructured mutator `dp(...)`). the
        // capitalized-root filter on the ARGUMENT keeps the ubiquitous lowercase calls
        // (`map.set(k, v)`, `cb(data)`) silent, preserving the gate's precision
        const fires = isMember
          ? (callee.computed || OBJECT_MUTATORS.has(method) || REFLECT_MUTATORS.has(method))
          : callee?.type === 'Identifier';
        if (fires && node.arguments?.[0]) {
          const bareCallee = isMember ? null : callee.name;
          pushTarget(node.arguments[0], { installsUnknownKeys: true, bareCallee });
          // Reflect.set(target, key, value, RECEIVER): a receiver arg redirects the data-property
          // write to the receiver, making IT the mutation host - flag both candidates
          if (node.arguments[3] && (method === 'set' || method === null || callee.computed)) {
            pushTarget(node.arguments[3], { installsUnknownKeys: true, bareCallee });
          }
        }
        break;
      }
      default:
    }
  }
  // the two facts the point query publishes, spelled the way the scoped set spells its keys:
  // a namespace whose MEMBERS a write may have replaced (`Array.of = f` -> `Array`), and a KEY
  // of the global object whose whole SLOT a write may have replaced (`window.Array = f`,
  // `Promise = Bluebird` -> the `globalThis.<key>` reading). the two answer different reader
  // questions and conflating them cost a live narrow in each direction
  const rootNames = new Set();
  const globalSlots = new Set();

  // the value a chain reads IS the global object - not a namespace on it
  const GLOBAL_OBJECT = Symbol('global-object');

  // every name a root IDENTIFIER can stand for, itself included, following the recorded alias
  // sources through the same naming rule. scope-LESS and binding-less by construction, which is
  // what separates it from the type layer's alias closures over host bindings (`const g = globalThis; const h = g` reaches the global
  // object from `h`). the visited set is the COMPLETE guard here - names are finite and each is
  // expanded once - so no step budget can exhaust and silently turn "cannot say" into "untouched"
  // memoized at the TOP of a walk only: a nested call carries the cycle state of the walk it sits
  // in, so its answer is that walk's, but a top-level one is a property of the graph - and the
  // graph is complete before the first query. without this a file whose functions share a parameter
  // name (`t`, `e`, `v` - most files) pays the whole accumulated fan once per write through it,
  // which is quadratic in a cheap pre-pass that exists not to be
  function aliasClosure(name, seen) {
    if (seen.size !== 0) return computeAliasClosure(name, seen);
    if (closureMemo.has(name)) return closureMemo.get(name);
    const closed = computeAliasClosure(name, seen);
    closureMemo.set(name, closed);
    return closed;
  }

  function computeAliasClosure(name, seen) {
    if (seen.has(name)) return [];
    seen.add(name);
    const source = aliasSourceRoot.get(name);
    if (source === undefined) return [name];
    if (source === null) return null;
    const names = [name];
    for (const entry of source) {
      const resolved = typeof entry === 'string' ? computeAliasClosure(entry, seen) : chainValueNames(entry, entry.keys, seen);
      if (!resolved) return null;
      if (resolved !== GLOBAL_OBJECT) names.push(...resolved);
      // a source that IS the global object keeps its proxy spelling in the list, so a chain off
      // this alias reads the same answer the direct spelling does
      else names.push('globalThis');
    }
    return names;
  }

  // can the scoped stage inline this call's return? only through a function literal it can name
  function followableCallee(root, seen) {
    if (root.calleeIsFunction) return true;
    if (root.calleeName === null) return false;
    if (functionBound.has(root.calleeName)) return true;
    const aliased = aliasClosure(root.calleeName, seen);
    return !aliased || aliased.some(name => functionBound.has(name));
  }

  // is the value under this chain the GLOBAL OBJECT - by name, by a proxy-entry binding, or
  // through the alias chain that leads to one?
  function reachesGlobalObject(names) {
    return names.some(name => POSSIBLE_GLOBAL_OBJECTS.has(name) || proxyGlobalBound.has(name));
  }

  // ONE rule for what a chain's VALUE stands for, asked by both consumers - the alias SOURCE
  // ("what does this binding hold") and a write's RECEIVER ("what is this write landing on").
  // `GLOBAL_OBJECT`, a name list, `[]` where the chain stands for nothing the scoped stage could
  // attribute either (the query may rule the file out), or `null` where this walk cannot tell -
  // the one channel the gate's superset property rides on, so every exit that cannot answer
  // takes it. `keys` is the member path READ off the root, which is not always the root record's
  // own path: a write consumes its last key as the slot it lands on
  function chainValueNames(root, keys, seen) {
    if (root.unnameable) return null;
    // whether the scoped stage can name a CALL root is decided by its callee: it inlines the
    // return through an inline function, or through a name this file binds to one - directly or
    // down the alias chain. a callee this file never binds (`require`, an import, a host global)
    // resolves to no function there either, so the query may rule it out
    if (root.callRooted) return followableCallee(root, seen) ? null : [];
    // a `this` root is the global object only in a top-level `this` context; anywhere else the
    // scoped stage attributes nothing, so `const scope = this` rules out instead of opening
    if (root.thisRooted && !root.viaTopLevelThis) return [];
    const rooted = root.thisRooted ? ['globalThis'] : aliasClosure(root.name, seen);
    if (!rooted) return null;
    let base = rooted;
    let rest = keys;
    if (reachesGlobalObject(rooted)) {
      // hops through the global object stay ON it (`globalThis.self.Object` reads `Object`), so
      // the namespace is the first key that is not a proxy name; all-proxy keys - or none at
      // all - leave the chain standing on the global object itself
      let index = 0;
      while (index < keys.length && POSSIBLE_GLOBAL_OBJECTS.has(keys[index])) index++;
      if (index === keys.length) return GLOBAL_OBJECT;
      // an unreadable key, or the interop `default` hop whose far side is the global again
      if (keys[index] === null || keys[index] === 'default') return null;
      base = [keys[index]];
      rest = keys.slice(index + 1);
    }
    // the chain stands on its base when it reads the base itself, or on the base's PROTOTYPE -
    // which the scoped stage keys under BOTH spellings (`Array.prototype.at = f` records
    // `Array.prototype.at` and taints `Array`), so both are published. deeper it reads a
    // container SLOT, which only a bound literal or a class static resolves, and only in the
    // scoped stage - so a base no literal is bound to keeps this answer while one that is opens
    if (!rest.length) return base;
    if (rest.length === 1 && rest[0] === 'prototype') return [...base, ...base.map(name => `${ name }.prototype`)];
    return base.some(name => containerBound.has(name)) ? null : base;
  }

  // record what ONE firing write target replaces; false where the walk cannot tell and the caller
  // must open the point query
  function publishWrite(root, installsUnknownKeys) {
    // a BARE target replaces the slot its own name spells, whatever that name is bound to -
    // exactly what the scoped stage records for `Promise = Bluebird` / `[Promise] = arr`
    if (!root.keys.length && !installsUnknownKeys) {
      if (!root.name) return false;
      globalSlots.add(root.name);
      return true;
    }
    // a MUTATOR CALL's receiver is the whole chain, and the keys it writes are spelled in the
    // call's source argument; every other write consumes its last key as the slot it lands on
    const writtenKey = installsUnknownKeys ? null : root.keys.at(-1);
    const receiver = chainValueNames(root, installsUnknownKeys ? root.keys : root.keys.slice(0, -1), new Set());
    if (!receiver) return false;
    // landing ON the global object, the write replaces one of its SLOTS - and a mutator call
    // names none of them here
    if (receiver === GLOBAL_OBJECT) {
      if (writtenKey === null) return false;
      globalSlots.add(writtenKey);
      return true;
    }
    for (const name of receiver) rootNames.add(name);
    // a key the write does not name deopts its receiver WHOLE, and for a PROTOTYPE receiver the
    // scoped stage spells that deopt as the constructor's own global slot
    if (writtenKey !== null) return true;
    for (const name of receiver) {
      if (name.endsWith('.prototype')) globalSlots.add(name.slice(0, -'.prototype'.length));
    }
    return true;
  }

  function result() {
    // the point-query gate: a slot of `Ctor` can only be written through a target whose chain
    // names `Ctor`. collecting those names lets a typing question about one slot skip the scoped
    // pass entirely, instead of paying a whole-file walk for a file that never touches that
    // namespace. `open` keeps the gate a SUPERSET of what the scoped pass can attribute: a chain
    // this walk cannot name rules nothing out
    // a PARAMETER holds whatever the calls in this file passed at its position: pair the two halves
    // so the gate fires on a write through it and the point query names what it can reach. the
    // pairing is coarse here - the whole argument, not the slot a destructured parameter selects -
    // because the gate only asks "could this reach a built-in"; the scoped stage pairs precisely
    function pairParam(param, valueNodes, atTopLevel) {
      const roots = valueNodes.flatMap(value => collectGateRoots(value, []));
      for (const root of roots) if (root.thisRooted) root.viaTopLevelThis = atTopLevel;
      walkPatternIdentifiers(param, id => {
        valueBound.add(id.name);
        recordAliasSource(id.name, roots);
      });
    }
    for (const { args, atTopLevel } of superCallArguments) {
      for (const name of superClassNames) pushCallArguments(name, args, atTopLevel);
    }
    for (const [owner, params] of functionParams) {
      // a parameter's own DEFAULT is a value it holds whenever the call omits the argument - it
      // needs no call at all, so it is paired outside the call loop
      params.forEach(param => {
        if (param.type === 'AssignmentPattern') pairParam(param.left, [param.right], false);
      });
      for (const { args, atTopLevel } of callArguments.get(owner) ?? []) {
        params.forEach((param, index) => {
          // a REST parameter holds EVERY argument from its position on, so it pairs with all of
          // them; every other parameter takes the one that lands in its slot
          const values = param.type === 'RestElement'
            ? restArgumentValues(args, index)
            : [resolveCallArgument(args, index)].filter(Boolean);
          if (values.length) pairParam(param, values, atTopLevel);
        });
      }
    }
    let open = false;
    let hasMutationShapes = false;
    for (const { node, viaTopLevelThis, installsUnknownKeys, bareCallee } of targets) {
      // a BARE callee reaches the mutators only through a binding that HOLDS one - an extracted
      // or destructured `Object.defineProperty`, or an import of its pure entry. a callee this
      // file binds to nothing of the sort (`foo(bar())`, in half of real files) classifies as no
      // mutator in the scoped stage either, so its arguments are no mutation targets
      if (bareCallee !== null && !valueBound.has(bareCallee) && !importBound.has(bareCallee)) continue;
      for (const root of collectGateRoots(node, [])) {
        root.viaTopLevelThis = viaTopLevelThis;
        const firstKey = root.keys[0] ?? null;
        // a `this`-rooted target fires when the key nearest the root is built-in-shaped, or
        // when the target is the bare `this` itself (a mutator-call arg whose resolvable
        // literal keys can land on the global). dynamic-key members (`this[k] = v`) and
        // lowercase instance writes (`this.x = v`) stay silent - the scoped stage records
        // nothing for them (global-object carve-out / the bare-write lowercase cut), so the
        // gate stays a superset without firing on these ubiquitous shapes
        let fires;
        if (root.unnameable || root.callRooted) fires = true;
        else if (root.thisRooted) {
          fires = firstKey === null ? !root.keys.length
            : (firstKey[0] >= 'A' && firstKey[0] <= 'Z') || POSSIBLE_GLOBAL_OBJECTS.has(firstKey);
        } else if (!root.keys.length && !installsUnknownKeys) {
          // a BARE write target replaces the SLOT its own name spells, and the scoped stage
          // records one only for a global-shaped name - an ordinary local reassignment
          // (`a = obj.k`, `[a] = arr`) is no mutation there, so it is none here either
          fires = isGlobalSlotName(root.name) || MINTED_CAPITALIZED_NAME.test(root.name);
        } else {
          // the same admission `bareGlobalSlotEntry` gives a write, so the gate cannot rule out
          // what the scoped stage records
          fires = isGlobalSlotName(root.name)
            // the minted ctor-import spelling (`_Map.groupBy = patched` - a second plugin pass
            // over rewritten output, or a user-held pure ctor binding): the underscore-led
            // capitalized shape is a real candidate; over-fire costs one scoped traverse
            || MINTED_CAPITALIZED_NAME.test(root.name)
            || POSSIBLE_GLOBAL_OBJECTS.has(root.name)
            || valueBound.has(root.name)
            // a container fires only for a CHAIN target (`NS.M.of = 1`): the write lands past
            // the slot the literal spells, so it can reach a built-in. the slot write itself
            // (`box.Array = Fake`) replaces no namespace - it rides the written-slot channel
            || (root.keys.length > 1 && containerHasKey(containerBound.get(root.name), firstKey));
        }
        if (!fires) continue;
        hasMutationShapes = true;
        if (!publishWrite(root, installsUnknownKeys)) open = true;
      }
    }
    // only a root BOUND to a container literal matters: `config.foo = v` over a plain object is
    // ordinary code, and reporting it would deopt every namespace read in the file. ONE published
    // map serves both records: a written slot as `name.key`, a repositioned container as the
    // wildcard `name.*` - repositioning invalidates every slot, and the reader checks both
    // spellings. the key is the BINDING's own name, never canonicalized onto `globalThis`: a
    // container is a local holder, and a holder that happens to be called `window` is not the
    // realm object - writing it under the proxy spelling put it where no reader ever looks.
    // each entry's value lists the KNOWN written value nodes of that slot (empty for
    // escapes / deletes; a repositioning INVOCATION contributes its value arguments - they land
    // in slots the walk cannot address), so usage-global can union the reaching candidates
    const writtenContainerSlots = new Map();
    function writtenSlot(slotKey) {
      let values = writtenContainerSlots.get(slotKey);
      if (!values) writtenContainerSlots.set(slotKey, values = []);
      return values;
    }
    const { qualify, containers, containerSlotIndex } = buildContainerIndex(declared, containerDeclarations);
    const plainAliases = publishPlainAliases(aliasValues, recordEscapedContainers, qualify);
    for (const [name, keys, value, scopes] of rawSlotWrites) {
      const key = qualify(name, scopes);
      if (!key) continue;
      for (const [root, path] of canonicalSlotPaths(plainAliases, key, keys)) {
        if (!containers.get(root)?.container) continue;
        const values = writtenSlot([root, ...path].join('.'));
        // the value the write INSTALLS (`w.k = q = Map` installs `Map`) - the write-value canon
        if (value) values.push(installedWriteValue(value));
      }
    }
    for (const [name, values, scopes] of rawRepositioned) {
      const key = qualify(name, scopes);
      if (!key) continue;
      // a mutator invocation whose arguments can hold a built-in PROMOTES an inert array-literal
      // binding to a container - the install is what makes its slots worth walking
      const installsBuiltIn = values.some(value => canHoldBuiltIn(value));
      for (const [root, path] of canonicalSlotPaths(plainAliases, key, [])) {
        const entry = containers.get(root);
        if (!entry?.container && !(installsBuiltIn && entry?.arrayLiteral)) continue;
        const sink = writtenSlot([root, ...path, '*'].join('.'));
        for (const value of values) if (value) sink.push(value);
      }
    }
    propagateWrapperWrites(writtenContainerSlots, containers, writtenSlot, qualify);
    // a container this file LOSES TRACK of - escaped, repositioned, written or read through a key
    // this pass cannot fold - hands its slots to reads no walk here resolves. every one of those
    // reads lands on whatever the literal spelled, so a bare constructor substituted into it has
    // to bring the constructor's statics along: the `*/constructor` entry installs none, and a
    // realm without the native then answers `undefined` where every engine with it answers the
    // member. the same rule the escape stamps apply to a ctor handed straight to a call
    // ... and a class whose OWN NAME is a static receiver here (`class C extends Map {}` then
    // `C.groupBy`) reads a static it INHERITS: the read lands on the base, through a binding the
    // reaching-value walk does not connect back to it, so the base owes its statics for the same
    // reason. a base whose statics are read through `super` inside the class body resolves on its
    // own and is not stamped - the escalation costs the whole namespace entry
    for (const [key, { name, literals, container }] of containers) {
      if (!container) continue;
      const opaque = writtenContainerSlots.has(`${ key }.*`) || opaquelyRead.has(name);
      // the inherited-static question is one a class asks ON TOP of the shape's own, never instead of
      // it: chained, that answer let an opaque class keep its own statics back, alone among containers
      for (const escaping of literals.flatMap(node => [
        opaque ? node : null,
        CLASS_NODE_TYPES.has(node.type) && readsInheritedStaticOf(node, name) ? node.superClass : null,
      ])) stampEscapesFrom(programNode, escaping);
    }
    return {
      hasMutationShapes,
      mutationRoots: { names: rootNames, globalSlots, open },
      writtenContainerSlots,
      containerSlotIndex,
      callArguments,
    };
  }
  return { visit, result };
}

function hasMutationCandidateShapes(programNode, packages = null) {
  return collectFileCensus(programNode, [mutationShapesReducer(packages)]).hasMutationShapes;
}

// any of the name's containers statically carries the chain's first key (object property or
// class static member); a dynamic key keeps the container in play
function containerHasKey(containers, key) {
  if (!containers) return false;
  // a chain key the cheap gate cannot read (computed const-alias `registry[k]`, dynamic key) keeps
  // every bound container in play - the scoped stage resolves it; a silent `false` here lets a
  // computed-key monkey-patch over a container slot escape before resolution runs
  if (!key) return true;
  for (const container of containers) {
    // an ARRAY container is keyed by INDEX, so its members are ELEMENTS, not named properties. this
    // cheap gate only has to admit the POSSIBILITY - the scoped stage resolves which slot it was. a
    // spread makes every later index unknowable, so it admits everything. load-bearing exactly
    // because a numeric hop RESOLVES: while it did not, the unreadable-key path admitted the shape
    // generously and this branch looked dead
    if (container.type === 'ArrayExpression') {
      if (container.elements.some(element => element?.type === 'SpreadElement')) return true;
      const index = canonicalArrayIndex(key);
      if (index !== null && index < container.elements.length) return true;
      continue;
    }
    const members = container.type === 'ObjectExpression' ? container.properties : container.body?.body;
    for (const member of members ?? []) {
      if (member.type === 'SpreadElement') return true;
      const name = propertyKeyName(member);
      if (name === null || name === key) return true;
    }
  }
  return false;
}

// --- Stage 2: per-site classification (shape only - shadow checks live in the resolver) ---

const OBJECT_MUTATORS = new Set([
  'defineProperty',
  'defineProperties',
  'assign',
]);

const REFLECT_MUTATORS = new Set([
  'defineProperty',
  'deleteProperty',
  'set',
]);

// the VariableDeclarator a name is bound by, adapter-agnostic. null for params / non-declarator
// bindings / REASSIGNED bindings - a reassigned name is not resolvable to its init (recording the
// stale init would keep an unrelated read native), mirroring `followConstLiteralAlias`
function bindingDeclarator(name, ctx) {
  const { scope, adapter, path } = ctx;
  if (!adapter.hasBinding(scope, name, path)) return null;
  const binding = adapter.getBinding(scope, name, path);
  // a REASSIGNED binding is not a resolvable mutator / source: recording its stale init would
  // keep an unrelated read native. the const idiom is the recorded channel - a documented
  // precision limit (locked by the resolve-node-type mutation pre-pass negatives)
  if (binding?.constantViolations?.length) return null;
  const decl = binding?.node;
  return decl?.type === 'VariableDeclarator' ? decl : null;
}

// every value a bound NAME can hold, read off its declarator through the canonical pattern /
// literal pairer and FANNED over composites - one resolver for both questions asked of a bound
// mutator name (what literal does it select, what namespace method does it hold), which had grown
// a copy each, one of them reading a sequence- or ternary-wrapped source as no value at all
function boundDeclaratorValues(name, ctx) {
  const decl = bindingDeclarator(name, ctx);
  if (!decl) return [];
  const raw = decl.id?.type === 'Identifier'
    ? [decl.init]
    : patternSlotValues(decl.id, decl.init, name, { ...ctx, resolveKey });
  const leaves = [];
  for (const value of raw) if (value) valueFanLeaves(value, leaves);
  return leaves;
}

// the literal init sub-node a destructured name selects (`const { s } = { s: {...} }` -> the inner
// literal)
function destructuredLiteralSource(node, ctx) {
  const id = unwrapRuntimeExpr(node);
  if (id?.type !== 'Identifier') return null;
  return boundDeclaratorValues(id.name, ctx).find(value => value.type === 'ObjectExpression') ?? null;
}

// the statically readable keys of a mutation-source object (`Object.assign` source /
// `defineProperties` descriptor map), plus an `open` flag: the source could carry keys BEYOND
// the listed ones - unresolvable to a literal at all, an unreadable property key, or a spread.
// an open source can have patched anything, so the caller deopts the receiver whole
function objectLiteralKeys(node, ctx) {
  // a variable source (`const src = { from: f }; Object.assign(Array, src)`) resolves to its const
  // init, so a copied static key is recorded like an inline `Object.assign(Array, { from: f })`;
  // a DESTRUCTURED source (`const { s } = { s: { from: f } }`) hides the literal behind a selector
  // the const-alias follower cannot see - pair the pattern with its literal init
  let obj = followConstLiteralAlias(node, ctx);
  if (obj?.type !== 'ObjectExpression') obj = destructuredLiteralSource(node, ctx);
  if (obj?.type !== 'ObjectExpression') return { keys: [], open: true };
  const keys = [];
  let open = false;
  for (const prop of obj.properties ?? []) {
    if (prop.type === 'ObjectProperty' || prop.type === 'Property' || prop.type === 'ObjectMethod') {
      const key = mutationKeyName(prop.key, prop.computed, ctx);
      if (key !== null) keys.push(key);
      else open = true;
    } else open = true;
  }
  return { keys, open };
}

// entries for a mutator whose source keys came back partially readable: the known keys record
// exactly, an open remainder deopts the receiver whole (`keys: null`)
function sourceKeysEntries(target, { keys, open }) {
  const entries = [];
  if (keys.length) entries.push({ targetNode: target, keys });
  if (open) entries.push({ targetNode: target, keys: null });
  return entries;
}

// `{ targetNode, keys }` entries for a mutation-shaped node; the Object / Reflect callee name
// resolves through the shadow-aware read canon, so a local `Object` twin classifies nothing.
// a bare reassignment-shaped write of an UNBOUND global name (`Promise = Bluebird`,
// `Promise++`, `[Promise] = arr` - sloppy scripts and modules both write the EXISTING global
// slot) replaces the slot exactly like `globalThis.Promise = ...`; without the record
// usage-pure substitutes the pristine ponyfill over the live override. a locally bound name
// is an ordinary variable write (the read side resolves the local); the capitalized /
// proxy-name heuristic mirrors the cheap gate so implicit sloppy-mode globals
// (`counter = 1`) stay out of the set.
// value-globals are non-writable (a bare write silently fails or TypeErrors) and their reads
// are compile-time constants - recording or rerouting them buys nothing and only churns emit
const NON_WRITABLE_VALUE_GLOBALS = new Set(['undefined', 'NaN', 'Infinity']);

const MINTED_CAPITALIZED_NAME = /^_+[A-Z]/;

function isGlobalSlotName(name) {
  // the polyfillable names come from the compat data - letter case alone lost every lowercase
  // global (`parseInt`, `queueMicrotask`, `structuredClone`, `atob`), which usage-pure would then
  // substitute over the user's own replacement. the capitalized arm stays beside it: a global the
  // data does not catalogue still names a slot, and over-recording one only degrades a narrow
  return isKnownGlobalName(name) || (name[0] >= 'A' && name[0] <= 'Z');
}

function bareGlobalSlotEntry(node, ctx) {
  if (node?.type !== 'Identifier' || NON_WRITABLE_VALUE_GLOBALS.has(node.name)) return null;
  if (!isGlobalSlotName(node.name)) return null;
  if (ctx.adapter.hasBinding(ctx.scope, node.name, ctx.path)) return null;
  return { globalSlotKey: node.name };
}

// an unbound DIRECT proxy-global name (`globalThis` / `self` / ...) - the receiver shape the
// identity self-copy detection below trusts; aliases and hops stay out (recording is the safe
// direction there)
function isBareProxyGlobalName(node, ctx) {
  return node?.type === 'Identifier' && POSSIBLE_GLOBAL_OBJECTS.has(node.name)
    && !ctx.adapter.hasBinding(ctx.scope, node.name, ctx.path);
}

// identity SELF-COPY writes assign a slot its own current value - `({ Promise } = globalThis)`
// (the self-restore idiom) and the flat twin `Promise = globalThis.Promise`. the value cannot
// change, so there is NO mutation to record: the read side keeps the pristine flatten /
// substitution (polyfill always wins), uniform with the lowercase and declaration forms of the
// same idiom. only top-level DEFAULT-LESS same-key props of a direct proxy-name receiver
// qualify - a default (`{ Promise = shim }`) installs a foreign value on the absent slot, a
// rest/array element copies a different value, and alias/hop receivers stay recorded
function identitySelfCopyLeaves(target, rhs, ctx) {
  const out = new Set();
  if (target?.type !== 'ObjectPattern' || !isBareProxyGlobalName(rhs, ctx)) return out;
  for (const p of target.properties ?? []) {
    if (p.type !== 'Property' && p.type !== 'ObjectProperty') continue;
    const value = unwrapRuntimeExpr(p.value);
    if (value?.type === 'Identifier' && propertyKeyName(p) === value.name) out.add(value);
  }
  return out;
}

// the proxy receiver NAME behind an identity flat copy (`X = globalThis.X` -> 'globalThis'),
// null when the write is not an identity copy
function identityFlatCopySource(name, rhs, ctx) {
  if (rhs?.type !== 'MemberExpression' && rhs?.type !== 'OptionalMemberExpression') return null;
  const obj = unwrapRuntimeExpr(rhs.object);
  return memberKeyName(rhs) === name && isBareProxyGlobalName(obj, ctx) ? obj.name : null;
}

// all bare slot writes an ASSIGNMENT TARGET position can hold: a flat identifier or bare
// identifier leaves of a destructure pattern (`[Promise] = arr` - each is the same slot
// write as its flat twin). member leaves are classified by the member visitor, not here.
// `rhs` (value-preserving assignment forms only) feeds the identity self-copy exemption; a
// skipped identity is PENDED, not dropped - the finalize pass re-records it if the file
// turns out to mutate the trusted proxy receiver's own slot (`self = fake`)
function bareSlotWriteEntries(target, ctx, rhs = null) {
  const bare = bareGlobalSlotEntry(target, ctx);
  if (bare) {
    const source = identityFlatCopySource(target.name, rhs, ctx);
    if (!source) return [bare];
    ctx.pendingIdentitySkips?.push({ proxyName: source, slotKey: target.name });
    return [];
  }
  if (!isDestructurePattern(target)) return [];
  const identity = identitySelfCopyLeaves(target, rhs, ctx);
  const out = [];
  walkPatternIdentifiers(target, id => {
    const entry = bareGlobalSlotEntry(id, ctx);
    if (!entry) return;
    if (identity.has(id)) ctx.pendingIdentitySkips?.push({ proxyName: rhs.name, slotKey: id.name });
    else out.push(entry);
  });
  return out;
}

// delete / update / assignment classify from the HOST side with a
// DOWNWARD wrapper peel - parent-side hops can't see through stacked wrappers
// (`delete ((Map.groupBy))`, `delete (Map.groupBy as any)`), the peel depth is unbounded;
// the member visitor routes its bare non-`=` sites here too, so the unreadable-key rules
// live in ONE place: such a key (`Array[k] = v`) could name ANY member and deopts the
// receiver whole, EXCEPT under a logical-install operator (see `isLogicalInstallOp`)
function memberMutationEntry(slot, ctx, operator = null) {
  const member = unwrapRuntimeExpr(slot);
  if (member?.type !== 'MemberExpression' && member?.type !== 'OptionalMemberExpression') return [];
  const key = mutationKeyName(member.property, member.computed, ctx);
  if (key === null && isLogicalInstallOp(operator)) return [];
  return [{ targetNode: member.object, keys: key !== null ? [key] : null }];
}

// logical-INSTALL writes (`globalThis[k] ||= {}` - the namespace-init idiom) can never replace
// a LIVE value, so an unreadable key does not deopt the receiver whole; the absent-slot install
// stays the accepted precision limit the logical-assign warning gate documents. replacing
// operators (`=`, `&&=`, arithmetic compounds) and delete / update forms deopt
function isLogicalInstallOp(operator) {
  return operator === '||=' || operator === '??=';
}

function classifyMutationSite(node, parent, grandparent, ctx) {
  if (node.type === 'UnaryExpression') {
    return node.operator === 'delete' ? memberMutationEntry(node.argument, ctx) : [];
  }
  if (node.type === 'UpdateExpression') {
    const entries = memberMutationEntry(node.argument, ctx);
    if (entries.length) return entries;
    // `Promise++` is a read-modify-WRITE of the same slot the bare `=` form writes
    const bare = bareGlobalSlotEntry(unwrapRuntimeExpr(node.argument), ctx);
    return bare ? [bare] : [];
  }
  if (node.type === 'AssignmentExpression') {
    const entries = memberMutationEntry(node.left, ctx, node.operator);
    if (entries.length) return entries;
    const rhs = VALUE_FLOW_ASSIGN_OPS.has(node.operator) ? unwrapRuntimeExpr(node.right) : null;
    return bareSlotWriteEntries(unwrapRuntimeExpr(node.left), ctx, rhs);
  }
  // a bare for-x LHS (`for (Promise of xs)`, `for ([Promise] of xs)`) assigns the slot on
  // every iteration; a VariableDeclaration LHS binds locally and falls out of the helper
  if (node.type === 'ForOfStatement' || node.type === 'ForInStatement') {
    return bareSlotWriteEntries(unwrapRuntimeExpr(node.left), ctx);
  }
  if ((node.type === 'MemberExpression' || node.type === 'OptionalMemberExpression')
    && isMemberMutationContext(node, parent, grandparent)) {
    return memberMutationEntry(node, ctx, parent?.type === 'AssignmentExpression' ? parent.operator : null);
  }
  if (node.type !== 'CallExpression' && node.type !== 'OptionalCallExpression') return [];
  return classifyMutatorCall(node, ctx);
}

// mutator CALL forms (`Object.defineProperty` / `Object.assign` / `Reflect.set` / extracted or
// computed spellings), split from the statement dispatcher above
function classifyMutatorCall(node, ctx) {
  // the two NECESSARY conditions first, both free: a mutator installs onto its first argument,
  // and a readable callee name that is no mutator ends it here. behind them sits the expensive
  // half - a scope-walking namespace resolution that used to run on every call node in the file
  const args = node.arguments ?? [];
  if (!args[0]) return [];
  // the detached-call idiom `(0, Object.defineProperty)(...)` buries the member behind a
  // sequence tail - dispatch on the PEELED callee so wrapper / SE-tail shapes classify like
  // their bare twins
  const callee = peelToBareExpr(node.callee);
  let namespace = null;
  let method = null;
  if (callee?.type === 'MemberExpression' || callee?.type === 'OptionalMemberExpression') {
    // a computed mutator callee (`Object["defineProperty"]`, const-aliased `Object[m]`) resolves
    // its method through the same binding-aware key canon the member side uses
    method = callee.computed
      ? mutationKeyName(callee.property, true, ctx)
      : (callee.property?.type === 'Identifier' ? callee.property.name : null);
    // an UNREADABLE method can be any mutator and still deopts below; a readable one that is in
    // neither set names no mutation whatever its receiver resolves to
    if (method !== null && !OBJECT_MUTATORS.has(method) && !REFLECT_MUTATORS.has(method)) return [];
    namespace = peeledNamespaceName(callee.object, ctx);
  } else {
    // an extracted (`const dp = Object.defineProperty; dp(...)`) or destructured
    // (`const { defineProperty } = Object`) mutator names the same namespace method
    const pair = bareCalleeStaticPair(callee, ctx);
    if (pair) ({ namespace, method } = pair);
  }
  if (!namespace) return [];
  // the mutator NAME itself is unreadable (`Object[m](Array, ...)`, an extracted `const fn =
  // Object[m]`): it can be any mutator, so every argument that can host a mutation deopts
  // whole - including a possible `Reflect.set` receiver slot
  if ((namespace === 'Object' || namespace === 'Reflect') && method === null) {
    const entries = [{ targetNode: args[0], keys: null }];
    if (args[3]) entries.push({ targetNode: args[3], keys: null });
    return entries;
  }
  if (namespace === 'Object') {
    if (method === 'defineProperty') {
      const key = mutationKeyName(args[1], true, ctx);
      return [{ targetNode: args[0], keys: key !== null ? [key] : null }];
    }
    if (method === 'defineProperties') {
      return sourceKeysEntries(args[0], objectLiteralKeys(args[1], ctx));
    }
    if (method === 'assign') {
      // no sources at all (`Object.assign(Array)`) mutates nothing - distinct from sources
      // whose keys cannot be read
      const lists = args.slice(1).map(arg => objectLiteralKeys(arg, ctx));
      return sourceKeysEntries(args[0], {
        keys: lists.flatMap(list => list.keys),
        open: lists.some(list => list.open),
      });
    }
    return [];
  }
  if (namespace === 'Reflect' && REFLECT_MUTATORS.has(method)) {
    const key = mutationKeyName(args[1], true, ctx);
    // Reflect.set(target, key, value, RECEIVER): with a receiver the data property lands on the
    // receiver, not target, so the receiver is the mutation host; 3-arg / other mutators use target
    const host = method === 'set' && args[3] ? args[3] : args[0];
    return [{ targetNode: host, keys: key !== null ? [key] : null }];
  }
  return [];
}

// bare-identifier mutator callee -> its (namespace, method) pair: an extracted method binding
// (`const dp = Object.defineProperty`) resolves its init member through the namespace canon; a
// destructured one - renamed, positional over a literal, or straight off the namespace
// (`const { defineProperty } = Object`, whose slot value the pairer synthesizes as the
// `Object.defineProperty` member) - pairs through the canonical `patternSlotValues`. reassigned
// bindings stay unresolved (the const idiom is the real-world channel; a let-union here would
// re-implement the alias fan for a function value the canons cannot type)
function bareCalleeStaticPair(callee, ctx) {
  if (callee?.type !== 'Identifier') return null;
  for (const member of boundDeclaratorValues(callee.name, ctx)) {
    if (member.type === 'Identifier') {
      // `const dp = _Object$defineProperty;` - a pass over an emitter's own output stores
      // the MINTED import; the mutator resolves through the import's entry, or the
      // defineProperty write goes unseen and the deopt it owed is lost on the re-pass
      const minted = mintedMutatorPair(member.name, ctx);
      if (minted) return minted;
      continue;
    }
    if (member.type !== 'MemberExpression' && member.type !== 'OptionalMemberExpression') continue;
    // a resolvable namespace with an UNREADABLE method (`const fn = Object[m]`) still names a
    // possible mutator - the caller deopts the call's mutation hosts whole
    const method = mutationKeyName(member.property, member.computed, ctx);
    const namespace = peeledNamespaceName(member.object, ctx);
    if (namespace) return { namespace, method };
  }
  // a require-style pure binding's declarator init is the require CALL itself - neither a
  // member nor an identifier source; the import-entry canon answers for the binding name
  // (shadow-guarded inside `pureImportEntryOf`)
  return mintedMutatorPair(callee.name, ctx);
}

// the (namespace, method) pair an ENTRY mints (`reflect/apply` -> `Reflect.apply`), which is what
// a prior pass leaves behind where the source spelled the member. one rule, asked by the scoped
// stage through a binding name and by the census through the import source it walks past
function mutatorPairFromEntry(entry) {
  const segments = entry ? entry.split('/') : [];
  if (segments.length !== 2) return null;
  const namespace = entryToGlobalHint(segments[0]);
  return namespace ? { namespace, method: kebabToCamel(segments[1]) } : null;
}

// (namespace, method) of a name bound by a pure-package DEFAULT import (or require binding)
// at the program root (`_Object$defineProperty` -> `Object.defineProperty`): the entry tail
// past the flavor namespace spells the pair. null for anything else
function mintedMutatorPair(name, ctx) {
  return mutatorPairFromEntry(pureImportEntryOf(ctx.path, name));
}

// a mutation whose KEY the canons cannot read could have hit any member of its receiver -
// the receiver's whole NAME deopts through the slot channel every reader already consults
// (`isMutatedStaticPair`). a prototype receiver deopts its constructor. the GLOBAL OBJECT
// itself is carved out: `globalThis[k] = v` is the ubiquitous UMD / export-global / registry
// idiom, and deopting the whole file over it would strip every polyfill from such files -
// the computed-global write stays the documented precision limit, uniform with the
// logical-install carve-out
function addReceiverDeopt(mutated, name) {
  if (POSSIBLE_GLOBAL_OBJECTS.has(name)) return;
  // a PROTOTYPE receiver keeps the whole-NAME deopt: the realm's own prototype is what carries
  // the patch, and a ponyfilled ctor would hand back its own. the object's OWN members are the
  // other fact - they are unknown, which is not the same as "this binding is not the built-in".
  // the deopt is spelled as the SLOT key because that is what the readers ask, and the second key
  // beside it says WHY - the source wrote no slot here, and a debug note that claims one is
  // reporting something the file never did
  if (name.endsWith('.prototype')) {
    mutated.add(mutatedStaticKey('globalThis', name.slice(0, -'.prototype'.length)));
    mutated.add(mutatedStaticKey(name, MUTATED_MEMBERS_UNKNOWN));
    return;
  }
  mutated.add(mutatedStaticKey(name, MUTATED_MEMBERS_UNKNOWN));
}

// --- the per-site collector callback (shared by both plugins' traversals) ---
// classify the node as a mutation site (namespace shadowing is subsumed by the name canon),
// resolve the receiver through the read-side canons and record every `name.key` pair; a
// `keys: null` entry (unreadable key) deopts each resolved receiver name whole. after the
// traversal the caller runs `finalizeMutationSet`: identity self-copies were skipped TRUSTING
// their proxy receiver, and if the file also mutates that receiver's own slot (`self = fake;
// Promise = self.Promise`) the copy installs the replacement's value - re-record the skipped
// slots against the COMPLETE set, iterating because one re-recorded slot can invalidate
// another skip's receiver
// the name a function is known by for the parameter pairing - and the name a CALL of it spells.
// one rule for both sides, or the two halves of the pairing key each other's misses: a declaration
// (`function install`), a declarator-bound literal (`const install = t => {}`), and a METHOD, which
// carries its key. an anonymous literal passed somewhere has no name here at all
function functionOwnerName(node, parentNode) {
  if (node.id?.type === 'Identifier') return node.id.name;
  if (parentNode?.type === 'VariableDeclarator' && parentNode.id?.type === 'Identifier') return parentNode.id.name;
  const method = node.type === 'ObjectMethod' || node.type === 'ClassMethod' || node.type === 'ClassPrivateMethod'
    ? node : (parentNode?.type === 'Property' || parentNode?.type === 'ObjectProperty'
      || parentNode?.type === 'MethodDefinition' ? parentNode : null);
  return method && !method.computed ? propertyKeyName(method) : null;
}

// ... and the CALL side of that name: a bare callee names itself, a member callee names its key
function calleeOwnerName(callee) {
  if (callee?.type === 'Identifier') return callee.name;
  if (callee?.type !== 'MemberExpression' && callee?.type !== 'OptionalMemberExpression') return null;
  return memberKeyName(callee);
}

// the function a class runs at `new C(x)`. babel keeps the parameters on the constructor member,
// ESTree on the FunctionExpression that member wraps - one read, so the two parsers cannot answer
// differently about the same class
function classConstructorFunction(classNode) {
  const ctor = (classNode.body?.body ?? []).find(member => member?.kind === 'constructor');
  if (!ctor) return null;
  return ctor.params ? ctor : ctor.value ?? null;
}

function classConstructorParams(classNode) {
  return classConstructorFunction(classNode)?.params ?? null;
}

// the elements a call spreads out of an INLINE array, or null where the length is not statically
// decidable. deliberately STRICTER than `resolveCallArgumentCoords`, which still answers for the
// positions ahead of a nested spread: this one hands out the whole list at once, so one element it
// cannot place makes the list variadic. do not align them - relaxing this refuses nothing, but
// tightening that one would drop argument coordinates the emitters resolve today
function inlineArrayElements(node) {
  const array = unwrapRuntimeExpr(node);
  if (array?.type !== 'ArrayExpression') return null;
  return array.elements.some(element => element?.type === 'SpreadElement') ? null : array.elements;
}

// a pairing whose arguments come out of an ARRAY the call spreads - `f.apply(t, a)` and
// `Reflect.apply(f, t, a)`. an array the walk cannot read leaves the list UNDECIDED, which is not
// the same fact as an empty one: a consumer recording what a call installs owes nothing either way,
// but one PROVING that no argument reaches a slot must refuse an undecided list, and the list alone
// cannot tell them apart
function spreadArrayPairing(callee, arrayNode) {
  const elements = inlineArrayElements(arrayNode);
  return { callee: peelToBareExpr(callee), args: elements ?? [], argsUnknown: elements === null };
}

// the function a call-like host invokes and the arguments that land in its parameters. a TAGGED
// TEMPLATE is such a host: its first parameter takes the strings array - the quasi itself - and the
// interpolations follow. the RECEIVER INVOKERS name their function one hop further in - `f.call(t,
// x)` and `f.apply(t, [x])` invoke F, not a method called `call`, so the receiver slot comes off
// the list; `Reflect.apply` spells the same call with the function in the first slot, and a `bind`
// invoked on the spot prepends the arguments it captured
// the CALLEE comes back peeled to the bare expression it invokes, so an identity compare against a
// candidate node answers alike whichever wrapper - a paren, a TS cast, a sequence whose tail is the
// function - the source spelled around it.
// `argsUnknown` marks the pairings whose ARGUMENT LIST is not statically decidable: an unreadable
// spread array, and a receiver slot holding a SPREAD - dropping the receiver by position cannot
// know how many arguments that spread put ahead of it. `nameIsShadowed` is the scope question the
// `Reflect` spelling owes; a caller without a scope passes nothing and over-pairs, the direction a
// census of installed values owes anyway
export function callPairing(node, programNode = null, { nameIsShadowed = null } = {}) {
  if (node.type === 'TaggedTemplateExpression') {
    return { callee: peelToBareExpr(node.tag), args: [node.quasi, ...node.quasi.expressions] };
  }
  if (node.type !== 'CallExpression' && node.type !== 'OptionalCallExpression' && node.type !== 'NewExpression') return null;
  const args = node.arguments ?? [];
  const callee = peelToBareExpr(node.callee);
  // a prior pass replaced the member spelling with the helper it minted, so the same host arrives
  // as a bare name - the entry that name is bound to is what says which host it is, through the
  // one canon that already answers it for a mutator callee (both spellings, shadow guard included)
  const mintedPair = callee?.type === 'Identifier' && programNode
    ? mutatorPairFromEntry(pureImportEntryOfProgram(programNode, callee.name)) : null;
  if (mintedPair?.namespace === 'Reflect' && mintedPair.method === 'apply') {
    return spreadArrayPairing(args[0], args[2]);
  }
  if (callee?.type === 'MemberExpression' || callee?.type === 'OptionalMemberExpression') {
    const key = memberKeyName(callee);
    const target = peelToBareExpr(callee.object);
    // the bare-value peel stops at a shape it cannot name - a NESTED sequence - and answers nothing there
    if (key === 'apply' && target?.type === 'Identifier' && target.name === 'Reflect' && !nameIsShadowed?.('Reflect')) {
      return spreadArrayPairing(args[0], args[2]);
    }
    if (key === 'call') {
      return { callee: peelToBareExpr(callee.object), args: args.slice(1), argsUnknown: args[0]?.type === 'SpreadElement' };
    }
    if (key === 'apply') return spreadArrayPairing(callee.object, args[1]);
  }
  // `f.bind(t, x)()`: the invoked value is the bind's own callee, holding the captured arguments
  // ahead of the call's. a bind STORED first is a function value this census does not track
  if (callee?.type === 'CallExpression') {
    const inner = peelToBareExpr(callee.callee);
    const isBind = (inner?.type === 'MemberExpression' || inner?.type === 'OptionalMemberExpression')
      && memberKeyName(inner) === 'bind';
    const captured = callee.arguments ?? [];
    if (isBind) {
      return {
        callee: peelToBareExpr(inner.object),
        args: [...captured.slice(1), ...args],
        argsUnknown: captured[0]?.type === 'SpreadElement',
      };
    }
  }
  return { callee, args };
}

// the CLASS a constructor belongs to, over the extra wrapper ESTree puts between the two
function enclosingClassName(fnPath) {
  for (let up = fnPath.parentPath, hops = 0; up?.node && hops < 3; up = up.parentPath, hops++) {
    if (CLASS_NODE_TYPES.has(up.node.type)) {
      return up.node.id?.type === 'Identifier' ? up.node.id.name : null;
    }
  }
  return null;
}

// every argument a REST parameter at `index` collects - the canonical positional resolver walked
// until it runs out, so an inline-array spread expands here exactly as it does for a fixed slot
function restArgumentValues(args, index) {
  const values = [];
  for (let at = index; ; at++) {
    const argument = resolveCallArgument(args, at);
    if (!argument) return values;
    values.push(argument);
  }
}

// the values a PARAMETER can hold, from the calls this file makes: climb the declaration to the
// function that owns the parameter, name that function, and pair each call's argument at the
// parameter's own position through the canonical pattern pairer (a destructured parameter selects
// a slot of the argument). what ANOTHER module passes is outside a per-file pass - under-recording
// there is the bound every cross-module question has here, and it is the same bound the escape
// census works under
function paramReachingValues({ identNode, binding, callArguments, ctx }) {
  const declPath = binding.declarationPath;
  if (!declPath || !callArguments) return [];
  let paramPath = declPath;
  let fnPath = declPath.parentPath;
  while (fnPath?.node && !FUNCTION_LIKE_NODE_TYPES.has(fnPath.node.type)) {
    paramPath = fnPath;
    fnPath = fnPath.parentPath;
  }
  const index = fnPath?.node?.params?.indexOf(paramPath.node) ?? -1;
  if (index === -1) return [];
  const param = paramPath.node;
  const values = [];
  // the parameter's own DEFAULT is a value it holds whenever the call omits the argument, and it
  // is there whether or not this file calls the function at all
  if (param.type === 'AssignmentPattern') {
    values.push(...param.left.type === 'Identifier' ? [param.right]
      : patternSlotValues(param.left, param.right, identNode.name, ctx));
  }
  // the key the CALL side recorded this function under: its own name, the class name where the
  // function is a constructor, and the node itself where the callee is the literal
  const owner = functionOwnerName(fnPath.node, fnPath.parentPath?.node);
  const key = owner === 'constructor' ? enclosingClassName(fnPath) : owner ?? fnPath.node;
  for (const { args } of (key === null ? null : callArguments.get(key)) ?? []) {
    // the canonical positional resolver, spread expansion and its variadic bail included: a call
    // whose length is not statically decidable contributes nothing rather than the wrong value.
    // a REST parameter collects every argument from its position on
    const paired = param.type === 'RestElement' ? restArgumentValues(args, index)
      : [resolveCallArgument(args, index)].filter(Boolean);
    for (const argument of paired) {
      if (param.type === 'Identifier' || param.type === 'RestElement') values.push(argument);
      else values.push(...patternSlotValues(patternSlotTarget(param), argument, identNode.name, ctx));
    }
  }
  return values;
}

function createMutationSiteHandler({ adapter, mutated, callArguments = null, resolveStaticKey = null }) {
  const pendingIdentitySkips = [];
  // one resolution per target NODE: the same site is classified twice by construction (the host
  // visitor accepts a bare `=` LHS that the member visitor also reaches), and a mutator whose
  // source keys came back partly readable yields two entries on one target. the node fixes its
  // own scope, so the answer cannot differ between those visits
  const resolved = new WeakMap();
  function resolveTargetOnce(targetNode, path) {
    if (resolved.has(targetNode)) return resolved.get(targetNode);
    const names = resolveMutationSite({ targetNode, scope: path.scope, adapter, path, callArguments, resolveStaticKey });
    resolved.set(targetNode, names);
    return names;
  }
  function handleSite(path) {
    const ctx = { scope: path.scope, adapter, path, pendingIdentitySkips, resolveStaticKey };
    for (const entry of classifyMutationSite(path.node, path.parent, path.parentPath?.parent, ctx)) {
      if (entry.globalSlotKey) {
        mutated.add(mutatedStaticKey('globalThis', entry.globalSlotKey));
        continue;
      }
      const { targetNode, keys } = entry;
      const { names, receiverDeopts } = resolveTargetOnce(targetNode, path);
      for (const name of names) {
        // ... and the NAME takes the whole-namespace mark beside each key it names: the entry the
        // ctor reference resolves to is what has to carry the patched member back, and the narrow
        // one cannot. pinning the member with an import of its OWN entry instead left a binding
        // nothing reads - `@core-js/pure` declares only `./modules/*.js` side-effectful, so a
        // bundler drops such an import together with the module that was the whole point of it
        if (keys) for (const key of keys) {
          mutated.add(mutatedStaticKey(name, key));
          mutated.add(mutatedStaticKey(name, MUTATED_STATIC_PINNED));
        }
        else addReceiverDeopt(mutated, name);
      }
      for (const name of receiverDeopts) addReceiverDeopt(mutated, name);
    }
  }
  function finalizeMutationSet() {
    let changed = true;
    while (changed) {
      changed = false;
      for (const skip of pendingIdentitySkips) {
        if (!isMutatedStaticPair('globalThis', skip.proxyName, mutated)) continue;
        const key = mutatedStaticKey('globalThis', skip.slotKey);
        if (!mutated.has(key)) {
          mutated.add(key);
          changed = true;
        }
      }
    }
  }
  return { handleSite, finalizeMutationSet };
}

// --- the pre-pass skeleton (shared by both plugins) ---

// the cheap shape census gates the whole pass: only files that actually monkey-patch pay for
// the scoped traverse + canonical receiver resolution. each plugin runs its own traversal
// dialect over `handleSite` (null when the gate is closed) and calls `finalize` after it
export function beginMutationPrePass({ rootNode, adapter, census = null, resolveStaticKey = null }) {
  const mutated = new Set();
  if (!(census ? census.hasMutationShapes : hasMutationCandidateShapes(rootNode, adapter.packages))) {
    return { mutated, handleSite: null, finalize: null };
  }
  const { handleSite, finalizeMutationSet } = createMutationSiteHandler({
    adapter, mutated, callArguments: census?.callArguments ?? null, resolveStaticKey,
  });
  return { mutated, handleSite, finalize: finalizeMutationSet };
}

// the parser-agnostic mutation-site visitor set: member visits classify destructure-LHS / for-x
// contexts; the HOST visits classify delete / update / assignment with a downward wrapper peel
// (stacked parens / TS casts); a bare-identifier for-x LHS assigns a global slot per iteration -
// no member/assignment node exists for it, so the statement itself is the classification site.
// babel layers its Optional* dialect twins on top
export function mutationSiteVisitors(handleSite) {
  return {
    MemberExpression: handleSite,
    CallExpression: handleSite,
    AssignmentExpression: handleSite,
    UpdateExpression: handleSite,
    UnaryExpression: handleSite,
    ForOfStatement: handleSite,
    ForInStatement: handleSite,
  };
}

// the map keys a container read walks through, root first: `('w', ['a', 'b'])` asks about `w`,
// `w.a` and `w.a.b`. one spelling for both readers, and the reason a single key is still accepted -
// most reads stand one hop off their container
function slotPathPrefixes(object, keyPath) {
  const keys = Array.isArray(keyPath) ? keyPath : [keyPath];
  const prefixes = [object];
  for (const key of keys) prefixes.push(`${ prefixes.at(-1) }.${ key }`);
  return prefixes;
}

// --- the parser-agnostic adapter core ---

// the shared half of the emitter adapter contract: the mutation / written-slot gates and the
// package view, closed over the same callbacks both plugin adapters receive. `buildHostMembers`
// returns the host-specific scope machinery (it may close over the adapter it is handed - the
// members only run after composition); `packages` stays a getter, so composition must go through
// property descriptors - a spread would freeze the packages view at creation time
export function createDetectionAdapter({
  method = null, getMutatedStatics = () => null, getWrittenContainerSlots = () => null,
  getContainerSlotIndex = () => null, getPackages = () => null, getMutationRoots = () => null,
}, buildHostMembers) {
  // the record keys a container is asked by: its DECLARATION where the caller hands the declaring
  // node (the receiver walk does), else every declaration of that name in the file - the
  // conservative union a name-only question deserves
  function containerKeys(object, ownerNode) {
    const index = getContainerSlotIndex?.();
    if (!index) return [object];
    const owned = ownerNode ? index.owners.get(ownerNode) : null;
    return owned ? [owned] : index.byName.get(object) ?? [];
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
    // a container SLOT written anywhere (`const w = { k: Object }; w.k = Map`) is no built-in mutation,
    // so it is deliberately NOT part of the mutated-static set - reporting it there would deopt every
    // namespace gate in the file. its ONE reader is the receiver walk's container descent, which must
    // stop trusting the literal's initial member once the slot has been replaced
    isWrittenContainerSlot(object, keyPath, ownerNode = null) {
      const slots = getWrittenContainerSlots?.();
      if (!slots) return false;
      // a write at any PREFIX of the path replaces the subtree the rest of it reads through, so
      // the whole ladder is asked: `w.a = X` and `w.a.b = X` both answer for a read of `w.a.b`,
      // while `w.a.b = X` leaves `w.c` alone. the wildcard at a prefix is "some slot under here"
      for (const key of containerKeys(object, ownerNode)) {
        for (const prefix of slotPathPrefixes(key, keyPath)) {
          if (slots.has(prefix) || slots.has(`${ prefix }.*`)) return true;
        }
      }
      return false;
    },
    // the KNOWN written value nodes reaching a slot: direct writes to the named slot plus
    // unknown-slot (dynamic-key) writes, which may land anywhere on the container
    writtenContainerSlotValues(object, keyPath, ownerNode = null) {
      const slots = getWrittenContainerSlots?.();
      if (!slots) return [];
      const values = [];
      for (const key of containerKeys(object, ownerNode)) {
        const prefixes = slotPathPrefixes(key, keyPath);
        const exact = prefixes.at(-1);
        values.push(...slots.get(exact) ?? []);
        // ... plus the unknown-slot writes at every prefix, which may land anywhere below it
        for (const prefix of prefixes) {
          if (prefix !== exact || exact.endsWith('.*')) values.push(...slots.get(`${ prefix }.*`) ?? []);
        }
      }
      return values;
    },
    isMutatedStaticSlot(object, key) {
      // usage-pure drives the scoped pre-pass, so the COMPLETE set answers there. every other
      // method pays no scoped walk and reads the cheap census instead: its roots are a SUPERSET
      // of what the scoped pass could attribute, and they owe the reader the SAME three
      // readings `isMutatedStaticPair` gives - the namespace whose member was replaced, the
      // namespace whose own global SLOT was replaced, and, where the reader itself names the
      // global object, the KEY that write landed on (`globalThis.atob = patch`)
      if (method === 'usage-pure') return isMutatedStaticPair(object, key, getMutatedStatics());
      const roots = getMutationRoots();
      if (!roots) return false;
      return roots.open || roots.names.has(object) || roots.globalSlots.has(object)
        || (POSSIBLE_GLOBAL_OBJECTS.has(object) && roots.globalSlots.has(key));
    },
    // the scoped set itself, for the ONE consumer that needs more than a yes/no about a pair: the
    // debug note, which reports WHY a name is deopted and reads that off the keys
    get mutatedStatics() { return getMutatedStatics(); },
    // user-resolved package prefixes (`pkg` + `additionalPackages`) for symbol-import /
    // proxy-import detection. plugin-supplied, NOT injector-published: the plugin knows the
    // resolved array before ANY injector exists, and the mutation pre-pass runs in exactly
    // that window (injector-only sourcing left the pre-pass packages-blind there)
    get packages() { return getPackages(); },
  };
  return Object.defineProperties(adapter, Object.getOwnPropertyDescriptors(buildHostMembers(adapter)));
}

// --- slot-DEOPT model (usage-pure) ---
// a file that writes the SLOT of a global name in ANY form (`X = Y`, `X ||= Y`, `X++`,
// `[X] = arr`, `for (X of ...)`, `globalThis.X = Y`, `delete globalThis.X`) makes every
// read of that name flow-dependent - a question a file-wide static set cannot answer.
// usage-pure substitutes only what it is CERTAIN about, so the whole name DEOPTS: reads,
// writes and probes stay verbatim on the live binding and the runtime serves exactly what
// the user's code left there (native-faithful, bail-safe under-polyfill on old engines).
// identity self-copies (`({ X } = globalThis)`, `X = globalThis.X`) are value no-ops and do
// NOT trigger the deopt - they keep the pristine flatten. member-STATIC mutations
// (`Iterator.from = patch`) are NOT slot writes: the static canon (suppression + eager
// enrichment + one routed constructor) is untouched. the emitters consult
// `isMutatedGlobalSlot` at their global-identifier usage callbacks and emit a debug note.

// --- mutated-key enrichment (shared by both plugins) ---
// imports each mutated key's own PURE entry up front, so core-js initializes from the
// PRISTINE built-in before the patch statement runs:
// - a STATIC key (`Iterator.from = patch`) gets its entry when the constructor itself
//   ROUTES (the same `kind: 'global'` resolution the identifier machinery uses) - the
//   method then exists on the ponyfill (polyfill-then-patch) and a native-staying receiver
//   (Array on ie11 targets) skips the dead weight. instance-kind fallbacks are NOT statics
//   (the key lives on the prototype) and are skipped
// - an INSTANCE key (`String.prototype.at = patch`) gets its instance entry with NO
//   ctor-routing gate: the point is initialization ORDER - core-js caches its own
//   implementation and never adopts the third-party patch, so dispatch helpers keep
//   serving the core-js polyfill in every file of the bundle
// the inverse of `mutatedStaticKey`, and the two must stay readable as a pair. a recorded key is
// `<object>.<key>`, and BOTH halves may carry a dot of their own: the object as
// a `<Ctor>.prototype` placement, the key as a folded well-known symbol (`Symbol.iterator`). so the
// split is by the placement separator first and by the FIRST dot otherwise - taking the last one
// read `String.prototype.Symbol.iterator` as an object named `String.prototype.Symbol`, which
// resolves to nothing and lost the pin the enrichment exists to place
function splitMutatedKey(mutatedKey) {
  const proto = mutatedKey.indexOf('.prototype.');
  if (proto !== -1) {
    return { object: mutatedKey.slice(0, proto), key: mutatedKey.slice(proto + '.prototype.'.length), placement: 'prototype' };
  }
  const dot = mutatedKey.indexOf('.');
  return { object: mutatedKey.slice(0, dot), key: mutatedKey.slice(dot + 1), placement: 'static' };
}

export function enrichMutatedStatics({ mutatedStatics, resolvePure, injectPureImport }) {
  for (const mutatedKey of mutatedStatics ?? []) {
    const { object: ctorName, key, placement } = splitMutatedKey(mutatedKey);
    if (placement === 'prototype') {
      const pure = resolvePure({ kind: 'property', object: ctorName, key, placement: 'prototype' });
      if (pure) injectPureImport(pure.entry, pure.hintName);
      continue;
    }
    // a PROXY-GLOBAL host names a global SLOT (`window.Promise = Shim`, bare `Promise = Shim`):
    // the whole name is DEOPTED (see the slot-deopt model above) - nothing of it is ever
    // substituted, so there is no ponyfill to pin; skip without enrichment
    if (POSSIBLE_GLOBAL_OBJECTS.has(ctorName)) continue;
    if (!resolvePure({ kind: 'global', name: ctorName })) continue;
    // an UNREADABLE key names no member, so there is none to pin here - the ctor's own claim
    // resolves to the NAMESPACE entry instead, which carries the statics with it
    if (key === MUTATED_MEMBERS_UNKNOWN) continue;
    // the STATIC needs no pin of its own: the name is marked whole above, so the ctor reference
    // already resolves to the namespace entry that carries the member - and that binding is one
    // the emit READS, which a pinning import of the member's own entry never was
  }
}

// --- Stage 3: canonical receiver resolution ---

// composite value expressions fan out to every POSSIBLE runtime value before the canons see
// them (a sequence flows its tail, a ternary / logical / chain-assign flows both / the RHS) -
// this is expression-shape fan-out only; all NAME resolution stays in the canons
// the budget guards an EXPONENTIAL fan (ternary and logical each branch two ways per level), which
// is why it is small and stays there; past it the list is truncated with no signal, and what that
// costs is in the provider's accepted boundaries
function valueFanLeaves(node, leaves, depth = 0) {
  const value = unwrapRuntimeExpr(node);
  if (!value || depth > 16) return leaves;
  switch (value.type) {
    case 'SequenceExpression':
      if (value.expressions.length) valueFanLeaves(value.expressions.at(-1), leaves, depth + 1);
      break;
    case 'ConditionalExpression':
      valueFanLeaves(value.consequent, leaves, depth + 1);
      valueFanLeaves(value.alternate, leaves, depth + 1);
      break;
    case 'LogicalExpression':
      valueFanLeaves(value.left, leaves, depth + 1);
      valueFanLeaves(value.right, leaves, depth + 1);
      break;
    case 'AssignmentExpression':
      valueFanLeaves(value.right, leaves, depth + 1);
      break;
    default:
      leaves.push(value);
  }
  return leaves;
}

// the namespace a chain names when its ROOT is a lowered proxy-entry binding: the require-bound one
// is the global object itself, the interop wrapper becomes it after the `.default` hop. every hop
// between must stay on the global-object surface, and the LAST key is the namespace written to
function loweredProxyGlobalNamespace(parts, { scope, adapter, path }) {
  if (!parts?.keys?.length || parts.rootNode.type !== 'Identifier') return null;
  let { keys } = parts;
  if (!requireBoundProxyGlobalName({ node: parts.rootNode, scope, adapter, path })) {
    if (keys[0] !== 'default'
      || !interopDefaultProxyName({ objectNode: parts.rootNode, scope, adapter, path })) return null;
    keys = keys.slice(1);
  }
  if (!keys.length) return null;
  return keys.slice(0, -1).every(key => POSSIBLE_GLOBAL_OBJECTS.has(key)) ? keys.at(-1) : null;
}

// member chain -> { rootNode, keys } when every hop key resolves to a static name (const-aliased
// hops follow the read-side canon); an unreadable hop keeps walking to the root but nulls `keys`
// (the reached value is unknowable - callers deopt the ROOT whole). the root node is returned
// WHATEVER its type - a name-resolving caller filters to Identifier, while a value-fan caller
// fans a ternary / logical chain root (`(c ? globalThis : self).Array`) the single-Identifier
// form could not represent
function memberChainParts(node, ctx) {
  let keys = [];
  let root = node;
  while (root && (root.type === 'MemberExpression' || root.type === 'OptionalMemberExpression')) {
    const key = mutationKeyName(root.property, root.computed, ctx);
    if (typeof key !== 'string') keys = null;
    else keys?.unshift(key);
    root = peelSequenceTail(unwrapRuntimeExpr(root.object), { step: unwrapRuntimeExpr });
  }
  return root ? { rootNode: root, keys } : null;
}

// `memberChainParts` walks a chain hop by hop with a binding-aware key resolution on every one,
// and the same leaf is asked twice on every declined name - by the name resolver, then by the
// chain-root fan behind it. scope and path are fixed for one site, so one memo answers both
function chainPartsOf(node, ctx) {
  if (!ctx.chainParts) return memberChainParts(node, ctx);
  if (!ctx.chainParts.has(node)) ctx.chainParts.set(node, memberChainParts(node, ctx));
  return ctx.chainParts.get(node);
}

function resolveLeafName(leaf, ctx) {
  const { scope, adapter, path } = ctx;
  // top-level `this` IS the global proxy - the same pragmatic canon the read side's chain-root
  // walk uses. an aliased `this` (`const g = this`) anchors the context check at its
  // DECLARATOR's path (`thisPath`), where the `this` actually sits
  if (leaf.type === 'ThisExpression') {
    return isTopLevelThisContext(ctx.thisPath ?? path) ? 'globalThis' : null;
  }
  const direct = resolveObjectName({ objectNode: leaf, scope, adapter, path });
  if (direct) return direct;
  if (leaf.type === 'MemberExpression' || leaf.type === 'OptionalMemberExpression') {
    const parts = chainPartsOf(leaf, ctx);
    // name resolution needs fully readable hops; unreadable ones deopt via the caller's fan
    if (!parts?.keys) return null;
    if (parts.rootNode.type !== 'Identifier') {
      // top-level `this` roots a PROTOTYPE chain as the global proxy (`this.String.prototype.x
      // = patch` names `String.prototype`, proxy hops allowed); non-prototype `this` chains
      // and other value-fan roots are the chain-root-alias caller's job
      if (parts.rootNode.type === 'ThisExpression' && parts.keys.at(-1) === 'prototype'
        && parts.keys.length >= 2
        && parts.keys.slice(0, -2).every(key => POSSIBLE_GLOBAL_OBJECTS.has(key))
        && isTopLevelThisContext(ctx.thisPath ?? path)) {
        return `${ parts.keys.at(-2) }.prototype`;
      }
      return null;
    }
    // `Ctor.prototype.key = patch` is an INSTANCE mutation, recorded as `Ctor.prototype.key`:
    // the enrichment imports the key's instance entry UP FRONT, so core-js initializes from
    // the PRISTINE prototype (caching its own implementation) before the third-party patch
    // statement runs - dispatch helpers keep serving the core-js polyfill, here and in every
    // other file of the bundle. proxy-global chains (`globalThis.String.prototype.x`,
    // `window.self.String.prototype.x`) name the same prototype through the global object
    if (parts.keys.at(-1) === 'prototype') {
      if (parts.keys.length === 1) {
        // the binding-less fallback passes the same name admission every direct spelling gets
        // (`isStaticPlacement`) - a free lowercase root is no global, and recording
        // `<lowercase>.prototype` minted a deopt key no read-side canon ever asks for.
        // it is NOT a redundant repeat of the resolver above, and the one case where the two
        // differ is the reason it stays: over a name whose SLOT this file overwrote the read canon
        // declines (that name no longer stands for the pristine global), while the WRITE side owes
        // the opposite bias - a key it fails to record is a deopt that never fires, so the patch
        // loses to the polyfill. read asks "is this still the global", write asks "what does this
        // taint", and only the first is a pristine question
        const root = resolveObjectName({ objectNode: parts.rootNode, scope, adapter, path })
          ?? (!adapter.hasBinding(scope, parts.rootNode.name, path) && isStaticPlacement(parts.rootNode.name)
            ? parts.rootNode.name : null);
        if (root) return `${ root }.prototype`;
      } else if (parts.keys.slice(0, -2).every(key => POSSIBLE_GLOBAL_OBJECTS.has(key))
        && POSSIBLE_GLOBAL_OBJECTS.has(resolveObjectName({ objectNode: parts.rootNode, scope, adapter, path }))) {
        // the ROOT is asked through the value canon, not by its spelling: an alias of the realm
        // (`const g = globalThis; g.String.prototype.at = patch`) and a proxy-entry import root
        // the same chain, and reading the bare name alone recorded neither
        return `${ parts.keys.at(-2) }.prototype`;
      }
    }
    // a proxy entry reached through MODULE LOWERING roots the chain at the global object: a bare CJS
    // require binds it directly, an interop wrapper hangs it on `.default`. resolved here, on the
    // write path, rather than in the shared proxy-root walk - reads use that walk too, and widening
    // it makes a disable-directive leaf read the ponyfill's namespace instead of the native one
    const lowered = loweredProxyGlobalNamespace(parts, { scope, adapter, path });
    if (lowered) return lowered;
    // static-container chains (`NS.M` over `const NS = { M: Map }` / class statics): the
    // destructure receiver canon walks the same literal hops
    return walkStaticReceiverChain({ receiverNode: parts.rootNode, walkPath: parts.keys, scope, adapter, path, ignoreWrittenSlots: true });
  }
  return null;
}

// canonical names for one mutation receiver, following the read-side canons. over-records by
// design: every REACHABLE value of a (re)assigned alias is poisoned - the safe direction.
// `receiverDeopts` carries chain ROOT names whose reached value is unknowable (an unreadable
// hop - `Array[k].x = v` could have patched anything under Array); the handler deopts them
// whole. `thisPath` (alias fans only) anchors the top-level-`this` context check at the
// declarator that captured the `this`, not the mutation site
function resolveMutationSite({ targetNode, scope, adapter, path, callArguments = null, resolveStaticKey = null }) {
  const names = new Set();
  const receiverDeopts = new Set();
  const seenBindings = new Set();
  const chainParts = new WeakMap();
  const siteCtx = { scope, adapter, path, chainParts, resolveStaticKey };
  // a PARAMETER has no declarator to fan, and BOTH value-resolution entry points owe the same
  // answer about it - the one asking about the binding itself, and the one asking about a chain
  // ROOTED at it (`function install(t) { t.box.groupBy = shim }`, `(...rest) { rest[0].x = shim }`)
  function bindingParamValues(identNode, binding) {
    return binding.kind === 'param'
      ? paramReachingValues({ identNode, binding, callArguments, ctx: { scope, adapter, path, resolveKey } }) : [];
  }
  function visitAliasValues(valueNode, depth, thisPath = null) {
    if (!valueNode || depth > 8) return;
    for (const leaf of valueFanLeaves(valueNode, [])) {
      const name = resolveLeafName(leaf, { ...siteCtx, thisPath });
      if (name) names.add(name);
      if (leaf.type === 'Identifier') visitBinding(leaf, depth + 1);
      // an alias bound to a chain root off a reassigned proxy holder (`let h; h = globalThis;
      // const alias = h.Array`) resolves no leaf name - fan its chain root like the target loop
      else if (!name && (leaf.type === 'MemberExpression' || leaf.type === 'OptionalMemberExpression')) {
        visitChainRootAlias(leaf, thisPath);
      }
    }
  }
  function visitBinding(identNode, depth) {
    if (!adapter.hasBinding(scope, identNode.name, path)) return;
    const binding = adapter.getBinding(scope, identNode.name, path);
    // keyed by the DECLARATION node: both adapters build a FRESH binding view per lookup, so
    // identity on the view never matched and the guard never fired. the declaration node is
    // stable across calls - the same key `proxyGlobalRootName`'s own cycle guard uses
    const bindingKey = binding?.node ?? binding;
    if (binding) {
      if (seenBindings.has(bindingKey)) return;
      seenBindings.add(bindingKey);
    }
    // delegate the bound-identifier receiver to the read-side canon: it resolves a destructure-leaf alias
    // (`const {Map:M}=globalThis` -> M=Map), a peeled namespace, a multi-hop prototype root - shapes the raw
    // declarator-init value-fan below misses, since the init is the WHOLE rhs (`globalThis`), dropping the
    // `{Map:M}` selector. over-record stays the safe direction; the fan still runs for reassignment unions.
    // runs BEFORE the null-binding bail: the canon answers even where the adapter has no binding
    // OBJECT (estree surfaces TSImportEquals only through the dedicated declaration lookup)
    const direct = resolveObjectName({ objectNode: identNode, scope, adapter, path });
    if (direct) names.add(direct);
    if (!binding) return;
    // a PARAMETER holds whatever the call passed, and a write through it patches THAT object -
    // `function install(target) { target.groupBy = shim } install(Map)` replaces a Map static
    // without spelling `Map` anywhere near the write. no declarator to fan, so the call sites are
    // the reaching values
    if (binding.kind === 'param') {
      for (const value of bindingParamValues(identNode, binding)) visitAliasValues(value, depth + 1);
      return;
    }
    // a destructure declarator binds a SELECTED slot: the canonical pattern / literal pairer
    // yields the slot's value union (nested patterns, holes, last-wins keys, spread bails), and
    // a receiver-shaped source synthesizes the member (`const { prototype: P } = Array` ->
    // `Array.prototype`), which the leaf resolver keys as the prototype pair
    const decl = binding.node;
    // the DECLARATION's own path anchors an aliased `this` (`const g = this; g.Promise = shim`)
    // where the `this` textually sits - the write may run from any function below it, and asking
    // the write's own path answered for the wrong frame, silently skipping every UMD-shaped
    // patch. reassignment rhs nodes carry no path, so the declaration anchor over-approximates
    // them (over-record - the safe direction)
    const bindingPath = binding.declarationPath ?? null;
    const patternDeclarator = decl?.type === 'VariableDeclarator' && decl.id && decl.id.type !== 'Identifier';
    if (patternDeclarator) {
      for (const slotValue of patternSlotValues(decl.id, decl.init, identNode.name, { scope, adapter, path, resolveKey })) {
        visitAliasValues(slotValue, depth, bindingPath);
      }
    }
    // a pattern declarator's init is the WHOLE rhs (`Array` for `{ prototype: P } = Array`):
    // fanning it would smuggle the CONTAINER name and record a spurious static beside the
    // slot fan's correct pair - the selected slot values above are the only sound fan there
    const init = binding.node?.init;
    if (!patternDeclarator) visitAliasValues(init, depth, bindingPath);
    const reCtx = { scope, adapter, path, resolveKey };
    for (const rhs of reassignmentValueNodes({ binding, usagePath: path, name: identNode.name, ctx: reCtx }) ?? []) {
      visitAliasValues(rhs, depth, bindingPath);
    }
  }
  // a member-chain target whose root reaches a proxy global through a value fan keys the mutation
  // under the chain's constructor leaf when a reachable root value is a proxy global (over-record -
  // the safe direction). two root shapes fan: a BOUND identifier (`let h; h = c ? other : globalThis;
  // h.Array.of = patch`) fans its init + reassignment union; an INLINE value fan
  // (`(c ? globalThis : self).Array.of = patch`) fans the chain root's own branches
  function visitChainRootAlias(leaf, thisPath = null) {
    const parts = chainPartsOf(leaf, siteCtx);
    if (!parts) return;
    // an unreadable HOP hides which value off the root was reached (`Array[k].x = v`) - the
    // mutation could sit anywhere under the root, so the ROOT deopts whole
    if (!parts.keys) {
      if (parts.rootNode.type === 'Identifier' && !adapter.hasBinding(scope, parts.rootNode.name, path)) {
        receiverDeopts.add(parts.rootNode.name);
        return;
      }
      // every leaf the fan can name deopts: `box = c ? Array : Map` reaches BOTH constructors, and
      // stopping at the first left the other one trusted under a patch that may have hit it
      for (const { node: valueLeaf, thisPath: leafAnchor } of chainRootValueLeaves(parts.rootNode, thisPath)) {
        const rootName = resolveLeafName(valueLeaf, { ...siteCtx, thisPath: leafAnchor });
        if (rootName) receiverDeopts.add(rootName);
      }
      return;
    }
    if (parts.keys.slice(0, -1).some(key => !POSSIBLE_GLOBAL_OBJECTS.has(key))) return;
    for (const { node: valueLeaf, thisPath: leafAnchor } of chainRootValueLeaves(parts.rootNode, thisPath)) {
      const rootName = resolveLeafName(valueLeaf, { ...siteCtx, thisPath: leafAnchor });
      if (rootName && POSSIBLE_GLOBAL_OBJECTS.has(rootName)) {
        names.add(parts.keys.at(-1));
        return;
      }
    }
  }
  // every reachable value leaf of a chain root: a BOUND identifier fans its init +
  // reassignment union, an inline value composite fans its own branches. each leaf carries the
  // anchor its own `this` reads at - the DECLARATION that captured it, not the write's frame -
  // so a `const g = this` fan answers the same from a write anywhere below it
  function chainRootValueLeaves(rootNode, thisPath = null) {
    let rootValues;
    let anchor = thisPath;
    if (rootNode.type === 'Identifier') {
      if (!adapter.hasBinding(scope, rootNode.name, path)) return [];
      const binding = adapter.getBinding(scope, rootNode.name, path);
      if (!binding) return [];
      anchor = binding.declarationPath ?? thisPath;
      // pattern declarator: the name holds a SLOT of the init - fan the paired slot values,
      // never the container (the `visitBinding` discipline; the raw init smuggled the
      // container name into the deopt census)
      const decl = binding.node;
      const patternDeclarator = decl?.type === 'VariableDeclarator' && decl.id && decl.id.type !== 'Identifier';
      const initValues = patternDeclarator
        ? patternSlotValues(decl.id, decl.init, rootNode.name, { scope, adapter, path, resolveKey })
        : [identifierDeclaratorInit(binding), ...bindingParamValues(rootNode, binding)];
      rootValues = [...initValues, ...reassignmentValueNodes({
        binding, usagePath: path, name: rootNode.name, ctx: { scope, adapter, path, resolveKey },
      }) ?? []];
    } else rootValues = [rootNode];
    const leaves = [];
    for (const valueNode of rootValues) if (valueNode) valueFanLeaves(valueNode, leaves);
    return leaves.map(node => ({ node, thisPath: anchor }));
  }
  const target = valueFanLeaves(targetNode, []);
  for (const leaf of target) {
    if (leaf.type === 'Identifier') {
      if (!adapter.hasBinding(scope, leaf.name, path)) {
        // unshadowed bare name - the direct global candidate, no alias machinery involved
        names.add(leaf.name);
      } else {
        visitBinding(leaf, 0);
      }
    } else {
      const name = resolveLeafName(leaf, siteCtx);
      if (name) names.add(name);
      else if (leaf.type === 'MemberExpression' || leaf.type === 'OptionalMemberExpression') visitChainRootAlias(leaf);
    }
  }
  return { names: [...names], receiverDeopts: [...receiverDeopts] };
}
