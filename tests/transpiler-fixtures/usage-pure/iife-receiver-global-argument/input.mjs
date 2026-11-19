// The supplied argument and the parameter default keep their own evaluation slots.
export const effects = [];
export const r = (() => {
return (function ({ Promise: P } = Object) {
  return [typeof P, arguments[0] === globalThis];
})(globalThis);
})();
