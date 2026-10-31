// computed-key alias K is a conditional `var`; it holds the key string only on the c-true path, so
// usage-pure cannot fold `Object[K]` to a receiver-less polyfill - that would mask the native error
// on the c-falsy path where K is undefined. pure keeps the dynamic member call.
function f(c) {
  if (c) var K = 'fromEntries';
  return Object[K]([['a', 1]]);
}
