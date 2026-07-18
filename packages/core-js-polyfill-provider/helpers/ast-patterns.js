import knownBuiltInReturnTypes from '@core-js/compat/known-built-in-return-types' with { type: 'json' };
import { MAX_DEPTH } from '../resolve-node-type/base.js';

// `globalThis` / `self` / `window` etc. - proxy names aliasing the ONE global object
export const POSSIBLE_GLOBAL_OBJECTS = new Set(knownBuiltInReturnTypes.globalProxies);

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
// the directive string of a directive-prologue node, read from EITHER shape - the marker on the
// statement (`node.directive`, oxc / babel real directives) or on the inner StringLiteral / Literal
// (`node.expression.directive`, sibling-plugin synth re-emit) - else null. one extractor so every
// directive VALUE read (`=== 'use strict'`) and the boolean classifier agree on both shapes
export const directiveValue = node => typeof node?.directive === 'string' ? node.directive
  : typeof node?.expression?.directive === 'string' ? node.expression.directive : null;

export const isDirectiveStatement = node => node?.type === 'ExpressionStatement' && directiveValue(node) !== null;

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
function isStringLiteralExpressionStatement(node) {
  return node?.type === 'ExpressionStatement'
    && (node.expression?.type === 'StringLiteral'
      || (node.expression?.type === 'Literal' && typeof node.expression.value === 'string'));
}

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

