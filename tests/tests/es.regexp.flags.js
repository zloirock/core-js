import { DESCRIPTORS } from '../helpers/constants';

if (DESCRIPTORS) {
  QUnit.test('RegExp#flags', assert => {
    assert.nonEnumerable(RegExp.prototype, 'flags');
    assert.strictEqual(/./g.flags, 'g', '/./g.flags is "g"');
    assert.strictEqual(/./.flags, '', '/./.flags is ""');
    assert.strictEqual(RegExp('.', 'gim').flags, 'gim', 'RegExp(".", "gim").flags is "gim"');
    assert.strictEqual(RegExp('.').flags, '', 'RegExp(".").flags is ""');
    assert.strictEqual(/./gim.flags, 'gim', '/./gim.flags is "gim"');
    assert.strictEqual(/./gmi.flags, 'gim', '/./gmi.flags is "gim"');
    assert.strictEqual(/./mig.flags, 'gim', '/./mig.flags is "gim"');
    assert.strictEqual(/./mgi.flags, 'gim', '/./mgi.flags is "gim"');
  });

  QUnit.test('RegExp#sticky', assert => {
    const re = new RegExp('a', 'y');
    assert.ok(re.sticky, '.sticky is true');
    assert.strictEqual(re.flags, 'y', '.flags contains y');

    assert.ok(Object.hasOwnProperty.call(RegExp.prototype, 'sticky'), 'prototype has .sticky property');
    assert.strictEqual(RegExp.prototype.sticky, undefined, '.sticky is undefined on prototype');

    const stickyGetter = Object.getOwnPropertyDescriptor(RegExp.prototype, 'sticky').get;
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
      assert.ok(true, '.sticky getter works on literals');
    } catch (e) {
      assert.ok(false, '.sticky getter works on literals');
    }
  });
}
