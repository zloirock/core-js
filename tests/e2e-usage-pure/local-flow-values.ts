// Local joins keep the reaching family, live alternatives, and evaluation order.
QUnit.test('local flow: both arms replace the initializer', assert => {
  function read(flag: boolean) {
    let value: string | string[] = 'old';
    if (flag) value = ['ab'];
    else value = ['cd'];
    return value.at(0);
  }
  assert.same(read(true), 'ab');
  assert.same(read(false), 'cd');
});

QUnit.test('local flow: a missing write retains the input', assert => {
  function read(flag: boolean) {
    let value: string | string[] = 'ab';
    if (flag) value = ['cd'];
    return value.at(0);
  }
  assert.same(read(false), 'a');
  assert.same(read(true), 'cd');
});

QUnit.test('local flow: a later complete join replaces the previous join', assert => {
  function read(first: boolean, second: boolean) {
    let value: string | string[];
    if (first) value = ['old'];
    else value = 'old';
    if (second) value = 'ab';
    else value = 'cd';
    return value.at(0);
  }
  assert.same(read(true, false), 'c');
  assert.same(read(false, true), 'a');
});

QUnit.test('local flow: an opaque value stays in the join', assert => {
  function read(flag: boolean, source: () => string | string[]) {
    let value: string | string[] = 'ab';
    if (flag) value = source();
    return value.at(0);
  }
  assert.same(read(true, () => ['cd']), 'cd');
  assert.same(read(true, () => 'cd'), 'c');
  assert.same(read(false, () => ['cd']), 'a');
});

QUnit.test('local flow: closure writes are not bounded by their source position', assert => {
  function read(flag: boolean) {
    let value: string | string[];
    if (flag) value = 'ab';
    else value = 'cd';
    function mutate() { value = ['ef']; }
    mutate();
    return value.at(0);
  }
  assert.same(read(true), 'ef');
  assert.same(read(false), 'ef');
});

QUnit.test('local flow: nullish arms skip keys and arguments', assert => {
  const effects: string[] = [];
  function read(flag: boolean) {
    let value: string | null | undefined;
    if (flag) value = 'ab';
    else value = undefined;
    return value?.[(effects.push('key'), 'at')]((effects.push('argument'), 0));
  }
  assert.same(read(false), undefined);
  assert.deepEqual(effects, []);
  assert.same(read(true), 'a');
  assert.deepEqual(effects, ['key', 'argument']);
});

QUnit.test('local flow: defaults distinguish null from undefined', assert => {
  function read(flag: boolean) {
    let value: string | null | undefined;
    if (flag) value = null;
    else value = undefined;
    const [answer = 'default'] = [value];
    return answer === null ? null : answer.at(0);
  }
  assert.same(read(true), null);
  assert.same(read(false), 'd');
});
