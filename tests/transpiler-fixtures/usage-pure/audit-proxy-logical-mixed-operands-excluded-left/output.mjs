import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _self from "@core-js/pure/actual/self";
// A left whose constructor entry is excluded (`Map`, while `groupBy` keeps its own) still decides - the data
// subset carries `Map` - so the right, a constructor read through an alias of the realm (`g.self.Set`), never
// runs and leaves with its import, while the left lands on the backed proxy root (`_self.Map`). The left is read
// once for the polyfilled property and the copy of the remaining keys.
const g = _globalThis;
const _ref = _self.Map,
  groupBy = _Map$groupBy,
  {
    groupBy: _unused,
    ...others
  } = _ref;
groupBy(list, key);