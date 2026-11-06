// An unknown computed key may override the field. Test the stored constructor's identity
// before selecting either candidate's static method.
class NS {
  static M = Array;
  static M = Iterator;
}
const { M: { from } } = NS;
export function dynamicKeyBails(o) {
  class Guard {
    static P = Array;
    static [o.k] = Iterator;
  }
  const { P: { from } } = Guard;
  return from([1, 2]);
}
