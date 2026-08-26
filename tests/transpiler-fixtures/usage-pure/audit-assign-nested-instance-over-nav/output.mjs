import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
// a nested INSTANCE claim under `prototype`, in the ASSIGNMENT host, over a NAV receiver. the
// overwrite this host emits dispatches on the receiver the pattern's own segments name, and that
// receiver is spelled by walking the init's nav (`globalThis` + `Array` + `prototype`) - the
// literal-only walk had nothing to hand it and the claim shipped native, which the stripped realm
// caught as `undefined` where the source reads a function. a DEFAULTED prop keeps the refusal: its
// dispatch may answer undefined on a foreign receiver, and the overwrite would bury the default
let flatA, flatB, atC, defaulted;
flatA = _flatMaybeArray(_globalThis.Array.prototype);
flatB = _flatMaybeArray(_globalThis.Array.prototype);
atC = _at(Array.prototype);
({
  codes: {
    findIndex: defaulted = () => 0
  }
} = _globalThis.customHolder ?? {
  codes: []
});
export { flatA, flatB, atC, defaulted };