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
