var test = QUnit.test;

var Map = core.Map;
var Set = core.Set;
var Symbol = core.Symbol;
var getOwnPropertyDescriptor = core.Object.getOwnPropertyDescriptor;
var keys = core.Object.keys;
var getOwnPropertyNames = core.Object.getOwnPropertyNames;
var getOwnPropertySymbols = core.Object.getOwnPropertySymbols;
var ownKeys = core.Reflect.ownKeys;
var freeze = core.Object.freeze;
var is = core.Object.is;

test('Map', function (assert) {
  assert.isFunction(Map);
  assert.ok('clear' in Map.prototype, 'clear in Map.prototype');
  assert.ok('delete' in Map.prototype, 'delete in Map.prototype');
  assert.ok('forEach' in Map.prototype, 'forEach in Map.prototype');
  assert.ok('get' in Map.prototype, 'get in Map.prototype');
  assert.ok('has' in Map.prototype, 'has in Map.prototype');
  assert.ok('set' in Map.prototype, 'set in Map.prototype');
  assert.ok(new Map() instanceof Map, 'new Map instanceof Map');
  assert.strictEqual(new Map(createIterable([[1, 1], [2, 2], [3, 3]])).size, 3, 'Init from iterable');
  assert.strictEqual(new Map([[freeze({}), 1], [2, 3]]).size, 2, 'Support frozen objects');
  var done = false;
  try {
    new Map(createIterable([null, 1, 2], {
      'return': function () {
        return done = true;
      }
    }));
  } catch (e) { /* empty */ }
  assert.ok(done, '.return #throw');
  var array = [];
  done = false;
  array['@@iterator'] = undefined;
  array[Symbol.iterator] = function () {
    done = true;
    return core.getIteratorMethod([]).call(this);
  };
  new Map(array);
  assert.ok(done);
  var object = {};
  new Map().set(object, 1);
  if (DESCRIPTORS) {
    var results = [];
    for (var key in object) results.push(key);
    assert.arrayEqual(results, []);
    assert.arrayEqual(keys(object), []);
  }
  assert.arrayEqual(getOwnPropertyNames(object), []);
  if (getOwnPropertySymbols) assert.arrayEqual(getOwnPropertySymbols(object), []);
  if (ownKeys) assert.arrayEqual(ownKeys(object), []);
  if (nativeSubclass) {
    var Subclass = nativeSubclass(Map);
    assert.ok(new Subclass() instanceof Subclass, 'correct subclassing with native classes #1');
    assert.ok(new Subclass() instanceof Map, 'correct subclassing with native classes #2');
    assert.strictEqual(new Subclass().set(1, 2).get(1), 2, 'correct subclassing with native classes #3');
  }
});

test('Map#clear', function (assert) {
  assert.isFunction(Map.prototype.clear);
  var map = new Map();
  map.clear();
  assert.strictEqual(map.size, 0);
  map = new Map().set(1, 2).set(2, 3).set(1, 4);
  map.clear();
  assert.strictEqual(map.size, 0);
  assert.ok(!map.has(1));
  assert.ok(!map.has(2));
  var frozen = freeze({});
  map = new Map().set(1, 2).set(frozen, 3);
  map.clear();
  assert.strictEqual(map.size, 0, 'Support frozen objects');
  assert.ok(!map.has(1));
  assert.ok(!map.has(frozen));
});

test('Map#delete', function (assert) {
  assert.isFunction(Map.prototype['delete']);
  var object = {};
  var map = new Map();
  map.set(NaN, 1);
  map.set(2, 1);
  map.set(3, 7);
  map.set(2, 5);
  map.set(1, 4);
  map.set(object, 9);
  assert.strictEqual(map.size, 5);
  assert.ok(map['delete'](NaN));
  assert.strictEqual(map.size, 4);
  assert.ok(!map['delete'](4));
  assert.strictEqual(map.size, 4);
  map['delete']([]);
  assert.strictEqual(map.size, 4);
  map['delete'](object);
  assert.strictEqual(map.size, 3);
  var frozen = freeze({});
  map.set(frozen, 42);
  assert.strictEqual(map.size, 4);
  map['delete'](frozen);
  assert.strictEqual(map.size, 3);
});

