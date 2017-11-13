import { PROTO } from '../helpers/constants';

if (PROTO) QUnit.test('Object.setPrototypeOf', function (assert) {
  var setPrototypeOf = Object.setPrototypeOf;
  assert.isFunction(setPrototypeOf);
  assert.arity(setPrototypeOf, 2);
  assert.name(setPrototypeOf, 'setPrototypeOf');
  assert.looksNative(setPrototypeOf);
  assert.nonEnumerable(Object, 'setPrototypeOf');
  assert.ok('apply' in setPrototypeOf({}, Function.prototype), 'Parent properties in target');
  assert.strictEqual(setPrototypeOf({ a: 2 }, {
    b: function () {
      return this.a ** 2;
    }
  }).b(), 4, 'Child and parent properties in target');
  var object = {};
  assert.strictEqual(setPrototypeOf(object, { a: 1 }), object, 'setPrototypeOf return target');
  assert.ok(!('toString' in setPrototypeOf({}, null)), 'Can set null as prototype');
});
