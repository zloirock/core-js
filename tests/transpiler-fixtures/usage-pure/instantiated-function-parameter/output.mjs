import _atMaybeString from "@core-js/pure/actual/string/instance/at";
declare function pluck<T>(items: T[], key: T): T[];
type Key = Parameters<typeof pluck<string>>[1];
function read(key: Key) {
  return _atMaybeString(key).call(key, 0);
}
export const result = read('abc');