// BOTH the receiver alias M and the computed-key alias K are conditionally reassigned, so the
// reachable dispatch targets are the cross product of {{}, Array} x {'from', 'of'}. only the Array
// pairs are polyfillable, so usage-global emits es.array.from AND es.array.of - the (Array,'of')
// pair comes from neither alias alone, only their combination.
function f(a, b) {
  let M = {};
  if (a) M = Array;
  let K = 'from';
  if (b) K = 'of';
  return M[K]([1, 2, 3]);
}
