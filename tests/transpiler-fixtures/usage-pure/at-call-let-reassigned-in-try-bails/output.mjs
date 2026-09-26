import _at from "@core-js/pure/actual/instance/at";
let x = [];
try {
  x = 'hello';
} catch {}
_at(x).call(x, -1);