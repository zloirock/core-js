// Rebuilding an assignment or loop header must preserve every sibling binding and inner claim.
// Each receiver is captured before its computed key, followed by the selected property read;
// later declarators can observe the completed bindings.
const obj = { recv: [1] };
let e = 0, from, o;
let done = false;
function eff() { return 0; }
({ [(e++, 'of')]: o, from } = Array);
for (const { [(eff(), 'findLastIndex')]: fli, at: a } = obj.recv; !done;) done = [fli, a];
export const r = [from, o, done];
