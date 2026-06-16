// shared primitives for resolve-node-type: type classes + hint sets. hoisted out to keep
// the factory file focused on the resolver itself
const { assign, create, entries, keys } = Object;

// shared recursion budget for all resolvers - alias chains, runtime walks, guard traversals.
// 64 is comfortably above realistic TS type / alias chain depth (typical: 5-10; pathological
// user code: 20-30) while small enough to stack-bound a pathological loop. split into
// profile-specific constants by necessity (when a call site needs a tighter or looser cap)
export const MAX_DEPTH = 64;

export const PRIMITIVE_WRAPPERS = assign(create(null), {
  bigint: 'BigInt',
  boolean: 'Boolean',
  number: 'Number',
  string: 'String',
  symbol: 'Symbol',
});

const PRIMITIVE_HINTS = new Set(keys(PRIMITIVE_WRAPPERS));

export const UNBOXED_PRIMITIVES = create(null);
for (const [primitive, constructor] of entries(PRIMITIVE_WRAPPERS)) UNBOXED_PRIMITIVES[constructor] = primitive;

export const PRIMITIVES = new Set([
  ...PRIMITIVE_HINTS,
  'null',
  'undefined',
]);

export const TYPE_HINTS = new Set([
  ...PRIMITIVE_HINTS,
  'array',
  'asynciterator',
  'date',
  'domcollection',
  'function',
  'iterator',
  'object',
  'promise',
  'regexp',
]);

// lack of boxed primitives - acceptable assumption
export const TYPEOF_HINT_GROUPS = [...keys(PRIMITIVE_WRAPPERS), 'function'].reduce((memo, type) => {
  memo[type] = new Set([type]);
  return memo;
}, create(null));

// object group: all hints not covered by explicit typeof groups
TYPEOF_HINT_GROUPS.object = new Set([...TYPE_HINTS].filter(h => {
  for (const group of Object.values(TYPEOF_HINT_GROUPS)) if (group.has(h)) return false;
  return true;
}));

// iterator-shape stdlib types whose `<TYield, TReturn, TNext>` slot order treats param-0 as
// yielded element. shared between `SINGLE_ELEMENT_COLLECTIONS` (member-access widening) and
// `generatorTypeParams` (function return-type extraction). without the shared set, the two
// callers maintain parallel hardcoded duplicate lists that drift over TS stdlib evolution
export const GENERATOR_LIKE_NAMES = new Set([
  'Generator',
  'AsyncGenerator',
  'Iterator',
  'AsyncIterator',
  'IterableIterator',
  'AsyncIterableIterator',
  // TS 5.6+ stdlib base for iterator-helper chains - `declare const x: IteratorObject<T>`
  'IteratorObject',
  'AsyncIteratorObject',
  // generator functions structurally conform to `Iterable<T>` / `AsyncIterable<T>`;
  // an `Iterable<T>` annotation on a generator function declares its yield type.
  // `Iterable<T>.[Symbol.iterator]()` returns `Iterator<T>` so param-0 IS the yield
  // type, matching the rest of the set's contract
  'Iterable',
  'AsyncIterable',
]);

// collection types whose first type parameter is the element type
export const SINGLE_ELEMENT_COLLECTIONS = new Set([
  'Array',
  'ReadonlyArray',
  'Set',
  'ReadonlySet',
  ...GENERATOR_LIKE_NAMES,
]);

export const PATTERN_WRAPPERS = new Set([
  'ArrayPattern',
  'ObjectPattern',
  'Property',
  'ObjectProperty',
  'AssignmentPattern',
  'RestElement',
]);

// destructure-pattern slots wrap their default value in AssignmentPattern (`{a = 1}`,
// `[b = 2]`, `function f(x = init)`). callers walking the pattern's structural identity
// want the underlying target (`a`, `b`, `x`) - the `.left` slot - and don't care about
// the default. peel uniformly so duplicate ternaries don't drift between pattern walks
export function peelAssignmentPattern(node) {
  return node?.type === 'AssignmentPattern' ? node.left : node;
}

