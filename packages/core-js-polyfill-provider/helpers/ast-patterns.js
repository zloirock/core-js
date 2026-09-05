import knownBuiltInReturnTypes from '@core-js/compat/known-built-in-return-types' with { type: 'json' };
import { canonicalArrayIndex, DESTRUCTURE_PATTERN_TYPES, MAX_DEPTH, PATTERN_WRAPPERS } from '../resolve-node-type/base.js';

// the escape census, keyed by PROGRAM node -> the NAMES a value handed out (a call argument, a
// member-assignment RHS, a throw / yield / export-default), alias hops followed. written by the
// mutation pre-pass, read wherever a claim needs to know the container is still this file's own -
// it lives here, at the bottom, so the census and its readers need no import of each other
export const ESCAPED_CONTAINER_NAMES = new WeakMap();

// `globalThis` / `self` / `window` etc. - proxy names aliasing the ONE global object
export const POSSIBLE_GLOBAL_OBJECTS = new Set(knownBuiltInReturnTypes.globalProxies);
// an already-resolved NAME narrowed to the proxy-global surface, or null. the closing step of every
// resolver that answers "which proxy global is this" - the chain-root walk, the branch walk and the
// cycle guards all end here, so the narrow is asked in one place instead of once per resolver
export function asProxyGlobalName(name) {
  return name && POSSIBLE_GLOBAL_OBJECTS.has(name) ? name : null;
}
// every constructor the engine provides. an `extends` naming one of these inherits ENGINE bodies:
// they touch no user-declared field, unlike a base this module holds a binding for but cannot read
export const KNOWN_GLOBAL_CONSTRUCTORS = new Set(Object.keys(knownBuiltInReturnTypes.constructors));

// an entry-path segment is kebab-case and its capitalization is NOT recoverable by conversion:
// `is-nan` reads back as `isNan`, `raw-json` as `rawJson`, `utc` as `utc`. every one of those
// misses the registry, and a miss is silent - the caller reads it as "not a known static" and
// falls back to its widest answer. the registry spells the member exactly and no two built-in
// names differ only by case, so its own keys resolve what the conversion cannot. the CONSTRUCTOR
// half of the same question already has a canonical answer in `entryToGlobalHint`
export function staticMemberFromEntrySegment(constructor, segment) {
  const camel = kebabToCamel(segment);
  const methods = knownBuiltInReturnTypes.staticMethods[constructor];
  if (!methods || Object.hasOwn(methods, camel)) return camel;
  const lowered = camel.toLowerCase();
  return Object.keys(methods).find(key => key.toLowerCase() === lowered) ?? camel;
}

// typed AST node predicate - excludes scalars, SourceLocation objects, and foreign markers
// (Babel `extra`, parent back-refs, per-visitor caches stamped by sibling tools).
// prefer over hardcoded SKIP-keys - new plugins can stamp arbitrary keys, a skip list rots
export const isASTNode = v => v !== null && typeof v === 'object' && typeof v.type === 'string';

// positional recursive walk over a raw AST subtree of EITHER dialect: `visit(node, parent)`
// per position (a node shared by two parents is visited from each), an explicit `false`
// return PRUNES the subtree (a type-annotation wall, a span the caller owns). the depth cap
// protects against pathological nesting (template-literal bombs, parser bug-emitted cycles);
// the per-node hot path allocates nothing
export function walkAstNodes({ root, visit, parent = null, depth = 0 }) {
  (function step(node, parentNode, level) {
    if (!node || typeof node !== 'object' || typeof node.type !== 'string' || level >= 1024) return;
    if (visit(node, parentNode) === false) return;
    // eslint-disable-next-line no-restricted-syntax -- perf: AST hot path, plain objects
    for (const key in node) {
      const value = node[key];
      if (Array.isArray(value)) for (const item of value) step(item, node, level + 1);
      else step(value, node, level + 1);
    }
  })(root, parent, depth);
}

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

// a BARE string-literal statement: `'use client';` re-emitted by a sibling transform WITHOUT the
// directive marker either shape carries, or a raw string expression that would BECOME a directive if
// its position reached the prologue. it is a directive only by POSITION, so callers must ask it while
// still inside the leading prologue run - `isDirectiveStatement` stays the marker-based classifier,
// and this one never extends a region past real code on its own. deliberately does NOT peel: per spec
// only an unparenthesized string literal is a directive, so `('use strict');` must stay a plain
// expression - peeling would promote a non-directive and leave a bare `0;` on the removal path
function isBareStringStatement(node) {
  return node?.type === 'ExpressionStatement'
    && (node.expression?.type === 'StringLiteral'
      || (node.expression?.type === 'Literal' && typeof node.expression.value === 'string'));
}

// the directive strings a runtime or a bundler acts on. a marker-LESS string statement is a
// directive only if it says one of these: `'not-a-directive';` below an import is ordinary code
// that must not be promoted, while `'use client';` a sibling transform re-emitted as a raw
// statement is a directive whose position still matters
const KNOWN_DIRECTIVE_VALUES = new Set(['use strict', 'use asm', 'use client', 'use server']);

export const isPrologueDirectiveStatement = node => isDirectiveStatement(node)
  || (isBareStringStatement(node) && KNOWN_DIRECTIVE_VALUES.has(node.expression.value));

// index past the leading directive prologue of ANY body - marker-based, so a block that admits no
// prologue at all (a class static block) reports 0 and the head insertion stays at the top
export function prologueEndIndex(body) {
  let index = 0;
  while (index < body?.length && isDirectiveStatement(body[index])) index++;
  return index;
}

// the PROGRAM's prologue, which additionally tolerates the marker-less spelling: everything the
// emitters put at the head of a file - the injected imports, the ref block - anchors here, and a
// node placed above a directive silently disables it (`'use client'` stops being one)
export function programPrologueEndIndex(body) {
  let index = 0;
  while (index < body?.length && isPrologueDirectiveStatement(body[index])) index++;
  return index;
}

// indirect-require call: `require('m')`, `require?.('m')` (optional), `require('m').default`
// (MemberExpression tail), `(0, require)('m')` / `((0, require))('m')` (SequenceExpression callee).
// peel the outer wrappers oxc keeps but babel strips FIRST - a top-level optional require `require?.('m')`
// is a `ChainExpression` in oxc, and the member-tail's object may itself be one - else the statement is
// not classified as part of the leading import region and `var _ref;` lands AHEAD of it (import/first).
// shared by both plugins (and entry detection)
export function isRequireCall(expr) {
  let cur = unwrapRuntimeExpr(expr);
  if (cur?.type === 'MemberExpression' || cur?.type === 'OptionalMemberExpression') cur = unwrapRuntimeExpr(cur.object);
  if (cur?.type !== 'CallExpression' && cur?.type !== 'OptionalCallExpression') return false;
  // the callee sequence descends to its tail, at any depth: a single peel recognised `(0, require)`
  // but not `(a(), (b(), require))`, and an unrecognised entry call is not replaced at all
  const callee = peelSequenceTail(unwrapRuntimeExpr(cur.callee), { step: unwrapRuntimeExpr });
  return callee?.type === 'Identifier' && callee.name === 'require';
}

// extract a static string from a node that's either a StringLiteral or a no-interpolation
// TemplateLiteral. without TemplateLiteral support, `require(\`core-js/actual/promise\`)`
// (any tagless single-quasi template) silently bypasses entry detection
export function extractStaticString(node, adapter) {
  if (!node) return null;
  // peel paren / TS wrappers so `require((`core-js/...`))` (oxc keeps the ParenthesizedExpression
  // that babel strips) and `require('core-js/...' as const)` reach the literal check on both
  // parsers. SequenceExpression is deliberately NOT peeled here: `adapter.getStringValue` already
  // resolves a side-effect-free SE tail (`require((0, 'core-js/...'))`) to its literal on BOTH
  // parsers via the shared paren-unwrap, and a side-effecting prefix bails on both - detection
  // stays parser-symmetric without peeling SE at this layer
  const inner = unwrapRuntimeExpr(node);
  if (inner?.type === 'TemplateLiteral') return singleQuasiString(inner);
  // adapter-less callers (the node-level census gates, which have no scope machinery) still get the
  // plain-literal answer - the adapter only adds const-folding on top
  if (!adapter) return typeof inner?.value === 'string' ? inner.value : null;
  return adapter.getStringValue(inner);
}

// `require('core-js/...')` value-call -> source string, or null. peels webpack `(0, require)(...)`
// (SequenceExpression callee tail) and paren / TS / chain wrappers (`(require as any)('...')`,
// `require!('...')`); accepts optional `require?.(...)` on both parsers. a locally-shadowed
// `require` (looked up via the alias context's `scope` / `adapter` - a hop's `ctx`) is ignored -
// its `path` reaches the adapter's var-hoist / TS-runtime shadow recovery, so a `var require`
// hoisted out of a nested block shadows on the estree leg exactly as babel's scope tracker sees
// it; with no context the shadow check is skipped. the ONE require-source canon: entry
// detection / existing-import scan (entries.js), the proxy-import recognition in
// `detect-usage/resolve.js`, the import-binding table below and every binding's own
// require-declarator test read through it
export function requireCallSource(node, aliasCtx = {}) {
  const { adapter = null, scope = null, path = null } = aliasCtx;
  // `var P = require?.('x')` wraps the call in a ChainExpression (estree / oxc); peel transparent
  // wrappers at the top so the type-gate sees the (Optional)CallExpression instead of rejecting it
  // and re-emitting a duplicate import for an already-provided module
  node = unwrapTransparentSeq(node);
  if ((node?.type !== 'CallExpression' && node?.type !== 'OptionalCallExpression')
    || node.arguments?.length !== 1) return null;
  // the callee sequence descends UNCONDITIONALLY - an effectful prefix does not hide the entry,
  // it is preserved separately when the statement is removed - and at any depth: a single peel
  // recognised `(spy(), require)('core-js/...')` but not `(a(), (b(), require))('core-js/...')`,
  // and an unrecognised entry is left in place while its targets go uninjected
  const callee = peelSequenceTail(unwrapTransparentSeq(node.callee), { step: unwrapTransparentSeq });
  if (callee?.type !== 'Identifier' || callee.name !== 'require') return null;
  if (scope && adapter?.hasBinding?.(scope, 'require', path)) return null;
  return extractStaticString(node.arguments[0], adapter);
}

// leading-import-region statement: ImportDeclaration, `export ... from 'mod'` re-export,
// `export * [as ns] from 'mod'`, a top-level `require(...)` ExpressionStatement, or a
// VariableDeclaration with at least one `require()` initializer. re-exports count because the
// module record fetches them before the body runs, so `var _ref;` placed before them would
// trip `import/first`. directive-prologue handling is the CALLER's concern - it differs:
// unplugin's flush skips directives mid-scan, babel folds them into its region check
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
function wouldPromoteDirectiveAfterRemoval({
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
  return isBareStringStatement(body[next]);
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
  const expression = peelSequenceTail(unwrapRuntimeExpr(stmtNode?.expression), {
    step: unwrapRuntimeExpr,
    onPrefix: expressions => {
      for (const e of expressions.slice(0, -1)) if (mayHaveSideEffects(e)) prefix.push(e);
    },
  });
  // babel models `(spy(), require)?.('core-js/...')` as an OptionalCallExpression; oxc wraps a
  // plain CallExpression in a ChainExpression that unwrapRuntimeExpr already strips. accept both
  // so the optional indirect-require recovers its prefix on either parser
  if (expression?.type !== 'CallExpression' && expression?.type !== 'OptionalCallExpression') return prefix;
  // the indirect-require callee is itself a `(spy(), require)` SequenceExpression - a TS-wrapped
  // `((spy(), require) as any)('core-js/...')` lands the SE behind a TSAsExpression, so peel the
  // same wrappers, then surface its SE-ful prefix elements (everything but the trailing `require`)
  // every level of the callee sequence, not just the outermost: `(a(), (b(), require))('core-js/...')`
  // discards both `a()` and `b()` with the statement
  peelSequenceTail(unwrapRuntimeExpr(expression.callee), {
    step: unwrapRuntimeExpr,
    onPrefix: expressions => {
      for (const e of expressions.slice(0, -1)) if (mayHaveSideEffects(e)) prefix.push(e);
    },
  });
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
  return property?.type === 'Identifier' ? null : plainSynthKeyName(property);
}

// is the member's OWN hop a pristine proxy-global name - dotted, static-string computed, or
// an SE-keyed computed folding to one? a nav CHAIN-END with such a hop belongs to the alias /
// kept canons: a value-canon render of only its OBJECT would strand the proxy hop outside the
// guard (a throw where the source short-circuits, or a raw polyfillable read)
export function memberProxyHopName(node) {
  const key = staticMemberKeyName(node);
  return key !== null && POSSIBLE_GLOBAL_OBJECTS.has(key) ? key : null;
}

// the static member name, FOLDING a side-effecting computed key to its static tail
// (`globalThis[(e++, 'Map')]` -> 'Map'): memberKeyName covers dotted / static-string-computed keys,
// sequenceKeyStaticName recovers the tail of an SE-bearing computed key (its SE prefix is replayed by
// the caller). the ONE canonical member-name resolver for every proxy-global / enum consumer - a bare
// memberKeyName under-resolves the SE-key form and diverges from the consumers that already fold it
export function staticMemberKeyName(node) {
  const direct = memberKeyName(node) ?? (node.computed ? sequenceKeyStaticName(node.property) : null);
  if (direct !== null || !node.computed) return direct;
  // a zero-arg IIFE computed key (`E[(() => 'A')()]`) folds to its return. gate on purity: the
  // proxy-hop collapse consumers DROP a folded hop and the SE-key harvest only reaches a sequence
  // prefix, not an IIFE's interior - so a SE-bearing IIFE stays unresolved (read consumers degrade,
  // emit keeps the hop) rather than lose the effect. peel to a fixpoint for nested wrappers
  let key = node.property;
  while (zeroArgIifeSideEffectFree(key)) {
    const ret = peelZeroArgIifeReturn(key);
    if (!ret) break;
    key = ret;
  }
  return key === node.property ? null : staticStringKey(key) ?? sequenceKeyStaticName(key);
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
// both parser spellings per shape (babel / ESTree-oxc). EVERY member shape belongs here - property,
// accessor and method alike, in value space and in type space: a non-computed key is a source-text
// name, never a runtime reference. whether babel's live scope also RESERVES that name for the UID
// allocator is a separate question, answered by `blocksUidSlot`
const NON_REF_KEY_BEARING_TYPES = new Set([
  'Property',
  'ObjectProperty',
  'ObjectMethod',
  'ClassMethod',
  'MethodDefinition',
  'ClassProperty',
  'PropertyDefinition',
  'AccessorProperty',
  'ClassAccessorProperty',
  'TSPropertySignature',
  'TSAbstractPropertyDefinition',
  'TSAbstractAccessorProperty',
  'TSMethodSignature',
  'TSAbstractMethodDefinition',
  'TSDeclareMethod',
]);

// method-shaped members, whether they carry the function inline (`body`) or under `value`. one of these
// with NO function body is an overload SIGNATURE (`f(): void;`) - the shape babel's live scope reserves
const METHOD_MEMBER_KEY_TYPES = new Set([
  'ObjectMethod',
  'ClassMethod',
  'MethodDefinition',
  'TSMethodSignature',
  'TSAbstractMethodDefinition',
  'TSDeclareMethod',
]);
export function isNonReferencePosition(parent, identifierNode) {
  if (!parent) return false;
  const { type } = parent;
  if (NON_REF_KEY_BEARING_TYPES.has(type) && parent.key === identifierNode && !parent.computed) return true;
  if ((type === 'MemberExpression' || type === 'OptionalMemberExpression')
    && parent.property === identifierNode && !parent.computed) return true;
  // an enum MEMBER name (`enum E { _ref }`) rides `id`, not `key`: at runtime it is a property of the enum
  // object, never a standalone binding, so it must not block a UID slot (babel's live scope claims none)
  if (type === 'TSEnumMember' && parent.id === identifierNode) return true;
  if (type === 'LabeledStatement' && parent.label === identifierNode) return true;
  if ((type === 'BreakStatement' || type === 'ContinueStatement') && parent.label === identifierNode) return true;
  if (type === 'ImportSpecifier' && parent.imported === identifierNode) return true;
  if (type === 'ExportSpecifier' && (parent.local === identifierNode || parent.exported === identifierNode)) return true;
  // JSX name-literal slots: an attribute NAME (`<X f={1} />`) is a prop key, and a member-tag TAIL
  // (`<f.Bar />`) is a name on the root - neither references a binding. the referencing JSX slots
  // (bare-tag / member-root) are recognised by the tag-reference walker, not here
  if (type === 'JSXAttribute' && parent.name === identifierNode) return true;
  if (type === 'JSXMemberExpression' && parent.property === identifierNode) return true;
  // the name of a private member (`#_ref` - babel spells it `PrivateName { id }`), both halves of a
  // meta property (`import.meta`, `new.target`), an import attribute's key (`with { type: "json" }`),
  // a Flow object-type key: source-text names, never a binding a UID could be confused with
  if (type === 'PrivateName' || type === 'MetaProperty') return true;
  if ((type === 'ImportAttribute' || type === 'ObjectTypeProperty') && parent.key === identifierNode) return true;
  return false;
}

// the node a `:` type slot introduces, in both dialects. single authority for the question, asked by
// the annotation PEELERS (which strip it to reach the type) and by the census (which stops at it):
// babel's scope crawler will not descend through this node, so a name written past it never reaches
// `scope.globals` and never claims a UID slot. a type-alias RHS, an interface body and type ARGUMENTS
// carry no such wrapper and are crawled at any depth - which is why this cannot delegate to
// `isTypeAnnotationNodeType`, a deliberately wider "is this type-space at all" test
export function isTypeAnnotationWrapper(node) {
  if (!node) return false;
  const { type } = node;
  return type === 'TSTypeAnnotation' || type === 'TypeAnnotation';
}

// does this identifier occupy a name the UID allocator must not hand out? this is a DIFFERENT question
// from `isNonReferencePosition` and the two disagree on exactly one shape - an overload SIGNATURE key.
// babel's live scope registers it (babel spells the node `TSDeclareMethod`), so a UID must step around
// the name for emitter parity; yet the key is still a source-text name that must never be REWRITTEN,
// so the rewrite walkers keep asking `isNonReferencePosition`. oxc gives the class overload the same
// `MethodDefinition` type as a body-bearing method, so only the missing body tells them apart
export function blocksUidSlot(parent, identifierNode) {
  if (!isNonReferencePosition(parent, identifierNode)) return true;
  return METHOD_MEMBER_KEY_TYPES.has(parent.type) && !(parent.body ?? parent.value?.body);
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

// walk up from an Identifier through destructuring pattern wrappers to the enclosing binding / assign
// host. returns { host, node } where node is the outermost pattern reached (or the identifier itself
// when not in a pattern); null when the identifier is a property KEY (esp. computed `{ [ref]: x }`, a
// real reference) or has no parent. lets callers mirror what babel's `referencePaths` excludes -
// declaration slots AND destructuring-write targets - which the estree-toolkit walk would otherwise
// over-collect since patterns nest arbitrarily
export function patternSlotHost(refNode, refPath) {
  if (!refPath) return null;
  let node = refNode;
  let cur = refPath.parentPath;
  while (cur && PATTERN_WRAPPERS.has(cur.node.type)) {
    const { node: w } = cur;
    // only a property VALUE is a slot; a key (esp. computed `{ [ref]: x }`) is a reference
    if ((w.type === 'Property' || w.type === 'ObjectProperty') && w.value !== node) return null;
    // only the LEFT of a default is a slot; the default VALUE (`x = C` / `{ a = C }`) is a real
    // reference (`C` is read when the slot is absent), which babel's referencePaths keeps - excluding
    // it as a declaration would drop `C`'s escaping read and unsoundly narrow `C`'s type
    if (w.type === 'AssignmentPattern' && w.right === node) return null;
    node = w;
    cur = cur.parentPath;
  }
  return cur ? { host: cur.node, node } : null;
}

// is this Identifier a binding DECLARATION rather than a reference? the complete, path-level form
// of the question: `isBindingPosition` covers the simple slots (declarator / function-class id /
// catch param); destructuring-pattern slots and function params nest arbitrarily, so walk to the
// binding host - a slot rooted at a declarator id, catch param, or function param is a declaration.
// mirrors babel's `referencePaths` exclusion so a param / destructure binding's own declaration is
// not mis-collected as a reference
export function isBindingDeclarationPath(p) {
  if (isBindingPosition(p.parent, p.node)) return true;
  const slot = patternSlotHost(p.node, p);
  if (!slot) return false;
  const { host, node } = slot;
  if (host.type === 'VariableDeclarator') return host.id === node;
  if (host.type === 'CatchClause') return host.param === node;
  if (FUNCTION_LIKE_NODE_TYPES.has(host.type)) return Array.isArray(host.params) && host.params.includes(node);
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
// WHICH SET TO PICK: a peel that walks a RUNTIME expression on the two-parser path takes THIS one -
// oxc emits a paren NODE where babel emits none, so the TS-only set answers differently per parser
// on the same source. `TS_EXPR_WRAPPERS` alone is right only where the question is about a TS cast
// as such (marking that a value passed through one), or in babel-only code that never sees a paren
// node. every current narrow use was audited against that rule.
// EXCLUDES `UnaryExpression` / `SequenceExpression` (which DO change semantics) and
// `ChainExpression` (the optional-chain marker carries short-circuit semantics that
// must be preserved at most call sites). used by AST walkers that need to reach the
// SEMANTICALLY meaningful inner node - both expression-down (`peelTransparentWrapperPath`) and
// parent-up (`unwrapTSExpressionParent`) walks
export const TRANSPARENT_EXPR_WRAPPER_TYPES = new Set([
  ...TS_EXPR_WRAPPERS,
  'ParenthesizedExpression',
]);

// is this chain the CALLEE of a call (or the TAG of a tagged template), behind a SEAL - source
// parens or a TS cast? `(w?.self.fn)()` keeps the reference (so `this` still binds) while the seal
// ends the short-circuit; folding the tail into a guarded alternate hands the callee a bare value.
// `unwrap` is the caller's transparent-wrapper peel (the two adapters spell parens differently)
export function parenSealedCalleeAbove(metaPath, node, unwrap) {
  let step = metaPath;
  while (step?.node && unwrap(step.node) !== node) step = step.parentPath;
  let wrapped = false;
  // the climb has to know WHICH slot it came up through: only the callee / tag position binds the
  // reference. an ARGUMENT reaching the same call is not a sealed callee, and answering as if it
  // were hands the argument a `?.` tail the source never wrote
  let child = step?.node;
  for (let up = step?.parentPath; up?.node; child = up.node, up = up.parentPath) {
    const { type } = up.node;
    // a TS cast seals the chain exactly as parens do (the canon set is the two together), and it is
    // transparent to this climb: stopping on it read `(nav?.hop as any)(1)` as an unsealed callee
    // and folded the call into the guarded branch, which answers undefined where the source throws
    if (TRANSPARENT_EXPR_WRAPPER_TYPES.has(type)) {
      wrapped = true;
      continue;
    }
    // a tagged template binds `this` from its tag reference just like a call
    if (type === 'TaggedTemplateExpression') return up.node.tag === child;
    if (type === 'CallExpression' || type === 'OptionalCallExpression') return wrapped && up.node.callee === child;
    if (type !== 'MemberExpression' && type !== 'OptionalMemberExpression' && type !== 'ChainExpression') return false;
  }
  return false;
}

// extended set including `ChainExpression` for callers that need to skip / mark optional-
// chain wrappers too. used by skip-mark walkers (`markSynthReceiverSkipped` /
// destructure-emitter's per-branch peel) and by `unwrapRuntimeExpr`. ChainExpression
// is the oxc-side wrapper for optional chains (babel folds the marker into
// OptionalMemberExpression directly) - both adapters see the same flat shape after peel
export const SKIPPABLE_WRAPPER_TYPES = new Set([
  ...TRANSPARENT_EXPR_WRAPPER_TYPES,
  'ChainExpression',
]);

// the third set, and the reason it is not one of the two above: a caller walking a chain's HOPS
// reads through the marker and through TS assertions, but a source paren SEALS the chain - it ends
// the short-circuit, so it is a terminator to be recognised, never a wrapper to peel
export const CHAIN_HOP_WRAPPER_TYPES = new Set([
  ...TS_EXPR_WRAPPERS,
  'ChainExpression',
]);

// a member-access node in EITHER parser: babel keeps OptionalMemberExpression distinct, while
// estree-toolkit (oxc) folds the optional marker into a MemberExpression under a ChainExpression.
// centralizes the two-type check that every member-receiver / member-write walk repeats so the
// pair stays in lockstep across the cluster
export function isMemberAccessNode(node) {
  return node?.type === 'MemberExpression' || node?.type === 'OptionalMemberExpression';
}

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

// nodes a chain's VALUE flows THROUGH on its way to a consumer: a sequence hands on its last
// expression, a `=` its right side, and a chain LOWERED to its guard scaffold (`null == (_ref = nav)
// ? void 0 : _ref.x`) reaches the consumer through the memo write, the null test and the
// conditional's slots. asked of the slot the child fills, so a consumer sitting BESIDE the chain
// (a sequence prefix, the other operand) cannot claim it
export function chainValueCarrier(node, child) {
  switch (node.type) {
    case 'SequenceExpression': return node.expressions.at(-1) === child;
    case 'AssignmentExpression': return node.operator === '=' && node.right === child;
    // through the null-literal canon: spelled by node TYPE it saw babel's `NullLiteral` only, so
    // the same scaffold answered false on the estree leg, where `null` parses as a `Literal`
    case 'BinaryExpression': return (node.operator === '==' || node.operator === '!=')
      && (node.left === child || node.right === child)
      && (isNullLiteralNode(node.left) || isNullLiteralNode(node.right));
    case 'ConditionalExpression': return node.test === child
      || node.consequent === child || node.alternate === child;
    default: return false;
  }
}

// is a `delete` the consumer anywhere above this chain? the operator may sit several tail steps up
// (`delete nav.Ctor.prototype.method`), and every step between is a member or a call. THE question both
// emitters ask before deciding what a proxy nav owes: under a delete the navigation collapses whole -
// the deleted member is never read, so no `?.` over it is load-bearing and no probe guard is built.
// path-shaped and dialect-neutral: the caller passes its own wrapper peel
export function deleteHostAboveChain(startPath, chainNode, unwrap) {
  let step = startPath;
  while (step?.node && unwrap(step.node) !== chainNode) step = step.parentPath;
  for (let up = step?.parentPath; up?.node; step = up, up = up.parentPath) {
    const { node } = up;
    if (node.type === 'UnaryExpression') return node.operator === 'delete';
    // a WRITE on the way up STORES this value: the delete is not its only consumer any more, so
    // the erase verdict's premise - that nothing over the navigation is read - stops there. the
    // one write it does not stop at is the LOWERED guard scaffold's own memo (`null == (_ref =
    // nav) ? void 0 : _ref.x`), whose null test consumes the write and holds no value of its own
    if (node.type === 'AssignmentExpression'
      && !(up.parentPath?.node?.type === 'BinaryExpression' && chainValueCarrier(up.parentPath.node, node))) return false;
    const stepsOn = node.type === 'MemberExpression' || node.type === 'OptionalMemberExpression'
      || node.type === 'CallExpression' || node.type === 'OptionalCallExpression';
    if (!stepsOn && unwrap(node) === node && !chainValueCarrier(node, step.node)) return false;
  }
  return false;
}

// canonical write-host enumeration: is the member-access at `memberPath` the WRITE TARGET of its
// enclosing host? covers `=` / update / `delete`, every destructuring-pattern slot (ArrayPattern,
// ObjectPattern value, default, rest), and for-of/in heads - shapes that rebind a member without
// appearing as a bare assignment LHS. one source for isDynamicComputedKeyWrite (computed-key alias
// bail) and memberPathWriteViolations (discriminant-narrow invalidation) so the two stay in lockstep
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
// doesn't care which wrappers were skipped. both legs' `isCallee` share this one wrapper-set,
// so adding a future transparent wrapper updates the single SKIPPABLE_WRAPPER_TYPES constant
export function unwrapRuntimeExpr(node) {
  while (node && SKIPPABLE_WRAPPER_TYPES.has(node.type)) node = node.expression;
  return node;
}

// does the subtree hold this exact node - the identity question an effect asks before it is
// re-emitted (the spelling that carries it already runs it, so a prepend would run it twice).
// both emitters ask it: the unplugin's rescue channels, and babel's guard render deciding which
// effects its own test re-emits
export function subtreeContainsNode(root, target) {
  if (root === target) return true;
  if (!root || typeof root !== 'object' || !root.type) return false;
  // eslint-disable-next-line no-restricted-syntax -- perf: AST hot path, plain objects
  for (const key in root) {
    const value = root[key];
    if (Array.isArray(value)) {
      for (const item of value) if (subtreeContainsNode(item, target)) return true;
    } else if (subtreeContainsNode(value, target)) return true;
  }
  return false;
}

// does this node destructure? the predicate over `DESTRUCTURE_PATTERN_TYPES`, re-exported here
// because this file is what both bindings import - the set itself lives with the type primitives
// (same coverage note as the peels: a seed widening this set to `ArrayExpression` moves neither
// emitter over either corpus - the provider rows are its only guard)
export function isDestructurePattern(node) {
  return DESTRUCTURE_PATTERN_TYPES.has(node?.type);
}

export { DESTRUCTURE_PATTERN_TYPES };

// the scope an alias's init / next hop is canonical in: the binding's OWN declaration scope, not the
// use site - a later hop reading an outer-declared name must not bind to an inner shadow of it. the
// detect-usage adapter surfaces the declaration scope on `binding.scope` (its path carries no scope),
// the raw babel binding on `binding.path.scope`; falls back to the use scope when neither is present.
// the PRIORITY is deliberate and belongs to the whole stack: the declaration's own path sees the
// shadows the declaration saw, which is the question every hop asks. spelled per site the rule lost
// one arm or the other at two thirds of them - the gap that under-resolved an alias-hop chain under
// a shadowed receiver. NOTE on coverage: the two arms coincide on every shape the fixture corpus and
// the differential carry - a seeded REVERSAL of this priority leaves both emitters byte-identical and
// is caught only by the provider row that asks the predicate directly. that row is the guard here
export function aliasDeclScope(binding, scope) {
  return binding?.path?.scope ?? binding?.scope ?? scope;
}

// the TRANSPARENT twin of `unwrapRuntimeExpr`: parens and TS casts only. a caller judging the VALUE
// peels the optional-chain marker with it too, one judging a SHORT-CIRCUIT must not - the marker is
// part of what it judges, which is the whole difference between the two wrapper sets. that
// difference is an ESTree one: the babel binding's parser spells an optional chain with no marker
// node at all, so the two peels coincide on everything it hands them and a site there may use
// either. on the ESTree side the choice is live, and the corpus holds it where the receiver of a
// destructure wears the marker - most sites survive a swap because the question they ask (a
// hop walk with its own `optional` guard, a Conditional / Logical test the marker can never be)
// cannot tell a marked node from the one under it
export function peelTransparentExpr(node) {
  while (node && TRANSPARENT_EXPR_WRAPPER_TYPES.has(node.type)) node = node.expression;
  return node;
}

// descend a member chain to its ROOT node, peeling only RUNTIME-transparent wrappers at every hop.
// deliberately NOT `descendToChainRoot`: that canon also peels sequence TAILS, which hands back
// `globalThis` for the very `(c++, globalThis)` root some callers here exist to recognise - and it
// lives a layer above this file, which every layer imports
function runtimeChainRoot(node) {
  let root = unwrapRuntimeExpr(node);
  while (root?.type === 'MemberExpression' || root?.type === 'OptionalMemberExpression') {
    root = unwrapRuntimeExpr(root.object);
  }
  return root;
}

// memoization peels parens + chain wrappers but deliberately NOT TS wrappers: keeping a TS cast
// in the checked node keeps the two emitters' `_ref` emission aligned,
// so both pipelines make the same reuse decision around optional chains. narrower than
// unwrapRuntimeExpr (which also strips TS)
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
// innermost non-wrapper path (or the input when nothing to peel).
// callers that need to walk down through TS / paren /
// chain wrappers to a semantic-bearing node use this; null-safe so chained calls don't
// require pre-guard. used by global-resolve's proxy-global detection where babel strips
// parens but oxc preserves them, and TS expression wrappers can land on either parser
export function peelSkippableWrapperPath(path, wrappers = SKIPPABLE_WRAPPER_TYPES) {
  while (path?.node && wrappers.has(path.node.type)) path = path.get('expression');
  return path;
}

// the TRANSPARENT-only twin: same descent, minus `ChainExpression`. callers that classify a receiver
// must not peel the optional-chain marker away - its short-circuit is part of the value they judge.
// only babel's `createParenthesizedExpressions` and oxc produce paren NODES to peel; babel's default
// parser records them in the `extra.parenthesized` flag instead, which call sites read separately
export function peelTransparentWrapperPath(path) {
  while (path?.node && TRANSPARENT_EXPR_WRAPPER_TYPES.has(path.node.type)) path = path.get('expression');
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
    // a TS namespace / enum body compiles to an IIFE, so its `this` is the IIFE's, never the
    // realm - the same boundary the census frame drops its top-level flag at, and the two are
    // asked about the same `this`
    if (type === 'TSModuleBlock' || type === 'TSModuleDeclaration' || type === 'TSEnumDeclaration') return false;
    if (type !== 'ArrowFunctionExpression' && FUNCTION_LIKE_NODE_TYPES.has(type)) return false;
  }
  return false;
}

// a function whose every call site is visible in the same expression - the immediately
// invoked callee (possibly behind parens / TS wrappers). caller-lossy parameter emissions
// (body-extract, leaf inline defaults) are sound ONLY here: a declared / exported function's
// callers are invisible to the transform, and mutating its pattern leaves or body changes
// what a caller-supplied argument observably produces
function isImmediatelyInvokedFunction(fnPath) {
  let callee = fnPath;
  let parent = fnPath.parentPath;
  while (parent?.node && TRANSPARENT_EXPR_WRAPPER_TYPES.has(parent.node.type)) {
    callee = parent;
    parent = parent.parentPath;
  }
  return (parent?.node?.type === 'CallExpression' || parent?.node?.type === 'OptionalCallExpression')
    && parent.node.callee === callee.node;
}

// the path whose node occupies `fnPath`'s param slot on the chain from `path` up to the
// function - null when the chain runs through the body instead. the param slot is where a
// caller-supplied value enters
function findFunctionParamPath(path, fnPath) {
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
  // unconditionally). fall through to the param-override scan / conservative bail for that shape.
  // the lexical name is the ONLY such channel: `arguments.callee` would be the other one, but every
  // shape that reaches this gate binds through a PATTERN or a DEFAULT, and a non-simple parameter
  // list gets an unmapped arguments object whose `callee` is the poison-pill accessor - so a
  // callee-recursing caller cannot coexist with the emission this guards
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

// climb from an identifier at the bottom of an N-deep `<Map.Provider.X />` object-chain to the
// terminal member sitting in the tag-name slot; a non-member position returns the path itself.
// only the root identifier is a runtime reference - the `.Provider.X` tail reads props off it -
// so the callers judge the CLIMBED path's slot (opening-element name) to accept arbitrary depth
export function climbJsxMemberChain(path) {
  let cur = path;
  while (cur?.parent?.type === 'JSXMemberExpression' && cur.parent.object === cur.node) {
    cur = cur.parentPath;
  }
  return cur;
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

// the identifiers a construct DECLARES - the leaves of its binding patterns, its own name, an
// import's local - as node identities: the reference walk skips exactly those nodes, so a
// same-named declaration in the subtree does not read as a read. null for a node declaring nothing
function declaredIdentifierNodes(node) {
  let out = null;
  function add(id) {
    (out ??= new Set()).add(id);
  }
  switch (node.type) {
    case 'VariableDeclarator': walkPatternIdentifiers(node.id, add); break;
    case 'CatchClause': if (node.param) walkPatternIdentifiers(node.param, add); break;
    case 'ClassDeclaration': case 'ClassExpression':
    case 'TSEnumDeclaration': case 'TSModuleDeclaration': case 'TSImportEqualsDeclaration':
      if (node.id?.type === 'Identifier') add(node.id);
      break;
    case 'ImportSpecifier': case 'ImportDefaultSpecifier': case 'ImportNamespaceSpecifier':
      if (node.local) add(node.local);
      break;
    default:
      if (FUNCTION_LIKE_NODE_TYPES.has(node.type)) {
        if (node.id?.type === 'Identifier') add(node.id);
        for (const param of node.params ?? []) walkPatternIdentifiers(param, add);
      }
  }
  return out;
}

// type space is erased at runtime, so a name inside it reads nothing: the child slots that hold
// only types - the annotation half of a cast included, the value it asserts over sits in its other
// slot - and the declarations that are type space whole. the list is deliberately partial in BOTH
// dialects: an unlisted node stays walked, and an over-counted read only makes the census more
// conservative, so a Flow shape absent here costs a refusal, never a wrong answer
const TYPE_SPACE_CHILD_KEYS = new Set([
  'typeAnnotation',
  'returnType',
  'typeParameters',
  'typeArguments',
  'superTypeParameters',
  'superTypeArguments',
  'implements',
]);
const TYPE_SPACE_NODE_TYPES = new Set([
  'TSTypeAnnotation',
  'TypeAnnotation',
  'TSInterfaceDeclaration',
  'TSTypeAliasDeclaration',
  'TSDeclareFunction',
  'TSDeclareMethod',
]);

export function identifierReferencedInSubtree(node, name) {
  return identifierReferencedIn(node, name, null);
}

// `declared`: the identifier nodes an enclosing construct declares - a declaration of the name is
// not a reference to it
function identifierReferencedIn(node, name, declared) {
  if (!node || typeof node !== 'object' || typeof node.type !== 'string') return false;
  if (node.type === 'Identifier') return node.name === name && !declared?.has(node);
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
      : identifierReferencedIn(tag, name, declared)) return true;
    return (node.attributes ?? []).some(attr => identifierReferencedIn(attr, name, declared));
  }
  // reached only as a JSXMemberExpression root now - the referencing position
  if (node.type === 'JSXIdentifier') return node.name === name;
  if (TYPE_SPACE_NODE_TYPES.has(node.type)) return false;
  const own = declaredIdentifierNodes(node);
  const inner = !own ? declared : !declared ? own : new Set([...declared, ...own]);
  // recurse, skipping the source-text name slots `isNonReferencePosition` recognises (member tail,
  // object / class / method / field key, label, import / export specifier, JSX attribute name /
  // member-tag tail) - those are name literals, not references - and the type-space slots
  // eslint-disable-next-line no-restricted-syntax -- perf: AST hot path, plain objects
  for (const key in node) {
    const child = node[key];
    if (TYPE_SPACE_CHILD_KEYS.has(key) || isNonReferencePosition(node, child)) continue;
    if (Array.isArray(child)) {
      for (const grandchild of child) if (identifierReferencedIn(grandchild, name, inner)) return true;
    } else if (identifierReferencedIn(child, name, inner)) return true;
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

// the statement LIST a node hosts, `null` for a non-host: the `.body` list hosts above plus
// `SwitchCase`, which holds its list at `consequent`
export function statementListOf(node) {
  if (node?.type === 'SwitchCase') return node.consequent;
  return STATEMENT_LIST_HOST_TYPES.has(node?.type) && Array.isArray(node.body) ? node.body : null;
}

// the other half of the statement lattice: slots holding exactly ONE statement rather than a list -
// an un-braced control-flow body. no statement-list walk can reach them, so a pass that rewrites a
// statement into SEVERAL has to brace the slot first: the extra statements have nowhere else to go
export const SINGLE_STATEMENT_SLOTS = new Map([
  ['DoWhileStatement', ['body']],
  ['ForInStatement', ['body']],
  ['ForOfStatement', ['body']],
  ['ForStatement', ['body']],
  ['IfStatement', ['consequent', 'alternate']],
  ['LabeledStatement', ['body']],
  ['WhileStatement', ['body']],
  ['WithStatement', ['body']],
]);

// does `node` stand in a STATEMENT position under `parent` - a member of its statement list or its
// un-braced body - as opposed to a slot a statement-shaped node can also fill (a loop head's
// declaration, an export's declaration)? by identity, for a caller that holds the node and its
// parent but not the key; a walk that has the key answers the same off the two sets above
export function isStatementPosition(node, parent) {
  return !!statementListOf(parent)?.includes(node)
    || (SINGLE_STATEMENT_SLOTS.get(parent?.type) ?? []).some(key => parent[key] === node);
}

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
    walkAstChildren(node, visit);
  }
  if (Array.isArray(scopeNode?.body)) for (const stmt of scopeNode.body) visit(stmt);
  else visit(scopeNode?.body);
}

// collect `var` bindings inside `scopeNode`, stopping at nested var-scope boundaries so inner-
// function vars don't leak. returns a Map of var-name -> EVERY VariableDeclarator declaring it, in
// source order: membership callers use `.has(name)`, alias-resolution callers read `[0].init`
// (first declaration wins on redeclaration), and the alias registry keys its entry under all of
// them - a redeclaration merges into ONE runtime binding while the two scope trackers disagree
// about which declarator a read resolves to. init-less redeclarations (`var M;`) are kept: they
// bind the same slot, which is what the registry keys on, even though they write no value
function collectScopeVars(scopeNode) {
  const locals = new Map();
  walkVarScope(scopeNode, node => {
    if (node.type === 'VariableDeclaration' && node.kind === 'var') {
      // `declare var X` is tsc-elided - the reference resolves to the global, so the ambient
      // declaration must not register as a hoisted-var shadow that suppresses polyfill emission
      if (node.declare !== true) {
        for (const d of node.declarations ?? []) walkPatternIdentifiers(d.id, id => {
          const declarators = locals.get(id.name);
          if (declarators) {
            if (declarators.at(-1) !== d) declarators.push(d);
          } else locals.set(id.name, [d]);
        });
      }
      return true; // a var declaration opens no nested var-scope to descend
    }
    return isVarScopeBoundary(node.type);
  });
  return locals;
}

// the function whose PARAMETER LIST contains this path, or null. the parameter list is its own
// lexical region: what the function BODY declares does not cover a use here, so
// `function f(x = Map) { var Map = 1 }` reads the OUTER `Map` in the default. a use inside a
// closure written in the default answers null - that closure captures the parameter scope too, but
// neither tracker models it and widening there is a separate decision
export function enclosingParameterListOwner(usePath) {
  let child = usePath;
  for (let p = usePath?.parentPath; p?.node; child = p, p = p.parentPath) {
    if (!FUNCTION_LIKE_NODE_TYPES.has(p.node.type)) continue;
    return p.node.params?.includes(child.node) ? p : null;
  }
  return null;
}

// the nodes proven to carry no parameter decorator ANYWHERE above them. the climb runs per binding
// lookup and reaches the program root on every file that decorates nothing - one file of ordinary
// code took two and a half million ancestor steps through it - so each walk marks the chain it
// proved and every later lookup stops at the first mark. only the NEGATIVE is kept: it is the
// answer that repeats, and it holds no path a later mutation could stale
const noParameterDecoratorAbove = new WeakSet();

// the function a parameter DECORATOR hanging over this path belongs to, or null. a decorator is
// evaluated where the CLASS is defined - outside the parameter list it hangs off AND outside the
// decorated function - so nothing that function declares shadows a name the decorator reads. the
// parameter-PROPERTY arm of the same fact is carved out in `findTSRuntimeBindingInPath`
export function enclosingParameterDecoratorOwner(usePath) {
  const proved = [];
  for (let p = usePath; p?.node; p = p.parentPath) {
    if (noParameterDecoratorAbove.has(p.node)) break;
    proved.push(p.node);
    const parent = p.parentPath?.node;
    // only a parent that HOLDS decorators can answer 'decorators', and that property read is what
    // keeps the walk off the canon call on every other step
    if (!parent?.decorators?.length || definitionTimeSlotOf(parent, p.node) !== 'decorators') continue;
    const owner = p.parentPath?.parentPath;
    return owner?.node && FUNCTION_LIKE_NODE_TYPES.has(owner.node.type)
      && owner.node.params?.includes(p.parentPath.node) ? owner : null;
  }
  for (const node of proved) noParameterDecoratorAbove.add(node);
  return null;
}

// the two frames a USE sits in - the owner of the parameter list holding it and the owner of the
// parameter decorator hanging over it - asked by every climb a binding lookup makes (the var-owner
// climb, the region test, the runtime-binding scan): answered ONCE per use node. a node keeps its
// parameter position for the life of the tree, so the memo has nothing to stale
const useRegionFramesCache = new WeakMap();
function useRegionFrames(usePath) {
  const node = usePath?.node;
  if (!node) return { paramOwner: null, decoratedOwner: null };
  let frames = useRegionFramesCache.get(node);
  if (!frames) {
    frames = { paramOwner: enclosingParameterListOwner(usePath), decoratedOwner: enclosingParameterDecoratorOwner(usePath) };
    useRegionFramesCache.set(node, frames);
  }
  return frames;
}

// is the use inside this statement's controlling HEAD - inside the statement, but not in any of the
// body slots it holds? answered by ONE bounded climb from the use, and only asked once a binding has
// actually been found in one of those slots, so the common lookup never pays for it
function useSitsInStatementHead(usePath, hostNode, slots) {
  let child = usePath;
  for (let p = usePath?.parentPath; p?.node; child = p, p = p.parentPath) {
    if (p.node !== hostNode) continue;
    return slots.every(slot => p.node[slot] !== child.node);
  }
  return false;
}

// a program-level `var` in a SCRIPT does not create a fresh binding: it aliases the global property
// of that name, which still holds the real global until the declarator's own assignment runs. so a
// use at program level BEFORE that assignment reads the GLOBAL, whatever the tracker says - and a
// declarator with no init never overwrites it at all. a use inside a function stays shadowed: whether
// the call lands before or after the assignment is not decidable from position
function scriptProgramVarUncoveredUse(ownerNode, declaratorNode, usePath) {
  if (ownerNode?.type !== 'Program' || ownerNode.sourceType !== 'script') return false;
  if (declaratorNode?.type !== 'VariableDeclarator') return false;
  for (let p = usePath; p?.node && p.node.type !== 'Program'; p = p.parentPath) {
    if (FUNCTION_LIKE_NODE_TYPES.has(p.node.type)) return false;
  }
  // no init: the declaration never overwrites the global property, so it never shadows
  const assignmentEnd = declaratorNode.init?.end;
  const useStart = usePath?.node?.start;
  return typeof useStart !== 'number' || typeof assignmentEnd !== 'number' || useStart < assignmentEnd;
}

// path-level entry for the region predicate: the binding path is a declarator, and the owner is the
// var scope it hoists to (the declaration itself may sit in any nested block)
function scriptProgramVarUncoveredBinding(bindingPath, usePath) {
  if (bindingPath?.node?.type !== 'VariableDeclarator') return false;
  if (bindingPath.parentPath?.node?.kind !== 'var') return false;
  return scriptProgramVarUncoveredUse(findNearestVarScopeOwner(bindingPath)?.node, bindingPath.node, usePath);
}

// is this binding unreachable from the use? four cases answer yes. three are REGIONS, where a scope
// tracker hoists a declaration onto an enclosing scope that the use position never sees: a use in the
// PARAMETER LIST cannot see what the BODY declares, a use in a parameter DECORATOR cannot see
// anything the decorated function declares at all - neither its parameters nor its body - and a use
// in a statement HEAD cannot see what that statement's BODY declares. `var` is deliberately not a
// REGION case HERE - it hoists to the function scope and DOES cover the parameter list and the
// statement head. the decorator is where that stops: it is evaluated outside the function
// altogether, so the decorated frame's own hoists are skipped by the var climb - the exemption
// lives with that climb, which is what asks the `var` question. the fourth case
// is POSITIONAL and `var`-only: a script's program-level `var` aliases a global property rather than
// shadowing it, so a use before its assignment reads the global (see the helper above).
// the walk is the BINDING's own ancestry, which the region test needs anyway: the two parameter
// regions are compared node-wise as it climbs, and the statement-head question is asked only where
// the binding really sits in a body slot
export function bindingInvisibleFromUseRegion(bindingPath, usePath) {
  if (!bindingPath?.node || !usePath?.node) return false;
  if (scriptProgramVarUncoveredBinding(bindingPath, usePath)) return true;
  const { paramOwner, decoratedOwner } = useRegionFrames(usePath);
  const decorated = decoratedOwner?.node ?? null;
  const paramBody = decorated ? null : paramOwner?.node?.body ?? null;
  const { chain, heads } = bindingAncestryFacts(bindingPath);
  // a use in neither parameter region (every use of ordinary code) asks only the statement-head
  // question, and only of the hosts the binding really sits in a body slot of - usually none
  if (!decorated && !paramBody) return heads.some(({ host, slots }) => useSitsInStatementHead(usePath, host, slots));
  for (const { node, listKey, slots } of chain) {
    // a binding written INSIDE a decorator is not something the decorated function declares - it
    // sits in the same subtree as the use and covers it. a lexical lookup cannot hand back a
    // SIBLING decorator's binding, so reaching this edge at all means the two share the decorator
    if (decorated && listKey === 'decorators') return false;
    if ((decorated && node === decorated) || (paramBody && node === paramBody)) return true;
    if (slots && useSitsInStatementHead(usePath, node, slots)) return true;
  }
  return false;
}

// the BINDING's own ancestry, read once per binding node: every ancestor with the list it hangs in,
// and the single-statement HOSTS whose body slot holds the binding (their `slots`, for the head
// test). the region test walked this chain per lookup - a third of the transform's steps on a
// binding-heavy bundle; the chain is the binding's, not the use's, so it is the same every time
// ... until an emitter RE-HOMES the declaration (a split, a join, a lift): the cached chain is then
// checked against the live one by pointer, a walk with none of the slot questions, and rebuilt on
// the first ancestor that moved
const bindingAncestryFactsCache = new WeakMap();
function bindingAncestryFacts(bindingPath) {
  let facts = bindingAncestryFactsCache.get(bindingPath.node);
  if (facts && ancestryUnchanged(bindingPath, facts.chain)) return facts;
  const chain = [];
  const heads = [];
  let child = null;
  for (let p = bindingPath; p?.node; child = p, p = p.parentPath) {
    const slots = child ? SINGLE_STATEMENT_SLOTS.get(p.node.type) : undefined;
    const hosts = slots?.some(slot => p.node[slot] === child.node) ? slots : null;
    chain.push({ node: p.node, listKey: p.listKey, slots: hosts });
    if (hosts) heads.push({ host: p.node, slots: hosts });
  }
  facts = { chain, heads };
  bindingAncestryFactsCache.set(bindingPath.node, facts);
  return facts;
}
// ... does the live ancestry still match the chain read back then? node and list slot per level
function ancestryUnchanged(bindingPath, chain) {
  let index = 0;
  for (let p = bindingPath; p?.node; p = p.parentPath, index++) {
    if (chain[index]?.node !== p.node || chain[index].listKey !== p.listKey) return false;
  }
  return index === chain.length;
}

// climb `path`'s enclosing var-scope owners (inclusive), calling `visit(owner)` at each and
// returning the first non-undefined result, else undefined. a namespace body is an owner like
// any function's: a use inside it sees every outer owner's hoists (the namespace lowers to a
// closure over the enclosing scope), and a use outside never enters it - the climb only goes
// UP, and the walk over an owner's own vars stops at a nested namespace boundary. shared by the
// var-declarator lookup and the sloppy block-function lookup below
function climbVarScopeOwners(path, visit) {
  // a use inside a function's PARAMETER list sits outside the region that function's own `var`s
  // cover, so its nearest owner contributes nothing and the climb starts one frame out
  // ... a use inside a parameter DECORATOR sits outside the decorated function altogether - the
  // decorator is evaluated where the class is defined - so that function's own hoists reach it no
  // more than its parameters do. only ITS frame is skipped: a `var` further out really does cover
  // the decorator. this is where `var` parts from the region cases, which it otherwise ignores
  const { paramOwner, decoratedOwner } = useRegionFrames(path);
  const paramFrame = paramOwner?.node ?? null;
  const decoratedFrame = decoratedOwner?.node ?? null;
  for (let owner = findNearestVarScopeOwner(path); owner; owner = findNearestVarScopeOwner(owner.parentPath)) {
    if (owner.node !== paramFrame && owner.node !== decoratedFrame) {
      const result = visit(owner);
      if (result !== undefined) return result;
    }
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

// ... and this is the one mutation that breaks that contract from INSIDE the transform: a `var`
// an emitter MINTS into the tree is absent from an index built before it, and the entry is keyed on
// the owner NODE, which does not change when a declarator lands under it. the query then answers a
// stale "no" and the binding reads as never written - so its reaching value is lost, and with it
// every narrow that value drives. a HIT can never be stale (nothing removes a var here), so
// dropping the owner's entry at the mint is the whole of the fix; rechecking every MISS instead
// costs a fifth of the transform. the owner is the one a `var` hoists to, which is where the
// minted declarator lands whatever slot spells it
export function invalidateScopeVarIndex(path) {
  const owner = findNearestVarScopeOwner(path);
  if (owner?.node) scopeVarsCache.delete(owner.node);
  bindingLookupGeneration += 1;
}

// the closest-binding answer for one (scope, name, use node), kept across the consumers that ask it
// again: a member's meta, its union, the resolver's own lookup each re-resolve the same identifier,
// and a binding-heavy bundle asked six times per unique triple. the answer changes only when a
// declaration is minted into the tree, which is the one event above - every entry carries the
// generation it was computed in and is recomputed past a mint
let bindingLookupGeneration = 0;
const bindingLookupCache = new WeakMap();
export function memoizeBindingLookup(scope, name, path, compute) {
  const node = path?.node;
  if (!scope || !node) return compute();
  let byName = bindingLookupCache.get(scope);
  if (!byName) bindingLookupCache.set(scope, byName = new Map());
  let byNode = byName.get(name);
  if (!byNode) byName.set(name, byNode = new WeakMap());
  const hit = byNode.get(node);
  if (hit && hit.generation === bindingLookupGeneration) return hit.value;
  const value = compute();
  byNode.set(node, { generation: bindingLookupGeneration, value });
  return value;
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
    const declarators = cachedScopeVars(owner.node).get(name);
    // `declarators[0]` is the first declaration of the name in the owner - the one whose init the
    // alias resolvers read; the full list rides along for the registry's slot keying
    return declarators ? { owner, declarator: declarators[0], declarators } : undefined;
  }) ?? null;
}

export function findFunctionScopeVarDeclaratorInPath(path, name) {
  return findVarOwnerDeclaring(path, name)?.declarator ?? null;
}

// ONE path-tracked traverse per OWNER indexes every write-shaped node (declarators,
// assignments, updates, for-x heads - and the block-level function declarations a hoisted twin
// stands on) to its live path - per-binding / per-query owner
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
    FunctionDeclaration: add,
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

// synthesize a binding for a function-scoped declaration the native trackers block-scope: a `var`
// in a nested block that estree-toolkit fails to hoist (`function f(){ if (c) { var G = Array }
// G.from(...) }` - babel hoists it natively, so it reaches this only after a null native lookup)
// and, on BOTH parsers, a sloppy block-level `function` Annex B hoists onto the same owner. shape
// carries `.node` (declarator / function) + recomputed violations, the minimum the static-receiver
// walk + reassignment gates read (they fall back to `.node` when there is no `.path`)
export function synthHoistedBinding(path, name) {
  const found = path ? findVarOwnerDeclaring(path, name) : null;
  if (!found) {
    // the Annex-B climb only finds something in a SLOPPY owner: a module has none, so the lookups
    // of every modern bundle skip that second climb outright
    const hoisted = path && anySloppyOwnerAbove(path) ? findSloppyBlockFunctionInPath(path, name) : null;
    return hoisted ? synthHoistedFunctionBinding(hoisted) : null;
  }
  const violationNodes = collectScopeReassignmentNodes(found.owner, name).filter(node => node !== found.declarator);
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
    // every declarator of the name in the owner, in source order. a consumer deciding whether a
    // NATIVE binding it also holds is a shadow or just another declarator of this same var needs
    // the whole list - `node` alone answers only for the first one
    declarators: found.declarators,
    constantViolations: violationNodes,
    importSource: null,
    polyfillHint: null,
  };
}

// the function-declaration twin of the shape above: nothing to follow (a function is never a
// global's alias) and no writes of its own to recover - the view exists so a name the function
// shadows resolves to it, on the type layer as on the detect layer, instead of past it to the
// global. the same slots, so the funnel's twin builder reads it unchanged
function synthHoistedFunctionBinding({ owner, fn }) {
  let resolved;
  function declarationPath() {
    if (resolved === undefined) resolved = ownerWritePathIndex(owner).get(fn) ?? null;
    return resolved;
  }
  return {
    node: fn,
    ownerNode: owner.node,
    resolveDeclaratorPath: declarationPath,
    resolveViolationPaths: () => [],
    ownerScope: owner.scope,
    resolveDeclarationScope: () => declarationPath()?.scope ?? owner.scope ?? null,
    kind: 'hoisted',
    declarators: [],
    constantViolations: [],
    importSource: null,
    polyfillHint: null,
  };
}

// name -> the first block-nested `function f(){}` declaration hoisted to `scopeNode`'s var scope under
// sloppy-mode Annex-B semantics (a block-level function declaration is function-scoped, not
// block-scoped, in non-strict code). same descent RULE as `walkVarScope` (descend non-boundary
// nodes, stop at nested var-scope boundaries) but a separate walk, not a reuse: the B.3.2 blocking
// set has to be threaded down per level, which `walkVarScope`'s `onNode(node)` signature cannot
// carry. the node backs a binding VIEW with nothing to follow: a function has no `.init`, so the
// result must never feed the declarator-reading path
const scopeBlockFunctionsCache = new WeakMap();
// the lexical names (`let` / `const` / `class`) bound at the TOP of a block body - an Annex-B
// block-function hoist is BLOCKED (B.3.2) when any block between the function and its var-scope
// owner lexically rebinds the name, so the top-level reference stays the global
const NO_LEXICAL_NAMES = new Set();
// null rather than an empty Set when nothing is bound: this runs on every construct of every scope
// walk, and the common shapes (a `var` head, a block with no lexicals) bind nothing at all
function blockLexicalNames(bodyStatements, into = null) {
  let lex = into;
  for (const stmt of bodyStatements ?? []) {
    if (stmt?.type === 'VariableDeclaration' && stmt.kind !== 'var') {
      for (const d of stmt.declarations ?? []) walkPatternIdentifiers(d.id, id => (lex ??= new Set()).add(id.name));
    } else if (stmt?.type === 'ClassDeclaration' && stmt.id?.name) (lex ??= new Set()).add(stmt.id.name);
  }
  return lex;
}
// a lexical VariableDeclaration head (`for (let x ...)`), or null - a `var` head hoists to the
// function scope and a bare-identifier / expression head binds nothing, so neither blocks
function lexicalHeadStatements(head) {
  return head?.type === 'VariableDeclaration' && head.kind !== 'var' ? head : null;
}
// every lexical binding a node introduces AROUND its subtree, which is what blocks the Annex-B
// hoist for that name. a block body is only one of the shapes: a for-head `let`/`const` scopes to
// the whole loop, case-level lexicals live in the switch's single case-block env, and a
// DESTRUCTURING catch param is a lexical too. an IDENTIFIER catch param is deliberately absent -
// B.3.5 exempts it, so `catch (X) { { function X(){} } }` still hoists
function annexBBlockingNames(node) {
  switch (node.type) {
    case 'BlockStatement': return blockLexicalNames(node.body);
    case 'SwitchStatement': {
      // the cases share ONE block env, so their lexicals merge - accumulated in place rather than
      // through a flattened copy of every case body
      let lex = null;
      for (const c of node.cases ?? []) lex = blockLexicalNames(c.consequent, lex);
      return lex;
    }
    case 'ForStatement': {
      const head = lexicalHeadStatements(node.init);
      return head ? blockLexicalNames([head]) : null;
    }
    case 'ForOfStatement': case 'ForInStatement': {
      const head = lexicalHeadStatements(node.left);
      return head ? blockLexicalNames([head]) : null;
    }
    case 'CatchClause': {
      if (!node.param || node.param.type === 'Identifier') return null;
      const names = new Set();
      walkPatternIdentifiers(node.param, id => names.add(id.name));
      return names;
    }
    default: return null;
  }
}
function collectScopeBlockFunctions(scopeNode) {
  const names = new Map();
  function visit(node, blocked) {
    if (!isASTNode(node)) return;
    if (node.type === 'FunctionDeclaration') {
      // register the block-function's hoisted name ONLY when no intervening block lexically
      // rebinds it (an intervening `let Array` keeps `Array` the GLOBAL - under-suppressing here
      // would drop a needed polyfill). a function is a var-scope boundary - don't descend its body
      if (node.id?.name && !blocked.has(node.id.name) && !names.has(node.id.name)) names.set(node.id.name, node);
      return;
    }
    if (isVarScopeBoundary(node.type)) return;
    // entering a lexical-introducing construct extends the blocked set with the names it binds
    const introduced = annexBBlockingNames(node);
    const next = introduced?.size ? new Set([...blocked, ...introduced]) : blocked;
    walkAstChildren(node, child => visit(child, next));
  }
  // the owner scope's own body-block lexicals block the hoist too
  const body = Array.isArray(scopeNode?.body) ? scopeNode.body : scopeNode?.body?.body;
  const ownerLex = blockLexicalNames(Array.isArray(body) ? body : null) ?? NO_LEXICAL_NAMES;
  if (Array.isArray(body)) for (const stmt of body) visit(stmt, ownerLex);
  else visit(scopeNode?.body, ownerLex);
  return names;
}
function cachedScopeBlockFunctions(node) {
  let names = scopeBlockFunctionsCache.get(node);
  if (!names) scopeBlockFunctionsCache.set(node, names = collectScopeBlockFunctions(node));
  return names;
}

// does any var-scope owner at or above `path` run sloppy? answered once per nearest owner node:
// every lookup taken from inside that owner shares the answer, and it is false for every owner of
// an ES module
const anySloppyOwnerAboveCache = new WeakMap();
function anySloppyOwnerAbove(path) {
  const nearest = findNearestVarScopeOwner(path);
  if (!nearest?.node) return false;
  let answer = anySloppyOwnerAboveCache.get(nearest.node);
  if (answer === undefined) {
    answer = false;
    for (let owner = nearest; owner && !answer; owner = findNearestVarScopeOwner(owner.parentPath)) {
      answer = isSloppyAtPath(owner);
    }
    anySloppyOwnerAboveCache.set(nearest.node, answer);
  }
  return answer;
}

// the sloppy block-hoisted `function` of `name` an enclosing var-scope owner of `path` carries,
// with that owner - null when none does. the Annex-B hoist depends on the sloppiness of the OWNER where the block-function lives, NOT the
// use site: a STRICT inner function reading a name whose block-function hoists in a SLOPPY outer
// function still sees the shadow (strict does not change lexical resolution). check `isSloppyAtPath`
// at the matching OWNER. `|| undefined` keeps the climb going past a non-matching owner (visit must
// return undefined to continue), and the outer `?? false` normalises "no owner matched" to a boolean
function findSloppyBlockFunctionInPath(path, name) {
  return climbVarScopeOwners(path, owner => {
    // sloppiness FIRST: it is a short climb, while the block-function set is a full subtree walk
    // on its first query per owner - and in an ES module (every file of a modern bundle) the
    // answer is always false, so that walk would be built only to be thrown away
    const fn = isSloppyAtPath(owner) ? cachedScopeBlockFunctions(owner.node).get(name) : null;
    return fn ? { owner, fn } : undefined;
  }) ?? null;
}

// does the function at `scopePath` (descend blocks, stop at nested functions) bind `name` via a
// `var` declarator OR a hoisted FunctionDeclaration? the param-destructure body-extract emits a body-
// top `let <name>` aliasing the destructured parameter; a function-scoped `var <name>` / `function
// <name>(){}` legally REDECLARES a same-named parameter, but `let` + `var`/`function` in one scope is a
// SyntaxError - so the extract bails to the inline-default fallback when this returns true, mirroring
// the existing `paramListReadsName` bail. shared by both plugins' body-extract path
export function functionScopeBindsVarOrFunction(scopePath, name) {
  // the block-function half is Annex B, which only sloppy code has: in a module the block
  // function stays block-scoped and clashes with nothing at the body top
  return cachedScopeVars(scopePath.node).has(name)
    || (isSloppyAtPath(scopePath) && cachedScopeBlockFunctions(scopePath.node).has(name));
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

// the verdict is a fact about a node's ANCESTRY, and the climb reaches the program on every path of
// an ordinary module - so each walk marks the chain it decided and a later ask stops at the first
// mark. a node the climb passed is not decisive by construction, which is why its own answer is the
// one the walk returned; a new parse brings new nodes, the way every other index here works
const sloppyAtNode = new WeakMap();

// is the use site at `path` in non-strict (sloppy) code? Annex-B function hoisting applies only
// there. a module is always strict; a class body is always strict; a `"use strict"` on any
// enclosing function or the Program makes the whole subtree strict. walk up - the first strict
// signal wins, else the Program's sourceType decides (script -> sloppy). a detached path with no
// Program ancestor falls through to strict (safe: no Annex-B shadow surfaced)
export function isSloppyAtPath(path) {
  const decided = [];
  let answer = false;
  for (let cur = path; cur; cur = cur.parentPath) {
    const { node } = cur;
    if (!node) continue;
    if (sloppyAtNode.has(node)) {
      answer = sloppyAtNode.get(node);
      break;
    }
    decided.push(node);
    const { type } = node;
    if (type === 'ClassDeclaration' || type === 'ClassExpression') break;
    if ((FUNCTION_LIKE_NODE_TYPES.has(type) || type === 'Program') && nodeHasUseStrict(node)) break;
    if (type === 'Program') {
      answer = node.sourceType === 'script';
      break;
    }
  }
  for (const node of decided) sloppyAtNode.set(node, answer);
  return answer;
}

// boolean wrapper for callers that only need presence (runtime vs TS-ambient shadow detection;
// complements `findTSRuntimeBindingInPath`). beyond `var` hoists, surfaces sloppy-mode Annex-B
// block-function shadows: a block-nested `function Map(){}` hoists to the function scope in
// non-strict code and shadows the global, but native scope trackers block-scope it and miss the
// shadow -> usage-pure would wrongly substitute the global. gated on genuine sloppy context so
// modules / "use strict" (where the function IS block-scoped) keep resolving `name` to the global
// and usage-global never loses an injection. answers PRESENCE, but reads the declarator to do it:
// a script's program-level `var` aliases the global property instead of shadowing it, so a use
// before that declarator's assignment is NOT covered - the same positional carve-out
// `bindingInvisibleFromUseRegion` applies, and both shadow gates have to answer alike or the
// second re-asserts the shadow the first dropped
export function findFunctionScopeVarInPath(path, name) {
  const found = findVarOwnerDeclaring(path, name);
  if (found && !scriptProgramVarUncoveredUse(found.owner?.node, found.declarator, path)) return true;
  return !!findSloppyBlockFunctionInPath(path, name);
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
// `sloppy`: the owner sits in non-strict code, where a nested function's block-level `function`
// declarations hoist onto that function (Annex B) and shadow like its `var`s do
export function buildScopeReassignmentIndex(ownerNode, sloppy = false) {
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
  // names a block-scoped statement re-binds: `let`/`const` declarator, class / function decl -
  // through an `export` wrapper too (`namespace N { export let X }`, `export class X {}` bind
  // exactly like their bare forms)
  function stmtRebindNames(stmt, out) {
    const decl = unwrapExportedDeclaration(stmt);
    if (decl?.type === 'VariableDeclaration' && decl.kind !== 'var') {
      for (const d of decl.declarations) patternNames(d.id, out);
    } else if ((decl?.type === 'ClassDeclaration' || decl?.type === 'FunctionDeclaration') && decl.id?.name) {
      out.push(decl.id.name);
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
  function boundaryShadowNames(node, sloppyInside) {
    const names = [];
    for (const param of node.params ?? []) patternNames(param, names);
    for (const name of cachedScopeVars(node).keys()) names.push(name);
    // ... and, in sloppy code, the block-level functions Annex B hoists onto this boundary - the
    // population the sloppy shadow lookup consults, so a write under such a function targets
    // the hoisted binding here rather than the outer one
    if (sloppyInside) for (const name of cachedScopeBlockFunctions(node).keys()) names.push(name);
    // a `static { }` / namespace body holds its statements DIRECTLY, so the block-level rebind scan
    // never runs over them even though their `let` / `const` / class / function shadow exactly as a
    // nested block's do; and a named function EXPRESSION binds its own name inside itself. a write
    // to either targets that INNER binding - recording it against the outer one invents a
    // reassignment, which costs the outer binding its narrow and leaves the native in its place
    if (Array.isArray(node.body)) for (const stmt of node.body) stmtRebindNames(stmt, names);
    if (node.type === 'FunctionExpression' && node.id?.name) names.push(node.id.name);
    return names;
  }
  function visit(node, atOwnerRoot, sloppyHere) {
    if (!isASTNode(node)) return;
    // strictness is inherited downward and only ever tightens: a class body is strict, and so is
    // a function opening with the directive
    const sloppyInside = sloppyHere && node.type !== 'ClassDeclaration' && node.type !== 'ClassExpression'
      && !(isVarScopeBoundary(node.type) && nodeHasUseStrict(node));
    const shadowNames = atOwnerRoot ? EMPTY_REASSIGNMENTS
      : isVarScopeBoundary(node.type) ? boundaryShadowNames(node, sloppyInside)
      : blockShadowNames(node);
    // the switch DISCRIMINANT evaluates in the outer env before the case-block scope exists,
    // so its writes target the outer binding even when a case-level lexical shadows the name -
    // visit it UNSHADOWED, then only the cases under the shadow (a generic descent would
    // re-visit the discriminant and double-record its writes). at the OWNER ROOT the queried
    // bindings ARE those case-level lexicals, so there the discriminant is skipped outright
    if (node.type === 'SwitchStatement' && (atOwnerRoot || shadowNames.length)) {
      if (!atOwnerRoot) visit(node.discriminant, false, sloppyInside);
      push(shadowNames);
      for (const c of node.cases ?? []) visit(c, false, sloppyInside);
      pop(shadowNames);
      return;
    }
    push(shadowNames);
    // the written TARGET, through the wrappers a write may spell around it (`a! = v`,
    // `(a as any) = v`, `(a)++`): neither native tracker records those as writes, and this
    // scan is their only recorder
    const target = node.type === 'AssignmentExpression' ? unwrapRuntimeExpr(node.left)
      : node.type === 'UpdateExpression' ? unwrapRuntimeExpr(node.argument) : null;
    if (target?.type === 'Identifier') {
      record(target.name, node);
    } else if (target && isDestructurePattern(target)) {
      for (const name of patternNames(target, [])) record(name, node);
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
    // a function OWNER's own body block is the owner's scope, not a nested block: a declaration at
    // its top level - a hoisted `function name`, a `let` - IS the owner-level binding (a shadow of
    // an owner-level `var` or param there is a SyntaxError), so the block casts no shadow and every
    // write under it stays recorded (`function a() {} { var a = 'x' }` redeclares `a`)
    walkAstChildren(node, child => visit(child, atOwnerRoot && child === node.body && child.type === 'BlockStatement', sloppyInside));
    pop(shadowNames);
  }
  visit(ownerNode, true, sloppy);
  return index;
}
// every reassignment NODE of `name` within the owner's subtree, stopping at nested scopes /
// blocks that shadow `name`. cached per owner NODE via the all-names index above; the owner's
// PATH is what tells its strictness, read once per owner through the shared predicate every
// builder of this index owes - a consumer answering it differently gets a different write set
// for the same owner. shared by the var-hoist and the cross-boundary-`let` recovery, which
// differ only in how they locate the owner; a consumer needing a FRESH scan of a rewritten tree
// (babel's scope-lag recovery) builds its own off the same predicate rather than this cache
function collectScopeReassignmentNodes(ownerPath, name) {
  const ownerNode = ownerPath.node;
  let index = scopeReassignCache.get(ownerNode);
  if (!index) scopeReassignCache.set(ownerNode, index = buildScopeReassignmentIndex(ownerNode, isSloppyAtPath(ownerPath)));
  return index.get(name) ?? EMPTY_REASSIGNMENTS;
}

// var-hoist reassignment recovery: estree-toolkit block-scopes a `var`, so its constantViolations miss
// a cross-block redeclaration / write. recompute from the AST at the var's function-scope owner
function collectFunctionScopeVarReassignments(path, name) {
  const found = findVarOwnerDeclaring(path, name);
  if (!found) return [];
  // the scope-declaring var IS the binding's own declaration for the var-kind consumers
  // of this wrapper - excluded by identity so their reassignment gates stay unchanged
  return collectScopeReassignmentNodes(found.owner, name).filter(node => node !== found.declarator);
}

// UNFILTERED twin for the redecl machinery: a PARAM / hoisted binding owns no var
// declarator, so the scope-declaring var there is itself a re-declaration - ownership is
// decided positionally by the caller (`start > declStart`), not by scope-declaration
export function collectFunctionScopeVarWrites(path, name) {
  const found = findVarOwnerDeclaring(path, name);
  return found ? collectScopeReassignmentNodes(found.owner, name) : [];
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
  // a `let` / `const` inside `namespace N { ... }` scopes to the namespace body, so the reassignment
  // scan must anchor there - the var path already treats a TSModuleBlock as a var-scope owner, so
  // omitting it here over-scanned namespace lets into the enclosing function
  'TSModuleBlock',
  // a catch PARAMETER is a lexical binding scoped to its clause: both trackers hang its binding
  // off the CatchClause, and anchoring one host up recorded the outer binding's writes as its own
  // while hiding the writes in its body
  'CatchClause',
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
function withCanonicalViolations(binding, name) {
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
  const own = bindingDeclaratorNode(binding);
  const extras = canonical
    // `var name = X` re-declarations are excluded: the type layer resolves redecl flow through
    // its dedicated stale-redecl machinery (positional, per-block precise) - a conservative
    // marker here would erase that precision. so is the for-x head declaring the binding: the
    // type layer reads the iterated element off the head itself, and a marker would only cost
    // the binding its constancy. assignment-shaped writes stay
    .filter(node => node.type !== 'VariableDeclarator' && !isDeclaratorSelfViolation(node, own))
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

// is `path` contained within `node` - does `node` sit on `path`'s ancestor chain (inclusive)? the
// one containment question every scope decision asks: a use inside a namespace block, a native
// declaration inside the owner a hoisted twin belongs to
export function pathContainedBy(path, node) {
  for (let cur = path; cur; cur = cur.parentPath) {
    if (cur.node === node) return true;
  }
  return false;
}

// the hoisted twin of a nested-block `var` or of a sloppy block-level `function`, memoized per
// (declaration scope, name) so repeated lookups of the same name hand back ONE object - consumers compare bindings by identity. that key
// is deliberately a per-traversal object: a later traversal rebuilds its paths, and a node-keyed
// memo would hand it a twin still holding the dead one. the declarator search therefore runs before
// the memo can answer (it produces the key), which is why it stays bounded to the var owner.
// `null` (no such var / no use path) falls through to the caller's own miss handling
// `native` is the binding the caller's own lookup answered, or null. a `var` RE-declaration is not
// a shadow - every same-name declarator in the owner IS the one hoisted binding - but one tracker
// block-scopes the later declarator and answers a read inside that block with IT, an init-less view
// carrying none of the var's writes, where the tracker that hoists reports the whole flow. so the
// twin displaces a native view anchored on a declarator of this same var that is not the one the
// hoist reports; anchored on that one it IS the hoisted binding (richer channel, keep it), and
// anything else is a genuine shadow the twin must not shoulder aside
function hoistedBindingTwin(synthCache, path, name, native = null) {
  // the whole "does the twin displace the native view" decision lives here. the KIND test comes
  // first because it is the free half: only a `var` view can be anchored on a re-declaration, so
  // every other kind keeps the native answer without paying the owner climb below
  if (!path || (native && native.kind !== 'var')) return null;
  const synth = synthHoistedBinding(path, name);
  // ... and a native `var` declared OUTSIDE the twin's owner is the outer binding the twin shadows
  // from inside that owner (`function g() { { var a = 'x' } a.at() }` reads g's own `a`, not the
  // enclosing function's) - the same preference the estree adapter's closest-binding lookup takes
  if (native && (!synth || synth.node === native.path?.node
    || (!synth.declarators.includes(native.path?.node) && pathContainedBy(native.path, synth.ownerNode)))) return null;
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
    const { resolveDeclaratorPath, resolveViolationPaths, resolveDeclarationScope, ownerScope, declarators, ...nativeShaped } = synth;
    byName.set(name, twin = {
      ...nativeShaped,
      path: declaratorPath,
      scope: ownerScope,
      constantViolations: violationPaths,
    });
  }
  return twin;
}

// the other half of the SET normalization, and the reason it belongs on the funnel: a bare
// same-name redeclaration (`var x = [1]; var x;`) writes NO value, yet both native trackers record
// it as a constantViolation. the detect layer strips it per consumer; the type layer, which reads
// the list at twenty-odd places (arm enumeration, positional init test, the plain bail gates),
// stripped it nowhere - so a phantom degraded every one of them to the generic answer. `.constant`
// is re-derived for the same reason `withCanonicalViolations` clears it when it ADDS: one binding
// must not answer the two questions differently
// ... and `constant` answers "no write beyond the declaration": a for-x head's per-iteration
// re-init of its own binding and an identity self-assign are writes the list keeps (the value
// union reads the head), but neither changes what the declaration gave, and a narrow that keys on
// constancy - the typeof guard - is sound over them
function withoutPhantomWrites(binding) {
  const violations = binding?.constantViolations;
  const filtered = withoutValuelessDeclarationViolations(violations);
  const constant = !cleanDestructureAliasWrites(binding).length;
  if (filtered === violations && constant === !!binding?.constant) return binding;
  return { ...binding, constant, constantViolations: filtered };
}

// the parameter-PROPERTY twin: `constructor(private a: T = v)` binds `a` in the constructor's
// own scope, and neither tracker registers it - the accessibility wrapper is a TS node both walk
// past (the estree pipeline unwraps the DEFAULTED form ahead of its crawl, so that form reaches
// here on babel alone). the view stands on the parameter itself, whose annotation and default the
// type layer reads, in the constructor's scope, with the constructor's writes to the name as its
// violations - resolved through the owner's write index like the hoisted twin's, and declined
// whole when one cannot be located. a use in a decorator hanging off that same parameter list is
// evaluated outside the constructor and sees no parameter property, as in the binding climb
function parameterPropertyTwin(synthCache, path, name) {
  const decorated = useRegionFrames(path).decoratedOwner?.node ?? null;
  for (let cur = path; cur?.node; cur = cur.parentPath) {
    const { node, scope } = cur;
    if (!FUNCTION_LIKE_NODE_TYPES.has(node.type) || node === decorated) continue;
    const index = (node.params ?? []).findIndex(param => param?.type === 'TSParameterProperty'
      && tsRuntimeBindingName(patternSlotTarget(param.parameter)) === name);
    if (index === -1) continue;
    if (!scope) return null;
    let byName = synthCache.get(scope);
    if (!byName) synthCache.set(scope, byName = new Map());
    if (byName.has(name)) return byName.get(name);
    const paramPath = cur.get('params')[index]?.get('parameter');
    const writePaths = ownerWritePathIndex(cur);
    let constantViolations = [];
    for (const write of collectScopeReassignmentNodes(cur, name)) {
      const writePath = writePaths.get(write);
      if (!writePath) {
        constantViolations = null;
        break;
      }
      constantViolations.push(writePath);
    }
    const twin = paramPath?.node && constantViolations ? {
      node: paramPath.node,
      path: paramPath,
      scope,
      name,
      kind: 'param',
      constantViolations,
      constant: !constantViolations.length,
      importSource: null,
      polyfillHint: null,
    } : null;
    byName.set(name, twin);
    return twin;
  }
  return null;
}

// wrap a scope-binding lookup so every consumer sees the canonically-merged violation list.
// the cache returns the SAME wrapped object per native binding - identity compares between
// two lookups of the same binding keep holding.
// a function-scoped declaration the native trackers block-scope is synthesized here as a twin: a
// `var` in a NESTED block is reported by one parser (which hoists it natively) and missed by the
// other (which scopes it to the block), so a use past that block found NOTHING and every consumer
// silently degraded - the type widened to generic, a guard stopped narrowing; a sloppy block-level
// `function` and a TS parameter PROPERTY are invisible to BOTH. the twin carries the `.path`
// consumers read (annotation lookup, init descent, scope anchoring), and a parser that answers on
// its own never reaches the synthesis - the no-op the synthetic shape is documented to be
export function wrapScopeBindingLookup(lookup) {
  const cache = new WeakMap();
  const synthCache = new WeakMap();
  return (scope, name, path = null) => {
    const native = lookup(scope, name, path);
    const binding = hoistedBindingTwin(synthCache, path, name, native) ?? native
      ?? parameterPropertyTwin(synthCache, path, name);
    if (!binding) return binding;
    // a binding that does not cover the use is not the use's binding - the same question both
    // detection gates ask, asked once here so the resolver cannot narrow THROUGH a shadow they
    // already dropped and degrade the result to the generic helper
    if (path && binding.path && bindingInvisibleFromUseRegion(binding.path, path)) return undefined;
    let wrapped = cache.get(binding);
    if (!wrapped) {
      wrapped = withCanonicalViolations(withoutPhantomWrites(binding), name);
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
function collectScopeLetReassignments(declaratorPath, name) {
  let host = null;
  // inclusive of the binding path itself: a catch PARAMETER's is the CatchClause hosting it
  for (let p = declaratorPath; p && !host; p = p.parentPath) {
    if (LET_SCOPE_HOST_TYPES.has(p.node?.type)) host = p;
  }
  // the list keeps the for-x head that DECLARES the binding: it is the binding's value source (the
  // union reads the iterated elements off it) while not being a reassignment beyond the declaration
  // - the consumers ask `isDeclaratorSelfViolation` to tell the two apart
  return host ? collectScopeReassignmentNodes(host, name) : [];
}

// per-loop-field control-flow traits, single-sourced so the USE-side re-run walk and the
// WRITE-side conditional-dominance walk cannot drift apart:
//   rerun - the back-edge re-executes the field each iteration, so a use there can observe a
//           textually-later write. a `for`'s TEST and UPDATE, a while/do-while TEST and a
//           for-in/of LEFT (its pattern defaults / computed keys) all re-run; only the `for`
//           INIT and the for-x RIGHT (the iterable) run once per entry.
//   conditional - the field executes 0+ times, so a write there does NOT dominate a later use.
//           the UPDATE runs only after a completed iteration; a while / for TEST runs at least
//           once when the loop is reached, so it dominates like straight-line code. the do-while BODY
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
  // a do-while TEST runs only after its body completed normally - a `break` / `return` / `throw`
  // in the body skips it - so unlike a while test it is conditional
  DoWhileStatement: { body: { rerun: true, conditional: true }, test: { rerun: true, conditional: true } },
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
  // trailing arguments ride through to `compute` WITHOUT joining the key - for the path a
  // node-keyed walk needs, where the node already determines it
  return function (a, b, ...rest) {
    let inner = cache.get(a);
    if (!inner) cache.set(a, inner = new Map());
    if (inner.has(b)) return inner.get(b);
    const result = compute(a, b, ...rest);
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

// class body member PATHS through the container cache: the per-(body, name) position indexes
// remove the rescans, this removes the per-query path re-materialization of the body list itself
export function classBodyMemberPaths(classPath) {
  return cachedContainerPaths(classPath.get('body'), 'body');
}

// the slot of `parent` in which `child` evaluates at DEFINITION time - in the enclosing scope,
// with the outer `this`, outside every parameter scope the members open: a class's heritage, a
// decorator (of a class, a member or a parameter alike), a computed key. null for a slot deferred
// to a call or an instantiation (a body, a parameter default, a field value) and for every plain
// child. ONE primitive for every walk that has to step over such a slot: the `this`-anchor climb
// and the `this`-write scan of the class walks, and the binding climb from inside a decorator
export function definitionTimeSlotOf(parent, child) {
  if (!parent || !child) return null;
  if (parent.decorators?.includes(child)) return 'decorators';
  if (parent.superClass === child) return 'superClass';
  return parent.computed === true && parent.key === child ? 'key' : null;
}

// every definition-time slot PATH under a class: its heritage and decorators, each member's
// decorators and computed key, and the decorators of each method's parameters - the parts of a
// class that run where it is DEFINED. bodies, field values and parameter defaults stay out. the
// path-level enumeration of the predicate above, for a scan that walks those slots top-down
export function classDefinitionTimePaths(classPath) {
  const out = [];
  function slotPaths(p) {
    const { node } = p;
    if (!node) return;
    if (node.decorators?.length) out.push(...p.get('decorators'));
    if (node.superClass) out.push(p.get('superClass'));
    if (node.computed === true && node.key) out.push(p.get('key'));
  }
  slotPaths(classPath);
  for (const member of classBodyMemberPaths(classPath)) {
    slotPaths(member);
    // the parameter list sits on the member itself (babel) or on the function under `value` (estree)
    const fn = Array.isArray(member.node?.params) ? member
      : Array.isArray(member.node?.value?.params) ? member.get('value') : null;
    if (fn) for (const param of fn.get('params')) slotPaths(param);
  }
  return out;
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
    walkAstChildren(node, child => {
      parents.set(child, node);
      // both consumers abandon the climb at a nested var-scope boundary, so nothing under one is
      // ever reachable through this index - descending into it indexed every node once per
      // ENCLOSING owner instead of once. the boundary node itself stays mapped, so a spine that
      // ends at it still resolves
      if (!isVarScopeBoundary(child.type)) visit(child);
    });
  })(ownerNode);
  ownerParentIndexCache.set(ownerNode, parents);
  return parents;
}

// the cached index goes stale when an emitter swaps a subtree AFTER the first query built it: a
// claim re-visited on the attached clone then misses in the map, and a containment climb reads
// the miss as "not inside" - flipping a loop-rerun / guard verdict to the unsound pole (a pure
// fold of a loop-reassigned key rode exactly this). rebuild once on a miss before answering: a
// genuinely outside target misses in the fresh index too and keeps the honest answer, while a
// post-mutation subtree is re-indexed and located
function ownerParentIndexLocating(ownerNode, target) {
  const parents = ownerParentIndex(ownerNode);
  if (target === ownerNode || parents.has(target)) return parents;
  ownerParentIndexCache.delete(ownerNode);
  return ownerParentIndex(ownerNode);
}

// the first of `fields` on `parent` holding `child` (direct or as an array element), or null.
// the candidate list comes from the caller's own per-type table - scanning `Object.entries(parent)`
// allocated an entries array per spine step to find a key that could only ever be one of those few
function parentFieldOf(parent, child, fields) {
  for (const key of fields) {
    const value = parent[key];
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
  const parents = ownerParentIndexLocating(ownerNode, target);
  for (let child = target; child !== ownerNode;) {
    const parent = parents.get(child);
    if (!parent) return false;
    if (parent !== ownerNode && isVarScopeBoundary(parent.type)) return false;
    const rerunFields = LOOP_RERUN_FIELDS[parent.type];
    if (rerunFields && parentFieldOf(parent, child, rerunFields)) return true;
    child = parent;
  }
  return false;
});

// does the `var` declarator binding `name` sit anywhere a loop RE-RUNS - the body, and equally a
// for-x head's `left` slot (its pattern defaults / computed keys re-evaluate per iteration)? the
// wider set is the conservative one and what every caller needs; "body" alone would under-report
export function isVarDeclaratorInLoopRerun(path, name) {
  const owner = findNearestVarScopeOwner(path);
  const target = owner && cachedScopeVars(owner.node).get(name)?.[0];
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

// is `child` an EXPRESSION slot of `parent` that runs on some paths only - a loop update, a
// do-while test, a for-x head pattern, a `case` test, a branch arm? a placement climb refuses a
// write standing in one: the statement runs, the slot may not. the loop half reads the trait table
export function isConditionalExpressionSlot(parent, child) {
  if (parent?.type === 'SwitchCase') return !!child && parent.test === child;
  return !!child && !!CONDITIONAL_BRANCH_FIELDS[parent?.type]?.some(field => parent[field] === child);
}

// does the member/call chain contain an optional hop AT `node` or on its spine BELOW it (toward
// the chain root)? guards non-spine slot evaluation. both parser spellings covered: babel names
// every post-`?.` node Optional* with per-hop `optional` flags; estree keeps plain Member/Call
// with `optional: true` on the hop itself under a ChainExpression wrapper
function spineHasOptionalHop(node) {
  for (let cur = node; cur;) {
    if (cur.optional === true) return true;
    if (cur.type === 'MemberExpression' || cur.type === 'OptionalMemberExpression') cur = cur.object;
    else if (cur.type === 'CallExpression' || cur.type === 'OptionalCallExpression') cur = cur.callee;
    else break;
  }
  return false;
}

// ... and the EXPRESSION edges past the branch table: a non-spine slot of a member / call chain
// whose spine carries an optional hop runs only when the chain does not short-circuit (`a?.[WRITE]`,
// `host?.f(WRITE)`), and a decorator expression runs at class definition, off the statement's own
// path. ONE edge verdict for both climbs - the placement climb over paths and the guard collector
// over nodes - so a write reads as conditional the same way whichever asks
export function conditionalEvaluationEdge(parent, child) {
  if (isConditionalExpressionSlot(parent, child)) return true;
  const type = parent?.type;
  if (type === 'Decorator') return true;
  const isMemberOrCall = type === 'OptionalMemberExpression' || type === 'OptionalCallExpression'
    || type === 'MemberExpression' || type === 'CallExpression';
  if (!isMemberOrCall) return false;
  const spineSlot = parent.object === child || parent.callee === child;
  return !spineSlot && spineHasOptionalHop(parent);
}

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
// wrapper node) record the parent as the guard, object-valued ones the branch node itself; an
// expression edge that runs on some evaluations only (`conditionalEvaluationEdge` - a slot under
// an optional spine, a decorator) records the child standing in it
const collectVarGuardsToDeclarator = memoizeByNodePair((ownerNode, target) => {
  const parents = ownerParentIndexLocating(ownerNode, target);
  if (target !== ownerNode && !parents.has(target)) return null;
  const guards = [];
  for (let child = target; child !== ownerNode;) {
    const parent = parents.get(child);
    if (!parent) return null;
    if (parent !== ownerNode && isVarScopeBoundary(parent.type)) return null;
    const branchFields = CONDITIONAL_BRANCH_FIELDS[parent.type];
    const field = branchFields ? parentFieldOf(parent, child, branchFields) : null;
    if (field) guards.push(Array.isArray(parent[field]) ? parent : child);
    // ... and an expression edge that runs on some evaluations only guards the write the same way
    else if (conditionalEvaluationEdge(parent, child)) guards.push(child);
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

// the use's ancestor nodes up to (excluding) the owner. depends only on the pair, while the caller
// below asks once per (use, write) pair - rebuilding the whole spine set per write was the same
// quadratic the parent index above exists to remove
const usageAncestorNodes = memoizeByNodePair((ownerNode, usageNode, usagePath) => {
  const ancestors = new Set();
  for (let cur = usagePath.parentPath; cur && cur.node !== ownerNode; cur = cur.parentPath) {
    ancestors.add(cur.node);
  }
  return ancestors;
});

// the use must sit inside every conditional branch the declarator does, else the assignment can be
// skipped on a path that still reaches the use. an unconditional declarator (no branches) passes
function usageSitsUnderAllBranches(usagePath, ownerNode, guards) {
  if (!guards.length) return true;
  const ancestors = usageAncestorNodes(ownerNode, usagePath.node, usagePath);
  return guards.every(branch => ancestors.has(branch));
}

// `a` ends at or before `b` begins (textual order by source positions), with the two answers a
// parser that omits positions may get. WHICH answer is safe belongs to the QUESTION, not to the
// call site: spelled as an argument it was hardcoded per site, and the same order was asked three
// ways. a `var` hoists the declaration but not the assignment, so a use before the declarator reads
// `undefined`; symmetrically a reassignment AFTER the read cannot have changed the value read there
function precedesByPosition(a, b) {
  const aEnd = a?.end;
  const bStart = b?.start;
  return typeof aEnd === 'number' && typeof bStart === 'number' ? aEnd <= bStart : null;
}

// unordered counts as PRECEDING: the global-dominance check would over-bail otherwise
export function precedesOrUnordered(a, b) {
  return precedesByPosition(a, b) ?? true;
}

// ... and the gates that must PROVE the order (the usage-pure reachability bail, the outer-scope
// domination walk) read the other answer: unordered is not proof
export function provablyPrecedes(a, b) {
  return precedesByPosition(a, b) ?? false;
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
  if (guards !== null) return usageSitsUnderAllBranches(usagePath, owner.node, guards) && precedesOrUnordered(node, readNode);
  if (!climb) return false;
  for (let o = findNearestVarScopeOwner(owner.parentPath); o; o = findNearestVarScopeOwner(o.parentPath)) {
    const outer = collectVarGuardsToDeclarator(o.node, node);
    if (outer !== null) return outer.length === 0 && provablyPrecedes(node, owner.node);
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
  return collectVarGuardsToDeclarator(owner.node, node) !== null && provablyPrecedes(readNode, node);
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
export function noReassignmentReachesUsage({
  reassignmentNodes, usagePath, usageNode = null, bindingScopeNode = null,
}) {
  if (!usagePath) return false;
  if (!reassignmentNodes?.length) return true;
  const owner = findNearestVarScopeOwner(usagePath);
  if (!owner) return false;
  const readNode = usageNode ?? usagePath.node;
  if (nodeSitsInLoopRerunWithin(owner.node, readNode)) return false;
  // "textually after the read" proves nothing beyond ONE activation of that owner. when the owner
  // is re-invocable while the binding outlives it, the previous activation's write runs before the
  // next activation's read - the same exposure a loop back-edge creates, one scope level up. the
  // read-side deferral predicate is the shared one the reachable-value union already gates on
  if (bindingScopeNode && readRunsDeferredWithin(usagePath, bindingScopeNode)) return false;
  return reassignmentNodes.every(node => nodeFollowsUsageInScope({ node, readNode, owner }));
}

// the value a reassignment site INSTALLS (`installedWriteValue` of its `=` RHS), normalized across
// adapters: babel records the AssignmentExpression node directly; estree-toolkit records the target
// Identifier (the LHS), so locate the enclosing `name = <expr>` in `ownerNode` to read its right
// operand. null for a non-plain write (`name++` / `name += x`) whose value isn't a simple replacement
function reassignmentRhs(node, ownerNode) {
  const write = plainWriteOf(node, ownerNode);
  // only a target that IS the name flows the whole RHS: a pattern-contained identifier maps to
  // its assignment too, but its value is a slot - the pattern-aware variant below owns that shape
  if (write?.target?.type !== 'Identifier' || (node.type === 'Identifier' && write.target !== node)) return null;
  return installedWriteValue(write.value);
}

// the `{ target, value }` a PLAIN write spells: its `=` target through the wrappers a write may
// carry (`(a as any) = v`) and its raw RHS. a `var name = X` re-declaration is such a write too -
// the value channels read it exactly like `name = X`, which is what makes a redeclared key or
// receiver resolve at all. null for a derived write (`+=`, `++`) and for an identifier record
// that no plain assignment owns
function plainWriteOf(node, ownerNode) {
  if (node.type === 'AssignmentExpression') {
    return node.operator === '=' ? { target: unwrapRuntimeExpr(node.left), value: node.right } : null;
  }
  if (node.type === 'VariableDeclarator') {
    return node.init && ownerLevelDeclarator(node, ownerNode) ? { target: node.id, value: node.init } : null;
  }
  if (node.type !== 'Identifier') return null;
  const assignment = enclosingValueFlowAssignment(node, ownerNode);
  return assignment?.operator === '=' ? { target: unwrapRuntimeExpr(assignment.left), value: assignment.right } : null;
}

// does a `var` re-declaration sit at the OWNER's own statement level? its init is read by the
// binding's consumers in the declaration scope they were handed, so a re-declaration inside a
// nested block - whose init may read a shadow local to that block - keeps its value to itself
function ownerLevelDeclarator(declarator, ownerNode) {
  const parents = ownerParentIndexLocating(ownerNode, declarator);
  let statement = parents.get(parents.get(declarator));
  if (statement?.type === 'ExportNamedDeclaration') statement = parents.get(statement);
  const list = parents.get(statement);
  return list === ownerNode || (list?.type === 'BlockStatement' && parents.get(list) === ownerNode);
}

// the VALUE a plain write installs, off its RHS: the tail of an SE-carrying sequence (`w = (se(),
// Map)` installs `Map` - the prefix stays in the untouched write site, so peeling it costs nothing
// and loses nothing) and the tail of a chain assignment (`w = q = Map` installs `Map` into both
// names), alternated to a fixpoint (`w = (se(), q = Map)`). the ONE place every reader of a value
// spelled at a WRITE gets it from - a reassignment's RHS, a pattern slot's paired value or default,
// an arm of a branching write, a container slot's written value; a consumer peeling on its own is a
// fork of this (`peelChainRootValue` in the detect layer is the same alternation over a receiver,
// out of this layer's reach; `peelChainAssignmentDeep` alone bails on the effect a write
// legitimately carries)
export function installedWriteValue(rhs) {
  let node = rhs;
  for (;;) {
    const { tail } = peelNestedSequenceExpressions(node);
    if (tail?.type !== 'AssignmentExpression' || tail.operator !== '=') return tail;
    node = tail.right;
  }
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
  // pattern target first: the plain helper returns the WHOLE RHS for any `=` without inspecting
  // the target shape, so `[K] = ['of']` would flow the array literal instead of the slot value
  const write = plainWriteOf(node, ownerNode);
  if (write && isDestructurePattern(write.target)) {
    if (!bindingName) return null;
    const values = patternSlotValues(write.target, write.value, bindingName, ctx);
    return values.length === 1 && !patternSlotHasDefault(write.target, bindingName)
      && !patternSlotSpreadShifted(write.target, write.value, bindingName, ctx) ? values[0] : null;
  }
  return reassignmentRhs(node, ownerNode);
}

// does the binding `name` reach through a slot default (`[A = X]` / `{ A = X }`), at the top level
// OR nested (`{ k: { A } = X }`, `{ k: { A = X } }`)? a default makes the value ambiguous
// (default-or-runtime), so the reaching-definition recovery must bail rather than fold the default's
// value - folding it silently mis-narrows `name` when the runtime slot is present (a WRONG result)
export function patternSlotHasDefault(pattern, name) {
  // the default-context flag is the WALK's accumulator, not part of the question - it stays inside so
  // the exported contract cannot be handed a `true` that silently turns this into "binds it at all"
  return (function reached(node, underDefault) {
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
        case 'ArrayPattern': return node.elements.some(el => reached(el, underDefault));
        case 'ObjectPattern': return node.properties.some(prop => reached(
          prop.type === 'RestElement' || prop.type === 'SpreadElement' ? prop.argument : prop.value, underDefault));
        default: return false;
      }
    }
  })(pattern, false);
}

// the binding target under a pattern slot: a DEFAULT wraps it, and every walk that pairs slots
// against values peels the same way
export function patternSlotTarget(target) {
  return target?.type === 'AssignmentPattern' ? target.left : target;
}

// the key PATH from the pattern's root down to `name` - the slots a container read walks through
// (`{ a: { b: { groupBy: g } } }` reads `g` through `a`, then `b`, then `groupBy`). the whole path
// and not just its head: a nested container has no binding name of its own, so only the path can
// name the slot a write replaced. `null` where a slot on the way cannot be named - a computed
// spelling the key canon cannot fold, or a rest target, which takes every remaining slot. several
// paths where the pattern binds the name more than once
export function patternRootKeyPathsFor(pattern, name, ctx) {
  const paths = [];
  let unnameable = false;
  function leadsTo(node) {
    return !!node && patternBindsIdentifier(node, id => id.name === name);
  }
  function collectPaths(node, prefix) {
    if (node?.type === 'Identifier') {
      paths.push(prefix);
      return;
    }
    if (node?.type === 'AssignmentPattern') {
      collectPaths(node.left, prefix);
      return;
    }
    if (node?.type === 'ObjectPattern') {
      for (const prop of node.properties ?? []) {
        if (prop.type === 'RestElement' || prop.type === 'SpreadElement') {
          if (leadsTo(prop.argument)) unnameable = true;
          continue;
        }
        if (prop.type !== 'Property' && prop.type !== 'ObjectProperty') continue;
        if (!leadsTo(prop.value)) continue;
        const key = patternPropKey(prop, ctx, node);
        if (key === null) unnameable = true;
        else collectPaths(patternSlotTarget(prop.value), [...prefix, key]);
      }
      return;
    }
    if (node?.type === 'ArrayPattern') {
      (node.elements ?? []).forEach((element, index) => {
        if (!leadsTo(element)) return;
        if (element.type === 'RestElement') unnameable = true;
        else collectPaths(patternSlotTarget(element), [...prefix, String(index)]);
      });
    }
  }
  collectPaths(pattern, []);
  return unnameable ? null : paths;
}

// the caller-correct FALLBACK SLOT the probe rule stops at: a value that runs ONLY when nothing was
// passed - a parameter default and an inner destructure default, both spelled as an AssignmentPattern
// right. the slot's doctrine lives in the provider's AGENTS.md: a PLAIN undefinable receiver keeps the
// always-defined literal there, because the slot fires only on the omitted argument and reproducing the
// absent-host throw is not worth the output complexity. the climb ends at the function that OWNS the
// slot - a nav inside a nested function body runs when that function is called, not on that path
export function inCallerCorrectFallbackSlot(path) {
  for (let up = path?.parentPath, child = path; up?.node; child = up, up = up.parentPath) {
    const { type } = up.node;
    if (type === 'AssignmentPattern' && up.node.right === child.node) return true;
    if (FUNCTION_LIKE_NODE_TYPES.has(type) || type === 'Program') break;
  }
  return false;
}

// does the pattern bind `name` in ANY slot (identifier leaf, renamed value, rest, nested, with or
// without a default)? one spelling of that question, over the canonical binding-leaf walk - the
// default-guarded ask above keeps its own walk because it TRACKS default context, which the leaf
// walk deliberately does not carry
function patternBindsName(pattern, name) {
  return patternBindsIdentifier(pattern, id => id.name === name);
}

// the binding's own VariableDeclarator, across BOTH binding shapes the resolvers are handed: the
// usage adapters wrap the declarator on `.node`, while a raw parser binding carries only `.path`.
// exported because the value canon and the class walk are handed the same pair - a resolver reading
// one shape is blind exactly where the other sees
export function bindingDeclaratorNode(binding) {
  return binding?.node?.type === 'VariableDeclarator' ? binding.node : binding?.path?.node;
}

// the name a declarator binds, or null for a pattern / absent id. one accessor for every resolver
// that keys pattern-LHS pairing on it: the two written by hand covered DISJOINT binding shapes, so
// each was blind exactly where the other saw
function bindingDeclaratorName(binding) {
  const id = bindingDeclaratorNode(binding)?.id ?? binding?.identifier;
  return id?.type === 'Identifier' ? id.name : null;
}

// the name a binding binds, whatever the binding's shape: the parsers' own record first (babel
// carries the identifier, estree-toolkit the name), else the declarator's id - a pattern-bound
// or synthetic shape answers null there, and a consumer keying on it declines
export function bindingBoundName(binding) {
  return binding?.identifier?.name ?? binding?.name ?? bindingDeclaratorName(binding);
}

// the init a declarator ties to the NAME itself - null for a destructuring declarator (it binds
// the name to a SLOT of the init, not the init: following the whole init there smuggles the
// container - the wrong-value fold the binding-follow canon rejects) and for non-declarator /
// init-less bindings. every "binding -> its init" follow asks this accessor; a hand-spelled
// `binding.node?.init` skips the pattern gate and re-opens that fold
export function identifierDeclaratorInit(binding) {
  const node = bindingDeclaratorNode(binding);
  return node?.type === 'VariableDeclarator' && node.id?.type === 'Identifier' ? node.init ?? null : null;
}

// the pattern complement of `identifierDeclaratorInit`: the value a PATTERN declarator ties to
// `name`, through the canon slot pairing (`const [wrapper] = [[globalThis]]` holds `[globalThis]`).
// null unless the pairing is UNIQUE and its union COMPLETE: the union is an over-approximation
// (a pair the enumerator cannot read contributes NOTHING), so a several-value union, a slot
// DEFAULT (a lone resolved default wrongly reads as certain - the runtime may pair a value the
// enumerator could not see, `{ wrapper = [A] } = { ...src }`) and a spread-shifted slot all
// decline. `maybe` (inject-if-might classification only) lifts the completeness gates: a lone
// enumerable candidate may follow there, because a wrong guess over-injects - the safe
// direction - while pure precision substituting a value the runtime may not hold is not.
// `ctx` is the pairing's `{ scope, adapter, path, resolveKey }`, anchored at the DECLARATION's
// scope by the caller
function patternBoundAliasSlotInit(binding, name, ctx, { maybe = false } = {}) {
  const decl = bindingDeclaratorNode(binding);
  if (decl?.type !== 'VariableDeclarator' || decl.id?.type === 'Identifier' || !decl.init) return null;
  const values = patternSlotValues(decl.id, decl.init, name, ctx);
  if (values.length !== 1) return null;
  return maybe || (!patternSlotHasDefault(decl.id, name)
    && !patternSlotSpreadShifted(decl.id, decl.init, name, ctx)) ? values[0] : null;
}

// the lexical names a host between a write and its var-scope owner rebinds: a block body, a switch
// case, a catch parameter, a `let` / `const` loop head - the same canon the Annex-B walk reads them
// through. `var` hoists past every one of them and rebinds nothing here
function hostLexicalNames(host) {
  switch (host?.type) {
    case 'BlockStatement': return blockLexicalNames(host.body);
    case 'SwitchCase': return blockLexicalNames(host.consequent);
    case 'CatchClause': {
      const names = new Set();
      walkPatternIdentifiers(host.param, id => names.add(id.name));
      return names;
    }
    case 'ForStatement': return blockLexicalNames([host.init]);
    case 'ForOfStatement':
    case 'ForInStatement': return blockLexicalNames([host.left]);
    default: return null;
  }
}

// a write hosted in a nested lexical block reads its RHS THERE: a name that block (or one between it
// and the var-scope owner) declares shadows what the declarator's scope holds, and the consumers
// resolve the returned node in the declarator's scope - so such a write proves no value
// (`var h = src; { const src = {}; var h = src; }` holds the block's `src`, not the outer one)
function rhsReadsBlockShadow(ownerNode, writeNode, rhs) {
  const parents = ownerParentIndexLocating(ownerNode, writeNode);
  for (let cur = parents.get(writeNode); cur && cur !== ownerNode; cur = parents.get(cur)) {
    for (const name of hostLexicalNames(cur) ?? []) if (identifierReferencedInSubtree(rhs, name)) return true;
  }
  return false;
}

// a write standing in the TEST of a guard-shaped conditional (`(_r = X) == null || (_r = _r.k)
// == null ? void 0 : _r...` - the memo chain a `?.` lowering emits ahead of this plugin): the reads
// below it are guarded NATIVELY by a `?.` this pass no longer sees, and a value substituted for the
// memo there turns a live guard dead (`_r.self` read as the ponyfill un-guards the `.window` probe
// under it). pure resolves nothing off such a write - the sandwich boundary the e2e legs lock
function writeSitsInGuardTest(ownerNode, writeNode) {
  const parents = ownerParentIndexLocating(ownerNode, writeNode);
  for (let child = writeNode, parent = parents.get(child); parent && parent !== ownerNode;
    child = parent, parent = parents.get(child)) {
    if (parent.type === 'ConditionalExpression') return parent.test === child && !!definedBranchOfGuardConditional(parent);
  }
  return false;
}

// the ONE value node a reassigned binding holds at `usagePath`, or null when the value is
// flow-dependent: the textually-last before-use write when it runs unconditionally in the read's own
// var scope (and, for `requireSingleObservation`, nothing writes after the read), or the last
// dominating write above a closure that reads the binding. `plainWritesOnly` leaves pattern writes
// to the alias registry (see below). the caller resolves the returned node in the declarator's scope
export function reachingReassignmentValueNode({
  binding, usagePath, ctx = null, usageNode = null, requireSingleObservation = false, plainWritesOnly = false,
}) {
  if (!usagePath) return null;
  const owner = findNearestVarScopeOwner(usagePath);
  if (!owner) return null;
  // `usageNode` overrides the textual read position for a multi-hop alias hop (`const b = a` reads `a`
  // at the declarator, not at the eventual use of `b`): a write to `a` AFTER that read does not reach
  // the captured value, so it is excluded below and the live declarator-init resolves
  const readNode = usageNode ?? usagePath.node;
  if (nodeSitsInLoopRerunWithin(owner.node, readNode)) return null;
  const bindingName = bindingDeclaratorName(binding);
  const before = reassignmentNodesBeyondDeclarator(binding).filter(node => precedesOrUnordered(node, readNode));
  if (!before.length) return null;
  // SAME-SCOPE: every before-use write is a plain `name = <expr>` in the read's own var-scope. the
  // textually-last one overwrites every earlier write - it is the reaching definition only if it ALWAYS
  // runs (unconditional: no guards); a conditional last write leaves the value ambiguous
  if (before.every(node => reassignmentRhsForBinding(node, owner.node, bindingName, ctx) !== null
      && collectVarGuardsToDeclarator(owner.node, node) !== null)) {
    const last = before.reduce((a, b) => b.start > a.start ? b : a);
    if (collectVarGuardsToDeclarator(owner.node, last).length) return null;
    // `plainWritesOnly` (the bare-binding canon in pure): a pattern write (`({ Promise: M } =
    // globalThis)`) registers through the alias registry, whose guard channel both legs already
    // share - and the babel scope tracker no longer lists such a write once its own rewrite
    // replaced it, so a verdict read off the violations here would split the legs. the container
    // walk keeps reading pattern writes: it pairs them through its own slot canon on both legs
    if (plainWritesOnly && isDestructurePattern(plainWriteOf(last, owner.node)?.target)) return null;
    if (requireSingleObservation && writeSitsInGuardTest(owner.node, last)) return null;
    const rhs = reassignmentRhsForBinding(last, owner.node, bindingName, ctx);
    return rhs && !rhsReadsBlockShadow(owner.node, last, rhs) ? rhs : null;
  }
  // CLOSURE: the use sits in a nested closure, so the before-writes live in an enclosing scope. the
  // declarator-init (and earlier writes) are dead once an UNCONDITIONAL write completes before the
  // closure is even defined - the closure cannot observe them (`let K='of'; K='from'; ()=>Array[K]`).
  // the reaching value is the textually-last such dominating write. a non-dominating set (conditional /
  // closure-defined-before-write) yields none -> null, keeping the still-live init (over-inject-safe).
  // reassignment nodes are `AssignmentExpression`s here (babel + the estree adapter's let/var recompute),
  // so `reassignmentRhs` reads `.right` directly without the declarator's scope; a non-plain write -> null
  // a re-invoked closure observes a write that lands AFTER its definition between calls (`() => Array[K]`
  // with a later `K = 'of'`), so a single dominating value is not the UNIQUELY observed one. the pure
  // consumer (requireSingleObservation) must bail when any write lies textually after the captured read -
  // substituting one value would silently miscompile the other invocations. global stays over-inject-safe
  if (requireSingleObservation
    && reassignmentNodesBeyondDeclarator(binding).some(node => !precedesOrUnordered(node, readNode))) return null;
  const dominating = before.filter(node => nodeDominatesUsage({ node, usagePath, owner, climb: true, usageNode }) === true);
  if (!dominating.length) return null;
  const last = dominating.reduce((a, b) => b.start > a.start ? b : a);
  if (plainWritesOnly && isDestructurePattern(plainWriteOf(last, owner.node)?.target)) return null;
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

// a BRANCHING written value (`w = c ? A : B`, `w = A || B`) installs one of its ARM values -
// flatten each arm into the enumeration (a wider value set is the safe direction for every
// consumer, per the enumeration's own contract). each arm is read through the write-value canon
// (`installedWriteValue` - its sequence tail, its chain-assignment tail) the same way the direct
// RHS readers read theirs, and nested branching unfolds to a fixpoint under a step cap
function flattenBranchingValueNodes(nodes) {
  const out = [];
  const work = [...nodes];
  for (let step = 0; work.length && step < 64; step++) {
    const tail = installedWriteValue(work.pop());
    const slots = getFallbackBranchSlots(tail);
    if (slots) work.push(...slots.map(slot => tail[slot]));
    else out.push(tail);
  }
  return out;
}

function reassignmentValueEnumerationCore({ binding, usagePath, owner, name, ctx, usageNode }) {
  // `name` is a pure OVERRIDE for callers that already know the alias; the accessor covers both
  // binding shapes on its own, so pattern-LHS pairing no longer depends on the caller passing it
  const bindingName = name ?? bindingDeclaratorName(binding);
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
  // a read captured in a nested closure (its var-scope owner is a FUNCTION below the binding's
  // declaring scope) re-runs on every re-invocation, so an enclosing-scope write that lands AFTER
  // the closure is defined reaches a later read (`let K='from'; const f=()=>Array[K]; f(); K='of';
  // f()` dispatches Array.of on the 2nd call). that write is normally dropped as strictly-after,
  // just as a loop back-edge re-runs the body after its tail write. no method gate: a WIDER value set
  // is the safe direction everywhere - the union candidates it feeds are global-only by their own
  // early return, the mutation census over-records (more bails), and a type built from it is LESS
  // narrow, which is exactly what a bail-safe consumer wants
  const closureReenters = readRunsDeferredWithin(usagePath, binding.scope?.block ?? binding.scope?.path?.node);
  const out = [];
  let complete = true;
  // a binding a for-x HEAD declares takes its values from the iterated elements: that head is the
  // declaration's own value source, not a reassignment - so it is read here, ahead of the writes,
  // and an iterable the head cannot enumerate leaves the set open
  const own = bindingDeclaratorNode(binding);
  const ownHead = own ? enclosingForXStatement(own, violationSearchRoot) : null;
  if (ownHead) {
    const values = forXHeadValueNodes(ownHead, bindingName, ctx);
    if (!values.length) complete = false;
    out.push(...values);
  }
  for (const node of reassignmentNodesBeyondDeclarator(binding)) {
    if (!useInLoop && !closureReenters && provablyPrecedes(readNode, node)) continue;
    const values = flattenBranchingValueNodes(reassignmentValueNodesAt(node, violationSearchRoot, bindingName, ctx));
    if (!values.length) complete = false;
    out.push(...values);
  }
  return { nodes: out, complete };
}

// assignment operators that flow the RHS into the LHS binding as a POSSIBLE value: plain `=` plus
// the logical forms (`A ||= Map` makes Map reachable - whether that write fires is the conditional
// question above, not this one). compound arithmetic (`+=`) and updates produce derived values, not
// replacements, and stay out. every reader that follows a write to the value it stores asks this
// set: the reassignment walks here, the mutation census for what a slot ends up holding, and the
// alias follow over the shape a `?.`-lowering transpiler emits (`(_n ??= globalThis) == null ? ...`)
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
export function peelArrayWrapBindingLayers(id, init, name, ctx = null) {
  while (id?.type === 'ArrayPattern' && init?.type === 'ArrayExpression') {
    const idx = id.elements.findIndex(element => element && arrayWrapSlotBindsName(element, name, ctx));
    const paired = pairedArrayWrapInitElement(init.elements, idx);
    if (!paired) return null;
    id = id.elements[idx].type === 'AssignmentPattern' ? id.elements[idx].left : id.elements[idx];
    init = paired;
  }
  return { id, init };
}

// the value a body yields when NOTHING else in it can be observed: the single return's expression,
// and only where that expression and every statement standing before it are effect-free. the weaker
// `singleReturnBodyExpression` answers which expression is RETURNED and lets a caller that keeps the
// body running accept statements beside it; a caller that DROPS the body (a getter whose literal the
// walk consumes, a member read the plan resolves statically) owes this one. the type layer asks the
// same question of PATHS (`resolveBodyReturnValue`), the split every walk here lives with
export function pureReturnBodyValue(body) {
  const read = singleReturnBodyExpression(body);
  if (!read || mayHaveSideEffects(read)) return null;
  const statements = body?.type === 'BlockStatement' ? body.body ?? [] : [];
  return statements.every(stmt => stmt.type === 'ReturnStatement' || !mayHaveSideEffects(stmt.expression))
    ? read : null;
}

// the expression an object-literal property hands a reader, or null when none does: a data property
// gives its value, and a GETTER gives what its body returns - but only a body that is ONE PURE
// RETURN, because the consumers here CONSUME the literal (the level it stands on is dropped), so a
// body with anything to observe would stop running. a setter-won key answers `undefined` and a
// method shorthand holds a function the reader would read THROUGH - neither names a value. babel
// spells accessors and method shorthands as `ObjectMethod`, ESTree as a `Property` carrying `kind` /
// `method`: both reach this one reading, or two walks answer differently about one source
export function objectPropertyReadValue(prop) {
  const kind = prop?.type === 'ObjectMethod' ? prop.kind : prop?.method ? 'method' : prop?.kind;
  if (!prop || kind === 'set' || kind === 'method') return null;
  if (kind !== 'get') return prop.value ?? null;
  return pureReturnBodyValue(prop.type === 'ObjectMethod' ? prop.body : prop.value?.body);
}

// find the LAST own property (`Property` / `ObjectProperty`, plus babel's `ObjectMethod`) satisfying `matches` in an
// ObjectExpression's `properties` array, scanning backward so duplicate keys resolve last-wins.
// returns null when a SpreadElement sits AFTER a candidate (it could inject / override the key, so
// the literal value is not authoritative) or when nothing matches. single source for the "object
// key value, bail on an overriding spread" rule shared by patternSlotValues / resolveNestedReceiver
// / walkStaticReceiverTerminal (the node-side mirror of findObjectLiteralKey's spread bail)
export function findObjectKeyBeforeSpread(properties, matches) {
  for (let i = (properties?.length ?? 0) - 1; i >= 0; i--) {
    const prop = properties[i];
    if (prop?.type === 'SpreadElement') return null;
    // babel spells an accessor / method shorthand as `ObjectMethod` where ESTree keeps a `Property`
    // carrying `kind` / `method`: skipping the babel spelling here answered a DIFFERENT key per
    // parser for the same source. both reach `matches`, which is where a caller states what it takes
    if ((prop?.type === 'Property' || prop?.type === 'ObjectProperty' || prop?.type === 'ObjectMethod')
      && matches(prop)) return prop;
  }
  return null;
}

// the continuation for a binding hop whose flat resolve is blocked by a DOMINATING reassignment:
// the reaching value (the bare binding-alias canon, lifted to container hops) keeps the walk
// alive; null keeps the flat bail (an indeterminable value, or a method that resolves neither).
// usage-global takes the enumerable reaching value; usage-pure substitutes on proof, so it takes
// it only when that write is the ONLY value the read can observe (`requireSingleObservation`: an
// unconditional dominating write with nothing written after the read - `let w = [Array]; w =
// [Object]; const [{ fromEntries }] = w` holds Object and nothing else). a BRANCHING reaching
// value (`w = c ? {...} : {...}`) is no SINGLE primary - null routes the hop to the union
// continuation, whose enumeration flattens the arms. the hop's `ctx` is the pairing's context
// (its `resolveKey`, when the detect layer injected one, reads computed keys)
export function reachingContainerValueNode(binding, hop) {
  const { adapter, path } = hop.ctx;
  const { method } = adapter;
  if (method !== 'usage-global' && method !== 'usage-pure') return null;
  const reaching = reachingReassignmentValueNode({
    binding, usagePath: path, ctx: hop.ctx, usageNode: hop.readNode, requireSingleObservation: method === 'usage-pure',
  });
  if (!reaching) return null;
  return getFallbackBranchSlots(peelNestedSequenceExpressions(reaching).tail) ? null : reaching;
}

// did this container ESCAPE - reach a call, a tag, an export, anything that can rewrite the members
// this file cannot see? every follow of a const-bound container answers to it before trusting the
// literal that binding holds: what the escape took may no longer hold what the declaration spelled,
// and a walk that binds a polyfill to such a slot owes the proof the key fold already owes. asked of
// the escape census the usage pass builds - a re-derivation here would walk the same alias hops.
// deliberately NOT the written-slot record: a write the census can name is judged by the follow's
// own flow analysis, which anchors every level at the capture above it. usage-pure alone bails -
// over-injection is the safe side of the other flavors
export function aliasEscaped(aliasNode, adapter, path) {
  if (aliasNode?.type !== 'Identifier' || adapter?.method !== 'usage-pure' || !path) return false;
  const program = rootProgramOf(path);
  // the census is FILLED by the usage pass (`escapedCtorReferencesReducer`); this module only
  // declares the index it writes into
  // eslint-disable-next-line sonarjs/no-empty-collection -- filled by the usage pass, not here
  return !!program && !!ESCAPED_CONTAINER_NAMES.get(program)?.has(aliasNode.name);
}

// has a MEMBER write landed on the slot this level reads off a dereferenced alias? the escape gate's
// twin for a write the census CAN name (`const c = { k: Object }; c.k = Map`): the follow's own flow
// analysis tracks the binding, never its members, so the level that descends a named key asks here.
// usage-pure alone bails, for the reason the container channel gives - a write anywhere in the file
// may reach the read, while the other flavors over-inject and stay safe
export function aliasSlotWritten(aliasNode, key, adapter) {
  if (aliasNode?.type !== 'Identifier' || adapter?.method !== 'usage-pure' || key === null || key === undefined) return false;
  // the record keys slots by their STRING spelling, and a numeric key names one like any other
  return !!adapter.isWrittenContainerSlot?.(aliasNode.name, [String(key)]);
}

// the ONE const-alias follow: an Identifier through its binding's init at each hop, peeling parens /
// chain / TS / chain-assignment between hops. takes the hop standing on the identifier and returns
// the hop standing on the terminal node where the chain stops (non-Identifier, unbound name,
// reassigned binding, or no init). `adapter.hasBinding(scope, name, path)` gates on user-declared
// bindings so built-ins like `Array` exit the loop with the hop on `Array`. the returned
// `ctx.scope` follows the binding's own scope (closure-captured outer bindings); the returned
// `readNode` is the declarator the chain last dereferenced through - the value captured into a
// wrapper is fixed at that point, so a downstream leaf resolution anchors its reassignment check
// there (not the destructure host) - and stays the incoming one when nothing dereferenced (an
// inline literal is captured where the hop was read). a PATTERN-bound alias (`const [wrapper] =
// [[globalThis]]`) follows its slot's unique, spread-complete pairing; `maybe` (inject-if-might
// classification only) lets that pairing lean on a spread-shifted slot's lone candidate. the hop's
// `seen` guards cycles - seeded into the pairing's context too, because a cycle spelled ACROSS two
// pattern declarators (`const [a] = [b]; const [b] = [a]`) re-enters this walk through
// `patternSlotValues` without spinning any single loop. `onReassignedHop(binding, name, hopAt)`
// fires for a REASSIGNED hop the walk stands on - a live init the write did not kill, or a blocked
// hop no reaching value continues - so a usage-global caller can union the written values beside
// the primary (the container walk's `collectReassignedHopUnion`; pure callers pass none)
export function followConstIdentifierInit(hop, { maybe = false, onReassignedHop = null } = {}) {
  const { adapter, path } = hop.ctx;
  let { scope } = hop.ctx;
  let cur = hop.node;
  const visited = new Set(hop.seen);
  // read site of the current hop - the host use for the first alias (a null `readNode`: the
  // dominance checks read the use path there), then each prior hop's declarator (`const a = b`
  // reads `b` there). a reassignment of an intermediate hop AFTER its read can't change the
  // captured value, so the dominance check uses the read NODE (the adapter surfaces the declarator
  // at `binding.node`), not the host use - else `const a = b; b = 0; { from } = a` wrongly bails `b`
  let { readNode = null } = hop;
  while (cur?.type === 'Identifier' && adapter.hasBinding(scope, cur.name, path) && !visited.has(cur.name)) {
    visited.add(cur.name);
    const binding = adapter.getBinding(scope, cur.name, path);
    // method-aware reassignment bail: usage-global keeps following the const-init chain when the
    // reassignment does not dominate the use, usage-pure when no write reaches the read;
    // narrowing keeps the flat bail
    if (!binding) break;
    const hopAt = { ...hop, node: cur, readNode, ctx: { ...hop.ctx, scope } };
    if (reassignmentBlocksGlobalResolve({ binding, adapter, path, usageNode: readNode })) {
      // a dominating reassignment replaced the hop's value - keep following the reaching value
      // (enumerable for global, the single observable one for pure), like the container walk; the
      // flat break stays otherwise, the written values handed to the union. the value was READ
      // at its write site, so the next hop's proofs anchor there
      const reaching = reachingContainerValueNode(binding, hopAt);
      if (!reaching) {
        onReassignedHop?.(binding, cur.name, hopAt);
        break;
      }
      cur = unwrapExpressionChain(reaching);
      scope = aliasDeclScope(binding, scope);
      readNode = reaching;
      continue;
    }
    onReassignedHop?.(binding, cur.name, hopAt);
    // a pattern declarator binds the name to a SLOT of the init, not the init itself: the canon
    // pairing follows only a unique slot value (`const [wrapper] = [[globalThis]]` holds
    // `[[globalThis]]`'s element), and only `maybe` may lean on a spread-shifted lone candidate
    const initNode = identifierDeclaratorInit(binding)
      ?? patternBoundAliasSlotInit(binding, cur.name, { ...hop.ctx, scope, seen: visited }, { maybe });
    if (!initNode) break;
    cur = unwrapExpressionChain(peelChainAssignmentDeep(initNode));
    scope = aliasDeclScope(binding, scope);
    readNode = (binding.path?.node ?? binding.node) ?? readNode;
  }
  // `ctx.scope` returns ADVANCED: the terminal node was spelled at the last followed binding's own
  // declaration - a leaf resolution downstream must anchor there, not at the destructure host
  return { ...hop, node: cur, readNode, ctx: { ...hop.ctx, scope } };
}

// the LITERAL view of the follow above: a const-bound identifier to its literal init (`const arr =
// [Map]` -> the ArrayExpression, `const src = { from: f }` -> the ObjectExpression) so a
// variable-sourced literal resolves like an inline one; a chain ending anywhere else passes the
// ORIGINAL node through unchanged. the read anchors at the identifier itself - where an alias
// inside a literal is spelled is where its value was captured. `ctx` is the pairing's `{ scope,
// adapter, path, resolveKey?, seen? }` (`seen` rides in from an enclosing follow, see above); a
// ctx-less caller keeps the node
export function followConstLiteralAlias(node, ctx) {
  if (!ctx?.adapter || node?.type !== 'Identifier') return node;
  const followed = followConstIdentifierInit({ node, readNode: node, seen: ctx.seen, ctx });
  const value = followed.node;
  return value?.type === 'ArrayExpression' || value?.type === 'ObjectExpression' ? value : node;
}

// the canonical ARRAY-slot read: `container[key]` for a literal container, with the same guards
// both destructure sides apply - a spread makes every position PAST it untrustworthy (a slot
// strictly before it still pairs exactly, the positional pairing's own rule), a hole / OOB reads
// nothing. `key` folds through the canonical index, so '0' and 0 name the same slot
export function arrayLiteralSlotValue(node, key) {
  if (node?.type !== 'ArrayExpression') return null;
  const index = key === null || key === undefined ? null : canonicalArrayIndex(key);
  if (index === null || spreadAtOrBefore(node.elements, index)) return null;
  return node.elements[index] ?? null;
}

// `ctx` (optional `{ scope, adapter, path, resolveKey }`) makes the pairing binding-aware: it
// follows a const-identifier rhs to its literal init and resolves computed keys through the read-
// side canon. ctx-less callers keep the node-only behaviour (literal rhs, static-name keys)
export function patternSlotValues(pattern, rhs, name, ctx) {
  const out = [];
  // a const-identifier rhs bound to a literal (`const arr = [Map]; [A] = arr`) - follow it so the
  // pairing sees the underlying array / object, like the direct-literal form. the EFFECTIVE value
  // peel comes first: a paren (an oxc NODE), a TS cast or a sequence tail all hand the same
  // runtime value, and judging the raw spelling split the legs on `([[globalThis]])`
  rhs = followConstLiteralAlias(unwrapExpressionChain(rhs), ctx);
  function propKey(prop) {
    return patternPropKey(prop, ctx, pattern);
  }
  // a nested pattern slot (`[[M]]` / `{ x: [M] }`) pairs against the slot's RHS positionally /
  // by key - recurse so a binding bound through arbitrary nesting still surfaces its value union;
  // the slot's own default is an alternative RHS the nested bindings may pair against instead
  function descend(slot, element, pairedRhs) {
    if (!isDestructurePattern(slot)) return false;
    if (pairedRhs) out.push(...patternSlotValues(slot, pairedRhs, name, ctx));
    if (element.type === 'AssignmentPattern') out.push(...patternSlotValues(slot, element.right, name, ctx));
    return true;
  }
  if (pattern?.type === 'ArrayPattern') {
    for (let i = 0; i < pattern.elements.length; i++) {
      const element = pattern.elements[i];
      const slot = patternSlotTarget(element);
      // a spread at or before slot i shifts every later position by the spread's runtime length,
      // so `rhs.elements[i]` is no longer THE value that lands in slot i. under the value-UNION
      // contract every static element from the first spread on is still a POSSIBLE slot value
      // (a zero-length spread pairs i to the next static, a longer one to the spread's own items),
      // so enumerate them all; the spread's items stay unenumerable, which
      // `patternSlotSpreadShifted` reports to consumers that need the union to be COMPLETE
      const candidates = rhs?.type === 'ArrayExpression' ? arrayWrapSlotValueCandidates(rhs.elements, i) : [];
      if (isDestructurePattern(slot)) {
        for (const cand of candidates) out.push(...patternSlotValues(slot, cand, name, ctx));
        if (element.type === 'AssignmentPattern') out.push(...patternSlotValues(slot, element.right, name, ctx));
        continue;
      }
      if (slot?.type !== 'Identifier' || slot.name !== name) continue;
      // a slot's paired value and its default are values spelled at a write - the write-value
      // canon reads them (`[k] = [j = "from"]` installs `"from"`)
      if (element.type === 'AssignmentPattern') out.push(installedWriteValue(element.right));
      out.push(...candidates.map(installedWriteValue));
    }
  } else if (pattern?.type === 'ObjectPattern') {
    for (const prop of pattern.properties) {
      if (prop.type !== 'Property' && prop.type !== 'ObjectProperty') continue;
      const slot = patternSlotTarget(prop.value);
      const key = propKey(prop);
      // last matching key wins, but a trailing spread could override it -> bail (canonical helper)
      // an object-pattern key can spell a canonical ARRAY index (`({ 0: w } = [v])` reads
      // property '0' off the array exactly as the language does) - the same cross-form read
      // the nested-receiver walk performs, guarded the same way
      const paired = key !== null
        ? rhs?.type === 'ObjectExpression'
          ? findObjectKeyBeforeSpread(rhs.properties, rp => propKey(rp) === key)?.value ?? null
          : arrayLiteralSlotValue(rhs, key)
        : null;
      if (descend(slot, prop.value, paired)) continue;
      if (slot?.type !== 'Identifier' || slot.name !== name) continue;
      if (prop.value.type === 'AssignmentPattern') out.push(installedWriteValue(prop.value.right));
      if (paired) out.push(installedWriteValue(paired));
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
// certain - the maybe-union stays sound for inject-if-might. an OBJECT pattern shifts nothing by
// itself (an overriding trailing spread already pairs nothing there), but it must still descend
// into its slots: a shifted array sits just as well under a key (`{ x: [, A] } = { x: [...xs, V] }`).
// mirrors `patternSlotHasDefault` / `patternSlotValues`, which walk both pattern kinds
export function patternSlotSpreadShifted(pattern, rhs, name, ctx = null) {
  // the SAME head normalization as `patternSlotValues`, or the two answer about DIFFERENT nodes:
  // values enumerated through a followed / peeled rhs with completeness judged on the raw spelling
  // would read a lone candidate as certain while an alias or a paren hides the shift
  rhs = followConstLiteralAlias(unwrapExpressionChain(rhs), ctx);
  if (pattern?.type === 'ObjectPattern') {
    for (const prop of pattern.properties) {
      if (prop.type !== 'Property' && prop.type !== 'ObjectProperty') continue;
      if (!patternBindsName(prop.value, name)) continue;
      const slot = prop.value.type === 'AssignmentPattern' ? prop.value.left : prop.value;
      // the SAME key canon the value pairing uses - reading the key any less precisely here would
      // let a computed key (`{ [k]: [, A] }`) pair a value the completeness check never inspects
      const key = patternPropKey(prop, ctx, pattern);
      // last matching key wins, but a trailing spread could override it -> pairs nothing (canon)
      const paired = key !== null && rhs?.type === 'ObjectExpression'
        ? findObjectKeyBeforeSpread(rhs.properties, rp => patternPropKey(rp, ctx, pattern) === key)?.value ?? null : null;
      if (patternSlotSpreadShifted(slot, paired, name, ctx)) return true;
      if (prop.value.type === 'AssignmentPattern'
        && patternSlotSpreadShifted(slot, prop.value.right, name, ctx)) return true;
    }
    return false;
  }
  if (pattern?.type !== 'ArrayPattern') return false;
  for (let i = 0; i < pattern.elements.length; i++) {
    const element = pattern.elements[i];
    if (!element || !patternBindsName(element, name)) continue;
    if (rhs?.type === 'ArrayExpression' && spreadAtOrBefore(rhs.elements, i)) return true;
    const slot = element.type === 'AssignmentPattern' ? element.left : element;
    const paired = rhs?.type === 'ArrayExpression' ? rhs.elements[i] : null;
    if (patternSlotSpreadShifted(slot, paired, name, ctx)) return true;
    if (element.type === 'AssignmentPattern'
      && patternSlotSpreadShifted(slot, element.right, name, ctx)) return true;
  }
  return false;
}

// resolve a destructuring property's KEY. a computed key (`{ [k]: A }`) resolves through the
// read-side key canon when a ctx is supplied; the binding-blind static-name fallback covers
// literal keys for ctx-less callers. the key EVALUATES at the destructure site - anchor the
// canon's reaching-value analysis on the PATTERN (source positions survive rewrites), or a key
// reassigned AFTER the capture would resolve to its post-capture value: a wrong-value pairing.
// single source shared by the value pairing and the completeness check, which must agree on
// which slot a name pairs through
function patternPropKey(prop, ctx, anchorPattern) {
  return ctx?.resolveKey
    ? ctx.resolveKey({
      node: prop.key, computed: prop.computed, scope: ctx.scope, adapter: ctx.adapter,
      path: ctx.path, usageNode: ctx.usageNode ?? anchorPattern,
    })
    : propertyKeyName(prop);
}

// every POSSIBLE value a reassignment site flows into the binding, by what the site IS: a
// value-flow assignment's RHS for a plain Identifier target and its paired slot values (incl.
// defaults) for a pattern one, the iterated elements of a for-x head, and the init of a `var
// name = X` re-declaration standing at the owner's own statement level. a site whose value the
// enumeration cannot read contributes nothing and leaves the set open - its own `complete` flag
function reassignmentValueNodesAt(node, ownerNode, bindingName, ctx) {
  if (node.type === 'AssignmentExpression') {
    if (!VALUE_FLOW_ASSIGN_OPS.has(node.operator)) return [];
    // the assignment flows its RHS TAIL (a sequence yields its last operand - the for-of head
    // peel below and the reaching canon already agree on this value view); the target is read
    // through its wrappers, as the scan that recorded the write read it
    const target = unwrapRuntimeExpr(node.left);
    if (target?.type === 'Identifier') return [peelNestedSequenceExpressions(node.right).tail];
    return bindingName ? patternSlotValues(target, node.right, bindingName, ctx) : [];
  }
  // a for-x HEAD rebinds the alias each iteration; parsers record it unevenly (babel: the
  // ForXStatement or the init-less head declarator; estree: the LHS Identifier or nothing).
  // a for-OF over an ARRAY LITERAL flows each element as a possible value; for-in keys and
  // opaque / spread-bearing iterables enumerate nothing (the write still poisons cleanliness
  // through the canonical write scan - only the VALUE union has nothing to add)
  if (FOR_X_STATEMENT_TYPES.has(node.type)) return forXHeadValueNodes(node, bindingName, ctx);
  if (node.type === 'VariableDeclarator') {
    // a `var name = X` re-declaration flows X exactly as `name = X` does - from the owner's own
    // statement level, where its init reads the scope the consumers resolve in; an init-less
    // declarator is a for-x head's (its per-iteration rebind) or a valueless twin
    if (node.init) {
      if (!ownerLevelDeclarator(node, ownerNode)) return [];
      if (node.id?.type === 'Identifier') return [peelNestedSequenceExpressions(node.init).tail];
      return bindingName ? patternSlotValues(node.id, node.init, bindingName, ctx) : [];
    }
    const forX = enclosingForXStatement(node, ownerNode);
    return forX ? forXHeadValueNodes(forX, bindingName, ctx) : [];
  }
  if (node.type !== 'Identifier') return [];
  const assignment = enclosingValueFlowAssignment(node, ownerNode);
  if (assignment) {
    const target = unwrapRuntimeExpr(assignment.left);
    if (target === node) return [peelNestedSequenceExpressions(assignment.right).tail];
    return patternSlotValues(target, assignment.right, node.name, ctx);
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
  if (isDestructurePattern(left) && bindingName) {
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
      // keyed by the target through its wrappers - the identity the write scan records
      const target = unwrapRuntimeExpr(n.left);
      index.assignment.set(target, n);
      if (isDestructurePattern(target)) {
        walkPatternIdentifiers(target, id => index.assignment.set(id, n));
      }
    } else if (FOR_X_STATEMENT_TYPES.has(n.type) && n.left) {
      index.forX.set(n.left, n);
      if (n.left.type === 'VariableDeclaration') {
        for (const d of n.left.declarations ?? []) {
          index.forX.set(d, n);
          if (d.id) index.forX.set(d.id, n);
        }
      } else if (isDestructurePattern(n.left)) {
        walkPatternIdentifiers(n.left, id => index.forX.set(id, n));
      }
    }
    walkAstChildren(n, visit);
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

// the `var name = X` re-declaration NODES that can reach the use past the type-resolver `binding`'s
// declarator: the ones textually BETWEEN the two for a straight-line read, every other one for a read
// from a function nested in the var's owner. estree-toolkit block-scopes a `var`, so `scope.getBinding` may surface a
// declarator whose init was overwritten by one of these (it records none as a constantViolation;
// babel hoists correctly and records them all). a non-empty result means the declarator init no
// longer describes the receiver at the use. shared by the staleness predicate and the reaching-redecl
// narrow so both bound the gap identically; only augments the estree var-hoist gap (babel: complete)
export function staleVarRedeclNodes(binding, usagePath, name) {
  const declStart = binding?.path?.node?.start;
  const useStart = usagePath?.node?.start;
  if (typeof declStart !== 'number' || typeof useStart !== 'number') return [];
  const found = findVarOwnerDeclaring(usagePath, name);
  if (!found) return [];
  // a read from a function NESTED inside the var's owner runs at a time position cannot order:
  // every other declarator of the var may have run by then, wherever it stands - the tracker that
  // hoists records each as a write of the one binding and its reader declines the same way
  // (`var a = [1]; function g() { a.at(0) } { var a = 'x' }` reads the string)
  const closureRead = findNearestVarScopeOwner(usagePath)?.node !== found.owner.node;
  return varRedeclNodes(found.owner, name, declStart)
    .filter(node => closureRead || (node.start > declStart && node.start < useStart));
}

// every `var name = X` re-declaration NODE of the owner other than the declaration at `declStart`,
// wherever it stands: re-DECLARATIONS only, as named - an assignment already reaches every consumer
// through the binding's (canonically merged) violations. the position-free set, for the readers
// that ask whether a binding CAN hold another value at all (a hoisted function redeclared as a
// `var` somewhere in its owner is no longer just that function)
function varRedeclNodes(owner, name, declStart) {
  return collectScopeReassignmentNodes(owner, name)
    .map(violationNode)
    .filter(node => node.type === 'VariableDeclarator' && typeof node.start === 'number' && node.start !== declStart);
}

// can a `var name = X` re-declaration reach `usagePath` past `binding`'s declarator (between the two, or
// anywhere in the owner for a read from a nested function)?
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

// --- Hop descriptor ---

// the HOP every alias / callee / wrapper walk of the value canon carries in and hands back - one
// literal, `{ node, readNode, seen, ctx }`, for all of them: `node` is the value the walk stands
// on; `readNode` the node whose position anchors the dominance and span disciplines - null is the
// use itself (`ctx.path.node`), then each followed declarator (a write after a read cannot change
// what the read captured); `seen` the advanced cycle-guard set (a walk forks its caller's set,
// never mutates it); `ctx` the alias context `{ scope, adapter, path }` the value resolves in,
// its `scope` advanced to each followed binding's own declaration scope, its `adapter` and
// `path` (the use) never - plus, where the detect layer injects it, the `resolveKey` canon the
// pattern pairing reads computed keys with (this layer cannot import it without a cycle).
// `ctx` is what a value-canon consumer takes as its `aliasCtx`; the hop
// itself is never spread into one - its `node` / `seen` / `readNode` would land on the
// consumer's own parameters. a walk option (`maybe`, `rejectConditional`, a method filter) is
// not hop state and rides a separate options argument

// the positional anchor of a use: the node's own start, else the nearest POSITIONED ancestor's.
// a subtree an emitter re-emitted carries clones with no spans, and a name-keyed positional
// lookup asked with `null` there is refused outright (the span discipline cannot run) - losing
// the fold on our own rebuilt spans. an ancestor's start still sits inside every scope span that
// contains the use, so the span discipline serves the same record; the order proofs only get an
// EARLIER anchor, which declines more, never less
export function useAnchorStart(path) {
  for (let p = path; p; p = p.parentPath) {
    if (typeof p.node?.start === 'number') return p.node.start;
  }
  return null;
}

// the positional anchor of a hop: the value node's own start, else the use path's nearest
// positioned ancestor - the ONE derivation of the number the injector's name-keyed view
// (`getBindingInfo`) is asked with
export function hopAnchorStart({ node = null, ctx = null }) {
  return node?.start ?? useAnchorStart(ctx?.path);
}

// the canonical write set for a binding whose scope tracker misreports it - babel attributes a
// switch-discriminant write of a case-shadowed name to the INNER binding, estree-toolkit misses
// nested-block `var` redeclarations and cross-boundary `let` writes and records namespace-twin
// phantoms. recompute from the AST by declaration kind, then strip the valueless-redeclaration
// self-records, so both adapters hand the resolver one list for identical source; a path-less
// lookup (no use anchor) and a kind outside the recompute keep the tracker's raw list
export function recomputedBindingWrites({ kind, bindingPath, usePath, name, fallback }) {
  return withoutValuelessDeclarationViolations(!usePath ? fallback
    : kind === 'var' ? collectFunctionScopeVarReassignments(usePath, name)
      : kind === 'let' || kind === 'const' ? collectScopeLetReassignments(bindingPath, name)
        : fallback);
}

export const IMPORT_SPECIFIER_TYPES = new Set([
  'ImportSpecifier',
  'ImportDefaultSpecifier',
  'ImportNamespaceSpecifier',
]);

// the type-only-ness of an import binding is spelled on EITHER side, and the two spellings are not
// exclusive: `import type { X }` marks the declaration while the specifier keeps its own kind
// `'value'`, so a plain `??` chain stops at that 'value' and reads the binding as a runtime import.
// the declaration side is therefore asked FIRST when it carries the type-only mark, and only then
// does the ordinary node-then-parent order apply. ONE home for that rule - the predicate
// `importBindingIsTypeOnly` below answers through this, so the two cannot drift
function importBindingKind(bindingNode, bindingParent) {
  if (isTypeOnlyImportKind(bindingParent?.importKind)) return bindingParent.importKind;
  return bindingNode?.importKind ?? bindingParent?.importKind ?? null;
}

// the import-binding fields of the adapter contract, off the binding's declaration slot:
// `importSource` feeds the provider's symbol-import recognition, and `importKind` is the
// EFFECTIVE kind - `import { type X }` carries it on the specifier, `import type X` on the
// declaration - so the erasure canon reads one field covering both spellings.
// `shadowCtx` ({ adapter, scope, path }) carries the require-source canon's shadow discipline
// into the require arm: a `var require` hoisted anywhere in scope makes the call the USER's
// function, so the binding carries NO module source - recognised by NAME alone, a shadowed
// require minted an importSource every consumer then trusted (a pure fold over an opaque value)
export function importBindingView(bindingNode, bindingParent, shadowCtx = null) {
  const isImportBinding = IMPORT_SPECIFIER_TYPES.has(bindingNode?.type);
  // the require-style twin (`var _x = require('...')`) is its own flag: consumers that mean
  // "an ES import specifier" keep their gate, the polyfill-hint gate accepts both spellings
  const requireSource = !isImportBinding && bindingNode?.type === 'VariableDeclarator'
    ? requireCallSource(bindingNode.init, shadowCtx ?? {}) : null;
  const isRequireBinding = requireSource !== null;
  return {
    isImportBinding,
    isRequireBinding,
    importSource: isImportBinding ? bindingParent?.source?.value ?? null : requireSource,
    importKind: isImportBinding ? importBindingKind(bindingNode, bindingParent) : null,
  };
}

// a body-extract alias binding whose ONLY write is the aliasing destructure itself is clean: a
// declarator-form destructure (`const { x } = Source`) leaves no separate write, the assignment form
// (`let x; ({ x } = Source)`) leaves exactly one and has no declarator init. more writes, or a write
// alongside an init, are a real reassignment whose value may no longer be the static. count + init is
// parser-agnostic - it never inspects whether the write node is the assignment (babel) or the bound
// identifier (estree), so babel and unplugin make the same poison decision for identical source
export function isCleanDestructureAliasBinding(binding) {
  const own = bindingDeclaratorNode(binding);
  // a `var` binding's violation record is parser-UNEVEN for for-x heads: babel records the
  // init-less head declarator, estree records nothing at all - so the recorded-violation
  // count alone under-poisons a rebound alias on the estree side. recover the canonical
  // function-scope write set from the AST (it sees for-x heads on both parsers) and take
  // the larger count; the recovered set excludes the binding's own declarator by identity.
  // a synthetic (path-less) binding already carries that canonical set as its violations
  const aliasName = bindingBoundName(binding);
  const canonicalWrites = binding?.kind === 'var' && binding?.path && aliasName
    ? collectFunctionScopeVarReassignments(binding.path, aliasName)
      .filter(node => node !== own && node !== own?.id).length
    : 0;
  const writes = cleanDestructureAliasWrites(binding);
  const total = Math.max(writes.length, canonicalWrites);
  return total === 0 || (total === 1 && !own?.init);
}

// the violation set `isCleanDestructureAliasBinding` counts: valueless re-declarations, the
// binding's own declarator and identity self-assigns are NOT writes. exported so a consumer that
// reads a violation the gate admitted takes it from the SAME list - reading
// `constantViolations[0]` raw hands back a phantom node this filter just excluded
export function cleanDestructureAliasWrites(binding) {
  const own = bindingDeclaratorNode(binding);
  const name = bindingBoundName(binding);
  return (withoutValuelessDeclarationViolations(binding?.constantViolations) ?? [])
    .filter(v => !isDeclaratorSelfViolation(v, own) && !isIdentitySelfAssignViolation(v, name));
}

// estree-toolkit records a loop head's per-iteration rebind as a violation of the head's OWN
// binding: a bare id head via the id node, a DESTRUCTURING declarator via the bound identifier
// INSIDE its own pattern - climb pattern shells to the declarator to recognise the latter; the
// canonical scan records it as the for-x STATEMENT whose head holds the declarator, babel as the
// declarator itself. a declaration is not a reassignment of itself, whichever node spells it
export function isDeclaratorSelfViolation(v, ownDeclarator) {
  const node = violationNode(v);
  if (node === ownDeclarator || node === ownDeclarator?.id) return true;
  if (isForXStatement(node) && node.left?.type === 'VariableDeclaration'
    && node.left.declarations?.includes(ownDeclarator)) return true;
  if (node?.type === 'Identifier' && v?.parentPath) {
    for (let p = v.parentPath; p; p = p.parentPath) {
      if (p.node === ownDeclarator) return true;
      if (!PATTERN_WRAPPERS.has(p.node?.type)) break;
    }
  }
  return false;
}

// an identity self-assign (`w = w`, paren / TS wrappers included) writes the binding's own
// current value back - a value no-op for every flow-sensitive walk: it neither kills the init
// for the global dominance proof, nor makes the value ambiguous for pure, nor contributes an
// enumeration value. only the plain `=` with both sides the SAME name counts (a compound or
// logical form derives / conditions the value); estree surfaces the LHS Identifier, so the
// enclosing assignment comes from the violation's parent. the RHS read sits in the same
// expression as the LHS write, so it can only name the violated binding itself. `name` is the
// BINDING's name - read off a declarator id it was inert for every pattern-bound and parameter
// binding, exactly the shapes the destructure consumers hand it
function isIdentitySelfAssignViolation(v, name) {
  if (!name) return false;
  const node = violationNode(v);
  const assignment = node?.type === 'Identifier' ? v?.parentPath?.node : node;
  if (assignment?.type !== 'AssignmentExpression' || assignment.operator !== '=') return false;
  const lhs = unwrapRuntimeExpr(assignment.left);
  const rhs = peelNestedSequenceExpressions(assignment.right).tail;
  return lhs?.type === 'Identifier' && lhs.name === name && rhs?.type === 'Identifier' && rhs.name === name;
}

// the real reassignment site nodes (every violation other than the loop-reinit declarator-self
// and identity self-assigns). counting the self-rebind sent every `for (const k in ...)` body
// read - and every for-init DESTRUCTURED alias - through the flow-sensitive walks as "reassigned"
function reassignmentNodesBeyondDeclarator(binding) {
  const own = bindingDeclaratorNode(binding);
  const name = bindingBoundName(binding);
  return binding.constantViolations
    .filter(v => !isDeclaratorSelfViolation(v, own) && !isIdentitySelfAssignViolation(v, name))
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
  return !noReassignmentReachesUsage({
    reassignmentNodes, usagePath: path, usageNode,
    bindingScopeNode: binding?.scope?.block ?? binding?.scope?.path?.node ?? null,
  });
}

// for the sibling resolvers that need a flow-sensitive reassignment check (not a flat
// `binding.constantViolations?.length`): returns whether the reassignment should block resolution.
// false when there is no reassignment;
// otherwise delegates to the method-aware `reassignBailApplies`. (resolveVariableBindingToGlobal
// uses isReassignedBeyondDeclarator + reassignBailApplies instead - it excludes the loop-reinit
// declarator-self for BOTH methods, where these sites keep the conservative flat bail off-global)
// claim-SE migration canon, by POSITION against the guarded root. three homes, one per region:
// an SE INSIDE the root runs once in the test; an SE BEFORE it (a sequence prefix - `(e++,
// globalThis.window?.self)?.Array.of`) evaluates before the test does, so it `leading`s the whole
// guarded claim; an SE BETWEEN the root and the claim (a dropped hop's computed-key effect -
// `window?.[(e++, 'self')].Array`) `migrated`s into the guarded branch, in native order (test ->
// key effect -> leaf read). null only when an effect has no region at all - a position-less
// synthesized node, one straddling the root, one outside the claim span - and the caller keeps the
// raw stand-down there. a stand-down on a POLYFILLABLE static is a missed polyfill, not a formatting
// choice, so the regions are enumerated rather than defaulted
export function migratableClaimSe({ sideEffects, receiverEffectCount = 0, rootNode, end }) {
  if (!sideEffects?.length && !receiverEffectCount) return { leading: [], migrated: [] };
  const root = nodeSpan(rootNode);
  if (!sideEffects?.length || !root || end === undefined) return null;
  const leading = [];
  const migrated = [];
  for (const se of sideEffects) {
    const span = nodeSpan(se);
    if (!span) return null;
    if (span.start >= root.start && span.end <= root.end) continue;
    if (span.start >= root.end && span.end <= end) migrated.push(se);
    else if (span.end <= root.start) leading.push(se);
    else return null;
  }
  return { leading, migrated };
}

// a node's source span, through BOTH spellings its dialects use. babel's `cloneNode` keeps `loc`
// and drops the numeric `start` / `end`, and every AST-emitter re-dispatch runs on clones - a
// positional canon reading `node.start` alone sees a rebuilt host as position-less and stands the
// whole decision down there. oxc carries the numbers and no `loc`, so the numeric pair leads.
// null when neither spelling answers - the caller's own unknown-position branch
export function nodeSpan(node) {
  const start = node?.start ?? node?.loc?.start?.index;
  const end = node?.end ?? node?.loc?.end?.index;
  return typeof start === 'number' && typeof end === 'number' ? { start, end } : null;
}

export function reassignmentBlocksGlobalResolve({ binding, adapter, path, usageNode = null }) {
  return !!binding.constantViolations?.length && reassignBailApplies({ binding, adapter, path, usageNode });
}

// the climb below is asked of every native binding on every lookup, so it runs once per binding object
const namespaceScopedBindingBlockCache = new WeakMap();

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
  if (namespaceScopedBindingBlockCache.has(binding)) return namespaceScopedBindingBlockCache.get(binding);
  // start ABOVE the declaration so we classify the scope that CONTAINS it: its nearest enclosing
  // var-scope owner is the TSModuleBlock only when the binding is declared in the namespace body
  // (a function-scoped declaration resolves to a function-like / Program / StaticBlock owner)
  const owner = findNearestVarScopeOwner(decl.parentPath);
  const block = owner?.node.type === 'TSModuleBlock' ? owner.node : null;
  namespaceScopedBindingBlockCache.set(binding, block);
  return block;
}

// resolve which raw position in `args` holds the effective argument at `index`, expanding `...[lit]`
// spreads of inline array literals. returns { argIndex, elementIndex } (elementIndex < 0 for a
// top-level arg, else the position WITHIN the spread array) or null when undecidable: a non-inline-
// array spread, OR a NESTED spread inside the inline array (`...[a, ...rest]`) - either makes the
// expanded length variadic at compile time, so a later positional can't be statically located.
// shared by the node lifter (`resolveCallArgument`) and the babel synth-swap path so they can't drift.
// a positional answer is not a whole-list one: the mutation census reads a spread's elements as a LIST
// and refuses it entirely once any element is a spread, which is stricter than this walk on purpose
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

// the argument PATH a bare-ObjectPattern IIFE param resolves to: the call site plus the
// coordinate `resolveCallArgumentCoords` addresses it by, materialised as a path (an inline-array
// spread expands, so the argument may live at `arguments[i].argument.elements[j]`). the ONE
// locator both emitters use - a consumer that re-derives the position by an identity scan over
// top-level `arguments` cannot see inside an expanded spread and silently loses the receiver
// exactly where this resolver found it. NO trailing peel: babel unwraps a sequence tail, unplugin
// peels transparent wrappers, and baking either one in here would impose it on the other
export function findIifeArgPath(fnParentPath, paramNode) {
  const site = findIifeCallSite(fnParentPath, paramNode);
  if (!site) return null;
  const coords = resolveCallArgumentCoords(site.callPath.node.arguments ?? [], site.paramIndex);
  if (!coords) return null;
  const argPath = site.callPath.get('arguments')[coords.argIndex];
  return coords.elementIndex < 0 ? argPath : cachedContainerPaths(argPath.get('argument'), 'elements')[coords.elementIndex];
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
  // the kind test is `isTypeOnlyImportKind`, which owns the TS `type` / Flow `typeof` pair -
  // spelling it out here let this site and its siblings drift apart on the Flow spelling
  if (parent?.type === 'ImportDeclaration' && isTypeOnlyImportKind(parent.importKind)) return true;
  return node?.type === 'ImportSpecifier' && isTypeOnlyImportKind(node.importKind);
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
      // it: babel's insert crashed on scope re-registration, unplugin's produced
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

// the values a for-of HEAD declarator destructures. it carries no init of its own - what it binds is
// an ELEMENT of the iterated value - and only a literal names its elements. a SOLE element names a
// single value and answers for the whole loop. a longer literal binds a different one per iteration,
// so it answers only when every element is a PROXY GLOBAL: those roots are one object graph to this
// provider, which makes the head's claim resolve to the same static on every pass - while the RENDER
// still mirrors each element on its own, so nothing is shared between the passes but the answer.
// a HOLE has no element to read (its `undefined` must keep throwing natively) and a SPREAD hides
// what the pattern will see; for-IN is out (it binds the key, never the element), and so is
// for-await (the head awaits what the literal holds, which is not the node written there)
export function forOfHeadElements(declaratorPath) {
  const elements = forOfHeadIterableElements(declaratorPath);
  if (!elements) return null;
  if (elements.length === 1) return elements;
  return elements.every(element => element.type === 'Identifier' && asProxyGlobalName(element.name)) ? elements : null;
}

// ... and the same values as a BRANCH SET, making no claim that one receiver answers for the loop:
// each is what the pattern reads on its own pass. an enumerate-every-candidate consumer (usage-global,
// whose contract is inject-if-might) wants all of them where the one above insists on agreement
export function forOfHeadIterableElements(declaratorPath) {
  const declaration = declaratorPath?.parentPath;
  const loop = declaration?.parentPath;
  const loopNode = loop?.node;
  if (loopNode?.type !== 'ForOfStatement' || loopNode.await || loopNode.left !== declaration.node) return null;
  const elements = loopNode.right?.type === 'ArrayExpression' ? loopNode.right.elements : null;
  if (!elements?.length || elements.some(element => !element || element.type === 'SpreadElement')) return null;
  return elements;
}

// the NODE a destructure host holds as its receiver: the slot's value, or - for a for-x HEAD, whose
// declarator has no slot to hold one - the element the iterated literal spells, or - for an IIFE
// PARAMETER - the argument the call passes at its index (the argument wins over a default, which is
// dead text then; a bare parameter has nothing else to read; `patternNode` names the parameter
// where the host is the function itself). every consumer that reads a host's receiver asks through
// here, so a head or a call argument is a receiver-bearing host everywhere at once rather than in
// whichever walk was taught about it
export function destructureReceiverNode(host, patternNode = null) {
  const iifeArgument = iifeParameterArgument(host, patternNode);
  if (iifeArgument) return iifeArgument;
  const slot = destructureReceiverSlot(host?.node);
  if (!slot) return null;
  return host.node[slot] ?? forOfHeadElements(host)?.[0] ?? null;
}

function iifeParameterArgument(host, patternNode) {
  const type = host?.node?.type;
  const fn = type === 'AssignmentPattern' && FUNCTION_LIKE_NODE_TYPES.has(host.parentPath?.node?.type) ? host.parentPath
    : FUNCTION_LIKE_NODE_TYPES.has(type) && patternNode && host.node.params?.includes(patternNode) ? host : null;
  const site = fn ? findIifeCallSite(fn, type === 'AssignmentPattern' ? host.node : patternNode) : null;
  return site ? resolveCallArgument(site.callPath.node.arguments ?? [], site.paramIndex) ?? null : null;
}

// walk a (possibly nested) ObjectPattern to find the keyPath leading to a leaf Identifier
// named `name`. peels `AssignmentPattern` wrappers (`{key: id = default}`). plain-key
// by default (whatever `plainSynthKeyName` names); an optional `ctx`
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
      // through the plain-key canon, which also names a NUMERIC key (`{ 0: X }` addresses a slot
      // the descent reads like any other member) and both parsers' string spellings
      keyName = plainSynthKeyName(prop.key);
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
export function arrayWrapSlotBindsName(slot, name, ctx = null) {
  slot = slot?.type === 'AssignmentPattern' ? slot.left : slot;
  if (slot?.type === 'ObjectPattern') return !!objectPatternLiteralKeyPath(slot, name, ctx);
  if (slot?.type === 'ArrayPattern') return (slot.elements ?? []).some(el => el && arrayWrapSlotBindsName(el, name, ctx));
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
      if (index !== -1) return cachedContainerPaths(argPath.get('argument'), 'elements')[index];
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
// the wrapper set is the caller's: a question about POSITION peels the transparent wrappers only,
// while a question about the VALUE a callee reaches also peels the optional-chain marker
export function peelParenAndTSParentPath(startPath, wrappers = TRANSPARENT_EXPR_WRAPPER_TYPES) {
  let path = startPath?.parentPath ?? null;
  while (path?.node && wrappers.has(path.node.type)) path = path.parentPath;
  return path;
}

// ... and the node that actually SITS in that parent's slot: the outermost transparent wrapper
// below it, or the start node when nothing wraps. every position question matches its child by
// IDENTITY against the parent's slots (`parent.right === node` and kin), so asking with the bare
// inner node answers "in no slot at all" on the parser that keeps parens as real nodes - the
// wrapper is what the parent holds, and the two peels have to be taken as a PAIR. this is the PATH
// form, for a caller that keeps walking from there; `peelParenAndTSSlotChild` below is its node
export function peelParenAndTSSlotPath(startPath, wrappers = TRANSPARENT_EXPR_WRAPPER_TYPES) {
  let path = startPath;
  while (path?.parentPath?.node && wrappers.has(path.parentPath.node.type)) path = path.parentPath;
  return path ?? null;
}

export function peelParenAndTSSlotChild(startPath, wrappers) {
  return peelParenAndTSSlotPath(startPath, wrappers)?.node ?? null;
}

// nothing to rewrite here, by SHAPE: the claim is disabled by a directive, already consumed by an
// earlier emission, a JSX identifier (a tag name is not a value read), type-only, or written inside
// a declaration that never reaches the emit. what this does NOT answer is DETACHMENT - whether the
// node still hangs in the tree - because each binding's path API reports that its own way, and each
// ORs its own check onto this one. the shape questions were spelled twice, once per binding, with
// the JSX one inside on one leg and beside it on the other
export function claimIsInert({ node, path, isDisabled, skippedNodes, isInTypeAnnotation }) {
  return !!isDisabled?.(node) || !!skippedNodes?.has(node)
    || node?.type === 'JSXIdentifier' || !!isInTypeAnnotation?.(path)
    || !!nonEmittedExpressionAncestor(path);
}

// does this assignment DISCARD its value? only a statement position does - source parens and TS
// wrappers are transparent on the way there, and everything else consumes what the assignment
// yields (`const w = ({ Map: { k } } = globalThis)` reads the GLOBAL, not the anchored ctor)
export function assignmentInStatementPosition(assignPath) {
  return peelParenAndTSParentPath(assignPath)?.node?.type === 'ExpressionStatement';
}

// ... and the OTHER position that discards it: an element of a sequence nobody reads. a NON-TAIL
// element is discarded outright; the TAIL yields the sequence's own value, so it is discarded
// exactly when the sequence is - which is why this climbs instead of answering for one slot.
// transparent wrappers climb with it, exactly as they do above
export function discardedSequenceElement(path) {
  let cur = path;
  for (let up = cur?.parentPath; up?.node; up = cur.parentPath) {
    const { type } = up.node;
    if (type === 'SequenceExpression') {
      if (up.node.expressions.at(-1) !== cur.node) return true;
    } else if (type !== 'ParenthesizedExpression' && !TS_EXPR_WRAPPERS.has(type)) return false;
    cur = up;
  }
  return false;
}

// ... and the SLOT such a rewrite owns: the node peeled up to the sequence that holds it, wrappers
// included. a different question from the one above - the discard may be decided several sequences
// out, while what a render may replace is only its own element
export function discardedSequenceElementPath(path) {
  if (!discardedSequenceElement(path)) return null;
  let cur = path;
  for (let up = cur?.parentPath; up?.node; up = cur.parentPath) {
    if (up.node.type === 'SequenceExpression') return cur;
    cur = up;
  }
  return null;
}

// the two together: does ANYTHING read what this assignment yields? a position that discards the
// value is as free for a rewrite as any other that does - which of the two it is only decides
// WHERE the rewrite lands, and that is the emitter's question, not this one
export function assignmentValueDiscarded(assignPath) {
  return assignmentInStatementPosition(assignPath) || discardedSequenceElement(assignPath);
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
// and oxc shapes carry the same `.type` string on AST nodes. `visit(child, key, listMember)`
// hands the child's position along for the callers that decide by it
export function walkAstChildren(node, visit) {
  if (!node || typeof node !== 'object') return;
  // eslint-disable-next-line no-restricted-syntax -- perf: AST hot path, plain objects
  for (const key in node) {
    const value = node[key];
    if (Array.isArray(value)) {
      for (const el of value) if (isASTNode(el)) visit(el, key, true);
    } else if (isASTNode(value)) visit(value, key, false);
  }
}

// does a chain-receiver carry a LIVE `?.` of its own? walks member / call links and the
// transparent wrappers down to the root. a ParenthesizedExpression TERMINATES the walk: parens
// end an optional chain, so a `?.` sealed inside them does not short-circuit what follows
// (`(a?.b).c` throws natively on a nullish `a`) and must not lift a guard out here.
// used by the chain combines: a receiver with a live `?.` short-circuits the WHOLE chain
// natively, so it has to be tested before the (nullish-intolerant) maybe-helper reads it,
// while a receiver without one must keep throwing on the helper's own member read
export function receiverCarriesLiveOptional(node) {
  for (let cur = node; cur && typeof cur === 'object';) {
    // oxc keeps a paren NODE, babel only marks `extra.parenthesized` on the wrapped node -
    // check both spellings or the two dialects disagree on where the chain ends. the START
    // node's own parens count too: `(a?.b).flat?.()` ends the chain at the seal, so the
    // receiver hands the helper a value it must throw on. exempting them read the babel
    // default-parser spelling as short-circuiting while oxc (a paren NODE, which no branch
    // below steps through) already answered false for the same source
    if (cur.extra?.parenthesized) return false;
    if (cur.optional === true) return true;
    if (cur.type === 'MemberExpression' || cur.type === 'OptionalMemberExpression') cur = cur.object;
    else if (cur.type === 'CallExpression' || cur.type === 'OptionalCallExpression') cur = cur.callee;
    else if (cur.type === 'ChainExpression' || TS_EXPR_WRAPPERS.has(cur.type)) cur = cur.expression;
    else return false;
  }
  return false;
}

// node types whose value is always a freshly-made object - the only left operands of `&&` that
// cannot hand `in` something it throws on
const ALWAYS_TRUTHY_OBJECT_NODES = new Set([
  'ObjectExpression',
  'ArrayExpression',
  'FunctionExpression',
  'ArrowFunctionExpression',
  'ClassExpression',
  'NewExpression',
]);

// can this expression's VALUE come out nullish? the sibling question to
// `receiverCarriesLiveOptional`, and the parens do NOT stop this walk: sealing an optional chain
// keeps its value undefined, it only stops the short-circuit from propagating to what follows.
// a short-circuit wears TWO spellings - the source's `?.` and the LOWERED ternary a sibling
// transform leaves behind (`a == null ? void 0 : a.slice()`), which is what the post-babel pass
// sees - so both count, as does a branch that is a nullish literal outright. callers that ERASE the
// expression need this: `'flat' in x` folds to a constant only while `x` cannot be the nullish that
// `in` throws on, and the resolved type hint says nothing about it - a union drops the void branch
export function valueMayBeNullish(node) {
  for (let next = node; next && typeof next === 'object';) {
    const cur = unwrapRuntimeExpr(next);
    if (!cur || typeof cur !== 'object') return false;
    if (cur.optional === true || isNullLiteralNode(cur) || isBareUndefinedIdentifier(cur)) return true;
    if (cur.type === 'UnaryExpression' && cur.operator === 'void') return true;
    // the branching shapes are the only ones that need both sides answered
    if (cur.type === 'ConditionalExpression') {
      return valueMayBeNullish(cur.consequent) || valueMayBeNullish(cur.alternate);
    }
    // the logical operators are NOT symmetric here. `&&` yields its LEFT whenever that is falsy, and
    // every falsy value is one `in` throws on (nullish outright, or a primitive that is not an
    // object), so only an always-truthy object literal on the left keeps the answer decidable
    if (cur.type === 'LogicalExpression' && cur.operator === '&&'
      && !ALWAYS_TRUTHY_OBJECT_NODES.has(cur.left?.type)) return true;
    switch (cur.type) {
      // `||` and `??` yield the left only when it is truthy / non-nullish, so the right operand is
      // the only one that can carry a nullish through
      case 'LogicalExpression': next = cur.right; break;
      case 'SequenceExpression': next = cur.expressions.at(-1); break;
      case 'MemberExpression': case 'OptionalMemberExpression': next = cur.object; break;
      case 'CallExpression': case 'OptionalCallExpression': next = cur.callee; break;
      default: return false;
    }
  }
  return false;
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
  // single-quasi template key (`Object.defineProperty(Array, `from`, d)`) is a static string too
  return singleQuasiString(node);
}

// a value that can REACH a built-in constructor: the constructor itself (an Identifier, bare or
// aliased) or a container that may hold one deeper. every other value is data no walk can follow to a
// built-in. shared by the receiver walk (which slot to descend) and the mutation gate (which binding
// counts as a container) so read and write agree on what a container is
export function canHoldBuiltIn(node) {
  return node?.type === 'Identifier' || node?.type === 'ObjectExpression'
    || node?.type === 'ArrayExpression' || node?.type === 'ClassExpression';
}

// a computed key that is a (paren-wrapped) SequenceExpression with a static-string TAIL
// (`[(eff(), 'from')]`) resolves to that tail name ('from'); null otherwise. the member-access side
// stops here: a member key is READ in place, so only the sequence form needs its prefix accounted for
function sequenceKeyStaticName(keyNode) {
  const node = unwrapParens(keyNode);
  if (node?.type !== 'SequenceExpression') return null;
  return staticStringKey(peelSequenceTail(node, { step: unwrapParens }));
}

// the static NAME a COMPUTED key resolves to, mirroring the shapes `resolveKey` folds structurally:
// a sequence tail (`[(eff(), 'from')]`), a `+` concat (`['fr' + 'om']`) and a template with
// resolvable interpolations, nested in any combination. this is the single fact every synth gate
// needs, and it must stay a SUPERSET of what the caller-LOSSY extraction resolves: extraction and
// synth decide on the same key name, so a shape only extraction folds would emit the lossy form
// where the caller-correct one was available. scope-dependent folds (an Identifier key followed to
// its binding) are deliberately not mirrored - the gates accept `[k]` structurally and check its
// binding separately, where the pattern is rendered rather than where the plan resolved it
export function computedKeyStaticName(keyNode) {
  const node = peelSequenceTail(unwrapParens(keyNode), { step: unwrapParens });
  if (node?.type === 'BinaryExpression' && node.operator === '+') {
    const left = computedKeyStaticName(node.left);
    const right = left === null ? null : computedKeyStaticName(node.right);
    return right === null ? null : left + right;
  }
  if (node?.type === 'TemplateLiteral') {
    let out = '';
    for (let i = 0; i < node.quasis.length; i++) {
      // an invalid escape leaves `cooked` unset post-ES2018 - runtime concat sees the same
      // absence, so no valid lookup key can be formed
      const { cooked } = node.quasis[i].value;
      if (cooked === null || cooked === undefined) return null;
      out += cooked;
      if (i < node.expressions.length) {
        const part = computedKeyStaticName(node.expressions[i]);
        if (part === null) return null;
        out += part;
      }
    }
    return out;
  }
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

// ... and the same key with the COMPUTED branch folded structurally - a sequence tail, a `+`
// concat, a template with resolvable interpolations. the member side has had this pair as one
// canon (`memberKeyName`) all along; every property-side caller spelled the ternary by hand, and
// four copies of one rule drift the moment a fifth foldable shape is recognised
export function foldedPropertyKeyName(prop) {
  return prop.computed ? computedKeyStaticName(prop.key) : propertyKeyName(prop);
}

// `void <expr>` - the operator always evaluates to `undefined` whatever its operand, so the VALUE is
// undefined even when the operand has effects (callers that also care about dropping the operand test
// its effects separately). the narrower `void 0` spelling and the effect-free variant live with their
// own consumers; this is the value question every one of them shares
export function isVoidExpression(node) {
  return node?.type === 'UnaryExpression' && node.operator === 'void';
}

// bare-`undefined` Identifier shape. callers needing the runtime-`undefined` SEMANTIC must also
// check that nothing shadows it (`var undefined`, `const undefined = X`, `(undefined) => ...`) -
// this is the parser-side shape only. lives here so both the type-resolver and the detect clusters
// read one definition
export function isBareUndefinedIdentifier(node) {
  return node?.type === 'Identifier' && node.name === 'undefined';
}

// a literal `null` under either parser spelling (babel `NullLiteral`, ESTree `Literal` with a null
// value). the regex guard matters on the ESTree side, where `/x/` also carries `value: null`
export function isNullLiteralNode(node) {
  return node?.type === 'NullLiteral' || (node?.type === 'Literal' && node.value === null && !node.regex);
}

// can this value, used as a prototype, install a DISPATCHER? per spec only an Object changes what an
// object dispatches: `null` gives a prototype-less object, and any other primitive is a NO-OP in the
// `__proto__` channels (the object keeps `Object.prototype`) and throws in `setPrototypeOf` /
// `Object.create` - none of them add a member a polyfill could serve. a template literal is always a
// string; an ESTree regex literal is an OBJECT and stays in. anything not statically decidable (an
// identifier, a call, a member) may be an object, so it does dispatch
export function prototypeValueMayDispatch(node, undefinedShadowed = false) {
  if (!node || isNullLiteralNode(node)) return false;
  const { type } = node;
  if (type === 'TemplateLiteral' || type === 'NumericLiteral' || type === 'StringLiteral'
    || type === 'BooleanLiteral' || type === 'BigIntLiteral') return false;
  if (isVoidExpression(node)) return false;
  // `undefined` is shadowable, and a shadowed one is an ordinary value that CAN be an object -
  // the caller reports whether anything binds the name here (the same gate the nullish canon uses)
  if (type === 'Identifier') return node.name !== 'undefined' || undefinedShadowed;
  if (type !== 'Literal') return true;
  return !!node.regex || typeof node.value === 'object';
}

// is THIS property the one that installs a prototype? only a plain, non-computed, non-shorthand
// `__proto__` data property does - a method, an accessor or a computed key of the same name creates
// an ordinary own property instead. one rule, read both per-literal and per-property
function propertyInstallsPrototype(prop, undefinedShadowed = false) {
  if (prop?.type !== 'Property' && prop?.type !== 'ObjectProperty') return false;
  if (prop.computed || prop.shorthand || prop.method || (prop.kind && prop.kind !== 'init')) return false;
  if (propertyKeyName(prop) !== '__proto__') return false;
  return prototypeValueMayDispatch(prop.value, undefinedShadowed);
}

// does an object literal install a custom prototype through a `__proto__:` DATA property? such an
// object INHERITS that prototype's methods (`{ __proto__: Array.prototype }` dispatches
// `Array.prototype.at`), so it is neither a plain `Object` for typing nor instance-inert for the
// union - both consumers read this one predicate. only the colon form with an Identifier / string
// `__proto__` key sets the prototype: computed, shorthand, method and accessor spellings define an
// ordinary own property, and a spread copies a VALUE (never the prototype). `__proto__: null` gives a
// null-prototype object that dispatches nothing; any other value may carry a polyfilled method
export function objectLiteralPrototypeValue(node, undefinedShadowed = false) {
  for (const prop of node?.properties ?? []) {
    if (propertyInstallsPrototype(prop, undefinedShadowed)) return prop.value;
  }
  return null;
}

// climb a reference to the node its consumer sees: transparent wrappers plus sequence-VALUE
// positions (a sequence evaluates to its last expression, so the reference is what a surrounding
// write or call receives). shared by the prototype-install channels below
export function prototypeWriteHostPath(ref) {
  let cur = peelTransparentExprAncestorPath(ref);
  while (cur?.parentPath?.node?.type === 'SequenceExpression'
    && cur.parentPath.node.expressions?.at(-1) === cur.node) {
    cur = peelTransparentExprAncestorPath(cur.parentPath);
  }
  return cur;
}

// does this REFERENCE install a foreign prototype on the value it names? the two runtime channels
// that change an object's dispatcher after creation: a `__proto__` member write and a
// `setPrototypeOf` call in its TARGET slot (the PROTO slot argument is a source, not a target).
// `__proto__ = null` installs no dispatcher. the literal-side twin is `objectLiteralPrototypeValue`.
// the CALLEE's identity is not decidable from the raw AST (`Object` can be shadowed, and usage-pure
// rewrites the call to its own injected binding), so the caller supplies `isProtoSetterCallee` and
// gets the callee PATH to resolve
export function installedPrototypeValueAt(ref, isProtoSetterCallee, undefinedShadowed = false) {
  // the reference may sit under transparent wrappers or be the VALUE of a sequence
  // (`Object.setPrototypeOf((eff(), o), P)`) - the install still lands on it, so climb to the node
  // the write / call actually sees before matching
  const host = prototypeWriteHostPath(ref);
  const parent = host?.parentPath?.node;
  if (!parent) return null;
  if ((parent.type === 'MemberExpression' || parent.type === 'OptionalMemberExpression')
    && parent.object === host.node && memberKeyName(parent) === '__proto__') {
    const assign = host.parentPath.parentPath?.node;
    return assign?.type === 'AssignmentExpression' && assign.left === parent
      && prototypeValueMayDispatch(assign.right, undefinedShadowed) ? assign.right : null;
  }
  if ((parent.type !== 'CallExpression' && parent.type !== 'OptionalCallExpression')
    || parent.arguments?.[0] !== host.node) return null;
  // the PROTO slot argument of a resolved setter call. a missing one (`setPrototypeOf(o)`) throws at
  // runtime, so nothing can be read off it - report the install without a value
  return isProtoSetterCallee?.(host.parentPath.get('callee')) ? parent.arguments[1] ?? NO_PROTOTYPE_VALUE : null;
}

// an install whose prototype VALUE cannot be pointed at: the channel fired, but a consumer reading
// the value gets nothing. distinct from `null` (no install at all) so a boolean consumer still
// reports the install while a value consumer declines
export const NO_PROTOTYPE_VALUE = { type: 'NoPrototypeValue' };

// the `#name` spelling of a private-name node under either parser (babel `PrivateName` nests the
// identifier under `.id`, estree `PrivateIdentifier` carries `.name` directly); null when the node is
// not a private name. single canon so the two spellings never drift apart across the private-key sites
export function privateNameSpelling(node) {
  if (node?.type === 'PrivateName') return `#${ node.id?.name }`;
  if (node?.type === 'PrivateIdentifier') return `#${ node.name }`;
  return null;
}

// key spelling shared by the own-this method-extraction gates: private members keep a `#name`
// spelling so a `c.#m` read matches the class-body declaration; everything else resolves via
// the canonical property-key extractor. null = dynamic / unresolvable
export function ownThisMemberKeyName(member) {
  return privateNameSpelling(member?.key) ?? propertyKeyName(member);
}

// member-READ twin of `ownThisMemberKeyName`: the key a member ACCESS reads, with the same
// private spelling, dotted and static-string-computed forms via the canonical member-key
// extractor. null = dynamic computed read
export function memberReadKeyName(member) {
  return privateNameSpelling(member?.property) ?? memberKeyName(member);
}

// can this object literal reach a `Symbol.iterator`, and so hand ITSELF to whatever iterates it
// (`for (const x of o)`, `[...o]`)? the summary below is where that is decided - it already walks the
// properties once for the method set, and the answer falls out of the same pass. this reader exists
// for the walks that hold the literal's NODE and want only this one fact
export function mayIterateItself(objectNode) {
  return !!objectOwnThisMethodInfo(objectNode)?.mayIterate;
}

// does a decorator sit on this class or on any of its members? a decorator receives the class or the
// member and may replace it, wrap it, or install new ones, so what the body of any member does is no
// longer read from the source in front of us
export function classCarriesDecorators(classNode) {
  if (classNode?.decorators?.length) return true;
  return !!classNode?.body?.body?.some(member => member?.decorators?.length);
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
  // the literal ends up owning members it never wrote in three ways, and every consumer of this
  // summary needs to know: a SPREAD copies another object's own enumerable properties in, methods
  // included; a `__proto__` key installs a PROTOTYPE whose members it inherits; a COMPUTED key can
  // be `Symbol.iterator` (and either of the first two can carry one). a key spelled out AFTER the
  // last spread is not among them - an own definition supersedes the copy, while one written before
  // it can be overwritten by exactly that copy. one pass computes all of it: this summary is built
  // per literal on a hot path, and each extra sweep over the properties is paid there
  let unscannableBodies = false;
  let mayIterate = false;
  let declaredKeys = new Set();
  for (const prop of objectNode.properties ?? []) {
    const { type } = prop;
    if (type === 'SpreadElement') {
      unscannableBodies = true;
      mayIterate = true;
      declaredKeys = new Set();
      continue;
    }
    if (prop.computed) mayIterate = true;
    let isMethod = false;
    if (type === 'ObjectMethod') {
      if (prop.kind === 'method') isMethod = true;
      else accessors = true;
    } else if (type === 'Property' || type === 'ObjectProperty') {
      if (prop.kind === 'get' || prop.kind === 'set') accessors = true;
      else isMethod = unwrapRuntimeExpr(prop.value)?.type === 'FunctionExpression';
    }
    const key = ownThisMemberKeyName(prop);
    if (key !== null && key !== undefined) declaredKeys.add(key);
    // `undefinedShadowed` is read conservatively: a summary carries no scope, and mis-reading an
    // install as absent is the unsafe direction
    if (propertyInstallsPrototype(prop, true)) {
      unscannableBodies = true;
      mayIterate = true;
    }
    if (!isMethod) continue;
    if (key === null || key === undefined) unknownKey = true;
    else methodKeys.add(key);
  }
  // `mayIterate` alone is enough to return a summary: a literal with a computed key and no methods
  // at all can still hand itself to whatever iterates it
  return methodKeys.size || unknownKey || accessors || unscannableBodies || mayIterate
    ? { methodKeys, unknownKey, accessors, mayIterate, unscannableBodies, declaredKeys } : null;
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
    if (!!member.static !== statics) continue;
    let isMethod = false;
    if (type === 'ClassMethod' || type === 'ClassPrivateMethod'
      || type === 'MethodDefinition' || type === 'TSAbstractMethodDefinition') {
      if (member.kind === 'get' || member.kind === 'set') {
        accessors = true;
        continue;
      }
      isMethod = member.kind !== 'constructor';
    // reads the RAW `member.type`, so every parser spelling must be listed: unlike the paths that go
    // through the adapter's node-type mapper (which folds the estree auto-accessor onto the babel
    // name), an auto-accessor field arrives here as `AccessorProperty` on one parser and
    // `ClassAccessorProperty` on the other - matching only one silently drops its initializer
    } else if (type === 'ClassProperty' || type === 'ClassPrivateProperty'
      || type === 'PropertyDefinition' || type === 'ClassAccessorProperty' || type === 'AccessorProperty') {
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
    mayIterate: !!base.mayIterate || !!extra.mayIterate,
    unscannableBodies: !!base.unscannableBodies || !!extra.unscannableBodies,
    declaredKeys: new Set([...base.declaredKeys ?? [], ...extra.declaredKeys ?? []]),
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
  // eslint-disable-next-line no-restricted-syntax -- perf: AST hot path, plain objects
  for (const key in node) {
    const value = node[key];
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

// the KEY a receiver whose mutated member cannot be named is recorded under. it says only that SOME
// member was replaced, which is a weaker fact than `globalThis.<name>` (the SLOT key, where the
// user's own object replaced the built-in): the binding is still the built-in, so its name keeps
// resolving to a polyfill and only its members stop being trusted. read as the slot key it would
// leave the whole name native - a missing polyfill on every engine without it
export const MUTATED_MEMBERS_UNKNOWN = '*';

// the (object, key) pair consultation both plugin adapters and the meta gate share. three ways the
// pair stops being a polyfillable static: the exact pair is recorded, the OBJECT carries the
// members-unknown key (some member was replaced and this may be it), or the object's own SLOT was
// replaced - `globalThis.Set = Shim` makes every `Set.<key>` read the shim's own property, so no
// member of a replaced object is one either
export function isMutatedStaticPair(object, key, mutatedSet) {
  return !!mutatedSet?.has(mutatedStaticKey(object, key))
    || !!mutatedSet?.has(mutatedStaticKey(object, MUTATED_MEMBERS_UNKNOWN))
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
const SCOPE_REBINDING_TYPES = new Set([
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
  // emission (mirrors the injector's var-scope anchoring of TSModuleBlock)
  'TSModuleDeclaration',
  'TSEnumDeclaration',
]);

function isScopeRebinding(node) {
  return SCOPE_REBINDING_TYPES.has(node.type);
}

// `this` REbinding is a narrower boundary than scope rebinding: an arrow inherits the enclosing
// `this`, so a `this` inside a top-level arrow is still the top-level one. mirrors the canon
// `isTopLevelThisContext` walks, so a census frame and a path walk answer alike
const THIS_REBINDING_TYPES = new Set([...SCOPE_REBINDING_TYPES].filter(type => type !== 'ArrowFunctionExpression'));

function isThisRebinding(node) {
  return THIS_REBINDING_TYPES.has(node.type);
}

// ONE full-file raw walk driving every per-file census reducer. each reducer keeps its own
// per-node logic and closure state in its home module ({ visit(node, frame), result() });
// the driver owns only the traversal. every reducer output is an order-insensitive set /
// flag, so one shared traversal order serves all of them - the point is collapsing the
// N independent whole-file scans (name reservation, mutation / ctor-alias / minifier
// shape gates) into a single pass. frames carry the structural parent type (transparent
// wrappers forwarded) and the module-top-level flag - the contexts the orphan-ref
// classifier distinguishes emit positions by
// does this injection method read the census the usage lanes build? `entry-global` replaces an
// entry import and mints no name of its own, so it consumes neither the name reservation the
// census feeds nor the mutation / ctor-alias tables - only the resolvers and emitters it never
// reaches read those. one question, asked by both emitters, so it lives here rather than as a
// method-literal compare in each; the reducer LIST stays with the emitter, because only babel's
// census carries the minifier-shape gate and entry-global does need that one
export function methodReadsUsageCensus(method) {
  return method !== 'entry-global';
}

export function collectFileCensus(programNode, reducers) {
  // `parentNode` is the IMMEDIATE structural parent (unlike `parentType`, which skips transparent
  // wrappers): a reducer that must tell a source-name position from a reference (an identifier that
  // is a property key / member key / label, per `isNonReferencePosition`) needs the exact parent node
  // two parallel stacks: SIBLINGS share one frame object, so the walk allocates one frame
  // per PARENT rather than one per node - the reducers' contract is unchanged, they never
  // read a `node` off the frame
  const nodeStack = [programNode];
  const frameStack = [{
    parentType: null, atTopLevel: true, atThisTopLevel: true,
    parentNode: null, underTypeAnnotation: false,
  }];
  while (nodeStack.length) {
    const node = nodeStack.pop();
    const frame = frameStack.pop();
    if (Array.isArray(node)) {
      // an array is not a node: its members inherit the frame verbatim
      for (let i = node.length - 1; i >= 0; i--) {
        nodeStack.push(node[i]);
        frameStack.push(frame);
      }
      continue;
    }
    if (!isASTNode(node)) continue;
    for (const reducer of reducers) reducer.visit(node, frame);
    const atTopLevel = frame.atTopLevel && !isScopeRebinding(node);
    // an arrow keeps the enclosing `this`, so it does not end the top-level-`this` region
    const atThisTopLevel = frame.atThisTopLevel && !isThisRebinding(node);
    // sticky, same shape as `atTopLevel`: once inside an annotation the whole subtree is inside it.
    // the boundary is the WRAPPER node a `:` slot introduces - deliberately NARROWER than
    // `isTypeAnnotationNodeType` ("is this type-space at all"), which also covers union arms and
    // type ARGUMENTS. a type-alias RHS, an interface body and type arguments carry no wrapper
    const underTypeAnnotation = frame.underTypeAnnotation || isTypeAnnotationWrapper(node);
    const parentType = TRANSPARENT_EXPR_WRAPPER_TYPES.has(node.type) ? frame.parentType : node.type;
    let childFrame = null;
    // eslint-disable-next-line no-restricted-syntax -- perf: AST hot path, plain objects
    for (const key in node) {
      const value = node[key];
      if (Array.isArray(value) || isASTNode(value)) {
        childFrame ??= { parentType, atTopLevel, atThisTopLevel, parentNode: node, underTypeAnnotation };
        nodeStack.push(value);
        frameStack.push(childFrame);
      }
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
      if (runtimeChainRoot(node.object)?.type === 'Identifier') memberKeyNames.add(key);
    },
    result() { return { memberKeyNames }; },
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
// --- Global-proxy import recognition ---

// the pure GLOBAL-PROXY entries (`global-this` / `self` - the only proxy globals shipped as pure
// entries): a default binding of one carries the global object itself, so every receiver recogniser
// must treat it like the bare proxy name. these live in the shared layer rather than beside one of
// their callers because there are TWO recognisers - the read-side name resolver and the proxy-ROOT
// walk - in modules with a one-way import between them; a copy in either drifts, and the drift is
// silent: a write through such an import fails to taint the slot while reads through the SAME
// binding resolve, so the ponyfill is substituted over the user's runtime patch
const CORE_JS_IMPORT_SOURCE_PREFIX = /^(?:core-js(?:-pure)?\/|@core-js\/pure\/|(?:actual|es|features|full|proposals|stable|stage)\/)/;
const GLOBAL_PROXY_ENTRY_SOURCE = /(?:^|\/)(?<name>global-this|self)(?:\/index)?(?:\.js)?$/;

// match `<pkg>/...` for any pkg in the user's resolved `packages` array (main + additional). allows
// aliased / monorepo polyfill packages to participate in detection alongside the built-in core-js
// prefix. lowercased prefix comparison mirrors `packages` already being lowercased at construction
export function importSourceMatchesUserPackage(source, packages) {
  if (!packages?.length) return false;
  const lower = source.toLowerCase();
  for (const pkg of packages) if (lower.startsWith(`${ pkg }/`)) return true;
  return false;
}

// `<pkg>/<mode>/global-this` module source -> `globalThis` (same for `self`), or null when the
// source is absent / unrelated. SOURCE-based rather than polyfillHint-based on purpose: the mutation
// prepass runs BEFORE the injector registers user pure imports, so hint-only recognition left the
// WRITE channel blind to a receiver the READ channel resolves
export function globalProxyNameFromImportSource(source, packages = null) {
  if (!source) return null;
  if (!CORE_JS_IMPORT_SOURCE_PREFIX.test(source) && !importSourceMatchesUserPackage(source, packages)) return null;
  const match = GLOBAL_PROXY_ENTRY_SOURCE.exec(source);
  return match ? match.groups.name.replaceAll(/-(?<letter>[a-z])/g, (...args) => args.at(-1).letter.toUpperCase()) : null;
}

// `<pkg>/<mode>/<ns>/constructor` module source -> the CONSTRUCTOR global name (`.../map/
// constructor` -> `Map`, `.../weak-map/constructor` -> `WeakMap`), or null when the source is
// absent / unrelated. SOURCE-based for the same reason as the proxy twin above: the mutation
// prepass runs BEFORE the injector registers user pure imports, so a second-pass patch through
// the minted ctor binding (`_Map.groupBy = patched`) must still register the mutated static -
// hint-only recognition left the WRITE channel blind while the READ channel substitutes
const PURE_CTOR_ENTRY_SOURCE = /(?:^|\/)(?<ns>[a-z][\w-]*)\/constructor(?:\.js)?$/;
// `toGlobalHint` is `entryToGlobalHint`, injected rather than imported: it lives in the package
// entry, which imports THIS module. without it the kebab segment is only capitalized, and the
// namespaces whose capitals do not start a word (`url` -> `URL`, `regexp` -> `RegExp`) resolve to
// a name no table knows
export function pureCtorNameFromImportSource(source, packages = null, toGlobalHint = null) {
  if (!source) return null;
  if (!CORE_JS_IMPORT_SOURCE_PREFIX.test(source) && !importSourceMatchesUserPackage(source, packages)) return null;
  const match = PURE_CTOR_ENTRY_SOURCE.exec(source);
  if (!match) return null;
  const name = kebabToCamel(match.groups.ns);
  return toGlobalHint?.(match.groups.ns) ?? name.charAt(0).toUpperCase() + name.slice(1);
}

// true when `node` binds the module's default export (either as default specifier or as named
// `default` re-export). namespace bindings and other named specifiers reject - they alias something
// other than the module's default, even if the module-source matches. `null` is accepted as
// "default-like" for adapter-supplied virtual bindings: the plugin only emits virtual bindings for
// its own default pure-imports, and reference-tracking / super-mapping rely on that
export function bindsModuleDefault(node) {
  if (!node) return true;
  if (node.type === 'ImportDefaultSpecifier') return true;
  if (node.type === 'ImportSpecifier') {
    const importedName = node.imported?.name ?? node.imported?.value;
    return !importedName || importedName === 'default';
  }
  return false;
}

// both `import type X` / `import { type X }` and Flow's `import typeof X` / `import { typeof X }`
// erase before runtime, so a name they bind must never register as a dedup target or resolve as a
// runtime value - a later real use rewritten onto the erased binding throws ReferenceError. only
// babel parses Flow (`typeof`), but the predicate is shared so every import-kind site stays in lockstep
export function isTypeOnlyImportKind(kind) {
  return kind === 'type' || kind === 'typeof';
}

// type-only at EITHER level, for a binding rather than a node pair: an adapter VIEW already carries
// the resolved kind, a raw binding carries its node plus the declaration above it. both spellings
// erase the binding, so both must gate - the two-level rule itself lives in `importBindingKind`
export function importBindingIsTypeOnly(binding) {
  return isTypeOnlyImportKind(binding?.importKind ?? importBindingKind(
    binding?.node, binding?.path?.parent ?? binding?.path?.parentPath?.node,
  ));
}

// the `export` modifier (babel@7 flags `isExport` on the node; @8 / oxc wrap it in an
// ExportNamedDeclaration the callers peel) doesn't change the local binding's value - an exported
// `export import g = require('.../global-this')` still hosts the global for a mutation / interop
// receiver, so it must not gate the source read (a non-proxy source is dropped downstream anyway)
// adapter-less callers (the scope-less census reducer) read the literal value directly
export function tsImportEqualsRequireSource(node, adapter) {
  if (node?.type !== 'TSImportEqualsDeclaration' || node.importKind === 'type'
    || node.id?.type !== 'Identifier' || node.moduleReference?.type !== 'TSExternalModuleReference') return null;
  const source = adapter ? adapter.getStringValue(node.moduleReference.expression) : node.moduleReference.expression?.value;
  return typeof source === 'string' ? source : null;
}

// `import g = require('<pkg>/<mode>/global-this')` - the TS require-import shape. tsc /
// esbuild emit it for CJS interop; `scanExistingCoreJSImports` already recognizes it as a
// pure import for dedup, so the resolution canon must see the same binding or the write
// channel goes blind to a receiver the import scan trusts
export function tsImportEqualsProxyName(node, adapter, packages = null) {
  return globalProxyNameFromImportSource(tsImportEqualsRequireSource(node, adapter), packages);
}

// the proxy-global name an import BINDING stands for, or null when it is not such an import.
// covers the THREE import forms one surface serves: the ES default/namespace specifier, the TS
// `import g = require(...)` declaration, and the bare-CJS `var g = require('.../global-this')`
// (the adapters surface its source on the binding like an import's, and `module.exports` of a
// pure global-proxy entry IS the global object with no `.default` hop between). a consumer
// branching on just one form goes blind to the others' receiver - the member-read channel missed
// the TS twin exactly that way, and the guard channels erased over the require twin's probe
export function importedGlobalProxyName(binding, packages, adapter = null) {
  if (binding?.node?.type === 'TSImportEqualsDeclaration') {
    return tsImportEqualsProxyName(binding.node, adapter, packages);
  }
  // reassignment gate mirrors the require-source recogniser's: a rebound name no longer provably
  // holds the module object; the Identifier-id gate is the declarator-slot canon
  if (binding?.node?.type === 'VariableDeclarator' && binding.importSource
    && binding.node.id?.type === 'Identifier' && !isReassignedBeyondDeclarator(binding)) {
    return globalProxyNameFromImportSource(binding.importSource, packages);
  }
  return bindsModuleDefault(binding?.node) && !importBindingIsTypeOnly(binding)
    ? globalProxyNameFromImportSource(binding?.importSource, packages) : null;
}

export function isMutatedGlobalSlot(adapter, key) {
  return !!key && !!adapter?.isMutatedStatic?.('globalThis', key);
}

// does a usage meta name a global slot the file itself writes? such a read is DEOPTED - it stays
// verbatim on the live binding so the runtime serves what the user's writes left there. the
// question is about the NAME, so it is asked here once: spelled per emitter it drifted, one of
// them additionally gating on the node shape, which narrows a BAIL-safe verdict
export function isDeoptedGlobalSlotRead(meta, adapter) {
  return meta?.kind === 'global' && isMutatedGlobalSlot(adapter, meta.name);
}

// ... and the debug-warn that reports it, single-sourced beside the predicate so all three
// emitters say the identical thing (it was spelled three times, once per emitter). WHY the name is
// deopted comes from the set: a prototype receiver whose member could not be named taints the whole
// name exactly as a slot write does, and reporting that one as a slot write named an edit the
// source never made
export function mutatedSlotLeftNativeWarning(name, mutatedSet = null) {
  return mutatedSet?.has(`${ name }.prototype.${ MUTATED_MEMBERS_UNKNOWN }`)
    ? `\`${ name }.prototype\` has a member written under a key this pass cannot read - the name is left native`
    : `\`${ name }\` is written in this file (slot mutation) - the name is left native`;
}

// a node-keyed memo scoped to the plugin INSTANCE that asked. the verdicts cached behind it are
// method- and resolver-dependent, so a plain node key lets two instances over ONE tree replay each
// other's answers - and the replay direction that matters is the unsafe one: usage-global resolves
// under "inject if it MIGHT be needed", which usage-pure must never inherit for a rewrite it can
// only make on certainty. keyed by the adapter, the one per-instance object carrying both
export function createInstanceNodeCache() {
  const perAdapter = new WeakMap();
  function forAdapter(adapter) {
    let cache = perAdapter.get(adapter);
    if (!cache) perAdapter.set(adapter, cache = new WeakMap());
    return cache;
  }
  return {
    get(adapter, node) { return forAdapter(adapter).get(node); },
    has(adapter, node) { return forAdapter(adapter).has(node); },
    set(adapter, node, value) { forAdapter(adapter).set(node, value); },
  };
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

// the pristine proxy surface an operand names, or null. a branch the walker already
// substituted (`_globalThis`) is the same surface - the minted import's hint says which
// global it holds
export function proxySurfaceIdentifier(node, { adapter, injectorState }) {
  const inner = peelTransparentExpr(node);
  if (inner?.type !== 'Identifier') return null;
  return isPristineProxyGlobal(adapter, inner.name)
    || POSSIBLE_GLOBAL_OBJECTS.has(injectorState?.getPureImport?.(inner.name)?.hint) ? inner : null;
}

// a selecting init whose EVERY LIVE branch lands on the same pristine proxy surface
// (`c ? globalThis : self`): the claim extracts like a plain proxy receiver and the
// discarded init drops whole - no branch diverges, nothing observable dies with it
export function allProxySelectingInit(node, { adapter, injectorState }) {
  const stack = [{ node, branch: false }];
  while (stack.length) {
    const { node: raw, branch } = stack.pop();
    const inner = peelTransparentExpr(raw);
    if (inner?.type === 'ConditionalExpression') {
      // an SE-bearing test must keep the destructure (the mirror's shape) - the extraction
      // would discard the init and its effect with it
      if (mayHaveSideEffects(inner.test)) return false;
      stack.push({ node: inner.consequent, branch: true }, { node: inner.alternate, branch: true });
      continue;
    }
    if (inner?.type === 'LogicalExpression' && inner.operator !== '&&') {
      // a proxy surface DECIDES a `||` / `??` on its own - an object is always truthy and
      // never nullish, so the right operand never evaluates and dies with the init. a LEFT that is
      // itself an all-proxy selection decides the same way, at every depth (`(globalThis ?? {}) ?? {}`)
      if (allProxySelectingInit(inner.left, { adapter, injectorState })) continue;
      stack.push({ node: inner.left, branch: true }, { node: inner.right, branch: true });
      continue;
    }
    // a chain ASSIGNMENT is transparent to a BRANCH's verdict: what the selection yields is
    // the value it stores (`c ? (q = globalThis) : (w = globalThis)`). a BARE write init is
    // not a selection at all and keeps its own channels
    let value = inner;
    if (branch) {
      while (value?.type === 'AssignmentExpression' && value.operator === '=') value = peelTransparentExpr(value.right);
    }
    if (!proxySurfaceIdentifier(value, { adapter, injectorState })) return false;
  }
  return true;
}

// the surface an all-proxy selecting init reads - its first branch's pristine root
export function firstProxyBranch(node) {
  let inner = peelTransparentExpr(node);
  for (let key = proxySelectingBranchKey(inner); key; key = proxySelectingBranchKey(inner)) {
    inner = peelTransparentExpr(inner[key]);
  }
  return inner;
}

// which branch a SELECTING node yields first - the ternary's consequent, the `||` / `??` left.
// `&&` names none: its left is the test, not a value the selection settles on
export function proxySelectingBranchKey(node) {
  if (node?.type === 'ConditionalExpression') return 'consequent';
  if (node?.type === 'LogicalExpression' && node.operator !== '&&') return 'left';
  return null;
}

// ambient declarations (`declare class X`, `declare function X`, `declare const X`,
// `declare module X`, `declare enum X`, TSDeclareFunction, TSDeclareMethod, type aliases,
// interfaces) - elided by tsc before runtime; references resolve to the global. estree-toolkit
// and babel scope trackers register the binding anyway; callers filter via this predicate.
// Flow spells its ambient class and function as node types of their own rather than as a flag,
// and the shape they name is the same one, so they answer here too
export function isAmbientTypeDeclaration(node) {
  if (!node) return false;
  if (node.type === 'TSDeclareFunction' || node.type === 'TSDeclareMethod') return true;
  if (node.type === 'DeclareClass' || node.type === 'DeclareFunction') return true;
  if (node.type === 'TSInterfaceDeclaration' || node.type === 'TSTypeAliasDeclaration') return true;
  if (isTypeOnlyImportEquals(node)) return true;
  if (node.declare === true) return true;
  return false;
}

// TS elides a namespace that emits NO runtime value (empty, or only type members /
// non-instantiated nested namespaces) - `namespace N { export type T = x }` produces no JS, so
// a same-named reference resolves to the GLOBAL and the polyfill MUST fire. only an
// INSTANTIATED namespace (>=1 value member) lowers to the `var N; (function(N){...})(N||...)`
// IIFE that shadows the global. conservative in the SAFE direction: an unrecognised member
// counts as value-emitting so an ambiguous namespace stays a shadow (suppress polyfill = the
// pre-existing direction); the opposite error would rewrite a real namespace's ctor to the
// polyfill. `namespace A.B {}` (qualified id) lowers A iff its innermost block is instantiated
function tsModuleIsInstantiated(node) {
  let { body } = node;
  while (body?.type === 'TSModuleDeclaration') body = body.body;
  const stmts = body?.type === 'TSModuleBlock' ? body.body : null;
  if (!stmts?.length) return false;
  return stmts.some(stmt => {
    const decl = unwrapExportedDeclaration(stmt);
    switch (decl?.type) {
      case undefined:
      case 'TSInterfaceDeclaration':
      case 'TSTypeAliasDeclaration': return false;
      // a `const enum` is fully inlined by tsc and emits no runtime member, so it does NOT
      // instantiate the enclosing namespace (a regular `enum` does); mirrors the type-only cases
      case 'TSEnumDeclaration': return !decl.declare && !decl.const;
      case 'TSModuleDeclaration': return !decl.declare && tsModuleIsInstantiated(decl);
      default: return !decl.declare;
    }
  });
}

// declarations that introduce a runtime binding the plugin must respect as a shadow:
//  - value-mode `import X = require(...)` / `import X = NS.Y`
//  - `enum X {}` / `const enum X {}` (no `declare`) - regular emits IIFE; const enum
//    references inlined by tsc, plugin must NOT rewrite them to a polyfill
//  - INSTANTIATED `namespace X {}` (no `declare`, >=1 value member) - emits IIFE; an empty /
//    type-only namespace is elided by tsc, so it is NOT a runtime shadow
// excludes ambient forms (`declare enum/namespace`, `import type X = require()`) - those
// have no runtime emission, references resolve to the global, polyfill should fire
function isTSRuntimeBindingDeclaration(node) {
  if (!node?.id) return false;
  if (node.type === 'TSImportEqualsDeclaration') return !isTypeOnlyImportEquals(node);
  if (node.type === 'TSEnumDeclaration') return !node.declare;
  if (node.type === 'TSModuleDeclaration') return !node.declare && tsModuleIsInstantiated(node);
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
// wrap in `.body.body` (BlockStatement) - and ONLY they do: a loop, a catch clause or a labeled
// statement also holds a block at `.body`, but that block is its own anchor, and reading it off
// the statement let a use in the statement's HEAD see what the block declares. a SwitchStatement's
// body is ONE block scope spanning every case, so its host statements are all cases' consequents
// flattened - a braceless `enum X {}` in any case shadows the global for a use in that or a
// fall-through case. returns null when the node has no host-able body
export function getDirectStatementBody(node) {
  if (!node) return null;
  if (Array.isArray(node.body)) return node.body;
  if (FUNCTION_LIKE_NODE_TYPES.has(node.type) && Array.isArray(node.body?.body)) return node.body.body;
  if (Array.isArray(node.cases)) return node.cases.flatMap(switchCase => switchCase.consequent ?? []);
  return null;
}

// scan a scope-anchor node for direct TS-runtime declarations (TSEnumDeclaration,
// TSModuleDeclaration, TSImportEqualsDeclaration). returns a Set of names cached per
// anchor node. covers Program, BlockStatement, TSModuleBlock, StaticBlock, function/method
// bodies - i.e. anywhere a `enum X {}` / `namespace X {}` could shadow a global
function getTSRuntimeBindings(scopeNode) {
  // cache FIRST: `getDirectStatementBody` flattens a SwitchStatement's cases into a fresh array,
  // and this runs on every ancestor of every `hasBinding` query of both adapters
  let cached = tsRuntimeBindingsCache.get(scopeNode);
  if (cached) return cached;
  const body = getDirectStatementBody(scopeNode);
  if (!body) return null;
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

// a parameter property (`constructor(private Map: T)`) declares its name in the constructor's own
// scope, and neither parser's scope tracker registers it - the accessibility wrapper is a TS node
// both of them walk past. A body read of that name therefore falls through to the global, which
// `usage-pure` answers by substituting the polyfill OVER the caller's argument. Kept out of the
// statement scan above because its reach is narrower: a statement declaration shadows the whole
// subtree, this one does not reach the decorators (see the climb)
const parameterPropertyNamesCache = new WeakMap();

function getParameterPropertyNames(scopeNode) {
  let cached = parameterPropertyNamesCache.get(scopeNode);
  if (cached) return cached;
  if (!Array.isArray(scopeNode?.params)) return null;
  cached = new Set();
  for (const param of scopeNode.params) {
    if (param?.type !== 'TSParameterProperty') continue;
    const target = param.parameter?.type === 'AssignmentPattern' ? param.parameter.left : param.parameter;
    const name = tsRuntimeBindingName(target);
    if (name) cached.add(name);
  }
  parameterPropertyNamesCache.set(scopeNode, cached);
  return cached;
}

// walk path's ancestor chain checking each anchor body for TS runtime declarations.
// covers `function f() { enum Map { A } new Map() }` (Map shadows global from inside f),
// `namespace Outer { namespace Map {} new Map() }` (TSModuleBlock anchor), and similar
// block / static-block / Program / function-body cases. path-based so TSModuleBlock works
// even when the scope tracker doesn't register a scope for it
export function findTSRuntimeBindingInPath(path, name) {
  // a decorator is evaluated where the CLASS is defined, not inside the decorated function's
  // parameter scope, so a parameter property is invisible to a decorator hanging off that same
  // parameter list - the outer-scope carve-out computed member keys get for the same reason.
  // Only the parameter arm is carved out: a statement declaration around the class does shadow
  // the decorator, since the decorator really does sit inside that statement's scope.
  // which slots evaluate at definition time is the shared slot canon (`definitionTimeSlotOf`);
  // this climb asks it the binding question, the `this`-anchor walks ask it theirs
  const frames = useRegionFrames(path);
  const decoratedOwner = frames.decoratedOwner?.node ?? null;
  // a use in a function's PARAMETER LIST sees the parameter properties beside it, but nothing
  // the body declares - the same region rule the var climb and the native trackers apply
  const paramFrame = frames.paramOwner?.node ?? null;
  for (let cur = path; cur; cur = cur.parentPath) {
    if (cur.node !== paramFrame && getTSRuntimeBindings(cur.node)?.has(name)) return true;
    if (cur.node !== decoratedOwner && getParameterPropertyNames(cur.node)?.has(name)) return true;
  }
  return false;
}

// allow-list of TS type-only nodes - unknown `TS*` defaults to runtime (false positive is
// louder than silent skip). runtime-carrying wrappers (TSAsExpression, ...) stay out
const TS_TYPE_ONLY_NODES = new Set([
  'TSTypeAnnotation',
  'TSTypeParameterDeclaration',
  'TSTypeParameterInstantiation',
  'TSTypeParameter',
  'TSStringKeyword',
  'TSNumberKeyword',
  'TSBooleanKeyword',
  'TSBigIntKeyword',
  'TSSymbolKeyword',
  'TSVoidKeyword',
  'TSUndefinedKeyword',
  'TSNullKeyword',
  'TSNeverKeyword',
  'TSAnyKeyword',
  'TSObjectKeyword',
  'TSUnknownKeyword',
  'TSIntrinsicKeyword',
  'TSThisType',
  'TSArrayType',
  'TSTupleType',
  'TSUnionType',
  'TSIntersectionType',
  'TSParenthesizedType',
  'TSOptionalType',
  'TSRestType',
  'TSConditionalType',
  'TSInferType',
  'TSTypeOperator',
  'TSIndexedAccessType',
  'TSMappedType',
  'TSNamedTupleMember',
  'TSLiteralType',
  'TSTemplateLiteralType',
  'TSTypeReference',
  'TSTypeQuery',
  'TSTypePredicate',
  'TSQualifiedName',
  'TSImportType',
  'TSFunctionType',
  'TSConstructorType',
  'TSTypeLiteral',
  'TSInterfaceDeclaration',
  'TSInterfaceBody',
  'TSTypeAliasDeclaration',
  'TSPropertySignature',
  'TSMethodSignature',
  'TSIndexSignature',
  'TSCallSignatureDeclaration',
  'TSConstructSignatureDeclaration',
  'TSDeclareFunction',
  'TSDeclareMethod',
  // a body-less method's function on oxc (`m(x: T): void;` in a class, an abstract method) - the
  // signature shape babel spells TSDeclareMethod: its parameters are names in type space
  'TSEmptyBodyFunctionExpression',
  // oxc-emitted nodes Babel doesn't surface (some are subtypes of TSExpressionWithTypeArguments
  // / TSTypeReference under different names). leaving them out misses type-only contexts on
  // oxc paths, causing false-positive polyfill detection inside `class C implements Foo` etc.
  // NOTE: `TSEnumBody` is intentionally NOT here - enum members carry RUNTIME initializer
  // expressions (`A = [1,2,3].at(0)`) that need polyfill detection. Same for
  // `TSExternalModuleReference` (the `require(...)` in `import x = require(...)`)
  'TSClassImplements',
  'TSInterfaceHeritage',
  // ... and the ONE spelling babel 7 uses for both of those clauses. it appears nowhere else in
  // that dialect (a `class extends` is a plain expression, type arguments or not), so listing it
  // is what makes the two dialects answer alike: without it the heritage name falls through to
  // the expression branch, where the host climb finds the interface and erases a REFERENCE.
  // `TYPE_REFERENCE_SLOTS` has always carried it - the asymmetry between the two tables was
  // the whole defect
  'TSExpressionWithTypeArguments',
  'TSNamespaceExportDeclaration',
  'TSJSDocNullableType',
  'TSJSDocNonNullableType',
  'TSJSDocUnknownType',
]);

// Flow type-only nodes (stable naming, no forward-compat concern)
const FLOW_TYPE_ONLY_NODES = new Set([
  'TypeAnnotation',
  'InterfaceDeclaration',
  'InterfaceTypeAnnotation',
  'InterfaceExtends',
  // the other heritage clause, and the same reason its TS twin is listed: a name here is a type
  // reference, so the shadow questions must reach it. `TYPE_REFERENCE_SLOTS` already carried it
  'ClassImplements',
  'TypeAlias',
  'OpaqueType',
  'TypeParameter',
  'TypeParameterDeclaration',
  'TypeParameterInstantiation',
  'GenericTypeAnnotation',
  'StringTypeAnnotation',
  'NumberTypeAnnotation',
  'BooleanTypeAnnotation',
  'NullLiteralTypeAnnotation',
  'VoidTypeAnnotation',
  'EmptyTypeAnnotation',
  'AnyTypeAnnotation',
  'MixedTypeAnnotation',
  'ExistsTypeAnnotation',
  'SymbolTypeAnnotation',
  'BigIntTypeAnnotation',
  'UnionTypeAnnotation',
  'IntersectionTypeAnnotation',
  'NullableTypeAnnotation',
  'ArrayTypeAnnotation',
  'TupleTypeAnnotation',
  'ObjectTypeAnnotation',
  'ObjectTypeProperty',
  'ObjectTypeSpreadProperty',
  'ObjectTypeIndexer',
  'ObjectTypeCallProperty',
  'ObjectTypeInternalSlot',
  'FunctionTypeAnnotation',
  'FunctionTypeParam',
  'TypeofTypeAnnotation',
  'IndexedAccessType',
  'OptionalIndexedAccessType',
  'StringLiteralTypeAnnotation',
  'NumberLiteralTypeAnnotation',
  'BooleanLiteralTypeAnnotation',
  'QualifiedTypeIdentifier',
]);

// is `type` a TS/Flow type-only node? `Declare*` is a stable Flow prefix
export function isTypeAnnotationNodeType(type) {
  if (!type) return false;
  if (TS_TYPE_ONLY_NODES.has(type) || FLOW_TYPE_ONLY_NODES.has(type)) return true;
  return type.startsWith('Declare');
}

// the slot of a type-space node that holds a type REFERENCE - the one identifier position in type
// space that names a runtime thing the user expects to exist (`x: Map<T>` says a Map flows here,
// `typeof Set` names the constructor): a reference keeps injecting, by the established convention
// of the annotation lane, while every OTHER identifier in type space is a name the type declares
// and reads nothing. keyed by the host's TYPE, holding the slot, because the two lanes ask about
// it from opposite sides - the annotation walk holds the host and reads the slot off it, the
// identifier rule holds the child and compares its own slot
export const TYPE_REFERENCE_SLOTS = new Map([
  ['TSTypeReference', 'typeName'],
  ['TSTypeQuery', 'exprName'],
  ['TSInterfaceHeritage', 'expression'],
  ['TSExpressionWithTypeArguments', 'expression'],
  ['TSClassImplements', 'expression'],
  ['TSImportType', 'qualifier'],
  ['GenericTypeAnnotation', 'id'],
  ['InterfaceExtends', 'id'],
  ['ClassImplements', 'id'],
  ['TypeofTypeAnnotation', 'argument'],
]);

// TS type-only declarations - identifier `id` here is a type name, not a runtime reference.
// naive `isReferenced` treats it as a ref by default; polyfilling the id is pure over-injection
const TS_TYPE_DECL_TYPES = new Set([
  'TSTypeAliasDeclaration',
  'TSInterfaceDeclaration',
  'TSEnumDeclaration',
  'TSModuleDeclaration',
]);

// the NAME-position half: identifiers that name a declaration or a specifier rather than read a
// binding, on parents the structural rule below cannot place - a `type`-modified import / export
// specifier, the id of a TS declaration (an enum's and a namespace's are runtime declarations
// whose id is still a name), a type-only `import X = require(...)`. low-level form takes raw
// nodes - prefer the path-accepting variant `isTSTypeOnlyIdentifierPath` at callsites that have
// a path. `grandparent` (optional) carries the declaration-level `importKind`/`exportKind` for
// `import type { X }` / `export type { X }` forms where the flag lives on the parent declaration
// rather than on the specifier itself
function isTSTypeOnlyIdentifier(parent, parentKey, grandparent) {
  if (!parent) return false;
  if (parent.type === 'ExportSpecifier') {
    if (parent.exportKind === 'type') return true;
    return grandparent?.type === 'ExportNamedDeclaration' && grandparent.exportKind === 'type';
  }
  if (parent.type === 'ImportSpecifier') {
    if (isTypeOnlyImportKind(parent.importKind)) return true;
    return grandparent?.type === 'ImportDeclaration' && isTypeOnlyImportKind(grandparent.importKind);
  }
  if (parentKey !== 'id') return false;
  if (TS_TYPE_DECL_TYPES.has(parent.type)) return true;
  // `import type X = require(...)` - LHS of TSImportEqualsDeclaration with type modifier.
  // value-mode (no `type`) is a real runtime binding, falls through to scope-shadow handling
  return parent.type === 'TSImportEqualsDeclaration' && parent.importKind === 'type';
}

// the STRUCTURAL half: an identifier standing in type space is a NAME the type declares - a type
// parameter's name (`interface Box<Set>`), a signature's parameter (`(Set: number) => void`, a
// body-less overload's, an index signature's), a member key, a mapped key, a member segment of a
// qualified name - unless it stands in the one slot that holds a type REFERENCE, which keeps the
// user's runtime expectation and keeps injecting (a reference under `implements` is the
// established exception, erased). a COMPUTED key is no exception here: the host decides, and a
// host in type space is erased whole, so the key never evaluates - `interface I { [Map.name]: T }`
// emits nothing at all, while the same key on a class or an object literal is a real read whose
// parent is not type space and never reaches this walk. the question is asked of the qualified
// chain's ROOT segment - the further segments are names on it.
// answered by the parent's TYPE and the child's SLOT, never by an enumeration of parent shapes:
// a shape this cannot place answers runtime, the direction the injection bias wants. a reference
// naming a TYPE PARAMETER in scope (`interface Box<Set> { v: Set }`) is that parameter, never the
// global. an EXPRESSION lands here too - a computed key's member read is dispatched on the MEMBER,
// not on its root name - and for it only the host question applies: written inside something
// TypeScript erases, it evaluates never. a type-space node itself is not such an expression: the
// annotation lane dispatches its usage on the HOST path, and that lane's references keep injecting
function typeSpaceNameNotReference(path) {
  const { node } = path ?? {};
  if (!node) return false;
  if (node.type !== 'Identifier') {
    return !isTypeAnnotationNodeType(node.type) && !!erasedTypeHostAbove(path);
  }
  let cur = path;
  let parent = cur?.parentPath?.node;
  while (parent?.type === 'TSQualifiedName' || parent?.type === 'QualifiedTypeIdentifier') {
    if (cur.key === (parent.type === 'TSQualifiedName' ? 'right' : 'id')) return true;
    cur = cur.parentPath;
    parent = cur?.parentPath?.node;
  }
  // a parent outside the census means the name sits in an EXPRESSION - a computed key, a type
  // argument's operand - and then the question is whose expression it is: one written inside a
  // type-space host is erased with it and evaluates never. the census also misses the one erased
  // clause spelled by a node it does not list (babel 7's `implements` expression), which the
  // heritage climb answers
  if (!parent || !isTypeAnnotationNodeType(parent.type)) {
    return isInImplementsHeritage(cur) || !!erasedTypeHostAbove(cur);
  }
  if (TYPE_REFERENCE_SLOTS.get(parent.type) === cur.key) {
    return isInImplementsHeritage(cur) || (!!node && typeParameterInScope(cur, node.name));
  }
  return true;
}

// does this container EVALUATE the expressions it holds? then a name inside one is a runtime read
// however much type syntax stands above it. `PURE_TYPE_ERASE_STOP_TYPES` carries the class and
// program halves already; these are the member, literal and enum shapes a computed key hangs off.
// asked as a call because the member-shape sets it reads are declared further down the file
function isRuntimeExpressionHost(type) {
  return FUNCTION_LIKE_NODE_TYPES.has(type) || CLASS_FIELD_TYPES.has(type)
    || type === 'MethodDefinition' || type === 'ClassMethod'
    || type === 'ObjectExpression' || type === 'StaticBlock' || type === 'TSEnumMember';
}

// the ESTree spelling of the same members: oxc gives an abstract member its own node type where
// babel sets a flag on the ordinary one, so the fact has two spellings and the canon reads both
const ABSTRACT_MEMBER_TYPES = new Set([
  'TSAbstractAccessorProperty',
  'TSAbstractMethodDefinition',
  'TSAbstractPropertyDefinition',
]);

// `abstract` on a class MEMBER declares a shape for subclasses and emits nothing; `abstract` on
// the CLASS is a different fact entirely - a concrete member of an abstract class emits normally
// - so the flag is read on everything EXCEPT the class, which is the whole of the other side
function isAbstractClassMember(node) {
  return ABSTRACT_MEMBER_TYPES.has(node?.type)
    || (node?.abstract === true && node.type !== 'ClassDeclaration' && node.type !== 'ClassExpression');
}

// does this container VANISH from the emit? then nothing written inside it is EVER evaluated, and
// that outranks every question about what the container would otherwise do: `declare class C {
// [Map.name]: number }` holds a computed key that no engine computes. tsc confirms the emit for
// each shape - ambient class, ambient module, `declare` member, `abstract` member - carries no
// trace of the key, while the same key on a plain field is emitted verbatim
function isNonEmittedDeclarationNode(node) {
  return isAmbientTypeDeclaration(node) || isAbstractClassMember(node);
}

// the shapes a computed key is written with, and the whole subject of the question below. a
// DECLARATION node reaching a claim site is the annotation lane's anchor - the lane dispatches
// from the declarator that holds the annotation, not from anything the emit would run - and every
// ambient declaration trivially contains itself, so answering there would silence exactly the lane
// whose job is to read type references (`declare const q: typeof Map` expects Map to exist)
const EMIT_QUESTION_SUBJECT_TYPES = new Set([
  'Identifier',
  'MemberExpression',
  'OptionalMemberExpression',
]);

// the nearest ancestor that VANISHES from the emit, or null. asked of an expression rather than a
// declaration: the erasure is inherited, so a computed key arbitrarily deep inside an ambient
// module is as dead as the module's own header, and no intervening container can revive it.
// two slots inside such a declaration are NOT dead and end the climb before it starts:
//   - an ANNOTATION declares an expectation about the environment rather than reading it, which is
//     the whole point of `declare const x: typeof Map` - the injection lane reads type references
//     precisely there, and erasure of the binding does not touch that
//   - a DECORATOR is a runtime expression, and TS rejects one on an erased member outright
//     (TS1206), so there is no valid program whose emit the erasure would change
export function nonEmittedExpressionAncestor(path) {
  if (!EMIT_QUESTION_SUBJECT_TYPES.has(path?.node?.type)) return null;
  for (let current = path?.parentPath; current; current = current.parentPath) {
    const { type } = current.node ?? {};
    if (!type || isTypeAnnotationNodeType(type) || type === 'Decorator') return null;
    if (isNonEmittedDeclarationNode(current.node)) return current.node;
  }
  return null;
}

// the type-space node an EXPRESSION is written inside, or null when the expression belongs to the
// runtime tree. the climb ends at a runtime container - a class body, an object literal, a
// function, the program, or a user cast, all of which really do evaluate what they hold - so only
// a host that TypeScript erases whole answers: a member signature, a type literal, an alias, a
// body-less overload. the same walk `isInImplementsHeritage` runs, asked of the wider question
function erasedTypeHostAbove(path) {
  for (let current = path?.parentPath; current; current = current.parentPath) {
    const type = current.node?.type;
    if (!type || PURE_TYPE_ERASE_STOP_TYPES.has(type) || isRuntimeExpressionHost(type)) return null;
    if (isTypeAnnotationNodeType(type)) return current.node;
  }
  return null;
}

// the name a type parameter declares, in both dialects: an Identifier (oxc, babel 8) or a bare
// string (babel 7)
function typeParameterName(param) {
  const { name } = param ?? {};
  return typeof name === 'string' ? name : name?.name ?? null;
}

// does a TYPE PARAMETER of `name` cover this path - declared by an enclosing function, class,
// interface, alias, signature or method, by a mapped type's key or an `infer`? a type reference
// of that name names the parameter, and the parameter is no runtime binding either tracker
// registers, so every lane resolving a type-space name against the globals owes this question
export function typeParameterInScope(path, name) {
  for (let cur = path, child = null; cur?.node; child = cur, cur = cur.parentPath) {
    const { node } = cur;
    if (node.typeParameters?.params?.some(param => typeParameterName(param) === name)) return true;
    if (node.type === 'TSMappedType'
      && (typeParameterName(node.key?.type === 'Identifier' ? { name: node.key } : node.typeParameter) === name)) return true;
    // an `infer` names its parameter for the conditional's TRUE branch
    if (node.type === 'TSConditionalType' && child?.node === node.trueType
      && inferTypeParameterNames(node.extendsType)?.has(name)) return true;
  }
  return false;
}

// the names the `infer` declarations of a subtree introduce (`T extends Array<infer U>` names
// `U`), or null for none - they cover the conditional type's true branch, which the annotation
// walk descends without parents and the scope climb reaches from below
export function inferTypeParameterNames(node) {
  let names = null;
  (function visit(n) {
    if (!isASTNode(n)) return;
    if (n.type === 'TSInferType') {
      const name = typeParameterName(n.typeParameter);
      if (name) (names ??= new Set()).add(name);
    }
    walkAstChildren(n, visit);
  })(node);
  return names;
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
  return typeSpaceNameNotReference(path);
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
// the pure-package ENTRY a name is bound to by a program-root DEFAULT import (or require
// binding): `_Iterator` from '.../actual/iterator/constructor' -> 'iterator/constructor'.
// injector-FREE (a plain program walk), so census prepasses that run before any injector
// exists resolve a prior pass's minted bindings the same way the live registry would
const PURE_IMPORT_FLAVOR_SEGMENTS = new Set(['actual', 'es', 'features', 'full', 'stable']);
// the source-level half of the recognition: the entry a pure-package specifier names, or null
// when no flavor segment with an entry tail is present. package-alias agnostic - a scoped or
// aliased package's specifier still reads as pure by its flavor segment, mirroring the binding
// resolution below
export function pureImportSourceEntry(source) {
  if (typeof source !== 'string') return null;
  const segments = source.split('/');
  const at = segments.findIndex(segment => PURE_IMPORT_FLAVOR_SEGMENTS.has(segment));
  return at === -1 || at === segments.length - 1 ? null : segments.slice(at + 1).join('/');
}

// the Program node a path lives under: the climb ends where no parent path holds a node, and a
// detached path answers null
export function rootProgramOf(path) {
  let root = path;
  while (root?.parentPath?.node) root = root.parentPath;
  return root?.node ?? null;
}

// name -> the module source of the first top-level declaration binding it, in body order: a
// DEFAULT import specifier, a TS `import x = require(...)`, or a `var`-style require declarator in
// any spelling the require canon peels - none of the latter when an in-file `require` binding
// shadows the CJS import, every such alias staying opaque. ONE table per program, built on the first ask and kept on the root: the coarse
// census asks this for every call with a bare-name callee and the own-output censuses per name, and
// a scan of the whole body per ask is quadratic in (asks x top-level statements). trusted only
// while the body holds the length it was built over - the injectors splice imports into this same
// body at flush, so an ask that ever came after one rebuilds rather than answering off a stale index
const DEFAULT_IMPORT_SOURCES = new WeakMap();
export function defaultImportSourcesOf(root) {
  const body = root?.body ?? [];
  const cached = root ? DEFAULT_IMPORT_SOURCES.get(root) : null;
  if (cached && cached.length === body.length) return cached.sources;
  const sources = new Map();
  const requireShadowed = declaresRequireBinding(body);
  for (const stmt of body) {
    // `export const x = require(...)` / `export import x = require(...)`: neither the export
    // wrapper (babel@8 / oxc) nor the modifier babel@7 flags on the node changes what the local
    // binding holds, so the table reads the declaration the way the resolution canon does
    const decl = unwrapExportedDeclaration(stmt);
    if (decl?.type === 'ImportDeclaration') {
      for (const sp of decl.specifiers ?? []) {
        if (sp.type === 'ImportDefaultSpecifier' && sp.local?.name && !sources.has(sp.local.name)) {
          sources.set(sp.local.name, decl.source?.value ?? null);
        }
      }
      continue;
    }
    // TS `import x = require('...')` - the CJS-interop spelling tsc and esbuild emit; the same
    // binding question, through the canon that reads that form
    if (decl?.type === 'TSImportEqualsDeclaration') {
      const source = tsImportEqualsRequireSource(decl);
      if (source !== null && !sources.has(decl.id.name)) sources.set(decl.id.name, source);
      continue;
    }
    if (decl?.type !== 'VariableDeclaration' || requireShadowed) continue;
    for (const declarator of decl.declarations) {
      if (declarator.id?.type !== 'Identifier' || sources.has(declarator.id.name)) continue;
      const source = requireCallSource(declarator.init);
      if (source !== null) sources.set(declarator.id.name, source);
    }
  }
  if (root) DEFAULT_IMPORT_SOURCES.set(root, { length: body.length, sources });
  return sources;
}

// the pure entry a name at the program root is bound to (`_Object$defineProperty` from
// `@core-js/pure/actual/object/define-property`), asked of a PATH by the traversal stages
export function pureImportEntryOf(path, name) {
  return pureImportEntryOfProgram(rootProgramOf(path), name);
}

// the same question asked of the program NODE, for the censuses that run before any path exists
export function pureImportEntryOfProgram(root, name) {
  return pureImportSourceEntry(defaultImportSourcesOf(root).get(name) ?? null);
}

export const isDeleteTarget = parent => parent?.type === 'UnaryExpression' && parent.operator === 'delete';

// is this member path the OPERAND of a `delete`? transparent wrappers (parens as a NODE, TS
// casts, the chain wrapper) sit between them in one spelling and not the other, so the climb
// peels them - and a guard the emit already rendered sits between too (`delete (null == t ?
// void 0 : X.name)`): on the defined branch the member still IS the delete operand, so the
// climb steps through the branch it fills. single source for both emitters' claim-side gate
export function claimDeleteOperand(path) {
  let step = path;
  for (;;) {
    const up = step?.parentPath;
    if (!up?.node) return false;
    const throughBranch = up.node.type === 'ConditionalExpression'
      && (up.node.alternate === step.node || up.node.consequent === step.node);
    if (!throughBranch && unwrapRuntimeExpr(up.node) !== step.node) return isDeleteTarget(up.node);
    step = up;
  }
}
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

// a catch pattern AFTER relocation: the emitters move it off the clause into `let <pattern> = _ref;`
// at the head of the block, and a re-parse (unplugin's post pass, a sibling's output, or plain user
// code written that way) sees an ordinary declarator. its bindings are still block-scoped to that
// catch, which is what keeps the liveness question below the same one. the init must BE the clause's
// own param, so a declaration off any other value is not mistaken for one. returns the body to scan
// and the declaration to EXCLUDE from it - the relocated declaration's own binding occurrence would
// otherwise read as a reference and make every prop look observable
export function relocatedHostPattern(declaratorPath) {
  if (declaratorPath?.node?.type !== 'VariableDeclarator') return null;
  const declaration = declaratorPath.parentPath;
  const host = declaration?.parentPath?.parentPath;
  const { init } = declaratorPath.node;
  if (init?.type !== 'Identifier') return null;
  if (host?.node?.type === 'CatchClause') {
    return host.node.param?.type === 'Identifier' && init.name === host.node.param.name
      ? { body: host.node.body, skip: declaration.node } : null;
  }
  // ... and the LOOP HEAD's relocation is the same shape one host over: the head binds the minted
  // name and the pattern is the body's first statement, so a claim under it reads the same way
  if (host?.node?.type === 'ForOfStatement' || host?.node?.type === 'ForInStatement') {
    const { left } = host.node;
    const loopId = left?.type === 'VariableDeclaration' && left.declarations?.length === 1
      ? left.declarations[0].id : null;
    return loopId?.type === 'Identifier' && init.name === loopId.name
      ? { body: host.node.body, skip: declaration.node } : null;
  }
  return null;
}

// is a catch-hosted prop's `_ref`-bound rewrite OBSERVABLE? it costs an import and a dispatcher
// call, so it is worth emitting only when something can see the binding: the catch BODY reads the
// name, the prop itself reads through the receiver (`objectPatternPropNeedsReceiverRewrite` -
// default / computed), or a rest sibling makes the residual pattern exclusion-bearing. asked PER
// PROP: a sibling forcing the relocation says nothing about this one. `walkNode(root, visit)` is
// the emitter's own full-subtree walker with parents (babel `traverseFast` has no parent argument,
// so the babel side passes a path traversal) - the same injection the subsumption and class-walk
// canons take
export function catchPropRewriteObservable({ propNode, patternNode, bodyNode, localName, walkNode }) {
  if (objectPatternPropNeedsReceiverRewrite(propNode)) return true;
  if (patternNode?.properties?.some(isRestProperty)) return true;
  if (!localName || !bodyNode) return false;
  let referenced = false;
  walkNode(bodyNode, (node, parent) => {
    if (referenced || node?.type !== 'Identifier' || node.name !== localName) return;
    if (isNonReferencePosition(parent, node) || isBindingPosition(parent, node)) return;
    referenced = true;
  });
  return referenced;
}

// the per-prop liveness gate for a RELOCATED catch pattern: it dispatches as an ordinary
// declarator, so its bindings still belong to the catch and a binding the body never reads
// is not worth an import and a dispatcher call. the relocated declaration is excluded from
// the scan - its own binding occurrence would read as a reference. `walkNode(stmt, visit)`
// walks ONE statement subtree with parents; that injection is all the emitters differ by
export function relocatedCatchPropUnobservable({ declaratorPath, propNode, patternNode, localName, walkNode }) {
  const relocated = relocatedHostPattern(declaratorPath);
  if (!relocated) return false;
  return !catchPropRewriteObservable({
    propNode, patternNode, bodyNode: relocated.body, localName,
    walkNode: (root, visit) => {
      for (const stmt of root.body ?? []) if (stmt !== relocated.skip) walkNode(stmt, visit);
    },
  });
}

// `RestElement` and `SpreadElement` are equivalent for `{a, ...rest}` patterns - estree
// uses the latter, babel uses the former. helper centralises the check so destructure-
// emitter rest-detection paths stay parser-agnostic
// rest binding in either spelling. an object PATTERN uses `RestElement` on every parser and the
// `SpreadElement` arm is unreached from the pattern walks (instrumented over the fixture corpora),
// but the predicate is published and unit-locked as parser-agnostic - so the arm stays and the
// narrow single-type tests on the same decision path route through here instead
export function isRestProperty(prop) {
  return prop?.type === 'RestElement' || prop?.type === 'SpreadElement';
}

// what dropping an object LITERAL would take with it: a property whose value runs an effect, and a
// SPREAD, which reads the source's own enumerable keys and so runs whatever getters it holds. asked
// wherever a consumed level drops the literal it paired with - `exceptProp` is the paired property
// itself, whose value the consume re-spells
export function objectLiteralHoldsObservable(objectNode, exceptProp = null) {
  return (objectNode?.properties ?? []).some(prop => prop !== exceptProp
    && (isRestProperty(prop) || mayHaveSideEffects(prop.value)));
}

// does an object INIT hold a spread its consumed level would take with it? the same rule the array
// wrapper answers with `wrapperSurvives`: spreading reads the source's own enumerable keys, and no
// statement re-emits that read, so the declarator outlives the claims that read through it
export function objectInitSpreadSurvives(initNode) {
  const literal = unwrapExpressionChain(initNode);
  return literal?.type === 'ObjectExpression' && literal.properties.some(isRestProperty);
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
  return !!node && TRANSPARENT_EXPR_WRAPPER_TYPES.has(node.type);
}

// per-branch peel for fallback receivers: paren / TS / chain wrappers AND SequenceExpression
// tail (`cond ? (0, Array) : Iterator` -> Array). SE prefix preserved at apply time via
// `unwrapSequenceTail` (synth-swap replaces only the inner Identifier, prefix stays in the
// AST so `logCall()` side-effects in `(logCall(), Array)` still run). alternates the two
// peel layers until stable so mixed shapes `cond ? ((0, Array) as any) : ...` reach the leaf
// the `visited` set spans BOTH loops, so the alternation between them is guarded as a whole
export function peelFallbackBranchInner(node) {
  const visited = new Set();
  for (let prev; node !== prev;) {
    prev = node;
    node = peelSequenceTail(unwrapRuntimeExpr(node), { visited });
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
    && TRANSPARENT_EXPR_WRAPPER_TYPES.has(cur.parentPath.node.type)
    && cur.parentPath.node.expression === cur.node) {
    cur = cur.parentPath;
  }
  return cur;
}

// climb `parentPath` yielding `[parentPath, childPath]` for each step, up to the AST root. the
// canonical ancestor climb for consumers whose walk length is the SOURCE's nesting depth: a legal
// pattern nests as deep as the source says, so a fixed hop budget answers a deep-but-valid tree
// exactly as it answers an invalid one - and the budget was spelled per site with opposite failure
// modes (a silent `false` losing a polyfill at one, a build abort on legal code at the other).
// termination is structural instead: the climb ends at the root, and the visited set covers the only
// way a parent chain can run forever - a cyclic tree from a foreign plugin - by ending the climb so
// the consumer answers with its own bail
function * ancestorPathSteps(path) {
  const visited = new Set();
  for (let cur = path; cur?.parentPath; cur = cur.parentPath) {
    if (visited.has(cur.node)) return;
    visited.add(cur.node);
    yield [cur.parentPath, cur];
  }
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
    node = peelSequenceTail(unwrapRuntimeExpr(node), { visited });
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

// does an object pattern spell SEVERAL keys with effects, claimed or not? native runs key, read, key,
// read, so every claim segments at its own key even beside a key nobody claims - the count both
// emitters interleave by. never with a rest: it gathers by exclusion and takes no segment
export function patternHasSeveralSeKeys(pattern, threshold = 2) {
  const props = pattern?.type === 'ObjectPattern' ? pattern.properties : [];
  return props.every(item => !isRestProperty(item))
    && props.filter(item => computedKeyHasSideEffects(item)).length >= threshold;
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

// one member of a discarded container: a NESTED container recurses (re-emitting the whole literal
// would rebuild it for nothing), anything else is pushed when it carries an effect - the same
// push-if-observable rule the sequence prefix uses
function collectContainerMemberSideEffect(node, out, rescue) {
  if (node?.type === 'ObjectExpression' || node?.type === 'ArrayExpression') {
    collectFoldedReceiverSideEffects(node, out, rescue);
  } else if (mayHaveSideEffects(node)) out.push(node);
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
// a sequence TAIL and a computed KEY are effects like any other here: the discard runs them both
// `chainAssignAt` (a `{ at: null }` box) switches the RECEIVER-SPINE chain-assignment from
// pushed-whole to position-recorded: the static-collapse emit re-emits the assignment itself via
// `prependChainAssignmentEffect`, so the harvest must EXCLUDE it but record its eval slot. threaded
// only down the receiver spine (object / sequence-tail), NOT into computed keys / `+` / template
// operands - a chain-assign buried in a KEY is a discarded value, pushed whole. omitted (null) keeps
// the assignment pushed whole (the `in`-fold / general discard, which re-emits nothing separately)
export function collectFoldedReceiverSideEffects(node, out = [], rescue = null, chainAssignAt = null) {
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
      collectFoldedReceiverSideEffects(cur.expressions.at(-1), out, rescue, chainAssignAt);
      break;
    case 'MemberExpression':
    case 'OptionalMemberExpression':
      collectFoldedReceiverSideEffects(cur.object, out, rescue, chainAssignAt);
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
    // a CONTAINER literal is discarded WHOLE by the static-container collapse (`{ k: { keys } } =
    // { k: Object, x: eff() }` becomes `keys = _Object$keys`), so every effect it carries goes with
    // it - in a sibling member as much as in the consumed one. walk members in source-eval order:
    // an object's computed key evaluates before its value, and elements left to right
    case 'ObjectExpression':
      for (const prop of cur.properties) {
        if (prop.computed) collectContainerMemberSideEffect(prop.key, out, rescue);
        collectContainerMemberSideEffect(prop.type === 'SpreadElement' ? prop.argument : prop.value, out, rescue);
      }
      break;
    case 'ArrayExpression':
      for (const element of cur.elements) {
        collectContainerMemberSideEffect(element?.type === 'SpreadElement' ? element.argument : element, out, rescue);
      }
      break;
    // a branching receiver is discarded WHOLE, exactly like a sequence prefix: the test always runs
    // and the taken branch's effects go with the value. pushing the branch NODE (not its parts) keeps
    // each side conditional - re-emitting an operand alone would run it unconditionally. without this
    // the fold ERASED the operand: `'flat' in (arr || (log.push('x'), [1]))` printed a bare `true`
    case 'ConditionalExpression':
    case 'LogicalExpression':
      if (mayHaveSideEffects(cur)) out.push(cur);
      break;
    case 'AssignmentExpression':
      // receiver-spine chain-assign under position-mode: record its eval slot (the emit re-emits it),
      // else push whole (a discarded assignment value)
      if (chainAssignAt && chainAssignAt.at === null) chainAssignAt.at = out.length;
      else out.push(cur);
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
  const callee = peelSequenceTail(unwrapRuntimeExpr(node.callee), { step: unwrapRuntimeExpr });
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

// true when evaluating a zero-arg IIFE is observably pure, so DROPPING the whole call loses no side
// effect. `peelZeroArgIifeReturn` strips a body prefix / arg effects to expose the return shape -
// fine for usage-global, which keeps the node in place. usage-pure RELOCATES a computed key by
// removing the key node, so it may peel an IIFE key only when this confirms the args, callee prefix
// and body carry no effects. shapes mirror the peel above (it gates the caller, so structure is valid)
export function zeroArgIifeSideEffectFree(node) {
  if (node?.type !== 'CallExpression' && node?.type !== 'OptionalCallExpression') return false;
  if (!(node.arguments ?? []).every(exprSideEffectFree)) return false;
  // an effectful prefix refuses the descent, and the sequence node it stops on fails the callee
  // type check below - the same `false` the hand-written loop returned from inside itself
  const callee = peelSequenceTail(unwrapRuntimeExpr(node.callee), {
    step: unwrapRuntimeExpr,
    onPrefix: expressions => expressions.slice(0, -1).every(exprSideEffectFree),
  });
  if (callee?.type !== 'ArrowFunctionExpression' && callee?.type !== 'FunctionExpression') return false;
  const { body } = callee;
  if (body?.type !== 'BlockStatement') return exprSideEffectFree(body);
  const stmts = body.body ?? [];
  for (let i = 0; i < stmts.length - 1; i++) {
    if (stmts[i]?.type !== 'ExpressionStatement' || !exprSideEffectFree(stmts[i].expression)) return false;
  }
  return exprSideEffectFree(stmts.at(-1)?.argument);
}

// an expression is observably pure if it has no side effects, OR is itself a droppable pure zero-arg
// IIFE - a nested `(() => (() => 'x')())()` evaluates purely even though each CallExpression alone
// reads as effectful. bounded recursion: the nested IIFE is strictly smaller
function exprSideEffectFree(node) {
  return !mayHaveSideEffects(node) || zeroArgIifeSideEffectFree(node);
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
  // eslint-disable-next-line no-restricted-syntax -- perf: AST hot path, plain objects
  for (const key in node) {
    const value = node[key];
    if (Array.isArray(value)) {
      for (const v of value) if (bodyHasParamReference(v, paramNames)) return true;
    } else if (bodyHasParamReference(value, paramNames)) return true;
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
        return identifierReferencedInSubtree(node.right, name) || paramPatternReadsValue(node.left, name);
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
        return (node.computed && identifierReferencedInSubtree(node.key, name)) || paramPatternReadsValue(node.value, name);
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
      .every(param => !patternBindsName(param, paramName))));
    if (visible.size !== paramNames.size) return visible.size !== 0 && paramReboundInBody(node, visible);
  }
  // eslint-disable-next-line no-restricted-syntax -- perf: AST hot path, plain objects
  for (const key in node) {
    const value = node[key];
    if (Array.isArray(value)) {
      for (const child of value) if (paramReboundInBody(child, paramNames)) return true;
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
// emitters (babel `liftSEPrefixSwap`, the unplugin drain's memo-receiver
// peel) so every SE layer's preceding expressions lift instead of only
// the outermost. without recursion, inner se2() silently elides under the rewrite. peel
// parens + TS expression wrappers (`as` / `satisfies` / `!` / chain) so SE through casts
// (`(logCall(), R) as any`) lifts the same as bare SE - otherwise the prefix gets dropped
// when the declarator is flattened. returns `{ prefix: Node[], tail: Node }`
// descend a comma-sequence to the value it evaluates to - its TAIL, repeatedly. the one spelling of
// that descent: it used to be hand-written at a dozen sites that agreed on the walk and disagreed on
// everything around it (whether an empty sequence bails or dereferences `undefined`, whether the step
// re-unwraps, and whether a self-referential tail spins forever - only two of them carried the guard).
// `step` is the per-hop unwrap the caller needs on the tail (runtime wrappers / parens / its own
// transparent peel); `onPrefix` sees the whole expression list of each hop and returning `false` from
// it stops the descent on the current node, which is how a caller that must REFUSE an effectful prefix
// reports it. `visited` is accepted so a caller whose outer loop alternates with this one guards the
// whole alternation with a single set
export function peelSequenceTail(node, { step = null, onPrefix = null, visited = new Set() } = {}) {
  while (node?.type === 'SequenceExpression' && node.expressions.length) {
    if (onPrefix && onPrefix(node.expressions) === false) return node;
    const tail = node.expressions.at(-1);
    if (visited.has(tail)) return node;
    visited.add(tail);
    node = step ? step(tail) : tail;
  }
  return node;
}

export function peelNestedSequenceExpressions(node) {
  const prefix = [];
  // a single-element sequence carries no prefix to harvest, so the descent stops ON it rather
  // than stepping through - the caller's `tail` stays that node, as it did before the canon
  const tail = peelSequenceTail(unwrapRuntimeExpr(node), {
    step: unwrapRuntimeExpr,
    onPrefix(expressions) {
      if (expressions.length < 2) return false;
      for (const e of expressions.slice(0, -1)) prefix.push(e);
    },
  });
  return { prefix, tail };
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
  return peelSequenceTail(unwrapRuntimeExpr(node), { step: unwrapRuntimeExpr });
}

// ONE sequence level's tail, the value a bare `(eff(), x)` root hands on. a NESTED sequence
// returns null: that is where the value canon stops for the routes that ask about a bare root,
// so its value stays unproven and the guard over it lives (`(d++, (c++, globalThis))?.Map.name`).
// through a kept WRITE the store makes the value known and the descent continues
// (`(k = (c++, (c++, globalThis.self)))?.self` erases)
export function singleSequenceTail(node, { nested = false } = {}) {
  const core = unwrapRuntimeExpr(node);
  if (core?.type !== 'SequenceExpression' || !core.expressions?.length) return null;
  const tail = unwrapRuntimeExpr(core.expressions.at(-1));
  if (!nested) return tail?.type === 'SequenceExpression' ? null : tail;
  return peelSequenceTail(tail, { step: unwrapRuntimeExpr });
}

// the kept-sequence guard boundary that stop defines: a NESTED sequence value stays unproven, so
// a live `?.` reading it keeps its guard - the kept-guard channels own the shape - while a
// single-level spelling proves through the tail and erases like the bare twin. THE predicate an
// erase / collapse verdict asks before consuming an optional over a sequence-spelled receiver
export function nestedSequenceValueSpelling(node) {
  const core = unwrapRuntimeExpr(node);
  return core?.type === 'SequenceExpression' && !!core.expressions?.length
    && singleSequenceTail(core) === null;
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
function isPatternTargetSlot(pn, cn) {
  if (pn.type === 'ArrayPattern') return pn.elements?.includes(cn);
  if (pn.type === 'RestElement' || pn.type === 'SpreadElement') return pn.argument === cn;
  if (pn.type === 'ObjectProperty' || pn.type === 'Property') return pn.value === cn;
  if (pn.type === 'ObjectPattern') return pn.properties?.includes(cn);
  return pn.type === 'AssignmentPattern' && pn.left === cn;
}

export function bareAssignmentPatternLeafPath(path) {
  let hops = 0;
  for (const [parent, cur] of ancestorPathSteps(peelTransparentExprAncestorPath(path))) {
    if (!parent.node) break;
    hops++;
    if (isPatternTargetSlot(parent.node, cur.node)) continue;
    // the FIRST hop out of the leaf must be a pattern slot - anything else means the identifier
    // never sat in a pattern at all
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

// true when ObjectPattern at `path` sits at function-parameter position. walks up through
// AssignmentPattern.left / ArrayPattern / RestElement.argument / ObjectProperty.value /
// ObjectPattern.properties wrappers until a function-like owner appears or a non-wrapper
// breaks the chain. realistic nesting < 8 hops, but generated code goes deeper and the depth is
// the SOURCE's - the shared climb ends on the tree, not on a budget
export function isFunctionParamDestructureParent(path) {
  if (!path) return false;
  for (const [parent, cur] of ancestorPathSteps(path)) {
    const { node } = parent;
    if (!node) return false;
    if (FUNCTION_LIKE_NODE_TYPES.has(node.type)) return true;
    // a wrapper stays transparent only while the node we came from fills its TARGET slot - the
    // same membership the assignment-position climb asks, so the two spell it once. what the
    // slot test rejects here: `AssignmentPattern.right` (`{x: ({y}=Z)} = src` is a default value,
    // not param shape), a RestElement slot other than `.argument`, an ObjectProperty `.key`
    // (`{[k]: x}` with a pattern as the key is not a parameter shape), and an ObjectPattern
    // reached from anywhere but `.properties`
    if (!isPatternTargetSlot(node, cur.node)) return false;
  }
  return false;
}

// ObjectPattern prop value is a synth-swap eligible binding: `{key}` / `{key: bound}` /
// `{key = D}` / `{key: bound = D}`. rejects nested patterns (`{key: {a}}`) and rest -
// those don't fit the synth-swap receiver substitution model. shared between babel-plugin's
// `handleParameterDestructure` and the unplugin's param destructure route.
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

// a prop whose VALUE is a nested ObjectPattern (`{ Array: { from } }`, peeling an `= {}` default). such a
// pattern is owned by the nested mirror (`buildNestedParamSynthPlan`), which replaces the WHOLE receiver
// default - flat synth-swap / body-extract / inline-default fallbacks must DEFER to it, never race it
export function objectPatternHasNestedValue(objectPattern) {
  return objectPattern.properties.some(p => {
    const value = p.value?.type === 'AssignmentPattern' ? p.value.left : p.value;
    return value?.type === 'ObjectPattern';
  });
}

// synth-swap rewrite emits `{ key: value, ... }` reconstructed from ObjectPattern properties; a
// property that cannot be losslessly replayed as that literal forces a bail:
// - a NON-computed key must name a slot the literal can clone verbatim - `plainSynthKeyName`, which
//   covers Identifier, string and NUMERIC spellings alike (`{ 0: x }` and `{ '0': x }` read one slot)
// - a computed Identifier key (`[k]`) is replayable unless `k` is bound by THIS pattern: the literal
//   evaluates the key before the pattern binds, so `{ of, [of]: x }` would read the wrong `of`
// - any other computed key is replayable once its name folds statically: an effect-FREE key
//   (`['from']` / [`from`]) clones into the literal, an effect-BEARING one mirrors through the
//   resolved name while its prefix stays on the pattern and runs once
// - RestElement / SpreadElement have no literal-prop equivalent
// a NESTED-value prop is owned by the nested mirror and declines here, see above.
// callers bail to inline-default / native when this check fails. shared between babel-plugin and
// unplugin; accepts both Babel `ObjectProperty` and ESTree `Property` node types
export function isSynthSimpleObjectPattern(objectPattern) {
  let bound = null;
  // a NESTED-value prop (`{ Array: { from } }`) belongs to the nested mirror (it replaces the WHOLE
  // receiver); a flat synth-swap here would race it on the same receiver and lose the nested polyfill
  if (objectPatternHasNestedValue(objectPattern)) return false;
  for (const p of objectPattern.properties) {
    if (p.type !== 'ObjectProperty' && p.type !== 'Property') return false;
    if (!p.computed) {
      // several props may name ONE slot (`{ 'z': a, 'z': b }`, `{ 0: a, '0': b }`). that is not a
      // reason to decline: the literal carries the slot once and both reads destructure the same
      // value - the entry builder collapses them. declining would hand a shape the literal expresses
      // perfectly well to the caller-lossy fallback
      if (plainSynthKeyName(p.key) === null) return false;
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
    } else if (computedKeyStaticName(p.key) === null && wksComputedKeyName(p.key) === null) {
      return false;
    }
  }
  return true;
}

// the slot a NON-computed key names, for synth purposes. a numeric key names one as much as a string
// does (`{ 0: x }` and `{ '0': x }` read the same property) and the literal clones it verbatim, so the
// synth families resolve it. the string-key resolvers stay narrower deliberately: their other consumer
// is the mutation pre-pass, which tracks NAMED statics that a numeric slot can never be
export function plainSynthKeyName(key) {
  if (key?.type === 'Identifier') return key.name;
  if (key?.type === 'NumericLiteral' || (key?.type === 'Literal' && typeof key.value === 'number')) {
    return String(key.value);
  }
  return staticStringKey(key);
}

// stable per-receiver polyfill-map key for a synth-swap property: distinguishes a computed key from a
// plain key so the two can't collide in `{ k: v, [k]: w }`. a computed Identifier keys by its variable
// name (`[k]`); a computed string / template literal keys by its QUOTED static value (`["from"]`) so it
// can't collide with a same-named computed Identifier. shared so babel-plugin and unplugin key identically
export function synthSwapPropKey(prop) {
  if (!prop.computed) return plainSynthKeyName(prop.key);
  if (prop.key.type === 'Identifier') return `[${ prop.key.name }]`;
  // a direct wks key slots under the `@@` notation - it can never collide with a string
  // fold (`['Symbol.iterator']` quotes) or a bound-identifier slot (`[k]`)
  const wks = wksComputedKeyName(prop.key);
  if (wks !== null) return `[@@${ wks }]`;
  const staticName = computedKeyStaticName(prop.key);
  // an UNRESOLVABLE computed key (`[window.k]`) names NO slot: stringifying its null minted
  // a "[null]" sentinel that read as a bound-identifier slot downstream (admitting the key
  // into a synth literal, where later-key-wins let the raw read overwrite a polyfilled
  // sibling and the key evaluated twice) - and collided across DIFFERENT unresolvable keys
  return staticName === null ? null : `[${ JSON.stringify(staticName) }]`;
}

// the SLOT a pattern property names, for synth purposes; null when nothing static resolves. ONE fold
// answers every question the synth families ask - which slot the prop names (so duplicate spellings
// collapse onto it), whether it is replayable at all, and whether the literal can clone the key or
// has to spell the resolved name instead
export function synthSlotName(prop) {
  return prop.computed ? computedKeyStaticName(prop.key) : plainSynthKeyName(prop.key);
}

// ... and the same slot asked WITHOUT the fold: a walk that CONSUMES the prop drops whatever the key
// evaluated, so only a spelling that provably evaluates nothing may answer it - a computed static
// string (`{ ['Array']: ... }` reads the slot `.Array` does), never a sequence tail or a concat.
// numeric keys stay in, as they do for the plain spelling (`{ 0: x }` and `{ '0': x }` are one slot)
export function spelledSlotName(prop) {
  return prop.computed ? staticStringKey(prop.key) : plainSynthKeyName(prop.key);
}

// a computed Identifier key (`[k]`) replays as the variable itself, so it names no statically known
// slot yet is still replayable - the one shape that is not just "the slot resolved"
function isComputedIdentifierKey(prop) {
  return !!prop.computed && prop.key?.type === 'Identifier';
}

// a WELL-KNOWN-SYMBOL computed key spelled directly (`[Symbol.iterator]`): the shape alone -
// scope-aware routes still gate on the fold / the Symbol static resolving, and a shadowed
// `Symbol` never registers, so a shape-keyed lookup can only MISS, never mis-substitute
export function wksComputedKeyName(keyNode) {
  return keyNode?.type === 'MemberExpression' && !keyNode.computed && !keyNode.optional
    && keyNode.object?.type === 'Identifier' && keyNode.object.name === 'Symbol'
    && keyNode.property?.type === 'Identifier' ? keyNode.property.name : null;
}

// a synth-literal builder can replay a property whose key resolves to a static slot - a plain
// Identifier / string / numeric key, or a computed key the folder reduces to a name. anything else
// (dynamic / side-effecting computed key) is skipped. shared so both emitters apply the same rule
export function isReplayableSynthKey(prop) {
  return isComputedIdentifierKey(prop) || synthSlotName(prop) !== null
    || (!!prop.computed && wksComputedKeyName(prop.key) !== null);
}

// an object / array literal built of nothing but names and literals, at any depth: a bare name may
// throw where it is unbound, but the husk a memo leaves in its slot (`{ w: _ref }`) never does
function literalOfPlainReads(node) {
  if (node.type === 'ArrayExpression') return node.elements.every(item => !item || literalOfPlainReads(item));
  if (node.type === 'ObjectExpression') {
    return node.properties.every(prop => (prop.type === 'Property' || prop.type === 'ObjectProperty')
      && !prop.computed && literalOfPlainReads(prop.value));
  }
  return node.type === 'Identifier' || PRIMITIVE_LITERAL_TYPES.has(node.type);
}

// the effects a DEAD wrapper's init still performs, in source order, or null where the wrapper cannot
// leave: an element the pattern binds nothing from runs for its effect alone, and a host that drops
// the wrapper re-emits exactly those - a spread iterates (no statement re-emits an iteration), and an
// in-slot memo WRITE (`[eff0(), _ref = eff()]`) is the memo itself, which only the declaration performs
export function discardedWrapperEffects(initNode, patternNode) {
  const core = initNode?.type === 'ArrayExpression' ? initNode : null;
  if (!core || patternNode?.type !== 'ArrayPattern') return null;
  const effects = [];
  for (const [index, element] of core.elements.entries()) {
    if (!element) continue;
    if (element.type === 'SpreadElement' || element.type === 'AssignmentExpression') return null;
    if (!mayHaveSideEffects(element) || literalOfPlainReads(element)) continue;
    // a literal that BURIES an effect (`{ w: [arr, eff()] }`) is no statement to re-emit: the husk keeps it
    if (element.type === 'ObjectExpression' || element.type === 'ArrayExpression') return null;
    const bound = patternNode.elements[index];
    if (bound && !(bound.type === 'ObjectPattern' && bound.properties.length === 0)) return null;
    effects.push(element);
  }
  return effects;
}

// which slots of this array literal hold an effect the destructure DISCARDS and a host may lift
// ahead of the declaration: those the pattern does not bind, ahead of the first slot it does. a
// slot behind that one runs after the element every claim reads and stays where it is; a spread
// cannot move at all (its iteration is the effect); a rest gathers what the pattern did not name,
// so nothing there is discarded. one decision, spliced by each emitter in its own dialect
export function leadingDiscardedEffectSlots(initNode, patternNode) {
  const core = initNode?.type === 'ArrayExpression' ? initNode : null;
  if (!core || patternNode?.type !== 'ArrayPattern') return [];
  if (patternNode.elements.some(item => item?.type === 'RestElement')) return [];
  const bound = core.elements.findIndex((item, at) => patternNode.elements[at]);
  const last = bound === -1 ? core.elements.length : bound;
  const slots = [];
  for (let at = 0; at < last; at += 1) {
    const element = core.elements[at];
    if (element && element.type !== 'SpreadElement' && mayHaveSideEffects(element)) slots.push(at);
  }
  return slots;
}

// `patternNode`: the pattern reading this level. An effect standing in a slot the pattern DISCARDS
// leaves with the lift the claim's own element triggers - the drains take a slot's prefix out only
// together with every discarded effect ahead of it - so it pins nothing there. Everywhere else it
// keeps its place in the literal, and the extraction stays behind the residual
// an extraction hoisted AHEAD of an array-wrapped declaration reads its property before the
// declaration runs - but native evaluates EVERY element of the array literal first, and only
// then reads anything off one of them. an effect-bearing NEIGHBOUR therefore pins the order
// (runtime-checked: native `g() | read at`, hoisted `read at | g()`), and the claim stays
// native. `index` is the slot the consumed pattern sits in; a non-literal init pins nothing
export function arrayWrapperNeighbourEffect(initNode, index, patternNode = null) {
  if (initNode?.type !== 'ArrayExpression') return false;
  // the slots the lift takes are `leadingDiscardedEffectSlots`' own answer - the one set every host
  // splices out, so what this predicate treats as gone is exactly what leaves
  const lifted = new Set(leadingDiscardedEffectSlots(initNode, patternNode));
  return initNode.elements.some((item, at) => at !== index && mayHaveSideEffects(item) && !lifted.has(at));
}

// does the (post-rename) pattern still spell a computed key with an effect?
export function patternKeepsEffectfulKey(patternNode) {
  let kept = false;
  walkAstNodes({
    root: patternNode,
    visit(item) {
      // both dialects: babel spells the prop `ObjectProperty`, estree `Property`
      if ((item?.type === 'Property' || item?.type === 'ObjectProperty')
        && item.computed && computedKeyHasSideEffects(item)) kept = true;
    },
  });
  return kept;
}

// a SPREAD makes every position PAST it a POSSIBLE one, never a certain one - the slot may
// hold any of the spread's own items, and a substituted binding would compute the wrong
// value. a slot strictly BEFORE it still pairs exactly
// an array-wrapper residual still COERCES every element pattern it holds - `const [{}] = [x]` throws
// on a nullish `x` - so the wrapper may only drop when each element is a HOLE (which coerces nothing)
// or one this pipeline emptied: there the extraction that emptied it performs the same coercion,
// in the same place. a rest element is neither, and keeps the wrapper by itself
export function arrayWrapperResidualDroppable(pattern, emptied) {
  if (pattern?.type === 'ArrayPattern') {
    return pattern.elements.length > 0
      && pattern.elements.every(element => element === null || wrapperElementClaimed(element, emptied));
  }
  // a wrapper may stand under a KEY (`{ pair: [{ at }] } = { pair: [arr] }`): the object level
  // leaves exactly when every property it names leaves, and a REST there gathers what the pattern
  // did not name, so it keeps the level whatever the claims took
  return pattern?.type === 'ObjectPattern' && pattern.properties.length > 0
    && pattern.properties.every(item => (item.type === 'Property' || item.type === 'ObjectProperty')
      && !item.computed && wrapperElementClaimed(item.value, emptied));
}

// ... and a residual the wrapper KEEPS still sheds its TRAILING emptied elements: an array pattern
// whose LAST element binds nothing is a shape `@babel/plugin-transform-destructuring` lowers wrong -
// `const [{ other }, {}] = [x, arr]` becomes `_objectDestructuringEmpty(x.other)`, losing the
// binding entirely - and the elements shed here coerce nothing the extraction does not coerce
// itself. only over a LITERAL init, where the shed positions still evaluate; an iterated one would
// pull fewer times. answers how many elements may go
export function arrayWrapperResidualTrailingShed(pattern, emptied) {
  if (pattern?.type !== 'ArrayPattern') return 0;
  // ... and a pattern binding NOTHING sheds nothing: the same lowering pairs a SOLE binding-free
  // element against the whole literal rather than its first element (`const [{}] = [null, x]` stops
  // throwing), so a residual that is all husk keeps the length that pairs it positionally
  if (patternBindingCount(pattern) === 0) return 0;
  let shed = 0;
  for (let at = pattern.elements.length - 1; at >= 0; at -= 1) {
    const element = pattern.elements[at];
    // a hole sheds freely; a claimed pattern only once it BINDS nothing - a sentinel is a binding,
    // and the shape the lowering miscompiles is exactly the binding-free one
    if (element !== null
      && !(wrapperElementClaimed(element, emptied) && patternBindingCount(element) === 0)) break;
    shed += 1;
  }
  return shed;
}

function wrapperElementClaimed(element, emptied) {
  // an element DEFAULT is transparent to the claim - what got claimed is the pattern under it
  let node = element;
  while (node && !emptied.has(node) && node.type === 'AssignmentPattern') node = node.left;
  // a wrapper CHAIN coerces once per level, and the extraction repeats every level it descended,
  // so an inner wrapper leaves exactly when its own elements may
  return emptied.has(node) || arrayWrapperResidualDroppable(node, emptied);
}

export function spreadShiftsIndex(elements, index) {
  const spreadAt = elements.findIndex(item => item?.type === 'SpreadElement');
  return spreadAt !== -1 && index >= spreadAt;
}

// does anything in this pattern still bind a REAL name, or is every leaf a minted sentinel?
// the whole-consume drop asks it before removing the declarator
export function hasRealBinding(root, sentinelNames) {
  const queue = [root];
  while (queue.length) {
    const node = queue.pop();
    if (!node || typeof node !== 'object' || !node.type) continue;
    switch (node.type) {
      case 'Identifier':
        if (!sentinelNames.has(node.name)) return true;
        break;
      case 'ObjectPattern':
        // both dialects reach this walk: babel spells a destructure prop `ObjectProperty`,
        // estree `Property`; a rest element pushes itself and unwraps below
        for (const item of node.properties) {
          queue.push(item.type === 'Property' || item.type === 'ObjectProperty' ? item.value : item);
        }
        break;
      case 'ArrayPattern':
        queue.push(...node.elements.filter(Boolean));
        break;
      case 'AssignmentPattern':
        queue.push(node.left);
        break;
      case 'RestElement':
        queue.push(node.argument);
        break;
      default:
    }
  }
  return false;
}

// computed-key synth-swap safety: a bare-global computed key (`[Set]` with no in-scope binding) gets
// emitted RAW into the synth literal (`{ [Set]: receiver[Set] }`), throwing ReferenceError on a target
// engine where the global is absent (ie:11). a pattern with any unbound computed key is therefore NOT
// synth-swap-safe - callers bail (param-default -> body-extract). user-local / imported computed keys
// have a binding and replay safely as `[k]: receiver[k]`. takes `scope` so it cannot fold into the
// purely-structural `isSynthSimpleObjectPattern`. `scope.getBinding` is common to babel + estree scopes
// `exempt(keyNode)`: a key the CALLER vouches for despite no scope binding yet - babel's
// injected pure-symbol keys bind at the Program-exit flush, after this gate runs
export function computedKeysAllBound(objectPattern, scope, exempt = null) {
  for (const p of objectPattern.properties) {
    if (p.computed && p.key?.type === 'Identifier' && !scope.getBinding(p.key.name)
      && !exempt?.(p.key)) return false;
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

// the other half of the same shape: the template in the QUASI slot is not a string value but the
// strings ARRAY the tag receives as its first argument, so a value resolver that reads it as the
// template literal it is spelled like answers a foreign family
export const isTaggedTemplateQuasiPosition = (parent, node) => parent?.type === 'TaggedTemplateExpression'
  && parent.quasi === node;

// structural match for MemberExpression chains rooted at Identifier / ThisExpression -
// recognises the same receiver path written at different source positions. literal property
// keys (computed-access shape: `obj['at']`, `obj[0]`) compare by value so `obj.at = x`
// and a later `obj['at']` read resolve to the same shadowed write target. transparent
// wrappers peel at every level so `(o).at` / `(o as any).at` (oxc keeps the paren node,
// TS casts survive in both parsers) match the bare `o.at` slot they read at runtime
// canonical member-shape signature, snapshotted at COLLECTION time: the for-x same-shape rule
// compares the head write target against body reads, but an emitter rewrites the head's
// object / key children in place before the body visits - a live-node structural compare then
// sees the MUTATED head and drops the match
// (one side collapsed the body read, the other stranded its raw proxy global). optionality does
// not change WHICH slot is resolved (`o?.at` reads the same `o.at` key), so it never enters the
// signature; dot (`obj.at`) and bracket (`obj['at']`) spellings of one static key produce one
// signature; a dynamic computed key folds its own shape structurally; an unrepresentable slot
// (call, template) yields null = "never matches", like the old structural compare's default
function memberShapeSignature(node) {
  node = unwrapRuntimeExpr(node);
  if (!node) return null;
  if (node.type === 'MemberExpression' || node.type === 'OptionalMemberExpression') {
    const objSig = memberShapeSignature(node.object);
    if (objSig === null) return null;
    const key = memberKeyName(node);
    // the static key is JSON-quoted: raw concatenation lets a key containing the delimiter
    // (`o['a.b']`) collide with a deeper nav (`o.a.b`) - quoting keeps signatures prefix-free
    if (key !== null) return `${ objSig }.${ JSON.stringify(key) }`;
    const propSig = memberShapeSignature(node.property);
    return propSig === null ? null : `${ objSig }[${ node.computed ? 'c' : 'p' }]${ propSig }`;
  }
  if (node.type === 'Identifier') return `i:${ node.name }`;
  if (node.type === 'ThisExpression') return 't';
  // a bigint key: babel spells it BigIntLiteral (decimal-string value), estree keeps Literal
  // with a bigint value - one signature for both (JSON.stringify throws on a bigint, and the
  // adapters' different spellings otherwise split the same written slot across the emitters)
  if (node.type === 'BigIntLiteral') return `lb:${ node.value }`;
  // babel StringLiteral/NumericLiteral vs ESTree Literal: both carry `.value`
  if (node.type === 'StringLiteral' || node.type === 'NumericLiteral' || node.type === 'Literal') {
    if (typeof node.value === 'bigint') return `lb:${ node.value }`;
    // an OBJECT value (an estree regex literal) has no faithful serialization - "never
    // matches", like the object-identity compare this signature replaced
    if (node.value !== null && typeof node.value === 'object') return null;
    return `l:${ JSON.stringify(node.value) }`;
  }
  return null;
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

// key: the for-x STATEMENT node; value: collected write-target MemberExpressions + signatures.
// a body with N identifier reads triggers `isForXWriteTarget` N times, each scanning
// up to the enclosing for-x - collecting the same set repeatedly. cache by node identity
// so the work amortizes over the body at the cost of one WeakMap lookup per read.
// the STATEMENT is the key (not its `.left`): the AST emitter may REPLACE the head node
// wholesale when rewriting it, and a left-keyed cache then misses and re-collects the
// REWRITTEN head - the statement node survives every head rewrite
const FOR_X_WRITES_CACHE = new WeakMap();

function getForXWrites(forXNode) {
  let writes = FOR_X_WRITES_CACHE.get(forXNode);
  if (!writes) {
    const nodes = [];
    collectForXWriteMembers(forXNode.left, nodes);
    // signatures snapshot the PRISTINE shapes: the first query comes from the head's own
    // write-position gate, before any emitter rewrite touches the pattern's children
    writes = { nodes, sigs: nodes.map(memberShapeSignature) };
    FOR_X_WRITES_CACHE.set(forXNode, writes);
  }
  return writes;
}

// a shape signature matches by NAME, which cannot tell a receiver REBOUND inside a nested function
// from the same free binding the for-x head writes through. the binding answers that, and only
// where it has to: the question arises exactly when the walk crossed a function boundary
function sameReceiverBinding({ node, path, forXPath, adapter }) {
  const root = runtimeChainRoot(node);
  if (root?.type !== 'Identifier') return false;
  // the adapters hand back a normalized VIEW, rebuilt per call - identity lives on the binding's
  // own declaration node. an unresolved side answers "unknown", which keeps the conservative bail
  const readBinding = adapter.getBinding(path.scope, root.name, path);
  const headBinding = readBinding && adapter.getBinding(forXPath.scope, root.name, forXPath);
  return !!readBinding?.node && readBinding.node === headBinding?.node;
}

// `for (obj.key of/in ...)` rebinds obj.key each iteration, aliasing the prototype method.
// Both the write target (bare or nested in a destructuring pattern) and matching reads in
// the body target a local write, not the inherited method - polyfilling either is wrong
export function isForXWriteTarget(path, adapter = null) {
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
  let crossedFunction = false;
  for (let current = path.parentPath; current; current = current.parentPath) {
    const parent = current.node;
    if (!parent) break;
    // function-like boundary: a nested function that REBINDS the receiver reads its own slot,
    // not the one the enclosing `for-of/in` head writes per iteration - and the name-based shape
    // match below cannot tell the two apart. so crossing is allowed, and the match beyond the
    // boundary additionally has to prove the receiver is the SAME binding. without an adapter to
    // ask, the conservative bail stands (the shape match alone would false-positive on a shadow)
    if (FUNCTION_LIKE_NODE_TYPES.has(parent.type)) {
      if (!adapter?.getBinding) return false;
      crossedFunction = true;
      continue;
    }
    if (!isForXStatement(parent)) continue;
    const writes = getForXWrites(parent);
    if (writes.nodes.includes(node)) return true;
    const sig = memberShapeSignature(node);
    if (sig === null || !writes.sigs.includes(sig)) continue;
    if (!crossedFunction || sameReceiverBinding({ node, path, forXPath: current, adapter })) return true;
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
// so downstream matchers treat `(x)` and `x` identically without probing the parser.
// sequences stay unpeeled on purpose - the effect-collecting twin is
// `unwrapParensCollectingEffects` (detect-usage/resolve.js), whose callers re-attach what it
// peels; the two must not merge
export function unwrapParens(node) {
  while (node?.type === 'ParenthesizedExpression') node = node.expression;
  return node;
}

// the roots the whole-nav ctor swap re-emits ahead of the claim: a SequenceExpression prefix
// (`(c++, _Map).prototype`) or a chain-assignment (`(n = gw, _Map).prototype` - the kept assign
// evaluates first, exactly like a sequence member)
const HARVESTABLE_NAV_ROOTS = new Set(['SequenceExpression', 'AssignmentExpression']);

// is EVERY effect a proxy nav carries one the whole-nav ctor swap can re-emit? the swap discards the
// sub-receiver text, so an effect survives only through a channel that prepends it, and
// `collectFoldedReceiverSideEffects` harvests exactly two: the root below, and the hops' own computed
// KEYS (`globalThis.self[(c++, 'Map')].prototype.has` -> `(c++, _Map).prototype.has`). an effect
// anywhere else - an IIFE root, a call mid-chain - belongs to the receiver-peel mechanism, which
// PRESERVES the shell the swap would drop, so the swap stands down there instead. gating on the ROOT
// alone left the key spelling deciding the claim: the same ctor was swapped when written `.Map` and
// read raw off the global when written `[(c++, 'Map')]`.
// the descent peels only RUNTIME-transparent wrappers, deliberately NOT `descendToChainRoot`
// (`runtimeChainRoot` carries why)
export function proxyNavEffectsHarvestable(node) {
  const root = runtimeChainRoot(node);
  return HARVESTABLE_NAV_ROOTS.has(root?.type) || !mayHaveSideEffects(root);
}

// a string is spellable as a bare IdentifierName (`from`, `$x`, `with` - reserved words are
// valid in property / member position). rejects dashes, spaces, leading digits, empties.
// Unicode-aware via the ID_Start / ID_Continue property escapes (mirrors the unplugin
// emitter's `BARE_IDENTIFIER_REGEX`)
const VALID_IDENTIFIER_NAME = /^[\p{ID_Start}$_][\p{ID_Continue}$]*$/u;
export function isValidIdentifierName(name) {
  return typeof name === 'string' && VALID_IDENTIFIER_NAME.test(name);
}

// `this`-receiver check for member-shadow detection. peels parens / TS wrappers /
// chain so `(this).X`, `(this as any).X`, `this!.X` (createParens=true or TS-source)
// reach the same outcome as bare `this.X`. shared between usage-pure dispatch (babel /
// unplugin) and usage-global usage-callback - keeping the predicate centralised avoids
// drift between those three call sites
export function isThisReceiver(node) {
  return unwrapRuntimeExpr(node)?.type === 'ThisExpression';
}

// transparent expression wrappers (paren / optional-chain / TS) - single-sourced from the canon
export function isTransparentWrapper(node) {
  return SKIPPABLE_WRAPPER_TYPES.has(node.type);
}

// SequenceExpression bail mode: stop unwrapping when preceding elements carry side effects.
// caller can't preserve them (inner resolveKey recursion, handleBinaryIn) - keep sequence intact
export function unwrapTransparentSeq(node) {
  while (node) {
    if (isTransparentWrapper(node)) {
      node = node.expression;
    } else if (node.type === 'SequenceExpression') {
      const preceding = node.expressions.slice(0, -1);
      if (preceding.some(mayHaveSideEffects)) break;
      node = node.expressions.at(-1);
    } else break;
  }
  return node;
}

// peel chain-assignment `=` chain, returning the rhs-most non-assignment node + the
// outermost assignment (evaluating it covers every nested `=` step in source). used by
// static-method dispatch to recover the actual constructor identifier from a receiver like
// `(a = Array)` / `(a = b = Array)` and to re-emit the assignment as a side effect.
// instance dispatch captures it via the `_ref = (a = Array)` memoize shape so doesn't need
// this. handles nested-with-parens shapes (`(a = (b = Array))`) by alternating paren/assign
// peel internally - safe regardless of caller's pre-unwrap, robust to babel's
// `createParenthesizedExpressions: true` option. returns null `outer` when input isn't a
// chain-assign shape
export function peelChainAssignment(node) {
  const peeled = unwrapTransparentSeq(node);
  if (peeled?.type !== 'AssignmentExpression' || peeled.operator !== '=') return { value: peeled, outer: null };
  let cur = peeled.right;
  // alternate paren-peel + chain-assign-descend to fixpoint; covers `(a = (b = X))` and
  // multi-layer paren wraps around inner `=`
  for (;;) {
    cur = unwrapTransparentSeq(cur);
    if (cur?.type !== 'AssignmentExpression' || cur.operator !== '=') break;
    cur = cur.right;
  }
  return { value: cur, outer: peeled };
}

// back-compat alias: `peelChainAssignment` already does the alternating peel internally,
// so deep-walking just extracts the value field. preserves the legacy two-function API
// for external callers
export function peelChainAssignmentDeep(node) {
  return peelChainAssignment(node).value;
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
// paren / TS wrapper is still collected once the wrapper comes off. this is a FIXPOINT loop, not
// a fixed schedule: the identity check is what ends it, and `MAX_DEPTH` only bounds a pathological
// input. every shape reached so far settles after one productive round - the following round is a
// confirming no-op - but a shape that needs a second one must not silently drop its prefix
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
// resolve a callee body to its single returned expression. a BLOCK body is accepted only when its
// statements cannot change what the return yields - today that means expression statements only.
// DECLARATIONS were accepted for a while (the value proof is really about whether the return READS
// what the block binds, and rejecting them lost the chain's static claim for the commonest block
// body there is) and the relaxation was REVERTED by measurement: it lets the buried-root claim erase
// a receiver whose block still needs a scoped `var`, and the queue has no slot for that var - the
// insert's nearest owner is the erasing claim, the caller's raw re-emit then collides with it, and
// the build aborts. reaching it again needs the span-ownership decision recorded in the queue, not
// a wider gate here
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
    const iifeReturn = peelZeroArgIifeReturn(node);
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
// receiver has its leaf OUTSIDE any harvested-SE span, a no-SE call is dropped entirely.
// an allocator-MINTED memo ref (`mintedAliasRef`) is the same redundancy through a binding: its
// single plugin-owned write already holds the substituted value (`_ref = _Map`), so the read off
// the ref IS the polyfill binding and the swap would only respell the memo idiom
export function staticFallbackSwapRedundant(receiverNode, sideEffects, { mintedAliasRef = null } = {}) {
  const direct = unwrapRuntimeExpr(receiverNode);
  if (direct?.type === 'Identifier' && mintedAliasRef?.(direct.name)) return true;
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

// the WRITE half of `getTypeArgs`: rebuild a reference-shape node carrying `params` as its type
// arguments, into whichever key the parser filled. `base` is the spread base for callers that
// swapped the node out from under the args. reading the key one way and writing it another is the
// failure this pairing exists to prevent - a clone built on the wrong key reads back as no-args
export function withTypeArgParams(node, params, base = node) {
  return { ...base, [node?.typeParameters ? 'typeParameters' : 'typeArguments']: { ...getTypeArgs(node), params } };
}

// the explicit type arguments of a CALL, wherever the spelling puts them. `f<T>()` hangs them on
// the call itself, but PARENTHESISING the instantiation makes it the callee and carries them there
// (`(f<T>)()`, `((f)<T>)()`), leaving the call slot empty - a reader that only asks the call node
// skips the substitution entirely and the return type stays generic. peel only parens / chain here:
// `unwrapRuntimeExpr` also strips `TSInstantiationExpression`, which is the node holding the args
export function getCallSiteTypeArgs(callNode) {
  const own = getTypeArgs(callNode);
  if (own) return own;
  const callee = peelMemoizeWrappers(callNode?.callee);
  return callee?.type === 'TSInstantiationExpression' ? getTypeArgs(callee) : undefined;
}

// Flow's ambient class (`declare class Sub extends Base<T>`) has no `superClass` and no
// superType* slots at all - both the parent reference and its type arguments live on the
// heritage clause. every chain walker needs the same disjunction, so it lives here instead of
// being restated per walker (which is how one walker ended up stopping at the first Flow hop)
export const heritageClause = node => node?.extends?.[0];
export const getHeritageTypeArgs = node => getSuperTypeArgs(node) ?? heritageClause(node)?.typeParameters;

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
      if (isTypeOnlyImportKind(node.importKind)) return false;
      return node.specifiers.some(s => !isTypeOnlyImportKind(s.importKind) && s.local?.name === 'require');
    // `import require = X.Y` creates a runtime binding (namespace refs / proper modules
    // both reach runtime). `import type require = ...` is tsc-elided
    case 'TSImportEqualsDeclaration':
      return !isTypeOnlyImportEquals(node) && node.id?.name === 'require';
    // `enum require {}` / `namespace require {}` bind a runtime `require` only when the declaration
    // actually emits an object: a `const enum` is tsc-inlined and an empty / type-only / const-enum-
    // only namespace is elided. delegate to the shared runtime-binding predicate so entry detection
    // (this path, consulted by the unplugin adapter) and the usage-side shadow walk
    // (`findTSRuntimeBindingInPath`, the babel adapter's path) agree. `namespace require.X {}` binds
    // the leftmost segment (`require`)
    case 'TSEnumDeclaration':
    case 'TSModuleDeclaration':
      return isTSRuntimeBindingDeclaration(node) && tsRuntimeBindingName(node.id) === 'require';
  }
  return false;
}

// how many bindings does this pattern introduce? one spelling of the count both emitters need - for
// the declaration-wide total and for the slice a single extraction consumes
export function patternBindingCount(node) {
  let count = 0;
  walkPatternIdentifiers(node, () => count++);
  return count;
}

// does THIS declarator bind `name`? the whole-pattern canon answers both spellings its id can take.
// the declarator's own node type is deliberately NOT tested - callers hand this duck-typed
// declarator shapes, and "is the host a declarator at all" is the caller's own question
export function declaratorBindsName(declarator, name) {
  const id = declarator?.id;
  return !!id && (id.type === 'Identifier' ? id.name === name : patternBindsName(id, name));
}

function declaratorsBindName(decls, name) {
  return (decls ?? []).some(d => declaratorBindsName(d, name));
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
// nodes contribute only their definition-time slots - the computed key and the decorators, per
// the shared slot canon; bodies and params are their own await scope - and estree wraps method
// functions in MethodDefinition, which carries those slots there. for-await carries its await
// as a statement flag, not an AwaitExpression node, so it needs its own match
function containsTopLevelAwait(node) {
  if (node.type === 'AwaitExpression' || (node.type === 'ForOfStatement' && node.await)) return true;
  if (FUNCTION_LIKE_NODE_TYPES.has(node.type) || node.type === 'MethodDefinition') {
    let found = false;
    walkAstChildren(node, child => {
      found ||= definitionTimeSlotOf(node, child) !== null && containsTopLevelAwait(child);
    });
    return found;
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
// the same annotation subtree. `.reset` rebuilds the cache for per-file memory determinism.
// the type-space census it climbs by is this module's own
export function createTypeAnnotationChecker() {
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
// the dead-element policy for a lifted sequence: the statement it becomes discards every value,
// so an expression with nothing to observe is a comma the source wrote rather than work it did -
// only the effects survive (`(0, se(), (0, Array))` lifts as `se();`). shared by both emitters so
// the trim canon lives once; callers pass an already-flattened expression list. an all-quiet list
// keeps its last element, leaving the caller a well-formed expression to drop on its own
export function dropDeadSequenceElements(expressions) {
  const kept = observableSequenceElements(expressions);
  return kept.length ? kept : expressions.slice(-1);
}

// the same policy for the channels that emit one statement PER element rather than one for the
// whole prefix (the nested-flatten rescue chain is the standing example, and its grouping is a
// channel rule of its own): nothing to observe means nothing to run, and an all-quiet prefix
// leaves no statement at all
export function observableSequenceElements(expressions) {
  return expressions.filter(expression => mayHaveSideEffects(expression));
}

export function mayHaveSideEffects(node) {
  if (!node) return false;
  if (SIDE_EFFECTS_CACHE.has(node)) return SIDE_EFFECTS_CACHE.get(node);
  const result = computeSideEffects(node, 0, false);
  SIDE_EFFECTS_CACHE.set(node, result);
  return result;
}

// a literal `undefined` reference or an effect-free `void X` - the statically-undefined value shape
export function isUndefinedNode(node) {
  if (node?.type === 'Identifier') return node.name === 'undefined';
  return node?.type === 'UnaryExpression' && node.operator === 'void' && !mayHaveSideEffects(node.argument);
}

// the stored-canon VALUES an emitter rendered in place this pass: for classification they
// ARE the navigation they replaced, so the guarded-read gate below does not apply - the raw
// pre-render source classified them unconditionally, and
// gating them would flip the verdict on every unguarded read form. a USER-written conditional
// never enters this set and keeps the gate (its void-0 arm is a real runtime value). WeakSet:
// nodes die with their AST, and a re-parse (the sandwich's second pass) sees fresh unmarked
// nodes - by then the reads are already claimed, so the gate's decline is vacuous there
const renderedStoredValues = new WeakSet();
// returns the node so a render site can mark in the value position it writes
export function markRenderedStoredValue(node) {
  if (node) renderedStoredValues.add(node);
  return node;
}
export function isRenderedStoredValue(node) {
  return !!node && renderedStoredValues.has(node);
}

// the branch a GUARD-shaped conditional (`test == null ? void 0 : X`, either arm order) can
// actually define - X when exactly one arm is statically undefined, null otherwise (a plain
// ternary, or one with both arms undefined, classifies as nothing). the shape every stored
// kept-nav render emits, so the follows that classify an alias's held value read through it
export function definedBranchOfGuardConditional(node) {
  if (node?.type !== 'ConditionalExpression') return null;
  const consequentUndefined = isUndefinedNode(node.consequent);
  if (consequentUndefined === isUndefinedNode(node.alternate)) return null;
  return consequentUndefined ? node.alternate : node.consequent;
}

// is this alias READ guarded against the nullish branch its guard-conditional value carries:
// it rides its own `?.` (`alias?.X` - the claim composes into that test), sits in a branch
// whose test reads the alias (`alias == null ? void 0 : alias.X`, `alias && alias.X`), or
// under a statement-level guard host with a PRE-test reading it (`if (alias) { alias.X }`,
// `while (alias) ...`, `for (; alias; ) ...` - the climb steps through the body blocks). the
// conditional's void-0 arm is a REAL runtime value - not a proxy navigation the realm
// collapse erases - so a PLAIN read observes it natively (`alias.Object` throws there) and
// classification through the defined branch must not un-throw it. branch-DIRECTION stays
// unparsed on purpose: a read in the unsafe branch classified before the gate existed too,
// and parsing test polarity here would only desync the legs on those shapes. the climb ends
// at a function boundary - an outer test does not dominate calls of an inner function
export function aliasReadGuardedAgainstNullish(path, name) {
  let prev = path?.node;
  for (let cur = path?.parentPath; cur?.node; prev = cur.node, cur = cur.parentPath) {
    const { node } = cur;
    if (SKIPPABLE_WRAPPER_TYPES.has(node.type)) continue;
    const isMemberish = node.type === 'MemberExpression' || node.type === 'OptionalMemberExpression'
      || node.type === 'CallExpression' || node.type === 'OptionalCallExpression';
    if (isMemberish) {
      if (node.optional && (node.object === prev || node.callee === prev)) return true;
      continue;
    }
    if (node.type === 'ConditionalExpression' && (node.consequent === prev || node.alternate === prev)
      && identifierReferencedInSubtree(node.test, name)) return true;
    if (node.type === 'LogicalExpression' && node.right === prev
      && identifierReferencedInSubtree(node.left, name)) return true;
    if ((node.type === 'IfStatement' || node.type === 'WhileStatement' || node.type === 'ForStatement')
      && node.test && node.test !== prev && identifierReferencedInSubtree(node.test, name)) return true;
    if (FUNCTION_LIKE_NODE_TYPES.has(node.type) || node.type === 'Program') break;
  }
  return false;
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
  // `...a` invokes `a[Symbol.iterator]` in a value position and `a`'s Proxy traps in an object
  // one - neither can be proven pure from source, and a non-iterable throws. answering it HERE
  // covers every container the spread can sit in (array / object literal, call arguments, JSX)
  // instead of each of them repeating the check; a REST element is the pattern-side shape and
  // stays a no-op wrapper below
  if (type === 'SpreadElement') return true;
  if (type === 'ArrayExpression') return node.elements.some(el => recurse(el, depth, strict));
  if (type === 'ObjectExpression') return node.properties.some(p => recurse(p, depth, strict));
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
    // the minted THROW PROBE (`(null == X ? void 0 : Y).key` - a plain read whose object is a
    // void-0-armed guard ternary) throws BY DESIGN on the guarded branch: dropping it as an
    // effect-free prefix (a re-transform / pre+post pass) erases the source's throw semantics
    if (!node.optional && node.object?.type === 'ConditionalExpression'
      && node.object.test?.type === 'BinaryExpression' && node.object.test.operator === '=='
      && (node.object.test.left?.type === 'NullLiteral' || node.object.test.right?.type === 'NullLiteral')
      && node.object.consequent?.type === 'UnaryExpression' && node.object.consequent.operator === 'void') {
      return true;
    }
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
  // `{...children}` iterates its operand exactly as a spread attribute does - mirror that arm
  // rather than treating the child as a plain expression container
  if (type === 'JSXSpreadChild') return true;
  if (type === 'JSXExpressionContainer') return recurse(node.expression, depth, strict);
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

// can a write that is textually AFTER a read still reach it? true when the read sits in a DEFERRED
// context below `stopNode` - a closure re-invoked later, or a non-static class-field initializer that
// runs at construction. an IIFE body is excluded: it runs at its definition position and stays
// straight-line. bounded at the binding's own scope, so a read in the SAME activation as the writes
// keeps its positional order. the one predicate behind both the value-union and the type narrow
export function readRunsDeferredWithin(usagePath, stopNode) {
  for (let p = usagePath?.parentPath, child = usagePath; p?.node && p.node !== stopNode; child = p, p = p.parentPath) {
    const { node } = p;
    if (FUNCTION_LIKE_NODE_TYPES.has(node.type)) {
      if (!isImmediatelyInvokedFunction(p)) return true;
      continue;
    }
    if (CLASS_FIELD_TYPES.has(node.type) && !node.static && child?.key === 'value') return true;
  }
  return false;
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
  if (TRANSPARENT_EXPR_WRAPPER_TYPES.has(node.type)) {
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

// the primitive-literal leaf types across BOTH parser spellings (babel's per-kind nodes and
// estree's single `Literal`). enumerated once: the re-reference gate, the constant-literal
// predicate, the inert-value set and the quiet-operand test below all need exactly this list,
// and hand-synced copies drift on the next parser-shape addition
export const PRIMITIVE_LITERAL_TYPES = new Set([
  'StringLiteral',
  'NumericLiteral',
  'BooleanLiteral',
  'NullLiteral',
  'BigIntLiteral',
  'RegExpLiteral',
  'Literal',
]);

// a literal operand of a minifier sequence - the `0` a minifier pads with, a string, `null` - is
// a value a statement position discards with nothing to run, so the split leaves no statement for
// it; that is also what keeps a leading string out of the Directive Prologue, where `"use strict";`
// promoted to a statement would flip a sloppy script strict. only a LITERAL is quiet here: a name
// may throw, and a function or class expression carries code of the author's that the plugin has no
// business deleting. reads through the wrappers a parse keeps (parens, TS casts, chain)
export function isQuietLiteralOperand(expr) {
  let head = expr;
  while (head && SKIPPABLE_WRAPPER_TYPES.has(head.type)) head = head.expression;
  return PRIMITIVE_LITERAL_TYPES.has(head?.type);
}

// minifier-shape detection: `ExpressionStatement > [Paren?] > SequenceExpression > [...]`
// where ANY slot (with optional Paren peel) is an `AssignmentExpression` targeting an
// ObjectPattern or ArrayPattern, or a `require(...)` call. the shape is a minifier's - statements
// collapsed into one comma sequence: `(0, ({pat} = R));` (minified tail), `(({pat} = R), use());`
// and `require("core-js/x"), b();` (comma-joined statements). the destructure-emitter gate and
// entry detection read STATEMENTS, so each would miss its operand in a slot, and removing an entry
// with its statement would drop the neighbours - the split is the one mechanism for the joined
// shape, in any slot. statement context discards every slot's value, so splitting is sound at
// any position. returns the SequenceExpression's `expressions` array on match
// (`planMinifierSequenceSplit` turns them into one statement per operand), null otherwise. peels
// both the outer wrapper and each expression's wrapper - oxc preserves ParenthesizedExpression on
// both slots, babel parser drops them, so the peel is required for cross-parser symmetry
export function getMinifierSequenceExpressions(stmt) {
  if (stmt?.type !== 'ExpressionStatement') return null;
  let expr = stmt.expression;
  while (expr?.type === 'ParenthesizedExpression') expr = expr.expression;
  if (expr?.type !== 'SequenceExpression') return null;
  return sequenceSlotsNeedSplit(expr, 0) ? expr.expressions : null;
}

// a slot hosting a NESTED SequenceExpression (`((x(), ({p} = R)), use())`) carries the
// destructure too: the split plan splits the nested operand in the same pass, so matching it
// here is what lets the outer split happen at all. the require slot reads through the entry
// canon (`isRequireCall`: `(0, require)(...)`, `require?.()`, TS-wrapped), so what the split
// promotes is exactly what `getEntrySource` then reads on its own line
function sequenceSlotsNeedSplit(seq, depth) {
  if (depth >= MAX_DEPTH) return false;
  for (let slot of seq.expressions) {
    while (slot?.type === 'ParenthesizedExpression') slot = slot.expression;
    if (slot?.type === 'SequenceExpression' && sequenceSlotsNeedSplit(slot, depth + 1)) return true;
    if (isRequireCall(slot)) return true;
    if (slot?.type !== 'AssignmentExpression') continue;
    const leftType = slot.left?.type;
    if (leftType === 'ObjectPattern' || leftType === 'ArrayPattern') return true;
  }
  return false;
}

// invoke the handlers for every statement POSITION rooted at `rootNode`, in one structural
// recursion: `onList` for each Statement-list slot, `onUnbracedSlot(hostNode, slotKey)` for each
// single-statement control-flow body. the two partition the positions - a braced body is a list
// host and never reaches `onUnbracedSlot` - so a caller wanting both never walks the tree twice.
// the `isASTNode` filter stays safe against plugin-stamped sidecar keys without a hand-curated
// skip list; `SwitchCase` holds its list at `consequent`, so that slot name is special-cased
export function forEachStatementPosition(rootNode, { onList, onUnbracedSlot } = {}) {
  function visitPositions(node) {
    if (!isASTNode(node)) {
      if (Array.isArray(node)) for (const item of node) visitPositions(item);
      return;
    }
    if (onList) {
      if (STATEMENT_LIST_HOST_TYPES.has(node.type) && Array.isArray(node.body)) onList(node.body);
      if (node.type === 'SwitchCase' && Array.isArray(node.consequent)) onList(node.consequent);
    }
    if (onUnbracedSlot) {
      for (const key of SINGLE_STATEMENT_SLOTS.get(node.type) ?? []) {
        const slot = node[key];
        if (isASTNode(slot) && !STATEMENT_LIST_HOST_TYPES.has(slot.type)) onUnbracedSlot(node, key);
      }
    }
    walkAstChildren(node, visitPositions);
  }
  visitPositions(rootNode);
}

// what a POSITION does to a value that lands in it. the escape analyses used to answer this with a
// case list each, drifting apart position by position; this is the single enumeration they both ask.
// four outcomes, and every syntactic position has exactly one:
//   CONSUMES  - evaluated here and unreachable afterwards, so a narrow taken on it stands
//   FORWARDS  - flows on unchanged; the position it lands in is what decides
//   INSPECTS  - a call argument: the CALLEE decides, per slot, so the walks ask the slot predicate
//   HANDS_OUT - reaches code this scan cannot see
// HANDS_OUT is the DEFAULT on purpose: the ways a value can be handed out are an open set no
// enumeration can finish, while the positions that consume or forward one are few and listed here.
// an unlisted position therefore costs a generic helper instead of a wrong narrow. `parentNodePath`
// is the path OF `parent` - the tagged-template test needs the position one hop above it
export const POSITION_CONSUMES = 'consumes';
export const POSITION_FORWARDS = 'forwards';
export const POSITION_INSPECTS = 'inspects';
const POSITION_HANDS_OUT = 'hands-out';

export function positionDisposition(parent, node, parentNodePath) {
  // BOTH calling conventions are live: one caller climbs a reference to its outermost transparent
  // wrapper and hands the WRAPPER as `node` (with the parent above it), another hands the raw node
  // under an unpeeled slot. normalize ONCE at the head - the node and every compared slot go
  // through the runtime-expression peel - so the two conventions answer alike on every arm; a raw
  // identity compare answered each convention on a different half of the arms, and the misses fell
  // on DIFFERENT defaults (a sequence tail read as CONSUMES kept a narrow on a value that flows
  // on; a test slot read as its else-arm over-bailed)
  node = unwrapRuntimeExpr(node);
  function inSlot(slot) {
    return unwrapRuntimeExpr(slot) === node;
  }
  switch (parent?.type) {
    // evaluated and dropped: a statement, a `for (;;)` head slot, an update that stores a NUMBER back
    case 'ExpressionStatement':
    case 'ForStatement':
    case 'UpdateExpression':
      return POSITION_CONSUMES;
    // operators reading a FACT about the value - its type, truthiness, identity, key presence. a
    // coercing one calls the value's own `valueOf` / `toString`, which reaches no further than any
    // other own-method call. `instanceof` is the exception: it invokes `RHS[Symbol.hasInstance](LHS)`
    case 'UnaryExpression':
      return POSITION_CONSUMES;
    case 'BinaryExpression':
      return parent.operator === 'instanceof' ? POSITION_HANDS_OUT : POSITION_CONSUMES;
    // a `for...in` head enumerates the RIGHT slot's KEYS without ever calling into the value
    // (CONSUMES); the LEFT is a write target this question does not model. `for...of` is NOT here:
    // it invokes the value's own iterator, which is free to yield `this` - the walks gate that
    case 'ForInStatement':
      return inSlot(parent.right) ? POSITION_CONSUMES : POSITION_HANDS_OUT;
    // the DISCRIMINANT / case TEST is compared by identity and reachable nowhere else (CONSUMES)
    case 'SwitchStatement':
      return inSlot(parent.discriminant) ? POSITION_CONSUMES : POSITION_HANDS_OUT;
    case 'SwitchCase':
      return inSlot(parent.test) ? POSITION_CONSUMES : POSITION_HANDS_OUT;
    // a branch / loop head TEST takes only the truthiness (CONSUMES); a conditional's BRANCHES
    // forward instead - the ternary's own position decides
    case 'DoWhileStatement':
    case 'IfStatement':
    case 'WhileStatement':
      return inSlot(parent.test) ? POSITION_CONSUMES : POSITION_HANDS_OUT;
    case 'ConditionalExpression':
      return inSlot(parent.test) ? POSITION_CONSUMES : POSITION_FORWARDS;
    // an untagged template string-coerces the value; a TAGGED one hands the raw value to the tag
    case 'TemplateLiteral':
      return parentNodePath?.parentPath?.node?.type === 'TaggedTemplateExpression'
        ? POSITION_HANDS_OUT : POSITION_CONSUMES;
    // every element of a sequence but the LAST is evaluated and dropped (CONSUMES); the TAIL is the
    // sequence's own value and flows on (FORWARDS) - a raw compare against a wrapped tail read it
    // as CONSUMES, keeping a narrow on a value that escapes
    case 'SequenceExpression':
      return inSlot(parent.expressions?.at(-1)) ? POSITION_FORWARDS : POSITION_CONSUMES;
    // containers and binders the value flows THROUGH, whatever slot it stands in - an array element,
    // either side of `=` (the RIGHT is the stored/whole value; a reference standing as the WRITE
    // TARGET is the callers' own pre-filter, not a value position this question models), a default's
    // right, a logical operand, a spread argument, a declarator init. the walk that can follow the
    // value continues there; the walk that cannot treats an unfollowable forward as a hand-out
    case 'ArrayExpression':
    case 'AssignmentExpression':
    case 'AssignmentPattern':
    case 'LogicalExpression':
    case 'SpreadElement':
    case 'VariableDeclarator':
      return POSITION_FORWARDS;
    // a property stores its VALUE (FORWARDS); standing in the computed KEY slot instead coerces the
    // value to a string and keeps nothing of it (CONSUMES). shorthand (`{ x }`) puts one node in
    // both slots - it stores
    case 'ObjectProperty':
    case 'Property':
      return inSlot(parent.value) ? POSITION_FORWARDS : POSITION_CONSUMES;
    // an ARGUMENT is the callee's call - the CALLEE decides, per slot (INSPECTS); the callee slot
    // itself is a read of the value, not a hand-out of it (CONSUMES)
    case 'CallExpression':
    case 'NewExpression':
    case 'OptionalCallExpression':
      return parent.arguments?.some(arg => inSlot(arg)) ? POSITION_INSPECTS : POSITION_CONSUMES;
    // reading a member OFF the value yields the member, not the value; standing in the computed KEY
    // slot coerces the value to a string. which member, and whether reading it hands a re-bindable
    // method out, is the walks' own business
    case 'MemberExpression':
    case 'OptionalMemberExpression':
      return POSITION_CONSUMES;
    default:
      return POSITION_HANDS_OUT;
  }
}

// step past the transparent wrappers standing between a chain node and whatever reads it, and
// report BOTH halves the reader needs: the node that read would see, and the path above it.
// wrappers STACK (a sealed optional nav is a paren over a ChainExpression), so each step compares
// against the wrapper just crossed - matching the original node throughout stopped at the first one
// and reported such a nav as having nothing above it at all. at the chain's ROOT a VALUE CARRIER is
// transparent the same way (`(v = globalThis).window`, `(e(), globalThis).self`): the first member
// reads exactly what the carrier hands on, which is why the downward peel (`peelChainRootValue`)
// walks straight through both. only at the root - a carrier reached AFTER a hop holds the whole
// navigation's value (`(kept = nav).X`), and what reads it consumes the store, not a hop of the chain
export function stepOverChainWrappers(child, up, atRoot = false) {
  while (up?.node) {
    if (!(SKIPPABLE_WRAPPER_TYPES.has(up.node.type) && up.node.expression === child)
      && !(atRoot && chainValueCarrier(up.node, child))) break;
    child = up.node;
    up = up.parentPath;
  }
  return [child, up];
}

// how far the member chain above this node runs, following only the OBJECT side: a node reached as
// the computed PROPERTY of the member above it is a sibling expression, not a continuation
export function memberChainEndPath({ path, unwrap = node => node }) {
  let end = path;
  for (;;) {
    const [inner, up] = stepOverChainWrappers(end.node, end.parentPath, end === path);
    const above = up?.node;
    if (above?.type !== 'MemberExpression' && above?.type !== 'OptionalMemberExpression') break;
    if (unwrap(above.object) !== unwrap(inner)) break;
    end = up;
  }
  return end;
}

// the chain END a kept probe nav feeds, or null when nothing is owed there. the two questions -
// how far the member chain runs above the nav, and whether its end is the CALLEE of a polyfilled
// dispatch (that receiver belongs to the instance channel, which renders it itself) - are the same
// ones both emitters answer, which is why the walk is written dialect-neutral: node TYPE strings
// are shared, `unwrap` peels whatever wrappers the caller's tree carries, `keyOf` is its own
// member-key reader (the dialects differ on computed keys) and `resolvesProperty` its own polyfill
// lookup. only the babel binding CALLS it: the kept-hop set this render hangs off (`keptProxyHops`)
// is built there alone, and the unplugin binding passes no `onSuppressedProxyHop` at all - its
// spine collapse reaches the same product decision by a different route, so there is no second
// caller to share this with. what the two DO share is the wrapper step, `stepOverChainWrappers`
export function keptNavChainEndPath({ path, unwrap = node => node, keyOf, resolvesProperty }) {
  const end = memberChainEndPath({ path, unwrap });
  if (end === path) return null;
  const chainEnd = unwrap(end.node);
  const above = end.parentPath?.node;
  const endKey = keyOf(chainEnd);
  if ((above?.type === 'CallExpression' || above?.type === 'OptionalCallExpression')
    && unwrap(above.callee) === chainEnd
    && endKey && resolvesProperty(endKey, end)) return null;
  return end;
}

// the NAME a forwarding position binds the value to: a declarator id (`const b = a`) or a simple
// assignment target (`b = a`, `b ||= a`). NOT a default's target: the default-VALUE slot is the ONE
// position where the two escape walks legitimately part - an object written INLINE there is
// reachable only through the default's holder, which the anonymous-holder walk follows, while a
// NAMED value keeps its own binding beside the holder, so the named walk reports the reference as
// an escaping read instead of binding it here. a coercing compound operator is excluded by the
// shared value-flow op set - it stores a converted value, not the reference
export function aliasTargetName(parent) {
  if (parent?.type === 'VariableDeclarator') return parent.id?.type === 'Identifier' ? parent.id.name : null;
  return parent?.type === 'AssignmentExpression' && VALUE_FLOW_ASSIGN_OPS.has(parent.operator)
    && parent.left?.type === 'Identifier' ? parent.left.name : null;
}

// does `parent` still physically hold `child` in one of its slots? one level only - an in-place
// rewrite (a folded call, a chain lowering, a carried-write replace) reuses parent nodes and swaps
// their slots, leaving cached reference chains pointing at parents that no longer contain the child;
// the ancestor walks verify each edge in turn, so a deep search would hide exactly the broken link
export function nodeHoldsChild(parent, child) {
  // eslint-disable-next-line no-restricted-syntax -- perf: AST hot path, plain objects
  for (const key in parent) {
    const slot = parent[key];
    if (slot === child) return true;
    if (Array.isArray(slot) && slot.includes(child)) return true;
  }
  return false;
}

// is a cached path's ancestor chain no longer the live tree's? two stale shapes, one detector:
// a parent whose node was nulled by a removal, and a CHIMERA chain - a replace reuses the path
// object for the new subtree, so a cached child path climbs into a parent whose live node no
// longer holds it (a render that replaces a subtree while CARRYING a kept user write leaves the
// write's cached chain walking edges that left the tree). both emitters' adapters ask it before
// judging a write's placement over such a chain
export function ancestorChainDetached(path) {
  for (let cur = path?.parentPath, child = path; cur; child = cur, cur = cur.parentPath) {
    if (cur.node === null || cur.node === undefined) return true;
    if (!nodeHoldsChild(cur.node, child.node)) return true;
    if (cur.node.type === 'Program') return false;
  }
  return false;
}

// the LIVE ancestry of `targetNode` under `rootNode`, as a minimal path-shaped chain
// (`{ node, parentPath }` links, root outward-null): the re-anchor for a placement judgment whose
// cached path went stale. node-identity DFS - a carried node has exactly one live position. the
// chain carries no scope and no traversal, so it serves ONLY the walks that read `.node` and
// `.parentPath` (the placement climb); a consumer needing a real path keeps its own re-anchor
export function syntheticNodeAncestry(rootNode, targetNode) {
  function descend(node, parentPath) {
    if (!isASTNode(node)) return null;
    const self = { node, parentPath };
    if (node === targetNode) return self;
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) {
        for (const el of value) {
          const found = descend(el, self);
          if (found) return found;
        }
      } else {
        const found = descend(value, self);
        if (found) return found;
      }
    }
    return null;
  }
  return rootNode === targetNode ? null : descend(rootNode, null);
}

// the statement nodes an expression can be hosted by - where a placement / order walk stops
export const STATEMENT_HOST_TYPES = new Set(['ExpressionStatement', 'VariableDeclaration', 'ReturnStatement', 'ThrowStatement']);

// classify a root that `findProxyGlobal(node, aliasCtx)` matched: true when it resolved through a
// const-alias (`g` in `const g = globalThis; g.X`) rather than by a direct global NAME. the emit-side
// collapse KEEPS an alias root verbatim (its own declaration already rewrote it to the pure global)
// and drops only the hops, whereas a direct root swaps to its pure binding. shared by both emitters
// so the keep-vs-swap decision lives in one place
export function isAliasProxyRoot(rootNode, aliasCtx) {
  return !!aliasCtx && !!rootNode && !POSSIBLE_GLOBAL_OBJECTS.has(rootNode.name);
}

// the `polyfillHint` side-channel: the ORIGINAL global name of a binding this plugin minted in
// place (`globalThis` -> `_globalThis`, `Symbol` -> `_Symbol`). it lives in two spellings that are
// one channel - on the binding record where the scope tracker owns it, and behind the adapter hook
// where an injector-managed alias has no scope entry at all - so both are always asked together.
// the binding is the CALLER's to resolve - the lookup is guarded against re-entry at some sites
// and skipped entirely at others, so this only joins the two spellings
export function bindingPolyfillHint({ binding, scope, name, adapter }) {
  return binding?.polyfillHint ?? adapter?.getBindingPolyfillHint?.(scope, name) ?? null;
}

// a GUARDED registration is one whose flow-trust the injector REFUSED - none of its fields may
// reach a consumer, so every read of an injector record passes through here. the flag is written
// at registration time; this is the read-time half, and the only place the rule is spelled
export function usableAliasInfo(info) {
  return info && !info.aliasGuarded ? info : null;
}

// the names written on this subtree's always-evaluated spine, collected ONCE per root. the proof
// below asks the same guard subtree for one name after another, and the scan is a full `for..in`
// descent - the set answers every later name for free. keyed by node, like every other index in
// this file: a new parse brings new nodes, and a rebuilt subtree is a new node too
const spineWriteNamesCache = new WeakMap();

// does the subtree contain an `=`-assignment TO `name`? judged by the written NAME, not node
// identity or positions: an AST emitter's re-visit walks REBUILT subtrees whose nodes are
// clones (fresh identity, no positions), and the caller has already proven the binding has
// exactly ONE real write - so any assignment to the name inside an earlier-evaluated slot IS
// that write (injected helper code never assigns user bindings)
// ... and the write has to sit on the subtree's always-evaluated SPINE: a write in a branch arm, a
// logical right operand, past an optional hop, in a default or in a function body may never have
// run when the guarded read does, and accepting it there narrowed a read of an undefined alias
function containsWriteTo(root, name) {
  if (!isASTNode(root)) return false;
  let names = spineWriteNamesCache.get(root);
  if (!names) spineWriteNamesCache.set(root, names = collectSpineWriteNames(root, false));
  return names.has(name);
}

// the descent itself: an always-evaluated spine, the slot rule of `evaluatesWithParent`, and every
// write target it reaches. one walk per subtree answers every name the proof above asks about
function collectSpineWriteNames(node, inChain, into = new Set()) {
  if (!isASTNode(node)) return into;
  if (node.type === 'AssignmentExpression' && VALUE_FLOW_ASSIGN_OPS.has(node.operator)) {
    const target = unwrapRuntimeExpr(node.left);
    if (target?.type === 'Identifier') into.add(target.name);
  }
  const chained = inChain || node.type === 'ChainExpression';
  // eslint-disable-next-line no-restricted-syntax -- perf: AST hot path, plain objects
  for (const key in node) {
    const value = node[key];
    if (Array.isArray(value)) {
      for (const el of value) {
        if (isASTNode(el) && evaluatesWithParent(node, key, el, chained)) collectSpineWriteNames(el, chained, into);
      }
    } else if (isASTNode(value) && evaluatesWithParent(node, key, value, chained)) {
      collectSpineWriteNames(value, chained, into);
    }
  }
  return into;
}

// is `child` evaluated whenever `parent` is - as opposed to on SOME evaluations of it (a branch
// arm, a logical right operand, anything past an optional hop, a default) or on a later one (a
// function body, an instance field's value)? `inChain`: under an estree ChainExpression every
// member / call link past the object spine is a hop the leading `?.` may short-circuit
function evaluatesWithParent(parent, key, child, inChain) {
  switch (parent.type) {
    case 'ConditionalExpression': return key === 'test';
    case 'LogicalExpression': return key === 'left';
    case 'AssignmentPattern': return key === 'left';
    case 'OptionalMemberExpression': return key === 'object';
    case 'OptionalCallExpression': return key === 'callee';
    case 'MemberExpression': return !inChain || key === 'object';
    case 'CallExpression': return !inChain || key === 'callee';
    default:
      if (FUNCTION_LIKE_NODE_TYPES.has(parent.type)) return definitionTimeSlotOf(parent, child) !== null;
      if (CLASS_FIELD_TYPES.has(parent.type)) return !!parent.static || key !== 'value';
      return true;
  }
}

// structural read-after-write proof for a READ whose node carries no source positions (an AST
// emitter re-visits rebuilt subtrees after mutation): the write provably evaluates first when
// an ancestor step enters a ternary BRANCH or a logical RIGHT operand whose always-evaluated
// GUARD slot contains the (single trusted) write - exactly the `?.`-lowering canon
// (`(_g = g = globalThis) == null ? void 0 : _g.self.X`). deliberately NARROW: a same-sequence
// slot proof would also re-follow the plugin's OWN guarded-alias emit on an idempotency
// re-run (`c ? (_ref = _globalThis, Q = _ref.Promise, _ref) : 0` - the first pass reads the
// member RAW under a ctor guard by design, and a second-pass claim would swap the ponyfill
// into the alias slot, flipping the guard and swallowing the native detached-tag TypeError).
// anything beyond the guard shapes stays unproven
function readsAfterWriteStructurally(path, writeNode) {
  const name = writeNode.left?.type === 'Identifier' ? writeNode.left.name : null;
  if (!name) return false;
  for (let cur = path; cur?.parentPath; cur = cur.parentPath) {
    const parent = cur.parentPath.node;
    const child = cur.node;
    if (!parent) break;
    if (parent.type === 'ConditionalExpression' && (parent.consequent === child || parent.alternate === child)
      && containsWriteTo(parent.test, name)) return true;
    if (parent.type === 'LogicalExpression' && parent.right === child && containsWriteTo(parent.left, name)) return true;
    if (STATEMENT_HOST_TYPES.has(parent.type)) break;
  }
  return false;
}

// descend a trusted write's RHS to the stored value: alternate the local init-peel with
// chain-assign steps (`_g = g = globalThis` stores `globalThis`; the assignment text stays
// verbatim in source). the full chain-assign canon lives in resolve.js - unreachable from
// here without an import cycle - and this alternation reaches the same fixpoint over the
// shapes a single write's RHS can carry
// the single canonical trust gate for a plain-Identifier alias write (`var _g; _g = g =
// globalThis`): the adapter surfaces the sole trusted write, the shape gate rejects
// destructure writes (they bind the name to a PROPERTY of the RHS - following the right side
// would alias the name to the whole global), and the pure arm accepts ONLY the structural
// read-after-write proof (read in a branch whose always-evaluated guard slot holds the write -
// the `?.`-lowering canon; a positional accept would drift the emitters on the AST side's
// position-less rebuilt re-visits). shared by the detection-side follow
// (`resolveVariableBindingToGlobal`) and the class-walk follow - ONE predicate, not mirrors
export function trustedIdentifierAliasWrite({ scope, name, adapter, path, readNode = null }) {
  if (!adapter?.findTrustedAliasWrite) return null;
  const write = adapter.findTrustedAliasWrite(scope, name, { requirePlacement: false });
  if (!write || write.left?.type !== 'Identifier' || write.left.name !== name) return null;
  // ... or the READ's own span proves it - the evidence the PATTERN arm of the same follow already
  // accepts: a source read beginning past the write's end runs after it, which is what a sequence
  // spells (`(g = globalThis, v = g.window.self)`). a rebuilt node carries no span and declines, so
  // the AST leg's position-less re-visits stay out. the span says ORDER, never dominance, so it
  // rides the adapter's own PLACEMENT gate - a branch-local write (`if (c) { var M = globalThis }`)
  // runs on one path, and a textual accept there would mask the native throw
  if (adapter.method === 'usage-pure' && !readsAfterWriteStructurally(path?.parentPath ? path : null, write)
    && !(typeof readNode?.start === 'number' && readNode.start >= write.end
      && adapter.findTrustedAliasWrite(scope, name, { readNode }) === write)) return null;
  return write;
}

// non-IIFE callees (`getGlobal().Array`) return unchanged and keep generic dispatch.
// `peelZeroArgIifeReturn` already bails on async / generator / spread / control-flow bodies,
// so only sound pass-through wrappers peel
export function peelProxyGlobalObject(node) {
  node = unwrapRuntimeExpr(node);
  // SE tails peel for CLASSIFICATION only (`(eff(), globalThis).Array` - the prefix stays in
  // the source and runs at evaluation), mirroring the detect-usage chain walks; without the
  // peel an SE-buried extends target dropped its super statics
  node = peelSequenceTail(node, { step: unwrapRuntimeExpr });
  if (node?.type !== 'CallExpression' && node?.type !== 'OptionalCallExpression') return node;
  const ret = peelZeroArgIifeReturn(node);
  return ret ? unwrapRuntimeExpr(ret) : node;
}

// does a REGISTERED alias's own span end before the use begins? the record carries either the
// write's span or the declaration's, and a use ahead of it reads the binding before the alias
// exists. an unknown position answers yes - the callers that need proof gate it themselves
export function aliasSpanDominatesUse({ info, useStart }) {
  const span = info?.aliasWrite ?? info?.aliasDeclSpan;
  return !span || useStart === null || useStart > span.end;
}

// pure only: an assignment-form alias hint is flow-sound at a read only when its registered
// write ENDS before the read begins. registration verified the write's shape and placement,
// not its order against every read - an alias hop captures its source at the hop declarator,
// so a source written after that capture must not narrow it (`const S = T; ({ Symbol: T } =
// globalThis)` captures undefined; the span gate at the OUTER use admits it). unknown positions
// bail - pure resolves on proof. global / entry modes stay hint-sound regardless (side-effect
// imports only, over-inject-safe)
export function assignmentAliasHintSoundAtRead({ binding, adapter, readNode }) {
  if (adapter?.method !== 'usage-pure' || !binding?.aliasWrite) return true;
  const readStart = readNode?.start ?? null;
  return readStart !== null && readStart > binding.aliasWrite.end;
}

// does this node carry SOURCE provenance - a parser span, the `replacedSpan` a rebuilt
// spelling is stamped with, or the `loc` a babel clone keeps where its `cloneNode` drops
// `start`? a true MINT carries none of the three. this is the "the user wrote this" gate,
// never a position - offset comparisons stay on raw `start`
export function nodeCarriesSourceSpan(node) {
  return typeof node?.start === 'number'
    || Number.isInteger(node?.replacedSpan?.start)
    || Number.isInteger(node?.loc?.start?.index);
}

// does a pattern bind nothing any more - every object level emptied, every array element with it?
export function patternDead(node) {
  if (!node) return true;
  if (node.type === 'ArrayPattern') return node.elements.every(element => patternDead(element));
  if (node.type === 'ObjectPattern') return node.properties.length === 0;
  return false;
}

// an object property whose value the consume emptied binds nothing, yet reading it fires the hop's
// getter: drop such props, innermost first, until the shape is stable. a REST sibling keeps its
// level (rest gathers what the pattern did not name) and binds a `mint`ed sentinel instead of an
// empty pattern, which would still read the hop for nothing; an effect-bearing key keeps its own
// prop (the effect runs where it stands); a slot DEFAULT holds the pattern in its left and is as
// dead as its undefaulted twin - the fold spelled both arms. a SOLE-slot ARRAY level between hops
// is dead with its element (`{ w: [{}] }` reads `w` for nothing, exactly like `{ w: {} }`); a wider
// one keeps its shape - a source-written `{}` beside the claim still coerces its element. `onDrop` sees
// every prop that leaves, for an emitter that seeds its skip set. distinct from a PLAN prune, which
// removes what a flatten plan marked consumed: this is the AFTERMATH of props leaving one at a time
export function pruneEmptiedHopProps(node, { mint, onDrop = null }) {
  if (node?.type === 'ArrayPattern') {
    for (const element of node.elements) pruneEmptiedHopProps(element, { mint, onDrop });
    return;
  }
  if (node?.type !== 'ObjectPattern') return;
  const hasRest = node.properties.some(isRestProperty);
  const kept = [];
  for (const prop of node.properties) {
    const defaulted = prop.value?.type === 'AssignmentPattern';
    const pattern = defaulted ? prop.value.left : prop.value;
    pruneEmptiedHopProps(pattern, { mint, onDrop });
    const emptied = (prop.type === 'Property' || prop.type === 'ObjectProperty') && !computedKeyHasSideEffects(prop)
      && (pattern?.type === 'ObjectPattern' || (pattern?.type === 'ArrayPattern' && pattern.elements.length === 1))
      && patternDead(pattern);
    if (!emptied) kept.push(prop);
    else if (hasRest) {
      if (defaulted) prop.value.left = mint();
      else prop.value = mint();
      kept.push(prop);
    } else onDrop?.(prop);
  }
  node.properties = kept;
}
