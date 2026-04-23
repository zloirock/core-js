import _Set from "@core-js/pure/actual/set/constructor";
import _entries from "@core-js/pure/actual/instance/entries";
// ClassAccessorProperty (TC39 decorators) hits the same `isPropertyMember` branch - auto
// accessor's backing storage follows the same assignment flow as plain fields, so `accessor
// box = null` + `this.box = Set.from(xs)` unions to Set
class C {
  accessor box = null;
  load(xs) { this.box = new _Set(xs); }
  snapshot() {
var _ref; return null == (_ref = this.box) ? void 0 : _entries(_ref).call(_ref); }
}
