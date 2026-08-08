import _at from "@core-js/pure/actual/instance/at";
let x: string | number[] = "hello";
let fn;
if (typeof x === "string") {
  fn = () => _at(x).call(x, -1);
}
x = [1, 2, 3];