import { GLOBAL, DESCRIPTORS, NATIVE } from '../helpers/constants';
import { is, createIterable, nativeSubclass } from '../helpers/helpers';

var Symbol = GLOBAL.Symbol || {};
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
var keys = Object.keys;
var getOwnPropertyNames = Object.getOwnPropertyNames;
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var ownKeys = (Reflect || {}).ownKeys;
var freeze = Object.freeze;
var from = Array.from;

QUnit.test('Set', function (assert) {
  assert.isFunction(Set);
  assert.name(Set, 'Set');
  assert.arity(Set, 0);
  assert.looksNative(Set);
  assert.ok('add' in Set.prototype, 'add in Set.prototype');
  assert.ok('clear' in Set.prototype, 'clear in Set.prototype');
  assert.ok('delete' in Set.prototype, 'delete in Set.prototype');
  assert.ok('forEach' in Set.prototype, 'forEach in Set.prototype');
  assert.ok('has' in Set.prototype, 'has in Set.prototype');
  assert.ok(new Set() instanceof Set, 'new Set instanceof Set');
  var set = new Set();
  set.add(1);
  set.add(2);
  set.add(3);
  set.add(2);
  set.add(1);
  assert.strictEqual(set.size, 3);
  var result = [];
  set.forEach(function (val) {
    result.push(val);
  });
  assert.deepEqual(result, [1, 2, 3]);
  assert.strictEqual(new Set(createIterable([1, 2, 3])).size, 3, 'Init from iterable');
  assert.strictEqual(new Set([freeze({}), 1]).size, 2, 'Support frozen objects');
  assert.strictEqual(new Set([NaN, NaN, NaN]).size, 1);
  assert.deepEqual(from(new Set([3, 4]).add(2).add(1)), [3, 4, 2, 1]);
  var done = false;
  var add = Set.prototype.add;
  Set.prototype.add = function () {
    throw new Error();
  };
  try {
    new Set(createIterable([null, 1, 2], {
      'return': function () {
        return done = true;
      }
    }));
  } catch (e) { /* empty */ }
  Set.prototype.add = add;
  assert.ok(done, '.return #throw');
  var array = [];
  done = false;
  array['@@iterator'] = undefined;
  array[Symbol.iterator] = function () {
    done = true;
    return [][Symbol.iterator].call(this);
  };
  new Set(array);
  assert.ok(done);
  var object = {};
  new Set().add(object);
  if (DESCRIPTORS) {
    var results = [];
    for (var key in results) keys.push(key);
    assert.arrayEqual(results, []);
    assert.arrayEqual(keys(object), []);
  }
  assert.arrayEqual(getOwnPropertyNames(object), []);
  if (getOwnPropertySymbols) assert.arrayEqual(getOwnPropertySymbols(object), []);
  if (ownKeys) assert.arrayEqual(ownKeys(object), []);
  if (nativeSubclass) {
    var Subclass = nativeSubclass(Set);
    assert.ok(new Subclass() instanceof Subclass, 'correct subclassing with native classes #1');
    assert.ok(new Subclass() instanceof Set, 'correct subclassing with native classes #2');
    assert.ok(new Subclass().add(2).has(2), 'correct subclassing with native classes #3');
  }
});

QUnit.test('Set#add', function (assert) {
  assert.isFunction(Set.prototype.add);
  assert.name(Set.prototype.add, 'add');
  assert.arity(Set.prototype.add, 1);
  assert.looksNative(Set.prototype.add);
  assert.nonEnumerable(Set.prototype, 'add');
  var array = [];
  var set = new Set();
  set.add(NaN);
  set.add(2);
  set.add(3);
  set.add(2);
  set.add(1);
  set.add(array);
  assert.strictEqual(set.size, 5);
  var chain = set.add(NaN);
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
  var frozen = freeze({});
  set = new Set();
  set.add(frozen);
  assert.ok(set.has(frozen));
});

QUnit.test('Set#clear', function (assert) {
  assert.isFunction(Set.prototype.clear);
  assert.name(Set.prototype.clear, 'clear');
  assert.arity(Set.prototype.clear, 0);
  assert.looksNative(Set.prototype.clear);
  assert.nonEnumerable(Set.prototype, 'clear');
  var set = new Set();
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
  var frozen = freeze({});
  set = new Set();
  set.add(1);
  set.add(frozen);
  set.clear();
  assert.strictEqual(set.size, 0, 'Support frozen objects');
  assert.ok(!set.has(1));
  assert.ok(!set.has(frozen));
});

