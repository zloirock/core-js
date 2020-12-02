import { createIterable } from '../helpers/helpers';

QUnit.test('URLSearchParams', assert => {
  assert.isFunction(URLSearchParams);
  assert.arity(URLSearchParams, 0);
  assert.name(URLSearchParams, 'URLSearchParams');
  assert.looksNative(URLSearchParams);

  assert.same(String(new URLSearchParams()), '');
  assert.same(String(new URLSearchParams('')), '');
  assert.same(String(new URLSearchParams('a=b')), 'a=b');
  assert.same(String(new URLSearchParams(new URLSearchParams('a=b'))), 'a=b');
  assert.same(String(new URLSearchParams([])), '');
  assert.same(String(new URLSearchParams([[1, 2], ['a', 'b']])), '1=2&a=b');
  assert.same(String(new URLSearchParams(createIterable([createIterable(['a', 'b']), createIterable(['c', 'd'])]))), 'a=b&c=d');
  assert.same(String(new URLSearchParams({})), '');
  assert.same(String(new URLSearchParams({ 1: 2, a: 'b' })), '1=2&a=b');

  assert.same(String(new URLSearchParams('?a=b')), 'a=b', 'leading ? should be ignored');
  assert.same(String(new URLSearchParams('??a=b')), '%3Fa=b');
  assert.same(String(new URLSearchParams('?')), '');
  assert.same(String(new URLSearchParams('??')), '%3F=');

  assert.same(String(new URLSearchParams('a=b c')), 'a=b+c');
  assert.same(String(new URLSearchParams('a=b&b=c&a=d')), 'a=b&b=c&a=d');

  assert.same(String(new URLSearchParams('a==')), 'a=%3D');
  assert.same(String(new URLSearchParams('a=b=')), 'a=b%3D');
  assert.same(String(new URLSearchParams('a=b=c')), 'a=b%3Dc');
  assert.same(String(new URLSearchParams('a==b')), 'a=%3Db');

  let params = new URLSearchParams('a=b');
  assert.same(params.has('a'), true, 'search params object has name "a"');
  assert.same(params.has('b'), false, 'search params object has not got name "b"');

  params = new URLSearchParams('a=b&c');
  assert.same(params.has('a'), true, 'search params object has name "a"');
  assert.same(params.has('c'), true, 'search params object has name "c"');

  params = new URLSearchParams('&a&&& &&&&&a+b=& c&m%c3%b8%c3%b8');
  assert.same(params.has('a'), true, 'search params object has name "a"');
  assert.same(params.has('a b'), true, 'search params object has name "a b"');
  assert.same(params.has(' '), true, 'search params object has name " "');
  assert.same(params.has('c'), false, 'search params object did not have the name "c"');
  assert.same(params.has(' c'), true, 'search params object has name " c"');
  assert.same(params.has('møø'), true, 'search params object has name "møø"');

  params = new URLSearchParams('a=b+c');
  assert.same(params.get('a'), 'b c', 'parse +');
  params = new URLSearchParams('a+b=c');
  assert.same(params.get('a b'), 'c', 'parse +');

  params = new URLSearchParams('a=b c');
  assert.same(params.get('a'), 'b c', 'parse " "');
  params = new URLSearchParams('a b=c');
  assert.same(params.get('a b'), 'c', 'parse " "');

  params = new URLSearchParams('a=b%20c');
  assert.same(params.get('a'), 'b c', 'parse %20');
  params = new URLSearchParams('a%20b=c');
  assert.same(params.get('a b'), 'c', 'parse %20');

  params = new URLSearchParams('a=b\0c');
  assert.same(params.get('a'), 'b\0c', 'parse \\0');
  params = new URLSearchParams('a\0b=c');
  assert.same(params.get('a\0b'), 'c', 'parse \\0');

  params = new URLSearchParams('a=b%00c');
  assert.same(params.get('a'), 'b\0c', 'parse %00');
  params = new URLSearchParams('a%00b=c');
  assert.same(params.get('a\0b'), 'c', 'parse %00');

  params = new URLSearchParams('a=b\u2384');
  assert.same(params.get('a'), 'b\u2384', 'parse \u2384');
  params = new URLSearchParams('a\u2384b=c');
  assert.same(params.get('a\u2384b'), 'c', 'parse \u2384');

  params = new URLSearchParams('a=b%e2%8e%84');
  assert.same(params.get('a'), 'b\u2384', 'parse %e2%8e%84');
  params = new URLSearchParams('a%e2%8e%84b=c');
  assert.same(params.get('a\u2384b'), 'c', 'parse %e2%8e%84');

  params = new URLSearchParams('a=b\uD83D\uDCA9c');
  assert.same(params.get('a'), 'b\uD83D\uDCA9c', 'parse \uD83D\uDCA9');
  params = new URLSearchParams('a\uD83D\uDCA9b=c');
  assert.same(params.get('a\uD83D\uDCA9b'), 'c', 'parse \uD83D\uDCA9');

  params = new URLSearchParams('a=b%f0%9f%92%a9c');
  assert.same(params.get('a'), 'b\uD83D\uDCA9c', 'parse %f0%9f%92%a9');
  params = new URLSearchParams('a%f0%9f%92%a9b=c');
  assert.same(params.get('a\uD83D\uDCA9b'), 'c', 'parse %f0%9f%92%a9');

  params = new URLSearchParams();
  params.set('query', '+15555555555');
  assert.same(params.toString(), 'query=%2B15555555555');
  assert.same(params.get('query'), '+15555555555', 'parse encoded +');
  params = new URLSearchParams(params.toString());
  assert.same(params.get('query'), '+15555555555', 'parse encoded +');

  const testData = [
    { input: '?a=%', output: [['a', '%']], name: 'handling %' },
    { input: { '+': '%C2' }, output: [['+', '%C2']], name: 'object with +' },
    { input: { c: 'x', a: '?' }, output: [['c', 'x'], ['a', '?']], name: 'object with two keys' },
    { input: [['c', 'x'], ['a', '?']], output: [['c', 'x'], ['a', '?']], name: 'array with two keys' },
    // eslint-disable-next-line max-len -- ignore
    // !!! { input: { 'a\0b': '42', 'c\uD83D': '23', dሴ: 'foo' }, output: [['a\0b', '42'], ['c\uFFFD', '23'], ['d\u1234', 'foo']], name: 'object with NULL, non-ASCII, and surrogate keys' },
  ];

  for (const { input, output, name } of testData) {
    params = new URLSearchParams(input);
    let i = 0;
    params.forEach((value, key) => {
      const [reqKey, reqValue] = output[i++];
      assert.same(key, reqKey, `construct with ${ name }`);
      assert.same(value, reqValue, `construct with ${ name }`);
    });
  }

  assert.throws(() => {
    URLSearchParams('');
  }, 'throws w/o `new`');

  assert.throws(() => {
    new URLSearchParams([[1, 2, 3]]);
  }, 'sequence elements must be pairs #1');

  assert.throws(() => {
    new URLSearchParams([createIterable([createIterable([1, 2, 3])])]);
  }, 'sequence elements must be pairs #2');

  assert.throws(() => {
    new URLSearchParams([[1]]);
  }, 'sequence elements must be pairs #3');

  assert.throws(() => {
    new URLSearchParams([createIterable([createIterable([1])])]);
  }, 'sequence elements must be pairs #4');
});

