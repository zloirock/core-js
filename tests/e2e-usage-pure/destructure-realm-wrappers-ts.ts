// A transparent wrapper on the realm stays visitable until nested instance extraction
// captures its receiver. Every declaration host must work without a native globalThis.
export const { w: { Array: { prototype: { at: exportedConstAt, flat: exportedConstFlat } } } } = { w: globalThis! };
export let { w: { Array: { prototype: { at: exportedLetAt, flat: exportedLetFlat } } } } = { w: globalThis! };
export var { w: { Array: { prototype: { at: exportedVarAt, flat: exportedVarFlat } } } } = { w: globalThis! };
export const before = 1,
  { w: { Array: { prototype: { at: exportedMultiAt, flat: exportedMultiFlat } } } } = { w: globalThis! },
  after = 2;

QUnit.test('destructuring: a non-null realm survives declaration and export captures', assert => {
  const { w: { Array: { prototype: { at: constAt, flat: constFlat } } } } = { w: globalThis! };
  let { w: { Array: { prototype: { at: letAt, flat: letFlat } } } } = { w: globalThis! };
  var { w: { Array: { prototype: { at: varAt, flat: varFlat } } } } = { w: globalThis! };

  for (const [at, flat] of [
    [constAt, constFlat],
    [letAt, letFlat],
    [varAt, varFlat],
    [exportedConstAt, exportedConstFlat],
    [exportedLetAt, exportedLetFlat],
    [exportedVarAt, exportedVarFlat],
    [exportedMultiAt, exportedMultiFlat],
  ]) {
    assert.same(at.call([3, 5], -1), 5);
    assert.deepEqual(flat.call([3, [5]]), [3, 5]);
  }
  assert.deepEqual([before, after], [1, 2], 'neighboring exported declarators retain their values');
});

QUnit.test('destructuring: realm assertions and satisfies share the non-null behavior', assert => {
  const { w: { Array: { prototype: { at: asAt, flat: asFlat } } } } = { w: (globalThis as any) };
  const { w: { Array: { prototype: { at: satisfiesAt, flat: satisfiesFlat } } } } = { w: (globalThis satisfies unknown) };
  const { w: { Array: { prototype: { at: angleAt, flat: angleFlat } } } } = { w: (<any>globalThis) };

  for (const [at, flat] of [[asAt, asFlat], [satisfiesAt, satisfiesFlat], [angleAt, angleFlat]]) {
    assert.same(at.call([7, 11], -1), 11);
    assert.deepEqual(flat.call([7, [11]]), [7, 11]);
  }
});

QUnit.test('destructuring: computed keys keep their effects beside a wrapped realm', assert => {
  const effects: string[] = [];
  const { w: { Array: { prototype: {
    [(effects.push('at'), 'at')]: at,
    [(effects.push('flat'), 'flat')]: flat,
  } } } } = { w: globalThis!, marker: effects.push('init') };

  assert.same(at.call([13, 17], -1), 17);
  assert.deepEqual(flat.call([13, [17]]), [13, 17]);
  assert.deepEqual(effects, ['init', 'at', 'flat'], 'the initializer runs before each key, once');
});

QUnit.test('destructuring: a wrapped shadowed realm keeps user slots and null throws', assert => {
  function read(globalThis: any) {
    const { w: { Array: { prototype: { at, flat } } } } = { w: globalThis! };
    return [at, flat];
  }
  assert.deepEqual(read({ Array: { prototype: { at: 19, flat: 23 } } }), [19, 23]);
  assert.throws(() => read(null), TypeError, 'a non-null assertion adds no runtime guard');
});

const pair: [number[], number[]] = [[3, 5], [7, 11]];
const mixed: [number, { at: number }] = [13, { at: 17 }];
namespace PositionalPublic {
  export const [{ at: left }, { at: right }] = pair;
  export namespace Nested {
    export const [index, { at: value }] = mixed;
  }
}

QUnit.test('namespace exports keep positional source names and private captures', assert => {
  assert.deepEqual(Object.keys(PositionalPublic).sort(), ['Nested', 'left', 'right']);
  assert.deepEqual(Object.keys(PositionalPublic.Nested).sort(), ['index', 'value']);
  assert.same(PositionalPublic.left.call(pair[0], -1), 5);
  assert.same(PositionalPublic.right.call(pair[1], -1), 11);
  assert.same(PositionalPublic.Nested.index, 13);
  assert.same(PositionalPublic.Nested.value, 17);
});

const namespaceKeys: string[] = [];
function noteNamespaceKey() { namespaceKeys.push('of'); }
namespace StaticPublic {
  export const { Array: { from, [(noteNamespaceKey(), 'of')]: of }, Infinity: infinity } = globalThis;
}
QUnit.test('namespace static captures keep their effects and export only source bindings', assert => {
  assert.deepEqual(Object.keys(StaticPublic).sort(), ['from', 'infinity', 'of']);
  assert.deepEqual(StaticPublic.from([3]), [3]);
  assert.deepEqual(StaticPublic.of(7), [7]);
  assert.deepEqual(namespaceKeys, ['of']);
});

const computedKeys: string[] = [];
function observeRealmKey() { computedKeys.push('key'); }
namespace KeyedPublic {
  export const { globalThis: { [(observeRealmKey(), 'Promise')]: { resolve } }, Infinity: infinity } = globalThis;
}
QUnit.test('a computed namespace capture exports only its source names', assert => {
  assert.deepEqual(Object.keys(KeyedPublic).sort(), ['infinity', 'resolve']);
  assert.same(typeof KeyedPublic.resolve, 'function');
  assert.same(KeyedPublic.infinity, Infinity);
  assert.deepEqual(computedKeys, ['key']);
});

