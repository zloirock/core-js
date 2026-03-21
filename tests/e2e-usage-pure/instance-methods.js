// Instance properties: test each type hint category

// hint: array
QUnit.test('instance/array: Array#at', assert => {
  assert.same([1, 2, 3].at(-1), 3);
  assert.same([1, 2, 3].at(0), 1);
});

QUnit.test('instance/array: Array#includes', assert => {
  assert.true([1, 2, 3].includes(2));
  assert.false([1, 2, 3].includes(4));
  assert.true([NaN].includes(NaN));
});

QUnit.test('instance/array: Array#filter', assert => {
  assert.deepEqual([1, 2, 3, 4].filter(x => x % 2), [1, 3]);
});

QUnit.test('instance/array: Array#find', assert => {
  assert.same([1, 2, 3].find(x => x > 1), 2);
  assert.same([1, 2, 3].find(x => x > 5), undefined);
});

QUnit.test('instance/array: Array#findIndex', assert => {
  assert.same([1, 2, 3].findIndex(x => x > 1), 1);
  assert.same([1, 2, 3].findIndex(x => x > 5), -1);
});

QUnit.test('instance/array: Array#findLast', assert => {
  assert.same([1, 2, 3].findLast(x => x < 3), 2);
});

QUnit.test('instance/array: Array#flat', assert => {
  assert.deepEqual([[1, 2], [3, [4]]].flat(), [1, 2, 3, [4]]);
  assert.deepEqual([[1, 2], [3, [4]]].flat(2), [1, 2, 3, 4]);
});

QUnit.test('instance/array: Array#flatMap', assert => {
  assert.deepEqual([1, 2, 3].flatMap(x => [x, x]), [1, 1, 2, 2, 3, 3]);
});

QUnit.test('instance/array: Array#toSorted', assert => {
  const arr = [3, 1, 2];
  const sorted = arr.toSorted();
  assert.deepEqual(sorted, [1, 2, 3]);
  assert.deepEqual(arr, [3, 1, 2], 'original unchanged');
});

QUnit.test('instance/array: Array#toReversed', assert => {
  const arr = [1, 2, 3];
  assert.deepEqual(arr.toReversed(), [3, 2, 1]);
  assert.deepEqual(arr, [1, 2, 3], 'original unchanged');
});

QUnit.test('instance/array: Array#with', assert => {
  assert.deepEqual([1, 2, 3].with(1, 42), [1, 42, 3]);
});

QUnit.test('instance/array: Array#reduce', assert => {
  assert.same(Math.sumPrecise([1, 2, 3]), 6);
});

QUnit.test('instance/array: Array#fill', assert => {
  assert.deepEqual([1, 2, 3].fill(0), [0, 0, 0]);
  assert.deepEqual([1, 2, 3].fill(9, 1, 2), [1, 9, 3]);
});

QUnit.test('instance/array: Array#entries/keys/values', assert => {
  assert.deepEqual(Array.from([10, 20].entries()), [[0, 10], [1, 20]]);
  assert.deepEqual(Array.from([10, 20].keys()), [0, 1]);
  assert.deepEqual(Array.from([10, 20].values()), [10, 20]);
});

// hint: string
QUnit.test('instance/string: String#at', assert => {
  assert.same('hello'.at(0), 'h');
  assert.same('hello'.at(-1), 'o');
});

QUnit.test('instance/string: String#includes', assert => {
  assert.true('abcd'.includes('bc'));
  assert.false('abcd'.includes('bc', 2));
});

QUnit.test('instance/string: String#startsWith', assert => {
  assert.true('hello'.startsWith('hel'));
  assert.false('hello'.startsWith('ell'));
});

QUnit.test('instance/string: String#endsWith', assert => {
  assert.true('hello'.endsWith('llo'));
  assert.false('hello'.endsWith('hel'));
});

QUnit.test('instance/string: String#trim', assert => {
  assert.same('  hello  '.trim(), 'hello');
});

QUnit.test('instance/string: String#trimStart/trimEnd', assert => {
  assert.same('  hello  '.trimStart(), 'hello  ');
  assert.same('  hello  '.trimEnd(), '  hello');
});

QUnit.test('instance/string: String#padStart/padEnd', assert => {
  assert.same('5'.padStart(3, '0'), '005');
  assert.same('5'.padEnd(3, '0'), '500');
});

QUnit.test('instance/string: String#repeat', assert => {
  assert.same('ab'.repeat(3), 'ababab');
  assert.same('x'.repeat(0), '');
});

QUnit.test('instance/string: String#replaceAll', assert => {
  assert.same('aabbcc'.replaceAll('b', 'x'), 'aaxxcc');
});

QUnit.test('instance/string: String#matchAll', assert => {
  const matches = Array.from('test1test2'.matchAll(/test(\d)/g));
  assert.same(matches.length, 2);
  assert.same(matches[0][1], '1');
  assert.same(matches[1][1], '2');
});

QUnit.test('instance/string: String#codePointAt', assert => {
  assert.same('A'.codePointAt(0), 65);
});

QUnit.test('instance/string: String#isWellFormed / toWellFormed', assert => {
  assert.true('hello'.isWellFormed());
  assert.false('\uD800'.isWellFormed());
  assert.same('\uD800'.toWellFormed(), '\uFFFD');
});

// hint: number (with min-args filter)
QUnit.test('instance/number: Number#toFixed (filter: min-args 1)', assert => {
  assert.same(1.005.toFixed(2), '1.00');
  assert.same(1.5.toFixed(0), '2');
});

QUnit.test('instance/number: Number#toExponential (filter: min-args 1)', assert => {
  assert.same((123456).toExponential(2), '1.23e+5');
});

// missing array methods
QUnit.test('instance/array: Array#findLastIndex', assert => {
  assert.same([1, 2, 3, 4].findLastIndex(x => x % 2 === 0), 3);
  assert.same([1, 2, 3].findLastIndex(x => x > 5), -1);
});

// hint: regexp
QUnit.test('instance/regexp: RegExp#flags', assert => {
  assert.same(/foo/gi.flags, 'gi');
});

// hint: function
QUnit.test('instance/function: Function#name', assert => {
  function hello() { /* empty */ }
  assert.same(hello.name, 'hello');
});

// hint: common (unknown receiver type — fallback)
QUnit.test('instance/common: unknown receiver .includes', assert => {
  function check(obj) {
    return obj.includes('a');
  }
  assert.true(check(['a', 'b']));
  assert.true(check('abc'));
  assert.false(check(['x', 'y']));
});

QUnit.test('instance/common: unknown receiver .at', assert => {
  function get(obj) {
    return obj.at(0);
  }
  assert.same(get([42]), 42);
  assert.same(get('hello'), 'h');
});

// string aliases (trimLeft/trimRight are legacy aliases for trimStart/trimEnd)
QUnit.test('instance/string: String#trimLeft/trimRight (aliases)', assert => {
  // eslint-disable-next-line unicorn/prefer-string-trim-start-end -- testing legacy aliases
  assert.same('  hi  '.trimLeft(), 'hi  ');
  // eslint-disable-next-line unicorn/prefer-string-trim-start-end -- testing legacy aliases
  assert.same('  hi  '.trimRight(), '  hi');
});