QUnit.test('URLSearchParams#append', assert => {
  const { append } = URLSearchParams.prototype;
  assert.isFunction(append);
  assert.arity(append, 2);
  assert.name(append, 'append');
  assert.enumerable(URLSearchParams.prototype, 'append');
  assert.looksNative(append);

  assert.same(new URLSearchParams().append('a', 'b'), undefined, 'void');

  let params = new URLSearchParams();
  params.append('a', 'b');
  assert.same(String(params), 'a=b');
  params.append('a', 'b');
  assert.same(String(params), 'a=b&a=b');
  params.append('a', 'c');
  assert.same(String(params), 'a=b&a=b&a=c');

  params = new URLSearchParams();
  params.append('', '');
  assert.same(String(params), '=');
  params.append('', '');
  assert.same(String(params), '=&=');

  params = new URLSearchParams();
  params.append(undefined, undefined);
  assert.same(String(params), 'undefined=undefined');
  params.append(undefined, undefined);
  assert.same(String(params), 'undefined=undefined&undefined=undefined');

  params = new URLSearchParams();
  params.append(null, null);
  assert.same(String(params), 'null=null');
  params.append(null, null);
  assert.same(String(params), 'null=null&null=null');

  params = new URLSearchParams();
  params.append('first', 1);
  params.append('second', 2);
  params.append('third', '');
  params.append('first', 10);
  assert.ok(params.has('first'), 'search params object has name "first"');
  assert.same(params.get('first'), '1', 'search params object has name "first" with value "1"');
  assert.same(params.get('second'), '2', 'search params object has name "second" with value "2"');
  assert.same(params.get('third'), '', 'search params object has name "third" with value ""');
  params.append('first', 10);
  assert.same(params.get('first'), '1', 'search params object has name "first" with value "1"');

  assert.throws(() => {
    return new URLSearchParams('').append();
  }, 'throws w/o arguments');
});

