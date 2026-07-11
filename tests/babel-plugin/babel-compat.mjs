// Unit tests for `@core-js/babel-plugin/internals/babel-compat.js`. fixture suite covers
// the helpers indirectly; this file isolates each helper so dispatch-shape regressions
// surface here, not behind a fixture-output diff.
// BABEL_REQUIRE_FROM resolves @babel/parser, @babel/traverse, @babel/types from an
// alternate workspace - mirrors the fixture runner's hook so unit tests run under
// babel@8 (default) and babel@7 (with BABEL_REQUIRE_FROM=../babel-plugin-v7) alike
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import * as nodePath from 'node:path';

const { BABEL_REQUIRE_FROM } = process.env;
const requireBabel = BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ nodePath.resolve(BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { parse: babelParse } = requireBabel('@babel/parser');
const traverseModule = requireBabel('@babel/traverse');
const t = requireBabel('@babel/types');
import createASTHelpers from '../../packages/core-js-babel-plugin/internals/babel-compat.js';
import { createChecker, findNode } from '../polyfill-provider/harness.mjs';

const traverse = traverseModule.default ?? traverseModule;
const { check, checkTruthy, finish } = createChecker('babel-compat');

// deterministic identifiers - real `ImportInjector` carries scope-tracking state irrelevant
// to AST-shape checks. counter resets per-suite for stable output
let refCounter = 0;
function freshStubInjector() {
  refCounter = 0;
  function nextName() { return `_ref${ ++refCounter }`; }
  return {
    generateDeclaredRef(scope) {
      const id = t.identifier(nextName());
      scope.push?.({ id });
      return id;
    },
    generateLocalRef() { return t.identifier(nextName()); },
    generateUnusedName() { return nextName(); },
  };
}

function makeHelpers({ injector = freshStubInjector(), resolveNodeType = null, resolvedType = null } = {}) {
  return createASTHelpers(t, {
    getInjector: () => injector,
    typeResolvers: { resolveNodeType, resolvedType },
  });
}

function parseCode(code, plugins = ['typescript'], parserOpts = {}) {
  return babelParse(code, {
    sourceType: 'module',
    plugins,
    allowReturnOutsideFunction: true,
    ...parserOpts,
  });
}

function getProgramPath(ast) {
  let programPath = null;
  traverse(ast, { Program(path) { programPath = path; } });
  return programPath;
}

function pickPath(programPath, type, predicate = () => true) {
  let picked = null;
  programPath.traverse({
    [type](path) {
      if (!picked && predicate(path)) picked = path;
    },
  });
  return picked;
}

function setup(code, plugins = ['typescript'], parserOpts = {}) {
  const ast = parseCode(code, plugins, parserOpts);
  const program = getProgramPath(ast);
  const helpers = makeHelpers();
  return { helpers, program, ast };
}

function pickIdent(programPath, name) {
  return pickPath(programPath, 'Identifier', p => p.node.name === name);
}

// pick a member of `type` (MemberExpression / OptionalMemberExpression) by its property name
function pickMember(programPath, type, name) {
  return pickPath(programPath, type, p => p.node.property?.name === name);
}

// the trailing rewritten ExpressionStatement (memoize may inject `var _refN;` above it)
function firstExprStmt(body) {
  return body.find(s => s.type === 'ExpressionStatement');
}

// stub type resolvers so `pathType` / `seededRefClone` / return-type relocation activate. `seen` is
// the backing WeakMap - assert against it to check what the compat layer seeded / relocated
function stubTypeResolvers(type) {
  const seen = new WeakMap();
  return { seen, resolveNodeType: () => type, resolvedType: { get: n => seen.get(n), set: (n, v) => seen.set(n, v) } };
}

// drive replaceInstanceLike on first OptionalMemberExpression matching `predicate`.
// returns trailing ExpressionStatement (memoize may inject `var _refN;` above it)
function runOptional(helpers, program, polyfillName, {
  skipOptional = null,
  sideEffects = null,
  receiverEffectCount = null,
  predicate = () => true,
} = {}) {
  const memberPath = pickPath(program, 'OptionalMemberExpression', predicate);
  helpers.replaceInstanceLike({
    path: memberPath,
    id: t.identifier(polyfillName),
    skipOptional,
    sideEffects,
    receiverEffectCount,
  });
  return firstExprStmt(program.node.body);
}

// drive replaceInstanceLike on first non-optional MemberExpression; returns updated body
function runMember(helpers, program, polyfillName, {
  skipOptional = null,
  sideEffects = null,
  receiverEffectCount = null,
  predicate = () => true,
} = {}) {
  const memberPath = pickPath(program, 'MemberExpression', predicate);
  helpers.replaceInstanceLike({
    path: memberPath,
    id: t.identifier(polyfillName),
    skipOptional,
    sideEffects,
    receiverEffectCount,
  });
  return program.node.body;
}

// drive replaceInstanceChainCombined on outer `.<outerName>` call wrapping inner call.
// returns rewritten ExpressionStatement
function runChainCombined(helpers, program, ast, {
  outerName,
  optional = false,
  outerId,
  innerId,
  sideEffects = null,
}) {
  const outerType = optional ? 'OptionalMemberExpression' : 'MemberExpression';
  const outerMember = pickPath(program, outerType, p => p.node.property?.name === outerName);
  const innerCall = ast.program.body[0].expression.callee.object;
  helpers.replaceInstanceChainCombined(outerMember, t.identifier(outerId), {
    innerCallee: innerCall.callee,
    innerArgs: innerCall.arguments,
    innerId: t.identifier(innerId),
    sideEffects,
  });
  return firstExprStmt(program.node.body);
}

// drive replaceCallWithSimple on first MemberExpression / OptionalMemberExpression
function runSimple(helpers, program, polyfillName, {
  optional = false,
  skipOptional = null,
  sideEffects = null,
  receiverEffectCount = null,
  predicate = () => true,
} = {}) {
  const type = optional ? 'OptionalMemberExpression' : 'MemberExpression';
  const memberPath = pickPath(program, type, predicate);
  helpers.replaceCallWithSimple(memberPath, t.identifier(polyfillName), skipOptional, sideEffects, receiverEffectCount);
  return program.node.body;
}

// --- isInTypeAnnotation ---

const TYPE_ANNOT_CASES = [
  { name: 'identifier inside TSTypeAnnotation', code: 'let x: Foo;', ident: 'Foo', expect: true },
  { name: 'identifier in runtime position', code: 'let x = bar;', ident: 'bar', expect: false },
  { name: 'TSAsExpression operand is runtime', code: 'let v = arr as Foo;', ident: 'arr', expect: false },
  { name: 'TSAsExpression Foo slot is type', code: 'let v = arr as Foo;', ident: 'Foo', expect: true },
  { name: 'TSTypeAliasDeclaration RHS', code: 'type T = Foo;', ident: 'Foo', expect: true },
  { name: 'TSInterfaceDeclaration body', code: 'interface I { a: Foo; }', ident: 'Foo', expect: true },
  { name: 'typeParameter constraint Foo', code: 'function f<T extends Foo>() {}', ident: 'Foo', expect: true },
];

for (const { name, code, ident, expect } of TYPE_ANNOT_CASES) {
  const { helpers, program } = setup(code);
  check(`isInTypeAnnotation/${ name }`, helpers.isInTypeAnnotation(pickIdent(program, ident)), expect);
}

// reset clears the WeakMap cache; second call after `reset()` still produces correct result
{
  const { helpers, program } = setup('let x: Foo;');
  const typeRefPath = pickIdent(program, 'Foo');
  helpers.isInTypeAnnotation(typeRefPath);
  helpers.reset();
  checkTruthy('isInTypeAnnotation/result stable across reset',
    helpers.isInTypeAnnotation(typeRefPath));
}

// --- isReusableReceiver (exercised via replaceInstanceLike / optional-chain memoize) ---

// safe receivers reuse the original expression in the guard head, no _ref allocated.
// the rewritten expression is the SOLE program statement (no `var _ref;` injected above)
const SAFE_REUSE_CASES = [
  {
    name: 'Identifier no _ref allocation',
    code: 'arr?.includes(1);',
    plugins: ['typescript'],
    headType: 'Identifier',
    headName: 'arr',
  },
  {
    name: 'ThisExpression no _ref allocation',
    code: 'this?.includes(1);',
    plugins: ['typescript'],
    headType: 'ThisExpression',
  },
  {
    name: 'ParenthesizedExpression(Identifier) peeled',
    code: '(arr)?.includes(1);',
    plugins: ['typescript', ['parenthesizedExpression']],
    headType: 'Identifier',
    headName: 'arr',
  },
  {
    name: 'nested ParenthesizedExpression peeled',
    code: '((arr))?.includes(1);',
    plugins: ['typescript', ['parenthesizedExpression']],
    headType: 'Identifier',
    headName: 'arr',
  },
];

for (const { name, code, plugins, headType, headName } of SAFE_REUSE_CASES) {
  const { helpers, program } = setup(code, plugins);
  const exprStmt = runOptional(helpers, program, '_includes');
  const { test, type } = exprStmt.expression;
  let ok = type === 'ConditionalExpression' && test.left.type === headType;
  if (headName) ok &&= test.left.name === headName;
  checkTruthy(`isReusableReceiver/${ name }`, ok);
}

// unsafe receivers trigger _ref memoize: `null == (_ref = <receiver>)` guard head.
// the rewritten expression is the trailing ExpressionStatement, `var _refN;` lands above
const UNSAFE_REUSE_CASES = [
  {
    name: 'CallExpression triggers _ref allocation',
    code: 'getArr()?.includes(1);',
    rhsCheck: rhs => rhs.type === 'AssignmentExpression' && rhs.left.name.startsWith('_ref'),
  },
  {
    name: 'MemberExpression triggers _ref allocation',
    code: 'obj.arr?.includes(1);',
    rhsCheck: rhs => rhs.type === 'AssignmentExpression' && rhs.left.name.startsWith('_ref'),
  },
  {
    name: 'BinaryExpression triggers _ref allocation',
    code: '(a + b)?.includes(1);',
    rhsCheck: rhs => rhs.type === 'AssignmentExpression' && rhs.right.type === 'BinaryExpression',
  },
];

for (const { name, code, rhsCheck } of UNSAFE_REUSE_CASES) {
  const { helpers, program } = setup(code);
  const exprStmt = runOptional(helpers, program, '_includes');
  const { test } = exprStmt.expression;
  checkTruthy(`isReusableReceiver/${ name }`,
    test.left.type === 'NullLiteral' && rhsCheck(test.right));
}

// --- generateRef / generateLocalRef / generateUnusedId (delegation smoke) ---

{
  // `$` keeps the marker visually distinct from generated `_refN` names while staying a
  // valid identifier character (the `:` separator used previously trips @babel/types@8
  // strict identifier validation in t.identifier)
  const injector = {
    generateDeclaredRef: scope => t.identifier(`_declared$${ scope.tag }`),
    generateLocalRef: scope => t.identifier(`_local$${ scope.tag }`),
    generateUnusedName: () => '_unused_xyz',
  };
  const helpers = makeHelpers({ injector });
  const declared = helpers.generateRef({ tag: 'A' });
  const local = helpers.generateLocalRef({ tag: 'B' });
  const unused = helpers.generateUnusedId();
  check('generateRef/delegates to generateDeclaredRef', declared.name, '_declared$A');
  check('generateLocalRef/delegates to generateLocalRef', local.name, '_local$B');
  check('generateUnusedId/wraps generateUnusedName as Identifier',
    unused.type === 'Identifier' && unused.name, '_unused_xyz');
}

// --- deoptionalizeNode ---

// OptionalMemberExpression -> MemberExpression, OptionalCallExpression -> CallExpression.
// both strip the `.optional` flag from the rewritten node
const DEOPT_CASES = [
  { kind: 'member', code: 'arr?.foo;', pick: 'OptionalMemberExpression', to: 'MemberExpression' },
  { kind: 'call', code: 'fn?.();', pick: 'OptionalCallExpression', to: 'CallExpression' },
];

for (const { kind, code, pick, to } of DEOPT_CASES) {
  const { helpers, program } = setup(code);
  const path = pickPath(program, pick);
  helpers.deoptionalizeNode(path);
  check(`deoptionalizeNode/${ pick } -> ${ to }`, path.node.type, to);
  check(`deoptionalizeNode/clears .optional flag on ${ kind }`,
    'optional' in path.node, false);
}

// --- normalizeOptionalChain ---

// non-optional parent: returns null (nothing to lift past)
{
  const { helpers, program } = setup('arr.foo;');
  const memberPath = pickPath(program, 'MemberExpression');
  // synth replacement at memberPath so parentPath walk sees a non-optional parent
  memberPath.replaceWith(t.numericLiteral(42));
  const result = helpers.normalizeOptionalChain(memberPath);
  check('normalizeOptionalChain/no optional parent returns null', result, null);
}

// stripFirstOptional=true: deoptionalizes the immediate ?. above the replaced node
{
  const { helpers, program } = setup('arr?.includes;');
  const memberPath = pickMember(program, 'OptionalMemberExpression', 'includes');
  // simulate the post-replacement state: synth result occupies the receiver slot
  const objectPath = memberPath.get('object');
  objectPath.replaceWith(t.identifier('_polyfilled'));
  const top = helpers.normalizeOptionalChain(objectPath, true);
  checkTruthy('normalizeOptionalChain/stripFirstOptional lifts past ?.', top !== null);
  check('normalizeOptionalChain/stripFirstOptional deoptionalises immediate ?.',
    memberPath.node.type, 'MemberExpression');
}

// without stripFirstOptional: immediate ?. is user-written, no non-optional link above
// the replacement - returns null
{
  const { helpers, program } = setup('inner.middle?.tail;');
  const optTail = pickPath(program, 'OptionalMemberExpression');
  optTail.get('object').replaceWith(t.identifier('_polyfilled'));
  const top = helpers.normalizeOptionalChain(optTail.get('object'));
  check('normalizeOptionalChain/no non-optional links above returns null', top, null);
}

// deep chain `a?.b?.c?.d` with stripFirstOptional=true: walks deopting intermediates
{
  const { helpers, program } = setup('a?.b?.c?.d;');
  const outer = pickPath(program, 'OptionalMemberExpression',
    p => p.node.property?.name === 'd');
  let bottom = outer;
  while (bottom.node.object?.type?.startsWith('Optional')) bottom = bottom.get('object');
  bottom.get('object').replaceWith(t.identifier('_polyfilled'));
  const top = helpers.normalizeOptionalChain(bottom.get('object'), true);
  checkTruthy('normalizeOptionalChain/stripFirstOptional deep chain walks up',
    top !== null);
  check('normalizeOptionalChain/stripFirstOptional deopts bottom ?.',
    bottom.node.type, 'MemberExpression');
}

// ParenthesizedExpression wrapper between replaced node and ?.: parentPath walk peels it.
// `createParenthesizedExpressions: true` materialises paren nodes in the AST
{
  const { helpers, program } = setup('(arr)?.tail;', ['typescript'], { createParenthesizedExpressions: true });
  const optTail = pickPath(program, 'OptionalMemberExpression');
  const parenPath = optTail.get('object');
  check('normalizeOptionalChain/paren wrapper is materialised',
    parenPath.node.type, 'ParenthesizedExpression');
  parenPath.get('expression').replaceWith(t.identifier('_polyfilled'));
  const top = helpers.normalizeOptionalChain(parenPath.get('expression'), true);
  checkTruthy('normalizeOptionalChain/peels ParenthesizedExpression wrapper',
    top !== null);
  check('normalizeOptionalChain/peeled-paren deopts immediate ?.',
    optTail.node.type, 'MemberExpression');
}

// --- unwrapTSExpressionParent ---

// identifier inside TSAsExpression: parent walk peels TS wrapper, returns first non-TS path
{
  const { helpers, program } = setup('(arr as any).includes(1);');
  const innerArrPath = pickIdent(program, 'arr');
  const unwrapped = helpers.unwrapTSExpressionParent(innerArrPath);
  check('unwrapTSExpressionParent/peels TSAsExpression wrapper',
    unwrapped.node.type, 'TSAsExpression');
}

// no wrapper: returns same path
{
  const { helpers, program } = setup('let x;');
  const idPath = pickIdent(program, 'x');
  const unwrapped = helpers.unwrapTSExpressionParent(idPath);
  check('unwrapTSExpressionParent/no wrapper returns same path', unwrapped, idPath);
}

// --- isWrappedInParens (exercised via replaceInstanceLike paren-lookup-only branch) ---

// bare optional member: not wrapped, plain replaceInstanceLike path
{
  const { helpers, program } = setup('arr?.includes(1);');
  const exprStmt = runOptional(helpers, program, '_includes');
  // success path: `arr == null ? void 0 : _includes(arr).call(arr, 1)` shape - the
  // ConditionalExpression head is present, paren-lookup-only branch is NOT taken
  checkTruthy('isWrappedInParens/bare optional uses standard branch',
    exprStmt.expression.type === 'ConditionalExpression');
}

// extra.parenthesized: parser-default paren marker, triggers paren-lookup-only branch
{
  const { helpers, program } = setup('(arr?.includes)(1);');
  const memberPath = pickPath(program, 'OptionalMemberExpression');
  // default babel parser strips the parens, marks via extra.parenthesized
  checkTruthy('isWrappedInParens/extra.parenthesized flag present',
    !!memberPath.node.extra?.parenthesized);
  const exprStmt = runOptional(helpers, program, '_includes');
  // paren-lookup-only branch emits `(...)?.(_ref).call(_ref, 1)` shape with a wrapping
  // CallExpression whose callee is a MemberExpression(.call, ...)
  checkTruthy('isWrappedInParens/paren-lookup branch emits .call(...)',
    exprStmt.expression.type === 'CallExpression'
    && exprStmt.expression.callee.type === 'MemberExpression'
    && exprStmt.expression.callee.property.name === 'call');
}

// --- withSideEffects ---

// empty sideEffects: returns the bare result expression (no SequenceExpression wrap)
{
  const helpers = makeHelpers();
  const result = t.callExpression(t.identifier('foo'), []);
  check('withSideEffects/empty array returns bare result',
    helpers.withSideEffects(result, []), result);
  check('withSideEffects/null returns bare result',
    helpers.withSideEffects(result, null), result);
  check('withSideEffects/undefined returns bare result',
    helpers.withSideEffects(result, undefined), result);
}

// non-empty sideEffects: wraps in SequenceExpression with prefix entries cloned, result tail
{
  const helpers = makeHelpers();
  const result = t.callExpression(t.identifier('foo'), []);
  const se = [t.callExpression(t.identifier('spy'), [])];
  const wrapped = helpers.withSideEffects(result, se);
  check('withSideEffects/wraps non-empty as SequenceExpression',
    wrapped.type, 'SequenceExpression');
  check('withSideEffects/sequence length is se.length + 1',
    wrapped.expressions.length, 2);
  check('withSideEffects/result is sequence tail',
    wrapped.expressions[wrapped.expressions.length - 1], result);
  // prefix is a CLONE, not the original SE node - protects shared mutable AST nodes
  checkTruthy('withSideEffects/prefix is cloned, not aliased',
    wrapped.expressions[0] !== se[0]);
  check('withSideEffects/cloned prefix preserves callee name',
    wrapped.expressions[0].callee.name, 'spy');
}

// --- wrapConditional (exercised via replaceInstanceLike with optional chain) ---

// identifier-like check head: `x == null` (identifier-first, ASI-safe by token)
{
  const { helpers, program } = setup('arr?.includes(1);');
  const exprStmt = runOptional(helpers, program, '_includes');
  const { test } = exprStmt.expression;
  check('wrapConditional/Identifier check head',
    test.left.type === 'Identifier' && test.left.name, 'arr');
  check('wrapConditional/Identifier check tail is null',
    test.right.type, 'NullLiteral');
  check('wrapConditional/operator is loose-eq', test.operator, '==');
}

// assignment-style check head: `null == (_ref = ...)` - null-first prevents preceding
// statement from ASI-merging with the assignment's leading `(`
{
  const { helpers, program } = setup('getArr()?.includes(1);');
  const exprStmt = runOptional(helpers, program, '_includes');
  const { test } = exprStmt.expression;
  check('wrapConditional/AssignmentExpression check head is null',
    test.left.type, 'NullLiteral');
  check('wrapConditional/AssignmentExpression check tail is the assignment',
    test.right.type, 'AssignmentExpression');
}

// ThisExpression: ident-like, `this == null`
{
  const { helpers, program } = setup('this?.indexOf(1);');
  const exprStmt = runOptional(helpers, program, '_indexOf');
  const { test } = exprStmt.expression;
  check('wrapConditional/ThisExpression check head is ThisExpression',
    test.left.type, 'ThisExpression');
  check('wrapConditional/ThisExpression check tail is null',
    test.right.type, 'NullLiteral');
}

// MemberExpression: not safe-to-reuse, _ref allocated, null-first
{
  const { helpers, program } = setup('obj.arr?.indexOf(1);');
  const exprStmt = runOptional(helpers, program, '_indexOf');
  const { test } = exprStmt.expression;
  check('wrapConditional/MemberExpression check head is null',
    test.left.type, 'NullLiteral');
  checkTruthy('wrapConditional/MemberExpression check tail is _ref assignment',
    test.right.type === 'AssignmentExpression'
    && test.right.right.type === 'MemberExpression');
}

// --- extractCheck (via replaceInstanceLike) ---

// `(arr as any)?.at(0)`: top-branch memoizes TSAsExpression - not safe-to-reuse, _ref allocated
{
  const { helpers, program } = setup('(arr as any)?.at(0);');
  const exprStmt = runOptional(helpers, program, '_at');
  // top-level ConditionalExpression with `null == (_ref = arr as any)` test
  checkTruthy('extractCheck/TS as wrapped receiver -> _ref allocation',
    exprStmt.expression.type === 'ConditionalExpression'
    && exprStmt.expression.test.left.type === 'NullLiteral'
    && exprStmt.expression.test.right.type === 'AssignmentExpression'
    && exprStmt.expression.test.right.right.type === 'TSAsExpression');
}

// chain-walk via TS NonNull `arr?.b!.includes(2)`: extractCheck enters chain-descent
// since .includes carries .optional=false. peels TSNonNull at every hop. arr is safe-to-reuse
{
  const { helpers, program } = setup('arr?.b!.includes(2);');
  const exprStmt = runOptional(helpers, program, '_includes',
    { predicate: p => p.node.property?.name === 'includes' });
  checkTruthy('extractCheck/chain-walk peels TSNonNull, identifier check head',
    exprStmt.expression.type === 'ConditionalExpression'
    && exprStmt.expression.test.left.type === 'Identifier'
    && exprStmt.expression.test.left.name === 'arr');
}

// chain-walk: deeper `?.b` deoptionalised after extractCheck; non-optional `.c` stays Member
{
  const { helpers, program } = setup('arr?.b.c.includes(2);');
  const exprStmt = runOptional(helpers, program, '_includes',
    { predicate: p => p.node.property?.name === 'includes' });
  checkTruthy('extractCheck/chain-walk deopts inner ?. and emits identifier check',
    exprStmt.expression.type === 'ConditionalExpression'
    && exprStmt.expression.test.left.type === 'Identifier'
    && exprStmt.expression.test.left.name === 'arr');
}

// --- replaceInstanceLike: non-call usage (e.g. property access bound to var) ---

// `arr.includes` (no outer call): emits `_includes(arr)` - bare wrap, no `.call(...)`
{
  const { helpers, program } = setup('let p = arr.includes;');
  const [stmt] = runMember(helpers, program, '_includes');
  // expected `let p = _includes(arr);` - just the polyfill applied to receiver
  checkTruthy('replaceInstanceLike/non-call -> _polyfill(receiver)',
    stmt.declarations[0].init.type === 'CallExpression'
    && stmt.declarations[0].init.callee.name === '_includes'
    && stmt.declarations[0].init.arguments[0].name === 'arr');
}

// array-element non-call usage `[arr.at]`: emits `[_at(arr)]` - bare wrap inside array
{
  const { helpers, program } = setup('let p = [arr.at];');
  const body = runMember(helpers, program, '_at');
  const arr = body[0].declarations[0].init;
  // `[_at(arr)]`
  checkTruthy('replaceInstanceLike/array-element non-call -> _polyfill(receiver)',
    arr.type === 'ArrayExpression'
    && arr.elements[0].type === 'CallExpression'
    && arr.elements[0].callee.name === '_at'
    && arr.elements[0].arguments[0].name === 'arr');
}

// optional-call form `arr.at?.(0)`: outer .optional carried into emitted OptionalCallExpression
{
  const { helpers, program } = setup('arr.at?.(0);');
  const [stmt] = runMember(helpers, program, '_at');
  // expected OptionalCallExpression at the top - buildMethodCall observed parent.optional=true
  check('replaceInstanceLike/optional-call form -> OptionalCallExpression',
    stmt.expression.type, 'OptionalCallExpression');
  checkTruthy('replaceInstanceLike/optional-call has .call OptionalMemberExpression callee',
    stmt.expression.callee.type === 'OptionalMemberExpression'
    && stmt.expression.callee.property.name === 'call');
}

// multi-arg call: all args cloned into emitted .call(...)
{
  const { helpers, program } = setup('arr.slice(1, 3, foo);');
  const [stmt] = runMember(helpers, program, '_slice');
  // expected `_slice(arr).call(arr, 1, 3, foo)` - 4 args (receiver + 3 user args)
  const callArgs = stmt.expression.arguments;
  check('replaceInstanceLike/multi-arg total argument count', callArgs.length, 4);
  check('replaceInstanceLike/multi-arg first is receiver', callArgs[0].name, 'arr');
  check('replaceInstanceLike/multi-arg user-arg 1', callArgs[1].value, 1);
  check('replaceInstanceLike/multi-arg user-arg 2', callArgs[2].value, 3);
  check('replaceInstanceLike/multi-arg user-arg 3', callArgs[3].name, 'foo');
}

// --- buildMethodCall (via replaceInstanceLike call form) ---

// arg cloning: mutating original user-arg after replaceInstanceLike doesn't affect the emit.
// guards against shared-node aliasing across the synthetic .call argument list
{
  const { helpers, program, ast } = setup('arr.includes(x);');
  const [originalArg] = ast.program.body[0].expression.arguments;
  const [stmt] = runMember(helpers, program, '_includes');
  // mutate the ORIGINAL argument node post-emit
  originalArg.name = 'MUTATED';
  // emit must reflect the cloned `x`, not the mutated `MUTATED`
  check('buildMethodCall/args are cloned (mutating original is harmless)',
    stmt.expression.arguments[1].name, 'x');
}

// non-optional outer call produces MemberExpression + CallExpression (no `Optional` prefix)
{
  const { helpers, program } = setup('arr.includes(1);');
  const [stmt] = runMember(helpers, program, '_includes');
  check('buildMethodCall/non-optional outer is CallExpression',
    stmt.expression.type, 'CallExpression');
  check('buildMethodCall/non-optional callee is MemberExpression',
    stmt.expression.callee.type, 'MemberExpression');
}

// --- replaceInstanceChainCombined ---

// non-optional inner (`arr.at`) + non-optional outer: reading `.at` on a nullish receiver must
// THROW like native, so the receiver guard folds INTO the method-get assignment rather than
// emitting a separate `null == arr` test. with no `?.` anywhere in the chain there is a single
// `null == (_m = _at(arr))` test, so `.test` is a bare BinaryExpression, not an OR-chain.
// `scope.push({id})` for memoized refs injects `var _refN, ...;` at program top; rewritten
// expression lives at the trailing ExpressionStatement
{
  const { helpers, program, ast } = setup('arr.at(0).includes(1);');
  const exprStmt = runChainCombined(helpers, program, ast,
    { outerName: 'includes', outerId: '_includes', innerId: '_at' });
  // shape: `null == (_m = _at(arr)) ? void 0 : _includes(...).call(...)`
  checkTruthy('replaceInstanceChainCombined/emits ConditionalExpression',
    exprStmt.expression.type === 'ConditionalExpression');
  checkTruthy('replaceInstanceChainCombined/non-optional folds receiver into single test',
    exprStmt.expression.test.type === 'BinaryExpression'
    && exprStmt.expression.test.operator === '==');
}

// count OR-chained tests by walking the left spine of the `||` chain
function countOr(n) {
  return n.type === 'LogicalExpression' && n.operator === '||'
    ? countOr(n.left) + 1
    : 1;
}

// non-optional inner + optional outer (`?.includes`): the outer `?.` adds a v-ref null-test for
// the inner result, but the non-optional inner still folds its receiver - so 2 OR-tests
// (m-ref null, v-ref null), NOT 3
{
  const { helpers, program, ast } = setup('arr.at(0)?.includes(1);');
  const exprStmt = runChainCombined(helpers, program, ast,
    { outerName: 'includes', optional: true, outerId: '_includes', innerId: '_at' });
  check('replaceInstanceChainCombined/optional outer adds v-ref test',
    countOr(exprStmt.expression.test), 2);
}

// optional inner (`arr?.at`) + optional outer: the optional inner access emits its own
// `null == arr` receiver guard, so the full OR-chain has 3 tests (a-ref, m-ref, v-ref null)
{
  const { helpers, program, ast } = setup('arr?.at(0)?.includes(1);');
  const exprStmt = runChainCombined(helpers, program, ast,
    { outerName: 'includes', optional: true, outerId: '_includes', innerId: '_at' });
  check('replaceInstanceChainCombined/optional inner adds receiver test',
    countOr(exprStmt.expression.test), 3);
}

// sideEffects fold into the conditional's ALTERNATE (not around the whole conditional) so they
// fire only when the chain does not short-circuit - matches native, which skips a computed-key
// eval on a nullish receiver. wrapping the conditional would run the effect unconditionally.
// inside the alternate the threaded receiver memoizes FIRST (ECMA evaluates the receiver before
// the computed key), then the key SE, then the dispatch on the memo
{
  const { helpers, program, ast } = setup('arr.at(0).includes(1);');
  const se = [t.callExpression(t.identifier('spy'), [])];
  const exprStmt = runChainCombined(helpers, program, ast,
    { outerName: 'includes', outerId: '_includes', innerId: '_at', sideEffects: se });
  // expected: `<tests> ? void 0 : (<ref> = <threaded receiver>, spy(), <method call>)`
  const cond = exprStmt.expression;
  checkTruthy('replaceInstanceChainCombined/sideEffects fold into conditional alternate',
    cond.type === 'ConditionalExpression'
    && cond.alternate.type === 'SequenceExpression'
    && cond.alternate.expressions[0].type === 'AssignmentExpression'
    && cond.alternate.expressions[1].callee.name === 'spy'
    && cond.alternate.expressions[2].type === 'CallExpression');
}

// --- replaceCallWithSimple ---

// callerPath unwraps TS wrappers BETWEEN the MemberExpression and the enclosing call.
// `(arr.includes as any)(1)` shape: TSAsExpression sits between MemberExpression and the
// CallExpression, so unwrapTSExpressionParent peels it before replacePath
{
  const { helpers, program } = setup('let p = (arr.includes as any)(1);');
  const [stmt] = runSimple(helpers, program, '_includes');
  // expected init: `_includes(arr)` - both the TSAsExpression layer AND the outer CallExpression
  // are consumed by the replace (TS wrapper peeled to find true call site)
  const [{ init }] = stmt.declarations;
  checkTruthy('replaceCallWithSimple/peels TS wrapper between member and call',
    init.type === 'CallExpression' && init.callee.name === '_includes'
    && init.arguments[0].name === 'arr');
}

// call with sideEffects: wraps the polyfill result in SequenceExpression
{
  const { helpers, program } = setup('arr.includes(1);');
  const se = [t.callExpression(t.identifier('spy'), [])];
  const [stmt] = runSimple(helpers, program, '_includes', { sideEffects: se });
  // expected: `(spy(), _includes(arr));`
  checkTruthy('replaceCallWithSimple/wraps in SequenceExpression when sideEffects',
    stmt.expression.type === 'SequenceExpression'
    && stmt.expression.expressions[0].callee.name === 'spy'
    && stmt.expression.expressions[1].callee.name === '_includes');
}

// optional-chain receiver with non-skipping skipOptional: ternary guard wraps the result
{
  const { helpers, program } = setup('arr?.includes(1);');
  const [stmt] = runSimple(helpers, program, '_includes', { optional: true });
  // expected: `arr == null ? void 0 : _includes(arr);`
  checkTruthy('replaceCallWithSimple/optional receiver wraps in ConditionalExpression',
    stmt.expression.type === 'ConditionalExpression'
    && stmt.expression.consequent.type === 'UnaryExpression'
    && stmt.expression.consequent.operator === 'void'
    && stmt.expression.alternate.callee.name === '_includes');
}

// optional-chain + sideEffects: SequenceExpression nested INSIDE the ternary's alternate
{
  const { helpers, program } = setup('arr?.includes(1);');
  const se = [t.callExpression(t.identifier('spy'), [])];
  const [stmt] = runSimple(helpers, program, '_includes', { optional: true, sideEffects: se });
  // result built BEFORE replaceAndWrap is `withSideEffects(_includes(arr), [spy()])` =
  // `(spy(), _includes(arr))`. then wrapped: `arr == null ? void 0 : (spy(), _includes(arr));`
  checkTruthy('replaceCallWithSimple/optional + SE keeps SequenceExpression inside ternary',
    stmt.expression.type === 'ConditionalExpression'
    && stmt.expression.alternate.type === 'SequenceExpression'
    && stmt.expression.alternate.expressions[0].callee.name === 'spy'
    && stmt.expression.alternate.expressions[1].callee.name === '_includes');
}

// skipOptional returning truthy: null-guard is skipped, no ternary wrap
{
  const { helpers, program } = setup('arr?.includes(1);');
  const [stmt] = runSimple(helpers, program, '_includes',
    { optional: true, skipOptional: () => true });
  // expected `_includes(arr);` - no ternary, polyfill consumed the `?.` short-circuit
  checkTruthy('replaceCallWithSimple/skipOptional truthy drops ternary',
    stmt.expression.type === 'CallExpression'
    && stmt.expression.callee.name === '_includes'
    && stmt.expression.arguments[0].name === 'arr');
}

// --- undriven private-branch coverage ---
// These branches are reached by the fixture suite but not by the unit cases above, so a
// dispatch regression would only surface behind a fixture-output diff. Each case constructs
// the exact input shape that drives the branch and asserts the distinguishing output.

// does any node in the subtree satisfy `predicate`? mid-transform nodes keep their source Optional*
// type even where the printed form is plain, so predicates must allow both
function someNode(root, predicate) {
  return findNode(root, predicate) !== null;
}

// a call (bare `name()` or member `.name()`, optional or not) to `name`
function isCalleeNamed(n, name) {
  if (n.type !== 'CallExpression' && n.type !== 'OptionalCallExpression') return false;
  const c = n.callee;
  if (c?.type === 'Identifier') return c.name === name;
  if (c?.type === 'MemberExpression' || c?.type === 'OptionalMemberExpression') return c.property?.name === name;
  return false;
}
function containsCallee(node, name) {
  return someNode(node, n => isCalleeNamed(n, name));
}

// a `.call(<firstArg>, ...)` whose first argument satisfies `matchArg` - checks the polyfill keeps
// the original receiver bound as `this`
function hasDotCallBoundTo(node, matchArg) {
  return someNode(node, n => (n.type === 'CallExpression' || n.type === 'OptionalCallExpression')
    && n.callee?.property?.name === 'call' && matchArg(n.arguments[0]));
}

// replaceInstanceChainCombined with surviving non-optional hops between the optional inner call
// and the outer call (`arr.flat?.().map(f).at?.(0)`): `hasHops` splices the memoized inner result
// back into the outer receiver sub-chain so `.map(f)` re-emits instead of being dropped (value
// corruption). the sole existing chain-combined cases have no hops, so `spliceChainInner` and the
// `hasHops` arm never ran
{
  const { helpers, program } = setup('arr.flat?.().map(f).at?.(0);');
  const outerMember = pickMember(program, 'OptionalMemberExpression', 'at');
  const innerCall = pickPath(program, 'OptionalCallExpression', p => p.node.callee?.property?.name === 'flat');
  const hasHops = innerCall.node !== outerMember.node.object;
  checkTruthy('replaceInstanceChainCombined/surviving hop detected as hasHops', hasHops);
  helpers.replaceInstanceChainCombined(outerMember, t.identifier('_at'), {
    innerCallee: innerCall.node.callee,
    innerArgs: innerCall.node.arguments,
    innerId: t.identifier('_flat'),
    chainStartNode: innerCall.node,
    hasHops,
    sideEffects: null,
  });
  const stmt = firstExprStmt(program.node.body);
  // the `.map(f)` hop must survive spliced onto the inner result inside the conditional alternate;
  // a dropped hop would call `.at` on the bare flat() value
  checkTruthy('replaceInstanceChainCombined/hasHops splices surviving .map hop',
    stmt.expression.type === 'ConditionalExpression'
    && containsCallee(stmt.expression.alternate, 'map'));
}

// normalizeOptionalChain trailing optional-CALL backstop (`x?.includes?.(2)`): after deopting the
// `.includes` member, the trailing `?.(2)` genuinely guards it and must STAY optional - the top
// returned is the OptionalCallExpression (unmodified), not the deopted member
{
  const { helpers, program } = setup('x?.includes?.(2);');
  const member = pickMember(program, 'OptionalMemberExpression', 'includes');
  member.get('object').replaceWith(t.identifier('_polyfilled'));
  const top = helpers.normalizeOptionalChain(member.get('object'), true);
  check('normalizeOptionalChain/trailing optional-call stays optional (top is the call)',
    top?.node.type, 'OptionalCallExpression');
  checkTruthy('normalizeOptionalChain/trailing optional-call keeps its ?.', top.node.optional === true);
  check('normalizeOptionalChain/inner member deoptionalized', member.node.type, 'MemberExpression');
}

// rewriteOptionalMethodCall: an OptionalCallExpression chainStart whose callee is a method member
// (`obj.m?.().includes(2)`) - the chain-descent inputs above all have an OptionalMEMBER chainStart,
// so this body never ran. the method is null-guarded while the receiver stays bound via `.call(recv)`.
// three receiver forks: reusable / super->this / memoized-and-folded
{
  const { helpers, program } = setup('obj.m?.().includes(2);');
  const member = pickMember(program, 'OptionalMemberExpression', 'includes');
  helpers.replaceInstanceLike({ path: member, id: t.identifier('_includes'), skipOptional: null, sideEffects: null });
  const stmt = firstExprStmt(program.node.body);
  // `... : _includes(_ref = _ref.call(obj)).call(_ref, 2)` - the method is invoked via `.call(obj)`
  // so the reusable receiver `obj` stays bound as `this` (a plain `_ref()` would pass this=undefined)
  checkTruthy('rewriteOptionalMethodCall/reusable receiver bound via .call(obj)',
    hasDotCallBoundTo(stmt.expression, a => a?.type === 'Identifier' && a.name === 'obj'));
}

// super receiver: `super.m?.()` binds `this` (the call arg cannot be `super`)
{
  const { helpers, program } = setup('class C extends B { f() { return super.m?.().includes(2); } }');
  const member = pickMember(program, 'OptionalMemberExpression', 'includes');
  helpers.replaceInstanceLike({ path: member, id: t.identifier('_includes'), skipOptional: null, sideEffects: null });
  const returned = pickPath(program, 'ReturnStatement').node.argument;
  checkTruthy('rewriteOptionalMethodCall/super receiver rebinds to this',
    hasDotCallBoundTo(returned, a => a?.type === 'ThisExpression'));
}

// memoized side-effecting receiver: `getObj().m?.()` memoizes the receiver and folds its assignment
// ahead of the method memo so it evaluates once, before the method-get
{
  const { helpers, program } = setup('getObj().m?.().includes(2);');
  const member = pickMember(program, 'OptionalMemberExpression', 'includes');
  helpers.replaceInstanceLike({ path: member, id: t.identifier('_includes'), skipOptional: null, sideEffects: null });
  const stmt = firstExprStmt(program.node.body);
  // the guard test is `null == (_ref = getObj(), _ref2 = _ref.m)` - a SequenceExpression folding the
  // receiver memo ahead of the method memo (receiver evaluated once)
  const { test } = stmt.expression;
  checkTruthy('rewriteOptionalMethodCall/memoized receiver folded ahead of method memo',
    stmt.expression.type === 'ConditionalExpression'
    && test.type === 'BinaryExpression'
    && test.right.type === 'SequenceExpression'
    && test.right.expressions[0].right.type === 'CallExpression'
    && test.right.expressions[0].right.callee.name === 'getObj');
}

// applyReceiverSeMode 'peel' + receiverEffectCount: a SequenceExpression receiver (`(f(), arr)`)
// with the SE list replaying the prefix - the receiver is peeled to its tail `arr` and `f()` is
// replayed as the leading side effect. never driven (drivers passed no receiverEffectCount)
{
  const { helpers, program } = setup('(f(), arr).includes(1);');
  const se = [t.callExpression(t.identifier('f'), [])];
  const stmt = firstExprStmt(runMember(helpers, program, '_includes',
    { sideEffects: se, receiverEffectCount: 1, predicate: p => p.node.property?.name === 'includes' }));
  // expected `f(), _includes(arr).call(arr, 1)` - the receiver is PEELED to the bare tail `arr`
  // (not left as the memoized SequenceExpression `_ref = (f(), arr)`, which would re-run `f()`)
  checkTruthy('replaceInstanceLike/peel mode replays SE prefix on peeled tail receiver',
    stmt.expression.type === 'SequenceExpression'
    && stmt.expression.expressions[0].callee.name === 'f'
    && stmt.expression.expressions[1].callee.property.name === 'call'
    && stmt.expression.expressions[1].callee.object.callee.name === '_includes'
    && stmt.expression.expressions[1].callee.object.arguments[0].type === 'Identifier'
    && stmt.expression.expressions[1].callee.object.arguments[0].name === 'arr');
}

// hoistReceiverSE memoize + reorder: a side-effecting receiver (`foo()`) with a key-SE - the
// receiver is memoized and its assignment prepended BEFORE the key SE so it evaluates first
// (native member-call order), instead of the key running before the receiver
{
  const { helpers, program } = setup('foo().includes(1);');
  const se = [t.callExpression(t.identifier('k'), [])];
  const stmt = firstExprStmt(runMember(helpers, program, '_includes',
    { sideEffects: se, receiverEffectCount: 0, predicate: p => p.node.property?.name === 'includes' }));
  // expected `_ref = foo(), k(), _includes(_ref).call(_ref, 1)` - receiver memo hoisted ahead of key
  checkTruthy('hoistReceiverSE/memoized receiver evaluates before key SE',
    stmt.expression.type === 'SequenceExpression'
    && stmt.expression.expressions[0].type === 'AssignmentExpression'
    && stmt.expression.expressions[0].right.callee.name === 'foo'
    && stmt.expression.expressions[1].callee.name === 'k');
}

// hoistReceiverSE check + receiverEffectCount > 0: an optional side-effecting receiver where the
// guard's own memoize already ran the receiver SE - the body must carry ONLY the key SE (empty
// here), never re-emitting the receiver SE
{
  const { helpers, program } = setup('getArr()?.includes(1);');
  const se = [t.callExpression(t.identifier('recvSE'), [])];
  const exprStmt = runOptional(helpers, program, '_includes', { sideEffects: se, receiverEffectCount: 1 });
  // receiver SE (index < receiverEffectCount) is dropped from the body - it lives in the guard memo
  checkTruthy('hoistReceiverSE/optional guard drops already-run receiver SE from body',
    exprStmt.expression.type === 'ConditionalExpression'
    && !containsCallee(exprStmt.expression.alternate, 'recvSE')
    && exprStmt.expression.alternate.type !== 'SequenceExpression');
}

// replaceCallWithSimple paren-lookup (`(arr?.[key])()`): parens terminate the optional chain, so
// a nullish receiver must throw at the outer call. no-SE emits the bare `_id(receiver)`; the SE
// form guards the key SE behind the receiver's nullishness. never driven (runSimple fed no parens)
{
  const { helpers, program } = setup('(arr?.[Symbol.iterator])();');
  const stmt = firstExprStmt(runSimple(helpers, program, '_getIterator', { optional: true }));
  check('replaceCallWithSimple/paren-lookup emits bare call (throws on nullish)',
    stmt.expression.type, 'CallExpression');
  checkTruthy('replaceCallWithSimple/paren-lookup bare call is the polyfill on the receiver',
    stmt.expression.callee.name === '_getIterator'
    && stmt.expression.arguments[0].name === 'arr');
}

// paren-lookup WITH a computed-key SE: the SE fires only when the receiver is non-null (native
// short-circuits `?.` before the key), guarded behind the receiver's nullishness
{
  const { helpers, program } = setup('(arr?.[(sideKey(), Symbol.iterator)])();');
  const se = [t.callExpression(t.identifier('sideKey'), [])];
  const stmt = firstExprStmt(runSimple(helpers, program, '_getIterator', { optional: true, sideEffects: se }));
  // `arr == null ? void 0 : (sideKey(), void 0), _getIterator(arr)` - guarded SE then the call
  checkTruthy('replaceCallWithSimple/paren-lookup guards key SE behind receiver nullishness',
    stmt.expression.type === 'SequenceExpression'
    && stmt.expression.expressions[0].type === 'ConditionalExpression'
    && containsCallee(stmt.expression.expressions[0].alternate, 'sideKey')
    && stmt.expression.expressions[1].callee.name === '_getIterator');
}

// replaceInstanceLike paren-lookup SE-fold-into-alternate: `(arr?.includes)(1)` with a receiver SE
// folds the SE INSIDE the ternary alternate (fires only on the non-null branch), not around the
// whole result. the sole existing paren-lookup case passes no sideEffects, so this fold never ran
{
  const { helpers, program } = setup('(arr?.includes)(1);');
  const se = [t.callExpression(t.identifier('spy'), [])];
  const exprStmt = runOptional(helpers, program, '_includes', { sideEffects: se });
  // `(arr == null ? void 0 : (spy(), _includes(arr))).call(arr, 1)` - the callee is a conditional
  // whose alternate is `(spy(), _includes(arr))`
  const callee = exprStmt.expression.callee.object;
  checkTruthy('replaceInstanceLike/paren-lookup folds SE into ternary alternate',
    exprStmt.expression.callee.property.name === 'call'
    && callee.type === 'ConditionalExpression'
    && callee.alternate.type === 'SequenceExpression'
    && callee.alternate.expressions[0].callee.name === 'spy'
    && callee.alternate.expressions[1].callee.name === '_includes');
}

// replaceAndWrap NewExpression paren-forcing: an OptionalCallExpression replacement standing in a
// NewExpression callee (`new (arr.flat?.())(z)`) must be parenthesized so `new` applies to the
// call result, not the helper. babel codegen would otherwise misprint `new _flat(arr)?.call(arr)(z)`
{
  const { helpers, program } = setup('new (arr.flat?.())(z);');
  const member = pickMember(program, 'MemberExpression', 'flat');
  helpers.replaceInstanceLike({ path: member, id: t.identifier('_flat'), skipOptional: null, sideEffects: null });
  const stmt = firstExprStmt(program.node.body);
  // `new (_flat(arr)?.call(arr))(z)` - the new-callee is a ParenthesizedExpression around the optional call
  checkTruthy('replaceAndWrap/OptionalCall in NewExpression callee is parenthesized',
    stmt.expression.type === 'NewExpression'
    && stmt.expression.callee.type === 'ParenthesizedExpression'
    && stmt.expression.callee.expression.type === 'OptionalCallExpression');
}

// seededRefClone + pathType: when wired with type resolvers, a chain-descent memoize seeds the
// resolved Type on the SAME clone that enters the AST (via `resolvedType.set`), so downstream
// resolution short-circuits back to it. all setups above default the resolvers to null
{
  const { seen, ...resolvers } = stubTypeResolvers({ primitive: false, type: 'object', constructor: 'Array' });
  const helpers = makeHelpers(resolvers);
  const ast = parseCode('arr?.b.includes(2);');
  const program = getProgramPath(ast);
  const member = pickMember(program, 'OptionalMemberExpression', 'includes');
  helpers.replaceInstanceLike({ path: member, id: t.identifier('_includes'), skipOptional: null, sideEffects: null });
  // a node carrying the seeded Type must be present in the rewritten output
  checkTruthy('seededRefClone/resolved Type seeded on the emitted ref clone',
    someNode(firstExprStmt(program.node.body), n => seen.has(n)));
}

// resolvedType relocation: replaceInstanceChainCombined moves the outer call's pre-combine return-
// type stamp onto the wrapping conditional so chained callers still resolve it off the result node
{
  const OUT_TYPE = { primitive: false, type: 'object', constructor: 'Array' };
  const { seen, ...resolvers } = stubTypeResolvers(OUT_TYPE);
  const helpers = makeHelpers(resolvers);
  const ast = parseCode('arr.flat?.().at?.(0);');
  const program = getProgramPath(ast);
  const outerMember = pickMember(program, 'OptionalMemberExpression', 'at');
  seen.set(outerMember.parentPath.node, OUT_TYPE); // pre-combine annotateCallReturnType stamp on the outer call
  const innerCall = pickPath(program, 'OptionalCallExpression', p => p.node.callee?.property?.name === 'flat');
  helpers.replaceInstanceChainCombined(outerMember, t.identifier('_at'), {
    innerCallee: innerCall.node.callee,
    innerArgs: innerCall.node.arguments,
    innerId: t.identifier('_flat'),
    chainStartNode: innerCall.node,
    hasHops: false,
    sideEffects: null,
  });
  const stmt = firstExprStmt(program.node.body);
  checkTruthy('replaceInstanceChainCombined/relocates return-type stamp onto the conditional',
    stmt.expression.type === 'ConditionalExpression' && seen.get(stmt.expression) === OUT_TYPE);
}

finish();
