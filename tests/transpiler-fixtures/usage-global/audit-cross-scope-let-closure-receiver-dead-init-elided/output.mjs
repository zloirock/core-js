import "core-js/modules/es.array.of";
// RECEIVER alias unconditionally reassigned before the capturing closure is defined: M holds Array at
// the closure use, never the dead init Object - so M.assign dispatches Array.assign (undefined) and
// es.object.assign is NOT injected. the reaching-value preference prunes the dead receiver init across
// the closure boundary, symmetric with the computed-key path. the trailing Array.of pins a non-empty
// output so the ABSENCE of es.object.assign is the assertion
let M = Object;
M = Array;
const read = () => M.assign({}, {});
read();
Array.of(1, 2, 3);