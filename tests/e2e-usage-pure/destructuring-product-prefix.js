// Public readers retain an unknown receiver and a live default after child transforms.
export function readPrefixedMethod(row, effect, fallback) {
  let method;
  // eslint-disable-next-line prefer-const -- assignment placement is under test
  ({ at: method = (fallback(row), fallback(row)) } = (effect(), row));
  return method;
}

export function readBodylessMethod(row, effect, fallback) {
  /* eslint-disable no-var -- the bodyless declaration is under test */
  if (row) var { at: method = fallback(row) } = (effect(), row);
  return method;
  /* eslint-enable no-var -- bodyless host ends here */
}

QUnit.test('destructuring: a prefix belongs to the receiver, never to lookalike default calls', assert => {
  const events = [];
  const array = [4, 9];
  function effect() { events.push('prefix'); }
  function fallback(row) {
    events.push('default');
    return function () { return this === row ? 17 : 0; };
  }
  assert.same(readPrefixedMethod(array, effect, fallback).call(array, -1), 9);
  assert.deepEqual(events, ['prefix'], 'a present method does not run its default');
  events.length = 0;
  const foreign = {
    get at() {
      events.push('read');
      return undefined;
    },
  };
  assert.same(readPrefixedMethod(foreign, effect, fallback).call(foreign), 17);
  assert.deepEqual(events, ['prefix', 'read', 'default', 'default'], 'the original prefix runs before the read once');
  events.length = 0;
  assert.same(readBodylessMethod(array, effect, fallback).call(array, -1), 9);
  assert.deepEqual(events, ['prefix'], 'a bodyless host carries its prefix once');
  events.length = 0;
  assert.same(readBodylessMethod(foreign, effect, fallback).call(foreign), 17);
  assert.deepEqual(events, ['prefix', 'read', 'default'], 'a bodyless default preserves its own branch');
});
