// typed AST node predicate - excludes scalars, SourceLocation objects, and foreign markers
// (Babel `extra`, parent back-refs, per-visitor caches stamped by sibling tools).
// prefer over hardcoded SKIP-keys - new plugins can stamp arbitrary keys, a skip list rots
export const isASTNode = v => v !== null && typeof v === 'object' && typeof v.type === 'string';

// `\`foo\`` - TemplateLiteral with no interpolations, used as a static string key. returns
// the cooked text; null when interpolations present or node isn't a template literal
export function singleQuasiString(node) {
  if (node?.type !== 'TemplateLiteral') return null;
  if ((node.expressions?.length ?? 0) !== 0 || (node.quasis?.length ?? 0) !== 1) return null;
  return node.quasis[0].value.cooked;
}

// `async-iterator` -> `asyncIterator` (keeps leading char lowercase for Symbol names);
// `weak-map` / `promise` -> `WeakMap` / `Promise` via the Pascal variant
const DASH_WORD = /-(?<c>\w)/g;

export const kebabToCamel = str => str.replaceAll(DASH_WORD, (_, c) => c.toUpperCase());

export const kebabToPascal = str => typeof str === 'string' && str
  ? kebabToCamel(str[0].toUpperCase() + str.slice(1)) : null;

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

// TS type-only declarations - identifier `id` here is a type name, not a runtime reference.
// naive `isReferenced` treats it as a ref by default; polyfilling the id is pure over-injection
const TS_TYPE_DECL_TYPES = new Set([
  'TSTypeAliasDeclaration',
  'TSInterfaceDeclaration',
  'TSEnumDeclaration',
  'TSModuleDeclaration',
]);

// true for identifiers in type-only positions (TS declaration ids, `type`-modified
// import/export specifiers). covers all three call sites: babel handleIdentifier + post-sweep
// and shared `createUsageGlobalCallback`. parent / parentKey come from the visitor context
export function isTSTypeOnlyIdentifier(parent, parentKey) {
  if (!parent) return false;
  if (parent.type === 'ExportSpecifier' && parent.exportKind === 'type') return true;
  if (parent.type === 'ImportSpecifier' && parent.importKind === 'type') return true;
  if (parentKey === 'id' && TS_TYPE_DECL_TYPES.has(parent.type)) return true;
  return false;
}

// shared `usagePureCallback` guard predicates. callers unwrap TS/parens/chains beforehand
export const isDeleteTarget = parent => parent?.type === 'UnaryExpression' && parent.operator === 'delete';
export const isUpdateTarget = parent => parent?.type === 'UpdateExpression';

// function-like types that carry `params` - ObjectPattern used as a parameter lives
// either directly under one of these, or wrapped in an AssignmentPattern for the
// `function({ x } = default) {}` form
// ObjectMethod / ClassMethod are babel-only - oxc emits FunctionExpression under a
// `value` slot (shorthand-method) or represents methods as Property/MethodDefinition
// with FunctionExpression value. Keeping both lets the helper work across adapters
// without relying on the caller to unwrap `value`
const FUNCTION_LIKE_PARAM_OWNER_TYPES = new Set([
  'FunctionDeclaration',
  'FunctionExpression',
  'ArrowFunctionExpression',
  'ObjectMethod',
  'ClassMethod',
  'ClassPrivateMethod',
]);

// true when `parent`/`grandparent` describe an ObjectPattern at function-parameter
// position: either direct (`function({ x })`) or wrapped in AssignmentPattern default
// (`function({ x } = Y)`). accepts node refs (both adapters pass raw nodes, not paths)
export function isFunctionParamDestructureParent(parent, grandparent, objectPatternNode) {
  if (!parent) return false;
  if (FUNCTION_LIKE_PARAM_OWNER_TYPES.has(parent.type)) return true;
  return parent.type === 'AssignmentPattern'
    && parent.left === objectPatternNode
    && !!grandparent && FUNCTION_LIKE_PARAM_OWNER_TYPES.has(grandparent.type);
}

// ObjectPattern prop value is a synth-swap eligible binding: `{key}` / `{key: bound}` /
// `{key = D}` / `{key: bound = D}`. rejects nested patterns (`{key: {a}}`) and rest -
// those don't fit the synth-swap receiver substitution model. shared between babel-plugin's
// `handleParameterDestructure` and unplugin's `handleParameterDestructurePure`
export function isIdentifierPropValue(value) {
  if (value?.type === 'Identifier') return true;
  return value?.type === 'AssignmentPattern' && value.left?.type === 'Identifier';
}