QUnit.test('URLSearchParams#delete', assert => {
  const $delete = URLSearchParams.prototype.delete;
  assert.isFunction($delete);
  assert.arity($delete, 1);
  assert.enumerable(URLSearchParams.prototype, 'delete');
  assert.looksNative($delete);

  let params = new URLSearchParams('a=b&c=d');
  params.delete('a');
  assert.same(String(params), 'c=d');

  params = new URLSearchParams('a=a&b=b&a=a&c=c');
  params.delete('a');
  assert.same(String(params), 'b=b&c=c');

  params = new URLSearchParams('a=a&=&b=b&c=c');
  params.delete('');
  assert.same(String(params), 'a=a&b=b&c=c');

  params = new URLSearchParams('a=a&null=null&b=b');
  params.delete(null);
  assert.same(String(params), 'a=a&b=b');

  params = new URLSearchParams('a=a&undefined=undefined&b=b');
  params.delete(undefined);
  assert.same(String(params), 'a=a&b=b');

  params = new URLSearchParams();
  params.append('first', 1);
  assert.same(params.has('first'), true, 'search params object has name "first"');
  assert.same(params.get('first'), '1', 'search params object has name "first" with value "1"');
  params.delete('first');
  assert.same(params.has('first'), false, 'search params object has no "first" name');
  params.append('first', 1);
  params.append('first', 10);
  params.delete('first');
  assert.same(params.has('first'), false, 'search params object has no "first" name');

  let url = new URL('http://example.com/?param1&param2');
  url.searchParams.delete('param1');
  url.searchParams.delete('param2');
  assert.same(String(url), 'http://example.com/', 'url.href does not have ?');
  assert.same(url.search, '', 'url.search does not have ?');

  url = new URL('http://example.com/?');
  url.searchParams.delete('param1');
  // assert.same(String(url), 'http://example.com/', 'url.href does not have ?'); // Safari bug
  assert.same(url.search, '', 'url.search does not have ?');

  assert.throws(() => {
    return new URLSearchParams('').delete();
  }, 'throws w/o arguments');
});

