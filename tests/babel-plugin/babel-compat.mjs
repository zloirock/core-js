// Unit tests for `@core-js/babel-plugin/internals/babel-compat.js`. fixture suite covers
// the helpers indirectly; this file isolates each helper so dispatch-shape regressions
// surface here, not behind a fixture-output diff.
// BABEL_REQUIRE_FROM resolves @babel/parser, @babel/traverse, @babel/types from an
// alternate workspace - mirrors the fixture runner's hook so unit tests run under
// babel@8 (default) and babel@7 (with BABEL_REQUIRE_FROM=../babel-plugin-v7) alike
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { constants as vmConstants, createContext, runInContext, runInNewContext } from 'node:vm';

const { BABEL_REQUIRE_FROM } = process.env;
const requireBabel = BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { parse: babelParse } = requireBabel('@babel/parser');
const { transformSync } = requireBabel('@babel/core');
const traverseModule = requireBabel('@babel/traverse');
const t = requireBabel('@babel/types');
import createASTHelpers, { rangePreservingTypes } from '../../packages/core-js-babel-plugin/internals/babel-compat.js';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { isValidIdentifierName, peelNestedSequenceExpressions } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { createChecker, findNode } from '../polyfill-provider/harness.mjs';
import babelPlugin from '../../packages/core-js-babel-plugin/index.js';

const traverse = traverseModule.default ?? traverseModule;
const { check, checkDeep, checkTruthy, finish } = createChecker('babel-compat');

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
  const adapter = createBabelAdapter();
  return createASTHelpers(t, { getInjector: () => injector, getAdapter: () => adapter, typeResolvers: { resolveNodeType, resolvedType } });
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
  const innerCall = firstExprStmt(ast.program.body).expression.callee.object;
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

