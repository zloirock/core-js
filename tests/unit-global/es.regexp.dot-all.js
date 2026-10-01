/* eslint-disable prefer-regex-literals -- required for testing */
QUnit.test('RegExp#dotAll', assert => {
  const re = RegExp('.', 's');
  assert.true(re.dotAll, '.dotAll is true');
  assert.same(re.flags, 's', '.flags contains s');
  assert.false(RegExp('.').dotAll, 'no');
  assert.false(/a/.dotAll, 'no in literal');

  const dotAllGetter = Object.getOwnPropertyDescriptor(RegExp.prototype, 'dotAll').get;
  if (typeof dotAllGetter == 'function') {
    assert.throws(() => {
      dotAllGetter.call({});
    }, undefined, '.dotAll getter can only be called on RegExp instances');
    try {
      dotAllGetter.call(/a/);
      assert.required('.dotAll getter works on literals');
    } catch {
      assert.avoid('.dotAll getter works on literals');
    }
    try {
      dotAllGetter.call(new RegExp('a'));
      assert.required('.dotAll getter works on instances');
    } catch {
      assert.avoid('.dotAll getter works on instances');
    }

    assert.true(Object.hasOwn(RegExp.prototype, 'dotAll'), 'prototype has .dotAll property');
  }
});
