// bodyless `if` body holds a destructure-assignment with an SE-prefixed static receiver.
// `sideEffect()` must run only when `cond` is truthy, so the unbraced slot keeps the SE and then the
// polyfilled assignment as one sequence. lifted out of the slot, the SE would run unconditionally.
let from;
if (cond) ({ from } = (sideEffect(), Array));
