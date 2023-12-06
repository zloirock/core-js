import setPrototypeOf from '@core-js/pure/es/object/set-prototype-of';

QUnit.test('Object.setPrototypeOf', assert => {
  assert.isFunction(setPrototypeOf);
  assert.true('apply' in setPrototypeOf({}, Function.prototype), 'Parent properties in target');
  assert.same(setPrototypeOf({ a: 2 }, {
    b() {
      return this.a ** 2;
    },
  }).b(), 4, 'Child and parent properties in target');
  const object = {};
  assert.same(setPrototypeOf(object, { a: 1 }), object, 'setPrototypeOf return target');
  assert.false(('toString' in setPrototypeOf({}, null)), 'Can set null as prototype');
});