// a TS callback / method signature can declare a leading `this` pseudo-parameter
// (`(this: void, x: T) => ...`) which `functionTypeParams` includes, but a runtime arrow /
// function carries no `this` in its `params`; drop it so the type-level param slots align with
// the runtime arg indices (else an off-by-one reads the `this` slot). shared by callback-param
// inference (`pattern-bindings`) and type-predicate arg matching (`guard-shapes`)
export function dropLeadingThisParam(params) {
  return params?.[0]?.type === 'Identifier' && params[0].name === 'this' ? params.slice(1) : params;
}

export function $Primitive(type, literal) {
  this.type = type;
  this.constructor = null;
  // inner stored as a hint string, resolved lazily via resolveInnerType
  this.inner = type === 'string' ? 'string' : null;
  // source literal value when widened from a literal type (`2` -> number with literal 2).
  // undefined for bare keyword primitives (`number`). lets conditional-type evaluation keep
  // `2 extends 1` = false even though both sides widen to the same primitive family; ignored
  // by typesEqual / innersEqual / commonType so it never affects family-level equality
  this.literal = literal;
}

$Primitive.prototype.primitive = true;

export function $Object(constructor, inner) {
  this.type = 'object';
  this.constructor = constructor;
  this.inner = inner ?? null;
}

$Object.prototype.primitive = false;

// a bigint literal cross-parser: babel emits `BigIntLiteral`; oxc/estree emit a `Literal` whose
// `.value` is a real BigInt. used so `literalNodeValue` canonicalizes both to a real BigInt
export function isBigIntLiteralNode(node) {
  return node?.type === 'BigIntLiteral' || (node?.type === 'Literal' && typeof node.value === 'bigint');
}

// real BigInt value of a bigint literal: oxc/estree `.value` already is one; babel stores the
// magnitude as a digit string in `.value` (decimal or `0x`/`0o`/`0b` prefixed - all accepted by
// `BigInt()`), with the decimal magnitude in `.bigint` as a fallback. canonical: radix-agnostic
// (`BigInt('0x1') === 1n`) so every caller keys a bigint by VALUE, not raw source magnitude
export function bigIntLiteralValue(node) {
  return typeof node.value === 'bigint' ? node.value : BigInt(node.bigint ?? node.value);
}

// extract the runtime value of a literal node: bare literals (`5`, `'s'`, `true`, `1n`) and `-N`
// numeric / bigint negations (parsed as UnaryExpression around a positive literal). returns
// undefined for non-statically-known shapes (template strings, expressions). shared by the
// conditional-type AST branch-pick and the literal-type primitive stamp so `2` / `-1` / `1n` compare
// consistently across both the AST and Type-object paths
export function literalNodeValue(literal) {
  if (!literal) return undefined;
  // canonicalize bigint to a real BigInt FIRST: babel's digit-string `.value` would otherwise compare
  // equal to a same-text string literal (`"1" === "1"`), and `-string` coerces to the wrong NUMBER family
  if (isBigIntLiteralNode(literal)) return bigIntLiteralValue(literal);
  if (literal.value !== undefined) return literal.value;
  if (literal.type === 'UnaryExpression' && literal.operator === '-') {
    const arg = literal.argument;
    if (isBigIntLiteralNode(arg)) return -bigIntLiteralValue(arg);
    if (arg?.value !== undefined) return -arg.value;
  }
  return undefined;
}

const { hasOwn } = Object;

// pure helpers extracted from the resolver factory - no closure deps, depend only
// on the shared Type-object shape ($Primitive / $Object). kept here so the factory
// imports a stable surface instead of redefining them every per-file instantiation

// `boxed primitive Type -> primitive name` via UNBOXED_PRIMITIVES lookup; `$Primitive`
// instances expose `.primitive=true` directly. callers default to `null` when the
// constructor isn't a known primitive wrapper (e.g. Array, Map - the resolver routes
// those through the object-Type branch elsewhere)
export function primitiveTypeOf(type) {
  return type?.primitive ? type.type : UNBOXED_PRIMITIVES[type?.constructor] ?? null;
}

