import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// A nested container remains the result of both assignments; each read is polyfilled.
let from, rest;
const source = {
  w: Array,
  extra: 1
};
const held = {
  w: {
    from
  },
  ...rest
} = {
  w: {
    from
  },
  ...rest
} = source;
use(held === source, from([1]), rest);