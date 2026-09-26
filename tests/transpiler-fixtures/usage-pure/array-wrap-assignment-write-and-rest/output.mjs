import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$create from "@core-js/pure/actual/object/create";
import _Object$getOwnPropertyDescriptor from "@core-js/pure/actual/object/get-own-property-descriptor";
import _Object$getOwnPropertyNames from "@core-js/pure/actual/object/get-own-property-names";
var _ref, _ref2, _ref3, _ref4, _ref5, _unused2;
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
const seen = [];
const eff = t => (_pushMaybeArray(seen).call(seen, t), t);
const xs = [1];
let kw;
let ge, restD, gd, restZ, cr, gb, zn;
var _unused;
[{
  Object: _unused,
  ...restD
}] = [kw = (eff('l'), _globalThis)];
ge = _Object$getOwnPropertyNames;
[_ref] = _ref2 = [kw = (eff('m'), _globalThis), eff('n')], _ref3 = {
  Object: _ref4
} = _ref, _ref5 = _ref4, {} = _ref5, gd = _Object$getOwnPropertyDescriptor, {
  getOwnPropertyDescriptor: _unused2,
  ...restZ
} = _ref5, _ref5, _ref3, _ref2;
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