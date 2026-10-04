// Retain the actual inner-default receiver. Keys and repeated native reads keep their slots.
const events = [];
const [{ Array: { of }, [(events.push('key'), 'with-dash')]: dash, sibling: first, sibling: second } = globalThis] = [];
use(of(7), dash, first, second, events);
