// shared primitives for resolve-node-type: type classes + hint sets. hoisted out to keep
// the factory file focused on the resolver itself
const { assign, create, entries, keys } = Object;

// shared recursion budget for all resolvers - alias chains, runtime walks, guard traversals
export const MAX_DEPTH = 64;

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

// collection types whose first type parameter is the element type
export const SINGLE_ELEMENT_COLLECTIONS = new Set([
  'Array',
  'ReadonlyArray',
  'Set',
  'ReadonlySet',
  'Iterable',
  'IterableIterator',
  'Iterator',
  // TS 5.6+ stdlib base for iterator-helper chains - `declare const x: IteratorObject<T>`
  'IteratorObject',
  'AsyncIterable',
  'AsyncIterableIterator',
  'AsyncIterator',
  'AsyncIteratorObject',
  'Generator',
  'AsyncGenerator',
]);

export const PATTERN_WRAPPERS = new Set([
  'ArrayPattern',
  'ObjectPattern',
  'Property',
  'ObjectProperty',
  'AssignmentPattern',
  'RestElement',
]);

export function $Primitive(type) {
  this.type = type;
  this.constructor = null;
  // inner stored as a hint string, resolved lazily via resolveInnerType
  this.inner = type === 'string' ? 'string' : null;
}

$Primitive.prototype.primitive = true;

export function $Object(constructor, inner) {
  this.type = 'object';
  this.constructor = constructor;
  this.inner = inner ?? null;
}

$Object.prototype.primitive = false;
