// a disable directive on a NESTED leaf line opts that leaf out of the flatten (it stays a
// native read in the residual) while the symbol extraction on the free line still fires
const {
  [Symbol.iterator]: it,
  // core-js-disable-next-line
  Array: { from: f },
} = globalThis;
it;
f(x);
