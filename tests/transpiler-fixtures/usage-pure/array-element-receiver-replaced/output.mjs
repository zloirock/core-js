import _at from "@core-js/pure/actual/instance/at";
// The later initializer may replace the variable holding the first element.
// Property reads still use the value captured before that replacement.
export function read(receiver, replace) {
  const [_ref, _ref2] = [receiver, receiver = replace()];
  const {
    other
  } = _ref;
  const at = _at(_ref);
  const tail = _ref2;
  return [other, at, tail];
}