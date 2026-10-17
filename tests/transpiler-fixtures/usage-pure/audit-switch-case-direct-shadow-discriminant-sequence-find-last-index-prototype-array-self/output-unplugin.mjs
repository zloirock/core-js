// An ALIAS of the proxy-global buried in a sequence tail: the case-direct shadow of the alias name must not stop the alias-follow
// at the discriminant - the redundant proxy hop still collapses (a kept `.self` hop reads undefined off-engine).
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _globalThis from "@core-js/pure/actual/global-this";

const g = _globalThis;
let ya = {};

switch (_findLastIndexMaybeArray((0, g).Array.prototype)) {
	case 1:
		let g = ya;
		break;
}

export { ya };