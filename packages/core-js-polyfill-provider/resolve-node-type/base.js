// shared primitives for resolve-node-type: type classes + hint sets. hoisted out to keep
// the factory file focused on the resolver itself
const { assign, create, entries, getPrototypeOf, keys } = Object;

// shared recursion budget for all resolvers - alias chains, runtime walks, guard traversals.
// 64 is comfortably above realistic TS type / alias chain depth (typical: 5-10; pathological
// user code: 20-30) while small enough to stack-bound a pathological loop. split into
// profile-specific constants by necessity (when a call site needs a tighter or looser cap)
export const MAX_DEPTH = 64;

// how many members a folded literal union carries before it goes back to being opaque. A union
// is written by hand and a long one is a table, not a discriminant - the set exists to answer a
// conditional, and past this size the answer it buys is not worth carrying the set to every
// reader of the type
export const MAX_LITERAL_UNION_MEMBERS = 16;

// --- Source spans ---

// does the node carry source positions? a plugin-minted node has none, and every positional
// question asked of one answers conservatively rather than reading `undefined` as a position
export function hasRange(node) {
  return !!node && node.start !== null && node.start !== undefined && node.end !== null && node.end !== undefined;
}

// byte-range containment: `inner`'s span sits within `outer`'s span (both need source positions)
export function nodeRangeContains(outer, inner) {
  return hasRange(outer) && hasRange(inner) && inner.start >= outer.start && inner.end <= outer.end;
}

export const PRIMITIVE_WRAPPERS = assign(create(null), {
  bigint: 'BigInt',
  boolean: 'Boolean',
  number: 'Number',
  string: 'String',
  symbol: 'Symbol',
});

export const PRIMITIVE_HINTS = new Set(keys(PRIMITIVE_WRAPPERS));

export const UNBOXED_PRIMITIVES = create(null);
for (const [primitive, constructor] of entries(PRIMITIVE_WRAPPERS)) UNBOXED_PRIMITIVES[constructor] = primitive;

export const PRIMITIVES = new Set([
  ...PRIMITIVE_HINTS,
  'null',
  'undefined',
]);

// The grammar of the return-type registry, and not a fact about any built-in: these four strings
// say WHERE a hint's type comes from instead of naming it, each mapped to the side it reads. It
// lives here rather than in `@core-js/compat` because that package only carries the registry -
// nothing in it interprets a hint - while this file already holds the resolver's other hint
// vocabularies. What each one MEANS is documented where it is acted on: the call-side three at
// `resolveArgumentDirective`, all four for a data author in the registry's own header. The data
// cannot introduce one on its own - a name with no branch in the decoder throws rather than
// resolving to nothing, and an unreadable directive answers "unknown", never a fallback container.
export const RESOLUTION_DIRECTIVES = assign(create(null), {
  argument: 'call',
  'argument-element': 'call',
  'argument-return': 'call',
  inherit: 'receiver',
});