QUnit.test('URLSearchParams#get', assert => {
  const { get } = URLSearchParams.prototype;
  assert.isFunction(get);
  assert.arity(get, 1);
  assert.name(get, 'get');
  assert.enumerable(URLSearchParams.prototype, 'get');
  assert.looksNative(get);

  let params = new URLSearchParams('a=b&c=d');
  assert.same(params.get('a'), 'b');
  assert.same(params.get('c'), 'd');
  assert.same(params.get('e'), null);

  params = new URLSearchParams('a=b&c=d&a=e');
  assert.same(params.get('a'), 'b');

  params = new URLSearchParams('=b&c=d');
  assert.same(params.get(''), 'b');

  params = new URLSearchParams('a=&c=d&a=e');
  assert.same(params.get('a'), '');

  params = new URLSearchParams('first=second&third&&');
  assert.same(params.has('first'), true, 'Search params object has name "first"');
  assert.same(params.get('first'), 'second', 'Search params object has name "first" with value "second"');
  assert.same(params.get('third'), '', 'Search params object has name "third" with the empty value.');
  assert.same(params.get('fourth'), null, 'Search params object has no "fourth" name and value.');

  assert.same(new URLSearchParams('a=b c').get('a'), 'b c');
  assert.same(new URLSearchParams('a b=c').get('a b'), 'c');

  assert.same(new URLSearchParams('a=b%20c').get('a'), 'b c', 'parse %20');
  assert.same(new URLSearchParams('a%20b=c').get('a b'), 'c', 'parse %20');

  assert.same(new URLSearchParams('a=b\0c').get('a'), 'b\0c', 'parse \\0');
  assert.same(new URLSearchParams('a\0b=c').get('a\0b'), 'c', 'parse \\0');

  assert.same(new URLSearchParams('a=b%2Bc').get('a'), 'b+c', 'parse %2B');
  assert.same(new URLSearchParams('a%2Bb=c').get('a+b'), 'c', 'parse %2B');

  assert.same(new URLSearchParams('a=b%00c').get('a'), 'b\0c', 'parse %00');
  assert.same(new URLSearchParams('a%00b=c').get('a\0b'), 'c', 'parse %00');

  assert.same(new URLSearchParams('a==').get('a'), '=', 'parse =');
  assert.same(new URLSearchParams('a=b=').get('a'), 'b=', 'parse =');
  assert.same(new URLSearchParams('a=b=c').get('a'), 'b=c', 'parse =');
  assert.same(new URLSearchParams('a==b').get('a'), '=b', 'parse =');

  assert.same(new URLSearchParams('a=b\u2384').get('a'), 'b\u2384', 'parse \\u2384');
  assert.same(new URLSearchParams('a\u2384b=c').get('a\u2384b'), 'c', 'parse \\u2384');

  assert.same(new URLSearchParams('a=b%e2%8e%84').get('a'), 'b\u2384', 'parse %e2%8e%84');
  assert.same(new URLSearchParams('a%e2%8e%84b=c').get('a\u2384b'), 'c', 'parse %e2%8e%84');

  assert.same(new URLSearchParams('a=b\uD83D\uDCA9c').get('a'), 'b\uD83D\uDCA9c', 'parse \\uD83D\\uDCA9');
  assert.same(new URLSearchParams('a\uD83D\uDCA9b=c').get('a\uD83D\uDCA9b'), 'c', 'parse \\uD83D\\uDCA9');

  assert.same(new URLSearchParams('a=b%f0%9f%92%a9c').get('a'), 'b\uD83D\uDCA9c', 'parse %f0%9f%92%a9');
  assert.same(new URLSearchParams('a%f0%9f%92%a9b=c').get('a\uD83D\uDCA9b'), 'c', 'parse %f0%9f%92%a9');

  assert.same(new URLSearchParams('=').get(''), '', 'parse =');

  assert.throws(() => {
    return new URLSearchParams('').get();
  }, 'throws w/o arguments');
});

QUnit.test('URLSearchParams#getAll', assert => {
  const { getAll } = URLSearchParams.prototype;
  assert.isFunction(getAll);
  assert.arity(getAll, 1);
  assert.name(getAll, 'getAll');
  assert.enumerable(URLSearchParams.prototype, 'getAll');
  assert.looksNative(getAll);

  let params = new URLSearchParams('a=b&c=d');
  assert.arrayEqual(params.getAll('a'), ['b']);
  assert.arrayEqual(params.getAll('c'), ['d']);
  assert.arrayEqual(params.getAll('e'), []);

  params = new URLSearchParams('a=b&c=d&a=e');
  assert.arrayEqual(params.getAll('a'), ['b', 'e']);

  params = new URLSearchParams('=b&c=d');
  assert.arrayEqual(params.getAll(''), ['b']);

  params = new URLSearchParams('a=&c=d&a=e');
  assert.arrayEqual(params.getAll('a'), ['', 'e']);

  params = new URLSearchParams('a=1&a=2&a=3&a');
  assert.arrayEqual(params.getAll('a'), ['1', '2', '3', ''], 'search params object has expected name "a" values');
  params.set('a', 'one');
  assert.arrayEqual(params.getAll('a'), ['one'], 'search params object has expected name "a" values');

  assert.throws(() => {
    return new URLSearchParams('').getAll();
  }, 'throws w/o arguments');
});

