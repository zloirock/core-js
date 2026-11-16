import _at from "@core-js/pure/actual/instance/at";
// A shifted source slot is not a certain array receiver.
const source = [...values, [3]];
const [held] = source;
_at(held).call(held, 0);