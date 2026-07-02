// `const { Promise: MyP, ...rest } = globalThis` - aliased destructure with a rest
// collector alongside. MyP still traces back to globalThis.Promise, so `super.try`
// polyfills through Promise. the rest binding doesn't interfere with the alias resolution
const { Promise: MyP, ...rest } = globalThis;
class C extends MyP {
  static run() { return super.try(() => 1); }
}
