import _Reflect from "@core-js/pure/actual/reflect";
import _Reflect$get from "@core-js/pure/actual/reflect/get";
_Reflect.ownKeys = shim;
function viaMutatedStatic(target) {
  const R = _Reflect;
  outerUse(_Reflect$get(target, propKey));
  return function inner() {
    var R;
    var R = _Reflect;
    return R.ownKeys(target);
  };
}
export const results = [viaMutatedStatic];