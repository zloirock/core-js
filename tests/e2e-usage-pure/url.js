// URL and URLSearchParams
QUnit.test('URL constructor and properties', assert => {
  const url = new URL('https://user:pass@example.com:8080/path?q=1#hash');
  assert.same(url.protocol, 'https:');
  assert.same(url.username, 'user');
  assert.same(url.password, 'pass');
  assert.same(url.hostname, 'example.com');
  assert.same(url.port, '8080');
  assert.same(url.pathname, '/path');
  assert.same(url.search, '?q=1');
  assert.same(url.hash, '#hash');
});

QUnit.test('URL.parse', assert => {
  const url = URL.parse('https://example.com/path');
  assert.same(url.hostname, 'example.com');
  assert.same(URL.parse('invalid url'), null);
});

QUnit.test('URL.canParse', assert => {
  assert.true(URL.canParse('https://example.com'));
  assert.false(URL.canParse('not-a-url'));
  assert.true(URL.canParse('/path', 'https://example.com'));
});

QUnit.test('URL#toJSON / toString', assert => {
  const url = new URL('https://example.com/');
  assert.same(url.toJSON(), 'https://example.com/');
  assert.same(url.toString(), 'https://example.com/');
});

QUnit.test('URLSearchParams: get/set/has/delete/append', assert => {
  const params = new URLSearchParams('a=1&b=2&a=3');
  assert.same(params.get('a'), '1');
  assert.deepEqual(params.getAll('a'), ['1', '3']);
  assert.true(params.has('b'));
  params.set('b', '20');
  assert.same(params.get('b'), '20');
  params.delete('a');
  assert.false(params.has('a'));
  params.append('c', '4');
  assert.same(params.get('c'), '4');
});

QUnit.test('URLSearchParams: forEach', assert => {
  const params = new URLSearchParams('x=1&y=2');
  const result = [];
  params.forEach((v, k) => result.push(`${ k }=${ v }`));
  assert.deepEqual(result, ['x=1', 'y=2']);
});

QUnit.test('URLSearchParams: entries/keys/values', assert => {
  const params = new URLSearchParams('a=1&b=2');
  assert.deepEqual(Array.from(params.entries()), [['a', '1'], ['b', '2']]);
  assert.deepEqual(Array.from(params.keys()), ['a', 'b']);
  assert.deepEqual(Array.from(params.values()), ['1', '2']);
});
