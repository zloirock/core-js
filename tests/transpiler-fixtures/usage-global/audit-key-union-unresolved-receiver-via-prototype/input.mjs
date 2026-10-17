let protoKey = 'toReversed';
if (c) protoKey = 'toSorted';
export const viaPrototype = Array.prototype[protoKey];
