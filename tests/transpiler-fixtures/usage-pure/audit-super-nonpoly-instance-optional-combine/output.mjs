import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _at from "@core-js/pure/actual/instance/at";
// A NON-poly instance super method (`super.custom`, the parent's own method - no core-js polyfill)
// in an instance method still combines like a poly instance super (`super.flat`): the method-GET
// `super.custom` is memoized and called with `this`, the trailing `.map` / `.at` polys thread on the
// result. the combine must take over ANY instance-context super (poly or not) - the static-context
// check, not the method-name resolution, decides; >=2 trailing polys otherwise crash the standalone
class Wrapped extends Base {
  tail() {
    var _ref, _ref2, _ref3;
    return null == (_ref = super.custom) ? void 0 : _at(_ref2 = _mapMaybeArray(_ref3 = _ref.call(this)).call(_ref3, x => x)).call(_ref2, -1);
  }
}