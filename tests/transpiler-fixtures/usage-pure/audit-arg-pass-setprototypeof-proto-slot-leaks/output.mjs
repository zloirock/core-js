import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
import _Reflect$setPrototypeOf from "@core-js/pure/actual/reflect/set-prototype-of";
// the PROTOTYPE slot of `setPrototypeOf` is the opposite of the target slot: the target keeps its
// own properties (so its narrow survives, locked separately), while the object passed as the
// prototype is RETAINED - it becomes reachable through every instance whose chain now runs through
// it, and any of them can be used to mutate it. so its field narrow must stand down. distinct
// method per row, both carrying an array and a string variant so the widened entry is visible
export function viaObject() {
  const proto = {
    items: [1, 2],
    read() {
      var _ref;
      return _at(_ref = this.items).call(_ref, 0);
    }
  };
  Object.setPrototypeOf(target, proto);
  return proto.read();
}
export function viaReflect() {
  const proto = {
    items: [1, 2],
    read() {
      var _ref2;
      return _includes(_ref2 = this.items).call(_ref2, 1);
    }
  };
  _Reflect$setPrototypeOf(target, proto);
  return proto.read();
}