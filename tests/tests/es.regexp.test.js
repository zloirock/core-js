
QUnit.test('RegExp#test delegates to exec', assert => {
  const exec = function () {
    execCalled = true;
    return /./.exec.apply(this, arguments);
  };

  let execCalled = false;
  let re = /[ac]/;
  re.exec = exec;
  assert.true(re.test('abc'), '#1');
  assert.true(execCalled, '#2');

  re = /a/;
  // Not a function, should be ignored
  re.exec = 3;
  assert.true(re.test('abc'), '#3');

  re = /a/;
  // Does not return an object, should throw
  re.exec = () => 3;
  assert.throws(() => re.test('abc', '#4'));
});
