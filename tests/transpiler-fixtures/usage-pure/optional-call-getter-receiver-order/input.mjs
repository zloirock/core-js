// A method-only optional call can invoke a getter that replaces its receiver binding.
// The call retains the object captured before that getter; the computed continuation
// runs exactly once on the value returned from the original receiver.
let arr = [['outer']];
const after = [['inner']];
Object.defineProperty(arr, 'at', {
  get() {
    arr = after;
    return function () { return this[0]; };
  },
});
let hits = 0;
export const result = [arr.at?.(0)?.[(hits++, 'includes')]('outer'), hits];
