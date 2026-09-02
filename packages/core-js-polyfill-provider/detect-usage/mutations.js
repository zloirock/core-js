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
  FN_NODE_TYPES,
  FUNCTION_LIKE_NODE_TYPES,
  MUTATED_MEMBERS_UNKNOWN,
  POSSIBLE_GLOBAL_OBJECTS,
  PRIMITIVE_LITERAL_TYPES,
  TS_EXPR_WRAPPERS,
  VALUE_FLOW_ASSIGN_OPS,
  canHoldBuiltIn,
  collectFileCensus,
  computedKeyStaticName,
  foldedPropertyKeyName,
  followConstLiteralAlias,
  identifierDeclaratorInit,
  installedWriteValue,
  isDestructurePattern,
  isMemberMutationContext,
  isMutatedStaticPair,
  isTopLevelThisContext,
  kebabToCamel,
  memberKeyName,
  mutatedStaticKey,
  patternSlotTarget,
  patternSlotValues,
  peelNestedSequenceExpressions,
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

// value shapes that cannot reach a built-in constructor through the resolver: primitives,
// derived expressions, fresh instances and function values. everything ELSE marks the bound
// name as a potential alias (over-fire is just one wasted traverse)
// `Array.prototype` methods that mutate in place, read off the SAME `mutatesElements` flag the type
// tables already carry - the reason a method belongs here is a property of `Array.prototype`, not of
// this pass, so there is nothing to restate locally. that flag is WIDER than repositioning: `push`
// and `pop` change the length without moving any surviving index, so a container they touch loses
// its slots to the wildcard for nothing. an accepted over-report - narrowing it means a second flag
// in the compat data, and the derived set is the reason there is no local list to drift
const ARRAY_REPOSITIONING_METHODS = new Set(Object.entries(knownBuiltInReturnTypes.instanceMethods.Array)
  .filter(([, hint]) => (Array.isArray(hint) ? hint[0] : hint)?.mutatesElements)
  .map(([name]) => name));

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
  return resolveKey({ node: keyNode, computed, scope: ctx.scope, adapter: ctx.adapter, path: ctx.path });
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
function recordAssignInstall(node, rawSlotWrites) {
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
      rawSlotWrites.push([target.name, [key ?? '*'], prop.value]);
    }
  }
  // a source the walk cannot read carries keys it cannot name, and THEN the generic escape is the
  // only sound record; `Object.assign(w)` with no source at all writes nothing and owns the target
  return sources.every(literal => literal?.type === 'ObjectExpression');
}

