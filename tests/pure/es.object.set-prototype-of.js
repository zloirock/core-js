import { PROTO } from '../helpers/constants';

import setPrototypeOf from 'core-js-pure/features/object/set-prototype-of';

if (PROTO) QUnit.test('Object.setPrototypeOf', assert => {
  assert.isFunction(setPrototypeOf);
  assert.ok('apply' in setPrototypeOf({}, Function.prototype), 'Parent properties in target');
  assert.strictEqual(setPrototypeOf({ a: 2 }, {
    b() {
      return this.a ** 2;
    },
  }).b(), 4, 'Child and parent properties in target');
  const object = {};
  assert.strictEqual(setPrototypeOf(object, { a: 1 }), object, 'setPrototypeOf return target');
  assert.ok(!('toString' in setPrototypeOf({}, null)), 'Can set null as prototype');
});
