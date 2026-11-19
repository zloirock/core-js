// an instance field's value runs at construction, after a patch the module body below the class installs,
// so a read of the patched global there is the user's slot, while a static field runs at class
// evaluation, ahead of the patch, and takes the pure import. a patch under a presence test this build
// decides is no patch: `!window.Promise` reads the served `Promise`, the arm never runs, and even the
// instance field reads the pure import
class Client {
  ready = Promise.resolve();
  cache = new Map();
  static pending = new Map();
}
if (!window.Promise) window.Promise = Bluebird;
globalThis.Map = ShimMap;
export default new Client();
