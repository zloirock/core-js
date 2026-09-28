import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Object$is from "@core-js/pure/actual/object/is";
// A selected static stays paired with its loop element: alone it mirrors the selected arm in place,
// and beside an instance claim the pattern moves into the body and still reads that arm.
export function read(flag, user) {
  for (const {
    w: [{
      is
    }]
  } of [{
    w: [flag ? {
      is: _Object$is
    } : user]
  }]) return is;
}
export function readBeside(flag, user) {
  for (const _ref of [{
    w: [flag ? {
      is: _Object$is
    } : user],
    v: [1, 2]
  }]) {
    const _ref2 = _ref;
    const {
      w: [{
        is
      }]
    } = _ref2;
    const at = _atMaybeArray(_ref2.v);
    return [is, at];
  }
}