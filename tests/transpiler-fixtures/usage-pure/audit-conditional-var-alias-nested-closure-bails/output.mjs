// conditional `var M` alias captured by a nested closure. M holds the global only on the c-true path,
// so usage-pure cannot drop the receiver - rewriting to a bare polyfill would mask the native
// TypeError when c is falsy and M is undefined. pure keeps the call site (no substitution).
function f(c) {
  if (c) var M = Object;
  return () => M.fromEntries([['a', 1]]);
}