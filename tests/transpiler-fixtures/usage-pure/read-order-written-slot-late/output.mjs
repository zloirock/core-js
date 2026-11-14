// A later slot write cannot widen a preceding static read.
let r;
const w = {
  k: Object
};
r = w.k.keys({
  a: 1
});
w.k = Function("return [1, 2]")();
use(r);