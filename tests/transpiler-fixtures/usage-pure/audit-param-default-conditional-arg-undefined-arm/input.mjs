// an undefined-shaped call argument applies the default at the parameter slot;
// keep that argument unchanged so the default's property reads follow all arguments
export const viaTernary = (function ({ from } = Array) { return from; })(cond ? undefined : Iterator);
export const viaVoid = (function ({ of } = Iterator) { return of; })(cond ? void 0 : Array);
// a `null` arm stays raw: destructuring null throws natively and the default never applies
export const nullArm = (function ({ from } = Array) { return from; })(cond ? null : Iterator);
// a default requiring effect replay stays at its parameter slot on the undefined arm
export const seDefault = (function ({ from } = (eff(), Array)) { return from; })(cond ? undefined : Iterator);
