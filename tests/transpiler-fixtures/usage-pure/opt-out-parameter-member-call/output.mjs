// A disabled caller source stays native through a plain parameter member read.
function pick(value) {
  return value.resolve;
}
// core-js-disable-next-line
export const r = pick(Promise);