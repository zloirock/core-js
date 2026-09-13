import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
import _Reflect from "@core-js/pure/actual/reflect";
var _ref, _ref2;
// New invokes the class constructor; super invokes the base constructor. Both writes
// must invalidate the later return-type inference without releasing their namespaces.
// Different receivers and instance methods keep the two mutation routes observable.
const xs = [];
const o = {};
class Installer {
  constructor(ctor) {
    ctor.from = patch;
  }
}
new Installer(Array);
_at(_ref = Array.from(xs)).call(_ref, 0);
class Base {
  constructor(ns) {
    ns.ownKeys = patch;
  }
}
class Derived extends Base {
  constructor() {
    super(_Reflect);
  }
}
new Derived();
_includes(_ref2 = _Reflect.ownKeys(o)).call(_ref2, 1);