import { createAsyncIterable, createIterable } from '../helpers/helpers';
import { DESCRIPTORS, GLOBAL, STRICT_THIS, TYPED_ARRAYS } from '../helpers/constants';

if (DESCRIPTORS) {
  // we can't implement %TypedArray% in all engines, so run all tests for each typed array constructor
  for (const name in TYPED_ARRAYS) QUnit.test(`%TypedArray%.fromAsync, ${ name }`, assert => {
    assert.expect(26);
    // eslint-disable-next-line qunit/no-async-in-loops -- safe
    const async = assert.async();
    const TypedArray = GLOBAL[name];
    const { fromAsync } = TypedArray;

    assert.isFunction(fromAsync);
    assert.arity(fromAsync, 1);
    assert.name(fromAsync, 'fromAsync');
    assert.looksNative(fromAsync);

    TypedArray.fromAsync(createAsyncIterable([1, 2, 3]), it => it ** 2).then(it => {
      assert.arrayEqual(it, [1, 4, 9], 'async iterable and mapfn');
      return TypedArray.fromAsync(createAsyncIterable([1]), function (arg, index) {
        assert.same(this, STRICT_THIS, 'this');
        assert.same(arguments.length, 2, 'arguments length');
        assert.same(arg, 1, 'argument');
        assert.same(index, 0, 'index');
      });
    }).then(() => {
      return TypedArray.fromAsync(createAsyncIterable([1, 2, 3]));
    }).then(it => {
      assert.arrayEqual(it, [1, 2, 3], 'async iterable without mapfn');
      return TypedArray.fromAsync(createIterable([1, 2, 3]), arg => arg ** 2);
    }).then(it => {
      assert.arrayEqual(it, [1, 4, 9], 'iterable and mapfn');
      return TypedArray.fromAsync(createIterable([1, 2, 3]), arg => Promise.resolve(arg ** 2));
    }).then(it => {
      assert.arrayEqual(it, [1, 4, 9], 'iterable and async mapfn');
      return TypedArray.fromAsync(createIterable([1]), function (arg, index) {
        assert.same(this, STRICT_THIS, 'this');
        assert.same(arguments.length, 2, 'arguments length');
        assert.same(arg, 1, 'argument');
        assert.same(index, 0, 'index');
      });
    }).then(() => {
      return TypedArray.fromAsync(createIterable([1, 2, 3]));
    }).then(it => {
      assert.arrayEqual(it, [1, 2, 3], 'iterable and without mapfn');
      return TypedArray.fromAsync([1, Promise.resolve(2), 3]);
    }).then(it => {
      assert.arrayEqual(it, [1, 2, 3], 'array');
      return TypedArray.fromAsync('123');
    }).then(it => {
      assert.arrayEqual(it, [1, 2, 3], 'string');
      return TypedArray.fromAsync({ length: 1, 0: 1 });
    }).then(it => {
      assert.arrayEqual(it, [1], 'non-iterable');
      return TypedArray.fromAsync(createIterable([1]), () => { throw 42; });
    }).catch(error => {
      assert.same(error, 42, 'rejection on a callback error');
    }).then(() => async());

    function C() { /* empty */ }
    assert.throws(() => TypedArray.fromAsync.call(C, [1], {}), TypeError);
    assert.throws(() => TypedArray.fromAsync(undefined, () => { /* empty */ }), TypeError);
    assert.throws(() => TypedArray.fromAsync(null, () => { /* empty */ }), TypeError);
    assert.throws(() => TypedArray.fromAsync([1], null), TypeError);
    assert.throws(() => TypedArray.fromAsync([1], {}), TypeError);
  });
}
