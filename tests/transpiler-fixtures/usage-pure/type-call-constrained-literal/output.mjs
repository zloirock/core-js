import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// A constrained type parameter keeps a const alias's literal value.
declare function read<T extends 'lines' | 'text'>(mode: T): T extends 'lines' ? number[] : string;
const mode = 'lines';
_atMaybeArray(_ref = read(mode)).call(_ref, -1);