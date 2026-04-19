import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// rest after regular params: loop processes `head: U` first (binds U to 0's type),
// then rest branch binds T from 'x'/'y' and `break`s
function fn<T, U>(head: U, ...tail: T[]): T {
  return tail[0];
}
const s = fn(42, 'x', 'y');
_atMaybeString(s).call(s, 0);