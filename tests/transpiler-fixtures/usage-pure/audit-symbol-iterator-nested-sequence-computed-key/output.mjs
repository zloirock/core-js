import _getIterator from "@core-js/pure/actual/get-iterator";
// Nested sequences inside a computed symbol key retain every effect in source order.
// The unchanged source name is read before those effects and needs no capture.
// Iterator consumption folds the symbol lookup after the key effects.
export const a = (obj, probe(), _getIterator(obj));
export const b = (obj, first(), second(), _getIterator(obj));
export const c = (obj, deep(), _getIterator(obj));