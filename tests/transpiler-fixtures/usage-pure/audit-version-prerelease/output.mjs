import _Array$from from "@core-js/pure/actual/array/from";
// pure-mode parity for version prerelease tag handling. parser must accept
// `4.0.0-alpha.1` style and route to correct compat data set
const arr = _Array$from([1, 2, 3]);
console.log(arr);