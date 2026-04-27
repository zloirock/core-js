// known global names (constructors / namespaces / proxy globals) + logical-assign LHS
// diagnostics. constructors (Array, Map, ...) and global functions (parseInt, fetch, ...)
// are functions; namespaces (Math, JSON, Reflect, ...) and proxy globals (globalThis, self,
// ...) are plain objects
import knownBuiltInReturnTypes from '@core-js/compat/known-built-in-return-types' with { type: 'json' };
import { POSSIBLE_GLOBAL_OBJECTS } from '../helpers/class-walk.js';

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

// LHS of `Map ||= ...` reads the global before polyfill loads (ReferenceError); the
// import binding is read-only anyway, so substitution also throws at write time
export function checkLogicalAssignLhsGlobal(identifier, parent, isBound) {
  if (isBound || identifier?.type !== 'Identifier' || !isKnownGlobalName(identifier.name)) return null;
  if (parent?.type !== 'AssignmentExpression' || parent.left !== identifier) return null;
  if (!LOGICAL_ASSIGN_OPERATORS.has(parent.operator)) return null;
  return `\`${ identifier.name } ${ parent.operator } ...\` left-hand side cannot be polyfilled `
    + `(read-only import binding); expected runtime engine to provide \`${ identifier.name }\``;
}

// `globalThis.Map ||= X` - MemberExpression LHS form. called from MemberExpression visitor
// before inner-identifier transformation mutates `globalThis` -> `_globalThis`; receiver and
// property still carry their pre-transform names at this visitation point.
// `isBound` signals that the receiver binds to a user-declared local (`const globalThis = {}`
// style shadowing) - treat the member assignment as user-object write, not a real global reach
export function checkLogicalAssignLhsMember(memberNode, parent, isBound) {
  if (isBound || !memberNode || memberNode.type !== 'MemberExpression' || memberNode.computed) return null;
  const obj = memberNode.object;
  const prop = memberNode.property;
  if (obj?.type !== 'Identifier' || !POSSIBLE_GLOBAL_OBJECTS.has(obj.name)) return null;
  if (prop?.type !== 'Identifier' || !isKnownGlobalName(prop.name)) return null;
  if (parent?.type !== 'AssignmentExpression' || parent.left !== memberNode) return null;
  if (!LOGICAL_ASSIGN_OPERATORS.has(parent.operator)) return null;
  return `\`${ obj.name }.${ prop.name } ${ parent.operator } ...\` left-hand side cannot be polyfilled `
    + `(plugin rewrites reads, not writes); expected runtime engine to provide \`${ prop.name }\``;
}