test('Map#forEach', function (assert) {
  assert.isFunction(Map.prototype.forEach);
  var result = {};
  var count = 0;
  var object = {};
  var map = new Map();
  map.set(NaN, 1);
  map.set(2, 1);
  map.set(3, 7);
  map.set(2, 5);
  map.set(1, 4);
  map.set(object, 9);
  map.forEach(function (value, key) {
    count++;
    result[value] = key;
  });
  assert.strictEqual(count, 5);
  assert.deepEqual(result, {
    1: NaN,
    7: 3,
    5: 2,
    4: 1,
    9: object
  });
  map = new Map();
  map.set('0', 9);
  map.set('1', 9);
  map.set('2', 9);
  map.set('3', 9);
  result = '';
  map.forEach(function (value, key) {
    result += key;
    if (key === '2') {
      map['delete']('2');
      map['delete']('3');
      map['delete']('1');
      map.set('4', 9);
    }
  });
  assert.strictEqual(result, '0124');
  map = new Map([['0', 1]]);
  result = '';
  map.forEach(function (it) {
    map['delete']('0');
    if (result !== '') throw new Error();
    result += it;
  });
  assert.strictEqual(result, '1');
  assert['throws'](function () {
    Map.prototype.forEach.call(new Set(), function () { /* empty */ });
  }, 'non-generic');
});

test('Map#get', function (assert) {
  assert.isFunction(Map.prototype.get);
  var object = {};
  var frozen = freeze({});
  var map = new Map();
  map.set(NaN, 1);
  map.set(2, 1);
  map.set(3, 1);
  map.set(2, 5);
  map.set(1, 4);
  map.set(frozen, 42);
  map.set(object, object);
  assert.strictEqual(map.get(NaN), 1);
  assert.strictEqual(map.get(4), undefined);
  assert.strictEqual(map.get({}), undefined);
  assert.strictEqual(map.get(object), object);
  assert.strictEqual(map.get(frozen), 42);
  assert.strictEqual(map.get(2), 5);
});

test('Map#has', function (assert) {
  assert.isFunction(Map.prototype.has);
  var object = {};
  var frozen = freeze({});
  var map = new Map();
  map.set(NaN, 1);
  map.set(2, 1);
  map.set(3, 1);
  map.set(2, 5);
  map.set(1, 4);
  map.set(frozen, 42);
  map.set(object, object);
  assert.ok(map.has(NaN));
  assert.ok(map.has(object));
  assert.ok(map.has(2));
  assert.ok(map.has(frozen));
  assert.ok(!map.has(4));
  assert.ok(!map.has({}));
});

test('Map#set', function (assert) {
  assert.isFunction(Map.prototype.set);
  var object = {};
  var map = new Map();
  map.set(NaN, 1);
  map.set(2, 1);
  map.set(3, 1);
  map.set(2, 5);
  map.set(1, 4);
  map.set(object, object);
  assert.ok(map.size === 5);
  var chain = map.set(7, 2);
  assert.strictEqual(chain, map);
  map.set(7, 2);
  assert.strictEqual(map.size, 6);
  assert.strictEqual(map.get(7), 2);
  assert.strictEqual(map.get(NaN), 1);
  map.set(NaN, 42);
  assert.strictEqual(map.size, 6);
  assert.strictEqual(map.get(NaN), 42);
  map.set({}, 11);
  assert.strictEqual(map.size, 7);
  assert.strictEqual(map.get(object), object);
  map.set(object, 27);
  assert.strictEqual(map.size, 7);
  assert.strictEqual(map.get(object), 27);
  map = new Map();
  map.set(NaN, 2);
  map.set(NaN, 3);
  map.set(NaN, 4);
  assert.strictEqual(map.size, 1);
  var frozen = freeze({});
  map = new Map().set(frozen, 42);
  assert.strictEqual(map.get(frozen), 42);
});

test('Map#size', function (assert) {
  var map = new Map();
  map.set(2, 1);
  var size = map.size;
  assert.strictEqual(typeof size, 'number', 'size is number');
  assert.strictEqual(size, 1, 'size is correct');
  if (DESCRIPTORS) {
    var sizeDescriptor = getOwnPropertyDescriptor(Map.prototype, 'size');
    assert.ok(sizeDescriptor && sizeDescriptor.get, 'size is getter');
    assert.ok(sizeDescriptor && !sizeDescriptor.set, 'size isnt setter');
    assert['throws'](function () {
      Map.prototype.size;
    }, TypeError);
  }
});

