import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _globalThis from "@core-js/pure/actual/global-this";
// `const { Promise: MyP, ...rest } = globalThis` - aliased destructure with a rest
// collector alongside. MyP still traces back to globalThis.Promise, so `super.try`
// polyfills through Promise. the rest binding doesn't interfere with the alias resolution
const MyP = _Promise;
const { Promise: _unused, ...rest } = _globalThis;
class C extends MyP {
  static run() { return _Promise$try.call(this, () => 1); }
}