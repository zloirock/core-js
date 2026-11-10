import "core-js/modules/es.array.at";
// The supplied argument and the parameter default keep their own evaluation slots.
export const effects = [];
export const r = (() => {
  const rows = [4, 15];
  return function ({
    at
  } = []) {
    return [at.call(rows, -1), arguments[0] === rows];
  }(rows);
})();