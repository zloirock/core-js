import setPrototypeOf from '@core-js/pure/es/reflect/set-prototype-of';

QUnit.test('Reflect.setPrototypeOf', assert => {
  assert.isFunction(setPrototypeOf);
  if ('name' in setPrototypeOf) {
    assert.name(setPrototypeOf, 'setPrototypeOf');
  }
  let object = {};
  assert.true(setPrototypeOf(object, Array.prototype));
  assert.true(object instanceof Array);
  assert.throws(() => setPrototypeOf({}, 42), TypeError);
  assert.throws(() => setPrototypeOf(42, {}), TypeError, 'throws on primitive');
  object = {};
  assert.false(setPrototypeOf(object, object), 'false on recursive __proto__');
});
