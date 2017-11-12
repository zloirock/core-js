import { PROTO } from '../helpers/constants';

if (PROTO) QUnit.test('Object.setPrototypeOf', function (assert) {
  var setPrototypeOf = core.Object.setPrototypeOf;
  assert.isFunction(setPrototypeOf);
  assert.ok('apply' in setPrototypeOf({}, Function.prototype), 'Parent properties in target');
  assert.strictEqual(setPrototypeOf({ a: 2 }, {
    b: function () {
      return Math.pow(this.a, 2);
    }
  }).b(), 4, 'Child and parent properties in target');
  var object = {};
  assert.strictEqual(setPrototypeOf(object, { a: 1 }), object, 'setPrototypeOf return target');
  assert.ok(!('toString' in setPrototypeOf({}, null)), 'Can set null as prototype');
});
