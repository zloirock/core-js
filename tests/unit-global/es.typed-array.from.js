import { DESCRIPTORS, NATIVE, TYPED_ARRAYS_WITH_BIG_INT } from '../helpers/constants.js';
import { createIterable } from '../helpers/helpers.js';

if (DESCRIPTORS) QUnit.test('%TypedArray%.from', assert => {
  // we can't implement %TypedArray% in all engines, so run all tests for each typed array constructor
  for (const { name, TypedArray, $ } of TYPED_ARRAYS_WITH_BIG_INT) {
    assert.isFunction(TypedArray.from, `${ name }.from is function`);
    assert.arity(TypedArray.from, 1, `${ name }.from arity is 1`);
    assert.name(TypedArray.from, 'from', `${ name }.from name is 'from'`);
    assert.looksNative(TypedArray.from, `${ name }.from looks native`);
    let instance = TypedArray.from([$(1), $(2), $(3)]);
    assert.true(instance instanceof TypedArray, 'correct instance with array');
    assert.deepEqual(instance, new TypedArray([$(1), $(2), $(3)]), 'correct elements with array');
    instance = TypedArray.from({
      0: $(1),
      1: $(2),
      2: $(3),
      length: 3,
    });
    assert.true(instance instanceof TypedArray, 'correct instance with array-like');
    assert.deepEqual(instance, new TypedArray([$(1), $(2), $(3)]), 'correct elements with array-like');
    instance = TypedArray.from(createIterable([$(1), $(2), $(3)]));
    assert.true(instance instanceof TypedArray, 'correct instance with iterable');
    assert.deepEqual(instance, new TypedArray([$(1), $(2), $(3)]), 'correct elements with iterable');
    assert.deepEqual(TypedArray.from([1, 2, 3], it => String(it ** 2)), new TypedArray([$(1), $(4), $(9)]), 'accept callback');
    assert.deepEqual(TypedArray.from([{ valueOf() { return $(2); } }]), new TypedArray([$(2)]), 'passed array with object convertible to primitive');
    assert.deepEqual(TypedArray.from(createIterable([{ valueOf() { return $(2); } }])), new TypedArray([$(2)]), 'passed iterable with object convertible to primitive');
    const context = {};
    TypedArray.from([$(1)], function (value, key) {
      assert.same(arguments.length, 2, 'correct number of callback arguments');
      assert.same(value, $(1), 'correct value in callback');
      assert.same(key, 0, 'correct index in callback');
      assert.same(this, context, 'correct callback context');
      return $(1);
    }, context);
    assert.throws(() => TypedArray.from.call(undefined, []), "isn't generic #1");
    if (NATIVE) {
      assert.throws(() => TypedArray.from.call(Array, []), "isn't generic #2");
      assert.notThrows(() => TypedArray.from({
        0: $(1),
        length: -1,
      }, () => {
        throw new Error();
      }), 'uses ToLength');
    }
  }
});

if (DESCRIPTORS) QUnit.test('%TypedArray%.from rejects non-object iterator results', assert => {
  for (const { name, TypedArray, $ } of TYPED_ARRAYS_WITH_BIG_INT) {
    // Safari 14 only fails after successful calls warm up the native method.
    for (let i = 0; i < 1000; i++) TypedArray.from(createIterable([$(1)]));
    for (const primitive of [undefined, null, false, 1, 'foo']) {
      let nextCalls = 0;
      let returnCalls = 0;
      let mapCalls = 0;
      const iterable = createIterable([], {
        next() {
          return ++nextCalls === 1 ? primitive : { done: true };
        },
        return() {
          returnCalls++;
          return {};
        },
      });
      assert.throws(() => TypedArray.from(iterable, () => {
        mapCalls++;
        return $(1);
      }), TypeError, `${ name }.from rejects a non-object iterator result`);
      assert.same(nextCalls, 1, 'does not advance after an invalid result');
      assert.same(returnCalls, 0, 'does not close the iterator');
      assert.same(mapCalls, 0, 'does not call the mapper');
    }
  }
});
