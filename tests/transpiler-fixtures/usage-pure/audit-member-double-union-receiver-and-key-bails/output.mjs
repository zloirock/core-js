// usage-pure counterpart to the double-union: both M and K are conditionally reassigned, so neither
// the receiver nor the key is provably one value at the use. pure cannot rewrite `M[K]` to a
// receiver-less polyfill without masking the native error on a path where M / K differ, so it bails.
function f(a, b) {
  let M = {};
  if (a) M = Array;
  let K = 'from';
  if (b) K = 'of';
  return M[K]([1, 2, 3]);
}