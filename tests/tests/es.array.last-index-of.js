var test = QUnit.test;

test('Array#lastIndexOf', function (assert) {
  var lastIndexOf = Array.prototype.lastIndexOf;
  assert.isFunction(lastIndexOf);
  assert.arity(lastIndexOf, 1);
  assert.name(lastIndexOf, 'lastIndexOf');
  assert.looksNative(lastIndexOf);
  assert.nonEnumerable(Array.prototype, 'lastIndexOf');
  assert.same(2, [1, 1, 1].lastIndexOf(1));
  assert.same(-1, [1, 2, 3].lastIndexOf(3, 1));
  assert.same(1, [1, 2, 3].lastIndexOf(2, 1));
  assert.same(-1, [1, 2, 3].lastIndexOf(2, -3));
  assert.same(-1, [1, 2, 3].lastIndexOf(1, -4));
  assert.same(1, [1, 2, 3].lastIndexOf(2, -2));
  assert.same(-1, [NaN].lastIndexOf(NaN));
  assert.same(1, [1, 2, 3].concat(Array(2)).lastIndexOf(2));
  assert.same(0, [1].lastIndexOf(1, -0), "shouldn't return negative zero");
  if (STRICT) {
    assert['throws'](function () {
      lastIndexOf.call(null, 0);
    }, TypeError);
    assert['throws'](function () {
      lastIndexOf.call(undefined, 0);
    }, TypeError);
  }
  if (NATIVE && DESCRIPTORS) {
    assert.ok(function () {
      try {
        return lastIndexOf.call(Object.defineProperties({
          length: -1
        }, {
          2147483646: {
            get: function () {
              throw new Error();
            }
          },
          4294967294: {
            get: function () {
              throw new Error();
            }
          }
        }), 1) === -1;
      } catch (e) { /* empty */ }
    }(), 'uses ToLength');
  }
});
