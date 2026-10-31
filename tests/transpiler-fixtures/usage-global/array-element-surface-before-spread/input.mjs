// A fixed first element can be captured before an opaque trailing spread iterates.
// Its nested instance read retains the Array polyfill and the spread's effects.
let visits = 0;
const tail = { [Symbol.iterator]() { visits++; return [1][Symbol.iterator](); } };
const [{ Array: { prototype: { at } } }] = [globalThis, ...tail];
export { at, visits };
