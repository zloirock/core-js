// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
const { Promise: MyP, ...rest } = globalThis;
class C extends MyP {
  static run() { return super.try(() => 1); }
}
