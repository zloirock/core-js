import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
// a disable directive on a NESTED leaf line opts that leaf out of the flatten (it stays a
// native read in the residual) while the symbol extraction on the free line still fires
const it = _getIteratorMethod(_globalThis);
const {
  // core-js-disable-next-line
  Array: {
    from: f
  }
} = _globalThis;
it;
f(x);