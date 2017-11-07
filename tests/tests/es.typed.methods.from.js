var test = QUnit.test;

if (DESCRIPTORS) test('%TypedArray%.from', function (assert) {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  var arrays = ['Float32Array', 'Float64Array', 'Int8Array', 'Int16Array', 'Int32Array', 'Uint8Array', 'Uint16Array', 'Uint32Array', 'Uint8ClampedArray'];
  for (var i = 0, length = arrays.length; i < length; ++i) {
    var name = arrays[i];
    var TypedArray = global[name];
    assert.isFunction(TypedArray.from, name + '.from is function');
    assert.arity(TypedArray.from, 1, name + '.from arity is 1');
    assert.name(TypedArray.from, 'from', name + ".from name is 'from'");
    assert.looksNative(TypedArray.from, name + '.from looks native');
    var instance = TypedArray.from([1, 2, 3]);
    assert.ok(instance instanceof TypedArray, 'correct instance with array');
    assert.arrayEqual(instance, [1, 2, 3], 'correct elements with array');
    instance = TypedArray.from({
      0: 1,
      1: 2,
      2: 3,
      length: 3
    });
    assert.ok(instance instanceof TypedArray, 'correct instance with array-like');
    assert.arrayEqual(instance, [1, 2, 3], 'correct elements with array-like');
    instance = TypedArray.from(createIterable([1, 2, 3]));
    assert.ok(instance instanceof TypedArray, 'correct instance with iterable');
    assert.arrayEqual(instance, [1, 2, 3], 'correct elements with iterable');
    assert.arrayEqual(TypedArray.from([1, 2, 3], function (it) {
      return it * it;
    }), [1, 4, 9], 'accept callback');
    var context = {};
    TypedArray.from([1], function (value, key) {
      assert.same(arguments.length, 2, 'correct number of callback arguments');
      assert.same(value, 1, 'correct value in callback');
      assert.same(key, 0, 'correct index in callback');
      assert.same(this, context, 'correct callback context');
    }, context);
    assert['throws'](function () {
      TypedArray.from.call(undefined, []);
    }, "isn't generic #1");
    if (NATIVE) {
      assert['throws'](function () {
        TypedArray.from.call(Array, []);
      }, "isn't generic #2");
      assert.ok(function () {
        try {
          return TypedArray.from({
            length: -1,
            0: 1
          }, function () {
            throw new Error();
          });
        } catch (e) { /* empty */ }
      }(), 'uses ToLength');
    }
  }
});