// synth-swap rewrite emits `{ key: value, ... }` reconstructed from ObjectPattern properties.
// any property that can't be losslessly replayed as that literal must force a bail:
// - computed keys may carry side effects (`{[fn()]: x}`) that would fire at wrong times
// - RestElement / SpreadElement have no literal-prop equivalent
// - non-Identifier keys (numeric / string literal) aren't expressible without source slicing
// callers bail to inline-default when this check fails. shared between babel-plugin and unplugin
// accepts both Babel `ObjectProperty` and ESTree `Property` node types
export function isSynthSimpleObjectPattern(objectPattern) {
  for (const p of objectPattern.properties) {
    if (p.type !== 'ObjectProperty' && p.type !== 'Property') return false;
    if (p.computed || p.key?.type !== 'Identifier') return false;
  }
  return true;
}

// single-chain nested destructure shape: `const { X: { y } } = Z`.
// inner + outer patterns each hold exactly one property and the declaration carries a
// single declarator. only under this shape can we safely flatten to `const y = _polyfill`
// - any sibling would be silently lost by a full declarator replace
export function isSingleNestedProxyChain(innerPattern, outerPattern, declaration) {
  return innerPattern?.type === 'ObjectPattern' && (innerPattern.properties?.length ?? 0) === 1
    && outerPattern?.type === 'ObjectPattern' && (outerPattern.properties?.length ?? 0) === 1
    && declaration?.type === 'VariableDeclaration' && declaration.declarations?.length === 1;
}
// prototype-method polyfills bind `this` to their first arg, but a tagged-template call
// passes `(strings, ...values)` - the polyfilled fn would treat the `strings` array as
// the receiver and break. static methods tagged as template are just odd user code
// (`Array.of\`…\``) - the polyfill is a plain function and runs correctly regardless,
// so we only skip the prototype case
export const isTaggedTemplateTag = (parent, node, placement) => placement === 'prototype'
  && parent?.type === 'TaggedTemplateExpression'
  && parent.tag === node;

// structural match for MemberExpression chains rooted at Identifier / ThisExpression -
// recognises the same receiver path written at different source positions. literal property
// keys (computed-access shape: `obj['at']`, `obj[0]`) compare by value so `obj.at = x`
// and a later `obj['at']` read resolve to the same shadowed write target
function memberShapeEqual(a, b) {
  if (!a || !b || a.type !== b.type) return false;
  if (a.type === 'Identifier') return a.name === b.name;
  if (a.type === 'ThisExpression') return true;
  // babel StringLiteral/NumericLiteral vs ESTree Literal: both carry `.value`
  if (a.type === 'StringLiteral' || a.type === 'NumericLiteral' || a.type === 'Literal') {
    return a.value === b.value;
  }
  if (a.type === 'MemberExpression') {
    return a.computed === b.computed
      && memberShapeEqual(a.object, b.object)
      && memberShapeEqual(a.property, b.property);
  }
  return false;
}

// flatten a for-of/for-in LHS (bare member, or nested in object / array / rest / default
// patterns) into every MemberExpression that receives a write on each iteration
function collectForXWriteMembers(node, out) {
  if (!node) return;
  switch (node.type) {
    case 'MemberExpression':
      out.push(node);
      return;
    case 'ObjectPattern':
      for (const p of node.properties) collectForXWriteMembers(p, out);
      return;
    case 'ArrayPattern':
      for (const el of node.elements) collectForXWriteMembers(el, out);
      return;
    // ObjectPattern property wrapper - Babel calls it ObjectProperty, ESTree calls it Property
    case 'ObjectProperty':
    case 'Property':
      collectForXWriteMembers(node.value, out);
      return;
    case 'AssignmentPattern':
      collectForXWriteMembers(node.left, out);
      return;
    case 'RestElement':
      collectForXWriteMembers(node.argument, out);
  }
}

// key: for-x `parent.left` AST node; value: collected write-target MemberExpressions.
// a body with N identifier reads triggers `isForXWriteTarget` N times, each scanning
// up to the enclosing for-x - collecting the same set repeatedly. cache by node identity
// so the work amortizes over the body at the cost of one WeakMap lookup per read
const FOR_X_WRITES_CACHE = new WeakMap();

