import _Array$from from "@core-js/pure/actual/array/from";
// Pattern assignments carry their slot value, not the enclosing array.
let a, b, c;
[a] = [Array];
[b] = [a];
[c] = [b];
_Array$from([3]);