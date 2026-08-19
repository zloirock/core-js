import _Array$from from "@core-js/pure/actual/array/from";
import _Promise from "@core-js/pure/actual/promise/constructor";
let A = Array;
A = _Promise;
(A === Array ? _Array$from : A.from.bind(A))();