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
