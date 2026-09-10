import { visitorKeys } from 'estree-toolkit/dist-es/definitions';

// every node oxc hangs `decorators` on that estree-toolkit DEFINES. a type it does not define
// (`AccessorProperty`, `TSParameterProperty`, the `TSAbstract*` members) needs no entry - the
// traverse falls back to the node's own keys there and reaches the slot already. an `Identifier`
// param carrying TS-legacy parameter decorators is deliberately NOT here: the traverse would enter
// them, but estree-toolkit reads every identifier under a `params` subtree as binding material and
// records no reference or write for it, so the manual walk stays their only channel
const DECORATOR_HOST_TYPES = [
  'ClassDeclaration',
  'ClassExpression',
  'MethodDefinition',
  'PropertyDefinition',
];

// estree-toolkit derives its visitor keys from its own node definitions, and NONE of them carries a
// `decorators` slot: its traverse - and with it the scope crawl and every path it builds - stops at
// the class member and never enters a decorator. a decorator expression evaluates at class-eval
// time, ahead of every static field, so a write in one is real flow; invisible, it leaves the
// binding's `constantViolations` empty, the resolver keeps a narrow the write already invalidated,
// and the polyfill for the value actually read is never injected. the slot is a syntax fact of the
// tree oxc hands us, restored here once, before any traversal runs - the seam this module owns
for (const type of DECORATOR_HOST_TYPES) {
  const keys = visitorKeys[type];
  if (keys && !keys.includes('decorators')) visitorKeys[type] = [...keys, 'decorators'];
}

// does estree-toolkit's traverse reach a node type's `decorators` on its own? a type it does not
// define falls back to the node's own keys and reaches every slot; a defined one reaches exactly its
// visitor keys - which carry the slot for every host restored above. detection's manual decorator
// walk asks this to stand down wherever the traverse already goes, so the two can never both visit
// one decorator and queue colliding rewrites for its span
export function traverseWalksDecorators(type) {
  const keys = visitorKeys[type];
  return keys === undefined || keys.includes('decorators');
}

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
  // ESTree Property -> Babel ObjectProperty / ObjectMethod
  // getters/setters in ESTree have method: false but kind: get / set - in Babel they're ObjectMethod
  } else if (type === 'Property') return node.method || node.kind === 'get' || node.kind === 'set' ? 'ObjectMethod' : 'ObjectProperty';
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
  isIdentifier: n => n?.type === 'Identifier',
  isMemberExpression: n => n?.type === 'MemberExpression' && !n.optional,
  isOptionalMemberExpression: n => n?.type === 'MemberExpression' && n.optional === true,
  isCallExpression: n => n?.type === 'CallExpression' && !n.optional,
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
  // babel's `Import` is the CALLEE keyword of `import(...)` - a slot ESTree has no node for at
  // all, since it spells the whole call `ImportExpression`. Answering the callee question with
  // `ImportExpression` therefore never fires on the shape it was meant for and DOES fire on
  // `import('x')(1)`, where it types calling a promise as a promise. The dispatch resolves the
  // ESTree form by its own node type, so the honest adapter answer here is "no such node"
  isImport: () => false,
};