// the static member name, FOLDING a side-effecting computed key to its static tail
// (`globalThis[(e++, 'Map')]` -> 'Map'): memberKeyName covers dotted / static-string-computed keys,
// sequenceKeyStaticName recovers the tail of an SE-bearing computed key (its SE prefix is replayed by
// the caller). the ONE canonical member-name resolver for every proxy-global / enum consumer - a bare
// memberKeyName under-resolves the SE-key form and diverges from the consumers that already fold it
export function staticMemberKeyName(node) {
  return memberKeyName(node) ?? (node.computed ? sequenceKeyStaticName(node.property) : null);
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
// climb transparent wrappers (TS `as`/`!`/`satisfies`, parens, chain) UP from `path` while the
// wrapper's `.expression` is the climbed node: returns the path of the node that actually fills
// its host's slot (`(m as any) = v` -> the cast path, whose parent is the AssignmentExpression).
// the canonical upward climb - identity gates that compare a host's `.left`/`.tag`/`.argument`
// slot against a member must compare against THIS node, not the original member
export function climbTransparentWrapperPath(path) {
  let target = path;
  while (SKIPPABLE_WRAPPER_TYPES.has(target?.parentPath?.node?.type) && target.parentPath.node.expression === target.node) {
    target = target.parentPath;
  }
  return target;
}

export function isMemberWriteHost(memberPath) {
  if (!memberPath?.node) return false;
  // wrapped write target - `(m as any) = v`, `(m) = v` - the host's `.left`/`.argument` points
  // at the wrapper node, not the bare member. inverse of `memberWriteTargetPath`'s downward peel;
  // without it a cast on the LHS strands the write and a stale narrow survives (throws on ie:11)
  const target = climbTransparentWrapperPath(memberPath);
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
  // the IIFE's own invocation is not the ONLY call when the function is a NAMED expression that
  // references its own name inside the body: that name can re-invoke it with arguments the
  // caller-lossy emission never sees (`(function f({from} = Array){ return c ? f(1) : from })()`
  // - the self-call passes 1, so the default never runs there, yet an extract emits `_Array$from`
  // unconditionally). fall through to the param-override scan / conservative bail for that shape
  if (isImmediatelyInvokedFunction(fnPath) && !namedFunctionSelfReferences(fnPath)) return false;
  if (paramNeverOverridden?.(paramPath)) return false;
  return true;
}

// a BARE JSX tag name that starts lowercase names an intrinsic element (`<div />` -> the string
// "div", `<structuredClone />` -> the string, never the global), so it resolves against no binding
// at all. dashed tags (`<el-x />`) are intrinsic too, but they start lowercase as well - and a name
// carrying `-` can equal no JS identifier anyway, so the initial-letter test is the whole rule.
// a MEMBER tag (`<f.Sub />`) is an expression whatever its case and is NOT covered here
const JSX_INTRINSIC_TAG_RE = /^[a-z]/;

export function isIntrinsicJsxTagName(tagName) {
  return JSX_INTRINSIC_TAG_RE.test(tagName);
}

// a FunctionExpression / FunctionDeclaration whose own name is referenced anywhere in its params
// or body - a potential self-call (or an escape that leads to one). the name binds only inside the
// function, so any such reference is the sole extra caller an immediately-invoked gate would
// otherwise miss. a PARAM default is in scope of the name too (`(cb = () => f(1))` re-invokes it),
// so params are scanned alongside the body. conservative: a non-call reference (`return f`) still
// counts, since it can escape and be called with arguments. non-computed property / member KEYS
// (`{ f: 1 }`, `.f`) are skipped
function namedFunctionSelfReferences(fnPath) {
  const node = fnPath?.node;
  const name = node?.id?.name;
  if (!name) return false;
  return (node.params ?? []).some(param => identifierReferencedInSubtree(param, name))
    || identifierReferencedInSubtree(node.body, name);
}

function identifierReferencedInSubtree(node, name) {
  if (!node || typeof node !== 'object' || typeof node.type !== 'string') return false;
  if (node.type === 'Identifier') return node.name === name;
  // a JSX tag name can be a runtime reference to the binding, and then it is the same KIND of extra
  // caller a bare `return f` is: the element hands the component to a renderer that calls it with
  // props, so the param default never runs there. namespaced parts name no binding
  if (node.type === 'JSXNamespacedName') return false;
  // the tag slot decides by SPELLING: a lowercase-initial bare tag is an intrinsic element - the
  // string "div", never the binding `div`. a MEMBER tag (`<f.Sub />`) is an expression whatever its
  // case, so it recurses and its root does reference the binding. attributes carry arbitrary
  // expressions and stay in the walk
  if (node.type === 'JSXOpeningElement' || node.type === 'JSXClosingElement') {
    const tag = node.name;
    if (tag?.type === 'JSXIdentifier'
      ? !isIntrinsicJsxTagName(tag.name) && tag.name === name
      : identifierReferencedInSubtree(tag, name)) return true;
    return (node.attributes ?? []).some(attr => identifierReferencedInSubtree(attr, name));
  }
  // reached only as a JSXMemberExpression root now - the referencing position
  if (node.type === 'JSXIdentifier') return node.name === name;
  // a JSX tag name is a runtime reference to the binding, and the same KIND of extra caller a bare
  // `return f` is: the element hands the component to a renderer that calls it with props, so the
  // param default never runs there. the tag-name slot is the only referencing position - namespaced
  // parts are literals (`<ns:f />` names no binding), and the skips below drop the other slots
  const keyProp = node.type === 'MemberExpression' || node.type === 'OptionalMemberExpression'
    // `<f.Bar />` accesses a prop on `f`: the ROOT is the reference, the tail is a name literal
    || node.type === 'JSXMemberExpression' ? 'property'
    : node.type === 'ObjectProperty' || node.type === 'Property'
      || node.type === 'ObjectMethod' || node.type === 'ClassMethod' ? 'key'
      // `<X f={1} />` names a prop, not the binding
      : node.type === 'JSXAttribute' ? 'name' : null;
  for (const [key, value] of Object.entries(node)) {
    // a non-computed member / property KEY is a name literal, not a reference
    if (key === keyProp && !node.computed) continue;
    if (Array.isArray(value)) {
      if (value.some(child => identifierReferencedInSubtree(child, name))) return true;
    } else if (identifierReferencedInSubtree(value, name)) return true;
  }
  return false;
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

export function isVarScopeBoundary(type) {
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
    for (const value of Object.values(node)) {
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
export function findVarOwnerDeclaring(path, name) {
  return climbVarScopeOwners(path, owner => {
    const declarator = cachedScopeVars(owner.node).get(name);
    return declarator ? { owner, declarator } : undefined;
  }) ?? null;
}

export function findFunctionScopeVarDeclaratorInPath(path, name) {
  return findVarOwnerDeclaring(path, name)?.declarator ?? null;
}

// ONE path-tracked traverse per OWNER indexes every write-shaped node (declarators,
// assignments, updates, for-x heads) to its live path - per-binding / per-query owner
// traversals re-walked the whole owner each time, quadratic on binding-heavy bundles.
// keyed on the owner PATH object: a path (and the scope hanging off it) belongs to ONE
// traversal, so the cache dies with the traversal and can never hand back a dead object.
// one key per node shape the write scans record - a for-x head writes a binding without an
// AssignmentExpression, so it needs its own. no early stop: the parsers disagree on the
// traversal-abort API, and indexing every write costs one bounded walk total
const ownerWritePathIndexCache = new WeakMap();
// uncached builder: babel's lagged-binding recovery must read the LIVE AST (the plugin's own
// alias rewrite replaces write nodes, so a cached index may hold replaced originals)
export function buildOwnerWritePathIndex(ownerPath) {
  const index = new Map();
  function add(p) {
    if (!index.has(p.node)) index.set(p.node, p);
  }
  ownerPath.traverse({
    VariableDeclarator: add,
    AssignmentExpression: add,
    UpdateExpression: add,
    ForOfStatement: add,
    ForInStatement: add,
  });
  return index;
}
export function ownerWritePathIndex(ownerPath) {
  let index = ownerWritePathIndexCache.get(ownerPath);
  if (!index) ownerWritePathIndexCache.set(ownerPath, index = buildOwnerWritePathIndex(ownerPath));
  return index;
}

// PATHS for the synthetic binding's declarator and its reassignment nodes, resolved through the
// shared owner index. the node scan above stays the source of truth for WHICH nodes those are
// (its shadow-stopping rules are subtle); this only maps them onto the live paths the flow layer
// climbs. the scan decides which writes exist, so this map has to reach every one of them: a
// write shape the scan records but no index key matches is caught by the `complete` check, and
// the caller declines the twin instead of handing the flow gates a list it cannot vouch for -
// a contract against a LATER write shape being added to the scan alone (a miss degrades the
// gates to the generic answer rather than mis-narrowing)
function memoizeDeclaratorSearch(found, violationNodes) {
  let resolved;
  return () => {
    if (resolved === undefined) {
      const index = ownerWritePathIndex(found.owner);
      const violationPaths = [];
      for (const node of violationNodes) {
        const violationPath = index.get(node);
        if (violationPath) violationPaths.push(violationPath);
      }
      resolved = {
        declaratorPath: index.get(found.declarator) ?? null,
        violationPaths,
        complete: violationPaths.length === violationNodes.length,
      };
    }
    return resolved;
  };
}

// synthesize a binding for a function-scoped `var` declared in a nested block that estree-toolkit
// fails to hoist to the function scope (`function f(){ if (c) { var G = Array } G.from(...) }`).
// babel hoists natively, so callers reach this only on the estree side after a null native lookup -
// a no-op for babel. shape carries `.node` (declarator) + recomputed violations, the minimum the
// static-receiver walk + reassignment gates read (they fall back to `.node` when there is no `.path`)
export function synthVarHoistBinding(path, name) {
  const found = path ? findVarOwnerDeclaring(path, name) : null;
  if (!found) return null;
  const violationNodes = collectScopeReassignmentNodes(found.owner.node, name).filter(node => node !== found.declarator);
  const search = memoizeDeclaratorSearch(found, violationNodes);
  return {
    node: found.declarator,
    // node-based anchor for the guard-verdict / dominance consumers: a synthetic binding
    // has no `.path` to climb
    ownerNode: found.owner.node,
    // the declarator's own PATH / SCOPE, both surfaced as memoized THUNKS rather than values:
    // consumers of this synthetic shape key their flow decisions on a MISSING `.path` / `.scope`,
    // so each opts in explicitly - and the bounded search then costs nothing on the lookups that
    // never read it. the scope is the one the declarator is WRITTEN in: a `var` hoists its NAME to
    // the owner, but the init still evaluates in the declaring block, so an outer-scope answer
    // would read past a block-local shadow of an init name
    resolveDeclaratorPath: () => search().declaratorPath,
    // the reassignment PATHS: the flow layer climbs a violation's parents to reach its assignment,
    // so the node list below (which the alias walkers read) cannot serve it. null when the map came
    // out incomplete - the caller must then decline rather than under-report the writes
    resolveViolationPaths: () => search().complete ? search().violationPaths : null,
    // the scope the var's NAME hoists to - what a parser that hoists natively reports as the
    // binding's scope. distinct from the declaration scope below (where the declarator is WRITTEN,
    // and so where its initializer's names resolve); the flow layer keys "is the use inside the
    // binding's var scope" on the hoisted one
    ownerScope: found.owner.scope,
    resolveDeclarationScope: () => search().declaratorPath?.scope ?? found.owner.scope ?? null,
    kind: 'var',
    constantViolations: violationNodes,
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
// the lexical names (`let` / `const` / `class`) bound at the TOP of a block body - an Annex-B
// block-function hoist is BLOCKED (B.3.2) when any block between the function and its var-scope
// owner lexically rebinds the name, so the top-level reference stays the global
function blockLexicalNames(bodyStatements) {
  const lex = new Set();
  for (const stmt of bodyStatements ?? []) {
    if (stmt?.type === 'VariableDeclaration' && stmt.kind !== 'var') {
      for (const d of stmt.declarations ?? []) walkPatternIdentifiers(d.id, id => lex.add(id.name));
    } else if (stmt?.type === 'ClassDeclaration' && stmt.id?.name) lex.add(stmt.id.name);
  }
  return lex;
}
function collectScopeBlockFunctions(scopeNode) {
  const names = new Set();
  function visit(node, blocked) {
    if (!isASTNode(node)) return;
    if (node.type === 'FunctionDeclaration') {
      // register the block-function's hoisted name ONLY when no intervening block lexically
      // rebinds it (an intervening `let Array` keeps `Array` the GLOBAL - under-suppressing here
      // would drop a needed polyfill). a function is a var-scope boundary - don't descend its body
      if (node.id?.name && !blocked.has(node.id.name)) names.add(node.id.name);
      return;
    }
    if (isVarScopeBoundary(node.type)) return;
    // entering a block extends the blocked set with that block's lexical declarations
    const next = node.type === 'BlockStatement'
      ? new Set([...blocked, ...blockLexicalNames(node.body)]) : blocked;
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) for (const v of value) visit(v, next);
      else visit(value, next);
    }
  }
  // the owner scope's own body-block lexicals block the hoist too
  const body = Array.isArray(scopeNode?.body) ? scopeNode.body : scopeNode?.body?.body;
  const ownerLex = blockLexicalNames(Array.isArray(body) ? body : null);
  if (Array.isArray(body)) for (const stmt of body) visit(stmt, ownerLex);
  else visit(scopeNode?.body, ownerLex);
  return names;
}
function cachedScopeBlockFunctions(node) {
  let names = scopeBlockFunctionsCache.get(node);
  if (!names) scopeBlockFunctionsCache.set(node, names = collectScopeBlockFunctions(node));
  return names;
}

// does any enclosing var-scope owner of `path` carry a sloppy block-hoisted function of `name`?
// the Annex-B hoist depends on the sloppiness of the OWNER where the block-function lives, NOT the
// use site: a STRICT inner function reading a name whose block-function hoists in a SLOPPY outer
// function still sees the shadow (strict does not change lexical resolution). check `isSloppyAtPath`
// at the matching OWNER. `|| undefined` keeps the climb going past a non-matching owner (visit must
// return undefined to continue), and the outer `?? false` normalises "no owner matched" to a boolean
function hasSloppyBlockFunctionInPath(path, name) {
  return climbVarScopeOwners(path, owner => {
    return (cachedScopeBlockFunctions(owner.node).has(name) && isSloppyAtPath(owner)) || undefined;
  }) ?? false;
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
      if (directiveValue(stmt) === 'use strict') return true;
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
  return hasSloppyBlockFunctionInPath(path, name);
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
const EMPTY_REASSIGNMENTS = [];
// build the reassignment index for EVERY name in ONE walk of `ownerNode`'s subtree: a
// per-name walk re-scans the whole owner subtree per queried name, which is quadratic on a
// large single-scope bundle. the per-name skip semantics ("a construct shadowing `name`
// contributes nothing inside it") map onto a shadow-DEPTH counter per name: entering a
// construct increments every name it shadows, leaving decrements, and a write records only at
// depth 0 - elementwise identical to a per-name walk.
// the binding's OWN declarator (every `var name = init` is recorded) stays knowledge the
// CALLERS hold: for a var-declared binding it is the scope's declaring var, but a PARAM /
// hoisted binding owns NONE of them, so a first-encountered skip would swallow its first
// re-declaration; a bare `var name;` (no init) keeps the value and stays unrecorded. the
// caller-side identity filter must NOT come from a cached index or parameter - the plugin's
// in-place rewrite replaces declarator nodes, and a stale identity would count the binding's
// own initializer as a reassignment of itself
export function buildScopeReassignmentIndex(ownerNode) {
  const index = new Map();
  const shadowDepth = new Map();
  function record(name, node) {
    if (shadowDepth.get(name)) return;
    let list = index.get(name);
    if (!list) index.set(name, list = []);
    // a pattern binding the same name twice yields consecutive duplicates - keep one
    if (list.at(-1) !== node) list.push(node);
  }
  function push(names) { for (const name of names) shadowDepth.set(name, (shadowDepth.get(name) ?? 0) + 1); }
  function pop(names) { for (const name of names) shadowDepth.set(name, shadowDepth.get(name) - 1); }
  function patternNames(patternNode, out) {
    walkPatternIdentifiers(patternNode, id => out.push(id.name));
    return out;
  }
  // names a block-scoped statement re-binds: `let`/`const` declarator, class / function decl
  function stmtRebindNames(stmt, out) {
    if (stmt.type === 'VariableDeclaration' && stmt.kind !== 'var') {
      for (const d of stmt.declarations) patternNames(d.id, out);
    } else if ((stmt.type === 'ClassDeclaration' || stmt.type === 'FunctionDeclaration') && stmt.id?.name) {
      out.push(stmt.id.name);
    }
    return out;
  }
  // names a nested BLOCK / catch / for-head re-binds block-scoped - writes inside target the
  // inner binding, not the outer var. a for-head `let`/`const` lexically binds PER-LOOP, so
  // head + body writes target that binding (NOT the outer); a `var` head hoists to the
  // function scope and a bare-identifier head assigns the existing outer, so those are NOT
  // shadows and stay recorded as real writes below. a case-level lexical rebind
  // (`case 1: let name`) lives in the switch's SINGLE case-block env, so the whole switch
  // shadows it; a rebind inside a BRACED case body is a plain BlockStatement child instead
  function blockShadowNames(node) {
    if (node.type === 'CatchClause') return node.param ? patternNames(node.param, []) : EMPTY_REASSIGNMENTS;
    const forHead = node.type === 'ForOfStatement' || node.type === 'ForInStatement' ? node.left
      : node.type === 'ForStatement' ? node.init : null;
    if (forHead?.type === 'VariableDeclaration' && forHead.kind !== 'var') {
      const names = [];
      for (const d of forHead.declarations) patternNames(d.id, names);
      return names;
    }
    if (node.type === 'SwitchStatement') {
      const names = [];
      for (const c of node.cases ?? []) for (const stmt of c.consequent ?? []) stmtRebindNames(stmt, names);
      return names;
    }
    if (!RUNTIME_BLOCK_TYPES.has(node.type)) return EMPTY_REASSIGNMENTS;
    const names = [];
    for (const stmt of node.body ?? []) stmtRebindNames(stmt, names);
    return names;
  }
  // names a var-scope boundary shadows: its params plus its hoisted vars (cached index)
  function boundaryShadowNames(node) {
    const names = [];
    for (const param of node.params ?? []) patternNames(param, names);
    for (const name of cachedScopeVars(node).keys()) names.push(name);
    return names;
  }
  function visit(node, atOwnerRoot) {
    if (!isASTNode(node)) return;
    const shadowNames = atOwnerRoot ? EMPTY_REASSIGNMENTS
      : isVarScopeBoundary(node.type) ? boundaryShadowNames(node)
      : blockShadowNames(node);
    // the switch DISCRIMINANT evaluates in the outer env before the case-block scope exists,
    // so its writes target the outer binding even when a case-level lexical shadows the name -
    // visit it UNSHADOWED, then only the cases under the shadow (a generic descent would
    // re-visit the discriminant and double-record its writes)
    if (node.type === 'SwitchStatement' && shadowNames.length) {
      visit(node.discriminant, false);
      push(shadowNames);
      for (const c of node.cases ?? []) visit(c, false);
      pop(shadowNames);
      return;
    }
    push(shadowNames);
    if (node.type === 'AssignmentExpression' && node.left?.type === 'Identifier') {
      record(node.left.name, node);
    } else if (node.type === 'UpdateExpression' && node.argument?.type === 'Identifier') {
      record(node.argument.name, node);
    } else if (node.type === 'AssignmentExpression'
      && (node.left?.type === 'ArrayPattern' || node.left?.type === 'ObjectPattern')) {
      for (const name of patternNames(node.left, [])) record(name, node);
    } else if (isForXStatement(node)) {
      // for-of / for-in head writing: a bare-Identifier / destructuring-pattern target
      // (`for (name of ...)`, `for ([name] of ...)`) or a `var` head (`for (var name in ...)`)
      if (node.left?.type === 'VariableDeclaration') {
        for (const d of node.left.declarations) for (const name of patternNames(d.id, [])) record(name, node);
      } else if (node.left) {
        for (const name of patternNames(node.left, [])) record(name, node);
      }
    }
    if (node.type === 'VariableDeclaration' && node.kind === 'var') {
      for (const d of node.declarations ?? []) {
        if (d.init) for (const name of patternNames(d.id, [])) record(name, d);
      }
    }
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) for (const v of value) visit(v, false);
      else visit(value, false);
    }
    pop(shadowNames);
  }
  visit(ownerNode, true);
  return index;
}
// every reassignment NODE of `name` within `ownerNode`'s subtree, stopping at nested scopes /
// blocks that shadow `name`. cached per owner via the all-names index above. shared by the
// var-hoist and the cross-boundary-`let` reassignment recovery, which differ only in how they
// locate `ownerNode`
function collectScopeReassignmentNodes(ownerNode, name) {
  let index = scopeReassignCache.get(ownerNode);
  if (!index) scopeReassignCache.set(ownerNode, index = buildScopeReassignmentIndex(ownerNode));
  return index.get(name) ?? EMPTY_REASSIGNMENTS;
}

// var-hoist reassignment recovery: estree-toolkit block-scopes a `var`, so its constantViolations miss
// a cross-block redeclaration / write. recompute from the AST at the var's function-scope owner
export function collectFunctionScopeVarReassignments(path, name) {
  const found = findVarOwnerDeclaring(path, name);
  if (!found) return [];
  // the scope-declaring var IS the binding's own declaration for the var-kind consumers
  // of this wrapper - excluded by identity so their reassignment gates stay unchanged
  return collectScopeReassignmentNodes(found.owner.node, name).filter(node => node !== found.declarator);
}

// UNFILTERED twin for the redecl machinery: a PARAM / hoisted binding owns no var
// declarator, so the scope-declaring var there is itself a re-declaration - ownership is
// decided positionally by the caller (`start > declStart`), not by scope-declaration
export function collectFunctionScopeVarWrites(path, name) {
  const found = findVarOwnerDeclaring(path, name);
  return found ? collectScopeReassignmentNodes(found.owner.node, name) : [];
}

// a `let` declarator is always statement-level, so the first of these hosts above its
// VariableDeclaration is the `let`'s own lexical scope. extends the block atoms with the unbraced
// Program, the loop heads (a for-head `let` scopes to the whole loop), and the switch body's
// single block scope - composed from the lattice primitives, not re-listed
export const LET_SCOPE_HOST_TYPES = new Set([
  ...RUNTIME_BLOCK_TYPES,
  ...FOR_X_STATEMENT_TYPES,
  'Program',
  'ForStatement',
  'SwitchStatement',
]);

// merge canonically-recovered reassignments the native scope model missed into a binding's
// violation list. the native trackers mis-scope some writes (babel places a switch DISCRIMINANT
// inside the case-block scope, so a discriminant write of a name that a case-level lexical
// shadows lands on the INNER binding; estree-toolkit drops cross-boundary let writes) - the
// canonical AST scan is the source of truth for the SET. native entries stay PATHS (their
// parent-chain carries deferred/captured precision); recovered extras are `{ node,
// canonicalRecovered: true }` markers that path-dependent analyses treat conservatively
// (possibly deferred, possibly captured, violating) while positional reads take `.node`.
// dedupe by containment: a native entry may record the assignment itself or just its target
// identifier, both sit inside the canonical node's range
export function withCanonicalViolations(binding, name) {
  const kind = binding?.kind;
  if (!binding?.path || !name || (kind !== 'var' && kind !== 'let' && kind !== 'const')) return binding;
  const canonical = kind === 'var'
    ? collectFunctionScopeVarReassignments(binding.path, name)
    : collectScopeLetReassignments(binding.path, name);
  if (!canonical.length) return binding;
  const known = (binding.constantViolations ?? []).map(violationNode).filter(Boolean);
  // a position-less native violation is a PLUGIN-MINTED rewrite of this binding's write (an
  // alias substitution): the canonical scan's memo may still hold the replaced original, so the
  // set comparison is unsound there - the alias machinery already owns that binding's flow
  if (known.some(k => k.start === undefined || k.start === null)) return binding;
  const extras = canonical
    // `var name = X` re-declarations are excluded: the type layer resolves redecl flow through
    // its dedicated stale-redecl machinery (positional, per-block precise) - a conservative
    // marker here would erase that precision. assignment-shaped writes stay
    .filter(node => node.type !== 'VariableDeclarator')
    .filter(node => node.start !== undefined && node.end !== undefined)
    .filter(node => known.every(k => !(k === node
      || (k.start !== undefined && k.start >= node.start && k.end <= node.end))))
    .map(node => ({ node, canonicalRecovered: true }));
  if (!extras.length) return binding;
  // recovered extras prove the binding IS reassigned - the spread must not carry the
  // native `.constant: true` verdict along (a `.constant`-gated consumer would then read
  // the stale init as the binding's value while the recovered write changed it at runtime)
  return { ...binding, constant: false, constantViolations: [...binding.constantViolations ?? [], ...extras] };
}

// the hoisted twin of a nested-block `var`, memoized per (declaration scope, name) so repeated
// lookups of the same var hand back ONE object - consumers compare bindings by identity. that key
// is deliberately a per-traversal object: a later traversal rebuilds its paths, and a node-keyed
// memo would hand it a twin still holding the dead one. the declarator search therefore runs before
// the memo can answer (it produces the key), which is why it stays bounded to the var owner.
// `null` (no such var / no use path) falls through to the caller's own miss handling
function hoistedVarTwin(synthCache, path, name) {
  if (!path) return null;
  const synth = synthVarHoistBinding(path, name);
  const declaratorPath = synth?.resolveDeclaratorPath();
  if (!declaratorPath) return null;
  // an incomplete write map cannot be handed to the flow gates - decline the twin entirely and let
  // the caller's own miss handling degrade to the generic answer, which is always sound
  const violationPaths = synth.resolveViolationPaths();
  if (!violationPaths) return null;
  const declarationScope = declaratorPath.scope;
  let byName = synthCache.get(declarationScope);
  if (!byName) synthCache.set(declarationScope, byName = new Map());
  let twin = byName.get(name);
  // mirror a NATIVE hoisted-var binding on every slot the type layer reads: the declarator `.path`,
  // the HOISTED `.scope` (the flow gates read it to place the use relative to the binding - a
  // declaration-scope answer would put every use past the declaring block outside it), and the
  // violations as PATHS (the flow layer climbs them; the synthetic shape keeps nodes for the alias
  // walkers instead). the synthesis-only slots are dropped rather than carried: `resolveDeclarationScope`
  // would answer a DIFFERENT scope than `.scope` on this same object, and one binding must not hold
  // two contradictory answers for a future reader to pick the wrong one from
  if (!twin) {
    const { resolveDeclaratorPath, resolveViolationPaths, resolveDeclarationScope, ownerScope, ...nativeShaped } = synth;
    byName.set(name, twin = {
      ...nativeShaped,
      path: declaratorPath,
      scope: ownerScope,
      constantViolations: violationPaths,
    });
  }
  return twin;
}

// wrap a scope-binding lookup so every consumer sees the canonically-merged violation list.
// the cache returns the SAME wrapped object per native binding - identity compares between
// two lookups of the same binding keep holding.
// a function-scoped `var` declared in a NESTED block is reported by one parser (which hoists it
// natively) and missed by the other (which scopes it to the block), so a use past that block found
// NOTHING here and every consumer silently degraded - the type widened to generic, a guard stopped
// narrowing. synthesize the hoisted twin off the declarator so both parsers answer alike. the twin
// carries the `.path` consumers read (annotation lookup, init descent, scope anchoring). a parser
// that DOES hoist never reaches the synthesis (its own lookup already answered), so this stays the
// no-op for it that the synthetic shape is documented to be
export function wrapScopeBindingLookup(lookup) {
  const cache = new WeakMap();
  const synthCache = new WeakMap();
  return (scope, name, path = null) => {
    const binding = lookup(scope, name, path) ?? hoistedVarTwin(synthCache, path, name);
    if (!binding) return binding;
    let wrapped = cache.get(binding);
    if (!wrapped) {
      wrapped = withCanonicalViolations(binding, name) ?? binding;
      cache.set(binding, wrapped);
    }
    return wrapped;
  };
}

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
  return scopeNode ? collectScopeReassignmentNodes(scopeNode, name) : [];
}

// per-loop-field control-flow traits, single-sourced so the USE-side re-run walk and the
// WRITE-side conditional-dominance walk cannot drift apart:
//   rerun - the back-edge re-executes the field each iteration, so a use there can observe a
//           textually-later write. a `for`'s TEST and UPDATE, a while/do-while TEST and a
//           for-in/of LEFT (its pattern defaults / computed keys) all re-run; only the `for`
//           INIT and the for-x RIGHT (the iterable) run once per entry.
//   conditional - the field executes 0+ times, so a write there does NOT dominate a later use.
//           the UPDATE runs only after a completed iteration; a TEST runs at least once when
//           the loop is reached, so it dominates like straight-line code. the do-while BODY
//           also runs at least once - kept conditional as the existing conservative direction
//           (dominance denied -> global unions, over-inject-safe). for-x LEFT writes carry
//           dynamic values, so dominance is never claimed for them through a separate gate
const LOOP_FIELD_TRAITS = {
  ForStatement: { body: { rerun: true, conditional: true }, test: { rerun: true }, update: { rerun: true, conditional: true } },
  // for-x LEFT is conditional too: a write nested in the left (pattern default / computed
  // member key) runs 0+ times - the zero-iteration path keeps the pre-loop value, so the
  // write must count as guarded, never as dominating a post-loop use
  ForInStatement: { body: { rerun: true, conditional: true }, left: { rerun: true, conditional: true } },
  ForOfStatement: { body: { rerun: true, conditional: true }, left: { rerun: true, conditional: true } },
  WhileStatement: { body: { rerun: true, conditional: true }, test: { rerun: true } },
  DoWhileStatement: { body: { rerun: true, conditional: true }, test: { rerun: true } },
};

function loopFieldsWithTrait(trait) {
  return Object.fromEntries(Object.entries(LOOP_FIELD_TRAITS)
    .map(([type, fields]) => [type, Object.keys(fields).filter(field => fields[field][trait])]));
}

const LOOP_RERUN_FIELDS = Object.fromEntries(Object.entries(loopFieldsWithTrait('rerun'))
  .map(([type, fields]) => [type, new Set(fields)]));

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

// container-path materialization cache: `parent.get('body')` re-creates the wrapper array and
// re-runs the context refresh on EVERY child path each call - re-materializing a several-
// thousand-statement Program body per sibling query is the dominant path churn on large flat
// scopes. keyed on the traversal-scoped parent PATH (dies with the traversal).
// revalidation is O(1) - length plus head / middle / tail identity anchors - NOT a full
// element loop (that loop itself went quadratic across per-use sibling queries): every
// structural statement edit the emitters perform (insertBefore / remove / replaceWithMultiple /
// scope-push unshift) changes the length or shifts an anchor, and a same-slot `replaceWith`
// is identity-transparent (paths are the parser's canonical per-node objects - the swap
// updates `.node` on the very object the cache holds). an interior balanced insert+remove
// between retrievals is the one escaping shape - no emitter produces it, and the sibling
// caches' accepted staleness contract (`bodyFlowIndex` never revalidates at all) already
// tolerates coarser drift
const containerPathsCache = new WeakMap();
export function cachedContainerPaths(parentPath, key) {
  let perKey = containerPathsCache.get(parentPath);
  if (!perKey) containerPathsCache.set(parentPath, perKey = new Map());
  const container = parentPath.node?.[key];
  const cached = perKey.get(key);
  if (cached && Array.isArray(container) && cached.length === container.length) {
    const last = container.length - 1;
    if (container.length === 0
      || (cached[0].node === container[0]
        && cached[last].node === container[last]
        && cached[last >> 1].node === container[last >> 1])) return cached;
  }
  const paths = parentPath.get(key);
  perKey.set(key, paths);
  return paths;
}

// ONE walk per owner maps every node to its parent - the positional predicates below climb
// the spine in O(depth) instead of re-walking the whole owner per target (quadratic on
// binding-heavy bundles). same per-node staleness contract as the sibling caches
const ownerParentIndexCache = new WeakMap();
function ownerParentIndex(ownerNode) {
  let parents = ownerParentIndexCache.get(ownerNode);
  if (parents) return parents;
  parents = new Map();
  (function visit(node) {
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) {
        for (const v of value) {
          if (isASTNode(v)) {
            parents.set(v, node);
            visit(v);
          }
        }
      } else if (isASTNode(value)) {
        parents.set(value, node);
        visit(value);
      }
    }
  })(ownerNode);
  ownerParentIndexCache.set(ownerNode, parents);
  return parents;
}

