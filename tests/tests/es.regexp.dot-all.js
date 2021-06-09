import { DESCRIPTORS } from '../helpers/constants';

if (DESCRIPTORS) {
  QUnit.test('RegExp#dotAll', assert => {
    const re = RegExp('.', 's');
    assert.same(re.dotAll, true, '.dotAll is true');
    assert.same(re.flags, 's', '.flags contains s');
    assert.same(RegExp('.').dotAll, false, 'no');
    assert.same(/a/.dotAll, false, 'no in literal');

    const dotAllGetter = Object.getOwnPropertyDescriptor(RegExp.prototype, 'dotAll').get;
    if (typeof dotAllGetter === 'function') {
      assert.throws(() => {
        dotAllGetter.call({});
      }, undefined, '.dotAll getter can only be called on RegExp instances');
      try {
        dotAllGetter.call(/a/);
        assert.ok(true, '.dotAll getter works on literals');
      } catch (error) {
        assert.ok(false, '.dotAll getter works on literals');
      }
      try {
        dotAllGetter.call(new RegExp('a'));
        assert.ok(true, '.dotAll getter works on instances');
      } catch (error) {
        assert.ok(false, '.dotAll getter works on instances');
      }

      assert.ok(Object.hasOwnProperty.call(RegExp.prototype, 'dotAll'), 'prototype has .dotAll property');
    }
  });
}
