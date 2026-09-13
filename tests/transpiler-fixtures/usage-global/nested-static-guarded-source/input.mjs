// Fully consumed nested static slots keep the optional source check.
// A missing window throws before the computed key; a present source evaluates it once.
// The leading receiver effect stays ahead of the check and both extracted bindings.
const events = [];
let result;
try {
  const { Array: { [(events.push('key'), 'from')]: from }, Object: { keys } }
    = (events.push('source'), globalThis.window?.self);
  result = [from([7])[0], keys({ x: 1 })[0]];
} catch (error) {
  result = error.name;
}
export { events, result };
