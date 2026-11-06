// An array pattern under a literal-object key keeps native iteration and static property reads.
// Declaration, assignment, loop and default hosts preserve that same boundary.
const held = { k: [Math] };
const { k: [{ trunc: viaAlias }] } = held;
use(viaAlias(1.5));
const { k: [{ sign: viaSibling }, beside] } = held;
use(viaSibling(-1), beside);
let viaAssign;
({ k: [{ cbrt: viaAssign }] } = held);
use(viaAssign(8));
for (const { k: [{ log10: viaHead }] } of [held]) use(viaHead(100));
let viaHeadAssign;
for ({ k: [{ log2: viaHeadAssign }] } of [held]) use(viaHeadAssign(8));
function viaDefault({ k: [{ hypot }] } = held) { return hypot(3, 4); }
use(viaDefault());
