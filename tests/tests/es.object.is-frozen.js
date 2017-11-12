import { NATIVE } from '../helpers/constants';

QUnit.test('Object.isFrozen', function (assert) {
  var freeze = Object.freeze;
  var isFrozen = Object.isFrozen;
  assert.isFunction(isFrozen);
  assert.arity(isFrozen, 1);
  assert.name(isFrozen, 'isFrozen');
  assert.looksNative(isFrozen);
  assert.nonEnumerable(Object, 'isFrozen');
  var primitives = [42, 'string', false, null, undefined];
  for (var i = 0, length = primitives.length; i < length; ++i) {
    var value = primitives[i];
    assert.ok(function () {
      try {
        isFrozen(value);
        return true;
      } catch (e) { /* empty */ }
    }(), 'accept ' + value);
    assert.same(isFrozen(value), true, 'returns true on ' + value);
  }
  assert.same(isFrozen({}), false);
  if (NATIVE) assert.ok(isFrozen(freeze({})));
});
