QUnit.test('a relocated loop mirrors the selected realm before nested instance dispatch', assert => {
  function read(flag, own) {
    const result = [];
    for (const { Array: { prototype: { at }, of } } of [flag ? globalThis : own]) {
      result.push([at.call([3, 7], -1), of(5)]);
    }
    return result;
  }
  const own = { Array: {
    prototype: { at() { return 'own'; } },
    of(value) { return [value + 1]; },
  } };
  assert.deepEqual(read(true, own), [[7, [5]]]);
  assert.deepEqual(read(false, own), [['own', [6]]]);
  assert.deepEqual(read(true, own), [[7, [5]]], 'a second visit keeps no foreign receiver');
});

QUnit.test('an opted-out sibling keeps its read beside a mirrored static', assert => {
  const log = [];
  const own = { Array: {
    from(value) { log.push('from'); return value; },
    get of() { log.push('of'); return 'own'; },
  } };
  function read(flag) {
    function selected({ Array: {
      from,
      // core-js-disable-next-line
      of,
    } } = flag ? globalThis : own) {
      return [from([4]), flag ? 'realm' : of];
    }
    return selected();
  }
  assert.deepEqual(read(true), [[4], 'realm']);
  assert.deepEqual(log, []);
  assert.deepEqual(read(false), [[4], 'own']);
  assert.deepEqual(log, ['of', 'from'], 'native slot reads precede the function body');
});