// Constant receiver bindings and `this` reuse the guard head without a generated `var`.
const SAFE_REUSE_CASES = [
  { name: 'Identifier no _ref allocation', code: 'const arr = []; arr?.includes(1);', plugins: ['typescript'], headType: 'Identifier', headName: 'arr' },
  { name: 'unbound Identifier keeps adjacent reads', code: 'arr?.includes(1);', plugins: ['typescript'], headType: 'Identifier', headName: 'arr' },
  { name: 'ThisExpression no _ref allocation', code: 'this?.includes(1);', plugins: ['typescript'], headType: 'ThisExpression' },
  {
    name: 'ParenthesizedExpression(Identifier) peeled',
    code: 'const arr = []; (arr)?.includes(1);',
    plugins: ['typescript', ['parenthesizedExpression']],
    headType: 'Identifier',
    headName: 'arr',
  },
  {
    name: 'nested ParenthesizedExpression peeled',
    code: 'const arr = []; ((arr))?.includes(1);',
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
  check(`isReusableReceiver/${ name }: no generated var`,
    program.node.body.some(stmt => stmt.type === 'VariableDeclaration' && stmt.kind === 'var'), false);
}

// unsafe receivers trigger _ref memoize: `null == (_ref = <receiver>)` guard head.
// the rewritten expression is the trailing ExpressionStatement, `var _refN;` lands above
const UNSAFE_REUSE_CASES = [
  {
    name: 'mutable Identifier triggers _ref allocation',
    code: 'let arr = []; function change() { arr = other; } arr?.includes(1);',
    rhsCheck: rhs => rhs.type === 'AssignmentExpression' && rhs.right.name === 'arr',
  },
  {
    name: 'live import Identifier triggers _ref allocation',
    code: 'import { arr } from "fixture"; arr?.includes(1);',
    rhsCheck: rhs => rhs.type === 'AssignmentExpression' && rhs.right.name === 'arr',
  },
  { name: 'CallExpression triggers _ref allocation', code: 'getArr()?.includes(1);', rhsCheck: rhs => rhs.type === 'AssignmentExpression' && rhs.left.name.startsWith('_ref') },
  { name: 'MemberExpression triggers _ref allocation', code: 'obj.arr?.includes(1);', rhsCheck: rhs => rhs.type === 'AssignmentExpression' && rhs.left.name.startsWith('_ref') },
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
  const { alternate } = exprStmt.expression;
  check(`isReusableReceiver/${ name }: helper reads the captured receiver`,
    alternate.callee.object.arguments[0].name, test.right.left.name);
  check(`isReusableReceiver/${ name }: call binds the captured receiver`,
    alternate.arguments[0].name, test.right.left.name);
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

// the seal question asked by a CHANNEL, in both parser modes: the two dialects spell one source
// two ways (a flag on the wrapped node, or a ParenthesizedExpression above it), so a site that
// reads only one of them answers differently per mode - and this pair of channels then routed the
// same source through different arms. the predicate is the one place that knows both spellings
for (const parserOpts of [{}, { createParenthesizedExpressions: true }]) {
  const mode = parserOpts.createParenthesizedExpressions ? 'node' : 'flag';
  const { helpers, program } = setup('(nav.tag)`x`;', ['typescript'], parserOpts);
  const memberPath = pickPath(program, 'MemberExpression', p => p.node.property?.name === 'tag');
  check(`seal-both-spellings/${ mode }: a sealed tag reads as wrapped`,
    helpers.isWrappedInParens(memberPath), true);
  const { helpers: h2, program: p2 } = setup('(nav.fn)();', ['typescript'], parserOpts);
  const calleePath = pickPath(p2, 'MemberExpression', p => p.node.property?.name === 'fn');
  check(`seal-both-spellings/${ mode }: a sealed callee reads as wrapped`,
    h2.isWrappedInParens(calleePath), true);
  const { helpers: h3, program: p3 } = setup('nav.tag`x`;', ['typescript'], parserOpts);
  const barePath = pickPath(p3, 'MemberExpression', p => p.node.property?.name === 'tag');
  check(`seal-both-spellings/${ mode }: an unsealed tag reads as bare`,
    h3.isWrappedInParens(barePath), false);
}

// --- isWrappedInParens (exercised via replaceInstanceLike paren-lookup-only branch) ---

// bare optional member: not wrapped, plain replaceInstanceLike path
{
  const { helpers, program } = setup('const arr = []; arr?.includes(1);');
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
  const { helpers, program } = setup('const arr = []; arr?.includes(1);');
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

// A type-only receiver wrapper preserves the adjacent-read identifier contract.
{
  const { helpers, program } = setup('(arr as any)?.at(0);');
  const exprStmt = runOptional(helpers, program, '_at');
  checkTruthy('extractCheck/TS as wrapped receiver reuses its value without a capture',
    exprStmt.expression.type === 'ConditionalExpression'
    && exprStmt.expression.test.left.type === 'NullLiteral'
    && exprStmt.expression.test.right.type === 'TSAsExpression'
    && exprStmt.expression.test.right.expression.name === 'arr');
}

// chain-walk via TS NonNull `arr?.b!.includes(2)`: extractCheck enters chain-descent
// since .includes carries .optional=false. peels TSNonNull at every hop. arr is safe-to-reuse
{
  const { helpers, program } = setup('const arr = []; arr?.b!.includes(2);');
  const exprStmt = runOptional(helpers, program, '_includes',
    { predicate: p => p.node.property?.name === 'includes' });
  checkTruthy('extractCheck/chain-walk peels TSNonNull, identifier check head',
    exprStmt.expression.type === 'ConditionalExpression'
    && exprStmt.expression.test.left.type === 'Identifier'
    && exprStmt.expression.test.left.name === 'arr');
}

// chain-walk: deeper `?.b` deoptionalised after extractCheck; non-optional `.c` stays Member
{
  const { helpers, program } = setup('const arr = []; arr?.b.c.includes(2);');
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
  const { helpers, program } = setup('const arr = []; arr.at?.(0);');
  const stmt = firstExprStmt(runMember(helpers, program, '_at'));
  // expected OptionalCallExpression at the top - buildMethodCall observed parent.optional=true
  check('replaceInstanceLike/optional-call form -> OptionalCallExpression',
    stmt.expression.type, 'OptionalCallExpression');
  checkTruthy('replaceInstanceLike/optional-call has .call OptionalMemberExpression callee',
    stmt.expression.callee.type === 'OptionalMemberExpression'
    && stmt.expression.callee.property.name === 'call');
}

// multi-arg call: all args cloned into emitted .call(...)
{
  const { helpers, program } = setup('const arr = []; arr.slice(1, 3, foo);');
  const stmt = firstExprStmt(runMember(helpers, program, '_slice'));
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
  const { helpers, program, ast } = setup('const arr = []; arr.includes(x);');
  const [originalArg] = firstExprStmt(ast.program.body).expression.arguments;
  const stmt = firstExprStmt(runMember(helpers, program, '_includes'));
  // mutate the ORIGINAL argument node post-emit
  originalArg.name = 'MUTATED';
  // emit must reflect the cloned `x`, not the mutated `MUTATED`
  check('buildMethodCall/args are cloned (mutating original is harmless)',
    stmt.expression.arguments[1].name, 'x');
}

// non-optional outer call produces MemberExpression + CallExpression (no `Optional` prefix)
{
  const { helpers, program } = setup('const arr = []; arr.includes(1);');
  const stmt = firstExprStmt(runMember(helpers, program, '_includes'));
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
  const { helpers, program, ast } = setup('const arr = []; arr.at(0).includes(1);');
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
  const { helpers, program, ast } = setup('const arr = []; arr.at(0)?.includes(1);');
  const exprStmt = runChainCombined(helpers, program, ast,
    { outerName: 'includes', optional: true, outerId: '_includes', innerId: '_at' });
  check('replaceInstanceChainCombined/optional outer adds v-ref test',
    countOr(exprStmt.expression.test), 2);
}

// optional inner (`arr?.at`) + optional outer: the optional inner access emits its own
// `null == arr` receiver guard, so the full OR-chain has 3 tests (a-ref, m-ref, v-ref null)
{
  const { helpers, program, ast } = setup('const arr = []; arr?.at(0)?.includes(1);');
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
  const { helpers, program, ast } = setup('const arr = []; arr.at(0).includes(1);');
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
// CallExpression, so the canon slot peel reaches it before replacePath
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
  const { helpers, program } = setup('const arr = []; arr.includes(1);');
  const se = [t.callExpression(t.identifier('spy'), [])];
  const stmt = firstExprStmt(runSimple(helpers, program, '_includes', { sideEffects: se }));
  // expected: `(arr, spy(), _includes(arr));` - the receiver read precedes the key effect.
  checkTruthy('replaceCallWithSimple/wraps in SequenceExpression when sideEffects',
    stmt.expression.type === 'SequenceExpression'
    && stmt.expression.expressions[0].name === 'arr'
    && stmt.expression.expressions[1].callee.name === 'spy'
    && stmt.expression.expressions[2].callee.name === '_includes');
}

// optional-chain receiver with non-skipping skipOptional: ternary guard wraps the result
{
  const { helpers, program } = setup('const arr = []; arr?.includes(1);');
  const stmt = firstExprStmt(runSimple(helpers, program, '_includes', { optional: true }));
  // expected: `arr == null ? void 0 : _includes(arr);`
  checkTruthy('replaceCallWithSimple/optional receiver wraps in ConditionalExpression',
    stmt.expression.type === 'ConditionalExpression'
    && stmt.expression.consequent.type === 'UnaryExpression'
    && stmt.expression.consequent.operator === 'void'
    && stmt.expression.alternate.callee.name === '_includes');
}

// optional-chain + sideEffects: SequenceExpression nested INSIDE the ternary's alternate
{
  const { helpers, program } = setup('const arr = []; arr?.includes(1);');
  const se = [t.callExpression(t.identifier('spy'), [])];
  const stmt = firstExprStmt(runSimple(helpers, program, '_includes', { optional: true, sideEffects: se }));
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
  const { helpers, program } = setup('const arr = []; arr?.includes(1);');
  const stmt = firstExprStmt(runSimple(helpers, program, '_includes',
    { optional: true, skipOptional: () => true }));
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
  const { helpers, program } = setup('const obj = {}; obj.m?.().includes(2);');
  const member = pickMember(program, 'OptionalMemberExpression', 'includes');
  helpers.replaceInstanceLike({ path: member, id: t.identifier('_includes'), skipOptional: null, sideEffects: null });
  const stmt = firstExprStmt(program.node.body);
  // `... : _includes(_ref = _ref.call(obj)).call(_ref, 2)` - the method is invoked via `.call(obj)`
  // so the reusable receiver `obj` stays bound as `this` (a plain `_ref()` would pass this=undefined)
  checkTruthy('rewriteOptionalMethodCall/reusable receiver bound via .call(obj)',
    hasDotCallBoundTo(stmt.expression, a => a?.type === 'Identifier' && a.name === 'obj'));
}

// Quiet names need no receiver snapshot. Deferred writers without a closed caller
// census and source-visible getters still capture before selecting the optional method.
for (const [name, code, captures] of [
  ['unbound', 'obj.m?.().includes(2);', false],
  ['deferred writer', 'let obj = {}; function change() { obj = other; } obj.m?.().includes(2);', true],
  ['getter writer', 'let obj = { get m() { obj = other; return invoke; } }; obj.m?.().includes(2);', true],
]) {
  const { helpers, program } = setup(code);
  const member = pickMember(program, 'OptionalMemberExpression', 'includes');
  helpers.replaceInstanceLike({ path: member, id: t.identifier('_includes'), skipOptional: null, sideEffects: null });
  const { expression } = firstExprStmt(program.node.body);
  const [receiverMemo, methodMemo] = captures ? expression.test.right.expressions : [null, expression.test.right];
  check(`rewriteOptionalMethodCall/${ name }: receiver capture`, expression.test.right.type === 'SequenceExpression', captures);
  if (captures) check(`rewriteOptionalMethodCall/${ name }: receiver captured before method getter`, receiverMemo.right.name, 'obj');
  const receiverName = receiverMemo?.left.name ?? 'obj';
  check(`rewriteOptionalMethodCall/${ name }: method reads selected receiver`, methodMemo.right.object.name, receiverName);
  checkTruthy(`rewriteOptionalMethodCall/${ name }: invocation binds captured receiver`,
    hasDotCallBoundTo(expression, arg => arg?.type === 'Identifier' && arg.name === receiverName));
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

// The full first receiver retains its prefix once; the later call receiver is its stable tail.
{
  const { helpers, program } = setup('const arr = []; (f(), arr).includes(1);');
  const se = [t.callExpression(t.identifier('f'), [])];
  const stmt = firstExprStmt(runMember(helpers, program, '_includes',
    { sideEffects: se, receiverEffectCount: 1, predicate: p => p.node.property?.name === 'includes' }));
  const call = stmt.expression;
  let prefixCalls = 0;
  t.traverseFast(call, node => { if (node.type === 'CallExpression' && node.callee.name === 'f') prefixCalls++; });
  check('replaceInstanceLike/peel mode retains one first receiver prefix', prefixCalls, 1);
  checkTruthy('replaceInstanceLike/peel mode reuses the stable tail after the complete first read',
    call.type === 'CallExpression' && call.callee.property.name === 'call'
    && call.callee.object.callee.name === '_includes'
    && call.callee.object.arguments[0].type === 'SequenceExpression'
    && call.callee.object.arguments[0].expressions.at(-1).name === 'arr'
    && call.arguments[0].name === 'arr');
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

// Evaluate a quiet identifier before the key without storing it. A deferred writer
// reachable across key effects still requires the original receiver value.
for (const [name, code, captures] of [
  ['unbound', 'arr.includes(1);', false],
  ['mutable', 'let arr = []; function change() { arr = other; } arr.includes(1);', true],
]) {
  const { helpers, program } = setup(code);
  const stmt = firstExprStmt(runMember(helpers, program, '_includes', { sideEffects: [t.callExpression(t.identifier('keyEffect'), [])], receiverEffectCount: 0 }));
  const [receiverRead, keyEffect, call] = stmt.expression.expressions;
  check(`hoistReceiverSE/${ name }: receiver capture`, receiverRead.type === 'AssignmentExpression', captures);
  check(`hoistReceiverSE/${ name }: receiver evaluated before key`, (captures ? receiverRead.right : receiverRead).name, 'arr');
  const receiverName = captures ? receiverRead.left.name : 'arr';
  check(`hoistReceiverSE/${ name }: key follows capture`, keyEffect.callee.name, 'keyEffect');
  check(`hoistReceiverSE/${ name }: helper reads selected receiver`, call.callee.object.arguments[0].name, receiverName);
  check(`hoistReceiverSE/${ name }: call binds selected receiver`, call.arguments[0].name, receiverName);
}

// A stable value can be reread without a snapshot, but its first evaluation precedes
// the key. That read can throw for a const in its TDZ or `this` before `super()`.
for (const [name, code, receiverType] of [
  ['initialized const', 'const held = []; held.includes(1);', 'Identifier'],
  ['const before initialization', 'held.includes(1); const held = [];', 'Identifier'],
  ['this before super', 'class Derived extends Array { constructor() { this.includes(1); super(); } }', 'ThisExpression'],
]) {
  const { helpers, program } = setup(code);
  const member = pickMember(program, 'MemberExpression', 'includes');
  helpers.replaceInstanceLike({
    path: member,
    id: t.identifier('_includes'),
    skipOptional: null,
    sideEffects: [t.callExpression(t.identifier('keyEffect'), [])],
    receiverEffectCount: 0,
  });
  const sequence = findNode(program.node, node => node.type === 'SequenceExpression'
    && node.expressions[0].type === receiverType && node.expressions[1]?.callee?.name === 'keyEffect');
  checkTruthy(`hoistReceiverSE/${ name }: first read precedes key`, sequence);
  check(`hoistReceiverSE/${ name }: no receiver snapshot`, refCounter, 0);
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
  // The guard checks the quiet receiver; the key effect stays in its non-null alternate.
  const callee = exprStmt.expression.callee.object;
  checkTruthy('replaceInstanceLike/paren-lookup folds SE into ternary alternate',
    exprStmt.expression.callee.property.name === 'call'
    && callee.type === 'ConditionalExpression'
    && callee.alternate.type === 'SequenceExpression'
    && callee.test.left.type === 'Identifier'
    && callee.test.left.name === 'arr'
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

// --- rangePreservingTypes: what a copy must carry, and what it must not hand the original ---
// the resolver's positional rules read `start` / `end`; babel's own `cloneNode` keeps `loc` and
// drops the offsets, so a read carried into a rewritten host answers "no position" to all of them.
// the shallow arm has no call site in this package and is a guard, so only a unit can hold it
{
  const parsed = babelParse('f(x.at(0));', { sourceType: 'module' });
  const [sourceArg] = parsed.program.body[0].expression.arguments;
  const wrapped = rangePreservingTypes(t);
  check('rangePreservingTypes/babel drops the offsets on its own', t.cloneNode(sourceArg).start, undefined);
  const deep = wrapped.cloneNode(sourceArg);
  check('rangePreservingTypes/a deep clone gets its start back from loc', deep.start, sourceArg.start);
  check('rangePreservingTypes/... and its end', deep.end, sourceArg.end);
  check('rangePreservingTypes/cloneDeep is wrapped too', wrapped.cloneDeep(sourceArg).start, sourceArg.start);
  // a SHALLOW copy shares the ORIGINAL's children: stamping them would give live source nodes a span
  // they never occupied, and would throw outright on a frozen one
  const shared = t.identifier('_helper');
  shared.loc = sourceArg.loc;
  wrapped.cloneNode(t.callExpression(shared, []), false);
  check('rangePreservingTypes/a shallow clone leaves the shared child unstamped', shared.start, undefined);
  checkTruthy('rangePreservingTypes/one wrapper per types object', rangePreservingTypes(t) === wrapped);
}

// A receiver already served by this pass is reused in its rendered spelling. Source bindings,
// getter receivers and guarded environment reads retain their evaluation boundaries.
for (const [label, source, entry, captures] of [
  ['bare realm', 'globalThis.flat?.().includes(1);', 'global-this', 0],
  ['parenthesized realm', '(globalThis).flat?.().includes(1);', 'global-this', 0],
  ['constructor optional method', 'Promise.noSuchStatic?.().includes(0);', 'promise', 0],
  ['constructor optional method with two consumers', 'Promise.noSuchStatic?.().flat().at(0);', 'promise', 0],
  ['static value', 'Number.MAX_SAFE_INTEGER.toFixed(2);', 'number/max-safe-integer', 0],
  ['computed static value', 'let f = 0; Number[(f++, "MAX_SAFE_INTEGER")].toFixed(2);', 'number/max-safe-integer', 0],
  ['literal computed static value', 'Number["MAX_SAFE_INTEGER"].toFixed(2);', 'number/max-safe-integer', 0],
  ['nested computed static value', 'let f = 0, g = 0; Number[(f++, (g++, "MAX_SAFE_INTEGER"))].toFixed(2);', 'number/max-safe-integer', 0],
  ['guarded computed static value', 'let e = 0, f = 0, u; ((e++, u = globalThis.window))?.Number[(f++, "MAX_SAFE_INTEGER")].toFixed(2);', 'number/max-safe-integer', 0],
  ['guarded computed object hop', 'let g = 0, u; (u = globalThis.window)?.[(g++, "Number")].MAX_SAFE_INTEGER.toFixed(2);', 'number/max-safe-integer', 0],
  ['computed object and leaf keys', 'let g = 0, f = 0, u; (u = globalThis.window)?.[(g++, "Number")][(f++, "MAX_SAFE_INTEGER")].toFixed(2);', 'number/max-safe-integer', 0],
  ['guarded static default', 'function take(x = (globalThis.window?.self.window)?.Number.MAX_SAFE_INTEGER.toFixed(2)) { return x; }', 'number/max-safe-integer', 0],
  ['stored realm static', 'let c = 0, d = 0, k; (d++, (c++, k = globalThis.window.self))?.Number.MAX_SAFE_INTEGER.toFixed(1);', 'number/max-safe-integer', 0],
  ['effectful receiver tail', 'globalThis?.[(hop(), "self")].window[(key(), Symbol.iterator)]();', 'global-this', 0],
  ['sealed receiver tail', '(globalThis?.[(hop(), "self")][(key(), Symbol.iterator)])();', 'self', 0],
  ['sequence realm optional method', '(before(), globalThis).flat?.().includes(1);', 'global-this', 0],
  ['alias sequence before call result', 'const g = globalThis; let c = 0, d = 0; (d++, (c++, g.self))?.foo().at(0);', 'self', 0],
  ['direct sequence before call result', 'let c = 0, d = 0; (d++, (c++, globalThis.self))?.foo().at(0);', 'self', 0],
  ['alias sequence before prototype read', 'const ga = globalThis; let c = 0, d = 0; (d++, (c++, ga.window.self))?.Array.prototype.at;', 'self', 0],
  ['alias sequence before explicit prototype call', 'const g = globalThis; let c = 0, d = 0; (c++, (d++, g.self))?.Array.prototype.map.call([1], x => x);', 'self', 0],
  ['opaque call sequence before guarded static', 'let bodyCount = 0; const db = () => { bodyCount++; return globalThis; }; db()?.self?.window?.Array.of(11).at(0);', 'self', 0],
  ['sealed aliased symbol call', 'const key = Symbol.iterator; function getRealm() { setup(); return globalThis; } (getRealm()[(hop(), "self")]?.[key])();', 'self', 0],
  [
    'sealed aliased symbol argument call',
    'const key = Symbol.iterator; function getRealm() { setup(); return globalThis; } (getRealm()[(hop(), "self")]?.[key])(42);',
    'self',
    0,
  ],
  ['foreign constructor import', 'import Promise from "foreign-module"; Promise.noSuchStatic?.().includes(0);', 'foreign-module', 1],
  ['mutable source alias', 'let P = Promise; function write() { P = other; } P.noSuchStatic?.().includes(0);', 'promise', 0],
]) {
  // eslint-disable-next-line node/no-sync -- synchronous AST comparisons keep the unit suite's evaluation order
  const { ast } = transformSync(source, {
    ast: true,
    configFile: false,
    babelrc: false,
    filename: 'receiver-handoff.mjs',
    plugins: [[babelPlugin, { method: 'usage-pure', version: '4.0', targets: { ie: 11 } }]],
  });
  const imported = ast.program.body.find(node => node.type === 'ImportDeclaration'
    && (node.source.value === entry || node.source.value.endsWith(`/actual/${ entry }`)
      || node.source.value.endsWith(`/actual/${ entry }/constructor`)));
  checkTruthy(`rendered receiver handoff/${ label }: receiver import survives`, imported);
  if (!imported) continue;
  const receiverName = imported.specifiers[0].local.name;
  let copiedReceiver = 0;
  t.traverseFast(ast, node => {
    if (node.type !== 'AssignmentExpression' || node.left.type !== 'Identifier' || !/^_ref\d*$/.test(node.left.name)) return;
    let value = node.right;
    while (value.type === 'SequenceExpression') value = value.expressions.at(-1);
    if (value.type === 'Identifier' && value.name === receiverName) copiedReceiver++;
  });
  check(`rendered receiver handoff/${ label }: imported receiver captures`, copiedReceiver, captures);
}

// The exact fixture is the source oracle. Realm bindings below are VM-local; instance helpers are real.
{
  const source = await fs.readFile(new URL('../transpiler-fixtures/usage-pure/audit-synth-memo-live-se-claims/input.mjs',
    import.meta.url), 'utf8');
  const optionsText = await fs.readFile(new URL('../transpiler-fixtures/usage-pure/audit-synth-memo-live-se-claims/options.json',
    import.meta.url));
  const options = JSON.parse(optionsText);
  // eslint-disable-next-line node/no-sync -- exact source and native chronology share one AST snapshot
  const { ast, code } = transformSync(source, {
    ast: true,
    configFile: false,
    babelrc: false,
    filename: 'synth-receiver-handoff.mjs',
    parserOpts: options.parserOpts,
    plugins: [[babelPlugin, options.plugins[0][1]]],
  });
  const imports = ast.program.body.filter(node => node.type === 'ImportDeclaration');
  const mapImport = imports.find(node => node.source.value.endsWith('/actual/map/constructor'));
  checkTruthy('synth receiver handoff: own Map import survives', mapImport);
  const mapName = mapImport.specifiers[0].local.name;
  let mapCopies = 0;
  let getObjSnapshots = 0;
  let proxyParameters = 0;
  t.traverseFast(ast, node => {
    const values = node.type === 'AssignmentExpression' ? [node.right]
      : node.type === 'VariableDeclarator' && node.init ? [node.init]
      : node.type === 'CallExpression' && node.callee.type === 'FunctionExpression'
        ? node.arguments.filter((arg, index) => node.callee.params[index]) : [];
    mapCopies += values.filter(value => peelNestedSequenceExpressions(value).tail?.type === 'Identifier' && peelNestedSequenceExpressions(value).tail.name === mapName).length;
    if (node.type !== 'CallExpression') return;
    const helper = node.callee.type === 'MemberExpression' && node.callee.property.name === 'call'
      ? node.callee.object : null;
    const assignment = helper?.type === 'CallExpression' ? helper.arguments[0] : null;
    if (assignment?.type === 'AssignmentExpression' && assignment.right.type === 'CallExpression'
      && assignment.right.callee.name === 'getObj' && node.arguments[0]?.name === assignment.left.name) {
      getObjSnapshots++;
    }
    if (node.callee.type !== 'FunctionExpression') return;
    node.arguments.forEach((argument, index) => {
      const value = peelNestedSequenceExpressions(argument).tail;
      const parameter = node.callee.params[index];
      if (value?.type !== 'MemberExpression' || value.property.name !== 'Array' || !parameter) return;
      let readsUnknownSlot = false;
      t.traverseFast(node.callee.body, child => {
        if (child.type === 'MemberExpression' && child.object.name === parameter.name && child.property.name === 'nope') {
          readsUnknownSlot = true;
        }
      });
      if (readsUnknownSlot) proxyParameters++;
    });
  });
  check('synth receiver handoff: own Map copies including IIFE params', mapCopies, 0);
  check('synth receiver handoff: mandatory getObj lookup/this snapshots', getObjSnapshots, 2);
  check('synth receiver handoff: unknown proxy Array parameter', proxyParameters, 1);

  const values = await Promise.all(imports.map(async node => (await import(node.source.value)).default));
  const importsByName = Object.fromEntries(imports.map((node, index) => [node.specifiers[0].local.name, values[index]]));
  // Constructor/self values belong to each VM realm. This checks handoff, not import availability.
  const bindings = imports.flatMap(node => {
    const { name } = node.specifiers[0].local;
    const entry = node.source.value;
    return entry.endsWith('/actual/map/constructor') ? [`const ${ name } = Map;`]
      : entry.endsWith('/actual/map/group-by') ? [`const ${ name } = Map.groupBy;`]
      : entry.endsWith('/actual/self') ? [`const ${ name } = globalThis;`] : [];
  }).join('\n');
  const emitted = code.replaceAll(/^import .*;$/gm, '');
  const ordinary = ['getObj:0', 'at:0', 'call:0:true', 'more:0', 'more2:1', 'getObj:1', 'at:1', 'call:1:true', 'Array:1'];
  for (const [mode, expectedEvents, expectedError] of [
    ['ordinary', ordinary, undefined],
    ['first-prefix-throws', ['getObj:0'], 'TypeError'],
    ['second-default-throws', ordinary.slice(0, 6), 'TypeError'],
    ['proxy-array-throws', ordinary, 'TypeError'],
  ]) {
    const prelude = `
      const events = globalThis.vmEvents = [];
      let calls = 0, useResult;
      globalThis.self = globalThis;
      const nativeArray = Array;
      Object.defineProperty(globalThis, 'Array', { get() {
        events.push('Array:' + tick);
        if (__mode === 'proxy-array-throws') throw new TypeError('proxy Array');
        return nativeArray;
      } });
      for (const name of ['more', 'more2']) Object.defineProperty(Map, name, { get() {
        events.push(name + ':' + tick); return name;
      } });
      function getObj() {
        calls++; events.push('getObj:' + tick);
        if (__mode === 'first-prefix-throws' && calls === 1
          || __mode === 'second-default-throws' && calls === 2) throw new TypeError('getObj');
        const held = { get at() { events.push('at:' + tick); return function () {
          events.push('call:' + tick + ':' + (this === held)); return 3;
        }; } };
        return held;
      }
      function use(value) { useResult = value; }
    `;
    const observe = 'JSON.stringify([calls, tick, useResult]);';
    const results = [];
    for (const [leg, body] of [['native', source], ['emitted', bindings + emitted]]) {
      // Contextified globals can retry a throwing getter on Node 25.
      const context = Object.assign(createContext(vmConstants.DONT_CONTEXTIFY),
        { __mode: mode, ...leg === 'emitted' ? importsByName : {} });
      let value, error;
      try {
        value = JSON.parse(runInContext(prelude + body + observe, context));
      } catch (error_) {
        error = error_.name;
      }
      results.push({ value, error, events: Array.from(context.vmEvents) });
    }
    checkDeep(`synth receiver handoff/${ mode }: native chronology`, results[0].events, expectedEvents);
    check(`synth receiver handoff/${ mode }: native error`, results[0].error, expectedError);
    if (mode === 'ordinary') {
      checkDeep('synth receiver handoff: native call count, tick and proxy result',
        results[0].value, [2, 1, ['function', 'undefined', 3]]);
    }
    checkDeep(`synth receiver handoff/${ mode }: emitted equals native`, results[1], results[0]);
  }
}

// The kept-tail renderer retains the environmental probe of a direct nested navigation.
// Both nullable probes survive; the final backed tail needs no stored copy.
{
  // eslint-disable-next-line node/no-sync -- synchronous AST comparisons keep the unit suite's evaluation order
  const { ast } = transformSync('let c = 0, d = 0; (d++, (c++, globalThis.window.self))?.Array.prototype.at;', {
    ast: true,
    configFile: false,
    babelrc: false,
    filename: 'receiver-handoff-probe.mjs',
    plugins: [[babelPlugin, { method: 'usage-pure', version: '4.0', targets: { ie: 11 } }]],
  });
  let captures = 0;
  let probes = 0;
  t.traverseFast(ast, node => {
    if (node.type === 'VariableDeclarator' && !node.init) captures++;
    if (node.type === 'ConditionalExpression') probes++;
  });
  check('rendered receiver handoff/direct window probe: stable guarded tail copies', captures, 0);
  check('rendered receiver handoff/direct window probe: inner probe and outer guard survive', probes, 2);
}

// The exact guarded computed-static input keeps its source stores and key effects in both branches.
{
  const source = await fs.readFile(new URL('../transpiler-fixtures/usage-pure/audit-optional-outer-guard-computed-static-key/input.mjs',
    import.meta.url), 'utf8');
  // eslint-disable-next-line node/no-sync -- compare one unchanged fixture input with its emitted AST
  const { ast, code } = transformSync(source, {
    ast: true,
    configFile: false,
    babelrc: false,
    filename: 'computed-static-receiver.mjs',
    plugins: [[babelPlugin, { method: 'usage-pure', version: '4.0', targets: { ie: 11 } }]],
  });
  const imports = ast.program.body.filter(node => node.type === 'ImportDeclaration');
  const values = await Promise.all(imports.map(async node => (await import(node.source.value)).default));
  const emitted = code.replaceAll(/^import .*;$/gm, '').replaceAll(/\bexport const\b/g, 'const');
  const native = source.replaceAll(/\bexport const\b/g, 'const');
  const observe = 'return [seqCtorStaticComputed, e, f, u === globalThis.window];';
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'window');
  try {
    for (const present of [false, true]) {
      Object.defineProperty(globalThis, 'window', { configurable: true, value: present ? globalThis : undefined });
      const expected = [present ? '9007199254740991.00' : undefined, 1, present ? 1 : 0, true];
      checkDeep(`computed static receiver/window ${ present }: native guard, store and key`, Function(`${ native } ${ observe }`)(), expected);
      checkDeep(`computed static receiver/window ${ present }: emitted guard, store and key`,
        Function(...imports.map(node => node.specifiers[0].local.name), `${ emitted } ${ observe }`)(...values), expected);
    }
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'window', descriptor); else delete globalThis.window;
  }
}

for (const [label, source, capturesExpected = 1] of [
  ['mutated namespace alias', 'let N = Number; N = other; let f = 0; N[(f++, "MAX_SAFE_INTEGER")].toFixed(2);'],
  ['foreign namespace', 'import N from "foreign-module"; let f = 0; N[(f++, "MAX_SAFE_INTEGER")].toFixed(2);'],
  ['unknown namespace', 'let f = 0; foreignNumber[(f++, "MAX_SAFE_INTEGER")].toFixed(2);'],
  ['getter namespace', 'const box = { get Number() { return Number; } }; let f = 0; box.Number[(f++, "MAX_SAFE_INTEGER")].toFixed(2);', 0],
  ['opaque getter namespace', 'const box = { get Number() { return foreignNumber; } }; let f = 0; box.Number[(f++, "MAX_SAFE_INTEGER")].toFixed(2);'],
  ['union namespace', 'const N = flag ? Number : { MAX_SAFE_INTEGER: 12 }; let f = 0; N[(f++, "MAX_SAFE_INTEGER")].toFixed(2);'],
  ['foreign computed object hop', 'import realm from "foreign-module"; let g = 0; realm[(g++, "Number")].MAX_SAFE_INTEGER.toFixed(2);'],
  ['unknown computed object hop', 'let g = 0; realm[(g++, "Number")].MAX_SAFE_INTEGER.toFixed(2);'],
  ['getter computed object hop', 'const box = { get Number() { return Number; } }; let g = 0; box[(g++, "Number")].MAX_SAFE_INTEGER.toFixed(2);', 0],
  ['mutable computed object hop', 'let realm = globalThis; realm = other; let g = 0; realm[(g++, "Number")].MAX_SAFE_INTEGER.toFixed(2);'],
]) {
  // eslint-disable-next-line node/no-sync -- source namespaces cannot inherit an owned static verdict
  const { ast } = transformSync(source, {
    ast: true,
    configFile: false,
    babelrc: false,
    filename: 'computed-static-negative.mjs',
    plugins: [[babelPlugin, { method: 'usage-pure', version: '4.0', targets: { ie: 11 } }]],
  });
  let captures = 0;
  t.traverseFast(ast, node => { if (node.type === 'VariableDeclarator' && !node.init) captures++; });
  check(`computed static receiver/${ label }: final receiver copies`, captures > 0, capturesExpected > 0);
}

for (const [label, source, reusable] of [
  ['TS namespace', 'let f = 0; (Number as any)[(f++, "MAX_SAFE_INTEGER")].toFixed(2);', true],
  ['TS key', 'let f = 0; Number[(f++, ("MAX_SAFE_INTEGER" as const))].toFixed(2);', true],
  ['TS scalar', 'let f = 0; (Number[(f++, "MAX_SAFE_INTEGER")] as number).toFixed(2);', true],
  ['TS namespace spine', 'let f = 0; (globalThis as any).Number[(f++, "MAX_SAFE_INTEGER")].toFixed(2);', true],
  ['TS getter namespace', 'const box: { Number: NumberConstructor } = { get Number() { return Number; } }; let f = 0; box.Number[(f++, "MAX_SAFE_INTEGER")].toFixed(2);', true],
  ['TS parameter namespace', 'function take(N: NumberConstructor) { let f = 0; return N[(f++, "MAX_SAFE_INTEGER")].toFixed(2); }', false],
  ['TS sealed optional namespace', 'let f = 0; (globalThis.window?.Number as any)[(f++, "MAX_SAFE_INTEGER")].toFixed(2);', true],
]) {
  // eslint-disable-next-line node/no-sync -- type wrappers cannot strengthen a source namespace proof
  const { ast } = transformSync(source, {
    ast: true,
    configFile: false,
    babelrc: false,
    filename: 'computed-static-typescript.ts',
    parserOpts: { plugins: ['typescript'] },
    plugins: [[babelPlugin, { method: 'usage-pure', version: '4.0', targets: { ie: 11 } }]],
  });
  let captures = 0;
  t.traverseFast(ast, node => { if (node.type === 'VariableDeclarator' && !node.init) captures++; });
  check(`computed static receiver/${ label }: runtime namespace decides reuse`, captures === 0, reusable);
}

// A quiet key view must never construct an Identifier from a numeric or punctuation key.
for (const key of ['0', '1', '?.', 'v_-1', 'default', '\u03C0']) {
  const source = `const events = []; const box = { ${ JSON.stringify(key) }: ['held'] }; export const result = [box[(events.push('key'), ${ JSON.stringify(key) })].at(0), events];`;
  // eslint-disable-next-line node/no-sync -- key-shape regressions must reach both the builder and runtime
  const { ast, code } = transformSync(source, {
    ast: true,
    configFile: false,
    babelrc: false,
    filename: 'receiver-key-shape.mjs',
    plugins: [[babelPlugin, { method: 'usage-pure', version: '4.0', targets: { ie: 11 } }]],
  });
  let invalid = 0;
  t.traverseFast(ast, node => { if (node.type === 'Identifier' && !isValidIdentifierName(node.name)) invalid++; });
  check(`receiver key shape/${ key }: valid emitted identifiers`, invalid, 0);
  const imports = ast.program.body.filter(node => node.type === 'ImportDeclaration');
  const values = await Promise.all(imports.map(async node => (await import(node.source.value)).default));
  const emitted = code.replaceAll(/^import .*;$/gm, '').replaceAll(/\bexport const result\b/g, 'const result');
  const native = source.replaceAll(/\bexport const result\b/g, 'const result');
  checkDeep(`receiver key shape/${ key }: native order`, Function(`${ native } return result;`)(), ['held', ['key']]);
  checkDeep(`receiver key shape/${ key }: emitted order`, Function(...imports.map(node => node.specifiers[0].local.name),
    `${ emitted } return result;`)(...values), ['held', ['key']]);
}

// Object-hop keys and leaf keys stay in their original first evaluation, behind the source guard.
{
  const exact = await fs.readFile(new URL('../transpiler-fixtures/usage-pure/audit-ctor-static-collapse-keeps-hop-key-effects/input.mjs',
    import.meta.url), 'utf8');
  for (const [label, source, observe, presentResult, absentResult] of [
    [
      'exact below/at leaf',
      exact,
      '[belowLeaf, atLeaf, g, u === globalThis.window, c, e]',
      ['9007199254740991.00', '9007199254740991.00', 2, true, 1, 2],
      [undefined, undefined, 0, true, 1, 2],
    ],
    [
      'ordered object/leaf keys',
      `const events = [];
      export const result = ((events.push('outer'), globalThis.window))?.[(events.push('object-key'), 'Number')]
        [(events.push('leaf-key'), 'MAX_SAFE_INTEGER')].toFixed(2);`,
      '[result, events]',
      ['9007199254740991.00', ['outer', 'object-key', 'leaf-key']],
      [undefined, ['outer']],
    ],
  ]) {
    // eslint-disable-next-line node/no-sync -- native and emitted values use the unchanged first source
    const { ast, code } = transformSync(source, {
      ast: true,
      configFile: false,
      babelrc: false,
      filename: 'receiver-object-key.mjs',
      plugins: [[babelPlugin, { method: 'usage-pure', version: '4.0', targets: { ie: 11 } }]],
    });
    const imports = ast.program.body.filter(node => node.type === 'ImportDeclaration');
    const values = await Promise.all(imports.map(async node => (await import(node.source.value)).default));
    const scalar = imports.find(node => node.source.value.endsWith('/actual/number/max-safe-integer'))?.specifiers[0].local.name;
    let copies = 0;
    t.traverseFast(ast, node => {
      if (node.type !== 'AssignmentExpression') return;
      let value = node.right;
      while (value.type === 'SequenceExpression') value = value.expressions.at(-1);
      if (value.type === 'Identifier' && value.name === scalar) copies++;
    });
    check(`receiver object key/${ label }: owned scalar snapshots`, copies, 0);
    const emitted = code.replaceAll(/^import .*;$/gm, '').replaceAll(/\bexport const\b/g, 'const');
    const native = source.replaceAll(/\bexport const\b/g, 'const');
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'window');
    const selfDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'self');
    try {
      Object.defineProperty(globalThis, 'self', { configurable: true, value: globalThis });
      for (const present of [false, true]) {
        Object.defineProperty(globalThis, 'window', { configurable: true, value: present ? globalThis : undefined });
        const expected = present ? presentResult : absentResult;
        checkDeep(`receiver object key/${ label }/${ present }: native`, Function(`${ native } return ${ observe };`)(), expected);
        checkDeep(`receiver object key/${ label }/${ present }: emitted`, Function(...imports.map(node => node.specifiers[0].local.name),
          `${ emitted } return ${ observe };`)(...values), expected);
      }
    } finally {
      if (descriptor) Object.defineProperty(globalThis, 'window', descriptor); else delete globalThis.window;
      if (selfDescriptor) Object.defineProperty(globalThis, 'self', selfDescriptor); else delete globalThis.self;
    }
  }
}

// The source optional object is checked before peeling a typed wrapper or building a quiet view.
for (const [typed, call] of [[false, "events.push('hop')"], [true, "events.push('hop')"], [false, 'hop()'], [true, 'hop()']]) {
  const source = `try { (globalThis.window?.[(${ call }, 'Number')]${ typed ? ' as any' : '' }).MAX_SAFE_INTEGER.toFixed(2); }
    catch (error) { events.push(error.name); } export const result = events;`;
  // eslint-disable-next-line node/no-sync -- a sealed null object must throw before its computed key
  const { ast, code } = transformSync(source, {
    ast: true,
    configFile: false,
    babelrc: false,
    filename: 'receiver-object-seal.ts',
    parserOpts: { plugins: ['typescript'] },
    plugins: [[babelPlugin, { method: 'usage-pure', version: '4.0', targets: { ie: 11 } }]],
  });
  const imports = ast.program.body.filter(node => node.type === 'ImportDeclaration');
  const values = await Promise.all(imports.map(async node => (await import(node.source.value)).default));
  const emitted = code.replaceAll(/^import .*;$/gm, '').replaceAll(/\bexport const\b/g, 'const').replaceAll(' as any', '');
  const native = source.replaceAll(/\bexport const\b/g, 'const').replaceAll(' as any', '');
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'window');
  try {
    for (const present of [false, true]) {
      const expected = present ? ['probe', 'hop'] : ['probe', 'TypeError'];
      for (const [leg, body] of [['native', native], ['emitted', emitted]]) {
        const events = [];
        Object.defineProperty(globalThis, 'window', {
          configurable: true,
          get() {
            events.push('probe');
            return present ? globalThis : null;
          },
        });
        function hop() { events.push('hop'); }
        const result = leg === 'native' ? Function('events', 'hop', `${ body } return result;`)(events, hop)
          : Function('events', 'hop', ...imports.map(node => node.specifiers[0].local.name), `${ body } return result;`)(events, hop, ...values);
        checkDeep(`receiver object seal/${ call }/typed ${ typed }/${ present }/${ leg }: source order`, result, expected);
      }
    }
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'window', descriptor); else delete globalThis.window;
  }
}

// The sealed static read remains outside the guard; its constructor key precedes that read.
{
  const exact = await fs.readFile(new URL('../transpiler-fixtures/usage-pure/sealed-static-receiver-key-prefix/input.mjs',
    import.meta.url), 'utf8');
  for (const [label, source] of [
    ['exact', exact],
    ['typed seal', exact.replace(').MAX_SAFE_INTEGER', ' as any).MAX_SAFE_INTEGER')],
    ['nested key', exact.replace("keyReads++, 'Number'", "keyReads++, (keyReads++, 'Number')")],
    ['unbound key prefix', exact.replace("keyReads++, 'Number'", "notDeclared, keyReads++, 'Number'")],
    ['TDZ key prefix', `${ exact.replace("keyReads++, 'Number'", "lateKey, keyReads++, 'Number'") }\nconst lateKey = 0;`],
  ]) {
    // eslint-disable-next-line node/no-sync -- the unchanged source and folded key need an exact native order oracle
    const { ast, code } = transformSync(source, {
      ast: true,
      configFile: false,
      babelrc: false,
      filename: 'sealed-static-key-order.ts',
      parserOpts: { plugins: ['typescript'] },
      plugins: [[babelPlugin, { method: 'usage-pure', version: '4.0', targets: { ie: 11 } }]],
    });
    const imports = ast.program.body.filter(node => node.type === 'ImportDeclaration');
    const bindings = imports.map(node => {
      const { name } = node.specifiers[0].local;
      if (node.source.value.endsWith('/global-this')) return `const ${ name } = globalThis;`;
      if (node.source.value.endsWith('/number/max-safe-integer')) return `const ${ name } = 9007199254740991;`;
      if (node.source.value.endsWith('/number/instance/to-fixed')) {
        return `const ${ name } = value => { events.push('dispatch:' + keyReads); return nativeToFixed; };`;
      }
      throw new Error(`Unexpected sealed static key import: ${ node.source.value }`);
    }).join('\n');
    for (const present of [false, true]) {
      const results = [];
      for (const body of [source, code]) {
        const program = body.replaceAll(/^import .*;$/gm, '').replaceAll('export const value', 'value')
          .replaceAll('export { keyReads };', '').replaceAll(' as any', '');
        const observed = runInNewContext(`
          const events = [];
          const nativeToFixed = (0).toFixed;
          const fakeNumber = { get MAX_SAFE_INTEGER() { events.push('MAX:' + keyReads); return 9007199254740991; } };
          Object.defineProperty(globalThis, 'Number', {
            get() { events.push('Number:' + keyReads); return fakeNumber; }
          });
          Object.defineProperty(globalThis, 'window', {
            get() { events.push('probe'); return ${ present } ? globalThis : null; }
          });
          ${ body === source ? '' : bindings }
          let value, error;
          ${ program.replace('value =', 'try { value =').replace(/;\s*$/, '; } catch (caught) { error = caught.name; }') }
          ({ value, error, keyReads, events: events.filter(event => !event.startsWith('dispatch:')) });
        `);
        results.push(structuredClone(Object.fromEntries(Object.entries(observed).filter(([, value]) => value !== undefined))));
      }
      const count = label === 'nested key' ? 2 : 1;
      const throwsBeforeKey = label === 'unbound key prefix' || label === 'TDZ key prefix';
      checkDeep(`sealed static key order/${ label }/${ present }: native reached key and read`, results[0], present && throwsBeforeKey
        ? { error: 'ReferenceError', keyReads: 0, events: ['probe'] } : present
        ? { value: '9007199254740991.00', keyReads: count, events: ['probe', `Number:${ count }`, `MAX:${ count }`] }
        : { error: 'TypeError', keyReads: 0, events: ['probe'] });
      checkDeep(`sealed static key order/${ label }/${ present }: emitted matches native`, results[1], results[0]);
    }
  }
}

// These native runtime checks use fresh VM arrays and the actual pure helpers.
for (const [fixture, needle, method, binding] of [
  ['positional-read-inline-spread', 'toSpliced: viaIndexKey', 'toSpliced', 'viaIndexKey'],
  ['session-probes-other-3', 'const { [k]: { at: m } } = { ...spread', 'at', 'm'],
]) {
  const input = await fs.readFile(new URL(`../transpiler-fixtures/usage-pure/${ fixture }/input.mjs`, import.meta.url), 'utf8');
  const source = input.split('\n').find(line => line.includes(needle));
  // eslint-disable-next-line node/no-sync -- compare the exact claimed source slot with native getter order
  const { ast, code } = transformSync(source, {
    ast: true,
    configFile: false,
    babelrc: false,
    filename: 'destructure-instance-residual.mjs',
    plugins: [[babelPlugin, { method: 'usage-pure', version: '4.0', targets: { ie: 11 } }]],
  });
  const imports = ast.program.body.filter(node => node.type === 'ImportDeclaration');
  const values = await Promise.all(imports.map(async node => (await import(node.source.value)).default));
  const emitted = code.replaceAll(/^import .*;$/gm, '');
  const importsByName = Object.fromEntries(imports.map((node, idx) => [node.specifiers[0].local.name, values[idx]]));
  const prelude = `const events = []; let reads = 0; const use = () => {};
    const spread = { get keep() { events.push('spread'); return 1; } };
    Object.defineProperty(Array.prototype, ${ JSON.stringify(method) }, { configurable: true, get() {
      const selected = ++reads; events.push('method'); return function () { return selected; };
    } });`;
  const observe = `JSON.stringify([${ binding }(), reads, events]);`;
  checkDeep(`destructure spent instance/${ fixture }: native selected value and getter order`,
    JSON.parse(runInNewContext(prelude + emitted + observe, importsByName)),
    JSON.parse(runInNewContext(prelude + source + observe)));
}

// A closed supplied receiver has no mutable default flag; its emitted source remains parseable.
{
  const source = await fs.readFile(new URL('../transpiler-fixtures/usage-pure/closed-caller-parameter-retained-read-order/input.mjs',
    import.meta.url), 'utf8');
  // eslint-disable-next-line node/no-sync -- the exact supplied host must compile without an empty declaration
  const { ast, code } = transformSync(source, {
    ast: true,
    configFile: false,
    babelrc: false,
    filename: 'destructure-supplied-receiver.mjs',
    plugins: [[babelPlugin, { method: 'usage-pure', version: '4.0', targets: { ie: 11 } }]],
  });
  checkTruthy('retained supplied receiver: emitted source parses', parseCode(code));
  const imports = ast.program.body.filter(node => node.type === 'ImportDeclaration');
  const values = await Promise.all(imports.map(async node => (await import(node.source.value)).default));
  const importsByName = Object.fromEntries(imports.map((node, idx) => [node.specifiers[0].local.name, values[idx]]));
  const emitted = code.replaceAll(/^import .*;$/gm, '');
  const prelude = 'let result; const use = (values, events) => { result = [values, events]; };';
  const observe = 'JSON.stringify(result);';
  checkDeep('retained supplied receiver: native key and binding order',
    JSON.parse(runInNewContext(prelude + emitted + observe, importsByName)),
    JSON.parse(runInNewContext(prelude + source + observe)));
}

// The guard owns its root and test keys; discarded leaf keys execute only after that guard.
for (const [label, receiver, nullTrace, presentTrace, independentClaim = false, declarations = ''] of [
  ['root prefix', '(objectPrefix(), globalThis).window?.[(hop(), "Number")]', ['object', 'probe'], ['object', 'probe', 'hop']],
  [
    'folded leaf groups',
    '(objectPrefix(), globalThis).window?.[(hop(), keyEffect(), "self")][(ctorFirst(), ctorLast(), "Number")]',
    ['object', 'probe'],
    ['object', 'probe', 'hop', 'key', 'ctor-first', 'ctor-last'],
  ],
  [
    'test-owned keys',
    '(objectPrefix(), globalThis)[(testFirst(), testLast(), "window")]?.[(hop(), keyEffect(), "Number")]',
    ['object', 'test-first', 'test-last', 'probe'],
    ['object', 'test-first', 'test-last', 'probe', 'hop', 'key'],
  ],
  ['independent leaf claim', 'globalThis.window?.[(value = Math.cbrt(8), keyEffect(), "Number")]', ['probe'], ['probe', 'key'], true],
  ['guard-owned root call', 'getRealm().window?.Number', ['object', 'probe'], ['object', 'probe'], false, 'function getRealm() { objectPrefix(); return globalThis; }'],
]) {
  const source = `${ declarations }let threw = false, value = null; try { (${ receiver }).MAX_SAFE_INTEGER.toFixed(2); }
    catch (error) { threw = error instanceof TypeError; } module.exports = threw + ':' + value;`;
  // eslint-disable-next-line node/no-sync -- compare the exact guard/effect owners with the native source
  const { ast, code } = transformSync(source, {
    ast: true,
    configFile: false,
    babelrc: false,
    filename: 'receiver-leaf-guard.mjs',
    plugins: [[babelPlugin, { method: 'usage-pure', version: '4.0', targets: { ie: 11 } }]],
  });
  const imports = ast.program.body.filter(node => node.type === 'ImportDeclaration');
  const values = await Promise.all(imports.map(async node => (await import(node.source.value)).default));
  if (independentClaim) checkTruthy(`receiver leaf guard/${ label }: independent claim retained`,
    code.includes('/actual/math/cbrt'));
  const emitted = code.replaceAll(/^import .*;$/gm, '');
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const selfDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'self');
  try {
    Object.defineProperty(globalThis, 'self', { configurable: true, value: globalThis });
    for (const present of [false, true]) {
      for (const [leg, body] of [['native', source], ['emitted', emitted]]) {
        const trace = [];
        const module = { exports: null };
        Object.defineProperty(globalThis, 'window', {
          configurable: true,
          get() {
            trace.push('probe');
            return present ? globalThis : null;
          },
        });
        const callbacks = ['objectPrefix', 'hop', 'keyEffect', 'ctorFirst', 'ctorLast', 'testFirst', 'testLast'];
        const labels = ['object', 'hop', 'key', 'ctor-first', 'ctor-last', 'test-first', 'test-last'];
        const functions = labels.map(name => () => trace.push(name));
        Function('module', ...callbacks, ...imports.map(node => node.specifiers[0].local.name), body)(module, ...functions, ...values);
        check(`receiver leaf guard/${ label }/${ present }/${ leg }: value`, module.exports,
          `${ !present }:${ present && independentClaim ? 2 : null }`);
        checkDeep(`receiver leaf guard/${ label }/${ present }/${ leg }: effect owners`, trace, present ? presentTrace : nullTrace);
      }
    }
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'window', descriptor); else delete globalThis.window;
    if (selfDescriptor) Object.defineProperty(globalThis, 'self', selfDescriptor); else delete globalThis.self;
  }
}

