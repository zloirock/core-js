/* eslint-disable sonarjs/no-element-overwrite -- required for testing */

import { createIterable, is, nativeSubclass } from '../helpers/helpers.js';
import { DESCRIPTORS } from '../helpers/constants.js';

import getIterator from 'core-js-pure/es/get-iterator';
import getIteratorMethod from 'core-js-pure/es/get-iterator-method';
import from from 'core-js-pure/es/array/from';
import freeze from 'core-js-pure/es/object/freeze';
import getOwnPropertyDescriptor from 'core-js-pure/es/object/get-own-property-descriptor';
import getOwnPropertyNames from 'core-js-pure/es/object/get-own-property-names';
import getOwnPropertySymbols from 'core-js-pure/es/object/get-own-property-symbols';
import keys from 'core-js-pure/es/object/keys';
import ownKeys from 'core-js-pure/es/reflect/own-keys';
import Symbol from 'core-js-pure/es/symbol';
import Map from 'core-js-pure/es/map';
import Set from 'core-js-pure/es/set';

QUnit.test('Set', assert => {
  assert.isFunction(Set);
  assert.true('add' in Set.prototype, 'add in Set.prototype');
  assert.true('clear' in Set.prototype, 'clear in Set.prototype');
  assert.true('delete' in Set.prototype, 'delete in Set.prototype');
  assert.true('forEach' in Set.prototype, 'forEach in Set.prototype');
  assert.true('has' in Set.prototype, 'has in Set.prototype');
  assert.true(new Set() instanceof Set, 'new Set instanceof Set');
  let set = new Set();
  set.add(1);
  set.add(2);
  set.add(3);
  set.add(2);
  set.add(1);
  assert.same(set.size, 3);
  const result = [];
  set.forEach(val => {
    result.push(val);
  });
  assert.deepEqual(result, [1, 2, 3]);
  assert.same(new Set(createIterable([1, 2, 3])).size, 3, 'Init from iterable');
  assert.same(new Set([freeze({}), 1]).size, 2, 'Support frozen objects');
  assert.same(new Set([NaN, NaN, NaN]).size, 1);
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
  assert.true(done, '.return #throw');
  const array = [];
  done = false;
  // eslint-disable-next-line es/no-nonstandard-array-prototype-properties -- legacy FF case
  array['@@iterator'] = undefined;
  array[Symbol.iterator] = function () {
    done = true;
    return getIteratorMethod([]).call(this);
  };
  new Set(array);
  assert.true(done);
  const object = {};
  new Set().add(object);
  if (DESCRIPTORS) {
    const results = [];
    for (const key in object) results.push(key);
    assert.arrayEqual(results, []);
    assert.arrayEqual(keys(object), []);
  }
  assert.arrayEqual(getOwnPropertyNames(object), []);
  if (getOwnPropertySymbols) assert.arrayEqual(getOwnPropertySymbols(object), []);
  if (ownKeys) assert.arrayEqual(ownKeys(object), []);
  if (nativeSubclass) {
    const Subclass = nativeSubclass(Set);
    assert.true(new Subclass() instanceof Subclass, 'correct subclassing with native classes #1');
    assert.true(new Subclass() instanceof Set, 'correct subclassing with native classes #2');
    assert.true(new Subclass().add(2).has(2), 'correct subclassing with native classes #3');
  }

  if (typeof ArrayBuffer == 'function') {
    const buffer = new ArrayBuffer(8);
    set = new Set([buffer]);
    assert.true(set.has(buffer), 'works with ArrayBuffer keys');
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
  assert.same(set.size, 5);
  const chain = set.add(NaN);
  assert.same(chain, set);
  assert.same(set.size, 5);
  set.add(2);
  assert.same(set.size, 5);
  set.add(array);
  assert.same(set.size, 5);
  set.add([]);
  assert.same(set.size, 6);
  set.add(4);
  assert.same(set.size, 7);
  const frozen = freeze({});
  set = new Set();
  set.add(frozen);
  assert.true(set.has(frozen));
});

QUnit.test('Set#clear', assert => {
  assert.isFunction(Set.prototype.clear);
  let set = new Set();
  set.clear();
  assert.same(set.size, 0);
  set = new Set();
  set.add(1);
  set.add(2);
  set.add(3);
  set.add(2);
  set.add(1);
  set.clear();
  assert.same(set.size, 0);
  assert.false(set.has(1));
  assert.false(set.has(2));
  assert.false(set.has(3));
  const frozen = freeze({});
  set = new Set();
  set.add(1);
  set.add(frozen);
  set.clear();
  assert.same(set.size, 0, 'Support frozen objects');
  assert.false(set.has(1));
  assert.false(set.has(frozen));
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
  assert.same(set.size, 5);
  assert.true(set.delete(NaN));
  assert.same(set.size, 4);
  assert.false(set.delete(4));
  assert.same(set.size, 4);
  set.delete([]);
  assert.same(set.size, 4);
  set.delete(array);
  assert.same(set.size, 3);
  const frozen = freeze({});
  set.add(frozen);
  assert.same(set.size, 4);
  set.delete(frozen);
  assert.same(set.size, 3);
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
  assert.same(count, 3);
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
  assert.same(result, '0124');
  set = new Set();
  set.add('0');
  result = '';
  set.forEach(it => {
    set.delete('0');
    if (result !== '') throw new Error();
    result += it;
  });
  assert.same(result, '0');
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
  assert.true(set.has(NaN));
  assert.true(set.has(array));
  assert.true(set.has(frozen));
  assert.true(set.has(2));
  assert.false(set.has(4));
  assert.false(set.has([]));
});

QUnit.test('Set#size', assert => {
  const set = new Set();
  set.add(1);
  const { size } = set;
  assert.same(typeof size, 'number', 'size is number');
  assert.same(size, 1, 'size is correct');
  if (DESCRIPTORS) {
    const sizeDescriptor = getOwnPropertyDescriptor(Set.prototype, 'size');
    const getter = sizeDescriptor && sizeDescriptor.get;
    const setter = sizeDescriptor && sizeDescriptor.set;
    assert.same(typeof getter, 'function', 'size is getter');
    assert.same(typeof setter, 'undefined', 'size is not setter');
    assert.throws(() => {
      Set.prototype.size;
    }, TypeError);
  }
});

QUnit.test('Set & -0', assert => {
  let set = new Set();
  set.add(-0);
  assert.same(set.size, 1);
  assert.true(set.has(0));
  assert.true(set.has(-0));
  set.forEach(it => {
    assert.false(is(it, -0));
  });
  set.delete(-0);
  assert.same(set.size, 0);
  set = new Set([-0]);
  set.forEach(key => {
    assert.false(is(key, -0));
  });
  set = new Set();
  set.add(4);
  set.add(3);
  set.add(2);
  set.add(1);
  set.add(0);
  assert.true(set.has(-0));
});

QUnit.test('Set#@@toStringTag', assert => {
  assert.same(Set.prototype[Symbol.toStringTag], 'Set', 'Set::@@toStringTag is `Set`');
  assert.same(String(new Set()), '[object Set]', 'correct stringification');
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
  assert.true(set.delete('a'));
  assert.true(set.delete('b'));
  assert.true(set.delete('c'));
  set.add('e');
  results.push(iterator.next().value, iterator.next().value);
  assert.true(iterator.next().done);
  set.add('f');
  assert.true(iterator.next().done);
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
  assert.same(iterator[Symbol.toStringTag], 'Set Iterator');
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
  assert.same(iterator[Symbol.toStringTag], 'Set Iterator');
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
  assert.same(iterator[Symbol.toStringTag], 'Set Iterator');
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
  assert.same(iterator[Symbol.toStringTag], 'Set Iterator');
  assert.same(String(iterator), '[object Set Iterator]');
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
