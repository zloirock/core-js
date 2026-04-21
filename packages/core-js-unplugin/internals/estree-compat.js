// ESTree Literal -> Babel-specific literal types mapping
export function nodeType(node) {
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
  // getters/setters in ESTree have method: false but kind: get / set - in Babel they're ObjectMethod
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

// ESTree adapter for Babel node type predicates
export const types = {
  isIdentifier: (n, opts) => n?.type === 'Identifier' && (!opts?.name || n.name === opts.name),
  isMemberExpression: n => n?.type === 'MemberExpression' && !n.optional,
  isOptionalMemberExpression: n => n?.type === 'MemberExpression' && n.optional === true,
  isCallExpression: (n, opts) => n?.type === 'CallExpression' && !n.optional && (!opts?.callee || n.callee === opts.callee),
  isOptionalCallExpression: n => n?.type === 'CallExpression' && n.optional === true,
  isObjectProperty: n => n?.type === 'Property' && !n.method && n.kind === 'init',
  isObjectMethod: n => n?.type === 'Property' && (n.method || n.kind === 'get' || n.kind === 'set'),
  isObjectExpression: n => n?.type === 'ObjectExpression',
  isObjectPattern: n => n?.type === 'ObjectPattern',
  isArrayExpression: n => n?.type === 'ArrayExpression',
  isClassMethod: n => n?.type === 'MethodDefinition',
  isClassProperty: n => n?.type === 'PropertyDefinition',
  isClassAccessorProperty: n => n?.type === 'AccessorProperty',
  isClassBody: n => n?.type === 'ClassBody',
  isClassDeclaration: n => n?.type === 'ClassDeclaration',
  isClass: n => n?.type === 'ClassDeclaration' || n?.type === 'ClassExpression',
  // ESTree encodes privates as regular MethodDefinition/PropertyDefinition with a
  // PrivateIdentifier key; these shim the separate `@babel/types` predicates for parity
  isClassPrivateMethod: n => n?.type === 'MethodDefinition' && n.key?.type === 'PrivateIdentifier',
  isClassPrivateProperty: n => n?.type === 'PropertyDefinition' && n.key?.type === 'PrivateIdentifier',
  isStaticBlock: n => n?.type === 'StaticBlock',
  // oxc's raw `type` on string literals is `'Literal'`; `nodeType()` above translates that
  // to `'StringLiteral'` for babel parity. callers use either this predicate OR
  // `nodeType(n) === 'StringLiteral'` — NOT `n.type === 'StringLiteral'` directly
  isStringLiteral: n => n?.type === 'Literal' && typeof n.value === 'string',
  isTemplateLiteral: n => n?.type === 'TemplateLiteral',
  // only nodes that DIRECTLY expose `params`/`body`/`returnType` etc. - wrappers like
  // `MethodDefinition` (function lives on `.value`) are excluded so resolve-node-type
  // doesn't read undefined fields and silently abort
  isFunction: n => {
    const type = n?.type;
    return type === 'FunctionDeclaration'
      || type === 'FunctionExpression'
      || type === 'ArrowFunctionExpression';
  },
  // TSDeclareFunction is type-only - kept out so callers walking params/body see a real body
  isFunctionDeclaration: n => n?.type === 'FunctionDeclaration',
  isArrowFunctionExpression: n => n?.type === 'ArrowFunctionExpression',
  isVariableDeclarator: n => n?.type === 'VariableDeclarator',
  isVariableDeclaration: n => n?.type === 'VariableDeclaration',
  isAssignmentExpression: n => n?.type === 'AssignmentExpression',
  isAssignmentPattern: n => n?.type === 'AssignmentPattern',
  isBlockStatement: n => n?.type === 'BlockStatement',
  isReturnStatement: n => n?.type === 'ReturnStatement',
  isIfStatement: n => n?.type === 'IfStatement',
  isSwitchStatement: n => n?.type === 'SwitchStatement',
  isSwitchCase: n => n?.type === 'SwitchCase',
  isForOfStatement: n => n?.type === 'ForOfStatement',
  isForInStatement: n => n?.type === 'ForInStatement',
  isNewExpression: n => n?.type === 'NewExpression',
  isThisExpression: n => n?.type === 'ThisExpression',
  isConditionalExpression: n => n?.type === 'ConditionalExpression',
  isLogicalExpression: n => n?.type === 'LogicalExpression',
  isSpreadElement: n => n?.type === 'SpreadElement',
  isProgram: n => n?.type === 'Program',
  isImport: n => n?.type === 'ImportExpression',
};
