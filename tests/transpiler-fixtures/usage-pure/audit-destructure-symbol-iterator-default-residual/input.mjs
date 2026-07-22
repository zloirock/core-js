// a `[Symbol.iterator]`-keyed prop whose value carries a polyfillable default must expose that
// default to the rewrite: without a residual anchor the blanket flatten skip drops it and the
// default leaks a native instance call
const { Array: { from }, [Symbol.iterator]: it = [1].at(0) } = globalThis;
export { from, it };
