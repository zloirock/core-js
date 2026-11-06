// A literal-container parameter default retains native slot reads and computed-key order.
// The key runs only when its pattern consumes that level.
const events = [];
function read({ w: { v: { Array: { of, [(events.push('key'), 'from')]: from, length } } } } = { w: { v: globalThis } }) {
  return [of(4)[0], from([5])[0], length];
}
use(read(), events);
