// IIFE with two destructured params. each receiver argument independently resolves
// against its own ObjectPattern: first arg `Array` carries `from`, second arg `Object`
// carries `keys`. both call arguments are rewritten in lockstep without leaking one
// polyfill into the other receiver
const r = (({ from }, { keys }) => [from, keys])(Array, Object);
export { r };
