/* eslint-disable prefer-regex-literals, regexp/sort-flags, regexp/no-useless-flag -- required for testing */
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

  let INDICES_SUPPORT = true;
  try {
    RegExp('.', 'd');
  } catch {
    INDICES_SUPPORT = false;
  }

  const O = {};
  // modern V8 bug
  let calls = '';
  const expected = INDICES_SUPPORT ? 'dgimsy' : 'gimsy';

  function addGetter(key, chr) {
    Object.defineProperty(O, key, { get() {
      calls += chr;
      return true;
    } });
  }

  const pairs = {
    dotAll: 's',
    global: 'g',
    ignoreCase: 'i',
    multiline: 'm',
    sticky: 'y',
  };

  if (INDICES_SUPPORT) pairs.hasIndices = 'd';

  for (const key in pairs) addGetter(key, pairs[key]);

  const result = Object.getOwnPropertyDescriptor(RegExp.prototype, 'flags').get.call(O);

  assert.same(result, expected, 'proper order, result');
  assert.same(calls, expected, 'proper order, calls');
});
