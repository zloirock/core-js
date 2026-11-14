// Static reads inside instance-call arguments retain their constructor and effects.
const effects = [];
let r;
const out = [];
out.push((P => P.allSettled)(Promise));
r = typeof out[0];
export { r, effects };
