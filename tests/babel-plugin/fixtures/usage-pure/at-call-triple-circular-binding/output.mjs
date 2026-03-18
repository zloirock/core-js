import _at from "@core-js/pure/actual/instance/at";
const a = b;
const b = c;
const c = a;
_at(a).call(a, 0);