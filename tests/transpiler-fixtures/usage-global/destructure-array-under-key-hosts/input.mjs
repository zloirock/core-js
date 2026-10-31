// an ARRAY PATTERN under an object KEY: the wrapper indexes the level the key reached, so the hops
// descend in the order the runtime reads them, under every host - a declarator, one beside a sibling
// element, an assignment, a for-of head and its assignment form, a parameter default. one static per row
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
