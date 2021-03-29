QUnit.test('RegExp#exec lastIndex updating', assert => {
  let re = /b/;
  assert.strictEqual(re.lastIndex, 0, '.lastIndex starts at 0 for non-global regexps');
  re.exec('abc');
  assert.strictEqual(re.lastIndex, 0, '.lastIndex isn\'t updated for non-global regexps');

  re = /b/g;
  assert.strictEqual(re.lastIndex, 0, '.lastIndex starts at 0 for global regexps');
  re.exec('abc');
  assert.strictEqual(re.lastIndex, 2, '.lastIndex is updated for global regexps');

  re = /b*/;
  re.exec('a');
  assert.strictEqual(re.lastIndex, 0, '.lastIndex isn\'t updated for non-global regexps if the match is empty');

  re = /b*/g;
  re.exec('a');
  assert.strictEqual(re.lastIndex, 0, '.lastIndex isn\'t updated for global regexps if the match is empty');
});

QUnit.test('RegExp#exec capturing groups', assert => {
  assert.deepEqual(/(a?)/.exec('x'), ['', ''], '/(a?)/.exec("x") returns ["", ""]');
  assert.deepEqual(/(a)?/.exec('x'), ['', undefined], '/(a)?/.exec("x") returns ["", undefined]');

  // @nicolo-ribaudo: I don't know how to fix this in IE8. For the `/(a)?/` case it is fixed using
  // #replace, but here also #replace is buggy :(
  // assert.deepEqual(/(a?)?/.exec('x'), ['', undefined], '/(a?)?/.exec("x") returns ["", undefined]');
});

QUnit.test('RegExp#exec sticky', assert => {
  const re = new RegExp('a', 'y');
  const str = 'bbabaab';
  assert.strictEqual(re.lastIndex, 0, '#1');

  assert.strictEqual(re.exec(str), null, '#2');
  assert.strictEqual(re.lastIndex, 0, '#3');

  re.lastIndex = 1;
  assert.strictEqual(re.exec(str), null, '#4');
  assert.strictEqual(re.lastIndex, 0, '#5');

  re.lastIndex = 2;
  const result = re.exec(str);
  assert.deepEqual(result, ['a'], '#6');
  assert.strictEqual(result.index, 2, '#7');
  assert.strictEqual(re.lastIndex, 3, '#8');

  assert.strictEqual(re.exec(str), null, '#9');
  assert.strictEqual(re.lastIndex, 0, '#10');

  re.lastIndex = 4;
  assert.deepEqual(re.exec(str), ['a'], '#11');
  assert.strictEqual(re.lastIndex, 5, '#12');

  assert.deepEqual(re.exec(str), ['a'], '#13');
  assert.strictEqual(re.lastIndex, 6, '#14');

  assert.strictEqual(re.exec(str), null, '#15');
  assert.strictEqual(re.lastIndex, 0, '#16');
});
QUnit.test('RegExp#exec sticky anchored', assert => {
  const regex = new RegExp('^foo', 'y');
  assert.deepEqual(regex.exec('foo'), ['foo'], '#1');
  regex.lastIndex = 2;
  assert.strictEqual(regex.exec('..foo'), null, '#2');
  regex.lastIndex = 2;
  assert.strictEqual(regex.exec('.\nfoo'), null, '#3');

  const regex2 = new RegExp('^foo', 'my');
  regex2.lastIndex = 2;
  assert.strictEqual(regex2.exec('..foo'), null, '#4');
  regex2.lastIndex = 2;
  assert.deepEqual(regex2.exec('.\nfoo'), ['foo'], '#5');
  assert.strictEqual(regex2.lastIndex, 5, '#6');
});
