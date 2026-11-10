import "core-js/modules/es.string.at";
// The supplied argument and the parameter default keep their own evaluation slots.
export const effects = [];
export const r = (() => {
  const text = "ab";
  return function ({
    at
  } = []) {
    return [at.call(text, -1), arguments[0] === text];
  }(text);
})();