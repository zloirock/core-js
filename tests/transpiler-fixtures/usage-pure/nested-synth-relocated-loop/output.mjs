import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
// A selected realm remains the source of a loop-head pattern after native relocation.
// Its static and nested instance reads use the same mirror; a supplied object keeps its own values.
export function read(flag, own) {
  for (const _ref2 of [flag ? {
    Array: {
      prototype: {
        at: _atMaybeArray(_globalThis.Array.prototype)
      },
      of: _Array$of
    }
  } : own]) {
    const {
      Array: _ref
    } = _ref2;
    const at = _at(_ref.prototype),
      {
        of
      } = _ref;
    return [at.call([3, 7], -1), of(5)];
  }
}