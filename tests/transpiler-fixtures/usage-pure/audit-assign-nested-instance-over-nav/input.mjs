// a nested INSTANCE claim under `prototype`, in the ASSIGNMENT host, over a NAV receiver. the
// overwrite this host emits dispatches on the receiver the pattern's own segments name, and that
// receiver is spelled by walking the init's nav (`globalThis` + `Array` + `prototype`) - the
// literal-only walk had nothing to hand it and the claim shipped native, which the stripped realm
// caught as `undefined` where the source reads a function. A defaulted user-slot read keeps its
// guard: an absent method takes the fallback while an instance still gets the ponyfill.
let flatA, flatB, atC, defaulted;
({ Array: { prototype: { flat: flatA } } } = globalThis);
({ prototype: { flat: flatB } } = globalThis.Array);
({ prototype: { at: atC } } = Array);
({ codes: { findIndex: defaulted = () => 0 } } = globalThis.customHolder ?? { codes: [] });
export { flatA, flatB, atC, defaulted };
