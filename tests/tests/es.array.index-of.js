import { DESCRIPTORS, STRICT, NATIVE } from '../helpers/constants';

QUnit.test('Array#indexOf', function (assert) {
  var indexOf = Array.prototype.indexOf;
  assert.isFunction(indexOf);
  assert.arity(indexOf, 1);
  assert.name(indexOf, 'indexOf');
  assert.looksNative(indexOf);
  assert.nonEnumerable(Array.prototype, 'indexOf');
  assert.same(0, [1, 1, 1].indexOf(1));
  assert.same(-1, [1, 2, 3].indexOf(1, 1));
  assert.same(1, [1, 2, 3].indexOf(2, 1));
  assert.same(-1, [1, 2, 3].indexOf(2, -1));
  assert.same(1, [1, 2, 3].indexOf(2, -2));
  assert.same(-1, [NaN].indexOf(NaN));
  assert.same(3, Array(2).concat([1, 2, 3]).indexOf(2));
  assert.same(-1, Array(1).indexOf(undefined));
  assert.same(0, [1].indexOf(1, -0), "shouldn't return negative zero");
  if (STRICT) {
    assert.throws(function () {
      indexOf.call(null, 0);
    }, TypeError);
    assert.throws(function () {
      indexOf.call(undefined, 0);
    }, TypeError);
  }
  if (NATIVE && DESCRIPTORS) {
    assert.ok(function () {
      try {
        return indexOf.call(Object.defineProperty({
          length: -1
        }, 0, {
          get: function () {
            throw new Error();
          }
        }), 1) === -1;
      } catch (e) { /* empty */ }
    }(), 'uses ToLength');
  }
});
