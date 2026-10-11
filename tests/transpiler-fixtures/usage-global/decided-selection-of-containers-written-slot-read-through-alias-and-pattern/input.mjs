// a slot write before the read replaces the slot of the container a decided selection of containers yields
// for every reader of the binding, as it does for a plain container's: an alias of the binding and a
// pattern off it - nested, or off the slot itself - load the written value's static, not the replaced one's
const viaAlias = typeof Symbol != 'undefined' ? { C: Map } : { C: Set };
viaAlias.C = Object;
const alias = viaAlias;
export const grouped = alias.C.groupBy([1, 2], x => x % 2);
const nested = { C: Array } || { C: Set };
nested.C = Iterator;
export const { C: { from } } = nested;
const flat = typeof Symbol != 'undefined' ? { C: Int16Array } : { C: Set };
flat.C = Array;
export const { of } = flat.C;
