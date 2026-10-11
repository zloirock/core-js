// an instance field's value runs at construction, after the writes the module body below the class makes,
// so no write there supersedes it - a key and a constructor written in such a field keep both values,
// while a write in a static field, run at class evaluation, is superseded by a later one
let key = 'from';
class KeyHolder {
  value = (key = 'from');
}
key = 'of';
new KeyHolder();
export const built = Array[key](3);
let Ctor;
class CtorHolder {
  value = (Ctor = Map);
}
Ctor = Object;
new CtorHolder();
export const grouped = () => Ctor.groupBy([1], x => x);
let Typed;
class StaticHolder {
  static value = (Typed = Iterator);
}
Typed = Int16Array;
export const typed = () => Typed.from([1]);
