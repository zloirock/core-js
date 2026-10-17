// Destructured this receivers in class static contexts follow the nearest built-in superclass.
// Defaults, assignments and rest retain their host semantics and caller-supplied values.
class Basic extends Array {
  static m() { const { from } = this; return from; }
}
export const viaBasic = Basic.m();
