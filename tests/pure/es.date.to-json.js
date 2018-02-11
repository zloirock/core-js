import { toJSON, toISOString } from 'core-js-pure/features/date';

QUnit.test('Date#toJSON', assert => {
  assert.isFunction(toJSON);
  if (Date.prototype.toISOString) {
    const date = new Date();
    assert.same(toJSON(date), toISOString(date), 'base');
  }
  assert.same(toJSON(new Date(NaN)), null, 'not finite');
  assert.same(toJSON({
    toISOString() {
      return 42;
    },
  }), 42, 'generic');
});
