import { restoreProperty } from '../../helpers/restore-property.cjs';

QUnit.test('mutated-statics: computed const-key container mutation wins over substitution', assert => {
  function patched() { return 'computed-key-win'; }
  const registry = { Promise };
  const ckey = 'Promise';
  const originalDescriptor = Object.getOwnPropertyDescriptor(Promise, 'try');

  registry[ckey].try = patched;
  try {
    assert.same(Promise.try(() => 0), 'computed-key-win');
  } finally {
    restoreProperty(Promise, 'try', originalDescriptor);
  }
});
