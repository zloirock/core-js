import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$create from "@core-js/pure/actual/object/create";
import _Object$getOwnPropertyDescriptor from "@core-js/pure/actual/object/get-own-property-descriptor";
import _Object$getOwnPropertyNames from "@core-js/pure/actual/object/get-own-property-names";
var _ref, _ref2, _ref3, _unused, _unused2;
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
const seen = [];
const eff = t => (_pushMaybeArray(seen).call(seen, t), t);
const xs = [1];
let kw;
let ge, restD, gd, restZ, cr, gb, zn;
[_ref] = [kw = (eff('l'), _globalThis)];
_ref.Object, ge = _Object$getOwnPropertyNames, {
  Object: _unused,
  ...restD
} = _ref;
[_ref2] = [kw = (eff('m'), _globalThis), eff('n')], {
  Object: _ref3
} = _ref2, {} = _ref3, gd = _Object$getOwnPropertyDescriptor, {
  getOwnPropertyDescriptor: _unused2,
  ...restZ
} = _ref3;
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