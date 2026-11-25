// The comparison every exercise shares, and the shape they all report. Bundled and transpiled with
// them. Both providers skip this file so its helpers cannot install the features under test.

// This file must keep working without polyfills. Exercise-specific code such as the `round`
// functions in Three and Planck stays with its exercise, where the providers analyze it.

// Array-index presence uses a baseline primitive even when the Object.hasOwn polyfill is under test.
const { hasOwnProperty } = Object.prototype;

// `toJSON` first, once, the way `JSON.stringify` does it: for a Date that method IS the value, and
// walking own properties instead finds none, so every date would equal every other one and `{}`. The
// cost is that a value compares EQUAL to what its `toJSON` renders, so where the point of a check is
// that something WAS rendered, assert its `typeof` alongside it.
export function unwrap(value) {
  const toJSON = value?.toJSON;
  return typeof toJSON === 'function' ? Function.prototype.call.call(toJSON, value) : value;
}

// A projection may allocate a fresh object. Remember it by the source identity
// so shared edges and back-edges still lead to the same projected vertex.
export function cachedProjection(project = unwrap) {
  const projections = new Map();
  return value => {
    if (!value || (typeof value !== 'object' && typeof value !== 'function')) return project(value);
    if (!projections.has(value)) projections.set(value, project(value));
    return projections.get(value);
  };
}

export function deepEqual(rawA, rawB, difference, project = unwrap) {
  const state = {
    projectLeft: cachedProjection(project), projectRight: cachedProjection(project),
    left: new Map(), right: new Map(), activeLeft: new Map(), activeRight: new Map(), ambiguous: false, cycle: false,
  };
  if (!compare(rawA, rawB, difference, state)) return false;
  // A cycle can close on just one side only if an object has more than one partner.
  return !state.ambiguous || !state.cycle || equalPaths(state.root, state.activeLeft, state.activeRight, difference);
}

function compare(rawA, rawB, difference, state, key) {
  const a = state.projectLeft(rawA);
  const b = state.projectRight(rawB);
  let equal = a === b;
  if (a && b && typeof a === 'object' && typeof b === 'object' && (!equal || state.root)) {
    if (!isEmulatedSymbol(a) && !isEmulatedSymbol(b)) equal = comparePair(a, b, difference, state, key);
  } else if (!equal && typeof a === 'number' && typeof b === 'number') {
    // eslint-disable-next-line no-self-compare, math/prefer-number-is-nan -- only NaN differs from itself
    equal = a !== a && b !== b;
  }
  if (!equal && difference && !difference.pair) difference.pair = [a, b];
  return equal;
}

// Read each object's properties once per pair. Keep the edges so that validating
// cycle topology never needs to repeat a getter, projection or collection traversal.
function comparePair(a, b, difference, state, key) {
  const parent = state.current;
  if (state.activeLeft.has(a) || state.activeRight.has(b)) {
    if (state.activeLeft.get(a) !== b) return false;
    state.cycle = true;
  }
  let matches = state.left.get(a);
  let pair = matches?.get(b);
  if (pair) {
    if (parent) parent.edges.push({ key, pair });
    return true;
  }
  if (matches || state.right.has(b)) state.ambiguous = true;
  if (!matches) state.left.set(a, matches = new Map());
  state.right.set(b, true);
  pair = { a, b, edges: [] };
  matches.set(b, pair);
  if (parent) parent.edges.push({ key, pair });
  else state.root = pair;
  state.current = pair;
  state.activeLeft.set(a, b);
  state.activeRight.set(b, a);
  const equal = equalObjects(a, b, difference, state);
  state.current = parent;
  state.activeLeft.delete(a);
  state.activeRight.delete(b);
  return equal;
}

function prependKey(difference, key) {
  if (difference && key !== undefined) difference.path = `[${ String(key) }]${ difference.path || '' }`;
}

function equalProperty(a, b, key, difference, state) {
  if (compare(a[key], b[key], difference, state, key)) return true;
  prependKey(difference, key);
  return false;
}

