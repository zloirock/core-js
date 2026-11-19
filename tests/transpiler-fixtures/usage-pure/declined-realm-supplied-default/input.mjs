// An explicitly supplied empty slot executes the user's default.
// Filling the receiver default cannot replace caller values or claim that leaf default.
let key = 'Promise';
export function read({ globalThis: { [key]: { prototype = 'abc'.at(-1) } } }
  = (key = 'Array', globalThis)) {
  return prototype;
}
read({ globalThis: { Promise: {} } });
