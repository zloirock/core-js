import { FREEZING, GLOBAL, NATIVE } from '../helpers/constants.js';
import { createIterable, nativeSubclass } from '../helpers/helpers.js';

const Symbol = GLOBAL.Symbol || {};
const { freeze, isFrozen, keys, getOwnPropertyNames, getOwnPropertySymbols } = Object;
const { ownKeys } = GLOBAL.Reflect || {};

QUnit.test('WeakMap', assert => {
  assert.isFunction(WeakMap);
  assert.name(WeakMap, 'WeakMap');
  assert.arity(WeakMap, 0);
  assert.looksNative(WeakMap);
  assert.true('delete' in WeakMap.prototype, 'delete in WeakMap.prototype');
  assert.true('get' in WeakMap.prototype, 'get in WeakMap.prototype');
  assert.true('has' in WeakMap.prototype, 'has in WeakMap.prototype');
  assert.true('set' in WeakMap.prototype, 'set in WeakMap.prototype');
  assert.true(new WeakMap() instanceof WeakMap, 'new WeakMap instanceof WeakMap');
  let object = {};
  assert.same(new WeakMap(createIterable([[object, 42]])).get(object), 42, 'Init from iterable');
  let weakmap = new WeakMap();
  const frozen = freeze({});
  weakmap.set(frozen, 42);
  assert.same(weakmap.get(frozen), 42, 'Support frozen objects');
  weakmap = new WeakMap();
  weakmap.set(frozen, 42);
  assert.true(weakmap.has(frozen), 'works with frozen objects, #1');
  assert.same(weakmap.get(frozen), 42, 'works with frozen objects, #2');
  weakmap.delete(frozen);
  assert.false(weakmap.has(frozen), 'works with frozen objects, #3');
  assert.same(weakmap.get(frozen), undefined, 'works with frozen objects, #4');
  let done = false;
  try {
    new WeakMap(createIterable([null, 1, 2], {
      return() {
        return done = true;
      },
    }));
  } catch { /* empty */ }
  assert.true(done, '.return #throw');
  assert.false('clear' in WeakMap.prototype, 'should not contains `.clear` method');
  const array = [];
  done = false;
  // eslint-disable-next-line es/no-nonstandard-array-prototype-properties -- legacy FF case
  array['@@iterator'] = undefined;
  array[Symbol.iterator] = function () {
    done = true;
    return [][Symbol.iterator].call(this);
  };
  new WeakMap(array);
  assert.true(done);
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
    assert.true(new Subclass() instanceof Subclass, 'correct subclassing with native classes #1');
    assert.true(new Subclass() instanceof WeakMap, 'correct subclassing with native classes #2');
    object = {};
    assert.same(new Subclass().set(object, 2).get(object), 2, 'correct subclassing with native classes #3');
  }

  const buffer = new ArrayBuffer(8);
  const map = new WeakMap([[buffer, 8]]);
  assert.true(map.has(buffer), 'works with ArrayBuffer keys');
});

QUnit.test('WeakMap#delete', assert => {
  assert.isFunction(WeakMap.prototype.delete);
  if (NATIVE) assert.name(WeakMap.prototype.delete, 'delete');
  if (NATIVE) assert.arity(WeakMap.prototype.delete, 1);
  assert.looksNative(WeakMap.prototype.delete);
  assert.nonEnumerable(WeakMap.prototype, 'delete');
  const a = {};
  const b = {};
  const weakmap = new WeakMap();
  weakmap.set(a, 42);
  weakmap.set(b, 21);
  assert.true(weakmap.has(a), 'WeakMap has values before .delete() #1');
  assert.true(weakmap.has(b), 'WeakMap has values before .delete() #2');
  weakmap.delete(a);
  assert.false(weakmap.has(a), 'WeakMap has not value after .delete() #1');
  assert.true(weakmap.has(b), 'WeakMap still has value after .delete() #2');
  assert.notThrows(() => !weakmap.delete(1), 'return false on primitive');
  const object = {};
  weakmap.set(object, 42);
  freeze(object);
  assert.true(weakmap.has(object), 'works with frozen objects #1');
  weakmap.delete(object);
  assert.false(weakmap.has(object), 'works with frozen objects #2');
});

QUnit.test('WeakMap#get', assert => {
  assert.isFunction(WeakMap.prototype.get);
  assert.name(WeakMap.prototype.get, 'get');
  if (NATIVE) assert.arity(WeakMap.prototype.get, 1);
  assert.looksNative(WeakMap.prototype.get);
  assert.nonEnumerable(WeakMap.prototype, 'get');
  const weakmap = new WeakMap();
  assert.same(weakmap.get({}), undefined, 'WeakMap .get() before .set() return undefined');
  let object = {};
  weakmap.set(object, 42);
  assert.same(weakmap.get(object), 42, 'WeakMap .get() return value');
  weakmap.delete(object);
  assert.same(weakmap.get(object), undefined, 'WeakMap .get() after .delete() return undefined');
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
  assert.name(WeakMap.prototype.has, 'has');
  if (NATIVE) assert.arity(WeakMap.prototype.has, 1);
  assert.looksNative(WeakMap.prototype.has);
  assert.nonEnumerable(WeakMap.prototype, 'has');
  const weakmap = new WeakMap();
  assert.false(weakmap.has({}), 'WeakMap .has() before .set() return false');
  let object = {};
  weakmap.set(object, 42);
  assert.true(weakmap.has(object), 'WeakMap .has() return true');
  weakmap.delete(object);
  assert.false(weakmap.has(object), 'WeakMap .has() after .delete() return false');
  assert.notThrows(() => !weakmap.has(1), 'return false on primitive');
  object = {};
  weakmap.set(object, 42);
  freeze(object);
  assert.true(weakmap.has(object), 'works with frozen objects #1');
  weakmap.delete(object);
  assert.false(weakmap.has(object), 'works with frozen objects #2');
});

QUnit.test('WeakMap#set', assert => {
  assert.isFunction(WeakMap.prototype.set);
  assert.name(WeakMap.prototype.set, 'set');
  assert.arity(WeakMap.prototype.set, 2);
  assert.looksNative(WeakMap.prototype.set);
  assert.nonEnumerable(WeakMap.prototype, 'set');
  const weakmap = new WeakMap();
  const object = {};
  weakmap.set(object, 33);
  assert.same(weakmap.get(object), 33, 'works with object as keys');
  assert.same(weakmap.set({}, 42), weakmap, 'chaining');
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
  const array = freeze([]);
  weakmap.set(array, 42);
  assert.same(weakmap.get(array), 42, 'works with frozen arrays #1');
  if (FREEZING) assert.true(isFrozen(array), 'works with frozen arrays #2');
});

QUnit.test('WeakMap#@@toStringTag', assert => {
  assert.same(WeakMap.prototype[Symbol.toStringTag], 'WeakMap', 'WeakMap::@@toStringTag is `WeakMap`');
  assert.same(String(new WeakMap()), '[object WeakMap]', 'correct stringification');
});
