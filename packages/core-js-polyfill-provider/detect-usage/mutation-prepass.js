// Mutation pre-pass: canonicalizes monkey-patch receivers through the SAME resolution canons
// the read side uses (`resolveObjectName` for names, `walkStaticReceiverChain` for static
// containers, `reassignmentValueNodes` for the alias value union), so the mutation set and
// the substitution decisions cannot diverge by construction. Replaces the former parallel
// node-only alias graph.
//
// Two stages for cost: `hasMutationCandidateShapes` is a cheap node walk (no scopes); the
// SCOPED per-site resolution runs only when it fires - files without monkey-patch shapes
// (the overwhelming majority) pay nothing beyond the walk. The plugins own the scoped
// traversal (each dialect collects sites with live paths) and feed `resolveMutationSite`.
import {
  collectFileCensus,
  followConstLiteralAlias,
  unwrapRuntimeExpr,
  isMemberMutationContext,
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
  if (root?.type === 'Identifier') out.push({ name: root.name, chained: hops > 0, firstKey });
  // a CALL-rooted target (`getArr().from = patch`) is opaque to the cheap name heuristics, but
  // the scoped stage CAN resolve it (it inlines a transparent call's return) - report it as a
  // gate-firing root so the cheap gate stays a SUPERSET of the scoped value fan
  else if (root?.type === 'CallExpression' || root?.type === 'OptionalCallExpression') {
    out.push({ name: '', callRooted: true, chained: hops > 0, firstKey });
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

function gatherPatternMemberTargets(pattern, out) {
  const work = [pattern];
  while (work.length) {
    const node = work.pop();
    if (!node || typeof node !== 'object') continue;
    if (node.type === 'MemberExpression' || node.type === 'OptionalMemberExpression') {
      out.push(node.object);
      continue;
    }
    walkAstChildren(node, child => work.push(child));
  }
}

// census-reducer form: the per-node collection runs from the shared file-census walk, the
// verdict is computed once in `result` over everything collected
export function mutationShapesReducer() {
  const targets = [];
  const valueBound = new Set();
  // name -> container nodes: the gate checks the chain's FIRST key against the container's
  // static keys, so `config.foo.bar = v` over `const config = {}` stays silent while
  // `NS.M.of = v` over `const NS = { M: Map }` fires
  const containerBound = new Map();
  function recordValueSource(id, value) {
    if (id?.type === 'Identifier') {
      if (!value || INERT_VALUE_TYPES.has(value.type)) return;
      if (value.type === 'ObjectExpression' || value.type === 'ClassExpression') {
        let nodes = containerBound.get(id.name);
        if (!nodes) containerBound.set(id.name, nodes = []);
        nodes.push(value);
      } else valueBound.add(id.name);
    } else if (id?.type === 'ArrayPattern' || id?.type === 'ObjectPattern') {
      // pattern slots pair positionally / by key downstream - flat over-approximation here
      const work = [id];
      while (work.length) {
        const node = work.pop();
        if (!node || typeof node !== 'object') continue;
        if (node.type === 'Identifier') valueBound.add(node.name);
        else walkAstChildren(node, child => work.push(child));
      }
    }
  }
  function visit(node) {
    switch (node.type) {
      case 'AssignmentExpression': {
        const left = unwrapRuntimeExpr(node.left);
        if (left?.type === 'MemberExpression' || left?.type === 'OptionalMemberExpression') {
          targets.push(left.object);
        } else if (left?.type === 'ArrayPattern' || left?.type === 'ObjectPattern') {
          gatherPatternMemberTargets(left, targets);
          // bare identifier elements assign global slots like the flat form - gate on them too
          walkPatternIdentifiers(left, id => targets.push(id));
          recordValueSource(left, node.right);
        } else {
          recordValueSource(left, node.right);
          // a bare reassignment of a global name writes the global slot - the Identifier
          // itself gates the scoped pass (bound / lowercase writes filter out there)
          if (left?.type === 'Identifier') targets.push(left);
        }
        break;
      }
      case 'UpdateExpression': {
        const arg = unwrapRuntimeExpr(node.argument);
        if (arg?.type === 'MemberExpression' || arg?.type === 'OptionalMemberExpression') targets.push(arg.object);
        else if (arg?.type === 'Identifier') targets.push(arg);
        break;
      }
      case 'UnaryExpression': {
        const arg = node.operator === 'delete' ? unwrapRuntimeExpr(node.argument) : null;
        if (arg?.type === 'MemberExpression' || arg?.type === 'OptionalMemberExpression') targets.push(arg.object);
        break;
      }
      case 'ForInStatement':
      case 'ForOfStatement':
        switch (node.left?.type) {
          case 'MemberExpression':
            targets.push(node.left.object);
            break;
          case 'ArrayPattern':
          case 'ObjectPattern':
            gatherPatternMemberTargets(node.left, targets);
            walkPatternIdentifiers(node.left, id => targets.push(id));
            break;
          case 'Identifier':
            targets.push(node.left);
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
        if (globalProxyNameFromImportSource(node.source?.value)) {
          for (const s of node.specifiers ?? []) {
            if ((bindsModuleDefault(s) || s.type === 'ImportNamespaceSpecifier') && s.local?.name) {
              valueBound.add(s.local.name);
            }
          }
        }
        break;
      case 'TSImportEqualsDeclaration':
        // the TS require-import twin of the case above; adapter-less reducer reads the
        // module-reference string directly
        if (tsImportEqualsProxyName(node, null)) valueBound.add(node.id.name);
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
          targets.push(node.arguments[0]);
          // Reflect.set(target, key, value, RECEIVER): a receiver arg redirects the data-property
          // write to the receiver, making IT the mutation host - flag both candidates
          if (node.arguments[3] && (method === 'set' || method === null || callee.computed)) {
            targets.push(node.arguments[3]);
          }
        }
        break;
      }
      default:
    }
  }
  function result() {
    for (const target of targets) {
      // a value-fan mutation target (`(cond ? Array : Map).from`, `(a || globalThis).Promise`,
      // `(h = Array).of`, `(c ? globalThis : self).Array.of`) reaches a built-in through any branch -
      // collectGateRoots fans the same composites the scoped pass resolves, keeping the cheap gate a
      // SUPERSET; otherwise the monkey-patch escapes the gate and usage-pure substitutes over it
      for (const root of collectGateRoots(target, [])) {
        if (root.callRooted) return { hasMutationShapes: true };
        if (root.name[0] >= 'A' && root.name[0] <= 'Z') return { hasMutationShapes: true };
        if (POSSIBLE_GLOBAL_OBJECTS.has(root.name)) return { hasMutationShapes: true };
        if (valueBound.has(root.name)) return { hasMutationShapes: true };
        if (root.chained && containerHasKey(containerBound.get(root.name), root.firstKey)) {
          return { hasMutationShapes: true };
        }
      }
    }
    return { hasMutationShapes: false };
  }
  return { visit, result };
}

export function hasMutationCandidateShapes(programNode) {
  return collectFileCensus(programNode, [mutationShapesReducer()]).hasMutationShapes;
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

function objectLiteralKeys(node, ctx) {
  // a variable source (`const src = { from: f }; Object.assign(Array, src)`) resolves to its const
  // init, so a copied static key is recorded like an inline `Object.assign(Array, { from: f })`;
  // a DESTRUCTURED source (`const { s } = { s: { from: f } }`) hides the literal behind a selector
  // the const-alias follower cannot see - pair the pattern with its literal init
  let obj = followConstLiteralAlias(node, ctx);
  if (obj?.type !== 'ObjectExpression') obj = destructuredLiteralSource(node, ctx);
  if (obj?.type !== 'ObjectExpression') return [];
  const keys = [];
  for (const prop of obj.properties ?? []) {
    if (prop.type === 'ObjectProperty' || prop.type === 'Property' || prop.type === 'ObjectMethod') {
      const key = mutationKeyName(prop.key, prop.computed, ctx);
      if (key !== null) keys.push(key);
    }
  }
  return keys;
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

function isIdentityFlatCopy(name, rhs, ctx) {
  if (rhs?.type !== 'MemberExpression' && rhs?.type !== 'OptionalMemberExpression') return false;
  return memberKeyName(rhs) === name && isBareProxyGlobalName(unwrapRuntimeExpr(rhs.object), ctx);
}

// all bare slot writes an ASSIGNMENT TARGET position can hold: a flat identifier or bare
// identifier leaves of a destructure pattern (`[Promise] = arr` - each is the same slot
// write as its flat twin). member leaves are classified by the member visitor, not here.
// `rhs` (assignment form only) feeds the identity self-copy exemption
function bareSlotWriteEntries(target, ctx, rhs = null) {
  const bare = bareGlobalSlotEntry(target, ctx);
  if (bare) return isIdentityFlatCopy(target.name, rhs, ctx) ? [] : [bare];
  if (target?.type !== 'ArrayPattern' && target?.type !== 'ObjectPattern') return [];
  const identity = identitySelfCopyLeaves(target, rhs, ctx);
  const out = [];
  walkPatternIdentifiers(target, id => {
    if (identity.has(id)) return;
    const entry = bareGlobalSlotEntry(id, ctx);
    if (entry) out.push(entry);
  });
  return out;
}

// delete / update / assignment classify from the HOST side with a
// DOWNWARD wrapper peel - parent-side hops can't see through stacked wrappers
// (`delete ((Map.groupBy))`, `delete (Map.groupBy as any)`), the peel depth is unbounded
function memberMutationEntry(slot, ctx) {
  const member = unwrapRuntimeExpr(slot);
  if (member?.type !== 'MemberExpression' && member?.type !== 'OptionalMemberExpression') return [];
  const key = mutationKeyName(member.property, member.computed, ctx);
  return key !== null ? [{ targetNode: member.object, keys: [key] }] : [];
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
    const entries = memberMutationEntry(node.left, ctx);
    if (entries.length) return entries;
    return bareSlotWriteEntries(unwrapRuntimeExpr(node.left), ctx, unwrapRuntimeExpr(node.right));
  }
  // a bare for-x LHS (`for (Promise of xs)`, `for ([Promise] of xs)`) assigns the slot on
  // every iteration; a VariableDeclaration LHS binds locally and falls out of the helper
  if (node.type === 'ForOfStatement' || node.type === 'ForInStatement') {
    return bareSlotWriteEntries(unwrapRuntimeExpr(node.left), ctx);
  }
  if ((node.type === 'MemberExpression' || node.type === 'OptionalMemberExpression')
    && isMemberMutationContext(node, parent, grandparent)) {
    const key = mutationKeyName(node.property, node.computed, ctx);
    return key !== null ? [{ targetNode: node.object, keys: [key] }] : [];
  }
  if (node.type !== 'CallExpression' && node.type !== 'OptionalCallExpression') return [];
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
  if (namespace === 'Object') {
    if (method === 'defineProperty') {
      const key = mutationKeyName(args[1], true, ctx);
      return key !== null ? [{ targetNode: args[0], keys: [key] }] : [];
    }
    if (method === 'defineProperties') {
      const keys = objectLiteralKeys(args[1], ctx);
      return keys.length ? [{ targetNode: args[0], keys }] : [];
    }
    if (method === 'assign') {
      const keys = args.slice(1).flatMap(arg => objectLiteralKeys(arg, ctx));
      return keys.length ? [{ targetNode: args[0], keys }] : [];
    }
    return [];
  }
  if (namespace === 'Reflect' && REFLECT_MUTATORS.has(method)) {
    const key = mutationKeyName(args[1], true, ctx);
    // Reflect.set(target, key, value, RECEIVER): with a receiver the data property lands on the
    // receiver, not target, so the receiver is the mutation host; 3-arg / other mutators use target
    const host = method === 'set' && args[3] ? args[3] : args[0];
    return key !== null ? [{ targetNode: host, keys: [key] }] : [];
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
    const method = mutationKeyName(member.property, member.computed, ctx);
    const namespace = method !== null ? peeledNamespaceName(member.object, ctx) : null;
    if (namespace) return { namespace, method };
  }
  return null;
}

// --- the per-site collector callback (shared by both plugins' traversals) ---
// classify the node as a mutation site (namespace shadowing is subsumed by the name canon),
// resolve the receiver through the read-side canons and record every `name.key` pair
export function createMutationSiteHandler({ adapter, mutated }) {
  return function handleSite(path) {
    const ctx = { scope: path.scope, adapter, path };
    for (const entry of classifyMutationSite(path.node, path.parent, path.parentPath?.parent, ctx)) {
      if (entry.globalSlotKey) {
        mutated.add(mutatedStaticKey('globalThis', entry.globalSlotKey));
        continue;
      }
      const { targetNode, keys } = entry;
      const { names } = resolveMutationSite({ targetNode, scope: path.scope, adapter, path });
      for (const name of names) for (const key of keys) mutated.add(mutatedStaticKey(name, key));
    }
  };
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

// member chain -> { rootNode, keys } when every hop key resolves to a static name (const-aliased
// hops follow the read-side canon); null otherwise. the root node is returned WHATEVER its type -
// a name-resolving caller filters to Identifier, while a value-fan caller fans a ternary / logical
// chain root (`(c ? globalThis : self).Array`) the single-Identifier form could not represent
function memberChainParts(node, ctx) {
  const keys = [];
  let root = node;
  while (root && (root.type === 'MemberExpression' || root.type === 'OptionalMemberExpression')) {
    const key = mutationKeyName(root.property, root.computed, ctx);
    if (typeof key !== 'string') return null;
    keys.unshift(key);
    root = unwrapRuntimeExpr(root.object);
    while (root?.type === 'SequenceExpression' && root.expressions.length) {
      root = unwrapRuntimeExpr(root.expressions.at(-1));
    }
  }
  return root ? { rootNode: root, keys } : null;
}

function resolveLeafName(leaf, ctx) {
  const { scope, adapter, path } = ctx;
  const direct = resolveObjectName({ objectNode: leaf, scope, adapter, path });
  if (direct) return direct;
  if (leaf.type === 'MemberExpression' || leaf.type === 'OptionalMemberExpression') {
    const parts = memberChainParts(leaf, ctx);
    // name resolution needs an Identifier root; a value-fan root is the chain-root-alias caller's job
    if (!parts || parts.rootNode.type !== 'Identifier') return null;
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
    // static-container chains (`NS.M` over `const NS = { M: Map }` / class statics): the
    // destructure receiver canon walks the same literal hops
    return walkStaticReceiverChain({ receiverNode: parts.rootNode, walkPath: parts.keys, scope, adapter, path });
  }
  return null;
}

// canonical names for one mutation receiver, following the read-side canons. over-records by
// design: every REACHABLE value of a (re)assigned alias is poisoned - the safe direction
function resolveMutationSite({ targetNode, scope, adapter, path }) {
  const names = new Set();
  const seenBindings = new Set();
  function visitAliasValues(valueNode, depth) {
    if (!valueNode || depth > 8) return;
    for (const leaf of valueFanLeaves(valueNode, [])) {
      const name = resolveLeafName(leaf, { scope, adapter, path });
      if (name) names.add(name);
      if (leaf.type === 'Identifier') visitBinding(leaf, depth + 1);
      // an alias bound to a chain root off a reassigned proxy holder (`let h; h = globalThis;
      // const alias = h.Array`) resolves no leaf name - fan its chain root like the target loop
      else if (!name && (leaf.type === 'MemberExpression' || leaf.type === 'OptionalMemberExpression')) {
        visitChainRootAlias(leaf);
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
    const patternDeclarator = decl?.type === 'VariableDeclarator' && decl.id && decl.id.type !== 'Identifier';
    if (patternDeclarator) {
      for (const slotValue of patternSlotValues(decl.id, decl.init, identNode.name, { scope, adapter, path, resolveKey })) {
        visitAliasValues(slotValue, depth);
      }
    }
    // a pattern declarator's init is the WHOLE rhs (`Array` for `{ prototype: P } = Array`):
    // fanning it would smuggle the CONTAINER name and record a spurious static beside the
    // slot fan's correct pair - the selected slot values above are the only sound fan there
    const init = binding.path?.node?.init ?? binding.node?.init;
    if (!patternDeclarator) visitAliasValues(init, depth);
    const reCtx = { scope, adapter, path, resolveKey };
    for (const rhs of reassignmentValueNodes({ binding, usagePath: path, name: identNode.name, ctx: reCtx }) ?? []) {
      visitAliasValues(rhs, depth);
    }
  }
  // a member-chain target whose root reaches a proxy global through a value fan keys the mutation
  // under the chain's constructor leaf when a reachable root value is a proxy global (over-record -
  // the safe direction). two root shapes fan: a BOUND identifier (`let h; h = c ? other : globalThis;
  // h.Array.of = patch`) fans its init + reassignment union; an INLINE value fan
  // (`(c ? globalThis : self).Array.of = patch`) fans the chain root's own branches
  function visitChainRootAlias(leaf) {
    const parts = memberChainParts(leaf, { scope, adapter, path });
    if (!parts) return;
    if (parts.keys.slice(0, -1).some(key => !POSSIBLE_GLOBAL_OBJECTS.has(key))) return;
    let rootValues;
    if (parts.rootNode.type === 'Identifier') {
      if (!adapter.hasBinding(scope, parts.rootNode.name, path)) return;
      const binding = adapter.getBinding(scope, parts.rootNode.name, path);
      if (!binding) return;
      const init = binding.path?.node?.init ?? binding.node?.init;
      rootValues = [init, ...reassignmentValueNodes({
        binding, usagePath: path, name: parts.rootNode.name, ctx: { scope, adapter, path, resolveKey },
      }) ?? []];
    } else rootValues = [parts.rootNode];
    for (const valueNode of rootValues) {
      if (!valueNode) continue;
      for (const valueLeaf of valueFanLeaves(valueNode, [])) {
        const rootName = resolveLeafName(valueLeaf, { scope, adapter, path });
        if (rootName && POSSIBLE_GLOBAL_OBJECTS.has(rootName)) {
          names.add(parts.keys.at(-1));
          return;
        }
      }
    }
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
  return { names: [...names] };
}
