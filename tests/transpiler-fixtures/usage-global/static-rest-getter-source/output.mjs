import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// A retained getter runs once before the outer rest copy.
// Its proven static receives a fallback without replacing the source object.
let count = 0;
const source = {
  get w() {
    count++;
    return Array;
  },
  extra: 7
};
let from, rest;
const held = {
  w: {
    from
  },
  ...rest
} = source;
export { count, from, rest };
console.log(held === source);