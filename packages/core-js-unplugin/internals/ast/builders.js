// the AST engine's node factory - the one place emitted nodes take shape (the boundary the
// future dialect adapter of the babel unification slots into). names mirror @babel/types
// so the blueprint mapping reads at a glance; estree-toolkit's builders are not used here
// because they carry validation weight and no `raw` control (quote spelling parity)

export function identifier(name) {
  return { type: 'Identifier', name };
}

// `raw` is the printer's PREFERRED spelling, and only a string needs one from us: esrap quotes
// with `'` by default and babel prints `"`, so a path / key spells its own. every other value the
// printer derives itself, correctly - `JSON.stringify` would not: it THROWS on a bigint and
// answers `null` for NaN / Infinity, which would print a different value than the node holds
export function literal(value) {
  return typeof value === 'string'
    ? { type: 'Literal', value, raw: JSON.stringify(value) }
    : { type: 'Literal', value };
}

export function expressionStatement(expression) {
  return { type: 'ExpressionStatement', expression };
}

export function callExpression(callee, args, { optional = false } = {}) {
  return { type: 'CallExpression', callee, arguments: args, optional };
}

export function memberExpression(object, property, { computed = false, optional = false } = {}) {
  return { type: 'MemberExpression', object, property, computed, optional };
}

export function sequenceExpression(expressions) {
  return { type: 'SequenceExpression', expressions };
}

export function variableDeclaration(kind, declarations) {
  return { type: 'VariableDeclaration', kind, declarations };
}

export function variableDeclarator(id, init = null) {
  return { type: 'VariableDeclarator', id, init };
}

export function binaryExpression(operator, left, right) {
  return { type: 'BinaryExpression', operator, left, right };
}

export function logicalExpression(operator, left, right) {
  return { type: 'LogicalExpression', operator, left, right };
}

export function conditionalExpression(test, consequent, alternate) {
  return { type: 'ConditionalExpression', test, consequent, alternate };
}

export function unaryExpression(operator, argument) {
  return { type: 'UnaryExpression', operator, argument, prefix: true };
}

export function chainExpression(expression) {
  return { type: 'ChainExpression', expression };
}

export function voidZero() {
  return unaryExpression('void', literal(0));
}

export function assignmentExpression(operator, left, right) {
  return { type: 'AssignmentExpression', operator, left, right };
}

export function objectExpression(properties) {
  return { type: 'ObjectExpression', properties };
}

export function objectProperty(key, value, { computed = false } = {}) {
  return { type: 'Property', kind: 'init', method: false, shorthand: false, computed, key, value };
}

export function bareImport(path) {
  return { type: 'ImportDeclaration', specifiers: [], source: literal(path), attributes: [] };
}

export function defaultImport(name, path) {
  return {
    type: 'ImportDeclaration',
    specifiers: [{ type: 'ImportDefaultSpecifier', local: identifier(name) }],
    source: literal(path),
    attributes: [],
  };
}

export function bareRequire(path) {
  return expressionStatement(callExpression(identifier('require'), [literal(path)]));
}

export function varRequire(name, path) {
  return variableDeclaration('var', [variableDeclarator(identifier(name), callExpression(identifier('require'), [literal(path)]))]);
}

// a deep clone for node REUSE (a receiver spliced into two slots must not share identity -
// the walkers and the printer's loc pass mutate in place); loc/start/end survive the copy
// so a cloned user node keeps its mapping
export function cloneNode(node) {
  if (Array.isArray(node)) return node.map(item => cloneNode(item));
  if (!node || typeof node !== 'object') return node;
  const out = {};
  for (const [key, value] of Object.entries(node)) out[key] = cloneNode(value);
  return out;
}
