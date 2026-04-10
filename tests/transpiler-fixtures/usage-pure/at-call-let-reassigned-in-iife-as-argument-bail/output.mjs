import _at from "@core-js/pure/actual/instance/at";
let x = [];
(fn => fn())(() => {
  x = "hello";
});
_at(x).call(x, -1);