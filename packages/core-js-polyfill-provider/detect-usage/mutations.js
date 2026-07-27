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
  collectFileCensus,
  followConstLiteralAlias,
  unwrapRuntimeExpr,
  isMemberMutationContext,
  isMutatedStaticPair,
  isTopLevelThisContext,
  memberKeyName,
  mutatedStaticKey,
  patternSlotValues,
  POSSIBLE_GLOBAL_OBJECTS,
  propertyKeyName,
  reassignmentValueNodes,
  walkPatternIdentifiers,
  TS_EXPR_WRAPPERS,
  walkAstChildren,
} from '../helpers/ast-patterns.js';
import {
  requireCallSource,
  interopDefaultProxyName,
  requireBoundProxyGlobalName,
  bindsModuleDefault,
  globalProxyNameFromImportSource,
  resolveKey,
  resolveObjectName,
  tsImportEqualsProxyName,
} from './resolve.js';
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
const INERT_VALUE_TYPES = new Set([
  'StringLiteral',
  'NumericLiteral',
  'BooleanLiteral',
  'NullLiteral',
  'RegExpLiteral',
  'BigIntLiteral',
  'Literal',
  'TemplateLiteral',
  'ArrayExpression',
  'ArrowFunctionExpression',
  'FunctionExpression',
  'NewExpression',
  'UnaryExpression',
  'BinaryExpression',
  'UpdateExpression',
]);

