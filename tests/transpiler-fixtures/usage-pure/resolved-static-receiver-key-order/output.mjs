import _Array$from from "@core-js/pure/actual/array/from";
// A resolved static keeps receiver writes before key effects and call arguments.
// The constructor store remains the actual source assignment, evaluated once.
let held;
export const keyed = (before(), held = Array, key(), _Array$from)(argument());
export const stored = (held = Array, _Array$from)(argument());
export const prefixed = (before(), _Array$from)(argument());
export const plain = _Array$from(argument());