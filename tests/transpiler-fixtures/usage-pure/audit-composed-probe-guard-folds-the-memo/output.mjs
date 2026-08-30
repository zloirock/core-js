import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$race from "@core-js/pure/actual/promise/race";
// a receiver that SPLITS off its own memo, over a navigation the kept-nav plan already collapses
// to a ponyfill under one probe: the memo must compose with that probe rather than test its own
// result again. left to mint a ref, the split spells a SECOND guard over the guard render builds
// (`null == (null == g.window ? void 0 : _self) ? void 0 : ...`) and drags the collapsed root's
// import back in
let out;
let k;
out = null == (() => _globalThis)().window ? void 0 : _nameMaybeFunction(_Promise$race.zzz);
export const read = out;
export const keyed = null == (() => _globalThis)().window ? void 0 : _at(_Promise[k]);