// the `.call` / `.apply` hop spellings, recorded from the invocation itself (the member
// read's frame cannot see its grandparent): value args past the receiver for `.call`, the
// args-array's elements for `.apply`
function recordHopInvocation(node, rawRepositioned) {
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
  rawRepositioned.push([owner.name, values]);
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
// keyed by PROGRAM node -> `start:end` position keys: a position survives every clone and
// region rebuild (babel's cloneNode keeps source positions), where node identity does not
export const ESCAPED_CTOR_REFS = new WeakMap();

// the simple alias inits of one file, keyed by its program: an escape reaches the constructor
// reference through however many `const B = A` hops the source spells, and the hops may be written
// after the escape. filled during the walk, read by every stamper AFTER it - both reducers stamp
// from their own `result`, and the graph is complete for either order
const CTOR_ALIAS_INITS = new WeakMap();

// the position key both sides agree on: parser nodes carry `start` / `end` char offsets;
// a babel clone drops them but keeps `loc.*.index` in the same offset space
export function nodePositionKey(node) {
  const start = node?.start ?? node?.loc?.start?.index;
  const end = node?.end ?? node?.loc?.end?.index;
  return typeof start === 'number' && typeof end === 'number' ? `${ start }:${ end }` : null;
}

// stamp every bare-identifier LEAF a value position forwards to, through the layers a value
// flows untouched: wrappers, conditional / logical arms, a sequence tail, literal
// elements / values, spreads, and an assignment's stored value
// stamp every constructor reference a value hands out, following the alias hops between the escape
// and the reference. the ONE entry point for both reducers: the walk is over by the time either
// calls it, so the alias graph answers the same whichever runs first
function stampEscapesFrom(programNode, node) {
  const stamps = ESCAPED_CTOR_REFS.get(programNode);
  if (!stamps) return;
  const aliases = CTOR_ALIAS_INITS.get(programNode);
  const seen = new Set();
  const work = [node];
  while (work.length) {
    const reached = new Set();
    stampEscapingLeaves(work.pop(), stamps, reached);
    for (const name of reached) {
      if (seen.has(name)) continue;
      seen.add(name);
      const init = aliases?.get(name);
      if (init) work.push(init);
    }
  }
}

function stampEscapingLeaves(node, stamps, escapedNames = null) {
  const target = unwrapRuntimeExpr(node);
  if (!target || typeof target !== 'object') return;
  switch (target.type) {
    case 'Identifier': {
      const key = nodePositionKey(target);
      if (key) stamps.add(key);
      // the escaping value may be an ALIAS of the constructor rather than the reference itself
      // (`const B = Map; class C extends B`), and the reference sits in the alias's own init -
      // recorded by NAME here and followed once the whole file has been walked
      escapedNames?.add(target.name);
      return;
    }
    case 'ConditionalExpression':
      stampEscapingLeaves(target.consequent, stamps, escapedNames);
      stampEscapingLeaves(target.alternate, stamps, escapedNames);
      return;
    case 'LogicalExpression':
      stampEscapingLeaves(target.left, stamps, escapedNames);
      stampEscapingLeaves(target.right, stamps, escapedNames);
      return;
    case 'SequenceExpression': stampEscapingLeaves(target.expressions.at(-1), stamps, escapedNames); return;
    case 'ArrayExpression':
      for (const element of target.elements) if (element) stampEscapingLeaves(element, stamps, escapedNames);
      return;
    case 'ObjectExpression':
      for (const prop of target.properties) stampEscapingLeaves(prop?.value ?? prop?.argument, stamps, escapedNames);
      return;
    case 'SpreadElement': stampEscapingLeaves(target.argument, stamps, escapedNames); return;
    case 'AssignmentExpression': stampEscapingLeaves(target.right, stamps, escapedNames);
  }
}

// the function's OWN return statements: a shallow walk that does not descend into nested
// functions (their returns belong to them)
function collectOwnReturns(body) {
  const returns = [];
  const stack = [body];
  while (stack.length) {
    const node = stack.pop();
    if (!node || typeof node !== 'object') continue;
    if (Array.isArray(node)) {
      stack.push(...node);
      continue;
    }
    if (typeof node.type !== 'string') continue;
    if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression'
      || node.type === 'ArrowFunctionExpression') continue;
    if (node.type === 'ReturnStatement') {
      returns.push(node);
      continue;
    }
    // eslint-disable-next-line no-restricted-syntax -- perf: AST hot path, plain objects
    for (const key in node) {
      const value = node[key];
      if (value && typeof value === 'object') stack.push(value);
    }
  }
  return returns;
}

