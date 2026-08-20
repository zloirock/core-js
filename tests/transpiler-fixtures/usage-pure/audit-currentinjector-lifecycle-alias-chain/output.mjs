import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
// `const from = Array.from` followed by `from('hi')`: the call's return must narrow to
// Array. distinct chained methods exercise different return-type branches: `at` is
// generic-or-array, `flatMap` / `findLastIndex` are Array-only
const from = _Array$from;
const xs = from('hi');
const a = _atMaybeArray(xs).call(xs, 0);
const b = _flatMapMaybeArray(xs).call(xs, x => [x, x]);
const c = _findLastIndexMaybeArray(xs).call(xs, x => x === 'h');
export { a, b, c };