import "core-js/modules/es.array.push";
import "core-js/modules/es.function.name";
// The supplied argument and the parameter default keep their own evaluation slots.
export const effects = [];
export const r = (() => {
  function make() {
    effects.push("make");
    throw new RangeError();
  }
  try {
    return (({
      from
    }) => from)(new make());
  } catch (error) {
    return error.name;
  }
})();