for (const [label, source, expected] of [
  [
    'TDZ object hop',
    `const events = [];
    try { realm[(events.push('key'), 'Number')].MAX_SAFE_INTEGER.toFixed(2); } catch (error) { events.push(error.name); }
    const realm = globalThis; export const result = events;`,
    ['ReferenceError'],
  ],
  [
    'getter object hop',
    `const events = [];
    const box = { get Number() { events.push('getter'); return { MAX_SAFE_INTEGER: { toFixed() { events.push('call'); return 1; } } }; } };
    box[(events.push('key'), 'Number')].MAX_SAFE_INTEGER.toFixed(2); export const result = events;`,
    ['key', 'getter', 'call'],
  ],
]) {
  // eslint-disable-next-line node/no-sync -- declined source proofs must keep the complete first read
  const { ast, code } = transformSync(source, {
    ast: true,
    configFile: false,
    babelrc: false,
    filename: 'receiver-object-negative.mjs',
    plugins: [[babelPlugin, { method: 'usage-pure', version: '4.0', targets: { ie: 11 } }]],
  });
  const imports = ast.program.body.filter(node => node.type === 'ImportDeclaration');
  const values = await Promise.all(imports.map(async node => (await import(node.source.value)).default));
  const emitted = code.replaceAll(/^import .*;$/gm, '').replaceAll(/\bexport const\b/g, 'const');
  const native = source.replaceAll(/\bexport const\b/g, 'const');
  checkDeep(`receiver object negative/${ label }: native order`, Function(`${ native } return result;`)(), expected);
  checkDeep(`receiver object negative/${ label }: emitted order`, Function(...imports.map(node => node.specifiers[0].local.name),
    `${ emitted } return result;`)(...values), expected);
}