export function escapedCtorReferencesReducer() {
  let stamps = null;
  let programNode = null;
  // the value POSITIONS that hand a reference out, collected during the walk and stamped from
  // `result` - only there is the alias graph complete
  const escaped = [];
  const aliasInit = new Map();
  function visit(node, frame) {
    // the first visited node IS the program - its stamp set lives module-level, keyed by it
    if (!stamps) {
      programNode = node;
      ESCAPED_CTOR_REFS.set(node, stamps = new Set());
      CTOR_ALIAS_INITS.set(node, aliasInit);
    }
    if (frame?.underTypeAnnotation) return;
    switch (node.type) {
      case 'CallExpression':
      case 'OptionalCallExpression':
      case 'NewExpression':
        for (const argument of node.arguments ?? []) escaped.push(argument);
        break;
      case 'AssignmentExpression': {
        const target = unwrapRuntimeExpr(node.left);
        if (target?.type === 'MemberExpression' || target?.type === 'OptionalMemberExpression') escaped.push(node.right);
        break;
      }
      case 'ExportDefaultDeclaration': escaped.push(node.declaration); break;
      // the alias hops an escape may travel through, joined in `result`
      case 'VariableDeclarator':
        if (node.id?.type === 'Identifier' && node.init) aliasInit.set(node.id.name, node.init);
        break;
      case 'ThrowStatement': escaped.push(node.argument); break;
      // a yield hands the value to the iterator's consumer, a tagged template passes its
      // expressions as call arguments - both escape exactly like a call argument does
      case 'YieldExpression': escaped.push(node.argument); break;
      case 'TaggedTemplateExpression':
        for (const expression of node.quasi?.expressions ?? []) escaped.push(expression);
        break;
      // a PLAIN-IDENTIFIER default (`function f(M = Ctor)`) and a function's return value:
      // reads through the binding / the call result are outside the reaching-value walks (a
      // branchy return proves no single value; a plain default has no narrow channel), so
      // the value must carry its statics. a DESTRUCTURE default (`{ x } = Ctor`) stays
      // unstamped - the mirror / guarded-narrow channels own it and resolve their own
      // entries (stamping it double-resolved the same source position to two entries).
      // the simple-return case the walk DOES track only widens to the same object
      case 'AssignmentPattern':
        if (node.left?.type === 'Identifier') escaped.push(node.right);
        break;
      // returns the reaching-value walk can FOLLOW stay unstamped: a zero-arg function whose
      // body yields a single return expression is the forwarder `inlineCallReturnExpression`
      // descends (`const F = (() => Ctor)()` - stamping it split that canon's resolution).
      // params or a second return put the value out of the walk's reach - those escape
      case 'FunctionDeclaration':
      case 'FunctionExpression':
      case 'ArrowFunctionExpression': {
        if (node.body && node.body.type !== 'BlockStatement') {
          if (node.params?.length) escaped.push(node.body);
          break;
        }
        // a METHOD's function value is never the forwarder canon's target (`o.m()` resolves
        // by receiver, not by binding) - its returns always escape
        const parent = frame?.parentNode;
        const isMethodValue = parent?.type === 'MethodDefinition'
          || ((parent?.type === 'Property' || parent?.type === 'ObjectProperty')
            && (parent.method === true || parent.kind === 'get' || parent.kind === 'set'));
        const returns = collectOwnReturns(node.body);
        if (isMethodValue || node.params?.length || returns.length > 1) {
          for (const ret of returns) escaped.push(ret.argument);
        }
        break;
      }
      // babel spells methods as their own node types
      case 'ObjectMethod':
      case 'ClassMethod':
      case 'ClassPrivateMethod':
        for (const ret of collectOwnReturns(node.body)) escaped.push(ret.argument);
        break;
    }
  }
  function result() {
    for (const node of escaped) stampEscapesFrom(programNode, node);
    return {};
  }
  return { visit, result };
}

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
  // the `Object.assign` targets whose written keys are recorded EXACTLY, so the generic
  // handed-to-a-call escape does not have to answer for them with its wildcard
  const assignInstallTargets = new Set();
  const arrayLiteralBound = new Set();
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
        case 'Identifier': rawSlotWrites.push([node.name, ['*']]); break;
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
          // put. an unreadable key leaks an unknown slot; a non-Identifier owner descends
          const owner = unwrapRuntimeExpr(node.object);
          if (owner?.type === 'Identifier') rawSlotWrites.push([owner.name, [memberKeyName(node) ?? '*']]);
          else work.push(node.object);
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
      patternNode.elements.forEach((target, index) => {
        if (target?.type === 'RestElement') pairs.push([target.argument, { rest: initNode.elements.slice(index) }]);
        else if (target) pairs.push([target, initNode.elements[index]]);
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
      if (detaches) rawRepositioned.push([source.name, []]);
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

  function recordValueSource(id, rawValue) {
    // a value RE-HOMED under another name escapes like a call argument does: an alias
    // (`const a = box`) takes writes the container's own name never sees, and a wrapper literal
    // (`const w = { ref: box }`) hands the same reference out through its member chain. the walk
    // is the shared escape collector, so the two families cannot drift. a PATTERN id is a READ
    // (`const { k } = box` unpacks, it re-homes nothing) - escaping it would bail every clean
    // destructure in the file. an identity self-assign (`box = box`) re-homes nothing either -
    // the value stays under the ONE name the census already tracks
    const selfTail = id?.type === 'Identifier' ? peelNestedSequenceExpressions(rawValue).tail : null;
    const identitySelfAssign = selfTail?.type === 'Identifier' && selfTail.name === id.name;
    if (id?.type === 'Identifier' && !identitySelfAssign) recordEscapedContainers([rawValue]);
    else if (isDestructurePattern(id)) {
      recordPatternLiteralReHomes(id, unwrapRuntimeExpr(rawValue));
    }
    // classification reads the VALUE, not its wrapper: a TS cast / paren around a container init
    // (`const w = { k: Object } as T`) otherwise lands on the alias path and the binding never
    // registers as a container - the slot-write filter then drops its writes at publish time
    const value = unwrapRuntimeExpr(rawValue);
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
      const arrayContainer = value?.type === 'ArrayExpression' && value.elements.some(canHoldBuiltIn);
      // every array-literal binding, the inert ones included: a mutator invocation may INSTALL a
      // built-in into one later (`const b = []; b.push(Map)`), which promotes it at publish time
      if (value?.type === 'ArrayExpression') arrayLiteralBound.add(id.name);
      if (!arrayContainer && (!value || INERT_VALUE_TYPES.has(value.type))) return;
      if (arrayContainer || value.type === 'ObjectExpression' || value.type === 'ClassExpression') {
        let nodes = containerBound.get(id.name);
        if (!nodes) containerBound.set(id.name, nodes = []);
        nodes.push(value);
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
  // the container-slot record every member WRITE owes, whatever statement hosts it: the write
  // replaces what the literal's member held, so the receiver walk must stop trusting it. `value`
  // is the installed one where a write spells it verbatim, and absent where it derives one.
  // the record is the whole KEY PATH off the root binding, not one key: a container nested inside
  // another (`const w = { a: { b: Object } }; w.a.b = Map`) has no name of its own, so a
  // single-key record could neither be written for it nor asked about it. an unreadable hop ends
  // the path in the wildcard - the write lands somewhere under the prefix that is readable
  function recordMemberSlotWrite(member, value = null) {
    const keys = [];
    for (let node = member; node?.type === 'MemberExpression' || node?.type === 'OptionalMemberExpression';) {
      keys.unshift(memberKeyName(node));
      node = unwrapRuntimeExpr(node.object);
      if (node?.type !== 'MemberExpression' && node?.type !== 'OptionalMemberExpression') {
        if (node?.type !== 'Identifier') return;
        const unreadable = keys.indexOf(null);
        rawSlotWrites.push([node.name, unreadable === -1 ? keys : [...keys.slice(0, unreadable), '*'], value]);
        return;
      }
    }
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
    if (node.type === 'ClassDeclaration' || node.type === 'ClassExpression') {
      if (node.superClass?.type === 'Identifier') superClassNames.add(node.superClass.name);
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

  // a for-x head assigns its target once per iteration - the same write shapes the flat `=` form
  // has, so it is classified through the same peel (`(NS.M) of xs`, `(NS.M as any) of xs`) rather
  // than off the raw node type, which answered differently on the two parsers
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
        rawRepositioned.push([owner.name, directInvocationValues(node, frame?.parentNode)]);
      }
    }
    // the `.call` / `.apply` hop spellings of a mutator invocation (`b.push.call(b, v)`,
    // `b.push.apply(b, [v])`): the whole shape is visible only from the invocation itself
    if (node.type === 'CallExpression') {
      recordHopInvocation(node, rawRepositioned);
      assignInstallTargets.add(recordAssignInstall(node, rawSlotWrites) ? node.arguments[0] : null);
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
        // iterating hands each VALUE to the loop binding - writes through it never spell the
        // source's name, so the iterable escapes like a call argument
        recordEscapedContainers([node.right]);
        recordForXHead(node);
        break;
      case 'ForInStatement':
        // `for-in` yields KEYS: the loop binding holds a string, never the container, so nothing
        // escapes here - reading `for (k in NS)` as a re-home deopted the whole container
        recordForXHead(node);
        break;
      case 'VariableDeclarator':
        recordPatternDetachedRepositioners(node.id, node.init);
        recordValueSource(node.id, node.init);
        break;
      case 'ImportDeclaration':
        for (const specifier of node.specifiers ?? []) {
          if (specifier.local?.name) importBound.add(specifier.local.name);
        }
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
      case 'FunctionDeclaration':
        if (node.id?.type === 'Identifier') functionBound.add(node.id.name);
        break;
      case 'ClassDeclaration':
        if (node.id?.type === 'Identifier') {
          let nodes = containerBound.get(node.id.name);
          if (!nodes) containerBound.set(node.id.name, nodes = []);
          nodes.push(node);
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
    for (const [name, keys, value] of rawSlotWrites) {
      if (!containerBound.has(name)) continue;
      const values = writtenSlot([name, ...keys].join('.'));
      // the value the write INSTALLS (`w.k = q = Map` installs `Map`) - the write-value canon
      if (value) values.push(installedWriteValue(value));
    }
    for (const [name, values] of rawRepositioned) {
      // a mutator invocation whose arguments can hold a built-in PROMOTES an inert array-literal
      // binding to a container - the install is what makes its slots worth walking
      const installsBuiltIn = values.some(value => canHoldBuiltIn(value));
      if (!containerBound.has(name) && !(installsBuiltIn && arrayLiteralBound.has(name))) continue;
      const sink = writtenSlot(`${ name }.*`);
      for (const value of values) if (value) sink.push(value);
    }
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
    for (const [name, nodes] of containerBound) {
      const opaque = writtenContainerSlots.has(`${ name }.*`) || opaquelyRead.has(name);
      for (const node of nodes) {
        if (node.type === 'ClassDeclaration' || node.type === 'ClassExpression') {
          if (readsInheritedStaticOf(node, name)) stampEscapesFrom(programNode, node.superClass);
        } else if (opaque) stampEscapesFrom(programNode, node);
      }
    }
    return { hasMutationShapes, mutationRoots: { names: rootNames, globalSlots, open }, writtenContainerSlots, callArguments };
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

// the parameters a class BINDS at `new C(x)`. babel keeps them on the constructor member, ESTree
// on the FunctionExpression that member wraps - one read, so the two parsers cannot answer
// differently about the same class
function classConstructorParams(classNode) {
  const ctor = (classNode.body?.body ?? []).find(member => member?.kind === 'constructor');
  return ctor?.params ?? ctor?.value?.params ?? null;
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

// the function a call-like host invokes and the arguments that land in its parameters. a TAGGED
// TEMPLATE is such a host: its first parameter takes the strings array - the quasi itself - and the
// interpolations follow. the RECEIVER INVOKERS name their function one hop further in - `f.call(t,
// x)` and `f.apply(t, [x])` invoke F, not a method called `call`, so the receiver slot comes off
// the list; `Reflect.apply` spells the same call with the function in the first slot, and a `bind`
// invoked on the spot prepends the arguments it captured
function callPairing(node, programNode = null) {
  if (node.type === 'TaggedTemplateExpression') {
    return { callee: node.tag, args: [node.quasi, ...node.quasi?.expressions ?? []] };
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
    return { callee: args[0], args: inlineArrayElements(args[2]) ?? [] };
  }
  if (callee?.type === 'MemberExpression' || callee?.type === 'OptionalMemberExpression') {
    const key = memberKeyName(callee);
    const target = peelToBareExpr(callee.object);
    if (key === 'apply' && target?.type === 'Identifier' && target.name === 'Reflect') {
      return { callee: args[0], args: inlineArrayElements(args[2]) ?? [] };
    }
    if (key === 'call') return { callee: callee.object, args: args.slice(1) };
    if (key === 'apply') return { callee: callee.object, args: inlineArrayElements(args[1]) ?? [] };
  }
  // `f.bind(t, x)()`: the invoked value is the bind's own callee, holding the captured arguments
  // ahead of the call's. a bind STORED first is a function value this census does not track
  if (callee?.type === 'CallExpression') {
    const inner = peelToBareExpr(callee.callee);
    const isBind = (inner?.type === 'MemberExpression' || inner?.type === 'OptionalMemberExpression')
      && memberKeyName(inner) === 'bind';
    if (isBind) return { callee: inner.object, args: [...(callee.arguments ?? []).slice(1), ...args] };
  }
  return { callee: node.callee, args };
}

// the CLASS a constructor belongs to, over the extra wrapper ESTree puts between the two
function enclosingClassName(fnPath) {
  for (let up = fnPath.parentPath, hops = 0; up?.node && hops < 3; up = up.parentPath, hops++) {
    if (up.node.type === 'ClassDeclaration' || up.node.type === 'ClassExpression') {
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

function createMutationSiteHandler({ adapter, mutated, callArguments = null }) {
  const pendingIdentitySkips = [];
  // one resolution per target NODE: the same site is classified twice by construction (the host
  // visitor accepts a bare `=` LHS that the member visitor also reaches), and a mutator whose
  // source keys came back partly readable yields two entries on one target. the node fixes its
  // own scope, so the answer cannot differ between those visits
  const resolved = new WeakMap();
  function resolveTargetOnce(targetNode, path) {
    if (resolved.has(targetNode)) return resolved.get(targetNode);
    const names = resolveMutationSite({ targetNode, scope: path.scope, adapter, path, callArguments });
    resolved.set(targetNode, names);
    return names;
  }
  function handleSite(path) {
    const ctx = { scope: path.scope, adapter, path, pendingIdentitySkips };
    for (const entry of classifyMutationSite(path.node, path.parent, path.parentPath?.parent, ctx)) {
      if (entry.globalSlotKey) {
        mutated.add(mutatedStaticKey('globalThis', entry.globalSlotKey));
        continue;
      }
      const { targetNode, keys } = entry;
      const { names, receiverDeopts } = resolveTargetOnce(targetNode, path);
      for (const name of names) {
        if (keys) for (const key of keys) mutated.add(mutatedStaticKey(name, key));
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
export function beginMutationPrePass({ rootNode, adapter, census = null }) {
  const mutated = new Set();
  if (!(census ? census.hasMutationShapes : hasMutationCandidateShapes(rootNode, adapter.packages))) {
    return { mutated, handleSite: null, finalize: null };
  }
  const { handleSite, finalizeMutationSet } = createMutationSiteHandler({
    adapter, mutated, callArguments: census?.callArguments ?? null,
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
  getPackages = () => null, getMutationRoots = () => null,
}, buildHostMembers) {
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
    isWrittenContainerSlot(object, keyPath) {
      const slots = getWrittenContainerSlots?.();
      if (!slots) return false;
      // a write at any PREFIX of the path replaces the subtree the rest of it reads through, so
      // the whole ladder is asked: `w.a = X` and `w.a.b = X` both answer for a read of `w.a.b`,
      // while `w.a.b = X` leaves `w.c` alone. the wildcard at a prefix is "some slot under here"
      for (const prefix of slotPathPrefixes(object, keyPath)) {
        if (slots.has(prefix) || slots.has(`${ prefix }.*`)) return true;
      }
      return false;
    },
    // the KNOWN written value nodes reaching a slot: direct writes to the named slot plus
    // unknown-slot (dynamic-key) writes, which may land anywhere on the container
    writtenContainerSlotValues(object, keyPath) {
      const slots = getWrittenContainerSlots?.();
      if (!slots) return [];
      const prefixes = slotPathPrefixes(object, keyPath);
      const exact = prefixes.at(-1);
      const values = [...slots.get(exact) ?? []];
      // ... plus the unknown-slot writes at every prefix, which may land anywhere below it
      for (const prefix of prefixes) {
        if (prefix !== exact || exact.endsWith('.*')) values.push(...slots.get(`${ prefix }.*`) ?? []);
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
    const pure = resolvePure({ kind: 'property', object: ctorName, key, placement: 'static' });
    if (pure && pure.kind !== 'instance') injectPureImport(pure.entry, pure.hintName);
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
function resolveMutationSite({ targetNode, scope, adapter, path, callArguments = null }) {
  const names = new Set();
  const receiverDeopts = new Set();
  const seenBindings = new Set();
  const chainParts = new WeakMap();
  const siteCtx = { scope, adapter, path, chainParts };
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
