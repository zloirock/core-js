import { restoreProperty } from '../../helpers/restore-property.cjs';

// A namespace reached as a proxy-global member (`globalThis.Reflect`, `self.Object`) names the same
// global namespace, so the mutator call is detected; `Reflect.set(target, key, value, RECEIVER)` writes
// to the receiver, the real mutation host. cleanup in another module cannot mask this shape.
QUnit.test('mutated-statics: proxy-global namespace mutator wins over substitution', assert => {
  function patched() { return 'namespace-win'; }
  const originalDescriptor = Object.getOwnPropertyDescriptor(Promise, 'withResolvers');

  globalThis.Reflect.set(Promise, 'withResolvers', patched);
  try {
    assert.same(Promise.withResolvers(), 'namespace-win');
  } finally {
    restoreProperty(Promise, 'withResolvers', originalDescriptor);
  }
});
