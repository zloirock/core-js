// The supplied argument and the parameter default keep their own evaluation slots.
export const effects = [];
export const r = (() => {
return (function (value) {
  return (({ from } = Object) => [from([13])[0], arguments[0] === value])(Array);
})(17);
})();
