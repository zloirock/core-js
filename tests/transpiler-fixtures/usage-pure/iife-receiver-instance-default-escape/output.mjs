import _at from "@core-js/pure/actual/instance/at";
// The supplied argument and the parameter default keep their own evaluation slots.
export const effects = [];
export const r = (() => {
  const box = {
    row: [4, 15]
  };
  function change(args) {
    args[1].row = "ab";
  }
  return function (first = change(arguments), _ref) {
    let at = _at(_ref.row);
    return [at.call(box.row, -1), arguments[1] === box];
  }(undefined, box);
})();