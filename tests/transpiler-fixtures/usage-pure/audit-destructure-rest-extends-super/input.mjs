// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
const { Promise: MyP, ...rest } = globalThis;
class C extends MyP {
  static run() { return super.try(() => 1); }
}
