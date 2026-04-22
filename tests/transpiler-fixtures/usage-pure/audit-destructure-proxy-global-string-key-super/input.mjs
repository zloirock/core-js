const { 'Promise': MyP } = globalThis;
class C extends MyP {
  static run() {
    return super.try(() => 1);
  }
}
C.run();
