import { restoreProperty } from '../../helpers/restore-property.cjs';

// a CALL-EXPRESSION mutation receiver (`getArr().from = patch`) records like an identifier
// one - the later bare read serves the patch instead of the extracted pure static
QUnit.test('mutated-statics: call-receiver patch is honored by later reads', assert => {
  const originalDescriptor = Object.getOwnPropertyDescriptor(Array, 'from');

  function getArr() { return Array; }
  getArr().from = () => 'patched';
  try {
    assert.same(Array.from('ab'), 'patched');
  } finally {
    restoreProperty(Array, 'from', originalDescriptor);
  }
});
