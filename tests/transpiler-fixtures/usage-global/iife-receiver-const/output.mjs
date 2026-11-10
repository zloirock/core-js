import "core-js/modules/es.array.of";
// The supplied argument and the parameter default keep their own evaluation slots.
export const effects = [];
export const r = (() => {
  const list = Array;
  return (({
    of
  } = Object) => of(3))(list);
})();