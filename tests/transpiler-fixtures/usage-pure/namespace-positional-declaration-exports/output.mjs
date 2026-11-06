import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A namespace exposes only the user's bindings and cannot contain an export list.
const rows: [number[], number[]] = [[3], [7]];
declare const mixed: [number, {
  at: number;
}];
export namespace Outer {
  const [_ref, _ref2] = rows;
  export const first = _atMaybeArray(_ref);
  export const second = _atMaybeArray(_ref2);
  export namespace Inner {
    export const [index, {
      at: value
    }] = mixed;
  }
}