// Nested computed keys run from outer level to inner level before binding.
// Realm and literal captures both serve their statics without duplicating those key effects.
const events = [];
var { [(events.push('realm'), 'Array')]: { [(events.push(typeof from), 'from')]: from } } = globalThis;
var { [(events.push('literal'), 'w')]: { [(events.push(typeof of), 'of')]: of } } = { w: Array };
export const result = [from([7])[0], of(8)[0], events];
