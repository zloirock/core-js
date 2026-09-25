import { restoreProperty } from '../../helpers/restore-property.cjs';

// a patch through what a literal method read into a name returns lands on the namespace it returns
QUnit.test('mutated-statics: a patch through a literal method read into a name', assert => {
  const descriptor = Object.getOwnPropertyDescriptor(Number, 'isSafeInteger');
  function patched() { return 'PATCHED'; }
  const box = { make() { return Number; } };
  // eslint-disable-next-line prefer-destructuring -- the member read into a name is the shape under test
  const make = box.make;
  try {
    make().isSafeInteger = patched;
    assert.same(Number.isSafeInteger(1), 'PATCHED');
  } finally {
    restoreProperty(Number, 'isSafeInteger', descriptor);
  }
});
