/* eslint-disable prefer-regex-literals -- required for testing */
import { DESCRIPTORS } from '../helpers/constants.js';

if (DESCRIPTORS) {
  QUnit.test('RegExp#hasIndices', assert => {
    const re = RegExp('.', 'd');
    assert.true(re.hasIndices, '.hasIndices is true');
    assert.same(re.flags, 'd', '.flags contains d');
    assert.false(RegExp('.').hasIndices, 'no');
    assert.false(/a/.hasIndices, 'no in literal');

    const hasIndicesGetter = Object.getOwnPropertyDescriptor(RegExp.prototype, 'hasIndices').get;
    if (typeof hasIndicesGetter == 'function') {
      assert.throws(() => {
        hasIndicesGetter.call({});
      }, undefined, '.hasIndices getter can only be called on RegExp instances');
      try {
        hasIndicesGetter.call(/a/);
        assert.required('.hasIndices getter works on literals');
      } catch {
        assert.avoid('.hasIndices getter works on literals');
      }
      try {
        hasIndicesGetter.call(new RegExp('a'));
        assert.required('.hasIndices getter works on instances');
      } catch {
        assert.avoid('.hasIndices getter works on instances');
      }

      assert.true(Object.hasOwn(RegExp.prototype, 'hasIndices'), 'prototype has .hasIndices property');
    }
  });
}
