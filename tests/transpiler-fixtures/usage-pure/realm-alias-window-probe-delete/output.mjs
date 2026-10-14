import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// A `delete` through a realm alias reads nothing over its navigation, but an optional link over the
// `window` read decides whether it happens at all: off-window the source deletes nothing, so the
// alias keeps the probe and the run stays spelled. A backed hop's `?.` decides nothing and folds,
// and a plain unbacked hop folds onto the alias as the collapse model takes it.
const g = _globalThis;
const s = _self;
delete g.window?.Array.userKey;
delete s.window?.Date.userKey;
delete g.window?.userSlot;
delete g.RegExp.userKey;
delete g.Boolean.userKey;