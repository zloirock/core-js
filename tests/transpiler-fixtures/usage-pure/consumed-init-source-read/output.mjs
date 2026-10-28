import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// A consumed receiver still performs its getter read after child claims rewrite the initializer.
// The read and its prefix stay before the extracted binding, including in a bodyless branch.
class Source {
  static get realm() {
    effect();
    return _globalThis;
  }
}
const before = begin();
Array.isArray(effect()), Source.realm.Array;
const read = _Array$from;
const after = finish(read);
if (before) {
  effect(), Source.realm.Array;
  var other = _Array$of;
}
export { read, other, after };