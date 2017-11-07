var test = QUnit.test;

var Symbol = global.Symbol || {};
var freeze = Object.freeze;
var keys = Object.keys;
var getOwnPropertyNames = Object.getOwnPropertyNames;
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var ownKeys = (global.Reflect || {}).ownKeys;

test('WeakMap', function (assert) {
  assert.isFunction(WeakMap);
  assert.name(WeakMap, 'WeakMap');
  assert.arity(WeakMap, 0);
  assert.looksNative(WeakMap);
  assert.ok('delete' in WeakMap.prototype, 'delete in WeakMap.prototype');
  assert.ok('get' in WeakMap.prototype, 'get in WeakMap.prototype');
  assert.ok('has' in WeakMap.prototype, 'has in WeakMap.prototype');
  assert.ok('set' in WeakMap.prototype, 'set in WeakMap.prototype');
  assert.ok(new WeakMap() instanceof WeakMap, 'new WeakMap instanceof WeakMap');
  var object = {};
  assert.strictEqual(new WeakMap(createIterable([[object, 42]])).get(object), 42, 'Init from iterable');
  var weakmap = new WeakMap();
  var frozen = freeze({});
  weakmap.set(frozen, 42);
  assert.strictEqual(weakmap.get(frozen), 42, 'Support frozen objects');
  var weakmap = new WeakMap();
  weakmap.set(frozen, 42);
  assert.strictEqual(weakmap.has(frozen), true, 'works with frozen objects, #1');
  assert.strictEqual(weakmap.get(frozen), 42, 'works with frozen objects, #2');
  weakmap['delete'](frozen);
  assert.strictEqual(weakmap.has(frozen), false, 'works with frozen objects, #3');
  assert.strictEqual(weakmap.get(frozen), undefined, 'works with frozen objects, #4');
  var done = false;
  try {
    new WeakMap(createIterable([null, 1, 2], {
      'return': function () {
        return done = true;
      }
    }));
  } catch (e) { /* empty */ }
  assert.ok(done, '.return #throw');
  assert.ok(!('clear' in WeakMap.prototype), 'should not contains `.clear` method');
  var array = [];
  done = false;
  array['@@iterator'] = undefined;
  array[Symbol.iterator] = function () {
    done = true;
    return [][Symbol.iterator].call(this);
  };
  new WeakMap(array);
  assert.ok(done);
  object = {};
  new WeakMap().set(object, 1);
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
    var Subclass = nativeSubclass(WeakMap);
    assert.ok(new Subclass() instanceof Subclass, 'correct subclassing with native classes #1');
    assert.ok(new Subclass() instanceof WeakMap, 'correct subclassing with native classes #2');
    object = {};
    assert.same(new Subclass().set(object, 2).get(object), 2, 'correct subclassing with native classes #3');
  }
});

test('WeakMap#delete', function (assert) {
  assert.isFunction(WeakMap.prototype['delete']);
  if (NATIVE) assert.name(WeakMap.prototype['delete'], 'delete');
  if (NATIVE) assert.arity(WeakMap.prototype['delete'], 1);
  assert.looksNative(WeakMap.prototype['delete']);
  assert.nonEnumerable(WeakMap.prototype, 'delete');
  var a = {};
  var b = {};
  var weakmap = new WeakMap();
  weakmap.set(a, 42);
  weakmap.set(b, 21);
  assert.ok(weakmap.has(a) && weakmap.has(b), 'WeakMap has values before .delete()');
  weakmap['delete'](a);
  assert.ok(!weakmap.has(a) && weakmap.has(b), 'WeakMap hasn`t value after .delete()');
  assert.ok(function () {
    try {
      return !weakmap['delete'](1);
    } catch (e) { /* empty */ }
  }(), 'return false on primitive');
});

test('WeakMap#get', function (assert) {
  assert.isFunction(WeakMap.prototype.get);
  assert.name(WeakMap.prototype.get, 'get');
  if (NATIVE) assert.arity(WeakMap.prototype.get, 1);
  assert.looksNative(WeakMap.prototype.get);
  assert.nonEnumerable(WeakMap.prototype, 'get');
  var weakmap = new WeakMap();
  assert.strictEqual(weakmap.get({}), undefined, 'WeakMap .get() before .set() return undefined');
  var object = {};
  weakmap.set(object, 42);
  assert.strictEqual(weakmap.get(object), 42, 'WeakMap .get() return value');
  weakmap['delete'](object);
  assert.strictEqual(weakmap.get(object), undefined, 'WeakMap .get() after .delete() return undefined');
  assert.ok(function () {
    try {
      return weakmap.get(1) === undefined;
    } catch (e) { /* empty */ }
  }(), 'return undefined on primitive');
});

test('WeakMap#has', function (assert) {
  assert.isFunction(WeakMap.prototype.has);
  assert.name(WeakMap.prototype.has, 'has');
  if (NATIVE) assert.arity(WeakMap.prototype.has, 1);
  assert.looksNative(WeakMap.prototype.has);
  assert.nonEnumerable(WeakMap.prototype, 'has');
  var weakmap = new WeakMap();
  assert.ok(!weakmap.has({}), 'WeakMap .has() before .set() return false');
  var object = {};
  weakmap.set(object, 42);
  assert.ok(weakmap.has(object), 'WeakMap .has() return true');
  weakmap['delete'](object);
  assert.ok(!weakmap.has(object), 'WeakMap .has() after .delete() return false');
  assert.ok(function () {
    try {
      return !weakmap.has(1);
    } catch (e) { /* empty */ }
  }(), 'return false on primitive');
});

test('WeakMap#set', function (assert) {
  assert.isFunction(WeakMap.prototype.set);
  assert.name(WeakMap.prototype.set, 'set');
  assert.arity(WeakMap.prototype.set, 2);
  assert.looksNative(WeakMap.prototype.set);
  assert.nonEnumerable(WeakMap.prototype, 'set');
  var weakmap = new WeakMap();
  var object = {};
  weakmap.set(object, 33);
  assert.same(weakmap.get(object), 33, 'works with object as keys');
  assert.ok(weakmap.set({}, 42) === weakmap, 'chaining');
  assert.ok(function () {
    try {
      new WeakMap().set(42, 42);
    } catch (e) {
      return true;
    }
  }(), 'throws with primitive keys');
});

test('WeakMap#@@toStringTag', function (assert) {
  assert.strictEqual(WeakMap.prototype[Symbol.toStringTag], 'WeakMap', 'WeakMap::@@toStringTag is `WeakMap`');
});
