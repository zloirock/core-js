import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise";
// A literal wrapper remains native; the constructor it reads needs its static namespace.
const w = _globalThis.window;
const [{
  resolve
}] = [(w.Promise, _Promise)];
resolve(1);