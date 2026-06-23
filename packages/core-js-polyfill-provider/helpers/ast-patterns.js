import { MAX_DEPTH } from '../resolve-node-type/base.js';

// typed AST node predicate - excludes scalars, SourceLocation objects, and foreign markers
// (Babel `extra`, parent back-refs, per-visitor caches stamped by sibling tools).
// prefer over hardcoded SKIP-keys - new plugins can stamp arbitrary keys, a skip list rots
export const isASTNode = v => v !== null && typeof v === 'object' && typeof v.type === 'string';

// directive-prologue detection ('use strict' etc.). oxc surfaces directives as top-of-body
// ExpressionStatement nodes with `.directive: string` on the statement; babel lifts real
// directives into `Program.directives[]` / block `.directives[]`, so a directive that survives
// in `body[]` is a sibling-plugin synth shape (`'use strict'` re-emitted as a raw statement)
// whose `.directive` marker may sit on the ExpressionStatement OR on the inner StringLiteral /
// Literal - accept either. an empty-string directive (`'';`) IS part of the prologue per the
// spec (any string-literal statement extends it), so a following `'use strict'` is still
// active - a length gate here stopped the prologue scan early and anchored injected imports
// AHEAD of the strict directive
export const isDirectiveStatement = node => node?.type === 'ExpressionStatement'
  && (typeof node.directive === 'string' || typeof node.expression?.directive === 'string');

// indirect-require call: `require('m')`, `require?.('m')` (optional), `require('m').default`
// (MemberExpression tail), `(0, require)('m')` / `((0, require))('m')` (SequenceExpression callee).
// peel the outer wrappers oxc keeps but babel strips FIRST - a top-level optional require `require?.('m')`
// is a `ChainExpression` in oxc, and the member-tail's object may itself be one - else the statement is
// not classified as part of the leading import region and `var _ref;` lands AHEAD of it (import/first).
// shared by both plugins (and entry detection)
export function isRequireCall(expr) {
  let cur = peelSkippableWrappers(expr);
  if (cur?.type === 'MemberExpression' || cur?.type === 'OptionalMemberExpression') cur = peelSkippableWrappers(cur.object);
  if (cur?.type !== 'CallExpression' && cur?.type !== 'OptionalCallExpression') return false;
  let callee = peelSkippableWrappers(cur.callee);
  if (callee?.type === 'SequenceExpression') callee = peelSkippableWrappers(callee.expressions?.at(-1));
  return callee?.type === 'Identifier' && callee.name === 'require';
}

// leading-import-region statement: ImportDeclaration, `export ... from 'mod'` re-export,
// `export * [as ns] from 'mod'`, a top-level `require(...)` ExpressionStatement, or a
// VariableDeclaration with at least one `require()` initializer. re-exports count because the
// module record fetches them before the body runs, so `var _ref;` placed before them would
// trip `import/first`. directive-prologue handling is the CALLER's concern - it differs:
// unplugin's `lastUserImportEnd` skips directives mid-scan, babel folds them into its region check
export function isTopLevelImportLike(stmt) {
  if (stmt?.type === 'ImportDeclaration') return true;
  if (stmt?.type === 'ExportNamedDeclaration' && stmt.source) return true;
  if (stmt?.type === 'ExportAllDeclaration') return true;
  if (stmt?.type === 'ExpressionStatement' && isRequireCall(stmt.expression)) return true;
  if (stmt?.type === 'VariableDeclaration') return stmt.declarations.some(d => isRequireCall(d.init));
  return false;
}

