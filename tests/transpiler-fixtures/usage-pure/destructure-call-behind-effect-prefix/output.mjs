import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live. Instance claims retain their own receivers.
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