// collect every Identifier chain-root reachable from a mutation target, FANNING value composites
// (ternary / logical / sequence-tail / assignment-RHS) at ANY position so a nested value-fan root
// (`(c ? globalThis : self).Array.of`) is caught - the cheap gate stays a SUPERSET of the scoped
// value fan stage 3 runs. `firstKey` is the key off the root identifier (for the container-chain
// check); `chained` flags a member-rooted target. inline chain-assign (`(h = globalThis).Array.of`)
// follows the RHS the same way the stage-3 value fan does
function collectGateRoots(node, out, firstKey = null, hops = 0, depth = 0) {
  if (depth > 16) return out;
  let root = node;
  while (root) {
    switch (root.type) {
      case 'MemberExpression':
      case 'OptionalMemberExpression':
        firstKey = memberKeyName(root);
        root = root.object;
        hops++;
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
        collectGateRoots(root.consequent, out, firstKey, hops, depth + 1);
        collectGateRoots(root.alternate, out, firstKey, hops, depth + 1);
        return out;
      case 'LogicalExpression':
        collectGateRoots(root.left, out, firstKey, hops, depth + 1);
        collectGateRoots(root.right, out, firstKey, hops, depth + 1);
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
      out.push({ name: root.name, chained: hops > 0, firstKey });
      break;
    // a CALL-rooted target (`getArr().from = patch`) is opaque to the cheap name heuristics,
    // but the scoped stage CAN resolve it (it inlines a transparent call's return) - report it
    // as a gate-firing root so the cheap gate stays a SUPERSET of the scoped value fan
    case 'CallExpression':
    case 'OptionalCallExpression':
      out.push({ name: '', callRooted: true, chained: hops > 0, firstKey });
      break;
    // top-level `this` IS the global proxy on the scoped side (the read canon's pragmatic
    // assumption) - report the root so `result` can fire on built-in-shaped keys off it
    case 'ThisExpression':
      out.push({ name: '', thisRooted: true, chained: hops > 0, firstKey });
      break;
    default:
  }
  return out;
}

// peel runtime wrappers + comma-sequence tail off a node so `(0, Object)` / `(eff(), Reflect)`
// reach the bare identifier
function peelToBareExpr(node) {
  let cur = unwrapRuntimeExpr(node);
  while (cur?.type === 'SequenceExpression' && cur.expressions.length) {
    cur = unwrapRuntimeExpr(cur.expressions.at(-1));
  }
  return cur;
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

// gate record for a member mutation target: the OBJECT roots the classification, except a
// member hanging DIRECTLY off `this` reports the member itself - its object alone is a bare
// ThisExpression with no key for `result` to classify on (`this.Promise = shim`)
function gateMemberTarget(member) {
  return unwrapRuntimeExpr(member.object)?.type === 'ThisExpression' ? member : member.object;
}

function gatherPatternMemberTargets(pattern, out) {
  const work = [pattern];
  while (work.length) {
    const node = work.pop();
    if (!node || typeof node !== 'object') continue;
    if (node.type === 'MemberExpression' || node.type === 'OptionalMemberExpression') {
      out.push(gateMemberTarget(node));
      continue;
    }
    walkAstChildren(node, child => work.push(child));
  }
}

// census-reducer form: the per-node collection runs from the shared file-census walk, the
// verdict is computed once in `result` over everything collected. `packages` (main pkg +
// additionalPackages prefixes) keeps the import-alias recognition in lockstep with the scoped
// canon - without it a user-aliased global-proxy entry never fires the gate
// alias sources the scoped stage can follow to a namespace: a bare name, a member chain, `this`,
// and the wrappers around them. anything else (a call, a `new`, an operator result) resolves to no
// namespace there, so the point-query gate may treat it as naming nothing
// an alias source that resolves to no namespace at all - distinct from `null`, which means the gate
// cannot tell and must keep the query open
const NAMES_NOTHING = Symbol('names-nothing');

const FOLLOWABLE_ALIAS_SOURCES = new Set([
  'Identifier',
  'MemberExpression',
  'OptionalMemberExpression',
  'ThisExpression',
  'ConditionalExpression',
  'LogicalExpression',
  'SequenceExpression',
  'AssignmentExpression',
]);

export function mutationShapesReducer(packages = null) {
  const targets = [];
  let markTopLevelThis = false;
  function pushTarget(node) {
    if (!node) return;
    targets.push(node);
    if (markTopLevelThis && typeof node === 'object') topLevelThisTargets.add(node);
  }
  const valueBound = new Set();
  // name -> container nodes: the gate checks the chain's FIRST key against the container's
  // static keys, so `config.foo.bar = v` over `const config = {}` stays silent while
  // `NS.M.of = v` over `const NS = { M: Map }` fires
  const containerBound = new Map();
  // what an alias SOURCE names, for the point-query gate: a plain root names itself; a `this`-rooted
  // source names the key read off it (`const M = this.Map` in a global-object context IS `Map`); a
  // CALL-rooted one names nothing the scoped stage could attribute either, so it rules out rather
  // than opening. `null` = names nothing AND cannot be ruled out (a dynamic key)
  function aliasSourceName(root) {
    if (!root) return NAMES_NOTHING;
    if (root.callRooted) return NAMES_NOTHING;
    // a `this` source is the global object only in a top-level `this` context; anywhere else it
    // names nothing the scoped stage could attribute, so `const scope = this` rules out instead of
    // opening. at top level the key names the namespace (`const M = this.Map`), and a dynamic one
    // leaves the query open
    if (root.thisRooted) return markTopLevelThis ? root.firstKey ?? null : NAMES_NOTHING;
    // a MEMBER source names the member, not the namespace it was read from: `const cos = Math.cos`
    // makes `cos` the function, so writing its slot never touches a `Math` slot. the key nearest the
    // root is what such an alias stands for (`const S = globalThis.Set` -> `Set`). a DYNAMIC key
    // names nothing, and only off the global object could it still land on a namespace
    if (root.chained) {
      if (root.firstKey !== null) return root.firstKey;
      return POSSIBLE_GLOBAL_OBJECTS.has(root.name) ? null : NAMES_NOTHING;
    }
    return root.name;
  }

  // alias name -> the ROOT NAME its source chain starts from (`const O = Object` -> 'Object',
  // `const x = a.b` -> 'a'), or null when the source names nothing the gate can follow
  const aliasSourceRoot = new Map();
  // bindings that ARE the global object (a proxy-entry import / require): a chain off one names the
  // namespace in its FIRST key exactly as `globalThis.Object` does
  const proxyGlobalBound = new Set();
  // the module source a `require('<entry>')` / `<interop>(require('<entry>'))` init names, or null.
  // the require shape itself comes from the shared canon (it also knows the optional-call, sequence
  // -callee and TS-wrapper spellings); this adds only the single interop-wrapper layer, matched by
  // SHAPE rather than by helper name so every bundler's spelling is covered
  function requiredSourceOfInit(value) {
    const node = unwrapRuntimeExpr(value);
    const direct = requireCallSource(node, null, null);
    if (direct) return direct;
    const inner = node?.type === 'CallExpression' && node.arguments?.length === 1 ? node.arguments[0] : null;
    return inner ? requireCallSource(inner, null, null) : null;
  }

  function recordValueSource(id, value) {
    if (id?.type === 'Identifier') {
      // module lowering turns a proxy-entry import into a require (bare, or behind an interop
      // wrapper whose `.default` is the global) - the gate must name those bindings too
      const required = requiredSourceOfInit(value);
      if (required && globalProxyNameFromImportSource(required, packages)) proxyGlobalBound.add(id.name);
      if (!value || INERT_VALUE_TYPES.has(value.type)) return;
      if (value.type === 'ObjectExpression' || value.type === 'ClassExpression') {
        let nodes = containerBound.get(id.name);
        if (!nodes) containerBound.set(id.name, nodes = []);
        nodes.push(value);
      } else {
        valueBound.add(id.name);
        // an alias whose source is a NAME chain may stand for a global (`const O = Object`,
        // `const R = globalThis.Reflect`); one bound to a call / new / literal cannot be followed
        // to one by the scoped stage either, so the point-query gate may rule it out
        if (FOLLOWABLE_ALIAS_SOURCES.has(unwrapRuntimeExpr(value)?.type)) {
          aliasSourceRoot.set(id.name, aliasSourceName(collectGateRoots(value, [])[0]));
        }
      }
    } else if (id?.type === 'ArrayPattern' || id?.type === 'ObjectPattern') {
      // pattern slots pair positionally / by key downstream - flat over-approximation here
      recordPatternSlots(id, null, value);
    }
  }

  // an object-pattern slot extracts the property its KEY names, so that key is what the slot can
  // stand for (`const { Object: O } = globalThis` makes O the `Object` namespace). a positional or
  // computed slot names nothing the gate can follow, and keeps the point query open
  function recordPatternSlots(pattern, key, source) {
    if (!pattern || typeof pattern !== 'object') return;
    switch (pattern.type) {
      case 'Identifier':
        valueBound.add(pattern.name);
        aliasSourceRoot.set(pattern.name, key);
        return;
      case 'ObjectPattern':
        for (const prop of pattern.properties ?? []) {
          if (prop.type === 'RestElement') recordPatternSlots(prop.argument, null, null);
          else recordPatternSlots(prop.value, prop.computed ? null : propertyKeyName(prop), null);
        }
        return;
      case 'ArrayPattern': {
        // a positional slot takes the source's element: an array LITERAL names it exactly, and any
        // other source names whatever its own chain starts from - the resolver could only follow it
        // that far either. an unreadable source keeps those slots open
        const elements = unwrapRuntimeExpr(source)?.type === 'ArrayExpression'
          ? unwrapRuntimeExpr(source).elements : null;
        const fallback = source ? aliasSourceName(collectGateRoots(source, [])[0]) : null;
        for (let i = 0; i < (pattern.elements?.length ?? 0); i++) {
          const slotSource = elements ? elements[i] : null;
          recordPatternSlots(pattern.elements[i], elements
            ? aliasSourceName(slotSource ? collectGateRoots(slotSource, [])[0] : null)
            : fallback, null);
        }
        return;
      }
      case 'AssignmentPattern':
        recordPatternSlots(pattern.left, key, null);
        return;
      case 'RestElement':
        recordPatternSlots(pattern.argument, null, null);
        return;
      default:
        walkAstChildren(pattern, child => recordPatternSlots(child, null, null));
    }
  }
  // a `this` target names the global object only in a top-level `this` context - exactly what the
  // scoped stage checks before attributing one. recorded per target while the frame is at hand
  const topLevelThisTargets = new WeakSet();
  function visit(node, frame) {
    if (frame?.atThisTopLevel) markTopLevelThis = true;
    else markTopLevelThis = false;
    switch (node.type) {
      case 'AssignmentExpression': {
        const left = unwrapRuntimeExpr(node.left);
        if (left?.type === 'MemberExpression' || left?.type === 'OptionalMemberExpression') {
          pushTarget(gateMemberTarget(left));
        } else if (left?.type === 'ArrayPattern' || left?.type === 'ObjectPattern') {
          gatherPatternMemberTargets(left, { push: pushTarget });
          // bare identifier elements assign global slots like the flat form - gate on them too
          walkPatternIdentifiers(left, id => pushTarget(id));
          recordValueSource(left, node.right);
        } else {
          recordValueSource(left, node.right);
          // a bare reassignment of a global name writes the global slot - the Identifier
          // itself gates the scoped pass (bound / lowercase writes filter out there)
          if (left?.type === 'Identifier') pushTarget(left);
        }
        break;
      }
      case 'UpdateExpression': {
        const arg = unwrapRuntimeExpr(node.argument);
        if (arg?.type === 'MemberExpression' || arg?.type === 'OptionalMemberExpression') pushTarget(gateMemberTarget(arg));
        else if (arg?.type === 'Identifier') pushTarget(arg);
        break;
      }
      case 'UnaryExpression': {
        const arg = node.operator === 'delete' ? unwrapRuntimeExpr(node.argument) : null;
        if (arg?.type === 'MemberExpression' || arg?.type === 'OptionalMemberExpression') pushTarget(gateMemberTarget(arg));
        break;
      }
      case 'ForInStatement':
      case 'ForOfStatement':
        switch (node.left?.type) {
          case 'MemberExpression':
            pushTarget(gateMemberTarget(node.left));
            break;
          case 'ArrayPattern':
          case 'ObjectPattern':
            gatherPatternMemberTargets(node.left, { push: pushTarget });
            walkPatternIdentifiers(node.left, id => pushTarget(id));
            break;
          case 'Identifier':
            pushTarget(node.left);
            break;
        }
        break;
      case 'VariableDeclarator':
        recordValueSource(node.id, node.init);
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
        // the TS require-import twin of the case above; adapter-less reducer reads the
        // module-reference string directly
        if (tsImportEqualsProxyName(node, null, packages)) {
          valueBound.add(node.id.name);
          proxyGlobalBound.add(node.id.name);
        }
        break;
      case 'ClassDeclaration':
        if (node.id?.type === 'Identifier') {
          let nodes = containerBound.get(node.id.name);
          if (!nodes) containerBound.set(node.id.name, nodes = []);
          nodes.push(node);
        }
        break;
      case 'CallExpression':
      case 'OptionalCallExpression': {
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
          pushTarget(node.arguments[0]);
          // Reflect.set(target, key, value, RECEIVER): a receiver arg redirects the data-property
          // write to the receiver, making IT the mutation host - flag both candidates
          if (node.arguments[3] && (method === 'set' || method === null || callee.computed)) {
            pushTarget(node.arguments[3]);
          }
        }
        break;
      }
      default:
    }
  }
  const rootNames = new Set();

  // a write THROUGH the global object names its namespace in the key nearest the root - record it
  // and report success. the walk carries only that one key, so anything deeper stays unnamed: a
  // dynamic key, the interop wrapper's `default` hop, and a further proxy-global hop
  // (`globalThis.self.Object.create = x`) all leave the caller to open the query instead
  function nameGlobalObjectKey(root) {
    const key = root.firstKey;
    if (key === null || key === 'default' || POSSIBLE_GLOBAL_OBJECTS.has(key)) return false;
    rootNames.add(key);
    return true;
  }

  function result() {
    // the point-query gate: a slot of `Ctor` can only be written through a target whose ROOT is
    // `Ctor` itself or an alias that follows to it. collecting those root names lets a typing
    // question about one slot skip the scoped pass entirely, instead of paying a whole-file walk
    // for a file that never touches that namespace. `open` keeps the gate a SUPERSET: a root the
    // walk cannot name (a call result, `this`, a followable alias) rules nothing out
    let open = false;
    let hasMutationShapes = false;
    for (const target of targets) {
      for (const root of collectGateRoots(target, [])) {
        // a CALL-rooted target names no namespace the scoped stage could attribute either, so it
        // fires the coarse verdict without opening the point query
        if (root.callRooted) {
          hasMutationShapes = true;
          continue;
        }
        // a `this`-rooted target fires when the key nearest the root is built-in-shaped, or
        // when the target is the bare `this` itself (a mutator-call arg whose resolvable
        // literal keys can land on the global). dynamic-key members (`this[k] = v`) and
        // lowercase instance writes (`this.x = v`) stay silent - the scoped stage records
        // nothing for them (global-object carve-out / the bare-write lowercase cut), so the
        // gate stays a superset without firing on these ubiquitous shapes
        if (root.thisRooted) {
          if (root.firstKey === null ? !root.chained
            : (root.firstKey[0] >= 'A' && root.firstKey[0] <= 'Z') || POSSIBLE_GLOBAL_OBJECTS.has(root.firstKey)) {
            hasMutationShapes = true;
            // outside a top-level `this` context the scoped stage attributes this target to no
            // namespace at all, so the point query may rule it out rather than open
            if (!topLevelThisTargets.has(target)) continue;
            // `this.Map = shim` on the global object writes the `Map` slot - the key names it
            if (!nameGlobalObjectKey(root)) open = true;
          }
          continue;
        }
        const fires = (root.name[0] >= 'A' && root.name[0] <= 'Z')
          || POSSIBLE_GLOBAL_OBJECTS.has(root.name)
          || valueBound.has(root.name)
          || (root.chained && containerHasKey(containerBound.get(root.name), root.firstKey));
        if (!fires) continue;
        hasMutationShapes = true;
        // an ALIAS root stands for whatever its source chain starts from: follow that instead of
        // surrendering, so a file full of ordinary `const x = a.b; x.c = v` writes still rules out
        // an untouched namespace. an unnameable source (a pattern slot, a call) keeps it open
        rootNames.add(root.name);
        for (let { name } = root, hops = 0; aliasSourceRoot.has(name) && hops < 8; hops++) {
          const source = aliasSourceRoot.get(name);
          if (source === NAMES_NOTHING) break;
          if (source === null) {
            open = true;
            break;
          }
          rootNames.add(source);
          if (source === name) break;
          name = source;
        }
        // through the GLOBAL OBJECT the namespace is the next key, not the root: `globalThis.Object
        // .create = x` patches `Object`, so the point query for it must still reach the scoped pass.
        // a binding that IS the global object (a proxy-entry import) heads the same shape.
        // a dynamic key there names nothing and leaves the gate open
        if ((POSSIBLE_GLOBAL_OBJECTS.has(root.name) || proxyGlobalBound.has(root.name)) && root.chained
          && !nameGlobalObjectKey(root)) open = true;
      }
    }
    return { hasMutationShapes, mutationRoots: { names: rootNames, open } };
  }
  return { visit, result };
}

export function hasMutationCandidateShapes(programNode, packages = null) {
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
  const decl = binding?.path?.node ?? binding?.node;
  return decl?.type === 'VariableDeclarator' ? decl : null;
}

// the literal init sub-node a destructured name selects (`const { s } = { s: {...} }` -> the inner
// literal), via the canonical pattern / literal pairer
function destructuredLiteralSource(node, ctx) {
  const id = unwrapRuntimeExpr(node);
  if (id?.type !== 'Identifier') return null;
  const decl = bindingDeclarator(id.name, ctx);
  if (!decl || decl.id?.type === 'Identifier') return null;
  for (const value of patternSlotValues(decl.id, decl.init, id.name, { ...ctx, resolveKey })) {
    const resolved = unwrapRuntimeExpr(value);
    if (resolved?.type === 'ObjectExpression') return resolved;
  }
  return null;
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

function bareGlobalSlotEntry(node, ctx) {
  if (node?.type !== 'Identifier' || NON_WRITABLE_VALUE_GLOBALS.has(node.name)) return null;
  if (!((node.name[0] >= 'A' && node.name[0] <= 'Z') || POSSIBLE_GLOBAL_OBJECTS.has(node.name))) return null;
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
  if (target?.type !== 'ArrayPattern' && target?.type !== 'ObjectPattern') return [];
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

// assignment operators under which an identity self-copy stays a value no-op: plain assignment
// and the logical forms (either keep the current value or install the same slot's value).
// arithmetic compounds (`X += globalThis.X`) DERIVE a new value - a real mutation
const IDENTITY_PRESERVING_ASSIGN_OPS = new Set(['=', '||=', '&&=', '??=']);

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
    const rhs = IDENTITY_PRESERVING_ASSIGN_OPS.has(node.operator) ? unwrapRuntimeExpr(node.right) : null;
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
  // the detached-call idiom `(0, Object.defineProperty)(...)` buries the member behind a
  // sequence tail - dispatch on the PEELED callee so wrapper / SE-tail shapes classify like
  // their bare twins
  const callee = peelToBareExpr(node.callee);
  let namespace = null;
  let method = null;
  if (callee?.type === 'MemberExpression' || callee?.type === 'OptionalMemberExpression') {
    namespace = peeledNamespaceName(callee.object, ctx);
    // a computed mutator callee (`Object["defineProperty"]`, const-aliased `Object[m]`) resolves
    // its method through the same binding-aware key canon the member side uses
    method = callee.computed
      ? mutationKeyName(callee.property, true, ctx)
      : (callee.property?.type === 'Identifier' ? callee.property.name : null);
  } else {
    // an extracted (`const dp = Object.defineProperty; dp(...)`) or destructured
    // (`const { defineProperty } = Object`) mutator names the same namespace method
    const pair = bareCalleeStaticPair(callee, ctx);
    if (pair) ({ namespace, method } = pair);
  }
  if (!namespace) return [];
  const args = node.arguments ?? [];
  if (!args[0]) return [];
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
  const decl = bindingDeclarator(callee.name, ctx);
  if (!decl) return null;
  const sources = decl.id?.type === 'Identifier'
    ? [unwrapRuntimeExpr(decl.init)]
    : patternSlotValues(decl.id, decl.init, callee.name, { ...ctx, resolveKey }).map(unwrapRuntimeExpr);
  for (const member of sources) {
    if (member?.type !== 'MemberExpression' && member?.type !== 'OptionalMemberExpression') continue;
    // a resolvable namespace with an UNREADABLE method (`const fn = Object[m]`) still names a
    // possible mutator - the caller deopts the call's mutation hosts whole
    const method = mutationKeyName(member.property, member.computed, ctx);
    const namespace = peeledNamespaceName(member.object, ctx);
    if (namespace) return { namespace, method };
  }
  return null;
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
  const base = name.endsWith('.prototype') ? name.slice(0, -'.prototype'.length) : name;
  mutated.add(mutatedStaticKey('globalThis', base));
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
export function createMutationSiteHandler({ adapter, mutated }) {
  const pendingIdentitySkips = [];
  function handleSite(path) {
    const ctx = { scope: path.scope, adapter, path, pendingIdentitySkips };
    for (const entry of classifyMutationSite(path.node, path.parent, path.parentPath?.parent, ctx)) {
      if (entry.globalSlotKey) {
        mutated.add(mutatedStaticKey('globalThis', entry.globalSlotKey));
        continue;
      }
      const { targetNode, keys } = entry;
      const { names, receiverDeopts } = resolveMutationSite({ targetNode, scope: path.scope, adapter, path });
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
export function enrichMutatedStatics({ mutatedStatics, resolvePure, injectPureImport }) {
  for (const mutatedKey of mutatedStatics ?? []) {
    const dot = mutatedKey.lastIndexOf('.');
    let ctorName = mutatedKey.slice(0, dot);
    const protoKey = ctorName.endsWith('.prototype');
    if (protoKey) {
      ctorName = ctorName.slice(0, -'.prototype'.length);
      const pure = resolvePure({
        kind: 'property', object: ctorName, key: mutatedKey.slice(dot + 1), placement: 'prototype',
      });
      if (pure) injectPureImport(pure.entry, pure.hintName);
      continue;
    }
    // a PROXY-GLOBAL host names a global SLOT (`window.Promise = Shim`, bare `Promise = Shim`):
    // the whole name is DEOPTED (see the slot-deopt model above) - nothing of it is ever
    // substituted, so there is no ponyfill to pin; skip without enrichment
    if (POSSIBLE_GLOBAL_OBJECTS.has(ctorName)) continue;
    if (!resolvePure({ kind: 'global', name: ctorName })) continue;
    const pure = resolvePure({
      kind: 'property', object: ctorName, key: mutatedKey.slice(dot + 1), placement: 'static',
    });
    if (pure && pure.kind !== 'instance') injectPureImport(pure.entry, pure.hintName);
  }
}

// --- Stage 3: canonical receiver resolution ---

// composite value expressions fan out to every POSSIBLE runtime value before the canons see
// them (a sequence flows its tail, a ternary / logical / chain-assign flows both / the RHS) -
// this is expression-shape fan-out only; all NAME resolution stays in the canons
function valueFanLeaves(node, leaves, depth = 0) {
  let value = node;
  while (value && (value.type === 'ParenthesizedExpression' || value.type === 'ChainExpression'
    || TS_EXPR_WRAPPERS.has(value.type))) value = value.expression;
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
    root = unwrapRuntimeExpr(root.object);
    while (root?.type === 'SequenceExpression' && root.expressions.length) {
      root = unwrapRuntimeExpr(root.expressions.at(-1));
    }
  }
  return root ? { rootNode: root, keys } : null;
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
    const parts = memberChainParts(leaf, ctx);
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
        const root = resolveObjectName({ objectNode: parts.rootNode, scope, adapter, path })
          ?? (!adapter.hasBinding(scope, parts.rootNode.name, path) ? parts.rootNode.name : null);
        if (root) return `${ root }.prototype`;
      } else if (POSSIBLE_GLOBAL_OBJECTS.has(parts.rootNode.name)
        && parts.keys.slice(0, -2).every(key => POSSIBLE_GLOBAL_OBJECTS.has(key))
        && !adapter.hasBinding(scope, parts.rootNode.name, path)) {
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
    return walkStaticReceiverChain({ receiverNode: parts.rootNode, walkPath: parts.keys, scope, adapter, path });
  }
  return null;
}

// canonical names for one mutation receiver, following the read-side canons. over-records by
// design: every REACHABLE value of a (re)assigned alias is poisoned - the safe direction.
// `receiverDeopts` carries chain ROOT names whose reached value is unknowable (an unreadable
// hop - `Array[k].x = v` could have patched anything under Array); the handler deopts them
// whole. `thisPath` (alias fans only) anchors the top-level-`this` context check at the
// declarator that captured the `this`, not the mutation site
function resolveMutationSite({ targetNode, scope, adapter, path }) {
  const names = new Set();
  const receiverDeopts = new Set();
  const seenBindings = new Set();
  function visitAliasValues(valueNode, depth, thisPath = null) {
    if (!valueNode || depth > 8) return;
    for (const leaf of valueFanLeaves(valueNode, [])) {
      const name = resolveLeafName(leaf, { scope, adapter, path, thisPath });
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
    if (binding) {
      if (seenBindings.has(binding)) return;
      seenBindings.add(binding);
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
    // a destructure declarator binds a SELECTED slot: the canonical pattern / literal pairer
    // yields the slot's value union (nested patterns, holes, last-wins keys, spread bails), and
    // a receiver-shaped source synthesizes the member (`const { prototype: P } = Array` ->
    // `Array.prototype`), which the leaf resolver keys as the prototype pair
    const decl = binding.path?.node ?? binding.node;
    // the binding's own path anchors an aliased `this` (`const g = this; g.Promise = shim`)
    // where the `this` textually sits; reassignment rhs nodes carry no path, so the
    // declaration anchor over-approximates them (over-record - the safe direction)
    const bindingPath = binding.path ?? null;
    const patternDeclarator = decl?.type === 'VariableDeclarator' && decl.id && decl.id.type !== 'Identifier';
    if (patternDeclarator) {
      for (const slotValue of patternSlotValues(decl.id, decl.init, identNode.name, { scope, adapter, path, resolveKey })) {
        visitAliasValues(slotValue, depth, bindingPath);
      }
    }
    // a pattern declarator's init is the WHOLE rhs (`Array` for `{ prototype: P } = Array`):
    // fanning it would smuggle the CONTAINER name and record a spurious static beside the
    // slot fan's correct pair - the selected slot values above are the only sound fan there
    const init = binding.path?.node?.init ?? binding.node?.init;
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
    const parts = memberChainParts(leaf, { scope, adapter, path });
    if (!parts) return;
    // an unreadable HOP hides which value off the root was reached (`Array[k].x = v`) - the
    // mutation could sit anywhere under the root, so the ROOT deopts whole
    if (!parts.keys) {
      if (parts.rootNode.type === 'Identifier' && !adapter.hasBinding(scope, parts.rootNode.name, path)) {
        receiverDeopts.add(parts.rootNode.name);
        return;
      }
      for (const valueLeaf of chainRootValueLeaves(parts.rootNode)) {
        const rootName = resolveLeafName(valueLeaf, { scope, adapter, path, thisPath });
        if (rootName) {
          receiverDeopts.add(rootName);
          return;
        }
      }
      return;
    }
    if (parts.keys.slice(0, -1).some(key => !POSSIBLE_GLOBAL_OBJECTS.has(key))) return;
    for (const valueLeaf of chainRootValueLeaves(parts.rootNode)) {
      const rootName = resolveLeafName(valueLeaf, { scope, adapter, path, thisPath });
      if (rootName && POSSIBLE_GLOBAL_OBJECTS.has(rootName)) {
        names.add(parts.keys.at(-1));
        return;
      }
    }
  }
  // every reachable value leaf of a chain root: a BOUND identifier fans its init +
  // reassignment union, an inline value composite fans its own branches
  function chainRootValueLeaves(rootNode) {
    let rootValues;
    if (rootNode.type === 'Identifier') {
      if (!adapter.hasBinding(scope, rootNode.name, path)) return [];
      const binding = adapter.getBinding(scope, rootNode.name, path);
      if (!binding) return [];
      const init = binding.path?.node?.init ?? binding.node?.init;
      rootValues = [init, ...reassignmentValueNodes({
        binding, usagePath: path, name: rootNode.name, ctx: { scope, adapter, path, resolveKey },
      }) ?? []];
    } else rootValues = [rootNode];
    const leaves = [];
    for (const valueNode of rootValues) if (valueNode) valueFanLeaves(valueNode, leaves);
    return leaves;
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
      const name = resolveLeafName(leaf, { scope, adapter, path });
      if (name) names.add(name);
      else if (leaf.type === 'MemberExpression' || leaf.type === 'OptionalMemberExpression') visitChainRootAlias(leaf);
    }
  }
  return { names: [...names], receiverDeopts: [...receiverDeopts] };
}
