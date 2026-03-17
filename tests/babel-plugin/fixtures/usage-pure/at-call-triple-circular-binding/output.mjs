import _atInstanceProperty from "@core-js/pure/actual/instance/at";
const a = b;
const b = c;
const c = a;
_atInstanceProperty(a).call(a, 0);