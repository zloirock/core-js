// a binding its declarator's initializer types - a constructed instance, an array literal - that later
// gets a dispatching prototype, by the installer or by `__proto__`, dispatches the installed family
// instead; one with no install keeps its type, and so does a primitive, which the installer hands back
// as itself. `Map` loads its own modules
const constructed = new Map();
Object.setPrototypeOf(constructed, Array.prototype);
export const a = constructed.at(-1);
const written = new Map();
written.__proto__ = Array.prototype;
export const b = written.findLast(f);
const listed = [1];
Object.setPrototypeOf(listed, String.prototype);
export const d = listed.includes('1');
const plain = new Map();
export const e = plain.toSorted();
const text = 'ab';
Object.setPrototypeOf(text, Array.prototype);
export const g = text.padStart(4);
