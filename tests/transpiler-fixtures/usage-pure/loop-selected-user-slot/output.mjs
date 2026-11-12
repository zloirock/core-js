import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _Map from "@core-js/pure/actual/map";
// Mirroring a selected realm retains the user slot consumed by its
// nested instance claim, including when that claim precedes the constructor.
export function read(user) {
  for (const _ref of [user || {
    get userList() {
      return _globalThis.userList;
    },
    Map: _Map
  }]) {
    const at = _at(_ref.userList),
      {
        Map: M
      } = _ref;
    return [at, M];
  }
}