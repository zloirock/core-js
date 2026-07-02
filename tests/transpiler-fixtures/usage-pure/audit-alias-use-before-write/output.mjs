import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// a use textually BEFORE its alias write / declaration (an earlier-defined closure body, a
// hoisted-var read) stays RAW even for a TRUSTED registration - a static narrow would un-throw
// a call that runs before the write; uses textually after keep the static narrow (the locked
// decl canon)
let M;
const early = () => typeof M.groupBy;
M = _Map;
export const r = [early(), typeof _Map$groupBy];
const hoisted = () => typeof P.try;
var P = _Promise;
export const q = [hoisted(), typeof _Promise$try];