import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$create from "@core-js/pure/actual/object/create";
import _Object$getOwnPropertyDescriptor from "@core-js/pure/actual/object/get-own-property-descriptor";
import _Object$getOwnPropertyNames from "@core-js/pure/actual/object/get-own-property-names";
// the ASSIGNMENT host with a kept write and a rest: the write stays in the residual, the
// overwrite follows; a sole full consume keeps the RHS as a statement, spread and all; a
// MULTI-element wrapper whose paired element is a kept write keeps the raw destructure and the
// binding takes the ponyfill right after it - the mirror may not replace what the write stores
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
var _unused2;
[{
  Object: {
    getOwnPropertyDescriptor: _unused2,
    ...restZ
  }
}] = [kw = (eff('m'), _globalThis), eff('n')];
gd = _Object$getOwnPropertyDescriptor;
[(eff('o'), _globalThis), ...xs];
cr = _Object$create;
[{
  Map: {
    groupBy: gb
  }
}, zn] = [kw = (eff('r'), _globalThis), 7];
gb = _Map$groupBy;
export { ge, restD, gd, restZ, cr, gb, zn, seen, kw };