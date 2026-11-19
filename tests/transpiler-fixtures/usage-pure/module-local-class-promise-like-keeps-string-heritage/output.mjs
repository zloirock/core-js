import _atMaybeString from "@core-js/pure/actual/string/instance/at";
export {};
class PromiseLike<T> extends String {}
export function read(value: PromiseLike<string>) {
  return _atMaybeString(value).call(value, 0);
}