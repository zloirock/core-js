import { createIterable, nativeSubclass } from '../helpers/helpers';

import { Symbol, WeakMap } from 'core-js-pure';
import getIteratorMethod from 'core-js-pure/features/get-iterator-method';
import { freeze, keys, getOwnPropertyNames, getOwnPropertySymbols } from 'core-js-pure/features/object';
import ownKeys from 'core-js-pure/features/reflect/own-keys';

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
  } catch { /* empty */ }
  assert.ok(done, '.return #throw');
  assert.ok(!('clear' in WeakMap.prototype), 'should not contains `.clear` method');
  const array = [];
  done = false;
  array['@@iterator'] = undefined;
  array[Symbol.iterator] = function () {
    done = true;
    return getIteratorMethod([]).call(this);
  };
  new WeakMap(array);
  assert.ok(done);
  object = {};
  new WeakMap().set(object, 1);
  const results = [];
  for (const key in object) results.push(key);
  assert.arrayEqual(results, []);
  assert.arrayEqual(keys(object), []);
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
  assert.notThrows(() => !weakmap.delete(1), 'return false on primitive');
  const object = {};
  weakmap.set(object, 42);
  freeze(object);
  assert.ok(weakmap.has(object), 'works with frozen objects #1');
  weakmap.delete(object);
  assert.ok(!weakmap.has(object), 'works with frozen objects #2');
});

QUnit.test('WeakMap#get', assert => {
  assert.isFunction(WeakMap.prototype.get);
  const weakmap = new WeakMap();
  assert.strictEqual(weakmap.get({}), undefined, 'WeakMap .get() before .set() return undefined');
  let object = {};
  weakmap.set(object, 42);
  assert.strictEqual(weakmap.get(object), 42, 'WeakMap .get() return value');
  weakmap.delete(object);
  assert.strictEqual(weakmap.get(object), undefined, 'WeakMap .get() after .delete() return undefined');
  assert.notThrows(() => weakmap.get(1) === undefined, 'return undefined on primitive');
  object = {};
  weakmap.set(object, 42);
  freeze(object);
  assert.same(weakmap.get(object), 42, 'works with frozen objects #1');
  weakmap.delete(object);
  assert.same(weakmap.get(object), undefined, 'works with frozen objects #2');
});

QUnit.test('WeakMap#has', assert => {
  assert.isFunction(WeakMap.prototype.has);
  const weakmap = new WeakMap();
  assert.ok(!weakmap.has({}), 'WeakMap .has() before .set() return false');
  let object = {};
  weakmap.set(object, 42);
  assert.ok(weakmap.has(object), 'WeakMap .has() return true');
  weakmap.delete(object);
  assert.ok(!weakmap.has(object), 'WeakMap .has() after .delete() return false');
  assert.notThrows(() => !weakmap.has(1), 'return false on primitive');
  object = {};
  weakmap.set(object, 42);
  freeze(object);
  assert.ok(weakmap.has(object), 'works with frozen objects #1');
  weakmap.delete(object);
  assert.ok(!weakmap.has(object), 'works with frozen objects #2');
});

QUnit.test('WeakMap#set', assert => {
  assert.isFunction(WeakMap.prototype.set);
  const weakmap = new WeakMap();
  const object = {};
  weakmap.set(object, 33);
  assert.same(weakmap.get(object), 33, 'works with object as keys');
  assert.ok(weakmap.set({}, 42) === weakmap, 'chaining');
  assert.throws(() => new WeakMap().set(42, 42), 'throws with primitive keys');
  const object1 = freeze({});
  const object2 = {};
  weakmap.set(object1, 42);
  weakmap.set(object2, 42);
  freeze(object);
  assert.same(weakmap.get(object1), 42, 'works with frozen objects #1');
  assert.same(weakmap.get(object2), 42, 'works with frozen objects #2');
  weakmap.delete(object1);
  weakmap.delete(object2);
  assert.same(weakmap.get(object1), undefined, 'works with frozen objects #3');
  assert.same(weakmap.get(object2), undefined, 'works with frozen objects #4');
});

QUnit.test('WeakMap#@@toStringTag', assert => {
  assert.strictEqual(WeakMap.prototype[Symbol.toStringTag], 'WeakMap', 'WeakMap::@@toStringTag is `WeakMap`');
  assert.strictEqual(String(new WeakMap()), '[object WeakMap]', 'correct stringification');
});
