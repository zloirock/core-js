import { DESCRIPTORS } from '../helpers/constants';
import { createIterable } from '../helpers/helpers';

import Symbol from 'core-js-pure/features/symbol';
import getIteratorMethod from 'core-js-pure/features/get-iterator-method';
import from from 'core-js-pure/features/array/from';
import defineProperty from 'core-js-pure/features/object/define-property';

QUnit.test('Array.from', assert => {
  assert.isFunction(from);
  assert.arity(from, 1);
  let types = {
    'array-like': {
      length: '3',
      0: '1',
      1: '2',
      2: '3',
    },
    arguments: function () {
      return arguments;
    }('1', '2', '3'),
    array: ['1', '2', '3'],
    iterable: createIterable(['1', '2', '3']),
    string: '123',
  };
  for (const type in types) {
    const data = types[type];
    assert.arrayEqual(from(data), ['1', '2', '3'], `Works with ${ type }`);
    assert.arrayEqual(from(data, it => it ** 2), [1, 4, 9], `Works with ${ type } + mapFn`);
  }
  types = {
    'array-like': {
      length: 1,
      0: 1,
    },
    arguments: function () {
      return arguments;
    }(1),
    array: [1],
    iterable: createIterable([1]),
    string: '1',
  };
  for (const type in types) {
    const data = types[type];
    const context = {};
    assert.arrayEqual(from(data, function (value, key) {
      assert.same(this, context, `Works with ${ type }, correct callback context`);
      assert.same(value, type === 'string' ? '1' : 1, `Works with ${ type }, correct callback key`);
      assert.same(key, 0, `Works with ${ type }, correct callback value`);
      assert.same(arguments.length, 2, `Works with ${ type }, correct callback arguments number`);
      return 42;
    }, context), [42], `Works with ${ type }, correct result`);
  }
  const primitives = [false, true, 0];
  for (const primitive of primitives) {
    assert.arrayEqual(from(primitive), [], `Works with ${ primitive }`);
  }
  assert.throws(() => from(null), TypeError, 'Throws on null');
  assert.throws(() => from(undefined), TypeError, 'Throws on undefined');
  assert.arrayEqual(from('𠮷𠮷𠮷'), ['𠮷', '𠮷', '𠮷'], 'Uses correct string iterator');
  let done = true;
  from(createIterable([1, 2, 3], {
    return() {
      return done = false;
    },
  }), () => false);
  assert.ok(done, '.return #default');
  done = false;
  try {
    from(createIterable([1, 2, 3], {
      return() {
        return done = true;
      },
    }), () => {
      throw new Error();
    });
  } catch (e) { /* empty */ }
  assert.ok(done, '.return #throw');
  class C { /* empty */ }
  let instance = from.call(C, createIterable([1, 2]));
  assert.ok(instance instanceof C, 'generic, iterable case, instanceof');
  assert.arrayEqual(instance, [1, 2], 'generic, iterable case, elements');
  instance = from.call(C, {
    0: 1,
    1: 2,
    length: 2,
  });
  assert.ok(instance instanceof C, 'generic, array-like case, instanceof');
  assert.arrayEqual(instance, [1, 2], 'generic, array-like case, elements');
  let array = [1, 2, 3];
  done = false;
  array['@@iterator'] = undefined;
  array[Symbol.iterator] = function () {
    done = true;
    return getIteratorMethod([]).call(this);
  };
  assert.arrayEqual(from(array), [1, 2, 3], 'Array with custom iterator, elements');
  assert.ok(done, 'call @@iterator in Array with custom iterator');
  array = [1, 2, 3];
  delete array[1];
  assert.arrayEqual(from(array, String), ['1', 'undefined', '3'], 'Ignores holes');
  assert.notThrows(() => from({
    length: -1,
    0: 1,
  }, () => {
    throw new Error();
  }), 'Uses ToLength');
  assert.arrayEqual(from([], undefined), [], 'Works with undefined as asecond argument');
  assert.throws(() => from([], null), TypeError, 'Throws with null as second argument');
  assert.throws(() => from([], 0), TypeError, 'Throws with 0 as second argument');
  assert.throws(() => from([], ''), TypeError, 'Throws with "" as second argument');
  assert.throws(() => from([], false), TypeError, 'Throws with false as second argument');
  assert.throws(() => from([], {}), TypeError, 'Throws with {} as second argument');
  if (DESCRIPTORS) {
    let called = false;
    defineProperty(C.prototype, 0, {
      set() {
        called = true;
      },
    });
    from.call(C, [1, 2, 3]);
    assert.ok(!called, 'Should not call prototype accessors');
  }
});
