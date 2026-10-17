// Duplicate static fields resolve to the last matching declaration, including computed string keys.
// Unknown computed keys require dispatch through the actual stored constructor.
// A later static block keeps its written slot instead of assuming the original field value.
// Single-field and computed-key controls preserve the directly resolved cases.
class NS {
  static M = Array;
  static M = Iterator;
}
const { M: { from } } = NS;
export const viaDup = from([1, 2]);
