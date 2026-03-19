import _includes from "@core-js/pure/actual/string/includes";
function foo(x: string) {
  _includes(x).call(x, 'test');
}