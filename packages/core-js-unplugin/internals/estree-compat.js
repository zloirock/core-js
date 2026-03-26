// Adapter layer: maps ESTree (oxc-parser) node types to Babel-style names
// Used by resolve-node-type.js switch/case statements

// ESTree Literal -> Babel-specific literal types
export function babelNodeType(node) {
  if (!node) return null;
  const { type } = node;
  if (type === 'Literal') {
    if (node.bigint !== undefined) return 'BigIntLiteral';
    if (node.regex) return 'RegExpLiteral';
    if (typeof node.value === 'string') return 'StringLiteral';
    if (typeof node.value === 'number') return 'NumericLiteral';
    if (typeof node.value === 'boolean') return 'BooleanLiteral';
    if (node.value === null) return 'NullLiteral';
  }
  // ESTree Property -> Babel ObjectProperty / ObjectMethod
  // Getters/setters in ESTree have method:false but kind:'get'/'set' - in Babel they're ObjectMethod
  if (type === 'Property') return node.method || node.kind === 'get' || node.kind === 'set' ? 'ObjectMethod' : 'ObjectProperty';
  // ESTree MethodDefinition -> Babel ClassMethod
  if (type === 'MethodDefinition') return 'ClassMethod';
  // ESTree PropertyDefinition -> Babel ClassProperty
  if (type === 'PropertyDefinition') return 'ClassProperty';
  // ESTree optional member/call -> Babel OptionalMemberExpression/OptionalCallExpression
  if (type === 'MemberExpression' && node.optional) return 'OptionalMemberExpression';
  if (type === 'CallExpression' && node.optional) return 'OptionalCallExpression';
  return type;
}
