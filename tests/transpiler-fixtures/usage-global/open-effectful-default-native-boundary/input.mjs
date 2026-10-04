// An open caller cannot move its parameter pattern into the body. A native sibling read
// after a key effect keeps this default native; its static may lack a pure polyfill.
const events = [];
export function read([{ Array: { of }, [(events.push('key'), 'sibling')]: value } = globalThis]) {
  return [of, value];
}
