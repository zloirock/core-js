import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// A sequence prefix remains ahead of the call and its native array iteration.
// Both the optional call and literal-array twin keep native static reads and element defaults.
const log = [];
const make = () => (_pushMaybeArray(log).call(log, 'make'), [Math]);
const [{
  trunc: viaPrefixed
} = {}] = (_pushMaybeArray(log).call(log, 'prefix'), make());
const [{
  sign: viaOptional
} = {}] = make?.();
const [{
  cbrt: viaLiteral
} = {}] = (_pushMaybeArray(log).call(log, 'literal'), [Math]);
export { viaPrefixed, viaOptional, viaLiteral, log };