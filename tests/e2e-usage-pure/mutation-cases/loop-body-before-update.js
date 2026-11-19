import { restoreProperty } from '../../helpers/restore-property.cjs';

QUnit.test('a for update reads the global written by its body', assert => {
  const saved = Object.getOwnPropertyDescriptor(globalThis, 'Promise');
  function Shim() { return 17; }
  const results = [];
  try {
    for (let i = 0; i < 1; results[results.length] = Promise === Shim, i++) {
      globalThis.Promise = Shim;
    }
    assert.deepEqual(results, [true]);
  } finally {
    restoreProperty(globalThis, 'Promise', saved);
  }
});
