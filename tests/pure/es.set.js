/* eslint-disable radar/no-element-overwrite -- required for testing */

import { createIterable, is, nativeSubclass } from '../helpers/helpers';

import { Set, Map, Symbol } from 'core-js-pure';
import getIterator from 'core-js-pure/features/get-iterator';
import getIteratorMethod from 'core-js-pure/features/get-iterator-method';
import { freeze, getOwnPropertyDescriptor, keys, getOwnPropertyNames, getOwnPropertySymbols } from 'core-js-pure/features/object';
import ownKeys from 'core-js-pure/features/reflect/own-keys';
import from from 'core-js-pure/features/array/from';

QUnit.test('Set', assert => {
  assert.isFunction(Set);
  assert.ok('add' in Set.prototype, 'add in Set.prototype');
  assert.ok('clear' in Set.prototype, 'clear in Set.prototype');
  assert.ok('delete' in Set.prototype, 'delete in Set.prototype');
  assert.ok('forEach' in Set.prototype, 'forEach in Set.prototype');
  assert.ok('has' in Set.prototype, 'has in Set.prototype');
  assert.ok(new Set() instanceof Set, 'new Set instanceof Set');
  const set = new Set();
  set.add(1);
  set.add(2);
  set.add(3);
  set.add(2);
  set.add(1);
  assert.strictEqual(set.size, 3);
  const result = [];
  set.forEach(val => {
    result.push(val);
  });
  assert.deepEqual(result, [1, 2, 3]);
  assert.strictEqual(new Set(createIterable([1, 2, 3])).size, 3, 'Init from iterable');
  assert.strictEqual(new Set([freeze({}), 1]).size, 2, 'Support frozen objects');
  assert.strictEqual(new Set([NaN, NaN, NaN]).size, 1);
  assert.deepEqual(from(new Set([3, 4]).add(2).add(1)), [3, 4, 2, 1]);
  let done = false;
  const { add } = Set.prototype;
  Set.prototype.add = function () {
    throw new Error();
  };
  try {
    new Set(createIterable([null, 1, 2], {
      return() {
        return done = true;
      },
    }));
  } catch { /* empty */ }
  Set.prototype.add = add;
  assert.ok(done, '.return #throw');
  const array = [];
  done = false;
  array['@@iterator'] = undefined;
  array[Symbol.iterator] = function () {
    done = true;
    return getIteratorMethod([]).call(this);
  };
  new Set(array);
  assert.ok(done);
  const object = {};
  new Set().add(object);
  const results = [];
  for (const key in results) keys.push(key);
  assert.arrayEqual(results, []);
  assert.arrayEqual(keys(object), []);
  assert.arrayEqual(getOwnPropertyNames(object), []);
  if (getOwnPropertySymbols) assert.arrayEqual(getOwnPropertySymbols(object), []);
  if (ownKeys) assert.arrayEqual(ownKeys(object), []);
  if (nativeSubclass) {
    const Subclass = nativeSubclass(Set);
    assert.ok(new Subclass() instanceof Subclass, 'correct subclassing with native classes #1');
    assert.ok(new Subclass() instanceof Set, 'correct subclassing with native classes #2');
    assert.ok(new Subclass().add(2).has(2), 'correct subclassing with native classes #3');
  }
});

QUnit.test('Set#add', assert => {
  assert.isFunction(Set.prototype.add);
  const array = [];
  let set = new Set();
  set.add(NaN);
  set.add(2);
  set.add(3);
  set.add(2);
  set.add(1);
  set.add(array);
  assert.strictEqual(set.size, 5);
  const chain = set.add(NaN);
  assert.strictEqual(chain, set);
  assert.strictEqual(set.size, 5);
  set.add(2);
  assert.strictEqual(set.size, 5);
  set.add(array);
  assert.strictEqual(set.size, 5);
  set.add([]);
  assert.strictEqual(set.size, 6);
  set.add(4);
  assert.strictEqual(set.size, 7);
  const frozen = freeze({});
  set = new Set();
  set.add(frozen);
  assert.ok(set.has(frozen));
});

QUnit.test('Set#clear', assert => {
  assert.isFunction(Set.prototype.clear);
  let set = new Set();
  set.clear();
  assert.strictEqual(set.size, 0);
  set = new Set();
  set.add(1);
  set.add(2);
  set.add(3);
  set.add(2);
  set.add(1);
  set.clear();
  assert.strictEqual(set.size, 0);
  assert.ok(!set.has(1));
  assert.ok(!set.has(2));
  assert.ok(!set.has(3));
  const frozen = freeze({});
  set = new Set();
  set.add(1);
  set.add(frozen);
  set.clear();
  assert.strictEqual(set.size, 0, 'Support frozen objects');
  assert.ok(!set.has(1));
  assert.ok(!set.has(frozen));
});

QUnit.test('Set#delete', assert => {
  assert.isFunction(Set.prototype.delete);
  const array = [];
  const set = new Set();
  set.add(NaN);
  set.add(2);
  set.add(3);
  set.add(2);
  set.add(1);
  set.add(array);
  assert.strictEqual(set.size, 5);
  assert.strictEqual(set.delete(NaN), true);
  assert.strictEqual(set.size, 4);
  assert.strictEqual(set.delete(4), false);
  assert.strictEqual(set.size, 4);
  set.delete([]);
  assert.strictEqual(set.size, 4);
  set.delete(array);
  assert.strictEqual(set.size, 3);
  const frozen = freeze({});
  set.add(frozen);
  assert.strictEqual(set.size, 4);
  set.delete(frozen);
  assert.strictEqual(set.size, 3);
});

