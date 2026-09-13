import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise";
// A guarded constructor result read through a member owes its full namespace for the file.
// Direct reads and guarded reads of that constructor must use the same imported identity.
function read(enabled) {
  if (enabled) {
    var realm = _globalThis;
  }
  const same = (realm === _globalThis ? _Promise : realm.Promise) === _Promise;
  return [same, typeof (realm === _globalThis ? _Promise : realm.Promise).allSettled];
}