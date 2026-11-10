// All reachable write values survive rewriting; a partial join retains its initializer.
let r;
const effects = [];
function f(c) {
  let x = [1];
  if (c) x = 'ab'.padStart(3);else x = [2];
  return x.at(-1);
}
r = [f(true), f(false)];
