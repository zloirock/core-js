import _globalThis from "@core-js/pure/actual/global-this";
// Refused flow-trust: a sequence write nested in a CONDITIONAL block only runs on the taken path, and a nested-function write is
// likewise not unconditional in the binding scope - the re-anchored placement walk refuses the static narrow and the read takes
// the runtime constructor GUARD instead (polyfill on the taken path, the untaken path still reads the native undefined and throws
// exactly like untranspiled code).
let A3;
if (Math.random() > 2) {
  ({
    Array: A3
  } = _globalThis);
}