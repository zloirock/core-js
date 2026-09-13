import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _includes from "@core-js/pure/actual/instance/includes";
// Different loop iterations can take opposite arms and share the outer binding.
// Keep both receiver families: the read can observe the previous iteration's array.
export function read(flags) {
  let value = 'ab';
  const result = [];
  for (const flag of flags) {
    if (flag) value = ['a', 'b'];else _pushMaybeArray(result).call(result, _includes(value).call(value, 'a,b'));
  }
  return result;
}