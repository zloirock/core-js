import self from '@core-js/pure/stable/self';

QUnit.test('self', assert => {
  assert.same(self, Object(self), 'is object');
  assert.same(self.Math, Math, 'contains globals');
});
