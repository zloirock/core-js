export function opaque(P) {
  class Unnameable extends P {
    static go() { return super.fromAsync([1]); }
  }
  return Unnameable.go();
}
