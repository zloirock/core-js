// The supplied argument and the parameter default keep their own evaluation slots.
export const effects = [];
export const r = (function ({ from } = Object) {
  const observe = () => arguments.length === 1;
  return [from([12])[0], observe()];
})(Array);
