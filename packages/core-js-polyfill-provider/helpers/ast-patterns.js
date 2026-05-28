import { MAX_DEPTH } from '../resolve-node-type/base.js';

// typed AST node predicate - excludes scalars, SourceLocation objects, and foreign markers
// (Babel `extra`, parent back-refs, per-visitor caches stamped by sibling tools).
// prefer over hardcoded SKIP-keys - new plugins can stamp arbitrary keys, a skip list rots
export const isASTNode = v => v !== null && typeof v === 'object' && typeof v.type === 'string';

// directive-prologue detection ('use strict' etc.). oxc surfaces directives as top-of-body
// ExpressionStatement nodes with `.directive: string`; babel separates module-level directives
// into `Program.directives[]` but inline function-body directives still appear as
// ExpressionStatement w/ `.directive`. empty-string `""` is parser-emitable but NOT a valid
// prologue token - reject so it doesn't count as directive
export const isDirectiveStatement = node => node?.type === 'ExpressionStatement'
  && typeof node.directive === 'string' && node.directive.length > 0;

// any ExpressionStatement whose expression peels to a StringLiteral - includes already-promoted
// directives AND raw string-literal expressions that would BECOME directives if their position
// in the body reached the prologue
const isStringLiteralExpressionStatement = node => node?.type === 'ExpressionStatement'
  && (node.expression?.type === 'StringLiteral'
    || (node.expression?.type === 'Literal' && typeof node.expression.value === 'string'));

// would removing `body[entryIndex]` silently extend an EXISTING directive prologue with the
// next surviving string-literal sibling? `"use strict"; require('core-js'); "use asm"; foo()`
// -> removal promotes `"use asm"` and activates asm.js. fires only when SOME prologue exists
// AND every surviving prior is a directive AND the next surviving sibling is a string-literal.
// no-prologue case (string-literal lands at body[0] as the source's new first statement) is
// an accepted transform consequence - the source had no directive context to disturb.
// `hasPriorDirective`: babel parses module-level directives into `program.directives[]`,
// lifted OUT of `program.body[]`. callers there pass `true` when `directives.length > 0` so
// the prologue check still sees the implicit prefix. oxc keeps directives in body, so
// callers there leave it at the default `false`.
// `pendingRemovals` (optional index Set) treats queued siblings as gone for prefix scan and
// next-sibling lookup. babel-plugin removes per-callback (live body reflects prior removals);
// unplugin defers commit until after the whole batch decides, feeding the simulated state in
export function wouldPromoteDirectiveAfterRemoval({ body, entryIndex, pendingRemovals, hasPriorDirective = false }) {
  let hasSurvivingDirective = hasPriorDirective;
  for (let i = 0; i < entryIndex; i++) {
    if (pendingRemovals?.has(i)) continue;
    if (!isDirectiveStatement(body[i])) return false;
    hasSurvivingDirective = true;
  }
  if (!hasSurvivingDirective) return false;
  let next = entryIndex + 1;
  while (pendingRemovals?.has(next)) next++;
  return isStringLiteralExpressionStatement(body[next]);
}

// partition `candidateIndices` (ascending body indices) into removable nodes vs nodes left as
// `0;`. right-to-left walk: each decision sees later candidates' fates already resolved -
// a later `0;` blocks promotion for earlier ones (the `0;` is a non-directive surviving in
// the prefix), a later removal lets promotion bleed through to the next surviving sibling.
// `pendingRemovals` reproduces, by simulation, the live-body shape babel-plugin sees on its
// per-callback path (where prior removals are already physical). returns AST nodes in walk
// order (descending body position) so callers don't re-sort before emit
export function resolveBatchDirectivePromotionPolicy({ body, candidateIndices, hasPriorDirective = false }) {
  const toRemove = [];
  const toReplaceWithNoop = [];
  // seed with every candidate so the first iteration sees them all as queued, then peel each
  // one back in turn: `delete` -> ask wouldPromote (with the rest still pending) -> on miss
  // re-add (so earlier candidates still see this slot as queued-removed)
  const pendingRemovals = new Set(candidateIndices);
  for (let i = candidateIndices.length - 1; i >= 0; i--) {
    const idx = candidateIndices[i];
    pendingRemovals.delete(idx);
    if (wouldPromoteDirectiveAfterRemoval({ body, entryIndex: idx, pendingRemovals, hasPriorDirective })) {
      toReplaceWithNoop.push(body[idx]);
    } else {
      pendingRemovals.add(idx);
      toRemove.push(body[idx]);
    }
  }
  return { toRemove, toReplaceWithNoop };
}

// indirect-require entry shape: `(prefix1, prefix2, ..., require)('core-js/...')`. peels
// the ExpressionStatement -> CallExpression -> SequenceExpression callee (through any
// ParenthesizedExpression wrappers from oxc) and returns the observable side-effect
// prefix expressions in source order. entry-detection consumes the require-tail and would
// drop the whole statement on removal; this lets both plugins recover the prefix slots so
// `(spy(), require)('core-js/...')` preserves `spy()` while `(0, require)(...)` drops as
// expected. returns an empty array when the shape doesn't match OR every prefix slot is
// side-effect-free
export function extractIndirectRequireSEPrefix(stmtNode) {
  const { expression } = stmtNode ?? {};
  if (expression?.type !== 'CallExpression') return [];
  let { callee } = expression;
  while (callee?.type === 'ParenthesizedExpression') callee = callee.expression;
  if (callee?.type !== 'SequenceExpression' || callee.expressions.length < 2) return [];
  return callee.expressions.slice(0, -1).filter(mayHaveSideEffects);
}

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
// `-map` / `map-` would silently normalize to the same Pascal-case as `map`, masking typos
// in built-in-definitions data. validate-and-bail keeps malformed entries visible
const VALID_KEBAB = /^[a-z][0-9a-z]*(?:-[0-9a-z]+)*$/;

export function kebabToCamel(str) {
  return str.replaceAll(DASH_WORD, (_, c) => c.toUpperCase());
}

export function kebabToPascal(str) {
  return typeof str === 'string' && VALID_KEBAB.test(str)
    ? kebabToCamel(str[0].toUpperCase() + str.slice(1))
    : null;
}

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

// AST parent shapes where an Identifier child is a SOURCE-TEXT name (method/property key,
// member tail, label, import/export specifier name), NOT a runtime reference. used by
// any walker that catalogues references - naive shape-only matches would otherwise count
// e.g. `Math.it` (`.it` is property name) as a reference to a binding `it`, or rewrite
// `class { globalThis() {} }` (method name) to `class { _globalThis() {} }`. pure AST
// analysis - parser-agnostic, so lives in the shared provider helpers
const NON_REF_KEY_BEARING_TYPES = new Set([
  'Property', 'ObjectProperty', 'ObjectMethod',
  'ClassMethod', 'MethodDefinition', 'ClassProperty', 'PropertyDefinition',
]);
export function isNonReferencePosition(parent, identifierNode) {
  if (!parent) return false;
  const { type } = parent;
  if (NON_REF_KEY_BEARING_TYPES.has(type) && parent.key === identifierNode && !parent.computed) return true;
  if (type === 'MemberExpression' && parent.property === identifierNode && !parent.computed) return true;
  if (type === 'LabeledStatement' && parent.label === identifierNode) return true;
  if ((type === 'BreakStatement' || type === 'ContinueStatement') && parent.label === identifierNode) return true;
  if (type === 'ImportSpecifier' && parent.imported === identifierNode) return true;
  if (type === 'ExportSpecifier' && (parent.local === identifierNode || parent.exported === identifierNode)) return true;
  return false;
}

// AST parent shapes where an Identifier child IS the binding being introduced (declarator
// id, function/class id, catch param), NOT a reference to a binding. complementary to
// `isNonReferencePosition` (which covers source-text name positions like property keys);
// callers walking subtrees for global-reference rewrites must skip both shapes to avoid
// renaming the binding itself. pattern positions (destructure ids) handled separately
// by `walkPatternIdentifiers` since patterns can nest arbitrarily
export function isBindingPosition(parent, identifierNode) {
  if (!parent) return false;
  const { type } = parent;
  if (type === 'VariableDeclarator' && parent.id === identifierNode) return true;
  if ((type === 'FunctionDeclaration' || type === 'FunctionExpression'
    || type === 'ClassDeclaration' || type === 'ClassExpression') && parent.id === identifierNode) return true;
  if (type === 'CatchClause' && parent.param === identifierNode) return true;
  return false;
}

// transparent wrappers that may appear ABOVE a `(arrow)(...)` call site without changing
// the call's invocation semantics for IIFE detection: `!fn(...)`, `(0, fn)(...)`, `(fn)(...)`,
// optional-chain wrap (oxc), TS expression wrappers
export const IIFE_CALL_PATH_WRAPPERS = new Set([
  'UnaryExpression',
  'SequenceExpression',
  'ParenthesizedExpression',
  'ChainExpression',
]);

// wrappers that may appear BETWEEN the function-like node and its CallExpression's `.callee`
// slot without changing what's invoked. narrower than IIFE_CALL_PATH_WRAPPERS - UnaryExpression
// there is for shapes ABOVE the call (`!fn()` invokes fn, then negates the result); BELOW the
// call (`(!fn)()` invokes the boolean, not fn). SequenceExpression included with explicit
// tail-check at callsite - the tail is the invoked value, preceding slots are side effects
export const IIFE_CALL_CALLEE_WRAPPERS = new Set([
  'SequenceExpression',
  'ParenthesizedExpression',
  'ChainExpression',
]);

// shapes that invoke a function at runtime: regular call, optional-chain call,
// `new fn()`. `NewExpression` makes the predicate symmetric across the lifted
// arrow / FE forms `let x; new function () { x = "hi" }(); x.at(0)`
const IIFE_CALL_NODE_TYPES = new Set([
  'CallExpression',
  'OptionalCallExpression',
  'NewExpression',
]);
export function isIifeCallNode(node) {
  return !!node && IIFE_CALL_NODE_TYPES.has(node.type);
}

// runtime-transparent expression wrappers: peeling the wrapper preserves the inner
// expression's semantics. covers TS expression wrappers (`as`, `satisfies`, `!`, ...) AND
// `ParenthesizedExpression` (preserved by parser when `createParenthesizedExpressions: true`).
// EXCLUDES `UnaryExpression` / `SequenceExpression` (which DO change semantics) and
// `ChainExpression` (the optional-chain marker carries short-circuit semantics that
// must be preserved at most call sites). used by AST walkers that need to reach the
// SEMANTICALLY meaningful inner node - both expression-down (`peelTransparentPath`) and
// parent-up (`unwrapTSExpressionParent`) walks
export const TRANSPARENT_EXPR_WRAPPER_TYPES = new Set([
  ...TS_EXPR_WRAPPERS,
  'ParenthesizedExpression',
]);

// extended set including `ChainExpression` for callers that need to skip / mark optional-
// chain wrappers too. used by skip-mark walkers (`markSynthReceiverSkipped` /
// destructure-emitter's per-branch peel) and by `unwrapRuntimeExpr`. ChainExpression
// is the oxc-side wrapper for optional chains (babel folds the marker into
// OptionalMemberExpression directly) - both adapters see the same flat shape after peel
export const SKIPPABLE_WRAPPER_TYPES = new Set([
  ...TRANSPARENT_EXPR_WRAPPER_TYPES,
  'ChainExpression',
]);

