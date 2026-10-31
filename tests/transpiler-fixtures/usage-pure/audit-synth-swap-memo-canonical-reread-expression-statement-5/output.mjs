import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
import _self from "@core-js/pure/actual/self";
function eff() {
  return null;
}
// direct-root non-pure leaf control: seq prefix stays, root substitutes, leaf reads native
function directNonPure({
  hasOwn,
  extra
} = function (_ref) {
  return {
    hasOwn: _Object$hasOwn,
    extra: _ref.extra
  };
}((eff(), _self.Object))) {
  return [hasOwn, extra];
}
directNonPure();