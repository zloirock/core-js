import "core-js/modules/es.object.get-own-property-descriptor";
import "core-js/modules/es.array.at";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.at";
// The superclass is captured when extends runs. Replacing the global later cannot change it.
class Base {
  box = [1, 2, 3];
  first() {
    return this.box.at(0);
  }
}
class Foreign {
  first() {
    return "foreign";
  }
}
const previous = Object.getOwnPropertyDescriptor(globalThis, "Base");
globalThis.Base = Base;
class LocalSub extends globalThis.Base {}
globalThis.Base = Foreign;
class ForeignSub extends globalThis.Base {}
if (previous) Object.defineProperty(globalThis, "Base", previous);else delete globalThis.Base;
const local = new LocalSub();
local.box = "stringified";
const foreign = new ForeignSub();
export const result = [local instanceof Base, local.first(), foreign instanceof Base, foreign.first()];