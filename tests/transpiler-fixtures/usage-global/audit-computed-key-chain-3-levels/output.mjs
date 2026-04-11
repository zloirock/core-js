import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
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