import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// mixed object/array destructure with rest: each level of the pattern must independently
// track receivers for instance polyfill rewrites.
const {
  a: [b, ...c]
} = {
  a: [1, "x", "y"]
};
b.at(0);
c.includes("x");