// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
const plain = { x: 1 };
const { [Symbol.iterator]: { from, ...rest } } = plain;
console.log(from, Object.keys(rest), Object.freeze(rest));
// same relocation off a proxy global, which renders through the other emission route
const { [Symbol.iterator]: { of, ...proxyRest } } = globalThis;
console.log(of, Object.keys(proxyRest));
// a static the targets DO need is unaffected - the decline is per-argument, not a blanket bail
console.log(Object.values(rest));
var { [Symbol.iterator]: { from: hoistedFrom, ...hoistedRest } } = plain;
{
  var { [Symbol.asyncIterator]: { of: hoistedOf, ...hoistedRest } } = plain;
}
console.log(hoistedFrom, hoistedOf, Object.keys(hoistedRest));
const { a, ...plainRest } = { a: 1, b: 2 };
export function unknownArg(x) {
  return Object.keys(x);
}
console.log(a, Object.keys(plainRest));
