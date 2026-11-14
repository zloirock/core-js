// Static reads inside instance-call arguments retain their constructor and effects.
const effects = [];
let r;
const out = [];
out.push((C => C.from((effects.push("arg"), [3])))(Array));
r = out;
export { r, effects };
