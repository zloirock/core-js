// An earlier flat slot is queued before a later nested receiver capture.
// The exported setter keeps the source binding open; both targets are written once.
let source;
export function setSource(value) { source = value; }
setSource({ keys: undefined, data: [1] });
let keys, at;
({ keys, data: { at } } = source);
export const result = [keys, at.call([4], 0)];
