import _at from "@core-js/pure/actual/instance/at";
let x: string | number[] = "hello";
if (typeof x === "string") {
  const fn = function () {
    return _at(x).call(x, -1);
  };
}
x = [1, 2, 3];