QUnit.test('URLSearchParams#has', assert => {
  const { has } = URLSearchParams.prototype;
  assert.isFunction(has);
  assert.arity(has, 1);
  assert.name(has, 'has');
  assert.enumerable(URLSearchParams.prototype, 'has');
  assert.looksNative(has);

  let params = new URLSearchParams('a=b&c=d');
  assert.same(params.has('a'), true);
  assert.same(params.has('c'), true);
  assert.same(params.has('e'), false);

  params = new URLSearchParams('a=b&c=d&a=e');
  assert.same(params.has('a'), true);

  params = new URLSearchParams('=b&c=d');
  assert.same(params.has(''), true);

  params = new URLSearchParams('null=a');
  assert.same(params.has(null), true);

  params = new URLSearchParams('a=b&c=d&&');
  params.append('first', 1);
  params.append('first', 2);
  assert.same(params.has('a'), true, 'search params object has name "a"');
  assert.same(params.has('c'), true, 'search params object has name "c"');
  assert.same(params.has('first'), true, 'search params object has name "first"');
  assert.same(params.has('d'), false, 'search params object has no name "d"');
  params.delete('first');
  assert.same(params.has('first'), false, 'search params object has no name "first"');

  assert.throws(() => {
    return new URLSearchParams('').has();
  }, 'throws w/o arguments');
});

QUnit.test('URLSearchParams#set', assert => {
  const { set } = URLSearchParams.prototype;
  assert.isFunction(set);
  assert.arity(set, 2);
  assert.name(set, 'set');
  assert.enumerable(URLSearchParams.prototype, 'set');
  assert.looksNative(set);

  let params = new URLSearchParams('a=b&c=d');
  params.set('a', 'B');
  assert.same(String(params), 'a=B&c=d');

  params = new URLSearchParams('a=b&c=d&a=e');
  params.set('a', 'B');
  assert.same(String(params), 'a=B&c=d');
  params.set('e', 'f');
  assert.same(String(params), 'a=B&c=d&e=f');

  params = new URLSearchParams('a=1&a=2&a=3');
  assert.same(params.has('a'), true, 'search params object has name "a"');
  assert.same(params.get('a'), '1', 'search params object has name "a" with value "1"');
  params.set('first', 4);
  assert.same(params.has('a'), true, 'search params object has name "a"');
  assert.same(params.get('a'), '1', 'search params object has name "a" with value "1"');
  assert.same(String(params), 'a=1&a=2&a=3&first=4');
  params.set('a', 4);
  assert.same(params.has('a'), true, 'search params object has name "a"');
  assert.same(params.get('a'), '4', 'search params object has name "a" with value "4"');
  assert.same(String(params), 'a=4&first=4');

  assert.throws(() => {
    return new URLSearchParams('').set();
  }, 'throws w/o arguments');
});

