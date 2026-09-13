import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
const {
  from: customFrom,
  ...rest
} = Array;
const xs = customFrom('hi');
_atMaybeArray(xs).call(xs, 0);
_findLastIndexMaybeArray(xs).call(xs, p => p);
_flatMaybeArray(xs).call(xs);