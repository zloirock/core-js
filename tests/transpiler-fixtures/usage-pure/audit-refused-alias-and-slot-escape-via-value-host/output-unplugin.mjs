// the REFUSED-alias guarded narrow renders for the SOLE-ASSIGNMENT host exactly as for the
// declarator host (`g = (se, M === _Map ? _Map$groupBy : M.groupBy)`) - the raw read off a
// claimed alias answered `undefined` where every engine with the ctor answers the member
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";

let n = 0;

// the VALUE-CONSUMING assignment host preserves its native value - the RHS object - as a
// sequence tail; and a mutator-installed ctor argument steers to the namespace entry even
// through the rewritten `.call` dispatch spelling
let vg;

export const viaValueHost = (() => {
	let M;

	if (n === 0) M = _Map;

	const v = (vg = (n, M === _Map ? _Map$groupBy : M.groupBy), M);

	return [typeof vg, v === M];
})();