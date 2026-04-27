// known global names (constructors / namespaces / proxy globals) + logical-assign LHS
// diagnostics. constructors (Array, Map, ...) and global functions (parseInt, fetch, ...)
// are functions; namespaces (Math, JSON, Reflect, ...) and proxy globals (globalThis, self,
// ...) are plain objects
import knownBuiltInReturnTypes from '@core-js/compat/known-built-in-return-types' with { type: 'json' };
import { POSSIBLE_GLOBAL_OBJECTS, globalProxyMemberName } from '../helpers/class-walk.js';

export const KNOWN_FUNCTION_GLOBALS = new Set([
  ...Object.keys(knownBuiltInReturnTypes.constructors),
  ...Object.keys(knownBuiltInReturnTypes.globalMethods),
]);
export const KNOWN_NAMESPACE_GLOBALS = new Set(knownBuiltInReturnTypes.namespaces);

// any name that could be polyfilled by core-js (constructors, static methods, namespaces,
// and proxy globals). used for pattern diagnostics that should fire only for known globals
export function isKnownGlobalName(name) {
  return KNOWN_FUNCTION_GLOBALS.has(name) || KNOWN_NAMESPACE_GLOBALS.has(name) || POSSIBLE_GLOBAL_OBJECTS.has(name);
}

// logical-assignment operators: `||=`, `&&=`, `??=` read the LHS then conditionally write
const LOGICAL_ASSIGN_OPERATORS = new Set(['||=', '&&=', '??=']);

// shared gate for both Identifier and MemberExpression LHS checks: the AST shape must be
// `<node> <op>= ...` with a logical operator. returns the operator string or null
function logicalAssignOperator(node, parent) {
  if (parent?.type !== 'AssignmentExpression' || parent.left !== node) return null;
  return LOGICAL_ASSIGN_OPERATORS.has(parent.operator) ? parent.operator : null;
}

// LHS of `Map ||= ...` reads the global before polyfill loads (ReferenceError); the
// import binding is read-only anyway, so substitution also throws at write time
export function checkLogicalAssignLhsGlobal(identifier, parent, isBound) {
  if (isBound || identifier?.type !== 'Identifier' || !isKnownGlobalName(identifier.name)) return null;
  const op = logicalAssignOperator(identifier, parent);
  if (!op) return null;
  return `\`${ identifier.name } ${ op } ...\` left-hand side cannot be polyfilled `
    + `(read-only import binding); expected runtime engine to provide \`${ identifier.name }\``;
}

// `globalThis.Map ||= X` / `globalThis.self.Map ||= X` - MemberExpression LHS form, including
// multi-hop proxy chains (`globalThis.self`, `globalThis.window`). called from MemberExpression
// visitor before inner-identifier transformation mutates the leaf `globalThis` -> `_globalThis`;
// receiver and property still carry their pre-transform names at this visitation point.
// `globalProxyMemberName` walks the proxy-global chain and short-circuits on shadowed leafs
// (`function f(globalThis) { globalThis.Map ||= ... }`) - returns null when the chain doesn't
// bottom out on a real proxy global, which subsumes the per-callsite isBound check
export function checkLogicalAssignLhsMember(memberNode, parent, scope, adapter) {
  if (!memberNode || memberNode.type !== 'MemberExpression' || memberNode.computed) return null;
  const op = logicalAssignOperator(memberNode, parent);
  if (!op) return null;
  const propName = globalProxyMemberName(memberNode, scope, adapter);
  if (!propName || !isKnownGlobalName(propName)) return null;
  return `\`${ stringifyMemberChain(memberNode) } ${ op } ...\` left-hand side cannot be polyfilled `
    + `(plugin rewrites reads, not writes); expected runtime engine to provide \`${ propName }\``;
}

// dotted notation for the warning text. walks Identifier chains via MemberExpression /
// OptionalMemberExpression. fallback `?` for non-Identifier props (computed branches are
// already gated out earlier in the caller). only consumed by the warning string builder
function stringifyMemberChain(node) {
  if (node?.type === 'Identifier') return node.name;
  if (node?.type !== 'MemberExpression' && node?.type !== 'OptionalMemberExpression') return '?';
  const obj = stringifyMemberChain(node.object);
  const prop = node.property?.type === 'Identifier' ? node.property.name : '?';
  return `${ obj }.${ prop }`;
}
