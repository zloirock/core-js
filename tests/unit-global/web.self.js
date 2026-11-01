/* eslint-disable no-restricted-globals, unicorn/prefer-global-this -- safe */
QUnit.test('self', assert => {
  assert.same(self, Object(self), 'is object');
  assert.same(self.Math, Math, 'contains globals');
  const descriptor = Object.getOwnPropertyDescriptor(self, 'self');
  // can't be properly defined (non-configurable) in some engines like Deno 1.11-
  // assert.isFunction(descriptor.get, 'a getter');
  // assert.true(descriptor.configurable, 'configurable');
  assert.true(descriptor.enumerable, 'enumerable');
});
