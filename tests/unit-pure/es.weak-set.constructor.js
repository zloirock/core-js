import { createIterable, nativeSubclass } from '../helpers/helpers.js';

import getIteratorMethod from '@core-js/pure/es/get-iterator-method';
import freeze from '@core-js/pure/es/object/freeze';
import getOwnPropertyNames from '@core-js/pure/es/object/get-own-property-names';
import getOwnPropertySymbols from '@core-js/pure/es/object/get-own-property-symbols';
import keys from '@core-js/pure/es/object/keys';
import ownKeys from '@core-js/pure/es/reflect/own-keys';
import Symbol from '@core-js/pure/es/symbol';
import WeakSet from '@core-js/pure/es/weak-set';

QUnit.test('WeakSet', assert => {
  assert.isFunction(WeakSet);
  assert.true('add' in WeakSet.prototype, 'add in WeakSet.prototype');
  assert.true('delete' in WeakSet.prototype, 'delete in WeakSet.prototype');
  assert.true('has' in WeakSet.prototype, 'has in WeakSet.prototype');
  assert.true(new WeakSet() instanceof WeakSet, 'new WeakSet instanceof WeakSet');
  let object = {};
  assert.true(new WeakSet(createIterable([object])).has(object), 'Init from iterable');
  const weakset = new WeakSet();
  const frozen = freeze({});
  weakset.add(frozen);
  assert.true(weakset.has(frozen), 'works with frozen objects, #1');
  weakset.delete(frozen);
  assert.false(weakset.has(frozen), 'works with frozen objects, #2');
  let done = false;
  try {
    new WeakSet(createIterable([null, 1, 2], {
      return() {
        return done = true;
      },
    }));
  } catch { /* empty */ }
  assert.true(done, '.return #throw');
  assert.false('clear' in WeakSet.prototype, 'should not contains `.clear` method');
  const array = [];
  done = false;
  array[Symbol.iterator] = function () {
    done = true;
    return getIteratorMethod([]).call(this);
  };
  new WeakSet(array);
  assert.true(done);
  object = {};
  new WeakSet().add(object);

  const results = [];
  for (const key in object) results.push(key);
  assert.arrayEqual(results, []);
  assert.arrayEqual(keys(object), []);

  assert.arrayEqual(getOwnPropertyNames(object), []);
  if (getOwnPropertySymbols) assert.arrayEqual(getOwnPropertySymbols(object), []);
  if (ownKeys) assert.arrayEqual(ownKeys(object), []);
  if (nativeSubclass) {
    const Subclass = nativeSubclass(WeakSet);
    assert.true(new Subclass() instanceof Subclass, 'correct subclassing with native classes #1');
    assert.true(new Subclass() instanceof WeakSet, 'correct subclassing with native classes #2');
    object = {};
    assert.true(new Subclass().add(object).has(object), 'correct subclassing with native classes #3');
  }

  if (typeof ArrayBuffer == 'function') {
    const buffer = new ArrayBuffer(8);
    const set = new WeakSet([buffer]);
    assert.true(set.has(buffer), 'works with ArrayBuffer keys');
  }
});

QUnit.test('WeakSet#add', assert => {
  assert.isFunction(WeakSet.prototype.add);
  const weakset = new WeakSet();
  assert.same(weakset.add({}), weakset, 'chaining');
  assert.throws(() => new WeakSet().add(42), 'throws with primitive keys');
});

QUnit.test('WeakSet#delete', assert => {
  assert.isFunction(WeakSet.prototype.delete);
  const a = {};
  const b = {};
  const weakset = new WeakSet().add(a).add(b);
  assert.true(weakset.has(a), 'WeakSet has values before .delete() #1');
  assert.true(weakset.has(b), 'WeakSet has values before .delete() #2');
  weakset.delete(a);
  assert.false(weakset.has(a), 'WeakSet has not value after .delete() #1');
  assert.true(weakset.has(b), 'WeakSet still has value after .delete() #2');
  assert.notThrows(() => !weakset.delete(1), 'return false on primitive');
});

QUnit.test('WeakSet#has', assert => {
  assert.isFunction(WeakSet.prototype.has);
  const weakset = new WeakSet();
  assert.false(weakset.has({}), 'WeakSet has`nt value');
  const object = {};
  weakset.add(object);
  assert.true(weakset.has(object), 'WeakSet has value after .add()');
  weakset.delete(object);
  assert.false(weakset.has(object), 'WeakSet has not value after .delete()');
  assert.notThrows(() => !weakset.has(1), 'return false on primitive');
});

QUnit.test('WeakSet#@@toStringTag', assert => {
  assert.same(WeakSet.prototype[Symbol.toStringTag], 'WeakSet', 'WeakSet#@@toStringTag is `WeakSet`');
  assert.same(String(new WeakSet()), '[object WeakSet]', 'correct stringification');
});
