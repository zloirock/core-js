import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
function foo(x: string) {
  _includesMaybeString(x).call(x, 'test');
}