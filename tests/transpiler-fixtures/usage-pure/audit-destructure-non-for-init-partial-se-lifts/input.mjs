// Statement-scope `const { Array: { from }, ...rest } = (logCall(), globalThis)`:
// `Array.from` is extracted as a polyfill, the side-effecting `logCall()` runs exactly
// once as a lifted statement before the preserved rest-destructure.
declare const logCall: () => any;
const { Array: { from }, ...rest } = (logCall(), globalThis);
console.log(from, rest);
