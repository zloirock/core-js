import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
export {};
class Thenable<T> extends String {}
export function read(value: Thenable<string>) {
  return _includesMaybeString(value).call(value, 'y');
}