import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// Exported source and held expose Array through the getter, a constructor core-js does not polyfill:
// its escape loads nothing beyond the `from` the pattern names.
// Pure preserves the getter and leaves the nested static read native.
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
export { count, from, rest, held, source };