QUnit.test('Set#delete', function (assert) {
  assert.isFunction(Set.prototype['delete']);
  if (NATIVE) assert.name(Set.prototype['delete'], 'delete');
  assert.arity(Set.prototype['delete'], 1);
  assert.looksNative(Set.prototype['delete']);
  assert.nonEnumerable(Set.prototype, 'delete');
  var array = [];
  var set = new Set();
  set.add(NaN);
  set.add(2);
  set.add(3);
  set.add(2);
  set.add(1);
  set.add(array);
  assert.strictEqual(set.size, 5);
  assert.strictEqual(set['delete'](NaN), true);
  assert.strictEqual(set.size, 4);
  assert.strictEqual(set['delete'](4), false);
  assert.strictEqual(set.size, 4);
  set['delete']([]);
  assert.strictEqual(set.size, 4);
  set['delete'](array);
  assert.strictEqual(set.size, 3);
  var frozen = freeze({});
  set.add(frozen);
  assert.strictEqual(set.size, 4);
  set['delete'](frozen);
  assert.strictEqual(set.size, 3);
});

QUnit.test('Set#forEach', function (assert) {
  assert.isFunction(Set.prototype.forEach);
  assert.name(Set.prototype.forEach, 'forEach');
  assert.arity(Set.prototype.forEach, 1);
  assert.looksNative(Set.prototype.forEach);
  assert.nonEnumerable(Set.prototype, 'forEach');
  var result = [];
  var count = 0;
  var set = new Set();
  set.add(1);
  set.add(2);
  set.add(3);
  set.add(2);
  set.add(1);
  set.forEach(function (value) {
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
  set.forEach(function (it) {
    result += it;
    if (it === '2') {
      set['delete']('2');
      set['delete']('3');
      set['delete']('1');
      set.add('4');
    }
  });
  assert.strictEqual(result, '0124');
  set = new Set();
  set.add('0');
  result = '';
  set.forEach(function (it) {
    set['delete']('0');
    if (result !== '') throw new Error();
    result += it;
  });
  assert.strictEqual(result, '0');
  assert['throws'](function () {
    Set.prototype.forEach.call(new Map(), function () { /* empty */ });
  }, 'non-generic');
});

QUnit.test('Set#has', function (assert) {
  assert.isFunction(Set.prototype.has);
  assert.name(Set.prototype.has, 'has');
  assert.arity(Set.prototype.has, 1);
  assert.looksNative(Set.prototype.has);
  assert.nonEnumerable(Set.prototype, 'has');
  var array = [];
  var frozen = freeze({});
  var set = new Set();
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

QUnit.test('Set#size', function (assert) {
  assert.nonEnumerable(Set.prototype, 'size');
  var set = new Set();
  set.add(1);
  var size = set.size;
  assert.strictEqual(typeof size, 'number', 'size is number');
  assert.strictEqual(size, 1, 'size is correct');
  if (DESCRIPTORS) {
    var sizeDescriptor = getOwnPropertyDescriptor(Set.prototype, 'size');
    assert.ok(sizeDescriptor && sizeDescriptor.get, 'size is getter');
    assert.ok(sizeDescriptor && !sizeDescriptor.set, 'size isnt setter');
    assert['throws'](function () {
      Set.prototype.size;
    }, TypeError);
  }
});

QUnit.test('Set & -0', function (assert) {
  var set = new Set();
  set.add(-0);
  assert.strictEqual(set.size, 1);
  assert.ok(set.has(0));
  assert.ok(set.has(-0));
  set.forEach(function (it) {
    assert.ok(!is(it, -0));
  });
  set['delete'](-0);
  assert.strictEqual(set.size, 0);
  set = new Set([-0]);
  set.forEach(function (key) {
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

QUnit.test('Set#@@toStringTag', function (assert) {
  assert.strictEqual(Set.prototype[Symbol.toStringTag], 'Set', 'Set::@@toStringTag is `Set`');
});

QUnit.test('Set Iterator', function (assert) {
  var set = new Set();
  set.add('a');
  set.add('b');
  set.add('c');
  set.add('d');
  var results = [];
  var iterator = set.keys();
  results.push(iterator.next().value);
  assert.ok(set['delete']('a'));
  assert.ok(set['delete']('b'));
  assert.ok(set['delete']('c'));
  set.add('e');
  results.push(iterator.next().value);
  results.push(iterator.next().value);
  assert.ok(iterator.next().done);
  set.add('f');
  assert.ok(iterator.next().done);
  assert.deepEqual(results, ['a', 'd', 'e']);
});

QUnit.test('Set#keys', function (assert) {
  assert.isFunction(Set.prototype.keys);
  assert.name(Set.prototype.keys, 'values');
  assert.arity(Set.prototype.keys, 0);
  assert.looksNative(Set.prototype.keys);
  assert.strictEqual(Set.prototype.keys, Set.prototype.values);
  assert.nonEnumerable(Set.prototype, 'keys');
  var set = new Set();
  set.add('q');
  set.add('w');
  set.add('e');
  var iterator = set.keys();
  assert.isIterator(iterator);
  assert.isIterable(iterator);
  assert.strictEqual(iterator[Symbol.toStringTag], 'Set Iterator');
  assert.deepEqual(iterator.next(), {
    value: 'q',
    done: false
  });
  assert.deepEqual(iterator.next(), {
    value: 'w',
    done: false
  });
  assert.deepEqual(iterator.next(), {
    value: 'e',
    done: false
  });
  assert.deepEqual(iterator.next(), {
    value: undefined,
    done: true
  });
});

QUnit.test('Set#values', function (assert) {
  assert.isFunction(Set.prototype.values);
  assert.name(Set.prototype.values, 'values');
  assert.arity(Set.prototype.values, 0);
  assert.looksNative(Set.prototype.values);
  assert.nonEnumerable(Set.prototype, 'values');
  var set = new Set();
  set.add('q');
  set.add('w');
  set.add('e');
  var iterator = set.values();
  assert.isIterator(iterator);
  assert.isIterable(iterator);
  assert.strictEqual(iterator[Symbol.toStringTag], 'Set Iterator');
  assert.deepEqual(iterator.next(), {
    value: 'q',
    done: false
  });
  assert.deepEqual(iterator.next(), {
    value: 'w',
    done: false
  });
  assert.deepEqual(iterator.next(), {
    value: 'e',
    done: false
  });
  assert.deepEqual(iterator.next(), {
    value: undefined,
    done: true
  });
});

QUnit.test('Set#entries', function (assert) {
  assert.isFunction(Set.prototype.entries);
  assert.name(Set.prototype.entries, 'entries');
  assert.arity(Set.prototype.entries, 0);
  assert.looksNative(Set.prototype.entries);
  assert.nonEnumerable(Set.prototype, 'entries');
  var set = new Set();
  set.add('q');
  set.add('w');
  set.add('e');
  var iterator = set.entries();
  assert.isIterator(iterator);
  assert.isIterable(iterator);
  assert.strictEqual(iterator[Symbol.toStringTag], 'Set Iterator');
  assert.deepEqual(iterator.next(), {
    value: ['q', 'q'],
    done: false
  });
  assert.deepEqual(iterator.next(), {
    value: ['w', 'w'],
    done: false
  });
  assert.deepEqual(iterator.next(), {
    value: ['e', 'e'],
    done: false
  });
  assert.deepEqual(iterator.next(), {
    value: undefined,
    done: true
  });
});

QUnit.test('Set#@@iterator', function (assert) {
  assert.isIterable(Set.prototype);
  assert.name(Set.prototype[Symbol.iterator], 'values');
  assert.arity(Set.prototype[Symbol.iterator], 0);
  assert.looksNative(Set.prototype[Symbol.iterator]);
  assert.strictEqual(Set.prototype[Symbol.iterator], Set.prototype.values);
  assert.nonEnumerable(Set.prototype, 'values');
  var set = new Set();
  set.add('q');
  set.add('w');
  set.add('e');
  var iterator = set[Symbol.iterator]();
  assert.isIterator(iterator);
  assert.isIterable(iterator);
  assert.strictEqual(iterator[Symbol.toStringTag], 'Set Iterator');
  assert.deepEqual(iterator.next(), {
    value: 'q',
    done: false
  });
  assert.deepEqual(iterator.next(), {
    value: 'w',
    done: false
  });
  assert.deepEqual(iterator.next(), {
    value: 'e',
    done: false
  });
  assert.deepEqual(iterator.next(), {
    value: undefined,
    done: true
  });
});
