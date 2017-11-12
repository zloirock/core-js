import { NATIVE } from '../helpers/constants';

QUnit.test('Object.isSealed', function (assert) {
  var seal = Object.seal;
  var isSealed = Object.isSealed;
  assert.isFunction(isSealed);
  assert.arity(isSealed, 1);
  assert.name(isSealed, 'isSealed');
  assert.looksNative(isSealed);
  assert.nonEnumerable(Object, 'isSealed');
  var primitives = [42, 'string', false, null, undefined];
  for (var i = 0, length = primitives.length; i < length; ++i) {
    var value = primitives[i];
    assert.ok(function () {
      try {
        isSealed(value);
        return true;
      } catch (e) { /* empty */ }
    }(), 'accept ' + value);
    assert.same(isSealed(value), true, 'returns true on ' + value);
  }
  assert.same(isSealed({}), false);
  if (NATIVE) assert.ok(isSealed(seal({})));
});
