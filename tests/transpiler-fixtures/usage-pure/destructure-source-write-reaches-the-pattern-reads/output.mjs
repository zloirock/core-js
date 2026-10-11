import _Array$from from "@core-js/pure/actual/array/from";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// a destructure evaluates its source before the pattern reads anything, so a write in the source reaches
// the pattern's defaults and computed keys: they read what the source stored, and pure keeps both
// candidates. defaults run in order, so a write in a later default stays out of an earlier one
let C;
C = _Map;
const {
  a = (C === _Map ? _Map$groupBy : C === Object ? _Object$groupBy : C.groupBy.bind(C))(xs, f)
} = (C = Object, obj);
let D;
D = Array;
const {
  [(D === Array ? _Array$from : D === _Iterator ? _Iterator$from : D.from.bind(D))(ys).length]: v
} = (D = _Iterator, obj);
let E;
E = _Promise;
const {
  p = _Promise$try(f),
  q = E = Object
} = obj;