// an IIFE parameter with a conditional fallback default, invoked with `undefined`: the
// runtime applies the parameter default, so the destructured `from` resolves through both
// branches. emission must enumerate the default's branches (Array.from + Int8Array.from),
// not the void call-arg
const cond = Math.random() > 0.5;
(function ({ from } = cond ? Array : Int8Array) {
  from([1, 2, 3]);
})(undefined);
