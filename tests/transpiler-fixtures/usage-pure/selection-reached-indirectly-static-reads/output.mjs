// A selection reached any way but straight from the read - returned by a call, held by a logical
// assignment, tested by `in` - keeps the native read of a constructor arm core-js ships no replacement of:
// the identity guard serves only the selection the member read itself spells (an accepted boundary)
const list = [1, 2];
function pick(source) {
  return source || Number;
}
export const viaCall = pick(shim).isSafeInteger(7);
let held;
export const viaAssignment = (held ||= Array).fromAsync(list);
export const viaIn = 'trunc' in (shim || Math);