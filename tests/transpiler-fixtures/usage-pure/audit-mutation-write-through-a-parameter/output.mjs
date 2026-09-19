import _Array$from from "@core-js/pure/actual/array/from";
import _Map from "@core-js/pure/actual/map";
// Parameter and default writes patch the constructor supplied by the caller.
// Map routes through its pure constructor; Object and String stay callable natives
// because their pure namespace exports are objects. Passing an unrelated object
// must not taint Array.from.
function install(target) {
  target.groupBy = function patched() {
    return 'patched';
  };
}
install(_Map);
_Map.groupBy(src, it => it);
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