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
import {
  entryToGlobalHint,
  hasOwnStaticDefinition,
  hasConstructorEntry,
  hasConstructorStaticKey,
  hasStaticDefinitionKey,
} from '../index.js';
import knownBuiltInReturnTypes from '@core-js/compat/known-built-in-return-types' with { type: 'json' };
import {
  aliasDeclScope,
  allProxySelectingInit,
  arrayLiteralSlotValue,
  bindsModuleDefault,
  bindingDeclarationPath,
  boundInvocation,
  bindingLoopAnchor,
  canHoldBuiltIn,
  CENSUS_CONTAINER_TYPES,
  CLASS_NODE_TYPES,
  classStaticSlotMember,
  collectFileCensus,
  collectForXWriteMembers,
  collectOwnReturns,
  collectParamBindingNames,
  computedKeyStaticName,
  createDeclaredNameIndex,
  declarationScopeIn,
  declarationScopesOf,
  declaredIdentifierNodes,
  definitionTimeSlotOf,
  ESCAPED_CONTAINER_NAMES,
  ESCAPED_CTOR_NAMES,
  ESCAPED_CTOR_REFS,
  escapeStampedName,
  findNearestVarScopeOwner,
  arrayWrapSlotValueCandidates,
  findObjectKeyBeforeSpread,
  objectPropertyReadValue,
  flattenBranchKeys,
  foldedPropertyKeyName,
  followConstLiteralAlias,
  forOfIterableElements,
  FUNCTION_LIKE_NODE_TYPES,
  flattenBranchingValueNodes,
  getFallbackBranchSlots,
  globalProxyNameFromImportSource,
  identifierDeclaratorInit,
  identifierReferencedInSubtree,
  IMPORT_SPECIFIER_TYPES,
  inlineCallYieldedContainer,
  invocationNode,
  calleeYieldedContainer,
  callPairing,
  installedWriteValue,
  isASTNode,
  isBindingPosition,
  isDestructurePattern,
  isGuardedAliasingWrite,
  isMemberAccessNode,
  isMemberMutationContext,
  isMemberWriteOnlyContext,
  isMutatedStaticPair,
  isNonReferencePosition,
  isQuietLiteralOperand,
  isThisRebinding,
  isTopLevelThisContext,
  isVarScopeBoundary,
  CENSUS_KEY_NAMES,
  CENSUS_STATIC_RECEIVERS,
  isAmbientBindingShape,
  jsxIdentifierReferencesBinding,
  kebabToCamel,
  literalIdentifierSlots,
  LOCAL_MEMBER_CALLEES,
  memberChainKeys,
  memberKeyName,
  mayHaveSideEffects,
  MUTATED_MEMBERS_UNKNOWN,
  MUTATED_STATIC_PINNED,
  mutatedStaticKey,
  nodePositionKey,
  noReassignmentReachesUsage,
  objectLiteralPrototypeValue,
  ownerWritePathIndex,
  ownerSourceWritePath,
  PARAMETER_STATIC_SOURCES,
  parameterStaticSource,
  paramReturnsTheValue,
  patternBindsName,
  patternMemberTargetPairs,
  patternReceiverSlotNodes,
  patternSlotHasDefault,
  patternSlotSpreadShifted,
  patternRootKeyPathsFor,
  patternSlotTarget,
  patternSlotValues,
  peelFallbackReceiver,
  peelIifeReturnTarget,
  peelSequenceTail,
  peelToBareExpr,
  plainSynthKeyName,
  positionalElements,
  POSSIBLE_GLOBAL_OBJECTS,
  PRIMITIVE_LITERAL_TYPES,
  propertyKeyName,
  provablyPrecedes,
  pureImportEntryOf,
  pureImportEntryOfProgram,
  privateNameSpelling,
  pureImportSourceEntry,
  reassignmentDominatesUsage,
  reassignmentValueNodes,
  receiverSlotRead,
  restCopiedValues,
  resolvedCallYieldedContainer,
  runtimeChainRoot,
  referencesArgumentsObject,
  requireCallSource,
  resolveCallArgument,
  resolveCallArgumentCoords,
  singleReturnBodyExpression,
  spineHasOptionalHop,
  staticMemberKeyName,
  TS_EXPR_WRAPPERS,
  tsImportEqualsProxyName,
  unwrapExpressionChain,
  unwrapRuntimeExpr,
  VALUE_FLOW_ASSIGN_OPS,
  varInitDominatesUsage,
  walkAstChildren,
  walkAstNodes,
  walkPatternIdentifiers,
  writtenPatternSlotValues,
  pureReturnBodyValue,
  isRestProperty,
  patternEdgeSide,
} from '../helpers/ast-patterns.js';
import {
  callYieldedContainer,
  pairedSlotValues,
  globalProxyMemberName,
  inlineCallReturnExpression,
  inlineInteropCallSource,
  interopDefaultProxyName,
  isCallShape,
  isStaticPlacement,
  ownChainOptionalObjects,
  peelReceiverSequenceTail,
  requireBoundProxyGlobalName,
  resolveKey,
  resolveObjectName,
} from './resolve.js';
import { isKnownGlobalName, staticReceiverHint } from './globals.js';
import { canonicalArrayIndex, dropLeadingThisParam } from '../resolve-node-type/base.js';
import { findEnumMember } from '../resolve-node-type/enum-types.js';
import { readRunsAccessor, walkStaticReceiverChain } from './destructure.js';

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
function collectGateRoots(node, out, programNode, keys = [], depth = 0) {
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
        collectGateRoots(root.consequent, out, programNode, keys, depth + 1);
        collectGateRoots(root.alternate, out, programNode, keys, depth + 1);
        return out;
      case 'LogicalExpression':
        collectGateRoots(root.left, out, programNode, keys, depth + 1);
        collectGateRoots(root.right, out, programNode, keys, depth + 1);
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
    // ... a TAGGED TEMPLATE is a call spelled otherwise: its tag is the callee, and the scoped
    // stage pairs its expressions like arguments (`tag\`\${ Array }\`.from = patched`)
    case 'CallExpression':
    case 'OptionalCallExpression':
    case 'TaggedTemplateExpression': {
      // The scoped pass follows the invoked function behind call/apply/bind too. Naming
      // the invoker property here would incorrectly rule that function's return out.
      const callee = peelToBareExpr(callPairing(root, programNode)?.callee);
      out.push({
        name: '', keys, callRooted: true,
        calleeName: callee?.type === 'Identifier' ? callee.name : null,
        calleeIsFunction: callee?.type === 'FunctionExpression' || callee?.type === 'ArrowFunctionExpression',
        calleeIsDefault: isMemberAccessNode(callee) && memberKeyName(callee) === 'default',
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

// Explicit Object/Reflect stores expose their installed values independently of key deopts.
// Known keys still invalidate slots when getter returns or unknown sources cannot prove a value.
// Unknown keys still store the known value, under the ordinary write graph's wildcard.
function mutatorInstalledValues(namespace, method, args, definite = false) {
  if (namespace !== 'Object' && namespace !== 'Reflect') return [];
  if (method !== 'defineProperty' && method !== 'defineProperties' && method !== 'assign' && method !== 'set') return [];
  const entries = [];
  const target = namespace === 'Reflect' && method === 'set' && args[3] ? args[3] : args[0];
  if (!target) return entries;
  const keyNode = unwrapRuntimeExpr(args[1]);
  const installedKey = computedKeyStaticName(keyNode) ?? (keyNode?.type === 'Identifier' ? null : plainSynthKeyName(keyNode));
  function dataValue(node) {
    const descriptor = unwrapRuntimeExpr(node);
    if (descriptor?.type !== 'ObjectExpression') return null;
    // Definite stores preserve the existing data slot's attributes. Other descriptor
    // fields can make a later assignment fail, even on an initially fresh object.
    if (definite && (descriptor.properties.length !== 1 || descriptor.properties[0].computed)) return null;
    const prop = findObjectKeyBeforeSpread(descriptor.properties, item => foldedPropertyKeyName(item) === 'value'
      || foldedPropertyKeyName(item) === null);
    return prop && foldedPropertyKeyName(prop) === 'value' && prop.kind !== 'get' && prop.kind !== 'set'
      ? objectPropertyReadValue(prop) : null;
  }
  if ((namespace === 'Object' || namespace === 'Reflect') && method === 'defineProperty') {
    const value = dataValue(args[2]);
    entries.push({ targetNode: target, key: installedKey, value });
  } else if (namespace === 'Reflect' && method === 'set') {
    if (args[2]) entries.push({ targetNode: target, key: installedKey, value: args[2] });
  } else if (namespace === 'Object' && (method === 'assign' || method === 'defineProperties')) {
    for (const source of method === 'assign' ? args.slice(1) : [args[1]]) {
      const literal = unwrapRuntimeExpr(source);
      if (literal?.type !== 'ObjectExpression') {
        entries.push({ targetNode: target, key: null, value: null });
        continue;
      }
      for (const prop of literal.properties) {
        const key = foldedPropertyKeyName(prop);
        const data = (prop.type === 'ObjectProperty' || prop.type === 'Property')
          && prop.kind !== 'get' && prop.kind !== 'set' && !prop.method;
        if (data && !prop.computed && key === '__proto__' && !prop.shorthand) continue;
        const value = definite && (!data || prop.computed) ? null
          : method === 'assign' ? objectPropertyReadValue(prop, { preservesBody: true })
          : data ? dataValue(prop.value) : null;
        entries.push({ targetNode: target, key, value });
      }
    }
  }
  return entries;
}

// the slot writes of an explicit store into a named target, for the builtin the call resolved to
// (`callBuiltin`): every written key and its value as an assignment records them
// (`mutatorInstalledValues`); literal assign sources include getter returns, since the original call
// still evaluates each getter. `owned`: every key and value is readable, so the target needs no
// generic call escape beside them
function explicitStoreWrites({ namespace, method, args }) {
  const assign = namespace === 'Object' && method === 'assign';
  const entries = mutatorInstalledValues(namespace, method, args);
  const target = unwrapRuntimeExpr(namespace === 'Reflect' && method === 'set' && args[3] ? args[3] : args[0]);
  if (target?.type !== 'Identifier' || (!assign && !entries.length)) return null;
  // a source or descriptor the walk cannot read carries keys or values it cannot name, and THEN the
  // generic escape is the only sound record; `Object.assign(w)` with no source at all writes nothing
  // and owns the target
  const owned = assign ? args.slice(1).every(source => unwrapRuntimeExpr(source)?.type === 'ObjectExpression')
    : entries.every(({ key, value }) => key !== null && value !== null);
  return { target, entries, owned };
}

// the `.call` / `.apply` hop spellings, recorded from the invocation itself (the member
// read's frame cannot see its grandparent): value args past the receiver for `.call`, the
// args-array's elements for `.apply`. `recordReceiver` takes the mutator's receiver NODE - a
// name or a member chain - with the values the invocation installs
function recordHopInvocation(node, recordReceiver) {
  const hop = unwrapRuntimeExpr(node.callee);
  if ((hop?.type !== 'MemberExpression' && hop?.type !== 'OptionalMemberExpression') || hop.computed
    || (hop.property?.name !== 'call' && hop.property?.name !== 'apply')) return;
  const mutatorRead = unwrapRuntimeExpr(hop.object);
  if ((mutatorRead?.type !== 'MemberExpression' && mutatorRead?.type !== 'OptionalMemberExpression')
    || !memberReadDetachesRepositioner(mutatorRead)) return;
  const owner = unwrapRuntimeExpr(mutatorRead.object);
  let values = [];
  if (hop.property.name === 'call') values = node.arguments.slice(1);
  else {
    const argsArray = unwrapRuntimeExpr(node.arguments?.[1]);
    if (argsArray?.type === 'ArrayExpression') values = argsArray.elements;
  }
  recordReceiver(owner, values);
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
const RECORDED_MUTATION_ROOTS = new WeakMap();
// Recursive alias reads use the same reference facts as the stamp walk. The graph owns their
// lifetime, including the definition-time references whose binding scope is not the body scope.
const ALIAS_SCOPE_FACTS = new WeakMap();
// ... and the names whose escape rests on a binding this census cannot ENUMERATE rather than on a
// reference it proved reaches the realm: usage-global owes those a family (it patches the one slot
// every read lands on, so a caller's value is covered too), usage-pure does not - it substitutes
// its minted binding only where the realm is proven, and a value a caller supplies is never it
const GLOBAL_ONLY_CTOR_NAMES = new WeakMap();
// Retained pure values share one name set across both census reducers, regardless of result order.
const HELD_CTOR_NAMES = new WeakMap();

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
// ... and the pairing the census read each call through - its program's import table, shadow and
// patch checks, literal spreads expanded: a reader of the call's arguments asks the same one
// (`censusCallPairing`), or a lowered invoker (`_Reflect$apply(f, t, [x])`) places them elsewhere
const CENSUS_PAIRINGS = new WeakMap();
function censusCallPairing(call, program = null) {
  return CENSUS_PAIRINGS.get(call) ?? callPairing(call, program);
}
// ... the builtin each call invokes where it stands on none (`callBuiltin`)
const CALL_BUILTINS = new WeakMap();
// ... and the way to have them resolved from another reducer's result (see `ensureCallees`)
const CALLEE_RESOLUTION = new WeakMap();

// Most queued values are not forwarding calls and need no cycle tracking.
function peelPassthroughCalls(node, passthrough) {
  if (!passthrough?.has(node)) return node;
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

// ... and the keys a write stores under through a receiver no NAME spells - `this` of a static member,
// a plain function or a literal's method, a call's result: the container it lands on is not the
// census's to name, so that slot of EVERY container reads as written. a `this` of an instance member
// writes the instance, not a container the static walks read - unless the chain reaches the class
// through `.constructor`
const UNROOTED_WRITE_KEYS = new WeakMap();

// the chains a write target lands on, each the root and the keys (`staticMemberKeyName`) it spells: a
// sequence stands for its tail, a selection for each of its arms, a literal spelled in place for the
// values its slot at the next key holds - `(n++, o).M`, `(c ? o : p).M`, `[o][0].M` all write `o.M`.
// a root none of those name stays the chain's own
function writeTargetChains(target) {
  const chains = [];
  const pending = [memberChainKeys(target, staticMemberKeyName)];
  for (let step = 0; pending.length && step < MAX_WRITE_TARGET_CHAINS; step++) {
    const { root, keys } = pending.pop();
    const arms = flattenBranchingValueNodes([peelReceiverSequenceTail(root)]);
    if (arms.length > 1 || arms[0] !== root) {
      for (const arm of arms) pending.push(extendChain(arm, keys));
    } else if (CENSUS_CONTAINER_TYPES.has(root?.type) && root.type !== 'ClassExpression' && keys.length && keys[0] !== null) {
      for (const value of containerSlotValues(root, keys[0])) pending.push(extendChain(value, keys.slice(1)));
    } else chains.push({ root, keys });
  }
  return chains.length ? chains : [memberChainKeys(target, staticMemberKeyName)];
}
const MAX_WRITE_TARGET_CHAINS = 64;

function extendChain(node, keys) {
  const inner = memberChainKeys(node, staticMemberKeyName);
  return { root: inner.root, keys: [...inner.keys, ...keys] };
}

function unrootedWriteKey({ root, keys }, scopes) {
  if (root?.type === 'Identifier' || !keys.length) return null;
  if (root?.type === 'ThisExpression' && keys[0] !== 'constructor') {
    const at = scopes.findLastIndex(scope => isThisRebinding(scope));
    const methodValue = at > 0 && scopes[at].type === 'FunctionExpression' && scopes[at - 1]?.value === scopes[at];
    const owner = at === -1 ? null : scopes[methodValue ? at - 1 : at];
    const method = owner?.type === 'ClassMethod' || owner?.type === 'ClassPrivateMethod' || owner?.type === 'MethodDefinition';
    if (method && !owner.static) return null;
  }
  const key = keys.at(-1);
  return key === null ? '*' : key;
}

function writtenSlotValues(written, name, path) {
  return written?.get(name)?.get(path) ?? [];
}

// a write through one name of a container lands on the container every name a plain alias ties to it
// reads (`const a = o; a.g = Map` is a write of `o.g`), so a read through one binding owes the writes
// filed under every name of its alias class (`aliasWriteNames`). the class ties BINDINGS, keyed as the
// walks key them: tied by spelling, namesakes in unrelated scopes chained every local `i`, `start` and
// `index` of a file into one class, and a walk reaching any of them took the writes of all
const ALIAS_WRITE_CLASSES = new WeakMap();
function shareAliasWrites(written, aliases) {
  const parent = new Map();
  const nameOf = new Map();
  function find(key) {
    while (parent.has(key)) key = parent.get(key);
    return key;
  }
  for (const [name, entries] of aliases) {
    const { byOwner, unowned } = entryOwnerIndex(entries);
    for (const [owner, owned] of [...byOwner, [null, unowned]]) for (const [, { value }] of owned) {
      const target = value?.type ? unwrapRuntimeExpr(installedWriteValue(value)) : null;
      if (target?.type !== 'Identifier') continue;
      // the key a reference standing in the entry's own scope resolves the name to
      const from = aliasBindingKey(aliases, name, owner === null ? [] : [owner]);
      const to = aliasBindingKey(aliases, target.name, aliasReferenceScopes(aliases, target));
      nameOf.set(from, name).set(to, target.name);
      const fromRoot = find(from);
      const toRoot = find(to);
      if (fromRoot !== toRoot) parent.set(fromRoot, toRoot);
    }
  }
  const members = new Map();
  for (const [key, name] of nameOf) {
    const root = find(key);
    if (!members.has(root)) members.set(root, { keys: [], names: new Set() });
    members.get(root).keys.push(key);
    members.get(root).names.add(name);
  }
  const classes = new Map();
  for (const { keys, names } of members.values()) if (names.size > 1) {
    const shared = [...names];
    for (const key of keys) classes.set(key, shared);
  }
  ALIAS_WRITE_CLASSES.set(written, classes);
}

// the names whose writes a read through the binding `key` of `name` owes: its alias class once
// `shareAliasWrites` drew them, the name alone before
function aliasWriteNames(written, key, name) {
  return ALIAS_WRITE_CLASSES.get(written)?.get(key) ?? [name];
}

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
// pairs a parameter binding takes its values from. `pairings` are the calls as the invocation canon
// reads them. null where a value cannot be named: a REST parameter takes a list rather than a
// value, an unexpanded spread at or inside a paired slot leaves no complete source, as does an
// undecidable list. Parameter properties (`constructor(private x)`) also decline the pairing.
// A parameter the body discards before its first read (`paramDropsTheValue`) pairs with nothing.
// Reuse the census's arguments verdict instead of scanning the body again per parameter.
function parameterValuePairs(host, pairings, aliases, referencesArguments) {
  const pairs = [];
  const params = dropLeadingThisParam(host.params ?? []);
  if (params.every(param => param.type === 'Identifier') && new Set(params.map(param => param.name)).size !== params.length) return null;
  for (const [index, param] of params.entries()) {
    if (param?.type === 'RestElement') return null;
    const bound = param?.type === 'AssignmentPattern' ? param.left : param;
    if (bound?.type !== 'Identifier' && !isDestructurePattern(bound)) return null;
    if (paramDropsTheValue(host, index, referencesArguments)) continue;
    if (param.type === 'AssignmentPattern') pairs.push([bound, param.right]);
    for (const { args, argsUnknown } of pairings) {
      if (argsUnknown || args.some((argument, at) => at <= index && argument?.type === 'SpreadElement')) return null;
      if (isDestructurePattern(bound)) {
        const names = collectParamBindingNames([bound]);
        const values = aliasedValues(aliases, installedWriteValue(args[index]), new Set());
        const shifted = values.some(rhs => [...names].some(id => patternSlotSpreadShifted(bound, rhs, id, { followIifeReturns: true })));
        if (shifted) return null;
      }
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
const NO_CHAIN_SLOT = { expanded: true, outside: true, values: [] };

// does a write this file spells land on the slot a member chain of a BOUND name reads, or on a
// slot above it - or under one of its keys through a receiver no name spells?
function censusSlotWritten(programNode, aliasInit, member) {
  const { root, keys } = memberChainKeys(member);
  const unrooted = UNROOTED_WRITE_KEYS.get(programNode);
  if (unrooted?.size && keys.some(key => unrooted.has(key ?? '*') || unrooted.has('*'))) return true;
  if (root?.type !== 'Identifier' || keys.includes(null)) return false;
  const written = WRITTEN_SLOT_VALUES.get(programNode);
  const names = aliasWriteNames(written, aliasBindingKey(aliasInit, root.name, aliasReferenceScopes(aliasInit, root)), root.name);
  return keys.map((key, at) => JSON.stringify(keys.slice(0, at + 1)))
    .some(path => names.some(name => writtenSlotValues(written, name, path).length > 0));
}

// the global a read off the REALM names: a proven realm reference to a known global (`Map`), or a
// member chain off one through proxy hops (`globalThis.Map`, the read a destructure level pairs with
// included) - or null
function realmGlobalName(programNode, node) {
  const value = peelReceiverSequenceTail(unwrapRuntimeExpr(node));
  const name = value?.type === 'Identifier' ? value.name : isMemberAccessNode(value) ? globalProxyMemberName({ node: value }) : null;
  const root = name && isKnownGlobalName(name) ? runtimeChainRoot(value) : null;
  return root?.type === 'Identifier' && REALM_CTOR_REFS.get(programNode)?.(root) === 'proven' ? name : null;
}

// the receivers whose constructor reads are HELD - read through a binding the pure flavor mints
// rather than resolved by name - so their entry has to carry the statics itself: a member chain
// whose root reaches a GUARDED alias, and one whose root SELECTS between a realm and something
// else (`(c ? realm() : opaque()).Map.groupBy`), where the identity guard reads the static off the
// entry it picks - held only for a read of one of the constructor's OWN statics (an intrinsic
// function property is on the narrow entry too), and never for a selection between pristine proxy
// surfaces alone, which collapses onto the root's own pure and reads by name (asked without an
// adapter: the census runs ahead of one, and a mutated slot deopts its read elsewhere). a
// DESTRUCTURE source stamps its slot's name straight into `heldInSlot`; a member receiver joins
// `kept`, the values the escape walk stamps beside the call-argument facts already collected there
// Opaque iteration adds possible families, separately from exact receiver values. A named static
// holds that family only in pure; an unknown key needs the whole family in both flavors.
// Constructor rest requires the whole family in each flavor that has a constructor entry.
function collectHeldReceivers({
  programNode,
  memberReceivers,
  aliasInit,
  guardedAliases,
  heldState,
  heldInSlot,
  globalOnly,
  kept,
  hasOpaqueIteration,
  closedParameterHosts,
  referencesArguments,
  opaqueReads,
  restSources,
  restValues,
  keyNames,
}) {
  const opaqueFamilies = new WeakMap();
  const receiverFamilies = new WeakMap();
  const returnReads = new WeakMap();
  const retainedReads = new WeakMap();
  const ambiguousReads = new WeakMap();
  const receiverRoots = new WeakMap();
  // Candidate queries share the escape walk without publishing escape or position facts.
  // Iteration keys are provenance records; receiver keys are source callees. Calls to one
  // callee share its return graph, so neither that graph nor its completeness is scanned per use.
  function familiesFrom(value, callee = null, receiverOnly = false, key = callee ?? value) {
    const memo = receiverOnly ? receiverFamilies : opaqueFamilies;
    let facts = memo.get(key);
    if (!facts) {
      facts = { names: new Set(), callees: new Set() };
      memo.set(key, facts);
      stampEscapesFrom(programNode, value.opaqueSource ?? value, {
        ...facts, stamps: new Set(), containers: new Set(), receiverOnly: !!callee || receiverOnly, strictMembers: receiverOnly,
        state: { names: new Set(), roots: new Map(), slots: new Map() },
      });
      // Every forwarding call must be attributable, not just the outer single-return body.
      facts.enumerable = true;
      facts.exact = true;
      if (callee) for (const called of facts.callees) {
        let reads = returnReads.get(called);
        if (reads === undefined) {
          const candidates = [];
          // returns that read no parameter hand back the same values whatever the call passed, so
          // a parameter list alone does not make them opaque; one that reads a parameter is the
          // caller's to pair, and stays opaque here. ... and a return holding a MEMBER of the file's own
          // container (`const kept = K.g; () => kept`) names its constructor only to a container walk,
          // which a bare call's reader does not take: the name channel reads a realm nav alone
          const single = !returnsReadParameters(called, referencesArguments(called))
            && singleReturnBodyExpression(called.body, { preservesBody: true, returnSink: candidates });
          const exact = !!single && readValues(aliasInit, single, new Set())
            .every(held => !isMemberAccessNode(unwrapRuntimeExpr(held)) || isKnownGlobalName(escapeStampedName(held)));
          reads = { exact, follows: exact || (candidates.length > 0 && candidates.length === calleeReturnValues(called).length) };
          returnReads.set(called, reads);
        }
        if (!reads.follows) facts.enumerable = false;
        if (!reads.exact) facts.exact = false;
      }
    }
    return facts;
  }
  // The same provenance answers pure's retained-static obligation and global's per-key union.
  // Its private walk must not turn a speculative candidate query into an actual container escape.
  function iteratedFamilies(receiver) {
    // This callback also runs after pure rewrites; only the census loop below uses the index.
    const root = peelReceiverSequenceTail(runtimeChainRoot(receiver));
    // an effect prefix ahead of a member receiver runs where the read stands: the slot is its tail's
    const target = peelReceiverSequenceTail(receiver);
    const families = new Set();
    const values = isMemberAccessNode(target)
      ? chainSlotValues(aliasInit, target, heldState, WRITTEN_SLOT_VALUES.get(programNode)).values
      : chainRootValues(aliasInit, root, new Set(), heldState.roots);
    for (const value of values) if (value.opaqueSource) {
      for (const name of familiesFrom(value).names) families.add(name);
    }
    return families;
  }
  // the families a static read pure cannot serve by NAME owes the entry it reads through. A local call
  // is not an escape: pure needs the returned namespace when it cannot resolve a retained static
  // read, and global uses per-key candidates unless the key itself is unknown - pure resolves one by
  // name where every callee return is one value, read through any alias, and by an identity guard
  // over the returned candidates only on a receiver it can guard. and a receiver that may hold more
  // than one value names no single constructor at all: pure reads its static RAW off whatever arrived,
  // and the constructor it may hold is one pure MINTED into that value's spelling, so each one whose
  // own static the read is keeps the entry that carries it - but a name some write reassigns, which
  // the identity guard its writes register serves on a bare-name receiver, the one spelling that
  // carries it. ONE value is served by name - unless a slot holds it through such a name, which the
  // read side does not trust, or the read lands on an ACCESSOR (`readsAccessor`) the read side names
  // only by running the getter
  function holdUnresolvedReadFamilies({ receiver, root, readKey, guardable, guardsIdentity, keyNamed = true, keepsCallRead = false }) {
    // the receiver's VALUE: an effect prefix ahead of it runs where the read stands and names nothing
    const target = peelReceiverSequenceTail(receiver);
    const member = isMemberAccessNode(target);
    const callValues = !member && (readKey === null || hasStaticDefinitionKey(readKey))
      ? chainRootValues(aliasInit, root, new Set(), heldState.roots) : [];
    // Root answers share a source array per binding. Repeated reads of the same key must not
    // rescan every caller's argument; different keys still carry different family obligations.
    let answeredKeys = retainedReads.get(callValues);
    if (callValues.length && !answeredKeys?.has(readKey)) {
      if (!answeredKeys) retainedReads.set(callValues, answeredKeys = new Set());
      answeredKeys.add(readKey);
      for (const value of callValues) {
        const call = unwrapRuntimeExpr(value);
        const callee = !PASSTHROUGH_CALL_VALUES.get(programNode)?.has(call) && CALL_CALLEES.get(programNode)?.get(call);
        if (!callee || callee.async || callee.generator) continue;
        const facts = familiesFrom(value, callee);
        if (readKey !== null && facts.enumerable && (facts.exact || guardable) && !keepsCallRead) continue;
        for (const name of facts.names) {
          if (readKey !== null && !hasOwnStaticDefinition(name, readKey)) continue;
          if (readKey === null) globalOnly.add(name);
          heldInSlot.add(name);
        }
      }
    }
    if (typeof readKey !== 'string' || !hasConstructorStaticKey(readKey)) return;
    const slot = member ? chainSlotValues(aliasInit, target, heldState, WRITTEN_SLOT_VALUES.get(programNode)) : null;
    const reached = slot?.reached ?? new Set();
    const values = slot?.values ?? chainRootValues(aliasInit, root, reached, heldState.roots);
    // ... a member off the REALM no container of this file holds names the global its key spells: a
    // key folding to several of its statics reads through the binding pure mints for it
    const realm = member && !values.length ? realmGlobalName(programNode, target) : null;
    if (realm) {
      if (!keyNamed && hasConstructorEntry(realm) && hasOwnStaticDefinition(realm, readKey)) heldInSlot.add(realm);
      return;
    }
    const reassigned = [...reached].some(name => guardedAliases.has(name));
    // an OPEN union (`openSource`) serves a bare name through the identity guard its candidates
    // register, and nothing read off a member of it
    const open = values.some(value => value.openSource);
    const known = open ? values.filter(value => !value.openSource) : values;
    // ... and a member slot the file WRITES is one pure never names off the literal: the read side bails
    // there, whatever single value the census follows into it
    const served = keyNamed && known.length === 1 && readsOneValue(known[0])
      && !reassigned && !(member && (open || censusSlotWritten(programNode, aliasInit, target)))
      && !readsAccessor(target) && !readsAccessor(known[0]);
    // ... and a reassigned NAME is served by the identity guard its host renders, over values that guard
    // can name: none where the host renders no guard (`in`, a slot default, a for-of head)
    const guarded = keyNamed && guardsIdentity && reassigned && unwrapRuntimeExpr(target)?.type === 'Identifier'
      && !known.some(readsAccessor);
    let answered = ambiguousReads.get(values);
    if (!known.length || served || guarded || answered?.has(readKey)) return;
    if (!answered) ambiguousReads.set(values, answered = new Set());
    answered.add(readKey);
    for (const value of known) {
      // a bare name IS the one it spells; any other value is asked what it may stand for
      const leaf = unwrapRuntimeExpr(value);
      for (const name of leaf?.type === 'Identifier' ? [leaf.name] : familiesFrom(value, null, true).names) {
        if (hasConstructorEntry(name) && hasOwnStaticDefinition(name, readKey)) heldInSlot.add(name);
      }
    }
  }
  // a MEMBER read - one the source spells, or one the census synthesized off a returned value
  // (`keyPathRead`) - stands for every value the slot it reads may hold, and is one value only where
  // they are one, all the way down; a read off the realm names its one global
  function readsOneValue(value, seen = new Set()) {
    const read = unwrapRuntimeExpr(value);
    if (!isMemberAccessNode(read) || seen.has(read) || isKnownGlobalName(escapeStampedName(read))) return true;
    seen.add(read);
    if (readsAccessor(read)) return false;
    const { values } = chainSlotValues(aliasInit, read, heldState, WRITTEN_SLOT_VALUES.get(programNode));
    return values.length === 1 && readsOneValue(values[0], seen);
  }
  // does a member read land on a GETTER of a container this census indexes, one whose body runs
  // something beside its return - the read side names a pure one by name? a getter read inside that
  // body is such work too, asked of this same census: the scoped receiver walk asks it of the scope,
  // and the two must agree or the entry this picks and the claim that walk leaves split. a read
  // re-entering an accessor under question answers yes - that getter recurses at runtime too
  function readsAccessor(node) {
    const seen = new Set();
    function runsWork(candidate) {
      const read = unwrapRuntimeExpr(candidate);
      const key = isMemberAccessNode(read) ? staticMemberKeyName(read) : null;
      if (key === null) return false;
      if (seen.has(read)) return true;
      seen.add(read);
      const bodyReads = { adapter: { readRunsAccessor: ({ node: inner }) => runsWork(inner) } };
      const owner = unwrapRuntimeExpr(read.object);
      const owners = isMemberAccessNode(owner)
        ? chainSlotValues(aliasInit, owner, heldState, WRITTEN_SLOT_VALUES.get(programNode)).values
        : chainRootValues(aliasInit, owner, new Set(), heldState.roots);
      return censusContainersOf(owners).some(container => {
        const member = container.type === 'ObjectExpression'
          ? objectLiteralSlotMember(container, key, 'get') : classStaticSlotMember(container, key);
        return member?.kind === 'get' && !pureReturnBodyValue((member.value ?? member).body, bodyReads);
      });
    }
    return runsWork(node);
  }
  // Candidate-only queries remain safe when writes prevent the complete escape proof. Pure
  // tests constructor identity at the read; a candidate never substitutes a user receiver directly.
  for (const [member, names] of opaqueReads) if (names === null) {
    const source = unwrapRuntimeExpr(member.object);
    const key = source?.type === 'Identifier' ? chainRootValues(aliasInit, source, new Set(), heldState.roots)
      : isMemberAccessNode(source) ? chainSlotValues(aliasInit, source, heldState, WRITTEN_SLOT_VALUES.get(programNode)).values : source;
    opaqueReads.set(member, familiesFrom(source, null, false, key).names);
  }
  // Closed local calls and opaque selections publish the same candidate facts as iteration.
  // Global can cover a named static without treating its receiver as handed out.
  CENSUS_STATIC_RECEIVERS.set(programNode, (receiver, includeLocal = false) => {
    if (!receiver) return [];
    const candidates = opaqueReads.get(unwrapRuntimeExpr(receiver));
    if (!includeLocal) {
      const names = hasOpaqueIteration ? iteratedFamilies(receiver) : [];
      return candidates ? new Set([...names, ...candidates]) : names;
    }
    const root = peelReceiverSequenceTail(runtimeChainRoot(receiver));
    const target = peelReceiverSequenceTail(receiver);
    const values = chainRootValues(aliasInit, root, new Set(), heldState.roots);
    // a local CALL is what the root holds - and a call handing an argument straight back is read as
    // that argument, so the call is asked of the root's own alias answer as well - or what the SLOT
    // a member receiver reads holds (`[f()][0]`), where no write reaches it: a written slot is the
    // read side's, which weighs the write against the call the literal spelled
    function localCall(value) {
      return CALL_CALLEES.get(programNode)?.has(unwrapRuntimeExpr(value));
    }
    const local = aliasReferenceScopes(aliasInit, root)?.some(scope => closedParameterHosts.has(scope))
      || values.some(localCall) || aliasedValues(aliasInit, root, new Set()).some(localCall)
      || (isMemberAccessNode(target) && !censusSlotWritten(programNode, aliasInit, target)
        && chainSlotValues(aliasInit, target, heldState, WRITTEN_SLOT_VALUES.get(programNode)).values.some(localCall));
    // Identifier reads of one binding share its source array; member paths keep their own answer.
    const key = unwrapRuntimeExpr(receiver)?.type === 'Identifier' ? values : receiver;
    const names = local ? familiesFrom(receiver, null, true, key).names : hasOpaqueIteration ? iteratedFamilies(receiver) : [];
    if (!opaqueReads.size) return names;
    let selected;
    if (candidates) {
      selected = new Set(names);
      for (const name of candidates) selected.add(name);
    }
    return selected ?? names;
  });
  // Constructor rest needs the whole family in each supported flavor. Resolve that obligation
  // before any rewrite so all references to the same constructor use one family entry. a rest over
  // a CONTAINER copies its members into a fresh one no read follows, so what they hold owes the same
  const restNames = new Set();
  const restState = { names: new Set(), roots: new Map(), slots: new Map() };
  for (const source of restSources) stampEscapesFrom(programNode, source, {
    names: restNames,
    state: restState,
    stamps: new Set(),
    containers: new Set(),
    receiverOnly: true,
    strictMembers: true,
    syntheticNames: true,
  });
  // (its own walk state: the receiver walk above marks a name answered without descending into it)
  const copiedState = { names: new Set(), roots: new Map(), slots: new Map() };
  for (const { pattern, rhs, from } of restValues) {
    for (const source of aliasedValues(aliasInit, rhs, new Set())) {
      for (const value of restCopiedValues(source, pattern, from)) stampEscapesFrom(programNode, value, {
        names: restNames,
        state: copiedState,
        stamps: new Set(),
        containers: new Set(),
        strictMembers: true,
        syntheticNames: true,
      });
    }
  }
  for (const name of restNames) {
    if (hasConstructorEntry(name)) heldInSlot.add(name);
    if (hasConstructorEntry(name, 'global')) globalOnly.add(name);
  }
  // the keys a read may spell: its own, or each name its computed key folds to (`keyNames`); a key that
  // folds to none stays unknown
  function readKeysOf(spelledKey, member) {
    if (spelledKey !== null || !member?.computed) return [spelledKey];
    return keyNames(member.property) ?? [null];
  }
  for (const [receiver, slot, spelledKey, opaqueOnly, guardable, guardsIdentity, member, keepsCallRead] of memberReceivers) {
    const readKeys = readKeysOf(spelledKey, member);
    const readKey = readKeys.length === 1 ? readKeys.at(0) : null;
    // the alias question asks what the root's VALUE names: for a sequence that is its tail
    // (`(0, realm).Map` reads through `realm`); the prefix is the emitters' to place
    const root = peelReceiverSequenceTail(runtimeChainRoot(receiver, receiverRoots));
    for (const key of readKeys) {
      holdUnresolvedReadFamilies({
        receiver, root, readKey: key, guardable, guardsIdentity, keyNamed: readKeys.length === 1, keepsCallRead,
      });
    }
    if (opaqueOnly && !hasOpaqueIteration) continue;
    const selectingRealm = !!getFallbackBranchSlots(peelFallbackReceiver(root))
      && !allProxySelectingInit(root, { adapter: null, injectorState: null, allowEffectfulTest: true })
      && typeof readKey === 'string' && hasOwnStaticDefinition(escapeStampedName(receiver), readKey);
    if (!selectingRealm) {
      const reached = new Set();
      // An opaque iteration can leave a static read on the substituted constructor. Only that
      // static's family is held; an intrinsic property or an unused head needs no namespace.
      for (const name of hasOpaqueIteration && (readKey === null || hasStaticDefinitionKey(readKey)) ? iteratedFamilies(receiver) : []) {
        if (readKey === null) {
          globalOnly.add(name);
          heldInSlot.add(name);
        } else if (hasOwnStaticDefinition(name, readKey)) {
          heldInSlot.add(name);
        }
      }
      if (opaqueOnly) continue;
      chainRootValues(aliasInit, root, reached, heldState.roots);
      if ([...reached].every(name => !guardedAliases.has(name))) continue;
    }
    if (slot) heldInSlot.add(escapeStampedName(slot));
    else kept.add(receiver);
  }
}

// the walk state one file's stamps share, minted on first use (why it is shared, and why it keys by
// NAME, is the note at the call site)
function escapeWalkStateFor(stamps) {
  let state = ESCAPE_WALK_STATE.get(stamps);
  if (!state) ESCAPE_WALK_STATE.set(stamps, state = { names: new Set(), roots: new Map(), slots: new Map() });
  return state;
}

// Stamp every constructor reference a value hands out, following its alias hops. Both reducers
// enter here after the walk, so the completed graph answers the same whichever runs first.
// eslint-disable-next-line max-statements -- one worklist owns alias, member and container expansion
function stampEscapesFrom(programNode, node, sideChannel = null) {
  const stamps = sideChannel?.stamps ?? ESCAPED_CTOR_REFS.get(programNode);
  if (!stamps) return;
  // the name half of the same stamp: every position recorded below contributes the name it spells,
  // so the entry a constructor resolves to is decided once per FILE instead of once per reference.
  // a SIDE CHANNEL takes a walk's names and memo somewhere else, for a caller answering one flavor
  // alone. Position stamps stay shared unless the caller only needs container mutation facts.
  const ctorNames = sideChannel?.names ?? ESCAPED_CTOR_NAMES.get(programNode);
  // a side channel answers ONE flavor and carries no additional global-only half: only proven
  // realm values enter its own set
  const globalOnlyNames = sideChannel ? null : GLOBAL_ONLY_CTOR_NAMES.get(programNode);
  const aliases = CTOR_ALIAS_INITS.get(programNode);
  // the walk feeds its own output back into the same generator, and that generator SYNTHESIZES the
  // member a destructure slot pairs with - a fresh node every pass, which identity dedup can never
  // fold. So the state is keyed by what a read NAMES (the root's position plus the key path) and it
  // is shared across every escape of one file: without sharing, one root is re-derived per slot,
  // which a minified bundle turns into hours
  const state = sideChannel?.state ?? escapeWalkStateFor(stamps);
  const written = WRITTEN_SLOT_VALUES.get(programNode);
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
    // Iteration provenance is a source expression too, including a call returning the iterable.
    // Unwrap it before the ordinary call/alias dispatch so both paths follow the same returns.
    const pending = work.pop();
    const popped = peelPassthroughCalls(pending?.opaqueSource ?? pending, passthrough);
    const stands = callCallees?.get(unwrapRuntimeExpr(popped));
    let leaf;
    if (stands) pushCalleeReturns(work, expanded, stands, sideChannel, unwrapRuntimeExpr(popped));
    else leaf = stampEscapingLeaves(popped, stamps, work, sideChannel?.receiverOnly, sideChannel?.ownStatics);
    if (!leaf) continue;
    if (!isMemberAccessNode(leaf)) {
      const names = sideChannel?.containers ?? ESCAPED_CONTAINER_NAMES.get(programNode);
      const classifyRealm = REALM_CTOR_REFS.get(programNode);
      const { name } = leaf;
      // the CONTAINER half indexes what this FILE bound, so every leaf counts there. the ctor half
      // answers for the value the REALM holds under that name, and a leaf resolving to a binding of
      // this file's own is not it - a shadow hands out the local, whatever the spelling suggests
      names?.add(name);
      // the walk resolves the name in the leaf's OWN scope chain: two scopes may hold one name, and
      // an answer taken by spelling alone stands for whichever leaf arrived first
      const scopes = aliasReferenceScopes(aliases, leaf);
      // a MAYBE leaf is a binding this census cannot enumerate - unless it can: a slot with a value
      // the file itself spells (a parameter DEFAULT, a for-x head over a literal list) is one the
      // pure pass substitutes its minted binding into, so what escapes there IS that binding and the
      // family is owed. with no such value the binding holds whatever a caller supplies, which the
      // minted binding never is - only the flavor patching the one global slot is owed then
      // Opaque provenance is not such a value: following its source below discovers any actual
      // substituted constructor without mistaking the head's own spelling for it.
      const realm = classifyRealm ? classifyRealm(leaf) : 'proven';
      const substituted = realm === 'maybe' && aliasEntriesInScope(aliases?.get(name) ?? [], scopes)
        .some(({ value }) => !value?.opaqueSource);
      if (realm === 'proven' || substituted) ctorNames.add(name);
      else if (realm === 'maybe') globalOnlyNames?.add(name);
      const bindingKey = aliasBindingKey(aliases, name, scopes);
      if (state.names.has(bindingKey)) continue;
      state.names.add(bindingKey);
      const slots = new Set();
      work.push(...storedValues(aliases, name, new Set(), slots, scopes));
      // A whole-container escape exposes its later slot writes as well as its initializer - the
      // ones spelled through any name of its alias class (`shareAliasWrites`) too. Following them
      // here keeps a local alias or wrapper from becoming an escape by itself. the index is by
      // NAME, so one name's writes join the walk once, however many of its bindings the walk reaches
      for (const alias of aliasWriteNames(written, bindingKey, name)) {
        const writes = written?.get(alias);
        if (!writes || state.writes?.has(writes)) continue;
        (state.writes ??= new Set()).add(writes);
        for (const values of writes.values()) work.push(...values);
      }
      for (const slot of slots) {
        const slotKey = nodePositionKey(slot);
        if (slotKey !== null) stamps.add(slotKey);
        const slotName = escapeStampedName(slot);
        if (slotName !== null) ctorNames.add(slotName);
      }
    } else {
      // a chain is followed by what it NAMES, not by node identity: two reads of the same slot are one
      // question, and the synthesized read a destructure slot pairs with is a new node each pass
      const chain = leaf,
            answer = chainSlotValues(aliases, chain, state,
              sideChannel?.strictMembers ? ALIAS_SCOPE_FACTS.get(aliases)?.receiverWrites : written, null, !!sideChannel?.strictMembers);
      if (answer.expanded) continue;
      answer.expanded = true;
      const { outside, values } = answer;
      // ... and a read with a receiver outside the containers this file can index hands out a
      // value written outside it - the proxy-global surface above all (`globalThis.Map`, and the same object
      // reached through an alias, an IIFE, a container slot or a proxy hop). the escaping
      // reference is then the MEMBER itself, which is where the claim stands.
      // a SYNTHESIZED read (the member a destructure slot pairs with) borrows its receiver's span,
      // so its position names the RECEIVER - a reference that may well stand in a tracked position,
      // and stamping it would move the escape onto that node
      const key = nodePositionKey(chain);
      // A retained pure binding must cover its outside alternative too: a guarded union of a
      // custom namespace and the realm can still yield the realm's constructor. Global usage has
      // no minted guard result and keeps the ordinary escape answer for a locally replaced slot.
      let namedRealm = !sideChannel?.strictMembers;
      if (!namedRealm && outside) {
        const { root, keys } = memberChainKeys(chain, staticMemberKeyName);
        namedRealm = keys.slice(0, -1).every(part => POSSIBLE_GLOBAL_OBJECTS.has(part))
          && chainRootValues(aliases, root, new Set(), state.roots).some(value => value?.type === 'Identifier'
            && POSSIBLE_GLOBAL_OBJECTS.has(value.name) && REALM_CTOR_REFS.get(programNode)?.(value) === 'proven');
      }
      if (namedRealm && outside && (sideChannel?.syntheticNames || key !== null && key !== nodePositionKey(chain.object))) {
        // Candidate-only receiver queries also name synthesized pattern reads. Their
        // borrowed span must never turn into a position stamp on the outer source.
        if (key !== null && key !== nodePositionKey(chain.object)) stamps.add(key);
        const chainName = escapeStampedName(chain);
        if (chainName !== null) ctorNames.add(chainName);
      }
      work.push(...values);
    }
  }
  if (work.length) censusTruncations++;
}

// a name's entries keyed by the scope that binds them, beside the ones bound elsewhere, each list
// in recording order. the census APPENDS entries while it records and asks only afterwards, so the
// index is rebuilt exactly when the array grew. it is what keeps the two asks below linear in the
// scope chain: a file whose functions all spell a local alike records one entry per function under
// that name, and a per-entry scan of the chain made every read of it walk every namesake
const ENTRY_OWNERS = new WeakMap();
function entryOwnerIndex(entries) {
  let index = ENTRY_OWNERS.get(entries);
  if (index?.length === entries.length) return index;
  const byOwner = new Map();
  const unowned = [];
  entries.forEach((entry, ordinal) => {
    // A write resolves only after the walk has collected every declaration, including hoisted
    // and valueless ones. Its target's evaluation region can differ from the surrounding body.
    const scopes = entry.target && aliasReferenceScopes(entry.aliases, entry.target);
    const at = scopes ? ALIAS_SCOPE_FACTS.get(entry.aliases).declarations.resolve(entry.target.name, scopes) ?? null : entry.at;
    if (at === null) unowned.push([ordinal, entry]);
    else if (byOwner.has(at)) byOwner.get(at).push([ordinal, entry]);
    else byOwner.set(at, [[ordinal, entry]]);
  });
  ENTRY_OWNERS.set(entries, index = { length: entries.length, byOwner, unowned });
  return index;
}

// The innermost recorded owner reached by this scope chain. Parser positions cannot identify
// an owner: a preceding transform may create distinct scopes with missing or copied spans.
function innermostBindingScope(entries, scopes) {
  if (!scopes || !entries) return null;
  const { byOwner } = entryOwnerIndex(entries);
  for (let depth = scopes.length - 1; depth >= 0; depth--) if (byOwner.has(scopes[depth])) return scopes[depth];
  return null;
}

// which of a name's recorded values a reference standing under `scopes` can actually reach: the
// INNERMOST binding of that name the chain reaches owns the name there, so a shadow's values are
// the only ones a leaf inside it sees and the outer binding's are the only ones a leaf outside it
// does. an entry with no known binding scope belongs to whatever resolves it, and a leaf whose
// scope chain this census never recorded rules nothing out -
// both keep every value, which is the widening side the census owes. A recorded chain reaching
// none of the declarations cannot read a namesake in another function. the two lists merge back
// into recording order, the order a plain filter over the entries kept. a caller that resolved the
// binding through the declarations passes it as `owner`: the innermost ENTRY owner is only a proxy
// for it, blind to a shadow that records no value (a parameter), whose entries are none
function aliasEntriesInScope(entries, scopes, owner = innermostBindingScope(entries, scopes)) {
  if (!scopes) return entries;
  const { byOwner, unowned } = entryOwnerIndex(entries);
  const owned = byOwner.get(owner) ?? [];
  const merged = [];
  for (let i = 0, j = 0; i < unowned.length || j < owned.length;) {
    merged.push(j >= owned.length || (i < unowned.length && unowned[i][0] < owned[j][0]) ? unowned[i++][1] : owned[j++][1]);
  }
  return merged;
}

// Defaults and definition-time keys cannot read declarations in their owner's body. A namesake
// parameter keeps the conservative union: these frames do not separate it from body declarations.
function aliasReferenceScopes(aliases, node) {
  const facts = ALIAS_SCOPE_FACTS.get(aliases);
  const scopes = facts?.referenceScopes.get(node) ?? null;
  const owners = facts?.outerEvaluatedOwners.get(node);
  if (!scopes || !owners) return scopes;
  for (const owner of owners) {
    if (owner.params?.some(param => patternBindsName(param, node.name))) return null;
  }
  return scopes.filter(scope => !owners.has(scope));
}

// Unknown scope keeps the broad answer separate from a recorded scope reaching no declaration.
// Stored values, roots, slots and cycle detection must all name the same binding. the binding is the
// one the nearest DECLARATION makes - a parameter records no value, so the entry owners alone name
// no binding for it, and namesake parameters of two functions would share one key
function aliasBindingKey(aliases, name, scopes) {
  if (!scopes) return name;
  const facts = ALIAS_SCOPE_FACTS.get(aliases);
  const owner = facts.declarations?.resolve(name, scopes) ?? innermostBindingScope(aliases?.get(name), scopes);
  return `${ name }\u0000${ scopeId(facts.scopeIds, owner) }`;
}

// every value this file stored into a NAME: the declarator init, a plain-identifier write, and the
// slot a destructure paired the binding with - that last one read by the canonical pattern reader
// against whatever container its source names
// what a NAME stores, held per name for the walk's own hot ask. the answer is a property of the
// binding in the alias graph, and the graph is a per-program record - so the memo hangs off it. the
// `seen` a hit did NOT consult is the approximation this shares with `chainRootValues`, which keys
// its expansion the same way: what a hit replays is only the names the cached expansion itself
// visited, kept as the insertion-ordered TAIL of the set rather than a copy of the whole thing -
// copying it is what made the same memo cost more than it saved when it was tried over the slot
// level. SLOT asks stay uncached because they carry an accumulator
const STORED_VALUES = new WeakMap();
function storedValues(aliases, name, seen, slots = null, scopes = null) {
  if (slots || !aliases) return computeStoredValues(aliases, name, seen, slots, scopes);
  let byName = STORED_VALUES.get(aliases);
  if (!byName) STORED_VALUES.set(aliases, byName = new Map());
  const key = aliasBindingKey(aliases, name, scopes);
  const memo = byName.get(key);
  if (memo) {
    for (const visited of memo.added) seen.add(visited);
    return memo.values;
  }
  const before = seen.size;
  const values = computeStoredValues(aliases, name, seen, null, scopes);
  const added = [];
  let index = 0;
  for (const visited of seen) if (index++ >= before) added.push(visited);
  byName.set(key, { values, added });
  return values;
}

function computeStoredValues(aliases, name, seen, slots, scopes) {
  const out = [];
  // what a source the pairer cannot index expands to (`pairedSources`), once for the value and the
  // slot walk alike: `seen` answers each name once, so a second expansion would read another graph
  const expansions = new Map();
  function expandedSources(value) {
    if (!expansions.has(value)) expansions.set(value, pairedSources(aliases, value, seen));
    return expansions.get(value);
  }
  const ctx = { preservesBody: true, readsThrough: true, pairedSources: expandedSources };
  // the graph is a per-program record: a program this census never walked stores none
  for (const { value: entry } of aliasEntriesInScope(aliases?.get(name) ?? [], scopes)) {
    if (entry.type || entry.opaqueSource) out.push(entry);
    else for (const source of aliasedValues(aliases, entry.source, seen)) {
      if (source.opaqueSource) {
        out.push(source);
        continue;
      }
      // a CLASS source pairs like the two literal shapes - its own statics are the slots a pattern
      // selects, and the pairer reads them through the shared descent. handing the container out
      // WHOLE instead read every constructor under it as escaped, where the member spelling of the
      // very same read (`R.Slot.groupBy`) resolved the slot and stayed narrow
      // The census follows values without consuming their getter bodies or effects.
      out.push(...patternSlotValues(entry.pattern, source, name, ctx));
      // ... a position a spread ahead of it shifts may hold one of the spread's items, which no
      // pairing enumerates, and a default on the name's way down stands beside a source that pairs
      // the slot with nothing: either way the union stays OPEN - a marker names no value, and a read
      // of a member off it has no identity guard to serve it. a source that DOES pair the slot holds
      // that value or, where it comes up undefined, the default - both already listed
      if (patternSlotSpreadShifted(entry.pattern, source, name, ctx) || (patternSlotHasDefault(entry.pattern, name)
        && !patternSlotValues(entry.pattern, source, name, { ...ctx, includeDefaults: false }).length)) {
        out.push({ openSource: source });
      }
      // ... and the slots whose value is a receiver READ report themselves: that read is
      // synthesized over the receiver's span, so the slot is the only node naming the escape
      if (slots) for (const slot of patternReceiverSlotNodes(entry.pattern, source, name, ctx)) slots.add(slot);
    }
  }
  return out;
}

// the containers a pattern pairs against in place of a source the pairer cannot index
// (`patternSlotValues`): each value a forwarding spelling may hand on (`readValues`) and, for an
// INVOCATION of a callee the escape census resolved, the one literal it yields - the reader descends
// both through the same call canon. a slot a parameter fills there holds the argument the filling
// call passes (`filled`: from the slot's node to the argument), never every caller's: a file destructuring
// N calls of one factory pairs N arguments, not N x N. any other value stands for itself, read slot
// by slot; null where the source is all there is
function pairedSources(aliases, source, seen) {
  const callCallees = ALIAS_SCOPE_FACTS.get(aliases)?.callCallees;
  const sources = readValues(aliases, source, seen).map(value => {
    const invocation = invocationNode(value);
    const yielded = invocation && callCallees
      && resolvedCallYieldedContainer(invocation, call => callCallees.get(call), unwrapExpressionChain);
    if (!yielded) return { source: value, filled: null };
    const pairing = yielded.slots.length ? censusCallPairing(yielded.call) : null;
    if (!pairing || pairing.argsUnknown) return { source: yielded.literal, filled: null };
    const argumentsBySlot = new Map();
    for (const [, at, slot] of yielded.slots) {
      const argument = resolveCallArgument(pairing.args, at);
      if (argument) argumentsBySlot.set(slot, argument);
    }
    return { source: yielded.literal, filled: slot => argumentsBySlot.get(slot) };
  });
  return sources.length === 1 && sources[0].source === source ? null : sources;
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
  if (target?.type !== 'Identifier') return target ? [target] : [];
  const scopes = aliasReferenceScopes(aliases, target);
  const key = aliasBindingKey(aliases, target.name, scopes);
  if (seen.has(key)) return [target];
  seen.add(key);
  // The guard census also consumes this set by spelling; keep that observation beside identity.
  seen.add(target.name);
  const stored = storedValues(aliases, target.name, seen, null, scopes);
  return stored.length ? stored.flatMap(value => aliasedValues(aliases, value, seen)) : [target];
}

// ... and what a READER descending through a value position finds there: the alias graph's answer,
// with every spelling that hands another position's value on stepped through as the escape walk
// steps through it - the operands a spelling forwards (`forwardedValuePositions`) and a call that
// hands an argument straight back, which IS that argument (`peelPassthroughCalls`) - so a slot under
// a selection is read in each container the selection may yield. any other call stays itself: what
// it yields is its reader's to follow. walked off a stack in source order: a selection nests, and a
// value passes through such calls, as deeply as generated code chains them
function readValues(aliases, node, seen) {
  const passthrough = ALIAS_SCOPE_FACTS.get(aliases)?.passthrough;
  const out = [];
  const work = [{ position: node }];
  while (work.length) {
    const { position, value } = work.pop();
    if (position !== undefined) {
      for (const held of aliasedValues(aliases, position, seen).toReversed()) work.push({ value: held });
      continue;
    }
    const argument = peelPassthroughCalls(value, passthrough);
    const next = argument === value ? forwardedValuePositions(value) : [argument];
    if (next) for (const forwarded of next.toReversed()) work.push({ position: forwarded });
    else out.push(value);
  }
  return out;
}

// the operand positions a spelling hands its VALUE on from: each arm a selection may yield
// (`selectingValueArms`), a sequence's tail, an assignment's value - with the target a logical one
// may keep - and an awaited operand, what an await of a non-thenable hands on as `invocationNode`
// reads it. null for any other node
function forwardedValuePositions(node) {
  switch (node?.type) {
    case 'ConditionalExpression':
    case 'LogicalExpression': return selectingValueArms(node);
    case 'SequenceExpression': return [node.expressions.at(-1)];
    case 'AssignmentExpression': return node.operator === '||=' || node.operator === '??=' ? [node.left, node.right] : [node.right];
    case 'AwaitExpression': return [node.argument];
  }
  return null;
}

// Reading or writing an accessor uses its own half of the final property descriptor.
// A later data property or spread ends an earlier getter/setter pair.
// Read-only batches may share a caller-owned index; live AST queries leave it uncached.
function objectLiteralSlotMember(container, key, accessor = null, cache = null) {
  let { properties } = container;
  if (cache) {
    let slots = cache.get(container);
    if (!slots) {
      cache.set(container, slots = new Map());
      for (const prop of properties) {
        if (prop.type === 'SpreadElement') {
          slots.clear();
          continue;
        }
        const name = foldedPropertyKeyName(prop);
        let members = slots.get(name);
        if (!members) slots.set(name, members = []);
        // Only the final data member or getter/setter pair can survive redefinition.
        const last = members.at(-1);
        if ((prop.kind !== 'get' && prop.kind !== 'set') || (last?.kind !== 'get' && last?.kind !== 'set')) {
          members.length = 0;
        } else if (last.kind === prop.kind) members.pop();
        else if (members.length === 2) members.shift();
        members.push(prop);
      }
    }
    properties = slots.get(key) ?? [];
  }
  let member = findObjectKeyBeforeSpread(properties, prop => cache || foldedPropertyKeyName(prop) === key);
  if (accessor && member?.kind === (accessor === 'get' ? 'set' : 'get')) {
    const preceding = findObjectKeyBeforeSpread(properties.slice(0, properties.indexOf(member)),
      prop => (cache || foldedPropertyKeyName(prop) === key) && prop.kind !== member.kind);
    member = preceding?.kind === accessor ? preceding : null;
  }
  return member;
}

// the value ONE key reads off a container this census can index - an object or array literal, or a
// class's own statics, the three shapes the container census itself indexes. a key this walk cannot
// fold, or a spread that may redefine the slot, hands back the container WHOLE (every leaf under it
// is reachable through that read, and this census owes the superset); a container that demonstrably
// holds no such slot hands back nothing. off anything ELSE the key reads a MEMBER, not a slot - the
// constructor it may sit on keeps its own entry, and the read resolves where it stands.
// Identity proofs request own data slots: an accessor's return does not establish storage.
function containerSlotValues(container, key, ownDataOnly = false, cache = null) {
  // the container arrives off the alias graph, which carries whatever a slot held - a hole's
  // absent value included, and nothing is the answer for it
  if (!CENSUS_CONTAINER_TYPES.has(container?.type)) return [];
  if (key === null) return [container];
  if (container.type === 'ObjectExpression') {
    const match = objectLiteralSlotMember(container, key, ownDataOnly ? null : 'get', cache);
    if (match) return ownDataOnly && (match.kind === 'get' || match.kind === 'set') ? [] : memberSlotValues(match);
    // ... and a key it does not own may be INHERITED from the prototype a `__proto__:` member installs
    return container.properties.some(prop => prop.type === 'SpreadElement')
      || !ownDataOnly && objectLiteralPrototypeValue(container, true) ? [container] : [];
  }
  if (container.type === 'ArrayExpression') {
    const slot = arrayLiteralSlotValue(container, key);
    if (slot) return [slot];
    return container.elements.some(element => element?.type === 'SpreadElement') ? [container] : [];
  }
  // ... and a class's static, read like a literal's member: an accessor answers what it returns
  const member = classStaticSlotMember(container, key);
  if (!member) return [];
  return ownDataOnly && (member.kind === 'get' || member.kind === 'set') ? [] : memberSlotValues(member);
}

// the value ONE member of such a container HOLDS. babel spells a method as the member node itself, a
// function node, where ESTree keeps that function under `value`: reading only `value` answered a HOLE
// for the babel spelling, and a chain landing on a hole reads as an escape. a member carrying no
// value at all (`static x;`) is the hole this really has
function memberSlotValues(member) {
  // Reading an accessor yields its return values, not the getter function itself.
  if (member.kind === 'get') return calleeReturnValues(member.value ?? member);
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
function rootContainerValues(aliases, root, values, cache) {
  const entry = root?.type === 'Identifier'
    ? cache.get(aliasBindingKey(aliases, root.name, aliasReferenceScopes(aliases, root))) : null;
  if (!entry || entry.values !== values) return censusContainersOf(values);
  entry.containers ??= censusContainersOf(entry.values);
  return entry.containers;
}

// what the local CALLS of one chain level hand the rest of its path (`keys` from `index` on), each
// through its callee's actual returns: `{ values, followed, outside }` - the values read, the calls
// followed, and whether a read went outside the file. Receiver candidates take the slot a callee
// wrote into a returned container for what its literal spelled (`returnedWriteValue`); an escape
// answers through the complete graph, the literal and the write together.
function levelCallReads({ aliases, level, keys, index, state, written, receiverOnly }) {
  const facts = ALIAS_SCOPE_FACTS.get(aliases);
  const reads = { values: [], followed: new Set(), outside: false };
  // the rest of the path read off one value a call hands back, which reads outside where it does
  function readOn(value, rest) {
    const sub = chainSlotValues(aliases, value, state, written, rest, receiverOnly);
    reads.outside ||= sub.outside;
    return sub.values;
  }
  for (const value of facts?.callCallees ? level : []) {
    const call = unwrapRuntimeExpr(value);
    const callee = facts.callCallees.get(call);
    if (!callee || callee.async || callee.generator) continue;
    const replacement = receiverOnly && facts.returnedWriteValue(value, keys[index]);
    if (replacement) {
      reads.followed.add(value);
      reads.values.push(...index + 1 === keys.length ? aliasedValues(aliases, replacement, new Set())
        : readOn(replacement, keys.slice(index + 1)));
      continue;
    }
    const active = state.returnCallees ??= new Set();
    if (active.has(callee) || active.size >= ALIAS_CHAIN_DEPTH) continue;
    active.add(callee);
    reads.followed.add(value);
    for (const returned of calleeReturnValues(callee)) {
      // a slot the callee fills from a parameter holds THIS call's argument, not every caller's
      const slot = callSlotArgument(call, callee, returned, keys.slice(index));
      const rest = slot && keys.slice(index + slot.consumed);
      if (slot) {
        reads.values.push(...rest.length ? readOn(slot.argument, rest) : aliasedValues(aliases, slot.argument, new Set()));
        continue;
      }
      // ... and what the callee returns to EVERY call an escape hands on as ONE read of it, which
      // its walk expands once (`keyPathRead`): the values themselves would be pushed per call
      const shared = readOn(returned, keys.slice(index));
      if (receiverOnly) reads.values.push(...shared);
      else if (shared.length) reads.values.push(keyPathRead(returned, keys.slice(index)));
    }
    active.delete(callee);
  }
  return reads;
}

// the READ of a key path off a value, synthesized as a pattern's receiver slot is (`receiverSlotRead`):
// a walk that follows member chains resolves it through the chain memo, once however often it meets it
function keyPathRead(value, keys) {
  return keys.reduce((object, key) => receiverSlotRead(object, key), value);
}

// the values a member chain READS, through the same hops the resolvers walk to name the very same
// slot: the chain's root resolves to the containers its name holds, each key descends one level, and
// a level holding a local call descends what its callee returns (`levelCallReads`). `reached` is
// every name the descent read a value through
function chainSlotValues(aliases, node, state, written, selectedKeys = null, receiverOnly = false) {
  const { root, keys } = memberChainKeys(node);
  if (selectedKeys) keys.push(...selectedKeys);
  if (!keys.length) return NO_CHAIN_SLOT;
  const seen = new Set();
  // the slot a read NAMES: the root plus the key path. A synthesized member borrows its receiver's
  // span, so its own node is never a stable name for it - this pair is. an IDENTIFIER root is named
  // by its binding, not its position: two reads of one binding are one question, while namesakes
  // in separate functions must keep separate answers. The leading NUL keeps a binding key out
  // of the positions' number space.
  const binding = root?.type === 'Identifier' ? aliasBindingKey(aliases, root.name, aliasReferenceScopes(aliases, root)) : null;
  const rootKey = binding === null ? nodePositionKey(root) : `\u0000${ binding }`;
  const slotKey = rootKey === null ? node : `${ rootKey }${ JSON.stringify(keys) }`;
  const memo = state.slots.get(slotKey);
  if (memo) return memo;
  // Publish before following local returns: recursive calls can revisit the same selection.
  const answer = { expanded: false, outside: false, values: [], reached: seen };
  state.slots.set(slotKey, answer);
  let level = chainRootValues(aliases, root, seen, state.roots);
  // the ROOT level is filtered where its values are already cached - by BINDING. one binding is read
  // through many key paths, and its expansion is the wide one; every level below it is narrow
  // enough to filter as it is built
  let containers = rootContainerValues(aliases, root, level, state.roots);
  // landing nowhere means two different things, and only one of them is an escape. A container of this
  // file that has no such slot was read for a hole or a key past the end, and hands nothing out; a
  // value this census cannot index (`globalThis`, the result of a call no arm follows) is read OUTSIDE
  // the file, which is the escape - at ANY hop and beside whatever else the hop holds, so a selection
  // of the realm and a container still reads the realm. a hop left with nothing to read from counts
  // as outside. `aliasedValues` answers a bare name with the name itself, so neither the root nor the
  // fact of a descent tells the two apart
  let outside = false;
  // the path a write would have been recorded under, followed key by key beside the descent - a
  // name this walk cannot spell, or a key it cannot fold, names no slot for a write to land in
  const path = binding === null ? null : [];
  // ... filed by BINDING in the receiver index, by every name of the binding's alias class in the
  // name index (`aliasWriteNames`)
  const owners = binding === null ? [] : receiverOnly ? [binding] : aliasWriteNames(written, binding, root.name);
  const returnedValues = [];
  for (const [index, key] of keys.entries()) {
    const calls = levelCallReads({ aliases, level, keys, index, state, written, receiverOnly });
    returnedValues.push(...calls.values);
    // ONE pass over the level answers both questions the key asks of it - which values it can
    // descend INTO, and whether one is read outside the file. asked separately, a wide root
    // expansion was walked twice per key, and a level is mostly values no key descends
    outside ||= calls.outside || !level.length || containers.length !== level.length && level.some(value => !calls.followed.has(value)
      && !value.opaqueSource && !value.openSource && !CENSUS_CONTAINER_TYPES.has(value.type) && !PRIMITIVE_LITERAL_TYPES.has(value.type));
    level = [...level.filter(value => value.opaqueSource || value.openSource), ...containers.flatMap(value => [
      ...containerSlotValues(value, key),
      ...receiverOnly ? writtenSlotValues(written, value, JSON.stringify([key])) : [],
      ...receiverOnly ? writtenSlotValues(written, value, '["*"]') : [],
    ].flatMap(slot => readValues(aliases, slot, seen)))];
    if (path !== null && key !== null) {
      path.push(key);
      // the slot's own written values: what the LITERAL spelled is not all a read of it lands on
      const pathKey = JSON.stringify(path);
      level = [...level, ...owners.flatMap(owner => [
        ...writtenSlotValues(written, owner, pathKey),
        ...receiverOnly ? writtenSlotValues(written, owner, '["*"]') : [],
      ]).flatMap(value => readValues(aliases, value, seen))];
    }
    containers = censusContainersOf(level);
  }
  answer.outside = outside;
  answer.values = [...level, ...returnedValues];
  return answer;
}

// Candidate-only counterpart of the returned-slot transfer. The scoped census resolves the
// installed value where it was written; callers keep the original call and its receiver.
// Null means no replacement proof, while an empty set excludes the dead initial constructor.
function returnedContainerWriteCandidates(programNode, call, keys) {
  if (!keys.length) return null;
  const aliases = CTOR_ALIAS_INITS.get(programNode);
  const facts = ALIAS_SCOPE_FACTS.get(aliases);
  const value = facts?.returnedWriteValue(call, keys[0]);
  if (!value) return null;
  const state = { names: new Set(), roots: new Map(), slots: new Map() };
  const values = keys.length === 1 ? [value]
    : chainSlotValues(aliases, value, state, facts.receiverWrites, keys.slice(1), true).values;
  const names = new Set();
  for (const selected of values) stampEscapesFrom(programNode, selected, {
    names, state, stamps: new Set(), containers: new Set(), receiverOnly: true, strictMembers: true,
  });
  return names;
}

// the root of a chain resolves per BINDING, not per slot: a minified bundle reads one container through
// thousands of slots, and re-deriving the root for each turned a 350ms census into minutes. A name
// that stands for itself is not cached - that answer is the absence of one
function chainRootValues(aliases, root, seen, cache) {
  const name = root?.type === 'Identifier' ? root.name : null;
  if (name === null) return readValues(aliases, root, seen);
  const key = aliasBindingKey(aliases, name, aliasReferenceScopes(aliases, root));
  const cached = cache.get(key);
  if (cached) {
    for (const visited of cached.seen) seen.add(visited);
    return cached.values;
  }
  const values = readValues(aliases, root, seen);
  if (values.length !== 1 || values[0] !== root) cache.set(key, { seen: new Set(seen), values });
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
  return (container.body?.body ?? []).some(member => (member === slot || member.value === slot || member.body === slot)
    && (member.type?.startsWith('ClassPrivate') || member.key?.type === 'PrivateName'
      || member.key?.type === 'PrivateIdentifier'));
}

// the return STATEMENTS a block body spells, memoized per BODY node: the escape walk and the
// value census both ask it of the same helpers, and `collectOwnReturns` walks the whole body
const CALLEE_RETURN_STATEMENTS = new WeakMap();
function calleeReturnStatements(callee) {
  const body = callee?.body;
  if (!body || body.type !== 'BlockStatement') return [];
  let returns = CALLEE_RETURN_STATEMENTS.get(body);
  if (!returns) CALLEE_RETURN_STATEMENTS.set(body, returns = collectOwnReturns(body));
  return returns;
}

// the ARGUMENT a call passes for the first slot `keys` reach in a literal its callee returns, where the
// callee fills that slot from a parameter (`calleeYieldedContainer`), with how many keys the slot
// consumed: `{ argument, consumed }`, or null where the keys meet no such slot or the call spells no
// argument for it (a missing one, one behind an opaque spread). the container is the callee's own
// fact, asked once per callee NODE however many calls reach it
const CALLEE_YIELDED_CONTAINERS = new WeakMap();
function callSlotArgument(call, callee, returned, keys) {
  let yielded = CALLEE_YIELDED_CONTAINERS.get(callee);
  if (yielded === undefined) {
    CALLEE_YIELDED_CONTAINERS.set(callee, yielded = calleeYieldedContainer(callee, { unwrap: unwrapExpressionChain }) ?? null);
  }
  if (!yielded || yielded.literal !== unwrapExpressionChain(returned)) return null;
  const hit = yielded.slots.find(([keyPath]) => keyPath.length <= keys.length
    && keyPath.every((key, at) => String(key) === String(keys[at])));
  const pairing = hit && censusCallPairing(call);
  const argument = pairing && !pairing.argsUnknown ? resolveCallArgument(pairing.args, hit[1]) : null;
  return argument ? { argument, consumed: hit[0].length } : null;
}

// what a call hands its caller: the expression an arrow yields, or every return the body spells.
// memoized per callee NODE: the answer is a property of the function, and a walk that reaches the
// same helper twice would otherwise re-walk its whole body for the same list
const CALLEE_RETURN_VALUES = new WeakMap();
function calleeReturnValues(callee) {
  const memo = CALLEE_RETURN_VALUES.get(callee);
  if (memo) return memo;
  const values = callee.body && callee.body.type !== 'BlockStatement' ? [callee.body]
    : calleeReturnStatements(callee).map(ret => ret.argument).filter(Boolean);
  CALLEE_RETURN_VALUES.set(callee, values);
  return values;
}

// does a value the callee returns read one of its parameters, or the arguments object? a parameter
// list this canon cannot name - a slot writing THROUGH a member - reads as one that is read
function returnsReadParameters(callee, referencesArguments) {
  if (referencesArguments) return true;
  const names = collectParamBindingNames(callee.params ?? []);
  return names === null || calleeReturnValues(callee).some(value => [...names].some(name => identifierReferencedInSubtree(value, name)));
}

// the callee arm of the escape walk: a call this census indexed STANDS for what its callee hands
// back, and one callee is reached from many calls - expanding it ONCE per walk is what keeps the
// step ceiling a backstop instead of a running time. the callee is a source node, so identity folds
// it; the synthesized members the walk feeds itself never arrive here. ... except where the callee
// returns a container it fills from CONFINED parameters: the call hands out THIS call's arguments in
// those slots, once per call, and the container's other values once per callee - never the
// parameters themselves, whose stored values are every caller's arguments
function pushCalleeReturns(work, expanded, stands, sideChannel = null, call = null) {
  sideChannel?.callees?.add(stands);
  // Async and generator calls wrap their return values; neither directly yields a namespace.
  if (sideChannel?.receiverOnly && (stands.async || stands.generator)) return;
  // a static receiver query follows no container field, the arguments in those slots included
  const slotted = call && !sideChannel?.receiverOnly && confinedSlotArguments(call, stands);
  if (slotted) {
    work.push(...slotted.args);
    if (expanded.has(stands) || expanded.has(slotted.literal)) return;
    expanded.add(slotted.literal);
    work.push(...slotted.others);
    return;
  }
  if (expanded.has(stands)) return;
  expanded.add(stands);
  work.push(...calleeReturnValues(stands));
}

// the arguments a call passes into the slots its callee's returned container fills from CONFINED
// parameters (`calleeYieldedContainer`), with every other slot the container - and a container
// nested in it - hands out, or null where the proof does not hold for every slot parameter of this
// call (an unconfined one, an argument the pairing cannot place)
function confinedSlotArguments(call, callee) {
  const yielded = calleeYieldedContainer(callee, { unwrap: unwrapRuntimeExpr });
  const pairing = yielded?.slots.every(([, at]) => yielded.confined.has(at)) && censusCallPairing(call);
  if (!pairing || pairing.argsUnknown) return null;
  const args = yielded.slots.map(([, at]) => resolveCallArgument(pairing.args, at));
  if (args.some(argument => !argument)) return null;
  const params = new Set(yielded.slots.map(([, at]) => dropLeadingThisParam(callee.params)[at].name));
  const others = [];
  const containers = [yielded.literal];
  while (containers.length) {
    for (const slot of containerSlotNodes(containers.pop())) {
      const value = unwrapRuntimeExpr(slot);
      if (value?.type === 'ObjectExpression' || value?.type === 'ArrayExpression') containers.push(value);
      else if (!(value?.type === 'Identifier' && params.has(value.name))) others.push(slot);
    }
  }
  return { args, others, literal: yielded.literal };
}

// Return one identifier or member leaf, or enqueue the values a carrier forwards. Identifiers are
// stamped here; members need the caller's slot resolution.
// Every child re-enters the same call/alias dispatch, including calls nested in returned containers
// or class heritage. A step yields at most one leaf, so no per-step collections are needed.
function stampEscapingLeaves(node, stamps, work, receiverOnly = false, ownStatics = false) {
  // a zero-arg IIFE hands out its RETURN value, and the same peel every value canon takes on the
  // way into a container / global resolution puts the escape on the reference the source forwards
  const target = peelIifeReturnTarget(unwrapRuntimeExpr(node));
  if (!target || typeof target !== 'object') return;
  // a CONTAINER forwards every slot it holds, and WHICH shapes are containers is this census's own
  // answer everywhere else: a hand-listed literal pair here left a class - a container to the keyed
  // read, to the write census and to the container index alike - handing out nothing at all
  if (CENSUS_CONTAINER_TYPES.has(target.type)) {
    // A subclass exposes its base statics too. Queue the base first so the stack still visits
    // member values in source order before heritage.
    // ... unless the walk asks what a WRITE lands on: a write on a subclass shadows the base
    if (CLASS_NODE_TYPES.has(target.type) && !ownStatics) work.push(target.superClass);
    // A static receiver query observes the value and its base, not namespaces stored in fields.
    if (receiverOnly) return;
    for (const slot of containerSlotNodes(target).toReversed()) {
      // a PRIVATE member is not a slot the receiver can read: handing the class out hands out
      // everything but that one, and counting it made an unreachable value owe its family
      if (!isPrivateClassSlot(target, slot)) work.push(slot);
    }
    return;
  }
  // a FUNCTION handed out hands its RETURNS on with it: whoever holds it calls it and reads what
  // comes back. reached here rather than assumed at the definition, so a function that leaves
  // nowhere owes nothing. Multiple return paths do not make the definition an escape: a call
  // consumed locally still keeps its returned namespace local.
  if (FUNCTION_LIKE_NODE_TYPES.has(target.type)) {
    if (!receiverOnly) work.push(...calleeReturnValues(target).toReversed());
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
      return target;
    }
    // a value spelled as a container READ hands out whatever the slot holds, and the reference
    // sits wherever the container was written - recorded as a CHAIN here and followed once the
    // whole file has been walked, exactly like a bare alias name
    case 'MemberExpression':
    case 'OptionalMemberExpression': return target;
    case 'SpreadElement': work.push(target.argument); return;
  }
  const positions = forwardedValuePositions(target);
  if (positions) work.push(...positions.toReversed());
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

// how many values one computed key may fold to before the census stops listing them (`censusKeyNames`),
// and the name a well-known symbol key stands for there: a slot no static is spelled as
const MAX_KEY_VALUES = 16;
const WELL_KNOWN_SYMBOL_KEY = '@@symbol';

// Per-file constructor escapes, resolved after every declaration and alias source is recorded.
// eslint-disable-next-line max-statements -- the escape census factory: one closure per fact table it publishes
export function escapedCtorReferencesReducer() {
  let stamps = null;
  let programNode = null;
  // the NAMES half of the census, handed to the file census so the entry decision reads it without
  // holding the program: this set outlives the walk, the AST must not
  const ctorNames = new Set();
  const globalOnly = new Set();
  const heldInSlot = new Set();
  // the value POSITIONS that hand a reference out, collected during the walk and stamped from
  // `result` - only there is the alias graph complete
  const escaped = new Set();
  const jsxEscaped = [];
  const aliasInit = new Map();
  const written = new Map();
  const unrootedKeys = new Set();
  // Bare reads keep written values observable in pure output, including through local wrappers.
  // Whether the container actually leaves is answered by the escape walk, which follows its writes.
  const readsBare = new Set();
  // ... and the reads themselves: the name-keyed sets above widen, which every escape consumer
  // wants, while the member-callee route asks whether THIS binding is read or written - answered
  // once per name and owner from these nodes (`openedBindings`)
  const bareReadRefs = [];
  const writtenOwnerRefs = [];
  const unreadableOwnerRefs = [];
  // ... and the names read THROUGH a key, which is what makes a written slot observable at all: the
  // receiver a write replaces is no read of one, so a container written and never looked at again
  // hands its value to nobody, on either flavor
  const readsThrough = new Set();
  const memberObjects = new WeakSet();
  // A conditional or replaced alias can yield a constructor through an identity guard. The
  // outer member then reads the yielded value directly, so that constructor carries its family.
  // Record the source receivers before either binding rewrites them; the existing escape walk
  // below supplies the per-name obligation together with the other retained container values.
  const guardedAliases = new Set();
  const memberReceivers = [];
  const restSources = [];
  const restValues = [];
  let hasOpaqueIteration = false;
  const writeTargetRoots = new WeakSet();
  const localCallables = new Map();
  const writtenCallOwners = new Set();
  const unreadableCallOwners = new Set();
  const exportedCallableNames = new Set();
  // Count declarations by name AND owner: a namesake in another scope cannot open this caller set.
  const bindingCounts = new Map();
  const nonCalleeNameUses = new Set();
  // the function-likes whose parameters wait for the whole-walk verdict below
  const parameterHosts = [];
  const closedParameterHosts = new WeakSet();
  // the functions that bind a `this` some expression reads: a receiver an invoker hands one of them
  // reaches whatever it does with that `this`
  const thisReaders = new WeakSet();
  const passthrough = new Map();
  const callCallees = new WeakMap();
  const callNodes = [];
  const unreadCallResults = new WeakSet();
  const installedTargetRefs = new Set();
  // every call of the file as the invocation canon reads it, minted once the walk is over: the
  // pairing asks the census's own binding facts, and those are whole only then
  const pairings = new WeakMap();
  const returnedWriteSummaries = new WeakMap();
  const returnedWriteValues = new WeakMap();
  const literalSlotMembers = new WeakMap();
  const setterStoreHosts = new Set();
  const ignoredWriteValues = new WeakSet();
  // the identifier references whose callee-or-not verdict waits for those pairings
  const nameUses = [];
  const memberUses = [];
  const callablePropertyWrites = new Map();
  const callablePropertyScopes = new WeakMap();
  let assignedMemberReads;
  let programStatements;
  // the container reads through a key this census cannot fold, decided against the finished alias graph
  const opaqueReads = new Map();
  // the `in` tests by a key the walk cannot fold, each as the member read of that key
  const presenceTests = [];
  const memberReaders = new WeakMap();
  const argumentsHosts = new WeakSet();
  const argumentsReferenceCache = new WeakMap();
  const knownCtorCandidateCache = new WeakMap();
  const builtinCallees = new WeakMap();
  const boundCalls = new WeakMap();
  const invokedReceivers = new WeakSet();
  const builtinAliases = new Map();
  const builtinArguments = new Set();
  // Name a builtin through the census's scoped aliases. Explicit property stores need its
  // namespace and method; other builtin arguments still create no family obligation.
  // A local namesake or an unknown receiver is no proof.
  function builtinCallee(raw, trailing = [], depth = 0) {
    if (depth > ALIAS_CHAIN_DEPTH) return false;
    // a pure import is the builtin its entry names, as the scoped stage reads it: a prior pass mints
    // `_Reflect$set` where the source spelled `Reflect.set`
    const minted = !trailing.length && mutatorPairFromEntry(pureEntryOfCallee(peelCalleeValue(raw)));
    if (minted) return minted;
    const { root, keys } = memberChainKeys(peelCalleeValue(raw), member => member.computed
      ? computedKeyStaticName(member.property) : memberKeyName(member));
    keys.push(...trailing);
    if (!root || keys.includes(null)) return false;
    if (root.type === 'Identifier') {
      if (writtenCallOwners.has(root.name)) return false;
      if (aliasInit.has(root.name)) {
        const cacheKey = `${ aliasBindingKey(aliasInit, root.name, aliasReferenceScopes(aliasInit, root)) }${ JSON.stringify(keys) }`;
        if (builtinAliases.has(cacheKey)) return builtinAliases.get(cacheKey);
        const values = aliasedValues(aliasInit, root, new Set());
        if (values.length !== 1 || values[0] !== root) {
          builtinAliases.set(cacheKey, false);
          let known = null;
          // Stop at the first unknown alternative; later cyclic aliases need no expansion.
          const allKnown = classifyRealmReference(root) !== 'maybe' && values.every(value => {
            const candidate = builtinCallee(value, keys, depth + 1);
            if (!candidate) return false;
            known = !known || known.namespace === candidate.namespace && known.method === candidate.method
              ? candidate : { namespace: null, method: null };
            return true;
          });
          if (!allKnown) known = null;
          builtinAliases.set(cacheKey, known);
          return known;
        }
      }
      if (classifyRealmReference(root) !== 'proven' || !isKnownGlobalName(root.name)) return false;
      // A proxy's first non-proxy key must name a builtin, not an arbitrary user global.
      let { name } = root;
      while (POSSIBLE_GLOBAL_OBJECTS.has(name) && keys.length) name = keys.shift();
      return isKnownGlobalName(name) ? { namespace: name, method: keys.length === 1 ? keys[0] : null } : null;
    }
    if (!keys.length) return false;
    if (root.type === 'NewExpression' && builtinCallee(root.callee, [], depth + 1)) return { namespace: null, method: null };
    if (FUNCTION_LIKE_NODE_TYPES.has(root.type)) {
      return keys.length === 1 ? { namespace: null, method: null } : null;
    }
    if (keys.length !== 1) return false;
    const owner = root.type === 'ArrayExpression' ? 'Array'
      : root.type === 'StringLiteral' || root.type === 'TemplateLiteral'
        || root.type === 'Literal' && typeof root.value === 'string' ? 'String' : null;
    return owner !== null && Object.hasOwn(knownBuiltInReturnTypes.instanceMethods[owner], keys[0])
      ? { namespace: null, method: null } : null;
  }
  function referencesArguments(callee) {
    if (!argumentsReferenceCache.has(callee)) {
      argumentsReferenceCache.set(callee, argumentsHosts.has(callee) && referencesArgumentsObject(callee));
    }
    return argumentsReferenceCache.get(callee);
  }
  // Parameter accountability only changes constructor-family coverage when the value can reach a
  // known global spelling. Large modules contain many ordinary calls; proving their arguments inert
  // here avoids walking every callee body while keeping the uncertain cases on the conservative path.
  function carriesKnownCtor(raw, activeNames = new Set()) {
    const node = unwrapRuntimeExpr(raw);
    if (!isASTNode(node)) return false;
    if (knownCtorCandidateCache.has(node)) return knownCtorCandidateCache.get(node);
    knownCtorCandidateCache.set(node, false);
    let carries = node.type === 'Identifier' && isKnownGlobalName(node.name);
    if (!carries && isMemberAccessNode(node)) carries = isKnownGlobalName(escapeStampedName(node));
    if (!carries && node.type === 'Identifier' && !activeNames.has(node.name)) {
      activeNames.add(node.name);
      for (const { value } of aliasInit.get(node.name) ?? []) {
        if (carriesKnownCtor(value?.type ? value : value?.opaqueSource ?? value?.source, activeNames)) {
          carries = true;
          break;
        }
      }
      activeNames.delete(node.name);
    }
    if (!carries) walkAstChildren(node, child => {
      carries ||= carriesKnownCtor(child, activeNames);
    });
    knownCtorCandidateCache.set(node, carries);
    return carries;
  }
  // the member-slot writes this file spells, recorded as the walk sees them and published under the
  // program straight away: both reducers stamp from a finished walk, and only a record that is
  // already whole answers the same to whichever of them runs first
  const slotWrites = [];
  // The declarations and reference scopes distinguish the realm's value from a local binding.
  // Alias and callee resolution also read these scopes, so ordinary local names must be recorded.
  const declarations = createDeclaredNameIndex();
  // ... and the half of them whose VALUES this census cannot enumerate. a parameter holds whatever
  // the CALLER passed, a catch parameter whatever was thrown, an import local whatever the other
  // module exports, a for-x head binding whatever the iteration yielded: the alias graph cannot
  // enumerate their exact values, so a leaf spelling one is no proof the realm's constructor stayed home -
  // `function f({ Map } = globalThis) { return Map }` hands the realm's value straight out through
  // a parameter. every OTHER binding is accountable, and accountable without a second walk: the
  // graph either holds the values it took - and the escape walk reaches whatever they name on its
  // own, stamping it where it stands - or the binding is a declaration whose value is the function
  // or class itself, which no realm constructor can be
  const unaccountableDeclarations = createDeclaredNameIndex();
  // ... and the enum blocks among the declarations, by name, each with the scope its name binds in: a
  // member read off one is a key its literal initializer spells (`censusKeyValues`)
  const enumBlocks = new Map();
  const referenceScopes = new WeakMap();
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
  const outerEvaluatedOwners = new WeakMap();
  function recordOuterEvaluatedRegion(node) {
    const hasParams = FUNCTION_LIKE_NODE_TYPES.has(node.type);
    const hasDefinitionSlots = node.decorators?.length || node.superClass || node.computed === true;
    if (!hasParams && !hasDefinitionSlots) return;
    const roots = hasParams ? [...node.params ?? []] : [];
    // the property gate the path-side climb uses: only a node HOLDING one of those slots can answer
    // the canon predicate, and the read is what keeps the walk off it on every other node
    if (hasDefinitionSlots) {
      walkAstChildren(node, child => {
        if (definitionTimeSlotOf(node, child)) roots.push(child);
      });
    }
    while (roots.length) {
      const current = roots.pop();
      if (typeof current?.type !== 'string') continue;
      // every owner, not the outermost alone: a computed key written inside a parameter default
      // stands outside two scopes at once, and trimming one of them leaves the other shadowing
      if (current.type === 'Identifier') {
        let owners = outerEvaluatedOwners.get(current);
        if (!owners) outerEvaluatedOwners.set(current, owners = new Set());
        owners.add(node);
      }
      walkAstChildren(current, child => roots.push(child));
    }
  }
  // the pure ENTRY a callee position is bound to, through the alias hops this census recorded: a
  // program-root default import or require of a pure entry, in its own scope chain so a local
  // namesake answers nothing, and the interop wrapper's default slot module lowering leaves
  // (`invoke.default` over `_interopRequireDefault(require(...))`). the alias walk answers a bare
  // name with the name itself, so an import local arrives here as its own leaf
  function pureEntryOfCallee(callee) {
    const bare = peelToBareExpr(callee);
    if (isMemberAccessNode(bare) && memberKeyName(bare) === 'default') {
      const object = unwrapRuntimeExpr(bare.object);
      if (object?.type !== 'Identifier') return null;
      const values = aliasedValues(aliasInit, object, new Set());
      const entries = new Set(values.map(value => pureImportSourceEntry(inlineInteropCallSource(value))));
      return values.length && entries.size === 1 && !entries.has(null) ? [...entries][0] : null;
    }
    if (bare?.type !== 'Identifier') return null;
    // the leaf an import local resolves to is itself; a require binding resolves to its call
    const entries = new Set(aliasedValues(aliasInit, bare, new Set()).map(leaf => {
      if (leaf?.type !== 'Identifier') return pureImportSourceEntry(requireCallSource(leaf));
      const scopes = aliasReferenceScopes(aliasInit, leaf) ?? referenceScopes.get(leaf) ?? [];
      const owner = declarations.resolve(leaf.name, scopes);
      return owner === programNode || owner === null ? pureImportEntryOfProgram(programNode, leaf.name) : null;
    }));
    return entries.size === 1 && !entries.has(null) ? [...entries][0] : null;
  }
  // A single private function-property forwarder overrides even call/apply/bind.
  // Admit only one unconditional program-level install and one direct invocation;
  // other reads, writes or handouts keep the ordinary conservative invocation view.
  function assignedPropertyForwarder(node, callee) {
    if (!isMemberAccessNode(callee)) return null;
    const owner = unwrapRuntimeExpr(callee.object);
    const writes = owner?.type === 'Identifier' && callablePropertyWrites.get(owner.name);
    if (!writes || readsBare.has(owner.name) || exportedCallableNames.has(owner.name)
      || referenceScopes.get(node)?.some(scope => FUNCTION_LIKE_NODE_TYPES.has(scope.type))) return null;
    const scopes = referenceScopes.get(owner) ?? [];
    const binding = declarations.resolve(owner.name, scopes);
    let grouped = callablePropertyScopes.get(writes);
    if (!grouped) {
      callablePropertyScopes.set(writes, grouped = new Map());
      for (const write of writes) {
        const scope = declarations.resolve(owner.name, write.scopes);
        let entries = grouped.get(scope);
        if (!entries) grouped.set(scope, entries = []);
        entries.push(write);
      }
    }
    const own = grouped.get(binding);
    if (own?.length !== 1) return null;
    const [write] = own;
    const key = memberKeyName(callee);
    const fn = unwrapRuntimeExpr(write.value);
    if (key === null || memberKeyName(write.target) !== key || unwrapRuntimeExpr(write.target.object)?.type !== 'Identifier'
      || !FUNCTION_LIKE_NODE_TYPES.has(fn?.type) || fn.params.some(param => param.type !== 'Identifier')) return null;
    const returned = singleReturnBodyExpression(fn.body);
    const index = returned?.type === 'Identifier' ? fn.params.findIndex(param => param.name === returned.name) : -1;
    if (index < 0 || !paramReturnsTheValue(fn, index, referencesArguments(fn))) return null;
    const original = localCallableOf(owner.name, scopes, localCallables, { declarations });
    if (!FUNCTION_LIKE_NODE_TYPES.has(original?.type)) return null;
    const roots = RECORDED_MUTATION_ROOTS.get(programNode);
    if (!roots || roots.open || roots.names.has('Function') || roots.globalSlots.has('Function')) return null;
    programStatements ??= new Set(programNode.body);
    if (!programStatements.has(write.statement) || !(write.target.end < node.start)) return null;
    if (!assignedMemberReads) {
      assignedMemberReads = new Map();
      for (const member of memberUses) {
        const root = unwrapRuntimeExpr(member.object);
        if (root?.type !== 'Identifier' || !callablePropertyWrites.has(root.name) || writeTargetRoots.has(root)) continue;
        const bound = aliasBindingKey(aliasInit, root.name, referenceScopes.get(root));
        let reads = assignedMemberReads.get(bound);
        if (!reads) assignedMemberReads.set(bound, reads = []);
        reads.push(member);
      }
    }
    const reads = assignedMemberReads.get(aliasBindingKey(aliasInit, owner.name, scopes));
    return reads?.length === 1 && reads[0] === callee ? fn : null;
  }

  // a call as the invocation canon reads it, minted once and after the walk: the three questions
  // the canon asks are answered from this census's own facts - a name is shadowed where a
  // declaration of this file reaches the reference, a static is mutated where its owner had a
  // member written, and a callee's entry is the pure import its alias chain lands on
  function invocationOf(node) {
    let pairing = pairings.get(node);
    if (pairing === undefined) {
      const callee = peelToBareExpr(node.callee);
      const root = isMemberAccessNode(callee) ? peelToBareExpr(callee.object) : null;
      const assigned = assignedPropertyForwarder(node, callee);
      pairing = callPairing(assigned ? { ...node, callee: assigned } : node, programNode, {
        nameIsShadowed: name => root?.type === 'Identifier' && root.name === name
          && declarations.declares(name, referenceScopes.get(root) ?? []),
        staticIsMutated: owner => writtenCallOwners.has(owner.split('.', 1)[0]),
        getCalleeEntry: pureEntryOfCallee,
      });
      // Census consumers pair a complete value list, not raw argument paths. Expand known
      // literal spreads once here; an opaque spread keeps the existing positional bail.
      if (!pairing.argsUnknown && pairing.args.some(argument => argument?.type === 'SpreadElement')) {
        const args = positionalElements(pairing.args);
        if (args) pairing = { ...pairing, args };
      }
      pairings.set(node, pairing);
      CENSUS_PAIRINGS.set(node, pairing);
    }
    return pairing;
  }

  // the builtin a resolved call invokes and the arguments paired to it; null for a call standing on a
  // function of this file, an unknown callee, or an argument list the canon cannot decide
  function callBuiltin(node) {
    const builtin = builtinCallees.get(node);
    const pairing = builtin && invocationOf(node);
    return pairing && !pairing.argsUnknown ? { ...builtin, args: pairing.args } : null;
  }

  // A definite store must use the pristine mutator and effect-free arguments. Reuse its
  // installed-value decoder; Reflect's separate target must be fresh and empty here.
  function definiteCallWrites(node) {
    const store = callBuiltin(node);
    if (!store || spineHasOptionalHop(node)
      || mayHaveSideEffects(node.callee) || node.arguments.some(mayHaveSideEffects)) return null;
    const { namespace, method, args } = store;
    if (method === 'set' && args.length >= 4) {
      const target = unwrapRuntimeExpr(args[0]);
      if (target?.type !== 'ObjectExpression' || target.properties.length) return null;
    }
    const entries = mutatorInstalledValues(namespace, method, args, true);
    // The empty target still inherits Object.prototype's legacy __proto__ setter.
    return entries.length && entries.every(entry => entry.key !== null && entry.value
      && !(namespace === 'Reflect' && method === 'set' && args.length >= 4 && entry.key === '__proto__'))
      ? entries.map(entry => ({ ...entry, namespace, setsValue: method === 'set' || method === 'assign',
        invoked: invocationOf(node).callee !== peelToBareExpr(node.callee),
        prototypeTarget: namespace === 'Reflect' && method === 'set' && args.length >= 4 })) : null;
  }

  // The same ordered parameter-write summary serves replacement and ignored-setter proofs.
  function returnedWriteSummary(callee) {
    let summary = returnedWriteSummaries.get(callee);
    if (summary === undefined) {
      summary = null;
      const returned = unwrapRuntimeExpr(callee.body?.body?.at(-1)?.argument);
      const params = dropLeadingThisParam(callee.params ?? []);
      const index = returned?.type === 'Identifier' ? params.findIndex(param => param.name === returned.name) : -1;
      if (index >= 0) {
        const uses = parameterMemberUses(callee, index, referencesArguments(callee), false, true, {
          callWrites: definiteCallWrites,
          aliasDeclaration: declaration => {
            return declaration.kind === 'const' && declaration.declarations.every(item => {
              const known = builtinCallee(item.init);
              return item.id.type === 'Identifier' && params.every(param => param.name !== item.id.name)
                && !mayHaveSideEffects(item.init) && known && hasOwnStaticDefinition(known.namespace, known.method);
            });
          },
        });
        if (uses?.writes.length) summary = { index, writes: uses.writes,
          mutators: new Set(uses.writes.flatMap(write => write.namespace
            ? [write.namespace, ...write.prototypeTarget ? ['Object'] : [],
              ...write.invoked ? ['Reflect', 'Function'] : []] : [])) };
      }
      returnedWriteSummaries.set(callee, summary);
    }
    if (!summary) return null;
    const roots = RECORDED_MUTATION_ROOTS.get(programNode);
    return summary.mutators.size && (!roots || roots.open
      || [...summary.mutators].some(name => roots.names.has(name) || roots.globalSlots.has(name))) ? null : summary;
  }

  // Only receiver candidates use this transfer: the call and its writes remain in the
  // source, and constructor escapes still use the complete graph. Summaries are per callee;
  // fresh argument slots are checked per call so frozen/aliased targets cannot inherit proof.
  function returnedWriteValue(rawCall, key) {
    if (key === null) return null;
    const call = unwrapRuntimeExpr(rawCall);
    const callee = callCallees.get(call);
    if (!callee || call.type !== 'CallExpression' || spineHasOptionalHop(call)) return null;
    const cached = returnedWriteValues.get(call);
    if (cached) return cached.get(key) ?? null;
    const summary = returnedWriteSummary(callee);
    if (!summary) return null;
    const pairing = invocationOf(call);
    if (pairing.argsUnknown) return null;
    // Reuse the completed mutation census, including writes through realm/namespace aliases.
    // An escape-only census can keep candidates, but cannot certify a pristine mutator.
    const roots = RECORDED_MUTATION_ROOTS.get(programNode);
    if (pairing.callee !== peelToBareExpr(call.callee) && (!roots || roots.open
      || writtenCallOwners.has(pairing.callee?.name)
      || ['Reflect', 'Function', pairing.callee?.name].some(name => roots.names.has(name) || roots.globalSlots.has(name)))) return null;
    returnedWriteValues.set(call, new Map());
    const source = peelReceiverSequenceTail(pairing.args[summary.index]);
    if ((source?.type !== 'ObjectExpression' && source?.type !== 'ArrayExpression')
      || literalHasUnnameableSlot(source)) return null;
    const values = new Map();
    for (const write of summary.writes) {
      if (containerSlotValues(source, write.key, true, literalSlotMembers).length !== 1) return null;
      values.set(write.key, write.value);
    }
    returnedWriteValues.set(call, values);
    return values.get(key) ?? null;
  }
  // the scope facts every callee resolution after the walk reads, ONE bag built on the first ask:
  // the accountability decision below is answered once, so both of its readers must resolve names
  // through the same facts - a reader resolving on names alone lets a namesake in another scope (a
  // foreign parameter spelled like a local function) open the caller set of a callee it never touches
  let callableScopeFacts = null;
  function sharedCallableScope() {
    callableScopeFacts ??= {
      declarations,
      referenceScopes,
      readsBare,
      nonCalleeNameUses,
      writtenCallOwners,
      unreadableCallOwners,
      aliases: aliasInit,
      openedBinding,
      openedOnlyByWrites,
      written,
      containerThis: new WeakMap(),
      calleeValues: new WeakMap(),
      closedParameterHosts,
      parameterCallSites: new WeakMap(),
    };
    return callableScopeFacts;
  }
  // is the binding `owner` declares under `name` OPENED - by a READ, bare or through a key the census
  // cannot name, or by a WRITE through a member? the name-keyed sets answer for every namesake in the
  // file; this answers for the one binding, each recorded reference resolved through the completed
  // declarations once. a reference whose chain the census never recorded resolves to nothing and
  // opens every binding of the name - the widening side
  let openings = null;
  function openedBy(kind, name, owner) {
    if (!openings) {
      openings = { read: new Map(), write: new Map() };
      function open(byName, node, scopes) {
        let owners = byName.get(node.name);
        if (!owners) byName.set(node.name, owners = new Set());
        owners.add(scopes ? declarations.resolve(node.name, scopes) ?? null : null);
      }
      for (const node of bareReadRefs) open(openings.read, node, referenceScopes.get(node));
      for (const node of unreadableOwnerRefs) open(openings.read, node, referenceScopes.get(node));
      for (const { node, scopes } of writtenOwnerRefs) open(openings.write, node, scopes);
    }
    const owners = openings[kind].get(name);
    return !!owners && (owners.has(owner) || owners.has(null));
  }
  // ... by either
  function openedBinding(name, owner) {
    return openedBy('read', name, owner) || openedBy('write', name, owner);
  }
  // ... and by nothing but member WRITES: no bare read hands it out and no unreadable key reaches
  // through it, so those writes are all that sets what one of its keys holds
  function openedOnlyByWrites(name, owner) {
    return !openedBy('read', name, owner);
  }
  // the parameter half of accountability, answered ONCE and late: a caller supplies a parameter, so
  // the question is which callers exist, and only the finished walk holds every reference and every
  // call. a construct this file binds under a name nothing but a CALL ever reads reaches no caller
  // the walk cannot see, so its parameters hold what those calls put there - recorded as the alias
  // hops they are, which every stamp already follows. anything else keeps the shape's own verdict.
  // both readers ask, since either reducer may stamp first and the answer must not move with that -
  // nor with the facts, which is why the one shared bag is read here and handed to nobody
  let parametersDecided = false;
  // eslint-disable-next-line max-statements -- one completed census owns scoped caller closure and parameter pairing
  function decideParameterAccountability() {
    if (parametersDecided) return;
    parametersDecided = true;
    const callableScope = sharedCallableScope();
    // Normalize direct, invoker and tagged calls before deciding which other references
    // merely forward a local callable and which open its caller set.
    const invoked = new Set();
    const callsTo = new Map();
    for (const node of callNodes) {
      const callee = peelCalleeValue(invocationOf(node).callee);
      invoked.add(callee);
    }
    for (const node of nameUses) if (!invoked.has(node)) nonCalleeNameUses.add(node.name);
    const forwarded = new Set();
    const open = new Set();
    const callableNames = new Set(),
          methodOwners = new Set();
    const immediateCalls = immediateInvocationCalls();
    for (const [name, entries] of localCallables) {
      if (aliasInit.get(name)?.some(entry => unwrapRuntimeExpr(entry.value)?.type === 'ObjectExpression')) methodOwners.add(name);
      const entriesByOwner = new Map();
      for (const entry of entries) {
        const owner = entry.scope !== undefined ? entry.scope : declarations.resolve(name, entry.scopes);
        entriesByOwner.set(owner, (entriesByOwner.get(owner) ?? 0) + 1);
      }
      for (const { value, scope, scopes } of entries) {
        const owner = scope !== undefined ? scope : declarations.resolve(name, scopes);
        const host = calleeFunctionOf(value, localCallables, callableScope);
        if (!host) continue;
        callableNames.add(name);
        if (!callsTo.has(host)) callsTo.set(host, []);
        if (entriesByOwner.get(owner) !== 1 || bindingCounts.get(name)?.get(owner) !== 1 || exportedCallableNames.has(name)
          || handedToDecorators(value)) open.add(host);
        else if (value?.type === 'Identifier' || isMemberAccessNode(value)) forwarded.add(value);
      }
    }
    // A method and its local aliases have one caller set. Any unaccounted read of any
    // spelling opens that set; resolving a fixed callee alone is not a closure proof.
    for (const node of [...nameUses, ...memberUses]) {
      if (invoked.has(node) || forwarded.has(node)) continue;
      // The completed declaration pass identifies possible callable spellings first.
      // Ordinary values and members of other receivers cannot open a local caller set.
      if (node.type === 'Identifier' ? !callableNames.has(node.name)
        : !methodOwners.has(unwrapRuntimeExpr(node.object)?.name)) continue;
      const host = calleeFunctionOf(node, localCallables, callableScope);
      if (host) open.add(host);
    }
    for (const node of callNodes) {
      const host = calleeFunctionOf(peelCalleeValue(invocationOf(node).callee), localCallables, callableScope);
      if (!host || open.has(host)) continue;
      let calls = callsTo.get(host);
      if (!calls) callsTo.set(host, calls = []);
      calls.push(invocationOf(node));
    }
    for (const host of open) callsTo.delete(host);
    for (const { node, frame } of parameterHosts) {
      const calls = callsTo.get(node) ?? [];
      const relevant = (node.params ?? []).some(param => carriesKnownCtor(param))
        || calls.some(({ args }) => args.some(argument => carriesKnownCtor(argument)));
      if (!relevant) continue;
      const pairs = !callsTo.has(node) || referencesArguments(node) ? null : parameterValuePairs(node, calls, aliasInit, false);
      if (pairs) closedParameterHosts.add(node);
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
        for (const [bound, value] of (invocation
          ? parameterValuePairs(node, [invocationOf(invocation)], aliasInit, referencesArguments(node)) : null) ?? []) {
          recordPatternAlias(bound, value, paramsScope);
        }
        continue;
      }
      const paramScope = declarationScopesOf(node, frame).own;
      for (const [bound, value] of pairs) {
        recordPatternAlias(bound, value, paramScope);
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
  // File a stored value under its named receiver. Unknown keys use the receiver's wildcard;
  // an unnamed receiver hands the value out immediately.
  function fileSlotWrite(target, value, scopes, installedKey = undefined) {
    if (ignoredWriteValues.has(value)) return;
    for (const chain of writeTargetChains(target)) fileChainWrite(chain, { value, scopes, installedKey });
  }
  function fileChainWrite({ root, keys: chainKeys }, { value, scopes, installedKey }) {
    const keys = installedKey === undefined ? chainKeys : [...chainKeys, installedKey];
    if (root?.type !== 'Identifier') {
      const key = installedKey !== undefined ? installedKey ?? '*' : unrootedWriteKey({ root, keys }, scopes);
      if (key !== null) unrootedKeys.add(key);
      return escaped.add(value);
    }
    if (keys.length === 1) setterStoreHosts.add(scopes.findLast(scope => FUNCTION_LIKE_NODE_TYPES.has(scope.type)));
    // a key this census cannot NAME still names a slot of THIS file's container: what the write
    // loses is which slot, not whose. filed under the wildcard the read side already asks with, it
    // takes the same released-or-kept verdict every named write takes - handing it out instead made
    // `c[dyn] = C` cost the whole namespace, exactly what `c.d = C` beside it does not
    const pathKeys = keys.includes(null) ? ['*'] : keys;
    const path = JSON.stringify(pathKeys);
    // the receiver of a ONE-key write is replaced, not read - a deeper chain (`c.a.b = X`) does read
    // the level above the slot it replaces, and stays a read of the container
    if (keys.length === 1 && installedKey === undefined) writeTargetRoots.add(root);
    slotWrites.push({ name: root.name, root, keys: pathKeys, value, scopes, installed: installedKey !== undefined });
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
    for (const node of callNodes) {
      const { callee } = invocationOf(node);
      if (callee && FUNCTION_LIKE_NODE_TYPES.has(callee.type)) calls.set(callee, node);
    }
    return calls;
  }

  // `at` is the scope the name BINDS in, kept beside the value so a reference resolves the name the
  // way the language does: an inner shadow's value belongs to the inner scope alone, and answering
  // by spelling handed the outer binding's value to a leaf that never reaches it. A write carries
  // its target instead: the completed declaration index resolves its owner on the first query.
  function recordAliasInit(name, value, at = null, target = null) {
    let values = aliasInit.get(name);
    if (!values) aliasInit.set(name, values = []);
    values.push({ at, value, target, aliases: target ? aliasInit : null });
  }
  // the container NAMES a destructure can land on - the names standing among the VALUES the
  // container expression can hand the pattern: a selection reaches every arm, and each arm is read
  // by the same pattern - the arm a run takes is not this census's to decide. an effect spelled
  // ahead of the value belongs to the SOURCE and not to the value, so the union's flattener peels
  // it first - `const box = (n++, { Map })` holds the literal exactly as the bare spelling does
  function containerNamesOf(source) {
    return flattenBranchingValueNodes([source]).filter(value => value.type === 'Identifier').map(value => value.name);
  }

  // the constructor a container LITERAL puts in `key`, if any: `{ Map }`, `{ M: Map }` and `[Map]`
  // all hold one - a NUMERIC key names an array slot the same way - while a getter handing back the
  // realm holds nothing
  function ctorInContainerLiteralSlot(value, key) {
    let paired = null;
    if (value.type === 'ObjectExpression') {
      paired = objectPropertyReadValue(
        findObjectKeyBeforeSpread(value.properties, prop => plainSynthKeyName(prop.key) === key), {});
    } else if (value.type === 'ArrayExpression' && /^\d+$/u.test(key)) {
      [paired = null] = arrayWrapSlotValueCandidates(value.elements, Number(key));
    }
    const held = unwrapRuntimeExpr(paired);
    return held?.type === 'Identifier' && isKnownGlobalName(held.name) ? held.name : null;
  }

  // the constructor the file puts in this container's `key`, through either half of the answer
  function ctorHeldByContainerSlot(containerName, key, seen = new Set()) {
    if (typeof key !== 'string' || seen.has(containerName)) return null;
    seen.add(containerName);
    const values = flattenBranchingValueNodes((aliasInit.get(containerName) ?? []).map(record => record?.value));
    // the file's OWN literal answers on its own: this index is keyed by NAME, so a declaration
    // SHADOWING this one from another scope shares the bucket and does not speak for this read
    for (const value of values) {
      const named = ctorInContainerLiteralSlot(value, key);
      if (named !== null) return named;
    }
    // a NAME standing where the literal would is an alias hop - what the pattern ends up reading is
    // the container that name holds. here EVERY value the name can take has to answer alike, because
    // a name that also takes something opaque carries no proof that OUR binding is what the slot
    // holds. the obligation is not lost by declining: wherever pure does rewrite the slot, the
    // substitution route answers for it on its own, and this half only covers the spellings it
    // cannot see - a clean hop, a selection of literals, an effect spelled ahead of one
    let held = null;
    for (const value of values) {
      const named = value.type === 'Identifier' ? ctorHeldByContainerSlot(value.name, key, new Set(seen)) : null;
      if (named === null || (held !== null && named !== held)) return null;
      held = named;
    }
    return held;
  }

  // a read that comes BACK off a container slot this file stored a constructor in: pure substitutes
  // its own binding into that slot and never reads the slot back, so the static the pattern names
  // under it has to be ON that binding - and the narrow `*/constructor` module installs none of the
  // constructor's own statics. only an OWN static counts (an intrinsic property is on the narrow
  // entry too), and only where the container's literal actually put the constructor there
  // does this pattern level gather a REST? the object-rest boundary stops pure's extraction at the
  // level that spells one, so every leaf under it keeps the source's own read
  function gathersRest(patternNode) {
    return (patternNode?.properties ?? patternNode?.elements ?? [])
      .some(item => item?.type === 'RestElement');
  }

  function stampCtorStaticReadThroughSlot(pattern, source) {
    const roots = containerNamesOf(source);
    if (!roots.length) return;
    // ... and whether the pattern reads that container DIRECTLY. A SELECTION hands the pattern one
    // arm at runtime and only the realm arm is mirrored, so the container arm is destructured as it
    // stands and every leaf under it reads the slot back - the extraction below served none of them
    const directSource = unwrapRuntimeExpr(source)?.type === 'Identifier';
    // an ARRAY pattern names its slots by INDEX, an object pattern by key - one walk over the pairs
    const slots = pattern?.type === 'ArrayPattern'
      ? pattern.elements.map((element, at) => [String(at), patternSlotTarget(element)])
      : pattern?.type === 'ObjectPattern'
        ? pattern.properties
          .filter(prop => (prop.type === 'Property' || prop.type === 'ObjectProperty') && !prop.computed)
          .map(prop => [plainSynthKeyName(prop.key), patternSlotTarget(prop.value)])
        : null;
    if (!slots) return;
    for (const [key, inner] of slots) {
      if (inner?.type !== 'ObjectPattern') continue;
      const ctorName = roots.reduce((found, name) => found ?? ctorHeldByContainerSlot(name, key), null);
      if (ctorName === null) continue;
      for (const leaf of inner.properties) {
        if (leaf.type !== 'Property' && leaf.type !== 'ObjectProperty') continue;
        // ... but a leaf the EXTRACTION serves reads no slot at runtime: the pass binds the static's
        // own import in its place (`const resolve = _Promise$resolve`), so nothing ever comes back
        // through the container and the narrow entry answers everything this file spells. what does
        // come back is the leaf an extraction cannot serve - a MEMBER target, a computed key nothing
        // folds, a pattern-valued slot - and that one still reads its static off the binding pure put
        // in the slot. asking of the whole pattern instead cost the FILE the constructor's namespace
        // for a read the pass had already answered
        // ... and a REST anywhere over that leaf bars the extraction outright (the declared
        // object-rest boundary), so the read comes back through the slot however plain the leaf is
        const target = patternSlotTarget(leaf.value);
        const servedByExtraction = directSource && !leaf.computed && target?.type === 'Identifier'
          && !gathersRest(inner) && !gathersRest(pattern);
        if (servedByExtraction) continue;
        const staticName = leaf.computed ? null : plainSynthKeyName(leaf.key);
        if (staticName === null || hasOwnStaticDefinition(ctorName, staticName)) {
          heldInSlot.add(ctorName);
          break;
        }
      }
    }
  }

  // A plain binding holds the installed value; a destructured one holds its paired slot. Keep the
  // pattern beside that value so the canonical reader answers the pairing once the source resolves.
  function recordPatternAlias(pattern, source, at = null, assignment = false) {
    source = installedWriteValue(source);
    if (isDestructurePattern(pattern) && source) {
      patternReceiverSlotNodes(pattern, source, null, { preservesBody: true, restSources, restValues });
    }
    if (source) walkPatternIdentifiers(pattern, id => {
      recordAliasInit(id.name, pattern.type === 'Identifier' ? source : { pattern, source }, at, assignment ? id : null);
    });
  }
  // what a node's own SHAPE settles about the names under it, before the subtree is walked. the
  // WRITE-position patterns first: every identifier one of them holds names a slot being written,
  // which `walkPatternIdentifiers` enumerates exactly (a default's VALUE is a read and stays out)
  // eslint-disable-next-line max-statements -- declaration counts and value records must share the same scope facts
  function recordNodeShapeFacts(node, frame, declared) {
    const { type } = node;
    if (declared) {
      const { own, named } = declarationScopesOf(node, frame);
      for (const id of declared) {
        const owner = id === node.id ? named : own;
        let counts = bindingCounts.get(id.name);
        if (!counts) bindingCounts.set(id.name, counts = new Map());
        counts.set(owner, (counts.get(owner) ?? 0) + 1);
      }
    }
    if (FUNCTION_LIKE_NODE_TYPES.has(type)) {
      parameterHosts.push({ node, frame });
      for (const param of node.params ?? []) PARAMETER_STATIC_SOURCES.delete(param);
    }
    const patterns = type === 'VariableDeclarator' ? [node.id]
      : type === 'AssignmentExpression' || type === 'ForOfStatement' || type === 'ForInStatement' ? [node.left]
      : type === 'CatchClause' ? [node.param]
      : FUNCTION_LIKE_NODE_TYPES.has(type) ? node.params ?? [] : [];
    if (node.argument && isMemberMutationContext(node.argument, node)) patterns.push(node.argument);
    for (const pattern of patterns) {
      if (isDestructurePattern(pattern)) walkPatternIdentifiers(pattern, id => writeTargetRoots.add(id));
      const targets = [];
      collectForXWriteMembers(pattern, targets);
      // A member head stores iteration provenance in its actual target. Like an ordinary member
      // write, it exposes the source only when the target or its containing object is handed out.
      if (type === 'ForOfStatement') for (const target of targets) {
        hasOpaqueIteration = true;
        fileSlotWrite(target, { opaqueSource: node.right }, frame?.scopes ?? []);
      }
      // ... and a member a destructuring ASSIGNMENT stores into holds the slot of its right side the
      // pattern pairs it with
      if (type === 'AssignmentExpression' && isDestructurePattern(pattern)) {
        for (const [target, value] of patternMemberTargetPairs(pattern, unwrapRuntimeExpr(node.right))) {
          fileSlotWrite(target, value, frame?.scopes ?? []);
        }
      }
      for (const target of targets) {
        const root = runtimeChainRoot(target);
        if (root?.type === 'Identifier') {
          writtenCallOwners.add(root.name);
          writtenOwnerRefs.push({ node: root, scopes: frame?.scopes ?? [] });
          let writes = callablePropertyWrites.get(root.name);
          if (!writes) callablePropertyWrites.set(root.name, writes = []);
          writes.push({ target, value: type === 'AssignmentExpression' && node.operator === '=' ? node.right : null,
            scopes: frame?.scopes ?? [], statement: frame?.parentNode });
        }
      }
    }
    // ... the names it reads THROUGH rather than bare: a member reads through its owner, and so does
    // a destructuring SOURCE whenever the pattern NAMES every slot it takes - `const { k: { of } } = c`
    // selects the same slot `c.k.of` selects and is no less attributable, so counting it a BARE read
    // released every write into that container. the walk is top-down, so a chain's own node is seen
    // before the root it navigates
    switch (type) {
      case 'MemberExpression':
      case 'OptionalMemberExpression': {
        memberUses.push(node);
        const owner = unwrapRuntimeExpr(node.object);
        if (owner?.type === 'Identifier') memberObjects.add(owner);
        else if (owner?.computed && isMemberAccessNode(owner) && staticMemberKeyName(owner) === null) memberReaders.set(owner, node);
        // ... the key read off it travels too: a selecting root is held only for a read of one of the
        // constructor's OWN statics (below)
        const readKey = staticMemberKeyName(node) ?? (node.computed ? computedKeyStaticName(node.property) : null);
        if (readKey === null && owner?.type === 'Identifier') {
          unreadableCallOwners.add(owner.name);
          unreadableOwnerRefs.push(owner);
        }
        // Record an unknown selection after its key's effects. The completed alias graph decides
        // whether the key folds; the read's consumer decides whether the selected value escapes.
        if (node.computed && readKey === null && !isMemberWriteOnlyContext(node, frame?.parentNode)) opaqueReads.set(node, null);
        // the VALUE the read lands on: an effect prefix ahead of the receiver runs where the read stands
        // and names nothing, so every verdict below is the tail's
        const valueOwner = peelReceiverSequenceTail(owner);
        const opaqueOnly = !isMemberAccessNode(valueOwner) || !isKnownGlobalName(escapeStampedName(valueOwner));
        // ... and whether pure can guard the read on the call it reads off: only a receiver that IS the
        // call - an effect prefix ahead of it runs once inside the captured receiver - with no live `?.`
        // the guard cannot absorb, the bail rule of `planGuardedStaticNarrow` for a call, which has no
        // identifier hop of its own to re-read
        const hops = isCallShape(unwrapRuntimeExpr(valueOwner)) ? ownChainOptionalObjects(node) : null;
        const guardable = !!hops && (!hops.length || (hops.length === 1 && !!node.optional));
        // Ordinary instance and user-defined keys cannot retain a constructor's static family.
        if (!opaqueOnly || readKey === null || hasStaticDefinitionKey(readKey)) {
          memberReceivers.push([valueOwner, null, readKey, opaqueOnly, guardable, true, node]);
        }
        break;
      }
      // ... and an `in` test probes the key it spells off its right operand as a read of that key does
      case 'BinaryExpression': {
        if (node.operator !== 'in' || node.left.type === 'PrivateName') break;
        const readKey = computedKeyStaticName(node.left);
        const valueOwner = peelReceiverSequenceTail(unwrapRuntimeExpr(node.right));
        const opaqueOnly = !isMemberAccessNode(valueOwner) || !isKnownGlobalName(escapeStampedName(valueOwner));
        // ... a key the fold cannot name tests each key it may evaluate to, as its member spelling
        // reads them - and one naming none, every static (`presenceTests`)
        const member = readKey === null ? { type: 'MemberExpression', object: valueOwner, property: node.left, computed: true } : null;
        if (member) presenceTests.push(member);
        if (!opaqueOnly || readKey === null || hasStaticDefinitionKey(readKey)) {
          memberReceivers.push([valueOwner, null, readKey, opaqueOnly, false, false, member]);
        }
        break;
      }
      case 'VariableDeclarator':
      case 'AssignmentExpression':
        recordPatternReceivers(type === 'VariableDeclarator' ? node.id : node.left,
          unwrapRuntimeExpr(type === 'VariableDeclarator' ? node.init : node.right), true);
        break;
      // ... and a for-of head destructures each element of the literal it iterates
      case 'ForOfStatement': {
        const head = node.left?.type === 'VariableDeclaration' ? node.left.declarations[0]?.id : node.left;
        const iterated = unwrapRuntimeExpr(node.right);
        if (isDestructurePattern(head) && iterated?.type === 'ArrayExpression') {
          for (const element of iterated.elements) {
            if (element?.type !== 'SpreadElement') recordPatternReceivers(head, unwrapRuntimeExpr(element));
          }
        }
        break;
      }
      // ... and a DEFAULT's pattern reads its receivers off the default the way a declarator's does
      case 'AssignmentPattern':
        patternReceiverSlotNodes(node.left, node.right, null, { preservesBody: true, restSources, restValues });
        recordPatternReceivers(node.left, unwrapRuntimeExpr(node.right), false, true);
        break;
    }
    // ... and the construct a name of this file's own stands for - the function a call arm reads the
    // parameters of, the class a `new` runs the constructor of. recorded with the scope that binds
    // it, so a reference resolves the one its own chain reaches; a write records the chain it was
    // spelled in and resolves to its binding once the declarations are whole
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
    const carried = isLocalCallableValue(value) || value?.type === 'Identifier' || value?.type === 'ObjectExpression'
      || isMemberAccessNode(value) ? value : null;
    let entries = localCallables.get(bound.name);
    if (!entries) localCallables.set(bound.name, entries = []);
    const scope = type === 'AssignmentExpression' ? undefined
      : type === 'VariableDeclarator' ? declarationScopesOf(node, frame).own : declarationScopesOf(node, frame).named;
    entries.push({ value: carried, scope, scopes: frame?.scopes ?? [] });
  }
  // ... and what a REFERENCE settles: a write TARGET spells its name without reading it, and the
  // release gate below reads exactly the bare-read flag, so counting a target a read handed out every
  // value the file put into that binding. the member root of a one-key write and a pattern SLOT are
  // the same position
  // ... and so does a `void` operand: the read happens and its value is DISCARDED on the spot, so it
  // reaches no one - as accounted for as a member read, and counted bare it let the whole family go
  function recordIdentifierReference(node, frame) {
    // The shared walk sees every arguments spelling, including nested functions and type slots.
    // Only those containing functions need the body/parameter scan; definition-time keys can
    // make this set wider than that scan, so positive candidates still use its exact answer.
    if (node.name === 'arguments') {
      for (const scope of frame?.scopes ?? []) {
        if (FUNCTION_LIKE_NODE_TYPES.has(scope.type)) argumentsHosts.add(scope);
      }
    }
    if (frame?.underTypeAnnotation || isNonReferencePosition(frame?.parentNode, node)
      || isBindingPosition(frame?.parentNode, node)) return;
    const discarded = frame?.parentNode?.type === 'UnaryExpression' && frame.parentNode.operator === 'void';
    if (!writeTargetRoots.has(node) && !discarded) {
      (memberObjects.has(node) ? readsThrough : readsBare).add(node.name);
      if (!memberObjects.has(node)) bareReadRefs.push(node);
    }
    nameUses.push(node);
    referenceScopes.set(node, frame?.scopes ?? []);
  }
  function noteExportedNames(declaration) {
    for (const id of exportedValues(declaration)) if (id?.type === 'Identifier') {
      nonCalleeNameUses.add(id.name);
      exportedCallableNames.add(id.name);
    }
  }

  // the receivers a pattern (or a plain name) takes off its source: a name read for every slot, a
  // constructor stored whole off a member chain - reads through the binding it lands in are never
  // resolved past a guarded realm, so the entry it takes has to carry the statics itself - and each
  // slot the pattern reads, off a receiver or off the invocation it stands on, at the LEVEL it reads
  // from (`{ g: { groupBy } } = K` reads `groupBy` off `K.g`). `guardsIdentity`: the host renders a
  // slot with no default of its own behind an identity guard on the receiver - a declarator and an
  // assignment do, a for-of head and a parameter default do not
  function recordPatternReceivers(pattern, source, guardsIdentity = false, keepsCallRead = false) {
    if (source?.type === 'Identifier' && isDestructurePattern(pattern) && patternNamesEverySlot(pattern)) {
      memberObjects.add(source);
    } else if ((isDestructurePattern(pattern) || pattern?.type === 'Identifier') && isMemberAccessNode(source)
      && isKnownGlobalName(escapeStampedName(source))) {
      memberReceivers.push([source]);
    }
    if (!isDestructurePattern(pattern)) return;
    for (const slot of patternReceiverSlotNodes(pattern, source, null, { includeNestedReceivers: true, preservesBody: true })) {
      if (isKnownGlobalName(escapeStampedName(slot))) memberReceivers.push([source, slot]);
    }
    const levels = new Map();
    // ... and on the host's own level the guard renders only where the read can stand alone in source
    // order: the sole read, or an END of a rest-free pattern (`planGuardedDestructureNarrow` detaches
    // it beside the host). a MIDDLE one splits only when every sibling is guarded too, which this walk
    // cannot tell - its receiver is held to the entry that carries the static instead
    const props = pattern.properties?.filter(item => !isRestProperty(item)) ?? [];
    const rested = props.length !== (pattern.properties?.length ?? 0);
    function hostGuardsSlot(slot) {
      if (!props.includes(slot) || props.length === 1) return true;
      return !rested && patternEdgeSide(pattern, slot) !== null;
    }
    const opaqueKeys = [];
    for (const slot of patternReceiverSlotNodes(pattern, source, null, {
      includeNestedReceivers: true, includeBindings: true, preservesBody: true, readsThrough: true, slotReceivers: levels, opaqueKeys,
    })) {
      memberReceivers.push([
        levels.get(slot) ?? source,
        null,
        foldedPropertyKeyName(slot),
        true,
        false,
        guardsIdentity && slot.value?.type !== 'AssignmentPattern' && hostGuardsSlot(slot),
        null,
        keepsCallRead,
      ]);
    }
    // ... and a computed key the pairing cannot name selects the slot the member spelling `receiver[key]`
    // does: recorded as that read - an opaque selection, and a read of each key it may fold to - for the
    // key canon to judge once the graph is complete. no host guards a read whose key it cannot name
    for (const { receiver, key } of opaqueKeys) {
      const member = { type: 'MemberExpression', object: receiver, property: key, computed: true };
      opaqueReads.set(member, null);
      memberReceivers.push([receiver, null, null, true, false, false, member, keepsCallRead]);
    }
  }
  // the call is recorded here and read once the walk is over: which function it invokes and what
  // reaches each parameter are the invocation canon's answers, and the canon asks binding facts
  // the walk is still collecting. a `super(...)` names its class through the scope chain alone
  function recordInvocation(node, frame) {
    referenceScopes.set(node, frame?.scopes ?? []);
    if (frame?.parentType === 'ExpressionStatement'
      || frame?.parentNode?.type === 'UnaryExpression' && frame.parentNode.operator === 'void') unreadCallResults.add(node);
    const callee = unwrapRuntimeExpr(node.callee);
    if (callee?.type === 'Super') referenceScopes.set(callee, frame?.scopes ?? []);
    callNodes.push(node);
  }

  // the first visited node IS the program: every table this walk fills is keyed by it, so the whole
  // registration is one step of the visit rather than a dozen
  function registerProgramTables(node) {
    programNode = node;
    ESCAPED_CTOR_REFS.set(node, stamps = new Set());
    ESCAPED_CTOR_NAMES.set(node, ctorNames);
    CTOR_ALIAS_INITS.set(node, aliasInit);
    CENSUS_STATIC_RECEIVERS.delete(node);
    CENSUS_KEY_NAMES.set(node, censusKeyNames);
    RECORDED_MUTATION_ROOTS.delete(node);
    ALIAS_SCOPE_FACTS.set(aliasInit, {
      declarations,
      referenceScopes,
      outerEvaluatedOwners,
      callCallees,
      passthrough,
      returnedWriteValue,
      scopeIds: new Map([[null, 0]]),
    });
    GLOBAL_ONLY_CTOR_NAMES.set(node, globalOnly);
    HELD_CTOR_NAMES.set(node, heldInSlot);
    WRITTEN_SLOT_VALUES.set(node, written);
    UNROOTED_WRITE_KEYS.set(node, unrootedKeys);
    ESCAPED_CONTAINER_NAMES.set(node, new Set());
    REALM_CTOR_REFS.set(node, classifyRealmReference);
    PASSTHROUGH_CALL_VALUES.set(node, passthrough);
    CALL_CALLEES.set(node, callCallees);
    CALL_BUILTINS.set(node, callBuiltin);
    CALLEE_RESOLUTION.set(node, ensureCallees);
  }

  // a NAMED export makes its bindings readable from OUTSIDE, which is the standing a bare read
  // gives a container here: whatever an importer navigates through it, this walk cannot follow.
  // a re-export (`export { x } from 'm'`) names no binding of this file at all
  function recordNamedExport(node, frame) {
    if (node.source) return;
    for (const specifier of node.specifiers ?? []) {
      if (specifier.local?.type !== 'Identifier') continue;
      readsBare.add(specifier.local.name);
      nonCalleeNameUses.add(specifier.local.name);
      exportedCallableNames.add(specifier.local.name);
      // ... and the VALUE goes with the binding: an importer reads whatever this name holds, so a
      // constructor reaching it is handed out exactly as one handed to a call is. the walk follows
      // the alias hops itself, so the reference is what escapes, never a re-derived leaf
      escaped.add(specifier.local);
    }
    noteExportedNames(node.declaration);
    if (CENSUS_CONTAINER_TYPES.has(node.declaration?.type)) escaped.add(node.declaration);
    for (const declarator of node.declaration?.declarations ?? []) {
      const namedPattern = isDestructurePattern(declarator.id) && patternNamesEverySlot(declarator.id);
      walkPatternIdentifiers(declarator.id, id => {
        readsBare.add(id.name);
        if (declarator.init && namedPattern) {
          referenceScopes.set(id, frame?.scopes ?? []);
          escaped.add(id);
        }
      });
      // ... but a DESTRUCTURING declarator hands out the SLOTS its pattern names, never the value
      // it took them from: `export const { k } = C` exports `C.k` and leaves `C` where it was.
      // the same export spelled through a specifier (`const { k } = C; export { k }`) already
      // answered that way, so counting the init here made one export answer two ways. a pattern
      // that cannot name every slot it takes - a rest element, a key it cannot fold - reaches
      // past the ones it spells and hands the container out after all
      if (declarator.init && !namedPattern) {
        referenceScopes.set(declarator.id, frame?.scopes ?? []);
        escaped.add(declarator.id.type === 'Identifier' ? declarator.id : declarator.init);
      }
    }
    // ... and an exported FUNCTION hands out what it RETURNS, the way a method value does: an
    // importer calls it and reads the result, so the returns escape even though the function
    // itself is all this file spells
    if (node.declaration?.body) {
      for (const ret of calleeReturnStatements(node.declaration)) escaped.add(ret.argument);
    }
  }

  function visit(node, frame) {
    if (!stamps) registerProgramTables(node);
    // An identifier contributes only its reference facts; it declares no names or value shapes.
    if (node.type === 'Identifier') {
      recordIdentifierReference(node, frame);
      return;
    }
    // Literals carry no declarations, calls or reference facts; their parents record the value.
    if (frame?.underTypeAnnotation || PRIMITIVE_LITERAL_TYPES.has(node.type)) return;
    const declared = declaredIdentifierNodes(node);
    declarations.record(node, frame, null, declared);
    unaccountableDeclarations.record(node, frame, isUnaccountableNonParameter, declared);
    recordOuterEvaluatedRegion(node);
    recordNodeShapeFacts(node, frame, declared);
    switch (node.type) {
      case 'CallExpression':
      case 'OptionalCallExpression':
      case 'NewExpression':
      case 'TaggedTemplateExpression':
        // which arguments come straight back is a question about the CALLEE, and the callee may be
        // a name this file binds further down - a hoisted declaration, or the const a call inside
        // another function sits above. only the finished walk holds every binding
        recordInvocation(node, frame);
        break;
      case 'AssignmentExpression': {
        // a write into a NAME is one more value that name holds - the write itself stays a tracked
        // position, but a reference reaching the name later travels through it. the peel below
        // answers nothing where no runtime value stands, and no arm claims that
        const target = unwrapRuntimeExpr(node.left);
        walkPatternIdentifiers(target, id => {
          guardedAliases.add(id.name);
          referenceScopes.set(id, frame?.scopes ?? []);
        });
        if (target?.type === 'MemberExpression' || target?.type === 'OptionalMemberExpression') {
          fileSlotWrite(target, node.right, frame?.scopes ?? []);
        } else recordPatternAlias(target, node.right, null, true);
        break;
      }
      // an enum block binds its name where `declarations` records it; an ambient one binds nothing
      case 'TSEnumDeclaration':
        if (node.id?.type === 'Identifier' && !isAmbientBindingShape(node, frame?.parentNode)) {
          let blocks = enumBlocks.get(node.id.name);
          if (!blocks) enumBlocks.set(node.id.name, blocks = []);
          blocks.push({ node, scope: declarationScopesOf(node, frame).named });
        }
        break;
      // a DECORATOR is handed the construct it hangs off - the class for a class, member and
      // parameter decorator alike - so whatever the decorator expression evaluates to can read and
      // call it. the same standing a JSX tag gives its component
      case 'ClassDeclaration':
      case 'ClassExpression':
        if (node.id?.type === 'Identifier') recordAliasInit(node.id.name, node, declarationScopesOf(node, frame).named);
        if (classCarriesDecorators(node)) escaped.add(node);
        break;
      case 'ThisExpression':
      case 'Super': {
        const owner = frame?.scopes?.findLast(isThisRebinding);
        if (owner) thisReaders.add(owner);
        break;
      }
      // a JSX ELEMENT hands its component to a renderer - a caller this file does not spell - exactly
      // as a call argument hands its value to a callee. the desugared `createElement(C, props)`
      // spelling already escaped through the call arm, so one source spelled two ways answered twice
      case 'JSXOpeningElement': {
        const tag = jsxTagNameRoot(node.name);
        // ... the COMPONENT, which a member tag does not name: `<Map.Provider />` hands out the value
        // of that member read, exactly as `createElement(Map.Provider, props)` does, and the root is
        // read on the way there like any other receiver. stamping the root for both spellings gave
        // one source two answers - the desugared twin's, and a whole family for the tag
        // pure leaves the JSX spelling untouched, so this reference never hands out its minted
        // constructor. global still patches the binding the renderer receives. the same walk
        // follows a local component's defaults and returns for both flavors below
        if (tag === node.name && jsxIdentifierReferencesBinding(tag, node)) {
          referenceScopes.set(tag, frame?.scopes ?? []);
          jsxEscaped.push(tag);
        }
        break;
      }
      // an expression in a JSX prop or child is passed to the renderer as a VALUE. unlike the
      // tag-name spelling, pure rewrites it, so both flavors must carry its reachable statics
      case 'JSXExpressionContainer': escaped.add(node.expression); break;
      // an exported NAME is read by importers this walk never sees, and a construct read that way is
      // one they can call with values of their own - the same standing a bare read gives a container
      case 'ExportDefaultDeclaration':
        noteExportedNames(node.declaration);
        escaped.add(node.declaration);
        break;
      case 'ExportNamedDeclaration': recordNamedExport(node, frame); break;
      // the alias hops an escape may travel through, joined in `result`
      case 'VariableDeclarator':
        {
          const bindsIn = declarationScopesOf(node, frame).enclosing;
          if (isGuardedAliasingWrite({
            node,
            kind: frame?.parentNode?.kind,
            ownerNode: frame?.scopes?.findLast(scope => isVarScopeBoundary(scope.type)),
          })) walkPatternIdentifiers(node.id, id => guardedAliases.add(id.name));
          if (isDestructurePattern(node.id)) stampCtorStaticReadThroughSlot(node.id, node.init);
          recordPatternAlias(node.id, node.init, bindsIn);
        }
        break;
      // a for-of HEAD binds against the ELEMENT the iterated literal spells: its
      // declarator carries no init, so the declarator case above records nothing for it, and an
      // escape reaching the binding would stop at a name this graph never heard of
      case 'ForOfStatement': {
        const declaration = node.left.type === 'VariableDeclaration' ? node.left.declarations[0] : null;
        const head = unwrapRuntimeExpr(declaration?.id ?? node.left);
        const scopes = [...frame?.scopes ?? [], node];
        // Lexical declarations belong to the loop; an assignment keeps its existing owner.
        walkPatternIdentifiers(head, id => {
          referenceScopes.set(id, scopes);
          if (!declaration) guardedAliases.add(id.name);
        });
        const headScope = declarationScopeIn(node.left.kind, scopes);
        // Only the value flows into the head; iterable effects stay at the untouched source.
        const iterable = { ...node, right: installedWriteValue(node.right) };
        const elements = forOfIterableElements(iterable);
        // Unknown elements still belong to the head binding. Iteration alone is not an escape.
        if (!elements) walkPatternIdentifiers(head, id => {
          hasOpaqueIteration = true;
          recordAliasInit(id.name, { opaqueSource: node.right }, headScope, declaration ? null : id);
        });
        for (const element of elements ?? []) {
          recordPatternAlias(head, element, headScope, !declaration);
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

      case 'ThrowStatement': escaped.add(node.argument); break;
      // a yield hands the value to the iterator's consumer
      case 'YieldExpression': escaped.add(node.argument); break;
      // a PLAIN-IDENTIFIER default (`function f(M = Ctor)`) is one more value the binding it names
      // can hold - a WRITE into that binding, not a hand-out - so it takes the deferred verdict a
      // slot write takes: released where the binding is read BARE or cannot be accounted for, which
      // is every parameter (the caller decides whether the default is ever taken) and kept where the
      // file's own binding is only ever read THROUGH a member. a DESTRUCTURE default (`{ x } = Ctor`)
      // stays unstamped - the mirror / guarded-narrow channels own it and resolve their own entries
      // (stamping it double-resolved the same source position to two entries)
      case 'AssignmentPattern':
        if (node.left?.type === 'Identifier') {
          slotWrites.push({ name: node.left.name, value: node.right, scopes: frame?.scopes ?? [], defaultValue: true,
            host: frame?.scopes?.findLast(scope => FUNCTION_LIKE_NODE_TYPES.has(scope.type)), parameter: node });
        }
        break;
    }
  }
  // the callee each analyzable call stands on, resolved from the pairing canon's view of it: the
  // function this file spells, the known builtin it names, or nothing
  function resolveCallees(callableScope) {
    const resolvedCallees = new WeakMap();
    for (const node of callNodes) {
      const pairing = invocationOf(node);
      if (pairing.thisArg) invokedReceivers.add(pairing.thisArg);
      // ... and a STORED bind of a function this file spells is a call of it deferred to wherever the
      // bound function runs (`boundInvocation`)
      const bind = boundInvocation(node);
      const bound = bind && calleeFunctionOf(unwrapRuntimeExpr(bind.callee), localCallables, callableScope);
      if (bound) boundCalls.set(node, { callee: bound, pairing: bind });
      const spelled = peelCalleeValue(pairing.callee);
      const analyzable = spelled?.type === 'Identifier' || FUNCTION_LIKE_NODE_TYPES.has(spelled?.type)
        || CLASS_NODE_TYPES.has(spelled?.type) || isMemberAccessNode(spelled) || spelled?.type === 'Super';
      if (!analyzable) continue;
      const stands = calleeFunctionOf(spelled, localCallables, callableScope);
      resolvedCallees.set(node, stands);
      if (!stands) {
        const builtin = builtinCallee(spelled);
        if (builtin) {
          builtinCallees.set(node, builtin);
          if (builtin.namespace === 'Reflect' && builtin.method === 'set'
            || builtin.namespace === 'Object' && builtin.method === 'assign') {
            setterStoreHosts.add(referenceScopes.get(node)?.findLast(scope => FUNCTION_LIKE_NODE_TYPES.has(scope.type)));
          }
        }
      }
      if (stands && closedParameterHosts.has(stands)) {
        let sites = callableScope.parameterCallSites.get(stands);
        if (!sites) callableScope.parameterCallSites.set(stands, sites = []);
        sites.push({ pairing });
      }
      // calleeFunctionOf also proves fixed object methods with no this-dependent behavior.
      // Their return values pass through the same call graph as identifier-bound functions.
      if (stands && spelled?.type !== 'Super') callCallees.set(node, stands);
    }
    return resolvedCallees;
  }
  // A closed retained forwarder can write only to inert own setters at every call.
  // Such values are evaluated but never stored or exposed; discard their write edges,
  // using the same ordered summary as definite replacement and the same caller census.
  function discardIgnoredSetterWrites(callableScope) {
    const roots = RECORDED_MUTATION_ROOTS.get(programNode);
    if (!roots || roots.open
      || ['Object', 'Reflect', 'Function'].some(name => roots.names.has(name) || roots.globalSlots.has(name))) return;
    let discarded = false;
    for (const host of setterStoreHosts) {
      if (!closedParameterHosts.has(host)) continue;
      const sites = callableScope.parameterCallSites.get(host);
      if (!sites?.length) continue;
      const summary = returnedWriteSummary(host);
      if (!summary || summary.writes.some(write => write.namespace && !write.setsValue)) continue;
      const ignored = sites.every(({ pairing }) => {
        if (pairing.argsUnknown) return false;
        const source = peelReceiverSequenceTail(pairing.args[summary.index]);
        if (source?.type !== 'ObjectExpression' || source.properties.some(prop => prop.type === 'SpreadElement'
          || foldedPropertyKeyName(prop) === null)) return false;
        return summary.writes.every(write => {
          const member = objectLiteralSlotMember(source, write.key, 'set', literalSlotMembers);
          const setter = member?.value ?? member;
          return member?.kind === 'set' && setter.params.every(param => param.type === 'Identifier')
            && setter.body?.body?.length === 0 && paramDropsTheValue(setter, 0, referencesArguments(setter));
        });
      });
      if (!ignored) continue;
      for (const write of summary.writes) ignoredWriteValues.add(write.value);
      discarded = true;
    }
    if (!discarded) return;
    for (let index = slotWrites.length - 1; index >= 0; index--) {
      if (ignoredWriteValues.has(slotWrites[index].value)) slotWrites.splice(index, 1);
    }
    for (const paths of written.values()) for (const [key, values] of paths) {
      paths.set(key, values.filter(value => !ignoredWriteValues.has(value)));
    }
  }

  // Classify non-primitive arguments through their resolved callee's parameter disposition.
  // Known builtins use their dedicated argument census; unreadable calls and unpaired lists escape.
  function disposeArguments({ callableScope, resolvedCallees }) {
    const kept = new Set();
    const argumentFactCache = new WeakMap();
    for (const node of callNodes) {
      // a STORED bind runs its target wherever the bound function is later called, with the receiver
      // and arguments it fixed: they reach the target as a call's do, and what it returns reaches no
      // reader this census follows. a bind an enclosing invoker runs on the spot is that invoker's
      // call, whose pairing carries the bind's own receiver node
      let deferred = boundCalls.get(node);
      if (deferred && (resolvedCallees.get(node) || !deferred.pairing.thisArg || invokedReceivers.has(deferred.pairing.thisArg))) {
        deferred = null;
      }
      const pairing = deferred?.pairing ?? invocationOf(node);
      const callee = deferred ? deferred.callee : resolvedCallees.get(node);
      const builtin = !deferred && builtinCallees.has(node);
      // a list the canon cannot decide - a spread array, a spread in the receiver slot - pairs no
      // position with a parameter, so every raw argument is handed out as the source spells it
      // Presence records an analyzable invocation even when no local body was found.
      const decided = (deferred || resolvedCallees.has(node)) && !pairing.argsUnknown;
      const args = decided ? pairing.args : node.arguments ?? pairing.args;
      // Explicit property stores feed the same graph as assignment. Merely passing a
      // constructor to a builtin still creates no namespace obligation.
      const store = decided && builtin && callBuiltin(node);
      if (store) for (const { targetNode, key, value } of mutatorInstalledValues(store.namespace, store.method, store.args)) {
        if (!value) continue;
        const target = unwrapRuntimeExpr(targetNode);
        // A fresh empty target whose result is discarded exposes no installed value.
        if (target?.type === 'ObjectExpression' && !target.properties.length && unreadCallResults.has(node)) continue;
        if (target?.type === 'Identifier' && (store.namespace !== 'Object' || unreadCallResults.has(node))) {
          installedTargetRefs.add(target);
        }
        fileSlotWrite(targetNode, value, referenceScopes.get(node) ?? [], key);
      }
      // ... and the RECEIVER an invoker hands its function (`f.call(t)`): `this` reaches whatever the
      // callee does with it, which no parameter pairing answers - an unresolved callee, or one that
      // reads `this`, hands it out; a builtin keeps the builtin-argument policy
      const receiver = decided && pairing.thisArg?.type !== 'SpreadElement' ? pairing.thisArg : null;
      if (receiver && !PRIMITIVE_LITERAL_TYPES.has(unwrapRuntimeExpr(receiver)?.type)) {
        if (builtin) builtinArguments.add(receiver);
        else if (!callee || thisReaders.has(callee)) escaped.add(receiver);
      }
      // Primitive literals carry no constructor reference.
      args.forEach((argument, index) => {
        if (PRIMITIVE_LITERAL_TYPES.has(unwrapRuntimeExpr(argument)?.type)) return;
        if (!decided) {
          escaped.add(argument);
          return;
        }
        if (builtin) {
          builtinArguments.add(argument);
          return;
        }
        // An unresolved callee hands the argument out by definition. No body analysis can narrow it.
        if (!callee) {
          escaped.add(argument);
          return;
        }
        switch (argumentKeptBy({
          pairing,
          index,
          scopeFacts: callableScope,
          factCache: argumentFactCache,
          callee,
          referencesArguments,
        })) {
          // an argument the pattern BINDS is the pairer's to answer for, and one the callee DROPS
          // reaches nothing at all: neither is let go, neither is held
          case 'bound': case 'dropped': break;
          case 'returned':
            if (deferred) escaped.add(argument);
            else passthrough.set(node, argument);
            break;
          // a parameter READ is not a statically resolved member claim: the body can spell
          // `ns.ownKeys` without either detector attributing it to Reflect. both flavors therefore
          // carry the family through that argument, even though the callee keeps the value local
          case 'held': escaped.add(argument); break;
          case 'global-covered': kept.add(argument); break;
          default: escaped.add(argument);
        }
      });
    }
    return kept;
  }
  // A named static after an unknown selection needs only that key when every own slot holds
  // a realm constructor. Reuse the scoped alias, call-return and container-slot canons; nested
  // user containers, accessors, spreads and unaccountable sources keep the whole-family answer.
  // Container writes can reach the source through aliases, so they keep that fallback too.
  function opaqueSelectionNames(source, state, memo) {
    if (written.size) return null;
    const core = unwrapRuntimeExpr(source);
    const key = core?.type === 'Identifier' ? chainRootValues(aliasInit, core, new Set(), state.roots)
      : isMemberAccessNode(core) ? chainSlotValues(aliasInit, core, state, written).values
        : CALL_CALLEES.get(programNode)?.get(core) ?? core;
    if (memo.has(key)) return memo.get(key);
    memo.set(key, null);
    const names = new Set();
    const pending = [[source, false]];
    const seen = new Set();
    while (pending.length) {
      const [raw, slot] = pending.pop();
      const value = unwrapRuntimeExpr(installedWriteValue(raw));
      if (!value || seen.has(value)) return null;
      seen.add(value);
      if (value.type === 'Identifier' && classifyRealmReference(value) === 'maybe') return null;
      const alternatives = aliasedValues(aliasInit, value, new Set());
      if (alternatives.length !== 1 || alternatives[0] !== value) {
        for (const alternative of alternatives) pending.push([alternative, slot]);
        continue;
      }
      const branches = selectingValueArms(value);
      const callee = CALL_CALLEES.get(programNode)?.get(value);
      if (branches || callee && !callee.async && !callee.generator) {
        for (const alternative of branches ?? calleeReturnValues(callee)) pending.push([alternative, slot]);
        continue;
      }
      if (slot) {
        const root = runtimeChainRoot(value);
        const name = value.type === 'Identifier' ? value.name : globalProxyMemberName({ node: value });
        if (staticReceiverHint('static', name) !== 'function' || root?.type !== 'Identifier'
          || classifyRealmReference(root) !== 'proven') return null;
        names.add(name);
      } else if (isMemberAccessNode(value)) {
        const answer = chainSlotValues(aliasInit, value, state, written);
        if (answer.outside || !answer.values.length) return null;
        for (const alternative of answer.values) pending.push([alternative, false]);
      } else if ((value.type === 'ArrayExpression' || value.type === 'ObjectExpression')
        && !literalHasUnnameableSlot(value)) {
        for (const alternative of containerSlotNodes(value)) pending.push([alternative, true]);
      } else return null;
    }
    const answer = names.size ? names : null;
    memo.set(key, answer);
    return answer;
  }

  // a WELL-KNOWN SYMBOL off the realm's `Symbol` names one slot as surely as a string does
  // (`Map[Symbol.iterator]`): the key is known, only not a static's name, so the read reaches no static
  function isRealmWellKnownSymbol(value) {
    const node = peelToBareExpr(value);
    return isMemberAccessNode(node) && !node.computed
      && Object.hasOwn(knownBuiltInReturnTypes.staticProperties.Symbol, node.property?.name)
      && realmGlobalName(programNode, node.object) === 'Symbol';
  }
  // ... and so does every key whose VALUES this file spells: the property name is the value converted
  // (`String(value)`), whatever effect runs ahead of it, and each spelling folds - a literal, a bare
  // `undefined` or `void`, a template or `+` concat, both arms a selection may take, a member of an
  // enum this file declares, the slot of a literal read in place (`Symbol[[1, 2][0]]`) where it names
  // no static, and every value a bound name holds. the names it may be, or null where one value is no
  // spelling this file settles
  function censusKeyNames(keyNode) {
    const values = censusKeyValues(keyNode, new Set());
    return values && [...new Set(values.map(String))];
  }
  function censusKeyValues(node, seen) {
    const value = peelReceiverSequenceTail(unwrapRuntimeExpr(node));
    switch (value?.type) {
      case 'StringLiteral': case 'NumericLiteral': case 'BooleanLiteral': return [value.value];
      case 'NullLiteral': return [null];
      case 'Literal': return value.regex || value.bigint !== undefined ? null : [value.value];
      case 'UnaryExpression': return value.operator === 'void' ? [undefined] : null;
      case 'ConditionalExpression': return joinKeyValues([value.consequent, value.alternate], seen, null);
      case 'LogicalExpression': return joinKeyValues([value.left, value.right], seen, null);
      case 'BinaryExpression': return value.operator === '+' ? joinKeyValues([value.left, value.right], seen, (a, b) => a + b) : null;
      case 'TemplateLiteral': {
        if (value.quasis.some(quasi => typeof quasi.value.cooked != 'string')) return null;
        const parts = value.quasis.flatMap((quasi, at) => at ? [value.expressions[at - 1], quasi] : [quasi]);
        return joinKeyValues(parts, seen, (a, b) => `${ a }${ b }`, part => part.type === 'TemplateElement' ? [part.value.cooked] : null);
      }
      case 'Identifier': {
        if (value.name === 'undefined' && classifyRealmReference(value) === 'proven') return [undefined];
        const held = aliasedValues(aliasInit, value, seen);
        return held.length === 1 && held[0] === value ? null : joinKeyValues(held, seen, null);
      }
    }
    if (isRealmWellKnownSymbol(value)) return [WELL_KNOWN_SYMBOL_KEY];
    const enumKey = enumMemberKey(value);
    if (enumKey !== null) return [enumKey];
    // a literal read IN PLACE names its own slot: an index of an array, a data property of an object
    const container = isMemberAccessNode(value) ? unwrapRuntimeExpr(value.object) : null;
    if (container?.type !== 'ArrayExpression' && container?.type !== 'ObjectExpression') return null;
    const [slotKey = null, ...rest] = value.computed ? censusKeyNames(value.property) ?? [] : [value.property?.name];
    if (slotKey === null || rest.length || (container.type === 'ArrayExpression' && canonicalArrayIndex(slotKey) === null)) return null;
    const slot = containerSlotValues(container, slotKey, true);
    if (!slot.length) return container.type === 'ArrayExpression' ? [undefined] : null;
    // ... a spelling the claims' key canon does not read, so a slot naming a static stays unnamed: a
    // read is served by its key only where both canons name it
    const values = slot.length === 1 && slot[0] !== container ? censusKeyValues(slot[0], seen) : null;
    return values?.some(held => hasConstructorStaticKey(String(held))) ? null : values;
  }
  // the string or number literal a member of an enum this file declares is initialized with, where
  // that enum is the nearest binding of the name, no write reaches the member and the file hands the
  // enum on nowhere (whatever receives it may patch the member) - the one enum value the claims' key
  // canon folds too, so both name the same key or neither does
  function enumMemberKey(member) {
    const object = isMemberAccessNode(member) ? unwrapRuntimeExpr(member.object) : null;
    const name = object?.type === 'Identifier' ? staticMemberKeyName(member) : null;
    const blocks = name === null ? null : enumBlocks.get(object.name);
    if (!blocks || readsBare.has(object.name) || censusSlotWritten(programNode, aliasInit, member)) return null;
    const owner = declarations.resolve(object.name, aliasReferenceScopes(aliasInit, object) ?? []);
    for (const { node, scope } of blocks) {
      const initializer = scope === owner ? unwrapRuntimeExpr(findEnumMember(node, name)?.initializer) : null;
      if (!['StringLiteral', 'NumericLiteral', 'Literal'].includes(initializer?.type)) continue;
      if (typeof initializer.value == 'string' || typeof initializer.value == 'number') return initializer.value;
    }
    return null;
  }
  // the values of several key spellings: their union, or - where a `combine` joins them in order (a
  // concat, a template) - every combination, as long as their count stays one the folds can list
  function joinKeyValues(nodes, seen, combine, leaf = null) {
    let out = null;
    for (const node of nodes) {
      const values = leaf?.(node) ?? censusKeyValues(node, new Set(seen));
      if (!values) return null;
      out = !out ? values : combine ? out.flatMap(done => values.map(value => combine(done, value))) : [...out, ...values];
      if (out.length > MAX_KEY_VALUES) return null;
    }
    return out ?? [];
  }
  // Keep named static selections separate from actual handouts and unknown calls. Pure still
  // retains the source namespace; global consumes the proven constructor candidates per key.
  function keepOpaqueReadSources(kept) {
    const memo = new WeakMap();
    const state = { names: new Set(), roots: new Map(), slots: new Map() };
    for (const [member] of opaqueReads) {
      const object = peelToBareExpr(member.object);
      const root = peelToBareExpr(runtimeChainRoot(object));
      const surfaceName = escapeStampedName(object);
      const realmSurface = POSSIBLE_GLOBAL_OBJECTS.has(surfaceName) && (root?.type === 'Identifier'
        ? classifyRealmReference(root) === 'proven' : isMemberAccessNode(object) && isKnownGlobalName(surfaceName));
      const foldable = censusKeyNames(member.property) !== null;
      const reader = memberReaders.get(member);
      const key = reader && staticMemberKeyName(reader);
      const namedRead = !realmSurface && !foldable && key !== null && hasStaticDefinitionKey(key);
      const names = namedRead ? opaqueSelectionNames(member.object, state, memo) : null;
      if (names) {
        opaqueReads.set(member, names);
        kept.add(member.object);
      } else {
        if (!namedRead) opaqueReads.delete(member);
        if (!realmSurface && !foldable) escaped.add(member.object);
        // ... and a realm constructor reached through a proxy owes its family however the member is
        // spelled: the read a destructure level pairs with borrows its receiver's span, which the
        // escape walk will not name
        const realm = !realmSurface && !foldable && isMemberAccessNode(object) ? realmGlobalName(programNode, object) : null;
        if (realm && hasConstructorEntry(realm)) ctorNames.add(realm);
      }
    }
  }
  // the callees every call of the file invokes, resolved ONCE and only from a result: this
  // reducer's own, or the container census's, which files a binding of a NAMED call through the
  // callee's yielded literal and asks here whichever order the reducers are listed in - every
  // reducer's prepare has run by then, so the mutation roots the invoker proofs read are published.
  // a call that hands its argument straight back IS that argument as a value: the argument leaves
  // exactly where the CALL does, so the question moves onto the call node and every escape
  // position - a throw, a return, an outer argument, a slot write - asks it once, in the result
  let calleeRecords = null;
  function ensureCallees() {
    if (!calleeRecords) {
      decideParameterAccountability();
      calleeRecords = resolveCallees(sharedCallableScope());
    }
    return calleeRecords;
  }
  // Writes share the scoped binding graph with reads. Index literal identities too, so a
  // parameter and its local aliases see the same installed values after the call returns.
  function indexReceiverWrites() {
    const receiverWrites = new Map();
    for (const { root, keys, value } of slotWrites) {
      if (!root) continue;
      const owner = aliasBindingKey(aliasInit, root.name, aliasReferenceScopes(aliasInit, root));
      const targets = [owner];
      const sources = aliasedValues(aliasInit, root, new Set());
      for (const source of sources) if (source.type === 'Identifier') {
        targets.push(aliasBindingKey(aliasInit, source.name, aliasReferenceScopes(aliasInit, source)));
      }
      let containers = censusContainersOf(sources);
      for (const key of keys.slice(0, -1)) {
        containers = containers.flatMap(node => containerSlotValues(node, key)
          .flatMap(slot => aliasedValues(aliasInit, slot, new Set()))).filter(node => CENSUS_CONTAINER_TYPES.has(node.type));
      }
      targets.push(...containers);
      for (const target of targets) {
        let paths = receiverWrites.get(target);
        if (!paths) receiverWrites.set(target, paths = new Map());
        const key = JSON.stringify(typeof target === 'string' ? keys : [keys.at(-1)]);
        let values = paths.get(key);
        if (!values) paths.set(key, values = []);
        values.push(value);
      }
    }
    return receiverWrites;
  }
  function result() {
    shareAliasWrites(written, aliasInit);
    const callableScope = sharedCallableScope();
    const resolvedCallees = ensureCallees();
    discardIgnoredSetterWrites(callableScope);
    const kept = disposeArguments({ callableScope, resolvedCallees });
    ALIAS_SCOPE_FACTS.get(aliasInit).receiverWrites = indexReceiverWrites();
    keepOpaqueReadSources(kept);
    // ... and a presence test by a key no fold names asks after every static a constructor it tests may
    // carry: without the whole family its answer is wrong, in either flavor
    for (const member of presenceTests) if (censusKeyNames(member.property) === null) {
      for (const value of aliasedValues(aliasInit, member.object, new Set())) {
        const name = realmGlobalName(programNode, value);
        if (name && hasConstructorEntry(name)) ctorNames.add(name);
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
        // ... level by level: a member chain reads a nested container's slots the same way
        const levels = CENSUS_CONTAINER_TYPES.has(literal?.type) ? [literal] : [];
        for (const level of levels) {
          if (literalHasUnnameableSlot(level)) kept.add(level);
          for (const slot of containerSlotNodes(level)) {
            const value = unwrapRuntimeExpr(slot);
            if (CENSUS_CONTAINER_TYPES.has(value?.type)) levels.push(value);
          }
        }
      }
    }
    // ... and the receivers whose VALUE this census cannot enumerate - an undeclared `sink.slot`,
    // a parameter, an import local - hold whatever the outside put there, so a write into one of
    // them lands outside and hands its value out. the accountable ones KEEP it: the walks above
    // reach the written slot wherever the container itself is reachable, and nowhere else. what
    // stays home is asked again below, for the one flavor that cannot read it back
    // The target argument alone observes no stored value. Reuse the collected references
    // once, only for files with explicit stores, to distinguish a later read or handout.
    const observedInstalledTargets = new Set();
    if (slotWrites.some(write => write.installed)) for (const reference of nameUses) {
      if (!installedTargetRefs.has(reference) && !writeTargetRoots.has(reference)) observedInstalledTargets.add(reference.name);
    }
    for (const { name, value, scopes, defaultValue, host, parameter, installed } of slotWrites) {
      const outside = !declarations.declares(name, scopes);
      const paramIndex = host ? dropLeadingThisParam(host.params ?? []).indexOf(parameter) : -1;
      if (paramIndex >= 0 && (defaultValue && closedParameterHosts.has(host)
        || parameterMemberUses(host, paramIndex, referencesArguments(host))?.writesOnly)) kept.add(value);
      else if (outside || (defaultValue && readsBare.has(name))) escaped.add(value);
      else if ((!installed || observedInstalledTargets.has(name) || exportedCallableNames.has(name))
        && (readsBare.has(name) || readsThrough.has(name))) kept.add(value);
    }
    // a tag can name a component declared later in the file: the finished binding table decides
    // whether it reads a native global or a local value that pure may already have rewritten
    for (const node of jsxEscaped) {
      if (classifyRealmReference(node) !== 'proven') escaped.add(node);
    }
    // Builtin arguments still expose containers to mutation analysis (including enum keys).
    // Only their constructor-family obligation is suppressed; keep the same scoped walk.
    const builtinState = { names: new Set(), stamps: new Set(), state: { names: new Set(), roots: new Map(), slots: new Map() } };
    for (const node of builtinArguments) stampEscapesFrom(programNode, node, builtinState);
    for (const node of escaped) stampEscapesFrom(programNode, node);
    const jsxState = { names: new Set(), roots: new Map(), slots: new Map() };
    for (const node of jsxEscaped) {
      if (classifyRealmReference(node) === 'proven') stampEscapesFrom(programNode, node, { names: globalOnly, state: jsxState });
    }
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
    const heldState = { names: new Set(), roots: new Map(), slots: new Map() };
    collectHeldReceivers({
      programNode,
      memberReceivers,
      aliasInit,
      guardedAliases,
      heldState,
      heldInSlot,
      globalOnly,
      kept,
      hasOpaqueIteration,
      closedParameterHosts,
      referencesArguments,
      opaqueReads,
      restSources,
      restValues,
      keyNames: censusKeyNames,
    });
    for (const value of kept) stampEscapesFrom(programNode, value, { names: heldInSlot, state: heldState, heldInSlot: true });
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
// through it. Later values remain alternatives: an opaque replacement does not mutate a prior
// source, while writes and hand-outs through the alias still reach every known candidate.
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

// does the argument land in a DESTRUCTURING parameter whose whole value is read through named
// slots? inline callees let the pattern pairer own those slots; named callees also need an injection
// proof before narrowing. a REST or plain-identifier parameter holds the value, and an `arguments`
// reference anywhere under the callee reaches the whole argument past every pattern
function paramSelectsTheValue(callee, paramIndex, referencesArguments = referencesArgumentsObject(callee), branchKeys = false) {
  // a PARAMETER LIST distinguishes a resolved function value from an unresolved callee without
  // keeping another node-type list beside the function-value resolver
  if (!callee?.params) return false;
  const param = dropLeadingThisParam(callee.params)[paramIndex];
  const bound = param?.type === 'AssignmentPattern' ? param.left : param;
  return isDestructurePattern(bound) && patternNamesEverySlot(bound, branchKeys) && !referencesArguments;
}

// A missing parameter or a value discarded before its first read carries no constructor family.
// Parameter defaults and arguments can still expose it before the body starts.
function paramDropsTheValue(callee, paramIndex, referencesArguments = referencesArgumentsObject(callee)) {
  if (!callee?.body || referencesArguments) return false;
  const params = dropLeadingThisParam(callee.params ?? []);
  if (params.some((param, index) => index <= paramIndex && param.type === 'RestElement')) return false;
  const param = params[paramIndex];
  if (param === undefined) return !!callee.params;
  const bound = param?.type === 'AssignmentPattern' ? param.left : param;
  if (bound?.type !== 'Identifier'
    || params.some((other, index) => index !== paramIndex && identifierReferencedInSubtree(other, bound.name))) return false;
  // Only an unconditional leading overwrite can discard the incoming value. Keep evaluation
  // order explicit; the generic AST child order is not the order of assignments or call bodies.
  // Statement lists with declarations or control flow stay conservative, including hoisted closures.
  const pending = [callee.body];
  while (pending.length) {
    const node = unwrapRuntimeExpr(pending.pop());
    if (node?.type === 'ReturnStatement' || node?.type === 'ThrowStatement') return false;
    if (!identifierReferencedInSubtree(node, bound.name)) continue;
    switch (node.type) {
      case 'BlockStatement':
        if (node.body.some(stmt => stmt.type !== 'ExpressionStatement' && stmt.type !== 'ReturnStatement')) return false;
        pending.push(...node.body.toReversed());
        break;
      case 'ExpressionStatement':
        pending.push(node.expression);
        break;
      case 'SequenceExpression':
        pending.push(...node.expressions.toReversed());
        break;
      case 'AssignmentExpression': {
        if (node.operator !== '=') return false;
        const left = unwrapRuntimeExpr(node.left);
        if (left.type === 'Identifier' && left.name === bound.name) {
          return !identifierReferencedInSubtree(node.right, bound.name);
        }
        if (!isMemberAccessNode(left)) return false;
        pending.push(node.right, left);
        break;
      }
      case 'MemberExpression': case 'OptionalMemberExpression':
        if (spineHasOptionalHop(node)) return false;
        if (node.computed) pending.push(node.property);
        pending.push(node.object);
        break;
      case 'UpdateExpression': pending.push(node.argument); break;
      case 'CallExpression': {
        if (node.optional || node.arguments.length) return false;
        const invoked = unwrapRuntimeExpr(node.callee);
        if (!FUNCTION_LIKE_NODE_TYPES.has(invoked?.type) || invoked.params.length
          || invoked.async || invoked.generator || invoked.id?.name === bound.name) return false;
        pending.push(invoked.body);
        break;
      }
      default: return false;
    }
  }
  return true;
}

// Named member reads and writes keep the receiver local. Record its read keys separately:
// writes still owe mutation tracking, while reads need a proven source before the family can
// narrow. Mixed reads/writes, unknown keys, other defaults referencing it and closures stay opaque.
// A retained-return summary additionally admits decoded mutators and records stores in order.
// eslint-disable-next-line max-statements -- read census and definite stores share the parameter-use proof
function parameterMemberUses(callee, paramIndex, referencesArguments, collectReads = false, collectWrites = false, writeContext = null) {
  if (!callee?.body || referencesArguments) return null;
  const params = dropLeadingThisParam(callee.params ?? []);
  if (params.some((param, index) => index <= paramIndex && param.type === 'RestElement')) return null;
  const bound = patternSlotTarget(params[paramIndex]);
  if (bound?.type !== 'Identifier'
    || params.some((param, index) => index !== paramIndex && identifierReferencedInSubtree(param, bound.name))) return null;
  // A kept call on an own object can prove its direct writes. This summary assumes a
  // truthy parameter, accepts no deferred work or unrelated effects, and keeps all writes.
  if (collectWrites && (callee.async || callee.generator || params.some(param => param.type !== 'Identifier'))) return null;
  const pending = [{ node: callee.body }];
  let written = false;
  const readKeys = new Set();
  const writes = collectWrites ? [] : null;
  while (pending.length) {
    const { node: raw, parent, grandparent } = pending.pop();
    const node = unwrapRuntimeExpr(raw);
    if (collectWrites) {
      if (node.type === 'BlockStatement' || node.type === 'ExpressionStatement') {
        for (const child of node.type === 'BlockStatement' ? node.body.toReversed() : [node.expression]) pending.push({ node: child });
        continue;
      }
      if (writeContext && node.type === 'VariableDeclaration' && writeContext.aliasDeclaration(node)) continue;
      if (node.type === 'IfStatement' && unwrapRuntimeExpr(node.test)?.type === 'Identifier'
        && unwrapRuntimeExpr(node.test).name === bound.name) {
        pending.push({ node: node.consequent });
        continue;
      }
      if (node.type === 'ReturnStatement') {
        const returned = unwrapRuntimeExpr(node.argument);
        if (node !== callee.body.body?.at(-1) || (writeContext
          ? returned?.type !== 'Identifier' || returned.name !== bound.name
          : node.argument && !isQuietLiteralOperand(node.argument))) return null;
        continue;
      }
      if (writeContext && node.type === 'CallExpression') {
        const entries = writeContext.callWrites(node);
        if (!entries || entries.some(entry => unwrapRuntimeExpr(entry.targetNode)?.type !== 'Identifier'
          || unwrapRuntimeExpr(entry.targetNode).name !== bound.name
          || entry.value.type !== 'Identifier' || params.some(param => param.name === entry.value.name))) return null;
        for (const entry of entries) writes.push({ ...entry, node });
        written = true;
        continue;
      }
      if (node.type === 'EmptyStatement' || isQuietLiteralOperand(node)) continue;
      if (node.type !== 'AssignmentExpression') return null;
    }
    if (!identifierReferencedInSubtree(node, bound.name)) {
      if (collectWrites) return null;
      continue;
    }
    if (node.type === 'AssignmentExpression' && node.operator === '=') {
      const target = unwrapRuntimeExpr(node.left);
      const receiver = isMemberAccessNode(target) && unwrapRuntimeExpr(target.object);
      const key = receiver && (memberKeyName(target) ?? (target.computed ? computedKeyStaticName(target.property) : null));
      if (receiver?.type === 'Identifier' && receiver.name === bound.name && key !== null
        && !spineHasOptionalHop(target) && !identifierReferencedInSubtree(node.right, bound.name)
        && (!target.computed || !identifierReferencedInSubtree(target.property, bound.name))) {
        if (collectWrites) {
          const value = unwrapRuntimeExpr(node.right);
          if (value?.type !== 'Identifier' || params.some(param => param.name === value.name)
            || target.computed && !isQuietLiteralOperand(target.property)) return null;
          writes.push({ key, node, value });
        }
        written = true;
        continue;
      }
    }
    if (isMemberAccessNode(node) && unwrapRuntimeExpr(node.object)?.type === 'Identifier'
      && unwrapRuntimeExpr(node.object).name === bound.name) {
      if (!collectReads || isMemberMutationContext(raw, parent, grandparent)) return null;
      const key = node.computed ? computedKeyStaticName(node.property) : memberKeyName(node);
      if (key === null || node.computed && identifierReferencedInSubtree(node.property, bound.name)) return null;
      readKeys.add(key);
      continue;
    }
    // A bare condition observes truthiness without exposing or replacing the parameter.
    if (node.type === 'Identifier' && parent?.type === 'IfStatement'
      && unwrapRuntimeExpr(parent.test) === node) continue;
    if (node.type === 'Identifier' || isLocalCallableValue(node)) return null;
    walkAstChildren(node, child => pending.push({ node: child, parent: node, grandparent: parent }));
  }
  return written && readKeys.size ? null : { writesOnly: written, readKeys, ...collectWrites ? { writes } : {} };
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

// the ONE construct a name stands on from a scope chain: the binding that chain reaches, among the
// bindings of the name this file records - two functions of one name in separate scopes answer
// separately, and a name bound or assigned twice in the scope the chain reaches answers nothing.
// without facts the chain is unknown and only a single binding of the name may answer
function localCallableOf(name, scopes, localCallables, scopeFacts) {
  const entries = localCallables.get(name);
  if (!entries) return null;
  const owner = scopeFacts ? scopeFacts.declarations.resolve(name, scopes ?? []) : undefined;
  let found = null;
  for (const entry of entries) {
    const at = entry.scope !== undefined ? entry.scope : scopeFacts?.declarations.resolve(name, entry.scopes);
    if (scopeFacts && at !== owner) continue;
    if (found !== null) return null;
    found = entry.value;
  }
  return found;
}

// the function ONE member write installs under a function or class owner's key, or null
function ownerMethodWrite(owner, member, scopeFacts) {
  const scopes = scopeFacts.referenceScopes.get(owner) ?? [];
  const values = aliasEntriesInScope(scopeFacts.aliases.get(owner.name) ?? [], scopes);
  const container = values.length === 1 ? unwrapRuntimeExpr(values[0].value) : null;
  if (!FUNCTION_LIKE_NODE_TYPES.has(container?.type) && !CLASS_NODE_TYPES.has(container?.type)) return null;
  const key = memberKeyName(member);
  // ... through any name of the owner's alias class
  const names = aliasWriteNames(scopeFacts.written, aliasBindingKey(scopeFacts.aliases, owner.name, scopes), owner.name);
  const writes = key === null ? [] : names.flatMap(name => writtenSlotValues(scopeFacts.written, name, JSON.stringify([key])));
  const installed = writes.length === 1 ? unwrapRuntimeExpr(installedWriteValue(writes[0])) : null;
  return FUNCTION_LIKE_NODE_TYPES.has(installed?.type) ? installed : null;
}

// Resolve a local callee through scoped aliases and fixed object methods. Cache each suffix,
// including refusals, while keeping each member's selected value in its own owner's scope. every
// question about the owner of a method is asked of the BINDING the owner resolves to, never of the
// name: a namesake in another scope opens nothing here, and a shadow without values owns no method
function calleeFunctionOf(calleeNode, localCallables, scopeFacts = null) {
  let cur = peelCalleeValue(calleeNode);
  if (scopeFacts?.calleeValues.has(cur)) return scopeFacts.calleeValues.get(cur);
  if (FUNCTION_LIKE_NODE_TYPES.has(cur?.type)) return cur;
  if (cur?.type !== 'Identifier' && cur?.type !== 'Super' && !isMemberAccessNode(cur)) {
    return CLASS_NODE_TYPES.has(cur?.type) ? classConstructorFunction(cur) : null;
  }
  const seen = new Map();
  function finish(callee) {
    for (const [node, memberValue] of seen) {
      scopeFacts?.calleeValues.set(node, callee);
      if (callee && memberValue) LOCAL_MEMBER_CALLEES.set(node, memberValue);
      else LOCAL_MEMBER_CALLEES.delete(node);
    }
    return callee;
  }
  if (cur?.type === 'Super') {
    const owner = scopeFacts?.referenceScopes.get(cur)?.findLast(scope => CLASS_NODE_TYPES.has(scope.type));
    if (!owner || !owner.id || scopeFacts.nonCalleeNameUses.has(owner.id.name) || scopeFacts.writtenCallOwners.has(owner.id.name)
      || localCallableOf(owner.id.name, scopeFacts.referenceScopes.get(cur), localCallables, scopeFacts) !== owner) return finish(null);
    cur = peelCalleeValue(owner.superClass);
  }
  while (cur?.type === 'Identifier' || isMemberAccessNode(cur)) {
    if (scopeFacts?.calleeValues.has(cur)) return finish(scopeFacts.calleeValues.get(cur));
    if (seen.has(cur)) return finish(null);
    seen.set(cur, null);
    if (cur.type === 'Identifier') {
      if (!localCallables.has(cur.name)) return finish(null);
      const scopes = scopeFacts?.referenceScopes.get(cur) ?? [];
      if (scopeFacts && !scopeFacts.declarations.declares(cur.name, scopes)) return finish(null);
      cur = peelCalleeValue(localCallableOf(cur.name, scopes, localCallables, scopeFacts));
      continue;
    }
    const owner = unwrapRuntimeExpr(cur.object);
    if (owner?.type !== 'Identifier' || !localCallables.has(owner.name) || !scopeFacts) return finish(null);
    // the BINDING the owner spells, never its name: a namesake read bare, written or destructured
    // in another scope says nothing about this literal, and a binding without values (a parameter
    // shadowing the literal) owns no entry, so the read resolves to no method at all
    const ownerScopes = scopeFacts.referenceScopes.get(owner) ?? [];
    const binding = scopeFacts.declarations.resolve(owner.name, ownerScopes);
    // a FUNCTION or class owner holds no literal slot, but ONE write installing a function under the
    // key (`function Holder() {} Holder.make = function () {}`) is the method the read names, where
    // nothing but member writes opens the owner
    const methodWrite = binding && scopeFacts.openedOnlyByWrites?.(owner.name, binding) ? ownerMethodWrite(owner, cur, scopeFacts) : null;
    if (methodWrite) {
      seen.set(cur, methodWrite);
      cur = methodWrite;
      continue;
    }
    if (!binding || scopeFacts.openedBinding(owner.name, binding)) return finish(null);
    const values = aliasEntriesInScope(scopeFacts.aliases.get(owner.name) ?? [], ownerScopes, binding);
    const container = values.length === 1 ? unwrapRuntimeExpr(values[0].value) : null;
    if (container?.type !== 'ObjectExpression') return finish(null);
    // Any use of this can release or replace a method through its owning object, even when
    // the container's identifier occurs only in calls. Such a receiver has no fixed callee.
    let readsThis = scopeFacts.containerThis.get(container);
    if (readsThis === undefined) {
      readsThis = false;
      walkAstNodes({ root: container, visit(node) {
        if (node.type === 'ThisExpression') readsThis = true;
        return !readsThis;
      } });
      scopeFacts.containerThis.set(container, readsThis);
    }
    if (readsThis) return finish(null);
    const key = memberKeyName(cur);
    if (key === null) return finish(null);
    const slot = findObjectKeyBeforeSpread(container.properties, prop => {
      const name = foldedPropertyKeyName(prop);
      return name === key || name === null;
    });
    if (!slot || foldedPropertyKeyName(slot) !== key || slot.kind === 'get' || slot.kind === 'set') return finish(null);
    const member = cur;
    [cur] = memberSlotValues(slot);
    seen.set(member, cur);
  }
  if (FUNCTION_LIKE_NODE_TYPES.has(cur?.type)) {
    return finish(cur);
  }
  // a `new C(...)` runs the class's CONSTRUCTOR, so that is the body its result comes from
  return finish(CLASS_NODE_TYPES.has(cur?.type) ? classConstructorFunction(cur) : null);
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

// Closed callers contribute their own per-key claims, independently of the parameter default.
// Open callees can only discharge an argument through an exact default claim. A closed object-rest
// copy of a known constructor reads none of its non-enumerable standard statics. Other rest sources,
// bare captures and arguments-object reads keep the family. Pure may still retain the receiver.
function parameterStaticsCoverArgument(callee, index, argument, scopeFacts) {
  const parameter = dropLeadingThisParam(callee.params)[index];
  const pattern = patternSlotTarget(parameter);
  const closed = scopeFacts.closedParameterHosts.has(callee);
  const defaultSource = parameter.type === 'AssignmentPattern' ? parameter.right : null;
  const defaultPairs = closed ? [] : [...patternDefaultPairs(parameter)];
  const pairingOptions = { includeDefaults: false, followIifeReturns: true };
  const argumentsValues = aliasedValues(scopeFacts.aliases, argument, new Set());
  // The receiver may be spelled directly, through a local alias, or off a proxy global.
  // The node-only proxy canon names the latter; census scopes prove that its root is unshadowed.
  function staticClaim(value, rest = false) {
    const member = unwrapRuntimeExpr(value);
    if (!rest && !isMemberAccessNode(member)) return null;
    const key = rest ? null : staticMemberKeyName(member);
    const source = peelIifeReturnTarget(installedWriteValue(rest ? member : member.object));
    const receivers = aliasedValues(scopeFacts.aliases, source, new Set());
    const receiver = receivers.length === 1 ? receivers[0] : null;
    const root = peelIifeReturnTarget(runtimeChainRoot(receiver));
    if (root?.type !== 'Identifier'
      || scopeFacts.declarations.declares(root.name, scopeFacts.referenceScopes.get(root) ?? [])) return null;
    const object = receiver.type === 'Identifier' ? receiver.name : globalProxyMemberName({ node: receiver });
    if (rest) return staticReceiverHint('static', object) === 'function' ? object : null;
    return object && key !== null && hasOwnStaticDefinition(object, key) ? `${ object }.${ key }` : null;
  }
  let covered = true;
  let seen = false;
  walkPatternIdentifiers(pattern, ({ name }) => {
    if (!covered) return;
    const restSources = [];
    const supplied = [];
    for (const value of argumentsValues) {
      const before = supplied.length + restSources.length;
      supplied.push(...patternSlotValues(pattern, value, name, {
        ...pairingOptions, restSources, pairedSources: source => pairedSources(scopeFacts.aliases, source, new Set()),
      }));
      if (supplied.length + restSources.length === before || patternSlotSpreadShifted(pattern, value, name, pairingOptions)) {
        covered = false;
        return;
      }
    }
    if (closed && restSources.length && restSources.every(value => staticClaim(value, true))) {
      seen = true;
      return;
    }
    if (!supplied.length || restSources.length) {
      covered = false;
      return;
    }
    const defaults = closed ? [] : patternSlotValues(pattern, defaultSource, name);
    for (const { left, right } of defaultPairs) defaults.push(...patternSlotValues(left, right, name));
    const owned = new Set(defaults.map(value => staticClaim(value)).filter(Boolean));
    for (const value of supplied) {
      const claim = staticClaim(value);
      if (!claim || !closed && !owned.has(claim)) {
        covered = false;
        return;
      }
    }
    seen = true;
  });
  return seen && covered;
}

// HOW the callee keeps the argument at this position with the file that spelled it, where it does.
// the two answers are not interchangeable: a value the pattern BINDS reaches only the slots the
// pattern names, and the call returns whatever the body picked out of them; a value the callee
// RETURNS is the call's own value, so the call carries the escape question the argument raised.
// the callee is the one the call stands on - spelled inline, or named among this file's functions.
// An unexpanded spread at or before the paired slot leaves its position unknown.
function argumentKeptBy({ pairing, index, scopeFacts, factCache, callee, referencesArguments }) {
  const { args } = pairing;
  if (args.some((argument, at) => at <= index && argument?.type === 'SpreadElement')) return null;
  const spelled = peelCalleeValue(pairing.callee);
  const named = spelled?.type === 'Identifier';
  let facts = factCache.get(callee);
  let disposition = 'none';
  if (callee) {
    if (!facts) factCache.set(callee, facts = { parameters: new Map(), yielded: undefined });
    const byIndex = facts.parameters;
    disposition = byIndex.get(index);
    if (disposition === undefined) {
      const referencesArgs = referencesArguments(callee);
      const collectReads = scopeFacts.closedParameterHosts.has(callee);
      let members;
      disposition = paramReturnsTheValue(callee, index, referencesArgs) ? 'returned'
        : paramDropsTheValue(callee, index, referencesArgs) ? 'dropped'
        : (members = parameterMemberUses(callee, index, referencesArgs, collectReads))?.writesOnly ? 'global-covered'
        : members?.readKeys.size ? members
        : paramSelectsTheValue(callee, index, referencesArgs) ? 'selected'
        : paramSelectsTheValue(callee, index, referencesArgs, true) ? 'branch-selected'
        : 'none';
      if (collectReads && (typeof disposition === 'object' || disposition === 'selected')) {
        const source = parameterStaticSource(scopeFacts.parameterCallSites.get(callee), index, argument => {
          return argument.type === 'Identifier' && isStaticPlacement(argument.name) && !scopeFacts.writtenCallOwners.has(argument.name)
            && !scopeFacts.declarations.declares(argument.name, scopeFacts.referenceScopes.get(argument) ?? []) ? argument.name : null;
        });
        const keys = typeof disposition === 'object' ? [...disposition.readKeys]
          : patternSlotTarget(dropLeadingThisParam(callee.params)[index]).properties?.map(foldedPropertyKeyName);
        if (source && keys?.length && keys.every(key => hasOwnStaticDefinition(source, key))) {
          PARAMETER_STATIC_SOURCES.set(dropLeadingThisParam(callee.params)[index], source);
          disposition = 'bound';
        } else if (typeof disposition === 'object' && keys?.length) {
          // A closed read-only parameter owes only these keys to global injection. Keep
          // pure's namespace obligation until its scoped receiver proof succeeds.
          PARAMETER_STATIC_SOURCES.set(dropLeadingThisParam(callee.params)[index], { keys });
          disposition = 'global-covered';
        }
      }
      byIndex.set(index, disposition);
    }
  }
  if (disposition === 'global-covered') return disposition;
  if (!isMemberAccessNode(spelled) && spelled?.type !== 'Super'
    && (disposition === 'returned' || disposition === 'dropped' || disposition === 'bound')) return disposition;
  // Every supplied value of a closed synchronous callee is already paired with its bindings.
  // Body handouts, writes and returned values therefore escape at their actual consumers.
  // Keep pure's retained-value obligation; global serves named reads through census candidates.
  const closed = scopeFacts.closedParameterHosts.has(callee) && !callee.async && !callee.generator
    && dropLeadingThisParam(callee.params).every(param => patternNamesEverySlot(param));
  if (disposition === 'none' && scopeFacts.closedParameterHosts.has(callee) && !referencesArguments(callee)
    && isDestructurePattern(patternSlotTarget(dropLeadingThisParam(callee.params)[index]))
    && parameterStaticsCoverArgument(callee, index, args[index], scopeFacts)) return 'global-covered';
  if (isMemberAccessNode(spelled) || spelled?.type === 'Super') return closed ? 'global-covered' : null;
  // Global enumerates a finite computed-key selection at the inline argument. Pure retains
  // the native pattern there, so the supplied constructor must still carry its statics.
  if (disposition === 'branch-selected') {
    const argument = unwrapRuntimeExpr(args[index]);
    const pattern = patternSlotTarget(dropLeadingThisParam(callee.params)[index]);
    const covered = !named && argument?.type === 'Identifier' && pattern?.type === 'ObjectPattern'
      && !scopeFacts.declarations.declares(argument.name, scopeFacts.referenceScopes.get(argument) ?? [])
      && pattern.properties.every(prop => patternSlotTarget(prop.value)?.type === 'Identifier'
        && (prop.computed ? flattenBranchKeys(prop.key, undefined, { requireComplete: true }) : [foldedPropertyKeyName(prop)])
          ?.every(key => hasOwnStaticDefinition(argument.name, key)));
    return covered || closed ? 'global-covered' : null;
  }
  // ... and the argument a callee only puts in a CONTAINER it yields: the call's value holds it, and
  // a read through that value lands on the argument by the same recognizer on the receiver side, so
  // nothing is narrowed that cannot then be resolved - a slot no read can name hands the container
  // out whole through the opaque-read channel. spelled inline or reached by name alike: the slot is
  // filled per CALL, and this call's slot holds this call's argument
  // The body is immutable during this census. Its returned slots are one fact per
  // callee, shared by every argument and call, including a rejected container.
  if (facts && facts.yielded === undefined) facts.yielded = calleeYieldedContainer(callee, { unwrap: unwrapRuntimeExpr });
  const yielded = facts?.yielded;
  if (yielded?.confined.has(index) && yielded.slots.some(([, at]) => at === index)) return 'bound';
  // A member read without the closed-source proof above still needs the family. A yielded
  // container only discharges parameters occurring in its literal slots.
  if (disposition !== 'selected') return closed ? 'global-covered' : null;
  if (named && parameterStaticsCoverArgument(callee, index, args[index], scopeFacts)) return 'global-covered';
  // a named callee's supplied slot may be ineligible for argument synthesis. keep its independent
  // family obligation unless the static claims above already cover the global read
  return named ? closed ? 'global-covered' : 'held' : 'bound';
}

// does this pattern NAME every slot it reads? a computed key the census cannot fold reads a slot
// nothing here can name, and a REST element takes every own property in one binding - either way the
// value is read past what the pairing resolves, so the pattern stops standing for the whole of it
function patternNamesEverySlot(pattern, branchKeys = false) {
  const work = [pattern];
  while (work.length) {
    const current = work.pop();
    switch (current?.type) {
      // a REST element carries no key to fold, so the same read answers for it: it binds every own
      // property the pattern did not name, which is the whole of the value all over again
      case 'ObjectPattern':
        for (const property of current.properties) {
          if (foldedPropertyKeyName(property) === null
            && !(branchKeys && property.computed
              && flattenBranchKeys(property.key, undefined, { requireComplete: true })?.length)) return false;
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

// A stable number per scope node within one census table, independent of source positions.
function scopeId(scopeIds, scope) {
  if (!scopeIds.has(scope)) scopeIds.set(scope, scopeIds.size);
  return scopeIds.get(scope);
}

// the record keys are DECLARATION-qualified names (`r#3`): a name spelled in a scope chain resolves
// to the innermost declaration the chain reaches, so records and containers pair by binding, never
// by spelling alone. `containers` maps each qualified container to its literals; `containerSlotIndex`
// is the reader's map from a declaring node (or a bare name, as the union of its declarations) to
// the key. Source positions preserve declaration identity through clones and rebuilt regions;
// synthesized declarations without a source span use their node identity. The index is file-local.
function buildContainerIndex(declared, containerDeclarations, unrootedKeys) {
  const scopeIds = new Map([[null, 0]]);
  // the declaration key a name resolves to in a scope chain, or null for an undeclared (global) name
  function qualify(name, scopes) {
    const scope = declared.resolve(name, scopes);
    return scope === undefined ? null : `${ name }#${ scopeId(scopeIds, scope) }`;
  }
  const containers = new Map();
  const containerSlotIndex = {
    owners: new Map(), byName: new Map(), writes: new Map(), aliasedWrites: new WeakSet(), escapes: new Map(),
    unrootedKeys,
  };
  for (const declaration of containerDeclarations) {
    // An assignment installs its literal on the existing binding, even when the write runs in
    // another block or closure. The literal's own captures still belong to that write's scope.
    const key = declaration.node ? `${ declaration.name }#${ scopeId(scopeIds, declaration.scope) }`
      : qualify(declaration.name, declaration.scopes);
    if (!key) continue;
    let entry = containers.get(key);
    if (!entry) {
      entry = { name: declaration.name, literals: [], arrayLiteral: false, container: false };
      containers.set(key, entry);
    }
    entry.literals.push({ literal: declaration.literal, scopes: declaration.scopes });
    if (declaration.arrayLiteral) entry.arrayLiteral = true;
    else entry.container = true;
    if (declaration.node) containerSlotIndex.owners.set(nodePositionKey(declaration.node) ?? declaration.node, key);
    // ... and a CLASS a declarator binds is that container under its own node too: the class's inner
    // name enters it there
    if (declaration.literal?.type === 'ClassExpression' && declaration.literal !== declaration.node) {
      containerSlotIndex.owners.set(nodePositionKey(declaration.literal) ?? declaration.literal, key);
    }
    let keys = containerSlotIndex.byName.get(declaration.name);
    if (!keys) containerSlotIndex.byName.set(declaration.name, keys = []);
    if (!keys.includes(key)) keys.push(key);
  }
  return { qualify, containers, containerSlotIndex };
}

// `qualify` resolves a name in its scope chain to its declaration key: the alias and its target
// root are both keyed that way, so an alias declared in one function never stands for a target
// declared in another under the same spelling
function publishPlainAliases(aliasValues, recordEscaped, qualify, containers) {
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
    // reaches both containers instead of neither. An opaque value stays under the name itself;
    // it does not invalidate earlier sources. Actual writes still reach every known candidate.
    // Member captures beside opaque values may form expanding cycles through wrapper slots.
    // An own literal path terminates in the source tree, so retaining that capture cannot
    // introduce such a cycle. Other member paths retain the existing slot invalidation.
    const opaque = values.some(item => item.target ? !qualify(item.target.root, item.scopes)
      : !CENSUS_CONTAINER_TYPES.has(unwrapRuntimeExpr(item.rawValue)?.type));
    if (opaque && values.some(item => {
      if (!item.target?.keys.length) return false;
      const root = qualify(item.target.root, item.scopes);
      const literals = containers.get(root)?.literals;
      if (!literals?.length || grouped.get(root)?.some(value => value.target)) return true;
      return literals.some(({ literal, scopes }) => {
        if (literalIdentifierSlots(literal).some(([, name]) => qualify(name, scopes))) return true;
        let current = literal;
        for (const part of item.target.keys) {
          if (literalHasUnnameableSlot(current)) return true;
          const slots = containerSlotValues(current, part);
          current = slots.length === 1 ? unwrapRuntimeExpr(slots[0]) : null;
          if (current?.type !== 'ObjectExpression' && current?.type !== 'ArrayExpression') return true;
        }
        return false;
      });
    })) {
      for (const item of values) if (item.target) recordEscaped([item.rawValue], item.scopes);
      continue;
    }
    const targets = values.map(item => {
      const root = item.target && qualify(item.target.root, item.scopes);
      // A literal or opaque value is owned by this binding; a global names no local container.
      return root ? { root, keys: item.target.keys } : { root: key, keys: [] };
    });
    // An own value alone needs no alias entry; the path resolver already leaves its name intact.
    if (targets.some(target => target.root !== key || target.keys.length)) plainAliases.set(key, targets);
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
// that may redefine one, an accessor whose value is a call, or a `__proto__:` prototype whose keys it
// inherits? a pattern pairing against it folds nothing, so a read through it lands on a slot only
// the runtime knows
function literalHasUnnameableSlot(literal) {
  if (literal?.type === 'ArrayExpression') return literal.elements.some(element => element?.type === 'SpreadElement');
  if (literal?.type !== 'ObjectExpression') return false;
  return literal.properties.some(prop => prop.type === 'SpreadElement'
    || prop.kind === 'get' || prop.kind === 'set'
    || foldedPropertyKeyName(prop) === null) || !!objectLiteralPrototypeValue(literal, true);
}

// writes and escapes recorded against a WRAPPER reach the containers its slots hold by name
// (`const box = [r]; box[0].w = X` replaces `r.w`; `f(box)` hands `r` out too): every record under a
// wrapper slot re-homes onto the held container's own path, to a fixpoint through nested wrappers.
// a record ON the slot itself (`box[0] = other`) replaces the wrapper's slot and touches nothing inside
function propagateWrapperWrites(writtenContainerSlots, containers, writtenSlot, qualify, plainAliases, slotPathMemo, index) {
  for (let round = 0; round < ALIAS_CHAIN_DEPTH; round++) {
    let grew = false;
    for (const [name, { literals }] of containers) {
      for (const { literal, scopes } of literals) {
        for (const [keyPath, innerName] of literalIdentifierSlots(literal)) {
          // A held alias names its original container and path, in this literal's capture scope.
          const held = qualify(innerName, scopes);
          if (!held) continue;
          for (const [inner, innerKeys] of canonicalSlotPaths(plainAliases, held, [], slotPathMemo)) {
            grew = (containers.get(inner)?.container
              && rehomeWrapperRecords({ writtenContainerSlots, writtenSlot, name, keyPath, inner, innerKeys, index })) || grew;
          }
        }
      }
    }
    if (!grew) return;
  }
}

// the records under ONE wrapper slot, re-homed onto the container it holds; true when one landed
function rehomeWrapperRecords({ writtenContainerSlots, writtenSlot, name, keyPath, inner, innerKeys, index }) {
  const prefix = `${ [name, ...keyPath].join('.') }.`;
  const wildcards = new Set(keyPath.map((key, at) => `${ [name, ...keyPath.slice(0, at)].join('.') }.*`));
  let grew = false;
  const records = Array.from(writtenContainerSlots);
  for (const [record, values] of records) {
    const target = wildcards.has(record) || innerKeys === null && record.startsWith(prefix)
      ? [inner, ...innerKeys ?? [], '*'].join('.')
      : record.startsWith(prefix) ? [inner, ...innerKeys, record.slice(prefix.length)].join('.') : null;
    if (!target) continue;
    const existed = writtenContainerSlots.has(target);
    const sink = writtenSlot(target);
    const added = values.filter(value => !sink.includes(value));
    if (!existed || added.length) grew = true;
    sink.push(...added);
    if (!target.endsWith('.*')) for (const write of index.writes.get(record) ?? []) {
      if (index.writes.get(target)?.includes(write)) continue;
      writtenSlot(target, write);
      index.aliasedWrites.add(write);
      grew = true;
    }
  }
  return grew;
}

// the aliased paths a name stands for, followed through alias-of-alias chains; a name that is no
// plain alias answers for itself. a SELECTING alias stands for every arm at once, so the walk carries
// a FRONTIER rather than one path - a single-root alias is that frontier at width one. the depth
// bound doubles as the cycle guard (`const a = b; const b = a`), and the width bound keeps a chain of
// selections from squaring. A limit leaves unresolved roots: every container reachable from them
// is invalidated whole (`null` path), since retaining only the last alias would miss a write that
// still reaches its source. This fallback visits each root once and never expands key paths.
function canonicalSlotPaths(plainAliases, name, keys, memo) {
  // The common case is a direct container binding. Without an alias there is no frontier to
  // expand or deduplicate; doing that work for every write in a large bundle dominated census
  // publication despite always returning the input unchanged.
  if (!plainAliases.has(name)) {
    return [[name, keys]];
  }
  const direct = plainAliases.get(name);
  if (direct.length === 1 && direct[0].root === name && direct[0].keys.length === 0) {
    return [[name, keys, true]];
  }
  const cached = memo.get(name);
  if (cached) return keys.length ? cached.map(([root, path, terminal]) => [
    root, path && [...path, ...keys], terminal,
  ]) : cached;
  // Alias edges only prepend their own keys. Resolve that prefix once per root name; every
  // concrete write suffix can then be appended without walking the same graph again.
  // Keep the deduplication keys between rounds: settled paths move unchanged while the other
  // branches expand. Converting to an array here made each round serialize those paths again.
  // Nonterminal entries use the same tuple from the first round, so the visited set can reuse
  // the frontier key instead of serializing each root and path a second time.
  let frontier = new Map([[JSON.stringify([name, [], false]), [name, [], false]]]);
  const expanded = new Set();
  const overflow = new Set();
  for (let depth = 0; depth < ALIAS_CHAIN_DEPTH; depth++) {
    const next = new Map();
    function append(entry, identity = JSON.stringify(entry)) {
      if (next.has(identity)) return;
      // The limit is on the resulting frontier, including terminal arms. Merely checking before
      // an alias expansion let settled arms accumulate far past the bound on linked structures.
      // An overflowed root is invalidated whole below, the conservative fallback promised here.
      if (next.size < ALIAS_FRONTIER_WIDTH) next.set(identity, entry);
      else overflow.add(entry[0]);
    }
    let followed = false;
    for (const [key, entry] of frontier) {
      const [root, path, terminal] = entry;
      const targets = plainAliases.get(root);
      if (terminal || !targets) {
        append(entry, key);
        continue;
      }
      if (expanded.has(key)) continue;
      expanded.add(key);
      followed = true;
      // a self target denotes the literal this name owns, not another alias hop. Settle that arm
      // while the other arms continue, or a literal-plus-alias binding would chase itself forever.
      for (const target of targets) append([target.root, [...target.keys, ...path], target.root === root && !target.keys.length]);
    }
    // Crossing aliases can reach the same slot by several paths. One candidate is sufficient;
    // counting it again at every round would grow a cycle into the width limit.
    frontier = next;
    if (!followed) break;
  }
  const resolved = frontier.values().toArray();
  const unresolved = new Set([
    ...overflow,
    ...resolved.filter(([root, , terminal]) => !terminal && plainAliases.has(root)).map(([root]) => root),
  ]);
  for (const root of unresolved) {
    for (const target of plainAliases.get(root) ?? []) unresolved.add(target.root);
  }
  // A whole-root fallback subsumes its concrete paths. Keeping both lets a wrapper cycle
  // prepend those redundant prefixes again on every propagation round, exhausting memory.
  const result = [...resolved.filter(([root]) => !unresolved.has(root)), ...unresolved.values().map(root => [root, null])];
  memo.set(name, result);
  return keys.length ? result.map(([root, path, terminal]) => [
    root, path && [...path, ...keys], terminal,
  ]) : result;
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
  const closureMemo = new Map();
  // the parameters a function DEFAULTS: the one value a parameter holds that its function spells.
  // what the calls pass is not followed - a patch routed through an argument (`install(Array)`) is
  // past the static spellings this census covers
  const defaultedParams = [];
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
  const selectedWrites = new WeakSet();
  const rawUnrootedKeys = new Set();
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
  function recordSlotWrite(name, keys, value = null, scopes = currentScopes, write = null, escape = null) {
    rawSlotWrites.push([name, keys, value, scopes, write, escape]);
  }
  // a repositioning invocation's record, stamped the same way
  function recordRepositioned(name, values) {
    rawRepositioned.push([name, values, currentScopes]);
  }
  // scopes declaring each name (null for the module scope). Repeated declarations in one scope
  // have the same identity here; declarator and literal identities live in containerDeclarations.
  // Membership must not scan all same-named declarations on every lookup in a large bundle.
  const declared = createDeclaredNameIndex();
  // one declaration of `name`: in the innermost scope of the current chain unless the caller names it
  function declare(name, scope = declarationScopeIn(null, currentScopes)) {
    declared.recordName(name, scope);
  }
  const containerDeclarations = [];
  // class EXPRESSION -> the outer name a declarator binds it to (`const K5 = class K4 {}`)
  const classOuterNames = new WeakMap();
  // bindings of a NAMED call, filed once the escape census has resolved the callee: the container
  // the callee yields is the binding's, exactly as an inline call's is (`recordValueSource`)
  const pendingCallContainers = [];
  const pendingCallPatterns = [];
  // a container declaration: the literal (or class) a name is bound to, and whether it is an ARRAY
  // literal - inert as data until a mutator installs a built-in, a container otherwise
  function declareContainer(name, node, literal, { arrayLiteral = false, kind = null, scopes = currentScopes } = {}) {
    containerDeclarations.push({
      name, scope: declarationScopeIn(kind, scopes), scopes, node, literal, arrayLiteral,
    });
  }
  // ... and the LITERAL a name is bound to, filed by the one rule every spelling of the binding
  // shares: an array literal files the inert entry (a mutator may install a built-in into it later)
  // and is a container outright once a slot could hold a built-in; an object or class literal always
  // is one. the inline init, the literal an inline call yields and the one a named call yields file here
  function declareContainerLiteral(name, node, literal, { kind = null, scopes = currentScopes } = {}) {
    const array = literal.type === 'ArrayExpression';
    if (array) declareContainer(name, node, literal, { arrayLiteral: true, kind, scopes });
    if (!array || literal.elements.some(canHoldBuiltIn)) declareContainer(name, node, literal, { kind, scopes });
  }
  // the bindings a node DECLARES: a parameter in the scope the function opens, a catch parameter
  // in its clause's, a function / class / import name in the scope around it (a class is a
  // container of statics too)
  function declareOwnBindings(node) {
    if (FUNCTION_LIKE_NODE_TYPES.has(node.type)) {
      for (const param of node.params ?? []) walkPatternIdentifiers(param, id => declare(id.name, node));
    } else if (node.type === 'CatchClause' && node.param) {
      walkPatternIdentifiers(node.param, id => declare(id.name, node));
    } else if (node.type === 'ImportDeclaration') {
      for (const specifier of node.specifiers ?? []) {
        if (!specifier.local?.name) continue;
        importBound.add(specifier.local.name);
        declare(specifier.local.name);
      }
    }
    if (node.id?.type !== 'Identifier') return;
    // a class binds its name as a container of its statics
    function bindClassContainer(options) {
      let nodes = containerBound.get(node.id.name);
      if (!nodes) containerBound.set(node.id.name, nodes = []);
      nodes.push(node);
      declareContainer(node.id.name, node, node, options);
    }
    switch (node.type) {
      case 'FunctionDeclaration':
        functionBound.add(node.id.name);
        declare(node.id.name);
        break;
      case 'ClassDeclaration':
        declare(node.id.name);
        bindClassContainer();
        break;
      case 'ClassExpression': {
        // a class EXPRESSION binds its name inside itself alone: a container of statics there, and
        // the outer name's own container where a declarator binds the class (a plain alias of that name)
        const scopes = [...currentScopes, node];
        declare(node.id.name, node);
        const outer = classOuterNames.get(node);
        if (!outer) bindClassContainer({ scopes });
        else {
          let values = aliasValues.get(node.id.name);
          if (!values) aliasValues.set(node.id.name, values = []);
          values.push({ rawValue: node, target: { root: outer, keys: [] }, scopes });
        }
        break;
      }
    }
  }
  // a PLAIN ALIAS re-homes a value under a name this census can still follow: writes and escapes
  // spelled through the alias canonicalize onto the aliased path at publish time, so the alias's
  // own declaration is no escape of the slot (`const a = r.w`, and `var _r$w = r.w` - the spelling a
  // destructure lowering ahead of this plugin leaves), and the receiver walk keeps descending the
  // literal for a read through it. Every enumerable value contributes an alternative, including a
  // literal owned by the name itself; an opaque source does not discard the earlier alternatives.
  // `aliasValues` collects per name, `plainAliases` is the publish-time verdict.
  const aliasValues = new Map();
  // every call, with the position its explicit-store writes take among the raw slot writes: which
  // builtin it invokes is known only once the escape census resolved the callees (`result`)
  const storeCalls = [];
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
  // Iteration still invalidates container pairing, but records its own reason: a local loop head
  // does not expose every constructor member. The escape census follows the head's actual uses.
  // no step budget: every push is a strict SUB-NODE of what was popped, so the worklist drains in
  // the subtree's own size. the budget it used to carry guarded no cycle - it only dropped the
  // arguments pushed FIRST, and a dropped escape is an under-record the reader cannot see
  function recordEscapedContainers(argNodes, scopes = currentScopes, call = null, iteration = false) {
    const work = [...argNodes ?? []];
    while (work.length) {
      const node = unwrapRuntimeExpr(work.pop());
      if (!node) continue;
      switch (node.type) {
        case 'Identifier':
          recordSlotWrite(node.name, ['*'], null, scopes, null, call ? { call, argument: node } : iteration ? { iteration } : null);
          break;
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
          // what the leak unsettles is UNDER that slot: which value the slot holds stays. a root no
          // binding names descends instead
          const { root, keys } = memberSlotPath(node);
          if (keys) recordSlotWrite(root.name, keys.at(-1) === '*' ? keys : [...keys, '*'], null, scopes, null,
            call ? { call, argument: node } : iteration ? { iteration } : null);
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

  // Destructuring an array mutator detaches it just as a member read does. Record its source as
  // repositioned; a key that cannot be folded keeps the same conservative verdict.
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
    const roots = collectGateRoots(valueNode, [], programNode);
    for (const root of roots) if (root.thisRooted) root.viaTopLevelThis = markTopLevelThis;
    return roots;
  }

  // alias name -> what its source stands for: the source's own gate roots, a bare KEY name for a
  // pattern slot (`const { Object: O } = globalThis` makes O the `Object` namespace), or null
  // when the gate cannot tell and the point query must open
  const aliasSourceRoot = new Map();

  // the map is flat and scope-blind, so one name may be recorded from several declarations and
  // several writes (`a ||= box` keeps what `a` already held). those are ALTERNATIVES, not a
  // correction - last-write-wins dropped every earlier source without opening the query.
  // Own each list: one call can supply several pattern bindings, which must not share a mutable
  // sink. Appending then costs only the new sources, not the accumulated fan of all prior calls.
  function recordAliasSource(name, sources) {
    const known = aliasSourceRoot.get(name);
    if (known === null) return;
    if (sources === null) aliasSourceRoot.set(name, null);
    else if (known === undefined) aliasSourceRoot.set(name, [...sources]);
    else for (const source of sources) known.push(source);
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
      let values = aliasValues.get(id.name);
      if (!values) aliasValues.set(id.name, values = []);
      values.push(...recorded);
    } else if (isDestructurePattern(id)) {
      recordPatternLiteralReHomes(id, unwrapRuntimeExpr(held));
      // ... a pattern over a NAMED invocation re-homes the yielded literal's slots the same way, once
      // the callee is known
      const invocation = invocationNode(unwrapRuntimeExpr(held));
      if (invocation) pendingCallPatterns.push({ pattern: id, call: invocation, scopes: currentScopes });
    }
    // classification reads the VALUE, not its wrapper: a TS cast / paren around a container init
    // (`const w = { k: Object } as T`) otherwise lands on the alias path and the binding never
    // registers as a container - the slot-write filter then drops its writes at publish time
    const value = unwrapRuntimeExpr(held);
    if (id?.type === 'Identifier' && value?.type === 'ClassExpression' && value.id?.type === 'Identifier') {
      classOuterNames.set(value, id.name);
    }
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
      // ... or the container an INLINE invocation yields - a slot the body fills from a parameter holds
      // the argument there, which is the literal's own initial value to every reader (they pair it
      // through the call canon) and never a WRITE of the slot
      const yielded = inlineCallYieldedContainer(value, unwrapExpressionChain);
      // ... an invocation of a NAMED callee is filed the same way at publish time, when the escape
      // census has resolved which function it invokes; until then the binding stays the alias it
      // spells, which no invocation spelling leaves inert (`new f()` yields what `f` returns)
      const invocation = !yielded && invocationNode(value);
      if (invocation) pendingCallContainers.push({ name: id.name, node: declaratorNode, call: invocation, scopes: currentScopes, kind });
      const container = yielded?.literal ?? literalRootedContainer(value) ?? value;
      const arrayContainer = container?.type === 'ArrayExpression' && container.elements.some(canHoldBuiltIn);
      // every array-literal binding, the inert ones included: a mutator invocation may INSTALL a
      // built-in into one later (`const b = []; b.push(Map)`), which promotes it at publish time
      const containerLiteral = arrayContainer || container?.type === 'ObjectExpression' || container?.type === 'ClassExpression';
      if (containerLiteral || container?.type === 'ArrayExpression') declareContainerLiteral(id.name, declaratorNode, container, { kind });
      if (!arrayContainer && !invocation && (!value || INERT_VALUE_TYPES.has(value.type))) return;
      if (containerLiteral) {
        let nodes = containerBound.get(id.name);
        if (!nodes) containerBound.set(id.name, nodes = []);
        nodes.push(container);
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
    return chainSlotPath(memberChainKeys(member, hop => memberKeyName(hop) ?? privateNameSpelling(hop.property)));
  }
  function chainSlotPath({ root, keys }) {
    if (root?.type !== 'Identifier' || !keys.length) return { root, keys: null };
    const unreadable = keys.indexOf(null);
    return { root, keys: unreadable === -1 ? keys : [...keys.slice(0, unreadable), '*'] };
  }

  // the container-slot record every member WRITE owes, whatever statement hosts it: the write
  // replaces what the literal's member held, so the receiver walk must stop trusting it. `value`
  // is the installed one where a write spells it verbatim, and absent where it derives one
  // ... and a write to `length` truncates or empties the level it is read off (`w.length = 0`
  // drops every element), so it is the wildcard under that level rather than a slot of its own
  function recordMemberSlotWrite(member, value = null, write = null) {
    const chains = writeTargetChains(member);
    // ... and a target that SELECTS (`(c ? a : b).k = v`) lands on one of its arms, never on each:
    // the write replaces no arm's slot for certain, so it proves no initial value dead
    if (write && chains.length > 1) selectedWrites.add(write);
    for (const chain of chains) {
      const { root, keys } = chainSlotPath(chain);
      if (!keys) recordUnrootedWrite(chain);
      else recordSlotWrite(root.name, keys.at(-1) === 'length' ? [...keys.slice(0, -1), '*'] : keys, value, currentScopes, write);
    }
  }

  // ... and a write through a receiver no name spells (`UNROOTED_WRITE_KEYS`)
  function recordUnrootedWrite(chain) {
    const key = unrootedWriteKey(chain, currentScopes);
    if (key !== null) rawUnrootedKeys.add(key);
  }

  // the receiver of an in-place array mutator: a bare name repositions its own container; a MEMBER
  // chain repositions the slot it names - the wildcard under its path, the record a member write
  // owes (`w.k.unshift(v)` unsettles `w.k.*`), with the values the invocation installs beside it
  function recordMutatorReceiver(owner, values) {
    if (owner?.type === 'Identifier') return recordRepositioned(owner.name, values);
    if (owner?.type !== 'MemberExpression' && owner?.type !== 'OptionalMemberExpression') return;
    for (const chain of writeTargetChains(owner)) {
      const { root, keys } = chainSlotPath(chain);
      if (!keys) {
        recordUnrootedWrite(chain);
        continue;
      }
      const slot = keys.at(-1) === '*' ? keys : [...keys, '*'];
      recordSlotWrite(root.name, slot, null, currentScopes);
      for (const value of values) if (value) recordSlotWrite(root.name, slot, value, currentScopes);
    }
  }

  // the parameters a function literal defaults (`defaultedParams`), paired by the gate once the walk is over
  function recordDefaultedParams(node) {
    if (!FUNCTION_LIKE_NODE_TYPES.has(node.type)) return;
    for (const param of dropLeadingThisParam(node.params ?? [])) {
      if (param.type === 'AssignmentPattern') defaultedParams.push(param);
    }
  }

  // the write-TARGET ladder, one for every host that has one: a member, a destructure pattern or
  // a bare name are the three shapes a target takes, and the hosts differ only in what the RIGHT
  // side IS - an assignment stores it in the target, a for-x head ITERATES it and stores its
  // elements, which is why the value-source half is the caller's answer and not the shape's.
  // `installed` is the value the write spells verbatim, absent where it derives or iterates one
  function recordWriteTarget(left, right, { rightIsTheValue, installed = null, write = null }) {
    if (left?.type === 'MemberExpression' || left?.type === 'OptionalMemberExpression') {
      // an unreadable write key writes an UNKNOWN slot - the wildcard admits the possibility,
      // mirroring the read guard's rule for an unreadable member key
      recordMemberSlotWrite(left, installed, write);
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
      const paired = rightIsTheValue ? patternMemberTargetPairs(left, unwrapRuntimeExpr(right)) : [];
      gatherPatternMemberTargets(left, member => {
        const stored = paired.filter(([target]) => target === member);
        if (!stored.length) recordMemberSlotWrite(member);
        for (const [, value] of stored) recordMemberSlotWrite(member, value);
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

  // Record the values a loop head receives: enumerable elements feed its declaration or
  // assignment pattern, while an unknown iterable records an iteration escape.
  // A name over several literal containers can receive each one; nonliteral alternatives escape.
  function recordForOfIterable(node) {
    const head = node.left.type === 'VariableDeclaration' && node.left.declarations.length === 1
      ? node.left.declarations[0] : null;
    const elements = forOfIterableElements(node);
    if (!head && elements && isDestructurePattern(node.left)) {
      for (const element of elements) recordWriteTarget(node.left, element, { rightIsTheValue: true, write: node });
      return;
    }
    // ... and a MEMBER head stores each element in the slot it names, a NAME head holds it (`let A;
    // for (A of list)`) - each as the flat `=` stores its value
    const target = !head && elements && unwrapRuntimeExpr(node.left);
    if (isMemberAccessNode(target) || target?.type === 'Identifier') {
      for (const element of elements) recordWriteTarget(target, element, { rightIsTheValue: true, installed: element, write: node });
      return;
    }
    // ... a name head over an iterable no literal spells holds whatever it hands out
    if (!head && unwrapRuntimeExpr(node.left)?.type === 'Identifier') valueBound.add(unwrapRuntimeExpr(node.left).name);
    if (!head || !elements) {
      recordEscapedContainers([node.right], currentScopes, null, true);
      return;
    }
    // the head binds INSIDE the loop's own scope, the frame its declarator is visited in - the
    // records made here, at the loop node, have to name that chain or the alias never pairs with
    // its declaration
    const outerScopes = currentScopes;
    currentScopes = [...currentScopes, node];
    // ... and a PATTERN head UNPACKS the element it binds, which is a READ: it re-homes exactly what
    // its own leaves bind, the declarator lane's answer for the same pair. the blanket escape above
    // filed every container slot the element NAMES as WRITTEN instead, and the pure receiver walk
    // then declined the very literal `const { from } = W.w` resolves through
    if (head.id.type !== 'Identifier') {
      for (const element of elements) {
        recordPatternDetachedRepositioners(head.id, element);
        recordValueSource(head.id, element, head, node.left.kind);
      }
    } else if (elements.length === 1) recordValueSource(head.id, elements[0], head, node.left.kind);
    else {
      for (const element of elements) {
        const value = unwrapRuntimeExpr(element);
        if (value?.type === 'ObjectExpression' || value?.type === 'ArrayExpression') {
          declareContainer(head.id.name, head, value, { kind: node.left.kind });
        } else recordEscapedContainers([element], currentScopes, null, true);
      }
    }
    currentScopes = outerScopes;
  }

  // a declarator binds its names in the scope its declaration's KIND lands in (the declaration is
  // the frame's parent node), and records the value it takes
  function recordDeclarator(node, frame) {
    const { kind = null } = frame?.parentNode ?? {};
    walkPatternIdentifiers(node.id, id => declare(id.name, declarationScopeIn(kind, currentScopes)));
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
      write: node.operator === '=' ? node : null,
    });
  }

  function visit(node, frame) {
    programNode ??= node;
    markTopLevelThis = !!frame?.atThisTopLevel;
    currentScopes = frame?.scopes ?? [];
    // Keep the frame above current even for a leaf, but skip its empty shape analysis.
    if (PRIMITIVE_LITERAL_TYPES.has(node.type)) return;
    declareOwnBindings(node);
    if ((node.type === 'MemberExpression' || node.type === 'OptionalMemberExpression')
      && !frame?.underTypeAnnotation && !isMemberWriteOnlyContext(node, frame?.parentNode)) {
      const owner = unwrapRuntimeExpr(node.object);
      if (owner?.type === 'Identifier') {
        recordMemberRead(owner.name, memberKeyName(node));
      }
    }
    // ANY read of an in-place array mutator off an identifier makes that receiver's element list
    // untrustworthy: the inline call, the detached `.call` / `.apply` / `Reflect.apply` spellings and
    // a method stored for later (`const m = box.reverse; m.call(box)`) all pass through this ONE
    // member read - once the method escapes, its invocation is not statically visible at all.
    // publish-time filtering keeps this to container bindings, so data arrays cost nothing
    if ((node.type === 'MemberExpression' || node.type === 'OptionalMemberExpression')
      && !frame?.underTypeAnnotation && memberReadDetachesRepositioner(node)) {
      // an invocation's value arguments land in the container's slots - record them as
      // reaching candidates on the wildcard entry (`b.push(Map)` makes `Map` readable
      // through any slot). the direct call and the `Reflect.apply(b.push, b, [v])`
      // spelling are visible from this frame; the `.call` / `.apply` hop spellings are
      // recorded at their invocation's own visit below. a read detached into a variable
      // records the reposition alone - its invocation is not statically attributable
      recordMutatorReceiver(unwrapRuntimeExpr(node.object), directInvocationValues(node, frame?.parentNode));
    }
    // the `.call` / `.apply` hop spellings of a mutator invocation (`b.push.call(b, v)`,
    // `b.push.apply(b, [v])`): the whole shape is visible only from the invocation itself
    if (node.type === 'CallExpression') recordHopInvocation(node, recordMutatorReceiver);
    // ... and every call's place among the raw slot writes, for the explicit store it may turn out to be
    if (node.type === 'CallExpression' || node.type === 'OptionalCallExpression') {
      storeCalls.push({ node, scopes: currentScopes, at: rawSlotWrites.length });
    }
    recordDefaultedParams(node);
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
        recordEscapedContainers(node.quasi?.expressions, currentScopes, node);
        break;
      case 'NewExpression':
      case 'CallExpression':
      case 'OptionalCallExpression': {
        // ... where the target of an explicit store whose keys and values are all readable drops its
        // record at publication (`ownedStoreTargets`): the keys the store writes are recorded one by
        // one, and the wildcard beside them would block every OTHER slot of that container
        recordEscapedContainers(node.arguments, currentScopes, node);
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
    const top = seen.size === 0;
    if (top && closureMemo.has(name)) return closureMemo.get(name);
    const names = [];
    const closed = appendAliasClosure(name, seen, names) ? names : null;
    if (top) closureMemo.set(name, closed);
    return closed;
  }

  // the walk behind `aliasClosure`, appended to ONE list: null where it cannot tell, else what the
  // appended run holds (`appendNames`). a hop reads that instead of rescanning the run, and no run
  // is copied up - a closure k hops deep costs k, where a list per hop cost k^2, and a file writing
  // through every name of such a chain k^3
  function appendAliasClosure(name, seen, names) {
    if (seen.has(name)) return appendNames(names, []);
    seen.add(name);
    const source = aliasSourceRoot.get(name);
    if (source === null) return null;
    const held = appendNames(names, [name]);
    if (source === undefined) return held;
    for (const entry of source) {
      const value = typeof entry === 'string' ? appendAliasClosure(entry, seen, names) : chainValueNames(entry, entry.keys, seen, names);
      if (!value) return null;
      // a source that IS the global object keeps its proxy spelling in the list, so a chain off
      // this alias reads the same answer the direct spelling does
      const added = value === GLOBAL_OBJECT ? appendNames(names, ['globalThis']) : value;
      held.global ||= added.global;
      held.container ||= added.container;
    }
    return held;
  }

  // push names onto a closure run and report what they hold, the two facts the chain rule reads
  // off a run: `global` where one is the GLOBAL OBJECT - by name, or a binding a proxy entry fills -
  // and `container` where one has a literal bound
  function appendNames(names, added) {
    const held = { global: false, container: false };
    for (const name of added) {
      names.push(name);
      held.global ||= POSSIBLE_GLOBAL_OBJECTS.has(name) || proxyGlobalBound.has(name);
      held.container ||= containerBound.has(name);
    }
    return held;
  }

  // The scoped stage names function literals and pure invokers behind imports, aliases and default interop slots.
  // The cheap pass cannot prove the latter's source, so it conservatively admits that spelling.
  function followableCallee(root, seen) {
    if (root.calleeIsFunction || root.calleeIsDefault) return true;
    if (root.calleeName === null) return false;
    if (functionBound.has(root.calleeName)) return true;
    const aliased = aliasClosure(root.calleeName, seen);
    return !aliased || aliased.some(name => functionBound.has(name) || pureImportEntryOfProgram(programNode, name));
  }

  // ONE rule for what a chain's VALUE stands for, asked by both consumers - the alias SOURCE
  // ("what does this binding hold") and a write's RECEIVER ("what is this write landing on").
  // the names it stands for go onto `names` and the answer is what they hold (`appendNames`; no
  // names at all where the chain stands for nothing the scoped stage could attribute either - the
  // query may rule the file out), `GLOBAL_OBJECT` with no names added, or `null` where this walk
  // cannot tell - the one channel the gate's superset property rides on, so every exit that cannot
  // answer takes it. `keys` is the member path READ off the root, which is not always the root
  // record's own path: a write consumes its last key as the slot it lands on
  function chainValueNames(root, keys, seen, names) {
    if (root.unnameable) return null;
    // A default slot can carry a pure invoker through an alias; only the scoped pass
    // can prove its module source. Do not discard that possible value here.
    if (keys.length === 1 && keys[0] === 'default') return null;
    // whether the scoped stage can name a CALL root is decided by its callee: it inlines the
    // return through an inline function, or through a name this file binds to one - directly or
    // down the alias chain. a callee this file never binds (`require`, an import, a host global)
    // resolves to no function there either, so the query may rule it out
    if (root.callRooted) return followableCallee(root, seen) ? null : appendNames(names, []);
    // `arguments[i]` stands for the argument the enclosing function's call sites pass at `i` -
    // which only the scoped stage, standing at the write, can pair
    if (root.name === 'arguments') return null;
    // a `this` root is the global object only in a top-level `this` context; anywhere else the
    // scoped stage attributes nothing, so `const scope = this` rules out instead of opening
    if (root.thisRooted && !root.viaTopLevelThis) return appendNames(names, []);
    // a walk in progress takes the root's closure straight into its own run; a query of its own
    // starts from the memoized closure
    const start = names.length;
    let held;
    if (root.thisRooted) held = appendNames(names, ['globalThis']);
    else if (seen.size) held = appendAliasClosure(root.name, seen, names);
    else {
      const closed = aliasClosure(root.name, seen);
      held = closed && appendNames(names, closed);
    }
    if (!held) return null;
    let rest = keys;
    if (held.global) {
      // hops through the global object stay ON it (`globalThis.self.Object` reads `Object`), so
      // the namespace is the first key that is not a proxy name; all-proxy keys - or none at
      // all - leave the chain standing on the global object itself
      let index = 0;
      while (index < keys.length && POSSIBLE_GLOBAL_OBJECTS.has(keys[index])) index++;
      names.length = start;
      if (index === keys.length) return GLOBAL_OBJECT;
      // an unreadable key, or the interop `default` hop whose far side is the global again
      if (keys[index] === null || keys[index] === 'default') return null;
      held = appendNames(names, [keys[index]]);
      rest = keys.slice(index + 1);
    }
    // the chain stands on its base when it reads the base itself, or on the base's PROTOTYPE -
    // which the scoped stage keys under BOTH spellings (`Array.prototype.at = f` records
    // `Array.prototype.at` and taints `Array`), so both are published. deeper it reads a
    // container SLOT, which only a bound literal or a class static resolves, and only in the
    // scoped stage - so a base no literal is bound to keeps this answer while one that is opens
    if (!rest.length) return held;
    if (rest.length === 1 && rest[0] === 'prototype') {
      const prototypes = appendNames(names, names.slice(start).map(name => `${ name }.prototype`));
      return { global: held.global || prototypes.global, container: held.container || prototypes.container };
    }
    return held.container ? null : held;
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
    const receiver = [];
    const value = chainValueNames(root, installsUnknownKeys ? root.keys : root.keys.slice(0, -1), new Set(), receiver);
    if (!value) return false;
    // landing ON the global object, the write replaces one of its SLOTS - and a mutator call
    // names none of them here
    if (value === GLOBAL_OBJECT) {
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

  // Publish constructor obligations from the completed container index; leaf expansion stays
  // in stampEscapesFrom, shared with the ordinary escape census.
  function stampContainers(containers, writtenContainerSlots, containerSlotIndex) {
    // A changed container retains its minted constructors in pure output, so they carry their
    // statics. Global reads already union the reaching slots and inject the selected members;
    // a write or reposition alone does not hand every constructor member to an outside reader.
    // Actual escapes are stamped by the escape census, a read through an unfoldable key among them.
    // Iteration alone only invalidates the container pairing; its head's reads decide the statics.
    // ... and a class whose OWN NAME is a static receiver here (`class C extends Map {}` then
    // `C.groupBy`) reads a static it INHERITS: the read lands on the base, through a binding the
    // reaching-value walk does not connect back to it, so the base owes its statics for the same
    // reason. a base whose statics are read through `super` inside the class body resolves on its
    // own and is not stamped - the escalation costs the whole namespace entry
    const heldNames = HELD_CTOR_NAMES.get(programNode);
    const held = heldNames && { names: heldNames, state: escapeWalkStateFor(heldNames), heldInSlot: true };
    for (const [key, { name, literals, container }] of containers) {
      if (!container) continue;
      for (const { literal: node } of literals) {
        if (held && writtenContainerSlots.has(`${ key }.*`)
          && !containerSlotIndex.escapes.get(`${ key }.*`)?.every(escape => escape?.iteration)) {
          stampEscapesFrom(programNode, node, held);
        }
        if (CLASS_NODE_TYPES.has(node.type) && readsInheritedStaticOf(node, name)) {
          stampEscapesFrom(programNode, node.superClass);
        }
      }
    }
  }

  let mutationRoots;
  let hasMutationShapes = false;
  // Publish coarse roots before escape classification; both reducers consume one completed walk.
  function prepare() {
    if (mutationRoots) return;
    // the point-query gate: a slot of `Ctor` can only be written through a target whose chain
    // names `Ctor`. collecting those names lets a typing question about one slot skip the scoped
    // pass entirely, instead of paying a whole-file walk for a file that never touches that
    // namespace. `open` keeps the gate a SUPERSET of what the scoped pass can attribute: a chain
    // this walk cannot name rules nothing out
    // a parameter's own DEFAULT is a value it holds whenever a call omits the argument, spelled by
    // the function itself; what the calls pass is not followed (`defaultedParams`)
    for (const param of defaultedParams) {
      const roots = collectGateRoots(param.right, [], programNode);
      for (const root of roots) if (root.thisRooted) root.viaTopLevelThis = false;
      walkPatternIdentifiers(param.left, id => {
        valueBound.add(id.name);
        recordAliasSource(id.name, roots);
      });
    }
    let open = false;
    for (const { node, viaTopLevelThis, installsUnknownKeys, bareCallee } of targets) {
      // a BARE callee reaches the mutators only through a binding that HOLDS one - an extracted
      // or destructured `Object.defineProperty`, or an import of its pure entry. a callee this
      // file binds to nothing of the sort (`foo(bar())`, in half of real files) classifies as no
      // mutator in the scoped stage either, so its arguments are no mutation targets
      if (bareCallee !== null && !valueBound.has(bareCallee) && !importBound.has(bareCallee)) continue;
      for (const root of collectGateRoots(node, [], programNode)) {
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
            // `arguments[i].x = v` writes through the argument a call site passed
            || root.name === 'arguments'
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
    mutationRoots = { names: rootNames, globalSlots, open };
    RECORDED_MUTATION_ROOTS.set(programNode, mutationRoots);
  }

  // the value a write INSTALLS (`w.k = q = Map` installs `Map` - the write-value canon), into the slot's
  // record. an unknown slot's candidates are a set: the one binding a name reaches, written there N
  // times, is one candidate for every reader of the container
  const unknownSlotCandidates = new WeakMap();
  function recordWrittenValue(values, installed, { unknownSlot, scopes, qualify }) {
    if (!unknownSlot || installed?.type !== 'Identifier') {
      values.push(installed);
      return;
    }
    const candidate = qualify(installed.name, scopes) ?? `#${ installed.name }`;
    let seen = unknownSlotCandidates.get(values);
    if (!seen) unknownSlotCandidates.set(values, seen = new Set());
    if (seen.has(candidate)) return;
    seen.add(candidate);
    values.push(installed);
  }

  // an explicit store's writes, filed where the call sat through whatever spelling the escape census
  // resolved its callee from (`callBuiltin`) - the member, an alias, a pure import. a target the store
  // owns drops the call's generic escape; the dominance proof trusts only an `Object.assign` that
  // surely runs
  function fileExplicitStores(callBuiltin) {
    const ownedStoreTargets = new Map();
    const assignStores = new WeakMap();
    for (let index = storeCalls.length - 1; index >= 0; index--) {
      const { node, scopes, at } = storeCalls[index];
      const store = callBuiltin?.(node);
      const writes = store && explicitStoreWrites(store);
      if (!writes) continue;
      if (writes.owned) ownedStoreTargets.set(node, writes.target);
      if (store.namespace === 'Object' && store.method === 'assign' && !spineHasOptionalHop(node)) {
        assignStores.set(node, writes.entries);
      }
      rawSlotWrites.splice(at, 0, ...writes.entries.map(({ key, value }) => [writes.target.name, [key ?? '*'], value, scopes, node]));
    }
    return { ownedStoreTargets, assignStores };
  }

  function result() {
    prepare();
    // a binding of a NAMED invocation holds the container its callee yields, as one of an inline one
    // does: filed now that the escape census has resolved the callees, so a write through the
    // binding registers against the literal the reader walks and a pattern over the call re-homes
    // the slots its leaves take - the reader descends both through the same call canon
    CALLEE_RESOLUTION.get(programNode)?.();
    const callees = CALL_CALLEES.get(programNode);
    function calleeOf(call) {
      return callees?.get(call);
    }
    for (const { name, node, call, scopes, kind } of pendingCallContainers) {
      const yielded = resolvedCallYieldedContainer(call, calleeOf, unwrapExpressionChain);
      if (yielded) declareContainerLiteral(name, node, yielded.literal, { kind, scopes });
    }
    for (const { pattern, call, scopes } of pendingCallPatterns) {
      const yielded = resolvedCallYieldedContainer(call, calleeOf, unwrapExpressionChain);
      if (!yielded) continue;
      const restore = currentScopes;
      currentScopes = scopes;
      recordPatternLiteralReHomes(pattern, yielded.literal);
      currentScopes = restore;
    }
    const { ownedStoreTargets, assignStores } = fileExplicitStores(CALL_BUILTINS.get(programNode));
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
    function writtenSlot(slotKey, write = null, escape = null) {
      let values = writtenContainerSlots.get(slotKey);
      if (!values) writtenContainerSlots.set(slotKey, values = []);
      if (slotKey.endsWith('.*')) {
        let escapes = containerSlotIndex.escapes.get(slotKey);
        if (!escapes) containerSlotIndex.escapes.set(slotKey, escapes = []);
        escapes.push(escape);
      }
      if (write) {
        let writes = containerSlotIndex.writes.get(slotKey);
        if (!writes) containerSlotIndex.writes.set(slotKey, writes = []);
        if (!writes.includes(write)) writes.push(write);
      }
      return values;
    }
    const { qualify, containers, containerSlotIndex } = buildContainerIndex(declared, containerDeclarations, rawUnrootedKeys);
    containerSlotIndex.programNode = programNode;
    containerSlotIndex.assignWrites = assignStores;
    const plainAliases = publishPlainAliases(aliasValues, recordEscapedContainers, qualify, containers);
    const slotPathMemo = new Map();
    for (const [name, keys, value, scopes, write, escape] of rawSlotWrites) {
      if (escape?.call && ownedStoreTargets.get(escape.call) === escape.argument) continue;
      const key = qualify(name, scopes);
      if (!key) continue;
      for (const [root, path] of canonicalSlotPaths(plainAliases, key, keys, slotPathMemo)) {
        // a write that stores what can hold a built-in PROMOTES an inert array-literal binding, as
        // the mutator install below does (`const w = [1]; w[0] = Map`)
        const entry = containers.get(root);
        if (!entry?.container && !(entry?.arrayLiteral && value && canHoldBuiltIn(value))) continue;
        // Keep exact write sites for the dominance query; an aliased site also owes a receiver proof.
        const values = writtenSlot([root, ...path ?? ['*']].join('.'), path && !path.includes('*') ? write : null,
          root === key || escape?.iteration ? escape : null);
        if (write && (root !== key || selectedWrites.has(write))) containerSlotIndex.aliasedWrites.add(write);
        if (value) recordWrittenValue(values, installedWriteValue(value), { unknownSlot: !path || path.includes('*'), scopes, qualify });
      }
    }
    for (const [name, values, scopes] of rawRepositioned) {
      const key = qualify(name, scopes);
      if (!key) continue;
      // a mutator invocation whose arguments can hold a built-in PROMOTES an inert array-literal
      // binding to a container - the install is what makes its slots worth walking
      const installsBuiltIn = values.some(value => canHoldBuiltIn(value));
      for (const [root, path] of canonicalSlotPaths(plainAliases, key, [], slotPathMemo)) {
        const entry = containers.get(root);
        if (!entry?.container && !(installsBuiltIn && entry?.arrayLiteral)) continue;
        const sink = writtenSlot([root, ...path ?? [], '*'].join('.'));
        for (const value of values) if (value) sink.push(value);
      }
    }
    propagateWrapperWrites(writtenContainerSlots, containers, writtenSlot, qualify, plainAliases, slotPathMemo, containerSlotIndex);
    stampContainers(containers, writtenContainerSlots, containerSlotIndex);
    return {
      hasMutationShapes,
      mutationRoots,
      writtenContainerSlots,
      containerSlotIndex,
    };
  }
  return { visit, prepare, result };
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
    : declaratorSlotValues(decl, name, { ...ctx, resolveKey });
  return flattenBranchingValueNodes(raw.filter(Boolean));
}

// the slot values a PATTERN declarator's name takes: through the call canon where the init is an
// INVOCATION - the pairing the resolvers read, each value at the scope it is spelled in, flattened
// here to the nodes these walkers fan - and the literal pairer otherwise, beside every value the
// file wrote into that slot (this census over-records: a patch through it may land on either)
function declaratorSlotValues(decl, name, ctx) {
  const read = { pattern: decl.id, init: decl.init, name, ctx };
  return [...pairedSlotValues(read).map(value => value.node), ...writtenPatternSlotValues(read)];
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

// the function a class runs at `new C(x)`. babel keeps the parameters on the constructor member,
// ESTree on the FunctionExpression that member wraps - one read, so the two parsers cannot answer
// differently about the same class
function classConstructorFunction(classNode) {
  const ctor = (classNode.body?.body ?? []).find(member => member?.kind === 'constructor');
  if (!ctor) return null;
  return ctor.params ? ctor : ctor.value ?? null;
}

// the values a PARAMETER holds that its own function spells: the DEFAULT, taken whenever a call
// omits the argument (a destructured parameter selects its slot through the canonical pattern
// pairer). what the calls pass is not followed - a patch routed through an argument is past the
// static spellings this census covers
function paramDefaultValues({ identNode, binding, ctx }) {
  const declPath = binding.declarationPath;
  if (!declPath) return [];
  let paramPath = declPath;
  let fnPath = declPath.parentPath;
  while (fnPath?.node && !FUNCTION_LIKE_NODE_TYPES.has(fnPath.node.type)) {
    paramPath = fnPath;
    fnPath = fnPath.parentPath;
  }
  const param = paramPath.node;
  if (param.type !== 'AssignmentPattern' || !dropLeadingThisParam(fnPath?.node?.params ?? []).includes(param)) return [];
  return param.left.type === 'Identifier' ? [param.right] : patternSlotValues(param.left, param.right, identNode.name, ctx);
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
function createMutationSiteHandler({ adapter, mutated, resolveStaticKey = null }) {
  const pendingIdentitySkips = [];
  // one resolution per target NODE: the same site is classified twice by construction (the host
  // visitor accepts a bare `=` LHS that the member visitor also reaches), and a mutator whose
  // source keys came back partly readable yields two entries on one target. the node fixes its
  // own scope, so the answer cannot differ between those visits
  const resolved = new WeakMap();
  function resolveTargetOnce(targetNode, path) {
    if (resolved.has(targetNode)) return resolved.get(targetNode);
    const names = resolveMutationSite({ targetNode, scope: path.scope, adapter, path, resolveStaticKey });
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
  const { handleSite, finalizeMutationSet } = createMutationSiteHandler({ adapter, mutated, resolveStaticKey });
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

// the record keys a container is asked by: its DECLARATION where the caller hands the declaring
// node (the receiver walk does), else every declaration of that name in the file - the
// conservative union a name-only question deserves. An unindexed declaration owns no records;
// falling back to its name would borrow writes from a different binding.
function containerRecordKeys(index, object, ownerNode) {
  if (!index) return [object];
  const owned = ownerNode ? index.owners.get(nodePositionKey(ownerNode) ?? ownerNode) : null;
  return ownerNode ? (owned ? [owned] : []) : index.byName.get(object) ?? [];
}

// the KNOWN written value nodes reaching a slot of the containers `keys` names in the written-slot
// record: direct writes to the named slot plus unknown-slot (dynamic-key) writes, which may land
// anywhere on the container
function recordedSlotWriteValues(slots, keys, keyPath) {
  const values = [];
  for (const key of keys) {
    const prefixes = slotPathPrefixes(key, keyPath);
    const exact = prefixes.at(-1);
    values.push(...slots.get(exact) ?? []);
    // ... plus the unknown-slot writes at every prefix, which may land anywhere below it
    for (const prefix of prefixes) {
      if (prefix !== exact || exact.endsWith('.*')) values.push(...slots.get(`${ prefix }.*`) ?? []);
    }
  }
  return values;
}

// --- the parser-agnostic adapter core ---

// the shared half of the emitter adapter contract: the mutation / written-slot gates and the
// package view, closed over the same callbacks both plugin adapters receive. `buildHostMembers`
// returns the host-specific scope machinery (it may close over the adapter it is handed - the
// members only run after composition); `packages` stays a getter, so composition must go through
// property descriptors - a spread would freeze the packages view at creation time.
// `parameterCallSites` is the type engine's caller census, exposed on the adapter for the
// destructure lanes that mirror a PARAMETER's receiver from the callers this file spells
export function createDetectionAdapter({
  method = null, getMutatedStatics = () => null, getWrittenContainerSlots = () => null,
  getContainerSlotIndex = () => null, getPackages = () => null, getMutationRoots = () => null,
  parameterCallSites = null,
}, buildHostMembers) {
  const callWriteSummaries = new WeakMap();
  // an aliased write's definiteness for one slot, per var-scope owner of the reads that ask
  // (`definiteWrites`)
  const definiteAliasedWrites = new WeakMap();
  // ... and a slot's writes as that owner's source spells them (`liveWrites`), one list per slot
  const liveSlotWrites = new WeakMap();
  // the census record keys a container is filed under: its owning declaration's, or every one its name has
  function containerKeys(object, ownerNode) {
    return containerRecordKeys(getContainerSlotIndex?.(), object, ownerNode);
  }
  const adapter = {
    parameterCallSites,
    // Scope trackers may still expose a pattern after its extraction is committed.
    // The source walker retains the original binding's write and availability checks.
    emittedBindingSources: new WeakMap(),
    recordEmittedBindingSource(declarator, name, source) {
      if (declarator?.type !== 'VariableDeclarator' || !name || !source) return;
      let sources = adapter.emittedBindingSources.get(declarator);
      if (!sources) adapter.emittedBindingSources.set(declarator, sources = new Map());
      sources.set(name, source);
    },
    returnedContainerWriteCandidates,
    // the discard canon's read half, carried where every layer's scoped question reaches it: the hook
    // `mayHaveSideEffects` asks of a member read when its caller hands a `ctx`
    readRunsAccessor,
    parameterStaticSources: new WeakMap(),
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
    // Does a recorded write or escape invalidate this container slot at the read?
    // Check the declaration-owned path and its prefixes, separately from builtin mutations.
    // Proven later writes and escapes cannot affect an earlier capture; a closed parameter
    // pattern or the argument read itself may also preserve the selected container identity.
    isWrittenContainerSlot(object, keyPath, ownerNode = null, usagePath = null, usageNode = null) {
      const slots = getWrittenContainerSlots?.();
      if (!slots) return false;
      // a write through a receiver no name spells may land on this container's slot (`UNROOTED_WRITE_KEYS`)
      const unrooted = getContainerSlotIndex?.()?.unrootedKeys;
      if (unrooted?.size && (unrooted.has('*') || keyPath.some(key => unrooted.has(key)))) return true;
      // a write at any PREFIX of the path replaces the subtree the rest of it reads through, so
      // the whole ladder is asked: `w.a = X` and `w.a.b = X` both answer for a read of `w.a.b`,
      // while `w.a.b = X` leaves `w.c` alone. the wildcard at a prefix is "some slot under here" -
      // which unsettles a read THROUGH that slot, never the slot read itself: a caller about to
      // descend into the value it reads asks one level deeper, at the key it reads next
      for (const key of containerKeys(object, ownerNode)) {
        const prefixes = slotPathPrefixes(key, keyPath);
        for (const prefix of prefixes) {
          if (prefix !== prefixes.at(-1) && slots.has(`${ prefix }.*`)) {
            const index = getContainerSlotIndex?.();
            const escapes = index?.escapes.get(`${ prefix }.*`);
            const binding = usagePath && adapter.getBinding(usagePath.scope, object, usagePath);
            const calls = escapes?.map(escape => escape?.call);
            // A later handout cannot change a value already read from this container.
            const later = calls?.length && calls.every(Boolean) && binding && noReassignmentReachesUsage({
              reassignmentNodes: calls, usagePath, usageNode,
              bindingScopeNode: binding.scope?.block ?? binding.scope?.path?.node,
              bindingAnchor: bindingLoopAnchor(binding),
            });
            // A pattern hands its leaves to the body, not the container above them.
            // Reads no deeper than a named leaf retain their container identity; deeper
            // reads, rest-only captures and arguments-object access keep the escape.
            const selected = prefix === key && escapes?.length && escapes.every(escape => {
              const callee = escape?.call && CALL_CALLEES.get(index.programNode)?.get(escape.call);
              if (!callee || referencesArgumentsObject(callee)) return false;
              const pairing = censusCallPairing(escape.call);
              const at = pairing?.argsUnknown ? -1 : pairing?.args?.indexOf(escape.argument) ?? -1;
              const pattern = at < 0 ? null : patternSlotTarget(dropLeadingThisParam(callee.params)[at]);
              if (!isDestructurePattern(pattern)) return false;
              let reads = false;
              walkPatternIdentifiers(pattern, id => {
                reads ||= patternRootKeyPathsFor(pattern, id.name, null)?.some(
                  keys => keyPath.every((part, depth) => keys[depth] === part),
                ) ?? false;
              });
              return reads;
            });
            // Passing a member captures its identity before that invocation can write it.
            const captured = prefix === [key, ...keyPath].join('.') && isMemberAccessNode(usageNode)
              && escapes?.length && escapes.every(escape => escape?.argument === usageNode && escape.call === usagePath?.node);
            if (!later && !selected && !captured) return true;
          }
          if (!slots.has(prefix)) continue;
          const index = getContainerSlotIndex?.();
          const writes = index?.writes.get(prefix);
          const binding = usagePath && adapter.getBinding(usagePath.scope, object, usagePath);
          const declaration = binding?.path?.node ?? binding?.node;
          if (writes?.length && writes.length === slots.get(prefix)?.length && declaration
            && index.owners.get(nodePositionKey(declaration) ?? declaration) === key) {
            const owner = findNearestVarScopeOwner(usagePath);
            let bySlot = owner && liveSlotWrites.get(owner.node);
            if (owner && !bySlot) liveSlotWrites.set(owner.node, bySlot = new Map());
            if (bySlot && !bySlot.has(prefix)) bySlot.set(prefix, writes.map(write => ownerSourceWritePath(owner, write)?.node));
            const liveWrites = bySlot?.get(prefix);
            if (liveWrites?.every(Boolean) && noReassignmentReachesUsage({
              reassignmentNodes: liveWrites, usagePath, usageNode,
              bindingScopeNode: binding.scope?.block ?? binding.scope?.path?.node,
              bindingAnchor: bindingLoopAnchor(binding),
            })) continue;
          }
          return true;
        }
      }
      return false;
    },
    // The initial slot value is dead only after a proven write that dominates this read.
    // Keep uncertain writes in the candidate union; they never prove the initializer dead.
    // A caller naming the replacement validates each value at its write's scope; otherwise
    // only fresh containers without held built-ins can exclude the initial candidate.
    // eslint-disable-next-line max-statements -- direct, call and alias writes share one dominance proof
    containerSlotWriteDominatesUsage(keyPath, ownerNode, usagePath, usageNode, acceptValue = null) {
      const index = getContainerSlotIndex?.();
      const key = index?.owners.get(nodePositionKey(ownerNode) ?? ownerNode);
      if (!key) return false;
      const slots = getWrittenContainerSlots?.(),
            slotKey = [key, ...keyPath].join('.'),
            writes = index.writes?.get(slotKey),
            values = slots?.get(slotKey);
      // A known call can be the write itself. Keep the census wildcard for all other readers;
      // only this dead-initializer proof may replace it with exact effects of a synchronous body.
      if (acceptValue && !slots?.has(slotKey) && keyPath.length === 1 && slots?.has(`${ key }.*`)) {
        const escapes = index.escapes?.get(`${ key }.*`);
        const source = installedWriteValue(ownerNode.init);
        const binding = adapter.getBinding(usagePath?.scope, ownerNode.id?.name, usagePath);
        const owner = findNearestVarScopeOwner(usagePath);
        if (!escapes?.length || escapes.some(escape => !escape?.call) || slots.has(`${ slotKey }.*`)
          || (source?.type !== 'ObjectExpression' && source?.type !== 'ArrayExpression')
          || literalHasUnnameableSlot(source)
          || (binding?.path?.node ?? binding?.node) !== ownerNode || binding.constantViolations?.length || !owner) return false;
        const calls = [];
        const slotMembers = new WeakMap();
        for (const { call, argument } of escapes) {
          const pairing = censusCallPairing(call);
          const callee = CALL_CALLEES.get(index.programNode)?.get(call);
          if (!callee || call.type === 'NewExpression' || spineHasOptionalHop(call)
            || pairing?.argsUnknown || pairing?.args?.some(arg => arg?.type === 'SpreadElement')
            || !provablyPrecedes(ownerNode, call)) return false;
          const paramIndex = pairing?.args?.findIndex(arg => unwrapRuntimeExpr(arg) === argument) ?? -1;
          if (paramIndex < 0) return false;
          let summaries = callWriteSummaries.get(callee);
          if (!summaries) callWriteSummaries.set(callee, summaries = new Map());
          if (!summaries.has(paramIndex)) summaries.set(paramIndex,
            parameterMemberUses(callee, paramIndex, referencesArgumentsObject(callee), false, true));
          const summary = summaries.get(paramIndex);
          if (!summary?.writes?.length
            || summary.writes.some(write => containerSlotValues(source, write.key, false, slotMembers).length !== 1)) return false;
          const selected = summary.writes.filter(write => write.key === keyPath[0]);
          if (!selected.length) return false;
          let paths = ownerWritePathIndex(owner);
          if (!paths.has(selected[0].node)) {
            const named = unwrapRuntimeExpr(pairing.callee);
            const calleeBinding = named?.type === 'Identifier' && adapter.getBinding(usagePath.scope, named.name, usagePath);
            const declaration = calleeBinding?.path?.node ?? calleeBinding?.node;
            if (!calleeBinding?.path || (declaration?.type === 'FunctionDeclaration' ? declaration
              : unwrapRuntimeExpr(identifierDeclaratorInit(calleeBinding))) !== callee) return false;
            paths = ownerWritePathIndex(calleeBinding.path);
          }
          for (const write of selected) {
            const writePath = paths.get(write.node);
            if (!writePath || !acceptValue(installedWriteValue(write.node.right), writePath)) return false;
          }
          calls.push(call);
        }
        return reassignmentDominatesUsage({ reassignmentNodes: calls, usagePath, usageNode });
      }
      // Account for every recorded value and exclude wildcard writers that can restore
      // the old value; a write to an outer slot also invalidates the original inner identity.
      if (!writes?.length || writes.length !== values?.length
        || slotPathPrefixes(key, keyPath).some(prefix => slots.has(`${ prefix }.*`)
          // Passing the selected value to this very reader cannot restore its old identity.
          // Earlier handouts and writes through the enclosing container remain unknown.
          && (acceptValue || prefix !== slotKey || !index.escapes?.get(`${ prefix }.*`)
            ?.every(escape => escape?.call === usagePath?.node && escape.argument === usageNode)))
        || keyPath.slice(0, -1).some((part, at) => slots.has([key, ...keyPath.slice(0, at + 1)].join('.')))) return false;
      // Only a pristine, unshadowed assign guarantees these stores. Duplicate or unknown
      // source keys cannot pair one recorded call with one installed value per slot.
      for (const write of writes) if (write.type !== 'AssignmentExpression') {
        const entries = index.assignWrites?.get(write);
        if (!entries || adapter.isMutatedStaticSlot('Object', 'assign')) return false;
        if (entries.some(entry => entry.key === null || !entry.value)
          || new Set(entries.map(entry => entry.key)).size !== entries.length) return false;
      }
      if (acceptValue) {
        const owner = findNearestVarScopeOwner(usagePath);
        const paths = owner && ownerWritePathIndex(owner);
        if (writes.some(write => {
          const writePath = paths?.get(write);
          return write.operator !== '=' || !writePath || !acceptValue(installedWriteValue(write.right), writePath);
        })) return false;
      } else if (values.some(value => (value?.type !== 'ObjectExpression' && value?.type !== 'ArrayExpression')
          || literalHasUnnameableSlot(value)
          || containerSlotNodes(value).some(slot => !isQuietLiteralOperand(slot)
            && !FUNCTION_LIKE_NODE_TYPES.has(unwrapRuntimeExpr(slot)?.type)))) return false;
      // Re-reading an own data path reaches the same inner container. An accessor, spread
      // or held value does not prove that identity, even when no explicit write was recorded.
      let source = installedWriteValue(ownerNode.init);
      for (const part of keyPath.slice(0, -1)) {
        if (literalHasUnnameableSlot(source)) return false;
        const held = containerSlotValues(source, part, true);
        source = held.length === 1 ? unwrapRuntimeExpr(held[0]) : null;
        if (source?.type !== 'ObjectExpression' && source?.type !== 'ArrayExpression') return false;
      }
      // Discarding the old candidate requires an own data property: a setter can ignore
      // the write, and a getter can return anything.
      if ((acceptValue || method === 'usage-pure' || writes.some(write => write.type === 'CallExpression'))
        && ((source?.type !== 'ObjectExpression' && source?.type !== 'ArrayExpression')
        || literalHasUnnameableSlot(source)
        || containerSlotValues(source, keyPath.at(-1), true).length !== 1)) return false;
      // Alias expansion names POSSIBLE targets. A dead initializer needs the value captured
      // at this exact write, before any later alias reassignment, and a source that stayed put.
      // Reuse the scoped flow gates and own literal-slot lookup. Every member before the
      // written leaf must remain untouched, including the slots of wrappers holding aliases.
      // the verdict reads the write, the slot and the owner of the reads, never one read itself - so
      // every read of the slot in that owner shares it, and N reads of N aliased writes cost N verdicts
      const owner = findNearestVarScopeOwner(usagePath);
      let bySlot = owner && definiteAliasedWrites.get(owner.node);
      if (owner && !bySlot) definiteAliasedWrites.set(owner.node, bySlot = new Map());
      let verdicts = bySlot?.get(slotKey);
      if (bySlot && !verdicts) bySlot.set(slotKey, verdicts = new WeakMap());
      const definiteWrites = writes.filter(write => {
        if (!index.aliasedWrites.has(write)) return true;
        if (!verdicts) return false;
        if (!verdicts.has(write)) verdicts.set(write, aliasedWriteIsDefinite(write));
        return verdicts.get(write);
      });
      function aliasedWriteIsDefinite(write) {
        const writePath = ownerWritePathIndex(owner).get(write);
        const left = unwrapRuntimeExpr(write.left);
        if (!writePath || !isMemberAccessNode(left)) return false;
        let receiver = unwrapRuntimeExpr(left.object);
        let receiverKeys = [];
        let { scope } = writePath;
        let path = writePath;
        for (let depth = 0; receiver && depth < ALIAS_CHAIN_DEPTH; depth++) {
          const chain = memberChainKeys(receiver);
          if (chain.keys.includes(null)) return false;
          receiver = chain.root;
          receiverKeys = [...chain.keys, ...receiverKeys];
          if (receiver?.type === 'ObjectExpression' || receiver?.type === 'ArrayExpression') {
            if (!receiverKeys.length || literalHasUnnameableSlot(receiver)) return false;
            const held = containerSlotValues(receiver, receiverKeys.shift());
            receiver = held.length === 1 ? installedWriteValue(held[0]) : null;
            continue;
          }
          if (receiver?.type !== 'Identifier') return false;
          const binding = adapter.getBinding(scope, receiver.name, path);
          const declaration = binding?.path?.node ?? binding?.node;
          if (!declaration || declaration.type !== 'VariableDeclarator') return false;
          if (receiverKeys.length && adapter.isWrittenContainerSlot(receiver.name, receiverKeys, declaration)) return false;
          if (declaration === ownerNode) return !binding.constantViolations?.length
            && receiverKeys.length === keyPath.length - 1 && receiverKeys.every((part, at) => part === keyPath[at]);
          if (!varInitDominatesUsage({ declaratorNode: declaration, kind: binding.kind, usagePath: path })
            || !noReassignmentReachesUsage({
              reassignmentNodes: binding.constantViolations?.map(site => site.node ?? site),
              usagePath: path, bindingScopeNode: binding.scope?.path?.node,
              bindingAnchor: declaration,
            })) return false;
          receiver = installedWriteValue(declaration.init);
          scope = aliasDeclScope(binding, scope);
          path = bindingDeclarationPath(binding);
          if (!path) return false;
        }
        return false;
      }
      return reassignmentDominatesUsage({
        reassignmentNodes: definiteWrites.filter(write => provablyPrecedes(write, usageNode ?? usagePath?.node)),
        usagePath, usageNode,
      });
    },
    // the KNOWN written value nodes reaching a slot (`recordedSlotWriteValues`)
    writtenContainerSlotValues(object, keyPath, ownerNode = null) {
      const slots = getWrittenContainerSlots?.();
      return slots ? recordedSlotWriteValues(slots, containerKeys(object, ownerNode), keyPath) : [];
    },
    // Typing must distrust patched return types in every mode, independently of pure injection policy.
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
function resolveMutationSite({
  targetNode, scope: siteScope, adapter: siteAdapter, path: sitePath, resolveStaticKey = null,
}) {
  const names = new Set();
  const receiverDeopts = new Set();
  const seenBindings = new Set();
  const chainParts = new WeakMap();
  const siteCtx = { scope: siteScope, adapter: siteAdapter, path: sitePath, chainParts, resolveStaticKey };
  // a PARAMETER has no declarator to fan, and BOTH value-resolution entry points owe the same
  // answer about it - the one asking about the binding itself, and the one asking about a chain
  // ROOTED at it: the default its function spells (`paramDefaultValues`)
  function bindingParamValues(identNode, binding, ctx = siteCtx) {
    const { scope, adapter, path } = ctx;
    return binding.kind === 'param' ? paramDefaultValues({ identNode, binding, ctx: { scope, adapter, path, resolveKey } }) : [];
  }
  // the values a CALL RESULT stands for, through the shared inline canon: the argument an identity
  // callee hands back (any parameter position, an inline-array spread expanded, a tagged template's
  // expressions paired like arguments, a receiver invoker's list), or a parameter-independent
  // body return - a write through the result patches THAT object (`pick(1, Array).from = patched`).
  // analysis only: the emitted call retains its original arguments and effects
  function callResultValues(callNode, ctx = siteCtx) {
    const { scope, adapter, path } = ctx;
    const inlined = inlineCallReturnExpression({ node: callNode, readNode: callNode, seen: new Set(), ctx: { scope, adapter, path } },
      { rejectConditional: true, allowMutatingForwarder: true, allowUninitializedCallee: true });
    return inlined ? [inlined] : [];
  }
  // ... and the argument a callee returns INSIDE a container it builds (`box(x) { return [x] }`, then
  // `box(Array)[0].from = patched`): the slot the chain reads off the result holds a parameter, and
  // the value there is the call's argument at that parameter's position
  function callYieldedSlotValues(callNode, keys, ctx = siteCtx) {
    const { scope, adapter, path } = ctx;
    const yielded = callYieldedContainer({ node: callNode, readNode: callNode, seen: new Set(), ctx: { scope, adapter, path } },
      { rejectConditional: true, allowUninitializedCallee: true });
    const values = [];
    for (const [keyPath, index] of yielded?.slots ?? []) {
      if (keyPath.length !== keys.length || keyPath.some((key, at) => String(key) !== String(keys[at]))) continue;
      const argument = resolveCallArgument(yielded.args, index);
      if (argument) values.push(argument);
    }
    return values;
  }
  function visitAliasValues(valueNode, depth, thisPath = null, ctx = siteCtx) {
    if (!valueNode || depth > 8) return;
    for (const leaf of valueFanLeaves(valueNode, [])) {
      const name = resolveLeafName(leaf, { ...ctx, thisPath });
      if (name) names.add(name);
      if (leaf.type === 'Identifier') visitBinding(leaf, depth + 1, ctx);
      // an alias bound to a chain root off a reassigned proxy holder (`let h; h = globalThis;
      // const alias = h.Array`) resolves no leaf name - fan its chain root like the target loop
      else if (!name && (leaf.type === 'MemberExpression' || leaf.type === 'OptionalMemberExpression')) {
        visitChainRootAlias(leaf, thisPath, ctx);
      // ... and one bound to a CALL RESULT holds what the call hands back (`const h = pick(1, Array)`)
      } else if (!name && (leaf.type === 'CallExpression' || leaf.type === 'OptionalCallExpression'
        || leaf.type === 'TaggedTemplateExpression')) {
        for (const value of callResultValues(leaf, ctx)) visitAliasValues(value.node, depth + 1, thisPath, { ...ctx, ...value.ctx });
      }
    }
  }
  function visitBinding(identNode, depth, ctx = siteCtx) {
    const { scope, adapter, path } = ctx;
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
    // a PARAMETER has no declarator to fan: its values are its default (`bindingParamValues`)
    if (binding.kind === 'param') {
      for (const value of bindingParamValues(identNode, binding, ctx)) visitAliasValues(value, depth + 1, null, ctx);
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
        visitAliasValues(slotValue, depth, bindingPath, ctx);
      }
    }
    // a pattern declarator's init is the WHOLE rhs (`Array` for `{ prototype: P } = Array`):
    // fanning it would smuggle the CONTAINER name and record a spurious static beside the
    // slot fan's correct pair - the selected slot values above are the only sound fan there
    const init = binding.node?.init;
    if (!patternDeclarator) visitAliasValues(init, depth, bindingPath, ctx);
    const reCtx = { scope, adapter, path, resolveKey };
    for (const rhs of reassignmentValueNodes({ binding, usagePath: path, name: identNode.name, ctx: reCtx }) ?? []) {
      visitAliasValues(rhs, depth, bindingPath, ctx);
    }
  }
  // a member-chain target whose root reaches a proxy global through a value fan keys the mutation
  // under the chain's constructor leaf when a reachable root value is a proxy global (over-record -
  // the safe direction). two root shapes fan: a BOUND identifier (`let h; h = c ? other : globalThis;
  // h.Array.of = patch`) fans its init + reassignment union; an INLINE value fan
  // (`(c ? globalThis : self).Array.of = patch`) fans the chain root's own branches
  function visitChainRootAlias(leaf, thisPath = null, ctx = siteCtx) {
    const { scope, adapter, path } = ctx;
    const parts = chainPartsOf(leaf, ctx);
    if (!parts) return;
    // a chain rooted at a CALL reads a slot of what the call returns, and a chain rooted at
    // `arguments` reads what a call site passed: both name the argument, not the root
    if (parts.keys && (parts.rootNode.type === 'CallExpression' || parts.rootNode.type === 'OptionalCallExpression'
      || parts.rootNode.type === 'TaggedTemplateExpression')) {
      const name = walkStaticReceiverChain({
        receiverNode: parts.rootNode, walkPath: parts.keys, scope, adapter, path, ignoreWrittenSlots: true, allowUninitializedCallee: true,
      });
      if (name) names.add(name);
      else for (const value of callYieldedSlotValues(parts.rootNode, parts.keys, ctx)) visitAliasValues(value, 1, null, ctx);
      return;
    }
    // `arguments[i]` reads what the call sites pass, which this census does not follow
    if (parts.keys?.length === 1 && parts.rootNode.type === 'Identifier' && parts.rootNode.name === 'arguments'
      && !adapter.hasBinding(scope, 'arguments', path)) return;
    // an unreadable HOP hides which value off the root was reached (`Array[k].x = v`) - the
    // mutation could sit anywhere under the root, so the ROOT deopts whole
    if (!parts.keys) {
      if (parts.rootNode.type === 'Identifier' && !adapter.hasBinding(scope, parts.rootNode.name, path)) {
        receiverDeopts.add(parts.rootNode.name);
        return;
      }
      // every leaf the fan can name deopts: `box = c ? Array : Map` reaches BOTH constructors, and
      // stopping at the first left the other one trusted under a patch that may have hit it
      for (const { node: valueLeaf, thisPath: leafAnchor } of chainRootValueLeaves(parts.rootNode, thisPath, ctx)) {
        const rootName = resolveLeafName(valueLeaf, { ...ctx, thisPath: leafAnchor });
        if (rootName) receiverDeopts.add(rootName);
      }
      return;
    }
    if (parts.keys.slice(0, -1).some(key => !POSSIBLE_GLOBAL_OBJECTS.has(key))) return;
    for (const { node: valueLeaf, thisPath: leafAnchor } of chainRootValueLeaves(parts.rootNode, thisPath, ctx)) {
      // ... an alias of `arguments` (`const a = arguments; a[0].from = patched`) reads the slot the
      // way the bare spelling does
      if (valueLeaf.type === 'Identifier' && valueLeaf.name === 'arguments' && parts.keys.length === 1
        && !adapter.hasBinding(scope, 'arguments', path)) continue;
      const rootName = resolveLeafName(valueLeaf, { ...ctx, thisPath: leafAnchor });
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
  function chainRootValueLeaves(rootNode, thisPath = null, ctx = siteCtx) {
    const { scope, adapter, path } = ctx;
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
        : [identifierDeclaratorInit(binding), ...bindingParamValues(rootNode, binding, ctx)];
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
      if (!siteAdapter.hasBinding(siteScope, leaf.name, sitePath)) {
        // unshadowed bare name - the direct global candidate, no alias machinery involved
        names.add(leaf.name);
      } else {
        visitBinding(leaf, 0);
      }
    } else {
      const name = resolveLeafName(leaf, siteCtx);
      if (name) names.add(name);
      else if (leaf.type === 'MemberExpression' || leaf.type === 'OptionalMemberExpression') visitChainRootAlias(leaf);
      else if (leaf.type === 'CallExpression' || leaf.type === 'OptionalCallExpression' || leaf.type === 'TaggedTemplateExpression') {
        for (const value of callResultValues(leaf)) visitAliasValues(value.node, 1, null, { ...siteCtx, ...value.ctx });
      }
    }
  }
  return { names: [...names], receiverDeopts: [...receiverDeopts] };
}
