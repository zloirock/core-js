// Closed callers identify the statics for global injection.
// Pure mirrors quiet selection arms; the opaque call result keeps its parameter read.
const mk = () => Array;
const pick = 1;
function fromCall({ of: a }) { return a; }
function fromSelection({ from: b }) { return b; }
export const x = fromCall(mk());
export const y = fromSelection(pick ? Array : Array);
