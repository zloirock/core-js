import { DESCRIPTORS, GLOBAL, NATIVE } from '../helpers/constants';
import { createIterable, nativeSubclass } from '../helpers/helpers';

const Symbol = GLOBAL.Symbol || {};
const { freeze, keys, getOwnPropertyNames, getOwnPropertySymbols } = Object;
const { ownKeys } = GLOBAL.Reflect || {};

QUnit.test('WeakSet', assert => {
  assert.isFunction(WeakSet);
  assert.name(WeakSet, 'WeakSet');
  assert.arity(WeakSet, 0);
  assert.looksNative(WeakSet);
  assert.ok('add' in WeakSet.prototype, 'add in WeakSet.prototype');
  assert.ok('delete' in WeakSet.prototype, 'delete in WeakSet.prototype');
  assert.ok('has' in WeakSet.prototype, 'has in WeakSet.prototype');
  assert.ok(new WeakSet() instanceof WeakSet, 'new WeakSet instanceof WeakSet');
  let object = {};
  assert.ok(new WeakSet(createIterable([object])).has(object), 'Init from iterable');
  const weakset = new WeakSet();
  const frozen = freeze({});
  weakset.add(frozen);
  assert.strictEqual(weakset.has(frozen), true, 'works with frozen objects, #1');
  weakset.delete(frozen);
  assert.strictEqual(weakset.has(frozen), false, 'works with frozen objects, #2');
  let done = false;
  try {
    new WeakSet(createIterable([null, 1, 2], {
      return() {
        return done = true;
      },
    }));
  } catch (e) { /* empty */ }
  assert.ok(done, '.return #throw');
  assert.ok(!('clear' in WeakSet.prototype), 'should not contains `.clear` method');
  const array = [];
  done = false;
  array['@@iterator'] = undefined;
  array[Symbol.iterator] = function () {
    done = true;
    return [][Symbol.iterator].call(this);
  };
  new WeakSet(array);
  assert.ok(done);
  object = {};
  new WeakSet().add(object);
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
    const Subclass = nativeSubclass(WeakSet);
    assert.ok(new Subclass() instanceof Subclass, 'correct subclassing with native classes #1');
    assert.ok(new Subclass() instanceof WeakSet, 'correct subclassing with native classes #2');
    object = {};
    assert.ok(new Subclass().add(object).has(object), 'correct subclassing with native classes #3');
  }
});

QUnit.test('WeakSet#add', assert => {
  assert.isFunction(WeakSet.prototype.add);
  assert.name(WeakSet.prototype.add, 'add');
  assert.arity(WeakSet.prototype.add, 1);
  assert.looksNative(WeakSet.prototype.add);
  assert.nonEnumerable(WeakSet.prototype, 'add');
  const weakset = new WeakSet();
  assert.ok(weakset.add({}) === weakset, 'chaining');
  assert.ok((() => {
    try {
      new WeakSet().add(42);
    } catch (e) {
      return true;
    }
  })(), 'throws with primitive keys');
});

QUnit.test('WeakSet#delete', assert => {
  assert.isFunction(WeakSet.prototype.delete);
  if (NATIVE) assert.arity(WeakSet.prototype.delete, 1);
  assert.looksNative(WeakSet.prototype.delete);
  assert.nonEnumerable(WeakSet.prototype, 'delete');
  const a = {};
  const b = {};
  const weakset = new WeakSet().add(a).add(b);
  assert.ok(weakset.has(a) && weakset.has(b), 'WeakSet has values before .delete()');
  weakset.delete(a);
  assert.ok(!weakset.has(a) && weakset.has(b), 'WeakSet has`nt value after .delete()');
  assert.ok((() => {
    try {
      return !weakset.delete(1);
    } catch (e) { /* empty */ }
  })(), 'return false on primitive');
});

QUnit.test('WeakSet#has', assert => {
  assert.isFunction(WeakSet.prototype.has);
  assert.name(WeakSet.prototype.has, 'has');
  assert.arity(WeakSet.prototype.has, 1);
  assert.looksNative(WeakSet.prototype.has);
  assert.nonEnumerable(WeakSet.prototype, 'has');
  const weakset = new WeakSet();
  assert.ok(!weakset.has({}), 'WeakSet has`nt value');
  const object = {};
  weakset.add(object);
  assert.ok(weakset.has(object), 'WeakSet has value after .add()');
  weakset.delete(object);
  assert.ok(!weakset.has(object), 'WeakSet hasn`t value after .delete()');
  assert.ok((() => {
    try {
      return !weakset.has(1);
    } catch (e) { /* empty */ }
  })(), 'return false on primitive');
});

QUnit.test('WeakSet::@@toStringTag', assert => {
  assert.strictEqual(WeakSet.prototype[Symbol.toStringTag], 'WeakSet', 'WeakSet::@@toStringTag is `WeakSet`');
});