QUnit.test('URLSearchParams#sort', assert => {
  const { sort } = URLSearchParams.prototype;
  assert.isFunction(sort);
  assert.arity(sort, 0);
  assert.name(sort, 'sort');
  assert.enumerable(URLSearchParams.prototype, 'sort');
  assert.looksNative(sort);

  let params = new URLSearchParams('a=1&b=4&a=3&b=2');
  params.sort();
  assert.same(String(params), 'a=1&a=3&b=4&b=2');
  params.delete('a');
  params.append('a', '0');
  params.append('b', '0');
  params.sort();
  assert.same(String(params), 'a=0&b=4&b=2&b=0');

  const testData = [
    {
      input: 'z=b&a=b&z=a&a=a',
      output: [['a', 'b'], ['a', 'a'], ['z', 'b'], ['z', 'a']],
    },
    {
      input: '\uFFFD=x&\uFFFC&\uFFFD=a',
      output: [['\uFFFC', ''], ['\uFFFD', 'x'], ['\uFFFD', 'a']],
    },
    {
      input: 'ﬃ&🌈', // 🌈 > code point, but < code unit because two code units
      output: [['🌈', ''], ['ﬃ', '']],
    },
    {
      input: 'é&e\uFFFD&e\u0301',
      output: [['e\u0301', ''], ['e\uFFFD', ''], ['é', '']],
    },
    {
      input: 'z=z&a=a&z=y&a=b&z=x&a=c&z=w&a=d&z=v&a=e&z=u&a=f&z=t&a=g',
      output: [
        ['a', 'a'],
        ['a', 'b'],
        ['a', 'c'],
        ['a', 'd'],
        ['a', 'e'],
        ['a', 'f'],
        ['a', 'g'],
        ['z', 'z'],
        ['z', 'y'],
        ['z', 'x'],
        ['z', 'w'],
        ['z', 'v'],
        ['z', 'u'],
        ['z', 't'],
      ],
    },
    {
      input: 'bbb&bb&aaa&aa=x&aa=y',
      output: [['aa', 'x'], ['aa', 'y'], ['aaa', ''], ['bb', ''], ['bbb', '']],
    },
    {
      input: 'z=z&=f&=t&=x',
      output: [['', 'f'], ['', 't'], ['', 'x'], ['z', 'z']],
    },
    {
      input: 'a🌈&a💩',
      output: [['a🌈', ''], ['a💩', '']],
    },
  ];

  for (const { input, output } of testData) {
    let i = 0;
    params = new URLSearchParams(input);
    params.sort();
    params.forEach((value, key) => {
      const [reqKey, reqValue] = output[i++];
      assert.same(key, reqKey);
      assert.same(value, reqValue);
    });

    i = 0;
    const url = new URL(`?${ input }`, 'https://example/');
    params = url.searchParams;
    params.sort();
    params.forEach((value, key) => {
      const [reqKey, reqValue] = output[i++];
      assert.same(key, reqKey);
      assert.same(value, reqValue);
    });
  }

  const url = new URL('http://example.com/?');
  url.searchParams.sort();
  assert.same(url.href, 'http://example.com/', 'Sorting non-existent params removes ? from URL');
  assert.same(url.search, '', 'Sorting non-existent params removes ? from URL');
});

QUnit.test('URLSearchParams#toString', assert => {
  const { toString } = URLSearchParams.prototype;
  assert.isFunction(toString);
  assert.arity(toString, 0);
  assert.name(toString, 'toString');
  assert.looksNative(toString);

  let params = new URLSearchParams();
  params.append('a', 'b c');
  assert.same(String(params), 'a=b+c');
  params.delete('a');
  params.append('a b', 'c');
  assert.same(String(params), 'a+b=c');

  params = new URLSearchParams();
  params.append('a', '');
  assert.same(String(params), 'a=');
  params.append('a', '');
  assert.same(String(params), 'a=&a=');
  params.append('', 'b');
  assert.same(String(params), 'a=&a=&=b');
  params.append('', '');
  assert.same(String(params), 'a=&a=&=b&=');
  params.append('', '');
  assert.same(String(params), 'a=&a=&=b&=&=');

  params = new URLSearchParams();
  params.append('', 'b');
  assert.same(String(params), '=b');
  params.append('', 'b');
  assert.same(String(params), '=b&=b');

  params = new URLSearchParams();
  params.append('', '');
  assert.same(String(params), '=');
  params.append('', '');
  assert.same(String(params), '=&=');

  params = new URLSearchParams();
  params.append('a', 'b+c');
  assert.same(String(params), 'a=b%2Bc');
  params.delete('a');
  params.append('a+b', 'c');
  assert.same(String(params), 'a%2Bb=c');

  params = new URLSearchParams();
  params.append('=', 'a');
  assert.same(String(params), '%3D=a');
  params.append('b', '=');
  assert.same(String(params), '%3D=a&b=%3D');

  params = new URLSearchParams();
  params.append('&', 'a');
  assert.same(String(params), '%26=a');
  params.append('b', '&');
  assert.same(String(params), '%26=a&b=%26');

  params = new URLSearchParams();
  params.append('a', '\r');
  assert.same(String(params), 'a=%0D');

  params = new URLSearchParams();
  params.append('a', '\n');
  assert.same(String(params), 'a=%0A');

  params = new URLSearchParams();
  params.append('a', '\r\n');
  assert.same(String(params), 'a=%0D%0A');

  params = new URLSearchParams();
  params.append('a', 'b%c');
  assert.same(String(params), 'a=b%25c');
  params.delete('a');
  params.append('a%b', 'c');
  assert.same(String(params), 'a%25b=c');

  params = new URLSearchParams();
  params.append('a', 'b\0c');
  assert.same(String(params), 'a=b%00c');
  params.delete('a');
  params.append('a\0b', 'c');
  assert.same(String(params), 'a%00b=c');

  params = new URLSearchParams();
  params.append('a', 'b\uD83D\uDCA9c');
  assert.same(String(params), 'a=b%F0%9F%92%A9c');
  params.delete('a');
  params.append('a\uD83D\uDCA9b', 'c');
  assert.same(String(params), 'a%F0%9F%92%A9b=c');

  params = new URLSearchParams('a=b&c=d&&e&&');
  assert.same(String(params), 'a=b&c=d&e=');
  params = new URLSearchParams('a = b &a=b&c=d%20');
  assert.same(String(params), 'a+=+b+&a=b&c=d+');
  params = new URLSearchParams('a=&a=b');
  assert.same(String(params), 'a=&a=b');
});

