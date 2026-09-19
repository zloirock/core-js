import { restoreProperty } from '../../helpers/restore-property.cjs';

QUnit.test('mutated-statics: inline chain-assign receiver mutation wins over substitution', assert => {
  function patched() { return 'chain-assign-win'; }
  const originalDescriptor = Object.getOwnPropertyDescriptor(Promise, 'race');

  const box = {};
  (box.recv = Promise).race = patched;
  try {
    assert.same(box.recv, Promise);
    assert.same(Promise.race([]), 'chain-assign-win');
  } finally {
    restoreProperty(Promise, 'race', originalDescriptor);
  }
});
