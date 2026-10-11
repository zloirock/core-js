import "core-js/modules/es.array.copy-within";
import "core-js/modules/es.array.find-last";
import "core-js/modules/es.array.find-last-index";
import "core-js/modules/es.array.to-reversed";
import "core-js/modules/es.array.with";
// A key write a later unconditional write overwrites before the read, or before a closure reading the
// key is even defined, names no method the read dispatches: in usage-global its method stays out. A
// write after the closure's definition may run before a call, so it stays, as does the initializer
let closureKey = 'includes';
closureKey = 'at';
closureKey = 'findLast';
export const closureRead = list => list[closureKey]();
let placeKey = 'fill';
placeKey = 'toSorted';
placeKey = 'findLastIndex';
export const placeRead = [3, 1][placeKey](x => x);
let lateKey = 'with';
export const lateRead = list => list[lateKey](0, 1);
lateKey = 'toReversed';
lateKey = 'copyWithin';