// Shared acyclic values may match independent copies. For cyclic graphs with aliases,
// stop at an ancestor only when both sides reach that same pair. Regions with a
// one-to-one pairing can be accepted together, regardless of how many paths they have.
function equalPaths(root, activeLeft, activeRight, difference) {
  const left = new Map();
  const right = new Map();
  const candidates = [];
  const boundary = [];
  function scan(pair) {
    if (pair.scan === left) return true;
    pair.scan = left;
    if (activeLeft.has(pair.a) || activeRight.has(pair.b)) {
      if (activeLeft.get(pair.a) === pair) {
        boundary.push(pair);
        return true;
      }
      if (difference) difference.pair = [pair.a, pair.b];
      return false;
    }
    const sameLeft = left.get(pair.a);
    const sameRight = right.get(pair.b);
    if (sameLeft) candidates.push(sameLeft, pair);
    if (sameRight) candidates.push(sameRight, pair);
    left.set(pair.a, pair);
    right.set(pair.b, pair);
    for (let i = 0; i < pair.edges.length; i++) {
      const edge = pair.edges[i];
      if (!scan(edge.pair)) {
        prependKey(difference, edge.key);
        return false;
      }
    }
    return true;
  }
  if (!scan(root)) return false;
  // These are exactly the vertices where this traversal met an ancestor. Other
  // ancestors cannot affect its result. Traversal order is fixed by the edges.
  if (root.boundaries?.some(previous => previous.length === boundary.length
    && previous.every((pair, index) => pair === boundary[index]))) return true;
  // Copies on disjoint branches cannot close a cycle against one another. Only
  // split the remaining paths if a conflicting partner is actually reachable.
  function reachesPartner(start) {
    const seen = new Map();
    function visit(pair) {
      if (activeLeft.has(pair.a) || activeRight.has(pair.b) || seen.has(pair)) return false;
      if (pair !== start && (pair.a === start.a || pair.b === start.b)) return true;
      seen.set(pair, true);
      for (let i = 0; i < pair.edges.length; i++) if (visit(pair.edges[i].pair)) return true;
      return false;
    }
    return visit(start);
  }
  if (!candidates.some(reachesPartner)) return true;
  activeLeft.set(root.a, root);
  activeRight.set(root.b, root);
  for (let i = 0; i < root.edges.length; i++) {
    const edge = root.edges[i];
    if (!equalPaths(edge.pair, activeLeft, activeRight, difference)) {
      prependKey(difference, edge.key);
      return false;
    }
  }
  activeLeft.delete(root.a);
  activeRight.delete(root.b);
  (root.boundaries ??= []).push(boundary);
  return true;
}

// A pure wrapper's brand and symbol enumerability are private to its core-js realm.
// Read only state that the exercise has already loaded. A host bringing values out
// of another realm supplies that realm while inspecting them.
// As in core-js/internals/global-this, a bare VM can lack every global alias.
// The script fallback is only needed outside browsers and workers with a global alias.
function currentRealm() {
  if (typeof globalThis === 'object') return globalThis;
  // eslint-disable-next-line unicorn/prefer-global-this -- IE11
  if (typeof window === 'object') return window;
  // eslint-disable-next-line no-restricted-globals, unicorn/prefer-global-this -- legacy workers
  if (typeof self === 'object') return self;
  return Function('return this')();
}
const realms = [currentRealm()];

export function observeRealm(realm) {
  realms.push(realm);
  let observing = true;
  return () => {
    if (observing) realms.splice(realms.lastIndexOf(realm), 1);
    observing = false;
  };
}

function coreJsState(value) {
  for (let i = 0; i < realms.length; i++) {
    const state = realms[i]['__core-js_shared__']?.state?.get(value);
    if (state?.type) return state;
  }
  return undefined;
}

export function isEmulatedSymbol(value) {
  return coreJsState(value)?.type === 'Symbol';
}

export function collectionInfo(value) {
  const state = coreJsState(value);
  if (state?.type === 'Map' || state?.type === 'Set') {
    const isMap = state.type === 'Map';
    // A wrapper delegates to a native collection. The complete replacement
    // keeps its insertion order in a linked list (collection-strong).
    if (state.collection) {
      const { collection } = state;
      return { isMap, size: collection.size, collection, prototype: Object.getPrototypeOf(collection) };
    }
    return { isMap, size: state.size, first: state.first };
  }
  for (let i = 0; i < realms.length; i++) {
    const realm = realms[i];
    const native = nativeCollection(value, realm.Map?.prototype, true) || nativeCollection(value, realm.Set?.prototype, false);
    if (native) return native;
  }
  // A foreign pure wrapper has no native collection slot. Its empty enumerable
  // surface cannot stand in for its contents when the host omitted its realm.
  if (realms.some(realm => Object.prototype.isPrototypeOf.call(realm.Object.prototype, value))) return undefined;
  if (collectionPrototype(value)) throw new TypeError('Cannot inspect foreign collection: register its source with observeRealm()');
  return undefined;
}

function nativeCollection(collection, prototype, isMap) {
  if (!prototype) return undefined;
  const descriptor = Object.getOwnPropertyDescriptor(prototype, 'size');
  const readSize = descriptor?.get || descriptor?.value;
  if (typeof readSize === 'function') {
    try {
      return { isMap, prototype, size: Function.prototype.call.call(readSize, collection), collection };
    } catch {
      // The receiver has no such native slot.
    }
  }
  return undefined;
}

// Walk past instance and subclass overrides to the collection implementation.
function collectionPrototype(value) {
  let result;
  for (let proto = Object.getPrototypeOf(value); proto; proto = Object.getPrototypeOf(proto)) {
    if (hasOwnProperty.call(proto, 'size') && hasOwnProperty.call(proto, 'has')
      && hasOwnProperty.call(proto, 'clear') && (hasOwnProperty.call(proto, 'add') || hasOwnProperty.call(proto, 'set'))) result = proto;
  }
  return result;
}

