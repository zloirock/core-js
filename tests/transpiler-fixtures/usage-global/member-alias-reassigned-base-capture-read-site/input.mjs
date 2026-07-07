// usage-global member-receiver walk read-site through a reassigned base. `holder.Array` and `base.Map` are
// evaluated at their capture point (the alias declarator / the wrapper literal), so reassigning the BASE
// afterwards cannot change the captured member value - the walk keeps resolving and injects. the base's
// reassignment check must anchor at the capture read, not the final destructure host: a host-anchored check
// saw the later `holder = {}` / `base = {}` as dominating and wrongly bailed both members.
// first cell: a direct member alias (`const arrayAlias = holder.Array`); second: a member nested in an
// object wrapper (`{ m: base.Map }`) - both walk the base to a proxy global before the reassignment
let holder = globalThis;
const arrayAlias = holder.Array;
holder = {};
const { from } = arrayAlias;

let base = globalThis;
const wrapper = { m: base.Map };
base = {};
const { m: { groupBy } } = wrapper;

export { from, groupBy };
