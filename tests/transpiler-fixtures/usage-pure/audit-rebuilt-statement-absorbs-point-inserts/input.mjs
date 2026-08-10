// a whole-statement rebuild overwrites the range its own siblings anchored point-inserts in, and
// MagicString drops an insert that lands inside an overwritten chunk. both channels that place one
// have to route into the rebuild instead: the SE-computed-key inline default lands in the residual
// prop it rewrites, the receiver memo becomes a LEADING declarator of its slot
const obj = { recv: [1] };
let e = 0, from, o;
let done = false;
function eff() { return 0; }
({ [(e++, 'of')]: o, from } = Array);
for (const { [(eff(), 'findLastIndex')]: fli, at: a } = obj.recv; !done;) done = [fli, a];
export const r = [from, o, done];
