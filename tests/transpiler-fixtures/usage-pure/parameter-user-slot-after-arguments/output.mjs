import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _Map from "@core-js/pure/actual/map";
// A user getter runs after all arguments, at the original pattern read.
// A constructor sibling must not pull that read into argument evaluation.
export function read(user, later) {
  return ((_ref, other) => {
    let at = _at(_ref.userList);
    let {
      Map: M
    } = _ref;
    return [at, M, other];
  })(user || {
    get userList() {
      return _globalThis.userList;
    },
    Map: _Map
  }, later());
}