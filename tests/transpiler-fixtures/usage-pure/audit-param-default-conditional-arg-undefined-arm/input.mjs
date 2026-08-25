// a conditional CALL-ARG wins over the param default, but its `undefined`-shaped arm is
// exactly the branch the runtime default fires on - the mirror synths the DEFAULT's
// receiver into that arm (same branch, same value), so the default's polyfill survives
export const viaTernary = (function ({ from } = Array) { return from; })(cond ? undefined : Iterator);
export const viaVoid = (function ({ of } = Iterator) { return of; })(cond ? void 0 : Array);
// a `null` arm stays raw: destructuring null throws natively and the default never applies
export const nullArm = (function ({ from } = Array) { return from; })(cond ? null : Iterator);
// an SE-bearing default stays raw on the arm - substituting it would change WHEN eff() runs
export const seDefault = (function ({ from } = (eff(), Array)) { return from; })(cond ? undefined : Iterator);
