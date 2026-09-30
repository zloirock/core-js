import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// A const-bound computed key reads the string-valued parameter default.
// Pure mirrors its typed helper into the default; supplied arguments retain their own properties.
const KEY = 'at';
export function read({
  [KEY]: at
} = {
  [KEY]: _atMaybeString('abc')
}) {
  return at;
}