import { PROTO } from '../helpers/constants';

if (PROTO) QUnit.test('Reflect.setPrototypeOf', function (assert) {
  var setPrototypeOf = core.Reflect.setPrototypeOf;
  assert.isFunction(setPrototypeOf);
  if ('name' in setPrototypeOf) {
    assert.name(setPrototypeOf, 'setPrototypeOf');
  }
  var object = {};
  assert.ok(setPrototypeOf(object, Array.prototype), true);
  assert.ok(object instanceof Array);
  assert['throws'](function () {
    setPrototypeOf({}, 42);
  }, TypeError);
  assert['throws'](function () {
    setPrototypeOf(42, {});
  }, TypeError, 'throws on primitive');
  object = {};
  assert.ok(setPrototypeOf(object, object) === false, 'false on recursive __proto__');
});
