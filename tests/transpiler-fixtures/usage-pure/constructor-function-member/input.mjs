// Abstract constructors are function values too; their own map reads need no Array dispatcher.
// Reading an iterator instance's map remains a separate, polyfillable operation.
export const own = [typeof Iterator.map, typeof AsyncIterator.map];
export const mapped = Iterator.from([1, 2]).map(value => value + 1).toArray();
