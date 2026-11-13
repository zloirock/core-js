import _at from "@core-js/pure/actual/instance/at";
// A disabled sibling stays native without suppressing the enabled method.
export function read(_ref) {
  let at = _at(_ref);
  let {
    // core-js-disable-next-line
    flat
  } = _ref;
  return [at, flat];
}