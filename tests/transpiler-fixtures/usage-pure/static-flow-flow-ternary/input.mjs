// All reachable write values survive rewriting; a partial join retains its initializer.
let r;
const effects = [];
function f(c, d) {
  let x;
  if (c) x = d ? [1, [7]].flat() : 'ab'.padStart(3);else x = 'str';
  return x.at(-1);
}
r = [f(true, true), f(true, false), f(false, false)];
