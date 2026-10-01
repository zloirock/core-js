import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$create from "@core-js/pure/actual/object/create";
import _Object$getOwnPropertyDescriptor from "@core-js/pure/actual/object/get-own-property-descriptor";
import _Object$getOwnPropertyNames from "@core-js/pure/actual/object/get-own-property-names";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _unused, _unused2;
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
const seen = [];
const eff = t => (_pushMaybeArray(seen).call(seen, t), t);
const xs = [1];
let kw;
let ge, restD, gd, restZ, cr, gb, zn;
[_ref] = _ref2 = [kw = (eff('l'), _globalThis)], _ref3 = _ref.Object, ge = _Object$getOwnPropertyNames, _ref3, {
  Object: _unused,
  ...restD
} = _ref, _ref, _ref2;
[_ref4] = _ref5 = [kw = (eff('m'), _globalThis), eff('n')], _ref6 = {
  Object: _ref7
} = _ref4, {} = _ref7, gd = _Object$getOwnPropertyDescriptor, {
  getOwnPropertyDescriptor: _unused2,
  ...restZ
} = _ref7, _ref7, _ref6, _ref5;
[{
  Object: {
    create: cr
  }
}] = [(eff('o'), {
  Object: {
    create: _Object$create
  }
}), ...xs];
[{
  Map: {
    groupBy: gb
  }
}, zn] = [(kw = (eff('r'), _globalThis), {
  Map: {
    groupBy: _Map$groupBy
  }
}), 7];
export { ge, restD, gd, restZ, cr, gb, zn, seen, kw };