export const TYPE_HINTS = new Set([
  ...PRIMITIVE_HINTS,
  'array',
  'asynciterator',
  'date',
  'domcollection',
  'domexception',
  'error',
  'function',
  'iterator',
  'object',
  'promise',
  'regexp',
  'url',
  'urlsearchparams',
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

// collection types whose first type parameter is the element type. kept in sync with the TS
// stdlib BY HAND - a stdlib addition is silently missing here until someone notices, nothing checks
export const SINGLE_ELEMENT_COLLECTIONS = new Set([
  'Array',
  'ReadonlyArray',
  'Set',
  'ReadonlySet',
  // `ArrayLike<T>` is index-and-length only, which makes its param-0 the element as surely as
  // `Array<T>`'s. Its absence left the element read answering nothing for an annotation that names
  // the element outright, and left the container build with no slot to put it in
  'ArrayLike',
  ...GENERATOR_LIKE_NAMES,
]);

// TS-only STRUCTURAL container names: each describes a SHAPE many runtime classes have rather than
// naming one constructor, so the registry (`known-built-in-return-types`, which catalogues RUNTIME
// globals) carries no entry and an annotation spelled with one resolves to nothing at all. That
// absence is what member DISPATCH needs - read as a family, `Iterable<string>` has no `at` and the
// injection a null answer routes through the generic helper is dropped outright - so the box these
// names build is borrowed by ASSIGNABILITY alone, where the question is which families contain which
export const STRUCTURAL_CONTAINER_NAMES = new Set([
  'Iterable',
  'AsyncIterable',
  'ArrayLike',
]);

// the assignability EDGES between the container families this layer names. A check whose family
// REACHES the extends side's is assignable to it wherever their elements agree, and a pair naming
// two families with no path either way is disjoint whatever the elements say. It is DATA and not a
// rule because the cheap reading - two different known constructors are disjoint - is false: the
// constructor registry holds hierarchies of its own (`RangeError` under `Error`, `Element` under
// `Node`), and a FALSE off a bare name difference is the wrong answer for every one of them. Only a
// pair BOTH of whose names are here is decided, so an unlisted family leaves the relation open.
// `string` stands for the primitive AND the `String` wrapper it boxes into, the one primitive family
// with structural supertypes; the readonly collections name no family of their own (they resolve to
// the mutable constructor plus a marker) and so are absent. The generator families are absent for
// the same reason - they resolve to no box at all, and an entry no resolution can produce is a rule
// nothing ever reads
export const STRUCTURAL_SUPERTYPES = new Map([
  ['Array', new Set(['Iterable', 'ArrayLike'])],
  ['Set', new Set(['Iterable'])],
  ['Map', new Set(['Iterable'])],
  ['string', new Set(['Iterable', 'ArrayLike'])],
  ['Promise', new Set()],
  ['Iterable', new Set()],
  ['AsyncIterable', new Set()],
  ['ArrayLike', new Set()],
]);

// resolved container names whose `.inner` slot is built from type-param 0: the single-element
// collections plus Promise (whose param-0 is the resolved value). key-first containers
// (Map / WeakMap / ReadonlyMap) are EXCLUDED - their param-0 is the KEY, not the element - so
// stamping it as `.inner` would misrepresent the element type. the container-inner builders share
// this gate so the direct-annotation lane and the higher-kinded-apply lane can't drift apart.
// accepts the Promise SYNONYMS too, so a caller that has not folded them (the infer-pattern lane
// reads source spellings) gets the same answer as one that has - a hardcoded `name === 'Promise'`
// here is what forced a second, synonym-aware copy of this predicate to exist
export function firstTypeParamIsInner(name) {
  return SINGLE_ELEMENT_COLLECTIONS.has(name) || name === 'Promise' || PROMISE_SYNONYMS.has(name);
}

export const PATTERN_WRAPPERS = new Set([
  'ArrayPattern',
  'ObjectPattern',
  'Property',
  'ObjectProperty',
  'AssignmentPattern',
  'RestElement',
]);

// a TS callback / method / function signature can declare a leading `this` pseudo-parameter
// (`function f(this: T, x): ...` / `(this: void, x: T) => ...`) which the AST `params` include, but no
// runtime arg fills it; `Parameters<>` drops it at the TS level too. so the type-level / arg indices
// off-by-one against the raw AST `params` when a `this` slot is present
export function hasLeadingThisParam(params) {
  return params?.[0]?.type === 'Identifier' && params[0].name === 'this';
}

// drop the leading `this` pseudo-param so the param slots align with the runtime arg indices (else an
// off-by-one reads the `this` slot). for code that must keep the RAW AST params path, use
// `hasLeadingThisParam` to shift only the arg index instead. shared by callback-param inference
// (`pattern-bindings`), type-predicate arg matching (`guard-shapes`) and `Parameters<>` indexing
export function dropLeadingThisParam(params) {
  return hasLeadingThisParam(params) ? params.slice(1) : params;
}

// the runtime call-arg index for the AST param at `rawIndex`: a leading `this` pseudo-param fills AST
// slot 0 but no runtime arg, so every following param's arg position shifts down by one. callers keep
// the RAW index for the AST params path (`fnPath.get('params')[rawIndex]`) and use this for the args
export function argIndexForParam(params, rawIndex) {
  return rawIndex - (hasLeadingThisParam(params) ? 1 : 0);
}

// the ARGUMENT paths a call site hands its callee, in runtime order. a tagged template is a call
// (``tag`a${x}` `` runs `tag(strings, x)`) but keeps its arguments in `quasi` instead of an
// `arguments` slot, and neither parser's path answers a missing list key with a list - babel and
// estree-toolkit both build a single NodePath, which slips past a `?? []` fallback and reaches the
// consumers as a non-array. one accessor so no reader has to re-derive what a call's arguments are
export function callArgumentPaths(callPath) {
  const node = callPath?.node;
  if (Array.isArray(node?.arguments)) return callPath.get('arguments') ?? [];
  if (node?.type !== 'TaggedTemplateExpression') return [];
  // slot 0 is the strings array the tag receives, so the interpolations keep the positions the
  // declared params give them
  const quasi = callPath.get('quasi');
  return [quasi, ...quasi?.get('expressions') ?? []];
}

// --- Type classes ---
//
// markers QUALIFY a type without changing its family identity. equality / merging
// (typesEqual / innersEqual / commonType) compare the identity fields only and ignore
// markers; each marker is consulted exclusively by its dedicated gate, and is set ONLY
// via `.mark()`. the prototype slots below are the marker REGISTRY: a `false` slot both
// documents the marker and backs unmarked instances (an instance carries a marker as an
// own prop only once set), and `.mark()` accepts nothing outside these slots - a typo'd
// name throws instead of silently minting a dead field
const TypePrototype = {
  // readonly collection form (`ReadonlyArray<T>` / `readonly T[]` / `Readonly<X>`):
  // resolution collapses all of them to the mutable constructor, the marker lets a
  // conditional-infer check still pick the FALSE branch for readonly probes
  readonly: false,
  // a fold DROPPED a statically null / undefined arm (union fold, nullable ternary-branch
  // fold): sound for RECEIVER narrowing (a nullish receiver throws the same TypeError
  // transformed or not), unsound for TRUTHINESS - the runtime value may still be nullish,
  // so the logical truthy-fold must not collapse `A || B` / `A ?? B` to A's shape
  mayBeNullish: false,
  // same-family literal stamps merged (`'a' | 'b'`): still one family for member dispatch,
  // but a conditional check against a literal stays undecidable, so the branch-picker
  // folds both branches
  literalUnion: false,
  // the MEMBERS behind that marker, where the fold could keep them: the whole point of the
  // marker is that a union is undecidable against a literal, and it is undecidable only while
  // nobody knows what is in it. A kept set answers the two ends of the relation outright - a
  // subset extends, a disjoint pair does not - and leaves open only the partial overlap, which
  // is genuinely both. `null` is the marker's original meaning, an opaque union: one arm too
  // wide to name, or more members than the cap keeps
  literals: null,
  // capital `Object` (the boxed-top type): every non-nullish candidate is assignable to it
  // (TS: `string extends Object` is true), unlike the lowercase `object` keyword and
  // structural literal shapes, which reject primitives. member dispatch stays generic
  // (constructor null), only assignability reads the marker
  topObject: false,
  // the lowercase `object` keyword: the top of the NON-primitive types. It resolves
  // constructor-null like its capital twin and like an unmodelled shape, so without the
  // marker nothing tells the three apart once the AST is out of reach - which is every
  // level below the outermost, where `Array<T[]> extends Array<object>` is decided
  objectKeyword: false,
  // the `Function` KEYWORD, the top of the CALLABLE types: every function value is assignable to
  // it whatever signature it was written with. It resolves into the same box every unmodelled call
  // signature collapses into, so the marker is the only thing telling the two apart - the same
  // reason its two object-family twins above carry one
  functionKeyword: false,
  // WRITTEN type information this layer does not represent: an argument whose resolution has no
  // Type form or whose chain the shared depth budget cut, one the container has no slot for
  // (`Map` keys off param-0), or tuple elements that did not fold to one type. The container keeps
  // the inner-less shape a BARE `Array` also has, and a bare one means `Array<any>` - it matches
  // ANY inner. without the marker an assignability reader takes two such absences for agreement
  innerElided: false,
  // the opposite admission: the element argument WAS written and it was a top keyword (`any` /
  // `unknown`), which constrains no element at all - exactly what a container with no argument
  // says. Carried on the type because the AST is out of reach below the outermost pair, where
  // `Array<Array<number>> extends Array<Array<any>>` is decided and the caller's AST-derived
  // unconstrained flag covers the outermost extends clause alone
  innerUnconstrained: false,
  // WHICH top that was. `any` is assignable in both directions and `unknown` only from below, so the
  // two say the same thing as the element of an extends side and opposite things as the element of a
  // CHECK - the same parting the argument list spells with two sentinels, kept here for the slot
  // every element-first container writes into
  innerUnknown: false,
  // the element resolution the `.inner` slot REFUSED: `never` and the nullish types are meaningless
  // as a dispatch HINT and are dropped there, which leaves the container looking inner-less - the
  // shape a BARE one has, and a bare one means `Array<any>`. `Array<never>` is the opposite of that:
  // the bottom element makes it assignable to every array, and `Array<null>` is assignable to almost
  // none. Held beside the slot rather than in it, and read by assignability ALONE, for the reason
  // `args` is: every dispatch reader wants a hint it can narrow on, which this is not
  droppedInner: null,
  // the written type arguments of a container this layer holds no `.inner` slot for - a key-first
  // `Map` / `WeakMap`, whose param-0 is the KEY. It is the same information `innerElided` admits
  // to dropping, represented instead of merely confessed, so the two are exclusive: a list that
  // resolved in full clears the marker. Read by assignability ALONE - member dispatch keeps
  // reading the empty `.inner`, which is what says these containers carry no element type
  args: null,
  // the list above belongs to a MAPPED container (`Record<K, V>`), whose first entry is a key
  // DOMAIN and not a covariant position: `Record<string, V>` and `Record<'a', V>` accept each
  // other in BOTH directions, so a domain read like an element answers FALSE where tsc answers
  // TRUE. The marker is what routes the first entry to the domain rule instead
  keyDomainArgs: false,
  // the DECLARATION node a `typeIdentityElided` box stands for, where the box came from one. It is
  // the only thing that can tell two of them apart, and a node rather than a name because a
  // shadowed same-name declaration is a different type. It never makes a box decide FALSE - two
  // different declarations may still be structurally assignable - only the same one decide TRUE
  identity: null,
  // how many elements the TUPLE this box collapsed from wrote, where it came from one. The collapse
  // to `Array<commonElement>` is what makes a tuple readable at all here, and it drops the length:
  // `[string]` and `[string, string]` become one type, and an array of the same element becomes it
  // too. Read by assignability alone, like `args` - every dispatch reader wants the element, which
  // the collapse already gives them
  tupleArity: null,
  // own-prop copy on the same prototype: `instanceof`, the prototype `primitive` flag and
  // every marker survive
  clone() {
    return assign(create(getPrototypeOf(this)), this);
  },
  // same clone discipline for the element resolution the `.inner` slot refused
  withDroppedInner(inner) {
    const carried = this.clone();
    carried.droppedInner = inner;
    return carried;
  },
  // same clone discipline for the members a folded literal union kept
  withLiterals(literals) {
    const carried = this.clone();
    carried.literals = literals;
    return carried;
  },
  // carry a written argument list on a CLONE, for the reason `mark` does: a resolve input may
  // come from a resolver cache, and an in-place write would poison every later reader of it
  withArgs(args) {
    const carried = this.clone();
    carried.args = args;
    return carried;
  },
  // same clone discipline for the declaration a box stands for
  withIdentity(declaration) {
    const carried = this.clone();
    carried.identity = declaration;
    return carried;
  },
  // and for the length a collapsed tuple carries. `null` takes it back off, which is what a fold of
  // two arms that disagree about the length owes
  withTupleArity(arity) {
    const carried = this.clone();
    carried.tupleArity = arity;
    return carried;
  },
  // set a marker on a CLONE, no-op when already set: fold / resolve inputs may come from
  // resolver caches, so qualification never mutates in place - an in-place write would
  // poison every later reader of the cached type
  mark(marker) {
    if (TypePrototype[marker] !== false) throw new TypeError(`Unknown type marker: ${ marker }`);
    if (this[marker]) return this;
    const marked = this.clone();
    marked[marker] = true;
    return marked;
  },
  // clear a marker on a CLONE - the strip counterpart of `mark`, for both-required markers
  // (a `readonly | mutable` merge is not readonly-certain, but an identity-returned fold
  // input may already carry the marker; `mark` alone can only ever ADD)
  unmark(marker) {
    if (TypePrototype[marker] !== false) throw new TypeError(`Unknown type marker: ${ marker }`);
    if (!this[marker]) return this;
    const unmarked = this.clone();
    unmarked[marker] = false;
    return unmarked;
  },
};

export function $Primitive(type, literal) {
  this.type = type;
  this.constructor = null;
  // inner stored as a hint string, resolved lazily via resolveInnerType
  this.inner = type === 'string' ? 'string' : null;
  // source literal value when widened from a literal type (`2` -> number with literal 2).
  // undefined for bare keyword primitives (`number`). lets conditional-type evaluation keep
  // `2 extends 1` = false even though both sides widen to the same primitive family. ignored
  // by typesEqual / innersEqual for family-level equality, but READ by commonType (distinct
  // literal arms fold into one family stamped `literalUnion`) and by the conditional
  // branch-picker (a `literalUnion` check stays undecidable)
  this.literal = literal;
}

$Primitive.prototype = create(TypePrototype);
$Primitive.prototype.primitive = true;

export function $Object(constructor, inner) {
  this.type = 'object';
  this.constructor = constructor;
  this.inner = inner ?? null;
}

$Object.prototype = create(TypePrototype);
$Object.prototype.primitive = false;

// a bigint literal cross-parser: babel emits `BigIntLiteral`; oxc/estree emit a `Literal` whose
// `.value` is a real BigInt. used so `literalNodeValue` canonicalizes both to a real BigInt
export function isBigIntLiteralNode(node) {
  return node?.type === 'BigIntLiteral' || (node?.type === 'Literal' && typeof node.value === 'bigint');
}

// real BigInt value of a bigint literal: babel@8 and oxc/estree `.value` already is a native bigint;
// babel@7 stored the magnitude as a digit string in `.value` (decimal or `0x`/`0o`/`0b` prefixed -
// all accepted by `BigInt()`), with the decimal magnitude in `.bigint` as a fallback. canonical:
// radix-agnostic (`BigInt('0x1') === 1n`) so every caller keys a bigint by VALUE, not raw magnitude
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

// the box a DECLARED shape resolves into, carrying the declaration it stands for. A GENERIC
// declaration is not one type but a family of them - `Box<string>` and `Box<number>` share the node
// and tsc answers FALSE between them - so it is left identity-less, exactly as an undeclared shape is
export function boxForDeclaration(constructor, declaration) {
  return withDeclarationIdentity(new $Object(constructor), declaration);
}

// the same rule applied to a box that already EXISTS. A DERIVED declaration's box comes back from
// the parent walk carrying the PARENT's identity, and that slot is the one thing that makes two
// boxes ONE type: read off a derived interface it fired the TRUE branch of `Base extends Derived`,
// where the members the derived side adds are exactly what tsc answers FALSE for. Only an
// identity-elided box says anything through the slot, so a box that names a real family
// (`interface I extends Array<T>`) is handed back untouched
export function withDeclarationIdentity(box, declaration) {
  if (!typeIdentityElided(box)) return box;
  const owned = declaration && !declaration.typeParameters ? declaration : null;
  return box.identity === owned ? box : box.withIdentity(owned);
}

// does this Type stand for a shape the layer never modelled, rather than name a type? two
// families are such boxes and nothing else resolves into them: `Object` holds every interface,
// class, `Record<..>`, object literal and intersection alike, and `Function` holds every call
// signature beside the `Function` keyword. The family is real for member dispatch - both answer
// the generic surface - but it carries no identity, so two of them are known only to be alike
// as far as this layer looks, never to be the same type. The capital `Object` KEYWORD is not one
// of them: it resolves constructor-null and says so through `topObject`, and the lowercase
// `object` keyword, also constructor-null, is an exact type whose comparison stays decidable
export function typeIdentityElided(type) {
  return !!type && !type.primitive && (type.constructor === 'Object' || type.constructor === 'Function');
}

// the TOP of the object types, as opposed to the box above for a shape this layer did not model:
// the lowercase `object` keyword and the boxed `Object`, both constructor-null and told apart from
// each other, and from that box, only by the marker each carries. Nothing narrower stands above
// them, so a top on the CHECK side of a conditional is assignable to no family the extends side
// NAMES - the mirror of the two rules that already read these markers on the extends side
export function isTopObjectShape(type) {
  return !!type && !type.primitive && !type.constructor && !!(type.objectKeyword || type.topObject);
}

// a resolved Type object, as opposed to an AST node, a hint string or nothing: every Type carries
// the prototype's boolean `primitive` flag and nothing else this layer passes around does
export function isTypeObject(value) {
  return !!value && typeof value.primitive === 'boolean';
}

// the entry a written top-keyword argument (`any` / `unknown`) takes in an `args` list. It is NOT
// the hole an unresolvable argument leaves: a hole is undecidable, a top accepts whatever the other
// side holds. Confined to that list, which assignability alone reads - the `.inner` slot says the
// same thing through `innerUnconstrained`, because every dispatch reader looks at THAT one
export const TOP_ARGUMENT = Symbol('top-argument');

// its twin, for the OTHER top. `any` is assignable in both directions, `unknown` only from below -
// so as the extends side they say the same thing and as the CHECK side they do not, and one entry
// for both left `Map<string, any>` and `Map<string, unknown>` weighed against `Map<string, number>`
// with the same undecided answer where tsc decides them opposite ways. The `.inner` slot keeps the
// single `innerUnconstrained` marker and so keeps the conflation: every reader of THAT slot is a
// dispatch one, and this difference is an assignability question only
export const UNKNOWN_ARGUMENT = Symbol('unknown-argument');

// the VALUES a resolved primitive stands for, or null where it stands for a whole family. A single
// stamp is the one-member case of the set a literal-union fold keeps, so both ends of the union rule
// read one shape. `literalNodeValue` and its AST twins answer this question about a NODE, which is
// not the same one: by the time a conditional is decided the annotation it was written as is gone
export function literalMembers(type) {
  if (type.literals) return type.literals;
  return type.literal === undefined ? null : new Set([type.literal]);
}

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
  // a cached HIT is the node's one recovered path, but the lookup is still `types`-filtered: the
  // same node queried under a narrower visitor-key set must miss (a ClassDeclaration cached for
  // ['ClassDeclaration'] is not a match for ['FunctionDeclaration']), else the reject-guard callers
  // rely on to exclude a wrong-kind leaf goes dead
  const cached = nodePathInScopeCache.get(targetNode);
  if (cached) return types.includes(cached.node.type) ? cached : null;
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
export const INTRINSIC_STRING_TRANSFORMERS = assign(create(null), {
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
// `Number.isFinite` guards Infinity / NaN edge cases the regex alone would mis-classify.
// for a PURE INTEGER segment the canonical `String(Number) === segment` then rejects a leading-zero
// form (`'01'` / `'00'`) that the regex admits but TS's `${number}` does not - matching it renames a
// per-TS-absent member and injects a wrong Maybe (over-resolve). exponential (`'7e1'`) and decimal
// forms are left to the regex - TS admits those, so canonicalizing them would UNDER-resolve real matches
export const NUMBER_LITERAL_RE = /^-?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;
export const PLACEHOLDER_VALIDATORS = {
  TSStringKeyword: () => true,
  TSNumberKeyword: segment => NUMBER_LITERAL_RE.test(segment) && Number.isFinite(Number(segment))
    && (!/^-?\d+$/.test(segment) || String(Number(segment)) === segment),
};

// the canonical array-index for a key, or null. a string index counts ONLY in its canonical form
// (`String(n) === key`), so non-canonical strings that `Number()` would coerce to a valid index
// (`""` -> 0, `"1.0"` -> 1, `"01"` -> 1) are rejected - they address an object key, not an array slot,
// and reading the coerced element mis-types the access (a wrong type-specific Maybe downstream)
export function canonicalArrayIndex(key) {
  if (typeof key === 'number') return Number.isInteger(key) && key >= 0 ? key : null;
  if (typeof key !== 'string') return null;
  const n = Number(key);
  return Number.isInteger(n) && n >= 0 && String(n) === key ? n : null;
}

// identity / position metadata keys that AST nodes carry but never hold type-shape slots.
// skipping them avoids spurious recursion into source-position literals while keeping the
// structural walker tolerant of parser-specific extra fields
export const STRUCTURAL_WALK_SKIP_KEYS = new Set(['type', 'loc', 'start', 'end', 'range', 'extra']);

// annotation slots a class / interface / type-literal member may carry. ordered so the
// most-common slot (`typeAnnotation`) checks first. iterated by the substitution
// member-walker (`substMemberAnnotations`)
export const MEMBER_ANNOTATION_SLOTS = ['typeAnnotation', 'returnType', 'value'];

// truly transparent wrappers: member set identical to first arg. modifiers like
// `Partial` / `Readonly` only change descriptor flags (optional / readonly), not the
// key set; `NoInfer` is fully transparent. `ThisType<T>` excluded - only meaningful
// inside object-literal context, requires special handling.
// the value is that flag DELTA: `true` adds the modifier to every member passed through,
// `false` removes it, an absent key leaves the member's own flag alone. membership and
// delta are one table so a wrapper cannot be transparent without declaring what it changes -
// peeling one without applying its delta is how `Partial<T>.a` lost its optionality.
// only `optional` is member-scoped and therefore listed: `Readonly<T>` freezes the property
// SLOT, and `Readonly<{ a: number[] }>['a']` is still a mutable array, so it contributes no
// delta to the member's VALUE type. `Readonly` applied to a collection is a different
// question (`Readonly<T[]>` === `readonly T[]`) and belongs to `readonlyCollectionBase`
export const MODIFIER_WRAPPER_DELTAS = new Map([
  ['NoInfer', {}],
  ['Partial', { optional: true }],
  ['Readonly', {}],
  ['Required', { optional: false }],
  ['$ReadOnly', {}],
]);

export const TRANSPARENT_WRAPPERS = new Set(MODIFIER_WRAPPER_DELTAS.keys());

// key-filtering wrappers: member set is a SUBSET of first arg's, selected by second arg.
// when second arg is a statically-evaluable literal / literal-union, `getTypeMembers`
// filters accordingly; otherwise passthrough (over-emit per spec section 6 accepted)
export const KEY_FILTERING_WRAPPERS = new Set(['Pick', 'Omit']);

// umbrella: wrappers safe to PEEL for member-lookup / tuple-shape recovery without
// changing dispatch outcome. callers that don't care about precise member-set semantics
// (peelStructurePreservingWrapper, resolveNamedType inner-type resolve, tuple walk) use
// this. callers that DO care (getTypeMembers) branch separately on key-filter case
export const STRUCTURE_PRESERVING_WRAPPERS = TRANSPARENT_WRAPPERS.union(KEY_FILTERING_WRAPPERS);

// the utilities lib.d.ts writes as a NAKED conditional over their first parameter, which is what
// makes them distribute over a union argument (`U<A | B>` === `U<A> | U<B>`). the structure-
// preserving wrappers are the counter-example and must never join: `Pick<A | B, K>` is one mapped
// type over the whole union. `Extract` / `Exclude` / `Awaited` / `NonNullable` are distributive too
// but distribute inside their own resolvers, which also carry the `never`-arm rules
export const DISTRIBUTIVE_UTILITIES = new Set([
  'InstanceType',
  'Parameters',
  'ConstructorParameters',
]);

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

// shared sentinel for "no closure found" returns - cheaper than allocating a fresh empty
// Map per object literal when the rootName resolution bails. SAFE ONLY because every
// consumer treats the Map as READ-ONLY (`.get()` only). adding a caller that mutates this
// Map (`.set` / `.delete` / `.clear`) would poison the sentinel for every concurrent
// consumer - allocate a fresh Map instead at the new call site
export const EMPTY_CLOSURE = new Map();

// LHS positions that bind a value at runtime, distinguishing assign-as-mutation from
// assign-as-binding for the dataflow / rebind analysis
// the two destructuring patterns, enumerated ONCE: every walk that asks "is this a pattern"
// reads this set, so a third pattern type would be learned in one place instead of in each of
// the twenty tests that used to spell the pair by hand
export const DESTRUCTURE_PATTERN_TYPES = new Set(['ObjectPattern', 'ArrayPattern']);

export const ASSIGN_LEFT_TYPES = new Set(['Identifier', ...DESTRUCTURE_PATTERN_TYPES]);

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
