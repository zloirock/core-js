// type-only expression wrappers - runtime no-ops that forward to their `.expression` child
export const TS_EXPR_WRAPPERS = new Set([
  'TSNonNullExpression',
  'TSAsExpression',
  'TSSatisfiesExpression',
  'TSTypeAssertion',
  'TSInstantiationExpression',
  // Flow: `(x: T)` - structural match with TS wrappers; reached only via babel AST
  // (oxc-parser cannot parse Flow), so this matters for @core-js/babel-plugin users
  'TypeCastExpression',
]);

// shared `usagePureCallback` guard predicates. callers unwrap TS/parens/chains beforehand
export const isDeleteTarget = parent => parent?.type === 'UnaryExpression' && parent.operator === 'delete';
export const isUpdateTarget = parent => parent?.type === 'UpdateExpression';
export const isForXLeft = (parent, node) => (parent?.type === 'ForOfStatement'
  || parent?.type === 'ForInStatement') && parent.left === node;
export const isTaggedTemplateTag = (parent, node, placement) => placement === 'prototype'
  && parent?.type === 'TaggedTemplateExpression'
  && parent.tag === node;

// top-level module-format detection: ESM markers take precedence; recognised CJS shapes
// are `module.exports[.X...] = ...`, `exports.X[.Y...] = ...` (and wrappers via `unwrapExpr`)
export const ESM_MARKER_TYPES = new Set([
  'ExportAllDeclaration',
  'ExportDefaultDeclaration',
  'ExportNamedDeclaration',
  'ImportDeclaration',
]);

const isNamedIdent = (node, name) => node?.type === 'Identifier' && node.name === name;

// peel transparent wrappers so `0, module.exports = ...` / `(module.exports = ...)` still match
function unwrapExpr(node) {
  while (node) {
    if (node.type === 'ParenthesizedExpression' || node.type === 'ChainExpression') node = node.expression;
    else if (node.type === 'SequenceExpression') node = node.expressions.at(-1);
    else break;
  }
  return node;
}

const isStaticMember = (node, objName, propName) => node?.type === 'MemberExpression' && !node.computed
  && isNamedIdent(unwrapExpr(node.object), objName) && isNamedIdent(node.property, propName);

// walks the MemberExpression chain - any ancestor rooted at `exports` or `module.exports` matches
function isCommonJSAssignTarget(left) {
  let node = unwrapExpr(left);
  while (node?.type === 'MemberExpression') {
    if (!node.computed && isStaticMember(node, 'module', 'exports')) return true;
    const obj = unwrapExpr(node.object);
    if (isNamedIdent(obj, 'exports')) return true;
    node = obj;
  }
  return false;
}

export const hasTopLevelESM = program => program.body.some(n => ESM_MARKER_TYPES.has(n.type));

export function detectCommonJS(program) {
  let hasCJS = false;
  for (const stmt of program.body) {
    if (ESM_MARKER_TYPES.has(stmt.type)) return false;
    if (hasCJS || stmt.type !== 'ExpressionStatement') continue;
    const expression = unwrapExpr(stmt.expression);
    if (expression?.type === 'AssignmentExpression' && isCommonJSAssignTarget(expression.left)) hasCJS = true;
  }
  return hasCJS;
}

// memoized ancestor walk with back-fill: O(depth) worst case, ~O(1) for siblings sharing
// the same annotation subtree. per-instance cache - no cross-file leak
export function createTypeAnnotationChecker(isTypeAnnotationNodeType) {
  const cache = new WeakMap();
  return function isInTypeAnnotation(path) {
    const visited = [];
    for (let current = path.parentPath; current; current = current.parentPath) {
      const { node } = current;
      if (!node) break;
      if (cache.has(node)) {
        const cached = cache.get(node);
        for (const n of visited) cache.set(n, cached);
        return cached;
      }
      if (isTypeAnnotationNodeType(node.type)) {
        cache.set(node, true);
        for (const n of visited) cache.set(n, true);
        return true;
      }
      visited.push(node);
    }
    for (const n of visited) cache.set(n, false);
    return false;
  };
}

// conservative: true when the subtree may observe/cause side effects, false only when provably pure
export function mayHaveSideEffects(node) {
  if (!node) return false;
  const { type } = node;
  if (ALWAYS_EFFECTFUL_TYPES.has(type)) return true;
  if (type === 'UnaryExpression') return node.operator === 'delete' || mayHaveSideEffects(node.argument);
  if (type === 'SequenceExpression' || type === 'TemplateLiteral') return node.expressions.some(mayHaveSideEffects);
  if (type === 'ArrayExpression') return node.elements.some(mayHaveSideEffects);
  if (type === 'ObjectExpression') return node.properties.some(mayHaveSideEffects);
  if (type === 'BinaryExpression' || type === 'LogicalExpression') {
    return mayHaveSideEffects(node.left) || mayHaveSideEffects(node.right);
  }
  if (type === 'ConditionalExpression') {
    return mayHaveSideEffects(node.test) || mayHaveSideEffects(node.consequent) || mayHaveSideEffects(node.alternate);
  }
  if (TRANSPARENT_WRAPPER_TYPES.has(type) || TS_EXPR_WRAPPERS.has(type)) {
    return mayHaveSideEffects(node.expression ?? node.argument);
  }
  if (type === 'MemberExpression' || type === 'OptionalMemberExpression') {
    return mayHaveSideEffects(node.object) || (node.computed && mayHaveSideEffects(node.property));
  }
  if (type === 'Property' || type === 'ObjectProperty') {
    return (node.computed && mayHaveSideEffects(node.key)) || mayHaveSideEffects(node.value);
  }
  if (type === 'AssignmentPattern') return mayHaveSideEffects(node.right);
  return false;
}

const ALWAYS_EFFECTFUL_TYPES = new Set([
  'AssignmentExpression',
  'AwaitExpression',
  'CallExpression',
  'ImportExpression',
  'NewExpression',
  'OptionalCallExpression',
  'TaggedTemplateExpression',
  'UpdateExpression',
  'YieldExpression',
]);

// runtime no-op wrappers -> child carried on `.expression` or `.argument`
const TRANSPARENT_WRAPPER_TYPES = new Set([
  'ChainExpression',
  'ParenthesizedExpression',
  'RestElement',
  'SpreadElement',
]);

// walk every Identifier reachable from a binding pattern (`{a, b: [c]}`, `[d, ...e]`,
// `f = 1`, `{g = 2}`, etc.), invoking `visit(identifierNode)` per leaf. caller is
// responsible for short-circuit via captured flag since we always walk the whole tree
export function walkPatternIdentifiers(node, visit) {
  if (!node) return;
  switch (node.type) {
    case 'Identifier':
      visit(node);
      break;
    case 'ObjectPattern':
      for (const p of node.properties) {
        walkPatternIdentifiers(p.type === 'RestElement' ? p.argument : p.value, visit);
      }
      break;
    case 'ArrayPattern':
      for (const el of node.elements) walkPatternIdentifiers(el, visit);
      break;
    case 'AssignmentPattern':
      walkPatternIdentifiers(node.left, visit);
      break;
    case 'RestElement':
      walkPatternIdentifiers(node.argument, visit);
      break;
  }
}