export function collectionValues(info) {
  const values = [];
  if (!info.collection) {
    for (let entry = info.first; entry; entry = entry.next) values.push(info.isMap ? [entry.key, entry.value] : entry.value);
    return values;
  }
  const { collection, isMap, prototype, size } = info;
  const source = typeof prototype.forEach === 'function' ? prototype : collectionPrototype(collection) || prototype;
  if (typeof source.forEach === 'function') {
    Function.prototype.call.call(source.forEach, collection, (value, key) => {
      values.push(isMap ? [key, value] : value);
    });
  } else {
    // Before standard iterators, entries().next() returned the pair directly.
    // Read exactly size entries so neither iterator protocol needs an extra next().
    const entries = source.entries || prototype.entries;
    if (typeof entries !== 'function') throw new TypeError('Cannot iterate native collection without forEach or entries');
    const iterator = Function.prototype.call.call(entries, collection);
    for (let i = 0; i < size; i++) {
      const step = iterator.next();
      const entry = Array.isArray(step) ? step : step.value;
      values.push(isMap ? entry : entry[1]);
    }
  }
  return values;
}

// In a pure bundle on a symbolless engine the logical symbol is an object, its
// property is stored under a string, and es.symbol.constructor keeps enumerability
// in internal state. Global reflection alone cannot see this combination.
export function enumerableKeys(value, array = false) {
  const keys = Object.keys(value);
  const fields = array ? keys.filter(key => String(key >>> 0) !== key || +key >= value.length) : keys;
  if (Object.getOwnPropertySymbols) {
    const symbols = Object.getOwnPropertySymbols(value);
    for (let i = 0; i < symbols.length; i++) {
      if (Object.getOwnPropertyDescriptor(value, symbols[i])?.enumerable) fields.push(symbols[i]);
    }
  }
  for (let i = 0; i < realms.length; i++) {
    const realm = realms[i];
    const store = realm['__core-js_shared__'];
    if (!store?.symbols) continue;
    const names = Object.getOwnPropertyNames(value === realm.Object.prototype ? store['op-symbols'] : value);
    const hidden = store.state?.get(value)?.nes;
    for (let j = 0; j < names.length; j++) {
      const name = names[j];
      if (!hasOwnProperty.call(store.symbols, name) || !hasOwnProperty.call(value, name)) continue;
      const symbol = store.symbols[name];
      const index = fields.indexOf(name);
      if (index !== -1) fields.splice(index, 1);
      if (!hidden?.[name] && fields.indexOf(symbol) === -1) fields.push(symbol);
    }
  }
  return fields;
}

function missingKey(object, key, missing, difference) {
  if (difference) {
    // The absent side already establishes the mismatch. Do not invoke an accessor
    // just to display the present side.
    const desc = Object.getOwnPropertyDescriptor(object, key);
    let value = '<removed during enumeration>';
    if (desc) value = hasOwnProperty.call(desc, 'value') ? desc.value : '<accessor>';
    difference.missing = missing;
    difference.pair = missing === 'actual' ? [undefined, value] : [value, undefined];
    prependKey(difference, key);
  }
  return false;
}

function equalObjects(a, b, difference, state) {
  const array = Array.isArray(a);
  if (array !== Array.isArray(b)) return false;
  if (array) {
    if (a.length !== b.length) {
      if (difference) {
        difference.pair = [a.length, b.length];
        prependKey(difference, 'length');
      }
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      const present = hasOwnProperty.call(a, i);
      if (present !== hasOwnProperty.call(b, i)) return missingKey(present ? a : b, i, present ? 'expected' : 'actual', difference);
      if (present && !equalProperty(a, b, i, difference, state)) return false;
    }
  } else {
    const aCollection = collectionInfo(a);
    const bCollection = collectionInfo(b);
    if (aCollection?.isMap !== bCollection?.isMap) return false;
    // Compare collection iteration order and contents, then the object's own enumerable fields.
    if (aCollection && (aCollection.size !== bCollection.size
      || !compare(collectionValues(aCollection), collectionValues(bCollection), difference, state))) {
      return false;
    }
  }
  const keys = enumerableKeys(a, array);
  const other = enumerableKeys(b, array);
  const remaining = new Map();
  for (let i = 0; i < other.length; i++) remaining.set(other[i], true);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (!remaining.has(key)) return missingKey(a, key, 'expected', difference);
    remaining.delete(key);
  }
  if (keys.length !== other.length) {
    for (let i = 0; i < other.length; i++) {
      if (remaining.has(other[i])) return missingKey(b, other[i], 'actual', difference);
    }
  }
  for (let i = 0; i < keys.length; i++) if (!equalProperty(a, b, keys[i], difference, state)) return false;
  return true;
}

// Every exercise reports the same shape - `{ checks }`, one entry per assertion, carrying both sides
// so a red cell names what it got rather than only that it was wrong.
export function checker() {
  const checks = [];
  const labels = {};
  return {
    checks,
    check(label, actual, expected) {
      const key = `$${ label }`;
      if (hasOwnProperty.call(labels, key)) throw new Error(`duplicate check label '${ label }' - a label names one check`);
      labels[key] = true;
      const difference = {};
      const pass = deepEqual(actual, expected, difference);
      checks.push({ label, actual, expected, pass, difference: pass ? undefined : difference });
    },
  };
}
