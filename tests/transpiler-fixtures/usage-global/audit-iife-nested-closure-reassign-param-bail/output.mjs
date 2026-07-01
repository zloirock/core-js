// an immediately-invoked nested closure reassigns the outer param before `return arg`, so the
// IIFE-identity peel bails - the receiver is unknown at compile time, not `Array`. usage-global
// therefore injects NO `es.array.from` for this destructure (an unknown receiver matches no
// static), mirroring the usage-pure guard on the same shape
const Result = (arg => {
  (() => {
    arg = 1;
  })();
  return arg;
})(Array);
const {
  from
} = Result;
from([1, 2]);