// A replaced constructor needs no native static Get; computed-key effects still run.
let r;
const effects = [];
const C = Iterator;
const a = C.from,
  b = C[effects.push("key"), "from"];
r = [typeof a, typeof b];
