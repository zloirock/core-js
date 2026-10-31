/* eslint-disable no-proto -- required for testing */
QUnit.test('Object.prototype.__proto__', assert => {
  assert.true('__proto__' in Object.prototype, 'in Object.prototype');
  const O = {};
  assert.same(O.__proto__, Object.prototype);
  O.__proto__ = Array.prototype;
  assert.same(O.__proto__, Array.prototype);
  assert.same(Object.getPrototypeOf(O), Array.prototype);
  assert.true(O instanceof Array);
  O.__proto__ = null;
  assert.same(Object.getPrototypeOf(O), null);
});