QUnit.test('Set#forEach', assert => {
  assert.isFunction(Set.prototype.forEach);
  let result = [];
  let count = 0;
  let set = new Set();
  set.add(1);
  set.add(2);
  set.add(3);
  set.add(2);
  set.add(1);
  set.forEach(value => {
    count++;
    result.push(value);
  });
  assert.strictEqual(count, 3);
  assert.deepEqual(result, [1, 2, 3]);
  set = new Set();
  set.add('0');
  set.add('1');
  set.add('2');
  set.add('3');
  result = '';
  set.forEach(it => {
    result += it;
    if (it === '2') {
      set.delete('2');
      set.delete('3');
      set.delete('1');
      set.add('4');
    }
  });
  assert.strictEqual(result, '0124');
  set = new Set();
  set.add('0');
  result = '';
  set.forEach(it => {
    set.delete('0');
    if (result !== '') throw new Error();
    result += it;
  });
  assert.strictEqual(result, '0');
  assert.throws(() => {
    Set.prototype.forEach.call(new Map(), () => { /* empty */ });
  }, 'non-generic');
});

QUnit.test('Set#has', assert => {
  assert.isFunction(Set.prototype.has);
  const array = [];
  const frozen = freeze({});
  const set = new Set();
  set.add(NaN);
  set.add(2);
  set.add(3);
  set.add(2);
  set.add(1);
  set.add(frozen);
  set.add(array);
  assert.ok(set.has(NaN));
  assert.ok(set.has(array));
  assert.ok(set.has(frozen));
  assert.ok(set.has(2));
  assert.ok(!set.has(4));
  assert.ok(!set.has([]));
});

QUnit.test('Set#size', assert => {
  const set = new Set();
  set.add(1);
  const { size } = set;
  assert.strictEqual(typeof size, 'number', 'size is number');
  assert.strictEqual(size, 1, 'size is correct');
  const sizeDescriptor = getOwnPropertyDescriptor(Set.prototype, 'size');
  assert.ok(sizeDescriptor && sizeDescriptor.get, 'size is getter');
  assert.ok(sizeDescriptor && !sizeDescriptor.set, 'size isnt setter');
  assert.throws(() => {
    Set.prototype.size;
  }, TypeError);
});

QUnit.test('Set & -0', assert => {
  let set = new Set();
  set.add(-0);
  assert.strictEqual(set.size, 1);
  assert.ok(set.has(0));
  assert.ok(set.has(-0));
  set.forEach(it => {
    assert.ok(!is(it, -0));
  });
  set.delete(-0);
  assert.strictEqual(set.size, 0);
  set = new Set([-0]);
  set.forEach(key => {
    assert.ok(!is(key, -0));
  });
  set = new Set();
  set.add(4);
  set.add(3);
  set.add(2);
  set.add(1);
  set.add(0);
  assert.ok(set.has(-0));
});

QUnit.test('Set#@@toStringTag', assert => {
  assert.strictEqual(Set.prototype[Symbol.toStringTag], 'Set', 'Set::@@toStringTag is `Set`');
  assert.strictEqual(String(new Set()), '[object Set]', 'correct stringification');
});

QUnit.test('Set Iterator', assert => {
  const set = new Set();
  set.add('a');
  set.add('b');
  set.add('c');
  set.add('d');
  const results = [];
  const iterator = set.keys();
  results.push(iterator.next().value);
  assert.ok(set.delete('a'));
  assert.ok(set.delete('b'));
  assert.ok(set.delete('c'));
  set.add('e');
  results.push(iterator.next().value, iterator.next().value);
  assert.ok(iterator.next().done);
  set.add('f');
  assert.ok(iterator.next().done);
  assert.deepEqual(results, ['a', 'd', 'e']);
});

QUnit.test('Set#keys', assert => {
  assert.isFunction(Set.prototype.keys);
  const set = new Set();
  set.add('q');
  set.add('w');
  set.add('e');
  const iterator = set.keys();
  assert.isIterator(iterator);
  assert.isIterable(iterator);
  assert.strictEqual(iterator[Symbol.toStringTag], 'Set Iterator');
  assert.deepEqual(iterator.next(), {
    value: 'q',
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: 'w',
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: 'e',
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: undefined,
    done: true,
  });
});

QUnit.test('Set#values', assert => {
  assert.isFunction(Set.prototype.values);
  const set = new Set();
  set.add('q');
  set.add('w');
  set.add('e');
  const iterator = set.values();
  assert.isIterator(iterator);
  assert.isIterable(iterator);
  assert.strictEqual(iterator[Symbol.toStringTag], 'Set Iterator');
  assert.deepEqual(iterator.next(), {
    value: 'q',
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: 'w',
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: 'e',
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: undefined,
    done: true,
  });
});

QUnit.test('Set#entries', assert => {
  assert.isFunction(Set.prototype.entries);
  const set = new Set();
  set.add('q');
  set.add('w');
  set.add('e');
  const iterator = set.entries();
  assert.isIterator(iterator);
  assert.isIterable(iterator);
  assert.strictEqual(iterator[Symbol.toStringTag], 'Set Iterator');
  assert.deepEqual(iterator.next(), {
    value: ['q', 'q'],
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: ['w', 'w'],
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: ['e', 'e'],
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: undefined,
    done: true,
  });
});

QUnit.test('Set#@@iterator', assert => {
  const set = new Set();
  set.add('q');
  set.add('w');
  set.add('e');
  const iterator = getIterator(set);
  assert.isIterator(iterator);
  assert.isIterable(iterator);
  assert.strictEqual(iterator[Symbol.toStringTag], 'Set Iterator');
  assert.strictEqual(String(iterator), '[object Set Iterator]');
  assert.deepEqual(iterator.next(), {
    value: 'q',
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: 'w',
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: 'e',
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: undefined,
    done: true,
  });
});