// an initless `var` declaration (`var x;` - every declarator without an init). runtime-hoisted
// regardless of textual position, so the `var _ref;`-anchor scan steps PAST them to keep collecting
// later imports - a sibling-plugin's `var x;` interspersed between two imports must not truncate the
// import region. `kind === 'var'` only: an initless `let` / `const` is TDZ-bound to its position
export function isInitlessVarDecl(stmt) {
  return stmt?.type === 'VariableDeclaration' && stmt.kind === 'var'
    && stmt.declarations.every(d => !d.init);
}

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
// `injectedImportsBreakPrologue`: when the file receives at least one injected module
// import/require, that block lands right after the prologue and is itself a non-directive
// statement - promotion becomes impossible for EVERY removed entry, so no `0;` placeholder
// is ever needed. only a zero-module expansion (modern targets filtering everything out)
// leaves the bare-removal hazard this guard exists for
export function wouldPromoteDirectiveAfterRemoval({
  body, entryIndex, pendingRemovals, hasPriorDirective = false, injectedImportsBreakPrologue = false,
}) {
  if (injectedImportsBreakPrologue) return false;
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
export function resolveBatchDirectivePromotionPolicy({
  body, candidateIndices, hasPriorDirective = false, injectedImportsBreakPrologue = false,
}) {
  const toRemove = [];
  const toReplaceWithNoop = [];
  // seed with every candidate so the first iteration sees them all as queued, then peel each
  // one back in turn: `delete` -> ask wouldPromote (with the rest still pending) -> on miss
  // re-add (so earlier candidates still see this slot as queued-removed)
  const pendingRemovals = new Set(candidateIndices);
  for (let i = candidateIndices.length - 1; i >= 0; i--) {
    const idx = candidateIndices[i];
    pendingRemovals.delete(idx);
    if (wouldPromoteDirectiveAfterRemoval({ body, entryIndex: idx, pendingRemovals, hasPriorDirective, injectedImportsBreakPrologue })) {
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
  // `getEntrySource` detects + REMOVES the whole statement as an entry, so every observable side
  // effect it discards must be recovered here. it reaches the require call through the same wrapper
  // set peeled below (TS as/!/<>/satisfies + paren + chain) AND through an outer SE-free comma
  // sequence (`unwrapParens` peels the tail of `0, (spy(), require)('core-js/...')` to the call).
  // descend that outer sequence the same way, collecting SE-ful prefix elements so `spy()` survives
  const prefix = [];
  let expression = peelSkippableWrappers(stmtNode?.expression);
  while (expression?.type === 'SequenceExpression') {
    for (const e of expression.expressions.slice(0, -1)) if (mayHaveSideEffects(e)) prefix.push(e);
    expression = peelSkippableWrappers(expression.expressions.at(-1));
  }
  // babel models `(spy(), require)?.('core-js/...')` as an OptionalCallExpression; oxc wraps a
  // plain CallExpression in a ChainExpression that peelSkippableWrappers already strips. accept both
  // so the optional indirect-require recovers its prefix on either parser
  if (expression?.type !== 'CallExpression' && expression?.type !== 'OptionalCallExpression') return prefix;
  // the indirect-require callee is itself a `(spy(), require)` SequenceExpression - a TS-wrapped
  // `((spy(), require) as any)('core-js/...')` lands the SE behind a TSAsExpression, so peel the
  // same wrappers, then surface its SE-ful prefix elements (everything but the trailing `require`)
  const callee = peelSkippableWrappers(expression.callee);
  if (callee?.type === 'SequenceExpression' && callee.expressions.length >= 2) {
    for (const e of callee.expressions.slice(0, -1)) if (mayHaveSideEffects(e)) prefix.push(e);
  }
  return prefix;
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

// raw-AST static key extractor: Identifier (non-computed), StringLiteral / ESTree Literal
// (computed), single-quasi TemplateLiteral. null for dynamic shapes. adapter-aware callers
// should route through `adapter.isStringLiteral`. lives here (alongside `singleQuasiString`,
// its only dependency); `class-walk.js` re-exports it so its consumers keep their import path
export function memberKeyName(node) {
  const { property, computed } = node;
  if (!computed) return property?.type === 'Identifier' ? property.name : null;
  // computed key resolves through the same static-string extraction as a property key
  // (string literal under babel `StringLiteral` / oxc `Literal`, or single-quasi template)
  return staticStringKey(property);
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
  if ((type === 'MemberExpression' || type === 'OptionalMemberExpression')
    && parent.property === identifierNode && !parent.computed) return true;
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

// a member-access node in EITHER parser: babel keeps OptionalMemberExpression distinct, while
// estree-toolkit (oxc) folds the optional marker into a MemberExpression under a ChainExpression.
// centralizes the two-type check that every member-receiver / member-write walk repeats so the
// pair stays in lockstep across the cluster
export function isMemberAccessNode(node) {
  return node?.type === 'MemberExpression' || node?.type === 'OptionalMemberExpression';
}

// canonical write-host enumeration: is the member-access at `memberPath` the WRITE TARGET of its
// enclosing host? covers `=` / update / `delete`, every destructuring-pattern slot (ArrayPattern,
// ObjectPattern value, default, rest), and for-of/in heads - shapes that rebind a member without
// appearing as a bare assignment LHS. one source for isDynamicComputedKeyWrite (computed-key alias
// bail) and memberPathWriteViolations (discriminant-narrow invalidation) so the two stay in lockstep
export function isMemberWriteHost(memberPath) {
  if (!memberPath?.node) return false;
  // climb transparent wrappers (TS `as`/`!`/`satisfies`, parens) so a wrapped write target -
  // `(m as any) = v`, `(m) = v` - is recognized: the host's `.left`/`.argument` points at the
  // wrapper node, not the bare member. inverse of `memberWriteTargetPath`'s downward peel; without
  // it a cast on the LHS strands the write and a stale narrow survives (throws on ie:11)
  let target = memberPath;
  while (SKIPPABLE_WRAPPER_TYPES.has(target.parentPath?.node?.type) && target.parentPath.node.expression === target.node) {
    target = target.parentPath;
  }
  const member = target.node;
  const host = target.parentPath?.node;
  if (!host) return false;
  switch (host.type) {
    case 'AssignmentExpression': return host.left === member;
    case 'UpdateExpression': return host.argument === member;
    case 'UnaryExpression': return host.operator === 'delete' && host.argument === member;
    case 'ArrayPattern': return true;
    case 'AssignmentPattern': return host.left === member;
    case 'RestElement': return host.argument === member;
    // a property VALUE is a write only inside a destructuring ObjectPattern (`({ x: m } = v)`);
    // inside an ObjectExpression value (`{ x: m }`) the member is a READ
    case 'ObjectProperty':
    case 'Property':
      return host.value === member && target.parentPath?.parent?.type === 'ObjectPattern';
    case 'ForOfStatement':
    case 'ForInStatement': return host.left === member;
    default: return false;
  }
}

// tracking-free peel of `SKIPPABLE_WRAPPER_TYPES` (TS_EXPR_WRAPPERS + ParenthesizedExpression
// + ChainExpression). used wherever a caller needs the semantically meaningful node and
// doesn't care which wrappers were skipped. babel-plugin's `isCallee`, unplugin's `isCallee`,
// and unplugin's `unwrapNode` share this one wrapper-set, so adding a future transparent
// wrapper updates the single SKIPPABLE_WRAPPER_TYPES constant
export function peelSkippableWrappers(node) {
  while (node && SKIPPABLE_WRAPPER_TYPES.has(node.type)) node = node.expression;
  return node;
}

// memoization peels parens + chain wrappers but deliberately NOT TS wrappers: keeping a TS cast
// in the checked node keeps babel's `_ref` emission aligned with unplugin's source-text handling,
// so both pipelines make the same reuse decision around optional chains. narrower than
// peelSkippableWrappers (which also strips TS)
export function peelMemoizeWrappers(node) {
  while (node?.type === 'ParenthesizedExpression' || node?.type === 'ChainExpression') node = node.expression;
  return node;
}

// a node is safe to evaluate more than once without a memo temp (`_ref`) when, after peeling memo
// wrappers, it is a bare Identifier or `this`. single source for both emitters' "no _ref needed"
// gate (previously a per-emitter predicate + set that had to be hand-kept in sync)
export function isReusableReceiver(node) {
  const inner = peelMemoizeWrappers(node);
  return inner?.type === 'Identifier' || inner?.type === 'ThisExpression';
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

// IIFE-callable shapes: the only function forms that can sit at the callee position of an
// immediately-invoked expression. narrower than FUNCTION_LIKE_NODE_TYPES (declarations /
// methods can't be IIFE callees)
export const FN_NODE_TYPES = new Set([
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

// SE prefix expressions buried along a member chain's object spine (`(e1(), globalThis).self`
// roots, mid-chain SE wrappers, arbitrarily nested), in EVALUATION order (deepest first - the
// innermost prefix runs before outer ones at runtime). pure shape walk: callers re-emit the
// prefixes ahead of whatever replaces the chain so the effects keep running
export function collectBuriedChainSePrefixes(node) {
  const prefixes = [];
  let cur = node;
  while (cur) {
    if (cur.type === 'SequenceExpression' && cur.expressions.length) {
      prefixes.unshift(...cur.expressions.slice(0, -1));
      cur = cur.expressions.at(-1);
    } else if (cur.type === 'ParenthesizedExpression' || cur.type === 'ChainExpression'
      || TRANSPARENT_EXPR_WRAPPER_TYPES.has(cur.type)) {
      cur = cur.expression;
    } else if (cur.type === 'MemberExpression' || cur.type === 'OptionalMemberExpression') {
      cur = cur.object;
    } else break;
  }
  return prefixes;
}

// pragmatic assumption shared by detection and the type resolver: top-level `this` IS the
// global proxy regardless of sourceType - nobody reads properties off the ESM-undefined
// `this` on purpose (such a chain is statically dead there), while script / CommonJS-shaped
// code means the global. `this` inside a non-arrow function or a class body is rebound
export function isTopLevelThisContext(path) {
  for (let current = path?.parentPath; current; current = current.parentPath) {
    const type = current.node?.type;
    if (type === 'ClassBody') return false;
    if (type === 'Program') return true;
    if (type !== 'ArrowFunctionExpression' && FUNCTION_LIKE_NODE_TYPES.has(type)) return false;
  }
  return false;
}

// a function whose every call site is visible in the same expression - the immediately
// invoked callee (possibly behind parens / TS wrappers). caller-lossy parameter emissions
// (body-extract, leaf inline defaults) are sound ONLY here: a declared / exported function's
// callers are invisible to the transform, and mutating its pattern leaves or body changes
// what a caller-supplied argument observably produces
export function isImmediatelyInvokedFunction(fnPath) {
  let callee = fnPath;
  let parent = fnPath.parentPath;
  while (parent?.node && (parent.node.type === 'ParenthesizedExpression' || TS_EXPR_WRAPPERS.has(parent.node.type))) {
    callee = parent;
    parent = parent.parentPath;
  }
  return (parent?.node?.type === 'CallExpression' || parent?.node?.type === 'OptionalCallExpression')
    && parent.node.callee === callee.node;
}

// the path whose node occupies `fnPath`'s param slot on the chain from `path` up to the
// function - null when the chain runs through the body instead. the param slot is where a
// caller-supplied value enters
export function findFunctionParamPath(path, fnPath) {
  const params = fnPath?.node?.params;
  if (!params) return null;
  for (let cur = path; cur?.node && cur.node !== fnPath.node; cur = cur.parentPath) {
    if (params.includes(cur.node)) return cur;
  }
  return null;
}

// composite both destructure dispatches gate caller-lossy emissions on: the binding sits in the
// params of a function whose calls are NOT fully accounted for. accounted for means an
// immediately invoked function (the one call is this expression) OR - via the resolver-bound
// `paramNeverOverridden` scan, the same primitive the type resolver gates default-type
// authoritativeness on - a non-exported, non-escaping function whose every call leaves this
// param slot to its default (nothing exists for a lossy emission to lose)
export function paramsHaveInvisibleCallers(path, { paramNeverOverridden = null } = {}) {
  const fnPath = findEnclosingFunctionLikePath(path);
  if (!fnPath) return false;
  const paramPath = findFunctionParamPath(path, fnPath);
  if (!paramPath) return false;
  if (isImmediatelyInvokedFunction(fnPath)) return false;
  if (paramNeverOverridden?.(paramPath)) return false;
  return true;
}

// walk parentPath chain (inclusive) to the nearest enclosing function-like. used by
// param-destructure body-extract (insert `const x = _polyfill;` at body top) and any
// other transform that needs the binding's owning scope. parser-agnostic - reads
// `node.type` directly so works for both babel-types virtual paths and estree-toolkit
export function findEnclosingFunctionLikePath(path) {
  let cur = path;
  while (cur && !FUNCTION_LIKE_NODE_TYPES.has(cur.node?.type)) cur = cur.parentPath;
  return cur ?? null;
}

// var-scope boundaries: the scope owners a `var` hoists to from any nested block / loop /
// try-catch wrapping. estree-toolkit's `scope.hasBinding` doesn't model this hoist (reports
// false at a sibling lookup for a `var` in a nested block, though the binding is live at
// runtime) whereas babel's tracker does; treating these as boundaries closes the asymmetry.
// TSModuleBlock counts too: a `var` inside `namespace N {}` / `declare global {}` is
// namespace-scoped (a property of the namespace object), so it must NOT escape to an
// enclosing function / program - otherwise the sweep treats it as an outer shadow and
// suppresses the polyfill for the real global used at a site outside the module block
const VAR_SCOPE_OWNER_TYPES = new Set([
  ...FUNCTION_LIKE_NODE_TYPES,
  'StaticBlock',
  'Program',
  'TSModuleBlock',
]);

function isVarScopeBoundary(type) {
  return VAR_SCOPE_OWNER_TYPES.has(type);
}

// the atom of the statement-host lattice below: plain JS brace blocks - a nested `{ ... }` block
// and a class `static { ... }` block. each directly holds its statement list at `.body` and owns a
// lexical scope. every broader set extends this by ADDITION (TS namespace body / unbraced Program),
// so the relationships read without any subtraction
export const RUNTIME_BLOCK_TYPES = new Set([
  'BlockStatement',
  'StaticBlock',
]);

// brace-delimited statement-list blocks: the plain blocks plus the TS namespace body
// (`namespace N { ... }`). a directive before such a `{` block spans its whole body, and a babel
// descendant-visitor reaches these nested statement lists
export const BRACE_STATEMENT_HOST_TYPES = new Set([...RUNTIME_BLOCK_TYPES, 'TSModuleBlock']);

// every node that hosts a statement list directly at `.body`: the brace blocks plus the unbraced
// Program top level. Program / StaticBlock / TSModuleBlock additionally own a var scope; a plain
// BlockStatement only groups statements. functions / methods wrap their list in a BlockStatement at
// `.body.body`, and babel's `File` wraps Program - both folded in by callers where needed, not here
export const STATEMENT_LIST_HOST_TYPES = new Set([...BRACE_STATEMENT_HOST_TYPES, 'Program']);

// statement hosts whose numbered `.body` children are scanned in SOURCE ORDER for sibling / flow
// analysis (a preceding sibling is guaranteed to run before the use site): the plain blocks plus
// Program. the TS namespace body is intentionally excluded - these callers do not scan namespace
// bodies, and widening it here would be a behavior change, not a refactor
export const SOURCE_ORDER_STATEMENT_HOST_TYPES = new Set([...RUNTIME_BLOCK_TYPES, 'Program']);

// for-of / for-in iteration heads ("for-x"): their `left` slot is a per-iteration write target.
// shared by the reassignment scan, the dominance guards, and the write-context detectors below
const FOR_X_STATEMENT_TYPES = new Set(['ForOfStatement', 'ForInStatement']);
export function isForXStatement(node) {
  return FOR_X_STATEMENT_TYPES.has(node?.type);
}

// walk `path`'s ancestor chain (inclusive) and return the first path whose node owns a
// var scope - the boundary a `var` declared anywhere below it hoists to. returns null if
// the chain reaches the root without one (shouldn't happen for an attached node: Program
// is always a boundary). shared by the var-membership walk and the namespace-scope check
function findNearestVarScopeOwner(path) {
  for (let cur = path; cur; cur = cur.parentPath) {
    if (isVarScopeBoundary(cur.node?.type)) return cur;
  }
  return null;
}

// shared var-scope body walk: descend `scopeNode`'s body through arbitrary non-boundary node
// shapes (block / if / loop / switch / try-catch / etc), invoking `onNode(node)` for each. `onNode`
// returns truthy to stop descending that subtree (it hit a var-scope boundary or fully handled the
// node). function-like bodies wrap their statements in a BlockStatement; Program / Block /
// StaticBlock host statements directly at `.body`
function walkVarScope(scopeNode, onNode) {
  function visit(node) {
    if (!isASTNode(node) || onNode(node)) return;
    for (const key of Object.keys(node)) {
      const value = node[key];
      if (Array.isArray(value)) for (const v of value) visit(v);
      else visit(value);
    }
  }
  if (Array.isArray(scopeNode?.body)) for (const stmt of scopeNode.body) visit(stmt);
  else visit(scopeNode?.body);
}

// collect `var` bindings inside `scopeNode`, stopping at nested var-scope boundaries so inner-
// function vars don't leak. returns a Map of var-name -> its VariableDeclarator (first declaration
// wins on redeclaration): membership callers use `.has(name)`, alias-resolution callers read `.init`
function collectScopeVars(scopeNode) {
  const locals = new Map();
  walkVarScope(scopeNode, node => {
    if (node.type === 'VariableDeclaration' && node.kind === 'var') {
      // `declare var X` is tsc-elided - the reference resolves to the global, so the ambient
      // declaration must not register as a hoisted-var shadow that suppresses polyfill emission
      if (node.declare !== true) {
        for (const d of node.declarations ?? []) walkPatternIdentifiers(d.id, id => { if (!locals.has(id.name)) locals.set(id.name, d); });
      }
      return true; // a var declaration opens no nested var-scope to descend
    }
    return isVarScopeBoundary(node.type);
  });
  return locals;
}

// climb `path`'s enclosing var-scope owners (inclusive), calling `visit(owner)` at each and
// returning the first non-undefined result, else undefined. stops AFTER a TSModuleBlock - a
// namespace's bindings don't leak out, and a use outside one doesn't reach in. shared by the
// var-declarator lookup and the sloppy block-function lookup below
function climbVarScopeOwners(path, visit) {
  for (let owner = findNearestVarScopeOwner(path); owner; owner = findNearestVarScopeOwner(owner.parentPath)) {
    const result = visit(owner);
    if (result !== undefined) return result;
    if (owner.node?.type === 'TSModuleBlock') break;
  }
  return undefined;
}

// per-node WeakMap cache (same sibling-mutation staleness constraint as `tsRuntimeBindingsCache`)
const scopeVarsCache = new WeakMap();
function cachedScopeVars(node) {
  let vars = scopeVarsCache.get(node);
  if (!vars) scopeVarsCache.set(node, vars = collectScopeVars(node));
  return vars;
}

// the owner that hoists `name` as a `var` plus its VariableDeclarator (callers read `.init`), or
// null. a `var` hoists to its nearest function / program / static-block owner yet stays visible from
// nested functions below it, so a use in an inner closure keeps climbing when the nearest owner
// doesn't declare the name - estree-toolkit stops at the nearest owner and misses this, babel
// resolves it natively. no param / lexical shadow can intervene: the var-hoist fallback runs only
// when the native estree binding is null, which already proves no param / let / const / class /
// function binds the name on the visible scope chain
function findVarOwnerDeclaring(path, name) {
  return climbVarScopeOwners(path, owner => {
    const declarator = cachedScopeVars(owner.node).get(name);
    return declarator ? { owner, declarator } : undefined;
  }) ?? null;
}

export function findFunctionScopeVarDeclaratorInPath(path, name) {
  return findVarOwnerDeclaring(path, name)?.declarator ?? null;
}

// synthesize a binding for a function-scoped `var` declared in a nested block that estree-toolkit
// fails to hoist to the function scope (`function f(){ if (c) { var G = Array } G.from(...) }`).
// babel hoists natively, so callers reach this only on the estree side after a null native lookup -
// a no-op for babel. shape carries `.node` (declarator) + recomputed violations, the minimum the
// static-receiver walk + reassignment gates read (they fall back to `.node` when there is no `.path`)
export function synthVarHoistBinding(path, name) {
  const declarator = path ? findFunctionScopeVarDeclaratorInPath(path, name) : null;
  if (!declarator) return null;
  return {
    node: declarator,
    kind: 'var',
    constantViolations: collectFunctionScopeVarReassignments(path, name),
    importSource: null,
    polyfillHint: null,
  };
}

// names of block-nested `function f(){}` declarations hoisted to `scopeNode`'s var scope under
// sloppy-mode Annex-B semantics (a block-level function declaration is function-scoped, not
// block-scoped, in non-strict code). reuses `walkVarScope` (descend non-boundary nodes, stop at
// nested var-scope boundaries) but registers FunctionDeclaration ids. presence only: a function has
// no `.init`, so the result must never feed the declarator-reading path
const scopeBlockFunctionsCache = new WeakMap();
function collectScopeBlockFunctions(scopeNode) {
  const names = new Set();
  walkVarScope(scopeNode, node => {
    if (node.type === 'FunctionDeclaration') {
      if (node.id?.name) names.add(node.id.name);
      return true; // a function is a var-scope boundary - register its name, don't descend its body
    }
    return isVarScopeBoundary(node.type);
  });
  return names;
}
function cachedScopeBlockFunctions(node) {
  let names = scopeBlockFunctionsCache.get(node);
  if (!names) scopeBlockFunctionsCache.set(node, names = collectScopeBlockFunctions(node));
  return names;
}

// does any enclosing var-scope owner of `path` carry a sloppy block-hoisted function of `name`?
// `|| undefined` keeps the climb going past a non-matching owner (visit must return undefined to
// continue), and the outer `?? false` normalises "no owner matched" to a boolean
function hasSloppyBlockFunctionInPath(path, name) {
  return climbVarScopeOwners(path, owner => cachedScopeBlockFunctions(owner.node).has(name) || undefined) ?? false;
}

// does `scopeNode`'s function var-scope (descend blocks, stop at nested functions) bind `name` via a
// `var` declarator OR a hoisted FunctionDeclaration? the param-destructure body-extract emits a body-
// top `let <name>` aliasing the destructured parameter; a function-scoped `var <name>` / `function
// <name>(){}` legally REDECLARES a same-named parameter, but `let` + `var`/`function` in one scope is a
// SyntaxError - so the extract bails to the inline-default fallback when this returns true, mirroring
// the existing `paramListReadsName` bail. shared by both plugins' body-extract path
export function functionScopeBindsVarOrFunction(scopeNode, name) {
  return cachedScopeVars(scopeNode).has(name) || cachedScopeBlockFunctions(scopeNode).has(name);
}

// `"use strict"` directive on a function body / Program. babel lifts directives into a
// `.directives` array (Program) or `.body.directives` (function BlockStatement); oxc keeps them
// inline as leading `.directive`-bearing ExpressionStatements - check both shapes
function nodeHasUseStrict(node) {
  const lifted = Array.isArray(node.directives) ? node.directives
    : Array.isArray(node.body?.directives) ? node.body.directives
    : null;
  if (lifted?.some(d => d.value?.value === 'use strict')) return true;
  const body = Array.isArray(node.body) ? node.body : node.body?.body;
  if (Array.isArray(body)) {
    for (const stmt of body) {
      if (!isDirectiveStatement(stmt)) break;
      if (stmt.directive === 'use strict') return true;
    }
  }
  return false;
}

// is the use site at `path` in non-strict (sloppy) code? Annex-B function hoisting applies only
// there. a module is always strict; a class body is always strict; a `"use strict"` on any
// enclosing function or the Program makes the whole subtree strict. walk up - the first strict
// signal wins, else the Program's sourceType decides (script -> sloppy). a detached path with no
// Program ancestor falls through to strict (safe: no Annex-B shadow surfaced)
function isSloppyAtPath(path) {
  for (let cur = path; cur; cur = cur.parentPath) {
    const { node } = cur;
    if (!node) continue;
    const { type } = node;
    if (type === 'ClassDeclaration' || type === 'ClassExpression') return false;
    if ((FUNCTION_LIKE_NODE_TYPES.has(type) || type === 'Program') && nodeHasUseStrict(node)) return false;
    if (type === 'Program') return node.sourceType === 'script';
  }
  return false;
}

// boolean wrapper for callers that only need presence (runtime vs TS-ambient shadow detection;
// complements `findTSRuntimeBindingInPath`). beyond `var` hoists, surfaces sloppy-mode Annex-B
// block-function shadows: a block-nested `function Map(){}` hoists to the function scope in
// non-strict code and shadows the global, but native scope trackers block-scope it and miss the
// shadow -> usage-pure would wrongly substitute the global. gated on genuine sloppy context so
// modules / "use strict" (where the function IS block-scoped) keep resolving `name` to the global
// and usage-global never loses an injection. presence only - never reaches the declarator path
export function findFunctionScopeVarInPath(path, name) {
  if (findFunctionScopeVarDeclaratorInPath(path, name) !== null) return true;
  return isSloppyAtPath(path) && hasSloppyBlockFunctionInPath(path, name);
}

// reassignment sites for a function-scoped `var`, recovering the `constantViolations` set babel's
// native binding records but estree-toolkit's misses for a nested-block-hoisted var (so the shared
// resolver's reassignment guard fires identically on both). resolve the owner that hoists the var
// (climbing for an inner-closure use), then walk it for every write of `name`: plain `name = ...` /
// `name++`, a destructuring assignment (`[name] = e` / `({ x: name } = e)`), a for-of / for-in head,
// and a `var name = <init>` re-declaration other than the binding's own declarator. descend into
// nested scopes that don't re-bind `name` (a closure can reassign the outer var) but stop at ones
// that shadow it - a param / hoisted var, or a block-scoped `let`/`const`/`class`/`function` / catch
// param of the same name is a distinct binding. empty result is falsy-length so the non-reassigned
// common case still resolves. cached per owner node (same staleness contract as `scopeVarsCache`)
const scopeReassignCache = new WeakMap();
// collect every reassignment NODE of `name` within `ownerNode`'s subtree, stopping at nested scopes /
// blocks that shadow `name`. cached per (ownerNode, name). `ownDeclarator` is the binding's own
// declarator (skipped in the `var name = init` redeclaration branch). shared by the var-hoist and the
// cross-boundary-`let` reassignment recovery, which differ only in how they locate `ownerNode`
function collectScopeReassignmentNodes(ownerNode, name, ownDeclarator) {
  let perName = scopeReassignCache.get(ownerNode);
  if (!perName) scopeReassignCache.set(ownerNode, perName = new Map());
  if (perName.has(name)) return perName.get(name);
  const violations = [];
  function bindsName(patternNode) {
    return patternBindsIdentifier(patternNode, id => id.name === name);
  }
  function shadowsName(scopeNode) {
    if ((scopeNode.params ?? []).some(bindsName)) return true;
    return collectScopeVars(scopeNode).has(name);
  }
  // a block-scoped statement re-binding `name`: `let`/`const` declarator, or a class / function
  // declaration
  function stmtRebindsName(stmt) {
    if (stmt.type === 'VariableDeclaration' && stmt.kind !== 'var') return stmt.declarations.some(d => bindsName(d.id));
    return (stmt.type === 'ClassDeclaration' || stmt.type === 'FunctionDeclaration') && stmt.id?.name === name;
  }
  // a nested BLOCK / catch / for-head that re-binds `name` block-scoped shadows the outer var
  // inside it - writes there are to the inner binding, not the var. a for-head `let`/`const`
  // lexically binds `name` PER-LOOP, so head + body writes target that binding (NOT the outer);
  // halt the descent. a `var` head hoists to the function scope (= the outer) and a bare-identifier
  // head assigns the existing outer, so those are NOT shadows and stay recorded as real writes below
  function blockShadowsName(node) {
    if (node.type === 'CatchClause') return !!node.param && bindsName(node.param);
    const forHead = node.type === 'ForOfStatement' || node.type === 'ForInStatement' ? node.left
      : node.type === 'ForStatement' ? node.init : null;
    if (forHead?.type === 'VariableDeclaration' && forHead.kind !== 'var') return forHead.declarations.some(d => bindsName(d.id));
    if (!RUNTIME_BLOCK_TYPES.has(node.type)) return false;
    return (node.body ?? []).some(stmtRebindsName);
  }
  // for-of / for-in head writing `name`: a bare-Identifier / destructuring-pattern target
  // (`for (name of ...)`, `for ([name] of ...)`) or a `var` head (`for (var name in ...)`)
  function forXHeadWritesName(left) {
    if (left?.type === 'VariableDeclaration') return left.declarations.some(d => bindsName(d.id));
    return bindsName(left);
  }
  function visit(node, atOwnerRoot) {
    if (!isASTNode(node)) return;
    if (!atOwnerRoot && ((isVarScopeBoundary(node.type) && shadowsName(node)) || blockShadowsName(node))) return;
    if ((node.type === 'AssignmentExpression' && node.left?.type === 'Identifier' && node.left.name === name)
      || (node.type === 'UpdateExpression' && node.argument?.type === 'Identifier' && node.argument.name === name)
      || (node.type === 'AssignmentExpression'
        && (node.left?.type === 'ArrayPattern' || node.left?.type === 'ObjectPattern') && bindsName(node.left))
      || (isForXStatement(node) && forXHeadWritesName(node.left))) {
      violations.push(node);
    }
    // a `var name = <init>` re-declaration other than the binding's own declarator overwrites the
    // value; a bare `var name;` (no init) keeps it. a same-name `let`/`const` can't co-exist
    if (node.type === 'VariableDeclaration' && node.kind === 'var') {
      for (const d of node.declarations ?? []) {
        if (d !== ownDeclarator && d.init && bindsName(d.id)) violations.push(d);
      }
    }
    for (const key of Object.keys(node)) {
      const value = node[key];
      if (Array.isArray(value)) for (const v of value) visit(v, false);
      else visit(value, false);
    }
  }
  visit(ownerNode, true);
  perName.set(name, violations);
  return violations;
}

// var-hoist reassignment recovery: estree-toolkit block-scopes a `var`, so its constantViolations miss
// a cross-block redeclaration / write. recompute from the AST at the var's function-scope owner
export function collectFunctionScopeVarReassignments(path, name) {
  const found = findVarOwnerDeclaring(path, name);
  if (!found) return [];
  return collectScopeReassignmentNodes(found.owner.node, name, found.declarator);
}

// a `let` declarator is always statement-level, so the first of these hosts above its
// VariableDeclaration is the `let`'s own lexical scope. extends the block atoms with the unbraced
// Program, the loop heads (a for-head `let` scopes to the whole loop), and the switch body's
// single block scope - composed from the lattice primitives, not re-listed
const LET_SCOPE_HOST_TYPES = new Set([
  ...RUNTIME_BLOCK_TYPES,
  ...FOR_X_STATEMENT_TYPES,
  'Program',
  'ForStatement',
  'SwitchStatement',
]);

// cross-boundary `let` reassignment recovery: estree-toolkit omits a `let` reassignment from a
// binding's constantViolations when the use sits in a nested closure (the outer-scope write is not
// observed across the function boundary). recompute by the same AST scan, anchored at the `let`'s OWN
// lexical scope (climb the declarator to its scope host) so a block-scoped `let` is not over-scanned -
// anchoring at the enclosing FUNCTION would let the scan stop at the let's own block as a shadow
export function collectScopeLetReassignments(declaratorPath, name) {
  let scopeNode = null;
  for (let p = declaratorPath?.parentPath; p && !scopeNode; p = p.parentPath) {
    if (LET_SCOPE_HOST_TYPES.has(p.node?.type)) scopeNode = p.node;
  }
  return scopeNode ? collectScopeReassignmentNodes(scopeNode, name, declaratorPath.node) : [];
}

// loop bodies re-run their contents each iteration; a loop's INIT / test / update run at most once
// per entry, so a `for (var M = ...; ;)` init is not a re-run - only the body field is one
const LOOP_BODY_FIELD = {
  ForStatement: 'body',
  ForInStatement: 'body',
  ForOfStatement: 'body',
  WhileStatement: 'body',
  DoWhileStatement: 'body',
};

// does `name`'s function-scoped `var` declarator sit inside a loop BODY (re-run each iteration)?
// a self-ref `var X = X` re-run by a loop reads the local binding (undefined on iteration 1), so it
// must NOT be resolved to the global there - babel bails it natively, and this brings the unplugin
// var-hoist path (which otherwise reads a clean binding) into line. only the loop body counts: a
// `for (var X = ...; ;)` init or a plain `if` runs the declarator at most once per entry
// memoize a `(nodeA, nodeB) -> result` AST walk per file. the outer WeakMap is keyed by nodeA (a fresh
// var-scope owner per file, so the cache is naturally per-file and GC'd with the AST), the inner Map by
// nodeB; null / false results cache too (via `.has`). same sibling-mutation staleness constraint as the
// other per-node caches above. the dominance lookups below re-walked the owner subtree once per (use,
// write) pair without this, going cubic (O(uses * writes * subtree)) on a heavily-reassigned alias (X11)
function memoizeByNodePair(compute) {
  const cache = new WeakMap();
  return function (a, b) {
    let inner = cache.get(a);
    if (!inner) cache.set(a, inner = new Map());
    if (inner.has(b)) return inner.get(b);
    const result = compute(a, b);
    inner.set(b, result);
    return result;
  };
}

// does `target` sit inside a loop BODY within `ownerNode`'s var scope (re-run each iteration)?
// stops at nested var-scope boundaries. shared by the named-declarator check below and the
// usage-pure reachability gate - a use re-run by a loop back-edge can observe a textually-later write
const nodeSitsInLoopBodyWithin = memoizeByNodePair((ownerNode, target) => {
  let result = false;
  function visit(node, inLoopBody) {
    if (result || !isASTNode(node)) return;
    if (node === target) {
      result = inLoopBody;
      return;
    }
    if (node !== ownerNode && isVarScopeBoundary(node.type)) return;
    const loopField = LOOP_BODY_FIELD[node.type];
    for (const key of Object.keys(node)) {
      if (result) return;
      const value = node[key];
      const childInLoopBody = inLoopBody || key === loopField;
      if (Array.isArray(value)) for (const v of value) visit(v, childInLoopBody);
      else if (isASTNode(value)) visit(value, childInLoopBody);
    }
  }
  visit(ownerNode, false);
  return result;
});

export function isVarDeclaratorInLoopBody(path, name) {
  const owner = findNearestVarScopeOwner(path);
  const target = owner && collectScopeVars(owner.node).get(name);
  if (!target) return false;
  return nodeSitsInLoopBodyWithin(owner.node, target);
}

// branches whose body runs only on some control-flow paths. a target nested under one is
// conditional, so it dominates a use only when the use also sits under the SAME branch. the
// recorded guard is the specific branch node (if-consequent / loop body / catch body) so a use in a
// sibling branch (the `else`) isn't contained; switch-case bodies are arrays with no wrapper, so the
// SwitchCase itself is recorded. try-block / catch-body are conditional (a throw can skip them);
// `finally` always runs, so it guards nothing and is absent.
// the EXPRESSION short-circuits (`a && b`, `a || b`, `a ?? b` right operand; `c ? x : y` branches)
// never guard a `var` DECLARATOR (var is statement-only, so they are inert for varInitDominatesUsage)
// but DO guard a REASSIGNMENT - `c && (M = x)` reassigns M only when c is truthy - so
// reassignmentDominatesUsage needs them to avoid treating an expr-guarded conditional reassign as
// dominating. only the conditionally-evaluated operand is a branch: `&&`/`||`/`??` left + `?:` test
// always run, so they are NOT recorded
const CONDITIONAL_BRANCH_FIELDS = {
  IfStatement: ['consequent', 'alternate'],
  ForStatement: ['body'],
  ForInStatement: ['body'],
  ForOfStatement: ['body'],
  WhileStatement: ['body'],
  DoWhileStatement: ['body'],
  SwitchCase: ['consequent'],
  TryStatement: ['block'],
  CatchClause: ['body'],
  LogicalExpression: ['right'],
  ConditionalExpression: ['consequent', 'alternate'],
};

// logical-assignment operators write the LHS only on the short-circuit path (`A ||= x` assigns just
// when A is falsy, `A &&= x` just when truthy, `A ??= x` just when nullish). the write is therefore
// CONDITIONAL like an if-guarded reassign - not an unconditional dominating overwrite. shared with
// VALUE_FLOW_ASSIGN_OPS below (the value-flow set is these plus plain `=`)
const LOGICAL_ASSIGN_OPS = new Set(['||=', '&&=', '??=']);

// is `node` (a reassignment site) a logical-assignment of its binding? babel records the
// AssignmentExpression directly; estree-toolkit records the target Identifier, so resolve the
// enclosing `name <op>= ...` to read its operator
function isLogicalAssignReassignment(node, ownerNode) {
  const assignment = node.type === 'AssignmentExpression' ? node : enclosingValueFlowAssignment(node, ownerNode);
  return !!assignment && LOGICAL_ASSIGN_OPS.has(assignment.operator);
}

// locate `target` in `ownerNode`'s var scope and return the ordered conditional-branch nodes
// guarding it, or null when not found. don't descend past nested var-scope boundaries (`var`
// doesn't hoist across them). array-valued branch fields record the parent node as the guard
const collectVarGuardsToDeclarator = memoizeByNodePair((ownerNode, target) => {
  let result = null;
  function visit(node, guards) {
    if (result !== null || !isASTNode(node)) return;
    if (node === target) {
      // a for-of / for-in HEAD write assigns the loop variable only when the iterable yields at
      // least once; both adapters record the LOOP node itself as the reassignment site (not its
      // `left`), so treat such a loop as its own guard - a use after the loop never sits under it,
      // so the head write doesn't dominate (usage-global keeps resolving the alias, over-inject-safe;
      // usage-pure still bails since the write isn't after the use). a use INSIDE the body is already
      // excluded by nodeDominatesUsage's precedence check (the loop doesn't end before it)
      // a logical-assignment is likewise conditional - record it as its own guard so a use after it
      // (not nested under the short-circuit write) is not treated as dominated by it
      result = (isForXStatement(node) || isLogicalAssignReassignment(node, ownerNode)) ? [...guards, node] : guards;
      return;
    }
    if (node !== ownerNode && isVarScopeBoundary(node.type)) return;
    const branchFields = CONDITIONAL_BRANCH_FIELDS[node.type];
    for (const key of Object.keys(node)) {
      if (result !== null) return;
      const value = node[key];
      const isBranch = branchFields?.includes(key);
      // an array-valued branch (switch-case body) has no wrapper node, so record the parent
      if (Array.isArray(value)) {
        const childGuards = isBranch ? [...guards, node] : guards;
        for (const v of value) visit(v, childGuards);
      } else if (isASTNode(value)) {
        visit(value, isBranch ? [...guards, value] : guards);
      }
    }
  }
  visit(ownerNode, []);
  return result;
});

// the use must sit inside every conditional branch the declarator does, else the assignment can be
// skipped on a path that still reaches the use. an unconditional declarator (no branches) passes
function usageSitsUnderAllBranches(usagePath, ownerNode, guards) {
  if (!guards.length) return true;
  const ancestors = new Set();
  for (let cur = usagePath.parentPath; cur && cur.node !== ownerNode; cur = cur.parentPath) {
    ancestors.add(cur.node);
  }
  return guards.every(branch => ancestors.has(branch));
}

// `a` ends at or before `b` begins (textual order by source positions). a parser that omits
// positions can't be ordered, so the caller passes the `whenUnknown` result that is SAFE for its
// direction (see the two wrappers below)
function endsBeforeStart(a, b, whenUnknown) {
  const aEnd = a?.end;
  const bStart = b?.start;
  if (typeof aEnd !== 'number' || typeof bStart !== 'number') return whenUnknown;
  return aEnd <= bStart;
}

// does `node` end at or before `usagePath` begins? a `var` hoists the declaration but not the
// assignment, so a use before the declarator reads `undefined`; symmetrically a reassignment AFTER
// the use can't have changed the value read there. unknown positions -> true: don't over-bail the
// global-dominance check
function nodePrecedesUsage(node, usagePath) {
  return endsBeforeStart(node, usagePath.node, true);
}

// inverse direction for the usage-pure reachability gate: the write `node` lies textually STRICTLY
// after the read. unknown positions -> false: pure can't prove the write is after the read, so bail
function usagePrecedesNode(usagePath, node) {
  return endsBeforeStart(usagePath.node, node, false);
}

// core single-node domination check: does `node` lie on EVERY control-flow path reaching `usagePath`?
// within the use's own var-scope `owner` it dominates iff the use sits under every conditional branch
// the node does AND the node textually precedes it. when `node` is NOT in that scope (the use sits in
// a NESTED closure), `climb: false` stops there (returns false - the SHALLOW policy: a cross-boundary
// write may not have run by the use), while `climb: true` walks to the enclosing scope holding `node`:
// it dominates only when UNCONDITIONAL there AND it completes before the closure is even defined - so
// the closure cannot observe any pre-`node` value (an init captured from an outer scope, or a
// reassignment that ran before the capturing closure was created). climbing returns null when `node`
// is not found in any enclosing scope, so the caller applies its own default
function nodeDominatesUsage({ node, usagePath, owner, climb, usageNode = null }) {
  const guards = collectVarGuardsToDeclarator(owner.node, node);
  // `usageNode` overrides the textual read position for a multi-hop alias chain: an intermediate hop is
  // read at the prior declarator, not the host use, so a write AFTER that read can't change the captured
  // value. the guard / scope owner stay the host's (the chain lives in one scope)
  const readNode = usageNode ?? usagePath.node;
  if (guards !== null) return usageSitsUnderAllBranches(usagePath, owner.node, guards) && endsBeforeStart(node, readNode, true);
  if (!climb) return false;
  for (let o = findNearestVarScopeOwner(owner.parentPath); o; o = findNearestVarScopeOwner(o.parentPath)) {
    const outer = collectVarGuardsToDeclarator(o.node, node);
    if (outer !== null) return outer.length === 0 && endsBeforeStart(node, owner.node, false);
  }
  return null;
}

// SOUND gate for resolving a function-scoped `var` alias to a global. `var` hoists to the whole
// function, so `if (c) { var M = globalThis } M.Map()` binds M everywhere - but M holds the global
// only when `c` was truthy; usage-pure would rewrite the use to a receiver-less polyfill and mask
// the native TypeError on the c-falsy path. holds iff the declarator DOMINATES the use - via the
// shared `nodeDominatesUsage` with `climb: true`, so an init captured from an OUTER scope by a
// later-defined closure still counts. a declarator not located in any enclosing scope defaults to
// dominating (it is the declaration)
export function varInitDominatesUsage({ declaratorNode, usagePath, kind = null }) {
  // domination is a real question ONLY for hoisted `var` (a conditional `if (c) { var M = ... }`
  // binds everywhere but assigns on one path). a `let` / `const` read before its declarator
  // executes throws natively (TDZ), so a LEGAL use is always dominated - skip the walk. this
  // gate carries the hot-path cost: without it every clean const resolution paid a full
  // owner-subtree scan (O(sites x N) on ordinary files)
  if (kind && kind !== 'var') return true;
  if (!usagePath) return true;
  const owner = findNearestVarScopeOwner(usagePath);
  if (!owner) return true;
  const dominates = nodeDominatesUsage({ node: declaratorNode, usagePath, owner, climb: true });
  return dominates === null ? true : dominates;
}

// does some node in `reassignmentNodes` provably overwrite a `var` / `let` alias on EVERY path
// reaching `usagePath` within the use's OWN var scope (SHALLOW - `climb: false`)? a write beyond that
// boundary is NOT counted: it may not have run by the use, and (for usage-global) bailing the
// init-FOLLOW on a cross-closure write would drop the primary key entirely and under-inject the
// reaching value - the cross-closure dead-init case is instead handled where the init is followed, by
// preferring `reachingReassignmentValueNode`'s value. returns false when no write dominates, letting
// usage-global keep resolving a still-live init (inject-if-maybe-needed). usage-pure bails on any reassignment
export function reassignmentDominatesUsage({ reassignmentNodes, usagePath, usageNode = null }) {
  if (!usagePath || !reassignmentNodes?.length) return false;
  const owner = findNearestVarScopeOwner(usagePath);
  if (!owner) return false;
  // a use re-run by a loop back-edge can observe a textually-EARLIER-but-later-executing write (a
  // `for (;; M = x)` update runs after the body, so the first iteration's body read precedes it). no
  // reassignment provably dominates such a use - keep resolving the init (over-inject-safe). the
  // textual-precedence check below can't see this, so guard it the same way the pure / reaching
  // siblings (`noReassignmentReachesUsage`, `reassignmentValueNodes`) do
  if (nodeSitsInLoopBodyWithin(owner.node, usageNode ?? usagePath.node)) return false;
  return reassignmentNodes.some(node => nodeDominatesUsage({ node, usagePath, owner, climb: false, usageNode }));
}

// per-node counterpart to nodeDominatesUsage for the SUBSTITUTE direction: does reassignment `node`
// lie strictly AFTER `usagePath` within its OWN var-scope `owner`? a node beyond that boundary
// (guards === null - a nested closure) could run before the read, so it does NOT qualify as after
function nodeFollowsUsageInScope({ node, usagePath, owner }) {
  return collectVarGuardsToDeclarator(owner.node, node) !== null && usagePrecedesNode(usagePath, node);
}

// SOUND gate for the SUBSTITUTE (usage-pure) direction: does the declarator-init value provably
// reach `usagePath` UNMODIFIED on every path - i.e. can NO reassignment run before the read? pure
// rewrites to a receiver-less polyfill, so a wrong "yes" masks the native value - resolve only on
// PROOF. holds iff the read runs at most once (not in a loop body, where a back-edge re-runs a
// textually-later write before it) AND every reassignment sits in the read's OWN var-scope owner (a
// write beyond it lives in a closure that may run earlier) textually STRICTLY after the read. no
// reassignment -> the init trivially reaches. mirror of reassignmentDominatesUsage (global bails only
// when the init is provably DEAD; pure resolves only when it is provably the LIVE value)
export function noReassignmentReachesUsage({ reassignmentNodes, usagePath }) {
  if (!usagePath) return false;
  if (!reassignmentNodes?.length) return true;
  const owner = findNearestVarScopeOwner(usagePath);
  if (!owner) return false;
  if (nodeSitsInLoopBodyWithin(owner.node, usagePath.node)) return false;
  return reassignmentNodes.every(node => nodeFollowsUsageInScope({ node, usagePath, owner }));
}

// the RHS of the `=` assignment for a reassignment site, normalized across adapters: babel records
// the AssignmentExpression node directly; estree-toolkit records the target Identifier (the LHS), so
// locate the enclosing `name = <expr>` in `ownerNode` to read its right operand. null for a non-plain
// write (`name++` / `name += x`) whose value isn't a simple replacement
const reassignmentRhs = memoizeByNodePair((node, ownerNode) => {
  if (node.type === 'AssignmentExpression') return node.operator === '=' ? node.right : null;
  if (node.type !== 'Identifier') return null;
  let found = null;
  function visit(n) {
    if (found || !isASTNode(n)) return;
    if (n.type === 'AssignmentExpression' && n.operator === '=' && n.left === node) {
      found = n.right;
      return;
    }
    for (const key of Object.keys(n)) {
      if (found) return;
      const value = n[key];
      if (Array.isArray(value)) for (const v of value) visit(v);
      else visit(value);
    }
  }
  visit(ownerNode);
  return found;
});

// reaching-definition VALUE node of a reassigned variable at `usagePath`: the RHS of the last
// assignment textually before the use, when that value is unambiguous - the last before-use write
// runs UNCONDITIONALLY (it overwrites every earlier write) and the use runs at most once (not in a
// loop body, where a back-edge could expose a later write). null when the value is flow-dependent (a
// conditional / nested-closure / non-plain `=` write reaches the use). consulted AFTER the declarator-
// init follow bails on the reassignment: the init is dead, so this recovers the live value the use
// actually sees (`let K = 'from'; K = 'of'; Array[K]()` -> the `'of'` node). caller resolves the
// returned node (a literal / concat for a computed key)
// pattern-aware single-value variant of `reassignmentRhs` for the reaching-definition
// recovery: a pattern write (`[A] = [Iterator]`) pairs to exactly ONE unambiguous value;
// a slot default (`[A = X] = [..]`) may or may not apply at runtime -> ambiguous -> null
function reassignmentRhsForBinding(node, ownerNode, bindingName, ctx) {
  // pattern LHS first: the plain helper returns the WHOLE RHS for any `=` without inspecting
  // the target shape, so `[K] = ['of']` would flow the array literal instead of the slot value
  let assignment = null;
  if (node.type === 'AssignmentExpression') assignment = node.operator === '=' ? node : null;
  else if (node.type === 'Identifier') {
    const found = enclosingValueFlowAssignment(node, ownerNode);
    assignment = found?.operator === '=' ? found : null;
  }
  const left = assignment?.left;
  if (left?.type === 'ArrayPattern' || left?.type === 'ObjectPattern') {
    if (!bindingName) return null;
    const values = patternSlotValues(left, assignment.right, bindingName, ctx);
    return values.length === 1 && !patternSlotHasDefault(left, bindingName) ? values[0] : null;
  }
  return reassignmentRhs(node, ownerNode);
}

// does the binding `name` reach through a slot default (`[A = X]` / `{ A = X }`), at the top level
// OR nested (`{ k: { A } = X }`, `{ k: { A = X } }`)? a default makes the value ambiguous
// (default-or-runtime), so the reaching-definition recovery must bail rather than fold the default's
// value - folding it silently mis-narrows `name` when the runtime slot is present (a WRONG result)
function patternSlotHasDefault(pattern, name) {
  return patternBindsNameUnderDefault(pattern, name, false);
}
function patternBindsNameUnderDefault(node, name, underDefault) {
  switch (node?.type) {
    case 'Identifier': return underDefault && node.name === name;
    case 'AssignmentPattern': return patternBindsNameUnderDefault(node.left, name, true);
    case 'RestElement':
    case 'SpreadElement': return patternBindsNameUnderDefault(node.argument, name, underDefault);
    case 'ArrayPattern': return node.elements.some(el => patternBindsNameUnderDefault(el, name, underDefault));
    case 'ObjectPattern': return node.properties.some(prop => patternBindsNameUnderDefault(
      prop.type === 'RestElement' || prop.type === 'SpreadElement' ? prop.argument : prop.value, name, underDefault));
    default: return false;
  }
}

export function reachingReassignmentValueNode({ binding, usagePath, ctx = null }) {
  if (!usagePath) return null;
  const owner = findNearestVarScopeOwner(usagePath);
  if (!owner) return null;
  if (nodeSitsInLoopBodyWithin(owner.node, usagePath.node)) return null;
  const bindingName = binding.node?.id?.type === 'Identifier' ? binding.node.id.name : null;
  const before = reassignmentNodesBeyondDeclarator(binding).filter(node => nodePrecedesUsage(node, usagePath));
  if (!before.length) return null;
  // SAME-SCOPE: every before-use write is a plain `name = <expr>` in the read's own var-scope. the
  // textually-last one overwrites every earlier write - it is the reaching definition only if it ALWAYS
  // runs (unconditional: no guards); a conditional last write leaves the value ambiguous
  if (before.every(node => reassignmentRhsForBinding(node, owner.node, bindingName, ctx) !== null
      && collectVarGuardsToDeclarator(owner.node, node) !== null)) {
    const last = before.reduce((a, b) => b.start > a.start ? b : a);
    if (collectVarGuardsToDeclarator(owner.node, last).length) return null;
    return reassignmentRhsForBinding(last, owner.node, bindingName, ctx);
  }
  // CLOSURE: the use sits in a nested closure, so the before-writes live in an enclosing scope. the
  // declarator-init (and earlier writes) are dead once an UNCONDITIONAL write completes before the
  // closure is even defined - the closure cannot observe them (`let K='of'; K='from'; ()=>Array[K]`).
  // the reaching value is the textually-last such dominating write. a non-dominating set (conditional /
  // closure-defined-before-write) yields none -> null, keeping the still-live init (over-inject-safe).
  // reassignment nodes are `AssignmentExpression`s here (babel + the estree adapter's let/var recompute),
  // so `reassignmentRhs` reads `.right` directly without the declarator's scope; a non-plain write -> null
  const dominating = before.filter(node => nodeDominatesUsage({ node, usagePath, owner, climb: true }) === true);
  if (!dominating.length) return null;
  const last = dominating.reduce((a, b) => b.start > a.start ? b : a);
  return reassignmentRhsForBinding(last, owner.node, bindingName, ctx);
}

// every plain-`=` reassignment RHS value node of a `var` / `let` alias that can REACH `usagePath` -
// the usage-global UNION source. a conditionally reassigned receiver / computed-key (`if (c) M =
// Array`) can hold any of these at the use, and over-inject-safe global mode emits a polyfill for
// each (the declarator-init is the caller's primary candidate, resolved separately). a write
// strictly AFTER the use can't change the value read there (`Array[K](); K = 'of'` still reads
// 'from'), so it is excluded - unless the use sits in a loop body whose back-edge re-runs it after
// the write. skips non-plain writes (`x++`, `x += y`, for-x head) whose value isn't a simple
// replacement, and the loop-reinit declarator-self. the use's own var-scope owner locates each
// `name = <expr>` for adapters that record the LHS Identifier
export function reassignmentValueNodes({ binding, usagePath, name = null, ctx = null }) {
  if (!usagePath || !binding?.constantViolations?.length) return [];
  const owner = findNearestVarScopeOwner(usagePath);
  if (!owner) return [];
  // adapter wrappers do not all surface the bound identifier - callers that know the alias
  // name pass it explicitly (needed only for pattern-LHS pairing)
  const bindingName = name ?? binding.identifier?.name ?? binding.path?.node?.id?.name ?? null;
  const useInLoop = nodeSitsInLoopBodyWithin(owner.node, usagePath.node);
  const out = [];
  for (const node of reassignmentNodesBeyondDeclarator(binding)) {
    if (!useInLoop && usagePrecedesNode(usagePath, node)) continue;
    out.push(...reassignmentValueNodesAt(node, owner.node, bindingName, ctx));
  }
  return out;
}

// assignment operators that flow the RHS into the LHS binding as a POSSIBLE value: plain `=`
// plus the logical forms (`A ||= Map` makes Map reachable). compound arithmetic (`+=`) and
// updates produce derived values, not replacements, and stay out
const VALUE_FLOW_ASSIGN_OPS = new Set(['=', ...LOGICAL_ASSIGN_OPS]);

// the pattern slot's POSSIBLE values for the binding named `name`: the positionally / key-
// paired RHS value plus the slot's own default (either may be live at runtime). a dynamic
// RHS or slot contributes nothing
// true when a SpreadElement sits at OR before `index` in a positional list (array elements or call
// args). a leading / at-slot spread shifts every later position, so positional narrowing past it is
// unsound - callers bail. accepts element/arg PATHS (read `.node`) or raw nodes. single source for
// the array-literal-element and call-arg spread guards repeated across the resolvers
export function spreadAtOrBefore(list, index) {
  for (let i = 0; i <= index && i < (list?.length ?? 0); i++) {
    if ((list[i]?.node ?? list[i])?.type === 'SpreadElement') return true;
  }
  return false;
}

// find the LAST own data property (`Property` / `ObjectProperty`) satisfying `matches` in an
// ObjectExpression's `properties` array, scanning backward so duplicate keys resolve last-wins.
// returns null when a SpreadElement sits AFTER a candidate (it could inject / override the key, so
// the literal value is not authoritative) or when nothing matches. single source for the "object
// key value, bail on an overriding spread" rule shared by patternSlotValues / resolveNestedReceiver
// / walkStaticReceiverTerminal (the node-side mirror of findObjectLiteralKey's spread bail)
export function findObjectKeyBeforeSpread(properties, matches) {
  for (let i = (properties?.length ?? 0) - 1; i >= 0; i--) {
    const prop = properties[i];
    if (prop?.type === 'SpreadElement') return null;
    if ((prop?.type === 'Property' || prop?.type === 'ObjectProperty') && matches(prop)) return prop;
  }
  return null;
}

// follow a const-bound identifier to its literal init (`const arr = [Map]` -> the ArrayExpression,
// `const src = { from: f }` -> the ObjectExpression) so a variable-sourced literal resolves like an
// inline one. a const aliased to another const (`const src = base; const base = { from: f }`) follows
// the whole chain. only an UNREASSIGNED binding's init is authoritative - a reassigned binding or a
// non-literal init passes the ORIGINAL node through unchanged. ctx: `{ scope, adapter, path }`; the
// depth bound stops a const cycle (`const a = b; const b = a` is a TDZ error anyway)
export function followConstLiteralAlias(node, ctx) {
  let cur = node;
  for (let depth = 0; depth <= 16; depth++) {
    if (!ctx || cur?.type !== 'Identifier' || !ctx.adapter.hasBinding(ctx.scope, cur.name, ctx.path)) break;
    const binding = ctx.adapter.getBinding(ctx.scope, cur.name, ctx.path);
    if (binding?.constantViolations?.length) break;
    const init = binding?.path?.node?.init ?? binding?.node?.init;
    if (init?.type === 'ArrayExpression' || init?.type === 'ObjectExpression') return init;
    if (init?.type !== 'Identifier') break;
    cur = init;
  }
  return node;
}

// `ctx` (optional `{ scope, adapter, path, resolveKey }`) makes the pairing binding-aware: it
// follows a const-identifier rhs to its literal init and resolves computed keys through the read-
// side canon. ctx-less callers keep the node-only behaviour (literal rhs, static-name keys)
export function patternSlotValues(pattern, rhs, name, ctx) {
  const out = [];
  const slotFor = target => target?.type === 'AssignmentPattern' ? target.left : target;
  // a const-identifier rhs bound to a literal (`const arr = [Map]; [A] = arr`) - follow it so the
  // pairing sees the underlying array / object, like the direct-literal form
  rhs = followConstLiteralAlias(rhs, ctx);
  // a computed property key (`{ [k]: A }`) resolves through the read-side key canon when a ctx is
  // supplied; the binding-blind static-name fallback covers literal keys for ctx-less callers
  const propKey = prop => ctx?.resolveKey
    ? ctx.resolveKey({ node: prop.key, computed: prop.computed, scope: ctx.scope, adapter: ctx.adapter, path: ctx.path })
    : propertyKeyName(prop);
  // a nested pattern slot (`[[M]]` / `{ x: [M] }`) pairs against the slot's RHS positionally /
  // by key - recurse so a binding bound through arbitrary nesting still surfaces its value union;
  // the slot's own default is an alternative RHS the nested bindings may pair against instead
  const descend = (slot, element, pairedRhs) => {
    if (slot?.type !== 'ArrayPattern' && slot?.type !== 'ObjectPattern') return false;
    if (pairedRhs) out.push(...patternSlotValues(slot, pairedRhs, name, ctx));
    if (element.type === 'AssignmentPattern') out.push(...patternSlotValues(slot, element.right, name, ctx));
    return true;
  };
  if (pattern?.type === 'ArrayPattern') {
    for (let i = 0; i < pattern.elements.length; i++) {
      const element = pattern.elements[i];
      const slot = slotFor(element);
      // a spread at or before slot i shifts every later position, so `rhs.elements[i]` is no longer
      // the value that lands in slot i - not a reliable narrow source, skip it
      const paired = rhs?.type === 'ArrayExpression' && !spreadAtOrBefore(rhs.elements, i) ? rhs.elements[i] : null;
      if (descend(slot, element, paired)) continue;
      if (slot?.type !== 'Identifier' || slot.name !== name) continue;
      if (element.type === 'AssignmentPattern') out.push(element.right);
      if (paired) out.push(paired);
    }
  } else if (pattern?.type === 'ObjectPattern') {
    for (const prop of pattern.properties) {
      if (prop.type !== 'Property' && prop.type !== 'ObjectProperty') continue;
      const slot = slotFor(prop.value);
      const key = propKey(prop);
      // last matching key wins, but a trailing spread could override it -> bail (canonical helper)
      const paired = key !== null && rhs?.type === 'ObjectExpression'
        ? findObjectKeyBeforeSpread(rhs.properties, rp => propKey(rp) === key)?.value ?? null : null;
      if (descend(slot, prop.value, paired)) continue;
      if (slot?.type !== 'Identifier' || slot.name !== name) continue;
      if (prop.value.type === 'AssignmentPattern') out.push(prop.value.right);
      if (paired) out.push(paired);
    }
  }
  return out;
}

// every POSSIBLE value a reassignment site flows into the binding: a value-flow assignment's
// RHS for a plain Identifier LHS, the paired slot values (incl. defaults) for a pattern LHS
function reassignmentValueNodesAt(node, ownerNode, bindingName, ctx) {
  if (node.type === 'AssignmentExpression') {
    if (!VALUE_FLOW_ASSIGN_OPS.has(node.operator)) return [];
    if (node.left?.type === 'Identifier') return [node.right];
    return bindingName ? patternSlotValues(node.left, node.right, bindingName, ctx) : [];
  }
  if (node.type !== 'Identifier') return [];
  const assignment = enclosingValueFlowAssignment(node, ownerNode);
  if (!assignment) return [];
  if (assignment.left === node) return [assignment.right];
  return patternSlotValues(assignment.left, assignment.right, node.name, ctx);
}

// estree-toolkit records the target Identifier - locate the enclosing value-flow assignment
// whose LHS is (or contains, for patterns) this identifier. memoized by (identifier, owner):
// the same alias resolves at many usage sites and each re-enumeration would otherwise re-walk
// the whole owner subtree
const enclosingValueFlowAssignment = memoizeByNodePair((node, ownerNode) => {
  let found = null;
  function visit(n) {
    if (found || !isASTNode(n)) return;
    if (n.type === 'AssignmentExpression' && VALUE_FLOW_ASSIGN_OPS.has(n.operator)
      && (n.left === node || ((n.left?.type === 'ArrayPattern' || n.left?.type === 'ObjectPattern')
        && patternBindsIdentifier(n.left, id => id === node)))) {
      found = n;
      return;
    }
    for (const key of Object.keys(n)) {
      if (found) return;
      const value = n[key];
      if (Array.isArray(value)) for (const v of value) visit(v);
      else visit(value);
    }
  }
  visit(ownerNode);
  return found;
});

// a constantViolation entry is a babel NodePath (carries `.node`) from the babel adapter but a raw
// node from the unplugin var-hoist synthetic binding - normalize to the underlying node
function violationNode(violation) {
  return violation.node ?? violation;
}

// the `var name = X` re-declaration NODES sitting textually BETWEEN the type-resolver `binding`'s
// declarator and the use. estree-toolkit block-scopes a `var`, so `scope.getBinding` may surface a
// declarator whose init was overwritten by one of these (it records none as a constantViolation;
// babel hoists correctly and records them all). a non-empty result means the declarator init no
// longer describes the receiver at the use. shared by the staleness predicate and the reaching-redecl
// narrow so both bound the gap identically; only augments the estree var-hoist gap (babel: complete)
export function staleVarRedeclNodes(binding, usagePath, name) {
  const declStart = binding?.path?.node?.start;
  const useStart = usagePath?.node?.start;
  if (typeof declStart !== 'number' || typeof useStart !== 'number') return [];
  return collectFunctionScopeVarReassignments(usagePath, name)
    .map(violationNode)
    .filter(node => { const { start } = node; return typeof start === 'number' && start > declStart && start < useStart; });
}

// does a stale `var name = X` re-declaration sit between `binding`'s declarator and `usagePath`?
export function varInitStaleByRedecl(binding, usagePath, name) {
  return staleVarRedeclNodes(binding, usagePath, name).length > 0;
}

// a violation node equal to the binding's own declarator is a loop re-init: babel models the
// per-iteration re-run of `var x = init` as a write, but the init is fixed so it can't change what
// the alias resolves to - only a write at a DIFFERENT node is a real reassignment. mirrors the
// unplugin var-hoist scan (which never records declarators), so a use after the in-body assignment
// of `while (c) { var M = globalThis; M.Array.from(...) }` resolves on both plugins
export function isReassignedBeyondDeclarator(binding) {
  return !!binding.constantViolations?.some(v => violationNode(v) !== binding.node);
}

// a body-extract alias binding whose ONLY write is the aliasing destructure itself is clean: a
// declarator-form destructure (`const { x } = Source`) leaves no separate write, the assignment form
// (`let x; ({ x } = Source)`) leaves exactly one and has no declarator init. more writes, or a write
// alongside an init, are a real reassignment whose value may no longer be the static. count + init is
// parser-agnostic - it never inspects whether the write node is the assignment (babel) or the bound
// identifier (estree), so babel and unplugin make the same poison decision for identical source
export function isCleanDestructureAliasBinding(binding) {
  const writes = binding?.constantViolations?.length ?? 0;
  return writes === 0 || (writes === 1 && !binding.path?.node?.init);
}

// the real reassignment site nodes (every violation other than the loop-reinit declarator-self).
// estree-toolkit records a for-x head's per-iteration rebind as a violation of the head's OWN
// binding via its id node - that is the declaration itself, not a reassignment, and counting it
// sent every `for (const k in ...)` body read through the flow-sensitive walks
function reassignmentNodesBeyondDeclarator(binding) {
  return binding.constantViolations.map(violationNode)
    .filter(node => node !== binding.node && node !== binding.node?.id);
}

// shared method-aware reassignment-bail decision for a resolver that has already found
// `binding.constantViolations?.length` truthy: should it still bail? both usage methods are now
// flow-sensitive, with OPPOSITE proof obligations matching their injection bias:
//   - usage-global injects a side-effect import (inject-if-maybe-needed, over-inject-safe), so it
//     keeps resolving UNLESS a reassignment provably DOMINATES the use (declarator-init dead).
//   - usage-pure rewrites the reference to a receiver-less polyfill (wrong-substitution-unsafe), so
//     it resolves ONLY when NO reassignment can reach the use (init provably the live value) -
//     leaving a genuinely ambiguous `c && (P = other); P.x()` to bail.
// the type-resolver (narrowing, whose binding adapter carries no `.method`) and entry keep the
// conservative flat bail. both branches exclude the loop-reinit declarator-self via
// reassignmentNodesBeyondDeclarator
export function reassignBailApplies({ binding, adapter, path, usageNode = null }) {
  const method = adapter?.method;
  if (method !== 'usage-global' && method !== 'usage-pure') return true;
  const reassignmentNodes = reassignmentNodesBeyondDeclarator(binding);
  // usage-global threads `usageNode` (a multi-hop alias hop's read site) so a write after that read
  // does not dominate; usage-pure keeps the flat reach check (bail-safe - a possibly-reaching write
  // already declines resolution, so the read-site refinement is unnecessary there)
  if (method === 'usage-global') return reassignmentDominatesUsage({ reassignmentNodes, usagePath: path, usageNode });
  return !noReassignmentReachesUsage({ reassignmentNodes, usagePath: path });
}

// for the sibling resolvers that need a flow-sensitive reassignment check (not a flat
// `binding.constantViolations?.length`): returns whether the reassignment should block resolution.
// false when there is no reassignment;
// otherwise delegates to the method-aware `reassignBailApplies`. (resolveVariableBindingToGlobal
// uses isReassignedBeyondDeclarator + reassignBailApplies instead - it excludes the loop-reinit
// declarator-self for BOTH methods, where these sites keep the conservative flat bail off-global)
export function reassignmentBlocksGlobalResolve({ binding, adapter, path, usageNode = null }) {
  return !!binding.constantViolations?.length && reassignBailApplies({ binding, adapter, path, usageNode });
}

// if this native scope binding is declared DIRECTLY inside a namespace / declare-global block
// (a TSModuleBlock - `namespace N { ... }` / `declare global { ... }`), return that block node;
// else null. estree-toolkit's scope tracker over-hoists EVERY such binding - var/let/const, class,
// function - to the enclosing function / program scope, so its `scope.hasBinding` falsely reports a
// shadow for a use-site OUTSIDE the namespace body. callers re-validate position so the
// namespace-local binding only shadows references that actually sit inside the block. requires the
// binding's `path` to expose `parentPath` (estree-toolkit native bindings do)
export function namespaceScopedBindingBlock(binding) {
  const decl = binding?.path;
  if (!decl?.parentPath) return null;
  // start ABOVE the declaration so we classify the scope that CONTAINS it: its nearest enclosing
  // var-scope owner is the TSModuleBlock only when the binding is declared in the namespace body
  // (a function-scoped declaration resolves to a function-like / Program / StaticBlock owner)
  const owner = findNearestVarScopeOwner(decl.parentPath);
  return owner?.node.type === 'TSModuleBlock' ? owner.node : null;
}

// resolve which raw position in `args` holds the effective argument at `index`, expanding `...[lit]`
// spreads of inline array literals. returns { argIndex, elementIndex } (elementIndex < 0 for a
// top-level arg, else the position WITHIN the spread array) or null when undecidable: a non-inline-
// array spread, OR a NESTED spread inside the inline array (`...[a, ...rest]`) - either makes the
// expanded length variadic at compile time, so a later positional can't be statically located.
// shared by the node lifter (`resolveCallArgument`) and the babel synth-swap path so they can't drift
export function resolveCallArgumentCoords(args, index) {
  let effective = 0;
  for (let argIndex = 0; argIndex < args.length; argIndex++) {
    const arg = args[argIndex];
    if (arg?.type === 'SpreadElement') {
      if (arg.argument?.type !== 'ArrayExpression') return null;
      const { elements } = arg.argument;
      for (let elementIndex = 0; elementIndex < elements.length; elementIndex++) {
        if (elements[elementIndex]?.type === 'SpreadElement') return null;
        if (effective === index) return { argIndex, elementIndex };
        effective++;
      }
      continue;
    }
    if (effective === index) return { argIndex, elementIndex: -1 };
    effective++;
  }
  return null;
}

// resolve the argument NODE at `index` in a call's `arguments` list (see resolveCallArgumentCoords)
export function resolveCallArgument(args, index) {
  const coords = resolveCallArgumentCoords(args, index);
  if (!coords) return null;
  return coords.elementIndex < 0 ? args[coords.argIndex] : args[coords.argIndex].argument.elements[coords.elementIndex];
}

// effective argument count after expanding inline-array spreads (`...[a, b, c]` -> 3).
// returns null when undecidable: a non-inline-array spread, or a NESTED spread inside the inline
// array (`...[a, ...rest]`) whose own length is variadic - same bail as resolveCallArgumentCoords,
// so counting and lifting agree. used by IIFE-identity callers to validate `params.length ===
// effective args.length` symmetric with `resolveCallArgument`'s expansion semantics
function effectiveArgsLength(args) {
  let length = 0;
  for (const arg of args) {
    if (arg?.type === 'SpreadElement') {
      if (arg.argument?.type !== 'ArrayExpression') return null;
      const elements = arg.argument.elements ?? [];
      if (elements.some(el => el?.type === 'SpreadElement')) return null;
      length += elements.length;
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

// walk up from an ObjectPattern path through Property / transparent (AssignmentPattern default,
// single-element ArrayPattern) / multi-element ArrayPattern wrappers to the host VariableDeclarator.
// returns { declarator, needsResidualExtraction } or null when the chain doesn't bottom out at a
// declarator. parser-agnostic (reads `.parentPath` / `.node`, tolerates babel `ObjectProperty` +
// estree `Property`). residual extraction is REQUIRED exactly when the cascade flatten cannot
// take the declarator AND no other route exists: a multi-element ArrayPattern (sibling / hole
// bindings would be lost) OR a rest sibling under an ArrayPattern wrapper of ANY arity (the
// cascade bails on rest, and the unwrapped-rest route never sees array-wrapped shapes - bailing
// here left the static native). unwrapped rest-free / single-element rest-free shapes flatten
// via the cascade instead - the leaner emission
export function findArrayWrappedDestructureHost(objectPatternPath) {
  let cur = objectPatternPath;
  const hasRestSibling = !!objectPatternPath?.node?.properties?.some(
    prop => prop.type === 'RestElement' || prop.type === 'SpreadElement');
  let needsResidualExtraction = false;
  for (;;) {
    const parent = cur?.parentPath;
    const node = parent?.node;
    if (!node) return null;
    if (node.type === 'ArrayPattern') {
      if (node.elements.length > 1 || hasRestSibling) needsResidualExtraction = true;
      cur = parent;
    } else if (node.type === 'AssignmentPattern' && node.left === cur.node) {
      cur = parent;
    } else if (node.type === 'Property' || node.type === 'ObjectProperty') {
      cur = parent.parentPath;
    } else if (node.type === 'VariableDeclarator') {
      // for-init hosts cannot take a preceding extraction statement (the loop header forbids
      // it: babel's insert crashed on scope re-registration, unplugin's text insert produced
      // two `const` statements inside the parens) - route them to the cascade flatten, whose
      // sibling-sink machinery already handles loop headers
      const declarationNode = parent.parentPath?.node;
      const isForInit = declarationNode?.type === 'VariableDeclaration'
        && parent.parentPath.parentPath?.node?.type === 'ForStatement'
        && parent.parentPath.parentPath.node.init === declarationNode;
      return { declarator: parent, needsResidualExtraction: needsResidualExtraction && !isForInit };
    } else return null;
  }
}

// receiver-shaped expression node: a bare Identifier or a (possibly optional) member chain -
// the shapes synth-swap / fallback-collapse / init classification accept as a static receiver.
// covers both parser worlds: babel uses the OptionalMemberExpression node type, estree marks
// `optional` on a MemberExpression under a ChainExpression (peeled before this check)
export function isReceiverShapedNode(node) {
  const type = node?.type;
  return type === 'Identifier' || type === 'MemberExpression' || type === 'OptionalMemberExpression';
}

// chain assignment `foo = X` / `obj.foo = X` evaluates to `X` at runtime - peel through
// these to find the destructure receiver. peel only `=` with Identifier or MemberExpression
// LHS:
//  - compound `+=` / `||=` produce arithmetic / logical results, not constructor candidates
//  - destructure-LHS `{from: b} = X` is an inner destructure assignment that gets rewritten
//    independently; peeling through it would race with that rewrite
export function isChainAssignment(node) {
  return node?.type === 'AssignmentExpression' && node.operator === '=' && isReceiverShapedNode(node.left);
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
  // the descriptor's paramIndex counts EXPANDED positions - delegate the inline-array spread
  // expansion to `resolveCallArgument` (the canonical semantics) and only LOCATE the resolved
  // node's path here; raw `arguments[paramIndex]` indexed past the single SpreadElement and bailed
  const target = resolveCallArgument(desc.callPath.node.arguments, desc.paramIndex);
  if (!target) return null;
  for (const argPath of desc.callPath.get('arguments')) {
    if (argPath.node === target) return argPath;
    if (argPath.node?.type === 'SpreadElement' && argPath.node.argument?.type === 'ArrayExpression') {
      const index = argPath.node.argument.elements.indexOf(target);
      if (index !== -1) return argPath.get('argument').get('elements')[index];
    }
  }
  return null;
}

// peel transparent expression wrappers up from `startPath` toward statement context.
// uses the public `TRANSPARENT_EXPR_WRAPPER_TYPES` constant (TS expr wrappers + oxc parens)
// plus SequenceExpression-tail (transparent only when the inner is the SE's last expr -
// mid-SE peel would change observable value, since SE returns the tail's value).
// `onSequencePrefix(exprs)` (optional) is invoked with each SequenceExpression's leading
// expressions (in walk order) so callers that need to re-emit them as side-effect siblings
// can collect them via the callback. returns the first non-transparent ancestor path
// (the path where peeling stopped), or null when the walk runs off the top of the tree
function peelTransparentExprWrappers(startPath, onSequencePrefix) {
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
    // walker traverses inner -> outer SE wrappers, but source / ECMA SE evaluation order
    // is outer -> inner. unshift each level's prefix so the array reads outer-first:
    // `(outer_a, (inner_b, AE))` -> [outer_a, inner_b] matches `outer_a; inner_b;` emit
    sequencePrefix.unshift(...exprs);
  });
  return ctx?.node?.type === 'ExpressionStatement' ? { exprStmt: ctx, sequencePrefix } : null;
}

// parent types whose `.left` slot is a write target: bare `=` AssignmentExpression,
// default-bearing AssignmentPattern, for-of / for-in iteration head. compound `+=` and
// for-await-of fall under separate branches (covered in `isMemberMutationContext`).
// for-await-of shares the ForOfStatement type with `await: true` flag - the predicate
// captures it implicitly via the type check
const WRITE_LEFT_SLOT_TYPES = new Set(['AssignmentPattern', ...FOR_X_STATEMENT_TYPES]);

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
export function walkAstChildren(node, visit) {
  if (!node || typeof node !== 'object') return;
  for (const key of Object.keys(node)) {
    const value = node[key];
    if (Array.isArray(value)) {
      for (const el of value) if (isASTNode(el)) visit(el);
    } else if (isASTNode(value)) visit(value);
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
export function staticStringKey(node) {
  if (node?.type === 'StringLiteral') return node.value;
  if (node?.type === 'Literal' && typeof node.value === 'string') return node.value;
  // single-quasi template key (`Object.defineProperty(Array, `from`, d)`) is a static string too
  return singleQuasiString(node);
}

// a computed key that is a (paren-wrapped) SequenceExpression with a static-string TAIL
// (`[(eff(), 'from')]`) resolves to that tail name ('from'); null otherwise. used by the synth-swap
// gates so a side-effecting computed key is replayable: the SE prefix stays on the PATTERN key
// (evaluated once at destructure), and only the resolved tail name is mirrored into the synth
// literal as a plain key - the receiver-replacement never re-runs the effect. synth-swap only
export function sequenceKeyStaticName(keyNode) {
  let node = unwrapParens(keyNode);
  if (node?.type !== 'SequenceExpression') return null;
  while (node?.type === 'SequenceExpression') node = unwrapParens(node.expressions.at(-1));
  return staticStringKey(node);
}

// resolve a property's key to its static string name. accepts bare Identifier shorthand
// (`{ from: ... }`), string-literal keys (`{ 'from': ... }`), AND computed STATIC-string keys
// (`{ ['from']: ... }` / template single-quasi) - they affect exactly the same public slot at
// runtime, and the member-access side (memberKeyName) accepts the same shapes; rejecting them
// let `Object.assign(Array, { ['from']: X })` bypass the mutation pre-pass. returns null for
// dynamic computed keys, numeric / boolean literal keys, and PrivateName slots
export function propertyKeyName(prop) {
  const { key } = prop;
  if (prop.computed) return staticStringKey(key);
  if (key?.type === 'Identifier') return key.name;
  return staticStringKey(key);
}

// shape gate for the per-callback consultation against the mutated-static set the pre-pass built.
// shared between babel-plugin and unplugin so the (object, key) string formation stays in
// lockstep with the pre-pass that built the set - any divergence (different separator, case,
// proto-vs-static handling) would cause silent misses on one adapter and not the other
// a member meta whose `object.key` static was mutated (assigned or DELETED) somewhere in the file.
// covers `kind === 'property'` (suppress the polyfill rewrite - a user override wins) AND
// `kind === 'in'` (`'from' in Array`): a `delete Array.from` makes the runtime `in` false, so folding
// the in-check to `true` would be wrong. both plugins gate on this before dispatching the meta, so the
// `in` case is left untouched (the assign case also stays the correct runtime `true`). usage-pure only -
// `mutatedSet` is null in global mode, so the `?.has` short-circuits to false there
export function isMutatedStaticMeta(meta, mutatedSet) {
  return (meta.kind === 'property' || meta.kind === 'in') && meta.object && meta.key
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
  if (!node?.id) return false;
  if (node.type === 'TSImportEqualsDeclaration') return !isTypeOnlyImportEquals(node);
  if (node.type === 'TSEnumDeclaration' || node.type === 'TSModuleDeclaration') return !node.declare;
  return false;
}

// runtime binding NAME of a TS declaration's id. `namespace A.B {}` (babel@8 / oxc) carries a
// TSQualifiedName id whose RUNTIME binding is the LEFTMOST segment (`A` - the namespace-object var
// the IIFE lowering creates); enum / import-equals / single-segment-namespace / class ids are plain
// Identifiers; `declare module "foo"` carries a StringLiteral. returns the leftmost-segment name,
// or undefined for an id shape that binds no runtime name (StringLiteral / anonymous)
export function tsRuntimeBindingName(id) {
  while (id?.type === 'TSQualifiedName') id = id.left;
  return id?.type === 'Identifier' ? id.name : undefined;
}

// names of TS-specific runtime declarations at program top level. estree-toolkit's scope
// tracker doesn't recognise them at all; babel's scope tracks regular `enum X {}` and
// `namespace X {}` (free-vars) but not `const enum` or `import type X = require()`.
// callers (both adapters' `hasBinding`) consult this set as fallback for the cases their
// native scope misses. cached per Program node so repeated checks share one scan
const tsRuntimeBindingsCache = new WeakMap();

// extract the direct statement-body array from a scope-anchor node. Program/BlockStatement/
// TSModuleBlock/StaticBlock host statements at `.body` directly; functions and class methods
// wrap in `.body.body` (BlockStatement). a SwitchStatement's body is ONE block scope spanning
// every case, so its host statements are all cases' consequents flattened - a braceless
// `enum X {}` in any case shadows the global for a use in that or a fall-through case.
// returns null when the node has no host-able body
function getDirectStatementBody(node) {
  if (!node) return null;
  if (Array.isArray(node.body)) return node.body;
  if (Array.isArray(node.body?.body)) return node.body.body;
  if (Array.isArray(node.cases)) return node.cases.flatMap(switchCase => switchCase.consequent ?? []);
  return null;
}

// scan a scope-anchor node for direct TS-runtime declarations (TSEnumDeclaration,
// TSModuleDeclaration, TSImportEqualsDeclaration). returns a Set of names cached per
// anchor node. covers Program, BlockStatement, TSModuleBlock, StaticBlock, function/method
// bodies - i.e. anywhere a `enum X {}` / `namespace X {}` could shadow a global
function getTSRuntimeBindings(scopeNode) {
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
    if (isTSRuntimeBindingDeclaration(decl)) {
      const name = tsRuntimeBindingName(decl.id);
      if (name) cached.add(name);
    }
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
function isTSTypeOnlyIdentifier(parent, parentKey, grandparent) {
  if (!parent) return false;
  if (parent.type === 'ExportSpecifier') {
    if (parent.exportKind === 'type') return true;
    return grandparent?.type === 'ExportNamedDeclaration' && grandparent.exportKind === 'type';
  }
  if (parent.type === 'ImportSpecifier') {
    if (parent.importKind === 'type') return true;
    return grandparent?.type === 'ImportDeclaration' && grandparent.importKind === 'type';
  }
  // TS type-member key positions name a member in a type, not a runtime reference to a
  // same-named global: `interface I { Promise: number }` (TSPropertySignature) / `{ Promise():
  // void }` (TSMethodSignature) / `{ [Promise in K]: 1 }` (TSMappedType type-parameter name).
  // non-computed signatures only - a computed `[expr]` key IS a runtime value reference
  if ((parent.type === 'TSPropertySignature' || parent.type === 'TSMethodSignature')
    && parentKey === 'key' && !parent.computed) return true;
  if (parent.type === 'TSMappedType' && parentKey === 'key') return true;
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
// ParenthesizedExpression + TS expression wrappers + SequenceExpression tails
// (`(0, cond ? A : B)`) + zero-arg IIFE returning the fallback (`(() => cond ? A
// : B)()`), alternating until stable. shape: `r = (cond ? A : B)` -> ConditionalExpression.
// used by per-branch synth-swap and fallback enumeration to reach the underlying
// conditional/logical regardless of chain-assign / paren / TS / SE / factory-IIFE
// layering order. the SE-tail peel is UNCONDITIONAL (like peelFallbackBranchInner): effects
// are not dropped here - the apply phase keeps the SE prefix in the AST around the
// substituted branch leaf / kept residual statement, so observable order is preserved.
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

// SE-bearing prefix of a multi-operand SequenceExpression (all but the consumed last operand),
// or null when the node is not such a sequence or its prefix is side-effect-free. used by
// `sequenceKeyPrefix` (destructure computed-key) and resolve.js's `bailOnSideEffectKey` gate -
// callers that only need to KNOW a prefix has effects, not harvest the surviving tail's nested SE
// (that recursive harvest is `collectFoldedReceiverSideEffects`, which the `in`-expression paths use)
export function sequencePrefixWithSideEffects(expr) {
  if (expr?.type !== 'SequenceExpression' || expr.expressions.length < 2) return null;
  const prefix = expr.expressions.slice(0, -1);
  return prefix.some(mayHaveSideEffects) ? prefix : null;
}

// STRUCTURAL side effects of an expression whose VALUE is fully DISCARDED (an `in` fold replaces the
// whole operand with constant `true`), in source-eval order. unlike `sequencePrefixWithSideEffects` /
// `collectBuriedChainSePrefixes` - which peel to a surviving tail VALUE and harvest only the effects
// AHEAD of it - nothing survives here, so a sequence's trailing element and a member's computed key
// carry effects too (their SE ran in the source). eval order: a member's object before its computed
// key; a sequence left-to-right (its non-final elements are pushed WHOLE when SE-bearing, the final
// is recursed as a value). a value-position BARE call is intentionally NOT pushed: the caller pairs
// this with the scope-aware `collectChainRootCallEffect`, which drops a provably-pure inline receiver
// call (`'groupBy' in (() => Map)()` -> bare `true`) - a purity check this structural walk can't make.
// closes the prior gap that dropped SE sequence-tails (`(bar(), (k = Array))`) and computed keys
export function collectFoldedReceiverSideEffects(node, out = [], rescue = null) {
  let cur = node;
  while (cur && (TRANSPARENT_EXPR_WRAPPER_TYPES.has(cur.type) || cur.type === 'ChainExpression')) cur = cur.expression;
  // a value-position chain-root receiver CALL is intentionally NOT pushed by the structural walk
  // (its purity needs a scope-aware check this helper can't make). detection harvests it scope-aware
  // (dropping a provably-pure inline call) and threads the surviving call node(s) in via `rescue`;
  // emit it HERE at its true source position (the object terminus the walk reaches it) so it
  // INTERLEAVES with the structural effects instead of being appended/prepended at a fixed slot -
  // `(push('a'), mk())[(push('b'), 'k')]` evaluates object (push 'a', then mk()) before the key
  if (rescue?.has(cur)) {
    out.push(cur);
    rescue.delete(cur);
  }
  switch (cur?.type) {
    case 'SequenceExpression':
      for (const e of cur.expressions.slice(0, -1)) if (mayHaveSideEffects(e)) out.push(e);
      collectFoldedReceiverSideEffects(cur.expressions.at(-1), out, rescue);
      break;
    case 'MemberExpression':
    case 'OptionalMemberExpression':
      collectFoldedReceiverSideEffects(cur.object, out, rescue);
      if (cur.computed) collectFoldedReceiverSideEffects(cur.property, out, rescue);
      break;
    // mirror the other shapes `resolveKey` folds to a static key: a `+`-concat (`(eff(), 'fr') + 'om'`)
    // and a TemplateLiteral (`` `${(eff(), 'fr')}om` ``). resolveKey peels each operand's sequence tail
    // and discards the prefix, so the discarded prefix's effects must be harvested here too. recurse
    // operands in source-eval order (left before right; template expressions left to right). this
    // harvest stays a SUPERSET of resolveKey's resolvable fold shapes (sequence-tail / computed-member
    // / `+` / template) - a shape resolveKey does NOT fold never reaches a fold branch
    case 'BinaryExpression':
      collectFoldedReceiverSideEffects(cur.left, out, rescue);
      collectFoldedReceiverSideEffects(cur.right, out, rescue);
      break;
    case 'TemplateLiteral':
      for (const e of cur.expressions) collectFoldedReceiverSideEffects(e, out, rescue);
      break;
    case 'AssignmentExpression':
      out.push(cur);
      break;
  }
  return out;
}

// the side-effecting prefix of a destructure COMPUTED KEY (`[(eff(), 'from')]`), peeled through paren /
// chain / TS wrappers, or null when the key isn't such a sequence. single source for both flatten
// emitters (babel AST + unplugin text) so the key-effect gate AND the lifted prefix are captured
// identically - the peel and the SE check can't drift between the two
export function sequenceKeyPrefix(keyNode) {
  return sequencePrefixWithSideEffects(unwrapRuntimeExpr(keyNode));
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
  if (isMemberAccessNode(node)) {
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

// free-variable read scan: true if `name` is read anywhere in an expression subtree.
// descends into nested closures (a default-position closure captures the param scope, so its
// reads count) - unlike `bodyHasParamReference`, which conservatively bails on any closure.
// shadowing inside a closure is not modelled, so a rebinding closure can over-report - safe,
// the sole caller only widens a bail. `isNonReferencePosition` skips source-text name slots
// (member tail, property / method key) across both parser member shapes
function expressionReadsName(node, name) {
  if (!node || typeof node !== 'object') return false;
  if (Array.isArray(node)) return node.some(child => expressionReadsName(child, name));
  if (typeof node.type !== 'string') return false;
  if (node.type === 'Identifier') return node.name === name;
  for (const key of Object.keys(node)) {
    const child = node[key];
    if (isNonReferencePosition(node, child)) continue;
    if (expressionReadsName(child, name)) return true;
  }
  return false;
}

// walk a parameter pattern for a value-position read of `name`: AssignmentPattern defaults
// and computed keys. binding (declaration) positions recurse for nested reads but never
// self-match the bindings they introduce
function paramPatternReadsValue(node, name) {
  if (!node || typeof node.type !== 'string') return false;
  switch (node.type) {
    case 'AssignmentPattern':
      return expressionReadsName(node.right, name) || paramPatternReadsValue(node.left, name);
    case 'ObjectPattern':
      return (node.properties ?? []).some(property => paramPatternReadsValue(property, name));
    case 'ArrayPattern':
      return (node.elements ?? []).some(element => paramPatternReadsValue(element, name));
    case 'RestElement':
      return paramPatternReadsValue(node.argument, name);
    // babel: ObjectProperty; estree / oxc: Property
    case 'ObjectProperty':
    case 'Property':
      return (node.computed && expressionReadsName(node.key, name)) || paramPatternReadsValue(node.value, name);
    // babel TS parameter-property wrapper (`constructor(public x)`)
    case 'TSParameterProperty':
      return paramPatternReadsValue(node.parameter, name);
    default:
      return false;
  }
}

// true if `name` is read in any value position of the parameter list. a duplicate param
// binding is a SyntaxError, so any non-declaration occurrence of `name` is necessarily a
// read. guards param-destructure body-extract: relocating a destructured binding into a
// body `let` strands a param-scope read of it (param scope can't see the body let -> the
// read resolves to an outer binding or throws ReferenceError)
export function paramListReadsName(params, name) {
  if (!name || !Array.isArray(params)) return false;
  return params.some(param => paramPatternReadsValue(param, name));
}

// extract the body's terminal return expression while validating the prefix. arrow
// expression-body returns directly. BlockStatement body: accept a side-effect
// ExpressionStatement prefix preceding `return expr;`. non-ExpressionStatement
// intermediates (control flow, bindings) or expressions that rebind a param (`arg = X`
// / `arg++`) make the peel unsound. single body walk handles both checks.
// the returned node is unwrapped to its runtime-effective value (oxc preserves the
// `(Arg)` paren babel strips at parse): without this `(Arg => (Arg))(X)` fails the
// identity-lift and `bodyHasParamReference` flags the parenthesised param -> IIFE bails
function iifeBodyReturn(callee, paramNames) {
  const { body } = callee;
  if (callee.type === 'ArrowFunctionExpression' && body?.type !== 'BlockStatement') return unwrapExpressionChain(body) ?? null;
  if (body?.type !== 'BlockStatement') return null;
  const stmts = body.body ?? [];
  if (stmts.length === 0) return null;
  const last = stmts.at(-1);
  if (last?.type !== 'ReturnStatement' || !last.argument) return null;
  for (let i = 0; i < stmts.length - 1; i++) {
    if (stmts[i]?.type !== 'ExpressionStatement') return null;
    if (prefixStmtRebindsParam(stmts[i].expression, paramNames)) return null;
  }
  return unwrapExpressionChain(last.argument);
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
//  - shallow Identifier LHS / UpdateExpression target - the direct top-level case, no wrapper to descend
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
    if (patternBindsIdentifier(expr.left, id => paramNames.has(id.name))) return true;
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

// does the pattern bind a target Identifier satisfying `predicate`? walks exactly the binding leaves
// via the canonical `walkPatternIdentifiers`. callers supply the match: by NODE IDENTITY (an estree
// violation Identifier IS this leaf - so two same-name pattern reassignments pair to their OWN
// assignment, not collapse onto the first by name) or by NAME membership (a rebind of one of a set
// of params)
function patternBindsIdentifier(pattern, predicate) {
  let found = false;
  walkPatternIdentifiers(pattern, id => { if (predicate(id)) found = true; });
  return found;
}

// recursive peel of nested SequenceExpressions through paren wrappers: `(se1(), (se2(), G))`
// yields preceding-effect list `[se1(), se2()]` and tail `G`. used by destructure-flatten
// emitters (babel `liftSEPrefixSwap`, unplugin `tryFlattenAssignmentExpression`,
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

// true when `path` is the bare-Identifier LHS of a for-of / for-in head (`for (X of Y)` /
// `for (X in Y)`) - a per-iteration assignment target. parallel to isInUpdateOperand and
// gated the same way: usage-pure must skip it (rewriting the global to a frozen import
// binding TypeErrors at the write), usage-global must NOT (the head reads the binding first,
// so the side-effect polyfill is still needed). a declaration head (`for (const X of Y)`)
// binds a fresh name and never reaches here as a global reference
function isForXHeadAssignTarget(path) {
  const parent = path?.parentPath?.node;
  return isForXStatement(parent) && parent.left === path.node;
}

// usage-pure: a global at an assignment / for-x-head LHS cannot be rewritten to a frozen
// import binding (the write TypeErrors at runtime). a transparent wrapper (`Map! = x`,
// `(Map) ||= x`, `for (Map! of arr)`) keeps the identifier in a read-looking position so
// the adapter's `isReferenced` stays true; peel transparent ancestors before testing the
// LHS shapes. plain `=` and every compound form (`||=`, `+=`, ...) write the LHS, so any
// AssignmentExpression carrying the peeled node as `.left` qualifies
export function isAssignOrForXWriteTargetPath(path) {
  const anchor = peelTransparentExprAncestorPath(path);
  const parent = anchor?.parentPath?.node;
  if (parent?.type === 'AssignmentExpression') return parent.left === anchor.node;
  return isForXHeadAssignTarget(anchor);
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
// - a side-effecting / dynamic computed key (`{[fn()]: x}`, `{[a + b]: x}`) would fire at the wrong
//   time or can't be reproduced; only a bare Identifier (`[k]`) computed key is replayable by default
// - a non-computed key must be a plain Identifier (a numeric / string-literal own key is out of scope)
// - RestElement / SpreadElement have no literal-prop equivalent
// `allowLiteralComputedKeys` additionally accepts a static string / template literal computed key
// (`['from']` / [`from`]). only the per-branch synth path sets it: it has no body-extract fallback, so
// it must synth the polyfill; param-default leaves it off and bails to the safe body-extract instead.
// callers bail to inline-default when this check fails. shared between babel-plugin and unplugin
// accepts both Babel `ObjectProperty` and ESTree `Property` node types
// a prop whose VALUE is a nested ObjectPattern (`{ Array: { from } }`, peeling an `= {}` default). such a
// pattern is owned by the nested mirror (`buildNestedParamSynthPlan`), which replaces the WHOLE receiver
// default - flat synth-swap / body-extract / inline-default fallbacks must DEFER to it, never race it
export function objectPatternHasNestedValue(objectPattern) {
  return objectPattern.properties.some(p => {
    const value = p.value?.type === 'AssignmentPattern' ? p.value.left : p.value;
    return value?.type === 'ObjectPattern';
  });
}

// a MIXED pattern the nested mirror owns WHOLLY: it has a nested-value key AND no top-level rest (a rest
// makes the mirror BAIL structurally - the rest collects unsynthesizable receiver keys). both emitters'
// flat-key fallbacks (body-extract / inline-default) DEFER to the mirror here rather than body-extract
// (caller-lossy) a key the mirror's synth default provides, or race it when a leaf resolves transiently
export function nestedMirrorOwnsMixedPattern(objectPattern) {
  return objectPatternHasNestedValue(objectPattern)
    && !objectPattern.properties.some(p => p.type === 'RestElement');
}

export function isSynthSimpleObjectPattern(objectPattern, { allowLiteralComputedKeys = false, allowSideEffectComputedKeys = false } = {}) {
  let bound = null;
  // duplicate static keys bail the synth (the literal would need duplicate properties or a
  // merge policy) - the established fallbacks handle the exotic shape soundly
  const seenNames = new Set();
  // a NESTED-value prop (`{ Array: { from } }`) belongs to the nested mirror (it replaces the WHOLE
  // receiver); a flat synth-swap here would race it on the same receiver and lose the nested polyfill
  if (objectPatternHasNestedValue(objectPattern)) return false;
  for (const p of objectPattern.properties) {
    if (p.type !== 'ObjectProperty' && p.type !== 'Property') return false;
    if (!p.computed) {
      if (p.key?.type !== 'Identifier') return false;
      if (seenNames.has(p.key.name)) return false;
      seenNames.add(p.key.name);
      continue;
    }
    if (p.key?.type === 'Identifier') {
      // an Identifier computed key (`[k]`) is replayable, but only when `k` does not read a binding
      // THIS pattern introduces: the synth literal evaluates the key BEFORE the pattern binds, so
      // `{ of, [of]: x }` would read the wrong `of`. collect bound names lazily on first hit
      if (!bound) {
        bound = new Set();
        walkPatternIdentifiers(objectPattern, n => bound.add(n.name));
      }
      if (bound.has(p.key.name)) return false;
    } else if (allowSideEffectComputedKeys && sequenceKeyStaticName(p.key) !== null) {
      // a side-effecting computed key `[(eff(), 'from')]` is replayable when the caller opts in: the SE
      // prefix stays on the pattern key (evaluated once), the synth literal mirrors only the tail name
      continue;
    } else if (!allowLiteralComputedKeys || staticStringKey(p.key) === null) {
      // a non-Identifier computed key: only a static string / template literal is replayable, and only
      // when the caller opts in. anything else is dynamic / side-effecting - not replayable
      return false;
    }
  }
  return true;
}

// stable per-receiver polyfill-map key for a synth-swap property: distinguishes a computed key from a
// plain key so the two can't collide in `{ k: v, [k]: w }`. a computed Identifier keys by its variable
// name (`[k]`); a computed string / template literal keys by its QUOTED static value (`["from"]`) so it
// can't collide with a same-named computed Identifier. shared so babel-plugin and unplugin key identically
export function synthSwapPropKey(prop) {
  if (!prop.computed) return prop.key.name;
  if (prop.key.type === 'Identifier') return `[${ prop.key.name }]`;
  return `[${ JSON.stringify(staticStringKey(prop.key) ?? sequenceKeyStaticName(prop.key)) }]`;
}

// a synth-literal builder can replay a property whose key is a plain Identifier or a computed static
// string / template literal (`['from']` / [`from`]); anything else (dynamic / side-effecting computed
// key) is skipped. shared so both emitters apply the same rule isSynthSimpleObjectPattern gated on
function isReplayableSynthKey(prop) {
  return prop.key?.type === 'Identifier'
    || (prop.computed && (staticStringKey(prop.key) !== null || sequenceKeyStaticName(prop.key) !== null));
}

// per-property CONTENT plan for a synthesized receiver literal - the single classification both
// emitters render (babel as ObjectProperties, unplugin as source text). serves the flat
// param-default synth swap AND the per-branch conditional / logical synth: both families
// register into the same accumulator and flow through this builder. per entry:
//   keyNode  - the original pattern key node
//   computed - render the key / receiver read as computed `[k]` (false for SE keys)
//   seName   - static name of a side-effecting sequence key, null otherwise. the key mirrors
//              as the PLAIN string name and an unpolyfilled value reads `R["name"]` - the
//              prefix effects stay on the pattern key and run exactly once at destructure
//   polyfill - the accumulator's queued value when the key resolved (emitter-opaque:
//              babel queues { entry, hintName }, unplugin the injected binding name),
//              null -> re-read through the receiver
export function buildFlatSynthEntries(objectPatternNode, polyfills) {
  const entries = [];
  for (const prop of objectPatternNode.properties) {
    if ((prop.type !== 'Property' && prop.type !== 'ObjectProperty') || !isReplayableSynthKey(prop)) continue;
    const seName = prop.computed ? sequenceKeyStaticName(prop.key) : null;
    entries.push({
      keyNode: prop.key,
      computed: prop.computed && seName === null,
      seName,
      polyfill: polyfills.get(synthSwapPropKey(prop)) ?? null,
    });
  }
  return entries;
}

// computed-key synth-swap safety: a bare-global computed key (`[Set]` with no in-scope binding) gets
// emitted RAW into the synth literal (`{ [Set]: receiver[Set] }`), throwing ReferenceError on a target
// engine where the global is absent (ie:11). a pattern with any unbound computed key is therefore NOT
// synth-swap-safe - callers bail (param-default -> body-extract). user-local / imported computed keys
// have a binding and replay safely as `[k]: receiver[k]`. takes `scope` so it cannot fold into the
// purely-structural `isSynthSimpleObjectPattern`. `scope.getBinding` is common to babel + estree scopes
export function computedKeysAllBound(objectPattern, scope) {
  for (const p of objectPattern.properties) {
    if (p.computed && p.key?.type === 'Identifier' && !scope.getBinding(p.key.name)) return false;
  }
  return true;
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
    if (!memberShapeEqual(a.object, b.object)) return false;
    // compare property keys by resolved static name so the dot (`obj.at`) and bracket
    // (`obj['at']`) forms of the SAME static key match - e.g. a `for (obj.at of ...)` write
    // target and a later `obj['at']` read of the same per-iteration slot. dynamic computed
    // keys (`obj[i]`) have no static name and fall back to structural (form + shape) compare
    const aKey = memberKeyName(a);
    const bKey = memberKeyName(b);
    if (aKey !== null && bKey !== null) return aKey === bKey;
    return a.computed === b.computed && memberShapeEqual(a.property, b.property);
  }
  return false;
}

// flatten a for-of/for-in LHS or destructuring-assignment LHS (bare member, or nested in
// object / array / rest / default patterns) into every MemberExpression that receives a write
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

// invoke `visit(memberPath)` for every write-target MemberExpression reachable through a
// destructuring-assignment / for-x LHS rooted at `leftPath`. a bare member LHS is its own single
// target (passed as `leftPath`); nested patterns are traversed and gated to the EXACT write-target
// members (computed keys and default-value RHS are excluded by `collectForXWriteMembers`, so a
// member nested in those is never visited). shared by the per-program external-write index and the
// per-method `this`-write index so both enumerate the same member set
export function forEachPatternWriteMember(leftPath, visit) {
  const targets = [];
  collectForXWriteMembers(leftPath.node, targets);
  if (!targets.length) return;
  if (targets.length === 1 && targets[0] === leftPath.node) {
    visit(leftPath);
    return;
  }
  const targetSet = new Set(targets);
  leftPath.traverse({
    MemberExpression(mp) {
      if (targetSet.has(mp.node)) visit(mp);
    },
  });
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
    if (!isForXStatement(parent)) continue;
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

// the static-FALLBACK receiver swap is REDUNDANT when the receiver is a kept SE-bearing inline
// call whose return leaf is a bare Identifier: the call is re-emitted whole (it IS the harvested
// side effect, per the span check) and the leaf's own substitution already makes the runtime
// receiver the polyfill binding - `(() => { c++; return _Promise; })().noSuchStatic` reads off
// the right object without a `(call(), _Promise)` wrapper. all other receiver shapes keep the
// swap: a proxy-hop receiver (`(IIFE)().Promise`) drops the hop, a sequence / bare / assignment
// receiver has its leaf OUTSIDE any harvested-SE span, a no-SE call is dropped entirely
export function staticFallbackSwapRedundant(receiverNode, sideEffects) {
  if (!sideEffects?.length) return false;
  const leaf = unwrapReceiverLeaf(receiverNode);
  return leaf?.type === 'Identifier'
    && sideEffects.some(se => se.start <= leaf.start && leaf.end <= se.end);
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
      // `namespace require.X {}` binds the leftmost segment (`require`) at runtime
      return tsRuntimeBindingName(node.id) === 'require';
  }
  return false;
}

function declaratorsBindName(decls, name) {
  return (decls ?? []).some(d => patternBindsIdentifier(d.id, id => id.name === name));
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

// any `await` evaluated in the ENCLOSING (top-level) context of the subtree. function-like
// nodes contribute only their computed KEY and DECORATORS (both evaluate at definition time
// in the enclosing context; bodies and params are their own await scope) - estree wraps
// method functions in MethodDefinition, which carries the key/decorators there. for-await
// carries its await as a statement flag, not an AwaitExpression node, so it needs its own match
function containsTopLevelAwait(node) {
  if (node.type === 'AwaitExpression' || (node.type === 'ForOfStatement' && node.await)) return true;
  if (FUNCTION_LIKE_NODE_TYPES.has(node.type) || node.type === 'MethodDefinition') {
    if (node.computed && node.key && containsTopLevelAwait(node.key)) return true;
    for (const decorator of node.decorators ?? []) {
      if (containsTopLevelAwait(decorator)) return true;
    }
    return false;
  }
  let found = false;
  walkAstChildren(node, child => {
    found ||= containsTopLevelAwait(child);
  });
  return found;
}

export function detectCommonJS(program) {
  let hasCJS = false;
  for (const stmt of program.body) {
    // ESM wins: any ESM marker anywhere in the program rules out CJS classification,
    // so keep scanning even after hasCJS is set to surface a later import / export
    if (ESM_MARKER_TYPES.has(stmt.type)) return false;
    if (stmt.type !== 'ExpressionStatement') continue;
    const expression = unwrapExpr(stmt.expression);
    if (hasCJS) continue;
    const isDirectAssign = expression?.type === 'AssignmentExpression' && isCommonJSAssignTarget(expression.left);
    if (isDirectAssign || isObjectDefinePropertyOnExports(expression)) hasCJS = true;
  }
  // top-level `await` is ESM-only syntax (a script parse would reject it), so it overrides
  // a CJS verdict even without explicit import/export - in ANY top-level host (`const x =
  // await f()`, `if (await f())`, `for await (...)`), not just a bare expression statement.
  // gated on hasCJS: the walk runs only for files that produced a CJS verdict to override,
  // so marker-free files (the common case) never pay it
  return hasCJS && !program.body.some(containsTopLevelAwait);
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
// the dead-tail policy for a lifted sequence: once a destructure consumed every binding,
// trailing EFFECT-FREE expressions of the lifted init are unread - pop them so the emitted
// statement keeps only the effects (`(se(), (0, Array))` lifts as `se();`). shared by both
// emitters so the trim canon lives once; callers pass an already-flattened expression list
export function dropDeadSequenceTail(expressions) {
  const out = [...expressions];
  while (out.length > 1 && !mayHaveSideEffects(out.at(-1))) out.pop();
  return out;
}

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
  // Array and Object literals. without this, `const { from } = [1, ...Array]` would be
  // considered SE-free and run through the no-SE-path
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
// regular fields (`ClassProperty` babel / `PropertyDefinition` estree) AND auto-accessor fields
// (`ClassAccessorProperty` babel / `AccessorProperty` estree): both carry an initializer `.value`
// that runs at class-eval (static) or construction (instance), so both gate field-init contexts
const CLASS_FIELD_TYPES = new Set([
  'ClassProperty',
  'PropertyDefinition',
  'ClassAccessorProperty',
  'AccessorProperty',
]);

// one ancestor step: is `node` (entered via the `child` path) a DEFERRED evaluation context - a
// function body (runs at call time) OR an INSTANCE class-field initializer VALUE (runs at
// construction / `new`-time)? a static field, a StaticBlock, and any computed key run at class-eval
// (straight-line), so they are NOT deferred. single source of truth for the deferral predicate
export function isDeferredContextStep(t, node, child) {
  if (t.isFunction(node)) return true;
  return CLASS_FIELD_TYPES.has(node.type) && !node.static && child?.key === 'value';
}

// walk ancestors from `startPath` up to (excluding) Program, returning true at the first DEFERRED
// evaluation context. shared by closure-analysis (call temporal bound) and class-fields (this-write
// deferral) and straight-line flow (reassignment timing) so all treat new-time evaluation alike
export function hasDeferredContextAncestor(t, startPath) {
  for (let fp = startPath?.parentPath, child = startPath; fp?.node && !t.isProgram(fp.node); child = fp, fp = fp.parentPath) {
    if (isDeferredContextStep(t, fp.node, child)) return true;
  }
  return false;
}

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
  // a decorator is APPLIED at class-eval - the decorator expression is evaluated and the result is
  // invoked with the target (`@deco` -> `deco(C)`, `@deco(eff())` -> `deco(eff())(C)`), always a call.
  // `classHasSideEffects` recurses into `node.decorators`, so without this a decorator factory's SE
  // (`@deco(eff())`) elides as pure and the enclosing class drops from a destructure / fold source
  'Decorator',
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

// minifier-shape detection: `ExpressionStatement > [Paren?] > SequenceExpression > [...]`
// where ANY slot (with optional Paren peel) is an `AssignmentExpression` targeting an
// ObjectPattern or ArrayPattern. the shape collapses a destructure assignment into a
// SequenceExpression (`(0, ({pat} = R));` minified tail, `(({pat} = R), use());`
// comma-joined statements) which the destructure-emitter gate would otherwise miss.
// statement context discards every slot's value, so splitting is sound at any position.
// returns the SequenceExpression's `expressions` array on match (callers split into per-expr
// statements via adapter-specific mutation), null otherwise. peels both the outer wrapper and
// each expression's wrapper - oxc preserves ParenthesizedExpression on both slots, babel
// parser drops them, so the peel is required for cross-parser symmetry
export function getMinifierSequenceDestructureExpressions(stmt) {
  if (stmt?.type !== 'ExpressionStatement') return null;
  let expr = stmt.expression;
  while (expr?.type === 'ParenthesizedExpression') expr = expr.expression;
  if (expr?.type !== 'SequenceExpression') return null;
  return sequenceSlotsHaveDestructure(expr, 0) ? expr.expressions : null;
}

// a slot hosting a NESTED SequenceExpression (`((x(), ({p} = R)), use())`) carries the
// destructure too: the split's fixpoint loop re-reaches the nested product once the outer
// statement splits, so matching it here is what lets the outer split happen at all
function sequenceSlotsHaveDestructure(seq, depth) {
  if (depth >= MAX_DEPTH) return false;
  for (let slot of seq.expressions) {
    while (slot?.type === 'ParenthesizedExpression') slot = slot.expression;
    if (slot?.type === 'SequenceExpression' && sequenceSlotsHaveDestructure(slot, depth + 1)) return true;
    if (slot?.type !== 'AssignmentExpression') continue;
    const leftType = slot.left?.type;
    if (leftType === 'ObjectPattern' || leftType === 'ArrayPattern') return true;
  }
  return false;
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
// a hand-curated skip list - new visitor metadata won't poison the walk. `SwitchCase` uses
// the `consequent` field for its statement list (not `body`); special-case the slot name
// here so minifier-sequence-split + other statement-walkers reach `case L: stmt;` lists
export function forEachStatementListBody(rootNode, visitor) {
  function visitListHosts(node) {
    if (!isASTNode(node)) {
      if (Array.isArray(node)) for (const item of node) visitListHosts(item);
      return;
    }
    if (STATEMENT_LIST_BODY_HOSTS.has(node.type) && Array.isArray(node.body)) visitor(node.body);
    if (node.type === 'SwitchCase' && Array.isArray(node.consequent)) visitor(node.consequent);
    for (const key of Object.keys(node)) visitListHosts(node[key]);
  }
  visitListHosts(rootNode);
}
