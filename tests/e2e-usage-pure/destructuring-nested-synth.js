import { restoreProperty } from '../helpers/restore-property.cjs';

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

QUnit.test('a relocated realm head keeps both dynamic and nested claims', assert => {
  function read(key) {
    const result = [];
    for (const { globalThis: { [key]: value, Array: { from } } } of [globalThis]) result.push([typeof value, from([7])[0]]);
    return result;
  }
  assert.deepEqual(read('Object'), [['function', 7]]);
  const result = [];
  let at, from;
  for ({ globalThis: { Array: { prototype: { at }, from } } } of [globalThis, globalThis]) {
    result.push(at.call(from([7]), 0));
  }
  assert.deepEqual(result, [7, 7], 'an assignment head retains its live receiver on each iteration');
});

QUnit.test('a nested parameter mirror preserves its live fallback and null throw', assert => {
  const log = [];
  function fallback() {
    log.push('default');
    return [7];
  }
  function read(box) {
    function use({ y: { at } = fallback() } = { y: box.list }) { return at.call([11], 0); }
    try {
      return use();
    } catch (error) {
      return error.name;
    }
  }
  assert.same(read({ get list() { log.push('slot'); } }), 11);
  assert.deepEqual(log, ['slot', 'default']);
  log.length = 0;
  assert.same(read({ get list() {
    log.push('slot');
    return null;
  } }), 'TypeError');
  assert.deepEqual(log, ['slot'], 'null never enters the undefined fallback');
});

QUnit.test('a nested lazy instance mirror keeps computed-key order on repeated passes', assert => {
  const log = [];
  function read(source) {
    function use({ y: { [(log.push('key'), 'at')]: at } } = { y: source }) { return at; }
    return use();
  }
  assert.same(read({ get at() {
    log.push('read');
    return 17;
  } }), 17);
  assert.deepEqual(log, ['key', 'read']);
});

QUnit.test('a mirrored user slot retains its getter turn and fallback', assert => {
  const saved = Object.getOwnPropertyDescriptor(globalThis, 'userList');
  const log = [];
  let list;
  Object.defineProperty(globalThis, 'userList', { configurable: true, get() {
    log.push('slot');
    return list;
  } });
  function fallback() {
    log.push('default');
    return [7];
  }
  function later() {
    log.push('later');
    list = [9];
    return 1;
  }
  function read(user) {
    return (({ userList: { at }, Map: M }, other) => [at.call(list, 0), typeof M, other])(user || globalThis, later());
  }
  function use({ userList: { at, includes } = fallback(), Map: M } = globalThis, other = log.push('later')) {
    return [at.call([7], 0), includes.call([7], 7), typeof M, other];
  }
  try {
    assert.deepEqual(read(), [9, 'function', 1]);
    assert.deepEqual(log, ['later', 'slot']);
    log.length = 0;
    list = undefined;
    assert.deepEqual(use(), [7, true, 'function', 3]);
    assert.deepEqual(log, ['slot', 'default', 'later']);
    list = [7];
    log.length = 0;
    for (const { userList: { at }, Map: M } of [globalThis, globalThis]) {
      assert.same(at.call(list, 0), 7);
      assert.same(typeof M, 'function');
    }
    assert.deepEqual(log, ['slot', 'slot'], 'each loop iteration reads its own user slot');
  } finally {
    restoreProperty(globalThis, 'userList', saved);
  }
});

QUnit.test('a mirror reads a fresh data slot eagerly without advancing its nested getter', assert => {
  const saved = Object.getOwnPropertyDescriptor(globalThis, 'mirrorDataSlot');
  const log = [];
  let C = 0,
      value;
  function change() {
    log.push('change');
    globalThis.mirrorDataSlot = { x: 19 };
    return 'mirrorDataSlot';
  }
  try {
    Object.defineProperty(globalThis, 'mirrorDataSlot', { configurable: true, writable: true,
      value: { get x() { log.push('inner'); return typeof C; } } });
    ({ Set: C, mirrorDataSlot: { x: value } } = globalThis);
    assert.deepEqual([typeof C, value], ['function', 'function']);
    assert.deepEqual(log, ['inner']);
    Object.defineProperty(globalThis, 'mirrorDataSlot', { configurable: true, writable: true, value: { x: 17 } });
    ({ Set: C, [(change(), 'mirrorDataSlot')]: { x: value } } = globalThis);
    assert.same(value, 19, 'a computed key keeps the slot read at its original turn');
    assert.deepEqual(log, ['inner', 'change']);
  } finally {
    restoreProperty(globalThis, 'mirrorDataSlot', saved);
  }
});
