// A replaced constructor needs no native static Get; computed-key effects still run.
let r;
const effects = [];
const a = Iterator.from,
  b = Iterator[effects.push('key'), 'from'];
r = [typeof a, typeof b];
