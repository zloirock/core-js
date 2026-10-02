QUnit.test('written function defaults: an all-nullish argument can activate the default', assert => {
  const box: { fn?: (value?: number[] | null) => number[] | null } = {};
  box.fn = (value: number[] | null = [8, 9]) => value;
  const empty: null | undefined = undefined;
  assert.same(box.fn(empty)?.at(-1), 9);
});

QUnit.test('written function defaults: null keeps the caller fallback live', assert => {
  const choose = () => true;
  const box: { fn?: (value?: number[] | null) => number[] | null } = {};
  box.fn = (value: number[] | null = [8, 9]) => value;
  const empty: undefined | null = choose() ? null : undefined;
  assert.same((box.fn(empty) ?? 'abcd').at(-1), 'd');
});

QUnit.test('destructured written functions retain the inferred field union', assert => {
  const choose = () => false;
  const box = { fn: ({ rows } = { rows: choose() ? ['a'] : 'ab' }) => rows };
  box.fn = ({ rows } = { rows: choose() ? ['a'] : 'ab' }) => rows;
  assert.true(box.fn().includes('a'));
  assert.true(box.fn({ rows: choose() ? ['a'] : 'ab' }).includes('a'));
});
