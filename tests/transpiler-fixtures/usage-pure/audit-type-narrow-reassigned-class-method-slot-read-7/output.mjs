import _at from "@core-js/pure/actual/instance/at";
// an ALIAS of the class binding writes the same static slot; the receiver has to be RESOLVED,
// since aliasing is exactly what makes the binding's name set unenumerable
class Aliased {
  static feed() {
    return [13, 14];
  }
  static read() {
    var _ref;
    return _at(_ref = Aliased.feed()).call(_ref, 0);
  }
}
const Alias = Aliased;
Alias.feed = () => "text";
export const values = [Aliased.read()];