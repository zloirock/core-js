// The supplied argument and the parameter default keep their own evaluation slots.
export const effects = [];
export const r = (() => {
return (function ({ at } = []) {
  return [at.call([4, 15], -1), arguments[0] === undefined];
})();
})();
