// Known global names (constructors / namespaces / proxy globals) + logical-assign LHS
// diagnostics. Plugin rewrites reads, not writes - LHS of `||=` / `&&=` / `??=` on a
// known global throws (read-only import binding) or no-ops (member-write on the polyfill)
import builtInDefinitions from '@core-js/compat/built-in-definitions' with { type: 'json' };
import knownBuiltInReturnTypes from '@core-js/compat/known-built-in-return-types' with { type: 'json' };
import { POSSIBLE_GLOBAL_OBJECTS, globalProxyMemberName, memberKeyName } from '../helpers/class-walk.js';
import { peelTransparentExprAncestorPath } from '../helpers/ast-patterns.js';

export const KNOWN_FUNCTION_GLOBALS = new Set([
  ...Object.keys(knownBuiltInReturnTypes.constructors),
  ...Object.keys(knownBuiltInReturnTypes.globalMethods),
]);
export const KNOWN_NAMESPACE_GLOBALS = new Set(knownBuiltInReturnTypes.namespaces);
// every polyfillable global, from built-in-definitions. this is a DIFFERENT axis than
// known-built-in-return-types (KNOWN_FUNCTION_GLOBALS), which catalogues names by inferred return
// type: the two overlap but neither contains the other - return-types lists always-present built-ins
// (Array / Boolean / Date / ...) that aren't injectable globals, and omits injectable globals it
// tracks no return type for (Iterator / AsyncIterator / structuredClone / setImmediate). without
// this set a self-reference `var Iterator = Iterator` injects nothing and the logical-assign LHS
// diagnostic stays silent (globalThis / self are the only other misses, already covered as proxies)
const INJECTABLE_GLOBALS = new Set(Object.keys(builtInDefinitions.globals));

// covers constructors / global methods / namespaces / proxy globals - any polyfillable name
export function isKnownGlobalName(name) {
  return KNOWN_FUNCTION_GLOBALS.has(name) || KNOWN_NAMESPACE_GLOBALS.has(name)
    || POSSIBLE_GLOBAL_OBJECTS.has(name) || INJECTABLE_GLOBALS.has(name);
}

const LOGICAL_ASSIGN_OPERATORS = new Set(['||=', '&&=', '??=']);

// `<node> <op>= ...` with logical op -> op string; else null. peeled-path's parent is the
// effective AssignmentExpression after walking up paren / TS-wrappers (`Map! ||= X` parses
// as AssignmentExpression{left: TSNonNullExpression{expression: Map}}; without peel, the
// caller's direct parent is the wrapper, not the assignment)
function logicalAssignOperator(peeledPath) {
  const parent = peeledPath?.parentPath?.node;
  if (parent?.type !== 'AssignmentExpression' || parent.left !== peeledPath.node) return null;
  return LOGICAL_ASSIGN_OPERATORS.has(parent.operator) ? parent.operator : null;
}

// shared shell between bare-identifier and member LHS. resolves the LHS to a global name,
// then formats `<chain> <op> ...` with the caller's per-shape reason text. returns warning
// text or null
function checkLogicalAssignLhs({ peeledPath, resolveName, formatChain, reason }) {
  const op = logicalAssignOperator(peeledPath);
  if (!op) return null;
  const name = resolveName();
  if (!name || !isKnownGlobalName(name)) return null;
  return `\`${ formatChain() } ${ op } ...\` left-hand side cannot be polyfilled `
    + `(${ reason }); expected runtime engine to provide \`${ name }\``;
}

// `Map ||= ...` reads the global before polyfill loads (ReferenceError); the import
// binding is read-only so substitution also throws at write time. accepts the identifier's
// path so TS wrappers between identifier and assignment (`Map! ||= X`) peel via
// `peelTransparentExprAncestorPath` before the strict-identity LHS check
export function checkLogicalAssignLhsGlobal(path, isBound) {
  const identifier = path?.node;
  if (isBound || identifier?.type !== 'Identifier') return null;
  return checkLogicalAssignLhs({
    peeledPath: peelTransparentExprAncestorPath(path),
    resolveName: () => identifier.name,
    formatChain: () => identifier.name,
    reason: 'read-only import binding',
  });
}

// `globalThis.Map ||= X` / `globalThis.self.Map ||= X` / `globalThis['Map'] ||= X` -
// MemberExpression LHS, including multi-hop proxy chains and computed string-key access.
// `globalProxyMemberName` walks the chain and short-circuits on shadowed leafs (subsumes
// per-callsite isBound). same TS-wrapper peel as bare-identifier
export function checkLogicalAssignLhsMember({ path, scope, adapter }) {
  const node = path?.node;
  if (!node || node.type !== 'MemberExpression') return null;
  return checkLogicalAssignLhs({
    peeledPath: peelTransparentExprAncestorPath(path),
    resolveName: () => globalProxyMemberName({ node, scope, adapter }),
    formatChain: () => stringifyMemberChain(node),
    reason: 'plugin rewrites reads, not writes',
  });
}

// printable chain: dotted for plain Identifier props, bracket-quoted for computed string keys
// (string-literal / single-quasi template via `memberKeyName`); fallback `?` for dynamic shapes
function stringifyMemberChain(node) {
  if (node?.type === 'Identifier') return node.name;
  if (node?.type !== 'MemberExpression' && node?.type !== 'OptionalMemberExpression') return '?';
  const obj = stringifyMemberChain(node.object);
  const prop = memberKeyName(node);
  if (prop === null) return `${ obj }.?`;
  return node.computed ? `${ obj }['${ prop }']` : `${ obj }.${ prop }`;
}
