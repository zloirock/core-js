/* eslint-disable no-labels, no-extra-label, no-unused-labels, no-unreachable-loop -- preserve both label spellings across head memo hoisting */
QUnit.test('labeled loop heads keep continue targets', assert => {
  let count = 0;
  outer: for (; [10, 20].at(count) !== undefined; count++) continue outer;
  assert.same(count, 2);
  let stacked = 0;
  first: second: for (; [30, 40].at(stacked) !== undefined; stacked++) continue first;
  assert.same(stacked, 2);
});
