/* eslint-disable unicorn/better-regex -- required for testing */
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
