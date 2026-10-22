import { brand } from './error-tag.js';
import knownBuiltInReturnTypes from '@core-js/compat/known-built-in-return-types' with { type: 'json' };
import {
  canonicalArrayIndex,
  DESTRUCTURE_PATTERN_TYPES,
  dropLeadingThisParam,
  hasRange,
  literalNodeValue,
  MAX_DEPTH,
  nodeRangeContains,
  PATTERN_WRAPPERS,
} from '../resolve-node-type/base.js';
import { NESTED_BINDING_INTRODUCERS, nodeAlwaysReaches } from '../resolve-node-type/exit-analysis.js';
import { moduleIdLanguage } from './path-normalize.js';
import { pushMultimap } from './pattern-matching.js';

// the escape census, keyed by PROGRAM node -> the NAMES a value handed out (a call argument, a
// member-assignment RHS, a throw / yield / export-default), alias hops followed. written by the
// mutation pre-pass, read wherever a claim needs to know the container is still this file's own -
// it lives here, at the bottom, so the census and its readers need no import of each other
export const ESCAPED_CONTAINER_NAMES = new WeakMap();

// Selected values of fixed local member callees, found by the file census. Receiver-name
// resolution follows their returns while preserving the call; the proof stays with the census.
export const LOCAL_MEMBER_CALLEES = new WeakMap();

// Read-only parameters supplied by one built-in at every closed call site. Published by the
// escape census and reset when that census visits the parameter's owner again. The scoped
// resolver validates only these candidates; unrelated parameters never need its caller walk.
export const PARAMETER_STATIC_SOURCES = new WeakMap();

const capturedKeyedPatterns = new WeakSet();
// Record the original pattern before moving its leaf onto a captured receiver.
export function markCapturedKeyedPattern(pattern) {
  capturedKeyedPatterns.add(pattern);
}

// A moved leaf still owes the coercion and reads its source pattern performed before capture.
export function isCapturedKeyedPattern(pattern) {
  return capturedKeyedPatterns.has(pattern);
}

const generatedMemoDeclarators = new WeakSet();
// Record the actual declarator an allocator placed, independently of its printed name.
export function markGeneratedMemoDeclarator(declarator) {
  generatedMemoDeclarators.add(declarator);
  return declarator;
}

// Only allocator-owned, initless identifier declarators have transparent memo provenance.
export function isGeneratedMemoDeclarator(declarator) {
  return generatedMemoDeclarators.has(declarator) && !declarator.init && declarator.id?.type === 'Identifier';
}

// where an allocator appended a declarator path-less: its declaration and the index it took there
const memoDeclaratorSlots = new WeakMap();
// append an allocator's declarator to the declaration `host` in place, with no path for it, and record the slot: the
// parent index places the declarator there (`ownerParentIndexLocating`) where a lookup would re-walk its owner
export function appendMemoDeclarator(host, declarator) {
  host.declarations.push(markGeneratedMemoDeclarator(declarator));
  memoDeclaratorSlots.set(declarator, { host, index: host.declarations.length - 1 });
  return declarator;
}

// Program -> read-only receiver candidate query. Global includes local call/parameter flows;
// pure asks for opaque iteration/selection families. Candidates alone never prove a replacement.
export const CENSUS_STATIC_RECEIVERS = new WeakMap();

// Program -> the names a computed key may fold to, or null where it folds to none: the escape census's
// one key evaluator, asked by the usage-global union where the detection walk names no key of its own
export const CENSUS_KEY_NAMES = new WeakMap();

// Program -> enum own-receiver proof. Ordinary writes retain own presence; deletion, root
// reassignment and handout do not. Null delegates a qualified enum to the scoped declaration owner.
export const CENSUS_ENUM_RECEIVERS = new WeakMap();

// The escape census's position half, keyed by PROGRAM node -> `start:end` keys of CONSTRUCTOR references
// whose value escapes. a position survives every clone and region rebuild (babel's cloneNode keeps
// source positions), where node identity does not
export const ESCAPED_CTOR_REFS = new WeakMap();

// the node an escape stamp NAMES. a bare reference carries its escape on its own Identifier; a value
// spelled off the proxy-global surface (`f(globalThis.Map)`) has no identifier of its own, and the
// claim above it stands on the whole member, so the member is what the stamp names; a value
// DESTRUCTURED off that surface (`const { Map } = globalThis`) spells no read at all - the claim
// stands on the pattern slot, and so does the stamp. every other type shares its position with a
// node it wraps and must never read that node's stamp
export const ESCAPE_STAMPED_NODE_TYPES = new Set([
  'Identifier',
  'MemberExpression',
  'ObjectProperty',
  'OptionalMemberExpression',
  'Property',
]);

// the position key both sides agree on: parser nodes carry `start` / `end` char offsets;
// a babel clone drops them but keeps `loc.*.index` in the same offset space
export function nodePositionKey(node) {
  const start = node?.start ?? node?.loc?.start?.index;
  const end = node?.end ?? node?.loc?.end?.index;
  return typeof start === 'number' && typeof end === 'number' ? `${ start }:${ end }` : null;
}

// does an escape stamp NAME this node? the ONE reader of that census - the claim that reaches its
// node through a path asks it, and so do the destructure plans, which hold the node alone
export function isEscapedCtorNode(program, node) {
  if (!ESCAPE_STAMPED_NODE_TYPES.has(node?.type)) return false;
  const key = nodePositionKey(node);
  // eslint-disable-next-line sonarjs/no-empty-collection -- filled by the usage pass, not here
  return key !== null && ESCAPED_CTOR_REFS.get(program)?.has(key) === true;
}

// ... and the NAME half of the same census, keyed by PROGRAM node -> the constructor NAMES its
// stamped references spell. WHICH entry a constructor resolves to is a file-wide fact, not a
// per-reference one: the two entries name ONE runtime value, so two references answering
// differently mint two bindings for it, and the identity guard then tests a value taken from one
// against the other - a comparison held up by the two modules exporting the same object, which
// nothing guarantees. the widening one escape obliges therefore applies to every reference to that
// name in the file. it costs no module: a file that split imported the namespace entry and its own
// subset, and now imports the namespace alone.
// what a name is IN this set for is the value the REALM holds under it. a leaf resolving to a
// binding the file wrote hands out that binding, and the constructor's statics are not owed for it -
// the file-wide answer is unaffected either way, since the set is still keyed by the name and a
// single realm leaf puts it in. the narrow lives with the walk that fills the set, which is the only
// place that can see which binding a leaf reached.
// keyed by program for the STAMPING half alone; the set itself rides the file census, so the
// decision reads it without holding an AST the file is done with
export const ESCAPED_CTOR_NAMES = new WeakMap();

// the NAME a stamp spells, over the same node types the position half stamps - the one list, so a
// spelling added to it is named as well as stamped: a bare reference carries its own name, a
// proxy-surface read the hop key, a destructured slot the pattern key. a computed key no structural
// fold names is read by the census's own key canon where the caller holds it (`resolveKey`), the way
// the claims read it: `globalThis[K]` and `{ [(k++, 'Map')]: P }` name `Map`
export function escapeStampedName(node, resolveKey = null) {
  if (!ESCAPE_STAMPED_NODE_TYPES.has(node?.type)) return null;
  if (node.type === 'Identifier') return node.name;
  const member = node.type === 'MemberExpression' || node.type === 'OptionalMemberExpression';
  const name = member ? staticMemberKeyName(node) : propertyKeyName(node);
  if (name !== null || !node.computed || !resolveKey) return name;
  return resolveKey({ node: member ? node.property : node.key, computed: true });
}

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
// (Babel `extra`, parent back-refs, per-visitor caches stamped by sibling tools) and comments.
// prefer over hardcoded SKIP-keys - new plugins can stamp arbitrary keys, a skip list rots
export function isASTNode(value) {
  if (value === null || typeof value !== 'object') return false;
  const { type } = value;
  return typeof type === 'string'
    && type !== 'CommentBlock'
    && type !== 'CommentLine'
    && type !== 'Block'
    && type !== 'Line';
}

// positional recursive walk over a raw AST subtree of EITHER dialect: `visit(node, parent, key, listKey)`
// per position (a node shared by two parents is visited from each), optional `leave` after
// its children. An explicit `false` return PRUNES the subtree and its leave callback
// (a type-annotation wall, a span the caller owns). the depth cap
// protects against pathological nesting (template-literal bombs, parser bug-emitted cycles);
// the per-node hot path allocates nothing
export function walkAstNodes({ root, visit, leave = null, parent = null, depth = 0 }) {
  (function step(node, parentNode, level, key = null, listKey = null) {
    if (!isASTNode(node) || level >= 1024) return;
    if (visit(node, parentNode, key, listKey) === false) return;
    // eslint-disable-next-line no-restricted-syntax -- perf: AST hot path, plain objects
    for (const field in node) {
      const value = node[field];
      if (Array.isArray(value)) for (let index = 0; index < value.length; index++) step(value[index], node, level + 1, index, field);
      else step(value, node, level + 1, field);
    }
    leave?.(node, parentNode, key, listKey);
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
  if (scope && adapter?.hasBinding?.({ scope, name: 'require', path, read: callee })) return null;
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

// would removing `body[entryIndex]` turn the next surviving string-literal sibling into a
// DIRECTIVE it is not today? `require('core-js'); "use strict"; undeclared = 1` -> removal puts
// `"use strict"` at body[0] and the sloppy script silently becomes strict; `"use client"` promoted
// the same way makes a module a client boundary. the question is whether the prologue CHANGES, so
// the answer does not depend on one already existing: a file with none is the worst case, not an
// exemption - there the removal creates the prologue from nothing. fires when every surviving
// prior statement is a directive - including none at all - and the next surviving sibling is a
// bare string statement. `isQuietLiteralOperand` already holds the same invariant for the
// minifier split.
// `pendingRemovals` (optional index Set) treats queued siblings as gone for prefix scan and
// next-sibling lookup. babel-plugin removes per-callback (live body reflects prior removals);
// unplugin defers commit until after the whole batch decides, feeding the simulated state in
// `injectedImportsBreakPrologue`: when the file receives at least one injected module
// import/require, that block lands right after the prologue and is itself a non-directive
// statement - promotion becomes impossible for EVERY removed entry, so no `0;` placeholder
// is ever needed. only a zero-module expansion (modern targets filtering everything out)
// leaves the bare-removal hazard this guard exists for
function wouldPromoteDirectiveAfterRemoval({
  body,
  entryIndex,
  pendingRemovals,
  injectedImportsBreakPrologue = false,
}) {
  if (injectedImportsBreakPrologue) return false;
  for (let i = 0; i < entryIndex; i++) {
    if (pendingRemovals?.has(i)) continue;
    if (!isDirectiveStatement(body[i])) return false;
  }
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
  body,
  candidateIndices,
  injectedImportsBreakPrologue = false,
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
    if (wouldPromoteDirectiveAfterRemoval({ body, entryIndex: idx, pendingRemovals, injectedImportsBreakPrologue })) {
      toReplaceWithNoop.push(body[idx]);
    } else {
      pendingRemovals.add(idx);
      toRemove.push(body[idx]);
    }
  }
  return { toRemove, toReplaceWithNoop };
}

// the answer statements of a decided test - a listed statement holding nothing but the value the test
// answers - that may leave their list, out of `candidateIndices` (ascending): not one whose removal would
// promote the next string statement into the body's directive prologue (`wouldPromoteDirectiveAfterRemoval`),
// which keeps its folded `false;` - a `'use strict'` written behind a detect would turn the code strict, a
// `'use client'` the module into a client boundary. no injected-import exemption: both legs place their
// imports after the fold, and one anchors them past a string statement the removal moved to the head
export function leavingAnswerStatements(body, candidateIndices) {
  return resolveBatchDirectivePromotionPolicy({ body, candidateIndices }).toRemove;
}

// indirect-require entry shape: `(prefix1, prefix2, ..., require)('core-js/...')`. peels
// the ExpressionStatement -> CallExpression -> SequenceExpression callee (through any
// ParenthesizedExpression wrappers from oxc) and returns the observable side-effect
// prefix expressions in source order. entry-detection consumes the require-tail and would
// drop the whole statement on removal; this lets both plugins recover the prefix slots so
// `(spy(), require)('core-js/...')` preserves `spy()` while `(0, require)(...)` drops as
// expected. returns an empty array when the shape doesn't match OR every prefix slot is
// side-effect-free. Scoped callers pass the source statement's read context so an accessor
// reached through a local binding is preserved as well as an in-place accessor or a call.
export function extractIndirectRequireSEPrefix(stmtNode, ctx = null) {
  // `getEntrySource` detects + REMOVES the whole statement as an entry, so every observable side
  // effect it discards must be recovered here. it reaches the require call through the same wrapper
  // set peeled below (TS as/!/<>/satisfies + paren + chain) AND through an outer SE-free comma
  // sequence (`unwrapParens` peels the tail of `0, (spy(), require)('core-js/...')` to the call).
  // descend that outer sequence the same way, collecting SE-ful prefix elements so `spy()` survives
  const prefix = [];
  const expression = peelSequenceTail(unwrapRuntimeExpr(stmtNode?.expression), {
    step: unwrapRuntimeExpr,
    onPrefix: expressions => {
      for (const e of expressions.slice(0, -1)) if (mayHaveSideEffects(e, ctx)) prefix.push(e);
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
      for (const e of expressions.slice(0, -1)) if (mayHaveSideEffects(e, ctx)) prefix.push(e);
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

// hosts that carry type arguments of their own, each mapped to the slot holding their callee or tag:
// an instantiation filling that slot hands its arguments to the host (`(f<T>)(a)` is `f<T>(a)`), and
// one anywhere else is a type-only wrapper of its operand - the substitution of a claim under it
// takes it along, as it takes a cast
const TYPE_ARGUMENT_HOST_SLOTS = new Map([
  ['CallExpression', 'callee'],
  ['NewExpression', 'callee'],
  ['OptionalCallExpression', 'callee'],
  ['TaggedTemplateExpression', 'tag'],
]);

// the node `path` answers to, plus the child filling that node's slot. where a parser keeps the source
// parens as nodes (oxc, babel under `createParenthesizedExpressions`) the host sits one or more paren
// layers up instead of directly overhead, and every question asked of it would read the paren as the
// host. paren layers ONLY: a TS cast in between is a different shape, not a transparent layer
export function parenLayerHost(path) {
  let child = path;
  while (child.parentPath?.node?.type === 'ParenthesizedExpression') child = child.parentPath;
  const host = child.parentPath?.node;
  return host ? { host, childNode: child.node } : null;
}

// the host whose callee or tag slot the instantiation at `path` fills (`TYPE_ARGUMENT_HOST_SLOTS`),
// or null where it wraps its operand for the type layer alone
export function typeArgumentHostOf(path) {
  const above = parenLayerHost(path);
  const slot = above && TYPE_ARGUMENT_HOST_SLOTS.get(above.host.type);
  return slot && above.host[slot] === above.childNode ? above.host : null;
}

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
  // JSX name-literal slots: an attribute NAME (`<X f={1} />`) is a prop key; a member-tag TAIL
  // (`<f.Bar />`) is a name on the root, and a namespaced part (`<X a:b />`) lowers to a string.
  // which JSX slot references at all is the tag-name canon's question - both halves of it are
  // `jsxIdentifierReferencesBinding`, so the skip list cannot drift from the reference list
  if (type === 'JSXAttribute' && parent.name === identifierNode) return true;
  // only a NAME child is a slot the canon answers for - a member tag's nested chain is walked on
  // to reach the root, which is the one JSXIdentifier under it that does reference
  if (identifierNode?.type === 'JSXIdentifier' && (type === 'JSXMemberExpression' || type === 'JSXNamespacedName')) {
    return !jsxIdentifierReferencesBinding(identifierNode, parent);
  }
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

// Parentheses around a TS type carry no type semantics, but only one dialect keeps them: oxc
// preserves `(T)` as a `TSParenthesizedType` node where the babel parser drops it, so a caller
// matching the inner type's discriminator (`TSUnionType`, `TSIntersectionType`, `TSTypeQuery`)
// peels here first or the wrapped shape leaks past its dispatch on the oxc path alone.
export function peelTSParenthesized(node) {
  while (node?.type === 'TSParenthesizedType') node = node.typeAnnotation;
  return node;
}

// The content of a tuple member, peeling its optional label and rest wrapper in either order.
export function unwrapTupleMember(element) {
  let node = element;
  for (let i = 0; i < 2; i++) {
    if (node.type === 'TSNamedTupleMember') node = node.elementType;
    else if (node.type === 'TSRestType') node = node.typeAnnotation;
    else break;
  }
  return node;
}

// Whether a tuple member is variadic, with or without a source label.
export function isTupleRestElement(element) {
  const unwrapped = element.type === 'TSNamedTupleMember' ? element.elementType : element;
  return unwrapped.type === 'TSRestType';
}

// The tuple element list in the TS and Flow dialects.
export function tupleElements(node) {
  return node.elementTypes || node.types;
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

// does this node stand in the CALLEE slot of the call above it? the callee is read through the same
// wrapper peel the resolver walks down (`(JSON.parse as any)(s)` puts a TS wrapper between the call
// and its callee), since a strict identity check against the wrapper answers no and silently
// reclassifies the position. both dialects are covered by one list: babel spells an optional call
// `OptionalCallExpression`, ESTree a `CallExpression` under a chain
export function isCalleeReference(parent, node) {
  if (parent?.type !== 'CallExpression' && parent?.type !== 'OptionalCallExpression'
    && parent?.type !== 'NewExpression') return false;
  return unwrapRuntimeExpr(parent.callee) === node;
}

// AST parent shapes where an Identifier child IS the binding being introduced (declarator
// id, function/class id, catch param, the id of a TS enum / namespace / import-equals
// declaration), NOT a reference to a binding. complementary to `isNonReferencePosition` (which
// covers source-text name positions like property keys); callers walking subtrees for
// global-reference rewrites must skip both shapes to avoid renaming the binding itself. pattern
// positions (destructure ids) handled separately by `walkPatternIdentifiers` since patterns can
// nest arbitrarily
export function isBindingPosition(parent, identifierNode) {
  if (!parent) return false;
  const { type } = parent;
  if (type === 'VariableDeclarator' && parent.id === identifierNode) return true;
  if ((type === 'FunctionDeclaration' || type === 'FunctionExpression' || type === 'ClassDeclaration'
    || type === 'ClassExpression' || type === 'TSEnumDeclaration' || type === 'TSModuleDeclaration'
    || type === 'TSImportEqualsDeclaration') && parent.id === identifierNode) return true;
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

// wrappers that may appear BETWEEN the function-like node and its CallExpression's `.callee`
// slot without changing what's invoked. no UnaryExpression: ABOVE the call `!fn()` invokes fn
// and negates the result, but BELOW it `(!fn)()` invokes the boolean, not fn. SequenceExpression
// included with explicit tail-check at callsite - the tail is the invoked value, preceding slots
// are side effects
const IIFE_CALL_CALLEE_WRAPPERS = new Set([
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
function isIifeCallNode(node) {
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
  return isMemberAccessType(node?.type);
}
// ... by the node type alone, for a walk holding it read
export function isMemberAccessType(type) {
  return type === 'MemberExpression' || type === 'OptionalMemberExpression';
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
    // the TEST holds no value of its own: what reaches a consumer above is the BRANCH taken, and the
    // one shape that carries the chain through it - the lowered scaffold whose memo the branches
    // read back - is spelled by `runStandsInLoweredGuardTest` below, where the whole question lives.
    // read as a carrier here, a memo-free test (`null == nav ? void 0 : _Ctor`) handed the fold the
    // probe READ the source's `?.` became, and the two emitters spelled one nav two ways
    case 'ConditionalExpression': return node.consequent === child || node.alternate === child;
    default: return false;
  }
}

// is a `delete` the consumer anywhere above this chain? the operator may sit several tail steps up
// (`delete nav.Ctor.prototype.method`), and every step between is a member reached through its OBJECT
// or a call reached through its CALLEE. THE question both emitters ask before deciding what a proxy
// nav owes: under a delete the navigation collapses whole - the deleted member is never read, so no
// `?.` over it is load-bearing and no probe guard is built. a computed KEY or an argument is no link
// of that chain: it is a value the engine reads before the operator acts (`delete holder[nav.k]`), so
// the navigation there owes what a plain read of it owes.
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
    const stepsOn = ((node.type === 'MemberExpression' || node.type === 'OptionalMemberExpression') && node.object === step.node)
      || ((node.type === 'CallExpression' || node.type === 'OptionalCallExpression') && node.callee === step.node);
    if (!stepsOn && unwrap(node) === node && !chainValueCarrier(node, step.node)) return false;
  }
  return false;
}

// is this run standing in a LOWERED guard scaffold's own null test (`null == (_ref = nav) ? void 0
// : _ref.x`, and its memo-free twin `null == nav ? void 0 : _Ctor`)? the source's `?.` survived the
// lowering as that test, so a consumer that FOLDS the navigation answers the probe instead of
// running it - and the fold's own delete-host walk cannot see it, because an emit that already
// rebuilt the spine answers from its mark. path-shaped and dialect-neutral like the walk above
export function runStandsInLoweredGuardTest(startPath, unwrap) {
  for (let step = startPath, up = step?.parentPath; up?.node; step = up, up = up.parentPath) {
    const { node } = up;
    if (node.type === 'ConditionalExpression') return node.test === step.node;
    if (node.type === 'LogicalExpression' && node.operator !== '??') continue;
    const stepsOn = (node.type === 'MemberExpression' || node.type === 'OptionalMemberExpression')
      && unwrap(node.object) === unwrap(step.node);
    if (!stepsOn && unwrap(node) === node && !chainValueCarrier(node, step.node)) return false;
  }
  return false;
}

// the DETECT a logical-assignment patch never spells. `X.prototype.m ||= patch` writes only where the
// slot is EMPTY, and what it tests is the OPERATOR's own read rather than a node - so no read carries
// the polyfill, and the third-party patch installs in exactly the realms core-js supplies the method
// for. The explicit twin needs no channel of its own (`X.m = X.m || patch` - the member visitor
// polyfills the read the source wrote), which is why this shape had none. Answering it keeps the
// conditional write and puts core-js's own dispatch ahead of the patch (`||= _mMaybeX(X.prototype) ||
// patch`): where the slot is empty it takes OURS and the patch never runs, and where the slot is
// filled nothing is written, exactly as the source says. `&&=` is not this shape - it writes only
// where the slot is ALREADY filled, so prepending ours would install where native does not
export function logicalSlotPatchHost(memberPath) {
  const target = climbTransparentWrapperPath(memberPath);
  const host = target?.parentPath?.node;
  if (host?.type !== 'AssignmentExpression' || host.left !== target.node) return null;
  const operator = host.operator === '||=' ? '||' : host.operator === '??=' ? '??' : null;
  return operator ? { host, operator, receiverNode: target.node.object } : null;
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

// descend a member chain to its ROOT node, peeling only RUNTIME-transparent wrappers at every hop,
// and keep the KEYS it passed, root-nearest first: `keyName` spells each hop (`memberKeyName` reads
// a static key, `staticMemberKeyName` folds an effectful computed one to its tail) and an unreadable
// hop records `null` - a caller that cannot use a partial path refuses on it, one that can (a write
// record) wildcards from it. the root comes back WHATEVER its type: a name-resolving caller filters
// to Identifier, a container walk descends a call there.
// deliberately NOT `descendToChainRoot`: that canon also peels sequence TAILS, which hands back
// `globalThis` for the very `(c++, globalThis)` root some callers here exist to recognise - and it
// lives a layer above this file, which every layer imports
export function memberChainKeys(node, keyName = memberKeyName) {
  const keys = [];
  let root = unwrapRuntimeExpr(node);
  while (root?.type === 'MemberExpression' || root?.type === 'OptionalMemberExpression') {
    keys.push(keyName(root));
    root = unwrapRuntimeExpr(root.object);
  }
  return { root, keys: keys.toReversed() };
}

// The root alone needs neither key resolution nor a path array. A read-only census can
// supply its own weak index to share prefixes; live-tree callers leave it uncached.
export function runtimeChainRoot(node, cache = null) {
  let root = unwrapRuntimeExpr(node);
  const pending = cache ? [] : null;
  while (isMemberAccessNode(root)) {
    if (cache?.has(root)) {
      root = cache.get(root);
      break;
    }
    pending?.push(root);
    root = unwrapRuntimeExpr(root.object);
  }
  if (cache) for (const member of pending) cache.set(member, root);
  return root;
}

// Source-shape consumers peel parens + chain wrappers while retaining TypeScript syntax.
// Runtime receiver proofs use unwrapRuntimeExpr separately from this source-shape peel.
export function peelMemoizeWrappers(node) {
  while (node?.type === 'ParenthesizedExpression' || node?.type === 'ChainExpression') node = node.expression;
  return node;
}

// Sequence prefixes kept by a navigation spine, in source evaluation order. These are
// original nodes, including quiet reads that can throw before a later computed key.
export function navComputedKeyEffects(node) {
  const effects = [];
  let cur = unwrapRuntimeExpr(node);
  for (; isMemberAccessNode(cur); cur = unwrapRuntimeExpr(cur.object)) {
    if (!cur.computed) continue;
    effects.unshift(...peelNestedSequenceExpressions(cur.property).prefix);
  }
  effects.unshift(...peelNestedSequenceExpressions(cur).prefix);
  return effects;
}

// a node is safe to evaluate more than once without a memo temp (`_ref`) when it preserves
// the same receiver value. single source for both emitters' "no _ref needed"
// gate (previously a per-emitter predicate + set that had to be hand-kept in sync).
// Key effects or a method getter can change a mutable binding between lookup and `.call`.
// A scoped caller may reuse a constant binding or a current-pass activation-local capture.
// A bare optional callee has no effect between its guard and the immediate call lookup.
// Ordinary writes in a non-resumable activation cannot run during adjacent lookup/this reads.
// A suspended generator can resume its own writes from a getter in a nested reader.
// Member receivers keep a snapshot so selecting a method never repeats a property read.
export function isReusableReceiver(node, { interveningEffects = false, directCallee = false, ctx = null } = {}) {
  const inner = unwrapRuntimeExpr(node);
  if (inner?.type === 'ThisExpression') return true;
  if (isQuietLiteralOperand(inner) && inner.type !== 'RegExpLiteral' && !inner.regex
    && (inner.value === null || typeof inner.value !== 'object')) return true;
  if (inner?.type !== 'Identifier') return false;
  if (!ctx) return !interveningEffects;
  if (ctx.injectorState?.isOwnPassGeneratedName?.(inner.name)) return true;
  const binding = ctx.adapter?.getBinding?.({ scope: ctx.scope, name: inner.name, path: ctx.path, read: inner });
  const declaration = bindingDeclarationPath(binding);
  // A free or erased identifier follows the scoped write census across source effects.
  // A direct optional callee still needs one GetValue for its guard and call.
  const ambient = isAmbientBindingShape(binding?.node ?? declaration?.node, declaration?.parentPath?.node)
    || nonEmittedExpressionAncestor(declaration);
  if (!binding || ambient) {
    if (ctx.adapter?.isMutatedStaticSlot?.('globalThis', inner.name)) return false;
    // The built-in mutation census omits unknown lowercase slots. The cached lexical write
    // index still knows their source writers and excludes writes to shadowed bindings.
    const owner = rootPathOf(ctx.path);
    if (owner?.node?.type === 'Program' && collectScopeReassignmentNodes(owner, inner.name).some(
      write => !writeNeverRuns({ write, usagePath: ctx.path, adapter: ctx.adapter })
      && (nestedWriteOwners.has(write) || interveningEffects
        && !provablyPrecedes(write, ctx.path?.node) && !provablyPrecedes(ctx.path?.node, write)),
    )) return false;
  }
  if (ambient) {
    if (directCallee) return false;
    if (!cleanDestructureAliasWrites(binding).length) return true;
  }
  if (ctx.injectorState?.isOwnPassPureBinding?.(inner.name)) {
    const ownImport = ctx.injectorState.getPureImport?.(inner.name);
    if (ownImport && (!binding || ((binding.kind === 'module' || !binding.node) && binding.importSource
      && pureImportSourceEntry(binding.importSource) === ownImport.entry))) return true;
  }
  // An import is read-only here, but its exporting module can replace the live binding.
  // Quiet free identifiers retain the adjacent-read contract, including a method guard.
  if (!binding) return ctx.adapter?.isKnownGlobalName?.(inner.name)
    || !directCallee && (!interveningEffects || !!ctx.adapter?.getBinding);
  if (binding.kind === 'module') return false;
  if (directCallee && !interveningEffects || binding.kind === 'const' && !ambient) return true;
  if (!Array.isArray(binding.constantViolations) || writesPastCeiling(binding.constantViolations)) return false;
  const writes = cleanDestructureAliasWrites(binding);
  if (!writes.length) return true;
  const owner = findNearestVarScopeOwner(binding.declarationPath ?? binding.path ?? binding.scope?.path);
  const frame = owner?.node ?? binding.scope?.block;
  // A write outside this read can only intervene by re-entering its activation. The
  // frame/escape proof below rules that out; a store inside the computed read cannot move.
  if (interveningEffects && (frame?.type === 'Program' && frame.sourceType === 'script' && binding.kind === 'var'
    || writes.some(write => !provablyPrecedes(violationNode(write), ctx.path?.node)
      && !provablyPrecedes(ctx.path?.node, violationNode(write))))) return false;
  return !!frame && pathContainedBy(ctx.path, frame)
    && (!frame.generator || !readRunsDeferredWithin(ctx.path, frame))
    && !bindingWrittenBeyondItsFrame(binding, ctx, { closedCalls: !interveningEffects });
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
// code means the global. Bodies, defaults and field values bind their own receiver.
export function isTopLevelThisContext(path) {
  for (let child = path, current = path?.parentPath; current; child = current, current = current.parentPath) {
    if (current.node?.type === 'Program') return true;
    if (!isThisRebinding(current.node, child.node)) continue;
    // Own keys are already excluded by the child-slot predicate. Only a parameter
    // decorator can cross the remaining function boundary without binding its this.
    if (current.node.params && current.node.body !== child.node
      && useRegionFrames(path).definitionTimeFrames?.has(current.node)) continue;
    return false;
  }
  return false;
}

// the CALLEE slot of an invocation node: `callee` on a call / optional call / `new`, `tag` on a
// tagged template (``fn`...` `` invokes `fn` with the template's strings). null for anything else
export function invocationCalleeOf(node) {
  if (isIifeCallNode(node)) return node.callee;
  return node.type === 'TaggedTemplateExpression' ? node.tag : null;
}

// the invocation path that immediately invokes the function at `fnPath`, or null - the ONE
// recogniser of the shape: the function stands in the callee slot of a call / optional call /
// `new` / tagged template, behind the wrappers that leave the invoked value unchanged (parens, TS
// casts, a chain marker, the TAIL of a sequence - a non-tail slot is a side effect, the tail is
// what runs). answers SHAPE only: whether the BODY runs at that invocation is
// `bodyRunsAtInvocation`, and `runsAtImmediateInvocation` asks both
export function immediateInvocationOf(fnPath) {
  let callee = fnPath;
  let parent = fnPath.parentPath;
  while (parent.node && (IIFE_CALL_CALLEE_WRAPPERS.has(parent.node.type) || TS_EXPR_WRAPPERS.has(parent.node.type))) {
    if (parent.node.type === 'SequenceExpression' && parent.node.expressions.at(-1) !== callee.node) return null;
    callee = parent;
    parent = parent.parentPath;
  }
  // `callee.node` is null for a detached path, and so is `invocationCalleeOf` of anything that is not
  // a call - without the first test the two nulls match and a bare statement reads as an invocation
  return callee.node && parent.node && invocationCalleeOf(parent.node) === callee.node ? parent : null;
}

// does the function's BODY run when `callNode` invokes it? a `function*` runs nothing at the call
// (the body waits for `.next()`), an `async` body suspends at its first `await`, and `new` on a
// non-constructible callee (an arrow) throws before the body - every statement after such a call
// runs BEFORE the body does, so a read inside it is deferred and a write inside it lifts to no
// straight-line position
export function bodyRunsAtInvocation(fnNode, callNode) {
  if (fnNode.async || fnNode.generator) return false;
  return callNode.type !== 'NewExpression' || fnNode.type === 'FunctionExpression';
}

// the invocation whose evaluation runs this function's body at its own source position, or null: the
// IIFE exemption every timing question shares. ONE shape forfeits it - a named function EXPRESSION
// that reads its own name can hand itself out (`return f`) and re-run after any later write, so the
// body does not run only here. what the ARGUMENT region does is a READ-side question and lives with
// the read step: the region runs before the body and so before everything after the call, which is
// exactly why it cannot disturb lifting a write OUT of that body
export function runsAtImmediateInvocation(fnPath) {
  const call = immediateInvocationOf(fnPath);
  if (!call || !bodyRunsAtInvocation(fnPath.node, call.node)) return null;
  return namedFunctionSelfReferences(fnPath) ? null : call;
}

// A discarded value keeps a callable or constructed instance private only at non-invoking
// observations. Coercion can call a conversion method that invokes the same callable again.
export function valueIsDroppedAt(path) {
  const outer = peelTransparentExprAncestorPath(path);
  const parentPath = outer?.parentPath;
  const parent = parentPath?.node;
  if (!parent || isMemberAccessNode(parent) || parent.type === 'CallExpression'
    || parent.type === 'OptionalCallExpression' || parent.type === 'NewExpression') return false;
  switch (parent.type) {
    case 'UnaryExpression':
      if (['+', '-', '~'].includes(parent.operator)) return false;
      break;
    case 'BinaryExpression': {
      // Loose equality with null/undefined compares without converting an object to a primitive.
      const nullishEquality = (parent.operator === '==' || parent.operator === '!=')
        && [parent.left, parent.right].some(value => isNullLiteralNode(unwrapRuntimeExpr(value))
          || isVoidExpression(unwrapRuntimeExpr(value)));
      if (parent.operator !== '===' && parent.operator !== '!=='
        && !nullishEquality
        && !(parent.operator === 'in' && unwrapRuntimeExpr(parent.right) === unwrapRuntimeExpr(outer.node))) return false;
      break;
    }
    case 'UpdateExpression':
    case 'TemplateLiteral':
    case 'ObjectProperty':
    case 'Property': return false;
  }
  return positionDisposition(parent, outer.node, parentPath) === POSITION_CONSUMES;
}

// the node slots no subtree walk descends into: positions and comment arrays carry no nodes of the
// program. ONE list, because the two walks that use it differ in their DESCENT RULE and in nothing
// else - a second hand-written copy drifts silently, and each walk then answers about a different tree
const SUBTREE_SKIP_KEYS = new Set(['loc', 'range', 'leadingComments', 'trailingComments']);

// visit every node of a subtree. `stopAtFunction` keeps the walk inside ONE body - a nested
// function's nodes answer for that function, not for its host, which is the difference between
// "does this region write" and "does anything anywhere write". the descent `suspensionPointBefore`
// rests on: it brings the question, the walk brings nothing of its own
function forEachInSubtree(node, visit, stopAtFunction, root = true, depth = 0) {
  // bounded like every other walk here: a slot that back-references an ancestor is a parser
  // property, not a contract, and an unbounded descent turns one into a stack overflow
  if (depth > MAX_DEPTH || !node || typeof node !== 'object' || typeof node.type !== 'string') return;
  if (!root && stopAtFunction && FUNCTION_LIKE_NODE_TYPES.has(node.type)) return;
  visit(node);
  for (const [key, value] of Object.entries(node)) {
    if (SUBTREE_SKIP_KEYS.has(key)) continue;
    if (Array.isArray(value)) for (const item of value) forEachInSubtree(item, visit, stopAtFunction, false, depth + 1);
    else forEachInSubtree(value, visit, stopAtFunction, false, depth + 1);
  }
}

// the positions depend on the FUNCTION alone, so they are collected once per body and searched per
// read - walking again for every read inside one body made the cost quadratic in the reads it holds
const suspensionPositions = new WeakMap();

// the LAST suspension point of this function body positioned before `beforePos`, or null. a suspended
// body resumes only when its caller lets it, so everything the caller runs in between lands between a
// guard above the suspension and a use below it - the one shape where a write OUTSIDE a function
// reaches a read inside it without the read being deferred. `for await` suspends on every iteration
// and carries no `await` node of its own, so the loop IS the position. nested function bodies are
// skipped: their suspensions belong to them
export function suspensionPointBefore(fnNode, beforePos) {
  let positions = suspensionPositions.get(fnNode);
  if (!positions) {
    positions = [];
    forEachInSubtree(fnNode, node => {
      if ((node.type === 'AwaitExpression' || node.type === 'YieldExpression'
        || (node.type === 'ForOfStatement' && node.await))
        && typeof node.start === 'number') positions.push(node.start);
    }, true);
    positions.sort((a, b) => a - b);
    suspensionPositions.set(fnNode, positions);
  }
  // binary search: the list is sorted, and a linear scan per read made this O(reads x suspensions)
  const at = sortedPrefixLength(positions, position => position < beforePos);
  return at > 0 ? positions[at - 1] : null;
}

// does the invocation's ARGUMENT region hold a write? the region evaluates before the callee's body,
// so a write there lands between the source position of a read inside that body and the read itself.
// asked of the whole region, not of one binding: the predicate is the timing question, and the
// callers that own a binding are the ones the answer protects
const argumentWriteAnswers = new WeakMap();
function invocationArgumentWrites(callNode) {
  const memo = argumentWriteAnswers.get(callNode);
  if (memo !== undefined) return memo;
  const args = callNode.type === 'TaggedTemplateExpression' ? callNode.quasi.expressions : callNode.arguments;
  let writes = false;
  // a write runs during argument evaluation when it sits in the region directly, or inside a function
  // the region itself INVOKES. a function merely handed over as a value - a callback, a stored lambda -
  // does not run here, and the walk must not enter it. the invoked-ness travels down the callee slot
  // and through the transparent wrappers over it, so a parenthesized IIFE argument still counts
  function scan(node, invoked) {
    if (writes || !node || typeof node !== 'object' || typeof node.type !== 'string') return;
    // a FUSED method is one node that is also its function, and the computed key it hosts is not
    // part of that function - it evaluates where the class or object literal stands, so the walk
    // enters the key and stops at the body, the same split `isDeferredContextStep` makes
    // ... and its DECORATORS, which the babel dialect hangs off that same fused node while ESTree puts
    // them on a wrapper the walk reaches anyway. both are class-eval slots, both run at the call
    const fusedKey = FUSED_METHOD_TYPES.has(node.type) && node.computed ? node.key : null;
    if (FUNCTION_LIKE_NODE_TYPES.has(node.type) && !invoked) {
      scan(fusedKey, false);
      if (FUSED_METHOD_TYPES.has(node.type)) for (const dec of node.decorators ?? []) scan(dec, false);
      return;
    }
    if (node.type === 'AssignmentExpression' || node.type === 'UpdateExpression') {
      writes = true;
      return;
    }
    const callee = invocationCalleeOf(node);
    const wrapped = invoked && TRANSPARENT_EXPR_WRAPPER_TYPES.has(node.type);
    // a sequence hands its invoked value on through the TAIL of `expressions`, the same peel
    // `immediateInvocationOf` makes - the wrapper test above looks for `expression` and misses it
    const seqTail = invoked && node.type === 'SequenceExpression' ? node.expressions.at(-1) : null;
    for (const [key, value] of Object.entries(node)) {
      if (SUBTREE_SKIP_KEYS.has(key)) continue;
      const entered = (callee !== null && value === callee) || (wrapped && key === 'expression');
      // invoked-ness has to survive the ARRAY hop, not die at it: a sequence hands its invoked value
      // on through the tail of `expressions`, which is the only invoked thing an array slot holds -
      // the callee itself is a named slot on its node, never an element
      if (Array.isArray(value)) for (const item of value) scan(item, item === seqTail);
      else scan(value, entered);
    }
  }
  for (const arg of args) scan(arg, false);
  argumentWriteAnswers.set(callNode, writes);
  return writes;
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
  // a function whose every call site is visible in the same expression - the immediately invoked
  // callee. the invocation must also spell its arguments as the positional list the emissions read
  // (`findIifeCallSite`): a tagged template hands the function its strings array and the
  // interpolations, so its params stay unaccounted for
  const call = immediateInvocationOf(fnPath);
  if (call && isIifeCallNode(call.node) && !namedFunctionSelfReferences(fnPath)) return false;
  return !paramNeverOverridden?.(paramPath);
}

// a BARE JSX tag name that starts lowercase names an intrinsic element (`<div />` -> the string
// "div", `<structuredClone />` -> the string, never the global), so it resolves against no binding
// at all. dashed tags (`<el-x />`) are intrinsic too, but they start lowercase as well - and a name
// carrying `-` can equal no JS identifier anyway, so the initial-letter test is the whole rule.
// a MEMBER tag (`<f.Sub />`) is an expression whatever its case and is NOT covered here
const JSX_INTRINSIC_TAG_RE = /^[a-z]/;

function isIntrinsicJsxTagName(tagName) {
  return JSX_INTRINSIC_TAG_RE.test(tagName);
}

// does a `JSXIdentifier` standing in THIS slot reference a binding? the grammar puts one in four
// places and only two of them read a value: a BARE tag that is not spelled as an intrinsic element,
// and the ROOT of a member tag - `<f.Sub />` is an expression whatever its case, and only its root
// is read, the tail being a prop on it. an attribute NAME and either half of a `JSXNamespacedName`
// lower to strings and name nothing. single home for the slot question, so the subtree walk, the
// program census and babel's own reference set cannot answer it three ways
export function jsxIdentifierReferencesBinding(node, parent) {
  const { type } = parent;
  if (type === 'JSXOpeningElement' || type === 'JSXClosingElement') {
    return parent.name === node && !isIntrinsicJsxTagName(node.name);
  }
  return type === 'JSXMemberExpression' && parent.object === node;
}

// climb from an identifier at the bottom of an N-deep `<Map.Provider.X />` object-chain to the
// terminal member sitting in the tag-name slot; a non-member position returns the path itself.
// only the root identifier is a runtime reference - the `.Provider.X` tail reads props off it -
// so the claim below judges the CLIMBED path's slot (opening-element name) to accept arbitrary depth
function climbJsxMemberChain(path) {
  let cur = path;
  while (cur?.parent?.type === 'JSXMemberExpression' && cur.parent.object === cur.node) {
    cur = cur.parentPath;
  }
  return cur;
}

// does the JSXIdentifier at `path` stand where an ELEMENT claims a runtime value? the slot canon
// answers which JSXIdentifier reads a binding at all; the claim adds one rule of its own, that a
// CLOSING tag names the component its opening tag already claimed, so the element is counted on the
// opening leg alone. single home for the pair: each emitter's visitor spelled the climb and the
// opening-element test out again, so the accepted member-tag depth could drift between them
export function jsxTagRootReferencesBinding(path) {
  if (!jsxIdentifierReferencesBinding(path.node, path.parent)) return false;
  const tag = climbJsxMemberChain(path);
  return tag.parent.type === 'JSXOpeningElement' && tag.key === 'name';
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

// babel spells a class / object method as ONE node that is also its function; ESTree splits it into
// a `MethodDefinition` / `Property` wrapper around a `.value` function. the slots the WRAPPER hosts -
// the computed key and the decorators - evaluate when the class / object literal does, so on the
// fused spelling they are entered through the function node without being deferred by it.
// reads are right to stay straight-line here - a key runs where the class stands, which is before
// anything after the class. the WRITE side is where the class-eval order shows, and its rule is
// `writeOutrunsUse` below, not this predicate
export const FUSED_METHOD_TYPES = new Set([
  'ObjectMethod',
  'ClassMethod',
  'ClassPrivateMethod',
]);

// class members that can carry a COMPUTED key. an object literal's members are deliberately absent:
// it evaluates its keys and its values in one source-order pass, so position already ranks them.
// neither `CLASS_FIELD_TYPES` nor `FUSED_METHOD_TYPES` answers this: the first holds only fields,
// the second holds `ObjectMethod` - the one spelling that must NOT be here - and misses the ESTree
// `MethodDefinition`. `createClassMemberShape` sorts members into semantic categories and takes a
// `t` to do it, which is the adapter layer this file sits below
const CLASS_MEMBER_TYPES = new Set([
  'ClassMethod',
  'ClassPrivateMethod',
  'MethodDefinition',
  'ClassProperty',
  'ClassPrivateProperty',
  'PropertyDefinition',
  'ClassAccessorProperty',
  'AccessorProperty',
]);

export const CLASS_NODE_TYPES = new Set(['ClassDeclaration', 'ClassExpression']);

// the slots a CLASS evaluates when it is defined: every decorator it and its members carry, and
// every computed key. they all run before the class's static fields and static blocks, whatever the
// source order puts first
// PARAMETER decorators are the one definition-time slot this enumeration leaves out, where the path
// enumeration of the same set (`classDefinitionTimePaths`) carries them. The omission only ever
// WIDENS a span - a write inside one is not proved to outrun a use, and the use is not proved to
// outrun it - so it cannot turn an answer unsound; measured over the fixture corpora and over forms
// putting the use and the write on either side of the pair, adding them moves no output, because a
// binding reassigned inside a decorator is already declined a step earlier
function classEvalSlotsOf(classNode) {
  const slots = [...classNode.decorators ?? []];
  for (const member of classNode.body.body) {
    slots.push(...member.decorators ?? []);
    if (member.computed && member.key) slots.push(member.key);
  }
  return slots;
}

// is the child the use came up through one of its parent's class-eval slots? the two slots that run
// at class-eval, read off the definition-time canon: it answers `decorators` by ARRAY membership,
// which the parsers agree on where the traversal key does not, and the computed key by node identity
function isClassEvalSlotChild(parentNode, childNode) {
  const slot = definitionTimeSlotOf(parentNode, childNode);
  return slot === 'decorators' || slot === 'key';
}

// the class's HERITAGE is earlier still: ClassHeritage is evaluated after the class's own decorators
// and before every member key and member decorator. so a use there outruns the whole body, and only
// the class's own decorator list runs ahead of it. the slot itself is the canon's - only a class
// node carries `superClass`, so naming the type again would narrow nothing
function isClassHeritageChild(parentNode, childNode) {
  return definitionTimeSlotOf(parentNode, childNode) === 'superClass';
}

// the pattern host's right-hand side, which runs before every slot of the pattern - `cur` must be
// the pattern itself, so a use anywhere below it is preceded by that whole expression. an
// `AssignmentPattern` is a host too, and the one that hides: `[b = USE] = RHS` reads its own default
// only after the RHS decided the slot was absent, and a `for-x` head evaluates its right side before
// binding anything on the left. a default is no host of a member TARGET, though: the reference is
// evaluated before the default is (`({ a: o[x = 'k'] = x } = v)` reads the new `x`), as the source spells it
function patternHostRhs(parentNode, childKey) {
  if (parentNode.type === 'VariableDeclarator' && childKey === 'id' && isDestructurePattern(parentNode.id)) return parentNode.init;
  if (parentNode.type === 'AssignmentExpression' && childKey === 'left' && isDestructurePattern(parentNode.left)) return parentNode.right;
  if (parentNode.type === 'AssignmentPattern' && childKey === 'left'
    && (isDestructurePattern(parentNode.left) || parentNode.left.type === 'Identifier')) return parentNode.right;
  if ((parentNode.type === 'ForOfStatement' || parentNode.type === 'ForInStatement') && childKey === 'left') return parentNode.right;
  return null;
}

// --- Source pattern order ---

// the destructuring hosts the file's PRISTINE tree spells (`patternOrderReducer`), per file root. a
// destructure render keeps the order a pattern runs in only on the source ranges of the nodes it moves:
// it lifts the prefix of a right-hand side ahead of the host, moves a computed key into the value of an
// extraction, re-hosts the rest of a pattern on a temp. so the order climbs below take the hosts holding
// a node by POSITION as well as off the live tree
const sourcePatternHosts = new WeakMap();

// spans of one tree - nested or disjoint - sorted by start, the outer of two starting together first,
// each with the index of the nearest span holding it: the spans holding a range are a search and a climb
function buildNestingIndex(entries) {
  entries.sort((a, b) => a.span.start - b.span.start || b.span.end - a.span.end);
  const holders = [];
  const open = [];
  for (const [i, { span }] of entries.entries()) {
    while (open.length && entries[open.at(-1)].span.end < span.end) open.pop();
    holders.push(open.at(-1) ?? -1);
    open.push(i);
  }
  return { entries, starts: entries.map(entry => entry.span.start), holders };
}

// the partners of the entries whose span holds `node`. a span starting at or before the node either
// holds it or ended before it, and every span holding it holds the last one starting before it
function nestingPartnersHolding(index, node) {
  const partners = [];
  if (!index?.entries.length || !hasRange(node)) return partners;
  let at = spanIndexFloor(index, node);
  while (at >= 0 && index.entries[at].span.end < node.end) at = index.holders[at];
  for (; at >= 0; at = index.holders[at]) partners.push(index.entries[at].partner);
  return partners;
}

// the node types `patternHostRhs` can answer for: every other node the census visits hosts no pattern
const PATTERN_HOST_TYPES = new Set(['VariableDeclarator', 'AssignmentExpression', 'AssignmentPattern', 'ForOfStatement', 'ForInStatement']);

// the hosts a destructuring pattern or a default runs after, read off the pristine tree for the order
// climbs, which find them by the file root an attached path climbs to - the census's first node
export function patternOrderReducer() {
  let root = null;
  const patterns = [];
  const values = [];
  return {
    visit(node) {
      root ??= node;
      if (!PATTERN_HOST_TYPES.has(node.type)) return;
      const key = node.type === 'VariableDeclarator' ? 'id' : 'left';
      const value = patternHostRhs(node, key);
      if (!hasRange(value) || !hasRange(node[key])) return;
      patterns.push({ span: node[key], partner: value });
      values.push({ span: value, partner: node[key] });
    },
    prepare() {
      if (root) sourcePatternHosts.set(root, { patterns: buildNestingIndex(patterns), values: buildNestingIndex(values) });
    },
    result() { return {}; },
  };
}

// does a WRITE sit in a slot its container evaluates early? the climb-from-the-write form, for a lane
// that has no use path at all - only a position bound. wider than the per-use answer by construction:
// it says the write's position proves nothing, never against which use
export function writeSitsInEarlySlot(writePath) {
  for (let cur = writePath, parent; parent = cur.parentPath; cur = parent) {
    const pnode = parent.node;
    if (!pnode) break;
    if ((CLASS_MEMBER_TYPES.has(pnode.type) || CLASS_NODE_TYPES.has(pnode.type))
      && isClassEvalSlotChild(pnode, cur.node)) return true;
    if (pnode.type === 'SwitchCase' && cur.key === 'test') return true;
    // the RHS slot of a destructuring host runs before the pattern it fills
    const rhsSlot = pnode.type === 'VariableDeclarator' ? 'init' : 'right';
    if (cur.key === rhsSlot && patternHostRhs(pnode, pnode.type === 'VariableDeclarator' ? 'id' : 'left') === cur.node) return true;
  }
  return false;
}

// ancestry containment, the counterpart of the positional `nodeRangeContains`: is `path` the
// ancestor path itself or below it? node identity as well as path identity, because two queries can
// hold different path objects for one node
export function pathIsInside(path, ancestor) {
  for (let cur = path; cur; cur = cur.parentPath) if (cur === ancestor || (cur.node && cur.node === ancestor.node)) return true;
  return false;
}

// the `default` clause is reached only once EVERY case test has run, and execution then falls out of
// it through each clause below - so a body at or after the default follows every test below it too
function switchTestsOutrunning(switchNode, caseNode) {
  const { cases } = switchNode;
  const defaultIndex = cases.findIndex($case => $case.test === null);
  const bodyIndex = cases.indexOf(caseNode);
  if (defaultIndex === -1 || bodyIndex < defaultIndex) return [];
  return cases.slice(bodyIndex + 1).map($case => $case.test).filter(Boolean);
}

// the slots whose evaluation runs ahead of THIS use's own, indexed for containment. a pure function
// of the use's ANCESTRY, so it is derived once per read: the callers ask it once per WRITE, and
// re-climbing per write made the question quadratic in writes x uses. keyed on the node but
// VALIDATED against the parent it was built under: the answer reads the chain ABOVE the node, which
// is not a function of the node alone, so a bare node key answers a second query from a stale first
// one once a rewrite has re-parented it. keying on the path instead would be exact and is wrong for
// a different reason - a caller holding a freshly built path then misses every time, and the memo
// stops paying for itself.
// the index is a sort by `start` plus a prefix maximum of `end`: containment is then one binary
// search, where a scan of the array cost O(container) per write and made the whole question cubic
const outrunningSpans = new WeakMap();
function outrunningSpansFor(usagePath) {
  if (!usagePath?.node) return null;
  const parentNode = usagePath.parentPath?.node ?? null;
  const memo = outrunningSpans.get(usagePath.node);
  if (memo && memo.parent === parentNode) return memo.index;
  const spans = [];
  let evalSlotChild = false;
  let caseNode = null;
  let root = usagePath.node;
  for (let cur = usagePath, parent; parent = cur.parentPath; cur = parent) {
    const pnode = parent.node;
    if (!pnode) break;
    root = pnode;
    if ((CLASS_MEMBER_TYPES.has(pnode.type) || CLASS_NODE_TYPES.has(pnode.type))
      && isClassEvalSlotChild(pnode, cur.node)) evalSlotChild = true;
    if (CLASS_NODE_TYPES.has(pnode.type)) {
      // a use in the heritage outruns every member slot, so only the class's OWN decorators are
      // ahead of it - the member slots belong to the late set instead
      if (isClassHeritageChild(pnode, cur.node)) spans.push(...pnode.decorators ?? []);
      // ... and of the slots ahead of a member's body, the ones the source places after the use: one
      // above it runs first by source order as well
      else if (!evalSlotChild) spans.push(...classEvalSlotsOf(pnode).filter(slot => !provablyPrecedes(slot, usagePath.node)));
      // the class's OWN decorator list against its heritage is the one pair the implementations
      // rank differently - the spec evaluates the decorator list before `ClassDefinitionEvaluation`
      // reaches the heritage, every downlevel lowering hoists the `extends` expression ahead of the
      // decorators it applies in a static block - so the pair is not ranked and BOTH sides claim the
      // outrun, the widening answer under either order (the mirror needs no such arm: the decorators
      // stand textually above the heritage, so the question is only ever asked in this direction)
      else if ((pnode.decorators ?? []).includes(cur.node) && pnode.superClass) spans.push(pnode.superClass);
      // an enclosing class ranks its own slots independently of this one
      evalSlotChild = false;
    }
    if (pnode.type === 'SwitchCase' && cur.listKey === 'consequent') caseNode = pnode;
    if (pnode.type === 'SwitchStatement' && caseNode) spans.push(...switchTestsOutrunning(pnode, caseNode));
    const rhs = patternHostRhs(pnode, cur.key);
    if (rhs) spans.push(rhs);
  }
  // ... and the values the source fills a pattern holding the use from, wherever a render left either
  spans.push(...nestingPartnersHolding(sourcePatternHosts.get(root)?.patterns, usagePath.node));
  const index = buildSpanIndex(spans);
  outrunningSpans.set(usagePath.node, { parent: parentNode, index });
  return index;
}

// sorted starts plus the running maximum of `end` over that order: a span containing `write` must
// start at or before it, and among those the widest end decides
function buildSpanIndex(spans) {
  const sorted = spans.filter(hasRange).sort((a, b) => a.start - b.start);
  const maxEnd = [];
  let running = -Infinity;
  for (const span of sorted) {
    running = Math.max(running, span.end);
    maxEnd.push(running);
  }
  return { starts: sorted.map(span => span.start), maxEnd, spans: sorted };
}

// the slots a container evaluates LATE - after the early ones a use may sit in. the complement of
// `classEvalSlotsOf` for the two containers that HOLD their late slots: a class runs every field
// VALUE and every static block after its keys and decorators, a `switch` runs every clause body
// after every test it evaluated. a destructuring host is late as a WHOLE - its pattern fills after
// its right-hand side - so there is no sub-slot to list and the caller pushes the host itself
function lateSlotsOf(node) {
  if (CLASS_NODE_TYPES.has(node.type)) {
    const slots = [];
    for (const member of node.body.body) {
      if (member.type === 'StaticBlock') slots.push(member);
      else if (member.value) slots.push(member.value);
    }
    return slots;
  }
  if (node.type === 'SwitchStatement') return node.cases.flatMap($case => $case.consequent);
  return [];
}

// the LATE slots of this use's containers - the ones whose evaluation runs after the use's own -
// indexed for containment: the mirror index of the twin above, built by the same climb.
// keyed on the node and VALIDATED against the parent it was built under, for the reason the twin
// above states: the answer reads the chain ABOVE the node, so a bare node key would serve a second
// query from a stale first one the moment a rewrite has re-parented it
const lateSpans = new WeakMap();
function lateSpansFor(usagePath) {
  if (!usagePath?.node) return null;
  const parentNode = usagePath.parentPath?.node ?? null;
  const memo = lateSpans.get(usagePath.node);
  if (memo && memo.parent === parentNode) return memo.index;
  const spans = [];
  let root = usagePath.node;
  for (let cur = usagePath, parent; parent = cur.parentPath; cur = parent) {
    const pnode = parent.node;
    if (!pnode) break;
    root = pnode;
    if ((CLASS_MEMBER_TYPES.has(pnode.type) || CLASS_NODE_TYPES.has(pnode.type))
      && isClassEvalSlotChild(pnode, cur.node)) {
      const cls = CLASS_NODE_TYPES.has(pnode.type) ? parent : parent.parentPath.parentPath;
      if (cls.node) spans.push(...lateSlotsOf(cls.node));
    }
    // the heritage runs before the member slots as well as before the bodies
    if (isClassHeritageChild(pnode, cur.node)) spans.push(...classEvalSlotsOf(pnode), ...lateSlotsOf(pnode));
    if (pnode.type === 'SwitchCase' && cur.key === 'test' && parent.parentPath.node) {
      spans.push(...lateSlotsOf(parent.parentPath.node));
    }
    const pattern = patternHostRhs(pnode, pnode.type === 'VariableDeclarator' ? 'id' : 'left');
    if (pattern === cur.node) spans.push(pnode.type === 'VariableDeclarator' ? pnode.id : pnode.left);
  }
  spans.push(...nestingPartnersHolding(sourcePatternHosts.get(root)?.values, usagePath.node));
  const index = buildSpanIndex(spans);
  lateSpans.set(usagePath.node, { parent: parentNode, index });
  return index;
}

// the MIRROR of `writeOutrunsUse`: does the USE run BEFORE a write the source places above it? only
// within one container, and only between its two halves - a use in an early slot (a class key or
// decorator, a case test, a destructuring right-hand side) against a write in a late one (a field
// value or static block, a clause body, the pattern). asked as a RELATION, not of the use alone: a
// use in an early slot is ordered normally against every write OUTSIDE its container, and a rule
// that declined on the use alone refused every parameter default in the corpus
export function useOutrunsWrite(write, usagePath) {
  if (!hasRange(write)) return false;
  return spanIndexContains(lateSpansFor(usagePath), write);
}

// the same question `writeOutrunsUse` answers, asked of a whole violation list. the index is a fact
// of the USE alone, so a use with no outrunning slot answers `false` for every write at once - and
// that is nearly every use in real source (96-100% of the calls a real bundle makes). asking per
// write instead made the call count the product of writes and reads
export function anyWriteOutrunsUse(violationNodes, usagePath) {
  const index = outrunningSpansFor(usagePath);
  if (!index?.starts.length) return false;
  return violationNodes.some(node => writeOutrunsUse(node, usagePath));
}

// how many entries of a sorted `list`, from `from` up to `to`, come before a bound: `before` holds for a prefix of
// that range and fails for the rest, and the answer is where it first fails. the one binary search over sorted
// positions - spans, statements, writes, comments, line starts
export function sortedPrefixLength(list, before, from = 0, to = list.length) {
  let lo = from;
  let hi = to;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (before(list[mid])) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

// position of the last span starting at or before the node, -1 when every span starts after it. the
// ONE search over a span index - both questions asked of one below read it
function spanIndexFloor(index, node) {
  // read once: inside the predicate the node is read again at every probe of the search
  const { start } = node;
  return sortedPrefixLength(index.starts, entry => entry <= start) - 1;
}

// containment against a span index: the floor span, then the running maximum of `end` over that
// prefix. ONE routine for both directions of the clock
function spanIndexContains(index, node) {
  if (!index?.starts.length) return false;
  const at = spanIndexFloor(index, node);
  return at >= 0 && index.maxEnd[at] >= node.end;
}

// the index's other question: WHICH span holds the node, not merely whether one does. answerable
// only over spans that do not NEST - a statement list - where the floor span is the sole candidate
function spanIndexOwner(index, node) {
  const at = spanIndexFloor(index, node);
  return at >= 0 && index.spans[at].end >= node.end ? index.spans[at] : null;
}

// per statement LIST, the disjoint spans its members occupy - the placement a write whose parent
// chain cannot be climbed is found by. the SPANS are what the list is asked for: the member paths a
// container cache hands out keep their identity while an emitter REPLACES the statement under one
// of them, so a snapshot of those member NODES answers about a statement no longer in the list -
// while the spans a replacement takes over are the ones it was printed from
const siblingSpansCache = new WeakMap();
function siblingSpanIndex(siblings) {
  let index = siblingSpansCache.get(siblings);
  if (!index) {
    const spans = [];
    for (const [i, sibling] of siblings.entries()) {
      // a path whose statement an emitter dropped survives in the list the container cache handed
      // out - it occupies no span and hosts nothing, which is the answer either way
      const { node } = sibling;
      if (node) spans.push({ start: node.start, end: node.end, i });
    }
    siblingSpansCache.set(siblings, index = buildSpanIndex(spans));
  }
  return index;
}

// which member of a statement list hosts `target`, -1 when none does. one question, asked by the
// scans that used to walk the list a member at a time. a PATH answers by climbing its own ancestry
// to the slot of THIS list and reading the slot's index off the path: the tree says where it sits
// whatever its positions claim, and the slot is read LIVE, so a statement an emitter replaced -
// the ctor-alias rewrite swaps a whole `ExpressionStatement` - still places the writes under it.
// a bare NODE has only its span, and a list's spans are disjoint and ascending, so the search that
// places it is one step.
// the climb needs no test of WHICH list the step sits in: the hosts of a statement list are the
// brace blocks, the Program and a `SwitchCase`, and the only other array slot any of them carries
// is babel's `directives`, whose members hold a string literal and so stand on no reference's
// ancestry - a numeric-keyed step under the container is a member of THIS list
export function siblingHostingIndex(siblings, target) {
  if (target.parentPath === undefined) {
    return spanIndexOwner(siblingSpanIndex(siblings), target)?.i ?? -1;
  }
  const [first] = siblings;
  // the list may be EMPTY - a block an emitter drained hosts nothing, and the container the climb
  // compares against is read off a member of the list
  const container = first?.parentPath.node ?? null;
  if (!container) return -1;
  for (let cur = target; cur; cur = cur.parentPath) {
    if (typeof cur.key === 'number' && cur.parentPath.node === container) return cur.key;
  }
  return -1;
}

// does a write the source places AFTER a use nevertheless run BEFORE it? three containers evaluate
// one slot ahead of another slot they also host, whatever the source order puts first, and no
// positional test can see it - the write's span simply sits past the use:
//   - a CLASS evaluates every computed key and every decorator expression at definition time, ahead
//     of every static field and static block;
//   - a `switch` evaluates every case TEST before it reaches the `default` body, and execution falls
//     out of that body through every clause below it, so those bodies follow those tests too;
//   - a DESTRUCTURING host evaluates its whole right-hand side before any slot of its pattern.
// asked by climbing from the USE and testing the write by SPAN, not the other way round: the use's
// ancestry is always well formed, while a write's may be detached by a rewrite or, for a decorator,
// not walked at all by one of the two parsers. the disorder is scoped to the container - a use
// OUTSIDE it stays positional, as does one in a slot that ranks against the write's by source order
// (two keys of one class, a case body a matching test of its own could have reached)
export function writeOutrunsUse(write, usagePath) {
  if (!hasRange(write)) return false;
  return spanIndexContains(outrunningSpansFor(usagePath), write);
}

// the position `path` is evaluated at: its own start, or - in a slot that runs after an early one the
// source places past it (`writeOutrunsUse`'s spans: a pattern after its host's right-hand side) - the
// end of the latest such early slot. read by POSITION, not containment, so it survives a render that
// lifts an early write out of its host: planted ahead of the host, it still precedes that end
function evaluationPosition(path) {
  const index = outrunningSpansFor(path);
  const { start } = path.node;
  return index?.maxEnd.length ? Math.max(start, index.maxEnd.at(-1)) : start;
}

// does a write the source places ABOVE `ranked` - a write a positional lane ranked as the last one
// - run after it all the same, and before the use? a write in a pattern whose host's right-hand side
// holds `ranked` does (`({ [x = [1]]: o.k } = (x = 'ab', o))`), as does one in the pattern a
// destructure render left behind after lifting `ranked` out of that right-hand side. a use evaluated
// at the same position - a later slot of the same pattern - ranks against it by source order
export function writeRunsPastRanked(write, ranked, usagePath) {
  const node = write?.node;
  if (!hasRange(node) || !hasRange(ranked) || node.start >= ranked.start || !usagePath?.node) return false;
  const at = evaluationPosition(write);
  if (at < ranked.end) return false;
  const useAt = evaluationPosition(usagePath);
  return at < useAt || (at === useAt && node.start < usagePath.node.start);
}

// the identifiers a construct DECLARES - the leaves of its binding patterns, its own name, an
// import's local - as node identities: the reference walk skips exactly those nodes, so a
// same-named declaration in the subtree does not read as a read. null for a node declaring nothing
export function declaredIdentifierNodes(node) {
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

// Whether a reference names the queried string or any name in the supplied Set. A set query
// walks the subtree once, even when a retained body declares many candidate shadows.
export function identifierReferencedInSubtree(node, name) {
  return identifierReferencedIn(node, typeof name === 'string' ? id => id.name === name : id => name.has(id.name), null);
}

// `declared`: the identifier nodes an enclosing construct declares - a declaration of the name is
// not a reference to it
function identifierReferencedIn(node, matches, declared) {
  if (!node || typeof node !== 'object' || typeof node.type !== 'string') return false;
  if (node.type === 'Identifier') return matches(node) && !declared?.has(node);
  // a JSX tag name can be a runtime reference to the binding, and then it is the same KIND of extra
  // caller a bare `return f` is: the element hands the component to a renderer that calls it with
  // props, so the param default never runs there. namespaced parts name no binding
  if (node.type === 'JSXNamespacedName') return false;
  // which tag spelling references is the canon's question; a MEMBER tag recurses so its root is
  // reached in the referencing position. attributes carry arbitrary expressions and stay in the walk
  if (node.type === 'JSXOpeningElement' || node.type === 'JSXClosingElement') {
    const tag = node.name;
    if (tag?.type === 'JSXIdentifier'
      ? jsxIdentifierReferencesBinding(tag, node) && matches(tag)
      : identifierReferencedIn(tag, matches, declared)) return true;
    return (node.attributes ?? []).some(attr => identifierReferencedIn(attr, matches, declared));
  }
  // reached only as a JSXMemberExpression root now - the referencing position
  if (node.type === 'JSXIdentifier') return matches(node);
  if (TYPE_SPACE_NODE_TYPES.has(node.type)) return false;
  const own = declaredIdentifierNodes(node);
  // Only queried spellings can match; unrelated declarations need not be copied down
  // into every nested scope. The set belongs to this call, not to the declaration census.
  if (own) for (const id of own) if (!matches(id)) own.delete(id);
  const inner = !own?.size ? declared : !declared ? own : new Set([...declared, ...own]);
  // recurse, skipping the source-text name slots `isNonReferencePosition` recognises (member tail,
  // object / class / method / field key, label, import / export specifier, JSX attribute name /
  // member-tag tail) - those are name literals, not references - and the type-space slots
  // eslint-disable-next-line no-restricted-syntax -- perf: AST hot path, plain objects
  for (const key in node) {
    const child = node[key];
    if (TYPE_SPACE_CHILD_KEYS.has(key)) continue;
    if (Array.isArray(child)) {
      if (isNonReferencePosition(node, child)) continue;
      for (const grandchild of child) if (identifierReferencedIn(grandchild, matches, inner)) return true;
    } else if (isASTNode(child) && !isNonReferencePosition(node, child) && identifierReferencedIn(child, matches, inner)) return true;
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

// is `host` the single-statement slot of `parent`? composed on the canonical slot table, which
// already carries the two-slot IfStatement (`consequent` / `alternate`); the concise-body arrow is
// the one host outside it (its slot holds an EXPRESSION, so the statement table has no entry).
// NOTE the answer is "this IS the slot", NOT "this slot needs braces": a BRACED body occupies the
// same slot and answers true - callers that emit multiple statements must test the host's own type.
// callers pass raw nodes - works uniformly across babel paths and estree-toolkit paths
export function isBodylessStatementSlot(parent, host) {
  if (!parent) return false;
  if (parent.type === 'ArrowFunctionExpression') return parent.body === host;
  return (SINGLE_STATEMENT_SLOTS.get(parent.type) ?? []).some(slot => parent[slot] === host);
}

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

// Is the declaration the initializer of a for statement? A declaration in its body has
// the same parent type but does not share the initializer's restrictions on memo placement.
export function isForInitDeclaration(declarationParent, declaration) {
  return declarationParent?.type === 'ForStatement' && declarationParent.init === declaration;
}

// Member ancestry, the nearest var-scope owner of a path (`findNearestVarScopeOwner`) and the value
// canon's per-node answers (`canonAnswerTable`) are reusable only inside a read-only traversal.
// Replacing an interior ancestor can preserve both endpoint paths, so endpoint checks cannot validate a
// cached run. Scope them to the synchronous walk; pure emission and later sibling passes stay live.
let memberContextPaths = null;
let varScopeOwners = null;
let canonAnswers = null;
export function withTraversalCaches(readOnly, visit) {
  const previousPaths = memberContextPaths;
  const previousOwners = varScopeOwners;
  const previousAnswers = canonAnswers;
  memberContextPaths = readOnly ? new WeakMap() : null;
  varScopeOwners = readOnly ? new WeakMap() : null;
  canonAnswers = readOnly ? { tables: new Map(), spineRoots: new WeakMap(), cuts: 0 } : null;
  try {
    return visit();
  } finally {
    memberContextPaths = previousPaths;
    varScopeOwners = previousOwners;
    canonAnswers = previousAnswers;
  }
}

// ... and outside such a traversal for one synchronous question, during which nothing is rewritten:
// a descent asking each level of a chain what its left decides walks every level once, and the
// lookups from every operand of a long selection climb it once. a caller may hand the question a
// scope (`canonQuestionScope`) it kept from an earlier one, where nothing was rewritten in between
export function withCanonQuestion(question, scope = null) {
  if (canonAnswers) return question();
  const previousPaths = memberContextPaths;
  const previousOwners = varScopeOwners;
  const kept = scope ?? canonQuestionScope();
  canonAnswers = kept.answers;
  memberContextPaths = kept.paths;
  varScopeOwners ??= kept.owners;
  try {
    return question();
  } finally {
    canonAnswers = null;
    memberContextPaths = previousPaths;
    varScopeOwners = previousOwners;
  }
}

// the answers, the member ancestry and the var-scope owners one question keeps (`withCanonQuestion`)
export function canonQuestionScope() {
  return { answers: { tables: new Map(), spineRoots: new WeakMap(), cuts: 0 }, paths: new WeakMap(), owners: new WeakMap() };
}

// the var-scope owners alone, kept for a walk that rewrites (`withTraversalCaches` keeps them for a
// read-only one) where the parser keys a path by its parent PATH: a path then keeps its parent for
// life, no render swaps a function or a class in under a path that exists, and a subtree a render
// moves into a new activation (`renderMemoActivation`, a memo IIFE) is reached through new paths -
// so the owner a path climbs to holds. estree-toolkit and babel 8 are such parsers; babel 7 keys a
// path by its parent NODE and re-parents it where the node is reached anew
export function withVarScopeOwners(visit) {
  const previousOwners = varScopeOwners;
  varScopeOwners ??= new WeakMap();
  try {
    return visit();
  } finally {
    varScopeOwners = previousOwners;
  }
}

// a walk handed a cycle guard (`seen`) cuts itself short at a member it finds there. the value canon
// tests its guard through here, so the open scope counts the cuts: a walk that met none found no member
// of the guard it was handed, and handed any part of that guard it takes the same steps (`cycleGuardCuts`)
export function cycleGuardHas(seen, element) {
  if (!seen?.has(element)) return false;
  if (canonAnswers) canonAnswers.cuts++;
  return true;
}

// the cuts the open scope has met so far (`cycleGuardHas`)
export function cycleGuardCuts() {
  return canonAnswers?.cuts ?? 0;
}

// a question asked inside a guarded re-entrant one - a presence test's own read, an in-flight binding
// lookup, the adapter's decision-root lookup, the census pre-pass - can answer narrower than a fresh ask of
// the same node, so it neither reads nor keeps a per-node answer. all but the presence test narrow the
// DECISIONS asked under them as well (`narrowingQuestions`), each `kind` its own way: the census pre-pass
// (`census`) reads no census yet, a binding lookup (`lookup`) refuses its own re-entry (`refuseReentry`), and a
// decision-root lookup (`root`) has a decision asked inside it answer by its presence test alone. a guard's
// settling asks its host afresh (`settledSelection`), which only the presence test's own read lets it do
// (`withPresenceReadQuestion`)
let reentrantQuestions = 0;
const narrowingQuestions = { census: 0, lookup: 0, root: 0 };
export function withReentrantQuestion(question, kind) {
  reentrantQuestions++;
  narrowingQuestions[kind]++;
  try {
    return question();
  } finally {
    reentrantQuestions--;
    narrowingQuestions[kind]--;
  }
}

// ... and the re-entries the lookups in flight refused so far (`withBindingLookupGuard`)
let refusedReentries = 0;
export function refuseReentry() {
  refusedReentries++;
}

// ... the presence test's own read, re-entrant for the per-node answers alone
export function withPresenceReadQuestion(question) {
  reentrantQuestions++;
  try {
    return question();
  } finally {
    reentrantQuestions--;
  }
}

// a recursive walk cut at its depth budget: it answers unknown, and unlike a cycle guard's cut the answers
// around it are kept: only a chain past every realistic spelling meets the budget, and a walk refused its
// memos there would grow with the square of the chain
export function cutDeepWalk() {
  return null;
}

// the per-node answers one question `kind` keeps under one `context` - every input the answer reads
// besides the node - or null where none may be kept: no scope is open, or the ask is re-entrant. climbs from
// deep leaves and alias-chain walks still repeat per visit
export function canonAnswerTable(kind, context) {
  if (!canonAnswers || reentrantQuestions) return null;
  let table = canonAnswers.tables;
  for (const part of [kind, ...context]) {
    let next = table.get(part);
    if (!next) table.set(part, next = new Map());
    table = next;
  }
  return table;
}

// the path a per-node answer keys its read anchor by. a `||` / `??` / `&&` LEFT operand, parens
// around it included, opens no scope, frame or branch and starts where its parent does, so a read the
// value canon anchors anywhere on a selection's left spine answers as one anchored at the spine's
// root; inside a read-only traversal the visits down a long chain share one answer per level through
// it, and a walk anchored there climbs from the root, not across the levels above its own
export function canonContextPath(path) {
  const roots = canonAnswers?.spineRoots;
  if (!roots || !path?.node) return path;
  const pending = [];
  let current = path;
  while (true) {
    const hit = roots.get(current);
    if (hit) {
      current = hit;
      break;
    }
    pending.push(current);
    let operand = current;
    while (operand.parentPath?.node?.type === 'ParenthesizedExpression') operand = operand.parentPath;
    const parent = operand.parentPath;
    if (parent?.node?.type !== 'LogicalExpression' || parent.node.left !== operand.node) break;
    current = parent;
  }
  for (const step of pending) roots.set(step, current);
  return current;
}

// Member links introduce no scope or type context, on either their object or key side, and neither
// does a `||` / `??` / `&&` operand or a paren around one: every climb through here looks for a scope,
// frame or type host above them, and a lookup from each level of a long selection climbed the whole
// selection again. Share their outermost path during read-only walks; otherwise follow the current
// tree, through member links alone - an uncached run saves the climb nothing it would not walk anyway.
export function memberContextPath(path) {
  if (!contextFreeLink(path)) return path;
  // A single link is already the answer; ordinary short accesses need no cache entry.
  if (!contextFreeLink(path.parentPath)) return path.parentPath;
  const pending = memberContextPaths ? [] : null;
  let current = path;
  while (contextFreeLink(current)) {
    const hit = memberContextPaths?.get(current);
    if (hit) {
      current = hit;
      break;
    }
    pending?.push(current);
    current = current.parentPath;
  }
  if (pending) for (const step of pending) memberContextPaths.set(step, current);
  return current;
}

// does `path` hang off its parent by a link `memberContextPath` climbs through: both ends are
// context-free - a member below a member, or (read-only walks) a member, selection or paren below a
// selection or paren. anything else below a paren (an IIFE's function) opens the very context a climb
// looks for
const SELECTION_LINK_TYPES = new Set(['LogicalExpression', 'ParenthesizedExpression']);
function contextFreeLink(path) {
  const { node } = path ?? {};
  const parent = path?.parentPath?.node;
  if (isMemberAccessNode(parent)) return isMemberAccessNode(node);
  return !!memberContextPaths && SELECTION_LINK_TYPES.has(parent?.type)
    && (isMemberAccessNode(node) || SELECTION_LINK_TYPES.has(node?.type));
}

// walk `path`'s ancestor chain (inclusive) and return the first path whose node owns a
// var scope - the boundary a `var` declared anywhere below it hoists to. returns null if
// the chain reaches the root without one (shouldn't happen for an attached node: Program
// is always a boundary). shared by the var-membership walk and the namespace-scope check.
// a function entered through a definition-time slot (`definitionTimeSlotOf`: a method's computed key, a
// decorator) is no boundary: the slot runs where ESTree's method wrapper stands
export function findNearestVarScopeOwner(path) {
  let owner = varScopeOwners?.get(path);
  if (owner !== undefined) return owner;
  owner = null;
  for (let cur = memberContextPath(path), child = null; cur; child = cur, cur = memberContextPath(cur.parentPath)) {
    if (isVarScopeBoundary(cur.node?.type) && !(child && definitionTimeSlotOf(cur.node, child.node))) {
      owner = cur;
      break;
    }
  }
  if (path) varScopeOwners?.set(path, owner);
  return owner;
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

// both parameter owners of this path from ONE climb to the nearest function, asked once per use node:
// that function where its parameter list holds the path (`paramOwner`), and the catch clause whose
// PARAMETER holds it (`catchParamOwner`), each or null - and the parameter regions that function itself
// stands in (`closureRegions`). a parameter list is its own lexical region: what the function BODY
// declares does not cover a use there (`function f(x = Map) { var Map = 1 }` reads the OUTER `Map`), and
// a use in a closure written in the list has that closure for its nearest function - the list is one of
// the closure's regions. a catch parameter is evaluated outside the clause's body block, so what that
// block binds in itself does not cover a use there - a `var` it declares hoists past the clause and
// covers it
function enclosingParameterOwners(usePath) {
  let catchParamOwner = null;
  let child = memberContextPath(usePath);
  for (let p = child?.parentPath; p?.node; child = memberContextPath(p), p = child.parentPath) {
    if (FUNCTION_LIKE_NODE_TYPES.has(p.node.type)) {
      return { paramOwner: p.node.params?.includes(child.node) ? p : null, catchParamOwner, closureRegions: parameterRegionsHolding(p) };
    }
    if (!catchParamOwner && p.node.type === 'CatchClause' && p.node.param === child.node) catchParamOwner = p;
  }
  return { paramOwner: null, catchParamOwner, closureRegions: NO_PARAMETER_REGIONS };
}

// the parameter regions a closure is written in: the functions whose parameter list holds it and the catch
// clauses whose parameter holds it, through every frame outward. it runs where that parameter is
// evaluated - its free names read past what the owner's body declares, which only a parameter itself
// cannot see as well (`function f(p = () => x) { var x }` reads the outer `x`). a fact of the function
// node, so each is climbed once
const NO_PARAMETER_REGIONS = { functions: [], clauses: [] };
const parameterRegionsCache = new WeakMap();
function parameterRegionsHolding(fnPath) {
  let regions = parameterRegionsCache.get(fnPath.node);
  if (regions) return regions;
  const functions = [];
  const clauses = [];
  for (let child = fnPath, p = fnPath.parentPath; p?.node; child = p, p = p.parentPath) {
    if (p.node.type === 'CatchClause' && p.node.param === child.node) clauses.push(p.node);
    if (FUNCTION_LIKE_NODE_TYPES.has(p.node.type)) {
      if (p.node.params?.includes(child.node)) functions.push(p.node);
      const outer = parameterRegionsHolding(p);
      functions.push(...outer.functions);
      clauses.push(...outer.clauses);
      break;
    }
  }
  regions = functions.length || clauses.length ? { functions, clauses } : NO_PARAMETER_REGIONS;
  parameterRegionsCache.set(fnPath.node, regions);
  return regions;
}

// does this node run in an activation that owns no var slot - a parameter list, or an INSTANCE field
// initializer? a ref declared for it lands in the enclosing scope and is shared by every call or
// construction, so a re-entrant one (a getter calling back in mid-destructure) overwrites the ref
// the outer activation still reads
export function runsWithoutOwnVarSlot(path) {
  for (let child = path, p = path?.parentPath; p?.node; child = p, p = p.parentPath) {
    if (isDeferredContextStep(p.node, child)) {
      return !FUNCTION_LIKE_NODE_TYPES.has(p.node.type) || !!p.node.params?.includes(child.node);
    }
    if (isVarScopeBoundary(p.node.type) && !FUNCTION_LIKE_NODE_TYPES.has(p.node.type)) return false;
  }
  return false;
}

// The returned expression of an actual allocator-owned lexical activation after its
// last memo declaration disappeared. Source IIFEs and sibling-modified frames stay intact.
export function emptyMemoActivationValue(node, ownedActivations) {
  const callee = node?.callee;
  const body = callee?.body;
  if (node?.type !== 'CallExpression' || node.optional || !ownedActivations?.has(callee)
    || callee.type !== 'ArrowFunctionExpression' || callee.async || callee.generator
    || callee.params.length || node.arguments.length || body?.type !== 'BlockStatement'
    || body.body.length !== 1 || body.directives?.length || body.body[0].type !== 'ReturnStatement') return null;
  return singleReturnBodyExpression(body);
}

// The expression slot that can give a parameter or instance-field memo its own activation.
// Function bodies already own vars. Parameter keys/defaults and field values keep lexical
// this, arguments, super and new.target when the binding wraps this slot in an arrow.
export function varlessMemoSlot(path) {
  let slot = null;
  for (let child = path, p = path?.parentPath; p?.node; child = p, p = p.parentPath) {
    if (p.node.type === 'AssignmentPattern' && p.node.right === child.node) slot ??= { owner: p.node, key: 'right' };
    if (p.node.computed && p.node.key === child.node) slot ??= { owner: p.node, key: 'key' };
    if (CLASS_NODE_TYPES.has(p.node.type) && p.node.superClass === child.node) slot ??= { owner: p.node, key: 'superClass' };
    if (CLASS_FIELD_TYPES.has(p.node.type) && p.node.value === child.node) slot ??= { owner: p.node, key: 'value' };
    if (isDeferredContextStep(p.node, child)) {
      if (FUNCTION_LIKE_NODE_TYPES.has(p.node.type)) return p.node.params?.includes(child.node) ? slot : null;
      return slot;
    }
    if (isVarScopeBoundary(p.node.type) && !FUNCTION_LIKE_NODE_TYPES.has(p.node.type)) return null;
  }
  return null;
}

// the nodes proven to sit in no definition-time slot ANYWHERE above them. the climb runs per
// binding lookup and reaches the program root on every file whose code stands in no such slot - one
// file of ordinary code took two and a half million ancestor steps through it - so each walk marks
// the chain it proved and every later lookup stops at the first mark. only the NEGATIVE is kept: it
// is the answer that repeats, and it holds no path a later mutation could stale
const noDefinitionTimeSlotAbove = new WeakSet();

// the var-scope FRAME a definition-time slot puts a use outside of, or null - decided by the node
// that HOLDS the slot. a function's own computed key and decorators are evaluated where the class
// (or the object literal) is defined, so that function's frame - its parameters AND its body -
// covers nothing they read; a parameter's decorator is evaluated outside the function that
// parameter belongs to, so that function is the frame. a CLASS (its heritage, its own decorators)
// and a FIELD (its computed key, its decorators) open no frame of their own and answer null: a
// `var` around the class really does cover those slots.
// WHICH node holds a method's slots is a parser-dialect fact - babel hangs the key and the
// decorators off the function node itself, estree off the `MethodDefinition` / `Property` wrapper
// above it - so this answers null on the estree leg for the same source, where the shape already
// puts the slot outside the frame, and the two legs draw ONE region
function definitionTimeSlotFrameOf(holderPath) {
  const holder = holderPath?.node;
  if (!holder) return null;
  if (FUNCTION_LIKE_NODE_TYPES.has(holder.type)) return holderPath;
  const owner = holderPath.parentPath;
  return owner?.node && FUNCTION_LIKE_NODE_TYPES.has(owner.node.type)
    && owner.node.params?.includes(holder) ? owner : null;
}

// every frame a definition-time slot puts this use outside of, in ONE climb, plus the
// parameter-decorator one named apart. the two views differ by what asks: a PATH climb walks
// frames the language never opened for the use and owes the whole set, while the region test over
// a NATIVE binding owes only the parameter arm - both trackers already scope a method's own key
// and decorators out of that method, and widening the region test there would report a binding
// declared INSIDE the key as invisible to a use inside it
function definitionTimeUseFrames(usePath) {
  const proved = [];
  let frames = null;
  let parameterDecoratorOwner = null;
  for (let p = usePath; p?.node; p = p.parentPath) {
    if (noDefinitionTimeSlotAbove.has(p.node)) break;
    const parent = p.parentPath?.node;
    // only a parent that HOLDS one of the slots can answer, and that property read is what keeps
    // the walk off the canon call on every other step
    const slot = parent && (parent.decorators?.length || parent.key || parent.superClass)
      ? definitionTimeSlotOf(parent, p.node) : null;
    if (!slot) {
      proved.push(p.node);
      continue;
    }
    // nothing BELOW a slot is proven clean of one
    proved.length = 0;
    const frame = definitionTimeSlotFrameOf(p.parentPath);
    if (frame) (frames ??= new Set()).add(frame.node);
    // ... and the parameter arm takes the innermost frame a slot's holder is NOT: a frame that IS
    // its holder belongs to a member's or a class's own decorator, never to a parameter's
    if (frame && frame.node !== parent) parameterDecoratorOwner ??= frame;
  }
  for (const node of proved) noDefinitionTimeSlotAbove.add(node);
  return { frames, parameterDecoratorOwner };
}

// the frames a USE sits OUTSIDE of - the owner of the parameter list holding it, the owner of the
// parameter decorator hanging over it, the catch clause whose parameter holds it, the parameter regions
// a closure around it is written in, and every frame a definition-time slot places it outside - asked by
// every climb a binding lookup makes (the var-owner climb, the region test, the runtime-binding scan):
// answered ONCE per use node. a node keeps its slot position for the life of the tree, so the memo has
// nothing to stale
const NO_USE_REGION_FRAMES = {
  paramOwner: null,
  decoratedOwner: null,
  catchParamOwner: null,
  closureRegions: NO_PARAMETER_REGIONS,
  definitionTimeFrames: null,
};
const useRegionFramesCache = new WeakMap();
function useRegionFrames(usePath) {
  usePath = memberContextPath(usePath);
  const node = usePath?.node;
  if (!node) return NO_USE_REGION_FRAMES;
  let frames = useRegionFramesCache.get(node);
  if (!frames) {
    const { frames: definitionTimeFrames, parameterDecoratorOwner } = definitionTimeUseFrames(usePath);
    const { paramOwner, catchParamOwner, closureRegions } = enclosingParameterOwners(usePath);
    frames = { paramOwner, decoratedOwner: parameterDecoratorOwner, catchParamOwner, closureRegions, definitionTimeFrames };
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

// is this binding unreachable from the use? four REGIONS answer yes, each one a place where a scope
// tracker hoists a declaration onto an enclosing scope that the use position never sees: a use in the
// PARAMETER LIST cannot see what the BODY declares - its `var`s included, which live in a variable
// environment of their own once the list holds an expression - a use in a parameter DECORATOR cannot
// see anything the decorated function declares at all - neither its parameters nor its body - a use
// in a CATCH PARAMETER cannot see what the clause's body binds in itself (a `var` there hoists past the
// clause to the function and does cover it), and a use in a statement HEAD cannot see what that
// statement's BODY declares (a `var` there hoists past the statement and covers the head too). a use
// inside a closure written in a parameter list or a catch parameter is in that region as well
// (`closureRegions`). the var climb asks the same regions of a hoisted `var` (`climbVarScopeOwners`).
// the walk is the BINDING's own ancestry, which the region test needs anyway: the parameter regions
// are compared node-wise as it climbs, and the statement-head question is asked only where the
// binding really sits in a body slot
export function bindingInvisibleFromUseRegion(bindingPath, usePath) {
  if (!bindingPath?.node || !usePath?.node) return false;
  const { paramOwner, decoratedOwner, catchParamOwner, closureRegions } = useRegionFrames(usePath);
  const decorated = decoratedOwner?.node ?? null;
  const paramBody = decorated ? null : paramOwner?.node?.body ?? null;
  const { chain, heads } = bindingAncestryFacts(bindingPath);
  const blockBound = !!(catchParamOwner || closureRegions.clauses.length || heads.length) && bindsInItsBlock(bindingPath);
  const catchBody = catchParamOwner && blockBound ? catchParamOwner.node.body : null;
  const { functions, clauses } = closureRegions;
  // a use in no parameter region (every use of ordinary code) asks only the statement-head
  // question, and only of the hosts the binding really sits in a body slot of - usually none
  if (!decorated && !paramBody && !catchBody && !functions.length && !(blockBound && clauses.length)) {
    return blockBound && heads.some(({ host, slots }) => useSitsInStatementHead(usePath, host, slots));
  }
  for (const { node, listKey, slots } of chain) {
    // a binding written INSIDE a decorator is not something the decorated function declares - it
    // sits in the same subtree as the use and covers it. a lexical lookup cannot hand back a
    // SIBLING decorator's binding, so reaching this edge at all means the two share the decorator
    if (decorated && listKey === 'decorators') return false;
    if ((decorated && node === decorated) || (paramBody && node === paramBody) || (catchBody && node === catchBody)) return true;
    if (functions.some(fn => fn.body === node) || (blockBound && clauses.some(clause => clause.body === node))) return true;
    if (slots && blockBound && useSitsInStatementHead(usePath, node, slots)) return true;
  }
  return false;
}

// the binding a use resolves to once every binding it cannot see is passed over: each gives way to what
// `outer` answers for it - the lookup in its own scope's parent, or a twin a tracker re-anchors in that
// scope - as the language goes on outward where a tracker stopped. `invisible` says which bindings the use
// cannot see: by default the region rule above, which a tracker hoisting a declaration past its region
// breaks (babel's lookup from a parameter decorator reaches the decorated function's own names)
export function closestBindingVisibleAtUse(binding, path, { outer, invisible = bindingInvisibleFromRegionAt }) {
  let visible = binding;
  while (visible && invisible(visible, path)) visible = outer(visible);
  return visible;
}

function bindingInvisibleFromRegionAt(binding, path) {
  return !!path && !!binding.path && bindingInvisibleFromUseRegion(binding.path, path);
}

// does the declaration at `declarationPath` bind its name in the block holding it: a `let` / `const` /
// `using` declarator, a class, a block-level function no Annex-B hoist carries past the block
function bindsInItsBlock(declarationPath) {
  const { node } = declarationPath;
  if (node.type === 'VariableDeclarator') return declarationPath.parentPath?.node?.kind !== 'var';
  if (node.type === 'FunctionDeclaration') return !annexBHoistOutrunsBinding(declarationPath);
  return node.type === 'ClassDeclaration';
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
  // ... a use inside a DEFINITION-TIME slot sits outside the frames that slot's holder opens
  // altogether - a method's computed key and its decorators, and a decorator hanging off one of its
  // parameters, are all evaluated where the class is defined - so those functions' own hoists reach
  // it no more than their parameters do. only THOSE frames are skipped: a `var` further out really
  // does cover the slot. this is where `var` parts from the region cases, which it otherwise
  // ignores, and the climb owes the whole set because it walks frames the language never opened
  // ... and a use inside a closure written in a parameter list sits outside that list's owner the same way
  const { paramOwner, closureRegions, definitionTimeFrames } = useRegionFrames(path);
  const paramFrame = paramOwner?.node ?? null;
  for (let owner = findNearestVarScopeOwner(path); owner; owner = findNearestVarScopeOwner(owner.parentPath)) {
    if (owner.node !== paramFrame && !closureRegions.functions.includes(owner.node) && !definitionTimeFrames?.has(owner.node)) {
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
export function invalidateScopeVarIndex(path, rewrittenAncestors = null) {
  const owner = findNearestVarScopeOwner(path);
  // A sibling lowering can replace lexical declarations with vars and move writes.
  // Final memo proofs need the live indexes, once per ancestor in that emission phase.
  if (rewrittenAncestors) for (let p = path; p?.node; p = p.parentPath) {
    if (rewrittenAncestors.has(p.node)) continue;
    rewrittenAncestors.add(p.node);
    scopeVarsCache.delete(p.node);
    scopeReassignCache.delete(p.node);
    ownerParentIndexCache.delete(p.node);
    ownerWritePathIndexCache.delete(p);
    valueFlowOwnerIndexCache.delete(p.node);
    useRegionFramesCache.delete(p.node);
  } else if (owner?.node) scopeVarsCache.delete(owner.node);
  bindingLookupGeneration += 1;
}

// the closest-binding answer for one (scope, name, use node), kept across the consumers that ask it
// again: a member's meta, its union, the resolver's own lookup each re-resolve the same identifier,
// and a binding-heavy bundle asked six times per unique triple. the answer changes only when a
// declaration is minted into the tree, which is the one event above - every entry carries the
// generation it was computed in and is recomputed past a mint
let bindingLookupGeneration = 0;
const bindingLookupCache = new WeakMap();
export function memoizeBindingLookup({ scope, name, path, compute, read = null }) {
  const node = path?.node;
  if (!scope || !node) return compute();
  let byName = bindingLookupCache.get(scope);
  if (!byName) bindingLookupCache.set(scope, byName = new Map());
  let byNode = byName.get(name);
  if (!byNode) byName.set(name, byNode = { plain: new WeakMap(), reads: null });
  // ... and one asked for a read the caller hands apart from the use (`lookupReadPath`) by that read too
  let entries = byNode.plain;
  let key = node;
  if (readStandsApart(path, read)) {
    byNode.reads ??= new WeakMap();
    entries = byNode.reads.get(node);
    if (!entries) byNode.reads.set(node, entries = new WeakMap());
    key = read;
  }
  const hit = entries.get(key);
  if (hit && hit.generation === bindingLookupGeneration) return hit.value;
  const value = compute();
  entries.set(key, { generation: bindingLookupGeneration, value });
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
const OWNER_WRITE_PATH_TYPES = new Set([
  'VariableDeclarator',
  'AssignmentExpression',
  'UpdateExpression',
  'ForOfStatement',
  'ForInStatement',
  'FunctionDeclaration',
]);
// the walk handing every write-shaped path below the one it runs from to `add`. babel's visitor keys omit a
// parameter property's decorators, so the walk enters them itself: a write one hosts has a path on both sides
function writePathVisitors(add) {
  const visitors = {
    ...Object.fromEntries([...OWNER_WRITE_PATH_TYPES].map(type => [type, add])),
    TSParameterProperty(p) {
      if (p.node.decorators?.length) for (const decorator of p.get('decorators')) decorator.traverse(visitors);
    },
  };
  return visitors;
}
// uncached builder: babel's binding recoveries must read the LIVE AST (the plugin's own render
// replaces write nodes, so a cached index may hold replaced originals)
export function buildOwnerWritePathIndex(ownerPath) {
  const index = new Map();
  function add(p) {
    if (!index.has(p.node)) index.set(p.node, p);
  }
  ownerPath.traverse(writePathVisitors(add));
  return index;
}
export function ownerWritePathIndex(ownerPath) {
  let index = ownerWritePathIndexCache.get(ownerPath);
  if (!index) {
    ownerWritePathIndexCache.set(ownerPath, index = buildOwnerWritePathIndex(ownerPath));
    writeIndexSerials.set(index, writeLookupSerial);
  }
  return index;
}

// the lookups asking whether a write left the tree (`liveRecordWrites`, `liveBindingWrites`) write nothing to it,
// so an index built during one is current until it returns: each lookup takes the next serial, each index keeps
// the one it was built under, and a write an index of the current serial misses is not in the tree (`retiredWrite`)
let writeLookupSerial = 0;
const writeIndexSerials = new WeakMap();

const ownerSourceWritePaths = new WeakMap();

// A census write and the live traversal may hold different copies of the SAME source node.
// Index the existing owner walk by source position once; duplicate positions are ambiguous.
// This lookup is only for writes from this file's census, never nodes from another program.
export function ownerSourceWritePath(ownerPath, node) {
  // A read-shaped capture can never match this write-only index. Reject it before
  // a speculative query pays for a traversal of the whole enclosing owner.
  if (!OWNER_WRITE_PATH_TYPES.has(node?.type)) return null;
  const paths = ownerWritePathIndex(ownerPath);
  if (paths.has(node)) return paths.get(node);
  const key = nodePositionKey(node);
  if (key === null) return null;
  let positions = ownerSourceWritePaths.get(paths);
  if (!positions) {
    ownerSourceWritePaths.set(paths, positions = new Map());
    for (const [write, path] of paths) {
      const span = nodePositionKey(write);
      if (span === null) continue;
      const stamp = `${ write.type }:${ span }`;
      positions.set(stamp, positions.has(stamp) ? null : path);
    }
  }
  return positions.get(`${ node.type }:${ key }`) ?? null;
}

// the source write path of `node` (`ownerSourceWritePath`) in the nearest var-scope owner up from `path`
// whose span holds it, or null: what a closure reads may be written, or captured, in an owner above its own
export function enclosingOwnerWritePath(path, node) {
  return climbVarScopeOwners(path, owner => nodeRangeContains(owner.node, node)
    ? ownerSourceWritePath(owner, node) ?? undefined : undefined) ?? null;
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
  const violationNodes = scannedWrites(found, name);
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
    const fn = annexBHoistsBlockFunction(owner, name) ? cachedScopeBlockFunctions(owner.node).get(name) : null;
    return fn ? { owner, fn } : undefined;
  }) ?? null;
}

// does a block `function <name>` hoist into this var-scope owner? sloppiness FIRST: it is a short
// climb, while the block-function set is a full subtree walk on its first query per owner - and in
// an ES module (every file of a modern bundle) the answer is always false, so that walk would be
// built only to be thrown away. B.3.3.1 then blocks the hoist for a name the enclosing function
// takes as a PARAMETER, and the sloppy host is a CommonJS wrapper, which takes exactly five - so
// `{ function require(){} }` shadows nothing while `{ function Map(){} }` still does
function annexBHoistsBlockFunction(owner, name) {
  if (!isSloppyAtPath(owner)) return false;
  return !CJS_WRAPPER_PARAM_NAMES.has(name);
}

// does the Annex-B hoist carry this declaration's name PAST the block its tracker-reported binding
// covers? B.3.3 makes a sloppy block-level `function` function-scoped while BOTH trackers scope it
// to its block, so every use outside that block resolves to the hoisted twin and is recorded
// against neither binding - a reference set read off the block one is a SUBSET of the real
// references, and reading its emptiness as proof of no uses is what turns an over-injection into a
// missed one. a declaration the var-scope owner holds directly is function-scoped already, and a
// hoist B.3.2 / B.3.3.1 blocks never leaves the block, so both keep the tracker's answer whole
export function annexBHoistOutrunsBinding(declarationPath) {
  const node = declarationPath?.node;
  if (node?.type !== 'FunctionDeclaration' || !node.id?.name) return false;
  const host = declarationPath.parentPath;
  const owner = findNearestVarScopeOwner(host);
  if (!owner || host.node === owner.node || host.node === owner.node.body) return false;
  return !!findSloppyBlockFunctionInPath(host, node.id.name);
}

// does the function at `scopePath` (descend blocks, stop at nested functions) bind `name` via a
// `var` declarator OR a hoisted FunctionDeclaration? the param-destructure body-extract emits a body-
// top `let <name>` aliasing the destructured parameter; a function-scoped `var <name>` / `function
// <name>(){}` legally REDECLARES a same-named parameter, but `let` + `var`/`function` in one scope is a
// SyntaxError - so the extract bails to the inline-default fallback when this returns true, mirroring
// the existing `paramListReadsName` bail. shared by both plugins' body-extract path
export function functionScopeBindsVarOrFunction(scopePath, name) {
  // the block-function half is Annex B, which only sloppy code has - and not even all of it: a
  // CommonJS wrapper's own parameter names are carved out of the hoist. the `var` half is asked
  // FIRST and knows no such carve-out: a `var` re-declaration of a wrapper parameter is a real
  // binding either way
  return cachedScopeVars(scopePath.node).has(name)
    || (annexBHoistsBlockFunction(scopePath, name) && cachedScopeBlockFunctions(scopePath.node).has(name));
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
      answer = programIsScript(node);
      break;
    }
  }
  for (const node of decided) sloppyAtNode.set(node, answer);
  return answer;
}

// the declaration a climb from `anchor` finds hoisting `name` into a var-scope owner, for a lookup in `scope` -
// a `var` (`{ owner, declarator }`), or a block-nested `function` Annex B hoists to the function scope in sloppy
// code (`{ owner, fn }`), a shadow of the global the native scope trackers keep block-scoped and miss, while a
// module or "use strict" keeps it block-scoped and the name the global's - or null. complements the TS-runtime
// presence (`findTSRuntimeBindingInPath`). one the climb finds below the scope asked is none of its answer, as an
// alias walk asks in the alias's declaration scope while it keeps the deeper consumer's path
export function hoistedDeclarationInScope(scope, anchor, name) {
  const found = findVarOwnerDeclaring(anchor, name) ?? findSloppyBlockFunctionInPath(anchor, name);
  return found && !synthOwnerStrictlyInsideScope(scope, { ownerScope: found.owner.scope }) ? found : null;
}

// names a block-scoped statement re-binds: `let`/`const` declarator, class / function decl -
// through an `export` wrapper too (`namespace N { export let X }`, `export class X {}` bind
// exactly like their bare forms)
export function stmtRebindNames(stmt, out) {
  const decl = unwrapExportedDeclaration(stmt);
  if (decl?.type === 'VariableDeclaration' && decl.kind !== 'var') {
    for (const d of decl.declarations) walkPatternIdentifiers(d.id, id => out.push(id.name));
  } else if ((decl?.type === 'ClassDeclaration' || decl?.type === 'FunctionDeclaration') && decl.id?.name) {
    out.push(decl.id.name);
  }
  return out;
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
  const scanner = reassignmentScanner();
  scanner.visit(ownerNode, true, sloppy);
  return scanner.index;
}

// the names a write the scan records writes: the written TARGET, through the wrappers a write may
// spell around it (`a! = v`, `(a as any) = v`, `(a)++`) - neither native tracker records those as
// writes, and this scan is their only recorder - a pattern's leaves, or a for-of / for-in head: a
// bare-Identifier / destructuring-pattern target (`for (name of ...)`, `for ([name] of ...)`) or a
// `var` head (`for (var name in ...)`). The identifier projection keeps those same source targets.
export function writtenNames(node, { identifierNodes = false } = {}) {
  const names = [];
  function add(id) {
    names.push(identifierNodes ? id : id.name);
  }
  const target = node.type === 'AssignmentExpression' ? unwrapRuntimeExpr(node.left)
    : node.type === 'UpdateExpression' ? unwrapRuntimeExpr(node.argument) : null;
  if (target?.type === 'Identifier') add(target);
  else if (target && isDestructurePattern(target)) walkPatternIdentifiers(target, add);
  else if (isForXStatement(node) && node.left?.type === 'VariableDeclaration') {
    for (const d of node.left.declarations) walkPatternIdentifiers(d.id, add);
  } else if (isForXStatement(node) && node.left) walkPatternIdentifiers(node.left, add);
  return names;
}

// the function below its owner a write scan found a write in (`reassignmentScanner`), for a question
// asked of the bare write node from outside that function (`writeNeverRuns`)
const nestedWriteOwners = new WeakMap();

// the walk behind the index: `visit` records an owner's writes from its root down, `scanUnder` the
// writes of a few nodes standing deep in it (`refreshWritesAtSlot`)
function reassignmentScanner() {
  const index = new Map();
  const shadowDepth = new Map();
  // the innermost function below the scanned owner the walk stands in
  let nested = null;
  function record(name, node) {
    if (shadowDepth.get(name)) return;
    if (nested) nestedWriteOwners.set(node, nested);
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
  // what a node opens for the walk below it: strictness is inherited downward and only ever
  // tightens (a class body is strict, and so is a function opening with the directive), the
  // names it shadows - none at the owner root - and whether it is a function below the owner
  // (`nests`), the one the writes under it stand in
  function frameOf(node, atOwnerRoot, sloppyHere) {
    const boundary = isVarScopeBoundary(node.type);
    const sloppyInside = sloppyHere && node.type !== 'ClassDeclaration' && node.type !== 'ClassExpression'
      && !(boundary && nodeHasUseStrict(node));
    const shadowNames = atOwnerRoot ? EMPTY_REASSIGNMENTS
      : boundary ? boundaryShadowNames(node, sloppyInside)
      : blockShadowNames(node);
    return {
      node,
      atOwnerRoot,
      sloppyHere,
      sloppyInside,
      shadowNames,
      nests: boundary && !atOwnerRoot,
      switchSplit: node.type === 'SwitchStatement' && (atOwnerRoot || shadowNames.length > 0),
      slotted: boundary && (node.computed || node.decorators?.length),
    };
  }
  // how the walk enters `child` of a frame - its owner-root flag, its strictness, whether the frame's
  // shadow covers it - or null where the walk leaves it out.
  // the switch DISCRIMINANT evaluates in the outer env before the case-block scope exists,
  // so its writes target the outer binding even when a case-level lexical shadows the name -
  // visit it UNSHADOWED, then only the cases under the shadow (a generic descent would
  // re-visit the discriminant and double-record its writes). at the OWNER ROOT the queried
  // bindings ARE those case-level lexicals, so there the discriminant is skipped outright.
  // a function's definition-time slots (`definitionTimeSlotOf`) run where the function stands -
  // outside its own shadow, and outside the index of the function itself
  function childPlan(frame, child) {
    const { node, atOwnerRoot } = frame;
    if (frame.switchSplit) {
      if (child !== node.discriminant) return { atOwnerRoot: false, sloppy: frame.sloppyInside, shadowed: true };
      return atOwnerRoot ? null : { atOwnerRoot: false, sloppy: frame.sloppyInside, shadowed: false };
    }
    if (frame.slotted && definitionTimeSlotOf(node, child)) {
      return atOwnerRoot ? null : { atOwnerRoot: false, sloppy: frame.sloppyHere, shadowed: false };
    }
    return {
      atOwnerRoot: atOwnerRoot && child === node.body && child.type === 'BlockStatement'
        && node.type !== 'ForStatement' && !isForXStatement(node),
      sloppy: frame.sloppyInside,
      shadowed: true,
    };
  }
  function visitPlanned(child, plan) {
    if (plan) visit(child, plan.atOwnerRoot, plan.sloppy);
  }
  function visit(node, atOwnerRoot, sloppyHere) {
    if (!isASTNode(node)) return;
    const frame = frameOf(node, atOwnerRoot, sloppyHere);
    const { shadowNames } = frame;
    if (frame.switchSplit) {
      visitPlanned(node.discriminant, childPlan(frame, node.discriminant));
      push(shadowNames);
      for (const c of node.cases ?? []) visitPlanned(c, childPlan(frame, c));
      pop(shadowNames);
      return;
    }
    const { slotted } = frame;
    if (slotted) walkAstChildren(node, child => definitionTimeSlotOf(node, child) && visitPlanned(child, childPlan(frame, child)));
    const outer = nested;
    if (frame.nests) nested = node;
    push(shadowNames);
    for (const name of writtenNames(node)) record(name, node);
    if (node.type === 'VariableDeclaration' && node.kind === 'var') {
      for (const d of node.declarations ?? []) {
        if (d.init) for (const name of patternNames(d.id, [])) record(name, d);
      }
    }
    // a function OWNER's own body block is the owner's scope, not a nested block: a declaration at
    // its top level - a hoisted `function name`, a `let` - IS the owner-level binding (a shadow of
    // an owner-level `var` or param there is a SyntaxError), so the block casts no shadow and every
    // write under it stays recorded (`function a() {} { var a = 'x' }` redeclares `a`). a loop whose
    // head declares the binding is no such owner: its body block is a scope of its own, and a
    // declaration there shadows the head inside it
    walkAstChildren(node, child => (slotted && definitionTimeSlotOf(node, child)) || visitPlanned(child, childPlan(frame, child)));
    pop(shadowNames);
    nested = outer;
  }
  // the writes of `nodes`, standing in one slot of the last of `frames` - the nodes from the owner root
  // down to the slot's holder - as the walk from the root records them: each frame on the way shadows
  // what it shadows there, and a slot the walk leaves out records nothing
  function scanUnder({ frames, sloppy, nodes }) {
    const pushed = [];
    let plan = { atOwnerRoot: true, sloppy };
    for (let i = 0; i < frames.length && plan; i++) {
      const frame = frameOf(frames[i], plan.atOwnerRoot, plan.sloppy);
      plan = childPlan(frame, frames[i + 1] ?? nodes[0]);
      if (plan?.shadowed) {
        push(frame.shadowNames);
        pushed.push(frame.shadowNames);
      }
    }
    const outer = nested;
    nested = frames.slice(1).findLast(frame => isVarScopeBoundary(frame.type)) ?? null;
    if (plan) for (const node of nodes) visit(node, plan.atOwnerRoot, plan.sloppy);
    nested = outer;
    for (const names of pushed) pop(names);
  }
  return { index, visit, scanUnder };
}
// the whole index for an owner, cached per owner NODE; the owner's PATH is what tells its
// strictness, read once per owner through the shared predicate every builder of this index owes -
// a consumer answering it differently gets a different write set for the same owner. a consumer
// needing a FRESH scan of a rewritten tree (babel's scope-lag recovery) builds its own off the
// same predicate rather than this cache
function scopeReassignmentIndexFor(ownerPath) {
  const ownerNode = ownerPath.node;
  let index = scopeReassignCache.get(ownerNode);
  if (!index) scopeReassignCache.set(ownerNode, index = buildScopeReassignmentIndex(ownerNode, isSloppyAtPath(ownerPath)));
  return index;
}

// every reassignment NODE of `name` within the owner's subtree, stopping at nested scopes /
// blocks that shadow `name`. its readers differ only in how they locate the owner (`writeScanOwner`)
function collectScopeReassignmentNodes(ownerPath, name) {
  return scopeReassignmentIndexFor(ownerPath).get(name) ?? EMPTY_REASSIGNMENTS;
}

// where the scan holding a binding's writes stands, or null for a binding it does not answer:
// - a `var`: the function-scope owner declaring it (`findVarOwnerDeclaring`), found from `anchorPath` -
//   estree-toolkit block-scopes a `var`, so its record misses a cross-block re-declaration or write
// - a `let` / `const`: its own lexical scope host - estree-toolkit drops a write from a nested closure, and an
//   anchor at the enclosing function would let the scan stop at the binding's own block as a shadow. a for-x
//   head declaring it stays a write: the source of the iterated value, told apart by `isRealReassignment`
function writeScanOwner({ kind, bindingPath, anchorPath, name }) {
  if (kind === 'var') return findVarOwnerDeclaring(anchorPath, name);
  const owner = kind === 'let' || kind === 'const' ? letScopeHostOf(bindingPath) : null;
  return owner && { owner, declarator: null };
}

// the writes of `name` the scan at `scan` (`writeScanOwner`) holds, none where no scan answers: the declarator
// declaring a `var` there is the binding's own declaration, no write of it. the list without it is kept per scan
// list, which a patch replaces rather than edits (`patchScanIndex`): every lookup of the binding asks again, and the
// caches keyed by the list it answers hit only on the same list
const scannedWritesCache = new WeakMap();
function scannedWrites(scan, name) {
  if (!scan) return [];
  const writes = collectScopeReassignmentNodes(scan.owner, name);
  if (!scan.declarator) return writes;
  let byDeclarator = scannedWritesCache.get(writes);
  if (!byDeclarator) scannedWritesCache.set(writes, byDeclarator = new WeakMap());
  let kept = byDeclarator.get(scan.declarator);
  if (!kept) byDeclarator.set(scan.declarator, kept = writes.filter(node => node !== scan.declarator));
  return kept;
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

// the most writes a read of one binding follows. following them costs every read a walk of all of them, so a
// binding written more often is not followed at all: an analysis walking a binding's writes for a read answers
// there as for a value no write settles - an instance method dispatches generically, a static alias stays raw -
// as an alias chain past its ceiling names nothing (`withinAliasWalkBudget`). the mutation census still counts
// every write: what a binding may hold is over-recorded, never cut
const MAX_FOLLOWED_WRITES = 64;

// are there more `writes` than a read of their binding follows (`MAX_FOLLOWED_WRITES`)?
export function writesPastCeiling(writes) {
  return (writes?.length ?? 0) > MAX_FOLLOWED_WRITES;
}

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
  const canonical = scannedWrites(writeScanOwner({ kind, bindingPath: binding.path, anchorPath: binding.path, name }), name);
  if (!canonical.length) return binding;
  // past the ceiling no read follows these writes (`writesPastCeiling`): each stands as a recovered marker, unmerged
  if (writesPastCeiling(canonical)) {
    return { ...binding, constant: false, constantViolations: canonical.map(node => ({ node, canonicalRecovered: true })) };
  }
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
    .filter(node => node.type !== 'VariableDeclarator' && isRealReassignment(node, own, name))
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
// hoist reports; anchored on that one and registered in the owner's scope it IS the hoisted binding
// (richer channel, keep it), and anything else is a genuine shadow the twin must not shoulder aside
function hoistedBindingTwin(synthCache, path, name, native = null, lookupScope = null) {
  // the whole "does the twin displace the native view" decision lives here. the KIND test comes
  // first because it is the free half: only a `var` view can be anchored on a re-declaration, so
  // every other kind keeps the native answer without paying the owner climb below
  if (!path || (native && native.kind !== 'var')) return null;
  const synth = hoistedBindingVisibleInScope(lookupScope, path, name);
  // ... and a native `var` declared OUTSIDE the twin's owner is the outer binding the twin shadows
  // from inside that owner (`function g() { { var a = 'x' } a.at() }` reads g's own `a`, not the
  // enclosing function's) - the same preference the estree adapter's closest-binding lookup takes.
  // a tracker registering a `var` in the scope it stands in - a loop's, a block's, a catch body's, a
  // switch's - keeps there a view anchored on the hoisted declarator that misses every write outside
  // that scope, a closure's or a later statement's, so the twin displaces that view too
  if (native && (!synth || (synth.node === native.path?.node && (native.scope?.block ?? native.scope?.path?.node) === synth.ownerNode)
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
  const filtered = withoutFunctionSelfRecord(withoutValuelessDeclarationViolations(violations), binding?.path?.node);
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
function parameterPropertyTwin(synthCache, path, name, native = null, lookupScope = null) {
  // A binding already owned by the lookup scope cannot have a closer synthetic twin.
  if (!path || lookupScope && native?.scope === lookupScope) return null;
  let definitionTimeFrames;
  for (let cur = memberContextPath(path); cur?.node; cur = memberContextPath(cur.parentPath)) {
    const { node, scope } = cur;
    if (!FUNCTION_LIKE_NODE_TYPES.has(node.type)) continue;
    const index = (node.params ?? []).findIndex(param => param?.type === 'TSParameterProperty'
      && tsRuntimeBindingName(patternSlotTarget(param.parameter)) === name);
    if (index === -1) continue;
    // A real declaration inside this region is closer than any enclosing parameter
    // property. A native outer binding may instead be shadowed by the constructor.
    if (native?.path && pathContainedBy(native.path, node)) return null;
    definitionTimeFrames ??= useRegionFrames(path).definitionTimeFrames;
    if (definitionTimeFrames?.has(node)) continue;
    if (synthOwnerStrictlyInsideScope(lookupScope, { ownerScope: scope })) return null;
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
// silently degraded - the type widened to generic, a guard stopped narrowing - and a use inside it
// found a view missing every write outside the block; a sloppy block-level `function` and a TS
// parameter PROPERTY are invisible to BOTH. the twin carries the `.path` consumers read (annotation
// lookup, init descent, scope anchoring), and a parser that answers with the hoisted binding itself
// never reaches the synthesis - the no-op the synthetic shape is documented to be. a name a catch
// parameter declares, asked in that parameter's own pattern, is answered with its binding
// (`catchParameterOwnBinding`), which one parser looks past there.
// `nestedTSRuntimeDeclarations` says whether the file declares a TS runtime binding below its top
// level (`nestedTSRuntimeDeclarationsReducer`) - the only kind of file where the climb asking for
// one runs. `read` is the node the name is read at where the caller resolves it for a deeper `path`
// (an alias's initializer, read where the alias is declared): that climb starts there
export function wrapScopeBindingLookup(lookup, nestedTSRuntimeDeclarations = () => true) {
  // native binding -> its view (`wrapped`) and the render-note epoch its record was last judged at
  const cache = new WeakMap();
  const synthCache = new WeakMap();
  return ({ scope, name, path = null, read = null }) => {
    const native = catchParameterOwnBinding(lookup, scope, name) ?? lookup(scope, name, path);
    // a binding that does not cover the use is not the use's binding - the same question both
    // detection gates ask, asked once here so the resolver cannot narrow THROUGH a shadow they
    // already dropped and degrade the result to the generic helper - and the lookup goes on past it
    const twin = hoistedBindingTwin(synthCache, path, name, native, scope) ?? parameterPropertyTwin(synthCache, path, name, native, scope);
    const binding = closestBindingVisibleAtUse(twin ?? native, path, {
      outer: hidden => hidden.scope?.parent ? lookup(hidden.scope.parent, name, path) : null,
    });
    if (!binding) return binding;
    // ... and neither is one a TS runtime declaration between the read and the block declaring the
    // binding shadows: neither tracker registers an enum or a namespace, so both hand back the binding
    // further out. the block is the one the declaration stands in - estree-toolkit files a namespace
    // block's or a static block's declarations on the scope around it, so that block bounds the walk,
    // but a nested block's lexical declaration is scoped by its own block, which both trackers scope and
    // which lies inside it: an enum between the two is further out than the binding. a namespace merged
    // with one (`class Box {}` beside `namespace Box {}`) is that same binding, not a shadow
    let scopeNode = null;
    if (path && binding.path && nestedTSRuntimeDeclarations()) {
      const block = varScopeBlockOfBinding(binding);
      const own = binding.scope?.path;
      scopeNode = block && !(own && pathContainedBy(own, block)) ? block : binding.scope?.block ?? own?.node;
    }
    if (scopeNode && findTSRuntimeBindingInPath(lookupAnchorPath(scope, path, read), name, scopeNode)) return undefined;
    let entry = cache.get(binding);
    if (!entry) cache.set(binding, entry = { wrapped: withCanonicalViolations(withoutPhantomWrites(binding), name), judged: -1 });
    // a record a render may retire gets a view of the lookup's own: the repair below writes the view, never
    // the tracker's binding, which the host and its sibling plugins go on reading. a render's note can make a
    // record retirable after a lookup judged it, so a record still without a view is judged again after a note
    if (entry.wrapped === binding && entry.judged !== renderRetiredWritesEpoch) {
      entry.judged = renderRetiredWritesEpoch;
      if (binding.constantViolations?.some(retirableWrite)) entry.wrapped = { ...binding };
    }
    const { wrapped } = entry;
    // ... and a record still naming a write a render retired takes the live writes in place: a caller
    // pairing a guard with a use compares the binding they resolve to by identity
    const live = path && wrapped !== binding ? liveRecordWrites({ binding: wrapped, name, usePath: path }) : null;
    if (live) wrapped.constantViolations = live;
    return wrapped;
  };
}

// where a lookup is answered from: the read a caller hands for a deeper `path` (`lookupReadPath`), else
// the use, or the scope the caller asked in where that is not the use's own - an alias read is resolved
// where its initializer is declared, keeping the deeper consumer path, and a declaration below that
// scope is none of its answer
function lookupAnchorPath(scope, path, read = null) {
  const atRead = lookupReadPath(path, read);
  if (atRead !== path) return atRead;
  const asked = scope?.block ?? scope?.path?.node;
  return asked && scope.path && asked !== (path.scope?.block ?? path.scope?.path?.node) ? scope.path : path;
}

// the path a declaration climb starts from for a name read at the node `read` and asked for the use at
// `path`: where the read stands apart from the use, the statement holding it (`statementPathHolding`),
// else `path`. a climb from the use would meet what an enclosing block declares between the two - a
// namespace, an enum or a nested `var` the consumer stands in while the alias it reads through is declared
// outside it - and miss what the read's own block declares
export function lookupReadPath(path, read = null) {
  return readStandsApart(path, read) ? statementPathHolding(path, read) : path;
}

// ... where the read stands apart from the use: outside the use's own span. a read inside it - the use
// itself, the root of the chain it heads, an operand - is climbed for from the use, which costs no descent
function readStandsApart(path, read) {
  return typeof read?.start === 'number' && !!path?.node && read !== path.node && !nodeRangeContains(path.node, read);
}

// the binding a catch clause's parameter declares for `name`, asked in that parameter's own pattern
// scope or in one a closure written in the pattern opens, or null. babel opens a scope on the pattern,
// as on a function's parameter pattern, and a lookup crossing it skips every binding of the clause's
// scope that is not a function parameter's - the clause's own parameter names among them, so
// `catch ({ P, p = P.resolve() })` and `catch ({ P, p = () => P.resolve() })` read past `P` to the
// global. the clause's scope holds the body's lexical declarations as well: only the parameter's
// binding, declared at the clause itself, answers, and a closure binding the name answers first
export function catchParameterOwnBinding(lookup, scope, name) {
  const pattern = catchPatternScopeOf(scope);
  if (!pattern) return null;
  if (pattern !== scope) {
    const near = lookup(scope, name, null);
    if (near) for (let inner = scope; inner && inner !== pattern; inner = inner.parent) if (near.scope === inner) return null;
  }
  const binding = lookup(pattern.parent, name, null);
  return binding?.path?.node === pattern.path.parentPath.node ? binding : null;
}

// the scope a catch clause opens on its parameter pattern that `scope` is or stands in - the pattern's
// own, or the one a closure written in the pattern hangs off - or null. a fact of the scope, kept per
// scope object while its pattern still stands in the clause's parameter slot
const catchPatternScopes = new WeakMap();
function catchPatternScopeOf(scope) {
  if (!scope) return null;
  let pattern = catchPatternScopes.get(scope);
  if (pattern === undefined) {
    const clause = scope.path?.parentPath?.node;
    pattern = clause?.type === 'CatchClause' && clause.param === scope.path.node ? scope : catchPatternScopeOf(scope.parent);
    catchPatternScopes.set(scope, pattern);
  }
  return pattern && pattern.path.parentPath?.node?.param === pattern.path.node ? pattern : null;
}

// A synthesized binding belongs below this explicitly requested lookup scope when
// its owner's parent chain reaches that scope. An alias initializer may retain a
// deeper consumer path; that path cannot select a shadow invisible at the initializer.
// Different traversal views can share the same actual scope AST anchor.
export function synthOwnerStrictlyInsideScope(scope, synth) {
  const scopeNode = scope?.block ?? scope?.path?.node;
  for (let cur = synth?.ownerScope?.parent; cur; cur = cur.parent) {
    if (cur === scope || (scopeNode && (cur.block ?? cur.path?.node) === scopeNode)) return true;
  }
  return false;
}

// the var-hoist binding (`synthHoistedBinding`) of `name` a lookup in `scope` takes for the use at `path`: an
// alias walk resolves an initializer in its declaration scope while it keeps the deeper consumer's path, and a
// declaration a climb from that path finds below the scope asked is none of its answer
export function hoistedBindingVisibleInScope(scope, path, name) {
  const synth = path ? synthHoistedBinding(path, name) : null;
  return synth && !synthOwnerStrictlyInsideScope(scope, synth) ? synth : null;
}

// the lexical scope a `let` / `const` declarator is reached from - the first host above its
// VariableDeclaration, inclusive of the path itself so a catch PARAMETER answers its CatchClause.
// the anchor every scan of that binding's own scope shares
function letScopeHostOf(declaratorPath) {
  for (let p = declaratorPath; p; p = p.parentPath) {
    if (LET_SCOPE_HOST_TYPES.has(p.node?.type)) return p;
  }
  return null;
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
// remove the rescans, this removes the per-query path re-materialization of the body list itself.
// Flow ambient classes carry signatures on ObjectTypeAnnotation.properties, with no runtime bodies
export function classBodyMemberPaths(classPath) {
  const body = classPath.get('body');
  return cachedContainerPaths(body, body.node.type === 'ObjectTypeAnnotation' ? 'properties' : 'body');
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
// this half carries the PARAMETER decorators its span-level twin (`classEvalSlotsOf`) leaves out -
// a scan that walks the slots owes every one of them, while a span set that omits one only widens
// and stays sound. the boundary is stated at the twin
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
// ... and the positioned nested var scopes of the owner's frame no part of the frame stands inside, in source
// order (`targetInsideExcludedScope`)
const ownerExcludedScopesCache = new WeakMap();
function ownerParentIndex(ownerNode, includeExcluded = false) {
  let parents = ownerParentIndexCache.get(ownerNode);
  if (parents) return parents;
  parents = new Map();
  const excludedScopes = [];
  function visit(node, outside = false) {
    walkAstChildren(node, child => {
      // A nested var scope stays unreachable. On a miss, also record its descendants with no
      // parent: later queries can distinguish an excluded node from a newly attached subtree.
      // The initial index remains shallow, so ordinary in-scope queries pay no extra walk.
      parents.set(child, outside ? null : node);
      const excluded = outside || isVarScopeBoundary(child.type);
      if (!excluded || includeExcluded) visit(child, excluded);
      if (outside || !excluded) return;
      // ... all but its definition-time slots (`definitionTimeSlotOf`), which run in this one - a key or a
      // decorator babel spells inside the method's own span. a scope with none keeps the frame out of its span
      if (child.computed || child.decorators?.length) {
        walkAstChildren(child, slot => {
          if (!definitionTimeSlotOf(child, slot)) return;
          parents.set(slot, child);
          visit(slot);
        });
      } else if (hasRange(child)) excludedScopes.push(child);
    });
  }
  visit(ownerNode);
  ownerParentIndexCache.set(ownerNode, parents);
  ownerExcludedScopesCache.set(ownerNode, excludedScopes.sort((a, b) => a.start - b.start));
  return parents;
}

// does `target` stand inside one of those nested scopes: the scope whose span holds its own, and the target itself
// found there by descending through the children whose spans hold it? the index leaves such a scope's body out, so
// a target there is outside the frame - while a clone carrying a nested node's span may stand anywhere
function targetInsideExcludedScope(ownerNode, target) {
  const scopes = ownerExcludedScopesCache.get(ownerNode) ?? [];
  const lo = sortedPrefixLength(scopes, scope => scope.start <= target.start);
  return !!lo && target.end <= scopes[lo - 1].end && descendsBySpanTo(scopes[lo - 1], target);
}

// ... the descent: through every child whose span holds the target's, and through every child a render built
// with no span at all, which may hold a copy carrying one (`_push(s).call(s, x = [])` around a clone of
// `x = []`) - a search below the scope, never above it; `descendToNode` takes the same rule toward a path
function descendsBySpanTo(scope, target) {
  const pending = [scope];
  while (pending.length) {
    const node = pending.pop();
    if (node === target) return true;
    walkAstChildren(node, child => {
      if (!hasRange(child) || child.start <= target.start && target.end <= child.end) pending.push(child);
    });
  }
  return false;
}

// the cached index goes stale when an emitter swaps a subtree AFTER the first query built it: a
// claim re-visited on the attached clone then misses in the map, and a containment climb reads
// the miss as "not inside" - flipping a loop-rerun / guard verdict to the unsound pole (a pure
// fold of a loop-reassigned key rode exactly this). rebuild once on a miss before answering: a
// genuinely outside target misses in the fresh index too and keeps the honest answer, while a
// post-mutation subtree is re-indexed and located. a target at or below a node the caller holds a
// PATH to is located by that path instead - its ancestors up to the first node the index maps within
// the same var scope, then the path node's own subtree: every render attaches a subtree, and
// re-walking the whole owner per render is quadratic
function ownerParentIndexLocating(ownerNode, target, targetPath = null) {
  const parents = ownerParentIndex(ownerNode);
  if (target === ownerNode || parents.has(target)) return parents;
  if (targetPath?.node && locateThroughPath(parents, ownerNode, targetPath) && parents.has(target)) return parents;
  // a target the source spells outside the owner's span is outside it, and a rebuild would re-walk the whole owner
  // to miss it again: a subtree attached since the build carries no span, or the span of the node it copies. so is
  // one standing inside a nested scope of the frame (`targetInsideExcludedScope`), which a rebuild would re-walk the
  // whole owner to give a null parent - every reader stops on a missing parent and a null one alike
  if (hasRange(target) && hasRange(ownerNode)
    && (!nodeRangeContains(ownerNode, target) || targetInsideExcludedScope(ownerNode, target))) return parents;
  // ... and a read the analysis synthesizes off a receiver stands in no tree at all (`borrowsReceiverSpan`)
  if (borrowsReceiverSpan(target)) return parents;
  // ... and a declarator an allocator appended path-less to a declaration the index maps stands under it
  // (`appendMemoDeclarator`): every memo ref a render mints lands there, and a rebuild per ref is quadratic
  const slot = memoDeclaratorSlots.get(target);
  if (slot?.host.declarations[slot.index] === target && parents.has(slot.host)) {
    parents.set(target, slot.host);
    parents.set(target.id, target);
    return parents;
  }
  ownerParentIndexCache.delete(ownerNode);
  return ownerParentIndex(ownerNode, true);
}

// ... the path half: false where the chain leaves the owner's var scope, as the index walk would
function locateThroughPath(parents, ownerNode, targetPath) {
  const chain = [];
  let step = targetPath;
  while (step?.node && step.node !== ownerNode && !parents.has(step.node)) {
    chain.push(step);
    step = step.parentPath;
  }
  if (!(step?.node === ownerNode || (step?.node && parents.get(step.node)))
    || chain.some(link => link.parentPath.node !== ownerNode && isVarScopeBoundary(link.parentPath.node.type)
      && !definitionTimeSlotOf(link.parentPath.node, link.node))) return false;
  for (const link of chain) parents.set(link.node, link.parentPath.node);
  // ... and the subtree, a nested var scope but for its definition-time slots (`definitionTimeSlotOf`)
  (function visit(node) {
    const boundary = isVarScopeBoundary(node.type);
    walkAstChildren(node, child => {
      if (parents.has(child) || (boundary && !definitionTimeSlotOf(node, child))) return;
      parents.set(child, node);
      visit(child);
    });
  })(targetPath.node);
  return true;
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
const nodeSitsInLoopRerunWithin = memoizeByNodePair((ownerNode, target, targetPath = null) => {
  const parents = ownerParentIndexLocating(ownerNode, target, targetPath);
  for (let child = target; child !== ownerNode;) {
    const parent = parents.get(child);
    if (!parent) return false;
    if (parent !== ownerNode && isVarScopeBoundary(parent.type) && !definitionTimeSlotOf(parent, child)) return false;
    const rerunFields = LOOP_RERUN_FIELDS[parent.type];
    if (rerunFields && parentFieldOf(parent, child, rerunFields)) return true;
    child = parent;
  }
  return false;
});

// the slots a for-x HEAD spells a pure BINDING TARGET in - the positions that name what the pattern
// binds without reading anything there. every other slot inside a head (a leaf DEFAULT's value, a
// COMPUTED key) is an expression the back-edge really does re-evaluate, so a climb stops at it
const HEAD_BINDING_TARGET_FIELDS = {
  VariableDeclaration: ['declarations'],
  VariableDeclarator: ['id'],
  ObjectPattern: ['properties'],
  ArrayPattern: ['elements'],
  Property: ['value'],
  ObjectProperty: ['value'],
  AssignmentPattern: ['left'],
  RestElement: ['argument'],
};

// the POSITION a question about the VALUE a for-x HEAD destructures has to be asked at. the head's
// pattern stands in the loop's `left`, which the back-edge re-binds once per pass, but what that
// pattern destructures is an element of the loop's `right` - the iterable, evaluated ONCE when the
// loop is ENTERED, ahead of the first pass. anchored on the head itself, a positional narrow answers
// for the binding slot instead of for the read, and calls re-runnable a value read that never
// re-runs. re-entry needs no case of its own: a head standing in an OUTER loop's re-running region
// is climbed into from `right` exactly as it was from `left`, which is precisely when the head IS
// re-entered. the climb crosses BINDING-TARGET slots only, so a default's value and a computed key -
// the expressions a head really does re-run - keep their own position
function loopHeadValueReadAnchor(ownerNode, node, path = null) {
  if (!node) return node;
  const parents = ownerParentIndexLocating(ownerNode, node, path);
  for (let child = node; child !== ownerNode;) {
    const parent = parents.get(child);
    if (!parent) return node;
    // only a head that DESTRUCTURES - or declares - reads a value at all: a bare `for (M of it)`
    // target is a per-pass WRITE, and nothing about it is answered by the iterable's position
    if (isForXStatement(parent)) {
      return parent.left === child && (child.type === 'VariableDeclaration' || isDestructurePattern(child))
        ? parent.right ?? node : node;
    }
    const fields = HEAD_BINDING_TARGET_FIELDS[parent.type];
    if (!fields || !parentFieldOf(parent, child, fields)) return node;
    child = parent;
  }
  return node;
}

// loop back-edge anchor for a binding: its declaration identifier node + kind. position (which loop
// slot the decl sits in) plus kind (`var` is function-scoped and carries; `let`/`const` are
// block-scoped and re-created in a body) is the parser-robust signal - estree-toolkit attaches both a
// for-body `var` and a for-body `let` to the ForStatement scope, so the scope node cannot tell them apart.
// Class bindings expose their declaration directly rather than through the variable-declarator view.
export function bindingLoopAnchor(binding) {
  const node = binding?.path?.node ?? binding?.node;
  return {
    decl: binding?.identifier ?? binding?.identifierPath?.node ?? bindingDeclaratorNode(binding)?.id
      ?? (CLASS_NODE_TYPES.has(node?.type) ? node.id : null),
    kind: binding?.kind ?? null,
  };
}

// does `loopNode`'s re-executing region (body / test / for-update slot, but NOT the once-only
// for-init slot) contain a reassignment that survives the back-edge? `bindingAnchor` ({ decl, kind })
// gates it by declaration POSITION + binding KIND, NOT scope: estree-toolkit attaches BOTH a for-body
// `let` and a for-body `var` to the ForStatement scope (babel uses the body block for `let`, the
// function for `var`), so a scope test cannot tell function-scoped `var` from block-scoped `let`.
// a binding is re-created / re-bound each iteration (no back-edge) when it is a for-of/in loop variable
// (declared in `left`, re-bound to the next element, any kind) OR a block-scoped (`let`/`const`)
// binding declared in the loop BODY (fresh per iteration). a `var` is function-scoped and carries even
// when written in the body; a C-style `for (let x = init; ;)` HEADER binding is declared in the
// once-only init slot and is COPIED per iteration (carries); an outer binding is declared outside the
// loop. shared soundness core for the value-flow walk and the discriminant walk
export function loopReExecRegionHasViolation(loopNode, violationNodes, bindingAnchor) {
  const { decl, kind } = bindingAnchor ?? {};
  const initNode = loopNode.type === 'ForStatement' ? loopNode.init : null;
  const reBoundInLeft = decl && loopNode.left && nodeRangeContains(loopNode.left, decl);
  const blockScopedInBody = decl && kind && kind !== 'var' && nodeRangeContains(loopNode.body, decl);
  if (reBoundInLeft || blockScopedInBody) return false;
  return violationNodes.some(v => nodeRangeContains(loopNode, v) && !(initNode && nodeRangeContains(initNode, v)));
}

// loop back-edge soundness for source-position-based narrows. a reassignment that re-executes on
// the back-edge before the next-iteration use makes a narrow chosen purely by source position
// ("last assignment before the use" / declarator-init fallback / preceding guard) stale from
// iteration 2 onward. true when `usagePath` sits inside a loop whose re-executing region contains
// one of `violationNodes` (a reassignment of the binding). the climb stops exactly where the
// read-side deferral gate stops - at a deferred context, THROUGH an immediately invoked body: the
// gate hands such a read to positional reasoning, so this half of it has to see the same loops
// for bindings outside that invocation. Its own bindings start fresh on each call, including var.
export function usageCrossesLoopBackEdgeReassign(usagePath, violationNodes, bindingAnchor, readNode = null) {
  if (!violationNodes?.length) return false;
  for (let cur = usagePath, parent; (parent = cur.parentPath) && !readStepIsDeferred(parent, cur); cur = parent) {
    // A binding can retain a path through a declaration an earlier rewrite removed.
    // Lost ancestry supplies no ordering proof for a later read of that binding.
    if (!parent.node) return true;
    if (isVarScopeBoundary(parent.node.type) && nodeRangeContains(parent.node, bindingAnchor?.decl)) return false;
    // a read in the `for`-INIT slot runs once, before the first body write - the same once-only region
    // `loopReExecRegionHasViolation` excludes on the write side, mirrored here so one rule serves both
    if (parent.node.type === 'ForStatement' && cur.node === parent.node.init) continue;
    const rerunFields = LOOP_RERUN_FIELDS[parent.node.type];
    // an alias capture reads its source at the capture, not at the later use of that alias.
    // A capture outside this loop's rerun slots cannot observe a write on its back-edge.
    if (rerunFields && (!hasRange(readNode) || [...rerunFields].some(field => nodeRangeContains(parent.node[field], readNode)))
      && loopReExecRegionHasViolation(parent.node, violationNodes, bindingAnchor)) return true;
  }
  return false;
}

// a write in the other arm of the SAME if / conditional cannot run beside this read.
// Callers must first exclude loop-carried and deferred writes: different executions can
// take different arms. The read climb itself stops at deferred bodies. Switch cases and
// logical operands are not opposite arms: fall-through / a shared left operand can reach both.
// A captured alias uses its own read node, not the eventual consumer's branch.
export function writeIsInOppositeBranch(writeNode, usagePath, readNode = usagePath?.node) {
  for (let cur = usagePath, parent; (parent = cur?.parentPath)?.node && !readStepIsDeferred(parent, cur); cur = parent) {
    const { node } = parent;
    if (node.type !== 'IfStatement' && node.type !== 'ConditionalExpression') continue;
    const other = cur.node === node.consequent ? node.alternate
      : cur.node === node.alternate ? node.consequent : null;
    if (nodeRangeContains(cur.node, readNode) && nodeRangeContains(other, writeNode)) return true;
  }
  return false;
}

// branches whose body runs only on some control-flow paths. a target nested under one is
// conditional, so it dominates a use only when the use also sits under the SAME branch. the
// recorded guard is the specific branch node (if-consequent / loop body / catch body) so a use in a
// sibling branch (the `else`) isn't contained; switch-case bodies are arrays with no wrapper, so the
// SwitchCase itself is recorded. try-block / catch-body are conditional (a throw can skip them);
// `finally` always runs, so it guards nothing and is absent.
// the EXPRESSION short-circuits (`a && b`, `a || b`, `a ?? b` right operand; `c ? x : y` branches;
// a pattern default, which runs only where its slot is undefined) never guard a `var` DECLARATOR
// (var is statement-only, so they are inert for varInitDominatesUsage)
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
  AssignmentPattern: ['right'],
};

// is `child` an EXPRESSION slot of `parent` that runs on some paths only - a loop update, a
// do-while test, a for-x head pattern, a `case` test, a branch arm, the value of a logical
// assignment? a placement climb refuses a write standing in one: the statement runs, the slot may
// not. the loop half reads the trait table
export function isConditionalExpressionSlot(parent, child) {
  if (parent?.type === 'SwitchCase') return !!child && parent.test === child;
  if (parent?.type === 'AssignmentExpression') return !!child && parent.right === child && LOGICAL_ASSIGN_OPS.has(parent.operator);
  return !!child && !!CONDITIONAL_BRANCH_FIELDS[parent?.type]?.some(field => parent[field] === child);
}

// does the member/call chain contain an optional hop AT `node` or on its spine BELOW it (toward
// the chain root)? guards non-spine slot evaluation, and answers the same question for a span a
// render is about to SWALLOW - a `?.` written inside one is a branch the swap has no spelling for.
// both parser spellings covered: babel names every post-`?.` node Optional* with per-hop
// `optional` flags; estree keeps plain Member/Call with `optional: true` on the hop itself under
// a ChainExpression wrapper
export function spineHasOptionalHop(node) {
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

// the slot through which a node runs its operand every time it runs, ahead of its own completion: a
// sequence's elements, a unary or transparent wrapper's operand, the value of an assignment other than
// a logical one, a declarator's initializer and the statements holding them. a selection (logical,
// conditional, `?.`, a logical assignment) runs an operand on some paths only and offers none, and a
// destructuring host fills its pattern after its value, out of the order its source keeps. a write
// reached from its statement through these slots alone is a STATEMENT-LEVEL write: it runs whenever
// the statement does, as if it stood before what follows the statement - where a destructure render
// plants a declarator's sequence prefix. the one rule both reaching lanes read: the straight-line lane
// climbs it from a write, the preceding-block lane walks it down from a statement. a pattern's computed key is
// none of these slots, so a write in it narrows no later read - save in babel, whose render moves a static's key
// into the initializer before the read is resolved; and babel's record of an initializer's writes follows it
// into the helper call its render hands it to, whose argument is none of these slots either
export function alwaysEvaluatedSlotKey(node) {
  switch (node.type) {
    case 'ExpressionStatement': return 'expression';
    case 'ExportNamedDeclaration': return node.declaration?.type === 'VariableDeclaration' ? 'declaration' : null;
    case 'VariableDeclaration': return 'declarations';
    case 'VariableDeclarator': return 'init';
    case 'SequenceExpression': return 'expressions';
    case 'UnaryExpression': return 'argument';
    case 'AssignmentExpression': return LOGICAL_ASSIGN_OPS.has(node.operator) ? null : 'right';
    default: return TRANSPARENT_EXPR_WRAPPER_TYPES.has(node.type) ? 'expression' : null;
  }
}

// does the step from `childNode` up to `parentNode` leave through that slot
export function isAlwaysEvaluatedSlot(parentNode, childNode) {
  const key = alwaysEvaluatedSlotKey(parentNode);
  const slot = key ? parentNode[key] : null;
  return Array.isArray(slot) || (!!slot && slot === childNode);
}

// is `node` (a reassignment site) a logical-assignment of its binding? babel records the
// AssignmentExpression directly; estree-toolkit records the target Identifier, so resolve the
// enclosing `name <op>= ...` to read its operator
function isLogicalAssignReassignment(node, ownerNode) {
  const assignment = node.type === 'AssignmentExpression' ? node : enclosingValueFlowAssignment(node, ownerNode);
  return !!assignment && LOGICAL_ASSIGN_OPS.has(assignment.operator);
}

// locate `target` in `ownerNode`'s var scope and return the ordered conditional-branch nodes
// guarding it, or null when not found (a nested var-scope boundary on the spine - `var`
// doesn't hoist across them; a definition-time slot stands outside its function: `definitionTimeSlotOf`).
// resolved by climbing the shared parent index: outermost-first
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
    if (parent !== ownerNode && isVarScopeBoundary(parent.type) && !definitionTimeSlotOf(parent, child)) return null;
    const branchFields = CONDITIONAL_BRANCH_FIELDS[parent.type];
    const field = branchFields ? parentFieldOf(parent, child, branchFields) : null;
    if (field) guards.push(Array.isArray(parent[field]) ? parent : child);
    // ... and an expression edge that runs on some evaluations only guards the write the same way -
    // an INSTANCE field initializer among them, since it runs per CONSTRUCTION rather than when the
    // class definition is reached: the statement runs, the slot may not. a read INSIDE the slot sits
    // under the same guard and stays dominated, while one outside it does not - a write that may
    // never have run cannot kill the init the read still observes. every OTHER deferred context is a
    // function-like node, which this climb already stops at as a var-scope boundary
    // ... and so does a LABEL whose body breaks out: the jump ends the body, so a declaration below
    // the break never runs while a read AFTER the label still does. a label is not a conditional host
    // by type - it only NAMES a statement - so the branch-field table above cannot see it, and
    // without this disjunct such a declarator reads as unconditional
    else if (conditionalEvaluationEdge(parent, child) || isDeferredFieldValueNode(parent, child)
      || (parent.type === 'LabeledStatement' && labeledBodyBreaksOut(parent))) guards.push(child);
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

// the selection hosts a presence decision can settle, with the operand each tests
export const SELECTION_TEST_FIELDS = { IfStatement: 'test', ConditionalExpression: 'test', LogicalExpression: 'left' };

// ... and how the build settles the guards of `target` in its var-scope `owner` (a path), for the value
// canon and the receiver types. a guard whose host is a selection the build always takes it through
// (`if (typeof Symbol != 'undefined') K = Symbol.iterator` where the build serves `Symbol`) is no guard;
// one the build never takes it through (the fallback arm of the same test) is a write that never runs.
// the decision is asked in the owner's scope, where the test stands; a test reading a name a lexical host
// between it and the owner rebinds stays a guard. `{ open, dead }` - the guards left open and whether one is dead - asked
// only of a target the collector located under a guard. each host is decided as a guard's own question
// (`settledSelection`), afresh wherever the ask stands - inside a presence test's read as well - so a pair has
// one answer, kept per adapter like the guard list itself: the served verdict, the census and the opt-outs it
// reads do not move under this file's own rewrites. a settling that reaches back into one in flight (a test
// reading the binding its own arm writes, `if (!cache) cache = make()`, or an install guarded by a test of a
// global another install it guards patches) takes the inner ask's guards open - the cut. an answer is kept
// unless a cut reached a settling in flight below it, whose answer it then depends on: one cut only by its
// own re-entry is what any ask of it computes. the re-entrant questions in flight that narrow decisions - the
// census pre-pass, a binding lookup, a decision-root lookup (`narrowingQuestions`) - make the context an answer
// is computed in, and an answer is kept for asks in that same context alone: whoever asks first within it answers
// for it, as in no such question. a lookup in flight refusing a re-entry narrows by which name it is in flight
// for, which the context leaves out, so an answer that met one there is not kept
const decidedGuardsByAdapter = new WeakMap();
// the targets being settled, each with its depth in the chain of settlings in flight, and the lowest depth a cut
// met by the settling now in progress reached
const settlingTargets = new Map();
let lowestSettlingCut = Infinity;
function decidedGuards(owner, target, adapter) {
  const inFlight = settlingTargets.get(target);
  if (inFlight !== undefined) {
    lowestSettlingCut = Math.min(lowestSettlingCut, inFlight);
    return { open: collectVarGuardsToDeclarator(owner.node, target), dead: false };
  }
  let byContext = decidedGuardsByAdapter.get(adapter);
  if (!byContext) decidedGuardsByAdapter.set(adapter, byContext = []);
  const { census, lookup, root } = narrowingQuestions;
  const decided = byContext[(census && 1) | (lookup && 2) | (root && 4)] ??= new WeakMap();
  let byTarget = decided.get(owner.node);
  if (!byTarget) decided.set(owner.node, byTarget = new Map());
  if (byTarget.has(target)) return byTarget.get(target);
  const depth = settlingTargets.size;
  const outerCut = lowestSettlingCut;
  const refusals = refusedReentries;
  lowestSettlingCut = Infinity;
  settlingTargets.set(target, depth);
  let settled, independent;
  try {
    settled = settledVarGuards(owner, target, adapter);
  } finally {
    settlingTargets.delete(target);
    independent = lowestSettlingCut >= depth && (!lookup || refusedReentries === refusals);
    lowestSettlingCut = Math.min(outerCut, lowestSettlingCut);
  }
  if (independent) byTarget.set(target, settled);
  return settled;
}

// ... the settling itself, of the guards of `target` in `owner` (a path)
function settledVarGuards(owner, target, adapter) {
  const guards = collectVarGuardsToDeclarator(owner.node, target);
  const parents = ownerParentIndexLocating(owner.node, target);
  const ctx = { scope: owner.scope, adapter, path: owner };
  const arms = guards.map(guard => {
    const host = parents.get(guard);
    // a default runs only where its slot reads `undefined`, which a slot the build serves never does
    if (host?.type === 'AssignmentPattern') {
      const hostPath = pathOfNode(owner, host);
      return hostPath && adapter.droppedDefault?.(hostPath) ? 'dead' : null;
    }
    const test = guardTest(parents, guard);
    if (!test) return null;
    // the test is asked where it stands: in the owner's scope - a function owner's own body block is that
    // scope - unless a block between them rebinds a name it reads, which only the host's own scope answers
    const between = { parents, from: parents.get(host), stop: owner.node.body, ownerNode: owner.node, read: test };
    const hostPath = lexicalHostsRebindRead(between) ? pathOfNode(owner, host) : owner;
    if (!hostPath) return null;
    const decision = adapter.settledSelection(host, hostPath === owner ? ctx : { scope: hostPath.scope, adapter, path: hostPath });
    const field = decision && parentFieldOf(host, guard, CONDITIONAL_BRANCH_FIELDS[host.type]);
    if (!field) return null;
    return decision.fold === field ? 'live' : decision.skip === field ? 'dead' : null;
  });
  return { open: guards.filter((guard, index) => arms[index] !== 'live'), dead: arms.includes('dead') };
}

// the operand the selection hosting `guard` tests (`parents`: its owner's parent index) - none for a guard no
// selection hosts
function guardTest(parents, guard) {
  const host = parents.get(guard);
  return host && host[SELECTION_TEST_FIELDS[host.type]];
}

// is a guard being settled right now (`decidedGuards`): its own test's reads are taken as the build serves them
// there (`readDecidesWrite`), so no answer reading them is kept past the settling
export function guardSettlingInFlight() {
  return settlingTargets.size > 0;
}

// the never-run answers of `writes` (nodes, `pathOf` giving the path each stands at) whose guards read one
// another's slots, kept in `answers` - the table every ask of such a write's answer reads while it is filled, so
// no settling recurses into another's. the installs of one global decide one another (`function a() { if
// (!globalThis.Map) globalThis.Map = shim }` beside its twin in `b`, neither read able to run ahead of the
// other): each `assumable` install under a guard is taken as one that never runs - the hypothesis every
// presence-guarded install fulfils: none of them running, each test reads what the build serves, and none runs -
// and every other write as one that runs, until the table shows it in an arm the build never takes. the installs
// taken are then asked again: one the hypothesis did not come true for may run, leaves it, and the table is
// settled anew without it. every write settles a bounded number of times however many guard one another, never
// once per order of asks. the guard answers kept per adapter read the table, so each change of it forgets them
export function settleWriteNeverRuns({ writes, assumable, answers, pathOf, adapter }) {
  const assumed = new Set(assumable.filter(write => guardedWriteOwner(write, pathOf(write))));
  const running = new Set();
  function neverRuns(write) {
    return writeNeverRuns({ write, usagePath: pathOf(write), adapter });
  }
  while (true) {
    for (const write of writes) answers.set(write, assumed.has(write));
    decidedGuardsByAdapter.delete(adapter);
    for (let grown = true; grown;) {
      grown = false;
      for (const write of writes) {
        if (answers.get(write) || running.has(write) || !neverRuns(write)) continue;
        answers.set(write, true);
        decidedGuardsByAdapter.delete(adapter);
        grown = true;
      }
    }
    const refuted = [...assumed].filter(write => !neverRuns(write));
    if (!refuted.length) return;
    for (const write of refuted) {
      assumed.delete(write);
      running.add(write);
    }
  }
}

// the guards of `target` the build leaves OPEN: a live arm runs whenever its host does, so it guards
// nothing. no adapter deciding selections decides nothing
function undecidedVarGuards(owner, target, adapter) {
  const guards = collectVarGuardsToDeclarator(owner.node, target);
  return guards?.length && adapter?.decidedSelection ? decidedGuards(owner, target, adapter).open : guards;
}

// the first var-scope owner (a path) from `fromPath` up that holds `node` - the owner a write a read
// observes from a closure stands in - or null
function varScopeOwnerHolding(node, fromPath) {
  for (let owner = findNearestVarScopeOwner(fromPath); owner; owner = findNearestVarScopeOwner(owner.parentPath)) {
    if (collectVarGuardsToDeclarator(owner.node, node) !== null) return owner;
  }
  return null;
}

// ... the owner (a path) of a `write` that stands under a guard in it, or null
function guardedWriteOwner(write, usagePath) {
  const owner = varScopeOwnerHolding(write, usagePath);
  return owner && collectVarGuardsToDeclarator(owner.node, write).length ? owner : null;
}

// does `write` (a node, or a path a scope's record names it by) stand in a dead arm of its owner, so never
// run. a write in a function below the use's own owners is asked in its own: an arm the build never takes
// is dead on every call
export function writeNeverRuns({ write, usagePath, adapter }) {
  if (!adapter?.decidedSelection) return false;
  const node = violationNode(write);
  const owner = varScopeOwnerHolding(node, usagePath) ?? ownWriteOwner(write, node, usagePath);
  return !!owner && !!collectVarGuardsToDeclarator(owner.node, node)?.length && decidedGuards(owner, node, adapter).dead;
}

// ... the owner of a write in a function below the use's own owners: off the path a record names it by, or
// off the function the write scan found the bare node in (`nestedWriteOwners`)
function ownWriteOwner(write, node, usagePath) {
  if (write !== node) return varScopeOwnerHolding(node, write);
  const fn = nestedWriteOwners.get(node);
  const fnPath = fn && pathOfNode(usagePath, fn);
  return fnPath ? varScopeOwnerHolding(node, fnPath) : null;
}

// ... and does a read that runs ahead of a `write` the build may run decide whether it runs: the read stands in
// the test of a guard of the write the build leaves open, or in the value of a local name such a test reads
// (`var P = window.Promise; if (!P || P.length !== 1) window.Promise = shim`) - the test answers at runtime by
// what the read holds there. asked outside the write's own settling, which takes the test's reads as the build
// serves them to decide it. a read no guard test of the write holds or reads leaves the guards unsettled
export function readDecidesWrite({ readNode, write, usagePath, adapter }) {
  if (!adapter?.decidedSelection || settlingTargets.has(write)) return false;
  const owner = guardedWriteOwner(write, usagePath);
  if (!owner) return false;
  const parents = ownerParentIndexLocating(owner.node, write);
  const names = capturingNames(owner.node, readNode);
  function testDependsOnRead(guard) {
    const test = guardTest(parents, guard);
    return !!test && (nodeRangeContains(test, readNode) || (names.size > 0 && identifierReferencedInSubtree(test, names)));
  }
  return collectVarGuardsToDeclarator(owner.node, write).some(testDependsOnRead)
    && decidedGuards(owner, write, adapter).open.some(testDependsOnRead);
}

// the local names the value holding `readNode` is stored to in the frame of `ownerNode`: those the declarators
// and the assignments it stands in the value of declare or assign - the root name of a member target among them
function capturingNames(ownerNode, readNode) {
  const names = new Set();
  const parents = ownerParentIndexLocating(ownerNode, readNode);
  for (let child = readNode, parent = parents.get(child); parent && parent !== ownerNode; child = parent, parent = parents.get(child)) {
    const target = parent.type === 'VariableDeclarator' && parent.init === child ? parent.id
      : parent.type === 'AssignmentExpression' && parent.right === child ? parent.left : null;
    const root = isMemberAccessNode(target) ? runtimeChainRoot(target) : null;
    if (root?.type === 'Identifier') names.add(root.name);
    else if (target) collectPatternBindingNames(target, names);
  }
  return names;
}

// does a read run before every one of `writes` (nodes) on its frame's first run: each stands in the frame of
// the read's own var-scope owner - the one at or above `anchorPath` holding `readNode` - and runs after the
// read (by text from where the read runs - `patternReadSite` - unless a class key outruns a static field:
// `writeOutrunsUse`), or holds the read in the value it stores (`X = X || shim` reads first). a write in a
// closure or another function may run at any time, so it answers false, and so does a read in an instance
// field's value, which runs at construction (`sitsInDeferredField`). a frame that runs again - a function
// called twice, a loop - takes the same answer on every run, the patch its first run installed
// notwithstanding: an engine lacking the global needs it on the first, and core-js wins over the patch on
// the rest
export function readRunsBeforeWrites({ readNode, anchorPath, writes }) {
  const owner = varScopeOwnerHolding(readNode, anchorPath);
  if (!owner || !writes.length || sitsInDeferredField(owner.node, readNode)) return false;
  const site = patternReadSite(owner.node, readNode);
  return writes.every(write => collectVarGuardsToDeclarator(owner.node, write) !== null
    && ((provablyPrecedes(site, write) && !writeOutrunsUse(write, anchorPath))
      || (write.type === 'AssignmentExpression' && nodeRangeContains(write.right, readNode))));
}

// where a read runs that sits in a destructuring TARGET - a key, a default, a nested level: after the
// right-hand side of its outermost pattern host (`patternHostRhs`), which the source spells after the
// pattern, so `const { self: { Set } } = (globalThis.self = fake, globalThis)` reads the replacement. the
// node-held twin of the climb `writeOutrunsUse` makes from a use's own path, for a read handed with a path
// elsewhere in its frame. the site is the host itself, whose span ends where that side does and outlives
// a rewrite of it - but a for-x head's, which ends past the body. any other read runs where it stands
function patternReadSite(ownerNode, readNode) {
  const parents = ownerParentIndex(ownerNode);
  let site = readNode;
  for (let child = readNode, parent = parents.get(child); parent; child = parent, parent = parents.get(child)) {
    const key = parent.id === child ? 'id' : parent.left === child ? 'left' : null;
    if (key && patternHostRhs(parent, key)) {
      site = FOR_X_STATEMENT_TYPES.has(parent.type) && hasRange(parent.right) ? parent.right : parent;
    }
    if (parent === ownerNode) break;
  }
  return site;
}

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
// is not found in any enclosing scope, so the caller applies its own default. an `adapter` deciding
// selections opens their live arms (`undecidedVarGuards`). `replaces` marks a node that replaces a value
// the read could observe before it - a write, not an initializer, whose early read is the accepted TDZ
// boundary: a function declaration holding the read is created when its scope is entered, so it may run
// before such a node wherever the source spells it (`hoistedFunctionRunsBefore`)
function nodeDominatesUsage({ node, usagePath, owner, climb, usageNode = null, adapter = null, replaces = false }) {
  const guards = undecidedVarGuards(owner, node, adapter);
  // `usageNode` overrides the textual read position for a multi-hop alias chain: an intermediate hop is
  // read at the prior declarator, not the host use, so a write AFTER that read can't change the captured
  // value. the guard / scope owner stay the host's (the chain lives in one scope)
  const readNode = usageNode ?? usagePath.node;
  if (guards !== null) return usageSitsUnderAllBranches(usagePath, owner.node, guards) && precedesOrUnordered(node, readNode);
  if (!climb) return false;
  const holder = varScopeOwnerHolding(node, owner.parentPath);
  if (!holder) return null;
  return undecidedVarGuards(holder, node, adapter).length === 0 && provablyPrecedes(node, owner.node)
    && !(replaces && hoistedFunctionRunsBefore({
      closure: closureCreatedBy(owner, holder).node, holder: holder.node, node, readNode, usagePath, adapter,
    }));
}

// may `closure`, the closure holding `readNode` that the frame `holder` (a node) creates, run before
// `node` there (`functionMayRunBefore`)
function hoistedFunctionRunsBefore({ closure, holder, node, readNode, usagePath, adapter }) {
  if (closure.type !== 'FunctionDeclaration' || !nodeRangeContains(closure, readNode)) return false;
  return functionMayRunBefore({ fn: closure, holder, node, usagePath, adapter, seen: new Set() });
}

// may the function declaration `fn` run before `node`, a node of the frame `holder`: created when its scope
// is entered, it runs as early as its first use - a reference to it, a call or a handout, outside its own
// body, that may run before `node` (`codeMayRunBefore`). an export specifier is no use: an importer runs
// once this module has. with no reference census, or a name the read sees bound elsewhere, it may
function functionMayRunBefore({ fn, holder, node, usagePath, adapter, seen }) {
  if (seen.has(fn)) return false;
  seen.add(fn);
  const name = fn.id?.name;
  const binding = name ? adapter?.getBinding?.({ scope: usagePath.scope, name, path: usagePath }) : null;
  if (!binding || bindingDeclaratorNode(binding) !== fn && (binding.path?.node ?? binding.node) !== fn) return true;
  const references = adapter.collectBindingReferences?.(usagePath, name);
  if (!references) return true;
  return references.some(reference => reference.parentPath?.node?.type !== 'ExportSpecifier'
    && !nodeRangeContains(fn, reference.node ?? reference)
    && codeMayRunBefore({ path: reference, holder, node, usagePath, adapter, seen }));
}

// may the code at `path` run before `node`, a node of the frame `holder`: in that frame code runs in source
// order, and code in a function below it runs when the function does - a declaration as early as its first
// use (`functionMayRunBefore`), any other function once it is created, which happens where it stands in
// the frame above it (`build` calling `create` ahead of a write lets `create` read before the write)
function codeMayRunBefore({ path, holder, node, usagePath, adapter, seen }) {
  for (let at = path; ;) {
    const frame = findNearestVarScopeOwner(at.parentPath);
    if (!frame || frame.node === holder) return !provablyPrecedes(node, at.node ?? at);
    if (frame.node.type === 'FunctionDeclaration') {
      return functionMayRunBefore({ fn: frame.node, holder, node, usagePath, adapter, seen });
    }
    at = frame;
  }
}

// the var-scope owner right below `holder` on the chain up from `owner` (inclusive): the closure the
// code of `holder` creates, before which nothing below it can run
function closureCreatedBy(owner, holder) {
  let closure = owner;
  for (let up = findNearestVarScopeOwner(closure.parentPath); up && up.node !== holder.node; up = findNearestVarScopeOwner(up.parentPath)) {
    closure = up;
  }
  return closure;
}

// does the read have a value to observe ahead of `node` - the declarator's init or a parameter's argument,
// an earlier write of `before`: it stays observable to a function declaration reading it from below,
// created when its scope is entered and so able to run before any write there (`nodeDominatesUsage`'s
// `replaces`); an init-less declaration is the accepted TDZ boundary
function valueObservedBefore({ declaration, before, node }) {
  return !(declaration?.type === 'VariableDeclarator' && !declaration.init)
    || before.some(other => other !== node && provablyPrecedes(other, node));
}

// is `binding` written on every path to the read - by one write landing on all of them, the dominance
// the reaching lane asks of its last write, or by a complete branching construct ahead of the read - so
// the read never sees it unset. a write in a dead arm keeps its guard open (`undecidedVarGuards`), so it
// lands nowhere a live read is; a function declaration holding the read may run before the one write,
// where it had a value to see (`valueObservedBefore`), as the reaching lane refuses it
export function bindingWrittenBeforeUsage({ binding, usagePath, usageNode = null, adapter = null }) {
  const owner = findNearestVarScopeOwner(usagePath);
  if (!owner) return false;
  const readNode = usageNode ?? usagePath.node;
  const declaration = bindingDeclaratorNode(binding);
  const before = reassignmentNodesBeyondDeclarator(binding).filter(node => precedesOrUnordered(node, readNode));
  return before.some(node => nodeDominatesUsage({
    node, usagePath, owner, climb: true, usageNode, adapter, replaces: valueObservedBefore({ declaration, before, node }),
  }) === true) || !!settlingConstructBefore({ before, usagePath, name: bindingDeclaratorName(binding), readNode });
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

// the index of the static element of `classNode` whose evaluation performs `readNode` - a static
// block, or a static field's VALUE (never its key, a decorator or the heritage): those run while the
// class evaluates its statics, in source order, after the class-scope binding is initialized. -1
// where the read is no such element's
export function staticEvaluationReaderIndex(classNode, readNode) {
  if (classNode?.type !== 'ClassDeclaration' && classNode?.type !== 'ClassExpression') return -1;
  const members = classNode.body?.body ?? [];
  if (!Number.isInteger(readNode?.start)) return -1;
  const at = members.findIndex(member => readNode.start >= member.start && readNode.end <= member.end);
  const reader = members[at];
  if (reader?.type === 'StaticBlock') return at;
  return reader?.static && CLASS_FIELD_TYPES.has(reader.type) && reader.value
    && readNode.start >= reader.value.start && readNode.end <= reader.value.end ? at : -1;
}

// Temporal ordering of an initializer and a read, without conditional-branch domination.
// Reads in the same execution frame cannot observe a later initializer; deferred bodies may, and so
// may a read a loop re-runs after a pass that ran the initializer.
// Lexical reads and possible mutation callees share this question. The textual test settles
// ordinary declare-then-use before a scope walk, keeping the common case off the hot path.
export function initializerMayRunBeforeUsage({ declaratorNode, usagePath, usageNode }) {
  const readNode = usageNode ?? usagePath?.node;
  if (staticEvaluationReaderIndex(declaratorNode, readNode) >= 0) return true;
  if (!usagePath || precedesOrUnordered(declaratorNode, readNode)) return true;
  const owner = varScopeOwnerHolding(declaratorNode, usagePath);
  // the declarator sits in no scope enclosing the read (a re-minted / detached node): no order to
  // prove either way, and the open default of this gate is the permissive one
  if (!owner) return true;
  // ... a read a loop's back-edge re-runs after a pass that ran the initializer may see it too
  return readRunsDeferredWithin(usagePath, owner.node)
    || (nodeSitsInLoopRerunWithin(owner.node, readNode, usagePath) && nodeSitsInLoopRerunWithin(owner.node, declaratorNode));
}

// the statement shapes a branching construct is summarised through - the hosts whose arms are
// mutually exclusive and statically enumerable. a loop is deliberately absent (zero iterations write
// nothing) and so is a labelled block (`break label` skips the rest of its body)
const BRANCHING_HOST_TYPES = new Set(['IfStatement', 'SwitchStatement', 'TryStatement']);

// does `statement` WRITE `name`? a `var name = X` declaration or a plain `name = X` expression
// statement - the unit an arm is credited with. a derived write (`name++`, `name += x`) is not one:
// it READS the name first, so it cannot be what makes the hoisted `undefined` unreachable
function statementWritesVarName(statement, name) {
  if (statement?.type === 'VariableDeclaration' && statement.kind === 'var') {
    return (statement.declarations ?? []).some(item => item.init && item.id?.type === 'Identifier' && item.id.name === name);
  }
  const write = statement?.type === 'ExpressionStatement' ? unwrapRuntimeExpr(statement.expression) : null;
  if (write?.type !== 'AssignmentExpression' || write.operator !== '=') return false;
  const target = unwrapRuntimeExpr(write.left);
  return target?.type === 'Identifier' && target.name === name;
}

// the CONDITIONAL shape a POSITION settles on its own: a branching construct standing UNGUARDED in
// the owner and provably before the read, every path through which writes `name` - or hard-exits, so
// the read was not reached that way. whichever path ran, the read observes a write and never the
// hoisted `undefined`. completeness is asked of the exit walk's dual, so an `if` needs its
// `alternate`, a `switch` its `default` and a `try` its handler; a lone `if`, a loop and a labelled
// block are not complete and keep refusing. the construct is located by climbing from the writes the
// caller hands in - the DECLARATORS for the positional question, the violation set for the value
// one. the answer is POSITIONAL only: whether the writes AGREE on a value is the caller's own
function completeBranchWritesBefore({ ownerNode, name, writeNodes, readNode }) {
  if (!name || !writeNodes?.length) return null;
  function hit(statement) {
    return statementWritesVarName(statement, name);
  }
  // the owner's parent index is asked ONCE, and WITHOUT the miss-rebuild: a write this index does
  // not hold sits in a nested var scope, which is no path through the OWNER's own branching, so it
  // is exactly the write this gate must ignore. asking the locating form per write re-walked the
  // whole owner - deeply, since the rebuild indexes excluded scopes too - for every name on a
  // write-dense file, and the walks compounded as the deeper index displaced the shallow one
  const parents = ownerParentIndex(ownerNode);
  const seen = new Set();
  for (const write of writeNodes) {
    if (!parents.has(write)) continue;
    for (let cur = parents.get(write); cur && cur !== ownerNode; cur = parents.get(cur)) {
      if (!BRANCHING_HOST_TYPES.has(cur.type) || seen.has(cur)) continue;
      seen.add(cur);
      if (collectVarGuardsToDeclarator(ownerNode, cur)?.length === 0
        && provablyPrecedes(cur, readNode) && nodeAlwaysReaches(cur, hit)) return cur;
    }
  }
  return null;
}

// ... the construct settling the writes ahead of a read (`before`) wherever they stand: asked in the
// owner holding them - the read's own, or the one a closure reading the name sits below, which observes
// the construct its definition follows - with every such write inside it or superseded by it.
// `{ construct, owner }`, or null
function settlingConstructBefore({ before, usagePath, name, readNode }) {
  const owner = before.length ? varScopeOwnerHolding(before.at(-1), usagePath) : null;
  const construct = owner && completeBranchWritesBefore({ ownerNode: owner.node, name, writeNodes: before, readNode });
  return construct && before.every(node => nodeRangeContains(construct, node) || provablyPrecedes(node, construct))
    ? { construct, owner } : null;
}

// the value a SETTLED write installs, read where the write stands: a declarator's init, a plain
// assignment's right. the construct's completeness is already proved by the branching walk, so what
// is left to ask is whether the writes AGREE - and the general reaching-value reader answers only
// for the host shapes its own walk knows, which an arm of an else-if chain, a `switch` case or a
// `catch` is not one of. null for anything else, which refuses the whole set
function settledWriteValue(node) {
  const write = unwrapRuntimeExpr(node);
  if (write?.type === 'VariableDeclarator') return write.init ?? null;
  if (write?.type === 'AssignmentExpression' && write.operator === '=') return write.right;
  return null;
}

// do two write VALUES spell the same thing? asked of the writes a complete branching construct
// settles, where the reaching value is whichever path ran - so one may be handed on only if every
// other would resolve the same. deliberately SHALLOW and syntactic: a bare name, a primitive literal,
// a static member chain of names, an object literal whose non-computed keys pair one for one.
// everything else answers false and the caller refuses, because a value this cannot compare is one
// the walk could still resolve two ways
function writeValuesAgree(a, b, depth = 0) {
  if (a === b) return true;
  if (!a || !b || depth > MAX_DEPTH || a.type !== b.type) return false;
  if (a.type === 'Identifier') return a.name === b.name;
  const literal = literalNodeValue(a);
  if (literal !== undefined && (literal === null || typeof literal !== 'object')) return literal === literalNodeValue(b);
  if (a.type === 'ThisExpression') return true;
  if (a.type === 'MemberExpression') {
    return !a.computed && !b.computed && a.property?.name === b.property?.name
      && writeValuesAgree(a.object, b.object, depth + 1);
  }
  if (a.type !== 'ObjectExpression') return false;
  const own = a.properties ?? [];
  const other = b.properties ?? [];
  return own.length === other.length && own.every((prop, index) => {
    const twin = other[index];
    const key = propertyKeyName(prop);
    return key !== null && key !== undefined && !prop.computed && !twin?.computed
      && key === propertyKeyName(twin) && writeValuesAgree(prop.value, twin.value, depth + 1);
  });
}

// SOUND gate for resolving a function-scoped `var` alias to a global. `var` hoists to the whole
// function, so `if (c) { var M = globalThis } M.Map()` binds M everywhere - but M holds the global
// only when `c` was truthy; usage-pure would rewrite the use to a receiver-less polyfill and mask
// the native TypeError on the c-falsy path. holds where the declarator DOMINATES the use - via the
// shared `nodeDominatesUsage` with `climb: true`, so an init captured from an OUTER scope by a
// later-defined closure still counts, and a declarator not located in any enclosing scope defaults
// to dominating (it is the declaration). where none dominates it holds on the other proof a POSITION
// can give: a branching construct that writes the name on EVERY path before the read, its writes
// agreeing on one value. an `adapter` deciding selections opens their live arms, as for a reaching write
export function varInitDominatesUsage({ declaratorNode, usagePath, usageNode = null, kind = null, adapter = null }) {
  // conditional-branch domination is a real question ONLY for hoisted `var` (a conditional
  // `if (c) { var M = ... }` binds everywhere but assigns on one path); a `let` / `const` is
  // block-scoped, so its declarator's branch is one the read sits in too. what a lexical binding
  // owes instead is the TEMPORAL question - the read must not run ahead of the initializer.
  // `usageNode` overrides the read position for both, like in the reachability mirrors: a
  // destructure capture / alias hop reads the value there, so the init must dominate THAT point,
  // not the eventual use (`const { [k]: S } = g; var k = 'x'` reads the hoisted undefined at the
  // capture even though the declarator precedes the use)
  if (kind && kind !== 'var') {
    // ... and a class EXPRESSION's own name, which that class's heritage and computed keys read before
    // it is initialized, exactly as a declaration's
    return kind === 'let' || kind === 'const' || declaratorNode?.type === 'ClassExpression'
      ? initializerMayRunBeforeUsage({ declaratorNode, usagePath, usageNode }) : true;
  }
  // no position to prove dominance against: a hoisted `var` init may be conditional or sit
  // after the read, and every pure caller of this gate rewrites on proof - bail the var kind
  // (`kind === null` legacy callers keep the open default; their arms flat-bail earlier)
  if (!usagePath) return kind !== 'var';
  const owner = findNearestVarScopeOwner(usagePath);
  if (!owner) return true;
  const dominates = nodeDominatesUsage({ node: declaratorNode, usagePath, owner, climb: true, usageNode, adapter });
  if (dominates !== false) return dominates === null ? true : dominates;
  // ... and the conditional shape a position still settles: no single declarator dominates, yet the
  // name is written on every arm of an if/else standing before the read
  return declaratorNode?.id?.type === 'Identifier' && !!completeBranchWritesBefore({
    ownerNode: owner.node,
    name: declaratorNode.id.name,
    writeNodes: cachedScopeVars(owner.node)?.get(declaratorNode.id.name) ?? [],
    readNode: usageNode ?? usagePath.node,
  });
}

// ... the question every init-order gate of the value canon asks, by what its reader does with the read:
// a reader that DROPS it (a pure substitution) owes the dominance above, and one that KEEPS it - the
// import-only analysis of usage-global, a value spelled at a WRITE (`adapter.keepsReads`) - only an
// initializer that may have run by the read and does not sit in the arm opposite it: the write
// completes only on the paths where the names it reads through were initialized (`if (c) { var ns =
// globalThis } a = ns.Array` throws on the other one)
export function initializerReachesRead({ adapter, binding, declaratorNode, usagePath, usageNode = null }) {
  if (adapter.method === 'usage-pure' && !adapter.keepsReads) {
    return varInitDominatesUsage({ declaratorNode, usagePath, usageNode, kind: binding?.kind ?? null, adapter });
  }
  const readNode = usageNode ?? usagePath?.node;
  return initializerMayRunBeforeUsage({ declaratorNode, usagePath, usageNode })
    && !(writeIsInOppositeBranch(declaratorNode, usagePath, readNode) && noReassignmentReachesUsage({
      reassignmentNodes: [declaratorNode],
      usagePath,
      usageNode: readNode,
      bindingScopeNode: binding?.scope?.block ?? binding?.scope?.path?.node,
      bindingAnchor: binding && bindingLoopAnchor(binding),
    }));
}

// does some node in `reassignmentNodes` provably overwrite a `var` / `let` alias on EVERY path
// reaching `usagePath` within the use's OWN var scope (SHALLOW - `climb: false`)? a write beyond that
// boundary is NOT counted: it may not have run by the use, and (for usage-global) bailing the
// init-FOLLOW on a cross-closure write would drop the primary key entirely and under-inject the
// reaching value - the cross-closure dead-init case is instead handled where the init is followed, by
// preferring `reachingReassignmentValueNode`'s value. returns false when no write dominates, letting
// usage-global keep resolving a still-live init (inject-if-maybe-needed). usage-pure bails on any reassignment.
// a caller that names the reaching value itself, so drops nothing, passes `climb`: a write completing
// before the reading closure is created then dominates as well (`nodeDominatesUsage`, as a replacing write).
// an `adapter` deciding selections opens their live arms (`undecidedVarGuards`). `beforeNode` keeps the writes the
// source provably places ahead of it, asked of each in turn: a long list stops at the first write that dominates
export function reassignmentDominatesUsage({
  reassignmentNodes, usagePath, usageNode = null, afterNode = null, beforeNode = null, adapter = null, climb = false,
}) {
  if (!usagePath || !reassignmentNodes?.length) return false;
  const owner = findNearestVarScopeOwner(usagePath);
  if (!owner) return false;
  // a use re-run by a loop back-edge can observe a textually-EARLIER-but-later-executing write (a
  // `for (;; M = x)` update runs after the body, so the first iteration's body read precedes it). no
  // reassignment provably dominates such a use - keep resolving the init (over-inject-safe). the
  // textual-precedence check below can't see this, so guard it the same way the pure / reaching
  // siblings (`noReassignmentReachesUsage`, `reassignmentValueNodes`) do
  if (nodeSitsInLoopRerunWithin(owner.node, usageNode ?? usagePath.node, usagePath)) return false;
  // NOT asked here, deliberately: `writeOutrunsUse` says the write's SLOT runs ahead of the use's,
  // never that the write inside that slot is unconditional. Claiming dominance from it killed a live
  // init for a key that only sometimes writes (`static [(c ? (K = 'at') : 0, 'k')]()`), and the value
  // the init still holds then lost its polyfill. The over-injecting answer is the safe one here
  // its MIRROR: a use in a slot its container evaluates EARLY - a class computed key, a case test -
  // runs BEFORE the writes the source places above it, so no such write dominates it however far the
  // position ranks it first. asked here because it only ever REMOVES a dominance claim, which is the
  // over-injecting direction; the reaching-value sibling carries the same gate for the same reason
  // A registered alias may describe a later write, not the initializer. Only a write after
  // that registration can kill its candidate; missing source positions prove nothing.
  return reassignmentNodes.some(node => (!afterNode || provablyPrecedes(afterNode, node))
    && (!beforeNode || provablyPrecedes(node, beforeNode)) && !useOutrunsWrite(node, usagePath)
    && nodeDominatesUsage({ node, usagePath, owner, climb, usageNode, adapter, replaces: true }));
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
// PROOF. a loop-carried write or a deferred read prevents that proof. otherwise every write must
// follow the read within its own var scope, occupy the opposite branch in that execution,
// or occupy a container slot evaluated after the read
// (a class initializer after every computed key). a fresh loop-body binding starts anew. no
// reassignment -> the init trivially reaches. mirror of reassignmentDominatesUsage (global bails only
// when the init is provably DEAD; pure resolves only when it is provably the LIVE value). `usageNode`
// overrides the read position like in the mirror: an alias hop / destructure CAPTURE reads the value
// there, so a same-scope write between the capture and the eventual use cannot reach the captured value
export function noReassignmentReachesUsage({
  reassignmentNodes, usagePath, usageNode = null, bindingScopeNode = null, bindingAnchor = null,
}) {
  if (!usagePath) return false;
  if (!reassignmentNodes?.length) return true;
  let owner = findNearestVarScopeOwner(usagePath);
  if (!owner) return false;
  // A container may capture this value outside the eventual consumer's closure.
  // Its declaration is the read site for both position and execution-frame checks.
  if (usageNode && !nodeRangeContains(owner.node, usageNode)) {
    if (!OWNER_WRITE_PATH_TYPES.has(usageNode.type)) return false;
    const captured = enclosingOwnerWritePath(usagePath, usageNode);
    if (!captured) return false;
    usagePath = captured;
    owner = findNearestVarScopeOwner(captured);
    if (!owner) return false;
  }
  const readNode = loopHeadValueReadAnchor(owner.node, usageNode ?? usagePath.node, usagePath);
  if ((!bindingAnchor || usageNode) && nodeSitsInLoopRerunWithin(owner.node, readNode, usagePath)) return false;
  // "textually after the read" proves nothing beyond ONE activation of that owner. when the owner
  // is re-invocable while the binding outlives it, the previous activation's write runs before the
  // next activation's read - the same exposure a loop back-edge creates, one scope level up. the
  // read-side deferral predicate is the shared one the reachable-value union already gates on
  // A hoisted var's adapter scope can be its initializer's branch. Its binding still
  // belongs to this activation when the declaration lies in the read's var-scope owner.
  const bindingOwner = bindingAnchor?.kind === 'var' && nodeRangeContains(owner.node, bindingAnchor.decl)
    ? owner.node : bindingScopeNode;
  if (bindingOwner && readRunsDeferredWithin(usagePath, bindingOwner)) return false;
  // the same rule from the SOUND side: a write in a slot that runs ahead of the use's own reaches it,
  // however far past the read its span sits, so this gate must decline rather than call it "after"
  if (anyWriteOutrunsUse(reassignmentNodes, usagePath)) return false;
  // computed method keys and immediately invoked bodies run in their enclosing loop, even
  // when their syntactic var-scope owner stops the positional walk above.
  if (usageCrossesLoopBackEdgeReassign(usagePath, reassignmentNodes, bindingAnchor, readNode)) return false;
  // an early container slot observes the init before that container's late writes even when the
  // source places them above it. the relation excludes writes outside the container.
  return reassignmentNodes.every(node => useOutrunsWrite(node, usagePath)
    || nodeFollowsUsageInScope({ node, readNode, owner })
    || (writeIsInOppositeBranch(node, usagePath, readNode)
      && collectVarGuardsToDeclarator(owner.node, node) !== null));
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

// the if/else HOST a `var` declarator sits directly in one arm of, or null: the two arms are
// mutually exclusive, so a declarator in one neither supersedes nor is superseded by one in the
// other - the single re-declaration shape whose value cannot be overwritten by its twin
function ifElseArmHostOf(ownerNode, declarator) {
  const guards = collectVarGuardsToDeclarator(ownerNode, declarator);
  if (guards?.length !== 1) return null;
  const [arm] = guards;
  const host = ownerParentIndexLocating(ownerNode, declarator).get(arm);
  return host?.type === 'IfStatement' && host.alternate
    && (host.consequent === arm || host.alternate === arm) ? host : null;
}

// ... and the one nested re-declaration whose value still reaches the owner's level: it stands in an
// ARM of an if/else, so no sibling declaration of the name can overwrite it - the other arm never
// runs beside it, and a block that merely precedes one does. the shadow the owner-level restriction
// also names is answered where the value is RESOLVED, each consumer reading the init in the scope
// its declarator sits in, so the enumeration owes only the overwrite question
function nestedDeclaratorInitReadsOwnerValue(declarator, ownerNode) {
  return declarator.id?.type === 'Identifier' && ifElseArmHostOf(ownerNode, declarator) !== null;
}

// the statement hosts a `var` declaration nests under and still runs on its owner's own straight
// line: a plain block only GROUPS statements (the function body's own block among them), a label
// only NAMES one, and an export wrapper is not a statement host at all. every other host - an if
// arm, a loop body, a switch case, a try block - is a branch `collectVarGuardsToDeclarator` already
// records, so the two channels never answer the same question twice
const STRAIGHT_LINE_VAR_HOSTS = new Set(['BlockStatement', 'LabeledStatement', 'ExportNamedDeclaration']);

// does a `break` inside this LabeledStatement target its OWN label? such a break jumps past the rest
// of the labelled body, so a declaration below it may never run while a read after the label still
// does - the one way a label stops being a straight-line wrapper. answered conservatively (any
// matching break in the body, not only one above the declaration): the shape is rare, and refusing
// is the sound direction for a value channel usage-pure substitutes on
function labeledBodyBreaksOut(node) {
  const name = node.label?.name;
  if (!name) return true;
  let found = false;
  walkAstNodes({ root: node.body, visit(child) {
    if (child.type === 'BreakStatement' && child.label?.name === name) found = true;
    return !found;
  } });
  return found;
}

// does this `var` re-declaration stand on the OWNER's own straight line? the declaration may nest
// under any run of grouping hosts - what disqualifies it is a host that BRANCHES, which the guard
// collector records separately, or a LABEL whose body breaks out: it groups by type, but the jump
// ends the body, so a declaration below the break never runs while a read after the label does
function ownerLevelDeclarator(declarator, ownerNode) {
  const parents = ownerParentIndexLocating(ownerNode, declarator);
  for (let cur = parents.get(parents.get(declarator)); cur; cur = parents.get(cur)) {
    if (cur === ownerNode) return true;
    if (!STRAIGHT_LINE_VAR_HOSTS.has(cur.type)) return false;
    if (cur.type === 'LabeledStatement' && labeledBodyBreaksOut(cur)) return false;
  }
  return false;
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
// a slot default (`[A = X] = [..]`) may or may not apply at runtime -> ambiguous -> null, and so
// does a slot of a container the file wrote (`patternSlotWritten`).
// a pattern write over a CALL pairs nothing in this layer: the answer is `{ callSite }`, the site
// the caller's call canon pairs (`handOnCallSite`), not a node
function reassignmentRhsForBinding(node, ownerNode, bindingName, ctx) {
  // pattern target first: the plain helper returns the WHOLE RHS for any `=` without inspecting
  // the target shape, so `[K] = ['of']` would flow the array literal instead of the slot value
  const write = plainWriteOf(node, ownerNode);
  if (write && isDestructurePattern(write.target)) {
    if (!bindingName) return null;
    // a CALL value pairs nothing here (the call canon is the detect layer's): the site goes back as
    // a marker the reaching lanes carry like a value and hand to their caller's sink
    const [callSite] = patternCallSites(write.target, [write.value]);
    if (callSite) return { callSite };
    const certain = patternSlotCertainDefault(write.target, write.value, bindingName, ctx);
    if (certain) return certain;
    if (patternSlotWritten({ pattern: write.target, init: write.value, name: bindingName, ctx })) return null;
    const values = patternSlotValues(write.target, write.value, bindingName, ctx);
    return values.length === 1 && !patternSlotValueAmbiguous(write.target, write.value, bindingName, ctx) ? values[0] : null;
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

// Function-valued slots guaranteed on a pristine object before any Annex B polyfill installation.
export const OBJECT_PROTOTYPE_FUNCTION_KEYS = new Set([
  'constructor',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toLocaleString',
  'toString',
  'valueOf',
]);
// Other inherited keys: Annex B members and non-standard legacy extensions.
const OBJECT_PROTOTYPE_KEYS = new Set([
  ...OBJECT_PROTOTYPE_FUNCTION_KEYS,
  '__defineGetter__',
  '__defineSetter__',
  '__lookupGetter__',
  '__lookupSetter__',
  '__proto__',
  'toSource',
  'watch',
  'unwatch',
]);

// may a literal inherit `key` along its prototype chain (`owners`, the constructors whose prototypes
// it walks)? a member the engines put on `Object.prototype`, or a key the FILE writes onto one of those
// prototypes itself - through any spelling the mutation census follows, an unknown key included -
// which every such literal of the file then inherits
export function prototypeChainMayLend(key, ctx, owners) {
  return OBJECT_PROTOTYPE_KEYS.has(key) || owners.some(owner => !!ctx?.adapter?.isMutatedStaticSlot?.(`${ owner }.prototype`, key)
    || !!ctx?.adapter?.isMutatedStaticSlot?.(owner, 'prototype'));
}

// the value the binding `name` takes from its own top-level slot DEFAULT where that default fires
// with certainty, or null - `name` may instead be that DEFAULT node itself, for a slot holding a nested
// pattern (`{ A: { at } = fa() } = {}`): so it does where the rhs LITERAL itself - never one reached through a
// name, which the file may have written since (`ctx.held`: an alias holds the call that yields
// it) - provably leaves the slot undefined: an object
// literal naming every key it spells (no spread, no key the pairing cannot fold, no `__proto__` that
// could lend the key) without this one - and no prototype could lend it either - or with it `void`,
// an array literal with its ordinary iterator and no spread whose slot is past its end,
// `void`, or a hole no written
// prototype key could fill. a bare `undefined`
// names a binding a scope may shadow, a parameter of the callee a call's literal comes from included
export function patternSlotCertainDefault(pattern, rhs, name, ctx = null) {
  if (ctx?.held) return null;
  rhs = installedWriteValue(rhs);
  if (ctx?.followIifeReturns) rhs = peelIifeReturnTarget(rhs, ctx.adapter?.isMutatedStaticSlot ?? ctx.adapter?.isMutatedStatic);
  function ownDefault(slot) {
    if (typeof name != 'string') return slot === name;
    return slot?.type === 'AssignmentPattern' && slot.left?.type === 'Identifier' && slot.left.name === name;
  }
  let slot = null;
  if (pattern?.type === 'ArrayPattern' && rhs?.type === 'ArrayExpression') {
    if (prototypeChainMayLend('Symbol.iterator', ctx, ['Array'])) return null;
    const index = pattern.elements.findIndex(ownDefault);
    if (index === -1 || rhs.elements.some(element => element?.type === 'SpreadElement')) return null;
    if (rhs.elements[index] && !isVoidExpression(unwrapRuntimeExpr(rhs.elements[index]))) return null;
    // a HOLE inside the literal's length is read off the prototype chain; past the end the iterator
    // stops and reads nothing
    if (!rhs.elements[index] && index < rhs.elements.length && prototypeChainMayLend(String(index), ctx, ['Array', 'Object'])) return null;
    slot = pattern.elements[index];
  } else if (pattern?.type === 'ObjectPattern' && rhs?.type === 'ObjectExpression') {
    const prop = pattern.properties.find(item => isPropertyNode(item) && ownDefault(item.value));
    const key = prop ? patternPropKey(prop, ctx, pattern) : null;
    if (key === null || prototypeChainMayLend(key, ctx, ['Object']) || !rhs.properties.every(item => {
      const spelled = isPropertyNode(item) ? patternPropKey(item, ctx, pattern) : null;
      if (spelled === null || spelled === '__proto__' && !item.computed) return false;
      return spelled !== key || isVoidExpression(unwrapRuntimeExpr(item.value));
    })) return null;
    slot = prop.value;
  }
  return slot && installedWriteValue(slot.right);
}

// is the value a pattern slot pairs AMBIGUOUS for a consumer reading it as certain: a slot default
// that may or may not fire at runtime, or a slot a spread may shift (`patternSlotSpreadShifted`)?
export function patternSlotValueAmbiguous(pattern, rhs, name, ctx = null) {
  return patternSlotHasDefault(pattern, name) && !patternSlotCertainDefault(pattern, rhs, name, ctx)
    || patternSlotSpreadShifted(pattern, rhs, name, ctx);
}

// the binding target under a pattern slot: a DEFAULT wraps it, and every walk that pairs slots
// against values peels the same way
export function patternSlotTarget(target) {
  return target?.type === 'AssignmentPattern' ? target.left : target;
}

// the slot an extraction writes as the source SPELLS it, not through the name a binding declares: a member
// access, or a binding a TS assertion wraps (`(v as any)`, `v!`) - a paren alone keeps a plain binding
export function spelledWriteSlot(value) {
  const target = patternSlotTarget(value);
  const root = unwrapRuntimeExpr(target);
  return isMemberAccessNode(root) || (root?.type === 'Identifier' && unwrapParens(target) !== root) ? target : null;
}

// does the HOST pattern hold this prop ALONE, every level down to it spelling one key? asked by both
// legs before LIFTING a prop's pattern out of its statement: a sibling the host keeps runs its own
// key effects where the statement stands while the lifted pair runs after ALL of them - the source
// ordered the two around each other - and a prop in the MIDDLE of its level has no placement that
// orders both sides at all. a host nothing survives in is the only one the lift leaves in order.
// `gone` names the props an earlier claim already took out of the statement: a binding that queues its
// rewrites still holds them where the other has removed them
export function soleChainToProp(hostPattern, target, gone = null) {
  let level = patternSlotTarget(hostPattern);
  while (level?.type === 'ObjectPattern') {
    const live = gone ? level.properties.filter(item => item === target || !gone(item)) : level.properties;
    if (live.length !== 1) return false;
    const [only] = live;
    if (only === target) return true;
    level = patternSlotTarget(only.value);
  }
  return false;
}

// the key PATH from the pattern's root down to `name` - the slots a container read walks through
// (`{ a: { b: { groupBy: g } } }` reads `g` through `a`, then `b`, then `groupBy`). the whole path
// and not just its head: a nested container has no binding name of its own, so only the path can
// name the slot a write replaced. `null` where a slot on the way cannot be named - a computed
// spelling the key canon cannot fold, or a rest target, which takes every remaining slot. several
// paths where the pattern binds the name more than once; null names every binding leaf
export function patternRootKeyPathsFor(pattern, name, ctx) {
  const paths = [];
  let unnameable = false;
  function leadsTo(node) {
    return !!node && patternBindsIdentifier(node, id => name === null || id.name === name);
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

// the container a pattern's init NAMES and the declaration that owns its slot records: the pairing
// follows const aliases to their literal, so the records are asked of that same declaration - an
// alias of the container has no slot records of its own. null for an init that is no bare name
function patternContainerOwner(init, ctx) {
  const container = unwrapRuntimeExpr(init);
  if (container?.type !== 'Identifier') return null;
  const followed = followConstIdentifierInit({ node: container, readNode: init, seen: ctx.seen, ctx });
  const containerBinding = ctx.adapter.getBinding({ scope: ctx.scope, name: container.name, path: ctx.path, read: container });
  const ownerNode = followed.readNode?.type === 'VariableDeclarator' ? followed.readNode
    : containerBinding?.path?.node ?? containerBinding?.node ?? null;
  return { ownerName: ownerNode?.id?.name ?? container.name, ownerNode };
}

// does a write the file recorded reach slot `keys` - or a prefix of it - of the container `init`
// NAMES, asked of the declaration that owns it (`patternContainerOwner`) at `ctx`'s read position?
// such a slot holds no one certain value, whatever reads it - pure declines a read that needs one,
// global unions the written values in, typing reads no type off the literal. only a write that may
// reach the capture counts; a later one cannot change the captured value. `usageNode` overrides
// that position for a consumer re-reading the slot rather than using its captured value.
export function containerSlotWritten(init, keys, ctx, usageNode = init) {
  const adapter = ctx?.adapter;
  if (!adapter?.isWrittenContainerSlot) return false;
  const owner = patternContainerOwner(init, ctx);
  return !!owner && adapter.isWrittenContainerSlot(owner.ownerName, keys, owner.ownerNode, ctx.path, usageNode);
}

// ... at the slot a pattern binds `name` to - a declarator's and a pattern write's alike, `ctx` the
// pairing's `{ scope, adapter, path, resolveKey }`; a slot the pattern cannot name reads an UNKNOWN
// one, which any write on the container reaches
export function patternSlotWritten({ pattern, init, name, ctx }) {
  return (patternRootKeyPathsFor(pattern, name, ctx) ?? [[MUTATED_MEMBERS_UNKNOWN]])
    .some(keys => containerSlotWritten(init, keys, ctx));
}

// the value a LITERAL holds at `keys` - object keys and array indices, through const aliases of the
// literals on the way - as `{ node }`, or null where a level is no literal or spells no such slot. a
// level that is a member read of ANOTHER container (`o.k = NS.inner`) holds what that container does
// at the read's own path: `{ container, keys }` hands the walk over to it. `ownData` requires
// stored identity at the final use: even a pure getter can return a fresh object on every read,
// and an alias captured inside a literal can have its own slot writes. Follow each alias in its
// declaration scope; a same-named local at the use does not own that captured object.
function literalValueAt(node, keys, ctx, ownData = false) {
  let cur = node;
  for (let at = 0; at < keys.length; at++) {
    cur = installedWriteValue(cur);
    if (ownData && containerSlotWritten(cur, keys.slice(at), ctx, ctx.path?.node)) return null;
    const followed = ctx?.adapter && cur?.type === 'Identifier'
      ? followConstIdentifierInit({ node: cur, readNode: cur, seen: ctx.seen, ctx }) : null;
    const literal = followed?.node;
    const level = literal?.type === 'ArrayExpression' || literal?.type === 'ObjectExpression' ? literal : cur;
    if (followed && level === literal) ctx = followed.ctx;
    const through = isMemberAccessNode(level) ? memberChainKeys(level) : null;
    if (through?.root?.type === 'Identifier' && !through.keys.includes(null)) {
      return { container: through.root, keys: [...through.keys, ...keys.slice(at)] };
    }
    const property = level?.type === 'ObjectExpression' ? objectLevelPairedProperty(level, keys[at]) : null;
    if (ownData && property?.match.kind === 'get') return null;
    cur = property?.read ?? arrayLiteralSlotValue(level, keys[at]);
    if (!cur) return null;
  }
  return { node: cur };
}

// the values the file WROTE into the slot at each of `keyPaths` of the container `init` NAMES (null:
// a slot no path names, which every write on the container reaches): a read that the write reached
// lands on its value, so the usage-global union injects for each beside the literal's own, and the
// mutation census records a patch through the slot on each. a write at a PREFIX of the path replaced
// the container the rest reads through: its value, where a literal spells it, holds that slot - and
// where it reads another container, what that one's literal and writes hold there, asked once per
// container and path (a cycle of such reads ends)
export function writtenContainerSlotValuesAt(init, keyPaths, ctx) {
  if (!ctx?.adapter?.writtenContainerSlotValues) return [];
  const asked = new Map();
  function writtenAt(owner, keys, at) {
    // ... a write no execution runs ahead of the read never lands under it: the read captured the slot
    // before (`isWrittenContainerSlot` asked at the read)
    function slot(path) {
      if (at.path && !at.adapter.isWrittenContainerSlot?.(owner.ownerName, path, owner.ownerNode, at.path, at.path.node)) return [];
      return at.adapter.writtenContainerSlotValues(owner.ownerName, path, owner.ownerNode);
    }
    return [
      ...slot(keys),
      ...keys.slice(1).flatMap((key, depth) => slot(keys.slice(0, depth + 1))
        .flatMap(written => spelledAt(written, keys.slice(depth + 1), at))),
    ];
  }
  function spelledAt(value, keys, at) {
    const found = literalValueAt(value, keys, at);
    if (!found?.container) return found ? [found.node] : [];
    // the container is named where the read of it is spelled
    const site = pathOfNode(at.path, found.container);
    const via = site ? { ...at, scope: site.scope, path: site } : at;
    const owner = patternContainerOwner(found.container, via);
    const ownerKey = owner?.ownerNode ?? owner?.ownerName;
    const path = JSON.stringify(found.keys);
    if (!owner || asked.get(ownerKey)?.has(path)) return [];
    if (!asked.has(ownerKey)) asked.set(ownerKey, new Set());
    asked.get(ownerKey).add(path);
    return [...spelledAt(found.container, found.keys, via), ...writtenAt(owner, found.keys, via)];
  }
  const owner = patternContainerOwner(init, ctx);
  if (!owner) return [];
  return (keyPaths ?? [[MUTATED_MEMBERS_UNKNOWN]]).flatMap(keys => writtenAt(owner, keys, ctx));
}

// ... at the slot a pattern binds `name` to
export function writtenPatternSlotValues({ pattern, init, name, ctx }) {
  return writtenContainerSlotValuesAt(init, patternRootKeyPathsFor(pattern, name, ctx), ctx);
}

// the caller-correct FALLBACK SLOT the probe rule stops at: a value that runs ONLY when nothing was
// passed - a parameter default and an inner destructure default, both spelled as an AssignmentPattern
// right. the slot's doctrine lives in the provider's AGENTS.md: a PLAIN undefinable receiver keeps the
// always-defined literal there, because the slot fires only on the omitted argument and reproducing the
// absent-host throw is not worth the output complexity. the climb ends at the function that OWNS the
// slot - a nested function body or instance-field value runs later, not on that path
export function inCallerCorrectFallbackSlot(path, receiverNode = path?.node) {
  // a node-based binding can hold the pattern's path while asking about its receiver.
  // re-anchor that node before the placement climb; the pattern and its RHS occupy different slots.
  if (receiverNode && path?.node !== receiverNode) path = syntheticNodeAncestry(rootProgramOf(path), receiverNode);
  for (let up = path?.parentPath, child = path; up?.node; child = up, up = up.parentPath) {
    const { type } = up.node;
    if (type === 'AssignmentPattern' && up.node.right === child.node) return true;
    // a logical left selects the next branch by its own value, even inside a default.
    if (type === 'LogicalExpression' && up.node.left === child.node) break;
    if (FUNCTION_LIKE_NODE_TYPES.has(type) || isDeferredFieldValueNode(up.node, child.node) || type === 'Program') break;
  }
  return false;
}

// does the pattern bind `name` in ANY slot (identifier leaf, renamed value, rest, nested, with or
// without a default)? one spelling of that question, over the canonical binding-leaf walk - the
// default-guarded ask above keeps its own walk because it TRACKS default context, which the leaf
// walk deliberately does not carry
export function patternBindsName(pattern, name) {
  return patternBindsIdentifier(pattern, id => id.name === name);
}

// the binding's own VariableDeclarator, across BOTH binding shapes the resolvers are handed: the
// usage adapters wrap the declarator on `.node`, while a raw parser binding carries only `.path`.
// exported because the value canon and the class walk are handed the same pair - a resolver reading
// one shape is blind exactly where the other sees
export function bindingDeclaratorNode(binding) {
  return binding?.node?.type === 'VariableDeclarator' ? binding.node : binding?.path?.node;
}

// does the binding's own declarator install its initializer inside a span - a `var` the source declares past an earlier
// write of its name (`x = 'ab'; var x = [3, 4]; x.at(-1)`)? a write the record never lists, which a positional
// ranking of the recorded writes has to see as the later one
export function declaratorInitRunsWithin(binding, from, to) {
  const declarator = bindingDeclaratorNode(binding);
  return declarator?.type === 'VariableDeclarator' && !!declarator.init && declarator.start >= from && declarator.end <= to;
}

// the PATH a binding is declared at, the synthetic hoisted shape's included (`synthHoistedBinding`
// surfaces it as a thunk): for a consumer that anchors a read at the declaration. a flow consumer
// keying on a MISSING `.path` reads the binding's own slots instead
export function bindingDeclarationPath(binding) {
  return binding?.path ?? binding?.declarationPath ?? binding?.resolveDeclaratorPath?.() ?? null;
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
// scope by the caller; `init` stands in for the declarator's init where the caller already
// followed it to the value the pairing reads (a call's returned literal, with `ctx` at its scope)
export function patternBoundAliasSlotInit(binding, name, ctx, { maybe = false, init = undefined } = {}) {
  const decl = bindingDeclaratorNode(binding);
  if (decl?.type !== 'VariableDeclarator' || decl.id?.type === 'Identifier' || !decl.init) return null;
  const rhs = init ?? decl.init;
  const certain = patternSlotCertainDefault(decl.id, rhs, name, ctx);
  if (certain) return certain;
  const values = patternSlotValues(decl.id, rhs, name, ctx);
  if (values.length !== 1) return null;
  return maybe || !patternSlotValueAmbiguous(decl.id, rhs, name, ctx) ? values[0] : null;
}

// the names a statement list binds around what it holds (`stmtRebindNames`): its lexicals and the
// functions it declares - a block-level function binds in its block in either mode, Annex-B only adds a
// var beside it, which is why the hoist-blocking set (`blockLexicalNames`) leaves it out and this one does not
function blockBoundNames(bodyStatements, into = []) {
  for (const stmt of bodyStatements ?? []) stmtRebindNames(stmt, into);
  return into;
}

// the names a host between a read and its var-scope owner rebinds: a block body, a switch case - the
// cases of a switch share ONE block env, so a case binds every case's names (`parent`, its switch) -
// a catch parameter, a `let` / `const` loop head. `var` hoists past every one of them and rebinds
// nothing here. the climbing twin of the reassignment index's `blockShadowNames`, which walks down and
// keys an env by the node owning it: climbing, a case answers for its switch, so a `var` a case declares
// still sees the env its write crosses
function hostLexicalNames(host, parent) {
  switch (host?.type) {
    case 'BlockStatement': return blockBoundNames(host.body);
    case 'SwitchCase': {
      const names = [];
      for (const switchCase of parent?.cases ?? [host]) blockBoundNames(switchCase.consequent, names);
      return names;
    }
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

// ... does one of those hosts between a read at `path` and its ancestor `stop` rebind `name`: the path twin of
// the owner-indexed walk below, for a reader climbing paths
function lexicalHostRebindsBelow(name, path, stop) {
  for (let up = path; up?.node && up.node !== stop; up = up.parentPath) {
    const names = hostLexicalNames(up.node, up.parentPath?.node);
    if (Array.isArray(names) ? names.includes(name) : names?.has(name)) return true;
  }
  return false;
}

// a reaching write resolves in its binding's declarator scope, so lexical hosts shared by declaration
// and write introduce no shadow - the function body and a shared nested block are the ordinary
// case. A host belonging to only ONE side can rebind a name the write reads - its value, a pattern's
// keys and source: a nested write sees its local source, while a hoisted var declared in a nested
// block can resolve a later outer write there.
function writeReadsBlockShadow(ownerNode, writeNode, declarationNode) {
  const parents = ownerParentIndexLocating(ownerNode, writeNode);
  const declarationAncestors = new Set();
  for (let cur = declarationNode; cur; cur = parents.get(cur)) declarationAncestors.add(cur);
  let common = parents.get(writeNode);
  while (common && common !== ownerNode && !declarationAncestors.has(common)) common = parents.get(common);
  const write = plainWriteOf(writeNode, ownerNode);
  return [write?.target, write?.value ?? writeNode].some(read => read
    && (lexicalHostsRebindRead({ parents, from: parents.get(writeNode), stop: common, ownerNode, read })
      || lexicalHostsRebindRead({ parents, from: declarationNode, stop: common, ownerNode, read })));
}

// does a lexical host from `from` up to (excluding) `stop` or the owner rebind a name `read` references
function lexicalHostsRebindRead({ parents, from, stop, ownerNode, read }) {
  for (let cur = from; cur && cur !== stop && cur !== ownerNode; cur = parents.get(cur)) {
    for (const name of hostLexicalNames(cur, parents.get(cur)) ?? []) if (identifierReferencedInSubtree(read, name)) return true;
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
// flow-dependent: the before-use write running last (`lastRunningWrite`: a class key runs ahead of the
// field values above it) when it runs unconditionally in the read's own var scope (and, for
// `requireSingleObservation`, nothing writes after the read), the last
// dominating write above a closure that reads the binding, or - where no single write reaches - the
// value a COMPLETE branching construct settles, every one of its writes agreeing on it; a read that
// itself runs deferred below
// that scope (an instance field initializer) has no textually-last write at all. a selection the build decides
// settles its arms first: a write in the arm it never takes is no write, the arm it always takes no guard
// (`decidedGuards`). the caller resolves the returned node in the declarator's scope - or, with a
// `writeScopes` sink, in the scope the one answering write stands in, which the lane pushes there.
// a reaching write that is a pattern over a CALL pairs nothing here: with a `callSites` sink the site
// goes to it (`{ pattern, value }`, for the call canon) and the answer is null; without one it reads
// as flow-dependent
export function reachingReassignmentValueNode({
  binding, usagePath, ctx = null, usageNode = null, requireSingleObservation = false, callSites = null, writeScopes = null,
}) {
  if (!usagePath || writesPastCeiling(binding.constantViolations)) return null;
  const adapter = ctx?.adapter;
  const owner = findNearestVarScopeOwner(usagePath);
  if (!owner) return null;
  // `usageNode` overrides the textual read position for a multi-hop alias hop (`const b = a` reads `a`
  // at the declarator, not at the eventual use of `b`): a write to `a` AFTER that read does not reach
  // the captured value, so it is excluded below and the live declarator-init resolves
  const readNode = usageNode ?? usagePath.node;
  if (nodeSitsInLoopRerunWithin(owner.node, readNode, usagePath)) return null;
  // a read in a deferred context BELOW its own var-scope owner - an instance field initializer, run
  // at `new`-time - has no textually-last write: any write in the owner may run before it. the gate
  // the pure and union siblings already carry, at the one branch that reasoned from positions alone
  if (readRunsDeferredWithin(usagePath, owner.node)) return null;
  // the evaluation-order half of the same gate: this lane ranks writes by span alone, and a write in
  // a slot that runs ahead of the use's own sits PAST it by span
  if (anyWriteOutrunsUse(binding.constantViolations.map(violationNode), usagePath)) return null;
  // ... and the MIRROR of it, which this lane needs because it ranks by position alone: a use in a
  // slot its container evaluates early - a class key or decorator, a case test - runs BEFORE the
  // writes the source places above it, so the textually-last of them is not what the read observes.
  // the whole lane declines: pure substitutes only on proof, and a wrong reaching value there is not
  // a lost narrow but a different program
  if (reassignmentNodesBeyondDeclarator(binding).some(node => useOutrunsWrite(node, usagePath))) return null;
  const bindingName = bindingDeclaratorName(binding);
  // a write in an arm the build never takes does not run
  const writes = liveReassignmentNodes(binding, usagePath, adapter);
  const before = writes.filter(node => precedesOrUnordered(node, readNode));
  // no write ahead of the read leaves no value to hand on, and neither does a write standing in no frame of
  // the read's chain - another function, a method, a getter, a callback - which may run at any time
  // (`readRunsBeforeWrites` holds the same rule for a patched global); usage-global unions every write instead
  if (!before.length || writes.some(write => !varScopeOwnerHolding(write, usagePath))) return null;
  // what a write reads - a pattern's keys and source included - resolves in the declarator's scope, the
  // caller's value too; a block on one side rebinding one of those names refuses the write. a caller that
  // takes the scope the write stands in reads a single answering write there instead, shadows and all
  const declaration = bindingDeclaratorNode(binding);
  const writeCtx = ctx && { ...ctx, scope: aliasDeclScope(binding, ctx.scope) };
  // the GUARDED write set a POSITION still settles: the name is written on every path through a
  // complete branching construct standing unguarded before the read, so whichever path ran is what
  // the read observes. this channel hands ONE node on, so the writes must also AGREE on the value -
  // a consumer that binds a polyfill into it would otherwise bind some other path's. a write OUTSIDE
  // the construct and before the read would overwrite it and refuses the whole set; one BEFORE the
  // construct is superseded by it, and one after the read cannot reach it
  // a read in a closure observes a write landing after its definition too, once re-invoked: pure takes
  // the construct there only where none does, as the closure lane below takes its one write - and only
  // where no function declaration holding the read may run before the construct (`valueObservedBefore`)
  const settled = settlingConstructBefore({ before, usagePath, name: bindingName, readNode });
  const closureRead = settled && settled.owner.node !== owner.node;
  if (settled && (!closureRead || ((!requireSingleObservation || writes.every(node => precedesOrUnordered(node, readNode)))
    && !(valueObservedBefore({ declaration, before, node: settled.construct }) && hoistedFunctionRunsBefore({
      closure: closureCreatedBy(owner, settled.owner).node,
      holder: settled.owner.node,
      node: settled.construct,
      readNode,
      usagePath,
      adapter,
    }))))) {
    const { construct } = settled;
    // ... the binding's own declarator included where it stands in the construct (`if (c) var K = 'of';
    // else var K = 'from'` declares in one arm and redeclares in the other) and its arm can run
    const declared = declaration?.init && nodeRangeContains(construct, declaration)
      && !writeNeverRuns({ write: declaration, usagePath, adapter }) ? [declaration] : [];
    const settledWrites = [...declared, ...before.filter(node => nodeRangeContains(construct, node))];
    const values = settledWrites.map(settledWriteValue);
    const [first] = values;
    if (first && values.every(value => writeValuesAgree(value, first))
      && settledWrites.every(node => !writeReadsBlockShadow(settled.owner.node, node, declaration))) return first;
  }
  // Multiple writes need comparable positions. A generated write without one cannot win
  // a textual ordering proof over a later user write merely by appearing first in the list.
  if (before.length > 1 && before.some(node => typeof node.start !== 'number')) return null;
  // SAME-SCOPE: every before-use write is a plain `name = <expr>` in the read's own var-scope. the
  // textually-last one overwrites every earlier write - it is the reaching definition only if it ALWAYS
  // runs (unconditional: no guard the build leaves open); a conditional last write leaves the value ambiguous.
  // a write above it may run after it all the same (a class field value above the class key holding it):
  // then the one running last (`lastRunningWrite`) is that definition, on the same terms
  if (before.every(node => reassignmentRhsForBinding(node, owner.node, bindingName, writeCtx) !== null
      && collectVarGuardsToDeclarator(owner.node, node) !== null)) {
    const textLast = before.reduce((a, b) => b.start > a.start ? b : a);
    const last = !undecidedVarGuards(owner, textLast, adapter).length && lastRunningWrite({ writes: before, later: textLast, usagePath });
    if (!last || (last !== textLast && undecidedVarGuards(owner, last, adapter).length)) return null;
    if (requireSingleObservation && writeSitsInGuardTest(owner.node, last)) return null;
    const writeScope = writeScopes && writeScopeAt(usagePath, last);
    const rhs = reassignmentRhsForBinding(last, owner.node, bindingName, writeScope ? { ...ctx, scope: writeScope } : writeCtx);
    if (rhs?.callSite) return handOnCallSite(rhs.callSite, callSites);
    if (!rhs || (!writeScope && writeReadsBlockShadow(owner.node, last, declaration))) return null;
    if (writeScope) writeScopes.push(writeScope);
    return rhs;
  }
  // CLOSURE: the use sits in a nested closure, so the before-writes live in an enclosing scope. the
  // declarator-init (and earlier writes) are dead once an UNCONDITIONAL write completes before the
  // closure is even defined - the closure cannot observe them (`let K='of'; K='from'; ()=>Array[K]`).
  // the reaching value is the last such dominating write to run. a non-dominating set (conditional /
  // closure-defined-before-write) yields none -> null, keeping the still-live init (over-inject-safe).
  // a non-plain write -> null
  // a re-invoked closure observes a write that lands AFTER its definition between calls (`() => Array[K]`
  // with a later `K = 'of'`), so a single dominating value is not the UNIQUELY observed one. the pure
  // consumer (requireSingleObservation) must bail when any write lies textually after the captured read -
  // substituting one value would silently miscompile the other invocations. global stays over-inject-safe
  if (requireSingleObservation && writes.some(node => !precedesOrUnordered(node, readNode))) return null;
  const dominating = before.filter(node => nodeDominatesUsage({
    node, usagePath, owner, climb: true, usageNode, adapter, replaces: valueObservedBefore({ declaration, before, node }),
  }) === true);
  if (!dominating.length) return null;
  const last = lastDominatingWrite({ dominating, before, usagePath, requireSingleObservation });
  if (!last) return null;
  // the write is read in the owner holding it, not the closure's - and a block around the write or the
  // declaration alone that rebinds a name its value reads refuses it, as in the same-scope lane
  const writeOwner = varScopeOwnerHolding(last, usagePath);
  if (!writeOwner) return null;
  // a re-declaration the dominance proof put on every path - a `var` in the arm a decided test always
  // takes - installs its init as a plain write does, wherever its block stands
  const writeScope = writeScopes && writeScopeAt(usagePath, last);
  const rhs = last.type === 'VariableDeclarator' && last.id?.type === 'Identifier' ? last.init && installedWriteValue(last.init)
    : reassignmentRhsForBinding(last, writeOwner.node, bindingName, writeScope ? { ...ctx, scope: writeScope } : writeCtx);
  if (rhs?.callSite) return handOnCallSite(rhs.callSite, callSites);
  if (!rhs || (!writeScope && writeReadsBlockShadow(writeOwner.node, last, declaration))) return null;
  if (writeScope) writeScopes.push(writeScope);
  return rhs;
}

// the write of `dominating` - each completing on every path before the reading closure is created - whose
// value the read observes: the one running last, the textually last one but for a write above it that runs
// after it all the same (`lastRunningWrite`: a class field value above the class key holding it). with
// `requireSingleObservation` it runs last of every write in `before` too, each preceding the textually last
// dominating one in source order: a later non-dominating write (a for-of head) may replace its value.
// without it the dominating writes alone are asked, the textually last kept where the order cannot be told
function lastDominatingWrite({ dominating, before, usagePath, requireSingleObservation }) {
  const textLast = dominating.reduce((a, b) => b.start > a.start ? b : a);
  if (!requireSingleObservation) {
    return (dominating.length > 1 && lastRunningWrite({ writes: dominating, later: textLast, usagePath })) || textLast;
  }
  if (before.some(node => node !== textLast && !provablyPrecedes(node, textLast))) return null;
  const last = lastRunningWrite({ writes: before, later: textLast, usagePath });
  return last && dominating.includes(last) ? last : null;
}

// the call-valued pattern site a reaching lane settled on: the caller's sink takes it (its call canon
// pairs it) and the lane answers no node - a caller without a sink reads it as flow-dependent
function handOnCallSite(callSite, callSites) {
  callSites?.push(callSite);
  return null;
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
// enumeration + completeness: `complete` is TRUE only when EVERY reachable write was read in
// full - it yielded at least one value node and paired nothing past a spread. a write shape the
// pairing cannot decompose, or one whose slot the runtime may fill from a spread the pairing
// cannot enumerate, makes the value set open, and MIGHT-gated consumers must stay conservative
// (e.g. keep the typeless instance dispatch). `callSites` lists the reachable pattern writes whose
// value is a CALL, paired by no helper here: a detect consumer pairs each through the call canon.
// a write in an arm the build never takes installs nothing (`writeNeverRuns`), and neither does one a
// later write overwrites before the read (`supersededWrites`); the mutation census still counts both
// (`countDeadWrites`): the decisions read the census, so it cannot read them. `everyWrite` counts each write
// wherever it stands against the read too - the census answering once for every read of a binding
export function reassignmentValueEnumeration({
  binding, usagePath, name = null, ctx = null, usageNode = null, countDeadWrites = false, everyWrite = false,
}) {
  if (!binding?.constantViolations?.length) return { nodes: [], complete: true, callSites: [] };
  if (!usagePath || (!countDeadWrites && writesPastCeiling(binding.constantViolations))) {
    return { nodes: [], complete: false, callSites: [] };
  }
  const owner = findNearestVarScopeOwner(usagePath);
  if (!owner) return { nodes: [], complete: false, callSites: [] };
  return reassignmentValueEnumerationCore({ binding, usagePath, owner, name, ctx, usageNode, countDeadWrites, everyWrite });
}

// ... the value nodes alone, for a consumer that needs no completeness verdict
export function reassignmentValueNodes({
  binding, usagePath, name = null, ctx = null, usageNode = null, countDeadWrites = false, everyWrite = false,
}) {
  return reassignmentValueEnumeration({ binding, usagePath, name, ctx, usageNode, countDeadWrites, everyWrite }).nodes;
}

// a BRANCHING value (`c ? A : B`, `A || B`, a written or a paired one) installs one of its ARM
// values - the ONE flattener of the possible-value union: every arm joins the enumeration (a
// wider value set is the safe direction for every consumer of the union), each read through the
// write-value canon (`installedWriteValue` - its sequence tail, its chain-assignment tail) the way
// the direct RHS readers read theirs, and nested branching unfolds to a fixpoint. no step budget:
// the walk descends the expression once, so it is bounded by the expression itself, and a budget
// would truncate the set silently - the one way a union can lie. a logical
// assignment yields either operand as well. `&&` normally yields its LEFT
// too (a falsy left is the value, and an empty string dispatches instance methods); `keepAndWhole`
// leaves an `&&` unsplit for consumers that hand a lone candidate to the receiver resolver, which
// applies the receiver rule (a falsy left carries no receiver, the RIGHT is the one to read), and
// `andRightOnly` takes an `&&` (`&&=`) by its right alone for consumers after the SLOTS a value may hold
// - a write target, an alias's path: where the left is the value it is falsy, and holds none. a `ctx`
// marked `liveArmsOnly` - a reader of what the build decides - takes a selection the build decides as
// the operand it yields, a test's own answer being no value; the mutation census marks none: the
// decisions read it
export function flattenBranchingValueNodes(nodes, { keepAndWhole = false, andRightOnly = false, ctx = null } = {}) {
  const out = [];
  // a stack fed in reverse hands the arms out in SOURCE order - the order a consumer that keeps
  // the first of equal candidates, or that reports them, can rely on
  const work = nodes.toReversed();
  while (work.length) {
    // the write-value peel reads through transparent wrappers (parens - a node the oxc leg keeps -
    // TS assertions, chains), sequence tails and chain assignments in any nesting
    const tail = installedWriteValue(work.pop());
    if (!tail) continue;
    // a logical assignment (`x ||= V`) yields the kept left or the installed right - both arms
    const slots = keepAndWhole && tail.operator === '&&' ? null
      : andRightOnly && (tail.operator === '&&' || tail.operator === '&&=') ? ['right']
        : tail.type === 'AssignmentExpression' && LOGICAL_ASSIGN_OPS.has(tail.operator) ? ['left', 'right']
          : getFallbackBranchSlots(tail);
    const decision = slots && ctx?.liveArmsOnly && tail.type !== 'AssignmentExpression' && ctx.adapter?.decidedSelection?.(tail, ctx);
    if (decision) {
      if (typeof decision.fold === 'string') work.push(tail[decision.fold]);
    } else if (slots) work.push(...slots.map(slot => tail[slot]).toReversed());
    else out.push(tail);
  }
  return out;
}

// the writes of `writes` the source places above `later` that run after it all the same: a class evaluates
// its keys and decorators ahead of every field value and static block above them (`useOutrunsWrite`, asked
// from `later`'s own path), and an instance field's value runs at construction (`sitsInDeferredField`).
// a `later` recorded as its target identifier (estree-toolkit's record of a parameter write) is placed
// through the assignment holding it; null where writes stand above a `later` the owner index cannot place:
// it may stand in such a slot
function writesRunningAfter({ writes, later, usagePath }) {
  const above = writes.filter(write => write !== later && provablyPrecedes(write, later));
  if (!above.length) return above;
  const owner = later.type === 'Identifier' ? varScopeOwnerHolding(later, usagePath) : null;
  const laterPath = enclosingOwnerWritePath(usagePath, (owner && enclosingValueFlowAssignment(later, owner.node)) || later);
  if (!laterPath) return null;
  return above.filter(write => {
    const holder = varScopeOwnerHolding(write, usagePath);
    return useOutrunsWrite(write, laterPath) || (!!holder && sitsInDeferredField(holder.node, write));
  });
}

// the write of `writes` running last among those up to `later`, the textually last one asked about: the
// writes above it that run after it all the same (`writesRunningAfter`, or the caller's `after`) hand the
// question on to the textually last of them, until none does. null where an order cannot be told
function lastRunningWrite({ writes, later, usagePath, after = writesRunningAfter({ writes, later, usagePath }) }) {
  let last = later;
  let running = after;
  while (running?.length) {
    last = running.reduce((a, b) => b.start > a.start ? b : a);
    running = writesRunningAfter({ writes, later: last, usagePath });
  }
  return running && last;
}

// the writes of a binding a read never observes: a later plain write in the same var scope always
// overwrites each one first - it stands on every path to the read (`nodeDominatesUsage`), for a read in a
// closure by completing before the closure is even defined (`let C = Iterator; C = Object; C = Map; () =>
// C.groupBy()` never reads `Object`), and the read runs after it - as does the later write after each
// earlier one: a class key runs ahead of a static field value above it, so that value, the write running
// last (`lastRunningWrite`), overwrites the key's write too. only in the scope declaring the binding: one
// merely writing it may run again while a closure an earlier run defined reads the value between the two writes
function supersededWrites({ writes, usagePath, owner, usageNode, adapter, bindingScopeNode }) {
  if (writes.length < 2) return null;
  const holders = new Map();
  // a plain write of the declaring scope landing on every path to the read, which runs after it
  function overwritesEarlier(node, holder) {
    return plainWriteOf(node, holder) && !useOutrunsWrite(node, usagePath)
      && collectVarGuardsToDeclarator(holder, bindingScopeNode) !== null
      && nodeDominatesUsage({ node, usagePath, owner, climb: true, usageNode, adapter, replaces: true }) === true;
  }
  // the textually last write of each such scope landing on every path to the read
  const lastByHolder = new Map();
  for (const node of writes) {
    const holder = varScopeOwnerHolding(node, usagePath)?.node;
    if (!holder) continue;
    holders.set(node, holder);
    const last = lastByHolder.get(holder);
    if ((!last || provablyPrecedes(last, node)) && overwritesEarlier(node, holder)) lastByHolder.set(holder, node);
  }
  const superseded = new Set();
  for (const [holder, textLast] of lastByHolder) {
    const after = writesRunningAfter({ writes, later: textLast, usagePath });
    if (!after) continue;
    // a write running after `textLast` that overwrites as well supersedes every write up to `textLast` itself
    const last = after.length ? lastRunningWrite({ writes, later: textLast, usagePath, after }) : textLast;
    const lastOverwrites = !!last && last !== textLast && holders.get(last) === holder && overwritesEarlier(last, holder);
    for (const node of writes) {
      if (holders.get(node) !== holder || node === last) continue;
      if (lastOverwrites ? node === textLast || provablyPrecedes(node, textLast)
        : provablyPrecedes(node, textLast) && !after.includes(node)) superseded.add(node);
    }
  }
  return superseded;
}

function reassignmentValueEnumerationCore({ binding, usagePath, owner, name, ctx, usageNode, countDeadWrites, everyWrite }) {
  // `name` is a pure OVERRIDE for callers that already know the alias; the accessor covers both
  // binding shapes on its own, so pattern-LHS pairing no longer depends on the caller passing it
  const bindingName = name ?? bindingDeclaratorName(binding);
  // `usageNode` is a multi-hop alias hop's read site: a transitive source's write AFTER that read
  // (`const a = src; src = X`) cannot reach the captured value, so it is not a reachable union value
  const readNode = usageNode ?? usagePath.node;
  const useInLoop = !everyWrite && nodeSitsInLoopRerunWithin(owner.node, readNode, usagePath);
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
  const closureReenters = !everyWrite && readRunsDeferredWithin(usagePath, binding.scope?.block ?? binding.scope?.path?.node);
  // what a write installs reads a selection the build decides as its live operand, unless the census asks
  const liveCtx = ctx && !countDeadWrites ? { ...ctx, liveArmsOnly: true } : ctx;
  const out = [];
  const callSites = [];
  let complete = true;
  // a binding a for-x HEAD declares takes its values from the iterated elements: that head is the
  // declaration's own value source, not a reassignment - so it is read here, ahead of the writes,
  // and an iterable the head cannot enumerate leaves the set open
  const own = bindingDeclaratorNode(binding);
  const ownHead = own ? enclosingForXStatement(own, violationSearchRoot) : null;
  if (ownHead) {
    const head = forXHeadValueNodes(ownHead, bindingName, ctx);
    if (!head.nodes.length) complete = false;
    out.push(...head.nodes);
  }
  const writes = reassignmentNodesBeyondDeclarator(binding);
  // a write a later one overwrites before the read installs nothing the read sees: the union drops it,
  // while the census keeps every write
  const superseded = countDeadWrites ? null : supersededWrites({
    writes, usagePath, owner, usageNode, adapter: ctx?.adapter, bindingScopeNode: violationSearchRoot,
  });
  for (const node of writes) {
    if (superseded?.has(node)) continue;
    // Exclude ordinary later writes before walking the read's branch ancestry for each
    // candidate. Loops, deferred reads and early-evaluated slots still need the full proof.
    if (!everyWrite && !useInLoop && !closureReenters && !writeOutrunsUse(node, usagePath)
      && provablyPrecedes(readNode, node)) continue;
    if (!countDeadWrites && writeNeverRuns({ write: recordedWrite(binding, node), usagePath, adapter: ctx?.adapter })) continue;
    // A late container slot or an opposite arm cannot reach this execution's read.
    // The proof retains writes carried by a loop back-edge or another invocation.
    if (!everyWrite && (useOutrunsWrite(node, usagePath) || writeIsInOppositeBranch(node, usagePath, readNode))
      && noReassignmentReachesUsage({
        reassignmentNodes: [node],
        usagePath,
        usageNode,
        bindingScopeNode: violationSearchRoot,
        bindingAnchor: bindingLoopAnchor(binding),
      })) continue;
    // a write's arms are asked of the var-scope owner that holds it, not of a closure the read sits in,
    // and a pattern pairs in the scope it stands in - the key and the source a block there rebinds. a
    // plain write's value is read where it stands by the caller, so only a pattern pays for the path
    const writeOwner = varScopeOwnerHolding(node, usagePath)?.node ?? owner.node;
    const writeCtx = ctx && isDestructurePattern(plainWriteOf(node, writeOwner)?.target)
      ? { ...liveCtx, scope: writeScopeAt(usagePath, node, ctx.scope) } : liveCtx;
    const site = reassignmentValueNodesAt(node, violationSearchRoot, bindingName, writeCtx, writeOwner);
    const values = flattenBranchingValueNodes(site.nodes, { ctx: writeCtx });
    // the set is open once a site could not be read, or read only a part of what the runtime may
    // pair there (a spread-shifted slot) - the union stays usable, its completeness does not
    if (!values.length || site.open) complete = false;
    out.push(...values);
    // a pattern site whose value is a CALL survived the reachability proofs above but pairs
    // nothing here: handed back whole for a consumer to pair through the call canon (`callSites`)
    callSites.push(...site.callSites ?? []);
  }
  return { nodes: out, complete, callSites };
}

// assignment operators that flow the RHS into the LHS binding as a POSSIBLE value: plain `=` plus
// the logical forms (`A ||= Map` makes Map reachable - whether that write fires is the conditional
// question above, not this one). compound arithmetic (`+=`) and updates produce derived values, not
// replacements, and stay out. every reader that follows a write to the value it stores asks this
// set: the reassignment walks here, the mutation census for what a slot ends up holding, and the
// alias follow over the shape a `?.`-lowering transpiler emits (`(_n ??= globalThis) == null ? ...`)
export const VALUE_FLOW_ASSIGN_OPS = new Set(['=', ...LOGICAL_ASSIGN_OPS]);

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
  if (resolveCallArgumentCoords(elements, i) || !spreadAtOrBefore(elements, i)) {
    const paired = resolveCallArgument(elements, i);
    return paired ? [paired] : [];
  }
  // a candidate that is ITSELF a union contributes each arm as its own possible value; the
  // candidates feed MIGHT-gated consumers and lone-candidate follows, which hand an `&&` to the
  // receiver resolver whole - the exact-pair path never flattens, and pure precision gates on
  // `patternSlotSpreadShifted` before reading
  return flattenBranchingValueNodes(
    elements.slice(elements.findIndex(e => e?.type === 'SpreadElement')).filter(e => e && e.type !== 'SpreadElement'),
    { keepAndWhole: true },
  );
}

// the POSITIONALLY-paired init element for an array-wrap pattern slot: array destructuring binds
// pattern element `index` to the init element at the SAME index, but positions are static only up
// to the first spread - a spread at or before the slot shifts every later runtime position, so
// pairing past it is unsound. `null` = no sound pairing (unbound name, spread-shifted or absent
// element) - callers bail rather than judge a foreign element. single source for the array-wrap
// positional pairing repeated across the alias / ctor / symbol / receiver resolvers
// ... an INLINE-array spread (`[...[a, b], c]`) is a longer literal whose items sit at static
// positions - the call-argument expansion reads them so, and any other spread still shifts the slot
export function pairedArrayWrapInitElement(initElements, index) {
  return index < 0 ? null : resolveCallArgument(initElements ?? [], index);
}

// the same expansion written INTO the literal: the rewriting flavor splices an inline-array spread
// in place before any route edits the literal by slot, so a positional answer and a positional edit
// name one element. A spread with an opaque nested spread keeps its original shape.
export function flattenInlineArraySpreads(elements) {
  if (!Array.isArray(elements)) return;
  for (let i = 0; i < elements.length; i++) {
    const item = elements[i];
    const spread = item?.type === 'SpreadElement' ? inlineArrayElements(item.argument) : null;
    if (!spread) continue;
    elements.splice(i, 1, ...spread);
    i -= 1;
  }
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
// same question of PATHS (`resolveBodyReturnValue`), the split every walk here lives with. a caller
// holding a scope passes `ctx`, and a getter read inside the body then counts as work the drop owes
export function pureReturnBodyValue(body, ctx = null) {
  const read = singleReturnBodyExpression(body);
  if (!read || mayHaveSideEffects(read, ctx)) return null;
  const statements = body?.type === 'BlockStatement' ? body.body ?? [] : [];
  return statements.every(stmt => stmt.type === 'ReturnStatement' || !mayHaveSideEffects(stmt.expression, ctx))
    ? read : null;
}

// the expression an object-literal property hands a reader, or null when none does: a data property
// gives its value, and a GETTER gives what its body returns. consuming callers require a pure
// body; a caller keeping the getter can read its return while preserving effects and locals.
// a setter-won key answers `undefined` and a
// method shorthand holds a function the reader would read THROUGH - neither names a value. babel
// spells accessors and method shorthands as `ObjectMethod`, ESTree as a `Property` carrying `kind` /
// `method`: both reach this one reading, or two walks answer differently about one source
export function objectPropertyReadValue(prop, { preservesBody = false } = {}) {
  const kind = prop?.type === 'ObjectMethod' ? prop.kind : prop?.method ? 'method' : prop?.kind;
  if (!prop || kind === 'set' || kind === 'method') return null;
  if (kind !== 'get') return prop.value ?? null;
  const body = prop.type === 'ObjectMethod' ? prop.body : prop.value?.body;
  if (preservesBody) {
    // this can expose the getter's object to another reader, which must see its original return.
    let readsThis = false;
    walkAstNodes({ root: body, visit(node) {
      if (node.type === 'ThisExpression') readsThis = true;
      return !readsThis;
    } });
    if (readsThis) return null;
  }
  return preservesBody ? singleReturnBodyExpression(body, { preservesBody }) : pureReturnBodyValue(body);
}

// the property of an object LEVEL a key pairs with, or null when nothing pairs: no match ahead of a
// spread (it could override the key), a key standing AFTER the match that `nameLater` cannot name
// (last wins, so it could BE the slot at runtime), or a body whose returned value cannot be proven.
// `nameLater` defaults to the spelled name. `readOptions` goes to objectPropertyReadValue;
// a caller keeping the original read may allow its getter body's effects via `preservesBody`.
export function objectLevelPairedProperty(objectNode, key, nameLater = spelledSlotName, readOptions = {}) {
  if (objectNode?.type !== 'ObjectExpression') return null;
  const match = findObjectKeyBeforeSpread(objectNode.properties, prop => spelledSlotName(prop) === key);
  const read = objectPropertyReadValue(match, readOptions);
  if (!read) return null;
  if (objectNode.properties.slice(objectNode.properties.indexOf(match) + 1)
    .some(prop => nameLater(prop) === null)) return null;
  return { match, read };
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
// (its `resolveKey`, when the detect layer injected one, reads computed keys); `callSites` is the
// reaching lane's sink for a pattern write over a CALL, which the caller pairs
export function reachingContainerValueNode(binding, hop, callSites = null) {
  const { adapter, path } = hop.ctx;
  const { method } = adapter;
  if (method !== 'usage-global' && method !== 'usage-pure') return null;
  const reaching = reachingReassignmentValueNode({
    binding, usagePath: path, ctx: hop.ctx, usageNode: hop.readNode, requireSingleObservation: method === 'usage-pure', callSites,
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

// Check a dereferenced alias's member path for writes in usage-pure. Binding-flow analysis
// alone does not track its contents. Use the declaration owner when known, otherwise the
// name-wide union; anchor slot timing at the final read, even if the alias was captured earlier.
export function aliasSlotWritten(aliasNode, key, adapter, { scope = null, path = null, ownerNode = null } = {}) {
  if (aliasNode?.type !== 'Identifier' || adapter?.method !== 'usage-pure' || key === null || key === undefined) return false;
  const binding = scope ? adapter.getBinding?.({ scope, name: aliasNode.name, path, read: aliasNode }) : null;
  // the record keys slots by their STRING spelling, and a numeric key names one like any other
  return !!adapter.isWrittenContainerSlot?.(aliasNode.name, Array.isArray(key) ? key.map(String) : [String(key)],
    ownerNode ?? binding?.path?.node ?? binding?.node ?? null, path, path?.node);
}

// the ONE const-alias follow: an Identifier through its binding's init at each hop, peeling parens /
// chain / TS / chain-assignment between hops. takes the hop standing on the identifier and returns
// the hop standing on the terminal node where the chain stops (non-Identifier, unbound name,
// reassigned binding, or no init). `adapter.hasBinding({ scope, name, path })` gates on user-declared
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
  while (cur?.type === 'Identifier' && adapter.hasBinding({
    scope,
    name: cur.name,
    path,
    read: cur,
  }) && !cycleGuardHas(visited, cur.name)) {
    visited.add(cur.name);
    const binding = adapter.getBinding({ scope, name: cur.name, path, read: cur });
    // method-aware reassignment bail: usage-global keeps following the const-init chain when the
    // reassignment does not dominate the use, usage-pure when no write reaches the read;
    // narrowing keeps the flat bail
    if (!binding) break;
    // Reaching writes can pair a pattern back to this alias too; keep the same cycle guard.
    const hopAt = { ...hop, node: cur, readNode, seen: visited, ctx: { ...hop.ctx, scope, seen: visited } };
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
    // ... and the initializer has to have RUN by the read: a hoisted `var` declared below the use
    // holds `undefined` there, and the source throws where the followed literal would bind. the same
    // rule the static walk applies per hop - usage-pure resolves on proof alone (it rewrites the read
    // receiver-less), global / entry keep the call site and stay sound on either answer
    if (adapter.method === 'usage-pure' && path && !initializerReachesRead({
      adapter, binding, declaratorNode: binding.path?.node ?? binding.node, usagePath: path, usageNode: readNode,
    })) break;
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
  // every head normalization of one slot pairing follows its rhs (`patternSlotValues`,
  // `patternSlotSpreadShifted`), and a binding a pattern takes off the one before it re-pairs the
  // link below at each of them: kept per question under the very context handed in - its guard as
  // it stands included - a chain of such destructures follows each link once instead of twice per
  // level. the follow rewrites nothing, so it is one question of its own where no scope is open
  return withCanonQuestion(() => followedConstLiteral(node, ctx));
}

function followedConstLiteral(node, ctx) {
  const answers = canonAnswerTable(followConstLiteralAlias, [ctx, ctx.seen?.size ?? 0]);
  if (answers?.has(node)) return answers.get(node);
  const followed = followConstIdentifierInit({ node, readNode: node, seen: ctx.seen, ctx });
  const value = followed.node;
  const answer = value?.type === 'ArrayExpression' || value?.type === 'ObjectExpression' ? value : node;
  answers?.set(node, answer);
  return answer;
}

// the canonical ARRAY-slot read: `container[key]` for a literal container, with the same guards
// both destructure sides apply - a spread makes every position PAST it untrustworthy (a slot
// strictly before it still pairs exactly, the positional pairing's own rule), a hole / OOB reads
// nothing. `key` folds through the canonical index, so '0' and 0 name the same slot
export function arrayLiteralSlotValue(node, key) {
  if (node?.type !== 'ArrayExpression') return null;
  const index = key === null || key === undefined ? null : canonicalArrayIndex(key);
  // the positional pairing's own rule: an inline-array spread flattens, any other spread at or
  // before the slot shifts it and the read declines
  return index === null ? null : pairedArrayWrapInitElement(node.elements, index);
}

// the member a destructure slot pairs with when its source is a RECEIVER rather than a literal
// container: `const { Map } = globalThis` reads `globalThis.Map`, a value the source never spells.
// it inherits the receiver's own span so a downstream reassignment-dominance check anchors at the
// capture read (where the receiver was destructured), not at the host use - a positionless synthetic
// node made a reassign-after-capture receiver look dominated and wrongly bailed. that borrowed span
// is also why no POSITION names such a read: `patternReceiverSlotNodes` answers with the slot instead.
// a `keyNode` reads the slot under the key the source spells, computed, for a key the caller's canon cannot fold
export function receiverSlotRead(receiver, key, keyNode = null) {
  return {
    type: 'MemberExpression',
    object: receiver,
    property: keyNode ?? { type: 'Identifier', name: key },
    computed: !!keyNode,
    start: receiver.start,
    end: receiver.end,
  };
}

// does `node` borrow its receiver's span - a read synthesized off it (`receiverSlotRead`), never a node of the
// tree? a member the source spells always spans past its object
export function borrowsReceiverSpan(node) {
  const key = nodePositionKey(node);
  return key !== null && key === nodePositionKey(node.object);
}

// the values a REST copies off its source, where the source spells them: an object rest every own
// member the pattern does not claim, an array rest every element from its position on; any other
// source hands over its contents whole
export function restCopiedValues(rhs, pattern, from, ctx = null) {
  if (pattern.type === 'ArrayPattern') {
    return rhs.type === 'ArrayExpression'
      ? rhs.elements.slice(from).filter(Boolean).map(element => element.type === 'SpreadElement' ? element.argument : element)
      : [rhs];
  }
  if (rhs.type !== 'ObjectExpression') return [rhs];
  const claimed = new Set();
  for (const prop of pattern.properties) {
    if (prop.type === 'RestElement') continue;
    const key = patternPropKey(prop, ctx, pattern);
    // a claimed key this canon cannot read leaves unknown which members stay
    if (key === null) return [rhs];
    claimed.add(key);
  }
  return rhs.properties.flatMap(prop => prop.type === 'SpreadElement' ? [prop.argument]
    : claimed.has(patternPropKey(prop, ctx, pattern)) ? [] : [prop.value ?? prop]);
}

// the MEMBERS a destructuring pattern stores into, each with the value it stores: the paired slot of a
// container the source spells, the read of that slot off any other source - the value a census files
// under the member's own path. a key this canon cannot fold keeps its own node in that read, so a consumer
// folds it with the canon it holds once its bindings are known (`{ [k]: o.y }` stores `rhs[k]`, as `o.y = rhs[k]`)
export function patternMemberTargetPairs(pattern, rhs, ctx = null, out = []) {
  if (pattern?.type === 'AssignmentPattern') patternMemberTargetPairs(pattern.left, pattern.right, ctx, out);
  const target = patternSlotTarget(pattern);
  if (isMemberAccessNode(target)) {
    if (rhs) out.push([target, rhs]);
  } else if (target?.type === 'ArrayPattern') {
    target.elements.forEach((element, index) => {
      if (!element || element.type === 'RestElement') return;
      const paired = rhs?.type === 'ArrayExpression' ? pairedArrayWrapInitElement(rhs.elements, index) : null;
      patternMemberTargetPairs(element, paired ?? (rhs && receiverSlotRead(rhs, String(index))), ctx, out);
    });
  } else if (target?.type === 'ObjectPattern') {
    for (const prop of target.properties) {
      if (prop.type !== 'Property' && prop.type !== 'ObjectProperty') continue;
      const key = patternPropKey(prop, ctx, target);
      const paired = key !== null && rhs?.type === 'ObjectExpression'
        ? objectPropertyReadValue(findObjectKeyBeforeSpread(rhs.properties, rp => patternPropKey(rp, ctx, target) === key), ctx ?? {})
        : null;
      patternMemberTargetPairs(prop.value, paired ?? (rhs && receiverSlotRead(rhs, key, key === null ? prop.key : null)), ctx, out);
    }
  }
  return out;
}

// the containers a source the pairer cannot index stands for (`pairedSources`, asked with the
// level's own ctx): none for a missing source - the pattern's defaults are then all it pairs - nor for
// a container or a receiver, which the pairer reads itself
function pairerSources(rhs, ctx) {
  return rhs && !CENSUS_CONTAINER_TYPES.has(rhs.type) && !isReceiverShapedNode(rhs) ? ctx?.pairedSources?.(rhs, ctx) : null;
}

// The read a pattern slot takes from a receiver, or an invocation when its caller reads through.
// Nested levels read through only on request; both pairers take that same source spelling.
function patternSourceSlotRead(rhs, key, ctx, nested = false) {
  return key !== null && (isReceiverShapedNode(rhs) || (ctx?.readsThrough && invocationNode(rhs)))
    && (!nested || ctx?.readsThrough) ? receiverSlotRead(rhs, key) : null;
}

// the pattern SLOTS the binding `name` is spelled at whose value is a receiver read - the pairing of
// `patternSlotValues` walked for its node rather than its value. a census that anchors on positions
// has nothing else to name here: the read itself is synthesized over the receiver's span, and the
// receiver stands in a tracked position of its own. a level paired with a real container value is not
// such a read - it descends against that value, whose own node is where it stands
// `includeNestedReceivers` also reports a receiver read whose value feeds a nested pattern: a
// guarded constructor yielded there must carry the static slots that pattern subsequently reads.
// `includeBindings` includes every named slot, so an opaque receiver's static reads are counted
// even when no particular local binding is queried. `slotReceivers` maps each reported slot to ALL
// receivers its level reads it off: supplied candidates and defaults may share one property node.
// `keepsSelectedReceiver` reports reads from a selection retained by a value-consuming host.
// `restSources` collects the source values of object-rest levels during the same pairing walk, and
// `restValues` each rest level of either kind with the source it copies from (`restCopiedValues`).
// `opaqueKeys` collects each COMPUTED key the pairing cannot name with the value its level reads the
// slot off: no slot node stands for such a read, which selects whatever the key evaluates to.
// `selectionLevels` collects each level whose value SELECTS (the arms `flattenBranchingValueNodes`
// splits) with its pattern, for a caller reading the level one arm per run: no slot is read off the
// selection here
// `positionalReads` collects slots reached through a nonliteral array source. Their retained
// static reads need the constructor namespace, just like a slot under a literal wrapper.
// `rawReads` also collects reads under a literal wrapper: static synthesis no longer serves them.
// It collects each slot reached through a STORE below the source - or through one at all where
// the source itself stands below the host's (`belowSource`: a default, a for-of element): pure's mirror
// steps through no such store, which would rewrite a container the store hands to another reader, and
// the routes it falls back to name a static through one only on some hosts and levels. a slot such a
// route does name still reads raw here - the whole entry is the price of not mirroring those routes
export function patternReceiverSlotNodes(pattern, rhs, name, ctx) {
  const rawReads = ctx?.rawReads;
  if (!rawReads) return pairPatternReceiverSlots(pattern, rhs, name, ctx);
  const { belowSource = false, belowStore = false } = ctx;
  const { tail } = peelNestedSequenceExpressions(rhs);
  const stored = belowStore || (belowSource && tail?.type === 'AssignmentExpression' && tail.operator === '=');
  ctx.belowSource = true;
  ctx.belowStore = stored;
  const slots = pairPatternReceiverSlots(pattern, rhs, name, ctx);
  ctx.belowSource = belowSource;
  ctx.belowStore = belowStore;
  if (stored) for (const slot of slots) rawReads.add(slot);
  return slots;
}

// one level of that pairing; each level below re-enters through `patternReceiverSlotNodes`
// eslint-disable-next-line max-statements -- pair source slots and independent defaults without reordering receiver records
function pairPatternReceiverSlots(pattern, rhs, name, ctx) {
  const out = [];
  rhs = followConstLiteralAlias(installedWriteValue(rhs), ctx);
  // the same sources and reads `patternSlotValues` takes under `pairedSources` / `readsThrough`
  const sources = pairerSources(rhs, ctx);
  if (sources) return sources.flatMap(({ source }) => patternReceiverSlotNodes(pattern, source, name, ctx));
  if (ctx?.selectionLevels && (getFallbackBranchSlots(rhs) || LOGICAL_ASSIGN_OPS.has(rhs?.operator))) {
    ctx.selectionLevels.push({ pattern, rhs });
  }
  // an array WRAPPER holds the receiver in a slot of its own (`const [{ Map }] = [globalThis]`) - it
  // reads no member itself, so it only descends, against the same candidates the value pairing takes
  if (pattern?.type === 'ArrayPattern') {
    for (let at = 0; at < pattern.elements.length; at++) {
      const element = pattern.elements[at];
      if (element?.type === 'RestElement') {
        if (rhs) ctx?.restValues?.push({ pattern, rhs, from: at });
        continue;
      }
      const slot = patternSlotTarget(element);
      if (!isDestructurePattern(slot)) continue;
      const candidates = rhs?.type === 'ArrayExpression' ? arrayWrapSlotValueCandidates(rhs.elements, at)
        : [patternSourceSlotRead(rhs, String(at), ctx, true)].filter(Boolean);
      for (const candidate of candidates) {
        const slots = patternReceiverSlotNodes(slot, candidate, name, ctx);
        out.push(...slots);
        if (rhs?.type !== 'ArrayExpression') for (const read of slots) ctx?.positionalReads?.add(read);
        else for (const read of slots) ctx?.rawReads?.add(read);
      }
      if (element.type === 'AssignmentPattern') out.push(...patternReceiverSlotNodes(slot, element.right, name, ctx));
    }
    return out;
  }
  if (pattern?.type !== 'ObjectPattern') return out;
  for (const prop of pattern.properties) {
    if (prop.type === 'RestElement' && rhs) {
      ctx?.restSources?.push(rhs);
      ctx?.restValues?.push({ pattern, rhs, from: 0 });
    }
    if (prop.type !== 'Property' && prop.type !== 'ObjectProperty') continue;
    const slot = patternSlotTarget(prop.value);
    if (slot?.type === 'Identifier' && slot.name !== name && !ctx?.includeBindings) continue;
    const key = patternPropKey(prop, ctx, pattern);
    if (key === null) {
      if (prop.computed && rhs) ctx?.opaqueKeys?.push({ receiver: rhs, key: prop.key });
      // An unknown source key does not hide the default's own receiver. It still
      // supplies the nested reads whenever the runtime slot is undefined.
      if (isDestructurePattern(slot) && prop.value.type === 'AssignmentPattern') {
        out.push(...patternReceiverSlotNodes(slot, prop.value.right, name, ctx));
      }
      continue;
    }
    const pairedProperty = rhs?.type === 'ObjectExpression'
      ? findObjectKeyBeforeSpread(rhs.properties, rp => patternPropKey(rp, ctx, pattern) === key) : null;
    const paired = rhs?.type === 'ObjectExpression'
      ? objectPropertyReadValue(pairedProperty, ctx ?? {})
      : arrayLiteralSlotValue(rhs, key);
    // ... the same sources `patternSlotValues` pairs against: the container slot, the receiver read
    // and the slot's own default. the first two are exclusive by construction - a paired value means
    // an object / array literal rhs, which is never receiver-shaped
    const received = patternSourceSlotRead(rhs, key, ctx)
      ?? (ctx?.keepsSelectedReceiver && getFallbackBranchSlots(rhs) ? receiverSlotRead(rhs, key) : null);
    if (isDestructurePattern(slot)) {
      if (received && ctx?.includeNestedReceivers) {
        recordPatternReceiverSlot(out, prop, rhs, ctx);
      }
      const source = paired ?? received;
      if (source) {
        const slots = patternReceiverSlotNodes(slot, source, name, ctx);
        out.push(...slots);
        if (paired && pairedProperty?.kind !== 'get') for (const read of slots) ctx?.rawReads?.add(read);
      }
      if (prop.value.type === 'AssignmentPattern') {
        out.push(...patternReceiverSlotNodes(slot, prop.value.right, name, ctx));
      }
      continue;
    }
    if (received && slot?.type === 'Identifier' && (slot.name === name || ctx?.includeBindings)) {
      recordPatternReceiverSlot(out, prop, rhs, ctx);
    }
  }
  return out;
}

// A slot can be visited against several sources. Keep each receiver beside the one source node.
function recordPatternReceiverSlot(out, prop, rhs, ctx) {
  out.push(prop);
  if (ctx?.slotReceivers) pushMultimap(ctx.slotReceivers, prop, rhs);
}

// the function's OWN return statements: a shallow walk that does not descend into nested
// functions (their returns belong to them). babel spells a METHOD as a function node of its own
// (`ObjectMethod` / `ClassMethod` / `ClassPrivateMethod`) where ESTree nests a `FunctionExpression`
// under `value`, so the canon set is what has to stop the descent: a hand-rolled list missing those
// three reads a method's returns as its HOST's and attributes the returned values to the wrong call
export function collectOwnReturns(body) {
  const returns = [];
  const stack = [body];
  while (stack.length) {
    const node = stack.pop();
    if (!node || typeof node !== 'object') continue;
    if (Array.isArray(node)) {
      stack.push(...node);
      continue;
    }
    if (typeof node.type !== 'string') continue;
    if (FUNCTION_LIKE_NODE_TYPES.has(node.type)) continue;
    if (node.type === 'ReturnStatement') {
      returns.push(node);
      continue;
    }
    // eslint-disable-next-line no-restricted-syntax -- perf: AST hot path, plain objects
    for (const key in node) {
      const value = node[key];
      if (value && typeof value === 'object') stack.push(value);
    }
  }
  return returns;
}

// any `arguments` spelling under this function, its nested functions included: a nested one binds its
// OWN, so the answer is a superset - and the superset direction here is the escape that was there
// An optional sink retains that same conservative set for read-position queries.
export function referencesArgumentsObject(callee, into = null) {
  const answers = into ? null : canonAnswerTable(referencesArgumentsObject, []);
  if (answers?.has(callee)) return answers.get(callee);
  let found = false;
  const work = [callee.body, ...callee.params ?? []];
  while (work.length) {
    const current = work.pop();
    if (typeof current?.type !== 'string') continue;
    if (current.type === 'Identifier' && current.name === 'arguments') {
      if (!into) {
        answers?.set(callee, true);
        return true;
      }
      into.push(current);
      found = true;
    }
    walkAstChildren(current, child => work.push(child));
  }
  answers?.set(callee, found);
  return found;
}

// One static receiver supplied by every known invocation. Missing, shifted, opaque and mixed
// arguments prove no identity; the caller owns scope resolution and completeness of the sites.
export function parameterStaticSource(sites, paramIndex, resolveSource) {
  if (!sites?.length) return null;
  let source = null;
  for (const site of sites) {
    if (!site.pairing || site.pairing.argsUnknown) return null;
    const argument = unwrapRuntimeExpr(resolveCallArgument(site.pairing.args ?? [], site.argIndex ?? paramIndex));
    if (!argument) return null;
    const name = resolveSource(argument, site);
    if (!name || source && source !== name) return null;
    source = name;
  }
  return source;
}

// the slots of a wrapper literal, each `[key, value]`: a property's readable key - null for one no canon
// folds, and for a spread - or an element's index, up to the first element spread, which shifts the rest.
// Descriptor readers project object property nodes through the same key pairing.
export function wrapperLiteralEntries(literal, { propertyNodes = false } = {}) {
  if (literal?.type === 'ArrayExpression') {
    const spread = literal.elements.findIndex(element => element?.type === 'SpreadElement');
    return (spread === -1 ? literal.elements : literal.elements.slice(0, spread)).map((element, index) => [String(index), element]);
  }
  if (literal?.type !== 'ObjectExpression') return [];
  return literal.properties.map(prop => [
    prop.type === 'SpreadElement' ? null : foldedPropertyKeyName(prop),
    propertyNodes ? prop : prop.value,
  ]);
}

// ... and those that hold a container by NAME: `[keyPath, name, node]` - a nested literal's slots under the
// path that reaches it - with the identifier the slot spells
export function literalIdentifierSlots(literal, prefix = []) {
  const slots = [];
  for (const [key, raw] of wrapperLiteralEntries(literal)) {
    const value = raw && unwrapRuntimeExpr(raw);
    if (key === null || !value) continue;
    if (value.type === 'Identifier') slots.push([[...prefix, key], value.name, value]);
    else slots.push(...literalIdentifierSlots(value, [...prefix, key]));
  }
  return slots;
}

// Increment every queried name in `counts` in one walk, conservatively including nested scopes.
// Ignore noncomputed property names; a second value reference is distinct from a container slot.
function identifierOccurrences(node, counts) {
  if (!node || typeof node !== 'object' || typeof node.type !== 'string') return;
  if (node.type === 'Identifier') {
    if (counts.has(node.name)) counts.set(node.name, counts.get(node.name) + 1);
    return;
  }
  walkAstChildren(node, (child, slot) => {
    // a non-computed KEY spells no reference: `{ value }` names its slot and reads the parameter
    // once, and a member's own property is the same name in another role
    if (!node.computed && (slot === 'key' || slot === 'property')) return;
    identifierOccurrences(child, counts);
  });
}

// the INVOCATION whose result a value position holds: a call - optional or not, the ESTree chain
// marker around an optional one peeled like a paren - a tagged template or a `new`, read through
// `await` (a non-thenable result is what the await hands on). one spelling set for the walks that
// follow an invocation into what its callee yields and for the census that files the container a
// binding of it holds: a spelling a walk follows but the census skips reads a slot the file wrote.
// null for any other node
export function invocationNode(node) {
  let cur = unwrapTransparentSeq(node);
  while (cur?.type === 'AwaitExpression') cur = unwrapTransparentSeq(cur.argument);
  return cur?.type === 'CallExpression' || cur?.type === 'OptionalCallExpression' || cur?.type === 'NewExpression'
    || cur?.type === 'TaggedTemplateExpression' ? cur : null;
}

// the container a FUNCTION yields, with the slots its body fills from PARAMETERS: the body's single
// return (`singleReturnBodyExpression` - the body keeps running) where that is a literal whose
// identifier slots name parameters (`[keyPath, index, node]`), each holding the argument the call
// passed at that parameter's index. the call's value IS that literal, so a read through one of those slots lands on the argument
// - the receiver walks descend it that way, and the escape census lets the argument stay home on the
// same recognizer, so nothing is narrowed that cannot then be resolved. `confined` names the
// parameters spelled NOWHERE but in such a slot, whose argument therefore reaches nothing else through
// the call - per parameter, since a sibling read elsewhere (`log(s)`) lets ITS argument out and no
// other; the `confined` option asks it of every parameter at once. every other name the literal
// spells resolves where the callee is DECLARED, so a literal reading a body local answers nothing;
// so does a parameter the body rebinds, which holds another value by the return
export function calleeYieldedContainer(callee, { confined = false, unwrap = expr => expr } = {}) {
  const params = slotParams(callee);
  if (!params) return null;
  const literal = unwrap(singleReturnBodyExpression(callee.body, { preservesBody: true }));
  if (literal?.type !== 'ObjectExpression' && literal?.type !== 'ArrayExpression') return null;
  const index = slotParamIndex(callee, params);
  if (!index) return null;
  const slots = literalIdentifierSlots(literal).filter(([, name]) => index.has(name));
  const remaining = new Map(params.map(param => [param.name, 0]));
  identifierOccurrences(callee.body, remaining);
  for (const [, name] of slots) remaining.set(name, remaining.get(name) - 1);
  const confinedParams = new Set([...remaining].filter(([, count]) => count === 0).map(([name]) => index.get(name)));
  if (confined && confinedParams.size !== params.length) return null;
  return { literal, slots: slots.map(([keyPath, name, node]) => [keyPath, index.get(name), node]), confined: confinedParams };
}

// ... the same container read off an invocation spelled with its callee INLINE - directly, through a
// receiver invoker or as a tag - the one spelling a census without bindings can pair by itself; a
// callee reached by NAME is the inline canon's to resolve first (`callYieldedContainer`)
export function inlineCallYieldedContainer(node, unwrap = expr => expr) {
  const invocation = invocationNode(node);
  let callee = invocation && unwrap(callPairing(invocation)?.callee);
  while (callee?.type === 'SequenceExpression') callee = unwrap(callee.expressions.at(-1));
  return calleeYieldedContainer(callee, { confined: true, unwrap });
}

// ... and the container an INVOCATION yields once its callee is RESOLVED (`calleeOf`), for a census
// that reached the function by name once its walk was over: a parameter-filled literal, else a
// zero-parameter body's single return where that is a literal (a body reading a parameter yields
// nothing certain until its arguments are paired) - or where it INVOKES a function `calleeOf`
// resolves, the container that invocation yields in turn: the chain a reader's call arm follows, so
// a write through the binding lands on the literal the reader reaches. `call` is the invocation whose
// arguments the parameter slots hold - the LAST one on the chain, never an outer call past a
// zero-parameter callee, whose arguments nothing reads. null for no callee, an async / generator
// one, or one yielding no container
export function resolvedCallYieldedContainer(call, calleeOf, unwrap = expr => expr, seen = new Set()) {
  const callee = calleeOf(call);
  if (!FUNCTION_LIKE_NODE_TYPES.has(callee?.type) || callee.async || callee.generator || seen.has(callee)) return null;
  const yielded = calleeYieldedContainer(callee, { unwrap });
  if (yielded) return { ...yielded, call };
  if (dropLeadingThisParam(callee.params ?? []).length) return null;
  const literal = unwrap(singleReturnBodyExpression(callee.body, { preservesBody: true }));
  if (literal?.type === 'ObjectExpression' || literal?.type === 'ArrayExpression') return { literal, slots: [], call };
  const next = invocationNode(literal);
  return next ? resolvedCallYieldedContainer(next, calleeOf, unwrap, seen.add(callee)) : null;
}

// A synchronous reader returning one named property of a plain parameter. The body and
// parameter list contain no other work: writes, aliases, handouts and deferred reads need
// their own flow proof. This describes the read, not whether that property exposes a method.
export function calleeParameterMemberRead(callee) {
  const params = slotParams(callee);
  if (!params) return null;
  const { body } = callee;
  if (body?.type === 'BlockStatement'
    && body.body.some(stmt => stmt.type !== 'ReturnStatement' && !isDirectiveStatement(stmt))) return null;
  const member = unwrapRuntimeExpr(singleReturnBodyExpression(body));
  if (!isMemberAccessNode(member) || memberReadKeyName(member) === null) return null;
  const receiver = unwrapRuntimeExpr(member.object);
  const paramIndex = receiver?.type === 'Identifier' ? params.findLastIndex(param => param.name === receiver.name) : -1;
  return paramIndex < 0 ? null : { member, paramIndex };
}

// the identifier parameters a parameter-filled slot pairs against, or null for a function the
// pairing cannot read: an async one (unless an await settles it, `allowAsync`) or a generator one,
// none, or a parameter spelled as a pattern
function slotParams(callee, allowAsync = false) {
  if (!FUNCTION_LIKE_NODE_TYPES.has(callee?.type) || (callee.async && !allowAsync) || callee.generator) return null;
  const params = dropLeadingThisParam(callee.params ?? []);
  return params.length && params.every(param => param?.type === 'Identifier') ? params : null;
}

// ... and their index by name, once the body is proven to neither reach them through the arguments
// object nor rebind one - either would leave a slot holding something other than the argument
function slotParamIndex(callee, params) {
  if (referencesArgumentsObject(callee)) return null;
  const index = new Map(params.map((param, at) => [param.name, at]));
  return paramReboundInBody(callee.body, new Set(index.keys())) ? null : index;
}

// the class's own STATIC member one key reads, or null. the class DEFINES its methods and accessors
// first and initializes its data fields after, each kind in source order: a FIELD spelling the key
// wins over any method or accessor wherever it stands, and the last one of a kind over the ones before
export function classStaticSlotMember(classNode, key) {
  const members = (classNode?.body?.body ?? []).filter(member => member.static && foldedPropertyKeyName(member) === key);
  return members.findLast(member => CLASS_DATA_FIELD_TYPES.has(member.type)) ?? members.at(-1) ?? null;
}

// ... and the one a CALL through that key reaches, where a caller census keyed on the class's binding
// can count every call of it, or null: a decorator may replace the class or the member, a static whose
// key no canon names may be this one, and an accessor runs a getter instead
export function classStaticCallSlot(classNode, key) {
  if (key === null || !classStaticsCallable(classNode)) return null;
  const slot = classStaticSlotMember(classNode, key);
  return slot && !slot.decorators?.length && (slot.kind === 'method' || CLASS_DATA_FIELD_TYPES.has(slot.type)) ? slot : null;
}

// ... the refusals that hold for every key of the class
export function classStaticsCallable(classNode) {
  return !classNode?.decorators?.length && (classNode?.body?.body ?? []).every(member => !member.static
    || privateNameSpelling(member.key) !== null || foldedPropertyKeyName(member) !== null);
}

// does the class reach itself past its binding? `this` in a static member or block is the class or a
// subclass, `super` there its heritage, and a class expression's own name is a binding only its body
// sees: a call spelled any of these ways is one no census of a binding counts
export function classReachesItselfUnnamed(classNode) {
  const ownName = classNode?.type === 'ClassExpression' ? classNode.id?.name : null;
  let reaches = false;
  for (const member of classNode?.body?.body ?? []) {
    const staticContext = !!member.static || member.type === 'StaticBlock';
    if (!staticContext && !ownName) continue;
    walkAstNodes({ root: member, visit(node) {
      if (staticContext && (node.type === 'ThisExpression' || node.type === 'Super')
        || node.type === 'Identifier' && node.name === ownName) reaches = true;
      return !reaches;
    } });
    if (reaches) return true;
  }
  return false;
}

// does the file read a `constructor` key, off anything: the one way an instance reaches its class's statics
// (`inst.constructor.make()`), so a construction hands those on only here - answered by the file census as it
// walks (`collectFileCensus`), by a walk of its own for a program no census walked
const CONSTRUCTOR_KEY_READS = new WeakMap();
export function readsConstructorKey(program) {
  if (!CONSTRUCTOR_KEY_READS.has(program)) {
    let reads = false;
    walkAstNodes({ root: program, visit(node) {
      reads = readsConstructorKeyAt(node, node.type);
      return !reads;
    } });
    CONSTRUCTOR_KEY_READS.set(program, reads);
  }
  return CONSTRUCTOR_KEY_READS.get(program);
}

// ... at this node, its `type` read by the caller: a member access naming the key, or a pattern property
// folding to it
function readsConstructorKeyAt(node, type) {
  if (isMemberAccessType(type)) return staticMemberKeyName(node) === 'constructor';
  return type === 'ObjectPattern'
    && node.properties.some(prop => prop.type !== 'RestElement' && foldedPropertyKeyName(prop) === 'constructor');
}

// The pattern pairer reads the value of the same own static slot that member consumers resolve.
// Without class pairing, the source would escape whole, including every constructor stored in it.
function classStaticSlotValue(classNode, key) {
  const member = classStaticSlotMember(classNode, key);
  if (!member) return null;
  return FUNCTION_LIKE_NODE_TYPES.has(member.type) ? member : member.value ?? null;
}

// Possible values reaching one pattern binding from its supplied receiver and slot defaults.
// `includeDefaults: false` selects the supplied half for callers proving independent obligations.
// `followIifeReturns` exposes inline receivers for analysis, retaining each returned node's scope.
// `preservesBody` permits getter effects only for callers retaining the original property read.
// `restSources` collects object-rest receivers separately; those receivers are not binding values.
// `pairedSources` (asked with the level's own ctx) names the containers a source this pairer cannot
// index may hold, each paired in turn, a leaf a parameter fills there taken as the argument the
// filling call passed (`filled`) -
// and, for a caller tracking scopes, where a source's values resolve (`scope`, `argumentScope` for a
// filled one, recorded once into `valueScopes`, the deepest level first);
// `readsThrough` takes a slot of a receiver or an invocation still left as the READ of that slot,
// nested levels included - what a census following member chains resolves further.
export function patternSlotValues(pattern, rhs, name, ctx) {
  const out = [];
  // a caller comparing supplied values with a default's existing obligations needs the source
  // half alone. keep that choice on the canonical pairing, including its nested descent
  const includeDefaults = ctx?.includeDefaults !== false;
  // a const-identifier rhs bound to a literal (`const arr = [Map]; [A] = arr`) - follow it so the
  // pairing sees the underlying array / object, like the direct-literal form. the installed value
  // peel comes first: a paren (an oxc NODE), a TS cast, a sequence or a plain write all hand the same
  // runtime value, and judging the raw spelling split the legs on `([[globalThis]])`
  rhs = followConstLiteralAlias(installedWriteValue(rhs), ctx);
  if (ctx?.followIifeReturns) rhs = peelIifeReturnTarget(rhs, ctx.adapter?.isMutatedStaticSlot ?? ctx.adapter?.isMutatedStatic);
  const sources = pairerSources(rhs, ctx);
  if (sources) {
    return sources.flatMap(({ source, filled, scope, argumentScope }) => {
      const values = patternSlotValues(pattern, source, name, scope ? { ...ctx, scope } : ctx);
      return values.map(value => {
        const read = filled?.(value) ?? value;
        if (scope && !ctx.valueScopes?.has(read)) ctx.valueScopes?.set(read, read === value ? scope : argumentScope);
        return read;
      });
    });
  }
  function propKey(prop) {
    return patternPropKey(prop, ctx, pattern);
  }
  // a nested pattern slot (`[[M]]` / `{ x: [M] }`) pairs against every candidate of its slot
  // positionally / by key - recurse so a binding bound through arbitrary nesting still surfaces
  // its value union; the slot's own default is an alternative RHS the nested bindings may pair
  // against instead
  if (pattern?.type === 'ArrayPattern') {
    for (let i = 0; i < pattern.elements.length; i++) {
      const element = pattern.elements[i];
      const slot = patternSlotTarget(element);
      if (slot?.type === 'Identifier' && slot.name !== name) continue;
      // a spread at or before slot i shifts every later position by the spread's runtime length,
      // so `rhs.elements[i]` is no longer THE value that lands in slot i. under the value-UNION
      // contract every static element from the first spread on is still a POSSIBLE slot value
      // (a zero-length spread pairs i to the next static, a longer one to the spread's own items),
      // so enumerate them all; the spread's items stay unenumerable, which
      // `patternSlotSpreadShifted` reports to consumers that need the union to be COMPLETE
      const candidates = rhs?.type === 'ArrayExpression' ? arrayWrapSlotValueCandidates(rhs.elements, i)
        : [ctx?.readsThrough && element?.type !== 'RestElement'
          && patternSourceSlotRead(rhs, String(i), ctx, isDestructurePattern(slot))].filter(Boolean);
      if (isDestructurePattern(slot)) {
        for (const cand of candidates) out.push(...patternSlotValues(slot, cand, name, ctx));
        if (includeDefaults && element.type === 'AssignmentPattern') out.push(...patternSlotValues(slot, element.right, name, ctx));
        continue;
      }
      if (slot?.type !== 'Identifier' || slot.name !== name) continue;
      // a slot's paired value and its default are values spelled at a write - the write-value
      // canon reads them (`[k] = [j = "from"]` installs `"from"`)
      if (includeDefaults && element.type === 'AssignmentPattern') out.push(installedWriteValue(element.right));
      out.push(...candidates.map(installedWriteValue));
    }
  } else if (pattern?.type === 'ObjectPattern') {
    for (const prop of pattern.properties) {
      if (prop.type === 'RestElement' && ctx?.restSources && patternBindsName(prop.argument, name)) {
        ctx.restSources.push(rhs);
      }
      if (prop.type !== 'Property' && prop.type !== 'ObjectProperty') continue;
      const slot = patternSlotTarget(prop.value);
      // A sibling binding contributes no value to this name. Resolving its key against every
      // candidate container first makes wide patterns multiply the same property scans.
      if (slot?.type === 'Identifier' && slot.name !== name) continue;
      const key = propKey(prop);
      // last matching key wins, but a trailing spread could override it -> bail (canonical helper)
      // an object-pattern key can spell a canonical ARRAY index (`({ 0: w } = [v])` reads
      // property '0' off the array exactly as the language does): the slot pairs under the
      // positional contract - exactly while positions are static, every static element from
      // the first spread on once shifted - so the two spellings of one read enumerate alike
      const arrayIndex = key !== null && rhs?.type === 'ArrayExpression' ? canonicalArrayIndex(key) : null;
      const candidates = arrayIndex !== null ? arrayWrapSlotValueCandidates(rhs.elements, arrayIndex)
        : key !== null
          ? rhs?.type === 'ObjectExpression'
            ? [objectPropertyReadValue(findObjectKeyBeforeSpread(rhs.properties, rp => propKey(rp) === key), ctx ?? {})]
            : CLASS_NODE_TYPES.has(rhs?.type) ? [classStaticSlotValue(rhs, key)] : []
          : [];
      const paired = candidates.filter(Boolean);
      if (isDestructurePattern(slot)) {
        const levels = paired.length ? paired : [patternSourceSlotRead(rhs, key, ctx, true)].filter(Boolean);
        for (const cand of levels) out.push(...patternSlotValues(slot, cand, name, ctx));
        if (includeDefaults && prop.value.type === 'AssignmentPattern') out.push(...patternSlotValues(slot, prop.value.right, name, ctx));
        continue;
      }
      if (slot?.type !== 'Identifier' || slot.name !== name) continue;
      if (includeDefaults && prop.value.type === 'AssignmentPattern') out.push(installedWriteValue(prop.value.right));
      if (paired.length) out.push(...paired.map(installedWriteValue));
      // a destructure from a RECEIVER (`({ Promise: M } = globalThis)`): the slot's reaching
      // value is the receiver's member - synthesize it so the reaching resolution sees
      // `globalThis.Promise` exactly like the identifier-assignment form (`M = globalThis.Promise`).
      // an unresolvable receiver just fails downstream resolution, same as no value
      else {
        const read = patternSourceSlotRead(rhs, key, ctx);
        if (read) out.push(read);
      }
    }
  }
  return out;
}

// does the binding `name` pair through a SPREAD-SHIFTED array slot (`[, { x: A }] = [...xs, V]`)?
// there the enumerated candidates are an over-approximation whose union is INCOMPLETE (the spread's
// own items are unenumerable), so a precision-needing consumer must not read a lone candidate as
// certain - the maybe-union stays sound for inject-if-might. an OBJECT pattern over an object
// literal shifts nothing by itself (an overriding trailing spread already pairs nothing there),
// but a key naming an ARRAY index reads the slot under the positional contract and shifts like
// the positional spelling (`{ 1: A } = [...xs, V]`); either way it must still descend into its
// slots: a shifted array sits just as well under a key (`{ x: [, A] } = { x: [...xs, V] }`).
// mirrors `patternSlotHasDefault` / `patternSlotValues`, which walk both pattern kinds
export function patternSlotSpreadShifted(pattern, rhs, name, ctx = null) {
  // the SAME head normalization as `patternSlotValues`, or the two answer about DIFFERENT nodes:
  // values enumerated through a followed / peeled rhs with completeness judged on the raw spelling
  // would read a lone candidate as certain while an alias or a paren hides the shift
  rhs = followConstLiteralAlias(installedWriteValue(rhs), ctx);
  if (ctx?.followIifeReturns) rhs = peelIifeReturnTarget(rhs, ctx.adapter?.isMutatedStaticSlot ?? ctx.adapter?.isMutatedStatic);
  // ... and the same expansion of a source the pairer cannot index into the containers it names
  const sources = pairerSources(rhs, ctx);
  if (sources) return sources.some(({ source }) => patternSlotSpreadShifted(pattern, source, name, ctx));
  if (pattern?.type === 'ObjectPattern') {
    for (const prop of pattern.properties) {
      if (prop.type !== 'Property' && prop.type !== 'ObjectProperty') continue;
      if (!patternBindsName(prop.value, name)) continue;
      const slot = prop.value.type === 'AssignmentPattern' ? prop.value.left : prop.value;
      // the SAME key canon the value pairing uses - reading the key any less precisely here would
      // let a computed key (`{ [k]: [, A] }`) pair a value the completeness check never inspects
      const key = patternPropKey(prop, ctx, pattern);
      // a key spelling an ARRAY index reads the slot under the positional contract, shift included
      const arrayIndex = key !== null && rhs?.type === 'ArrayExpression' ? canonicalArrayIndex(key) : null;
      if (arrayIndex !== null && !resolveCallArgumentCoords(
        rhs.elements,
        arrayIndex,
        ctx?.adapter?.isMutatedStaticSlot ?? ctx?.adapter?.isMutatedStatic,
      )
        && spreadAtOrBefore(rhs.elements, arrayIndex)) return true;
      // last matching key wins, but a trailing spread could override it -> pairs nothing (canon).
      // only a NESTED slot can be shifted inside its paired value, and the key lookup scans the
      // whole literal: a leaf slot skips it, or N reads of one literal cost N scans of it
      if (isDestructurePattern(slot)) {
        const paired = arrayIndex !== null ? resolveCallArgument(
          rhs.elements,
          arrayIndex,
          ctx?.adapter?.isMutatedStaticSlot ?? ctx?.adapter?.isMutatedStatic,
        )
          : key !== null && rhs?.type === 'ObjectExpression'
            ? objectPropertyReadValue(findObjectKeyBeforeSpread(rhs.properties, rp => patternPropKey(rp, ctx, pattern) === key)) : null;
        if (patternSlotSpreadShifted(slot, paired, name, ctx)) return true;
      }
      if (prop.value.type === 'AssignmentPattern'
        && patternSlotSpreadShifted(slot, prop.value.right, name, ctx)) return true;
    }
    return false;
  }
  if (pattern?.type !== 'ArrayPattern') return false;
  for (let i = 0; i < pattern.elements.length; i++) {
    const element = pattern.elements[i];
    if (!element || !patternBindsName(element, name)) continue;
    const coords = rhs?.type === 'ArrayExpression' ? resolveCallArgumentCoords(
      rhs.elements,
      i,
      ctx?.adapter?.isMutatedStaticSlot ?? ctx?.adapter?.isMutatedStatic,
    ) : null;
    if (rhs?.type === 'ArrayExpression' && !coords && spreadAtOrBefore(rhs.elements, i)) return true;
    const slot = patternSlotTarget(element);
    const paired = coords ? resolveCallArgument(rhs.elements, i, ctx?.adapter?.isMutatedStaticSlot ?? ctx?.adapter?.isMutatedStatic) : null;
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
  // a plain identifier key names itself under every key canon; a literal scan asks this per
  // property, and the canon call would allocate its options object each time
  if (!prop.computed && prop.key?.type === 'Identifier') return prop.key.name;
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
// name = X` re-declaration standing at the owner's own statement level. `open` reports a site
// read only in part: a pattern slot the runtime may pair with a value the enumeration cannot
// see (spread-shifted). a site whose value the enumeration cannot read at all contributes
// nothing, which the enumeration's `complete` flag reads the same way; `callSites` names the pattern
// sites whose value is a CALL - a pattern write's, a head's call elements - paired by no helper
// here (the call canon is the detect layer's)
function reassignmentValueNodesAt(node, ownerNode, bindingName, ctx, varScopeNode = ownerNode) {
  // the three site shapes: a value written to the name itself, a value the name is paired to
  // through a pattern (open where the pairing is spread-shifted), the elements a for-x head
  // iterates (an iterable the head cannot enumerate contributes nothing, which reads as open)
  function whole(value) {
    return { nodes: [peelNestedSequenceExpressions(value).tail], open: false };
  }
  function paired(target, value, name) {
    if (!name) return { nodes: [], open: false };
    // Select the receiver before pairing its slots; pairing the selection itself loses its arms.
    const sources = flattenBranchingValueNodes([value], { ctx });
    const nodes = [];
    let open = false;
    for (const init of sources) {
      const read = { pattern: target, init, name, ctx };
      // A written slot keeps its recorded values beside the literal's, but the set stays open.
      const values = [...patternSlotValues(target, init, name, ctx), ...writtenPatternSlotValues(read)];
      nodes.push(...values);
      // One readable arm cannot make an unreadable sibling complete.
      if (!values.length || patternSlotSpreadShifted(target, init, name, ctx) || patternSlotWritten(read)) open = true;
    }
    return { nodes, open, callSites: patternCallSites(target, sources) };
  }
  function iterated(forX, name) {
    const head = forX ? forXHeadValueNodes(forX, name, ctx) : null;
    return { nodes: head?.nodes ?? [], open: false, callSites: head?.callSites ?? [] };
  }
  if (node.type === 'AssignmentExpression') {
    if (!VALUE_FLOW_ASSIGN_OPS.has(node.operator)) return { nodes: [], open: false };
    // the assignment flows its RHS TAIL (a sequence yields its last operand - the for-of head
    // peel below and the reaching canon already agree on this value view); the target is read
    // through its wrappers, as the scan that recorded the write read it
    const target = unwrapRuntimeExpr(node.left);
    return target?.type === 'Identifier' ? whole(node.right) : paired(target, node.right, bindingName);
  }
  // a for-x HEAD rebinds the alias each iteration; parsers record it unevenly (babel: the
  // ForXStatement or the init-less head declarator; estree: the LHS Identifier or nothing).
  // a for-OF over an ARRAY LITERAL flows each element as a possible value; for-in keys and
  // opaque / spread-bearing iterables enumerate nothing (the write still poisons cleanliness
  // through the canonical write scan - only the VALUE union has nothing to add)
  if (FOR_X_STATEMENT_TYPES.has(node.type)) return iterated(node, bindingName);
  if (node.type === 'VariableDeclarator') {
    // a `var name = X` re-declaration flows X exactly as `name = X` does - from the owner's own
    // statement level, where its init reads the scope the consumers resolve in; an init-less
    // declarator is a for-x head's (its per-iteration rebind) or a valueless twin
    if (node.init) {
      if (!ownerLevelDeclarator(node, ownerNode)
        && !nestedDeclaratorInitReadsOwnerValue(node, varScopeNode)) return { nodes: [], open: false };
      return node.id?.type === 'Identifier' ? whole(node.init) : paired(node.id, node.init, bindingName);
    }
    return iterated(enclosingForXStatement(node, ownerNode), bindingName);
  }
  if (node.type !== 'Identifier') return { nodes: [], open: false };
  const assignment = enclosingValueFlowAssignment(node, ownerNode);
  if (assignment) {
    const target = unwrapRuntimeExpr(assignment.left);
    return target === node ? whole(assignment.right) : paired(target, assignment.right, node.name);
  }
  return iterated(enclosingForXStatement(node, ownerNode), bindingName ?? node.name);
}

// the sites of `values` a pattern pairs whose value is an INVOCATION (`invocationNode`): they pair
// nothing in this layer - the call canon is the detect layer's - and go back whole for a consumer to
// pair through that canon
function patternCallSites(pattern, values) {
  return values.filter(value => invocationNode(unwrapTransparentSeq(installedWriteValue(value)))).map(value => ({ pattern, value }));
}

// the elements a for-OF head over an ARRAY LITERAL flows into the binding `bindingName`, each
// paired through the head's own pattern when it has one (`nodes`), and the call elements such a
// pattern cannot pair here (`callSites`); for-in, an opaque iterable or one with a spread
// enumerate nothing
function forXHeadValueNodes(forX, bindingName, ctx) {
  const none = { nodes: [], callSites: [] };
  if (forX.type !== 'ForOfStatement') return none;
  // sequence wrappers are value-transparent (a sequence yields its tail): peel them off the
  // iterable AND off each element, so `(eff(), [X])` and `[(eff(), X)]` both enumerate X -
  // usage-global keeps the source text verbatim, so the peeled prefix effects are untouched
  const rhs = peelNestedSequenceExpressions(unwrapRuntimeExpr(forX.right)).tail;
  if (rhs?.type !== 'ArrayExpression' || !rhs.elements?.length) return none;
  if (rhs.elements.some(e => e?.type === 'SpreadElement')) return none;
  const elements = rhs.elements.filter(Boolean)
    .map(e => peelNestedSequenceExpressions(unwrapRuntimeExpr(e)).tail);
  let { left } = forX;
  if (left?.type === 'VariableDeclaration') left = left.declarations?.[0]?.id ?? null;
  if (left?.type === 'Identifier') return { nodes: elements, callSites: [] };
  // a PATTERN head binds a slot of each element, not the element itself: pair the bound
  // name's slot against every element so `for ([M] of [[Array]])` reaches Array - and, where the
  // file wrote that slot of an element's container, the written values beside it
  if (isDestructurePattern(left) && bindingName) {
    return {
      nodes: elements.flatMap(el => [
        ...patternSlotValues(left, el, bindingName, ctx),
        ...writtenPatternSlotValues({ pattern: left, init: el, name: bindingName, ctx }),
      ]),
      callSites: patternCallSites(left, elements),
    };
  }
  return none;
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
  indexValueFlow(index, ownerNode);
  return index;
}

// ... the walk behind it, over any subtree: a render's slot joins a built index in place
// (`refreshWritesAtSlot`)
function indexValueFlow(index, root) {
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
  })(root);
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

// a constantViolation entry is a tracker NodePath (carries `.node`), but a raw node in the var-hoist
// synthetic binding and in the detection adapters' binding views, whose writes are recomputed from the
// tree (`recomputedBindingWrites`) - normalize to the underlying node
export function violationNode(violation) {
  return violation.node ?? violation;
}

// the `var name = X` re-declaration NODES that can reach the use past the type-resolver `binding`'s
// declarator: the ones textually BETWEEN the two for a straight-line read, every other one for a read
// from a function nested in the var's owner. estree-toolkit block-scopes a `var`, so `scope.getBinding` may surface a
// declarator whose init was overwritten by one of these (it records none as a constantViolation;
// babel hoists correctly and records them all). a non-empty result means the declarator init no
// longer describes the receiver at the use. shared by the staleness predicate and the reaching-redecl
// narrow so both bound the gap identically; only augments the estree var-hoist gap (babel: complete).
// with the `adapter`, a redecl in an arm its build never takes runs nowhere (`writeNeverRuns`) - the
// filter babel's recorded violations take on their own route
export function staleVarRedeclNodes({ binding, usagePath, name, adapter = null }) {
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
    .filter(node => (closureRead || (node.start > declStart && node.start < useStart))
      && !writeNeverRuns({ write: node, usagePath, adapter }));
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
// anywhere in the owner for a read from a nested function)? the options as `staleVarRedeclNodes` takes them
export function varInitStaleByRedecl(options) {
  return staleVarRedeclNodes(options).length > 0;
}

// a bare same-name redeclaration (`var { Map: M } = g; var M;`) writes NO value, yet both
// scope trackers record it as a constantViolation - a phantom for every value-flow consumer.
// the shape differs per parser: babel records the valueless DECLARATOR itself, estree-toolkit
// records the redeclared IDENTIFIER (whose declarator parent carries no init). a for-x head
// declarator also has no init, but its per-iteration rebind is a real write and stays.
// filter both shapes so the alias binding-shape guards and the trust predicates see real
// writes only - a one-shape filter would keep the emitters' poison decisions diverged
const valuelessFilteredCache = new WeakMap();
export function withoutValuelessDeclarationViolations(violations) {
  if (!violations?.length) return violations;
  const memo = valuelessFilteredCache.get(violations);
  if (memo) return memo;
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
  const result = filtered.length === violations.length ? violations : filtered;
  valuelessFilteredCache.set(violations, result);
  return result;
}

// the boolean view of `reassignmentNodesBeyondDeclarator` - is there a write of the binding that is
// not its own declaration? the emptiness test short-circuits so a violation-less binding never
// reaches the memo (its key is the violations array). asking the node set rather than re-spelling
// the exclusion keeps this answer identical to the one the flow-sensitive gates act on: the
// declaration is spelled three ways across the parsers (the declarator, a for-x head, the bound
// identifier inside its own pattern) and an identity self-assign writes the current value back
export function isReassignedBeyondDeclarator(binding) {
  return !!binding.constantViolations?.length && reassignmentNodesBeyondDeclarator(binding).length > 0;
}

// A running sloppy callable may escape through a callee's Function.caller. Simple lexical
// stores of literals, arrays and lexical values invoke no callee and keep that channel closed.
// Generator creation only runs parameters; the invocation canon owns that body distinction.
// Other body shapes and parameter binding work decline; strictness uses the shared owner walk.
function callableMayExposeCaller(path, ctx, invocation = null) {
  if (!isSloppyAtPath(path)) return false;
  function lexicalName(name) {
    const binding = ctx?.adapter?.getBinding?.({ scope: path.scope, name, path });
    const declaration = bindingDeclarationPath(binding);
    if (!binding || isAmbientBindingShape(binding.node ?? declaration?.node, declaration?.parentPath?.node)
      || nonEmittedExpressionAncestor(declaration)) return false;
    return ['var', 'hoisted'].includes(binding.kind)
      ? FUNCTION_LIKE_NODE_TYPES.has(findNearestVarScopeOwner(binding.scope?.path)?.node?.type)
      : ['const', 'let', 'param', 'module', 'local'].includes(binding.kind);
  }
  const values = [];
  for (const param of path.node.params ?? []) {
    if (param.type === 'Identifier' || param.type === 'RestElement' && param.argument.type === 'Identifier') continue;
    if (param.type !== 'AssignmentPattern' || param.left.type !== 'Identifier') return true;
    values.push(param.right);
  }
  if (!invocation || bodyRunsAtInvocation(path.node, invocation.node)) {
    const { body } = path.node;
    const statements = body?.type === 'BlockStatement' ? body.body : [{ type: 'ExpressionStatement', expression: body }];
    for (const statement of statements) {
      const expression = unwrapRuntimeExpr(statement.expression);
      if (statement.type === 'EmptyStatement' || statement.type === 'ExpressionStatement' && isQuietLiteralOperand(expression)) continue;
      if (statement.type !== 'ExpressionStatement' || expression?.type !== 'AssignmentExpression'
        || expression.operator !== '=' || expression.left.type !== 'Identifier' || !lexicalName(expression.left.name)) return true;
      values.push(expression.right);
    }
  }
  while (values.length) {
    const value = unwrapRuntimeExpr(values.pop());
    if (!value || isQuietLiteralOperand(value) || value.type === 'Identifier' && lexicalName(value.name)) continue;
    if (value.type !== 'ArrayExpression') return true;
    for (const element of value.elements) values.push(element);
  }
  return false;
}

// A private callable has only its indexed direct invocations. Each invocation must run in
// the binding's active frame; unknown consumers, escaped construction and cycles decline.
// The caller supplies the same frame walk for nested closed callers, without a new index.
function closedBodyRunsInFrame(bodyPath, frame, ctx, seen, callCanReenter) {
  const collect = ctx?.adapter?.collectBindingReferences;
  if (!collect) return false;
  let callable = bodyPath;
  if (CLASS_MEMBER_TYPES.has(bodyPath.node?.type)) {
    for (; callable?.node && !CLASS_NODE_TYPES.has(callable.node.type); callable = callable.parentPath) { /* class owner */ }
  } else if (bodyPath.node?.type === 'FunctionExpression' && bodyPath.parentPath?.node?.type === 'MethodDefinition') {
    callable = bodyPath.parentPath.parentPath?.parentPath;
  }
  if (!callable?.node || seen.has(callable.node) || seen.size >= MAX_DEPTH) return false;
  const isClass = CLASS_NODE_TYPES.has(callable.node.type);
  if (!isClass && !FUNCTION_LIKE_NODE_TYPES.has(callable.node.type)) return false;
  if (isClass && (callable.node.superClass || classCarriesDecorators(callable.node)
    || callable.node.body.body.some(member => member.static || member.type === 'StaticBlock'
      || (member.params ?? member.value?.params ?? []).some(param => param.decorators?.length)))) return false;
  const outer = peelTransparentExprAncestorPath(callable);
  const holder = outer.parentPath;
  const declaration = callable.node.type === 'FunctionDeclaration' || callable.node.type === 'ClassDeclaration' ? callable
    : holder?.node?.type === 'VariableDeclarator' && holder.node.id.type === 'Identifier'
      && unwrapRuntimeExpr(holder.node.init) === callable.node ? holder : null;
  const name = declaration?.node?.id?.name;
  if (!name) return false;
  const binding = ctx.adapter.getBinding?.({ scope: declaration.parentPath?.scope ?? declaration.scope, name, path: declaration });
  if (bindingDeclarationPath(binding)?.node !== declaration.node || isReassignedBeyondDeclarator(binding)) return false;
  const refs = collect(declaration, name, { closed: true });
  if (!refs) return false;
  if (!refs.length) return true;
  if (!isClass && referencesArgumentsObject(callable.node)) return false;
  if (!isClass && callable.node.async && suspensionPointBefore(callable.node, Infinity)) return false;
  const nextSeen = new Set(seen).add(callable.node);
  return refs.every(ref => {
    if (isTSTypeOnlyIdentifierPath(ref)) return true;
    const value = peelTransparentExprAncestorPath(ref);
    const call = value.parentPath;
    if (!isIifeCallNode(call?.node) || call.node.callee !== value.node) {
      return valueIsDroppedAt(value);
    }
    // A running sloppy callable can escape through a callee's Function.caller.
    // Indexed source references alone cannot close that implicit identity channel.
    if (callableMayExposeCaller(callable, ctx)) return false;
    if (call.node.type === 'NewExpression' || !isClass && callable.node.generator) {
      if (!valueIsDroppedAt(call)) return false;
      let readsThis = false;
      walkAstNodes({
        root: callable.node,
        visit(node) {
          if (node.type === 'ThisExpression') readsThis = true;
          return !readsThis;
        },
      });
      if (readsThis) return false;
    }
    return !callCanReenter(call, nextSeen);
  });
}

// Native schedulers cannot invoke their callback during a synchronous property lookup.
const ASYNC_CALLBACK_GLOBALS = new Set([
  'queueMicrotask',
  'setTimeout',
  'setInterval',
  'setImmediate',
  'requestAnimationFrame',
  'requestIdleCallback',
]);

// ... and is one of those writes deferred below the binding's own frame - a closure, a
// method, an accessor or an instance-field value? such a write may run in the middle of any
// expression that calls user code, where a write in the binding's own frame never does.
// A binding with no frame to locate writes in answers yes.
export function bindingWrittenBeyondItsFrame(binding, ctx = null, { closedCalls = true } = {}) {
  if (!isReassignedBeyondDeclarator(binding)) return false;
  const ownerPath = findNearestVarScopeOwner(binding.declarationPath ?? binding.path ?? binding.scope?.path);
  const frame = ownerPath?.node ?? binding.scope?.block;
  function pathCanReenter(path, seen = new Set()) {
    let up = path.parentPath;
    for (let child = path; up?.node && up.node !== frame; child = up, up = up.parentPath) {
      if (!isDeferredContextStep(up.node, child)) continue;
      if (!closedCalls) return true;
      if (ctx && FN_NODE_TYPES.has(up.node.type) && valueIsDroppedAt(up)) continue;
      if (ctx && closedBodyRunsInFrame(up, frame, ctx, seen, pathCanReenter)) continue;
      const invocation = FN_NODE_TYPES.has(up.node.type) ? immediateInvocationOf(up) : null;
      // Non-constructible literals never enter their bodies. A discarded generator
      // iterator cannot be resumed; its callable must not escape from parameter defaults.
      if (ctx && invocation?.node.type === 'NewExpression' && up.node.type === 'ArrowFunctionExpression') continue;
      if (ctx && up.node.generator && invocation
          && !referencesArgumentsObject(up.node) && !namedFunctionSelfReferences(up)) {
        const value = peelTransparentExprAncestorPath(invocation);
        const member = value.parentPath;
        const callee = member?.node && peelTransparentExprAncestorPath(member);
        const resume = callee?.parentPath;
        // A direct native next() whose result is discarded exposes neither the iterator
        // nor a yielded value to a later getter. Retained iterators remain deferred writers.
        if (valueIsDroppedAt(invocation) && !callableMayExposeCaller(up, ctx, invocation)
          || (!callableMayExposeCaller(up, ctx) && isMemberAccessNode(member?.node)
          && member.node.object === value.node && memberReadKeyName(member.node) === 'next'
          && isIifeCallNode(resume?.node) && resume.node.type !== 'NewExpression'
          && resume.node.callee === callee.node && valueIsDroppedAt(resume))) continue;
      }
      if (!FN_NODE_TYPES.has(up.node.type) || referencesArgumentsObject(up.node)) return true;
      if (ctx && callableMayExposeCaller(up, ctx)) return true;
      const argument = peelTransparentExprAncestorPath(up);
      const consumer = argument.parentPath;
      const callee = unwrapRuntimeExpr(consumer?.node?.callee);
      // Native forEach on a fresh array does not retain an anonymous callback.
      // A source-written prototype method and an unknown receiver keep the escape boundary.
      if (ctx && isIifeCallNode(consumer?.node) && consumer.node.type !== 'NewExpression'
        && consumer.node.arguments[0] === argument.node && !namedFunctionSelfReferences(up)
        && isMemberAccessNode(callee) && memberReadKeyName(callee) === 'forEach'
        && unwrapRuntimeExpr(callee.object)?.type === 'ArrayExpression'
        && !prototypeChainMayLend('forEach', ctx, ['Array'])) continue;
      // Only unshadowed, unwritten scheduler globals supply this timing guarantee.
      // Unknown consumers and locally replaced schedulers retain the escape boundary.
      if (ctx && isIifeCallNode(consumer?.node) && consumer.node.type !== 'NewExpression'
        && consumer.node.arguments[0] === argument.node && callee?.type === 'Identifier'
        && ASYNC_CALLBACK_GLOBALS.has(callee.name) && !namedFunctionSelfReferences(up)
        && !ctx.adapter.getBinding?.({ scope: consumer.scope, name: callee.name, path: consumer })
        && !ctx.adapter.isMutatedStaticSlot?.('globalThis', callee.name)) continue;
      let call = runsAtImmediateInvocation(up)
          ?? (up.node.async && !up.node.generator && !suspensionPointBefore(up.node, Infinity)
            && !namedFunctionSelfReferences(up) ? immediateInvocationOf(up) : null);
        // A closed literal forwarder `fn => fn()` invokes its sole callback without
        // retaining it. Other argument consumers keep the deferred writer boundary.
      if (!call && !up.node.async && !up.node.generator && !namedFunctionSelfReferences(up)) {
        const caller = consumer;
        const wrapper = caller?.node?.type === 'CallExpression' && caller.node.arguments.length === 1
            && caller.node.arguments[0] === argument.node ? peelSkippableWrapperPath(caller.get('callee')) : null;
        const [param] = wrapper?.node?.params ?? [];
        const body = wrapper?.node?.body;
        const returned = body?.type === 'BlockStatement'
            ? body.body.length === 1 && body.body[0].type === 'ReturnStatement' ? body.body[0].argument : null : body;
        const forwarded = unwrapRuntimeExpr(returned);
        if (FN_NODE_TYPES.has(wrapper?.node?.type) && !wrapper.node.async && !wrapper.node.generator
            && wrapper.node.params.length === 1 && param.type === 'Identifier' && wrapper.node.id?.name !== param.name
            && forwarded?.type === 'CallExpression' && forwarded.arguments.length === 0
            && forwarded.callee.type === 'Identifier' && forwarded.callee.name === param.name
            && runsAtImmediateInvocation(wrapper) === caller) call = caller;
      }
      if (!call) return true;
      if (call.node.type === 'NewExpression') {
        if (!ctx || !valueIsDroppedAt(call)) return true;
        let readsThis = false;
        walkAstNodes({
          root: up.node,
          visit(node) {
            if (node.type === 'ThisExpression') readsThis = true;
            return !readsThis;
          },
        });
        if (readsThis) return true;
      }
    }
    return up?.node !== frame;
  }
  return !frame || reassignmentNodesBeyondDeclarator(binding).some(write => {
    const sourceWrite = write.type === 'Identifier' ? enclosingValueFlowAssignment(write, frame) : write;
    // Find live source writes by their path before building an index of the whole owner.
    // A cached path can locate a re-emitted copy within its still-live source frame.
    // Missing local copies use the statement holding their span before the owner index,
    // so a replaced nested write never forces scans of unrelated function bodies.
    const sourcePath = ownerPath && pathOfNode(ownerPath, sourceWrite);
    const sourceOwner = sourcePath && findNearestVarScopeOwner(sourcePath);
    const path = sourcePath?.node === sourceWrite && !ancestorChainDetached(sourcePath) ? sourcePath
      : sourceOwner && !ancestorChainDetached(sourceOwner) && ownerSourceWritePath(sourceOwner, sourceWrite)
        || ownerPath && ownerSourceWritePath(statementPathHolding(ownerPath, sourceWrite), sourceWrite);
    if (path && !ancestorChainDetached(path)) {
      return pathCanReenter(path);
    }
    return collectVarGuardsToDeclarator(frame, write) === null || sitsInDeferredField(frame, write);
  });
}

// does `node` stand in an instance field's value in the frame `ownerNode` - one that runs at construction,
// whenever that is (`isDeferredFieldValueNode`), not where the source spells it? a guard the current index
// no longer locates was collected before a rewrite replaced it, and proves nothing either way: counted as one
function sitsInDeferredField(ownerNode, node) {
  const guards = collectVarGuardsToDeclarator(ownerNode, node);
  const parents = guards?.length ? ownerParentIndexLocating(ownerNode, node) : null;
  return !!parents && guards.some(guard => {
    const parent = parents.get(guard);
    return !parent || isDeferredFieldValueNode(parent, guard);
  });
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
  const scanned = usePath && (kind === 'var' || kind === 'let' || kind === 'const');
  return withoutFunctionSelfRecord(withoutValuelessDeclarationViolations(scanned
    ? scannedWrites(writeScanOwner({ kind, bindingPath, anchorPath: usePath, name }), name) : fallback), bindingPath?.node);
}

// babel records a FUNCTION declared in a loop body as a write of its own binding - the per-iteration
// re-creation, with the one value the declaration holds - where estree-toolkit records nothing. a
// declaration is no write of itself; a DIFFERENT declaration of the name stays a write
function withoutFunctionSelfRecord(violations, own) {
  return own?.type === 'FunctionDeclaration' && violations?.some(v => violationNode(v) === own)
    ? violations.filter(v => violationNode(v) !== own) : violations;
}

// a write through a pattern (`({ Map: M } = g)`, a `var` re-declaration destructuring its init): the
// write an emitter's render REPLACES whole (`M = _Map`) rather than rewriting inside it
function isPatternWriteNode(node) {
  return node?.type === 'AssignmentExpression' ? isDestructurePattern(unwrapRuntimeExpr(node.left))
    : node?.type === 'VariableDeclarator' && isDestructurePattern(node.id);
}

// is `write` (a node, or an entry of a scope's own record) no longer in the tree under `rootPath`? an entry
// with no parent chain to climb - a node, a write the scan recovered past the tracker - is found through the
// root's write index, which keeps a replaced node's path pointing at the replacement and a removed one's at
// a detached chain. a node the index misses is written since it was built or removed before: the index is
// built again to tell the two apart, unless the lookup asking built it (`writeLookupSerial`)
function retiredWrite(write, rootPath) {
  const node = violationNode(write);
  const index = write.parentPath ? null : ownerWritePathIndex(rootPath);
  let live = index ? index.get(node) : write;
  if (!live && writeIndexSerials.get(index) !== writeLookupSerial) {
    ownerWritePathIndexCache.delete(rootPath);
    live = ownerWritePathIndex(rootPath).get(node);
  }
  return !live || live.node !== node || ancestorChainDetached(live);
}

// the node types a scope's own record names a write by: the write itself, a for-x head, a re-declaration
// (babel), the written identifier (estree-toolkit)
const WRITE_RECORD_TYPES = new Set([...OWNER_WRITE_PATH_TYPES, 'Identifier']);

// is `write` a record path a render replaced in place? babel keeps the path object and swaps its node,
// which then holds something that writes nothing (`({ Map: M } = g)` turned `(M = _Map, ...)`)
function replacedInPlace(write) {
  return write !== violationNode(write) && !WRITE_RECORD_TYPES.has(write.node?.type);
}

// the writes a render re-emitted as copies in another slot of the tree, retiring the nodes it copied (an
// initializer's sequence prefix lifted ahead of the declaration the render replaced): a pattern write is known
// to be retired by its kind, a write of any other kind only by this note, made where the render retires it -
// the climb proving a write left the tree costs a walk to the root, so a lookup makes it for noted writes
// alone. the epoch counts the notes: a record a lookup judged before a note is judged again
const renderRetiredWrites = new WeakSet();
let renderRetiredWritesEpoch = 0;

// note the writes in `node`, a subtree a render retired whole or copied to stand in for it: every node, whatever
// record names its writes (babel the assignment, estree-toolkit the written identifier - a pattern leaf
// too, copied without the assignment it fills - the scan the write itself). a subtree holding no write is
// no record's, so a lookup's judgment stands
export function noteRenderRetiredWrites(node) {
  const nodes = [];
  let writes = false;
  walkAstNodes({ root: node, visit: child => {
    nodes.push(child);
    writes ||= OWNER_WRITE_PATH_TYPES.has(child.type) || isDestructurePattern(child);
  } });
  if (!writes) return;
  for (const child of nodes) renderRetiredWrites.add(child);
  renderRetiredWritesEpoch++;
}

// ... and `targets`, the binding targets a render took out of a pattern it keeps or drops (a slot a claim
// consumes, one a sentinel took the place of): each is itself the write estree-toolkit's record names, with no
// write-shaped node over it for the walk above to find. a default the render spells again elsewhere is no
// target, and stays live
export function noteRenderRetiredTargets(targets) {
  if (!targets.length) return;
  for (const target of targets) walkAstNodes({ root: target, visit: child => renderRetiredWrites.add(child) });
  renderRetiredWritesEpoch++;
}

// can a lookup find `write` retired: a pattern write, a loop head or a noted write, which a render replaces or
// rewrites in place, or one already replaced in place?
function retirableWrite(write) {
  const node = violationNode(write);
  return isPatternWriteNode(node) || isForXStatement(node) || renderRetiredWrites.has(node) || replacedInPlace(write);
}

// is `write` one a render replaces whenever it renders it: a pattern write, or a write the render noted
function knownRetiring(node) {
  return isPatternWriteNode(node) || renderRetiredWrites.has(node);
}

// does `writes` - a scope's own record - hold a write a render retired: a pattern or noted write no longer in
// the tree, a record path a render replaced in place, or an assignment or a loop head a render rewrote in
// place so it writes `name` no more (`stillWrites`)?
function holdsRetiredWrite(writes, rootPath, name) {
  return writes.some(write => {
    // a path a removal emptied names no node
    const node = write.node === null ? null : violationNode(write);
    return replacedInPlace(write)
      || ((node?.type === 'AssignmentExpression' || isForXStatement(node)) && !stillWrites(node, name))
      || (!!node && knownRetiring(node) && retiredWrite(write, rootPath));
  });
}

// does the write `node` the scan recorded for `name` write it still? a render may rewrite a write in place: the
// node stays in the tree and writes another name (`[{ Set: S }] = g` turned `[_ref] = g`, a loop head turned a
// declaration)
export function stillWrites(node, name) {
  if (node.type !== 'VariableDeclarator') return writtenNames(node).includes(name);
  let found = false;
  if (node.init) walkPatternIdentifiers(node.id, id => { found ||= id.name === name; });
  return found;
}

// is a write the scan recorded for `name` to read again: one a render rewrote in place, or one no longer in
// the tree (`retiredWrite`)?
function staleScanWrite(write, name, rootPath) {
  return !stillWrites(write, name) || retiredWrite(write, rootPath);
}

// does the scan list `writes` of `name` give a lookup cause to read it again: a write a render rewrote in place,
// or a pattern or noted write a render retired (`knownRetiring`, the only writes the climb is made for)
function scanHoldsStaleWrite(writes, name, rootPath) {
  return writes.some(write => !stillWrites(write, name) || (knownRetiring(write) && retiredWrite(write, rootPath)));
}

// the writes of `name` the scan of `ownerPath` holds, each stale one read again where it stood
// (`refreshWritesAtSlot`) - a pattern write's render retires it, and so may the render of a statement
// carrying another write, or a render rewriting a write in place (`staleScanWrite`) - with the paths of the
// writes standing there now. a stale write whose slot the tree no longer shows drops the scans of the
// declaration at `declarationPath` instead
function refreshedScanWrites({ ownerPath, name, rootPath, declarationPath }) {
  const paths = new Map();
  for (const write of scopeReassignmentIndexFor(ownerPath).get(name) ?? EMPTY_REASSIGNMENTS) {
    if (!staleScanWrite(write, name, rootPath) || !scopeReassignmentIndexFor(ownerPath).get(name)?.includes(write)) continue;
    const slotPath = ownerWritePathIndex(rootPath).get(write);
    const found = slotPath && refreshWritesAtSlot({ ownerPath, slotPath, retired: write, name });
    if (!found) {
      invalidateWriteScans(declarationPath);
      break;
    }
    for (const [node, path] of found) paths.set(node, path);
  }
  return { writes: scopeReassignmentIndexFor(ownerPath).get(name) ?? EMPTY_REASSIGNMENTS, paths };
}

// the writes a render left in the slot the write `retired` held when `ownerPath` was scanned, indexed in
// place: the scan drops what the replaced subtree recorded and takes what stands in the slot now, so a
// lookup after a render reads one slot again rather than the whole owner (`renderedSlot`); the list of
// `name`, read again for it, loses the write once the slot shows what stands for it. the parent, value-flow
// and write-path indexes take the slot's subtrees too. answers the paths of the writes standing in the slot
// now, or null where the tree shows no such slot under the owner
function refreshWritesAtSlot({ ownerPath, slotPath, retired, name }) {
  const { slot, old } = renderedSlot(slotPath, retired);
  // ... the owner itself rewritten in place - a loop whose head declared the binding: its own indexes are read
  // again whole, which costs the loop, where a drop up to the var-scope owner would cost the file
  if (slot.node === ownerPath.node) {
    for (const cache of [scopeReassignCache, ownerParentIndexCache, valueFlowOwnerIndexCache]) cache.delete(ownerPath.node);
    return new Map();
  }
  const holder = slot.parentPath;
  const frames = holder?.node && !ancestorChainDetached(holder) ? framesDownTo(ownerPath, holder) : null;
  if (!frames) return null;
  const regions = [{ frames, paths: pathsInSlot(slot, old) }];
  // ... and the statements a render minted around the statement holding a slot deeper in it
  const statement = statementListOf(holder.node) === slot.container ? null : statementPathAbove(slot, ownerPath);
  if (statement) regions.push({ frames: framesDownTo(ownerPath, statement.parentPath), paths: mintedAround(statement) });
  // ... and those it minted at the head of the body of the function whose parameter it rewrote: the parameter's
  // pattern is re-hosted there, its default's writes with it
  const body = slot.listKey === 'params' && holder.node.body?.type === 'BlockStatement' ? holder.get('body') : null;
  const leading = body ? body.get('body') : [];
  if (leading.length && standsFor(leading[0].node, old)) {
    regions.push({ frames: framesDownTo(ownerPath, body), paths: runAround(leading[0], 0, node => standsFor(node, old)) });
  }
  const scanner = reassignmentScanner();
  const sloppy = isSloppyAtPath(ownerPath);
  for (const { frames: regionFrames, paths } of regions) {
    if (paths.length) scanner.scanUnder({ frames: regionFrames, sloppy, nodes: paths.map(path => path.node) });
  }
  const held = writesHeldBefore(retired, old);
  // a write its slot still holds, rewritten in place, stays while the slot holds no write of `name`: a render
  // rewriting a pattern before it mints the writes of its leaves is caught between the two, and the write
  // marks the slot until they stand
  if (slot.node !== retired || scanner.index.has(name)) held.names.add(name);
  patchScanIndex({ index: scopeReassignmentIndexFor(ownerPath), ...held, added: scanner.index, old });
  return joinSideIndexes({ holder, ownerPath, paths: regions.flatMap(region => region.paths) });
}

// the nodes the slot held - the retired write and the subtree of the node it stood in - and the names
// their writes write: every one the scan may have recorded there
function writesHeldBefore(retired, old) {
  const gone = new Set([retired]);
  const names = new Set(writtenNames(retired));
  if (old && old !== retired) {
    (function visit(node) {
      if (!isASTNode(node)) return;
      gone.add(node);
      for (const name of writtenNames(node)) names.add(name);
      if (node.type === 'VariableDeclarator' && node.init) walkPatternIdentifiers(node.id, id => names.add(id.name));
      walkAstChildren(node, visit);
    })(old);
  }
  return { gone, names };
}

// the scan `index` without the writes in `gone` and with the ones `added` records: a fresh list per name
// touched, the slot's writes in the place of the ones it held, else in the place the span of `old` gives
// them. a list a caller holds keeps its own content
function patchScanIndex({ index, gone, names, added, old }) {
  for (const name of new Set([...names, ...added.keys()])) {
    const list = index.get(name) ?? EMPTY_REASSIGNMENTS;
    const at = list.findIndex(node => gone.has(node));
    const kept = at === -1 ? list : list.filter(node => !gone.has(node));
    const fresh = (added.get(name) ?? EMPTY_REASSIGNMENTS).filter(node => !kept.includes(node));
    if (kept === list && !fresh.length) continue;
    let place = at === -1 ? kept.length : at;
    if (at === -1 && hasRange(old)) {
      const later = kept.findIndex(node => hasRange(node) && node.start > old.start);
      if (later !== -1) place = later;
    }
    const next = [...kept.slice(0, place), ...fresh, ...kept.slice(place)];
    if (next.length) index.set(name, next);
    else index.delete(name);
  }
}

// the subtrees at `paths` joining the built indexes over this part of the tree: the write-path indexes of
// the root and the owner at `ownerPath`, the parent and value-flow indexes of every node above `holder`.
// answers the paths of the writes standing in them
function joinSideIndexes({ holder, ownerPath, paths }) {
  const writePaths = new Map();
  function add(path) {
    if (!writePaths.has(path.node)) writePaths.set(path.node, path);
  }
  for (const path of paths) {
    const visitors = writePathVisitors(add);
    // the path itself first: the walk below enters its children alone
    visitors[path.node.type]?.(path);
    path.traverse(visitors);
  }
  for (const owner of [rootPathOf(holder), ownerPath]) {
    const known = ownerWritePathIndexCache.get(owner);
    if (known) for (const [node, path] of writePaths) if (!known.has(node)) known.set(node, path);
  }
  for (let p = holder; p?.node; p = p.parentPath) {
    const parents = ownerParentIndexCache.get(p.node);
    if (parents) for (const path of paths) locateThroughPath(parents, p.node, path);
    const flow = valueFlowOwnerIndexCache.get(p.node);
    if (flow) for (const path of paths) indexValueFlow(flow, path.node);
  }
  return writePaths;
}

// the nodes from the owner at `ownerPath` down to the one at `path`, or null where `path` stands outside it
function framesDownTo(ownerPath, path) {
  const frames = [];
  for (let p = path; p?.node; p = p.parentPath) {
    frames.push(p.node);
    if (p.node === ownerPath.node) return frames.reverse();
  }
  return null;
}

// where the live tree parted from the chain of `slotPath`, the path the write `retired` stood at: the
// highest link whose parent no longer holds it - a node removed from its list, or swapped in a field the
// parent still has - or whose parent path holds another node than the one it was set up under, babel
// swapping a node in place under its path. the write's own path is the lowest slot, and the one a chain the
// tree still holds answers: the write a render rewrote in place, its node kept. answers the slot and the
// node it held then
function renderedSlot(slotPath, retired) {
  let found = { slot: slotPath, old: retired };
  for (let child = slotPath, below = null; child?.parentPath; below = child, child = child.parentPath) {
    const parent = child.parentPath;
    if (child.parent && child.parent !== parent.node) found = { slot: parent, old: child.parent };
    else if (!parent.node || !nodeHoldsChild(parent.node, child.node)) {
      // babel empties a removed path; the path below it still names the node it held
      found = { slot: child, old: child === slotPath ? retired : child.node ?? below.parent ?? null };
    }
  }
  return found;
}

// the paths standing in `slot` now: the node in its field, or the run of its list standing where `old`
// stood - the node babel swapped in place under the slot's path, else the node nearest the slot's index
// within `old`'s span, else the first minted one from that index on (a render inserting ahead of the slot
// shifts it forward), with each neighbour minted or within that span. an empty run where nothing stands
// there now. The parent owns the current list: a render may replace the array while an old
// child path still carries the retired one in `container`.
function pathsInSlot(slot, old) {
  const holder = slot.parentPath;
  if (!Array.isArray(slot.container)) return isASTNode(holder.node[slot.key]) ? [holder.get(slot.key)] : [];
  const list = holder.node[slot.listKey];
  function within(node) {
    return isASTNode(node) && nodeRangeContains(old, node);
  }
  function stood(node) {
    return standsFor(node, old);
  }
  let at = list[slot.key] === slot.node && slot.node !== old ? slot.key : -1;
  for (let offset = 0; at === -1 && offset < list.length + slot.key; offset++) {
    if (within(list[slot.key - offset])) at = slot.key - offset;
    else if (within(list[slot.key + offset])) at = slot.key + offset;
  }
  for (let i = slot.key; at === -1 && i < list.length; i++) if (stood(list[i])) at = i;
  return at === -1 ? [] : runAround(slot, at, stood);
}

// the path of the nearest statement in a statement list at or above `path`, below the owner at `ownerPath` that
// `path` stands under, or null where none stands between them: the owner itself holds a slot in the head of the
// loop its binding is scoped to, and the statements around it stand outside its scan
function statementPathAbove(path, ownerPath) {
  for (let p = path; p.node !== ownerPath.node; p = p.parentPath) {
    if (statementListOf(p.parentPath.node) === p.container) return p;
  }
  return null;
}

// the paths of the statements a render put right before or after `statement` (`standsFor`)
function mintedAround(statement) {
  const list = statement.parentPath.node[statement.listKey];
  const at = list[statement.key] === statement.node ? statement.key : list.indexOf(statement.node);
  return at === -1 ? [] : runAround(statement, at, node => standsFor(node, statement.node)).filter(path => path.node !== statement.node);
}

// does `node` stand where a render rewrote `old`: minted with no source span, or with one taken over from inside
// `old`'s (a write a render mints for a pattern's leaf carries the leaf's span)
function standsFor(node, old) {
  return isASTNode(node) && (!hasRange(node) || nodeRangeContains(old, node));
}

// the paths of the run in the list holding `path` that reaches out from index `at` over the neighbours `holds`
// accepts
function runAround(path, at, holds) {
  const list = path.parentPath.node[path.listKey];
  let from = at;
  let to = at + 1;
  while (from > 0 && holds(list[from - 1])) from--;
  while (to < list.length && holds(list[to])) to++;
  const paths = [];
  for (let i = from; i < to; i++) paths.push(path.getSibling(i));
  return paths;
}

// the scans a retired write of the binding declared at `declarationPath` stands in, dropped whole where
// its slot cannot be read again (`refreshedScanWrites`): those of the declaration's own scopes, up to
// the var-scope owner every write of it sits under
function invalidateWriteScans(declarationPath) {
  const owner = findNearestVarScopeOwner(declarationPath)?.node;
  for (let p = declarationPath; p?.node; p = p.parentPath) {
    scopeReassignCache.delete(p.node);
    ownerParentIndexCache.delete(p.node);
    valueFlowOwnerIndexCache.delete(p.node);
    if (p.node === owner) break;
  }
}

// a scope's own record (`binding.constantViolations`, the tracker's write paths) holding a write a render
// retired, read again: the live writes of its scan (`refreshedScanWrites`) as paths - those a refresh
// found, the record's own, the root's write index - or null for a record holding none or one no read follows.
// a render that MOVES a write keeps its node and leaves the record's path climbing the chain it left, so a
// record path is taken only while its chain is the live tree's, the index's (which a refresh re-points) else
// (`writesPastCeiling`)
function liveRecordWrites({ binding, name, usePath }) {
  const record = binding.constantViolations;
  if (!binding.path?.node || !record?.length || writesPastCeiling(record)) return null;
  writeLookupSerial++;
  const rootPath = rootPathOf(usePath);
  if (!holdsRetiredWrite(record, rootPath, name)) return null;
  const ownerPath = writeScanOwner({ kind: binding.kind, bindingPath: binding.path, anchorPath: usePath, name })?.owner
    ?? binding.scope?.path;
  if (!ownerPath?.node) return null;
  const { writes, paths } = refreshedScanWrites({ ownerPath, name, rootPath, declarationPath: binding.path });
  const recorded = new Map(record.map(write => [violationNode(write), write]));
  const indexed = ownerWritePathIndex(rootPath);
  const declaration = binding.path.node;
  function attached(path) {
    return path && !ancestorChainDetached(path) ? path : null;
  }
  return writes.filter(node => node !== declaration)
    .map(node => paths.get(node) ?? attached(recorded.get(node)) ?? indexed.get(node) ?? recorded.get(node) ?? node);
}

// the canonical writes of a binding (`recomputedBindingWrites`) as the LIVE tree holds them: both
// emitters render a pattern write by replacing it, and a write scan built before that keeps handing the
// replaced node out, detached, so a climb from it misses each guard above its slot (`c && ({ Set: S } =
// g)` reads as an unconditional write) or finds no owner. a list holding one is read again where the
// render left its slot (`refreshedScanWrites`); the scope's own record is the lookup's
// (`wrapScopeBindingLookup`). a list no read follows (`writesPastCeiling`) is handed on as it stands
export function liveBindingWrites({ binding, name, usePath }) {
  function recompute() {
    return recomputedBindingWrites({ kind: binding.kind, bindingPath: binding.path, usePath, name, fallback: binding.constantViolations });
  }
  const writes = recompute();
  if (writesPastCeiling(writes)) return writes;
  const ownerPath = usePath && writes?.length
    ? writeScanOwner({ kind: binding.kind, bindingPath: binding.path, anchorPath: usePath, name })?.owner : null;
  if (!ownerPath) return writes;
  const rootPath = rootPathOf(usePath);
  writeLookupSerial++;
  if (!scanHoldsStaleWrite(writes, name, rootPath)) return writes;
  refreshedScanWrites({ ownerPath, name, rootPath, declarationPath: binding.path });
  return recompute();
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
  if (writesPastCeiling(binding?.constantViolations)) return false;
  const own = bindingDeclaratorNode(binding);
  // a `var` binding's violation record is parser-UNEVEN for for-x heads: babel records the
  // init-less head declarator, estree records nothing at all - so the recorded-violation
  // count alone under-poisons a rebound alias on the estree side. recover the canonical
  // function-scope write set from the AST (it sees for-x heads on both parsers) and take
  // the larger count; the recovered set excludes the binding's own declarator by identity.
  // a synthetic (path-less) binding already carries that canonical set as its violations
  const aliasName = bindingBoundName(binding);
  const canonicalWrites = binding?.kind === 'var' && binding?.path && aliasName
    ? scannedWrites(findVarOwnerDeclaring(binding.path, aliasName), aliasName)
      .filter(node => isRealReassignment(node, own, aliasName)).length
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
    .filter(v => isRealReassignment(v, own, name));
}

// neither of the two self-records above is a write of the binding: the loop-reinit declarator and
// the identity self-assign. ONE spelling of that pair - the two consumers below read the same set
function isRealReassignment(v, own, name) {
  return !isDeclaratorSelfViolation(v, own) && !isIdentitySelfAssignViolation(v, name);
}

// estree-toolkit records a loop head's per-iteration rebind as a violation of the head's OWN
// binding: a bare id head via the id node, a DESTRUCTURING declarator via the bound identifier
// INSIDE its own pattern - climb pattern shells to the declarator to recognise the latter; the
// canonical scan records it as the for-x STATEMENT whose head holds the declarator, babel as the
// declarator itself (and babel files a `var` redeclaring a parameter the same way). a declaration
// is not a reassignment of itself, whichever node spells it - nor, for a binding the emitters MOVE
// onto other declarators, of the binding that declaration now stands for
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
// read - and every for-init DESTRUCTURED alias - through the flow-sensitive walks as "reassigned".
// asked per USE by the flow-sensitive walks, yet a fact of the write SET - so it is kept against the
// violations array, which the adapters hand back unchanged while rebuilding the binding object
// around it. no consumer mutates the list. the two facts the exclusions read are key dimensions over
// that array, not constants of it: one binding reaches here in several shapes, and a path-less one
// names no declarator while a pattern-bound one names no bound name. an empty list is never a key: the
// recomputed writes of a name with none are one shared array, which no file outlives
const reassignmentNodesCache = new WeakMap();
function reassignmentNodesBeyondDeclarator(binding) {
  return reassignmentNodesMemo(binding)?.nodes ?? [];
}
function reassignmentNodesMemo(binding) {
  const violations = binding.constantViolations;
  if (!violations?.length) return null;
  const own = bindingDeclaratorNode(binding);
  const name = bindingBoundName(binding);
  let byOwner = reassignmentNodesCache.get(violations);
  if (!byOwner) reassignmentNodesCache.set(violations, byOwner = new Map());
  const memo = byOwner.get(own);
  if (memo && memo.name === name) return memo;
  const nodes = violations.filter(v => isRealReassignment(v, own, name)).map(violationNode);
  const fresh = { name, nodes, writes: null };
  byOwner.set(own, fresh);
  return fresh;
}

// ... and the path the record names one of those nodes by, which places a write the node alone cannot
// (`writeNeverRuns`): the node itself where the record names it by none
const recordPathsCache = new WeakMap();
function recordedWrite(binding, node) {
  const violations = binding.constantViolations;
  if (!violations?.length) return node;
  let paths = recordPathsCache.get(violations);
  if (!paths) recordPathsCache.set(violations, paths = new Map(violations.map(v => [violationNode(v), v])));
  return paths.get(node) ?? node;
}

// the node types whose value never stands for a global - a primitive (beside `PRIMITIVE_LITERAL_TYPES`), a
// fresh object, function or class, an operator's result: a census reading values names a global only off a
// reference, a call or a spelling handing on another position's value (`writtenValueGlobals`)
const NO_GLOBAL_VALUE_TYPES = new Set([
  'TemplateLiteral',
  'ObjectExpression',
  'ArrayExpression',
  'FunctionExpression',
  'ArrowFunctionExpression',
  'ClassExpression',
  'NewExpression',
  'UnaryExpression',
  'BinaryExpression',
  'UpdateExpression',
]);

// does the value arm `node`, unwrapped, never stand for a global: none at all, `undefined`, a primitive literal,
// or a value of the types above?
export function standsForNoGlobal(node) {
  return !node || isUndefinedNode(node) || PRIMITIVE_LITERAL_TYPES.has(node.type) || NO_GLOBAL_VALUE_TYPES.has(node.type);
}

// does no value the declared `binding` holds stand for a global? its init and every plain write hold arms that
// stand for none (`standsForNoGlobal`), or reads off the binding itself, which name a global only through another
// of its values (`let node = null; ... node = new Node(node); ... node = node.parent`) - so which write reaches a read decides
// nothing, and a resolver answers before settling it. a declarator with no init may take its value from
// elsewhere - a for-x head binds what the loop iterates - and a write read other than plainly - through a
// pattern, a for-x head, a re-declaration - may hold anything
export function bindingHoldsNoGlobal(binding) {
  const declarator = bindingDeclaratorNode(binding);
  const name = declarator?.id?.type === 'Identifier' ? declarator.id.name : null;
  if (!name || !declarator.init) return false;
  function holdsNone(value) {
    return flattenBranchingValueNodes([value], { andRightOnly: true }).every(arm => {
      const node = unwrapRuntimeExpr(arm);
      return standsForNoGlobal(node) || readsOffBindingItself(node, name);
    });
  }
  if (!holdsNone(declarator.init)) return false;
  const ownerNode = binding.scope?.block ?? binding.scope?.path?.node ?? null;
  return reassignmentNodesBeyondDeclarator(binding).every(write => {
    if (write.type === 'UpdateExpression') return true;
    // estree-toolkit records the target identifier of the write
    const assignment = write.type === 'AssignmentExpression' ? write
      : write.type === 'Identifier' && ownerNode ? enclosingValueFlowAssignment(write, ownerNode) : null;
    if (unwrapRuntimeExpr(assignment?.left)?.type !== 'Identifier') return false;
    // an arithmetic compound stores a number or a string
    return !VALUE_FLOW_ASSIGN_OPS.has(assignment.operator) || holdsNone(assignment.right);
  });
}

// does `arm` - an arm of a value the binding named `name` is declared or written with, spelled in that very
// declaration or write, where the name is the binding the write targets - read a slot off the binding itself
// (`node = node.prev`)? such a value names a global only through a slot of another of the binding's values
export function readsOffBindingItself(arm, name) {
  const node = unwrapRuntimeExpr(arm);
  const root = isMemberAccessNode(node) ? runtimeChainRoot(node) : null;
  return root?.type === 'Identifier' && root.name === name;
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
// reassignmentNodesBeyondDeclarator, and a write in an arm the build never takes (`writeNeverRuns`)
export function reassignBailApplies({ binding, adapter, path, usageNode = null, afterNode = null }) {
  const method = adapter?.method;
  if (method !== 'usage-global' && method !== 'usage-pure' || writesPastCeiling(binding.constantViolations)) return true;
  // both arms thread `usageNode` (an alias hop's / destructure capture's read site): a write after
  // that read neither dominates it (global) nor reaches the value captured there (pure) - without
  // the anchor, pure bails a provably-live init whose only writes flip the key AFTER the capture
  if (method === 'usage-pure') return reassignmentReachesUsage({ binding, adapter, path, usageNode });
  return reassignmentDominatesUsage({
    reassignmentNodes: liveReassignmentNodes(binding, path, adapter), usagePath: path, usageNode, afterNode, adapter,
  });
}

// the writes of `binding` beyond its declarator that may run: a write in an arm the build never takes
// (`writeNeverRuns`) is none
function liveReassignmentNodes(binding, path, adapter) {
  const memo = reassignmentNodesMemo(binding);
  if (!memo || !path) return memo ? [...memo.nodes] : [];
  // the entry the record names each by (`recordedWrite`), taken once per list
  memo.writes ??= memo.nodes.map(node => recordedWrite(binding, node));
  return memo.nodes.filter((node, at) => !writeNeverRuns({ write: memo.writes[at], usagePath: path, adapter }));
}

// may a write of `binding` beyond its declarator reach the read at `path` (`usageNode` the read position)
// - the question usage-pure asks of every alias it resolves, and a served verdict asks in both methods,
// since what a name always holds is what it decides (`servedRead`)
export function reassignmentReachesUsage({ binding, adapter, path, usageNode = null }) {
  return writesPastCeiling(binding?.constantViolations) || !noReassignmentReachesUsage({
    reassignmentNodes: liveReassignmentNodes(binding, path, adapter),
    usagePath: path,
    usageNode,
    bindingScopeNode: binding?.scope?.block ?? binding?.scope?.path?.node ?? null,
    bindingAnchor: bindingLoopAnchor(binding),
  });
}

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

// for the sibling resolvers that need a flow-sensitive reassignment check (not a flat
// `binding.constantViolations?.length`): returns whether the reassignment should block resolution.
// false when there is no reassignment; otherwise delegates to the method-aware `reassignBailApplies`.
// (resolveVariableBindingToGlobal uses isReassignedBeyondDeclarator + reassignBailApplies instead - it
// excludes the loop-reinit declarator-self for BOTH methods, where these sites keep the conservative
// flat bail off-global)
export function reassignmentBlocksGlobalResolve({ binding, adapter, path, usageNode = null, afterNode = null }) {
  return !!binding.constantViolations?.length && reassignBailApplies({ binding, adapter, path, usageNode, afterNode });
}

// the climb below is asked of every native binding on every lookup, so it runs once per binding object
const varScopeBlockOfBindingCache = new WeakMap();

// if this native scope binding is declared inside a block owning a var scope - a namespace / declare-global
// body (a TSModuleBlock - `namespace N { ... }` / `declare global { ... }`) or a class static block - with no
// function nearer, return that block node; else null. a declaration in a block nested there answers the same
// block: a `var` is that block's, and a lexical one sits inside it all the same, though its own block, which
// both trackers scope, is nearer. estree-toolkit's scope tracker gives neither block a scope of its own: it
// over-hoists EVERY namespace binding - var/let/const, class, function - to the enclosing function / program
// scope and files a static block's on the class scope, so its `scope.hasBinding` falsely reports a shadow
// for a use-site OUTSIDE the block. callers re-validate position so the block-local binding only shadows
// references that actually sit inside the block. requires the binding's `path` to expose `parentPath`
// (estree-toolkit native bindings do)
export function varScopeBlockOfBinding(binding) {
  const decl = binding?.path;
  if (!decl?.parentPath) return null;
  if (varScopeBlockOfBindingCache.has(binding)) return varScopeBlockOfBindingCache.get(binding);
  // start ABOVE the declaration so we classify the scope that CONTAINS it: its nearest enclosing
  // var-scope owner is the block only when the binding is declared in the block's body (a
  // function-scoped declaration resolves to a function-like / Program owner)
  const owner = findNearestVarScopeOwner(decl.parentPath);
  const block = owner?.node.type === 'TSModuleBlock' || owner?.node.type === 'StaticBlock' ? owner.node : null;
  varScopeBlockOfBindingCache.set(binding, block);
  return block;
}

// Locate a runtime position through inline-array spreads. Coordinates are the raw index at
// each nested list, from the outer argument/element list to the selected value. An opaque
// spread blocks positions at or after it; earlier positions remain exact. Holes occupy a slot.
export function resolveCallArgumentCoords(args, index, staticIsMutated = null) {
  const stack = [{ list: args, next: 0 }];
  const coords = [];
  let effective = 0;
  while (stack.length) {
    const frame = stack.at(-1);
    if (frame.next === frame.list.length) {
      stack.pop();
      coords.pop();
      continue;
    }
    const slot = frame.next++;
    const arg = frame.list[slot];
    if (arg?.type === 'SpreadElement') {
      if (staticIsMutated?.('Array.prototype', 'Symbol.iterator')) return null;
      const spread = unwrapRuntimeExpr(arg.argument);
      if (spread?.type !== 'ArrayExpression') return null;
      coords.push(slot);
      stack.push({ list: spread.elements, next: 0 });
    } else if (effective++ === index) return [...coords, slot];
  }
  return null;
}

// Resolve the node at a runtime position with the same coordinates as path consumers.
export function resolveCallArgument(args, index, staticIsMutated = null) {
  const coords = resolveCallArgumentCoords(args, index, staticIsMutated);
  if (!coords) return null;
  let node = args[coords[0]];
  for (const slot of coords.slice(1)) node = unwrapRuntimeExpr(node.argument).elements[slot];
  return node;
}

// Count the whole expanded list. Unlike a positional read, any opaque spread prevents an answer.
export function effectiveArgsLength(args, staticIsMutated = null) {
  let length = 0;
  for (const arg of args) {
    if (arg?.type === 'SpreadElement') {
      if (staticIsMutated?.('Array.prototype', 'Symbol.iterator')) return null;
      const spread = unwrapRuntimeExpr(arg.argument);
      if (spread?.type !== 'ArrayExpression') return null;
      const nested = effectiveArgsLength(spread.elements, staticIsMutated);
      if (nested === null) return null;
      length += nested;
    } else length++;
  }
  return length;
}

// peel runtime wrappers and a comma-sequence tail off a node, so `(0, Object)` and `(eff(), Reflect)`
// reach the bare identifier
export function peelToBareExpr(node) {
  return peelSequenceTail(unwrapRuntimeExpr(node), { step: unwrapRuntimeExpr });
}

// Read a spread array as a complete positional list. Opaque spreads make that list unknown,
// even when individual positions before them could still be resolved.
function inlineArrayElements(node, staticIsMutated = null) {
  const array = unwrapRuntimeExpr(node);
  return array?.type === 'ArrayExpression' ? positionalElements(array.elements, staticIsMutated) : null;
}

// a pairing whose arguments come out of an ARRAY the call spreads - `f.apply(t, a)` and
// `Reflect.apply(f, t, a)`. an array the walk cannot read leaves the list UNDECIDED, which is not
// the same fact as an empty one: a consumer recording what a call installs owes nothing either way,
// but one PROVING that no argument reaches a slot must refuse an undecided list, and the list alone
// cannot tell them apart
function spreadArrayPairing(callee, arrayNode, thisArg, staticIsMutated) {
  const array = unwrapRuntimeExpr(arrayNode);
  // Keep source positions when ES spread cannot be expanded. A positional reader may
  // still prove an earlier slot; an opaque array-like has no source list at all.
  const elements = array?.type === 'ArrayExpression' && staticIsMutated?.('Array.prototype', 'Symbol.iterator')
    ? array.elements : inlineArrayElements(arrayNode);
  return { callee: peelToBareExpr(callee), args: elements ?? [], argsUnknown: elements === null, thisArg };
}

// A caller's scoped entry proof takes precedence over the program's import table.
function invocationEntryOf(bound, programNode, getCalleeEntry) {
  if (getCalleeEntry) return getCalleeEntry(bound);
  return bound?.type === 'Identifier' && programNode ? pureImportEntryOfProgram(programNode, bound.name) : null;
}

// the function a call-like host invokes and the arguments that land in its parameters - the ONE
// invocation canon, asked by every consumer of a call: the escape census, the inline-callee walk on
// the receiver side, the mutation pairing and the type engine's caller census, so an invoker
// spelling reads alike wherever a call is read. a TAGGED TEMPLATE is such a host: its first
// parameter takes the strings array - the quasi itself - and the interpolations follow. the
// RECEIVER INVOKERS name their function one hop further in - `f.call(t, x)` and `f.apply(t, [x])`
// invoke F, not a method called `call`, so the receiver slot comes off the list into `thisArg`;
// `Reflect.apply` spells the same call with the function in the first slot, and a `bind` invoked on
// the spot prepends the arguments it captured
// the CALLEE comes back peeled to the bare expression it invokes, so an identity compare against a
// candidate node answers alike whichever wrapper - a paren, a TS cast, a sequence whose tail is the
// function - the source spelled around it.
// With a changed Array iterator, an inline apply array keeps its raw ES spreads.
// Positional readers use the same callback and can still answer before a spread.
// `argsUnknown` marks the pairings whose ARGUMENT LIST is not statically decidable: an unreadable
// spread array, and a receiver slot holding a SPREAD - dropping the receiver by position cannot
// know how many arguments that spread put ahead of it. `nameIsShadowed` is the scope question the
// `Reflect` spelling owes; a caller without a scope passes nothing and over-pairs, the direction a
// census of installed values owes anyway. a consumer that REWRITES arguments also supplies
// `staticIsMutated`: a user-installed invoker may observe those arguments without calling the
// apparent function, so only its pristine form grants that consumer authority. `getCalleeEntry`
// names the pure ENTRY a callee position is bound to - a prior pass or the author replaced the
// member spelling with the helper it imports, in any of its lowered spellings - and the namespace
// binding's `apply` read reaches the same invoker through the entry the ROOT is bound to
export function callPairing(node, programNode = null, options = {}) {
  let pairing = directCallPairing(node, programNode, options);
  for (let next; pairing && (next = composedInvocation(pairing, options.staticIsMutated));) pairing = next;
  return pairing;
}

// the invocation a BIND defers: `f.bind(t, x)` runs `f` with the receiver `t` and `x` ahead of whatever
// the bound function is later called with - null for any other node
export function boundInvocation(node, staticIsMutated = null) {
  if (node?.type !== 'CallExpression') return null;
  const inner = peelToBareExpr(node.callee);
  if (!isMemberAccessNode(inner) || memberKeyName(inner) !== 'bind' || staticIsMutated?.('Function.prototype', 'bind')) return null;
  const captured = node.arguments ?? [];
  return {
    callee: peelToBareExpr(inner.object), args: captured.slice(1), argsUnknown: captured[0]?.type === 'SpreadElement', thisArg: captured[0],
  };
}

// ... and where the invoked value is itself an invoker: a bound function runs its target with the
// receiver the bind fixed, whatever receiver the outer invoker passes, and `call` / `apply` handed a
// receiver run THAT receiver - `Function.prototype.call.call(f, t)` is `f.call(t)`
function composedInvocation({ callee, args, argsUnknown, thisArg }, staticIsMutated) {
  const bound = boundInvocation(callee, staticIsMutated);
  if (bound) return { ...bound, args: [...bound.args, ...args], argsUnknown: bound.argsUnknown || !!argsUnknown };
  if (!isMemberAccessNode(callee) || !thisArg || thisArg.type === 'SpreadElement' || argsUnknown) return null;
  const key = memberKeyName(callee);
  if (key === 'call' && !staticIsMutated?.('Function.prototype', 'call')) {
    return { callee: peelToBareExpr(thisArg), args: args.slice(1), argsUnknown: args[0]?.type === 'SpreadElement', thisArg: args[0] };
  }
  return key === 'apply' && !staticIsMutated?.(
    'Function.prototype',
    'apply',
  ) ? spreadArrayPairing(thisArg, args[1], args[0], staticIsMutated) : null;
}

function directCallPairing(node, programNode, { nameIsShadowed = null, staticIsMutated = null, getCalleeEntry = null }) {
  if (node.type === 'TaggedTemplateExpression') {
    return { callee: peelToBareExpr(node.tag), args: [node.quasi, ...node.quasi.expressions] };
  }
  if (node.type !== 'CallExpression' && node.type !== 'OptionalCallExpression' && node.type !== 'NewExpression') return null;
  const args = node.arguments ?? [];
  const callee = peelToBareExpr(node.callee);
  if (invocationEntryOf(
    callee,
    programNode,
    getCalleeEntry,
  ) === 'reflect/apply') return spreadArrayPairing(args[0], args[2], args[1], staticIsMutated);
  if (callee?.type === 'MemberExpression' || callee?.type === 'OptionalMemberExpression') {
    const key = memberKeyName(callee);
    const target = peelToBareExpr(callee.object);
    if (key === 'apply' && target?.type === 'Identifier' && target.name === 'Reflect' && !nameIsShadowed?.('Reflect', target)
      && !staticIsMutated?.('Reflect', 'apply')) {
      return spreadArrayPairing(args[0], args[2], args[1], staticIsMutated);
    }
    if (key === 'apply' && invocationEntryOf(target, programNode, getCalleeEntry) === 'reflect') {
      return spreadArrayPairing(args[0], args[2], args[1], staticIsMutated);
    }
    if (key === 'call' && !staticIsMutated?.('Function.prototype', 'call')) {
      return {
        callee: peelToBareExpr(callee.object), args: args.slice(1), argsUnknown: args[0]?.type === 'SpreadElement', thisArg: args[0],
      };
    }
    if (key === 'apply' && !staticIsMutated?.(
      'Function.prototype',
      'apply',
    )) return spreadArrayPairing(callee.object, args[1], args[0], staticIsMutated);
  }
  return { callee, args };
}

// does ONE argument list put a real value in the parameter's slot at `argIndex`? a missing slot and
// an `undefined` / `void` argument both leave the default standing. the wrappers a source may spell
// around the argument (`(undefined)`, `undefined as any`, `undefined!`) leave the VALUE alone, and
// only one leg's parser keeps a paren as a node - reading the raw slot answers "a real arg" for the
// paren dialect and "the default" for the other on one source, and costs the narrow on both TS
// spellings. a spread at or before the slot can supply the param from the spread iterable, so it
// counts as an override, matching the arg->param spread guard in resolveDirectParam /
// paramHasOverridingArg. `undefinedShadowed` answers whether a binding hides the global `undefined`
// at the call - a shadowed name is a real value. one answer for the type resolver's call-site scan
// and the destructure dispatches' caller-lossiness gate
export function argumentOverridesSlot(args, argIndex, undefinedShadowed, staticIsMutated = null) {
  const arg = resolveCallArgument(args, argIndex, staticIsMutated);
  if (!arg) return effectiveArgsLength(args, staticIsMutated) === null
    && !resolveCallArgumentCoords(args, argIndex, staticIsMutated);
  const value = unwrapRuntimeExpr(arg);
  if (isVoidExpression(value)) return false;
  return !(isBareUndefinedIdentifier(value) && !undefinedShadowed(value));
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
  // the canon peels only the wrappers that leave the invoked value unchanged - a UnaryExpression on
  // the callee path (`(!fn)(...)`) invokes the BOOLEAN, so the runtime call throws before any param
  // binds. NewExpression accepted: receiver-substitution still wires the polyfill into the call-arg
  // slot even when `new` would throw at runtime. a tagged template passes its strings array and
  // interpolations, not the positional list the consumers read, so it is no call site here
  const callPath = immediateInvocationOf(fnParentPath);
  return callPath && isIifeCallNode(callPath.node) ? { callPath, paramIndex } : null;
}

// node-form helper for resolution-layer use: returns the IIFE caller-arg node bound to
// `paramNode`, or null when the call isn't an IIFE invoking THIS function. handles `...[lit]`
// inline-array spread via `resolveCallArgument`. for synth-swap (path-form) callers, use
// `findIifeCallSite` directly and walk the args paths
// ... and a DEFAULTED param reads the argument only where the call really overrides the default:
// an absent / `undefined` / `void` slot runs the default, which is then the receiver the pattern
// reads (`(({ Array: { of } } = globalThis) => ...)(undefined)` reads `globalThis.Array.of`) - the
// shared slot rule, so every lifter of the argument answers as the call-site scans do
export function findIifeArgForParam(fnParentPath, paramNode, staticIsMutated = null) {
  const site = findIifeCallSite(fnParentPath, paramNode);
  if (!site) return null;
  const args = site.callPath.node.arguments ?? [];
  if (paramNode.type === 'AssignmentPattern'
    && !argumentOverridesSlot(args, site.paramIndex, () => !!site.callPath.scope?.getBinding?.('undefined'), staticIsMutated)) return null;
  return resolveCallArgument(args, site.paramIndex, staticIsMutated);
}

// the argument PATH a `resolveCallArgumentCoords` coordinate names among a call's argument paths:
// the raw slot, or the element of the inline array its spread expands - stepped into THROUGH the
// transparent wrappers the array may wear (`f(...([a, b] as any))`), the way the coordinate was
// derived. the ONE materialisation for every consumer that walks a path from a coordinate. NO
// trailing peel: babel unwraps a sequence tail, unplugin peels transparent wrappers, and baking
// either one in here would impose it on the other
export function callArgumentPathAt(argPaths, coords) {
  let path = argPaths[coords[0]];
  for (const slot of coords.slice(1)) {
    path = cachedContainerPaths(peelTransparentWrapperPath(path?.get('argument')), 'elements')[slot];
  }
  return path ?? null;
}

// a positional list read WHOLE at its runtime positions (inline-array spreads expanded, a hole
// null), or null where no static length exists - the list twin of `resolveCallArgument`
export function positionalElements(list, staticIsMutated = null) {
  const elements = [];
  for (const element of list) {
    if (element?.type !== 'SpreadElement') elements.push(element);
    else {
      if (staticIsMutated?.('Array.prototype', 'Symbol.iterator')) return null;
      const nested = inlineArrayElements(element.argument, staticIsMutated);
      if (!nested) return null;
      elements.push(...nested);
    }
  }
  return elements;
}

// the PATH at runtime position `index` of a positional list of paths (call arguments, array-literal
// elements), the coordinate read the way every positional list is read (`resolveCallArgumentCoords`):
// null for a hole, a position past the static length, or a shift no static position survives (a
// spread of a binding at or before it)
export function positionalPathAt(paths, index, staticIsMutated = null) {
  const coords = resolveCallArgumentCoords(paths.map(path => path.node), index, staticIsMutated);
  const path = coords && callArgumentPathAt(paths, coords);
  return path?.node ? path : null;
}

// the same read off an array-literal PATH
export function positionalElementPath(arrayPath, index, staticIsMutated = null) {
  return positionalPathAt(cachedContainerPaths(arrayPath, 'elements'), index, staticIsMutated);
}

// the argument PATH a bare-ObjectPattern IIFE param resolves to: the call site plus the
// coordinate `resolveCallArgumentCoords` addresses it by, materialised as a path. the ONE locator
// both emitters use - a consumer that re-derives the position by an identity scan over the
// arguments diverges from the node form exactly where the two peel differently (a wrapped spread
// array), and silently loses the receiver this resolver found
export function findIifeArgPath(fnParentPath, paramNode, staticIsMutated = null) {
  const site = findIifeCallSite(fnParentPath, paramNode);
  if (!site) return null;
  const coords = resolveCallArgumentCoords(site.callPath.node.arguments ?? [], site.paramIndex, staticIsMutated);
  return coords ? callArgumentPathAt(site.callPath.get('arguments'), coords) : null;
}

// `import type X = require(...)` is type-only - elided by tsc before runtime, references
// resolve to the global. babel scope tracker registers the binding regardless of modifier;
// callers use this predicate to filter out type-only bindings from shadow checks
export function isTypeOnlyImportEquals(node) {
  return node?.type === 'TSImportEqualsDeclaration' && node.importKind === 'type';
}

// peel nested LabeledStatement wrappers off a path: `outer: inner: if (...) ...` stacks two layers,
// and guard / mutation detection cares only about the wrapped statement. walks `.get('body')` rather
// than `.body` because every caller retains path access for scope and source mutations
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
      // loop-head hosts cannot take a preceding extraction statement (the header forbids it:
      // babel's insert crashed on scope re-registration, unplugin's produced two `const`
      // statements inside the parens) - a for-INIT slot routes to the cascade flatten, whose
      // sibling-sink machinery already handles loop headers, and a for-x LEFT to the head mirror
      // (`forOfHeadIterableElements`), which rewrites the iterated literal's elements in place
      const declarationNode = parent.parentPath?.node;
      const loop = parent.parentPath.parentPath?.node;
      const isLoopHead = declarationNode?.type === 'VariableDeclaration'
        && ((loop?.type === 'ForStatement' && loop.init === declarationNode)
          || ((loop?.type === 'ForOfStatement' || loop?.type === 'ForInStatement') && loop.left === declarationNode));
      return { declarator: parent, needsResidualExtraction: needsResidualExtraction && !isLoopHead };
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
// so it answers only when every element reads the SAME on every pass: one identifier (a proxy
// global, a constructor, any binding - the same name under one iterable expression is one value),
// or a literal container spelling the same keys and positions over such leaves - which
// makes the head's claim resolve to the same static on every pass, while the RENDER still mirrors
// each element on its own, so nothing is shared between the passes but the answer.
// a HOLE has no element to read (its `undefined` must keep throwing natively) and an opaque SPREAD hides
// what the pattern will see; for-IN is out (it binds the key, never the element), and so is
// for-await (the head awaits what the literal holds, which is not the node written there)
// `sameCallee`: for a reader that RESOLVES the element rather than mirroring it, a call of the same
// named function reads the same on every pass too - its return's static, whatever the arguments
// (`[{ w: e('a') }, { w: e('b') }]`); the mirror never takes that option, a call holds no literal
export function forOfHeadElements(declaratorPath, { sameCallee = false } = {}) {
  const elements = forOfHeadIterableElements(declaratorPath);
  if (!elements) return null;
  if (elements.length === 1) return elements;
  return elements.every(element => sameHeadElement(element, elements[0], sameCallee)) ? elements : null;
}

// a slot written as a METHOD, in either parser's spelling
function isHeadMethodSlot(prop) {
  return prop?.type === 'ObjectMethod' ? prop.kind === 'method' : !!prop?.method;
}

// Compare head-element receiver shapes: identifiers/proxy globals and matching container slots.
// Primitive values are interchangeable for this shape test. With `sameCallee`, also admit
// same-named calls whose arguments match recursively, and corresponding literal method slots.
// This is a receiver-shape check, not runtime value equality.
function sameHeadElement(rawNode, rawFirst, sameCallee = false) {
  // read through the transparent wrappers a source may spell (`(Object)`, `Object as any`)
  const node = unwrapRuntimeExpr(rawNode);
  const first = unwrapRuntimeExpr(rawFirst);
  // a primitive slot carries no claim: a number beside a string reads the same to every static
  // below (`{ w: Object, at: 1 }` beside `{ w: Object, at: 's' }`) - asked before the node types
  // are compared, since one parser spells every primitive as `Literal` and the other by kind
  if (PRIMITIVE_LITERAL_TYPES.has(node?.type) && PRIMITIVE_LITERAL_TYPES.has(first?.type)) return true;
  if (node?.type !== first?.type) return false;
  // the same NAME under one iterable expression is one binding, so it reads the same on every pass;
  // two proxy globals are one object graph to this provider (`[globalThis, self]`)
  if (node.type === 'Identifier') {
    return node.name === first.name || !!(asProxyGlobalName(node.name) && asProxyGlobalName(first.name));
  }
  if (node.type === 'CallExpression') {
    const callee = unwrapRuntimeExpr(node.callee);
    const firstCallee = unwrapRuntimeExpr(first.callee);
    // ... and the ARGUMENTS with the callee: a function handing one of them back reads what THIS call
    // was passed, so two calls of one name agree only where their arguments agree as well. the
    // primitive rule above keeps the shape this option exists for (`e('a')` beside `e('b')`), while a
    // constructor beside a user object now parts them - read as agreeing, the head took the first
    // element's static for every pass and the later element's own value was never read at all
    return sameCallee && callee?.type === 'Identifier' && firstCallee?.type === 'Identifier'
      && callee.name === firstCallee.name && node.arguments.length === first.arguments.length
      && node.arguments.every((argument, index) => sameHeadElement(argument, first.arguments[index], sameCallee));
  }
  if (node.type === 'ArrayExpression') {
    return node.elements.length === first.elements.length
      && node.elements.every((element, index) => !!element && element.type !== 'SpreadElement'
        && sameHeadElement(element, first.elements[index], sameCallee));
  }
  if (node.type === 'ObjectExpression') {
    return node.properties.length === first.properties.length && node.properties.every((prop, index) => {
      const twin = first.properties[index];
      if (spelledSlotName(prop) === null || spelledSlotName(prop) !== spelledSlotName(twin)) return false;
      // a METHOD slot is the one shape whose value is a function with no value NODE to read
      // (`objectPropertyReadValue` declines it, having no expression to hand back). For a reader that
      // RESOLVES the element rather than mirroring it, two method slots of the same name read the same:
      // every claim below the slot reads a function, whatever the body was written to do. Accessors are
      // excluded - what THEY read is whatever the body returns
      if (sameCallee && isHeadMethodSlot(prop) && isHeadMethodSlot(twin)) return true;
      return (prop.type === 'Property' || prop.type === 'ObjectProperty') && prop.type === twin.type
        && !!objectPropertyReadValue(prop)
        && sameHeadElement(prop.value, twin.value, sameCallee);
    });
  }
  return false;
}

// the names each leg's relocation minted for one loop head. WHICH declaration is the moved pattern
// is a fact only the pass that moved it holds: a source `for (const ctor of [Array]) { const { from }
// = ctor; }` wears the same shape, and reading the element through it would take the clouded-alias
// guard off a binding the source, not this pass, named
const relocatedHeadNames = new WeakMap();

export function noteRelocatedHeadName(loopNode, name) {
  if (!loopNode || typeof name !== 'string') return;
  let names = relocatedHeadNames.get(loopNode);
  if (!names) relocatedHeadNames.set(loopNode, names = new Set());
  names.add(name);
}

// a RELOCATED loop head's element: the head binds a minted name and the pattern moved into the body
// as `let <pattern> = <name>` (the body's first statement), so the NAME channel asking that declarator
// for its receiver would read a bare identifier - the iterated literal's element is what the pattern
// reads, exactly as before the move. the type ladder is handed the element's type the same way; this
// is its identity twin, asked by the name channel alone (an emitter rewrite keys on the init as written)
export function relocatedHeadElement(declaratorPath) {
  return headElementThroughName(declaratorPath, false);
}

// ... and the same element for a declaration THIS pass moved, wherever in the body it ended up: an
// emitter that splits an extraction out ahead of the moved pattern leaves it one statement down, and
// the position test above dropped every claim after the first. Position cannot be relaxed for the
// structural reader - a SOURCE `for (const r of [Array]) { const { from } = r; }` wears the same
// shape and owns its own policy - so the registered name is what parts them
export function ownRelocatedHeadElement(declaratorPath) {
  return headElementThroughName(declaratorPath, true);
}

function headElementThroughName(declaratorPath, ownOnly) {
  const node = declaratorPath?.node;
  const init = node?.type === 'VariableDeclarator' ? node.init
    : node?.type === 'AssignmentExpression' && node.operator === '=' ? node.right : null;
  if (init?.type !== 'Identifier') return null;
  const declaration = declaratorPath.parentPath;
  const loop = declaration?.parentPath?.parentPath;
  const left = loop?.node?.left;
  if ((loop?.node?.type !== 'ForOfStatement' && loop?.node?.type !== 'ForInStatement')
    || left?.type !== 'VariableDeclaration' || left.declarations?.length !== 1
    || left.declarations[0].id?.type !== 'Identifier' || left.declarations[0].id.name !== init.name) return null;
  if (ownOnly ? !relocatedHeadNames.get(loop.node)?.has(init.name)
    : loop.node.body?.body?.[0] !== declaration.node) return null;
  return forOfHeadElements(loop.get('left').get('declarations')[0], { sameCallee: true })?.[0] ?? null;
}

// the LOOP a for-x HEAD belongs to, from whichever path a reader holds: the head DECLARATOR
// (`for (const [{ from }] of ...)`), the assignment PATTERN a head with no declaration writes
// (`for ([{ from }] of ...)`), or the loop itself. one normalization, so no reader of a head has to
// know which of the two spellings the source used - the element it reads per pass is the same
export function forXHeadLoopPath(headPath) {
  const node = headPath?.node;
  if (!node) return null;
  if (isForXStatement(node)) return headPath;
  const parent = headPath.parentPath;
  if (isForXStatement(parent?.node) && parent.node.left === node) return parent;
  const loop = parent?.parentPath;
  return parent?.node?.type === 'VariableDeclaration' && isForXStatement(loop?.node)
    && loop.node.left === parent.node ? loop : null;
}

// ... and the same values as a BRANCH SET, making no claim that one receiver answers for the loop:
// each is what the pattern reads on its own pass. an enumerate-every-candidate consumer (usage-global,
// whose contract is inject-if-might) wants all of them where the one above insists on agreement
export function forOfHeadIterableElements(headPath) {
  const loop = forXHeadLoopPath(headPath);
  return loop ? forOfIterableElements(loop.node) : null;
}

// the values an iterated ARRAY LITERAL spells in turn - nothing else makes an iterated value's
// identity provable - or null: an opaque SPREAD hides later positions and takes the whole
// answer away. the literal is read through the transparent wrappers a source may spell (`of ([a])`,
// `of ([a] as const)`) - one parser keeps them, the other drops them, and the loop reads the same
// elements either way. a HOLE stays in its position as `null`: the relocation plan skips it, the
// readers below need every position to hold a node. Inline-array spreads expand by the same
// positional canon as call arguments and array-pattern sources.
export function arrayLiteralIterableElements(node) {
  const literal = unwrapRuntimeExpr(node);
  if (literal?.type !== 'ArrayExpression') return null;
  const elements = literal.elements ?? [];
  return elements.some(element => element?.type === 'SpreadElement') ? positionalElements(elements) : elements;
}

// ... the elements a for-of LOOP iterates, or null: the node-level half every reader of the head
// shares - the path readers above, and the census, which visits the loop node and has no path.
// a HOLE has no element to read; for-await awaits what the literal holds, which is not the node written
export function forOfIterableElements(loopNode) {
  if (loopNode?.type !== 'ForOfStatement' || loopNode.await) return null;
  const elements = arrayLiteralIterableElements(loopNode.right);
  return elements?.length && elements.every(Boolean) ? elements : null;
}

// the nearest for-x LOOP above a read at `path` whose head binds `name` - declares it or assigns it, as a
// name or in a pattern - where the read stands in the loop's BODY, or null: a climb of the read's ancestors,
// with no binding lookup, so a read of any other name costs that climb alone. a read in the head or the
// iterable runs before the head binds the pass's element, and a lexical host between the read and the loop
// rebinding the name takes the read off the head (`lexicalHostRebindsBelow`) - the body may declare it again,
// which one scope tracker files under the loop. whether the read resolves to that head is the caller's to ask
function enclosingForXHeadLoop(name, path) {
  for (let child = path, up = path?.parentPath; up?.node; child = up, up = up.parentPath) {
    if (!isForXStatement(up.node)) continue;
    const { left } = up.node;
    if (left?.type === 'VariableDeclaration' ? declaratorsBindName(left.declarations, name)
      : declaratorBindsName({ id: unwrapRuntimeExpr(left) }, name)) {
      return child.node === up.node.body && !lexicalHostRebindsBelow(name, path, up.node) ? up : null;
    }
  }
  return null;
}

// ... and that head's DECLARATION where the read resolves to it and nothing but the head writes the binding,
// with the inline literal it iterates (`{ loop, declaration, binding, elements }`), or null: a read the head
// bound the pass's element for. an assignment head, a write past the declarator - in the body, in a closure,
// a second head of the same `var` - or a binding the read resolves elsewhere (a parameter, a nested `var`)
// takes the read off it. the literal is asked first: only a head over one pays the binding lookup
export function forOfHeadDeclarationOf(name, { scope, adapter, path }, read = null) {
  const loop = enclosingForXHeadLoop(name, path);
  const declaration = loop?.node.left.type === 'VariableDeclaration' ? loop.get('left').get('declarations')[0] : null;
  const elements = forOfHeadIterableElements(declaration);
  if (!elements) return null;
  const binding = adapter.getBinding?.({ scope, name, path, read });
  return bindingDeclaratorNode(binding) === declaration.node && !isReassignedBeyondDeclarator(binding)
    ? { loop, declaration, binding, elements } : null;
}

// the NODE a destructure host holds as its receiver: the slot's value, or - for a for-x HEAD, whose
// declarator has no slot to hold one - the element the iterated literal spells, or - for an IIFE
// PARAMETER - the argument the call passes at its index (the argument wins over a default, which is
// dead text then; a bare parameter has nothing else to read; `patternNode` names the parameter
// where the host is the function itself). every consumer that reads a host's receiver asks through
// here, so a head or a call argument is a receiver-bearing host everywhere at once rather than in
// whichever walk was taught about it
export function destructureReceiverNode(host, patternNode = null, staticIsMutated = null) {
  const iifeArgument = iifeParameterArgument(host, patternNode, staticIsMutated);
  if (iifeArgument) return iifeArgument;
  // ... and a head that declares NOTHING holds its pattern in the loop's own `left`: no slot exists
  // there either, and what the pattern reads is still the element the iterated literal spells
  if (isForXStatement(host?.node)) {
    return patternNode && host.node.left !== patternNode
      ? null : forOfHeadElements(host, { sameCallee: true })?.[0] ?? null;
  }
  if (host?.node?.type === 'AssignmentPattern' && FUNCTION_LIKE_NODE_TYPES.has(host.parentPath?.node?.type)) {
    const site = findIifeCallSite(host.parentPath, host.node);
    if (site && argumentOverridesSlot(site.callPath.node.arguments ?? [], site.paramIndex,
      () => !!site.callPath.scope?.getBinding?.('undefined'), staticIsMutated)) return null;
  }
  const slot = destructureReceiverSlot(host?.node);
  if (!slot) return null;
  return host.node[slot] ?? forOfHeadElements(host, { sameCallee: true })?.[0] ?? null;
}

function iifeParameterArgument(host, patternNode, staticIsMutated = null) {
  const type = host?.node?.type;
  const fn = type === 'AssignmentPattern' && FUNCTION_LIKE_NODE_TYPES.has(host.parentPath?.node?.type) ? host.parentPath
    : FUNCTION_LIKE_NODE_TYPES.has(type) && patternNode && host.node.params?.includes(patternNode) ? host : null;
  return fn ? findIifeArgForParam(fn, type === 'AssignmentPattern' ? host.node : patternNode, staticIsMutated) : null;
}

// walk a (possibly nested) Object / Array pattern to find the keyPath leading to a leaf Identifier
// named `name`: a key names a property, a position the index it reads (`[, h]` -> `['1']`). peels
// `AssignmentPattern` wrappers (`{key: id = default}`); a REST collects a fresh container, so no
// name under it is a slot of the source. plain-key by default (whatever `plainSynthKeyName` names);
// an optional `ctx` ({ resolveKey, scope, adapter }) resolves COMPUTED keys through the read-side
// key canon (a const-bound `[k]` folds like the literal form; an SE-bearing key bails) - ctx-less
// callers keep the literal-only behaviour, matching `patternSlotValues`' ctx idiom. simpler
// counterpart to pattern-bindings.js's `findDestructuredKeyPath`, whose rest slices the type layer
// resolves on its own
export function patternLiteralKeyPath(pattern, name, ctx = null) {
  if (pattern?.type === 'ArrayPattern') {
    for (let index = 0; index < pattern.elements.length; index++) {
      const element = pattern.elements[index];
      if (!element || element.type === 'RestElement') continue;
      const inner = patternLeafKeyPath(patternSlotTarget(element), name, ctx);
      if (inner) return [String(index), ...inner];
    }
    return null;
  }
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
    const inner = patternLeafKeyPath(patternSlotTarget(prop.value), name, ctx);
    if (inner) return [keyName, ...inner];
  }
  return null;
}

function patternLeafKeyPath(target, name, ctx) {
  if (target?.type === 'Identifier') return target.name === name ? [] : null;
  return patternLiteralKeyPath(target, name, ctx);
}

// does an array-wrap slot (an ObjectPattern directly, or a nested ArrayPattern) bind `name` below
// it? used to locate the positional array-wrap element (`const [{ Array: A }] = [globalThis]`) that
// binds a leaf name before descending into it. peels an `= default` wrapper on the slot
export function arrayWrapSlotBindsName(slot, name, ctx = null) {
  slot = patternSlotTarget(slot);
  if (slot?.type === 'ObjectPattern') return !!patternLiteralKeyPath(slot, name, ctx);
  if (slot?.type === 'ArrayPattern') return (slot.elements ?? []).some(el => el && arrayWrapSlotBindsName(el, name, ctx));
  return false;
}

// Find a destructure receiver in an initializer/default slot, IIFE argument, paired literal
// wrapper or sole inline loop element. Return `{ rhsNode, slot, callPath, paramIndex }`;
// wrapped/loop answers add `hostPath` and `descend` for live path recovery.
// Null means no supported source; the caller decides whether to warn or try another route.
export function resolveFallbackReceiver(wrapperPath, paramNode, staticIsMutated = null) {
  const wrapperNode = wrapperPath?.node;
  if (!wrapperNode) return null;
  // a WRAPPED pattern names no slot of its own: the host's literal pairs its element with the
  // pattern's position (`[{ p }] = [R]`) or its key (`{ w: { p } } = { w: R }`), through every
  // wrapper level and the transparent inner default between (`[{ p } = {}] = [R]` reads R first,
  // the default only where R is undefined) - so the pair is the receiver, and `descend` records
  // the steps for the path companion
  if (wrapperNode.type === 'ArrayPattern' || isPatternPropertyOf(wrapperNode, paramNode)
    || (wrapperNode.type === 'AssignmentPattern' && wrapperNode.left === paramNode
      && (wrapperPath.parentPath?.node?.type === 'ArrayPattern' || isPatternPropertyOf(wrapperPath.parentPath?.node, wrapperNode)))) {
    return resolveWrappedFallbackReceiver(wrapperPath, paramNode, staticIsMutated);
  }
  // an AssignmentPattern that is a function PARAM (`(({p} = D) => body)(R)`) carries the DEFAULT in
  // its `right` slot, but the live call-arg R is the real receiver (the default applies only when no
  // arg is passed). emit-side callers reach this with the AssignmentPattern as the wrapper, so resolve
  // from the IIFE call site via the enclosing function - caller-args-must-win - falling back to the
  // default only when there is no call site. detect-usage passes the function itself and skips this arm
  if (wrapperNode.type === 'AssignmentPattern' && FN_NODE_TYPES.has(wrapperPath.parentPath?.node?.type)) {
    const site = findIifeCallSite(wrapperPath.parentPath, wrapperNode);
    const rhsNode = site ? findIifeArgForParam(wrapperPath.parentPath, wrapperNode, staticIsMutated) : null;
    if (rhsNode) return { rhsNode, slot: null, callPath: site.callPath, paramIndex: site.paramIndex };
    if (site && argumentOverridesSlot(site.callPath.node.arguments ?? [], site.paramIndex,
      () => !!site.callPath.scope?.getBinding?.('undefined'), staticIsMutated)) return null;
    return { rhsNode: wrapperNode.right, slot: 'right', callPath: null, paramIndex: -1 };
  }
  const slot = destructureReceiverSlot(wrapperNode);
  // ... and a for-x HEAD declares no slot value at all: what its pattern reads is the element the
  // iterated literal spells, exactly as the receiver canon answers it. reading the empty slot raw
  // handed every caller a receiver-less descriptor, and a BRANCHING head (`of [flag ? Array : Set]`)
  // fell out of the per-branch channel that is its only route. paired by POSITION off the loop's own
  // `right`, the same step a wrapped array level takes, so the path companion needs nothing new
  const head = slot ? forOfHeadReceiverPair(wrapperPath) : null;
  if (head) {
    return {
      rhsNode: head.node, slot: 'right', callPath: null, paramIndex: -1,
      hostPath: head.loopPath, descend: [{ container: 'elements', coords: head.coords }],
    };
  }
  if (slot && wrapperNode[slot]) return { rhsNode: wrapperNode[slot], slot, callPath: null, paramIndex: -1 };
  const site = findIifeCallSite(wrapperPath, paramNode);
  const rhsNode = site ? findIifeArgForParam(wrapperPath, paramNode, staticIsMutated) : null;
  return rhsNode ? { rhsNode, slot: null, callPath: site.callPath, paramIndex: site.paramIndex } : null;
}

// the head element a declarator's pattern reads, with the loop path that holds it. SOLE elements
// only: the per-branch channel rewrites the receiver where it stands, and a literal spelling two of
// them would leave every later pass reading the one it did not rewrite
function forOfHeadReceiverPair(declaratorPath) {
  // A pattern this pass moved into the body still owns its original element's mirror.
  const relocated = ownRelocatedHeadElement(declaratorPath);
  const loopPath = relocated ? declaratorPath.parentPath?.parentPath?.parentPath : declaratorPath.parentPath?.parentPath;
  const headPath = relocated ? loopPath.get('left').get('declarations')[0] : declaratorPath;
  const elements = forOfHeadElements(headPath, { sameCallee: true });
  if (elements?.length !== 1) return null;
  const iterable = unwrapRuntimeExpr(loopPath?.node?.right);
  if (!isForXStatement(loopPath?.node) || iterable?.type !== 'ArrayExpression') return null;
  const coords = resolveCallArgumentCoords(iterable.elements, 0);
  return coords ? { node: elements[0], loopPath, coords } : null;
}

// is `node` the pattern property (either parser's spelling) whose value is `valueNode`?
function isPatternPropertyOf(node, valueNode) {
  return (node?.type === 'Property' || node?.type === 'ObjectProperty') && node.value === valueNode;
}

// the wrapped arm: climb the wrapper levels to the host, resolve the host's own receiver, then pair
// it level by level - an ARRAY level by position (the canonical index read: an inline-array spread
// expands, any other spread at or before the slot shifts it and the pairing bails), an OBJECT level
// by its plainly spelled key (a computed hop key is no spelling to pair by)
// ... and a pattern with an inner DEFAULT of its own reads that default exactly where the host's
// literal pairs nothing with its slot - the key absent, the array shorter, a hole or an `undefined`
// there, or a slot no literal spells (a spread, a computed key, a getter, an opaque host) - so the
// default is the receiver wherever the pairing fails: rewriting a default's own arms is sound whatever
// the host holds (a present slot never runs it, an outer level read as `undefined` throws before it)
function resolveWrappedFallbackReceiver(wrapperPath, paramNode, staticIsMutated = null) {
  const steps = [];
  let cur = wrapperPath;
  let slotNode = paramNode;
  let ownDefault = null;
  for (;;) {
    const node = cur?.node;
    // an INNER default is stepped through; a host default (a parameter's) is the host itself and
    // answers below through its own arm
    if (node?.type === 'AssignmentPattern' && node.left === slotNode
      && (cur.parentPath?.node?.type === 'ArrayPattern' || isPatternPropertyOf(cur.parentPath?.node, node))) {
      if (!steps.length && !ownDefault) ownDefault = cur;
      slotNode = node;
      cur = cur.parentPath;
      continue;
    }
    if (isPatternPropertyOf(node, slotNode)) {
      const key = node.computed ? null : plainSynthKeyName(node.key);
      if (key === null || cur.parentPath?.node?.type !== 'ObjectPattern') return null;
      steps.unshift({ key });
      slotNode = cur.parentPath.node;
      cur = cur.parentPath.parentPath;
      continue;
    }
    if (node?.type !== 'ArrayPattern') break;
    const index = node.elements.indexOf(slotNode);
    if (index === -1) return null;
    steps.unshift({ index });
    slotNode = node;
    cur = cur.parentPath;
  }
  const host = steps.length ? resolveFallbackReceiver(cur, slotNode, staticIsMutated) : null;
  const unpaired = ownDefault
    ? { rhsNode: ownDefault.node.right, slot: 'right', callPath: null, paramIndex: -1, hostPath: ownDefault } : null;
  // a host with no receiver of its own (a for-x HEAD, whose elements the iterated literal holds)
  // pairs nothing here and proves nothing about the default either: the head's own plan reads
  // the elements, so the answer stays null rather than the default
  // ... save a host no value spells at all - a catch parameter, a parameter no call site fills -
  // where the default is all the source names
  if (!host?.rhsNode) {
    const hostless = cur?.node?.type === 'CatchClause' && cur.node.param === slotNode
      || FUNCTION_LIKE_NODE_TYPES.has(cur?.node?.type) && cur.node.params?.includes(slotNode);
    return hostless ? unpaired : null;
  }
  let { rhsNode } = host;
  const descend = [...host.descend ?? []];
  for (const step of steps) {
    const literal = unwrapRuntimeExpr(rhsNode);
    if (literal?.type === 'ArrayExpression') {
      // an OBJECT-pattern key can still name an array SLOT (`{ 0: { p } } = [R]` reads property '0'
      // off the array, exactly as the language does): the one canonical index read, an INLINE-array
      // spread expanded through the same coordinates as call arguments.
      const index = step.key === undefined ? step.index : canonicalArrayIndex(step.key);
      const coords = index === null ? null : resolveCallArgumentCoords(literal.elements, index, staticIsMutated);
      if (!coords) return unpaired;
      rhsNode = resolveCallArgument(literal.elements, index, staticIsMutated);
      if (!rhsNode || isUndefinedNode(unwrapRuntimeExpr(rhsNode))) return unpaired;
      descend.push({ container: 'elements', coords });
    } else if (step.key === undefined || literal?.type !== 'ObjectExpression') {
      return unpaired;
    } else {
      // the LAST property spelling the key, a DATA one: the mirror swaps the value in place and keeps
      // the level whole, so a spread or a key nothing names standing later overrides the mirrored slot
      // exactly as it overrides the source's - only a getter's body is out of its reach
      const match = literal.properties.findLast(prop => prop?.type !== 'SpreadElement' && spelledSlotName(prop) === step.key);
      if (!match || objectPropertyReadValue(match) !== match.value) return unpaired;
      rhsNode = match.value;
      descend.push({ container: 'properties', index: literal.properties.indexOf(match) });
    }
  }
  return { ...host, rhsNode, hostPath: host.hostPath ?? cur, descend };
}

// path-form companion of `resolveFallbackReceiver` for AST-mutation callers (babel's
// synth-swap registers via NodePath). adapter-agnostic - both babel NodePath and
// estree-toolkit Path expose `.get(key)` / `.get('arguments')[index]`
export function resolveFallbackReceiverPath(wrapperPath, paramNode, staticIsMutated = null) {
  const desc = resolveFallbackReceiver(wrapperPath, paramNode, staticIsMutated);
  if (!desc) return null;
  const hostReceiverPath = desc.slot ? (desc.hostPath ?? wrapperPath).get(desc.slot) : fallbackCallArgumentPath(desc, staticIsMutated);
  let path = hostReceiverPath;
  // a wrapped descriptor pairs level by level; the wrappers a level wears are stepped into on the
  // way (the node form peeled them), so the path lands on the value the pair names - an array's
  // element, or an object property's value (a getter's returned value is not a path this walk
  // takes: the node form already declined to a plain data property)
  for (const { container, index, coords } of desc.descend ?? []) {
    path = peelTransparentWrapperPath(path);
    if (path?.node?.type !== (container === 'elements' ? 'ArrayExpression' : 'ObjectExpression')) return null;
    const paths = cachedContainerPaths(path, container);
    path = container === 'properties' ? paths[index]?.get('value') : callArgumentPathAt(paths, coords);
  }
  return path ?? null;
}

// the descriptor's paramIndex counts EXPANDED positions - the inline-array spread expansion is
// `resolveCallArgumentCoords` (the canonical semantics) and the path is the coordinate's;
// raw `arguments[paramIndex]` indexed past the single SpreadElement and bailed
function fallbackCallArgumentPath(desc, staticIsMutated = null) {
  const coords = resolveCallArgumentCoords(desc.callPath.node.arguments, desc.paramIndex, staticIsMutated);
  return coords ? callArgumentPathAt(desc.callPath.get('arguments'), coords) : null;
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
// form, for a caller that keeps walking from there.
export function peelParenAndTSSlotPath(startPath, wrappers = TRANSPARENT_EXPR_WRAPPER_TYPES) {
  let path = startPath;
  while (path?.parentPath?.node && wrappers.has(path.parentPath.node.type)) path = path.parentPath;
  return path ?? null;
}

// The node-only companion of `peelParenAndTSSlotPath`, for slot identity comparisons.
export function peelParenAndTSSlotChild(startPath, wrappers) {
  return peelParenAndTSSlotPath(startPath, wrappers)?.node ?? null;
}

// the slot a value fills where `holder` - the node above the transparent wrappers around `node` - reads more than
// its value: a REFERENCE, `callee` for a call's callee or a template's tag, `delete` / `typeof` for that
// operator's operand, or its SPELLING, `statement` for a whole expression statement - else null
function holderValueSlot(holder, node) {
  if ((holder?.type !== 'NewExpression' && isCalleeReference(holder, node))
    || (holder?.type === 'TaggedTemplateExpression' && unwrapRuntimeExpr(holder.tag) === node)) return 'callee';
  if (holder?.type === 'ExpressionStatement') return 'statement';
  return holder?.type === 'UnaryExpression' && (holder.operator === 'delete' || holder.operator === 'typeof') ? holder.operator : null;
}

// ... of the node at a path
export function pathValueSlot(path) {
  return holderValueSlot(peelParenAndTSParentPath(path)?.node, path.node);
}

// ... and of the last node of a chain of nodes, root first: the form for a walk that keeps no paths
export function chainValueSlot(chain) {
  let at = chain.length - 2;
  while (at >= 0 && TRANSPARENT_EXPR_WRAPPER_TYPES.has(chain[at].type)) at--;
  return holderValueSlot(chain[at], chain.at(-1));
}

// does an operand put where a selection or a sequence stood need `(0, operand)` to stay the VALUE that node
// yielded in its `slot` (`pathValueSlot`): a member as a callee or a tag would bind `this` to its object and as a
// `delete` operand would delete; a bare name as a `delete` operand is a strict-mode error, as a `typeof` operand
// stops throwing, and `eval` as a callee makes the eval direct; a string alone as a statement is a directive
export function foldedOperandNeedsValue(operand, slot) {
  const inner = unwrapRuntimeExpr(operand);
  if (slot === 'statement') return inner?.type === 'StringLiteral' || (inner?.type === 'Literal' && typeof inner.value === 'string');
  if (isMemberAccessNode(inner)) return slot === 'callee' || slot === 'delete';
  return inner?.type === 'Identifier' && (slot === 'delete' || slot === 'typeof' || (slot === 'callee' && inner.name === 'eval'));
}

// nothing to rewrite here, by SHAPE: the claim is disabled by a directive, already consumed by an
// earlier emission, a JSX identifier (a tag name is not a value read), type-only, or written inside
// a declaration that never reaches the emit. what this does NOT answer is DETACHMENT - whether the
// node still hangs in the tree - because each binding's path API reports that its own way.
// The bindings check detachment separately. the shape questions were spelled twice, once per binding, with
// the JSX one inside on one leg and beside it on the other
export function claimIsInert({ node, path, isDisabled, skippedNodes, isInTypeAnnotation }) {
  return !!isDisabled?.(node) || !!skippedNodes?.has(node)
    || isRenderedProbeRead(node)
    || node?.type === 'JSXIdentifier' || !!isInTypeAnnotation?.(path)
    || !!nonEmittedExpressionAncestor(path);
}

// does this assignment DISCARD its value? only a statement position does - source parens and TS
// wrappers are transparent on the way there, and everything else consumes what the assignment
// yields (`const w = ({ Map: { k } } = globalThis)` reads the GLOBAL, not the anchored ctor).
// `wrappers` widens what is climbed for a node an optional chain may hold (`globalThis?.Map;`)
export function assignmentInStatementPosition(assignPath, wrappers = TRANSPARENT_EXPR_WRAPPER_TYPES) {
  return peelParenAndTSParentPath(assignPath, wrappers)?.node?.type === 'ExpressionStatement';
}

// ... and the OTHER position that discards it: an element of a sequence nobody reads. a NON-TAIL
// element is discarded outright; the TAIL yields the sequence's own value, so it is discarded
// exactly when the sequence is - which is why this climbs instead of answering for one slot.
// transparent wrappers climb with it, exactly as they do above
export function discardedSequenceElement(path, wrappers = TRANSPARENT_EXPR_WRAPPER_TYPES) {
  let cur = path;
  let sequenced = false;
  for (let up = cur?.parentPath; up?.node; up = cur.parentPath) {
    const { type } = up.node;
    if (type === 'SequenceExpression') {
      sequenced = true;
      if (up.node.expressions.at(-1) !== cur.node) return true;
    } else if (!wrappers.has(type)) return sequenced && type === 'ExpressionStatement';
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

// the two together: does ANYTHING read what this assignment - or any node, a claim's included - yields? a
// position that discards the value is as free for a rewrite as any other that does - which of the two it is
// only decides WHERE the rewrite lands, and that is the emitter's question, not this one
export function assignmentValueDiscarded(assignPath, wrappers = TRANSPARENT_EXPR_WRAPPER_TYPES) {
  return assignmentInStatementPosition(assignPath, wrappers) || discardedSequenceElement(assignPath, wrappers);
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
    if (SKIPPABLE_WRAPPER_TYPES.has(parent.type) && parent.expression === member && grandparent) {
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
// used by the chain combines: a receiver's live `?.` short-circuits the WHOLE chain natively,
// so that link has to be tested before the (nullish-intolerant) maybe-helper reads the receiver
// (`optionalCallReceiverGuard`), while a receiver without one must keep throwing on the helper's
// own member read
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
    else if (CHAIN_HOP_WRAPPER_TYPES.has(cur.type)) cur = cur.expression;
    else return false;
  }
  return false;
}

// what the guard of an optional method call (`R.m?.()`, the callee member passed peeled) owes its
// receiver R. a `?.` on the member itself tests R's VALUE ('value': `R?.m?.()`). a plain member over
// a receiver carrying a live `?.` tests that LINK - the object of R's last live `?.` - and reads R
// plainly past it ('link': `a?.b.m?.()` tests `a`, then reads `.m` off `a.b`): R's own value is no
// test there, since it comes out nullish where `a.b` does, and the member read throws on that like
// native. any other receiver owes no test (null): the member read throws on a nullish R by itself
export function optionalCallReceiverGuard(callee) {
  if (callee?.optional === true) return 'value';
  return receiverCarriesLiveOptional(callee?.object) ? 'link' : null;
}

// Explicit parens in the callee seal its optional chain while preserving its method
// reference. Babel records a flag, ESTree a wrapper node; TS/Flow and chain markers
// only carry that boundary. A parenthesized receiver inside the member is not this seal.
export function calleeParenWrapped(callNode) {
  for (let wrapper = callNode.callee; wrapper;) {
    if (wrapper.type === 'ParenthesizedExpression' || wrapper.extra?.parenthesized) return true;
    if (CHAIN_HOP_WRAPPER_TYPES.has(wrapper.type)) wrapper = wrapper.expression;
    else return false;
  }
  return false;
}

// node types whose value is always a freshly-made object - the only left operands of `&&` that
// cannot hand `in` something it throws on
export const ALWAYS_TRUTHY_OBJECT_NODES = new Set([
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
// aliased), a member read that may yield it, a container that may hold one deeper, or an invocation
// that may return one. the value stored through wrappers, sequences or assignments is the same
// candidate. shared by the receiver walk and mutation census so a followed array slot also records
// the writes that invalidate it
export function canHoldBuiltIn(node) {
  node = installedWriteValue(node);
  return node?.type === 'Identifier' || node?.type === 'ObjectExpression'
    || node?.type === 'ArrayExpression' || node?.type === 'ClassExpression' || isMemberAccessNode(node) || !!invocationNode(node);
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

// literal-resolvable keys reachable through a BRANCHING computed-key node: ternary / logical
// arms, nested arms recursing. a non-branching node contributes its own resolution; an
// unresolvable arm contributes nothing (enumerating only what folds is the safe direction -
// a missed arm under-injects no worse than before, a guessed arm would fabricate a key).
// the fan is a worklist, not a recursion with a budget: arm nesting is the SOURCE's, so a
// budget answered a legal `c ? 'flat' : c2 ? 'flat' : ... : 'at'` exactly as it answered a
// broken tree - past five arms the trailing key stopped being enumerated and usage-global
// silently dropped its polyfill. slots go on the stack in REVERSE so popping keeps the
// depth-first left-to-right order the key list (and the import order behind it) is built in
// Precision consumers request a complete set; injection consumers keep every resolvable arm, and one
// that knows the build passes `liveOperand`: a selection it decides is the operand it always yields, so
// its dead arm names no key.
export function flattenBranchKeys(node, resolveKey = computedKeyStaticName, { requireComplete = false, liveOperand = null } = {}) {
  const keys = [];
  const pending = [node];
  const fanned = new Set();
  while (pending.length) {
    // oxc preserves paren nodes and both parsers keep TS casts - the branch shape must be
    // detected through them (`(cond ? "flat" : "at") in []` arrives paren-wrapped on the
    // estree side and bare on babel); arm wrappers unwrap the same way
    const cur = unwrapRuntimeExpr(pending.pop());
    if (!cur) {
      if (requireComplete) return null;
      continue;
    }
    const live = liveOperand?.(cur);
    if (live) {
      pending.push(live);
      continue;
    }
    const slots = getFallbackBranchSlots(cur);
    if (!slots) {
      const key = resolveKey(cur);
      if (requireComplete && (key === null || key === undefined)) return null;
      if (key && !keys.includes(key)) keys.push(key);
      continue;
    }
    // only a cyclic tree can re-reach a fanned node; the fan itself never revisits
    if (fanned.has(cur)) {
      if (requireComplete) return null;
      continue;
    }
    fanned.add(cur);
    for (let i = slots.length - 1; i >= 0; i--) pending.push(cur[slots[i]]);
  }
  return keys;
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

// the static key each of `properties` names - an object literal's properties, a type's members - in
// order; null when one names none statically (a spread, an index or call signature, a computed or
// numeric key): the whole key set is unknowable then
export function staticKeyNames(properties) {
  const keys = [];
  for (const property of properties) {
    const key = property.type === 'SpreadElement' ? null : foldedPropertyKeyName(property);
    if (key === null || key === undefined) return null;
    keys.push(key);
  }
  return keys;
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

// A normal member store installs a body only if its value can be called. Object, array and
// regexp literals are non-callable even though they can supply members as prototypes.
// Canonical value arms retain alternatives while discarding wrappers and sequence prefixes.
export function valueMayBeCallable(node, undefinedShadowed = false) {
  return flattenBranchingValueNodes([node]).some(value => {
    const { type } = value;
    return type !== 'ObjectExpression'
      && type !== 'ArrayExpression'
      && type !== 'RegExpLiteral'
      && !(type === 'Literal' && value.regex)
      && prototypeValueMayDispatch(value, undefinedShadowed);
  });
}

// is THIS property the one that installs a prototype? only a plain, non-computed, non-shorthand
// `__proto__` data property does - a method, an accessor or a computed key of the same name creates
// an ordinary own property instead. Null suppresses inheritance without lending dispatch;
// callers checking inherited presence include that install too.
export function propertyInstallsPrototype(prop, undefinedShadowed = false, includeNullPrototype = false) {
  if (prop?.type !== 'Property' && prop?.type !== 'ObjectProperty') return false;
  if (prop.computed || prop.shorthand || prop.method || (prop.kind && prop.kind !== 'init')) return false;
  if (propertyKeyName(prop) !== '__proto__') return false;
  return includeNullPrototype && isNullLiteralNode(unwrapRuntimeExpr(prop.value))
    || prototypeValueMayDispatch(prop.value, undefinedShadowed);
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
// write or call receives). Shared by alias classification and prototype-install channels.
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
// rewrites the call to its own injected binding), so the caller supplies `protoSetterCalleeArms`, truthy
// for a callee that may install, 'unknown' where its body supplies no proven value, and gets the
// callee PATH to resolve
export function installedPrototypeValueAt(ref, protoSetterCalleeArms, undefinedShadowed = false) {
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
  const arms = protoSetterCalleeArms?.(host.parentPath.get('callee'));
  return arms === 'unknown' ? NO_PROTOTYPE_VALUE : arms ? parent.arguments[1] ?? NO_PROTOTYPE_VALUE : null;
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
// (descriptor extraction) still reach them. `getterKeys` names proven final getter slots;
// their reads separate writes to a returned value from writes to this receiver.
// `unknownKey` marks a method behind a dynamic / numeric key: any held or dynamic read could
// extract it, so key-precise gates degrade to conservative. null when the literal has no
// own-this function members at all - the common data-only case stays zero-cost
export function objectOwnThisMethodInfo(objectNode) {
  if (objectNode?.type !== 'ObjectExpression') return null;
  const methodKeys = new Set();
  let getterKeys = null;
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
      getterKeys?.clear();
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
    // Explicit keys decide descriptor precedence. A setter keeps its paired getter,
    // while a known data definition resets it; unknown keys leave named slots intact.
    if (key !== null && key !== undefined) {
      if (prop.kind === 'get') (getterKeys ??= new Set()).add(key);
      else if (prop.kind !== 'set') getterKeys?.delete(key);
    }
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
    ? { methodKeys, getterKeys, unknownKey, accessors, mayIterate, unscannableBodies, declaredKeys } : null;
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
  return methodKeys.size || unknownKey || accessors
    ? { methodKeys, getterKeys: null, unknownKey, accessors, mayIterate: false, unscannableBodies: false, declaredKeys: null } : null;
}

// Merge extraction infos without inventing a literal's declared-key set for a class.
// A null set means its member writes belong to the class field fold, not the literal escape gate.
// A merged summary has no single literal descriptor; only a literal summary proves getter slots.
export function mergeOwnThisMethodInfo(base, extra) {
  if (!base) return extra;
  if (!extra) return base;
  const methodKeys = new Set(base.methodKeys);
  for (const key of extra.methodKeys) methodKeys.add(key);
  return {
    methodKeys,
    getterKeys: null,
    unknownKey: base.unknownKey || extra.unknownKey,
    accessors: base.accessors || extra.accessors,
    mayIterate: !!base.mayIterate || !!extra.mayIterate,
    unscannableBodies: !!base.unscannableBodies || !!extra.unscannableBodies,
    declaredKeys: base.declaredKeys && extra.declaredKeys ? new Set([...base.declaredKeys, ...extra.declaredKeys]) : null,
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

// the KEY a receiver whose mutated member cannot be named is recorded under. it says only that SOME
// member was replaced, which is a weaker fact than `globalThis.<name>` (the SLOT key, where the
// user's own object replaced the built-in): the binding is still the built-in, so its name keeps
// resolving to a polyfill and only its members stop being trusted. read as the slot key it would
// leave the whole name native - a missing polyfill on every engine without it
export const MUTATED_MEMBERS_UNKNOWN = '*';

// ... and the key a NAMED mutated member is additionally recorded under. it says one thing only: the
// entry this ctor reference resolves to has to carry the member back, because the file patched it on
// the value every read lands on. deliberately NOT the wildcard above - that one makes every member of
// the name untrusted, which stops the nav collapses and leaves raw realm reads in pure output
export const MUTATED_STATIC_PINNED = '+';

// the (object, key) pair consultation every reader of the set shares. three ways the
// pair stops being a polyfillable static: the exact pair is recorded, the OBJECT carries the
// members-unknown key (some member was replaced and this may be it), or the object's own SLOT was
// replaced - `globalThis.Set = Shim` makes every `Set.<key>` read the shim's own property, so no
// member of a replaced object is one either. the global object has no such slot of its own
// (`isCanonicalGlobalObject`)
export function isMutatedStaticPair(object, key, mutatedSet) {
  return !!mutatedSet?.has(mutatedStaticKey(object, key))
    || !!mutatedSet?.has(mutatedStaticKey(object, MUTATED_MEMBERS_UNKNOWN))
    || (!isCanonicalGlobalObject(object) && !!mutatedSet?.has(mutatedStaticKey('globalThis', object)));
}

// is `object` the global object under the name the slot questions give it (`isMutatedGlobalSlot`)? its
// third reading would be `globalThis.globalThis`, the slot ONE realm name reads: a bare `Set` reaches the
// global through the scope, and a read spelling a realm name asks that name's own slot at its root - so
// `window.globalThis = window` replaces no `Set`
export function isCanonicalGlobalObject(object) {
  return object === 'globalThis';
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

// does this node open a VAR-scope of its own (the set above)? the census keys a `var` declaration
// on the nearest of these, a lexical one on the nearest `let` host
function isScopeRebinding(node) {
  return SCOPE_REBINDING_TYPES.has(node.type);
}

// the LEXICAL scopes below a var-scope - the `let` hosts of the lattice above: a `let` / `const` /
// `class` binding, a catch parameter and a for-x head live in the block, loop or clause that holds
// them, so two blocks declaring one name are two bindings - the census keys its declarations by
// these frames, and a `var` climbs past them to the nearest var-scope
function isLexicalScopeOpener(node) {
  return LET_SCOPE_HOST_TYPES.has(node.type);
}

// the scope a declaration of `kind` LANDS in, given the chain enclosing it: a `var` climbs past
// every lexical frame to the nearest var-scope, everything else binds in the innermost. `null` is
// the file root. every census reducer asking where a name was bound asks this one - a second
// spelling of it is how one census came to read a `var` in a block as binding in that block
export function declarationScopeIn(kind, scopes) {
  return (kind === 'var' ? scopes.findLast(isScopeRebinding) : scopes.at(-1)) ?? null;
}

// where the declarations ON one node BIND, given the census frame holding it: `own` is the scope
// the node's inner bindings land in - a scope opener holds what it introduces itself (a function's
// parameters, a catch clause's), everything else defers to `enclosing`, where the KIND lands it (a
// `var` past every block to the function around it). `named` is where the node's OWN name binds,
// and it splits by form: a DECLARATION's name belongs to the scope holding it, while a function or
// class EXPRESSION binds its name inside itself and nowhere else - reading the second as the first
// puts a binding in a scope that never had it, and a census asking "is this reference the file's
// own" then answers yes for a reference that reaches the realm.
// a block FUNCTION stays coarse, and unavoidably: whether B.3.3.1 hoists it out of the block
// depends on the strictness a census may itself be deciding, so the narrower scope is recorded -
// a reference outside the block then reads as the realm's, which is the conservative direction
export function declarationScopesOf(node, frame) {
  // the census visits the DECLARATOR, and the kind is spelled one level up on the declaration
  const kind = node.type === 'VariableDeclarator' ? frame.parentNode?.kind : node.kind;
  const enclosing = declarationScopeIn(kind, frame.scopes);
  const own = isScopeRebinding(node) || isLexicalScopeOpener(node) ? node : enclosing;
  const named = node.type === 'FunctionExpression' || node.type === 'ClassExpression' ? own : enclosing;
  return { own, enclosing, named };
}

// the declarations one FILE makes, gathered from the census walk and asked of a scope CHAIN: does
// a name spelled in that chain reach a binding this file wrote, or past every one of them to the
// realm? the ONE home of that question on the census side - a reducer spelling the lattice again
// is how one census came to read a `var` in a block as binding in that block.
// tsc-ELIDED declarations are not bindings at runtime (`declare const Map`, a type-only import), so
// they never shadow: recording them would make a reference to the realm's value read as the file's.
// `names` narrows what is recorded when a reducer knows the closed set it will ask about
export function createDeclaredNameIndex(names = null) {
  const declaredIn = new Map();
  return {
    // An already-classified binding, for censuses that also record synthetic declarations.
    recordName(name, scope) {
      if (names && !names.has(name)) return;
      let scopes = declaredIn.get(name);
      if (!scopes) declaredIn.set(name, scopes = new Set());
      scopes.add(scope);
    },
    // one visited node's declarations, taken from the census walk that visits it. `select(id, node)`
    // narrows what is taken - a reducer indexing one PROPERTY of a binding rather than the whole
    // lattice passes it, and asks the same chain question of the narrower index
    record(node, frame, select = null, knownDeclared = undefined) {
      const declared = knownDeclared === undefined ? declaredIdentifierNodes(node) : knownDeclared;
      if (!declared || isAmbientBindingShape(node, frame.parentNode)) return;
      const { own, named } = declarationScopesOf(node, frame);
      for (const id of declared) {
        if (select && !select(id, node)) continue;
        this.recordName(id.name, id === node.id ? named : own);
      }
    },
    // The nearest binding owner, including declarations without a value. `null` is the file
    // root; `undefined` means the chain reaches no declaration in this file.
    resolve(name, scopes) {
      const declaring = declaredIn.get(name);
      if (!declaring) return undefined;
      for (let index = scopes.length - 1; index >= 0; index--) if (declaring.has(scopes[index])) return scopes[index];
      return declaring.has(null) ? null : undefined;
    },
    // ... and the existence question over the same scope lattice.
    declares(name, scopes) {
      return this.resolve(name, scopes) !== undefined;
    },
  };
}

// Does this child evaluate with a new `this`? Keys, heritage and decorators keep the outer
// receiver; field values, method bodies and defaults do not. Both census and path walks ask this.
export function isThisRebinding(node, child) {
  return !!node && THIS_REBINDING_TYPES.has(node.type)
    && (!CLASS_FIELD_TYPES.has(node.type) || node.value === child)
    && !definitionTimeSlotOf(node, child);
}

// does this injection method read the census the usage lanes build? `entry-global` replaces an
// entry import and mints no name of its own, so it consumes neither the name reservation the
// census feeds nor the mutation / ctor-alias tables - only the resolvers and emitters it never
// reaches read those. Both emitters ask this one question; each supplies its own reducer list,
// with the format reducer included for every method
export function methodReadsUsageCensus(method) {
  return method !== 'entry-global';
}

// ONE full-file raw walk driving every per-file census reducer. each reducer keeps its own
// per-node logic and closure state in its home module ({ visit(node, frame), result() });
// the driver owns only the traversal. Visits collect syntax facts without consulting the file's
// strictness; results run in reducer order so the format owner can publish before its consumers.
// The point is collapsing the
// N independent whole-file scans (name reservation, mutation / ctor-alias / minifier
// shape gates) into a single pass. frames carry the structural parent type (transparent
// wrappers forwarded) and the module-top-level flag - the contexts the orphan-ref
// classifier distinguishes emit positions by
export function collectFileCensus(programNode, reducers) {
  // `parentNode` is the IMMEDIATE structural parent (unlike `parentType`, which skips transparent
  // wrappers): a reducer that must tell a source-name position from a reference (an identifier that
  // is a property key / member key / label, per `isNonReferencePosition`) needs the exact parent node
  // Two parallel stacks: siblings share a frame, except slots that change the this context.
  // Ordinary parents allocate one frame rather than one per child; reducers read no node from it.
  const nodeStack = [programNode];
  // `scopes`: the scope-opening nodes enclosing the node - var-scopes and lexical scopes alike -
  // outermost first, the chain a reducer resolves a NAME against (the Program itself stands in it,
  // a top-level `var` climbs past it to the module scope, the empty chain)
  const frameStack = [{
    parentType: null,
    atTopLevel: true,
    atThisTopLevel: true,
    thisOwner: null,
    parentNode: null,
    underTypeAnnotation: false,
    scopes: [],
    throwHandler: null,
  }];
  // the file's `constructor` key question (`readsConstructorKey`) rides this walk, once per program
  const asksConstructorKey = !CONSTRUCTOR_KEY_READS.has(programNode);
  let constructorKeyRead = false;
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
    const { type } = node;
    for (const reducer of reducers) reducer.visit(node, frame);
    if (asksConstructorKey) constructorKeyRead ||= readsConstructorKeyAt(node, type);
    // Leaves and empty lists need no child context. Compute it at the first real child.
    let rebindsThis = false;
    let childFrame = null;
    let receiverFrame = null;
    // eslint-disable-next-line no-restricted-syntax -- perf: AST hot path, plain objects
    for (const key in node) {
      const value = node[key];
      if (Array.isArray(value) ? value.length > 0 : isASTNode(value)) {
        if (!childFrame) {
          const rebindsScope = isScopeRebinding(node);
          rebindsThis = THIS_REBINDING_TYPES.has(type);
          childFrame = {
            parentType: TRANSPARENT_EXPR_WRAPPER_TYPES.has(type) ? frame.parentType : type,
            atTopLevel: frame.atTopLevel && !rebindsScope,
            atThisTopLevel: frame.atThisTopLevel,
            thisOwner: frame.thisOwner,
            parentNode: node,
            // Sticky inside a `:` annotation wrapper; a type alias or type argument alone
            // opens none, unlike the broader isTypeAnnotationNodeType classification.
            underTypeAnnotation: frame.underTypeAnnotation || isTypeAnnotationWrapper(node),
            scopes: rebindsScope || isLexicalScopeOpener(node) ? [...frame.scopes, node] : frame.scopes,
            throwHandler: frame.throwHandler,
          };
        }
        // Keep the owner, not just a top-level flag: escape and write censuses ask whose this it is.
        const thisOwner = key === 'decorators' && frame.parameterThisOwner !== undefined
          ? frame.parameterThisOwner
          : rebindsThis && isThisRebinding(node, Array.isArray(value) ? value[0] : value)
            ? type === 'FunctionExpression' && frame.parentNode?.type === 'MethodDefinition' ? frame.parentNode : node
            : frame.thisOwner;
        // A parameter's decorator runs outside its function, unlike its default value.
        const parameterThisOwner = key === 'params' && FUNCTION_LIKE_NODE_TYPES.has(type)
          ? frame.thisOwner : undefined;
        nodeStack.push(value);
        const handlerStep = type === 'TryStatement' || frame.throwHandler
          ? throwHandlerAtStep(node, { node: value, key }) : undefined;
        const throwHandler = handlerStep === undefined ? frame.throwHandler : handlerStep;
        if (throwHandler !== childFrame.throwHandler) {
          frameStack.push({ ...childFrame, thisOwner, atThisTopLevel: thisOwner === null, parameterThisOwner, throwHandler });
        } else if (thisOwner === childFrame.thisOwner && parameterThisOwner === undefined) frameStack.push(childFrame);
        else if (parameterThisOwner === undefined) {
          if (!receiverFrame || receiverFrame.thisOwner !== thisOwner) {
            receiverFrame = { ...childFrame, thisOwner, atThisTopLevel: thisOwner === null };
          }
          frameStack.push(receiverFrame);
        } else frameStack.push({ ...childFrame, thisOwner, atThisTopLevel: thisOwner === null, parameterThisOwner });
      }
    }
  }
  if (asksConstructorKey) CONSTRUCTOR_KEY_READS.set(programNode, constructorKeyRead);
  // Finalize shared facts before a result consumes another reducer's observations.
  for (const reducer of reducers) reducer.prepare?.();
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
  const roots = new WeakMap();
  return {
    visit(node) {
      if (node.type !== 'MemberExpression' && node.type !== 'OptionalMemberExpression') return;
      const key = memberKeyName(node);
      if (key === null) return;
      if (runtimeChainRoot(node.object, roots)?.type === 'Identifier') memberKeyNames.add(key);
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
// the TS twin exactly that way, and the guard channels erased over the require twin's probe. the
// three-form rule itself is `boundModuleDefaultSource` below; this is its proxy-name reading
export function importedGlobalProxyName(binding, packages, adapter = null) {
  return globalProxyNameFromImportSource(boundModuleDefaultSource(binding, adapter), packages);
}

// the pure module SOURCE a binding holds the DEFAULT of, or null - the three-form rule above,
// stated once: the ES default specifier (a namespace / named specifier and a type-only import
// bind something else), the TS `import x = require(...)` declaration, and the bare-CJS require
// declarator, whose reassignment gate mirrors the require-source recogniser's (a rebound name no
// longer provably holds the module object; the Identifier-id gate is the declarator-slot canon).
// the proxy-name channel above and the symbol-key channel read through here alike - the symbol
// channel took the ES specifier alone, and a read keyed by a require-bound `symbol/iterator`
// (`o[_Symbol$iterator]` off `var _Symbol$iterator = require(...)`, the spelling the require
// import style leaves for a later pass) folded to nothing and stayed a raw read
export function boundModuleDefaultSource(binding, adapter = null) {
  const node = binding?.node;
  if (node?.type === 'TSImportEqualsDeclaration') return tsImportEqualsRequireSource(node, adapter);
  if (node?.type === 'VariableDeclarator') {
    return binding.importSource && node.id?.type === 'Identifier' && !isReassignedBeyondDeclarator(binding)
      ? binding.importSource : null;
  }
  return bindsModuleDefault(node) && !importBindingIsTypeOnly(binding) ? binding?.importSource ?? null : null;
}

// is the realm's slot `key` - `globalThis.<key>`, the one slot every realm name reads - written by the file, as the
// read at its position (`read`) sees it
export function isMutatedGlobalSlot(adapter, key, read = null) {
  return !!key && !!adapter?.isMutatedStatic?.('globalThis', key, read);
}

// does a usage meta name a global slot the file itself writes? such a read is DEOPTED - it stays
// verbatim on the live binding so the runtime serves what the user's writes left there - unless the
// read at `path` runs before every one of those writes, when the slot still holds what this build
// serves. the question is about the NAME, so it is asked here once: spelled per emitter it drifted, one
// of them additionally gating on the node shape, which narrows a BAIL-safe verdict
export function isDeoptedGlobalSlotRead(meta, adapter, path = null) {
  return meta?.kind === 'global' && isMutatedGlobalSlot(adapter, meta.name, path && { node: path.node, path });
}

// ... and its STATIC twin: does a usage meta read a static pair the file writes - the member itself, or the
// slot of the global it hangs off? such a read stays on its receiver, so the patch and every later read share
// one object - save what sees the slot this build serves (`isMutatedStatic`, asked with the read at `path`):
// the detect the write computes from, a read ahead of every write of the global's slot, and a pair no write
// of which ever runs. ONE filter for every pipeline binding a static read to a receiver-less import - both
// emitters' `resolvePure` and the member gate - and for every gate that keeps what such a binding would
// replace: an inherited static's bail, an optional chain's guard over the read, an `in` test's fold. `read`
// (`{ node, path }`) is the read where the caller holds it apart from `path` - the served question a guard's
// test asks from its owner, the member an optional chain guards. an INSTANCE meta passes unfiltered: after a write
// replacing the prototype method (`Array.prototype.at = f`) pure still dispatches `[1].at(0)` to core-js's - debt
export function isDeoptedStaticRead({ meta, adapter, path = null, read = path && { node: path.node, path } }) {
  return meta?.kind === 'property' && meta.placement === 'static' && !!meta.object && !!meta.key
    && !!adapter?.isMutatedStatic?.(meta.object, meta.key, read);
}

// ... and the debug-warn that reports it, single-sourced beside the predicate so both emitters
// say the identical thing
export function mutatedSlotLeftNativeWarning(name) {
  return `\`${ name }\` is written in this file (slot mutation) - the name is left native`;
}

// A node-keyed memo scoped to its owning instance or native traversal context. Adapter verdicts
// are method- and resolver-dependent, so a plain node key lets two instances over ONE tree replay each
// other's answers - and the replay direction that matters is the unsafe one: usage-global resolves
// under "inject if it MIGHT be needed", which usage-pure must never inherit for a rewrite it can
// only make on certainty. The adapter is that use's owner; native path caches use the context
// that owns their paths and scopes instead.
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
    delete(adapter, node) { forAdapter(adapter).delete(node); },
  };
}

// the one question every proxy-root recogniser asks: does this NAME still stand for the pristine
// global surface? the two halves must travel together - a name that is a known proxy but whose slot
// the user overwrote (`window = fake`) holds the replacement, not the surface, so recognising it
// would rewrite reads of the user's own value. the recognisers around it differ in HOW they reach a
// name (scope walk, alias chain, injector hint, destructure key); what they do with the name once
// they have it is this, and it was spelled out at each of them. a recogniser holding the name's own
// READ hands it (`read`: `{ node, path }`), which sees the surface where it runs before every write
export function isPristineProxyGlobal(adapter, name, read = null) {
  return POSSIBLE_GLOBAL_OBJECTS.has(name) && !isMutatedGlobalSlot(adapter, name, read);
}

// the pristine proxy surface an operand names, or null. a branch the walker already
// substituted (`_globalThis`) is the same surface - the minted import's hint says which
// global it holds
export function proxySurfaceIdentifier(node, { adapter, injectorState, throughRealmHop = null, scope = null, path = null }) {
  let inner = peelTransparentExpr(node);
  // a realm NAVIGATION names the surface its root does (`globalThis.self` IS the realm), so a caller
  // that can read through hops hands the verdict for one. refusing them outright answered "not a
  // selection" for the navigated spelling of a figure the bare name resolves, and the claim above
  // then went out NATIVE. the hop must be GUARANTEED (the caller's own question): an unbacked one is
  // the environment probe, and reading through it kills the very branch it decides
  // (`globalThis.window ?? {}`). a live `?.` is no hop to walk either - the branch is a value that
  // can be absent
  if (throughRealmHop) {
    while ((inner?.type === 'MemberExpression' || inner?.type === 'OptionalMemberExpression')
      && !inner.optional && throughRealmHop(memberKeyName(inner))) {
      inner = peelTransparentExpr(inner.object);
    }
  }
  if (inner?.type !== 'Identifier') return null;
  const minted = POSSIBLE_GLOBAL_OBJECTS.has(injectorState?.getPureImport?.(inner.name)?.hint);
  // a proxy-global SPELLING that BINDS is the user's own object - `function f(self)`, `const window
  // = {}` - and the surface question is about the realm, so a caller that brings its scope gets the
  // binding's answer. only a MINTED name reads past it: the injector's own alias binds by design.
  // no scope is the node-only convention this family keeps, and there the name alone answers
  if (!minted && scope && adapter?.getBinding?.({ scope, name: inner.name, path })?.node) return null;
  return isPristineProxyGlobal(adapter, inner.name, path && { node: inner, path }) || minted ? inner : null;
}

// a selecting init whose EVERY LIVE branch lands on the same pristine proxy surface
// (`c ? globalThis : self`): the claim extracts like a plain proxy receiver and the
// discarded init drops whole - no branch diverges, nothing observable dies with it. A caller
// preserving the selection may supply a scoped value proof (`readSurface`): it can classify a
// stored value while keeping its write, and it checks every leaf against the binding at the read.
export function allProxySelectingInit(node, {
  adapter, injectorState, allowEffectfulTest = false, throughRealmHop = null, readSurface = null,
  scope = null, path = null,
}) {
  const stack = [{ node, branch: false }];
  while (stack.length) {
    const { node: raw, branch } = stack.pop();
    const inner = peelTransparentExpr(raw);
    if (inner?.type === 'ConditionalExpression') {
      // an SE-bearing test must keep the destructure (the mirror's shape) - the extraction
      // would discard the init and its effect with it. a MEMBER receiver asks with the flag: its
      // render carries the selection on as a harvested effect ahead of the collapsed root
      // (`(t++ ? _globalThis : _self, _Promise).any`), so nothing of it dies there
      if (!allowEffectfulTest && mayHaveSideEffects(inner.test, { scope, adapter, path })) return false;
      stack.push({ node: inner.consequent, branch: true }, { node: inner.alternate, branch: true });
      continue;
    }
    if (inner?.type === 'LogicalExpression' && (inner.operator !== '&&' || readSurface)) {
      // a proxy surface DECIDES a `||` / `??` on its own - an object is always truthy and
      // never nullish, so the right operand never evaluates and dies with the init. a LEFT that is
      // itself an all-proxy selection decides the same way, at every depth (`(globalThis ?? {}) ?? {}`)
      if (inner.operator !== '&&'
        && allProxySelectingInit(inner.left,
          { adapter, injectorState, allowEffectfulTest, throughRealmHop, readSurface, scope, path })) continue;
      // ... and a left that fails there fails as a live branch too wherever the scoped proof judges the
      // leaves: only a write left peels differently as a branch. its right cannot change the verdict
      // then, and a right that aliases the rest of a chain walked that whole chain again at every level
      if (inner.operator !== '&&' && readSurface && peelTransparentExpr(inner.left)?.type !== 'AssignmentExpression') {
        return false;
      }
      stack.push({ node: inner.left, branch: true }, { node: inner.right, branch: true });
      continue;
    }
    // a chain ASSIGNMENT is transparent to a BRANCH's verdict: what the selection yields is
    // the value it stores (`c ? (q = globalThis) : (w = globalThis)`). a BARE write init is
    // not a selection at all and keeps its own channels
    let value = inner;
    // A read-side caller can prove a stored navigation through its value canon while keeping the
    // complete selection as an effect. Consumers that discard the selection supply no such proof.
    if (readSurface) {
      if (!readSurface(value)) return false;
      if (isChainAssignment(value) || value?.type === 'SequenceExpression') continue;
    }
    if (branch) {
      while (value?.type === 'AssignmentExpression' && value.operator === '=') value = peelTransparentExpr(value.right);
    }
    if (!proxySurfaceIdentifier(value, { adapter, injectorState, throughRealmHop, scope, path })) return false;
  }
  return true;
}

// the surface an all-proxy selecting init reads - its first branch's pristine root. `truthyAnd`
// is the proof that an AND's left is a realm object, so that selection always yields its right.
export function firstProxyBranch(node, { truthyAnd = false } = {}) {
  let inner = peelTransparentExpr(node);
  for (let key = proxySelectingBranchKey(inner, { truthyAnd }); key; key = proxySelectingBranchKey(inner, { truthyAnd })) {
    inner = peelTransparentExpr(inner[key]);
  }
  return inner;
}

// which branch a SELECTING node yields first - the ternary's consequent, the `||` / `??` left.
// `&&` names none without the caller's truthy-left proof; with it the right is the value read.
export function proxySelectingBranchKey(node, { truthyAnd = false } = {}) {
  if (node?.type === 'ConditionalExpression') return 'consequent';
  if (node?.type === 'LogicalExpression') return node.operator !== '&&' ? 'left' : truthyAnd ? 'right' : null;
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

// the names of the TS runtime declarations a scope-anchor node holds directly - an enum, an instantiated
// namespace, an import-equals. neither tracker registers an enum or a namespace, and estree-toolkit no
// import-equals either, so both adapters' `hasBinding` and the lookup wrap (`wrapScopeBindingLookup`)
// read this set where the native scope answers nothing or a binding further out. cached per anchor node,
// so the climbs of every lookup share one scan of it
const tsRuntimeBindingsCache = new WeakMap();

// extract the direct statement-body array from a scope-anchor node. Program/BlockStatement/
// TSModuleBlock/StaticBlock host statements at `.body` directly; functions and class methods
// wrap in `.body.body` (BlockStatement) - and ONLY they do: a loop, a catch clause or a labeled
// statement also holds a block at `.body`, but that block is its own anchor, and reading it off
// the statement let a use in the statement's HEAD see what the block declares. a SwitchStatement's
// body is ONE block scope spanning every case, so its host statements are all cases' consequents
// flattened - a braceless `enum X {}` in any case shadows the global for a use in that or a
// fall-through case. returns null when the node has no host-able body - asked of every ancestor a
// lookup climbs, so the shape is read before the type
export function getDirectStatementBody(node) {
  if (!node) return null;
  if (Array.isArray(node.body)) return node.body;
  if (Array.isArray(node.body?.body) && FUNCTION_LIKE_NODE_TYPES.has(node.type)) return node.body.body;
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
// even when the scope tracker doesn't register a scope for it. the climb stops below
// `stopNode` where one is given - the scope declaring a binding the trackers handed back, so
// the answer is whether such a declaration NEARER than that binding shadows it
export function findTSRuntimeBindingInPath(path, name, stopNode = null) {
  // a DEFINITION-TIME slot is evaluated where the CLASS is defined, not inside the frames its
  // holder opens, so nothing those frames declare reaches it - neither a body `enum` / `namespace`
  // nor a parameter property, whether the slot is a method's computed key, a member decorator or a
  // decorator hanging off a parameter list. Only those frames are carved out: a statement
  // declaration around the class does shadow the slot, since the slot really does sit inside that
  // statement's scope.
  // which slots evaluate at definition time is the shared slot canon (`definitionTimeSlotOf`);
  // this climb asks it the binding question, the `this`-anchor walks ask it theirs
  const frames = useRegionFrames(path);
  const { definitionTimeFrames } = frames;
  // a use in a function's PARAMETER LIST sees the parameter properties beside it, but nothing
  // the body declares - the same region rule the var climb and the native trackers apply - and so
  // does a use inside a closure written in one (`closureRegions`)
  const paramFrame = frames.paramOwner?.node ?? null;
  const closureFrames = frames.closureRegions.functions;
  for (let cur = memberContextPath(path); cur && cur.node !== stopNode; cur = memberContextPath(cur.parentPath)) {
    if (definitionTimeFrames?.has(cur.node)) continue;
    if (cur.node !== paramFrame && !closureFrames.includes(cur.node) && getTSRuntimeBindings(cur.node)?.has(name)) return true;
    if (getParameterPropertyNames(cur.node)?.has(name)) return true;
  }
  return false;
}

// does the file declare a TS runtime binding - an enum, an instantiated namespace, an import-equals -
// below its top level, where it can shadow a binding declared further out that both trackers hand
// back instead (`wrapScopeBindingLookup`)? a top-level one has nothing further out to shadow
export function nestedTSRuntimeDeclarationsReducer() {
  let nested = false;
  const topLevelExports = new WeakSet();
  return {
    visit(node, { parentNode }) {
      if (nested) return;
      if (parentNode?.type === 'Program') {
        if (unwrapExportedDeclaration(node) !== node) topLevelExports.add(node);
      } else if (isTSRuntimeBindingDeclaration(node) && !topLevelExports.has(parentNode)) nested = true;
    },
    result() { return { nestedTSRuntimeDeclarations: nested }; },
  };
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

// does this path sit inside a TS type DECLARATION whose own name NOTHING in the file names? a type
// reference injects because a value of that type may flow here and be read through it - but a type
// declaration nobody spells declares a surface no value in this file can have, so nothing of it is
// ever read. an EXPORTED declaration keeps injecting: its readers are other files, whose own type
// resolution does not reach across the import. the scan is one pass over the program per ask, and
// the ask is rare - only an identifier standing in type space reaches it
const UNREFERENCED_TYPE_DECLS = new WeakMap();
export function typeDeclarationUnreferencedInFile(path) {
  const program = rootProgramOf(path);
  const node = path?.node;
  if (!program || typeof node?.start !== 'number') return false;
  let answer = UNREFERENCED_TYPE_DECLS.get(program);
  if (answer === undefined) UNREFERENCED_TYPE_DECLS.set(program, answer = unreferencedTypeDeclarationSpans(program));
  return answer.some(span => node.start >= span.start && node.end <= span.end);
}

// the SPANS of every type declaration this file neither names nor exports, gathered once per
// program. spans rather than a path climb: the two parsers hang different node chains between an
// identifier and the declaration around it, and a climb that reads one of them answers differently
// per leg - a span containment reads the same on both
function unreferencedTypeDeclarationSpans(program) {
  const declarations = [];
  const exported = new Set();
  for (const statement of program.body ?? []) {
    const inner = statement.type === 'ExportNamedDeclaration' || statement.type === 'ExportDefaultDeclaration'
      ? statement.declaration : statement;
    if (!TYPE_DECLARATION_HOSTS.has(inner?.type) || inner.id?.type !== 'Identifier') continue;
    if (inner !== statement) exported.add(inner);
    declarations.push(inner);
  }
  if (!declarations.length) return [];
  const counts = new Map(declarations.map(declaration => [declaration.id.name, 0]));
  walkAstNodes({
    root: program,
    visit(child) {
      if (child.type === 'Identifier' && counts.has(child.name)) counts.set(child.name, counts.get(child.name) + 1);
      return true;
    },
  });
  return declarations
    .filter(declaration => !exported.has(declaration) && counts.get(declaration.id.name) === 1)
    .map(declaration => ({ start: declaration.start, end: declaration.end }));
}

// the type declarations whose BODY is type space alone: a value of the declared surface reaches this
// file only through a reference to the name. an enum and a namespace are runtime declarations and
// stay out - their bodies hold values
const TYPE_DECLARATION_HOSTS = new Set(['TSInterfaceDeclaration', 'TSTypeAliasDeclaration']);

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

// does the name stand as an export specifier's local? it names a declaration of this file - only those
// export - so it never reads the realm: a usage lane that found no value binding behind it is looking at
// a type, which exports nothing
export function isExportSpecifierLocal(path) {
  return path?.parent?.type === 'ExportSpecifier' && path.parent.local === path.node;
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
  for (let current = memberContextPath(path?.parentPath); current; current = memberContextPath(current.parentPath)) {
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
  for (let current = memberContextPath(path?.parentPath); current; current = memberContextPath(current.parentPath)) {
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

// The check-side subtrees an infer capture passes into the true result. This is source
// provenance, not assignability: a comparison alone owes no global, and an unused capture
// owes none either. Matching slots keep `Map<K, Set<V>>`'s captured value separate from Map.
const CONDITIONAL_INFERENCE_INPUTS = new WeakMap();
function conditionalInferenceInputs(node) {
  if (CONDITIONAL_INFERENCE_INPUTS.has(node)) return CONDITIONAL_INFERENCE_INPUTS.get(node);
  const inputs = new Set();
  CONDITIONAL_INFERENCE_INPUTS.set(node, inputs);
  const names = inferTypeParameterNames(node.extendsType);
  if (!names?.size) return inputs;
  const used = new Set();
  function read(path) {
    const ref = path.node[TYPE_REFERENCE_SLOTS.get(path.node.type)];
    if (ref?.type === 'Identifier' && names.has(ref.name)
      && !typeParameterInScope(path, ref.name) && !isTSTypeOnlyIdentifierPath(path)) used.add(ref.name);
    walkAstChildren(path.node, (child, key) => read({ node: child, parent: path.node, parentPath: path, key }));
  }
  read({ node: node.trueType });
  if (!used.size) return inputs;
  function pair(source, pattern, depth = 0) {
    if (!source || !pattern) return;
    source = peelTSParenthesized(isTypeAnnotationWrapper(source) ? source.typeAnnotation : source);
    pattern = peelTSParenthesized(isTypeAnnotationWrapper(pattern) ? pattern.typeAnnotation : pattern);
    if (pattern?.type === 'TSInferType') {
      if (used.has(typeParameterName(pattern.typeParameter))) inputs.add(source);
      return;
    }
    // A nested conditional owns its own captures, not this conditional's inference.
    if (pattern?.type === 'TSConditionalType') return;
    const referenceSlot = TYPE_REFERENCE_SLOTS.get(pattern?.type);
    const sourceReference = referenceSlot && source?.[referenceSlot];
    const patternReference = referenceSlot && pattern?.[referenceSlot];
    const differentReferenceHosts = referenceSlot && (sourceReference?.type !== 'Identifier'
      || patternReference?.type !== 'Identifier' || sourceReference.name !== patternReference.name);
    if (depth > MAX_DEPTH || source?.type !== pattern?.type || differentReferenceHosts) {
      // An unmodelled structural relation may still capture this source. Preserve that
      // possible input only when its inferred name reaches the result. Different generic
      // hosts have no positional correspondence: Map's iterable element includes both
      // type arguments, so matching Iterable's argument against Map's first one loses V.
      // Exhausting the correspondence budget must preserve the same possible input.
      if ([...inferTypeParameterNames(pattern) ?? []].some(name => used.has(name))) inputs.add(source);
      return;
    }
    if (pattern.type === 'TSTupleType') {
      const sourceElements = tupleElements(source);
      const patternElements = tupleElements(pattern);
      const restAt = patternElements.findIndex(isTupleRestElement);
      for (const [index, element] of patternElements.entries()) {
        const sourceAt = restAt === -1 || index <= restAt ? index : sourceElements.length - patternElements.length + index;
        const end = index === restAt ? sourceElements.length - (patternElements.length - index - 1) : sourceAt + 1;
        for (const candidate of sourceElements.slice(sourceAt, end)) {
          pair(unwrapTupleMember(candidate), unwrapTupleMember(element), depth + 1);
        }
      }
      return;
    }
    walkAstChildren(pattern, (child, key, inList) => {
      const memberName = key === 'members' ? propertyKeyName(child) : null;
      // Union arms are unordered, and an overload set may infer from any signature the
      // source relation selects. Keep the possible captured inputs instead of trusting
      // list position; ordinary generic arguments and parameter slots remain positional.
      const candidates = !inList ? [source[key]]
        : key === 'types' ? source[key]
        : key === 'members' ? source[key]?.filter(member => propertyKeyName(member) === memberName)
        : [source[key]?.[pattern[key].indexOf(child)]];
      for (const candidate of candidates ?? []) pair(candidate, child, depth + 1);
    });
  }
  pair(node.checkType, node.extendsType);
  return inputs;
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
// Map's path needs ancestor walk past TSTypeReference / TSTypeParameterInstantiation hops).
// the path also owns the one question the flat triple cannot answer - a CONDITIONAL type's
// `extends` side reads nothing, and its check side only where an `infer` capture carries the
// subtree into the true result (`conditionalInferenceInputs`) - since that needs the ancestor climb
export function isTSTypeOnlyIdentifierPath(path) {
  if (isTSTypeOnlyIdentifier(path?.parent, path?.key, path?.parentPath?.parent)) return true;
  // Comparison operands select the result; only a check-side subtree captured into that
  // result carries an annotation expectation of its own. The extends pattern reads nothing.
  if (isTypeAnnotationNodeType(path?.node?.type) || isTypeAnnotationNodeType(path?.parentPath?.node?.type)) {
    for (let child = path, current = path?.parentPath; current; child = current, current = current.parentPath) {
      const type = current.node?.type;
      if (!type || PURE_TYPE_ERASE_STOP_TYPES.has(type) || isRuntimeExpressionHost(type)) break;
      if (type === 'TSConditionalType' && child.key === 'extendsType') return true;
      if (type === 'TSConditionalType' && child.key === 'checkType') {
        const inputs = conditionalInferenceInputs(current.node);
        let captured = false;
        for (let inputPath = path; inputPath && inputPath !== current; inputPath = inputPath.parentPath) {
          if (inputs.has(inputPath.node)) {
            captured = true;
            break;
          }
        }
        if (!captured) return true;
      }
    }
  }
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
  for (let current = memberContextPath(path?.parentPath); current; current = memberContextPath(current.parentPath)) {
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

// the root path of the tree `path` stands in: the climb ends where no parent path holds a node
function rootPathOf(path) {
  let root = path;
  while (root?.parentPath?.node) root = root.parentPath;
  return root;
}

// ... and the Program node it holds; a detached path answers null
export function rootProgramOf(path) {
  return rootPathOf(path)?.node ?? null;
}

// the SLOT a node occupies - its owner plus the key or index holding it. an address survives what
// an identity does not: a claim INSIDE the node renders by REPLACING it, and a plan holding the old
// node then finds nothing to swap while the tree keeps the rewrite (a memo shipped the stale source
// read beside a residual that evaluated the same thing again)
export function findNodeSlot(root, target, depth = 0) {
  // this walk descends every OWN key, not the AST's child slots, so what ends it is the shape of the
  // object graph it is handed rather than the source's nesting - the same reason the canon walker
  // carries a ceiling. it THROWS rather than answering, because its answer would be indistinguishable
  // from the honest "not in this subtree" the recursion itself relies on: a caller reading that as
  // "no slot" keeps the receiver spelled beside its memo and reads it twice, and most callers do not
  // read the answer at all. a real tree comes nowhere near this (the corpora peak at 14), so reaching
  // it means a cycle or a graph this walker should never have been handed - both are bugs, not inputs
  if (depth >= 1024) {
    throw new TypeError(brand('findNodeSlot: object graph deeper than the walk supports (cycle, or a non-AST graph)'));
  }
  if (Array.isArray(root)) {
    const at = root.indexOf(target);
    if (at !== -1) return { owner: root, key: at };
    for (const item of root) {
      const found = findNodeSlot(item, target, depth + 1);
      if (found) return found;
    }
    return null;
  }
  if (!root || typeof root !== 'object') return null;
  // eslint-disable-next-line no-restricted-syntax -- perf: AST hot path, plain objects
  for (const key in root) {
    const value = root[key];
    if (value === target) return { owner: root, key };
    if (value && typeof value === 'object') {
      const found = findNodeSlot(value, target, depth + 1);
      if (found) return found;
    }
  }
  return null;
}

// the PATH of a source node, found from any path of the same tree by descending into the child whose
// span holds the node's: a value spelled in another frame (a write in a loop body, a callee's return,
// a call-site argument) resolves its names in THAT frame, which both hosts' paths carry. the descent
// starts at the anchor's nearest ancestor holding the node's span - spans nest, so the node lies below
// it if anywhere, and a neighbour's path costs no descent from the root - and retries from the root
// where that one misses (a node above an ancestor of the very same span). null where no descent
// reaches it (a node a rewrite detached, or one with no span); a node a render moved under nodes it built
// without spans is reached through them (`descendToNode`). a descent ahead of the traversal is not
// free: on the estree side the paths it materializes inside a function not yet visited move a later
// verdict that reads them (a receiver's caller-escape snapshot did), so ask only where the frame counts
// Exact child identity precedes spans: shorthand keys and values can share both offsets.
// Native traversal contexts own paths and scopes: ESTree exposes `ctx`, Babel files `hub`.
// Bare traversals without either reuse their native paths in place. Keep that shared fallback,
// while a fresh context over retained source nodes gets its own existing instance-node cache.
const PATHS_OF_NODES = createInstanceNodeCache();
const NON_CHILD_KEYS = new Set(['leadingComments', 'trailingComments', 'innerComments', 'comments', 'extra', 'loc', 'range']);
export function pathOfNode(anchorPath, node) {
  if (typeof node?.start !== 'number' || typeof node.end !== 'number') return null;
  const context = anchorPath?.ctx ?? anchorPath?.hub ?? PATHS_OF_NODES;
  const known = liveCachedNodePath(context, node);
  if (known) return known;
  let start = anchorPath;
  while (start?.parentPath?.node && !nodeRangeContains(start.node, node)) start = start.parentPath;
  let found = descendToNode(start, node);
  if (!found && start?.parentPath?.node) {
    let root = start;
    while (root.parentPath?.node) root = root.parentPath;
    found = descendToNode(root, node);
  }
  if (found) PATHS_OF_NODES.set(context, node, found);
  return found;
}

// A retained native path can outlive the slot a rewrite moved. Every cache reader
// validates that same physical ancestry before using its scope or placement.
function liveCachedNodePath(context, node) {
  const known = PATHS_OF_NODES.get(context, node);
  return known?.node === node && !ancestorChainDetached(known) ? known : null;
}

// ... one level at a time: a list's item through its span index, a single child through its own span - and where no
// child's span holds the node, through the children a render built with no span at all, which may hold it moved
// there (the rule `descendsBySpanTo` searches by)
function descendToNode(from, node) {
  return withCanonQuestion(() => {
    const context = from?.ctx ?? from?.hub ?? PATHS_OF_NODES;
    let cur = from;
    while (cur?.node && cur.node !== node) {
      const direct = Object.keys(cur.node).find(key => !NON_CHILD_KEYS.has(key) && cur.node[key] === node);
      if (direct) return cur.get(direct);
      let next = null;
      for (const [key, value] of Object.entries(cur.node)) {
        if (NON_CHILD_KEYS.has(key)) continue;
        if (Array.isArray(value)) {
          const at = childSpanOwnerIndex(value, node);
          if (at === -1) continue;
          next = liveCachedNodePath(context, value[at]);
          if (!next) {
            // The container cache holds siblings without refreshing the whole list per descent.
            next = cachedContainerPaths(cur, key)[at];
            if (next?.node === value[at]) PATHS_OF_NODES.set(context, value[at], next);
          }
        } else if (isASTNode(value) && nodeRangeContains(value, node)) {
          next = liveCachedNodePath(context, value);
          if (!next) PATHS_OF_NODES.set(context, value, next = cur.get(key));
        } else continue;
        break;
      }
      if (!next) return descendThroughSpanless(cur, node);
      cur = next;
    }
    return cur?.node === node ? cur : null;
  });
}

// ... the children of `path` a render built with no span, each searched below in turn
function descendThroughSpanless(path, node) {
  for (const [key, value] of Object.entries(path.node)) {
    if (NON_CHILD_KEYS.has(key)) continue;
    if (Array.isArray(value)) {
      for (const [at, item] of value.entries()) {
        if (!isASTNode(item) || hasRange(item)) continue;
        const child = cachedContainerPaths(path, key)[at];
        const found = child?.node === item ? descendToNode(child, node) : null;
        if (found) return found;
      }
    } else if (isASTNode(value) && !hasRange(value)) {
      const found = descendToNode(path.get(key), node);
      if (found) return found;
    }
  }
  return null;
}

// the statements a climb's anchor descends through toward a read: each nests further statements - the
// statement lattice (a list host, a single-statement slot host) and the hosts holding those through another
// slot. below the first that nests none, an expression's subtree holds no container but a function's or a
// class's own frame
const STATEMENT_NESTING_TYPES = new Set([
  ...STATEMENT_LIST_HOST_TYPES,
  ...SINGLE_STATEMENT_SLOTS.keys(),
  'SwitchStatement',
  'SwitchCase',
  'TryStatement',
  'CatchClause',
  'TSModuleDeclaration',
  'ExportNamedDeclaration',
  'ExportDefaultDeclaration',
]);

// the path a declaration climb starts from for a read apart from the use at `path`: the deepest statement
// holding the read, reached from the use's nearest ancestor holding it through the statements that nest it -
// a climb meets only the containers above that statement, so it answers there as it would at the read. an
// ancestor that nests no statement (a declarator, an operand of a selection) has no container between it and
// the read, and is the anchor itself. no expression is descended through: a deep selection costs nothing
function statementPathHolding(path, read) {
  const context = path?.ctx ?? path?.hub ?? PATHS_OF_NODES;
  const known = liveCachedNodePath(context, read);
  if (known) return known;
  let cur = path;
  while (cur.parentPath?.node && !nodeRangeContains(cur.node, read)) cur = cur.parentPath;
  while (STATEMENT_NESTING_TYPES.has(cur.node.type)) {
    let next = null;
    for (const [key, value] of Object.entries(cur.node)) {
      if (NON_CHILD_KEYS.has(key)) continue;
      if (Array.isArray(value)) {
        const at = childSpanOwnerIndex(value, read);
        if (at === -1) continue;
        next = cachedContainerPaths(cur, key)[at];
      } else if (isASTNode(value) && nodeRangeContains(value, read)) next = cur.get(key);
      else continue;
      break;
    }
    if (!next?.node) break;
    cur = next;
  }
  return cur;
}

// the scope a write stands in, where the names its value reads resolve - a block around the write may
// rebind one the declaration and the read never see - through the write's own path (`pathOfNode`);
// `fallback` for a node with no span
export function writeScopeAt(anchorPath, write, fallback = null) {
  return pathOfNode(anchorPath, write)?.scope ?? fallback;
}

// which item of a child list holds `node`'s span, -1 when none does: the items of one list do not
// nest, so the span index answers it by halving (`spanIndexOwner`) - a scan per descent of a flat
// program's body is quadratic over the calls. the index is kept per list, and rebuilt once the list
// no longer matches it (an emitter inserted or replaced an item)
const childSpanIndexes = new WeakMap();
function childSpanOwnerIndex(items, node) {
  let index = childSpanIndexes.get(items);
  if (index?.length !== items.length) {
    const spans = [];
    for (const [i, item] of items.entries()) {
      if (typeof item?.type === 'string' && hasRange(item)) spans.push({ start: item.start, end: item.end, i });
    }
    childSpanIndexes.set(items, index = { ...buildSpanIndex(spans), length: items.length });
  }
  const owner = spanIndexOwner(index, node);
  if (!owner) return -1;
  const item = items[owner.i];
  return item?.start === owner.start && item.end === owner.end ? owner.i : -1;
}

// name -> the module source of the first top-level declaration binding it, in body order: a
// runtime default binding (including `import { default as x }`), a TS `import x = require(...)`, or a `var`-style require declarator in
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
  const requireShadowed = declaresRequireBinding(root);
  for (const stmt of body) {
    // `export const x = require(...)` / `export import x = require(...)`: neither the export
    // wrapper (babel@8 / oxc) nor the modifier babel@7 flags on the node changes what the local
    // binding holds, so the table reads the declaration the way the resolution canon does
    const decl = unwrapExportedDeclaration(stmt);
    if (decl?.type === 'ImportDeclaration') {
      if (isTypeOnlyImportKind(decl.importKind)) continue;
      for (const sp of decl.specifiers ?? []) {
        if (bindsModuleDefault(sp) && !isTypeOnlyImportKind(sp.importKind) && sp.local?.name && !sources.has(sp.local.name)) {
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
// peels them - several stacked ones too (`delete (a?.b)` is a paren over a chain), compared by the
// core both sides wrap - and a guard the emit already rendered sits between too (`delete (null ==
// t ? void 0 : X.name)`): on the defined branch the member still IS the delete operand, so the
// climb steps through the branch it fills. single source for both emitters' claim-side gate
export function claimDeleteOperand(path) {
  let step = path;
  for (;;) {
    const up = step?.parentPath;
    if (!up?.node) return false;
    const throughBranch = up.node.type === 'ConditionalExpression'
      && (up.node.alternate === step.node || up.node.consequent === step.node);
    if (!throughBranch && unwrapRuntimeExpr(up.node) !== unwrapRuntimeExpr(step.node)) return isDeleteTarget(up.node);
    step = up;
  }
}
export const isUpdateTarget = parent => parent?.type === 'UpdateExpression';

// the `delete` a guard standing for `child` owes its whole act to: the operator over the CONTINUATION
// of the guarded value - members through their objects, calls through their callees, and the TS
// layers between them, whose `!` ends nothing. a `?.` of a link's own continues it too: it re-tests a
// value the guard has already passed, and keeps doing so inside the operand. only a paren between two
// links ends it, sealing the value away from the operator - the read past the seal throws where the
// source throws, and one around the WHOLE operand seals nothing. `up` is the path above `child`, which
// may be a fresh render with no path of its own; `sealed` answers the paren question for a node, for
// a dialect that records it off the node
export function deleteOverOpenContinuation(child, up, sealed = node => !!node.extra?.parenthesized) {
  let node = child;
  let path = up;
  while (!sealed(node)) {
    const link = path?.node;
    const continues = TS_EXPR_WRAPPERS.has(link?.type) ? link.expression === node
      : (isMemberAccessNode(link) && link.object === node)
        || ((link?.type === 'CallExpression' || link?.type === 'OptionalCallExpression') && link.callee === node);
    if (!continues) break;
    node = link;
    path = path.parentPath;
  }
  while (path?.node && SKIPPABLE_WRAPPER_TYPES.has(path.node.type) && path.node.expression === node) {
    node = path.node;
    path = path.parentPath;
  }
  return isDeleteTarget(path?.node) ? path : null;
}

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

// does a relocated host bind its default-guard refs as block `let`s of its own? a relocated `const`
// head keeps its kind, and its refs take the hoisted `var` every `const` declaration takes
export function relocatedHostFoldsGuardRefs(declaratorPath) {
  return declaratorPath?.parentPath?.node?.kind !== 'const' && !!relocatedHostPattern(declaratorPath);
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
    return host.node.param?.type === 'Identifier' && relocatedInitNamesHost(init, host.node.param.name, host.node.body)
      ? { body: host.node.body, skip: declaration.node } : null;
  }
  // ... and the LOOP HEAD's relocation is the same shape one host over: the head binds the minted
  // name and the pattern is the body's first statement, so a claim under it reads the same way
  if (host?.node?.type === 'ForOfStatement' || host?.node?.type === 'ForInStatement') {
    const { left } = host.node;
    const loopId = left?.type === 'VariableDeclaration' && left.declarations?.length === 1
      ? left.declarations[0].id : null;
    return loopId?.type === 'Identifier' && relocatedInitNamesHost(init, loopId.name, host.node.body)
      ? { body: host.node.body, skip: declaration.node } : null;
  }
  return null;
}

// does a relocated pattern's init name the host's own binding? directly, or through ONE memo of it
// the drain declared beside the pattern - as a sibling declarator or a statement of its own
// (`let _ref2 = _ref, { ... } = _ref2;`): a later round re-detects the pattern off that memo, and
// its host is still the clause
function relocatedInitNamesHost(init, hostName, body) {
  if (init.name === hostName) return true;
  // a BODYLESS host (a nested loop is the outer one's unbraced body) holds no statement list
  return (Array.isArray(body?.body) ? body.body : []).some(statement => statement.type === 'VariableDeclaration'
    && statement.declarations.some(item => item.id?.type === 'Identifier' && item.id.name === init.name
      && item.init?.type === 'Identifier' && item.init.name === hostName));
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

// the side a guarded claim DETACHES to beside its host so source order holds: the pattern's first
// property goes 'before', its last 'after', and a middle one has no side - it splits only when every
// sibling is guarded too. the render (`planGuardedDestructureNarrow`) and the census predicting it ask
export function patternEdgeSide(patternNode, propNode) {
  const at = patternNode.properties.indexOf(propNode);
  return at === 0 ? 'before' : at === patternNode.properties.length - 1 ? 'after' : null;
}

// object-prop node across parsers: estree `Property`, babel `ObjectProperty`
export function isPropertyNode(node) {
  return node?.type === 'Property' || node?.type === 'ObjectProperty';
}

// does the pattern subtree carry ANY slot default (`X = d`) at ANY depth? a residual leaf default
// must defer anchoring at every nesting level, not just the top - a nested default (`nested: { x = d }`)
// re-anchored to the pure ctor renders verbatim, so a polyfillable `d` is never injected
export function patternHasAnyDefault(node) {
  while (isRestProperty(node)) node = node.argument;
  switch (node?.type) {
    case 'AssignmentPattern': return true;
    case 'ArrayPattern': return node.elements.some(patternHasAnyDefault);
    case 'ObjectPattern': return node.properties.some(prop => patternHasAnyDefault(
      isRestProperty(prop) ? prop.argument : prop.value));
    default: return false;
  }
}

// the DEFAULT VALUES a pattern spells, at any depth, collected into `out`. Each carries a claim of
// its own, so a render that replaces the pattern's receiver owes them their visibility - the twin of
// the predicate above, for the caller that has to rescue what the predicate only counts
export function collectPatternDefaultValues(node, out) {
  while (isRestProperty(node)) node = node.argument;
  switch (node?.type) {
    case 'AssignmentPattern':
      out.push(node.right);
      collectPatternDefaultValues(node.left, out);
      break;
    case 'ArrayPattern':
      for (const element of node.elements) collectPatternDefaultValues(element, out);
      break;
    case 'ObjectPattern':
      for (const prop of node.properties) {
        collectPatternDefaultValues(isRestProperty(prop) ? prop.argument : prop.value, out);
      }
      break;
    default: break;
  }
  return out;
}

// Accept an object or array pattern value with no defaults anywhere and no rest at its root.
// The mirror supplies the ponyfill while keys and nested pattern operations remain in place.
export function isMirrorablePatternValue(node) {
  return !patternHasAnyDefault(node) && (node?.type === 'ObjectPattern' && node.properties.every(isPropertyNode)
    || node?.type === 'ArrayPattern' && node.elements.every(element => !element || element.type !== 'RestElement'));
}

// what dropping an object LITERAL would take with it: a property whose value runs an effect, and a
// SPREAD, which reads the source's own enumerable keys and so runs whatever getters it holds. asked
// wherever a consumed level drops the literal it paired with - `exceptProp` is the paired property
// itself, whose value the consume re-spells. `ctx` asks the scoped question: a slot reading a getter runs it
export function objectLiteralHoldsObservable(objectNode, exceptProp = null, ctx = null) {
  return (objectNode?.properties ?? []).some(prop => prop !== exceptProp
    && (isRestProperty(prop) || mayHaveSideEffects(prop.value, ctx)));
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
// every step adds the current node, re-visiting any prior bails the walk - which is why the
// sequence peel steps over a tail's own wrappers itself (`(0, (cond ? A : B))`, oxc keeping the
// parens, a TS cast alike): the tail it records would otherwise end the walk on the wrapper
export function peelFallbackReceiver(node, staticIsMutated = null) {
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
    node = peelSequenceTail(unwrapRuntimeExpr(node), { visited, step: unwrapRuntimeExpr });
    // outer loop's top adds `node` to `visited` at the next iteration and bails on
    // re-entry; don't pre-add `iifeInner` here or we short-circuit before iterating through
    // a legitimate nested-IIFE peel chain (`(() => (() => expr)())()` -> outer peeled to
    // inner CallExpression on this iter, then iter+1 peels inner to expr)
    const iifeInner = peelZeroArgIifeReturn(node, { staticIsMutated });
    if (iifeInner) node = iifeInner;
  }
  return node;
}

// a HOP prop whose key carries an effect (`{ [(eff(), 'Array')]: { from } }`): its level keeps it
// the way a REST sibling keeps a consumed hop - the hop retires to a sentinel, so the key runs
// exactly once where the source wrote it, and the claims below extract off the slot the folded key
// names
export function isEffectfulKeyHop(prop, ctx = null) {
  return (prop?.type === 'Property' || prop?.type === 'ObjectProperty')
    && isDestructurePattern(patternSlotTarget(prop.value)) && computedKeyHasSideEffects(prop, ctx);
}

// ... asked of ONE level: does this pattern hold such a hop among its own props?
export function patternLevelKeepsEffectfulHop(pattern, ctx = null) {
  return pattern?.type === 'ObjectPattern' && pattern.properties.some(prop => isEffectfulKeyHop(prop, ctx));
}

// does this LEVEL keep its consumed props as sentinels - a rest sibling gathers by exclusion, and a
// key with an effect (a hop's or a leaf's own) has to run where it stands
export function patternLevelKeepsSentinels(pattern, ctx = null) {
  return !!pattern?.properties?.some(prop => isRestProperty(prop) || computedKeyHasSideEffects(prop, ctx));
}

// ... and of the HOST: does any level below carry such a hop?
export function patternKeepsEffectfulHop(pattern, ctx = null) {
  const node = patternSlotTarget(pattern);
  if (node?.type === 'ArrayPattern') return node.elements.some(element => patternKeepsEffectfulHop(element, ctx));
  if (node?.type !== 'ObjectPattern') return false;
  return node.properties.some(prop => isEffectfulKeyHop(prop, ctx) || patternKeepsEffectfulHop(prop.value, ctx));
}

const restReadBeforeNestedBinding = createInstanceNodeCache();
// A computed exclusion before a nested binding cannot split around that binding
// without repeating its getter. Such rest patterns stay native in pure mode.
// Inspect pattern targets only; computed keys and default expressions have their own hosts.
// This is an admission fact about the original syntax, shared by sibling claims before
// emission. Pruning leaves must not reopen that source boundary. A replacement pattern
// or a new adapter gets its own fact; no claim, receiver or mutable plan is cached here.
export function patternHasRestReadBeforeNestedBinding(pattern, adapter) {
  const node = patternSlotTarget(pattern);
  if (!isDestructurePattern(node)) return false;
  if (restReadBeforeNestedBinding.has(adapter, node)) return restReadBeforeNestedBinding.get(adapter, node);
  let result = false;
  if (node.type === 'ArrayPattern') {
    result = node.elements.some(element => patternHasRestReadBeforeNestedBinding(element, adapter));
  } else {
    const rest = node.properties.some(isRestProperty);
    let computedRead = false;
    for (const prop of node.properties) {
      if (!isPropertyNode(prop)) continue;
      if ((rest && computedRead && isDestructurePattern(patternSlotTarget(prop.value)))
        || patternHasRestReadBeforeNestedBinding(prop.value, adapter)) {
        result = true;
        break;
      }
      computedRead ||= prop.computed;
    }
  }
  restReadBeforeNestedBinding.set(adapter, node, result);
  return result;
}

// The slots of one destructuring pattern in evaluation order: each with the property that holds it,
// the target it writes (none for a level that only nests another) - a binding by its name, a member
// by its root binding and key path, where a key nothing folds or a root that is no binding may be any
// other - the object depth it stands at, whether a positional level stands above it, what it
// evaluates before the write (a computed key without an effect, a default, a member target's own
// parts) and whether it BREAKS the pattern into ordered pieces: an effectful key or default, or a
// member target, is written in its own slot.
function indexPatternSlots(top, ctx) {
  const slots = [];
  function walk(node, prop, levels, depth, positional, reads, breaks) {
    const level = levels.at(-1) ?? null;
    let slot = node;
    if (slot?.type === 'AssignmentPattern') {
      reads.push(slot.right);
      breaks ||= mayHaveSideEffects(slot.right, ctx);
      slot = slot.left;
    }
    slot = unwrapRuntimeExpr(slot);
    if (slot?.type === 'Identifier' || isMemberAccessNode(slot)) {
      let target = { name: slot.name };
      if (slot.type !== 'Identifier') {
        reads.push(slot);
        const { root, keys } = memberChainKeys(slot, staticMemberKeyName);
        target = { root: root?.type === 'Identifier' ? root.name : null, path: keys };
      }
      slots.push({ prop, level, levels, target, depth, positional, reads, breaks: breaks || slot.type !== 'Identifier' });
      return;
    }
    if (reads.length || breaks) slots.push({ prop, level, levels, target: null, depth, positional, reads, breaks });
    if (slot?.type === 'ObjectPattern') {
      for (const item of slot.properties) {
        if (isRestProperty(item)) walk(item.argument, item, [...levels, slot], depth + 1, positional, [], false);
        else {
          const effectfulKey = computedKeyHasSideEffects(item, ctx);
          walk(item.value, item, [...levels, slot], depth + 1, positional, item.computed && !effectfulKey ? [item.key] : [], effectfulKey);
        }
      }
    } else if (slot?.type === 'ArrayPattern') {
      for (const element of slot.elements) {
        walk(element?.type === 'RestElement' ? element.argument : element, element, [...levels, slot], depth, true, [], false);
      }
    }
  }
  walk(top, null, [], 0, false, [], false);
  return slots;
}

// Whether a property's key or default reads one of the named pattern bindings. A declaration's
// function-valued default defers its body; an assignment can observe its existing bindings there.
export function patternPropReadsBindings({ prop, names, assignmentTarget = false }) {
  const holder = prop?.type === 'AssignmentPattern' ? prop : prop?.value;
  const parts = [...prop?.computed ? [prop.key] : [], ...holder?.type === 'AssignmentPattern' ? [holder.right] : []];
  return parts.some(expression => (assignmentTarget || !FUNCTION_LIKE_NODE_TYPES.has(expression.type))
    && names.some(name => !!name && identifierReferencedInSubtree(expression, name)));
}

// Extraction writes a claim apart from the residual. On a flat level of a statement or a declaration
// the claims go ahead of the writes the residual keeps, piece by piece between the slots that break
// the pattern (`indexPatternSlots`), so an EARLIER slot of the claim's piece that writes its target
// (a claim on the same level aside: it is written in turn), rebinds a member target's root or reads
// the target would see that order reversed. A nested claim on an assignment may instead be overwritten
// behind the statement - which route takes it depends on the receiver - so any other slot counts there.
// A nested claim's statics also join the capture of its hop ahead of the slots before it on its level,
// positional levels included, so an earlier read counts across a break there; a declaration defers a
// read inside a closure past every write. A consumed or bodyless assignment (`segmented`) writes slot
// by slot, and an ordered capture (`isCaptured`) writes the claim's level in source order after the
// levels above it. A capture plan with `splitCapture` also keeps outer siblings in source order.
// A claim whose own default or computed key reads the target of a LATER slot needs a flat ordered
// capture: a nested capture or extraction can still run that part after the write it preceded.
// Returns the properties whose claim keeps its native read in pure mode.
export function orderBoundPatternProps({ top, assignmentTarget, segmented = false, isClaim = null, isCaptured = null, ctx = null }) {
  const bound = new Set();
  if (segmented) return bound;
  const slots = indexPatternSlots(top, ctx);
  slots.forEach((own, at) => {
    if (!own.target) return;
    if (patternPropReadsBindings({ prop: own.prop, names: slots.slice(at + 1).map(slot => slot.target?.name), assignmentTarget })) {
      if (!isCaptured?.(own.prop)?.flat) bound.add(own.prop);
      return;
    }
    const { name = null, root = null, path = null } = own.target;
    const behind = !own.positional && assignmentTarget && own.depth > 1;
    let from = at;
    while (from > 0 && !slots[from - 1].breaks) from--;
    function reads(expression) {
      return (assignmentTarget || !FUNCTION_LIKE_NODE_TYPES.has(expression.type))
        && ((name ?? root) === null || identifierReferencedInSubtree(expression, name ?? root));
    }
    function conflict(slot) {
      return !!slot.target && (root !== null && slot.target.name === root
        || (name !== null || slot.target.name !== undefined ? slot.target.name === name
          : (slot.target.root === null || root === null || slot.target.root === root)
            && (slot.target.path.length !== path.length
              || path.every((key, i) => key === null || slot.target.path[i] === null || key === slot.target.path[i]))));
    }
    const others = slots.filter((slot, index) => index !== at && (!slot.positional || slot.level === own.level));
    const routed = others.some(slot => {
      const index = slots.indexOf(slot);
      const inPiece = !own.positional && (behind || (!own.breaks && index >= from && index < at));
      if ((inPiece || (own.depth > 1 && index < at)) && slot.reads.some(reads)) return true;
      if (!inPiece || !conflict(slot)) return false;
      return behind || slot.level !== own.level || !isClaim?.(slot.prop) || (root !== null && slot.target.name === root);
    });
    // A deferred leaf capture overtakes a later outer sibling. A split capture writes its leaf
    // before that sibling, so ask the route even where both deferred routes would be bound.
    const captured = own.depth > 1 && others.some(slot => slots.indexOf(slot) > at && !slot.levels.includes(own.level)
      && (slot.reads.some(reads) || conflict(slot)));
    if (routed || captured) {
      const capture = isCaptured?.(own.prop);
      if (capture ? !capture.splitCapture && captured : routed) bound.add(own.prop);
    }
  });
  return bound;
}

// side-effecting COMPUTED key of a destructure prop (`[(eff(), 'from')]`, `[(eff(), 'fr') + 'om']`).
// the single gate both flatten emitters dispatch on, so the key-effect decision can't drift
// between them; a non-computed key is a static name and never carries an effect
export function computedKeyHasSideEffects(propNode, ctx = null) {
  return !!propNode?.computed && mayHaveSideEffects(propNode.key, ctx);
}

// does a KEPT effectful key make the residual perform the receiver's ONE read - so a dispatch beside
// it may not spell that member again, and has to SHARE the read through a memo instead? The key keeps
// its slot wherever it carries an effect, and the residual then reads the receiver exactly where and
// as often as the source does; a dispatch spelling the member a second time reads it twice, which is
// what the memo in the receiver's own slot exists to prevent. The HOST facts are the caller's, one
// per binding: a level NESTED under a property, and a REST sibling gathering beside the claim, each
// keep the read on a route of their own
export function seKeyKeepsReceiverRead({ prop, receiver, nested = false, restSibling = false, ctx = null }) {
  if (nested || restSibling || !computedKeyHasSideEffects(prop, ctx)) return false;
  // a SEQUENCE hands its TAIL on, and the memo takes the element WHOLE - its prefix included - so
  // the read the key keeps is that tail's, and the prefix stays exactly where the source ran it.
  // reading the sequence node itself instead answered "no member here" and left the claim native
  const read = peelSequenceTail(unwrapRuntimeExpr(receiver), { step: unwrapRuntimeExpr });
  return read?.type === 'MemberExpression' || read?.type === 'OptionalMemberExpression';
}

// does an object pattern spell SEVERAL keys with effects, claimed or not? native runs key, read, key,
// read, so every claim segments at its own key even beside a key nobody claims - the count both
// emitters interleave by. never with a rest: it gathers by exclusion and takes no segment
export function patternHasSeveralSeKeys(pattern, threshold = 2, ctx = null) {
  const props = pattern?.type === 'ObjectPattern' ? pattern.properties : [];
  return props.every(item => !isRestProperty(item))
    && props.filter(item => computedKeyHasSideEffects(item, ctx)).length >= threshold;
}

// SE-bearing prefix of a multi-operand SequenceExpression (all but the consumed last operand),
// or null when the node is not such a sequence or its prefix is side-effect-free. used by
// resolve.js's `bailOnSideEffectKey` gate - callers that only need to KNOW a prefix has effects,
// not harvest the surviving tail's nested SE (that recursive harvest is
// `collectFoldedReceiverSideEffects`, which the `in`-expression paths use)
export function sequencePrefixWithSideEffects(expr, ctx = null) {
  if (expr?.type !== 'SequenceExpression' || expr.expressions.length < 2) return null;
  const prefix = expr.expressions.slice(0, -1);
  return prefix.some(expression => mayHaveSideEffects(expression, ctx)) ? prefix : null;
}

// one member of a discarded container: a NESTED container recurses (re-emitting the whole literal
// would rebuild it for nothing), anything else is pushed when it carries an effect - the same
// push-if-observable rule the sequence prefix uses, including source reads in its preservation mode
function collectContainerMemberSideEffect(node, { out, rescue, ctx, preserveSourceReads }) {
  if (node?.type === 'ObjectExpression' || node?.type === 'ArrayExpression') {
    collectFoldedReceiverSideEffects(node, { out, rescue, ctx, preserveSourceReads });
  } else if (preserveSourceReads ? node && !performsNothing(node, ctx) : mayHaveSideEffects(node, ctx)) out.push(node);
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
// the assignment pushed whole (the `in`-fold / general discard, which re-emits nothing separately).
// `ctx` is the caller's scope: every "does this run?" question below is then the scoped one, so a
// getter read the discard would erase is harvested like any other effect. A substituted computed
// key also keeps source prefix reads that can throw (`preserveSourceReads`); import-only usage
// leaves the key in place and needs no such replay.
export function collectFoldedReceiverSideEffects(node, {
  out = [], rescue = null, chainAssignAt = null, ctx = null, preserveSourceReads = false,
} = {}) {
  const nested = { out, rescue, ctx, preserveSourceReads };
  let cur = node;
  while (cur && SKIPPABLE_WRAPPER_TYPES.has(cur.type)) cur = cur.expression;
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
      for (const e of cur.expressions.slice(0, -1)) {
        if ((preserveSourceReads ? !performsNothing(e, ctx) : mayHaveSideEffects(e, ctx)) || rescue?.has(e)) out.push(e);
      }
      collectFoldedReceiverSideEffects(cur.expressions.at(-1), { ...nested, chainAssignAt });
      break;
    case 'MemberExpression':
    case 'OptionalMemberExpression':
      collectFoldedReceiverSideEffects(cur.object, { ...nested, chainAssignAt });
      if (cur.computed) {
        const keyValue = peelSequenceTail(unwrapRuntimeExpr(cur.property), { step: unwrapRuntimeExpr });
        if ((keyValue?.type === 'CallExpression' || keyValue?.type === 'OptionalCallExpression')
          && !zeroArgIifeSideEffectFree(keyValue, ctx)) {
          collectFoldedReceiverSideEffects(cur.property, nested);
          out.push(keyValue);
        } else collectFoldedReceiverSideEffects(cur.property, nested);
      }
      break;
    // mirror the other shapes `resolveKey` folds to a static key: a `+`-concat (`(eff(), 'fr') + 'om'`)
    // and a TemplateLiteral (`` `${(eff(), 'fr')}om` ``). resolveKey peels each operand's sequence tail
    // and discards the prefix, so the discarded prefix's effects must be harvested here too. recurse
    // operands in source-eval order (left before right; template expressions left to right). this
    // harvest stays a SUPERSET of resolveKey's resolvable fold shapes (sequence-tail / computed-member
    // / `+` / template) - a shape resolveKey does NOT fold never reaches a fold branch
    case 'BinaryExpression':
      collectFoldedReceiverSideEffects(cur.left, nested);
      collectFoldedReceiverSideEffects(cur.right, nested);
      break;
    case 'TemplateLiteral':
      for (const e of cur.expressions) collectFoldedReceiverSideEffects(e, nested);
      break;
    // a CONTAINER literal is discarded WHOLE by the static-container collapse (`{ k: { keys } } =
    // { k: Object, x: eff() }` becomes `keys = _Object$keys`), so every effect it carries goes with
    // it - in a sibling member as much as in the consumed one. walk members in source-eval order:
    // an object's computed key evaluates before its value, and elements left to right
    case 'ObjectExpression':
      // A spread performs its own property reads; evaluating its argument alone cannot replay
      // them. Keep the containing literal so keys, getters and following values stay ordered.
      if (cur.properties.some(prop => prop.type === 'SpreadElement')) {
        out.push(cur);
        break;
      }
      for (const prop of cur.properties) {
        if (prop.computed) collectContainerMemberSideEffect(prop.key, nested);
        collectContainerMemberSideEffect(prop.value, nested);
      }
      break;
    case 'ArrayExpression':
      // The iterator protocol belongs to the spread slot too, including its possible throw.
      if (cur.elements.some(element => element?.type === 'SpreadElement')) {
        out.push(cur);
        break;
      }
      for (const element of cur.elements) {
        collectContainerMemberSideEffect(element, nested);
      }
      break;
    // a branching receiver is discarded WHOLE, exactly like a sequence prefix: the test always runs
    // and the taken branch's effects go with the value. pushing the branch NODE (not its parts) keeps
    // each side conditional - re-emitting an operand alone would run it unconditionally. without this
    // the fold ERASED the operand: `'flat' in (arr || (log.push('x'), [1]))` printed a bare `true`.
    // a selection this build decides runs the operand it folds to alone, its test a plain read, so
    // that operand is harvested as the value, as spelled alone: pushed whole, the fold later left its
    // inert parts behind (`(log(), { C: _Iterator }, _Iterator$from)`). no receiver spine runs through
    // a selection, so a store in that operand is pushed whole, never left to the chain-assign re-emit
    // Replay mode also keeps potentially throwing reads of the test and the selected arm.
    case 'ConditionalExpression':
    case 'LogicalExpression': {
      const decision = ctx?.adapter?.decidedSelection?.(cur, ctx);
      if (typeof decision?.fold === 'string') collectFoldedReceiverSideEffects(cur[decision.fold], nested);
      else if (preserveSourceReads ? !performsNothing(cur, ctx) : mayHaveSideEffects(cur, ctx)) out.push(cur);
      break;
    }
    case 'AssignmentExpression':
      // receiver-spine chain-assign under position-mode: record its eval slot (the emit re-emits it),
      // else push whole (a discarded assignment value)
      if (chainAssignAt && chainAssignAt.at === null) chainAssignAt.at = out.length;
      else out.push(cur);
      break;
  }
  return out;
}

// peel a transparent IIFE call to its underlying receiver expression. covers three
// pass-through shapes (in increasing scope of evaluation, all valid as a single peel):
//   - zero-arg + zero-param: `(() => expr)()` -> `expr`
//   - identity: `(arg => arg)(X)` / `((a, b) => b)(X, Y)` -> the arg matching the body's
//     returned param (positional)
//   - param-free body: `(arg => globalThis)(X)` -> `globalThis`. body doesn't reference
//     any param; the IIFE is a no-shadow pass-through (args evaluated for side-effect,
//     return value is the body verbatim). factory wrappers `(arg => { setup(arg); return
//     arg; })(X)` also fit here when intermediates don't rebind a param
// returns null for non-IIFE callees, async/generator functions, undecidable positional
// arguments, destructure params, bodies with control flow / non-ExpressionStatement intermediates / prefix
// reassignments to params, or bodies whose free variables overlap params without
// matching the identity shape. `preservesBody` admits the retained-body grammar: callers using it
// keep the original call and only inspect the identity returned from its own scope.
// Inline-array spreads are positional only while the scoped mutation callback proves their
// iterator pristine; a census without that callback keeps its source-shape over-approximation.
export function peelZeroArgIifeReturn(node, { preservesBody = false, staticIsMutated = null } = {}) {
  if (node?.type !== 'CallExpression' && node?.type !== 'OptionalCallExpression') return null;
  // peel paren / TS-wrappers + SequenceExpression tail off the callee. `unwrapRuntimeExpr`
  // stops at SE; `(0, () => Array)()` (comma-sequence prefix on the callee) is a common
  // wrapper shape that should still recognise as IIFE. mirror `immediateInvocationOf` which
  // already accepts SE-prefixed callees for the IIFE-identity gate
  const callee = peelSequenceTail(unwrapRuntimeExpr(node.callee), { step: unwrapRuntimeExpr });
  if (callee?.type !== 'ArrowFunctionExpression' && callee?.type !== 'FunctionExpression') return null;
  if (callee.async || callee.generator) return null;
  const args = node.arguments ?? [];
  // Preserve the syntactic inline-list admission. Scoped positional lifting below also
  // requires the selected argument to precede every undecidable runtime spread.
  const effectiveLength = effectiveArgsLength(args);
  if (effectiveLength === null) return null;
  const params = callee.params ?? [];
  const paramNames = collectParamBindingNames(params);
  if (paramNames === null) return null;
  const body = preservesBody
    ? paramReboundInBody(callee.body, paramNames) ? null
    : unwrapExpressionChain(singleReturnBodyExpression(callee.body, { preservesBody })) ?? null
    : iifeBodyReturn(callee, paramNames);
  if (body === null) return null;
  // identity IIFE: body is a bare param Identifier - lift the matching arg by position.
  // requires effective args count === params.length so positional match is unambiguous
  if (body.type === 'Identifier' && paramNames.has(body.name) && effectiveLength === params.length) {
    const i = params.findIndex(p => p?.type === 'Identifier' && p.name === body.name);
    if (i !== -1) {
      const lifted = resolveCallArgument(args, i, staticIsMutated);
      if (lifted) return lifted;
    }
  }
  // zero-arg/zero-param OR param-free body: lift the body verbatim (resolver-side
  // classification ignores arg side effects since it only needs receiver shape)
  return bodyHasParamReference(body, paramNames) ? null : body;
}

// peel zero-arg IIFEs returning the target so an inline `(() => X)()` resolves like `X`, to a
// fixpoint (a nested `(() => (() => X)())()` peels every layer), re-unwrapping between peels.
// `node` must already be runtime-unwrapped. shared by the container and global resolvers and the
// alias-init lookup so the wrapper resolves identically on every path into container / global
// resolution (an inline extends-IIFE, one bound to a const alias, and any depth of nesting).
// each peel consumes one IIFE layer off a finite AST, so the loop always terminates
export function peelIifeReturnTarget(node, staticIsMutated = null) {
  while (node?.type === 'CallExpression' || node?.type === 'OptionalCallExpression') {
    const ret = peelZeroArgIifeReturn(node, { staticIsMutated });
    if (!ret) break;
    node = unwrapRuntimeExpr(ret);
  }
  return node;
}

// true when evaluating a zero-arg IIFE is observably pure, so DROPPING the whole call loses no side
// effect. `peelZeroArgIifeReturn` strips a body prefix / arg effects to expose the return shape -
// fine for usage-global, which keeps the node in place. usage-pure RELOCATES a computed key by
// removing the key node, so it may peel an IIFE key only when this confirms the args, callee prefix
// and body carry no effects. shapes mirror the peel above (it gates the caller, so structure is valid)
export function zeroArgIifeSideEffectFree(node, ctx = null) {
  if (node?.type !== 'CallExpression' && node?.type !== 'OptionalCallExpression') return false;
  if ((node.arguments ?? []).some(argument => !exprSideEffectFree(argument, ctx))) return false;
  // an effectful prefix refuses the descent, and the sequence node it stops on fails the callee
  // type check below - the same `false` the hand-written loop returned from inside itself
  const callee = peelSequenceTail(unwrapRuntimeExpr(node.callee), {
    step: unwrapRuntimeExpr,
    onPrefix: expressions => expressions.slice(0, -1).every(expression => exprSideEffectFree(expression, ctx)),
  });
  if (callee?.type !== 'ArrowFunctionExpression' && callee?.type !== 'FunctionExpression') return false;
  const { body } = callee;
  if (body?.type !== 'BlockStatement') return exprSideEffectFree(body, ctx);
  const stmts = body.body ?? [];
  for (let i = 0; i < stmts.length - 1; i++) {
    if (stmts[i]?.type !== 'ExpressionStatement' || !exprSideEffectFree(stmts[i].expression, ctx)) return false;
  }
  return exprSideEffectFree(stmts.at(-1)?.argument, ctx);
}

// an expression is observably pure if it has no side effects, OR is itself a droppable pure zero-arg
// IIFE - a nested `(() => (() => 'x')())()` evaluates purely even though each CallExpression alone
// reads as effectful. bounded recursion: the nested IIFE is strictly smaller. `ctx` asks the scoped question
function exprSideEffectFree(node, ctx = null) {
  return !mayHaveSideEffects(node, ctx) || zeroArgIifeSideEffectFree(node, ctx);
}

// does the body WRITE through this parameter - an assignment, update or `delete` landing in a slot
// of the value it holds? such a callee hands its caller an object the call site's own literal no
// longer describes (`_defineProperty(obj, key, value)`, the computed-key lowering every ES5 output
// carries, is that shape), so a reader resolving the call to that argument reads the slot the write
// already replaced. a plain READ of the parameter - handing it to another call, logging it - moves
// no slot and is no reason to refuse: that is the ESCAPE census's question, not this one
export function bodyWritesThroughParameter(callee, paramName) {
  let written = false;
  walkAstNodes({ root: callee?.body, visit(node, parentNode) {
    if (written) return false;
    if (isMemberAccessNode(node) && isMemberMutationContext(node, parentNode)
      && unwrapRuntimeExpr(runtimeChainRoot(node))?.name === paramName) written = true;
    return !written;
  } });
  return written;
}

// WHICH shapes hand their contents out, read by every walk that follows a container: the literals a
// name can be bound to, plus the class whose own statics are the same named surface
export const CENSUS_CONTAINER_TYPES = new Set([
  'ArrayExpression',
  'ClassDeclaration',
  'ClassExpression',
  'ObjectExpression',
]);

// did the argument reach ONLY the return - no other reference anywhere in the callee? two readers
// ask it, for reasons that meet on the same answer. The ESCAPE census asks because a second READ
// hands the value somewhere it must account for. The VALUE fold asks about a CONTAINER argument,
// which its reader descends by SLOT: any reference the callee keeps can replace one - a member
// write, a handout to something that writes, a write through a local alias of it - and the literal
// the reader trusts no longer describes the object handed back. A bare NAME needs no such proof:
// what it resolves to does not move, and a write into that object's own slots is the mutated-static
// census's question rather than this one.
// An identity return carries its argument back to the call site. Unrelated prefix effects stay
// in the source and do not expose that argument. The returned slot may be at any parameter
// position; a second read in the body or parameter defaults/keys remains opaque.
export function paramReturnsTheValue(callee, paramIndex, referencesArguments = undefined) {
  if (callee?.async || callee?.generator) return false;
  const params = dropLeadingThisParam(callee?.params ?? []);
  const param = params[paramIndex];
  if (param?.type !== 'Identifier') return false;
  const { body } = callee;
  const { name: paramName } = param;
  const statements = body?.type === 'BlockStatement' ? body.body : null;
  const returned = !statements ? body : statements.at(-1)?.type === 'ReturnStatement' ? statements.at(-1).argument : null;
  const value = unwrapRuntimeExpr(returned);
  const tail = value?.type === 'SequenceExpression' ? unwrapRuntimeExpr(value.expressions.at(-1)) : value;
  if (tail?.type !== 'Identifier' || tail.name !== paramName) return false;
  if (params.some((slot, index) => index < paramIndex && slot.type === 'RestElement')
    || params.some((slot, index) => index !== paramIndex && identifierReferencedInSubtree(slot, paramName))
    || statements?.slice(0, -1).some(stmt => stmt.type !== 'ExpressionStatement'
      || identifierReferencedInSubtree(stmt, paramName))) return false;
  // a SEQUENCE hands its TAIL on, so a body spelled `(0, a)` returns the parameter exactly as the
  // bare `a` does. the PREFIX has to be clear of the parameter, though: a read there is a second
  // reference, and this answer exists to say the value went nowhere else
  const prefix = value?.type === 'SequenceExpression' ? value.expressions.slice(0, -1) : [];
  if (prefix.some(expr => identifierReferencedInSubtree(expr, paramName))) return false;
  return !(referencesArguments ?? referencesArgumentsObject(callee));
}

// Does parameter binding carry work a call discard must preserve? Destructuring may read or
// throw; defaults count when their target destructures or their initializer has effects.
// Plain identifiers and rest allocation are inert here. Return-value proofs are separate.
export function paramListRunsWork(params, ctx = null) {
  return (params ?? []).some(param => {
    if (param?.type === 'RestElement' || param?.type === 'Identifier') return false;
    if (param?.type === 'AssignmentPattern') return param.left?.type !== 'Identifier' || mayHaveSideEffects(param.right, ctx);
    return true;
  });
}

// collect the Identifier names the param list introduces, so a body read can be told from an outer
// one. returns null only for a slot whose bindings this walk cannot enumerate -- caller bails on
// null to keep the peel sound
export function collectParamBindingNames(params) {
  const names = new Set();
  for (const param of params) if (!collectPatternBindingNames(param, names)) return null;
  return names;
}

// the names ONE slot binds, whatever pattern spells it. a destructuring slot binds the identifiers
// its leaves spell, and refusing the whole list on its mere PRESENCE made every destructuring callee
// prove nothing about the value it hands back. a MEMBER target is the one leaf that keeps the
// refusal: it writes the destructured value through an object the caller already holds, so a name
// this set does not carry still reaches it, and an escape census reading the set would miss that
function collectPatternBindingNames(node, names) {
  // a rest element and a default wrap ONE target, so they peel in place; a container's slots are
  // several targets and each asks this same question of itself
  let target = node;
  while (target?.type === 'RestElement' || target?.type === 'AssignmentPattern') {
    target = target.type === 'RestElement' ? target.argument : target.left;
  }
  switch (target?.type) {
    case 'Identifier':
      names.add(target.name);
      return true;
    case 'ArrayPattern':
      return target.elements.every(element => element === null || collectPatternBindingNames(element, names));
    case 'ObjectPattern':
      return target.properties.every(property => collectPatternBindingNames(
        property.type === 'RestElement' ? property.argument : property.value, names,
      ));
    default:
      return false;
  }
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

// Descend nonempty sequence tails, returning the final node or the node where descent stops.
// `step` unwraps each tail; `onPrefix` sees the entire expression list and may stop with false.
// An optional shared `visited` set guards callers that alternate this descent with another walk.
export function peelSequenceTail(node, { step = null, onPrefix = null, visited = null } = {}) {
  while (node?.type === 'SequenceExpression' && node.expressions.length) {
    if (onPrefix && onPrefix(node.expressions) === false) return node;
    const tail = node.expressions.at(-1);
    visited ??= new Set();
    if (visited.has(tail)) return node;
    visited.add(tail);
    node = step ? step(tail) : tail;
  }
  return node;
}

// Classify ownership of a sequence receiver's harvested effects through runtime wrappers.
// `peel`: an ordinary receiver owns its prefix on the first read; later reads use its tail.
// A caller retaining that complete first receiver must not replay the harvested prefix.
// `suppress`: the optional guard already evaluates the complete receiver, so its body must
// not replay that prefix either. Null means there is no sequence harvest to account for.
export function classifyReceiverSE(receiver, isOptional, sideEffects) {
  if (!sideEffects?.length || !receiver) return null;
  let cur = receiver;
  while (cur && isTransparentWrapper(cur)) cur = cur.expression;
  if (cur?.type !== 'SequenceExpression') return null;
  return isOptional ? 'suppress' : 'peel';
}

// Collect nested sequence prefixes through runtime wrappers, returning `{ prefix, tail }`.
// `(a(), (b(), R))` yields `[a(), b()]` and `R`; callers replay the prefixes in that order.
// Empty and single-element sequences stay as the tail.
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

// Does this parent slot belong to a binding or assignment target pattern?
function isPatternTargetSlot(pn, cn) {
  if (pn.type === 'ArrayPattern') return pn.elements?.includes(cn);
  if (pn.type === 'RestElement' || pn.type === 'SpreadElement') return pn.argument === cn;
  if (pn.type === 'ObjectProperty' || pn.type === 'Property') return pn.value === cn;
  if (pn.type === 'ObjectPattern') return pn.properties?.includes(cn);
  return pn.type === 'AssignmentPattern' && pn.left === cn;
}

// A rest-bearing object level keeps all its reads native. Follow only pattern target
// slots: a separate destructure in a computed key or default has its own boundary.
// An optional predicate restricts the question to rest levels with that additional shape.
export function hasObjectRestAncestor(path, accepts = null) {
  for (const [parent, cur] of ancestorPathSteps(path)) {
    if (!parent.node || !isPatternTargetSlot(parent.node, cur.node)) return false;
    if (parent.node.type === 'ObjectPattern' && hasRestSiblingExcept(parent.node.properties, null)
      && (!accepts || accepts(parent.node))) return true;
  }
  return false;
}

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

// Does a property hold an object or array pattern, possibly behind a default?
// Such a nested value belongs to the mirror before flat synth/default/extraction fallbacks.
export function objectPatternHasNestedValue(objectPattern) {
  return objectPattern.properties.some(p => {
    const value = p.value?.type === 'AssignmentPattern' ? p.value.left : p.value;
    return isDestructurePattern(value);
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
export function isSynthSimpleObjectPattern(objectPattern, { allowNestedValue = false } = {}) {
  let bound = null;
  // a NESTED-value prop (`{ Array: { from } }`) belongs to the nested mirror (it replaces the WHOLE
  // receiver); a flat synth-swap here would race it on the same receiver and lose the nested polyfill
  // ... except UNDER a constructor hop, where the mirror's own canon never descends again: the plan
  // resolves such a slot as a static of that constructor and the literal carries it as a passthrough
  // of the whole key path (`Array: { prototype: _globalThis.Array.prototype }`), losslessly
  if (!allowNestedValue && objectPatternHasNestedValue(objectPattern)) return false;
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
    // a key spelled through a bound identity CALL (`[k('at')]`) folds by scope, not by structure: the
    // scoped plan names it or declines the pattern there, and an effect-bearing key is never replayed
    // raw into the literal, so the shape passes here on its callee alone
    } else if (computedKeyStaticName(p.key) === null && wksComputedKeyName(p.key) === null
      && unwrapRuntimeExpr(p.key)?.callee?.type !== 'Identifier') {
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

// source-form slot for a synth-swap property: distinguishes a computed key from a
// plain key so the two can't collide in `{ k: v, [k]: w }`. a computed Identifier keys by its variable
// name (`[k]`); a computed string / template literal keys by its QUOTED static value (`["from"]`) so it
// can't collide with a same-named computed Identifier. The scoped dedup key also escapes ordinary
// property names resembling these slot labels. Shared so both bindings describe source forms identically.
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
export function patternKeepsEffectfulKey(patternNode, ctx = null) {
  let kept = false;
  walkAstNodes({
    root: patternNode,
    visit(item) {
      // both dialects: babel spells the prop `ObjectProperty`, estree `Property`
      if ((item?.type === 'Property' || item?.type === 'ObjectProperty')
        && item.computed && computedKeyHasSideEffects(item, ctx)) kept = true;
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
function memberShapeSignature(node, bindings = null, dynamicKey = false) {
  node = unwrapRuntimeExpr(node);
  if (!node) return null;
  if (node.type === 'MemberExpression' || node.type === 'OptionalMemberExpression') {
    if (dynamicKey) {
      const symbol = wksComputedKeyName(node);
      if (knownBuiltInReturnTypes.staticProperties.Symbol[symbol]?.type !== 'symbol') return null;
      bindings?.set('Symbol', 'global-symbol');
      return `wks:${ symbol }`;
    }
    const objSig = memberShapeSignature(node.object, bindings);
    if (objSig === null) return null;
    const key = memberKeyName(node);
    // the static key is JSON-quoted: raw concatenation lets a key containing the delimiter
    // (`o['a.b']`) collide with a deeper nav (`o.a.b`) - quoting keeps signatures prefix-free
    if (key !== null) return `${ objSig }.${ JSON.stringify(key) }`;
    const propSig = memberShapeSignature(node.property, bindings, true);
    return propSig === null ? null : `${ objSig }[${ node.computed ? 'c' : 'p' }]${ propSig }`;
  }
  if (node.type === 'Identifier') {
    bindings?.set(node.name, dynamicKey || bindings.get(node.name) || false);
    return `i:${ node.name }`;
  }
  if (node.type === 'ThisExpression') return 't';
  // a bigint key: babel spells it BigIntLiteral (decimal-string value), estree keeps Literal
  // with a bigint value - one signature for both (JSON.stringify throws on a bigint, and the
  // adapters' different spellings otherwise split the same written slot across the emitters)
  if (node.type === 'BigIntLiteral') return `lb:${ node.value }`;
  if (node.type === 'NullLiteral') return 'l:null';
  // Babel primitive literals and ESTree Literal carry `.value`.
  if (node.type === 'StringLiteral' || node.type === 'NumericLiteral' || node.type === 'BooleanLiteral' || node.type === 'Literal') {
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
export function collectForXWriteMembers(node, out) {
  if (!node) return;
  switch (node.type) {
    case 'MemberExpression':
    case 'OptionalMemberExpression':
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
    writes = { nodes, sigs: nodes.map(node => memberShapeSignature(node)) };
    FOR_X_WRITES_CACHE.set(forXNode, writes);
  }
  return writes;
}

// A shape signature matches by name; lexical blocks, catch clauses and functions can shadow
// that name. Query the head's own region, then prove the selected value stayed put.
// Nested receivers need unchanged own data slots; getters can create a fresh value per read.
function sameReceiverBinding({ node, path, forXPath, adapter, crossedFunction, bindings }) {
  const root = runtimeChainRoot(node);
  if (root?.type !== 'Identifier' && crossedFunction) return false;
  // The adapters rebuild their views; identity lives on the declaration. Two unbound names
  // refer to the same global. A `this` receiver cannot cross a function boundary this way.
  const headPath = forXPath.get('left');
  let keyValues;
  for (const [name, dynamicKey] of bindings) {
    const readBinding = adapter.getBinding({ scope: path.scope, name, path });
    const headBinding = adapter.getBinding({ scope: headPath.scope, name, path: headPath });
    if (readBinding?.node !== headBinding?.node) return false;
    if (dynamicKey === 'global-symbol') {
      if (readBinding || headBinding || isMutatedGlobalSlot(adapter, name)) return false;
      continue;
    }
    // A reassigned name can select a different receiver or key under the same binding.
    if (readBinding && isReassignedBeyondDeclarator(readBinding)) return false;
    if (dynamicKey) {
      const init = unwrapRuntimeExpr(identifierDeclaratorInit(readBinding));
      const value = isNullLiteralNode(init) ? null : literalNodeValue(init);
      // A const object can coerce to a different key on each read.
      if (value === undefined || value !== null && typeof value === 'object') return false;
      (keyValues ??= new Map()).set(name, String(value));
    }
  }
  const ctx = { adapter, scope: path.scope, path };
  if (mayHaveSideEffects(node.object, ctx)) return false;
  // Pristine realm hops are one shared object, even without a local literal declaration.
  if (proxySurfaceIdentifier(node.object, { ...ctx, throughRealmHop: key => isPristineProxyGlobal(adapter, key) })) return true;
  const { keys } = memberChainKeys(node.object, member => {
    const key = memberKeyName(member) ?? keyValues?.get(member.property?.name);
    if (key !== null && key !== undefined) return key;
    const value = isNullLiteralNode(member.property) ? null : literalNodeValue(member.property);
    return value === undefined || value !== null && typeof value === 'object' ? null : String(value);
  });
  if (!keys.length) return true;
  if (root?.type !== 'Identifier' || keys.includes(null)) return false;
  // Text equality cannot prove that two getter/Proxy reads selected the same receiver.
  return !!literalValueAt(root, keys, ctx, true)?.node;
}

// `for (obj.key of/in ...)` rebinds obj.key each iteration, aliasing the prototype method.
// Both the write target (bare or nested in a destructuring pattern) and matching reads in
// the body target a local write, not the inherited method - polyfilling either is wrong
export function isForXWriteTarget(path, adapter = null) {
  const node = unwrapRuntimeExpr(path.node);
  // an optional READ of the written slot (`o?.at` in the body) aliases the same per-iteration
  // write - babel spells it OptionalMemberExpression while estree reaches here as a plain
  // MemberExpression once the entry peel strips its ChainExpression
  if (node?.type !== 'MemberExpression' && node?.type !== 'OptionalMemberExpression') return false;
  let crossedFunction = false;
  let contextChild;
  let sig;
  let bindings;
  for (let child = memberContextPath(path), current = memberContextPath(child.parentPath);
    current; child = current, current = memberContextPath(current.parentPath)) {
    const parent = current.node;
    if (!parent) break;
    if (!isForXStatement(parent)) continue;
    const writes = getForXWrites(parent);
    if (writes.nodes.includes(node)) return true;
    // The iterable and the head's keys/defaults are reads before the target is written.
    if (child.node !== parent.body || !writes.nodes.length) continue;
    if (sig === undefined) sig = memberShapeSignature(node, bindings = new Map());
    if (sig === null || !writes.sigs.includes(sig)) continue;
    // Most members match no loop write. Resolve receiver boundaries only after a
    // match, advancing once across all candidate loops rather than rescanning.
    contextChild ??= memberContextPath(path);
    while (contextChild.node !== current.node) {
      const boundary = memberContextPath(contextChild.parentPath);
      if (isThisRebinding(boundary.node, contextChild.node)
        && !useRegionFrames(path).definitionTimeFrames?.has(boundary.node)) {
        if (!adapter?.getBinding) return false;
        crossedFunction = true;
      }
      contextChild = boundary;
    }
    if (!adapter?.getBinding || sameReceiverBinding({ node, path, forXPath: current, adapter, crossedFunction, bindings })) return true;
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

// is this ONE node an ESM marker? asked of the nodes a binding emitted itself - the file's own
// format is the census's question, never a per-node type test
export const isESMMarkerStatement = node => ESM_MARKER_TYPES.has(node?.type);

// a declaration tsc erases WHOLE leaves no runtime marker, so it cannot decide the format:
// `import type { A } from './a'` compiles to nothing and the file it stands in stays CommonJS.
// the kind is spelled on the declaration or on every specifier - the two-level rule
// `isTypeOnlyImportKind` already owns - while ZERO specifiers still reaches the module record
// (`import './a'`, `export {}` are real imports of nothing)
function isLiveESMDeclaration(node) {
  if (!ESM_MARKER_TYPES.has(node?.type)) return false;
  if (isTypeOnlyImportKind(node.importKind) || isTypeOnlyImportKind(node.exportKind)) return false;
  const { declaration, specifiers } = node;
  // `export import X = require('m')` is CommonJS-only syntax - tsc rejects it outright when it
  // emits modules - so the export wrapper around it proves nothing about the goal
  if (declaration?.type === 'TSImportEqualsDeclaration') return false;
  if (declaration) return declaration.declare !== true && !TYPE_SPACE_NODE_TYPES.has(declaration.type);
  return !specifiers?.length
    || specifiers.some(spec => !isTypeOnlyImportKind(spec.importKind ?? spec.exportKind));
}

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
// `ctx` (a caller's scope) keeps a prefix READ an accessor answers too: a caller that drops what it peels asks it
export function unwrapTransparentSeq(node, ctx = null) {
  while (node) {
    if (isTransparentWrapper(node)) {
      node = node.expression;
    } else if (node.type === 'SequenceExpression') {
      const preceding = node.expressions.slice(0, -1);
      if (preceding.some(expression => mayHaveSideEffects(expression, ctx))) break;
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

// the single return expression of a function-like body. arrow bodies return directly; blocks
// accept exactly one ReturnStatement and ExpressionStatements. a caller replacing the BODY must
// preserve those expressions through its side-effect channel, and cannot carry local declarations
// into the caller's scope. `preservesBody` is the narrower promise that the original body keeps
// running: local declarations then stay too, provided the returned expression reads none of their
// bindings, including declarations after a return and inside branches. A retained body may also
// branch through blocks / if statements when every path returns the same free identifier.
// Allocator-owned initless memos may appear in a return's sequence prefix: that prefix still runs
// inside the retained body. A memo in the returned value, or any user local, remains unproven.
// Other control flow stays unproven: collecting returns alone cannot exclude an implicit undefined
// result or a finally override. its returns still reach `returnSink`, which promises no path, and
// the bindings it declares shadow them like any other local. Completion is computed once per
// statement, without expanding paths.
export function singleReturnBodyExpression(body, { preservesBody = false, returnSink = null } = {}) {
  if (!body) return null;
  if (body.type !== 'BlockStatement') return body;
  if (preservesBody) {
    const work = [body];
    const statements = [];
    const declaredNames = new Set();
    const memoNames = new Set();
    const returns = [];
    let provable = true;
    while (work.length) {
      const stmt = work.pop();
      statements.push(stmt);
      switch (stmt.type) {
        case 'BlockStatement':
          work.push(...stmt.body);
          break;
        case 'IfStatement':
          work.push(stmt.consequent);
          if (stmt.alternate) work.push(stmt.alternate);
          break;
        case 'ReturnStatement':
          returns.push(unwrapRuntimeExpr(stmt.argument));
          break;
        case 'VariableDeclaration':
          for (const decl of stmt.declarations) {
            if (stmt.kind === 'var' && isGeneratedMemoDeclarator(decl)) memoNames.add(decl.id.name);
            else walkPatternIdentifiers(decl.id, id => declaredNames.add(id.name));
          }
          break;
        case 'ExpressionStatement':
        case 'EmptyStatement':
          break;
        case 'SwitchStatement':
          provable = false;
          for (const $case of stmt.cases) work.push(...$case.consequent);
          break;
        case 'TryStatement':
          provable = false;
          work.push(stmt.block);
          if (stmt.handler) {
            if (stmt.handler.param) walkPatternIdentifiers(stmt.handler.param, id => declaredNames.add(id.name));
            work.push(stmt.handler.body);
          }
          if (stmt.finalizer) work.push(stmt.finalizer);
          break;
        case 'ForStatement':
        case 'ForInStatement':
        case 'ForOfStatement':
          provable = false;
          for (const head of [stmt.init, stmt.left]) if (head?.type === 'VariableDeclaration') work.push(head);
          work.push(stmt.body);
          break;
        case 'WhileStatement':
        case 'DoWhileStatement':
        case 'LabeledStatement':
          provable = false;
          work.push(stmt.body);
          break;
        case 'FunctionDeclaration':
        case 'ClassDeclaration':
          if (stmt.id) declaredNames.add(stmt.id.name);
          provable = false;
          break;
        case 'BreakStatement':
        case 'ContinueStatement':
        case 'ThrowStatement':
          provable = false;
          break;
        default: return null;
      }
    }
    const freeReturns = returns.filter(value => value
      && (!declaredNames.size || !identifierReferencedInSubtree(value, declaredNames))
      && (!memoNames.size || !identifierReferencedInSubtree(peelSequenceTail(value, { step: unwrapRuntimeExpr }), memoNames)));
    // Candidates are only identities to test against the preserved call's actual result.
    // They do not prove that a return ran, or that another branch yielded the same value.
    if (returnSink) returnSink.push(...freeReturns);
    const [returned] = freeReturns;
    if (!provable || !returned || freeReturns.length !== returns.length
      || returns.some(value => value !== returned && (value.type !== 'Identifier'
        || returned.type !== 'Identifier' || value.name !== returned.name))) return null;
    const completes = new Set();
    while (statements.length) {
      const stmt = statements.pop();
      if (stmt.type === 'ReturnStatement'
        || (stmt.type === 'BlockStatement' && stmt.body.some(child => completes.has(child)))
        || (stmt.type === 'IfStatement' && completes.has(stmt.consequent) && completes.has(stmt.alternate))) {
        completes.add(stmt);
      }
    }
    return completes.has(body) ? returned : null;
  }
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
export function unwrapReceiverLeaf(node, { preservesBody = false } = {}) {
  for (let depth = 0; depth < MAX_DEPTH; depth++) {
    const before = node;
    node = unwrapInitValue(unwrapRuntimeExpr(node));
    const iifeReturn = peelZeroArgIifeReturn(node, { preservesBody });
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
  const leaf = unwrapReceiverLeaf(receiverNode, { preservesBody: true });
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

// the parent expression PATH for the same runtime / ambient heritage pair
export function classSuperPath(classPath) {
  return heritageClause(classPath.node) ? classPath.get('extends')[0].get('id') : classPath.get('superClass');
}

// the function a class runs at `new C(x)`. babel keeps the parameters on the constructor member,
// ESTree on the FunctionExpression that member wraps - one read, so the two parsers cannot answer
// differently about the same class
export function classConstructorFunction(classNode) {
  const ctor = (classNode.body?.body ?? []).find(member => member?.kind === 'constructor');
  if (!ctor) return null;
  return ctor.params ? ctor : ctor.value ?? null;
}

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

// the assignment target rooted at the CommonJS export object - `module.exports`, `exports.X.Y`,
// `module['exports']` - as the free name it is rooted at, else null. the caller decides whether
// that name is the host's or the author's own; here it is only read off the chain.
// an optional target (`module?.exports.X = Y`) is not assignable in either parser, so the chain
// walk meets `OptionalMemberExpression` only as an inner hop of a parenthesised spelling
function commonJSAssignRootName(left) {
  let node = unwrapExpr(left);
  while (node?.type === 'MemberExpression' || node?.type === 'OptionalMemberExpression') {
    if (isStaticMember(node, 'module', 'exports')) return 'module';
    const obj = unwrapExpr(node.object);
    if (isNamedIdent(obj, 'exports')) return 'exports';
    node = obj;
  }
  // `exports = {}` rebinds the whole export object; the target is the bare name
  return isNamedIdent(node, 'exports') ? 'exports' : null;
}

// shadowed `require` makes its calls user-authored no-ops, not real core-js imports.
// keyed by the PROGRAM, which is what the answer is about and what several passes share
// (detect-usage + detect-entry walk the same one)
const REQUIRE_SHADOW_CACHE = new WeakMap();

// takes the Program so the cached var-scope index can answer nested declarations too. Annex B
// adds nothing for `require`: modules are strict, and a CommonJS wrapper takes it as a parameter.
// This query therefore needs no format/strictness verdict and can run during the format census.
export function declaresRequireBinding(program) {
  if (program?.type !== 'Program') return false;
  if (REQUIRE_SHADOW_CACHE.has(program)) return REQUIRE_SHADOW_CACHE.get(program);
  const result = (program.body ?? []).some(statementShadowsRequireAtProgramScope)
    // Direct functions/classes/lexicals were checked above; only hoisted vars remain. Asking
    // the general var-or-Annex-B predicate would memoise strictness before format publication.
    || cachedScopeVars(program).has('require');
  REQUIRE_SHADOW_CACHE.set(program, result);
  return result;
}

// is the name `require` already bound at the TOP of this program's body, where our own emitted
// call lands? a hoisted `function require` carries its body from the first line and a lexical one
// is in TDZ there, so both swallow the call. a `var` only redeclares, and it is harmless in the
// CommonJS wrapper, where the name starts out holding the loader the host passed in - so only a
// MODULE asked to spell `require` (a caller's own `importStyle`) loses the call to one
function bindsRequireAtProgramStart(program, sourceType) {
  if (program?.type !== 'Program') return false;
  if ((program.body ?? []).some(statementShadowsRequireAtProgramScope)) return true;
  return sourceType === 'module' && cachedScopeVars(program).has('require');
}

// how far into the body a `require` call still reads the loader the host passed in. In the CommonJS
// wrapper the name starts out holding it, which is why the format owner lets an injection spell
// `require` there at all; the wrapper's own `var require = wrap(require)` then hands every later
// call a different one. So the count is the leading run of directives and import-like statements -
// the region every injection writes into - and it stops at the first statement that binds the name
// itself. 0 wherever the name is not the host's at the top of the body: a MODULE binding it, or a
// hoisted function / class / lexical / import shadow, which carries its value (or its TDZ) from the
// first line. Which of the two a program is comes from the format owner's published verdict, so a
// program whose format was never resolved reports 0 and every call there stays the author's
export function hostRequireCallLimit(program) {
  if (program?.type !== 'Program') return 0;
  if (bindsRequireAtProgramStart(program, programIsScript(program) ? 'script' : 'module')) return 0;
  const body = program.body ?? [];
  let limit = programPrologueEndIndex(body);
  while (limit < body.length && isTopLevelImportLike(body[limit]) && !statementBindsRequireName(body[limit])) limit++;
  return limit;
}

// a top-level declaration that binds `require` itself (`var require = require('m')` - import-like by
// shape, and the statement where the name stops holding what the host passed in)
function statementBindsRequireName(stmt) {
  const node = unwrapExportedDeclaration(stmt);
  return node?.type === 'VariableDeclaration' && declaratorsBindName(node.declarations, 'require');
}

// covers what babel's `scope.getBindingIdentifier('require')` (filtered by
// `isAmbientBindingShape`) plus `findTSRuntimeBindingInPath` would report for a
// program-direct binding. `var` is excluded - the var-scope half of the canonical pair handles it
// uniformly, nested and program-direct alike, so the two callers ask for it beside this one
function statementShadowsRequireAtProgramScope(stmt) {
  const node = unwrapExportedDeclaration(stmt);
  if (!node || node.declare === true) return false;
  switch (node.type) {
    case 'VariableDeclaration':
      // block-scoped `let`/`const` only matter at program-direct position. `var` falls through to
      // the var-scope half of `functionScopeBindsVarOrFunction` (nested + program-direct alike)
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

// `Object.defineProperty(exports, ...)` is tsc's and esbuild's CJS emit shape for `export const x`,
// and every sibling of it spells the same thing: the plural form, and `Reflect` in place of `Object`
const DEFINE_PROPERTY_KEYS = new Set(['defineProperty', 'defineProperties']);

// a define-property call whose target is the CommonJS export object, as the free name that object
// is rooted at - else null, in the same vocabulary `commonJSAssignRootName` answers in
function definePropertyOnExportsRootName(expression) {
  if (expression?.type !== 'CallExpression' && expression?.type !== 'OptionalCallExpression') return null;
  const callee = unwrapExpr(expression.callee);
  const definer = DEFINE_PROPERTY_KEYS.has(callee?.property?.name ?? '')
    && (isNamedIdent(unwrapExpr(callee.object), 'Object') || isNamedIdent(unwrapExpr(callee.object), 'Reflect'));
  if (!definer) return null;
  const first = expression.arguments?.[0];
  return first ? commonJSAssignRootName(first) : null;
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

// --- Module format ---

// the names a CommonJS wrapper hands the file as PARAMETERS. ONE set answers two questions: a
// spelling of one of them is evidence about the FORMAT only while the file does not declare that
// name itself, and B.3.3.1 blocks the Annex-B hoist of a block function for a parameter name, so
// `{ function require(){} }` shadows nothing inside the wrapper while `{ function Map(){} }` still
// does - measured against a real Node CommonJS module
const CJS_WRAPPER_PARAM_NAMES = new Set(['module', 'exports', 'require', '__dirname', '__filename']);

// the module-format census: ONE walk collecting both sides of "what is this file", plus the
// declarations that void a CommonJS spelling. only the module side is PROOF - a live top-level
// `import` / `export`, `import.meta` and top-level `await` parse in the Module goal alone - while
// the CommonJS side is EVIDENCE the host is free to contradict. the walk is whole-file on purpose:
// a `module.exports` inside an `if` or an IIFE is the same evidence as one at the top, and the
// statement-level scan this replaces saw neither. `import()` is NOT module evidence - a dynamic
// import is legal in a script - and neither is script-only SYNTAX (`with`, HTML comments, legacy
// octals), which babel's parser rejects before a tree ever reaches us
export function moduleFormatReducer(onResult = null) {
  // the wrapper's five free names are the only ones an evidence site reads, so the index carries
  // nothing else
  const declarations = createDeclaredNameIndex(CJS_WRAPPER_PARAM_NAMES);
  const evidence = [];
  let esm = false;
  let nestedAwait = false;

  // a site whose meaning depends on one of the wrapper's free names being the HOST's, as that name -
  // else null. `import.meta` and a live `import` / `export` are the other side and are proof, not
  // evidence, so they never reach here
  function commonJSEvidenceName(node, frame) {
    switch (node.type) {
      // `export = x` is tsc's CommonJS-only export form
      case 'TSExportAssignment': return 'exports';
      // `import X = require('m')` is its import twin; the type-only spelling erases and proves nothing
      case 'TSImportEqualsDeclaration':
        return node.moduleReference?.type === 'TSExternalModuleReference' && !isTypeOnlyImportEquals(node)
          ? 'require' : null;
      case 'AssignmentExpression': return commonJSAssignRootName(node.left);
      case 'Identifier':
        return (node.name === '__dirname' || node.name === '__filename')
          && !isNonReferencePosition(frame.parentNode, node) ? node.name : null;
      default:
        if (isRequireCall(node)) return 'require';
        if (isStaticMember(node, 'module', 'exports')) return 'module';
        return definePropertyOnExportsRootName(node);
    }
  }

  return {
    visit(node, frame) {
      declarations.record(node, frame);
      // `import.meta` has no erasable spelling, so it proves the Module goal from any depth
      if (isLiveESMDeclaration(node) || (node.type === 'MetaProperty' && node.meta?.name === 'import')) {
        esm = true;
        return;
      }
      // top-level `await` is Module-only syntax too. the frame answers the common spelling for
      // free; a class definition-time slot evaluates in the enclosing context yet reads as nested
      // here, so an await anywhere else defers to the canonical walk that knows those slots
      if (node.type === 'AwaitExpression' || (node.type === 'ForOfStatement' && node.await)) {
        if (frame.atTopLevel) esm = true;
        else nestedAwait = true;
      }
      const name = commonJSEvidenceName(node, frame);
      if (name) evidence.push({ name, frame });
    },
    result() {
      // an evidence site counts only while nothing between it and the file root declares the name
      // it reads: `function f(module) { module.exports = 1 }` spells the author's own object, and
      // widening the scan to the whole file is exactly what makes that shadow load-bearing
      const cjs = evidence.some(({ name, frame }) => !declarations.declares(name, frame.scopes));
      const moduleFormat = { hasLiveESM: esm, hasCJS: cjs, nestedAwait };
      // Publish before subsequent reducers resolve facts that depend on the file's strictness.
      onResult?.(moduleFormat);
      return { moduleFormat };
    },
  };
}

// the census is whole-file and both the format owner and the emitters' diagnostics ask it, so it
// is memoised on the program node it describes
const MODULE_FORMAT_CACHE = new WeakMap();

// what the BODY spells: `{ hasLiveESM, hasCJS }`. the two are independent - a source can spell
// both, and that mixture is what no injection spelling can make loadable
export function moduleFormatMarkers(program, observed = null) {
  if (!program || typeof program !== 'object') return { hasLiveESM: false, hasCJS: false };
  let markers = MODULE_FORMAT_CACHE.get(program);
  if (!markers) {
    const { hasLiveESM, hasCJS, nestedAwait } = observed ?? collectFileCensus(program, [moduleFormatReducer()]).moduleFormat;
    // the census answered every await its frames can see; only a file carrying one they read as
    // NESTED pays the canonical walk, which additionally reaches the class definition-time slots
    markers = {
      hasLiveESM: hasLiveESM || (nestedAwait && (program.body ?? []).some(containsTopLevelAwait)),
      hasCJS,
    };
    MODULE_FORMAT_CACHE.set(program, markers);
  }
  return markers;
}

// does the body spell CommonJS and nothing that only a Module can spell? the emitters' shorthand
// over the census, kept because "the source declares itself CommonJS" is a question with callers
// of its own - the FORMAT is `resolveModuleFormat`, which weighs the id and the host beside this
export function detectCommonJS(program) {
  const markers = moduleFormatMarkers(program);
  return markers.hasCJS && !markers.hasLiveESM;
}

// the format verdict, kept on the Program node. The strictness model and the shadow walks are
// asked from a path, deep inside a resolution, so a fact about the FILE reaches them here rather
// than threaded through every one of them - and the babel leg cannot write the verdict back onto
// `sourceType` at all, because that tree belongs to a foreign pipeline whose module transforms
// read the field after us
const PROGRAM_FORMAT = new WeakMap();

// the format owner's verdict outranks the parse goal: a host that parsed tolerantly (babel's
// default `module`, oxc's `unambiguous`) has not decided the file's format, and the leg that
// cannot write its verdict back leaves it here instead of on the node
function programIsScript(program) {
  return (PROGRAM_FORMAT.get(program)?.sourceType ?? program?.sourceType) === 'script';
}

// may this program's top level be the realm's own - a top-level `var` or function the global object's slot, a `let` /
// `const` / `class` the realm's shared lexical scope - per the verdict the format owner left (`resolveModuleFormat`)?
// a program no verdict was given for keeps its top level a scope of its own. only the escape census asks it: reads
// and caller boundaries take the wrapper, each side the answer that is safe while the format is unknown
export function programTopLevelIsRealm(program) {
  return PROGRAM_FORMAT.get(program)?.realmTopLevel === true;
}

// the extension's own answer, which neither the body nor the caller may overrule: `.mjs` / `.mts`
// resolve as Modules and `.cjs` / `.cts` as CommonJS by the resolution rules of every host
function moduleExtensionGoal(id) {
  const language = moduleIdLanguage(id);
  return language?.script ? 'script' : language?.esm ? 'module' : null;
}

// the one ESM statement a pass of ours takes away: a BARE side-effect import whose specifier names a
// core-js entry, which `entry-global` replaces with the modules it expands to. A binding import, any
// export and `import.meta` outlive every method, so the format owner asks only about this shape -
// and only a caller that actually removes them hands the test in
export function isConsumedEntryImport(node, getCoreJSEntry) {
  return node.type === 'ImportDeclaration' && !node.specifiers?.length
    && getCoreJSEntry(node.source?.value ?? '') !== null;
}

// THE owner of "what kind of module is this file". Everything downstream - the strictness model
// and with it Annex-B, the import spelling the injector emits, the wrapper-parameter carve-out -
// reads this one answer instead of re-deriving its own.
// `importStyleOption` is EMISSION configuration and is deliberately absent from the language
// half: reading it there let a caller who asked for `require` output silently turn an ES module
// into a sloppy script, and every polyfill under an Annex-B shadow went with it.
// precedence for the language fact, top wins: live module evidence in the body (proof - a script
// parse rejects it); a host that declared it parsed a SCRIPT (a declared `module` is babel's
// default, not a statement, so only the script half speaks); the id's extension; CommonJS
// evidence; else a module.
// a script's SCOPE is the function body of the wrapper every consumer resolving the injection puts around it (a
// bundler, Node's own loader); what a top-level `var` or function of a script spelling no CommonJS HOLDS may
// still land in the realm's own slot, as an engine running it bare puts it there (`programTopLevelIsRealm`)
export function resolveModuleFormat({
  id = null,
  program,
  declaredSourceType = null,
  importStyleOption = null,
  consumesESM = null,
  moduleFormat = null,
}) {
  const markers = moduleFormatMarkers(program, moduleFormat);
  // a caller with no program at all gets the same degradation the census gives it - a module with
  // the option's own spelling - rather than a throw out of the verdict store below
  if (!program || typeof program !== 'object') {
    return {
      markers,
      sourceType: 'module',
      importStyle: importStyleOption ?? 'import',
      requireDeclined: false,
      sourceIsMixed: false,
    };
  }
  const extensionGoal = moduleExtensionGoal(id);
  const sourceType = markers.hasLiveESM ? 'module'
    : declaredSourceType === 'script' ? 'script'
      : extensionGoal ?? (markers.hasCJS ? 'script' : 'module');
  // ... and a script no CommonJS wrapper is known to host - its body spells no CommonJS, its id no CommonJS
  // extension - may run its top level in the realm itself, where a top-level `var` or function IS the global
  // object's slot
  const realmTopLevel = sourceType === 'script' && !markers.hasCJS && extensionGoal !== 'script';
  PROGRAM_FORMAT.set(program, { sourceType, realmTopLevel });
  // does the file's own live ESM OUTLIVE this pass? Only a caller knows: `entry-global` removes the
  // entry imports it recognises and nothing else does, so it hands in the test and everyone else
  // hands in nothing. Evidence that is not a top-level statement - `import.meta`, top-level await -
  // is never removed by anyone, which is why an absent statement list still counts as kept
  const topLevelESM = (program.body ?? []).filter(isLiveESMDeclaration);
  const keptESM = markers.hasLiveESM
    && (!topLevelESM.length || topLevelESM.some(node => !consumesESM?.(node)));
  // a script always emits `require`; so does a module whose body writes CommonJS - the `.mjs` whose
  // body still spells `module.exports` - and so does one whose only ESM the pass is about to take
  // away: after the entry it carried is consumed, what is left is CommonJS, and an `import` we put
  // in it is the second module system that body never had. That case is the correctness one.
  // Where the AUTHOR spelled both, no spelling saves the file - a bundler takes either and Node
  // takes neither - so the tie goes to the ESM markers, which is what the source says it is, and
  // `sourceIsMixed` reports the mixture rather than letting the choice pass for a fix
  const derived = sourceType === 'script' || (markers.hasCJS && !keptESM) ? 'require' : 'import';
  const requested = importStyleOption ?? derived;
  // `require` is not a spelling this program HAS when it binds the name itself: our call lands at
  // the top of the body, where a hoisted `function require` already carries its body and a lexical
  // one is still in TDZ. only a `var` is harmless there, and only inside the wrapper, where it
  // starts out holding the loader the host passed in. the decline is REPORTED however the style was
  // chosen: `import` in a CommonJS file does not load either, and a derived style makes it no less
  // the caller's problem to know about
  const requireSpellable = requested !== 'require' || !bindsRequireAtProgramStart(program, sourceType);
  return {
    markers,
    sourceType,
    importStyle: requireSpellable ? requested : 'import',
    requireDeclined: !requireSpellable,
    // the AUTHOR mixed the two - `import` beside `module.exports` - so whichever spelling the
    // injection takes, the file goes out mixed and no host accepts it. a fact about the SOURCE,
    // answerable only before any emission, and the reason it is reported from here rather than
    // from the tree a pass later
    sourceIsMixed: markers.hasLiveESM && markers.hasCJS,
  };
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

// Node-identity caches survive resolver resets; fresh files own fresh nodes and old keys are weak.
const SIDE_EFFECTS_CACHE = new WeakMap();
// strict-mode cache for `reEvaluationObservable` (same walker, wider verdict)
const RE_EVAL_CACHE = new WeakMap();
const SIDE_EFFECTS_MAX_DEPTH = 256;
// the dead-element policy for a lifted sequence: the statement it becomes discards every value,
// so an expression with nothing to observe is a comma the source wrote rather than work it did -
// only the effects survive (`(0, se(), (0, Array))` lifts as `se();`). shared by both emitters so
// the trim canon lives once; callers pass an already-flattened expression list. an all-quiet list
// keeps its last element, leaving the caller a well-formed expression to drop on its own
export function dropDeadSequenceElements(expressions, ctx = null) {
  const kept = observableSequenceElements(expressions, ctx);
  return kept.length ? kept : expressions.slice(-1);
}

// the same policy for the channels that emit one statement PER element rather than one for the
// whole prefix (the nested-flatten rescue chain is the standing example, and its grouping is a
// channel rule of its own): nothing to observe means nothing to run, and an all-quiet prefix
// leaves no statement at all. `ctx` (a caller's scope) keeps a getter read as the work it is.
// A receiver's first evaluation also preserves source reads that can throw before its key.
// Only what performs nothing (`performsNothing`) may leave that prefix.
export function observableSequenceElements(expressions, ctx = null, { preserveSourceReads = false } = {}) {
  if (preserveSourceReads) return expressions.flatMap(expression => {
    const { prefix, tail } = peelNestedSequenceExpressions(expression);
    return [...prefix, tail].filter(value => !performsNothing(value, ctx));
  });
  return expressions.filter(expression => mayHaveSideEffects(expression, ctx));
}

// does a value whose result is discarded perform nothing - run no code and read nothing that may throw: a quiet
// literal, `void` of one, or a binding this pass minted that nothing rebinds (`isReusableReceiver`). a name the
// source spells is a read, and a missing global throws there
export function performsNothing(value, ctx = null) {
  const inner = unwrapRuntimeExpr(value);
  if (isQuietLiteralOperand(inner) || (inner?.type === 'UnaryExpression' && inner.operator === 'void'
    && isQuietLiteralOperand(inner.argument))) return true;
  return inner?.type === 'Identifier'
    && (ctx?.injectorState?.isOwnPassGeneratedName?.(inner.name) || ctx?.injectorState?.isOwnPassPureBinding?.(inner.name))
    && isReusableReceiver(inner, { ctx });
}

// Unlike discarding source, rejecting a call may skip allocations whose values it never consumes.
// Coercion, getters and argument iteration still precede the non-callable error.
// Plain value reads, including typeof, do not justify a guard; preserving a missing/TDZ
// read's ReferenceError over this TypeError is outside this effect-order repair.
export function callArgumentMayBeObserved(value, ctx = null, depth = 0) {
  const node = unwrapRuntimeExpr(value);
  if (node?.type === 'Identifier') return false;
  if (!node || performsNothing(node, ctx)) return false;
  if (depth >= SIDE_EFFECTS_MAX_DEPTH) return true;
  if (node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') return false;
  function observes(child) {
    return callArgumentMayBeObserved(child, ctx, depth + 1);
  }
  function primitiveKind(operand) {
    let inner = unwrapRuntimeExpr(operand);
    if (inner?.type === 'Identifier' && ctx?.adapter) inner = unwrapRuntimeExpr(followConstIdentifierInit({ node: inner, ctx }).node);
    if (isQuietLiteralOperand(inner) && inner.type !== 'RegExpLiteral' && !inner.regex) {
      const primitive = literalNodeValue(inner);
      return primitive === null ? 'null' : typeof primitive;
    }
    if (isMemberAccessNode(inner) && memberKeyName(inner) === 'length'
      && typeof literalNodeValue(unwrapRuntimeExpr(inner.object)) === 'string') return 'number';
    return null;
  }
  // A boxed string's own length is immutable data, so this read cannot invoke a getter.
  if (isMemberAccessNode(node) && primitiveKind(node)) return false;
  if (node.type === 'UnaryExpression') {
    if (node.operator === 'void' || node.operator === '!' || node.operator === 'typeof') return observes(node.argument);
    const kind = primitiveKind(node.argument);
    if ((node.operator === '-' || node.operator === '+' || node.operator === '~') && kind) {
      return observes(node.argument) || node.operator === '+' && kind === 'bigint';
    }
    return true;
  }
  if (node.type === 'ArrayExpression') return node.elements.some(observes);
  if (node.type === 'ObjectExpression') return node.properties.some(property => property.type === 'SpreadElement'
    || property.computed && (!isQuietLiteralOperand(property.key) || property.key.type === 'RegExpLiteral' || property.key.regex)
    || observes(property.value));
  if (node.type === 'SequenceExpression') return node.expressions.some(observes);
  if (node.type === 'LogicalExpression' || node.type === 'BinaryExpression' && (node.operator === '===' || node.operator === '!==')) {
    return observes(node.left) || observes(node.right);
  }
  if (node.type === 'BinaryExpression' && node.operator !== 'in' && node.operator !== 'instanceof') {
    const left = primitiveKind(node.left);
    const right = primitiveKind(node.right);
    if (left && right && left !== 'bigint' && right !== 'bigint') return observes(node.left) || observes(node.right);
  }
  if (node.type === 'ConditionalExpression') return observes(node.test) || observes(node.consequent) || observes(node.alternate);
  if (node.type === 'TemplateLiteral') return node.expressions.some(expression => !isQuietLiteralOperand(expression)
    || expression.type === 'RegExpLiteral' || expression.regex);
  return true;
}

// ... and one the build's render put there: a binding this pass minted is its own wherever it stands, a literal
// only where no source position marks it the user's (`nodePositionKey`) - `'from' in Array;` renders a `true` that
// performs nothing, while the user's own `0;` or `void 0;` is no render of the build's
export function renderPerformsNothing(value, ctx = null) {
  const inner = unwrapRuntimeExpr(value);
  return !!performsNothing(inner, ctx) && (inner.type === 'Identifier' || nodePositionKey(inner) === null);
}

// the elements a sequence keeps once those ahead of its value that `leaves` lets go are gone - `elements` itself
// where none goes: the rest, and the last of those leaving too where the value would stand alone and read
// differently in the sequence's slot (`foldedOperandNeedsValue`: `(0, o.m)()` calls `m` with no receiver,
// `(0, 'use strict');` is no directive). `slotOf` answers that slot, asked only then
export function sequenceElementsKept(elements, leaves, slotOf) {
  const kept = [];
  let left = null;
  for (let at = 0; at < elements.length - 1; at++) {
    if (leaves(elements[at])) left = elements[at];
    else kept.push(elements[at]);
  }
  if (!left) return elements;
  const value = elements.at(-1);
  if (!kept.length && foldedOperandNeedsValue(value, slotOf())) kept.push(left);
  kept.push(value);
  return kept;
}

// the nodes a fold walk has to stand in once the claims rendered: each selection the build decided (`isDecided`),
// each statement or sequence an answer may stand in - a value a render of the build may leave performing nothing
// there (`renderPerformsNothing`, asked here of any binding this pass minted, whatever it holds) - and all their
// ancestors. a node outside it holds no fold and no answer. null where the tree is too deep to tell
export function foldWalkReach(root, { isDecided, injectorState }) {
  const reach = new Set();
  const stack = [];
  let tooDeep = false;
  function mayBeAnswer(value) {
    const inner = unwrapRuntimeExpr(peelTransparentExpr(value));
    if (inner?.type !== 'Identifier') return nodePositionKey(inner) === null && performsNothing(inner);
    return !!(injectorState?.isOwnPassGeneratedName?.(inner.name) || injectorState?.isOwnPassPureBinding?.(inner.name));
  }
  function isSite(node) {
    if (node.type === 'LogicalExpression' || node.type === 'ConditionalExpression') return isDecided(node);
    if (node.type === 'ExpressionStatement') return mayBeAnswer(node.expression);
    return node.type === 'SequenceExpression' && node.expressions.slice(0, -1).some(mayBeAnswer);
  }
  walkAstNodes({
    root,
    visit(node) {
      stack.push(node);
      if (stack.length >= 1000) tooDeep = true;
      if (isSite(node)) for (let at = stack.length - 1; at >= 0 && !reach.has(stack[at]); at--) reach.add(stack[at]);
      return true;
    },
    leave() {
      stack.pop();
    },
  });
  return tooDeep ? null : reach;
}

// the accessor-or-spread slots a literal carries, memoized on the literal: the container-dense
// shape reads thirty-to-fifty slots back through member chains, so asking the whole property list
// once per READ turns a linear answer into a product over the bundle. null where the literal
// carries neither, which is the overwhelming majority and the answer every later read reuses
const OBJECT_LITERAL_ACCESSOR_SLOTS = new WeakMap();
function objectLiteralAccessorSlots(object) {
  if (OBJECT_LITERAL_ACCESSOR_SLOTS.has(object)) return OBJECT_LITERAL_ACCESSOR_SLOTS.get(object);
  let slots = null;
  for (const prop of object.properties) {
    // a spread or a computed accessor key cannot be paired with a member's own key, so either
    // answers for any accessor the literal may carry - the bias a dropped read cannot get wrong
    if (prop.type === 'SpreadElement' || ((prop.kind === 'get' || prop.kind === 'set') && prop.computed)) {
      slots = true;
      break;
    }
    if (prop.kind !== 'get' && prop.kind !== 'set') continue;
    (slots ??= new Set()).add(prop.key?.name ?? prop.key?.value ?? null);
  }
  OBJECT_LITERAL_ACCESSOR_SLOTS.set(object, slots);
  return slots;
}

// does this member read land on an accessor the object LITERAL spells in place? a spread or a
// computed accessor key cannot be paired with the member's own key, so either answers for any
// accessor the literal may carry - the bias a dropped read cannot afford to get wrong
function objectLiteralAccessorRead(node) {
  let { object } = node;
  while (object && (TRANSPARENT_WRAPPER_TYPES.has(object.type) || TS_EXPR_WRAPPERS.has(object.type))) {
    object = object.expression ?? object.argument;
  }
  if (object?.type !== 'ObjectExpression') return false;
  const slots = objectLiteralAccessorSlots(object);
  if (!slots) return false;
  if (slots === true || node.computed) return true;
  return slots.has(node.property?.name ?? node.property?.value ?? null);
}

// False only for a provably quiet subtree; repeated questions share the node-identity cache.
// The walker treats the depth limit as observable, keeping pathological trees conservative.
// A caller holding a scope passes it as `ctx` (`{ scope, adapter, path }`): a member READ its
// adapter's `readRunsAccessor` answers for - an accessor with effects the receiver walk names - runs
// code too, where a plain read is pure. Every drop, elision or reorder decision owes that question;
// its answer is the caller's context, so only the context-free half is cached.
export function mayHaveSideEffects(node, ctx = null) {
  if (!node) return false;
  if (!SIDE_EFFECTS_CACHE.has(node)) SIDE_EFFECTS_CACHE.set(node, computeSideEffects(node, 0, false));
  if (SIDE_EFFECTS_CACHE.get(node)) return true;
  const readRuns = ctx?.adapter?.readRunsAccessor;
  return !!readRuns && computeSideEffects(node, 0, member => readRuns({ ...ctx, node: member }));
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
// Reads deliberately retained by the probe render are already served. Only those nodes are
// owned: their computed keys, call arguments and other source children keep their own claims.
const renderedProbeReads = new WeakSet();
// Record one served read, without claiming its live child slots.
export function markRenderedProbeRead(node) {
  renderedProbeReads.add(node);
  return node;
}
// Whether this read is already owned by the shared probe render.
export function isRenderedProbeRead(node) {
  return !!node && renderedProbeReads.has(node);
}
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
// `strict`: `true` asks the re-evaluation question, `false` the single-evaluation one, and a READ
// hook asks the single-evaluation one with the member reads it answers for counted (uncached)
function recurse(node, depth, strict) {
  if (!node) return false;
  const cache = strict === true ? RE_EVAL_CACHE : strict ? null : SIDE_EFFECTS_CACHE;
  if (cache?.has(node)) return cache.get(node);
  if (depth >= SIDE_EFFECTS_MAX_DEPTH) return true;
  const result = computeSideEffects(node, depth + 1, strict);
  cache?.set(node, result);
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
    if (strict === true) return true;
    // the minted THROW PROBE (`(null == X ? void 0 : Y).key` - a plain read whose object is a
    // void-0-armed guard ternary) throws BY DESIGN on the guarded branch: dropping it as an
    // effect-free prefix (a re-transform / pre+post pass) erases the source's throw semantics
    if (!node.optional && node.object?.type === 'ConditionalExpression'
      && node.object.test?.type === 'BinaryExpression' && node.object.test.operator === '=='
      && (node.object.test.left?.type === 'NullLiteral' || node.object.test.right?.type === 'NullLiteral')
      && node.object.consequent?.type === 'UnaryExpression' && node.object.consequent.operator === 'void') {
      return true;
    }
    // ... and a read off an in-place literal that spells the key as an ACCESSOR runs that accessor
    // right here: the READ is the effect, and every channel that may drop the literal asks here first
    if (objectLiteralAccessorRead(node)) return true;
    if (strict && strict(node)) return true;
    return recurse(node.object, depth, strict) || (node.computed && recurse(node.property, depth, strict));
  }
  if (type === 'Property' || type === 'ObjectProperty') {
    if (strict === true && (node.kind === 'get' || node.kind === 'set')) return true;
    return (node.computed && recurse(node.key, depth, strict)) || recurse(node.value, depth, strict);
  }
  // babel-only ObjectMethod (`{ [fn()]() {} }` / `{ get [fn()]() {} }`): computed key is
  // evaluated at object-literal-eval time, method body / params are deferred. without this
  // case the node falls through to `return false`, silently eliding SE in the computed key
  // and unblocking unsafe receiver-drop rewrites that consumed `Array[(fn(), 'from')]`-shape
  if (type === 'ObjectMethod') {
    if (strict === true && (node.kind === 'get' || node.kind === 'set')) return true;
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

// ... and the DATA fields among them: an auto-accessor defines its accessor pair beside the methods,
// before any data field runs, so a data field spelling the same key replaces it
export const CLASS_DATA_FIELD_TYPES = new Set(['ClassProperty', 'ClassPrivateProperty', 'PropertyDefinition']);

// Candidate owners only: isThisRebinding still decides whether this particular edge
// rebinds. A raw census classifies the parent once, not every child.
const THIS_REBINDING_TYPES = new Set([
  ...FUNCTION_LIKE_NODE_TYPES,
  ...CLASS_FIELD_TYPES,
  'StaticBlock',
  'TSModuleBlock',
  'TSModuleDeclaration',
  'TSEnumDeclaration',
].filter(type => type !== 'ArrowFunctionExpression'));

// the INSTANCE-FIELD arm of the deferral predicate below, spelled over a parent/child NODE pair: a
// walk that indexes ancestors by node holds no path and so cannot ask for a slot `key`. one home for
// the rule all the same - the predicate below reads it. the function arm needs no node twin: every
// function-like type is a var-scope boundary, and the node climbs already stop at one
function isDeferredFieldValueNode(node, childNode) {
  return CLASS_FIELD_TYPES.has(node.type) && !node.static && node.value === childNode;
}

// one ancestor step: is `node` (entered via the `child` path) a DEFERRED evaluation context - a
// function body (runs at call time) OR an INSTANCE class-field initializer VALUE (runs at
// construction / `new`-time)? a static field, a StaticBlock, any computed key and a method's
// decorators run at class-eval (straight-line), so they are NOT deferred. the function arm is
// conservative about an immediately invoked body: the READ-side step below exempts it, the write side
// keeps the conservative answer. single source of truth for the deferral predicate
export function isDeferredContextStep(node, child) {
  if (!node) return false;
  if (FUNCTION_LIKE_NODE_TYPES.has(node.type)) {
    return !(FUSED_METHOD_TYPES.has(node.type) && (child.key === 'key' || child.listKey === 'decorators'));
  }
  return isDeferredFieldValueNode(node, child?.node);
}

// the READ-side step: a deferred context, except the body of a function whose immediate invocation
// runs it at its definition position - such a read stays straight-line, and every positional question
// asked of a read (which write reaches it, which guard holds over it, which loop re-runs it) climbs
// THROUGH that body and stops where this says so
export function readStepIsDeferred(p, child) {
  if (!isDeferredContextStep(p.node, child)) return false;
  if (!FUNCTION_LIKE_NODE_TYPES.has(p.node.type)) return true;
  const call = runsAtImmediateInvocation(p);
  // the argument region evaluates BEFORE the body, so a write there lands between the source position
  // of a read inside that body and the read itself: the read is not straight-line after all. only the
  // READ side asks this - a write lifted OUT of the body is unaffected, the region ran before it too
  return !call || invocationArgumentWrites(call.node);
}

// One exception-region edge: undefined inherits the outer handler, null opens a deferred
// execution, and a try body with a catch sends its throws to that handler.
function throwHandlerAtStep(node, child) {
  if (node?.type === 'TryStatement' && node.block === child.node && node.handler) return node.handler;
  return isDeferredContextStep(node, child) ? null : undefined;
}

// The catch reached by a throw in this execution. Throws in a catch/finally bypass that
// try's handler; a nested function or instance initializer owns a different execution.
export function throwCatchHandler(path) {
  for (let up = path?.parentPath, child = path; up?.node; child = up, up = up.parentPath) {
    const handler = throwHandlerAtStep(up.node, child);
    if (handler !== undefined) return handler ? up.get('handler') : null;
  }
  return null;
}

// can a write that is textually AFTER a read still reach it? true when the read sits in a DEFERRED
// context below `stopNode` - a closure re-invoked later, or a non-static class-field initializer that
// runs at construction. bounded at the binding's own scope, so a read in the SAME activation as the
// writes keeps its positional order. the one predicate behind both the value-union and the type narrow
export function readRunsDeferredWithin(usagePath, stopNode) {
  for (let p = usagePath?.parentPath, child = usagePath; p?.node && p.node !== stopNode; child = p, p = p.parentPath) {
    if (readStepIsDeferred(p, child)) return true;
  }
  return false;
}

// walk ancestors from `startPath` up to (excluding) Program, returning true at the first DEFERRED
// evaluation context. shared by closure-analysis (call temporal bound) and class-fields (this-write
// deferral) and straight-line flow (reassignment timing) so all treat new-time evaluation alike
export function hasDeferredContextAncestor(startPath) {
  // the chain can end BEFORE Program - a caller-built or detached path has no parent to climb to -
  // so the stop is the missing step, not the root the walk would otherwise wait for
  for (let fp = startPath.parentPath, child = startPath; fp?.node && fp.node.type !== 'Program'; child = fp, fp = fp.parentPath) {
    if (isDeferredContextStep(fp.node, child)) return true;
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
    case 'ThrowStatement': {
      const handler = throwCatchHandler(parentNodePath);
      return handler ? handler.node.param ? POSITION_FORWARDS : POSITION_CONSUMES : POSITION_HANDS_OUT;
    }
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

// A call's value feeds the next member or callee through source wrappers. Effect prefixes
// must stay inside an optional invocation's lookup in that position: a sequence around
// its result would seal the chain. Existing source seals still belong to the host tree.
export function callResultIsChainBase(path) {
  if (!path?.node) return false;
  const [child, up] = stepOverChainWrappers(path.node, path.parentPath);
  const reader = up?.node;
  return isMemberAccessNode(reader) ? reader.object === child : invocationNode(reader)?.callee === child;
}

// how far the member chain above this node runs, following only the OBJECT side: a node reached as
// the computed PROPERTY of the member above it is a sibling expression, not a continuation.
// `throughSequenceTail` opts into climbing out of a SEQUENCE whose last operand the chain reads - the
// branch below carries that rule and the reason it has to be asked for rather than always taken
export function memberChainEndPath({ path, unwrap = node => node, throughSequenceTail = false }) {
  let end = path;
  for (;;) {
    const [inner, up] = stepOverChainWrappers(end.node, end.parentPath, end === path);
    const above = up?.node;
    // a SEQUENCE evaluates to its LAST operand, so the member reading that operand continues this
    // very chain and the run's consumer stands above it. a climb stopping at the sequence hands a
    // render an anchor one span short of the run, and the landing there swaps the run's bare ROOT -
    // freezing the native probe read the ponyfill exists to answer. opt-in, because a caller naming
    // the chain's own TOP (a write slot, a delete target) may not walk out of the sequence it
    // stands in, and the prefix beside the run is the source's act, not part of the navigation
    // ... and the step OUT of the sequence takes the same wrapper walk the step into it takes: one
    // dialect hangs the source parens on the sequence as a NODE, and a step reading `parentPath`
    // raw stops there - the fix then goes inert in exactly the dialect the paren leg pins
    if (throughSequenceTail && above?.type === 'SequenceExpression' && above.expressions.at(-1) === inner) {
      const [seqOuter, host] = stepOverChainWrappers(above, up.parentPath);
      const hostNode = host?.node;
      if (hostNode?.type !== 'MemberExpression' && hostNode?.type !== 'OptionalMemberExpression') break;
      if (unwrap(hostNode.object) !== unwrap(seqOuter)) break;
      end = host;
      continue;
    }
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
  // One read-only question can validate many siblings below the same deep ancestry.
  // Share its already checked suffix; a later question or rewrite validates it anew.
  const answers = canonAnswerTable(ancestorChainDetached, []);
  const pending = answers ? [] : null;
  let detached = false;
  for (let cur = path?.parentPath, child = path; cur; child = cur, cur = cur.parentPath) {
    const known = answers?.get(child);
    if (known !== undefined) {
      detached = known;
      break;
    }
    pending?.push(child);
    if (cur.node === null || cur.node === undefined) {
      detached = true;
      break;
    }
    const held = child.listKey ? cur.node[child.listKey]?.[child.key] : cur.node[child.key];
    if (held !== child.node && !nodeHoldsChild(cur.node, child.node)) {
      detached = true;
      break;
    }
    if (cur.node.type === 'Program') break;
  }
  if (pending) for (const step of pending) answers.set(step, detached);
  return detached;
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

// the assignment operators that store their right into a binding still holding `undefined`
const STORING_OVER_UNSET_OPERATORS = new Set(['=', '??=', '||=']);

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
  // ... and one that STORES its right over the unset binding: `??=` / `||=` do, `&&=` never does
  if (!STORING_OVER_UNSET_OPERATORS.has(write.operator)) return null;
  if (writeIsInOppositeBranch(write, path, readNode ?? path?.node)) {
    const binding = adapter.getBinding?.({ scope, name, path });
    if (binding && noReassignmentReachesUsage({
      reassignmentNodes: [write], usagePath: path, usageNode: readNode,
      bindingScopeNode: binding.scope?.block ?? binding.scope?.path?.node,
      bindingAnchor: bindingLoopAnchor(binding),
    })) return null;
  }
  // ... or the READ's own span proves it - the evidence the PATTERN arm of the same follow already
  // accepts: a source read beginning past the write's end runs after it, which is what a sequence
  // spells (`(g = globalThis, v = g.window.self)`). a rebuilt node carries no span and declines, so
  // the AST leg's position-less re-visits stay out. the span says ORDER, never dominance, so it
  // rides the adapter's own PLACEMENT gate - a branch-local write (`if (c) { var M = globalThis }`)
  // runs on one path, and a textual accept there would mask the native throw
  // ... and NEITHER proof stands when the READ itself sits in a slot its container evaluates early:
  // a class key runs before the static field the write lives in, and the structural walk ranks class
  // members by source order just as the span does. pure substitutes only on proof, so it declines
  if (adapter.method === 'usage-pure'
    && (useOutrunsWrite(write, path)
      || (!readsAfterWriteStructurally(path, write)
        && !(typeof readNode.start === 'number' && readNode.start >= write.end
          && adapter.findTrustedAliasWrite(scope, name, { readNode }) === write)))) return null;
  return write;
}

// non-IIFE callees (`getGlobal().Array`) return unchanged and keep generic dispatch.
// `peelZeroArgIifeReturn` already bails on async / generator / undecidable positional arguments / control-flow bodies,
// so only sound pass-through wrappers peel
export function peelProxyGlobalObject(node, staticIsMutated = null) {
  node = unwrapRuntimeExpr(node);
  // SE tails peel for CLASSIFICATION only (`(eff(), globalThis).Array` - the prefix stays in
  // the source and runs at evaluation), mirroring the detect-usage chain walks; without the
  // peel an SE-buried extends target dropped its super statics
  node = peelSequenceTail(node, { step: unwrapRuntimeExpr });
  if (node?.type !== 'CallExpression' && node?.type !== 'OptionalCallExpression') return node;
  const ret = peelZeroArgIifeReturn(node, { staticIsMutated });
  return ret ? unwrapRuntimeExpr(ret) : node;
}

// does a REGISTERED alias's own write RUN before the use? the record carries either the write's span
// or the declaration's, and a use ahead of it reads the binding before the alias exists. position is
// not the whole answer: a use standing in a slot its container evaluates EARLY runs before a write
// the source places above it. an unknown position answers yes - the callers that need proof gate it
// themselves
export function aliasSpanDominatesUse({ info = null, span = null, useStart, usagePath = null }) {
  const write = span ?? info.aliasWrite ?? info.aliasDeclSpan;
  if (!write) return true;
  if (useOutrunsWrite(write, usagePath)) return false;
  return useStart === null || useStart > write.end;
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

// Whether queued claims consume every object slot, including quiet nested hops - a hop whose slot
// DEFAULT is quiet too: the default holds the pattern in its left, as dead as its undefaulted twin
// once the claims under it are served. Effectful keys, effectful defaults and rest keep their
// native reads even after their leaves are claimed.
export function patternFullyConsumed(pattern, isConsumed, ctx = null) {
  return pattern?.type === 'ObjectPattern' && pattern.properties.every(prop => isConsumed(prop)
    || (isPropertyNode(prop) && !computedKeyHasSideEffects(prop, ctx) && patternFullyConsumed(
      prop.value?.type === 'AssignmentPattern' && !mayHaveSideEffects(prop.value.right, ctx) ? prop.value.left : prop.value,
      isConsumed, ctx,
    )));
}

// does the pattern bind sentinels alone (`isSentinel(identifierNode)` - a minted node on one leg, a
// minted NAME on the other), nothing the source still reads? an empty pattern binds nothing at all
export function patternBindsOnlySentinels(pattern, isSentinel) {
  let sentinelsOnly = true;
  walkPatternIdentifiers(pattern, id => { sentinelsOnly &&= isSentinel(id); });
  return sentinelsOnly;
}

// an export LIST is module syntax: only a Program body hosts one, and an export standing in a TS
// namespace body stays a declaration there - an unwrap into a plain declaration plus a list declines
export function hostsExportList(parentNode) {
  return parentNode?.type === 'Program';
}

// an exported declaration whose residual binds a minted sentinel would hand that private name out:
// the declaration leaves its export, and the names the source bound are exported by a list. An
// export LIST an unwrap wrote names it the same way: there the sentinel leaves the list, and
// `specifiers` holds the list's own remaining nodes. null where nothing exports a sentinel;
// `isSentinel` as `patternBindsOnlySentinels` takes it
export function exportedSentinelSplit(statement, isSentinel) {
  if (statement?.type !== 'ExportNamedDeclaration' || statement.source) return null;
  const { declaration } = statement;
  if (!declaration) {
    const specifiers = statement.specifiers.filter(item => item.local?.type !== 'Identifier' || !isSentinel(item.local));
    return specifiers.length === statement.specifiers.length ? null : { declaration: null, publicNames: [], specifiers };
  }
  if (declaration.type !== 'VariableDeclaration') return null;
  const publicNames = [];
  let bindsSentinel = false;
  for (const declarator of declaration.declarations) {
    walkPatternIdentifiers(declarator.id, id => {
      if (isSentinel(id)) bindsSentinel = true;
      else publicNames.push(id.name);
    });
  }
  return bindsSentinel ? { declaration, publicNames, specifiers: null } : null;
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
// `isSentinel(id)`: under a hop keyed by an EFFECT, a pattern binding nothing but sentinels is as
// dead as an empty one - that hop retires to ONE sentinel instead of reading the hop for a leaf
// nobody reads; elsewhere a leaf sentinel is the residual the render meant to keep
export function pruneEmptiedHopProps(node, { mint, onDrop = null, isSentinel = null, ctx = null, consumedPatterns = null }) {
  if (node?.type === 'ArrayPattern') {
    for (const element of node.elements) pruneEmptiedHopProps(element, { mint, onDrop, isSentinel, ctx, consumedPatterns });
    if (node.elements.length === 1 && consumedPatterns?.has(node.elements[0])) consumedPatterns.add(node);
    return;
  }
  if (node?.type !== 'ObjectPattern') return;
  const keepsSentinels = patternLevelKeepsSentinels(node, ctx);
  const kept = [];
  for (const prop of node.properties) {
    const defaulted = prop.value?.type === 'AssignmentPattern';
    const pattern = defaulted ? prop.value.left : prop.value;
    pruneEmptiedHopProps(pattern, { mint, onDrop, isSentinel, ctx, consumedPatterns });
    // ... an emptied hop under an EFFECTFUL key retires to a sentinel like one beside a rest: the
    // level keeps it, so the key still runs once where the source wrote it
    // ... but a sentinel under an EFFECTFUL key of its own keeps its prop: that key still has to run
    const emptied = (prop.type === 'Property' || prop.type === 'ObjectProperty')
      && (!consumedPatterns || consumedPatterns.has(pattern))
      && (pattern?.type === 'ObjectPattern' || (pattern?.type === 'ArrayPattern' && pattern.elements.length === 1))
      && (patternDead(pattern)
        || (isEffectfulKeyHop(prop, ctx) && !!isSentinel && !patternKeepsEffectfulKey(pattern, ctx)
          && patternBindsOnlySentinels(pattern, isSentinel)));
    if (!emptied) kept.push(prop);
    else if (keepsSentinels) {
      if (defaulted) prop.value.left = mint();
      else prop.value = mint();
      kept.push(prop);
    } else {
      consumedPatterns?.add(node);
      onDrop?.(prop);
    }
  }
  node.properties = kept;
}
