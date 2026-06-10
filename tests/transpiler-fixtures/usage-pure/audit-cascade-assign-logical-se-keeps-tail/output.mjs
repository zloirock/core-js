import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// an ASSIGNMENT-form host with an effectful logical RHS: the cascade keeps the whole RHS as
// a statement (the effect and the reads run exactly as native) and binds the polyfill after -
// the cascade KEEPS the tail, so the effectful logical does not bail it
let from;
let c = 0;
let m = 1;
(c++, m) && _globalThis;
from = _Array$from;
from([1]);