// Quiet source prefix reads still precede a computed key, including abrupt completion.
for (const [label, declarations, expression, expected] of [
  ['unbound prefix', '', '(a, "b")[(events.push("key"), "at")]', ['ReferenceError']],
  ['unbound mixed prefix', '', '(a, events.push("before"), "b")[(events.push("key"), "at")]', ['ReferenceError']],
  ['throwing getter prefix', 'const box = { get value() { events.push("getter"); throw new Error(); } };', '(box.value, "b")[(events.push("key"), "at")]', ['getter', 'Error']],
  ['initialized quiet prefix', 'const a = 0;', '(a, "b")[(events.push("key"), "at")]', ['key']],
]) {
  const source = `const events = []; ${ declarations } try { ${ expression }; } catch (error) { events.push(error.name); } export const result = events;`;
  // eslint-disable-next-line node/no-sync -- the transformed AST and runtime share one source snapshot
  const { ast, code } = transformSync(source, {
    ast: true,
    configFile: false,
    babelrc: false,
    filename: 'receiver-first-read.mjs',
    plugins: [[babelPlugin, { method: 'usage-pure', version: '4.0', targets: { ie: 11 } }]],
  });
  const imports = ast.program.body.filter(node => node.type === 'ImportDeclaration');
  const values = await Promise.all(imports.map(async node => (await import(node.source.value)).default));
  const emitted = code.replaceAll(/^import .*;$/gm, '').replaceAll(/\bexport const result\b/g, 'const result');
  const native = source.replaceAll(/\bexport const result\b/g, 'const result');
  checkDeep(`receiver first read/${ label }: native order`, Function(`${ native } return result;`)(), expected);
  checkDeep(`receiver first read/${ label }: emitted order`, Function(...imports.map(node => node.specifiers[0].local.name),
    `${ emitted } return result;`)(...values), expected);
  let captures = 0;
  t.traverseFast(ast, node => { if (node.type === 'VariableDeclarator' && !node.init) captures++; });
  check(`receiver first read/${ label }: stable primitive needs no snapshot`, captures, 0);
}

