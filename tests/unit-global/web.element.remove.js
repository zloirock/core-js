import { NODE, BUN } from '../helpers/constants.js';

if (!NODE && !BUN) {
  QUnit.test('Element#remove', assert => {
    const parent = document.createElement('div');
    const child = document.createElement('span');
    parent.appendChild(child);
    assert.true(parent.contains(child), 'Child initially exists');
    child.remove();
    assert.false(parent.contains(child), 'Child node was removed');
    assert.strictEqual(child.parentNode, null, 'Child has no parent');
  });
}
