// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Supplied values and defaults keep their source branches and independent claims. Instance claims retain their own receivers.
const events = [];
function read({ w: [{ Array: { of, [(events.push('key'), 'from')]: from, length } }] }) {
  return [of(4)[0], from([5])[0], length];
}
use(read({ w: [globalThis] }), events);
