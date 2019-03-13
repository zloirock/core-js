import { DESCRIPTORS } from '../helpers/constants';

if (DESCRIPTORS) {
  QUnit.test('RegExp#sticky', assert => {
    const re = new RegExp('a', 'y');
    assert.strictEqual(re.sticky, true, '.sticky is true');
    assert.strictEqual(re.flags, 'y', '.flags contains y');
    assert.strictEqual(/a/.sticky, false);

    const stickyGetter = Object.getOwnPropertyDescriptor(RegExp.prototype, 'sticky').get;
    if (typeof stickyGetter === 'function') {
      // Old firefox versions set a non-configurable non-writable .sticky property
      // It works correctly, but it isn't a getter and it can't be polyfilled.
      // We need to skip these tests.

      assert.throws(() => {
        stickyGetter.call({});
      }, undefined, '.sticky getter can only be called on RegExp instances');
      try {
        stickyGetter.call(/a/);
        assert.ok(true, '.sticky getter works on literals');
      } catch (e) {
        assert.ok(false, '.sticky getter works on literals');
      }
      try {
        stickyGetter.call(new RegExp('a'));
        assert.ok(true, '.sticky getter works on instances');
      } catch (e) {
        assert.ok(false, '.sticky getter works on instances');
      }

      assert.ok(Object.hasOwnProperty.call(RegExp.prototype, 'sticky'), 'prototype has .sticky property');
      assert.strictEqual(RegExp.prototype.sticky, undefined, '.sticky is undefined on prototype');
    }
  });
}
