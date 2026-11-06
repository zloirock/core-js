// user shadows the global `Promise` with a local binding then does `Promise?.resolve(1)`.
// the `?.` guards the LOCAL `Promise` - it may be undefined at runtime. plugin must not
// strip the optional guard or route the call through the polyfill: the shadow could be
// anything, and collapsing `Promise?.resolve(1)` to `_Promise$resolve(1)` would bypass
// the user's explicit null-check
function consume(Promise) {
  return Promise?.resolve(1);
}