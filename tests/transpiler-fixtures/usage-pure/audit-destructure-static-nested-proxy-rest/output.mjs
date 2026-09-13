import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
const {
  Array: {
    from
  },
  ...rest
} = _globalThis;
const xs = from('hi');
_atMaybeArray(xs).call(xs, 0);
_includesMaybeArray(xs).call(xs, 'h');
_flatMaybeArray(xs).call(xs);