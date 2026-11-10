// The supplied argument and the parameter default keep their own evaluation slots.
export const effects = [];
export const r = (() => {
  Array.from = () => 16;
  return function ({
    from
  } = Object) {
    return [from(), arguments[0] === Array];
  }(Array);
})();