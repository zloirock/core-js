import _Array$from from "@core-js/pure/actual/array/from";
// The supplied argument and the parameter default keep their own evaluation slots.
export const effects = [];
export const r = (() => {
  const user = {
    from: value => value[0] + 1
  };
  return function ({
    from
  } = {
    from: _Array$from
  }) {
    return [from([8]), arguments[0] === user];
  }(user);
})();