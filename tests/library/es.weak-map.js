import { createIterable, nativeSubclass } from '../helpers/helpers';
import { DESCRIPTORS } from '../helpers/constants';

const { WeakMap, Symbol } = core;
const { freeze, keys, getOwnPropertyNames, getOwnPropertySymbols } = core.Object;
const { ownKeys } = core.Reflect;

QUnit.test('WeakMap', assert => {
  assert.isFunction(WeakMap);
  assert.ok('delete' in WeakMap.prototype, 'delete in WeakMap.prototype');
  assert.ok('get' in WeakMap.prototype, 'get in WeakMap.prototype');
  assert.ok('has' in WeakMap.prototype, 'has in WeakMap.prototype');
  assert.ok('set' in WeakMap.prototype, 'set in WeakMap.prototype');
  assert.ok(new WeakMap() instanceof WeakMap, 'new WeakMap instanceof WeakMap');
  let object = {};
  assert.strictEqual(new WeakMap(createIterable([[object, 42]])).get(object), 42, 'Init from iterable');
  let weakmap = new WeakMap();
  const frozen = freeze({});
  weakmap.set(frozen, 42);
  assert.strictEqual(weakmap.get(frozen), 42, 'Support frozen objects');
  weakmap = new WeakMap();
  weakmap.set(frozen, 42);
  assert.strictEqual(weakmap.has(frozen), true, 'works with frozen objects, #1');
  assert.strictEqual(weakmap.get(frozen), 42, 'works with frozen objects, #2');
  weakmap.delete(frozen);
  assert.strictEqual(weakmap.has(frozen), false, 'works with frozen objects, #3');
  assert.strictEqual(weakmap.get(frozen), undefined, 'works with frozen objects, #4');
  let done = false;
  try {
    new WeakMap(createIterable([null, 1, 2], {
      return() {
        return done = true;
      },
    }));
  } catch (e) { /* empty */ }
  assert.ok(done, '.return #throw');
  assert.ok(!('clear' in WeakMap.prototype), 'should not contains `.clear` method');
  const array = [];
  done = false;
  array['@@iterator'] = undefined;
  array[Symbol.iterator] = function () {
    done = true;
    return core.getIteratorMethod([]).call(this);
  };
  new WeakMap(array);
  assert.ok(done);
  object = {};
  new WeakMap().set(object, 1);
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
    const Subclass = nativeSubclass(WeakMap);
    assert.ok(new Subclass() instanceof Subclass, 'correct subclassing with native classes #1');
    assert.ok(new Subclass() instanceof WeakMap, 'correct subclassing with native classes #2');
    object = {};
    assert.same(new Subclass().set(object, 2).get(object), 2, 'correct subclassing with native classes #3');
  }
});

QUnit.test('WeakMap#delete', assert => {
  assert.isFunction(WeakMap.prototype.delete);
  const a = {};
  const b = {};
  const weakmap = new WeakMap();
  weakmap.set(a, 42);
  weakmap.set(b, 21);
  assert.ok(weakmap.has(a) && weakmap.has(b), 'WeakMap has values before .delete()');
  weakmap.delete(a);
  assert.ok(!weakmap.has(a) && weakmap.has(b), 'WeakMap hasn`t value after .delete()');
  assert.ok((() => {
    try {
      return !weakmap.delete(1);
    } catch (e) { /* empty */ }
  })(), 'return false on primitive');
});

QUnit.test('WeakMap#get', assert => {
  assert.isFunction(WeakMap.prototype.get);
  const weakmap = new WeakMap();
  assert.strictEqual(weakmap.get({}), undefined, 'WeakMap .get() before .set() return undefined');
  const object = {};
  weakmap.set(object, 42);
  assert.strictEqual(weakmap.get(object), 42, 'WeakMap .get() return value');
  weakmap.delete(object);
  assert.strictEqual(weakmap.get(object), undefined, 'WeakMap .get() after .delete() return undefined');
  assert.ok((() => {
    try {
      return weakmap.get(1) === undefined;
    } catch (e) { /* empty */ }
  })(), 'return undefined on primitive');
});

QUnit.test('WeakMap#has', assert => {
  assert.isFunction(WeakMap.prototype.has);
  const weakmap = new WeakMap();
  assert.ok(!weakmap.has({}), 'WeakMap .has() before .set() return false');
  const object = {};
  weakmap.set(object, 42);
  assert.ok(weakmap.has(object), 'WeakMap .has() return true');
  weakmap.delete(object);
  assert.ok(!weakmap.has(object), 'WeakMap .has() after .delete() return false');
  assert.ok((() => {
    try {
      return !weakmap.has(1);
    } catch (e) { /* empty */ }
  })(), 'return false on primitive');
});

QUnit.test('WeakMap#set', assert => {
  assert.isFunction(WeakMap.prototype.set);
  const weakmap = new WeakMap();
  const object = {};
  weakmap.set(object, 33);
  assert.same(weakmap.get(object), 33, 'works with object as keys');
  assert.ok(weakmap.set({}, 42) === weakmap, 'chaining');
  assert.ok((() => {
    try {
      new WeakMap().set(42, 42);
    } catch (e) {
      return true;
    }
  })(), 'throws with primitive keys');
});

QUnit.test('WeakMap#@@toStringTag', assert => {
  assert.strictEqual(WeakMap.prototype[Symbol.toStringTag], 'WeakMap', 'WeakMap::@@toStringTag is `WeakMap`');
});