// the field of `parent` holding `child` (direct or as an array element), or null
function parentFieldOf(parent, child) {
  for (const [key, value] of Object.entries(parent)) {
    if (value === child || (Array.isArray(value) && value.includes(child))) return key;
  }
  return null;
}

// does `target` sit inside a loop RE-RUN region within `ownerNode`'s var scope (a field the
// back-edge re-executes each iteration)? a nested var-scope boundary on the spine means the
// walk this replaces never reached the target. shared by the named-declarator check below and
// the usage-pure reachability gate - a use re-run by a loop back-edge can observe a
// textually-later write
const nodeSitsInLoopRerunWithin = memoizeByNodePair((ownerNode, target) => {
  const parents = ownerParentIndex(ownerNode);
  for (let child = target; child !== ownerNode;) {
    const parent = parents.get(child);
    if (!parent) return false;
    if (parent !== ownerNode && isVarScopeBoundary(parent.type)) return false;
    if (LOOP_RERUN_FIELDS[parent.type]?.has(parentFieldOf(parent, child))) return true;
    child = parent;
  }
  return false;
});

export function isVarDeclaratorInLoopBody(path, name) {
  const owner = findNearestVarScopeOwner(path);
  const target = owner && cachedScopeVars(owner.node).get(name);
  if (!target) return false;
  return nodeSitsInLoopRerunWithin(owner.node, target);
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
  // loop fields derive from the shared trait table above
  ...loopFieldsWithTrait('conditional'),
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
// guarding it, or null when not found (a nested var-scope boundary on the spine - `var`
// doesn't hoist across them). resolved by climbing the shared parent index: outermost-first
// order comes from reversing the climb. array-valued branch fields (a switch-case body has no
// wrapper node) record the parent as the guard, object-valued ones the branch node itself
const collectVarGuardsToDeclarator = memoizeByNodePair((ownerNode, target) => {
  const parents = ownerParentIndex(ownerNode);
  if (target !== ownerNode && !parents.has(target)) return null;
  const guards = [];
  for (let child = target; child !== ownerNode;) {
    const parent = parents.get(child);
    if (!parent) return null;
    if (parent !== ownerNode && isVarScopeBoundary(parent.type)) return null;
    const branchFields = CONDITIONAL_BRANCH_FIELDS[parent.type];
    if (branchFields) {
      const field = parentFieldOf(parent, child);
      if (branchFields.includes(field)) guards.push(Array.isArray(parent[field]) ? parent : child);
    }
    child = parent;
  }
  guards.reverse();
  // a for-of / for-in HEAD write assigns the loop variable only when the iterable yields at
  // least once; both adapters record the LOOP node itself as the reassignment site (not its
  // `left`), so treat such a loop as its own guard - a use after the loop never sits under it,
  // so the head write doesn't dominate (usage-global keeps resolving the alias, over-inject-safe;
  // usage-pure still bails since the write isn't after the use). a use INSIDE the body is already
  // excluded by nodeDominatesUsage's precedence check (the loop doesn't end before it).
  // a logical-assignment is likewise conditional - record it as its own guard so a use after it
  // (not nested under the short-circuit write) is not treated as dominated by it
  if (isForXStatement(target) || isLogicalAssignReassignment(target, ownerNode)) guards.push(target);
  return guards;
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

// does `node` end at or before the read at `readNode` begins? a `var` hoists the declaration but not
// the assignment, so a use before the declarator reads `undefined`; symmetrically a reassignment AFTER
// the read can't have changed the value read there. `readNode` is the use node, or a multi-hop alias
// hop's read-site override. unknown positions -> true: don't over-bail the global-dominance check
function nodePrecedesUsage(node, readNode) {
  return endsBeforeStart(node, readNode, true);
}

// inverse direction for the usage-pure reachability gate: the write `node` lies textually STRICTLY
// after the read at `readNode` (the use node, or a multi-hop alias hop's read-site override).
// unknown positions -> false: pure can't prove the write is after the read, so bail
function usagePrecedesNode(readNode, node) {
  return endsBeforeStart(readNode, node, false);
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

// the aliasing write's guard verdict for a body-extract registration: a hoisted `var`
// DECLARATOR in a conditional branch (`if (c) { var { iterator } = Symbol; }`) or an
// assignment-form write under any branch assigns on ONE path only, while the binding is
// readable on every path - a registered fold source would substitute the polyfill on the
// untaken path where the runtime value is undefined. judged at REGISTRATION time: the tree
// is pristine there, while a fold-time walk sees the emitter's in-place rewrite
// (re-minted / positionless nodes) and cannot anchor the dominance question
export function isGuardedAliasingWrite(binding) {
  const declarator = binding?.path?.node ?? binding?.node;
  if (declarator?.type !== 'VariableDeclarator') return false;
  let writeNode = declarator;
  let anchorPath = binding.path ?? null;
  if (declarator.init) {
    // declarator form: only a hoisted `var` leaks past its branch (let / const are block-scoped)
    if (binding.kind !== 'var') return false;
  } else {
    // assignment form: the write site is the aliasing assignment. babel records the
    // AssignmentExpression path, estree records the bound identifier inside the LHS
    // pattern (climb its path), a synthetic var-hoist binding records the raw node.
    // filter valueless redeclarations first: a bare `var X;` twin lands at index 0 as a
    // phantom (no value flows), and neither sub-branch matches it - the guard would report
    // "not guarded" and the read wrongly folds on the untaken path of the REAL guarded write
    const [violation] = withoutValuelessDeclarationViolations(binding.constantViolations) ?? [];
    const node = violation?.node ?? violation;
    if (node?.type === 'AssignmentExpression') {
      writeNode = node;
      if (violation?.parentPath) anchorPath = violation;
    } else if (node?.type === 'Identifier' && violation?.parentPath) {
      let p = violation;
      while (p && p.node?.type !== 'AssignmentExpression'
        && (p.node?.type === 'Identifier' || p.node?.type === 'Property'
          || p.node?.type === 'ObjectProperty' || p.node?.type === 'ObjectPattern')) {
        p = p.parentPath;
      }
      if (p?.node?.type !== 'AssignmentExpression') return false;
      writeNode = p.node;
      anchorPath = p;
    } else return false;
  }
  const ownerNode = binding.ownerNode ?? (anchorPath ? findNearestVarScopeOwner(anchorPath)?.node : null);
  if (!ownerNode) return false;
  const guards = collectVarGuardsToDeclarator(ownerNode, writeNode);
  return !!guards?.length;
}

// SOUND gate for resolving a function-scoped `var` alias to a global. `var` hoists to the whole
// function, so `if (c) { var M = globalThis } M.Map()` binds M everywhere - but M holds the global
// only when `c` was truthy; usage-pure would rewrite the use to a receiver-less polyfill and mask
// the native TypeError on the c-falsy path. holds iff the declarator DOMINATES the use - via the
// shared `nodeDominatesUsage` with `climb: true`, so an init captured from an OUTER scope by a
// later-defined closure still counts. a declarator not located in any enclosing scope defaults to
// dominating (it is the declaration)
export function varInitDominatesUsage({ declaratorNode, usagePath, usageNode = null, kind = null }) {
  // domination is a real question ONLY for hoisted `var` (a conditional `if (c) { var M = ... }`
  // binds everywhere but assigns on one path). a `let` / `const` read before its declarator
  // executes throws natively (TDZ), so a LEGAL use is always dominated - skip the walk. this
  // gate carries the hot-path cost: without it every clean const resolution paid a full
  // owner-subtree scan (O(sites x N) on ordinary files). `usageNode` overrides the read position
  // like in the reachability mirrors: a destructure capture / alias hop reads the value there,
  // so the init must dominate THAT point, not the eventual use (`const { [k]: S } = g; var k = 'x'`
  // reads the hoisted undefined at the capture even though the declarator precedes the use)
  if (kind && kind !== 'var') return true;
  // no position to prove dominance against: a hoisted `var` init may be conditional or sit
  // after the read, and every pure caller of this gate rewrites on proof - bail the var kind
  // (`kind === null` legacy callers keep the open default; their arms flat-bail earlier)
  if (!usagePath) return kind !== 'var';
  const owner = findNearestVarScopeOwner(usagePath);
  if (!owner) return true;
  const dominates = nodeDominatesUsage({ node: declaratorNode, usagePath, owner, climb: true, usageNode });
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
  if (nodeSitsInLoopRerunWithin(owner.node, usageNode ?? usagePath.node)) return false;
  return reassignmentNodes.some(node => nodeDominatesUsage({ node, usagePath, owner, climb: false, usageNode }));
}

// per-node counterpart to nodeDominatesUsage for the SUBSTITUTE direction: does reassignment `node`
// lie strictly AFTER the read at `readNode` within its OWN var-scope `owner`? a node beyond that
// boundary (guards === null - a nested closure) could run before the read, so it does NOT qualify
function nodeFollowsUsageInScope({ node, readNode, owner }) {
  return collectVarGuardsToDeclarator(owner.node, node) !== null && usagePrecedesNode(readNode, node);
}

// SOUND gate for the SUBSTITUTE (usage-pure) direction: does the declarator-init value provably
// reach `usagePath` UNMODIFIED on every path - i.e. can NO reassignment run before the read? pure
// rewrites to a receiver-less polyfill, so a wrong "yes" masks the native value - resolve only on
// PROOF. holds iff the read runs at most once (not in a loop body, where a back-edge re-runs a
// textually-later write before it) AND every reassignment sits in the read's OWN var-scope owner (a
// write beyond it lives in a closure that may run earlier) textually STRICTLY after the read. no
// reassignment -> the init trivially reaches. mirror of reassignmentDominatesUsage (global bails only
// when the init is provably DEAD; pure resolves only when it is provably the LIVE value). `usageNode`
// overrides the read position like in the mirror: an alias hop / destructure CAPTURE reads the value
// there, so a same-scope write between the capture and the eventual use cannot reach the captured value
export function noReassignmentReachesUsage({ reassignmentNodes, usagePath, usageNode = null }) {
  if (!usagePath) return false;
  if (!reassignmentNodes?.length) return true;
  const owner = findNearestVarScopeOwner(usagePath);
  if (!owner) return false;
  const readNode = usageNode ?? usagePath.node;
  if (nodeSitsInLoopRerunWithin(owner.node, readNode)) return false;
  return reassignmentNodes.every(node => nodeFollowsUsageInScope({ node, readNode, owner }));
}

// the RHS of the `=` assignment for a reassignment site, normalized across adapters: babel records
// the AssignmentExpression node directly; estree-toolkit records the target Identifier (the LHS), so
// locate the enclosing `name = <expr>` in `ownerNode` to read its right operand. null for a non-plain
// write (`name++` / `name += x`) whose value isn't a simple replacement
function reassignmentRhs(node, ownerNode) {
  if (node.type === 'AssignmentExpression') return node.operator === '=' ? node.right : null;
  if (node.type !== 'Identifier') return null;
  // the shared owner index resolves the enclosing assignment; only a PLAIN `=` whose LHS is
  // this very identifier flows a recoverable RHS (a pattern-contained id maps to its
  // assignment too, but its value is a slot, not the whole RHS - the pattern-aware variant
  // below owns that shape)
  const assignment = ownerValueFlowIndex(ownerNode).assignment.get(node);
  return assignment?.operator === '=' && assignment.left === node ? assignment.right : null;
}

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
    return values.length === 1 && !patternSlotHasDefault(left, bindingName)
      && !patternSlotSpreadShifted(left, assignment.right, bindingName) ? values[0] : null;
  }
  return reassignmentRhs(node, ownerNode);
}

// does the binding `name` reach through a slot default (`[A = X]` / `{ A = X }`), at the top level
// OR nested (`{ k: { A } = X }`, `{ k: { A = X } }`)? a default makes the value ambiguous
// (default-or-runtime), so the reaching-definition recovery must bail rather than fold the default's
// value - folding it silently mis-narrows `name` when the runtime slot is present (a WRONG result)
export function patternSlotHasDefault(pattern, name) {
  return patternBindsNameUnderDefault(pattern, name, false);
}
// does the pattern bind `name` in ANY slot (identifier leaf, renamed value, rest, nested,
// with or without a default)? the `underDefault=true` seed makes every reached Identifier
// leaf count; the default-only variant above seeds false and counts only default-guarded slots
export function patternBindsName(pattern, name) {
  return patternBindsNameUnderDefault(pattern, name, true);
}
function patternBindsNameUnderDefault(node, name, underDefault) {
  while (true) {
    switch (node?.type) {
      case 'Identifier': return underDefault && node.name === name;
      case 'AssignmentPattern':
        node = node.left;
        underDefault = true;
        continue;
      case 'RestElement':
      case 'SpreadElement':
        node = node.argument;
        continue;
      case 'ArrayPattern': return node.elements.some(el => patternBindsNameUnderDefault(el, name, underDefault));
      case 'ObjectPattern': return node.properties.some(prop => patternBindsNameUnderDefault(
        prop.type === 'RestElement' || prop.type === 'SpreadElement' ? prop.argument : prop.value, name, underDefault));
      default: return false;
    }
  }
}

export function reachingReassignmentValueNode({ binding, usagePath, ctx = null, usageNode = null }) {
  if (!usagePath) return null;
  const owner = findNearestVarScopeOwner(usagePath);
  if (!owner) return null;
  // `usageNode` overrides the textual read position for a multi-hop alias hop (`const b = a` reads `a`
  // at the declarator, not at the eventual use of `b`): a write to `a` AFTER that read does not reach
  // the captured value, so it is excluded below and the live declarator-init resolves
  const readNode = usageNode ?? usagePath.node;
  if (nodeSitsInLoopRerunWithin(owner.node, readNode)) return null;
  const bindingName = binding.node?.id?.type === 'Identifier' ? binding.node.id.name : null;
  const before = reassignmentNodesBeyondDeclarator(binding).filter(node => nodePrecedesUsage(node, readNode));
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
  const dominating = before.filter(node => nodeDominatesUsage({ node, usagePath, owner, climb: true, usageNode }) === true);
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
// enumeration + completeness: `complete` is TRUE only when EVERY reachable write yielded at
// least one value node - a write shape the pairing cannot decompose makes the value set open
// and MIGHT-gated consumers must stay conservative (e.g. keep the typeless instance dispatch)
export function reassignmentValueEnumeration({ binding, usagePath, name = null, ctx = null, usageNode = null }) {
  if (!binding?.constantViolations?.length) return { nodes: [], complete: true };
  if (!usagePath) return { nodes: [], complete: false };
  const owner = findNearestVarScopeOwner(usagePath);
  if (!owner) return { nodes: [], complete: false };
  return reassignmentValueEnumerationCore({ binding, usagePath, owner, name, ctx, usageNode });
}

export function reassignmentValueNodes({ binding, usagePath, name = null, ctx = null, usageNode = null }) {
  return reassignmentValueEnumeration({ binding, usagePath, name, ctx, usageNode }).nodes;
}

function reassignmentValueEnumerationCore({ binding, usagePath, owner, name, ctx, usageNode }) {
  // adapter wrappers do not all surface the bound identifier - callers that know the alias
  // name pass it explicitly (needed only for pattern-LHS pairing)
  const bindingName = name ?? binding.identifier?.name ?? binding.path?.node?.id?.name ?? null;
  // `usageNode` is a multi-hop alias hop's read site: a transitive source's write AFTER that read
  // (`const a = src; src = X`) cannot reach the captured value, so it is not a reachable union value
  const readNode = usageNode ?? usagePath.node;
  const useInLoop = nodeSitsInLoopRerunWithin(owner.node, readNode);
  // an Identifier-shaped violation (adapters that record the LHS Identifier) resolves its
  // enclosing assignment by subtree search - anchor that search at the BINDING's own scope
  // block, not the usage's var-scope owner: a use inside an inner function (a param default,
  // a closure body) has an owner that does not contain an outer-scope write. babel scopes
  // carry the AST node on `.block`, estree-toolkit ones on `.path.node`
  const violationSearchRoot = binding.scope?.block ?? binding.scope?.path?.node ?? owner.node;
  const out = [];
  let complete = true;
  for (const node of reassignmentNodesBeyondDeclarator(binding)) {
    if (!useInLoop && endsBeforeStart(readNode, node, false)) continue;
    const values = reassignmentValueNodesAt(node, violationSearchRoot, bindingName, ctx);
    if (!values.length) complete = false;
    out.push(...values);
  }
  return { nodes: out, complete };
}

// assignment operators that flow the RHS into the LHS binding as a POSSIBLE value: plain `=`
// plus the logical forms (`A ||= Map` makes Map reachable). compound arithmetic (`+=`) and
// updates produce derived values, not replacements, and stay out
export const VALUE_FLOW_ASSIGN_OPS = new Set(['=', ...LOGICAL_ASSIGN_OPS]);

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

// every POSSIBLE rhs element for array-wrap slot i under the value-UNION contract: the exact
// positional pair while positions are static, every static element from the first spread on once
// a spread has shifted them (a zero-length spread pairs i to the next static, a longer one to the
// spread's own unenumerable items - `patternSlotSpreadShifted` reports that incompleteness)
export function arrayWrapSlotValueCandidates(elements, i) {
  if (!spreadAtOrBefore(elements, i)) return elements[i] ? [elements[i]] : [];
  return elements.slice(elements.findIndex(e => e?.type === 'SpreadElement'))
    .filter(e => e && e.type !== 'SpreadElement')
    .flatMap(flattenSlotUnionArms);
}

// a candidate that is ITSELF a union contributes each arm as its own possible value (`&&` stays
// whole - its falsy LEFT is the expression's value, never collapsible). candidates feed
// MIGHT-gated consumers only, so losing the union's completeness is fine there - the exact-pair
// path never flattens, and pure precision gates on `patternSlotSpreadShifted` before reading
function flattenSlotUnionArms(node) {
  if (node?.type === 'ConditionalExpression') {
    return [node.consequent, node.alternate].flatMap(flattenSlotUnionArms);
  }
  if (node?.type === 'LogicalExpression' && node.operator !== '&&') {
    return [node.left, node.right].flatMap(flattenSlotUnionArms);
  }
  return [node];
}

// the POSITIONALLY-paired init element for an array-wrap pattern slot: array destructuring binds
// pattern element `index` to the init element at the SAME index, but positions are static only up
// to the first spread - a spread at or before the slot shifts every later runtime position, so
// pairing past it is unsound. `null` = no sound pairing (unbound name, spread-shifted or absent
// element) - callers bail rather than judge a foreign element. single source for the array-wrap
// positional pairing repeated across the alias / ctor / symbol / receiver resolvers
export function pairedArrayWrapInitElement(initElements, index) {
  if (index < 0 || spreadAtOrBefore(initElements, index)) return null;
  return initElements?.[index] ?? null;
}

// descend array-wrap layers (`const [x, { Array: A }] = [expr, globalThis]`) to the innermost
// pattern/init pair binding `name`: each ArrayPattern level pairs the slot that binds the name
// with its positional init element (spread-shifted / absent pairing bails). returns the peeled
// `{ id, init }` (id = the slot with any `= default` unwrapped) or `null` when no sound pairing
// exists. shared by the destructured-global resolver and the class-walk symbol-alias
// chain-follow, which must agree on nesting
export function peelArrayWrapBindingLayers(id, init, name) {
  while (id?.type === 'ArrayPattern' && init?.type === 'ArrayExpression') {
    const idx = id.elements.findIndex(element => element && arrayWrapSlotBindsName(element, name));
    const paired = pairedArrayWrapInitElement(init.elements, idx);
    if (!paired) return null;
    id = id.elements[idx].type === 'AssignmentPattern' ? id.elements[idx].left : id.elements[idx];
    init = paired;
  }
  return { id, init };
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
    const decl = binding?.path?.node ?? binding?.node;
    // only a PLAIN declarator binds the name to its init: a destructure declarator binds a
    // SELECTED slot, so blindly returning the whole init would smuggle the container in place
    // of the slot value (pattern pairing is `patternSlotValues`' job)
    if (decl?.type === 'VariableDeclarator' && decl.id?.type !== 'Identifier') break;
    const init = decl?.init;
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
  function slotFor(target) {
    return target?.type === 'AssignmentPattern' ? target.left : target;
  }
  // a const-identifier rhs bound to a literal (`const arr = [Map]; [A] = arr`) - follow it so the
  // pairing sees the underlying array / object, like the direct-literal form
  rhs = followConstLiteralAlias(rhs, ctx);
  // a computed property key (`{ [k]: A }`) resolves through the read-side key canon when a ctx is
  // supplied; the binding-blind static-name fallback covers literal keys for ctx-less callers.
  // the key EVALUATES at the destructure site - anchor the canon's reaching-value analysis on
  // the PATTERN (source positions survive rewrites), or a key reassigned AFTER the capture
  // would resolve to its post-capture value: a wrong-value pairing
  function propKey(prop) {
    return ctx?.resolveKey
      ? ctx.resolveKey({
        node: prop.key, computed: prop.computed, scope: ctx.scope, adapter: ctx.adapter,
        path: ctx.path, usageNode: ctx.usageNode ?? pattern,
      })
      : propertyKeyName(prop);
  }
  // a nested pattern slot (`[[M]]` / `{ x: [M] }`) pairs against the slot's RHS positionally /
  // by key - recurse so a binding bound through arbitrary nesting still surfaces its value union;
  // the slot's own default is an alternative RHS the nested bindings may pair against instead
  function descend(slot, element, pairedRhs) {
    if (slot?.type !== 'ArrayPattern' && slot?.type !== 'ObjectPattern') return false;
    if (pairedRhs) out.push(...patternSlotValues(slot, pairedRhs, name, ctx));
    if (element.type === 'AssignmentPattern') out.push(...patternSlotValues(slot, element.right, name, ctx));
    return true;
  }
  if (pattern?.type === 'ArrayPattern') {
    for (let i = 0; i < pattern.elements.length; i++) {
      const element = pattern.elements[i];
      const slot = slotFor(element);
      // a spread at or before slot i shifts every later position by the spread's runtime length,
      // so `rhs.elements[i]` is no longer THE value that lands in slot i. under the value-UNION
      // contract every static element from the first spread on is still a POSSIBLE slot value
      // (a zero-length spread pairs i to the next static, a longer one to the spread's own items),
      // so enumerate them all; the spread's items stay unenumerable, which
      // `patternSlotSpreadShifted` reports to consumers that need the union to be COMPLETE
      const candidates = rhs?.type === 'ArrayExpression' ? arrayWrapSlotValueCandidates(rhs.elements, i) : [];
      if (slot?.type === 'ArrayPattern' || slot?.type === 'ObjectPattern') {
        for (const cand of candidates) out.push(...patternSlotValues(slot, cand, name, ctx));
        if (element.type === 'AssignmentPattern') out.push(...patternSlotValues(slot, element.right, name, ctx));
        continue;
      }
      if (slot?.type !== 'Identifier' || slot.name !== name) continue;
      if (element.type === 'AssignmentPattern') out.push(element.right);
      out.push(...candidates);
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
      // a destructure from a RECEIVER (`({ Promise: M } = globalThis)`): the slot's reaching
      // value is the receiver's member - synthesize it so the reaching resolution sees
      // `globalThis.Promise` exactly like the identifier-assignment form (`M = globalThis.Promise`).
      // an unresolvable receiver just fails downstream resolution, same as no value
      // inherit `rhs`'s source position so a downstream reassignment-dominance check can anchor at the
      // capture read (where the receiver was destructured), not fall back to the host use - a positionless
      // synthetic node made a reassign-after-capture receiver look dominated and wrongly bailed
      else if (key !== null && isReceiverShapedNode(rhs)) {
        out.push({
          type: 'MemberExpression', object: rhs, property: { type: 'Identifier', name: key },
          computed: false, start: rhs.start, end: rhs.end,
        });
      }
    }
  }
  return out;
}

// does the binding `name` pair through a SPREAD-SHIFTED array slot (`[, { x: A }] = [...xs, V]`)?
// there the enumerated candidates are an over-approximation whose union is INCOMPLETE (the spread's
// own items are unenumerable), so a precision-needing consumer must not read a lone candidate as
// certain - the maybe-union stays sound for inject-if-might. the object twin needs no predicate:
// an overriding trailing spread already pairs nothing there. mirrors `patternSlotHasDefault`
export function patternSlotSpreadShifted(pattern, rhs, name) {
  if (pattern?.type !== 'ArrayPattern') return false;
  for (let i = 0; i < pattern.elements.length; i++) {
    const element = pattern.elements[i];
    if (!element || !patternBindsIdentifier(element, id => id.name === name)) continue;
    if (rhs?.type === 'ArrayExpression' && spreadAtOrBefore(rhs.elements, i)) return true;
    const slot = element.type === 'AssignmentPattern' ? element.left : element;
    const paired = rhs?.type === 'ArrayExpression' ? rhs.elements[i] : null;
    if (slot?.type === 'ArrayPattern' && patternSlotSpreadShifted(slot, paired, name)) return true;
    if (element.type === 'AssignmentPattern'
      && patternSlotSpreadShifted(slot, element.right, name)) return true;
  }
  return false;
}

// every POSSIBLE value a reassignment site flows into the binding: a value-flow assignment's
// RHS for a plain Identifier LHS, the paired slot values (incl. defaults) for a pattern LHS
function reassignmentValueNodesAt(node, ownerNode, bindingName, ctx) {
  if (node.type === 'AssignmentExpression') {
    if (!VALUE_FLOW_ASSIGN_OPS.has(node.operator)) return [];
    if (node.left?.type === 'Identifier') return [node.right];
    return bindingName ? patternSlotValues(node.left, node.right, bindingName, ctx) : [];
  }
  // a for-x HEAD rebinds the alias each iteration; parsers record it unevenly (babel: the
  // ForXStatement or the init-less head declarator; estree: the LHS Identifier or nothing).
  // a for-OF over an ARRAY LITERAL flows each element as a possible value; for-in keys and
  // opaque / spread-bearing iterables enumerate nothing (the write still poisons cleanliness
  // through the canonical write scan - only the VALUE union has nothing to add)
  if (FOR_X_STATEMENT_TYPES.has(node.type)) return forXHeadValueNodes(node, bindingName, ctx);
  if (node.type === 'VariableDeclarator' && !node.init) {
    const forX = enclosingForXStatement(node, ownerNode);
    return forX ? forXHeadValueNodes(forX, bindingName, ctx) : [];
  }
  if (node.type !== 'Identifier') return [];
  const assignment = enclosingValueFlowAssignment(node, ownerNode);
  if (assignment) {
    if (assignment.left === node) return [assignment.right];
    return patternSlotValues(assignment.left, assignment.right, node.name, ctx);
  }
  const forX = enclosingForXStatement(node, ownerNode);
  return forX ? forXHeadValueNodes(forX, bindingName ?? node.name, ctx) : [];
}

function forXHeadValueNodes(forX, bindingName, ctx) {
  if (forX.type !== 'ForOfStatement') return [];
  // sequence wrappers are value-transparent (a sequence yields its tail): peel them off the
  // iterable AND off each element, so `(eff(), [X])` and `[(eff(), X)]` both enumerate X -
  // usage-global keeps the source text verbatim, so the peeled prefix effects are untouched
  const rhs = peelNestedSequenceExpressions(unwrapRuntimeExpr(forX.right)).tail;
  if (rhs?.type !== 'ArrayExpression' || !rhs.elements?.length) return [];
  if (rhs.elements.some(e => e?.type === 'SpreadElement')) return [];
  const elements = rhs.elements.filter(Boolean)
    .map(e => peelNestedSequenceExpressions(unwrapRuntimeExpr(e)).tail);
  let { left } = forX;
  if (left?.type === 'VariableDeclaration') left = left.declarations?.[0]?.id ?? null;
  if (left?.type === 'Identifier') return elements;
  // a PATTERN head binds a slot of each element, not the element itself: pair the bound
  // name's slot against every element so `for ([M] of [[Array]])` reaches Array
  if ((left?.type === 'ArrayPattern' || left?.type === 'ObjectPattern') && bindingName) {
    return elements.flatMap(el => patternSlotValues(left, el, bindingName, ctx));
  }
  return [];
}

// ONE walk per owner indexes every write-target node to its enclosing statement: a value-flow
// assignment's LHS (the node itself, plus every identifier inside a pattern LHS) and a for-x
// head's declarators / bound identifiers. the per-violation subtree SEARCH this replaces
// re-walked the whole owner per violation node - quadratic on reassignment-heavy bundles.
// identity keys are unique (a node occupies one AST position), so first-found and map lookup
// agree; same per-node staleness contract as the sibling caches
const valueFlowOwnerIndexCache = new WeakMap();
function ownerValueFlowIndex(ownerNode) {
  let index = valueFlowOwnerIndexCache.get(ownerNode);
  if (index) return index;
  index = { assignment: new Map(), forX: new Map() };
  valueFlowOwnerIndexCache.set(ownerNode, index);
  (function visit(n) {
    if (!isASTNode(n)) return;
    if (n.type === 'AssignmentExpression' && VALUE_FLOW_ASSIGN_OPS.has(n.operator) && n.left) {
      index.assignment.set(n.left, n);
      if (n.left.type === 'ArrayPattern' || n.left.type === 'ObjectPattern') {
        walkPatternIdentifiers(n.left, id => index.assignment.set(id, n));
      }
    } else if (FOR_X_STATEMENT_TYPES.has(n.type) && n.left) {
      index.forX.set(n.left, n);
      if (n.left.type === 'VariableDeclaration') {
        for (const d of n.left.declarations ?? []) {
          index.forX.set(d, n);
          if (d.id) index.forX.set(d.id, n);
        }
      } else if (n.left.type === 'ArrayPattern' || n.left.type === 'ObjectPattern') {
        walkPatternIdentifiers(n.left, id => index.forX.set(id, n));
      }
    }
    for (const value of Object.values(n)) {
      if (Array.isArray(value)) for (const v of value) visit(v);
      else visit(value);
    }
  })(ownerNode);
  return index;
}

// the for-x statement whose LEFT records this violation node (the head declarator, or the
// LHS identifier - direct or inside a pattern)
function enclosingForXStatement(node, ownerNode) {
  return ownerValueFlowIndex(ownerNode).forX.get(node) ?? null;
}

// estree-toolkit records the target Identifier - the enclosing value-flow assignment whose
// LHS is (or contains, for patterns) this identifier
function enclosingValueFlowAssignment(node, ownerNode) {
  return ownerValueFlowIndex(ownerNode).assignment.get(node) ?? null;
}

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
  return collectFunctionScopeVarWrites(usagePath, name)
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
// a bare same-name redeclaration (`var { Map: M } = g; var M;`) writes NO value, yet both
// scope trackers record it as a constantViolation - a phantom for every value-flow consumer.
// the shape differs per parser: babel records the valueless DECLARATOR itself, estree-toolkit
// records the redeclared IDENTIFIER (whose declarator parent carries no init). a for-x head
// declarator also has no init, but its per-iteration rebind is a real write and stays.
// filter both shapes so the alias binding-shape guards and the trust predicates see real
// writes only - a one-shape filter would keep the emitters' poison decisions diverged
export function withoutValuelessDeclarationViolations(violations) {
  if (!violations?.length) return violations;
  const filtered = violations.filter(v => {
    const node = v?.node ?? v;
    // an init-less declarator whose declaration heads a for-x IS a real write (the loop
    // assigns each iteration) - only the plain valueless self-record strips. mirrors the
    // estree Identifier branch below; babel records the for-x head as the DECLARATOR, so
    // the statement sits one level closer (declarator -> declaration -> for-x)
    if (node?.type === 'VariableDeclarator' && !node.init
      && !FOR_X_STATEMENT_TYPES.has(v?.parentPath?.parentPath?.node?.type)) return false;
    if (node?.type === 'Identifier') {
      const declarator = v?.parentPath?.node;
      if (declarator?.type === 'VariableDeclarator' && !declarator.init && declarator.id === node
        && !FOR_X_STATEMENT_TYPES.has(v.parentPath.parentPath?.parentPath?.node?.type)) return false;
    }
    return true;
  });
  return filtered.length === violations.length ? violations : filtered;
}

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
  const own = binding?.path?.node ?? binding?.node;
  // a `var` binding's violation record is parser-UNEVEN for for-x heads: babel records the
  // init-less head declarator, estree records nothing at all - so the recorded-violation
  // count alone under-poisons a rebound alias on the estree side. recover the canonical
  // function-scope write set from the AST (it sees for-x heads on both parsers) and take
  // the larger count; the recovered set excludes the binding's own declarator by identity
  const aliasName = binding?.identifier?.name ?? binding?.name ?? null;
  const canonicalWrites = binding?.kind === 'var' && binding?.path && aliasName
    ? collectFunctionScopeVarReassignments(binding.path, aliasName)
      .filter(node => node !== own && node !== own?.id).length
    : 0;
  const writes = (withoutValuelessDeclarationViolations(binding?.constantViolations) ?? [])
    .filter(v => !isDeclaratorSelfViolation(v, own))
    .length;
  const total = Math.max(writes, canonicalWrites);
  return total === 0 || (total === 1 && !binding.path?.node?.init);
}

// estree-toolkit records a loop head's per-iteration rebind as a violation of the head's OWN
// binding: a bare id head via the id node, a DESTRUCTURING declarator via the bound identifier
// INSIDE its own pattern - climb pattern shells to the declarator to recognise the latter.
// a declaration is not a reassignment of itself
export function isDeclaratorSelfViolation(v, ownDeclarator) {
  const node = violationNode(v);
  if (node === ownDeclarator || node === ownDeclarator?.id) return true;
  if (node?.type === 'Identifier' && v?.parentPath) {
    for (let p = v.parentPath; p; p = p.parentPath) {
      if (p.node === ownDeclarator) return true;
      const type = p.node?.type;
      if (type !== 'Property' && type !== 'ObjectProperty' && type !== 'ObjectPattern'
        && type !== 'ArrayPattern' && type !== 'RestElement' && type !== 'AssignmentPattern') break;
    }
  }
  return false;
}

// the real reassignment site nodes (every violation other than the loop-reinit declarator-self).
// counting the self-rebind sent every `for (const k in ...)` body read - and every for-init
// DESTRUCTURED alias - through the flow-sensitive walks as "reassigned"
export function reassignmentNodesBeyondDeclarator(binding) {
  const own = binding.node?.type === 'VariableDeclarator' ? binding.node : binding.path?.node;
  return binding.constantViolations
    .filter(v => !isDeclaratorSelfViolation(v, own))
    .map(violationNode);
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
  // both arms thread `usageNode` (an alias hop's / destructure capture's read site): a write after
  // that read neither dominates it (global) nor reaches the value captured there (pure) - without
  // the anchor, pure bails a provably-live init whose only writes flip the key AFTER the capture
  if (method === 'usage-global') return reassignmentDominatesUsage({ reassignmentNodes, usagePath: path, usageNode });
  return !noReassignmentReachesUsage({ reassignmentNodes, usagePath: path, usageNode });
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

// the label names a `peelLabeledStatementPath` walk discards. exit analysis must treat
// `break <peeled-label>` as NON-exiting: the break resumes right AFTER the labeled
// statement - i.e. exactly at the code the guard was supposed to protect
export function peeledLabelNames(path) {
  let names = null;
  for (let cur = path; cur?.node?.type === 'LabeledStatement'; cur = cur.get('body')) {
    (names ??= new Set()).add(cur.node.label?.name);
  }
  return names;
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
// by default (Identifier / StringLiteral / Literal); an optional `ctx`
// ({ resolveKey, scope, adapter }) resolves COMPUTED keys through the read-side key canon
// (a const-bound `[k]` folds like the literal form; an SE-bearing key bails) - ctx-less
// callers keep the literal-only behaviour, matching `patternSlotValues`' ctx idiom. simpler
// counterpart to pattern-bindings.js's `findDestructuredKeyPath` which also resolves
// ArrayPattern indices via cluster-private helpers
export function objectPatternLiteralKeyPath(pattern, name, ctx = null) {
  if (pattern?.type !== 'ObjectPattern') return null;
  for (const prop of pattern.properties) {
    if (prop.type !== 'Property' && prop.type !== 'ObjectProperty') continue;
    let keyName;
    if (prop.computed) {
      keyName = ctx?.resolveKey ? ctx.resolveKey({
        node: prop.key, computed: true, scope: ctx.scope, adapter: ctx.adapter,
        path: ctx.path ?? null, usageNode: ctx.usageNode ?? null, bailOnSideEffectKey: true,
      }) : null;
    } else {
      keyName = prop.key?.type === 'Identifier' ? prop.key.name
        : (prop.key?.type === 'StringLiteral' || prop.key?.type === 'Literal') ? prop.key.value : null;
    }
    if (typeof keyName !== 'string') continue;
    const value = prop.value?.type === 'AssignmentPattern' ? prop.value.left : prop.value;
    if (value?.type === 'Identifier' && value.name === name) return [keyName];
    if (value?.type === 'ObjectPattern') {
      const inner = objectPatternLiteralKeyPath(value, name, ctx);
      if (inner) return [keyName, ...inner];
    }
  }
  return null;
}

// does an array-wrap slot (an ObjectPattern directly, or a nested ArrayPattern) bind `name` below
// it? used to locate the positional array-wrap element (`const [{ Array: A }] = [globalThis]`) that
// binds a leaf name before descending into it. peels an `= default` wrapper on the slot
export function arrayWrapSlotBindsName(slot, name) {
  slot = slot?.type === 'AssignmentPattern' ? slot.left : slot;
  if (slot?.type === 'ObjectPattern') return !!objectPatternLiteralKeyPath(slot, name);
  if (slot?.type === 'ArrayPattern') return (slot.elements ?? []).some(el => el && arrayWrapSlotBindsName(el, name));
  return false;
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
  // an AssignmentPattern that is a function PARAM (`(({p} = D) => body)(R)`) carries the DEFAULT in
  // its `right` slot, but the live call-arg R is the real receiver (the default applies only when no
  // arg is passed). emit-side callers reach this with the AssignmentPattern as the wrapper, so resolve
  // from the IIFE call site via the enclosing function - caller-args-must-win - falling back to the
  // default only when there is no call site. detect-usage passes the function itself and skips this arm
  if (wrapperNode.type === 'AssignmentPattern' && FN_NODE_TYPES.has(wrapperPath.parentPath?.node?.type)) {
    const site = findIifeCallSite(wrapperPath.parentPath, wrapperNode);
    if (site) {
      const rhsNode = resolveCallArgument(site.callPath.node.arguments ?? [], site.paramIndex);
      if (rhsNode) return { rhsNode, slot: null, callPath: site.callPath, paramIndex: site.paramIndex };
    }
    return { rhsNode: wrapperNode.right, slot: 'right', callPath: null, paramIndex: -1 };
  }
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

// statement-hosted assignment-destructure resolver: returns the {ExpressionStatement path,
// SE-prefix exprs} pair the cascade emitter needs. AssignmentExpression is accepted ONLY
// when the surrounding context is an ExpressionStatement (value is discarded - safe to
// replace the whole statement); the SE-tail peel collects leading expressions so they can
// be re-emitted as side-effect siblings, and the resolved ExpressionStatement path is the
// host whose slot the cascade rewrites
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
  while (true) {
    if (!member || !parent) return false;
    // a transparent wrapper between the member and its write host: oxc keeps `(obj.at) = X`
    // parens as real nodes, and TS casts (`(obj.at as any) = X`) survive in BOTH parsers' ASTs -
    // climb so the LHS-slot identity checks below compare the node that fills the slot. a
    // paren-only peel left the cast forms rewriting a write target into a polyfill call (an
    // invalid assignment target). node-only callers see one wrapper level per grandparent
    // window; path-holding callers pre-climb via `climbTransparentWrapperPath` instead
    if ((parent.type === 'ParenthesizedExpression' || parent.type === 'ChainExpression'
      || TS_EXPR_WRAPPERS.has(parent.type)) && parent.expression === member && grandparent) {
      member = parent;
      parent = grandparent;
      grandparent = null;
      continue;
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
    return false;
  }
}

// generic AST child-walker. covers single-child slots (`MemberExpression.object`) and
// array-child slots (`ArrayExpression.elements`); reads `.type` on each candidate so
// position metadata (`.start`, `.loc`, `.scope`) is ignored. parser-agnostic - both babel
// and oxc shapes carry the same `.type` string on AST nodes
export function walkAstChildren(node, visit) {
  if (!node || typeof node !== 'object') return;
  for (const value of Object.values(node)) {
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

// key spelling shared by the own-this method-extraction gates: private members keep a `#name`
// spelling so a `c.#m` read matches the class-body declaration; everything else resolves via
// the canonical property-key extractor. null = dynamic / unresolvable
export function ownThisMemberKeyName(member) {
  const { key } = member;
  if (key?.type === 'PrivateName') return `#${ key.id?.name }`;
  if (key?.type === 'PrivateIdentifier') return `#${ key.name }`;
  return propertyKeyName(member);
}

// member-READ twin of `ownThisMemberKeyName`: the key a member ACCESS reads, with the same
// private spelling, dotted and static-string-computed forms via the canonical member-key
// extractor. null = dynamic computed read
export function memberReadKeyName(member) {
  const prop = member?.property;
  if (prop?.type === 'PrivateName') return `#${ prop.id?.name }`;
  if (prop?.type === 'PrivateIdentifier') return `#${ prop.name }`;
  return memberKeyName(member);
}

// own-`this` FUNCTION members of an object literal: methods and function-expression-valued
// properties run with `this` = the call-site receiver, so a HELD read of such a member hands
// out a this-rebindable function and breaks the this-field narrow premise. arrows are excluded
// (lexical `this` - extraction cannot rebind). getters / setters cannot be read out as
// functions by a plain member read (the read INVOKES them), but value-exposing calls
// (descriptor extraction) still reach them - they only raise the `accessors` flag.
// `unknownKey` marks a method behind a dynamic / numeric key: any held or dynamic read could
// extract it, so key-precise gates degrade to conservative. null when the literal has no
// own-this function members at all - the common data-only case stays zero-cost
export function objectOwnThisMethodInfo(objectNode) {
  if (objectNode?.type !== 'ObjectExpression') return null;
  const methodKeys = new Set();
  let unknownKey = false;
  let accessors = false;
  for (const prop of objectNode.properties ?? []) {
    const { type } = prop;
    let isMethod = false;
    if (type === 'ObjectMethod') {
      if (prop.kind === 'method') isMethod = true;
      else accessors = true;
    } else if (type === 'Property' || type === 'ObjectProperty') {
      if (prop.kind === 'get' || prop.kind === 'set') accessors = true;
      else isMethod = unwrapRuntimeExpr(prop.value)?.type === 'FunctionExpression';
    }
    if (!isMethod) continue;
    const key = ownThisMemberKeyName(prop);
    if (key === null || key === undefined) unknownKey = true;
    else methodKeys.add(key);
  }
  return methodKeys.size || unknownKey || accessors ? { methodKeys, unknownKey, accessors } : null;
}

// class twin of `objectOwnThisMethodInfo`: `statics` picks the static side (`this` = the
// constructor value, gating the static-field narrow) vs the instance side. same arrow /
// accessor / dynamic-key policy; a `constructor` member never extracts as a rebindable method
export function classOwnThisMethodInfo(classNode, statics) {
  const methodKeys = new Set();
  let unknownKey = false;
  let accessors = false;
  for (const member of classNode?.body?.body ?? []) {
    const { type } = member;
    if ((member.static === true) !== statics) continue;
    let isMethod = false;
    if (type === 'ClassMethod' || type === 'ClassPrivateMethod'
      || type === 'MethodDefinition' || type === 'TSAbstractMethodDefinition') {
      if (member.kind === 'get' || member.kind === 'set') {
        accessors = true;
        continue;
      }
      isMethod = member.kind !== 'constructor';
    } else if (type === 'ClassProperty' || type === 'ClassPrivateProperty'
      || type === 'PropertyDefinition' || type === 'ClassAccessorProperty') {
      isMethod = unwrapRuntimeExpr(member.value)?.type === 'FunctionExpression';
    }
    if (!isMethod) continue;
    const key = ownThisMemberKeyName(member);
    if (key === null || key === undefined) unknownKey = true;
    else methodKeys.add(key);
  }
  return methodKeys.size || unknownKey || accessors ? { methodKeys, unknownKey, accessors } : null;
}

// merge per-class extraction infos (a base class and its descendants share the instance
// narrow, so the union of their own-this members gates it). null-safe on both sides
export function mergeOwnThisMethodInfo(base, extra) {
  if (!base) return extra;
  if (!extra) return base;
  const methodKeys = new Set(base.methodKeys);
  for (const key of extra.methodKeys) methodKeys.add(key);
  return {
    methodKeys,
    unknownKey: base.unknownKey || extra.unknownKey,
    accessors: base.accessors || extra.accessors,
  };
}

// could a member READ under `key` hit one of the info's own-this methods? the ONE key-match
// rule every extraction gate shares: a DYNAMIC key could name any method (or the one hiding
// behind an untrackable key); a RESOLVABLE key only a known method - a mismatched resolvable
// key stays local even under `unknownKey`, else one computed-key method would poison every
// sibling member read of the shape
export function ownThisMethodKeyMatches(info, key) {
  return key === null || key === undefined
    ? !!(info.methodKeys.size || info.unknownKey)
    : info.methodKeys.has(key);
}

// does any class-body member hold a `super.<method>` read? a held read extracts the base's
// method with a rebindable `this` and NO base-class reference a closure walk could classify;
// a direct `super.read()` call keeps `this` = the current instance (a tracked receiver) and a
// discarded read holds nothing. static members read the SUPER CONSTRUCTOR's statics, instance
// members its prototype - each side checks its own set. plain node walk (parent-tracked), so
// both parser shapes traverse identically
export function classBodyHoldsSuperMethod(classNode, { instanceInfo = null, staticInfo = null }) {
  for (const member of classNode?.body?.body ?? []) {
    // a StaticBlock carries no `.static` field but its `this` / `super` bind statically -
    // routing it by the missing flag sent it to instanceInfo, and a static call-site
    // (instanceInfo null) never scanned held `super.<m>` reads inside `static { }`
    const isStatic = member.static === true || member.type === 'StaticBlock';
    const info = isStatic ? staticInfo : instanceInfo;
    if (info && nodeHoldsSuperMethodRead(member, classNode, info)) return true;
  }
  return false;
}
function nodeHoldsSuperMethodRead(node, parent, info) {
  if (!node || typeof node.type !== 'string') return false;
  if ((node.type === 'MemberExpression' || node.type === 'OptionalMemberExpression')
    && node.object?.type === 'Super' && ownThisMethodKeyMatches(info, memberReadKeyName(node))) {
    const isDirectCall = (parent?.type === 'CallExpression' || parent?.type === 'OptionalCallExpression')
      && unwrapRuntimeExpr(parent.callee) === node;
    const isDiscard = parent?.type === 'ExpressionStatement'
      || (parent?.type === 'UnaryExpression' && parent.operator === 'void');
    if (!isDirectCall && !isDiscard) return true;
  }
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item && typeof item.type === 'string' && nodeHoldsSuperMethodRead(item, node, info)) return true;
      }
    } else if (value && typeof value.type === 'string' && nodeHoldsSuperMethodRead(value, node, info)) {
      return true;
    }
  }
  return false;
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
  return (meta.kind === 'property' || meta.kind === 'in') && !!meta.object && !!meta.key
    && isMutatedStaticPair(meta.object, meta.key, mutatedSet);
}

// the (object, key) pair consultation both plugin adapters and the meta gate share: the exact
// pair, OR a SLOT-mutated object - `globalThis.Set = Shim` makes every `Set.<key>` read the
// shim's own property, so no member of a replaced object is a polyfillable static
export function isMutatedStaticPair(object, key, mutatedSet) {
  return !!mutatedSet?.has(mutatedStaticKey(object, key))
    || !!mutatedSet?.has(mutatedStaticKey('globalThis', object));
}

// mutated-static set key, shared by the pre-pass WRITER and every reader gate. a global-proxy
// host canonicalizes to `globalThis`: the proxy names alias ONE object, so a mutation through
// any of them (`self.Set = Shim`) must be visible to reads through any other (`{ Set } = globalThis`)
export function mutatedStaticKey(object, key) {
  return `${ POSSIBLE_GLOBAL_OBJECTS.has(object) ? 'globalThis' : object }.${ key }`;
}

// --- Per-file census ---

// node types that introduce a new `var`-scope boundary. the census `atTopLevel` frame flag
// drops when descending into them - unplugin's orphan-ref classifier keys on it (a `var _ref;`
// rehydrated at module top hoists through plain blocks but never past these), and the census
// driver computes it once for every reducer
export const SCOPE_REBINDING_TYPES = new Set([
  'FunctionDeclaration',
  'FunctionExpression',
  'ArrowFunctionExpression',
  'ObjectMethod',
  'ClassDeclaration',
  'ClassExpression',
  'ClassMethod',
  'ClassPrivateMethod',
  'MethodDefinition',
  // ES2022 class `static { ... }` has its own var-scope; `var` inside doesn't leak to the class
  'StaticBlock',
  // TS namespaces and enums compile to IIFEs - their bodies are var-scopes, so a `_ref = X`
  // inside `namespace N { ... }` / an enum initializer is never the plugin's module-top-level
  // emission (mirrors the var-scope treatment `varScopeAnchor` gives TSModuleBlock)
  'TSModuleDeclaration',
  'TSEnumDeclaration',
]);

export function isScopeRebinding(node) {
  return SCOPE_REBINDING_TYPES.has(node.type);
}

// ONE full-file raw walk driving every per-file census reducer. each reducer keeps its own
// per-node logic and closure state in its home module ({ visit(node, frame), result() });
// the driver owns only the traversal. every reducer output is an order-insensitive set /
// flag, so one shared traversal order serves all of them - the point is collapsing the
// N independent whole-file scans (name reservation, mutation / ctor-alias / minifier
// shape gates) into a single pass. frames carry the structural parent type (transparent
// wrappers forwarded) and the module-top-level flag - the contexts the orphan-ref
// classifier distinguishes emit positions by
export function collectFileCensus(programNode, reducers) {
  const stack = [{ node: programNode, parentType: null, atTopLevel: true }];
  while (stack.length) {
    const frame = stack.pop();
    const { node } = frame;
    if (Array.isArray(node)) {
      for (let i = node.length - 1; i >= 0; i--) {
        stack.push({ node: node[i], parentType: frame.parentType, atTopLevel: frame.atTopLevel });
      }
      continue;
    }
    if (!isASTNode(node)) continue;
    for (const reducer of reducers) reducer.visit(node, frame);
    const atTopLevel = frame.atTopLevel && !isScopeRebinding(node);
    const parentType = TRANSPARENT_EXPR_WRAPPER_TYPES.has(node.type) ? frame.parentType : node.type;
    // eslint-disable-next-line no-restricted-syntax -- perf: AST hot path, plain objects
    for (const key in node) {
      const value = node[key];
      if (Array.isArray(value) || isASTNode(value)) stack.push({ node: value, parentType, atTopLevel });
    }
  }
  const census = {};
  for (const reducer of reducers) Object.assign(census, reducer.result());
  return census;
}

// every user-spelled member-key name on an Identifier-rooted chain: an alias / TS-wrapped
// root may denote the global object (`const g = globalThis; g._ref`, `(globalThis as
// any)._ref`), and a top-level `var <name>` temp in script output IS the `globalThis.<name>`
// storage - a temp write would clobber the user's slot. computed string / single-quasi keys
// fold through the canonical member-key resolver. node-only walk (no scopes): the
// shadow-blind over-approximation also reserves plain-object keys, which only shifts temp
// numbering
export function memberKeyNamesReducer() {
  const memberKeyNames = new Set();
  return {
    visit(node) {
      if (node.type !== 'MemberExpression' && node.type !== 'OptionalMemberExpression') return;
      const key = memberKeyName(node);
      if (key === null) return;
      let root = unwrapRuntimeExpr(node.object);
      while (root?.type === 'MemberExpression' || root?.type === 'OptionalMemberExpression') {
        root = unwrapRuntimeExpr(root.object);
      }
      if (root?.type === 'Identifier') memberKeyNames.add(key);
    },
    result() { return { memberKeyNames }; },
  };
}

export function collectUserMemberKeyNames(programNode) {
  return collectFileCensus(programNode, [memberKeyNamesReducer()]).memberKeyNames;
}

// does any statement list carry the minifier sequence-destructure shape? drives the split
// pre-pass gate - most files have none and skip the path-materializing walk entirely
export function minifierShapesReducer() {
  let hasMinifierShapes = false;
  function scanList(statements) {
    if (!hasMinifierShapes && Array.isArray(statements)) {
      hasMinifierShapes = statements.some(stmt => getMinifierSequenceDestructureExpressions(stmt) !== null);
    }
  }
  return {
    visit(node) {
      if (hasMinifierShapes) return;
      if (STATEMENT_LIST_HOST_TYPES.has(node.type)) scanList(node.body);
      else if (node.type === 'SwitchCase') scanList(node.consequent);
    },
    result() { return { hasMinifierShapes }; },
  };
}

// the plain slot names of a mutated set's `globalThis.<name>` keys - the user-owned
// global-object properties an output-scope temp must never alias (a top-level `var <name>`
// in script output IS the `globalThis.<name>` storage). prototype / ctor-static keys
// (`Array.from`, `String.prototype.at`) carry dots past the host and are not slot names
export function mutatedGlobalSlotNames(mutatedSet) {
  const names = [];
  for (const key of mutatedSet ?? []) {
    if (key.startsWith('globalThis.') && !key.includes('.', 'globalThis.'.length)) {
      names.push(key.slice('globalThis.'.length));
    }
  }
  return names;
}

// a `<global>.<key>` navigation step is transparent only while the slot is unmutated: once user
// code writes the slot (`globalThis.Map = Shim`, `window.self = fake`), reads THROUGH the global
// object see the replacement, so canon walks must stop resolving the pristine built-in behind it.
// the host is canonical by construction - every proxy alias names the ONE global object. bare
// references stay on the ponyfill canon and never consult this
export function isMutatedGlobalSlot(adapter, key) {
  return !!key && !!adapter?.isMutatedStatic?.('globalThis', key);
}

// the one question every proxy-root recogniser asks: does this NAME still stand for the pristine
// global surface? the two halves must travel together - a name that is a known proxy but whose slot
// the user overwrote (`window = fake`) holds the replacement, not the surface, so recognising it
// would rewrite reads of the user's own value. the recognisers around it differ in HOW they reach a
// name (scope walk, alias chain, injector hint, destructure key); what they do with the name once
// they have it is this, and it was spelled out at each of them
export function isPristineProxyGlobal(adapter, name) {
  return POSSIBLE_GLOBAL_OBJECTS.has(name) && !isMutatedGlobalSlot(adapter, name);
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
// reach the runtime-effective parent context. the upward twin of `unwrapRuntimeExpr`, MINUS
// ChainExpression: an ancestor `?.` wrapper stays a boundary, so context-classifier consumers
// see the ChainExpression and decline the specific match - the conservative direction.
// returns the outermost transparent-wrapper path; identity-stable when no wrappers present
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

// side-effecting COMPUTED key of a destructure prop (`[(eff(), 'from')]`, `[(eff(), 'fr') + 'om']`).
// the single gate both flatten emitters dispatch on, so the key-effect decision can't drift
// between them; a non-computed key is a static name and never carries an effect
export function computedKeyHasSideEffects(propNode) {
  return !!propNode?.computed && mayHaveSideEffects(propNode.key);
}

// SE-bearing prefix of a multi-operand SequenceExpression (all but the consumed last operand),
// or null when the node is not such a sequence or its prefix is side-effect-free. used by
// resolve.js's `bailOnSideEffectKey` gate - callers that only need to KNOW a prefix has effects,
// not harvest the surviving tail's nested SE (that recursive harvest is
// `collectFoldedReceiverSideEffects`, which the `in`-expression paths use)
export function sequencePrefixWithSideEffects(expr) {
  if (expr?.type !== 'SequenceExpression' || expr.expressions.length < 2) return null;
  const prefix = expr.expressions.slice(0, -1);
  return prefix.some(mayHaveSideEffects) ? prefix : null;
}

// STRUCTURAL side effects of an expression whose VALUE is fully DISCARDED (an `in` fold replaces the
// whole operand with constant `true`), in source-eval order. unlike `sequencePrefixWithSideEffects`
// - which peels to a surviving tail VALUE and harvests only the effects AHEAD of it - nothing survives
// here, so a sequence's trailing element and a member's computed key
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

// nodes that introduce their own scope and may shadow outer bindings - subtree walkers
// stop at these boundaries: `bodyHasParamReference` treats them as opaque (can't reason
// about inner bindings statically), `subtreeContainsExit` (in straight-line-flow) treats
// them as scope-local exits that don't propagate to the outer straight-line check
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
  for (const value of Object.values(node)) {
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
  for (const child of Object.values(node)) {
    if (isNonReferencePosition(node, child)) continue;
    if (expressionReadsName(child, name)) return true;
  }
  return false;
}

// walk a parameter pattern for a value-position read of `name`: AssignmentPattern defaults
// and computed keys. binding (declaration) positions recurse for nested reads but never
// self-match the bindings they introduce
function paramPatternReadsValue(node, name) {
  while (true) {
    if (!node || typeof node.type !== 'string') return false;
    switch (node.type) {
      case 'AssignmentPattern':
        return expressionReadsName(node.right, name) || paramPatternReadsValue(node.left, name);
      case 'ObjectPattern':
        return (node.properties ?? []).some(property => paramPatternReadsValue(property, name));
      case 'ArrayPattern':
        return (node.elements ?? []).some(element => paramPatternReadsValue(element, name));
      case 'RestElement':
        node = node.argument;
        continue;
      // babel: ObjectProperty; estree / oxc: Property
      case 'ObjectProperty':
      case 'Property':
        return (node.computed && expressionReadsName(node.key, name)) || paramPatternReadsValue(node.value, name);
      // babel TS parameter-property wrapper (`constructor(public x)`)
      case 'TSParameterProperty':
        node = node.parameter;
        continue;
      default:
        return false;
    }
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
// expression-body returns directly. BlockStatement body: accept side-effect
// ExpressionStatement prefixes preceding `return expr;`. non-ExpressionStatement
// intermediates (control flow, bindings) make the returned value non-static.
// the returned node is unwrapped to its runtime-effective value (oxc preserves the
// `(Arg)` paren babel strips at parse): without this `(Arg => (Arg))(X)` fails the
// identity-lift and `bodyHasParamReference` flags the parenthesised param -> IIFE bails.
// a param rebound anywhere the body can reach (`paramReboundInBody`, incl. the return
// expression's own writes) makes `return arg` yield the new value, not the call arg
function iifeBodyReturn(callee, paramNames) {
  const { body } = callee;
  if (callee.type === 'ArrowFunctionExpression' && body?.type !== 'BlockStatement') {
    return paramReboundInBody(body, paramNames) ? null : unwrapExpressionChain(body) ?? null;
  }
  if (body?.type !== 'BlockStatement') return null;
  const stmts = body.body ?? [];
  if (stmts.length === 0) return null;
  const last = stmts.at(-1);
  if (last?.type !== 'ReturnStatement' || !last.argument) return null;
  for (let i = 0; i < stmts.length - 1; i++) if (stmts[i]?.type !== 'ExpressionStatement') return null;
  if (paramReboundInBody(body, paramNames)) return null;
  return unwrapExpressionChain(last.argument);
}

// is any param in `paramNames` written somewhere the IIFE body can reach before the peel's return?
// the identity-lift is sound only when the param flows UNCHANGED to `return arg`. a write hides
// behind wrappers, a for-of/in head, a pattern-LHS, or inside a nested closure that RUNS - and a
// closure runs through many forms (call / new callee, `.call`/`.apply`, a callback arg, iteration).
// so descend into every nested scope BY DEFAULT (a callback whose invocation is undecidable
// over-reports and bails - the safe usage-pure direction). the ONE closure that provably does NOT
// run is a function/arrow that is a DISCARDED ExpressionStatement (`() => { arg = X; };` - created
// and dropped): skip its body, since treating it as a rebind would UNDER-resolve a receiver that IS
// the call arg and drop a needed polyfill (breaks on engines lacking the native builtin). a nested
// function that shadows the param with its own binding is likewise skipped
export function paramReboundInBody(node, paramNames) {
  if (!node || paramNames.size === 0 || typeof node !== 'object' || typeof node.type !== 'string') return false;
  // the write-target slots recurse too: an LHS pattern carries writes in its DEFAULT values
  // (`({ x = (arg = P) } = {})`) and computed member keys (`o[arg = P] = 1`, `o[arg = P]++`),
  // which the binding-leaf walk deliberately skips - an unconditional return would drop them
  if (node.type === 'UpdateExpression') {
    return (node.argument?.type === 'Identifier' && paramNames.has(node.argument.name))
      || paramReboundInBody(node.argument, paramNames);
  }
  if (node.type === 'AssignmentExpression') {
    return patternBindsIdentifier(node.left, id => paramNames.has(id.name))
      || paramReboundInBody(node.left, paramNames) || paramReboundInBody(node.right, paramNames);
  }
  // a for-of / for-in head assigns the loop target each iteration (bare target / pattern, not a
  // fresh `let`/`const`/`var` that introduces its own binding)
  if ((node.type === 'ForOfStatement' || node.type === 'ForInStatement')
    && node.left?.type !== 'VariableDeclaration' && patternBindsIdentifier(node.left, id => paramNames.has(id.name))) return true;
  // a bare function/arrow that is a discarded ExpressionStatement never runs - skip its body
  if (node.type === 'ExpressionStatement' && isPlainFunctionNode(unwrapRuntimeExpr(node.expression))) return false;
  // a nested function whose own params rebind a target shadows ours - its writes hit its OWN binding.
  // only the names it actually shadows are covered though: a write to any OTHER still reaches ours
  // (`function (x) { y = P; }` shadows `x` alone, so its `y` write is live), so recurse for the
  // non-shadowed subset instead of dropping the whole subtree
  if (isPlainFunctionNode(node)) {
    const visible = new Set([...paramNames].filter(paramName => (node.params ?? [])
      .every(param => !patternBindsIdentifier(param, id => id.name === paramName))));
    if (visible.size !== paramNames.size) return visible.size !== 0 && paramReboundInBody(node, visible);
  }
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) {
      if (value.some(child => paramReboundInBody(child, paramNames))) return true;
    } else if (paramReboundInBody(value, paramNames)) return true;
  }
  return false;
}

function isPlainFunctionNode(node) {
  return node?.type === 'ArrowFunctionExpression' || node?.type === 'FunctionExpression';
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
// a bare Identifier leaf of an ASSIGNMENT-position destructure pattern (`[Promise] = arr`,
// `({ p: Set } = obj)`, `[...WeakMap] = arr`, `[X = dflt] = arr`, `for ([X] of xs)`) - the
// leaf WRITES the name, exactly like the flat `X = Y` twin. climbs the pattern chain
// verifying each hop fills a TARGET slot, so a BINDING pattern (`const [X] = arr`, params,
// catch) never matches - its host is a declarator, not an assignment / for-x head. wrappers
// (parens / TS casts) peel at entry, so `[Promise!] = arr` classifies like the plain form.
// serves the emitters' write-position policy split: usage-global treats the leaf as a USAGE
// (the slot must exist or the strict-mode write ReferenceErrors on engines missing the
// global - same rescue as the flat form), usage-pure treats it as a write target
export function bareAssignmentPatternLeafPath(path) {
  let cur = peelTransparentExprAncestorPath(path);
  let parent = cur?.parentPath;
  let hops = 0;
  function isTargetSlot(pn, cn) {
    if (pn.type === 'ArrayPattern') return pn.elements?.includes(cn);
    if (pn.type === 'RestElement' || pn.type === 'SpreadElement') return pn.argument === cn;
    if (pn.type === 'ObjectProperty' || pn.type === 'Property') return pn.value === cn;
    if (pn.type === 'ObjectPattern') return pn.properties?.includes(cn);
    return pn.type === 'AssignmentPattern' && pn.left === cn;
  }
  while (parent?.node && hops++ < 32) {
    if (isTargetSlot(parent.node, cur.node)) {
      cur = parent;
      parent = cur.parentPath;
      continue;
    }
    if (hops === 1) return false;
    if (parent.node.type === 'AssignmentExpression') return parent.node.left === cur.node;
    return FOR_X_STATEMENT_TYPES.has(parent.node.type) && parent.node.left === cur.node;
  }
  return false;
}

export function isAssignOrForXWriteTargetPath(path) {
  const anchor = peelTransparentExprAncestorPath(path);
  const parent = anchor?.parentPath?.node;
  if (parent?.type === 'AssignmentExpression') return parent.left === anchor.node;
  // a destructure-pattern slot is the same per-key write target as the flat LHS. only a
  // wrapped leaf ever reaches this check (a plain pattern element is not "referenced"), so
  // the slot tests must compare the ANCHOR - the raw identifier is never the slot value
  if (anchor?.node && isMemberWriteOnlyContext(anchor.node, parent, anchor.parentPath?.parentPath?.node)) return true;
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
    && objectPattern.properties.every(p => p.type !== 'RestElement');
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
      // prefix stays on the pattern key (evaluated once), the synth literal mirrors only the tail name -
      // accept it (fall through) like the Identifier / static-string cases
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
// the tag slot may hold a transparent wrapper over the member (`(arr.at)\`x\``,
// `(arr.at as any)\`x\`` - oxc keeps the paren node, TS casts survive in both parsers):
// unwrap it so the wrapped tag is recognized the same as the bare form
export const isTaggedTemplateTag = (parent, node, placement) => placement === 'prototype'
  && isTaggedTemplateTagPosition(parent, node);

// bare tag-position check without the placement gate: a tagged-template tag is a
// this-CARRYING invocation of the member (`M.groupBy\`x\`` natively binds `this = M`),
// so callee-ness consumers (the runtime ctor guard) must classify it like a call.
// sequences are NOT peeled - a `(0, M.groupBy)\`x\`` tag detaches `this` natively
export const isTaggedTemplateTagPosition = (parent, node) => parent?.type === 'TaggedTemplateExpression'
  && unwrapRuntimeExpr(parent.tag) === node;

// structural match for MemberExpression chains rooted at Identifier / ThisExpression -
// recognises the same receiver path written at different source positions. literal property
// keys (computed-access shape: `obj['at']`, `obj[0]`) compare by value so `obj.at = x`
// and a later `obj['at']` read resolve to the same shadowed write target. transparent
// wrappers peel at every level so `(o).at` / `(o as any).at` (oxc keeps the paren node,
// TS casts survive in both parsers) match the bare `o.at` slot they read at runtime
function memberShapeEqual(a, b) {
  a = unwrapRuntimeExpr(a);
  b = unwrapRuntimeExpr(b);
  if (!a || !b) return false;
  // optionality does not change WHICH slot is resolved (`o?.at` reads the same `o.at` key),
  // and the parsers model it differently: babel promotes the node TYPE to
  // OptionalMemberExpression while estree keeps MemberExpression behind the ChainExpression
  // the entry peel strips - so member-ness must compare across both spellings
  const aIsMember = a.type === 'MemberExpression' || a.type === 'OptionalMemberExpression';
  const bIsMember = b.type === 'MemberExpression' || b.type === 'OptionalMemberExpression';
  if (aIsMember && bIsMember) {
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
  if (a.type !== b.type) return false;
  if (a.type === 'Identifier') return a.name === b.name;
  if (a.type === 'ThisExpression') return true;
  // babel StringLiteral/NumericLiteral vs ESTree Literal: both carry `.value`
  if (a.type === 'StringLiteral' || a.type === 'NumericLiteral' || a.type === 'Literal') {
    return a.value === b.value;
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
      return;
    // a transparent wrapper around a write slot: oxc keeps `for ((obj.at) of xs)` parens as
    // real nodes, TS casts survive in both parsers - peel so the member inside is collected
    case 'ParenthesizedExpression':
    case 'ChainExpression':
      collectForXWriteMembers(node.expression, out);
      return;
    default:
      if (TS_EXPR_WRAPPERS.has(node.type)) collectForXWriteMembers(node.expression, out);
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
  // ObjectProperty / Property wraps a write-target MemberExpression in `.value`;
  // meta emission for destructure properties hands us the wrapper, not the member.
  // the value slot may itself carry a transparent wrapper over the member - peel the
  // NODE only (the parent walk below works from any path inside the pattern)
  while ((path.node?.type === 'ObjectProperty' || path.node?.type === 'Property')
    && unwrapRuntimeExpr(path.node.value)?.type === 'MemberExpression') path = path.get('value');
  const node = unwrapRuntimeExpr(path.node);
  // an optional READ of the written slot (`o?.at` in the body) aliases the same per-iteration
  // write - babel spells it OptionalMemberExpression while estree reaches here as a plain
  // MemberExpression once the entry peel strips its ChainExpression
  if (node?.type !== 'MemberExpression' && node?.type !== 'OptionalMemberExpression') return false;
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

// descend a proxy-nav ctor sub-receiver (`(c++, globalThis.self).Map` / the deeper `(c++, globalThis).self
// .Map`) through its member hops to the root, peeling transparent wrappers (oxc parens, chains, TS casts -
// `((c++, globalThis.self).Map as any).prototype`). true when that root is a SequenceExpression - a harvestable
// SE prefix the prototype-fallback ctor swap re-emits; false for an IIFE-call / chain-assignment / bare root
export function proxyNavRootIsSequence(node) {
  let root = unwrapRuntimeExpr(node);
  while (root?.type === 'MemberExpression' || root?.type === 'OptionalMemberExpression') {
    root = unwrapRuntimeExpr(root.object);
  }
  return root?.type === 'SequenceExpression';
}

// a string is spellable as a bare IdentifierName (`from`, `$x`, `with` - reserved words are
// valid in property / member position). rejects dashes, spaces, leading digits, empties.
// Unicode-aware via the ID_Start / ID_Continue property escapes (mirrors the unplugin
// emitter's `BARE_IDENTIFIER_REGEX`)
const VALID_IDENTIFIER_NAME = /^[\p{ID_Start}$_][\p{ID_Continue}$]*$/u;
export function isValidIdentifierName(name) {
  return typeof name === 'string' && VALID_IDENTIFIER_NAME.test(name);
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

// `unwrapExpressionChain` twin for CODEGEN callers: peels the same wrapper chain but COLLECTS
// every sequence prefix it crosses into `prefixes` (source order) instead of eliding it - a
// consumer that DISCARDS the peeled wrappers (the array-wrapper destructure flatten) must
// re-emit those effects. the sequence peel runs first each round so a prefix buried under a
// paren / TS wrapper is still collected once the wrapper comes off
export function unwrapCollectingSePrefixes(node, prefixes) {
  for (let depth = 0; depth < MAX_DEPTH && node; depth++) {
    const before = node;
    const { prefix, tail } = peelNestedSequenceExpressions(node);
    prefixes.push(...prefix);
    node = unwrapInitValue(unwrapRuntimeExpr(tail));
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
// strict-mode cache for `reEvaluationObservable` (same walker, wider verdict)
const RE_EVAL_CACHE = new WeakMap();
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
  const result = computeSideEffects(node, 0, false);
  SIDE_EFFECTS_CACHE.set(node, result);
  return result;
}
// strict superset of `mayHaveSideEffects`: additionally true when RE-evaluating the subtree is
// observable even though a single evaluation is pure - a member READ (re-fires a getter / Proxy
// trap on the source object) or an accessor DEFINITION in an object literal (each emitted copy
// re-fires on property reads). same eval-time traversal (function bodies stay inert), so a
// member read inside a deferred body does not bail. gates decisions that EMIT a subtree twice
// (receiver copies); single-eval / memoize decisions keep using `mayHaveSideEffects`
export function reEvaluationObservable(node) {
  if (!node) return false;
  if (RE_EVAL_CACHE.has(node)) return RE_EVAL_CACHE.get(node);
  const result = computeSideEffects(node, 0, true);
  RE_EVAL_CACHE.set(node, result);
  return result;
}
function recurse(node, depth, strict) {
  if (!node) return false;
  const cache = strict ? RE_EVAL_CACHE : SIDE_EFFECTS_CACHE;
  if (cache.has(node)) return cache.get(node);
  if (depth >= SIDE_EFFECTS_MAX_DEPTH) return true;
  const result = computeSideEffects(node, depth + 1, strict);
  cache.set(node, result);
  return result;
}
function computeSideEffects(node, depth, strict) {
  const { type } = node;
  if (ALWAYS_EFFECTFUL_TYPES.has(type)) return true;
  if (type === 'UnaryExpression') return node.operator === 'delete' || recurse(node.argument, depth, strict);
  if (type === 'SequenceExpression' || type === 'TemplateLiteral') {
    return node.expressions.some(e => recurse(e, depth, strict));
  }
  // `[...a]` invokes `a[Symbol.iterator]` / `{...a}` invokes `a`'s Proxy traps - neither
  // can be proven pure from source alone. treat SpreadElement as SE uniformly across
  // Array and Object literals. without this, `const { from } = [1, ...Array]` would be
  // considered SE-free and run through the no-SE-path
  if (type === 'ArrayExpression') {
    return node.elements.some(el => el?.type === 'SpreadElement' || recurse(el, depth, strict));
  }
  if (type === 'ObjectExpression') {
    return node.properties.some(p => p?.type === 'SpreadElement' || recurse(p, depth, strict));
  }
  if (type === 'BinaryExpression' || type === 'LogicalExpression') {
    return recurse(node.left, depth, strict) || recurse(node.right, depth, strict);
  }
  if (type === 'ConditionalExpression') {
    return recurse(node.test, depth, strict) || recurse(node.consequent, depth, strict) || recurse(node.alternate, depth, strict);
  }
  if (TRANSPARENT_WRAPPER_TYPES.has(type) || TS_EXPR_WRAPPERS.has(type)) {
    return recurse(node.expression ?? node.argument, depth, strict);
  }
  if (type === 'MemberExpression' || type === 'OptionalMemberExpression') {
    if (strict) return true;
    return recurse(node.object, depth, strict) || (node.computed && recurse(node.property, depth, strict));
  }
  if (type === 'Property' || type === 'ObjectProperty') {
    if (strict && (node.kind === 'get' || node.kind === 'set')) return true;
    return (node.computed && recurse(node.key, depth, strict)) || recurse(node.value, depth, strict);
  }
  // babel-only ObjectMethod (`{ [fn()]() {} }` / `{ get [fn()]() {} }`): computed key is
  // evaluated at object-literal-eval time, method body / params are deferred. without this
  // case the node falls through to `return false`, silently eliding SE in the computed key
  // and unblocking unsafe receiver-drop rewrites that consumed `Array[(fn(), 'from')]`-shape
  if (type === 'ObjectMethod') {
    if (strict && (node.kind === 'get' || node.kind === 'set')) return true;
    return node.computed && recurse(node.key, depth, strict);
  }
  if (type === 'AssignmentPattern') return recurse(node.right, depth, strict);
  if (JSX_NODE_TYPES.has(type)) return jsxHasSideEffects(node, type, depth, strict);
  if (type === 'ClassExpression' || type === 'ClassDeclaration') return classHasSideEffects(node, depth, strict);
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
function jsxHasSideEffects(node, type, depth, strict) {
  // `.expression`-only carriers
  if (type === 'JSXExpressionContainer' || type === 'JSXSpreadChild') return recurse(node.expression, depth, strict);
  if (type === 'JSXAttribute') return recurse(node.value, depth, strict);
  // JSXElement | JSXFragment: walk children. JSXElement also walks attributes -
  // spread attributes are SE unconditionally (iteration over their object operand)
  if (node.children?.some(c => recurse(c, depth, strict))) return true;
  if (type === 'JSXFragment') return false;
  return node.openingElement?.attributes?.some(
    a => a?.type === 'JSXSpreadAttribute' || recurse(a, depth, strict),
  ) ?? false;
}

// class evaluation invokes computed-key expressions, decorator factories, and the
// `extends` clause at class-eval time. method bodies / instance-field initializers
// execute later (instance construction); static-field initializers and StaticBlock
// bodies execute at class-eval, so they count
// regular fields (`ClassProperty` babel / `PropertyDefinition` estree), PRIVATE fields (`ClassPrivateProperty`
// babel - estree keeps `PropertyDefinition` with a PrivateIdentifier key) AND auto-accessor fields
// (`ClassAccessorProperty` babel / `AccessorProperty` estree): all carry an initializer `.value` that runs
// at class-eval (static) or construction (instance), so all gate field-init contexts. `ClassPrivateProperty`
// is the babel-only split - omitting it silently mis-routed babel `#x = ...` public (cross-parser asymmetry)
export const CLASS_FIELD_TYPES = new Set([
  'ClassProperty',
  'ClassPrivateProperty',
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

// `strict` threads the re-evaluation lens through every CLASS-EVAL-TIME position (computed keys,
// decorators, STATIC field values, superClass) - a member read there re-fires per class copy.
// instance-field values stay non-strict on purpose: they evaluate per CONSTRUCTION, and user code
// constructs whichever copy it reads, so the count matches native either way
function classMemberHasSideEffects(member, depth, strict) {
  if (!member) return false;
  if (member.computed && recurse(member.key, depth, strict)) return true;
  if (member.decorators?.some(d => recurse(d, depth, strict))) return true;
  if (CLASS_FIELD_TYPES.has(member.type) && member.static && recurse(member.value, depth, strict)) return true;
  return member.type === 'StaticBlock';
}
function classHasSideEffects(node, depth, strict) {
  if (node.superClass && recurse(node.superClass, depth, strict)) return true;
  if (node.decorators?.some(d => recurse(d, depth, strict))) return true;
  return node.body?.body?.some(member => classMemberHasSideEffects(member, depth, strict)) ?? false;
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
// `f = 1`, `{g = 2}`, etc.), invoking `visit(identifierNode, depth)` per leaf. `depth`
// counts the container levels the pattern unwraps to reach the target (one per object
// property / array element; a rest target receives a same-shape container of the remaining
// slots, so its level doesn't count) - field-path consumers align it with slot steps,
// name-only callers ignore it. caller is responsible for short-circuit via captured flag
// since we always walk the whole tree. peels ParenthesizedExpression (oxc preserves;
// babel strips) so `({x})` patterns aren't silently dropped from the binding scan
export function walkPatternIdentifiers(node, visit, depth = 0) {
  if (!node) return;
  // parens and TS expression wrappers are runtime no-ops around an assignment-position leaf
  // (`[Promise!] = arr`, `[(Map as unknown)] = arr`); binding-position patterns cannot parse
  // them, so the peel only ever fires on assignment-target patterns
  if (node.type === 'ParenthesizedExpression' || TS_EXPR_WRAPPERS.has(node.type)) {
    walkPatternIdentifiers(node.expression, visit, depth);
    return;
  }
  switch (node.type) {
    case 'Identifier':
      visit(node, depth);
      break;
    case 'ObjectPattern':
      for (const p of node.properties) {
        // some parsers (estree-toolkit + custom AST shapes) emit `SpreadElement` instead
        // of `RestElement` inside an ObjectPattern. both wrap the rest-binding identifier
        // in `.argument`, so peel symmetrically - missing `SpreadElement` would silently
        // drop the rest binding from the scan and miss-bind the destructure
        if (p.type === 'RestElement' || p.type === 'SpreadElement') walkPatternIdentifiers(p.argument, visit, depth);
        else walkPatternIdentifiers(p.value, visit, depth + 1);
      }
      break;
    case 'ArrayPattern':
      for (const el of node.elements) {
        const isRest = el?.type === 'RestElement' || el?.type === 'SpreadElement';
        walkPatternIdentifiers(el, visit, isRest ? depth : depth + 1);
      }
      break;
    case 'AssignmentPattern':
      walkPatternIdentifiers(node.left, visit, depth);
      break;
    case 'RestElement':
    case 'SpreadElement':
      walkPatternIdentifiers(node.argument, visit, depth);
      break;
    // TS `constructor(public x: number)` parameter-property shorthand. parser wraps the
    // param's identifier in TSParameterProperty (with access modifier on the wrapper);
    // descend into .parameter so the identifier scan recognises the binding
    case 'TSParameterProperty':
      walkPatternIdentifiers(node.parameter, visit, depth);
      break;
  }
}

// does a split-off leading sequence operand re-parse as a Directive Prologue entry? a bare
// string literal does; TS casts vanish at type-strip so they don't protect it (`"use strict"
// as any`), while explicit parens survive in a text emit and do (the babel AST drops parens at
// parse, so its emit re-wraps regardless - both sides stay non-directive). covers babel
// `StringLiteral` and estree `Literal`-string spellings
export function sequenceHeadDirectiveHazard(expr) {
  let head = expr;
  while (head && head.type !== 'ParenthesizedExpression' && SKIPPABLE_WRAPPER_TYPES.has(head.type)) head = head.expression;
  return head?.type === 'StringLiteral' || (head?.type === 'Literal' && typeof head.value === 'string');
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
    if (STATEMENT_LIST_HOST_TYPES.has(node.type) && Array.isArray(node.body)) visitor(node.body);
    if (node.type === 'SwitchCase' && Array.isArray(node.consequent)) visitor(node.consequent);
    for (const value of Object.values(node)) visitListHosts(value);
  }
  visitListHosts(rootNode);
}
