import { withTemporaryProperty } from '../helpers/restore-property.cjs';

// Ambient names describe runtime globals and must not hide their polyfill claims.
declare const globalThis: any;
declare const self: any;

QUnit.test('ambient realm: statics remain served through a declared root', assert => {
  assert.deepEqual(globalThis.Array.of(31), [31]);
  withTemporaryProperty(globalThis, 'self', globalThis, () => {
    assert.deepEqual(self.Array.from([37]), [37]);
    assert.same(typeof self.Promise.withResolvers, 'function');
  });
});

export {};