QUnit.test('URLSearchParams#forEach', assert => {
  const { forEach } = URLSearchParams.prototype;
  assert.isFunction(forEach);
  assert.arity(forEach, 1);
  assert.name(forEach, 'forEach');
  assert.enumerable(URLSearchParams.prototype, 'forEach');
  assert.looksNative(forEach);

  const expectedValues = { a: '1', b: '2', c: '3' };
  let params = new URLSearchParams('a=1&b=2&c=3');
  let result = '';
  params.forEach((value, key, that) => {
    assert.same(params.get(key), expectedValues[key]);
    assert.same(value, expectedValues[key]);
    assert.same(that, params);
    result += key;
  });
  assert.same(result, 'abc');

  new URL('http://a.b/c').searchParams.forEach(() => {
    assert.ok(false, 'should not be called');
  });

  // fails in Chrome 66-
  const url = new URL('http://a.b/c?a=1&b=2&c=3&d=4');
  params = url.searchParams;
  result = '';
  params.forEach((val, key) => {
    url.search = 'x=1&y=2&z=3';
    result += key + val;
  });
  assert.same(result, 'a1y2z3');

  // fails in Chrome 66-
  params = new URLSearchParams('a=1&b=2&c=3');
  result = '';
  params.forEach((value, key) => {
    params.delete('b');
    result += key + value;
  });
  assert.same(result, 'a1c3');
});

QUnit.test('URLSearchParams#entries', assert => {
  const { entries } = URLSearchParams.prototype;
  assert.isFunction(entries);
  assert.arity(entries, 0);
  assert.name(entries, 'entries');
  assert.enumerable(URLSearchParams.prototype, 'entries');
  assert.looksNative(entries);

  const expectedValues = { a: '1', b: '2', c: '3' };
  let params = new URLSearchParams('a=1&b=2&c=3');
  let iterator = params.entries();
  let result = '';
  let entry;
  while (!(entry = iterator.next()).done) {
    const [key, value] = entry.value;
    assert.same(params.get(key), expectedValues[key]);
    assert.same(value, expectedValues[key]);
    result += key;
  }
  assert.same(result, 'abc');

  assert.ok(new URL('http://a.b/c').searchParams.entries().next().done, 'should be finished');

  // fails in Chrome 66-
  const url = new URL('http://a.b/c?a=1&b=2&c=3&d=4');
  iterator = url.searchParams.entries();
  result = '';
  while (!(entry = iterator.next()).done) {
    const [key, value] = entry.value;
    url.search = 'x=1&y=2&z=3';
    result += key + value;
  }
  assert.same(result, 'a1y2z3');

  // fails in Chrome 66-
  params = new URLSearchParams('a=1&b=2&c=3');
  iterator = params.entries();
  result = '';
  while (!(entry = iterator.next()).done) {
    params.delete('b');
    const [key, value] = entry.value;
    result += key + value;
  }
  assert.same(result, 'a1c3');
});

