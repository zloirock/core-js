// typed AST node predicate - excludes scalars, SourceLocation objects, and foreign markers
// (Babel `extra`, parent back-refs, per-visitor caches stamped by sibling tools).
// prefer over hardcoded SKIP-keys - new plugins can stamp arbitrary keys, a skip list rots
export const isASTNode = v => v !== null && typeof v === 'object' && typeof v.type === 'string';

// `\`foo\`` - TemplateLiteral with no interpolations, used as a static string key. returns
// the cooked text; null when interpolations present, node isn't a template literal, or
// the cooked form is unavailable (post-ES2018 invalid-escape tagged template - `cooked` is
// null). callers check `=== null` to bail, so normalise `undefined` to `null` explicitly
export function singleQuasiString(node) {
  if (node?.type !== 'TemplateLiteral') return null;
  if ((node.expressions?.length ?? 0) !== 0 || (node.quasis?.length ?? 0) !== 1) return null;
  return node.quasis[0].value.cooked ?? null;
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

// transparent wrappers that may appear ABOVE a `(arrow)(...)` call site without changing
// the call's invocation semantics for IIFE detection: `!fn(...)`, `(0, fn)(...)`, `(fn)(...)`,
// optional-chain wrap (oxc), TS expression wrappers
const IIFE_CALL_PATH_WRAPPERS = new Set([
  'UnaryExpression',
  'SequenceExpression',
  'ParenthesizedExpression',
  'ChainExpression',
]);

// transparent wrappers between a CallExpression's `.callee` and the actual invoked node.
// narrower than IIFE_CALL_PATH_WRAPPERS - Unary/Sequence aren't valid here (they'd change
// what's invoked)
const IIFE_CALLEE_WRAPPERS = new Set([
  'ParenthesizedExpression',
  'ChainExpression',
]);

const FN_NODE_TYPES = new Set([
  'FunctionExpression',
  'ArrowFunctionExpression',
]);

// resolve the argument at `index` in a call's `arguments` list, expanding any `...[lit]`
// spread of an inline array literal. returns null if a non-literal spread precedes `index`,
// since we can't statically know the expanded length
export function resolveCallArgument(args, index) {
  let i = 0;
  for (const arg of args) {
    if (arg?.type === 'SpreadElement') {
      if (arg.argument?.type !== 'ArrayExpression') return null;
      for (const el of arg.argument.elements) {
        if (i === index) return el;
        i++;
      }
      continue;
    }
    if (i === index) return arg;
    i++;
  }
  return null;
}

// for `(({p} = D) => body)(R)` or plain `(({p}) => body)(R)`, locate the IIFE call site
// invoking THIS function. adapter-agnostic: works on babel paths and estree-toolkit paths
// since both expose `.node` and `.parentPath`. callee-identity check rejects `dec(arrow)`
// where arrow is decorator arg (NOT an IIFE - `dec`'s args don't bind to the arrow's params).
// returns `{ callPath, paramIndex }` so callers can decide whether to iterate args as paths
// (synth-swap path-emission) or as nodes (resolution-layer node-inspection)
export function findIifeCallSite(fnParentPath, paramNode) {
  const fnNode = fnParentPath?.node;
  if (!fnNode || !FN_NODE_TYPES.has(fnNode.type)) return null;
  const paramIndex = fnNode.params?.indexOf(paramNode);
  if (paramIndex === undefined || paramIndex < 0) return null;
  let callPath = fnParentPath.parentPath;
  while (callPath?.node && (IIFE_CALL_PATH_WRAPPERS.has(callPath.node.type)
    || TS_EXPR_WRAPPERS.has(callPath.node.type))) {
    callPath = callPath.parentPath;
  }
  const callNode = callPath?.node;
  // OptionalCallExpression: babel emits a distinct node for `(...)?.(args)`; unplugin (oxc)
  // wraps a CallExpression with `optional: true` in ChainExpression which the wrapper-peel
  // above handles. accept both shapes so IIFE detection fires symmetrically across parsers
  if (callNode?.type !== 'CallExpression' && callNode?.type !== 'NewExpression'
    && callNode?.type !== 'OptionalCallExpression') return null;
  let { callee } = callNode;
  while (callee && callee !== fnNode
    && (IIFE_CALLEE_WRAPPERS.has(callee.type) || TS_EXPR_WRAPPERS.has(callee.type))) {
    callee = callee.expression;
  }
  if (callee !== fnNode) return null;
  return { callPath, paramIndex };
}

// node-form helper for resolution-layer use: returns the IIFE caller-arg node bound to
// `paramNode`, or null when the call isn't an IIFE invoking THIS function. handles `...[lit]`
// inline-array spread via `resolveCallArgument`. for synth-swap (path-form) callers, use
// `findIifeCallSite` directly and walk the args paths
export function findIifeArgForParam(fnParentPath, paramNode) {
  const site = findIifeCallSite(fnParentPath, paramNode);
  return site ? resolveCallArgument(site.callPath.node.arguments ?? [], site.paramIndex) : null;
}

// is the IIFE caller-arg statically classifiable to a known builtin receiver? bare
// Identifiers can be matched against compat data (`Set`, `Array`, ...); non-Identifier
// shapes (`(...)(globalThis.X)`, `(...)(call())`, `(...)((x, y))`) carry no static type.
// resolution (entry lookup) and synth-swap (target picking) MUST agree on this narrowing -
// mismatched receivers would emit a polyfill the runtime never reaches
export function isClassifiableReceiverArg(node) {
  return node?.type === 'Identifier';
}

// `import type X = require(...)` is type-only - elided by tsc before runtime, references
// resolve to the global. babel scope tracker registers the binding regardless of modifier;
// callers use this predicate to filter out type-only bindings from shadow checks
export function isTypeOnlyImportEquals(node) {
  return node?.type === 'TSImportEqualsDeclaration' && node.importKind === 'type';
}

// MemberExpression in a position where the prototype-method polyfill can be skipped because
// the receiver method is never read at runtime: pure assignment (`obj.at = v`), destructure-LHS
// (`({a: obj.at} = src)`), destructure-LHS-with-default (`({a: obj.at = 1} = src)`).
// compound `+=` / `||=` / `??=` and `obj.at++` still read LHS - excluded here. ESTree uses
// 'Property' for object-pattern slots; babel uses 'ObjectProperty' - both accepted
export function isMemberWriteOnlyContext(member, parent, grandparent) {
  if (!member || !parent) return false;
  if (parent.type === 'AssignmentExpression' && parent.left === member && parent.operator === '=') return true;
  if (parent.type === 'AssignmentPattern' && parent.left === member) return true;
  if ((parent.type === 'ObjectProperty' || parent.type === 'Property')
    && parent.value === member && grandparent?.type === 'ObjectPattern') return true;
  return false;
}

// ambient declarations (`declare class X`, `declare function X`, `declare const X`,
// `declare module X`, `declare enum X`, TSDeclareFunction, TSDeclareMethod, type aliases,
// interfaces) - elided by tsc before runtime; references resolve to the global. estree-toolkit
// and babel scope trackers register the binding anyway; callers filter via this predicate
export function isAmbientTypeDeclaration(node) {
  if (!node) return false;
  if (node.type === 'TSDeclareFunction' || node.type === 'TSDeclareMethod') return true;
  if (node.type === 'TSInterfaceDeclaration' || node.type === 'TSTypeAliasDeclaration') return true;
  if (isTypeOnlyImportEquals(node)) return true;
  if (node.declare === true) return true;
  return false;
}

// declarations that introduce a runtime binding the plugin must respect as a shadow:
//  - value-mode `import X = require(...)` / `import X = NS.Y`
//  - `enum X {}` / `const enum X {}` (no `declare`) - regular emits IIFE; const enum
//    references inlined by tsc, plugin must NOT rewrite them to a polyfill
//  - `namespace X {}` (no `declare`) - emits IIFE
// excludes ambient forms (`declare enum/namespace`, `import type X = require()`) - those
// have no runtime emission, references resolve to the global, polyfill should fire
function isTSRuntimeBindingDeclaration(node) {
  if (!node?.id?.name) return false;
  if (node.type === 'TSImportEqualsDeclaration') return !isTypeOnlyImportEquals(node);
  if (node.type === 'TSEnumDeclaration' || node.type === 'TSModuleDeclaration') return !node.declare;
  return false;
}

// names of TS-specific runtime declarations at program top level. estree-toolkit's scope
// tracker doesn't recognise them at all; babel's scope tracks regular `enum X {}` and
// `namespace X {}` (free-vars) but not `const enum` or `import type X = require()`.
// callers (both adapters' `hasBinding`) consult this set as fallback for the cases their
// native scope misses. cached per Program node so repeated checks share one scan
const tsRuntimeBindingsCache = new WeakMap();

export function getTSRuntimeBindings(programNode) {
  if (!programNode?.body) return null;
  let cached = tsRuntimeBindingsCache.get(programNode);
  if (cached) return cached;
  cached = new Set();
  for (const stmt of programNode.body) {
    if (isTSRuntimeBindingDeclaration(stmt)) cached.add(stmt.id.name);
  }
  tsRuntimeBindingsCache.set(programNode, cached);
  return cached;
}

// TS type-only declarations - identifier `id` here is a type name, not a runtime reference.
// naive `isReferenced` treats it as a ref by default; polyfilling the id is pure over-injection
const TS_TYPE_DECL_TYPES = new Set([
  'TSTypeAliasDeclaration',
  'TSInterfaceDeclaration',
  'TSEnumDeclaration',
  'TSModuleDeclaration',
]);

// true for identifiers in type-only positions (TS declaration ids, `type`-modified
// import/export specifiers). low-level form takes raw nodes - prefer the path-accepting
// variant `isTSTypeOnlyIdentifierPath` at callsites that have a path to avoid duplicating
// the parent-grandparent walk. `grandparent` (optional) carries the declaration-level
// `importKind`/`exportKind` for `import type { X }` / `export type { X }` forms where the
// flag lives on the parent declaration rather than on the specifier itself
export function isTSTypeOnlyIdentifier(parent, parentKey, grandparent) {
  if (!parent) return false;
  if (parent.type === 'ExportSpecifier') {
    if (parent.exportKind === 'type') return true;
    return grandparent?.type === 'ExportNamedDeclaration' && grandparent.exportKind === 'type';
  }
  if (parent.type === 'ImportSpecifier') {
    if (parent.importKind === 'type') return true;
    return grandparent?.type === 'ImportDeclaration' && grandparent.importKind === 'type';
  }
  if (parentKey !== 'id') return false;
  if (TS_TYPE_DECL_TYPES.has(parent.type)) return true;
  // `import type X = require(...)` - LHS of TSImportEqualsDeclaration with type modifier.
  // value-mode (no `type`) is a real runtime binding, falls through to scope-shadow handling
  return parent.type === 'TSImportEqualsDeclaration' && parent.importKind === 'type';
}

// path-accepting wrapper: encapsulates the (parent, parentKey, grandparent) extraction so
// callers don't repeat `path?.parent, path?.key, path?.parentPath?.parent` 4-5 times across
// the codebase. accepts babel NodePath or estree-toolkit path - both expose the same triple
export function isTSTypeOnlyIdentifierPath(path) {
  return isTSTypeOnlyIdentifier(path?.parent, path?.key, path?.parentPath?.parent);
}

// shared `usagePureCallback` guard predicates. callers unwrap TS/parens/chains beforehand
export const isDeleteTarget = parent => parent?.type === 'UnaryExpression' && parent.operator === 'delete';
export const isUpdateTarget = parent => parent?.type === 'UpdateExpression';

// ObjectPattern property shapes that require a named receiver (`_ref`) to rewrite against:
// - RestElement: desugars to `_ref` copy minus polyfilled keys
// - computed key (`[Symbol.iterator]: x`): key expression may need polyfill substitution
// - default value (`{ key = fallback }`): `undefined` check on receiver-read picks the default
// babel uses `ObjectProperty`, oxc uses `Property` - treat both as equivalent here.
// used by CatchClause extraction gates in both plugins to decide whether a pattern-level
// rewrite is unavoidable (otherwise `{ bareKey }` destructures without any body reference
// can stay untouched)
export function objectPatternPropNeedsReceiverRewrite(prop) {
  if (!prop) return false;
  if (prop.type === 'RestElement' || prop.type === 'SpreadElement') return true;
  if (prop.computed) return true;
  return (prop.type === 'ObjectProperty' || prop.type === 'Property')
    && prop.value?.type === 'AssignmentPattern';
}

// transparent runtime wrappers that can surround an UpdateExpression operand:
// TS expression wrappers + parser-preserved parens (`createParenthesizedExpressions: true`).
// distinct from `TS_EXPR_WRAPPERS` alone because ParenthesizedExpression is also transparent
// here but not everywhere (e.g. callee resolution treats parens as chain-breakers)
const isUpdateOperandWrapper = node => !!node && (TS_EXPR_WRAPPERS.has(node.type) || node.type === 'ParenthesizedExpression');

// true when the path's enclosing context is an UpdateExpression, after peeling transparent
// wrappers upward. accepts the parent path (`path.parentPath` for babel / estree-toolkit).
// callers gate on plugin method: usage-pure must skip (rewrite to frozen binding invalid),
// usage-global must NOT skip (side-effect import needed for read side to avoid ReferenceError)
export function isInUpdateOperand(parentPath) {
  let check = parentPath;
  while (check && isUpdateOperandWrapper(check.node)) check = check.parentPath;
  return check?.node?.type === 'UpdateExpression';
}

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
// `handleParameterDestructure` and unplugin's `handleParameterDestructurePure`.
// returns the Identifier that receives the binding across all four prop-value shapes:
// `{ x }` / `{ x: alias }` / `{ x = default }` / `{ x: alias = default }`. null when the value
// is a nested pattern or any other non-Identifier shape. nested-destructure flatten and
// inline-default emission both read `.name` off the returned node, so keeping a single
// extraction helper avoids the AssignmentPattern.left peel being duplicated across call sites
export function propBindingIdentifier(value) {
  // oxc preserves ParenthesizedExpression wrappers even in pattern-position values. peel
  // so both parsers surface the same Identifier shape to callers
  while (value?.type === 'ParenthesizedExpression') value = value.expression;
  if (value?.type === 'Identifier') return value;
  if (value?.type === 'AssignmentPattern') {
    let { left } = value;
    while (left?.type === 'ParenthesizedExpression') left = left.expression;
    if (left?.type === 'Identifier') return left;
  }
  return null;
}

export const isIdentifierPropValue = value => propBindingIdentifier(value) !== null;

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

// unwrap a declarator-init expression to its semantic value. SequenceExpression returns
// its tail at runtime (`(se(), receiver)` evaluates to `receiver`), and oxc preserves
// ParenthesizedExpression around the commas. combining both lets receiver resolution reach
// the target identifier through any mix of parens and SE prefixes without each caller
// reinventing the peel loop
export function unwrapInitValue(node) {
  while (true) {
    if (node?.type === 'ParenthesizedExpression') node = node.expression;
    else if (node?.type === 'SequenceExpression') node = node.expressions.at(-1);
    else return node;
  }
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
      // `import require = X.Y` - TS-specific syntax that creates a runtime binding to
      // anything named `require`. namespace refs / proper modules both reach runtime,
      // so shadowing is real
      case 'TSImportEqualsDeclaration':
        if (node.id?.name === 'require') return true;
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
