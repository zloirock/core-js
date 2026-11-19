import value from './export-expression-value.js';

QUnit.test('syntax: a polyfilled default export expression', assert => {
  assert.same(value, 2);
});

QUnit.test('syntax: member-target destructure in a bodyless loop', assert => {
  const holder = {};
  for (let i = 0; i < 1; i++) ({ from: holder.from } = Array);
  assert.deepEqual(holder.from([3]), [3]);
});
