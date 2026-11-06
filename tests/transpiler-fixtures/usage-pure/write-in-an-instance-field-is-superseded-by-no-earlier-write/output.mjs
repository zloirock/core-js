import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
// an instance field's value runs at construction, after the writes the module body below the class makes,
// so no write there supersedes it - a key and a constructor written in such a field keep both values,
// while a write in a static field, run at class evaluation, is superseded by a later one
let key = 'from';
class KeyHolder {
  value = key = 'from';
}
key = 'of';
new KeyHolder();
export const built = Array[key](3);
let Ctor;
class CtorHolder {
  value = Ctor = _Map;
}
Ctor = Object;
new CtorHolder();
export const grouped = () => (Ctor === _Map ? _Map$groupBy : Ctor === Object ? _Object$groupBy : Ctor.groupBy.bind(Ctor))([1], x => x);
let Typed;
class StaticHolder {
  static value = Typed = _Iterator;
}
Typed = Int16Array;
export const typed = () => Typed.from([1]);