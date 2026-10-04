import "core-js/modules/es.array.at";
// A literal receiver evaluates its elements before the computed key. Replaying
// a key that changes an element binding must not delay constructing that receiver.
let value = 'before';
export const result = [value][(() => (value = 'after', 'at'))()](0);