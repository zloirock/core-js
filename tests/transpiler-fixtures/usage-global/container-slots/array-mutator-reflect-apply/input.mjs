// Reflect.apply passes the array receiver to a detached repositioning method.
const repositionedByReflectApply = (function () {
  const reflected = [Object];
  Reflect.apply(reflected.reverse, reflected, []);
  const { 0: { getOwnPropertyNames } } = reflected;
  return getOwnPropertyNames;
})();
export { repositionedByReflectApply };
