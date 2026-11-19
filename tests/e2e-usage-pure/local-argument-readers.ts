QUnit.test('local argument readers: named and inline data retain their families', assert => {
  function pick<T extends { rows: unknown }>(o: T): T["rows"] { return o.rows; }
  const box = { rows: [8, 9] } as const;
  assert.same(pick(box).at(-1), 9);
  assert.same(pick({ rows: 'ab' }).at(-1), 'b');
  assert.same(box.rows.at(-1), 9);
});

QUnit.test('local argument readers: wrapped writers retain string dispatch', assert => {
  function pick(o: { rows: any }) { o.rows = 'ab'; return o.rows; }
  const box = { rows: [8, 9] };
  assert.same(pick(box as typeof box).at(-1), 'b');
  const other = { rows: [8, 9] };
  assert.same(pick(other!).at(-1), 'b');
});

QUnit.test('local argument readers: an empty prototype exposes the constructor', assert => {
  function pick(o) { return o.prototype; }
  class Box { static rows = [8, 9]; }
  const held: any = pick(Box);
  held.constructor.rows = 'ab';
  assert.same(Box.rows.at(-1), 'b');
});

QUnit.test('local argument readers: a superclass exposes inherited statics', assert => {
  function pick(o) { return o.__proto__; }
  class Base { static rows = [8, 9]; }
  class Box extends Base {}
  const held: any = pick(Box);
  held.rows = 'ab';
  assert.same(Box.rows.at(-1), 'b');
});

QUnit.test('cast array elements retain writes to their source', assert => {
  const castBox: any = { rows: [8, 9] };
  castBox.rows = 'ab';
  const [{ rows: castRows }] = [(castBox as typeof castBox)];
  assert.same(castRows.includes('ab'), true);
});

QUnit.test('non-null array elements retain writes to their source', assert => {
  const nonNullBox: any = { rows: [8, 9] };
  nonNullBox.rows = 'ab';
  const [{ rows: nonNullRows }] = [nonNullBox!];
  assert.same(nonNullRows.includes('ab'), true);
});

QUnit.test('satisfies array elements retain writes to their source', assert => {
  const satisfiesBox: any = { rows: [8, 9] };
  satisfiesBox.rows = 'ab';
  const [{ rows: satisfiesRows }] = [(satisfiesBox satisfies { rows: any })];
  assert.same(satisfiesRows.includes('ab'), true);
});

QUnit.test('cast object values retain writes to their source', assert => {
  const castBox: any = { rows: [8, 9] };
  castBox.rows = 'ab';
  const { slot: { rows: castRows } } = { slot: (castBox as typeof castBox) };
  assert.same(castRows.includes('ab'), true);
});

QUnit.test('non-null object values retain writes to their source', assert => {
  const nonNullBox: any = { rows: [8, 9] };
  nonNullBox.rows = 'ab';
  const { slot: { rows: nonNullRows } } = { slot: nonNullBox! };
  assert.same(nonNullRows.includes('ab'), true);
});

QUnit.test('satisfies object values retain writes to their source', assert => {
  const satisfiesBox: any = { rows: [8, 9] };
  satisfiesBox.rows = 'ab';
  const { slot: { rows: satisfiesRows } } = { slot: (satisfiesBox satisfies { rows: any }) };
  assert.same(satisfiesRows.includes('ab'), true);
});
