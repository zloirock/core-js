import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
export function read() {
  const rows = [3];
  let captured;
  for (const {
    at: rows,
    n = 8
  } of (captured = () => rows, [(_ref => {
    return {
      get at() {
        return _atMaybeArray(_ref);
      },
      get n() {
        return _ref.n;
      }
    };
  })([1])])) {
    const n = 99;
    try {
      captured();
    } catch (error) {
      return [rows.call([5], 0), n, _nameMaybeFunction(error)];
    }
  }
}