import { GLOBAL, STRICT, NATIVE } from '../helpers/constants';

QUnit.test('Array#slice', function (assert) {
  var slice = core.Array.slice;
  var isArray = core.Array.isArray;
  assert.isFunction(slice);
  var array = ['1', '2', '3', '4', '5'];
  assert.deepEqual(slice(array), array);
  assert.deepEqual(slice(array, 1, 3), ['2', '3']);
  assert.deepEqual(slice(array, 1, undefined), ['2', '3', '4', '5']);
  assert.deepEqual(slice(array, 1, -1), ['2', '3', '4']);
  assert.deepEqual(slice(array, -2, -1), ['4']);
  assert.deepEqual(slice(array, -2, -3), []);
  var string = '12345';
  assert.deepEqual(slice(string), array);
  assert.deepEqual(slice(string, 1, 3), ['2', '3']);
  assert.deepEqual(slice(string, 1, undefined), ['2', '3', '4', '5']);
  assert.deepEqual(slice(string, 1, -1), ['2', '3', '4']);
  assert.deepEqual(slice(string, -2, -1), ['4']);
  assert.deepEqual(slice(string, -2, -3), []);
  var list = GLOBAL.document && document.body && document.body.childNodes;
  if (list) {
    try {
      assert.ok(isArray(slice(list)));
    } catch (e) {
      assert.ok(false);
    }
  }
  if (NATIVE && STRICT) {
    assert['throws'](function () {
      slice(null);
    }, TypeError);
    assert['throws'](function () {
      slice(undefined);
    }, TypeError);
  }
});
