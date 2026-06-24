// an IIFE destructure param carrying a DEFAULT, invoked with a non-simple receiver (a conditional /
// logical call-arg): the live call-arg is the receiver, NOT the dead default, so each branch's
// polyfill dependency (`Array.from` / `Array.of`) is injected rather than suppressed by the default.
// distinct keys trace each line.
const cond = true;

export const a = (({ from } = Object) => from([1]))(cond ? Array : Map);

export const b = (({ of } = Object) => of(1, 2))(globalThis.Poly || Array);