const publicationOrder: string[] = [];
let publishedFrom: typeof Array.from;
namespace OrderedPublic { export const ready = true; }
Object.defineProperties(OrderedPublic, {
  a: { set() { publicationOrder.push('a'); } },
  b: { set(value) { publicationOrder.push('b'); publishedFrom = value; } },
});
namespace OrderedPublic {
  export const { Array: { [(publicationOrder.push('key'), 'of')]: a, from: b } } = JSON.parse('true') && { Array };
}
QUnit.test('a computed namespace export publishes its bindings to the original setters in order', assert => {
  assert.deepEqual(publicationOrder, ['key', 'a', 'b']);
  assert.deepEqual(publishedFrom([8]), [8]);
});

const privateCaptureEffects: string[] = [];
function privateCaptureArray(): number[] {
  privateCaptureEffects.push('array');
  return [3, 7];
}
namespace ArrayPublic {
  export const before = privateCaptureEffects.push('before'),
    [{ at, keys }] = [privateCaptureArray()], after = privateCaptureEffects.push('after');
}
const guardedObject = JSON.parse('true') ? Object : { entries: () => [['custom', 19]] };
namespace GuardedPublic {
  export const { w: { entries } } = { w: guardedObject };
}
function defaultCaptureSource(): any { return {}; }
namespace DefaultPublic {
  export const { k: { of, [(privateCaptureEffects.push('key'), 'unknown')]: value } = Array } = defaultCaptureSource();
}
QUnit.test('namespace captures remain private across array, guarded and default routes', assert => {
  assert.deepEqual(Object.keys(ArrayPublic).sort(), ['after', 'at', 'before', 'keys']);
  assert.same(ArrayPublic.at.call([3, 7], -1), 7);
  assert.same(ArrayPublic.keys.call([3, 7]).next().value, 0);
  assert.deepEqual(Object.keys(GuardedPublic), ['entries']);
  assert.deepEqual(GuardedPublic.entries({ a: 2 }), [['a', 2]]);
  assert.deepEqual(Object.keys(DefaultPublic).sort(), ['of', 'value']);
  assert.deepEqual(DefaultPublic.of(5), [5]);
  assert.same(DefaultPublic.value, undefined);
  assert.deepEqual(privateCaptureEffects, ['before', 'array', 'after', 'key']);
});

const privateReplacementEffects: string[] = [];
namespace SymbolPublic {
  export const before = privateReplacementEffects.push('before'),
    { Set: { [(privateReplacementEffects.push('key'), Symbol.iterator)]: method } } = globalThis as any,
    { WeakMap: { [(privateReplacementEffects.push('default-key'), Symbol.iterator)]: fallback = null } } = globalThis as any;
}
namespace DispatchedPublic {
  export const { array: { at: first }, realm: { WeakSet: Value }, tail } = {
    array: [41],
    get realm() { privateReplacementEffects.push(typeof first); return globalThis; },
    get tail() { privateReplacementEffects.push(typeof Value); return 3; },
  };
}
QUnit.test('replaced namespace captures retain their private role', assert => {
  assert.deepEqual(Object.keys(SymbolPublic).sort(), ['before', 'fallback', 'method']);
  assert.same(SymbolPublic.method, undefined);
  assert.same(SymbolPublic.fallback, null);
  assert.deepEqual(Object.keys(DispatchedPublic).sort(), ['Value', 'first', 'tail']);
  assert.same(DispatchedPublic.first.call([41], -1), 41);
  assert.same(typeof DispatchedPublic.Value, 'function');
  assert.same(DispatchedPublic.tail, 3);
  assert.deepEqual(privateReplacementEffects, ['before', 'key', 'default-key', 'function', 'function']);
});

QUnit.test('destructuring: a spread reads an inherited hole before the next argument element', assert => {
  const proto = Object.getPrototypeOf([]);
  const length = proto.length;
  const saved = Object.getOwnPropertyDescriptor(proto, '1');
  let reads = 0, end = 0, after = 0, errorName;
  function read(flag: boolean) {
    // The type wrapper keeps the ES5 spread helper's iterator read observable too.
    return (([{ from }]) => typeof from)([...([flag ? Array : Set, , ++end] as any[]), after = end]);
  }
  Object.defineProperty(proto, '1', { configurable: true, get() {
    reads++;
    throw new RangeError();
  } });
  try { read(true); } catch (error) {
    errorName = error.name;
  } finally {
    if (saved) Object.defineProperty(proto, '1', saved);
    else delete proto[1];
    proto.length = length;
  }
  assert.same(errorName, 'RangeError');
  assert.deepEqual([reads, end, after], [1, 1, 0]);
});

QUnit.test('a loop header keeps a computed iterator key on a wrapped realm at its source slot', assert => {
  const log: string[] = [];
  let visits = 0;
  for (const before = log.push('before'), { [(log.push('key'), Symbol.iterator)]: it, Infinity: bound } = (globalThis as any),
             after = log.push('after'); visits < 1; visits++) {
    assert.same(before, 1);
    assert.same(it, (globalThis as any)[Symbol.iterator]);
    assert.same(bound, Infinity);
    assert.same(after, 3);
  }
  assert.same(visits, 1);
  assert.deepEqual(log, ['before', 'key', 'after']);
});
