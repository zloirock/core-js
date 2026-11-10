// The supplied argument and the parameter default keep their own evaluation slots.
export const effects = [];
export const r = (() => {
return (function ({ from } = (effects.push("default"), Array)) {
  return [from([5])[0], arguments[0] === undefined];
})();
})();