// DOM-collection family collapses to single 'domcollection' hint - all three classes
// (NodeList/HTMLCollection/DOMTokenList) share the same iteration / member surface,
// so polyfill dispatch routes them through the same hint group. raw constructor name
// flows through `toHint` -> the .lowerCase fallback would produce nodelist/htmlcollection/
// domtokenlist - this map collapses them upstream
const DOM_COLLECTION_CONSTRUCTORS = assign(create(null), {
  DOMTokenList: 'domcollection',
  HTMLCollection: 'domcollection',
  NodeList: 'domcollection',
});

// Type-object -> hint-string for built-in-definitions lookup. NOT inverse of
// `typeFromHint`: case-collapses (`$Object('Array')` -> 'array'), DOM-collection
// family collapses (see DOM_COLLECTION_CONSTRUCTORS), and primitive `unknown`
// returns null. round-trip via `typeFromHint('array')` produces `$Object('array')`
// (lowercase) which breaks KNOWN_*_RETURN_TYPES lookups keyed on capitalized
// constructor names - hint is one-way dispatch routing only
export function toHint(type) {
  if (!type) return null;
  if (type.primitive) return type.type === 'unknown' ? null : type.type;
  const name = type.constructor;
  if (!name) return null;
  if (hasOwn(DOM_COLLECTION_CONSTRUCTORS, name)) return DOM_COLLECTION_CONSTRUCTORS[name];
  return name.toLowerCase();
}

// intersect a whitelist set with another hint set in-place. when `included` is null,
// returns a fresh copy of `hints` so the first hit seeds the whitelist; subsequent
// hits narrow it. mutating in place avoids a per-step allocation on the typeof-walk
// hot path
export function intersectHintSets(included, hints) {
  if (!included) return new Set(hints);
  for (const hint of included) if (!hints.has(hint)) included.delete(hint);
  return included;
}

// get-or-init nested Map inside a WeakMap/Map container. used by two-level caches where
// outer key is an AST node / scope / matchType and inner key is a string / secondary id
export function getOrInitMap(container, key) {
  let inner = container.get(key);
  if (!inner) {
    inner = new Map();
    container.set(key, inner);
  }
  return inner;
}

// --- Pure data tables extracted from the resolver factory ---
// these share zero closure deps, so they live out here rather than inline in the factory -
// keeps the factory body free of visual noise, no semantic difference

// ambient TS / Flow declarations alongside runtime functions/classes - they all carry
// `returnType` / `typeParameters`, so the same code paths work for both. split into
// two sets keeps the predicates terse and lets us reuse the membership checks
export const AMBIENT_FUNCTION_TYPES = new Set([
  'TSDeclareFunction',
  'TSDeclareMethod',
  'DeclareFunction',
  'DeclareMethod',
]);

export const AMBIENT_FN_OR_CLASS_DECLARATION_TYPES = new Set([
  'TSDeclareFunction',
  'DeclareFunction',
  'DeclareClass',
]);

// sentinel for `as never` / unmatched conditional (TS filters the member out of the result).
// distinct from `null` (which means the template is statically un-evaluable -> bail expansion)
export const RENAME_SKIP = Symbol('rename-skip');

