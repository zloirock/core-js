import { restoreProperty } from '../../helpers/restore-property.cjs';

// Follow the destructure key (I -> Iterator), not the raw globalThis initializer.
// Iterator.zip has a standalone pure entry, so a missed mutation changes the answer.
QUnit.test('mutated-statics: destructure-leaf alias mutation wins over substitution', assert => {
  const { Iterator: I } = globalThis;

  const originalDescriptor = Object.getOwnPropertyDescriptor(I, 'zip');

  I.zip = function patched() {
    return 'destructure-leaf-patched';
  };
  try {
    assert.same(Iterator.zip([[1], [2]]), 'destructure-leaf-patched');
  } finally {
    restoreProperty(I, 'zip', originalDescriptor);
  }
});
