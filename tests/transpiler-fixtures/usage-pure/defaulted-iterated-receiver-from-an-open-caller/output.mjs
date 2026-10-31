import _at from "@core-js/pure/actual/instance/at";
// An open iterated slot dispatches the supplied receiver; its default stays on the native binding.
export function read(input) {
  const [_ref = [1]] = input;
  const at = _at(_ref);
  return at.call('ok', 0);
}
export const result = read(['text']);