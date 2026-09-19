import { restoreProperty } from '../../helpers/restore-property.cjs';

// a COMPUTED const-aliased mutator callee (`Object[dp]` over `const dp = 'defineProperty'`) names
// the same mutator as the dotted form, so the patch records and the read keeps it.
// Restore in a foreign module so cleanup cannot mark the slot in this source.
QUnit.test('mutated-statics: computed mutator callee keeps the patch', assert => {
  const dp = 'defineProperty';

  const originalDescriptor = Object.getOwnPropertyDescriptor(Object, 'groupBy');

  Object[dp](Object, 'groupBy', {
    value: function patched() { return 'computed-callee-patched'; },
    configurable: true,
    writable: true,
  });
  try {
    assert.same(Object.groupBy([1], it => it), 'computed-callee-patched');
  } finally {
    restoreProperty(Object, 'groupBy', originalDescriptor);
  }
});
