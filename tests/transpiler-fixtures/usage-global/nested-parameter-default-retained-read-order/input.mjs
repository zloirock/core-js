// Nested literal defaults retain claimed statics and defer the native sibling until its source position.
const events = [];
function read({ w: { v: { Array: { of, [(events.push('key'), 'from')]: from, length } } } } = { w: { v: globalThis } }) {
  return [of(4)[0], from([5])[0], length];
}
use(read(), events);
