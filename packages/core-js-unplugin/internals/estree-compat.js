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
  // ESTree MethodDefinition / TS abstract methods -> Babel ClassMethod. `TSAbstractMethodDefinition`
  // is the oxc shape for `abstract m()` - structurally identical to MethodDefinition at runtime
  // (abstract is type-only, stripped before emit), so resolve-node-type treats them as the same
  // class-member kind for shadow / member-key indexing
  if (type === 'MethodDefinition' || type === 'TSAbstractMethodDefinition') return 'ClassMethod';
  // ESTree PropertyDefinition / TS abstract properties -> Babel ClassProperty. same rationale -
  // `abstract x: T` carries no runtime declaration but the field-narrowing index still needs
  // to register the shadow slot so subclass writes don't get type-mixed
  if (type === 'PropertyDefinition' || type === 'TSAbstractPropertyDefinition') return 'ClassProperty';
  // ESTree AccessorProperty (TC39 auto-accessor) / TS abstract accessor -> Babel
  // ClassAccessorProperty. resolve-node-type's class-member switch keys on the babel name;
  // without the translation `accessor x = ...` / `abstract accessor x` slots fall through to
  // the default branch and member resolution breaks
  if (type === 'AccessorProperty' || type === 'TSAbstractAccessorProperty') return 'ClassAccessorProperty';
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
  // TSAbstract* variants mirror nodeType()'s mapping above - `abstract m()` / `abstract x` /
  // `abstract accessor x` are structurally identical to their concrete forms (abstract is
  // type-only), so member-key indexing / narrowing must read them through the same predicates
  isClassMethod: n => n?.type === 'MethodDefinition' || n?.type === 'TSAbstractMethodDefinition',
  // FE-valued object props (`{m: function(){}}`) hit `t.isFunctionExpression(n.value)` in
  // `ownerMethodFns` for class-flow scanning; without this shim the optional chain returns
  // undefined on unplugin and FE-prop method-internal `this.X = ...` writes are skipped
  isFunctionExpression: n => n?.type === 'FunctionExpression',
  isClassProperty: n => n?.type === 'PropertyDefinition' || n?.type === 'TSAbstractPropertyDefinition',
  isClassAccessorProperty: n => n?.type === 'AccessorProperty' || n?.type === 'TSAbstractAccessorProperty',
  isClassBody: n => n?.type === 'ClassBody',
  isClassDeclaration: n => n?.type === 'ClassDeclaration',
  isClass: n => n?.type === 'ClassDeclaration' || n?.type === 'ClassExpression',
  // ESTree encodes privates as regular MethodDefinition/PropertyDefinition with a
  // PrivateIdentifier key; these shim the separate `@babel/types` predicates for parity
  isClassPrivateMethod: n => n?.type === 'MethodDefinition' && n.key?.type === 'PrivateIdentifier',
  // babel `ClassPrivateProperty` (`#foo`) parses in ESTree as a `PropertyDefinition` with a
  // `PrivateIdentifier` key; mirror @babel/types, which EXCLUDES auto-accessors - a private
  // `accessor #foo` is an `AccessorProperty` matched by `isClassAccessorProperty` instead (every
  // caller ORs the two, so class-field detection is unchanged)
  isClassPrivateProperty: n => n?.type === 'PropertyDefinition' && n.key?.type === 'PrivateIdentifier',
  isStaticBlock: n => n?.type === 'StaticBlock',
  isAwaitExpression: n => n?.type === 'AwaitExpression',
  // oxc's raw `type` on string literals is `'Literal'`; `nodeType()` above translates that
  // to `'StringLiteral'` for babel parity. callers use either this predicate OR
  // `nodeType(n) === 'StringLiteral'` - NOT `n.type === 'StringLiteral'` directly
  isStringLiteral: n => n?.type === 'Literal' && typeof n.value === 'string',
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
  isForStatement: n => n?.type === 'ForStatement',
  isNewExpression: n => n?.type === 'NewExpression',
  isThisExpression: n => n?.type === 'ThisExpression',
  isConditionalExpression: n => n?.type === 'ConditionalExpression',
  isLogicalExpression: n => n?.type === 'LogicalExpression',
  isSpreadElement: n => n?.type === 'SpreadElement',
  isProgram: n => n?.type === 'Program',
  isImport: n => n?.type === 'ImportExpression',
};
