import { DESCRIPTORS, GLOBAL } from '../helpers/constants.js';
import Temporal from 'core-js-pure/actual/temporal.js';
import getOwnPropertyNames from 'core-js-pure/es/object/get-own-property-names.js';
import getOwnPropertyDescriptor from 'core-js-pure/es/object/get-own-property-descriptor.js';
import keys from 'core-js-pure/es/object/keys.js';

QUnit.test('Temporal namespace', assert => {
  // 1. From prop-desc.js: Check the type and ensure the global scope is untouched
  assert.same(GLOBAL.Temporal, undefined, 'Pure version must not pollute the global scope');

  if (!Temporal) {
    assert.avoid('Temporal pure module is not yet implemented in core-js-pure.');
  }

  // 1b. From prop-desc.js: Check the property descriptor on the global object
  // Instead of checking the descriptor of a global property, we verify
  // that the pure object has the characteristics required of the spec.
  if (DESCRIPTORS) {
    assert.notStrictEqual(getOwnPropertyDescriptor(Temporal, 'descriptor'), undefined, 'Temporal descriptor exists');
    assert.same(getOwnPropertyDescriptor(Temporal, 'writable'), true, 'Temporal is writable');
    assert.same(getOwnPropertyDescriptor(Temporal, 'enumerable'), false, 'Temporal is not enumerable');
    assert.same(getOwnPropertyDescriptor(Temporal, 'configurable'), true, 'Temporal is configurable');
  }

  // 2. From keys.js: Check for no enumerable properties
  assert.arrayEqual(keys(Temporal), [], 'Temporal has no enumerable properties');

  // 3. From getOwnPropertyNames.js: Check for specific own properties
  const names = getOwnPropertyNames(Temporal);
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
