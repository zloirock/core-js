import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
// three-level alias chain for a computed key: `c = b = a = 'items'` must resolve
// transitively so the literal-key polyfill dispatch fires consistently.
const a = "items";
const b = a;
const c = b;
const {
  [c]: val
} = {
  items: ["hello"]
};
val.at(-1);
val.includes("x");