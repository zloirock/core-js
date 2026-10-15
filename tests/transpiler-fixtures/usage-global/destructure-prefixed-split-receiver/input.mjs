// A split pattern keeps the initializer prefix before its first computed hop.
// Reusing the source binding must preserve the prefix and serve the captured method.
const events = [];
const source = { row: [5, 6], other: 1 };
const { [(events.push('key'), 'row')]: { at }, other } = (events.push('prefix'), source);
export { at, other, events };