// walk down `SKIPPABLE_WRAPPER_TYPES` wrappers marking each in `skippedNodes`; returns the
// inner non-wrapper node. shared between `markSynthReceiverSkipped` (class-walk) and
// per-branch synth-swap peel (destructure-emitter) so the wrapper-set stays in lockstep
export function markAndPeelSkippableWrappers(node, skippedNodes) {
  while (node && SKIPPABLE_WRAPPER_TYPES.has(node.type)) {
    skippedNodes.add(node);
    node = node.expression;
  }
  return node;
}

// tracking-free peel of `SKIPPABLE_WRAPPER_TYPES` (TS_EXPR_WRAPPERS + ParenthesizedExpression
// + ChainExpression). used wherever a caller needs the semantically meaningful node and
// doesn't care which wrappers were skipped. consolidates the peel-loop that previously
// lived inline in babel-plugin's `isCallee`, unplugin's `isCallee`, and unplugin's
// `unwrapNode` - all three now share one wrapper-set so adding a future transparent
// wrapper updates the single SKIPPABLE_WRAPPER_TYPES constant
export function peelSkippableWrappers(node) {
  while (node && SKIPPABLE_WRAPPER_TYPES.has(node.type)) node = node.expression;
  return node;
}

// peel `SKIPPABLE_WRAPPER_TYPES` wrappers down through `.expression` slot, returning the
// innermost non-wrapper path (or the input when nothing to peel). path-based counterpart
// to `markAndPeelSkippableWrappers`. callers that need to walk down through TS / paren /
// chain wrappers to a semantic-bearing node use this; null-safe so chained calls don't
// require pre-guard. used by global-resolve's proxy-global detection where babel strips
// parens but oxc preserves them, and TS expression wrappers can land on either parser
export function peelSkippableWrapperPath(path) {
  while (path?.node && SKIPPABLE_WRAPPER_TYPES.has(path.node.type)) path = path.get('expression');
  return path;
}

// transparent wrappers between a CallExpression's `.callee` and the actual invoked node.
// narrower than IIFE_CALL_PATH_WRAPPERS - Unary changes what's invoked. SequenceExpression
// is peeled unconditionally below: the tail is the invoked function regardless of preceding
// slots' side-effect status (`(0, fn)(arg)` minifier idiom drops `this`-binding;
// `(logCall(), fn)(arg)` runs `logCall()` then invokes `fn` - both shapes invoke the tail)
const IIFE_CALLEE_WRAPPERS = new Set([
  'ParenthesizedExpression',
  'ChainExpression',
]);

// peel the callee chain through paren / TS / chain wrappers and through SequenceExpression
// tails until the leaf identifier / function appears. all current callers consume the result
// for arg-side resolution (synth-swap target / IIFE-arg destructure receiver) - they don't
// restructure the callee, so any side effects inside the callee SequenceExpression run at
// their original positions regardless of whether the IIFE is recognised
function peelIifeCallee(callee, fnNode) {
  while (callee && callee !== fnNode) {
    if (IIFE_CALLEE_WRAPPERS.has(callee.type) || TS_EXPR_WRAPPERS.has(callee.type)) {
      callee = callee.expression;
    } else if (callee.type === 'SequenceExpression') {
      callee = callee.expressions.at(-1);
    } else break;
  }
  return callee;
}

const FN_NODE_TYPES = new Set([
  'FunctionExpression',
  'ArrowFunctionExpression',
]);

// every shape that owns a function-like body (param-binding scope + own block body).
// distinct from FN_NODE_TYPES (IIFE callee gate, narrower) - body-extract & param-default
// resolution need ALL of these as enclosing-scope anchors, not just IIFE-callable shapes
export const FUNCTION_LIKE_NODE_TYPES = new Set([
  'FunctionDeclaration',
  'FunctionExpression',
  'ArrowFunctionExpression',
  'ObjectMethod',
  'ClassMethod',
  // babel-only shape: `class C { #foo() {...} }` has its own param-binding scope + block
  // body. without this, body-extract / param-default resolution walks past the private
  // method to the enclosing class, landing the body-extract decl outside the method body
  'ClassPrivateMethod',
]);

// walk parentPath chain (inclusive) to the nearest enclosing function-like. used by
// param-destructure body-extract (insert `const x = _polyfill;` at body top) and any
// other transform that needs the binding's owning scope. parser-agnostic - reads
// `node.type` directly so works for both babel-types virtual paths and estree-toolkit
export function findEnclosingFunctionLikePath(path) {
  let cur = path;
  while (cur && !FUNCTION_LIKE_NODE_TYPES.has(cur.node?.type)) cur = cur.parentPath;
  return cur ?? null;
}

// var-scope boundaries: own scope owners that catch hoisted `var`. `var` declarations
// hoist to the nearest one regardless of nested BlockStatement / IfStatement / loop /
// try-catch wrapping. estree-toolkit's `scope.hasBinding` doesn't reflect this - `var`
// inside a nested block reports false at sibling lookup even though the binding is alive
// at runtime. babel's tracker hoists correctly. closes the parser asymmetry
const VAR_SCOPE_OWNER_TYPES = new Set([
  ...FUNCTION_LIKE_NODE_TYPES,
  'StaticBlock',
  'Program',
]);

function isVarScopeBoundary(type) {
  return VAR_SCOPE_OWNER_TYPES.has(type);
}

// recursively collect `var` bindings inside `scopeNode`, descending through arbitrary
// non-boundary node shapes (block / if / loop / switch / try-catch / etc). stops at
// nested var-scope boundaries so inner-function vars don't leak. result includes vars
// from `scopeNode.body` (function-like bodies wrap in BlockStatement; Program / Block /
// StaticBlock host statements directly at `.body`)
export function collectScopeVars(scopeNode) {
  const locals = new Set();

  function visit(node) {
    if (!node || typeof node !== 'object' || typeof node.type !== 'string') return;
    if (node.type === 'VariableDeclaration' && node.kind === 'var') {
      for (const d of node.declarations ?? []) walkPatternIdentifiers(d.id, id => locals.add(id.name));
      return;
    }
    if (isVarScopeBoundary(node.type)) return;
    for (const key of Object.keys(node)) {
      const value = node[key];
      if (Array.isArray(value)) for (const v of value) visit(v);
      else visit(value);
    }
  }

  if (Array.isArray(scopeNode?.body)) for (const stmt of scopeNode.body) visit(stmt);
  else visit(scopeNode?.body);
  return locals;
}

// walk path's ancestor chain to the first var-scope owner; check if `name` is among its
// vars. `var` doesn't propagate past function boundaries, so an inner-function miss is
// final - no need to continue walking. complements `findTSRuntimeBindingInPath` for
// runtime (vs TS-ambient) shadow detection. result cached per-node via WeakMap (caller
// stays correct under sibling-plugin AST mutation only when this file isn't re-traversed
// after the mutation - same constraint as `tsRuntimeBindingsCache`)
const scopeVarsCache = new WeakMap();
export function findFunctionScopeVarInPath(path, name) {
  for (let cur = path; cur; cur = cur.parentPath) {
    const { node } = cur;
    if (!node || !isVarScopeBoundary(node.type)) continue;
    let vars = scopeVarsCache.get(node);
    if (!vars) scopeVarsCache.set(node, vars = collectScopeVars(node));
    return vars.has(name);
  }
  return false;
}

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

