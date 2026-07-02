// string-key `in` fold with a direct SE-bearing inline call RHS: the call resolves to the
// constructor for classification, and its setup survives the fold
let calls = 0;
const r = 'resolve' in (() => {
  calls++;
  return Promise;
})();
