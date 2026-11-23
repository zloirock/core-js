import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$getOwnPropertyDescriptor from "@core-js/pure/actual/object/get-own-property-descriptor";
import _Object$getOwnPropertyNames from "@core-js/pure/actual/object/get-own-property-names";
var _ref, _ref2, _ref3, _ref4, _unused;
// Realm stores and object-rest exclusions retain their source order inside array assignments.
// Only captured static leaves receive imports; spread and neighbouring-slot residuals keep native reads.
const seen = [];
const eff = t => (_pushMaybeArray(seen).call(seen, t), t);
const xs = [1];
let kw;
let ge, restD, gd, restZ, cr, gb, zn;
[_ref] = [kw = (eff('l'), _globalThis)], {
  Object: {},
  ...(_ref2 = [ge = _Object$getOwnPropertyNames])[0]
} = _ref, restD = _ref2[0];
[_ref3] = [kw = (eff('m'), _globalThis), eff('n')], {
  Object: _ref4
} = _ref3, {} = _ref4, gd = _Object$getOwnPropertyDescriptor, {
  getOwnPropertyDescriptor: _unused,
  ...restZ
} = _ref4;
[{
  Object: {
    create: cr
  }
}] = [(eff('o'), _globalThis), ...xs];
[{
  Map: {
    groupBy: gb
  }
}, zn] = [kw = (eff('r'), _globalThis), 7];
export { ge, restD, gd, restZ, cr, gb, zn, seen, kw };