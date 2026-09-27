import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/web.dom-collections.iterator";
// Literal receiver keys identify the same written slot in either parser.
// Body reads must retain the functions assigned by the loop, including through a dispatcher.
// The mutation census conservatively treats these non-string computed keys as unknown slots.
const o = {
  true: [],
  null: []
};
for (o[true].at of functions) consume(o[true].at(0));
for (o[null].includes of functions) consume(o[null].includes(0));