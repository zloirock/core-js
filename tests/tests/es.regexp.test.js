
QUnit.test('RegExp#test delegates to exec', assert => {
  const exec = function () {
    execCalled = true;
    return /./.exec.apply(this, arguments);
  };

  let execCalled = false;
  let re = /[ac]/;
  re.exec = exec;
  assert.strictEqual(re.test('abc'), true, '#1');
  assert.ok(execCalled, '#2');

  re = /a/;
  // Not a function, should be ignored
  re.exec = 3;
  assert.strictEqual(re.test('abc'), true, '#3');

  re = /a/;
  // Does not return an object, should throw
  re.exec = () => 3;
  assert.throws(() => re.test('abc', '#4'));
});
