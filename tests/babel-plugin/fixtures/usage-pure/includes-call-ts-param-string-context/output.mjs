import _includesInstanceProperty from "@core-js/pure/actual/instance/includes";
function foo(x: string) {
  _includesInstanceProperty(x).call(x, 'test');
}