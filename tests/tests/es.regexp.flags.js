/* eslint-disable regexp/sort-flags, regexp/no-useless-flag -- required for testing */
import { DESCRIPTORS } from '../helpers/constants';

if (DESCRIPTORS) {
  QUnit.test('RegExp#flags', assert => {
    assert.nonEnumerable(RegExp.prototype, 'flags');
    assert.same(/./g.flags, 'g', '/./g.flags is "g"');
    assert.same(/./.flags, '', '/./.flags is ""');
    assert.same(RegExp('.', 'gim').flags, 'gim', 'RegExp(".", "gim").flags is "gim"');
    assert.same(RegExp('.').flags, '', 'RegExp(".").flags is ""');
    assert.same(/./gim.flags, 'gim', '/./gim.flags is "gim"');
    assert.same(/./gmi.flags, 'gim', '/./gmi.flags is "gim"');
    assert.same(/./mig.flags, 'gim', '/./mig.flags is "gim"');
    assert.same(/./mgi.flags, 'gim', '/./mgi.flags is "gim"');
  });
}