test('Map & -0', function (assert) {
  var map = new Map();
  map.set(-0, 1);
  assert.strictEqual(map.size, 1);
  assert.ok(map.has(0));
  assert.ok(map.has(-0));
  assert.strictEqual(map.get(0), 1);
  assert.strictEqual(map.get(-0), 1);
  map.forEach(function (val, key) {
    assert.ok(!is(key, -0));
  });
  map['delete'](-0);
  assert.strictEqual(map.size, 0);
  map = new Map([[-0, 1]]);
  map.forEach(function (val, key) {
    assert.ok(!is(key, -0));
  });
  map = new Map();
  map.set(4, 4);
  map.set(3, 3);
  map.set(2, 2);
  map.set(1, 1);
  map.set(0, 0);
  assert.ok(map.has(-0));
});

test('Map#@@toStringTag', function (assert) {
  assert.strictEqual(Map.prototype[Symbol.toStringTag], 'Map', 'Map::@@toStringTag is `Map`');
});

test('Map Iterator', function (assert) {
  var map = new Map();
  map.set('a', 1);
  map.set('b', 2);
  map.set('c', 3);
  map.set('d', 4);
  var results = [];
  var iterator = map.keys();
  results.push(iterator.next().value);
  assert.ok(map['delete']('a'));
  assert.ok(map['delete']('b'));
  assert.ok(map['delete']('c'));
  map.set('e');
  results.push(iterator.next().value);
  results.push(iterator.next().value);
  assert.ok(iterator.next().done);
  map.set('f');
  assert.ok(iterator.next().done);
  assert.deepEqual(results, ['a', 'd', 'e']);
});

test('Map#keys', function (assert) {
  assert.isFunction(Map.prototype.keys);
  var map = new Map();
  map.set('a', 'q');
  map.set('s', 'w');
  map.set('d', 'e');
  var iterator = map.keys();
  assert.isIterator(iterator);
  assert.isIterable(iterator);
  assert.strictEqual(iterator[Symbol.toStringTag], 'Map Iterator');
  assert.deepEqual(iterator.next(), {
    value: 'a',
    done: false
  });
  assert.deepEqual(iterator.next(), {
    value: 's',
    done: false
  });
  assert.deepEqual(iterator.next(), {
    value: 'd',
    done: false
  });
  assert.deepEqual(iterator.next(), {
    value: undefined,
    done: true
  });
});

test('Map#values', function (assert) {
  assert.isFunction(Map.prototype.values);
  var map = new Map();
  map.set('a', 'q');
  map.set('s', 'w');
  map.set('d', 'e');
  var iterator = map.values();
  assert.isIterator(iterator);
  assert.isIterable(iterator);
  assert.strictEqual(iterator[Symbol.toStringTag], 'Map Iterator');
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

test('Map#entries', function (assert) {
  assert.isFunction(Map.prototype.entries);
  var map = new Map();
  map.set('a', 'q');
  map.set('s', 'w');
  map.set('d', 'e');
  var iterator = map.entries();
  assert.isIterator(iterator);
  assert.isIterable(iterator);
  assert.strictEqual(iterator[Symbol.toStringTag], 'Map Iterator');
  assert.deepEqual(iterator.next(), {
    value: ['a', 'q'],
    done: false
  });
  assert.deepEqual(iterator.next(), {
    value: ['s', 'w'],
    done: false
  });
  assert.deepEqual(iterator.next(), {
    value: ['d', 'e'],
    done: false
  });
  assert.deepEqual(iterator.next(), {
    value: undefined,
    done: true
  });
});

test('Map#@@iterator', function (assert) {
  var map = new Map();
  map.set('a', 'q');
  map.set('s', 'w');
  map.set('d', 'e');
  var iterator = core.getIterator(map);
  assert.isIterator(iterator);
  assert.isIterable(iterator);
  assert.strictEqual(iterator[Symbol.toStringTag], 'Map Iterator');
  assert.deepEqual(iterator.next(), {
    value: ['a', 'q'],
    done: false
  });
  assert.deepEqual(iterator.next(), {
    value: ['s', 'w'],
    done: false
  });
  assert.deepEqual(iterator.next(), {
    value: ['d', 'e'],
    done: false
  });
  assert.deepEqual(iterator.next(), {
    value: undefined,
    done: true
  });
});
