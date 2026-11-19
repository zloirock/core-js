import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _Map from "@core-js/pure/actual/map";
// An instance claim beside a mirrored constructor remains covered.
// The user slot is captured once at parameter binding time.
export function read(user) {
  return (_ref => {
    let at = _at(_ref.userList);
    let {
      Map: M
    } = _ref;
    return [at, M];
  })(user || {
    get userList() {
      return _globalThis.userList;
    },
    Map: _Map
  });
}