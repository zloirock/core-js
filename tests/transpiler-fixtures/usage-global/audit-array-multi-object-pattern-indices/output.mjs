import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// nested object-pattern destructure inside an array pattern: each inner binding must
// track its own indexed receiver for instance polyfill rewrites.
const [{
  a
}, {
  b
}] = [{
  a: "x"
}, {
  b: [1]
}];
a.at(0);
b.includes(1);