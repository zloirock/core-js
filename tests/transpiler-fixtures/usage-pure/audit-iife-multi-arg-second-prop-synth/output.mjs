import _Array$from from "@core-js/pure/actual/array/from";
import _Object$keys from "@core-js/pure/actual/object/keys";
// IIFE with two destructured params. each receiver argument independently resolves
// against its own ObjectPattern: first arg `Array` carries `from`, second arg `Object`
// carries `keys`. synth-swap rewrites both call arguments in lockstep without leaking
// one polyfill into the other receiver
const r = (({
  from
}, {
  keys
}) => [from, keys])({
  from: _Array$from
}, {
  keys: _Object$keys
});
export { r };