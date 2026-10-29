// Effects inside a saved realm value precede the setter. The surrounding prefix
// stays outside the store, and the unbacked tail reads the value the setter received.
const log = [];
let stored;
const holder = { set value(value) { log.push('set'); stored = value; } };
export const result = (log.push('outer'), holder.value = (log.push('inner'), globalThis.self)).window;
export { log, stored };
