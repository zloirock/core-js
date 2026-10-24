// The array slot is captured once inside the conditional body.
// Its residual length read and method extraction keep their shared receiver.
const events = [];
const values = [4, 5];
function source() {
  events.push('source');
  return values;
}
if (enabled) var [{ at: method, length: size }] = [source()];
export { method, size, events };
