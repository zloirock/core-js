// A selection reached any way but straight from the read - returned by a call, held by a logical
// assignment, tested by `in` - still injects the static of its constructor arm, whichever arm runs
const list = [1, 2];
function pick(source) {
  return source || Number;
}
export const viaCall = pick(shim).isSafeInteger(7);
let held;
export const viaAssignment = (held ||= Array).fromAsync(list);
export const viaIn = 'trunc' in (shim || Math);
