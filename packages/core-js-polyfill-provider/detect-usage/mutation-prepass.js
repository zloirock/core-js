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
import { POSSIBLE_GLOBAL_OBJECTS, globalProxyMemberName } from '../helpers/class-walk.js';
import {
  followConstLiteralAlias,
  unwrapRuntimeExpr,
  isMemberMutationContext,
  memberKeyName,
  propertyKeyName,
  reassignmentValueNodes,
  TS_EXPR_WRAPPERS,
  walkAstChildren,
} from '../helpers/ast-patterns.js';
import { resolveKey, resolveObjectName } from './resolve.js';
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

// the namespace NAME of a mutator callee (`Object` / `Reflect`). a bare `(0, Object).assign` peels to
// `Object`; a proxy-global member chain - direct (`globalThis.Reflect.set`, `self.Object.assign`),
// aliased (`const g = globalThis; g.Reflect.set`) or hopped (`globalThis.self.Reflect.set`) - names the
// SAME global namespace, resolved through the canonical proxy-global member resolver (alias + hop aware)
function peeledNamespaceName(node, ctx) {
  const cur = peelToBareExpr(node);
  if (cur?.type === 'Identifier') return cur.name;
  return globalProxyMemberName({ node: cur, scope: ctx.scope, adapter: ctx.adapter, path: ctx.path });
}

