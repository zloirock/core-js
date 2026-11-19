import _Array$from from "@core-js/pure/actual/array/from";
// The supplied argument and the parameter default keep their own evaluation slots.
export const effects = [];
export const r = (() => {
  return function ({} = Object) {
    let from = _Array$from;
    const observe = () => arguments[0] === Array;
    return [from([12])[0], observe()];
  }(Array);
})();