// A sealed argument call consumes the memo producer's full first value, including an inline root call.
for (const [label, declaration, key, expectedLog] of [
  ['alias', 'const S = Symbol.iterator;', 'S', ['inline']],
  ['destructure', 'const { iterator: S } = Symbol;', 'S', ['inline']],
  ['alias effect', 'const S = Symbol.iterator;', '(log.push("key"), S)', ['inline', 'key']],
]) {
  const source = `
    const log = []; const arr = ['held']; const box = { get list() { log.push('receiver'); return arr; } };
    ${ declaration }
    function getArr() { log.push('named'); return arr; }
    function getRealm() { log.push('named'); return globalThis; }
    const realm = Function('return this')();
    const descriptor = Object.getOwnPropertyDescriptor(realm, 'self');
    const iterDescriptor = Object.getOwnPropertyDescriptor(realm, Symbol.iterator);
    Object.defineProperty(realm, 'self', { configurable: true, value: realm });
    Object.defineProperty(realm, Symbol.iterator, { configurable: true,
      value: function () { return { next() { return { value: 'realm' }; } }; } });
    let result;
    try { result = ((() => { log.push('inline'); return globalThis; })().self?.[${ key }])(0).next().value; }
    catch (error) { result = error.name; }
    finally {
      if (descriptor) Object.defineProperty(realm, 'self', descriptor); else delete realm.self;
      if (iterDescriptor) Object.defineProperty(realm, Symbol.iterator, iterDescriptor); else delete realm[Symbol.iterator];
    }
    export const r = [result, log];`;
  // eslint-disable-next-line node/no-sync -- keep the exact source and emitted AST in one comparison
  const { ast, code } = transformSync(source, {
    ast: true,
    configFile: false,
    babelrc: false,
    filename: 'sealed-inline-receiver.mjs',
    plugins: [[babelPlugin, { method: 'usage-pure', version: '4.0', targets: { ie: 11 } }]],
  });
  const imports = ast.program.body.filter(node => node.type === 'ImportDeclaration');
  const values = await Promise.all(imports.map(async node => (await import(node.source.value)).default));
  const emitted = code.replaceAll(/^import .*;$/gm, '').replaceAll(/\bexport const r\b/g, 'const r');
  const native = source.replaceAll(/\bexport const r\b/g, 'const r');
  checkDeep(`sealed inline receiver/${ label }: native result and prefix`, Function(`${ native } return r;`)(), ['realm', expectedLog]);
  checkDeep(`sealed inline receiver/${ label }: emitted result and prefix`,
    Function(...imports.map(node => node.specifiers[0].local.name), `${ emitted } return r;`)(...values), ['realm', expectedLog]);
  const receiver = imports.find(node => node.source.value.endsWith('/actual/self'))?.specifiers[0].local.name;
  const method = imports.find(node => node.source.value.endsWith('/actual/get-iterator-method'))?.specifiers[0].local.name;
  checkTruthy(`sealed inline receiver/${ label }: original receiver and argument retained`, receiver && method
    && someNode(ast, node => node.type === 'CallExpression' && node.callee.type === 'MemberExpression'
      && node.callee.property.name === 'call' && containsCallee(node.callee.object, method)
      && node.arguments[0]?.name === receiver && node.arguments[1]?.value === 0));
  let copies = 0;
  t.traverseFast(ast, node => {
    if (node.type !== 'AssignmentExpression') return;
    let value = node.right;
    while (value.type === 'SequenceExpression') value = value.expressions.at(-1);
    if (value.type === 'Identifier' && value.name === receiver) copies++;
  });
  check(`sealed inline receiver/${ label }: stable receiver snapshots`, copies, 0);
}

