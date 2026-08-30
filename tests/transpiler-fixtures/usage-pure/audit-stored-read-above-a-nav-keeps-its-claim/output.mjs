import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise";
import _self from "@core-js/pure/actual/self";
// a store standing ABOVE the navigation is not a store OF it: the member between hands on its own
// value, so the read through the nav keeps its probe guard (`out = nav.Promise[key]` writes the
// read, not the nav). the unreadable key leaves the ctor injected and its members unsubstituted, so
// every row lands on that one binding. a KEPT nav pins the boundary: there the write really does
// hold the navigation, and the stored canon spells what the source stores
const alias = _globalThis;
let out, key, kept;
out = delete _Promise[key];
out = null == _globalThis.window ? void 0 : _Promise[key];
out = null == alias.window ? void 0 : _Promise[key];
kept = null == _globalThis.window ? void 0 : _self;
export { out, kept };