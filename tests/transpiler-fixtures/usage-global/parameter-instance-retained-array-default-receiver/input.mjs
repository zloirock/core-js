// A retained parameter default keeps the prototype receiver's method family.
// The computed key and native sibling consume the captured receiver in source order.
const events = [];
function read([[{ at: first, [(events.push('key'), 'flat')]: second, length }]] = [[Array.prototype]]) {
  return [typeof first, typeof second, events.join(',')];
}
export const result = read();
