import _Array$from from "@core-js/pure/actual/array/from";
import _Map from "@core-js/pure/actual/map";
import _Map2 from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// a write whose RECEIVER is a parameter patches whatever reaches that parameter, and the file's
// own calls say what does: an argument at its position, an argument list a REST slot collects, or
// the parameter's own DEFAULT, which needs no call at all. a METHOD is named by its key on both
// halves of the pairing. the control pins it - a call passing a plain object taints nothing.
// the two bindings per constructor are one object: the escape hands the ctor out and owes its
// statics, the routed read wants the constructor
function install(target) {
  target.groupBy = function patched() {
    return 'patched';
  };
}
install(_Map);
_Map2.groupBy(src, it => it);
const handler = {
  take(ns) {
    ns.fromEntries = patched;
  }
};
handler.take(Object);
Object.fromEntries(src);
function withDefault(ctor = String) {
  ctor.raw = patched;
}
withDefault();
String.raw(src);
function other(target) {
  target.from = patched;
}
other({});
_Array$from(src);