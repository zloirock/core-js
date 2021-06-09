/* eslint-disable regexp/no-useless-character-class, regexp/no-useless-flag -- required for testing */
import { DESCRIPTORS } from '../helpers/constants';

if (DESCRIPTORS) {
  QUnit.test('RegExp#dotAll', assert => {
    let re = RegExp('.', 's');
    assert.same(re.dotAll, true, '.dotAll is true');
    assert.same(re.flags, 's', '.flags contains s');
    assert.same(RegExp('.').dotAll, false, 'no');
    assert.same(/a/.dotAll, false, 'no in literal');

    assert.same(RegExp('.', '').test('\n'), false, 'dotAll missed');
    assert.same(RegExp('.', 's').test('\n'), true, 'dotAll basic');
    assert.same(RegExp('[.]', 's').test('\n'), false, 'dotAll brackets #1');
    assert.same(RegExp('[.].', '').test('.\n'), false, 'dotAll brackets #2');
    assert.same(RegExp('[.].', 's').test('.\n'), true, 'dotAll brackets #3');
    assert.same(RegExp('[[].', 's').test('[\n'), true, 'dotAll brackets #4');
    assert.same(RegExp('.[.[].\\..', 's').source, '.[.[].\\..', 'dotAll correct source');

    const string = '123\n456789\n012';
    re = RegExp('(\\d{3}).\\d{3}', 'sy');

    let match = re.exec(string);
    assert.same(match[1], '123', 's with y #1');
    assert.same(re.lastIndex, 7, 's with y #2');

    match = re.exec(string);
    assert.same(match[1], '789', 's with y #3');
    assert.same(re.lastIndex, 14, 's with y #4');

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
