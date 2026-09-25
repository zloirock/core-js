// an instance member destructured through a CALL default (`= fa()`) dispatches on the call's value:
// the call runs once, only where the default fires - top-level, in a function, an assignment and a
// parameter - and a default the host's pairing proves dead is not replaced: the paired value is read
function fa() { log(); return [1, 2]; }
const { A: { at } = fa() } = {};
function h2(o) { const { A: { flat } = fa() } = o; return flat; }
function h3(o) { let fm; ({ A: { flatMap: fm } = fa() } = o); return fm; }
function h4({ findLast: fl } = fa()) { return fl; }
const { A: { with: w } = fa() } = { A: [1, 2] };
use(at, h2, h3, h4, w);
