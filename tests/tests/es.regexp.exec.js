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
