// destructure of a proxy global via a string key inside a class method calling super:
// both the proxy access and the super call are polyfilled.
const { 'Promise': MyP } = globalThis;
class C extends MyP {
  static run() {
    return super.try(() => 1);
  }
}
C.run();
