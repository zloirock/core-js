// A default on a nested Array pattern is unreachable for the pristine realm.
// The nested method still receives its pure entry.
const { Array: { from } = {} } = globalThis;
const { Array: { of } = {} } = globalThis;
export { from, of };
