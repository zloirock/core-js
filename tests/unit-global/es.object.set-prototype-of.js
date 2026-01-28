import { PROTO } from '../helpers/constants.js';

if (PROTO) QUnit.test('Object.setPrototypeOf', assert => {
  const { setPrototypeOf } = Object;
  assert.isFunction(setPrototypeOf);
  assert.arity(setPrototypeOf, 2);
  assert.name(setPrototypeOf, 'setPrototypeOf');
  assert.looksNative(setPrototypeOf);
  assert.nonEnumerable(Object, 'setPrototypeOf');
  assert.true('apply' in setPrototypeOf({}, Function.prototype), 'Parent properties in target');
  assert.same(setPrototypeOf({ a: 2 }, {
    b() {
      return this.a ** 2;
    },
  }).b(), 4, 'Child and parent properties in target');
  const object = {};
  assert.same(setPrototypeOf(object, { a: 1 }), object, 'setPrototypeOf return target');
  assert.false('toString' in setPrototypeOf({}, null), 'Can set null as prototype');
});
