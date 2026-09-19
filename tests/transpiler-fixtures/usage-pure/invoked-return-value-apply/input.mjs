// A receiver invoker pairs the returned value with its original argument.
// A write through that value keeps later reads on the patched static.
function pick(a, b) { return b; }
pick.apply(null, [1, Array]).from = patched;
export const result = Array.from([1]);