for (const [label, source, receiver, captures = 1] of [
  [
    'getter rebinds local',
    'let rows = ["held"]; Object.defineProperty(rows, "at", { get() { rows = ["swapped"]; return function (i) { return this[i]; }; } }); rows.at(0);',
    'rows',
  ],
  ['computed key rebinds local', 'let rows = ["held"]; rows[(rows = ["swapped"], "at")](0);', 'rows'],
  ['foreign live import', 'import { rows } from "./live.mjs"; rows.at(0);', 'rows'],
  ['unbound receiver', 'foreignRows.at(0);', 'foreignRows', 0],
  ['completed write before key', 'let rows = [1]; rows = [2]; rows[(key(), "at")](0);', 'rows', 0],
  [
    'nested assignment of a constant receiver',
    'let from, rest; const source = { w: Array, extra: 1 }; const held = ({ w: { from }, ...rest } = ({ w: { from }, ...rest } = source)); use(held);',
    'source',
    0,
  ],
  ['closed constructor alias', 'let P = Promise; function write() { P = other; } P.noSuchStatic?.().includes(0);', 'P', 0],
  ['escaped constructor writer', 'let P = Promise; function write() { P = other; } unknown(write); P.noSuchStatic?.().includes(0);', 'P'],
]) {
  // eslint-disable-next-line node/no-sync -- synchronous AST comparisons keep the unit suite's evaluation order
  const { ast } = transformSync(source, {
    ast: true,
    configFile: false,
    babelrc: false,
    filename: 'receiver-handoff-negative.mjs',
    plugins: [[babelPlugin, { method: 'usage-pure', version: '4.0', targets: { ie: 11 } }]],
  });
  let capturedReceiver = 0;
  t.traverseFast(ast, node => {
    if (node.type !== 'AssignmentExpression' || node.left.type !== 'Identifier' || !/^_ref\d*$/.test(node.left.name)) return;
    let value = node.right;
    while (value.type === 'SequenceExpression') value = value.expressions.at(-1);
    if (value.type === 'Identifier' && value.name === receiver) capturedReceiver++;
  });
  check(`rendered receiver handoff/${ label }: source receiver captures`, capturedReceiver, captures);
}

