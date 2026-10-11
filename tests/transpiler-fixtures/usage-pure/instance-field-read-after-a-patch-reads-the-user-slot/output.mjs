import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// an instance field's value runs at construction, after a patch the module body below the class installs,
// so a read of the patched global there is the user's slot, while a static field runs at class
// evaluation, ahead of the patch, and takes the pure import. a patch under a presence test this build
// decides is no patch: `!window.Promise` reads the served `Promise`, the arm never runs, and even the
// instance field reads the pure import
class Client {
  ready = _Promise$resolve();
  cache = new Map();
  static pending = new _Map();
}
if (!_Promise) window.Promise = Bluebird;
_globalThis.Map = ShimMap;
export default new Client();