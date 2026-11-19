// All reachable write values survive rewriting; a partial join retains its initializer.
let r;
const effects = [];
function f(c) {
  let x = [9].flat();
  if (c) x = 'ab';else x = 'cd';
  return x.at(-1);
}
r = [f(true), f(false)];
