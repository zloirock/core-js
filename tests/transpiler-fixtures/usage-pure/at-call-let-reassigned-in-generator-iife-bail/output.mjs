import _at from "@core-js/pure/actual/instance/at";
let x = [];
(function* () {
  x = 'hello';
})().next();
_at(x).call(x, -1);