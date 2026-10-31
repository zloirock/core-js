import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a wrapped for-x write slot is a per-iteration rebind, never the inherited method
const frr: number[] = [];
// @ts-expect-error a loop head write tsc refuses is the shape under test
for (frr.at of [[1]]) break;