// recover a NodePath for a known AST node by identity match, traversing from `scope`'s
// program root. `types` is the visitor-key list (`['ClassDeclaration']`,
// `['FunctionDeclaration', 'TSDeclareFunction']`); caller pre-narrows by type to bound
// traversal cost. `p.stop()` halts the walk once the match is set. fires when downstream needs a
// NodePath but only has the raw node (namespace merge resolution, qualified type-ref class lookup)
//
// a recovered path is intrinsic to its node (one location per parse), so the same node looked up
// repeatedly - e.g. a widely-referenced `NS.Type` whose decl is recovered once per reference - must
// not re-traverse the whole program each time. memoize HITS keyed on the node (WeakMap keys are
// per-parse nodes, GC'd with the AST: no cross-transform leak, no manual reset). misses are NOT
// cached - they depend on the `types` filter, and a later wider-typed lookup may still find the node
const nodePathInScopeCache = new WeakMap();
export function nodePathInScope(targetNode, scope, types) {
  if (!targetNode) return null;
  const cached = nodePathInScopeCache.get(targetNode);
  if (cached) return cached;
  let cur = scope;
  while (cur?.parent) cur = cur.parent;
  const rootPath = cur?.path;
  if (!rootPath?.traverse) return null;
  let found = null;
  function visit(path) {
    if (path.node !== targetNode) return;
    found = path;
    path.stop?.();
  }
  const visitors = {};
  for (const type of types) visitors[type] = visit;
  rootPath.traverse(visitors);
  if (found) nodePathInScopeCache.set(targetNode, found);
  return found;
}

// intrinsic TS string transformers (`Uppercase<S>` / `Capitalize<S>` / ...)
export const INTRINSIC_STRING_TRANSFORMERS = Object.assign(Object.create(null), {
  Uppercase: s => s.toUpperCase(),
  Lowercase: s => s.toLowerCase(),
  Capitalize: s => s.charAt(0).toUpperCase() + s.slice(1),
  Uncapitalize: s => s.charAt(0).toLowerCase() + s.slice(1),
});

// cooked text of a TemplateElement quasi; raw fallback covers post-ES2018 invalid escapes
// where cooked is null (rare in type-level templates but cheap to handle)
export function quasiText(q) {
  return q?.value?.cooked ?? q?.value?.raw ?? '';
}

// numeric-shape detection: actual numbers OR strings matching JS numeric literal grammar
// (integer / float / scientific). used by `K extends number` predicate against numeric-keyed
// sources after stringification through the expand-mapped pipeline
export const NUMERIC_KEY_SHAPE_RE = /^-?(?:\d+|\d*\.\d+)(?:e[+-]?\d+)?$/i;

// per-placeholder segment validators. table is the single source of truth for which
// `${T}` placeholder types are statically decidable. extending support to `${bigint}` /
// `${boolean}` is one entry each. `${number}` regex enforces TS number-literal syntax,
// `Number.isFinite` guards Infinity / NaN edge cases the regex alone would mis-classify
export const NUMBER_LITERAL_RE = /^-?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;
export const PLACEHOLDER_VALIDATORS = {
  TSStringKeyword: () => true,
  TSNumberKeyword: segment => NUMBER_LITERAL_RE.test(segment) && Number.isFinite(Number(segment)),
};

// identity / position metadata keys that AST nodes carry but never hold type-shape slots.
// skipping them avoids spurious recursion into source-position literals while keeping the
// structural walker tolerant of parser-specific extra fields
export const STRUCTURAL_WALK_SKIP_KEYS = new Set(['type', 'loc', 'start', 'end', 'range', 'extra']);

// annotation slots a class / interface / type-literal member may carry. ordered so the
// most-common slot (`typeAnnotation`) checks first. shared by `findMemberAnnotation` and
// the substitution member-walker
export const MEMBER_ANNOTATION_SLOTS = ['typeAnnotation', 'returnType', 'value'];

// truly transparent wrappers: member set identical to first arg. modifiers like
// `Partial` / `Readonly` only change descriptor flags (optional / readonly), not the
// key set; `NoInfer` is fully transparent. `ThisType<T>` excluded - only meaningful
// inside object-literal context, requires special handling
export const TRANSPARENT_WRAPPERS = new Set([
  'NoInfer',
  'Partial',
  'Readonly',
  'Required',
  '$ReadOnly',
]);

// key-filtering wrappers: member set is a SUBSET of first arg's, selected by second arg.
// when second arg is a statically-evaluable literal / literal-union, `getTypeMembers`
// filters accordingly; otherwise passthrough (over-emit per §6 accepted)
export const KEY_FILTERING_WRAPPERS = new Set(['Pick', 'Omit']);

