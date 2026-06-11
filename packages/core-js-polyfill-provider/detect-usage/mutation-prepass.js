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
import { POSSIBLE_GLOBAL_OBJECTS } from '../helpers/class-walk.js';
import {
  isMemberMutationContext,
  mayHaveSideEffects,
  memberKeyName,
  propertyKeyName,
  reassignmentValueNodes,
  staticStringKey,
  TS_EXPR_WRAPPERS,
  unwrapRuntimeExpr,
  walkAstChildren,
} from '../helpers/ast-patterns.js';
import { resolveObjectName } from './resolve.js';
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

const OBJECT_MUTATORS = new Set([
  'defineProperty',
  'defineProperties',
  'assign',
]);

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

function gateRootOf(node) {
  let root = node;
  let hops = 0;
  for (;;) {
    if (!root) return null;
    if (root.type === 'MemberExpression' || root.type === 'OptionalMemberExpression') {
      root = root.object;
      hops++;
    } else if (root.type === 'SequenceExpression' && root.expressions.length) {
      root = root.expressions.at(-1);
    } else if (root.type === 'ParenthesizedExpression' || root.type === 'ChainExpression'
      || TS_EXPR_WRAPPERS.has(root.type)) {
      root = root.expression;
    } else break;
  }
  return root.type === 'Identifier' ? { name: root.name, chained: hops > 0 } : null;
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
  const containerBound = new Set();
  function recordValueSource(id, value) {
    if (id?.type === 'Identifier') {
      if (!value || INERT_VALUE_TYPES.has(value.type)) return;
      if (value.type === 'ObjectExpression' || value.type === 'ClassExpression') containerBound.add(id.name);
      else valueBound.add(id.name);
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
      case 'AssignmentExpression':
        if (node.left?.type === 'MemberExpression' || node.left?.type === 'OptionalMemberExpression') {
          targets.push(node.left.object);
        } else if (node.left?.type === 'ArrayPattern' || node.left?.type === 'ObjectPattern') {
          gatherPatternMemberTargets(node.left, targets);
          recordValueSource(node.left, node.right);
        } else recordValueSource(node.left, node.right);
        break;
      case 'UpdateExpression':
        if (node.argument?.type === 'MemberExpression') targets.push(node.argument.object);
        break;
      case 'UnaryExpression':
        if (node.operator === 'delete' && node.argument?.type === 'MemberExpression') targets.push(node.argument.object);
        break;
      case 'ForInStatement':
      case 'ForOfStatement':
        if (node.left?.type === 'MemberExpression') targets.push(node.left.object);
        else if (node.left?.type === 'ArrayPattern' || node.left?.type === 'ObjectPattern') gatherPatternMemberTargets(node.left, targets);
        break;
      case 'VariableDeclarator':
        recordValueSource(node.id, node.init);
        break;
      case 'ClassDeclaration':
        if (node.id?.type === 'Identifier') containerBound.add(node.id.name);
        break;
      case 'CallExpression': {
        const { callee } = node;
        const method = callee?.type === 'MemberExpression' && !callee.computed
          && callee.object?.type === 'Identifier' && callee.property?.type === 'Identifier'
          ? callee.property.name : null;
        if (((callee?.object?.name === 'Object' && OBJECT_MUTATORS.has(method))
          || (callee?.object?.name === 'Reflect' && REFLECT_MUTATORS.has(method))) && node.arguments?.[0]) targets.push(node.arguments[0]);
        break;
      }
      default:
    }
    walkAstChildren(node, child => work.push(child));
  }
  if (!targets.length) return false;
  for (const target of targets) {
    const root = gateRootOf(target);
    if (!root) continue;
    if (root.name[0] >= 'A' && root.name[0] <= 'Z') return true;
    if (POSSIBLE_GLOBAL_OBJECTS.has(root.name)) return true;
    if (valueBound.has(root.name)) return true;
    if (root.chained && containerBound.has(root.name)) return true;
  }
  return false;
}

// --- Stage 2: per-site classification (shape only - shadow checks live in the resolver) ---

const REFLECT_MUTATORS = new Set([
  'defineProperty',
  'deleteProperty',
  'set',
]);

function objectLiteralKeys(node) {
  if (node?.type !== 'ObjectExpression') return [];
  const keys = [];
  for (const prop of node.properties ?? []) {
    if (prop.type === 'ObjectProperty' || prop.type === 'Property' || prop.type === 'ObjectMethod') {
      const key = propertyKeyName(prop);
      if (key !== null) keys.push(key);
    }
  }
  return keys;
}

