import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// usage-global still owes the module for a read it cannot prove runs: a computed key bound BELOW its
// read is a temporal-dead-zone throw, and injecting anyway is this method's safe pole - only the pure
// flavor, which REWRITES, has to decline there. the negative keeps the pair visible: the same shape
// declared above its read injects its own module.
export const tdzStatic = Array[fromKey]([1]);
const fromKey = 'from';
const entriesKey = 'fromEntries';
export const eager = Object[entriesKey]([]);