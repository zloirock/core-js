// A complete caller census supplies a realm inside a literal spine.
// The retained native pattern still evaluates its effectful key before later bindings.
const events = [];
function read({ w: [{ Array: { of, [(events.push('key'), 'from')]: from, length } }] }) {
  return [of(4)[0], from([5])[0], length];
}
use(read({ w: [globalThis] }), events);
