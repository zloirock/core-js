var test = QUnit.test;
var WeakSet = core.WeakSet;
var Symbol = core.Symbol;
var freeze = core.Object.freeze;
var keys = core.Object.keys;
var getOwnPropertyNames = core.Object.getOwnPropertyNames;
var getOwnPropertySymbols = core.Object.getOwnPropertySymbols;
var ownKeys = core.Reflect.ownKeys;

test('WeakSet', function (assert) {
  assert.isFunction(WeakSet);
  assert.ok('add' in WeakSet.prototype, 'add in WeakSet.prototype');
  assert.ok('delete' in WeakSet.prototype, 'delete in WeakSet.prototype');
  assert.ok('has' in WeakSet.prototype, 'has in WeakSet.prototype');
  assert.ok(new WeakSet() instanceof WeakSet, 'new WeakSet instanceof WeakSet');
  var object = {};
  assert.ok(new WeakSet(createIterable([object])).has(object), 'Init from iterable');
  var weakset = new WeakSet();
  var frozen = freeze({});
  weakset.add(frozen);
  assert.strictEqual(weakset.has(frozen), true, 'works with frozen objects, #1');
  weakset['delete'](frozen);
  assert.strictEqual(weakset.has(frozen), false, 'works with frozen objects, #2');
  var done = false;
  try {
    new WeakSet(createIterable([null, 1, 2], {
      'return': function () {
        return done = true;
      }
    }));
  } catch (e) { /* empty */ }
  assert.ok(done, '.return #throw');
  assert.ok(!('clear' in WeakSet.prototype), 'should not contains `.clear` method');
  var array = [];
  done = false;
  array['@@iterator'] = undefined;
  array[Symbol.iterator] = function () {
    done = true;
    return core.getIteratorMethod([]).call(this);
  };
  new WeakSet(array);
  assert.ok(done);
  object = {};
  new WeakSet().add(object);
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
    var Subclass = nativeSubclass(WeakSet);
    assert.ok(new Subclass() instanceof Subclass, 'correct subclassing with native classes #1');
    assert.ok(new Subclass() instanceof WeakSet, 'correct subclassing with native classes #2');
    object = {};
    assert.ok(new Subclass().add(object).has(object), 'correct subclassing with native classes #3');
  }
});

test('WeakSet#add', function (assert) {
  assert.isFunction(WeakSet.prototype.add);
  var weakset = new WeakSet();
  assert.ok(weakset.add({}) === weakset, 'chaining');
  assert.ok(function () {
    try {
      new WeakSet().add(42);
    } catch (e) {
      return true;
    }
  }(), 'throws with primitive keys');
});

test('WeakSet#delete', function (assert) {
  assert.isFunction(WeakSet.prototype['delete']);
  var a = {};
  var b = {};
  var weakset = new WeakSet().add(a).add(b);
  assert.ok(weakset.has(a) && weakset.has(b), 'WeakSet has values before .delete()');
  weakset['delete'](a);
  assert.ok(!weakset.has(a) && weakset.has(b), 'WeakSet has`nt value after .delete()');
  assert.ok(function () {
    try {
      return !weakset['delete'](1);
    } catch (e) { /* empty */ }
  }(), 'return false on primitive');
});

test('WeakSet#has', function (assert) {
  assert.isFunction(WeakSet.prototype.has);
  var weakset = new WeakSet();
  assert.ok(!weakset.has({}), 'WeakSet has`nt value');
  var object = {};
  weakset.add(object);
  assert.ok(weakset.has(object), 'WeakSet has value after .add()');
  weakset['delete'](object);
  assert.ok(!weakset.has(object), 'WeakSet hasn`t value after .delete()');
  assert.ok(function () {
    try {
      return !weakset.has(1);
    } catch (e) { /* empty */ }
  }(), 'return false on primitive');
});

test('WeakSet::@@toStringTag', function (assert) {
  assert.strictEqual(WeakSet.prototype[Symbol.toStringTag], 'WeakSet', 'WeakSet::@@toStringTag is `WeakSet`');
});
