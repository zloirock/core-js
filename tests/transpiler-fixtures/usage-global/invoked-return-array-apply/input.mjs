// A receiver invoker pairs the returned value with its original argument.
// A write through that value keeps later reads on the patched static.
const patched = () => 'abc';
function pick(a, b) { return [b]; }
pick.apply(null, [1, Array])[0].from = patched;
export const result = Array.from([1]).at(0);
