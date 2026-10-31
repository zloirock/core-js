import { DESCRIPTORS, GLOBAL } from '../helpers/constants.js';

QUnit.test('Temporal namespace', assert => {
  // 1. From prop-desc.js: Check the type
  assert.same(typeof GLOBAL.Temporal, 'object', 'typeof Temporal is "object"');

  // 1b. From prop-desc.js: Check the property descriptor on the global object
  // We wrap this in a DESCRIPTORS check because core-js runs its tests in
  // legacy environments (like ES3) that don't support getOwnPropertyDescriptor.
  if (DESCRIPTORS) {
    const descriptor = Object.getOwnPropertyDescriptor(GLOBAL, 'Temporal');
    assert.notStrictEqual(descriptor, undefined, 'Temporal descriptor exists');
    assert.same(descriptor.writable, true, 'Temporal is writable');
    assert.same(descriptor.enumerable, false, 'Temporal is not enumerable');
    assert.same(descriptor.configurable, true, 'Temporal is configurable');
  }

  // 2. From keys.js: Check for no enumerable properties
  assert.arrayEqual(Object.keys(GLOBAL.Temporal), [], 'Temporal has no enumerable properties');

  // 3. From getOwnPropertyNames.js: Check for specific own properties
  const names = Object.getOwnPropertyNames(GLOBAL.Temporal);
  const expected = [
    'Instant',
    'PlainDate',
    'PlainTime',
    'PlainDateTime',
    'ZonedDateTime',
    'PlainYearMonth',
    'PlainMonthDay',
    'Duration',
    'Now',
  ];

  for (const name of expected) {
    assert.notStrictEqual(names.indexOf(name), -1, `Temporal has property: ${ name }`);
  }
});