function getForXWrites(leftNode) {
  let writes = FOR_X_WRITES_CACHE.get(leftNode);
  if (!writes) {
    writes = [];
    collectForXWriteMembers(leftNode, writes);
    FOR_X_WRITES_CACHE.set(leftNode, writes);
  }
  return writes;
}

// `for (obj.key of/in ...)` rebinds obj.key each iteration, aliasing the prototype method.
// Both the write target (bare or nested in a destructuring pattern) and matching reads in
// the body target a local write, not the inherited method - polyfilling either is wrong
export function isForXWriteTarget(path) {
  const { node } = path;
  // ObjectProperty / Property wraps a write-target MemberExpression in `.value`;
  // meta emission for destructure properties hands us the wrapper, not the member
  if ((node?.type === 'ObjectProperty' || node?.type === 'Property')
    && node.value?.type === 'MemberExpression') return isForXWriteTarget(path.get('value'));
  if (node?.type !== 'MemberExpression') return false;
  for (let current = path.parentPath; current; current = current.parentPath) {
    const parent = current.node;
    if (!parent) break;
    if (parent.type !== 'ForOfStatement' && parent.type !== 'ForInStatement') continue;
    const writes = getForXWrites(parent.left);
    if (writes.some(m => m === node || memberShapeEqual(m, node))) return true;
  }
  return false;
}

// top-level module-format detection: ESM markers take precedence; recognised CJS shapes
// are `module.exports[.X...] = ...`, `exports.X[.Y...] = ...` (and wrappers via `unwrapExpr`)
export const ESM_MARKER_TYPES = new Set([
  'ExportAllDeclaration',
  'ExportDefaultDeclaration',
  'ExportNamedDeclaration',
  'ImportDeclaration',
]);

const isNamedIdent = (node, name) => node?.type === 'Identifier' && node.name === name;

// oxc-parser preserves `ParenthesizedExpression`; babel strips it by default. strip here
// so downstream matchers treat `(x)` and `x` identically without probing the parser
export function unwrapParens(node) {
  while (node?.type === 'ParenthesizedExpression') node = node.expression;
  return node;
}

// broader unwrap: strips parens, optional chains, AND TS expression wrappers
// (`as`, `satisfies`, `!`) so callers see the runtime-effective expression
export function unwrapRuntimeExpr(node) {
  while (node && (node.type === 'ParenthesizedExpression'
    || node.type === 'ChainExpression' || TS_EXPR_WRAPPERS.has(node.type))) {
    node = node.expression;
  }
  return node;
}

// generic type arguments at a use-site (`Array<string>`) - babel: `typeParameters`,
// oxc TS-ESTree: `typeArguments`. class `extends` uses `superTypeParameters` /
// `superTypeArguments` under the same split
export const getTypeArgs = node => node?.typeParameters ?? node?.typeArguments;
export const getSuperTypeArgs = node => node?.superTypeArguments ?? node?.superTypeParameters;

// `export const X = ...` / `export default function X() {}` bind `X` in the module scope
// exactly like their un-exported form; callers that inspect top-level declarations get the
// inner node, so the export wrapper is transparent to them
export function unwrapExportedDeclaration(stmt) {
  if (stmt?.type === 'ExportNamedDeclaration' || stmt?.type === 'ExportDefaultDeclaration') {
    return stmt.declaration ?? null;
  }
  return stmt;
}

// peel transparent wrappers so `0, module.exports = ...` / `(module.exports = ...)` still match
function unwrapExpr(node) {
  while (node) {
    if (node.type === 'ParenthesizedExpression' || node.type === 'ChainExpression') node = node.expression;
    else if (node.type === 'SequenceExpression') node = node.expressions.at(-1);
    else break;
  }
  return node;
}

// `module.exports` OR `module['exports']` / `module["exports"]`: computed form carrying a
// literal string `'exports'` is the same CJS shape at runtime, just less common in source
function isStringLiteralWithValue(node, value) {
  if (node?.type === 'StringLiteral' && node.value === value) return true;
  return node?.type === 'Literal' && node.value === value;
}
const matchesMemberName = (node, name) => (!node.computed && isNamedIdent(node.property, name))
  || (node.computed && isStringLiteralWithValue(node.property, name));
const isStaticMember = (node, objName, propName) => node?.type === 'MemberExpression'
  && isNamedIdent(unwrapExpr(node.object), objName) && matchesMemberName(node, propName);

