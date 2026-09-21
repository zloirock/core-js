// A nested static rest keeps its source and excludes the claimed key.
// Extra array elements run before the binding; the assignment yields the original array.
const events = [];
let held, from, rest;
const result = ([{ Array: { from, ...rest } }] = [held = (events.push('source'), globalThis), events.push(typeof from)]);
export { events, held, from, rest, result };
