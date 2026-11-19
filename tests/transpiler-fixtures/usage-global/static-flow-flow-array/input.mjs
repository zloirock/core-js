// All reachable write values survive rewriting; a partial join retains its initializer.
let r;
const effects = [];
function f(c) {
  let x = '';
  if (c) x = [1, [7]].flat();else x = 'str';
  return x.at(-1);
}
r = [f(true), f(false)];
