// Reflect.apply passes the array receiver to a detached repositioning method.
const repositionedByReflectApply = (function () {
  const reflected = [Object, Map];
  Reflect.apply(reflected.reverse, reflected, []);
  const { 0: { groupBy } } = reflected;
  return groupBy;
})();
export { repositionedByReflectApply };
