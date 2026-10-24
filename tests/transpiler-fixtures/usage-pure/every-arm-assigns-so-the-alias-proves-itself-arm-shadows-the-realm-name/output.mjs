import _Object$getOwnPropertyNames from "@core-js/pure/actual/object/get-own-property-names";
import _self from "@core-js/pure/actual/self";
export function armShadowsTheRealmName(flag) {
  var _ref;
  if (flag) {
    const globalThis = {};
    var S = globalThis;
  } else {
    var S = _self;
  }
  return _ref = S.Object, _ref === Object ? _Object$getOwnPropertyNames({
    c: 3
  }) : _ref.getOwnPropertyNames({
    c: 3
  });
}