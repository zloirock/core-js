import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _Object$getOwnPropertyDescriptor from "@core-js/pure/actual/object/get-own-property-descriptor";
// The superclass is captured when extends runs. Replacing the global later cannot change it.
class Base {
  box = [1, 2, 3];
  first() {
    var _ref;
    return _at(_ref = this.box).call(_ref, 0);
  }
}
class Foreign {
  first() {
    return "foreign";
  }
}
const previous = _Object$getOwnPropertyDescriptor(_globalThis, "Base");
_globalThis.Base = Base;
class LocalSub extends _globalThis.Base {}
_globalThis.Base = Foreign;
class ForeignSub extends _globalThis.Base {}
if (previous) Object.defineProperty(_globalThis, "Base", previous);else delete _globalThis.Base;
const local = new LocalSub();
local.box = "stringified";
const foreign = new ForeignSub();
export const result = [local instanceof Base, local.first(), foreign instanceof Base, foreign.first()];