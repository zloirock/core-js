import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
// The supplied argument and the parameter default keep their own evaluation slots.
export const effects = [];
export const r = (() => {
  const make = () => Array;
  try {
    return (({
      from
    }) => from)(new make());
  } catch (error) {
    return _nameMaybeFunction(error);
  }
})();