// `{ targetNode, keys, namespace }` entries for a mutation-shaped node; `namespace` names the
// Object / Reflect callee whose own shadowing the resolver must veto (a local `Object` is not
// the global namespace)
export function classifyMutationSite(node, parent, grandparent) {
  if (node.type === 'MemberExpression' && isMemberMutationContext(node, parent, grandparent)) {
    const key = memberKeyName(node);
    return key !== null ? [{ targetNode: node.object, keys: [key], namespace: null }] : [];
  }
  if (node.type !== 'CallExpression') return [];
  const { callee } = node;
  if (callee?.type !== 'MemberExpression' || callee.computed || callee.object?.type !== 'Identifier') return [];
  const namespace = callee.object.name;
  const method = callee.property?.type === 'Identifier' ? callee.property.name : null;
  const args = node.arguments ?? [];
  if (!args[0]) return [];
  if (namespace === 'Object') {
    if (method === 'defineProperty') {
      const key = staticStringKey(args[1]);
      return key !== null ? [{ targetNode: args[0], keys: [key], namespace }] : [];
    }
    if (method === 'defineProperties') {
      const keys = objectLiteralKeys(args[1]);
      return keys.length ? [{ targetNode: args[0], keys, namespace }] : [];
    }
    if (method === 'assign') {
      const keys = args.slice(1).flatMap(objectLiteralKeys);
      return keys.length ? [{ targetNode: args[0], keys, namespace }] : [];
    }
    return [];
  }
  if (namespace === 'Reflect' && REFLECT_MUTATORS.has(method)) {
    const key = staticStringKey(args[1]);
    return key !== null ? [{ targetNode: args[0], keys: [key], namespace }] : [];
  }
  return [];
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

// member chain -> { rootNode, keys } when every hop key is static; null otherwise
function memberChainParts(node) {
  const keys = [];
  let root = node;
  while (root && (root.type === 'MemberExpression' || root.type === 'OptionalMemberExpression')) {
    const key = memberKeyName(root);
    if (typeof key !== 'string') return null;
    keys.unshift(key);
    root = unwrapRuntimeExpr(root.object);
    while (root?.type === 'SequenceExpression' && root.expressions.length) {
      root = unwrapRuntimeExpr(root.expressions.at(-1));
    }
  }
  return root?.type === 'Identifier' ? { rootNode: root, keys } : null;
}

function resolveLeafName(leaf, { scope, adapter, path }) {
  const direct = resolveObjectName({ objectNode: leaf, scope, adapter, path });
  if (direct) return direct;
  // static-container chains (`NS.M` over `const NS = { M: Map }` / class statics): the
  // destructure receiver canon walks the same literal hops
  if (leaf.type === 'MemberExpression' || leaf.type === 'OptionalMemberExpression') {
    const parts = memberChainParts(leaf);
    if (parts) return walkStaticReceiverChain({ receiverNode: parts.rootNode, walkPath: parts.keys, scope, adapter, path });
  }
  return null;
}

// canonical names for one mutation receiver, following the read-side canons. over-records by
// design: every REACHABLE value of a (re)assigned alias is poisoned - the safe direction
export function resolveMutationSite({ targetNode, scope, adapter, path }) {
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
    for (const rhs of reassignmentValueNodes({ binding, usagePath: path, name: identNode.name }) ?? []) visitAliasValues(rhs, depth);
  };
  // a member-chain target whose root is a BOUND identifier may reach a proxy global through
  // any of the root's values (`let h; h = c ? other : globalThis; h.Array.of = patch`): fan
  // the root's value union and key the mutation under the chain's constructor leaf when a
  // reachable value is a proxy global (over-record - the safe direction)
  const visitChainRootAlias = leaf => {
    const parts = memberChainParts(leaf);
    if (!parts || parts.rootNode.type !== 'Identifier') return;
    if (!adapter.hasBinding(scope, parts.rootNode.name, path)) return;
    if (!parts.keys.slice(0, -1).every(key => POSSIBLE_GLOBAL_OBJECTS.has(key))) return;
    const binding = adapter.getBinding(scope, parts.rootNode.name, path);
    if (!binding) return;
    const init = binding.path?.node?.init ?? binding.node?.init;
    const rootValues = [init, ...reassignmentValueNodes({ binding, usagePath: path, name: parts.rootNode.name }) ?? []];
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
export function namespaceIsShadowed(namespace, { scope, adapter, path }) {
  return !!namespace && adapter.hasBinding(scope, namespace, path);
}

// re-exported so plugin-side collectors can suppress taint for effect-bearing leaves the
// substitution machinery handles separately
export { mayHaveSideEffects };