// umbrella: wrappers safe to PEEL for member-lookup / tuple-shape recovery without
// changing dispatch outcome. callers that don't care about precise member-set semantics
// (peelStructurePreservingWrapper, resolveNamedType inner-type resolve, tuple walk) use
// this. callers that DO care (getTypeMembers) branch separately on key-filter case
export const STRUCTURE_PRESERVING_WRAPPERS = new Set([...TRANSPARENT_WRAPPERS, ...KEY_FILTERING_WRAPPERS]);

// TS `PromiseLike<T>` / Flow `Thenable<T>` are structural supertypes of Promise that
// `await` / `Awaited<>` unwrap identically; alias them to Promise for type resolution
export const PROMISE_SYNONYMS = new Set(['PromiseLike', 'Thenable']);

// TS 5.6+ stdlib base-classes share method tables with their concrete pairs
export const CONSTRUCTOR_ALIASES = assign(create(null), {
  IteratorObject: 'Iterator',
  AsyncIteratorObject: 'AsyncIterator',
});

// AST-level counterpart to `isNullableOrNever` for union/intersection branch filtering.
// accepts both TS and Flow annotation shapes for null / undefined / never / void keywords.
// `TSVoidKeyword` maps to `$Primitive('undefined')` in `resolveTypeAnnotation`, so semantically
// belongs with the nullable group; without it, union member-call return inference bails on
// any `T | void` because the void branch tries to walk a non-object as a receiver and the
// fold collapses to null, producing over-injection downstream
export const NULLABLE_NEVER_ANNOTATIONS = new Set([
  'TSNullKeyword',
  'TSUndefinedKeyword',
  'TSVoidKeyword',
  'TSNeverKeyword',
  'NullLiteralTypeAnnotation',
  'VoidTypeAnnotation',
  'EmptyTypeAnnotation',
]);

// rebind operators that fully replace the binding's value. distinct from compound
// arithmetic (`+=`, `**=`) and bitwise (`|=`, `&=`, `^=`, `<<=`, `>>=`, `>>>=`) which
// READ the LHS value, mutate, and re-assign - external observers see the mutated value
// through the same binding. shape predicate kept as a Set so the classifier stays a
// single membership check
export const REBIND_ASSIGNMENT_OPERATORS = new Set(['=', '||=', '??=', '&&=']);

// shared sentinel for "no closure found" returns - cheaper than allocating a fresh empty
// Map per object literal when the rootName resolution bails. SAFE ONLY because every
// consumer treats the Map as READ-ONLY (`.get()` only). adding a caller that mutates this
// Map (`.set` / `.delete` / `.clear`) would poison the sentinel for every concurrent
// consumer - allocate a fresh Map instead at the new call site
export const EMPTY_CLOSURE = new Map();

// LHS positions that bind a value at runtime, distinguishing assign-as-mutation from
// assign-as-binding for the dataflow / rebind analysis
export const ASSIGN_LEFT_TYPES = new Set(['Identifier', 'ObjectPattern', 'ArrayPattern']);

// `extends`-clause child resolvers: which child slots carry the super-class binding when
// the extends clause uses a non-Identifier expression. covers call expressions / mixins
// (`extends mix(Base)`), ternary / logical (`extends cond ? A : B`), assignment / sequence
// (`extends ($x = Base)` / `extends (se(), Base)`). each entry returns an array of child
// expressions to recurse into
function callArgsWithoutSpread(n) {
  return n.arguments?.filter(a => a?.type !== 'SpreadElement');
}
export const EXTENDS_CHILD_RESOLVERS = {
  CallExpression: callArgsWithoutSpread,
  OptionalCallExpression: callArgsWithoutSpread,
  NewExpression: callArgsWithoutSpread,
  ConditionalExpression: n => [n.consequent, n.alternate],
  LogicalExpression: n => [n.left, n.right],
  AssignmentExpression: n => [n.right],
  SequenceExpression: n => [n.expressions?.at(-1)],
};