// walks the MemberExpression chain - any ancestor rooted at `exports` or `module.exports` matches
function isCommonJSAssignTarget(left) {
  let node = unwrapExpr(left);
  while (node?.type === 'MemberExpression') {
    if (isStaticMember(node, 'module', 'exports')) return true;
    const obj = unwrapExpr(node.object);
    if (isNamedIdent(obj, 'exports')) return true;
    node = obj;
  }
  return false;
}

export const hasTopLevelESM = program => program.body.some(n => ESM_MARKER_TYPES.has(n.type));

// shadowed `require` makes its calls user-authored no-ops, not real core-js imports.
// per-body cache - same body walked by multiple passes (detect-usage + detect-entry)
const REQUIRE_SHADOW_CACHE = new WeakMap();
export function declaresRequireBinding(body) {
  if (!body || typeof body !== 'object') return false;
  if (REQUIRE_SHADOW_CACHE.has(body)) return REQUIRE_SHADOW_CACHE.get(body);
  const result = computeDeclaresRequire(body);
  REQUIRE_SHADOW_CACHE.set(body, result);
  return result;
}
function computeDeclaresRequire(body) {
  let found = false;
  const mark = id => {
    if (id.name === 'require') found = true;
  };
  for (const stmt of body ?? []) {
    const node = unwrapExportedDeclaration(stmt);
    if (!node) continue;
    switch (node.type) {
      case 'VariableDeclaration':
        for (const d of node.declarations) walkPatternIdentifiers(d.id, mark);
        break;
      case 'FunctionDeclaration':
      case 'ClassDeclaration':
        if (node.id?.name === 'require') return true;
        break;
      case 'ImportDeclaration':
        for (const s of node.specifiers) {
          if (s.local?.name === 'require') return true;
        }
        break;
    }
    if (found) return true;
  }
  return false;
}

export function detectCommonJS(program) {
  let hasCJS = false;
  for (const stmt of program.body) {
    // ESM wins: any ESM marker anywhere in the program rules out CJS classification,
    // so keep scanning even after hasCJS is set to surface a later import / export
    if (ESM_MARKER_TYPES.has(stmt.type)) return false;
    if (!hasCJS && stmt.type === 'ExpressionStatement') {
      const expression = unwrapExpr(stmt.expression);
      if (expression?.type === 'AssignmentExpression' && isCommonJSAssignTarget(expression.left)) hasCJS = true;
    }
  }
  return hasCJS;
}

// memoized ancestor walk with back-fill: O(depth) worst case, ~O(1) for siblings sharing
// the same annotation subtree. `.reset` rebuilds the cache for per-file memory determinism
export function createTypeAnnotationChecker(isTypeAnnotationNodeType) {
  let cache = new WeakMap();
  function isInTypeAnnotation(path) {
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
  }
  isInTypeAnnotation.reset = () => { cache = new WeakMap(); };
  return isInTypeAnnotation;
}

// conservative: true when the subtree may observe/cause side effects, false only when provably pure.
// per-node WeakMap cache - same subtree is queried by nested destructure / SE-extract paths
const SIDE_EFFECTS_CACHE = new WeakMap();
export function mayHaveSideEffects(node) {
  if (!node) return false;
  if (SIDE_EFFECTS_CACHE.has(node)) return SIDE_EFFECTS_CACHE.get(node);
  const result = computeSideEffects(node);
  SIDE_EFFECTS_CACHE.set(node, result);
  return result;
}
function computeSideEffects(node) {
  const { type } = node;
  if (ALWAYS_EFFECTFUL_TYPES.has(type)) return true;
  if (type === 'UnaryExpression') return node.operator === 'delete' || mayHaveSideEffects(node.argument);
  if (type === 'SequenceExpression' || type === 'TemplateLiteral') return node.expressions.some(mayHaveSideEffects);
  // `[...a]` invokes `a[Symbol.iterator]` / `{...a}` invokes `a`'s Proxy traps - neither
  // can be proven pure from source alone. treat SpreadElement as SE uniformly across
  // Array and Object literals. without this, `const { from } = [1, ...Array]` was
  // considered SE-free and ran through the no-SE-path by mistake
  if (type === 'ArrayExpression') {
    return node.elements.some(el => el?.type === 'SpreadElement' || mayHaveSideEffects(el));
  }
  if (type === 'ObjectExpression') {
    return node.properties.some(p => p?.type === 'SpreadElement' || mayHaveSideEffects(p));
  }
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
