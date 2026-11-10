// A replaced constructor needs no native static Get; computed-key effects still run.
let r;
const effects = [];
const a = Promise.resolve,
  b = Promise[effects.push('key'), 'reject'];
r = [typeof a, typeof b];