// liberal namespace NAME for the cheap scope-less gate: a bare callee identifier, or the property of
// ANY `<x>.Object` / `<x>.Reflect` member (the scoped stage verifies the receiver actually resolves to
// a proxy global). lets an ALIASED namespace member (`g.Reflect.set`) fire the gate without a scope
function namespaceNameForGate(node) {
  const cur = peelToBareExpr(node);
  if (cur?.type === 'Identifier') return cur.name;
  if ((cur?.type === 'MemberExpression' || cur?.type === 'OptionalMemberExpression') && !cur.computed
    && cur.property?.type === 'Identifier') return cur.property.name;
  return null;
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

export function hasMutationCandidateShapes(programNode) {
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
  const work = [programNode];
  while (work.length) {
    const node = work.pop();
    if (!node || typeof node !== 'object') continue;
    switch (node.type) {
      case 'AssignmentExpression': {
        const left = unwrapRuntimeExpr(node.left);
        if (left?.type === 'MemberExpression' || left?.type === 'OptionalMemberExpression') {
          targets.push(left.object);
        } else if (left?.type === 'ArrayPattern' || left?.type === 'ObjectPattern') {
          gatherPatternMemberTargets(left, targets);
          recordValueSource(left, node.right);
        } else recordValueSource(left, node.right);
        break;
      }
      case 'UpdateExpression': {
        const arg = unwrapRuntimeExpr(node.argument);
        if (arg?.type === 'MemberExpression' || arg?.type === 'OptionalMemberExpression') targets.push(arg.object);
        break;
      }
      case 'UnaryExpression': {
        const arg = node.operator === 'delete' ? unwrapRuntimeExpr(node.argument) : null;
        if (arg?.type === 'MemberExpression' || arg?.type === 'OptionalMemberExpression') targets.push(arg.object);
        break;
      }
      case 'ForInStatement':
      case 'ForOfStatement':
        if (node.left?.type === 'MemberExpression') targets.push(node.left.object);
        else if (node.left?.type === 'ArrayPattern' || node.left?.type === 'ObjectPattern') gatherPatternMemberTargets(node.left, targets);
        break;
      case 'VariableDeclarator':
        recordValueSource(node.id, node.init);
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
        const { callee } = node;
        const isMember = callee?.type === 'MemberExpression' || callee?.type === 'OptionalMemberExpression';
        const ns = isMember && !callee.computed ? namespaceNameForGate(callee.object) : null;
        const method = ns && callee.property?.type === 'Identifier' ? callee.property.name : null;
        const reflectMutator = ns === 'Reflect' && REFLECT_MUTATORS.has(method);
        if (((ns === 'Object' && OBJECT_MUTATORS.has(method)) || reflectMutator) && node.arguments?.[0]) {
          targets.push(node.arguments[0]);
        }
        // Reflect.set(target, key, value, RECEIVER): a receiver arg redirects the data-property write
        // to the receiver, making IT the mutation host - the cheap gate flags both candidates
        if (reflectMutator && method === 'set' && node.arguments[3]) targets.push(node.arguments[3]);
        break;
      }
      default:
    }
    walkAstChildren(node, child => work.push(child));
  }
  if (!targets.length) return false;
  for (const target of targets) {
    // a value-fan mutation target (`(cond ? Array : Map).from`, `(a || globalThis).Promise`,
    // `(h = Array).of`, `(c ? globalThis : self).Array.of`) reaches a built-in through any branch -
    // collectGateRoots fans the same composites the scoped pass resolves, keeping the cheap gate a
    // SUPERSET; otherwise the monkey-patch escapes the gate and usage-pure substitutes over it
    for (const root of collectGateRoots(target, [])) {
      if (root.name[0] >= 'A' && root.name[0] <= 'Z') return true;
      if (POSSIBLE_GLOBAL_OBJECTS.has(root.name)) return true;
      if (valueBound.has(root.name)) return true;
      if (root.chained && containerHasKey(containerBound.get(root.name), root.firstKey)) return true;
    }
  }
  return false;
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

function objectLiteralKeys(node, ctx) {
  // a variable source (`const src = { from: f }; Object.assign(Array, src)`) resolves to its const
  // init, so a copied static key is recorded like an inline `Object.assign(Array, { from: f })`
  const obj = followConstLiteralAlias(node, ctx);
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

// `{ targetNode, keys, namespace }` entries for a mutation-shaped node; `namespace` names the
// Object / Reflect callee whose own shadowing the resolver must veto (a local `Object` is not
// the global namespace). delete / update / assignment classify from the HOST side with a
// DOWNWARD wrapper peel - parent-side hops can't see through stacked wrappers
// (`delete ((Map.groupBy))`, `delete (Map.groupBy as any)`), the peel depth is unbounded
function memberMutationEntry(slot, ctx) {
  const member = unwrapRuntimeExpr(slot);
  if (member?.type !== 'MemberExpression' && member?.type !== 'OptionalMemberExpression') return [];
  const key = mutationKeyName(member.property, member.computed, ctx);
  return key !== null ? [{ targetNode: member.object, keys: [key], namespace: null }] : [];
}

function classifyMutationSite(node, parent, grandparent, ctx) {
  if (node.type === 'UnaryExpression') {
    return node.operator === 'delete' ? memberMutationEntry(node.argument, ctx) : [];
  }
  if (node.type === 'UpdateExpression') return memberMutationEntry(node.argument, ctx);
  if (node.type === 'AssignmentExpression') return memberMutationEntry(node.left, ctx);
  if ((node.type === 'MemberExpression' || node.type === 'OptionalMemberExpression')
    && isMemberMutationContext(node, parent, grandparent)) {
    const key = mutationKeyName(node.property, node.computed, ctx);
    return key !== null ? [{ targetNode: node.object, keys: [key], namespace: null }] : [];
  }
  if (node.type !== 'CallExpression' && node.type !== 'OptionalCallExpression') return [];
  const { callee } = node;
  if ((callee?.type !== 'MemberExpression' && callee?.type !== 'OptionalMemberExpression')
    || callee.computed) return [];
  const namespace = peeledNamespaceName(callee.object, ctx);
  if (!namespace) return [];
  const method = callee.property?.type === 'Identifier' ? callee.property.name : null;
  const args = node.arguments ?? [];
  if (!args[0]) return [];
  if (namespace === 'Object') {
    if (method === 'defineProperty') {
      const key = mutationKeyName(args[1], true, ctx);
      return key !== null ? [{ targetNode: args[0], keys: [key], namespace }] : [];
    }
    if (method === 'defineProperties') {
      const keys = objectLiteralKeys(args[1], ctx);
      return keys.length ? [{ targetNode: args[0], keys, namespace }] : [];
    }
    if (method === 'assign') {
      const keys = args.slice(1).flatMap(arg => objectLiteralKeys(arg, ctx));
      return keys.length ? [{ targetNode: args[0], keys, namespace }] : [];
    }
    return [];
  }
  if (namespace === 'Reflect' && REFLECT_MUTATORS.has(method)) {
    const key = mutationKeyName(args[1], true, ctx);
    // Reflect.set(target, key, value, RECEIVER): with a receiver the data property lands on the
    // receiver, not target, so the receiver is the mutation host; 3-arg / other mutators use target
    const host = method === 'set' && args[3] ? args[3] : args[0];
    return key !== null ? [{ targetNode: host, keys: [key], namespace }] : [];
  }
  return [];
}

// --- the per-site collector callback (shared by both plugins' traversals) ---
// classify the node as a mutation site, veto shadowed Object / Reflect namespaces, resolve
// the receiver through the read-side canons and record every `name.key` pair
export function createMutationSiteHandler({ adapter, mutated }) {
  return function handleSite(path) {
    const ctx = { scope: path.scope, adapter, path };
    for (const { targetNode, keys, namespace } of classifyMutationSite(path.node, path.parent, path.parentPath?.parent, ctx)) {
      if (namespaceIsShadowed(namespace, { scope: path.scope, adapter, path })) continue;
      const { names } = resolveMutationSite({ targetNode, scope: path.scope, adapter, path });
      for (const name of names) for (const key of keys) mutated.add(`${ name }.${ key }`);
    }
  };
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
    // a PROXY-GLOBAL receiver names a global SLOT (`window.Promise = Shim`): the mutated
    // "key" IS a constructor - pin its own entry so core-js modules loading later in the
    // bundle initialize from the pristine global, not the replacement. explicit for every
    // proxy name: `window` has no pure entry, so the ctor-routing gate below would skip it
    if (POSSIBLE_GLOBAL_OBJECTS.has(ctorName)) {
      const pure = resolvePure({ kind: 'global', name: mutatedKey.slice(dot + 1) });
      if (pure && pure.kind !== 'instance') injectPureImport(pure.entry, pure.hintName);
      continue;
    }
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
  const visitAliasValues = (valueNode, depth) => {
    if (!valueNode || depth > 8) return;
    for (const leaf of valueFanLeaves(valueNode, [])) {
      const name = resolveLeafName(leaf, { scope, adapter, path });
      if (name) names.add(name);
      if (leaf.type === 'Identifier') visitBinding(leaf, depth + 1);
    }
  };
  const visitBinding = (identNode, depth) => {
    if (!adapter.hasBinding(scope, identNode.name, path)) return;
    const binding = adapter.getBinding(scope, identNode.name, path);
    if (!binding || seenBindings.has(binding)) return;
    seenBindings.add(binding);
    const init = binding.path?.node?.init ?? binding.node?.init;
    visitAliasValues(init, depth);
    const reCtx = { scope, adapter, path, resolveKey };
    for (const rhs of reassignmentValueNodes({ binding, usagePath: path, name: identNode.name, ctx: reCtx }) ?? []) {
      visitAliasValues(rhs, depth);
    }
  };
  // a member-chain target whose root reaches a proxy global through a value fan keys the mutation
  // under the chain's constructor leaf when a reachable root value is a proxy global (over-record -
  // the safe direction). two root shapes fan: a BOUND identifier (`let h; h = c ? other : globalThis;
  // h.Array.of = patch`) fans its init + reassignment union; an INLINE value fan
  // (`(c ? globalThis : self).Array.of = patch`) fans the chain root's own branches
  const visitChainRootAlias = leaf => {
    const parts = memberChainParts(leaf, { scope, adapter, path });
    if (!parts) return;
    if (!parts.keys.slice(0, -1).every(key => POSSIBLE_GLOBAL_OBJECTS.has(key))) return;
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
  };
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

// `namespace` veto: a LOCAL binding named Object / Reflect is not the global namespace
function namespaceIsShadowed(namespace, { scope, adapter, path }) {
  return !!namespace && adapter.hasBinding(scope, namespace, path);
}
