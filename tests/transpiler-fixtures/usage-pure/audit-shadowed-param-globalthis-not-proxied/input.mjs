// a function parameter named `globalThis` shadows the global object. usage-pure must not treat
// `globalThis.Array` as the global-object proxy and rewrite the receiver to a pure global-this
// import - that would read `Array` off the parameter value instead. the shadow check leaves
// `globalThis.Array` verbatim; the genuine `Array.prototype.slice` instance method still polyfills
function f(globalThis) {
  const { slice, ...rest } = globalThis.Array || other;
  return [slice, rest];
}
