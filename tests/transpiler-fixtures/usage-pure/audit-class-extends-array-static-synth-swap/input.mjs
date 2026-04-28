// class extends global Array (pure mode leaves the extends clause raw - pure can't
// reshape inheritance without runtime hooks) but the static method's destructure
// default still receives synth-swap. shows the two transforms are independent
class C extends Array {
  static method({ from } = Array) {
    return from([1]);
  }
}
C.method();