QUnit.test('URLSearchParams#keys', assert => {
  const { keys } = URLSearchParams.prototype;
  assert.isFunction(keys);
  assert.arity(keys, 0);
  assert.name(keys, 'keys');
  assert.enumerable(URLSearchParams.prototype, 'keys');
  assert.looksNative(keys);

  let iterator = new URLSearchParams('a=1&b=2&c=3').keys();
  let result = '';
  let entry;
  while (!(entry = iterator.next()).done) {
    result += entry.value;
  }
  assert.same(result, 'abc');

  assert.ok(new URL('http://a.b/c').searchParams.keys().next().done, 'should be finished');

  // fails in Chrome 66-
  const url = new URL('http://a.b/c?a=1&b=2&c=3&d=4');
  iterator = url.searchParams.keys();
  result = '';
  while (!(entry = iterator.next()).done) {
    const key = entry.value;
    url.search = 'x=1&y=2&z=3';
    result += key;
  }
  assert.same(result, 'ayz');

  // fails in Chrome 66-
  const params = new URLSearchParams('a=1&b=2&c=3');
  iterator = params.keys();
  result = '';
  while (!(entry = iterator.next()).done) {
    params.delete('b');
    const key = entry.value;
    result += key;
  }
  assert.same(result, 'ac');
});

QUnit.test('URLSearchParams#values', assert => {
  const { values } = URLSearchParams.prototype;
  assert.isFunction(values);
  assert.arity(values, 0);
  assert.name(values, 'values');
  assert.enumerable(URLSearchParams.prototype, 'values');
  assert.looksNative(values);

  let iterator = new URLSearchParams('a=1&b=2&c=3').values();
  let result = '';
  let entry;
  while (!(entry = iterator.next()).done) {
    result += entry.value;
  }
  assert.same(result, '123');

  assert.ok(new URL('http://a.b/c').searchParams.values().next().done, 'should be finished');

  // fails in Chrome 66-
  const url = new URL('http://a.b/c?a=a&b=b&c=c&d=d');
  iterator = url.searchParams.keys();
  result = '';
  while (!(entry = iterator.next()).done) {
    const { value } = entry;
    url.search = 'x=x&y=y&z=z';
    result += value;
  }
  assert.same(result, 'ayz');

  // fails in Chrome 66-
  const params = new URLSearchParams('a=1&b=2&c=3');
  iterator = params.values();
  result = '';
  while (!(entry = iterator.next()).done) {
    params.delete('b');
    const key = entry.value;
    result += key;
  }
  assert.same(result, '13');
});

QUnit.test('URLSearchParams#@@iterator', assert => {
  const entries = URLSearchParams.prototype[Symbol.iterator];
  assert.isFunction(entries);
  assert.arity(entries, 0);
  assert.name(entries, 'entries');
  assert.looksNative(entries);

  assert.same(entries, URLSearchParams.prototype.entries);

  const expectedValues = { a: '1', b: '2', c: '3' };
  let params = new URLSearchParams('a=1&b=2&c=3');
  let iterator = params[Symbol.iterator]();
  let result = '';
  let entry;
  while (!(entry = iterator.next()).done) {
    const [key, value] = entry.value;
    assert.same(params.get(key), expectedValues[key]);
    assert.same(value, expectedValues[key]);
    result += key;
  }
  assert.same(result, 'abc');

  assert.ok(new URL('http://a.b/c').searchParams[Symbol.iterator]().next().done, 'should be finished');

  // fails in Chrome 66-
  const url = new URL('http://a.b/c?a=1&b=2&c=3&d=4');
  iterator = url.searchParams[Symbol.iterator]();
  result = '';
  while (!(entry = iterator.next()).done) {
    const [key, value] = entry.value;
    url.search = 'x=1&y=2&z=3';
    result += key + value;
  }
  assert.same(result, 'a1y2z3');

  // fails in Chrome 66-
  params = new URLSearchParams('a=1&b=2&c=3');
  iterator = params[Symbol.iterator]();
  result = '';
  while (!(entry = iterator.next()).done) {
    params.delete('b');
    const [key, value] = entry.value;
    result += key + value;
  }
  assert.same(result, 'a1c3');
});

QUnit.test('URLSearchParams#@@toStringTag', assert => {
  const params = new URLSearchParams('a=b');
  assert.same(({}).toString.call(params), '[object URLSearchParams]');
});
