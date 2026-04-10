import _at from "@core-js/pure/actual/instance/at";
let x;
({
  x
} = getObj());
_at(x).call(x, -1);