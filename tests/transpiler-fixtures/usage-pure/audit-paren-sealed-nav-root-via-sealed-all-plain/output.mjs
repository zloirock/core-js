import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
var _ref;
// dead `?.` chains over VALUE-DEFINED navs erase whole: the sealed ALL-PLAIN nav (declared
// env) and the hop-order spelling (dead optionals over pony-backed reads, deeper window
// reads are realm self-references)
export const viaSealedAllPlain = _atMaybeArray(_ref = _Array$of(8)).call(_ref, 0);