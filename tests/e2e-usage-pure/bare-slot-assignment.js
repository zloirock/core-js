import { withTemporaryProperty } from '../helpers/restore-property.cjs';

// Only the bare assignment marks Promise here. Slot priming and cleanup live in another module.
QUnit.test('mutated-slots: bare slot reassignment routes later reads', assert => {
  withTemporaryProperty(globalThis, 'Promise', undefined, () => {
    // eslint-disable-next-line no-global-assign -- the bare reassignment is the tested channel
    Promise = { resolve: () => 'bluebird' };
    assert.same(Promise.resolve(1), 'bluebird');
  });
});
