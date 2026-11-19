import _Array$of from "@core-js/pure/actual/array/of";
// the boundaries of that union: a hop naming ONE constructor stays with that constructor's statics,
// arms owning no such static add nothing, a base no walk can name stays silent, and a user class
// among the arms is no global. an instance-only key is dead in a STATIC method on every reachable
// arm - both when an arm resolves as the primary and when none does and the union rides a carrier

const fixedNs = {
  Base: Array
};
class Fixed extends fixedNs.Base {
  static go() {
    return _Array$of.call(this, 1, 2);
  }
}
export { Fixed };