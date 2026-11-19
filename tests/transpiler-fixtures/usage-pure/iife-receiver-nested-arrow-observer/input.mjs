// The supplied argument and the parameter default keep their own evaluation slots.
export const effects = [];
export const r = (() => {
return (function ({ from } = Object) {
  const observe = () => arguments[0] === Array; return [from([12])[0], observe()];
})(Array);
})();
