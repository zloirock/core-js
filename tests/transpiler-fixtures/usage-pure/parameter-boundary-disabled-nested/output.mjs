import _at from "@core-js/pure/actual/instance/at";
// An opt-out belongs to its own leaf, including in a moved nested pattern.
export function read(_ref) {
  let {
      row: _ref2
    } = _ref,
    at = _at(_ref2),
    {
      // core-js-disable-next-line
      flat
    } = _ref2,
    {
      marker
    } = _ref;
  return [at, flat, marker];
}