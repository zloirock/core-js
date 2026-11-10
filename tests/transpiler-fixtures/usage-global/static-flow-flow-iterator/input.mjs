// All reachable write values survive rewriting; a partial join retains its initializer.
let r;
const effects = [];
function f(c) {
  let x = [];
  if (c) x = [1, 7].values();else x = [2];
  return Array.from(x.map(v => v));
}
r = [f(true), f(false)];
