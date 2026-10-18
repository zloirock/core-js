import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
import _Reflect$setPrototypeOf from "@core-js/pure/actual/reflect/set-prototype-of";
// a holder installed as a PROTOTYPE stays reachable through every object whose chain runs through it
// (`Object.getPrototypeOf(target).items = ...`), so even a holder without methods keeps no field narrow
// there - through either `setPrototypeOf`
export function viaObject(target) {
  var _ref;
  const proto = {
    items: [1, 2]
  };
  Object.setPrototypeOf(target, proto);
  return _at(_ref = proto.items).call(_ref, 0);
}
export function viaReflect(target) {
  var _ref2;
  const proto = {
    items: [1, 2]
  };
  _Reflect$setPrototypeOf(target, proto);
  return _includes(_ref2 = proto.items).call(_ref2, 1);
}