for (const [label, source, copies] of [
  ['module store', 'let saved; (saved = globalThis.window)?.self.Array.prototype.at.call([1], 0);', 0],
  ['local store', 'function read() { let saved; return (saved = globalThis.window)?.self.Array.prototype.at.call([1], 0); } read();', 0],
  ['outer store', 'let saved; function read() { return (saved = globalThis.window)?.self.Array.prototype.at.call([1], 0); } read();', 1],
  ['live export', 'export let saved; (saved = globalThis.window)?.self.Array.prototype.at.call([1], 0);', 1],
  ['computed writer', 'let saved; (saved = globalThis.window)?.self[(saved = other, "Array")].prototype.at.call([1], 0);', 1],
  ['deferred writer', 'let saved; function write() { saved = other; } unknown(write); (saved = globalThis.window)?.self.Array.prototype.at.call([1], 0);', 1],
]) {
  // eslint-disable-next-line node/no-sync -- synchronous AST inspection of the emitted receiver store
  const { ast } = transformSync(source, {
    ast: true,
    configFile: false,
    babelrc: false,
    filename: 'stored-receiver.mjs',
    plugins: [[babelPlugin, { method: 'usage-pure', targets: { ie: 11 } }]],
  });
  let captures = 0;
  t.traverseFast(ast, node => {
    if (node.type === 'AssignmentExpression' && /^_ref\d*$/.test(node.left.name)
      && node.right.type === 'AssignmentExpression' && node.right.left.name === 'saved') captures++;
  });
  check(`source receiver store/${ label }: additional copies`, captures, copies);
}

finish();
