import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _self from "@core-js/pure/actual/self";
// an alias WRITTEN in the sequence that reads it holds what the write stored, so the probe read off
// it is the same environment probe its bare twin performs, and the store keeps the guard. asked by
// the binding's init alone the alias answered "unproven" and the probe was called always-defined,
// which folded the store to the ponyfill on one emitter only
let alias;
let stored;
let key;
export const written = (alias = _globalThis, stored = null == alias.window ? void 0 : _self, _Promise)[key];
export const bare = (stored = null == _globalThis.window ? void 0 : _self, _Promise)[key];