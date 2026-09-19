import { restoreProperty } from '../../helpers/restore-property.cjs';
/* eslint-disable no-extend-native -- Mutation sources under test. */

// the up-front instance-entry import pins the CORE-JS implementation: a third-party
// prototype patch is not adopted, dispatch helpers keep serving the real polyfill
// save and restore through the DESCRIPTOR, not through a `key in obj` probe and a member read:
// both of those are rewritten here - the probe folds to the polyfilled world's `true` on a typed
// receiver, and the read hands back core-js's own implementation rather than the native. In a
// stripped realm that pair restored a method the realm never had, silently re-installing
// `String.prototype.at` for every test that runs after this one
QUnit.test('mutated-statics: prototype patch does not displace the instance polyfill', assert => {
  const descriptor = Object.getOwnPropertyDescriptor(String.prototype, 'at');
  String.prototype.at = function () { return 'bogus'; };
  try {
    assert.same('abc'.at(0), 'a');
  } finally {
    restoreProperty(String.prototype, 'at', descriptor);
  }
});
