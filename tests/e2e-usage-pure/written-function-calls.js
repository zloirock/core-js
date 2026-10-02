/* eslint-disable sonarjs/prefer-object-literal -- the tests require later slot writes */

QUnit.test('written function calls retain returns and pair each invocation with its arguments', assert => {
  const box = {};
  box.fn = value => value;
  assert.same(box.fn([8, 9]).at(-1), 9);
  assert.true(box.fn('abcd').includes('bc'));

  function make() { return [3, 4]; }
  const named = {};
  const alias = named;
  alias.fn = make;
  assert.same(named.fn().at(-1), 4);

  const method = { fn() { return [1]; } };
  method.fn = () => [5, 6];
  assert.same(method.fn().at(-1), 6);

  const defaults = {};
  defaults.fn = (value = [8, 9]) => value;
  assert.same(defaults.fn(undefined).at(-1), 9);
  const empty = undefined;
  assert.same(defaults.fn(empty).at(-1), 9);
  defaults.fn = ({ rows } = { rows: [5, 6] }) => rows;
  assert.same(defaults.fn(undefined).at(-1), 6);
});

QUnit.test('written function calls keep divergent returns and receiver handouts conservative', assert => {
  const mixed = { fn: () => [1] };
  mixed.fn = () => 'abcd';
  assert.true(mixed.fn().includes('bc'));

  function change(receiver) { receiver.fn = () => 'abcd'; }
  function make() {
    change(this);
    return [1];
  }
  const escaped = {};
  escaped.fn = make;
  escaped.fn();
  assert.true(escaped.fn().includes('bc'));

  function install() {
    this.fn = () => 'abcd';
    return [1];
  }
  const installed = {};
  installed.fn = install;
  installed.fn();
  assert.true(installed.fn().includes('bc'));
});

QUnit.test('written function calls retain defaults beside a possibly undefined argument', assert => {
  function choose(value) { return value; }
  const array = {};
  array.fn = (value = [8, 9]) => value;
  const string = {};
  string.fn = (value = 'abcd') => value;
  for (const useDefault of [false, true]) {
    const stringOrEmpty = choose(useDefault) ? undefined : 'abcd';
    assert.true(array.fn(stringOrEmpty).includes(useDefault ? 9 : 'bc'));
    const arrayOrEmpty = choose(useDefault) ? undefined : [8, 9];
    assert.true(string.fn(arrayOrEmpty).includes(useDefault ? 'bc' : 9));
  }
});

QUnit.test('destructured function returns keep the default and argument field families', assert => {
  for (const useArray of [false, true]) {
    let reads = 0;
    function choose() {
      reads++;
      return useArray;
    }
    const defaults = {};
    defaults.fn = ({ rows } = { rows: choose() ? ['a'] : 'ab' }) => rows;
    assert.true(defaults.fn().includes('a'));
    assert.same(reads, 1, 'the default runs once');
    assert.true(defaults.fn(undefined).includes('a'));
    assert.same(reads, 2, 'undefined runs the default once');
    const argument = {};
    argument.fn = ({ rows } = { rows: ['a'] }) => rows;
    assert.true(argument.fn({ rows: choose() ? ['a'] : 'ab' }).includes('a'));
    assert.same(reads, 3, 'the argument runs once');
  }
});
