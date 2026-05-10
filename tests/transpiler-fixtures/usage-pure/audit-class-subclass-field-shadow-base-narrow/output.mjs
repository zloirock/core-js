import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2;
// subclass declares same-named field as base, shadowing base's annotation. polyfill
// dispatch on subclass instance must read SUBCLASS's annotation, not base's. base has
// `bag: number[]` (Array), subclass has `bag: { length: number }` (no array shape).
// `s.bag.at(0)` and `s.bag.includes(1)` should bail to GENERIC `_at` / `_includes`,
// not narrow `_atMaybeArray` / `_includesMaybeArray` - subclass's plain-Object annotation
// has no array hint
class Base {
  bag: number[] = [];
}
class Sub extends Base {
  bag: {
    length: number;
  } = {
    length: 0
  };
}
declare const s: Sub;
_at(_ref = s.bag).call(_ref, 0);
_includes(_ref2 = s.bag).call(_ref2, 1);