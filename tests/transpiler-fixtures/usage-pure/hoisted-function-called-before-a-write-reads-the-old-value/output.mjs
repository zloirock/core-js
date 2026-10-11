import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
// a function declaration is created when its scope is entered, so a call ahead of a write reads what
// the binding held before it: a write, or an agreeing branch pair, between that call and the
// declaration settles nothing for the reads inside it. a function first used after the write reads the
// written value
let Ctor = _Iterator;
export const early = readCtor();
Ctor = Array;
export function readCtor() {
  return (Ctor === Array ? _Array$from : Ctor === _Iterator ? _Iterator$from : Ctor.from.bind(Ctor))([1]);
}
let key = 'flat';
export const earlyKey = readKey([[1]]);
if (flag) key = 'at';else key = 'at';
export function readKey(list) {
  return list[key](0);
}
let lateCtor = _Iterator;
lateCtor = Array;
export const late = readLate();
export function readLate() {
  return _Array$of(1);
}