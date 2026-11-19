import _Array$from from "@core-js/pure/actual/array/from";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// A key on an opted-out line of a mirrored parameter default reads as the source does inside the literal,
// whichever spelling opts it out; its siblings still take their ponyfills.
export function f({
  [_Symbol$iterator]: it,
  // core-js-disable-next-line
  hasOwn // core-js-disable-line
} = (Object, {
  [_Symbol$iterator]: _getIteratorMethod(Object),
  // core-js-disable-next-line
  get hasOwn() {
    // core-js-disable-next-line
    return Object.hasOwn;
  }
})) {
  return [it, hasOwn];
}
export function g({
  from,
  // core-js-disable-next-line
  of
} = (Array, {
  from: _Array$from,
  // core-js-disable-next-line
  get of() {
    // core-js-disable-next-line
    return Array.of;
  }
})) {
  return [from, of];
}