// An exported extraction keeps both neighboring initializers in source order.
// Its receiver is captured once; the private capture is not exported.
const events = [];
const values = [4, 5];
function source() {
  events.push('source');
  return values;
}
export const before = (events.push('before'), 0),
  { at: method = (events.push('default'), () => -1), length: size } = source(),
  after = (events.push('after'), method.call(values, -1));
export { events };
