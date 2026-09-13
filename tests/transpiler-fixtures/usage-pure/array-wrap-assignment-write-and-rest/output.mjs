import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$create from "@core-js/pure/actual/object/create";
// Object-rest keeps the affected assignment pattern native and preserves its RHS value.
// Independent reads and key/default expressions still receive their own polyfills.
const seen = [];
const eff = t => (_pushMaybeArray(seen).call(seen, t), t);
const xs = [1];
let kw;
let ge, restD, gd, restZ, cr, gb, zn;
[{
  Object: {
    getOwnPropertyNames: ge
  },
  ...restD
}] = [kw = (eff('l'), _globalThis)];
[{
  Object: {
    getOwnPropertyDescriptor: gd,
    ...restZ
  }
}] = [kw = (eff('m'), _globalThis), eff('n')];
[(eff('o'), _globalThis), ...xs];
cr = _Object$create;
[{
  Map: {
    groupBy: gb
  }
}, zn] = [kw = (eff('r'), _globalThis), 7];
gb = _Map$groupBy;
export { ge, restD, gd, restZ, cr, gb, zn, seen, kw };