// effective argument count after expanding inline-array spreads (`...[a, b, c]` -> 3).
// returns null when a non-inline-array spread is present - the length is undecidable
// at static-analysis time. used by IIFE-identity callers to validate `params.length ===
// effective args.length` symmetric with `resolveCallArgument`'s expansion semantics
export function effectiveArgsLength(args) {
  let length = 0;
  for (const arg of args) {
    if (arg?.type === 'SpreadElement') {
      if (arg.argument?.type !== 'ArrayExpression') return null;
      length += arg.argument.elements?.length ?? 0;
      continue;
    }
    length++;
  }
  return length;
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
  // walk only through wrappers that don't change the invoked value. UnaryExpression on
  // the callee path (`(!fn)(...)`) invokes the BOOLEAN, not fn - the runtime call throws
  // TypeError before any param binding, so synth-swap / param-default rewrites are unsafe
  while (callPath?.node && (IIFE_CALL_CALLEE_WRAPPERS.has(callPath.node.type)
    || TS_EXPR_WRAPPERS.has(callPath.node.type))) {
    callPath = callPath.parentPath;
  }
  const callNode = callPath?.node;
  // OptionalCallExpression: babel emits a distinct node, oxc wraps a CallExpression with
  // `optional: true` in ChainExpression (peeled above). NewExpression accepted: receiver-
  // substitution still wires the polyfill into the call-arg slot even when `new` would
  // throw at runtime
  if (!isIifeCallNode(callNode)) return null;
  if (peelIifeCallee(callNode.callee, fnNode) !== fnNode) return null;
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

// `import type X = require(...)` is type-only - elided by tsc before runtime, references
// resolve to the global. babel scope tracker registers the binding regardless of modifier;
// callers use this predicate to filter out type-only bindings from shadow checks
export function isTypeOnlyImportEquals(node) {
  return node?.type === 'TSImportEqualsDeclaration' && node.importKind === 'type';
}

// peel nested LabeledStatement wrappers off a raw AST node. `outer: inner: if (...) ...`
// stacks two layers - guard / mutation detection cares only about the wrapped statement
export function peelLabeledStatementNode(node) {
  while (node?.type === 'LabeledStatement') node = node.body;
  return node;
}

// path-form companion: walks `.get('body')` until the wrapped path is no longer a label.
// callers that retain path access (scope / source mutations) need the path, not just node
export function peelLabeledStatementPath(path) {
  while (path?.node?.type === 'LabeledStatement') path = path.get('body');
  return path;
}

// type-only ESM import bindings (3 forms):
//   import type X from "x"          - default specifier under type-only ImportDeclaration
//   import type { X } from "x"      - named specifier under type-only ImportDeclaration
//   import { type X } from "x"      - inline-type-modified named specifier
// all three are elided by tsc; references resolve to the global. both scope trackers
// register the specifier identifier as a binding regardless, so polyfill shadow detection
// must filter via this predicate. accepts the binding's `node` + `parent` (ImportDeclaration)
export function isTypeOnlyImportBinding(node, parent) {
  // accept both TS `type` and Flow legacy `typeof` import-kinds. Flow's `import typeof X
  // from 'm'` is parsed with importKind='typeof' on the ImportDeclaration / ImportSpecifier
  // and is a TYPE-ONLY runtime artifact (Flow strips at compile time), so polyfill shadow
  // detection must filter it identically to TS `type`
  if (parent?.type === 'ImportDeclaration'
    && (parent.importKind === 'type' || parent.importKind === 'typeof')) return true;
  if (node?.type === 'ImportSpecifier'
    && (node.importKind === 'type' || node.importKind === 'typeof')) return true;
  return false;
}

// shared "is this binding tsc-elided?" check used by both adapters' `hasBinding` paths.
// covers: ambient declarations (TSDeclareFunction, TSInterfaceDeclaration, etc., declare
// modifier, type-only TSImportEquals), type-only ESM imports (3 forms), and
// `declare const X` / `declare var X` whose `declare` flag lives on the parent
// VariableDeclaration rather than on the VariableDeclarator binding itself
export function isAmbientBindingShape(node, parent) {
  if (!node) return false;
  if (isAmbientTypeDeclaration(node)) return true;
  if (isTypeOnlyImportBinding(node, parent)) return true;
  if (node.type === 'VariableDeclarator' && parent?.declare === true) return true;
  return false;
}

// branches of a runtime-conditional expression (returned as slot names so callers can
// resolve either AST nodes via `node[slot]` or NodePath via `path.get(slot)`).
// covers all four shapes that drive `meta.fromFallback`: ternary `?:` and the three
// LogicalExpression variants `||` / `&&` / `??`
export function getFallbackBranchSlots(node) {
  if (node?.type === 'ConditionalExpression') return ['consequent', 'alternate'];
  if (node?.type === 'LogicalExpression') return ['left', 'right'];
  return null;
}

// transparent destructure wrappers that sit between an inner pattern and its host
// without changing the proxy-global / static-object resolution semantics:
//   - AssignmentPattern (`{...} = default`): default never fires for proxy-global
//     receivers since `globalThis.X` is always defined; safe under "polyfill always wins"
//   - single-element ArrayPattern (`[{...}]`): wraps a single proxy-global at array
//     index 0; flatten walker drops the whole declarator anyway, including the wrapper
// returns true when `parentNode` wraps `childNode` in one of these passthrough shapes
export function isTransparentDestructureWrapper(parentNode, childNode) {
  if (!parentNode) return false;
  if (parentNode.type === 'AssignmentPattern') return parentNode.left === childNode;
  if (parentNode.type === 'ArrayPattern') {
    return parentNode.elements.length === 1 && parentNode.elements[0] === childNode;
  }
  return false;
}

// chain assignment `foo = X` evaluates to `X` at runtime - peel through these to find the
// destructure receiver. peel only when LHS is a simple Identifier:
//  - compound `+=` / `||=` produce arithmetic / logical results, not constructor candidates
//  - destructure-LHS `{from: b} = X` is an inner destructure assignment that gets rewritten
//    independently; peeling through it would race with that rewrite
export function isChainAssignment(node) {
  return node?.type === 'AssignmentExpression'
    && node.operator === '='
    && node.left?.type === 'Identifier';
}

// destructure-receiver slot on a wrapper node:
//   AssignmentPattern (`{...} = R` in function params) -> 'right'
//   AssignmentExpression (`({...} = R)`)               -> 'right'
//   VariableDeclarator (`const {...} = R`)             -> 'init'
// callers walk up from the ObjectPattern to find the wrapper, then read the receiver slot
export function destructureReceiverSlot(node) {
  if (node?.type === 'AssignmentPattern' || node?.type === 'AssignmentExpression') return 'right';
  if (node?.type === 'VariableDeclarator') return 'init';
  return null;
}

// walk a (possibly nested) ObjectPattern to find the keyPath leading to a leaf Identifier
// named `name`. peels `AssignmentPattern` wrappers (`{key: id = default}`). literal-key
// only (Identifier / StringLiteral / Literal); computed keys / non-literal property names
// bail - the proxy-global resolution path that consumes this uses static key names. simpler
// counterpart to pattern-bindings.js's `findDestructuredKeyPath` which also resolves
// computed-key bindings + ArrayPattern indices via cluster-private helpers
export function objectPatternLiteralKeyPath(pattern, name) {
  if (pattern?.type !== 'ObjectPattern') return null;
  for (const prop of pattern.properties) {
    if (prop.type !== 'Property' && prop.type !== 'ObjectProperty') continue;
    if (prop.computed) continue;
    const keyName = prop.key?.type === 'Identifier' ? prop.key.name
      : (prop.key?.type === 'StringLiteral' || prop.key?.type === 'Literal') ? prop.key.value : null;
    if (typeof keyName !== 'string') continue;
    const value = prop.value?.type === 'AssignmentPattern' ? prop.value.left : prop.value;
    if (value?.type === 'Identifier' && value.name === name) return [keyName];
    if (value?.type === 'ObjectPattern') {
      const inner = objectPatternLiteralKeyPath(value, name);
      if (inner) return [keyName, ...inner];
    }
  }
  return null;
}

// destructure-receiver value bound to an ObjectPattern. unifies the two wrapper shapes
// that drive `meta.fromFallback` per-branch synth-swap:
//   1. slot-bearing wrapper (VariableDeclarator / AssignmentExpression / AssignmentPattern):
//      `const {p} = R`, `({p} = R)`, `function f({p} = D)` -> RHS read from slot
//   2. function-like IIFE wrapper (Arrow / FunctionExpression invoked at the call site):
//      `(({p}) => body)(R)` -> RHS is the call-arg at this param's index
// returns `{ rhsNode, slot, callPath, paramIndex }` (slot XOR callPath set) so node-form
// callers consume `rhsNode`, path-form callers derive a NodePath via the path companion.
// null when the wrapper is neither shape - synth-swap then warns and leaves code intact
export function resolveFallbackReceiver(wrapperPath, paramNode) {
  const wrapperNode = wrapperPath?.node;
  if (!wrapperNode) return null;
  const slot = destructureReceiverSlot(wrapperNode);
  if (slot) return { rhsNode: wrapperNode[slot], slot, callPath: null, paramIndex: -1 };
  const site = findIifeCallSite(wrapperPath, paramNode);
  if (!site) return null;
  const rhsNode = resolveCallArgument(site.callPath.node.arguments ?? [], site.paramIndex);
  return rhsNode ? { rhsNode, slot: null, callPath: site.callPath, paramIndex: site.paramIndex } : null;
}

// path-form companion of `resolveFallbackReceiver` for AST-mutation callers (babel's
// synth-swap registers via NodePath). adapter-agnostic - both babel NodePath and
// estree-toolkit Path expose `.get(key)` / `.get('arguments')[index]`
export function resolveFallbackReceiverPath(wrapperPath, paramNode) {
  const desc = resolveFallbackReceiver(wrapperPath, paramNode);
  if (!desc) return null;
  if (desc.slot) return wrapperPath.get(desc.slot);
  return desc.callPath.get('arguments')[desc.paramIndex];
}

// peel transparent expression wrappers up from `startPath` toward statement context.
// uses the public `TRANSPARENT_EXPR_WRAPPER_TYPES` constant (TS expr wrappers + oxc parens)
// plus SequenceExpression-tail (transparent only when the inner is the SE's last expr -
// mid-SE peel would change observable value, since SE returns the tail's value).
// `onSequencePrefix(exprs)` (optional) is invoked with each SequenceExpression's leading
// expressions (in walk order) so callers that need to re-emit them as side-effect siblings
// can collect them via the callback. returns the first non-transparent ancestor path
// (the path where peeling stopped), or null when the walk runs off the top of the tree
export function peelTransparentExprWrappers(startPath, onSequencePrefix) {
  let path = startPath?.parentPath ?? null;
  let prev = startPath?.node;
  while (path) {
    const type = path.node?.type;
    if (TRANSPARENT_EXPR_WRAPPER_TYPES.has(type)) {
      prev = path.node;
      path = path.parentPath;
      continue;
    }
    if (type === 'SequenceExpression') {
      const exprs = path.node.expressions;
      if (exprs.at(-1) !== prev) return path;
      onSequencePrefix?.(exprs.slice(0, -1));
      prev = path.node;
      path = path.parentPath;
      continue;
    }
    return path;
  }
  return null;
}

// narrower companion to `peelTransparentExprWrappers`: walks parentPath up through Paren
// AND TS expression wrappers ONLY (no SequenceExpression-tail peel). callers that need
// to FIND the enclosing non-wrapper ancestor but want SE-tail to terminate the walk
// (e.g. `({...} = X) as any` -> ExpressionStatement, but `((0, {...} = X))` -> stays at SE
// because SE-tail semantics aren't always desired in the caller's context)
export function peelParenAndTSParentPath(startPath) {
  let path = startPath?.parentPath ?? null;
  while (path?.node && TRANSPARENT_EXPR_WRAPPER_TYPES.has(path.node.type)) path = path.parentPath;
  return path;
}

// destructure-host slot specifically for nested-proxy flatten (`{Array:{from}} = G` ->
// `from = _Array$from`). narrower than `destructureReceiverSlot`: AssignmentExpression
// is accepted ONLY when the surrounding context is an ExpressionStatement (value is
// discarded - safe to replace whole statement with direct assignment). AssignmentPattern
// excluded - inline-default would pick native first on modern engines, contradicting
// usage-pure's polyfill-always contract. transparent wrappers (parens / TS casts /
// chain / SE-tail) between AE and ExpressionStatement walked via the shared peeler
export function flattenableHostSlot(parent, parentPath) {
  if (parent?.type === 'VariableDeclarator') return 'init';
  if (parent?.type !== 'AssignmentExpression') return null;
  const ctx = peelTransparentExprWrappers(parentPath);
  return ctx?.node?.type === 'ExpressionStatement' ? 'right' : null;
}

// like `flattenableHostSlot('right')` but returns the {ExpressionStatement path,
// SE-prefix exprs} pair the cascade emitter needs: SE-tail peel collects leading
// expressions so they can be re-emitted as side-effect siblings, and the resolved
// ExpressionStatement path is the host whose slot the cascade rewrites
export function peelToExpressionStatement(startPath) {
  const sequencePrefix = [];
  const ctx = peelTransparentExprWrappers(startPath, exprs => {
    for (const e of exprs) sequencePrefix.push(e);
  });
  return ctx?.node?.type === 'ExpressionStatement' ? { exprStmt: ctx, sequencePrefix } : null;
}

// parent types whose `.left` slot is a write target: bare `=` AssignmentExpression,
// default-bearing AssignmentPattern, for-of / for-in iteration head. compound `+=` and
// for-await-of fall under separate branches (covered in `isMemberMutationContext`).
// for-await-of shares the ForOfStatement type with `await: true` flag - the predicate
// captures it implicitly via the type check
const WRITE_LEFT_SLOT_TYPES = new Set([
  'AssignmentPattern',
  'ForOfStatement',
  'ForInStatement',
]);

// MemberExpression in a position where the prototype-method polyfill can be skipped because
// the receiver method is never read at runtime: pure assignment (`obj.at = v`), destructure-LHS
// (`({a: obj.at} = src)`, `[obj.at] = src`, `[...obj.at] = src`), destructure-LHS-with-default
// (`({a: obj.at = 1} = src)`), for-of / for-in LHS (`for (obj.at of arr)`, `for (obj.at in
// src)` - each iteration rebinds the slot, body reads see the per-iteration value, not the
// inherited method). compound `+=` / `||=` / `??=` and `obj.at++` still read LHS - excluded
// here. ESTree uses 'Property' for object-pattern slots; babel uses 'ObjectProperty'
export function isMemberWriteOnlyContext(member, parent, grandparent) {
  if (!member || !parent) return false;
  // oxc preserves `(obj.at) = X` as `AssignmentExpression{left: ParenthesizedExpression{
  // expression: MemberExpression}}` - direct `parent` is the paren wrapper, not the
  // AssignmentExpression. peel one paren-layer up so the LHS-context check fires through
  // user-applied parens regardless of parser (babel strips them, oxc preserves)
  if (parent.type === 'ParenthesizedExpression' && parent.expression === member && grandparent) {
    return isMemberWriteOnlyContext(parent, grandparent, null);
  }
  // `=` AssignmentExpression: compound operators (`+=`, `||=`) read LHS first - excluded
  if (parent.type === 'AssignmentExpression' && parent.left === member && parent.operator === '=') return true;
  // left-slot writers grouped: AssignmentPattern default, for-of / for-in head
  if (WRITE_LEFT_SLOT_TYPES.has(parent.type) && parent.left === member) return true;
  // ObjectPattern property value: `({a: obj.at} = src)` - prop key drives `a`, prop value
  // is the write target. grandparent must be ObjectPattern to distinguish from regular
  // object literal `{a: obj.at}` (where the member is a read for the prop's value)
  if ((parent.type === 'ObjectProperty' || parent.type === 'Property')
    && parent.value === member && grandparent?.type === 'ObjectPattern') return true;
  // ArrayPattern element / RestElement target: `[obj.at] = src`, `[...obj.at] = src`.
  // upstream `isReferenced` already filters these, but explicit handling here keeps the
  // helper authoritative for callers that bypass that check (decorator subtree walks etc.)
  if (parent.type === 'ArrayPattern' && parent.elements?.includes(member)) return true;
  if (parent.type === 'RestElement' && parent.argument === member) return true;
  // assignment-target shape that parsers emit as ArrayExpression rather than ArrayPattern:
  // `[obj.at] = src`. MemberExpression appears as element because it's a valid LHS but NOT
  // a valid binding pattern. detect via the AssignmentExpression grandparent with `.left`
  // pointing at the array container. ObjectExpression-LHS shape (`({a: obj.at} = src)`)
  // would need great-grandparent inspection - intentionally not handled here; callers with
  // path access (unplugin's destructure-LHS check) walk the path directly
  if (parent.type === 'ArrayExpression' && parent.elements?.includes(member)
      && grandparent?.type === 'AssignmentExpression' && grandparent.left === parent
      && grandparent.operator === '=') return true;
  return false;
}

// generic AST child-walker. covers single-child slots (`MemberExpression.object`) and
// array-child slots (`ArrayExpression.elements`); reads `.type` on each candidate so
// position metadata (`.start`, `.loc`, `.scope`) is ignored. parser-agnostic - both babel
// and oxc shapes carry the same `.type` string on AST nodes
function walkAstChildren(node, visit) {
  if (!node || typeof node !== 'object') return;
  for (const key of Object.keys(node)) {
    const value = node[key];
    if (Array.isArray(value)) {
      for (const el of value) if (el && typeof el === 'object' && typeof el.type === 'string') visit(el);
    } else if (value && typeof value === 'object' && typeof value.type === 'string') visit(value);
  }
}

// every position where a MemberExpression's slot value changes at runtime. union of:
//   - write-only via `=` LHS / destructure-LHS / pattern-target (via `isMemberWriteOnlyContext`)
//   - compound assignment LHS (`Array.from += X` - reads then writes)
//   - update operand (`Array.from++` - reads then writes)
//   - delete target (`delete Array.from` - removes slot)
// callers that need to know "would the value of `node` differ after this position" check
// this predicate; the three non-write-only forms are not caught by `isMemberWriteOnlyContext`
// because they also READ the slot (so polyfill substitution of the read is wrong-but-not-
// crash-causing, separate from the mutation-bypass divergence this predicate guards)
export function isMemberMutationContext(node, parent, grandparent) {
  if (isMemberWriteOnlyContext(node, parent, grandparent)) return true;
  if (!parent) return false;
  if (parent.type === 'AssignmentExpression' && parent.left === node && parent.operator !== '=') return true;
  if (isUpdateTarget(parent) && parent.argument === node) return true;
  if (isDeleteTarget(parent) && parent.argument === node) return true;
  return false;
}

// extract a static string name from a property-key node: bare Identifier (`Object.key`),
// string-literal under both babel (`StringLiteral`) and oxc (`Literal` with string value).
// returns null when the key isn't a statically resolvable string - dynamic / computed keys
// can't be tracked by the pre-pass since their value isn't known at parse time
function staticStringKey(node) {
  if (node?.type === 'StringLiteral') return node.value;
  if (node?.type === 'Literal' && typeof node.value === 'string') return node.value;
  return null;
}

// resolve a non-computed property's key to its static string name. accepts both bare
// Identifier shorthand (`{ from: ... }`) and string-literal keys (`{ 'from': ... }`).
// returns null for computed keys (`{ [name]: ... }`), numeric / boolean literal keys,
// and PrivateName slots - none of which can affect a public static slot at runtime
function propertyKeyName(prop) {
  if (prop.computed) return null;
  const { key } = prop;
  if (key?.type === 'Identifier') return key.name;
  return staticStringKey(key);
}

// `Namespace.method(...)` shape probe: returns the method name when `call.callee` matches
// non-computed `Identifier(namespaceName).Identifier(...)`. null for any other shape -
// dynamic property, computed access, namespace shadow, etc. shared between the
// Object.defineProperty[ies] and Reflect.defineProperty / Reflect.deleteProperty walkers
// so the (callee, namespace) gate stays in lockstep across mutation siblings
function namespaceStaticCallMethod(call, namespaceName) {
  if (call?.type !== 'CallExpression') return null;
  const { callee } = call;
  if (callee?.type !== 'MemberExpression' || callee.computed) return null;
  if (callee.object?.type !== 'Identifier' || callee.object.name !== namespaceName) return null;
  if (callee.property?.type !== 'Identifier') return null;
  return callee.property.name;
}

// recognise `Object.defineProperty` / `Object.defineProperties` call shape and add each
// affected `Identifier.stringLiteralKey` pair to the mutation set. these are semantically
// equivalent to direct assignment - the descriptor's `value` / accessor overrides the
// built-in slot at runtime - but emit as CallExpression rather than AssignmentExpression
// so the MemberExpression-LHS walker above misses them. supported argument shapes:
//   Object.defineProperty(Identifier, stringLiteral, descriptor)
//      -> mark `Identifier.stringLiteral`
//   Object.defineProperties(Identifier, ObjectExpression{ stringLiteralKey: descriptor, ... })
//      -> mark each non-computed Identifier / string-literal key
// dynamic targets (`Object.defineProperty(getCtor(), 'from', d)`) and dynamic keys
// (`Object.defineProperty(Array, name, d)`) stay out of scope - same Identifier-rooted
// constraint as the MemberExpression-LHS shape: full receiver / key resolution is out of
// scope for this fast pre-walk
function collectObjectMutations(call, mutated) {
  const methodName = namespaceStaticCallMethod(call, 'Object');
  if (methodName === null) return;
  const [target, keyOrProps] = call.arguments ?? [];
  if (target?.type !== 'Identifier') return;
  const targetName = target.name;
  if (methodName === 'defineProperty') {
    const keyName = staticStringKey(keyOrProps);
    if (keyName !== null) mutated.add(`${ targetName }.${ keyName }`);
    return;
  }
  if (methodName !== 'defineProperties') return;
  if (keyOrProps?.type !== 'ObjectExpression') return;
  for (const prop of keyOrProps.properties ?? []) {
    if (prop.type !== 'ObjectProperty' && prop.type !== 'Property') continue;
    const keyName = propertyKeyName(prop);
    if (keyName !== null) mutated.add(`${ targetName }.${ keyName }`);
  }
}

// recognise `Reflect.defineProperty(target, key, desc)` and `Reflect.deleteProperty(target,
// key)` - same monkey-patch semantics as `Object.defineProperty` and `delete target[key]`
// respectively, only the emit shape differs (returns boolean instead of throwing on failure).
// argument shape mirrors Object.defineProperty: Identifier target + static-string key.
// `Reflect.set(target, key, value)` is intentionally NOT here - it writes a value slot but
// can trigger setter traps and respects [[Set]] prototype-chain semantics, which differs
// enough from a slot-override to warrant separate treatment if ever needed
function collectReflectMutations(call, mutated) {
  const methodName = namespaceStaticCallMethod(call, 'Reflect');
  if (methodName !== 'defineProperty' && methodName !== 'deleteProperty') return;
  const [target, key] = call.arguments ?? [];
  if (target?.type !== 'Identifier') return;
  const keyName = staticStringKey(key);
  if (keyName === null) return;
  mutated.add(`${ target.name }.${ keyName }`);
}

// scan AST for `Object.key = X` / `[Object.key] = X` / `({foo: Object.key} = X)` /
// `Object.key++` / `Object.key += X` / `delete Object.key` / `for (Object.key of arr)` /
// `Object.defineProperty(Object, 'key', d)` / `Reflect.defineProperty(...)` /
// `Reflect.deleteProperty(...)` and similar mutation positions. returns a Set
// of `"ObjectName.keyName"` strings. used as a pre-pass before the main usage visitor so
// substitution of `Array.from(...)` reads can bail when the same file mutates `Array.from`
// somewhere - the polyfill import binding is `const`, the user's mutation only reaches
// reads through the original global, so substituting reads with the polyfill import
// silently diverges from the un-transformed source's behavior.
// only matches statically-resolvable receivers (top-level Identifier object); proxy globals
// like `globalThis.Array.from` would require full receiver resolution and stay out of scope
// for this fast pre-walk - the cases worth catching here are direct `Builtin.method = X`
// monkey-patches and `Object.defineProperty(Builtin, 'method', d)` shapes which always have
// an Identifier root
export function collectMutatedStaticMembers(programNode) {
  const mutated = new Set();
  function visit(node, parent, grandparent) {
    if (!node || typeof node !== 'object') return;
    if (node.type === 'MemberExpression'
      && node.object?.type === 'Identifier'
      && node.property?.type === 'Identifier'
      && !node.computed
      && isMemberMutationContext(node, parent, grandparent)) {
      mutated.add(`${ node.object.name }.${ node.property.name }`);
    }
    if (node.type === 'CallExpression') {
      collectObjectMutations(node, mutated);
      collectReflectMutations(node, mutated);
    }
    walkAstChildren(node, child => visit(child, node, parent));
  }
  visit(programNode, null, null);
  return mutated;
}

// shape gate for the per-callback consultation against a `collectMutatedStaticMembers` set.
// shared between babel-plugin and unplugin so the (object, key) string formation stays in
// lockstep with the pre-pass that built the set - any divergence (different separator, case,
// proto-vs-static handling) would cause silent misses on one adapter and not the other
export function isMutatedStaticMeta(meta, mutatedSet) {
  return meta.kind === 'property' && meta.object && meta.key
    && mutatedSet?.has(`${ meta.object }.${ meta.key }`);
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

// extract the direct statement-body array from a scope-anchor node. Program/BlockStatement/
// TSModuleBlock/StaticBlock host statements at `.body` directly; functions and class methods
// wrap in `.body.body` (BlockStatement). returns null when the node has no host-able body
function getDirectStatementBody(node) {
  if (!node) return null;
  if (Array.isArray(node.body)) return node.body;
  if (Array.isArray(node.body?.body)) return node.body.body;
  return null;
}

// scan a scope-anchor node for direct TS-runtime declarations (TSEnumDeclaration,
// TSModuleDeclaration, TSImportEqualsDeclaration). returns a Set of names cached per
// anchor node. covers Program, BlockStatement, TSModuleBlock, StaticBlock, function/method
// bodies - i.e. anywhere a `enum X {}` / `namespace X {}` could shadow a global
export function getTSRuntimeBindings(scopeNode) {
  const body = getDirectStatementBody(scopeNode);
  if (!body) return null;
  let cached = tsRuntimeBindingsCache.get(scopeNode);
  if (cached) return cached;
  cached = new Set();
  for (const stmt of body) {
    // peel `export enum / export const enum / export namespace / export import X = require()`
    // wrappers - the TS-runtime declaration sits in `.declaration` of ExportNamedDeclaration.
    // without the unwrap, `export enum Map { A } new Map()` would falsely polyfill `Map` even
    // though the local enum shadows the global. ExportDefaultDeclaration also handled
    const decl = unwrapExportedDeclaration(stmt);
    if (isTSRuntimeBindingDeclaration(decl)) cached.add(decl.id.name);
  }
  tsRuntimeBindingsCache.set(scopeNode, cached);
  return cached;
}

// walk path's ancestor chain checking each anchor body for TS runtime declarations.
// covers `function f() { enum Map { A } new Map() }` (Map shadows global from inside f),
// `namespace Outer { namespace Map {} new Map() }` (TSModuleBlock anchor), and similar
// block / static-block / Program / function-body cases. path-based so TSModuleBlock works
// even when the scope tracker doesn't register a scope for it
export function findTSRuntimeBindingInPath(path, name) {
  for (let cur = path; cur; cur = cur.parentPath) {
    if (getTSRuntimeBindings(cur.node)?.has(name)) return true;
  }
  return false;
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

// ancestors that hard-stop the pure-erase walk: reaching one proves we're inside a
// runtime container without first crossing a pure-erase boundary. ClassBody / ClassDeclaration /
// ClassExpression / Program are runtime containers; TS expression wrappers (TSAsExpression
// et al, via `TS_EXPR_WRAPPERS`) signal user-cast = runtime expectation per existing
// convention - distinct from purely-type heritage clauses where the type is contract-only
const PURE_TYPE_ERASE_STOP_TYPES = new Set([
  ...TS_EXPR_WRAPPERS,
  'ClassBody',
  'ClassDeclaration',
  'ClassExpression',
  'Program',
]);

// path-accepting wrapper: encapsulates the (parent, parentKey, grandparent) extraction so
// callers don't repeat `path?.parent, path?.key, path?.parentPath?.parent` 4-5 times across
// the codebase. accepts babel NodePath or estree-toolkit path - both expose the same triple.
// `isInImplementsHeritage` covers both the direct case (`class X implements Foo<T>` where
// Foo's path matches via own parent + listKey) AND nested type-args (`Foo<Map<...>>` where
// Map's path needs ancestor walk past TSTypeReference / TSTypeParameterInstantiation hops)
export function isTSTypeOnlyIdentifierPath(path) {
  if (isTSTypeOnlyIdentifier(path?.parent, path?.key, path?.parentPath?.parent)) return true;
  return isInImplementsHeritage(path);
}

// walk path's ancestor chain looking for the `implements` heritage clause - the one
// type-only context where babel's permissive `isReferenced` over-emits polyfills for
// nested type-args. oxc emits dedicated `TSClassImplements` (already in TS_TYPE_ONLY_NODES);
// babel reuses `TSExpressionWithTypeArguments` and gates via the parent path's listKey.
// `PURE_TYPE_ERASE_STOP_TYPES` short-circuits the walk at runtime-bearing ancestors:
// TS expression wrappers (`as` / `satisfies` / `!` / `<T>x`) signal user-cast runtime
// expectation per existing convention; class/program containers terminate the walk.
// distinct from `type T = Map<...>` / `interface I extends Set<...>` / `(x as Map<...>)`
// where the user-referenced type IS expected at runtime (those keep emitting polyfills)
function isInImplementsHeritage(path) {
  for (let current = path?.parentPath; current; current = current.parentPath) {
    const type = current.node?.type;
    if (!type || PURE_TYPE_ERASE_STOP_TYPES.has(type)) return false;
    if (type === 'TSClassImplements') return true;
    if (type === 'TSExpressionWithTypeArguments' && current.listKey === 'implements') return true;
  }
  return false;
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

// `RestElement` and `SpreadElement` are equivalent for `{a, ...rest}` patterns - estree
// uses the latter, babel uses the former. helper centralises the check so destructure-
// emitter rest-detection paths stay parser-agnostic
export function isRestProperty(prop) {
  return prop?.type === 'RestElement' || prop?.type === 'SpreadElement';
}

// any sibling of `currentProp` in the same ObjectPattern that is a rest binding. used by
// AssignmentExpression flatten paths in both plugins to bail when whole-statement replacement
// would silently drop a rest binding (cascade `_unused` sentinel from VariableDeclaration
// path is not portable to AssignmentExpression - the statement value would change shape)
export function hasRestSiblingExcept(properties, currentProp) {
  if (!properties?.length) return false;
  return properties.some(s => s !== currentProp && isRestProperty(s));
}

// transparent runtime wrappers that can surround an UpdateExpression operand:
// TS expression wrappers + parser-preserved parens (`createParenthesizedExpressions: true`).
// distinct from `TS_EXPR_WRAPPERS` alone because ParenthesizedExpression is also transparent
// here but not everywhere (e.g. callee resolution treats parens as chain-breakers)
function isUpdateOperandWrapper(node) {
  return !!node && (TS_EXPR_WRAPPERS.has(node.type) || node.type === 'ParenthesizedExpression');
}

// per-branch peel for fallback receivers: paren / TS / chain wrappers AND SequenceExpression
// tail (`cond ? (0, Array) : Iterator` -> Array). SE prefix preserved at apply time via
// `unwrapSequenceTail` (synth-swap replaces only the inner Identifier, prefix stays in the
// AST so `logCall()` side-effects in `(logCall(), Array)` still run). alternates the two
// peel layers until stable so mixed shapes `cond ? ((0, Array) as any) : ...` reach the leaf
export function peelFallbackBranchInner(node) {
  for (let prev; node !== prev;) {
    prev = node;
    node = unwrapRuntimeExpr(node);
    while (node?.type === 'SequenceExpression') node = node.expressions.at(-1);
  }
  return node;
}

// walk up `parentPath` through ParenthesizedExpression / TS expression wrappers so consumers
// reach the runtime-effective parent context. mirrors `unwrapRuntimeExpr` but operates on
// path ancestors (upward), not the node tree (downward). returns the outermost transparent-
// wrapper path; identity-stable when no wrappers present. shared between binding-analysis's
// new-expression classifier and globals.js's logical-assign LHS check
export function peelTransparentExprAncestorPath(path) {
  let cur = path;
  while (cur?.parentPath?.node
    && (cur.parentPath.node.type === 'ParenthesizedExpression' || TS_EXPR_WRAPPERS.has(cur.parentPath.node.type))
    && cur.parentPath.node.expression === cur.node) {
    cur = cur.parentPath;
  }
  return cur;
}

// deep peel for fallback receivers: chain-assignment (`foo = bar = (cond ? A : B)`) +
// ParenthesizedExpression + TS expression wrappers + side-effect-free SequenceExpression
// tails (`(0, cond ? A : B)`) + zero-arg IIFE returning the fallback (`(() => cond ? A
// : B)()`), alternating until stable. shape: `r = (cond ? A : B)` -> ConditionalExpression.
// used by per-branch synth-swap and fallback enumeration to reach the underlying
// conditional/logical regardless of chain-assign / paren / TS / safe-SE / factory-IIFE
// layering order. SE prefix that carries observable side effects stops further SE-layer
// peeling - dropping it would silently elide effects the rewrite can't preserve.
// visited Set guards against synthetic cyclic ASTs (`a = (a = ...)`-shaped self-loops):
// every step adds the current node, re-visiting any prior bails the walk
export function peelFallbackReceiver(node) {
  const visited = new Set();
  for (let prev; node !== prev;) {
    if (visited.has(node)) return node;
    visited.add(node);
    prev = node;
    while (isChainAssignment(node)) {
      if (visited.has(node.right)) return node;
      visited.add(node.right);
      node = node.right;
    }
    node = unwrapRuntimeExpr(node);
    while (node?.type === 'SequenceExpression') {
      const tail = node.expressions.at(-1);
      if (visited.has(tail)) return node;
      visited.add(tail);
      node = tail;
    }
    // outer loop's top adds `node` to `visited` at the next iteration and bails on
    // re-entry; don't pre-add `iifeInner` here or we short-circuit before iterating through
    // a legitimate nested-IIFE peel chain (`(() => (() => expr)())()` -> outer peeled to
    // inner CallExpression on this iter, then iter+1 peels inner to expr)
    const iifeInner = peelZeroArgIifeReturn(node);
    if (iifeInner) node = iifeInner;
  }
  return node;
}

// walk a symbol-sourced `X in Y` LHS subtree, invoking `visit(seExprNode)` for each
// SE-bearing leading expression discovered in any nested SequenceExpression. handles
// wrapped receivers (`(fn(), Symbol).iterator`), computed-key SE (`Symbol[(fn(), 'k')]`),
// and TS/Paren/Chain wrappers around either. shared between babel-plugin and unplugin
// `handleInExpression`: babel passes `e => arr.push(t.cloneNode(e))`, unplugin passes
// `e => arr.push(nodeSrc(e))` - the walk + SE detection lives here so both emit paths
// preserve the same shapes byte-for-byte without diverging implementations
export function visitSymbolInLhsSe(node, visit) {
  function walk(n) {
    while (n && (TRANSPARENT_EXPR_WRAPPER_TYPES.has(n.type) || n.type === 'ChainExpression')) {
      n = n.expression;
    }
    if (!n) return;
    if (n.type === 'MemberExpression' || n.type === 'OptionalMemberExpression') {
      walk(n.object);
      if (n.computed) walk(n.property);
      return;
    }
    if (n.type === 'SequenceExpression') {
      const { expressions } = n;
      if (!expressions?.length || expressions.length < 2) return;
      const prefix = expressions.slice(0, -1);
      if (prefix.some(mayHaveSideEffects)) for (const e of prefix) visit(e);
    }
  }
  walk(node);
}

// nodes that introduce their own scope and may shadow outer bindings - subtree walkers
// stop at these boundaries: `bodyHasParamReference` / `prefixStmtRebindsParam` treat them
// as opaque (can't reason about inner bindings statically), `subtreeContainsExit` (in
// straight-line-flow) treats them as scope-local exits that don't propagate to the outer
// straight-line check
export const NESTED_BINDING_INTRODUCERS = new Set([
  'ArrowFunctionExpression',
  'FunctionExpression',
  'FunctionDeclaration',
  'ClassExpression',
  'ClassDeclaration',
  // babel-only AST node for `{ foo() {} }` shorthand methods. carries its own scope and
  // body; descent into the inline-literal must stop here so an inner `return` doesn't
  // get treated as a propagating exit. estree-toolkit normalises to Property + FnExpr,
  // which already terminate via FunctionExpression. ClassMethod / ClassPrivateMethod live
  // inside ClassExpression / ClassDeclaration which already terminate descent above
  'ObjectMethod',
]);

// peel a transparent IIFE call to its underlying receiver expression. covers three
// pass-through shapes (in increasing scope of evaluation, all valid as a single peel):
//   - zero-arg + zero-param: `(() => expr)()` -> `expr`
//   - identity: `(arg => arg)(X)` / `((a, b) => b)(X, Y)` -> the arg matching the body's
//     returned param (positional)
//   - param-free body: `(arg => globalThis)(X)` -> `globalThis`. body doesn't reference
//     any param; the IIFE is a no-shadow pass-through (args evaluated for side-effect,
//     return value is the body verbatim). factory wrappers `(arg => { setup(arg); return
//     arg; })(X)` also fit here when intermediates don't rebind a param
// returns null for non-IIFE callees, async/generator functions, spread args, destructure
// params, bodies with control flow / non-ExpressionStatement intermediates / prefix
// reassignments to params, or bodies whose free variables overlap params without
// matching the identity shape
export function peelZeroArgIifeReturn(node) {
  if (node?.type !== 'CallExpression' && node?.type !== 'OptionalCallExpression') return null;
  // peel paren / TS-wrappers + SequenceExpression tail off the callee. `unwrapRuntimeExpr`
  // stops at SE; `(0, () => Array)()` (comma-sequence prefix on the callee) is a common
  // wrapper shape that should still recognise as IIFE. mirror `peelIifeCallee` which
  // already accepts SE-prefixed callees for the IIFE-identity gate
  let callee = unwrapRuntimeExpr(node.callee);
  while (callee?.type === 'SequenceExpression' && callee.expressions?.length) {
    callee = unwrapRuntimeExpr(callee.expressions.at(-1));
  }
  if (callee?.type !== 'ArrowFunctionExpression' && callee?.type !== 'FunctionExpression') return null;
  if (callee.async || callee.generator) return null;
  const args = node.arguments ?? [];
  // non-inline-array spread bails - positional arg-to-param matching is undecidable when
  // a `...arr` carries unknown length. inline-array spread (`...[a, b]`) is fine; both
  // `effectiveArgsLength` (counting) and `resolveCallArgument` (lifting) apply the same
  // expansion so counts can't drift
  const effectiveLength = effectiveArgsLength(args);
  if (effectiveLength === null) return null;
  const params = callee.params ?? [];
  const paramNames = collectParamBindingNames(params);
  if (paramNames === null) return null;
  const body = iifeBodyReturn(callee, paramNames);
  if (body === null) return null;
  // identity IIFE: body is a bare param Identifier - lift the matching arg by position.
  // requires effective args count === params.length so positional match is unambiguous
  if (body.type === 'Identifier' && paramNames.has(body.name) && effectiveLength === params.length) {
    const i = params.findIndex(p => p?.type === 'Identifier' && p.name === body.name);
    if (i !== -1) {
      const lifted = resolveCallArgument(args, i);
      if (lifted) return lifted;
    }
  }
  // zero-arg/zero-param OR param-free body: lift the body verbatim (resolver-side
  // classification ignores arg side effects since it only needs receiver shape)
  return bodyHasParamReference(body, paramNames) ? null : body;
}

// collect Identifier names introduced by the param list. supports simple Identifier
// params, AssignmentPattern wraps (`x = 1`), and RestElement (`...x`). returns null for
// destructure patterns and other shapes we don't statically track -- caller bails on
// null to keep the peel sound
function collectParamBindingNames(params) {
  const names = new Set();
  for (const p of params) {
    const base = p?.type === 'AssignmentPattern' ? p.left : p?.type === 'RestElement' ? p.argument : p;
    if (base?.type !== 'Identifier') return null;
    names.add(base.name);
  }
  return names;
}

// shallow free-variable scan: true if any Identifier in `node`'s reference positions
// matches a param name. skips non-reference slots (non-computed member property), bails
// conservatively on nested scope introducers (nested function / class bodies could
// declare a local with a param name, masking the outer binding)
function bodyHasParamReference(node, paramNames) {
  if (paramNames.size === 0 || !node || typeof node !== 'object' || typeof node.type !== 'string') return false;
  if (node.type === 'Identifier') return paramNames.has(node.name);
  if (node.type === 'MemberExpression' || node.type === 'OptionalMemberExpression') {
    return bodyHasParamReference(node.object, paramNames)
      || (node.computed && bodyHasParamReference(node.property, paramNames));
  }
  if (NESTED_BINDING_INTRODUCERS.has(node.type)) return true;
  for (const key of Object.keys(node)) {
    const value = node[key];
    if (Array.isArray(value)) {
      if (value.some(v => bodyHasParamReference(v, paramNames))) return true;
    } else if (bodyHasParamReference(value, paramNames)) return true;
  }
  return false;
}

// extract the body's terminal return expression while validating the prefix. arrow
// expression-body returns directly. BlockStatement body: accept a side-effect
// ExpressionStatement prefix preceding `return expr;`. non-ExpressionStatement
// intermediates (control flow, bindings) or expressions that rebind a param (`arg = X`
// / `arg++`) make the peel unsound. single body walk handles both checks
function iifeBodyReturn(callee, paramNames) {
  const { body } = callee;
  if (callee.type === 'ArrowFunctionExpression' && body?.type !== 'BlockStatement') return body ?? null;
  if (body?.type !== 'BlockStatement') return null;
  const stmts = body.body ?? [];
  if (stmts.length === 0) return null;
  const last = stmts.at(-1);
  if (last?.type !== 'ReturnStatement' || !last.argument) return null;
  for (let i = 0; i < stmts.length - 1; i++) {
    if (stmts[i]?.type !== 'ExpressionStatement') return null;
    if (prefixStmtRebindsParam(stmts[i].expression, paramNames)) return null;
  }
  return last.argument;
}

// detect any param reassignment hidden anywhere inside `expr` (the expression of one
// prefix ExpressionStatement before the body's `return`). recursive walk covers:
//  - pattern-LHS: `[arg] = X`, `{a: arg} = X`, `[...arg] = X`, `[arg = 0] = X` -
//    `walkPatternIdentifiers` enumerates every binding leaf (also handles bare
//    Identifier and bare MemberExpression LHS uniformly: `arg.foo = X` walks no
//    identifiers, so it correctly stays sound for property writes)
//  - wrapper-hidden: SequenceExpression (`side(), arg = X`), BinaryExpression / Logical /
//    Conditional, ParenthesizedExpression (oxc preserves; babel strips at parse),
//    TS_EXPR_WRAPPERS, ChainExpression - the assignment / update sits one or more levels deep,
//    generic `Object.keys` descent finds it
//  - shallow Identifier LHS / UpdateExpression target - the pre-fix behavior
// `NESTED_BINDING_INTRODUCERS` bail: do not descend into nested function / class
// bodies. their rebinds either shadow (own param with same name) or only run when
// the closure is invoked elsewhere - neither propagates to the outer param's value
// at the prefix-statement evaluation point
function prefixStmtRebindsParam(expr, paramNames) {
  if (!expr || paramNames.size === 0) return false;
  if (typeof expr !== 'object' || typeof expr.type !== 'string') return false;
  if (NESTED_BINDING_INTRODUCERS.has(expr.type)) return false;
  if (expr.type === 'UpdateExpression') {
    return expr.argument?.type === 'Identifier' && paramNames.has(expr.argument.name);
  }
  if (expr.type === 'AssignmentExpression') {
    if (patternBindsAnyParam(expr.left, paramNames)) return true;
    // RHS may carry its own rebind too (`other = (arg = X)`) - keep walking
    return prefixStmtRebindsParam(expr.right, paramNames);
  }
  for (const key of Object.keys(expr)) {
    const value = expr[key];
    if (Array.isArray(value)) {
      if (value.some(v => prefixStmtRebindsParam(v, paramNames))) return true;
    } else if (prefixStmtRebindsParam(value, paramNames)) return true;
  }
  return false;
}

function patternBindsAnyParam(pattern, paramNames) {
  let found = false;
  walkPatternIdentifiers(pattern, id => { if (paramNames.has(id.name)) found = true; });
  return found;
}

// peel TS / paren wrappers and report whether the underlying node is a SequenceExpression
// whose preceding elements carry observable side effects. used by computed-key polyfill
// rewrites (`obj[(SE(), Symbol.iterator)]`) where dropping the property silently elides SE -
// caller bails to native shape so the inner key visitor can polyfill in place
export function hasSideEffectfulSequencePrefix(node) {
  const cur = unwrapRuntimeExpr(node);
  return cur?.type === 'SequenceExpression'
    && cur.expressions.slice(0, -1).some(mayHaveSideEffects);
}

// recursive peel of nested SequenceExpressions through paren wrappers: `(se1(), (se2(), G))`
// yields preceding-effect list `[se1(), se2()]` and tail `G`. used by destructure-flatten
// emitters (babel `liftSEPrefix`, unplugin `tryFlattenAssignmentExpressionDestructure`,
// unplugin main flatten) so every SE layer's preceding expressions lift instead of only
// the outermost. without recursion, inner se2() silently elides under the rewrite. peel
// parens + TS expression wrappers (`as` / `satisfies` / `!` / chain) so SE through casts
// (`(logCall(), R) as any`) lifts the same as bare SE - otherwise the prefix gets dropped
// when the declarator is flattened. returns `{ prefix: Node[], tail: Node }`
export function peelNestedSequenceExpressions(node) {
  const prefix = [];
  let cursor = node;
  while (cursor) {
    cursor = unwrapRuntimeExpr(cursor);
    if (cursor?.type !== 'SequenceExpression' || cursor.expressions.length < 2) break;
    for (const e of cursor.expressions.slice(0, -1)) prefix.push(e);
    cursor = cursor.expressions.at(-1);
  }
  return { prefix, tail: cursor };
}

// `(fn, R)` IIFE arg or default-RHS evaluates to its tail. peel SE prefixes recursively
// through transparent wrappers (parens / chain / TS casts) so flat / nested / wrapped
// forms classify identically for synth-swap:
//   `(0, R)`               - flat SE
//   `(0, (1, R))`          - nested SE
//   `(0, (R as any))`      - SE with TS-wrapped tail
//   `((0, R) as any)`      - TS-wrapped SE
// peel is unconditional including for side-effecting prefixes: synth-swap mutates ONLY
// the tail node via `replaceWith`, so prefix expressions stay in the SE structure and
// run at runtime. without unconditional peel, default-RHS `({from} = (logCall(), Array))`
// would fall back to inline-default / body-extract, dropping caller-passed `from`
// (caller's arg should win, default fires only when caller passes `undefined` - that's
// where the polyfill belongs). shared between babel-plugin and unplugin synth-swap
export function unwrapSafeSequenceTail(node) {
  for (;;) {
    node = unwrapRuntimeExpr(node);
    if (node?.type !== 'SequenceExpression') return node;
    const tail = node.expressions.at(-1);
    if (!tail) return node;
    node = tail;
  }
}

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

// true when ObjectPattern at `path` sits at function-parameter position. walks up through
// AssignmentPattern.left / ArrayPattern / RestElement.argument / ObjectProperty.value /
// ObjectPattern.properties wrappers until a function-like owner appears or a non-wrapper
// breaks the chain. realistic nesting < 8 hops; depth cap of 32 surfaces AST cycles loudly
export function isFunctionParamDestructureParent(path) {
  if (!path) return false;
  let prev = path.node;
  let parent = path.parentPath;
  let depth = 0;
  while (parent) {
    if (depth++ >= 32) {
      throw new Error('[core-js] isFunctionParamDestructureParent: pattern nesting exceeds 32 levels - likely an AST cycle');
    }
    const { node } = parent;
    if (!node) return false;
    if (FUNCTION_LIKE_PARAM_OWNER_TYPES.has(node.type)) return true;
    switch (node.type) {
      case 'AssignmentPattern':
        // bail when ObjectPattern sits on AssignmentPattern.right (`{x: ({y}=Z)} = src`) -
        // that's a default value, not a param destructure; only `.left` is param shape
        if (node.left !== prev) return false;
        break;
      case 'RestElement':
        // RestElement transparent wrapper: `[a, ...{x}]` (rest target is destructured).
        // bail when ObjectPattern sits anywhere other than `.argument` slot
        if (node.argument !== prev) return false;
        break;
      case 'ObjectProperty':
      case 'Property':
        // ObjectProperty.value is a destructure target slot: `function({a: {x} = R})` carries
        // the inner `{x}` (or `{x} = R` AssignmentPattern wrap) on `.value`. bail on `.key`
        // (`{[k]: x}` computed-key with destructure pattern as the key node would mean the
        // key itself is a parameter shape, which isn't valid TS / ESLint shape)
        if (node.value !== prev) return false;
        break;
      case 'ObjectPattern':
        // ObjectPattern wraps Property children: `function({a: {x}})` chain bottom-up reaches
        // outer ObjectPattern after walking through inner Property. continue only when prev
        // sits in `.properties` (transparent wrapper); ObjectPattern in any other slot would
        // mean we're nested inside a non-destructure context (e.g. wrapper around a key)
        if (!node.properties?.includes(prev)) return false;
        break;
      case 'ArrayPattern': break;
      default: return false;
    }
    prev = node;
    parent = parent.parentPath;
  }
  return false;
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
// (`Array.of\`...\``) - the polyfill is a plain function and runs correctly regardless,
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
    // function-like boundary: a `for-of/in` enclosing a nested function isn't writing to
    // the inner function's bindings - bail when we cross a fn body upward. without this
    // guard `for (obj.x of arr) { function nested() { obj.x } }` would false-positive
    // mark inner reads as part of the for-write set (different lexical scope)
    if (FUNCTION_LIKE_NODE_TYPES.has(parent.type)) return false;
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

function isNamedIdent(node, name) {
  return node?.type === 'Identifier' && node.name === name;
}

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

// `this`-receiver check for member-shadow detection. peels parens / TS wrappers /
// chain so `(this).X`, `(this as any).X`, `this!.X` (createParens=true or TS-source)
// reach the same outcome as bare `this.X`. shared between usage-pure dispatch (babel /
// unplugin) and usage-global usage-callback - keeping the predicate centralised avoids
// drift between those three call sites
export function isThisReceiver(node) {
  return unwrapRuntimeExpr(node)?.type === 'ThisExpression';
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

// alternates `unwrapRuntimeExpr` (parens / chain / TS) and `unwrapInitValue` (parens /
// SE tail) until the node is stable. used for callee-identity lookups that don't care
// about preceding side effects: `(0, isStr)(x)`, `((isStr) as any)(x)`, `(0, (isStr as
// any))(x)`, `isStr?.()` - every wrapper combination reaches the same effective callee.
// SE prefix side-effects are dropped from the peeled view (consumer is doing predicate
// resolution, not codegen, so prefix elision is semantics-preserving).
// depth-capped at `MAX_DEPTH` alternations as a safety net against pathologically-nested
// wrappers (cyclic AST shouldn't reach this helper; cap matches `unwrapReceiverLeaf`'s
// defense - fixpoint detection alone is insufficient if a wrapper transforms node identity)
export function unwrapExpressionChain(node) {
  for (let depth = 0; depth < MAX_DEPTH && node; depth++) {
    const before = node;
    node = unwrapInitValue(unwrapRuntimeExpr(node));
    if (node === before) return node;
  }
  return node;
}

// extract the single return expression of a function-like body. arrow expression-body
// returns directly; block bodies must contain EXACTLY one ReturnStatement and any other
// statement type bails - the inlined replacement at the caller swaps the entire call site
// for the extracted return expression, so anything besides a side-effect-only prefix would
// be silently lost. allowlist:
//   - ReturnStatement (must appear exactly once)
//   - ExpressionStatement (`calls++;` / `'use strict';` / `console.log(x);`) - preserved
//     via caller's `meta.sideEffects` channel + SE-wrap (see `inlineCallHasObservableEffects`)
// EVERYTHING ELSE bails - declarations introduce local bindings that shadow caller-scope
// free identifiers; control-flow (IfStatement / TryStatement / ForStatement / SwitchStatement
// / ThrowStatement / WhileStatement / DoWhileStatement / etc.) carries branches the scan
// can't statically pick. without the strict gate, a body like `if (cond) return X; return Y;`
// would resolve to Y, ignoring the conditional branch - silent semantic mismatch
export function singleReturnBodyExpression(body) {
  if (!body) return null;
  if (body.type !== 'BlockStatement') return body;
  let ret = null;
  for (const stmt of body.body) {
    if (stmt.type === 'ReturnStatement') {
      if (ret) return null;
      ret = stmt;
      continue;
    }
    if (stmt.type !== 'ExpressionStatement') return null;
  }
  return ret?.argument ?? null;
}

// peel an IIFE shell `(() => X)()` / `(() => X)?.()` / `(function(){return X})()` to its
// body's return expression. callee must be a sync, non-generator, zero-param arrow / fn
// expression; call-site args are ignored (zero params drop them at runtime). mirrors the
// inline contract `inlineCallReturnExpression` uses for receiver-name resolution
export function peelIIFEReturn(node) {
  if (node?.type !== 'CallExpression' && node?.type !== 'OptionalCallExpression') return null;
  const callee = unwrapInitValue(unwrapRuntimeExpr(node.callee));
  if ((callee?.type !== 'ArrowFunctionExpression' && callee?.type !== 'FunctionExpression')
    || callee.params?.length || callee.async || callee.generator) return null;
  return singleReturnBodyExpression(callee.body);
}

// peel transparent wrappers AND no-arg arrow / function-expression IIFE shells around an
// expression to expose the effective receiver leaf. mirrors the inline-call traversal
// `resolveObjectName` does for receiver-name resolution, but stays AST-only (no scope /
// binding lookup - identifier-bound IIFEs aren't peeled here; the receiver-Identifier
// visitor handles those via its own binding walk). used by emit suppression: when an
// outer transform absorbs the whole receiver text, the leaf Identifier's parallel
// substitution would compose into the outer's emit (`_Map` -> `__Map`).
// depth-bounded against malformed input (cyclic AST shouldn't reach this helper; cap
// matches `unwrapExpressionChain`'s `MAX_DEPTH` defense)
export function unwrapReceiverLeaf(node) {
  for (let depth = 0; depth < MAX_DEPTH; depth++) {
    const before = node;
    node = unwrapInitValue(unwrapRuntimeExpr(node));
    const iifeReturn = peelIIFEReturn(node);
    if (iifeReturn) {
      node = iifeReturn;
      continue;
    }
    if (node === before) return node;
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

// peel transparent wrappers so `0, module.exports = ...` / `(module.exports = ...)` /
// `(Object.defineProperty as any)(...)` still match the CJS shape probes. TS expression
// wrappers (`as`/`satisfies`/`<T>cast`/`!`) are runtime no-ops; without the peel they
// shadow the CJS recognition and downstream rewrites bail
function unwrapExpr(node) {
  while (node) {
    if (node.type === 'ParenthesizedExpression' || node.type === 'ChainExpression') node = node.expression;
    else if (node.type === 'SequenceExpression') node = node.expressions.at(-1);
    else if (TS_EXPR_WRAPPERS.has(node.type)) node = node.expression;
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

function matchesMemberName(node, name) {
  return (!node.computed && isNamedIdent(node.property, name))
    || (node.computed && isStringLiteralWithValue(node.property, name));
}

function isStaticMember(node, objName, propName) {
  return (node?.type === 'MemberExpression' || node?.type === 'OptionalMemberExpression')
    && isNamedIdent(unwrapExpr(node.object), objName) && matchesMemberName(node, propName);
}

// walks the MemberExpression chain - any ancestor rooted at `exports` or `module.exports` matches.
// also handles OptionalMemberExpression: `module?.exports.X = Y` is valid syntax (defensive
// edge for tooling that emits guarded CJS reassignment); babel and oxc both produce the
// matching node type, so the check accepts either
function isCommonJSAssignTarget(left) {
  let node = unwrapExpr(left);
  while (node?.type === 'MemberExpression' || node?.type === 'OptionalMemberExpression') {
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
  for (const stmt of body ?? []) {
    if (statementShadowsRequireAtProgramScope(stmt)) return true;
  }
  // `var require` hoists from nested non-function scopes (for-of head, if-body, blocks,
  // try-catch) to program scope per JS semantics. babel's scope tracker hoists vars
  // natively; mirror that here so unplugin's entry-detection synth-scope matches
  // babel-plugin's real-scope `getBindingIdentifier('require')` behavior
  return collectScopeVars({ body }).has('require');
}

// covers what babel's `scope.getBindingIdentifier('require')` (filtered by
// `isAmbientBindingShape`) plus `findTSRuntimeBindingInPath` would report for a
// program-direct binding. `var` is excluded - the recursive hoist sweep in
// `computeDeclaresRequire` handles it uniformly, including top-level `var require`
function statementShadowsRequireAtProgramScope(stmt) {
  const node = unwrapExportedDeclaration(stmt);
  if (!node || node.declare === true) return false;
  switch (node.type) {
    case 'VariableDeclaration':
      // block-scoped `let`/`const` only matter at program-direct position. `var` falls
      // through to the recursive collectScopeVars sweep (handles nested + program-direct)
      if (node.kind === 'var') return false;
      return declaratorsBindName(node.declarations, 'require');
    case 'FunctionDeclaration':
    case 'ClassDeclaration':
      return node.id?.name === 'require';
    case 'ImportDeclaration':
      // type-only forms (declaration-level `import type ...` and per-specifier `import { type X }`)
      // are tsc-elided - references resolve to the global, so no runtime shadow
      if (node.importKind === 'type') return false;
      return node.specifiers.some(s => s.importKind !== 'type' && s.local?.name === 'require');
    // `import require = X.Y` creates a runtime binding (namespace refs / proper modules
    // both reach runtime). `import type require = ...` is tsc-elided
    case 'TSImportEqualsDeclaration':
      return !isTypeOnlyImportEquals(node) && node.id?.name === 'require';
    // non-ambient `enum X {}` / `const enum X {}` / `namespace X {}` emit IIFE-backed
    // runtime bindings. babel's scope tracker exposes them only via
    // `findTSRuntimeBindingInPath`, not `getBindingIdentifier`
    case 'TSEnumDeclaration':
    case 'TSModuleDeclaration':
      return node.id?.name === 'require';
  }
  return false;
}

function declaratorsBindName(decls, name) {
  let found = false;
  for (const d of decls ?? []) {
    walkPatternIdentifiers(d.id, id => { if (id.name === name) found = true; });
    if (found) return true;
  }
  return false;
}

// `Object.defineProperty(exports, 'x', ...)` is tsc/esbuild's CJS emit shape for
// `export const x = ...`; recognise as CJS marker alongside the direct-assign forms
function isObjectDefinePropertyOnExports(expression) {
  if (expression?.type !== 'CallExpression' && expression?.type !== 'OptionalCallExpression') return false;
  const callee = unwrapExpr(expression.callee);
  if (!isStaticMember(callee, 'Object', 'defineProperty')) return false;
  const first = expression.arguments?.[0];
  return !!first && isNamedIdent(unwrapExpr(first), 'exports');
}

export function detectCommonJS(program) {
  let hasCJS = false;
  for (const stmt of program.body) {
    // ESM wins: any ESM marker anywhere in the program rules out CJS classification,
    // so keep scanning even after hasCJS is set to surface a later import / export
    if (ESM_MARKER_TYPES.has(stmt.type)) return false;
    if (stmt.type !== 'ExpressionStatement') continue;
    const expression = unwrapExpr(stmt.expression);
    // top-level `await` is ESM-only syntax (parser would reject in script context),
    // so treat it as a strong ESM marker even without explicit import/export
    if (expression?.type === 'AwaitExpression') return false;
    if (hasCJS) continue;
    const isDirectAssign = expression?.type === 'AssignmentExpression' && isCommonJSAssignTarget(expression.left);
    if (isDirectAssign || isObjectDefinePropertyOnExports(expression)) hasCJS = true;
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
// per-node WeakMap cache - same subtree is queried by nested destructure / SE-extract paths.
// depth cap: pathological deeply-nested AST (template-literal bombs, oxc bug-emitted cycles)
// would stack-overflow without it. 256 covers realistic depths (deepest in test fixtures < 30);
// hitting the cap conservatively returns true so callers don't accidentally drop SE awareness.
// NOT cleared on `typeResolvers.reset()` - WeakMap entries GC naturally when AST nodes go out
// of scope; per-file plugin instances each see fresh nodes anyway. documented for parity check
const SIDE_EFFECTS_CACHE = new WeakMap();
const SIDE_EFFECTS_MAX_DEPTH = 256;
export function mayHaveSideEffects(node) {
  if (!node) return false;
  if (SIDE_EFFECTS_CACHE.has(node)) return SIDE_EFFECTS_CACHE.get(node);
  const result = computeSideEffects(node, 0);
  SIDE_EFFECTS_CACHE.set(node, result);
  return result;
}
function recurse(node, depth) {
  if (!node) return false;
  if (SIDE_EFFECTS_CACHE.has(node)) return SIDE_EFFECTS_CACHE.get(node);
  if (depth >= SIDE_EFFECTS_MAX_DEPTH) return true;
  const result = computeSideEffects(node, depth + 1);
  SIDE_EFFECTS_CACHE.set(node, result);
  return result;
}
function computeSideEffects(node, depth) {
  const { type } = node;
  if (ALWAYS_EFFECTFUL_TYPES.has(type)) return true;
  if (type === 'UnaryExpression') return node.operator === 'delete' || recurse(node.argument, depth);
  if (type === 'SequenceExpression' || type === 'TemplateLiteral') {
    return node.expressions.some(e => recurse(e, depth));
  }
  // `[...a]` invokes `a[Symbol.iterator]` / `{...a}` invokes `a`'s Proxy traps - neither
  // can be proven pure from source alone. treat SpreadElement as SE uniformly across
  // Array and Object literals. without this, `const { from } = [1, ...Array]` was
  // considered SE-free and ran through the no-SE-path by mistake
  if (type === 'ArrayExpression') {
    return node.elements.some(el => el?.type === 'SpreadElement' || recurse(el, depth));
  }
  if (type === 'ObjectExpression') {
    return node.properties.some(p => p?.type === 'SpreadElement' || recurse(p, depth));
  }
  if (type === 'BinaryExpression' || type === 'LogicalExpression') {
    return recurse(node.left, depth) || recurse(node.right, depth);
  }
  if (type === 'ConditionalExpression') {
    return recurse(node.test, depth) || recurse(node.consequent, depth) || recurse(node.alternate, depth);
  }
  if (TRANSPARENT_WRAPPER_TYPES.has(type) || TS_EXPR_WRAPPERS.has(type)) {
    return recurse(node.expression ?? node.argument, depth);
  }
  if (type === 'MemberExpression' || type === 'OptionalMemberExpression') {
    return recurse(node.object, depth) || (node.computed && recurse(node.property, depth));
  }
  if (type === 'Property' || type === 'ObjectProperty') {
    return (node.computed && recurse(node.key, depth)) || recurse(node.value, depth);
  }
  // babel-only ObjectMethod (`{ [fn()]() {} }` / `{ get [fn()]() {} }`): computed key is
  // evaluated at object-literal-eval time, method body / params are deferred. without this
  // case the node falls through to `return false`, silently eliding SE in the computed key
  // and unblocking unsafe receiver-drop rewrites that consumed `Array[(fn(), 'from')]`-shape
  if (type === 'ObjectMethod') {
    return node.computed && recurse(node.key, depth);
  }
  if (type === 'AssignmentPattern') return recurse(node.right, depth);
  if (JSX_NODE_TYPES.has(type)) return jsxHasSideEffects(node, type, depth);
  if (type === 'ClassExpression' || type === 'ClassDeclaration') return classHasSideEffects(node, depth);
  return false;
}

// JSX evaluates attribute expressions and children at render time. attribute values
// (`<X y={fn()} />`) and expression containers in children (`<X>{fn()}</X>`) carry
// arbitrary expressions; spread attributes / spread children invoke iteration
// (`<X {...obj} />` reads obj's enumerable keys), conservative SE
const JSX_NODE_TYPES = new Set([
  'JSXElement',
  'JSXFragment',
  'JSXAttribute',
  'JSXExpressionContainer',
  'JSXSpreadChild',
]);
function jsxHasSideEffects(node, type, depth) {
  // `.expression`-only carriers
  if (type === 'JSXExpressionContainer' || type === 'JSXSpreadChild') return recurse(node.expression, depth);
  if (type === 'JSXAttribute') return recurse(node.value, depth);
  // JSXElement | JSXFragment: walk children. JSXElement also walks attributes -
  // spread attributes are SE unconditionally (iteration over their object operand)
  if (node.children?.some(c => recurse(c, depth))) return true;
  if (type === 'JSXFragment') return false;
  return node.openingElement?.attributes?.some(
    a => a?.type === 'JSXSpreadAttribute' || recurse(a, depth),
  ) ?? false;
}

// class evaluation invokes computed-key expressions, decorator factories, and the
// `extends` clause at class-eval time. method bodies / instance-field initializers
// execute later (instance construction); static-field initializers and StaticBlock
// bodies execute at class-eval, so they count
const CLASS_FIELD_TYPES = new Set(['ClassProperty', 'PropertyDefinition']);
function classMemberHasSideEffects(member, depth) {
  if (!member) return false;
  if (member.computed && recurse(member.key, depth)) return true;
  if (member.decorators?.some(d => recurse(d, depth))) return true;
  if (CLASS_FIELD_TYPES.has(member.type) && member.static && recurse(member.value, depth)) return true;
  return member.type === 'StaticBlock';
}
function classHasSideEffects(node, depth) {
  if (node.superClass && recurse(node.superClass, depth)) return true;
  if (node.decorators?.some(d => recurse(d, depth))) return true;
  return node.body?.body?.some(member => classMemberHasSideEffects(member, depth)) ?? false;
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
// responsible for short-circuit via captured flag since we always walk the whole tree.
// peels ParenthesizedExpression (oxc preserves; babel strips) so `({x})` patterns aren't
// silently dropped from the binding scan
export function walkPatternIdentifiers(node, visit) {
  if (!node) return;
  if (node.type === 'ParenthesizedExpression') {
    walkPatternIdentifiers(node.expression, visit);
    return;
  }
  switch (node.type) {
    case 'Identifier':
      visit(node);
      break;
    case 'ObjectPattern':
      for (const p of node.properties) {
        // some parsers (estree-toolkit + custom AST shapes) emit `SpreadElement` instead
        // of `RestElement` inside an ObjectPattern. both wrap the rest-binding identifier
        // in `.argument`, so peel symmetrically - missing `SpreadElement` would silently
        // drop the rest binding from the scan and miss-bind the destructure
        if (p.type === 'RestElement' || p.type === 'SpreadElement') walkPatternIdentifiers(p.argument, visit);
        else walkPatternIdentifiers(p.value, visit);
      }
      break;
    case 'ArrayPattern':
      for (const el of node.elements) walkPatternIdentifiers(el, visit);
      break;
    case 'AssignmentPattern':
      walkPatternIdentifiers(node.left, visit);
      break;
    case 'RestElement':
    case 'SpreadElement':
      walkPatternIdentifiers(node.argument, visit);
      break;
    // TS `constructor(public x: number)` parameter-property shorthand. parser wraps the
    // param's identifier in TSParameterProperty (with access modifier on the wrapper);
    // descend into .parameter so the identifier scan recognises the binding
    case 'TSParameterProperty':
      walkPatternIdentifiers(node.parameter, visit);
      break;
  }
}

// minifier-shape detection: `ExpressionStatement > [Paren?] > SequenceExpression > [..., last]`
// where `last` (with optional Paren peel) is `AssignmentExpression` targeting an ObjectPattern
// or ArrayPattern. shape collapses a destructure assignment into a SequenceExpression tail
// (`(0, ({pat} = R));` minified form) which the destructure-emitter gate would otherwise miss.
// returns the SequenceExpression's `expressions` array on match (callers split into per-expr
// statements via adapter-specific mutation), null otherwise. peels both the outer wrapper and
// the last expression's wrapper - oxc preserves ParenthesizedExpression on both slots, babel
// parser drops them, so the peel is required for cross-parser symmetry
export function getMinifierSequenceDestructureExpressions(stmt) {
  if (stmt?.type !== 'ExpressionStatement') return null;
  let expr = stmt.expression;
  while (expr?.type === 'ParenthesizedExpression') expr = expr.expression;
  if (expr?.type !== 'SequenceExpression') return null;
  let last = expr.expressions.at(-1);
  while (last?.type === 'ParenthesizedExpression') last = last.expression;
  if (last?.type !== 'AssignmentExpression') return null;
  const leftType = last.left?.type;
  if (leftType !== 'ObjectPattern' && leftType !== 'ArrayPattern') return null;
  return expr.expressions;
}

// node types whose `body[]` slot hosts a Statement list. Program (top-level), BlockStatement
// (function / loop / try / if-block / catch / arrow-block bodies), StaticBlock (class
// `static {}`), TSModuleBlock (namespace / ambient module bodies)
const STATEMENT_LIST_BODY_HOSTS = new Set([
  'Program',
  'BlockStatement',
  'StaticBlock',
  'TSModuleBlock',
]);

// invoke `visitor(body)` for every Statement-list slot rooted at `rootNode`. structural
// recursion via `isASTNode` filter stays safe against plugin-stamped sidecar keys without
// a hand-curated skip list - new visitor metadata won't poison the walk
export function forEachStatementListBody(rootNode, visitor) {
  function visitListHosts(node) {
    if (!isASTNode(node)) {
      if (Array.isArray(node)) for (const item of node) visitListHosts(item);
      return;
    }
    if (STATEMENT_LIST_BODY_HOSTS.has(node.type) && Array.isArray(node.body)) visitor(node.body);
    for (const key of Object.keys(node)) visitListHosts(node[key]);
  }
  visitListHosts(rootNode);
}
