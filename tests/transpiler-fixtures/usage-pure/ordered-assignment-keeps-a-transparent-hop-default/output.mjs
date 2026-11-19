import _at from "@core-js/pure/actual/instance/at";
// Even an empty default belongs to its hop. The neighbouring initializer runs first.
export function read(value, effect) {
  var _ref;
  let at;
  ({
    slot: _ref = []
  } = {
    slot: value,
    other: effect()
  });
  at = _at(_ref);
  return at;
}