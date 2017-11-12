import { DESCRIPTORS, STRICT, NATIVE } from '../helpers/constants';

QUnit.test('Array#includes', function (assert) {
  var includes = Array.prototype.includes;
  assert.isFunction(includes);
  assert.name(includes, 'includes');
  assert.arity(includes, 1);
  assert.looksNative(includes);
  assert.nonEnumerable(Array.prototype, 'includes');
  var object = {};
  var array = [1, 2, 3, -0, object];
  assert.ok(array.includes(1));
  assert.ok(array.includes(-0));
  assert.ok(array.includes(0));
  assert.ok(array.includes(object));
  assert.ok(!array.includes(4));
  assert.ok(!array.includes(-0.5));
  assert.ok(!array.includes({}));
  assert.ok(Array(1).includes(undefined));
  assert.ok([NaN].includes(NaN));
  if (STRICT) {
    assert.throws(function () {
      includes.call(null, 0);
    }, TypeError);
    assert.throws(function () {
      includes.call(undefined, 0);
    }, TypeError);
  }
  if (NATIVE && DESCRIPTORS) {
    assert.ok(function () {
      try {
        return includes.call(Object.defineProperty({
          length: -1
        }, 0, {
          get: function () {
            throw new Error();
          }
        }), 1) === false;
      } catch (e) { /* empty */ }
    }(), 'uses ToLength');
  }
  assert.ok('includes' in Array.prototype[Symbol.unscopables], 'In Array#@@unscopables');
});
