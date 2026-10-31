import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A conditional write can replace the array held by an alias before a nested pattern reads it.
// Global usage collects statics from both sources; pure keeps the unresolved native read.
let viaBranch = [Object];
if (c) viaBranch = [Array];
const [{
  from
}] = viaBranch;
export const conditionalWrite = from('ab');