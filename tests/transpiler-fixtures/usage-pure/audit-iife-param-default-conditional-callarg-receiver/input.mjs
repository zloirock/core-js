// an IIFE destructure param carrying a DEFAULT, invoked with a non-simple receiver (a conditional or
// logical call-arg): the live call-arg is the receiver, NOT the dead default. each branch is enumerated
// per-branch, so a polyfillable static on a branch (`Array.from` / `Array.of` / `Object.fromEntries`) is
// synthesized rather than suppressed by the default. all three receiver operators are covered - ternary,
// `||` (left-collapse), `&&` (right-select) - with distinct methods tracing each line.
const cond = true;

export const a = (({ from } = Object) => from([1]))(cond ? Array : Map);

export const b = (({ of } = Object) => of(1, 2))(globalThis.Poly || Array);

export const c = (({ fromEntries } = Array) => fromEntries([]))(cond && Object);
