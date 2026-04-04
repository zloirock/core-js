import _at from "@core-js/pure/actual/instance/at";
const x = flag ? [1, 2] : 'hello';
_at(x).call(x, 0);