// `Object.setPrototypeOf(o, P)` hands `o` back over P, so its result dispatches P's family whatever
// `o` was before the install - written in place, held or constructed. a primitive `o` comes back as
// itself, and a prototype that cannot dispatch leaves `o` its own type. distinct method per line
export const a = Object.setPrototypeOf({ 0: 1, length: 1 }, Array.prototype).at(-1);
const held = Object.setPrototypeOf({}, Array.prototype);
export const b = held.findLast(f);
export const c = Object.setPrototypeOf(new Foo(), Array.prototype).flat();
export const d = Object.setPrototypeOf({}, String.prototype).includes('x');
export const e = Object.setPrototypeOf('abc', Array.prototype).codePointAt(0);
export const g = Object.setPrototypeOf({}, null).toSorted();
