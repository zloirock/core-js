import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _self from "@core-js/pure/actual/self";
// An alias written inside the receiver sequence retains the environment probe and its store.
// The unwritten computed key holds undefined, so the constructor needs no static namespace.
let alias;
let stored;
let key;
export const written = (alias = _globalThis, stored = null == alias.window ? void 0 : _self, _Promise)[key];
export const bare = (stored = null == _globalThis.window ? void 0 : _self, _Promise)[key];