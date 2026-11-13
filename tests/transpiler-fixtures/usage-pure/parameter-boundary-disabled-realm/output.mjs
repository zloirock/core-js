import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// The enabled static is supplied; the disabled constructor keeps its native identity.
export function read({
  Array: {
    from
  },
  // core-js-disable-next-line
  Set: S
} = {
  Array: {
    from: _Array$from
  },
  // core-js-disable-next-line
  get Set() {
    return _globalThis.Set;
  }
}) {
  return [from, S];
}