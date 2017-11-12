import { GLOBAL, STRICT, NATIVE } from '../helpers/constants';

QUnit.test('Array#slice', function (assert) {
  var slice = Array.prototype.slice;
  var isArray = Array.isArray;
  assert.isFunction(slice);
  assert.arity(slice, 2);
  assert.name(slice, 'slice');
  assert.looksNative(slice);
  assert.nonEnumerable(Array.prototype, 'slice');
  var array = ['1', '2', '3', '4', '5'];
  assert.deepEqual(array.slice(), array);
  assert.deepEqual(array.slice(1, 3), ['2', '3']);
  assert.deepEqual(array.slice(1, undefined), ['2', '3', '4', '5']);
  assert.deepEqual(array.slice(1, -1), ['2', '3', '4']);
  assert.deepEqual(array.slice(-2, -1), ['4']);
  assert.deepEqual(array.slice(-2, -3), []);
  var string = '12345';
  assert.deepEqual(Array.prototype.slice.call(string), array);
  assert.deepEqual(Array.prototype.slice.call(string, 1, 3), ['2', '3']);
  assert.deepEqual(Array.prototype.slice.call(string, 1, undefined), ['2', '3', '4', '5']);
  assert.deepEqual(Array.prototype.slice.call(string, 1, -1), ['2', '3', '4']);
  assert.deepEqual(Array.prototype.slice.call(string, -2, -1), ['4']);
  assert.deepEqual(Array.prototype.slice.call(string, -2, -3), []);
  var list = GLOBAL.document && document.body && document.body.childNodes;
  if (list) {
    try {
      assert.ok(isArray(slice.call(list)));
    } catch (e) {
      assert.ok(false);
    }
  }
  if (NATIVE) {
    if (STRICT) {
      assert.throws(function () {
        slice.call(null);
      }, TypeError);
      assert.throws(function () {
        slice.call(undefined);
      }, TypeError);
    }
    assert.deepEqual(slice.call({
      length: -1,
      0: 1
    }, 0, 1), [], 'uses ToLength');
  }
});
