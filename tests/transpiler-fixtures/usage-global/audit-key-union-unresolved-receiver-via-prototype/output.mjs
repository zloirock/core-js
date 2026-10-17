import "core-js/modules/es.array.sort";
import "core-js/modules/es.array.to-reversed";
import "core-js/modules/es.array.to-sorted";
let protoKey = 'toReversed';
if (c) protoKey = 'toSorted';
export const viaPrototype = Array.prototype[protoKey];