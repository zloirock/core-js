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
// the subset usage-pure rewrites the bare READ of to a read-only pure import: globals with a whole-global
// `pure` ponyfill (`Map` / `Set` / `Promise` / `Iterator` / `structuredClone` / `globalThis` / `self`) -
// NOT always-present constructors / global fns whose only pure modules are methods/statics (`Number`,
// `Error`, TypedArrays), whose bare `X` stays native so `X ||= Y` is a harmless native write. a few
// pure-entry global fns (`parseInt`) are rewritten only on CALL, not a bare reference, so they stay a
// rare residual over-warn - excluding them would need a hand-maintained list
const PURE_REWRITTEN_GLOBALS = new Set(
  Object.keys(builtInDefinitions.globals).filter(name => builtInDefinitions.globals[name].pure));

// covers constructors / global methods / namespaces / proxy globals - any polyfillable name
export function isKnownGlobalName(name) {
  return KNOWN_FUNCTION_GLOBALS.has(name) || KNOWN_NAMESPACE_GLOBALS.has(name)
    || POSSIBLE_GLOBAL_OBJECTS.has(name) || INJECTABLE_GLOBALS.has(name);
}

// receiverHint for a property meta - gates the resolver's instance-method fallback. only a
// STATIC-position access carries a hint (prototype/instance dispatch narrows by the real receiver
// type via enhanceMeta instead). a constructor yields 'function', a namespace / proxy-global yields
// 'object': `Array.concat` -> 'function', and concat (an `Array.prototype` method, absent on the
// `Array` constructor) has no function-variant so the resolver bails; `Array.name` -> 'function'
// resolves via the genuine `Function.prototype` variant. an unknown / non-static receiver -> null,
// leaving the resolver's default fold (e.g. `NaN.toFixed` - NaN is a Number value, not a constructor)
export function staticReceiverHint(placement, objectName) {
  if (placement !== 'static' || !objectName) return null;
  if (KNOWN_FUNCTION_GLOBALS.has(objectName)) return 'function';
  if (KNOWN_NAMESPACE_GLOBALS.has(objectName) || POSSIBLE_GLOBAL_OBJECTS.has(objectName)) return 'object';
  return null;
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
  // gate on PURE_REWRITTEN_GLOBALS (the bare-read-rewrite subset), NOT the broader `isKnownGlobalName` or
  // the all-injectable set: the warn only holds for a name whose bare READ becomes a read-only import.
  // namespaces (Math / JSON), always-present constructors (Array / Number) and method-only injectables
  // (TypedArrays) are never bare-rewritten, so `Math ||= X` / `Number ||= X` are harmless native writes
  if (!name || !PURE_REWRITTEN_GLOBALS.has(name)) return null;
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
    // thread `path` so `isProxyGlobalIdentifierNode` sees the reference site: a TS-runtime shadow of the
    // proxy-global root (`namespace globalThis {}`) makes it a local, not the global - without `path` the
    // shadow is missed and a `(shadowed globalThis).Map ||= X` gets a spurious warn
    resolveName: () => globalProxyMemberName({ node, scope, adapter, path }),
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
