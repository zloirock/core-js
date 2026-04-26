import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// array-pattern rest binding `...rest` followed by `.at(0)` instance call: `rest` is
// always an array, so the rewrite picks the array-specific instance polyfill.
const [...rest] = [1, 2, 3];
rest.at(0);