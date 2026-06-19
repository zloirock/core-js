// a class instance FIELD is an own data property that shadows a same-named prototype setter on read,
// so `new C().list` reads the field's array value (not undefined) - the member resolver must keep the
// array narrow and emit the array-specific `.at`. this legitimately diverges from an object literal,
// where a trailing setter makes the key a setter-only accessor (read -> undefined, no narrow).
class C {
  list = [1, 2];
  set list(v) {}
}
export const r = new C().list.at(0);
