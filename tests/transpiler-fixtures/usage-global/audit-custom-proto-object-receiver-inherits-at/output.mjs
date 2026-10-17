import "core-js/modules/es.array.at";
// An object whose prototype is not `Object.prototype` INHERITS that prototype's methods, so the member read needs the polyfill on
// an engine lacking it.
let literal = {
  __proto__: Array.prototype
};
export const a = literal.at(-1);