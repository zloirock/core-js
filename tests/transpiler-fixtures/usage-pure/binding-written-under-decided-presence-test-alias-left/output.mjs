import _padStartMaybeString from "@core-js/pure/actual/string/instance/pad-start";
const config = APP_CONFIG;
export function aliasLeft() {
  let value = [1];
  config || (value = 'abc');
  return _padStartMaybeString(value).call(value, 4);
}